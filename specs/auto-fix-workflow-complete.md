# Automação Completa de Fix Card - Workflow 100% Automático

## 1. Resumo

Implementar automação completa do fluxo de correção de erros: quando um teste falha, o sistema cria automaticamente um fix card, executa todo o workflow de correção (implement → test → review → done) e, ao final, move o card pai também para done - tudo sem intervenção manual.

---

## 2. Objetivos e Escopo

### Objetivos
- [ ] Quando teste falha, criar fix card direto em **In-Progress** (pula Backlog e Plan)
- [ ] Executar automaticamente workflow completo no fix card: Implement → Test → Review → Done
- [ ] Quando fix card chega em Done, mover card pai automaticamente para Done
- [ ] Remover necessidade de retry (1 tentativa apenas - vai direto para fix card)
- [ ] Manter ambos os cards (pai e fix) em Done como histórico

### Fora do Escopo
- Sistema de retry (removido - vai direto para fix card)
- Múltiplas tentativas de correção
- Mover card pai para outras colunas além de Done
- Deletar ou arquivar cards automaticamente

---

## 3. Fluxo Completo

### Diagrama do Fluxo Automatizado

```
┌─────────────────────────────────────────────────────────────────┐
│  CENÁRIO NORMAL (Teste Passa)                                   │
│  Backlog → Plan → In-Progress → Test ✅ → Review → Done         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CENÁRIO COM ERRO (Teste Falha)                                 │
│                                                                  │
│  Test ❌ (Card Pai)                                             │
│    ↓                                                            │
│  🤖 AUTOMAÇÃO IMEDIATA:                                         │
│    1. Criar Fix Card                                            │
│    2. Colocar fix card em In-Progress (pula Backlog e Plan)    │
│    3. Executar /implement no fix card                           │
│    4. Mover fix card: In-Progress → Test                        │
│    5. Executar /test-implementation no fix card                 │
│    6. Mover fix card: Test → Review                             │
│    7. Executar /review no fix card                              │
│    8. Mover fix card: Review → Done ✅                          │
│       ↓                                                         │
│  🎯 QUANDO FIX CARD CHEGA EM DONE:                              │
│    9. Detectar que fix card foi concluído                       │
│    10. Mover card pai: Test → Done ✅                           │
│       ↓                                                         │
│  ✨ RESULTADO FINAL:                                            │
│    - Fix Card em Done                                           │
│    - Card Pai em Done                                           │
│    - Histórico completo preservado                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/agent.py` | Modificar | Alterar `execute_test_implementation` para criar e executar fix card automaticamente |
| `backend/src/services/fix_card_automation.py` | Criar | Serviço para orquestrar execução automática do fix card |
| `backend/src/services/fix_card_watcher.py` | Criar | Sistema de callbacks para detectar quando fix card chega em Done |
| `backend/src/routes/cards.py` | Modificar | Adicionar hook ao mover card para Done (detectar fix cards) |
| `backend/src/repositories/card_repository.py` | Modificar | Ajustar `create_fix_card` para criar em In-Progress ao invés de Backlog |

### Detalhes Técnicos

#### 4.1. Modificar execute_test_implementation

```python
# backend/src/agent.py (linha ~711)

async def execute_test_implementation(
    card_id: str,
    spec_path: str,
    cwd: str,
    model: str = "opus-4.5",
    images: Optional[list] = None,
    db_session: Optional[AsyncSession] = None,
) -> PlanResult:
    """Execute /test-implementation command with the spec file path."""

    # ... código existente de execução ...

    # Check if tests failed based on logs (código existente - linha ~696)
    test_failed = False
    for log in record.logs:
        if log.type == LogType.ERROR or (
            log.type in [LogType.TEXT, LogType.RESULT] and
            any(indicator in log.content.lower() for indicator in [
                "test failed", "tests failed", "failed test",
                "assertion error", "✗", "error:", "failed:"
            ])
        ):
            test_failed = True
            break

    record.completed_at = datetime.now().isoformat()

    if test_failed:
        record.status = ExecutionStatus.ERROR
        add_log(record, LogType.ERROR, "Tests failed - creating and running fix card automatically")

        # Atualizar status de erro no banco
        if repo and execution_db:
            await repo.add_log(
                execution_id=execution_db.id,
                log_type="error",
                content="Tests failed - creating and running fix card automatically"
            )
            await repo.update_execution_status(
                execution_id=execution_db.id,
                status=DBExecutionStatus.ERROR,
                result="Tests failed"
            )

        # 🆕 NOVO: Criar fix card E executar workflow automaticamente
        from .services.fix_card_automation import FixCardAutomation

        fix_card_id = await FixCardAutomation.create_and_run_fix_card(
            parent_card_id=card_id,
            error_logs=record.logs,
            spec_path=spec_path,
            cwd=cwd,
            model=model,
            images=images
        )

        # Busca execução para retornar logs
        if repo and execution_db:
            execution_data = await repo.get_execution_with_logs(card_id)
            if execution_data:
                return PlanResult(
                    success=False,
                    error="Tests failed. Fix card created and running automatically.",
                    logs=execution_data["logs"],
                    fix_card_created=True if fix_card_id else False,
                    fix_card_id=fix_card_id
                )

        return PlanResult(
            success=False,
            error="Tests failed. Fix card created and running automatically.",
            logs=record.logs,
            fix_card_created=True if fix_card_id else False,
            fix_card_id=fix_card_id
        )

    # ... resto do código existente para success ...
```

#### 4.2. Criar Serviço de Automação de Fix Card

```python
# backend/src/services/fix_card_automation.py

"""Service to automate fix card creation and execution."""

from typing import Optional, List
import asyncio
from ..execution import ExecutionLog, PlanResult
from ..models.card import Card
from ..repositories.card_repository import CardRepository
from ..database import async_session_maker
from .test_result_analyzer import TestResultAnalyzer
from .fix_card_watcher import FixCardWatcher
import logging

logger = logging.getLogger(__name__)


class FixCardAutomation:
    """Handles automatic creation and execution of fix cards."""

    @staticmethod
    async def create_and_run_fix_card(
        parent_card_id: str,
        error_logs: List[ExecutionLog],
        spec_path: str,
        cwd: str,
        model: str,
        images: Optional[list] = None
    ) -> Optional[str]:
        """
        Cria fix card e executa workflow completo automaticamente.

        Fluxo:
        1. Analisa erro e cria fix card
        2. Coloca fix card em In-Progress (pula Backlog e Plan)
        3. Executa /implement
        4. Executa /test-implementation
        5. Executa /review
        6. Move para Done
        7. Quando chega em Done, move card pai para Done também

        Returns:
            fix_card_id se criado com sucesso, None caso contrário
        """
        try:
            async with async_session_maker() as session:
                repo = CardRepository(session)

                # Verificar se já existe fix card ativo
                existing_fix = await repo.get_active_fix_card(parent_card_id)
                if existing_fix:
                    logger.info(f"Fix card already exists: {existing_fix.id}")
                    return existing_fix.id

                # Buscar card pai para obter configurações
                parent_card = await repo.get_by_id(parent_card_id)
                if not parent_card:
                    logger.error(f"Parent card not found: {parent_card_id}")
                    return None

                # Analisar erro
                error_info = TestResultAnalyzer.analyze_test_failure(error_logs)
                description = TestResultAnalyzer.generate_fix_description(error_info)
                context = TestResultAnalyzer.extract_error_context(error_logs)

                # Criar fix card
                fix_card = await repo.create_fix_card(
                    parent_card_id,
                    {
                        "description": description,
                        "context": context
                    }
                )

                if not fix_card:
                    logger.error("Failed to create fix card")
                    return None

                await session.commit()
                logger.info(f"Created fix card: {fix_card.id}")

                # 🆕 MOVER DIRETO PARA IN-PROGRESS (pula Backlog e Plan)
                fix_card, error = await repo.move(fix_card.id, 'in-progress')
                if error:
                    logger.error(f"Failed to move fix card to in-progress: {error}")
                    return fix_card.id

                await session.commit()
                logger.info(f"Moved fix card {fix_card.id} to In-Progress")

                # Registrar callback para quando fix card chegar em Done
                FixCardWatcher.register_callback(
                    fix_card.id,
                    parent_card_id
                )

            # 🆕 EXECUTAR WORKFLOW AUTOMATICAMENTE (fora da sessão para evitar bloqueio)
            # Executar em background task
            asyncio.create_task(
                FixCardAutomation._run_fix_workflow(
                    fix_card.id,
                    spec_path,
                    cwd,
                    model,
                    images
                )
            )

            return fix_card.id

        except Exception as e:
            logger.error(f"Error creating fix card: {e}", exc_info=True)
            return None

    @staticmethod
    async def _run_fix_workflow(
        fix_card_id: str,
        spec_path: str,
        cwd: str,
        model: str,
        images: Optional[list] = None
    ):
        """
        Executa workflow completo do fix card automaticamente.

        Fluxo: In-Progress → Test → Review → Done
        """
        from ..agent import execute_implement, execute_test_implementation, execute_review
        from ..database import async_session_maker

        logger.info(f"[FixWorkflow] Starting automated workflow for fix card {fix_card_id}")

        try:
            # Buscar fix card
            async with async_session_maker() as session:
                repo = CardRepository(session)
                fix_card = await repo.get_by_id(fix_card_id)
                if not fix_card:
                    logger.error(f"Fix card not found: {fix_card_id}")
                    return

            # Etapa 1: IMPLEMENT (já está em In-Progress)
            logger.info(f"[FixWorkflow] Step 1/4: Executing /implement for {fix_card_id}")
            implement_result = await execute_implement(
                card_id=fix_card_id,
                spec_path=spec_path,
                cwd=cwd,
                model=model,
                images=images
            )

            if not implement_result.success:
                logger.error(f"[FixWorkflow] Implement failed for {fix_card_id}")
                return

            # Mover para Test
            async with async_session_maker() as session:
                repo = CardRepository(session)
                await repo.move(fix_card_id, 'test')
                await session.commit()
            logger.info(f"[FixWorkflow] Moved {fix_card_id} to Test")

            # Etapa 2: TEST
            logger.info(f"[FixWorkflow] Step 2/4: Executing /test-implementation for {fix_card_id}")

            # 🚨 IMPORTANTE: Não passar db_session aqui para evitar recursão infinita
            # (fix card não deve criar outro fix card)
            test_result = await execute_test_implementation(
                card_id=fix_card_id,
                spec_path=spec_path,
                cwd=cwd,
                model=model,
                images=images,
                db_session=None  # ← Importante: evita criar fix card do fix card
            )

            if not test_result.success:
                logger.error(f"[FixWorkflow] Test failed for fix card {fix_card_id}")
                # Fix card falhou - não continua workflow
                # Card pai permanece em Test com erro
                return

            # Mover para Review
            async with async_session_maker() as session:
                repo = CardRepository(session)
                await repo.move(fix_card_id, 'review')
                await session.commit()
            logger.info(f"[FixWorkflow] Moved {fix_card_id} to Review")

            # Etapa 3: REVIEW
            logger.info(f"[FixWorkflow] Step 3/4: Executing /review for {fix_card_id}")
            review_result = await execute_review(
                card_id=fix_card_id,
                spec_path=spec_path,
                cwd=cwd,
                model=model,
                images=images
            )

            if not review_result.success:
                logger.error(f"[FixWorkflow] Review failed for {fix_card_id}")
                return

            # Etapa 4: MOVE TO DONE
            logger.info(f"[FixWorkflow] Step 4/4: Moving {fix_card_id} to Done")
            async with async_session_maker() as session:
                repo = CardRepository(session)
                await repo.move(fix_card_id, 'done')
                await session.commit()

            logger.info(f"[FixWorkflow] ✅ Fix card {fix_card_id} completed successfully and moved to Done")
            logger.info(f"[FixWorkflow] Callback will now move parent card to Done")

        except Exception as e:
            logger.error(f"[FixWorkflow] Error running fix workflow: {e}", exc_info=True)
```

#### 4.3. Criar Sistema de Callbacks (Watcher)

```python
# backend/src/services/fix_card_watcher.py

"""Watches for fix cards reaching Done and triggers parent card completion."""

from typing import Dict, Optional
from ..repositories.card_repository import CardRepository
from ..database import async_session_maker
import logging

logger = logging.getLogger(__name__)


class FixCardWatcher:
    """Sistema de callbacks para detectar quando fix cards chegam em Done."""

    # Mapeia fix_card_id -> parent_card_id
    _callbacks: Dict[str, str] = {}

    @classmethod
    def register_callback(cls, fix_card_id: str, parent_card_id: str):
        """Registra que quando fix_card_id chegar em Done, deve mover parent_card_id para Done."""
        cls._callbacks[fix_card_id] = parent_card_id
        logger.info(f"[FixCardWatcher] Registered callback: {fix_card_id} -> {parent_card_id}")

    @classmethod
    async def on_card_moved_to_done(cls, card_id: str):
        """
        Chamado automaticamente quando qualquer card é movido para Done.
        Se for um fix card com callback registrado, move o card pai para Done.
        """
        # Verificar se é um fix card com callback
        if card_id not in cls._callbacks:
            return

        parent_card_id = cls._callbacks[card_id]
        logger.info(f"[FixCardWatcher] Fix card {card_id} reached Done. Moving parent {parent_card_id} to Done")

        try:
            async with async_session_maker() as session:
                repo = CardRepository(session)

                # Verificar se card é realmente fix card
                fix_card = await repo.get_by_id(card_id)
                if not fix_card or not fix_card.is_fix_card:
                    logger.warning(f"Card {card_id} is not a fix card")
                    return

                # Mover card pai para Done
                parent_card, error = await repo.move(parent_card_id, 'done')

                if error:
                    logger.error(f"Failed to move parent card to Done: {error}")
                else:
                    await session.commit()
                    logger.info(f"✅ Parent card {parent_card_id} moved to Done successfully")

                # Remover callback
                del cls._callbacks[card_id]

        except Exception as e:
            logger.error(f"Error in fix card callback: {e}", exc_info=True)
```

#### 4.4. Integrar Watcher ao Endpoint de Mover Card

```python
# backend/src/routes/cards.py

from ..services.fix_card_watcher import FixCardWatcher

@router.put("/{card_id}/move")
async def move_card(
    card_id: str,
    data: MoveCardRequest,
    session: AsyncSession = Depends(get_session)
):
    """Move a card to a different column."""
    repo = CardRepository(session)

    card, error = await repo.move(card_id, data.column_id)

    if error:
        raise HTTPException(status_code=400, detail=error)

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    await session.commit()

    # 🆕 NOVO: Se moveu para Done, notificar watcher
    if data.column_id == 'done':
        await FixCardWatcher.on_card_moved_to_done(card_id)

    return card.to_dict()
```

#### 4.5. Ajustar create_fix_card para criar em In-Progress

```python
# backend/src/repositories/card_repository.py

async def create_fix_card(self, parent_card_id: str, error_info: dict) -> Optional[Card]:
    """Create a fix card for a parent card with test failure."""
    # Check if there's already an active fix card
    existing_fix = await self.get_active_fix_card(parent_card_id)
    if existing_fix:
        return existing_fix

    # Get parent card to copy configuration
    parent_card = await self.get_by_id(parent_card_id)
    if not parent_card:
        return None

    # Create the fix card
    fix_card_data = CardCreate(
        title=f"[FIX] {parent_card.title[:50]}",
        description=error_info.get("description", ""),
        model_plan=parent_card.model_plan,
        model_implement=parent_card.model_implement,
        model_test=parent_card.model_test,
        model_review=parent_card.model_review,
        parent_card_id=parent_card_id,
        is_fix_card=True,
        test_error_context=error_info.get("context", "")
    )

    fix_card = await self.create(fix_card_data)

    # 🆕 ALTERADO: Card é criado em backlog pelo create(),
    # mas será movido para in-progress pelo FixCardAutomation

    return fix_card
```

#### 4.6. Prevenir Recursão Infinita

Importante: Fix card não deve criar outro fix card se falhar.

```python
# backend/src/agent.py - execute_test_implementation

async def execute_test_implementation(
    card_id: str,
    spec_path: str,
    cwd: str,
    model: str = "opus-4.5",
    images: Optional[list] = None,
    db_session: Optional[AsyncSession] = None,  # ← Se None, não cria fix card
) -> PlanResult:
    """Execute /test-implementation command with the spec file path."""

    # ... código existente ...

    if test_failed:
        record.status = ExecutionStatus.ERROR

        # 🆕 NOVO: Só cria fix card se db_session disponível
        # (Fix cards não têm db_session, então não criam fix cards recursivamente)
        if db_session:
            add_log(record, LogType.ERROR, "Tests failed - creating and running fix card automatically")

            # Criar e executar fix card
            from .services.fix_card_automation import FixCardAutomation
            fix_card_id = await FixCardAutomation.create_and_run_fix_card(...)

            return PlanResult(
                success=False,
                error="Tests failed. Fix card created and running automatically.",
                logs=record.logs,
                fix_card_created=True if fix_card_id else False,
                fix_card_id=fix_card_id
            )
        else:
            # É um fix card testando - não cria outro fix card
            add_log(record, LogType.ERROR, "Tests failed (fix card)")
            return PlanResult(
                success=False,
                error="Tests failed",
                logs=record.logs,
                fix_card_created=False,
                fix_card_id=None
            )
```

---

## 5. Testes

### Unitários
- [ ] Testar `FixCardAutomation.create_and_run_fix_card` com mock
- [ ] Testar `FixCardWatcher.register_callback` e `on_card_moved_to_done`
- [ ] Testar criação de fix card em In-Progress
- [ ] Testar que fix card não cria outro fix card (recursão)

### Integração
- [ ] Criar card → Plan → Implement → Test (falha) → Fix card criado automaticamente em In-Progress
- [ ] Fix card executa /implement → /test → /review automaticamente
- [ ] Fix card chega em Done → Card pai move para Done
- [ ] Verificar que ambos os cards ficam em Done
- [ ] Testar que fix card que falha nos testes não cria outro fix card

### Manual
- [ ] Criar card novo e executar workflow completo
- [ ] Forçar falha no teste (editar código para quebrar teste)
- [ ] Verificar visualmente que fix card aparece em In-Progress
- [ ] Aguardar fix card ir para Done automaticamente
- [ ] Verificar que card pai também foi para Done

---

## 6. Considerações

### Riscos
- **Recursão infinita**: Fix card que falha poderia criar outro fix card infinitamente
  - **Mitigação**: Fix cards não criam outros fix cards (sem db_session)

- **Falha na execução automática**: Se fix card falhar, card pai fica preso
  - **Mitigação**: Logging detalhado + card pai permanece em Test para retry manual

- **Performance**: Executar workflow inteiro automaticamente pode demorar
  - **Mitigação**: Usar asyncio.create_task (não bloqueia)

### Dependências
- Todos os comandos (/implement, /test, /review) devem estar funcionais
- Sistema de callbacks deve ser thread-safe
- Logs devem ser claros para debug

### Melhorias Futuras
- Adicionar timeout para execução do fix workflow
- Notificação quando fix card completa (webhook, email)
- Dashboards mostrando fix cards em execução
- Métricas: quantos fix cards foram criados, taxa de sucesso, etc
- Permitir cancelar execução do fix workflow manualmente

---

## 7. Checklist de Implementação

- [ ] Modificar `execute_test_implementation` para criar e executar fix card
- [ ] Criar `FixCardAutomation` service
- [ ] Criar `FixCardWatcher` service
- [ ] Integrar watcher ao endpoint de mover card
- [ ] Ajustar `create_fix_card` (documentação)
- [ ] Adicionar proteção contra recursão infinita
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Teste manual end-to-end
- [ ] Atualizar README com novo comportamento
- [ ] Adicionar logging detalhado
