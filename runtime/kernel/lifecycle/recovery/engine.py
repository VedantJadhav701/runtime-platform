import os
import json
import logging
from typing import List, Optional
from runtime.kernel.execution_graph.schemas import ExecutionGraph

logger = logging.getLogger("runtime.kernel.recovery")

class RecoveryEngine:
    """
    Manages state persistence and session resurrection.
    """
    @staticmethod
    def save_checkpoint(session_dir: str, graph: ExecutionGraph):
        """
        Saves the current graph state to disk.
        """
        checkpoint_path = os.path.join(session_dir, "checkpoint.json")
        try:
            with open(checkpoint_path, "w") as f:
                f.write(graph.model_dump_json(indent=2))
        except Exception as e:
            logger.error(f"Recovery: Failed to save checkpoint: {e}")

    @staticmethod
    def load_checkpoint(session_dir: str) -> Optional[ExecutionGraph]:
        """
        Loads a graph state from a checkpoint file.
        """
        checkpoint_path = os.path.join(session_dir, "checkpoint.json")
        if not os.path.exists(checkpoint_path):
            return None
            
        try:
            with open(checkpoint_path, "r") as f:
                data = json.load(f)
            return ExecutionGraph(**data)
        except Exception as e:
            logger.error(f"Recovery: Failed to load checkpoint: {e}")
            return None

    @staticmethod
    def find_resumable_sessions(sessions_root: str) -> List[str]:
        """
        Scans for session directories that can be resumed.
        """
        resumable = []
        if not os.path.exists(sessions_root):
            return []
            
        for session_id in os.listdir(sessions_root):
            session_dir = os.path.join(sessions_root, session_id)
            checkpoint_path = os.path.join(session_dir, "checkpoint.json")
            report_path = os.path.join(session_dir, "report.json") # In-session report
            
            # If checkpoint exists but session is not finalized
            if os.path.exists(checkpoint_path) and not os.path.exists(report_path):
                resumable.append(session_id)
                
        return resumable
