from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from runtime.api.websocket.handler import TelemetryManager
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.kernel.execution_graph.schemas import TaskSpec
from runtime.api.schemas.tasks import ExecutionReport
from runtime.replay.engine import ReplayEngine
import logging

# Initialize Infrastructure
app = FastAPI(title="Antigravity Runtime Core")
telemetry = TelemetryManager()
kernel = LifecycleEngine(telemetry)
replay_engine = ReplayEngine()

# Enable CORS for the desktop app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/tasks")
async def create_task(task: TaskSpec):
    """
    Entry point for the Runtime Kernel.
    Dispatches task specifications to the Lifecycle Engine.
    """
    return await kernel.run_task(task)

@app.websocket("/ws/telemetry")
async def telemetry_endpoint(websocket: WebSocket):
    await telemetry.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        telemetry.disconnect(websocket)

@app.get("/replay/sessions")
async def list_replay_sessions():
    """
    Lists all available execution reports for replay.
    """
    return {"sessions": replay_engine.get_available_sessions()}

@app.websocket("/ws/replay/{session_id}")
async def replay_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        await replay_engine.play_session(session_id, websocket)
        await websocket.close()
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logging.error(f"Replay error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
