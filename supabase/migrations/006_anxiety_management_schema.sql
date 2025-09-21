-- ============================================================================
-- MELLOWISE-014: Adaptive Anxiety Management System
-- Database Schema for Anxiety Detection, Confidence Building, and Mindfulness
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ANXIETY DETECTION TABLES
-- ============================================================================

-- Table for storing anxiety detection results
CREATE TABLE IF NOT EXISTS anxiety_detections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    anxiety_level TEXT NOT NULL CHECK (anxiety_level IN ('low', 'moderate', 'high', 'severe')),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    indicators JSONB NOT NULL DEFAULT '{}',
    triggers TEXT[] NOT NULL DEFAULT '{}',
    behavioral_patterns TEXT[] DEFAULT '{}',
    detection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    CONSTRAINT anxiety_detections_user_id_idx FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- Indexes for anxiety_detections
CREATE INDEX IF NOT EXISTS idx_anxiety_detections_user_id ON anxiety_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_anxiety_detections_created_at ON anxiety_detections(created_at);
CREATE INDEX IF NOT EXISTS idx_anxiety_detections_anxiety_level ON anxiety_detections(anxiety_level);

-- ============================================================================
-- CONFIDENCE TRACKING TABLES
-- ============================================================================

-- Table for storing confidence metrics
CREATE TABLE IF NOT EXISTS confidence_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    trend_data JSONB NOT NULL DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint to prevent duplicate entries per user
    UNIQUE(user_id)
);

-- Indexes for confidence_metrics
CREATE INDEX IF NOT EXISTS idx_confidence_metrics_user_id ON confidence_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_confidence_metrics_last_updated ON confidence_metrics(last_updated);

-- ============================================================================
-- MINDFULNESS AND BREATHING EXERCISES
-- ============================================================================

-- Table for storing mindfulness sessions
CREATE TABLE IF NOT EXISTS mindfulness_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_completed INTEGER NOT NULL DEFAULT 0, -- in seconds
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    anxiety_before TEXT CHECK (anxiety_before IN ('low', 'moderate', 'high', 'severe')),
    anxiety_after TEXT CHECK (anxiety_after IN ('low', 'moderate', 'high', 'severe')),
    session_context TEXT NOT NULL DEFAULT 'general' CHECK (session_context IN ('before_practice', 'during_break', 'after_mistake', 'general')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for mindfulness_sessions
CREATE INDEX IF NOT EXISTS idx_mindfulness_sessions_user_id ON mindfulness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mindfulness_sessions_created_at ON mindfulness_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_mindfulness_sessions_exercise_id ON mindfulness_sessions(exercise_id);

-- ============================================================================
-- ANXIETY INTERVENTIONS
-- ============================================================================

-- Table for storing anxiety interventions
CREATE TABLE IF NOT EXISTS anxiety_interventions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_pressure', 'difficult_questions', 'performance_drop', 'streak_break', 'comparison', 'unknown')),
    intervention_type TEXT NOT NULL CHECK (intervention_type IN ('immediate', 'proactive', 'educational', 'celebration')),
    strategies_offered JSONB NOT NULL DEFAULT '[]',
    strategy_selected TEXT,
    outcome_data JSONB,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for anxiety_interventions
CREATE INDEX IF NOT EXISTS idx_anxiety_interventions_user_id ON anxiety_interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_anxiety_interventions_trigger_type ON anxiety_interventions(trigger_type);
CREATE INDEX IF NOT EXISTS idx_anxiety_interventions_timestamp ON anxiety_interventions(timestamp);

-- ============================================================================
-- COPING STRATEGIES
-- ============================================================================

-- Table for storing personalized coping strategies
CREATE TABLE IF NOT EXISTS coping_strategies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_pressure', 'difficult_questions', 'performance_drop', 'streak_break', 'comparison', 'unknown')),
    strategy_type TEXT NOT NULL CHECK (strategy_type IN ('breathing_exercise', 'positive_affirmation', 'difficulty_reduction', 'break_suggestion', 'achievement_reminder')),
    effectiveness_rating INTEGER NOT NULL DEFAULT 50 CHECK (effectiveness_rating >= 0 AND effectiveness_rating <= 100),
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (success_rate >= 0 AND success_rate <= 1),
    customizations JSONB NOT NULL DEFAULT '{}',
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for coping_strategies
CREATE INDEX IF NOT EXISTS idx_coping_strategies_user_id ON coping_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_coping_strategies_trigger_type ON coping_strategies(trigger_type);
CREATE INDEX IF NOT EXISTS idx_coping_strategies_effectiveness ON coping_strategies(effectiveness_rating);

-- ============================================================================
-- ACHIEVEMENT CELEBRATIONS
-- ============================================================================

-- Table for storing achievement celebrations
CREATE TABLE IF NOT EXISTS achievement_celebrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    description TEXT NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    celebration_level TEXT NOT NULL DEFAULT 'small' CHECK (celebration_level IN ('small', 'medium', 'large')),
    visual_effects TEXT[] DEFAULT '{}',
    sound_effects TEXT[] DEFAULT '{}',
    message TEXT NOT NULL,
    user_response TEXT CHECK (user_response IN ('positive', 'neutral', 'negative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for achievement_celebrations
CREATE INDEX IF NOT EXISTS idx_achievement_celebrations_user_id ON achievement_celebrations(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_celebrations_created_at ON achievement_celebrations(created_at);
CREATE INDEX IF NOT EXISTS idx_achievement_celebrations_achievement_type ON achievement_celebrations(achievement_type);

-- ============================================================================
-- SUCCESS VISUALIZATIONS
-- ============================================================================

-- Table for storing success visualization data
CREATE TABLE IF NOT EXISTS success_visualizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    visualization_type TEXT NOT NULL CHECK (visualization_type IN ('progress_chart', 'confidence_journey', 'achievement_gallery', 'future_success')),
    data_points JSONB NOT NULL DEFAULT '{}',
    milestone_markers JSONB NOT NULL DEFAULT '[]',
    motivational_overlay JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for success_visualizations
CREATE INDEX IF NOT EXISTS idx_success_visualizations_user_id ON success_visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_success_visualizations_type ON success_visualizations(visualization_type);

-- ============================================================================
-- ANXIETY MANAGEMENT SETTINGS
-- ============================================================================

-- Add anxiety management settings to user_preferences table
-- (This assumes user_preferences table exists from previous migrations)
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS anxiety_management_settings JSONB DEFAULT '{
    "intervention_preferences": {
        "auto_trigger_threshold": "moderate",
        "preferred_strategies": ["breathing_exercise", "positive_affirmation"],
        "notification_frequency": "gentle",
        "break_suggestions_enabled": true
    },
    "mindfulness_preferences": {
        "preferred_exercise_duration": 180,
        "breathing_exercise_style": "coherent-breathing",
        "background_sounds_enabled": false,
        "guided_vs_self_directed": "guided"
    },
    "progress_tracking": {
        "detailed_analytics": true,
        "progress_celebrations": true,
        "comparison_data_visible": false,
        "goal_setting_enabled": true
    },
    "privacy_settings": {
        "share_anonymized_data": false,
        "research_participation": false,
        "coaching_suggestions": true
    }
}';

-- ============================================================================
-- CONFIDENCE BUILDING CONFIGURATION
-- ============================================================================

-- Add confidence building config to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS confidence_building_config JSONB DEFAULT '{
    "start_difficulty_reduction": 2,
    "success_threshold": 75,
    "progression_rate": 0.5,
    "safety_net_enabled": true,
    "positive_reinforcement_frequency": 3
}';

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for coping_strategies updated_at
CREATE TRIGGER update_coping_strategies_updated_at
    BEFORE UPDATE ON coping_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for success_visualizations updated_at
CREATE TRIGGER update_success_visualizations_updated_at
    BEFORE UPDATE ON success_visualizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View for anxiety trends over time
CREATE OR REPLACE VIEW anxiety_trends AS
SELECT
    user_id,
    DATE_TRUNC('day', created_at) as date,
    anxiety_level,
    AVG(confidence_score) as avg_confidence_score,
    COUNT(*) as detection_count,
    ARRAY_AGG(DISTINCT unnest(triggers)) as common_triggers
FROM anxiety_detections
GROUP BY user_id, DATE_TRUNC('day', created_at), anxiety_level
ORDER BY user_id, date DESC;

-- View for mindfulness effectiveness
CREATE OR REPLACE VIEW mindfulness_effectiveness AS
SELECT
    user_id,
    exercise_id,
    COUNT(*) as session_count,
    AVG(effectiveness_rating) as avg_effectiveness,
    AVG(duration_completed) as avg_duration,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN effectiveness_rating >= 4 THEN 1 END) as high_effectiveness_sessions
FROM mindfulness_sessions
WHERE effectiveness_rating IS NOT NULL
GROUP BY user_id, exercise_id
ORDER BY avg_effectiveness DESC;

-- View for confidence progression
CREATE OR REPLACE VIEW confidence_progression AS
SELECT
    user_id,
    confidence_level,
    confidence_score,
    last_updated,
    LAG(confidence_score) OVER (PARTITION BY user_id ORDER BY last_updated) as previous_score,
    confidence_score - LAG(confidence_score) OVER (PARTITION BY user_id ORDER BY last_updated) as score_change
FROM confidence_metrics
ORDER BY user_id, last_updated DESC;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE anxiety_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindfulness_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anxiety_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coping_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_visualizations ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can only access their own anxiety detections" ON anxiety_detections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own confidence metrics" ON confidence_metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own mindfulness sessions" ON mindfulness_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own anxiety interventions" ON anxiety_interventions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own coping strategies" ON coping_strategies
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own achievement celebrations" ON achievement_celebrations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own success visualizations" ON success_visualizations
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================================================

-- Insert sample breathing exercises (these would typically be managed in the application)
-- This is commented out as the exercises are defined in the application code

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE anxiety_detections IS 'Stores anxiety level detection results with confidence scores and identified triggers';
COMMENT ON TABLE confidence_metrics IS 'Tracks user confidence levels and trends over time';
COMMENT ON TABLE mindfulness_sessions IS 'Records mindfulness and breathing exercise sessions with effectiveness ratings';
COMMENT ON TABLE anxiety_interventions IS 'Logs anxiety interventions triggered and their outcomes';
COMMENT ON TABLE coping_strategies IS 'Stores personalized coping strategies with effectiveness tracking';
COMMENT ON TABLE achievement_celebrations IS 'Records achievement celebrations and user responses';
COMMENT ON TABLE success_visualizations IS 'Stores data for success visualization and progress tracking';

COMMENT ON COLUMN anxiety_detections.indicators IS 'JSON object containing anxiety indicator metrics (performance decline, response time, etc.)';
COMMENT ON COLUMN anxiety_detections.triggers IS 'Array of identified anxiety triggers for this detection';
COMMENT ON COLUMN confidence_metrics.trend_data IS 'JSON object containing trend analysis data (success rate, achievement momentum, etc.)';
COMMENT ON COLUMN mindfulness_sessions.duration_completed IS 'Duration of the session completed in seconds';
COMMENT ON COLUMN anxiety_interventions.strategies_offered IS 'JSON array of coping strategies offered to the user';
COMMENT ON COLUMN anxiety_interventions.outcome_data IS 'JSON object containing intervention outcome metrics';
COMMENT ON COLUMN coping_strategies.customizations IS 'JSON object containing user-specific strategy customizations';

-- End of migration