-- ============================================================================
-- CREATE INSERT FUNCTION FOR BATCH IMPORTS
-- Run this BEFORE running batch-2 through batch-5
-- ============================================================================

-- Create the insert function that the batch files expect
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
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't stop the migration
    RAISE NOTICE 'Error inserting %: %', p_question_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Verify function was created
DO $$
BEGIN
    RAISE NOTICE '✅ Insert function created successfully!';
    RAISE NOTICE 'You can now run batch-2 through batch-5';
END $$;