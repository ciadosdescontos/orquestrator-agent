"""Metrics routes for the API."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Literal
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ..database import get_db
from ..repositories.metrics_repository import MetricsRepository
from ..services.metrics_aggregator import MetricsAggregator
from ..services.metrics_collector import MetricsCollector


router = APIRouter(prefix="/api/metrics", tags=["metrics"])


# Schemas
class MetricsResponse(BaseModel):
    """Response model for aggregated metrics."""
    totalInputTokens: int
    totalOutputTokens: int
    totalTokens: int
    totalCost: float
    avgExecutionTimeMs: int
    minExecutionTimeMs: int
    maxExecutionTimeMs: int
    totalExecutions: int
    successfulExecutions: int
    successRate: float


class TokenUsageResponse(BaseModel):
    """Response model for token usage data."""
    data: list


class ExecutionTimeResponse(BaseModel):
    """Response model for execution time data."""
    data: list


class CostAnalysisResponse(BaseModel):
    """Response model for cost analysis."""
    data: list


class InsightsResponse(BaseModel):
    """Response model for insights."""
    insights: list


class TrendsResponse(BaseModel):
    """Response model for trends."""
    movingAverage: int
    peakUsage: dict
    trend: float
    projection: int
    dailyData: list


class PerformanceResponse(BaseModel):
    """Response model for performance analysis."""
    p50: int
    p95: int
    p99: int
    mean: int
    min: int
    max: int
    stdDev: int
    outlierCount: int
    outlierThreshold: int


class ROIResponse(BaseModel):
    """Response model for ROI metrics."""
    costPerCard: float
    totalCost: float
    cardsCompleted: int
    modelEfficiency: list
    estimatedTimeSaved: dict


class ProductivityResponse(BaseModel):
    """Response model for productivity metrics."""
    cardsCompleted: int
    cardsInProgress: int
    cardsTodo: int
    velocity: float
    totalCards: int


@router.get("/project/{project_id}", response_model=MetricsResponse)
async def get_project_metrics(
    project_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna métricas agregadas do projeto.

    Args:
        project_id: ID do projeto
        start_date: Data inicial (opcional)
        end_date: Data final (opcional)
    """
    repo = MetricsRepository(db)
    metrics = await repo.get_aggregated_metrics(project_id, start_date, end_date)

    return MetricsResponse(**metrics)


@router.get("/tokens/{project_id}", response_model=TokenUsageResponse)
async def get_token_usage(
    project_id: str,
    period: Literal["24h", "7d", "30d", "all"] = Query("7d"),
    group_by: Literal["hour", "day", "model"] = Query("day"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna uso de tokens agregado por período.

    Args:
        project_id: ID do projeto
        period: Período de análise (24h, 7d, 30d, all)
        group_by: Agrupamento (hour, day, model)
    """
    repo = MetricsRepository(db)
    data = await repo.get_token_usage(project_id, period, group_by)

    return TokenUsageResponse(data=data)


@router.get("/execution-time/{project_id}", response_model=ExecutionTimeResponse)
async def get_execution_times(
    project_id: str,
    command: Optional[str] = Query(None),
    limit: int = Query(100),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna tempos de execução por card/comando.

    Args:
        project_id: ID do projeto
        command: Filtrar por comando específico (opcional)
        limit: Limite de resultados
    """
    repo = MetricsRepository(db)
    data = await repo.get_execution_times(project_id, command, limit)

    return ExecutionTimeResponse(data=data)


@router.get("/costs/{project_id}", response_model=CostAnalysisResponse)
async def get_cost_analysis(
    project_id: str,
    group_by: Literal["model", "command", "day"] = Query("model"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna análise de custos detalhada.

    Args:
        project_id: ID do projeto
        group_by: Agrupamento (model, command, day)
    """
    repo = MetricsRepository(db)
    data = await repo.get_cost_analysis(project_id, group_by)

    return CostAnalysisResponse(data=data)


@router.get("/trends/{project_id}", response_model=TrendsResponse)
async def get_token_trends(
    project_id: str,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db)
):
    """
    Calcula tendências de uso de tokens.

    Args:
        project_id: ID do projeto
        days: Número de dias para análise (1-90)
    """
    aggregator = MetricsAggregator(db)
    trends = await aggregator.calculate_token_trends(project_id, days)

    return TrendsResponse(**trends)


@router.get("/performance/{project_id}", response_model=PerformanceResponse)
async def get_execution_performance(
    project_id: str,
    command: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Analisa performance de execuções (percentis, outliers).

    Args:
        project_id: ID do projeto
        command: Filtrar por comando específico (opcional)
    """
    aggregator = MetricsAggregator(db)
    performance = await aggregator.analyze_execution_performance(project_id, command)

    return PerformanceResponse(**performance)


@router.get("/roi/{project_id}", response_model=ROIResponse)
async def get_roi_metrics(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Calcula métricas de ROI (custo por card, eficiência, economia de tempo).

    Args:
        project_id: ID do projeto
    """
    aggregator = MetricsAggregator(db)
    roi = await aggregator.calculate_roi_metrics(project_id)

    return ROIResponse(**roi)


@router.get("/productivity/{project_id}", response_model=ProductivityResponse)
async def get_productivity_metrics(
    project_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna métricas de produtividade (velocity, cycle time, throughput).

    Args:
        project_id: ID do projeto
        start_date: Data inicial (opcional)
        end_date: Data final (opcional)
    """
    repo = MetricsRepository(db)
    productivity = await repo.get_productivity_metrics(project_id, start_date, end_date)

    return ProductivityResponse(**productivity)


@router.get("/insights/{project_id}", response_model=InsightsResponse)
async def get_insights(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Gera insights automáticos sobre as métricas.

    Args:
        project_id: ID do projeto
    """
    aggregator = MetricsAggregator(db)
    insights = await aggregator.generate_insights(project_id)

    return InsightsResponse(insights=insights)


@router.get("/hourly/{project_id}")
async def get_hourly_metrics(
    project_id: str,
    target_date: date = Query(default_factory=lambda: datetime.utcnow().date()),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna métricas agregadas por hora para um dia específico.

    Args:
        project_id: ID do projeto
        target_date: Data alvo (padrão: hoje)
    """
    aggregator = MetricsAggregator(db)
    hourly_data = await aggregator.aggregate_hourly_metrics(project_id, target_date)

    return {"data": hourly_data}


@router.post("/backfill/{project_id}")
async def backfill_metrics(
    project_id: str,
    start_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Preenche métricas retroativamente para execuções existentes.

    Args:
        project_id: ID do projeto
        start_date: Data inicial para backfill (opcional)
    """
    collector = MetricsCollector(db)
    count = await collector.backfill_metrics(project_id, start_date)

    return {
        "message": f"Backfill completed successfully",
        "metricsCreated": count
    }


@router.get("/compare/{project_id}")
async def compare_periods(
    project_id: str,
    current_start: date = Query(...),
    current_end: date = Query(...),
    previous_start: date = Query(...),
    previous_end: date = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Compara métricas entre dois períodos.

    Args:
        project_id: ID do projeto
        current_start: Data inicial do período atual
        current_end: Data final do período atual
        previous_start: Data inicial do período anterior
        previous_end: Data final do período anterior
    """
    aggregator = MetricsAggregator(db)
    comparison = await aggregator.compare_periods(
        project_id,
        current_start,
        current_end,
        previous_start,
        previous_end
    )

    return comparison
