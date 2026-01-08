import { useMemo } from 'react';
import { Card as CardType, ColumnId } from '../types';
import { ModuleType } from '../layouts/WorkspaceLayout';
import MetricCard from '../components/Dashboard/MetricCard';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import ProgressChart from '../components/Dashboard/ProgressChart';
import styles from './HomePage.module.css';
import '../styles/dashboard-theme.css';

interface HomePageProps {
  cards: CardType[];
  onNavigate: (module: ModuleType) => void;
}

// Ícones SVG profissionais inline
const Icons = {
  Backlog: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  InProgress: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Testing: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3V4M15 3V4M9 20H15M10 4H14C14.5304 4 15.0391 4.21071 15.4142 4.58579C15.7893 4.96086 16 5.46957 16 6V18C16 19.1046 15.1046 20 14 20H10C8.89543 20 8 19.1046 8 18V6C8 5.46957 8.21071 4.96086 8.58579 4.58579C8.96086 4.21071 9.46957 4 10 4ZM12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Done: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Total: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21ZM10 8H14M10 12H14M10 16H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Active: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Kanban: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10H8.01M12 10H12.01M16 10H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4757 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.0409 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const HomePage = ({ cards, onNavigate }: HomePageProps) => {
  // Métricas calculadas com correção do bug do contador "Em Progresso"
  const metrics = useMemo(() => {
    const getCountByColumn = (columnId: ColumnId) =>
      cards.filter((card) => card.columnId === columnId).length;

    // Métricas principais
    const backlog = getCountByColumn('backlog');
    const planning = getCountByColumn('plan');
    const implementing = getCountByColumn('implement');
    const testing = getCountByColumn('test');
    const reviewing = getCountByColumn('review');
    const done = getCountByColumn('done');
    const archived = getCountByColumn('archived');
    const cancelled = getCountByColumn('cancelado');

    // CORREÇÃO DO BUG: Em Progresso = implement + test + review
    const inProgress = implementing + testing + reviewing;

    // Métricas derivadas
    const total = cards.length;
    const activeCards = total - archived - cancelled;
    const completionRate = activeCards > 0 ? (done / activeCards) * 100 : 0;

    // Calcular velocidade (cards completados nos últimos 7 dias - simulado)
    const velocity = 3; // TODO: Implementar cálculo real baseado em timestamps

    // Gerar sparkline data simulado para os últimos 7 dias
    const generateSparkline = () => {
      const days = 7;
      return Array.from({ length: days }, () =>
        Math.floor(Math.random() * 5) + inProgress - 2
      );
    };

    return {
      backlog,
      planning,
      inProgress,
      done,
      total,
      activeCards,
      completionRate,
      velocity,
      implementing,
      testing,
      reviewing,
      archived,
      cancelled,
      sparkline: generateSparkline(),
    };
  }, [cards]);

  // Determinar hora do dia para saudação personalizada
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className={styles.homepage}>
      {/* Background effects */}
      <div className={styles.backgroundEffects}>
        <div className="dashboard-mesh-overlay" />
        <div className="dashboard-noise-texture" />
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {getGreeting()}, <span className={styles.heroAccent}>Developer</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Visão geral do seu workspace • {metrics.activeCards} cards ativos
          </p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{metrics.completionRate.toFixed(0)}%</span>
            <span className={styles.heroStatLabel}>Taxa de conclusão</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{metrics.velocity}</span>
            <span className={styles.heroStatLabel}>Velocidade/semana</span>
          </div>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className={styles.metricsSection}>
        <h2 className={styles.sectionTitle}>Métricas Principais</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Backlog"
            value={metrics.backlog}
            icon={<Icons.Backlog />}
            color="cyan"
            subtitle="Aguardando planejamento"
          />
          <MetricCard
            title="Em Progresso"
            value={metrics.inProgress}
            icon={<Icons.InProgress />}
            color="amber"
            subtitle={`${metrics.implementing} impl • ${metrics.testing} test • ${metrics.reviewing} review`}
            sparkline={metrics.sparkline}
            trend={12}
            trendPeriod="vs. semana passada"
          />
          <MetricCard
            title="Em Teste"
            value={metrics.testing}
            icon={<Icons.Testing />}
            color="purple"
            subtitle="Validação em andamento"
          />
          <MetricCard
            title="Concluídos"
            value={metrics.done}
            icon={<Icons.Done />}
            color="green"
            subtitle="Prontos para produção"
            trend={8}
            trendPeriod="últimos 7 dias"
          />
        </div>
      </section>

      {/* Progress Overview & Activity Feed */}
      <section className={styles.overviewSection}>
        <div className={styles.overviewGrid}>
          {/* Progress Chart */}
          <div className={styles.overviewCard}>
            <ProgressChart cards={cards} />
          </div>

          {/* Activity Feed */}
          <div className={styles.overviewCard}>
            <ActivityFeed cards={cards} maxItems={8} />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        <div className={styles.actionsGrid}>
          <button
            className={styles.actionCard}
            onClick={() => onNavigate('kanban')}
          >
            <div className={styles.actionIcon}>
              <Icons.Kanban />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Acessar Kanban</h3>
              <p className={styles.actionDescription}>
                Gerencie tasks e visualize o workflow completo
              </p>
            </div>
            <div className={styles.actionArrow}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          <button
            className={styles.actionCard}
            onClick={() => onNavigate('chat')}
          >
            <div className={styles.actionIcon}>
              <Icons.Chat />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Abrir Chat AI</h3>
              <p className={styles.actionDescription}>
                Converse com o assistente inteligente do projeto
              </p>
            </div>
            <div className={styles.actionArrow}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          <button
            className={styles.actionCard}
            onClick={() => onNavigate('settings')}
          >
            <div className={styles.actionIcon}>
              <Icons.Settings />
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>Configurações</h3>
              <p className={styles.actionDescription}>
                Ajuste preferências e configurações do workspace
              </p>
            </div>
            <div className={styles.actionArrow}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
