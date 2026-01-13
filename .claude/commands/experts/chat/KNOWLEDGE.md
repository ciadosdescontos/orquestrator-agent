# Chat Expert - Knowledge Base

## Visao Geral

O sistema de chat e um recurso de conversacao com IA integrado ao Kanban board. Permite ao usuario interagir com assistentes de IA (Claude, Gemini) com contexto automatico do estado atual do Kanban.

## Arquitetura

```
Frontend (React)              Backend (FastAPI)
┌─────────────────┐          ┌──────────────────┐
│ ChatPage.tsx    │          │ routes/chat.py   │
│ Chat.tsx        │◄────────►│ (HTTP + WS)      │
│ useChat.ts      │  WebSocket│                  │
└─────────────────┘          └────────┬─────────┘
                                      │
                             ┌────────▼─────────┐
                             │ chat_service.py  │
                             │ (Sessoes + Ctx)  │
                             └────────┬─────────┘
                                      │
                             ┌────────▼─────────┐
                             │ agent_chat.py    │
                             │ (Claude/Gemini)  │
                             └──────────────────┘
```

## Arquivos Core

### Backend - Python/FastAPI

| Arquivo | Responsabilidade |
|---------|-----------------|
| `backend/src/schemas/chat.py` | Schemas Pydantic: MessageSchema, ChatSessionSchema, SendMessageRequest, StreamChunk |
| `backend/src/routes/chat.py` | Endpoints HTTP e WebSocket: /api/chat/sessions, /api/chat/ws/{session_id} |
| `backend/src/services/chat_service.py` | Logica central: gerenciamento de sessoes, contexto Kanban, streaming |
| `backend/src/agent_chat.py` | Wrapper Claude Agent SDK: ClaudeAgentChat, stream_response(), tools |
| `backend/src/gemini_agent.py` | Integracao Google Gemini: GeminiAgent |
| `backend/src/services/card_ws.py` | WebSocket manager para broadcast de cards: CardWebSocketManager |
| `backend/src/routes/cards_ws.py` | Endpoint WebSocket de cards: /api/cards/ws |

### Frontend - React/TypeScript

| Arquivo | Responsabilidade |
|---------|-----------------|
| `frontend/src/types/chat.ts` | Types: Message, ChatSession, ChatState |
| `frontend/src/api/chat.ts` | API client: createChatSession, getChatHistory, deleteChatSession |
| `frontend/src/hooks/useChat.ts` | Hook principal: estado, WebSocket, streaming, atalhos |
| `frontend/src/hooks/useCardWebSocket.ts` | Hook para sincronizacao de cards em tempo real |
| `frontend/src/components/Chat/Chat.tsx` | Container principal do chat |
| `frontend/src/components/Chat/ChatMessage.tsx` | Componente de mensagem individual |
| `frontend/src/components/Chat/ChatInput.tsx` | Campo de entrada de mensagens |
| `frontend/src/components/Chat/ModelSelector.tsx` | Dropdown de selecao de modelo IA |
| `frontend/src/components/Chat/ModelSelector.types.ts` | Types do ModelSelector |
| `frontend/src/components/ChatToggle/ChatToggle.tsx` | Botao toggle para abrir/fechar |
| `frontend/src/pages/ChatPage.tsx` | Pagina dedicada do chat |
| `frontend/src/App.tsx` | Integracao global (useChat, useCardWebSocket) |

### Estilos CSS

| Arquivo | Responsabilidade |
|---------|-----------------|
| `frontend/src/components/Chat/Chat.module.css` | Estilos do container |
| `frontend/src/components/Chat/ChatMessage.module.css` | Estilos de mensagens |
| `frontend/src/components/Chat/ChatInput.module.css` | Estilos do input |
| `frontend/src/components/Chat/ModelSelector.module.css` | Estilos do dropdown |
| `frontend/src/components/ChatToggle/ChatToggle.module.css` | Estilos do toggle |
| `frontend/src/pages/ChatPage.module.css` | Estilos da pagina |

### Especificacoes

| Arquivo | Responsabilidade |
|---------|-----------------|
| `specs/chat-kanban-context.md` | Especificacao do contexto Kanban injetado no chat |

## Fluxo de Dados

### 1. Envio de Mensagem

```
Usuario digita mensagem
       │
       ▼
ChatInput.tsx (Enter)
       │
       ▼
useChat.ts sendMessage()
       │
       ▼
WebSocket send(JSON)
       │
       ▼
routes/chat.py websocket_endpoint()
       │
       ▼
chat_service.py send_message()
       │
       ├──► _get_kanban_context() → Busca cards e atividades
       │
       ▼
agent_chat.py stream_response()
       │
       ▼
Claude/Gemini API
       │
       ▼
Streaming chunks → WebSocket → useChat → ChatMessage
```

### 2. Contexto Kanban

O chat injeta automaticamente o estado do Kanban no system prompt:

```
=== KANBAN STATUS ===

📋 Backlog (3):
  - "Task title" (ha 2 dias)
    → Task description truncada...

📊 Resumo: 3 backlog | 0 plan | 1 implement | 0 test | 0 review | 2 done

🕐 Ultimas atividades:
  - "Card Title" movido para implement (ha 3h)
```

## Modelos Suportados

### Claude (via Agent SDK)
- `opus-4.5` → claude-opus-4-5
- `sonnet-4.5` → claude-sonnet-4-5
- `haiku-4.5` → claude-haiku-4-5
- `claude-3-sonnet` → claude-3-5-sonnet-latest
- `claude-3-opus` → claude-3-opus-latest

### Gemini (via GeminiAgent)
- `gemini-3-pro`
- `gemini-3-flash`

### OpenAI (config)
- `gpt-4-turbo`

## Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/chat/sessions` | Criar nova sessao |
| GET | `/api/chat/sessions/{session_id}` | Obter historico |
| DELETE | `/api/chat/sessions/{session_id}` | Deletar sessao |
| WS | `/api/chat/ws/{session_id}` | WebSocket para streaming |
| GET | `/api/chat/sessions` | Listar todas (debug) |
| WS | `/api/cards/ws` | WebSocket de cards |

## Tools Disponiveis no Agent

O ClaudeAgentChat disponibiliza estas tools para a IA:
- Read, Bash, Glob, Grep
- WebSearch, WebFetch
- Task, Skill

## Padroes de Codigo

### Backend
- Schemas Pydantic para validacao
- Sessoes em memoria (dict)
- Async/await para operacoes I/O
- Streaming via yield de chunks

### Frontend
- Hooks customizados para logica
- CSS Modules para estilos
- Componentes funcionais React
- WebSocket com reconnect automatico

## Dependencias Internas

- **CardRepository**: Busca cards para contexto
- **ActivityRepository**: Busca atividades recentes
- **Database**: SQLAlchemy async session

## Ultima Atualizacao

2025-01-12
