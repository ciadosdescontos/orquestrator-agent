# Plano de Implementação: Atualização Automática da Página ao Mover Cards

## 1. Resumo

Implementar um sistema de notificação em tempo real via WebSocket para atualizar automaticamente a interface quando um card mudar de coluna, melhorando a experiência de usuário ao eliminar a necessidade de refresh manual. O sistema aproveitará a infraestrutura WebSocket existente e criará um novo canal de broadcast para mudanças de estado dos cards.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar endpoint WebSocket no backend para broadcast de mudanças de cards
- [x] Implementar sistema de notificação quando cards mudarem de coluna
- [x] Atualizar automaticamente a UI sem necessidade de refresh manual
- [x] Garantir sincronização entre múltiplas abas/usuários
- [x] Manter performance sem polling desnecessário

### Fora do Escopo
- Notificações para mudanças em campos individuais do card (título, descrição)
- Sistema de permissões ou autenticação para WebSocket
- Histórico de mudanças ou undo/redo

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/services/card_ws.py` | Criar | WebSocket manager para broadcast de mudanças de cards |
| `backend/src/routes/cards_ws.py` | Criar | Endpoint WebSocket para conectar clientes |
| `backend/src/routes/cards.py` | Modificar | Adicionar notificação WebSocket ao mover cards |
| `backend/src/main.py` | Modificar | Registrar novo endpoint WebSocket |
| `frontend/src/hooks/useCardWebSocket.ts` | Criar | Hook para gerenciar conexão WebSocket de cards |
| `frontend/src/App.tsx` | Modificar | Integrar WebSocket e atualizar cards automaticamente |
| `frontend/src/api/config.ts` | Modificar | Adicionar configuração do endpoint WebSocket |

### Detalhes Técnicos

#### 1. Backend - WebSocket Manager para Cards

Criar `backend/src/services/card_ws.py`:

```python
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
```

#### 2. Backend - Endpoint WebSocket

Criar `backend/src/routes/cards_ws.py`:

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.card_ws import card_ws_manager

router = APIRouter(prefix="/api/cards", tags=["cards-ws"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint para notificações de cards"""
    await card_ws_manager.connect(websocket)
    try:
        while True:
            # Mantém conexão aberta
            await websocket.receive_text()
    except WebSocketDisconnect:
        card_ws_manager.disconnect(websocket)
```

#### 3. Backend - Integrar notificação ao mover cards

Modificar `backend/src/routes/cards.py` no endpoint de move:

```python
@router.patch("/{card_id}/move", response_model=CardSingleResponse)
async def move_card(
    card_id: str,
    move_data: CardMove,
    db: AsyncSession = Depends(get_db)
):
    """Move a card to a different column."""
    repo = CardRepository(db)

    # Get current card state before move
    current_card = await repo.get_by_id(card_id)
    if not current_card:
        raise HTTPException(status_code=404, detail="Card not found")

    from_column = current_card.columnId

    # Perform the move
    card = await repo.move(card_id, move_data.columnId)

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # Broadcast the change via WebSocket
    from ..services.card_ws import card_ws_manager
    card_dict = CardResponse.model_validate(card).model_dump()
    await card_ws_manager.broadcast_card_moved(
        card_id=card_id,
        from_column=from_column,
        to_column=move_data.columnId,
        card_data=card_dict
    )

    return CardSingleResponse(card=CardResponse.model_validate(card))
```

#### 4. Frontend - Hook WebSocket

Criar `frontend/src/hooks/useCardWebSocket.ts`:

```typescript
import { useEffect, useRef, useCallback, useState } from 'react';
import { Card, ColumnId } from '../types';

interface CardMovedMessage {
  type: 'card_moved';
  cardId: string;
  fromColumn: ColumnId;
  toColumn: ColumnId;
  card: Card;
  timestamp: string;
}

interface CardUpdatedMessage {
  type: 'card_updated';
  cardId: string;
  card: Card;
  timestamp: string;
}

type WebSocketMessage = CardMovedMessage | CardUpdatedMessage;

interface UseCardWebSocketProps {
  onCardMoved?: (message: CardMovedMessage) => void;
  onCardUpdated?: (message: CardUpdatedMessage) => void;
  enabled?: boolean;
}

export function useCardWebSocket({
  onCardMoved,
  onCardUpdated,
  enabled = true
}: UseCardWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!enabled) return;

    console.log('[CardWS] Connecting to cards WebSocket...');
    const ws = new WebSocket(`ws://localhost:3001/api/cards/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log('[CardWS] Connected successfully');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[CardWS] Disconnected');

      // Reconnect with exponential backoff
      if (enabled && reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        reconnectAttemptsRef.current++;

        console.log(`[CardWS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('[CardWS] WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'card_moved':
            console.log(`[CardWS] Card ${message.cardId} moved from ${message.fromColumn} to ${message.toColumn}`);
            onCardMoved?.(message);
            break;
          case 'card_updated':
            console.log(`[CardWS] Card ${message.cardId} updated`);
            onCardUpdated?.(message);
            break;
        }
      } catch (error) {
        console.error('[CardWS] Failed to parse message:', error);
      }
    };

    wsRef.current = ws;
  }, [enabled, onCardMoved, onCardUpdated]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return { isConnected };
}
```

#### 5. Frontend - Integração no App.tsx

Adicionar no `App.tsx`:

```typescript
import { useCardWebSocket } from './hooks/useCardWebSocket';

// Dentro do componente App:
function App() {
  // ... existing code ...

  // WebSocket para sincronização de cards em tempo real
  const { isConnected: cardsWsConnected } = useCardWebSocket({
    enabled: true,
    onCardMoved: useCallback(async (message) => {
      console.log(`[App] Card moved via WebSocket: ${message.cardId}`);

      // Atualizar o card na lista local
      setCards(prev => prev.map(card =>
        card.id === message.cardId ? message.card : card
      ));

      // Se for um card com workflow em andamento, pode precisar de ações adicionais
      const workflowStatus = getWorkflowStatus(message.cardId);
      if (workflowStatus && workflowStatus.stage !== 'idle') {
        console.log(`[App] Card ${message.cardId} has active workflow, may need recovery`);
      }
    }, [getWorkflowStatus]),

    onCardUpdated: useCallback((message) => {
      console.log(`[App] Card updated via WebSocket: ${message.cardId}`);

      // Atualizar o card na lista local
      setCards(prev => prev.map(card =>
        card.id === message.cardId ? message.card : card
      ));
    }, [])
  });

  // Indicador de conexão (opcional - para debug)
  useEffect(() => {
    if (cardsWsConnected) {
      console.log('[App] Cards WebSocket connected');
    } else {
      console.log('[App] Cards WebSocket disconnected');
    }
  }, [cardsWsConnected]);

  // ... rest of the component
}
```

---

## 4. Testes

### Unitários
- [ ] Testar CardWebSocketManager broadcast para múltiplas conexões
- [ ] Testar reconexão automática com backoff exponencial
- [ ] Testar atualização de state local quando receber mensagem WebSocket
- [ ] Testar que mudanças locais não causam loops de atualização

### Integração
- [ ] Abrir múltiplas abas e verificar sincronização ao mover cards
- [ ] Testar comportamento quando backend está offline
- [ ] Verificar que workflow automation continua funcionando com WebSocket
- [ ] Testar performance com muitos cards sendo movidos simultaneamente

### Manual
- [ ] Cenário: Dois usuários com Kanban aberto
  - Usuário A move card de Backlog para Plan
  - Usuário B deve ver a mudança instantaneamente
- [ ] Cenário: Workflow em execução
  - Iniciar workflow que move cards automaticamente
  - Outras abas devem ver as mudanças em tempo real
- [ ] Cenário: Reconexão
  - Derrubar backend
  - Verificar tentativas de reconexão
  - Subir backend novamente
  - Verificar reconexão automática

---

## 5. Considerações

### Riscos
- **Sobrecarga de rede:** Muitas mudanças simultâneas podem gerar muito tráfego WebSocket
  - **Mitigação:** Implementar debounce/throttle se necessário

- **Conflitos de estado:** Mudanças simultâneas do mesmo card por diferentes usuários
  - **Mitigação:** Backend é source of truth, UI sempre aceita estado do servidor

- **Compatibilidade:** Nem todos os browsers/ambientes suportam WebSocket
  - **Mitigação:** Manter polling existente como fallback

### Dependências
- Nenhuma biblioteca adicional necessária
- Usa infraestrutura WebSocket já existente no projeto
- Backend FastAPI já tem suporte nativo para WebSocket

### Performance
- WebSocket reduz necessidade de polling, melhorando performance
- Broadcast apenas para cards que mudaram, não lista completa
- Reconexão com backoff evita sobrecarga em caso de instabilidade

### Segurança
- WebSocket não autenticado por enquanto (mesmo comportamento da API atual)
- Broadcast público para todos os clientes conectados
- Futura implementação pode adicionar rooms/channels por projeto