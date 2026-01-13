---
allowed-tools: Read, Glob, Grep, Edit, Write
description: Sincroniza o knowledge base do Chat Expert quando houver mudancas no codigo
---

# Chat Expert - Sync

Atualizo o knowledge base do Chat Expert quando o codigo muda.

## Processo de Sincronizacao

### 1. Detectar Mudancas

Verifico se houve alteracoes nos arquivos do chat:

**Backend:**
```
backend/src/schemas/chat.py
backend/src/routes/chat.py
backend/src/services/chat_service.py
backend/src/agent_chat.py
backend/src/gemini_agent.py
backend/src/services/card_ws.py
backend/src/routes/cards_ws.py
```

**Frontend:**
```
frontend/src/types/chat.ts
frontend/src/api/chat.ts
frontend/src/hooks/useChat.ts
frontend/src/hooks/useCardWebSocket.ts
frontend/src/components/Chat/**/*.tsx
frontend/src/components/ChatToggle/**/*.tsx
frontend/src/pages/ChatPage.tsx
```

### 2. Buscar Novos Arquivos

Procuro por novos arquivos relacionados ao chat:

```
**/chat*.py
**/chat*.ts
**/chat*.tsx
**/*Chat*.tsx
**/useChat*.ts
```

### 3. Atualizar KNOWLEDGE.md

Se encontrar mudancas:
1. Atualizo a lista de arquivos
2. Atualizo as responsabilidades
3. Atualizo o diagrama se a arquitetura mudou
4. Atualizo a data de "Ultima Atualizacao"

## Instrucoes

Execute a sincronizacao:

1. **Glob** para encontrar todos os arquivos de chat atuais
2. **Read** KNOWLEDGE.md atual
3. **Compare** arquivos encontrados vs documentados
4. **Read** arquivos novos/modificados para entender responsabilidades
5. **Edit** KNOWLEDGE.md com as atualizacoes

## Output Esperado

```
## Sync Report

### Arquivos Adicionados
- path/novo_arquivo.py - Descricao

### Arquivos Removidos
- path/arquivo_removido.py

### Arquivos Atualizados
- path/arquivo.py - O que mudou

### KNOWLEDGE.md
[Atualizado/Sem mudancas]
```
