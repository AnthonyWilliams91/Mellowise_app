/**
 * Database Performance Monitor
 * 
 * Provides baseline performance metrics and monitoring capabilities
 * Implements FERPA-compliant audit logging for educational data access
 * Based on Context7 PostgreSQL optimization research
 * 
 * @ferpa Compliant audit logging and performance tracking
 * @performance Real-time query performance monitoring
 */

import { withDatabase } from './connection-pool'
import type { SupabaseClient } from '@supabase/supabase-js'

// Performance metric types
interface DatabaseMetrics {
  tableName: string
  tableSize: string
  indexCount: number
  avgQueryTime?: number
  cacheHitRatio: number
}

interface QueryPerformanceMetrics {
  totalQueries: number
  avgResponseTime: number
  cacheHitRatio: number
  errorRate: number
  connectionCount: number
}

interface AuditLogEntry {
  userId: string | null
  action: string
  tableName: string
  recordId: string | null
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

/**
 * Performance Monitor Service
 * Tracks database performance and provides optimization insights
 */
export class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor
  private metricsCache: Map<string, any> = new Map()
  private cacheTimeout: number = 300000 // 5 minutes

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor()
    }
    return DatabasePerformanceMonitor.instance
  }

  /**
   * Get baseline performance metrics for all tables
   */
  async getBaselineMetrics(): Promise<DatabaseMetrics[]> {
    const cacheKey = 'baseline-metrics'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const metrics = await withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .rpc('get_performance_metrics')
        .select('*')

      if (error) {
        console.error('Failed to fetch baseline metrics:', error)
        // Fallback to basic table size queries
        return this.getFallbackMetrics(client)
      }

      return data || []
    })

    this.setCachedData(cacheKey, metrics)
    return metrics
  }

  /**
   * Fallback metrics collection when custom views aren't available
   */
  private async getFallbackMetrics(client: SupabaseClient): Promise<DatabaseMetrics[]> {
    const tables = [
      'user_profiles',
      'questions', 
      'game_sessions',
      'question_attempts',
      'user_analytics',
      'subscriptions',
      'audit_logs'
    ]

    const metrics: DatabaseMetrics[] = []

    for (const table of tables) {
      try {
        const { count } = await client
          .from(table)
          .select('*', { count: 'exact', head: true })

        metrics.push({
          tableName: table,
          tableSize: `${count || 0} rows`,
          indexCount: 0,
          cacheHitRatio: 0
        })
      } catch (error) {
        console.warn(`Failed to get metrics for table ${table}:`, error)
      }
    }

    return metrics
  }

  /**
   * Get query performance statistics
   */
  async getQueryPerformanceMetrics(): Promise<QueryPerformanceMetrics> {
    const cacheKey = 'query-performance'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const metrics = await withDatabase(async (client: SupabaseClient) => {
      try {
        const { data, error } = await client
          .rpc('get_query_performance_baseline')
          .select('*')
          .single()

        if (error) throw error

        return {
          totalQueries: data.tup_returned + data.tup_fetched,
          avgResponseTime: (data.blk_read_time + data.blk_write_time) / 2,
          cacheHitRatio: data.cache_hit_ratio,
          errorRate: data.deadlocks,
          connectionCount: data.numbackends
        }
      } catch (error) {
        console.error('Failed to fetch query performance:', error)
        return {
          totalQueries: 0,
          avgResponseTime: 0,
          cacheHitRatio: 0,
          errorRate: 0,
          connectionCount: 0
        }
      }
    })

    this.setCachedData(cacheKey, metrics)
    return metrics
  }

  /**
   * Log FERPA-compliant audit entry
   */
  async logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      await withDatabase(async (client: SupabaseClient) => {
        const { error } = await client
          .from('audit_logs')
          .insert({
            user_id: entry.userId,
            action: entry.action,
            table_name: entry.tableName,
            record_id: entry.recordId,
            ip_address: entry.ipAddress,
            user_agent: entry.userAgent,
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('Failed to log audit event:', error)
        }
      })
    } catch (error) {
      console.error('Audit logging error:', error)
    }
  }

  /**
   * Get recent audit logs for compliance reporting
   */
  async getAuditLogs(
    limit: number = 100,
    userId?: string
  ): Promise<AuditLogEntry[]> {
    return withDatabase(async (client: SupabaseClient) => {
      let query = client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch audit logs:', error)
        return []
      }

      return data.map(log => ({
        userId: log.user_id,
        action: log.action,
        tableName: log.table_name,
        recordId: log.record_id,
        timestamp: new Date(log.created_at),
        ipAddress: log.ip_address,
        userAgent: log.user_agent
      }))
    })
  }

  /**
   * Index usage analysis for optimization
   */
  async getIndexUsageStats(): Promise<any[]> {
    const cacheKey = 'index-usage'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    const stats = await withDatabase(async (client: SupabaseClient) => {
      try {
        const { data, error } = await client
          .rpc('get_index_usage_stats')
          .select('*')

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Failed to fetch index usage:', error)
        return []
      }
    })

    this.setCachedData(cacheKey, stats)
    return stats
  }

  /**
   * Cache management
   */
  private getCachedData(key: string): any | null {
    const cached = this.metricsCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Clear all cached metrics (force refresh)
   */
  clearCache(): void {
    this.metricsCache.clear()
  }

  /**
   * Generate performance report for administrators
   */
  async generatePerformanceReport(): Promise<{
    baseline: DatabaseMetrics[]
    queryPerformance: QueryPerformanceMetrics
    indexUsage: any[]
    recommendations: string[]
  }> {
    const [baseline, queryPerformance, indexUsage] = await Promise.all([
      this.getBaselineMetrics(),
      this.getQueryPerformanceMetrics(),
      this.getIndexUsageStats()
    ])

    const recommendations = this.generateRecommendations(
      baseline,
      queryPerformance,
      indexUsage
    )

    return {
      baseline,
      queryPerformance,
      indexUsage,
      recommendations
    }
  }

  /**
   * Generate optimization recommendations based on metrics
   */
  private generateRecommendations(
    baseline: DatabaseMetrics[],
    queryPerformance: QueryPerformanceMetrics,
    indexUsage: any[]
  ): string[] {
    const recommendations: string[] = []

    // Cache hit ratio recommendations
    if (queryPerformance.cacheHitRatio < 90) {
      recommendations.push('Consider increasing shared_buffers for better cache hit ratio')
    }

    // Index usage recommendations
    const unusedIndexes = indexUsage.filter(idx => idx.idx_scan === 0)
    if (unusedIndexes.length > 0) {
      recommendations.push(`Consider removing ${unusedIndexes.length} unused indexes`)
    }

    // Connection count recommendations
    if (queryPerformance.connectionCount > 50) {
      recommendations.push('High connection count detected, consider connection pooling optimization')
    }

    // Table size recommendations
    const largeTables = baseline.filter(table => 
      table.tableSize.includes('MB') || table.tableSize.includes('GB')
    )
    if (largeTables.length > 0) {
      recommendations.push('Large tables detected, consider partitioning for better performance')
    }

    return recommendations
  }
}

// Export singleton instance
export const performanceMonitor = DatabasePerformanceMonitor.getInstance()

// Utility functions
export async function trackUserAction(
  userId: string,
  action: string,
  tableName: string,
  recordId?: string
): Promise<void> {
  await performanceMonitor.logAuditEvent({
    userId,
    action,
    tableName,
    recordId: recordId || null
  })
}

export async function getPerformanceDashboard() {
  return await performanceMonitor.generatePerformanceReport()
}