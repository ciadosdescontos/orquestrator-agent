"""Expert agents configuration.

Defines available expert agents and their detection criteria.
Each expert has:
- name: Display name
- knowledge_path: Path to KNOWLEDGE.md file (relative to project root)
- keywords: Words that suggest this expert is relevant
- file_patterns: File path patterns this expert specializes in
"""

from typing import Dict, List, TypedDict


class ExpertConfig(TypedDict):
    """Configuration for a single expert agent."""
    name: str
    knowledge_path: str
    keywords: List[str]
    file_patterns: List[str]


# Available expert agents in the system
AVAILABLE_EXPERTS: Dict[str, ExpertConfig] = {
    "database": {
        "name": "Database Expert",
        "knowledge_path": ".claude/commands/experts/database/KNOWLEDGE.md",
        "keywords": [
            "model", "database", "migration", "campo", "tabela", "SQL",
            "repository", "banco", "sqlite", "sqlalchemy", "query",
            "schema", "foreign key", "index", "coluna", "ORM",
            "persistencia", "dados", "armazenamento"
        ],
        "file_patterns": [
            "backend/src/models/",
            "backend/migrations/",
            "backend/src/repositories/",
            "backend/src/database",
            "backend/src/schemas/"
        ]
    },
    "kanban-flow": {
        "name": "Kanban Flow Expert",
        "knowledge_path": ".claude/commands/experts/kanban-flow/KNOWLEDGE.md",
        "keywords": [
            "card", "coluna", "transicao", "workflow", "kanban", "board",
            "drag", "drop", "arrastar", "mover", "backlog", "plan",
            "implement", "test", "review", "done", "SDLC", "automacao",
            "lifecycle", "ciclo de vida"
        ],
        "file_patterns": [
            "frontend/src/components/Board/",
            "frontend/src/components/Card/",
            "frontend/src/components/Column/",
            "frontend/src/hooks/useWorkflow",
            "frontend/src/hooks/useAgent",
            "backend/src/routes/cards"
        ]
    },
    "frontend": {
        "name": "Frontend Expert",
        "knowledge_path": ".claude/commands/experts/frontend/KNOWLEDGE.md",
        "keywords": [
            "react", "componente", "component", "hook", "useState", "useEffect",
            "tsx", "jsx", "css", "estilo", "style", "layout", "UI", "interface",
            "dnd-kit", "drag", "drop", "vite", "typescript", "frontend",
            "pagina", "page", "modal", "form", "input", "button", "theme",
            "dark mode", "light mode", "responsive", "mobile"
        ],
        "file_patterns": [
            "frontend/src/components/",
            "frontend/src/hooks/",
            "frontend/src/pages/",
            "frontend/src/api/",
            "frontend/src/types/",
            "frontend/src/utils/",
            "frontend/src/contexts/",
            "frontend/src/styles/"
        ]
    },
    "backend": {
        "name": "Backend Expert",
        "knowledge_path": ".claude/commands/experts/backend/KNOWLEDGE.md",
        "keywords": [
            "fastapi", "api", "endpoint", "route", "rota", "service", "servico",
            "python", "pydantic", "schema", "dto", "websocket", "ws",
            "streaming", "async", "await", "agent", "claude", "gemini",
            "chat", "execution", "workflow", "backend", "servidor", "server"
        ],
        "file_patterns": [
            "backend/src/routes/",
            "backend/src/services/",
            "backend/src/schemas/",
            "backend/src/config/",
            "backend/src/main.py",
            "backend/src/agent",
            "backend/src/execution.py",
            "backend/src/project_manager.py"
        ]
    }
}


def get_expert_config(expert_id: str) -> ExpertConfig | None:
    """Get configuration for a specific expert."""
    return AVAILABLE_EXPERTS.get(expert_id)


def get_all_expert_ids() -> List[str]:
    """Get list of all available expert IDs."""
    return list(AVAILABLE_EXPERTS.keys())
