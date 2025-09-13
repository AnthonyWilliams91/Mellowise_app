-- Mellowise Analytics Enhancement Migration
-- Version: 2.0
-- Created: 2025-01-10
-- Purpose: Enhanced session tracking, streaks, and performance analytics for MELLOWISE-008

-- Session Performance Tracking Table (enhanced version of existing game_sessions)
CREATE TABLE public.session_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Performance Metrics
    total_time_spent INTEGER NOT NULL, -- milliseconds
    avg_response_time DECIMAL(10,2), -- average response time in milliseconds
    accuracy_percentage DECIMAL(5,2) NOT NULL CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    streak_count INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    
    -- Topic Performance Breakdown
    logical_reasoning_correct INTEGER DEFAULT 0,
    logical_reasoning_total INTEGER DEFAULT 0,
    logic_games_correct INTEGER DEFAULT 0,
    logic_games_total INTEGER DEFAULT 0,
    reading_comprehension_correct INTEGER DEFAULT 0,
    reading_comprehension_total INTEGER DEFAULT 0,
    
    -- Difficulty Progression
    difficulty_progression JSONB DEFAULT '[]'::jsonb, -- track difficulty changes during session
    final_difficulty INTEGER,
    
    -- Session Context
    pauses_used INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    power_ups_used JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Statistics Aggregation Table
CREATE TABLE public.daily_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    date_recorded DATE NOT NULL,
    
    -- Daily Totals
    sessions_played INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- milliseconds
    
    -- Daily Averages
    avg_accuracy DECIMAL(5,2),
    avg_response_time DECIMAL(10,2),
    best_streak INTEGER DEFAULT 0,
    
    -- Topic Performance
    topic_performance JSONB DEFAULT '{}'::jsonb, -- stores per-topic stats
    
    -- Streaks
    current_daily_streak INTEGER DEFAULT 0,
    is_streak_day BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, date_recorded)
);

-- User Streaks Table
CREATE TABLE public.user_streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Current Streaks
    current_daily_streak INTEGER DEFAULT 0,
    current_session_streak INTEGER DEFAULT 0, -- consecutive correct answers in current session
    
    -- Best Streaks (all-time records)
    best_daily_streak INTEGER DEFAULT 0,
    best_session_streak INTEGER DEFAULT 0,
    best_accuracy_streak INTEGER DEFAULT 0, -- consecutive sessions with >80% accuracy
    
    -- Streak Dates
    current_daily_streak_start DATE,
    last_activity_date DATE,
    best_daily_streak_start DATE,
    best_daily_streak_end DATE,
    
    -- Milestone Tracking
    milestones_achieved JSONB DEFAULT '[]'::jsonb, -- track 7-day, 30-day, etc. milestones
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id)
);

-- Topic Performance History Table
CREATE TABLE public.topic_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    topic_type TEXT NOT NULL CHECK (topic_type IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
    
    -- Performance Metrics
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    current_accuracy DECIMAL(5,2) DEFAULT 0,
    
    -- Difficulty Progress
    current_difficulty DECIMAL(3,1) DEFAULT 1.0,
    max_difficulty_reached DECIMAL(3,1) DEFAULT 1.0,
    
    -- Time Tracking
    avg_response_time DECIMAL(10,2),
    total_time_spent INTEGER DEFAULT 0, -- milliseconds
    
    -- Recent Performance (last 10 questions)
    recent_answers JSONB DEFAULT '[]'::jsonb, -- track last 10 correct/incorrect
    recent_accuracy DECIMAL(5,2) DEFAULT 0,
    
    -- Learning Velocity
    questions_per_day DECIMAL(5,2) DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0, -- percentage improvement over time
    
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, topic_type)
);

-- Performance Snapshots for Historical Tracking
CREATE TABLE public.performance_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE NOT NULL,
    
    -- Overall Performance
    total_questions_answered INTEGER DEFAULT 0,
    overall_accuracy DECIMAL(5,2) DEFAULT 0,
    avg_difficulty DECIMAL(3,1) DEFAULT 1.0,
    
    -- Topic Breakdown
    topic_performance JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Streaks at Time of Snapshot
    daily_streak INTEGER DEFAULT 0,
    best_session_streak INTEGER DEFAULT 0,
    
    -- Study Habits
    sessions_this_week INTEGER DEFAULT 0,
    avg_session_length INTEGER DEFAULT 0, -- minutes
    most_active_time_of_day INTEGER, -- hour (0-23)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, snapshot_date)
);

-- Indexes for Performance
CREATE INDEX idx_session_performance_user_date ON public.session_performance(user_id, created_at DESC);
CREATE INDEX idx_session_performance_session ON public.session_performance(session_id);
CREATE INDEX idx_daily_stats_user_date ON public.daily_stats(user_id, date_recorded DESC);
CREATE INDEX idx_daily_stats_streak ON public.daily_stats(user_id) WHERE is_streak_day = true;
CREATE INDEX idx_user_streaks_user ON public.user_streaks(user_id);
CREATE INDEX idx_topic_performance_user_topic ON public.topic_performance(user_id, topic_type);
CREATE INDEX idx_topic_performance_last_practiced ON public.topic_performance(last_practiced_at DESC);
CREATE INDEX idx_performance_snapshots_user_date ON public.performance_snapshots(user_id, snapshot_date DESC);

-- Row Level Security
ALTER TABLE public.session_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own analytics data
CREATE POLICY "Users can view own session performance" ON public.session_performance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily stats" ON public.daily_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON public.user_streaks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own topic performance" ON public.topic_performance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own performance snapshots" ON public.performance_snapshots
    FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.daily_stats
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_streaks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.topic_performance
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to Calculate Session Performance
CREATE OR REPLACE FUNCTION public.calculate_session_performance(p_session_id UUID)
RETURNS UUID AS $$
DECLARE
    v_session_record RECORD;
    v_performance_id UUID;
    v_total_time INTEGER;
    v_avg_response_time DECIMAL;
    v_accuracy DECIMAL;
    v_streak_count INTEGER;
    v_max_streak INTEGER;
    v_topic_stats RECORD;
BEGIN
    -- Get session data
    SELECT s.*, COUNT(qa.id) as total_questions, 
           SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_count
    FROM public.game_sessions s
    LEFT JOIN public.question_attempts qa ON qa.session_id = s.id
    WHERE s.id = p_session_id
    GROUP BY s.id
    INTO v_session_record;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found: %', p_session_id;
    END IF;
    
    -- Calculate performance metrics
    SELECT 
        EXTRACT(EPOCH FROM (COALESCE(v_session_record.ended_at, NOW()) - v_session_record.started_at)) * 1000,
        AVG(qa.response_time),
        CASE WHEN COUNT(qa.id) > 0 
             THEN (SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(qa.id)) * 100 
             ELSE 0 END
    FROM public.question_attempts qa
    WHERE qa.session_id = p_session_id
    INTO v_total_time, v_avg_response_time, v_accuracy;
    
    -- Calculate streaks (simplified version)
    -- TODO: Implement proper streak calculation logic
    v_streak_count := v_session_record.correct_answers;
    v_max_streak := v_session_record.correct_answers;
    
    -- Insert performance record
    INSERT INTO public.session_performance (
        session_id, user_id, total_time_spent, avg_response_time, 
        accuracy_percentage, streak_count, max_streak
    ) VALUES (
        p_session_id, v_session_record.user_id, v_total_time::INTEGER, 
        v_avg_response_time, v_accuracy, v_streak_count, v_max_streak
    ) RETURNING id INTO v_performance_id;
    
    RETURN v_performance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to Update Daily Statistics
CREATE OR REPLACE FUNCTION public.update_daily_stats(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
    v_stats_id UUID;
    v_daily_data RECORD;
BEGIN
    -- Calculate daily aggregates
    SELECT 
        COUNT(DISTINCT gs.id) as sessions_count,
        COUNT(qa.id) as total_questions,
        SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_answers,
        SUM(sp.total_time_spent) as total_time,
        AVG(sp.accuracy_percentage) as avg_accuracy,
        AVG(sp.avg_response_time) as avg_response,
        MAX(sp.max_streak) as best_streak
    FROM public.game_sessions gs
    LEFT JOIN public.question_attempts qa ON qa.session_id = gs.id
    LEFT JOIN public.session_performance sp ON sp.session_id = gs.id
    WHERE gs.user_id = p_user_id 
    AND DATE(gs.started_at) = p_date
    INTO v_daily_data;
    
    -- Upsert daily stats
    INSERT INTO public.daily_stats (
        user_id, date_recorded, sessions_played, total_questions_answered,
        total_correct_answers, total_time_spent, avg_accuracy, 
        avg_response_time, best_streak, is_streak_day
    ) VALUES (
        p_user_id, p_date, COALESCE(v_daily_data.sessions_count, 0),
        COALESCE(v_daily_data.total_questions, 0), COALESCE(v_daily_data.correct_answers, 0),
        COALESCE(v_daily_data.total_time, 0), v_daily_data.avg_accuracy,
        v_daily_data.avg_response, COALESCE(v_daily_data.best_streak, 0),
        COALESCE(v_daily_data.sessions_count, 0) > 0
    )
    ON CONFLICT (user_id, date_recorded) 
    DO UPDATE SET
        sessions_played = EXCLUDED.sessions_played,
        total_questions_answered = EXCLUDED.total_questions_answered,
        total_correct_answers = EXCLUDED.total_correct_answers,
        total_time_spent = EXCLUDED.total_time_spent,
        avg_accuracy = EXCLUDED.avg_accuracy,
        avg_response_time = EXCLUDED.avg_response_time,
        best_streak = EXCLUDED.best_streak,
        is_streak_day = EXCLUDED.is_streak_day,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO v_stats_id;
    
    RETURN v_stats_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE public.session_performance IS 'Detailed performance analytics for individual game sessions';
COMMENT ON TABLE public.daily_stats IS 'Daily aggregated statistics for user performance tracking';
COMMENT ON TABLE public.user_streaks IS 'User streak tracking for gamification and motivation';
COMMENT ON TABLE public.topic_performance IS 'Per-topic performance analysis and difficulty progression';
COMMENT ON TABLE public.performance_snapshots IS 'Historical performance snapshots for trend analysis';

COMMENT ON FUNCTION public.calculate_session_performance IS 'Calculates and stores performance metrics for a completed session';
COMMENT ON FUNCTION public.update_daily_stats IS 'Updates daily statistics aggregation for a user';