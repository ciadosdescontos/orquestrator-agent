---
name: readme-project-setup
type: documentation
priority: high
created_at: 2025-01-02
---

# Plano: README para Configuração e Execução do Projeto

## 1. Resumo

Criar um README.md completo na raiz do projeto que documente como instalar, configurar e executar o Orquestrator Agent (Kanban + Claude Agent SDK). O README deve incluir pré-requisitos, configuração de ambiente, instruções passo a passo para rodar o projeto e como apontá-lo para projetos próprios dos usuários.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Documentar pré-requisitos do sistema (Node.js, Python, Claude SDK)
- [x] Criar guia de instalação passo a passo
- [x] Documentar configuração de variáveis de ambiente
- [x] Explicar estrutura do projeto (frontend React + backend FastAPI)
- [x] Incluir instruções para apontar para projetos próprios
- [x] Adicionar seção de troubleshooting comum
- [ ] Incluir screenshots da aplicação em funcionamento
- [x] Documentar endpoints da API disponíveis

### Fora do Escopo
- Documentação técnica detalhada da arquitetura interna
- Guia de contribuição para desenvolvedores
- Documentação de deployment em produção

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `/README.md` | Modificar | README principal do projeto com documentação completa |
| `/docs/INSTALLATION.md` | Criar | Guia detalhado de instalação (opcional) |
| `/docs/TROUBLESHOOTING.md` | Criar | Problemas comuns e soluções (opcional) |

### Detalhes Técnicos

#### Estrutura do README.md

```markdown
# 🎯 Orquestrator Agent - Kanban + Claude Agent SDK

[Banner/Logo]
[Badges: Version, License, Node, Python]

## 📋 Visão Geral
Breve descrição do projeto, o que ele faz e seus principais benefícios.

## ✨ Features
- Kanban visual com drag-and-drop
- Integração com Claude Agent SDK
- Workflow automatizado (Plan → Implement → Test → Review)
- Upload de imagens para contexto
- Modelos configuráveis por card

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- Claude API Key
- Git

### Instalação Rápida
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/orquestrator-agent.git
cd orquestrator-agent

# Instale as dependências
npm run setup

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env com sua CLAUDE_API_KEY

# Execute o projeto
npm run dev
```

## 📦 Instalação Detalhada

### 1. Clonar o Repositório
### 2. Configurar o Frontend
### 3. Configurar o Backend
### 4. Variáveis de Ambiente
### 5. Executar o Projeto

## 🎨 Como Usar

### Interface do Kanban
[Screenshots com legendas]

### Workflow de Desenvolvimento
1. Criar card no Backlog
2. Arrastar para Plan
3. Executar comandos
4. Acompanhar progresso

### Apontando para Seu Projeto
```bash
# No backend/.env, configure:
PROJECT_PATH=/caminho/do/seu/projeto
```

## 🛠️ Configuração Avançada

### Modelos por Card
### Upload de Imagens
### Comandos Disponíveis

## 📚 Estrutura do Projeto
```
orquestrator-agent/
├── frontend/          # React + TypeScript + Vite
├── backend/           # FastAPI + Claude SDK
├── specs/            # Especificações geradas
├── .claude/          # Comandos e skills
└── docs/             # Documentação

## 🔌 API Endpoints

### Cards
- GET /api/cards
- POST /api/cards
- PUT /api/cards/:id
- DELETE /api/cards/:id

### Execução de Comandos
- POST /api/execute-plan
- POST /api/execute-implement
- POST /api/execute-test
- POST /api/execute-review

## 🐛 Troubleshooting

### Problemas Comuns
1. **Erro: CLAUDE_API_KEY não definida**
2. **Porta 3000/3001 em uso**
3. **Erro de CORS**

## 🤝 Contribuindo
Como contribuir com o projeto

## 📄 Licença
MIT License

## 👏 Créditos
Desenvolvido com Claude Code
```

#### Conteúdo Detalhado

1. **Seção de Pré-requisitos**:
```markdown
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
```

2. **Seção de Instalação Detalhada**:
```markdown
### Configurar o Backend

```bash
cd backend

# Criar ambiente virtual Python
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```
```

3. **Seção de Configuração de Projeto**:
```markdown
### Apontando para Seu Projeto

O Orquestrator Agent pode trabalhar com qualquer projeto em sua máquina:

1. **Opção 1: Configurar via interface**
   - Clique no botão "Projeto" no header
   - Selecione ou digite o caminho do seu projeto
   - O sistema salvará a configuração

2. **Opção 2: Configurar via variável de ambiente**
   ```bash
   # No arquivo backend/.env
   PROJECT_PATH=/Users/seu-usuario/meu-projeto
   ```

3. **Estrutura esperada do projeto alvo**:
   - Pode ser qualquer projeto (Node, Python, Go, etc.)
   - O sistema criará automaticamente a pasta `specs/` no seu projeto
   - Comandos serão executados na raiz do projeto configurado
```

4. **Seção de Troubleshooting**:
```markdown
### Erro: CLAUDE_API_KEY não definida

**Sintoma**: Erro ao executar comandos do Claude

**Solução**:
1. Verifique se o arquivo `backend/.env` existe
2. Confirme que contém: `CLAUDE_API_KEY=sk-ant-...`
3. Reinicie o servidor backend

### Porta já em uso

**Sintoma**: Erro "Port 3000 is already in use"

**Solução**:
```bash
# Encontrar processo usando a porta
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar o processo ou usar porta diferente
# No frontend/vite.config.ts, mude a porta:
server: {
  port: 3002
}
```
```

---

## 4. Testes

### Validação do README
- [x] Verificar se todos os comandos funcionam em ambiente limpo
- [x] Testar instalação seguindo apenas o README
- [x] Validar links e referências externas
- [ ] Confirmar que screenshots estão atualizados

### Testes de Configuração
- [x] Testar configuração com diferentes caminhos de projeto
- [x] Validar funcionamento com projetos Node.js
- [x] Validar funcionamento com projetos Python
- [x] Testar com projetos em diferentes localizações do sistema

---

## 5. Considerações

### Screenshots Necessários
- Dashboard do Kanban com cards em diferentes colunas
- Modal de execução mostrando logs
- Configuração de projeto
- Upload de imagens
- Seleção de modelos

### Exemplos de Uso
- Incluir exemplo de criação de feature simples
- Demonstrar workflow completo (Plan → Done)
- Mostrar como visualizar specs geradas

### Documentação Adicional
- Link para documentação do Claude Agent SDK
- Referências para React DnD Kit
- Link para FastAPI docs

### Manutenção
- README deve ser atualizado com novas features
- Manter seção de troubleshooting atualizada com issues comuns
- Versionar adequadamente (seguir SemVer)