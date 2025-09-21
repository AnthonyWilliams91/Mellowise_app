-- MELLOWISE-015: Smart Notification System Database Schema
-- Migration: 006_notification_system.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- NOTIFICATION PREFERENCES TABLE
-- =============================================
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Channel preferences
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,

    -- Notification type preferences
    study_reminders_enabled BOOLEAN DEFAULT true,
    goal_deadlines_enabled BOOLEAN DEFAULT true,
    streak_maintenance_enabled BOOLEAN DEFAULT true,
    achievements_enabled BOOLEAN DEFAULT true,
    break_reminders_enabled BOOLEAN DEFAULT true,
    performance_alerts_enabled BOOLEAN DEFAULT true,

    -- Quiet hours configuration
    quiet_hours_enabled BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'America/New_York',

    -- Frequency settings
    study_reminder_frequency TEXT DEFAULT 'daily' CHECK (study_reminder_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'adaptive')),
    goal_deadline_frequency TEXT DEFAULT 'adaptive' CHECK (goal_deadline_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'adaptive')),
    max_daily_notifications INTEGER DEFAULT 5 CHECK (max_daily_notifications > 0),

    -- Smart defaults
    use_optimal_timing BOOLEAN DEFAULT true,
    adapt_to_performance BOOLEAN DEFAULT true,
    spaced_repetition_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification details
    type TEXT NOT NULL CHECK (type IN ('study_reminder', 'goal_deadline', 'streak_maintenance', 'achievement', 'break_reminder', 'performance_alert')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',

    -- Delivery settings
    channels TEXT[] NOT NULL DEFAULT '{}',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATION QUEUE TABLE
-- =============================================
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,

    -- Queue management
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    retries INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    -- Processing metadata
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SPACED REPETITION SCHEDULES TABLE
-- =============================================
CREATE TABLE spaced_repetition_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL, -- Could reference a topics table

    -- Spaced repetition data
    last_review TIMESTAMP WITH TIME ZONE NOT NULL,
    next_review TIMESTAMP WITH TIME ZONE NOT NULL,
    interval_days INTEGER NOT NULL DEFAULT 1,
    ease_factor DECIMAL(3,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30 AND ease_factor <= 3.00),
    repetitions INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, topic_id)
);

-- =============================================
-- NOTIFICATION ANALYTICS TABLE
-- =============================================
CREATE TABLE notification_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,

    -- Analytics data
    period_month TEXT NOT NULL, -- YYYY-MM format
    notification_type TEXT NOT NULL,
    channel TEXT NOT NULL,

    -- Metrics
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    dismissed_count INTEGER DEFAULT 0,

    -- Engagement metrics
    study_sessions_triggered INTEGER DEFAULT 0,
    goals_completed INTEGER DEFAULT 0,
    streaks_maintained INTEGER DEFAULT 0,
    avg_response_time_minutes INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, period_month, notification_type, channel)
);

-- =============================================
-- SMS SPECIFIC TABLES
-- =============================================

-- SMS Analytics
CREATE TABLE sms_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    phone_number TEXT NOT NULL,
    message_type TEXT NOT NULL,
    message_length INTEGER NOT NULL,

    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_code TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incoming SMS Log
CREATE TABLE sms_incoming_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    message_body TEXT NOT NULL,
    message_sid TEXT,
    command_processed TEXT,
    response_sent TEXT,

    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- BURNOUT PREVENTION TABLE
-- =============================================
CREATE TABLE burnout_prevention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Burnout indicators
    consecutive_study_days INTEGER DEFAULT 0,
    average_daily_hours DECIMAL(4,2) DEFAULT 0,
    performance_trend TEXT DEFAULT 'stable' CHECK (performance_trend IN ('improving', 'stable', 'declining')),
    frustration_score INTEGER DEFAULT 0 CHECK (frustration_score >= 0 AND frustration_score <= 100),
    last_break TIMESTAMP WITH TIME ZONE,
    stress_level TEXT DEFAULT 'low' CHECK (stress_level IN ('low', 'moderate', 'high')),

    -- Recommendations
    suggest_break BOOLEAN DEFAULT false,
    reduce_intensity BOOLEAN DEFAULT false,
    switch_topic BOOLEAN DEFAULT false,
    celebrate_progress BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

-- =============================================
-- REMINDER RULES TABLE
-- =============================================
CREATE TABLE reminder_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_based', 'performance_based', 'goal_based', 'streak_based')),

    -- Conditions (JSON for flexibility)
    conditions JSONB NOT NULL DEFAULT '{}',

    -- Actions
    action_type TEXT NOT NULL,
    action_template TEXT NOT NULL,
    action_priority TEXT DEFAULT 'medium' CHECK (action_priority IN ('low', 'medium', 'high', 'critical')),
    action_channels TEXT[] DEFAULT '{}',

    -- Frequency limits
    max_per_day INTEGER DEFAULT 1,
    min_hours_between INTEGER DEFAULT 4,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- IN-APP NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE in_app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    data JSONB DEFAULT '{}',

    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user ON notification_preferences(tenant_id, user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_type ON notifications(tenant_id, user_id, type);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Notification queue indexes
CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_for) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_notification_queue_retries ON notification_queue(status, next_retry) WHERE status = 'pending' AND retries < max_retries;

-- Spaced repetition indexes
CREATE INDEX idx_spaced_repetition_user_topic ON spaced_repetition_schedules(tenant_id, user_id, topic_id);
CREATE INDEX idx_spaced_repetition_next_review ON spaced_repetition_schedules(next_review) WHERE next_review <= NOW();

-- Analytics indexes
CREATE INDEX idx_notification_analytics_user_period ON notification_analytics(tenant_id, user_id, period_month);
CREATE INDEX idx_sms_analytics_sent_at ON sms_analytics(sent_at);
CREATE INDEX idx_sms_incoming_phone ON sms_incoming_log(phone_number, received_at);

-- In-app notifications indexes
CREATE INDEX idx_in_app_notifications_user_unread ON in_app_notifications(tenant_id, user_id) WHERE read = false;
CREATE INDEX idx_in_app_notifications_created ON in_app_notifications(created_at);

-- Burnout prevention index
CREATE INDEX idx_burnout_prevention_user ON burnout_prevention(tenant_id, user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_prevention ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (tenant-based isolation)
CREATE POLICY notification_preferences_tenant_isolation ON notification_preferences
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY notifications_tenant_isolation ON notifications
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY notification_queue_tenant_isolation ON notification_queue
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY spaced_repetition_tenant_isolation ON spaced_repetition_schedules
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY notification_analytics_tenant_isolation ON notification_analytics
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY sms_analytics_tenant_isolation ON sms_analytics
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY burnout_prevention_tenant_isolation ON burnout_prevention
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY reminder_rules_tenant_isolation ON reminder_rules
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY in_app_notifications_tenant_isolation ON in_app_notifications
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- SMS incoming log is global (no tenant isolation needed for phone numbers)
-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE
    ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE
    ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_queue_updated_at BEFORE UPDATE
    ON notification_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_updated_at BEFORE UPDATE
    ON spaced_repetition_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_analytics_updated_at BEFORE UPDATE
    ON notification_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_burnout_prevention_updated_at BEFORE UPDATE
    ON burnout_prevention FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_rules_updated_at BEFORE UPDATE
    ON reminder_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA
-- =============================================

-- No initial data needed - preferences will be created per user

COMMENT ON TABLE notification_preferences IS 'User notification preferences and settings';
COMMENT ON TABLE notifications IS 'All notifications sent to users';
COMMENT ON TABLE notification_queue IS 'Queue for processing notifications';
COMMENT ON TABLE spaced_repetition_schedules IS 'Spaced repetition scheduling for topics';
COMMENT ON TABLE notification_analytics IS 'Notification engagement analytics';
COMMENT ON TABLE sms_analytics IS 'SMS-specific delivery analytics';
COMMENT ON TABLE burnout_prevention IS 'User burnout indicators and interventions';
COMMENT ON TABLE reminder_rules IS 'Custom reminder rules for users';
COMMENT ON TABLE in_app_notifications IS 'In-app notification display data';