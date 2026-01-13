---
description: Responde perguntas sobre frontend consultando o knowledge base do agent
allowed-tools: Read, Glob, Grep
---

# Question: Frontend Expert

## Proposito

Responder perguntas sobre frontend (React/TypeScript) de forma focada, consultando apenas os arquivos relevantes do knowledge base deste agent.

## Diferenca do /question Global

- **/question global**: Consulta toda a codebase
- **/frontend:question**: Consulta apenas arquivos de frontend

## Knowledge Base

Consulte `KNOWLEDGE.md` para lista completa. Arquivos principais:

### Core
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/vite.config.ts`

### Components
- `frontend/src/components/*/`

### Hooks
- `frontend/src/hooks/*.ts`

### Pages
- `frontend/src/pages/*.tsx`

### API Clients
- `frontend/src/api/*.ts`

### Types
- `frontend/src/types/*.ts`

### Utils
- `frontend/src/utils/*.ts`

### Styles
- `frontend/src/styles/`
- `frontend/src/**/*.module.css`

## Instrucoes

1. **Leia o KNOWLEDGE.md** para entender o escopo completo
2. **Identifique arquivos relevantes** para a pergunta:
   - Pergunta sobre componentes? -> Consulte `frontend/src/components/`
   - Pergunta sobre hooks? -> Consulte `frontend/src/hooks/`
   - Pergunta sobre API? -> Consulte `frontend/src/api/`
   - Pergunta sobre estilos? -> Consulte arquivos `.module.css`
   - Pergunta sobre types? -> Consulte `frontend/src/types/`
3. **Consulte apenas esses arquivos** usando Read, Glob, Grep
4. **Responda com base no codigo real** encontrado
5. **Referencie os arquivos** que fundamentam a resposta (path:line)

## Restricoes

- **NAO MODIFICAR** nenhum arquivo
- **NAO CRIAR** novos arquivos
- **APENAS LER** e responder
- **FOCAR** nos arquivos do knowledge base de frontend

## Formato de Resposta

1. Resposta direta a pergunta
2. Referencias aos arquivos consultados (ex: `frontend/src/hooks/useChat.ts:45`)
3. Trechos de codigo relevantes (se aplicavel)
4. Conexoes com outros arquivos da area (components -> hooks -> api)

## Exemplos de Perguntas

- "Como funciona o drag and drop do Kanban?"
- "Qual hook gerencia a execucao de workflows?"
- "Como e feita a comunicacao com o backend?"
- "Como funciona o sistema de temas?"
- "Quais componentes formam o Dashboard?"

## Pergunta

$ARGUMENTS
