/**
 * Anxiety Detection API Endpoint
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * API endpoint for detecting anxiety levels and triggering interventions
 *
 * @author Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { anxietyDetectionService } from '@/lib/anxiety-management/anxiety-detection-service'
import { interventionService } from '@/lib/anxiety-management/intervention-service'

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
    const { recentPerformance, context } = body

    if (!recentPerformance || !Array.isArray(recentPerformance)) {
      return NextResponse.json(
        { error: 'Recent performance data is required' },
        { status: 400 }
      )
    }

    // Detect anxiety level
    const detectionResult = await anxietyDetectionService.detectAnxietyLevel(
      user.id,
      recentPerformance
    )

    // Check if intervention is needed
    let intervention = null
    if (detectionResult.anxiety_level === 'high' || detectionResult.anxiety_level === 'severe') {
      // Determine primary trigger for intervention
      const primaryTrigger = detectionResult.triggers_identified[0] || 'unknown'

      intervention = await interventionService.triggerIntervention(
        user.id,
        primaryTrigger,
        {
          anxiety_level: detectionResult.anxiety_level,
          confidence_score: detectionResult.confidence_score,
          context: context || {}
        }
      )
    }

    return NextResponse.json({
      detection: detectionResult,
      intervention,
      recommendations: generateImmediateRecommendations(detectionResult)
    })

  } catch (error) {
    console.error('Error in anxiety detection API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const days = parseInt(searchParams.get('days') || '7')

    // Get anxiety history
    const anxietyHistory = await anxietyDetectionService.trackAnxietyHistory(user.id)

    // Get recent detections within specified days
    const recentDetections = anxietyHistory.detection_results.filter(detection => {
      const detectionDate = new Date(detection.detection_timestamp)
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      return detectionDate >= cutoffDate
    })

    return NextResponse.json({
      history: {
        ...anxietyHistory,
        detection_results: recentDetections
      },
      summary: {
        total_detections: recentDetections.length,
        anxiety_episodes: recentDetections.filter(d => d.anxiety_level !== 'low').length,
        average_confidence: recentDetections.length > 0
          ? recentDetections.reduce((sum, d) => sum + d.confidence_score, 0) / recentDetections.length
          : 0,
        most_common_triggers: getMostCommonTriggers(recentDetections)
      }
    })

  } catch (error) {
    console.error('Error getting anxiety history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function generateImmediateRecommendations(detection: any): string[] {
  const recommendations: string[] = []

  switch (detection.anxiety_level) {
    case 'severe':
      recommendations.push('Take a 5-minute break and try deep breathing exercises')
      recommendations.push('Consider pausing your session and returning when you feel calmer')
      recommendations.push('Try the 4-7-8 breathing technique for quick anxiety relief')
      break
    case 'high':
      recommendations.push('Take 3 deep breaths before continuing')
      recommendations.push('Try a 2-minute breathing exercise')
      recommendations.push('Consider reducing question difficulty temporarily')
      break
    case 'moderate':
      recommendations.push('Take a moment to center yourself')
      recommendations.push('Remember: mistakes are part of learning')
      break
    case 'low':
      recommendations.push('Great job staying calm and focused!')
      recommendations.push('This is an excellent time for challenging practice')
      break
  }

  // Add trigger-specific recommendations
  detection.triggers_identified.forEach((trigger: string) => {
    switch (trigger) {
      case 'time_pressure':
        recommendations.push('Focus on accuracy over speed')
        break
      case 'difficult_questions':
        recommendations.push('Break down complex questions into smaller parts')
        break
      case 'performance_drop':
        recommendations.push('Review your recent correct answers to boost confidence')
        break
      case 'streak_break':
        recommendations.push('Every expert makes mistakes - keep practicing!')
        break
    }
  })

  return recommendations
}

function getMostCommonTriggers(detections: any[]): { trigger: string; count: number }[] {
  const triggerCounts: Record<string, number> = {}

  detections.forEach(detection => {
    detection.triggers_identified.forEach((trigger: string) => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1
    })
  })

  return Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}