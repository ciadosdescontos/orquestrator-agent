import styles from './TabNavigation.module.css';

interface TabNavigationProps {
  activeTab: 'kanban' | 'chat';
  onTabChange: (tab: 'kanban' | 'chat') => void;
  chatUnreadCount?: number;
}

function BoardIcon() {
  return (
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ChatIcon() {
  return (
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function TabNavigation({ activeTab, onTabChange, chatUnreadCount = 0 }: TabNavigationProps) {
  return (
    <nav className={styles.tabNav}>
      <button
        className={`${styles.tab} ${activeTab === 'kanban' ? styles.active : ''}`}
        onClick={() => onTabChange('kanban')}
        aria-label="Kanban Board"
        aria-current={activeTab === 'kanban' ? 'page' : undefined}
      >
        <BoardIcon />
        <span>Kanban</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
        onClick={() => onTabChange('chat')}
        aria-label="Chat Assistant"
        aria-current={activeTab === 'chat' ? 'page' : undefined}
      >
        <ChatIcon />
        <span>Chat</span>
        {chatUnreadCount > 0 && (
          <span className={styles.badge} aria-label={`${chatUnreadCount} unread messages`}>
            {chatUnreadCount}
          </span>
        )}
      </button>
    </nav>
  );
}
