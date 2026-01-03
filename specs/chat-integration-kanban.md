## 1. Resumo

Expandir o produto kanban board existente adicionando uma funcionalidade de chat integrada, permitindo interações com IA diretamente na interface sem necessidade de usar o terminal. O chat será integrado ao layout existente, utilizando o **Claude Agent SDK** (não o SDK da Anthropic) para comunicação com modelos de IA através do comando `/question`, implementando gerenciamento de memória em runtime. O chat não requer API key pois usa a autenticação do Claude Code.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Adicionar interface de chat integrada ao layout do kanban board
- [x] Implementar comunicação com Claude Agent SDK no backend
- [x] Criar sistema de gerenciamento de conversas em memória
- [x] Manter consistência visual com o tema cosmic dark existente
- [x] Permitir alternância entre visualização do board e chat

### Fora do Escopo
- Sistema de persistência de conversas em banco de dados (será em memória)
- Múltiplas sessões de chat simultâneas
- Upload de arquivos no chat
- Histórico de conversas entre recarregamentos

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/types/chat.ts` | Criar | Tipos TypeScript para chat e mensagens |
| `frontend/src/components/Chat/Chat.tsx` | Criar | Componente principal do chat |
| `frontend/src/components/Chat/Chat.module.css` | Criar | Estilos do componente de chat |
| `frontend/src/components/Chat/ChatMessage.tsx` | Criar | Componente de mensagem individual |
| `frontend/src/components/Chat/ChatInput.tsx` | Criar | Componente de entrada de texto |
| `frontend/src/components/ChatToggle/ChatToggle.tsx` | Criar | Botão para abrir/fechar chat |
| `frontend/src/hooks/useChat.ts` | Criar | Hook para gerenciar estado do chat |
| `frontend/src/api/chat.ts` | Criar | API client para endpoints de chat |
| `frontend/src/App.tsx` | Modificar | Integrar componente de chat no layout |
| `frontend/src/App.module.css` | Modificar | Ajustar layout para acomodar chat |
| `backend/src/routes/chat.py` | Criar | Rotas da API de chat |
| `backend/src/services/chat_service.py` | Criar | Serviço para gerenciar conversas |
| `backend/src/schemas/chat.py` | Criar | Schemas Pydantic para chat |
| `backend/src/agent_chat.py` | Criar | Integração com Claude Agent SDK |
| `backend/src/main.py` | Modificar | Registrar rotas de chat |

### Detalhes Técnicos

#### 1. Tipos do Chat (frontend/src/types/chat.ts)
```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  isOpen: boolean;
  session: ChatSession | null;
  isLoading: boolean;
  error: string | null;
}
```

#### 2. Layout Integrado
O chat será implementado como um painel lateral retrátil no lado direito da tela:
- Largura: 400px quando aberto
- Animação suave de slide
- Botão flutuante de toggle no canto inferior direito
- Mantém tema cosmic dark com glassmorphism

#### 3. Backend Chat Service
```python
# backend/src/agent_chat.py
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock, ResultMessage
from pathlib import Path

class ClaudeAgentChat:
    async def stream_response(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        """Stream response using /question command from Claude Agent SDK"""
        # Get last user message
        user_message = messages[-1]["content"] if messages else ""

        # Execute /question command
        prompt = f"/question {user_message}"

        # Configure agent options
        options = ClaudeAgentOptions(
            cwd=Path.cwd(),
            setting_sources=["user", "project"],  # Load /question from .claude/commands/
            allowed_tools=["Read", "Bash", "Glob", "Grep", "Skill"],
            permission_mode="bypassPermissions",
            model="sonnet",
        )

        # Stream response
        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        yield block.text
            elif isinstance(message, ResultMessage):
                if hasattr(message, "result"):
                    yield message.result
```

#### 4. API Streaming Endpoint
```python
# backend/src/routes/chat.py
from fastapi import APIRouter, WebSocket
from ..services.chat_service import ChatService

router = APIRouter(prefix="/api/chat")
chat_service = ChatService()

@router.websocket("/ws/{session_id}")
async def chat_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            async for chunk in chat_service.send_message(session_id, message):
                await websocket.send_text(chunk)
    except WebSocketDisconnect:
        pass
```

#### 5. Frontend Chat Hook
```typescript
// frontend/src/hooks/useChat.ts
export function useChat() {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    session: null,
    isLoading: false,
    error: null
  });

  const ws = useRef<WebSocket | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!ws.current) {
      ws.current = new WebSocket(`ws://localhost:3001/api/chat/ws/${sessionId}`);
    }
    ws.current.send(content);
  }, [sessionId]);

  return { state, sendMessage, toggleChat };
}
```

#### 6. Integração no Layout Principal
```tsx
// App.tsx modifications
<div className={styles.appContainer}>
  <div className={styles.mainContent}>
    {/* Existing kanban board */}
    <Board ... />
  </div>

  {/* Chat Panel */}
  <Chat
    isOpen={chatState.isOpen}
    onClose={() => setChatOpen(false)}
  />

  {/* Chat Toggle Button */}
  <ChatToggle
    isOpen={chatState.isOpen}
    onClick={() => setChatOpen(!chatState.isOpen)}
  />
</div>
```

---

## 4. Testes

### Unitários
- [ ] Teste do ChatService para gerenciamento de sessões
- [ ] Teste do hook useChat para estados e transições
- [ ] Teste de renderização dos componentes de chat

### Integração
- [ ] Teste de WebSocket connection e messaging
- [ ] Teste de streaming de respostas do Claude Agent SDK
- [ ] Teste de sincronização de estado entre frontend e backend

### E2E
- [ ] Fluxo completo: abrir chat → enviar mensagem → receber resposta
- [ ] Teste de múltiplas mensagens em sequência
- [ ] Teste de tratamento de erros e reconexão

---

## 5. Considerações

### Performance
- **Streaming**: Implementar streaming de respostas para melhor UX
- **Debounce**: Adicionar debounce no input para evitar requisições excessivas
- **Lazy Loading**: Carregar componente de chat apenas quando necessário

### UX/UI
- **Responsividade**: Chat deve funcionar bem em telas menores (overlay em mobile)
- **Atalhos**: Implementar atalho de teclado (Cmd+K) para abrir/fechar chat
- **Indicadores**: Mostrar typing indicator enquanto aguarda resposta

### Segurança
- **Sem API Key**: Usa autenticação do Claude Code (mais seguro)
- **Rate Limiting**: Implementar limite de requisições por sessão
- **Sanitização**: Sanitizar conteúdo HTML nas mensagens
- **Validação**: Validar tamanho máximo de mensagens
- **Permissões**: Usa `bypassPermissions` apenas para operações de leitura (Read, Bash, Glob, Grep)

### Evolução Futura
- Persistência de conversas em banco de dados
- Múltiplas sessões/abas de chat
- Integração com cards do kanban (mencionar/referenciar cards)
- Export de conversas
- Suporte a markdown e code highlighting nas respostas