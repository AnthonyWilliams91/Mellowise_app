/**
 * Database Utility Functions
 * 
 * Provides optimized database operations with FERPA compliance
 * Implements connection pooling and performance monitoring
 * Based on PostgreSQL optimization best practices
 * 
 * @ferpa Educational data privacy compliant
 * @performance Optimized queries with proper indexing
 */

import { withDatabase, dbPool } from './connection-pool'
import { trackUserAction } from './performance-monitor'
import type { SupabaseClient } from '@supabase/supabase-js'

// Common database operation types
export interface DatabaseOperation<T> {
  data: T | null
  error: Error | null
  count?: number
}

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: { column: string; ascending: boolean }
  select?: string
}

/**
 * Optimized user profile operations
 * Uses idx_user_profiles_email_tier_active index
 */
export async function getUserProfile(
  userId: string,
  trackAccess: boolean = true
): Promise<DatabaseOperation<any>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (trackAccess && !error) {
        await trackUserAction(userId, 'SELECT', 'user_profiles', userId)
      }

      return { data, error }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Optimized question retrieval
 * Uses idx_questions_type_difficulty_active index
 */
export async function getQuestionsByType(
  questionType: string,
  difficulty?: number,
  options: QueryOptions = {}
): Promise<DatabaseOperation<any[]>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      let query = client
        .from('questions')
        .select(options.select || '*')
        .eq('question_type', questionType)
        .eq('is_active', true)

      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending 
        })
      }

      const { data, error, count } = await query

      return { data, error, count }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null,
      count: result.count || undefined
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Optimized game session operations
 * Uses idx_game_sessions_user_type_started index
 */
export async function getUserGameSessions(
  userId: string,
  sessionType?: string,
  options: QueryOptions = {}
): Promise<DatabaseOperation<any[]>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      let query = client
        .from('game_sessions')
        .select(options.select || '*')
        .eq('user_id', userId)

      if (sessionType) {
        query = query.eq('session_type', sessionType)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending 
        })
      } else {
        // Default to most recent first
        query = query.order('started_at', { ascending: false })
      }

      const { data, error, count } = await query

      // Track access for FERPA compliance
      await trackUserAction(userId, 'SELECT', 'game_sessions')

      return { data, error, count }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null,
      count: result.count || undefined
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Optimized question attempt tracking
 * Uses idx_question_attempts_user_question index
 */
export async function recordQuestionAttempt(
  userId: string,
  questionId: string,
  sessionId: string | null,
  selectedAnswer: string,
  isCorrect: boolean,
  responseTime?: number
): Promise<DatabaseOperation<any>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('question_attempts')
        .insert({
          user_id: userId,
          question_id: questionId,
          session_id: sessionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          response_time: responseTime,
          attempted_at: new Date().toISOString()
        })
        .select()
        .single()

      // Track the attempt for FERPA compliance
      await trackUserAction(userId, 'INSERT', 'question_attempts', data?.id)

      return { data, error }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Optimized user analytics operations
 * Uses idx_user_analytics_user_type_date index
 */
export async function recordUserAnalytics(
  userId: string,
  metricType: string,
  metricData: any,
  dateRecorded?: Date
): Promise<DatabaseOperation<any>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('user_analytics')
        .insert({
          user_id: userId,
          metric_type: metricType,
          metric_data: metricData,
          date_recorded: dateRecorded?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      // Track analytics recording for audit
      await trackUserAction(userId, 'INSERT', 'user_analytics', data?.id)

      return { data, error }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Get user analytics with date range
 * Optimized for performance with proper indexing
 */
export async function getUserAnalytics(
  userId: string,
  metricType?: string,
  dateRange?: { start: Date; end: Date },
  options: QueryOptions = {}
): Promise<DatabaseOperation<any[]>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      let query = client
        .from('user_analytics')
        .select(options.select || '*')
        .eq('user_id', userId)

      if (metricType) {
        query = query.eq('metric_type', metricType)
      }

      if (dateRange) {
        query = query
          .gte('date_recorded', dateRange.start.toISOString().split('T')[0])
          .lte('date_recorded', dateRange.end.toISOString().split('T')[0])
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      // Default to most recent first
      query = query.order('date_recorded', { ascending: false })

      const { data, error, count } = await query

      // Track analytics access
      await trackUserAction(userId, 'SELECT', 'user_analytics')

      return { data, error, count }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null,
      count: result.count || undefined
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Optimized subscription operations
 * Uses idx_subscriptions_user_status index
 */
export async function getUserSubscription(
  userId: string
): Promise<DatabaseOperation<any>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return { data, error }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Connection pool health check
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  connectionStats: any
  latency: number
}> {
  const startTime = Date.now()
  
  try {
    const healthy = await dbPool.healthCheck()
    const connectionStats = dbPool.getPoolStats()
    const latency = Date.now() - startTime

    return {
      healthy,
      connectionStats,
      latency
    }
  } catch (error) {
    return {
      healthy: false,
      connectionStats: { activeConnections: 0, maxConnections: 0, poolUtilization: 0 },
      latency: Date.now() - startTime
    }
  }
}

/**
 * Batch operations for better performance
 */
export async function batchInsert<T>(
  tableName: string,
  records: T[],
  userId?: string
): Promise<DatabaseOperation<T[]>> {
  try {
    const result = await withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from(tableName)
        .insert(records)
        .select()

      // Track batch operation for audit
      if (userId) {
        await trackUserAction(userId, 'BATCH_INSERT', tableName, `${records.length} records`)
      }

      return { data, error }
    })

    return {
      data: result.data,
      error: result.error ? new Error(result.error.message) : null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

// Export connection pool stats for monitoring
export { dbPool } from './connection-pool'
export { performanceMonitor } from './performance-monitor'