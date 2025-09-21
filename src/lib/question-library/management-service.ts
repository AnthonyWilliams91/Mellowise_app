/**
 * MELLOWISE-017: Question Library Management Service
 * Comprehensive question management with versioning, relationships, and analytics
 *
 * @epic Epic 3.1 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-18
 */

import { createClient } from '@/lib/supabase/client'
import type {
  EnhancedQuestionUniversal,
  QuestionVersion,
  QuestionCrossReference,
  QuestionFeedback,
  QuestionWithRelationships,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  AddRelationshipRequest,
  QuestionFeedbackRequest,
  QuestionAnalytics,
  LibraryAnalytics,
  RelationshipType
} from '@/types/question-library'

// ============================================================================
// QUESTION MANAGEMENT SERVICE
// ============================================================================

export class QuestionLibraryService {
  private supabase = createClient()
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  // ============================================================================
  // CORE QUESTION MANAGEMENT
  // ============================================================================

  /**
   * Get a question with all related data (relationships, feedback, versions)
   */
  async getQuestionWithRelationships(questionId: string): Promise<QuestionWithRelationships | null> {
    try {
      // Use the database function for optimized retrieval
      const { data, error } = await this.supabase
        .rpc('get_question_with_relationships', {
          p_tenant_id: this.tenantId,
          p_question_id: questionId
        })

      if (error) throw error

      if (!data || data.length === 0) return null

      const result = data[0]
      const questionData = result.question_data
      const relatedQuestions = result.related_questions || []
      const feedbackSummary = result.feedback_summary || {}
      const versionHistory = result.version_history || []

      // Get analytics
      const analytics = await this.getQuestionAnalytics(questionId)

      return {
        ...questionData,
        related_questions: relatedQuestions,
        feedback_summary: feedbackSummary,
        version_history: versionHistory,
        analytics
      }
    } catch (error) {
      console.error('Error getting question with relationships:', error)
      throw new Error(`Failed to get question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a new question
   */
  async createQuestion(questionData: CreateQuestionRequest): Promise<string> {
    try {
      const questionId = crypto.randomUUID()

      const { error } = await this.supabase
        .from('questions_universal')
        .insert({
          tenant_id: this.tenantId,
          id: questionId,
          ...questionData,
          version_number: 1,
          is_latest_version: true,
          quality_score: 6.0,
          community_rating: 0.0,
          rating_count: 0,
          review_status: 'pending',
          validation_status: 'validated',
          is_active: true,
          usage_count: 0,
          success_rate: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Create initial version record
      await this.createQuestionVersion(questionId, 'create', 'Initial question creation')

      return questionId
    } catch (error) {
      console.error('Error creating question:', error)
      throw new Error(`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update an existing question (creates new version)
   */
  async updateQuestion(
    questionId: string,
    updates: UpdateQuestionRequest,
    userId?: string
  ): Promise<void> {
    try {
      // Create version before updating
      if (updates.change_reason) {
        await this.createQuestionVersion(
          questionId,
          updates.change_type || 'edit',
          updates.change_reason,
          userId
        )
      }

      // Remove version-specific fields from updates
      const { change_reason, change_type, ...questionUpdates } = updates

      const { error } = await this.supabase
        .from('questions_universal')
        .update({
          ...questionUpdates,
          version_number: this.supabase.sql`version_number + 1`,
          last_modified_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', this.tenantId)
        .eq('id', questionId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating question:', error)
      throw new Error(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a question (soft delete)
   */
  async deleteQuestion(questionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('questions_universal')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', this.tenantId)
        .eq('id', questionId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting question:', error)
      throw new Error(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ============================================================================
  // VERSIONING SYSTEM
  // ============================================================================

  /**
   * Create a new version of a question
   */
  async createQuestionVersion(
    questionId: string,
    changeType: 'create' | 'edit' | 'quality_update' | 'correction',
    changeReason: string,
    userId?: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('create_question_version', {
          p_tenant_id: this.tenantId,
          p_question_id: questionId,
          p_user_id: userId,
          p_change_reason: changeReason,
          p_change_type: changeType
        })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating question version:', error)
      throw new Error(`Failed to create version: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get version history for a question
   */
  async getQuestionVersions(questionId: string): Promise<QuestionVersion[]> {
    try {
      const { data, error } = await this.supabase
        .from('question_versions')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('question_id', questionId)
        .order('version_number', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting question versions:', error)
      throw new Error(`Failed to get versions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Restore a previous version of a question
   */
  async restoreQuestionVersion(questionId: string, versionNumber: number): Promise<void> {
    try {
      // Get the version data
      const { data: versionData, error: versionError } = await this.supabase
        .from('question_versions')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('question_id', questionId)
        .eq('version_number', versionNumber)
        .single()

      if (versionError || !versionData) {
        throw new Error('Version not found')
      }

      // Create new version first
      await this.createQuestionVersion(
        questionId,
        'edit',
        `Restored from version ${versionNumber}`
      )

      // Update question with version data
      const { error: updateError } = await this.supabase
        .from('questions_universal')
        .update({
          content: versionData.content,
          question_type: versionData.question_type,
          subtype: versionData.subtype,
          difficulty: versionData.difficulty,
          difficulty_level: versionData.difficulty_level,
          estimated_time: versionData.estimated_time,
          cognitive_level: versionData.cognitive_level,
          correct_answer: versionData.correct_answer,
          answer_choices: versionData.answer_choices,
          explanation: versionData.explanation,
          concept_tags: versionData.concept_tags,
          performance_indicators: versionData.performance_indicators,
          source_attribution: versionData.source_attribution,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', this.tenantId)
        .eq('id', questionId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error restoring question version:', error)
      throw new Error(`Failed to restore version: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ============================================================================
  // RELATIONSHIP MANAGEMENT
  // ============================================================================

  /**
   * Add a relationship between two questions
   */
  async addQuestionRelationship(relationship: AddRelationshipRequest): Promise<void> {
    try {
      const relationshipId = crypto.randomUUID()

      const { error } = await this.supabase
        .from('question_cross_references')
        .insert({
          tenant_id: this.tenantId,
          id: relationshipId,
          source_question_id: relationship.source_question_id,
          target_question_id: relationship.target_question_id,
          relationship_type: relationship.relationship_type,
          strength: relationship.strength || 1.0,
          is_bidirectional: relationship.is_bidirectional || false,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // If bidirectional, create reverse relationship
      if (relationship.is_bidirectional) {
        const reverseId = crypto.randomUUID()
        await this.supabase
          .from('question_cross_references')
          .insert({
            tenant_id: this.tenantId,
            id: reverseId,
            source_question_id: relationship.target_question_id,
            target_question_id: relationship.source_question_id,
            relationship_type: relationship.relationship_type,
            strength: relationship.strength || 1.0,
            is_bidirectional: true,
            created_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error adding question relationship:', error)
      throw new Error(`Failed to add relationship: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove a relationship between questions
   */
  async removeQuestionRelationship(
    sourceQuestionId: string,
    targetQuestionId: string,
    relationshipType: RelationshipType
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('question_cross_references')
        .delete()
        .eq('tenant_id', this.tenantId)
        .eq('source_question_id', sourceQuestionId)
        .eq('target_question_id', targetQuestionId)
        .eq('relationship_type', relationshipType)

      if (error) throw error
    } catch (error) {
      console.error('Error removing question relationship:', error)
      throw new Error(`Failed to remove relationship: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get related questions for a specific question
   */
  async getRelatedQuestions(questionId: string): Promise<QuestionCrossReference[]> {
    try {
      const { data, error } = await this.supabase
        .from('question_cross_references')
        .select(`
          *,
          target_question:questions_universal!target_question_id(
            id,
            content,
            difficulty,
            category_id,
            exam_categories(name)
          )
        `)
        .eq('tenant_id', this.tenantId)
        .eq('source_question_id', questionId)
        .order('strength', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting related questions:', error)
      throw new Error(`Failed to get related questions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ============================================================================
  // FEEDBACK AND QUALITY MANAGEMENT
  // ============================================================================

  /**
   * Add feedback for a question
   */
  async addQuestionFeedback(feedback: QuestionFeedbackRequest, userId: string): Promise<void> {
    try {
      const feedbackId = crypto.randomUUID()

      const { error } = await this.supabase
        .from('question_feedback')
        .insert({
          tenant_id: this.tenantId,
          id: feedbackId,
          question_id: feedback.question_id,
          user_id: userId,
          rating: feedback.rating,
          feedback_type: feedback.feedback_type,
          feedback_text: feedback.feedback_text,
          suggested_improvement: feedback.suggested_improvement,
          created_at: new Date().toISOString(),
          is_verified: false
        })

      if (error) throw error

      // The trigger will automatically update question statistics
    } catch (error) {
      console.error('Error adding question feedback:', error)
      throw new Error(`Failed to add feedback: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get feedback for a question
   */
  async getQuestionFeedback(questionId: string): Promise<QuestionFeedback[]> {
    try {
      const { data, error } = await this.supabase
        .from('question_feedback')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting question feedback:', error)
      throw new Error(`Failed to get feedback: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update question quality score
   */
  async updateQuestionQuality(questionId: string, qualityScore: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('questions_universal')
        .update({
          quality_score: qualityScore,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', this.tenantId)
        .eq('id', questionId)

      if (error) throw error

      // Create version for quality update
      await this.createQuestionVersion(
        questionId,
        'quality_update',
        `Quality score updated to ${qualityScore}`
      )
    } catch (error) {
      console.error('Error updating question quality:', error)
      throw new Error(`Failed to update quality: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ============================================================================
  // ANALYTICS AND INSIGHTS
  // ============================================================================

  /**
   * Get detailed analytics for a question
   */
  async getQuestionAnalytics(questionId: string): Promise<QuestionAnalytics> {
    try {
      // Get basic question stats
      const { data: questionData, error: questionError } = await this.supabase
        .from('questions_universal')
        .select('usage_count, success_rate, avg_response_time, created_at')
        .eq('tenant_id', this.tenantId)
        .eq('id', questionId)
        .single()

      if (questionError) throw questionError

      // Get attempt data
      const { data: attempts, error: attemptsError } = await this.supabase
        .from('question_attempts_universal')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('question_id', questionId)
        .order('attempted_at', { ascending: false })
        .limit(1000)

      if (attemptsError) throw attemptsError

      // Calculate analytics
      const totalAttempts = attempts?.length || 0
      const correctAttempts = attempts?.filter(a => a.is_correct).length || 0
      const successRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0

      // Group attempts by date for trends
      const usageOverTime = this.groupAttemptsByDate(attempts || [])

      // Common wrong answers
      const wrongAnswers = attempts?.filter(a => !a.is_correct) || []
      const commonWrongAnswers = this.analyzeWrongAnswers(wrongAnswers)

      // Get feedback trend
      const { data: feedbackData } = await this.supabase
        .from('question_feedback')
        .select('rating, created_at')
        .eq('tenant_id', this.tenantId)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true })

      const feedbackTrend = this.groupFeedbackByDate(feedbackData || [])

      return {
        question_id: questionId,
        total_attempts: totalAttempts,
        correct_attempts: correctAttempts,
        success_rate: successRate,
        avg_response_time: questionData?.avg_response_time || 0,
        difficulty_perception: 0, // Would need user feedback data
        usage_over_time: usageOverTime,
        performance_by_skill_level: {}, // Would need user skill level data
        common_wrong_answers: commonWrongAnswers,
        community_feedback_trend: feedbackTrend,
        reported_issues: [],
        improvement_suggestions: []
      }
    } catch (error) {
      console.error('Error getting question analytics:', error)
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get library-wide analytics
   */
  async getLibraryAnalytics(): Promise<LibraryAnalytics> {
    try {
      // Get overall statistics
      const { data: overallStats, error: statsError } = await this.supabase
        .from('questions_universal')
        .select('review_status, quality_score, usage_count')
        .eq('tenant_id', this.tenantId)
        .eq('is_active', true)

      if (statsError) throw statsError

      const totalQuestions = overallStats?.length || 0
      const approvedQuestions = overallStats?.filter(q => q.review_status === 'approved').length || 0
      const pendingReview = overallStats?.filter(q => q.review_status === 'pending').length || 0

      // Quality distribution
      const qualityDistribution = this.calculateQualityDistribution(overallStats || [])

      // Most/least used questions
      const sortedByUsage = [...(overallStats || [])].sort((a, b) => b.usage_count - a.usage_count)
      const mostUsed = sortedByUsage.slice(0, 10)
      const leastUsed = sortedByUsage.slice(-10).reverse()

      // Recent feedback
      const { data: recentFeedback } = await this.supabase
        .from('question_feedback')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: false })
        .limit(20)

      return {
        total_questions: totalQuestions,
        approved_questions: approvedQuestions,
        pending_review: pendingReview,
        quality_distribution: qualityDistribution,
        total_attempts_today: 0, // Would need today's attempt data
        most_used_questions: mostUsed.map(q => ({
          question_id: q.id || '',
          content_preview: (q.content || '').substring(0, 100) + '...',
          usage_count: q.usage_count || 0
        })),
        least_used_questions: leastUsed.map(q => ({
          question_id: q.id || '',
          content_preview: (q.content || '').substring(0, 100) + '...',
          usage_count: q.usage_count || 0
        })),
        highest_rated: [], // Would need rating data
        needs_attention: [], // Would need issue analysis
        recent_feedback: recentFeedback || [],
        recent_imports: [], // Would need import data
        import_success_rate: 0,
        common_import_errors: []
      }
    } catch (error) {
      console.error('Error getting library analytics:', error)
      throw new Error(`Failed to get library analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private groupAttemptsByDate(attempts: any[]): Array<{ date: string; attempts: number }> {
    const grouped = attempts.reduce((acc, attempt) => {
      const date = new Date(attempt.attempted_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([date, attempts]) => ({ date, attempts }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private analyzeWrongAnswers(wrongAnswers: any[]): Array<{ answer: string; count: number; percentage: number }> {
    const answerCounts = wrongAnswers.reduce((acc, attempt) => {
      const answer = attempt.selected_answer
      acc[answer] = (acc[answer] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = wrongAnswers.length
    return Object.entries(answerCounts)
      .map(([answer, count]) => ({
        answer,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private groupFeedbackByDate(feedback: any[]): Array<{ date: string; avg_rating: number }> {
    const grouped = feedback.reduce((acc, fb) => {
      const date = new Date(fb.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 }
      }
      acc[date].total += fb.rating
      acc[date].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        avg_rating: data.total / data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculateQualityDistribution(questions: any[]): Record<string, number> {
    return questions.reduce((acc, question) => {
      const score = question.quality_score
      let range = 'Unknown'

      if (score >= 9.0) range = '9.0-10.0'
      else if (score >= 7.0) range = '7.0-8.9'
      else if (score >= 5.0) range = '5.0-6.9'
      else if (score >= 3.0) range = '3.0-4.9'
      else range = '0.0-2.9'

      acc[range] = (acc[range] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}