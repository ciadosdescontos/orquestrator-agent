# Plano de Implementação: Métricas de Uso de Experts

## 1. Resumo

Implementar um sistema de rastreamento de métricas para monitorar e analisar o uso de experts no sistema Kanban SDLC. Isso permitirá identificar quais experts são mais utilizados, sua efetividade e impacto nos cards, fornecendo insights valiosos para otimização do workflow e melhoria contínua dos experts.

---

## 2. Objetivos e Escopo

### Objetivos
- [ ] Criar estrutura de dados para rastrear uso de experts (nova tabela no banco)
- [ ] Implementar coleta automática de métricas quando experts são identificados/consultados
- [ ] Desenvolver endpoints para consultar estatísticas de uso de experts
- [ ] Criar visualizações no frontend para exibir métricas de experts
- [ ] Integrar coleta com fluxo existente de expert-triage e expert-sync

### Fora do Escopo
- Modificar lógica de identificação de experts existente
- Alterar estrutura do campo experts nos cards
- Criar novos experts ou modificar knowledge bases
- Implementar sistema de feedback/rating de experts (futuro)

---

## 3. Implementação

### Arquivos a Serem Modificados/Criados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/migrations/013_add_expert_usage_metrics.sql` | Criar | Nova migração com tabela expert_usage_metrics |
| `backend/src/models/expert_metrics.py` | Criar | Model SQLAlchemy para métricas de experts |
| `backend/src/repositories/expert_metrics_repository.py` | Criar | Repository para operações de métricas de experts |
| `backend/src/services/expert_metrics_collector.py` | Criar | Service para coletar métricas de uso de experts |
| `backend/src/services/expert_metrics_aggregator.py` | Criar | Service para agregar e analisar métricas |
| `backend/src/routes/expert_metrics.py` | Criar | Endpoints da API de métricas de experts |
| `backend/src/routes/experts.py` | Modificar | Integrar coleta de métricas no triage/sync |
| `backend/src/main.py` | Modificar | Registrar nova rota de expert_metrics |
| `frontend/src/api/expertMetrics.ts` | Criar | Cliente API para métricas de experts |
| `frontend/src/types/expertMetrics.ts` | Criar | Tipos TypeScript para métricas |
| `frontend/src/components/Dashboard/ExpertUsagePanel.tsx` | Criar | Componente de uso geral de experts |
| `frontend/src/components/Dashboard/ExpertEffectivenessChart.tsx` | Criar | Gráfico de efetividade |
| `frontend/src/hooks/useExpertMetrics.ts` | Criar | Hook para carregar métricas de experts |
| `frontend/src/components/Dashboard/DashboardPage.tsx` | Modificar | Adicionar painel de experts ao dashboard |

### Detalhes Técnicos

#### 3.1 Estrutura do Banco de Dados

```sql
-- backend/migrations/013_add_expert_usage_metrics.sql
CREATE TABLE IF NOT EXISTS expert_usage_metrics (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    expert_id TEXT NOT NULL,

    -- Tipo de interação
    interaction_type TEXT NOT NULL, -- 'identified', 'consulted', 'synced'
    confidence TEXT, -- 'high', 'medium', 'low'

    -- Contexto
    command TEXT, -- '/plan', '/implement', etc
    execution_id TEXT,

    -- Resultado
    success BOOLEAN DEFAULT 1,
    files_affected INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES active_project(id),
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (execution_id) REFERENCES executions(id)
);

CREATE INDEX idx_expert_usage_project_expert
    ON expert_usage_metrics(project_id, expert_id);
CREATE INDEX idx_expert_usage_card
    ON expert_usage_metrics(card_id);
CREATE INDEX idx_expert_usage_created
    ON expert_usage_metrics(created_at);
```

#### 3.2 Model de Métricas

```python
# backend/src/models/expert_metrics.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from backend.src.database import Base

class ExpertUsageMetrics(Base):
    __tablename__ = "expert_usage_metrics"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("active_project.id"))
    card_id: Mapped[str] = mapped_column(ForeignKey("cards.id"))
    expert_id: Mapped[str] = mapped_column(String, nullable=False)

    interaction_type: Mapped[str] = mapped_column(String)  # identified/consulted/synced
    confidence: Mapped[str | None] = mapped_column(String, nullable=True)
    command: Mapped[str | None] = mapped_column(String, nullable=True)
    execution_id: Mapped[str | None] = mapped_column(ForeignKey("executions.id"))

    success: Mapped[bool] = mapped_column(Boolean, default=True)
    files_affected: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("ActiveProject", back_populates="expert_metrics")
    card = relationship("Card", back_populates="expert_metrics")
    execution = relationship("Execution", back_populates="expert_metrics")
```

#### 3.3 Coletor de Métricas

```python
# backend/src/services/expert_metrics_collector.py
class ExpertMetricsCollector:
    def __init__(self, repository: ExpertMetricsRepository):
        self.repository = repository

    async def collect_identification(
        self,
        card_id: str,
        experts: Dict[str, ExpertMatch],
        project_id: str
    ):
        """Coleta métricas quando experts são identificados"""
        for expert_id, match in experts.items():
            await self.repository.create_metric(
                project_id=project_id,
                card_id=card_id,
                expert_id=expert_id,
                interaction_type="identified",
                confidence=match.confidence
            )

    async def collect_consultation(
        self,
        card_id: str,
        expert_id: str,
        command: str,
        execution_id: str,
        project_id: str
    ):
        """Coleta quando expert é consultado durante comando"""
        await self.repository.create_metric(
            project_id=project_id,
            card_id=card_id,
            expert_id=expert_id,
            interaction_type="consulted",
            command=command,
            execution_id=execution_id
        )

    async def collect_sync(
        self,
        card_id: str,
        sync_results: List[SyncedExpert],
        project_id: str
    ):
        """Coleta métricas de sincronização"""
        for result in sync_results:
            if result.synced:
                await self.repository.create_metric(
                    project_id=project_id,
                    card_id=card_id,
                    expert_id=result.expert_id,
                    interaction_type="synced",
                    success=result.synced,
                    files_affected=len(result.files_changed)
                )
```

#### 3.4 Agregador de Métricas

```python
# backend/src/services/expert_metrics_aggregator.py
class ExpertMetricsAggregator:
    async def get_usage_stats(self, project_id: str, days: int = 7):
        """Estatísticas de uso por expert"""
        return {
            "by_expert": {
                "database": {
                    "total_uses": 45,
                    "identifications": 30,
                    "consultations": 10,
                    "syncs": 5,
                    "confidence_breakdown": {
                        "high": 20, "medium": 8, "low": 2
                    }
                },
                "kanban-flow": {
                    "total_uses": 32,
                    "identifications": 20,
                    "consultations": 8,
                    "syncs": 4,
                    "confidence_breakdown": {
                        "high": 15, "medium": 4, "low": 1
                    }
                }
            },
            "most_used": "database",
            "total_interactions": 77,
            "sync_success_rate": 0.89,
            "avg_files_per_sync": 3.2
        }

    async def get_effectiveness_metrics(self, project_id: str):
        """Métricas de efetividade"""
        return {
            "by_expert": {
                "database": {
                    "cards_with_expert": 25,
                    "cards_completed": 20,
                    "completion_rate": 0.80,
                    "avg_sync_success": 0.90
                },
                "kanban-flow": {
                    "cards_with_expert": 18,
                    "cards_completed": 15,
                    "completion_rate": 0.83,
                    "avg_sync_success": 0.88
                }
            }
        }

    async def get_expert_combinations(self, project_id: str):
        """Análise de combinações de experts"""
        return {
            "combinations": [
                {
                    "experts": ["database", "kanban-flow"],
                    "frequency": 12,
                    "success_rate": 0.92
                }
            ],
            "solo_vs_combined": {
                "solo_success_rate": 0.78,
                "combined_success_rate": 0.92
            }
        }
```

#### 3.5 Endpoints da API

```python
# backend/src/routes/expert_metrics.py
from fastapi import APIRouter, Depends
from backend.src.services.expert_metrics_aggregator import ExpertMetricsAggregator

router = APIRouter(prefix="/api/expert-metrics", tags=["expert-metrics"])

@router.get("/{project_id}/usage")
async def get_expert_usage(
    project_id: str,
    days: int = 7,
    aggregator: ExpertMetricsAggregator = Depends()
):
    """Retorna estatísticas de uso de experts"""
    return await aggregator.get_usage_stats(project_id, days)

@router.get("/{project_id}/effectiveness")
async def get_expert_effectiveness(
    project_id: str,
    aggregator: ExpertMetricsAggregator = Depends()
):
    """Retorna métricas de efetividade"""
    return await aggregator.get_effectiveness_metrics(project_id)

@router.get("/{project_id}/combinations")
async def get_expert_combinations(
    project_id: str,
    aggregator: ExpertMetricsAggregator = Depends()
):
    """Análise de combinações de experts"""
    return await aggregator.get_expert_combinations(project_id)
```

#### 3.6 Integração com Expert Triage

```python
# backend/src/routes/experts.py (modificação)
@router.post("/expert-triage")
async def expert_triage(
    request: TriageRequest,
    card_repository: CardRepository = Depends(),
    triage_service: ExpertTriageService = Depends(),
    metrics_collector: ExpertMetricsCollector = Depends()  # NOVO
):
    # ... código existente de identificação ...

    # Coletar métricas após identificação
    if identified_experts:
        await metrics_collector.collect_identification(
            card_id=request.card_id,
            experts=identified_experts,
            project_id=request.project_id
        )

    return response
```

#### 3.7 Componente de Visualização

```tsx
// frontend/src/components/Dashboard/ExpertUsagePanel.tsx
import React from 'react';
import { ExpertUsageStats } from '../../types/expertMetrics';

interface Props {
  stats: ExpertUsageStats;
}

export const ExpertUsagePanel: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-3">
        Expert Usage (Last 7 Days)
      </h3>

      <div className="space-y-3">
        {Object.entries(stats.by_expert).map(([expertId, data]) => (
          <div key={expertId} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-medium capitalize">
                  {expertId.replace('-', ' ')} Expert
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {data.total_uses} total interactions
                </div>
              </div>

              <div className="text-right">
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-600 px-2 py-1 rounded">
                    {data.identifications} IDs
                  </span>
                  <span className="bg-green-600 px-2 py-1 rounded">
                    {data.consultations} Consults
                  </span>
                  <span className="bg-purple-600 px-2 py-1 rounded">
                    {data.syncs} Syncs
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence breakdown bar */}
            <div className="mt-2">
              <div className="flex h-2 rounded overflow-hidden">
                <div
                  className="bg-green-500"
                  style={{width: `${(data.confidence_breakdown.high / data.identifications) * 100}%`}}
                />
                <div
                  className="bg-yellow-500"
                  style={{width: `${(data.confidence_breakdown.medium / data.identifications) * 100}%`}}
                />
                <div
                  className="bg-red-500"
                  style={{width: `${(data.confidence_breakdown.low / data.identifications) * 100}%`}}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>High: {data.confidence_breakdown.high}</span>
                <span>Med: {data.confidence_breakdown.medium}</span>
                <span>Low: {data.confidence_breakdown.low}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Most Used:</span>
            <span className="text-white ml-2 capitalize">
              {stats.most_used.replace('-', ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Sync Success:</span>
            <span className="text-green-400 ml-2">
              {(stats.sync_success_rate * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 3.8 Hook de Métricas

```typescript
// frontend/src/hooks/useExpertMetrics.ts
import { useState, useEffect } from 'react';
import { getExpertUsage, getExpertEffectiveness } from '../api/expertMetrics';
import { ExpertUsageStats, ExpertEffectiveness } from '../types/expertMetrics';

export const useExpertMetrics = (projectId: string | null) => {
  const [usage, setUsage] = useState<ExpertUsageStats | null>(null);
  const [effectiveness, setEffectiveness] = useState<ExpertEffectiveness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [usageData, effectData] = await Promise.all([
          getExpertUsage(projectId, 7),
          getExpertEffectiveness(projectId)
        ]);

        setUsage(usageData);
        setEffectiveness(effectData);
        setError(null);
      } catch (err) {
        setError('Failed to load expert metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  return { usage, effectiveness, loading, error };
};
```

---

## 4. Testes

### Unitários
- [ ] `test_expert_metrics_collector.py` - Testes de coleta de métricas
- [ ] `test_expert_metrics_aggregator.py` - Testes de agregação e cálculos
- [ ] `test_expert_metrics_repository.py` - Testes de persistência

### Integração
- [ ] Teste do fluxo completo: triage → coleta → agregação → visualização
- [ ] Teste de sincronização com coleta de métricas
- [ ] Teste de performance com volume alto de métricas

### Frontend
- [ ] Teste do hook `useExpertMetrics` com mock de API
- [ ] Teste de renderização dos componentes de visualização
- [ ] Teste de auto-refresh das métricas

---

## 5. Considerações

### Riscos
- **Performance:** Adicionar coleta de métricas pode impactar tempo de resposta do expert-triage
  - **Mitigação:** Usar operações assíncronas e background tasks para coleta

- **Volume de dados:** Muitas interações podem gerar volume significativo de registros
  - **Mitigação:** Implementar agregação periódica e limpeza de dados antigos

### Dependências
- Migração 013 deve ser executada antes do deploy
- Frontend precisa da versão atualizada da API de experts

### Próximos Passos (Futuro)
- Sistema de feedback/rating de recomendações de experts
- Análise preditiva de qual expert será necessário
- Otimização automática de keywords baseada em efetividade
- Dashboard dedicado para análise profunda de experts