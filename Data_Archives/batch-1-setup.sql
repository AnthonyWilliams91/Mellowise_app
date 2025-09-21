-- ============================================================================
-- LSAT Questions Migration Setup
-- Creates tenant, exam type, and helper function
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
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_exam_type_id UUID;
    v_db_question_id UUID;
    v_existing_count INTEGER;
BEGIN
    -- Get exam type ID for LSAT
    SELECT id INTO v_exam_type_id
    FROM public.exam_types 
    WHERE tenant_id = v_tenant_id AND name = 'LSAT'
    LIMIT 1;
    
    IF v_exam_type_id IS NULL THEN
        RAISE NOTICE 'LSAT exam type not found, please run setup first';
        RETURN false;
    END IF;
    
    -- Check if question already exists
    SELECT COUNT(*) INTO v_existing_count
    FROM public.questions 
    WHERE tenant_id = v_tenant_id AND question_id = p_question_id;
    
    IF v_existing_count > 0 THEN
        RETURN false; -- Silently skip duplicates
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
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ Setup complete - ready to import questions';
END $$;
