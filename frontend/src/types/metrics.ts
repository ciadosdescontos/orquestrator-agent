/**
 * Tipos TypeScript para métricas
 */

export interface ProjectMetrics {
  projectId: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  avgExecutionTimeMs: number;
  minExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
}

export interface TokenUsageData {
  timestamp?: string;
  model?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  executionCount?: number;
}

export interface ExecutionTimeData {
  cardId: string;
  cardTitle: string;
  command: string;
  durationMs: number;
  timestamp: string;
  status: 'success' | 'error';
}

export interface CostBreakdown {
  model?: string;
  command?: string;
  date?: string;
  totalCost: number;
  percentage: number;
  tokenCount: number;
  executions: number;
}

export interface TokenTrends {
  movingAverage: number;
  peakUsage: {
    date: string | null;
    tokens: number;
  };
  trend: number;
  projection: number;
  dailyData: Array<{
    date: string | null;
    tokens: number;
  }>;
}

export interface PerformanceMetrics {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  outlierCount: number;
  outlierThreshold: number;
}

export interface ROIMetrics {
  costPerCard: number;
  totalCost: number;
  cardsCompleted: number;
  modelEfficiency: Array<{
    model: string;
    tokensPerDollar: number;
    costPerToken: number;
  }>;
  estimatedTimeSaved: {
    hours: number;
    manualHours: number;
    aiHours: number;
  };
}

export interface ProductivityMetrics {
  cardsCompleted: number;
  cardsInProgress: number;
  cardsTodo: number;
  velocity: number;
  totalCards: number;
}

export interface Insight {
  type: 'info' | 'warning' | 'optimization' | 'error';
  title: string;
  message: string;
}

export interface HourlyMetrics {
  hour: number;
  executionCount: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
}

export interface PeriodComparison {
  current: ProjectMetrics;
  previous: ProjectMetrics;
  comparison: {
    totalTokens: ComparisonValue;
    totalCost: ComparisonValue;
    avgExecutionTime: ComparisonValue;
    successRate: ComparisonValue;
  };
}

export interface ComparisonValue {
  value: number;
  change: number;
  percentage: number;
}

// Tipos de período para filtros
export type DateRange = '24h' | '7d' | '30d' | 'all';
export type Granularity = 'hour' | 'day' | 'week' | 'month';
export type GroupBy = 'hour' | 'day' | 'model' | 'command';

// Tipos de resposta da API
export interface MetricsResponse {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  avgExecutionTimeMs: number;
  minExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
}

export interface TokenUsageResponse {
  data: TokenUsageData[];
}

export interface ExecutionTimeResponse {
  data: ExecutionTimeData[];
}

export interface CostAnalysisResponse {
  data: CostBreakdown[];
}

export interface InsightsResponse {
  insights: Insight[];
}

export interface TrendsResponse extends TokenTrends {}

export interface PerformanceResponse extends PerformanceMetrics {}

export interface ROIResponse extends ROIMetrics {}

export interface ProductivityResponse extends ProductivityMetrics {}

export interface HourlyMetricsResponse {
  data: HourlyMetrics[];
}
