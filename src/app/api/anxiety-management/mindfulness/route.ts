/**
 * Mindfulness API Endpoint
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * API endpoint for mindfulness exercises and session tracking
 *
 * @author Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { mindfulnessService } from '@/lib/anxiety-management/mindfulness-service'
import type { AnxietyLevel } from '@/types/anxiety-management'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const anxietyLevel = searchParams.get('anxietyLevel') as AnxietyLevel || 'moderate'
    const timeAvailable = parseInt(searchParams.get('timeAvailable') || '300') // 5 minutes default
    const action = searchParams.get('action')

    if (action === 'recommendations') {
      // Get recommended exercises
      const exercises = await mindfulnessService.getRecommendedExercises(anxietyLevel, timeAvailable)
      const techniques = await mindfulnessService.getRecommendedRelaxationTechniques(anxietyLevel, timeAvailable)

      return NextResponse.json({
        breathing_exercises: exercises,
        relaxation_techniques: techniques
      })

    } else if (action === 'effectiveness') {
      // Get effectiveness analysis
      const effectiveness = await mindfulnessService.analyzeEffectiveness(user.id)

      return NextResponse.json({ effectiveness })

    } else if (action === 'personalized_plan') {
      const dailyTime = parseInt(searchParams.get('dailyTime') || '300')
      const plan = await mindfulnessService.getPersonalizedPlan(user.id, anxietyLevel, dailyTime)

      return NextResponse.json({ plan })

    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in mindfulness API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    if (action === 'track_session') {
      const sessionData = {
        user_id: user.id,
        ...data
      }

      await mindfulnessService.trackMindfulnessSession(sessionData)

      return NextResponse.json({ success: true })

    } else if (action === 'rate_effectiveness') {
      const { sessionId, rating, anxietyBefore, anxietyAfter } = data

      if (!sessionId || !rating) {
        return NextResponse.json(
          { error: 'Session ID and rating are required' },
          { status: 400 }
        )
      }

      // Update session with effectiveness rating
      const { error } = await supabase
        .from('mindfulness_sessions')
        .update({
          effectiveness_rating: rating,
          anxiety_before: anxietyBefore,
          anxiety_after: anxietyAfter
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in mindfulness session API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}