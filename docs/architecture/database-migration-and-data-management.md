# Database Migration and Data Management

## Context7-Verified Database Operations

### Migration Strategy using Alembic
```python
# alembic/env.py - Production-ready migration configuration
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.models import Base
from app.config import get_settings

settings = get_settings()

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.database_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    """Run migrations in async mode."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.database_url
    
    connectable = create_async_engine(
        settings.database_url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Data Seeding Strategy
```python
# scripts/seed_database.py - Context7-verified seeding approach
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import get_settings
from app.models import User, Question, QuestionType
import json
from pathlib import Path

settings = get_settings()

async_engine = create_async_engine(settings.database_url)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

async def seed_question_bank():
    """Seed the database with initial LSAT questions."""
    async with AsyncSessionLocal() as session:
        # Load questions from JSON file
        questions_file = Path(__file__).parent / "data" / "lsat_questions.json"
        
        if not questions_file.exists():
            print("Questions data file not found, skipping seed")
            return
            
        with open(questions_file) as f:
            questions_data = json.load(f)
        
        for q_data in questions_data:
            question = Question(
                content=q_data["content"],
                question_type=QuestionType(q_data["type"]),
                difficulty_level=q_data["difficulty"],
                tags=q_data.get("tags", []),
                ai_generated=False  # Initial seed data is curated
            )
            session.add(question)
        
        await session.commit()
        print(f"Seeded {len(questions_data)} questions")

async def create_admin_user():
    """Create initial admin user for development."""
    async with AsyncSessionLocal() as session:
        admin_user = User(
            email="admin@studybuddy.com",
            subscription_tier="premium",
            learning_preferences={
                "preferred_difficulty": 5,
                "focus_areas": ["logical_reasoning", "reading_comprehension"]
            }
        )
        session.add(admin_user)
        await session.commit()
        print("Created admin user")

async def main():
    """Run all seeding operations."""
    print("Starting database seeding...")
    
    try:
        await seed_question_bank()
        await create_admin_user()
        print("Database seeding completed successfully")
    except Exception as e:
        print(f"Seeding failed: {e}")
        raise
    finally:
        await async_engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
```

### Backup and Recovery Strategy
```bash
#!/bin/bash
# scripts/backup_database.sh - Production backup strategy

set -e

DB_URL="${DATABASE_URL:-postgresql://localhost/studybuddy}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/studybuddy_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create database backup with compression
echo "Creating database backup..."
pg_dump "${DB_URL}" | gzip > "${BACKUP_FILE}.gz"

# Verify backup was created successfully
if [ -f "${BACKUP_FILE}.gz" ]; then
    echo "Backup created successfully: ${BACKUP_FILE}.gz"
    
    # Clean up old backups (keep last 7 days)
    find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +7 -delete
    
    # Upload to cloud storage (if configured)
    if [ -n "${AWS_S3_BUCKET}" ]; then
        aws s3 cp "${BACKUP_FILE}.gz" "s3://${AWS_S3_BUCKET}/backups/"
        echo "Backup uploaded to S3"
    fi
else
    echo "Backup failed!"
    exit 1
fi
```

## Data Privacy and FERPA Compliance
```sql
-- Data retention and privacy policies
-- Automated data cleanup for FERPA compliance

-- Function to anonymize user data after account deletion
CREATE OR REPLACE FUNCTION anonymize_deleted_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Replace with anonymized data instead of hard delete
    UPDATE user_responses 
    SET 
        user_id = '00000000-0000-0000-0000-000000000000',
        session_id = NULL
    WHERE user_id = OLD.id;
    
    UPDATE game_sessions
    SET
        user_id = '00000000-0000-0000-0000-000000000000'
    WHERE user_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for data anonymization
CREATE TRIGGER user_data_anonymization
    AFTER DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION anonymize_deleted_user_data();

-- Automated cleanup of old session data (90+ days)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM game_sessions 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND ended_at IS NOT NULL;
    
    DELETE FROM user_responses 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup via pg_cron (if available)
-- SELECT cron.schedule('cleanup-old-sessions', '0 2 * * 0', 'SELECT cleanup_old_sessions();');
```