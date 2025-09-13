-- Mellowise Core Database Schema
-- Version: 1.0
-- Created: 2025-01-10
-- Author: Dev Agent James

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    target_test_date DATE,
    current_score INTEGER CHECK (current_score >= 120 AND current_score <= 180),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'early_adopter')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Questions table
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
    subtype TEXT,
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10) NOT NULL,
    estimated_time INTEGER, -- seconds
    correct_answer TEXT NOT NULL,
    answer_choices JSONB NOT NULL,
    explanation TEXT NOT NULL,
    concept_tags TEXT[] DEFAULT '{}',
    source_attribution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Game sessions table
CREATE TABLE public.game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT DEFAULT 'survival_mode' CHECK (session_type IN ('survival_mode', 'practice', 'test')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    final_score INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    lives_remaining INTEGER DEFAULT 3,
    difficulty_level INTEGER DEFAULT 1,
    session_data JSONB DEFAULT '{}'::jsonb -- stores game state, power-ups, etc.
);

-- User question attempts
CREATE TABLE public.question_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- milliseconds
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hint_used BOOLEAN DEFAULT false,
    difficulty_at_attempt INTEGER
);

-- User analytics/progress tracking
CREATE TABLE public.user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL, -- 'daily_stats', 'streak', 'topic_performance'
    metric_data JSONB NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'early_adopter')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_questions_type_difficulty ON public.questions(question_type, difficulty);
CREATE INDEX idx_questions_active ON public.questions(is_active) WHERE is_active = true;
CREATE INDEX idx_game_sessions_user_started ON public.game_sessions(user_id, started_at DESC);
CREATE INDEX idx_question_attempts_user_question ON public.question_attempts(user_id, question_id);
CREATE INDEX idx_question_attempts_session ON public.question_attempts(session_id);
CREATE INDEX idx_user_analytics_user_date ON public.user_analytics(user_id, date_recorded DESC);
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON public.game_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own attempts" ON public.question_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON public.user_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Questions are publicly readable (no RLS needed for learning content)
-- Admin access will be handled separately

-- Updated timestamps trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- FERPA Compliance: Audit log for sensitive data access
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_logs_user_action ON public.audit_logs(user_id, action, created_at DESC);

-- Initial seed data for development
INSERT INTO public.questions (content, question_type, subtype, difficulty, correct_answer, answer_choices, explanation, concept_tags) VALUES
('If all cats are mammals and all mammals are vertebrates, which of the following must be true?', 'logical_reasoning', 'syllogism', 3, 'A', 
 '["All cats are vertebrates", "All vertebrates are cats", "Some cats are not mammals", "All mammals are cats"]'::jsonb,
 'This is a basic syllogism. Since all cats are mammals (given) and all mammals are vertebrates (given), it logically follows that all cats are vertebrates.',
 ARRAY['syllogism', 'logical_reasoning', 'basic_inference']),

('A game has 6 players: F, G, H, J, K, and L. They are seated around a circular table. If F sits directly across from G, and H sits to the immediate left of F, which player could sit to the immediate right of G?', 'logic_games', 'circular_arrangement', 6, 'C',
 '["F", "H", "J", "K", "L"]'::jsonb,
 'In a circular arrangement with F across from G and H to the left of F, the player to the right of G could be J, K, or L, depending on the specific arrangement.',
 ARRAY['circular_seating', 'spatial_reasoning', 'logic_games']);

COMMENT ON TABLE public.user_profiles IS 'Extended user profile data linked to Supabase Auth';
COMMENT ON TABLE public.questions IS 'LSAT question bank with metadata and difficulty scoring';
COMMENT ON TABLE public.game_sessions IS 'Survival mode and practice session tracking';
COMMENT ON TABLE public.question_attempts IS 'Individual question responses and performance data';
COMMENT ON TABLE public.user_analytics IS 'User progress metrics and learning analytics';
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription status and billing information';
COMMENT ON TABLE public.audit_logs IS 'FERPA-compliant audit trail for data access and modifications';