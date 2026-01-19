import json
from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import CodeRequest, CodeResponse
from .sandbox import execute_code
from .complexity import analyze_complexity

app = FastAPI(title="CodeSync Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        # Dict mapping room_id to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        print(f"[Internal] Peer connected to room: {room_id}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, message: str, room_id: str, exclude: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude:
                    try:
                        await connection.send_text(message)
                    except Exception:
                        # Handle stale connections
                        pass

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"status": "online", "engine": "CodeSync-v1.5"}

@app.post("/api/v1/execute", response_model=CodeResponse)
async def run_code(request: CodeRequest):
    output, error = execute_code(request.code)
    complexity_metrics = analyze_complexity(request.code)
    return {
        "output": output,
        "error": error,
        "complexity": complexity_metrics
    }

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the incoming code change to everyone else in the room
            await manager.broadcast(data, room_id, exclude=websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket, room_id)