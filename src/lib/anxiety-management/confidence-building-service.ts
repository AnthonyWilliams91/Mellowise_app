/**
 * Confidence Building Service
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Service for building user confidence through adaptive question sequencing,
 * positive reinforcement, and achievement tracking.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { createClient } from '@/lib/supabase/client'
import { dynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service'
import { profileService } from '@/lib/learning-style/profile-service'
import type {
  ConfidenceLevel,
  ConfidenceMetrics,
  ConfidenceBuildingConfig,
  QuestionSequencingStrategy,
  AnxietyLevel,
  PositiveReinforcementMessage,
  AchievementCelebration,
  PersonalizedEncouragement,
  ConfidenceBuildingService as IConfidenceBuildingService
} from '@/types/anxiety-management'
import type { LearningProfile } from '@/types/learning-style'
import type { SessionPerformance } from '@/types/analytics'

// ============================================================================
// CONFIDENCE BUILDING SERVICE CLASS
// ============================================================================

export class ConfidenceBuildingService implements IConfidenceBuildingService {
  private supabase = createClient()
  private readonly CONFIDENCE_THRESHOLDS = {
    very_low: 20,
    low: 40,
    moderate: 60,
    high: 80,
    very_high: 100
  }

  private readonly DEFAULT_CONFIG: ConfidenceBuildingConfig = {
    start_difficulty_reduction: 2, // Reduce difficulty by 2 levels initially
    success_threshold: 75, // 75% success rate to maintain confidence
    progression_rate: 0.5, // Increase difficulty by 0.5 levels per success
    safety_net_enabled: true,
    positive_reinforcement_frequency: 3 // Every 3 correct answers
  }

  /**
   * Assess current confidence level based on performance and achievement data
   */
  async assessConfidenceLevel(userId: string): Promise<ConfidenceMetrics> {
    try {
      // Get recent performance data
      const recentPerformance = await this.getRecentPerformance(userId)
      const learningProfile = await profileService.getProfile(userId)

      // Calculate base confidence score from performance
      const baseConfidenceScore = this.calculateBaseConfidenceScore(recentPerformance)

      // Apply learning style adjustments
      const adjustedScore = this.applyLearningStyleAdjustments(
        baseConfidenceScore,
        learningProfile
      )

      // Get achievement momentum
      const achievementMomentum = await this.calculateAchievementMomentum(userId)

      // Calculate success rate trend
      const successRateTrend = this.calculateSuccessRateTrend(recentPerformance)

      // Get topic mastery progress
      const masteryProgress = await this.calculateMasteryProgress(userId)

      // Calculate final confidence score
      const finalConfidenceScore = Math.min(100, Math.max(0,
        adjustedScore + achievementMomentum + (successRateTrend * 10)
      ))

      // Determine confidence level
      const confidenceLevel = this.classifyConfidenceLevel(finalConfidenceScore)

      const metrics: ConfidenceMetrics = {
        current_level: confidenceLevel,
        confidence_score: Math.round(finalConfidenceScore),
        success_rate_trend: Math.round(successRateTrend * 100) / 100,
        achievement_momentum: Math.round(achievementMomentum),
        mastery_progress: masteryProgress,
        last_calculated: new Date().toISOString()
      }

      // Store metrics
      await this.storeConfidenceMetrics(userId, metrics)

      return metrics

    } catch (error) {
      console.error('Error assessing confidence level:', error)
      throw new Error(`Failed to assess confidence level: ${error.message}`)
    }
  }

  /**
   * Generate adaptive question sequence to build confidence
   */
  async generateQuestionSequence(
    userId: string,
    anxietyLevel: AnxietyLevel
  ): Promise<QuestionSequencingStrategy> {
    try {
      const [confidenceMetrics, learningProfile, config] = await Promise.all([
        this.assessConfidenceLevel(userId),
        profileService.getProfile(userId),
        this.getConfidenceBuildingConfig(userId)
      ])

      // Determine strategy type based on confidence and anxiety
      const strategyType = this.determineSequencingStrategy(confidenceMetrics, anxietyLevel)

      // Calculate starting difficulty
      const startingDifficulty = await this.calculateStartingDifficulty(
        userId,
        confidenceMetrics,
        anxietyLevel,
        config
      )

      // Generate difficulty progression
      const difficultyProgression = this.generateDifficultyProgression(
        startingDifficulty,
        strategyType,
        config
      )

      // Calculate expected success rates
      const expectedSuccessRates = this.calculateExpectedSuccessRates(
        difficultyProgression,
        confidenceMetrics,
        learningProfile
      )

      // Set confidence checkpoints
      const confidenceCheckpoints = this.setConfidenceCheckpoints(difficultyProgression)

      // Get fallback options
      const fallbackOptions = await this.getFallbackQuestions(userId, startingDifficulty - 1)

      const strategy: QuestionSequencingStrategy = {
        strategy_type: strategyType,
        difficulty_progression: difficultyProgression,
        expected_success_rates: expectedSuccessRates,
        confidence_checkpoints: confidenceCheckpoints,
        fallback_options: fallbackOptions
      }

      return strategy

    } catch (error) {
      console.error('Error generating question sequence:', error)
      throw new Error(`Failed to generate question sequence: ${error.message}`)
    }
  }

  /**
   * Update confidence score based on session performance
   */
  async updateConfidenceScore(userId: string, sessionData: any): Promise<ConfidenceMetrics> {
    try {
      // Get current confidence metrics
      const currentMetrics = await this.assessConfidenceLevel(userId)

      // Analyze session performance impact
      const sessionImpact = this.analyzeSessionImpact(sessionData, currentMetrics)

      // Apply confidence adjustments
      const adjustedScore = Math.min(100, Math.max(0,
        currentMetrics.confidence_score + sessionImpact.confidence_change
      ))

      // Update achievement momentum if applicable
      const newAchievementMomentum = sessionImpact.achievements_unlocked > 0
        ? currentMetrics.achievement_momentum + (sessionImpact.achievements_unlocked * 5)
        : Math.max(0, currentMetrics.achievement_momentum - 1) // Decay over time

      // Update success rate trend
      const newSuccessRateTrend = this.updateSuccessRateTrend(
        currentMetrics.success_rate_trend,
        sessionData.accuracy_percentage || 0
      )

      // Update mastery progress
      const updatedMasteryProgress = await this.updateMasteryProgress(
        userId,
        sessionData,
        currentMetrics.mastery_progress
      )

      const updatedMetrics: ConfidenceMetrics = {
        current_level: this.classifyConfidenceLevel(adjustedScore),
        confidence_score: Math.round(adjustedScore),
        success_rate_trend: Math.round(newSuccessRateTrend * 100) / 100,
        achievement_momentum: Math.round(newAchievementMomentum),
        mastery_progress: updatedMasteryProgress,
        last_calculated: new Date().toISOString()
      }

      // Store updated metrics
      await this.storeConfidenceMetrics(userId, updatedMetrics)

      // Trigger positive reinforcement if appropriate
      if (sessionImpact.trigger_reinforcement) {
        await this.triggerPositiveReinforcement(userId, sessionData, updatedMetrics)
      }

      // Trigger achievement celebration if applicable
      if (sessionImpact.achievements_unlocked > 0) {
        await this.triggerAchievementCelebration(userId, sessionData)
      }

      return updatedMetrics

    } catch (error) {
      console.error('Error updating confidence score:', error)
      throw new Error(`Failed to update confidence score: ${error.message}`)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate base confidence score from performance data
   */
  private calculateBaseConfidenceScore(recentPerformance: SessionPerformance[]): number {
    if (recentPerformance.length === 0) return 50 // Neutral starting point

    // Recent accuracy (weighted more heavily)
    const recentSessions = recentPerformance.slice(0, 5)
    const olderSessions = recentPerformance.slice(5, 10)

    const recentAvgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / recentSessions.length
    const olderAvgAccuracy = olderSessions.length > 0
      ? olderSessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / olderSessions.length
      : recentAvgAccuracy

    // Base score from recent performance
    let baseScore = recentAvgAccuracy * 0.8 // 80% weight on recent accuracy

    // Trend adjustment
    const trend = recentAvgAccuracy - olderAvgAccuracy
    baseScore += trend * 0.5 // Positive trend boosts confidence

    // Consistency bonus
    const accuracies = recentSessions.map(s => s.accuracy_percentage)
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length
    const consistency = Math.max(0, 100 - Math.sqrt(variance))
    baseScore += consistency * 0.2 // Consistency bonus

    return Math.min(100, Math.max(0, baseScore))
  }

  /**
   * Apply learning style adjustments to confidence score
   */
  private applyLearningStyleAdjustments(
    baseScore: number,
    learningProfile: LearningProfile | null
  ): number {
    if (!learningProfile) return baseScore

    let adjustedScore = baseScore

    // Visual learners gain confidence from clear progress visualization
    if (learningProfile.learning_style?.includes('visual')) {
      adjustedScore += 3
    }

    // Kinesthetic learners need interactive feedback
    if (learningProfile.learning_style?.includes('kinesthetic')) {
      adjustedScore += 2
    }

    // Competitive learners respond well to comparisons
    if (learningProfile.learning_style?.includes('competitive')) {
      adjustedScore += 4
    }

    // Social learners benefit from community achievements
    if (learningProfile.learning_style?.includes('social')) {
      adjustedScore += 2
    }

    return Math.min(100, adjustedScore)
  }

  /**
   * Calculate achievement momentum from recent accomplishments
   */
  private async calculateAchievementMomentum(userId: string): Promise<number> {
    const { data: achievements, error } = await this.supabase
      .from('achievement_celebrations')
      .select('points_earned, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false })

    if (error || !achievements) return 0

    // Calculate momentum with time decay
    let momentum = 0
    const now = Date.now()

    achievements.forEach(achievement => {
      const daysAgo = (now - new Date(achievement.created_at).getTime()) / (24 * 60 * 60 * 1000)
      const timeDecay = Math.max(0, 1 - (daysAgo / 7)) // Linear decay over 7 days
      momentum += (achievement.points_earned || 0) * timeDecay * 0.1 // Scale down points
    })

    return Math.min(20, momentum) // Cap momentum contribution
  }

  /**
   * Calculate success rate trend
   */
  private calculateSuccessRateTrend(recentPerformance: SessionPerformance[]): number {
    if (recentPerformance.length < 2) return 0

    const recentSessions = recentPerformance.slice(0, 5)
    const olderSessions = recentPerformance.slice(5, 10)

    if (olderSessions.length === 0) return 0

    const recentSuccessRate = recentSessions.reduce((sum, s) => sum + (s.accuracy_percentage >= 75 ? 1 : 0), 0) / recentSessions.length
    const olderSuccessRate = olderSessions.reduce((sum, s) => sum + (s.accuracy_percentage >= 75 ? 1 : 0), 0) / olderSessions.length

    return recentSuccessRate - olderSuccessRate // Range: -1 to 1
  }

  /**
   * Calculate topic mastery progress
   */
  private async calculateMasteryProgress(userId: string): Promise<Record<string, number>> {
    const { data: topicPerformance, error } = await this.supabase
      .from('topic_performance')
      .select('topic_type, current_accuracy')
      .eq('user_id', userId)

    if (error || !topicPerformance) return {}

    const masteryProgress: Record<string, number> = {}
    topicPerformance.forEach(topic => {
      masteryProgress[topic.topic_type] = Math.round(topic.current_accuracy * 100)
    })

    return masteryProgress
  }

  /**
   * Classify confidence level from numeric score
   */
  private classifyConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= this.CONFIDENCE_THRESHOLDS.very_high) return 'very_high'
    if (score >= this.CONFIDENCE_THRESHOLDS.high) return 'high'
    if (score >= this.CONFIDENCE_THRESHOLDS.moderate) return 'moderate'
    if (score >= this.CONFIDENCE_THRESHOLDS.low) return 'low'
    return 'very_low'
  }

  /**
   * Store confidence metrics in database
   */
  private async storeConfidenceMetrics(userId: string, metrics: ConfidenceMetrics): Promise<void> {
    const { error } = await this.supabase
      .from('confidence_metrics')
      .upsert({
        user_id: userId,
        confidence_level: metrics.current_level,
        confidence_score: metrics.confidence_score,
        trend_data: {
          success_rate_trend: metrics.success_rate_trend,
          achievement_momentum: metrics.achievement_momentum,
          mastery_progress: metrics.mastery_progress
        },
        last_updated: metrics.last_calculated
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error storing confidence metrics:', error)
      throw error
    }
  }

  /**
   * Get recent performance data for user
   */
  private async getRecentPerformance(userId: string): Promise<SessionPerformance[]> {
    const { data, error } = await this.supabase
      .from('session_performance')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15)

    if (error) throw error
    return data || []
  }

  /**
   * Get confidence building configuration for user
   */
  private async getConfidenceBuildingConfig(userId: string): Promise<ConfidenceBuildingConfig> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('confidence_building_config')
      .eq('user_id', userId)
      .single()

    if (error || !data?.confidence_building_config) {
      return this.DEFAULT_CONFIG
    }

    return { ...this.DEFAULT_CONFIG, ...data.confidence_building_config }
  }

  /**
   * Determine appropriate sequencing strategy
   */
  private determineSequencingStrategy(
    metrics: ConfidenceMetrics,
    anxietyLevel: AnxietyLevel
  ): 'confidence_building' | 'gradual_challenge' | 'success_momentum' {
    if (anxietyLevel === 'high' || anxietyLevel === 'severe') {
      return 'confidence_building'
    }

    if (metrics.current_level === 'very_low' || metrics.current_level === 'low') {
      return 'confidence_building'
    }

    if (metrics.success_rate_trend > 0.3) {
      return 'success_momentum'
    }

    return 'gradual_challenge'
  }

  /**
   * Calculate starting difficulty based on confidence and anxiety
   */
  private async calculateStartingDifficulty(
    userId: string,
    metrics: ConfidenceMetrics,
    anxietyLevel: AnxietyLevel,
    config: ConfidenceBuildingConfig
  ): Promise<number> {
    // Get user's current difficulty level
    const currentDifficulty = await dynamicDifficultyService.getCurrentDifficulty(userId, 'practice') || 5

    // Apply reductions based on confidence and anxiety
    let difficultyReduction = 0

    // Anxiety-based reduction
    const anxietyReductions = { low: 0, moderate: 1, high: 2, severe: 3 }
    difficultyReduction += anxietyReductions[anxietyLevel]

    // Confidence-based reduction
    const confidenceReductions = { very_low: 3, low: 2, moderate: 1, high: 0, very_high: 0 }
    difficultyReduction += confidenceReductions[metrics.current_level]

    // Apply configured reduction
    difficultyReduction += config.start_difficulty_reduction

    const startingDifficulty = Math.max(1, currentDifficulty - difficultyReduction)
    return Math.min(10, startingDifficulty)
  }

  /**
   * Generate difficulty progression sequence
   */
  private generateDifficultyProgression(
    startingDifficulty: number,
    strategy: string,
    config: ConfidenceBuildingConfig
  ): number[] {
    const progression: number[] = [startingDifficulty]

    for (let i = 1; i < 10; i++) {
      let nextDifficulty = progression[i - 1]

      switch (strategy) {
        case 'confidence_building':
          // Very gradual increase
          nextDifficulty += i % 3 === 0 ? 0.5 : 0
          break
        case 'gradual_challenge':
          // Steady increase
          nextDifficulty += config.progression_rate
          break
        case 'success_momentum':
          // Faster increase when doing well
          nextDifficulty += config.progression_rate * 1.5
          break
      }

      progression.push(Math.min(10, Math.max(1, Math.round(nextDifficulty * 2) / 2)))
    }

    return progression
  }

  /**
   * Calculate expected success rates for difficulty progression
   */
  private calculateExpectedSuccessRates(
    progression: number[],
    metrics: ConfidenceMetrics,
    profile: LearningProfile | null
  ): number[] {
    return progression.map(difficulty => {
      // Base success rate inversely related to difficulty
      let baseRate = Math.max(0.4, 1 - (difficulty - 1) / 12)

      // Adjust for confidence level
      const confidenceBonus = metrics.confidence_score / 200 // 0 to 0.5 bonus
      baseRate += confidenceBonus

      // Adjust for learning style
      if (profile?.learning_style?.includes('analytical')) {
        baseRate += 0.05 // Analytical learners perform slightly better
      }

      return Math.min(0.95, Math.max(0.3, baseRate))
    })
  }

  /**
   * Set confidence checkpoints in the progression
   */
  private setConfidenceCheckpoints(progression: number[]): number[] {
    // Check confidence after every 3 questions
    return [2, 5, 8]
  }

  /**
   * Get fallback question options
   */
  private async getFallbackQuestions(userId: string, maxDifficulty: number): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('id')
      .lte('difficulty', maxDifficulty)
      .limit(5)

    if (error) return []
    return data?.map(q => q.id) || []
  }

  /**
   * Analyze session impact on confidence
   */
  private analyzeSessionImpact(sessionData: any, currentMetrics: ConfidenceMetrics): any {
    const accuracy = sessionData.accuracy_percentage || 0
    const questionsAnswered = sessionData.questions_answered || 0
    const streakLength = sessionData.max_streak || 0

    let confidenceChange = 0
    let achievementsUnlocked = 0
    let triggerReinforcement = false

    // Accuracy impact
    if (accuracy >= 90) {
      confidenceChange += 5
      triggerReinforcement = true
    } else if (accuracy >= 80) {
      confidenceChange += 3
    } else if (accuracy >= 70) {
      confidenceChange += 1
    } else if (accuracy < 50) {
      confidenceChange -= 2
    }

    // Streak impact
    if (streakLength >= 10) {
      confidenceChange += 3
      achievementsUnlocked += 1
    } else if (streakLength >= 5) {
      confidenceChange += 2
    }

    // Session completion impact
    if (questionsAnswered >= 10) {
      confidenceChange += 1
    }

    // Achievement detection
    if (accuracy > 85 && questionsAnswered >= 10) {
      achievementsUnlocked += 1
    }

    return {
      confidence_change: confidenceChange,
      achievements_unlocked: achievementsUnlocked,
      trigger_reinforcement: triggerReinforcement
    }
  }

  /**
   * Update success rate trend
   */
  private updateSuccessRateTrend(currentTrend: number, sessionAccuracy: number): number {
    const sessionSuccess = sessionAccuracy >= 75 ? 1 : 0
    // Exponential moving average with alpha = 0.3
    return currentTrend * 0.7 + sessionSuccess * 0.3
  }

  /**
   * Update mastery progress
   */
  private async updateMasteryProgress(
    userId: string,
    sessionData: any,
    currentProgress: Record<string, number>
  ): Promise<Record<string, number>> {
    // This would integrate with topic performance tracking
    // For now, return current progress
    return currentProgress
  }

  /**
   * Trigger positive reinforcement messaging
   */
  private async triggerPositiveReinforcement(
    userId: string,
    sessionData: any,
    metrics: ConfidenceMetrics
  ): Promise<void> {
    // Implementation would send personalized encouragement
    console.log('Triggering positive reinforcement for user:', userId)
  }

  /**
   * Trigger achievement celebration
   */
  private async triggerAchievementCelebration(
    userId: string,
    sessionData: any
  ): Promise<void> {
    // Implementation would create celebration event
    console.log('Triggering achievement celebration for user:', userId)
  }
}

// Export singleton instance
export const confidenceBuildingService = new ConfidenceBuildingService()