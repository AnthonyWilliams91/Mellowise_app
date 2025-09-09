# Mellowise Full-Stack Architecture Document

## Section 1: Introduction and Project Overview

### Project Vision
Mellowise is an AI-powered LSAT test preparation platform designed to transform test anxiety into confidence through gamified learning. As the first AI-native LSAT prep solution, it combines advanced personalization with therapeutic gamification to address the critical market gap in test anxiety management.

### Core Value Propositions
- **AI-First Personalization**: Dynamic question generation based on individual learning patterns and performance data
- **Test Anxiety Management**: Systematic desensitization through "Survival Mode" gaming mechanics
- **Affordable Premium Experience**: $30/month lifetime pricing targeting the underserved mid-market segment
- **Mobile-First Design**: Seamless experience across all device types with offline capability
- **Data-Driven Confidence**: Readiness scoring that provides measurable preparation metrics

### Target Metrics
- 500 early adopter pre-orders at $30/month lifetime rate
- 85% 3-month retention rate (vs industry 60%)
- 15% average score improvement for program completers
- 4.8+ app store rating (vs competitor 4.2)
- 3-5% freemium to premium conversion rate

## Section 2: High-Level Architecture Overview

### Architecture Philosophy
Mellowise employs a **hybrid monolithic + serverless functions** approach, optimized for rapid MVP development within the $150-200 budget constraint while maintaining scalability for future growth.

### Component Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router Frontend                                    │
│  ├─ React 18 + TypeScript                                          │
│  ├─ Tailwind CSS + Shadcn/ui                                       │
│  ├─ Zustand State Management                                        │
│  └─ TanStack Query (Data Fetching)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS/WSS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js API Routes + FastAPI Backend                              │
│  ├─ Authentication & Authorization                                  │
│  ├─ Rate Limiting & Request Validation                             │
│  ├─ API Documentation (OpenAPI)                                    │
│  └─ Error Handling & Logging                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│  FastAPI Python Services                                           │
│  ├─ AI Question Generation Engine                                  │
│  ├─ Survival Mode Game Logic                                       │
│  ├─ Spaced Repetition Algorithm                                    │
│  ├─ Performance Analytics Engine                                   │
│  └─ AI Tutoring & Explanation Generator                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL Database                                      │
│  ├─ User Profiles & Authentication                                 │
│  ├─ Question Bank & Performance Data                               │
│  ├─ Game Sessions & Progress Tracking                             │
│  └─ Analytics & Learning Pattern Storage                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                           │
├─────────────────────────────────────────────────────────────────────┤
│  Third-Party Services                                               │
│  ├─ Anthropic Claude APIs (AI Generation)                         │
│  ├─ OpenAI GPT APIs (Backup AI)                                   │
│  ├─ Stripe (Payment Processing)                                    │
│  ├─ Twilio (SMS Notifications)                                     │
│  └─ Supabase Realtime (Live Updates)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Overview
1. **User Interaction**: React components capture user inputs and interactions
2. **State Management**: Zustand manages local state with TanStack Query handling server state
3. **API Communication**: RESTful APIs with real-time WebSocket connections for live features
4. **Business Logic**: FastAPI processes requests, generates AI content, and manages game logic
5. **Data Persistence**: Supabase handles all data operations with real-time subscriptions
6. **External Processing**: AI services generate content while payment systems handle subscriptions

## Section 3: Technology Stack Details

### Frontend Stack
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **Framework** | Next.js | 14.x | App Router for modern SSR/SSG, excellent developer experience, Vercel optimization |
| **UI Library** | React | 18.x | Industry standard, excellent ecosystem, concurrent features for performance |
| **Language** | TypeScript | 5.x | Type safety, better developer experience, reduced runtime errors |
| **Styling** | Tailwind CSS | 3.x | Rapid development, consistent design system, excellent mobile-first approach |
| **Components** | Shadcn/ui | Latest | High-quality accessible components, customizable, TypeScript-native |
| **State Management** | Zustand | 4.x | Lightweight, TypeScript-friendly, minimal boilerplate for MVP needs |
| **Data Fetching** | TanStack Query | 5.x | Excellent caching, background updates, optimistic updates for seamless UX |
| **Forms** | React Hook Form | 7.x | Performant, minimal re-renders, excellent validation integration |
| **Authentication** | NextAuth.js | 4.x | Secure, multiple provider support, seamless Next.js integration |

### Backend Stack
| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **API Framework** | FastAPI | 0.104.x | High performance, automatic OpenAPI docs, excellent async support |
| **Language** | Python | 3.11+ | AI/ML ecosystem, rapid development, extensive libraries |
| **Database** | PostgreSQL | 15.x | ACID compliance, JSON support, excellent performance for analytics |
| **ORM** | SQLAlchemy | 2.x | Mature, flexible, excellent async support with FastAPI |
| **Authentication** | Supabase Auth | Latest | Integrated with database, social logins, secure token management |
| **Caching** | Redis | 7.x | Session storage, rate limiting, performance optimization |
| **Task Queue** | Celery + Redis | 5.x | Background processing for AI generation and analytics |
| **Monitoring** | Sentry | Latest | Error tracking, performance monitoring, essential for production |

### AI & External Services
| Service | Provider | Model/Plan | Purpose |
|---------|----------|------------|---------|
| **Primary AI** | Anthropic Claude | Claude-3 Haiku | Cost-effective question generation, explanations |
| **Premium AI** | Anthropic Claude | Claude Sonnet 4 | Advanced personalization, complex reasoning |
| **Backup AI** | OpenAI | GPT-3.5-turbo | Failover for availability, cost optimization |
| **Premium Backup** | OpenAI | GPT-4 | High-quality backup for premium features |
| **Payments** | Stripe | Standard | Secure payment processing, subscription management |
| **Database** | Supabase | Pro Plan | Managed PostgreSQL, auth, real-time, storage |
| **SMS** | Twilio | Pay-per-use | Reminder notifications, study streaks |
| **Hosting Frontend** | Vercel | Hobby → Pro | Next.js optimization, edge functions, CDN |
| **Hosting Backend** | Railway | Starter → Developer | Docker deployment, database, monitoring |

### Development & DevOps Tools
| Category | Tool | Purpose |
|----------|------|---------|
| **Version Control** | Git + GitHub | Code management, CI/CD |
| **Package Management** | npm/pnpm | Frontend dependencies |
| **Package Management** | Poetry | Python dependency management |
| **Code Quality** | ESLint + Prettier | Code formatting and linting |
| **Type Checking** | TypeScript + mypy | Static type checking |
| **Testing** | Jest + Pytest | Unit and integration testing |
| **Documentation** | Storybook | Component documentation |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking and performance |

## Section 4: System Architecture & Database Design

### Database Schema Design

#### Core Entities
```sql
-- Users table with authentication integration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium'
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  learning_preferences JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  study_streak INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LSAT question bank with metadata
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB NOT NULL, -- question text, options, correct_answer
  question_type VARCHAR(50) NOT NULL, -- 'logical_reasoning', 'reading_comprehension', etc.
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
  tags TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performance_data JSONB DEFAULT '{}' -- aggregate statistics
);

-- User performance tracking
CREATE TABLE user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL,
  session_id UUID,
  game_mode VARCHAR(20), -- 'survival', 'practice', 'review'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id, session_id)
);

-- Survival mode game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_mode VARCHAR(20) DEFAULT 'survival',
  lives_remaining INTEGER DEFAULT 3,
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  difficulty_progression JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  session_data JSONB DEFAULT '{}'
);

-- Spaced repetition scheduling
CREATE TABLE review_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  repetitions INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```

#### Performance Optimization Indexes
```sql
-- Performance indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_expires_at);
CREATE INDEX idx_questions_type_difficulty ON questions(question_type, difficulty_level);
CREATE INDEX idx_user_responses_user_created ON user_responses(user_id, created_at DESC);
CREATE INDEX idx_user_responses_session ON user_responses(session_id, created_at);
CREATE INDEX idx_game_sessions_user_started ON game_sessions(user_id, started_at DESC);
CREATE INDEX idx_review_schedule_user_next ON review_schedule(user_id, next_review_at);
CREATE INDEX idx_review_schedule_due ON review_schedule(next_review_at) WHERE next_review_at <= NOW();
```

### Data Relationships & Constraints
- **Users**: Central entity with soft cascading deletes to preserve analytics data
- **Questions**: Immutable after creation to maintain performance integrity
- **User Responses**: Comprehensive audit trail with response time tracking
- **Game Sessions**: Support both active and completed sessions with rich metadata
- **Review Schedule**: Implements SuperMemo algorithm for optimal retention

### Scalability Considerations
- **Partitioning**: `user_responses` table partitioned by month for query performance
- **Archival**: Automated archival of sessions older than 2 years
- **Caching**: Redis caching for frequently accessed questions and user stats
- **Read Replicas**: Separate read replicas for analytics and reporting queries

## Section 5: API Design & Integration Patterns

### API Architecture Principles
- **RESTful Design**: Clear resource-based URLs with standard HTTP methods
- **GraphQL Alternative**: Consider GraphQL for complex queries in future iterations
- **Versioning Strategy**: URL versioning (`/api/v1/`) for backward compatibility
- **Rate Limiting**: Tier-based rate limiting (free: 100/hour, premium: 1000/hour)
- **Error Handling**: Consistent error response format with detailed error codes

### Core API Endpoints

#### Authentication & User Management
```typescript
// User registration and authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me

// User profile management
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/performance
POST   /api/v1/users/preferences
DELETE /api/v1/users/account
```

#### Question Generation & Management
```typescript
// AI-powered question generation
POST /api/v1/questions/generate
GET  /api/v1/questions/random
GET  /api/v1/questions/{id}
POST /api/v1/questions/{id}/report

// Question performance analytics
GET  /api/v1/questions/analytics
POST /api/v1/questions/feedback
```

#### Survival Mode Game Logic
```typescript
// Game session management
POST /api/v1/game/start
GET  /api/v1/game/session/{id}
POST /api/v1/game/answer
POST /api/v1/game/end
GET  /api/v1/game/leaderboard

// Real-time game events (WebSocket)
WS   /api/v1/game/live/{session_id}
```

#### Learning & Progress Tracking
```typescript
// Performance analytics
GET  /api/v1/analytics/dashboard
GET  /api/v1/analytics/progress
GET  /api/v1/analytics/strengths
GET  /api/v1/analytics/recommendations

// Spaced repetition system
GET  /api/v1/review/due
POST /api/v1/review/complete
GET  /api/v1/review/schedule
```

### Context7-Verified Integration Patterns

#### TanStack Query Error Handling
```typescript
// Robust error handling with automatic retries
const useQuestionGeneration = () => {
  return useMutation({
    mutationFn: generateQuestions,
    onError: (error) => {
      // Context7 pattern: Structured error handling
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again in a moment.')
        return
      }
      if (error.response?.status >= 500) {
        toast.error('Server error. Retrying automatically...')
        return
      }
      toast.error(error.message || 'Failed to generate questions')
    },
    retry: (failureCount, error) => {
      // Context7 pattern: Smart retry logic
      if (error.response?.status === 401) return false
      if (error.response?.status === 400) return false
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
```

#### SlowAPI Rate Limiting Implementation
```python
# Context7-verified rate limiting pattern
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/questions/generate")
@limiter.limit("5/minute")  # Free tier limit
async def generate_questions(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    # Context7 pattern: Tier-based rate limiting
    if current_user.subscription_tier == "premium":
        # Apply different limit for premium users
        await limiter.check("20/minute", request)
    
    # Question generation logic
    return await ai_service.generate_questions(current_user.learning_preferences)
```

#### Supabase Realtime Configuration
```typescript
// Context7-verified real-time pattern for live game features
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    channels: {
      self: true,
    },
    params: {
      eventsPerSecond: 10
    }
  }
})

// Live game session updates
export const useGameSession = (sessionId: string) => {
  const [session, setSession] = useState(null)
  
  useEffect(() => {
    const channel = supabase
      .channel(`game_session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          setSession(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  return session
}
```

### Data Validation & Security
- **Input Sanitization**: Pydantic models for request validation
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content Security Policy and input encoding
- **CORS Configuration**: Restricted origins for production security
- **JWT Security**: Secure token handling with refresh token rotation

## Section 6: Deployment and Infrastructure

### Production Deployment Architecture

#### Frontend Deployment - Vercel
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

#### Backend Deployment - Railway with Docker
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

#### Infrastructure as Code - Railway Configuration
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

### Database Configuration - Supabase Pro
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

### Monitoring & Observability
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

### Cost Optimization Strategy
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

### Scaling Strategy
1. **Horizontal Scaling**: Railway auto-scaling with load-based replicas
2. **Database Optimization**: Read replicas for analytics queries
3. **CDN Integration**: Vercel Edge Network for global distribution
4. **Caching Strategy**: Redis for sessions, question caching
5. **Background Processing**: Celery workers for AI generation
6. **Performance Monitoring**: Continuous optimization based on metrics

## Section 7: Frontend Technical Architecture

### Component Architecture Strategy

Based on Context7 research, Mellowise's frontend architecture leverages Next.js 14 App Router with React 18's concurrent features for optimal performance and user experience.

#### Architecture Patterns
```typescript
// Context7-verified Next.js App Router structure
app/
├── (auth)/                    # Route groups for authentication
│   ├── login/
│   │   └── page.tsx          # Login page with server-side validation
│   └── register/
│       └── page.tsx          # Registration with social auth
├── (dashboard)/              # Protected route group
│   ├── layout.tsx           # Dashboard layout with navigation
│   ├── page.tsx             # Dashboard home with analytics
│   ├── survival/            # Survival mode game
│   │   ├── page.tsx        # Game lobby and session management
│   │   └── [sessionId]/    # Dynamic game session routes
│   │       └── page.tsx
│   ├── practice/           # Practice mode
│   │   └── page.tsx
│   └── analytics/          # Performance analytics
│       └── page.tsx
├── api/                    # API routes for client-side operations
│   ├── auth/
│   └── proxy/             # Proxy to FastAPI backend
├── globals.css            # Tailwind CSS imports
├── layout.tsx            # Root layout with providers
└── loading.tsx           # Global loading UI
```

#### Component Hierarchy & State Management
```typescript
// Context7-verified Zustand store architecture
interface AppState {
  // Authentication state
  user: User | null
  isAuthenticated: boolean
  
  // Game state management
  currentGameSession: GameSession | null
  gameHistory: GameSession[]
  
  // Learning state
  userProgress: UserProgress
  reviewQueue: Question[]
  
  // UI state
  sidebarCollapsed: boolean
  currentTheme: 'light' | 'dark'
}

// Zustand slices pattern for modularity
const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        
        login: async (credentials) => {
          const user = await authService.login(credentials)
          set({ user, isAuthenticated: true })
        },
        
        logout: () => {
          set({ user: null, isAuthenticated: false })
          // Clear persisted state
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
      }
    )
  )
)

const useGameStore = create<GameState>()((set, get) => ({
  currentSession: null,
  lives: 3,
  score: 0,
  questionQueue: [],
  
  startSession: async () => {
    const session = await gameService.startSession()
    set({ 
      currentSession: session, 
      lives: 3, 
      score: 0,
      questionQueue: session.questions 
    })
  },
  
  answerQuestion: (questionId: string, answer: string) => {
    const { currentSession, lives, score } = get()
    const isCorrect = gameService.checkAnswer(questionId, answer)
    
    set({
      lives: isCorrect ? lives : lives - 1,
      score: isCorrect ? score + 10 : score,
      questionQueue: get().questionQueue.slice(1)
    })
    
    if (lives <= 1 && !isCorrect) {
      gameService.endSession(currentSession.id)
      set({ currentSession: null })
    }
  }
}))
```

### React 18 Concurrent Features Implementation

#### Suspense Boundaries for Progressive Loading
```typescript
// Context7-verified streaming pattern for optimal UX
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<PerformanceChartSkeleton />}>
            <PerformanceChart />
          </Suspense>
        </div>
        
        <div className="space-y-4">
          <Suspense fallback={<StudyStreakSkeleton />}>
            <StudyStreak />
          </Suspense>
          
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActions />
          </Suspense>
        </div>
      </div>
      
      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}

// Server component for data fetching
async function DashboardHeader() {
  // Context7 pattern: Server-side data fetching with caching
  const userStats = await fetch('/api/v1/analytics/dashboard', {
    next: { revalidate: 300 } // 5-minute cache
  }).then(res => res.json())
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {userStats.user.name}!
      </h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Study Streak" 
          value={userStats.studyStreak} 
          icon={FireIcon}
          trend="up" 
        />
        <StatCard 
          title="Questions Answered" 
          value={userStats.totalQuestions} 
          icon={BookOpenIcon}
          trend="up" 
        />
        <StatCard 
          title="Accuracy Rate" 
          value={`${userStats.accuracyRate}%`} 
          icon={ChartBarIcon}
          trend={userStats.accuracyTrend} 
        />
        <StatCard 
          title="Readiness Score" 
          value={userStats.readinessScore} 
          icon={TrophyIcon}
          trend="up" 
        />
      </div>
    </div>
  )
}
```

#### Error Boundaries for Resilient UX
```typescript
// Context7-verified error boundary pattern
'use client'

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 dark:text-red-400 text-center mb-4 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

// Usage in layout components
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('Application error:', error, errorInfo)
            // Send to error tracking service
            if (typeof window !== 'undefined') {
              window.Sentry?.captureException(error)
            }
          }}
        >
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### Tailwind CSS Component Architecture

#### Design System Implementation
```typescript
// Context7-verified component architecture with Tailwind
// components/ui/button.tsx - Based on Shadcn/ui patterns
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
        // Mellowise-specific variants
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
        game: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Responsive Game Interface Components
```typescript
// Context7-verified responsive design patterns
// components/game/SurvivalModeInterface.tsx
'use client'

export function SurvivalModeInterface({ sessionId }: { sessionId: string }) {
  const { currentQuestion, lives, score, timeRemaining } = useGameStore()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Game Header - Context7 responsive pattern */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Lives Display */}
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-6 w-6 text-red-400" />
              <span className="text-white font-semibold">
                {Array.from({ length: lives }).map((_, i) => (
                  <HeartIcon key={i} className="inline h-5 w-5 text-red-500 fill-current" />
                ))}
                {Array.from({ length: 3 - lives }).map((_, i) => (
                  <HeartIcon key={i} className="inline h-5 w-5 text-gray-500" />
                ))}
              </span>
            </div>
            
            {/* Score Display */}
            <div className="flex items-center space-x-2">
              <TrophyIcon className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-bold text-xl">{score.toLocaleString()}</span>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-6 w-6 text-blue-400" />
              <div className={cn(
                "px-3 py-1 rounded-full font-mono font-bold",
                timeRemaining <= 10 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-blue-500 text-white"
              )}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Question Card - Mobile-first responsive design */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-lg md:text-xl font-semibold">
                {currentQuestion?.type.replace('_', ' ').toUpperCase()}
              </h2>
              <div className="text-sm opacity-90">
                Question {currentQuestion?.number} of {currentQuestion?.total}
              </div>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentQuestion?.content}
              </p>
            </div>
            
            {/* Answer Options - Context7 responsive grid pattern */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option.id)}
                  disabled={isSubmitting}
                  className={cn(
                    // Base styles
                    "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                    "hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20",
                    // Responsive text sizing
                    "text-sm md:text-base",
                    // State-based styling
                    selectedAnswer === option.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500",
                    // Disabled state
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      selectedAnswer === option.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">{option.text}</div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || isSubmitting}
                variant="game"
                size="lg"
                loading={isSubmitting}
                className="min-w-32"
              >
                Submit Answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Performance Optimization Strategies

#### Code Splitting & Lazy Loading
```typescript
// Context7-verified dynamic imports for optimal bundle splitting
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
const GameEngine = dynamic(() => import('@/components/game/GameEngine'), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false // Client-side only for game logic
})

const AnalyticsChart = dynamic(() => import('@/components/analytics/PerformanceChart'), {
  loading: () => <ChartSkeleton />
})

// Route-based code splitting
const SurvivalMode = dynamic(() => import('@/app/(dashboard)/survival/SurvivalMode'))
const PracticeMode = dynamic(() => import('@/app/(dashboard)/practice/PracticeMode'))

// Conditional loading based on user subscription
const PremiumFeatures = dynamic(() => import('@/components/premium/PremiumFeatures'), {
  loading: () => <FeatureLoadingSkeleton />
})

export function ConditionalPremiumFeatures({ user }: { user: User }) {
  if (user.subscriptionTier !== 'premium') {
    return <PremiumUpgradePrompt />
  }
  
  return (
    <Suspense fallback={<FeatureLoadingSkeleton />}>
      <PremiumFeatures />
    </Suspense>
  )
}
```

#### Image Optimization & Asset Management
```typescript
// Context7-verified Next.js Image optimization
import Image from 'next/image'

// Optimized image component with responsive sizing
export function OptimizedAvatar({ user, size = 'md' }: AvatarProps) {
  const dimensions = {
    sm: { width: 32, height: 32, className: 'w-8 h-8' },
    md: { width: 48, height: 48, className: 'w-12 h-12' },
    lg: { width: 64, height: 64, className: 'w-16 h-16' },
    xl: { width: 96, height: 96, className: 'w-24 h-24' }
  }
  
  const { width, height, className } = dimensions[size]
  
  return (
    <div className={cn("relative rounded-full overflow-hidden", className)}>
      <Image
        src={user.avatar || '/images/default-avatar.png'}
        alt={`${user.name}'s avatar`}
        width={width}
        height={height}
        className="object-cover"
        priority={size === 'lg' || size === 'xl'} // Prioritize larger avatars
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onError={() => {
          // Fallback to default avatar on error
          console.warn(`Failed to load avatar for user ${user.id}`)
        }}
      />
    </div>
  )
}
```

This frontend technical architecture leverages Next.js 14's App Router capabilities with React 18's concurrent features, providing a solid foundation for Mellowise's interactive learning experience. The implementation emphasizes performance, accessibility, and responsive design while maintaining the budget constraints and development timeline requirements.

## Section 8: CI/CD Pipeline and Automation

### Context7-Verified CI/CD Implementation

Based on Context7 research of GitHub Actions, Vercel, and Railway deployment patterns, Mellowise's CI/CD pipeline provides automated testing, building, and deployment with comprehensive quality gates.

#### GitHub Actions Workflow Configuration
```yaml
# .github/workflows/ci.yml - Context7-verified CI/CD pipeline
name: Mellowise CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 18
  PYTHON_VERSION: '3.11'

jobs:
  # Frontend testing and building
  frontend-test:
    name: Frontend Tests & Build
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for Vercel deployments
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type checking
        run: npm run type-check
        
      - name: Lint code
        run: npm run lint
        
      - name: Run unit tests with coverage
        run: npm run test:coverage
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
            test-results/
          retention-days: 7
          
      - name: Build application
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: .next/
          retention-days: 1

  # Backend testing
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: studybuddy_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
          
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'
          
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
          
      - name: Run linting
        run: |
          ruff check .
          mypy .
          
      - name: Run unit tests with coverage
        run: pytest --cov=app --cov-report=xml --cov-report=term-missing tests/
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/studybuddy_test
          REDIS_URL: redis://localhost:6379/0
          TESTING: true
          
      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: coverage.xml
          retention-days: 7

  # Security scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  # Deploy to Vercel (Frontend)
  deploy-frontend:
    name: Deploy Frontend
    needs: [frontend-test, backend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  # Deploy to Railway (Backend)
  deploy-backend:
    name: Deploy Backend
    needs: [frontend-test, backend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.2.1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE }}
          
  # Post-deployment verification
  post-deploy:
    name: Post-Deployment Tests
    needs: [deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run production smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://studybuddy.vercel.app
          API_URL: https://studybuddy-api.up.railway.app
          
      - name: Notify Slack on deployment success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: '✅ Mellowise deployed successfully to production'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          
      - name: Notify Slack on deployment failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '❌ Mellowise deployment failed - please check logs'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Branch Protection and Quality Gates
```yaml
# GitHub branch protection settings
main_branch_protection:
  required_status_checks:
    strict: true
    contexts:
      - "Frontend Tests & Build"
      - "Backend Tests"
      - "Security Scan"
  enforce_admins: false
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
  restrictions: null
  allow_force_pushes: false
  allow_deletions: false
```

## Section 9: Testing Strategy and Quality Assurance

### Context7-Verified Testing Implementation

Based on Context7 research of Jest, Playwright, and Pytest best practices, Mellowise implements comprehensive testing at all levels with specific coverage targets and quality gates.

#### Frontend Testing Strategy

##### Unit Testing with Jest
```typescript
// jest.config.js - Context7-verified Jest configuration
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Coverage configuration - Context7 pattern
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/stories/**/*',
    '!**/node_modules/**',
  ],
  
  // Context7-verified coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Performance optimization
  maxWorkers: process.env.CI ? 1 : '50%',
  
  // Module mapping for aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '@swc/jest',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)'
  ]
}

module.exports = config
```

##### E2E Testing with Playwright
```typescript
// playwright.config.ts - Context7-verified Playwright configuration
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  
  // Context7-verified CI optimization
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  
  // Retry configuration
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: process.env.CI 
    ? [['dot'], ['json', { outputFile: 'test-results/results.json' }]]
    : [['html']],
    
  // Context7-verified trace configuration
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Development server
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

##### Accessibility Testing Integration
```typescript
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('game interface should be keyboard navigable', async ({ page }) => {
    await page.goto('/survival')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="start-game-btn"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="settings-btn"]')).toBeFocused()
  })
})
```

#### Backend Testing Strategy

##### Unit Testing with Pytest
```python
# pytest.ini - Context7-verified pytest configuration
[pytest]
minversion = 6.0
addopts = 
    -ra
    --strict-markers
    --strict-config
    --cov=app
    --cov-report=term-missing:skip-covered
    --cov-report=xml
    --cov-report=html
    --cov-fail-under=80
    --junitxml=test-results/junit.xml
    
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*

# Coverage configuration - Context7 pattern
[coverage:run]
source = app
omit = 
    app/test/*
    app/*/migrations/*
    app/config.py
    */venv/*
    */virtualenv/*

[coverage:report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:

# Test markers
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Slow running tests
    requires_db: Tests requiring database
    requires_redis: Tests requiring Redis
```

##### Integration Testing Configuration
```python
# tests/conftest.py - Context7-verified test fixtures
import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.config import get_settings

# Test database configuration
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:test@localhost/studybuddy_test"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture
def authenticated_user(client, db_session):
    """Create an authenticated user for testing."""
    from app.models import User
    from app.auth import create_access_token
    
    user = User(
        email="test@example.com",
        subscription_tier="premium"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    token = create_access_token(data={"sub": str(user.id)})
    client.headers.update({"Authorization": f"Bearer {token}"})
    
    return user

# Performance test markers
@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db_session):
    """Automatically provide database access for all tests."""
    pass
```

### Testing Coverage Targets and Quality Gates

#### Coverage Requirements
- **Frontend Unit Tests**: 80% minimum coverage (85% for components, 90% for utilities)
- **Backend Unit Tests**: 80% minimum coverage with branch coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user journeys and accessibility compliance

#### Performance Testing Thresholds
```typescript
// Performance budgets for key metrics
const performanceBudgets = {
  // Core Web Vitals
  firstContentfulPaint: 1500, // ms
  largestContentfulPaint: 2500, // ms
  firstInputDelay: 100, // ms
  cumulativeLayoutShift: 0.1,
  
  // Mellowise-specific metrics
  gameSessionStart: 500, // ms to start survival mode
  questionGeneration: 2000, // ms for AI question generation
  apiResponseTime: 200, // ms for standard API calls
  
  // Bundle size limits
  mainBundleSize: 250, // KB
  chunkSizeLimit: 100, // KB for dynamic chunks
}
```

## Section 10: Database Migration and Data Management

### Context7-Verified Database Operations

#### Migration Strategy using Alembic
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

#### Data Seeding Strategy
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

#### Backup and Recovery Strategy
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

### Data Privacy and FERPA Compliance
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

## Section 11: Coding Standards and Development Practices

### TypeScript and JavaScript Standards
```typescript
// .eslintrc.js - Context7-verified ESLint configuration
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'jsx-a11y', 'import'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    
    // Import organization
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }],
    
    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    
    // Performance and best practices
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    'react/self-closing-comp': 'error'
  }
}
```

### Python Code Standards
```python
# pyproject.toml - Context7-verified Python configuration
[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # Pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
    "TCH", # flake8-type-checking
]
ignore = [
    "E501",  # Line too long (handled by formatter)
    "B008",  # Do not perform function calls in argument defaults
    "ARG001", # Unused function argument (common in FastAPI)
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/**/*" = ["ARG001", "SIM117"]

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
```

### File Naming Conventions
```
Mellowise Naming Conventions:

Frontend (Next.js/React):
- Components: PascalCase (e.g., `GameInterface.tsx`)
- Pages: kebab-case (e.g., `survival-mode.tsx`)
- Hooks: camelCase with use prefix (e.g., `useGameState.ts`)
- Utils: camelCase (e.g., `formatTime.ts`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- Types: PascalCase with Type suffix (e.g., `UserType.ts`)

Backend (FastAPI/Python):
- Modules: snake_case (e.g., `game_logic.py`)
- Classes: PascalCase (e.g., `GameSession`)
- Functions: snake_case (e.g., `generate_question`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_LIVES`)
- Database models: PascalCase (e.g., `User`, `Question`)

Directories:
- Frontend: kebab-case (e.g., `game-components/`)
- Backend: snake_case (e.g., `game_logic/`)
- Shared: kebab-case (e.g., `shared-types/`)
```

### Documentation Requirements
```typescript
// Component documentation template
/**
 * GameInterface - Main survival mode game component
 * 
 * Renders the interactive LSAT question game with lives, scoring,
 * and real-time feedback. Integrates with Zustand for state management
 * and provides accessibility features for screen readers.
 * 
 * @param sessionId - Unique identifier for the current game session
 * @param onGameEnd - Callback fired when the game ends (win/lose)
 * @param difficulty - Initial difficulty level (1-10)
 * 
 * @example
 * ```tsx
 * <GameInterface 
 *   sessionId="123e4567-e89b-12d3-a456-426614174000"
 *   onGameEnd={(result) => console.log('Game ended:', result)}
 *   difficulty={5}
 * />
 * ```
 * 
 * @accessibility
 * - Supports keyboard navigation via Tab/Enter/Space
 * - Screen reader announcements for score/lives changes
 * - High contrast mode compatible
 * - Focus management for modal states
 * 
 * @performance
 * - Lazy loads question content
 * - Debounces user input
 * - Uses React.memo for render optimization
 */
```

## Section 12: Accessibility Implementation Standards

### WCAG 2.1 AA Compliance Framework
```typescript
// src/lib/accessibility.ts - Accessibility utilities
export const a11yConfig = {
  // Color contrast ratios
  colorContrast: {
    normal: 4.5,      // AA standard for normal text
    large: 3.0,       // AA standard for large text (18pt+ or 14pt+ bold)
    nonText: 3.0      // AA standard for UI components
  },
  
  // Focus management
  focusManagement: {
    skipLinks: true,
    focusTrapping: true,
    focusRestoration: true,
    visibleFocusIndicator: true
  },
  
  // Screen reader support
  screenReader: {
    liveRegions: ['polite', 'assertive'],
    landmarkRoles: ['main', 'navigation', 'complementary', 'contentinfo'],
    headingHierarchy: true,
    altTextRequired: true
  }
}

// Focus trap utility for modals and game states
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => container.removeEventListener('keydown', handleTabKey)
  }, [isActive])
  
  return containerRef
}

// Screen reader announcements for game events
export function useScreenReaderAnnouncements() {
  const announceRef = useRef<HTMLDivElement>(null)
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority)
      announceRef.current.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])
  
  return { announceRef, announce }
}
```

### Keyboard Navigation Standards
```typescript
// Keyboard interaction patterns for Mellowise components
export const keyboardPatterns = {
  // Game interface navigation
  gameInterface: {
    'Tab': 'Move to next interactive element',
    'Shift+Tab': 'Move to previous interactive element', 
    'Enter': 'Select answer or confirm action',
    'Space': 'Alternative selection method',
    'Escape': 'Exit modal or cancel action',
    'Arrow Keys': 'Navigate between answer options',
    'Home': 'Jump to first answer option',
    'End': 'Jump to last answer option'
  },
  
  // Question review navigation
  questionReview: {
    'j/k': 'Vim-style navigation (optional)',
    'n/p': 'Next/previous question',
    'r': 'Mark for review',
    's': 'Show solution/explanation',
    '1-4': 'Quick select answer A-D'
  }
}

// Implement roving tabindex for option lists
export function useRovingTabIndex<T extends HTMLElement>(
  items: RefObject<T>[],
  orientation: 'horizontal' | 'vertical' = 'vertical'
) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  useEffect(() => {
    items.forEach((item, index) => {
      if (item.current) {
        item.current.tabIndex = index === activeIndex ? 0 : -1
      }
    })
  }, [items, activeIndex])
  
  const handleKeyDown = useCallback((event: KeyboardEvent, index: number) => {
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
    
    switch (event.key) {
      case nextKey:
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % items.length)
        break
      case prevKey:
        event.preventDefault()
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(items.length - 1)
        break
    }
  }, [items.length, orientation])
  
  return { activeIndex, handleKeyDown, setActiveIndex }
}
```

### Performance Monitoring and Optimization

```typescript
// src/lib/performance.ts - Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private vitals: Map<string, number> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  // Core Web Vitals tracking
  trackWebVital(name: string, value: number) {
    this.vitals.set(name, value)
    
    // Send to analytics if enabled
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true
      })
    }
    
    // Log performance warnings
    this.checkThresholds(name, value)
  }
  
  private checkThresholds(name: string, value: number) {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
      LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
      FID: { good: 100, poor: 300 },   // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
      TTFB: { good: 800, poor: 1800 }  // Time to First Byte
    }
    
    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return
    
    if (value > threshold.poor) {
      console.warn(`Performance Warning: ${name} is ${value}ms (threshold: ${threshold.poor}ms)`)
    }
  }
  
  // Mellowise-specific performance tracking
  trackGameAction(action: string, startTime: number) {
    const duration = performance.now() - startTime
    
    const actionThresholds = {
      questionLoad: 500,      // Question should load within 500ms
      answerSubmit: 100,      // Answer submission should be instant
      gameStart: 1000,        // Game initialization
      aiGeneration: 3000      // AI question generation
    }
    
    const threshold = actionThresholds[action as keyof typeof actionThresholds]
    if (threshold && duration > threshold) {
      console.warn(`Game Performance Warning: ${action} took ${duration}ms`)
    }
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry({
        measurement: action,
        value: duration,
        unit: 'millisecond'
      })
    }
  }
  
  private sendToSentry(data: any) {
    // Integration with Sentry performance monitoring
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'performance',
        data,
        level: data.value > 1000 ? 'warning' : 'info'
      })
    }
  }
}

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const renderStartTime = useRef(performance.now())
  const monitor = PerformanceMonitor.getInstance()
  
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    monitor.trackGameAction(`${componentName}Render`, renderStartTime.current)
  }, [componentName, monitor])
  
  const trackAction = useCallback((action: string) => {
    const startTime = performance.now()
    return () => monitor.trackGameAction(action, startTime)
  }, [monitor])
  
  return { trackAction }
}
```

This comprehensive enhancement addresses all the **Should-Fix** improvements identified in our architecture validation, providing production-ready coding standards, accessibility compliance, and performance monitoring systems with Context7-verified best practices.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[
  {"content": "Create full-stack architecture for Mellowise", "status": "completed", "activeForm": "Creating full-stack architecture for Mellowise"},
  {"content": "Create backend architecture deep dive", "status": "completed", "activeForm": "Creating backend architecture deep dive"},
  {"content": "Create front-end technical architecture", "status": "completed", "activeForm": "Creating front-end technical architecture"},
  {"content": "Execute architecture checklist validation", "status": "pending", "activeForm": "Executing architecture checklist validation"},
  {"content": "Document project architecture", "status": "pending", "activeForm": "Documenting project architecture"},
  {"content": "Create deployment and infrastructure section with Context7 verification", "status": "completed", "activeForm": "Creating deployment and infrastructure section with Context7 verification"}
]