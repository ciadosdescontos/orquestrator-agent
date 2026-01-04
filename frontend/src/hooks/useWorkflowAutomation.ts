import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, ColumnId, WorkflowStatus, WorkflowStage, ExecutionStatus } from '../types';
import * as cardsApi from '../api/cards';
import { updateWorkflowState } from '../api/cards';
import { API_ENDPOINTS } from '../api/config';

interface UseWorkflowAutomationProps {
  executePlan: (card: Card) => Promise<{ success: boolean; specPath?: string; error?: string }>;
  executeImplement: (card: Card) => Promise<{ success: boolean; error?: string }>;
  executeTest: (card: Card) => Promise<{ success: boolean; error?: string }>;
  executeReview: (card: Card) => Promise<{ success: boolean; error?: string }>;
  onCardMove: (cardId: string, columnId: ColumnId) => void;
  onSpecPathUpdate: (cardId: string, specPath: string) => void;
  initialStatuses?: Map<string, WorkflowStatus>; // Para restaurar estados
  cards: Card[]; // Para buscar card por id durante recuperação
  registerCompletionCallback: (cardId: string, callback: (execution: ExecutionStatus) => void) => void;
  executions: Map<string, ExecutionStatus>; // Para verificar status atual
}

export function useWorkflowAutomation({
  executePlan,
  executeImplement,
  executeTest,
  executeReview,
  onCardMove,
  onSpecPathUpdate,
  initialStatuses,
  cards,
  registerCompletionCallback,
  executions,
}: UseWorkflowAutomationProps) {
  // Sempre iniciar com Map vazio - sync será feito via useEffect
  const [workflowStatuses, setWorkflowStatuses] = useState<Map<string, WorkflowStatus>>(
    new Map()
  );
  // Track which workflows are being recovered to avoid duplicates
  const recoveringWorkflowsRef = useRef<Set<string>>(new Set());
  // Track if recovery was already processed to avoid duplicates on re-renders
  const recoveryProcessedRef = useRef(false);

  // Sync workflowStatuses when initialStatuses becomes available
  useEffect(() => {
    if (initialStatuses && initialStatuses.size > 0 && !recoveryProcessedRef.current) {
      console.log(`[WorkflowAutomation] Syncing ${initialStatuses.size} initial statuses`);
      setWorkflowStatuses(new Map(initialStatuses));
    }
  }, [initialStatuses]);

  const runWorkflow = useCallback(async (card: Card) => {
    // Validar que o card está em backlog
    if (card.columnId !== 'backlog') {
      console.warn('Workflow só pode ser iniciado de cards em backlog');
      return;
    }

    const updateStatus = async (stage: WorkflowStage, currentColumn: ColumnId, error?: string) => {
      setWorkflowStatuses(prev => {
        const next = new Map(prev);
        next.set(card.id, { cardId: card.id, stage, currentColumn, error });
        return next;
      });

      // Persistir no backend
      try {
        await updateWorkflowState(card.id, { stage, error });
      } catch (err) {
        console.error('[WorkflowAutomation] Failed to persist workflow state:', err);
      }
    };

    try {
      // Etapa 1: Plan (backlog → plan)
      await cardsApi.moveCard(card.id, 'plan');
      onCardMove(card.id, 'plan');
      await updateStatus('planning', 'plan');

      const planResult = await executePlan(card);
      if (!planResult.success) {
        // Rollback: voltar para backlog
        await cardsApi.moveCard(card.id, 'backlog');
        onCardMove(card.id, 'backlog');
        await updateStatus('error', 'backlog', planResult.error);
        return;
      }

      // Persistir specPath
      if (planResult.specPath) {
        await cardsApi.updateSpecPath(card.id, planResult.specPath);
        onSpecPathUpdate(card.id, planResult.specPath);
        card.specPath = planResult.specPath;
      }

      // Etapa 2: Implement (plan → implement)
      await cardsApi.moveCard(card.id, 'implement');
      onCardMove(card.id, 'implement');
      await updateStatus('implementing', 'implement');

      const implementResult = await executeImplement(card);
      if (!implementResult.success) {
        // Rollback: voltar para plan
        await cardsApi.moveCard(card.id, 'plan');
        onCardMove(card.id, 'plan');
        await updateStatus('error', 'plan', implementResult.error);
        return;
      }

      // Etapa 3: Test (implement → test)
      await cardsApi.moveCard(card.id, 'test');
      onCardMove(card.id, 'test');
      await updateStatus('testing', 'test');

      const testResult = await executeTest(card);
      if (!testResult.success) {
        // Rollback: voltar para implement
        await cardsApi.moveCard(card.id, 'implement');
        onCardMove(card.id, 'implement');
        await updateStatus('error', 'implement', testResult.error);
        return;
      }

      // Etapa 4: Review (test → review)
      await cardsApi.moveCard(card.id, 'review');
      onCardMove(card.id, 'review');
      await updateStatus('reviewing', 'review');

      const reviewResult = await executeReview(card);
      if (!reviewResult.success) {
        // Rollback: voltar para test
        await cardsApi.moveCard(card.id, 'test');
        onCardMove(card.id, 'test');
        await updateStatus('error', 'test', reviewResult.error);
        return;
      }

      // Tentar fazer merge antes de mover para done
      const mergeResult = await handleCompletedReview(card.id);

      if (mergeResult.success || !card.branchName) {
        // Merge bem-sucedido ou card nao tem branch
        await cardsApi.moveCard(card.id, 'done');
        onCardMove(card.id, 'done');
        await updateStatus('completed', 'done');
      } else if (mergeResult.status === 'resolving') {
        // IA esta resolvendo conflitos - manter em review
        // O card sera movido para done automaticamente quando merge completar
        await updateStatus('reviewing', 'review');
      } else {
        // Merge falhou
        await updateStatus('error', 'review', mergeResult.error || 'Merge failed');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await updateStatus('error', card.columnId, errorMsg);
      console.error('[useWorkflowAutomation] Workflow failed:', errorMsg);
    }
  }, [executePlan, executeImplement, executeTest, executeReview, onCardMove, onSpecPathUpdate]);

  const getWorkflowStatus = useCallback((cardId: string) => {
    return workflowStatuses.get(cardId);
  }, [workflowStatuses]);

  const clearWorkflowStatus = useCallback((cardId: string) => {
    setWorkflowStatuses(prev => {
      const next = new Map(prev);
      next.delete(cardId);
      return next;
    });
    recoveringWorkflowsRef.current.delete(cardId);
  }, []);

  // Continue workflow from a specific stage after recovery
  const continueWorkflowFromStage = useCallback(async (card: Card, completedStage: WorkflowStage, executionStatus: 'success' | 'error') => {
    console.log(`[WorkflowRecovery] Continuing workflow for card ${card.id} from stage: ${completedStage}, status: ${executionStatus}`);

    const updateStatus = async (stage: WorkflowStage, currentColumn: ColumnId, error?: string) => {
      setWorkflowStatuses(prev => {
        const next = new Map(prev);
        next.set(card.id, { cardId: card.id, stage, currentColumn, error });
        return next;
      });
      try {
        await updateWorkflowState(card.id, { stage, error });
      } catch (err) {
        console.error('[WorkflowRecovery] Failed to persist workflow state:', err);
      }
    };

    // If the current stage failed, handle rollback
    if (executionStatus === 'error') {
      const rollbackColumn = getRollbackColumn(completedStage);
      await cardsApi.moveCard(card.id, rollbackColumn);
      onCardMove(card.id, rollbackColumn);
      await updateStatus('error', rollbackColumn, 'Execution failed');
      recoveringWorkflowsRef.current.delete(card.id);
      return;
    }

    try {
      // Current stage succeeded, move to next stage
      switch (completedStage) {
        case 'planning': {
          // Planning completed → execute implement
          await cardsApi.moveCard(card.id, 'implement');
          onCardMove(card.id, 'implement');
          await updateStatus('implementing', 'implement');

          const implementResult = await executeImplement(card);
          if (!implementResult.success) {
            await cardsApi.moveCard(card.id, 'plan');
            onCardMove(card.id, 'plan');
            await updateStatus('error', 'plan', implementResult.error);
            break;
          }

          // Continue to test stage
          await cardsApi.moveCard(card.id, 'test');
          onCardMove(card.id, 'test');
          await updateStatus('testing', 'test');

          const testResult = await executeTest(card);
          if (!testResult.success) {
            await cardsApi.moveCard(card.id, 'implement');
            onCardMove(card.id, 'implement');
            await updateStatus('error', 'implement', testResult.error);
            break;
          }

          // Continue to review stage
          await cardsApi.moveCard(card.id, 'review');
          onCardMove(card.id, 'review');
          await updateStatus('reviewing', 'review');

          const reviewResult = await executeReview(card);
          if (!reviewResult.success) {
            await cardsApi.moveCard(card.id, 'test');
            onCardMove(card.id, 'test');
            await updateStatus('error', 'test', reviewResult.error);
            break;
          }

          // Complete workflow
          await cardsApi.moveCard(card.id, 'done');
          onCardMove(card.id, 'done');
          await updateStatus('completed', 'done');
          break;
        }

        case 'implementing': {
          // Implement completed → execute test
          await cardsApi.moveCard(card.id, 'test');
          onCardMove(card.id, 'test');
          await updateStatus('testing', 'test');

          const testResult = await executeTest(card);
          if (!testResult.success) {
            await cardsApi.moveCard(card.id, 'implement');
            onCardMove(card.id, 'implement');
            await updateStatus('error', 'implement', testResult.error);
            break;
          }

          // Continue to review stage
          await cardsApi.moveCard(card.id, 'review');
          onCardMove(card.id, 'review');
          await updateStatus('reviewing', 'review');

          const reviewResult = await executeReview(card);
          if (!reviewResult.success) {
            await cardsApi.moveCard(card.id, 'test');
            onCardMove(card.id, 'test');
            await updateStatus('error', 'test', reviewResult.error);
            break;
          }

          // Complete workflow
          await cardsApi.moveCard(card.id, 'done');
          onCardMove(card.id, 'done');
          await updateStatus('completed', 'done');
          break;
        }

        case 'testing': {
          // Test completed → execute review
          await cardsApi.moveCard(card.id, 'review');
          onCardMove(card.id, 'review');
          await updateStatus('reviewing', 'review');

          const reviewResult = await executeReview(card);
          if (!reviewResult.success) {
            await cardsApi.moveCard(card.id, 'test');
            onCardMove(card.id, 'test');
            await updateStatus('error', 'test', reviewResult.error);
            break;
          }

          // Complete workflow
          await cardsApi.moveCard(card.id, 'done');
          onCardMove(card.id, 'done');
          await updateStatus('completed', 'done');
          break;
        }

        case 'reviewing': {
          // Review completed → move to done
          await cardsApi.moveCard(card.id, 'done');
          onCardMove(card.id, 'done');
          await updateStatus('completed', 'done');
          break;
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await updateStatus('error', card.columnId, errorMsg);
      console.error('[WorkflowRecovery] Recovery failed:', errorMsg);
    }

    recoveringWorkflowsRef.current.delete(card.id);
  }, [executeImplement, executeTest, executeReview, onCardMove]);

  // Helper to get rollback column for a stage
  const getRollbackColumn = (stage: WorkflowStage): ColumnId => {
    switch (stage) {
      case 'planning': return 'backlog';
      case 'implementing': return 'plan';
      case 'testing': return 'implement';
      case 'reviewing': return 'test';
      default: return 'backlog';
    }
  };

  // Recover workflows that were running when page refreshed
  useEffect(() => {
    if (!initialStatuses || initialStatuses.size === 0) return;
    if (cards.length === 0) return;
    // Wait for executions to be populated before processing recovery
    if (executions.size === 0) {
      console.log(`[WorkflowRecovery] Waiting for executions to be populated...`);
      return;
    }

    // Only run recovery once to prevent duplicates
    if (recoveryProcessedRef.current) return;
    recoveryProcessedRef.current = true;

    console.log(`[WorkflowRecovery] Starting recovery with ${initialStatuses.size} statuses, ${executions.size} executions`);

    const activeStages: WorkflowStage[] = ['planning', 'implementing', 'testing', 'reviewing'];

    initialStatuses.forEach((status, cardId) => {
      // Only recover if in an active stage (not completed or error)
      if (!activeStages.includes(status.stage)) return;

      // Don't recover if already recovering
      if (recoveringWorkflowsRef.current.has(cardId)) return;

      // Find the card
      const card = cards.find(c => c.id === cardId);
      if (!card) return;

      // Check if execution exists
      const execution = executions.get(cardId);

      if (!execution) {
        // No execution found - workflow state is stale, just log and skip
        console.log(`[WorkflowRecovery] No execution found for card ${cardId}, skipping recovery`);
        return;
      }

      if (execution.status === 'running') {
        // Execution is still running - register callback for when it completes
        console.log(`[WorkflowRecovery] Registering recovery callback for card ${cardId} at stage: ${status.stage}`);
        recoveringWorkflowsRef.current.add(cardId);

        registerCompletionCallback(cardId, (completedExecution) => {
          console.log(`[WorkflowRecovery] Execution completed for card ${cardId}, status: ${completedExecution.status}`);
          const executionStatus = completedExecution.status === 'success' ? 'success' : 'error';

          // Re-fetch card to get latest state (specPath might have been updated)
          cardsApi.fetchCards().then(latestCards => {
            const latestCard = latestCards.find(c => c.id === cardId);
            if (latestCard) {
              continueWorkflowFromStage(latestCard, status.stage, executionStatus);
            } else {
              continueWorkflowFromStage(card, status.stage, executionStatus);
            }
          }).catch(() => {
            continueWorkflowFromStage(card, status.stage, executionStatus);
          });
        });
      } else {
        // Execution already completed BEFORE refresh
        // DON'T automatically continue - user refreshed after execution finished
        // The card is already in the correct position, just update workflow status if needed
        console.log(`[WorkflowRecovery] Execution already ${execution.status} for card ${cardId}, NOT continuing automatically`);

        if (execution.status === 'error') {
          // Update workflow status to reflect error state
          setWorkflowStatuses(prev => {
            const next = new Map(prev);
            next.set(cardId, {
              ...status,
              stage: 'error',
              error: 'Execution failed before refresh'
            });
            return next;
          });
        }
        // If success, leave the card where it is - don't move it automatically
        // The user can manually continue or the workflow was already completed
      }
    });
  }, [initialStatuses, cards, executions, registerCompletionCallback, continueWorkflowFromStage]);

  /**
   * Tenta fazer merge quando card completa REVIEW.
   * Card permanece em REVIEW com sub-estado de merge.
   */
  const handleCompletedReview = useCallback(async (cardId: string): Promise<{
    success: boolean;
    status?: string;
    hasConflicts?: boolean;
    error?: string;
  }> => {
    try {
      // Iniciar merge
      const response = await fetch(`${API_ENDPOINTS.cards}/${cardId}/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.detail || 'Merge failed' };
      }

      if (data.status === 'resolving') {
        // IA esta resolvendo conflitos
        return { success: false, status: 'resolving', hasConflicts: true };
      }

      if (data.status === 'merged') {
        return { success: true, status: 'merged' };
      }

      return { success: false, error: data.error || 'Unknown merge error' };

    } catch (error) {
      console.error('Failed to merge card:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  return {
    runWorkflow,
    getWorkflowStatus,
    clearWorkflowStatus,
    handleCompletedReview,
  };
}
