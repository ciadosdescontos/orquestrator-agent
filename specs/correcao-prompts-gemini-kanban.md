# Correção de Prompts do Gemini no Kanban

## 1. Resumo

Corrigir a integração do Gemini com o sistema kanban para garantir que os prompts sejam enviados corretamente no formato esperado pelos comandos /plan, /implement, /test-implementation e /review. Além disso, traduzir todas as instruções e mensagens do Gemini para português.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Ajustar formato dos prompts enviados ao Gemini para seguir exatamente o padrão dos comandos Claude
- [x] Implementar suporte completo ao Gemini em todas as etapas do workflow (plan, implement, test, review)
- [x] Traduzir todas as mensagens e instruções do Gemini para português
- [x] Garantir consistência no formato dos prompts entre Claude e Gemini

### Fora do Escopo
- Mudanças na interface do usuário
- Alterações no fluxo de trabalho existente
- Modificações no banco de dados

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/agent.py` | Modificar | Adicionar funções execute_*_gemini para implement, test e review |
| `backend/src/gemini_agent.py` | Modificar | Ajustar formatação de prompts para comandos específicos |
| `backend/src/services/gemini_service.py` | Modificar | Traduzir mensagens do sistema para português |

### Detalhes Técnicos

#### 1. Ajustar formato do prompt no execute_plan_gemini (backend/src/agent.py)

Atualmente:
```python
prompt = f"Create a detailed implementation plan for:\n\nTitle: {title}\nDescription: {description}"
```

Deve ser:
```python
# Formato correto para o comando /plan
prompt = f"/plan {title}: {description}"
if images:
    prompt += "\n\n[Imagens anexadas ao card estão disponíveis para análise]"
```

#### 2. Criar execute_implement_gemini (backend/src/agent.py)

```python
async def execute_implement_gemini(
    card_id: str,
    spec_path: str,
    cwd: str,
    model: str,
    images: Optional[list] = None,
    db_session: Optional[AsyncSession] = None,
) -> PlanResult:
    """Execute /implement usando Gemini CLI."""
    from .gemini_agent import GeminiAgent
    # ... código para obter worktree ...

    gemini = GeminiAgent(model=model)

    # Primeiro, ler o conteúdo do arquivo de spec
    spec_file = Path(cwd) / spec_path
    if spec_file.exists():
        spec_content = spec_file.read_text()
        # Formato correto: /implement seguido do conteúdo do plano
        prompt = f"/implement\n\n{spec_content}"
    else:
        prompt = f"/implement {spec_path}"

    if images:
        prompt += "\n\n[Imagens anexadas ao card estão disponíveis para análise]"

    # ... resto da implementação similar ao execute_plan_gemini ...
```

#### 3. Criar execute_test_implementation_gemini (backend/src/agent.py)

```python
async def execute_test_implementation_gemini(
    card_id: str,
    spec_path: str,
    cwd: str,
    model: str,
    images: Optional[list] = None,
    db_session: Optional[AsyncSession] = None,
) -> PlanResult:
    """Execute /test-implementation usando Gemini CLI."""
    from .gemini_agent import GeminiAgent
    # ... código para obter worktree ...

    gemini = GeminiAgent(model=model)

    # Ler o conteúdo do arquivo de spec
    spec_file = Path(cwd) / spec_path
    if spec_file.exists():
        spec_content = spec_file.read_text()
        prompt = f"/test-implementation\n\n{spec_content}"
    else:
        prompt = f"/test-implementation {spec_path}"

    if images:
        prompt += "\n\n[Imagens anexadas ao card estão disponíveis para análise]"

    # ... resto da implementação ...
```

#### 4. Criar execute_review_gemini (backend/src/agent.py)

```python
async def execute_review_gemini(
    card_id: str,
    spec_path: str,
    cwd: str,
    model: str,
    images: Optional[list] = None,
    db_session: Optional[AsyncSession] = None,
) -> PlanResult:
    """Execute /review usando Gemini CLI."""
    from .gemini_agent import GeminiAgent
    # ... código para obter worktree ...

    gemini = GeminiAgent(model=model)

    # Ler o conteúdo do arquivo de spec
    spec_file = Path(cwd) / spec_path
    if spec_file.exists():
        spec_content = spec_file.read_text()
        prompt = f"/review\n\n{spec_content}"
    else:
        prompt = f"/review {spec_path}"

    if images:
        prompt += "\n\n[Imagens anexadas ao card estão disponíveis para análise]"

    # ... resto da implementação ...
```

#### 5. Atualizar funções principais para detectar Gemini (backend/src/agent.py)

```python
async def execute_implement(
    card_id: str,
    spec_path: str,
    cwd: str,
    model: str = "opus-4.5",
    images: Optional[list] = None,
    db_session: Optional[AsyncSession] = None,
) -> PlanResult:
    """Execute /implement command with the spec file path."""
    # Detecta se é modelo Gemini
    if model.startswith("gemini"):
        return await execute_implement_gemini(
            card_id, spec_path, cwd, model, images, db_session
        )

    # ... código existente para Claude ...
```

Fazer o mesmo para `execute_test_implementation` e `execute_review`.

#### 6. Traduzir mensagens no GeminiService (backend/src/services/gemini_service.py)

Atualmente:
```python
full_prompt = f"""
{plan_context}

You are an AI assistant helping with software development tasks.
Current working directory: {cwd}

Command: {command}
{content}
"""
```

Deve ser:
```python
full_prompt = f"""
{plan_context}

Você é um assistente de IA ajudando com tarefas de desenvolvimento de software.
Diretório de trabalho atual: {cwd}

Comando: {command}
{content}
"""
```

#### 7. Ajustar formatação de mensagens no GeminiAgent (backend/src/gemini_agent.py)

Na função `_format_messages`:
```python
def _format_messages(self, messages: list[dict], system_prompt: Optional[str] = None) -> str:
    parts = []

    if system_prompt:
        parts.append(f"Sistema: {system_prompt}\n")  # Traduzir de "System" para "Sistema"

    for msg in messages:
        role = "Usuário" if msg["role"] == "user" else "Assistente"  # Traduzir roles
        parts.append(f"{role}: {msg['content']}\n")

    return "\n".join(parts)
```

#### 8. Mensagens de log em português (backend/src/agent.py)

Atualizar todas as mensagens de log das funções Gemini:
```python
add_log(record, LogType.INFO, f"Iniciando execução do plano com Gemini para: {title}")
add_log(record, LogType.INFO, f"Diretório de trabalho: {cwd}")
add_log(record, LogType.INFO, f"Execução do plano concluída com sucesso")
add_log(record, LogType.ERROR, f"Erro de execução: {error_message}")
```

---

## 4. Testes

### Unitários
- [x] Testar formatação de prompts para cada comando (/plan, /implement, /test-implementation, /review)
- [x] Verificar detecção correta de modelos Gemini
- [x] Validar leitura de arquivos de spec antes de enviar prompts

### Integração
- [x] Executar workflow completo com modelo Gemini
- [x] Verificar que prompts chegam no formato correto ao Gemini CLI
- [x] Confirmar que mensagens em português são exibidas corretamente
- [x] Testar com e sem imagens anexadas aos cards

---

## 5. Considerações

- **Riscos:**
  - Mudança no formato dos prompts pode afetar a qualidade das respostas do Gemini
  - Mitigação: Testar extensivamente com diferentes tipos de tarefas

- **Dependências:**
  - Gemini CLI deve estar instalado e configurado
  - Arquivos de spec devem existir no caminho especificado para implement/test/review

- **Compatibilidade:**
  - Manter compatibilidade com Claude mantendo a detecção por prefixo "gemini"
  - Garantir que ambos os provedores recebam prompts no formato esperado