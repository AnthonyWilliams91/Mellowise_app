/**
 * Practice Difficulty API Routes
 * MELLOWISE-010: Dynamic Difficulty Adjustment
 * 
 * RESTful API endpoints for managing dynamic difficulty in practice modes.
 * Supports difficulty state management, session initialization, and analytics.
 * 
 * @author Architect Agent Winston
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service'
import type { TopicType, DifficultyStateResponse, DifficultySystemError } from '@/types/dynamic-difficulty'

// ============================================================================
// GET /api/practice/difficulty - Get Current Difficulty State
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const topicType = searchParams.get('topicType') as TopicType | null
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true'

    // If specific topic requested
    if (topicType) {
      const difficultyState = await dynamicDifficultyService.getDifficultyState(user.id, topicType)
      
      if (!difficultyState) {
        // Initialize if doesn't exist
        const newState = await dynamicDifficultyService.initializeUserDifficulty(user.id, topicType)
        
        return NextResponse.json({
          success: true,
          data: {
            topics: {
              [topicType]: {
                currentDifficulty: newState.current_difficulty,
                stabilityScore: newState.stability_score,
                confidenceInterval: newState.confidence_interval,
                targetSuccessRate: newState.success_rate_target,
                currentSuccessRate: newState.current_success_rate,
                manualOverrideEnabled: newState.manual_override_enabled,
                lastSessionAt: newState.last_session_at,
                recommendedSessionLength: 30,
                algorithmConfidence: 30
              }
            }
          },
          metadata: {
            algorithmsVersion: '1.0',
            lastUpdated: newState.last_updated,
            totalSessions: 0
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          topics: {
            [topicType]: {
              currentDifficulty: difficultyState.current_difficulty,
              stabilityScore: difficultyState.stability_score,
              confidenceInterval: difficultyState.confidence_interval,
              targetSuccessRate: difficultyState.success_rate_target,
              currentSuccessRate: difficultyState.current_success_rate,
              manualOverrideEnabled: difficultyState.manual_override_enabled,
              lastSessionAt: difficultyState.last_session_at,
              recommendedSessionLength: calculateRecommendedSessionLength(difficultyState),
              algorithmConfidence: calculateAlgorithmConfidence(difficultyState)
            }
          }
        },
        metadata: {
          algorithmsVersion: '1.0',
          lastUpdated: difficultyState.last_updated,
          totalSessions: difficultyState.sessions_analyzed
        }
      })
    }

    // Get all topics
    const supabaseClient = createClient()
    const { data: allStates, error } = await supabaseClient
      .from('practice_difficulty_state')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching difficulty states:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch difficulty states' },
        { status: 500 }
      )
    }

    const topics: DifficultyStateResponse['data']['topics'] = {}
    const totalSessions = allStates?.reduce((sum, state) => sum + state.sessions_analyzed, 0) || 0

    // Initialize missing topics
    const allTopicTypes: TopicType[] = ['logical_reasoning', 'logic_games', 'reading_comprehension']
    const existingTopics = new Set(allStates?.map(state => state.topic_type) || [])

    for (const topicType of allTopicTypes) {
      if (!existingTopics.has(topicType)) {
        const newState = await dynamicDifficultyService.initializeUserDifficulty(user.id, topicType)
        topics[topicType] = {
          currentDifficulty: newState.current_difficulty,
          stabilityScore: newState.stability_score,
          confidenceInterval: newState.confidence_interval,
          targetSuccessRate: newState.success_rate_target,
          currentSuccessRate: newState.current_success_rate,
          manualOverrideEnabled: newState.manual_override_enabled,
          lastSessionAt: newState.last_session_at,
          recommendedSessionLength: 30,
          algorithmConfidence: 30
        }
      }
    }

    // Add existing states
    allStates?.forEach(state => {
      topics[state.topic_type as TopicType] = {
        currentDifficulty: state.current_difficulty,
        stabilityScore: state.stability_score,
        confidenceInterval: state.confidence_interval,
        targetSuccessRate: state.success_rate_target,
        currentSuccessRate: state.current_success_rate,
        manualOverrideEnabled: state.manual_override_enabled,
        lastSessionAt: state.last_session_at,
        recommendedSessionLength: calculateRecommendedSessionLength(state),
        algorithmConfidence: calculateAlgorithmConfidence(state)
      }
    })

    return NextResponse.json({
      success: true,
      data: { topics },
      metadata: {
        algorithmsVersion: '1.0',
        lastUpdated: new Date().toISOString(),
        totalSessions
      }
    })

  } catch (error) {
    console.error('Error in GET /api/practice/difficulty:', error)
    
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
// POST /api/practice/difficulty - Update Difficulty Settings
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
    const { action, topicType, difficulty, targetSuccessRate, reason } = body

    if (!topicType || !['logical_reasoning', 'logic_games', 'reading_comprehension'].includes(topicType)) {
      return NextResponse.json(
        { success: false, error: 'Valid topic type required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'set_manual_override':
        if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 10) {
          return NextResponse.json(
            { success: false, error: 'Difficulty must be between 1 and 10' },
            { status: 400 }
          )
        }

        await dynamicDifficultyService.setManualDifficultyOverride(
          user.id,
          topicType as TopicType,
          difficulty,
          reason || 'Manual adjustment'
        )

        return NextResponse.json({
          success: true,
          data: {
            message: 'Manual difficulty override set successfully',
            topicType,
            newDifficulty: difficulty
          }
        })

      case 'remove_manual_override':
        await dynamicDifficultyService.removeManualOverride(user.id, topicType as TopicType)

        return NextResponse.json({
          success: true,
          data: {
            message: 'Manual difficulty override removed successfully',
            topicType
          }
        })

      case 'update_target_success_rate':
        if (typeof targetSuccessRate !== 'number' || targetSuccessRate < 0.5 || targetSuccessRate > 0.9) {
          return NextResponse.json(
            { success: false, error: 'Target success rate must be between 0.5 and 0.9' },
            { status: 400 }
          )
        }

        // Update target success rate in database
        const supabaseClient = createClient()
        const { error: updateError } = await supabaseClient
          .from('practice_difficulty_state')
          .update({
            success_rate_target: targetSuccessRate,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('topic_type', topicType)

        if (updateError) {
          return NextResponse.json(
            { success: false, error: 'Failed to update target success rate' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            message: 'Target success rate updated successfully',
            topicType,
            newTargetSuccessRate: targetSuccessRate
          }
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in POST /api/practice/difficulty:', error)
    
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
 * Calculate recommended session length based on difficulty state
 */
function calculateRecommendedSessionLength(state: any): number {
  const baseLength = 30
  const stabilityModifier = state.stability_score < 50 ? 0.7 : 1.0
  const difficultyModifier = state.current_difficulty > 7 ? 0.8 : 1.0
  
  return Math.round(baseLength * stabilityModifier * difficultyModifier)
}

/**
 * Calculate algorithm confidence based on state data
 */
function calculateAlgorithmConfidence(state: any): number {
  const baseConfidence = 30
  const dataConfidence = Math.min(40, (state.sessions_analyzed / 10) * 40)
  const stabilityConfidence = (state.stability_score / 100) * 30
  
  return Math.max(20, Math.min(100, baseConfidence + dataConfidence + stabilityConfidence))
}