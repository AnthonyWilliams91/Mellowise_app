#!/usr/bin/env python3
"""
Generate SQL Migration Script from JSON Questions
Reads all 960 LSAT questions and generates SQL INSERT statements
"""

import json
import os
from pathlib import Path

# Configuration
QUESTIONS_DIR = Path(__file__).parent / "docs/question_formatting/LSAT_Questions"
OUTPUT_FILE = Path(__file__).parent / "migrate-all-questions.sql"

def escape_sql_string(text):
    """Escape single quotes and other SQL special characters"""
    if text is None:
        return 'NULL'
    return "'" + str(text).replace("'", "''").replace("\\", "\\\\") + "'"

def jsonb_escape(obj):
    """Convert Python object to PostgreSQL JSONB format"""
    json_str = json.dumps(obj, ensure_ascii=False)
    return escape_sql_string(json_str)

def generate_question_insert(question):
    """Generate SQL INSERT statement for a single question"""
    question_id = question['question_id']
    section = question['section'] 
    subsection = question['subsection']
    
    # Handle different difficulty formats
    difficulty = question['difficulty']
    if isinstance(difficulty, dict):
        difficulty = difficulty.get('initial_estimate', 5)
    
    # Handle different content structures
    if 'choices' in question and 'response' in question:
        # Multiple choice format (LR and RC)
        content = {
            'question_text': question['question_text'],
            'answer_choices': [
                {
                    'label': choice['id'],
                    'text': choice['text']
                }
                for choice in question['choices']
            ],
            'correct_answer': question['response']['answer_key']['correct_choice_id'],
            'explanation': question['response']['explanations']['general']
        }
    else:
        # Writing Sample format (no multiple choice)
        content = {
            'question_text': question.get('question_text', ''),
            'prompt': question.get('prompt', ''),
            'instructions': question.get('instructions', ''),
            'response_type': 'essay'
        }
    
    # Get tags from metadata if available
    tags = question.get('tags', [])
    if 'metadata' in question and 'tags' in question['metadata']:
        tags = question['metadata']['tags']
    
    return f"""SELECT insert_lsat_question(
    {escape_sql_string(question_id)},
    {escape_sql_string(section)},
    {escape_sql_string(subsection)},
    {difficulty},
    {jsonb_escape(content)},
    ARRAY{tags}::TEXT[]
);"""

def main():
    print("🚀 Generating SQL migration from JSON files...")
    
    # Start SQL file
    sql_lines = [
        "-- ============================================================================",
        "-- COMPLETE LSAT QUESTIONS MIGRATION",
        "-- Generated from JSON files - 960 questions across 24 subsections", 
        "-- ============================================================================",
        "",
        "-- Include setup from migrate-questions.sql first",
        "\\i migrate-questions.sql;",
        "",
        "-- Migration Statistics",
        "DO $$",
        "BEGIN",
        "    RAISE NOTICE 'Starting migration of 960 LSAT questions...';",
        "END $$;",
        ""
    ]
    
    files_processed = 0
    total_questions = 0
    
    # Process each JSON file
    json_files = sorted([f for f in QUESTIONS_DIR.glob("*.json")])
    
    for json_file in json_files:
        try:
            print(f"📄 Processing {json_file.name}...")
            
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle both array format and object format
            if isinstance(data, list):
                questions = data
            else:
                questions = data.get('questions', [])
            
            sql_lines.append(f"-- {json_file.name} ({len(questions)} questions)")
            sql_lines.append("")
            
            for question in questions:
                sql_lines.append(generate_question_insert(question))
                total_questions += 1
            
            sql_lines.append("")
            files_processed += 1
            
        except Exception as e:
            print(f"❌ Error processing {json_file.name}: {e}")
            sql_lines.append(f"-- ERROR processing {json_file.name}: {e}")
            sql_lines.append("")
    
    # Add summary at end
    sql_lines.extend([
        "-- Final Summary",
        "DO $$",
        "DECLARE",
        "    final_count INTEGER;",
        "    demo_tenant_id UUID := current_setting('mellowise.demo_tenant_id', false)::UUID;",
        "BEGIN",
        "    SELECT COUNT(*) INTO final_count",
        "    FROM public.questions", 
        "    WHERE tenant_id = demo_tenant_id;",
        "",
        "    RAISE NOTICE '================================';",
        "    RAISE NOTICE 'LSAT Questions Migration Complete!';",
        f"    RAISE NOTICE 'Files processed: {files_processed}';",
        f"    RAISE NOTICE 'Questions generated: {total_questions}';",
        "    RAISE NOTICE 'Questions in database: %', final_count;",
        "    RAISE NOTICE '================================';",
        "END $$;",
        "",
        "-- Clean up helper function",
        "DROP FUNCTION IF EXISTS insert_lsat_question(TEXT, TEXT, TEXT, INTEGER, JSONB, TEXT[]);"
    ])
    
    # Write SQL file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Generated SQL migration: {OUTPUT_FILE}")
    print(f"📊 Files processed: {files_processed}")
    print(f"📝 Questions included: {total_questions}")
    print("")
    print("To run the migration:")
    print("1. Connect to your Supabase database") 
    print("2. Run: \\i migrate-all-questions.sql")
    print("3. Or execute the SQL file content directly")

if __name__ == "__main__":
    main()