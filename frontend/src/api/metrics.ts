/**
 * API client for metrics endpoints.
 */

import type {
  MetricsResponse,
  TokenUsageResponse,
  ExecutionTimeResponse,
  CostAnalysisResponse,
  InsightsResponse,
  TrendsResponse,
  PerformanceResponse,
  ROIResponse,
  ProductivityResponse,
  HourlyMetricsResponse,
  DateRange,
  PeriodComparison,
} from '../types/metrics';
import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/api/metrics`;

/**
 * Retorna métricas agregadas do projeto
 */
export async function getProjectMetrics(
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<MetricsResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `${BASE_URL}/project/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch project metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retorna uso de tokens agregado por período
 */
export async function getTokenUsage(
  projectId: string,
  period: DateRange = '7d',
  groupBy: 'hour' | 'day' | 'model' = 'day'
): Promise<TokenUsageResponse> {
  const params = new URLSearchParams({ period, group_by: groupBy });
  const url = `${BASE_URL}/tokens/${projectId}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch token usage: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retorna tempos de execução por card/comando
 */
export async function getExecutionTimes(
  projectId: string,
  command?: string,
  limit: number = 100
): Promise<ExecutionTimeResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (command) params.append('command', command);

  const url = `${BASE_URL}/execution-time/${projectId}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch execution times: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retorna análise de custos detalhada
 */
export async function getCostAnalysis(
  projectId: string,
  groupBy: 'model' | 'command' | 'day' = 'model'
): Promise<CostAnalysisResponse> {
  const params = new URLSearchParams({ group_by: groupBy });
  const url = `${BASE_URL}/costs/${projectId}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch cost analysis: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calcula tendências de uso de tokens
 */
export async function getTokenTrends(
  projectId: string,
  days: number = 7
): Promise<TrendsResponse> {
  const params = new URLSearchParams({ days: days.toString() });
  const url = `${BASE_URL}/trends/${projectId}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch token trends: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Analisa performance de execuções (percentis, outliers)
 */
export async function getExecutionPerformance(
  projectId: string,
  command?: string
): Promise<PerformanceResponse> {
  const params = new URLSearchParams();
  if (command) params.append('command', command);

  const url = `${BASE_URL}/performance/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch execution performance: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calcula métricas de ROI (custo por card, eficiência, economia de tempo)
 */
export async function getROIMetrics(projectId: string): Promise<ROIResponse> {
  const url = `${BASE_URL}/roi/${projectId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ROI metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retorna métricas de produtividade (velocity, cycle time, throughput)
 */
export async function getProductivityMetrics(
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<ProductivityResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `${BASE_URL}/productivity/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch productivity metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Gera insights automáticos sobre as métricas
 */
export async function getInsights(projectId: string): Promise<InsightsResponse> {
  const url = `${BASE_URL}/insights/${projectId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retorna métricas agregadas por hora para um dia específico
 */
export async function getHourlyMetrics(
  projectId: string,
  targetDate?: string
): Promise<HourlyMetricsResponse> {
  const params = new URLSearchParams();
  if (targetDate) params.append('target_date', targetDate);

  const url = `${BASE_URL}/hourly/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch hourly metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Preenche métricas retroativamente para execuções existentes
 */
export async function backfillMetrics(
  projectId: string,
  startDate?: string
): Promise<{ message: string; metricsCreated: number }> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);

  const url = `${BASE_URL}/backfill/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Failed to backfill metrics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Compara métricas entre dois períodos
 */
export async function comparePeriods(
  projectId: string,
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): Promise<PeriodComparison> {
  const params = new URLSearchParams({
    current_start: currentStart,
    current_end: currentEnd,
    previous_start: previousStart,
    previous_end: previousEnd,
  });

  const url = `${BASE_URL}/compare/${projectId}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to compare periods: ${response.statusText}`);
  }

  return response.json();
}

// Hook para facilitar uso com React Query
export const metricsApi = {
  getProjectMetrics,
  getTokenUsage,
  getExecutionTimes,
  getCostAnalysis,
  getTokenTrends,
  getExecutionPerformance,
  getROIMetrics,
  getProductivityMetrics,
  getInsights,
  getHourlyMetrics,
  backfillMetrics,
  comparePeriods,
};
