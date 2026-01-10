## 1. Resumo

Integrar as métricas do painel (token usage, execution time, costs, insights) diretamente na aba Dashboard existente, mantendo total consistência com o design minimalista e dark theme atual. As novas métricas serão adicionadas como uma seção expandida dentro da HomePage, não como uma página separada.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Integrar métricas de token usage na HomePage dashboard
- [x] Adicionar seção de análise de custos por modelo
- [x] Incluir gráfico de tempo de execução
- [x] Adicionar painel de insights automáticos
- [x] Manter 100% de consistência visual com design existente
- [x] Usar os mesmos componentes MetricCard já existentes

### Fora do Escopo
- Criar nova página de métricas (já existe MetricsPage)
- Mudar estrutura de navegação
- Alterar design system existente
- Adicionar novas bibliotecas de gráficos

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/src/pages/HomePage.tsx` | Modificar | Adicionar novas seções de métricas integradas |
| `frontend/src/pages/HomePage.module.css` | Modificar | Estilos para novas seções mantendo consistência |
| `frontend/src/components/Dashboard/TokenUsagePanel.tsx` | Criar | Painel de uso de tokens com visual consistente |
| `frontend/src/components/Dashboard/CostBreakdown.tsx` | Criar | Breakdown de custos usando design existente |
| `frontend/src/components/Dashboard/ExecutionMetrics.tsx` | Criar | Métricas de execução com mesmo estilo |
| `frontend/src/components/Dashboard/InsightsPanel.tsx` | Criar | Painel de insights automáticos |
| `frontend/src/hooks/useDashboardMetrics.ts` | Criar | Hook para buscar métricas da API |

### Detalhes Técnicos

#### 1. Atualização da HomePage - Integração das Métricas

```typescript
// pages/HomePage.tsx - ADICIONAR após a seção de métricas principais existente

// Importar novos componentes
import TokenUsagePanel from '../components/Dashboard/TokenUsagePanel';
import CostBreakdown from '../components/Dashboard/CostBreakdown';
import ExecutionMetrics from '../components/Dashboard/ExecutionMetrics';
import InsightsPanel from '../components/Dashboard/InsightsPanel';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

// Dentro do componente HomePage, após os metrics existentes:
const {
  tokenData,
  costData,
  executionData,
  insights,
  isLoading: metricsLoading
} = useDashboardMetrics();

// Adicionar nova seção após a overviewSection existente:

{/* Enhanced Metrics Section - Manter mesmo estilo */}
<section className={styles.enhancedMetricsSection}>
  {/* Token Usage & Cost Analysis Row */}
  <div className={styles.metricsRow}>
    <div className={styles.tokenUsageColumn}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Token Usage</h2>
        <span className={styles.periodBadge}>Last 7 days</span>
      </div>
      <TokenUsagePanel data={tokenData} loading={metricsLoading} />
    </div>

    <div className={styles.costAnalysisColumn}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Cost Analysis</h2>
      </div>
      <CostBreakdown data={costData} loading={metricsLoading} />
    </div>
  </div>

  {/* Execution Metrics & Insights Row */}
  <div className={styles.metricsRow}>
    <div className={styles.executionColumn}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Execution Performance</h2>
      </div>
      <ExecutionMetrics data={executionData} loading={metricsLoading} />
    </div>

    {insights && insights.length > 0 && (
      <div className={styles.insightsColumn}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>AI Insights</h2>
          <span className={styles.insightCount}>{insights.length} new</span>
        </div>
        <InsightsPanel insights={insights} />
      </div>
    )}
  </div>
</section>
```

#### 2. TokenUsagePanel - Consistente com Design Existente

```typescript
// components/Dashboard/TokenUsagePanel.tsx
import styles from './TokenUsagePanel.module.css';

interface TokenUsagePanelProps {
  data: any;
  loading: boolean;
}

const TokenUsagePanel = ({ data, loading }: TokenUsagePanelProps) => {
  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  // Usar mesmo estilo de cards do MetricCard
  return (
    <div className={styles.panel}>
      {/* Mini gráfico simples usando CSS, não biblioteca externa */}
      <div className={styles.simpleChart}>
        {data?.map((item: any, idx: number) => (
          <div key={idx} className={styles.chartBar}>
            <div
              className={styles.barFill}
              style={{
                height: `${(item.tokens / maxTokens) * 100}%`,
                background: 'var(--accent-primary)'
              }}
            />
            <span className={styles.barLabel}>
              {item.day}
            </span>
          </div>
        ))}
      </div>

      {/* Stats summary com mesmo estilo */}
      <div className={styles.summary}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatNumber(totalTokens)}</span>
          <span className={styles.statLabel}>Total Tokens</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>${costEstimate}</span>
          <span className={styles.statLabel}>Est. Cost</span>
        </div>
      </div>
    </div>
  );
};
```

#### 3. CostBreakdown - Visual Minimalista

```typescript
// components/Dashboard/CostBreakdown.tsx
const CostBreakdown = ({ data, loading }: Props) => {
  return (
    <div className={styles.breakdown}>
      {/* Lista simples com barras de progresso */}
      {data?.models?.map((model: any) => (
        <div key={model.name} className={styles.modelRow}>
          <div className={styles.modelHeader}>
            <span className={styles.modelName}>{model.name}</span>
            <span className={styles.modelCost}>${model.cost}</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${model.percentage}%`,
                background: getModelColor(model.name)
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### 4. ExecutionMetrics - Consistência Visual

```typescript
// components/Dashboard/ExecutionMetrics.tsx
const ExecutionMetrics = ({ data, loading }: Props) => {
  return (
    <div className={styles.executionPanel}>
      {/* Grid de mini cards */}
      <div className={styles.statsGrid}>
        <div className={styles.miniCard}>
          <div className={styles.miniValue}>{avgTime}ms</div>
          <div className={styles.miniLabel}>Avg Time</div>
        </div>
        <div className={styles.miniCard}>
          <div className={styles.miniValue}>{p95Time}ms</div>
          <div className={styles.miniLabel}>P95 Time</div>
        </div>
        <div className={styles.miniCard}>
          <div className={styles.miniValue}>{successRate}%</div>
          <div className={styles.miniLabel}>Success</div>
        </div>
      </div>

      {/* Lista recente */}
      <div className={styles.recentList}>
        {data?.recent?.slice(0, 3).map((exec: any) => (
          <div key={exec.id} className={styles.execRow}>
            <span className={styles.execCommand}>{exec.command}</span>
            <span className={styles.execTime}>{exec.duration}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 5. CSS Consistente com Tema Existente

```css
/* HomePage.module.css - ADICIONAR */

.enhancedMetricsSection {
  margin-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.metricsRow {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Proporção para melhor leitura */
  gap: var(--space-6);
}

.tokenUsageColumn,
.costAnalysisColumn,
.executionColumn,
.insightsColumn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.periodBadge {
  /* Mesmo estilo do pipelineCount */
  font-size: 12px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.insightCount {
  /* Consistente com badges existentes */
  font-size: 12px;
  color: var(--accent-warning);
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Responsivo mantendo consistência */
@media (max-width: 1024px) {
  .metricsRow {
    grid-template-columns: 1fr;
  }
}
```

#### 6. Hook para Dados das Métricas

```typescript
// hooks/useDashboardMetrics.ts
import { useState, useEffect } from 'react';
import { metricsApi } from '../api/metrics';

export const useDashboardMetrics = () => {
  const [data, setData] = useState({
    tokenData: null,
    costData: null,
    executionData: null,
    insights: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Usar API existente de métricas
        const [tokens, costs, executions, insights] = await Promise.all([
          metricsApi.getTokenUsage('current', '7d'),
          metricsApi.getCostAnalysis('current', 'model'),
          metricsApi.getExecutionTimes('current'),
          metricsApi.getInsights('current'),
        ]);

        setData({
          tokenData: tokens,
          costData: costs,
          executionData: executions,
          insights: insights?.insights || [],
        });
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
    // Refresh a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return { ...data, isLoading };
};
```

---

## 4. Testes

### Unitários
- [x] Teste componente TokenUsagePanel com diferentes dados
- [x] Teste CostBreakdown com múltiplos modelos
- [x] Teste ExecutionMetrics com métricas vazias
- [x] Teste InsightsPanel com diferentes tipos de insights

### Integração
- [x] Teste integração com API de métricas existente
- [x] Teste refresh automático das métricas
- [x] Teste responsividade dos novos componentes

---

## 5. Considerações

### Design Consistency
- **IMPORTANTE**: Todos os novos componentes DEVEM usar as variáveis CSS existentes
- Manter mesma hierarquia tipográfica (font sizes, weights)
- Usar cores do tema dark existente (--bg-secondary, --border-default, etc)
- Seguir padrões de espaçamento (--space-*)
- Mesmos border-radius (--radius-*)

### Performance
- Reutilizar API de métricas já existente
- Cache de 30 segundos para evitar requests desnecessários
- Lazy loading para componentes pesados

### Riscos
- **Overload Visual**: Adicionar muita informação pode poluir o dashboard
- **Mitigação**: Usar progressive disclosure, mostrar apenas métricas essenciais

### Dependências
- API de métricas já existe e está funcional
- Componentes base (MetricCard) já implementados
- Sistema de cores e tema já definido