# Sistema Autonomo de Experts Integrado ao Kanban

## Resumo

Implementar um sistema autonomo onde agentes experts (peritos em areas especificas do projeto) sao automaticamente:
1. **Identificados** quando um card entra na coluna "plan" (expert-triage)
2. **Consultados** para enriquecer o plano com contexto especializado
3. **Atualizados** quando um card chega em "done" (expert-sync)

## Arquitetura

```
BACKLOG ─────► PLAN ─────────────────────────────────► IMPLEMENT ─► TEST ─► REVIEW ─► DONE
                │                                                                      │
                ▼                                                                      ▼
         ┌─────────────┐                                                       ┌─────────────┐
         │ TRIAGE      │                                                       │ SYNC        │
         │ - Identifica│                                                       │ - Atualiza  │
         │   experts   │                                                       │   KNOWLEDGE │
         │ - Injeta    │                                                       │   dos       │
         │   contexto  │                                                       │   experts   │
         └─────────────┘                                                       └─────────────┘
```

## Itens de Implementacao

### 1. Backend - Model e Migration

- [x] **1.1** Adicionar campo `experts` no model Card (`backend/src/models/card.py`)
- [x] **1.2** Criar migration `012_add_experts_to_cards.sql`
- [x] **1.3** Atualizar schema CardResponse em `backend/src/schemas/card.py`

### 2. Backend - Expert Registry

- [x] **2.1** Criar arquivo de configuracao `backend/src/config/experts.py`

### 3. Backend - Expert Triage Service

- [x] **3.1** Criar service `backend/src/services/expert_triage_service.py`
- [x] **3.2** Criar schemas em `backend/src/schemas/expert.py`

### 4. Backend - Expert Sync Service

- [x] **4.1** Criar service `backend/src/services/expert_sync_service.py`
- [x] **4.2** Adicionar schemas de sync em `backend/src/schemas/expert.py`

### 5. Backend - Endpoints

- [x] **5.1** Criar router `backend/src/routes/experts.py`
- [x] **5.2** Registrar router em `backend/src/main.py`

### 6. Backend - Modificar execute_plan para injetar contexto

- [x] **6.1** Modificar `backend/src/agent.py` funcao `execute_plan`

### 7. Frontend - Types

- [x] **7.1** Adicionar tipos em `frontend/src/types/index.ts`
- [x] **7.2** Adicionar campo experts na interface Card

### 8. Frontend - API Config

- [x] **8.1** Adicionar endpoints em `frontend/src/api/config.ts`

### 9. Frontend - Hook useAgentExecution

- [x] **9.1** Adicionar funcao `executeExpertTriage`
- [x] **9.2** Adicionar funcao `executeExpertSync`

### 10. Frontend - Componente ExpertBadges

- [x] **10.1** Criar componente `frontend/src/components/ExpertBadges/ExpertBadges.tsx`
- [x] **10.2** Criar estilos `frontend/src/components/ExpertBadges/ExpertBadges.module.css`

### 11. Frontend - Integrar badges no Card

- [x] **11.1** Modificar `frontend/src/components/Card/Card.tsx`

### 12. Frontend - Fluxo Autonomo em App.tsx

- [x] **12.1** Modificar handleDragEnd para backlog -> plan
- [x] **12.2** Modificar handleDragEnd para review -> done

### 13. Backend - Card Repository

- [x] **13.1** Adicionar metodo `update_experts` em `backend/src/repositories/card_repository.py`

### 14. Frontend - API cards

- [ ] **14.1** Adicionar funcao `updateExperts` em `frontend/src/api/cards.ts` (nao necessario - triage ja salva)

### 15. Backend - Endpoint para atualizar experts do card

- [x] **15.1** Endpoint ja incluido em `backend/src/routes/experts.py`

## Arquivos Criados/Modificados

### Novos Arquivos
- `backend/migrations/012_add_experts_to_cards.sql`
- `backend/src/config/experts.py`
- `backend/src/schemas/expert.py`
- `backend/src/services/expert_triage_service.py`
- `backend/src/services/expert_sync_service.py`
- `backend/src/routes/experts.py`
- `frontend/src/components/ExpertBadges/ExpertBadges.tsx`
- `frontend/src/components/ExpertBadges/ExpertBadges.module.css`
- `frontend/src/components/ExpertBadges/index.ts`

### Arquivos Modificados
- `backend/src/models/card.py`
- `backend/src/schemas/card.py`
- `backend/src/main.py`
- `backend/src/agent.py`
- `backend/src/execution.py`
- `backend/src/repositories/card_repository.py`
- `frontend/src/types/index.ts`
- `frontend/src/api/config.ts`
- `frontend/src/hooks/useAgentExecution.ts`
- `frontend/src/components/Card/Card.tsx`
- `frontend/src/components/Column/Column.tsx`
- `frontend/src/components/Board/Board.tsx`
- `frontend/src/pages/KanbanPage.tsx`
- `frontend/src/App.tsx`

## Testes

### Testes Unitarios
- [ ] Test expert_triage_service.identify_experts()
- [ ] Test expert_sync_service.sync_experts()
- [ ] Test CardRepository.update_experts()

### Testes de Integracao
- [ ] Test endpoint /api/expert-triage
- [ ] Test endpoint /api/expert-sync
- [ ] Test fluxo completo backlog -> plan com triage

### Testes E2E
- [ ] Test drag card to plan triggers triage + plan
- [ ] Test drag card to done triggers sync
- [ ] Test badges aparecem no card apos triage

## Observacoes

- O triage deve ser rapido (~2-3s) pois e bloqueante antes do plan
- O sync pode rodar em background pois nao bloqueia o usuario
- Experts futuros (frontend, websocket, chat) seguem o mesmo padrao - basta adicionar ao AVAILABLE_EXPERTS
