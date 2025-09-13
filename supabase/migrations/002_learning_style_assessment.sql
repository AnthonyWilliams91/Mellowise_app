-- Learning Style Assessment System
-- Migration: 002_learning_style_assessment
-- Created: 2025-01-12 (MELLOWISE-009)

-- Learning style profiles for users
CREATE TABLE public.learning_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Assessment status
    has_completed_diagnostic BOOLEAN DEFAULT false,
    diagnostic_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Learning style dimensions (0.0 to 1.0 scores)
    visual_analytical_score DECIMAL(3,2) DEFAULT 0.50 CHECK (visual_analytical_score >= 0.0 AND visual_analytical_score <= 1.0),
    fast_methodical_score DECIMAL(3,2) DEFAULT 0.50 CHECK (fast_methodical_score >= 0.0 AND fast_methodical_score <= 1.0),
    conceptual_detail_score DECIMAL(3,2) DEFAULT 0.50 CHECK (conceptual_detail_score >= 0.0 AND conceptual_detail_score <= 1.0),
    
    -- Classification results
    primary_learning_style TEXT,
    secondary_learning_style TEXT,
    
    -- Confidence scores (0-100)
    visual_analytical_confidence INTEGER DEFAULT 0 CHECK (visual_analytical_confidence >= 0 AND visual_analytical_confidence <= 100),
    fast_methodical_confidence INTEGER DEFAULT 0 CHECK (fast_methodical_confidence >= 0 AND fast_methodical_confidence <= 100),
    conceptual_detail_confidence INTEGER DEFAULT 0 CHECK (conceptual_detail_confidence >= 0 AND conceptual_detail_confidence <= 100),
    overall_confidence INTEGER DEFAULT 0 CHECK (overall_confidence >= 0 AND overall_confidence <= 100),
    
    -- Data points for analysis
    total_questions_analyzed INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- milliseconds
    accuracy_variance DECIMAL(5,4) DEFAULT 0.0000,
    
    -- Manual override settings
    manual_override_enabled BOOLEAN DEFAULT false,
    manual_primary_style TEXT,
    manual_secondary_style TEXT,
    override_set_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Diagnostic quiz questions and results
CREATE TABLE public.diagnostic_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    diagnostic_category TEXT NOT NULL CHECK (diagnostic_category IN ('visual_pattern', 'analytical_logic', 'speed_test', 'detail_focus', 'conceptual_reasoning')),
    learning_dimensions TEXT[] NOT NULL DEFAULT '{}', -- Which dimensions this question tests
    expected_response_time INTEGER, -- Expected time for average learner (ms)
    complexity_indicators JSONB DEFAULT '{}'::jsonb, -- Visual vs text heavy, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- User diagnostic quiz attempts
CREATE TABLE public.diagnostic_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    diagnostic_question_id UUID REFERENCES public.diagnostic_questions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    
    -- Attempt data
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER NOT NULL, -- milliseconds
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5), -- 1-5 self-reported confidence
    
    -- Learning style indicators
    showed_hesitation BOOLEAN DEFAULT false, -- Long pause before answering
    changed_answer BOOLEAN DEFAULT false, -- Answer was changed
    used_elimination BOOLEAN DEFAULT false, -- Process of elimination detected
    
    -- Behavioral data
    time_on_question INTEGER, -- Total time viewing question
    time_on_choices INTEGER, -- Time spent on answer choices
    scroll_behavior JSONB DEFAULT '{}'::jsonb, -- Scrolling patterns
    
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Learning style refinement tracking
CREATE TABLE public.learning_style_refinements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- What triggered the refinement
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('diagnostic_completion', 'performance_change', 'manual_override', 'periodic_review')),
    trigger_data JSONB DEFAULT '{}'::jsonb,
    
    -- Previous vs new scores
    previous_scores JSONB NOT NULL,
    new_scores JSONB NOT NULL,
    confidence_changes JSONB NOT NULL,
    
    -- Analysis results
    significant_change BOOLEAN DEFAULT false,
    analysis_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_learning_profiles_user_id ON public.learning_profiles(user_id);
CREATE INDEX idx_diagnostic_questions_category ON public.diagnostic_questions(diagnostic_category, is_active);
CREATE INDEX idx_diagnostic_attempts_user_question ON public.diagnostic_attempts(user_id, diagnostic_question_id);
CREATE INDEX idx_diagnostic_attempts_user_time ON public.diagnostic_attempts(user_id, attempted_at DESC);
CREATE INDEX idx_learning_style_refinements_user ON public.learning_style_refinements(user_id, created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_style_refinements ENABLE ROW LEVEL SECURITY;

-- Users can only access their own learning data
CREATE POLICY "Users can view own learning profile" ON public.learning_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own learning profile" ON public.learning_profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning profile" ON public.learning_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostic attempts" ON public.diagnostic_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning refinements" ON public.learning_style_refinements
    FOR SELECT USING (auth.uid() = user_id);

-- Diagnostic questions are publicly readable (no RLS needed for question content)

-- Updated timestamps trigger for learning profiles
CREATE TRIGGER set_learning_profiles_updated_at BEFORE UPDATE ON public.learning_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Initial diagnostic questions seed data
INSERT INTO public.diagnostic_questions (question_id, diagnostic_category, learning_dimensions, expected_response_time, complexity_indicators) 
SELECT 
    q.id,
    CASE 
        WHEN q.question_type = 'logical_reasoning' AND q.subtype = 'syllogism' THEN 'analytical_logic'
        WHEN q.question_type = 'logic_games' THEN 'visual_pattern'
        WHEN q.question_type = 'reading_comprehension' THEN 'detail_focus'
        ELSE 'conceptual_reasoning'
    END as diagnostic_category,
    ARRAY[
        CASE WHEN q.difficulty <= 3 THEN 'fast_methodical' ELSE 'conceptual_detail' END,
        CASE WHEN q.question_type = 'logic_games' THEN 'visual_analytical' ELSE 'conceptual_detail' END
    ] as learning_dimensions,
    CASE 
        WHEN q.difficulty <= 3 THEN 45000  -- 45 seconds
        WHEN q.difficulty <= 6 THEN 75000  -- 75 seconds  
        ELSE 120000 -- 2 minutes
    END as expected_response_time,
    CASE 
        WHEN q.question_type = 'logic_games' THEN '{"visual_elements": true, "text_heavy": false, "spatial_reasoning": true}'::jsonb
        WHEN q.question_type = 'reading_comprehension' THEN '{"visual_elements": false, "text_heavy": true, "detail_oriented": true}'::jsonb
        ELSE '{"visual_elements": false, "text_heavy": false, "logical_analysis": true}'::jsonb
    END as complexity_indicators
FROM public.questions q 
WHERE q.is_active = true
LIMIT 20; -- Seed with first 20 questions for diagnostic

COMMENT ON TABLE public.learning_profiles IS 'User learning style profiles with confidence scoring';
COMMENT ON TABLE public.diagnostic_questions IS 'Curated questions for learning style assessment';
COMMENT ON TABLE public.diagnostic_attempts IS 'User responses to diagnostic questions with behavioral data';
COMMENT ON TABLE public.learning_style_refinements IS 'Historical tracking of learning style changes and refinements';