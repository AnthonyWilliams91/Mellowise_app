-- Mellowise Database Performance Optimization
-- Version: 1.1
-- Created: 2025-01-10
-- Author: Dev Agent James

-- Additional performance indexes based on expected query patterns
-- Context7 Research: B-tree indexes for range queries, Hash for equality scans

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_sessions_user_type_started 
ON public.game_sessions(user_id, session_type, started_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_question_attempts_user_correct_time 
ON public.question_attempts(user_id, is_correct, attempted_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questions_type_difficulty_active 
ON public.questions(question_type, difficulty, is_active) WHERE is_active = true;

-- Covering index for frequent user profile queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_email_tier_active 
ON public.user_profiles(email, subscription_tier, last_active DESC);

-- Performance index for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_analytics_user_type_date 
ON public.user_analytics(user_id, metric_type, date_recorded DESC);

-- FERPA Audit Enhancement - Basic audit triggers for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, 
        action, 
        table_name, 
        record_id, 
        old_values, 
        new_values,
        ip_address
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        inet_client_addr()
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables for FERPA compliance
CREATE TRIGGER audit_user_profiles 
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_question_attempts 
    AFTER INSERT OR UPDATE OR DELETE ON public.question_attempts
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_user_analytics 
    AFTER INSERT OR UPDATE OR DELETE ON public.user_analytics
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Performance monitoring view for baseline metrics
CREATE OR REPLACE VIEW public.performance_metrics AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage statistics view
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Connection and query performance baseline
CREATE OR REPLACE VIEW public.query_performance_baseline AS
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    round((blks_hit::float/(blks_hit + blks_read + 1) * 100)::numeric, 2) as cache_hit_ratio,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted,
    temp_files,
    temp_bytes,
    deadlocks,
    blk_read_time,
    blk_write_time
FROM pg_stat_database 
WHERE datname = current_database();

-- Performance optimization settings recommendations (to be applied via environment)
-- These should be set in postgresql.conf or via ALTER SYSTEM
COMMENT ON VIEW public.performance_metrics IS 
'Performance baseline view. Recommended settings:
shared_buffers = 256MB (25% of RAM for small systems)
effective_cache_size = 1GB (75% of available RAM)
work_mem = 4MB (for complex queries)
maintenance_work_mem = 64MB (for VACUUM, CREATE INDEX)
checkpoint_timeout = 10min
max_wal_size = 1GB
random_page_cost = 1.1 (for SSD storage)';

-- Additional indexes for subscription and payment queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_stripe_status 
ON public.subscriptions(stripe_subscription_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_period_end 
ON public.subscriptions(current_period_end) WHERE status = 'active';

-- Vacuum and analyze statistics for optimization
VACUUM ANALYZE public.user_profiles;
VACUUM ANALYZE public.questions;
VACUUM ANALYZE public.game_sessions;
VACUUM ANALYZE public.question_attempts;
VACUUM ANALYZE public.user_analytics;
VACUUM ANALYZE public.subscriptions;
VACUUM ANALYZE public.audit_logs;

COMMENT ON MIGRATION IS 'MELLOWISE-003 Performance Optimization Migration - Implements enhanced indexing, FERPA audit logging, and performance monitoring baseline';