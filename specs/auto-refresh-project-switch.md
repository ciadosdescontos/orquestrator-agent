# Plano de Implementação: Auto-Refresh ao Trocar Projeto

## 1. Resumo

Implementar refresh automático dos cards ao trocar de projeto através do ProjectSwitcher, garantindo que os cards do novo projeto sejam carregados automaticamente. Atualmente, ao trocar de projeto, o sistema mantém os cards do projeto anterior na tela, causando inconsistência visual.

---

## 2. Objetivos e Escopo

### Objetivos
- [ ] Recarregar cards automaticamente ao trocar de projeto via ProjectSwitcher
- [ ] Manter consistência visual mostrando apenas cards do projeto ativo
- [ ] Preservar o padrão de UX já existente (loading states, error handling)
- [ ] Garantir que outros dados (chats, agents) também sejam atualizados

### Fora do Escopo
- Refatoração do sistema de gerenciamento de estado (manter useState local)
- Mudanças na API backend
- Alterações no fluxo de carregamento inicial

---

## 3. Implementação

### Arquivos a Serem Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/App.tsx` | Modificar | Adicionar useEffect para detectar mudança de projeto e recarregar dados |
| `frontend/src/components/ProjectSwitcher/ProjectSwitcher.tsx` | Modificar | Adicionar callback opcional para notificar sobre reload |

### Detalhes Técnicos

#### **Opção 1: useEffect com Dependency (RECOMENDADA)**

Adicionar em `App.tsx` após o useEffect de carregamento inicial (linha ~154):

```typescript
// Recarrega dados quando o projeto muda
useEffect(() => {
  // Skip no carregamento inicial (quando currentProject é null pela primeira vez)
  if (!currentProject) return;

  const reloadProjectData = async () => {
    try {
      setIsLoadingCards(true);

      // Recarregar cards do novo projeto
      const loadedCards = await cardsApi.fetchCards();
      setCards(loadedCards);

      // Recarregar chats do novo projeto
      const loadedChats = await chatsApi.fetchChats();
      setChats(loadedChats);

      // Recarregar agents do novo projeto
      const loadedAgents = await agentsApi.fetchAgents();
      setAgents(loadedAgents);

    } catch (error) {
      console.error('Error reloading project data:', error);
      // Opcional: adicionar toast de erro
    } finally {
      setIsLoadingCards(false);
    }
  };

  reloadProjectData();
}, [currentProject?.id]); // Executa quando ID do projeto muda
```

#### **Opção 2: Callback Explícito no ProjectSwitcher**

Modificar `App.tsx` para criar um handler específico:

```typescript
// Substituir linha 351-354 em App.tsx
const handleProjectSwitch = async (project: Project) => {
  setCurrentProject(project);

  // Recarregar dados imediatamente
  setIsLoadingCards(true);
  try {
    const [loadedCards, loadedChats, loadedAgents] = await Promise.all([
      cardsApi.fetchCards(),
      chatsApi.fetchChats(),
      agentsApi.fetchAgents()
    ]);

    setCards(loadedCards);
    setChats(loadedChats);
    setAgents(loadedAgents);
  } catch (error) {
    console.error('Error loading project data:', error);
  } finally {
    setIsLoadingCards(false);
  }
};

// No JSX:
<ProjectSwitcher
  currentProject={currentProject}
  onProjectSwitch={handleProjectSwitch}
/>
```

#### **Opção 3: window.location.reload() (Simples mas menos elegante)**

Modificar `ProjectSwitcher.tsx` linha 43:

```typescript
const handleProjectSelect = async (project: Project) => {
  try {
    const loaded = await quickSwitchProject(project.path);
    onProjectSwitch(loaded);
    setIsOpen(false);

    // Reload para garantir sincronização total
    setTimeout(() => {
      window.location.reload();
    }, 100); // Pequeno delay para garantir que estado foi salvo

  } catch (error) {
    console.error('Failed to switch project:', error);
  }
};
```

### Estados de Loading

Para melhorar a UX durante o reload, adicionar indicadores visuais:

```typescript
// App.tsx - adicionar estado se não existir
const [isLoadingCards, setIsLoadingCards] = useState(false);

// No componente Board ou onde cards são exibidos
{isLoadingCards ? (
  <div className="flex items-center justify-center h-64">
    <Spinner message="Carregando cards do projeto..." />
  </div>
) : (
  <Board cards={cards} />
)}
```

---

## 4. Testes

### Manuais
- [ ] Trocar entre projetos e verificar que cards são atualizados
- [ ] Verificar que não há flash/piscar desnecessário na UI
- [ ] Confirmar que chats e agents também são atualizados
- [ ] Testar com projetos vazios (sem cards)
- [ ] Verificar comportamento ao trocar rapidamente entre projetos
- [ ] Confirmar que favoritos continuam funcionando após troca

### Cenários de Teste
- [ ] Projeto A (3 cards) → Projeto B (5 cards): deve mostrar 5 cards
- [ ] Projeto com cards → Projeto vazio: deve limpar a tela
- [ ] Trocar e voltar para projeto anterior: cards devem ser os mesmos
- [ ] Trocar projeto durante operação de chat: chat deve parar/resetar

---

## 5. Considerações

### Riscos
- **Performance**: Múltiplas chamadas à API podem causar lentidão
  - Mitigação: Usar Promise.all() para paralelizar requisições
  - Considerar cache de curta duração para projetos recém-visitados

- **Race Conditions**: Trocar rapidamente entre projetos pode causar inconsistências
  - Mitigação: Implementar AbortController para cancelar requisições antigas
  - Adicionar debounce se necessário

### Dependências
- Nenhuma dependência externa
- Backend já suporta todas as operações necessárias
- APIs já retornam dados filtrados por projeto ativo

### Recomendação Final
**Implementar Opção 1 (useEffect com dependency)** por ser:
- Mais elegante e mantém o padrão React
- Automaticamente gerencia o ciclo de vida
- Evita reload completo da página
- Permite adicionar animações/transições suaves
- Mais fácil de testar e manter