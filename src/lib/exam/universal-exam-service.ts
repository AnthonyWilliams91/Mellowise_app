/**
 * Universal Exam Service
 * 
 * Manages multi-exam platform operations with configurable exam types
 * Implements Context7 DecA(I)de patterns for blueprint-based configuration
 * 
 * @architecture Multi-tenant with exam type modularity
 * @pattern Context7 DecA(I)de + Nile multi-tenant isolation
 */

import { withTenantContext } from '../database/multi-tenant-utils'
import { trackUserAction } from '../database/performance-monitor'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ExamType,
  ExamCategory,
  QuestionUniversal,
  UserExamRegistration,
  GameSessionUniversal,
  QuestionAttemptUniversal,
  UserAnalyticsUniversal,
  CreateExamTypeRequest,
  CreateExamCategoryRequest,
  StartSessionRequest,
  ExamStatsResponse,
  SessionConfig,
  ExamProgressMetrics,
  DifficultyMixConfig,
  DEFAULT_DIFFICULTY_MIX,
  DEFAULT_SESSION_CONFIG
} from '../../types/universal-exam'
import type { MTDatabaseOperation } from '../../types/tenant'

/**
 * Universal Exam Management Service
 * Handles all exam types with tenant isolation
 */
export class UniversalExamService {
  private static instance: UniversalExamService

  static getInstance(): UniversalExamService {
    if (!UniversalExamService.instance) {
      UniversalExamService.instance = new UniversalExamService()
    }
    return UniversalExamService.instance
  }

  // ============================================================================
  // EXAM TYPE MANAGEMENT
  // ============================================================================

  /**
   * Create new exam type (LSAT, GRE, MCAT, etc.)
   */
  async createExamType(
    tenantId: string,
    request: CreateExamTypeRequest,
    adminUserId: string
  ): Promise<MTDatabaseOperation<ExamType>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const examData = {
          tenant_id: tenantId,
          name: request.name,
          slug: request.slug,
          description: request.description || null,
          scoring_config: request.scoring_config,
          timing_config: request.timing_config,
          difficulty_mix: request.difficulty_mix || DEFAULT_DIFFICULTY_MIX,
          status: 'active'
        }

        const { data, error } = await client
          .from('exam_types')
          .insert(examData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(adminUserId, 'CREATE', 'exam_types', data?.id)
        }

        return { data: data as ExamType, error }
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
   * Get all exam types for tenant
   */
  async getExamTypes(tenantId: string): Promise<MTDatabaseOperation<ExamType[]>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const { data, error } = await client
          .from('exam_types')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .order('name')

        return { data: data as ExamType[] | null, error }
      })

      return {
        data: result.data || [],
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
   * Get exam type by slug
   */
  async getExamTypeBySlug(
    tenantId: string,
    slug: string
  ): Promise<MTDatabaseOperation<ExamType>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const { data, error } = await client
          .from('exam_types')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('slug', slug)
          .eq('status', 'active')
          .single()

        return { data: data as ExamType, error }
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

  // ============================================================================
  // EXAM CATEGORY MANAGEMENT
  // ============================================================================

  /**
   * Create exam category (hierarchical structure)
   */
  async createExamCategory(
    tenantId: string,
    request: CreateExamCategoryRequest,
    adminUserId: string
  ): Promise<MTDatabaseOperation<ExamCategory>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const categoryData = {
          tenant_id: tenantId,
          exam_type_id: request.exam_type_id,
          name: request.name,
          slug: request.slug,
          description: request.description || null,
          parent_category_id: request.parent_category_id || null,
          blueprint_config: request.blueprint_config,
          performance_indicators: request.performance_indicators,
          sort_order: 0,
          is_active: true
        }

        const { data, error } = await client
          .from('exam_categories')
          .insert(categoryData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(adminUserId, 'CREATE', 'exam_categories', data?.id)
        }

        return { data: data as ExamCategory, error }
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
   * Get categories for exam type
   */
  async getExamCategories(
    tenantId: string,
    examTypeId: string
  ): Promise<MTDatabaseOperation<ExamCategory[]>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const { data, error } = await client
          .from('exam_categories')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('exam_type_id', examTypeId)
          .eq('is_active', true)
          .order('sort_order')

        return { data: data as ExamCategory[] | null, error }
      })

      return {
        data: result.data || [],
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  // ============================================================================
  // USER EXAM REGISTRATION
  // ============================================================================

  /**
   * Register user for exam preparation
   */
  async registerUserForExam(
    tenantId: string,
    userId: string,
    examTypeId: string,
    targetScore?: number,
    targetDate?: string
  ): Promise<MTDatabaseOperation<UserExamRegistration>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const registrationData = {
          tenant_id: tenantId,
          user_id: userId,
          exam_type_id: examTypeId,
          target_score: targetScore || null,
          target_test_date: targetDate || null,
          preparation_level: 'beginner',
          status: 'active',
          sessions_completed: 0,
          total_study_time: 0,
          preferences: {}
        }

        const { data, error } = await client
          .from('user_exam_registrations')
          .insert(registrationData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(userId, 'REGISTER_EXAM', 'user_exam_registrations', data?.id)
        }

        return { data: data as UserExamRegistration, error }
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
   * Get user's exam registrations (multi-exam support)
   */
  async getUserExamRegistrations(
    tenantId: string,
    userId: string
  ): Promise<MTDatabaseOperation<UserExamRegistration[]>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const { data, error } = await client
          .from('user_exam_registrations')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('registered_at', { ascending: false })

        await trackUserAction(userId, 'SELECT', 'user_exam_registrations')

        return { data: data as UserExamRegistration[] | null, error }
      })

      return {
        data: result.data || [],
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  // ============================================================================
  // QUESTION MANAGEMENT
  // ============================================================================

  /**
   * Get questions for practice session (Context7 DecA(I)de patterns)
   */
  async getQuestionsForSession(
    tenantId: string,
    examTypeId: string,
    categoryId?: string,
    config: Partial<SessionConfig> = {}
  ): Promise<MTDatabaseOperation<QuestionUniversal[]>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const sessionConfig = { ...DEFAULT_SESSION_CONFIG, ...config }
        
        let query = client
          .from('questions_universal')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('exam_type_id', examTypeId)
          .eq('is_active', true)

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        // Apply difficulty distribution (Context7 DecA(I)de pattern)
        if (sessionConfig.difficulty_mix) {
          const totalQuestions = sessionConfig.question_count || 25
          const easyCount = Math.round(totalQuestions * sessionConfig.difficulty_mix.easy)
          const mediumCount = Math.round(totalQuestions * sessionConfig.difficulty_mix.medium)
          const hardCount = totalQuestions - easyCount - mediumCount

          // Get questions for each difficulty level
          const easyQuery = query.eq('difficulty_level', 'easy').limit(easyCount)
          const mediumQuery = query.eq('difficulty_level', 'medium').limit(mediumCount)  
          const hardQuery = query.eq('difficulty_level', 'hard').limit(hardCount)

          // For now, get all questions and filter in application
          // In production, consider using UNION or separate queries
          const { data, error } = await query.limit(sessionConfig.question_count || 25)

          return { data: data as QuestionUniversal[] | null, error }
        }

        const { data, error } = await query.limit(sessionConfig.question_count || 25)
        return { data: data as QuestionUniversal[] | null, error }
      })

      return {
        data: result.data || [],
        error: result.error ? new Error(result.error.message) : null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start new game session
   */
  async startGameSession(
    tenantId: string,
    userId: string,
    request: StartSessionRequest
  ): Promise<MTDatabaseOperation<GameSessionUniversal>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const sessionData = {
          tenant_id: tenantId,
          user_id: userId,
          exam_type_id: request.exam_type_id,
          category_id: request.category_id || null,
          session_type: request.session_type,
          final_score: 0,
          questions_answered: 0,
          correct_answers: 0,
          lives_remaining: 3,
          difficulty_level: 1,
          session_config: request.session_config || DEFAULT_SESSION_CONFIG,
          session_data: {}
        }

        const { data, error } = await client
          .from('game_sessions_universal')
          .insert(sessionData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(userId, 'START_SESSION', 'game_sessions_universal', data?.id)
        }

        return { data: data as GameSessionUniversal, error }
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
   * Record question attempt with exam context
   */
  async recordQuestionAttempt(
    tenantId: string,
    userId: string,
    questionId: string,
    sessionId: string,
    examTypeId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    responseTime?: number,
    categoryId?: string
  ): Promise<MTDatabaseOperation<QuestionAttemptUniversal>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const attemptData = {
          tenant_id: tenantId,
          user_id: userId,
          question_id: questionId,
          session_id: sessionId,
          exam_type_id: examTypeId,
          category_id: categoryId || null,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          response_time: responseTime || null,
          hint_used: false,
          confidence_level: null
        }

        const { data, error } = await client
          .from('question_attempts_universal')
          .insert(attemptData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(userId, 'ATTEMPT_QUESTION', 'question_attempts_universal', data?.id)
        }

        return { data: data as QuestionAttemptUniversal, error }
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

  // ============================================================================
  // ANALYTICS & PROGRESS TRACKING
  // ============================================================================

  /**
   * Get comprehensive exam statistics for user
   */
  async getUserExamStats(
    tenantId: string,
    userId: string
  ): Promise<MTDatabaseOperation<ExamStatsResponse>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        // Get exam registrations
        const { data: registrations, error: regError } = await client
          .from('user_exam_registrations')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .eq('status', 'active')

        if (regError) throw regError

        // Get recent sessions
        const { data: sessions, error: sessError } = await client
          .from('game_sessions_universal')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(10)

        if (sessError) throw sessError

        // Get performance analytics
        const { data: analytics, error: analyticsError } = await client
          .from('user_analytics_universal')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .eq('metric_type', 'exam_progress')
          .order('created_at', { ascending: false })
          .limit(5)

        if (analyticsError) throw analyticsError

        await trackUserAction(userId, 'SELECT', 'exam_stats')

        return {
          data: {
            exam_registrations: registrations as UserExamRegistration[] || [],
            recent_sessions: sessions as GameSessionUniversal[] || [],
            performance_summary: {}, // Will be calculated from analytics data
            recommendations: [] // Will be implemented in Epic 2 AI features
          } as ExamStatsResponse,
          error: null
        }
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
   * Record analytics data for exam progress
   */
  async recordExamAnalytics(
    tenantId: string,
    userId: string,
    examTypeId: string,
    metricType: string,
    metricData: any,
    categoryId?: string
  ): Promise<MTDatabaseOperation<UserAnalyticsUniversal>> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const analyticsData = {
          tenant_id: tenantId,
          user_id: userId,
          exam_type_id: examTypeId,
          category_id: categoryId || null,
          metric_type: metricType,
          metric_data: metricData,
          date_recorded: new Date().toISOString().split('T')[0]
        }

        const { data, error } = await client
          .from('user_analytics_universal')
          .insert(analyticsData)
          .select()
          .single()

        if (!error) {
          await trackUserAction(userId, 'RECORD_ANALYTICS', 'user_analytics_universal', data?.id)
        }

        return { data: data as UserAnalyticsUniversal, error }
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

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is registered for exam
   */
  async isUserRegisteredForExam(
    tenantId: string,
    userId: string,
    examTypeId: string
  ): Promise<boolean> {
    try {
      const result = await withTenantContext(tenantId, async (client: SupabaseClient) => {
        const { data, error } = await client
          .from('user_exam_registrations')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .eq('exam_type_id', examTypeId)
          .eq('status', 'active')
          .single()

        return { exists: !!data && !error }
      })

      return result.exists
    } catch (error) {
      return false
    }
  }

  /**
   * Get available exam types for new registrations
   */
  async getAvailableExamTypes(tenantId: string): Promise<ExamType[]> {
    const result = await this.getExamTypes(tenantId)
    return result.data || []
  }
}

// Export singleton instance
export const universalExamService = UniversalExamService.getInstance()