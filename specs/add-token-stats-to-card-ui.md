## 1. Resumo

Adicionar estatísticas de tokens gastos na interface do card no Kanban, mostrando o total de tokens consumidos em todas as etapas (Plan, Implement, Test, Review). Isso permitirá aos usuários visualizar o custo computacional de cada card diretamente na UI.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Capturar informações de token usage durante execuções do agente
- [x] Armazenar dados de tokens no banco de dados por execução
- [x] Calcular e exibir total de tokens por card na UI
- [ ] Mostrar breakdown de tokens por etapa quando disponível

### Fora do Escopo
- Cálculo de custos monetários (apenas contagem de tokens)
- Histórico detalhado de consumo ao longo do tempo
- Comparação entre diferentes modelos de IA

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/models/execution.py` | ✅ Modificar | Adicionar campos para token usage (input_tokens, output_tokens, total_tokens) |
| `backend/src/database_manager.py` | ✅ Modificar | Criar migration para novos campos de tokens |
| `backend/src/agent.py` | ✅ Modificar | Capturar token usage do Claude SDK e Gemini |
| `backend/src/repositories/execution_repository.py` | ✅ Modificar | Adicionar métodos para salvar e agregar tokens |
| `backend/src/routes/cards.py` | ✅ Modificar | Incluir token stats nas respostas da API |
| `frontend/src/types/index.ts` | ✅ Modificar | Adicionar tipos para token statistics |
| `frontend/src/components/Card/Card.tsx` | ✅ Modificar | Exibir token stats na UI do card |
| `frontend/src/components/Card/Card.module.css` | ✅ Modificar | Estilizar exibição de tokens |

### Detalhes Técnicos

#### 1. Modelo de Dados (Backend)

```python
# backend/src/models/execution.py
class Execution(Base):
    # ... campos existentes ...

    # Novos campos para token tracking
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    model_used = Column(String, nullable=True)  # Para rastrear qual modelo foi usado
```

#### 2. Captura de Tokens no Agent

```python
# backend/src/agent.py
# Para Claude SDK - verificar se ResultMessage tem usage info
async for message in query(prompt=prompt, options=options):
    if isinstance(message, ResultMessage):
        # Verificar se há informações de usage
        if hasattr(message, 'usage'):
            token_usage = {
                'input_tokens': message.usage.input_tokens,
                'output_tokens': message.usage.output_tokens,
                'total_tokens': message.usage.total_tokens
            }
            # Salvar no banco via repository

# Para Gemini - pode precisar de API adicional ou estimativa
```

#### 3. Agregação de Tokens por Card

```python
# backend/src/repositories/execution_repository.py
async def get_token_stats_for_card(self, card_id: str) -> dict:
    """Retorna estatísticas agregadas de tokens para um card."""
    result = await self.session.execute(
        select(
            func.sum(Execution.input_tokens).label('total_input'),
            func.sum(Execution.output_tokens).label('total_output'),
            func.sum(Execution.total_tokens).label('total_tokens'),
            func.count(Execution.id).label('execution_count')
        ).where(Execution.card_id == card_id)
    )
    return result.first()._asdict()
```

#### 4. Interface TypeScript

```typescript
// frontend/src/types/index.ts
export interface TokenStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  executionCount: number;
  breakdown?: {
    plan?: number;
    implement?: number;
    test?: number;
    review?: number;
  };
}

export interface Card {
  // ... campos existentes ...
  tokenStats?: TokenStats;
}
```

#### 5. Componente UI

```tsx
// frontend/src/components/Card/Card.tsx
// Adicionar seção de token stats no card
{card.tokenStats && (
  <div className={styles.tokenStats}>
    <div className={styles.tokenBadge}>
      <span className={styles.tokenIcon}>🪙</span>
      <span className={styles.tokenCount}>
        {card.tokenStats.totalTokens.toLocaleString()} tokens
      </span>
    </div>
    {/* Opcional: mostrar breakdown em tooltip */}
  </div>
)}
```

#### 6. Estilos CSS

```css
/* Card.module.css */
.tokenStats {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.tokenBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--token-bg, #f0f9ff);
  border-radius: 12px;
  font-size: 12px;
  color: var(--token-color, #0369a1);
}

.tokenIcon {
  font-size: 14px;
}
```

---

## 4. Testes

### Unitários
- [ ] Teste de captura de token usage do Claude SDK
- [ ] Teste de agregação de tokens por card
- [ ] Teste de serialização de token stats na API

### Integração
- [ ] Teste de fluxo completo: executar comando → capturar tokens → exibir na UI
- [ ] Verificar que cards sem execuções não mostram token stats
- [ ] Verificar acumulação correta entre múltiplas execuções

---

## 5. Considerações

- **Compatibilidade**: Nem todos os modelos/providers podem fornecer informações de token usage. Implementar graceful degradation.
- **Performance**: Agregação de tokens deve ser feita de forma eficiente, possivelmente com cache.
- **Estimativa**: Para modelos que não fornecem token count, considerar usar bibliotecas de estimativa como tiktoken.
- **Migration**: Cuidado ao adicionar campos ao banco - cards existentes terão valores null inicialmente.