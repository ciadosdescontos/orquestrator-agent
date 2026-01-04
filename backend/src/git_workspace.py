"""Git Workspace Manager for card isolation using worktrees."""

import asyncio
import time
from asyncio import Lock
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass, field

# Lock global para operacoes de merge (evita race conditions)
_merge_lock = Lock()

# Limite de worktrees simultaneos
MAX_CONCURRENT_WORKTREES = 10


@dataclass
class WorktreeResult:
    """Result of worktree creation operation."""
    success: bool
    worktree_path: Optional[str] = None
    branch_name: Optional[str] = None
    error: Optional[str] = None


@dataclass
class MergeResult:
    """Result of merge operation."""
    success: bool
    has_conflicts: bool = False
    conflicted_files: List[str] = field(default_factory=list)
    error: Optional[str] = None


class GitWorkspaceManager:
    """Gerenciador de worktrees do Git para isolamento de cards."""

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
            cwd: Diretorio de trabalho (usa project_path se nao especificado)

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
        """Detecta branch principal do repositorio."""
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
        Deve ser chamado na inicializacao do manager.
        """
        # Verificar se ha merge em andamento
        merge_head = self.project_path / ".git" / "MERGE_HEAD"
        if merge_head.exists():
            await self._run_git_command(["git", "merge", "--abort"])

        # Verificar se ha rebase em andamento
        rebase_dir = self.project_path / ".git" / "rebase-merge"
        if rebase_dir.exists():
            await self._run_git_command(["git", "rebase", "--abort"])

    async def _branch_exists(self, branch_name: str) -> bool:
        """Verifica se branch existe."""
        returncode, stdout, _ = await self._run_git_command(
            ["git", "branch", "--list", branch_name]
        )
        return returncode == 0 and stdout.strip() != ""

    async def _cleanup_stale_branch(self, branch_name: str) -> None:
        """Remove branch orfa se existir."""
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
            base_branch: Branch base (detecta automaticamente se nao especificado)

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

        # Criar diretorio de worktrees se nao existir
        self.worktrees_dir.mkdir(exist_ok=True)

        # Detectar branch base
        if not base_branch:
            base_branch = await self._get_default_branch()

        # Definir paths com prefixo mais seguro
        short_id = card_id[:8] if len(card_id) > 8 else card_id
        timestamp = int(time.time())
        branch_name = f"agent/{short_id}-{timestamp}"
        worktree_path = self.worktrees_dir / f"card-{short_id}"

        # Verificar se worktree ja existe
        if worktree_path.exists():
            # Tentar limpar worktree antigo
            await self._run_git_command(
                ["git", "worktree", "remove", str(worktree_path), "--force"]
            )

        # Limpar branch orfa se existir
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
        Usa lock para evitar race conditions entre multiplos merges.

        Args:
            card_id: ID do card
            branch_name: Nome da branch a ser mergeada
            target_branch: Branch destino (detecta automaticamente se nao especificado)

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

            # 2. Pull para garantir que esta atualizado (opcional, ignora erro)
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

                    # Abortar merge para nao deixar estado inconsistente
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
            delete_branch: Se deve deletar a branch tambem

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
        Obtem diff entre branch do card e branch principal.

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
        Resolve conflitos aplicando a resolucao fornecida.

        Args:
            branch_name: Nome da branch do card
            resolution: Dict com {filepath: "ours"|"theirs"}

        Returns:
            True se resolucao bem-sucedida
        """
        async with _merge_lock:
            await self.recover_state()

            target_branch = await self._get_default_branch()

            # Checkout e merge
            await self._run_git_command(["git", "checkout", target_branch])
            await self._run_git_command(
                ["git", "merge", branch_name, "--no-ff"]
            )

            # Aplicar resolucoes
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
        """Lista todos os worktrees ativos."""
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
        Remove worktrees orfaos (sem card associado).

        Args:
            active_card_ids: Lista de IDs de cards ativos

        Returns:
            Numero de worktrees removidos
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
                        # Worktree orfao - remover
                        await self._run_git_command(
                            ["git", "worktree", "remove", wt['path'], "--force"]
                        )
                        await self._run_git_command(
                            ["git", "branch", "-D", branch]
                        )
                        removed += 1

        return removed

    def is_git_repo(self) -> bool:
        """Verifica se o projeto eh um repositorio git."""
        git_dir = self.project_path / ".git"
        return git_dir.exists()
