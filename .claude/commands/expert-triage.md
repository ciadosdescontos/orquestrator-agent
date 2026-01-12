---
description: Identifica experts relevantes para um card usando raciocinio AI. Analisa titulo e descricao contra knowledge bases dos experts disponiveis.
argument-hint: <cardId> <title> [description]
allowed-tools: Read, Glob
model: haiku
---

# Expert Triage

Analise o card e identifique quais experts sao relevantes para a tarefa usando raciocinio semantico.

## Input

Os argumentos sao passados no formato: `<cardId> <title> [description]`

Argumentos recebidos: $ARGUMENTS

## Instrucoes

### 1. Descobrir Experts Disponiveis

Use Glob para encontrar todos os experts:
```
.claude/commands/experts/*/KNOWLEDGE.md
```

O ID do expert e o nome do diretorio pai (ex: `database`, `kanban-flow`).

### 2. Ler Knowledge Base de Cada Expert

Para cada KNOWLEDGE.md encontrado:
- Leia o conteudo completo
- Entenda o **dominio** do expert (o que ele sabe fazer)
- Identifique os **arquivos** e **tecnologias** que ele domina
- Entenda quais **tipos de tarefas** ele pode ajudar

### 3. Analisar Relevancia

Compare o card (titulo + descricao) com cada expert:

**Perguntas a fazer:**
- O card menciona tecnologias/arquivos do dominio do expert?
- A tarefa vai impactar areas que o expert domina?
- O conhecimento do expert seria util para planejar/implementar esta tarefa?
- Qual a probabilidade de precisar consultar este expert?

**Use raciocinio semantico, NAO apenas keywords!**

Exemplos de raciocinio:
- "adicionar campo no card" → expert database (model, migration) E kanban-flow (UI do card)
- "corrigir bug no drag and drop" → expert kanban-flow (Board, Column components)
- "otimizar queries SQL" → expert database (repositories, queries)

### 4. Determinar Confidence

- `high`: Card **claramente** afeta dominio do expert. Certeza de que o expert sera necessario.
- `medium`: Card **provavelmente** afeta dominio do expert. Boas chances de precisar do expert.
- `low`: Card **pode** afetar dominio do expert. Possibilidade menor mas existe.

### 5. Gerar Output

**IMPORTANTE:** Retorne APENAS o bloco JSON abaixo, sem texto adicional antes ou depois.

Se nenhum expert for relevante, retorne `"experts": {}`.

## Output Format

```json
{
  "cardId": "<card_id dos argumentos>",
  "experts": {
    "<expert_id>": {
      "reason": "<explicacao em portugues de por que este expert e relevante - seja especifico sobre o que no card indica relevancia>",
      "confidence": "high|medium|low",
      "identified_at": "<ISO timestamp atual>",
      "matched_keywords": []
    }
  }
}
```

## Regras

1. **SEMPRE** retorne o JSON no formato especificado
2. **NAO** inclua experts que nao sao relevantes (confidence muito baixa)
3. A razao deve ser **especifica**, explicando exatamente o que no card indica relevancia
4. Use **raciocinio semantico**, entendendo o significado, nao apenas procurando palavras
5. Se o card for muito generico e nenhum expert for claramente relevante, retorne experts vazio
6. O output deve ser **apenas** o bloco JSON, nada mais
