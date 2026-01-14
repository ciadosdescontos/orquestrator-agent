---
description: "Debugar problemas de conexao WebSocket, reconexao, ou gerenciamento de pool"
user-invocable: true
---

# WebSocket Expert - Connection Debug

Debugue problemas de conexao WebSocket no sistema.

## Contexto

O sistema tem 3 tipos de conexoes WebSocket:

1. **Cards WebSocket** (`ws://localhost:3001/api/cards/ws`)
   - Conexao global para todos os clientes
   - Auto-reconexao com exponential backoff
   - Pool gerenciado em `card_ws.py`

2. **Execution WebSocket** (`ws://localhost:3001/api/execution/ws/{card_id}`)
   - Conexao por card_id
   - Reconexao com delay de 5s
   - Pool organizado por card_id em `execution_ws.py`

3. **Chat WebSocket** (`ws://localhost:3001/api/chat/ws/{session_id}`)
   - Conexao por sessao de chat
   - Gerenciado pelo hook `useChat.ts`

## Arquivos Relevantes

### Backend - Managers de Pool
- `backend/src/services/card_ws.py` - `CardWebSocketManager.active_connections`
- `backend/src/services/execution_ws.py` - `ExecutionWebSocketManager.connections`

### Backend - Endpoints
- `backend/src/routes/cards_ws.py` - Aceita conexoes, heartbeat, desconexao
- `backend/src/routes/execution_ws.py` - Conexao por card_id
- `backend/src/routes/chat.py` - Conexao por session_id

### Frontend - Hooks de Reconexao
- `frontend/src/hooks/useCardWebSocket.ts` - Exponential backoff (linhas de reconnect)
- `frontend/src/hooks/useExecutionWebSocket.ts` - Reconnect com delay
- `frontend/src/hooks/useChat.ts` - `connectWebSocket()`

## Problemas Conhecidos

1. **Reconexoes Desnecessarias**: Callbacks instáveis causam reconexões
   - Spec: `specs/fix-websocket-reconnection-ui-sync.md`
   - Causa: Dependencias de useEffect mudam frequentemente
   - Solucao: Usar refs para callbacks

## Problema Reportado

$ARGUMENTS

---

## Instrucoes

1. **Identifique o Tipo de Problema**:
   - Conexao nao estabelece?
   - Reconexoes frequentes?
   - Conexao cai inesperadamente?
   - Pool de conexoes com vazamento?

2. **Leia os Arquivos Relevantes**:
   - Para problemas de backend: services e routes
   - Para problemas de frontend: hooks

3. **Analise o Codigo**:
   - Verifique logica de conexao/desconexao
   - Verifique cleanup de conexoes
   - Verifique dependencias de useEffect

4. **Proponha Solucao**:
   - Identifique a causa raiz
   - Sugira correcao com codigo
   - Referencie linhas especificas

## Output Esperado

```
## Diagnostico

### Problema Identificado
[Descricao clara do problema]

### Causa Raiz
[Explicacao tecnica da causa]

### Arquivos Afetados
- `arquivo.ts:123` - [o que esta errado]

### Solucao Proposta
[Codigo ou passos para corrigir]

### Prevencao
[Como evitar este problema no futuro]
```
