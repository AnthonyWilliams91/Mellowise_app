import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get questions from request
    const { questions, tenant_id, exam_type } = await request.json();
    
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
    }
    
    // Batch import with deduplication
    const existingIds = await supabase
      .from('questions')
      .select('question_id')
      .eq('tenant_id', tenant_id || '00000000-0000-0000-0000-000000000001')
      .then(res => new Set(res.data?.map(q => q.question_id) || []));
    
    const newQuestions = questions
      .filter(q => !existingIds.has(q.question_id))
      .map(q => ({
        tenant_id: tenant_id || '00000000-0000-0000-0000-000000000001',
        question_id: q.question_id,
        exam_type_id: exam_type || 'lsat',
        section: q.section,
        subsection: q.subsection,
        difficulty_level: q.difficulty,
        content: q.content,
        metadata: {
          tags: q.tags || [],
          source: 'api_import',
          imported_by: user.id,
          import_date: new Date().toISOString()
        }
      }));
    
    if (newQuestions.length === 0) {
      return NextResponse.json({ 
        message: 'No new questions to import',
        stats: { processed: questions.length, imported: 0, skipped: questions.length }
      });
    }
    
    // Insert in batches of 100
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < newQuestions.length; i += batchSize) {
      const batch = newQuestions.slice(i, i + batchSize);
      const { error } = await supabase.from('questions').insert(batch);
      
      if (error) {
        console.error('Batch import error:', error);
        continue;
      }
      
      imported += batch.length;
    }
    
    return NextResponse.json({
      message: 'Import successful',
      stats: {
        processed: questions.length,
        imported,
        skipped: questions.length - imported
      }
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}