/**
 * Multi-Tenant Database Utilities
 * 
 * Extends existing database utilities with multi-tenant support
 * Implements Context7 Nile patterns for tenant isolation
 * 
 * @architecture Multi-tenant with composite primary keys (tenant_id, id)
 * @security Tenant context isolation via session variables
 * @performance Optimized queries with tenant-aware indexing
 */

import { withDatabase, dbPool } from './connection-pool'
import { trackUserAction } from './performance-monitor'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  MultiTenantEntity,
  UserProfileMT,
  QuestionMT,
  GameSessionMT,
  QuestionAttemptMT,
  UserAnalyticsMT,
  SubscriptionMT,
  MTQueryOptions,
  MTDatabaseContext
} from '../../types/tenant'

// Common database operation result type
interface MTDatabaseOperation<T> {
  data: T | null
  error: Error | null
  count?: number
}

/**
 * Multi-Tenant Database Session Manager
 * Handles tenant context setting following Nile patterns
 */
class MTDatabaseSession {
  private tenantContext: string | null = null

  /**
   * Set tenant context for database session (Nile pattern: SET nile.tenant_id)
   * This ensures all subsequent queries are isolated to the tenant
   */
  async setTenantContext(
    client: SupabaseClient,
    tenantId: string
  ): Promise<void> {
    try {
      // Use the database function we created in migration
      await client.rpc('set_tenant_context', { tenant_uuid: tenantId })
      this.tenantContext = tenantId
    } catch (error) {
      console.error('Failed to set tenant context:', error)
      throw new Error('Tenant context initialization failed')
    }
  }

  /**
   * Clear tenant context
   */
  async clearTenantContext(client: SupabaseClient): Promise<void> {
    try {
      await client.rpc('clear_tenant_context')
      this.tenantContext = null
    } catch (error) {
      console.warn('Failed to clear tenant context:', error)
    }
  }

  getCurrentTenantId(): string | null {
    return this.tenantContext
  }
}

/**
 * Execute database operation with tenant context
 */
export async function withTenantContext<T>(
  tenantId: string,
  operation: (client: SupabaseClient, session: MTDatabaseSession) => Promise<T>
): Promise<T> {
  return withDatabase(async (client: SupabaseClient) => {
    const session = new MTDatabaseSession()
    
    try {
      // Set tenant context for the session
      await session.setTenantContext(client, tenantId)
      
      // Execute operation with tenant context
      return await operation(client, session)
    } finally {
      // Clean up context
      await session.clearTenantContext(client)
    }
  })
}

/**
 * Multi-tenant user profile operations
 * Uses composite primary key (tenant_id, id)
 */
export async function getMTUserProfile(
  tenantId: string,
  userId: string,
  trackAccess: boolean = true
): Promise<MTDatabaseOperation<UserProfileMT>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', userId)
        .single()

      if (trackAccess && !error) {
        await trackUserAction(userId, 'SELECT', 'user_profiles', `${tenantId}:${userId}`)
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
 * Multi-tenant question operations
 * Handles tenant-specific question libraries
 */
export async function getMTQuestionsByType(
  tenantId: string,
  questionType: string,
  difficulty?: number,
  options: Partial<MTQueryOptions> = {}
): Promise<MTDatabaseOperation<QuestionMT[]>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      let query = client
        .from('questions')
        .select(options.select || '*')
        .eq('tenant_id', tenantId)
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

      return { data: data as QuestionMT[] | null, error, count }
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
 * Multi-tenant game session operations
 */
export async function getMTUserGameSessions(
  tenantId: string,
  userId: string,
  sessionType?: string,
  options: Partial<MTQueryOptions> = {}
): Promise<MTDatabaseOperation<GameSessionMT[]>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      let query = client
        .from('game_sessions')
        .select(options.select || '*')
        .eq('tenant_id', tenantId)
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
        query = query.order('started_at', { ascending: false })
      }

      const { data, error, count } = await query

      // Track access for FERPA compliance
      await trackUserAction(userId, 'SELECT', 'game_sessions')

      return { data: data as GameSessionMT[] | null, error, count }
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
 * Multi-tenant question attempt recording
 */
export async function recordMTQuestionAttempt(
  tenantId: string,
  userId: string,
  questionId: string,
  sessionId: string | null,
  selectedAnswer: string,
  isCorrect: boolean,
  responseTime?: number
): Promise<MTDatabaseOperation<QuestionAttemptMT>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      const attemptData = {
        tenant_id: tenantId,
        user_id: userId,
        question_id: questionId,
        session_id: sessionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        response_time: responseTime,
        attempted_at: new Date().toISOString()
      }

      const { data, error } = await client
        .from('question_attempts')
        .insert(attemptData)
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
 * Multi-tenant user analytics recording
 */
export async function recordMTUserAnalytics(
  tenantId: string,
  userId: string,
  metricType: string,
  metricData: any,
  dateRecorded?: Date
): Promise<MTDatabaseOperation<UserAnalyticsMT>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      const analyticsData = {
        tenant_id: tenantId,
        user_id: userId,
        metric_type: metricType,
        metric_data: metricData,
        date_recorded: dateRecorded?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }

      const { data, error } = await client
        .from('user_analytics')
        .insert(analyticsData)
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
 * Multi-tenant user analytics retrieval
 */
export async function getMTUserAnalytics(
  tenantId: string,
  userId: string,
  metricType?: string,
  dateRange?: { start: Date; end: Date },
  options: Partial<MTQueryOptions> = {}
): Promise<MTDatabaseOperation<UserAnalyticsMT[]>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      let query = client
        .from('user_analytics')
        .select(options.select || '*')
        .eq('tenant_id', tenantId)
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

      query = query.order('date_recorded', { ascending: false })

      const { data, error, count } = await query

      // Track analytics access
      await trackUserAction(userId, 'SELECT', 'user_analytics')

      return { data: data as UserAnalyticsMT[] | null, error, count }
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
 * Multi-tenant subscription operations
 */
export async function getMTUserSubscription(
  tenantId: string,
  userId: string
): Promise<MTDatabaseOperation<SubscriptionMT>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      const { data, error } = await client
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
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
 * Multi-tenant batch operations for better performance
 */
export async function mtBatchInsert<T extends MultiTenantEntity>(
  tenantId: string,
  tableName: string,
  records: T[],
  userId?: string
): Promise<MTDatabaseOperation<T[]>> {
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      // Ensure all records have the correct tenant_id
      const tenantRecords = records.map(record => ({
        ...record,
        tenant_id: tenantId
      }))

      const { data, error } = await client
        .from(tableName)
        .insert(tenantRecords)
        .select()

      // Track batch operation for audit
      if (userId) {
        await trackUserAction(userId, 'BATCH_INSERT', tableName, `${tenantId}:${records.length} records`)
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
 * Multi-tenant connection health check
 */
export async function checkMTDatabaseHealth(tenantId: string): Promise<{
  healthy: boolean
  tenantExists: boolean
  connectionStats: any
  latency: number
}> {
  const startTime = Date.now()
  
  try {
    const result = await withTenantContext(tenantId, async (client) => {
      // Check if tenant exists and is accessible
      const { data: tenant, error: tenantError } = await client
        .from('tenants')
        .select('id, status')
        .eq('id', tenantId)
        .single()

      return {
        tenant,
        tenantError,
        healthy: !tenantError && tenant?.status === 'active'
      }
    })

    const connectionStats = dbPool.getPoolStats()
    const latency = Date.now() - startTime

    return {
      healthy: result.healthy,
      tenantExists: !!result.tenant,
      connectionStats,
      latency
    }
  } catch (error) {
    return {
      healthy: false,
      tenantExists: false,
      connectionStats: { activeConnections: 0, maxConnections: 0, poolUtilization: 0 },
      latency: Date.now() - startTime
    }
  }
}

/**
 * Multi-tenant data migration utilities
 */
export class MTDataMigration {
  /**
   * Migrate single-tenant user to specific tenant
   */
  static async migrateSingleTenantUser(
    userId: string,
    targetTenantId: string,
    role: 'admin' | 'instructor' | 'student' = 'student'
  ): Promise<boolean> {
    try {
      return await withTenantContext(targetTenantId, async (client) => {
        // Add user to tenant_users
        const { error: tenantUserError } = await client
          .from('tenant_users')
          .insert({
            tenant_id: targetTenantId,
            user_id: userId,
            role: role,
            status: 'active',
            joined_at: new Date().toISOString()
          })

        if (tenantUserError) {
          console.error('Failed to create tenant user relationship:', tenantUserError)
          return false
        }

        // Update user_profiles with tenant_id
        const { error: profileError } = await client
          .from('user_profiles')
          .update({ tenant_id: targetTenantId })
          .eq('id', userId)
          .is('tenant_id', null) // Only update if not already assigned

        if (profileError) {
          console.warn('User profile may already be assigned to tenant:', profileError)
        }

        return true
      })
    } catch (error) {
      console.error('User migration failed:', error)
      return false
    }
  }

  /**
   * Verify data isolation between tenants
   */
  static async verifyDataIsolation(
    tenantId1: string,
    tenantId2: string
  ): Promise<{
    isolated: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    try {
      // Test user profiles isolation
      const tenant1Profiles = await withTenantContext(tenantId1, async (client) => {
        const { data } = await client.from('user_profiles').select('id, tenant_id')
        return data || []
      })

      const tenant2Profiles = await withTenantContext(tenantId2, async (client) => {
        const { data } = await client.from('user_profiles').select('id, tenant_id')
        return data || []
      })

      // Check for cross-tenant data leakage
      const tenant1UserIds = tenant1Profiles.map(p => p.id)
      const tenant2UserIds = tenant2Profiles.map(p => p.id)
      const overlap = tenant1UserIds.filter(id => tenant2UserIds.includes(id))

      if (overlap.length > 0) {
        issues.push(`User profile overlap detected: ${overlap.length} users`)
      }

      // Verify tenant_id consistency
      const invalidTenant1 = tenant1Profiles.filter(p => p.tenant_id !== tenantId1)
      const invalidTenant2 = tenant2Profiles.filter(p => p.tenant_id !== tenantId2)

      if (invalidTenant1.length > 0) {
        issues.push(`Tenant 1 has ${invalidTenant1.length} profiles with wrong tenant_id`)
      }

      if (invalidTenant2.length > 0) {
        issues.push(`Tenant 2 has ${invalidTenant2.length} profiles with wrong tenant_id`)
      }

      return {
        isolated: issues.length === 0,
        issues
      }
    } catch (error) {
      issues.push(`Data isolation check failed: ${error}`)
      return { isolated: false, issues }
    }
  }
}

// Export connection pool stats for monitoring
export { dbPool } from './connection-pool'
export { performanceMonitor } from './performance-monitor'