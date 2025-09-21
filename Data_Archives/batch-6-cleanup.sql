-- Final Summary
DO $$
DECLARE
    final_count INTEGER;
    demo_tenant_id UUID := current_setting('mellowise.demo_tenant_id', false)::UUID;
BEGIN
    SELECT COUNT(*) INTO final_count
    FROM public.questions
    WHERE tenant_id = demo_tenant_id;

    RAISE NOTICE '================================';
    RAISE NOTICE 'LSAT Questions Migration Complete!';
    RAISE NOTICE 'Files processed: 24';
    RAISE NOTICE 'Questions generated: 960';
    RAISE NOTICE 'Questions in database: %', final_count;
    RAISE NOTICE '================================';
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS insert_lsat_question(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[]);