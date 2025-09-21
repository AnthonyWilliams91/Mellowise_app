-- ============================================================================
-- MELLOWISE-017: Full LSAT Question Library Implementation
-- Database Schema Enhancement for Comprehensive Question Management
-- ============================================================================
-- Version: 1.0
-- Created: 2025-09-18
-- Author: Dev Agent Marcus (BMad Team)
-- Epic: Epic 3.1 - Comprehensive LSAT Question System
-- Dependencies: migration 006_lsat_question_bank.sql
-- ============================================================================

-- Add UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- QUESTION VERSIONING AND AUDIT TRAIL SYSTEM
-- ============================================================================

-- Question versions table for tracking edits and history
CREATE TABLE public.question_versions (
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL, -- References questions_universal.id
    version_number INTEGER NOT NULL DEFAULT 1,

    -- Version metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    change_reason TEXT,
    change_type VARCHAR(50) DEFAULT 'edit', -- 'create', 'edit', 'quality_update', 'correction'

    -- Snapshot of question at this version
    content TEXT NOT NULL,
    question_type TEXT NOT NULL,
    subtype TEXT,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_time INTEGER,
    cognitive_level TEXT CHECK (cognitive_level IN ('recall', 'application', 'analysis', 'synthesis')),
    correct_answer TEXT NOT NULL,
    answer_choices JSONB NOT NULL,
    explanation TEXT NOT NULL,
    concept_tags TEXT[] DEFAULT '{}',
    performance_indicators TEXT[] DEFAULT '{}',
    source_attribution TEXT,

    -- Quality metrics at time of version
    quality_score DECIMAL(3,2) DEFAULT 0.0 CHECK (quality_score >= 0.0 AND quality_score <= 10.0),
    community_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (community_rating >= 0.0 AND community_rating <= 5.0),
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),

    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, question_id, version_number)
);

-- Question cross-references for related content discovery
CREATE TABLE public.question_cross_references (
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    source_question_id UUID NOT NULL,
    target_question_id UUID NOT NULL,

    -- Relationship metadata
    relationship_type VARCHAR(50) NOT NULL, -- 'similar_concept', 'prerequisite', 'follow_up', 'parallel_structure'
    strength DECIMAL(3,2) DEFAULT 1.0 CHECK (strength >= 0.0 AND strength <= 1.0),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    is_bidirectional BOOLEAN DEFAULT false,

    -- Prevent self-references and duplicates
    CHECK (source_question_id != target_question_id),
    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, source_question_id, target_question_id, relationship_type)
);

-- Question quality feedback and community ratings
CREATE TABLE public.question_feedback (
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Feedback details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(50) NOT NULL, -- 'quality', 'difficulty', 'clarity', 'error_report'
    feedback_text TEXT,
    suggested_improvement TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP,

    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, question_id, user_id, feedback_type) -- One feedback per type per user
);

-- ============================================================================
-- ENHANCED QUESTION METADATA
-- ============================================================================

-- Add comprehensive metadata columns to existing questions_universal table
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS parent_version_id UUID;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS is_latest_version BOOLEAN DEFAULT true;

-- Quality and review metadata
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 5.0 CHECK (quality_score >= 0.0 AND quality_score <= 10.0);
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS community_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (community_rating >= 0.0 AND community_rating <= 5.0);
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'approved' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision'));

-- Advanced categorization
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS subtopic TEXT;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS skill_level VARCHAR(20) CHECK (skill_level IN ('novice', 'beginner', 'intermediate', 'advanced', 'expert'));
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS bloom_taxonomy VARCHAR(20) CHECK (bloom_taxonomy IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'));

-- Source and authorship
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS license_type VARCHAR(50) DEFAULT 'proprietary';
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS copyright_notice TEXT;

-- Usage and analytics enhancement
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS first_used_at TIMESTAMP;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS success_rate DECIMAL(4,3) DEFAULT 0.0 CHECK (success_rate >= 0.0 AND success_rate <= 1.0);
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS avg_difficulty_rating DECIMAL(3,2);

-- Import and validation metadata
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS import_batch_id UUID;
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'validated' CHECK (validation_status IN ('pending', 'validated', 'failed', 'manual_review'));
ALTER TABLE public.questions_universal ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]';

-- ============================================================================
-- BULK IMPORT MANAGEMENT
-- ============================================================================

-- Import batch tracking for bulk operations
CREATE TABLE public.question_import_batches (
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT uuid_generate_v4(),

    -- Batch metadata
    batch_name VARCHAR(255) NOT NULL,
    source_file_name VARCHAR(255),
    source_file_size INTEGER,
    source_format VARCHAR(20) CHECK (source_format IN ('csv', 'json', 'xml', 'xlsx')),

    -- Import process tracking
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    validation_errors JSONB DEFAULT '[]',

    -- Import status and timing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- User tracking
    imported_by UUID NOT NULL REFERENCES auth.users(id),

    -- Configuration used for import
    import_config JSONB DEFAULT '{}',

    PRIMARY KEY (tenant_id, id)
);

-- Import error details for debugging and improvement
CREATE TABLE public.question_import_errors (
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL,

    -- Error details
    row_number INTEGER,
    error_code VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    field_name VARCHAR(100),
    field_value TEXT,
    suggested_fix TEXT,

    -- Raw data for manual review
    raw_data JSONB,

    -- Error metadata
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP,

    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id, batch_id) REFERENCES public.question_import_batches(tenant_id, id) ON DELETE CASCADE
);

-- ============================================================================
-- ADVANCED INDEXING FOR PERFORMANCE
-- ============================================================================

-- Versioning and audit trail indexes
CREATE INDEX idx_question_versions_question_latest ON public.question_versions(tenant_id, question_id, version_number DESC);
CREATE INDEX idx_question_versions_created_at ON public.question_versions(tenant_id, created_at DESC);
CREATE INDEX idx_question_versions_review_status ON public.question_versions(tenant_id, review_status) WHERE review_status != 'approved';

-- Cross-reference indexes for relationship discovery
CREATE INDEX idx_cross_refs_source ON public.question_cross_references(tenant_id, source_question_id, relationship_type);
CREATE INDEX idx_cross_refs_target ON public.question_cross_references(tenant_id, target_question_id, relationship_type);
CREATE INDEX idx_cross_refs_strength ON public.question_cross_references(tenant_id, strength DESC) WHERE strength > 0.7;

-- Quality and community feedback indexes
CREATE INDEX idx_question_feedback_rating ON public.question_feedback(tenant_id, question_id, rating);
CREATE INDEX idx_question_feedback_type ON public.question_feedback(tenant_id, feedback_type, created_at DESC);
CREATE INDEX idx_question_feedback_verified ON public.question_feedback(tenant_id, is_verified, verified_at DESC) WHERE is_verified = true;

-- Enhanced question search indexes
CREATE INDEX idx_questions_quality_score ON public.questions_universal(tenant_id, quality_score DESC) WHERE is_active = true;
CREATE INDEX idx_questions_community_rating ON public.questions_universal(tenant_id, community_rating DESC) WHERE is_active = true AND rating_count > 0;
CREATE INDEX idx_questions_skill_level ON public.questions_universal(tenant_id, skill_level, difficulty) WHERE is_active = true;
CREATE INDEX idx_questions_bloom_taxonomy ON public.questions_universal(tenant_id, bloom_taxonomy, cognitive_level) WHERE is_active = true;
CREATE INDEX idx_questions_concept_tags ON public.questions_universal USING GIN (tenant_id, concept_tags) WHERE is_active = true;
CREATE INDEX idx_questions_success_rate ON public.questions_universal(tenant_id, success_rate DESC, usage_count) WHERE is_active = true AND usage_count > 10;

-- Import batch tracking indexes
CREATE INDEX idx_import_batches_status ON public.question_import_batches(tenant_id, status, started_at DESC);
CREATE INDEX idx_import_batches_user ON public.question_import_batches(tenant_id, imported_by, started_at DESC);
CREATE INDEX idx_import_errors_batch ON public.question_import_errors(tenant_id, batch_id, severity);
CREATE INDEX idx_import_errors_unresolved ON public.question_import_errors(tenant_id, resolved, created_at DESC) WHERE resolved = false;

-- ============================================================================
-- ENHANCED FUNCTIONS AND PROCEDURES
-- ============================================================================

-- Function to create a new question version
CREATE OR REPLACE FUNCTION public.create_question_version(
    p_tenant_id UUID,
    p_question_id UUID,
    p_user_id UUID,
    p_change_reason TEXT,
    p_change_type TEXT DEFAULT 'edit'
)
RETURNS UUID AS $$
DECLARE
    v_version_id UUID;
    v_version_number INTEGER;
    v_question_record RECORD;
BEGIN
    -- Get current question data
    SELECT * INTO v_question_record
    FROM public.questions_universal
    WHERE tenant_id = p_tenant_id AND id = p_question_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Question not found: %', p_question_id;
    END IF;

    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.question_versions
    WHERE tenant_id = p_tenant_id AND question_id = p_question_id;

    -- Create version record
    INSERT INTO public.question_versions (
        tenant_id, question_id, version_number, created_by, change_reason, change_type,
        content, question_type, subtype, difficulty, difficulty_level, estimated_time,
        cognitive_level, correct_answer, answer_choices, explanation, concept_tags,
        performance_indicators, source_attribution, quality_score, community_rating,
        review_status
    ) VALUES (
        p_tenant_id, p_question_id, v_version_number, p_user_id, p_change_reason, p_change_type,
        v_question_record.content, v_question_record.question_type, v_question_record.subtype,
        v_question_record.difficulty, v_question_record.difficulty_level, v_question_record.estimated_time,
        v_question_record.cognitive_level, v_question_record.correct_answer, v_question_record.answer_choices,
        v_question_record.explanation, v_question_record.concept_tags, v_question_record.performance_indicators,
        v_question_record.source_attribution, v_question_record.quality_score, v_question_record.community_rating,
        v_question_record.review_status
    ) RETURNING id INTO v_version_id;

    -- Update main question table
    UPDATE public.questions_universal
    SET version_number = v_version_number,
        last_modified_by = p_user_id,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id AND id = p_question_id;

    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get question with related content
CREATE OR REPLACE FUNCTION public.get_question_with_relationships(
    p_tenant_id UUID,
    p_question_id UUID
)
RETURNS TABLE (
    question_data JSONB,
    related_questions JSONB,
    feedback_summary JSONB,
    version_history JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH question_base AS (
        SELECT to_jsonb(q.*) as question_data
        FROM public.questions_universal q
        WHERE q.tenant_id = p_tenant_id AND q.id = p_question_id AND q.is_active = true
    ),
    related_content AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'question_id', target_question_id,
                'relationship_type', relationship_type,
                'strength', strength,
                'title', q.content[1:100] || '...'
            )
        ) as related_questions
        FROM public.question_cross_references qcr
        JOIN public.questions_universal q ON qcr.target_question_id = q.id AND qcr.tenant_id = q.tenant_id
        WHERE qcr.tenant_id = p_tenant_id AND qcr.source_question_id = p_question_id
    ),
    feedback_agg AS (
        SELECT jsonb_build_object(
            'average_rating', COALESCE(AVG(rating), 0),
            'total_feedback', COUNT(*),
            'rating_distribution', jsonb_object_agg(rating::text, rating_count)
        ) as feedback_summary
        FROM (
            SELECT rating, COUNT(*) as rating_count
            FROM public.question_feedback
            WHERE tenant_id = p_tenant_id AND question_id = p_question_id
            GROUP BY rating
        ) rating_counts
    ),
    version_summary AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'version_number', version_number,
                'created_at', created_at,
                'change_type', change_type,
                'change_reason', change_reason
            ) ORDER BY version_number DESC
        ) as version_history
        FROM public.question_versions
        WHERE tenant_id = p_tenant_id AND question_id = p_question_id
        LIMIT 10
    )
    SELECT
        qb.question_data,
        COALESCE(rc.related_questions, '[]'::jsonb),
        COALESCE(fa.feedback_summary, '{}'::jsonb),
        COALESCE(vs.version_history, '[]'::jsonb)
    FROM question_base qb
    CROSS JOIN related_content rc
    CROSS JOIN feedback_agg fa
    CROSS JOIN version_summary vs;
END;
$$ LANGUAGE plpgsql;

-- Function for advanced question search with multiple filters
CREATE OR REPLACE FUNCTION public.search_questions_advanced(
    p_tenant_id UUID,
    p_exam_type_slug TEXT DEFAULT NULL,
    p_category_slug TEXT DEFAULT NULL,
    p_difficulty_min INTEGER DEFAULT 1,
    p_difficulty_max INTEGER DEFAULT 10,
    p_skill_levels TEXT[] DEFAULT NULL,
    p_concept_tags TEXT[] DEFAULT NULL,
    p_min_quality_score DECIMAL DEFAULT 0.0,
    p_min_community_rating DECIMAL DEFAULT 0.0,
    p_search_text TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 25,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    question_id UUID,
    content TEXT,
    question_type TEXT,
    difficulty INTEGER,
    quality_score DECIMAL,
    community_rating DECIMAL,
    usage_count INTEGER,
    success_rate DECIMAL,
    category_name TEXT,
    concept_tags TEXT[],
    estimated_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.id,
        q.content,
        q.question_type,
        q.difficulty,
        q.quality_score,
        q.community_rating,
        q.usage_count,
        q.success_rate,
        c.name,
        q.concept_tags,
        q.estimated_time
    FROM public.questions_universal q
    JOIN public.exam_categories c ON q.category_id = c.id AND q.tenant_id = c.tenant_id
    JOIN public.exam_types et ON c.exam_type_id = et.id AND c.tenant_id = et.tenant_id
    WHERE q.tenant_id = p_tenant_id
      AND q.is_active = true
      AND q.review_status = 'approved'
      AND (p_exam_type_slug IS NULL OR et.slug = p_exam_type_slug)
      AND (p_category_slug IS NULL OR c.slug = p_category_slug)
      AND q.difficulty >= p_difficulty_min
      AND q.difficulty <= p_difficulty_max
      AND (p_skill_levels IS NULL OR q.skill_level = ANY(p_skill_levels))
      AND (p_concept_tags IS NULL OR q.concept_tags && p_concept_tags)
      AND q.quality_score >= p_min_quality_score
      AND q.community_rating >= p_min_community_rating
      AND (p_search_text IS NULL OR q.content ILIKE '%' || p_search_text || '%')
    ORDER BY
        q.quality_score DESC,
        q.community_rating DESC,
        q.usage_count DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_import_errors ENABLE ROW LEVEL SECURITY;

-- RLS policies for multi-tenant isolation
CREATE POLICY "Tenant isolation for question_versions" ON public.question_versions
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY "Tenant isolation for question_cross_references" ON public.question_cross_references
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY "Tenant isolation for question_feedback" ON public.question_feedback
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY "Tenant isolation for question_import_batches" ON public.question_import_batches
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY "Tenant isolation for question_import_errors" ON public.question_import_errors
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- ============================================================================
-- TRIGGERS AND AUTOMATION
-- ============================================================================

-- Auto-update question statistics when feedback is added
CREATE OR REPLACE FUNCTION public.update_question_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.questions_universal
        SET
            community_rating = (
                SELECT AVG(rating)
                FROM public.question_feedback
                WHERE tenant_id = NEW.tenant_id AND question_id = NEW.question_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM public.question_feedback
                WHERE tenant_id = NEW.tenant_id AND question_id = NEW.question_id
            ),
            updated_at = NOW()
        WHERE tenant_id = NEW.tenant_id AND id = NEW.question_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.questions_universal
        SET
            community_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM public.question_feedback
                WHERE tenant_id = OLD.tenant_id AND question_id = OLD.question_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM public.question_feedback
                WHERE tenant_id = OLD.tenant_id AND question_id = OLD.question_id
            ),
            updated_at = NOW()
        WHERE tenant_id = OLD.tenant_id AND id = OLD.question_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.question_feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_question_rating_stats();

-- ============================================================================
-- DATA MIGRATION AND UPDATES
-- ============================================================================

-- Update existing questions with default enhanced metadata
UPDATE public.questions_universal
SET
    quality_score = 6.0,
    skill_level = CASE
        WHEN difficulty <= 3 THEN 'beginner'
        WHEN difficulty <= 6 THEN 'intermediate'
        ELSE 'advanced'
    END,
    bloom_taxonomy = CASE cognitive_level
        WHEN 'recall' THEN 'remember'
        WHEN 'application' THEN 'apply'
        WHEN 'analysis' THEN 'analyze'
        WHEN 'synthesis' THEN 'create'
        ELSE 'understand'
    END,
    license_type = 'sample_educational',
    validation_status = 'validated'
WHERE tenant_id IS NOT NULL AND quality_score IS NULL;

-- Create initial versions for existing questions
INSERT INTO public.question_versions (
    tenant_id, question_id, version_number, change_type, change_reason,
    content, question_type, subtype, difficulty, difficulty_level,
    estimated_time, cognitive_level, correct_answer, answer_choices,
    explanation, concept_tags, performance_indicators, source_attribution,
    quality_score, community_rating, review_status
)
SELECT
    tenant_id, id as question_id, 1 as version_number, 'create' as change_type,
    'Initial version during migration' as change_reason,
    content, question_type, subtype, difficulty, difficulty_level,
    estimated_time, cognitive_level, correct_answer, answer_choices,
    explanation, concept_tags, performance_indicators, source_attribution,
    quality_score, community_rating, 'approved' as review_status
FROM public.questions_universal
WHERE is_active = true;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.question_versions IS 'Version control system for question content with full audit trail';
COMMENT ON TABLE public.question_cross_references IS 'Relationship mapping between related questions for content discovery';
COMMENT ON TABLE public.question_feedback IS 'Community feedback and quality ratings for questions';
COMMENT ON TABLE public.question_import_batches IS 'Bulk import operation tracking and management';
COMMENT ON TABLE public.question_import_errors IS 'Detailed error logging for import troubleshooting';

COMMENT ON FUNCTION public.create_question_version IS 'Creates new version snapshot when question is modified';
COMMENT ON FUNCTION public.get_question_with_relationships IS 'Retrieves question with all related content and metadata';
COMMENT ON FUNCTION public.search_questions_advanced IS 'Advanced multi-criteria question search with performance optimization';

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'MELLOWISE-017 Database Migration Completed Successfully!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Features Added:';
    RAISE NOTICE '✅ Question versioning and audit trail system';
    RAISE NOTICE '✅ Cross-reference relationship mapping';
    RAISE NOTICE '✅ Community feedback and quality rating system';
    RAISE NOTICE '✅ Bulk import batch tracking and error management';
    RAISE NOTICE '✅ Enhanced metadata with 15+ new classification fields';
    RAISE NOTICE '✅ Advanced search functions with multi-criteria filtering';
    RAISE NOTICE '✅ Performance-optimized indexing strategy';
    RAISE NOTICE '✅ Row-level security for multi-tenant isolation';
    RAISE NOTICE '✅ Automated triggers for statistics maintenance';
    RAISE NOTICE '';
    RAISE NOTICE 'Database ready for 1,000+ question library implementation';
    RAISE NOTICE 'Next: Implement bulk import API and validation system';
    RAISE NOTICE '============================================================================';
END;
$$;