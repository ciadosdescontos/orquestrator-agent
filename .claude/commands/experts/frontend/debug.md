---
description: Debug de problemas de frontend (renderizacao, performance, WebSocket)
allowed-tools: Read, Glob, Grep, Bash
---

# Debug: Frontend Expert

## Proposito

Investigar e resolver problemas de frontend: erros de renderizacao, performance, WebSocket, etc.

## Tipos de Problemas

### 1. Erros de Renderizacao

**Sintomas:**
- Componente nao renderiza
- Props undefined/null
- "Cannot read property of undefined"

**Investigar:**
```
frontend/src/components/*/
frontend/src/hooks/
```

**Checklist:**
- [ ] Props estao sendo passadas corretamente?
- [ ] Estado inicial e valido?
- [ ] Conditional rendering correto?
- [ ] Key prop em listas?

### 2. Problemas de Estado

**Sintomas:**
- Estado nao atualiza
- Re-renders excessivos
- Estado stale em callbacks

**Investigar:**
```
frontend/src/hooks/
frontend/src/contexts/
```

**Checklist:**
- [ ] useCallback com dependencias corretas?
- [ ] useMemo onde necessario?
- [ ] useEffect com cleanup?
- [ ] Estado derivado desnecessario?

### 3. Problemas de WebSocket

**Sintomas:**
- Desconexoes frequentes
- Mensagens nao chegando
- Updates nao aparecendo

**Investigar:**
```
frontend/src/hooks/useCardWebSocket.ts
frontend/src/hooks/useExecutionWebSocket.ts
```

**Checklist:**
- [ ] Conexao estabelecida?
- [ ] Reconexao automatica?
- [ ] Parsing de mensagens correto?
- [ ] Cleanup no unmount?

### 4. Problemas de Performance

**Sintomas:**
- UI lenta/travando
- Re-renders excessivos
- Memoria crescendo

**Investigar:**
```
frontend/src/components/Board/Board.tsx
frontend/src/hooks/useWorkflowAutomation.ts
```

**Checklist:**
- [ ] React.memo onde necessario?
- [ ] useCallback em funcoes passadas como prop?
- [ ] useMemo em computacoes caras?
- [ ] Listas virtualizadas?

### 5. Problemas de Drag and Drop

**Sintomas:**
- Drag nao funciona
- Drop em lugar errado
- Cards nao movem

**Investigar:**
```
frontend/src/components/Board/Board.tsx
frontend/src/components/Column/Column.tsx
frontend/src/components/Card/Card.tsx
```

**Checklist:**
- [ ] DndContext configurado?
- [ ] SortableContext com items corretos?
- [ ] useSortable no Card?
- [ ] onDragEnd handler correto?

### 6. Problemas de API

**Sintomas:**
- Requests falhando
- Dados nao carregando
- Erros de CORS

**Investigar:**
```
frontend/src/api/
frontend/src/api/config.ts
```

**Checklist:**
- [ ] URL base correta?
- [ ] Headers corretos?
- [ ] Error handling?
- [ ] Backend rodando?

## Processo de Debug

1. **Identifique o sintoma** exato
2. **Localize arquivos** relevantes
3. **Leia o codigo** para entender fluxo
4. **Verifique console** do browser (se possivel)
5. **Trace o fluxo** de dados
6. **Proponha fix** baseado na analise

## Ferramentas Uteis

### Verificar imports/exports
```bash
grep -r "export" frontend/src/components/NomeComponente/
```

### Verificar uso de hook
```bash
grep -r "useNomeHook" frontend/src/
```

### Verificar chamadas de API
```bash
grep -r "fetch\|axios" frontend/src/api/
```

## Solicitacao

$ARGUMENTS
