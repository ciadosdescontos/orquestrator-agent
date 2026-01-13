---
description: Criar ou modificar services seguindo padroes do projeto
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Service: Backend Expert

## Proposito

Criar ou modificar services (logica de negocio) seguindo os padroes estabelecidos no projeto.

## Padroes do Projeto

### Localizacao

Todos os services ficam em: `backend/src/services/`

### Template de Service (Classe)

```python
# backend/src/services/nova_service.py
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class NovaServiceConfig:
    """Configuracao do service."""
    timeout: int = 30
    max_retries: int = 3


class NovaService:
    """Service para processar Nova."""

    def __init__(self, config: Optional[NovaServiceConfig] = None):
        self.config = config or NovaServiceConfig()
        self._cache: Dict[str, Any] = {}

    async def process(self, data: dict) -> dict:
        """Processa dados e retorna resultado."""
        logger.info(f"Processing data: {data}")

        try:
            result = await self._do_processing(data)
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error(f"Error processing: {e}")
            raise

    async def _do_processing(self, data: dict) -> Any:
        """Logica interna de processamento."""
        # Implementacao
        return data

    def clear_cache(self) -> None:
        """Limpa o cache interno."""
        self._cache.clear()
```

### Template de Service (Funcional)

```python
# backend/src/services/nova_utils.py
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


async def process_item(item: dict) -> dict:
    """Processa um item individual."""
    logger.debug(f"Processing item: {item.get('id')}")
    # Implementacao
    return item


async def process_batch(items: List[dict]) -> List[dict]:
    """Processa multiplos items."""
    results = []
    for item in items:
        result = await process_item(item)
        results.append(result)
    return results


def calculate_something(value: float, multiplier: float = 1.0) -> float:
    """Calcula algo baseado no valor."""
    return value * multiplier
```

## Instrucoes

### Para CRIAR novo service:

1. **Verifique se ja existe** service similar
2. **Decida se usa classe ou funcoes** (complexidade)
3. **Crie o arquivo** em `backend/src/services/`
4. **Implemente com tipagem** completa
5. **Adicione logging** para debug
6. **Trate erros** adequadamente

### Para MODIFICAR service existente:

1. **Leia o service atual** para entender estrutura
2. **Mantenha interface** compativel
3. **Adicione novos metodos** seguindo padrao
4. **Atualize testes** se existirem

## Categorias de Services

### Business Logic
- `chat_service.py` - Processamento de chat
- `expert_triage_service.py` - Triage de experts
- `diff_analyzer.py` - Analise de diffs
- `cost_calculator.py` - Calculo de custos

### WebSocket
- `card_ws.py` - Broadcast de cards
- `execution_ws.py` - Broadcast de execucao

### Analysis
- `test_result_analyzer.py` - Analise de testes
- `diff_analyzer.py` - Analise de diffs

### Maintenance
- `auto_cleanup_service.py` - Limpeza automatica
- `expert_sync_service.py` - Sync de experts

## Checklist de Qualidade

- [ ] Tipagem completa (parametros e retorno)
- [ ] Logging configurado
- [ ] Error handling
- [ ] Docstrings em metodos publicos
- [ ] Config via dataclass (se classe)
- [ ] Metodos privados com underscore

## Exemplos de Services Existentes

### Service com streaming
```
backend/src/services/chat_service.py
```

### Service com analise
```
backend/src/services/diff_analyzer.py
```

### Service de WebSocket
```
backend/src/services/card_ws.py
```

## Solicitacao

$ARGUMENTS
