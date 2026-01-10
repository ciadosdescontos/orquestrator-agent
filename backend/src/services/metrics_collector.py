"""Serviço de coleta automática de métricas."""

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
from decimal import Decimal

from ..models.execution import Execution
from ..repositories.metrics_repository import MetricsRepository


class MetricsCollector:
    """Serviço para coletar métricas automaticamente durante execuções."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MetricsRepository(db)

    async def collect_from_execution(
        self,
        execution: Execution,
        project_id: str
    ) -> None:
        """
        Coleta métricas de uma execução e persiste no banco.

        Args:
            execution: Objeto Execution com os dados da execução
            project_id: ID do projeto
        """
        # Verificar se a execução tem dados completos
        if not execution.completed_at or not execution.started_at:
            return

        # Calcular duração em milissegundos
        duration_delta = execution.completed_at - execution.started_at
        duration_ms = int(duration_delta.total_seconds() * 1000)

        # Determinar status baseado no ExecutionStatus
        status_map = {
            "success": "success",
            "error": "error",
            "running": "cancelled",
            "idle": "cancelled"
        }
        status = status_map.get(execution.status.value, "error")

        # Criar métrica de execução
        await self.repo.create_execution_metric(
            execution_id=execution.id,
            card_id=execution.card_id,
            project_id=project_id,
            command=execution.command or "",
            model_used=execution.model_used or "unknown",
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            duration_ms=duration_ms,
            input_tokens=execution.input_tokens or 0,
            output_tokens=execution.output_tokens or 0,
            total_tokens=execution.total_tokens or 0,
            estimated_cost_usd=execution.execution_cost or Decimal(0),
            status=status,
            error_message=execution.workflow_error
        )

    async def collect_batch(
        self,
        executions: list[Execution],
        project_id: str
    ) -> int:
        """
        Coleta métricas de múltiplas execuções em batch.

        Args:
            executions: Lista de execuções
            project_id: ID do projeto

        Returns:
            Número de métricas coletadas
        """
        collected_count = 0

        for execution in executions:
            try:
                await self.collect_from_execution(execution, project_id)
                collected_count += 1
            except Exception as e:
                # Log error mas continua processando
                print(f"Erro ao coletar métrica da execução {execution.id}: {e}")
                continue

        return collected_count

    async def backfill_metrics(
        self,
        project_id: str,
        start_date: Optional[datetime] = None
    ) -> int:
        """
        Preenche métricas retroativamente para execuções existentes.

        Args:
            project_id: ID do projeto
            start_date: Data inicial para backfill (opcional)

        Returns:
            Número de métricas criadas
        """
        from sqlalchemy import select
        from ..models.execution import Execution, ExecutionStatus
        from ..models.metrics import ExecutionMetrics

        # Buscar execuções que ainda não têm métricas
        query = select(Execution).where(
            Execution.status.in_([ExecutionStatus.SUCCESS, ExecutionStatus.ERROR])
        )

        if start_date:
            query = query.where(Execution.started_at >= start_date)

        result = await self.db.execute(query)
        executions = result.scalars().all()

        # Filtrar apenas execuções que ainda não têm métricas
        executions_to_process = []
        for execution in executions:
            # Verificar se já existe métrica
            check_query = select(ExecutionMetrics).where(
                ExecutionMetrics.execution_id == execution.id
            )
            check_result = await self.db.execute(check_query)
            existing = check_result.scalar_one_or_none()

            if not existing:
                executions_to_process.append(execution)

        # Processar em batch
        return await self.collect_batch(executions_to_process, project_id)
