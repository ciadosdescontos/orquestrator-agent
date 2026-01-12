# Skill: Criar Cards via Chat

## 1. Resumo

Implementar uma Skill do Claude Code que permite ao chat criar cards no Kanban automaticamente. Quando o usuário pedir para criar uma tarefa, card ou adicionar algo ao backlog, o Claude detectará a intenção pela descrição da skill e executará o comando curl para criar o card via API.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar skill `kanban-card` em `.claude/skills/kanban-card/SKILL.md`
- [x] Skill deve instruir Claude a extrair título e descrição da mensagem
- [x] Usar curl para chamar `POST http://localhost:8000/api/cards`
- [x] Skill deve ser detectada automaticamente pelo Agent SDK (já usa `setting_sources=["user", "project"]`)

### Fora do Escopo
- Hooks programáticos (podem ser adicionados posteriormente)
- Outras operações como mover, deletar, editar cards (futuro)
- Integração com WebSocket para notificação em tempo real

---

## 3. Implementação

### Arquivos a Serem Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `.claude/skills/kanban-card/SKILL.md` | Criar | Skill principal com instruções para criar cards |

### Detalhes Técnicos

#### Estrutura da Skill

A skill seguirá o padrão existente no projeto (analisado em `meta-command/SKILL.md`):

```yaml
---
name: kanban-card
description: Cria cards no Kanban board. Use quando usuário pedir para criar tarefa, card, ticket, issue, ou adicionar algo ao backlog.
allowed-tools: Bash
---
```

#### API de Criação de Cards

Endpoint: `POST http://localhost:8000/api/cards`

**Body mínimo (apenas campos obrigatórios):**
```json
{
  "title": "Título do card"
}
```

**Body completo (com campos opcionais):**
```json
{
  "title": "Título do card",
  "description": "Descrição detalhada",
  "modelPlan": "opus-4.5",
  "modelImplement": "opus-4.5",
  "modelTest": "opus-4.5",
  "modelReview": "opus-4.5"
}
```

**Resposta de sucesso (201):**
```json
{
  "success": true,
  "card": {
    "id": "uuid-gerado",
    "title": "Título do card",
    "columnId": "backlog",
    "createdAt": "2024-01-11T...",
    ...
  }
}
```

#### Comando curl a ser usado

```bash
curl -s -X POST http://localhost:8000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"title": "TITULO", "description": "DESCRICAO"}'
```

#### Instruções da Skill

A skill deve instruir o Claude a:

1. **Extrair título**: Identificar o que o usuário quer criar
2. **Extrair descrição**: Se houver detalhes adicionais
3. **Executar curl**: Criar o card via API
4. **Confirmar**: Informar ao usuário que o card foi criado

#### Fluxo de Detecção

```
Usuário: "Cria um card para implementar autenticação JWT"
                    ↓
Claude detecta que Skill "kanban-card" casa com a intenção
(pela description: "criar tarefa, card, ticket...")
                    ↓
Claude carrega SKILL.md e segue instruções
                    ↓
Claude extrai: title="Implementar autenticação JWT"
                    ↓
Claude executa: curl POST /api/cards
                    ↓
Claude confirma: "Card criado com sucesso no backlog!"
```

### Conteúdo do SKILL.md

```markdown
---
name: kanban-card
description: Cria cards no Kanban board. Use quando usuário pedir para criar tarefa, card, ticket, issue, ou adicionar algo ao backlog.
allowed-tools: Bash
---

# Kanban Card Creator

## Propósito

Criar cards no Kanban board através do chat. Quando o usuário pedir para criar uma tarefa, issue, ticket ou card, extraia as informações e crie via API.

## Quando usar

- Usuário pede para "criar um card"
- Usuário pede para "adicionar uma tarefa"
- Usuário pede para "criar um ticket/issue"
- Usuário menciona algo que precisa ser feito no backlog

## Instruções

### 1. Extrair informações da mensagem

Do pedido do usuário, extraia:
- **Título**: O que será feito (obrigatório)
- **Descrição**: Detalhes adicionais se houver (opcional)

### 2. Criar o card via API

Execute o seguinte comando, substituindo os valores:

\`\`\`bash
curl -s -X POST http://localhost:8000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"title": "TITULO_AQUI", "description": "DESCRICAO_AQUI"}'
\`\`\`

Se não houver descrição, omita o campo:

\`\`\`bash
curl -s -X POST http://localhost:8000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"title": "TITULO_AQUI"}'
\`\`\`

### 3. Confirmar ao usuário

Após executar, informe:
- Que o card foi criado
- O título do card
- Que está no backlog

## Exemplos

### Exemplo 1: Pedido simples
**Usuário**: "Cria um card para implementar login"
**Ação**: Extrair título "Implementar login"
**Comando**:
\`\`\`bash
curl -s -X POST http://localhost:8000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"title": "Implementar login"}'
\`\`\`

### Exemplo 2: Com descrição
**Usuário**: "Adiciona uma tarefa para corrigir o bug de timeout na API. O problema acontece quando a conexão demora mais de 30s"
**Ação**: Extrair título e descrição
**Comando**:
\`\`\`bash
curl -s -X POST http://localhost:8000/api/cards \
  -H "Content-Type: application/json" \
  -d '{"title": "Corrigir bug de timeout na API", "description": "O problema acontece quando a conexão demora mais de 30s"}'
\`\`\`

### Exemplo 3: Múltiplos cards
**Usuário**: "Cria 3 cards: autenticação, dashboard e relatórios"
**Ação**: Executar 3 comandos curl separados

## Notas

- O card sempre é criado na coluna "backlog"
- Os modelos padrão (opus-4.5) são usados automaticamente
- A API retorna o ID do card criado na resposta
```

---

## 4. Testes

### Manuais
- [ ] Enviar mensagem "Cria um card para X" no chat
- [ ] Verificar se a skill é detectada automaticamente
- [ ] Verificar se o card aparece no Kanban board
- [ ] Testar com e sem descrição
- [ ] Testar pedido de múltiplos cards

### Validação da Skill
- [x] Verificar sintaxe YAML do frontmatter
- [x] Confirmar que `allowed-tools: Bash` permite execução do curl
- [x] Verificar que `setting_sources=["user", "project"]` carrega a skill

---

## 5. Considerações

### Pré-requisitos
- Backend rodando em `http://localhost:8000`
- Agent SDK configurado com `setting_sources=["user", "project"]` (já está)

### Limitações conhecidas
- Skill usa `localhost:8000` - em produção precisaria de URL configurável
- Não há validação de resposta da API (assume sucesso)

### Evolução futura
- Adicionar hooks para logging/notificação
- Criar skills para mover, editar, deletar cards
- Suporte a configurar modelos diferentes por card
