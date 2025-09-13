-- ============================================================================
-- CHECK FOR MISSING SPECIFIC QUESTION IDs
-- Identify gaps in question ID sequences
-- ============================================================================

-- Check if lr-flaw-001 exists
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM questions WHERE question_id = 'lr-flaw-001') 
        THEN '✅ lr-flaw-001 EXISTS'
        ELSE '❌ lr-flaw-001 MISSING'
    END as flaw_001_status;

-- Check the Flaw in Reasoning subsection
SELECT 
    'Flaw in Reasoning Questions' as section,
    question_id,
    difficulty_level,
    LEFT(content->>'question_text', 100) || '...' as preview
FROM questions 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
AND section = 'Logical Reasoning'
AND subsection = 'Flaw in Reasoning'
ORDER BY question_id
LIMIT 10;

-- Check all LR subsections for missing -001 questions
WITH expected_questions AS (
    SELECT 'lr-assum-001' as question_id UNION ALL
    SELECT 'lr-str-001' UNION ALL
    SELECT 'lr-weak-001' UNION ALL
    SELECT 'lr-flaw-001' UNION ALL
    SELECT 'lr-method-001' UNION ALL
    SELECT 'lr-pareas-001' UNION ALL
    SELECT 'lr-parflaw-001' UNION ALL
    SELECT 'lr-role-001' UNION ALL
    SELECT 'lr-prinapp-001' UNION ALL
    SELECT 'lr-prinsup-001' UNION ALL
    SELECT 'lr-point-001' UNION ALL
    SELECT 'lr-paradx-001' UNION ALL
    SELECT 'lr-infmbt-001'
)
SELECT 
    e.question_id,
    CASE 
        WHEN q.question_id IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM expected_questions e
LEFT JOIN questions q ON e.question_id = q.question_id 
    AND q.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY e.question_id;

-- Show actual question_ids that exist for Flaw subsection
SELECT COUNT(*) as total_flaw_questions
FROM questions 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
AND section = 'Logical Reasoning'
AND subsection = 'Flaw in Reasoning';