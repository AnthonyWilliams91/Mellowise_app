/**
 * Anxiety Management Dashboard API Endpoint
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * API endpoint for comprehensive anxiety management dashboard data
 *
 * @author Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { interventionService } from '@/lib/anxiety-management/intervention-service'
import { anxietyDetectionService } from '@/lib/anxiety-management/anxiety-detection-service'
import { confidenceBuildingService } from '@/lib/anxiety-management/confidence-building-service'
import { mindfulnessService } from '@/lib/anxiety-management/mindfulness-service'

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

    // Get comprehensive dashboard data
    const dashboard = await interventionService.getAnxietyManagementDashboard(user.id)

    return NextResponse.json({ dashboard })

  } catch (error) {
    console.error('Error getting anxiety dashboard:', error)
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

    if (action === 'update_settings') {
      const { settings } = data

      if (!settings) {
        return NextResponse.json(
          { error: 'Settings data is required' },
          { status: 400 }
        )
      }

      // Update user's anxiety management settings
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          anxiety_management_settings: settings
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      return NextResponse.json({ success: true })

    } else if (action === 'trigger_intervention') {
      const { trigger, context } = data

      if (!trigger) {
        return NextResponse.json(
          { error: 'Trigger type is required' },
          { status: 400 }
        )
      }

      const intervention = await interventionService.triggerIntervention(
        user.id,
        trigger,
        context || {}
      )

      return NextResponse.json({ intervention })

    } else if (action === 'complete_intervention') {
      const { interventionId, outcome } = data

      if (!interventionId || !outcome) {
        return NextResponse.json(
          { error: 'Intervention ID and outcome data are required' },
          { status: 400 }
        )
      }

      // Update intervention with outcome
      const { error } = await supabase
        .from('anxiety_interventions')
        .update({
          outcome_data: outcome,
          strategy_selected: outcome.strategy_selected || null
        })
        .eq('id', interventionId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Evaluate effectiveness
      const effectiveness = await interventionService.evaluateInterventionEffectiveness(interventionId)

      return NextResponse.json({ effectiveness })

    } else if (action === 'update_coping_strategies') {
      const updatedStrategies = await interventionService.updateCopingStrategies(user.id)

      return NextResponse.json({ strategies: updatedStrategies })

    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in anxiety dashboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}