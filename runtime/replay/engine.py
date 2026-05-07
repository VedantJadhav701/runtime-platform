import os
import json
import asyncio
import logging
from fastapi import WebSocket

logger = logging.getLogger("runtime.replay")

class ReplayEngine:
    """
    Time-travel debugging for orchestration.
    Replays an Execution Graph timeline over a WebSocket connection.
    """
    def __init__(self, workspace_root: str = "."):
        self.workspace_root = os.path.abspath(workspace_root)

    def get_available_sessions(self):
        reports_dir = os.path.join(self.workspace_root, "runtime", "artifacts", "execution_reports")
        if not os.path.exists(reports_dir):
            return []
        
        sessions = []
        for f in os.listdir(reports_dir):
            if f.endswith(".json"):
                sessions.append(f.replace(".json", ""))
        return sessions

    async def play_session(self, session_id: str, websocket: WebSocket, delay_sec: float = 0.5):
        reports_dir = os.path.join(self.workspace_root, "runtime", "artifacts", "execution_reports")
        file_path = os.path.join(reports_dir, f"{session_id}.json")
        
        if not os.path.exists(file_path):
            await websocket.send_json({"error": "Session not found"})
            return

        with open(file_path, "r") as f:
            flight_log = json.load(f)

        graph = flight_log.get("graph")
        if not graph:
            await websocket.send_json({"error": "No execution graph in log"})
            return

        nodes = graph.get("nodes", {})
        
        await websocket.send_json({
            "source": "replay",
            "phase": "IDLE",
            "event_type": "state_transition",
            "message": f"Starting replay of {session_id}",
            "data": {"graph_id": session_id, "old_state": "UNKNOWN", "new_state": "IDLE"}
        })

        sorted_nodes = sorted(nodes.values(), key=lambda x: int(x["id"].split("_")[1]))

        for node in sorted_nodes:
            # Simulate state transition if needed based on action
            action = node["action"]
            phase_map = {
                "SCAFFOLD": "SCAFFOLDING",
                "BOOTSTRAP": "BOOTSTRAPPING",
                "PROVISION": "PROVISIONING",
                "JUDGE": "VALIDATING",
                "REPAIR": "REPAIRING"
            }
            phase = phase_map.get(action, "EXECUTING")

            await websocket.send_json({
                "source": "replay",
                "phase": phase,
                "event_type": "state_transition",
                "message": f"Replay: Transition to {phase}",
                "data": {"graph_id": session_id, "old_state": "UNKNOWN", "new_state": phase}
            })
            await asyncio.sleep(delay_sec)

            # Node Added
            await websocket.send_json({
                "source": "replay",
                "phase": phase,
                "event_type": "node_added",
                "message": f"Replay Node added: {action}",
                "data": {"graph_id": session_id, "node": {"id": node["id"], "action": action, "params": node["params"], "status": "running"}}
            })
            await asyncio.sleep(delay_sec)

            # Node Updated (Completed/Failed)
            await websocket.send_json({
                "source": "replay",
                "phase": phase,
                "event_type": "node_updated",
                "message": f"Replay Node updated: {action} -> {node['status']}",
                "data": {
                    "graph_id": session_id, 
                    "node_id": node["id"], 
                    "status": node["status"], 
                    "output": node.get("output"), 
                    "error": node.get("error")
                }
            })
            await asyncio.sleep(delay_sec)

        final_state = graph.get("state", "COMPLETED")
        await websocket.send_json({
            "source": "replay",
            "phase": final_state,
            "event_type": "state_transition",
            "message": f"Replay finished with state {final_state}",
            "data": {"graph_id": session_id, "old_state": "UNKNOWN", "new_state": final_state}
        })
