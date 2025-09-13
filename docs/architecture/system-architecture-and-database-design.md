# System Architecture & Database Design

## Database Schema Design

### Core Entities
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

### Performance Optimization Indexes
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

## Data Relationships & Constraints
- **Users**: Central entity with soft cascading deletes to preserve analytics data
- **Questions**: Immutable after creation to maintain performance integrity
- **User Responses**: Comprehensive audit trail with response time tracking
- **Game Sessions**: Support both active and completed sessions with rich metadata
- **Review Schedule**: Implements SuperMemo algorithm for optimal retention

## Scalability Considerations
- **Partitioning**: `user_responses` table partitioned by month for query performance
- **Archival**: Automated archival of sessions older than 2 years
- **Caching**: Redis caching for frequently accessed questions and user stats
- **Read Replicas**: Separate read replicas for analytics and reporting queries