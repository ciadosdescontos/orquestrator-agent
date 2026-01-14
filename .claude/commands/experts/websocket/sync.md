---
description: "Sincroniza o knowledge base do WebSocket Expert quando houver mudancas no codigo"
user-invocable: true
---

# WebSocket Expert - Sync

Atualize o knowledge base do WebSocket Expert detectando mudancas nos arquivos monitorados.

## Arquivos Monitorados

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
- `frontend/src/App.tsx`

### Types e Schemas
- `frontend/src/types/chat.ts`
- `frontend/src/types/index.ts`
- `backend/src/schemas/chat.py`

## Processo de Sincronizacao

### Passo 1: Verificar Arquivos Existentes

Verifique se todos os arquivos do knowledge base ainda existem:

```bash
# Verificar cada arquivo listado acima
```

### Passo 2: Detectar Novos Arquivos

Procure por novos arquivos relacionados a WebSocket:

```bash
# Backend - novos services ou routes com "ws" ou "websocket"
glob: backend/src/**/*ws*.py
glob: backend/src/**/*websocket*.py
glob: backend/src/**/*socket*.py

# Frontend - novos hooks com "WebSocket" ou "Socket"
glob: frontend/src/hooks/*WebSocket*.ts
glob: frontend/src/hooks/*Socket*.ts

# Types relacionados
grep: "WebSocket" em frontend/src/types/
grep: "socket" em backend/src/schemas/
```

### Passo 3: Analisar Mudancas

Para cada arquivo que mudou ou foi criado:

1. Identifique a responsabilidade do arquivo
2. Verifique se adiciona novos endpoints, hooks, ou types
3. Documente mudancas significativas na arquitetura

### Passo 4: Atualizar KNOWLEDGE.md

Se houver mudancas:

1. Adicione novos arquivos as tabelas apropriadas
2. Remova arquivos que nao existem mais
3. Atualize descricoes se responsabilidades mudaram
4. Atualize diagramas de arquitetura se necessario

### Passo 5: Atualizar Sub-comandos

Se paths mudaram:

1. Atualize referencias em `question.md`
2. Atualize referencias em outros sub-comandos

## Instrucoes

Execute a sincronizacao agora:

1. Use Glob para verificar arquivos existentes
2. Use Grep para encontrar novos arquivos WebSocket
3. Compare com KNOWLEDGE.md atual
4. Reporte mudancas encontradas
5. Se houver mudancas, atualize KNOWLEDGE.md

## Output Esperado

```
## Resultado da Sincronizacao

### Arquivos Verificados
- [x] backend/src/services/card_ws.py - OK
- [x] ... (todos os arquivos)

### Novos Arquivos Encontrados
- (lista de novos arquivos, se houver)

### Arquivos Removidos
- (lista de arquivos que nao existem mais, se houver)

### Acoes Tomadas
- (lista de atualizacoes feitas no KNOWLEDGE.md)

### Status
[OK - Knowledge base atualizado] ou [OK - Nenhuma mudanca necessaria]
```
