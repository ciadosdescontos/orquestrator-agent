import { useState, KeyboardEvent } from 'react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        <div className={styles.innerWrapper}>
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            disabled={disabled}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.hint}>
        <span>Press <kbd>Enter</kbd> to send</span>
        <span>•</span>
        <span><kbd>Shift</kbd> + <kbd>Enter</kbd> for new line</span>
      </div>
    </div>
  );
}
