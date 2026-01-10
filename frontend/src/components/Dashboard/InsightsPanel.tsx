import styles from './InsightsPanel.module.css';

interface Insight {
  type: 'warning' | 'info' | 'success' | 'tip';
  message: string;
  metric?: string;
  value?: string | number;
}

interface InsightsPanelProps {
  insights: Insight[];
}

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  const getInsightIcon = (type: string): string => {
    switch (type) {
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'tip':
        return 'fa-solid fa-lightbulb';
      case 'info':
      default:
        return 'fa-solid fa-info-circle';
    }
  };

  const getInsightColor = (type: string): string => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'tip':
        return 'tip';
      case 'info':
      default:
        return 'info';
    }
  };

  if (!insights || insights.length === 0) {
    return (
      <div className={styles.insightsPanel}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-brain"></i>
          <p>No insights available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.insightsPanel}>
      <div className={styles.insightsList}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`${styles.insightCard} ${styles[getInsightColor(insight.type)]}`}
          >
            <div className={styles.insightIcon}>
              <i className={getInsightIcon(insight.type)}></i>
            </div>
            <div className={styles.insightContent}>
              <p className={styles.insightMessage}>{insight.message}</p>
              {insight.metric && insight.value && (
                <div className={styles.insightMetric}>
                  <span className={styles.metricLabel}>{insight.metric}:</span>
                  <span className={styles.metricValue}>{insight.value}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
