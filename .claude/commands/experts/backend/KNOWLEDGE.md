# Backend Expert - Knowledge Base

## Tecnologia

- **Framework**: FastAPI
- **Linguagem**: Python 3.11+
- **Agent SDK**: claude-agent-sdk
- **Validacao**: Pydantic 2.0
- **Async**: asyncio, aiohttp
- **AI Alternativo**: google-generativeai (Gemini)

## Estrutura de Diretorios

```
backend/src/
├── main.py              # Entry point, rotas, startup
├── agent.py             # Claude Agent principal
├── agent_chat.py        # Chat interface
├── agent_persistence.py # Persistencia de agent state
├── execution.py         # Execucao de comandos
├── project_manager.py   # Gerenciamento de projetos
├── git_workspace.py     # Git worktrees
├── gemini_agent.py      # Integracao Gemini
├── cache.py             # Sistema de cache
├── config/              # Configuracoes
├── routes/              # API routes
├── services/            # Business logic
├── schemas/             # Pydantic schemas
├── models/              # SQLAlchemy models (ver /database)
└── repositories/        # Data access (ver /database)
```

## Arquivos Core

### Entry Points

| Arquivo | Responsabilidade |
|---------|-----------------|
| `backend/src/main.py` | FastAPI app, routers, startup/shutdown events, CORS |

### Agents

| Arquivo | Responsabilidade |
|---------|-----------------|
| `backend/src/agent.py` | Claude Agent principal - workflows SDLC (plan, implement, test, review) |
| `backend/src/agent_chat.py` | Interface de chat com AI, streaming de respostas |
| `backend/src/agent_persistence.py` | Persistencia de estado do agent entre sessoes |
| `backend/src/gemini_agent.py` | Integracao com Google Gemini como alternativa |

### Core Services

| Arquivo | Responsabilidade |
|---------|-----------------|
| `backend/src/execution.py` | Execucao de comandos shell, captura de output |
| `backend/src/project_manager.py` | Load/switch projetos, projeto ativo |
| `backend/src/git_workspace.py` | Git worktrees para branches isoladas |
| `backend/src/cache.py` | Cache em memoria com TTL |

### Routes (API)

| Arquivo | Endpoints | Descricao |
|---------|-----------|-----------|
| `routes/cards.py` | `/api/cards/*` | CRUD de cards, execucao de workflows |
| `routes/chat.py` | `/api/chat/*` | Chat com AI, streaming |
| `routes/projects.py` | `/api/projects/*` | Load/switch/list projetos |
| `routes/metrics.py` | `/api/metrics/*` | Dashboard metrics |
| `routes/activities.py` | `/api/activities/*` | Activity feed |
| `routes/experts.py` | `/api/experts/*` | Experts API |
| `routes/settings.py` | `/api/settings/*` | App settings |
| `routes/images.py` | `/api/images/*` | Upload de imagens |
| `routes/cards_ws.py` | `/ws/cards` | WebSocket para updates de cards |
| `routes/execution_ws.py` | `/ws/execution/{id}` | WebSocket para logs de execucao |

### Services

| Arquivo | Responsabilidade |
|---------|-----------------|
| `services/chat_service.py` | Logica do chat, formatacao de mensagens |
| `services/expert_triage_service.py` | Identificacao de experts relevantes |
| `services/expert_sync_service.py` | Sincronizacao de knowledge bases |
| `services/diff_analyzer.py` | Analise de git diffs |
| `services/cost_calculator.py` | Calculo de custos de tokens |
| `services/card_ws.py` | WebSocket broadcast de cards |
| `services/execution_ws.py` | WebSocket broadcast de execucao |
| `services/test_result_analyzer.py` | Analise de resultados de testes |
| `services/auto_cleanup_service.py` | Limpeza automatica de cards |
| `services/migration_service.py` | Migrations SQL (ver /database) |
| `services/metrics_collector.py` | Coleta de metricas (ver /database) |
| `services/metrics_aggregator.py` | Agregacao de metricas (ver /database) |

### Schemas (Pydantic)

| Arquivo | DTOs principais |
|---------|-----------------|
| `schemas/card.py` | CardCreate, CardUpdate, CardResponse, ExecutionRequest |
| `schemas/chat.py` | ChatMessage, ChatRequest, ChatResponse |
| `schemas/expert.py` | Expert, ExpertCommand, TriageResult |
| `schemas/auth.py` | Token, User |

### Config

| Arquivo | Responsabilidade |
|---------|-----------------|
| `config/settings.py` | Settings via pydantic-settings, env vars |
| `config/pricing.py` | Precos por modelo (Claude, Gemini) |
| `config/experts.py` | Configuracao de experts disponiveis |

## Endpoints Principais

### Cards API

```
GET    /api/cards           # Listar cards
POST   /api/cards           # Criar card
GET    /api/cards/{id}      # Obter card
PUT    /api/cards/{id}      # Atualizar card
DELETE /api/cards/{id}      # Deletar card
POST   /api/cards/{id}/move # Mover card entre colunas
POST   /api/cards/{id}/execute/{stage}  # Executar workflow stage
```

### Chat API

```
POST   /api/chat            # Enviar mensagem (streaming)
GET    /api/chat/history    # Historico do chat
DELETE /api/chat/history    # Limpar historico
```

### Projects API

```
GET    /api/projects        # Listar projetos recentes
POST   /api/projects/load   # Carregar projeto
GET    /api/projects/active # Projeto ativo
POST   /api/projects/unload # Descarregar projeto
```

### Metrics API

```
GET    /api/metrics/dashboard  # Metricas do dashboard
GET    /api/metrics/daily      # Metricas diarias
GET    /api/metrics/execution  # Metricas por execucao
```

### WebSocket

```
WS     /ws/cards              # Updates de cards em tempo real
WS     /ws/execution/{id}     # Logs de execucao streaming
```

## Workflow SDLC

O agent.py implementa o workflow SDLC completo:

```
1. PLAN      -> Gera especificacao em specs/*.md
2. IMPLEMENT -> Implementa baseado na spec
3. TEST      -> Executa testes e valida
4. REVIEW    -> Revisa implementacao final
```

### Stages e Modelos

```python
ModelType = Literal[
    "claude-opus-4-5",
    "claude-sonnet-4-5",
    "claude-haiku-4-5",
    "gemini-2.5-pro",
    "gemini-2.5-flash"
]
```

Cada stage pode usar modelo diferente configurado no card.

## Padroes de Codigo

### Criando nova Route

```python
# backend/src/routes/nova_route.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.database import get_session
from backend.src.schemas.nova import NovaCreate, NovaResponse

router = APIRouter(prefix="/api/nova", tags=["nova"])

@router.get("/", response_model=list[NovaResponse])
async def list_items(db: AsyncSession = Depends(get_session)):
    # Implementacao
    pass

@router.post("/", response_model=NovaResponse)
async def create_item(data: NovaCreate, db: AsyncSession = Depends(get_session)):
    # Implementacao
    pass
```

### Registrando no main.py

```python
# backend/src/main.py
from backend.src.routes.nova_route import router as nova_router

app.include_router(nova_router)
```

### Criando novo Service

```python
# backend/src/services/nova_service.py
from typing import Optional

class NovaService:
    def __init__(self, config: Optional[dict] = None):
        self.config = config or {}

    async def process(self, data: dict) -> dict:
        # Logica de negocio
        return result
```

### Criando novo Schema

```python
# backend/src/schemas/nova.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NovaBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None

class NovaCreate(NovaBase):
    pass

class NovaResponse(NovaBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### WebSocket Pattern

```python
# backend/src/routes/nova_ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Set

router = APIRouter()
active_connections: Set[WebSocket] = set()

@router.websocket("/ws/nova")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Process and broadcast
            for conn in active_connections:
                await conn.send_json({"type": "update", "data": data})
    except WebSocketDisconnect:
        active_connections.discard(websocket)
```

## Integracao com Claude Agent SDK

```python
from claude_agent_sdk import Agent, Tool

agent = Agent(
    model="claude-sonnet-4-5-20250514",
    tools=[...],
    system_prompt="..."
)

response = await agent.run(prompt)
```

## Configuracao (Environment)

```bash
# .env
DATABASE_URL=sqlite+aiosqlite:///./auth.db
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## Dependencias

- `fastapi>=0.109.0`
- `uvicorn[standard]>=0.27.0`
- `claude-agent-sdk>=0.1.0`
- `pydantic>=2.0.0`
- `pydantic-settings>=2.0.0`
- `python-jose[cryptography]>=3.3.0`
- `passlib[bcrypt]>=1.7.4`
- `sqlalchemy>=2.0.0` (ver /database)
- `aiosqlite>=0.19.0` (ver /database)
- `google-generativeai>=0.3.0`
- `toml>=0.10.2`
