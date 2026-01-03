import { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import styles from './Chat.module.css';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (content: string) => void;
}

export default function Chat({
  isOpen,
  onClose,
  messages,
  isLoading,
  error,
  onSendMessage,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`${styles.chatContainer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.chatHeader}>
        <h2 className={styles.chatTitle}>AI Assistant</h2>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyText}>
              Start a conversation with your AI assistant
            </p>
            <p className={styles.emptySubtext}>
              Ask questions, get help, or just chat!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
