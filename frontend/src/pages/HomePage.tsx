import { useMemo } from 'react';
import { Card as CardType, ColumnId } from '../types';
import { ModuleType } from '../layouts/WorkspaceLayout';
import styles from './HomePage.module.css';

interface HomePageProps {
  cards: CardType[];
  onNavigate: (module: ModuleType) => void;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  accentColor: 'cyan' | 'purple' | 'green' | 'amber';
}

const MetricCard = ({ title, value, icon, accentColor }: MetricCardProps) => {
  return (
    <div className={`${styles.metricCard} ${styles[`accent-${accentColor}`]}`}>
      <div className={styles.metricIcon}>{icon}</div>
      <div className={styles.metricContent}>
        <h3 className={styles.metricTitle}>{title}</h3>
        <p className={styles.metricValue}>{value}</p>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const QuickActionCard = ({ title, description, icon, onClick }: QuickActionCardProps) => {
  return (
    <button className={styles.quickAction} onClick={onClick}>
      <span className={styles.quickActionIcon}>{icon}</span>
      <div className={styles.quickActionContent}>
        <h3 className={styles.quickActionTitle}>{title}</h3>
        <p className={styles.quickActionDescription}>{description}</p>
      </div>
      <span className={styles.quickActionArrow}>→</span>
    </button>
  );
};

const HomePage = ({ cards, onNavigate }: HomePageProps) => {
  const metrics = useMemo(() => {
    const getCountByColumn = (columnId: ColumnId) =>
      cards.filter((card) => card.columnId === columnId).length;

    return {
      backlog: getCountByColumn('backlog'),
      inProgress: getCountByColumn('in-progress'),
      testing: getCountByColumn('test'),
      done: getCountByColumn('done'),
      total: cards.length,
    };
  }, [cards]);

  return (
    <div className={styles.homepage}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Workspace Overview</h1>
        <p className={styles.heroSubtitle}>
          Gerencie seus projetos e colabore com AI
        </p>
      </section>

      <section className={styles.metricsSection}>
        <h2 className={styles.sectionTitle}>Métricas do Projeto</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Backlog"
            value={metrics.backlog}
            icon="📝"
            accentColor="cyan"
          />
          <MetricCard
            title="Em Progresso"
            value={metrics.inProgress}
            icon="⚡"
            accentColor="amber"
          />
          <MetricCard
            title="Em Teste"
            value={metrics.testing}
            icon="🧪"
            accentColor="purple"
          />
          <MetricCard
            title="Concluídas"
            value={metrics.done}
            icon="✅"
            accentColor="green"
          />
        </div>
      </section>

      <section className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        <div className={styles.quickActionsGrid}>
          <QuickActionCard
            title="Acessar Kanban"
            description="Gerencie suas tarefas e workflow"
            icon="📋"
            onClick={() => onNavigate('kanban')}
          />
          <QuickActionCard
            title="Abrir Chat AI"
            description="Converse com o assistente inteligente"
            icon="💬"
            onClick={() => onNavigate('chat')}
          />
          <QuickActionCard
            title="Configurações"
            description="Ajuste preferências do projeto"
            icon="⚙️"
            onClick={() => onNavigate('settings')}
          />
        </div>
      </section>

      <section className={styles.overviewSection}>
        <div className={styles.overviewCard}>
          <h2 className={styles.sectionTitle}>Sobre o Workspace</h2>
          <p className={styles.overviewText}>
            Este workspace integra um <strong>Kanban Board</strong> com automação
            de workflow SDLC e um <strong>AI Assistant</strong> para auxiliar no
            desenvolvimento. Navegue pelos módulos usando a barra lateral.
          </p>
          <div className={styles.overviewStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total de Cards</span>
              <span className={styles.statValue}>{metrics.total}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Taxa de Conclusão</span>
              <span className={styles.statValue}>
                {metrics.total > 0
                  ? Math.round((metrics.done / metrics.total) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
