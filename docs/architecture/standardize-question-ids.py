#!/usr/bin/env python3
"""
LSAT Question ID Standardization Script
Fixes ID collisions and standardizes format across all 960 questions

Format: [section]-[subsection_code]-[###]
Author: Winston - System Architect
"""

import json
import os
import uuid
from pathlib import Path

# Base directory for LSAT questions
QUESTIONS_DIR = "/Users/awill314/Development/Mellowise_app/docs/question_formatting/LSAT_Questions"

# Standardized subsection code mapping
SUBSECTION_CODES = {
    # Logical Reasoning (lr-)
    "Logical Reasoning": {
        "Assumption": "lr-assum",
        "Strengthen": "lr-str",  # Already correct
        "Weaken": "lr-wk",      # Already correct  
        "Flaw in Reasoning": "lr-flaw",
        "Inference / Must Be True": "lr-infmbt",  # Changed to avoid collision
        "Point at Issue / Agreement": "lr-poi",
        "Method of Reasoning": "lr-method",
        "Role of a Statement": "lr-role",
        "Parallel Reasoning": "lr-preas",  # Changed to avoid collision
        "Parallel Flaw": "lr-pflw",
        "Principle Support": "lr-psup",
        "Principle Application": "lr-papp",
        "Paradox / Resolve-Explain": "lr-paradx"  # Changed to avoid collision
    },
    
    # Reading Comprehension (rc-)
    "Reading Comprehension": {
        "Main Point": "rc-main",           # Already correct
        "Primary Purpose": "rc-pp",        # Already correct
        "Author's Attitude / Tone": "rc-att",
        "Passage Organization / Structure": "rc-org",
        "Specific Detail": "rc-det",
        "Inference": "rc-inf",
        "Function / Role of Statement": "rc-func",
        "Comparative Passage Analysis": "rc-comp"
    },
    
    # Writing Sample (ws-)
    "Writing Sample": {
        "Prompt Text": "ws-prompt",
        "Perspectives": "ws-persp",
        "Student Response": "ws-resp"
    }
}

def get_standardized_code(section, subsection):
    """Get the standardized code for a section/subsection combination"""
    return SUBSECTION_CODES.get(section, {}).get(subsection, f"{section.lower()[:2]}-{subsection.lower()[:4]}")

def standardize_question_ids():
    """Standardize all question IDs across all JSON files"""
    
    questions_path = Path(QUESTIONS_DIR)
    if not questions_path.exists():
        print(f"❌ Error: Directory {QUESTIONS_DIR} does not exist")
        return
    
    files_processed = 0
    total_questions_updated = 0
    
    print("🔧 Starting LSAT Question ID Standardization...")
    print("=" * 60)
    
    # Process each JSON file
    for json_file in questions_path.glob("*.json"):
        if json_file.name in ['lsat_taxonomy_2025.json', 'universal_question_schema.json']:
            continue
            
        print(f"\n📄 Processing: {json_file.name}")
        
        try:
            # Load the JSON file
            with open(json_file, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            
            if not isinstance(questions, list):
                print(f"⚠️  Skipping {json_file.name}: Not a question array")
                continue
            
            questions_in_file = len(questions)
            updated_count = 0
            
            # Process each question in the file
            for i, question in enumerate(questions):
                if not isinstance(question, dict):
                    continue
                    
                # Get section and subsection
                section = question.get('section', '')
                subsection = question.get('subsection', '')
                
                if not section or not subsection:
                    print(f"⚠️  Question {i+1}: Missing section/subsection")
                    continue
                
                # Generate standardized ID
                code = get_standardized_code(section, subsection)
                new_id = f"{code}-{i+1:03d}"
                old_id = question.get('question_id', 'missing')
                
                # Update the question ID
                question['question_id'] = new_id
                
                # Track if this was a change
                if old_id != new_id:
                    updated_count += 1
                    if updated_count <= 3:  # Show first few changes as examples
                        print(f"  ✏️  Q{i+1:02d}: {old_id} → {new_id}")
            
            # Save the updated file
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(questions, f, indent=2, ensure_ascii=False)
            
            print(f"  ✅ Updated {updated_count}/{questions_in_file} question IDs")
            files_processed += 1
            total_questions_updated += updated_count
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON Error in {json_file.name}: {e}")
        except Exception as e:
            print(f"❌ Error processing {json_file.name}: {e}")
    
    print("\n" + "=" * 60)
    print(f"🎉 Standardization Complete!")
    print(f"📊 Files processed: {files_processed}")
    print(f"🔄 Questions updated: {total_questions_updated}")
    print(f"✅ All question IDs now follow format: [section]-[code]-[###]")
    
    # Verify no duplicates exist
    verify_no_duplicates()

def verify_no_duplicates():
    """Verify that no duplicate question IDs exist across all files"""
    print("\n🔍 Verifying no duplicate IDs exist...")
    
    all_ids = set()
    duplicate_ids = set()
    
    questions_path = Path(QUESTIONS_DIR)
    
    for json_file in questions_path.glob("*.json"):
        if json_file.name in ['lsat_taxonomy_2025.json', 'universal_question_schema.json']:
            continue
            
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            
            for question in questions:
                if isinstance(question, dict):
                    qid = question.get('question_id')
                    if qid:
                        if qid in all_ids:
                            duplicate_ids.add(qid)
                        else:
                            all_ids.add(qid)
        
        except Exception as e:
            print(f"⚠️  Error checking {json_file.name}: {e}")
    
    if duplicate_ids:
        print(f"❌ Found {len(duplicate_ids)} duplicate IDs:")
        for dup_id in sorted(duplicate_ids):
            print(f"   - {dup_id}")
    else:
        print(f"✅ No duplicates found! All {len(all_ids)} question IDs are unique")

def generate_summary_report():
    """Generate a summary report of all question IDs"""
    print("\n📋 Generating Summary Report...")
    
    questions_path = Path(QUESTIONS_DIR)
    report = {}
    total_questions = 0
    
    for json_file in questions_path.glob("*.json"):
        if json_file.name in ['lsat_taxonomy_2025.json', 'universal_question_schema.json']:
            continue
            
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            
            file_info = {
                'file': json_file.name,
                'count': len(questions),
                'first_id': questions[0].get('question_id', 'N/A') if questions else 'N/A',
                'last_id': questions[-1].get('question_id', 'N/A') if questions else 'N/A',
                'section': questions[0].get('section', 'N/A') if questions else 'N/A',
                'subsection': questions[0].get('subsection', 'N/A') if questions else 'N/A'
            }
            
            report[json_file.name] = file_info
            total_questions += len(questions)
            
        except Exception as e:
            print(f"⚠️  Error reading {json_file.name}: {e}")
    
    # Print summary
    print(f"\n📊 LSAT Question Database Summary:")
    print(f"Total Files: {len(report)}")
    print(f"Total Questions: {total_questions}")
    print("\nFile Details:")
    print("-" * 80)
    
    for filename, info in sorted(report.items()):
        print(f"{filename:<50} | {info['count']:>3} questions | {info['first_id']} to {info['last_id']}")
    
    return report

if __name__ == "__main__":
    # Run the standardization
    standardize_question_ids()
    
    # Generate final report
    generate_summary_report()
    
    print("\n🚀 Ready for database migration!")