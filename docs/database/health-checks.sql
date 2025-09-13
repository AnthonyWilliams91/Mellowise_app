-- Mellowise Database Health Check Functions
-- Purpose: Provide comprehensive database health monitoring for Supabase PostgreSQL
-- Usage: Called by API health endpoints and monitoring systems

-- Main health check function
CREATE OR REPLACE FUNCTION public.database_health_check()
RETURNS JSON AS $$
DECLARE
    health_result JSON;
    connection_count INTEGER;
    avg_response_time NUMERIC;
    disk_usage NUMERIC;
    table_sizes JSON;
BEGIN
    -- Get active connection count
    SELECT count(*) INTO connection_count 
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    -- Calculate average query response time (last 1 hour)
    SELECT COALESCE(avg(mean_exec_time), 0) INTO avg_response_time
    FROM pg_stat_statements 
    WHERE calls > 0 
    AND last_call > (now() - interval '1 hour');
    
    -- Get table size information for core tables
    SELECT json_object_agg(table_name, table_size) INTO table_sizes
    FROM (
        SELECT 
            schemaname||'.'||tablename AS table_name,
            pg_total_relation_size(schemaname||'.'||tablename) / 1024 / 1024 AS table_size
        FROM pg_tables 
        WHERE schemaname IN ('public', 'auth')
        AND tablename IN ('user_profiles', 'question_bank', 'user_sessions', 'progress_analytics')
    ) t;
    
    -- Build health result JSON
    health_result := json_build_object(
        'status', 'healthy',
        'timestamp', now(),
        'database_name', current_database(),
        'version', version(),
        'metrics', json_build_object(
            'active_connections', connection_count,
            'avg_response_time_ms', ROUND(avg_response_time, 2),
            'table_sizes_mb', COALESCE(table_sizes, '{}'),
            'uptime_seconds', EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))
        ),
        'checks', json_build_object(
            'connections_healthy', connection_count < 100,
            'response_time_healthy', avg_response_time < 100,
            'core_tables_exist', public.check_core_tables_exist()
        )
    );
    
    RETURN health_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'timestamp', now(),
            'error_message', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if core tables exist and are accessible
CREATE OR REPLACE FUNCTION public.check_core_tables_exist()
RETURNS BOOLEAN AS $$
DECLARE
    table_count INTEGER;
BEGIN
    -- Count core tables that should exist
    SELECT count(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('user_profiles', 'question_bank', 'user_sessions', 'progress_analytics');
    
    -- Return true if all core tables exist
    RETURN table_count >= 4;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check database connectivity and basic operations
CREATE OR REPLACE FUNCTION public.connection_health_check()
RETURNS JSON AS $$
DECLARE
    result JSON;
    test_write_success BOOLEAN := false;
    test_read_success BOOLEAN := false;
BEGIN
    -- Test basic write operation
    BEGIN
        INSERT INTO public.health_check_log (check_time, status) 
        VALUES (now(), 'test') 
        ON CONFLICT (check_time) DO NOTHING;
        test_write_success := true;
    EXCEPTION
        WHEN OTHERS THEN
            test_write_success := false;
    END;
    
    -- Test basic read operation
    BEGIN
        PERFORM count(*) FROM public.health_check_log LIMIT 1;
        test_read_success := true;
    EXCEPTION
        WHEN OTHERS THEN
            test_read_success := false;
    END;
    
    result := json_build_object(
        'read_test', test_read_success,
        'write_test', test_write_success,
        'overall_health', test_read_success AND test_write_success,
        'timestamp', now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance monitoring for specific queries
CREATE OR REPLACE FUNCTION public.query_performance_check()
RETURNS JSON AS $$
DECLARE
    slow_queries JSON;
    performance_stats JSON;
BEGIN
    -- Get slow queries (> 100ms average)
    SELECT json_agg(
        json_build_object(
            'query', left(query, 100) || '...',
            'avg_time_ms', round(mean_exec_time, 2),
            'calls', calls,
            'total_time_ms', round(total_exec_time, 2)
        )
    ) INTO slow_queries
    FROM pg_stat_statements
    WHERE mean_exec_time > 100
    AND calls > 10
    ORDER BY mean_exec_time DESC
    LIMIT 10;
    
    -- Get overall performance statistics
    SELECT json_build_object(
        'total_queries', sum(calls),
        'avg_query_time_ms', round(avg(mean_exec_time), 2),
        'total_query_time_ms', round(sum(total_exec_time), 2)
    ) INTO performance_stats
    FROM pg_stat_statements
    WHERE last_call > (now() - interval '1 hour');
    
    RETURN json_build_object(
        'slow_queries', COALESCE(slow_queries, '[]'),
        'performance_stats', COALESCE(performance_stats, '{}'),
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create health check log table (if not exists)
CREATE TABLE IF NOT EXISTS public.health_check_log (
    check_time TIMESTAMP WITH TIME ZONE PRIMARY KEY DEFAULT now(),
    status TEXT NOT NULL,
    details JSON
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_health_check_log_time 
ON public.health_check_log(check_time DESC);

-- Enable RLS (but allow public access for health checks)
ALTER TABLE public.health_check_log ENABLE ROW LEVEL SECURITY;

-- Policy to allow health check operations
CREATE POLICY IF NOT EXISTS "Allow health check operations" 
ON public.health_check_log
FOR ALL
USING (true)
WITH CHECK (true);

-- User-specific health check for authentication integration
CREATE OR REPLACE FUNCTION public.user_session_health_check(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    user_data JSON;
    session_count INTEGER;
    last_session TIMESTAMP;
BEGIN
    -- Check if user exists and get basic info
    SELECT json_build_object(
        'user_exists', (up.id IS NOT NULL),
        'profile_complete', (up.name IS NOT NULL),
        'created_at', up.created_at
    ) INTO user_data
    FROM public.user_profiles up
    WHERE up.user_id = user_uuid;
    
    -- Get user session statistics
    SELECT 
        count(*),
        max(created_at)
    INTO session_count, last_session
    FROM public.user_sessions us
    WHERE us.user_id = user_uuid;
    
    RETURN json_build_object(
        'user_health', COALESCE(user_data, json_build_object('user_exists', false)),
        'session_stats', json_build_object(
            'total_sessions', COALESCE(session_count, 0),
            'last_session', last_session
        ),
        'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old health check logs (run daily)
CREATE OR REPLACE FUNCTION public.cleanup_health_check_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.health_check_log
    WHERE check_time < (now() - interval '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO public.health_check_log (status, details)
    VALUES ('cleanup_completed', json_build_object('deleted_records', deleted_count));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for health check functions
GRANT EXECUTE ON FUNCTION public.database_health_check() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_core_tables_exist() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.connection_health_check() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.query_performance_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_session_health_check(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_health_check_logs() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.database_health_check() IS 'Comprehensive database health check returning connection, performance, and table status';
COMMENT ON FUNCTION public.check_core_tables_exist() IS 'Validates that all required core tables exist and are accessible';
COMMENT ON FUNCTION public.connection_health_check() IS 'Tests basic read/write operations to verify database connectivity';
COMMENT ON FUNCTION public.query_performance_check() IS 'Returns slow query analysis and performance statistics';
COMMENT ON FUNCTION public.user_session_health_check(UUID) IS 'User-specific health check for authentication and session data';
COMMENT ON FUNCTION public.cleanup_health_check_logs() IS 'Maintenance function to remove old health check log entries';