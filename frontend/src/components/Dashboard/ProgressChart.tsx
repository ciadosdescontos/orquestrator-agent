import { useMemo } from 'react';
import { Card, ColumnId } from '../../types';
import styles from './ProgressChart.module.css';

interface ProgressChartProps {
  cards: Card[];
}

interface PipelineStage {
  id: ColumnId;
  name: string;
  count: number;
  color: string;
  percentage: number;
}

const ProgressChart = ({ cards }: ProgressChartProps) => {
  const pipelineData = useMemo(() => {
    const getCountByColumn = (columnId: ColumnId) =>
      cards.filter((card) => card.columnId === columnId).length;

    // Contar apenas cards ativos (não arquivados ou cancelados)
    const activeCards = cards.filter(
      (card) => !['archived', 'cancelado'].includes(card.columnId)
    );
    const totalActive = activeCards.length;

    const stages: PipelineStage[] = [
      {
        id: 'backlog',
        name: 'Backlog',
        count: getCountByColumn('backlog'),
        color: '#64748b', // Slate
        percentage: 0,
      },
      {
        id: 'plan',
        name: 'Planning',
        count: getCountByColumn('plan'),
        color: '#3b82f6', // Blue
        percentage: 0,
      },
      {
        id: 'implement',
        name: 'Implementing',
        count: getCountByColumn('implement'),
        color: '#f59e0b', // Amber
        percentage: 0,
      },
      {
        id: 'test',
        name: 'Testing',
        count: getCountByColumn('test'),
        color: '#a855f7', // Purple
        percentage: 0,
      },
      {
        id: 'review',
        name: 'Reviewing',
        count: getCountByColumn('review'),
        color: '#06b6d4', // Cyan
        percentage: 0,
      },
      {
        id: 'done',
        name: 'Done',
        count: getCountByColumn('done'),
        color: '#10b981', // Green
        percentage: 0,
      },
    ];

    // Calcular percentuais
    stages.forEach((stage) => {
      stage.percentage = totalActive > 0 ? (stage.count / totalActive) * 100 : 0;
    });

    return {
      stages,
      totalActive,
      archived: getCountByColumn('archived'),
      cancelled: getCountByColumn('cancelado'),
    };
  }, [cards]);

  // Gerar path do gráfico de fluxo (flow chart)
  const generateFlowPath = () => {
    const width = 100;
    const height = 80;
    const stageWidth = width / pipelineData.stages.length;

    let path = `M 0 ${height}`;

    pipelineData.stages.forEach((stage, index) => {
      const x = (index + 1) * stageWidth;
      const y = height - (stage.percentage / 100) * height;

      if (index === 0) {
        path += ` L ${x} ${y}`;
      } else {
        // Curva suave entre pontos
        const prevX = index * stageWidth;
        const prevStage = pipelineData.stages[index - 1];
        const prevY = height - (prevStage.percentage / 100) * height;
        const controlX = (prevX + x) / 2;

        path += ` C ${controlX} ${prevY}, ${controlX} ${y}, ${x} ${y}`;
      }
    });

    path += ` L ${width} ${height} Z`;
    return path;
  };

  return (
    <div className={styles.progressChart}>
      <div className={styles.header}>
        <h3 className={styles.title}>Pipeline Overview</h3>
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>Total Ativo:</span>
          <span className={styles.summaryValue}>{pipelineData.totalActive}</span>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className={styles.flowContainer}>
        <svg
          className={styles.flowChart}
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {pipelineData.stages.map((stage, index) => (
                <stop
                  key={stage.id}
                  offset={`${(index / (pipelineData.stages.length - 1)) * 100}%`}
                  stopColor={stage.color}
                  stopOpacity="0.3"
                />
              ))}
            </linearGradient>
          </defs>
          <path
            d={generateFlowPath()}
            fill="url(#flowGradient)"
            className={styles.flowPath}
          />
        </svg>
      </div>

      {/* Pipeline Stages */}
      <div className={styles.stages}>
        {pipelineData.stages.map((stage, index) => (
          <div
            key={stage.id}
            className={styles.stage}
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            <div className={styles.stageHeader}>
              <div
                className={styles.stageIndicator}
                style={{ backgroundColor: stage.color }}
              />
              <span className={styles.stageName}>{stage.name}</span>
            </div>

            <div className={styles.stageMetrics}>
              <div className={styles.stageCount}>{stage.count}</div>
              <div className={styles.stagePercentage}>
                {stage.percentage.toFixed(0)}%
              </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${stage.percentage}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      {(pipelineData.archived > 0 || pipelineData.cancelled > 0) && (
        <div className={styles.footer}>
          {pipelineData.archived > 0 && (
            <div className={styles.footerStat}>
              <span className={styles.footerLabel}>Arquivados:</span>
              <span className={styles.footerValue}>{pipelineData.archived}</span>
            </div>
          )}
          {pipelineData.cancelled > 0 && (
            <div className={styles.footerStat}>
              <span className={styles.footerLabel}>Cancelados:</span>
              <span className={styles.footerValue}>{pipelineData.cancelled}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
