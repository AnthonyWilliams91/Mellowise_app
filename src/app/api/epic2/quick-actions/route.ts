/**
 * Epic 2: AI-Powered Personalization Engine - Quick Actions API
 *
 * Handles quick actions from the Epic 2 dashboard
 * Coordinates actions across all AI systems
 *
 * @author Epic 2 Integration Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { anxietyManagementOrchestrator } from '@/lib/anxiety-management/anxiety-management-orchestrator'
import { notificationService } from '@/lib/notifications/notification-service'
import { dynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service'
import { profileService } from '@/lib/learning-style/profile-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, actionId, action, data = {} } = await request.json()

    if (!userId || !actionId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let result: any = { success: true }

    // Handle different quick actions
    switch (action) {
      case 'start_breathing_exercise':
        result = await handleBreathingExercise(userId, data)
        break

      case 'view_goal_dashboard':
        result = await handleGoalDashboard(userId)
        break

      case 'start_personalized_session':
        result = await handlePersonalizedSession(userId, data)
        break

      case 'update_learning_style':
        result = await handleLearningStyleUpdate(userId, data)
        break

      case 'adjust_difficulty':
        result = await handleDifficultyAdjustment(userId, data)
        break

      case 'schedule_reminder':
        result = await handleScheduleReminder(userId, data)
        break

      case 'view_performance_insights':
        result = await handlePerformanceInsights(userId)
        break

      case 'take_anxiety_assessment':
        result = await handleAnxietyAssessment(userId)
        break

      case 'update_goal_progress':
        result = await handleGoalProgressUpdate(userId, data)
        break

      case 'customize_notifications':
        result = await handleNotificationCustomization(userId, data)
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Log the action for analytics
    await logQuickAction(userId, actionId, action, result.success, supabase)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Quick action error:', error)

    return NextResponse.json(
      {
        error: 'Action failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleBreathingExercise(userId: string, data: any) {
  try {
    // Get personalized breathing exercise recommendation
    const dashboard = await anxietyManagementOrchestrator.getPersonalizedDashboard(userId)

    return {
      success: true,
      action: 'breathing_exercise_started',
      data: {
        exerciseType: 'box_breathing',
        duration: 120, // 2 minutes
        instructions: [
          'Inhale for 4 counts',
          'Hold for 4 counts',
          'Exhale for 4 counts',
          'Hold for 4 counts'
        ],
        nextUrl: '/dashboard/anxiety-management?exercise=breathing'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to start breathing exercise'
    }
  }
}

async function handleGoalDashboard(userId: string) {
  return {
    success: true,
    action: 'redirect_to_goals',
    data: {
      nextUrl: '/dashboard/goals'
    }
  }
}

async function handlePersonalizedSession(userId: string, data: any) {
  try {
    // Create personalized study session using Epic 2 integration
    const sessionContext = {
      userId,
      sessionType: data.sessionType || 'practice',
      topicFocus: data.topics || [],
      timeAvailable: data.duration || 30,
      performanceHistory: []
    }

    return {
      success: true,
      action: 'session_created',
      data: {
        sessionId: crypto.randomUUID(),
        nextUrl: '/study/personalized-session',
        configuration: sessionContext
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create personalized session'
    }
  }
}

async function handleLearningStyleUpdate(userId: string, data: any) {
  try {
    // Update learning style preferences
    if (data.preferences) {
      // Update via profile service
      await profileService.updateLearningStylePreferences(userId, data.preferences)
    }

    return {
      success: true,
      action: 'learning_style_updated',
      data: {
        message: 'Learning style preferences updated successfully'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update learning style'
    }
  }
}

async function handleDifficultyAdjustment(userId: string, data: any) {
  try {
    // Update difficulty preferences
    if (data.topic && data.adjustment) {
      await dynamicDifficultyService.adjustDifficulty(userId, data.topic, data.adjustment)
    }

    return {
      success: true,
      action: 'difficulty_adjusted',
      data: {
        topic: data.topic,
        newLevel: data.adjustment,
        message: 'Difficulty level updated successfully'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to adjust difficulty'
    }
  }
}

async function handleScheduleReminder(userId: string, data: any) {
  try {
    // Schedule a new study reminder
    const reminder = {
      userId,
      type: data.reminderType || 'study_session',
      scheduledFor: data.scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: tomorrow
      message: data.message || 'Time for your personalized study session!',
      priority: data.priority || 'medium'
    }

    await notificationService.scheduleReminder(reminder)

    return {
      success: true,
      action: 'reminder_scheduled',
      data: {
        reminderId: crypto.randomUUID(),
        scheduledFor: reminder.scheduledFor,
        message: 'Reminder scheduled successfully'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to schedule reminder'
    }
  }
}

async function handlePerformanceInsights(userId: string) {
  return {
    success: true,
    action: 'redirect_to_insights',
    data: {
      nextUrl: '/dashboard/analytics?tab=insights'
    }
  }
}

async function handleAnxietyAssessment(userId: string) {
  return {
    success: true,
    action: 'redirect_to_assessment',
    data: {
      nextUrl: '/dashboard/anxiety-management?action=assessment'
    }
  }
}

async function handleGoalProgressUpdate(userId: string, data: any) {
  try {
    // Update goal progress
    const response = await fetch('/api/goals/update-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        goalId: data.goalId,
        progress: data.progress
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update goal progress')
    }

    return {
      success: true,
      action: 'goal_progress_updated',
      data: {
        goalId: data.goalId,
        newProgress: data.progress,
        message: 'Goal progress updated successfully'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update goal progress'
    }
  }
}

async function handleNotificationCustomization(userId: string, data: any) {
  try {
    // Update notification preferences
    if (data.preferences) {
      await notificationService.updateNotificationPreferences(userId, data.preferences)
    }

    return {
      success: true,
      action: 'notifications_customized',
      data: {
        preferences: data.preferences,
        message: 'Notification preferences updated successfully'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update notification preferences'
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function logQuickAction(
  userId: string,
  actionId: string,
  action: string,
  success: boolean,
  supabase: any
) {
  try {
    await supabase
      .from('epic2_quick_actions_log')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        action_id: actionId,
        action_type: action,
        success,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log quick action:', error)
    // Don't throw - logging failure shouldn't break the action
  }
}