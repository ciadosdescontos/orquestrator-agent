import { ModuleType } from '../../layouts/WorkspaceLayout';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import styles from './Sidebar.module.css';

interface NavigationItem {
  id: ModuleType;
  label: string;
  icon: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Visão geral do projeto',
  },
  {
    id: 'kanban',
    label: 'Kanban Board',
    icon: '📋',
    description: 'Gerenciar tarefas e workflow',
  },
  {
    id: 'chat',
    label: 'AI Assistant',
    icon: '💬',
    description: 'Chat com assistente AI',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: '⚙️',
    description: 'Preferências do projeto',
  },
];

interface SidebarProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
}

const Sidebar = ({ currentModule, onNavigate }: SidebarProps) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🚀</span>
          <h2 className={styles.logoText}>Workspace</h2>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.navItem} ${
                  currentModule === item.id ? styles.navItemActive : ''
                }`}
                onClick={() => onNavigate(item.id)}
                aria-current={currentModule === item.id ? 'page' : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <div className={styles.navContent}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <ThemeToggle />
        <div className={styles.footerInfo}>
          <span className={styles.footerLabel}>Orquestrator Agent</span>
          <span className={styles.footerVersion}>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
