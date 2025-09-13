-- Universal Exam System Architecture
-- Version: 1.0
-- Created: 2025-01-10
-- Author: Dev Agent James
-- Context7 Research: DecA(I)de exam configuration patterns

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- EXAM TYPE CONFIGURATION SYSTEM
-- ============================================================================

-- Main exam types table (LSAT, GRE, MCAT, SAT, etc.)
CREATE TABLE public.exam_types (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Basic exam information
    name VARCHAR(100) NOT NULL, -- 'LSAT', 'GRE', 'MCAT', 'SAT'
    slug VARCHAR(50) NOT NULL, -- 'lsat', 'gre', 'mcat', 'sat'
    description TEXT,
    
    -- Scoring configuration (flexible JSON structure)
    scoring_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example: {"min_score": 120, "max_score": 180, "sections": {...}}
    
    -- Timing configuration
    timing_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example: {"total_time": 210, "sections": [{"name": "LR", "time": 35}]}
    
    -- Difficulty distribution (Context7 DecA(I)de pattern)
    difficulty_mix JSONB NOT NULL DEFAULT '{"easy": 0.4, "medium": 0.4, "hard": 0.2}'::jsonb,
    
    -- Metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    UNIQUE(tenant_id, slug)
);

-- Exam type categories (hierarchical organization like DecA(I)de clusters)
CREATE TABLE public.exam_categories (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    exam_type_id UUID NOT NULL,
    PRIMARY KEY (tenant_id, id),
    
    -- Category information
    name VARCHAR(200) NOT NULL, -- 'Logical Reasoning', 'Reading Comprehension'
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Hierarchical structure
    parent_category_id UUID, -- For nested categories
    sort_order INTEGER DEFAULT 0,
    
    -- Blueprint configuration (DecA(I)de pattern)
    blueprint_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example: {"district": 15, "association": 18, "national": 25}
    
    -- Performance indicators / standards
    performance_indicators JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"code": "LR:001", "description": "Identify assumptions"}]
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, parent_category_id) REFERENCES public.exam_categories(tenant_id, id) ON DELETE SET NULL,
    
    -- Constraints
    UNIQUE(tenant_id, exam_type_id, slug)
);

-- ============================================================================
-- UNIVERSAL QUESTION BANK SYSTEM
-- ============================================================================

-- Enhanced questions table (replaces the single-tenant LSAT version)
CREATE TABLE public.questions_universal (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Exam association
    exam_type_id UUID NOT NULL,
    category_id UUID NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    question_type VARCHAR(100) NOT NULL, -- flexible, not constrained to LSAT types
    subtype VARCHAR(100),
    
    -- Difficulty and performance
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_time INTEGER, -- seconds
    cognitive_level VARCHAR(50), -- 'recall', 'application', 'analysis', 'synthesis'
    
    -- Answers and explanations
    correct_answer TEXT NOT NULL,
    answer_choices JSONB NOT NULL,
    explanation TEXT NOT NULL,
    
    -- Categorization and tagging
    concept_tags TEXT[] DEFAULT '{}',
    performance_indicators TEXT[] DEFAULT '{}', -- PI codes like "LR:001"
    
    -- Metadata
    source_attribution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Analytics
    usage_count INTEGER DEFAULT 0,
    avg_response_time INTEGER, -- milliseconds
    accuracy_rate DECIMAL(5,4), -- 0.0000 to 1.0000
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, category_id) REFERENCES public.exam_categories(tenant_id, id) ON DELETE CASCADE
);

-- ============================================================================
-- USER EXAM PROGRESS TRACKING (MULTI-EXAM SUPPORT)
-- ============================================================================

-- User exam registrations (which exams each user is preparing for)
CREATE TABLE public.user_exam_registrations (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- User and exam association
    user_id UUID NOT NULL,
    exam_type_id UUID NOT NULL,
    
    -- Goals and preferences
    target_score INTEGER,
    target_test_date DATE,
    preparation_level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Progress tracking
    current_score INTEGER,
    sessions_completed INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- minutes
    
    -- Preferences
    preferences JSONB DEFAULT '{}'::jsonb,
    -- Example: {"difficulty_preference": "adaptive", "session_length": 30}
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE(tenant_id, user_id, exam_type_id)
);

-- Enhanced game sessions for multi-exam support
CREATE TABLE public.game_sessions_universal (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- User and exam context
    user_id UUID NOT NULL,
    exam_type_id UUID NOT NULL,
    category_id UUID, -- specific category being practiced
    
    -- Session details
    session_type VARCHAR(50) DEFAULT 'survival_mode' CHECK (session_type IN ('survival_mode', 'practice', 'timed_test', 'diagnostic')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics
    final_score INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    lives_remaining INTEGER DEFAULT 3,
    difficulty_level INTEGER DEFAULT 1,
    
    -- Session configuration and data
    session_config JSONB DEFAULT '{}'::jsonb, -- exam-specific configuration
    session_data JSONB DEFAULT '{}'::jsonb, -- game state, power-ups, etc.
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, category_id) REFERENCES public.exam_categories(tenant_id, id) ON DELETE SET NULL
);

-- Enhanced question attempts for multi-exam tracking
CREATE TABLE public.question_attempts_universal (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Context
    user_id UUID NOT NULL,
    question_id UUID NOT NULL,
    session_id UUID,
    exam_type_id UUID NOT NULL,
    category_id UUID,
    
    -- Attempt details
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- milliseconds
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Additional tracking
    hint_used BOOLEAN DEFAULT false,
    difficulty_at_attempt INTEGER,
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, question_id) REFERENCES public.questions_universal(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, session_id) REFERENCES public.game_sessions_universal(tenant_id, id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, category_id) REFERENCES public.exam_categories(tenant_id, id) ON DELETE SET NULL
);

-- Enhanced analytics for multi-exam tracking
CREATE TABLE public.user_analytics_universal (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    PRIMARY KEY (tenant_id, id),
    
    -- Context
    user_id UUID NOT NULL,
    exam_type_id UUID, -- NULL for cross-exam analytics
    category_id UUID, -- NULL for exam-wide analytics
    
    -- Metric information
    metric_type VARCHAR(100) NOT NULL, -- 'daily_stats', 'exam_progress', 'category_performance'
    metric_data JSONB NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign keys
    FOREIGN KEY (tenant_id, user_id) REFERENCES public.user_profiles(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, category_id) REFERENCES public.exam_categories(tenant_id, id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Exam types
CREATE INDEX idx_exam_types_tenant_status ON public.exam_types(tenant_id, status);
CREATE INDEX idx_exam_types_tenant_slug ON public.exam_types(tenant_id, slug);

-- Exam categories
CREATE INDEX idx_exam_categories_tenant_exam ON public.exam_categories(tenant_id, exam_type_id);
CREATE INDEX idx_exam_categories_parent ON public.exam_categories(tenant_id, parent_category_id);
CREATE INDEX idx_exam_categories_active ON public.exam_categories(tenant_id, is_active) WHERE is_active = true;

-- Questions universal
CREATE INDEX idx_questions_universal_tenant_exam ON public.questions_universal(tenant_id, exam_type_id);
CREATE INDEX idx_questions_universal_category ON public.questions_universal(tenant_id, category_id);
CREATE INDEX idx_questions_universal_difficulty ON public.questions_universal(tenant_id, difficulty_level, difficulty);
CREATE INDEX idx_questions_universal_active ON public.questions_universal(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_questions_universal_tags ON public.questions_universal USING GIN(concept_tags);
CREATE INDEX idx_questions_universal_pi ON public.questions_universal USING GIN(performance_indicators);

-- User exam registrations
CREATE INDEX idx_user_exam_reg_user ON public.user_exam_registrations(tenant_id, user_id);
CREATE INDEX idx_user_exam_reg_exam ON public.user_exam_registrations(tenant_id, exam_type_id);
CREATE INDEX idx_user_exam_reg_status ON public.user_exam_registrations(tenant_id, status);

-- Game sessions universal
CREATE INDEX idx_game_sessions_univ_user_exam ON public.game_sessions_universal(tenant_id, user_id, exam_type_id);
CREATE INDEX idx_game_sessions_univ_started ON public.game_sessions_universal(tenant_id, started_at DESC);

-- Question attempts universal
CREATE INDEX idx_question_attempts_univ_user_exam ON public.question_attempts_universal(tenant_id, user_id, exam_type_id);
CREATE INDEX idx_question_attempts_univ_question ON public.question_attempts_universal(tenant_id, question_id);
CREATE INDEX idx_question_attempts_univ_session ON public.question_attempts_universal(tenant_id, session_id);
CREATE INDEX idx_question_attempts_univ_attempted ON public.question_attempts_universal(tenant_id, attempted_at DESC);

-- User analytics universal
CREATE INDEX idx_user_analytics_univ_user_exam ON public.user_analytics_universal(tenant_id, user_id, exam_type_id);
CREATE INDEX idx_user_analytics_univ_date ON public.user_analytics_universal(tenant_id, date_recorded DESC);
CREATE INDEX idx_user_analytics_univ_metric ON public.user_analytics_universal(tenant_id, metric_type);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.exam_types
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.exam_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.questions_universal
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Sample exam types (will be inserted via application with proper tenant_id)
-- These are examples and will be handled by the multi-tenant utilities

COMMENT ON TABLE public.exam_types IS 'Configurable exam types (LSAT, GRE, MCAT, SAT) with scoring and timing';
COMMENT ON TABLE public.exam_categories IS 'Hierarchical question categories within each exam type';
COMMENT ON TABLE public.questions_universal IS 'Universal question bank supporting multiple exam types';
COMMENT ON TABLE public.user_exam_registrations IS 'User registrations for multiple exam preparations';
COMMENT ON TABLE public.game_sessions_universal IS 'Multi-exam game sessions with exam-specific tracking';
COMMENT ON TABLE public.question_attempts_universal IS 'Question attempts across all exam types';
COMMENT ON TABLE public.user_analytics_universal IS 'Multi-exam analytics and progress tracking';