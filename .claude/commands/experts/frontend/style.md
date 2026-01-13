---
description: Trabalhar com estilos CSS Modules e sistema de temas
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Style: Frontend Expert

## Proposito

Criar ou modificar estilos seguindo o sistema de CSS Modules e temas do projeto.

## Sistema de Temas

O projeto usa CSS Variables para suportar dark/light mode.

### Variables Disponiveis

```css
/* Definidas em frontend/src/styles/ */

/* Cores de fundo */
--bg-primary      /* Fundo principal */
--bg-secondary    /* Fundo secundario */
--bg-tertiary     /* Fundo terciario */

/* Cores de texto */
--text-primary    /* Texto principal */
--text-secondary  /* Texto secundario */
--text-muted      /* Texto discreto */

/* Cores de acento */
--accent          /* Cor de destaque */
--accent-hover    /* Hover da cor de destaque */

/* Bordas */
--border-color    /* Cor de bordas */
--border-radius   /* Raio padrao */

/* Sombras */
--shadow-sm       /* Sombra pequena */
--shadow-md       /* Sombra media */
--shadow-lg       /* Sombra grande */

/* Colunas do Kanban */
--column-backlog
--column-plan
--column-implement
--column-test
--column-review
--column-done
```

## Padroes de CSS Modules

### Nomenclatura de Classes

```css
/* BEM-like mas simplificado */
.container { }      /* Container principal */
.header { }         /* Secao header */
.content { }        /* Conteudo principal */
.footer { }         /* Secao footer */
.item { }           /* Item generico */
.itemActive { }     /* Estado ativo (camelCase) */
.itemDisabled { }   /* Estado desabilitado */
```

### Template Basico

```css
/* NomeComponente.module.css */

.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
}

.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.content {
  flex: 1;
  color: var(--text-secondary);
}

/* Estados */
.active {
  border-color: var(--accent);
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Hover */
.clickable:hover {
  background: var(--bg-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
}
```

## Instrucoes

### Para CRIAR novos estilos:

1. **Use CSS Variables** para cores e espacamentos
2. **Siga nomenclatura** camelCase para classes compostas
3. **Adicione estados** (hover, active, disabled)
4. **Considere responsividade** quando relevante

### Para MODIFICAR estilos existentes:

1. **Leia o arquivo CSS atual**
2. **Mantenha consistencia** com classes existentes
3. **Nao quebre** estilos de outros componentes
4. **Teste em ambos os temas** (dark/light)

## Arquivos de Estilo Global

- `frontend/src/styles/` - Estilos globais e variables
- `frontend/src/App.module.css` - Estilos do App principal

## Checklist de Qualidade

- [ ] Usa CSS Variables (nao cores hardcoded)
- [ ] Classes em camelCase
- [ ] Estados de hover/active definidos
- [ ] Funciona em dark e light mode
- [ ] Responsivo (se aplicavel)
- [ ] Sem !important (evitar)

## Exemplos de Estilos Existentes

### Componente simples
```
frontend/src/components/Card/Card.module.css
```

### Page com layout
```
frontend/src/pages/HomePage.module.css
```

### Modal
```
frontend/src/components/CardEditModal/CardEditModal.module.css
```

## Solicitacao

$ARGUMENTS
