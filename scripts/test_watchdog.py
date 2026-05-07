import asyncio
import os
import json
import logging
from runtime.environment.sandbox.venv_provider import VenvProvider

# Configure logging
logging.basicConfig(level=logging.INFO)

async def test_watchdog_timeout():
    policy_path = "runtime/kernel/policies/timeouts.json"
    
    # 1. Backup original policies
    with open(policy_path, "r") as f:
        original_policies = json.load(f)
    
    try:
        # 2. Set extremely short timeout for 'linting'
        print("\n[1/3] Injecting 1s timeout policy for 'linting'...")
        test_policies = original_policies.copy()
        test_policies["linting"] = 1 
        with open(policy_path, "w") as f:
            json.dump(test_policies, f)

        # 3. Execute a command that hangs for 5 seconds
        # We use a fresh VenvProvider to ensure it loads the new policy
        sandbox = VenvProvider("watchdog_test", ".")
        
        print("[2/3] Executing 5s sleep command under 1s watchdog governance...")
        # Note: We don't need a full bootstrap for this simple python command if the host has python
        # But we'll just run it; it should trigger the timeout regardless.
        result = await sandbox.execute_command(
            "python -c \"import time; print('Process Started'); time.sleep(5); print('Process Finished')\"", 
            operation_type="linting"
        )
        
        # 4. Verify results
        print("[3/3] Analyzing Watchdog Intervention Result:")
        print(f"      - Timed Out: {result.get('timed_out')}")
        print(f"      - Exit Code: {result.get('exit_code')}")
        print(f"      - Stderr: {result.get('stderr')}")
        print(f"      - Execution Time: {round(result.get('execution_time', 0), 2)}s")

        if result.get("timed_out") and result.get("exit_code") == -1:
            print("\n✅ SUCCESS: ProcessWatchdog successfully intercepted the hanging process.")
        else:
            print("\n❌ FAILURE: ProcessWatchdog failed to enforce the timeout.")

    finally:
        # 5. Restore original policies
        print("\nRestoring original timeout policies...")
        with open(policy_path, "w") as f:
            json.dump(original_policies, f)

if __name__ == "__main__":
    asyncio.run(test_watchdog_timeout())
