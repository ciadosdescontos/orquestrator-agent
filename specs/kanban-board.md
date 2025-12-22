# Kanban Board - Plano de Implementação

**Tipo:** Feature
**Data:** 2025-12-20
**Status:** Concluído

---

## 1. Resumo

Implementar um **Kanban Board** completo na raiz do projeto utilizando React + Vite com TypeScript. O board terá 5 colunas (Backlog, In Progress, Test, Review, Done) com funcionalidade de drag-and-drop para movimentação de cards. A interface seguirá um design clean e minimalista conforme as diretrizes da skill frontend-design.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar projeto React + Vite com TypeScript na raiz
- [x] Implementar 5 colunas do kanban: Backlog, In Progress, Test, Review, Done
- [x] Adicionar drag-and-drop para mover cards entre colunas
- [x] Permitir criar novos cards com título e descrição
- [x] Permitir remover cards
- [x] Aplicar design clean e minimalista (UI distintiva)

### Fora do Escopo
- Persistência de dados (localStorage, banco de dados)
- Autenticação/autorização
- Edição de cards após criação
- Múltiplos boards

---

## 3. Implementação

### Tech Stack Escolhida

| Tecnologia | Justificativa |
|------------|---------------|
| **React 18** | Componentes reutilizáveis, hooks para state management |
| **Vite** | Build tool rápido, HMR instantâneo, setup simples |
| **TypeScript** | Type safety, melhor DX e manutenibilidade |
| **@dnd-kit** | Biblioteca moderna de drag-and-drop, mais leve e flexível que react-beautiful-dnd |
| **CSS Modules** | Estilos escopados por componente, sem conflitos |

### Arquivos a Serem Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `package.json` | Criar | Configuração do projeto e dependências |
| `vite.config.ts` | Criar | Configuração do Vite |
| `tsconfig.json` | Criar | Configuração do TypeScript |
| `tsconfig.node.json` | Criar | Configuração TS para Node |
| `index.html` | Criar | Entry point HTML |
| `src/main.tsx` | Criar | Entry point React |
| `src/App.tsx` | Criar | Componente principal com estado do board |
| `src/App.module.css` | Criar | Estilos globais e layout |
| `src/types/index.ts` | Criar | Tipos TypeScript (Card, Column, etc.) |
| `src/components/Board/Board.tsx` | Criar | Container do kanban com colunas |
| `src/components/Board/Board.module.css` | Criar | Estilos do board |
| `src/components/Column/Column.tsx` | Criar | Componente de coluna (droppable) |
| `src/components/Column/Column.module.css` | Criar | Estilos da coluna |
| `src/components/Card/Card.tsx` | Criar | Componente de card (draggable) |
| `src/components/Card/Card.module.css` | Criar | Estilos do card |
| `src/components/AddCard/AddCard.tsx` | Criar | Formulário para adicionar cards |
| `src/components/AddCard/AddCard.module.css` | Criar | Estilos do formulário |

### Estrutura de Diretórios

```
/
├── src/
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx
│   │   │   └── Board.module.css
│   │   ├── Column/
│   │   │   ├── Column.tsx
│   │   │   └── Column.module.css
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── Card.module.css
│   │   └── AddCard/
│   │       ├── AddCard.tsx
│   │       └── AddCard.module.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.module.css
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tsconfig.node.json
```

### Detalhes Técnicos

#### Tipos TypeScript

```typescript
// src/types/index.ts
export type ColumnId = 'backlog' | 'in-progress' | 'test' | 'review' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'test', title: 'Test' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];
```

#### Estado Principal (App.tsx)

```typescript
const [cards, setCards] = useState<Card[]>([]);

const addCard = (title: string, description: string, columnId: ColumnId) => {
  const newCard: Card = {
    id: crypto.randomUUID(),
    title,
    description,
    columnId,
  };
  setCards(prev => [...prev, newCard]);
};

const removeCard = (cardId: string) => {
  setCards(prev => prev.filter(card => card.id !== cardId));
};

const moveCard = (cardId: string, newColumnId: ColumnId) => {
  setCards(prev =>
    prev.map(card =>
      card.id === cardId ? { ...card, columnId: newColumnId } : card
    )
  );
};
```

#### Drag and Drop com @dnd-kit

```typescript
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const cardId = active.id as string;
    const newColumnId = over.id as ColumnId;
    moveCard(cardId, newColumnId);
  }
};
```

### Diretrizes de Design (frontend-design)

#### Paleta de Cores
```css
:root {
  /* Background */
  --bg-primary: #fafafa;
  --bg-secondary: #ffffff;
  --bg-column: #f5f5f5;

  /* Text */
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;

  /* Accents */
  --accent-primary: #2563eb;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;

  /* Borders */
  --border-light: #e5e5e5;
  --border-medium: #d4d4d4;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);
}
```

#### Tipografia
- **Font Family:** Inter, system-ui, sans-serif
- **Headings:** 600 weight, tracking -0.02em
- **Body:** 400 weight, line-height 1.5

#### Componentes Visuais
- **Cards:** Bordas arredondadas (8px), sombra sutil, hover state
- **Colunas:** Background neutro, título em caps pequeno
- **Botões:** Transições suaves (150ms), estados hover/active claros
- **Drag state:** Sombra elevada, escala sutil (1.02)

---

## 4. Testes

### Unitários
- [ ] Testar função `addCard` - card é adicionado corretamente
- [ ] Testar função `removeCard` - card é removido corretamente
- [ ] Testar função `moveCard` - card é movido para nova coluna
- [ ] Testar componente `Card` - renderiza título e descrição
- [ ] Testar componente `Column` - renderiza título e cards

### Integração
- [ ] Testar drag-and-drop - card move entre colunas
- [ ] Testar fluxo completo - criar card, mover, deletar

---

## 5. Considerações

### Riscos e Mitigações
| Risco | Mitigação |
|-------|-----------|
| @dnd-kit pode ter curva de aprendizado | Documentação oficial é excelente, seguir exemplos |
| Performance com muitos cards | Virtualização com @tanstack/virtual se necessário (fora do escopo inicial) |

### Dependências NPM
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## 6. Checklist de Implementação

### Setup do Projeto
- [x] Criar package.json com dependências
- [x] Configurar vite.config.ts
- [x] Configurar tsconfig.json
- [x] Criar index.html
- [x] Instalar dependências (npm install)

### Estrutura Base
- [x] Criar src/types/index.ts com tipos
- [x] Criar src/main.tsx (entry point)
- [x] Criar src/App.tsx com estado
- [x] Criar estilos globais

### Componentes
- [x] Implementar Board.tsx
- [x] Implementar Column.tsx
- [x] Implementar Card.tsx
- [x] Implementar AddCard.tsx

### Drag and Drop
- [x] Configurar DndContext
- [x] Implementar draggable nos cards
- [x] Implementar droppable nas colunas
- [x] Adicionar DragOverlay para feedback visual

### Estilização Final
- [x] Aplicar paleta de cores
- [x] Adicionar transições e animações
- [x] Responsividade básica
- [x] Estados hover/active/focus
