import asyncio
import logging
import os
import time
import json
import shutil
from typing import Dict, Optional, List, Any, Tuple

from agrt.kernel.execution_graph.schemas import ExecutionGraph, ExecutionNode, NodeStatus, TaskSpec
from agrt.api.websocket.handler import TelemetryManager
from agrt.api.schemas.tasks import ExecutionReport

# Integration Imports
from agrt.generation.scaffolder import ProjectScaffolder
from agrt.environment.sandbox.venv_provider import VenvProvider
from agrt.environment.validation.engine import ValidationEngine, ValidationResult
from agrt.kernel.lifecycle.repair_registry import RepairRegistry
from agrt.kernel.lifecycle.confidence import ConfidenceEngine
from agrt.environment.failure_taxonomy.definitions import FailureType
from agrt.kernel.cleanup.manager import CleanupManager
from agrt.kernel.recovery.engine import RecoveryEngine
from agrt.environment.collaboration.git_provider import GitProvider

logger = logging.getLogger("agrt.kernel.lifecycle")

class LifecycleEngine:
    """
    The LifecycleEngine is the orchestration truth layer.
    It implements the 6-step Autonomous Loop: Scaffold -> Bootstrap -> Provision -> Judge -> Self-Heal -> Finalize.
    (v5.5): Adds optional DELIVERY phase.
    """
    def __init__(self, telemetry: TelemetryManager, workspace_root: str = "."):
        self.telemetry = telemetry
        self.workspace_root = os.path.abspath(workspace_root)
        self.active_graphs: Dict[str, ExecutionGraph] = {}
        
        # Initialize sub-components
        templates_dir = os.path.join(self.workspace_root, "agrt", "generation", "templates")
        self.scaffolder = ProjectScaffolder(templates_dir)
        self.validator = ValidationEngine()
        self.repair_registry = RepairRegistry()
        self.confidence_engine = ConfidenceEngine()
        self.cleanup_manager = CleanupManager(self.workspace_root)
        self.recovery_engine = RecoveryEngine(self.workspace_root)
        self.git_provider = GitProvider(self.workspace_root)

    async def run_task(self, task_spec: TaskSpec, resume_id: Optional[str] = None) -> ExecutionReport:
        start_time = time.time()
        
        if resume_id:
            graph_id = resume_id
            logger.info(f"Resuming Autonomous Loop for {graph_id}")
            checkpoint = self.recovery_engine.load_checkpoint(graph_id)
            if not checkpoint:
                raise RuntimeError(f"Failed to load checkpoint for {graph_id}")
            graph = ExecutionGraph.model_validate(checkpoint)
            self.active_graphs[graph_id] = graph
        else:
            graph_id = f"graph_{int(start_time)}"
            graph = ExecutionGraph(id=graph_id, nodes={}, state="IDLE")
            self.active_graphs[graph_id] = graph
            logger.info(f"Starting Autonomous Loop for {graph_id} (Project: {task_spec.project_type})")
        
        session_dir = os.path.join(self.workspace_root, ".agrt", "sessions", graph_id)
        os.makedirs(session_dir, exist_ok=True)

        last_execution_result = None
        success = False
        repair_count = 0
        validation_history = []
        sandbox = None

        try:
            # STEP 1: SCAFFOLD
            if not resume_id or graph.state == "SCAFFOLDING":
                await self._transition(graph_id, "SCAFFOLDING")
                node_scaffold = await self._add_node(graph_id, "SCAFFOLD", {"template_id": task_spec.template_id})
                if not self.scaffolder.scaffold(task_spec.template_id, session_dir):
                    await self._update_node(graph_id, node_scaffold.id, NodeStatus.FAILED, error="Scaffolding failed")
                    raise RuntimeError(f"Scaffolding failed for template {task_spec.template_id}")
                await self._update_node(graph_id, node_scaffold.id, NodeStatus.COMPLETED, output={"message": "Project structure created successfully"})

            # STEP 2: BOOTSTRAP
            attestation_passed = False
            if not resume_id or graph.state in ["SCAFFOLDING", "BOOTSTRAPPING"]:
                await self._transition(graph_id, "BOOTSTRAPPING")
                node_bootstrap = await self._add_node(graph_id, "BOOTSTRAP")
                
                async def perform_bootstrap():
                    sb = VenvProvider(graph_id, self.workspace_root)
                    if not await sb.bootstrap():
                        raise RuntimeError("Failed to bootstrap virtual environment")
                    
                    # INTEGRITY CHECK (v5.3)
                    is_valid = await sb.validate_integrity()
                    return is_valid, sb

                boot_success, sandbox = await perform_bootstrap()
                
                if not boot_success:
                    logger.warning(f"Bootstrap integrity failure on {graph_id}. Retrying once...")
                    self.cleanup_manager.quarantine_session(graph_id, reason="integrity_failure_retry")
                    os.makedirs(session_dir, exist_ok=True)
                    self.scaffolder.scaffold(task_spec.template_id, session_dir)
                    boot_success, sandbox = await perform_bootstrap()
                    if not boot_success:
                        await self._update_node(graph_id, node_bootstrap.id, NodeStatus.FAILED, error="Bootstrap integrity failed after retry")
                        raise RuntimeError("Bootstrap integrity failed after retry")

                attestation_passed = boot_success
                with open(sandbox.integrity_file, "r") as f:
                    hash_val = f.read().strip()
                await self._update_node(graph_id, node_bootstrap.id, NodeStatus.COMPLETED, output={"attestation_hash": hash_val})
            else:
                # Re-initialize sandbox for resume
                sandbox = VenvProvider(graph_id, self.workspace_root)
                attestation_passed = await sandbox.validate_integrity()
                if not attestation_passed:
                    logger.error(f"Resume integrity check failed for {graph_id}")
                    raise RuntimeError("Resume integrity failure")

            # STEP 3: PROVISION
            if not resume_id or graph.state in ["BOOTSTRAPPING", "PROVISIONING"]:
                await self._transition(graph_id, "PROVISIONING")
                node_provision = await self._add_node(graph_id, "PROVISION", {"features": task_spec.features})
                if task_spec.features:
                    logger.info(f"Installing requested features: {task_spec.features}")
                    for feature in task_spec.features:
                        await sandbox.execute_command(f"python -m pip install {feature}")
                await self._update_node(graph_id, node_provision.id, NodeStatus.COMPLETED, output={"installed_features": task_spec.features})

            # STEP 4-5: JUDGE & SELF-HEAL LOOP
            max_loop_retries = 5
            loop_count = 0
            
            while loop_count < max_loop_retries:
                # JUDGE
                node_judge = await self._add_node(graph_id, "JUDGE", {"attempt": loop_count})
                validation_res, last_execution_result = await self._run_and_judge(graph_id, sandbox, session_dir, task_spec)
                validation_history.append(validation_res)
                
                # Update confidence evolution
                current_conf = self.confidence_engine.calculate(
                    [d.model_dump() for h in validation_history for d in h.details],
                    repair_count,
                    attestation_passed
                )
                await self.telemetry.broadcast_event(
                    source="kernel",
                    phase=graph.state,
                    event_type="confidence_update",
                    message=f"Confidence updated: {current_conf.score}%",
                    data=current_conf.model_dump()
                )

                if validation_res.success:
                    success = True
                    await self._update_node(graph_id, node_judge.id, NodeStatus.COMPLETED, output=last_execution_result)
                    break
                
                await self._update_node(graph_id, node_judge.id, NodeStatus.FAILED, output=last_execution_result, error="Validation failed")
                
                # SELF-HEAL
                await self._transition(graph_id, "REPAIRING")
                node_repair = await self._add_node(graph_id, "REPAIR", {"attempt": loop_count})
                
                repaired = False
                repair_info = {}
                # Use Failure Taxonomy for deterministic repair routing
                for detail in validation_res.details:
                    if not detail.success:
                        logger.info(f"Routing repair for failure type: {detail.type}")
                        repairers = self.repair_registry.get_repairers(detail.type)
                        
                        failure_context = {
                            "stderr": last_execution_result.get("stderr", ""),
                            "message": detail.message,
                            "session_id": graph_id,
                            "session_dir": session_dir
                        }
                        
                        for repairer in repairers:
                            if await repairer.repair(failure_context, sandbox):
                                repaired = True
                                repair_count += 1
                                repair_info = {"type": detail.type, "repairer": repairer.__class__.__name__}
                                break
                        if repaired:
                            break
                
                if not repaired:
                    await self._update_node(graph_id, node_repair.id, NodeStatus.FAILED, error="No repair strategy matched or all failed")
                    break
                
                await self._update_node(graph_id, node_repair.id, NodeStatus.COMPLETED, output=repair_info)
                loop_count += 1

            # Confidence
            confidence = self.confidence_engine.calculate(
                [d.model_dump() for h in validation_history for d in h.details] if validation_history else [],
                repair_count,
                attestation_passed
            )

            # STEP 6: FINALIZE
            final_state = "COMPLETED" if success else "FAILED"
            await self._transition(graph_id, final_state)
            
            # STEP 7: DELIVERY (v5.5)
            if success and confidence.score > 80 and task_spec.delivery_url:
                await self._transition(graph_id, "DELIVERING")
                node_delivery = await self._add_node(graph_id, "DELIVERY", {"url": task_spec.delivery_url})
                
                delivery_success = self.git_provider.init_repo(session_dir)
                if delivery_success:
                    delivery_success = self.git_provider.commit_all(
                        session_dir, 
                        message=f"feat: autonomous generation of {task_spec.template_id}"
                    )
                if delivery_success:
                    delivery_success = self.git_provider.push(session_dir, task_spec.delivery_url)
                
                await self._update_node(
                    graph_id, 
                    node_delivery.id, 
                    NodeStatus.COMPLETED if delivery_success else NodeStatus.FAILED,
                    output={"status": "Delivered to remote"} if delivery_success else {"status": "Push failed"}
                )
                await self._transition(graph_id, "DELIVERED" if delivery_success else "COMPLETED")

            report = ExecutionReport(
                task_id=graph_id,
                success=success,
                execution_time=time.time() - start_time,
                output=last_execution_result.get("stdout") if last_execution_result else None,
                errors=[last_execution_result.get("stderr")] if last_execution_result and not success else [],
                explainability_token=f"exp_{graph_id}"
            )
            
            await self._persist_artifacts(graph_id, report, confidence)
            return report

        except Exception as e:
            logger.error(f"Kernel Panic on {graph_id}: {str(e)}")
            await self._transition(graph_id, "ROLLBACK")
            self.cleanup_manager.quarantine_session(graph_id, reason=f"kernel_panic: {str(e)}")
            report = ExecutionReport(
                task_id=graph_id,
                success=False,
                execution_time=time.time() - start_time,
                errors=[str(e)],
                explainability_token=f"err_{graph_id}"
            )
            await self._persist_artifacts(graph_id, report, None)
            return report

    async def resume_task(self, session_id: str, task_spec: TaskSpec) -> ExecutionReport:
        """
        Resumes a task from a saved checkpoint.
        """
        return await self.run_task(task_spec, resume_id=session_id)

    async def _run_and_judge(self, graph_id: str, sandbox: VenvProvider, session_dir: str, task_spec: TaskSpec) -> Tuple[ValidationResult, Dict[str, Any]]:
        """
        Executes the entrypoint and validates the results.
        """
        await self._transition(graph_id, "PRE_FLIGHT")
        artifact_paths = [os.path.join(session_dir, "server.py")]
        static_validation = self.validator.validate({"exit_code": 0, "stdout": "", "stderr": ""}, artifact_paths)
        
        if not static_validation.success:
            val_errors = "\n".join([d.message for d in static_validation.details if not d.success])
            return static_validation, {"exit_code": 1, "stdout": "", "stderr": val_errors}

        await self._transition(graph_id, "EXECUTING")
        result = await sandbox.execute_command("python -c \"import server\"")
        
        await self._transition(graph_id, "VALIDATING")
        validation = self.validator.validate(result, artifact_paths)
        
        if not validation.success:
            val_errors = "\n".join([d.message for d in validation.details if not d.success])
            result["stderr"] = (result.get("stderr", "") + "\n" + val_errors).strip()
        
        return validation, result

    async def _transition(self, graph_id: str, new_state: str):
        graph = self.active_graphs.get(graph_id)
        if not graph:
            return

        old_state = graph.state
        graph.state = new_state
        
        # v5.4: Save Checkpoint
        self.recovery_engine.save_checkpoint(graph_id, graph.model_dump())
        
        logger.info(f"Kernel Transition [{graph_id}]: {old_state} -> {new_state}")
        
        await self.telemetry.broadcast_event(
            source="kernel",
            phase=new_state,
            event_type="state_transition",
            message=f"Lifecycle transition: {old_state} -> {new_state}",
            data={
                "graph_id": graph_id,
                "old_state": old_state,
                "new_state": new_state
            }
        )

    async def _add_node(self, graph_id: str, action: str, params: Dict[str, Any] = None) -> ExecutionNode:
        graph = self.active_graphs.get(graph_id)
        if not graph:
            return None
        node_id = f"node_{len(graph.nodes) + 1}"
        node = ExecutionNode(id=node_id, action=action, params=params or {}, status=NodeStatus.RUNNING)
        graph.nodes[node_id] = node
        graph.active_node_id = node_id
        
        # v5.4: Save Checkpoint
        self.recovery_engine.save_checkpoint(graph_id, graph.model_dump())
        
        await self.telemetry.broadcast_event(
            source="kernel",
            phase=graph.state,
            event_type="node_added",
            message=f"Node added: {action}",
            data={
                "graph_id": graph_id,
                "node": node.model_dump()
            }
        )
        return node

    async def _update_node(self, graph_id: str, node_id: str, status: NodeStatus, output: Any = None, error: str = None):
        graph = self.active_graphs.get(graph_id)
        if not graph:
            return
        node = graph.nodes.get(node_id)
        if node:
            node.status = status
            node.output = output if isinstance(output, dict) else {"raw": str(output)} if output else None
            node.error = error
            
            # v5.4: Save Checkpoint
            self.recovery_engine.save_checkpoint(graph_id, graph.model_dump())
            
            await self.telemetry.broadcast_event(
                source="kernel",
                phase=graph.state,
                event_type="node_updated",
                message=f"Node updated: {node.action} -> {status}",
                data={
                    "graph_id": graph_id,
                    "node_id": node_id,
                    "status": status,
                    "output": node.output,
                    "error": error
                }
            )

    async def _persist_artifacts(self, graph_id: str, report: ExecutionReport, confidence: Optional[Any]):
        """
        Saves the full flight log and artifacts to the structured architecture.
        """
        graph = self.active_graphs.get(graph_id)
        flight_log = {
            "report": report.model_dump(),
            "graph": graph.model_dump() if graph else None,
            "confidence": confidence.model_dump() if confidence else None,
            "timestamp": time.time()
        }
        
        # 1. Save Execution Report
        report_path = os.path.join(self.workspace_root, "agrt", "artifacts", "execution_reports", f"{graph_id}.json")
        with open(report_path, "w") as f:
            json.dump(flight_log, f, indent=2)
            
        # 2. Update Latest for Legacy Support (e.g. CLI/UI)
        history_dir = os.path.join(self.workspace_root, ".agrt", "history")
        os.makedirs(history_dir, exist_ok=True)
        with open(os.path.join(history_dir, "report.json"), "w") as f:
            json.dump(flight_log, f, indent=2)
            
        logger.info(f"Artifact Architecture persisted for {graph_id}")
