-- ============================================================================
-- COMPLETE SETUP AND MIGRATION
-- Creates all required tables and imports questions
-- ============================================================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create tenants table (if not exists)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'institution' CHECK (plan_type IN ('institution', 'enterprise', 'demo')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    max_users INTEGER DEFAULT 1000,
    max_storage_gb INTEGER DEFAULT 100,
    features JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    admin_name VARCHAR(255),
    admin_email VARCHAR(255)
);

-- Step 3: Create exam_types table (if not exists)
CREATE TABLE IF NOT EXISTS public.exam_types (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    scoring_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    timing_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, slug)
);

-- Step 4: Create questions table (if not exists)
CREATE TABLE IF NOT EXISTS public.questions (
    tenant_id UUID NOT NULL,
    id UUID DEFAULT uuid_generate_v4(),
    question_id VARCHAR(100),
    exam_type_id UUID,
    section VARCHAR(100),
    subsection VARCHAR(100),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, exam_type_id) REFERENCES public.exam_types(tenant_id, id),
    UNIQUE(tenant_id, question_id)
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_tenant_section ON public.questions(tenant_id, section);
CREATE INDEX IF NOT EXISTS idx_questions_tenant_difficulty ON public.questions(tenant_id, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_tenant_active ON public.questions(tenant_id, is_active) WHERE is_active = true;

-- Step 6: Insert demo tenant and LSAT exam type
DO $$
DECLARE
    demo_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    lsat_exam_type_id UUID;
BEGIN
    -- Create demo tenant
    INSERT INTO public.tenants (id, name, slug, plan_type, admin_name) 
    VALUES (demo_tenant_id, 'Mellowise Demo', 'demo', 'demo', 'System Admin')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Demo tenant created/verified';
    
    -- Check if LSAT exam type exists
    SELECT id INTO lsat_exam_type_id 
    FROM public.exam_types 
    WHERE tenant_id = demo_tenant_id AND name = 'LSAT';
    
    IF lsat_exam_type_id IS NULL THEN
        lsat_exam_type_id := uuid_generate_v4();
        INSERT INTO public.exam_types (
            tenant_id, id, name, slug, description, 
            scoring_config, timing_config
        ) VALUES (
            demo_tenant_id,
            lsat_exam_type_id,
            'LSAT',
            'lsat',
            'Law School Admission Test',
            '{"total_questions": 100, "time_limit": 210, "sections": ["Logical Reasoning", "Reading Comprehension", "Writing Sample"], "difficulty_range": [1, 10], "points_formula": "10 + (difficulty-1) * 5"}',
            '{"total_time": 210, "sections": [{"name": "Logical Reasoning", "time": 70}, {"name": "Reading Comprehension", "time": 70}, {"name": "Writing Sample", "time": 70}]}'
        );
        
        RAISE NOTICE '✅ Created LSAT exam type with ID: %', lsat_exam_type_id;
    ELSE
        RAISE NOTICE '✅ Using existing LSAT exam type: %', lsat_exam_type_id;
    END IF;
    
    -- Store exam type ID for use in question inserts
    PERFORM set_config('mellowise.lsat_exam_type_id', lsat_exam_type_id::text, false);
END $$;

-- Step 7: Insert sample questions
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_exam_type_id UUID;
    v_question_id UUID;
BEGIN
    -- Get LSAT exam type ID
    SELECT id INTO v_exam_type_id
    FROM public.exam_types 
    WHERE tenant_id = v_tenant_id AND name = 'LSAT'
    LIMIT 1;
    
    IF v_exam_type_id IS NULL THEN
        RAISE NOTICE '❌ LSAT exam type not found';
        RETURN;
    END IF;
    
    -- Insert first test question
    v_question_id := uuid_generate_v4();
    INSERT INTO public.questions (
        tenant_id, id, question_id, exam_type_id,
        section, subsection, difficulty_level, content, metadata
    ) VALUES (
        v_tenant_id,
        v_question_id,
        'lr-assum-001',
        v_exam_type_id,
        'Logical Reasoning',
        'Assumption',
        6,
        '{"question_text": "A recent study found that companies implementing remote work policies experienced a 25% increase in employee productivity. The CEO of TechFlow Inc. concluded that adopting remote work would directly cause similar productivity gains for their company. The CEO''s conclusion assumes which of the following?", "answer_choices": [{"label": "A", "text": "TechFlow''s employees are currently working below their maximum productivity potential."}, {"label": "B", "text": "Remote work policies are the primary factor responsible for the productivity increases observed in the study."}, {"label": "C", "text": "TechFlow''s employees would prefer to work remotely rather than in the office."}, {"label": "D", "text": "The study included companies similar in size and industry to TechFlow Inc."}, {"label": "E", "text": "Productivity gains from remote work can be sustained over long periods."}], "correct_answer": "B", "explanation": "The CEO assumes remote work caused the productivity gains. This requires assuming no other major factors were responsible for the 25% increase observed in the study."}',
        '{"tags": ["assumption", "causal-reasoning", "business"], "source": "migration_sql", "version": "1.0"}'
    ) ON CONFLICT (tenant_id, question_id) DO NOTHING;
    
    -- Insert second test question
    v_question_id := uuid_generate_v4();
    INSERT INTO public.questions (
        tenant_id, id, question_id, exam_type_id,
        section, subsection, difficulty_level, content, metadata
    ) VALUES (
        v_tenant_id,
        v_question_id,
        'lr-assum-002',
        v_exam_type_id,
        'Logical Reasoning',
        'Assumption',
        5,
        '{"question_text": "Environmental scientist Maria argues that installing solar panels on all government buildings would significantly reduce the city''s carbon emissions. She notes that government buildings account for 15% of the city''s total energy consumption. Maria''s argument depends on the assumption that:", "answer_choices": [{"label": "A", "text": "Solar panels are the most cost-effective renewable energy option for large buildings."}, {"label": "B", "text": "The electricity currently used by government buildings is generated primarily from carbon-emitting sources."}, {"label": "C", "text": "Government buildings have adequate roof space and sun exposure for solar panel installation."}, {"label": "D", "text": "Installing solar panels would not require significant changes to the buildings'' electrical systems."}, {"label": "E", "text": "The city government has sufficient budget allocated for renewable energy initiatives."}], "correct_answer": "B", "explanation": "For solar panels to reduce carbon emissions, the current electricity must be generating carbon emissions. If the grid is already clean, solar panels wouldn''t reduce emissions significantly."}',
        '{"tags": ["assumption", "environmental", "logical-gap"], "source": "migration_sql", "version": "1.0"}'
    ) ON CONFLICT (tenant_id, question_id) DO NOTHING;
    
    -- Insert third test question
    v_question_id := uuid_generate_v4();
    INSERT INTO public.questions (
        tenant_id, id, question_id, exam_type_id,
        section, subsection, difficulty_level, content, metadata
    ) VALUES (
        v_tenant_id,
        v_question_id,
        'rc-main-001',
        v_exam_type_id,
        'Reading Comprehension',
        'Main Point',
        4,
        '{"question_text": "The passage primarily argues that modern urban planning must balance economic development with environmental sustainability. Which of the following best captures the main point?", "answer_choices": [{"label": "A", "text": "Cities should prioritize environmental concerns over economic growth."}, {"label": "B", "text": "Sustainable urban development requires integrating economic and environmental considerations."}, {"label": "C", "text": "Economic development inevitably conflicts with environmental protection."}, {"label": "D", "text": "Urban planners lack the tools to address environmental challenges."}, {"label": "E", "text": "Environmental sustainability is more important than economic factors."}], "correct_answer": "B", "explanation": "The main point emphasizes balance and integration, not prioritizing one aspect over another."}',
        '{"tags": ["main-point", "urban-planning", "environmental"], "source": "migration_sql", "version": "1.0"}'
    ) ON CONFLICT (tenant_id, question_id) DO NOTHING;
    
    RAISE NOTICE '✅ Sample questions inserted';
END $$;

-- Step 8: Verify setup
DO $$
DECLARE
    tenant_count INTEGER;
    exam_count INTEGER;
    question_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM public.tenants;
    SELECT COUNT(*) INTO exam_count FROM public.exam_types;
    SELECT COUNT(*) INTO question_count FROM public.questions;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 SETUP AND MIGRATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tenants created: %', tenant_count;
    RAISE NOTICE 'Exam types created: %', exam_count;
    RAISE NOTICE 'Questions imported: %', question_count;
    RAISE NOTICE '========================================';
    
    IF question_count > 0 THEN
        RAISE NOTICE '✅ SUCCESS: Database is ready!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Check the questions table in Table Editor';
        RAISE NOTICE '2. Run batch-2-lr.sql through batch-5-rc-ws.sql for all 960 questions';
    ELSE
        RAISE NOTICE '⚠️  No questions imported. Check for errors above.';
    END IF;
END $$;

-- Step 9: Show sample data
SELECT 
    'Table Overview' as report_type,
    t.name as tenant_name,
    et.name as exam_type,
    COUNT(q.id) as question_count,
    MIN(q.difficulty_level) as min_difficulty,
    MAX(q.difficulty_level) as max_difficulty
FROM public.tenants t
LEFT JOIN public.exam_types et ON t.id = et.tenant_id
LEFT JOIN public.questions q ON et.tenant_id = q.tenant_id AND et.id = q.exam_type_id
WHERE t.id = '00000000-0000-0000-0000-000000000001'
GROUP BY t.name, et.name

UNION ALL

SELECT 
    'By Section' as report_type,
    section as tenant_name,
    subsection as exam_type,
    COUNT(*) as question_count,
    MIN(difficulty_level) as min_difficulty,
    MAX(difficulty_level) as max_difficulty
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY section, subsection
ORDER BY report_type, tenant_name;