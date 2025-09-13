-- Supabase Seed File
-- Automatically runs after migrations in development

-- Import helper function for seeding
CREATE OR REPLACE FUNCTION seed_questions() RETURNS void AS $$
BEGIN
    -- Check if questions already exist
    IF EXISTS (SELECT 1 FROM questions LIMIT 1) THEN
        RAISE NOTICE 'Questions already seeded, skipping...';
        RETURN;
    END IF;
    
    -- Seed data will be inserted here by build process
    RAISE NOTICE 'Seeding questions...';
    
    -- This would be populated by your build pipeline
    -- INSERT INTO questions (...) VALUES (...);
    
    RAISE NOTICE 'Seeding complete!';
END;
$$ LANGUAGE plpgsql;

-- Run seed function
SELECT seed_questions();