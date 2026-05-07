import asyncio
import logging
import psutil
import os
import signal

logger = logging.getLogger("runtime.kernel.watchdog.termination")

class ProcessTerminator:
    """
    Handles graceful and forced termination of orphaned or timed-out processes.
    """
    @staticmethod
    async def terminate(pid: int, timeout_sec: float = 5.0) -> bool:
        """
        Attempt graceful termination (SIGTERM), then escalate to SIGKILL.
        """
        try:
            parent = psutil.Process(pid)
            # Terminate children first
            children = parent.children(recursive=True)
            for child in children:
                child.terminate()
            
            parent.terminate()
            
            # Wait for graceful exit
            _, alive = psutil.wait_procs(children + [parent], timeout=timeout_sec)
            
            if alive:
                logger.warning(f"Process {pid} still alive after SIGTERM, escalating to SIGKILL")
                for p in alive:
                    p.kill()
            
            return True
        except psutil.NoSuchProcess:
            return True # Already gone
        except Exception as e:
            logger.error(f"Failed to terminate process {pid}: {e}")
            return False
