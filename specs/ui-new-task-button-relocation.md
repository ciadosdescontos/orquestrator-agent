## 1. Resumo

Reposicionar o botão de criação de tarefas (atualmente "Add card") para fora do escopo da coluna backlog, renomeando-o para "New Task" e colocando-o em uma localização mais proeminente como uma ação global do orquestrador, refletindo melhor a natureza do produto como um sistema de orquestração de tarefas.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Mover o botão de criação para fora da coluna backlog
- [x] Renomear de "Add card" para "New Task"
- [x] Posicionar o botão em local estratégico e acessível (header ou floating action button)
- [x] Manter a funcionalidade de criar tarefas apenas no backlog
- [x] Melhorar a experiência do usuário destacando esta ação principal

### Fora do Escopo
- Alteração da lógica de criação de tarefas
- Mudanças no modal de criação
- Modificação do fluxo SDLC existente

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/Column/Column.tsx` | Modificar | Remover botão "Add card" do header da coluna backlog |
| `frontend/src/components/NewTaskButton/NewTaskButton.tsx` | Criar | Novo componente para botão global de criação de tarefas |
| `frontend/src/components/NewTaskButton/NewTaskButton.module.css` | Criar | Estilos para o novo botão de tarefa |
| `frontend/src/App.tsx` | Modificar | Adicionar o novo botão "New Task" no header ou como FAB |
| `frontend/src/App.module.css` | Modificar | Ajustar estilos do header para acomodar novo botão |
| `frontend/src/components/AddCardModal/AddCardModal.tsx` | Modificar | Atualizar textos para refletir terminologia "task" |

### Detalhes Técnicos

#### 1. Remover botão da coluna backlog

```tsx
// Column.tsx - Remover estas linhas (46-50)
{/* Adicionar botão Add Card no header para coluna backlog */}
{column.id === 'backlog' && !isCollapsed && (
  <div className={styles.headerActions}>
    <AddCard columnId={column.id} onAdd={onAddCard} />
  </div>
)}
```

#### 2. Criar novo componente NewTaskButton

```tsx
// NewTaskButton.tsx
import { useState } from 'react';
import { ModelType } from '../../types';
import { AddCardModal } from '../AddCardModal/AddCardModal';
import * as cardsApi from '../../api/cards';
import { uploadImage } from '../../utils/imageHandler';
import styles from './NewTaskButton.module.css';

export function NewTaskButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (taskData: {
    title: string;
    description: string;
    modelPlan: ModelType;
    modelImplement: ModelType;
    modelTest: ModelType;
    modelReview: ModelType;
    images: File[];
  }) => {
    try {
      // Criar a task (sempre no backlog)
      const newTask = await cardsApi.createCard(
        taskData.title,
        taskData.description,
        taskData.modelPlan,
        taskData.modelImplement,
        taskData.modelTest,
        taskData.modelReview
      );

      // Upload de imagens se houver
      if (taskData.images.length > 0) {
        for (const file of taskData.images) {
          try {
            await uploadImage(file, newTask.id);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      }

      // Recarregar para atualizar o board
      window.location.reload();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  return (
    <>
      <button
        className={styles.newTaskButton}
        onClick={() => setIsModalOpen(true)}
        aria-label="Create new task"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M8 1v14M1 8h14" />
        </svg>
        <span>New Task</span>
      </button>

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title="Create New Task"
        submitButtonText="Create Task"
      />
    </>
  );
}
```

#### 3. Estilizar o novo botão (opção header)

```css
/* NewTaskButton.module.css */
.newTaskButton {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg,
    var(--accent-cyan) 0%,
    rgba(0, 212, 255, 0.8) 100%
  );
  color: var(--bg-deep);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.newTaskButton:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 16px rgba(0, 212, 255, 0.4),
    0 0 20px rgba(0, 212, 255, 0.2);
}

.newTaskButton:active {
  transform: translateY(0);
}

.newTaskButton svg {
  transition: transform var(--duration-fast) var(--ease-spring);
}

.newTaskButton:hover svg {
  transform: rotate(90deg);
}

/* Shimmer effect */
.newTaskButton::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: rotate(45deg) translate(-50%, -50%);
  transition: all 0.6s;
  opacity: 0;
}

.newTaskButton:hover::after {
  animation: shimmer 0.6s ease;
}

@keyframes shimmer {
  0% {
    transform: rotate(45deg) translate(-200%, -200%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(45deg) translate(200%, 200%);
    opacity: 0;
  }
}
```

#### 4. Alternativa: Floating Action Button (FAB)

```css
/* NewTaskButton.module.css - versão FAB */
.newTaskFab {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    var(--accent-cyan) 0%,
    rgba(0, 212, 255, 0.9) 100%
  );
  color: var(--bg-deep);
  border: none;
  box-shadow:
    0 4px 16px rgba(0, 212, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--ease-out);
  z-index: 90;
}

.newTaskFab:hover {
  transform: scale(1.1);
  box-shadow:
    0 6px 24px rgba(0, 212, 255, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

.newTaskFab svg {
  width: 24px;
  height: 24px;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.newTaskFab:hover svg {
  transform: rotate(90deg);
}

/* Tooltip para FAB */
.fabTooltip {
  position: absolute;
  right: calc(100% + var(--space-3));
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-md);
}

.newTaskFab:hover .fabTooltip {
  opacity: 1;
}
```

#### 5. Integrar no App.tsx (opção header)

```tsx
// App.tsx - Adicionar importação
import { NewTaskButton } from './components/NewTaskButton/NewTaskButton';

// No JSX do header
<header className={styles.header}>
  <h1 className={styles.title}>Task Orchestrator</h1>
  <div className={styles.headerActions}>
    <NewTaskButton />
    <div className={styles.projectActions}>
      <ProjectSwitcher
        currentProject={currentProject}
        onProjectSwitch={setCurrentProject}
      />
      <ProjectLoader
        currentProject={currentProject}
        onProjectLoad={setCurrentProject}
      />
    </div>
  </div>
</header>
```

#### 6. Atualizar AddCardModal para usar terminologia "task"

```tsx
// AddCardModal.tsx - Adicionar props opcionais
interface AddCardModalProps {
  // ... props existentes
  title?: string;
  submitButtonText?: string;
}

// Usar valores padrão
const modalTitle = title || 'Create New Task';
const submitText = submitButtonText || 'Create Task';
```

---

## 4. Testes

### Manuais
- [ ] Verificar que o botão aparece no local correto (header ou FAB)
- [ ] Confirmar que o modal abre corretamente ao clicar no botão
- [ ] Validar que tarefas são criadas no backlog
- [ ] Testar responsividade em diferentes tamanhos de tela
- [ ] Verificar acessibilidade (keyboard navigation, ARIA labels)

### Visual
- [ ] Confirmar que o botão se destaca visualmente
- [ ] Validar animações e transições
- [ ] Verificar contraste e legibilidade
- [ ] Testar estados hover/active/focus

---

## 5. Considerações

### Decisão de Posicionamento

**Opção 1: Header (Recomendado)**
- **Prós:** Sempre visível, contexto claro como ação principal, integração natural com outras ações globais
- **Contras:** Ocupa espaço no header

**Opção 2: Floating Action Button (FAB)**
- **Prós:** Padrão mobile-friendly, não ocupa espaço do header, sempre acessível
- **Contras:** Pode cobrir conteúdo, menos comum em aplicações desktop

**Recomendação:** Implementar no header inicialmente, pois:
1. Alinha com a natureza desktop-first da aplicação
2. Estabelece "New Task" como ação principal do orquestrador
3. Mantém consistência visual com outros elementos globais
4. Oferece melhor descoberta para novos usuários

### Terminologia
- Mudar de "card" para "task" reforça o conceito de orquestração
- Alinha melhor com a proposta de valor do produto
- Mais intuitivo para usuários técnicos

### Acessibilidade
- Incluir ARIA labels apropriados
- Garantir navegação por teclado
- Manter contraste adequado
- Adicionar tooltips informativos