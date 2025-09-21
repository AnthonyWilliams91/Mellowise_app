-- ============================================================================
-- DIAGNOSE MISSING QUESTIONS
-- Find out which subsections are incomplete
-- ============================================================================

-- Detailed count by subsection (should be 40 each)
SELECT 
    section,
    subsection,
    COUNT(*) as current_count,
    40 - COUNT(*) as missing_count,
    CASE 
        WHEN COUNT(*) = 40 THEN '✅ Complete'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial'
        ELSE '❌ Missing'
    END as status
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY section, subsection

UNION ALL

-- Expected subsections that might be completely missing
SELECT 
    'Logical Reasoning' as section,
    subsection,
    0 as current_count,
    40 as missing_count,
    '❌ Missing' as status
FROM (VALUES 
    ('Assumption'),
    ('Strengthen'),
    ('Weaken'),
    ('Flaw in Reasoning'),
    ('Method of Reasoning'),
    ('Parallel Reasoning'),
    ('Parallel Flaw'),
    ('Role of Statement'),
    ('Principle Application'),
    ('Principle Support'),
    ('Point at Issue/Agreement'),
    ('Paradox/Resolve/Explain'),
    ('Inference/Must Be True')
) AS lr_subsections(subsection)
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    AND section = 'Logical Reasoning' 
    AND subsection = lr_subsections.subsection
)

ORDER BY section, subsection;

-- Summary totals
DO $$
DECLARE
    v_total INTEGER;
    v_expected INTEGER := 963; -- 960 + 3 test
    v_missing INTEGER;
    v_complete_subsections INTEGER;
    v_partial_subsections INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.questions 
    WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
    
    v_missing := v_expected - v_total;
    
    SELECT COUNT(*) INTO v_complete_subsections
    FROM (
        SELECT subsection, COUNT(*) as cnt
        FROM public.questions 
        WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
        GROUP BY section, subsection
        HAVING COUNT(*) = 40
    ) complete;
    
    SELECT COUNT(*) INTO v_partial_subsections
    FROM (
        SELECT subsection, COUNT(*) as cnt
        FROM public.questions 
        WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
        GROUP BY section, subsection
        HAVING COUNT(*) < 40
    ) partial;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 MISSING QUESTIONS ANALYSIS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Current total: %', v_total;
    RAISE NOTICE 'Expected total: %', v_expected;
    RAISE NOTICE 'Missing questions: %', v_missing;
    RAISE NOTICE '';
    RAISE NOTICE 'Complete subsections (40 each): %', v_complete_subsections;
    RAISE NOTICE 'Partial subsections: %', v_partial_subsections;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Check the table above to see which subsections need more questions.';
END $$;