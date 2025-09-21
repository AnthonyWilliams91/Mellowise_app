-- MELLOWISE-015: Performance Monitoring System Database Schema
-- Migration: 007_performance_monitoring_system.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================
-- PERFORMANCE METRICS TABLES
-- =============================================

-- Core performance metrics storage
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metric identification
    metric_name TEXT NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    tags JSONB DEFAULT '{}',

    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggregated metrics for faster queries
CREATE TABLE performance_metrics_aggregated (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Aggregation details
    metric_name TEXT NOT NULL,
    time_window TEXT NOT NULL, -- '1m', '5m', '1h', '1d'
    aggregation_type TEXT NOT NULL CHECK (aggregation_type IN ('avg', 'sum', 'min', 'max', 'p50', 'p95', 'p99', 'count')),

    -- Aggregated values
    value DECIMAL(15,6) NOT NULL,
    sample_count INTEGER NOT NULL DEFAULT 1,

    -- Time range
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, metric_name, time_window, aggregation_type, timestamp)
);

-- =============================================
-- DATABASE MONITORING TABLES
-- =============================================

-- Slow query tracking
CREATE TABLE slow_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Query details
    query_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    duration_ms DECIMAL(10,3) NOT NULL,
    rows_affected INTEGER DEFAULT 0,
    plan_type TEXT DEFAULT 'unknown',

    -- Query analysis
    query_hash TEXT, -- Hash of normalized query
    execution_plan JSONB,
    parameters JSONB DEFAULT '{}',

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query error tracking
CREATE TABLE query_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Error details
    query_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_type TEXT NOT NULL,
    stack_trace TEXT,

    -- Context
    parameters JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database health tracking
CREATE TABLE database_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Health status
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms DECIMAL(10,3) NOT NULL,
    active_connections INTEGER NOT NULL,

    -- Detailed checks
    connectivity_check BOOLEAN NOT NULL,
    replication_status BOOLEAN DEFAULT true,
    disk_usage_percent DECIMAL(5,2) DEFAULT 0,

    -- Metrics
    cpu_usage DECIMAL(5,2) DEFAULT 0,
    memory_usage DECIMAL(5,2) DEFAULT 0,
    network_io_mbps DECIMAL(10,3) DEFAULT 0,

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- EXTERNAL SERVICE MONITORING
-- =============================================

-- Service call tracking
CREATE TABLE service_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Service details
    service_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    endpoint TEXT,

    -- Performance metrics
    duration_ms DECIMAL(10,3) NOT NULL,
    success BOOLEAN NOT NULL,
    status_code INTEGER,
    response_size_bytes INTEGER DEFAULT 0,

    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Context
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limit tracking
CREATE TABLE rate_limit_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Service details
    service_name TEXT NOT NULL,
    endpoint TEXT,

    -- Rate limit data
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_type TEXT NOT NULL CHECK (window_type IN ('minute', 'hour', 'day')),
    request_count INTEGER NOT NULL DEFAULT 0,
    limit_value INTEGER NOT NULL,

    -- Status
    exceeded BOOLEAN DEFAULT false,
    reset_time TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(service_name, endpoint, window_start, window_type)
);

-- Service cost tracking
CREATE TABLE service_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Service details
    service_name TEXT NOT NULL,
    operation TEXT NOT NULL,

    -- Cost information
    cost_amount DECIMAL(10,6) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',

    -- Context
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service health status
CREATE TABLE service_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Service identification
    service_name TEXT NOT NULL,

    -- Health metrics
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down', 'unknown')),
    uptime_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
    avg_response_time_ms DECIMAL(10,3) NOT NULL DEFAULT 0,
    error_rate DECIMAL(5,4) NOT NULL DEFAULT 0,

    -- SLA tracking
    sla_compliance_percent DECIMAL(5,2) DEFAULT 100,
    last_incident TIMESTAMP WITH TIME ZONE,

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(service_name, timestamp::date) -- One record per service per day
);

-- =============================================
-- ALERT MANAGEMENT
-- =============================================

-- Alert rules
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Rule details
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    metric TEXT NOT NULL,

    -- Conditions and actions
    conditions JSONB NOT NULL, -- Array of AlertCondition
    actions JSONB NOT NULL, -- Array of AlertAction
    suppression_rules JSONB DEFAULT '[]',
    escalation_policy JSONB,

    -- Metadata
    tags JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, name)
);

-- Active alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Alert details
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source TEXT NOT NULL CHECK (source IN ('performance', 'availability', 'threshold', 'anomaly', 'external')),

    -- Associated metrics
    component TEXT NOT NULL,
    metric TEXT,
    current_value DECIMAL(15,6),
    threshold DECIMAL(15,6),

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'suppressed')),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    tags JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert notifications
CREATE TABLE alert_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,

    -- Notification details
    channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'sms', 'webhook', 'pagerduty')),
    recipient TEXT NOT NULL,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Response tracking
    response TEXT,
    error TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert suppressions
CREATE TABLE alert_suppressions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Suppression criteria
    component TEXT NOT NULL,
    metric TEXT,
    tags JSONB DEFAULT '{}',

    -- Suppression details
    duration TEXT NOT NULL,
    reason TEXT NOT NULL,

    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Alert thresholds (custom user-defined)
CREATE TABLE alert_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Threshold definition
    metric TEXT NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('gt', 'gte', 'lt', 'lte', 'eq', 'neq')),
    value DECIMAL(15,6) NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Configuration
    enabled BOOLEAN DEFAULT true,
    duration TEXT DEFAULT '5m',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, metric, operator, value)
);

-- =============================================
-- INCIDENT CORRELATION
-- =============================================

-- Incident tracking
CREATE TABLE incident_correlations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Incident details
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Related alerts
    alert_ids UUID[] NOT NULL DEFAULT '{}',

    -- Resolution
    root_cause TEXT,
    resolution TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- DASHBOARD AND REPORTING
-- =============================================

-- Dashboard alerts (for UI display)
CREATE TABLE dashboard_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Alert classification
    type TEXT NOT NULL CHECK (type IN ('performance', 'availability', 'cost', 'threshold', 'anomaly')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Alert details
    component TEXT NOT NULL,
    metric TEXT NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    threshold DECIMAL(15,6),
    message TEXT NOT NULL,

    -- Status
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance reports
CREATE TABLE performance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Report details
    title TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Report content
    summary JSONB NOT NULL,
    sections JSONB NOT NULL,

    -- Metadata
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS STORAGE
-- =============================================

-- Anomaly detection results
CREATE TABLE anomaly_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Anomaly details
    metric TEXT NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    expected_value DECIMAL(15,6) NOT NULL,
    deviation_score DECIMAL(10,6) NOT NULL,

    -- Classification
    anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('spike', 'dip', 'drift', 'missing')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Context
    context JSONB DEFAULT '{}',
    possible_causes TEXT[] DEFAULT '{}',

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance insights
CREATE TABLE performance_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Insight details
    type TEXT NOT NULL CHECK (type IN ('optimization', 'trend', 'anomaly', 'capacity', 'cost')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Impact assessment
    impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

    -- Supporting data
    data JSONB NOT NULL,
    recommendations JSONB DEFAULT '[]',

    -- Status
    acknowledged BOOLEAN DEFAULT false,
    implemented BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Performance metrics indexes
CREATE INDEX idx_performance_metrics_name_time ON performance_metrics(metric_name, timestamp DESC);
CREATE INDEX idx_performance_metrics_tenant_time ON performance_metrics(tenant_id, timestamp DESC);
CREATE INDEX idx_performance_metrics_tags ON performance_metrics USING GIN(tags);

-- Aggregated metrics indexes
CREATE INDEX idx_performance_metrics_agg_lookup ON performance_metrics_aggregated(tenant_id, metric_name, time_window, aggregation_type, timestamp DESC);

-- Database monitoring indexes
CREATE INDEX idx_slow_queries_duration ON slow_queries(duration_ms DESC, timestamp DESC);
CREATE INDEX idx_slow_queries_table ON slow_queries(table_name, timestamp DESC);
CREATE INDEX idx_query_errors_type ON query_errors(error_type, timestamp DESC);

-- Service monitoring indexes
CREATE INDEX idx_service_calls_service_time ON service_calls(service_name, timestamp DESC);
CREATE INDEX idx_service_calls_success ON service_calls(success, timestamp DESC);
CREATE INDEX idx_rate_limit_service_window ON rate_limit_usage(service_name, window_start DESC);
CREATE INDEX idx_service_costs_service_time ON service_costs(service_name, timestamp DESC);

-- Alert indexes
CREATE INDEX idx_alerts_status_time ON alerts(status, created_at DESC);
CREATE INDEX idx_alerts_severity_time ON alerts(severity, created_at DESC);
CREATE INDEX idx_alerts_component ON alerts(component, created_at DESC);
CREATE INDEX idx_alert_notifications_status ON alert_notifications(status, last_attempt);

-- Dashboard indexes
CREATE INDEX idx_dashboard_alerts_active ON dashboard_alerts(resolved, timestamp DESC) WHERE resolved = false;
CREATE INDEX idx_dashboard_alerts_tenant ON dashboard_alerts(tenant_id, timestamp DESC);

-- Analytics indexes
CREATE INDEX idx_anomaly_detections_metric_time ON anomaly_detections(metric, timestamp DESC);
CREATE INDEX idx_performance_insights_type_time ON performance_insights(type, created_at DESC);
CREATE INDEX idx_performance_insights_impact ON performance_insights(impact, created_at DESC);

-- =============================================
-- PARTITIONING (FOR LARGE SCALE)
-- =============================================

-- Partition performance_metrics by month
-- This would be implemented if the table grows large
-- ALTER TABLE performance_metrics PARTITION BY RANGE (timestamp);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on tenant-specific tables
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics_aggregated ENABLE ROW LEVEL SECURITY;
ALTER TABLE slow_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY performance_metrics_tenant_isolation ON performance_metrics
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY performance_metrics_agg_tenant_isolation ON performance_metrics_aggregated
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY slow_queries_tenant_isolation ON slow_queries
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY query_errors_tenant_isolation ON query_errors
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY service_calls_tenant_isolation ON service_calls
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY service_costs_tenant_isolation ON service_costs
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY alert_rules_tenant_isolation ON alert_rules
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY alerts_tenant_isolation ON alerts
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY alert_thresholds_tenant_isolation ON alert_thresholds
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY incident_correlations_tenant_isolation ON incident_correlations
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY dashboard_alerts_tenant_isolation ON dashboard_alerts
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY performance_reports_tenant_isolation ON performance_reports
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY anomaly_detections_tenant_isolation ON anomaly_detections
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

CREATE POLICY performance_insights_tenant_isolation ON performance_insights
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID OR tenant_id IS NULL);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_rate_limit_usage_updated_at BEFORE UPDATE
    ON rate_limit_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE
    ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE
    ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_notifications_updated_at BEFORE UPDATE
    ON alert_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_thresholds_updated_at BEFORE UPDATE
    ON alert_thresholds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS FOR ANALYTICS
-- =============================================

-- Function to clean up old metrics data
CREATE OR REPLACE FUNCTION cleanup_old_metrics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Clean up old performance metrics (keep detailed data for specified days)
    DELETE FROM performance_metrics
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Clean up old slow queries (keep for 30 days)
    DELETE FROM slow_queries
    WHERE created_at < NOW() - INTERVAL '30 days';

    -- Clean up old service calls (keep for 30 days)
    DELETE FROM service_calls
    WHERE created_at < NOW() - INTERVAL '30 days';

    -- Clean up resolved alerts (keep for 90 days)
    DELETE FROM alerts
    WHERE status = 'resolved' AND resolved_at < NOW() - INTERVAL '90 days';

    -- Clean up old anomaly detections (keep for 60 days)
    DELETE FROM anomaly_detections
    WHERE detected_at < NOW() - INTERVAL '60 days';

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate metrics
CREATE OR REPLACE FUNCTION aggregate_metrics(
    metric_name_param TEXT,
    time_window_param TEXT,
    aggregation_type_param TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO performance_metrics_aggregated (
        tenant_id, metric_name, time_window, aggregation_type,
        value, sample_count, timestamp, window_start, window_end
    )
    SELECT
        tenant_id,
        metric_name_param,
        time_window_param,
        aggregation_type_param,
        CASE
            WHEN aggregation_type_param = 'avg' THEN AVG(value)
            WHEN aggregation_type_param = 'sum' THEN SUM(value)
            WHEN aggregation_type_param = 'min' THEN MIN(value)
            WHEN aggregation_type_param = 'max' THEN MAX(value)
            WHEN aggregation_type_param = 'count' THEN COUNT(*)::DECIMAL
            ELSE AVG(value) -- Default to average
        END as value,
        COUNT(*) as sample_count,
        date_trunc('hour', timestamp) as timestamp,
        start_time,
        end_time
    FROM performance_metrics
    WHERE metric_name = metric_name_param
        AND timestamp >= start_time
        AND timestamp < end_time
    GROUP BY tenant_id, date_trunc('hour', timestamp)
    ON CONFLICT (tenant_id, metric_name, time_window, aggregation_type, timestamp)
    DO UPDATE SET
        value = EXCLUDED.value,
        sample_count = EXCLUDED.sample_count,
        window_end = EXCLUDED.window_end;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA AND CONFIGURATION
-- =============================================

-- Insert default alert thresholds for system metrics
INSERT INTO alert_thresholds (tenant_id, metric, operator, value, severity, duration) VALUES
('00000000-0000-0000-0000-000000000000', 'notification.delivery.latency', 'gt', 5000, 'high', '5m'),
('00000000-0000-0000-0000-000000000000', 'notification.delivery.success_rate', 'lt', 0.95, 'medium', '10m'),
('00000000-0000-0000-0000-000000000000', 'database.query.latency', 'gt', 1000, 'medium', '5m'),
('00000000-0000-0000-0000-000000000000', 'api.request.latency', 'gt', 2000, 'high', '5m'),
('00000000-0000-0000-0000-000000000000', 'system.memory.usage', 'gt', 512, 'medium', '10m'),
('00000000-0000-0000-0000-000000000000', 'system.cpu.usage', 'gt', 80, 'high', '5m');

-- Table comments for documentation
COMMENT ON TABLE performance_metrics IS 'Raw performance metrics collected from the application';
COMMENT ON TABLE performance_metrics_aggregated IS 'Pre-aggregated metrics for faster dashboard queries';
COMMENT ON TABLE slow_queries IS 'Database queries that exceed performance thresholds';
COMMENT ON TABLE query_errors IS 'Database query errors and failures';
COMMENT ON TABLE service_calls IS 'External service API call tracking';
COMMENT ON TABLE service_costs IS 'Cost tracking for external service usage';
COMMENT ON TABLE alert_rules IS 'User-defined alert rules and conditions';
COMMENT ON TABLE alerts IS 'Active and historical alerts';
COMMENT ON TABLE anomaly_detections IS 'Machine learning detected anomalies';
COMMENT ON TABLE performance_insights IS 'AI-generated performance insights and recommendations';