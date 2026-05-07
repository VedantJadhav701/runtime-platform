from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Any, Optional

class NodeSnapshot(BaseModel):
    """
    A snapshot of an execution node's state for Replayability.
    """
    node_id: str
    status: str
    timestamp: datetime = Field(default_factory=datetime.now)
    input_params: Optional[Dict[str, Any]] = None
    output_result: Optional[Dict[str, Any]] = None
    terminal_output: Optional[str] = None # Capture the full stdout/stderr stream

class ExecutionEvidence(BaseModel):
    """
    The persistent 'Flight Log' for an autonomous task (v5.5).
    """
    task_id: str
    graph_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    final_status: str
    confidence_score: float = 0.0
    node_snapshots: List[NodeSnapshot] = []
    quarantine_path: Optional[str] = None
    delivery_hash: Optional[str] = None # The Git commit hash if delivered
    recovery_metadata: Optional[Dict[str, Any]] = None
