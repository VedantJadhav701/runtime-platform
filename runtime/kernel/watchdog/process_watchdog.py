import asyncio
import time
import logging
from typing import Dict, Any, Optional
from runtime.kernel.watchdog.timeout_policy import TimeoutPolicy
from runtime.kernel.watchdog.termination import ProcessTerminator

logger = logging.getLogger("runtime.kernel.watchdog")

class ProcessWatchdog:
    """
    Orchestration Sentinel (v5.1).
    Governs process lifecycle, enforces timeouts via wait_for, and manages termination escalation.
    """
    def __init__(self, policy: Optional[TimeoutPolicy] = None):
        self.policy = policy or TimeoutPolicy()

    async def watch_process(self, process: asyncio.subprocess.Process, policy_name: str) -> Dict[str, Any]:
        """
        Uses an asyncio.wait_for wrapper to monitor process execution.
        Implements Escalation: terminate() -> Wait 5s -> kill().
        """
        timeout = self.policy.get_timeout(policy_name)
        start_time = time.time()
        
        try:
            # wait_for wrapper as per blueprint
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
            
            execution_time = time.time() - start_time
            return {
                "exit_code": process.returncode,
                "stdout": stdout.decode(errors="replace").strip() if stdout else "",
                "stderr": stderr.decode(errors="replace").strip() if stderr else "",
                "execution_time": execution_time,
                "timed_out": False
            }

        except asyncio.TimeoutError:
            logger.warning(f"Watchdog Violation: [{policy_name}] exceeded {timeout}s timeout. Initiating Escalation.")
            
            # ESCALATION: terminate() -> Wait 5s -> kill()
            # ProcessTerminator.terminate handles the SIGTERM -> Wait 5s -> SIGKILL logic
            await ProcessTerminator.terminate(process.pid, timeout_sec=5.0)
            
            execution_time = time.time() - start_time
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Watchdog Violation: {policy_name} execution exceeded timeout of {timeout}s",
                "execution_time": execution_time,
                "timed_out": True
            }
        except Exception as e:
            logger.error(f"Unexpected error in watchdog for {policy_name}: {e}")
            if process.returncode is None:
                await ProcessTerminator.terminate(process.pid, timeout_sec=1.0)
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Watchdog Internal Error: {str(e)}",
                "timed_out": False
            }
