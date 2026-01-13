---
description: Debug de problemas de backend (API, services, WebSocket, integracao AI)
allowed-tools: Read, Glob, Grep, Bash
---

# Debug: Backend Expert

## Proposito

Investigar e resolver problemas de backend: erros de API, services, WebSocket, integracao com AI, etc.

## Tipos de Problemas

### 1. Erros de API (Routes)

**Sintomas:**
- 500 Internal Server Error
- 404 Not Found inesperado
- Validation errors

**Investigar:**
```
backend/src/routes/
backend/src/schemas/
```

**Checklist:**
- [ ] Endpoint existe e esta registrado?
- [ ] Schema de request correto?
- [ ] Dependencias injetadas?
- [ ] Response model correto?

### 2. Problemas de Service

**Sintomas:**
- Logica de negocio incorreta
- Erros em processamento
- Dados inconsistentes

**Investigar:**
```
backend/src/services/
```

**Checklist:**
- [ ] Service sendo chamado corretamente?
- [ ] Parametros validos?
- [ ] Error handling adequado?
- [ ] Retorno esperado?

### 3. Problemas de WebSocket

**Sintomas:**
- Conexoes caindo
- Mensagens nao chegando
- Broadcast falhando

**Investigar:**
```
backend/src/routes/*_ws.py
backend/src/services/*_ws.py
```

**Checklist:**
- [ ] accept() chamado?
- [ ] Conexao adicionada ao set?
- [ ] Try/except no send?
- [ ] Cleanup no disconnect?

### 4. Problemas com Agent/AI

**Sintomas:**
- Respostas incorretas
- Timeout em chamadas
- Erros de API key

**Investigar:**
```
backend/src/agent.py
backend/src/agent_chat.py
backend/src/services/chat_service.py
```

**Checklist:**
- [ ] API key configurada?
- [ ] Model correto?
- [ ] Prompt adequado?
- [ ] Tratamento de rate limit?

### 5. Problemas de Banco de Dados

**Para banco de dados, use:**
```
/database:debug
```

### 6. Problemas de Startup

**Sintomas:**
- App nao inicia
- Rotas nao registradas
- Import errors

**Investigar:**
```
backend/src/main.py
backend/src/__init__.py
```

**Checklist:**
- [ ] Imports corretos?
- [ ] Routers incluidos?
- [ ] Startup events executados?
- [ ] Dependencias instaladas?

## Processo de Debug

1. **Identifique o sintoma** exato (erro, status code, etc)
2. **Localize arquivos** relevantes
3. **Leia o codigo** para entender fluxo
4. **Verifique logs** (se disponiveis)
5. **Trace o fluxo** de dados
6. **Proponha fix** baseado na analise

## Comandos Uteis

### Verificar imports
```bash
grep -r "from backend.src" backend/src/
```

### Verificar routers registrados
```bash
grep -r "include_router" backend/src/main.py
```

### Verificar endpoints de uma route
```bash
grep -r "@router\." backend/src/routes/cards.py
```

### Verificar dependencias
```bash
grep -r "Depends" backend/src/routes/
```

### Verificar schemas usados
```bash
grep -r "response_model" backend/src/routes/
```

## Logs e Erros Comuns

### ValidationError
```python
# Problema: Schema nao bate com dados
# Solucao: Verificar campos obrigatorios/opcionais
```

### HTTPException 404
```python
# Problema: Recurso nao encontrado
# Solucao: Verificar ID e query no repository
```

### WebSocketDisconnect
```python
# Problema: Cliente desconectou
# Solucao: Normal, apenas fazer cleanup
```

### ImportError
```python
# Problema: Modulo nao encontrado
# Solucao: Verificar path e __init__.py
```

## Solicitacao

$ARGUMENTS
