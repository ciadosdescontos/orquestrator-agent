---
description: Responde perguntas sobre backend consultando o knowledge base do agent
allowed-tools: Read, Glob, Grep
---

# Question: Backend Expert

## Proposito

Responder perguntas sobre backend (FastAPI/Python) de forma focada, consultando apenas os arquivos relevantes do knowledge base deste agent.

## Diferenca do /question Global

- **/question global**: Consulta toda a codebase
- **/backend:question**: Consulta apenas arquivos de backend

## Knowledge Base

Consulte `KNOWLEDGE.md` para lista completa. Arquivos principais:

### Core
- `backend/src/main.py`
- `backend/src/agent.py`
- `backend/src/agent_chat.py`
- `backend/src/execution.py`

### Routes
- `backend/src/routes/*.py`

### Services
- `backend/src/services/*.py`

### Schemas
- `backend/src/schemas/*.py`

### Config
- `backend/src/config/*.py`

## Instrucoes

1. **Leia o KNOWLEDGE.md** para entender o escopo completo
2. **Identifique arquivos relevantes** para a pergunta:
   - Pergunta sobre rotas? -> Consulte `backend/src/routes/`
   - Pergunta sobre services? -> Consulte `backend/src/services/`
   - Pergunta sobre agent? -> Consulte `backend/src/agent*.py`
   - Pergunta sobre schemas? -> Consulte `backend/src/schemas/`
   - Pergunta sobre config? -> Consulte `backend/src/config/`
3. **Consulte apenas esses arquivos** usando Read, Glob, Grep
4. **Responda com base no codigo real** encontrado
5. **Referencie os arquivos** que fundamentam a resposta (path:line)

## Restricoes

- **NAO MODIFICAR** nenhum arquivo
- **NAO CRIAR** novos arquivos
- **APENAS LER** e responder
- **FOCAR** nos arquivos do knowledge base de backend

## Formato de Resposta

1. Resposta direta a pergunta
2. Referencias aos arquivos consultados (ex: `backend/src/routes/cards.py:45`)
3. Trechos de codigo relevantes (se aplicavel)
4. Conexoes com outros arquivos da area (routes -> services -> schemas)

## Exemplos de Perguntas

- "Como funciona o endpoint de criar card?"
- "Qual service processa o chat?"
- "Como e feito o streaming de logs?"
- "Quais modelos de AI estao disponiveis?"
- "Como funciona o workflow SDLC?"

## Pergunta

$ARGUMENTS
