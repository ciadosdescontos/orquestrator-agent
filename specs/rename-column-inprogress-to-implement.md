# Renomear Coluna In Progress para Implement

## 1. Resumo

Renomear a coluna "in-progress" para "implement" em toda a aplicação, mantendo a consistência entre frontend e backend. Esta mudança visa alinhar melhor o nome da coluna com sua função no workflow SDLC.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Renomear o identificador da coluna de "in-progress" para "implement"
- [x] Atualizar o título visual da coluna de "In Progress" para "Implement"
- [x] Garantir que todas as referências e transições sejam atualizadas
- [x] Manter compatibilidade com cards existentes no banco de dados

### Fora do Escopo
- Mudanças na lógica de transição entre colunas
- Alterações em outras colunas do kanban
- Mudanças no comportamento de automação

---

## 3. Implementação

### Arquivos a Serem Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/types/index.ts` | Modificar | Atualizar ColumnId type e COLUMNS array |
| `frontend/src/hooks/useWorkflowAutomation.ts` | Modificar | Atualizar todas as referências de 'in-progress' |
| `frontend/src/App.tsx` | Modificar | Atualizar lógica de transição e mensagens |
| `frontend/src/components/Column/Column.module.css` | Modificar | Renomear classe CSS column_in-progress |
| `backend/src/schemas/card.py` | Modificar | Atualizar ColumnId literal |
| `backend/src/repositories/card_repository.py` | Modificar | Atualizar ALLOWED_TRANSITIONS |
| `backend/src/models/card.py` | Verificar | Confirmar se precisa migração de dados |

### Detalhes Técnicos

#### 1. Frontend - Types (`frontend/src/types/index.ts`)

```typescript
// Linha 1
export type ColumnId = 'backlog' | 'plan' | 'implement' | 'test' | 'review' | 'done' | 'archived' | 'cancelado';

// Linha 64
{ id: 'implement', title: 'Implement' },

// Linhas 75-76 - Atualizar transições
'plan': ['implement', 'cancelado'],
'implement': ['test', 'cancelado'],
```

#### 2. Frontend - Workflow Hook (`frontend/src/hooks/useWorkflowAutomation.ts`)

Substituir todas as ocorrências de `'in-progress'` por `'implement'`:
- Linha 82-84: moveCard para 'implement'
- Linha 103-105: Rollback para 'implement'
- Linha 180-181: moveCard para 'implement'
- Linha 199-201: Rollback para 'implement'
- Linha 233-235: Rollback para 'implement'
- Linha 302: getRollbackColumn case

#### 3. Frontend - App Component (`frontend/src/App.tsx`)

```typescript
// Linha 272 - Atualizar mensagem
alert(`Transição inválida: ${startColumn} → ${finalColumnId}.\nSiga o fluxo SDLC: backlog → plan → implement → test → review → done`);

// Linha 297
} else if (startColumn === 'plan' && finalColumnId === 'implement') {

// Linha 301
console.log(`[App] Card moved from plan to implement: ${updatedCard.title}`);

// Linha 308
} else if (startColumn === 'implement' && finalColumnId === 'test') {

// Linha 312
console.log(`[App] Card moved from implement to test: ${updatedCard.title}`);
```

#### 4. Frontend - CSS (`frontend/src/components/Column/Column.module.css`)

```css
/* Renomear classe */
.column_implement {
  /* manter os mesmos estilos que column_in-progress */
}
```

#### 5. Backend - Schemas (`backend/src/schemas/card.py`)

```python
# Linha 9
ColumnId = Literal["backlog", "plan", "implement", "test", "review", "done", "archived", "cancelado"]
```

#### 6. Backend - Repository (`backend/src/repositories/card_repository.py`)

```python
# Linhas 16-17
"plan": ["implement", "cancelado"],
"implement": ["test", "cancelado"],
```

---

## 4. Testes

### Unitários
- [x] Testar que transição plan → implement é válida
- [x] Testar que transição implement → test é válida
- [x] Verificar que cards existentes continuam funcionando

### Integração
- [x] Criar novo card e movê-lo através do workflow completo
- [x] Verificar que automação de workflow continua funcionando
- [x] Testar drag-and-drop entre colunas
- [x] Confirmar que cards existentes na coluna "in-progress" migram corretamente

---

## 5. Considerações

### Migração de Dados
**Importante:** Será necessário criar uma migração no banco de dados para atualizar todos os cards que atualmente têm `column_id = 'in-progress'` para `column_id = 'implement'`.

```sql
UPDATE cards SET column_id = 'implement' WHERE column_id = 'in-progress';
```

### Riscos
- **Cards existentes:** Cards já salvos com column_id='in-progress' precisarão ser migrados
- **Cache do navegador:** Pode ser necessário limpar cache para ver mudanças no CSS
- **Workflows em andamento:** Se houver workflows automáticos rodando durante a migração, podem falhar

### Ordem de Deploy
1. Primeiro fazer a migração de dados no banco
2. Deploy do backend com suporte a ambos os valores temporariamente
3. Deploy do frontend
4. Remover suporte ao valor antigo no backend