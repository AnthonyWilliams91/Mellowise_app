#!/usr/bin/env python3
"""
Automated Question Import System
Handles JSON to database migrations automatically
"""

import json
import os
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any
import asyncio
from datetime import datetime

# Use Supabase Python client for automation
from supabase import create_client, Client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuestionImporter:
    def __init__(self, supabase_url: str, service_key: str):
        """Initialize with Supabase credentials"""
        self.client: Client = create_client(supabase_url, service_key)
        self.stats = {
            'processed': 0,
            'imported': 0,
            'skipped': 0,
            'errors': 0
        }
    
    async def import_batch(self, questions: List[Dict], tenant_id: str, exam_type_id: str):
        """Import a batch of questions efficiently"""
        try:
            # Check existing questions
            existing_ids = set()
            response = self.client.table('questions').select('question_id').eq('tenant_id', tenant_id).execute()
            if response.data:
                existing_ids = {q['question_id'] for q in response.data}
            
            # Filter new questions
            new_questions = []
            for q in questions:
                if q['question_id'] not in existing_ids:
                    new_questions.append({
                        'tenant_id': tenant_id,
                        'exam_type_id': exam_type_id,
                        'question_id': q['question_id'],
                        'section': q['section'],
                        'subsection': q['subsection'],
                        'difficulty_level': q.get('difficulty', 5),
                        'content': self.format_content(q),
                        'metadata': {
                            'tags': q.get('tags', []),
                            'source': 'automated_import',
                            'import_date': datetime.now().isoformat()
                        }
                    })
                else:
                    self.stats['skipped'] += 1
            
            # Bulk insert new questions
            if new_questions:
                response = self.client.table('questions').insert(new_questions).execute()
                self.stats['imported'] += len(new_questions)
                logger.info(f"Imported {len(new_questions)} questions")
            
        except Exception as e:
            logger.error(f"Batch import failed: {e}")
            self.stats['errors'] += 1
    
    def format_content(self, question: Dict) -> Dict:
        """Format question content based on type"""
        if 'choices' in question:
            # Multiple choice format
            return {
                'question_text': question.get('question_text'),
                'answer_choices': [
                    {'label': c['id'], 'text': c['text']} 
                    for c in question['choices']
                ],
                'correct_answer': question.get('response', {}).get('answer_key', {}).get('correct_choice_id'),
                'explanation': question.get('response', {}).get('explanations', {}).get('general')
            }
        else:
            # Essay/writing format
            return {
                'question_text': question.get('question_text', ''),
                'prompt': question.get('prompt', ''),
                'instructions': question.get('instructions', ''),
                'response_type': 'essay'
            }
    
    async def import_directory(self, directory: Path, tenant_id: str = None):
        """Import all JSON files from a directory"""
        if not tenant_id:
            tenant_id = await self.get_or_create_tenant('Mellowise Demo', 'demo')
        
        exam_type_id = await self.get_or_create_exam_type(tenant_id, 'LSAT')
        
        json_files = list(directory.glob('*.json'))
        logger.info(f"Found {len(json_files)} JSON files to process")
        
        for json_file in json_files:
            await self.import_file(json_file, tenant_id, exam_type_id)
        
        return self.stats
    
    async def import_file(self, filepath: Path, tenant_id: str, exam_type_id: str):
        """Import a single JSON file"""
        try:
            logger.info(f"Processing {filepath.name}")
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            questions = data if isinstance(data, list) else data.get('questions', [])
            self.stats['processed'] += len(questions)
            
            # Process in batches of 100
            batch_size = 100
            for i in range(0, len(questions), batch_size):
                batch = questions[i:i+batch_size]
                await self.import_batch(batch, tenant_id, exam_type_id)
                
        except Exception as e:
            logger.error(f"Failed to process {filepath}: {e}")
            self.stats['errors'] += 1
    
    async def get_or_create_tenant(self, name: str, slug: str) -> str:
        """Get or create tenant"""
        response = self.client.table('tenants').select('id').eq('slug', slug).execute()
        if response.data:
            return response.data[0]['id']
        
        # Create new tenant
        new_tenant = {
            'name': name,
            'slug': slug,
            'plan_type': 'demo'
        }
        response = self.client.table('tenants').insert(new_tenant).select().execute()
        return response.data[0]['id']
    
    async def get_or_create_exam_type(self, tenant_id: str, name: str) -> str:
        """Get or create exam type"""
        response = self.client.table('exam_types').select('id').eq('tenant_id', tenant_id).eq('name', name).execute()
        if response.data:
            return response.data[0]['id']
        
        # Create new exam type
        new_exam = {
            'tenant_id': tenant_id,
            'name': name,
            'slug': name.lower(),
            'description': f'{name} Exam',
            'scoring_config': {
                'total_questions': 100,
                'time_limit': 210,
                'difficulty_range': [1, 10]
            }
        }
        response = self.client.table('exam_types').insert(new_exam).select().execute()
        return response.data[0]['id']

async def main():
    parser = argparse.ArgumentParser(description='Import questions to database')
    parser.add_argument('--source', required=True, help='Source directory with JSON files')
    parser.add_argument('--env', default='development', choices=['development', 'production'])
    parser.add_argument('--tenant', help='Tenant slug (optional)')
    args = parser.parse_args()
    
    # Get credentials from environment
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not service_key:
        logger.error("Missing Supabase credentials in environment")
        sys.exit(1)
    
    # Run import
    importer = QuestionImporter(supabase_url, service_key)
    source_dir = Path(args.source)
    
    if not source_dir.exists():
        logger.error(f"Source directory not found: {source_dir}")
        sys.exit(1)
    
    stats = await importer.import_directory(source_dir, args.tenant)
    
    # Print results
    logger.info("=" * 60)
    logger.info("Import Complete!")
    logger.info(f"Processed: {stats['processed']}")
    logger.info(f"Imported: {stats['imported']}")
    logger.info(f"Skipped: {stats['skipped']}")
    logger.info(f"Errors: {stats['errors']}")
    
    sys.exit(0 if stats['errors'] == 0 else 1)

if __name__ == "__main__":
    asyncio.run(main())