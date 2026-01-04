# Implementação do Sistema de Toggle de Temas (Light/Dark)

## 1. Resumo

Implementar um sistema de toggle de temas que permita ao usuário alternar entre light mode e dark mode, corrigindo as inconsistências visuais onde alguns componentes estão em light e outros em dark. O sistema manterá o dark mode como tema padrão (conforme design atual dos modais) e adicionará suporte completo ao light mode.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar sistema de gerenciamento de temas com Context API
- [x] Adicionar botão de toggle de tema na interface
- [x] Implementar variáveis CSS para ambos os temas (light e dark)
- [x] Garantir consistência visual em todos os componentes
- [x] Persistir preferência do usuário no localStorage
- [x] Aplicar transições suaves ao trocar de tema

### Fora do Escopo
- Tema automático baseado em preferência do sistema (pode ser adicionado futuramente)
- Temas customizados além de light/dark
- Mudanças estruturais no layout

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/contexts/ThemeContext.tsx` | Criar | Context para gerenciamento do tema |
| `frontend/src/hooks/useTheme.ts` | Criar | Hook para facilitar uso do tema |
| `frontend/src/App.module.css` | Modificar | Adicionar variáveis CSS para light mode |
| `frontend/src/main.tsx` | Modificar | Adicionar ThemeProvider |
| `frontend/src/components/ThemeToggle/ThemeToggle.tsx` | Criar | Componente do botão de toggle |
| `frontend/src/components/ThemeToggle/ThemeToggle.module.css` | Criar | Estilos do botão de toggle |
| `frontend/src/components/Navigation/Sidebar.tsx` | Modificar | Adicionar botão de toggle na sidebar |
| `frontend/src/components/**/*.module.css` | Modificar | Atualizar para usar variáveis CSS dinâmicas |

### Detalhes Técnicos

#### 1. Criar Context de Tema

```typescript
// frontend/src/contexts/ThemeContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### 2. Variáveis CSS para Light Mode

```css
/* frontend/src/App.module.css - Adicionar após :root */
[data-theme="light"] {
  /* Background Layers */
  --bg-deep: #ffffff;
  --bg-base: #f8f9fa;
  --bg-elevated: #ffffff;
  --bg-surface: #f1f3f5;
  --bg-hover: #e9ecef;

  /* Glass Effect */
  --glass-bg: rgba(0, 0, 0, 0.02);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-glow: rgba(99, 102, 241, 0.1);

  /* Text Hierarchy */
  --text-primary: #212529;
  --text-secondary: #495057;
  --text-muted: #868e96;
  --text-dim: #adb5bd;

  /* Accent Colors */
  --accent-cyan: #0c8ce9;
  --accent-cyan-glow: rgba(12, 140, 233, 0.2);
  --accent-cyan-subtle: rgba(12, 140, 233, 0.1);

  /* Borders */
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-default: rgba(0, 0, 0, 0.1);
  --border-hover: rgba(0, 0, 0, 0.15);
  --border-glow: rgba(99, 102, 241, 0.3);

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --shadow-glow: 0 0 15px var(--accent-cyan-glow);
}
```

#### 3. Componente de Toggle

```typescript
// frontend/src/components/ThemeToggle/ThemeToggle.tsx
import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className={styles.track}>
        <span className={`${styles.thumb} ${theme === 'light' ? styles.light : ''}`}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
      <span className={styles.label}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
```

#### 4. Atualização dos Componentes Modais

Para os modais (AddCardModal, CardEditModal, LogsModal), atualizar os estilos para usar as variáveis CSS dinâmicas:

```css
/* Exemplo de mudança em AddCardModal.module.css */
.overlay {
  /* Mudar de valores hardcoded para variáveis */
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
}

.modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  /* ... resto dos estilos usando variáveis */
}
```

#### 5. Transições Suaves

```css
/* Adicionar em App.module.css */
* {
  transition: background-color 200ms ease,
              color 200ms ease,
              border-color 200ms ease;
}
```

---

## 4. Testes

### Unitários
- [ ] Testar ThemeContext e Provider
- [ ] Testar hook useTheme
- [ ] Testar persistência no localStorage
- [ ] Testar componente ThemeToggle

### Integração
- [ ] Verificar aplicação do tema em todos os componentes
- [ ] Testar transição entre temas
- [ ] Validar consistência visual em ambos os temas
- [ ] Testar em diferentes navegadores

### Checklist Visual
- [ ] Sidebar em ambos os temas
- [ ] Kanban board (cards e colunas)
- [ ] Modal de adicionar card
- [ ] Modal de editar card
- [ ] Modal de logs
- [ ] Chat interface
- [ ] Settings page
- [ ] Botões e inputs
- [ ] Scrollbars
- [ ] Tooltips e dropdowns

---

## 5. Considerações

### Riscos
- **Performance:** Mudança de tema pode causar reflow/repaint significativo
  - **Mitigação:** Usar CSS variables e transições otimizadas
- **Compatibilidade:** Alguns navegadores antigos não suportam CSS variables
  - **Mitigação:** Adicionar fallbacks ou polyfills se necessário

### Dependências
- Nenhuma biblioteca externa necessária
- Aproveitar React Context API nativo

### Notas de Implementação
- O dark mode atual já está bem definido e será mantido como base
- Light mode será criado invertendo cores mantendo a hierarquia visual
- Botão de toggle será posicionado na parte inferior da sidebar para fácil acesso
- Transições devem ser sutis mas perceptíveis (~200ms)