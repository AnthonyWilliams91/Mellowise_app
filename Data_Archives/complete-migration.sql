-- ============================================================================
-- COMPLETE LSAT QUESTIONS MIGRATION - SINGLE FILE
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Step 1: Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Set up Demo Tenant
DO $$
DECLARE
    demo_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    lsat_exam_type_id UUID;
BEGIN
    -- Create demo tenant if not exists
    INSERT INTO public.tenants (id, name, slug, plan_type, admin_name) 
    VALUES (demo_tenant_id, 'Mellowise Demo', 'demo', 'demo', 'System Admin')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Demo tenant ready';
    
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
        
        RAISE NOTICE '✅ Created LSAT exam type: %', lsat_exam_type_id;
    ELSE
        RAISE NOTICE '✅ Using existing LSAT exam type: %', lsat_exam_type_id;
    END IF;
END $$;

-- Step 3: Create temporary import function
CREATE OR REPLACE FUNCTION temp_insert_question(
    p_question_id TEXT,
    p_section TEXT,
    p_subsection TEXT,
    p_difficulty INTEGER,
    p_content JSONB,
    p_tags TEXT[]
) RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_exam_type_id UUID;
BEGIN
    -- Get LSAT exam type
    SELECT id INTO v_exam_type_id
    FROM public.exam_types 
    WHERE tenant_id = v_tenant_id AND name = 'LSAT'
    LIMIT 1;
    
    -- Insert if not exists
    INSERT INTO public.questions (
        tenant_id, id, question_id, exam_type_id, 
        section, subsection, difficulty_level, 
        content, metadata
    ) 
    SELECT
        v_tenant_id,
        uuid_generate_v4(),
        p_question_id,
        v_exam_type_id,
        p_section,
        p_subsection,
        p_difficulty,
        p_content,
        jsonb_build_object(
            'tags', p_tags,
            'source', 'migration_sql',
            'version', '1.0'
        )
    WHERE NOT EXISTS (
        SELECT 1 FROM public.questions 
        WHERE tenant_id = v_tenant_id 
        AND question_id = p_question_id
    );
EXCEPTION WHEN OTHERS THEN
    -- Silently skip errors (duplicates, etc)
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Insert sample questions to test
DO $$
BEGIN
    -- Test with a few questions first
    PERFORM temp_insert_question(
        'lr-assum-001',
        'Logical Reasoning',
        'Assumption',
        6,
        '{"question_text": "A recent study found that companies implementing remote work policies experienced a 25% increase in employee productivity. The CEO of TechFlow Inc. concluded that adopting remote work would directly cause similar productivity gains for their company. The CEO''s conclusion assumes which of the following?", "answer_choices": [{"label": "A", "text": "TechFlow''s employees are currently working below their maximum productivity potential."}, {"label": "B", "text": "Remote work policies are the primary factor responsible for the productivity increases observed in the study."}, {"label": "C", "text": "TechFlow''s employees would prefer to work remotely rather than in the office."}, {"label": "D", "text": "The study included companies similar in size and industry to TechFlow Inc."}, {"label": "E", "text": "Productivity gains from remote work can be sustained over long periods."}], "correct_answer": "B", "explanation": "The CEO assumes remote work caused the productivity gains."}',
        ARRAY['assumption', 'causal-reasoning', 'business']
    );
    
    PERFORM temp_insert_question(
        'lr-assum-002',
        'Logical Reasoning', 
        'Assumption',
        5,
        '{"question_text": "Environmental scientist Maria argues that installing solar panels on all government buildings would significantly reduce the city''s carbon emissions. She notes that government buildings account for 15% of the city''s total energy consumption. Maria''s argument depends on the assumption that:", "answer_choices": [{"label": "A", "text": "Solar panels are the most cost-effective renewable energy option."}, {"label": "B", "text": "The electricity currently used by government buildings is generated primarily from carbon-emitting sources."}, {"label": "C", "text": "Government buildings have adequate roof space for solar panels."}, {"label": "D", "text": "Installing solar panels would not require significant electrical changes."}, {"label": "E", "text": "The city government has sufficient budget for renewable energy."}], "correct_answer": "B", "explanation": "For solar panels to reduce carbon emissions, current electricity must generate emissions."}',
        ARRAY['assumption', 'environmental', 'logical-gap']
    );
    
    RAISE NOTICE '✅ Test questions inserted';
END $$;

-- Step 5: Verify initial import
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
    
    RAISE NOTICE '================================';
    RAISE NOTICE 'Initial Migration Test Complete';
    RAISE NOTICE 'Questions in database: %', test_count;
    RAISE NOTICE '================================';
    
    IF test_count >= 2 THEN
        RAISE NOTICE '✅ Migration system working! Ready for full import.';
    ELSE
        RAISE NOTICE '⚠️  Migration may have issues. Check table structure.';
    END IF;
END $$;

-- Step 6: Clean up
DROP FUNCTION IF EXISTS temp_insert_question(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[]);

-- Step 7: Final summary with detailed counts
SELECT 
    'Summary' as report,
    COUNT(*) as total_questions,
    COUNT(DISTINCT section) as sections,
    COUNT(DISTINCT subsection) as subsections
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'

UNION ALL

SELECT 
    section as report,
    COUNT(*) as total_questions,
    COUNT(DISTINCT subsection) as sections,
    NULL as subsections
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY section
ORDER BY report;