# Dashboard de Métricas - Documentação

## Visão Geral

O Dashboard de Métricas fornece uma visão completa do desempenho, custos e uso de recursos do projeto. Ele coleta e agrega métricas automaticamente durante as execuções dos cards, permitindo análise detalhada e insights sobre o uso da IA no desenvolvimento.

## Funcionalidades Implementadas

### 1. Coleta Automática de Métricas
- **ExecutionMetrics**: Rastreia cada execução individual
  - Tokens (input, output, total)
  - Tempo de execução (duração em ms)
  - Custos estimados por modelo
  - Status (success, error)
  - Modelo utilizado

### 2. Agregação e Análise
- **MetricsAggregator**: Processa dados e gera insights
  - Agregação por hora/dia/semana
  - Cálculo de tendências de uso
  - Análise de performance (P50, P95, P99)
  - Métricas de ROI
  - Comparação entre períodos

### 3. API Endpoints

#### Métricas Gerais
```
GET /api/metrics/project/{project_id}
  - Retorna métricas agregadas do projeto
  - Parâmetros: start_date, end_date
```

#### Uso de Tokens
```
GET /api/metrics/tokens/{project_id}
  - Uso de tokens agregado
  - Parâmetros: period (24h, 7d, 30d, all), group_by (hour, day, model)
```

#### Tempo de Execução
```
GET /api/metrics/execution-time/{project_id}
  - Tempos de execução por card/comando
  - Parâmetros: command, limit
```

#### Análise de Custos
```
GET /api/metrics/costs/{project_id}
  - Breakdown de custos
  - Parâmetros: group_by (model, command, day)
```

#### Tendências
```
GET /api/metrics/trends/{project_id}
  - Tendências de uso de tokens
  - Parâmetros: days (1-90)
```

#### Performance
```
GET /api/metrics/performance/{project_id}
  - Análise de performance (percentis)
  - Parâmetros: command
```

#### ROI
```
GET /api/metrics/roi/{project_id}
  - Métricas de ROI
  - Custo por card, eficiência, economia de tempo
```

#### Produtividade
```
GET /api/metrics/productivity/{project_id}
  - Métricas de produtividade
  - Parâmetros: start_date, end_date
```

#### Insights
```
GET /api/metrics/insights/{project_id}
  - Insights automáticos sobre métricas
```

#### Utilidades
```
GET /api/metrics/hourly/{project_id}
  - Métricas por hora

POST /api/metrics/backfill/{project_id}
  - Preenche métricas retroativas

GET /api/metrics/compare/{project_id}
  - Compara dois períodos
```

### 4. Dashboard Frontend

#### Componentes Principais

**MetricsPage**
- Página principal do dashboard
- Cards de métricas principais:
  - Total de Tokens
  - Tempo Médio de Execução
  - Custo Total
  - Taxa de Sucesso
- Gráficos interativos:
  - Uso de tokens ao longo do tempo
  - Breakdown de custos por modelo
  - Execuções recentes
- Panel de insights automáticos
- Filtros temporais (24h, 7d, 30d, all)

#### Insights Automáticos

O sistema gera insights automaticamente:
- ⚠️ **Warning**: Custos elevados, taxa de sucesso baixa
- ℹ️ **Info**: Tendências de uso, padrões identificados
- ⚡ **Optimization**: Oportunidades de otimização
- ❌ **Error**: Problemas críticos

## Como Usar

### 1. Backend Setup

As tabelas do banco de dados são criadas automaticamente ao iniciar o servidor:
```bash
cd backend
python -m src.main
```

### 2. Coletar Métricas

As métricas são coletadas automaticamente durante as execuções. Para preencher métricas retroativamente:

```bash
# Via API
POST /api/metrics/backfill/{project_id}
```

Ou programaticamente:
```python
from src.services.metrics_collector import MetricsCollector
from src.database import async_session_maker

async with async_session_maker() as db:
    collector = MetricsCollector(db)
    count = await collector.backfill_metrics(project_id)
    print(f"Collected {count} metrics")
```

### 3. Acessar Dashboard

No frontend, navegue até a página de métricas:
```typescript
import MetricsPage from './pages/MetricsPage';

<MetricsPage projectId={currentProjectId} />
```

### 4. API Client

Use o cliente TypeScript para buscar métricas:
```typescript
import { metricsApi } from './api/metrics';

// Buscar métricas do projeto
const metrics = await metricsApi.getProjectMetrics(projectId);

// Buscar uso de tokens
const tokenUsage = await metricsApi.getTokenUsage(projectId, '7d', 'day');

// Buscar insights
const insights = await metricsApi.getInsights(projectId);
```

## Estrutura de Dados

### ExecutionMetrics
```typescript
{
  id: string;
  executionId: string;
  cardId: string;
  projectId: string;
  command: string;
  modelUsed: string;
  startedAt: datetime;
  completedAt: datetime;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  status: 'success' | 'error' | 'cancelled';
  errorMessage?: string;
}
```

### ProjectMetrics (Agregadas)
```typescript
{
  projectId: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  avgExecutionTimeMs: number;
  minExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
}
```

## Próximos Passos

### Funcionalidades Pendentes
- [ ] Exportação de relatórios em CSV/PDF
- [ ] Atualização em tempo real via WebSocket
- [ ] Cache de métricas frequentes (Redis)
- [ ] Otimização de queries para grandes volumes
- [ ] Dashboard compartilhável

### Melhorias Futuras
- Alertas configuráveis (Slack, Email)
- Comparação entre projetos
- Análise preditiva de custos
- Métricas de qualidade de código
- Integração com ferramentas de BI

## Troubleshooting

### Métricas não aparecem
1. Verifique se as tabelas foram criadas: `project_metrics`, `execution_metrics`
2. Execute o backfill: `POST /api/metrics/backfill/{project_id}`
3. Verifique os logs do servidor para erros

### Performance lenta
1. Adicione índices nas tabelas:
   ```sql
   CREATE INDEX idx_execution_metrics_project_date
   ON execution_metrics(project_id, started_at);
   ```
2. Implemente cache para métricas agregadas
3. Use paginação para grandes volumes de dados

### Custos incorretos
1. Verifique o arquivo de pricing: `backend/src/config/pricing.py`
2. Certifique-se de que `model_used` está correto nas execuções
3. Recalcule métricas com backfill

## Referências

- [Spec completa](../specs/dashboard-metrics.md)
- [Código backend](../backend/src/)
- [Código frontend](../frontend/src/)
