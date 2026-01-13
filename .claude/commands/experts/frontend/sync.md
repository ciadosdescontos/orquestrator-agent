---
description: Sincroniza o knowledge base do Frontend Expert quando houver mudancas no codigo
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Sync: Frontend Expert

## Proposito

Manter o knowledge base e os comandos do agent de frontend atualizados quando houver mudancas no codigo.

## Quando Executar

Execute este comando quando:
- Novos componentes foram criados em `frontend/src/components/`
- Novos hooks foram criados em `frontend/src/hooks/`
- Novas pages foram adicionadas em `frontend/src/pages/`
- Novos API clients foram criados em `frontend/src/api/`
- Types foram modificados em `frontend/src/types/`
- Novos utils foram criados em `frontend/src/utils/`

## Processo de Sync

### Passo 1: Detectar Mudancas Recentes

Verificar mudancas via git:

```bash
git diff --name-only HEAD~10 -- frontend/src/
```

### Passo 2: Varrer Arquivos Atuais

Usar Glob para listar arquivos atuais:

```
frontend/src/components/*/*.tsx
frontend/src/hooks/*.ts
frontend/src/pages/*.tsx
frontend/src/api/*.ts
frontend/src/types/*.ts
frontend/src/utils/*.ts
```

### Passo 3: Comparar com KNOWLEDGE.md

Para cada arquivo encontrado:
1. Verificar se esta listado no KNOWLEDGE.md
2. Identificar novos arquivos que deveriam ser incluidos
3. Identificar arquivos obsoletos que deveriam ser removidos
4. Verificar se descricoes estao atualizadas

### Passo 4: Atualizar Components

Para components novos ou modificados:
1. Ler o arquivo e extrair props/interface
2. Atualizar a secao de "Components Principais" no KNOWLEDGE.md
3. Verificar se tem index.ts para export

### Passo 5: Atualizar Hooks

Para hooks novos ou modificados:
1. Ler o arquivo e extrair interface de retorno
2. Atualizar a secao de "Custom Hooks" no KNOWLEDGE.md
3. Documentar dependencias entre hooks

### Passo 6: Atualizar API Clients

Para novos API clients:
1. Listar funcoes exportadas
2. Documentar endpoints usados
3. Atualizar KNOWLEDGE.md

### Passo 7: Validar e Atualizar Sub-comandos

Verificar se os sub-comandos ainda fazem sentido:
- `/frontend:component` - paths de components ainda validos?
- `/frontend:hook` - path de hooks correto?
- `/frontend:style` - paths de estilos corretos?

## Arquivos a Verificar

### Components
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/components/*/*.tsx` | React components |
| `frontend/src/components/*/index.ts` | Export files |

### Hooks
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/hooks/*.ts` | Custom hooks |

### Pages
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/pages/*.tsx` | Page components |
| `frontend/src/pages/*.module.css` | Page styles |

### API
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/api/*.ts` | API clients |

### Types
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/types/*.ts` | TypeScript types |

### Utils
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/utils/*.ts` | Utility functions |

### Styles
| Glob Pattern | Descricao |
|--------------|-----------|
| `frontend/src/**/*.module.css` | CSS Modules |

## Output Esperado

Ao finalizar, reporte:

```
## Sync Frontend Expert - Resultado

### Arquivos Adicionados
- `path/novo_arquivo.tsx` - Descricao

### Arquivos Removidos
- `path/arquivo_antigo.tsx` - Motivo: nao existe mais

### Descricoes Atualizadas
- `path/arquivo.tsx` - Antes: X, Agora: Y

### Components Novos
- `NomeComponente` - Descricao breve

### Hooks Novos
- `useNovoHook` - Descricao breve

### Sub-comandos Afetados
- `/frontend:component` - Atualizado path de X

### KNOWLEDGE.md
- [ ] Atualizado
- [ ] Nenhuma mudanca necessaria
```

## Argumentos

$ARGUMENTS - Opcional: especificar o que verificar (ex: "components", "hooks", "all")
