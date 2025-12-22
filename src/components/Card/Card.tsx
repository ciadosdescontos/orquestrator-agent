import { useDraggable } from '@dnd-kit/core';
import { Card as CardType } from '../../types';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  onRemove: () => void;
  isDragging?: boolean;
}

export function Card({ card, onRemove, isDragging = false }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className={styles.content}>
        <h3 className={styles.title}>{card.title}</h3>
        {card.description && (
          <p className={styles.description}>{card.description}</p>
        )}
      </div>
      <button
        className={styles.removeButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="Remove card"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
    </div>
  );
}
