-- FERPA-Compliant Data Encryption System
-- Version: 1.0
-- Created: 2025-01-10
-- Author: Dev Agent James
-- Context7 Research: Fides privacy engineering patterns

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TENANT-SPECIFIC ENCRYPTION KEY MANAGEMENT
-- ============================================================================

-- Encryption key management table (tenant-specific keys)
CREATE TABLE public.tenant_encryption_keys (
    tenant_id UUID NOT NULL PRIMARY KEY,
    
    -- Key management
    key_id VARCHAR(255) NOT NULL, -- AWS KMS key ID or similar
    key_version INTEGER DEFAULT 1,
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    
    -- Key rotation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_rotated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    next_rotation TIMESTAMP WITH TIME ZONE,
    rotation_frequency_days INTEGER DEFAULT 90,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'rotating', 'deprecated')),
    
    -- Metadata (encrypted key never stored in database)
    key_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- FERPA compliance tracking
    ferpa_compliance_level VARCHAR(20) DEFAULT 'standard' CHECK (ferpa_compliance_level IN ('standard', 'enhanced', 'maximum')),
    data_retention_days INTEGER DEFAULT 2555, -- 7 years FERPA requirement
    
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- ============================================================================
-- ENHANCED USER PROFILES WITH PII ENCRYPTION
-- ============================================================================

-- Enhanced user profiles with encrypted PII fields (Context7 Fides patterns)
CREATE TABLE public.user_profiles_encrypted (
    tenant_id UUID NOT NULL,
    id UUID NOT NULL,
    PRIMARY KEY (tenant_id, id),
    
    -- Basic identification (encrypted)
    email_encrypted TEXT, -- Encrypted PII
    email_hash VARCHAR(64), -- SHA-256 hash for lookups (non-reversible)
    full_name_encrypted TEXT, -- Encrypted PII
    full_name_hash VARCHAR(64), -- SHA-256 hash for search
    
    -- Non-PII fields (can remain unencrypted)
    target_test_date DATE,
    current_scores JSONB DEFAULT '{}'::jsonb, -- Multiple exam scores
    target_scores JSONB DEFAULT '{}'::jsonb, -- Multiple target scores
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'early_adopter')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Preferences (encrypted if contains PII)
    preferences_encrypted TEXT, -- Encrypted JSONB as text
    preferences_hash VARCHAR(64),
    
    -- FERPA compliance fields
    ferpa_consent_given BOOLEAN DEFAULT false,
    ferpa_consent_date TIMESTAMP WITH TIME ZONE,
    ferpa_consent_version VARCHAR(20) DEFAULT '1.0',
    data_retention_expires TIMESTAMP WITH TIME ZONE,
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES public.tenant_encryption_keys(tenant_id) ON DELETE RESTRICT
);

-- ============================================================================
-- FERPA-COMPLIANT AUDIT LOGGING (ENHANCED)
-- ============================================================================

-- Enhanced audit logs with FERPA compliance tracking
CREATE TABLE public.audit_logs_ferpa (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Context
    user_id UUID,
    actor_id UUID, -- Who performed the action (may differ from user_id)
    actor_role VARCHAR(50),
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    
    -- Data changes (Context7 Fides masking patterns)
    old_values_masked JSONB, -- Masked/redacted old values
    new_values_masked JSONB, -- Masked/redacted new values
    pii_fields_affected TEXT[], -- Array of PII field names that were accessed/modified
    
    -- Request context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    request_id UUID, -- For correlating related actions
    session_id VARCHAR(255),
    
    -- FERPA compliance fields
    ferpa_purpose VARCHAR(100), -- 'educational_record', 'directory_information', etc.
    ferpa_justification TEXT, -- Legal basis for access
    data_sensitivity_level VARCHAR(20) DEFAULT 'standard', -- 'low', 'standard', 'high', 'critical'
    
    -- Retention and cleanup
    retention_expires TIMESTAMP WITH TIME ZONE,
    auto_purge_eligible BOOLEAN DEFAULT true,
    
    -- Foreign keys
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE SET NULL
);

-- ============================================================================
-- FERPA CONSENT MANAGEMENT
-- ============================================================================

-- User consent tracking for FERPA compliance
CREATE TABLE public.ferpa_consent_records (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- User context
    user_id UUID NOT NULL,
    
    -- Consent details
    consent_type VARCHAR(50) NOT NULL, -- 'educational_records', 'directory_info', 'research'
    consent_status VARCHAR(20) NOT NULL CHECK (consent_status IN ('granted', 'denied', 'withdrawn', 'expired')),
    consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    
    -- Timestamps
    granted_at TIMESTAMP WITH TIME ZONE,
    denied_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Context
    consent_method VARCHAR(50), -- 'web_form', 'email', 'paper', 'verbal'
    ip_address INET,
    user_agent TEXT,
    
    -- Parent/guardian consent (for minors)
    parent_guardian_name_encrypted TEXT,
    parent_guardian_email_encrypted TEXT,
    minor_age INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE
);

-- ============================================================================
-- DATA SUBJECT RIGHTS (FERPA + CCPA/GDPR)
-- ============================================================================

-- Data subject requests (Context7 Fides patterns)
CREATE TABLE public.data_subject_requests (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Request details
    user_id UUID,
    request_type VARCHAR(50) NOT NULL, -- 'access', 'deletion', 'correction', 'portability'
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'completed', 'cancelled', 'failed')),
    
    -- Identity verification
    identity_verified BOOLEAN DEFAULT false,
    identity_verification_method VARCHAR(50),
    identity_verified_at TIMESTAMP WITH TIME ZONE,
    identity_verified_by UUID,
    
    -- Request processing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE, -- 45 days for FERPA, 30 for CCPA
    
    -- Request details
    requested_data_types TEXT[], -- 'profile', 'sessions', 'analytics', etc.
    processing_notes TEXT,
    fulfillment_method VARCHAR(50), -- 'download_link', 'email', 'postal_mail'
    
    -- Contact information (for non-users)
    contact_email_encrypted TEXT,
    contact_name_encrypted TEXT,
    
    -- Metadata
    request_source VARCHAR(50) DEFAULT 'privacy_center', -- 'privacy_center', 'email', 'phone', 'mail'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign keys
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE SET NULL
);

-- ============================================================================
-- DATA RETENTION AND CLEANUP AUTOMATION
-- ============================================================================

-- Automated data cleanup schedules
CREATE TABLE public.data_retention_schedules (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Schedule details
    table_name VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    cleanup_frequency VARCHAR(20) DEFAULT 'daily' CHECK (cleanup_frequency IN ('daily', 'weekly', 'monthly')),
    
    -- Conditions for cleanup
    cleanup_conditions JSONB DEFAULT '{}'::jsonb,
    -- Example: {"status": "completed", "older_than_field": "created_at"}
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    last_cleanup_run TIMESTAMP WITH TIME ZONE,
    next_cleanup_run TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    records_cleaned_last_run INTEGER DEFAULT 0,
    total_records_cleaned INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign keys
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE(tenant_id, table_name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Encryption keys
CREATE INDEX idx_tenant_encryption_keys_status ON public.tenant_encryption_keys(tenant_id, status);
CREATE INDEX idx_tenant_encryption_keys_rotation ON public.tenant_encryption_keys(next_rotation) WHERE status = 'active';

-- Encrypted user profiles
CREATE INDEX idx_user_profiles_encrypted_email_hash ON public.user_profiles_encrypted(tenant_id, email_hash);
CREATE INDEX idx_user_profiles_encrypted_name_hash ON public.user_profiles_encrypted(tenant_id, full_name_hash);
CREATE INDEX idx_user_profiles_encrypted_retention ON public.user_profiles_encrypted(tenant_id, data_retention_expires);

-- FERPA audit logs
CREATE INDEX idx_audit_logs_ferpa_user_action ON public.audit_logs_ferpa(tenant_id, user_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_ferpa_table_record ON public.audit_logs_ferpa(tenant_id, table_name, record_id);
CREATE INDEX idx_audit_logs_ferpa_retention ON public.audit_logs_ferpa(tenant_id, retention_expires) WHERE auto_purge_eligible = true;
CREATE INDEX idx_audit_logs_ferpa_pii ON public.audit_logs_ferpa USING GIN(pii_fields_affected);

-- Consent records
CREATE INDEX idx_ferpa_consent_user_type ON public.ferpa_consent_records(tenant_id, user_id, consent_type);
CREATE INDEX idx_ferpa_consent_status ON public.ferpa_consent_records(tenant_id, consent_status);
CREATE INDEX idx_ferpa_consent_expires ON public.ferpa_consent_records(tenant_id, expires_at) WHERE consent_status = 'granted';

-- Data subject requests
CREATE INDEX idx_data_subject_requests_user ON public.data_subject_requests(tenant_id, user_id);
CREATE INDEX idx_data_subject_requests_status ON public.data_subject_requests(tenant_id, status);
CREATE INDEX idx_data_subject_requests_deadline ON public.data_subject_requests(tenant_id, deadline) WHERE status IN ('submitted', 'processing');

-- Data retention schedules
CREATE INDEX idx_data_retention_schedules_next_run ON public.data_retention_schedules(tenant_id, next_cleanup_run) WHERE is_active = true;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles_encrypted
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ferpa_consent_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.data_retention_schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- FERPA COMPLIANCE FUNCTIONS
-- ============================================================================

-- Function to automatically set data retention expiration
CREATE OR REPLACE FUNCTION public.set_ferpa_retention_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Set retention date to 7 years from now (FERPA requirement)
    NEW.data_retention_expires := NOW() + INTERVAL '7 years';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply retention trigger to encrypted user profiles
CREATE TRIGGER set_ferpa_retention_date BEFORE INSERT ON public.user_profiles_encrypted
    FOR EACH ROW EXECUTE FUNCTION public.set_ferpa_retention_date();

-- Function to check FERPA consent before PII access
CREATE OR REPLACE FUNCTION public.check_ferpa_consent(
    p_tenant_id UUID,
    p_user_id UUID,
    p_consent_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    consent_valid BOOLEAN := false;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.ferpa_consent_records
        WHERE tenant_id = p_tenant_id
          AND user_id = p_user_id
          AND consent_type = p_consent_type
          AND consent_status = 'granted'
          AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO consent_valid;
    
    RETURN consent_valid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE FERPA COMPLIANCE DATA
-- ============================================================================

-- Default data retention schedules for FERPA compliance
-- (Will be inserted by application with proper tenant context)

COMMENT ON TABLE public.tenant_encryption_keys IS 'Tenant-specific encryption key management for PII protection';
COMMENT ON TABLE public.user_profiles_encrypted IS 'User profiles with encrypted PII fields and FERPA consent tracking';
COMMENT ON TABLE public.audit_logs_ferpa IS 'Enhanced audit logging with FERPA compliance and PII masking';
COMMENT ON TABLE public.ferpa_consent_records IS 'User consent tracking for FERPA educational data processing';
COMMENT ON TABLE public.data_subject_requests IS 'Data subject rights requests (FERPA access/deletion)';
COMMENT ON TABLE public.data_retention_schedules IS 'Automated data cleanup schedules for FERPA 7-year retention';

-- Create indexes for efficient PII field lookups
CREATE INDEX idx_audit_logs_ferpa_pii_access ON public.audit_logs_ferpa(tenant_id, created_at DESC) 
    WHERE array_length(pii_fields_affected, 1) > 0;