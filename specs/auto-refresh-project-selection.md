# Auto Refresh ao Selecionar Projetos Carregados

## 1. Resumo

Implementar refresh automático da página quando o usuário selecionar um projeto já carregado no dropdown do ProjectSwitcher, garantindo que o estado da aplicação seja completamente atualizado. Isso resolve o problema de possíveis inconsistências de estado ao trocar entre projetos frequentemente acessados.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Adicionar refresh automático ao selecionar projetos no ProjectSwitcher
- [x] Manter a experiência consistente com o comportamento do ProjectLoader
- [x] Garantir que todos os componentes recebam dados atualizados após a troca

### Fora do Escopo
- Modificação do fluxo de carregamento inicial de projetos
- Alteração da lógica de backend
- Mudança no comportamento do ProjectLoader (que já faz refresh)

---

## 3. Implementação

### Arquivos a Serem Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/ProjectSwitcher/ProjectSwitcher.tsx` | Modificar | Adicionar `window.location.reload()` após troca bem-sucedida de projeto |
| `frontend/src/App.tsx` | Modificar (opcional) | Ajustar lógica de carregamento inicial se necessário |

### Detalhes Técnicos

#### A. Modificação Principal no ProjectSwitcher

**Arquivo:** `frontend/src/components/ProjectSwitcher/ProjectSwitcher.tsx`

Atualizar a função `handleProjectSelect` (linhas 37-45) para incluir refresh após a troca:

```typescript
const handleProjectSelect = async (project: Project) => {
  try {
    // Carrega o projeto selecionado
    const loaded = await quickSwitchProject(project.path);

    // Atualiza o estado local primeiro
    onProjectSwitch(loaded);

    // Fecha o dropdown
    setIsOpen(false);

    // Adiciona um pequeno delay para garantir que o estado foi salvo
    // antes de fazer o reload completo da página
    setTimeout(() => {
      window.location.reload();
    }, 100);

  } catch (error) {
    console.error('[ProjectSwitcher] Failed to switch project:', error);
    // Mantém o dropdown aberto em caso de erro
  }
};
```

#### B. Alternativa com Notificação (Opcional)

Se preferir dar feedback visual antes do reload:

```typescript
const handleProjectSelect = async (project: Project) => {
  try {
    const loaded = await quickSwitchProject(project.path);
    onProjectSwitch(loaded);
    setIsOpen(false);

    // Mostra indicador de carregamento
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        font-size: 16px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          <path d="M9 12l2 2 4-4" opacity="0.5"></path>
        </svg>
        Carregando projeto ${loaded.name}...
      </div>
    `;
    document.body.appendChild(loadingDiv);

    // Pequeno delay para o usuário ver a mensagem
    setTimeout(() => {
      window.location.reload();
    }, 300);

  } catch (error) {
    console.error('[ProjectSwitcher] Failed to switch project:', error);
  }
};
```

#### C. Verificação de Projeto Já Carregado (Otimização)

Para evitar reload desnecessário quando o projeto já está carregado:

```typescript
const handleProjectSelect = async (project: Project) => {
  // Verifica se é o mesmo projeto já carregado
  if (currentProject?.path === project.path) {
    console.log('[ProjectSwitcher] Project already loaded, skipping reload');
    setIsOpen(false);
    return;
  }

  try {
    const loaded = await quickSwitchProject(project.path);
    onProjectSwitch(loaded);
    setIsOpen(false);

    // Faz reload apenas se trocar de projeto
    setTimeout(() => {
      window.location.reload();
    }, 100);

  } catch (error) {
    console.error('[ProjectSwitcher] Failed to switch project:', error);
  }
};
```

---

## 4. Testes

### Unitários
- [x] Verificar que `window.location.reload()` é chamado após troca bem-sucedida
- [x] Confirmar que reload não ocorre quando seleciona o mesmo projeto
- [x] Testar que erro na API não causa reload

### Integração
- [x] Testar troca entre múltiplos projetos verificando que página recarrega
- [x] Confirmar que cards e estado são atualizados corretamente após reload
- [x] Validar que projeto correto aparece selecionado após reload

### Testes Manuais
- [x] Abrir aplicação e carregar um projeto
- [x] Usar ProjectSwitcher para trocar para outro projeto
- [x] Verificar que página recarrega automaticamente
- [x] Confirmar que novo projeto está ativo e cards corretos são exibidos
- [x] Testar seleção do mesmo projeto (não deve recarregar)

---

## 5. Considerações

### Riscos
- **Performance:** Reload completo pode ser mais lento que atualização de estado
  - **Mitigação:** Implementar verificação para evitar reload se mesmo projeto

- **Perda de Estado Temporário:** Forms não salvos podem ser perdidos
  - **Mitigação:** Considerar warning ou auto-save antes do reload

### Alternativas Consideradas

1. **Atualização de Estado sem Reload:**
   - Pros: Mais rápido, mantém estado temporário
   - Cons: Pode deixar componentes dessincronizados
   - Decisão: Usar reload para garantir consistência (mesmo padrão do ProjectLoader)

2. **Reload Condicional:**
   - Fazer reload apenas se detectar mudanças significativas
   - Complexidade adicional sem benefício claro
   - Decisão: Simplificar com reload sempre que trocar projeto

### Justificativa da Abordagem

O uso de `window.location.reload()` é consistente com o comportamento existente no ProjectLoader quando descarrega um projeto (linha 94). Isso garante que:

1. Todo o estado da aplicação é reinicializado
2. Cards são recarregados do backend
3. Configurações do novo projeto são aplicadas
4. Evita bugs de estado residual entre projetos

A adição do timeout de 100ms garante que as operações assíncronas (API call e state update) sejam completadas antes do reload, evitando condições de corrida.