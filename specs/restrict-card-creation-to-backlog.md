# Restrição de Criação de Cards - Apenas Backlog

## Descrição
Implementar restrição para que cards só possam ser criados na raia "backlog". As demais raias (in-progress, test, review, done) não devem permitir criação de novos cards.

## Contexto
Atualmente, o componente `AddCard` é renderizado em todas as 5 raias do kanban, permitindo a criação de cards em qualquer uma delas. A regra de negócio exige que cards só entrem no sistema via backlog.

## Arquivos Afetados
- `src/components/Column/Column.tsx` - Renderização condicional do AddCard
- `src/App.tsx` - Validação defensiva na função addCard

## Plano de Implementação

### 1. Modificar Column.tsx - Renderização Condicional
- [x] Alterar linha 37 para renderizar `AddCard` apenas quando `column.id === 'backlog'`
- [x] Manter a estrutura e estilos da coluna intactos

**Código atual (linha 37):**
```tsx
<AddCard columnId={column.id} onAdd={onAddCard} />
```

**Código novo:**
```tsx
{column.id === 'backlog' && (
  <AddCard columnId={column.id} onAdd={onAddCard} />
)}
```

### 2. Adicionar Validação Defensiva em App.tsx
- [x] Adicionar verificação na função `addCard` para rejeitar criação em colunas diferentes de 'backlog'
- [x] Adicionar log de aviso para debugging

**Código atual (linhas 20-28):**
```tsx
const addCard = (title: string, description: string, columnId: ColumnId) => {
  const newCard: CardType = {
    id: crypto.randomUUID(),
    title,
    description,
    columnId,
  };
  setCards(prev => [...prev, newCard]);
};
```

**Código novo:**
```tsx
const addCard = (title: string, description: string, columnId: ColumnId) => {
  if (columnId !== 'backlog') {
    console.warn('Cards só podem ser criados na raia backlog');
    return;
  }

  const newCard: CardType = {
    id: crypto.randomUUID(),
    title,
    description,
    columnId,
  };
  setCards(prev => [...prev, newCard]);
};
```

## O Que NÃO Será Afetado
- **Drag-and-drop:** Cards criados no backlog poderão ser movidos livremente entre todas as raias
- **Remoção de cards:** Continua funcionando em todas as raias
- **Visualização:** Todas as raias continuam exibindo seus cards normalmente

## Testes
- [x] Build TypeScript passou sem erros
- [ ] Verificar que botão "Add card" aparece apenas na raia Backlog
- [ ] Verificar que criação de card funciona normalmente no Backlog
- [ ] Verificar que drag-and-drop continua funcionando entre todas as raias
- [ ] Verificar console para ausência de erros

## Critérios de Aceite
1. O formulário "Add card" deve aparecer APENAS na raia Backlog
2. Cards criados devem iniciar no Backlog
3. Cards podem ser movidos para qualquer raia via drag-and-drop
4. Não deve haver regressões no comportamento existente
