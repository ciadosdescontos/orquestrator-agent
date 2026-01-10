import { useMemo } from 'react';
import styles from './TokenUsagePanel.module.css';

interface TokenDataPoint {
  day: string;
  tokens: number;
  input_tokens: number;
  output_tokens: number;
}

interface TokenUsagePanelProps {
  data: {
    daily_usage?: TokenDataPoint[];
    total_tokens?: number;
    total_cost?: number;
    period?: string;
  } | null;
  loading: boolean;
}

const TokenUsagePanel = ({ data, loading }: TokenUsagePanelProps) => {
  const chartData = useMemo(() => {
    if (!data?.daily_usage || data.daily_usage.length === 0) {
      return [];
    }
    return data.daily_usage;
  }, [data]);

  const maxTokens = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map(item => item.tokens));
  }, [chartData]);

  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCost = (cost: number | undefined): string => {
    if (!cost) return '$0.00';
    return `$${cost.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-chart-simple"></i>
          <p>No token usage data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Simple CSS-based chart */}
      <div className={styles.simpleChart}>
        {chartData.map((item, idx) => (
          <div key={idx} className={styles.chartBar}>
            <div
              className={styles.barFill}
              style={{
                height: `${(item.tokens / maxTokens) * 100}%`,
              }}
              title={`${item.day}: ${formatNumber(item.tokens)} tokens`}
            />
            <span className={styles.barLabel}>
              {item.day.split('-').pop()}
            </span>
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div className={styles.summary}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatNumber(data.total_tokens)}</span>
          <span className={styles.statLabel}>Total Tokens</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatCost(data.total_cost)}</span>
          <span className={styles.statLabel}>Est. Cost</span>
        </div>
      </div>
    </div>
  );
};

export default TokenUsagePanel;
