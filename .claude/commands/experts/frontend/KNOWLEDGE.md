# Frontend Expert - Knowledge Base

## Tecnologia

- **Framework**: React 18
- **Linguagem**: TypeScript (strict mode)
- **Build Tool**: Vite 5
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: lucide-react
- **Estilos**: CSS Modules
- **IDs**: uuid

## Estrutura de Diretorios

```
frontend/src/
├── App.tsx              # Roteamento e layout principal
├── main.tsx             # Entry point
├── api/                 # Clientes de API
├── components/          # Componentes React
├── constants/           # Constantes (pricing, etc)
├── contexts/            # React Contexts
├── hooks/               # Custom Hooks
├── layouts/             # Layout components
├── pages/               # Page components
├── styles/              # Estilos globais
├── types/               # TypeScript types
└── utils/               # Funcoes utilitarias
```

## Arquivos Core

### Entry Points

| Arquivo | Responsabilidade |
|---------|-----------------|
| `frontend/src/main.tsx` | Bootstrap da app, render root |
| `frontend/src/App.tsx` | Roteamento, providers, layout principal |

### API Clients

| Arquivo | Responsabilidade |
|---------|-----------------|
| `frontend/src/api/cards.ts` | CRUD de cards, execucao de workflows |
| `frontend/src/api/projects.ts` | Load/switch projetos, projeto ativo |
| `frontend/src/api/metrics.ts` | Dashboard metrics, agregacoes |
| `frontend/src/api/chat.ts` | Envio de mensagens, streaming |
| `frontend/src/api/activities.ts` | Activity feed |
| `frontend/src/api/config.ts` | Configuracoes da API (baseUrl) |
| `frontend/src/api/settings.ts` | Settings da app |
| `frontend/src/api/git.ts` | Operacoes Git |

### Components Principais

| Diretorio | Componentes | Descricao |
|-----------|-------------|-----------|
| `components/Board/` | Board.tsx | Kanban board com drag-drop |
| `components/Column/` | Column.tsx | Coluna do Kanban (backlog, plan, etc) |
| `components/Card/` | Card.tsx | Card individual com acoes |
| `components/Chat/` | Chat.tsx, ChatInput.tsx, ChatMessage.tsx, ModelSelector.tsx | Interface de chat |
| `components/Dashboard/` | MetricCard, CostBreakdown, TokenUsagePanel, ActivityFeed, etc | Widgets do dashboard |
| `components/Navigation/` | Sidebar.tsx | Navegacao lateral |
| `components/AddCard/` | AddCard.tsx | Botao/form para criar cards |
| `components/AddCardModal/` | AddCardModal.tsx | Modal de criacao de card |
| `components/CardEditModal/` | CardEditModal.tsx | Modal de edicao de card |
| `components/LogsModal/` | LogsModal.tsx | Modal de logs de execucao |
| `components/ProjectLoader/` | ProjectLoader.tsx | UI para carregar projetos |
| `components/ProjectSwitcher/` | ProjectSwitcher.tsx | Dropdown de troca de projeto |
| `components/DiffVisualization/` | DiffVisualization.tsx | Visualizacao de diff de codigo |
| `components/GitDiffViewer/` | GitDiffViewer.tsx | Viewer de git diff |
| `components/ExpertBadges/` | ExpertBadges.tsx | Badges de experts |
| `components/ThemeToggle/` | ThemeToggle.tsx | Toggle dark/light mode |
| `components/Tooltip/` | Tooltip.tsx | Componente de tooltip |

### Custom Hooks

| Arquivo | Responsabilidade |
|---------|-----------------|
| `hooks/useAgentExecution.ts` | Execucao de workflows SDLC, streaming |
| `hooks/useChat.ts` | Estado e logica do chat |
| `hooks/useCardWebSocket.ts` | WebSocket para updates de cards |
| `hooks/useExecutionWebSocket.ts` | WebSocket para logs de execucao |
| `hooks/useWorkflowAutomation.ts` | Automacao de transicoes de cards |
| `hooks/useDashboardMetrics.ts` | Fetch e estado de metricas |
| `hooks/useDraft.ts` | Persistencia de drafts em localStorage |
| `hooks/useDiffAnimation.ts` | Animacao de diff stats |
| `hooks/useClickOutside.ts` | Detectar clique fora de elemento |
| `hooks/useTheme.ts` | Dark/light mode |
| `hooks/useToast.ts` | Sistema de notificacoes |
| `hooks/useTooltip.ts` | Logica de tooltips |
| `hooks/useViewPersistence.ts` | Persistir view selecionada |

### Pages

| Arquivo | Rota | Descricao |
|---------|------|-----------|
| `pages/HomePage.tsx` | `/` | Dashboard com metricas |
| `pages/KanbanPage.tsx` | `/kanban` | Board Kanban |
| `pages/ChatPage.tsx` | `/chat` | Chat com AI |
| `pages/SettingsPage.tsx` | `/settings` | Configuracoes |

### Contexts

| Arquivo | Responsabilidade |
|---------|-----------------|
| `contexts/ThemeContext.tsx` | Provider de tema (dark/light) |

### Types

| Arquivo | Types principais |
|---------|-----------------|
| `types/index.ts` | Card, Column, ColumnId, ExecutionStatus, ModelType |
| `types/chat.ts` | ChatMessage, ChatResponse |
| `types/metrics.ts` | ProjectMetrics, ExecutionMetrics, DailyMetrics |

### Utils

| Arquivo | Responsabilidade |
|---------|-----------------|
| `utils/costCalculator.ts` | Calculo de custos de tokens |
| `utils/imageHandler.ts` | Upload e manipulacao de imagens |
| `utils/draftStorage.ts` | Persistencia de drafts |

### Constants

| Arquivo | Responsabilidade |
|---------|-----------------|
| `constants/pricing.ts` | Precos por modelo (Claude, Gemini) |

## Colunas do Kanban

```typescript
type ColumnId = 'backlog' | 'plan' | 'implement' | 'test' | 'review' | 'done' | 'completed' | 'archived' | 'cancelado'
```

### Fluxo SDLC
```
backlog -> plan -> implement -> test -> review -> done -> completed
                                                    |
                                                    v
                                               archived
```

## Padroes de Codigo

### Criando novo Componente

```typescript
// frontend/src/components/NovoComponente/NovoComponente.tsx
import styles from './NovoComponente.module.css'

interface NovoComponenteProps {
  title: string
  onClick?: () => void
}

export function NovoComponente({ title, onClick }: NovoComponenteProps) {
  return (
    <div className={styles.container} onClick={onClick}>
      {title}
    </div>
  )
}
```

```typescript
// frontend/src/components/NovoComponente/index.ts
export { NovoComponente } from './NovoComponente'
```

### Criando novo Hook

```typescript
// frontend/src/hooks/useNovoHook.ts
import { useState, useEffect, useCallback } from 'react'

interface UseNovoHookOptions {
  initialValue?: string
}

interface UseNovoHookReturn {
  value: string
  setValue: (v: string) => void
  reset: () => void
}

export function useNovoHook(options: UseNovoHookOptions = {}): UseNovoHookReturn {
  const [value, setValue] = useState(options.initialValue ?? '')

  const reset = useCallback(() => {
    setValue(options.initialValue ?? '')
  }, [options.initialValue])

  return { value, setValue, reset }
}
```

### API Client Pattern

```typescript
// frontend/src/api/novo.ts
const API_BASE = 'http://localhost:8000/api'

export async function getItems(): Promise<Item[]> {
  const response = await fetch(`${API_BASE}/items`)
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

export async function createItem(data: CreateItemDto): Promise<Item> {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create item')
  return response.json()
}
```

### CSS Module Pattern

```css
/* NovoComponente.module.css */
.container {
  display: flex;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.container:hover {
  background: var(--bg-secondary);
}

/* Dark mode via CSS variables */
```

## CSS Variables (Temas)

```css
:root {
  /* Light theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #60a5fa;
}
```

## Drag and Drop (dnd-kit)

### Setup
```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function Board() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    // Handle card move
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards} strategy={verticalListSortingStrategy}>
        {/* Cards */}
      </SortableContext>
    </DndContext>
  )
}
```

## WebSocket Pattern

```typescript
// Hook para WebSocket
export function useCardWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/cards')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Handle update
    }

    ws.onclose = () => {
      // Reconnect logic
    }

    setSocket(ws)
    return () => ws.close()
  }, [])

  return socket
}
```

## Dependencias

- `react@^18.2.0`
- `react-dom@^18.2.0`
- `@dnd-kit/core@^6.1.0`
- `@dnd-kit/sortable@^8.0.0`
- `@dnd-kit/utilities@^3.2.2`
- `lucide-react@^0.562.0`
- `uuid@^10.0.0`
- `typescript@^5.3.0`
- `vite@^5.0.0`
