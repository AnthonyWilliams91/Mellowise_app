-- Mellowise Multi-Tenant Architecture Foundation
-- Version: 2.0
-- Created: 2025-01-10
-- Author: Dev Agent James
-- Based on: Context7 Nile database multi-tenant patterns

-- ============================================================================
-- MULTI-TENANT FOUNDATION MIGRATION
-- Transforms single-tenant LSAT platform into multi-tenant universal platform
-- ============================================================================

-- Create tenants table (core of multi-tenant architecture)
CREATE TABLE public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- For subdomain/URL routing
    plan_type TEXT DEFAULT 'institution' CHECK (plan_type IN ('institution', 'enterprise', 'demo')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    max_users INTEGER DEFAULT 1000,
    max_storage_gb INTEGER DEFAULT 100,
    features JSONB DEFAULT '{}'::jsonb, -- Tenant-specific feature flags
    settings JSONB DEFAULT '{}'::jsonb, -- Tenant configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- FERPA compliance fields
    ferpa_compliant BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 2555, -- 7 years
    encryption_key_id UUID, -- For tenant-specific encryption
    
    -- Billing and subscription
    stripe_customer_id TEXT,
    billing_email VARCHAR(255),
    subscription_status TEXT DEFAULT 'active',
    
    -- Contact information
    admin_name VARCHAR(255),
    admin_email VARCHAR(255),
    phone VARCHAR(50),
    institution_type VARCHAR(100), -- university, high_school, prep_company, etc.
    
    UNIQUE(slug)
);

-- Create tenant_users table (extends auth.users with tenant association)
CREATE TABLE public.tenant_users (
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student', 'viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited')),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_login TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    PRIMARY KEY (tenant_id, user_id)
);

-- ============================================================================
-- TRANSFORM EXISTING TABLES TO MULTI-TENANT
-- Add tenant_id and composite primary keys following Nile patterns
-- ============================================================================

-- Step 1: Add tenant_id to existing tables and update constraints
-- This follows the Context7 Nile pattern: PRIMARY KEY (tenant_id, id)

-- Backup existing user_profiles data
CREATE TABLE user_profiles_backup AS SELECT * FROM public.user_profiles;

-- Drop existing constraints on user_profiles
ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_pkey;
DROP INDEX IF EXISTS idx_user_profiles_email;

-- Add tenant_id to user_profiles and recreate as multi-tenant
ALTER TABLE public.user_profiles 
ADD COLUMN tenant_id UUID;

-- Update existing user profiles to belong to default tenant (migration safety)
-- Create default tenant for migration
INSERT INTO public.tenants (id, name, slug, plan_type, admin_name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Institution', 'default', 'demo', 'System Admin');

-- Assign existing users to default tenant
UPDATE public.user_profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Add constraints and indexes for multi-tenant user_profiles
ALTER TABLE public.user_profiles 
ALTER COLUMN tenant_id SET NOT NULL,
ADD CONSTRAINT FK_user_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT PK_user_profiles PRIMARY KEY (tenant_id, id);

-- Recreate indexes for multi-tenant user_profiles
CREATE INDEX idx_user_profiles_tenant_email ON public.user_profiles(tenant_id, email);
CREATE INDEX idx_user_profiles_tenant_subscription ON public.user_profiles(tenant_id, subscription_tier);

-- Transform questions table to multi-tenant
ALTER TABLE public.questions DROP CONSTRAINT questions_pkey;
ALTER TABLE public.questions ADD COLUMN tenant_id UUID;

-- Assign existing questions to default tenant (shared content initially)
UPDATE public.questions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

ALTER TABLE public.questions 
ALTER COLUMN tenant_id SET NOT NULL,
ADD CONSTRAINT FK_questions_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT PK_questions PRIMARY KEY (tenant_id, id);

-- Update questions indexes for multi-tenant
DROP INDEX IF EXISTS idx_questions_type_difficulty;
DROP INDEX IF EXISTS idx_questions_active;
CREATE INDEX idx_questions_tenant_type_difficulty ON public.questions(tenant_id, question_type, difficulty);
CREATE INDEX idx_questions_tenant_active ON public.questions(tenant_id, is_active) WHERE is_active = true;

-- Transform game_sessions table to multi-tenant
ALTER TABLE public.game_sessions DROP CONSTRAINT game_sessions_pkey;
ALTER TABLE public.game_sessions ADD COLUMN tenant_id UUID;

-- Update existing sessions to belong to default tenant
UPDATE public.game_sessions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

ALTER TABLE public.game_sessions 
ALTER COLUMN tenant_id SET NOT NULL,
ADD CONSTRAINT FK_game_sessions_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT PK_game_sessions PRIMARY KEY (tenant_id, id);

-- Update foreign key to user_profiles (now composite)
ALTER TABLE public.game_sessions DROP CONSTRAINT game_sessions_user_id_fkey;
ALTER TABLE public.game_sessions 
ADD CONSTRAINT FK_game_sessions_user FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE;

-- Update game_sessions indexes
DROP INDEX IF EXISTS idx_game_sessions_user_started;
CREATE INDEX idx_game_sessions_tenant_user_started ON public.game_sessions(tenant_id, user_id, started_at DESC);
CREATE INDEX idx_game_sessions_tenant_type ON public.game_sessions(tenant_id, session_type, started_at DESC);

-- Transform question_attempts table to multi-tenant
ALTER TABLE public.question_attempts DROP CONSTRAINT question_attempts_pkey;
ALTER TABLE public.question_attempts ADD COLUMN tenant_id UUID;

-- Update existing attempts to default tenant
UPDATE public.question_attempts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

ALTER TABLE public.question_attempts 
ALTER COLUMN tenant_id SET NOT NULL,
ADD CONSTRAINT FK_question_attempts_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT PK_question_attempts PRIMARY KEY (tenant_id, id);

-- Update foreign keys to composite references
ALTER TABLE public.question_attempts DROP CONSTRAINT question_attempts_user_id_fkey;
ALTER TABLE public.question_attempts DROP CONSTRAINT question_attempts_question_id_fkey;
ALTER TABLE public.question_attempts 
ADD CONSTRAINT FK_question_attempts_user FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE,
ADD CONSTRAINT FK_question_attempts_question FOREIGN KEY (tenant_id, question_id) REFERENCES public.questions(tenant_id, id) ON DELETE CASCADE;

-- Update question_attempts indexes
DROP INDEX IF EXISTS idx_question_attempts_user_question;
DROP INDEX IF EXISTS idx_question_attempts_session;
CREATE INDEX idx_question_attempts_tenant_user_question ON public.question_attempts(tenant_id, user_id, question_id);
CREATE INDEX idx_question_attempts_tenant_session ON public.question_attempts(tenant_id, session_id);
CREATE INDEX idx_question_attempts_tenant_correct_time ON public.question_attempts(tenant_id, is_correct, attempted_at DESC);

-- Transform user_analytics table to multi-tenant  
ALTER TABLE public.user_analytics DROP CONSTRAINT user_analytics_pkey;
ALTER TABLE public.user_analytics ADD COLUMN tenant_id UUID;

UPDATE public.user_analytics SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

ALTER TABLE public.user_analytics 
ALTER COLUMN tenant_id SET NOT NULL,
ADD CONSTRAINT FK_user_analytics_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT PK_user_analytics PRIMARY KEY (tenant_id, id);

-- Update foreign key and indexes
ALTER TABLE public.user_analytics DROP CONSTRAINT user_analytics_user_id_fkey;
ALTER TABLE public.user_analytics 
ADD CONSTRAINT FK_user_analytics_user FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE;

DROP INDEX IF EXISTS idx_user_analytics_user_date;
CREATE INDEX idx_user_analytics_tenant_user_date ON public.user_analytics(tenant_id, user_id, date_recorded DESC);
CREATE INDEX idx_user_analytics_tenant_type_date ON public.user_analytics(tenant_id, metric_type, date_recorded DESC);

-- Transform subscriptions table to multi-tenant
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_pkey;
ALTER TABLE public.subscriptions ADD COLUMN tenant_id UUID;

UPDATE public.subscriptions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

ALTER TABLE public.subscriptions 
ALTER COLUMN tenant_id SET NOT NULL,
ADD CONSTRAINT FK_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT PK_subscriptions PRIMARY KEY (tenant_id, id);

-- Update foreign key and indexes
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
ALTER TABLE public.subscriptions 
ADD CONSTRAINT FK_subscriptions_user FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE;

DROP INDEX IF EXISTS idx_subscriptions_user_status;
DROP INDEX IF EXISTS idx_subscriptions_stripe_status;
CREATE INDEX idx_subscriptions_tenant_user_status ON public.subscriptions(tenant_id, user_id, status);
CREATE INDEX idx_subscriptions_tenant_stripe_status ON public.subscriptions(tenant_id, stripe_subscription_id, status) WHERE status = 'active';

-- Transform audit_logs table to multi-tenant
ALTER TABLE public.audit_logs ADD COLUMN tenant_id UUID;

UPDATE public.audit_logs SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Update audit_logs indexes
DROP INDEX IF EXISTS idx_audit_logs_user_action;
CREATE INDEX idx_audit_logs_tenant_user_action ON public.audit_logs(tenant_id, user_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_tenant_table_action ON public.audit_logs(tenant_id, table_name, action, created_at DESC);

-- ============================================================================
-- TENANT CONTEXT FUNCTIONS (Nile-pattern implementation)
-- Enable tenant isolation via session context
-- ============================================================================

-- Function to set tenant context (Nile pattern: SET nile.tenant_id)
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Set tenant context for session isolation
    EXECUTE format('SET mellowise.tenant_id = %L', tenant_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get current tenant context
CREATE OR REPLACE FUNCTION public.get_tenant_context()
RETURNS UUID AS $$
DECLARE
    tenant_uuid TEXT;
BEGIN
    -- Get current tenant from session context
    SELECT current_setting('mellowise.tenant_id', true) INTO tenant_uuid;
    
    IF tenant_uuid IS NULL OR tenant_uuid = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN tenant_uuid::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to clear tenant context
CREATE OR REPLACE FUNCTION public.clear_tenant_context()
RETURNS void AS $$
BEGIN
    EXECUTE 'RESET mellowise.tenant_id';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR TENANT ISOLATION
-- Ensure zero cross-tenant data leakage
-- ============================================================================

-- Enable RLS on multi-tenant tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Tenant policies (admin access)
CREATE POLICY "tenants_isolation" ON public.tenants
    FOR ALL
    USING (
        -- System admin or tenant admin access
        id = get_tenant_context() OR
        auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = id AND role = 'admin'
        )
    );

-- Tenant users policies
CREATE POLICY "tenant_users_isolation" ON public.tenant_users
    FOR ALL
    USING (tenant_id = get_tenant_context());

-- Update existing RLS policies for multi-tenant isolation
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "user_profiles_tenant_isolation" ON public.user_profiles
    FOR ALL
    USING (
        tenant_id = get_tenant_context() AND
        (id = auth.uid() OR 
         auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = user_profiles.tenant_id 
            AND role IN ('admin', 'instructor')
         ))
    );

-- Game sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.game_sessions;
CREATE POLICY "game_sessions_tenant_isolation" ON public.game_sessions
    FOR ALL
    USING (
        tenant_id = get_tenant_context() AND
        (user_id = auth.uid() OR 
         auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = game_sessions.tenant_id 
            AND role IN ('admin', 'instructor')
         ))
    );

-- Question attempts policies
DROP POLICY IF EXISTS "Users can view own attempts" ON public.question_attempts;
CREATE POLICY "question_attempts_tenant_isolation" ON public.question_attempts
    FOR ALL
    USING (
        tenant_id = get_tenant_context() AND
        (user_id = auth.uid() OR 
         auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = question_attempts.tenant_id 
            AND role IN ('admin', 'instructor')
         ))
    );

-- User analytics policies
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
CREATE POLICY "user_analytics_tenant_isolation" ON public.user_analytics
    FOR ALL
    USING (
        tenant_id = get_tenant_context() AND
        (user_id = auth.uid() OR 
         auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = user_analytics.tenant_id 
            AND role IN ('admin', 'instructor')
         ))
    );

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "subscriptions_tenant_isolation" ON public.subscriptions
    FOR ALL
    USING (
        tenant_id = get_tenant_context() AND
        (user_id = auth.uid() OR 
         auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = subscriptions.tenant_id 
            AND role = 'admin'
         ))
    );

-- Questions policies (read access for tenant members, admin write access)
CREATE POLICY "questions_tenant_read" ON public.questions
    FOR SELECT
    USING (
        tenant_id = get_tenant_context()
    );

CREATE POLICY "questions_tenant_write" ON public.questions
    FOR INSERT, UPDATE, DELETE
    USING (
        tenant_id = get_tenant_context() AND
        auth.uid() IN (
            SELECT user_id FROM public.tenant_users 
            WHERE tenant_id = questions.tenant_id 
            AND role IN ('admin', 'instructor')
        )
    );

-- ============================================================================
-- TENANT MANAGEMENT FUNCTIONS
-- Admin functions for tenant creation and management
-- ============================================================================

-- Function to create new tenant with admin user
CREATE OR REPLACE FUNCTION public.create_tenant(
    tenant_name TEXT,
    tenant_slug TEXT,
    admin_user_id UUID,
    admin_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_tenant_id UUID;
BEGIN
    -- Create tenant
    INSERT INTO public.tenants (name, slug, admin_email, created_at)
    VALUES (tenant_name, tenant_slug, COALESCE(admin_email, ''), NOW())
    RETURNING id INTO new_tenant_id;
    
    -- Create admin user association
    INSERT INTO public.tenant_users (tenant_id, user_id, role, joined_at)
    VALUES (new_tenant_id, admin_user_id, 'admin', NOW());
    
    -- Create user profile for admin in new tenant
    INSERT INTO public.user_profiles (tenant_id, id, email, subscription_tier)
    SELECT new_tenant_id, admin_user_id, 
           COALESCE(admin_email, auth.email), 'premium'
    FROM auth.users 
    WHERE id = admin_user_id;
    
    RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add user to tenant
CREATE OR REPLACE FUNCTION public.add_user_to_tenant(
    tenant_uuid UUID,
    user_uuid UUID,
    user_role TEXT DEFAULT 'student'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get user email from auth
    SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
    
    -- Add user to tenant
    INSERT INTO public.tenant_users (tenant_id, user_id, role, joined_at)
    VALUES (tenant_uuid, user_uuid, user_role, NOW())
    ON CONFLICT (tenant_id, user_id) 
    DO UPDATE SET role = user_role, status = 'active';
    
    -- Create user profile if doesn't exist
    INSERT INTO public.user_profiles (tenant_id, id, email)
    VALUES (tenant_uuid, user_uuid, user_email)
    ON CONFLICT (tenant_id, id) DO NOTHING;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Updated audit trigger for multi-tenant
DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
DROP TRIGGER IF EXISTS audit_question_attempts ON public.question_attempts;
DROP TRIGGER IF EXISTS audit_user_analytics ON public.user_analytics;

CREATE OR REPLACE FUNCTION public.audit_trigger_function_mt()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        tenant_id,
        user_id, 
        action, 
        table_name, 
        record_id, 
        old_values, 
        new_values,
        ip_address
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        COALESCE(NEW.id, OLD.id, NEW.user_id, OLD.user_id),
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

-- Recreate audit triggers for multi-tenant
CREATE TRIGGER audit_user_profiles_mt 
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function_mt();

CREATE TRIGGER audit_question_attempts_mt 
    AFTER INSERT OR UPDATE OR DELETE ON public.question_attempts
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function_mt();

CREATE TRIGGER audit_user_analytics_mt 
    AFTER INSERT OR UPDATE OR DELETE ON public.user_analytics
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function_mt();

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS FOR MULTI-TENANT
-- Updated views to include tenant context
-- ============================================================================

-- Update performance metrics view for multi-tenant
DROP VIEW IF EXISTS public.performance_metrics;
CREATE VIEW public.performance_metrics AS
SELECT 
    t.name as tenant_name,
    t.slug as tenant_slug,
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stats, public.tenants t
WHERE schemaname = 'public'
  AND (get_tenant_context() IS NULL OR t.id = get_tenant_context())
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Tenant usage statistics
CREATE VIEW public.tenant_usage_stats AS
SELECT 
    t.id,
    t.name,
    t.slug,
    t.status,
    t.plan_type,
    COUNT(tu.user_id) as user_count,
    COUNT(CASE WHEN gs.started_at >= NOW() - INTERVAL '30 days' THEN 1 END) as sessions_last_30d,
    COUNT(CASE WHEN qa.attempted_at >= NOW() - INTERVAL '30 days' THEN 1 END) as questions_last_30d,
    t.last_active,
    t.created_at
FROM public.tenants t
LEFT JOIN public.tenant_users tu ON t.id = tu.tenant_id AND tu.status = 'active'
LEFT JOIN public.game_sessions gs ON t.id = gs.tenant_id
LEFT JOIN public.question_attempts qa ON t.id = qa.tenant_id
WHERE get_tenant_context() IS NULL OR t.id = get_tenant_context()
GROUP BY t.id, t.name, t.slug, t.status, t.plan_type, t.last_active, t.created_at
ORDER BY user_count DESC;

-- Vacuum and analyze new tables
VACUUM ANALYZE public.tenants;
VACUUM ANALYZE public.tenant_users;

COMMENT ON MIGRATION IS 'Multi-Tenant Architecture Foundation - Transforms single-tenant LSAT platform into scalable multi-tenant universal exam platform using Context7-verified Nile patterns';