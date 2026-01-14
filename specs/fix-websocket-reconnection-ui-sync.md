# Bug Fix: WebSocket Reconectando e Perdendo Atualizações da UI

## 1. Resumo

**Problema:** Quando um card muda de status durante o workflow automático (implement → test → review), a UI não atualiza em tempo real - o usuário precisa dar refresh manual na página para ver o card na nova coluna.

**Causa Raiz:** O hook `useCardWebSocket` reconecta frequentemente durante o workflow porque suas dependências (`onCardMoved`, `onCardUpdated`, `onCardCreated`) mudam a cada atualização de estado. Durante a reconexão, mensagens WebSocket são perdidas. Além disso, mesmo quando as mensagens chegam, o card não é mapeado corretamente (falta `mapCardResponseToCard`).

---

## 2. Objetivos e Escopo

### Objetivos
- [ ] Estabilizar a conexão WebSocket durante o workflow (evitar reconexões desnecessárias)
- [ ] Garantir que o card do WebSocket seja mapeado corretamente antes de atualizar o estado
- [ ] Manter sincronização em tempo real entre múltiplos clientes

### Fora do Escopo
- Mudanças no backend
- Alterações no protocolo WebSocket
- Modificações na lógica do workflow

---

## 3. Análise do Problema

### 3.1 Cadeia de Dependências Problemática

```
workflowStatuses (Map) muda frequentemente durante workflow
        ↓
getWorkflowStatus é recriado (useCallback depende de workflowStatuses)
        ↓
onCardMoved é recriado (useCallback depende de getWorkflowStatus)
        ↓
connect() é recriado em useCardWebSocket (depende de onCardMoved)
        ↓
useEffect reconecta o WebSocket
        ↓
Durante reconexão, mensagens são PERDIDAS
```

### 3.2 Arquivos Envolvidos

| Arquivo | Problema |
|---------|----------|
| `frontend/src/hooks/useCardWebSocket.ts` | `connect` recria WebSocket quando callbacks mudam |
| `frontend/src/hooks/useWorkflowAutomation.ts` | `getWorkflowStatus` tem dependência instável |
| `frontend/src/App.tsx` | `onCardMoved` depende de `getWorkflowStatus` + falta mapeamento |

### 3.3 Evidência nos Logs (console do browser)

Durante o workflow, aparecem múltiplas mensagens:
```
[CardWS] Disconnected
[CardWS] Connecting to cards WebSocket...
[CardWS] Connected successfully
```

---

## 4. Implementação

### Arquivos a Serem Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/hooks/useCardWebSocket.ts` | Modificar | Usar refs para callbacks, evitar reconexões |
| `frontend/src/App.tsx` | Modificar | Exportar e usar `mapCardResponseToCard` no callback |
| `frontend/src/api/cards.ts` | Modificar | Exportar função `mapCardResponseToCard` |

### 4.1 Correção Principal: Estabilizar WebSocket com Refs

**Arquivo:** `frontend/src/hooks/useCardWebSocket.ts`

```typescript
import { useEffect, useRef, useCallback, useState } from 'react';
import { Card, ColumnId } from '../types';

// ... interfaces ...

export function useCardWebSocket({
  onCardMoved,
  onCardUpdated,
  onCardCreated,
  enabled = true
}: UseCardWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // CORREÇÃO: Usar refs para callbacks (não causam reconexão)
  const onCardMovedRef = useRef(onCardMoved);
  const onCardUpdatedRef = useRef(onCardUpdated);
  const onCardCreatedRef = useRef(onCardCreated);

  // Atualizar refs quando callbacks mudam (sem reconectar)
  useEffect(() => {
    onCardMovedRef.current = onCardMoved;
  }, [onCardMoved]);

  useEffect(() => {
    onCardUpdatedRef.current = onCardUpdated;
  }, [onCardUpdated]);

  useEffect(() => {
    onCardCreatedRef.current = onCardCreated;
  }, [onCardCreated]);

  // CORREÇÃO: connect não depende mais dos callbacks
  const connect = useCallback(() => {
    if (!enabled) return;

    console.log('[CardWS] Connecting to cards WebSocket...');
    const ws = new WebSocket(`ws://localhost:3001/api/cards/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log('[CardWS] Connected successfully');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[CardWS] Disconnected');

      if (enabled && reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        reconnectAttemptsRef.current++;

        console.log(`[CardWS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('[CardWS] WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'card_moved':
            console.log(`[CardWS] Card ${message.cardId} moved from ${message.fromColumn} to ${message.toColumn}`);
            // CORREÇÃO: Usar ref ao invés de closure
            onCardMovedRef.current?.(message);
            break;
          case 'card_updated':
            console.log(`[CardWS] Card ${message.cardId} updated`);
            onCardUpdatedRef.current?.(message);
            break;
          case 'card_created':
            console.log(`[CardWS] Card ${message.cardId} created`);
            onCardCreatedRef.current?.(message);
            break;
        }
      } catch (error) {
        console.error('[CardWS] Failed to parse message:', error);
      }
    };

    wsRef.current = ws;
  }, [enabled]); // CORREÇÃO: Apenas 'enabled' como dependência

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, enabled]);

  return { isConnected };
}
```

### 4.2 Exportar Função de Mapeamento

**Arquivo:** `frontend/src/api/cards.ts`

Adicionar `export` na função existente:

```typescript
// Linha ~86 - adicionar export
export function mapCardResponseToCard(response: CardResponse): Card {
  return {
    id: response.id,
    title: response.title,
    description: response.description || '',
    columnId: response.columnId,
    specPath: response.specPath || undefined,
    // ... resto do mapeamento
  };
}
```

### 4.3 Usar Mapeamento no Callback do WebSocket

**Arquivo:** `frontend/src/App.tsx`

```typescript
import { mapCardResponseToCard } from './api/cards';

// No useCardWebSocket (linhas ~104-143)
const { isConnected: cardsWsConnected } = useCardWebSocket({
  enabled: true,

  // CORREÇÃO: Remover dependência de getWorkflowStatus e mapear card
  onCardMoved: useCallback((message: CardMovedMessage) => {
    console.log(`[App] Card moved via WebSocket: ${message.cardId}`);

    // CORREÇÃO: Mapear o card antes de atualizar
    const mappedCard = mapCardResponseToCard(message.card as any);

    setCards(prev => prev.map(card =>
      card.id === message.cardId ? mappedCard : card
    ));
  }, []), // CORREÇÃO: Sem dependências - callback estável

  onCardUpdated: useCallback((message: CardUpdatedMessage) => {
    console.log(`[App] Card updated via WebSocket: ${message.cardId}`);

    const mappedCard = mapCardResponseToCard(message.card as any);

    setCards(prev => prev.map(card =>
      card.id === message.cardId ? mappedCard : card
    ));
  }, []),

  onCardCreated: useCallback((message: CardCreatedMessage) => {
    console.log(`[App] Card created via WebSocket: ${message.cardId}`);

    const mappedCard = mapCardResponseToCard(message.card as any);

    setCards(prev => {
      if (prev.some(card => card.id === message.cardId)) {
        return prev;
      }
      return [...prev, mappedCard];
    });
  }, [])
});
```

---

## 5. Testes

### Validação Manual
- [ ] Iniciar workflow de um card em backlog
- [ ] Verificar que NÃO aparecem logs de reconexão durante o workflow:
  - NÃO deve aparecer: `[CardWS] Disconnected` / `[CardWS] Connecting...`
- [ ] Verificar que cada transição atualiza a UI em tempo real:
  - backlog → plan (card aparece em Plan)
  - plan → implement (card aparece em Implement)
  - implement → test (card aparece em Test)
  - test → review (card aparece em Review)
  - review → done (card aparece em Done)
- [ ] Verificar que NÃO é necessário dar refresh manual

### Teste Multi-Cliente
- [ ] Abrir duas abas do Kanban
- [ ] Mover card manualmente em uma aba
- [ ] Verificar que a outra aba atualiza automaticamente

### Teste de Reconexão
- [ ] Desconectar rede momentaneamente
- [ ] Verificar que WebSocket reconecta automaticamente
- [ ] Verificar que cards continuam sincronizando após reconexão

---

## 6. Considerações

### Riscos
- **Baixo:** Callbacks em refs podem ter valores desatualizados se não forem atualizados corretamente
  - **Mitigação:** useEffect separado para cada ref garante atualização

### Alternativas Consideradas

1. **Remover WebSocket durante workflow:** Rejeitado - perderia sincronização multi-cliente
2. **Polling ao invés de WebSocket:** Rejeitado - menos eficiente e maior latência
3. **Ignorar broadcasts próprios:** Mais complexo, optamos pela solução mais simples primeiro

### Impacto
- **Performance:** Melhora (menos reconexões = menos overhead)
- **UX:** Melhora significativa (UI atualiza em tempo real)
- **Manutenibilidade:** Neutra (código ligeiramente mais complexo, mas mais robusto)

---

## 7. Checklist de Implementação

- [ ] Modificar `useCardWebSocket.ts` para usar refs
- [ ] Exportar `mapCardResponseToCard` em `api/cards.ts`
- [ ] Atualizar callbacks no `App.tsx` para usar mapeamento
- [ ] Testar workflow completo sem refresh
- [ ] Testar sincronização multi-cliente
- [ ] Verificar logs no console (sem reconexões durante workflow)
