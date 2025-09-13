/**
 * Diagnostic Quiz Service
 * 
 * Smart question selection and management for learning style assessment.
 * Implements intelligent stratified sampling from 960+ question database
 * with behavioral tracking and performance analysis.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  DiagnosticQuestion, 
  DiagnosticAttempt, 
  DiagnosticQuizConfig, 
  DiagnosticQuizResponse,
  DiagnosticSubmissionRequest,
  LearningProfile,
  DEFAULT_DIAGNOSTIC_CONFIG
} from '@/types/learning-style'

export interface QuestionSelectionCriteria {
  excludeUserAttempts?: boolean
  difficultyDistribution?: 'even' | 'gradient' | 'adaptive'
  categoryBalance?: 'strict' | 'loose'
  excludeQuestionIds?: string[]
}

export class DiagnosticService {
  private supabase = createClient()

  /**
   * Generate diagnostic quiz with intelligent question selection
   * Uses stratified sampling to ensure balanced coverage across learning dimensions
   */
  async generateDiagnosticQuiz(
    userId: string,
    config: DiagnosticQuizConfig = DEFAULT_DIAGNOSTIC_CONFIG,
    criteria: QuestionSelectionCriteria = {}
  ): Promise<DiagnosticQuizResponse> {
    try {
      // Check for existing learning profile
      const existingProfile = await this.getLearningProfile(userId)
      
      // Get user's previous diagnostic attempts if excluding them
      let excludeQuestionIds = criteria.excludeQuestionIds || []
      if (criteria.excludeUserAttempts) {
        const previousAttempts = await this.getUserDiagnosticAttempts(userId)
        excludeQuestionIds = [...excludeQuestionIds, ...previousAttempts.map(a => a.question_id)]
      }

      // Select questions for each diagnostic category
      const questions: DiagnosticQuestion[] = []
      
      for (const [category, count] of Object.entries(config.categories)) {
        const categoryQuestions = await this.selectQuestionsForCategory(
          category as any,
          count,
          excludeQuestionIds,
          criteria.difficultyDistribution || 'gradient'
        )
        
        questions.push(...categoryQuestions)
        // Update exclude list to prevent duplicates across categories
        excludeQuestionIds.push(...categoryQuestions.map(q => q.question_id))
      }

      // Shuffle questions to prevent category patterns
      const shuffledQuestions = this.shuffleArray(questions)

      return {
        questions: shuffledQuestions,
        config,
        hasExistingProfile: !!existingProfile,
        existingProfile: existingProfile || undefined
      }

    } catch (error) {
      console.error('Error generating diagnostic quiz:', error)
      throw new Error('Failed to generate diagnostic quiz')
    }
  }

  /**
   * Select questions for a specific diagnostic category with intelligent distribution
   */
  private async selectQuestionsForCategory(
    category: 'visual_pattern' | 'analytical_logic' | 'speed_test' | 'detail_focus' | 'conceptual_reasoning',
    count: number,
    excludeIds: string[],
    difficultyDistribution: 'even' | 'gradient' | 'adaptive'
  ): Promise<DiagnosticQuestion[]> {
    try {
      // Calculate difficulty distribution
      const difficultyTargets = this.calculateDifficultyDistribution(count, difficultyDistribution)
      
      const questions: DiagnosticQuestion[] = []
      
      for (const [difficultyRange, targetCount] of Object.entries(difficultyTargets)) {
        const [minDiff, maxDiff] = difficultyRange.split('-').map(Number)
        
        const { data, error } = await this.supabase
          .from('diagnostic_questions')
          .select(`
            *,
            questions!inner(
              id,
              content,
              question_type,
              subtype,
              difficulty_level,
              correct_answer,
              answer_choices,
              explanation
            )
          `)
          .eq('diagnostic_category', category)
          .eq('is_active', true)
          .gte('questions.difficulty_level', minDiff)
          .lte('questions.difficulty_level', maxDiff)
          .not('question_id', 'in', `(${excludeIds.join(',')})`)
          .limit(targetCount * 2) // Get extra questions for better selection

        if (error) {
          console.error(`Error selecting questions for category ${category}:`, error)
          continue
        }

        // Randomly select from available questions
        const availableQuestions = data || []
        const selectedQuestions = this.shuffleArray(availableQuestions).slice(0, targetCount)
        
        questions.push(...selectedQuestions.map(q => ({
          ...q,
          question: q.questions
        })))
      }

      return questions

    } catch (error) {
      console.error(`Error selecting questions for category ${category}:`, error)
      return []
    }
  }

  /**
   * Calculate optimal difficulty distribution for learning assessment
   */
  private calculateDifficultyDistribution(
    totalCount: number, 
    strategy: 'even' | 'gradient' | 'adaptive'
  ): Record<string, number> {
    switch (strategy) {
      case 'even':
        // Equal distribution across all difficulty levels
        const perDifficulty = Math.floor(totalCount / 3)
        const remainder = totalCount % 3
        return {
          '1-3': perDifficulty + (remainder > 0 ? 1 : 0),   // Easy
          '4-6': perDifficulty + (remainder > 1 ? 1 : 0),   // Medium  
          '7-10': perDifficulty                             // Hard
        }
        
      case 'gradient':
        // More easy questions, fewer hard (better for assessment)
        return {
          '1-3': Math.ceil(totalCount * 0.4),   // 40% easy
          '4-6': Math.ceil(totalCount * 0.4),   // 40% medium
          '7-10': Math.floor(totalCount * 0.2)   // 20% hard
        }
        
      case 'adaptive':
        // Balanced for comprehensive assessment
        return {
          '1-3': Math.ceil(totalCount * 0.35),   // 35% easy
          '4-6': Math.ceil(totalCount * 0.35),   // 35% medium  
          '7-10': Math.floor(totalCount * 0.3)   // 30% hard
        }
        
      default:
        return this.calculateDifficultyDistribution(totalCount, 'gradient')
    }
  }

  /**
   * Submit diagnostic quiz responses and trigger learning style analysis
   */
  async submitDiagnosticQuiz(
    userId: string,
    submission: DiagnosticSubmissionRequest
  ): Promise<boolean> {
    try {
      // Insert all diagnostic attempts
      const attemptsToInsert = submission.attempts.map(attempt => ({
        ...attempt,
        user_id: userId,
        attempted_at: new Date().toISOString()
      }))

      const { error } = await this.supabase
        .from('diagnostic_attempts')
        .insert(attemptsToInsert)

      if (error) {
        console.error('Error submitting diagnostic attempts:', error)
        return false
      }

      return true

    } catch (error) {
      console.error('Error submitting diagnostic quiz:', error)
      return false
    }
  }

  /**
   * Get user's existing learning profile
   */
  async getLearningProfile(userId: string): Promise<LearningProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error is ok
        console.error('Error fetching learning profile:', error)
        return null
      }

      return data || null

    } catch (error) {
      console.error('Error fetching learning profile:', error)
      return null
    }
  }

  /**
   * Get user's previous diagnostic attempts
   */
  async getUserDiagnosticAttempts(userId: string): Promise<DiagnosticAttempt[]> {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('attempted_at', { ascending: false })

      if (error) {
        console.error('Error fetching diagnostic attempts:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('Error fetching diagnostic attempts:', error)
      return []
    }
  }

  /**
   * Check if user has completed diagnostic assessment
   */
  async hasCompletedDiagnostic(userId: string): Promise<boolean> {
    try {
      const profile = await this.getLearningProfile(userId)
      return profile?.has_completed_diagnostic || false

    } catch (error) {
      console.error('Error checking diagnostic completion:', error)
      return false
    }
  }

  /**
   * Get diagnostic questions by category for admin/testing
   */
  async getDiagnosticQuestionsByCategory(
    category: string,
    limit: number = 10
  ): Promise<DiagnosticQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_questions')
        .select(`
          *,
          questions!inner(
            id,
            content,
            question_type,
            subtype,
            difficulty_level,
            correct_answer,
            answer_choices,
            explanation
          )
        `)
        .eq('diagnostic_category', category)
        .eq('is_active', true)
        .limit(limit)

      if (error) {
        console.error('Error fetching diagnostic questions by category:', error)
        return []
      }

      return (data || []).map(q => ({
        ...q,
        question: q.questions
      }))

    } catch (error) {
      console.error('Error fetching diagnostic questions by category:', error)
      return []
    }
  }

  /**
   * Utility: Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Get diagnostic statistics for admin monitoring
   */
  async getDiagnosticStats(): Promise<{
    totalQuestions: number
    categoryDistribution: Record<string, number>
    difficultyDistribution: Record<string, number>
  }> {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_questions')
        .select(`
          diagnostic_category,
          questions!inner(difficulty_level)
        `)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching diagnostic stats:', error)
        return {
          totalQuestions: 0,
          categoryDistribution: {},
          difficultyDistribution: {}
        }
      }

      const questions = data || []
      const totalQuestions = questions.length

      // Category distribution
      const categoryDistribution: Record<string, number> = {}
      questions.forEach(q => {
        categoryDistribution[q.diagnostic_category] = (categoryDistribution[q.diagnostic_category] || 0) + 1
      })

      // Difficulty distribution
      const difficultyDistribution: Record<string, number> = {}
      questions.forEach(q => {
        const difficulty = q.questions?.difficulty_level || 0
        const range = difficulty <= 3 ? 'Easy (1-3)' : 
                     difficulty <= 6 ? 'Medium (4-6)' : 'Hard (7-10)'
        difficultyDistribution[range] = (difficultyDistribution[range] || 0) + 1
      })

      return {
        totalQuestions,
        categoryDistribution,
        difficultyDistribution
      }

    } catch (error) {
      console.error('Error fetching diagnostic stats:', error)
      return {
        totalQuestions: 0,
        categoryDistribution: {},
        difficultyDistribution: {}
      }
    }
  }
}

// Export singleton instance
export const diagnosticService = new DiagnosticService()