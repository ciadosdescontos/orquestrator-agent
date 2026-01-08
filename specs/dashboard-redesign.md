# Dashboard Redesign - Visual Premium e Correção de Contadores

## 1. Resumo

Redesenhar completamente a tela de dashboard para ter uma aparência mais profissional e sofisticada, utilizando a skill frontend-design para criar um design premium. Além disso, corrigir o bug nos contadores que não estão funcionando corretamente (especialmente o contador "Em Progresso" que está buscando a coluna errada).

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Redesenhar o dashboard com visual premium e sofisticado
- [x] Corrigir bug do contador "Em Progresso" (está buscando 'in-progress' mas deveria buscar 'implement')
- [x] Implementar novo design system mais moderno
- [x] Adicionar animações e micro-interações elegantes
- [x] Criar visualizações de dados mais profissionais
- [x] Melhorar a hierarquia visual e tipografia

### Fora do Escopo
- Mudanças na funcionalidade do Kanban
- Alterações no sistema de chat
- Modificações no backend

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/HomePage.tsx` | Modificar | Redesenhar completamente o componente com novo layout e corrigir contadores |
| `frontend/src/pages/HomePage.module.css` | Modificar | Novo design system com visual premium |
| `frontend/src/components/Dashboard/MetricCard.tsx` | Criar | Componente de card de métrica premium |
| `frontend/src/components/Dashboard/MetricCard.module.css` | Criar | Estilos do card de métrica |
| `frontend/src/components/Dashboard/ActivityFeed.tsx` | Criar | Feed de atividades recentes |
| `frontend/src/components/Dashboard/ProgressChart.tsx` | Criar | Gráfico de progresso visual |
| `frontend/src/styles/dashboard-theme.css` | Criar | Tema específico para o dashboard |

### Detalhes Técnicos

#### 1. Correção dos Contadores

O problema atual está na função que conta cards por coluna:

```typescript
// ATUAL (INCORRETO)
inProgress: getCountByColumn('in-progress'), // Esta coluna não existe!

// CORRETO - Deve somar implement + test + review
inProgress:
  getCountByColumn('implement') +
  getCountByColumn('test') +
  getCountByColumn('review'),
```

#### 2. Novo Sistema de Métricas

```typescript
const metrics = useMemo(() => {
  const getCountByColumn = (columnId: ColumnId) =>
    cards.filter((card) => card.columnId === columnId).length;

  // Métricas principais
  const backlog = getCountByColumn('backlog');
  const planning = getCountByColumn('plan');
  const implementing = getCountByColumn('implement');
  const testing = getCountByColumn('test');
  const reviewing = getCountByColumn('review');
  const done = getCountByColumn('done');
  const archived = getCountByColumn('archived');
  const cancelled = getCountByColumn('cancelado');

  // Métricas derivadas
  const inProgress = implementing + testing + reviewing;
  const total = cards.length;
  const activeCards = total - archived - cancelled;
  const completionRate = activeCards > 0 ? (done / activeCards) * 100 : 0;
  const velocity = calculateVelocity(cards); // últimos 7 dias

  return {
    backlog,
    planning,
    inProgress,
    done,
    total,
    activeCards,
    completionRate,
    velocity,
    // Detalhamento
    implementing,
    testing,
    reviewing,
    archived,
    cancelled,
  };
}, [cards]);
```

#### 3. Estrutura do Novo Dashboard

```typescript
// Seções principais do dashboard
1. Hero Section - Boas-vindas personalizadas com hora do dia
2. Key Metrics - Cards grandes com métricas principais e tendências
3. Progress Overview - Visualização gráfica do pipeline
4. Quick Actions - Ações rápidas com design premium
5. Activity Feed - Timeline de atividades recentes
6. Performance Insights - Insights baseados em dados
```

#### 4. Design Visual Premium

Utilizar a skill `frontend-design` para criar:
- Gradientes sutis e elegantes
- Cards com glassmorphism refinado
- Animações suaves com framer-motion
- Micro-interações em hover
- Tipografia hierárquica clara
- Grid system responsivo
- Dark mode nativo
- Ícones personalizados (não emojis)

#### 5. Componentes Visuais

```typescript
// MetricCard Premium
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number; // Percentual de mudança
  trendPeriod?: string;
  icon: React.ComponentType;
  color: string;
  subtitle?: string;
  sparkline?: number[]; // Mini gráfico
}

// Progress Pipeline Visualization
interface PipelineVisualizationProps {
  stages: {
    name: string;
    count: number;
    color: string;
  }[];
  animated?: boolean;
}

// Activity Timeline
interface ActivityItemProps {
  type: 'card_moved' | 'card_created' | 'card_completed';
  title: string;
  timestamp: Date;
  details?: string;
}
```

---

## 4. Testes

### Unitários
- [x] Teste correção do contador "Em Progresso"
- [x] Teste cálculo de métricas derivadas
- [x] Teste responsividade dos componentes
- [x] Teste dark mode

### Integração
- [x] Verificar carregamento correto dos dados
- [x] Testar navegação entre módulos
- [x] Validar performance com muitos cards

### Visual
- [x] Testar em diferentes resoluções
- [x] Validar contraste e acessibilidade
- [x] Verificar consistência visual

---

## 5. Considerações

### Melhorias Visuais Específicas
- **Remover emojis**: Substituir por ícones SVG profissionais (Heroicons, Lucide, etc)
- **Cores**: Usar paleta mais sofisticada com tons neutros e accent colors sutis
- **Espaçamento**: Aumentar white space para look mais clean
- **Tipografia**: Usar font stack premium (Inter, SF Pro, etc)
- **Animações**: Implementar transições suaves e naturais

### Performance
- Implementar React.memo para componentes pesados
- Lazy loading para gráficos
- Virtualização se houver muitos dados

### Acessibilidade
- Garantir WCAG AA compliance
- Adicionar ARIA labels
- Suporte a keyboard navigation

### Riscos
- **Performance**: Muitas animações podem impactar performance
- **Mitigação**: Usar CSS transforms, will-change, e throttling

### Dependências
- Utilizar skill `frontend-design` para garantir design premium
- Possível necessidade de biblioteca de gráficos (recharts, visx)
- Biblioteca de ícones profissionais