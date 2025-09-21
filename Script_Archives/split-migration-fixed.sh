#!/bin/bash
# Split migration into manageable batches - FIXED VERSION

echo "🔧 Splitting migration into executable batches..."

# Extract just the setup parts (without any INSERT statements)
cat > batch-1-setup.sql << 'EOF'
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
EOF

# Now extract complete INSERT statements from the full migration
# First, let's see how many complete statements we have
echo "📊 Analyzing migration file..."

# Count total SELECT insert_lsat_question statements
total_statements=$(grep -c "^SELECT insert_lsat_question" migrate-all-questions.sql || echo "0")
echo "Found $total_statements question insert statements"

# Extract statements in batches (ensuring complete statements)
echo "📝 Creating question batches..."

# Batch 2: LR Questions 1-240
awk '/^SELECT insert_lsat_question/{count++; if(count<=240) print $0}' RS=';\n' ORS=';\n' migrate-all-questions.sql > batch-2-lr.sql

# Batch 3: LR Questions 241-480  
awk '/^SELECT insert_lsat_question/{count++; if(count>240 && count<=480) print $0}' RS=';\n' ORS=';\n' migrate-all-questions.sql > batch-3-lr-cont.sql

# Batch 4: RC Questions 481-720
awk '/^SELECT insert_lsat_question/{count++; if(count>480 && count<=720) print $0}' RS=';\n' ORS=';\n' migrate-all-questions.sql > batch-4-rc.sql

# Batch 5: RC & WS Questions 721-960
awk '/^SELECT insert_lsat_question/{count++; if(count>720) print $0}' RS=';\n' ORS=';\n' migrate-all-questions.sql > batch-5-rc-ws.sql

# Create cleanup/summary file
cat > batch-6-summary.sql << 'EOF'
-- ============================================================================
-- Migration Summary and Cleanup
-- ============================================================================

-- Final Summary
DO $$
DECLARE
    final_count INTEGER;
    lr_count INTEGER;
    rc_count INTEGER;
    ws_count INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO final_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
    
    -- Get section counts
    SELECT COUNT(*) INTO lr_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Logical Reasoning';
    
    SELECT COUNT(*) INTO rc_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Reading Comprehension';
    
    SELECT COUNT(*) INTO ws_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Writing Sample';
    
    RAISE NOTICE '================================';
    RAISE NOTICE 'LSAT Questions Migration Complete!';
    RAISE NOTICE 'Total questions in database: %', final_count;
    RAISE NOTICE 'Logical Reasoning: % questions', lr_count;
    RAISE NOTICE 'Reading Comprehension: % questions', rc_count;
    RAISE NOTICE 'Writing Sample: % questions', ws_count;
    RAISE NOTICE '================================';
    
    IF final_count = 960 THEN
        RAISE NOTICE '✅ SUCCESS: All 960 questions imported!';
    ELSE
        RAISE NOTICE '⚠️  WARNING: Expected 960 questions, found %', final_count;
    END IF;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS insert_lsat_question(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[]);

-- Show sample data
SELECT 
    section,
    subsection,
    COUNT(*) as count,
    MIN(difficulty_level) as min_diff,
    MAX(difficulty_level) as max_diff,
    ROUND(AVG(difficulty_level), 1) as avg_diff
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY section, subsection
ORDER BY section, subsection
LIMIT 10;
EOF

echo "✅ Migration split into 6 batch files:"
ls -lh batch-*.sql
echo ""
echo "📋 Import order:"
echo "1. batch-1-setup.sql     - Setup tenant and helper function"
echo "2. batch-2-lr.sql        - Logical Reasoning (240 questions)"
echo "3. batch-3-lr-cont.sql   - Logical Reasoning continued (240 questions)"
echo "4. batch-4-rc.sql        - Reading Comprehension (240 questions)"
echo "5. batch-5-rc-ws.sql     - RC & Writing Sample (240 questions)"
echo "6. batch-6-summary.sql   - Summary and cleanup"