"""Conflict Resolver using AI to automatically resolve merge conflicts."""

import asyncio
from pathlib import Path
from typing import Optional, List, Callable, Awaitable
from dataclasses import dataclass, field

from .git_workspace import GitWorkspaceManager


@dataclass
class ConflictResolutionResult:
    """Result of conflict resolution operation."""
    success: bool
    resolved_files: List[str] = field(default_factory=list)
    error: Optional[str] = None
    tests_passed: bool = False
    rolled_back: bool = False


class ConflictResolver:
    """
    Resolve conflitos de merge automaticamente usando IA.

    Mecanismos de seguranca:
    1. Backup tag antes de qualquer modificacao
    2. IA recebe contexto completo (descricao do card + diffs)
    3. Testes automaticos apos resolucao
    4. Rollback automatico se testes falharem
    """

    def __init__(self, project_path: str, git_manager: GitWorkspaceManager):
        self.project_path = Path(project_path)
        self.git_manager = git_manager

    async def _create_backup_tag(self, card_id: str) -> str:
        """Cria tag de backup antes do merge."""
        tag_name = f"backup/pre-merge-{card_id[:8]}"

        await self.git_manager._run_git_command([
            "git", "tag", "-f", tag_name
        ])

        return tag_name

    async def _rollback_to_backup(self, tag_name: str) -> bool:
        """Rollback para o backup em caso de falha."""
        returncode, _, stderr = await self.git_manager._run_git_command([
            "git", "reset", "--hard", tag_name
        ])
        return returncode == 0

    async def _delete_backup_tag(self, tag_name: str) -> None:
        """Remove tag de backup apos sucesso."""
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
        - Descricao do card (objetivo)
        - O que a branch do card mudou
        - O que mudou na main desde que o card comecou
        - Conteudo dos arquivos com marcadores de conflito
        """
        target_branch = await self.git_manager._get_default_branch()

        # 1. Diff da branch do card (o que o card fez)
        _, card_diff, _ = await self.git_manager._run_git_command([
            "git", "diff", f"{target_branch}...{branch_name}"
        ])

        # 2. Diff da main desde o ponto de divergencia (o que outros fizeram)
        _, merge_base, _ = await self.git_manager._run_git_command([
            "git", "merge-base", target_branch, branch_name
        ])
        merge_base = merge_base.strip()

        _, main_diff, _ = await self.git_manager._run_git_command([
            "git", "diff", f"{merge_base}..{target_branch}"
        ])

        # 3. Conteudo dos arquivos em conflito (com marcadores)
        conflicted_contents = {}
        for file in conflicted_files:
            file_path = self.project_path / file
            if file_path.exists():
                try:
                    conflicted_contents[file] = file_path.read_text()
                except Exception:
                    conflicted_contents[file] = "(unable to read file)"

        context = f"""## Objetivo do Card
{card_description}

## O que a branch do card modificou
```diff
{card_diff[:5000] if len(card_diff) > 5000 else card_diff}
```

## O que mudou na main (por outros cards) desde que este card comecou
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
        Roda testes do projeto para verificar se resolucao nao quebrou nada.

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
                try:
                    process = await asyncio.create_subprocess_exec(
                        *cmd,
                        cwd=str(self.project_path),
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    stdout, stderr = await asyncio.wait_for(
                        process.communicate(),
                        timeout=300  # 5 minutes timeout
                    )
                    output = stdout.decode() + stderr.decode()

                    if process.returncode == 0:
                        return True, output
                    else:
                        return False, output
                except asyncio.TimeoutError:
                    return False, "Test execution timed out after 5 minutes"
                except Exception as e:
                    return False, f"Test execution failed: {str(e)}"

        # Se nao encontrou comando de teste, assume sucesso
        return True, "No test command detected, assuming success"

    async def resolve_conflicts(
        self,
        card_id: str,
        card_description: str,
        branch_name: str,
        conflicted_files: List[str],
        agent_executor: Callable[..., Awaitable[None]]
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
            resolution_prompt = f"""Voce precisa resolver conflitos de merge em um projeto.

{context}

## Instrucoes
Para CADA arquivo em conflito:
1. Analise o objetivo do card e o que cada lado mudou
2. Resolva o conflito PRESERVANDO as funcionalidades de ambos os lados quando possivel
3. Se houver mudancas incompativeis, priorize a mudanca do CARD (eh o trabalho mais recente)
4. REMOVA todos os marcadores de conflito (<<<<<<, =======, >>>>>>>)
5. O codigo resultante deve ser funcional e correto

IMPORTANTE:
- NAO deixe nenhum marcador de conflito no codigo
- NAO quebre funcionalidades existentes
- MANTENHA a consistencia do codigo

Edite os arquivos em conflito para resolver os conflitos.
"""

            # Executar agent para resolver
            await agent_executor(
                prompt=resolution_prompt,
                cwd=str(self.project_path),
                allowed_tools=["Read", "Write", "Edit"]
            )

            # 5. Verificar se ainda ha marcadores de conflito
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
