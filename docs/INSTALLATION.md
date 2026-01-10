# Guia de Instalação Detalhado

## Pré-requisitos

### 1. Python 3.9+
```bash
python --version  # Deve mostrar 3.9 ou superior
```

### 2. Node.js 18+
```bash
node --version  # Deve mostrar v18 ou superior
```

### 3. Git
```bash
git --version  # Deve mostrar 2.30 ou superior
```

## Instalação Passo a Passo

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/kanban-agent-orchestrator.git
cd kanban-agent-orchestrator
```

### 2. Instale o Claude Code CLI

#### macOS/Linux
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

#### Windows
```powershell
# Use WSL ou baixe o instalador em claude.ai/download
```

### 3. Configure o Backend

#### Crie ambiente virtual Python
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

#### Instale dependências
```bash
pip install -r requirements.txt
```

#### Configure variáveis de ambiente
```bash
cp .env.example .env
```

Edite `.env` e adicione suas chaves:
- `ANTHROPIC_API_KEY`: Obtenha em https://console.anthropic.com
- `GOOGLE_API_KEY`: (Opcional) Para usar Gemini

### 4. Configure o Frontend

```bash
cd ../frontend
npm install
```

### 5. Instalação Global (Opcional)

Para instalar todas as dependências de uma vez:

```bash
# Na raiz do projeto
npm run setup
```

## Verificando a Instalação

```bash
# Backend
cd backend
python -c "import fastapi; print('FastAPI OK')"
python -c "import claude_agent_sdk; print('Claude SDK OK')"

# Frontend
cd ../frontend
npm list react  # Deve mostrar react@18.x.x
```

## Iniciando o Sistema

### Desenvolvimento
```bash
# Na raiz do projeto
npm run dev
```

### Produção
```bash
# Backend
cd backend
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Frontend (em outro terminal)
cd frontend
npm run build
npm run preview
```
