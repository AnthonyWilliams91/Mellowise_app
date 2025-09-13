/**
 * Analytics Export API
 * 
 * Provides data export functionality for user analytics
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
    const format = searchParams.get('format') || 'json'
    const timeframe = searchParams.get('timeframe') || '30d'
    const includeRaw = searchParams.get('includeRaw') === 'true'

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
        startDate.setFullYear(2020)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Fetch comprehensive analytics data
    const [
      profileData,
      dailyStats,
      sessionPerformance,
      topicPerformance,
      streakData,
      rawSessions,
      rawAttempts
    ] = await Promise.all([
      getUserProfile(supabase, session.user.id),
      getDailyStats(supabase, session.user.id, startDateStr, endDateStr),
      getSessionPerformance(supabase, session.user.id, startDateStr, endDateStr),
      getTopicPerformance(supabase, session.user.id),
      getStreakData(supabase, session.user.id),
      includeRaw ? getRawSessions(supabase, session.user.id, startDateStr, endDateStr) : null,
      includeRaw ? getRawAttempts(supabase, session.user.id, startDateStr, endDateStr) : null
    ])

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId: session.user.id,
        userEmail: session.user.email,
        timeframe,
        dateRange: { start: startDateStr, end: endDateStr },
        includesRawData: includeRaw,
        dataVersion: '1.0'
      },
      profile: profileData,
      summary: calculateSummaryStats(dailyStats, sessionPerformance, topicPerformance),
      dailyStats,
      sessionPerformance,
      topicPerformance,
      streakData,
      ...(includeRaw && {
        rawData: {
          sessions: rawSessions,
          questionAttempts: rawAttempts
        }
      })
    }

    // Return appropriate format
    if (format === 'csv') {
      return generateCSVExport(exportData)
    } else {
      // JSON format
      const response = NextResponse.json(exportData)
      response.headers.set(
        'Content-Disposition', 
        `attachment; filename="mellowise-analytics-${timeframe}-${endDateStr}.json"`
      )
      return response
    }

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function getUserProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email, full_name, target_test_date, current_score, subscription_tier, created_at')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

async function getDailyStats(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date_recorded', startDate)
    .lte('date_recorded', endDate)
    .order('date_recorded', { ascending: true })

  if (error) throw error
  return data || []
}

async function getSessionPerformance(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('session_performance')
    .select(`
      *,
      game_sessions!inner(*)
    `)
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function getTopicPerformance(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('topic_performance')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

async function getStreakData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

async function getRawSessions(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startDate)
    .lte('started_at', endDate)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function getRawAttempts(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('question_attempts')
    .select(`
      *,
      questions!inner(question_type, difficulty)
    `)
    .eq('user_id', userId)
    .gte('attempted_at', startDate)
    .lte('attempted_at', endDate)
    .order('attempted_at', { ascending: false })
    .limit(1000) // Limit to prevent huge exports

  if (error) throw error
  return data || []
}

function calculateSummaryStats(dailyStats: any[], sessionPerformance: any[], topicPerformance: any[]) {
  const totalDays = dailyStats.length
  const activeDays = dailyStats.filter(d => d.sessions_played > 0).length
  const totalSessions = dailyStats.reduce((sum, d) => sum + (d.sessions_played || 0), 0)
  const totalQuestions = dailyStats.reduce((sum, d) => sum + (d.total_questions_answered || 0), 0)
  const totalCorrect = dailyStats.reduce((sum, d) => sum + (d.total_correct_answers || 0), 0)
  const totalTimeSpent = dailyStats.reduce((sum, d) => sum + (d.total_time_spent || 0), 0)
  
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  const avgSessionLength = totalSessions > 0 ? totalTimeSpent / totalSessions / 1000 / 60 : 0
  const consistencyRate = totalDays > 0 ? (activeDays / totalDays) * 100 : 0
  
  const bestSession = sessionPerformance.reduce((best, session) => {
    return session.accuracy_percentage > (best?.accuracy_percentage || 0) ? session : best
  }, null)

  return {
    timeframe: {
      totalDays,
      activeDays,
      consistencyRate: Math.round(consistencyRate * 100) / 100
    },
    activity: {
      totalSessions,
      totalQuestions,
      totalCorrect,
      totalTimeSpent,
      avgSessionLength: Math.round(avgSessionLength * 100) / 100
    },
    performance: {
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      bestSessionAccuracy: bestSession?.accuracy_percentage || 0,
      bestSessionScore: bestSession?.game_sessions?.final_score || 0
    },
    topics: topicPerformance.map(topic => ({
      type: topic.topic_type,
      accuracy: topic.current_accuracy,
      totalQuestions: topic.total_questions,
      difficulty: topic.current_difficulty
    }))
  }
}

function generateCSVExport(data: any) {
  // Create CSV content for daily stats
  const csvRows = [
    'Date,Sessions,Questions,Correct,Accuracy,Study Time (min),Streak Day',
    ...data.dailyStats.map((day: any) => [
      day.date_recorded,
      day.sessions_played || 0,
      day.total_questions_answered || 0,
      day.total_correct_answers || 0,
      day.avg_accuracy?.toFixed(1) || '0.0',
      Math.round((day.total_time_spent || 0) / 1000 / 60),
      day.is_streak_day ? 'Yes' : 'No'
    ].join(','))
  ]

  const csvContent = csvRows.join('\n')
  
  const response = new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="mellowise-analytics-${data.metadata.timeframe}-${data.metadata.dateRange.end}.csv"`
    }
  })

  return response
}