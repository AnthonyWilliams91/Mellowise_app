/**
 * Performance Insights API
 * 
 * Generates smart performance insights and patterns from user analytics data
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { patternRecognition } from '@/lib/insights/patternRecognition'
import { InsightsDashboardData } from '@/types/insights'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lookbackDays = parseInt(searchParams.get('lookback') || '30')

    // Calculate date range for analysis
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - lookbackDays)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Fetch required analytics data in parallel
    const [
      sessionPerformanceData,
      dailyStatsData,
      streakData,
      topicPerformanceData
    ] = await Promise.all([
      getSessionPerformanceData(supabase, session.user.id, startDateStr, endDateStr),
      getDailyStatsData(supabase, session.user.id, startDateStr, endDateStr),
      getStreakData(supabase, session.user.id),
      getTopicPerformanceData(supabase, session.user.id)
    ])

    // Generate performance patterns
    const completionRatePattern = patternRecognition.analyzeCompletionRatePattern(
      sessionPerformanceData,
      dailyStatsData
    )

    const streakPerformancePattern = patternRecognition.analyzeStreakPerformance(
      streakData,
      sessionPerformanceData
    )

    const timeBasedPattern = patternRecognition.analyzeTimeBasedPerformance(
      sessionPerformanceData,
      dailyStatsData
    )

    const topicPerformancePatterns = patternRecognition.analyzeTopicPerformance(
      topicPerformanceData
    )

    // Generate insights from patterns
    const insights = patternRecognition.generateInsights(
      completionRatePattern,
      streakPerformancePattern,
      timeBasedPattern,
      topicPerformancePatterns
    )

    // Calculate insight metrics
    const metrics = calculateInsightMetrics(insights)

    // Build response
    const insightsDashboardData: InsightsDashboardData = {
      insights,
      patterns: {
        completion_rate: completionRatePattern || {
          current_rate: 0,
          previous_period_rate: 0,
          trend: 'stable',
          change_percentage: 0,
          sessions_analyzed: 0
        },
        streak_performance: streakPerformancePattern,
        time_based: timeBasedPattern || {
          optimal_study_hours: [],
          peak_performance_time: '12:00',
          performance_by_hour: {},
          session_completion_by_time: {}
        },
        topic_performance: topicPerformancePatterns,
        difficulty_progression: {
          current_difficulty: calculateCurrentDifficulty(sessionPerformanceData),
          progression_rate: calculateProgressionRate(sessionPerformanceData),
          difficulty_comfort_zone: [3, 6],
          breakthrough_opportunities: [7, 8, 9]
        }
      },
      metrics,
      generated_at: new Date().toISOString()
    }

    return NextResponse.json(insightsDashboardData)

  } catch (error) {
    console.error('Insights generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function getSessionPerformanceData(
  supabase: any, 
  userId: string, 
  startDate: string, 
  endDate: string
) {
  try {
    const { data, error } = await supabase
      .from('session_performance')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .limit(50) // Limit for performance

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching session performance data:', error)
    return []
  }
}

async function getDailyStatsData(
  supabase: any, 
  userId: string, 
  startDate: string, 
  endDate: string
) {
  try {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date_recorded', startDate)
      .lte('date_recorded', endDate)
      .order('date_recorded', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching daily stats data:', error)
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
      best_accuracy_streak: 0,
      milestones_achieved: []
    }
  } catch (error) {
    console.error('Error fetching streak data:', error)
    return {
      current_daily_streak: 0,
      current_session_streak: 0,
      best_daily_streak: 0,
      best_session_streak: 0,
      best_accuracy_streak: 0,
      milestones_achieved: []
    }
  }
}

async function getTopicPerformanceData(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('topic_performance')
      .select('*')
      .eq('user_id', userId)
      .order('last_practiced_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching topic performance data:', error)
    return []
  }
}

function calculateInsightMetrics(insights: any[]) {
  const totalInsights = insights.length
  
  const insightsByCategory = insights.reduce((acc, insight) => {
    acc[insight.category] = (acc[insight.category] || 0) + 1
    return acc
  }, {})

  const insightsByPriority = insights.reduce((acc, insight) => {
    acc[insight.priority] = (acc[insight.priority] || 0) + 1
    return acc
  }, {})

  // Mock user agreement rate (would be calculated from feedback data in production)
  const userAgreementRate = 85 // 85% default

  // Mock effectiveness score (would be calculated from user outcomes)
  const effectivenessScore = 78 // 78% default

  return {
    total_insights_generated: totalInsights,
    insights_by_category: insightsByCategory,
    insights_by_priority: insightsByPriority,
    user_agreement_rate: userAgreementRate,
    insight_effectiveness_score: effectivenessScore
  }
}

function calculateCurrentDifficulty(sessions: any[]): number {
  if (sessions.length === 0) return 1
  
  const recentSessions = sessions.slice(0, 5)
  const avgDifficulty = recentSessions.reduce((sum, session) => 
    sum + (session.final_difficulty || 1), 0
  ) / recentSessions.length
  
  return Math.round(avgDifficulty)
}

function calculateProgressionRate(sessions: any[]): number {
  if (sessions.length < 10) return 0
  
  const recent5 = sessions.slice(0, 5)
  const previous5 = sessions.slice(5, 10)
  
  const recentAvgDifficulty = recent5.reduce((sum, s) => 
    sum + (s.final_difficulty || 1), 0
  ) / recent5.length
  
  const previousAvgDifficulty = previous5.reduce((sum, s) => 
    sum + (s.final_difficulty || 1), 0
  ) / previous5.length
  
  return Math.round((recentAvgDifficulty - previousAvgDifficulty) * 100) / 100
}