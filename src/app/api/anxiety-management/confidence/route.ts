/**
 * Confidence Building API Endpoint
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * API endpoint for confidence assessment and building strategies
 *
 * @author Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { confidenceBuildingService } from '@/lib/anxiety-management/confidence-building-service'

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

    // Assess current confidence level
    const confidenceMetrics = await confidenceBuildingService.assessConfidenceLevel(user.id)

    return NextResponse.json({ confidence: confidenceMetrics })

  } catch (error) {
    console.error('Error getting confidence metrics:', error)
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

    if (action === 'generate_sequence') {
      const { anxietyLevel } = data

      if (!anxietyLevel) {
        return NextResponse.json(
          { error: 'Anxiety level is required for sequence generation' },
          { status: 400 }
        )
      }

      const questionSequence = await confidenceBuildingService.generateQuestionSequence(
        user.id,
        anxietyLevel
      )

      return NextResponse.json({ sequence: questionSequence })

    } else if (action === 'update_confidence') {
      const { sessionData } = data

      if (!sessionData) {
        return NextResponse.json(
          { error: 'Session data is required for confidence update' },
          { status: 400 }
        )
      }

      const updatedMetrics = await confidenceBuildingService.updateConfidenceScore(
        user.id,
        sessionData
      )

      return NextResponse.json({ confidence: updatedMetrics })

    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in confidence building API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}