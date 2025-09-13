-- Dynamic Difficulty Adjustment System Migration
-- MELLOWISE-010: FSRS-Inspired Adaptive Learning
-- Version: 1.0
-- Author: Architect Agent Winston

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PRACTICE DIFFICULTY STATE TRACKING
-- ============================================================================

-- Core table for tracking difficulty state per user per topic
CREATE TABLE public.practice_difficulty_state (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    topic_type TEXT NOT NULL CHECK (topic_type IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
    
    -- FSRS-inspired difficulty tracking
    current_difficulty DECIMAL(4,2) DEFAULT 5.0 CHECK (current_difficulty >= 1.0 AND current_difficulty <= 10.0),
    stability_score DECIMAL(4,2) DEFAULT 50.0 CHECK (stability_score >= 0.0 AND stability_score <= 100.0),
    confidence_interval DECIMAL(3,2) DEFAULT 2.0 CHECK (confidence_interval >= 0.5 AND confidence_interval <= 5.0),
    
    -- Performance tracking
    success_rate_target DECIMAL(3,2) DEFAULT 0.75 CHECK (success_rate_target >= 0.5 AND success_rate_target <= 0.9),
    current_success_rate DECIMAL(3,2) DEFAULT 0.5,
    sessions_analyzed INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    
    -- Manual overrides
    manual_difficulty_override DECIMAL(4,2) NULL CHECK (manual_difficulty_override IS NULL OR (manual_difficulty_override >= 1.0 AND manual_difficulty_override <= 10.0)),
    manual_override_enabled BOOLEAN DEFAULT false,
    manual_override_set_at TIMESTAMP WITH TIME ZONE NULL,
    manual_override_reason TEXT NULL,
    
    -- Timestamps and metadata
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_session_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Unique constraint for user-topic combination
    UNIQUE(user_id, topic_type)
);

-- ============================================================================
-- PRACTICE SESSION DIFFICULTY TRACKING
-- ============================================================================

-- Track difficulty metrics per practice session
CREATE TABLE public.practice_session_difficulty (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    topic_type TEXT NOT NULL CHECK (topic_type IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
    
    -- Session difficulty metrics
    start_difficulty DECIMAL(4,2) NOT NULL CHECK (start_difficulty >= 1.0 AND start_difficulty <= 10.0),
    end_difficulty DECIMAL(4,2) NOT NULL CHECK (end_difficulty >= 1.0 AND end_difficulty <= 10.0),
    avg_question_difficulty DECIMAL(4,2) NOT NULL CHECK (avg_question_difficulty >= 1.0 AND avg_question_difficulty <= 10.0),
    difficulty_adjustments_made INTEGER DEFAULT 0 CHECK (difficulty_adjustments_made >= 0),
    
    -- Session performance
    questions_answered INTEGER DEFAULT 0 CHECK (questions_answered >= 0),
    correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
    session_success_rate DECIMAL(3,2) DEFAULT 0.0 CHECK (session_success_rate >= 0.0 AND session_success_rate <= 1.0),
    avg_response_time INTEGER NULL CHECK (avg_response_time IS NULL OR avg_response_time > 0),
    
    -- FSRS algorithm data
    stability_change DECIMAL(4,2) DEFAULT 0.0,
    confidence_change DECIMAL(3,2) DEFAULT 0.0,
    algorithm_confidence DECIMAL(3,2) DEFAULT 50.0 CHECK (algorithm_confidence >= 0.0 AND algorithm_confidence <= 100.0),
    
    -- Learning style integration
    learning_style_factor DECIMAL(3,2) DEFAULT 1.0 CHECK (learning_style_factor >= 0.5 AND learning_style_factor <= 2.0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- DIFFICULTY ADJUSTMENT AUDIT LOG
-- ============================================================================

-- Log all difficulty adjustments for analysis and debugging
CREATE TABLE public.practice_difficulty_adjustments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    topic_type TEXT NOT NULL CHECK (topic_type IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
    
    -- Adjustment details
    previous_difficulty DECIMAL(4,2) NOT NULL CHECK (previous_difficulty >= 1.0 AND previous_difficulty <= 10.0),
    new_difficulty DECIMAL(4,2) NOT NULL CHECK (new_difficulty >= 1.0 AND new_difficulty <= 10.0),
    adjustment_reason TEXT NOT NULL CHECK (adjustment_reason IN ('performance_based', 'manual_override', 'stability_correction', 'learning_style_adaptation', 'session_start')),
    trigger_performance_rate DECIMAL(3,2) NULL CHECK (trigger_performance_rate IS NULL OR (trigger_performance_rate >= 0.0 AND trigger_performance_rate <= 1.0)),
    
    -- Algorithm confidence and factors
    algorithm_confidence DECIMAL(3,2) DEFAULT 50.0 CHECK (algorithm_confidence >= 0.0 AND algorithm_confidence <= 100.0),
    stability_factor DECIMAL(4,2) DEFAULT 0.0,
    learning_style_influence DECIMAL(3,2) DEFAULT 0.0,
    
    -- Context data
    questions_in_context INTEGER DEFAULT 1 CHECK (questions_in_context > 0),
    adjustment_magnitude DECIMAL(3,2) NOT NULL,
    
    -- Additional metadata
    algorithm_version TEXT DEFAULT '1.0',
    adjustment_notes TEXT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ENHANCE EXISTING TABLES FOR PRACTICE MODE
-- ============================================================================

-- Add practice difficulty tracking to existing question_attempts table
ALTER TABLE public.question_attempts 
ADD COLUMN practice_difficulty_at_attempt DECIMAL(4,2) NULL CHECK (practice_difficulty_at_attempt IS NULL OR (practice_difficulty_at_attempt >= 1.0 AND practice_difficulty_at_attempt <= 10.0)),
ADD COLUMN stability_factor_at_attempt DECIMAL(4,2) NULL CHECK (stability_factor_at_attempt IS NULL OR (stability_factor_at_attempt >= 0.0 AND stability_factor_at_attempt <= 100.0)),
ADD COLUMN expected_success_rate DECIMAL(3,2) NULL CHECK (expected_success_rate IS NULL OR (expected_success_rate >= 0.0 AND expected_success_rate <= 1.0)),
ADD COLUMN difficulty_adjustment_applied BOOLEAN DEFAULT false,
ADD COLUMN algorithm_version TEXT DEFAULT '1.0';

-- Add practice mode tracking to game_sessions
ALTER TABLE public.game_sessions
ADD COLUMN is_practice_mode BOOLEAN DEFAULT false,
ADD COLUMN practice_topic_focus TEXT NULL CHECK (practice_topic_focus IS NULL OR practice_topic_focus IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
ADD COLUMN adaptive_difficulty_enabled BOOLEAN DEFAULT false;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Primary lookup indexes for difficulty state
CREATE INDEX idx_practice_difficulty_state_user_topic 
ON public.practice_difficulty_state(user_id, topic_type);

CREATE INDEX idx_practice_difficulty_state_last_session 
ON public.practice_difficulty_state(user_id, last_session_at DESC NULLS LAST);

CREATE INDEX idx_practice_difficulty_state_manual_override 
ON public.practice_difficulty_state(user_id, manual_override_enabled) 
WHERE manual_override_enabled = true;

-- Session difficulty tracking indexes
CREATE INDEX idx_practice_session_difficulty_user_topic_date 
ON public.practice_session_difficulty(user_id, topic_type, created_at DESC);

CREATE INDEX idx_practice_session_difficulty_session_lookup 
ON public.practice_session_difficulty(session_id);

CREATE INDEX idx_practice_session_difficulty_performance_analysis 
ON public.practice_session_difficulty(topic_type, session_success_rate, algorithm_confidence);

-- Difficulty adjustments analysis indexes
CREATE INDEX idx_practice_difficulty_adjustments_user_topic 
ON public.practice_difficulty_adjustments(user_id, topic_type, created_at DESC);

CREATE INDEX idx_practice_difficulty_adjustments_reason_analysis 
ON public.practice_difficulty_adjustments(adjustment_reason, created_at DESC);

CREATE INDEX idx_practice_difficulty_adjustments_magnitude 
ON public.practice_difficulty_adjustments(adjustment_magnitude, algorithm_confidence);

-- Enhanced question attempts indexes for practice mode
CREATE INDEX idx_question_attempts_practice_tracking 
ON public.question_attempts(user_id, attempted_at DESC) 
WHERE practice_difficulty_at_attempt IS NOT NULL;

CREATE INDEX idx_question_attempts_practice_difficulty_performance 
ON public.question_attempts(practice_difficulty_at_attempt, is_correct, expected_success_rate)
WHERE practice_difficulty_at_attempt IS NOT NULL;

-- Support for difficulty range queries on questions
CREATE INDEX idx_questions_practice_difficulty_range 
ON public.questions(question_type, difficulty) 
WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.practice_difficulty_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_session_difficulty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_difficulty_adjustments ENABLE ROW LEVEL SECURITY;

-- Users can only access their own practice difficulty data
CREATE POLICY "Users can view own practice difficulty state" ON public.practice_difficulty_state
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own practice difficulty state" ON public.practice_difficulty_state
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own practice session difficulty" ON public.practice_session_difficulty
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice session difficulty" ON public.practice_session_difficulty
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own practice difficulty adjustments" ON public.practice_difficulty_adjustments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice difficulty adjustments" ON public.practice_difficulty_adjustments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to initialize practice difficulty state for a user-topic combination
CREATE OR REPLACE FUNCTION public.initialize_practice_difficulty_state(
    p_user_id UUID,
    p_topic_type TEXT,
    p_learning_style TEXT DEFAULT NULL
)
RETURNS public.practice_difficulty_state AS $$
DECLARE
    v_initial_difficulty DECIMAL(4,2) := 5.0;
    v_target_success_rate DECIMAL(3,2) := 0.75;
    v_stability_score DECIMAL(4,2) := 50.0;
    v_result public.practice_difficulty_state;
BEGIN
    -- Adjust initial values based on learning style if provided
    IF p_learning_style IS NOT NULL THEN
        CASE 
            WHEN p_learning_style LIKE '%fast%' THEN
                v_initial_difficulty := 6.0;
                v_target_success_rate := 0.80;
            WHEN p_learning_style LIKE '%methodical%' THEN
                v_initial_difficulty := 4.0;
                v_target_success_rate := 0.70;
            ELSE
                -- Keep defaults
                NULL;
        END CASE;
    END IF;

    -- Insert or update difficulty state
    INSERT INTO public.practice_difficulty_state (
        user_id,
        topic_type,
        current_difficulty,
        success_rate_target,
        stability_score
    )
    VALUES (
        p_user_id,
        p_topic_type,
        v_initial_difficulty,
        v_target_success_rate,
        v_stability_score
    )
    ON CONFLICT (user_id, topic_type) 
    DO UPDATE SET
        last_updated = timezone('utc'::text, now())
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate recommended difficulty based on recent performance
CREATE OR REPLACE FUNCTION public.calculate_recommended_difficulty(
    p_user_id UUID,
    p_topic_type TEXT,
    p_recent_sessions INTEGER DEFAULT 5
)
RETURNS DECIMAL(4,2) AS $$
DECLARE
    v_current_state public.practice_difficulty_state;
    v_recent_success_rate DECIMAL(3,2);
    v_recommended_difficulty DECIMAL(4,2);
    v_adjustment_factor DECIMAL(3,2);
BEGIN
    -- Get current difficulty state
    SELECT * INTO v_current_state
    FROM public.practice_difficulty_state
    WHERE user_id = p_user_id AND topic_type = p_topic_type;

    -- If no state exists, initialize it
    IF v_current_state IS NULL THEN
        v_current_state := public.initialize_practice_difficulty_state(p_user_id, p_topic_type);
    END IF;

    -- Calculate recent success rate from session difficulty data
    SELECT COALESCE(AVG(session_success_rate), 0.5) INTO v_recent_success_rate
    FROM public.practice_session_difficulty
    WHERE user_id = p_user_id 
      AND topic_type = p_topic_type
      AND created_at >= NOW() - INTERVAL '7 days'
    ORDER BY created_at DESC
    LIMIT p_recent_sessions;

    -- Calculate adjustment factor based on performance vs target
    v_adjustment_factor := (v_current_state.success_rate_target - v_recent_success_rate) * 3.0;

    -- Apply stability factor to moderate adjustments
    v_adjustment_factor := v_adjustment_factor * (1.0 - (v_current_state.stability_score / 200.0));

    -- Calculate recommended difficulty
    v_recommended_difficulty := v_current_state.current_difficulty + v_adjustment_factor;

    -- Ensure result is within valid bounds
    v_recommended_difficulty := GREATEST(1.0, LEAST(10.0, v_recommended_difficulty));

    RETURN v_recommended_difficulty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_session_at when a new practice session is recorded
CREATE OR REPLACE FUNCTION public.update_practice_difficulty_last_session()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.practice_difficulty_state
    SET 
        last_session_at = NEW.created_at,
        last_updated = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id AND topic_type = NEW.topic_type;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_difficulty_last_session
    AFTER INSERT ON public.practice_session_difficulty
    FOR EACH ROW
    EXECUTE FUNCTION public.update_practice_difficulty_last_session();

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.practice_difficulty_state IS 'FSRS-inspired difficulty state tracking per user per topic for adaptive practice mode';
COMMENT ON TABLE public.practice_session_difficulty IS 'Comprehensive difficulty metrics and performance tracking for practice sessions';
COMMENT ON TABLE public.practice_difficulty_adjustments IS 'Audit log of all difficulty adjustments with algorithm reasoning and context';

COMMENT ON COLUMN public.practice_difficulty_state.stability_score IS 'FSRS stability score (0-100) indicating memory retention strength';
COMMENT ON COLUMN public.practice_difficulty_state.confidence_interval IS 'Algorithm confidence interval to prevent extreme difficulty swings';
COMMENT ON COLUMN public.practice_difficulty_state.success_rate_target IS 'Target success rate for optimal learning challenge (typically 0.70-0.80)';

COMMENT ON FUNCTION public.initialize_practice_difficulty_state IS 'Initialize practice difficulty state for a user-topic with optional learning style adaptation';
COMMENT ON FUNCTION public.calculate_recommended_difficulty IS 'Calculate FSRS-based recommended difficulty using recent performance data';

-- ============================================================================
-- INITIAL DATA AND SETUP
-- ============================================================================

-- Create view for current practice difficulty status
CREATE VIEW public.practice_difficulty_overview AS
SELECT 
    pds.user_id,
    pds.topic_type,
    pds.current_difficulty,
    pds.stability_score,
    pds.current_success_rate,
    pds.success_rate_target,
    pds.manual_override_enabled,
    pds.last_session_at,
    pds.sessions_analyzed,
    pds.questions_attempted,
    -- Calculate days since last session
    CASE 
        WHEN pds.last_session_at IS NULL THEN NULL
        ELSE EXTRACT(days FROM NOW() - pds.last_session_at)
    END as days_since_last_session,
    -- Calculate recommended difficulty
    public.calculate_recommended_difficulty(pds.user_id, pds.topic_type) as recommended_difficulty
FROM public.practice_difficulty_state pds;

COMMENT ON VIEW public.practice_difficulty_overview IS 'Comprehensive view of current practice difficulty status with calculated recommendations';

-- Grant appropriate permissions
GRANT SELECT ON public.practice_difficulty_overview TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_practice_difficulty_state TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_recommended_difficulty TO authenticated;

-- Migration complete
-- Version: 1.0
-- Compatible with: Mellowise Core Schema v1.0
-- MELLOWISE-010: Dynamic Difficulty Adjustment System