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
