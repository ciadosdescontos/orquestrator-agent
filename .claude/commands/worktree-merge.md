---
description: Commita mudanças de um worktree e faz merge com uma branch especificada. Use para finalizar trabalho em worktrees.
argument-hint: <worktree-path> <target-branch>
model: sonnet
---

# Worktree Merge Command

Finaliza o trabalho em um Git worktree, commitando as mudanças e fazendo merge com a branch de destino.

## Parâmetros

- `$1`: Caminho do worktree (relativo ou absoluto)
- `$2`: Branch de destino para o merge

## Instruções

Execute os seguintes passos em sequência:

### 1. Validar parâmetros

Se `$1` ou `$2` não foram fornecidos, solicite ao usuário:
- Caminho do worktree
- Branch de destino para merge

### 2. Verificar o worktree

```bash
# Verificar se o diretório existe
ls -la $1

# Navegar até o worktree e verificar status
cd $1 && git status
```

### 3. Identificar a branch do worktree

```bash
cd $1 && git branch --show-current
```

Guarde o nome desta branch para usar no merge.

### 4. Commitar mudanças no worktree

Se houver mudanças não commitadas:

```bash
cd $1 && git add .
```

Analise as mudanças com `git diff --staged` e gere automaticamente uma mensagem de commit descritiva seguindo o padrão conventional commits (feat, fix, refactor, docs, etc).

```bash
cd $1 && git commit -m "mensagem gerada automaticamente"
```

### 5. Push das mudanças do worktree

```bash
cd $1 && git push origin <branch-do-worktree>
```

Se o push falhar porque a branch não existe no remote:
```bash
cd $1 && git push -u origin <branch-do-worktree>
```

### 6. Voltar ao repositório principal e fazer checkout na branch de destino

```bash
# Voltar ao diretório principal do projeto
cd $(git rev-parse --show-toplevel)

# Fazer checkout na branch de destino
git checkout $2

# Atualizar a branch de destino
git pull origin $2
```

### 7. Fazer merge da branch do worktree

```bash
git merge <branch-do-worktree> --no-ff -m "Merge branch '<branch-do-worktree>' into $2"
```

Se houver conflitos, informe ao usuário e peça instruções de como resolver.

### 8. Push da branch de destino

```bash
git push origin $2
```

### 9. Resumo final

Ao finalizar, apresente um resumo:
- Branch do worktree: `<nome>`
- Branch de destino: `$2`
- Commits incluídos no merge
- Status do push

## Tratamento de erros

- Se o worktree não existir, informe o erro e liste os worktrees disponíveis com `git worktree list`
- Se houver conflitos no merge, pare e peça orientação ao usuário
- Se o push falhar, mostre o erro e sugira soluções

## Exemplo de uso

```
/worktree-merge .worktrees/feature-x main
```

Isso irá:
1. Commitar mudanças em `.worktrees/feature-x` com mensagem gerada automaticamente
2. Fazer push da branch do worktree
3. Fazer checkout em `main`
4. Fazer merge da branch do worktree em `main`
5. Fazer push de `main`
