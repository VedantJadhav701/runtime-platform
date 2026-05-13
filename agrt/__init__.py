from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.api.websocket.handler import TelemetryManager
from runtime.kernel.execution_graph.schemas import TaskSpec
import asyncio
from typing import Optional, List

class Runtime:
    """
    Antigravity Runtime SDK.
    Provides a high-level interface for autonomous execution.
    """
    def __init__(self, workspace_root: str = "."):
        self.telemetry = TelemetryManager()
        self.engine = LifecycleEngine(self.telemetry, workspace_root=workspace_root)

    def run(self, task: str, template: str = "fastapi_basic", features: Optional[List[str]] = None, output: str = None):
        """
        Executes an autonomous task.
        """
        task_spec = TaskSpec(
            project_type="sdk_task",
            template_id=template,
            features=features or [],
            delivery_url=output
        )
        
        # We use a wrapper to run the async kernel in a synchronous SDK call if needed,
        # or just provide async methods. The prompt suggests a synchronous-looking call.
        return asyncio.run(self.engine.run_task(task_spec))

    async def run_async(self, task: str, template: str = "fastapi_basic", features: Optional[List[str]] = None, output: str = None):
        """
        Asynchronously executes an autonomous task.
        """
        task_spec = TaskSpec(
            project_type="sdk_task",
            template_id=template,
            features=features or [],
            delivery_url=output
        )
        return await self.engine.run_task(task_spec)
