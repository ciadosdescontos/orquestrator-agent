"""
Migração para renomear coluna 'in-progress' para 'implement'.

Execute este script para atualizar o esquema do banco:
    python -m backend.src.migrations.rename_inprogress_to_implement
"""

import asyncio
from sqlalchemy import text
from backend.src.database import engine, create_tables

async def rename_column():
    """Renomeia a coluna 'in-progress' para 'implement'"""

    async with engine.begin() as conn:
        try:
            # Atualizar todos os cards que estão em 'in-progress' para 'implement'
            print("Atualizando cards de 'in-progress' para 'implement'...")
            result = await conn.execute(text("""
                UPDATE cards
                SET column_id = 'implement'
                WHERE column_id = 'in-progress';
            """))

            rows_updated = result.rowcount
            print(f"✓ {rows_updated} card(s) atualizados com sucesso!")

        except Exception as e:
            print(f"Erro ao atualizar cards: {e}")
            raise

async def main():
    """Executa a migração"""
    print("=" * 60)
    print("Migração: Renomear coluna 'in-progress' para 'implement'")
    print("=" * 60)

    # Primeiro garantir que as tabelas existem
    print("\n1. Verificando/criando tabelas...")
    await create_tables()

    # Verificar se a tabela existe
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT name FROM sqlite_master WHERE type='table' AND name='cards';
        """))
        if not result.fetchone():
            print("⚠️  Tabela 'cards' não encontrada. Pulando migração.")
            print("   (Migração será aplicada automaticamente quando cards forem criados)")
            return

    # Renomear a coluna
    print("\n2. Executando migração...")
    await rename_column()

    print("\n✓ Migração concluída com sucesso!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
