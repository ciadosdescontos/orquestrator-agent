import { useMemo } from 'react';
import styles from './ExecutionMetrics.module.css';

interface RecentExecution {
  command: string;
  duration_ms: number;
  timestamp: string;
  status: 'success' | 'error';
}

interface ExecutionMetricsProps {
  data: {
    avg_duration_ms?: number;
    p95_duration_ms?: number;
    success_rate?: number;
    recent_executions?: RecentExecution[];
  } | null;
  loading: boolean;
}

const ExecutionMetrics = ({ data, loading }: ExecutionMetricsProps) => {
  const formatDuration = (ms: number | undefined): string => {
    if (!ms) return '0ms';
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  const formatSuccessRate = (rate: number | undefined): string => {
    if (!rate) return '0%';
    return `${rate.toFixed(1)}%`;
  };

  const recentExecutions = useMemo(() => {
    if (!data?.recent_executions) return [];
    return data.recent_executions.slice(0, 3);
  }, [data]);

  if (loading) {
    return (
      <div className={styles.executionPanel}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.executionPanel}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-gauge-high"></i>
          <p>No execution data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.executionPanel}>
      {/* Grid of mini cards */}
      <div className={styles.statsGrid}>
        <div className={styles.miniCard}>
          <div className={styles.miniIcon}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className={styles.miniValue}>{formatDuration(data.avg_duration_ms)}</div>
          <div className={styles.miniLabel}>Avg Time</div>
        </div>
        <div className={styles.miniCard}>
          <div className={styles.miniIcon}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className={styles.miniValue}>{formatDuration(data.p95_duration_ms)}</div>
          <div className={styles.miniLabel}>P95 Time</div>
        </div>
        <div className={styles.miniCard}>
          <div className={styles.miniIcon}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className={styles.miniValue}>{formatSuccessRate(data.success_rate)}</div>
          <div className={styles.miniLabel}>Success</div>
        </div>
      </div>

      {/* Recent executions list */}
      {recentExecutions.length > 0 && (
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <span className={styles.recentTitle}>Recent Executions</span>
          </div>
          <div className={styles.recentList}>
            {recentExecutions.map((exec, idx) => (
              <div key={idx} className={styles.execRow}>
                <div className={styles.execInfo}>
                  <span
                    className={`${styles.execStatus} ${
                      exec.status === 'success' ? styles.statusSuccess : styles.statusError
                    }`}
                  />
                  <span className={styles.execCommand}>{exec.command}</span>
                </div>
                <span className={styles.execTime}>{formatDuration(exec.duration_ms)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionMetrics;
