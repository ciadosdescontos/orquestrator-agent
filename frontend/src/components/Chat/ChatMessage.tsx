import { Message } from '../../types/chat';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${styles.messageWrapper} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.messageContent}>
        <div className={styles.messageHeader}>
          <span className={styles.messageRole}>
            {isUser ? '👤 You' : '🤖 AI Assistant'}
          </span>
          <span className={styles.messageTime}>{formattedTime}</span>
        </div>
        <div className={styles.messageText}>
          {message.content}
          {message.isStreaming && (
            <span className={styles.streamingCursor}>▊</span>
          )}
        </div>
      </div>
    </div>
  );
}
