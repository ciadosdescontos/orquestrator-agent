import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className={styles.track}>
        <span className={`${styles.thumb} ${theme === 'light' ? styles.light : ''}`}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
      <span className={styles.label}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
