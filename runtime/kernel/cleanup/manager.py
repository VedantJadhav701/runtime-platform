import os
import shutil
import logging
import time
import json
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger("runtime.kernel.cleanup")

class CleanupManager:
    """
    Resource Hygiene Sentinel (v5.2).
    Manages the lifecycle of session data, environments, and quarantine.
    """
    def __init__(self, workspace_root: str = "."):
        self.workspace_root = os.path.abspath(workspace_root)
        self.sessions_dir = os.path.join(self.workspace_root, ".runtime", "sessions")
        self.quarantine_dir = os.path.join(self.workspace_root, ".runtime", "quarantine")
        self.environments_dir = os.path.join(self.workspace_root, ".runtime", "environments")
        
        # Ensure base directories exist
        os.makedirs(self.sessions_dir, exist_ok=True)
        os.makedirs(self.quarantine_dir, exist_ok=True)
        os.makedirs(self.environments_dir, exist_ok=True)

    def quarantine_session(self, session_id: str, reason: str):
        """
        Relocates a session folder to .runtime/quarantine/ and saves metadata.
        Uses shutil.move for cross-drive compatibility.
        """
        session_path = os.path.join(self.sessions_dir, session_id)
        target_path = os.path.join(self.quarantine_dir, session_id)
        
        if not os.path.exists(session_path):
            logger.warning(f"Cleanup: Cannot quarantine missing session {session_id}")
            return False

        try:
            # 1. Save Metadata
            metadata = {
                "session_id": session_id,
                "quarantine_reason": reason,
                "timestamp": time.time(),
                "date": datetime.now().isoformat()
            }
            
            with open(os.path.join(session_path, "quarantine_metadata.json"), "w") as f:
                json.dump(metadata, f, indent=2)

            # 2. Relocate (uses copy+delete if cross-drive)
            if os.path.exists(target_path):
                shutil.rmtree(target_path) # Clear old quarantine if exists
                
            shutil.move(session_path, target_path)
            
            # 3. Cleanup Environment as well
            env_path = os.path.join(self.environments_dir, session_id)
            if os.path.exists(env_path):
                shutil.rmtree(env_path, ignore_errors=True)
                
            logger.info(f"Cleanup: Session {session_id} moved to quarantine. Reason: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Cleanup: Failed to quarantine session {session_id}: {e}")
            return False

    async def gc_loop(self, interval_sec: int = 3600, max_age_hours: int = 24):
        """
        Background process that scans for stale sessions and environments.
        """
        while True:
            logger.debug("Cleanup: Running Garbage Collection cycle...")
            try:
                now = time.time()
                expiry_limit = now - (max_age_hours * 3600)

                # Scan Sessions
                if os.path.exists(self.sessions_dir):
                    for session_id in os.listdir(self.sessions_dir):
                        path = os.path.join(self.sessions_dir, session_id)
                        if os.path.isdir(path):
                            mtime = os.path.getmtime(path)
                            if mtime < expiry_limit:
                                logger.info(f"Cleanup: GC triggering quarantine for stale session {session_id}")
                                self.quarantine_session(session_id, reason="stale_garbage_collection")

                # Scan Environments (Orphaned environments with no session)
                if os.path.exists(self.environments_dir):
                    for env_id in os.listdir(self.environments_dir):
                        env_path = os.path.join(self.environments_dir, env_id)
                        session_path = os.path.join(self.sessions_dir, env_id)
                        if not os.path.exists(session_path):
                            logger.info(f"Cleanup: GC removing orphan environment {env_id}")
                            shutil.rmtree(env_path, ignore_errors=True)

            except Exception as e:
                logger.error(f"Cleanup: GC loop error: {e}")

            await asyncio.sleep(interval_sec)
