# Fix: Database não reseta ao sair de projeto externo

## Problema
Após sair de um projeto externo e dar refresh, a UI continua mostrando os cards do último projeto externo visitado. Isso acontece porque o `DatabaseManager` não está sendo resetado quando o usuário sai do projeto.

## Causa Raiz
1. Ao carregar projeto externo: `db_manager.current_project_id` aponta para o projeto externo
2. Ao sair com `clearAllProjects()`: apenas `ProjectManager.reset()` é chamado
3. `db_manager.current_project_id` **não é resetado** e continua apontando para o database do projeto externo
4. Após refresh: `/api/cards` usa `get_db()` que retorna sessão do projeto externo (porque `current_project_id` ainda está setado)

## Solução

### 1. Adicionar método `reset()` ao DatabaseManager
**Arquivo**: `backend/src/database_manager.py`

Adicionar após o método `get_project_database_info()`:

```python
def reset(self):
    """
    Reset database manager to initial state (no active project).
    This should be called when returning to root project.
    """
    logger.info("[DatabaseManager] Resetting to root project (no active project)")
    self.current_project_id = None
```

### 2. Chamar `db_manager.reset()` ao limpar projeto
**Arquivo**: `backend/src/routes/projects.py`

No endpoint `clear_current_project()`, adicionar chamada ao reset:

```python
@router.delete("/current")
async def clear_current_project():
    """
    Remove o projeto atual e volta para o projeto raiz (sem criar database.db).

    Returns:
        Status da operação
    """
    try:
        # Limpa do banco (remove projetos ativos)
        async with async_session_maker() as session:
            await session.execute(delete(ActiveProject))
            await session.commit()

        # Reseta o gerenciador para voltar ao root_path
        manager = get_project_manager()
        manager.reset()

        # NOVO: Resetar o database manager
        from src.database_manager import db_manager
        db_manager.reset()

        # Retorna sucesso sem carregar projeto raiz
        # (o projeto raiz usa auth.db, não database.db)
        return {
            "success": True,
            "message": "Voltou para o projeto raiz"
        }

    except Exception as e:
        print(f"[ProjectsRoute] Error clearing project: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao limpar projeto: {str(e)}")
```

### 3. Atualizar `get_db()` para lidar com root project
**Arquivo**: `backend/src/database.py`

Verificar se `get_db()` lida corretamente quando não há projeto ativo. Se `current_project_id` for None, deve usar o database raiz (auth.db).

Checar a implementação atual e ajustar se necessário:

```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session for current project.

    If no project is active (current_project_id is None), uses root project database.
    """
    from .database_manager import db_manager

    # Se não há projeto ativo, usar database raiz
    if not db_manager.current_project_id:
        # VERIFICAR: qual database usar para root project?
        # auth.db ou criar um database.db na raiz?
        session_factory = async_session_maker  # ou outra lógica
    else:
        session_factory = db_manager.get_current_session()

    async with session_factory() as session:
        yield session
```

## Testes

### Teste Manual
1. Carregar projeto externo
2. Criar alguns cards no projeto externo
3. Sair do projeto usando o botão "LogOut"
4. Dar refresh na página
5. Verificar se a UI mostra cards do projeto raiz (não do projeto externo)

### Pontos de Verificação
- Logs devem mostrar: `[DatabaseManager] Resetting to root project (no active project)`
- Endpoint `/api/cards` deve retornar cards do projeto raiz
- UI deve limpar os cards do projeto externo após refresh

## Arquivos Modificados
1. `backend/src/database_manager.py` - Adicionar método `reset()`
2. `backend/src/routes/projects.py` - Chamar `db_manager.reset()` em `clear_current_project()`
3. `backend/src/database.py` - Verificar e ajustar `get_db()` para lidar com root project

## Notas Adicionais
- Verificar se existe um "root project database" ou se devemos usar `auth.db`
- Considerar adicionar logs para debug de qual database está sendo usado
- Garantir que não há race conditions se múltiplos requests chegarem durante o reset
