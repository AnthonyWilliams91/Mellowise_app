/**
 * Analytics Dashboard API
 * 
 * Provides aggregated analytics data for the user dashboard
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

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d' // 7d, 30d, 90d, all
    const includeSnapshots = searchParams.get('snapshots') === 'true'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case 'all':
        startDate.setFullYear(2020) // Far back date
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Fetch dashboard data in parallel
    const [
      overviewStats,
      dailyStats,
      streakData,
      topicPerformance,
      recentSessions,
      performanceSnapshots
    ] = await Promise.all([
      getOverviewStats(supabase, session.user.id, startDateStr, endDateStr),
      getDailyStats(supabase, session.user.id, startDateStr, endDateStr),
      getStreakData(supabase, session.user.id),
      getTopicPerformance(supabase, session.user.id),
      getRecentSessions(supabase, session.user.id, 5),
      includeSnapshots ? getPerformanceSnapshots(supabase, session.user.id, startDateStr, endDateStr) : null
    ])

    const dashboardData = {
      timeframe,
      dateRange: { start: startDateStr, end: endDateStr },
      overview: overviewStats,
      dailyStats,
      streaks: streakData,
      topicPerformance,
      recentSessions,
      ...(includeSnapshots && { performanceSnapshots })
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function getOverviewStats(supabase: any, userId: string, startDate: string, endDate: string) {
  try {
    // Get aggregated stats from daily_stats table
    const { data: dailyAgg, error: dailyError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date_recorded', startDate)
      .lte('date_recorded', endDate)

    if (dailyError) throw dailyError

    // Calculate totals and averages
    const totals = dailyAgg.reduce((acc, day) => ({
      totalSessions: acc.totalSessions + (day.sessions_played || 0),
      totalQuestions: acc.totalQuestions + (day.total_questions_answered || 0),
      totalCorrect: acc.totalCorrect + (day.total_correct_answers || 0),
      totalTimeSpent: acc.totalTimeSpent + (day.total_time_spent || 0),
      activeDays: acc.activeDays + (day.sessions_played > 0 ? 1 : 0)
    }), {
      totalSessions: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalTimeSpent: 0,
      activeDays: 0
    })

    const overallAccuracy = totals.totalQuestions > 0 
      ? (totals.totalCorrect / totals.totalQuestions) * 100 
      : 0

    const avgSessionLength = totals.totalSessions > 0 
      ? totals.totalTimeSpent / totals.totalSessions / 1000 / 60 // minutes
      : 0

    const avgQuestionsPerSession = totals.totalSessions > 0
      ? totals.totalQuestions / totals.totalSessions
      : 0

    return {
      ...totals,
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      avgSessionLength: Math.round(avgSessionLength * 100) / 100,
      avgQuestionsPerSession: Math.round(avgQuestionsPerSession * 100) / 100,
      studyDaysThisPeriod: totals.activeDays
    }

  } catch (error) {
    console.error('Error fetching overview stats:', error)
    return null
  }
}

async function getDailyStats(supabase: any, userId: string, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date_recorded', startDate)
      .lte('date_recorded', endDate)
      .order('date_recorded', { ascending: true })

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error fetching daily stats:', error)
    return []
  }
}

async function getStreakData(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return data || {
      current_daily_streak: 0,
      current_session_streak: 0,
      best_daily_streak: 0,
      best_session_streak: 0,
      milestones_achieved: []
    }

  } catch (error) {
    console.error('Error fetching streak data:', error)
    return null
  }
}

async function getTopicPerformance(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('topic_performance')
      .select('*')
      .eq('user_id', userId)
      .order('last_practiced_at', { ascending: false })

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error fetching topic performance:', error)
    return []
  }
}

async function getRecentSessions(supabase: any, userId: string, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('session_performance')
      .select(`
        *,
        game_sessions!inner(
          id, session_type, started_at, ended_at, final_score,
          questions_answered, correct_answers, lives_remaining,
          difficulty_level
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error fetching recent sessions:', error)
    return []
  }
}

async function getPerformanceSnapshots(supabase: any, userId: string, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('performance_snapshots')
      .select('*')
      .eq('user_id', userId)
      .gte('snapshot_date', startDate)
      .lte('snapshot_date', endDate)
      .order('snapshot_date', { ascending: true })

    if (error) throw error

    return data || []

  } catch (error) {
    console.error('Error fetching performance snapshots:', error)
    return []
  }
}