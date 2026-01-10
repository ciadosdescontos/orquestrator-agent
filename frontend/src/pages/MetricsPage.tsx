import { useState, useEffect } from 'react';
import { metricsApi } from '../api/metrics';
import type {
  MetricsResponse,
  TokenUsageResponse,
  ExecutionTimeResponse,
  CostAnalysisResponse,
  InsightsResponse,
  DateRange,
} from '../types/metrics';
import styles from './MetricsPage.module.css';

interface MetricsPageProps {
  projectId: string;
}

const MetricsPage = ({ projectId }: MetricsPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para as métricas
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageResponse | null>(null);
  const [executionTimes, setExecutionTimes] = useState<ExecutionTimeResponse | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [projectId, dateRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar todas as métricas em paralelo
      const [metricsData, tokenData, executionData, costData, insightsData] = await Promise.all([
        metricsApi.getProjectMetrics(projectId),
        metricsApi.getTokenUsage(projectId, dateRange),
        metricsApi.getExecutionTimes(projectId),
        metricsApi.getCostAnalysis(projectId, 'model'),
        metricsApi.getInsights(projectId),
      ]);

      setMetrics(metricsData);
      setTokenUsage(tokenData);
      setExecutionTimes(executionData);
      setCostAnalysis(costData);
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className={styles.metricsPage}>
        <div className={styles.loading}>Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.metricsPage}>
        <div className={styles.error}>
          <h2>Error loading metrics</h2>
          <p>{error}</p>
          <button onClick={loadMetrics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.metricsPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Project Metrics Dashboard</h1>
        <div className={styles.filters}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className={styles.dateRangeSelect}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={loadMetrics} className={styles.refreshButton}>
            Refresh
          </button>
        </div>
      </div>

      {/* Insights Panel */}
      {insights && insights.insights.length > 0 && (
        <div className={styles.insightsPanel}>
          <h2>Insights</h2>
          <div className={styles.insightsList}>
            {insights.insights.map((insight, index) => (
              <div key={index} className={`${styles.insight} ${styles[insight.type]}`}>
                <div className={styles.insightIcon}>
                  {insight.type === 'warning' && '⚠️'}
                  {insight.type === 'info' && 'ℹ️'}
                  {insight.type === 'optimization' && '⚡'}
                  {insight.type === 'error' && '❌'}
                </div>
                <div className={styles.insightContent}>
                  <h3>{insight.title}</h3>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Metrics Grid */}
      {metrics && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>🎯</span>
              <span className={styles.metricLabel}>Total Tokens</span>
            </div>
            <div className={styles.metricValue}>{formatNumber(metrics.totalTokens)}</div>
            <div className={styles.metricSubtitle}>
              {formatNumber(metrics.totalInputTokens)} input / {formatNumber(metrics.totalOutputTokens)} output
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>⏱️</span>
              <span className={styles.metricLabel}>Avg Execution Time</span>
            </div>
            <div className={styles.metricValue}>{formatDuration(metrics.avgExecutionTimeMs)}</div>
            <div className={styles.metricSubtitle}>
              Min: {formatDuration(metrics.minExecutionTimeMs)} / Max: {formatDuration(metrics.maxExecutionTimeMs)}
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>💰</span>
              <span className={styles.metricLabel}>Total Cost</span>
            </div>
            <div className={styles.metricValue}>{formatCurrency(metrics.totalCost)}</div>
            <div className={styles.metricSubtitle}>
              {metrics.totalExecutions} executions
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>✅</span>
              <span className={styles.metricLabel}>Success Rate</span>
            </div>
            <div className={styles.metricValue}>{metrics.successRate.toFixed(1)}%</div>
            <div className={styles.metricSubtitle}>
              {metrics.successfulExecutions} / {metrics.totalExecutions} successful
            </div>
          </div>
        </div>
      )}

      {/* Token Usage Section */}
      {tokenUsage && tokenUsage.data.length > 0 && (
        <div className={styles.section}>
          <h2>Token Usage Over Time</h2>
          <div className={styles.chartContainer}>
            <div className={styles.simpleChart}>
              {tokenUsage.data.map((item, index) => {
                const maxTokens = Math.max(...tokenUsage.data.map(d => d.totalTokens));
                const height = (item.totalTokens / maxTokens) * 100;
                return (
                  <div key={index} className={styles.chartBar}>
                    <div
                      className={styles.chartBarFill}
                      style={{ height: `${height}%` }}
                      title={`${item.timestamp || item.model}: ${formatNumber(item.totalTokens)} tokens`}
                    />
                    <div className={styles.chartBarLabel}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : item.model}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis Section */}
      {costAnalysis && costAnalysis.data.length > 0 && (
        <div className={styles.section}>
          <h2>Cost Breakdown by Model</h2>
          <div className={styles.costTable}>
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Cost</th>
                  <th>Percentage</th>
                  <th>Tokens</th>
                  <th>Executions</th>
                </tr>
              </thead>
              <tbody>
                {costAnalysis.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.model}</td>
                    <td>{formatCurrency(item.totalCost)}</td>
                    <td>{item.percentage.toFixed(1)}%</td>
                    <td>{formatNumber(item.tokenCount)}</td>
                    <td>{item.executions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Execution Times Section */}
      {executionTimes && executionTimes.data.length > 0 && (
        <div className={styles.section}>
          <h2>Recent Executions</h2>
          <div className={styles.executionsTable}>
            <table>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Command</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {executionTimes.data.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{item.cardTitle}</td>
                    <td><code>{item.command}</code></td>
                    <td>{formatDuration(item.durationMs)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPage;
