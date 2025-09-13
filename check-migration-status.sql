-- ============================================================================
-- CHECK MIGRATION STATUS
-- Run this to see current progress
-- ============================================================================

-- Check total count
SELECT 
    '📊 CURRENT STATUS' as report,
    COUNT(*) as total_questions,
    COUNT(DISTINCT section) as sections,
    COUNT(DISTINCT subsection) as subsections
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Check by section
SELECT 
    section,
    COUNT(*) as question_count,
    COUNT(DISTINCT subsection) as subsections
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY section
ORDER BY section;

-- Check by subsection (top 10)
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

-- Check for any duplicate question_ids (should be 0)
SELECT 
    question_id,
    COUNT(*) as duplicate_count
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY question_id
HAVING COUNT(*) > 1;

-- Summary message
DO $$
DECLARE
    v_count INTEGER;
    v_lr_count INTEGER;
    v_rc_count INTEGER;
    v_ws_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
    
    SELECT COUNT(*) INTO v_lr_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Logical Reasoning';
    
    SELECT COUNT(*) INTO v_rc_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Reading Comprehension';
    
    SELECT COUNT(*) INTO v_ws_count
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Writing Sample';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📈 MIGRATION PROGRESS REPORT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total questions: % / 963 (960 + 3 test)', v_count;
    RAISE NOTICE 'Logical Reasoning: % / 520', v_lr_count;
    RAISE NOTICE 'Reading Comprehension: % / 320', v_rc_count;
    RAISE NOTICE 'Writing Sample: % / 120', v_ws_count;
    RAISE NOTICE '========================================';
    
    IF v_count >= 960 THEN
        RAISE NOTICE '🎉 SUCCESS! All questions imported!';
    ELSIF v_count > 0 THEN
        RAISE NOTICE '⏳ Migration in progress...';
        RAISE NOTICE 'Continue with remaining batch files.';
    ELSE
        RAISE NOTICE '❌ No questions found. Check for errors.';
    END IF;
END $$;