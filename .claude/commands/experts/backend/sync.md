---
description: Sincroniza o knowledge base do Backend Expert quando houver mudancas no codigo
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Sync: Backend Expert

## Proposito

Manter o knowledge base e os comandos do agent de backend atualizados quando houver mudancas no codigo.

## Quando Executar

Execute este comando quando:
- Novas routes foram criadas em `backend/src/routes/`
- Novos services foram criados em `backend/src/services/`
- Novos schemas foram adicionados em `backend/src/schemas/`
- Config foi modificado em `backend/src/config/`
- Arquivos core foram modificados (main.py, agent.py, etc)

## Processo de Sync

### Passo 1: Detectar Mudancas Recentes

Verificar mudancas via git:

```bash
git diff --name-only HEAD~10 -- backend/src/
```

### Passo 2: Varrer Arquivos Atuais

Usar Glob para listar arquivos atuais:

```
backend/src/routes/*.py
backend/src/services/*.py
backend/src/schemas/*.py
backend/src/config/*.py
backend/src/*.py
```

### Passo 3: Comparar com KNOWLEDGE.md

Para cada arquivo encontrado:
1. Verificar se esta listado no KNOWLEDGE.md
2. Identificar novos arquivos que deveriam ser incluidos
3. Identificar arquivos obsoletos que deveriam ser removidos
4. Verificar se descricoes estao atualizadas

### Passo 4: Atualizar Routes

Para routes novas ou modificadas:
1. Ler o arquivo e extrair endpoints
2. Atualizar a secao de "Endpoints Principais" no KNOWLEDGE.md
3. Documentar metodos HTTP e paths

### Passo 5: Atualizar Services

Para services novos ou modificados:
1. Ler o arquivo e extrair classes/funcoes principais
2. Atualizar a secao de "Services" no KNOWLEDGE.md
3. Documentar responsabilidades

### Passo 6: Atualizar Schemas

Para schemas novos ou modificados:
1. Listar DTOs exportados
2. Documentar campos principais
3. Atualizar KNOWLEDGE.md

### Passo 7: Validar e Atualizar Sub-comandos

Verificar se os sub-comandos ainda fazem sentido:
- `/backend:route` - paths de routes ainda validos?
- `/backend:service` - paths de services corretos?
- `/backend:websocket` - endpoints WebSocket corretos?

## Arquivos a Verificar

### Core
| Glob Pattern | Descricao |
|--------------|-----------|
| `backend/src/main.py` | Entry point |
| `backend/src/agent*.py` | Agent files |
| `backend/src/execution.py` | Execution |
| `backend/src/project_manager.py` | Projects |
| `backend/src/git_workspace.py` | Git |

### Routes
| Glob Pattern | Descricao |
|--------------|-----------|
| `backend/src/routes/*.py` | API routes |

### Services
| Glob Pattern | Descricao |
|--------------|-----------|
| `backend/src/services/*.py` | Business logic |

### Schemas
| Glob Pattern | Descricao |
|--------------|-----------|
| `backend/src/schemas/*.py` | Pydantic DTOs |

### Config
| Glob Pattern | Descricao |
|--------------|-----------|
| `backend/src/config/*.py` | Configuration |

## Output Esperado

Ao finalizar, reporte:

```
## Sync Backend Expert - Resultado

### Arquivos Adicionados
- `path/novo_arquivo.py` - Descricao

### Arquivos Removidos
- `path/arquivo_antigo.py` - Motivo: nao existe mais

### Descricoes Atualizadas
- `path/arquivo.py` - Antes: X, Agora: Y

### Endpoints Novos
- `POST /api/novo` - Descricao breve

### Services Novos
- `NovoService` - Descricao breve

### Sub-comandos Afetados
- `/backend:route` - Atualizado path de X

### KNOWLEDGE.md
- [ ] Atualizado
- [ ] Nenhuma mudanca necessaria
```

## Argumentos

$ARGUMENTS - Opcional: especificar o que verificar (ex: "routes", "services", "all")
