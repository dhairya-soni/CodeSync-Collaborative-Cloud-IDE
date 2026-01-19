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

# In-memory room manager for simple demo
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, message: str, room_id: str, exclude: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude:
                    await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "CodeSync Engine API is running.",
        "endpoints": {
            "execution": "/api/v1/execute",
            "websocket": "/ws/{room_id}"
        }
    }

@app.post("/api/v1/execute", response_model=CodeResponse)
async def run_code(request: CodeRequest):
    try:
        # 1. Execute code in sandboxed container
        output, error = execute_code(request.code)
        
        # 2. Analyze complexity via AST
        complexity_metrics = analyze_complexity(request.code)
        
        return {
            "output": output,
            "error": error,
            "complexity": complexity_metrics
        }
    except Exception as e:
        print(f"Execution Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, room_id, exclude=websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)