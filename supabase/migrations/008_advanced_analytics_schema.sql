-- MELLOWISE-015: Advanced Analytics Database Schema
-- Migration: 008_advanced_analytics_schema.sql
-- This migration adds comprehensive analytics tables for the advanced notification analytics system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- BEHAVIORAL ANALYTICS TABLES
-- =============================================

-- User behavior patterns and analytics
CREATE TABLE behavior_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Pattern identification
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('engagement', 'timing', 'content', 'channel', 'frequency')),
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,

    -- Pattern strength and confidence
    strength DECIMAL(3,2) NOT NULL CHECK (strength >= 0 AND strength <= 1),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    frequency INTEGER NOT NULL DEFAULT 0,

    -- Pattern data
    pattern_data JSONB NOT NULL DEFAULT '{}',
    examples JSONB DEFAULT '[]',
    insights JSONB DEFAULT '[]',

    -- Analysis period
    time_window TEXT NOT NULL,
    predictive_value DECIMAL(3,2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, pattern_type, pattern_name)
);

-- User engagement scores and components
CREATE TABLE engagement_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Overall score
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

    -- Component scores
    responsiveness INTEGER NOT NULL CHECK (responsiveness >= 0 AND responsiveness <= 100),
    consistency INTEGER NOT NULL CHECK (consistency >= 0 AND consistency <= 100),
    depth INTEGER NOT NULL CHECK (depth >= 0 AND depth <= 100),
    retention INTEGER NOT NULL CHECK (retention >= 0 AND retention <= 100),
    advocacy INTEGER NOT NULL CHECK (advocacy >= 0 AND advocacy <= 100),

    -- Trend and segmentation
    trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
    segment_category TEXT NOT NULL CHECK (segment_category IN ('highly_engaged', 'moderately_engaged', 'at_risk', 'disengaged')),

    -- Metadata
    calculation_period TEXT NOT NULL,
    last_calculated TIMESTAMP WITH TIME ZONE NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Behavior segments and their definitions
CREATE TABLE behavior_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    segment_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Segment criteria
    criteria JSONB NOT NULL,
    user_count INTEGER NOT NULL DEFAULT 0,

    -- Segment characteristics
    characteristics JSONB DEFAULT '[]',
    engagement_metrics JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, segment_id)
);

-- =============================================
-- COHORT ANALYSIS TABLES
-- =============================================

-- Cohort definitions and configurations
CREATE TABLE cohort_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    cohort_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,

    -- Cohort criteria
    criteria JSONB NOT NULL,
    tracking_period INTEGER NOT NULL DEFAULT 90,
    milestones INTEGER[] DEFAULT '{1,7,14,30,60,90}',

    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    user_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, cohort_id)
);

-- Cohort membership tracking
CREATE TABLE cohort_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cohort_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, cohort_id, user_id),
    FOREIGN KEY (tenant_id, cohort_id) REFERENCES cohort_definitions(tenant_id, cohort_id) ON DELETE CASCADE
);

-- Cohort metrics and performance data
CREATE TABLE cohort_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cohort_id TEXT NOT NULL,

    milestone INTEGER NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Comprehensive metrics
    metrics_data JSONB NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, cohort_id, milestone),
    FOREIGN KEY (tenant_id, cohort_id) REFERENCES cohort_definitions(tenant_id, cohort_id) ON DELETE CASCADE
);

-- =============================================
-- PREDICTIVE ANALYTICS TABLES
-- =============================================

-- ML models for predictions
CREATE TABLE predictive_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    model_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    model_type TEXT NOT NULL CHECK (model_type IN ('classification', 'regression', 'time_series', 'clustering')),
    target_variable TEXT NOT NULL,

    -- Model metadata
    version TEXT NOT NULL,
    training_data JSONB NOT NULL,
    performance JSONB NOT NULL,
    hyperparameters JSONB DEFAULT '{}',
    feature_importance JSONB DEFAULT '[]',

    -- Deployment info
    status TEXT NOT NULL CHECK (status IN ('training', 'ready', 'deprecated', 'failed')),
    last_trained TIMESTAMP WITH TIME ZONE,
    last_evaluated TIMESTAMP WITH TIME ZONE,
    deployed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, model_id)
);

-- Prediction results and caching
CREATE TABLE prediction_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    prediction_type TEXT NOT NULL CHECK (prediction_type IN ('engagement', 'churn', 'performance', 'timing')),
    model_id TEXT NOT NULL,

    -- Prediction data
    prediction_data JSONB NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

    -- Context and expiration
    context_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    INDEX(tenant_id, user_id, prediction_type),
    INDEX(expires_at),
    FOREIGN KEY (tenant_id, model_id) REFERENCES predictive_models(tenant_id, model_id) ON DELETE CASCADE
);

-- Model training jobs
CREATE TABLE model_training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    job_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),

    -- Training configuration
    config JSONB NOT NULL,
    progress JSONB DEFAULT '{}',
    results JSONB,
    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, job_id),
    FOREIGN KEY (tenant_id, model_id) REFERENCES predictive_models(tenant_id, model_id) ON DELETE CASCADE
);

-- =============================================
-- A/B TESTING FRAMEWORK TABLES
-- =============================================

-- Experiment definitions
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    experiment_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    hypothesis TEXT NOT NULL,

    -- Experiment configuration
    status TEXT NOT NULL CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
    type TEXT NOT NULL CHECK (type IN ('a_b', 'multivariate', 'split_url', 'feature_flag')),

    -- Targeting and variants
    targeting_rules JSONB NOT NULL,
    variants JSONB NOT NULL,
    control_variant TEXT NOT NULL,

    -- Metrics and statistical settings
    primary_metric TEXT NOT NULL,
    secondary_metrics TEXT[] DEFAULT '{}',
    guardrail_metrics TEXT[] DEFAULT '{}',
    statistical_settings JSONB NOT NULL,

    -- Timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- days

    -- Results
    results JSONB,

    -- Metadata
    created_by TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, experiment_id)
);

-- Experiment participation tracking
CREATE TABLE experiment_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    participation_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id TEXT NOT NULL,

    -- Participation details
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    exposed_at TIMESTAMP WITH TIME ZONE,

    -- Conversion tracking
    conversions JSONB DEFAULT '[]',

    -- Metadata
    user_segment TEXT,
    device_type TEXT,
    location TEXT,
    experiment_context JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, participation_id),
    UNIQUE(tenant_id, experiment_id, user_id),
    FOREIGN KEY (tenant_id, experiment_id) REFERENCES experiments(tenant_id, experiment_id) ON DELETE CASCADE
);

-- Experiment metrics definitions
CREATE TABLE experiment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    metric_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('conversion', 'numeric', 'duration', 'count')),

    -- Calculation
    calculation_method TEXT NOT NULL CHECK (calculation_method IN ('sum', 'average', 'median', 'count', 'percentage', 'custom')),
    data_source TEXT NOT NULL,
    filter_conditions JSONB DEFAULT '[]',

    -- For conversion metrics
    conversion_window INTEGER, -- hours
    conversion_events TEXT[] DEFAULT '{}',

    -- Statistical properties
    expected_range JSONB NOT NULL, -- {min, max}
    historical_mean DECIMAL,
    historical_std_dev DECIMAL,

    -- Business context
    business_impact TEXT NOT NULL CHECK (business_impact IN ('low', 'medium', 'high', 'critical')),
    is_guardrail BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, metric_id)
);

-- =============================================
-- LEARNING OUTCOMES TABLES
-- =============================================

-- Learning outcome measurements
CREATE TABLE learning_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    outcome_type TEXT NOT NULL CHECK (outcome_type IN ('academic_performance', 'skill_mastery', 'goal_achievement', 'engagement', 'retention')),

    -- Outcome metrics
    baseline DECIMAL NOT NULL,
    current_value DECIMAL NOT NULL,
    improvement DECIMAL NOT NULL,
    trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
    confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),

    -- Time context
    timeframe JSONB NOT NULL,

    -- Notification correlation
    notification_correlation JSONB NOT NULL,
    supporting_metrics JSONB DEFAULT '[]',

    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study habit analysis
CREATE TABLE study_habit_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Habit strength metrics
    habit_strength JSONB NOT NULL,
    notification_impact JSONB NOT NULL,
    temporal_patterns JSONB NOT NULL,
    personalized_insights JSONB DEFAULT '[]',

    last_analyzed TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, last_analyzed::date)
);

-- Goal achievement correlation
CREATE TABLE goal_achievement_correlation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Goal metrics
    goal_metrics JSONB NOT NULL,
    notification_correlation JSONB NOT NULL,
    category_performance JSONB DEFAULT '[]',
    predictions JSONB DEFAULT '{}',

    analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PERSONALIZATION ENGINE TABLES
-- =============================================

-- User personalization profiles
CREATE TABLE user_personalization_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Learning preferences
    learning_preferences JSONB NOT NULL,
    notification_preferences JSONB NOT NULL,
    behavior_patterns JSONB NOT NULL,
    adaptive_parameters JSONB NOT NULL,

    -- Model state
    model_state JSONB NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

-- Personalization recommendations
CREATE TABLE personalization_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('content', 'timing', 'frequency', 'channel', 'difficulty', 'format')),

    -- Recommendation details
    recommendation JSONB NOT NULL,
    context JSONB NOT NULL,
    implementation JSONB NOT NULL,
    validation JSONB NOT NULL,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'tested', 'adopted', 'rejected')),

    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX(tenant_id, user_id, recommendation_type),
    INDEX(expires_at)
);

-- Personalization experiments
CREATE TABLE personalization_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    experiment_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experiment_type TEXT NOT NULL CHECK (experiment_type IN ('content_optimization', 'timing_optimization', 'frequency_tuning', 'channel_preference')),

    -- Experiment setup
    hypothesis TEXT NOT NULL,
    variants JSONB NOT NULL,
    current_variant TEXT NOT NULL,

    -- Execution
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'failed')),

    -- Results tracking
    metrics JSONB DEFAULT '[]',
    decision_criteria JSONB NOT NULL,
    results JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, experiment_id)
);

-- Content personalization
CREATE TABLE content_personalization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content preferences and rules
    content_preferences JSONB NOT NULL,
    content_rules JSONB DEFAULT '[]',
    content_performance JSONB DEFAULT '[]',
    content_tests JSONB DEFAULT '[]',

    last_optimized TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

-- Timing personalization
CREATE TABLE timing_personalization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Timing insights and configuration
    timing_insights JSONB NOT NULL,
    contextual_timing JSONB NOT NULL,
    adaptive_scheduling JSONB NOT NULL,
    timing_experiments JSONB DEFAULT '[]',

    last_calibrated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

-- Frequency personalization
CREATE TABLE frequency_personalization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Frequency analysis and configuration
    frequency_analysis JSONB NOT NULL,
    fatigue_model JSONB NOT NULL,
    adaptive_frequency JSONB NOT NULL,
    frequency_experiments JSONB DEFAULT '[]',

    last_optimized TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

-- =============================================
-- ANALYTICS REPORTING TABLES
-- =============================================

-- Analytics report cache
CREATE TABLE analytics_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    report_id TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_scope TEXT NOT NULL, -- 'user', 'cohort', 'tenant'

    -- Report data
    report_data JSONB NOT NULL,
    parameters JSONB DEFAULT '{}',

    -- Cache metadata
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, report_id),
    INDEX(expires_at)
);

-- Performance metrics time series
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    metric_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value DECIMAL NOT NULL,

    -- Dimensions
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cohort_id TEXT,
    experiment_id TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX(tenant_id, metric_name, timestamp),
    INDEX(tenant_id, user_id, metric_name, timestamp),
    INDEX(timestamp) -- For cleanup
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Behavioral analytics indexes
CREATE INDEX idx_behavior_patterns_user_type ON behavior_patterns(tenant_id, user_id, pattern_type);
CREATE INDEX idx_behavior_patterns_strength ON behavior_patterns(strength DESC) WHERE strength > 0.5;
CREATE INDEX idx_engagement_scores_user ON engagement_scores(tenant_id, user_id, last_calculated DESC);
CREATE INDEX idx_engagement_scores_segment ON engagement_scores(tenant_id, segment_category);

-- Cohort analysis indexes
CREATE INDEX idx_cohort_memberships_cohort ON cohort_memberships(tenant_id, cohort_id, joined_at);
CREATE INDEX idx_cohort_memberships_user ON cohort_memberships(tenant_id, user_id);
CREATE INDEX idx_cohort_metrics_cohort_milestone ON cohort_metrics(tenant_id, cohort_id, milestone);

-- Predictive analytics indexes
CREATE INDEX idx_prediction_results_user_type ON prediction_results(tenant_id, user_id, prediction_type);
CREATE INDEX idx_prediction_results_expires ON prediction_results(expires_at);
CREATE INDEX idx_model_training_jobs_status ON model_training_jobs(status, created_at);

-- A/B testing indexes
CREATE INDEX idx_experiments_status ON experiments(tenant_id, status);
CREATE INDEX idx_experiment_participations_experiment ON experiment_participations(tenant_id, experiment_id);
CREATE INDEX idx_experiment_participations_user ON experiment_participations(tenant_id, user_id);

-- Learning outcomes indexes
CREATE INDEX idx_learning_outcomes_user_type ON learning_outcomes(tenant_id, user_id, outcome_type);
CREATE INDEX idx_learning_outcomes_calculated ON learning_outcomes(calculated_at);
CREATE INDEX idx_study_habit_analysis_user ON study_habit_analysis(tenant_id, user_id, last_analyzed DESC);

-- Personalization indexes
CREATE INDEX idx_user_personalization_profiles_user ON user_personalization_profiles(tenant_id, user_id);
CREATE INDEX idx_personalization_recommendations_user ON personalization_recommendations(tenant_id, user_id, recommendation_type);
CREATE INDEX idx_personalization_recommendations_expires ON personalization_recommendations(expires_at);
CREATE INDEX idx_personalization_experiments_user ON personalization_experiments(tenant_id, user_id, status);

-- Analytics reporting indexes
CREATE INDEX idx_analytics_reports_type ON analytics_reports(tenant_id, report_type, generated_at DESC);
CREATE INDEX idx_analytics_reports_expires ON analytics_reports(expires_at);
CREATE INDEX idx_performance_metrics_time_series ON performance_metrics(tenant_id, metric_name, timestamp);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all analytics tables
ALTER TABLE behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_habit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_achievement_correlation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE timing_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequency_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (tenant-based isolation)
-- Behavioral Analytics
CREATE POLICY behavior_patterns_tenant_isolation ON behavior_patterns
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY engagement_scores_tenant_isolation ON engagement_scores
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY behavior_segments_tenant_isolation ON behavior_segments
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Cohort Analysis
CREATE POLICY cohort_definitions_tenant_isolation ON cohort_definitions
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY cohort_memberships_tenant_isolation ON cohort_memberships
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY cohort_metrics_tenant_isolation ON cohort_metrics
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Predictive Analytics
CREATE POLICY predictive_models_tenant_isolation ON predictive_models
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY prediction_results_tenant_isolation ON prediction_results
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY model_training_jobs_tenant_isolation ON model_training_jobs
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- A/B Testing
CREATE POLICY experiments_tenant_isolation ON experiments
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY experiment_participations_tenant_isolation ON experiment_participations
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY experiment_metrics_tenant_isolation ON experiment_metrics
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Learning Outcomes
CREATE POLICY learning_outcomes_tenant_isolation ON learning_outcomes
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY study_habit_analysis_tenant_isolation ON study_habit_analysis
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY goal_achievement_correlation_tenant_isolation ON goal_achievement_correlation
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Personalization
CREATE POLICY user_personalization_profiles_tenant_isolation ON user_personalization_profiles
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY personalization_recommendations_tenant_isolation ON personalization_recommendations
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY personalization_experiments_tenant_isolation ON personalization_experiments
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY content_personalization_tenant_isolation ON content_personalization
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY timing_personalization_tenant_isolation ON timing_personalization
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY frequency_personalization_tenant_isolation ON frequency_personalization
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Analytics Reporting
CREATE POLICY analytics_reports_tenant_isolation ON analytics_reports
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY performance_metrics_tenant_isolation ON performance_metrics
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_behavior_patterns_updated_at BEFORE UPDATE
    ON behavior_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_scores_updated_at BEFORE UPDATE
    ON engagement_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_behavior_segments_updated_at BEFORE UPDATE
    ON behavior_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohort_definitions_updated_at BEFORE UPDATE
    ON cohort_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictive_models_updated_at BEFORE UPDATE
    ON predictive_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE
    ON experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiment_metrics_updated_at BEFORE UPDATE
    ON experiment_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_personalization_profiles_updated_at BEFORE UPDATE
    ON user_personalization_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalization_experiments_updated_at BEFORE UPDATE
    ON personalization_experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS FOR ANALYTICS
-- =============================================

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
    p_user_id UUID,
    p_tenant_id UUID,
    p_time_window INTERVAL DEFAULT '30 days'
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
    responsiveness_score INTEGER;
    consistency_score INTEGER;
    depth_score INTEGER;
    retention_score INTEGER;
    advocacy_score INTEGER;
    overall_score INTEGER;
BEGIN
    -- Calculate component scores (simplified implementation)
    -- In practice, these would use complex algorithms from the analytics engines

    -- Responsiveness: based on notification response rates
    SELECT COALESCE(
        (COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100)::INTEGER,
        0
    ) INTO responsiveness_score
    FROM notifications
    WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND created_at >= NOW() - p_time_window;

    -- Consistency: based on daily activity patterns
    SELECT COALESCE(
        (COUNT(DISTINCT DATE(created_at))::FLOAT / EXTRACT(DAYS FROM p_time_window) * 100)::INTEGER,
        0
    ) INTO consistency_score
    FROM game_sessions
    WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND created_at >= NOW() - p_time_window;

    -- Depth: based on session completion and interaction
    SELECT COALESCE(
        (COUNT(CASE WHEN completed = true THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100)::INTEGER,
        0
    ) INTO depth_score
    FROM game_sessions
    WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND created_at >= NOW() - p_time_window;

    -- Retention: based on recent activity
    SELECT COALESCE(
        CASE
            WHEN MAX(created_at) >= NOW() - INTERVAL '7 days' THEN 100
            WHEN MAX(created_at) >= NOW() - INTERVAL '14 days' THEN 70
            WHEN MAX(created_at) >= NOW() - INTERVAL '30 days' THEN 40
            ELSE 0
        END,
        0
    ) INTO retention_score
    FROM game_sessions
    WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id;

    -- Advocacy: based on goal completion and streaks
    SELECT COALESCE(
        LEAST(100, (COUNT(*) * 10))::INTEGER,
        0
    ) INTO advocacy_score
    FROM game_sessions
    WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND created_at >= NOW() - p_time_window
    AND score > 80; -- High-quality sessions

    -- Calculate overall score
    overall_score := (responsiveness_score + consistency_score + depth_score + retention_score + advocacy_score) / 5;

    result := jsonb_build_object(
        'overall_score', overall_score,
        'responsiveness', responsiveness_score,
        'consistency', consistency_score,
        'depth', depth_score,
        'retention', retention_score,
        'advocacy', advocacy_score
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_analytics_data() RETURNS void AS $$
BEGIN
    -- Clean up expired prediction results
    DELETE FROM prediction_results WHERE expires_at < NOW();

    -- Clean up expired personalization recommendations
    DELETE FROM personalization_recommendations WHERE expires_at < NOW();

    -- Clean up expired analytics reports
    DELETE FROM analytics_reports WHERE expires_at < NOW();

    -- Clean up old performance metrics (keep last 1 year)
    DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '1 year';

    -- Log cleanup
    INSERT INTO performance_metrics (
        tenant_id, metric_name, metric_type, value, timestamp
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        'analytics.cleanup.executed',
        'count',
        1,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SCHEDULED JOBS AND MAINTENANCE
-- =============================================

-- Note: In a production environment, you would set up pg_cron or similar
-- for automated maintenance tasks. Example:
-- SELECT cron.schedule('analytics-cleanup', '0 2 * * *', 'SELECT cleanup_analytics_data();');

-- =============================================
-- INITIAL DATA AND SAMPLE METRICS
-- =============================================

-- Create default experiment metrics
INSERT INTO experiment_metrics (tenant_id, metric_id, name, description, metric_type, calculation_method, data_source, expected_range, business_impact) VALUES
('00000000-0000-0000-0000-000000000000', 'notification_open_rate', 'Notification Open Rate', 'Percentage of notifications that are opened/read', 'conversion', 'percentage', 'notifications', '{"min": 0, "max": 100}', 'high'),
('00000000-0000-0000-0000-000000000000', 'notification_click_rate', 'Notification Click Rate', 'Percentage of notifications that are clicked', 'conversion', 'percentage', 'notifications', '{"min": 0, "max": 100}', 'high'),
('00000000-0000-0000-0000-000000000000', 'study_session_initiation', 'Study Session Initiation', 'Rate of study sessions started after notification', 'conversion', 'percentage', 'game_sessions', '{"min": 0, "max": 100}', 'critical'),
('00000000-0000-0000-0000-000000000000', 'average_response_time', 'Average Response Time', 'Average time to respond to notifications (minutes)', 'numeric', 'average', 'notifications', '{"min": 1, "max": 1440}', 'medium'),
('00000000-0000-0000-0000-000000000000', 'goal_completion_rate', 'Goal Completion Rate', 'Percentage of goals completed', 'conversion', 'percentage', 'user_goals', '{"min": 0, "max": 100}', 'high'),
('00000000-0000-0000-0000-000000000000', 'user_retention_7d', 'User Retention (7 days)', '7-day user retention rate', 'conversion', 'percentage', 'game_sessions', '{"min": 0, "max": 100}', 'critical');

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE behavior_patterns IS 'User behavior patterns identified through analytics';
COMMENT ON TABLE engagement_scores IS 'User engagement scores and component breakdowns';
COMMENT ON TABLE behavior_segments IS 'User behavior segment definitions and characteristics';
COMMENT ON TABLE cohort_definitions IS 'Cohort definitions for tracking user groups over time';
COMMENT ON TABLE cohort_memberships IS 'User membership in cohorts';
COMMENT ON TABLE cohort_metrics IS 'Calculated metrics for cohorts at specific milestones';
COMMENT ON TABLE predictive_models IS 'ML models for predictive analytics';
COMMENT ON TABLE prediction_results IS 'Cached prediction results';
COMMENT ON TABLE model_training_jobs IS 'ML model training job tracking';
COMMENT ON TABLE experiments IS 'A/B test experiment definitions';
COMMENT ON TABLE experiment_participations IS 'User participation in A/B tests';
COMMENT ON TABLE experiment_metrics IS 'Metric definitions for A/B testing';
COMMENT ON TABLE learning_outcomes IS 'Learning outcome measurements and analysis';
COMMENT ON TABLE study_habit_analysis IS 'Study habit pattern analysis';
COMMENT ON TABLE goal_achievement_correlation IS 'Goal achievement correlation with notifications';
COMMENT ON TABLE user_personalization_profiles IS 'Individual user personalization profiles';
COMMENT ON TABLE personalization_recommendations IS 'Personalization recommendations for users';
COMMENT ON TABLE personalization_experiments IS 'Personal optimization experiments';
COMMENT ON TABLE content_personalization IS 'Content personalization settings';
COMMENT ON TABLE timing_personalization IS 'Timing personalization settings';
COMMENT ON TABLE frequency_personalization IS 'Frequency personalization settings';
COMMENT ON TABLE analytics_reports IS 'Cached analytics reports';
COMMENT ON TABLE performance_metrics IS 'Time series performance metrics';