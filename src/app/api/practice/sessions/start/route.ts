/**
 * Practice Session Start API
 * MELLOWISE-010: Dynamic Difficulty Adjustment
 * 
 * API endpoint for starting practice sessions with dynamic difficulty.
 * Initializes session with optimal difficulty based on FSRS calculations.
 * 
 * @author Architect Agent Winston
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service'
import { profileService } from '@/lib/learning-style/profile-service'
import type { 
  TopicType, 
  PracticeSessionConfig, 
  SessionInitializationResponse,
  DifficultySystemError 
} from '@/types/dynamic-difficulty'

// ============================================================================
// POST /api/practice/sessions/start - Start Practice Session
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      topicType,
      targetDuration = 30,
      manualDifficultyOverride,
      targetSuccessRate,
      adaptationSpeed = 'moderate',
      learningStyleConsideration = true
    } = body

    // Validate required fields
    if (!topicType || !['logical_reasoning', 'logic_games', 'reading_comprehension'].includes(topicType)) {
      return NextResponse.json(
        { success: false, error: 'Valid topic type required' },
        { status: 400 }
      )
    }

    // Validate optional fields
    if (manualDifficultyOverride && (manualDifficultyOverride < 1 || manualDifficultyOverride > 10)) {
      return NextResponse.json(
        { success: false, error: 'Manual difficulty override must be between 1 and 10' },
        { status: 400 }
      )
    }

    if (targetSuccessRate && (targetSuccessRate < 0.5 || targetSuccessRate > 0.9)) {
      return NextResponse.json(
        { success: false, error: 'Target success rate must be between 0.5 and 0.9' },
        { status: 400 }
      )
    }

    if (targetDuration && (targetDuration < 5 || targetDuration > 120)) {
      return NextResponse.json(
        { success: false, error: 'Target duration must be between 5 and 120 minutes' },
        { status: 400 }
      )
    }

    // Build session configuration
    const sessionConfig: PracticeSessionConfig = {
      userId: user.id,
      topicType: topicType as TopicType,
      targetDuration,
      manualDifficultyOverride,
      targetSuccessRate,
      adaptationSpeed: adaptationSpeed as 'conservative' | 'moderate' | 'aggressive',
      learningStyleConsideration
    }

    // Calculate initial difficulty
    const initialDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
      user.id,
      sessionConfig
    )

    // Get or create difficulty state for metadata
    let difficultyState = await getDifficultyState(user.id, topicType as TopicType)
    if (!difficultyState) {
      difficultyState = await dynamicDifficultyService.initializeUserDifficulty(
        user.id, 
        topicType as TopicType
      )
    }

    // Create game session record
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        session_type: 'practice',
        is_practice_mode: true,
        practice_topic_focus: topicType,
        adaptive_difficulty_enabled: !manualDifficultyOverride,
        difficulty_level: Math.round(initialDifficulty),
        session_data: {
          targetDuration,
          targetSuccessRate: targetSuccessRate || difficultyState.success_rate_target,
          adaptationSpeed,
          initialDifficulty,
          learningStyleConsideration
        }
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating game session:', sessionError)
      return NextResponse.json(
        { success: false, error: 'Failed to create practice session' },
        { status: 500 }
      )
    }

    // Create practice session difficulty record
    const { error: practiceSessionError } = await supabase
      .from('practice_session_difficulty')
      .insert({
        session_id: sessionData.id,
        user_id: user.id,
        topic_type: topicType,
        start_difficulty: initialDifficulty,
        end_difficulty: initialDifficulty,
        avg_question_difficulty: initialDifficulty,
        difficulty_adjustments_made: 0,
        questions_answered: 0,
        correct_answers: 0,
        session_success_rate: 0.0,
        stability_change: 0.0,
        confidence_change: 0.0,
        algorithm_confidence: calculateAlgorithmConfidence(difficultyState),
        learning_style_factor: await calculateLearningStyleFactor(user.id, topicType as TopicType)
      })

    if (practiceSessionError) {
      console.error('Error creating practice session difficulty record:', practiceSessionError)
      // Continue - this is for analytics only
    }

    // Log session start as difficulty adjustment
    await logDifficultyAdjustment({
      user_id: user.id,
      session_id: sessionData.id,
      topic_type: topicType,
      previous_difficulty: difficultyState.current_difficulty,
      new_difficulty: initialDifficulty,
      adjustment_reason: 'session_start',
      trigger_performance_rate: null,
      algorithm_confidence: calculateAlgorithmConfidence(difficultyState),
      stability_factor: difficultyState.stability_score,
      learning_style_influence: await calculateLearningStyleFactor(user.id, topicType as TopicType),
      questions_in_context: 0,
      adjustment_magnitude: Math.abs(initialDifficulty - difficultyState.current_difficulty),
      algorithm_version: '1.0',
      adjustment_notes: manualDifficultyOverride ? 
        `Session started with manual override: ${manualDifficultyOverride}` :
        'Session started with calculated difficulty'
    })

    // Calculate first question difficulty (slightly easier to start)
    const firstQuestionDifficulty = Math.max(1.0, initialDifficulty - 0.5)

    // Build response
    const response: SessionInitializationResponse = {
      success: true,
      data: {
        sessionId: sessionData.id,
        initialDifficulty,
        targetSuccessRate: targetSuccessRate || difficultyState.success_rate_target,
        estimatedSessionLength: targetDuration,
        adaptiveMode: !manualDifficultyOverride,
        firstQuestionDifficulty
      },
      metadata: {
        algorithmVersion: '1.0',
        learningStyleFactor: await calculateLearningStyleFactor(user.id, topicType as TopicType),
        topicAffinity: calculateTopicAffinity(await profileService.getProfile(user.id), topicType as TopicType)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in POST /api/practice/sessions/start:', error)
    
    if (error instanceof Error && 'code' in error) {
      const difficultyError = error as DifficultySystemError
      return NextResponse.json(
        { success: false, error: difficultyError.message, code: difficultyError.code },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get difficulty state for user-topic
 */
async function getDifficultyState(userId: string, topicType: TopicType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('practice_difficulty_state')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_type', topicType)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching difficulty state:', error)
    return null
  }

  return data || null
}

/**
 * Calculate algorithm confidence
 */
function calculateAlgorithmConfidence(state: any): number {
  const baseConfidence = 30
  const dataConfidence = Math.min(40, (state.sessions_analyzed / 10) * 40)
  const stabilityConfidence = (state.stability_score / 100) * 30
  
  return Math.max(20, Math.min(100, baseConfidence + dataConfidence + stabilityConfidence))
}

/**
 * Calculate learning style factor
 */
async function calculateLearningStyleFactor(userId: string, topicType: TopicType): Promise<number> {
  try {
    const profile = await profileService.getProfile(userId)
    if (!profile) return 1.0

    const effectiveStyle = profile.manual_override_enabled ? 
      profile.manual_primary_style : profile.primary_learning_style

    if (!effectiveStyle) return 1.0

    // Base factor on learning style characteristics
    const styleFactor = effectiveStyle.includes('fast') ? 1.1 : 0.9
    const methodFactor = effectiveStyle.includes('methodical') ? 0.95 : 1.05
    
    return Math.max(0.7, Math.min(1.3, styleFactor * methodFactor))
  } catch (error) {
    console.error('Error calculating learning style factor:', error)
    return 1.0
  }
}

/**
 * Calculate topic affinity factor
 */
function calculateTopicAffinity(profile: any, topicType: TopicType): number {
  if (!profile) return 1.0

  const effectiveStyle = profile.manual_override_enabled ? 
    profile.manual_primary_style : profile.primary_learning_style

  if (!effectiveStyle) return 1.0

  const topicAffinities = {
    logical_reasoning: {
      visual: 0.9, analytical: 1.1, conceptual: 1.0, detail: 1.0
    },
    logic_games: {
      visual: 1.2, analytical: 1.1, conceptual: 0.9, detail: 1.0
    },
    reading_comprehension: {
      visual: 0.8, analytical: 1.0, conceptual: 1.1, detail: 1.2
    }
  }

  let affinity = 1.0
  Object.entries(topicAffinities[topicType]).forEach(([trait, factor]) => {
    if (effectiveStyle.includes(trait)) {
      affinity *= factor
    }
  })

  return Math.max(0.8, Math.min(1.2, affinity))
}

/**
 * Log difficulty adjustment
 */
async function logDifficultyAdjustment(adjustmentData: any) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('practice_difficulty_adjustments')
      .insert(adjustmentData)

    if (error) {
      console.error('Error logging difficulty adjustment:', error)
    }
  } catch (error) {
    console.error('Error in logDifficultyAdjustment:', error)
    // Don't throw - logging failure shouldn't break the main flow
  }
}