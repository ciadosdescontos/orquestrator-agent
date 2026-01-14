---
description: "Analisar fluxo de streaming de dados WebSocket (logs, chat, eventos)"
user-invocable: true
---

# WebSocket Expert - Streaming Analysis

Analise o fluxo de streaming de dados no sistema WebSocket.

## Tipos de Streaming

### 1. Streaming de Logs de Execucao

```
Backend (agent.py)
    ↓ notify_log()
ExecutionWebSocketManager
    ↓ broadcast to card_id connections
execution_ws.py endpoint
    ↓ WebSocket message
useExecutionWebSocket hook
    ↓ onLog callback
Frontend UI
```

**Arquivos**:
- `backend/src/agent.py` - Fonte dos logs
- `backend/src/services/execution_ws.py` - Manager de broadcast
- `backend/src/routes/execution_ws.py` - Endpoint
- `frontend/src/hooks/useExecutionWebSocket.ts` - Hook receptor

### 2. Streaming de Chat (Respostas IA)

```
useChat.sendMessage()
    ↓ WebSocket message
chat.py endpoint
    ↓ call
ChatService.send_message()
    ↓ AsyncGenerator yield
agent_chat.stream_response()
    ↓ chunks
chat.py endpoint
    ↓ WebSocket chunks
useChat hook
    ↓ accumulate chunks
Frontend UI
```

**Arquivos**:
- `frontend/src/hooks/useChat.ts` - Inicia e recebe
- `backend/src/routes/chat.py` - Endpoint orchestrator
- `backend/src/services/chat_service.py` - Service com AsyncGenerator
- `backend/src/agent_chat.py` - Streaming do Claude/Gemini

### 3. Streaming de Eventos de Cards

```
Backend action (create/update/move card)
    ↓ broadcast_card_*()
CardWebSocketManager
    ↓ broadcast to all connections
cards_ws.py endpoint
    ↓ WebSocket message
useCardWebSocket hook
    ↓ onCard* callback
Frontend state update
```

**Arquivos**:
- `backend/src/services/card_ws.py` - Manager de broadcast
- `backend/src/routes/cards_ws.py` - Endpoint
- `frontend/src/hooks/useCardWebSocket.ts` - Hook receptor
- `frontend/src/App.tsx` - Callbacks de update

## Problema/Questao

$ARGUMENTS

---

## Instrucoes

1. **Identifique o Tipo de Streaming**:
   - Logs de execucao?
   - Chat com IA?
   - Eventos de cards?

2. **Trace o Fluxo Completo**:
   - De onde os dados originam?
   - Por quais componentes passam?
   - Onde sao consumidos?

3. **Analise o Codigo**:
   - Leia os arquivos do fluxo
   - Identifique pontos de transformacao
   - Verifique handlers e callbacks

4. **Diagnostique ou Explique**:
   - Se for problema: identifique onde o fluxo quebra
   - Se for pergunta: explique o fluxo claramente

## Output Esperado

```
## Analise de Streaming

### Fluxo Analisado
[Tipo de streaming e descricao]

### Trace Completo
1. `arquivo1.py:123` - [acao]
2. `arquivo2.py:456` - [acao]
3. ...

### Transformacoes de Dados
- [Como os dados mudam em cada ponto]

### Conclusao
[Resposta ou diagnostico]
```
