from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class NodeStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

class ExecutionNode(BaseModel):
    id: str
    action: str  # e.g., "SCAFFOLD", "INJECT", "VALIDATE"
    params: Dict[str, Any] = Field(default_factory=dict)
    depends_on: List[str] = Field(default_factory=list)
    status: NodeStatus = NodeStatus.PENDING
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ExecutionGraph(BaseModel):
    id: str
    nodes: Dict[str, ExecutionNode]
    active_node_id: Optional[str] = None
    state: str = "IDLE"

class TaskSpec(BaseModel):
    """
    The structured input for the Kernel.
    Replaces raw prompts with infrastructure-grade specifications.
    """
    project_type: str
    template_id: str
    features: List[str] = Field(default_factory=list)
    environment: Dict[str, Any] = Field(default_factory=dict)
    constraints: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    delivery_url: Optional[str] = None
