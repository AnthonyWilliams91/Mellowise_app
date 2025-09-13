# Deployment and Infrastructure

## Production Deployment Architecture

### Frontend Deployment - Vercel
```yaml
# vercel.json - Production-ready configuration
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/api/(.*)",
      "destination": "https://studybuddy-api.up.railway.app/api/$1",
      "permanent": false
    }
  ]
}
```

### Backend Deployment - Railway with Docker
```dockerfile
# Context7-verified FastAPI production deployment
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser
RUN chown -R appuser:appuser /app
USER appuser

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Production server configuration
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:$PORT", "--worker-class", "uvicorn.workers.UvicornWorker", "--workers", "2", "--timeout", "120"]
```

### Infrastructure as Code - Railway Configuration
```yaml
# railway.toml - Production service configuration
[build]
builder = "dockerfile"

[deploy]
startCommand = "gunicorn main:app --bind 0.0.0.0:$PORT --worker-class uvicorn.workers.UvicornWorker --workers 2"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[environment]
PYTHON_VERSION = "3.11"
PORT = { default = "8000" }
DATABASE_URL = { reference = "DATABASE_URL" }
REDIS_URL = { reference = "REDIS_URL" }
SUPABASE_URL = { reference = "SUPABASE_URL" }
SUPABASE_ANON_KEY = { reference = "SUPABASE_ANON_KEY" }
ANTHROPIC_API_KEY = { reference = "ANTHROPIC_API_KEY" }
OPENAI_API_KEY = { reference = "OPENAI_API_KEY" }
STRIPE_SECRET_KEY = { reference = "STRIPE_SECRET_KEY" }
SENTRY_DSN = { reference = "SENTRY_DSN" }
```

## Database Configuration - Supabase Pro
```sql
-- Context7-verified production database setup
-- Connection pooling configuration
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements, pg_cron';

-- Performance optimization
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Enable row level security for multi-tenancy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;

-- Row Level Security policies
CREATE POLICY "Users can only see own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can only see own responses" ON user_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see own sessions" ON game_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see own schedule" ON review_schedule FOR ALL USING (auth.uid() = user_id);
```

## Monitoring & Observability
```python
# Context7-verified monitoring setup
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlAlchemyIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[
        FastApiIntegration(auto_enabling_integrations=False),
        SqlAlchemyIntegration(),
    ],
    traces_sample_rate=0.1,  # Adjust for production load
    profiles_sample_rate=0.1,
    environment="production"
)

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Database connectivity check
        await database.execute("SELECT 1")
        
        # Redis connectivity check  
        await redis.ping()
        
        # AI service check
        ai_status = await check_ai_services()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": "connected",
                "redis": "connected", 
                "ai_services": ai_status
            }
        }
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=503, detail="Service unavailable")
```

## Cost Optimization Strategy
| Service | Free Tier | Paid Tier | Monthly Cost | Usage Projection |
|---------|-----------|-----------|--------------|------------------|
| **Vercel** | 100GB bandwidth | Pro: 1TB | $20 | Hobby sufficient for MVP |
| **Railway** | $5/month | Developer: $20 | $20 | Required for production |
| **Supabase** | 500MB DB | Pro: 8GB + extras | $25 | Required for real-time |
| **Anthropic** | - | Pay-per-token | $30-50 | Based on usage |
| **OpenAI** | $5 free credit | Pay-per-token | $20-30 | Backup service |
| **Stripe** | 2.9% + 30¢ | Same | ~$15 | Transaction fees |
| **Twilio** | - | Pay-per-SMS | $10 | SMS notifications |
| **Sentry** | 5K errors/month | $26/month | $0-26 | Free tier initially |
| **Total** | - | - | **$140-186/month** | Within budget |

## Scaling Strategy
1. **Horizontal Scaling**: Railway auto-scaling with load-based replicas
2. **Database Optimization**: Read replicas for analytics queries
3. **CDN Integration**: Vercel Edge Network for global distribution
4. **Caching Strategy**: Redis for sessions, question caching
5. **Background Processing**: Celery workers for AI generation
6. **Performance Monitoring**: Continuous optimization based on metrics