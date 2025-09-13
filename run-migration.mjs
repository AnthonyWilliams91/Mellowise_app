#!/usr/bin/env node
/**
 * Direct Supabase Migration Runner
 * Executes the LSAT questions migration directly
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration from your .env.local
const supabaseUrl = 'https://kptfedjloznfgvlocthf.supabase.com';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdGZlZGpsb3puZmd2bG9jdGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0NTYzMSwiZXhwIjoyMDczMDIxNjMxfQ.HvFykL1-BXPjskwUFk5_d0uWu3o1oAmy8bppeu3B4-Q';

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Questions directory
const QUESTIONS_DIR = join(__dirname, 'docs/question_formatting/LSAT_Questions');

// Demo tenant ID
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

class QuestionMigrator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      questionsMigrated: 0,
      errors: 0,
      skipped: 0
    };
  }

  async setupTenantAndExamType() {
    console.log('📋 Setting up tenant and exam type...');
    
    try {
      // Check/create tenant
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', DEMO_TENANT_ID);

      if (tenantError || !tenants?.length) {
        console.log('Creating demo tenant...');
        const { error: insertError } = await supabase
          .from('tenants')
          .insert({
            id: DEMO_TENANT_ID,
            name: 'Mellowise Demo',
            slug: 'demo',
            plan_type: 'demo',
            admin_name: 'System Admin'
          });
        
        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('❌ Failed to create tenant:', insertError);
          return null;
        }
      }
      console.log('✅ Demo tenant ready');

      // Check/create LSAT exam type
      const { data: examTypes, error: examError } = await supabase
        .from('exam_types')
        .select('id')
        .eq('tenant_id', DEMO_TENANT_ID)
        .eq('name', 'LSAT');

      let examTypeId;
      if (examError || !examTypes?.length) {
        console.log('Creating LSAT exam type...');
        examTypeId = crypto.randomUUID();
        
        const { error: insertError } = await supabase
          .from('exam_types')
          .insert({
            tenant_id: DEMO_TENANT_ID,
            id: examTypeId,
            name: 'LSAT',
            slug: 'lsat',
            description: 'Law School Admission Test',
            scoring_config: {
              total_questions: 100,
              time_limit: 210,
              sections: ["Logical Reasoning", "Reading Comprehension", "Writing Sample"],
              difficulty_range: [1, 10],
              points_formula: "10 + (difficulty-1) * 5"
            },
            timing_config: {
              total_time: 210,
              sections: [
                {name: "Logical Reasoning", time: 70},
                {name: "Reading Comprehension", time: 70},
                {name: "Writing Sample", time: 70}
              ]
            }
          });
        
        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('❌ Failed to create exam type:', insertError);
          return null;
        }
      } else {
        examTypeId = examTypes[0].id;
      }
      
      console.log('✅ LSAT exam type ready:', examTypeId);
      return examTypeId;
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      return null;
    }
  }

  formatContent(question) {
    // Handle different content structures
    if (question.choices && question.response) {
      // Multiple choice format (LR and RC)
      return {
        question_text: question.question_text,
        answer_choices: question.choices.map(c => ({
          label: c.id,
          text: c.text
        })),
        correct_answer: question.response.answer_key.correct_choice_id,
        explanation: question.response.explanations.general
      };
    } else {
      // Writing Sample format
      return {
        question_text: question.question_text || '',
        prompt: question.prompt || '',
        instructions: question.instructions || '',
        response_type: 'essay'
      };
    }
  }

  async migrateQuestion(question, examTypeId) {
    try {
      const questionId = question.question_id;
      
      // Check if exists
      const { data: existing } = await supabase
        .from('questions')
        .select('id')
        .eq('tenant_id', DEMO_TENANT_ID)
        .eq('question_id', questionId)
        .single();

      if (existing) {
        this.stats.skipped++;
        return true;
      }

      // Handle difficulty format
      let difficulty = question.difficulty;
      if (typeof difficulty === 'object') {
        difficulty = difficulty.initial_estimate || 5;
      }

      // Get tags
      let tags = question.tags || [];
      if (question.metadata?.tags) {
        tags = question.metadata.tags;
      }

      // Insert question
      const { error } = await supabase
        .from('questions')
        .insert({
          tenant_id: DEMO_TENANT_ID,
          id: crypto.randomUUID(),
          question_id: questionId,
          exam_type_id: examTypeId,
          section: question.section,
          subsection: question.subsection,
          difficulty_level: difficulty,
          content: this.formatContent(question),
          metadata: {
            tags: tags,
            source: 'migration_json',
            version: '1.0'
          }
        });

      if (error) {
        console.error(`❌ Failed to insert ${questionId}:`, error.message);
        this.stats.errors++;
        return false;
      }

      this.stats.questionsMigrated++;
      return true;
      
    } catch (error) {
      console.error(`❌ Error migrating question:`, error);
      this.stats.errors++;
      return false;
    }
  }

  async migrateFile(filepath, examTypeId) {
    try {
      const filename = filepath.split('/').pop();
      console.log(`\n📄 Processing: ${filename}`);
      
      const data = JSON.parse(readFileSync(filepath, 'utf8'));
      const questions = Array.isArray(data) ? data : data.questions || [];
      
      console.log(`   Found ${questions.length} questions`);
      
      for (let i = 0; i < questions.length; i++) {
        await this.migrateQuestion(questions[i], examTypeId);
        
        // Progress indicator
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`   ✓ ${i + 1}/${questions.length}\r`);
        }
      }
      
      console.log(`   ✅ Completed ${filename}`);
      this.stats.filesProcessed++;
      
    } catch (error) {
      console.error(`❌ Failed to process file:`, error);
      this.stats.errors++;
    }
  }

  async run() {
    console.log('🚀 Starting LSAT Questions Migration');
    console.log('=' .repeat(60));

    // Setup
    const examTypeId = await this.setupTenantAndExamType();
    if (!examTypeId) {
      console.error('❌ Setup failed, aborting migration');
      return false;
    }

    try {
      // Get all JSON files
      const files = readdirSync(QUESTIONS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => join(QUESTIONS_DIR, f))
        .sort();

      console.log(`\n📁 Found ${files.length} JSON files to process`);

      // Process each file
      for (const filepath of files) {
        await this.migrateFile(filepath, examTypeId);
      }

      // Print final stats
      console.log('\n' + '='.repeat(60));
      console.log('🎉 Migration Complete!');
      console.log('='.repeat(60));
      console.log(`📄 Files processed: ${this.stats.filesProcessed}`);
      console.log(`📝 Questions migrated: ${this.stats.questionsMigrated}`);
      console.log(`⏭️  Questions skipped: ${this.stats.skipped}`);
      console.log(`❌ Errors: ${this.stats.errors}`);
      
      // Verify final count
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', DEMO_TENANT_ID);
      
      console.log(`\n✅ Total questions in database: ${count}`);
      
      if (count === 960) {
        console.log('🎉 SUCCESS: All 960 questions imported!');
      } else if (count > 0) {
        console.log(`⚠️  Partial success: ${count}/960 questions imported`);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
  }
}

// Run migration
console.log('🔧 Initializing migration...\n');
const migrator = new QuestionMigrator();
migrator.run()
  .then(success => {
    if (success) {
      console.log('\n✨ Migration successful! Check your Supabase dashboard.');
      console.log('📊 Table: questions');
      console.log('🔍 Filter: tenant_id = ' + DEMO_TENANT_ID);
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });