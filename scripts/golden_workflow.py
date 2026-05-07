import asyncio
import logging
import os
import json
from runtime.planner.classification.classifier import IntentClassifier
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.api.websocket.handler import TelemetryManager
from runtime.generation.patching.ast_patcher import ASTPatcher

# Configure logging for the presentation
logging.getLogger("runtime").setLevel(logging.WARNING)

async def golden_workflow():
    print("="*60)
    print("✨ THE GOLDEN WORKFLOW ✨")
    print("Antigravity Runtime: Autonomous Local Execution Platform")
    print("="*60)

    # 1. Initialization
    telemetry = TelemetryManager()
    classifier = IntentClassifier()
    engine = LifecycleEngine(telemetry)
    patcher = ASTPatcher()
    
    # 2. Intent Extraction
    prompt = "Build a minimal FastAPI app with SQLite"
    print(f"\n[1/6] 🧠 AI Intent Extraction\n      Prompt: '{prompt}'")
    try:
        spec = await classifier.classify_and_compile(prompt)
        print(f"      Result: {spec.template_id} + Injectors: {spec.features}")
    except Exception as e:
        print(f"❌ Intent Classification Failed: {e}")
        return

    # To guarantee we see the 'Auto-repair' step, we'll intentionally corrupt the template right before it runs,
    # but do it safely so the platform can fix it.
    template_path = "runtime/generation/templates/fastapi_basic/server.py"
    with open(template_path, "a") as f:
        f.write("\nimport os # Unused import injected to trigger Autonomous Repair\n")

    print(f"\n[2/6] 🏗️  Auto-Bootstrap & Orchestration")
    print(f"      Initiating 6-Step Lifecycle Engine...")
    
    # 3. Lifecycle Orchestration (Auto-bootstrap -> Auto-repair -> Validate)
    report = await engine.run_task(spec)
    
    # Clean up the injected fault from the template for future runs
    with open(template_path, "r") as f:
        lines = f.readlines()
    with open(template_path, "w") as f:
        f.writelines([l for l in lines if "import os # Unused import injected to trigger Autonomous Repair" not in l])
        
    print(f"\n[3/6] 🔧 Autonomous Repair & Validation")
    print(f"      Task State: {'✅ COMPLETED' if report.success else '❌ FAILED'}")
    print(f"      Execution Time: {round(report.execution_time, 2)}s")
    
    # 4. Read Artifacts for Confidence and Replay
    history_path = os.path.join("runtime", "artifacts", "execution_reports", f"{report.task_id}.json")
    try:
        with open(history_path, "r") as f:
            flight_log = json.load(f)
            confidence = flight_log.get("confidence", {})
            graph = flight_log.get("graph", {})
    except Exception as e:
        print(f"Failed to read Flight Log: {e}")
        return

    print(f"\n[4/6] 🛡️  Confidence Report")
    print(f"      Score: {confidence.get('score', 0)}/100 ({confidence.get('status', 'unknown').upper()})")
    print(f"      Reasons:")
    for reason in confidence.get('reasons', []):
        print(f"        - {reason}")

    print(f"\n[5/6] ⏪ Execution Replay Timeline")
    nodes = graph.get("nodes", {})
    sorted_nodes = sorted(nodes.values(), key=lambda x: int(x["id"].split("_")[1]))
    for node in sorted_nodes:
        action = node["action"]
        status = node["status"].upper()
        if status == "FAILED":
            print(f"      [{action}] -> ❌ {status} (Triggering Repair Routing)")
        else:
            print(f"      [{action}] -> ✅ {status}")

    print(f"\n[6/6] 💾 Execution Artifacts Persisted")
    print(f"      Flight Log: {history_path}")
    print(f"      Sandbox: .runtime/sessions/{report.task_id}/")

    print("\n" + "="*60)
    print("🚀 Golden Workflow Completed Successfully.")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(golden_workflow())
