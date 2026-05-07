import asyncio
import os
import shutil
import logging
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.planner.schemas import TaskSpec
from runtime.kernel.telemetry.manager import TelemetryManager

# Configure Logging for Infrastructure-Grade Clarity
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("antigravity.golden_workflow")

async def run_golden_workflow():
    """
    The Flagship Demo: Showcasing the 7-Step Autonomous Loop.
    Workflow: Intent -> Scaffold -> Bootstrap -> Provision -> Judge -> Self-Heal -> Delivery
    """
    logger.info("🚀 INITIALIZING ANTIGRAVITY GOLDEN WORKFLOW (v5.5)")
    
    # 1. Setup Mock Infrastructure
    workspace_root = os.getcwd()
    mock_remote = os.path.join(workspace_root, ".runtime", "mock_remote")
    if os.path.exists(mock_remote):
        shutil.rmtree(mock_remote)
    os.makedirs(mock_remote)
    
    # Initialize Git in Mock Remote
    os.system(f"cd {mock_remote} && git init --bare")
    
    # 2. Define the Flagship Task
    # We intentionaly omit 'fastapi' to trigger the Self-Heal phase
    task_spec = TaskSpec(
        template_id="fastapi-basic",
        project_type="web-service",
        features=["uvicorn"], # Missing fastapi!
        delivery_url=f"file:///{mock_remote.replace('\\', '/')}"
    )
    
    # 3. Initialize the Kernel
    telemetry = TelemetryManager()
    kernel = LifecycleEngine(telemetry, workspace_root)
    
    logger.info("📡 TELEMETRY ONLINE. STARTING ORCHESTRATION.")
    
    # 4. Execute the Loop
    try:
        report = await kernel.run_task(task_spec)
        
        # 5. Benchmark Results
        logger.info("\n" + "="*50)
        logger.info("🏆 GOLDEN WORKFLOW COMPLETED")
        logger.info(f"   Task ID: {report.task_id}")
        logger.info(f"   Success: {report.success}")
        logger.info(f"   Execution Time: {report.execution_time:.2f}s")
        logger.info(f"   Confidence Score: {getattr(report, 'confidence_score', 'N/A')}")
        logger.info(f"   Delivery State: {'DELIVERED' if report.success else 'FAILED'}")
        logger.info("="*50 + "\n")
        
        logger.info(f"📜 Flight Log saved to: .runtime/history/{report.task_id}.json")
        logger.info(f"📦 Delivered Code available at: {mock_remote}")
        
    except Exception as e:
        logger.error(f"❌ Golden Workflow Interrupted: {e}")

if __name__ == "__main__":
    asyncio.run(run_golden_workflow())
