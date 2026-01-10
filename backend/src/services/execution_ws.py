"""WebSocket manager para notificacoes de execucao em tempo real"""
from typing import Dict, Set
from fastapi import WebSocket
import json
from datetime import datetime


class ExecutionWebSocketManager:
    def __init__(self):
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, card_id: str, websocket: WebSocket):
        await websocket.accept()
        if card_id not in self.connections:
            self.connections[card_id] = set()
        self.connections[card_id].add(websocket)

    def disconnect(self, card_id: str, websocket: WebSocket):
        if card_id in self.connections:
            self.connections[card_id].discard(websocket)

    async def broadcast(self, card_id: str, message: dict):
        if card_id not in self.connections:
            return

        dead = set()
        for ws in self.connections[card_id]:
            try:
                await ws.send_text(json.dumps(message))
            except:
                dead.add(ws)

        for ws in dead:
            self.connections[card_id].discard(ws)

    async def notify_complete(self, card_id: str, status: str, command: str,
                              token_stats: dict = None, cost_stats: dict = None, error: str = None):
        await self.broadcast(card_id, {
            "type": "execution_complete",
            "cardId": card_id,
            "status": status,
            "command": command,
            "tokenStats": token_stats,
            "costStats": cost_stats,
            "error": error,
            "timestamp": datetime.now().isoformat()
        })

    async def notify_log(self, card_id: str, log_type: str, content: str):
        await self.broadcast(card_id, {
            "type": "log",
            "cardId": card_id,
            "logType": log_type,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })


execution_ws_manager = ExecutionWebSocketManager()
