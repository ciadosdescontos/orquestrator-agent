"""Migration to add metrics tables."""

import sqlite3
import os
from pathlib import Path


def run_migration(db_path: str):
    """Execute the metrics tables migration."""
    migration_file = Path(__file__).parent.parent.parent / "migrations" / "010_add_metrics_tables.sql"

    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        with open(migration_file, 'r') as f:
            migration_sql = f.read()

        # Execute the migration
        cursor.executescript(migration_sql)
        conn.commit()

        print(f"✅ Successfully applied metrics tables migration to {db_path}")
        return True

    except Exception as e:
        print(f"❌ Error applying migration to {db_path}: {e}")
        return False

    finally:
        if conn:
            conn.close()


def main():
    """Run migration on all project databases."""
    projects_dir = Path("projects")

    if not projects_dir.exists():
        print("No projects directory found")
        return

    success_count = 0
    total_count = 0

    for project_folder in projects_dir.iterdir():
        if project_folder.is_dir():
            db_path = project_folder / "orquestrator.db"
            if db_path.exists():
                total_count += 1
                print(f"\n📦 Migrating {project_folder.name}...")
                if run_migration(str(db_path)):
                    success_count += 1

    print(f"\n{'='*50}")
    print(f"✅ Migration completed: {success_count}/{total_count} databases updated")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    main()
