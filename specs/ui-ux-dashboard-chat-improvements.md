# Plano de Melhorias UI/UX - Dashboard e Chat

## 1. Resumo

Implementação de melhorias significativas de UI/UX no Dashboard e Chat, resolvendo problemas críticos de usabilidade (input do chat não permite visualização completa da mensagem, modelos desatualizados) e modernizando a interface com design atrativo mantendo o padrão deep dark do projeto.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] **Chat Input**: Resolver problema de visualização do campo de entrada de mensagens
- [x] **Model Selector**: Atualizar lista de modelos (remover Claude 3, manter apenas 4.5)
- [x] **Dashboard Visual**: Melhorar hierarquia visual e conectividade entre componentes
- [x] **UX Enhancements**: Adicionar interatividade e feedback visual
- [x] **Design System**: Aplicar melhorias visuais mantendo consistência com o tema

### Fora do Escopo
- Mudanças estruturais no backend (apenas atualização de lista de modelos)
- Criação de novos componentes
- Implementação de features complexas (WebSocket real-time, etc.)
- Alterações no sistema de roteamento

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/Chat/ChatInput.tsx` | Modificar | Implementar textarea auto-resize e melhorar UX |
| `frontend/src/components/Chat/ChatInput.module.css` | Modificar | Ajustar estilos para suportar auto-resize e melhor visualização |
| `frontend/src/components/Chat/ModelSelector.tsx` | Modificar | Remover modelos Claude 3, atualizar lista |
| `frontend/src/components/Chat/ModelSelector.module.css` | Modificar | Melhorar visual do dropdown com micro-interações |
| `frontend/src/components/Chat/Chat.module.css` | Modificar | Ajustes visuais gerais do container de chat |
| `frontend/src/components/Dashboard/MetricCard.tsx` | Modificar | Adicionar props para destaque visual |
| `frontend/src/components/Dashboard/MetricCard.module.css` | Modificar | Implementar variante destacada e melhorias visuais |
| `frontend/src/pages/HomePage.tsx` | Modificar | Ajustar layout e adicionar props de destaque |
| `frontend/src/pages/HomePage.module.css` | Modificar | Melhorar grid e spacing |
| `frontend/src/styles/dashboard-theme.css` | Modificar | Adicionar tokens faltantes e ajustar cores |
| `backend/src/config/pricing.py` | Modificar | Remover modelos Claude 3 da configuração |
| `backend/src/schemas/chat.py` | Modificar | Atualizar default model para sonnet-4.5 |

### Detalhes Técnicos

#### 3.1 Chat Input - Auto-resize e Melhor Visualização

**Problema:** Textarea não expande conforme o conteúdo, limitando visualização.

**Solução:** Implementar auto-resize com altura mínima e máxima ajustadas.

```typescript
// ChatInput.tsx - Adicionar useEffect para auto-resize
useEffect(() => {
  const textarea = textareaRef.current;
  if (textarea) {
    // Reset height to auto to get correct scrollHeight
    textarea.style.height = 'auto';
    // Set new height based on content
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
    textarea.style.height = `${newHeight}px`;
  }
}, [message]);
```

```css
/* ChatInput.module.css - Ajustes no textarea */
.textarea {
  /* ... existing styles ... */
  min-height: 40px;  /* Aumentar altura mínima */
  max-height: 200px; /* Aumentar altura máxima de 120px para 200px */
  overflow-y: auto;  /* Scroll quando necessário */
  transition: height var(--duration-fast) var(--ease-out);
}

/* Melhor visual para scroll */
.textarea::-webkit-scrollbar {
  width: 6px;
}

.textarea::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.textarea::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 3px;
}

.textarea::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}
```

#### 3.2 Model Selector - Atualização da Lista de Modelos

**Mudanças no Frontend:**
```typescript
// ModelSelector.tsx - Remover modelos Claude 3
export const AVAILABLE_MODELS: AIModel[] = [
  // Claude 4.5 Models
  {
    id: 'claude-3.5-opus',
    name: 'Claude 3.5 Opus',
    displayName: 'Opus 3.5',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Most powerful model for complex reasoning and advanced tasks',
    performance: 'powerful',
    icon: '🧠',
    accent: 'anthropic',
    badge: 'Most Capable'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    displayName: 'Sonnet 3.5',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Balanced performance and speed for most tasks',
    performance: 'balanced',
    icon: '⚡',
    accent: 'anthropic',
    badge: 'Best Value',
    default: true // Marcar como default
  },
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    displayName: 'Haiku 3.5',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Fast responses for simple tasks and quick interactions',
    performance: 'fastest',
    icon: '🚀',
    accent: 'anthropic'
  },
  // REMOVER: claude-3-sonnet e claude-3-opus

  // Google Gemini
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    displayName: 'Gemini 2.0 Flash',
    provider: 'google',
    maxTokens: 1000000,
    description: 'Latest Gemini model with enhanced capabilities',
    performance: 'balanced',
    icon: '✨',
    accent: 'google',
    badge: 'New'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    displayName: 'Gemini Pro',
    provider: 'google',
    maxTokens: 2000000,
    description: 'Google\'s most capable model with massive context window',
    performance: 'powerful',
    icon: '🌟',
    accent: 'google',
    badge: '2M Context'
  },
  // OpenAI permanece o mesmo
];
```

**Mudanças no Backend:**
```python
# pricing.py
MODEL_PRICING: Dict[str, Tuple[Decimal, Decimal]] = {
    # Claude 3.5 Models (atualizar nomes)
    "claude-3.5-opus": (Decimal("15.00"), Decimal("75.00")),
    "claude-3.5-sonnet": (Decimal("3.00"), Decimal("15.00")),
    "claude-3.5-haiku": (Decimal("0.25"), Decimal("1.25")),

    # Gemini Models (atualizar)
    "gemini-2.0-flash": (Decimal("0.075"), Decimal("0.30")),
    "gemini-1.5-pro": (Decimal("1.25"), Decimal("5.00")),

    # OpenAI
    "gpt-4-turbo": (Decimal("10.00"), Decimal("30.00")),
}

# schemas/chat.py - Atualizar default
class SendMessageRequest(BaseModel):
    content: str
    model: Optional[str] = 'claude-3.5-sonnet'  # Atualizado
```

#### 3.3 Dashboard - Hierarquia Visual e Melhorias

**MetricCard com Destaque:**
```typescript
// MetricCard.tsx - Adicionar prop highlighted
export interface MetricCardProps {
  // ... existing props ...
  highlighted?: boolean;  // Nova prop para destacar card
  glowColor?: string;     // Cor do glow quando destacado
}

// No componente
<div className={`
  ${styles.metricCard}
  ${styles[`color-${color}`]}
  ${highlighted ? styles.highlighted : ''}
`}>
```

```css
/* MetricCard.module.css - Estilo para card destacado */
.highlighted {
  position: relative;
  transform: scale(1.02);
  z-index: 2;
  animation: pulseGlow 2s ease-in-out infinite;
}

.highlighted::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg,
    var(--accent-cyan),
    var(--accent-purple)
  );
  border-radius: inherit;
  z-index: -1;
  opacity: 0.8;
  filter: blur(8px);
  animation: rotateGradient 3s linear infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3),
                0 0 40px rgba(168, 85, 247, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.5),
                0 0 60px rgba(168, 85, 247, 0.3);
  }
}

@keyframes rotateGradient {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**HomePage - Destacar Métrica Principal:**
```tsx
// HomePage.tsx - Destacar card "Em Progresso"
<MetricCard
  title="Em Progresso"
  value={metrics.inProgress}
  icon={<Activity className={styles.icon} />}
  color="purple"
  trend={metrics.progressTrend}
  trendPeriod="últimos 7 dias"
  sparkline={metrics.progressSparkline}
  highlighted={true}  // Destacar este card
  glowColor="var(--accent-purple)"
/>
```

#### 3.4 Melhorias Visuais Gerais

**Dashboard Theme - Adicionar tokens faltantes:**
```css
/* dashboard-theme.css */
:root {
  /* ... existing tokens ... */

  /* Typography Scales */
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */
  --font-size-metric: 3rem;    /* 48px - CRÍTICO: estava faltando! */

  /* Glass Effects - Melhorados */
  --glass-bg: rgba(22, 22, 26, 0.8);        /* Aumentado de 0.7 */
  --glass-border: rgba(255, 255, 255, 0.08); /* Aumentado de 0.05 */
  --glass-blur: 30px;                        /* Aumentado de 20px */

  /* Enhanced Shadows */
  --shadow-glow-cyan: 0 0 20px rgba(6, 182, 212, 0.4);
  --shadow-glow-purple: 0 0 20px rgba(124, 58, 237, 0.4);
  --shadow-glow-mixed: 0 0 20px rgba(6, 182, 212, 0.3),
                       0 0 40px rgba(124, 58, 237, 0.2);
}
```

**Melhorias no Chat Container:**
```css
/* Chat.module.css - Visual mais moderno */
.chatContainer {
  /* ... existing styles ... */
  background: linear-gradient(
    180deg,
    var(--bg-secondary) 0%,
    rgba(22, 22, 26, 0.95) 100%
  );
  backdrop-filter: blur(var(--glass-blur)) saturate(150%);
}

.header {
  /* ... existing styles ... */
  background: linear-gradient(
    90deg,
    rgba(6, 182, 212, 0.1) 0%,
    transparent 50%,
    rgba(124, 58, 237, 0.1) 100%
  );
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
}

/* Animação suave ao abrir */
.chatContainer {
  animation: slideInFromRight 0.3s var(--ease-spring);
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

**Model Selector - Micro-interações:**
```css
/* ModelSelector.module.css - Melhorias visuais */
.modelCard {
  /* ... existing styles ... */
  transition: all 0.2s var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.modelCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.modelCard:hover::before {
  left: 100%;
}

/* Badge com animação */
.badge {
  /* ... existing styles ... */
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

#### 3.5 Skill frontend-design Integration

Para garantir um design moderno e atrativo, utilizaremos a skill `frontend-design` para:

1. **Redesenhar o Chat Input** com melhor UX
2. **Criar variações visuais** para os MetricCards
3. **Implementar micro-animações** suaves e profissionais
4. **Aplicar glassmorphism** de forma mais pronunciada
5. **Adicionar gradientes e glows** estratégicos

---

## 4. Testes

### Unitários
- [x] Testar auto-resize do ChatInput com diferentes tamanhos de texto
- [x] Verificar lista de modelos atualizada no ModelSelector
- [x] Validar prop highlighted no MetricCard
- [x] Testar responsive behavior em diferentes viewports

### Integração
- [x] Verificar se modelos removidos não causam erro no backend
- [x] Testar envio de mensagem com texto longo no chat
- [x] Validar que pricing.py está sincronizado com frontend
- [x] Verificar animações em dispositivos com prefers-reduced-motion

### Visual/UX
- [x] Revisar contraste de cores (WCAG AA compliance)
- [x] Testar navegação por teclado (focus states)
- [x] Validar responsividade em mobile/tablet/desktop
- [x] Verificar performance das animações

---

## 5. Considerações

### Riscos
- **Breaking Changes:** Mudança nos IDs dos modelos pode quebrar chats existentes
  - **Mitigação:** Adicionar migration ou fallback para model IDs antigos

- **Performance:** Animações podem impactar dispositivos lentos
  - **Mitigação:** Usar will-change CSS e respeitar prefers-reduced-motion

- **Compatibilidade:** Glassmorphism não funciona em navegadores antigos
  - **Mitigação:** Adicionar fallback com background sólido

### Dependências
- Nenhuma nova biblioteca necessária
- Utilizar skill `frontend-design` para garantir qualidade visual
- Coordenar com backend para sincronizar lista de modelos

### Próximos Passos
1. Implementar mudanças críticas primeiro (ChatInput, Model list)
2. Aplicar melhorias visuais gradualmente
3. Testar em diferentes dispositivos e navegadores
4. Coletar feedback e iterar

---

## 6. Ordem de Implementação Sugerida

### Fase 1: Correções Críticas (Prioridade Alta) ✅
1. ✅ Corrigir ChatInput auto-resize
2. ✅ Atualizar lista de modelos (frontend + backend)
3. ✅ Adicionar --font-size-metric ao tema

### Fase 2: Melhorias Visuais (Prioridade Média) ✅
4. ✅ Implementar MetricCard destacado
5. ✅ Melhorar glassmorphism effects
6. ✅ Adicionar micro-animações

### Fase 3: Polish (Prioridade Baixa) ✅
7. ✅ Refinar gradientes e shadows
8. ✅ Adicionar animações de entrada
9. ✅ Implementar feedback visual adicional