---
description: Criar ou modificar endpoints WebSocket seguindo padroes do projeto
allowed-tools: Read, Write, Edit, Glob, Grep
---

# WebSocket: Backend Expert

## Proposito

Criar ou modificar endpoints WebSocket para comunicacao real-time.

## WebSockets Existentes

### Cards WebSocket
```
backend/src/routes/cards_ws.py
backend/src/services/card_ws.py
Endpoint: /ws/cards
```

### Execution WebSocket
```
backend/src/routes/execution_ws.py
backend/src/services/execution_ws.py
Endpoint: /ws/execution/{execution_id}
```

## Padroes do Projeto

### Route WebSocket

```python
# backend/src/routes/nova_ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.src.services.nova_ws import NovaWSManager

router = APIRouter()
manager = NovaWSManager()


@router.websocket("/ws/nova")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket para updates de Nova."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.websocket("/ws/nova/{item_id}")
async def websocket_item_endpoint(websocket: WebSocket, item_id: str):
    """WebSocket para updates de um item especifico."""
    await manager.connect(websocket, item_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(websocket, data, item_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, item_id)
```

### Service WebSocket

```python
# backend/src/services/nova_ws.py
from fastapi import WebSocket
from typing import Dict, Set, Optional
import logging
import json

logger = logging.getLogger(__name__)


class NovaWSManager:
    """Gerenciador de conexoes WebSocket para Nova."""

    def __init__(self):
        # Conexoes globais
        self.active_connections: Set[WebSocket] = set()
        # Conexoes por item
        self.item_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, item_id: Optional[str] = None):
        """Aceita nova conexao WebSocket."""
        await websocket.accept()

        if item_id:
            if item_id not in self.item_connections:
                self.item_connections[item_id] = set()
            self.item_connections[item_id].add(websocket)
            logger.info(f"WebSocket connected for item {item_id}")
        else:
            self.active_connections.add(websocket)
            logger.info("WebSocket connected (global)")

    def disconnect(self, websocket: WebSocket, item_id: Optional[str] = None):
        """Remove conexao WebSocket."""
        if item_id and item_id in self.item_connections:
            self.item_connections[item_id].discard(websocket)
            if not self.item_connections[item_id]:
                del self.item_connections[item_id]
        else:
            self.active_connections.discard(websocket)

    async def handle_message(
        self,
        websocket: WebSocket,
        data: dict,
        item_id: Optional[str] = None
    ):
        """Processa mensagem recebida."""
        message_type = data.get("type")

        if message_type == "ping":
            await websocket.send_json({"type": "pong"})
        elif message_type == "subscribe":
            # Handle subscription
            pass
        else:
            logger.warning(f"Unknown message type: {message_type}")

    async def broadcast(self, message: dict):
        """Envia mensagem para todas as conexoes globais."""
        for connection in self.active_connections.copy():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting: {e}")
                self.active_connections.discard(connection)

    async def broadcast_to_item(self, item_id: str, message: dict):
        """Envia mensagem para conexoes de um item especifico."""
        if item_id not in self.item_connections:
            return

        for connection in self.item_connections[item_id].copy():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to item {item_id}: {e}")
                self.item_connections[item_id].discard(connection)


# Instancia global para uso em outras partes do codigo
nova_ws_manager = NovaWSManager()
```

## Tipos de Mensagens

### Padrao de Mensagem

```python
# Cliente -> Servidor
{
    "type": "subscribe" | "unsubscribe" | "ping" | "action",
    "data": { ... }
}

# Servidor -> Cliente
{
    "type": "update" | "error" | "pong",
    "data": { ... },
    "timestamp": "2024-01-01T00:00:00Z"
}
```

### Exemplo: Card Update

```python
{
    "type": "card_updated",
    "data": {
        "id": "card-123",
        "column_id": "implement",
        "title": "Nova feature"
    }
}
```

## Instrucoes

### Para CRIAR novo WebSocket:

1. **Crie a route** em `backend/src/routes/nova_ws.py`
2. **Crie o manager** em `backend/src/services/nova_ws.py`
3. **Defina tipos de mensagem** (subscribe, update, etc)
4. **Registre no main.py**
5. **Documente o protocolo**

### Para MODIFICAR WebSocket existente:

1. **Leia route e service** existentes
2. **Mantenha compatibilidade** com clientes
3. **Adicione novos tipos** de mensagem
4. **Atualize documentacao**

## Checklist de Qualidade

- [ ] Try/except em todas as operacoes de send
- [ ] Cleanup de conexoes mortas
- [ ] Logging de conexoes/desconexoes
- [ ] Tratamento de WebSocketDisconnect
- [ ] Tipos de mensagem documentados
- [ ] Instancia global exportada

## Solicitacao

$ARGUMENTS
