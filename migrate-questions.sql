-- ============================================================================
-- LSAT Questions Migration - SQL Direct Approach
-- Migrates all 960 questions from JSON files into multi-tenant database
-- ============================================================================

-- Step 1: Set up Demo Tenant (if not exists)
DO $$
DECLARE
    demo_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    lsat_exam_type_id UUID;
BEGIN
    -- Ensure demo tenant exists
    INSERT INTO public.tenants (id, name, slug, plan_type, admin_name) 
    VALUES (demo_tenant_id, 'Mellowise Demo', 'demo', 'demo', 'System Admin')
    ON CONFLICT (id) DO NOTHING;
    
    -- Create LSAT exam type if not exists
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
        
        RAISE NOTICE 'Created LSAT exam type: %', lsat_exam_type_id;
    ELSE
        RAISE NOTICE 'Using existing LSAT exam type: %', lsat_exam_type_id;
    END IF;
    
    -- Store for reference
    PERFORM set_config('mellowise.demo_tenant_id', demo_tenant_id::text, false);
    PERFORM set_config('mellowise.lsat_exam_type_id', lsat_exam_type_id::text, false);
END $$;

-- Step 2: Create function to insert questions safely
CREATE OR REPLACE FUNCTION insert_lsat_question(
    p_question_id TEXT,
    p_section TEXT,
    p_subsection TEXT,
    p_difficulty INTEGER,
    p_content JSONB,
    p_tags TEXT[] DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    v_tenant_id UUID := current_setting('mellowise.demo_tenant_id', false)::UUID;
    v_exam_type_id UUID := current_setting('mellowise.lsat_exam_type_id', false)::UUID;
    v_db_question_id UUID;
    v_existing_count INTEGER;
BEGIN
    -- Check if question already exists
    SELECT COUNT(*) INTO v_existing_count
    FROM public.questions 
    WHERE tenant_id = v_tenant_id AND question_id = p_question_id;
    
    IF v_existing_count > 0 THEN
        RAISE NOTICE 'Question % already exists, skipping', p_question_id;
        RETURN false;
    END IF;
    
    -- Insert new question
    v_db_question_id := uuid_generate_v4();
    
    INSERT INTO public.questions (
        tenant_id, id, question_id, exam_type_id, 
        section, subsection, difficulty_level, 
        content, metadata, 
        created_at, updated_at
    ) VALUES (
        v_tenant_id,
        v_db_question_id, 
        p_question_id,
        v_exam_type_id,
        p_section,
        p_subsection,
        p_difficulty,
        p_content,
        jsonb_build_object(
            'tags', p_tags,
            'source', 'migration_json',
            'version', '1.0'
        ),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Inserted question: %', p_question_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Insert sample questions to test the system
-- This will be populated by the actual migration script

-- Logical Reasoning - Assumption questions (first 5 as test)
SELECT insert_lsat_question(
    'lr-assum-001',
    'Logical Reasoning', 
    'Assumption',
    4,
    '{"question_text": "Research has shown that people who drink green tea daily have a 30% lower risk of developing heart disease. This is because green tea contains antioxidants that prevent arterial inflammation. Therefore, everyone should drink green tea to improve their cardiovascular health.", "answer_choices": [{"label": "A", "text": "Green tea is the only beverage that contains beneficial antioxidants."}, {"label": "B", "text": "The antioxidants in green tea are the primary factor preventing heart disease."}, {"label": "C", "text": "People who drink green tea daily do not engage in other heart-healthy behaviors."}, {"label": "D", "text": "The research studied a representative sample of the general population."}, {"label": "E", "text": "Drinking green tea daily is the most effective way to prevent heart disease."}], "correct_answer": "B", "explanation": "The argument assumes that the antioxidants in green tea are the primary reason for the reduced heart disease risk. Without this assumption, the causal link between green tea consumption and heart disease prevention would not be established."}',
    '{"assumption", "health", "causal-reasoning"}'
);

SELECT insert_lsat_question(
    'lr-assum-002', 
    'Logical Reasoning',
    'Assumption', 
    6,
    '{"question_text": "The city council claims that the new traffic management system will reduce commute times by 25%. However, this system relies on drivers following optimal routes suggested by the navigation app. Critics argue that the system will fail because not all drivers use smartphone navigation apps.", "answer_choices": [{"label": "A", "text": "The traffic management system cannot function without universal participation."}, {"label": "B", "text": "Smartphone navigation apps always provide the most efficient routes."}, {"label": "C", "text": "Sufficient drivers will use navigation apps to achieve the projected benefits."}, {"label": "D", "text": "The current traffic system is operating at maximum inefficiency."}, {"label": "E", "text": "Drivers who do not use navigation apps cause traffic congestion."}], "correct_answer": "C", "explanation": "The argument assumes that enough drivers will use navigation apps to make the system effective. The critics suggest this assumption is flawed, making option C the key assumption underlying the councils claim."}',
    '{"assumption", "technology", "urban-planning"}'
);

-- Print summary
DO $$
DECLARE
    question_count INTEGER;
    demo_tenant_id UUID := current_setting('mellowise.demo_tenant_id', false)::UUID;
BEGIN
    SELECT COUNT(*) INTO question_count
    FROM public.questions 
    WHERE tenant_id = demo_tenant_id;
    
    RAISE NOTICE '================================';
    RAISE NOTICE 'Migration Test Complete';
    RAISE NOTICE 'Questions in database: %', question_count;
    RAISE NOTICE 'Tenant ID: %', demo_tenant_id;
    RAISE NOTICE 'Ready for full migration';
    RAISE NOTICE '================================';
END $$;

-- Clean up helper function (optional)
-- DROP FUNCTION IF EXISTS insert_lsat_question(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[]);