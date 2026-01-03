# 🎯 Orquestrator Agent - Kanban + Claude Agent SDK

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.11.0-brightgreen.svg)

Um sistema completo de gerenciamento de desenvolvimento com Kanban visual integrado ao Claude Agent SDK, combinando um framework de workflow estruturado (**plan → implement → test → review**) com interface web interativa.

## 📋 Table of Contents

1. [Visão Geral](#-visão-geral)
2. [Features](#-features)
3. [Quick Start](#-quick-start)
4. [Instalação Detalhada](#-instalação-detalhada)
5. [Como Usar](#-como-usar)
6. [Configuração Avançada](#️-configuração-avançada)
7. [Estrutura do Projeto](#-estrutura-do-projeto)
8. [API Endpoints](#-api-endpoints)
9. [Troubleshooting](#-troubleshooting)
10. [Framework de Workflow](#-framework-de-workflow)
11. [Contribuindo](#-contribuindo)
12. [Licença](#-licença)

---

## 🎯 Visão Geral

O **Orquestrator Agent** é um sistema completo que une:

- **Kanban Board Visual**: Interface React moderna com drag-and-drop para gerenciar tarefas de desenvolvimento
- **Claude Agent SDK**: Integração nativa com Claude para executar comandos de workflow automatizados
- **Framework de Workflow Estruturado**: Sistema de comandos e specs para desenvolvimento profissional (plan → implement → test → review)
- **Persistência de Dados**: Backend FastAPI com banco SQLite para armazenar cards, specs e histórico

### O Diferencial

Ao invés de apenas conversar com Claude Code no terminal, você tem:
- ✅ Interface visual para organizar tarefas (Backlog → Plan → Implement → Test → Review → Done)
- ✅ Execução de comandos diretamente dos cards do Kanban
- ✅ Upload de imagens para contexto visual (mockups, screenshots, diagramas)
- ✅ Seleção de modelos Claude por card (Opus/Sonnet/Haiku)
- ✅ Documentação viva em `specs/` com checkboxes rastreáveis
- ✅ Histórico de execuções e logs persistidos

---

## ✨ Features

### Kanban Board
- 🎨 Interface visual moderna com React + TypeScript + Vite
- 🖱️ Drag-and-drop entre colunas ([@dnd-kit](https://dndkit.com/))
- 📝 Criação e edição de cards com rich text
- 🖼️ Upload de imagens para contexto (mockups, diagramas, screenshots)
- 🎯 Colunas: Backlog → Plan → Implement → Test → Review → Done
- 🔄 Sincronização automática com backend

### Integração com Claude
- 🤖 Claude Agent SDK integrado no backend
- 🎭 Seleção de modelo por card (Opus 4.5, Sonnet 4.5, Haiku)
- ⚡ Execução de comandos diretamente da interface:
  - `/plan` - Criar especificação técnica
  - `/implement` - Implementar seguindo spec
  - `/test-implementation` - Validar e testar
  - `/review` - Revisar qualidade
  - `/dev-workflow` - Workflow completo automatizado
- 📊 Logs em tempo real da execução
- 📂 Specs geradas automaticamente em `specs/`

### Workflow Estruturado
- 📝 Sistema de especificações técnicas vivas
- ✅ Checkboxes rastreáveis para objetivos e testes
- 🔄 Workflow profissional completo (plan → implement → test → review)
- 📚 Comandos e skills customizáveis
- 🎯 Padrões consistentes mantidos automaticamente

---

## 🚀 Quick Start

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** 18.0 ou superior ([Download](https://nodejs.org/))
  ```bash
  node --version  # Deve mostrar v18.x.x ou superior
  ```

- **Python** 3.11 ou superior ([Download](https://python.org/))
  ```bash
  python --version  # Deve mostrar Python 3.11.x ou superior
  ```

- **Claude API Key** ([Obter chave](https://console.anthropic.com/))
  - Crie uma conta na Anthropic
  - Gere uma API key
  - Guarde em local seguro

- **Git** ([Download](https://git-scm.com/))

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/orquestrator-agent.git
cd orquestrator-agent

# Instale todas as dependências (root + frontend + backend)
npm run setup

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env com sua configuração (veja próxima seção)

# Execute o projeto (frontend + backend simultaneamente)
npm run dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação da API**: http://localhost:3001/docs

---

## 📦 Instalação Detalhada

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/orquestrator-agent.git
cd orquestrator-agent
```

### 2. Configurar Dependências Raiz

```bash
# Instalar concurrently (para rodar frontend + backend simultaneamente)
npm install
```

### 3. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# O frontend usa:
# - React 18 + TypeScript
# - Vite (build tool)
# - @dnd-kit (drag-and-drop)
# - lucide-react (ícones)
```

### 4. Configurar o Backend

```bash
cd ../backend

# Criar ambiente virtual Python
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# O backend usa:
# - FastAPI (framework web)
# - Uvicorn (servidor ASGI)
# - Claude Agent SDK (integração Claude)
# - SQLAlchemy + aiosqlite (banco de dados)
# - Pydantic (validação de dados)
```

### 5. Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com suas configurações:

```bash
# JWT Configuration (para autenticação futura)
JWT_SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=sqlite+aiosqlite:///./auth.db

# Server
PORT=3001

# Claude API (ADICIONE ESTA LINHA!)
CLAUDE_API_KEY=sk-ant-api03-...  # Sua chave da Anthropic
```

**Importante**: A chave `CLAUDE_API_KEY` é **obrigatória** para integração com Claude.

### 6. Executar o Projeto

**Opção 1: Rodar tudo simultaneamente (Recomendado)**

```bash
# Na raiz do projeto
npm run dev
```

Isso inicia:
- Frontend (Vite dev server) em http://localhost:3000
- Backend (FastAPI + Uvicorn) em http://localhost:3001

**Opção 2: Rodar separadamente**

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

---

## 🎨 Como Usar

### Interface do Kanban

Ao abrir http://localhost:3000, você verá:

```
┌──────────────────────────────────────────────────────────┐
│  🎯 Orquestrator Agent                    [+ Novo Card]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────┐  ┌──────┐  ┌───────────┐  ┌──────┐  ┌──────┐│
│  │Backlog │  │ Plan │  │ Implement │  │ Test │  │Review││
│  ├────────┤  ├──────┤  ├───────────┤  ├──────┤  ├──────┤│
│  │ Card 1 │  │      │  │           │  │      │  │      ││
│  │ Card 2 │  │      │  │           │  │      │  │      ││
│  └────────┘  └──────┘  └───────────┘  └──────┘  └──────┘│
└──────────────────────────────────────────────────────────┘
```

### Workflow de Desenvolvimento

#### 1. Criar um Card no Backlog

```
1. Clique em "+ Novo Card"
2. Preencha:
   - Título: "Adicionar autenticação JWT"
   - Descrição: "Implementar sistema de login com JWT..."
   - Modelo: Opus 4.5 (para planejamento detalhado)
   - Imagens: [Opcional] Upload de mockup da tela de login
3. Card aparece na coluna "Backlog"
```

#### 2. Arrastar para "Plan"

```
1. Arraste o card para a coluna "Plan"
2. Clique no card → "Executar /plan"
3. Claude analisa o projeto e cria spec em specs/auth-jwt.md
4. Spec inclui:
   - Resumo executivo
   - Objetivos com checkboxes
   - Arquivos a criar/modificar
   - Detalhes técnicos (código, schemas)
   - Testes necessários
```

#### 3. Implementar (Coluna "Implement")

```
1. Arraste o card para "Implement"
2. Clique no card → "Executar /implement"
3. Claude:
   - Lê a spec criada
   - Implementa cada arquivo
   - Cria testes
   - Atualiza checkboxes na spec
4. Você vê logs em tempo real na interface
```

#### 4. Testar (Coluna "Test")

```
1. Arraste o card para "Test"
2. Clique no card → "Executar /test-implementation"
3. Claude executa:
   - Verificação de arquivos
   - Testes unitários (npm test, pytest, etc)
   - Linting e type checking
   - Build
4. Gera relatório de qualidade
```

#### 5. Revisar (Coluna "Review")

```
1. Arraste o card para "Review"
2. Clique no card → "Executar /review"
3. Claude analisa:
   - Aderência à spec
   - Qualidade do código
   - Padrões e consistência
   - Cobertura de testes
4. Sugere melhorias específicas
```

#### 6. Concluído (Coluna "Done")

```
1. Se tudo passou: arraste para "Done"
2. Spec fica arquivada em specs/
3. Card mantém histórico de execuções
```

### Apontando para Seu Projeto

O Orquestrator Agent pode trabalhar com **qualquer projeto** em sua máquina:

**Opção 1: Configurar via interface (TODO - feature futura)**
```
- Clique no botão "Projeto" no header
- Selecione ou digite o caminho do seu projeto
- O sistema salvará a configuração
```

**Opção 2: Configurar via variável de ambiente**

```bash
# No arquivo backend/.env, adicione:
PROJECT_PATH=/Users/seu-usuario/meu-projeto
```

**Estrutura esperada do projeto alvo:**
- Pode ser **qualquer projeto** (Node, Python, Go, Rust, etc.)
- O sistema criará automaticamente a pasta `specs/` no seu projeto
- Comandos `/plan`, `/implement`, etc. serão executados na raiz do projeto configurado
- Arquivos de código são criados/modificados no projeto alvo

**Exemplo de uso:**

```bash
# Seu projeto atual
/Users/eduardo/meu-app/
├── src/
├── tests/
└── package.json

# Configure PROJECT_PATH=/Users/eduardo/meu-app

# Após executar /plan no Orquestrator:
/Users/eduardo/meu-app/
├── src/
├── tests/
├── specs/              # ← Criado automaticamente
│   └── feature-x.md    # ← Spec gerada
└── package.json
```

---

## 🛠️ Configuração Avançada

### Modelos por Card

Você pode escolher qual modelo Claude usar para cada card:

| Modelo | Uso Recomendado | Custo | Velocidade |
|--------|-----------------|-------|------------|
| **Opus 4.5** | Planejamento (análise profunda de codebase) | Alto | Lenta |
| **Sonnet 4.5** | Implementação (balanço custo/qualidade) | Médio | Média |
| **Haiku** | Testes e Review (tarefas bem definidas) | Baixo | Rápida |

**Como configurar:**
1. Ao criar/editar card, selecione modelo no dropdown
2. Modelo é salvo com o card
3. Execuções usam modelo configurado

### Upload de Imagens

Adicione contexto visual aos cards:

**Casos de uso:**
- 📱 Mockups de UI/UX
- 📊 Diagramas de arquitetura
- 🐛 Screenshots de bugs
- 📈 Gráficos de referência

**Como usar:**
1. Ao criar/editar card → "Upload Imagem"
2. Selecione arquivo (PNG, JPG, GIF)
3. Imagem é salva localmente em `backend/.uploaded_images/`
4. Claude visualiza imagem durante execução de comandos

### Comandos Disponíveis

| Comando | Descrição | Modelo Padrão |
|---------|-----------|---------------|
| `/plan` | Cria especificação técnica detalhada | Opus 4.5 |
| `/implement` | Implementa seguindo spec | Sonnet 4.5 |
| `/test-implementation` | Valida arquivos, executa testes | Haiku |
| `/review` | Revisa código vs spec | Haiku |
| `/dev-workflow` | Executa plan → implement → test → review | Múltiplos |
| `/question` | Responde perguntas sobre o projeto (read-only) | Sonnet 4.5 |

---

## 📚 Estrutura do Projeto

```
orquestrator-agent/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── CardModal.tsx
│   │   │   └── ...
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # FastAPI + Claude SDK
│   ├── src/
│   │   ├── api/             # Endpoints da API
│   │   │   ├── cards.py
│   │   │   ├── execute.py   # Execução de comandos Claude
│   │   │   └── auth.py
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── services/        # Lógica de negócio
│   │   └── main.py          # App FastAPI
│   ├── requirements.txt
│   ├── .env.example
│   └── auth.db              # Banco SQLite
│
├── specs/                    # Especificações técnicas geradas
│   ├── auth-jwt.md
│   ├── refactor-cache.md
│   └── ...
│
├── .claude/                  # Framework de Workflow
│   ├── commands/            # Slash commands
│   │   ├── plan.md
│   │   ├── implement.md
│   │   ├── test-implementation.md
│   │   ├── review.md
│   │   ├── dev-workflow.md
│   │   └── question.md
│   └── skills/              # Skills customizados
│       ├── dev-workflow/
│       ├── frontend-design/
│       └── meta-command/
│
├── docs/                     # Documentação
│   ├── EXAMPLES.md
│   ├── EXTENDING.md
│   └── ARCHITECTURE.md
│
├── package.json             # Scripts raiz
└── README.md                # Este arquivo
```

---

## 🔌 API Endpoints

### Cards

**GET** `/api/cards`
- Lista todos os cards do Kanban
- Response: `Card[]`

**POST** `/api/cards`
- Cria novo card
- Body: `{ title, description, column, model?, images? }`
- Response: `Card`

**PUT** `/api/cards/:id`
- Atualiza card existente
- Body: `{ title?, description?, column?, model?, images? }`
- Response: `Card`

**DELETE** `/api/cards/:id`
- Deleta card
- Response: `{ success: true }`

### Execução de Comandos

**POST** `/api/execute-plan`
- Executa `/plan` para um card
- Body: `{ cardId, description, model? }`
- Response: `{ specPath, logs }`

**POST** `/api/execute-implement`
- Executa `/implement` seguindo spec
- Body: `{ cardId, specPath, model? }`
- Response: `{ updatedSpec, logs }`

**POST** `/api/execute-test`
- Executa `/test-implementation`
- Body: `{ cardId, specPath }`
- Response: `{ report, logs }`

**POST** `/api/execute-review`
- Executa `/review`
- Body: `{ cardId, specPath }`
- Response: `{ review, logs }`

### Autenticação (TODO - Feature futura)

**POST** `/api/auth/login`
- Login de usuário
- Body: `{ username, password }`
- Response: `{ accessToken, refreshToken }`

---

## 🐛 Troubleshooting

### Erro: CLAUDE_API_KEY não definida

**Sintoma**: Erro ao executar comandos Claude na interface

```
Error: Claude API key not configured
```

**Solução**:
1. Verifique se o arquivo `backend/.env` existe
2. Confirme que contém: `CLAUDE_API_KEY=sk-ant-api03-...`
3. Reinicie o servidor backend: `npm run dev:backend`
4. Recarregue a página do frontend

### Porta já em uso

**Sintoma**: Erro "Port 3000 is already in use" ou "Port 3001 is already in use"

**Solução**:

```bash
# Encontrar processo usando a porta
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar o processo ou usar porta diferente

# Opção 1: Mudar porta do frontend
# Em frontend/vite.config.ts:
server: {
  port: 3002
}

# Opção 2: Mudar porta do backend
# Em backend/.env:
PORT=3003
```

### Erro de CORS

**Sintoma**: Erros de CORS no console do navegador

```
Access to fetch at 'http://localhost:3001/api/cards' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solução**:

Verifique que o backend está configurado corretamente. Em `backend/src/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Comandos Claude não executam

**Sintoma**: Ao clicar em "Executar /plan" nada acontece

**Checklist**:
1. ✅ Backend está rodando? Verifique http://localhost:3001/docs
2. ✅ `CLAUDE_API_KEY` está configurada no `.env`?
3. ✅ Arquivos em `.claude/commands/` existem?
4. ✅ Verifique console do navegador e logs do backend

**Debug**:

```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/cards

# Verificar comandos disponíveis
ls .claude/commands/

# Ver logs do backend em tempo real
npm run dev:backend
```

### Specs não são criadas

**Sintoma**: Execução de `/plan` completa mas arquivo `specs/` não aparece

**Solução**:

1. Verifique permissões de escrita na pasta `specs/`:
   ```bash
   mkdir -p specs
   chmod 755 specs
   ```

2. Se `PROJECT_PATH` está configurado, verifique se o caminho existe:
   ```bash
   # Em backend/.env
   PROJECT_PATH=/caminho/que/existe
   ```

3. Verifique logs do backend para erros de I/O

### Upload de imagens falha

**Sintoma**: Erro ao fazer upload de imagem no card

**Solução**:

```bash
# Criar pasta de uploads
mkdir -p backend/.uploaded_images
chmod 755 backend/.uploaded_images

# Verificar tamanho máximo (default: 10MB)
# Se precisar aumentar, edite backend/src/api/cards.py
```

---

## 📚 Framework de Workflow

O Orquestrator Agent inclui um **framework completo de desenvolvimento** estruturado baseado em comandos e skills do Claude Code.

### The Four-Phase Workflow

```
┌─────────┐      ┌───────────┐      ┌──────┐      ┌────────┐
│  PLAN   │ ---> │ IMPLEMENT │ ---> │ TEST │ ---> │ REVIEW │
└─────────┘      └───────────┘      └──────┘      └────────┘
     📝               💻              ✅             🔍
```

### Sistema de Specs

Todas as especificações geradas ficam em `specs/` com formato padronizado:

```markdown
---
name: nome-da-feature
type: feature|bug|refactor|documentation
priority: high|medium|low
created_at: YYYY-MM-DD
---

# Plano: Título Descritivo

## 1. Resumo
Breve descrição (2-3 frases) do que será implementado.

## 2. Objetivos e Escopo
### Objetivos
- [ ] Objetivo 1
- [ ] Objetivo 2

### Fora do Escopo
- Item não incluído

## 3. Implementação
### Arquivos a Serem Modificados/Criados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `path/to/file.ts` | Criar | Descrição |

### Detalhes Técnicos
Código, snippets, decisões arquiteturais...

## 4. Testes
### Unitários
- [ ] Teste 1
- [ ] Teste 2

## 5. Considerações
Riscos, dependências, observações...
```

### Comandos do Framework

Todos os comandos estão em `.claude/commands/`:

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `/plan` | Analisa codebase e cria spec técnica detalhada | Antes de implementar features/bugs |
| `/implement` | Implementa seguindo spec, atualiza checkboxes | Após ter spec pronta |
| `/test-implementation` | Valida arquivos, executa testes, gera relatório | Após implementação |
| `/review` | Revisa código vs spec, sugere melhorias | Antes de mergear |
| `/dev-workflow` | Executa todos os comandos acima sequencialmente | Automação completa |
| `/question` | Responde perguntas sobre o projeto (read-only) | Explorar codebase |

### Skills Customizados

Skills são agentes especializados em `.claude/skills/`:

- **dev-workflow**: Automação completa (plan → implement → test → review)
- **frontend-design**: Criação de UI production-grade com alta qualidade de design
- **meta-command**: Gera novos skills e comandos personalizados

### Uso via Terminal

Você também pode usar o framework diretamente no terminal:

```bash
# Inicie Claude Code
claude

# Execute workflow completo
/dev-workflow adicionar autenticação JWT

# Ou comandos individuais
/plan refatorar sistema de cache
/implement specs/refactor-cache.md
/test-implementation specs/refactor-cache.md
/review specs/refactor-cache.md
```

Para documentação completa do framework, veja as seções abaixo preservadas do README original.

---

## 🎯 O que é isso?

### Em uma frase

Um framework de desenvolvimento estruturado que automatiza o ciclo completo de software (planejamento, implementação, testes e revisão) usando Claude Code e mantém documentação viva de todas as suas implementações.

### Por que usar?

- ✅ **Estrutura clara** - Desenvolva em 4 fases bem definidas (plan → implement → test → review)
- ✅ **Documentação viva** - Cada feature tem sua spec em `specs/` com checkboxes rastreáveis
- ✅ **Testes automatizados** - Executa e valida testes em cada implementação
- ✅ **Revisão de código** - Compara implementação vs especificação automaticamente
- ✅ **Extensível** - Crie seus próprios comandos e skills customizados
- ✅ **Padrões consistentes** - Mantém consistência arquitetural em todo o projeto

### O que este framework NÃO é

- ❌ Não é um substituto para Claude Code (é uma extensão dele)
- ❌ Não é obrigatório usar todos os comandos (use o que fizer sentido)
- ❌ Não é uma ferramenta de CI/CD (mas pode complementar)

---

## 🚀 Quick Start

### Pré-requisitos

1. Claude Code CLI instalado ([instruções](https://docs.anthropic.com/claude/docs/claude-code))
2. Node.js 18+ (se trabalhar com projetos JavaScript/TypeScript)
3. Git (para versionamento e comandos de revisão)

### Instalação

**Opção 1: Copiar estrutura para seu projeto**

```bash
# Clone este repositório
git clone https://github.com/seu-usuario/orquestrator-agent.git

# Copie a pasta .claude para seu projeto
cp -r orquestrator-agent/.claude /caminho/do/seu/projeto/

# Copie a pasta docs (opcional, mas recomendado)
cp -r orquestrator-agent/docs /caminho/do/seu/projeto/
```

**Opção 2: Usar como template**

```bash
# Use este repositório como template no GitHub
# Depois clone para sua máquina
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto
```

### Verificação

```bash
# Dentro do seu projeto, liste os comandos disponíveis
ls .claude/commands/

# Você deve ver:
# dev-workflow.md
# implement.md
# plan.md
# question.md
# review.md
# test-implementation.md
```

### Seu Primeiro Workflow

Vamos criar uma feature simples do zero:

```bash
# 1. Inicie o Claude Code
claude

# 2. Execute o workflow completo (plan → implement → test → review)
/dev-workflow adicionar função de validação de email
```

O Claude irá:
1. 📝 Criar um plano detalhado em `specs/validacao-email.md`
2. 💻 Implementar a função seguindo o plano
3. ✅ Criar e executar testes
4. 🔍 Revisar a implementação contra a spec

**Pronto!** Você acabou de completar seu primeiro ciclo de desenvolvimento estruturado.

---

## 📚 Conceitos Fundamentais

### The Four-Phase Workflow

```
┌─────────┐      ┌───────────┐      ┌──────┐      ┌────────┐
│  PLAN   │ ---> │ IMPLEMENT │ ---> │ TEST │ ---> │ REVIEW │
└─────────┘      └───────────┘      └──────┘      └────────┘
     📝               💻              ✅             🔍
```

#### 1. **PLAN** - Planejamento Detalhado
- Analisa a codebase para entender padrões existentes
- Cria especificação técnica completa em `specs/<nome>.md`
- Define arquivos, estruturas de dados, testes e considerações
- **Modelo recomendado**: Opus 4.5 (análise profunda)

#### 2. **IMPLEMENT** - Implementação Guiada
- Lê o arquivo de spec criado na fase anterior
- Implementa cada item seguindo a ordem definida
- Atualiza checkboxes `- [ ]` → `- [x]` conforme progride
- Mantém consistência com padrões da codebase
- **Modelo recomendado**: Sonnet 4.5 (velocidade + qualidade)

#### 3. **TEST** - Validação e Testes
- Verifica se arquivos foram criados/modificados conforme spec
- Executa testes unitários e de integração
- Roda linter, type checker e build
- Gera relatório detalhado de qualidade
- **Modelo recomendado**: Haiku (rápido para validação)

#### 4. **REVIEW** - Revisão de Qualidade
- Compara implementação vs especificação original
- Identifica divergências, lacunas e melhorias
- Avalia aderência a padrões arquiteturais
- Sugere correções específicas com localização no código
- **Modelo recomendado**: Haiku (análise crítica eficiente)

### Sistema de Specs

Todas as especificações ficam em `specs/` com formato padronizado:

```markdown
---
name: nome-da-feature
type: feature|bug|refactor|documentation
priority: high|medium|low
created_at: YYYY-MM-DD
---

# Plano: Título Descritivo

## 1. Resumo
Breve descrição (2-3 frases) do que será implementado.

## 2. Objetivos e Escopo
### Objetivos
- [ ] Objetivo 1
- [ ] Objetivo 2

### Fora do Escopo
- Item não incluído

## 3. Implementação
### Arquivos a Serem Modificados/Criados
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `path/to/file.ts` | Criar | Descrição |

### Detalhes Técnicos
Código, snippets, decisões arquiteturais...

## 4. Testes
### Unitários
- [ ] Teste 1
- [ ] Teste 2

## 5. Considerações
Riscos, dependências, observações...
```

**Benefícios do sistema de specs:**
- ✅ Documentação sempre atualizada (checkboxes refletem progresso real)
- ✅ Rastreabilidade de decisões técnicas
- ✅ Onboarding facilitado para novos desenvolvedores
- ✅ Base para retrospectivas e auditorias

---

## 🛠️ Comandos Disponíveis

### `/dev-workflow` - Ciclo Completo de Desenvolvimento

**Quando usar:** Quando você quer automação completa do planejamento até revisão.

**Sintaxe:**
```bash
/dev-workflow [descrição da feature ou bug]
```

**Exemplo:**
```bash
/dev-workflow adicionar autenticação com JWT
```

**O que faz:**
1. Executa `/plan` para criar especificação
2. Executa `/implement` para implementar o plano
3. Executa `/test-implementation` para validar
4. Executa `/review` para revisar código
5. Apresenta resumo final com próximos passos

**Modelo:** Usa modelos diferentes para cada fase (Opus/Sonnet/Haiku) otimizando custo e qualidade.

---

### `/plan` - Criar Planos de Implementação

**Quando usar:** Quando você quer planejar antes de implementar, ou revisar uma abordagem.

**Sintaxe:**
```bash
/plan [descrição da tarefa]
```

**Exemplo:**
```bash
/plan refatorar sistema de cache para usar Redis
```

**O que faz:**
1. Pergunta detalhes se a descrição for vaga
2. Analisa toda a codebase para manter padrões
3. Cria `specs/<nome-descritivo>.md` com:
   - Resumo executivo
   - Objetivos e escopo
   - Arquivos a modificar/criar
   - Detalhes técnicos com snippets
   - Testes necessários
   - Considerações (riscos, dependências)

**Modelo:** Opus 4.5 (configurável por card na UI)

**Ferramentas permitidas:** Read, Glob, Grep, Write, Task

**Exemplo de output:**
```
✅ Plano criado: specs/refactor-cache-redis.md

📋 Resumo:
- 8 arquivos para modificar
- 3 novos arquivos a criar
- 12 testes unitários necessários
- Migração gradual sem downtime
```

---

### `/implement` - Executar Planos

**Quando usar:** Quando você tem uma spec pronta e quer implementá-la.

**Sintaxe:**
```bash
/implement [caminho/para/spec.md]
```

**Exemplo:**
```bash
/implement specs/refactor-cache-redis.md
```

**O que faz:**
1. Lê arquivo de spec especificado
2. Extrai lista de arquivos e objetivos
3. Implementa cada item na ordem definida
4. Atualiza checkboxes `- [ ]` → `- [x]` no arquivo de spec
5. Apresenta resumo do que foi feito

**Modelo:** Sonnet 4.5 (configurável por card na UI)

**Fases de implementação:**
1. **Análise** - Lê spec completo e cria lista de tarefas
2. **Implementação** - Cria/modifica arquivos seguindo detalhes técnicos
3. **Testes** - Implementa testes unitários e de integração
4. **Finalização** - Verifica objetivos e atualiza checkboxes

**Regras importantes:**
- ✅ Sempre lê o arquivo de plano antes de implementar
- ✅ Segue ordem definida no plano
- ✅ Atualiza checkboxes conforme progride
- ✅ Mantém consistência com padrões existentes
- ❌ Nunca pula etapas definidas no plano

---

### `/test-implementation` - Validar e Testar

**Quando usar:** Após implementação, para validar se tudo está funcionando.

**Sintaxe:**
```bash
/test-implementation [caminho/para/spec.md]
```

**Exemplo:**
```bash
/test-implementation specs/refactor-cache-redis.md
```

**O que faz:**

**Fase 1: Verificação de Arquivos**
- Verifica se arquivos listados na spec existem
- Compara se foram criados/modificados conforme esperado
- Status: ✅ OK | ❌ Ausente | ⚠️ Divergente

**Fase 2: Verificação de Checkboxes**
- Calcula taxa de conclusão (X/Y concluídos)
- Lista itens pendentes

**Fase 3: Execução de Testes**
- Detecta test runner automaticamente (npm test, pytest, cargo test, go test)
- Executa testes unitários e de integração
- Captura resultados: ✅ Passando | ❌ Falhando | ⏭️ Pulados

**Fase 4: Análise de Qualidade**
- Lint/formatação (eslint, prettier, black)
- Type check (tsc, mypy)
- Build (npm run build, cargo build)

**Fase 5: Cobertura (Opcional)**
- Analisa cobertura de código se configurada

**Modelo:** Haiku (configurável por card na UI)

**Exemplo de relatório:**
```markdown
# Relatório de Validação: refactor-cache-redis

## Resumo Executivo
| Métrica | Status |
|---------|--------|
| Arquivos | 11/11 criados/modificados ✅ |
| Checkboxes | 23/25 concluídos ⚠️ |
| Testes | 12 passando ✅ |
| Build | ✅ |
| Lint | ✅ |

## Checkboxes Pendentes
- [ ] Adicionar documentação do endpoint /cache/stats
- [ ] Configurar Redis sentinel para HA

## Conclusão
✅ APROVADO COM RESSALVAS
Implementação está funcional, mas faltam 2 itens de documentação.
```

---

### `/review` - Revisão de Qualidade

**Quando usar:** Para análise crítica e profunda da implementação vs spec.

**Sintaxe:**
```bash
/review [caminho/para/spec.md]
```

**Exemplo:**
```bash
/review specs/refactor-cache-redis.md
```

**O que faz:**

**Fase 1: Inventário de Arquivos**
- Compara arquivos especificados vs implementados
- Identifica arquivos extras (não na spec)
- Arquivos com implementação divergente

**Fase 2: Análise de Aderência**
- Estrutura do código (classes, funções, tipos)
- Lógica de negócio (comportamento esperado)
- Padrões e convenções (nomenclatura, arquitetura)

**Fase 3: Verificação de Objetivos**
- Classifica cada objetivo como:
  - ✅ Completo
  - 🟡 Parcial
  - 🔄 Divergente
  - ❌ Ausente

**Fase 4: Revisão de Qualidade**
- **Consistência** - Código uniforme e sem duplicação
- **Robustez** - Tratamento de erros adequado
- **Legibilidade** - Código claro e compreensível
- **Decisões Arquiteturais** - Alinhamento com spec

**Fase 5: Verificação de Testes**
- Testes especificados existem?
- Cobrem cenários descritos?
- Qualidade dos testes

**Modelo:** Haiku (configurável por card na UI)

**Diferença para `/test-implementation`:**
- `/test-implementation` → Foca em **executar testes** e verificar se funciona
- `/review` → Foca em **analisar código** e verificar se faz sentido

**Exemplo de output:**
```markdown
# Revisão: refactor-cache-redis

## Resumo Executivo
| Aspecto | Status | Observação |
|---------|--------|------------|
| Arquivos | 11/11 implementados ✅ | Todos presentes |
| Objetivos | 7/8 atendidos ⚠️ | Falta doc |
| Aderência | Alta ✅ | Segue spec fielmente |
| Qualidade | Boa ✅ | Código limpo |

## Problemas Encontrados
### Importantes
1. **Falta tratamento de conexão perdida**
   - Localização: `src/cache/redis.ts:45`
   - Impacto: App pode crashar se Redis cair
   - Sugestão: Adicionar retry logic com exponential backoff

## Pontos Positivos
- Excelente separação de concerns
- Testes cobrem casos de borda
- Documentação inline clara

## Conclusão
✅ APROVADO COM RESSALVAS
Adicionar retry logic antes de mergear.
```

---

### `/question` - Análise de Projeto

**Quando usar:** Para entender estrutura, padrões ou documentação **sem fazer mudanças**.

**Sintaxe:**
```bash
/question [sua pergunta]
```

**Exemplo:**
```bash
/question onde fica a lógica de autenticação?
/question quais são os padrões de nomenclatura usados?
/question como funciona o sistema de cache?
```

**O que faz:**
1. Executa `git ls-files` para mapear estrutura
2. Lê README e documentação relevante
3. Analisa código relacionado à pergunta
4. Responde com explicações conceituais + referências

**Ferramentas permitidas:** Bash (git), Read (somente leitura)

**Importante:** Este comando **NÃO modifica arquivos**, apenas analisa e responde.

---

## 🎨 Sistema de Skills

Skills são agentes especializados que executam tarefas complexas com autonomia. Diferente dos comandos (que são instruções), skills têm acesso a ferramentas específicas e seguem workflows pré-definidos.

### Skills Disponíveis

#### **dev-workflow** - Automação Completa de Desenvolvimento

**Descrição:** Executa workflow completo (plan → implement → test → review) sequencialmente.

**Quando usar:**
```bash
# Via skill (invocação automática)
"Quero implementar um sistema de notificações por email"

# Via comando slash
/dev-workflow sistema de notificações por email
```

**Características:**
- Totalmente automatizado (sem interrupções)
- Usa modelo otimizado para cada fase
- Transparência sobre cada etapa
- Correção automática de erros críticos

---

#### **frontend-design** - Criação de UI de Alta Qualidade

**Descrição:** Cria interfaces frontend distintivas e production-grade que evitam estéticas genéricas de IA.

**Quando usar:**
- Construir componentes, páginas ou aplicações web
- Quando quer design criativo e polido (não genérico)

**Características:**
- Escolhas tipográficas únicas (evita Inter, Roboto, Arial)
- Paletas de cores criativas (não clichês)
- Animações e micro-interações
- Composições espaciais inesperadas
- Código production-ready (HTML/CSS/JS, React, Vue)

**Diretrizes de design:**
- Typography: Fontes distintivas, pares complementares
- Motion: Animações CSS-first, scroll-trigger, hover states
- Spatial: Layouts assimétricos, overlap, negative space
- Backgrounds: Gradients, noise, patterns, shadows, grain

**Exemplo:**
```
"Crie um dashboard de analytics com estética brutalist e tipografia bold"
```

---

#### **meta-command** - Criação de Skills e Comandos

**Descrição:** Gera skills e comandos personalizados para Claude Code.

**Quando usar:**
- Criar novo Agent Skill
- Gerar template de slash command
- Estruturar skills multi-arquivo
- Validar skills existentes

**Ferramentas:** Read, Write, Glob, Grep, Bash

**Workflow de criação:**
1. Coleta requisitos (nome, descrição, escopo, ferramentas)
2. Cria estrutura de diretórios
3. Gera SKILL.md com frontmatter YAML
4. Adiciona arquivos de suporte (TEMPLATES.md, EXAMPLES.md)
5. Valida sintaxe YAML
6. Fornece instruções de uso

**Exemplo:**
```bash
# Criar skill para análise de commits Git
"Crie um skill para analisar commits do git e gerar changelog"

# Criar comando personalizado
"Crie um comando /security-audit para verificar vulnerabilidades"
```

**Estruturas geradas:**

```
# Skill pessoal (disponível em todos os projetos)
~/.claude/skills/git-commit-analyzer/
├── SKILL.md
├── TEMPLATES.md
└── EXAMPLES.md

# Skill de projeto (compartilhado com equipe)
.claude/skills/security-auditor/
├── SKILL.md
└── scripts/
    └── scan.py

# Slash command
.claude/commands/security-audit.md
```

---

### Como Usar Skills

**Invocação Automática (Recomendado):**

Claude detecta automaticamente quando um skill é relevante:

```
Você: "Preciso construir uma landing page moderna"
Claude: [Invoca frontend-design skill automaticamente]

Você: "Quero criar um novo comando para análise de dependências"
Claude: [Invoca meta-command skill automaticamente]
```

**Invocação Manual (Slash Command):**

```bash
# Se o skill tiver comando correspondente
/dev-workflow adicionar feature X
```

**Verificar skills disponíveis:**

```bash
# Listar skills do projeto
ls .claude/skills/

# Listar skills pessoais
ls ~/.claude/skills/
```

---

## 📖 Exemplos

### Exemplo 1: Adicionando Nova Feature (Workflow Completo)

**Contexto:** Você quer adicionar autenticação com JWT ao seu backend Express.

```bash
# Inicia Claude Code
claude

# Executa workflow completo
/dev-workflow adicionar autenticação JWT ao backend Express
```

**O que acontece:**

**1. PLAN (Opus 4.5)** 📝
```
🔍 Analisando codebase...
✅ Encontrados padrões Express em src/server.ts
✅ Detectado uso de TypeScript
✅ Banco de dados: PostgreSQL

📝 Criando plano: specs/auth-jwt.md

Plano inclui:
- Middleware de autenticação
- Endpoints /login e /register
- Geração e validação de tokens JWT
- Testes unitários e de integração
- Migrations do banco
```

**2. IMPLEMENT (Sonnet 4.5)** 💻
```
💻 Implementando specs/auth-jwt.md...

✅ Criado src/middleware/auth.ts
✅ Criado src/routes/auth.ts
✅ Modificado src/server.ts (registro de rotas)
✅ Criado migrations/003_add_users_table.sql
✅ Criados 8 testes em tests/auth.test.ts

Checkboxes atualizados: 12/12 ✅
```

**3. TEST (Haiku)** ✅
```
🧪 Executando validação...

Arquivos: 5/5 criados ✅
Testes: npm test
  ✅ 8/8 testes passando
Build: npm run build
  ✅ Build sucesso
Lint: npm run lint
  ✅ Sem erros

Relatório: APROVADO ✅
```

**4. REVIEW (Haiku)** 🔍
```
🔍 Revisando implementação...

Aderência à spec: Alta ✅
Objetivos atendidos: 12/12 ✅

⚠️  Sugestões:
1. Adicionar rate limiting no endpoint /login
2. Implementar refresh tokens (fora do escopo atual)

Veredito: APROVADO ✅
```

**Resultado final:**
- Feature completa e testada
- Documentação viva em `specs/auth-jwt.md`
- Todos os checkboxes marcados
- Pronta para code review humano

---

### Exemplo 2: Corrigindo um Bug

**Contexto:** Usuários reportam erro ao fazer upload de arquivos grandes.

```bash
/plan corrigir erro de timeout em upload de arquivos grandes
```

**Output do /plan:**
```markdown
# Plano: Corrigir Timeout em Upload de Arquivos

## 1. Resumo
Usuários reportam erro de timeout ao fazer upload de arquivos >10MB.
Root cause: timeout padrão do Express (30s) é insuficiente.

## 2. Objetivos
- [x] Aumentar timeout do Express para 5 minutos
- [x] Adicionar progress feedback no frontend
- [x] Implementar upload por chunks (multipart)
- [x] Adicionar validação de tamanho máximo (100MB)

## 3. Implementação
### Arquivos a Modificar
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/server.ts` | Modificar | Aumentar timeout |
| `src/routes/upload.ts` | Modificar | Implementar chunked upload |
| `frontend/UploadForm.tsx` | Modificar | Adicionar progress bar |

### Detalhes Técnicos
```typescript
// src/server.ts
app.timeout = 300000; // 5 minutos

// src/routes/upload.ts
router.post('/upload',
  upload.single('file'),
  validateFileSize(100 * 1024 * 1024), // 100MB
  async (req, res) => {
    // Implementar chunked upload...
  }
);
```

## 4. Testes
- [x] Teste com arquivo de 50MB
- [x] Teste com arquivo de 101MB (deve rejeitar)
- [x] Teste de progress tracking
```

Agora você pode:
```bash
# Implementar o fix
/implement specs/corrigir-timeout-upload.md

# Testar
/test-implementation specs/corrigir-timeout-upload.md

# Revisar
/review specs/corrigir-timeout-upload.md
```

---

### Exemplo 3: Refatoração de Código

**Contexto:** Código de manipulação de dados está espalhado, você quer consolidar em um serviço.

```bash
/plan refatorar lógica de produtos para camada de serviço
```

Após o plano ser criado:

```bash
# Implementar refatoração
/implement specs/refactor-products-service.md
```

**Benefício da spec:** Documenta **por que** você refatorou (não só o que mudou).

```markdown
## Motivação da Refatoração
- Código de produtos estava em controllers, models e helpers
- Dificultava testes unitários (lógica misturada com HTTP)
- Violava Single Responsibility Principle
- Duplicação de validações em 3 lugares diferentes

## Arquitetura Alvo
```
┌────────────┐
│ Controller │ ──> valida HTTP, delega para service
└────────────┘
       │
       v
┌────────────┐
│  Service   │ ──> lógica de negócio (testável)
└────────────┘
       │
       v
┌────────────┐
│ Repository │ ──> acesso a dados
└────────────┘
```
```

---

### Exemplo 4: Uso do /question

**Contexto:** Novo desenvolvedor no projeto precisa entender onde adicionar um endpoint.

```bash
/question onde ficam os endpoints da API e qual é o padrão usado?
```

**Resposta do Claude:**
```
📁 Estrutura de Endpoints da API

Os endpoints ficam em `src/routes/`:
- src/routes/users.ts (rotas de usuários)
- src/routes/products.ts (rotas de produtos)
- src/routes/auth.ts (autenticação)

Padrão usado:
1. **Arquitetura em camadas**:
   Route → Controller → Service → Repository

2. **Convenções de nomenclatura**:
   - Arquivos: kebab-case (user-profile.ts)
   - Classes: PascalCase (UserController)
   - Funções: camelCase (getUserById)

3. **Estrutura de uma rota**:
```typescript
// src/routes/products.ts
router.get('/:id',
  authenticate,           // middleware
  ProductController.getById
);
```

4. **Validação**: Usa Zod schemas em `src/schemas/`

Para adicionar novo endpoint:
1. Criar schema em `src/schemas/your-entity.ts`
2. Criar rota em `src/routes/your-entity.ts`
3. Adicionar testes em `tests/routes/your-entity.test.ts`
```

---

## 🔧 Estendendo o Framework

Você pode criar seus próprios comandos e skills para casos específicos do seu projeto.

### Criando um Comando Customizado

**Exemplo:** Criar comando `/api-docs` para gerar documentação OpenAPI.

**1. Criar arquivo do comando:**
```bash
touch .claude/commands/api-docs.md
```

**2. Definir o comando:**
```yaml
---
description: Gera documentação OpenAPI 3.0 a partir dos endpoints da API
argument-hint: [caminho/para/routes]
allowed-tools: Read, Glob, Grep, Write
---

# API Documentation Generator

Gere documentação OpenAPI 3.0 para: $ARGUMENTS

## Instruções

1. Se $ARGUMENTS vazio, liste rotas disponíveis em `src/routes/`
2. Para cada arquivo de rota:
   - Extraia endpoints (GET, POST, PUT, DELETE)
   - Identifique schemas de validação (Zod, Joi, etc)
   - Documente parâmetros e responses
3. Gere arquivo `docs/openapi.yaml` com:
   - Info (title, version, description)
   - Servers (development, production)
   - Paths (todos os endpoints)
   - Components/Schemas (tipos de dados)
4. Valide YAML gerado
5. Apresente resumo: X endpoints documentados

## Formato OpenAPI

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: Success
```
```

**3. Usar o comando:**
```bash
/api-docs src/routes/
```

---

### Criando um Skill Customizado

**Exemplo:** Skill para analisar performance de queries SQL.

**1. Usar o meta-command:**
```
"Crie um skill chamado sql-performance-analyzer que analisa queries SQL lentas e sugere otimizações"
```

**2. O meta-command gera:**
```
.claude/skills/sql-performance-analyzer/
├── SKILL.md          (skill principal)
├── TEMPLATES.md      (templates de análise)
└── scripts/
    └── analyze.py    (script helper para parsing SQL)
```

**3. Estrutura do SKILL.md:**
```yaml
---
name: sql-performance-analyzer
description: Analisa queries SQL lentas e sugere otimizações (índices, rewrites). Use quando tiver problemas de performance no banco.
allowed-tools: Read, Grep, Bash
---

# SQL Performance Analyzer

## Propósito
Identificar queries SQL lentas e sugerir otimizações específicas.

## Quando usar
- Logs mostram queries lentas (>1s)
- EXPLAIN ANALYZE mostra table scans
- Investigação de problemas de performance

## Workflow
1. Localize queries suspeitas:
   - Logs do banco (slow query log)
   - Código da aplicação (grep por SELECT, JOIN)
2. Execute EXPLAIN ANALYZE em cada query
3. Identifique problemas:
   - Table scans (Seq Scan em Postgres)
   - Falta de índices
   - N+1 queries
   - Subqueries ineficientes
4. Sugira otimizações:
   - Índices específicos (CREATE INDEX)
   - Rewrite da query
   - Eager loading (se ORM)
   - Materialização (se views)
5. Gere relatório com impacto estimado

## Exemplos
[Ver TEMPLATES.md para templates de análise]
```

**4. Usar o skill:**
```
"Analise a performance das queries do módulo de produtos"
```

Claude invocará o skill automaticamente e executará o workflow definido.

---

### Melhores Práticas para Extensões

#### **1. Descrições Específicas**

```yaml
# ✅ BOM - Específico e acionável
description: Gera documentação OpenAPI 3.0 a partir de rotas Express. Use quando precisar documentar APIs.

# ❌ RUIM - Vago
description: Para documentação
```

#### **2. Skills Focados (Single Responsibility)**

```yaml
# ✅ BOM - Uma responsabilidade clara
name: sql-performance-analyzer

# ❌ RUIM - Escopo muito amplo
name: database-helper
```

#### **3. Use Restrição de Ferramentas**

```yaml
# Para comandos read-only
allowed-tools: Read, Glob, Grep

# Para comandos que modificam
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
```

#### **4. Convenções de Nomenclatura**

- **Comandos**: kebab-case, descritivos (`/api-docs`, `/security-audit`)
- **Skills**: kebab-case, verbos quando aplicável (`sql-performance-analyzer`)
- **Arquivos de suporte**: UPPERCASE.md (`SKILL.md`, `TEMPLATES.md`, `EXAMPLES.md`)

#### **5. Documente Casos de Uso**

Sempre inclua seção "Quando usar" e exemplos concretos.

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
seu-projeto/
├── .claude/                    # Configurações do Claude Code
│   ├── commands/              # Slash commands
│   │   ├── dev-workflow.md
│   │   ├── plan.md
│   │   ├── implement.md
│   │   ├── test-implementation.md
│   │   ├── review.md
│   │   └── question.md
│   ├── skills/                # Skills customizados
│   │   ├── dev-workflow/
│   │   │   └── SKILL.md
│   │   ├── frontend-design/
│   │   │   └── SKILL.md
│   │   └── meta-command/
│   │       ├── SKILL.md
│   │       └── TEMPLATES.md
│   └── agents/                # Agentes especializados
│       └── scraper.md
├── specs/                     # Especificações técnicas
│   ├── auth-jwt.md
│   ├── refactor-cache.md
│   └── fix-upload-timeout.md
├── docs/                      # Documentação do framework
│   ├── EXAMPLES.md
│   ├── EXTENDING.md
│   └── ARCHITECTURE.md
├── src/                       # Código da aplicação
└── tests/                     # Testes
```

### Fluxo de Dados

```
┌──────────┐
│   User   │
└─────┬────┘
      │ /dev-workflow adicionar feature X
      v
┌──────────────┐
│ dev-workflow │ (skill)
│    SKILL     │
└──────┬───────┘
       │ 1. Executa /plan
       v
┌─────────────┐
│ /plan       │ (command) ──> specs/feature-x.md
│ Opus 4.5    │
└──────┬──────┘
       │ 2. Executa /implement specs/feature-x.md
       v
┌──────────────┐
│ /implement   │ (command) ──> Cria/modifica arquivos
│ Sonnet 4.5   │               Atualiza checkboxes
└──────┬───────┘
       │ 3. Executa /test-implementation specs/feature-x.md
       v
┌───────────────────┐
│ /test-implement   │ (command) ──> Executa testes
│ Haiku             │               Gera relatório
└──────┬────────────┘
       │ 4. Executa /review specs/feature-x.md
       v
┌─────────────┐
│ /review     │ (command) ──> Compara spec vs código
│ Haiku       │               Sugere melhorias
└──────┬──────┘
       │
       v
┌──────────────┐
│  Resumo ao   │
│    Usuário   │
└──────────────┘
```

### Estratégia de Seleção de Modelos

Cada fase usa modelo otimizado para custo/qualidade:

| Fase | Modelo | Razão |
|------|--------|-------|
| **Plan** | Opus 4.5 | Análise profunda de codebase, decisões arquiteturais complexas |
| **Implement** | Sonnet 4.5 | Balanço ideal entre velocidade e qualidade de código |
| **Test** | Haiku | Validação rápida, tarefas bem definidas (executar testes) |
| **Review** | Haiku | Análise crítica eficiente, checklist de qualidade |

**Configurabilidade:** Cada card no Kanban Board pode sobrescrever o modelo padrão via UI.

### Matriz de Ferramentas por Comando

| Comando | Read | Write | Edit | Glob | Grep | Bash | Task |
|---------|:----:|:-----:|:----:|:----:|:----:|:----:|:----:|
| /plan | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| /implement | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| /test-implementation | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| /review | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| /question | ✅ | ❌ | ❌ | ❌ | ❌ | ✅* | ❌ |

*: Apenas `git ls-files`

**Princípio:** Comandos read-only (question, review, test) não podem modificar arquivos.

---

## ❓ FAQ

### Perguntas Gerais

**P: Preciso usar todos os comandos (plan → implement → test → review)?**

R: Não! Use apenas o que fizer sentido:
- Tarefa trivial? Faça diretamente sem comandos
- Feature média? `/plan` + `/implement`
- Feature complexa? `/dev-workflow` completo

**P: Posso modificar os comandos existentes?**

R: Sim! São apenas arquivos Markdown em `.claude/commands/`. Edite conforme necessário.

**P: O que acontece se eu cancelar no meio de um /dev-workflow?**

R: O progresso é salvo. Checkboxes no arquivo de spec mostram o que foi feito. Continue com `/implement specs/arquivo.md`.

**P: Specs antigas ficam no `specs/` para sempre?**

R: Você decide! Opções:
- Mover para `specs/archive/` após merge
- Deletar após review humano
- Manter como documentação histórica

**P: Posso usar este framework com outras IDEs além de VS Code?**

R: Sim! Claude Code funciona via CLI. Funciona em qualquer editor (Vim, Neovim, Emacs, Sublime, etc).

---

### Troubleshooting

**P: Claude não está usando meus comandos customizados**

Checklist:
1. ✅ Arquivo está em `.claude/commands/nome.md`?
2. ✅ Frontmatter YAML válido (começa e termina com `---`)?
3. ✅ Campo `description` é claro sobre quando usar?
4. ✅ Tentou reiniciar Claude Code?

Debug:
```bash
# Verificar sintaxe
cat .claude/commands/seu-comando.md | head -n 10

# Listar comandos detectados
ls -la .claude/commands/
```

**P: /test-implementation não detecta meu test runner**

R: Adicione detecção customizada no arquivo `.claude/commands/test-implementation.md`:

```markdown
### Detecção de Ferramentas

| Arquivo | Ferramenta | Comando |
|---------|------------|---------|
| `Makefile` | make | `make test` |
| `deno.json` | deno | `deno test` |  # <-- Adicione aqui
```

**P: Skills não estão sendo invocados automaticamente**

R: Verifique se o campo `description` é específico:

```yaml
# ❌ RUIM - muito genérico
description: Para frontend

# ✅ BOM - específico sobre QUANDO usar
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications.
```

**P: Checkboxes não estão sendo atualizados no arquivo de spec**

R: Verifique formato:
- ✅ Correto: `- [ ] Item`
- ❌ Errado: `- []Item` (sem espaço)
- ❌ Errado: `- [x ] Item` (espaço extra)

**P: Como faço debug de um comando?**

R: Adicione logging:
```markdown
# No comando .md, adicione:

## Debug

Execute os seguintes comandos para debug:
```bash
echo "Fase 1: Análise"
echo "Arquivos encontrados: ..."
```
```

---

### Perguntas Avançadas

**P: Posso integrar com CI/CD?**

R: Sim! Exemplos:

```yaml
# .github/workflows/validate-spec.yml
name: Validate Spec Implementation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Find changed specs
        run: |
          CHANGED_SPECS=$(git diff --name-only origin/main | grep '^specs/')
          echo "SPECS=$CHANGED_SPECS" >> $GITHUB_ENV
      - name: Verify checkboxes
        run: |
          # Script para verificar se todos checkboxes estão [x]
          ./scripts/verify-spec-completion.sh $SPECS
```

**P: Como uso em projetos monorepo?**

R: Cada subprojeto pode ter sua própria pasta `.claude/`:

```
monorepo/
├── .claude/              # Comandos globais (shared)
├── apps/
│   ├── web/
│   │   └── .claude/      # Comandos específicos do web app
│   └── api/
│       └── .claude/      # Comandos específicos da API
└── packages/
    └── shared/
        └── .claude/      # Comandos para biblioteca shared
```

**P: Posso usar modelos diferentes dos padrões?**

R: Sim! Adicione `model:` no frontmatter:

```yaml
---
description: Meu comando customizado
model: haiku   # opus | sonnet | haiku
---
```

**P: Como compartilho comandos com minha equipe?**

R:
1. Commite `.claude/` no repositório
2. Equipe clona e usa automaticamente
3. Para comandos pessoais: `~/.claude/commands/` (não commitados)

**P: Posso usar variáveis de ambiente nos comandos?**

R: Sim, via Bash:

```markdown
## Setup

Execute:
```bash
export API_KEY=$YOUR_API_KEY
curl -H "Authorization: Bearer $API_KEY" ...
```
```

---

### Casos de Uso Específicos

**P: Como uso para projetos que não são web?**

R: Framework é agnóstico! Exemplos:

- **Python CLI**: `/plan criar comando para processar CSV` → specs com estrutura de argparse
- **Rust library**: `/plan implementar trait Serialize` → specs com lifetime annotations
- **Mobile (React Native)**: `/plan adicionar offline sync` → specs com AsyncStorage
- **Game dev (Unity)**: `/plan sistema de inventário` → specs com ScriptableObjects

**P: Como documento APIs GraphQL?**

R: Crie comando customizado `/graphql-docs`:

```yaml
---
description: Gera documentação de schema GraphQL a partir de resolvers
---

# GraphQL Schema Documentation

1. Leia arquivos em `src/graphql/`
2. Extraia tipos, queries, mutations
3. Gere documentação em `docs/graphql-schema.md`
4. Inclua exemplos de queries
```

**P: Posso usar para mobile (iOS/Android nativo)?**

R: Sim! Ajuste templates de spec:

```markdown
### Arquivos a Modificar (iOS)
| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `ViewControllers/HomeViewController.swift` | Modificar | Adicionar UI |
| `Models/User.swift` | Criar | Modelo de dados |

### Testes (XCTest)
- [ ] testUserModelSerialization
- [ ] testHomeViewControllerLoad
```

---

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Este projeto foi desenvolvido durante lives de programação no YouTube, e aceitamos contribuições da comunidade.

### Como Contribuir

Contribuições são bem-vindas! Você pode ajudar:

1. **Relatando bugs** - Abra issue no GitHub
2. **Sugerindo features** - Proponha novos comandos/skills
3. **Melhorando documentação** - Corrija typos, adicione exemplos
4. **Compartilhando skills** - Submeta seus comandos customizados
5. **Casos de uso** - Compartilhe como usa o framework

### Processo de Contribuição

1. Fork o repositório
2. Crie branch: `git checkout -b feature/meu-comando`
3. Faça mudanças
4. Teste localmente
5. Commit: `git commit -m "feat: adicionar comando X"`
6. Push: `git push origin feature/meu-comando`
7. Abra Pull Request

### Diretrizes

- **Comandos**: Teste em projeto real antes de submeter
- **Documentação**: Use exemplos concretos, não abstrações
- **Specs**: Siga formato padrão (Resumo → Objetivos → Implementação → Testes → Considerações)
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)

### Código de Conduta

- ✅ Seja respeitoso e construtivo
- ✅ Aceite feedback com mente aberta
- ✅ Foque no problema, não na pessoa
- ❌ Não tolere assédio ou discriminação

---

## 📚 Recursos Adicionais

- **[Documentação do Claude Code](https://docs.anthropic.com/claude/docs/claude-code)** - Guia oficial
- **[Claude Agent SDK](https://docs.anthropic.com/claude/docs/agent-sdk)** - Para criar agentes customizados
- **[Anthropic API Docs](https://docs.anthropic.com/)** - Referência da API
- **[Exemplos Práticos](./docs/EXAMPLES.md)** - Mais casos de uso
- **[Guia de Extensão](./docs/EXTENDING.md)** - Criar comandos avançados
- **[Arquitetura Detalhada](./docs/ARCHITECTURE.md)** - Deep dive técnico

---

## 📝 Licença

MIT License - sinta-se livre para usar em projetos pessoais e comerciais.

```
MIT License

Copyright (c) 2025 Orquestrator Agent Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Agradecimentos

Este projeto foi desenvolvido durante lives de programação no YouTube, com contribuições da comunidade.

### Tecnologias Utilizadas

- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [@dnd-kit](https://dndkit.com/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Claude Agent SDK](https://docs.anthropic.com/claude/docs/agent-sdk), [SQLAlchemy](https://www.sqlalchemy.org/)
- **AI**: [Claude by Anthropic](https://www.anthropic.com/claude)

**Criado com** ❤️ **usando Claude Code**

---

**[⬆ Voltar ao topo](#-orquestrator-agent---kanban--claude-agent-sdk)**
