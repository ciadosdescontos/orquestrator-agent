import { useMemo } from 'react';
import styles from './CostBreakdown.module.css';

interface ModelCost {
  model: string;
  total_cost: number;
  percentage: number;
}

interface CostBreakdownProps {
  data: {
    by_model?: ModelCost[];
    total_cost?: number;
  } | null;
  loading: boolean;
}

const CostBreakdown = ({ data, loading }: CostBreakdownProps) => {
  const getModelColor = (modelName: string): string => {
    const colors: { [key: string]: string } = {
      'opus': '#7c3aed',
      'sonnet': '#06b6d4',
      'haiku': '#10b981',
      'gpt-4': '#f59e0b',
      'gpt-3.5': '#ec4899',
    };

    for (const [key, color] of Object.entries(colors)) {
      if (modelName.toLowerCase().includes(key)) {
        return color;
      }
    }
    return '#6b7280'; // default gray
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(2)}`;
  };

  const sortedModels = useMemo(() => {
    if (!data?.by_model) return [];
    return [...data.by_model].sort((a, b) => b.total_cost - a.total_cost);
  }, [data]);

  if (loading) {
    return (
      <div className={styles.breakdown}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!data || !sortedModels || sortedModels.length === 0) {
    return (
      <div className={styles.breakdown}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-dollar-sign"></i>
          <p>No cost data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.breakdown}>
      {/* Total cost header */}
      <div className={styles.totalCost}>
        <span className={styles.totalLabel}>Total Cost</span>
        <span className={styles.totalValue}>{formatCost(data.total_cost || 0)}</span>
      </div>

      {/* Model breakdown list */}
      <div className={styles.modelList}>
        {sortedModels.map((model, idx) => (
          <div key={idx} className={styles.modelRow}>
            <div className={styles.modelHeader}>
              <div className={styles.modelInfo}>
                <span
                  className={styles.modelIndicator}
                  style={{ backgroundColor: getModelColor(model.model) }}
                />
                <span className={styles.modelName}>{model.model}</span>
              </div>
              <span className={styles.modelCost}>{formatCost(model.total_cost)}</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${model.percentage}%`,
                  backgroundColor: getModelColor(model.model),
                }}
              />
            </div>
            <div className={styles.modelPercentage}>
              {model.percentage.toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostBreakdown;
