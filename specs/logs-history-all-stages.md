## 1. Resumo

Implementar sistema de histórico completo de logs que acumule e mantenha todos os logs de todas as etapas executadas (plan, implement, test, review), permitindo visualizar o histórico completo de execução quando o usuário clicar em "Ver Logs" independentemente da etapa atual.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Manter histórico completo de logs de todas as etapas no backend
- [x] Acumular logs de etapas anteriores na visualização
- [x] Permitir visualização completa do histórico através do modal de logs
- [x] Separar visualmente os logs por etapa/comando executado
- [x] Preservar metadata de cada execução (timestamps, duração, status)

### Fora do Escopo
- Alteração da estrutura visual do modal de logs
- Modificação no sistema de polling de logs em tempo real
- Alteração no processo de execução dos comandos

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/models/execution.py` | Modificar | Adicionar flag para indicar histórico completo |
| `backend/src/repositories/execution_repository.py` | Modificar | Adicionar método para buscar histórico completo |
| `backend/src/main.py` | Modificar | Adicionar endpoint para histórico de logs |
| `frontend/src/types/index.ts` | Modificar | Adicionar tipo para execução histórica |
| `frontend/src/api/config.ts` | Modificar | Adicionar endpoint de histórico |
| `frontend/src/hooks/useAgentExecution.ts` | Modificar | Adicionar função para buscar histórico |
| `frontend/src/components/Card/Card.tsx` | Modificar | Usar histórico completo ao abrir logs |
| `frontend/src/components/LogsModal/LogsModal.tsx` | Modificar | Exibir separação por etapa/comando |

### Detalhes Técnicos

#### 1. Backend - Modelo de Dados

No `execution_repository.py`, adicionar método para buscar histórico completo:

```python
async def get_execution_history(self, card_id: str) -> List[dict]:
    """Busca todas as execuções de um card com seus logs"""
    result = await self.db.execute(
        select(Execution)
        .where(Execution.card_id == card_id)
        .order_by(Execution.started_at.desc())
    )
    executions = result.scalars().all()

    history = []
    for execution in executions:
        logs_result = await self.db.execute(
            select(ExecutionLog)
            .where(ExecutionLog.execution_id == execution.id)
            .order_by(ExecutionLog.sequence)
        )
        logs = logs_result.scalars().all()

        history.append({
            "executionId": execution.id,
            "command": execution.command,
            "title": execution.title,
            "status": execution.status.value,
            "workflowStage": execution.workflow_stage,
            "startedAt": execution.started_at.isoformat(),
            "completedAt": execution.completed_at.isoformat() if execution.completed_at else None,
            "logs": [
                {
                    "timestamp": log.timestamp.isoformat(),
                    "type": log.type,
                    "content": log.content
                }
                for log in logs
            ]
        })

    return history
```

#### 2. Backend - Endpoint

Adicionar em `main.py`:

```python
@app.get("/api/logs/{card_id}/history")
async def get_logs_history_endpoint(card_id: str, db: AsyncSession = Depends(get_db)):
    """Get full execution history for a card"""
    repo = ExecutionRepository(db)
    history = await repo.get_execution_history(card_id)

    return {
        "success": True,
        "cardId": card_id,
        "history": history
    }
```

#### 3. Frontend - Tipos

Adicionar em `types/index.ts`:

```typescript
export interface ExecutionHistory {
  executionId: string;
  command: string;
  title: string;
  status: 'idle' | 'running' | 'success' | 'error';
  workflowStage?: string;
  startedAt: string;
  completedAt?: string;
  logs: ExecutionLog[];
}

export interface CardExecutionHistory {
  cardId: string;
  history: ExecutionHistory[];
}
```

#### 4. Frontend - Hook

Modificar `useAgentExecution.ts` para adicionar:

```typescript
const fetchLogsHistory = useCallback(async (cardId: string): Promise<CardExecutionHistory | null> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.logs}/${cardId}/history`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success) {
      return {
        cardId: data.cardId,
        history: data.history
      };
    }
    return null;
  } catch (error) {
    console.error(`[useAgentExecution] Failed to fetch logs history for ${cardId}:`, error);
    return null;
  }
}, []);
```

#### 5. Frontend - Modal de Logs

Modificar `LogsModal.tsx` para:

```typescript
interface LogsModalProps {
  // ... props existentes ...
  history?: ExecutionHistory[]; // Adicionar histórico opcional
}

// No componente, renderizar logs agrupados por comando:
{history && history.length > 0 ? (
  <div className={styles.logGroups}>
    {history.map((execution, execIdx) => (
      <div key={execution.executionId} className={styles.executionGroup}>
        <div className={styles.executionHeader}>
          <span className={styles.command}>{execution.command}</span>
          <span className={styles.executionStatus}>{execution.status}</span>
          {execution.completedAt && (
            <span className={styles.duration}>
              {formatDuration(new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime())}
            </span>
          )}
        </div>
        <div className={styles.executionLogs}>
          {execution.logs.map((log, logIdx) => (
            <div key={logIdx} className={`${styles.logEntry} ${getLogTypeClass(log.type)}`}>
              {/* ... renderizar log ... */}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
) : (
  // Renderização atual para logs simples
)}
```

#### 6. Frontend - Card Component

Modificar `Card.tsx` para buscar histórico ao abrir logs:

```typescript
const handleOpenLogs = async () => {
  // Buscar histórico completo
  const history = await fetchLogsHistory(card.id);

  // Passar para o modal
  setLogsHistory(history);
  setIsLogsOpen(true);
};
```

---

## 4. Testes

### Unitários
- [x] Teste do método `get_execution_history` no repositório
- [x] Teste do endpoint `/api/logs/{card_id}/history`
- [x] Teste da função `fetchLogsHistory` no hook

### Integração
- [x] Verificar que logs de múltiplas etapas são exibidos corretamente
- [x] Confirmar separação visual entre diferentes comandos
- [x] Testar com cards que têm apenas uma execução
- [x] Testar com cards que têm múltiplas execuções de workflow

---

## 5. Considerações

- **Performance:** Para cards com muitas execuções, considerar paginação ou limite de histórico
- **Cache:** O histórico completo não deve ser cacheado enquanto houver execuções em andamento
- **UX:** Adicionar indicadores visuais claros para separar diferentes etapas do workflow
- **Retrocompatibilidade:** Manter suporte para visualização de logs únicos (não-histórico)