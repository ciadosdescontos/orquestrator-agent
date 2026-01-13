---
allowed-tools: Read, Glob, Grep
description: Analisar fluxo de streaming de mensagens no chat
---

# Chat Expert - Streaming

Analiso o fluxo de streaming de mensagens do chat.

## Arquitetura do Streaming

```
Claude/Gemini API
       │
       ▼ (yield chunks)
agent_chat.py stream_response()
       │
       ▼ (async for)
chat_service.py send_message()
       │
       ▼ (websocket.send_json)
routes/chat.py websocket_endpoint()
       │
       ▼ (WebSocket message)
useChat.ts handleMessage()
       │
       ▼ (setState)
ChatMessage.tsx (render)
```

## Arquivos do Streaming

### Backend

**`backend/src/agent_chat.py`**
- `stream_response()` - Gera chunks da resposta
- Usa Claude Agent SDK ou GeminiAgent
- Yield de strings parciais

**`backend/src/services/chat_service.py`**
- `send_message()` - Orquestra o streaming
- Itera sobre chunks do agent
- Acumula resposta completa

**`backend/src/routes/chat.py`**
- `websocket_endpoint()` - Envia chunks via WebSocket
- Formato: `{"type": "chunk", "content": "..."}`
- Mensagem final: `{"type": "message", "content": "..."}`

### Frontend

**`frontend/src/hooks/useChat.ts`**
- `connectWebSocket()` - Estabelece conexao
- `onmessage` handler - Processa chunks
- Agrupa chunks em mensagem completa
- Atualiza estado com `isStreaming: true`

**`frontend/src/components/Chat/ChatMessage.tsx`**
- Renderiza mensagem
- Mostra cursor animado quando `isStreaming`

## Tipos de Mensagem WebSocket

```typescript
// Chunk parcial
{ type: "chunk", content: "texto parcial" }

// Mensagem completa
{ type: "message", content: "texto completo", timestamp: "..." }

// Erro
{ type: "error", content: "mensagem de erro" }
```

## Problema/Pergunta

$ARGUMENTS

## Instrucoes

1. Leia os arquivos de streaming listados
2. Trace o fluxo do chunk desde a API ate o componente
3. Identifique onde pode estar o problema/responda a pergunta
4. Forneca referencias especificas ao codigo

## Formato da Resposta

```
## Analise do Streaming

### Fluxo Atual
[Descricao do fluxo identificado]

### Arquivos Relevantes
- arquivo.py:linha - Descricao

### [Problema/Resposta]
[Analise detalhada]
```
