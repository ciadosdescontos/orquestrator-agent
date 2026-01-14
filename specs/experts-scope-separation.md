# Separar Experts do Orchestrator vs Experts do Projeto

## 1. Resumo

O sistema de experts atual é específico para a codebase do Kanban/Orquestrador, mas quando um usuário carrega seu próprio projeto, esses experts são copiados junto com `.claude/`, causando inconsistência. Os experts do Orquestrador (Backend, Frontend, Database, etc.) não fazem sentido para projetos externos que têm estruturas de código completamente diferentes.

**Problema central:** A função `load_project()` em `project_manager.py` copia toda a pasta `.claude/` do orquestrador para projetos que não têm configuração própria, incluindo experts específicos desta codebase.

**Solução:** Experts são opcionais e configurados on-demand pelo usuário. O sistema funciona normalmente com ou sem experts.

---

## 2. Objetivos e Escopo

### Objetivos
- [ ] Não copiar experts do orquestrador para projetos externos
- [ ] Criar UI para configurar experts on-demand (botão "Configurar Experts")
- [ ] Analisar codebase e sugerir experts automaticamente
- [ ] Permitir usuário aprovar/rejeitar cada expert sugerido
- [ ] Sistema funciona normalmente sem experts (triage retorna vazio)

### Fora do Escopo
- Migração de experts existentes de projetos já carregados (pode ser manual)
- Edição manual de keywords/patterns (usa apenas sugestões automáticas)

---

## 3. Implementação

### Fluxo do Usuário (UX)

```
1. Usuário carrega projeto externo
   └── Sistema NÃO copia experts, funciona normalmente sem eles

2. Usuário quer configurar experts (opcional)
   └── Clica no botão "🧠 Experts" no header (dropdown do projeto)

3. Modal de Configuração abre
   ├── Sistema analisa codebase automaticamente
   ├── Mostra sugestões de experts com checkboxes
   └── Usuário seleciona quais quer criar

4. Experts são criados
   └── Disponíveis para triage no workflow do Kanban
```

### UI: Localização do Botão

No dropdown do seletor de projeto:

```
┌─────────────────────────────────────────────────────────────────┐
│  📂 meu-projeto  ▾                                              │
│  ┌────────────────────────┐                                     │
│  │ 📂 Trocar Projeto      │                                     │
│  │ ────────────────────── │                                     │
│  │ 🧠 Configurar Experts  │  ← NOVO                             │
│  └────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

### UI: Modal de Configuração

```
┌─────────────────────────────────────────────────────────────────┐
│                   🧠 Configurar Experts                     ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Analisando codebase...  ████████████ 100%                     │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Sugestões baseadas na análise:                                 │
│                                                                 │
│  ☑️ React Frontend Expert                                       │
│     📁 src/components/, src/hooks/, src/pages/                  │
│     🏷️ react, component, hook, useState, useEffect              │
│                                                                 │
│  ☑️ Node Backend Expert                                         │
│     📁 server/, api/, routes/, middleware/                      │
│     🏷️ express, api, endpoint, router, middleware               │
│                                                                 │
│  ☐ Database Expert                                              │
│     📁 prisma/, models/, migrations/                            │
│     🏷️ prisma, model, migration, schema, database               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Experts criados ajudam o sistema a entender melhor             │
│  o contexto das suas tarefas no Kanban.                         │
│                                                                 │
│  [ Cancelar ]                          [ Criar Selecionados ]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### UI: Experts Já Configurados

Se o projeto já tem experts, o modal mostra:

```
┌─────────────────────────────────────────────────────────────────┐
│                   🧠 Experts do Projeto                     ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Experts ativos:                                                │
│                                                                 │
│  ✓ React Frontend Expert                    [ 🗑️ Remover ]      │
│  ✓ Node Backend Expert                      [ 🗑️ Remover ]      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [ Analisar Novamente ]                            [ Fechar ]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/project_manager.py` | Modificar | Excluir `experts/` da cópia de `.claude` |
| `backend/src/config/experts.py` | Modificar | Tornar configuração dinâmica por projeto |
| `backend/src/services/expert_init_service.py` | Criar | Serviço para analisar codebase e criar experts |
| `backend/src/routes/experts.py` | Modificar | Novos endpoints (analyze, create, delete, status) |
| `frontend/src/components/ExpertsModal/` | Criar | Modal de configuração de experts |
| `frontend/src/api/experts.ts` | Criar | API client para experts |

### Detalhes Técnicos

#### 3.1 Backend: Modificar `project_manager.py`

Excluir experts da cópia ao carregar projeto:

```python
# Linha 49-55 - Adicionar 'experts' ao ignore
if not project_claude.exists() and self.root_claude_path.exists():
    shutil.copytree(
        self.root_claude_path,
        project_claude,
        ignore=shutil.ignore_patterns(
            '*.pyc', '__pycache__', '.git', '*.db',
            'experts'  # NÃO copiar experts do orquestrador
        )
    )
```

#### 3.2 Backend: Tornar `config/experts.py` Dinâmico (com fallback)

**Regra fundamental:** Se não há projeto carregado, usar experts hardcoded do orquestrador.

```python
"""Expert configuration - loads dynamically per project."""
import json
from pathlib import Path
from typing import Dict, List, TypedDict, Optional

class ExpertConfig(TypedDict):
    name: str
    knowledge_path: str
    keywords: List[str]
    file_patterns: List[str]

# Experts do orquestrador (MANTÉM O QUE JÁ EXISTE)
# Usados quando NÃO há projeto externo carregado
ORCHESTRATOR_EXPERTS: Dict[str, ExpertConfig] = {
    "database": {
        "name": "Database Expert",
        "knowledge_path": ".claude/commands/experts/database/KNOWLEDGE.md",
        "keywords": ["model", "database", "migration", ...],  # mantém atual
        "file_patterns": ["backend/src/models/", ...]  # mantém atual
    },
    # ... demais experts (backend, frontend, chat, kanban-flow)
    # MANTÉM EXATAMENTE COMO ESTÁ HOJE
}

_experts_cache: Dict[str, Dict[str, ExpertConfig]] = {}

def get_experts(project_path: Optional[str] = None) -> Dict[str, ExpertConfig]:
    """
    Retorna experts apropriados baseado no contexto.

    - Se project_path é None → retorna ORCHESTRATOR_EXPERTS (comportamento atual)
    - Se project_path existe → carrega dinamicamente do projeto
    """
    # SEM projeto carregado = usar experts do orquestrador
    if project_path is None:
        return ORCHESTRATOR_EXPERTS

    # COM projeto carregado = carregar dinamicamente
    return _load_project_experts(project_path)

def _load_project_experts(project_path: str) -> Dict[str, ExpertConfig]:
    """Carrega experts de um projeto externo."""
    if project_path in _experts_cache:
        return _experts_cache[project_path]

    experts_dir = Path(project_path) / ".claude" / "commands" / "experts"

    if not experts_dir.exists():
        _experts_cache[project_path] = {}
        return {}

    experts = {}
    for expert_dir in experts_dir.iterdir():
        if not expert_dir.is_dir():
            continue

        config_file = expert_dir / "config.json"
        if config_file.exists():
            with open(config_file) as f:
                config = json.load(f)
            experts[expert_dir.name] = {
                "name": config.get("name"),
                "knowledge_path": f".claude/commands/experts/{expert_dir.name}/KNOWLEDGE.md",
                "keywords": config.get("keywords", []),
                "file_patterns": config.get("file_patterns", [])
            }

    _experts_cache[project_path] = experts
    return experts

def clear_experts_cache(project_path: Optional[str] = None):
    """Clear cache when experts are modified."""
    if project_path:
        _experts_cache.pop(project_path, None)
    else:
        _experts_cache.clear()
```

#### 3.3 Backend: Criar `expert_init_service.py`

```python
"""Service para analisar codebase e criar experts."""
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Any

class ExpertInitService:
    """Analisa codebase e cria experts."""

    # Detectores de tecnologia (expandir conforme necessário)
    TECH_DETECTORS = {
        "react-frontend": {
            "markers": ["package.json"],
            "content_check": {"package.json": ["react", "react-dom"]},
            "file_patterns": ["src/components/**", "src/hooks/**", "src/pages/**"],
            "keywords": ["react", "component", "hook", "useState", "useEffect", "tsx", "jsx"],
            "name": "React Frontend Expert"
        },
        "node-backend": {
            "markers": ["package.json"],
            "content_check": {"package.json": ["express", "fastify", "koa", "nestjs"]},
            "file_patterns": ["server/**", "api/**", "routes/**", "src/routes/**"],
            "keywords": ["express", "api", "endpoint", "route", "middleware", "controller"],
            "name": "Node Backend Expert"
        },
        "python-backend": {
            "markers": ["requirements.txt", "pyproject.toml", "setup.py"],
            "content_check": {"requirements.txt": ["fastapi", "flask", "django"]},
            "file_patterns": ["**/routes/**", "**/services/**", "**/api/**"],
            "keywords": ["fastapi", "flask", "django", "api", "endpoint", "route", "service"],
            "name": "Python Backend Expert"
        },
        "database": {
            "markers": ["prisma/schema.prisma", "alembic.ini", "migrations/"],
            "file_patterns": ["**/models/**", "**/migrations/**", "prisma/**"],
            "keywords": ["model", "database", "migration", "schema", "query", "repository"],
            "name": "Database Expert"
        },
        "vue-frontend": {
            "markers": ["package.json"],
            "content_check": {"package.json": ["vue"]},
            "file_patterns": ["src/components/**", "src/views/**", "src/composables/**"],
            "keywords": ["vue", "component", "composable", "ref", "reactive", "template"],
            "name": "Vue Frontend Expert"
        }
    }

    async def analyze_codebase(self, project_path: str) -> List[Dict[str, Any]]:
        """Analisa codebase e retorna sugestões de experts."""
        path = Path(project_path)
        suggestions = []

        for tech_id, detector in self.TECH_DETECTORS.items():
            if await self._detect_technology(path, detector):
                # Descobrir diretórios reais
                real_patterns = await self._discover_patterns(path, detector["file_patterns"])

                suggestions.append({
                    "id": tech_id,
                    "name": detector["name"],
                    "keywords": detector["keywords"],
                    "file_patterns": real_patterns,
                    "detected": True
                })

        return suggestions

    async def _detect_technology(self, path: Path, detector: Dict) -> bool:
        """Verifica se tecnologia existe no projeto."""
        # Check marker files
        for marker in detector.get("markers", []):
            marker_path = path / marker
            if marker_path.exists():
                # Check content if needed
                content_checks = detector.get("content_check", {})
                if marker in content_checks:
                    try:
                        content = marker_path.read_text()
                        if any(check in content for check in content_checks[marker]):
                            return True
                    except:
                        pass
                else:
                    return True
        return False

    async def _discover_patterns(self, path: Path, patterns: List[str]) -> List[str]:
        """Descobre quais patterns realmente existem no projeto."""
        existing = []
        for pattern in patterns:
            # Simplificar pattern para verificar diretório
            base_dir = pattern.split("**")[0].rstrip("/")
            if (path / base_dir).exists():
                existing.append(pattern)
        return existing if existing else patterns[:2]  # Fallback

    async def create_expert(
        self,
        project_path: str,
        expert_id: str,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Cria um expert no projeto."""
        experts_dir = Path(project_path) / ".claude" / "commands" / "experts" / expert_id
        experts_dir.mkdir(parents=True, exist_ok=True)

        # 1. Criar config.json
        config_file = experts_dir / "config.json"
        config_file.write_text(json.dumps({
            "name": config["name"],
            "keywords": config["keywords"],
            "file_patterns": config["file_patterns"]
        }, indent=2))

        # 2. Criar KNOWLEDGE.md
        knowledge_file = experts_dir / "KNOWLEDGE.md"
        knowledge_file.write_text(f"""# {config['name']} - Knowledge Base

## Status
- Criado automaticamente
- Execute `/experts:{expert_id}:sync` para popular

## Arquivos Monitorados
{chr(10).join(f'- `{p}`' for p in config['file_patterns'])}

## Keywords
{', '.join(config['keywords'])}
""")

        # 3. Criar commands básicos
        self._create_commands(experts_dir, expert_id, config["name"])

        return {"success": True, "path": str(experts_dir)}

    def _create_commands(self, experts_dir: Path, expert_id: str, name: str):
        """Cria arquivos de command para o expert."""
        # Main command
        (experts_dir / f"{expert_id}.md").write_text(f"""---
description: {name} - Expert especializado neste domínio
---
# {name}

Consulte: `.claude/commands/experts/{expert_id}/KNOWLEDGE.md`

## Sub-comandos
- `/experts:{expert_id}:question` - Responder perguntas
- `/experts:{expert_id}:sync` - Atualizar knowledge base
""")

        # Question command
        (experts_dir / "question.md").write_text(f"""---
description: Responde perguntas sobre {name}
allowed-tools: Read, Glob, Grep
---
Responda consultando o KNOWLEDGE.md e arquivos do projeto.
$ARGUMENTS
""")

        # Sync command
        (experts_dir / "sync.md").write_text(f"""---
description: Sincroniza knowledge base do {name}
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---
Atualize o KNOWLEDGE.md com estrutura atual do projeto.
""")

    async def delete_expert(self, project_path: str, expert_id: str) -> bool:
        """Remove um expert do projeto."""
        import shutil
        expert_dir = Path(project_path) / ".claude" / "commands" / "experts" / expert_id
        if expert_dir.exists():
            shutil.rmtree(expert_dir)
            return True
        return False

expert_init_service = ExpertInitService()
```

#### 3.4 Backend: Novos Endpoints em `routes/experts.py`

```python
from pydantic import BaseModel
from typing import List, Dict, Any

class CreateExpertsRequest(BaseModel):
    experts: List[Dict[str, Any]]

class DeleteExpertRequest(BaseModel):
    expert_id: str

# GET /api/experts/analyze - Analisa codebase e sugere experts
@router.get("/analyze")
async def analyze_codebase():
    """Analisa codebase e retorna sugestões de experts."""
    from src.services.expert_init_service import expert_init_service

    manager = get_project_manager()
    project_path = manager.get_working_directory()

    suggestions = await expert_init_service.analyze_codebase(project_path)

    return {
        "success": True,
        "project_path": project_path,
        "suggestions": suggestions
    }

# POST /api/experts/create - Cria experts selecionados
@router.post("/create")
async def create_experts(request: CreateExpertsRequest):
    """Cria experts selecionados pelo usuário."""
    from src.services.expert_init_service import expert_init_service
    from src.config.experts import clear_experts_cache

    manager = get_project_manager()
    project_path = manager.get_working_directory()

    results = []
    for expert in request.experts:
        result = await expert_init_service.create_expert(
            project_path,
            expert["id"],
            expert
        )
        results.append({"id": expert["id"], **result})

    clear_experts_cache(project_path)

    return {"success": True, "created": results}

# DELETE /api/experts/{expert_id} - Remove um expert
@router.delete("/{expert_id}")
async def delete_expert(expert_id: str):
    """Remove um expert do projeto."""
    from src.services.expert_init_service import expert_init_service
    from src.config.experts import clear_experts_cache

    manager = get_project_manager()
    project_path = manager.get_working_directory()

    success = await expert_init_service.delete_expert(project_path, expert_id)
    clear_experts_cache(project_path)

    return {"success": success}

# GET /api/experts/status - Lista experts do projeto atual
@router.get("/status")
async def get_experts_status():
    """Retorna experts configurados no projeto atual."""
    from src.config.experts import load_experts_for_project

    manager = get_project_manager()
    project_path = manager.get_working_directory()

    experts = load_experts_for_project(project_path)

    return {
        "success": True,
        "has_experts": len(experts) > 0,
        "experts": experts
    }
```

#### 3.5 Frontend: Modal de Configuração

Criar `frontend/src/components/ExpertsModal/ExpertsModal.tsx`:

```tsx
import { useState, useEffect } from 'react';
import styles from './ExpertsModal.module.css';

interface ExpertSuggestion {
  id: string;
  name: string;
  keywords: string[];
  file_patterns: string[];
  detected: boolean;
}

interface ExpertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpertsModal({ isOpen, onClose }: ExpertsModalProps) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<ExpertSuggestion[]>([]);
  const [existingExperts, setExistingExperts] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar status atual e sugestões em paralelo
      const [statusRes, analyzeRes] = await Promise.all([
        fetch('/api/experts/status'),
        fetch('/api/experts/analyze')
      ]);

      const status = await statusRes.json();
      const analyze = await analyzeRes.json();

      setExistingExperts(status.experts || {});
      setSuggestions(analyze.suggestions || []);

      // Pré-selecionar todos os sugeridos
      setSelected(new Set(analyze.suggestions?.map((s: any) => s.id) || []));
    } catch (error) {
      console.error('Failed to load experts data:', error);
    }
    setLoading(false);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const expertsToCreate = suggestions.filter(s => selected.has(s.id));
      await fetch('/api/experts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experts: expertsToCreate })
      });
      await loadData(); // Recarregar
    } catch (error) {
      console.error('Failed to create experts:', error);
    }
    setCreating(false);
  };

  const handleDelete = async (expertId: string) => {
    try {
      await fetch(`/api/experts/${expertId}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete expert:', error);
    }
  };

  if (!isOpen) return null;

  const hasExistingExperts = Object.keys(existingExperts).length > 0;
  const newSuggestions = suggestions.filter(s => !existingExperts[s.id]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>🧠 Configurar Experts</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Analisando codebase...</div>
          ) : (
            <>
              {/* Experts existentes */}
              {hasExistingExperts && (
                <section className={styles.section}>
                  <h3>Experts Ativos</h3>
                  {Object.entries(existingExperts).map(([id, config]) => (
                    <div key={id} className={styles.existingExpert}>
                      <div className={styles.expertInfo}>
                        <span className={styles.expertName}>✓ {config.name}</span>
                        <span className={styles.expertPatterns}>
                          {config.file_patterns?.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(id)}
                        className={styles.deleteBtn}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </section>
              )}

              {/* Novas sugestões */}
              {newSuggestions.length > 0 && (
                <section className={styles.section}>
                  <h3>Sugestões</h3>
                  {newSuggestions.map(suggestion => (
                    <label key={suggestion.id} className={styles.suggestion}>
                      <input
                        type="checkbox"
                        checked={selected.has(suggestion.id)}
                        onChange={() => toggleSelection(suggestion.id)}
                      />
                      <div className={styles.suggestionInfo}>
                        <span className={styles.expertName}>{suggestion.name}</span>
                        <span className={styles.expertPatterns}>
                          📁 {suggestion.file_patterns.slice(0, 2).join(', ')}
                        </span>
                        <span className={styles.expertKeywords}>
                          🏷️ {suggestion.keywords.slice(0, 5).join(', ')}
                        </span>
                      </div>
                    </label>
                  ))}
                </section>
              )}

              {!hasExistingExperts && newSuggestions.length === 0 && (
                <p className={styles.empty}>
                  Nenhuma tecnologia detectada automaticamente.
                </p>
              )}
            </>
          )}
        </div>

        <footer className={styles.footer}>
          {newSuggestions.length > 0 && (
            <button
              onClick={handleCreate}
              disabled={creating || selected.size === 0}
              className={styles.createBtn}
            >
              {creating ? 'Criando...' : `Criar ${selected.size} Expert(s)`}
            </button>
          )}
          <button onClick={onClose} className={styles.cancelBtn}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
```

---

## 4. Testes

### Unitários
- [ ] `load_experts_for_project()` retorna vazio para projeto sem experts
- [ ] `load_experts_for_project()` carrega experts do projeto corretamente
- [ ] `analyze_codebase()` detecta React em projeto com package.json + react
- [ ] `analyze_codebase()` detecta Python backend com requirements.txt + fastapi
- [ ] `create_expert()` cria estrutura de arquivos correta
- [ ] `delete_expert()` remove diretório do expert

### Integração
- [ ] Carregar projeto externo NÃO copia experts do orquestrador
- [ ] Triage retorna vazio quando projeto não tem experts (sem erro)
- [ ] Triage funciona normalmente com experts configurados
- [ ] Modal carrega sugestões e status em paralelo

### E2E
- [ ] Fluxo: carregar projeto → abrir modal → criar experts → usar no Kanban
- [ ] Fluxo: remover expert → triage não usa mais aquele expert

---

## 5. Considerações

### Comportamento por Contexto

| Contexto | Experts Usados | Comportamento |
|----------|----------------|---------------|
| Sem projeto carregado (orquestrador) | `ORCHESTRATOR_EXPERTS` (hardcoded) | **Mantém tudo como está hoje** |
| Projeto externo com experts | Experts do projeto (dinâmico) | Carrega do `.claude/commands/experts/` |
| Projeto externo sem experts | `{}` (vazio) | Funciona normalmente, sem experts |

**Importante:** O desenvolvimento do próprio orquestrador continua funcionando exatamente como hoje.

### Comportamento de Projeto Externo sem Experts
- Sistema funciona normalmente
- Expert triage retorna `{}` (vazio)
- Cards executam sem contexto extra de experts
- Nenhuma mensagem de erro ou warning
- Usuário pode configurar experts a qualquer momento via modal

### Migração de Projetos Existentes
Projetos que já carregaram `.claude/` com experts do orquestrador podem ter experts incorretos.
**Solução manual:** Deletar pasta `.claude/commands/experts/` do projeto e recriar via modal.

### Extensibilidade
O `TECH_DETECTORS` em `expert_init_service.py` pode ser facilmente expandido para detectar:
- Angular, Vue, Svelte (frontend)
- Go, Rust, Java (backend)
- MongoDB, PostgreSQL, Redis (database)
- Docker, Kubernetes (infra)

---

## 6. Checklist de Implementação

```
[x] 1. Backend: Modificar project_manager.py (excluir experts da cópia)
[x] 2. Backend: Refatorar config/experts.py (carregamento dinâmico)
[x] 3. Backend: Criar expert_init_service.py
[x] 4. Backend: Novos endpoints em routes/experts.py
[x] 5. Backend: Atualizar expert_triage_service.py (usar projeto atual)
[x] 6. Frontend: Criar ExpertsModal component
[x] 7. Frontend: Adicionar botão no dropdown do projeto
[x] 8. Testar fluxo completo com projeto externo
```

**Status: IMPLEMENTADO em 2025-01-13**
