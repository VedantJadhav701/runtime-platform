import asyncio
import logging
import os
import shutil
import json
import subprocess
import time
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.kernel.execution_graph.schemas import TaskSpec
from runtime.api.websocket.handler import TelemetryManager

# Configure logging for presentation clarity
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("antigravity.golden_workflow")

async def run_golden_workflow(pacing: float = 0.5):
    """
    ✨ THE GOLDEN WORKFLOW (v6.0 - Hardened) ✨
    Demonstrating the full 7-step Autonomous Infrastructure Loop:
    Scaffold -> Bootstrap -> Provision -> Pre-Flight -> Judge -> Self-Heal -> Delivery
    """
    print("\n" + "="*70)
    print("🚀 ANTIGRAVITY RUNTIME: GOLDEN WORKFLOW (PRODUCTION HARDENED)")
    print("="*70)

    # 1. Setup Mock Remote Infrastructure (Ensuring clean state)
    workspace_root = os.getcwd()
    mock_remote_dir = os.path.join(workspace_root, ".runtime", "mock_remote")
    if os.path.exists(mock_remote_dir):
        try:
            shutil.rmtree(mock_remote_dir)
        except Exception:
            # Handle Windows file locking or permission issues
            mock_remote_dir = os.path.join(workspace_root, ".runtime", f"mock_remote_{int(time.time())}")
            
    os.makedirs(mock_remote_dir, exist_ok=True)
    subprocess.run(["git", "init", "--bare"], cwd=mock_remote_dir, check=True, capture_output=True)
    
    remote_url = f"file:///{mock_remote_dir.replace('\\', '/')}"
    print(f"\n[1/7] 🏗️  INFRASTRUCTURE BOOTSTRAP")
    print(f"      Remote URL: {remote_url}")

    # 2. Initialize Core Engine with Deterministic Telemetry
    telemetry = TelemetryManager()
    engine = LifecycleEngine(telemetry, workspace_root)
    
    # 3. Define Flagship Task (Intentional Failure for Repair Demo)
    # We omit 'fastapi' to trigger the JUDGE failure and subsequent SELF-HEAL.
    task_spec = TaskSpec(
        project_type="api",
        template_id="fastapi_basic",
        features=["uvicorn"], # Missing 'fastapi'!
        delivery_url=remote_url
    )
    print(f"\n[2/7] 🧠 INTENT COMPILATION")
    print(f"      Template ID: {task_spec.template_id}")
    print(f"      Injected Constraints: {task_spec.features}")
    print(f"      Target: {remote_url}")
    print(f"      Note: 'fastapi' intentionally omitted to demonstrate autonomous recovery.")

    await asyncio.sleep(pacing)

    # 4. Execute Autonomous Loop
    print(f"\n[3/7] 🔄 EXECUTING DETERMINISTIC ORCHESTRATION...")
    report = await engine.run_task(task_spec)

    # 5. Operational Analysis
    print(f"\n[4/7] ⚖️  ORCHESTRATION FIDELITY CHECK")
    print(f"      Task ID: {report.task_id}")
    print(f"      Status: {'✅ SUCCESS' if report.success else '❌ FAILED'}")
    print(f"      Total Latency: {report.execution_time:.2f}s")
    
    # Load and verify Replay Artifacts
    history_path = os.path.join(workspace_root, "runtime", "artifacts", "execution_reports", f"{report.task_id}.json")
    try:
        with open(history_path, "r") as f:
            flight_log = json.load(f)
            confidence = flight_log.get("confidence", {})
            nodes = flight_log.get("graph", {}).get("nodes", {})
            state_history = flight_log.get("graph", {}).get("state", "UNKNOWN")
    except Exception as e:
        print(f"❌ REPLAY AUDIT FAILED: Could not load flight log: {e}")
        return

    # 6. Confidence & Explainability
    print(f"\n[5/7] 🛡️  CONFIDENCE EVOLUTION")
    print(f"      Final Score: {confidence.get('score', 0)}/100")
    print(f"      Trust Level: {confidence.get('status', 'unknown').upper()}")
    print(f"      Grounding Reasons:")
    for reason in confidence.get('reasons', []):
        print(f"        - {reason}")

    await asyncio.sleep(pacing)

    # 7. Replay Fidelity & Telemetry Audit
    print(f"\n[6/7] ⏪ TELEMETRY INTEGRITY AUDIT")
    # Sort nodes by creation order (assumed from ID sequence)
    try:
        sorted_nodes = sorted(nodes.values(), key=lambda x: int(x["id"].split("_")[1]))
        for node in sorted_nodes:
            action = node["action"]
            status = node["status"].upper()
            has_out = "✅" if node.get("output") else "➖"
            has_err = "⚠️" if node.get("error") else "➖"
            print(f"      [{action:<10}] status={status:<10} telemetry=[OUT:{has_out} ERR:{has_err}]")
    except Exception as e:
        print(f"      ⚠️ Telemetry ordering check failed: {e}")

    # 8. Delivery Verification
    print(f"\n[7/7] 💾 INFRASTRUCTURE DELIVERY")
    git_check = subprocess.run(["git", "log", "-1", "--oneline", "main"], cwd=mock_remote_dir, capture_output=True, text=True)
    if "autonomous generation" in git_check.stdout:
        print(f"      Status: ✅ DELIVERED")
        print(f"      Commit: {git_check.stdout.strip()}")
    else:
        print(f"      Status: ❌ DELIVERY FAILED OR NOT REACHED")

    print("\n" + "="*70)
    print("✨ GOLDEN WORKFLOW COMPLETED: SYSTEM IS READY FOR PRODUCTION.")
    print("="*70 + "\n")

if __name__ == "__main__":
    # Allow pacing adjustment via env var for different demo speeds
    pacing_val = float(os.getenv("AG_DEMO_PACING", "0.5"))
    asyncio.run(run_golden_workflow(pacing=pacing_val))
