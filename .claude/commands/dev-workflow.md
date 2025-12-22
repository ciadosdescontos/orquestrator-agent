---
description: Workflow completo de desenvolvimento (plan → implement → test → review). Use para features ou bugs.
argument-hint: [descrição da feature ou bug]
---

# Dev Workflow

Execute o workflow completo de desenvolvimento para: $ARGUMENTS

## Validação

1. Se `$ARGUMENTS` estiver vazio, pergunte ao usuário o que deseja implementar antes de continuar

## Workflow

Execute as seguintes etapas **sequencialmente**, aguardando conclusão de cada uma:

### 1. Planejamento

- Execute o fluxo do comando `/plan` com: $ARGUMENTS
- Salve o plano em `specs/<nome_descritivo>.md`
- Armazene o caminho do arquivo para uso nas próximas etapas
- **Pergunte:** "Plano criado. Deseja prosseguir para a implementação?"

### 2. Implementação

- Execute o fluxo do comando `/implement` com o arquivo de spec criado
- Implemente todos os itens do plano
- Atualize checkboxes no arquivo de spec
- **Pergunte:** "Implementação concluída. Deseja prosseguir para os testes?"

### 3. Testes

- Execute o fluxo do comando `/test-implementation` referenciando o spec
- Implemente e execute os testes definidos no plano
- Corrija falhas se necessário
- **Pergunte:** "Testes finalizados. Deseja prosseguir para a revisão?"

### 4. Revisão

- Execute o fluxo do comando `/review` nas mudanças realizadas
- Identifique melhorias e problemas
- Sugira correções se necessário

## Finalização

Apresente resumo:
- Feature/Bug trabalhado
- Arquivos modificados/criados
- Status dos testes
- Resultado da revisão
- Próximos passos sugeridos (PR, code review, etc.)

## Regras

- Sempre pergunte antes de avançar para a próxima etapa
- Se o usuário disser "não" em qualquer checkpoint, encerre e informe o progresso
- Mantenha transparência sobre o que está sendo feito em cada etapa
