---
allowed-tools: Read, Glob, Grep, Edit, Write
description: Entender e modificar o contexto Kanban injetado no chat
---

# Chat Expert - Context

Gerencio o contexto do Kanban que e injetado automaticamente no chat.

## Como Funciona o Contexto

O sistema injeta automaticamente o estado atual do Kanban no system prompt enviado para a IA. Isso permite que a IA:

1. Saiba quais cards existem e em que coluna estao
2. Veja atividades recentes (movimentacoes, criacoes)
3. Responda perguntas sobre o estado do projeto

## Arquivos do Contexto

### Principal
**`backend/src/services/chat_service.py`**
- `_get_kanban_context()` - Busca estado do Kanban
- `get_system_prompt()` - Monta prompt com contexto
- `_format_relative_time()` - Formata timestamps
- `_truncate()` - Trunca textos longos

### Especificacao
**`specs/chat-kanban-context.md`**
- Define formato do contexto
- Define quais dados incluir

### Dependencias
- `CardRepository` - Busca cards do banco
- `ActivityRepository` - Busca atividades recentes

## Formato do Contexto

```
=== KANBAN STATUS ===

📋 Backlog (3):
  - "Task title" (ha 2 dias)
    → Task description truncada...

🔄 In Progress (2):
  - "Another task" (ha 1 hora)

📊 Resumo: 3 backlog | 0 plan | 1 implement | 0 test | 0 review | 2 done

🕐 Ultimas atividades:
  - "Card Title" movido para implement (ha 3h)
  - "New Card" criado (ha 1 dia)
```

## Operacoes

### 1. Entender o contexto atual
Leia `chat_service.py` e `specs/chat-kanban-context.md`

### 2. Modificar formato do contexto
Edite `_get_kanban_context()` em `chat_service.py`

### 3. Adicionar novos dados ao contexto
1. Verifique se os dados existem nos repositories
2. Adicione a busca em `_get_kanban_context()`
3. Atualize o formato no metodo

### 4. Otimizar contexto (reduzir tokens)
- Ajuste `_truncate()` para truncar mais
- Reduza numero de cards por coluna
- Reduza numero de atividades

## Solicitacao

$ARGUMENTS

## Instrucoes

1. Leia `chat_service.py` para entender implementacao atual
2. Leia `specs/chat-kanban-context.md` para entender especificacao
3. Execute a operacao solicitada
4. Se modificar, mantenha consistencia com o formato existente

## Formato da Resposta

```
## Contexto Kanban

### Estado Atual
[Descricao de como o contexto funciona]

### [Acao Realizada]
[O que foi feito ou respondido]

### Arquivos Modificados
- arquivo.py:linha - O que mudou
```
