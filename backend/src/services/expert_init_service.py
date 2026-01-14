"""Service para analisar codebase e criar experts em projetos.

Este serviço é responsável por:
1. Detectar tecnologias usadas em um projeto
2. Sugerir experts baseados nas tecnologias detectadas
3. Criar estrutura de experts (config.json, KNOWLEDGE.md, commands)
4. Deletar experts existentes
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class ExpertInitService:
    """Serviço para analisar codebase e criar experts."""

    # Detectores de tecnologia
    # Cada detector tem:
    # - markers: arquivos que indicam a presença da tecnologia
    # - content_check: verificar conteúdo de arquivos específicos
    # - file_patterns: padrões de arquivos que o expert deve monitorar
    # - keywords: palavras-chave para identificação em cards
    # - name: nome amigável do expert
    TECH_DETECTORS = {
        "react-frontend": {
            "markers": ["package.json"],
            "content_check": {"package.json": ["\"react\"", "react-dom"]},
            "file_patterns": [
                "src/components/**",
                "src/hooks/**",
                "src/pages/**",
                "src/contexts/**"
            ],
            "keywords": [
                "react", "component", "componente", "hook", "useState", "useEffect",
                "tsx", "jsx", "css", "estilo", "style", "layout", "UI", "interface",
                "frontend", "pagina", "page", "modal", "form"
            ],
            "name": "React Frontend Expert"
        },
        "vue-frontend": {
            "markers": ["package.json"],
            "content_check": {"package.json": ["\"vue\""]},
            "file_patterns": [
                "src/components/**",
                "src/views/**",
                "src/composables/**",
                "src/stores/**"
            ],
            "keywords": [
                "vue", "component", "composable", "ref", "reactive",
                "template", "pinia", "vuex", "router"
            ],
            "name": "Vue Frontend Expert"
        },
        "angular-frontend": {
            "markers": ["angular.json", "package.json"],
            "content_check": {"package.json": ["@angular/core"]},
            "file_patterns": [
                "src/app/**",
                "src/components/**",
                "src/services/**"
            ],
            "keywords": [
                "angular", "component", "service", "module", "directive",
                "pipe", "observable", "rxjs", "ngrx"
            ],
            "name": "Angular Frontend Expert"
        },
        "node-backend": {
            "markers": ["package.json"],
            "content_check": {"package.json": ["express", "fastify", "koa", "nestjs", "hapi"]},
            "file_patterns": [
                "src/routes/**",
                "src/controllers/**",
                "src/services/**",
                "src/middleware/**",
                "routes/**",
                "controllers/**"
            ],
            "keywords": [
                "express", "api", "endpoint", "route", "rota", "middleware",
                "controller", "node", "backend", "server", "rest"
            ],
            "name": "Node.js Backend Expert"
        },
        "python-backend": {
            "markers": ["requirements.txt", "pyproject.toml", "setup.py", "Pipfile"],
            "content_check": {
                "requirements.txt": ["fastapi", "flask", "django", "starlette"],
                "pyproject.toml": ["fastapi", "flask", "django"]
            },
            "file_patterns": [
                "**/routes/**",
                "**/views/**",
                "**/services/**",
                "**/api/**",
                "app/**"
            ],
            "keywords": [
                "fastapi", "flask", "django", "api", "endpoint", "route",
                "service", "python", "pydantic", "backend", "servidor"
            ],
            "name": "Python Backend Expert"
        },
        "database": {
            "markers": [
                "prisma/schema.prisma",
                "alembic.ini",
                "migrations/",
                "drizzle.config.ts",
                "knexfile.js"
            ],
            "file_patterns": [
                "**/models/**",
                "**/migrations/**",
                "**/entities/**",
                "**/repositories/**",
                "prisma/**",
                "drizzle/**"
            ],
            "keywords": [
                "model", "database", "banco", "migration", "schema",
                "query", "repository", "entity", "orm", "sql",
                "prisma", "drizzle", "sequelize", "typeorm"
            ],
            "name": "Database Expert"
        },
        "nextjs": {
            "markers": ["next.config.js", "next.config.mjs", "next.config.ts"],
            "content_check": {"package.json": ["next"]},
            "file_patterns": [
                "app/**",
                "pages/**",
                "components/**",
                "lib/**"
            ],
            "keywords": [
                "nextjs", "next", "ssr", "ssg", "api route", "server component",
                "client component", "app router", "pages router"
            ],
            "name": "Next.js Expert"
        },
        "testing": {
            "markers": [
                "jest.config.js",
                "jest.config.ts",
                "vitest.config.ts",
                "playwright.config.ts",
                "cypress.config.js"
            ],
            "file_patterns": [
                "**/*.test.*",
                "**/*.spec.*",
                "__tests__/**",
                "tests/**",
                "e2e/**"
            ],
            "keywords": [
                "test", "teste", "jest", "vitest", "playwright", "cypress",
                "mock", "stub", "assertion", "coverage", "e2e", "unit"
            ],
            "name": "Testing Expert"
        }
    }

    async def analyze_codebase(self, project_path: str) -> List[Dict[str, Any]]:
        """
        Analisa codebase e retorna sugestões de experts.

        Args:
            project_path: Caminho do projeto a analisar

        Returns:
            Lista de sugestões de experts com id, name, keywords, file_patterns
        """
        path = Path(project_path)
        suggestions = []

        for tech_id, detector in self.TECH_DETECTORS.items():
            if await self._detect_technology(path, detector):
                # Descobrir diretórios que realmente existem
                real_patterns = await self._discover_patterns(path, detector["file_patterns"])

                if real_patterns:  # Só sugere se encontrou patterns válidos
                    suggestions.append({
                        "id": tech_id,
                        "name": detector["name"],
                        "keywords": detector["keywords"],
                        "file_patterns": real_patterns,
                        "detected": True
                    })

        return suggestions

    async def _detect_technology(self, path: Path, detector: Dict) -> bool:
        """
        Verifica se uma tecnologia existe no projeto.

        Args:
            path: Caminho do projeto
            detector: Configuração do detector

        Returns:
            True se a tecnologia foi detectada
        """
        # Verificar arquivos marcadores
        for marker in detector.get("markers", []):
            marker_path = path / marker
            if marker_path.exists():
                # Se tem content_check, verificar conteúdo
                content_checks = detector.get("content_check", {})
                if marker in content_checks:
                    try:
                        content = marker_path.read_text(encoding='utf-8')
                        if any(check in content for check in content_checks[marker]):
                            return True
                    except (IOError, UnicodeDecodeError):
                        pass
                else:
                    # Marcador existe, sem verificação de conteúdo
                    return True

        return False

    async def _discover_patterns(self, path: Path, patterns: List[str]) -> List[str]:
        """
        Descobre quais patterns realmente existem no projeto.

        Args:
            path: Caminho do projeto
            patterns: Lista de patterns a verificar

        Returns:
            Lista de patterns que existem no projeto
        """
        existing = []

        for pattern in patterns:
            # Extrair diretório base do pattern
            if "**" in pattern:
                base_dir = pattern.split("**")[0].rstrip("/")
            else:
                base_dir = str(Path(pattern).parent)

            # Verificar se diretório existe
            check_path = path / base_dir if base_dir else path
            if check_path.exists() and check_path.is_dir():
                existing.append(pattern)

        # Fallback: se nenhum pattern existir, usar os 2 primeiros
        return existing if existing else patterns[:2]

    async def create_expert(
        self,
        project_path: str,
        expert_id: str,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Cria um expert em um projeto.

        Args:
            project_path: Caminho do projeto
            expert_id: ID do expert (ex: "react-frontend")
            config: Configuração com name, keywords, file_patterns

        Returns:
            Dict com success e path do expert criado
        """
        experts_dir = Path(project_path) / ".claude" / "commands" / "experts" / expert_id
        experts_dir.mkdir(parents=True, exist_ok=True)

        name = config.get("name", f"{expert_id.replace('-', ' ').title()} Expert")
        keywords = config.get("keywords", [])
        file_patterns = config.get("file_patterns", [])

        # 1. Criar config.json
        config_file = experts_dir / "config.json"
        config_file.write_text(json.dumps({
            "name": name,
            "keywords": keywords,
            "file_patterns": file_patterns,
            "created_at": datetime.utcnow().isoformat()
        }, indent=2, ensure_ascii=False), encoding='utf-8')

        # 2. Criar KNOWLEDGE.md
        knowledge_file = experts_dir / "KNOWLEDGE.md"
        knowledge_content = f"""# {name} - Knowledge Base

## Status
- **Criado em:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}
- **Projeto:** {Path(project_path).name}
- **Sincronizado:** Pendente (execute `/experts:{expert_id}:sync`)

## Arquivos Monitorados
{chr(10).join(f'- `{p}`' for p in file_patterns)}

## Keywords para Identificação
{', '.join(keywords[:10])}{'...' if len(keywords) > 10 else ''}

## Estrutura do Domínio
*Esta seção será preenchida automaticamente ao executar sync*

## Arquivos Principais
*Esta seção será preenchida automaticamente ao executar sync*

## Padrões de Código
*Esta seção será preenchida automaticamente ao executar sync*
"""
        knowledge_file.write_text(knowledge_content, encoding='utf-8')

        # 3. Criar commands básicos
        self._create_commands(experts_dir, expert_id, name)

        return {
            "success": True,
            "path": str(experts_dir),
            "expert_id": expert_id
        }

    def _create_commands(self, experts_dir: Path, expert_id: str, name: str):
        """
        Cria arquivos de command para o expert.

        Args:
            experts_dir: Diretório do expert
            expert_id: ID do expert
            name: Nome amigável do expert
        """
        # Main command
        main_cmd = experts_dir / f"{expert_id}.md"
        main_cmd.write_text(f"""---
description: {name} - Expert especializado neste domínio do projeto
---

# {name}

Expert especializado em auxiliar com desenvolvimento neste domínio.

## Knowledge Base
Consulte o arquivo de conhecimento para entender o domínio:
`.claude/commands/experts/{expert_id}/KNOWLEDGE.md`

## Sub-comandos Disponíveis

- `/experts:{expert_id}:question` - Responder perguntas sobre este domínio
- `/experts:{expert_id}:sync` - Atualizar knowledge base com estado atual do código

## Quando Usar Este Expert

Este expert é automaticamente identificado quando cards mencionam palavras-chave
relacionadas ao domínio. Ele fornece contexto adicional para melhorar a qualidade
das implementações.
""", encoding='utf-8')

        # Question command
        question_cmd = experts_dir / "question.md"
        question_cmd.write_text(f"""---
description: Responde perguntas sobre {name}
allowed-tools: Read, Glob, Grep
---

# Question: {name}

Responda a pergunta do usuário consultando o knowledge base e arquivos do projeto.

## Instruções

1. Leia o KNOWLEDGE.md em `.claude/commands/experts/{expert_id}/KNOWLEDGE.md`
2. Use Glob para encontrar arquivos relevantes nos patterns configurados
3. Use Grep para buscar código específico
4. Responda com paths e line numbers quando relevante

## Pergunta

$ARGUMENTS
""", encoding='utf-8')

        # Sync command
        sync_cmd = experts_dir / "sync.md"
        sync_cmd.write_text(f"""---
description: Sincroniza knowledge base do {name}
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Sync: {name}

Atualize o KNOWLEDGE.md com informações atuais do projeto.

## Processo

1. Leia o config.json em `.claude/commands/experts/{expert_id}/config.json`
2. Use os `file_patterns` para varrer arquivos relevantes
3. Documente:
   - Estrutura de diretórios encontrada
   - Arquivos principais e suas responsabilidades
   - Padrões de código identificados
   - Dependências relevantes
4. Atualize o KNOWLEDGE.md preservando o formato

## Config do Expert
Localização: `.claude/commands/experts/{expert_id}/config.json`
""", encoding='utf-8')

    async def delete_expert(self, project_path: str, expert_id: str) -> bool:
        """
        Remove um expert de um projeto.

        Args:
            project_path: Caminho do projeto
            expert_id: ID do expert a remover

        Returns:
            True se removido com sucesso
        """
        expert_dir = Path(project_path) / ".claude" / "commands" / "experts" / expert_id

        if expert_dir.exists():
            shutil.rmtree(expert_dir)
            return True

        return False

    async def get_existing_experts(self, project_path: str) -> Dict[str, Dict[str, Any]]:
        """
        Lista experts existentes em um projeto.

        Args:
            project_path: Caminho do projeto

        Returns:
            Dict com expert_id -> config
        """
        experts_dir = Path(project_path) / ".claude" / "commands" / "experts"

        if not experts_dir.exists():
            return {}

        experts = {}

        for expert_dir in experts_dir.iterdir():
            if not expert_dir.is_dir():
                continue

            config_file = expert_dir / "config.json"
            if config_file.exists():
                try:
                    with open(config_file, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                    experts[expert_dir.name] = config
                except (json.JSONDecodeError, IOError):
                    continue

        return experts


# Instância singleton do serviço
expert_init_service = ExpertInitService()
