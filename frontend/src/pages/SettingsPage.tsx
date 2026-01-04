import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>Configurações</h1>
        <p className={styles.settingsSubtitle}>
          Gerencie as preferências do seu workspace
        </p>
      </div>

      <div className={styles.settingsContent}>
        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Aparência</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Tema</h3>
              <p className={styles.settingDescription}>
                Atualmente usando o tema Cosmic Dark
              </p>
            </div>
            <div className={styles.settingControl}>
              <span className={styles.themeBadge}>🌌 Cosmic Dark</span>
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Workspace</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Nome do Projeto</h3>
              <p className={styles.settingDescription}>
                Nome exibido no workspace
              </p>
            </div>
            <div className={styles.settingControl}>
              <input
                type="text"
                className={styles.input}
                placeholder="Orquestrator Agent"
                disabled
              />
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>AI Assistant</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>Status do Chat</h3>
              <p className={styles.settingDescription}>
                Assistente AI disponível para conversas
              </p>
            </div>
            <div className={styles.settingControl}>
              <div className={styles.statusBadge}>
                <div className={styles.statusDot}></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>🚧</div>
          <h2 className={styles.comingSoonTitle}>Mais Configurações em Breve</h2>
          <p className={styles.comingSoonText}>
            Estamos trabalhando em mais opções de personalização para melhorar sua experiência.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
