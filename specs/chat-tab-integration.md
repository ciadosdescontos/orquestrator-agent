## 1. Resumo

Transformar o chat flutuante atual em uma aba integrada ao produto, permitindo alternar entre Kanban e Chat sem perder o histórico em memória, além de adicionar seleção de modelo de IA para cada sessão.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Remover botão flutuante do chat e integrar como aba do produto
- [x] Permitir alternância entre visualização Kanban e Chat sem perder estado/histórico
- [x] Adicionar seletor de modelo de IA (Claude, GPT-4, etc.) para cada nova sessão
- [x] Manter histórico do chat em memória durante a sessão (sem persistência em banco)

### Fora do Escopo
- Persistência de dados em banco de dados ou localStorage
- Histórico de múltiplas sessões simultâneas
- Autenticação de usuário para chat

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/App.tsx` | Modificar | Adicionar sistema de abas e remover ChatToggle |
| `frontend/src/components/TabNavigation/TabNavigation.tsx` | Criar | Componente de navegação por abas |
| `frontend/src/components/TabNavigation/TabNavigation.module.css` | Criar | Estilos para navegação por abas |
| `frontend/src/components/Chat/Chat.tsx` | Modificar | Adaptar para layout de aba e adicionar seletor de modelo |
| `frontend/src/components/Chat/Chat.module.css` | Modificar | Ajustar estilos para layout de aba |
| `frontend/src/components/Chat/ModelSelector.tsx` | Criar | Componente para seleção de modelo de IA |
| `frontend/src/components/Chat/ModelSelector.module.css` | Criar | Estilos para seletor de modelo |
| `frontend/src/hooks/useChat.ts` | Modificar | Adicionar suporte para modelo selecionado |
| `frontend/src/types/chat.ts` | Modificar | Adicionar tipos para modelos de IA |
| `backend/src/services/chat_service.py` | Modificar | Adicionar suporte para diferentes modelos |
| `backend/src/schemas/chat.py` | Modificar | Adicionar campo de modelo nas mensagens |
| `backend/src/agent_chat.py` | Modificar | Implementar seleção de modelo |

### Detalhes Técnicos

#### 1. Sistema de Abas (TabNavigation)

```typescript
// frontend/src/components/TabNavigation/TabNavigation.tsx
interface TabNavigationProps {
  activeTab: 'kanban' | 'chat';
  onTabChange: (tab: 'kanban' | 'chat') => void;
  chatUnreadCount?: number;
}

export function TabNavigation({ activeTab, onTabChange, chatUnreadCount }: TabNavigationProps) {
  return (
    <nav className={styles.tabNav}>
      <button
        className={`${styles.tab} ${activeTab === 'kanban' ? styles.active : ''}`}
        onClick={() => onTabChange('kanban')}
      >
        <BoardIcon />
        Kanban
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
        onClick={() => onTabChange('chat')}
      >
        <ChatIcon />
        Chat
        {chatUnreadCount > 0 && (
          <span className={styles.badge}>{chatUnreadCount}</span>
        )}
      </button>
    </nav>
  );
}
```

#### 2. Modificação do App.tsx

```typescript
// frontend/src/App.tsx
function App() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'chat'>('kanban');
  // ... existing state ...

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Board Kanban</h1>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          chatUnreadCount={chatState.unreadCount}
        />
        <div className={styles.projectActions}>
          {/* existing project actions */}
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === 'kanban' ? (
          <DndContext>
            {/* existing kanban board */}
          </DndContext>
        ) : (
          <Chat
            messages={chatState.session?.messages || []}
            isLoading={chatState.isLoading}
            error={chatState.error}
            onSendMessage={sendMessage}
            selectedModel={chatState.selectedModel}
            onModelChange={handleModelChange}
          />
        )}
      </main>
    </div>
  );
}
```

#### 3. Seletor de Modelo

```typescript
// frontend/src/components/Chat/ModelSelector.tsx
export interface AIModel {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google';
  maxTokens: number;
  description: string;
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Balanced performance and speed'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Most capable, best for complex tasks'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    description: 'OpenAI\'s most advanced model'
  }
];

export function ModelSelector({ selectedModel, onModelChange }: Props) {
  return (
    <div className={styles.modelSelector}>
      <label>AI Model:</label>
      <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)}>
        {AVAILABLE_MODELS.map(model => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
    </div>
  );
}
```

#### 4. Modificação do Chat Component

```typescript
// frontend/src/components/Chat/Chat.tsx
interface ChatProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (content: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function Chat({ ...props }: ChatProps) {
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>AI Assistant</h2>
        <ModelSelector
          selectedModel={props.selectedModel}
          onModelChange={props.onModelChange}
        />
      </div>
      {/* rest of chat implementation */}
    </div>
  );
}
```

#### 5. Atualização do Hook useChat

```typescript
// frontend/src/hooks/useChat.ts
export function useChat() {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    session: null,
    isLoading: false,
    error: null,
    selectedModel: 'claude-3-sonnet',
    unreadCount: 0,
  });

  const sendMessage = useCallback(async (content: string) => {
    // Include model in WebSocket message
    ws.current?.send(JSON.stringify({
      type: 'message',
      content: content.trim(),
      model: state.selectedModel,
    }));
  }, [state.selectedModel]);

  const handleModelChange = useCallback((model: string) => {
    // Reset session when model changes
    setState(prev => ({
      ...prev,
      selectedModel: model,
      session: {
        id: uuidv4(),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }));
  }, []);

  return {
    state,
    sendMessage,
    handleModelChange,
  };
}
```

#### 6. Backend - Suporte a Múltiplos Modelos

```python
# backend/src/agent_chat.py
class ClaudeAgentChat:
    async def stream_response(
        self,
        messages: list[dict],
        model: str = "claude-3-sonnet",
        system_prompt: str | None = None
    ) -> AsyncGenerator[str, None]:
        """Stream response with model selection"""

        # Map model IDs to agent configurations
        model_config = {
            "claude-3-sonnet": {"temperature": 0.7},
            "claude-3-opus": {"temperature": 0.5},
            "gpt-4-turbo": {"provider": "openai", "temperature": 0.7}
        }

        config = model_config.get(model, model_config["claude-3-sonnet"])

        # Implement model-specific logic here
        # For now, using Claude as default
        # Future: integrate with different providers based on config
```

---

## 4. Testes

### Unitários
- [x] Teste do componente TabNavigation
- [x] Teste do ModelSelector
- [x] Teste de mudança de estado entre abas
- [x] Teste de preservação do histórico ao trocar de aba

### Integração
- [x] Teste de envio de mensagem com modelo selecionado
- [x] Teste de reset de sessão ao trocar modelo
- [x] Teste de navegação por teclado (atalhos)

---

## 5. Considerações

- **Riscos:**
  - Performance ao manter histórico grande em memória - Mitigar com limite de mensagens (ex: últimas 100)
  - Compatibilidade com diferentes modelos de IA - Implementar fallback para modelo padrão

- **Dependências:**
  - Atualização da API backend para suportar múltiplos modelos
  - Possível necessidade de API keys adicionais para outros provedores

- **UX Melhorias:**
  - Adicionar indicador visual quando há novas mensagens na aba Chat
  - Keyboard shortcuts: Ctrl+1 para Kanban, Ctrl+2 para Chat
  - Animações suaves na transição entre abas