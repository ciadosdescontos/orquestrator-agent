# Plan: Melhoria dos Tooltips dos Badges de Experts

## 1. Resumo

Implementar um sistema de tooltips rico e interativo para os badges de experts no card do Kanban, permitindo visualização completa do reason, confidence level e informações adicionais dos experts identificados. O tooltip atual é limitado ao atributo `title` HTML nativo, que não permite formatação rica nem interação.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar componente Tooltip customizado e reutilizável
- [x] Exibir reason completo com formatação rica (markdown)
- [x] Mostrar informações detalhadas do expert (confidence, keywords, knowledge summary)
- [x] Implementar animações suaves de entrada/saída
- [x] Garantir acessibilidade (ARIA attributes, keyboard navigation)
- [x] Adicionar suporte a dark mode

### Fora do Escopo
- Modificações no backend ou API
- Alterações na lógica de identificação de experts
- Mudanças no sistema de triage

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/components/Tooltip/Tooltip.tsx` | Criar | Componente base de tooltip reutilizável |
| `frontend/src/components/Tooltip/Tooltip.module.css` | Criar | Estilos do componente tooltip |
| `frontend/src/components/Tooltip/index.ts` | Criar | Barrel export para o componente |
| `frontend/src/components/ExpertBadges/ExpertBadges.tsx` | Modificar | Integrar novo componente Tooltip |
| `frontend/src/components/ExpertBadges/ExpertBadges.module.css` | Modificar | Ajustes de estilos para comportamento do tooltip |
| `frontend/src/hooks/useTooltip.ts` | Criar | Hook para gerenciar estado e posicionamento do tooltip |

### Detalhes Técnicos

#### 1. Componente Tooltip Base

```typescript
// frontend/src/components/Tooltip/Tooltip.tsx
import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode | string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  offset?: number;
  className?: string;
  interactive?: boolean;
  maxWidth?: number;
}

export function Tooltip({
  children,
  content,
  placement = 'auto',
  trigger = 'hover',
  delay = 200,
  offset = 8,
  className = '',
  interactive = false,
  maxWidth = 320,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Lógica de posicionamento automático
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Implementar lógica de posicionamento inteligente
    // ...
  };

  // Handlers de eventos
  const handleMouseEnter = () => {
    if (trigger !== 'hover') return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return;
    clearTimeout(timeoutRef.current);
    if (!interactive) {
      setIsVisible(false);
    } else {
      timeoutRef.current = setTimeout(() => setIsVisible(false), 100);
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={styles.trigger}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[actualPlacement]} ${className}`}
          style={{
            top: position.top,
            left: position.left,
            maxWidth,
          }}
          onMouseEnter={() => interactive && clearTimeout(timeoutRef.current)}
          onMouseLeave={() => interactive && handleMouseLeave()}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          <div className={styles.content}>
            {content}
          </div>
          <div className={`${styles.arrow} ${styles[actualPlacement]}`} />
        </div>,
        document.body
      )}
    </>
  );
}
```

#### 2. Hook useTooltip

```typescript
// frontend/src/hooks/useTooltip.ts
import { useState, useCallback, useRef } from 'react';

export interface UseTooltipOptions {
  delay?: number;
  closeDelay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export function useTooltip(options: UseTooltipOptions = {}) {
  const {
    delay = 200,
    closeDelay = 0,
    placement = 'auto'
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  const show = useCallback((event?: React.MouseEvent) => {
    clearTimeout(closeTimeoutRef.current);
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      if (event) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      }
    }, delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearTimeout(closeTimeoutRef.current);

    closeTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, closeDelay);
  }, [closeDelay]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return {
    isVisible,
    position,
    show,
    hide,
    toggle,
  };
}
```

#### 3. Componente ExpertTooltipContent

```typescript
// frontend/src/components/ExpertBadges/ExpertTooltipContent.tsx
import { ExpertMatch } from '../../types';
import styles from './ExpertTooltipContent.module.css';

interface ExpertTooltipContentProps {
  expertId: string;
  expertLabel: string;
  match: ExpertMatch;
  color: string;
}

export function ExpertTooltipContent({
  expertId,
  expertLabel,
  match,
  color
}: ExpertTooltipContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.tooltipContent}>
      {/* Header */}
      <div className={styles.header} style={{ borderColor: color }}>
        <div className={styles.expertName} style={{ color }}>
          {expertLabel} Expert
        </div>
        <div className={`${styles.confidence} ${styles[match.confidence]}`}>
          <span className={styles.confidenceLabel}>Confidence:</span>
          <span className={styles.confidenceValue}>{match.confidence}</span>
        </div>
      </div>

      {/* Reason Section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Reason</div>
        <div className={styles.reason}>
          {match.reason}
        </div>
      </div>

      {/* Knowledge Summary (if available) */}
      {match.knowledge_summary && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Knowledge Summary</div>
          <div className={styles.summary}>
            {match.knowledge_summary}
          </div>
        </div>
      )}

      {/* Matched Keywords (if available) */}
      {match.matched_keywords && match.matched_keywords.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Matched Keywords</div>
          <div className={styles.keywords}>
            {match.matched_keywords.map((keyword, index) => (
              <span key={index} className={styles.keyword} style={{ backgroundColor: `${color}15`, color }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer with timestamp */}
      <div className={styles.footer}>
        <span className={styles.timestamp}>
          Identified at: {formatDate(match.identified_at)}
        </span>
      </div>
    </div>
  );
}
```

#### 4. Integração no ExpertBadges

```typescript
// frontend/src/components/ExpertBadges/ExpertBadges.tsx (modificado)
import { Tooltip } from '../Tooltip';
import { ExpertTooltipContent } from './ExpertTooltipContent';
// ... outros imports

export function ExpertBadges({ experts, isLoading, size = 'small' }: ExpertBadgesProps) {
  // ... código existente ...

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {Object.entries(experts).map(([expertId, match]) => {
        const config = getExpertConfig(expertId);
        const confidenceStyle = CONFIDENCE_STYLES[match.confidence];

        return (
          <Tooltip
            key={expertId}
            content={
              <ExpertTooltipContent
                expertId={expertId}
                expertLabel={config.label}
                match={match}
                color={config.color}
              />
            }
            placement="top"
            trigger="hover"
            delay={300}
            interactive={true}
            maxWidth={400}
          >
            <span
              className={styles.badge}
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
                borderColor: config.color,
                borderStyle: match.confidence === 'low' ? 'dashed' : 'solid',
                borderWidth: match.confidence === 'high' ? '2px' : '1px',
                opacity: confidenceStyle.opacity,
              }}
            >
              <span className={styles.icon}>{config.icon}</span>
              <span className={styles.label}>{config.label}</span>
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
}
```

#### 5. Estilos CSS

```css
/* frontend/src/components/Tooltip/Tooltip.module.css */
.trigger {
  display: inline-block;
}

.tooltip {
  position: fixed;
  z-index: 10000;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  animation: fadeIn 0.2s ease-out;
  pointer-events: auto;
}

.content {
  position: relative;
  z-index: 1;
}

.arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  transform: rotate(45deg);
  z-index: 0;
}

.arrow.top {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-top: none;
  border-left: none;
}

.arrow.bottom {
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-bottom: none;
  border-right: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tooltip {
    background: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
  }

  .arrow {
    background: #1f2937;
    border-color: #374151;
  }
}
```

```css
/* frontend/src/components/ExpertBadges/ExpertTooltipContent.module.css */
.tooltipContent {
  min-width: 280px;
  max-width: 400px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 2px solid;
}

.expertName {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.confidence {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  background: #f3f4f6;
}

.confidence.high {
  background: #10b981;
  color: white;
}

.confidence.medium {
  background: #f59e0b;
  color: white;
}

.confidence.low {
  background: #6b7280;
  color: white;
}

.section {
  margin-bottom: 12px;
}

.section:last-child {
  margin-bottom: 8px;
}

.sectionTitle {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.reason,
.summary {
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  white-space: pre-wrap;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.keyword {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.timestamp {
  font-size: 11px;
  color: #9ca3af;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .confidence {
    background: #374151;
  }

  .sectionTitle {
    color: #9ca3af;
  }

  .reason,
  .summary {
    color: #e5e7eb;
  }

  .footer {
    border-color: #374151;
  }

  .timestamp {
    color: #6b7280;
  }
}
```

---

## 4. Testes

### Unitários
- [ ] Teste do componente Tooltip com diferentes props
- [ ] Teste do hook useTooltip
- [ ] Teste de posicionamento automático
- [ ] Teste de acessibilidade (ARIA attributes)

### Integração
- [ ] Teste de renderização com dados reais de experts
- [ ] Teste de interação (hover, click, keyboard)
- [ ] Teste de performance com múltiplos tooltips
- [ ] Teste de responsividade em diferentes tamanhos de tela

### Manuais
- [ ] Verificar animações de entrada/saída
- [ ] Testar em dark mode
- [ ] Testar com diferentes níveis de confidence
- [ ] Testar com textos longos no reason
- [ ] Testar posicionamento próximo às bordas da tela

---

## 5. Considerações

### Riscos
- **Performance**: Múltiplos tooltips podem impactar performance. Mitigação: usar React.memo e lazy loading
- **Acessibilidade**: Garantir navegação por teclado. Mitigação: implementar ARIA completo e focus management
- **Mobile**: Hover não funciona em mobile. Mitigação: implementar fallback com click/tap

### Dependências
- Nenhuma biblioteca externa adicional necessária
- Usar apenas React, ReactDOM e CSS modules existentes

### Melhorias Futuras
- Adicionar suporte a markdown no reason
- Implementar cópia rápida do reason
- Adicionar links para documentação dos experts
- Implementar tooltips persistentes (pin/unpin)