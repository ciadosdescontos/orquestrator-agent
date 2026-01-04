# Plano de Redesign da UI - Separação de Produtos

## 1. Resumo

Reestruturar a interface do usuário para claramente separar o Kanban Board do Chat e outros recursos, transformando-os em módulos independentes dentro de um workspace unificado. O objetivo é criar uma navegação clara entre diferentes ferramentas do produto, evitando que recursos como Chat apareçam dentro do contexto do Kanban.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar uma estrutura de navegação principal que separe Kanban Board, Chat e futuros módulos
- [x] Implementar um layout de workspace com sidebar de navegação
- [x] Remover o Chat Toggle flutuante do Kanban Board
- [x] Criar páginas/views independentes para cada módulo
- [x] Melhorar a hierarquia visual e clareza na navegação
- [x] Manter o design cosmic dark theme atual mas com melhor organização

### Fora do Escopo
- Sistema de autenticação/login
- Mudanças no backend
- Alterações funcionais no Kanban ou Chat
- Novos recursos além da reorganização UI

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/layouts/WorkspaceLayout.tsx` | Criar | Layout principal com sidebar de navegação |
| `src/layouts/WorkspaceLayout.module.css` | Criar | Estilos do layout do workspace |
| `src/pages/KanbanPage.tsx` | Criar | Página dedicada para o Kanban Board |
| `src/pages/ChatPage.tsx` | Criar | Página dedicada para o Chat |
| `src/pages/HomePage.tsx` | Criar | Dashboard/home page com overview |
| `src/components/Navigation/Sidebar.tsx` | Criar | Componente de navegação lateral |
| `src/components/Navigation/Sidebar.module.css` | Criar | Estilos da sidebar |
| `src/App.tsx` | Modificar | Implementar roteamento e novo layout |
| `src/App.module.css` | Modificar | Ajustar estilos globais |
| `src/components/Chat/Chat.tsx` | Modificar | Adaptar para funcionar como página completa |
| `src/components/ChatToggle/*` | Remover | Não mais necessário com nova estrutura |
| `index.html` | Modificar | Atualizar título e metadados |

### Detalhes Técnicos

#### 1. Estrutura do WorkspaceLayout

```typescript
// src/layouts/WorkspaceLayout.tsx
interface WorkspaceLayoutProps {
  children: ReactNode;
  currentModule: 'dashboard' | 'kanban' | 'chat' | 'settings';
}

const WorkspaceLayout = ({ children, currentModule }: WorkspaceLayoutProps) => {
  return (
    <div className={styles.workspace}>
      <Sidebar currentModule={currentModule} />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          {/* Breadcrumb e título contextual */}
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};
```

#### 2. Sidebar de Navegação

```typescript
// src/components/Navigation/Sidebar.tsx
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/',
    description: 'Visão geral do projeto'
  },
  {
    id: 'kanban',
    label: 'Kanban Board',
    icon: 'Kanban',
    path: '/kanban',
    description: 'Gerenciar tarefas e workflow'
  },
  {
    id: 'chat',
    label: 'AI Assistant',
    icon: 'MessageSquare',
    path: '/chat',
    description: 'Chat com assistente AI'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'Settings',
    path: '/settings',
    description: 'Preferências do projeto'
  }
];
```

#### 3. Roteamento Simples (sem React Router)

```typescript
// src/App.tsx - Sistema de roteamento baseado em estado
const [currentView, setCurrentView] = useState<'dashboard' | 'kanban' | 'chat' | 'settings'>('dashboard');

const renderView = () => {
  switch(currentView) {
    case 'dashboard':
      return <HomePage />;
    case 'kanban':
      return <KanbanPage />;
    case 'chat':
      return <ChatPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
};

return (
  <WorkspaceLayout currentModule={currentView} onNavigate={setCurrentView}>
    {renderView()}
  </WorkspaceLayout>
);
```

#### 4. Design Visual da Sidebar

```css
/* src/components/Navigation/Sidebar.module.css */
.sidebar {
  width: 280px;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

.navItem {
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--duration-fast) var(--ease-out);
  border-radius: var(--radius-md);
  margin: var(--space-1) var(--space-2);
}

.navItem.active {
  background: var(--glass-bg);
  border: 1px solid var(--border-glow);
  box-shadow: var(--shadow-glow-sm);
}
```

#### 5. Dashboard/HomePage com Cards de Métricas

```typescript
// src/pages/HomePage.tsx
const HomePage = () => {
  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <h1>Workspace Overview</h1>
        <p>Gerencie seus projetos e colabore com AI</p>
      </section>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Tasks em Progresso"
          value={inProgressCount}
          icon="Activity"
        />
        <MetricCard
          title="Mensagens no Chat"
          value={chatMessageCount}
          icon="MessageSquare"
        />
        {/* ... mais métricas */}
      </div>

      <div className={styles.quickActions}>
        <QuickActionCard
          title="Acessar Kanban"
          description="Gerencie suas tarefas"
          onClick={() => navigateTo('kanban')}
        />
        <QuickActionCard
          title="Abrir Chat AI"
          description="Converse com o assistente"
          onClick={() => navigateTo('chat')}
        />
      </div>
    </div>
  );
};
```

#### 6. Adaptação da Página do Kanban

```typescript
// src/pages/KanbanPage.tsx
const KanbanPage = () => {
  // Toda lógica atual do App.tsx relacionada ao Kanban
  // Sem Chat Toggle, sem componente Chat
  return (
    <div className={styles.kanbanPage}>
      <DndContext>
        <Board {...boardProps} />
        <DragOverlay>
          {activeCard && <Card />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
```

#### 7. Chat como Página Completa

```typescript
// src/pages/ChatPage.tsx
const ChatPage = () => {
  const { state, sendMessage } = useChat();

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>
        <ChatHeader />
        <MessagesList messages={state.messages} />
        <ChatInput onSend={sendMessage} />
      </div>

      {/* Sidebar com histórico de conversas */}
      <aside className={styles.chatSidebar}>
        <h3>Conversas Recentes</h3>
        <ChatHistory />
      </aside>
    </div>
  );
};
```

---

## 4. Testes

### Manuais
- [x] Navegação entre módulos funciona corretamente
- [x] Estado do Kanban é preservado ao trocar de view
- [x] Chat mantém histórico ao navegar
- [x] Layout responsivo em diferentes tamanhos de tela
- [x] Transições suaves entre views
- [x] Indicadores visuais do módulo ativo

### Verificações de UI/UX
- [x] Clareza na separação entre módulos
- [x] Hierarquia visual bem definida
- [x] Acessibilidade com keyboard navigation
- [x] Performance das transições

---

## 5. Considerações

### Melhorias Visuais com frontend-design skill
- Usar a skill `frontend-design` para criar componentes distintivos e com alta qualidade de design
- Aplicar microinterações e animações sutis
- Criar ícones e ilustrações personalizadas para cada módulo
- Implementar efeitos de glassmorphism consistentes

### Riscos e Mitigações
- **Risco:** Perda de contexto ao navegar entre módulos
  - **Mitigação:** Implementar breadcrumbs e indicadores de navegação claros

- **Risco:** Complexidade adicional sem React Router
  - **Mitigação:** Implementar sistema simples baseado em estado com histórico manual se necessário

### Próximos Passos
1. Após implementação, considerar adicionar:
   - Sistema de notificações unificado
   - Pesquisa global
   - Temas customizáveis
   - Atalhos de teclado para navegação rápida