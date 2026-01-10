"""Service for automatic database migrations."""

import sqlite3
from pathlib import Path
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)


class MigrationService:
    """Service to handle automatic database migrations."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self.migrations_dir = Path(__file__).parent.parent.parent / "migrations"

    def get_pending_migrations(self) -> List[Path]:
        """Get list of pending SQL migrations to apply."""
        if not self.migrations_dir.exists():
            logger.warning(f"Migrations directory not found: {self.migrations_dir}")
            return []

        # Get all SQL migrations sorted by filename
        all_migrations = sorted(self.migrations_dir.glob("*.sql"))

        # Get applied migrations from database
        applied_migrations = self._get_applied_migrations()

        # Return migrations that haven't been applied yet
        pending = []
        for migration in all_migrations:
            if migration.name not in applied_migrations:
                pending.append(migration)

        return pending

    def _get_applied_migrations(self) -> set:
        """Get set of migrations that have been applied."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Create migrations tracking table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS applied_migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    migration_name TEXT UNIQUE NOT NULL,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

            # Get list of applied migrations
            cursor.execute("SELECT migration_name FROM applied_migrations")
            applied = {row[0] for row in cursor.fetchall()}

            conn.close()
            return applied

        except Exception as e:
            logger.error(f"Error getting applied migrations: {e}")
            return set()

    def apply_migration(self, migration_path: Path) -> Tuple[bool, str]:
        """Apply a single migration file."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Read and execute migration
            with open(migration_path, 'r') as f:
                migration_sql = f.read()

            cursor.executescript(migration_sql)

            # Record migration as applied
            cursor.execute(
                "INSERT INTO applied_migrations (migration_name) VALUES (?)",
                (migration_path.name,)
            )

            conn.commit()
            conn.close()

            logger.info(f"✅ Applied migration: {migration_path.name}")
            return True, f"Successfully applied {migration_path.name}"

        except Exception as e:
            error_msg = f"Error applying migration {migration_path.name}: {e}"
            logger.error(error_msg)
            return False, error_msg

    def apply_all_pending_migrations(self) -> Tuple[bool, List[str]]:
        """Apply all pending migrations."""
        pending = self.get_pending_migrations()

        if not pending:
            logger.info("No pending migrations")
            return True, ["No pending migrations"]

        results = []
        all_success = True

        for migration in pending:
            success, message = self.apply_migration(migration)
            results.append(message)
            if not success:
                all_success = False
                break  # Stop on first failure

        return all_success, results

    @staticmethod
    def run_migrations_for_all_projects():
        """Run migrations for all project databases."""
        results = []

        # Check .claude/database.db (current project)
        claude_db = Path(".claude/database.db")
        if claude_db.exists():
            logger.info("Running migrations for .claude/database.db")
            service = MigrationService(str(claude_db))
            success, messages = service.apply_all_pending_migrations()
            results.append({
                "project": ".claude (current project)",
                "success": success,
                "messages": messages
            })

        # Check legacy .project_data locations
        project_data_dir = Path("backend/.project_data")
        if project_data_dir.exists():
            for project_folder in project_data_dir.iterdir():
                if project_folder.is_dir():
                    db_path = project_folder / "database.db"
                    if db_path.exists():
                        logger.info(f"Running migrations for project: {project_folder.name}")
                        service = MigrationService(str(db_path))
                        success, messages = service.apply_all_pending_migrations()
                        results.append({
                            "project": f"legacy: {project_folder.name}",
                            "success": success,
                            "messages": messages
                        })

        if not results:
            logger.info("No project databases found - migrations will run when projects are created")

        return results
