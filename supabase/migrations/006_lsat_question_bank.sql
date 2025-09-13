-- LSAT Question Bank Implementation
-- Version: 1.0  
-- Created: 2025-01-10
-- Author: Dev Agent James
-- Builds on: Universal Exam System (migration 004)

-- ============================================================================
-- LSAT-SPECIFIC EXAM TYPE AND CATEGORIES
-- ============================================================================

-- Insert LSAT as exam type for all tenants (will be used by Mellowise platform)
INSERT INTO public.exam_types (tenant_id, id, name, slug, description, scoring_config, timing_config, difficulty_mix, status)
SELECT 
    t.id as tenant_id,
    uuid_generate_v4() as id,
    'LSAT' as name,
    'lsat' as slug,
    'Law School Admission Test - Comprehensive legal reasoning assessment' as description,
    '{
        "min_score": 120,
        "max_score": 180,
        "sections": [
            {"name": "Logical Reasoning", "questions": 50, "weight": 0.5},
            {"name": "Logic Games", "questions": 22, "weight": 0.25}, 
            {"name": "Reading Comprehension", "questions": 26, "weight": 0.25}
        ],
        "scoring_method": "scaled"
    }' as scoring_config,
    '{
        "total_time": 180,
        "sections": [
            {"name": "Logical Reasoning 1", "time": 35, "questions": 25},
            {"name": "Logic Games", "time": 35, "questions": 22},
            {"name": "Logical Reasoning 2", "time": 35, "questions": 25},
            {"name": "Reading Comprehension", "time": 35, "questions": 26},
            {"name": "Experimental", "time": 35, "questions": 25}
        ],
        "time_warnings": [5, 1]
    }' as timing_config,
    '{"easy": 0.3, "medium": 0.5, "hard": 0.2}' as difficulty_mix,
    'active' as status
FROM public.tenants t;

-- Get LSAT exam type ID for category insertion (assuming single tenant for now)
DO $$
DECLARE
    lsat_exam_id UUID;
    tenant_uuid UUID;
BEGIN
    -- Get first tenant and LSAT exam type
    SELECT t.id, et.id INTO tenant_uuid, lsat_exam_id 
    FROM public.tenants t
    JOIN public.exam_types et ON et.tenant_id = t.id 
    WHERE et.slug = 'lsat' 
    LIMIT 1;

    -- Insert LSAT Categories
    INSERT INTO public.exam_categories (tenant_id, id, exam_type_id, name, slug, description, parent_category_id, sort_order, blueprint_config, performance_indicators, is_active) VALUES
    
    -- Main Sections
    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Logical Reasoning', 'logical-reasoning', 'Arguments, assumptions, and logical structure analysis', NULL, 1,
     '{"beginner": 25, "intermediate": 35, "advanced": 50}',
     '[
         {"code": "LR:001", "description": "Identify argument structure", "cognitive_level": "analysis"},
         {"code": "LR:002", "description": "Recognize assumptions", "cognitive_level": "analysis"},
         {"code": "LR:003", "description": "Strengthen/weaken arguments", "cognitive_level": "application"},
         {"code": "LR:004", "description": "Identify logical flaws", "cognitive_level": "analysis"}
     ]', true),
     
    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Logic Games', 'logic-games', 'Analytical reasoning with constraints and rules', NULL, 2,
     '{"beginner": 12, "intermediate": 18, "advanced": 22}',
     '[
         {"code": "LG:001", "description": "Setup game board correctly", "cognitive_level": "application"},
         {"code": "LG:002", "description": "Make valid inferences", "cognitive_level": "analysis"},
         {"code": "LG:003", "description": "Handle complex constraints", "cognitive_level": "synthesis"},
         {"code": "LG:004", "description": "Optimize solution strategy", "cognitive_level": "synthesis"}
     ]', true),
     
    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Reading Comprehension', 'reading-comprehension', 'Complex passage analysis and interpretation', NULL, 3,
     '{"beginner": 16, "intermediate": 22, "advanced": 26}',
     '[
         {"code": "RC:001", "description": "Main idea identification", "cognitive_level": "recall"},
         {"code": "RC:002", "description": "Detail comprehension", "cognitive_level": "recall"},
         {"code": "RC:003", "description": "Inference and implication", "cognitive_level": "analysis"},
         {"code": "RC:004", "description": "Author tone and purpose", "cognitive_level": "analysis"}
     ]', true);

    -- Get category IDs for subcategories
    DECLARE
        lr_category_id UUID;
        lg_category_id UUID;
        rc_category_id UUID;
    BEGIN
        SELECT id INTO lr_category_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'logical-reasoning';
        SELECT id INTO lg_category_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'logic-games';
        SELECT id INTO rc_category_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'reading-comprehension';

        -- Logical Reasoning Subcategories
        INSERT INTO public.exam_categories (tenant_id, id, exam_type_id, name, slug, description, parent_category_id, sort_order, blueprint_config, performance_indicators, is_active) VALUES
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Strengthen/Weaken', 'strengthen-weaken', 'Questions that ask to strengthen or weaken arguments', lr_category_id, 1, '{"beginner": 8, "intermediate": 12, "advanced": 15}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Assumption', 'assumption', 'Identify necessary and sufficient assumptions', lr_category_id, 2, '{"beginner": 6, "intermediate": 10, "advanced": 12}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Parallel Reasoning', 'parallel-reasoning', 'Find arguments with parallel logical structure', lr_category_id, 3, '{"beginner": 4, "intermediate": 6, "advanced": 8}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Flaw', 'flaw', 'Identify logical fallacies and reasoning errors', lr_category_id, 4, '{"beginner": 5, "intermediate": 8, "advanced": 10}', '[]', true),

        -- Logic Games Subcategories  
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Sequencing Games', 'sequencing', 'Linear and complex ordering problems', lg_category_id, 1, '{"beginner": 4, "intermediate": 6, "advanced": 8}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Grouping Games', 'grouping', 'Selection and distribution problems', lg_category_id, 2, '{"beginner": 4, "intermediate": 6, "advanced": 7}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Matching Games', 'matching', 'Assignment and correspondence problems', lg_category_id, 3, '{"beginner": 2, "intermediate": 3, "advanced": 4}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Hybrid Games', 'hybrid', 'Combined sequencing and grouping elements', lg_category_id, 4, '{"beginner": 2, "intermediate": 3, "advanced": 3}', '[]', true),

        -- Reading Comprehension Subcategories
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Science Passages', 'science', 'Natural and social science texts', rc_category_id, 1, '{"beginner": 4, "intermediate": 6, "advanced": 7}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Humanities Passages', 'humanities', 'Literature, arts, and cultural texts', rc_category_id, 2, '{"beginner": 4, "intermediate": 6, "advanced": 7}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Law Passages', 'law', 'Legal concepts and judicial reasoning', rc_category_id, 3, '{"beginner": 4, "intermediate": 5, "advanced": 6}', '[]', true),
        (tenant_uuid, uuid_generate_v4(), lsat_exam_id, 'Comparative Passages', 'comparative', 'Dual passages with contrasting viewpoints', rc_category_id, 4, '{"beginner": 4, "intermediate": 5, "advanced": 6}', '[]', true);
    END;
END;
$$;

-- ============================================================================
-- SAMPLE LSAT QUESTIONS
-- ============================================================================

-- Insert sample LSAT questions (building on universal question schema)
-- Note: These are sample questions for development - real questions would be licensed

DO $$
DECLARE
    tenant_uuid UUID;
    lsat_exam_id UUID;
    lr_category_id UUID;
    lg_category_id UUID;
    rc_category_id UUID;
    strengthen_cat_id UUID;
BEGIN
    -- Get IDs
    SELECT t.id INTO tenant_uuid FROM public.tenants t LIMIT 1;
    SELECT id INTO lsat_exam_id FROM public.exam_types WHERE tenant_id = tenant_uuid AND slug = 'lsat';
    SELECT id INTO lr_category_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'logical-reasoning';
    SELECT id INTO lg_category_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'logic-games';
    SELECT id INTO rc_category_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'reading-comprehension';
    SELECT id INTO strengthen_cat_id FROM public.exam_categories WHERE tenant_id = tenant_uuid AND slug = 'strengthen-weaken';

    -- Sample Logical Reasoning Questions
    INSERT INTO public.questions_universal (tenant_id, id, exam_type_id, category_id, content, question_type, subtype, difficulty, difficulty_level, estimated_time, cognitive_level, correct_answer, answer_choices, explanation, concept_tags, performance_indicators, source_attribution, is_active, usage_count) VALUES
    
    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, strengthen_cat_id,
     'Mayor: Our city''s public transportation system is inadequate. The buses run infrequently, and many routes have been eliminated. As a result, more people are driving cars, which increases traffic congestion and air pollution.

City Council Member: But ridership on public transportation has declined significantly over the past five years. This shows that people prefer to drive rather than take public transportation.

Which one of the following, if true, would most strengthen the mayor''s position?',
     'strengthen', 'argument_strengthen', 6, 'medium', 90, 'analysis', 'B',
     '[
         {"id": "A", "text": "The city has a lower population density than most cities with effective public transportation systems."},
         {"id": "B", "text": "The decline in ridership began only after the city started eliminating bus routes and reducing service frequency."},
         {"id": "C", "text": "Most people who drive to work live in areas not served by public transportation."},
         {"id": "D", "text": "The city''s public transportation system was more heavily used ten years ago than it is today."},
         {"id": "E", "text": "Studies show that people generally prefer the convenience of driving their own cars."}
     ]',
     'Answer B strengthens the mayor''s position by suggesting that the decline in ridership was caused by the inadequate service (eliminating routes and reducing frequency), rather than people simply preferring to drive. This supports the mayor''s claim that the transportation system''s inadequacy is the problem, not people''s preferences.',
     '["causal_reasoning", "strengthen_argument", "public_policy"]',
     '["LR:003"]', 'Mellowise Sample Question - LSAT Style', true, 0),

    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, lr_category_id,
     'Advertisement: Studies show that people who eat chocolate regularly have lower rates of heart disease than those who do not eat chocolate regularly. Therefore, eating chocolate prevents heart disease.

The reasoning in the advertisement is flawed because it',
     'flaw', 'logical_flaw', 5, 'medium', 75, 'analysis', 'C',
     '[
         {"id": "A", "text": "relies on studies that may not be scientifically reliable"},
         {"id": "B", "text": "assumes that what is true of a group is true of individuals in that group"},
         {"id": "C", "text": "treats a correlation as evidence of a causal relationship"},
         {"id": "D", "text": "fails to consider that eating chocolate may have negative health effects"},
         {"id": "E", "text": "generalizes from a sample that may not be representative"}
     ]',
     'The advertisement commits the classic error of confusing correlation with causation. Just because chocolate eaters have lower rates of heart disease doesn''t mean chocolate prevents heart disease - there could be other factors involved.',
     '["correlation_causation", "logical_fallacies", "health_claims"]',
     '["LR:004"]', 'Mellowise Sample Question - LSAT Style', true, 0);

    -- Sample Logic Games Question
    INSERT INTO public.questions_universal (tenant_id, id, exam_type_id, category_id, content, question_type, subtype, difficulty, difficulty_level, estimated_time, cognitive_level, correct_answer, answer_choices, explanation, concept_tags, performance_indicators, source_attribution, is_active, usage_count) VALUES
    
    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, lg_category_id,
     'A company is scheduling presentations by six employees—F, G, H, J, K, and L—over three days: Monday, Tuesday, and Wednesday. Each day, exactly two presentations will be given, one in the morning and one in the afternoon. The following constraints apply:

• F''s presentation must be scheduled for a morning.
• G''s presentation must be scheduled for the same day as H''s presentation.
• J''s presentation must be scheduled for the day immediately before K''s presentation.
• L''s presentation cannot be scheduled for Wednesday.

If F''s presentation is scheduled for Tuesday morning, which one of the following could be true?',
     'sequencing', 'linear_ordering', 7, 'medium', 120, 'analysis', 'D',
     '[
         {"id": "A", "text": "G''s presentation is scheduled for Monday morning."},
         {"id": "B", "text": "H''s presentation is scheduled for Wednesday afternoon."},
         {"id": "C", "text": "J''s presentation is scheduled for Wednesday morning."},
         {"id": "D", "text": "K''s presentation is scheduled for Wednesday afternoon."},
         {"id": "E", "text": "L''s presentation is scheduled for Tuesday afternoon."}
     ]',
     'Working through the constraints: If F is Tuesday morning, then Tuesday afternoon is available. Since J must come immediately before K, and L cannot be Wednesday, we can place J Monday and K Tuesday afternoon, or J Tuesday afternoon and K Wednesday. Option D works if J is Tuesday afternoon and K is Wednesday afternoon.',
     '["constraint_satisfaction", "sequencing", "logical_deduction"]',
     '["LG:002"]', 'Mellowise Sample Question - LSAT Style', true, 0);

    -- Sample Reading Comprehension Question
    INSERT INTO public.questions_universal (tenant_id, id, exam_type_id, category_id, content, question_type, subtype, difficulty, difficulty_level, estimated_time, cognitive_level, correct_answer, answer_choices, explanation, concept_tags, performance_indicators, source_attribution, is_active, usage_count) VALUES
    
    (tenant_uuid, uuid_generate_v4(), lsat_exam_id, rc_category_id,
     'Recent advances in neuroscience have challenged traditional views of consciousness. Rather than being a single, unified experience, consciousness appears to be composed of multiple, parallel processes that create the illusion of a seamless, integrated awareness. This modular view suggests that different aspects of consciousness—such as visual processing, language comprehension, and emotional responses—operate independently and are only later integrated into what we experience as a coherent mental state.

This research has profound implications for our understanding of mental disorders. Conditions such as schizophrenia and dissociative identity disorder may result from disruptions in the integration process rather than from problems with individual consciousness modules. If this modular theory is correct, treatments could focus on repairing the integration mechanisms rather than targeting specific symptoms.

Which one of the following most accurately expresses the main point of the passage?',
     'reading_comprehension', 'main_point', 4, 'medium', 90, 'recall', 'B',
     '[
         {"id": "A", "text": "Neuroscience research has definitively proven that consciousness is modular rather than unified."},
         {"id": "B", "text": "New research suggesting consciousness is modular rather than unified could change how we understand and treat mental disorders."},
         {"id": "C", "text": "Mental disorders are caused by problems with consciousness integration rather than with individual brain modules."},
         {"id": "D", "text": "The traditional view of consciousness as unified has been completely discredited by recent neuroscience research."},
         {"id": "E", "text": "Treatments for mental disorders should focus on integration mechanisms rather than individual symptoms."}
     ]',
     'The passage presents new research suggesting a modular view of consciousness and discusses its potential implications for understanding and treating mental disorders. Option B captures both the research findings and their potential implications without overstating the certainty.',
     '["neuroscience", "consciousness", "mental_health", "main_point"]',
     '["RC:001"]', 'Mellowise Sample Question - LSAT Style', true, 0);

END;
$$;

-- ============================================================================
-- LSAT-SPECIFIC VIEWS AND FUNCTIONS
-- ============================================================================

-- View for easy LSAT question retrieval
CREATE VIEW public.lsat_questions AS
SELECT 
    q.*,
    et.name as exam_name,
    c.name as category_name,
    c.slug as category_slug,
    CASE 
        WHEN q.difficulty <= 3 THEN 'Easy'
        WHEN q.difficulty <= 7 THEN 'Medium' 
        ELSE 'Hard'
    END as difficulty_display
FROM public.questions_universal q
JOIN public.exam_types et ON q.exam_type_id = et.id
JOIN public.exam_categories c ON q.category_id = c.id
WHERE et.slug = 'lsat' AND q.is_active = true;

-- Function to get random LSAT question by difficulty and category
CREATE OR REPLACE FUNCTION public.get_random_lsat_question(
    p_tenant_id UUID,
    p_difficulty_level TEXT DEFAULT NULL,
    p_category_slug TEXT DEFAULT NULL,
    p_exclude_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS TABLE (
    question_id UUID,
    content TEXT,
    question_type TEXT,
    difficulty INTEGER,
    correct_answer TEXT,
    answer_choices JSONB,
    explanation TEXT,
    category_name TEXT,
    estimated_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.content,
        q.question_type,
        q.difficulty,
        q.correct_answer,
        q.answer_choices,
        q.explanation,
        c.name,
        q.estimated_time
    FROM public.questions_universal q
    JOIN public.exam_types et ON q.exam_type_id = et.id
    JOIN public.exam_categories c ON q.category_id = c.id
    WHERE q.tenant_id = p_tenant_id
      AND et.slug = 'lsat'
      AND q.is_active = true
      AND (p_difficulty_level IS NULL OR q.difficulty_level = p_difficulty_level)
      AND (p_category_slug IS NULL OR c.slug = p_category_slug)
      AND NOT (q.id = ANY(p_exclude_ids))
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update question usage statistics
CREATE OR REPLACE FUNCTION public.track_question_attempt(
    p_tenant_id UUID,
    p_question_id UUID,
    p_user_id UUID,
    p_selected_answer TEXT,
    p_is_correct BOOLEAN,
    p_response_time INTEGER DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update question usage count
    UPDATE public.questions_universal 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id AND id = p_question_id;
    
    -- Insert attempt record
    INSERT INTO public.question_attempts_universal (
        tenant_id, id, user_id, question_id, session_id, exam_type_id, category_id,
        selected_answer, is_correct, response_time, attempted_at, hint_used, 
        difficulty_at_attempt, confidence_level
    )
    SELECT 
        p_tenant_id,
        uuid_generate_v4(),
        p_user_id,
        p_question_id,
        p_session_id,
        q.exam_type_id,
        q.category_id,
        p_selected_answer,
        p_is_correct,
        p_response_time,
        NOW(),
        false,
        q.difficulty,
        NULL
    FROM public.questions_universal q
    WHERE q.tenant_id = p_tenant_id AND q.id = p_question_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Optimize LSAT question queries
CREATE INDEX idx_questions_lsat_difficulty ON public.questions_universal(tenant_id, difficulty_level) 
    WHERE is_active = true;
    
CREATE INDEX idx_questions_lsat_category ON public.questions_universal(tenant_id, category_id) 
    WHERE is_active = true;
    
CREATE INDEX idx_questions_lsat_usage ON public.questions_universal(tenant_id, usage_count, created_at);

-- Optimize question attempts for analytics
CREATE INDEX idx_attempts_lsat_user_performance ON public.question_attempts_universal(tenant_id, user_id, is_correct, attempted_at);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW public.lsat_questions IS 'Simplified view for LSAT question retrieval with category information';
COMMENT ON FUNCTION public.get_random_lsat_question IS 'Returns random LSAT question with filtering by difficulty and category';
COMMENT ON FUNCTION public.track_question_attempt IS 'Records question attempt and updates usage statistics';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'LSAT Question Bank migration completed successfully!';
    RAISE NOTICE 'Sample questions inserted for Logical Reasoning, Logic Games, and Reading Comprehension';
    RAISE NOTICE 'Ready for MELLOWISE-005 Survival Mode implementation';
END;
$$;