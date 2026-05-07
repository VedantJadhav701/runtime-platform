import os
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("runtime.kernel.recovery")

class RecoveryEngine:
    """
    Orchestration Recovery Sentinel (v5.4).
    Handles checkpointing and restoration of execution graphs.
    """
    def __init__(self, workspace_root: str = "."):
        self.workspace_root = os.path.abspath(workspace_root)
        self.sessions_dir = os.path.join(self.workspace_root, ".runtime", "sessions")

    def save_checkpoint(self, graph_id: str, graph_data: Dict[str, Any]):
        """
        Saves the current state of the execution graph to checkpoint.json.
        """
        session_dir = os.path.join(self.sessions_dir, graph_id)
        if not os.path.exists(session_dir):
            os.makedirs(session_dir, exist_ok=True)
            
        checkpoint_path = os.path.join(session_dir, "checkpoint.json")
        try:
            with open(checkpoint_path, "w") as f:
                json.dump(graph_data, f, indent=2)
            logger.debug(f"Recovery: Checkpoint saved for {graph_id}")
        except Exception as e:
            logger.error(f"Recovery: Failed to save checkpoint for {graph_id}: {e}")

    def load_checkpoint(self, graph_id: str) -> Optional[Dict[str, Any]]:
        """
        Loads the execution graph from checkpoint.json.
        """
        checkpoint_path = os.path.join(self.sessions_dir, graph_id, "checkpoint.json")
        if not os.path.exists(checkpoint_path):
            logger.warning(f"Recovery: No checkpoint found for {graph_id}")
            return None
            
        try:
            with open(checkpoint_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Recovery: Failed to load checkpoint for {graph_id}: {e}")
            return None
