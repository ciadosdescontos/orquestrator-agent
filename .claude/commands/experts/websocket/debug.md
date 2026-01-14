---
description: "Debug geral de problemas no sistema WebSocket"
user-invocable: true
---

# WebSocket Expert - Debug

Debug de problemas gerais no sistema WebSocket.

## Checklist de Debug

### 1. Verificar Backend

- [ ] Servidor rodando? (`uvicorn` ou `python main.py`)
- [ ] CORS configurado? (`backend/src/main.py`)
- [ ] Routers registrados? (cards_ws, execution_ws, chat)
- [ ] Managers instanciados? (singletons em services)

### 2. Verificar Frontend

- [ ] URL correta? (`ws://localhost:3001/api/...`)
- [ ] Hooks montados? (useEffect com cleanup)
- [ ] Callbacks estáveis? (useCallback ou refs)
- [ ] Estado atualizado? (useState correto)

### 3. Verificar Rede

- [ ] Console do browser (Network > WS)
- [ ] Mensagens sendo enviadas/recebidas?
- [ ] Conexao fecha com codigo de erro?
- [ ] Timeout ou heartbeat falha?

## Arquivos para Debug

### Backend
- `backend/src/main.py` - Setup e CORS
- `backend/src/services/card_ws.py` - CardWebSocketManager
- `backend/src/services/execution_ws.py` - ExecutionWebSocketManager
- `backend/src/services/chat_service.py` - ChatService
- `backend/src/routes/cards_ws.py` - Endpoint cards
- `backend/src/routes/execution_ws.py` - Endpoint execution
- `backend/src/routes/chat.py` - Endpoint chat

### Frontend
- `frontend/src/hooks/useCardWebSocket.ts`
- `frontend/src/hooks/useExecutionWebSocket.ts`
- `frontend/src/hooks/useChat.ts`
- `frontend/src/App.tsx` - Setup de callbacks

### Logs e Specs
- `specs/fix-websocket-reconnection-ui-sync.md` - Bug conhecido

## Problema Reportado

$ARGUMENTS

---

## Instrucoes de Debug

### Passo 1: Entender o Problema

- O que deveria acontecer?
- O que esta acontecendo?
- Quando comecou o problema?
- Ha erros no console?

### Passo 2: Isolar o Componente

1. **Backend ou Frontend?**
   - Teste o endpoint diretamente (wscat, Postman)
   - Se funciona: problema no frontend
   - Se nao funciona: problema no backend

2. **Qual endpoint?**
   - Cards? `/api/cards/ws`
   - Execution? `/api/execution/ws/{card_id}`
   - Chat? `/api/chat/ws/{session_id}`

### Passo 3: Analisar Codigo

Leia os arquivos relevantes e procure por:

- Erros de sintaxe ou logica
- Race conditions
- Memory leaks (conexoes nao fechadas)
- Callbacks instáveis (dependencias de useEffect)
- Broadcasts para conexoes mortas

### Passo 4: Propor Solucao

- Identifique a causa raiz
- Proponha fix com codigo
- Considere efeitos colaterais
- Sugira testes para validar

## Output Esperado

```
## Debug Report

### Problema
[Descricao clara]

### Investigacao
1. [O que foi verificado]
2. [O que foi encontrado]

### Causa Raiz
[Explicacao tecnica]

### Codigo Afetado
- `arquivo.ts:123` - [problema]

### Solucao
[Codigo ou passos]

### Validacao
[Como testar que foi resolvido]
```
