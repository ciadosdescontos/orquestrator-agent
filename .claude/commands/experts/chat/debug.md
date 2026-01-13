---
allowed-tools: Read, Glob, Grep, Bash
description: Debug de problemas no sistema de chat - WebSocket, conexao, erros
---

# Chat Expert - Debug

Diagnostico problemas no sistema de chat.

## Problemas Comuns

### 1. WebSocket nao conecta
- Verificar se backend esta rodando
- Verificar URL do WebSocket em useChat.ts
- Verificar CORS no backend

### 2. Mensagens nao aparecem
- Verificar streaming no chat_service.py
- Verificar processamento de chunks no useChat.ts
- Verificar estado do ChatMessage.tsx

### 3. Contexto Kanban nao carrega
- Verificar _get_kanban_context() no chat_service.py
- Verificar conexao com banco de dados
- Verificar CardRepository e ActivityRepository

### 4. Modelo IA nao responde
- Verificar API keys (ANTHROPIC_API_KEY, GOOGLE_API_KEY)
- Verificar mapeamento de modelos no agent_chat.py
- Verificar logs do backend

## Arquivos para Investigar

### Backend
| Arquivo | O que Verificar |
|---------|----------------|
| `backend/src/routes/chat.py` | Endpoint WebSocket, tratamento de erros |
| `backend/src/services/chat_service.py` | Logica de sessao, contexto Kanban |
| `backend/src/agent_chat.py` | Integracao com Claude, streaming |
| `backend/src/gemini_agent.py` | Integracao com Gemini |

### Frontend
| Arquivo | O que Verificar |
|---------|----------------|
| `frontend/src/hooks/useChat.ts` | Conexao WebSocket, reconnect, estado |
| `frontend/src/components/Chat/Chat.tsx` | Renderizacao, scroll |
| `frontend/src/api/chat.ts` | URLs da API |

## Problema a Investigar

$ARGUMENTS

## Instrucoes

1. Identifique o tipo de problema (WebSocket, streaming, contexto, modelo)
2. Leia os arquivos relevantes listados acima
3. Busque por:
   - Tratamento de erros (try/except, .catch)
   - Logs existentes (console.log, logger)
   - Estados de erro (isError, error)
4. Sugira solucoes especificas com codigo

## Comandos Uteis

### Verificar backend rodando
```bash
curl http://localhost:8000/api/health
```

### Verificar logs do backend
```bash
# Se rodando com uvicorn
tail -f backend/logs/app.log
```

### Testar WebSocket manualmente
```bash
websocat ws://localhost:8000/api/chat/ws/test-session
```

## Formato da Resposta

```
## Diagnostico

### Problema Identificado
[Descricao do problema]

### Causa Provavel
[Explicacao tecnica]

### Solucao
[Codigo ou passos para resolver]

### Arquivos Afetados
- arquivo.py:123 - O que precisa mudar
```
