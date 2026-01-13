"""WebSocket manager para notificações de mudanças em cards"""
from typing import Dict, Set
from fastapi import WebSocket
import json
from datetime import datetime


class CardWebSocketManager:
    def __init__(self):
        # Conexões globais para broadcast geral
        self.global_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.global_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.global_connections.discard(websocket)

    async def broadcast_card_moved(self, card_id: str,
                                   from_column: str,
                                   to_column: str,
                                   card_data: dict = None):
        """Notifica todos os clientes conectados sobre movimentação de card"""
        message = {
            "type": "card_moved",
            "cardId": card_id,
            "fromColumn": from_column,
            "toColumn": to_column,
            "card": card_data,
            "timestamp": datetime.now().isoformat()
        }

        await self._broadcast_to_all(message)

    async def broadcast_card_updated(self, card_id: str, card_data: dict):
        """Notifica sobre atualização de card (experts, specs, etc)"""
        message = {
            "type": "card_updated",
            "cardId": card_id,
            "card": card_data,
            "timestamp": datetime.now().isoformat()
        }

        await self._broadcast_to_all(message)

    async def broadcast_card_created(self, card_id: str, card_data: dict):
        """Notifica todos os clientes conectados sobre criação de novo card"""
        message = {
            "type": "card_created",
            "cardId": card_id,
            "card": card_data,
            "timestamp": datetime.now().isoformat()
        }

        await self._broadcast_to_all(message)

    async def _broadcast_to_all(self, message: dict):
        """Envia mensagem para todos os clientes conectados"""
        dead = set()
        for ws in self.global_connections:
            try:
                await ws.send_text(json.dumps(message))
            except:
                dead.add(ws)

        # Remove conexões mortas
        for ws in dead:
            self.global_connections.discard(ws)


card_ws_manager = CardWebSocketManager()
