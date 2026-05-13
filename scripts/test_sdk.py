from agrt import Runtime
import os

def test_sdk():
    print("Testing AGRT SDK...")
    runtime = Runtime()
    
    # Use a real template
    report = runtime.run(
        task="Build a test API",
        template="fastapi_basic",
        features=["uvicorn"]
    )
    
    print(f"SDK Run Completed. Task ID: {report.task_id}")
    print(f"Success: {report.success}")

if __name__ == "__main__":
    test_sdk()
