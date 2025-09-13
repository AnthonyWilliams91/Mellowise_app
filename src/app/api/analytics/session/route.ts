/**
 * Session Analytics API
 * 
 * Handles session performance tracking and analytics data
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, performanceData } = body

    if (!sessionId || !performanceData) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, performanceData' 
      }, { status: 400 })
    }

    // Calculate session performance metrics
    const sessionPerformance = {
      session_id: sessionId,
      user_id: session.user.id,
      total_time_spent: performanceData.totalTimeSpent || 0,
      avg_response_time: performanceData.avgResponseTime || 0,
      accuracy_percentage: performanceData.accuracyPercentage || 0,
      streak_count: performanceData.streakCount || 0,
      max_streak: performanceData.maxStreak || 0,
      logical_reasoning_correct: performanceData.topicBreakdown?.logicalReasoning?.correct || 0,
      logical_reasoning_total: performanceData.topicBreakdown?.logicalReasoning?.total || 0,
      logic_games_correct: performanceData.topicBreakdown?.logicGames?.correct || 0,
      logic_games_total: performanceData.topicBreakdown?.logicGames?.total || 0,
      reading_comprehension_correct: performanceData.topicBreakdown?.readingComprehension?.correct || 0,
      reading_comprehension_total: performanceData.topicBreakdown?.readingComprehension?.total || 0,
      difficulty_progression: performanceData.difficultyProgression || [],
      final_difficulty: performanceData.finalDifficulty || 1,
      pauses_used: performanceData.pausesUsed || 0,
      hints_used: performanceData.hintsUsed || 0,
      power_ups_used: performanceData.powerUpsUsed || {}
    }

    // Store session performance data
    const { data: performance, error: perfError } = await supabase
      .from('session_performance')
      .insert(sessionPerformance)
      .select()
      .single()

    if (perfError) {
      console.error('Session performance insert error:', perfError)
      return NextResponse.json({ 
        error: 'Failed to store session performance' 
      }, { status: 500 })
    }

    // Update daily statistics
    const today = new Date().toISOString().split('T')[0]
    const { data: dailyStats, error: dailyError } = await supabase
      .rpc('update_daily_stats', { 
        p_user_id: session.user.id,
        p_date: today
      })

    if (dailyError) {
      console.error('Daily stats update error:', dailyError)
      // Don't fail the request if daily stats update fails
    }

    // Update user streaks
    await updateUserStreaks(supabase, session.user.id, performanceData)

    // Update topic performance
    await updateTopicPerformance(supabase, session.user.id, performanceData)

    return NextResponse.json({ 
      success: true, 
      performanceId: performance.id,
      dailyStatsUpdated: !dailyError
    })

  } catch (error) {
    console.error('Session analytics error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('session_performance')
      .select(`
        *,
        game_sessions!inner(
          id, session_type, started_at, ended_at, final_score,
          questions_answered, correct_answers, lives_remaining
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: sessions, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Session performance fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch session performance' 
      }, { status: 500 })
    }

    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('Session analytics GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function updateUserStreaks(supabase: any, userId: string, performanceData: any) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get or create user streaks record
    const { data: streaks, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Create new streaks record
      const { data: newStreaks, error: createError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_daily_streak: 1,
          current_session_streak: performanceData.streakCount || 0,
          best_session_streak: performanceData.maxStreak || 0,
          current_daily_streak_start: today,
          last_activity_date: today
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user streaks:', createError)
      }
      return
    }

    if (error) {
      console.error('Failed to fetch user streaks:', error)
      return
    }

    // Update streaks logic
    const updates: any = {
      last_activity_date: today,
      current_session_streak: performanceData.streakCount || 0
    }

    // Update best streaks if current is better
    if ((performanceData.maxStreak || 0) > (streaks.best_session_streak || 0)) {
      updates.best_session_streak = performanceData.maxStreak
    }

    // Update daily streak logic
    const lastActivity = streaks.last_activity_date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActivity === yesterdayStr) {
      // Continuing streak
      updates.current_daily_streak = (streaks.current_daily_streak || 0) + 1
    } else if (lastActivity !== today) {
      // New streak or broken streak
      updates.current_daily_streak = 1
      updates.current_daily_streak_start = today
    }

    // Update best daily streak
    if ((updates.current_daily_streak || streaks.current_daily_streak) > (streaks.best_daily_streak || 0)) {
      updates.best_daily_streak = updates.current_daily_streak || streaks.current_daily_streak
    }

    await supabase
      .from('user_streaks')
      .update(updates)
      .eq('user_id', userId)

  } catch (error) {
    console.error('Error updating user streaks:', error)
  }
}

async function updateTopicPerformance(supabase: any, userId: string, performanceData: any) {
  try {
    const topicBreakdown = performanceData.topicBreakdown || {}
    
    for (const [topicKey, data] of Object.entries(topicBreakdown)) {
      const topicType = topicKey === 'logicalReasoning' ? 'logical_reasoning' :
                       topicKey === 'logicGames' ? 'logic_games' :
                       topicKey === 'readingComprehension' ? 'reading_comprehension' : null
      
      if (!topicType || !data || typeof data !== 'object') continue

      const typedData = data as { correct: number; total: number; avgResponseTime?: number }
      
      // Get or create topic performance record
      const { data: topic, error } = await supabase
        .from('topic_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_type', topicType)
        .single()

      if (error && error.code === 'PGRST116') {
        // Create new topic record
        await supabase
          .from('topic_performance')
          .insert({
            user_id: userId,
            topic_type: topicType,
            total_questions: typedData.total,
            correct_answers: typedData.correct,
            current_accuracy: typedData.total > 0 ? (typedData.correct / typedData.total) * 100 : 0,
            avg_response_time: typedData.avgResponseTime || null,
            last_practiced_at: new Date().toISOString()
          })
        continue
      }

      if (error) {
        console.error('Failed to fetch topic performance:', error)
        continue
      }

      // Update existing topic record
      const newTotal = (topic.total_questions || 0) + typedData.total
      const newCorrect = (topic.correct_answers || 0) + typedData.correct
      const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 0

      await supabase
        .from('topic_performance')
        .update({
          total_questions: newTotal,
          correct_answers: newCorrect,
          current_accuracy: newAccuracy,
          avg_response_time: typedData.avgResponseTime || topic.avg_response_time,
          last_practiced_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('topic_type', topicType)
    }

  } catch (error) {
    console.error('Error updating topic performance:', error)
  }
}