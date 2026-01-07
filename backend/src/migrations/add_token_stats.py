"""
Migração para adicionar campos de token tracking ao banco de dados.

Execute este script para atualizar o esquema do banco:
    python -m backend.src.migrations.add_token_stats
"""

import asyncio
from sqlalchemy import text
from backend.src.database import engine, create_tables

async def add_token_stats_fields():
    """Adiciona campos de token tracking às tabelas existentes"""

    async with engine.begin() as conn:
        try:
            # Adicionar campos à tabela executions
            print("Adicionando campo 'input_tokens' à tabela executions...")
            await conn.execute(text("""
                ALTER TABLE executions
                ADD COLUMN IF NOT EXISTS input_tokens INTEGER;
            """))

            print("Adicionando campo 'output_tokens' à tabela executions...")
            await conn.execute(text("""
                ALTER TABLE executions
                ADD COLUMN IF NOT EXISTS output_tokens INTEGER;
            """))

            print("Adicionando campo 'total_tokens' à tabela executions...")
            await conn.execute(text("""
                ALTER TABLE executions
                ADD COLUMN IF NOT EXISTS total_tokens INTEGER;
            """))

            print("Adicionando campo 'model_used' à tabela executions...")
            await conn.execute(text("""
                ALTER TABLE executions
                ADD COLUMN IF NOT EXISTS model_used VARCHAR;
            """))

            print("Campos de token tracking adicionados com sucesso!")

        except Exception as e:
            print(f"Erro ao adicionar campos: {e}")
            # Se os campos já existirem ou houver outro erro, continuar
            pass

async def main():
    """Executa a migração"""
    print("Iniciando migração de token tracking...")

    # Primeiro garantir que as tabelas existem
    print("Criando/atualizando tabelas...")
    await create_tables()

    # Adicionar novos campos
    await add_token_stats_fields()

    print("Migração concluída!")

if __name__ == "__main__":
    asyncio.run(main())
