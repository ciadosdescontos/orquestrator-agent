# Git Worktree Isolation para Execução Paralela de Cards

## 1. Resumo

Implementar sistema de isolamento de código usando Git Worktrees para permitir execução paralela segura de múltiplos cards sem conflitos. Cada card terá seu próprio diretório de trabalho e branch isolada, eliminando race conditions e permitindo que N cards modifiquem o mesmo arquivo simultaneamente sem interferência.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar worktree isolado automaticamente quando card entra em execução
- [x] Garantir que cada card trabalhe em sua própria branch
- [x] Implementar merge automático ao completar workflow
- [x] Adicionar detecção e gerenciamento de conflitos
- [x] Criar UI para visualizar status de branches e resolver conflitos
- [x] Adicionar sub-estado MERGING em cards da coluna REVIEW
- [x] Implementar limpeza automática de worktrees e branches

### Fora do Escopo
- Sistema de rebase interativo (apenas merge simples)
- Suporte a múltiplos worktrees por card (apenas 1:1)
- Integração com GitHub/GitLab PRs (merge local apenas)
- Sincronização com remote (push automático)
- Resolução manual de conflitos (IA resolve automaticamente)

---

## 3. Implementação

### Arquivos a Serem Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/git_workspace.py` | Criar | Módulo principal de gerenciamento de worktrees |
| `backend/src/conflict_resolver.py` | Criar | Resolução automática de conflitos via IA |
| `frontend/src/components/BranchIndicator/BranchIndicator.tsx` | Criar | Badge de branch no card |
| `frontend/src/components/BranchesDropdown/BranchesDropdown.tsx` | Criar | Dropdown no header com branches ativas |

### Arquivos a Serem Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/models/card.py` | Modificar | Adicionar campos `branch_name`, `worktree_path`, `merge_status` |
| `backend/src/agent.py` | Modificar | Usar worktree path como `cwd` do Claude Agent |
| `backend/src/main.py` | Modificar | Adicionar endpoints de merge e conflitos |
| `frontend/src/types/index.ts` | Modificar | Adicionar tipos para merge |
| `frontend/src/components/Card/Card.tsx` | Modificar | Adicionar BranchIndicator |
| `frontend/src/hooks/useWorkflowAutomation.ts` | Modificar | Adicionar lógica de merge ao completar REVIEW |
| `database/schema.sql` | Modificar | Adicionar campos para worktree no Card |

---

## 4. Detalhes Técnicos

### 4.1 Backend - Modelo de Dados

#### Atualizar `backend/src/models/card.py`

```python
from sqlalchemy import Column, String

class Card(Base):
    # ... campos existentes ...

    # Campos para worktree (direto no Card, sem modelo separado)
    branch_name = Column(String, nullable=True)
    worktree_path = Column(String, nullable=True)
    merge_status = Column(String, default="none")  # none, merging, resolving, merged, failed
```

**Nota:**
- Removemos modelo `Workspace` separado - campos ficam no Card
- Não há modelo `MergeConflict` - IA resolve automaticamente, sem salvar conflitos
- Status `resolving` indica que IA está resolvendo conflitos
- Status `failed` indica que IA não conseguiu resolver (requer atenção humana)

---

### 4.2 Backend - Git Workspace Manager

#### `backend/src/git_workspace.py`

```python
import asyncio
import shlex
import time
from asyncio import Lock
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass, field

# Lock global para operações de merge (evita race conditions)
_merge_lock = Lock()

# Limite de worktrees simultâneos
MAX_CONCURRENT_WORKTREES = 10

@dataclass
class WorktreeResult:
    success: bool
    worktree_path: Optional[str] = None
    branch_name: Optional[str] = None
    error: Optional[str] = None

@dataclass
class MergeResult:
    success: bool
    has_conflicts: bool = False
    conflicted_files: List[str] = field(default_factory=list)
    error: Optional[str] = None

class GitWorkspaceManager:
    """Gerenciador de worktrees do Git para isolamento de cards"""

    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.worktrees_dir = self.project_path / ".worktrees"

    async def _run_git_command(
        self,
        args: List[str],
        cwd: Optional[str] = None
    ) -> tuple[int, str, str]:
        """
        Executa comando git de forma segura.

        Args:
            args: Lista de argumentos (ex: ["git", "worktree", "add", ...])
            cwd: Diretório de trabalho (usa project_path se não especificado)

        Returns:
            Tupla (returncode, stdout, stderr)
        """
        work_dir = cwd or str(self.project_path)

        process = await asyncio.create_subprocess_exec(
            *args,
            cwd=work_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()
        return process.returncode, stdout.decode(), stderr.decode()

    async def _get_default_branch(self) -> str:
        """Detecta branch principal do repositório"""
        # Tentar via remote HEAD
        returncode, stdout, _ = await self._run_git_command(
            ["git", "symbolic-ref", "refs/remotes/origin/HEAD"]
        )
        if returncode == 0 and stdout.strip():
            return stdout.strip().replace("refs/remotes/origin/", "")

        # Tentar via config
        returncode, stdout, _ = await self._run_git_command(
            ["git", "config", "--get", "init.defaultBranch"]
        )
        if returncode == 0 and stdout.strip():
            return stdout.strip()

        # Verificar se main ou master existe
        for branch in ["main", "master"]:
            returncode, _, _ = await self._run_git_command(
                ["git", "rev-parse", "--verify", branch]
            )
            if returncode == 0:
                return branch

        return "main"  # Fallback

    async def recover_state(self) -> None:
        """
        Recupera de estado inconsistente do git.
        Deve ser chamado na inicialização do manager.
        """
        # Verificar se há merge em andamento
        merge_head = self.project_path / ".git" / "MERGE_HEAD"
        if merge_head.exists():
            await self._run_git_command(["git", "merge", "--abort"])

        # Verificar se há rebase em andamento
        rebase_dir = self.project_path / ".git" / "rebase-merge"
        if rebase_dir.exists():
            await self._run_git_command(["git", "rebase", "--abort"])

    async def _branch_exists(self, branch_name: str) -> bool:
        """Verifica se branch existe"""
        returncode, stdout, _ = await self._run_git_command(
            ["git", "branch", "--list", branch_name]
        )
        return returncode == 0 and stdout.strip() != ""

    async def _cleanup_stale_branch(self, branch_name: str) -> None:
        """Remove branch órfã se existir"""
        if await self._branch_exists(branch_name):
            await self._run_git_command(["git", "branch", "-D", branch_name])

    async def create_worktree(
        self,
        card_id: str,
        base_branch: Optional[str] = None
    ) -> WorktreeResult:
        """
        Cria worktree isolado para um card.

        Args:
            card_id: ID do card
            base_branch: Branch base (detecta automaticamente se não especificado)

        Returns:
            WorktreeResult com path e nome da branch
        """
        # Verificar limite de worktrees
        active = await self.list_active_worktrees()
        card_worktrees = [w for w in active if w.get('branch', '').startswith('agent/')]
        if len(card_worktrees) >= MAX_CONCURRENT_WORKTREES:
            return WorktreeResult(
                success=False,
                error=f"Limite de {MAX_CONCURRENT_WORKTREES} worktrees atingido"
            )

        # Criar diretório de worktrees se não existir
        self.worktrees_dir.mkdir(exist_ok=True)

        # Detectar branch base
        if not base_branch:
            base_branch = await self._get_default_branch()

        # Definir paths com prefixo mais seguro
        short_id = card_id[:8] if len(card_id) > 8 else card_id
        timestamp = int(time.time())
        branch_name = f"agent/{short_id}-{timestamp}"
        worktree_path = self.worktrees_dir / f"card-{short_id}"

        # Verificar se worktree já existe
        if worktree_path.exists():
            # Tentar limpar worktree antigo
            await self._run_git_command(
                ["git", "worktree", "remove", str(worktree_path), "--force"]
            )

        # Limpar branch órfã se existir
        await self._cleanup_stale_branch(branch_name)

        # Criar worktree com nova branch baseada na branch principal
        returncode, stdout, stderr = await self._run_git_command([
            "git", "worktree", "add",
            str(worktree_path),
            "-b", branch_name,
            base_branch
        ])

        if returncode != 0:
            return WorktreeResult(
                success=False,
                error=f"Failed to create worktree: {stderr}"
            )

        return WorktreeResult(
            success=True,
            worktree_path=str(worktree_path),
            branch_name=branch_name
        )

    async def merge_worktree(
        self,
        card_id: str,
        branch_name: str,
        target_branch: Optional[str] = None
    ) -> MergeResult:
        """
        Faz merge da branch do card para a branch principal.
        Usa lock para evitar race conditions entre múltiplos merges.

        Args:
            card_id: ID do card
            branch_name: Nome da branch a ser mergeada
            target_branch: Branch destino (detecta automaticamente se não especificado)

        Returns:
            MergeResult com status do merge
        """
        async with _merge_lock:
            # Recuperar de estado inconsistente
            await self.recover_state()

            # Detectar branch destino
            if not target_branch:
                target_branch = await self._get_default_branch()

            # 1. Checkout para a branch de destino
            returncode, _, stderr = await self._run_git_command(
                ["git", "checkout", target_branch]
            )
            if returncode != 0:
                return MergeResult(
                    success=False,
                    error=f"Failed to checkout {target_branch}: {stderr}"
                )

            # 2. Pull para garantir que está atualizado (opcional, ignora erro)
            await self._run_git_command(
                ["git", "pull", "origin", target_branch]
            )

            # 3. Tentar merge
            returncode, stdout, stderr = await self._run_git_command(
                ["git", "merge", branch_name, "--no-ff",
                 "-m", f"Merge branch '{branch_name}' via agent workflow"]
            )

            # 4. Verificar conflitos
            if returncode != 0:
                if "CONFLICT" in stdout or "CONFLICT" in stderr:
                    # Obter arquivos conflitados
                    _, conflict_output, _ = await self._run_git_command(
                        ["git", "diff", "--name-only", "--diff-filter=U"]
                    )
                    conflicted_files = [
                        f.strip() for f in conflict_output.split('\n') if f.strip()
                    ]

                    # Abortar merge para não deixar estado inconsistente
                    await self._run_git_command(["git", "merge", "--abort"])

                    return MergeResult(
                        success=False,
                        has_conflicts=True,
                        conflicted_files=conflicted_files
                    )

                return MergeResult(success=False, error=f"Merge failed: {stderr}")

            # Merge bem-sucedido
            return MergeResult(success=True, has_conflicts=False)

    async def cleanup_worktree(
        self,
        card_id: str,
        branch_name: str,
        delete_branch: bool = True
    ) -> bool:
        """
        Remove worktree e opcionalmente a branch.

        Args:
            card_id: ID do card
            branch_name: Nome da branch
            delete_branch: Se deve deletar a branch também

        Returns:
            True se cleanup bem-sucedido
        """
        short_id = card_id[:8] if len(card_id) > 8 else card_id
        worktree_path = self.worktrees_dir / f"card-{short_id}"

        # Remover worktree
        if worktree_path.exists():
            returncode, _, stderr = await self._run_git_command(
                ["git", "worktree", "remove", str(worktree_path), "--force"]
            )
            if returncode != 0:
                print(f"Warning: Failed to remove worktree: {stderr}")
                return False

        # Deletar branch se solicitado
        if delete_branch and branch_name:
            returncode, _, stderr = await self._run_git_command(
                ["git", "branch", "-D", branch_name]
            )
            if returncode != 0:
                print(f"Warning: Failed to delete branch: {stderr}")

        return True

    async def get_conflict_diff(self, branch_name: str) -> Optional[str]:
        """
        Obtém diff entre branch do card e branch principal.

        Args:
            branch_name: Nome da branch do card

        Returns:
            Diff como string ou None
        """
        target_branch = await self._get_default_branch()

        _, diff_output, _ = await self._run_git_command(
            ["git", "diff", f"{target_branch}...{branch_name}"]
        )

        return diff_output if diff_output else None

    async def resolve_conflict(
        self,
        branch_name: str,
        resolution: Dict[str, str]
    ) -> bool:
        """
        Resolve conflitos aplicando a resolução fornecida.

        Args:
            branch_name: Nome da branch do card
            resolution: Dict com {filepath: "ours"|"theirs"}

        Returns:
            True se resolução bem-sucedida
        """
        async with _merge_lock:
            await self.recover_state()

            target_branch = await self._get_default_branch()

            # Checkout e merge
            await self._run_git_command(["git", "checkout", target_branch])
            await self._run_git_command(
                ["git", "merge", branch_name, "--no-ff"]
            )

            # Aplicar resoluções
            for filepath, strategy in resolution.items():
                if strategy == "ours":
                    await self._run_git_command(
                        ["git", "checkout", "--ours", filepath]
                    )
                elif strategy == "theirs":
                    await self._run_git_command(
                        ["git", "checkout", "--theirs", filepath]
                    )

                # Adicionar arquivo resolvido
                await self._run_git_command(["git", "add", filepath])

            # Commit do merge
            returncode, _, stderr = await self._run_git_command([
                "git", "commit",
                "-m", f"Merge branch '{branch_name}' (conflicts resolved)"
            ])

            return returncode == 0

    async def list_active_worktrees(self) -> List[Dict[str, str]]:
        """Lista todos os worktrees ativos"""
        _, output, _ = await self._run_git_command(
            ["git", "worktree", "list", "--porcelain"]
        )

        worktrees = []
        current = {}

        for line in output.split('\n'):
            if line.startswith('worktree '):
                if current:
                    worktrees.append(current)
                current = {'path': line.split(' ', 1)[1]}
            elif line.startswith('branch '):
                current['branch'] = line.split(' ', 1)[1].replace('refs/heads/', '')

        if current:
            worktrees.append(current)

        return worktrees

    async def cleanup_orphan_worktrees(self, active_card_ids: List[str]) -> int:
        """
        Remove worktrees órfãos (sem card associado).

        Args:
            active_card_ids: Lista de IDs de cards ativos

        Returns:
            Número de worktrees removidos
        """
        removed = 0
        worktrees = await self.list_active_worktrees()

        for wt in worktrees:
            branch = wt.get('branch', '')
            if branch.startswith('agent/'):
                # Extrair card_id do branch name (agent/{short_id}-{timestamp})
                parts = branch.replace('agent/', '').split('-')
                if parts:
                    short_id = parts[0]
                    # Verificar se algum card ativo tem esse short_id
                    is_active = any(
                        card_id.startswith(short_id)
                        for card_id in active_card_ids
                    )
                    if not is_active:
                        # Worktree órfão - remover
                        await self._run_git_command(
                            ["git", "worktree", "remove", wt['path'], "--force"]
                        )
                        await self._run_git_command(
                            ["git", "branch", "-D", branch]
                        )
                        removed += 1

        return removed
```

---

### 4.3 Backend - Conflict Resolver (IA)

#### `backend/src/conflict_resolver.py`

```python
import asyncio
import json
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass

@dataclass
class ConflictResolutionResult:
    success: bool
    resolved_files: List[str] = None
    error: Optional[str] = None
    tests_passed: bool = False
    rolled_back: bool = False

class ConflictResolver:
    """
    Resolve conflitos de merge automaticamente usando IA.

    Mecanismos de segurança:
    1. Backup tag antes de qualquer modificação
    2. IA recebe contexto completo (descrição do card + diffs)
    3. Testes automáticos após resolução
    4. Rollback automático se testes falharem
    """

    def __init__(self, project_path: str, git_manager: 'GitWorkspaceManager'):
        self.project_path = Path(project_path)
        self.git_manager = git_manager

    async def _create_backup_tag(self, card_id: str) -> str:
        """Cria tag de backup antes do merge"""
        tag_name = f"backup/pre-merge-{card_id}"

        await self.git_manager._run_git_command([
            "git", "tag", "-f", tag_name
        ])

        return tag_name

    async def _rollback_to_backup(self, tag_name: str) -> bool:
        """Rollback para o backup em caso de falha"""
        returncode, _, stderr = await self.git_manager._run_git_command([
            "git", "reset", "--hard", tag_name
        ])
        return returncode == 0

    async def _delete_backup_tag(self, tag_name: str) -> None:
        """Remove tag de backup após sucesso"""
        await self.git_manager._run_git_command([
            "git", "tag", "-d", tag_name
        ])

    async def _get_conflict_context(
        self,
        card_description: str,
        branch_name: str,
        conflicted_files: List[str]
    ) -> str:
        """
        Monta contexto completo para a IA resolver conflitos.

        Inclui:
        - Descrição do card (objetivo)
        - O que a branch do card mudou
        - O que mudou na main desde que o card começou
        - Conteúdo dos arquivos com marcadores de conflito
        """
        target_branch = await self.git_manager._get_default_branch()

        # 1. Diff da branch do card (o que o card fez)
        _, card_diff, _ = await self.git_manager._run_git_command([
            "git", "diff", f"{target_branch}...{branch_name}"
        ])

        # 2. Diff da main desde o ponto de divergência (o que outros fizeram)
        _, merge_base, _ = await self.git_manager._run_git_command([
            "git", "merge-base", target_branch, branch_name
        ])
        merge_base = merge_base.strip()

        _, main_diff, _ = await self.git_manager._run_git_command([
            "git", "diff", f"{merge_base}..{target_branch}"
        ])

        # 3. Conteúdo dos arquivos em conflito (com marcadores)
        conflicted_contents = {}
        for file in conflicted_files:
            file_path = self.project_path / file
            if file_path.exists():
                conflicted_contents[file] = file_path.read_text()

        context = f"""## Objetivo do Card
{card_description}

## O que a branch do card modificou
```diff
{card_diff[:5000] if len(card_diff) > 5000 else card_diff}
```

## O que mudou na main (por outros cards) desde que este card começou
```diff
{main_diff[:5000] if len(main_diff) > 5000 else main_diff}
```

## Arquivos em conflito (com marcadores <<<<<<< ======= >>>>>>>)
"""
        for file, content in conflicted_contents.items():
            context += f"\n### {file}\n```\n{content[:3000]}\n```\n"

        return context

    async def _run_tests(self) -> tuple[bool, str]:
        """
        Roda testes do projeto para verificar se resolução não quebrou nada.

        Tenta detectar automaticamente o comando de teste:
        - npm test / yarn test / pnpm test
        - pytest / python -m pytest
        - go test
        - cargo test
        """
        test_commands = [
            # Node.js
            (["npm", "test", "--", "--passWithNoTests"], "package.json"),
            (["yarn", "test", "--passWithNoTests"], "yarn.lock"),
            (["pnpm", "test", "--passWithNoTests"], "pnpm-lock.yaml"),
            # Python
            (["pytest", "-x", "-q"], "pytest.ini"),
            (["pytest", "-x", "-q"], "pyproject.toml"),
            (["python", "-m", "pytest", "-x", "-q"], "requirements.txt"),
            # Go
            (["go", "test", "./..."], "go.mod"),
            # Rust
            (["cargo", "test"], "Cargo.toml"),
        ]

        # Detectar qual comando usar
        for cmd, marker_file in test_commands:
            if (self.project_path / marker_file).exists():
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    cwd=str(self.project_path),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                output = stdout.decode() + stderr.decode()

                if process.returncode == 0:
                    return True, output
                else:
                    return False, output

        # Se não encontrou comando de teste, assume sucesso
        return True, "No test command detected, assuming success"

    async def resolve_conflicts(
        self,
        card_id: str,
        card_description: str,
        branch_name: str,
        conflicted_files: List[str],
        agent_executor  # Função que executa o Claude Agent
    ) -> ConflictResolutionResult:
        """
        Resolve conflitos automaticamente usando IA.

        Fluxo:
        1. Cria backup tag
        2. Inicia merge (deixando arquivos em conflito)
        3. Monta contexto para IA
        4. IA resolve cada arquivo
        5. Faz commit
        6. Roda testes
        7. Se testes passam: sucesso
        8. Se testes falham: rollback para backup
        """
        target_branch = await self.git_manager._get_default_branch()

        # 1. Criar backup
        backup_tag = await self._create_backup_tag(card_id)

        try:
            # 2. Checkout e iniciar merge (vai criar conflitos)
            await self.git_manager._run_git_command(["git", "checkout", target_branch])
            await self.git_manager._run_git_command(["git", "merge", branch_name, "--no-ff"])

            # 3. Montar contexto
            context = await self._get_conflict_context(
                card_description, branch_name, conflicted_files
            )

            # 4. IA resolve conflitos
            resolution_prompt = f"""Você precisa resolver conflitos de merge em um projeto.

{context}

## Instruções
Para CADA arquivo em conflito:
1. Analise o objetivo do card e o que cada lado mudou
2. Resolva o conflito PRESERVANDO as funcionalidades de ambos os lados quando possível
3. Se houver mudanças incompatíveis, priorize a mudança do CARD (é o trabalho mais recente)
4. REMOVA todos os marcadores de conflito (<<<<<<, =======, >>>>>>>)
5. O código resultante deve ser funcional e correto

IMPORTANTE:
- NÃO deixe nenhum marcador de conflito no código
- NÃO quebre funcionalidades existentes
- MANTENHA a consistência do código

Edite os arquivos em conflito para resolver os conflitos.
"""

            # Executar agent para resolver
            await agent_executor(
                prompt=resolution_prompt,
                cwd=str(self.project_path),
                allowed_tools=["Read", "Write", "Edit"]
            )

            # 5. Verificar se ainda há marcadores de conflito
            for file in conflicted_files:
                file_path = self.project_path / file
                if file_path.exists():
                    content = file_path.read_text()
                    if "<<<<<<<" in content or "=======" in content or ">>>>>>>" in content:
                        raise Exception(f"Conflict markers still present in {file}")

                # Adicionar arquivo resolvido
                await self.git_manager._run_git_command(["git", "add", file])

            # 6. Commit
            returncode, _, stderr = await self.git_manager._run_git_command([
                "git", "commit",
                "-m", f"Merge branch '{branch_name}' (conflicts resolved by AI)"
            ])

            if returncode != 0:
                raise Exception(f"Failed to commit: {stderr}")

            # 7. Rodar testes
            tests_passed, test_output = await self._run_tests()

            if not tests_passed:
                # 8. Rollback se testes falharem
                await self._rollback_to_backup(backup_tag)
                return ConflictResolutionResult(
                    success=False,
                    resolved_files=conflicted_files,
                    error=f"Tests failed after conflict resolution:\n{test_output[:1000]}",
                    tests_passed=False,
                    rolled_back=True
                )

            # Sucesso! Remover backup tag
            await self._delete_backup_tag(backup_tag)

            return ConflictResolutionResult(
                success=True,
                resolved_files=conflicted_files,
                tests_passed=True,
                rolled_back=False
            )

        except Exception as e:
            # Rollback em caso de qualquer erro
            await self._rollback_to_backup(backup_tag)
            await self.git_manager._run_git_command(["git", "merge", "--abort"])

            return ConflictResolutionResult(
                success=False,
                error=str(e),
                rolled_back=True
            )
```

---

### 4.4 Backend - Endpoints

#### Adicionar em `backend/src/main.py`

```python
from .git_workspace import GitWorkspaceManager, WorktreeResult, MergeResult
from .conflict_resolver import ConflictResolver

@app.post("/api/cards/{card_id}/workspace")
async def create_card_workspace(card_id: str, db: AsyncSession = Depends(get_db)):
    """Cria worktree isolado para o card"""

    # Obter projeto ativo
    project = await get_active_project(db)
    if not project:
        raise HTTPException(status_code=400, detail="No active project")

    # Verificar se projeto é um repo git
    git_dir = Path(project.path) / ".git"
    if not git_dir.exists():
        raise HTTPException(
            status_code=400,
            detail="Project is not a git repository. Worktrees disabled."
        )

    # Criar worktree
    git_manager = GitWorkspaceManager(project.path)
    await git_manager.recover_state()  # Garantir estado limpo
    result: WorktreeResult = await git_manager.create_worktree(card_id)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    # Atualizar card diretamente
    card_repo = CardRepository(db)
    await card_repo.update_card(card_id, {
        "branch_name": result.branch_name,
        "worktree_path": result.worktree_path,
        "merge_status": "none"
    })

    return {
        "success": True,
        "branchName": result.branch_name,
        "worktreePath": result.worktree_path
    }

@app.post("/api/cards/{card_id}/merge")
async def merge_card_workspace(
    card_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Faz merge da branch do card para main.
    Se houver conflitos, IA resolve automaticamente.
    """

    project = await get_active_project(db)
    if not project:
        raise HTTPException(status_code=400, detail="No active project")

    # Obter card
    card_repo = CardRepository(db)
    card = await card_repo.get_card(card_id)
    if not card or not card.branch_name:
        raise HTTPException(status_code=400, detail="Card has no active branch")

    # Atualizar status
    await card_repo.update_card(card_id, {"merge_status": "merging"})

    # Tentar merge
    git_manager = GitWorkspaceManager(project.path)
    result: MergeResult = await git_manager.merge_worktree(card_id, card.branch_name)

    if result.has_conflicts:
        # IA vai resolver automaticamente!
        await card_repo.update_card(card_id, {"merge_status": "resolving"})

        # Resolver em background para não bloquear
        background_tasks.add_task(
            resolve_conflicts_background,
            card_id=card_id,
            card_description=card.description,
            branch_name=card.branch_name,
            conflicted_files=result.conflicted_files,
            project_path=project.path,
            db=db
        )

        return {
            "success": True,
            "status": "resolving",
            "message": "Conflitos detectados. IA está resolvendo automaticamente..."
        }

    if not result.success:
        await card_repo.update_card(card_id, {"merge_status": "failed"})
        raise HTTPException(status_code=500, detail=result.error)

    # Merge sem conflitos - limpar worktree
    await git_manager.cleanup_worktree(card_id, card.branch_name, delete_branch=True)

    await card_repo.update_card(card_id, {
        "merge_status": "merged",
        "branch_name": None,
        "worktree_path": None
    })

    return {
        "success": True,
        "status": "merged",
        "message": "Merge concluído com sucesso!"
    }


async def resolve_conflicts_background(
    card_id: str,
    card_description: str,
    branch_name: str,
    conflicted_files: List[str],
    project_path: str,
    db: AsyncSession
):
    """
    Resolve conflitos em background usando IA.

    Fluxo:
    1. Cria backup
    2. IA resolve conflitos
    3. Roda testes
    4. Se OK: merge completo
    5. Se falha: rollback + marca card como failed
    """
    card_repo = CardRepository(db)
    git_manager = GitWorkspaceManager(project_path)
    conflict_resolver = ConflictResolver(project_path, git_manager)

    try:
        # Resolver conflitos com IA
        result = await conflict_resolver.resolve_conflicts(
            card_id=card_id,
            card_description=card_description,
            branch_name=branch_name,
            conflicted_files=conflicted_files,
            agent_executor=execute_agent  # Função que executa Claude Agent
        )

        if result.success:
            # Limpar worktree
            await git_manager.cleanup_worktree(card_id, branch_name, delete_branch=True)

            await card_repo.update_card(card_id, {
                "merge_status": "merged",
                "branch_name": None,
                "worktree_path": None
            })

            # Log de sucesso
            print(f"✅ Card {card_id}: Conflitos resolvidos por IA. Testes passaram!")

        else:
            # Falha na resolução
            await card_repo.update_card(card_id, {
                "merge_status": "failed"
            })

            # Log de falha
            print(f"❌ Card {card_id}: Falha ao resolver conflitos: {result.error}")
            if result.rolled_back:
                print(f"   ↩️ Rollback realizado. Projeto está seguro.")

    except Exception as e:
        await card_repo.update_card(card_id, {"merge_status": "failed"})
        print(f"❌ Card {card_id}: Erro inesperado: {str(e)}")

@app.get("/api/branches")
async def list_active_branches(db: AsyncSession = Depends(get_db)):
    """Lista todas as branches/worktrees ativos"""

    project = await get_active_project(db)
    if not project:
        raise HTTPException(status_code=400, detail="No active project")

    git_manager = GitWorkspaceManager(project.path)
    worktrees = await git_manager.list_active_worktrees()

    # Enriquecer com dados dos cards
    card_repo = CardRepository(db)
    enriched = []

    for wt in worktrees:
        branch = wt.get('branch', '')
        if branch.startswith('agent/'):
            # Buscar card pelo worktree_path
            result = await db.execute(
                select(Card).where(Card.branch_name == branch)
            )
            card = result.scalar_one_or_none()

            if card:
                enriched.append({
                    "branch": branch,
                    "path": wt['path'],
                    "cardId": card.id,
                    "cardTitle": card.title,
                    "cardColumn": card.column_id,
                    "mergeStatus": card.merge_status
                })

    return {"branches": enriched}

@app.post("/api/cleanup-orphan-worktrees")
async def cleanup_orphan_worktrees(db: AsyncSession = Depends(get_db)):
    """Remove worktrees órfãos"""

    project = await get_active_project(db)
    if not project:
        raise HTTPException(status_code=400, detail="No active project")

    # Obter IDs de cards ativos
    result = await db.execute(select(Card.id))
    active_card_ids = [row[0] for row in result.fetchall()]

    git_manager = GitWorkspaceManager(project.path)
    removed = await git_manager.cleanup_orphan_worktrees(active_card_ids)

    return {"success": True, "removedCount": removed}
```

---

### 4.4 Backend - Integração com Agent

#### Modificar `backend/src/agent.py`

```python
from .git_workspace import GitWorkspaceManager

async def execute_plan(card_id: str, card_description: str, model: str, db: AsyncSession):
    """Executa planejamento - agora cria worktree primeiro"""

    # 1. Obter projeto e card
    project = await get_active_project(db)
    card_repo = CardRepository(db)
    card = await card_repo.get_card(card_id)

    # 2. Determinar cwd baseado em worktree
    cwd = project.path  # Default

    # Verificar se é repo git e criar worktree
    git_dir = Path(project.path) / ".git"
    if git_dir.exists():
        git_manager = GitWorkspaceManager(project.path)
        await git_manager.recover_state()

        # Criar worktree se não existir
        if not card.worktree_path:
            result = await git_manager.create_worktree(card_id)
            if result.success:
                await card_repo.update_card(card_id, {
                    "branch_name": result.branch_name,
                    "worktree_path": result.worktree_path,
                    "merge_status": "none"
                })
                cwd = result.worktree_path
        else:
            cwd = card.worktree_path

    # 3. Executar com worktree path como cwd
    agent_options = ClaudeAgentOptions(
        cwd=cwd,  # ← Usar worktree isolado!
        allowed_tools=["Skill", "Read", "Write", "Edit", "Bash", "Glob", "Grep", "TodoWrite"],
        permission_mode="acceptEdits",
        setting_sources=["user", "project"],
        model=model
    )

    # ... resto da execução
```

---

### 4.5 Frontend - Tipos

#### Adicionar em `frontend/src/types/index.ts`

```typescript
// Status de merge - IA resolve conflitos automaticamente
export type MergeStatus = 'none' | 'merging' | 'resolving' | 'merged' | 'failed';

export interface Card {
  // ... campos existentes ...
  branchName?: string;
  worktreePath?: string;
  mergeStatus: MergeStatus;
}

export interface ActiveBranch {
  branch: string;
  path: string;
  cardId: string;
  cardTitle: string;
  cardColumn: string;
  mergeStatus: MergeStatus;
}
```

---

### 4.6 Frontend - Componentes de UI

#### `frontend/src/components/BranchIndicator/BranchIndicator.tsx`

```typescript
import React from 'react';
import styles from './BranchIndicator.module.css';
import { MergeStatus } from '../../types';

interface BranchIndicatorProps {
  branchName: string;
  mergeStatus: MergeStatus;
  onClick?: () => void;
}

export const BranchIndicator: React.FC<BranchIndicatorProps> = ({
  branchName,
  mergeStatus,
  onClick
}) => {
  const getStatusIcon = () => {
    switch (mergeStatus) {
      case 'merging': return '⏳';
      case 'resolving': return '🤖';  // IA resolvendo conflitos
      case 'merged': return '✓';
      case 'failed': return '❌';     // IA não conseguiu resolver
      default: return '🔀';
    }
  };

  // Mostrar apenas short name (ex: "agent/abc123-1234567890" → "abc123")
  const shortName = branchName.replace('agent/', '').split('-')[0];

  return (
    <button
      className={`${styles.branchBadge} ${styles[mergeStatus]}`}
      onClick={onClick}
      title={branchName}
    >
      <span className={styles.icon}>{getStatusIcon()}</span>
      <span className={styles.name}>{shortName}</span>
    </button>
  );
};
```

#### `frontend/src/components/BranchIndicator/BranchIndicator.module.css`

```css
.branchBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #6366f1;
  cursor: pointer;
  transition: all 0.2s;
}

.branchBadge:hover {
  background: rgba(99, 102, 241, 0.2);
}

.branchBadge.merging {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.branchBadge.resolving {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
  animation: pulse 2s infinite;
}

.branchBadge.merged {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.branchBadge.failed {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.icon {
  font-size: 10px;
}

.name {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

#### `frontend/src/components/BranchesDropdown/BranchesDropdown.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import styles from './BranchesDropdown.module.css';
import { ActiveBranch } from '../../types';
import { API_ENDPOINTS } from '../../api/config';

export const BranchesDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState<ActiveBranch[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const fetchBranches = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.branches);
      const data = await response.json();
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'merging': return '⏳';
      case 'conflict': return '⚠️';
      case 'merged': return '✓';
      default: return '🔀';
    }
  };

  const hasConflicts = branches.some(b => b.mergeStatus === 'conflict');

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={`${styles.trigger} ${hasConflicts ? styles.hasConflicts : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔀 {branches.length} {hasConflicts && '⚠️'}
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>Branches Ativas</div>
          {branches.length === 0 ? (
            <div className={styles.empty}>Nenhuma branch ativa</div>
          ) : (
            branches.map((branch) => (
              <div
                key={branch.cardId}
                className={`${styles.branchItem} ${styles[branch.mergeStatus]}`}
              >
                <span className={styles.icon}>
                  {getStatusIcon(branch.mergeStatus)}
                </span>
                <div className={styles.branchInfo}>
                  <div className={styles.branchName}>
                    {branch.branch.replace('agent/', '')}
                  </div>
                  <div className={styles.cardTitle}>{branch.cardTitle}</div>
                </div>
                <span className={styles.column}>{branch.cardColumn}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
```

---

#### Modificar `frontend/src/components/Card/Card.tsx`

```typescript
import { BranchIndicator } from '../BranchIndicator/BranchIndicator';

export const Card: React.FC<CardProps> = ({ card, onUpdate, onDelete }) => {
  // Tooltip com status do merge
  const getMergeTooltip = () => {
    switch (card.mergeStatus) {
      case 'merging': return 'Merge em andamento...';
      case 'resolving': return '🤖 IA resolvendo conflitos...';
      case 'merged': return 'Merge concluído!';
      case 'failed': return '❌ Falha no merge - requer atenção';
      default: return `Branch: ${card.branchName}`;
    }
  };

  return (
    <div className={styles.card}>
      {/* Header com branch indicator */}
      <div className={styles.cardHeader}>
        {/* ... título e outros elementos ... */}

        {card.branchName && (
          <BranchIndicator
            branchName={card.branchName}
            mergeStatus={card.mergeStatus}
            title={getMergeTooltip()}
          />
        )}

        {/* Mensagem especial para status failed */}
        {card.mergeStatus === 'failed' && (
          <div className={styles.failedBanner}>
            ⚠️ IA não conseguiu resolver conflitos. Verificar manualmente.
          </div>
        )}
      </div>

      {/* ... resto do card ... */}
    </div>
  );
};
```

---

### 4.7 Frontend - Hooks

#### Modificar `frontend/src/hooks/useWorkflowAutomation.ts`

```typescript
export const useWorkflowAutomation = () => {
  // ... código existente ...

  /**
   * Tenta fazer merge quando card completa REVIEW.
   * Card permanece em REVIEW com sub-estado de merge.
   */
  const handleCompletedReview = async (cardId: string): Promise<{
    success: boolean;
    hasConflicts?: boolean;
  }> => {
    try {
      // Iniciar merge
      const response = await fetch(`${API_ENDPOINTS.cards}/${cardId}/merge`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.hasConflicts) {
        // Card permanece em REVIEW com mergeStatus: "conflict"
        // UI mostrará modal de conflitos automaticamente
        return { success: false, hasConflicts: true };
      }

      if (data.success) {
        // Merge bem-sucedido - mover para DONE
        await moveCard(cardId, 'done');
        return { success: true };
      }

      return { success: false };

    } catch (error) {
      console.error('Failed to merge card:', error);
      return { success: false };
    }
  };

  return {
    // ... exports existentes ...
    handleCompletedReview
  };
};
```

---

## 5. Fluxo de Execução Completo

### 5.1 Card: BACKLOG → PLAN

```
1. Usuário arrasta card para PLAN
2. Backend verifica se projeto é git repo
3. Se sim:
   - Cria worktree em .worktrees/card-{short_id}
   - Cria branch agent/{short_id}-{timestamp}
   - Atualiza card com branch_name e worktree_path
4. Frontend mostra BranchIndicator 🔀 no card
5. Workflow automation executa /plan usando worktree_path como cwd
```

### 5.2 Card: PLAN → IMPLEMENT → TEST → REVIEW

```
- Todas as etapas executam no worktree isolado
- Modificações de código acontecem apenas no worktree
- Múltiplos cards podem executar em paralelo sem conflito
- Cada card tem sua própria cópia física dos arquivos
```

### 5.3 Card: REVIEW Completo (Merge Sucesso)

```
1. Workflow automation detecta REVIEW completo
2. Chama handleCompletedReview(cardId)
3. Backend (com lock de merge):
   - Atualiza merge_status para "merging" ⏳
   - Faz checkout da main
   - Executa git merge agent/{id}
   - Merge bem-sucedido!
   - Limpa worktree e branch
   - Atualiza merge_status para "merged" ✓
4. Card move para DONE
5. BranchIndicator some (branch_name = null)
```

### 5.4 Card: REVIEW Completo (Conflito → IA Resolve)

```
1. Workflow automation detecta REVIEW completo
2. Chama handleCompletedReview(cardId)
3. Backend detecta CONFLICT:
   - Lista arquivos conflitados
   - Atualiza merge_status para "resolving" 🤖
   - Inicia resolução em background

4. 🛡️ RESOLUÇÃO AUTOMÁTICA (Background):
   ┌─────────────────────────────────────────────────────────┐
   │  a) Cria backup tag: backup/pre-merge-{card_id}        │
   │  b) Inicia merge (deixa arquivos com marcadores)       │
   │  c) Monta contexto para IA:                            │
   │     - Descrição do card                                │
   │     - Diff da branch do card                           │
   │     - Diff do que mudou na main                        │
   │     - Arquivos com marcadores <<<<< ===== >>>>>        │
   │  d) IA edita arquivos removendo marcadores             │
   │  e) Verifica se marcadores foram removidos             │
   │  f) Faz commit                                         │
   │  g) Roda testes do projeto                             │
   └─────────────────────────────────────────────────────────┘

5. Se TESTES PASSAM:
   - Remove backup tag
   - Limpa worktree e branch
   - Atualiza merge_status para "merged" ✓
   - Card move para DONE

6. Se TESTES FALHAM:
   - Rollback para backup tag (projeto seguro!)
   - Atualiza merge_status para "failed" ❌
   - Card PERMANECE em REVIEW
   - Banner aparece: "IA não conseguiu resolver. Verificar manualmente."
```

### 5.5 Diagrama de Estados do Merge

```
                    ┌─────────┐
                    │  none   │ (worktree criado, trabalhando)
                    └────┬────┘
                         │ REVIEW completo
                         ▼
                    ┌─────────┐
                    │ merging │ ⏳
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │ sem conflito            │ com conflito
            ▼                         ▼
       ┌─────────┐              ┌───────────┐
       │ merged  │ ✓            │ resolving │ 🤖
       └─────────┘              └─────┬─────┘
                                      │
                        ┌─────────────┼─────────────┐
                        │ IA resolve + testes OK    │ IA falha ou testes falham
                        ▼                           ▼
                   ┌─────────┐                ┌─────────┐
                   │ merged  │ ✓              │ failed  │ ❌
                   └─────────┘                └─────────┘
                                              (rollback feito)
```

---

## 6. Testes

### 6.1 Unitários

#### Backend - GitWorkspaceManager
- [ ] `create_worktree()` cria worktree e branch
- [ ] `create_worktree()` respeita limite de MAX_CONCURRENT_WORKTREES
- [ ] `create_worktree()` limpa branch órfã se existir
- [ ] `merge_worktree()` faz merge sem conflitos
- [ ] `merge_worktree()` detecta conflitos corretamente
- [ ] `merge_worktree()` usa lock para evitar race conditions
- [ ] `cleanup_worktree()` remove worktree e branch
- [ ] `recover_state()` aborta merge pendente
- [ ] `_get_default_branch()` detecta main/master corretamente

#### Backend - ConflictResolver
- [ ] `_create_backup_tag()` cria tag corretamente
- [ ] `_rollback_to_backup()` restaura estado anterior
- [ ] `_get_conflict_context()` monta contexto com diffs
- [ ] `_run_tests()` detecta comando de teste correto
- [ ] `resolve_conflicts()` chama IA com contexto correto
- [ ] `resolve_conflicts()` faz rollback se IA falhar
- [ ] `resolve_conflicts()` faz rollback se testes falharem
- [ ] `resolve_conflicts()` remove backup tag após sucesso

#### Frontend
- [ ] `BranchIndicator` renderiza corretamente para cada status (none, merging, resolving, merged, failed)
- [ ] `BranchesDropdown` lista branches ativos

### 6.2 Integração

- [ ] Card cria worktree ao entrar em PLAN
- [ ] Card sem projeto git executa normalmente (sem worktree)
- [ ] Execução de /plan, /implement, /test, /review usa worktree correto
- [ ] Múltiplos cards executam em paralelo sem interferência
- [ ] Merge bem-sucedido limpa worktree e branch
- [ ] Conflito detectado → IA resolve automaticamente
- [ ] Backup é criado antes de resolução
- [ ] Rollback funciona se IA falhar
- [ ] Rollback funciona se testes falharem
- [ ] Recovery funciona após crash durante merge

### 6.3 E2E

- [ ] Criar 3 cards que modificam mesmo arquivo
- [ ] Executar workflows em paralelo
- [ ] Completar primeiro card (merge sem conflito)
- [ ] Segundo card detecta conflito → IA resolve → testes passam → merge OK
- [ ] Terceiro card detecta conflito → IA resolve → merge OK
- [ ] Verificar que main tem todas as mudanças corretas
- [ ] Simular falha de testes → verificar rollback → status "failed"

---

## 7. Considerações

### 7.1 Performance

- **Espaço em Disco:** Cada worktree duplica arquivos do projeto
  - Mitigação: Limpar worktrees imediatamente após merge
  - Limite de MAX_CONCURRENT_WORKTREES = 10
  - Endpoint para cleanup de worktrees órfãos

- **Tempo de Criação:** `git worktree add` pode ser lento em projetos grandes
  - Mitigação: Mostrar loader durante criação
  - Worktree é criado antes de iniciar execução

- **Resolução por IA:** Adiciona tempo extra quando há conflitos
  - Executa em background, não bloqueia UI
  - Timeout de 5 minutos para resolução

### 7.2 UX

- **Feedback Visual:** Usuário sempre sabe o status
  - 🔀 (ativo) → ⏳ (merging) → 🤖 (resolving) → ✓ (merged)
  - ❌ (failed) se IA não conseguir resolver

- **Resolução Automática:** Usuário não precisa fazer nada
  - IA resolve conflitos preservando funcionalidades de ambos os lados
  - Testes garantem que resolução não quebrou nada
  - Rollback automático se algo der errado

- **Sem Coluna Extra:** Merge é sub-estado de REVIEW
  - Card só vai para DONE após merge completo
  - Se failed, permanece em REVIEW com banner de alerta

### 7.3 Edge Cases

- **Worktree Órfão:** Card deletado sem limpar worktree
  - Solução: Endpoint `/api/cleanup-orphan-worktrees`

- **Branch Existente:** Branch de execução anterior não foi limpa
  - Solução: `_cleanup_stale_branch()` remove antes de criar

- **Projeto sem Git:** Usuário carrega projeto que não é repo git
  - Solução: Detectar `.git` e executar no diretório principal sem worktree

- **Main branch diferente:** Projeto usa `master`, `develop`, etc
  - Solução: `_get_default_branch()` detecta automaticamente

- **Crash durante merge:** Processo morre no meio do merge
  - Solução: `recover_state()` chamado no início de operações

- **Race condition no merge:** Dois cards tentam merge simultâneo
  - Solução: `_merge_lock` (asyncio.Lock) serializa operações de merge

- **IA deixa marcadores de conflito:** IA não remove todos os <<<<<<
  - Solução: Verificação pós-IA + rollback se encontrar marcadores

- **Testes inexistentes no projeto:** Projeto não tem testes configurados
  - Solução: `_run_tests()` assume sucesso se não encontrar comando de teste

### 7.4 Segurança

- **Comandos Git seguros:** Usando `subprocess_exec` com lista de args (não shell)
- **Limite de worktrees:** Previne DoS por criação excessiva
- **Validação de card_id:** Usar apenas primeiros 8 caracteres em paths
- **Backup obrigatório:** Sempre cria tag antes de resolver conflitos
- **Rollback automático:** Qualquer falha restaura estado anterior
- **Testes obrigatórios:** Só completa merge se testes passarem

### 7.5 Rollback Plan

Se worktrees ou resolução automática causarem problemas:
1. Feature flag `ENABLE_WORKTREES=false` para desabilitar worktrees
2. Feature flag `ENABLE_AUTO_RESOLVE=false` para desabilitar resolução por IA
3. Fallback para execução sequencial (todos cards usam mesmo diretório)
4. Endpoint para limpar todos worktrees
5. Tags de backup disponíveis para recuperação manual: `git tag -l "backup/*"`

---

## 8. Próximos Passos (Fora do Escopo)

- [ ] Integração com GitHub/GitLab para criar PR automaticamente
- [ ] Suporte a rebase ao invés de merge
- [ ] Sincronização com remote (push automático)
- [ ] Histórico de resoluções por IA (para aprendizado)
- [ ] Notificações quando IA resolver conflitos automaticamente
- [ ] Dashboard de métricas: taxa de sucesso da IA, tempo médio de resolução
