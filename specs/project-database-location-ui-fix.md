# Plano de Implementação: Melhoria no Sistema de Projetos - Database Local e Correção UI

## 1. Resumo

Ajustar o sistema de carregamento de projetos para armazenar o banco de dados SQLite dentro da própria pasta do projeto (em `.claude/database.db`) ao invés do diretório centralizado `.project_data/`. Também corrigir o problema de z-index onde o modal de troca rápida de projetos aparece atrás da barra de status.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Migrar o armazenamento do banco de dados de `.project_data/[hash]/database.db` para `[project_path]/.claude/database.db`
- [x] Manter compatibilidade com projetos existentes que usam `.project_data/`
- [x] Corrigir problema de z-index no modal de troca de projetos
- [x] Preservar o histórico global de projetos em `.project_data/project_history.db`

### Fora do Escopo
- Migração automática de dados existentes de `.project_data/` para `.claude/`
- Alterações na estrutura do banco de dados
- Mudanças na funcionalidade de cópia da pasta `.claude`

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `/backend/src/database_manager.py` | Modificar | Alterar lógica para criar database em `.claude/` do projeto |
| `/backend/src/project_manager.py` | Modificar | Garantir criação da pasta `.claude/` antes do database |
| `/frontend/src/components/ProjectLoader/ProjectLoader.module.css` | Modificar | Ajustar z-index do modal |
| `/frontend/src/App.module.css` | Modificar | Adicionar z-index explícito ao header |
| `/backend/src/config.py` | Modificar | Adicionar flag para modo de armazenamento do database |

### Detalhes Técnicos

#### 1. Modificação do DatabaseManager (`/backend/src/database_manager.py`)

Alterar o método `initialize_project_database` para criar o database dentro da pasta do projeto:

```python
async def initialize_project_database(self, project_path: str) -> str:
    """Initialize a database for a specific project."""
    # Normalizar o caminho
    project_path = os.path.abspath(project_path)
    project_id = self._generate_project_id(project_path)

    # NOVO: Criar database dentro da pasta .claude do projeto
    claude_dir = os.path.join(project_path, '.claude')

    # Garantir que a pasta .claude existe
    if not os.path.exists(claude_dir):
        os.makedirs(claude_dir)

    # Definir caminho do database no projeto
    db_path = os.path.join(claude_dir, 'database.db')

    # Verificar se já existe um database em .project_data (compatibilidade)
    legacy_db_dir = os.path.join(self.base_dir, project_id)
    legacy_db_path = os.path.join(legacy_db_dir, 'database.db')

    # Se existe database legado e não existe no novo local, copiar
    if os.path.exists(legacy_db_path) and not os.path.exists(db_path):
        import shutil
        shutil.copy2(legacy_db_path, db_path)
        logger.info(f"Migrated database from {legacy_db_path} to {db_path}")

    # Criar URL do database
    db_url = f"sqlite+aiosqlite:///{db_path}"

    # Criar engine e SessionLocal
    engine = create_async_engine(db_url, echo=False)
    SessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    # Armazenar no cache
    self.project_databases[project_id] = {
        'engine': engine,
        'SessionLocal': SessionLocal,
        'db_url': db_url,
        'path': project_path,
        'db_path': db_path  # Adicionar caminho do database
    }

    # Criar tabelas se necessário
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Definir como projeto atual
    self.current_project_id = project_id

    logger.info(f"Initialized database for project at {project_path}")
    logger.info(f"Database location: {db_path}")

    return project_id
```

Adicionar método para obter informações do database do projeto:

```python
def get_project_database_info(self, project_path: str = None) -> dict:
    """Get database information for a project."""
    if project_path:
        project_id = self._generate_project_id(project_path)
    else:
        project_id = self.current_project_id

    if project_id and project_id in self.project_databases:
        db_info = self.project_databases[project_id]
        return {
            'database_path': db_info.get('db_path'),
            'project_path': db_info.get('path'),
            'is_active': project_id == self.current_project_id
        }

    return None
```

#### 2. Ajuste no ProjectManager (`/backend/src/project_manager.py`)

Garantir que a pasta `.claude` seja criada antes de inicializar o database:

```python
async def load_project(self, project_path: str) -> Dict[str, Any]:
    """Load a project and initialize its database."""
    # Validar se o caminho existe e é um diretório
    if not os.path.exists(project_path):
        raise ValueError(f"Path does not exist: {project_path}")

    if not os.path.isdir(project_path):
        raise ValueError(f"Path is not a directory: {project_path}")

    # Verificar e criar pasta .claude se necessário
    claude_path = os.path.join(project_path, '.claude')
    claude_config = None

    if not os.path.exists(claude_path):
        # Copiar a pasta .claude do root
        root_claude_path = os.path.join(self.root_path, '.claude')
        if os.path.exists(root_claude_path):
            self._copy_claude_folder(root_claude_path, claude_path)
            claude_config = self._load_claude_config(claude_path)
        else:
            # Criar pasta .claude vazia se não existir no root
            os.makedirs(claude_path)
            claude_config = {}
    else:
        claude_config = self._load_claude_config(claude_path)

    # IMPORTANTE: Inicializar database DEPOIS de garantir que .claude existe
    project_id = await db_manager.initialize_project_database(project_path)

    # Resto do código permanece igual...
```

#### 3. Correção de Z-Index no Modal (`/frontend/src/components/ProjectLoader/ProjectLoader.module.css`)

Aumentar z-index para garantir que fique acima de todos os elementos:

```css
:root {
  /* Aumentar valores de z-index para garantir visibilidade */
  --z-modal-backdrop: 100000;
  --z-modal-content: 100001;
  --z-modal-tooltip: 100002;
}

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  animation: fadeIn 0.2s ease-in-out;
  /* Adicionar para garantir que fique acima */
  isolation: isolate;
}

.modal {
  background: var(--glass-bg-heavy);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  padding: var(--space-6);
  z-index: var(--z-modal-content);
  position: relative;
  animation: slideUp 0.3s ease-out;
  /* Adicionar para criar novo contexto de empilhamento */
  transform: translateZ(0);
  will-change: transform;
}
```

#### 4. Ajuste no Header (`/frontend/src/App.module.css`)

Adicionar z-index explícito ao header para definir ordem de empilhamento:

```css
.header {
  position: relative;
  padding: var(--space-6) var(--space-8);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Adicionar z-index explícito para o header */
  z-index: 100;
  /* Garantir que não interfira com modais */
  isolation: isolate;
}

/* Ajustar também o dropdown do ProjectSwitcher se necessário */
.projectActions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  /* Garantir que dropdowns fiquem acima do header mas abaixo de modais */
  position: relative;
  z-index: 110;
}
```

#### 5. Adicionar Configuração no Backend (`/backend/src/config.py`)

Adicionar flag para controlar onde o database é armazenado (para facilitar testes e migração):

```python
class Settings(BaseSettings):
    # Configurações existentes...
    database_url: str = Field(
        default="sqlite+aiosqlite:///./auth.db",
        description="Main database URL"
    )
    project_data_dir: str = Field(
        default=".project_data",
        description="Directory for project data storage"
    )

    # NOVO: Flag para controlar local do database do projeto
    store_db_in_project: bool = Field(
        default=True,
        description="Store project database in .claude folder (True) or .project_data (False)"
    )

    # Flag para auto-migração de databases legados
    auto_migrate_legacy_db: bool = Field(
        default=True,
        description="Automatically migrate databases from .project_data to .claude"
    )
```

#### 6. Adicionar Endpoint para Informações do Database (`/backend/src/routes/projects.py`)

Adicionar endpoint para verificar onde o database está armazenado:

```python
@router.get("/current/database-info")
async def get_database_info():
    """Get information about the current project's database."""
    try:
        db_info = db_manager.get_project_database_info()
        if not db_info:
            raise HTTPException(
                status_code=404,
                detail="No active project"
            )

        return {
            "database_path": db_info['database_path'],
            "project_path": db_info['project_path'],
            "is_active": db_info['is_active'],
            "storage_mode": "project" if '.claude' in db_info['database_path'] else "centralized"
        }
    except Exception as e:
        logger.error(f"Error getting database info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting database info: {str(e)}"
        )
```

---

## 4. Testes

### Unitários
- [x] Teste de criação de database em `.claude/database.db`
- [x] Teste de detecção e uso de database legado em `.project_data/`
- [x] Teste de fallback quando `.claude/` não pode ser criada
- [x] Teste do endpoint `/current/database-info`

### Integração
- [x] Carregar projeto novo e verificar criação do database em `.claude/`
- [x] Carregar projeto com database legado e verificar compatibilidade
- [x] Trocar entre projetos e verificar isolamento dos databases
- [x] Verificar que modal aparece corretamente acima do header
- [x] Testar dropdown do ProjectSwitcher com novo z-index

### Manual
- [x] Verificar visualmente que modais aparecem acima de todos elementos
- [x] Confirmar que databases são criados no local correto
- [x] Testar fluxo completo de carregamento e troca de projetos

---

## 5. Considerações

### Riscos
- **Migração de Dados**: Projetos existentes podem ter dados em `.project_data/` que precisam ser preservados
  - **Mitigação**: Implementar detecção automática e uso de database legado se existir

- **Permissões**: Pode não ter permissão para criar `.claude/` em alguns projetos
  - **Mitigação**: Fallback para `.project_data/` se falhar criação em `.claude/`

- **Conflitos de Z-Index**: Outros componentes podem ter z-index muito altos
  - **Mitigação**: Usar valores muito altos (100000+) e `isolation: isolate`

### Dependências
- Nenhuma nova dependência externa necessária
- Manter compatibilidade com SQLite e aiosqlite existentes

### Melhorias Futuras
- Implementar comando para migrar databases de `.project_data/` para `.claude/`
- Adicionar indicador visual mostrando onde o database está armazenado
- Possibilidade de escolher local do database por projeto