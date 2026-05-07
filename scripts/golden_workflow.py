import asyncio
import logging
import os
import shutil
import json
import subprocess
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.kernel.execution_graph.schemas import TaskSpec
from runtime.api.websocket.handler import TelemetryManager

# Configure logging for presentation clarity
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("antigravity.golden_workflow")

async def run_golden_workflow():
    """
    ✨ THE GOLDEN WORKFLOW (v5.5) ✨
    Demonstrating the full 7-step Autonomous Infrastructure Loop:
    Scaffold -> Bootstrap -> Provision -> Pre-Flight -> Judge -> Self-Heal -> Delivery
    """
    print("\n" + "="*70)
    print("🚀 ANTIGRAVITY RUNTIME: GOLDEN WORKFLOW INITIATED")
    print("="*70)

    # 1. Setup Mock Remote Infrastructure
    workspace_root = os.getcwd()
    mock_remote_dir = os.path.join(workspace_root, ".runtime", "mock_remote")
    if os.path.exists(mock_remote_dir):
        try:
            shutil.rmtree(mock_remote_dir)
        except Exception:
            # Handle Windows file locking
            import time
            mock_remote_dir = os.path.join(workspace_root, ".runtime", f"mock_remote_{int(time.time())}")
            
    os.makedirs(mock_remote_dir, exist_ok=True)
    subprocess.run(["git", "init", "--bare"], cwd=mock_remote_dir, check=True, capture_output=True)
    
    remote_url = f"file:///{mock_remote_dir.replace('\\', '/')}"
    print(f"\n[1/7] 🏗️  MOCK INFRASTRUCTURE READY")
    print(f"      Remote URL: {remote_url}")

    # 2. Initialize Core Engine
    telemetry = TelemetryManager()
    engine = LifecycleEngine(telemetry, workspace_root)
    
    # 3. Define the Flagship Task (Intentional Failure Injection)
    # We omit 'fastapi' to force a JUDGE phase failure and trigger Self-Heal.
    task_spec = TaskSpec(
        project_type="api",
        template_id="fastapi_basic",
        features=["uvicorn"], # Missing 'fastapi'!
        delivery_url=remote_url
    )
    print(f"\n[2/7] 🧠 AI INTENT EXTRACTED")
    print(f"      Template: {task_spec.template_id}")
    print(f"      Injectors: {task_spec.features} (Warning: 'fastapi' intentionally omitted)")

    # 4. Execute the Autonomous Loop
    print(f"\n[3/7] 🔄 EXECUTING 7-STEP AUTONOMOUS LOOP...")
    report = await engine.run_task(task_spec)

    # 5. Analysis & Verification
    print(f"\n[4/7] ⚖️  ORCHESTRATION ANALYSIS")
    print(f"      Task ID: {report.task_id}")
    print(f"      Success: {'✅ YES' if report.success else '❌ NO'}")
    print(f"      Execution Time: {report.execution_time:.2f}s")
    
    # Read the flight log to see the "Flight Log" details
    history_path = os.path.join(workspace_root, "runtime", "artifacts", "execution_reports", f"{report.task_id}.json")
    try:
        with open(history_path, "r") as f:
            flight_log = json.load(f)
            confidence = flight_log.get("confidence", {})
            nodes = flight_log.get("graph", {}).get("nodes", {})
    except Exception as e:
        print(f"❌ Failed to load Flight Log: {e}")
        return

    print(f"\n[5/7] 🛡️  OPERATIONAL CONFIDENCE REPORT")
    print(f"      Score: {confidence.get('score', 0)}/100")
    print(f"      Status: {confidence.get('status', 'unknown').upper()}")
    print(f"      Reasons:")
    for reason in confidence.get('reasons', []):
        print(f"        - {reason}")

    print(f"\n[6/7] ⏪ TIME-TRAVEL REPLAY AUDIT")
    # Verify that nodes have output/error for the Replay Engine
    sorted_nodes = sorted(nodes.values(), key=lambda x: int(x["id"].split("_")[1]))
    for node in sorted_nodes:
        action = node["action"]
        status = node["status"].upper()
        has_telemetry = "YES" if node.get("output") or node.get("error") else "NO"
        print(f"      [{action:<10}] -> {status:<10} | Telemetry Fidelity: {has_telemetry}")

    # 6. Verify Delivery
    print(f"\n[7/7] 💾 DELIVERY CONFIRMATION")
    git_check = subprocess.run(["git", "log", "-1", "--oneline", "main"], cwd=mock_remote_dir, capture_output=True, text=True)
    if "autonomous generation" in git_check.stdout:
        print(f"      Status: ✅ DELIVERED TO REMOTE")
        print(f"      Commit: {git_check.stdout.strip()}")
    else:
        print(f"      Status: ❌ DELIVERY FAILED OR NOT TRIGGERED")

    print("\n" + "="*70)
    print("✨ GOLDEN WORKFLOW COMPLETED SUCCESSFULLY.")
    print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(run_golden_workflow())
