import { CardExperts, ExpertConfidence } from '../../types';
import { Tooltip } from '../Tooltip';
import { ExpertTooltipContent } from './ExpertTooltipContent';
import styles from './ExpertBadges.module.css';

interface ExpertBadgesProps {
  experts?: CardExperts;
  isLoading?: boolean;
  size?: 'small' | 'medium';
}

// Expert display configuration
const EXPERT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'database': {
    label: 'Database',
    icon: '',
    color: '#3b82f6', // blue
  },
  'kanban-flow': {
    label: 'Kanban',
    icon: '',
    color: '#8b5cf6', // purple
  },
  'frontend': {
    label: 'Frontend',
    icon: '',
    color: '#10b981', // green
  },
  'websocket': {
    label: 'WebSocket',
    icon: '',
    color: '#f59e0b', // amber
  },
  'chat': {
    label: 'Chat',
    icon: '',
    color: '#ec4899', // pink
  },
};

const CONFIDENCE_STYLES: Record<ExpertConfidence, { opacity: number; border: string }> = {
  high: { opacity: 1, border: '2px solid' },
  medium: { opacity: 0.85, border: '1px solid' },
  low: { opacity: 0.7, border: '1px dashed' },
};

function getExpertConfig(expertId: string) {
  return EXPERT_CONFIG[expertId] || {
    label: expertId.charAt(0).toUpperCase() + expertId.slice(1),
    icon: '',
    color: '#6b7280', // gray
  };
}

export function ExpertBadges({ experts, isLoading, size = 'small' }: ExpertBadgesProps) {
  if (isLoading) {
    return (
      <div className={`${styles.container} ${styles[size]}`}>
        <span className={styles.loadingBadge}>
          <span className={styles.loadingDot}></span>
          Identificando experts...
        </span>
      </div>
    );
  }

  if (!experts || Object.keys(experts).length === 0) {
    return null;
  }

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {Object.entries(experts).map(([expertId, match]) => {
        const config = getExpertConfig(expertId);
        const confidenceStyle = CONFIDENCE_STYLES[match.confidence];

        return (
          <Tooltip
            key={expertId}
            content={
              <ExpertTooltipContent
                expertLabel={config.label}
                match={match}
                color={config.color}
              />
            }
            placement="top"
            trigger="hover"
            delay={300}
            interactive={true}
            maxWidth={400}
          >
            <span
              className={styles.badge}
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
                borderColor: config.color,
                borderStyle: match.confidence === 'low' ? 'dashed' : 'solid',
                borderWidth: match.confidence === 'high' ? '2px' : '1px',
                opacity: confidenceStyle.opacity,
              }}
            >
              <span className={styles.icon}>{config.icon}</span>
              <span className={styles.label}>{config.label}</span>
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default ExpertBadges;
