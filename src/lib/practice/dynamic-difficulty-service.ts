/**
 * Dynamic Difficulty Service
 * MELLOWISE-010: FSRS-Inspired Adaptive Learning
 * 
 * Main service for managing dynamic difficulty adjustment in practice modes.
 * Orchestrates FSRS algorithm, learning style integration, and database persistence.
 * 
 * @author Architect Agent Winston
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { createClient } from '@/lib/supabase/client'
import { fsrsEngine } from './fsrs-engine'
import { profileService } from '@/lib/learning-style/profile-service'
import {
  DifficultySystemError
} from '@/types/dynamic-difficulty'
import type {
  PracticeDifficultyState,
  PracticeSessionDifficulty,
  PracticeDifficultyAdjustment,
  DifficultyContext,
  PerformancePoint,
  TopicType,
  DifficultyAdjustmentReason,
  FSRSState,
  DifficultyCalculation,
  LearningStyleDifficultyPreferences,
  TopicPerformanceMetrics,
  PracticeSessionConfig,
  QuestionWithDifficulty,
  AnswerSubmission,
  AnswerResult,
  DifficultyAdjustmentDetails,
  DifficultyProgression,
  SessionRecommendations
} from '@/types/dynamic-difficulty'
import type { LearningProfile } from '@/types/learning-style'

// ============================================================================
// DYNAMIC DIFFICULTY SERVICE CLASS
// ============================================================================

export class DynamicDifficultyService {
  private supabase = createClient()
  private readonly RECENT_PERFORMANCE_LIMIT = 20
  private readonly MIN_QUESTIONS_FOR_ADJUSTMENT = 3
  private readonly PERFORMANCE_ANALYSIS_WINDOW_DAYS = 7

  // ============================================================================
  // CORE DIFFICULTY MANAGEMENT
  // ============================================================================

  /**
   * Initialize difficulty state for a user-topic combination
   */
  async initializeUserDifficulty(
    userId: string, 
    topicType: TopicType
  ): Promise<PracticeDifficultyState> {
    try {
      // Check if difficulty state already exists
      const existingState = await this.getDifficultyState(userId, topicType)
      if (existingState) {
        return existingState
      }

      // Get user's learning style profile for initialization
      const learningProfile = await profileService.getProfile(userId)
      const learningStylePrefs = this.extractLearningStylePreferences(learningProfile)

      // Create initial FSRS state
      const initialFSRSState = fsrsEngine.createInitialState(learningStylePrefs, topicType)

      // Create difficulty state record
      const difficultyStateData = {
        user_id: userId,
        topic_type: topicType,
        current_difficulty: initialFSRSState.difficulty,
        stability_score: initialFSRSState.stability,
        confidence_interval: 2.0,
        success_rate_target: initialFSRSState.successRate,
        current_success_rate: 0.5,
        sessions_analyzed: 0,
        questions_attempted: 0,
        manual_override_enabled: false,
        manual_difficulty_override: null,
        manual_override_set_at: null,
        manual_override_reason: null,
        last_session_at: null
      }

      const { data, error } = await this.supabase
        .from('practice_difficulty_state')
        .insert(difficultyStateData)
        .select()
        .single()

      if (error) {
        console.error('Error creating difficulty state:', error)
        throw new DifficultySystemError(
          'Failed to initialize user difficulty state',
          'DATABASE_ERROR',
          { userId, topicType, error: error.message }
        )
      }

      return data

    } catch (error) {
      console.error('Error initializing user difficulty:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to initialize difficulty state',
        'INITIALIZATION_ERROR',
        { userId, topicType }
      )
    }
  }

  /**
   * Calculate optimal difficulty for current session
   */
  async calculateSessionDifficulty(
    userId: string,
    sessionConfig: PracticeSessionConfig
  ): Promise<number> {
    try {
      const { topicType } = sessionConfig

      // Get or initialize difficulty state
      let difficultyState = await this.getDifficultyState(userId, topicType)
      if (!difficultyState) {
        difficultyState = await this.initializeUserDifficulty(userId, topicType)
      }

      // Check for manual override
      if (difficultyState.manual_override_enabled && difficultyState.manual_difficulty_override) {
        return difficultyState.manual_difficulty_override
      }

      // If manual override in session config
      if (sessionConfig.manualDifficultyOverride) {
        return sessionConfig.manualDifficultyOverride
      }

      // Get recent performance data
      const recentPerformance = await this.getRecentPerformanceData(userId, topicType)
      
      // If insufficient data, return current difficulty
      if (recentPerformance.length < this.MIN_QUESTIONS_FOR_ADJUSTMENT) {
        return difficultyState.current_difficulty
      }

      // Get learning style context
      const learningProfile = await profileService.getProfile(userId)
      const learningStyleFactor = this.calculateLearningStyleFactor(learningProfile, topicType)
      const topicAffinity = this.calculateTopicAffinity(learningProfile, topicType)

      // Build FSRS context
      const fsrsState: FSRSState = {
        difficulty: difficultyState.current_difficulty,
        stability: difficultyState.stability_score,
        confidence: this.calculateCurrentConfidence(difficultyState, recentPerformance.length),
        successRate: sessionConfig.targetSuccessRate || difficultyState.success_rate_target,
        lastReview: difficultyState.last_session_at ? new Date(difficultyState.last_session_at) : null,
        retrievability: this.calculateRetrievability(difficultyState, recentPerformance)
      }

      const difficultyContext: DifficultyContext = {
        currentState: fsrsState,
        recentPerformance,
        learningStyleFactor,
        topicAffinity,
        sessionLength: sessionConfig.targetDuration,
        timeOfDay: new Date().getHours()
      }

      // Calculate next difficulty using FSRS
      const calculation = fsrsEngine.calculateNextDifficulty(difficultyContext)
      
      return calculation.nextDifficulty

    } catch (error) {
      console.error('Error calculating session difficulty:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to calculate session difficulty',
        'CALCULATION_ERROR',
        { userId, sessionConfig }
      )
    }
  }

  /**
   * Update difficulty after answer submission
   */
  async updateDifficultyAfterAnswer(
    answerData: AnswerSubmission
  ): Promise<DifficultyAdjustmentDetails> {
    try {
      const { userId, topicType, selectedAnswer, responseTime, sessionId } = answerData

      // Get current difficulty state
      const difficultyState = await this.getDifficultyState(userId, topicType)
      if (!difficultyState) {
        throw new DifficultySystemError(
          'No difficulty state found for user-topic',
          'STATE_NOT_FOUND',
          { userId, topicType }
        )
      }

      // Skip adjustment if manual override is enabled
      if (difficultyState.manual_override_enabled) {
        return {
          previousDifficulty: difficultyState.current_difficulty,
          newDifficulty: difficultyState.current_difficulty,
          adjustmentReason: 'manual_override',
          adjustmentMagnitude: 0,
          algorithmConfidence: 0,
          stabilityChange: 0,
          explanation: 'Manual difficulty override is active'
        }
      }

      // Get question to determine if answer was correct
      const { data: questionData, error: questionError } = await this.supabase
        .from('questions')
        .select('correct_answer, difficulty')
        .eq('id', answerData.questionId)
        .single()

      if (questionError) {
        throw new DifficultySystemError(
          'Question not found',
          'QUESTION_NOT_FOUND',
          { questionId: answerData.questionId }
        )
      }

      const isCorrect = selectedAnswer === questionData.correct_answer

      // Get recent performance including this answer
      const recentPerformance = await this.getRecentPerformanceData(userId, topicType)
      
      // Add current answer to performance data
      const currentPerformance: PerformancePoint = {
        difficulty: answerData.currentDifficulty,
        success: isCorrect,
        responseTime,
        timestamp: new Date(),
        confidence: answerData.expectedSuccessRate || 0.5
      }
      const updatedPerformance = [currentPerformance, ...recentPerformance]

      // Calculate if adjustment is needed
      const shouldAdjust = this.shouldAdjustDifficulty(
        updatedPerformance, 
        difficultyState.success_rate_target
      )

      if (!shouldAdjust) {
        return {
          previousDifficulty: difficultyState.current_difficulty,
          newDifficulty: difficultyState.current_difficulty,
          adjustmentReason: 'performance_based',
          adjustmentMagnitude: 0,
          algorithmConfidence: this.calculateCurrentConfidence(difficultyState, updatedPerformance.length),
          stabilityChange: 0,
          explanation: 'Performance within target range - no adjustment needed'
        }
      }

      // Get learning context
      const learningProfile = await profileService.getProfile(userId)
      const learningStyleFactor = this.calculateLearningStyleFactor(learningProfile, topicType)
      const topicAffinity = this.calculateTopicAffinity(learningProfile, topicType)

      // Build FSRS context
      const fsrsState: FSRSState = {
        difficulty: difficultyState.current_difficulty,
        stability: difficultyState.stability_score,
        confidence: this.calculateCurrentConfidence(difficultyState, updatedPerformance.length),
        successRate: difficultyState.success_rate_target,
        lastReview: new Date(),
        retrievability: this.calculateRetrievability(difficultyState, updatedPerformance)
      }

      const difficultyContext: DifficultyContext = {
        currentState: fsrsState,
        recentPerformance: updatedPerformance,
        learningStyleFactor,
        topicAffinity,
        sessionLength: 30, // Assume 30-minute sessions
        timeOfDay: new Date().getHours()
      }

      // Calculate new difficulty
      const calculation = fsrsEngine.calculateNextDifficulty(difficultyContext)

      // Update difficulty state in database
      const updatedState = await this.updateDifficultyStateInDatabase(
        difficultyState,
        calculation,
        updatedPerformance
      )

      // Log the adjustment
      await this.logDifficultyAdjustment({
        user_id: userId,
        session_id: sessionId,
        topic_type: topicType,
        previous_difficulty: difficultyState.current_difficulty,
        new_difficulty: calculation.nextDifficulty,
        adjustment_reason: 'performance_based',
        trigger_performance_rate: this.calculateRecentSuccessRate(updatedPerformance),
        algorithm_confidence: calculation.confidenceScore,
        stability_factor: calculation.stabilityUpdate,
        learning_style_influence: learningStyleFactor,
        questions_in_context: updatedPerformance.length,
        adjustment_magnitude: calculation.adjustmentMagnitude,
        algorithm_version: '1.0',
        adjustment_notes: calculation.reasoning
      })

      return {
        previousDifficulty: difficultyState.current_difficulty,
        newDifficulty: calculation.nextDifficulty,
        adjustmentReason: 'performance_based',
        adjustmentMagnitude: calculation.adjustmentMagnitude,
        algorithmConfidence: calculation.confidenceScore,
        stabilityChange: calculation.stabilityUpdate - difficultyState.stability_score,
        explanation: calculation.reasoning
      }

    } catch (error) {
      console.error('Error updating difficulty after answer:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to update difficulty after answer',
        'UPDATE_ERROR',
        { answerData }
      )
    }
  }

  // ============================================================================
  // MANUAL OVERRIDE MANAGEMENT
  // ============================================================================

  /**
   * Set manual difficulty override
   */
  async setManualDifficultyOverride(
    userId: string,
    topicType: TopicType,
    difficulty: number,
    reason: string = 'User preference'
  ): Promise<void> {
    try {
      if (difficulty < 1.0 || difficulty > 10.0) {
        throw new DifficultySystemError(
          'Invalid difficulty range',
          'INVALID_DIFFICULTY_RANGE',
          { difficulty }
        )
      }

      // Get current state
      const currentState = await this.getDifficultyState(userId, topicType)
      if (!currentState) {
        throw new DifficultySystemError(
          'No difficulty state found',
          'STATE_NOT_FOUND',
          { userId, topicType }
        )
      }

      // Update with manual override
      const { error } = await this.supabase
        .from('practice_difficulty_state')
        .update({
          manual_override_enabled: true,
          manual_difficulty_override: difficulty,
          manual_override_set_at: new Date().toISOString(),
          manual_override_reason: reason,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('topic_type', topicType)

      if (error) {
        throw new DifficultySystemError(
          'Failed to set manual override',
          'DATABASE_ERROR',
          { error: error.message }
        )
      }

      // Log the override
      await this.logDifficultyAdjustment({
        user_id: userId,
        session_id: null,
        topic_type: topicType,
        previous_difficulty: currentState.current_difficulty,
        new_difficulty: difficulty,
        adjustment_reason: 'manual_override',
        trigger_performance_rate: null,
        algorithm_confidence: 0,
        stability_factor: currentState.stability_score,
        learning_style_influence: 0,
        questions_in_context: 1,
        adjustment_magnitude: Math.abs(difficulty - currentState.current_difficulty),
        algorithm_version: '1.0',
        adjustment_notes: `Manual override: ${reason}`
      })

    } catch (error) {
      console.error('Error setting manual difficulty override:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to set manual override',
        'MANUAL_OVERRIDE_ERROR',
        { userId, topicType, difficulty, reason }
      )
    }
  }

  /**
   * Remove manual difficulty override
   */
  async removeManualOverride(userId: string, topicType: TopicType): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('practice_difficulty_state')
        .update({
          manual_override_enabled: false,
          manual_difficulty_override: null,
          manual_override_set_at: null,
          manual_override_reason: null,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('topic_type', topicType)

      if (error) {
        throw new DifficultySystemError(
          'Failed to remove manual override',
          'DATABASE_ERROR',
          { error: error.message }
        )
      }

    } catch (error) {
      console.error('Error removing manual override:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to remove manual override',
        'MANUAL_OVERRIDE_ERROR',
        { userId, topicType }
      )
    }
  }

  // ============================================================================
  // ANALYTICS AND INSIGHTS
  // ============================================================================

  /**
   * Get difficulty progression for analytics
   */
  async getDifficultyProgression(
    userId: string,
    topicType: TopicType,
    days: number = 30
  ): Promise<DifficultyProgression> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get difficulty adjustments in time range
      const { data: adjustments, error } = await this.supabase
        .from('practice_difficulty_adjustments')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_type', topicType)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        throw new DifficultySystemError(
          'Failed to fetch difficulty progression',
          'DATABASE_ERROR',
          { error: error.message }
        )
      }

      // Get session data for context
      const { data: sessions, error: sessionError } = await this.supabase
        .from('practice_session_difficulty')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_type', topicType)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (sessionError) {
        console.warn('Could not fetch session data for progression:', sessionError)
      }

      // Build progression points
      const progressionPoints = adjustments.map(adj => ({
        timestamp: new Date(adj.created_at),
        difficulty: adj.new_difficulty,
        stability: adj.stability_factor,
        successRate: adj.trigger_performance_rate || 0.5,
        algorithmConfidence: adj.algorithm_confidence,
        adjustmentReason: adj.adjustment_reason as DifficultyAdjustmentReason,
        sessionContext: {
          questionsAttempted: adj.questions_in_context,
          correctAnswers: Math.round(adj.questions_in_context * (adj.trigger_performance_rate || 0.5)),
          avgResponseTime: 0 // Would need to calculate from session data
        }
      }))

      // Calculate trends
      const trends = this.calculateProgressionTrends(progressionPoints)

      // Generate insights and recommendations
      const insights = await this.generateDifficultyInsights(progressionPoints)
      const recommendations = await this.generateDifficultyRecommendations(progressionPoints, trends)

      return {
        userId,
        topicType,
        timeRange: {
          start: startDate,
          end: new Date()
        },
        progressionPoints,
        trends,
        insights,
        recommendations
      }

    } catch (error) {
      console.error('Error getting difficulty progression:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to get difficulty progression',
        'ANALYTICS_ERROR',
        { userId, topicType, days }
      )
    }
  }

  /**
   * Get optimal session recommendations
   */
  async getOptimalSessionRecommendations(userId: string): Promise<SessionRecommendations> {
    try {
      // Get difficulty states for all topics
      const { data: allStates, error } = await this.supabase
        .from('practice_difficulty_state')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        throw new DifficultySystemError(
          'Failed to fetch difficulty states',
          'DATABASE_ERROR',
          { error: error.message }
        )
      }

      const recommendations: SessionRecommendations = {
        userId,
        recommendedTopic: 'logical_reasoning', // Default
        optimalSessionLength: 30,
        recommendedDifficulty: 5.0,
        confidenceLevel: 'medium',
        reasoning: 'Balanced practice session recommended',
        alternatives: []
      }

      if (!allStates || allStates.length === 0) {
        return recommendations
      }

      // Find topic with lowest stability (needs most work)
      const lowestStabilityTopic = allStates.reduce((min, current) => 
        current.stability_score < min.stability_score ? current : min
      )

      recommendations.recommendedTopic = lowestStabilityTopic.topic_type as TopicType
      recommendations.recommendedDifficulty = lowestStabilityTopic.current_difficulty

      // Determine session length based on difficulty and stability
      if (lowestStabilityTopic.stability_score < 30) {
        recommendations.optimalSessionLength = 20 // Shorter sessions for unstable topics
        recommendations.confidenceLevel = 'low'
        recommendations.reasoning = `Focus on ${lowestStabilityTopic.topic_type.replace('_', ' ')} with shorter sessions to build stability`
      } else if (lowestStabilityTopic.stability_score > 70) {
        recommendations.optimalSessionLength = 45 // Longer sessions for stable topics
        recommendations.confidenceLevel = 'high'
        recommendations.reasoning = `Good stability in ${lowestStabilityTopic.topic_type.replace('_', ' ')} - ready for extended practice`
      }

      // Add alternatives for other topics
      recommendations.alternatives = allStates
        .filter(state => state.topic_type !== lowestStabilityTopic.topic_type)
        .map(state => ({
          topicType: state.topic_type as TopicType,
          recommendedDifficulty: state.current_difficulty,
          sessionLength: this.calculateOptimalSessionLength(state),
          reasoning: `Stability: ${state.stability_score.toFixed(0)}%, Target: ${(state.success_rate_target * 100).toFixed(0)}%`
        }))

      return recommendations

    } catch (error) {
      console.error('Error getting session recommendations:', error)
      throw error instanceof DifficultySystemError ? error : new DifficultySystemError(
        'Failed to get session recommendations',
        'RECOMMENDATION_ERROR',
        { userId }
      )
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get difficulty state for user-topic
   */
  private async getDifficultyState(
    userId: string, 
    topicType: TopicType
  ): Promise<PracticeDifficultyState | null> {
    const { data, error } = await this.supabase
      .from('practice_difficulty_state')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_type', topicType)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Error fetching difficulty state:', error)
      return null
    }

    return data || null
  }

  /**
   * Get recent performance data for FSRS calculations
   */
  private async getRecentPerformanceData(
    userId: string, 
    topicType: TopicType
  ): Promise<PerformancePoint[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.PERFORMANCE_ANALYSIS_WINDOW_DAYS)

    const { data, error } = await this.supabase
      .from('question_attempts')
      .select(`
        *,
        questions!inner(question_type, difficulty)
      `)
      .eq('user_id', userId)
      .eq('questions.question_type', topicType)
      .gte('attempted_at', cutoffDate.toISOString())
      .not('practice_difficulty_at_attempt', 'is', null)
      .order('attempted_at', { ascending: false })
      .limit(this.RECENT_PERFORMANCE_LIMIT)

    if (error) {
      console.warn('Error fetching recent performance data:', error)
      return []
    }

    return (data || []).map(attempt => ({
      difficulty: attempt.practice_difficulty_at_attempt || attempt.questions.difficulty,
      success: attempt.is_correct,
      responseTime: attempt.response_time || 0,
      timestamp: new Date(attempt.attempted_at),
      confidence: attempt.expected_success_rate || 0.5
    }))
  }

  /**
   * Extract learning style preferences from profile
   */
  private extractLearningStylePreferences(
    profile: LearningProfile | null
  ): LearningStyleDifficultyPreferences | undefined {
    if (!profile) return undefined

    const effectiveStyle = profile.manual_override_enabled ? 
      profile.manual_primary_style : profile.primary_learning_style

    if (!effectiveStyle) return undefined

    // Map learning style to difficulty preferences
    const styleMapping = {
      'visual_fast': { adaptationSpeed: 'moderate' as const, preferredChallengeLevel: 'stretch' as const },
      'visual_methodical': { adaptationSpeed: 'conservative' as const, preferredChallengeLevel: 'comfort' as const },
      'analytical_fast': { adaptationSpeed: 'moderate' as const, preferredChallengeLevel: 'challenge' as const },
      'analytical_methodical': { adaptationSpeed: 'conservative' as const, preferredChallengeLevel: 'stretch' as const },
      'conceptual_fast': { adaptationSpeed: 'aggressive' as const, preferredChallengeLevel: 'challenge' as const },
      'conceptual_detail': { adaptationSpeed: 'conservative' as const, preferredChallengeLevel: 'stretch' as const },
      'detail_fast': { adaptationSpeed: 'moderate' as const, preferredChallengeLevel: 'stretch' as const },
      'detail_methodical': { adaptationSpeed: 'conservative' as const, preferredChallengeLevel: 'comfort' as const }
    }

    const stylePrefs = styleMapping[effectiveStyle as keyof typeof styleMapping] || 
      { adaptationSpeed: 'moderate' as const, preferredChallengeLevel: 'stretch' as const }

    return {
      learningStyle: effectiveStyle,
      adaptationSpeed: stylePrefs.adaptationSpeed,
      preferredChallengeLevel: stylePrefs.preferredChallengeLevel,
      preferredStartingDifficulty: 5.0,
      targetSuccessRate: 0.75,
      stabilityPreference: stylePrefs.adaptationSpeed === 'conservative' ? 0.8 : 0.5,
      confidenceThreshold: 0.6,
      manualOverrideFrequency: 0.1,
      topicAffinities: {
        logical_reasoning: { naturalDifficulty: 0, learningSpeed: 1.0, stabilityFactor: 1.0, preferredSessionLength: 30 },
        logic_games: { naturalDifficulty: 0.5, learningSpeed: 0.9, stabilityFactor: 1.1, preferredSessionLength: 35 },
        reading_comprehension: { naturalDifficulty: -0.2, learningSpeed: 1.1, stabilityFactor: 0.9, preferredSessionLength: 25 }
      }
    }
  }

  /**
   * Calculate learning style factor for FSRS
   */
  private calculateLearningStyleFactor(
    profile: LearningProfile | null, 
    topicType: TopicType
  ): number {
    if (!profile) return 1.0

    const effectiveStyle = profile.manual_override_enabled ? 
      profile.manual_primary_style : profile.primary_learning_style

    if (!effectiveStyle) return 1.0

    // Base factor on learning style characteristics
    const styleFactor = effectiveStyle.includes('fast') ? 1.1 : 0.9
    const methodFactor = effectiveStyle.includes('methodical') ? 0.95 : 1.05
    
    return Math.max(0.7, Math.min(1.3, styleFactor * methodFactor))
  }

  /**
   * Calculate topic affinity factor
   */
  private calculateTopicAffinity(
    profile: LearningProfile | null, 
    topicType: TopicType
  ): number {
    if (!profile) return 1.0

    // Base affinity on learning style and topic characteristics
    const effectiveStyle = profile.manual_override_enabled ? 
      profile.manual_primary_style : profile.primary_learning_style

    if (!effectiveStyle) return 1.0

    const topicAffinities = {
      logical_reasoning: {
        visual: 0.9, analytical: 1.1, conceptual: 1.0, detail: 1.0
      },
      logic_games: {
        visual: 1.2, analytical: 1.1, conceptual: 0.9, detail: 1.0
      },
      reading_comprehension: {
        visual: 0.8, analytical: 1.0, conceptual: 1.1, detail: 1.2
      }
    }

    let affinity = 1.0
    Object.entries(topicAffinities[topicType]).forEach(([trait, factor]) => {
      if (effectiveStyle.includes(trait)) {
        affinity *= factor
      }
    })

    return Math.max(0.8, Math.min(1.2, affinity))
  }

  /**
   * Calculate current algorithm confidence
   */
  private calculateCurrentConfidence(
    state: PracticeDifficultyState,
    dataPoints: number
  ): number {
    const baseConfidence = 30
    const dataConfidence = Math.min(40, (dataPoints / 10) * 40)
    const stabilityConfidence = (state.stability_score / 100) * 30
    
    return Math.max(20, Math.min(100, baseConfidence + dataConfidence + stabilityConfidence))
  }

  /**
   * Calculate retrievability score
   */
  private calculateRetrievability(
    state: PracticeDifficultyState,
    recentPerformance: PerformancePoint[]
  ): number {
    if (recentPerformance.length === 0) return 0.5

    const recentSuccessRate = recentPerformance.filter(p => p.success).length / recentPerformance.length
    const stabilityBonus = state.stability_score / 200 // 0-0.5 bonus
    
    return Math.max(0.1, Math.min(0.9, recentSuccessRate + stabilityBonus))
  }

  /**
   * Calculate recent success rate
   */
  private calculateRecentSuccessRate(performance: PerformancePoint[]): number {
    if (performance.length === 0) return 0.5
    return performance.filter(p => p.success).length / performance.length
  }

  /**
   * Determine if difficulty adjustment is needed
   */
  private shouldAdjustDifficulty(
    performance: PerformancePoint[], 
    targetSuccessRate: number
  ): boolean {
    if (performance.length < this.MIN_QUESTIONS_FOR_ADJUSTMENT) return false

    const recentSuccessRate = this.calculateRecentSuccessRate(performance.slice(0, 5))
    const threshold = 0.1 // 10% deviation threshold
    
    return Math.abs(recentSuccessRate - targetSuccessRate) > threshold
  }

  /**
   * Update difficulty state in database
   */
  private async updateDifficultyStateInDatabase(
    currentState: PracticeDifficultyState,
    calculation: DifficultyCalculation,
    recentPerformance: PerformancePoint[]
  ): Promise<PracticeDifficultyState> {
    const updatedData = {
      current_difficulty: calculation.nextDifficulty,
      stability_score: calculation.stabilityUpdate,
      current_success_rate: this.calculateRecentSuccessRate(recentPerformance),
      questions_attempted: currentState.questions_attempted + 1,
      last_updated: new Date().toISOString(),
      last_session_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('practice_difficulty_state')
      .update(updatedData)
      .eq('id', currentState.id)
      .select()
      .single()

    if (error) {
      throw new DifficultySystemError(
        'Failed to update difficulty state',
        'DATABASE_ERROR',
        { error: error.message }
      )
    }

    return data
  }

  /**
   * Log difficulty adjustment for audit trail
   */
  private async logDifficultyAdjustment(
    adjustmentData: Omit<PracticeDifficultyAdjustment, 'id' | 'created_at'>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('practice_difficulty_adjustments')
      .insert(adjustmentData)

    if (error) {
      console.error('Error logging difficulty adjustment:', error)
      // Don't throw - logging failure shouldn't break the main flow
    }
  }

  /**
   * Calculate progression trends
   */
  private calculateProgressionTrends(points: any[]): any {
    // Implementation would analyze trends in difficulty, stability, and performance
    // This is a simplified version
    return {
      difficultyTrend: 'stable' as const,
      stabilityTrend: 'improving' as const,
      performanceTrend: 'stable' as const
    }
  }

  /**
   * Generate difficulty insights
   */
  private async generateDifficultyInsights(points: any[]): Promise<any[]> {
    // Implementation would analyze patterns and generate insights
    return []
  }

  /**
   * Generate difficulty recommendations
   */
  private async generateDifficultyRecommendations(points: any[], trends: any): Promise<any[]> {
    // Implementation would generate actionable recommendations
    return []
  }

  /**
   * Calculate optimal session length for a difficulty state
   */
  private calculateOptimalSessionLength(state: PracticeDifficultyState): number {
    const baseLength = 30
    const stabilityModifier = state.stability_score < 50 ? 0.7 : 1.0
    const difficultyModifier = state.current_difficulty > 7 ? 0.8 : 1.0
    
    return Math.round(baseLength * stabilityModifier * difficultyModifier)
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const dynamicDifficultyService = new DynamicDifficultyService()

// ============================================================================
// TYPE EXPORT FOR SERVICE REFERENCES
// ============================================================================

export type { SessionRecommendations }

// Simple session recommendations type for completeness
interface SessionRecommendations {
  userId: string
  recommendedTopic: TopicType
  optimalSessionLength: number
  recommendedDifficulty: number
  confidenceLevel: 'low' | 'medium' | 'high'
  reasoning: string
  alternatives: Array<{
    topicType: TopicType
    recommendedDifficulty: number
    sessionLength: number
    reasoning: string
  }>
}