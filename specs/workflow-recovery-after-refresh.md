# Workflow Recovery After Refresh

## Problema

Quando o usuário dá refresh na página enquanto um card está em execução:
1. ✅ Backend continua executando (correto)
2. ✅ Logs são restaurados via polling (correto)
3. ❌ **Automação do workflow não continua** - o card não move automaticamente para próxima raia

### Causa Raiz

O `useWorkflowAutomation.runWorkflow()` é uma função sequencial que aguarda cada etapa (plan → implement → test → review → done). Quando a página é recarregada:
- O estado (`workflowStage`) é restaurado do banco
- O polling de logs é retomado
- **MAS** a função `runWorkflow()` não está executando
- Portanto, quando a execução termina, não há código monitorando para mover o card

## Solução

Implementar **recuperação automática de workflow** após refresh:

1. Detectar execuções RUNNING que precisam de continuação
2. Monitorar quando finalizam
3. Continuar automaticamente para próxima etapa

## Implementação

### 1. Adicionar lógica de recuperação no `useWorkflowAutomation.ts`

```typescript
// Novo useEffect para recuperar workflows interrompidos
useEffect(() => {
  if (!initialStatuses || initialStatuses.size === 0) return;

  initialStatuses.forEach((status, cardId) => {
    // Se está em estágio ativo (não completed, não error)
    if (['planning', 'implementing', 'testing', 'reviewing'].includes(status.stage)) {
      // Busca o card correspondente
      const card = cards.find(c => c.id === cardId);
      if (card) {
        // Registra que este workflow precisa de recuperação
        recoverWorkflow(cardId, status.stage);
      }
    }
  });
}, [initialStatuses, cards]);
```

### 2. Criar função `recoverWorkflow`

Esta função monitora a execução atual e continua o workflow quando finalizar:

```typescript
const recoverWorkflow = async (cardId: string, currentStage: WorkflowStage) => {
  console.log(`[Workflow Recovery] Recovering workflow for card ${cardId} at stage: ${currentStage}`);

  // Aguarda a execução atual finalizar (polling vai detectar)
  const waitForCompletion = (): Promise<ExecutionState> => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const execution = executions.get(cardId);
        if (execution && execution.status !== 'running') {
          clearInterval(checkInterval);
          resolve(execution);
        }
      }, 2000);
    });
  };

  const execution = await waitForCompletion();

  if (execution.status === 'success') {
    // Continua para próxima etapa baseado no currentStage
    await continueToNextStage(cardId, currentStage);
  } else {
    // Marca como erro e faz rollback
    handleWorkflowError(cardId, currentStage);
  }
};
```

### 3. Criar função `continueToNextStage`

```typescript
const continueToNextStage = async (cardId: string, completedStage: WorkflowStage) => {
  const card = cards.find(c => c.id === cardId);
  if (!card) return;

  switch (completedStage) {
    case 'planning':
      // Completou /plan → executar /implement
      await moveAndExecuteImplement(card);
      break;
    case 'implementing':
      // Completou /implement → executar /test
      await moveAndExecuteTest(card);
      break;
    case 'testing':
      // Completou /test → executar /review
      await moveAndExecuteReview(card);
      break;
    case 'reviewing':
      // Completou /review → mover para done
      await moveToComplete(card);
      break;
  }
};
```

### 4. Modificar `useAgentExecution` para expor callback de completion

Adicionar callback que será chamado quando uma execução finalizar:

```typescript
// Em useAgentExecution
const onExecutionComplete = useRef<Map<string, (execution: ExecutionState) => void>>(new Map());

const registerCompletionCallback = (cardId: string, callback: (execution: ExecutionState) => void) => {
  onExecutionComplete.current.set(cardId, callback);
};

// No polling, quando detectar completion:
if (execution.status !== 'running') {
  const callback = onExecutionComplete.current.get(cardId);
  if (callback) {
    callback(execution);
    onExecutionComplete.current.delete(cardId);
  }
}
```

### 5. Refatorar workflow para usar callbacks

Em vez de aguardar inline, registrar callbacks:

```typescript
const executeAndWaitForCompletion = (
  cardId: string,
  executeFunc: () => Promise<void>
): Promise<ExecutionState> => {
  return new Promise((resolve) => {
    registerCompletionCallback(cardId, resolve);
    executeFunc();
  });
};
```

## Arquivos Modificados

- [x] `frontend/src/hooks/useAgentExecution.ts` ✅
  - Adicionado `completionCallbacksRef` para armazenar callbacks
  - Modificado polling para chamar callback quando execução completa
  - Exportado `registerCompletionCallback` e `unregisterCompletionCallback`

- [x] `frontend/src/hooks/useWorkflowAutomation.ts` ✅
  - Adicionado props `cards`, `registerCompletionCallback`, `executions`
  - Adicionado `recoveringWorkflowsRef` para evitar recuperações duplicadas
  - Implementado `continueWorkflowFromStage()` para continuar workflow após recovery
  - Implementado `useEffect` para detectar e recuperar workflows após refresh

- [x] `frontend/src/App.tsx` ✅
  - Extraído `registerCompletionCallback` e `executions` do useAgentExecution
  - Passado `cards`, `registerCompletionCallback`, `executions` para useWorkflowAutomation

## Fluxo de Recuperação

```
┌─────────────────────────────────────────────────────────────┐
│                    REFRESH DURANTE EXECUÇÃO                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
              App.tsx carrega cards & executions
                              ↓
         useAgentExecution recebe initialExecutions
                              ↓
              Detecta status='running' → inicia polling
                              ↓
        useWorkflowAutomation recebe initialStatuses
                              ↓
    Detecta workflowStage='planning' (ou outro estágio ativo)
                              ↓
              Chama recoverWorkflow(cardId, stage)
                              ↓
            Registra callback de completion
                              ↓
           ┌─── Aguarda execução finalizar ───┐
           │    (polling detecta completion)   │
           └──────────────────────────────────┘
                              ↓
              Callback é chamado com resultado
                              ↓
       Se success → continueToNextStage()
       Se error → handleWorkflowError() + rollback
                              ↓
            Workflow continua automaticamente!
```

## Testes

1. **Teste manual básico:**
   - Iniciar workflow de um card (backlog → plan)
   - Dar refresh enquanto /plan executa
   - Verificar se logs continuam aparecendo
   - Verificar se ao finalizar, card move para in-progress automaticamente

2. **Teste de múltiplos refreshes:**
   - Refresh durante /implement
   - Verificar recuperação e continuação para /test

3. **Teste de erro:**
   - Simular falha durante execução
   - Verificar rollback correto após refresh

4. **Teste de múltiplos cards:**
   - Dois cards em execução simultânea
   - Refresh
   - Ambos devem recuperar e continuar

## Considerações

1. **Evitar execuções duplicadas**: Garantir que ao recuperar, não inicie nova execução se backend ainda está rodando

2. **Timeout**: Adicionar timeout para recovery caso backend tenha crashado

3. **Estado persistente**: Usar `recoveryInProgress` flag para evitar múltiplas tentativas

4. **Cleanup**: Limpar callbacks e intervalos ao desmontar componente
