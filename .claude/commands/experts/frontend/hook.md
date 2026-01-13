---
description: Criar ou modificar custom hooks React seguindo padroes do projeto
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Hook: Frontend Expert

## Proposito

Criar ou modificar custom hooks React seguindo os padroes estabelecidos no projeto.

## Padroes do Projeto

### Localizacao

Todos os hooks ficam em: `frontend/src/hooks/`

### Nomenclatura

- Prefixo `use` obrigatorio: `useNomeDoHook.ts`
- Nome descritivo da funcionalidade

### Template de Hook

```typescript
// frontend/src/hooks/useNomeDoHook.ts
import { useState, useEffect, useCallback, useMemo } from 'react'

// Options interface (se necessario)
interface UseNomeDoHookOptions {
  initialValue?: string
  enabled?: boolean
}

// Return interface (sempre definir)
interface UseNomeDoHookReturn {
  data: string
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useNomeDoHook(
  options: UseNomeDoHookOptions = {}
): UseNomeDoHookReturn {
  const { initialValue = '', enabled = true } = options

  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      // Logica de fetch
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
```

## Instrucoes

### Para CRIAR novo hook:

1. **Verifique se ja existe** hook similar
2. **Defina a interface de retorno** primeiro
3. **Implemente com tipagem estrita**
4. **Use useCallback** para funcoes retornadas
5. **Use useMemo** para valores computados caros

### Para MODIFICAR hook existente:

1. **Leia o hook atual** para entender interface
2. **Mantenha compatibilidade** com chamadas existentes
3. **Adicione novos parametros** como opcionais
4. **Atualize a interface de retorno** se necessario

## Categorias de Hooks no Projeto

### Data Fetching
- `useChat.ts` - Chat com AI
- `useDashboardMetrics.ts` - Metricas do dashboard

### WebSocket
- `useCardWebSocket.ts` - Updates de cards
- `useExecutionWebSocket.ts` - Logs de execucao

### Execucao
- `useAgentExecution.ts` - Workflow SDLC
- `useWorkflowAutomation.ts` - Automacao de fluxo

### UI/UX
- `useTheme.ts` - Dark/light mode
- `useToast.ts` - Notificacoes
- `useTooltip.ts` - Tooltips
- `useClickOutside.ts` - Detectar clique fora

### Persistencia
- `useDraft.ts` - Drafts em localStorage
- `useViewPersistence.ts` - View selecionada

### Animacao
- `useDiffAnimation.ts` - Animacao de diff

## Checklist de Qualidade

- [ ] TypeScript strict (sem `any`)
- [ ] Interface de retorno definida
- [ ] useCallback para funcoes
- [ ] useMemo para valores caros
- [ ] Cleanup em useEffect (se necessario)
- [ ] Tratamento de erros
- [ ] Loading state (se async)

## Solicitacao

$ARGUMENTS
