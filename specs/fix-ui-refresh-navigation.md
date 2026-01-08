# Fix UI Refresh e Navegação do Kanban

## 1. Resumo

Corrigir problemas de sincronização de UI que exigem refresh manual após criar/executar cards, e ajustar a navegação para manter o usuário na tela do Kanban ao fazer F5. O sistema atualmente usa `window.location.reload()` após criar cards e não persiste a view atual, causando uma experiência ruim para o usuário.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Eliminar necessidade de refresh manual após criar/executar cards
- [x] Manter usuário na tela do Kanban ao fazer F5
- [x] Implementar atualização reativa de UI sem recarregar página
- [x] Melhorar sincronização de estado entre componentes

### Fora do Escopo
- Refatoração completa para Redux/Context API (será feito em outra fase)
- Migração de polling para WebSocket (futura melhoria)
- Implementação de React Router completo

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/AddCard/AddCard.tsx` | Modificar | Remover `window.location.reload()` e implementar atualização reativa |
| `frontend/src/App.tsx` | Modificar | Adicionar persistência de view e callback para novo card |
| `frontend/src/hooks/useViewPersistence.ts` | Criar | Hook para persistir/recuperar view atual |
| `frontend/src/pages/KanbanPage.tsx` | Modificar | Adicionar refresh automático após execução |
| `frontend/src/hooks/useAgentExecution.ts` | Modificar | Adicionar callback para atualizar cards após execução |

### Detalhes Técnicos

#### 1. **Remover window.reload() do AddCard**

```typescript
// frontend/src/components/AddCard/AddCard.tsx
// ANTES (linha ~56):
window.location.reload();

// DEPOIS:
// Adicionar callback prop
interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated?: (newCard: Card) => void; // Nova prop
}

// No handleSubmit:
const handleSubmit = async () => {
  try {
    // ... código existente de criação ...

    const newCard = await cardsApi.createCard({
      title,
      description,
      column_id: 'backlog',
      model_plan: selectedModels.plan,
      // ... outros campos
    });

    // Upload de imagens se houver
    if (imageFiles.length > 0) {
      await Promise.all(
        imageFiles.map(file =>
          cardsApi.uploadCardImage(newCard.id, file)
        )
      );
      // Buscar card atualizado com imagens
      const updatedCard = await cardsApi.fetchCard(newCard.id);
      onCardCreated?.(updatedCard);
    } else {
      onCardCreated?.(newCard);
    }

    onClose();
  } catch (error) {
    console.error('Erro ao criar card:', error);
  }
};
```

#### 2. **Adicionar Callback no App.tsx**

```typescript
// frontend/src/App.tsx
// Adicionar função para refresh de cards
const refreshCards = async () => {
  try {
    const updatedCards = await cardsApi.fetchCards();
    setCards(updatedCards);
  } catch (error) {
    console.error('Erro ao atualizar cards:', error);
  }
};

// Callback para novo card
const handleCardCreated = async (newCard: Card) => {
  // Opção 1: Adicionar diretamente (mais rápido)
  setCards(prev => [...prev, newCard]);

  // Opção 2: Refetch completo (mais seguro)
  // await refreshCards();
};

// Passar callback para AddCardModal
<AddCardModal
  isOpen={isAddCardModalOpen}
  onClose={() => setIsAddCardModalOpen(false)}
  onCardCreated={handleCardCreated}
/>
```

#### 3. **Hook de Persistência de View**

```typescript
// frontend/src/hooks/useViewPersistence.ts
import { useEffect, useCallback } from 'react';
import { ModuleType } from '../types';

const VIEW_STORAGE_KEY = 'kanban_current_view';
const DEFAULT_VIEW: ModuleType = 'dashboard';

export const useViewPersistence = () => {
  // Recuperar view salva
  const getSavedView = useCallback((): ModuleType => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved && ['dashboard', 'kanban', 'chat', 'settings'].includes(saved)) {
        return saved as ModuleType;
      }
    } catch (error) {
      console.error('Erro ao recuperar view:', error);
    }
    return DEFAULT_VIEW;
  }, []);

  // Salvar view atual
  const saveView = useCallback((view: ModuleType) => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch (error) {
      console.error('Erro ao salvar view:', error);
    }
  }, []);

  // Limpar view salva (opcional)
  const clearSavedView = useCallback(() => {
    try {
      localStorage.removeItem(VIEW_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar view:', error);
    }
  }, []);

  return {
    getSavedView,
    saveView,
    clearSavedView,
  };
};
```

#### 4. **Integrar Persistência no App.tsx**

```typescript
// frontend/src/App.tsx
import { useViewPersistence } from './hooks/useViewPersistence';

function App() {
  const { getSavedView, saveView } = useViewPersistence();

  // Inicializar com view salva
  const [currentView, setCurrentView] = useState<ModuleType>(() => {
    return getSavedView();
  });

  // Salvar view quando mudar
  const handleNavigate = (module: ModuleType) => {
    setCurrentView(module);
    saveView(module);
  };

  // Atualizar WorkspaceLayout para usar handleNavigate
  <WorkspaceLayout
    currentModule={currentView}
    onNavigate={handleNavigate}
    projectSelector={/* ... */}
  >
    {renderView()}
  </WorkspaceLayout>
}
```

#### 5. **Atualização Automática após Execução**

```typescript
// frontend/src/hooks/useAgentExecution.ts
// Adicionar refresh de cards quando execução completar

// Adicionar prop opcional
interface UseAgentExecutionProps {
  initialExecutions?: Map<string, ExecutionStatus>;
  onExecutionComplete?: (cardId: string, status: ExecutionStatus) => void;
}

export const useAgentExecution = ({
  initialExecutions,
  onExecutionComplete
}: UseAgentExecutionProps = {}) => {
  // ... código existente ...

  // No callback de completion (linha ~180):
  if (execution.status !== 'running' && execution.status !== 'pending') {
    stopPolling(cardId);

    // Notificar completion
    onExecutionComplete?.(cardId, execution);

    // ... resto do código de callback ...
  }
};

// No App.tsx:
const handleExecutionComplete = async (cardId: string, status: ExecutionStatus) => {
  // Refetch card específico ou todos
  if (status.status === 'completed') {
    const updatedCard = await cardsApi.fetchCard(cardId);
    setCards(prev => prev.map(card =>
      card.id === cardId ? updatedCard : card
    ));
  }
};

const { executeAgent, /* ... */ } = useAgentExecution({
  initialExecutions,
  onExecutionComplete: handleExecutionComplete,
});
```

#### 6. **Melhorar Polling de Token Stats**

```typescript
// frontend/src/App.tsx
// Otimizar polling para não recriar interval desnecessariamente

useEffect(() => {
  if (!hasActiveExecutions) return;

  const pollTokenStats = async () => {
    try {
      const updatedCards = await cardsApi.fetchCards();

      setCards(prev => {
        // Só atualizar se houver mudanças reais
        const hasChanges = prev.some(card => {
          const updated = updatedCards.find(c => c.id === card.id);
          if (!updated) return false;

          return (
            JSON.stringify(card.tokenStats) !== JSON.stringify(updated.tokenStats) ||
            JSON.stringify(card.activeExecution) !== JSON.stringify(updated.activeExecution)
          );
        });

        if (!hasChanges) return prev;

        return prev.map(card => {
          const updated = updatedCards.find(c => c.id === card.id);
          return updated ? {
            ...card,
            tokenStats: updated.tokenStats,
            activeExecution: updated.activeExecution,
            diffStats: updated.diffStats,
          } : card;
        });
      });
    } catch (error) {
      console.error('Erro no polling de token stats:', error);
    }
  };

  // Primeira execução imediata
  pollTokenStats();

  const interval = setInterval(pollTokenStats, 2000);
  return () => clearInterval(interval);
}, [hasActiveExecutions]); // Dependência mais estável
```

#### 7. **Fix Merge Status Polling Dependency**

```typescript
// frontend/src/App.tsx
// Usar ref para evitar recrear interval

const mergingCardsRef = useRef<Card[]>([]);

useEffect(() => {
  // Atualizar ref
  mergingCardsRef.current = cards.filter(c =>
    c.mergeStatus === 'resolving' || c.mergeStatus === 'merging'
  );

  if (mergingCardsRef.current.length === 0) return;

  const pollMergeStatus = async () => {
    try {
      const updatedCards = await cardsApi.fetchCards();
      const currentMergingCards = mergingCardsRef.current;

      for (const oldCard of currentMergingCards) {
        const updatedCard = updatedCards.find(c => c.id === oldCard.id);

        if (!updatedCard) continue;

        if (updatedCard.mergeStatus === 'merged') {
          // Merge bem-sucedido
          await cardsApi.moveCard(updatedCard.id, 'done');
          setCards(prev => prev.map(c =>
            c.id === updatedCard.id
              ? { ...updatedCard, columnId: 'done' }
              : c
          ));
        } else if (updatedCard.mergeStatus === 'failed') {
          // Merge falhou
          setCards(prev => prev.map(c =>
            c.id === updatedCard.id ? updatedCard : c
          ));
        }
      }
    } catch (error) {
      console.error('Erro no polling de merge status:', error);
    }
  };

  const interval = setInterval(pollMergeStatus, 5000);
  return () => clearInterval(interval);
}, [cards.filter(c => c.mergeStatus === 'resolving').length]); // Dependência mais específica
```

---

## 4. Testes

### Unitários
- [x] Teste useViewPersistence hook (save/load/clear)
- [x] Teste callback onCardCreated no AddCard
- [x] Teste handleExecutionComplete no App
- [x] Teste otimização de polling (não atualizar se não houver mudanças)

### Integração
- [x] Criar card e verificar aparição imediata sem reload
- [x] Executar card e verificar atualização automática de status
- [x] Fazer F5 na tela Kanban e verificar permanência
- [x] Testar múltiplas execuções simultâneas
- [x] Verificar que polling para quando não há execuções ativas

### E2E (Manual)
- [x] Fluxo completo: criar → executar → verificar UI atualizada
- [x] Navegar entre views e fazer F5 em cada uma
- [x] Criar múltiplos cards rapidamente
- [x] Executar workflow completo e verificar todas as transições

---

## 5. Considerações

### Riscos
- **Performance:** Múltiplos pollings podem impactar performance
  - **Mitigação:** Implementar debounce e comparação inteligente de estado

- **Race Conditions:** Atualizações concorrentes podem causar inconsistências
  - **Mitigação:** Usar timestamps ou versioning nos cards

- **LocalStorage:** Pode não estar disponível em alguns browsers
  - **Mitigação:** Fallback para sessionStorage ou memória

### Dependências
- Nenhuma nova biblioteca necessária
- Compatível com estrutura atual de hooks

### Próximos Passos (Futuro)
1. Migrar para Context API para estado global
2. Implementar WebSocket para atualizações real-time
3. Adicionar React Router para navegação com URLs
4. Implementar cache e otimistic updates
5. Adicionar indicadores visuais de loading/updating