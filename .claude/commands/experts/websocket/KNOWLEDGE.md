# WebSocket Expert - Knowledge Base

## Visao Geral

Este agent e especialista no sistema de WebSocket da aplicacao Kanban SDLC. O sistema utiliza WebSocket para:

1. **Sincronizacao de Cards**: Notificar todos os clientes sobre mudancas em cards
2. **Streaming de Execucao**: Enviar logs e status de execucao em tempo real
3. **Chat com IA**: Streaming de respostas do Claude/Gemini

## Arquitetura

```
BACKEND (FastAPI + Uvicorn)
├── Services (Managers de Conexao)
│   ├── card_ws.py - CardWebSocketManager (broadcast global)
│   ├── execution_ws.py - ExecutionWebSocketManager (broadcast por card_id)
│   └── chat_service.py - ChatService (streaming de respostas IA)
│
├── Routes (Endpoints WebSocket)
│   ├── cards_ws.py - ws://localhost:3001/api/cards/ws
│   ├── execution_ws.py - ws://localhost:3001/api/execution/ws/{card_id}
│   └── chat.py - ws://localhost:3001/api/chat/ws/{session_id}
│
└── Integracao com Agents
    ├── agent.py - Notifica execution_ws durante workflows
    └── agent_chat.py - Streaming de respostas para chat

FRONTEND (React)
├── Hooks
│   ├── useCardWebSocket.ts - Sincronizacao de cards
│   ├── useExecutionWebSocket.ts - Logs/status de execucao
│   └── useChat.ts - Chat com IA via WebSocket
│
└── Components
    └── App.tsx - Setup de callbacks WebSocket
```

## Arquivos Core

### Backend - Services

| Arquivo | Responsabilidade |
|---------|------------------|
| `backend/src/services/card_ws.py` | Manager central para sincronizacao de cards. Metodos: `broadcast_card_moved()`, `broadcast_card_updated()`, `broadcast_card_created()`. Gerencia pool global de conexoes. |
| `backend/src/services/execution_ws.py` | Manager para notificacoes de execucao. Metodos: `notify_complete()`, `notify_log()`. Organiza conexoes por `card_id`. |
| `backend/src/services/chat_service.py` | Service para chat com streaming. Metodo: `send_message()` retorna AsyncGenerator. Integra contexto Kanban. |

### Backend - Routes

| Arquivo | Responsabilidade |
|---------|------------------|
| `backend/src/routes/cards_ws.py` | Endpoint `ws://localhost:3001/api/cards/ws`. Aceita conexoes, mantém heartbeats, broadcast de mudancas de cards. |
| `backend/src/routes/execution_ws.py` | Endpoint `ws://localhost:3001/api/execution/ws/{card_id}`. Streaming de logs e status por card. |
| `backend/src/routes/chat.py` | Endpoint `ws://localhost:3001/api/chat/ws/{session_id}`. Recebe mensagens, envia chunks de resposta IA. |

### Backend - Integracao

| Arquivo | Responsabilidade |
|---------|------------------|
| `backend/src/agent.py` | Core de execucao de workflows. Chama `execution_ws_manager.notify_complete()` e `notify_log()` em pontos criticos. |
| `backend/src/agent_chat.py` | Integração com Claude Agent SDK. Metodos `stream_response()` e `_stream_response_gemini()` como AsyncGenerators. |
| `backend/src/main.py` | Setup FastAPI. Registra routers: `cards_ws_router`, `execution_ws_router`, `chat_router`. |

### Frontend - Hooks

| Arquivo | Responsabilidade |
|---------|------------------|
| `frontend/src/hooks/useCardWebSocket.ts` | Hook para sincronizacao de cards. Auto-reconexão com exponential backoff. Callbacks: `onCardMoved`, `onCardUpdated`, `onCardCreated`. |
| `frontend/src/hooks/useExecutionWebSocket.ts` | Hook para logs/status de execucao. Callbacks: `onComplete`, `onLog`. Reconexão com delay de 5s. |
| `frontend/src/hooks/useChat.ts` | Hook para chat com IA. Metodos: `connectWebSocket()`, `sendMessage()`. Streaming de resposta. |

### Frontend - Components

| Arquivo | Responsabilidade |
|---------|------------------|
| `frontend/src/App.tsx` | Componente raiz. Setup de callbacks WebSocket (linhas 104-143). Monitor de conexao para debug. |
| `frontend/src/components/AddCard/AddCard.tsx` | Componente de criacao de cards. Confia no broadcast de `card_created`. |

### Types e Schemas

| Arquivo | Responsabilidade |
|---------|------------------|
| `frontend/src/types/chat.ts` | Tipos para chat: `Message`, `ChatSession`, `ChatState`. |
| `frontend/src/types/index.ts` | Tipos centrais: `Card`, `ActiveExecution`, `TokenStats`, `CostStats`. |
| `backend/src/schemas/chat.py` | Schemas Pydantic: `MessageSchema`, `ChatSessionSchema`, `StreamChunk`. |

## Protocolos WebSocket

### Cards WebSocket

```
Client → Server: (apenas heartbeat/ping)
Server → Client:
  - { type: "card_moved", card: {...}, from_column: "...", to_column: "..." }
  - { type: "card_updated", card: {...} }
  - { type: "card_created", card: {...} }
```

### Execution WebSocket

```
Client → Server: (apenas heartbeat/ping)
Server → Client:
  - { type: "execution_complete", card_id, stage, status, tokenStats?, costStats? }
  - { type: "log", log_type: "stdout"|"stderr"|"info", content: "..." }
```

### Chat WebSocket

```
Client → Server:
  - { type: "message", content: "...", model: "sonnet-4.5" }
Server → Client:
  - { type: "chunk", content: "..." }
  - { type: "end", content: "...", messageId: "..." }
  - { type: "error", content: "..." }
```

## Problemas Conhecidos

1. **Reconexoes Desnecessarias**: Callbacks com dependencias instáveis causam reconexões durante workflows
   - Documentado em: `specs/fix-websocket-reconnection-ui-sync.md`
   - Solucao: Usar refs para callbacks em `useCardWebSocket`

## Dependencias Entre Agents

- **Chat Expert**: Para questoes sobre chat/streaming de mensagens
- **Backend Expert**: Para questoes sobre rotas e services
- **Frontend Expert**: Para questoes sobre hooks e componentes React
