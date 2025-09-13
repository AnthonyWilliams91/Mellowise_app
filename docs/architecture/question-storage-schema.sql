-- LSAT Question Storage Schema Design
-- Optimized for performance, cost, and multi-tenant architecture
-- Winston - System Architect

-- Core Questions Table
CREATE TABLE questions (
    -- Multi-tenant isolation
    tenant_id UUID NOT NULL,
    question_id UUID NOT NULL,
    
    -- Question Classification  
    exam VARCHAR(10) NOT NULL DEFAULT 'LSAT',
    section VARCHAR(50) NOT NULL, -- 'Logical Reasoning', 'Reading Comprehension', etc.
    subsection VARCHAR(100) NOT NULL, -- 'Assumption', 'Strengthen', etc.
    
    -- Performance-critical metadata (frequently queried)
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    estimated_time_sec INTEGER NOT NULL DEFAULT 90,
    question_type VARCHAR(20) NOT NULL DEFAULT 'single_choice', -- single_choice, multi_select, essay
    
    -- Content Storage (JSONB for flexibility + performance)
    question_content JSONB NOT NULL, -- Full question schema JSON
    
    -- Analytics & Performance
    times_served INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    avg_time_taken INTEGER, -- milliseconds
    last_served_at TIMESTAMPTZ,
    
    -- Administrative
    is_active BOOLEAN DEFAULT true,
    is_experimental BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    version INTEGER DEFAULT 1,
    
    -- Multi-tenant primary key
    PRIMARY KEY (tenant_id, question_id)
);

-- Performance-optimized indexes
CREATE INDEX idx_questions_section_difficulty ON questions (tenant_id, section, difficulty_level) WHERE is_active = true;
CREATE INDEX idx_questions_subsection ON questions (tenant_id, subsection) WHERE is_active = true;
CREATE INDEX idx_questions_performance ON questions (tenant_id, times_served, last_served_at) WHERE is_active = true;
CREATE INDEX idx_questions_content_search ON questions USING GIN (question_content) WHERE is_active = true;

-- Question Tags for Enhanced Filtering
CREATE TABLE question_tags (
    tenant_id UUID NOT NULL,
    question_id UUID NOT NULL,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    PRIMARY KEY (tenant_id, question_id, tag),
    FOREIGN KEY (tenant_id, question_id) REFERENCES questions(tenant_id, question_id) ON DELETE CASCADE
);

CREATE INDEX idx_question_tags_lookup ON question_tags (tenant_id, tag);

-- Question Collections (for curated sets, practice exams, etc.)
CREATE TABLE question_collections (
    tenant_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    collection_type VARCHAR(50) NOT NULL, -- 'practice_exam', 'topic_set', 'difficulty_progression'
    is_public BOOLEAN DEFAULT false,
    created_by UUID, -- user_id
    created_at TIMESTAMPTZ DEFAULT now(),
    
    PRIMARY KEY (tenant_id, collection_id)
);

CREATE TABLE collection_questions (
    tenant_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    question_id UUID NOT NULL,
    order_position INTEGER NOT NULL,
    
    PRIMARY KEY (tenant_id, collection_id, question_id),
    FOREIGN KEY (tenant_id, collection_id) REFERENCES question_collections(tenant_id, collection_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id, question_id) REFERENCES questions(tenant_id, question_id) ON DELETE CASCADE
);

-- User Question Analytics (for AI personalization)
CREATE TABLE user_question_attempts (
    tenant_id UUID NOT NULL,
    attempt_id UUID NOT NULL,
    user_id UUID NOT NULL,
    question_id UUID NOT NULL,
    
    -- Attempt Details
    selected_choice_id VARCHAR(10), -- for multiple choice
    user_response TEXT, -- for essays/short answer
    is_correct BOOLEAN,
    time_taken_ms INTEGER NOT NULL,
    
    -- Context
    game_session_id UUID, -- if from survival mode
    attempt_timestamp TIMESTAMPTZ DEFAULT now(),
    question_difficulty_at_time INTEGER, -- adaptive difficulty
    
    -- AI Insights
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    help_used BOOLEAN DEFAULT false,
    power_ups_used JSONB, -- survival mode power-ups
    
    PRIMARY KEY (tenant_id, attempt_id),
    FOREIGN KEY (tenant_id, question_id) REFERENCES questions(tenant_id, question_id)
);

-- Indexes for AI analytics and insights
CREATE INDEX idx_user_attempts_performance ON user_question_attempts (tenant_id, user_id, is_correct, attempt_timestamp);
CREATE INDEX idx_user_attempts_difficulty ON user_question_attempts (tenant_id, user_id, question_difficulty_at_time);
CREATE INDEX idx_user_attempts_time ON user_question_attempts (tenant_id, user_id, time_taken_ms);

-- Question Content Caching Strategy
CREATE TABLE question_content_cache (
    tenant_id UUID NOT NULL,
    question_id UUID NOT NULL,
    cache_key VARCHAR(100) NOT NULL, -- 'full_content', 'choices_only', 'explanation_only'
    cached_content JSONB NOT NULL,
    cache_created_at TIMESTAMPTZ DEFAULT now(),
    cache_expires_at TIMESTAMPTZ NOT NULL,
    
    PRIMARY KEY (tenant_id, question_id, cache_key),
    FOREIGN KEY (tenant_id, question_id) REFERENCES questions(tenant_id, question_id) ON DELETE CASCADE
);

CREATE INDEX idx_cache_expiry ON question_content_cache (cache_expires_at);

-- Performance Views for Common Queries
CREATE VIEW question_stats AS
SELECT 
    tenant_id,
    question_id,
    section,
    subsection,
    difficulty_level,
    CASE 
        WHEN total_attempts > 0 THEN ROUND((correct_attempts::FLOAT / total_attempts::FLOAT) * 100, 2)
        ELSE NULL 
    END as success_rate_percent,
    times_served,
    avg_time_taken,
    last_served_at
FROM questions 
WHERE is_active = true;

-- Data Migration Helper Functions
CREATE OR REPLACE FUNCTION insert_question_from_json(
    p_tenant_id UUID,
    p_question_json JSONB
) RETURNS UUID AS $$
DECLARE
    new_question_id UUID;
    tag_item TEXT;
BEGIN
    -- Extract question ID or generate new one
    new_question_id := COALESCE(
        (p_question_json->>'question_id')::UUID,
        gen_random_uuid()
    );
    
    -- Insert main question record
    INSERT INTO questions (
        tenant_id,
        question_id,
        exam,
        section,
        subsection,
        difficulty_level,
        estimated_time_sec,
        question_type,
        question_content
    ) VALUES (
        p_tenant_id,
        new_question_id,
        p_question_json->>'exam',
        p_question_json->>'section',
        p_question_json->>'subsection',
        (p_question_json->'difficulty'->>'initial_estimate')::INTEGER,
        (p_question_json->'metadata'->>'estimated_time_sec')::INTEGER,
        p_question_json->'response'->>'type',
        p_question_json
    );
    
    -- Insert tags
    IF p_question_json->'metadata'->'tags' IS NOT NULL THEN
        FOR tag_item IN SELECT jsonb_array_elements_text(p_question_json->'metadata'->'tags')
        LOOP
            INSERT INTO question_tags (tenant_id, question_id, tag) 
            VALUES (p_tenant_id, new_question_id, tag_item);
        END LOOP;
    END IF;
    
    RETURN new_question_id;
END;
$$ LANGUAGE plpgsql;

-- Performance optimization trigger
CREATE OR REPLACE FUNCTION update_question_stats() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update question statistics when new attempt is recorded
    UPDATE questions SET
        times_served = times_served + 1,
        total_attempts = total_attempts + 1,
        correct_attempts = CASE 
            WHEN NEW.is_correct THEN correct_attempts + 1 
            ELSE correct_attempts 
        END,
        avg_time_taken = COALESCE(
            (avg_time_taken * (times_served - 1) + NEW.time_taken_ms) / times_served,
            NEW.time_taken_ms
        ),
        last_served_at = NEW.attempt_timestamp,
        updated_at = now()
    WHERE tenant_id = NEW.tenant_id AND question_id = NEW.question_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON user_question_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats();

-- Comments for documentation
COMMENT ON TABLE questions IS 'Main question storage with JSONB content and performance metadata';
COMMENT ON TABLE user_question_attempts IS 'Individual question attempts for analytics and AI insights';
COMMENT ON TABLE question_collections IS 'Curated question sets for practice exams and topic focus';
COMMENT ON FUNCTION insert_question_from_json IS 'Helper function to migrate JSON files to database structure';