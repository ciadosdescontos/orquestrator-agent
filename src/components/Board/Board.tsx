import { Card as CardType, Column as ColumnType, ColumnId } from '../../types';
import { Column } from '../Column/Column';
import styles from './Board.module.css';

interface BoardProps {
  columns: ColumnType[];
  cards: CardType[];
  onAddCard: (title: string, description: string, columnId: ColumnId) => void;
  onRemoveCard: (cardId: string) => void;
}

export function Board({ columns, cards, onAddCard, onRemoveCard }: BoardProps) {
  return (
    <div className={styles.board}>
      {columns.map(column => (
        <Column
          key={column.id}
          column={column}
          cards={cards.filter(card => card.columnId === column.id)}
          onAddCard={onAddCard}
          onRemoveCard={onRemoveCard}
        />
      ))}
    </div>
  );
}
