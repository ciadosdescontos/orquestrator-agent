import { ReactNode } from 'react';
import styles from './MetricCard.module.css';

export interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number; // Percentual de mudança (+10 = +10%)
  trendPeriod?: string; // "últimos 7 dias", "este mês", etc
  icon: ReactNode;
  color: 'cyan' | 'purple' | 'green' | 'amber' | 'blue' | 'red';
  subtitle?: string;
  sparkline?: number[]; // Mini gráfico de linha [10, 20, 15, 25, 30]
  highlighted?: boolean; // Destacar card com animação e glow
  glowColor?: string; // Cor personalizada do glow
}

const MetricCard = ({
  title,
  value,
  trend,
  trendPeriod,
  icon,
  color,
  subtitle,
  sparkline,
  highlighted = false,
  glowColor,
}: MetricCardProps) => {
  const trendDirection = trend && trend > 0 ? 'up' : trend && trend < 0 ? 'down' : 'neutral';
  const trendColor = trendDirection === 'up' ? styles.trendUp : trendDirection === 'down' ? styles.trendDown : styles.trendNeutral;

  // Gerar SVG do sparkline se fornecido
  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;

    const width = 100;
    const height = 32;
    const padding = 4;

    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;

    const points = sparkline
      .map((value, index) => {
        const x = (index / (sparkline.length - 1)) * (width - padding * 2) + padding;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg
        className={styles.sparkline}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div
      className={`${styles.metricCard} ${styles[`color-${color}`]} ${highlighted ? styles.highlighted : ''}`}
      style={glowColor ? { '--custom-glow-color': glowColor } as React.CSSProperties : undefined}
    >
      <div className={styles.cardGlow} />

      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          {icon}
        </div>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.valueSection}>
          <div className={styles.value}>{value}</div>
          {trend !== undefined && (
            <div className={`${styles.trend} ${trendColor}`}>
              <span className={styles.trendIcon}>
                {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→'}
              </span>
              <span className={styles.trendValue}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              {trendPeriod && (
                <span className={styles.trendPeriod}>{trendPeriod}</span>
              )}
            </div>
          )}
        </div>

        {sparkline && (
          <div className={styles.sparklineContainer}>
            {renderSparkline()}
          </div>
        )}
      </div>

      <div className={styles.cardBorder} />
    </div>
  );
};

export default MetricCard;
