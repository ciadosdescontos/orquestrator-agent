---
description: "Responde perguntas sobre WebSocket consultando o knowledge base"
user-invocable: true
allowed-tools: Read, Glob, Grep
---

# WebSocket Expert - Question

Responda a pergunta do usuario consultando APENAS os arquivos do knowledge base do WebSocket Expert.

## Knowledge Base

Consulte primeiro: `.claude/commands/experts/websocket/KNOWLEDGE.md`

## Arquivos do Seu Dominio

### Backend - Services
- `backend/src/services/card_ws.py`
- `backend/src/services/execution_ws.py`
- `backend/src/services/chat_service.py`

### Backend - Routes
- `backend/src/routes/cards_ws.py`
- `backend/src/routes/execution_ws.py`
- `backend/src/routes/chat.py`

### Backend - Integracao
- `backend/src/agent.py`
- `backend/src/agent_chat.py`
- `backend/src/main.py`

### Frontend - Hooks
- `frontend/src/hooks/useCardWebSocket.ts`
- `frontend/src/hooks/useExecutionWebSocket.ts`
- `frontend/src/hooks/useChat.ts`

### Frontend - Components
- `frontend/src/App.tsx` (linhas relacionadas a WebSocket)

### Types e Schemas
- `frontend/src/types/chat.ts`
- `frontend/src/types/index.ts`
- `backend/src/schemas/chat.py`

## Pergunta do Usuario

$ARGUMENTS

---

## Instrucoes

1. **Leia o KNOWLEDGE.md** para entender a arquitetura
2. **Identifique arquivos relevantes** para a pergunta
3. **Leia os arquivos** usando a tool Read
4. **Responda com referencias** ao codigo real (arquivo:linha)

### Restricoes

- NAO modifique nenhum arquivo
- NAO consulte arquivos fora do knowledge base
- SEMPRE referencie o codigo fonte nas respostas
- Se a pergunta for sobre outra area, indique qual expert consultar

### Formato de Resposta

```
## Resposta

[Explicacao clara e concisa]

### Referencias no Codigo

- `arquivo.ts:123` - [descricao do que faz]
- `arquivo.py:456` - [descricao do que faz]

### Relacionado

- [Links para outros arquivos ou experts se relevante]
```
