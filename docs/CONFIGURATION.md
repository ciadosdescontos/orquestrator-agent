# Guia de Configuração

## Configuração do Backend

### Variáveis de Ambiente

Crie um arquivo `backend/.env`:

```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...  # Opcional

# Database
DATABASE_URL=sqlite+aiosqlite:///./backend/auth.db
STORE_DB_IN_PROJECT=true
AUTO_MIGRATE_LEGACY_DB=true

# Segurança
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Servidor
HOST=0.0.0.0
PORT=8000
RELOAD=true
```

### Configuração de Modelos IA

Edite `backend/src/config/settings.py`:

```python
class Settings(BaseSettings):
    # Modelos disponíveis
    claude_models = [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229"
    ]

    gemini_models = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ]
```

## Configuração do Frontend

### Variáveis de Ambiente

Crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Personalização da UI

Edite `frontend/src/styles/theme.css`:

```css
:root {
  --primary-color: #0066cc;
  --secondary-color: #28a745;
  --danger-color: #dc3545;
  --dark-bg: #1a1a1a;
  --light-bg: #ffffff;
}
```

## Configuração do Claude Agent SDK

### Comandos Customizados

Crie comandos em `.claude/commands/`:

```markdown
# .claude/commands/meu-comando.md
Descrição do que o comando faz

## Instruções
1. Passo 1
2. Passo 2
```

### Skills Customizadas

Crie skills em `.claude/skills/`:

```markdown
# .claude/skills/minha-skill/SKILL.md
Descrição da skill

## Capabilities
- Capability 1
- Capability 2
```

## Configuração de Git Worktrees

O sistema usa git worktrees para isolar trabalho:

```bash
# Configurar branch base padrão
git config kanban.default-base-branch main

# Habilitar auto-cleanup
git config kanban.auto-cleanup true
```

## Configuração de Segurança

### CORS

Edite `backend/src/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adicione suas origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting

Configure em `backend/src/config/settings.py`:

```python
# Limites de API
max_requests_per_minute = 60
max_concurrent_executions = 3
```
