#!/usr/bin/env python3
"""
Migration Script: JSON Questions to Database
Migrates all 960 LSAT questions from JSON files to Supabase using REST API
"""

import json
import os
import sys
import requests
from typing import Dict, List, Any
import uuid
from datetime import datetime

# Supabase configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://kptfedjloznfgvlocthf.supabase.com')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdGZlZGpsb3puZmd2bG9jdGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0NTYzMSwiZXhwIjoyMDczMDIxNjMxfQ.HvFykL1-BXPjskwUFk5_d0uWu3o1oAmy8bppeu3B4-Q')

# Headers for Supabase REST API
HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Path to LSAT questions
QUESTIONS_DIR = '/Users/awill314/Development/Mellowise_app/docs/question_formatting/LSAT_Questions'

class QuestionMigrator:
    def __init__(self):
        self.stats = {
            'files_processed': 0,
            'questions_migrated': 0,
            'errors': 0,
            'skipped': 0
        }

    def test_connection(self):
        """Test Supabase connection"""
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/",
                headers=HEADERS
            )
            if response.status_code == 200:
                print("✅ Supabase connection established")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    def verify_tables(self):
        """Verify required tables exist"""
        try:
            # Check if questions table exists by querying it
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/questions?select=id&limit=1",
                headers=HEADERS
            )
            if response.status_code == 200:
                print("✅ Required database tables found")
                return True
            else:
                print("❌ Questions table not found. Please run database migrations first.")
                return False
        except Exception as e:
            print(f"❌ Table verification failed: {e}")
            return False

    def get_tenant_id(self):
        """Get or create default tenant for migration"""
        try:
            # Check if default tenant exists
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/tenants?name=eq.Mellowise Demo&select=id&limit=1",
                headers=HEADERS
            )
            
            if response.status_code == 200 and response.json():
                tenant_id = response.json()[0]['id']
                print(f"✅ Using existing tenant: {tenant_id}")
            else:
                # Create default tenant
                tenant_id = str(uuid.uuid4())
                tenant_data = {
                    'id': tenant_id,
                    'name': 'Mellowise Demo',
                    'type': 'demo',
                    'created_at': datetime.now().isoformat()
                }
                
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/tenants",
                    headers=HEADERS,
                    json=tenant_data
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ Created default tenant: {tenant_id}")
                else:
                    print(f"❌ Failed to create tenant: {response.status_code} - {response.text}")
                    return None
            
            return tenant_id
        except Exception as e:
            print(f"❌ Tenant setup failed: {e}")
            return None

    def get_exam_type_id(self, tenant_id: str):
        """Get or create LSAT exam type"""
        try:
            # Check if LSAT exam type exists
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/exam_types?tenant_id=eq.{tenant_id}&name=eq.LSAT&select=id&limit=1",
                headers=HEADERS
            )
            
            if response.status_code == 200 and response.json():
                exam_type_id = response.json()[0]['id']
                print(f"✅ Using existing LSAT exam type: {exam_type_id}")
            else:
                # Create LSAT exam type
                exam_type_id = str(uuid.uuid4())
                scoring_config = {
                    "total_questions": 100,
                    "time_limit": 210,  # 3.5 hours in minutes
                    "sections": ["Logical Reasoning", "Reading Comprehension", "Writing Sample"],
                    "difficulty_range": [1, 10],
                    "points_formula": "10 + (difficulty-1) * 5"
                }
                
                exam_type_data = {
                    'tenant_id': tenant_id,
                    'id': exam_type_id,
                    'name': 'LSAT',
                    'description': 'Law School Admission Test',
                    'scoring_config': scoring_config,
                    'created_at': datetime.now().isoformat()
                }
                
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/exam_types",
                    headers=HEADERS,
                    json=exam_type_data
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ Created LSAT exam type: {exam_type_id}")
                else:
                    print(f"❌ Failed to create exam type: {response.status_code} - {response.text}")
                    return None
            
            return exam_type_id
        except Exception as e:
            print(f"❌ Exam type setup failed: {e}")
            return None

    def migrate_question(self, question_data: Dict[str, Any], tenant_id: str, exam_type_id: str):
        """Migrate a single question to database"""
        try:
            # Extract required fields
            question_id = question_data['question_id']
            content = question_data['content']
            
            # Check if question already exists
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/questions?tenant_id=eq.{tenant_id}&question_id=eq.{question_id}&select=id&limit=1",
                headers=HEADERS
            )
            
            if response.status_code == 200 and response.json():
                print(f"⏭️  Question {question_id} already exists, skipping")
                self.stats['skipped'] += 1
                return True
            
            # Insert question
            db_question_id = str(uuid.uuid4())
            question_record = {
                'tenant_id': tenant_id,
                'id': db_question_id,
                'question_id': question_id,
                'exam_type_id': exam_type_id,
                'section': question_data['section'],
                'subsection': question_data['subsection'],
                'difficulty_level': question_data['difficulty'],
                'content': content,
                'metadata': {
                    'tags': question_data.get('tags', []),
                    'source': 'migration_json',
                    'version': '1.0'
                },
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/questions",
                headers=HEADERS,
                json=question_record
            )
            
            if response.status_code in [200, 201]:
                self.stats['questions_migrated'] += 1
                return True
            else:
                print(f"❌ Failed to insert question {question_id}: {response.status_code} - {response.text}")
                self.stats['errors'] += 1
                return False
            
        except Exception as e:
            print(f"❌ Failed to migrate question {question_data.get('question_id', 'unknown')}: {e}")
            self.stats['errors'] += 1
            return False

    def migrate_file(self, filepath: str, tenant_id: str, exam_type_id: str):
        """Migrate all questions from a JSON file"""
        try:
            filename = os.path.basename(filepath)
            print(f"\n📄 Processing file: {filename}")
            
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            questions = data.get('questions', [])
            print(f"📊 Found {len(questions)} questions")
            
            for i, question in enumerate(questions, 1):
                success = self.migrate_question(question, tenant_id, exam_type_id)
                if success and i % 10 == 0:
                    print(f"✅ Processed {i}/{len(questions)} questions")
                    
            self.stats['files_processed'] += 1
            print(f"✅ Completed file: {filename}")
            
        except Exception as e:
            print(f"❌ Failed to process file {filepath}: {e}")
            self.stats['errors'] += 1

    def run_migration(self):
        """Execute the complete migration process"""
        print("🚀 Starting LSAT Questions Database Migration")
        print("=" * 60)
        
        # Test connection
        if not self.test_connection():
            return False
            
        # Verify tables exist
        if not self.verify_tables():
            return False
        
        try:
            # Setup tenant and exam type
            tenant_id = self.get_tenant_id()
            if not tenant_id:
                return False
                
            exam_type_id = self.get_exam_type_id(tenant_id)
            if not exam_type_id:
                return False
            
            # Get all JSON files
            json_files = []
            for filename in os.listdir(QUESTIONS_DIR):
                if filename.endswith('.json'):
                    json_files.append(os.path.join(QUESTIONS_DIR, filename))
            
            json_files.sort()  # Process in alphabetical order
            print(f"\n📁 Found {len(json_files)} JSON files to process")
            
            # Process each file
            for filepath in json_files:
                self.migrate_file(filepath, tenant_id, exam_type_id)
            
            # Print statistics
            self.print_statistics()
            
            return True
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False

    def print_statistics(self):
        """Print migration statistics"""
        print("\n" + "=" * 60)
        print("🎉 Migration Complete!")
        print("=" * 60)
        print(f"📄 Files processed: {self.stats['files_processed']}")
        print(f"📝 Questions migrated: {self.stats['questions_migrated']}")
        print(f"⏭️  Questions skipped: {self.stats['skipped']}")
        print(f"❌ Errors: {self.stats['errors']}")
        
        if self.stats['errors'] == 0:
            print("✅ All questions successfully migrated!")
        else:
            print(f"⚠️  Migration completed with {self.stats['errors']} errors")

def main():
    """Main execution function"""
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h']:
        print("LSAT Questions Database Migration Script")
        print("Usage: python migrate-questions-to-db.py")
        print("\nEnvironment Variables:")
        print("  SUPABASE_DB_HOST - Database host")
        print("  SUPABASE_DB_NAME - Database name")
        print("  SUPABASE_DB_USER - Database user")
        print("  SUPABASE_DB_PASSWORD - Database password")
        print("  SUPABASE_DB_PORT - Database port")
        return
    
    # Verify questions directory exists
    if not os.path.exists(QUESTIONS_DIR):
        print(f"❌ Questions directory not found: {QUESTIONS_DIR}")
        sys.exit(1)
    
    # Run migration
    migrator = QuestionMigrator()
    success = migrator.run_migration()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()