import { createClient } from '@/lib/supabase/client'
import type { QuestionUniversal, QuestionAttemptUniversal } from '@/types/universal-exam'

export interface GetQuestionOptions {
  difficultyLevel?: 'easy' | 'medium' | 'hard'
  categorySlug?: string
  excludeIds?: string[]
  limit?: number
}

export interface QuestionAttemptData {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  responseTime: number
  sessionId?: string
  hintUsed?: boolean
  confidenceLevel?: number
}

export class QuestionService {
  private supabase = createClient()

  /**
   * Get random LSAT question(s) with filtering options
   */
  async getRandomQuestion(options: GetQuestionOptions = {}): Promise<QuestionUniversal | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_random_lsat_question', {
        p_tenant_id: this.getCurrentTenantId(),
        p_difficulty_level: options.difficultyLevel || null,
        p_category_slug: options.categorySlug || null,
        p_exclude_ids: options.excludeIds || []
      })

      if (error) {
        console.error('Error fetching random question:', error)
        return null
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Question service error:', error)
      return null
    }
  }

  /**
   * Get questions by category with pagination
   */
  async getQuestionsByCategory(
    categorySlug: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ questions: QuestionUniversal[], total: number }> {
    try {
      const offset = (page - 1) * limit

      const { data: questions, error } = await this.supabase
        .from('lsat_questions')
        .select('*')
        .eq('category_slug', categorySlug)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching questions by category:', error)
        return { questions: [], total: 0 }
      }

      // Get total count
      const { count } = await this.supabase
        .from('lsat_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_slug', categorySlug)

      return {
        questions: questions || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Question service error:', error)
      return { questions: [], total: 0 }
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string): Promise<QuestionUniversal | null> {
    try {
      const { data, error } = await this.supabase
        .from('lsat_questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (error) {
        console.error('Error fetching question by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Question service error:', error)
      return null
    }
  }

  /**
   * Record a question attempt
   */
  async recordAttempt(attemptData: QuestionAttemptData): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('track_question_attempt', {
        p_tenant_id: this.getCurrentTenantId(),
        p_question_id: attemptData.questionId,
        p_user_id: await this.getCurrentUserId(),
        p_selected_answer: attemptData.selectedAnswer,
        p_is_correct: attemptData.isCorrect,
        p_response_time: attemptData.responseTime,
        p_session_id: attemptData.sessionId || null
      })

      if (error) {
        console.error('Error recording question attempt:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Question service error:', error)
      return false
    }
  }

  /**
   * Get user's question attempts with performance analytics
   */
  async getUserAttempts(
    userId?: string, 
    categorySlug?: string,
    limit: number = 50
  ): Promise<QuestionAttemptUniversal[]> {
    try {
      const targetUserId = userId || await this.getCurrentUserId()
      
      let query = this.supabase
        .from('question_attempts_universal')
        .select(`
          *,
          questions_universal!inner(content, question_type, difficulty_level),
          exam_categories!inner(name, slug)
        `)
        .eq('user_id', targetUserId)
        .order('attempted_at', { ascending: false })
        .limit(limit)

      if (categorySlug) {
        query = query.eq('exam_categories.slug', categorySlug)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching user attempts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Question service error:', error)
      return []
    }
  }

  /**
   * Get user performance statistics
   */
  async getUserPerformanceStats(userId?: string): Promise<{
    totalAttempts: number
    accuracy: number
    averageResponseTime: number
    categoryBreakdown: Record<string, {
      attempts: number
      accuracy: number
      averageTime: number
    }>
  }> {
    try {
      const targetUserId = userId || await this.getCurrentUserId()

      const { data, error } = await this.supabase
        .from('question_attempts_universal')
        .select(`
          is_correct,
          response_time,
          exam_categories!inner(name, slug)
        `)
        .eq('user_id', targetUserId)

      if (error) {
        console.error('Error fetching performance stats:', error)
        return {
          totalAttempts: 0,
          accuracy: 0,
          averageResponseTime: 0,
          categoryBreakdown: {}
        }
      }

      const attempts = data || []
      const totalAttempts = attempts.length
      const correctAttempts = attempts.filter(a => a.is_correct).length
      const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0
      
      const totalTime = attempts
        .filter(a => a.response_time)
        .reduce((sum, a) => sum + (a.response_time || 0), 0)
      const averageResponseTime = totalTime > 0 ? totalTime / attempts.filter(a => a.response_time).length : 0

      // Category breakdown
      const categoryBreakdown: Record<string, any> = {}
      attempts.forEach(attempt => {
        const category = (attempt as any).exam_categories?.slug || 'unknown'
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = {
            attempts: 0,
            correct: 0,
            totalTime: 0,
            timeCount: 0
          }
        }
        
        categoryBreakdown[category].attempts++
        if (attempt.is_correct) categoryBreakdown[category].correct++
        if (attempt.response_time) {
          categoryBreakdown[category].totalTime += attempt.response_time
          categoryBreakdown[category].timeCount++
        }
      })

      // Calculate category stats
      Object.keys(categoryBreakdown).forEach(category => {
        const cat = categoryBreakdown[category]
        cat.accuracy = cat.attempts > 0 ? (cat.correct / cat.attempts) * 100 : 0
        cat.averageTime = cat.timeCount > 0 ? cat.totalTime / cat.timeCount : 0
        delete cat.correct
        delete cat.totalTime
        delete cat.timeCount
      })

      return {
        totalAttempts,
        accuracy,
        averageResponseTime,
        categoryBreakdown
      }
    } catch (error) {
      console.error('Question service error:', error)
      return {
        totalAttempts: 0,
        accuracy: 0,
        averageResponseTime: 0,
        categoryBreakdown: {}
      }
    }
  }

  /**
   * Get available LSAT categories
   */
  async getCategories(): Promise<Array<{
    id: string
    name: string
    slug: string
    description?: string
    questionCount?: number
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('exam_categories')
        .select('id, name, slug, description')
        .eq('exam_types.slug', 'lsat')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Question service error:', error)
      return []
    }
  }

  /**
   * Helper methods
   */
  private getCurrentTenantId(): string {
    // For now, return a default tenant ID
    // In production, this would be resolved from the current user's context
    return '00000000-0000-0000-0000-000000000000'
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      return user?.id || '00000000-0000-0000-0000-000000000000'
    } catch (error) {
      console.error('Error getting current user:', error)
      return '00000000-0000-0000-0000-000000000000'
    }
  }
}

// Export singleton instance
export const questionService = new QuestionService()