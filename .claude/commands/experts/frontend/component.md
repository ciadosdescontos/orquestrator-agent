---
description: Criar ou modificar componentes React seguindo padroes do projeto
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Component: Frontend Expert

## Proposito

Criar ou modificar componentes React seguindo os padroes estabelecidos no projeto.

## Padroes do Projeto

### Estrutura de Componente

```
frontend/src/components/NomeComponente/
├── NomeComponente.tsx       # Componente principal
├── NomeComponente.module.css # Estilos (CSS Modules)
└── index.ts                  # Export
```

### Template de Componente

```typescript
// NomeComponente.tsx
import styles from './NomeComponente.module.css'

interface NomeComponenteProps {
  // Props tipadas
}

export function NomeComponente({ ...props }: NomeComponenteProps) {
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  )
}
```

### Template de Index

```typescript
// index.ts
export { NomeComponente } from './NomeComponente'
```

### Template de CSS Module

```css
/* NomeComponente.module.css */
.container {
  /* Use CSS variables para temas */
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

## Instrucoes

### Para CRIAR novo componente:

1. **Verifique se ja existe** componente similar
2. **Crie o diretorio** em `frontend/src/components/`
3. **Crie os 3 arquivos**: .tsx, .module.css, index.ts
4. **Siga os padroes** de tipagem e estrutura
5. **Use CSS variables** para suportar dark/light mode

### Para MODIFICAR componente existente:

1. **Leia o componente atual** para entender estrutura
2. **Identifique props existentes** e novas necessarias
3. **Faca modificacoes incrementais** mantendo compatibilidade
4. **Atualize estilos** se necessario

## Checklist de Qualidade

- [ ] TypeScript strict (sem `any`)
- [ ] Props interface definida
- [ ] CSS usando variables do tema
- [ ] Export via index.ts
- [ ] Nomes descritivos para classes CSS
- [ ] Componente funcional (nao classe)

## Exemplos de Componentes Existentes

### Simples (Card)
```
frontend/src/components/Card/Card.tsx
```

### Com Modal (CardEditModal)
```
frontend/src/components/CardEditModal/CardEditModal.tsx
```

### Com Estado Complexo (Chat)
```
frontend/src/components/Chat/Chat.tsx
```

## Solicitacao

$ARGUMENTS
