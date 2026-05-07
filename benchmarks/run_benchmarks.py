import asyncio
import time
import json
import os
import shutil
import logging
from typing import Dict, List, Any
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.kernel.execution_graph.schemas import TaskSpec
from runtime.api.websocket.handler import TelemetryManager

logging.getLogger("runtime").setLevel(logging.WARNING)

class BenchmarkRunner:
    def __init__(self):
        self.telemetry = TelemetryManager()
        self.engine = LifecycleEngine(self.telemetry)
        self.results = []

    async def run_scenario(self, name: str, spec: TaskSpec, setup_cb=None, teardown_cb=None):
        print(f"Running Benchmark Scenario: {name} ...", end="", flush=True)
        if setup_cb:
            setup_cb()
            
        start_time = time.time()
        report = await self.engine.run_task(spec)
        end_time = time.time()
        
        latency = end_time - start_time
        repair_count = 0
        
        # Read the flight log to calculate repair latency and count
        history_path = os.path.join("runtime", "artifacts", "execution_reports", f"{report.task_id}.json")
        try:
            with open(history_path, "r") as f:
                log = json.load(f)
                nodes = log.get("graph", {}).get("nodes", {})
                for node in nodes.values():
                    if node["action"] == "REPAIR" and node["status"] == "completed":
                        repair_count += 1
                confidence = log.get("confidence", {}).get("score", 0)
        except Exception as e:
            print(f" Failed to read {history_path}: {e}")
            confidence = 0

        self.results.append({
            "scenario": name,
            "success": report.success,
            "latency_sec": round(latency, 2),
            "repair_count": repair_count,
            "confidence_score": confidence
        })
        
        print(f" Done ({'✅' if report.success else '❌'})")
        
        if teardown_cb:
            teardown_cb()
            
    def save_report(self):
        os.makedirs(os.path.join("runtime", "artifacts", "benchmark_runs"), exist_ok=True)
        report_path = os.path.join("runtime", "artifacts", "benchmark_runs", f"benchmark_{int(time.time())}.json")
        with open(report_path, "w") as f:
            json.dump({"runs": self.results}, f, indent=2)
            
        print(f"\nBenchmark report saved to {report_path}")
        print("\n--- Benchmark Summary ---")
        for res in self.results:
            print(f"{res['scenario']:<30} | {'✅ Pass' if res['success'] else '❌ Fail'} | Latency: {res['latency_sec']:>5.2f}s | Repairs: {res['repair_count']} | Confidence: {res['confidence_score']}")


async def main():
    runner = BenchmarkRunner()
    
    # Scenario 1: Pristine Execution
    await runner.run_scenario(
        "Pristine Execution",
        TaskSpec(project_type="api", template_id="fastapi_basic", features=["fastapi", "uvicorn"])
    )
    
    # Scenario 2: Single Dependency Failure
    await runner.run_scenario(
        "Single Dependency Failure",
        TaskSpec(project_type="api", template_id="fastapi_basic", features=["uvicorn"]) # Missing fastapi
    )
    
    # Scenario 3: Multiple Dependency Failures
    await runner.run_scenario(
        "Multi-Dependency Failure",
        TaskSpec(project_type="api", template_id="fastapi_basic", features=[]) # Missing fastapi and uvicorn
    )
    
    # Scenario 4: Lint Failure (Ruff)
    template_path = "runtime/generation/templates/fastapi_basic/server.py"
    def setup_lint():
        with open(template_path, "a") as f:
            f.write("\nimport os # Unused import for Ruff\n")
            
    def teardown_lint():
        with open(template_path, "r") as f:
            lines = f.readlines()
        with open(template_path, "w") as f:
            f.writelines([l for l in lines if "import os # Unused import for Ruff" not in l])

    await runner.run_scenario(
        "Static Analysis (Ruff) Failure",
        TaskSpec(project_type="api", template_id="fastapi_basic", features=["fastapi", "uvicorn"]),
        setup_cb=setup_lint,
        teardown_cb=teardown_lint
    )
    
    runner.save_report()

if __name__ == "__main__":
    asyncio.run(main())
