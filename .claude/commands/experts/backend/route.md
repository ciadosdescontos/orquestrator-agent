---
description: Criar ou modificar rotas FastAPI seguindo padroes do projeto
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Route: Backend Expert

## Proposito

Criar ou modificar rotas FastAPI seguindo os padroes estabelecidos no projeto.

## Padroes do Projeto

### Localizacao

Todas as rotas ficam em: `backend/src/routes/`

### Estrutura de Arquivo

```python
# backend/src/routes/nova_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from backend.src.database import get_session
from backend.src.schemas.nova import NovaCreate, NovaUpdate, NovaResponse
from backend.src.repositories.nova_repository import NovaRepository

router = APIRouter(prefix="/api/nova", tags=["nova"])


@router.get("/", response_model=List[NovaResponse])
async def list_items(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_session)
):
    """Lista todos os items."""
    repo = NovaRepository(db)
    return await repo.get_all(skip=skip, limit=limit)


@router.get("/{item_id}", response_model=NovaResponse)
async def get_item(
    item_id: str,
    db: AsyncSession = Depends(get_session)
):
    """Obtem um item por ID."""
    repo = NovaRepository(db)
    item = await repo.get_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item


@router.post("/", response_model=NovaResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    data: NovaCreate,
    db: AsyncSession = Depends(get_session)
):
    """Cria um novo item."""
    repo = NovaRepository(db)
    return await repo.create(data)


@router.put("/{item_id}", response_model=NovaResponse)
async def update_item(
    item_id: str,
    data: NovaUpdate,
    db: AsyncSession = Depends(get_session)
):
    """Atualiza um item existente."""
    repo = NovaRepository(db)
    item = await repo.update(item_id, data)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    db: AsyncSession = Depends(get_session)
):
    """Deleta um item."""
    repo = NovaRepository(db)
    success = await repo.delete(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
```

### Registrar no main.py

```python
# Em backend/src/main.py
from backend.src.routes.nova_route import router as nova_router

# Na secao de include_router
app.include_router(nova_router)
```

## Instrucoes

### Para CRIAR nova route:

1. **Verifique se ja existe** route similar
2. **Crie o arquivo** em `backend/src/routes/`
3. **Defina o router** com prefix e tags
4. **Implemente endpoints** seguindo padrao CRUD
5. **Use Depends** para injecao de dependencias
6. **Registre** no main.py

### Para MODIFICAR route existente:

1. **Leia a route atual** para entender estrutura
2. **Mantenha consistencia** com endpoints existentes
3. **Adicione novos endpoints** seguindo o padrao
4. **Atualize schemas** se necessario

## Checklist de Qualidade

- [ ] Router com prefix e tags
- [ ] Response models definidos
- [ ] Status codes corretos
- [ ] HTTPException para erros
- [ ] Dependency injection via Depends
- [ ] Docstrings nos endpoints
- [ ] Registrado no main.py

## Exemplos de Routes Existentes

### CRUD completo
```
backend/src/routes/cards.py
```

### Com WebSocket
```
backend/src/routes/cards_ws.py
```

### Com streaming
```
backend/src/routes/chat.py
```

## Solicitacao

$ARGUMENTS
