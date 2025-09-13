/**
 * Diagnostic Quiz API Endpoint
 * 
 * GET: Fetch diagnostic quiz questions
 * POST: Submit diagnostic quiz results and get learning style analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { LearningStyleClassifier } from '@/lib/learning-style-classifier'
import type { 
  DiagnosticQuizResponse, 
  DiagnosticSubmissionRequest, 
  DiagnosticSubmissionResponse,
  DiagnosticQuestion,
  DiagnosticAttempt,
  LearningProfile,
  DEFAULT_DIAGNOSTIC_CONFIG
} from '@/types/learning-style'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a learning profile
    const { data: existingProfile } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get diagnostic questions with related question data
    const { data: diagnosticQuestions, error: questionsError } = await supabase
      .from('diagnostic_questions')
      .select(`
        *,
        question:questions(
          id,
          content,
          question_type,
          subtype,
          difficulty,
          correct_answer,
          answer_choices,
          explanation
        )
      `)
      .eq('is_active', true)
      .order('diagnostic_category')
      .limit(DEFAULT_DIAGNOSTIC_CONFIG.totalQuestions)

    if (questionsError) {
      console.error('Error fetching diagnostic questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const response: DiagnosticQuizResponse = {
      questions: diagnosticQuestions as DiagnosticQuestion[],
      config: DEFAULT_DIAGNOSTIC_CONFIG,
      hasExistingProfile: !!existingProfile,
      existingProfile: existingProfile as LearningProfile | undefined
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Diagnostic quiz GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: DiagnosticSubmissionRequest = await request.json()
    const { attempts } = body

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({ error: 'No attempts provided' }, { status: 400 })
    }

    // Get diagnostic questions for analysis
    const diagnosticQuestionIds = attempts.map(a => a.diagnostic_question_id)
    const { data: diagnosticQuestions, error: questionsError } = await supabase
      .from('diagnostic_questions')
      .select('*')
      .in('id', diagnosticQuestionIds)

    if (questionsError || !diagnosticQuestions) {
      console.error('Error fetching diagnostic questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Insert diagnostic attempts
    const attemptData = attempts.map(attempt => ({
      ...attempt,
      user_id: user.id,
      attempted_at: new Date().toISOString()
    }))

    const { error: attemptsError } = await supabase
      .from('diagnostic_attempts')
      .insert(attemptData)

    if (attemptsError) {
      console.error('Error inserting diagnostic attempts:', attemptsError)
      return NextResponse.json({ error: 'Failed to save attempts' }, { status: 500 })
    }

    // Classify learning style
    const classifier = new LearningStyleClassifier(
      attemptData as DiagnosticAttempt[],
      diagnosticQuestions as DiagnosticQuestion[]
    )
    const analysis = classifier.classify()

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const isFirstTime = !existingProfile

    // Create or update learning profile
    const profileData = {
      user_id: user.id,
      has_completed_diagnostic: true,
      diagnostic_completed_at: new Date().toISOString(),
      visual_analytical_score: analysis.scores.visual_analytical,
      fast_methodical_score: analysis.scores.fast_methodical,
      conceptual_detail_score: analysis.scores.conceptual_detail,
      primary_learning_style: analysis.primaryStyle,
      secondary_learning_style: analysis.secondaryStyle,
      visual_analytical_confidence: analysis.confidence.visual_analytical,
      fast_methodical_confidence: analysis.confidence.fast_methodical,
      conceptual_detail_confidence: analysis.confidence.conceptual_detail,
      overall_confidence: analysis.confidence.overall,
      total_questions_analyzed: analysis.dataPoints.totalQuestions,
      avg_response_time: analysis.dataPoints.avgResponseTime,
      accuracy_variance: analysis.dataPoints.accuracyVariance,
      last_analyzed_at: new Date().toISOString()
    }

    let profile: LearningProfile
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('learning_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError || !updatedProfile) {
        console.error('Error updating learning profile:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      profile = updatedProfile as LearningProfile
    } else {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('learning_profiles')
        .insert(profileData)
        .select()
        .single()

      if (insertError || !newProfile) {
        console.error('Error creating learning profile:', insertError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      profile = newProfile as LearningProfile
    }

    // Record refinement history
    const refinementData = {
      user_id: user.id,
      trigger_type: 'diagnostic_completion' as const,
      trigger_data: {
        questions_answered: analysis.dataPoints.totalQuestions,
        diagnostic_session: true
      },
      previous_scores: existingProfile ? {
        visual_analytical: existingProfile.visual_analytical_score,
        fast_methodical: existingProfile.fast_methodical_score,
        conceptual_detail: existingProfile.conceptual_detail_score
      } : {},
      new_scores: analysis.scores,
      confidence_changes: {
        visual_analytical: analysis.confidence.visual_analytical - (existingProfile?.visual_analytical_confidence || 0),
        fast_methodical: analysis.confidence.fast_methodical - (existingProfile?.fast_methodical_confidence || 0),
        conceptual_detail: analysis.confidence.conceptual_detail - (existingProfile?.conceptual_detail_confidence || 0)
      },
      significant_change: isFirstTime || Math.abs(
        (analysis.scores.visual_analytical + analysis.scores.fast_methodical + analysis.scores.conceptual_detail) -
        ((existingProfile?.visual_analytical_score || 0.5) + (existingProfile?.fast_methodical_score || 0.5) + (existingProfile?.conceptual_detail_score || 0.5))
      ) > 0.3,
      analysis_notes: `Diagnostic completion: ${analysis.primaryStyle}${analysis.secondaryStyle ? ` with ${analysis.secondaryStyle} secondary` : ''}`
    }

    const { error: refinementError } = await supabase
      .from('learning_style_refinements')
      .insert(refinementData)

    if (refinementError) {
      console.error('Error recording refinement:', refinementError)
      // Don't fail the request for this
    }

    const response: DiagnosticSubmissionResponse = {
      analysis,
      profile,
      isFirstTime
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Diagnostic quiz POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}