---
allowed-tools: Read, Glob, Grep
description: Responde perguntas sobre o sistema de chat consultando o knowledge base
---

# Chat Expert - Question

Respondo perguntas sobre o sistema de chat focando apenas nos arquivos do meu knowledge base.

## Knowledge Base

Primeiro, leia o knowledge base para entender a arquitetura:

```
.claude/commands/experts/chat/KNOWLEDGE.md
```

## Arquivos que Posso Consultar

### Backend
- `backend/src/schemas/chat.py`
- `backend/src/routes/chat.py`
- `backend/src/services/chat_service.py`
- `backend/src/agent_chat.py`
- `backend/src/gemini_agent.py`
- `backend/src/services/card_ws.py`
- `backend/src/routes/cards_ws.py`

### Frontend
- `frontend/src/types/chat.ts`
- `frontend/src/api/chat.ts`
- `frontend/src/hooks/useChat.ts`
- `frontend/src/hooks/useCardWebSocket.ts`
- `frontend/src/components/Chat/*.tsx`
- `frontend/src/components/ChatToggle/*.tsx`
- `frontend/src/pages/ChatPage.tsx`

### Specs
- `specs/chat-kanban-context.md`

## Pergunta do Usuario

$ARGUMENTS

## Instrucoes

1. Leia KNOWLEDGE.md para contexto geral
2. Identifique quais arquivos sao relevantes para a pergunta
3. Leia os arquivos necessarios
4. Responda com referencias ao codigo real (arquivo:linha)
5. NAO modifique nenhum arquivo - apenas leia e responda

## Formato da Resposta

```
## Resposta

[Explicacao clara e concisa]

## Referencias

- `arquivo.py:123` - Descricao do que esta nessa linha
- `arquivo.tsx:45` - Descricao do que esta nessa linha
```
