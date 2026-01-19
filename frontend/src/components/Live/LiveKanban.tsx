import { LiveKanban as LiveKanbanType, LiveColumnId } from '../../types/live';
import styles from './Live.module.css';

interface LiveKanbanProps {
  kanban: LiveKanbanType;
}

const COLUMN_LABELS: Record<LiveColumnId, string> = {
  backlog: 'Backlog',
  plan: 'Planning',
  implement: 'Implementing',
  test: 'Testing',
  review: 'Review',
  done: 'Done',
};

const COLUMN_ICONS: Record<LiveColumnId, string> = {
  backlog: '📋',
  plan: '📝',
  implement: '🔨',
  test: '🧪',
  review: '🔍',
  done: '✅',
};

const COLUMN_ORDER: LiveColumnId[] = ['backlog', 'plan', 'implement', 'test', 'review', 'done'];

export function LiveKanbanBoard({ kanban }: LiveKanbanProps) {
  return (
    <div className={styles.kanbanPanel}>
      <h3 className={styles.sectionTitle}>
        Kanban Board
        <span className={styles.totalCards}>{kanban.totalCards} tasks</span>
      </h3>

      <div className={styles.kanbanBoard}>
        {COLUMN_ORDER.map(columnId => {
          const cards = kanban.columns[columnId] || [];
          return (
            <div key={columnId} className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <span className={styles.columnIcon}>{COLUMN_ICONS[columnId]}</span>
                <span className={styles.columnName}>{COLUMN_LABELS[columnId]}</span>
                <span className={styles.columnCount}>{cards.length}</span>
              </div>

              <div className={styles.columnCards}>
                {cards.map(card => (
                  <div key={card.id} className={styles.kanbanCard}>
                    <span className={styles.kanbanCardTitle}>{card.title}</span>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className={styles.emptyColumn}>Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
