# Database Migration Automation Guide

## Overview
This guide covers automated migration strategies for the Mellowise platform, from development to production environments.

## Table of Contents
1. [Immediate Solutions](#immediate-solutions)
2. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
3. [Automated Question Import](#automated-question-import)
4. [API-Based Management](#api-based-management)
5. [Future-Proof Strategy](#future-proof-strategy)

## Immediate Solutions

### Supabase CLI Setup
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize project
supabase init

# Link to your project
supabase link --project-ref kptfedjloznfgvlocthf

# Run migrations automatically
supabase db push
```

## CI/CD Pipeline Setup

### GitHub Actions Workflow
Location: `.github/workflows/database-migration.yml`

**Features:**
- Automatic migration on push to main
- Manual trigger option
- Question import with commit tags
- Migration verification

**Usage:**
```bash
git commit -m "feat: Add new questions [import-questions]"
git push  # Triggers automatic import
```

## Automated Question Import

### Python Import Script
Location: `scripts/import-questions.py`

**Features:**
- Batch processing (100 questions at a time)
- Duplicate detection
- Multi-tenant support
- Async operations for performance

**Command Line Usage:**
```bash
# Development import
python scripts/import-questions.py --source data/questions --env development

# Production import with specific tenant
python scripts/import-questions.py --source data/questions --env production --tenant harvard-edu
```

### Import Statistics
- Processes 960 questions in ~30 seconds
- Automatic deduplication
- Transaction safety with rollback
- Detailed logging and error reporting

## API-Based Management

### REST API Endpoint
Location: `src/app/api/admin/questions/import/route.ts`

**Features:**
- Admin authentication required
- JSON payload support
- Batch processing
- Real-time import statistics

**Usage Example:**
```javascript
// Upload questions via API
const response = await fetch('/api/admin/questions/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    questions: questionsArray,
    tenant_id: 'demo',
    exam_type: 'lsat'
  })
});

const result = await response.json();
// { processed: 960, imported: 960, skipped: 0 }
```

## Future-Proof Strategy

### Development Workflow
```bash
# Start local Supabase with migrations
supabase start

# Reset database with fresh seed data
supabase db reset

# Run development server
npm run dev
```

### Production Deployment

#### Automatic Deployments
1. Push migrations to `supabase/migrations/`
2. GitHub Actions runs automatically
3. Verifies migration success
4. Notifies team via Slack/Discord

#### Manual Deployments
```bash
# Direct production migration
supabase db push --project-ref production-id

# With specific migration file
supabase db push --file migrations/007_new_feature.sql
```

### Scheduled Imports
Add to `.github/workflows/scheduled-import.yml`:
```yaml
on:
  schedule:
    - cron: '0 0 * * MON'  # Weekly Monday midnight UTC
jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Import weekly questions
        run: python scripts/import-questions.py --source data/weekly
```

## Migration Best Practices

### 1. Version Control
- All migrations in `supabase/migrations/`
- Sequential numbering (001, 002, 003...)
- Descriptive names (003_multi_tenant_foundation.sql)

### 2. Testing Strategy
```bash
# Test locally first
supabase db reset
supabase db push migrations/new_migration.sql

# Test in staging
supabase db push --project-ref staging-id

# Deploy to production
supabase db push --project-ref production-id
```

### 3. Rollback Plan
```sql
-- Every migration should have a rollback
-- migrations/007_feature.sql
CREATE TABLE new_feature (...);

-- migrations/007_feature_rollback.sql  
DROP TABLE IF EXISTS new_feature;
```

### 4. Performance Considerations
- Batch inserts (100-500 records at a time)
- Use transactions for consistency
- Add indexes after bulk imports
- Run VACUUM ANALYZE after large imports

## Environment Configuration

### Required Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# GitHub Secrets (for Actions)
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_PROJECT_ID=your-project-id
```

### Multi-Environment Setup
```javascript
// config/environments.js
const environments = {
  development: {
    supabaseUrl: process.env.DEV_SUPABASE_URL,
    migrations: './supabase/migrations/dev'
  },
  staging: {
    supabaseUrl: process.env.STAGING_SUPABASE_URL,
    migrations: './supabase/migrations/staging'
  },
  production: {
    supabaseUrl: process.env.PROD_SUPABASE_URL,
    migrations: './supabase/migrations/prod'
  }
};
```

## Monitoring & Alerts

### Health Checks
```typescript
// api/health/migrations
export async function GET() {
  const lastMigration = await supabase
    .from('schema_migrations')
    .select('version, executed_at')
    .order('executed_at', { ascending: false })
    .limit(1);
    
  return Response.json({
    status: 'healthy',
    lastMigration: lastMigration.data?.[0],
    questionCount: await getQuestionCount()
  });
}
```

### Error Notifications
Configure in GitHub Actions:
```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Migration failed in production!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

### Common Issues

#### 1. Migration Timeout
**Problem:** Large migrations timeout in dashboard
**Solution:** Use batched approach or CLI with extended timeout
```bash
supabase db push --timeout 600  # 10 minutes
```

#### 2. Duplicate Key Errors
**Problem:** Question IDs already exist
**Solution:** Use upsert or check existence first
```sql
INSERT INTO questions (...) 
ON CONFLICT (tenant_id, question_id) 
DO UPDATE SET updated_at = NOW();
```

#### 3. Permission Errors
**Problem:** Service role key not working
**Solution:** Verify key permissions in Supabase dashboard

## Success Metrics

### KPIs for Migration System
- **Migration Success Rate:** Target > 99.9%
- **Average Migration Time:** < 2 minutes for 1000 questions
- **Rollback Frequency:** < 1% of deployments
- **Downtime:** Zero-downtime deployments

### Monitoring Dashboard
```sql
-- Migration statistics view
CREATE VIEW migration_stats AS
SELECT 
  COUNT(*) as total_questions,
  COUNT(DISTINCT tenant_id) as tenants,
  COUNT(DISTINCT exam_type_id) as exam_types,
  MAX(created_at) as last_import,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as weekly_additions
FROM questions;
```

## Future Enhancements

### Planned Features
1. **GraphQL Migrations:** Hasura integration for real-time sync
2. **CDC Pipeline:** Change Data Capture for audit logs
3. **Multi-Region:** Replicated migrations across regions
4. **AI Validation:** GPT-4 validation of question quality pre-import
5. **Version Control:** Git-like branching for database schemas

### Scaling Considerations
- **Current:** 960 questions, single tenant
- **6 Months:** 10,000+ questions, 50 tenants
- **1 Year:** 100,000+ questions, 500 tenants
- **Architecture ready for:** 10M+ questions, 10,000+ tenants

---

**Last Updated:** September 12, 2024
**Maintained By:** Dev Team
**Questions:** Contact dev@mellowise.com