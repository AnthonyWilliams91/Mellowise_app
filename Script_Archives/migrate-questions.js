#!/usr/bin/env node
/**
 * Migration Script: JSON Questions to Supabase Database
 * Migrates all 960 LSAT questions from JSON files to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Questions directory
const QUESTIONS_DIR = join(__dirname, 'docs/question_formatting/LSAT_Questions');

class QuestionMigrator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      questionsMigrated: 0,
      errors: 0,
      skipped: 0
    };
  }

  async testConnection() {
    try {
      const { data, error } = await supabase.from('questions').select('id').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is ok
        throw error;
      }
      console.log('✅ Supabase connection established');
      return true;
    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);
      return false;
    }
  }

  async getOrCreateTenant() {
    try {
      // Check if demo tenant exists
      const { data: existingTenant, error: selectError } = await supabase
        .from('tenants')
        .select('id')
        .eq('name', 'Mellowise Demo')
        .single();

      if (existingTenant) {
        console.log(`✅ Using existing tenant: ${existingTenant.id}`);
        return existingTenant.id;
      }

      // Create demo tenant
      const tenantId = crypto.randomUUID();
      const { data: newTenant, error: insertError } = await supabase
        .from('tenants')
        .insert({
          id: tenantId,
          name: 'Mellowise Demo',
          type: 'demo'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Created demo tenant: ${newTenant.id}`);
      return newTenant.id;
    } catch (error) {
      console.error(`❌ Tenant setup failed: ${error.message}`);
      return null;
    }
  }

  async getOrCreateExamType(tenantId) {
    try {
      // Check if LSAT exam type exists
      const { data: existingExamType, error: selectError } = await supabase
        .from('exam_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('name', 'LSAT')
        .single();

      if (existingExamType) {
        console.log(`✅ Using existing LSAT exam type: ${existingExamType.id}`);
        return existingExamType.id;
      }

      // Create LSAT exam type
      const examTypeId = crypto.randomUUID();
      const scoringConfig = {
        total_questions: 100,
        time_limit: 210, // 3.5 hours in minutes
        sections: ["Logical Reasoning", "Reading Comprehension", "Writing Sample"],
        difficulty_range: [1, 10],
        points_formula: "10 + (difficulty-1) * 5"
      };

      const { data: newExamType, error: insertError } = await supabase
        .from('exam_types')
        .insert({
          tenant_id: tenantId,
          id: examTypeId,
          name: 'LSAT',
          description: 'Law School Admission Test',
          scoring_config: scoringConfig
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Created LSAT exam type: ${newExamType.id}`);
      return newExamType.id;
    } catch (error) {
      console.error(`❌ Exam type setup failed: ${error.message}`);
      return null;
    }
  }

  async migrateQuestion(questionData, tenantId, examTypeId) {
    try {
      const questionId = questionData.question_id;
      
      // Check if question already exists
      const { data: existing, error: selectError } = await supabase
        .from('questions')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('question_id', questionId)
        .single();

      if (existing) {
        console.log(`⏭️  Question ${questionId} already exists, skipping`);
        this.stats.skipped++;
        return true;
      }

      // Insert question
      const dbQuestionId = crypto.randomUUID();
      const { data: inserted, error: insertError } = await supabase
        .from('questions')
        .insert({
          tenant_id: tenantId,
          id: dbQuestionId,
          question_id: questionId,
          exam_type_id: examTypeId,
          section: questionData.section,
          subsection: questionData.subsection,
          difficulty_level: questionData.difficulty,
          content: questionData.content,
          metadata: {
            tags: questionData.tags || [],
            source: 'migration_json',
            version: '1.0'
          }
        });

      if (insertError) {
        throw insertError;
      }

      this.stats.questionsMigrated++;
      return true;
    } catch (error) {
      console.error(`❌ Failed to migrate question ${questionData.question_id}: ${error.message}`);
      this.stats.errors++;
      return false;
    }
  }

  async migrateFile(filepath, tenantId, examTypeId) {
    try {
      const filename = filepath.split('/').pop();
      console.log(`\n📄 Processing file: ${filename}`);
      
      const data = JSON.parse(readFileSync(filepath, 'utf8'));
      const questions = data.questions || [];
      
      console.log(`📊 Found ${questions.length} questions`);
      
      for (let i = 0; i < questions.length; i++) {
        const success = await this.migrateQuestion(questions[i], tenantId, examTypeId);
        if (success && (i + 1) % 10 === 0) {
          console.log(`✅ Processed ${i + 1}/${questions.length} questions`);
        }
      }
      
      this.stats.filesProcessed++;
      console.log(`✅ Completed file: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to process file ${filepath}: ${error.message}`);
      this.stats.errors++;
    }
  }

  async run() {
    console.log('🚀 Starting LSAT Questions Database Migration');
    console.log('='.repeat(60));

    // Test connection
    if (!await this.testConnection()) {
      return false;
    }

    try {
      // Setup tenant and exam type
      const tenantId = await this.getOrCreateTenant();
      if (!tenantId) return false;

      const examTypeId = await this.getOrCreateExamType(tenantId);
      if (!examTypeId) return false;

      // Get all JSON files
      const files = readdirSync(QUESTIONS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => join(QUESTIONS_DIR, f))
        .sort();

      console.log(`\n📁 Found ${files.length} JSON files to process`);

      // Process each file
      for (const filepath of files) {
        await this.migrateFile(filepath, tenantId, examTypeId);
      }

      this.printStats();
      return true;
    } catch (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      return false;
    }
  }

  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Migration Complete!');
    console.log('='.repeat(60));
    console.log(`📄 Files processed: ${this.stats.filesProcessed}`);
    console.log(`📝 Questions migrated: ${this.stats.questionsMigrated}`);
    console.log(`⏭️  Questions skipped: ${this.stats.skipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    if (this.stats.errors === 0) {
      console.log('✅ All questions successfully migrated!');
    } else {
      console.log(`⚠️  Migration completed with ${this.stats.errors} errors`);
    }
  }
}

// Run migration
const migrator = new QuestionMigrator();
migrator.run()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });