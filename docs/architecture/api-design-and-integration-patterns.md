# API Design & Integration Patterns

## API Architecture Principles
- **RESTful Design**: Clear resource-based URLs with standard HTTP methods
- **GraphQL Alternative**: Consider GraphQL for complex queries in future iterations
- **Versioning Strategy**: URL versioning (`/api/v1/`) for backward compatibility
- **Rate Limiting**: Tier-based rate limiting (free: 100/hour, premium: 1000/hour)
- **Error Handling**: Consistent error response format with detailed error codes

## Core API Endpoints

### Authentication & User Management
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

### Question Generation & Management
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

### Survival Mode Game Logic
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

### Learning & Progress Tracking
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

## Context7-Verified Integration Patterns

### TanStack Query Error Handling
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

### SlowAPI Rate Limiting Implementation
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

### Supabase Realtime Configuration
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

## Data Validation & Security
- **Input Sanitization**: Pydantic models for request validation
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content Security Policy and input encoding
- **CORS Configuration**: Restricted origins for production security
- **JWT Security**: Secure token handling with refresh token rotation