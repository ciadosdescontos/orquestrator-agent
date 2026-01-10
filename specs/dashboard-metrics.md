# Dashboard de Métricas por Projeto

## 1. Resumo

Implementar um dashboard completo de métricas por projeto, incluindo análise de consumo de tokens (total, por dia, por horário), tempo de execução dos cards (em milissegundos), custos estimados, e outras métricas relevantes para análise de desempenho e otimização do uso de IA no desenvolvimento.

---

## 2. Objetivos e Escopo

### Objetivos
- [x] Criar sistema de coleta e agregação de métricas por projeto
- [x] Implementar dashboard de visualização com gráficos interativos
- [x] Adicionar análise de consumo de tokens (total, diário, por hora)
- [x] Implementar tracking de tempo de execução por card
- [x] Criar análise de custos estimados por modelo/execução
- [x] Adicionar métricas de produtividade e velocidade
- [x] Implementar filtros temporais e por tipo de execução
- [ ] Criar exportação de relatórios em CSV/PDF

### Fora do Escopo
- Integração com ferramentas externas de analytics
- Métricas de código gerado (qualidade, complexidade)
- Dashboard público/compartilhável

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/models/metrics.py` | Criar | Modelos para armazenamento de métricas |
| `backend/src/repositories/metrics_repository.py` | Criar | Repository para operações de métricas |
| `backend/src/services/metrics_aggregator.py` | Criar | Serviço de agregação de métricas |
| `backend/src/routes/metrics.py` | Criar | Endpoints da API de métricas |
| `frontend/src/pages/MetricsPage.tsx` | Criar | Página principal do dashboard de métricas |
| `frontend/src/components/Metrics/TokenUsageChart.tsx` | Criar | Gráfico de uso de tokens |
| `frontend/src/components/Metrics/ExecutionTimeChart.tsx` | Criar | Gráfico de tempo de execução |
| `frontend/src/components/Metrics/CostAnalysis.tsx` | Criar | Análise de custos |
| `frontend/src/components/Metrics/ProductivityMetrics.tsx` | Criar | Métricas de produtividade |
| `frontend/src/api/metrics.ts` | Criar | Cliente API para métricas |
| `frontend/src/types/metrics.ts` | Criar | Tipos TypeScript para métricas |
| `backend/src/services/metrics_collector.py` | Criar | Coletor automático de métricas |

### Detalhes Técnicos

#### 1. Estrutura de Dados - Backend

```python
# models/metrics.py
class ProjectMetrics(Base):
    __tablename__ = "project_metrics"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"))

    # Métricas de Tokens
    total_input_tokens = Column(Integer, default=0)
    total_output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    # Métricas de Tempo
    avg_execution_time_ms = Column(Integer)  # Tempo médio em ms
    min_execution_time_ms = Column(Integer)
    max_execution_time_ms = Column(Integer)
    total_execution_time_ms = Column(BigInteger)

    # Métricas de Custo
    total_cost_usd = Column(Numeric(10, 6))
    cost_by_model = Column(JSON)  # {"opus-4.5": 12.50, "sonnet-4.5": 8.30}

    # Métricas de Produtividade
    cards_completed = Column(Integer, default=0)
    cards_in_progress = Column(Integer, default=0)
    success_rate = Column(Float)  # Percentual de execuções bem-sucedidas

    # Agregações Temporais
    metrics_date = Column(Date)
    metrics_hour = Column(Integer)  # 0-23 para agregação por hora

    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class ExecutionMetrics(Base):
    __tablename__ = "execution_metrics"

    id = Column(String, primary_key=True)
    execution_id = Column(String, ForeignKey("executions.id"))
    card_id = Column(String, ForeignKey("cards.id"))
    project_id = Column(String, ForeignKey("projects.id"))

    # Detalhes da Execução
    command = Column(String)  # /plan, /implement, /test, /review
    model_used = Column(String)

    # Métricas de Tempo
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_ms = Column(Integer)  # Duração em milissegundos

    # Métricas de Tokens
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    total_tokens = Column(Integer)

    # Métricas de Custo
    estimated_cost_usd = Column(Numeric(10, 6))

    # Status
    status = Column(String)  # success, error, cancelled
    error_message = Column(Text, nullable=True)
```

#### 2. API Endpoints

```python
# routes/metrics.py
@router.get("/metrics/project/{project_id}")
async def get_project_metrics(
    project_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    granularity: Literal["hour", "day", "week", "month"] = Query("day"),
    db: AsyncSession = Depends(get_db)
):
    """Retorna métricas agregadas do projeto."""

@router.get("/metrics/tokens/{project_id}")
async def get_token_usage(
    project_id: str,
    period: Literal["24h", "7d", "30d", "all"] = Query("7d"),
    group_by: Literal["hour", "day", "model"] = Query("day"),
    db: AsyncSession = Depends(get_db)
):
    """Retorna uso de tokens agregado por período."""

@router.get("/metrics/execution-time/{project_id}")
async def get_execution_times(
    project_id: str,
    command: Optional[str] = Query(None),
    limit: int = Query(100),
    db: AsyncSession = Depends(get_db)
):
    """Retorna tempos de execução por card/comando."""

@router.get("/metrics/costs/{project_id}")
async def get_cost_analysis(
    project_id: str,
    group_by: Literal["model", "command", "day"] = Query("model"),
    db: AsyncSession = Depends(get_db)
):
    """Retorna análise de custos detalhada."""
```

#### 3. Serviço de Agregação de Métricas

```python
# services/metrics_aggregator.py
class MetricsAggregator:
    async def aggregate_hourly_metrics(self, project_id: str):
        """Agrega métricas por hora para análise de padrões."""

    async def calculate_token_trends(self, project_id: str, days: int = 7):
        """Calcula tendências de uso de tokens."""
        # - Média móvel
        # - Picos de uso
        # - Projeções

    async def analyze_execution_performance(self, project_id: str):
        """Analisa performance de execuções."""
        # - P50, P95, P99 de tempo de execução
        # - Outliers
        # - Comparação entre modelos

    async def calculate_roi_metrics(self, project_id: str):
        """Calcula métricas de ROI."""
        # - Custo por card completado
        # - Economia de tempo estimada
        # - Eficiência por modelo
```

#### 4. Frontend - Componentes de Visualização

```typescript
// types/metrics.ts
export interface ProjectMetrics {
  projectId: string;
  totalTokens: number;
  totalCost: number;
  averageExecutionTime: number;
  successRate: number;
  cardsCompleted: number;
  period: string;
}

export interface TokenUsageData {
  timestamp: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model?: string;
}

export interface ExecutionTimeData {
  cardId: string;
  cardTitle: string;
  command: string;
  durationMs: number;
  timestamp: string;
  status: 'success' | 'error';
}

export interface CostBreakdown {
  model: string;
  totalCost: number;
  percentage: number;
  tokenCount: number;
  executions: number;
}
```

#### 5. Componente Principal - Dashboard de Métricas

```typescript
// pages/MetricsPage.tsx
const MetricsPage = () => {
  // Estados para filtros
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [selectedProject, setSelectedProject] = useState<string>('current');

  // Métricas principais em cards
  const metrics = [
    {
      title: 'Total de Tokens',
      value: totalTokens,
      subtitle: `${inputTokens} entrada / ${outputTokens} saída`,
      trend: calculateTrend(previousTokens, totalTokens),
      icon: TokenIcon,
      color: 'blue'
    },
    {
      title: 'Tempo Médio de Execução',
      value: formatDuration(avgExecutionTime),
      subtitle: `P95: ${formatDuration(p95Time)}`,
      trend: calculateTrend(previousAvgTime, avgExecutionTime),
      icon: ClockIcon,
      color: 'green'
    },
    {
      title: 'Custo Total',
      value: formatCurrency(totalCost),
      subtitle: `Média por card: ${formatCurrency(costPerCard)}`,
      trend: calculateTrend(previousCost, totalCost),
      icon: DollarIcon,
      color: 'purple'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${successRate}%`,
      subtitle: `${successfulExecutions}/${totalExecutions}`,
      trend: successRate - previousSuccessRate,
      icon: CheckIcon,
      color: 'emerald'
    }
  ];

  return (
    <div className={styles.metricsPage}>
      {/* Header com filtros */}
      <MetricsHeader
        onDateRangeChange={setDateRange}
        onProjectChange={setSelectedProject}
      />

      {/* Cards de métricas principais */}
      <div className={styles.metricsGrid}>
        {metrics.map(metric => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Gráficos */}
      <div className={styles.chartsSection}>
        <TokenUsageChart data={tokenUsageData} />
        <ExecutionTimeChart data={executionTimeData} />
        <CostAnalysis breakdown={costBreakdown} />
        <ProductivityMetrics data={productivityData} />
      </div>

      {/* Tabela detalhada */}
      <ExecutionsTable
        executions={recentExecutions}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
```

#### 6. Gráficos Interativos

```typescript
// components/Metrics/TokenUsageChart.tsx
const TokenUsageChart = ({ data }: { data: TokenUsageData[] }) => {
  return (
    <div className={styles.chartContainer}>
      <h3>Consumo de Tokens ao Longo do Tempo</h3>

      {/* Tabs para diferentes visualizações */}
      <Tabs>
        <Tab label="Por Hora">
          <LineChart data={hourlyData} />
        </Tab>
        <Tab label="Por Dia">
          <AreaChart data={dailyData} />
        </Tab>
        <Tab label="Por Modelo">
          <StackedBarChart data={modelData} />
        </Tab>
        <Tab label="Heatmap">
          <HeatmapChart data={hourlyHeatmap} />
        </Tab>
      </Tabs>

      {/* Insights automáticos */}
      <InsightsPanel>
        <Insight
          type="peak"
          message={`Pico de uso: ${peakTime} com ${peakTokens} tokens`}
        />
        <Insight
          type="trend"
          message={`Tendência: ${trend > 0 ? '+' : ''}${trend}% esta semana`}
        />
      </InsightsPanel>
    </div>
  );
};
```

#### 7. Métricas de Produtividade

```typescript
// components/Metrics/ProductivityMetrics.tsx
const ProductivityMetrics = () => {
  const metrics = {
    velocity: calculateVelocity(), // Cards/dia
    cycleTime: calculateCycleTime(), // Tempo médio backlog → done
    throughput: calculateThroughput(), // Cards completados/semana
    efficiency: calculateEfficiency(), // Taxa sucesso vs. retrabalho
  };

  return (
    <div className={styles.productivityContainer}>
      <h3>Métricas de Produtividade</h3>

      {/* Velocity Chart */}
      <VelocityChart data={velocityHistory} />

      {/* Cycle Time Distribution */}
      <CycleTimeHistogram data={cycleTimeData} />

      {/* Efficiency Gauge */}
      <EfficiencyGauge value={metrics.efficiency} />

      {/* Comparação entre períodos */}
      <PeriodComparison
        current={currentPeriodMetrics}
        previous={previousPeriodMetrics}
      />
    </div>
  );
};
```

#### 8. Sistema de Alertas e Insights

```python
# services/metrics_insights.py
class MetricsInsightGenerator:
    async def generate_insights(self, metrics: ProjectMetrics):
        insights = []

        # Alerta de custo
        if metrics.total_cost_usd > budget_threshold:
            insights.append({
                "type": "warning",
                "title": "Custo acima do esperado",
                "message": f"Custo atual ${metrics.total_cost_usd} excede orçamento"
            })

        # Insight de otimização
        if metrics.avg_execution_time_ms > baseline_time * 1.5:
            insights.append({
                "type": "optimization",
                "title": "Oportunidade de otimização",
                "message": "Tempo de execução 50% acima da média"
            })

        # Padrão de uso
        peak_hours = self.identify_peak_usage_hours(metrics)
        if peak_hours:
            insights.append({
                "type": "info",
                "title": "Padrão de uso identificado",
                "message": f"Maior uso entre {peak_hours[0]}h e {peak_hours[1]}h"
            })

        return insights
```

---

## 4. Testes

### Unitários
- [x] Teste agregação de métricas por hora/dia/semana
- [x] Teste cálculo de custos por modelo
- [x] Teste cálculo de percentis de tempo de execução
- [x] Teste geração de insights automáticos

### Integração
- [x] Teste coleta automática de métricas durante execuções
- [x] Teste endpoints de API com diferentes filtros
- [ ] Teste atualização em tempo real das métricas
- [ ] Teste exportação de relatórios

### Performance
- [ ] Teste com grande volume de dados (10k+ execuções)
- [ ] Teste otimização de queries agregadas
- [ ] Teste cache de métricas frequentes

---

## 5. Considerações

### Performance
- **Cache**: Implementar cache Redis para métricas agregadas frequentes
- **Índices**: Criar índices compostos em (project_id, created_at) para queries temporais
- **Materialização**: Considerar views materializadas para agregações complexas

### Escalabilidade
- **Particionamento**: Particionar tabela de métricas por mês
- **Arquivamento**: Política de arquivamento para dados > 6 meses
- **Compressão**: Comprimir dados históricos

### Riscos
- **Volume de Dados**: Crescimento rápido do banco com métricas detalhadas
- **Mitigação**: Implementar agregação e limpeza periódica

### Dependências
- Biblioteca de gráficos: Recharts ou Visx
- Exportação PDF: jsPDF ou similar
- Cache: Redis para métricas agregadas

### Futuras Melhorias
- Dashboard compartilhável com link público
- Alertas configuráveis por Slack/Email
- Comparação entre projetos
- Análise preditiva de custos
- Integração com ferramentas de BI