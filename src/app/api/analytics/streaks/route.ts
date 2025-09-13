/**
 * Streaks Analytics API
 * 
 * Manages user streak tracking and milestone achievements
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user streaks
    const { data: streaks, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching streaks:', error)
      return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 })
    }

    // Get recent streak activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('daily_stats')
      .select('date_recorded, sessions_played, is_streak_day')
      .eq('user_id', session.user.id)
      .eq('is_streak_day', true)
      .order('date_recorded', { ascending: false })
      .limit(30)

    if (activityError) {
      console.error('Error fetching recent activity:', activityError)
    }

    const streakData = streaks || {
      current_daily_streak: 0,
      current_session_streak: 0,
      best_daily_streak: 0,
      best_session_streak: 0,
      best_accuracy_streak: 0,
      current_daily_streak_start: null,
      last_activity_date: null,
      milestones_achieved: []
    }

    // Calculate streak health and momentum
    const streakHealth = calculateStreakHealth(streakData, recentActivity || [])
    
    // Get available milestones
    const availableMilestones = getAvailableMilestones(streakData)

    return NextResponse.json({
      streaks: streakData,
      recentActivity: recentActivity || [],
      streakHealth,
      availableMilestones,
      notifications: generateStreakNotifications(streakData, streakHealth)
    })

  } catch (error) {
    console.error('Streaks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'check_milestone':
        return await checkAndAwardMilestone(supabase, session.user.id, data)
      
      case 'reset_streak':
        return await resetUserStreak(supabase, session.user.id, data.streakType)
      
      case 'update_streak':
        return await updateStreakManually(supabase, session.user.id, data)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Streaks POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateStreakHealth(streaks: any, recentActivity: any[]) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const lastActivity = streaks.last_activity_date
  
  let status = 'healthy' // healthy, at_risk, broken
  let daysUntilBreak = null
  let momentum = 'stable' // growing, stable, declining
  
  // Determine streak status
  if (!lastActivity || lastActivity < yesterdayStr) {
    status = 'broken'
  } else if (lastActivity === yesterdayStr) {
    status = 'at_risk'
    daysUntilBreak = 1
  } else if (lastActivity === today) {
    status = 'healthy'
  }

  // Calculate momentum based on recent activity
  if (recentActivity.length >= 7) {
    const recent7Days = recentActivity.slice(0, 7)
    const previous7Days = recentActivity.slice(7, 14)
    
    const recentAvg = recent7Days.reduce((sum, day) => sum + (day.sessions_played || 0), 0) / 7
    const previousAvg = previous7Days.reduce((sum, day) => sum + (day.sessions_played || 0), 0) / 7
    
    if (recentAvg > previousAvg * 1.1) {
      momentum = 'growing'
    } else if (recentAvg < previousAvg * 0.9) {
      momentum = 'declining'
    }
  }

  return {
    status,
    daysUntilBreak,
    momentum,
    consistency: calculateConsistency(recentActivity),
    weeklyAverage: calculateWeeklyAverage(recentActivity)
  }
}

function calculateConsistency(recentActivity: any[]) {
  if (recentActivity.length === 0) return 0
  
  const activeDays = recentActivity.filter(day => day.sessions_played > 0).length
  return Math.round((activeDays / Math.min(recentActivity.length, 30)) * 100)
}

function calculateWeeklyAverage(recentActivity: any[]) {
  const recent7Days = recentActivity.slice(0, 7)
  if (recent7Days.length === 0) return 0
  
  const totalSessions = recent7Days.reduce((sum, day) => sum + (day.sessions_played || 0), 0)
  return Math.round((totalSessions / 7) * 100) / 100
}

function getAvailableMilestones(streaks: any) {
  const achieved = streaks.milestones_achieved || []
  const currentDaily = streaks.current_daily_streak || 0
  const currentSession = streaks.current_session_streak || 0
  const bestDaily = streaks.best_daily_streak || 0
  const bestSession = streaks.best_session_streak || 0

  const milestones = [
    // Daily streaks
    { type: 'daily', value: 3, title: '3-Day Streak', description: 'Study for 3 days in a row' },
    { type: 'daily', value: 7, title: 'Week Warrior', description: 'Study for 7 days in a row' },
    { type: 'daily', value: 14, title: 'Two Weeks Strong', description: 'Study for 14 days in a row' },
    { type: 'daily', value: 30, title: 'Month Master', description: 'Study for 30 days in a row' },
    { type: 'daily', value: 60, title: 'Unstoppable', description: 'Study for 60 days in a row' },
    { type: 'daily', value: 100, title: 'Century Club', description: 'Study for 100 days in a row' },
    
    // Session streaks
    { type: 'session', value: 5, title: 'Hot Streak', description: 'Get 5 correct answers in a row' },
    { type: 'session', value: 10, title: 'Perfect Ten', description: 'Get 10 correct answers in a row' },
    { type: 'session', value: 20, title: 'Ace', description: 'Get 20 correct answers in a row' },
    { type: 'session', value: 50, title: 'Phenomenal', description: 'Get 50 correct answers in a row' },
    { type: 'session', value: 100, title: 'Legendary', description: 'Get 100 correct answers in a row' }
  ]

  return milestones.filter(milestone => {
    const key = `${milestone.type}_${milestone.value}`
    const isAchieved = achieved.includes(key)
    
    if (isAchieved) return false
    
    // Show milestones that are achievable (within reach)
    if (milestone.type === 'daily') {
      return milestone.value <= Math.max(currentDaily + 10, bestDaily + 5)
    } else {
      return milestone.value <= Math.max(currentSession + 20, bestSession + 10)
    }
  })
}

function generateStreakNotifications(streaks: any, health: any) {
  const notifications = []
  const currentDaily = streaks.current_daily_streak || 0
  const currentSession = streaks.current_session_streak || 0

  // At-risk notifications
  if (health.status === 'at_risk') {
    notifications.push({
      type: 'warning',
      title: 'Streak at Risk!',
      message: `Your ${currentDaily}-day streak is at risk. Study today to keep it alive!`,
      priority: 'high'
    })
  }

  // Broken streak recovery
  if (health.status === 'broken' && streaks.best_daily_streak > 0) {
    notifications.push({
      type: 'info',
      title: 'Start a New Streak',
      message: `Your previous best was ${streaks.best_daily_streak} days. Ready to beat that record?`,
      priority: 'medium'
    })
  }

  // Milestone approaching
  const nextDailyMilestone = [3, 7, 14, 30, 60, 100].find(m => m > currentDaily)
  if (nextDailyMilestone && currentDaily >= nextDailyMilestone - 2) {
    notifications.push({
      type: 'success',
      title: 'Milestone Approaching!',
      message: `Only ${nextDailyMilestone - currentDaily} more day${nextDailyMilestone - currentDaily === 1 ? '' : 's'} to reach ${nextDailyMilestone} days!`,
      priority: 'medium'
    })
  }

  // Momentum notifications
  if (health.momentum === 'growing') {
    notifications.push({
      type: 'success',
      title: 'Great Momentum!',
      message: 'Your study frequency is increasing. Keep up the excellent work!',
      priority: 'low'
    })
  } else if (health.momentum === 'declining') {
    notifications.push({
      type: 'warning',
      title: 'Momentum Declining',
      message: 'Try to maintain your study routine to keep improving.',
      priority: 'medium'
    })
  }

  return notifications
}

async function checkAndAwardMilestone(supabase: any, userId: string, milestoneData: any) {
  try {
    const { type, value } = milestoneData
    const milestoneKey = `${type}_${value}`

    // Get current streaks
    const { data: streaks, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 })
    }

    const achieved = streaks.milestones_achieved || []
    if (achieved.includes(milestoneKey)) {
      return NextResponse.json({ alreadyAchieved: true })
    }

    // Check if milestone is earned
    const currentValue = type === 'daily' ? streaks.current_daily_streak : streaks.current_session_streak
    const bestValue = type === 'daily' ? streaks.best_daily_streak : streaks.best_session_streak
    
    const isEarned = Math.max(currentValue || 0, bestValue || 0) >= value

    if (isEarned) {
      // Award milestone
      const updatedMilestones = [...achieved, milestoneKey]
      
      await supabase
        .from('user_streaks')
        .update({ milestones_achieved: updatedMilestones })
        .eq('user_id', userId)

      return NextResponse.json({ 
        awarded: true, 
        milestone: { type, value, key: milestoneKey }
      })
    }

    return NextResponse.json({ awarded: false, currentValue, requiredValue: value })

  } catch (error) {
    console.error('Error checking milestone:', error)
    return NextResponse.json({ error: 'Failed to check milestone' }, { status: 500 })
  }
}

async function resetUserStreak(supabase: any, userId: string, streakType: string) {
  try {
    const updates: any = {}
    
    if (streakType === 'daily') {
      updates.current_daily_streak = 0
      updates.current_daily_streak_start = null
    } else if (streakType === 'session') {
      updates.current_session_streak = 0
    }

    const { error } = await supabase
      .from('user_streaks')
      .update(updates)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to reset streak' }, { status: 500 })
    }

    return NextResponse.json({ success: true, streakType, reset: true })

  } catch (error) {
    console.error('Error resetting streak:', error)
    return NextResponse.json({ error: 'Failed to reset streak' }, { status: 500 })
  }
}

async function updateStreakManually(supabase: any, userId: string, updateData: any) {
  try {
    // This would be used for admin purposes or streak corrections
    const { error } = await supabase
      .from('user_streaks')
      .update(updateData)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: updateData })

  } catch (error) {
    console.error('Error updating streak:', error)
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
  }
}