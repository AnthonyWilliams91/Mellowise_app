-- ============================================================================
-- INSERT MISSING lr-flaw-001 QUESTION
-- Add the specific missing question
-- ============================================================================

-- Insert lr-flaw-001 if it doesn't exist
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_exam_type_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- Get LSAT exam type
    SELECT id INTO v_exam_type_id
    FROM public.exam_types 
    WHERE tenant_id = v_tenant_id AND name = 'LSAT'
    LIMIT 1;
    
    -- Check if lr-flaw-001 already exists
    SELECT EXISTS(
        SELECT 1 FROM public.questions 
        WHERE tenant_id = v_tenant_id 
        AND question_id = 'lr-flaw-001'
    ) INTO v_exists;
    
    IF v_exists THEN
        RAISE NOTICE '✅ lr-flaw-001 already exists, no action needed';
    ELSE
        -- Insert the missing question
        INSERT INTO public.questions (
            tenant_id, id, question_id, exam_type_id,
            section, subsection, difficulty_level, 
            content, metadata
        ) VALUES (
            v_tenant_id,
            uuid_generate_v4(),
            'lr-flaw-001',
            v_exam_type_id,
            'Logical Reasoning',
            'Flaw in Reasoning',
            5,
            '{
                "question_text": "City Council Member: Our city''s recent ban on plastic bags has been highly effective at reducing plastic waste. Since the ban was implemented six months ago, we have seen a 40% decrease in plastic bag litter in our parks and streets. This proves that environmental legislation can successfully change citizen behavior and protect our environment.",
                "answer_choices": [
                    {
                        "label": "A",
                        "text": "The argument fails to consider that citizens might have simply switched to using paper bags instead of reusable bags."
                    },
                    {
                        "label": "B", 
                        "text": "The argument assumes that the reduction in plastic bag litter is entirely due to the ban rather than other possible causes."
                    },
                    {
                        "label": "C",
                        "text": "The argument draws a general conclusion about environmental legislation based on a single example."
                    },
                    {
                        "label": "D",
                        "text": "The argument fails to address the economic impact of the plastic bag ban on local businesses."
                    },
                    {
                        "label": "E",
                        "text": "The argument does not provide information about plastic waste reduction in areas other than parks and streets."
                    }
                ],
                "correct_answer": "C",
                "explanation": "The argument commits the flaw of hasty generalization by concluding that environmental legislation generally can change behavior based on one specific example of a plastic bag ban. While the ban may have been effective, this single case is insufficient evidence to support the broad claim about environmental legislation in general."
            }',
            '{
                "tags": ["flaw-in-reasoning", "hasty-generalization", "environmental-policy", "causation"],
                "source": "manual_insert",
                "version": "1.0"
            }'
        );
        
        RAISE NOTICE '✅ Successfully inserted lr-flaw-001';
    END IF;
    
    -- Verify the question was added
    IF EXISTS(SELECT 1 FROM public.questions WHERE tenant_id = v_tenant_id AND question_id = 'lr-flaw-001') THEN
        RAISE NOTICE '✅ Verification: lr-flaw-001 now exists in database';
    ELSE
        RAISE NOTICE '❌ Error: lr-flaw-001 still missing';
    END IF;
    
END $$;

-- Show the question content to verify
SELECT 
    question_id,
    section,
    subsection,
    difficulty_level,
    content->>'question_text' as question_preview
FROM public.questions
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
AND question_id = 'lr-flaw-001';