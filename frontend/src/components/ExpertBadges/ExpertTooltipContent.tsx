import { ExpertMatch } from '../../types';
import styles from './ExpertTooltipContent.module.css';

interface ExpertTooltipContentProps {
  expertLabel: string;
  match: ExpertMatch;
  color: string;
}

export function ExpertTooltipContent({
  expertLabel,
  match,
  color
}: ExpertTooltipContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.tooltipContent}>
      {/* Header */}
      <div className={styles.header} style={{ borderColor: color }}>
        <div className={styles.expertName} style={{ color }}>
          {expertLabel} Expert
        </div>
        <div className={`${styles.confidence} ${styles[match.confidence]}`}>
          <span className={styles.confidenceLabel}>Confidence:</span>
          <span className={styles.confidenceValue}>{match.confidence}</span>
        </div>
      </div>

      {/* Reason Section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Reason</div>
        <div className={styles.reason}>
          {match.reason}
        </div>
      </div>

      {/* Knowledge Summary (if available) */}
      {match.knowledge_summary && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Knowledge Summary</div>
          <div className={styles.summary}>
            {match.knowledge_summary}
          </div>
        </div>
      )}

      {/* Matched Keywords (if available) */}
      {match.matched_keywords && match.matched_keywords.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Matched Keywords</div>
          <div className={styles.keywords}>
            {match.matched_keywords.map((keyword, index) => (
              <span key={index} className={styles.keyword} style={{ backgroundColor: `${color}15`, color }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer with timestamp */}
      <div className={styles.footer}>
        <span className={styles.timestamp}>
          Identified at: {formatDate(match.identified_at)}
        </span>
      </div>
    </div>
  );
}
