/**
 * FSRS Algorithm Engine for Dynamic Difficulty Adjustment
 * MELLOWISE-010: FSRS-Inspired Adaptive Learning
 * 
 * Implements the Free Spaced Repetition Scheduler (FSRS) algorithm adapted
 * for real-time difficulty adjustment in practice modes. Maintains optimal
 * challenge levels (70-80% success rate) through intelligent adaptation.
 * 
 * @author Architect Agent Winston
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import {
  DifficultySystemError
} from '@/types/dynamic-difficulty'
import type {
  FSRSState,
  DifficultyContext,
  PerformancePoint,
  DifficultyCalculation,
  FSRSConfiguration,
  LearningStyleDifficultyPreferences,
  TopicPerformanceMetrics,
  TopicType
} from '@/types/dynamic-difficulty'

// ============================================================================
// FSRS ALGORITHM CONSTANTS
// ============================================================================

/**
 * Default FSRS configuration parameters optimized for LSAT practice
 */
export const DEFAULT_FSRS_CONFIG: FSRSConfiguration = {
  // Core FSRS parameters
  defaultDifficulty: 5.0,
  targetSuccessRate: 0.75,
  minConfidenceThreshold: 0.3,
  maxAdjustmentMagnitude: 2.0,
  
  // Stability parameters
  baseStabilityScore: 50.0,
  stabilityGrowthRate: 0.1,
  stabilityDecayRate: 0.05,
  
  // Confidence interval parameters
  defaultConfidenceInterval: 2.0,
  confidenceGrowthFactor: 0.95,
  maxConfidenceInterval: 3.0,
  
  // Learning style modifiers
  learningStyleInfluence: 0.3,
  topicAffinityInfluence: 0.2,
  
  // Performance thresholds
  excellentPerformanceThreshold: 0.85,
  poorPerformanceThreshold: 0.60,
  stagnationDetectionThreshold: 5,
  
  // Time-based factors
  timeDecayHalfLife: 14, // 2 weeks
  recentPerformanceWindow: 7, // 1 week
  minimumSessionGap: 30 // 30 minutes
}

/**
 * Learning curve parameters for different learning styles
 */
const LEARNING_STYLE_MODIFIERS = {
  'visual_fast': { adaptationSpeed: 1.2, stabilityBonus: 0.1, difficultyBias: 0.5 },
  'visual_methodical': { adaptationSpeed: 0.8, stabilityBonus: 0.2, difficultyBias: -0.3 },
  'analytical_fast': { adaptationSpeed: 1.1, stabilityBonus: 0.15, difficultyBias: 0.3 },
  'analytical_methodical': { adaptationSpeed: 0.9, stabilityBonus: 0.25, difficultyBias: -0.2 },
  'conceptual_fast': { adaptationSpeed: 1.15, stabilityBonus: 0.05, difficultyBias: 0.4 },
  'conceptual_detail': { adaptationSpeed: 0.85, stabilityBonus: 0.3, difficultyBias: -0.1 },
  'detail_fast': { adaptationSpeed: 1.0, stabilityBonus: 0.1, difficultyBias: 0.2 },
  'detail_methodical': { adaptationSpeed: 0.75, stabilityBonus: 0.35, difficultyBias: -0.4 }
} as const

// ============================================================================
// FSRS ALGORITHM ENGINE CLASS
// ============================================================================

export class FSRSAlgorithmEngine {
  private config: FSRSConfiguration

  constructor(config: Partial<FSRSConfiguration> = {}) {
    this.config = { ...DEFAULT_FSRS_CONFIG, ...config }
  }

  // ============================================================================
  // CORE FSRS CALCULATIONS
  // ============================================================================

  /**
   * Calculate next difficulty level using FSRS-inspired algorithm
   */
  calculateNextDifficulty(context: DifficultyContext): DifficultyCalculation {
    try {
      const { currentState, recentPerformance, learningStyleFactor, topicAffinity } = context

      // Calculate recent success rate
      const recentSuccessRate = this.calculateRecentSuccessRate(recentPerformance)
      
      // Calculate performance delta from target
      const performanceDelta = recentSuccessRate - currentState.successRate
      
      // Calculate stability modifier (higher stability = smaller adjustments)
      const stabilityModifier = this.calculateStabilityModifier(currentState.stability)
      
      // Calculate learning style influence
      const learningStyleAdjustment = this.calculateLearningStyleAdjustment(
        learningStyleFactor, 
        performanceDelta
      )
      
      // Calculate topic affinity influence
      const topicAffinityAdjustment = this.calculateTopicAffinityAdjustment(
        topicAffinity, 
        performanceDelta
      )
      
      // Calculate base difficulty adjustment
      let rawAdjustment = this.calculateBaseDifficultyAdjustment(
        performanceDelta,
        stabilityModifier,
        recentPerformance.length
      )
      
      // Apply learning style and topic affinity modifiers
      rawAdjustment += learningStyleAdjustment + topicAffinityAdjustment
      
      // Apply confidence interval constraints
      const constrainedAdjustment = this.applyConfidenceConstraints(
        rawAdjustment,
        currentState.confidence,
        recentPerformance.length
      )
      
      // Calculate final difficulty
      const nextDifficulty = this.constrainDifficulty(
        currentState.difficulty + constrainedAdjustment
      )
      
      // Calculate new stability score
      const stabilityUpdate = this.calculateStabilityUpdate(
        currentState.stability,
        recentPerformance,
        constrainedAdjustment
      )
      
      // Calculate algorithm confidence
      const confidenceScore = this.calculateAlgorithmConfidence(
        recentPerformance,
        stabilityUpdate,
        Math.abs(constrainedAdjustment)
      )
      
      // Generate reasoning
      const reasoning = this.generateAdjustmentReasoning(
        currentState.difficulty,
        nextDifficulty,
        recentSuccessRate,
        currentState.successRate,
        confidenceScore
      )
      
      // Calculate expected performance at new difficulty
      const expectedPerformance = this.predictPerformanceAtDifficulty(
        nextDifficulty,
        stabilityUpdate,
        learningStyleFactor
      )

      return {
        nextDifficulty,
        confidenceScore,
        stabilityUpdate,
        reasoning,
        adjustmentMagnitude: Math.abs(constrainedAdjustment),
        expectedPerformance
      }

    } catch (error) {
      console.error('Error in FSRS difficulty calculation:', error)
      throw new DifficultySystemError(
        'Failed to calculate next difficulty',
        'FSRS_ENGINE_ERROR',
        { context, error: error.message }
      )
    }
  }

  /**
   * Update stability score based on performance history
   */
  updateStabilityScore(
    currentStability: number,
    performanceHistory: PerformancePoint[]
  ): number {
    try {
      if (performanceHistory.length === 0) {
        return currentStability
      }

      // Use the same logic as calculateStabilityUpdate but with assumed adjustment magnitude of 0
      return this.calculateStabilityUpdate(currentStability, performanceHistory, 0)

    } catch (error) {
      console.error('Error updating stability score:', error)
      throw new DifficultySystemError(
        'Failed to update stability score',
        'STABILITY_CALCULATION_ERROR',
        { currentStability, performanceHistoryLength: performanceHistory.length }
      )
    }
  }

  /**
   * Adjust confidence interval based on variance and data quality
   */
  adjustConfidenceInterval(
    currentInterval: number,
    performanceVariance: number,
    dataPoints: number
  ): number {
    try {
      // More data points = smaller confidence interval (stronger convergence)
      const dataConfidenceFactor = Math.max(0.3, 1 - (dataPoints / 30))
      
      // Higher variance = larger confidence interval
      const varianceInfluence = Math.min(1.5, performanceVariance * 3)
      
      // Calculate target interval based on data quality
      const targetInterval = this.config.defaultConfidenceInterval * 
        (dataConfidenceFactor * 0.7 + varianceInfluence * 0.5)
      
      // More aggressive adjustment towards target
      const adjustmentRate = 0.15 // More aggressive than the original 0.95
      const adjustment = (targetInterval - currentInterval) * adjustmentRate
      const newInterval = currentInterval + adjustment
      
      // Constrain to valid range
      return Math.max(0.5, Math.min(this.config.maxConfidenceInterval, newInterval))

    } catch (error) {
      console.error('Error adjusting confidence interval:', error)
      return currentInterval // Return current value on error
    }
  }

  /**
   * Select optimal question difficulty from available options
   */
  selectOptimalQuestionDifficulty(
    availableDifficulties: number[],
    targetDifficulty: number,
    confidenceInterval: number = 1.0
  ): number {
    if (availableDifficulties.length === 0) {
      return targetDifficulty
    }

    // Define acceptable range based on confidence interval
    const minAcceptable = targetDifficulty - confidenceInterval
    const maxAcceptable = targetDifficulty + confidenceInterval
    
    // Filter difficulties within acceptable range
    const acceptableDifficulties = availableDifficulties.filter(
      d => d >= minAcceptable && d <= maxAcceptable
    )
    
    if (acceptableDifficulties.length > 0) {
      // Find closest to target within acceptable range
      return acceptableDifficulties.reduce((closest, current) => 
        Math.abs(current - targetDifficulty) < Math.abs(closest - targetDifficulty) 
          ? current : closest
      )
    }
    
    // If no perfect match, find closest overall
    return availableDifficulties.reduce((closest, current) => 
      Math.abs(current - targetDifficulty) < Math.abs(closest - targetDifficulty) 
        ? current : closest
    )
  }

  /**
   * Predict performance probability at given difficulty
   */
  predictPerformanceAtDifficulty(
    questionDifficulty: number,
    userStability: number,
    learningStyleFactor: number = 1.0
  ): number {
    try {
      // Base prediction using sigmoid function
      const difficultyGap = questionDifficulty - 5.0 // Normalized around difficulty 5
      const stabilityBonus = (userStability - 50) / 100 // Normalize stability
      const styleAdjustment = (learningStyleFactor - 1.0) * 0.2
      
      // Combined difficulty adjustment
      const adjustedDifficulty = difficultyGap - stabilityBonus - styleAdjustment
      
      // Sigmoid probability function
      const probability = 1 / (1 + Math.exp(adjustedDifficulty * 0.8))
      
      // Ensure reasonable bounds
      return Math.max(0.1, Math.min(0.95, probability))

    } catch (error) {
      console.error('Error predicting performance:', error)
      return 0.5 // Return neutral probability on error
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate recent success rate from performance history
   */
  private calculateRecentSuccessRate(recentPerformance: PerformancePoint[]): number {
    if (recentPerformance.length === 0) return 0.5 // Neutral starting point
    
    const successes = recentPerformance.filter(p => p.success).length
    return successes / recentPerformance.length
  }

  /**
   * Calculate stability modifier for difficulty adjustments
   */
  private calculateStabilityModifier(stability: number): number {
    // Higher stability = smaller adjustments (more conservative)
    return Math.max(0.1, Math.min(1.0, 1.0 - (stability / 200)))
  }

  /**
   * Calculate learning style adjustment factor
   */
  private calculateLearningStyleAdjustment(
    learningStyleFactor: number,
    performanceDelta: number
  ): number {
    // Learning style factor influences how quickly we adjust difficulty
    const styleInfluence = this.config.learningStyleInfluence
    // Direct relationship: good performance (positive delta) -> increase difficulty (positive adjustment)
    const baseAdjustment = performanceDelta * 2.0
    
    return baseAdjustment * learningStyleFactor * styleInfluence
  }

  /**
   * Calculate topic affinity adjustment
   */
  private calculateTopicAffinityAdjustment(
    topicAffinity: number,
    performanceDelta: number
  ): number {
    // Topic affinity affects how much we adjust based on performance
    const affinityInfluence = this.config.topicAffinityInfluence
    // Direct relationship: good performance (positive delta) -> increase difficulty (positive adjustment)
    const baseAdjustment = performanceDelta * 1.5
    
    return baseAdjustment * topicAffinity * affinityInfluence
  }

  /**
   * Calculate base difficulty adjustment using FSRS principles
   */
  private calculateBaseDifficultyAdjustment(
    performanceDelta: number,
    stabilityModifier: number,
    dataPoints: number
  ): number {
    // Base adjustment strength (stronger with more data)
    const dataConfidence = Math.min(1.0, dataPoints / 10)
    const adjustmentStrength = 2.5 * dataConfidence
    
    // Calculate raw adjustment (direct relationship with performance)
    // If performance is above target (positive delta), increase difficulty (positive adjustment)
    // If performance is below target (negative delta), decrease difficulty (negative adjustment)
    const rawAdjustment = performanceDelta * adjustmentStrength
    
    // Apply stability modifier
    return rawAdjustment * stabilityModifier
  }

  /**
   * Apply confidence interval constraints to prevent extreme adjustments
   */
  private applyConfidenceConstraints(
    rawAdjustment: number,
    confidence: number,
    dataPoints: number
  ): number {
    // Calculate maximum allowed adjustment based on confidence
    const confidenceMultiplier = Math.max(0.3, confidence / 100)
    const dataReliability = Math.min(1.0, dataPoints / 5)
    const maxAdjustment = this.config.maxAdjustmentMagnitude * confidenceMultiplier * dataReliability
    
    // Constrain adjustment
    return Math.max(-maxAdjustment, Math.min(maxAdjustment, rawAdjustment))
  }

  /**
   * Constrain difficulty to valid range
   */
  private constrainDifficulty(difficulty: number): number {
    return Math.max(1.0, Math.min(10.0, difficulty))
  }

  /**
   * Constrain stability to valid range
   */
  private constrainStability(stability: number): number {
    return Math.max(0.0, Math.min(100.0, stability))
  }

  /**
   * Calculate stability update based on recent performance
   */
  private calculateStabilityUpdate(
    currentStability: number,
    recentPerformance: PerformancePoint[],
    adjustmentMagnitude: number
  ): number {
    if (recentPerformance.length === 0) {
      return currentStability
    }

    // Stability improves with consistent performance
    const variance = this.calculatePerformanceVariance(recentPerformance)
    
    // Consistency bonus: only applies when variance is very low
    const consistencyBonus = variance < 0.1 ? 
      Math.max(0, (1 - variance * 4)) * this.config.stabilityGrowthRate * 5 : 0
    
    // Large adjustments indicate instability
    const adjustmentPenalty = Math.min(adjustmentMagnitude, 1.0) * this.config.stabilityDecayRate * 5
    
    // Strong penalty for high variance (this is the key for instability detection)
    const variancePenalty = variance > 0.15 ? 
      variance * this.config.stabilityDecayRate * 15 : 
      variance * this.config.stabilityDecayRate * 5
    
    // Net stability change
    const stabilityChange = consistencyBonus - adjustmentPenalty - variancePenalty
    
    return this.constrainStability(currentStability + stabilityChange)
  }

  /**
   * Calculate algorithm confidence based on data quality
   */
  private calculateAlgorithmConfidence(
    recentPerformance: PerformancePoint[],
    stability: number,
    adjustmentMagnitude: number
  ): number {
    if (recentPerformance.length === 0) return 30 // Low confidence with no data
    
    // Data quantity factor
    const dataQuantityFactor = Math.min(1.0, recentPerformance.length / 10) * 40
    
    // Stability factor
    const stabilityFactor = (stability / 100) * 30
    
    // Adjustment magnitude factor (smaller adjustments = higher confidence)
    const adjustmentFactor = Math.max(0, 30 - (adjustmentMagnitude * 15))
    
    // Combine factors
    const totalConfidence = dataQuantityFactor + stabilityFactor + adjustmentFactor
    
    return Math.max(20, Math.min(100, totalConfidence))
  }

  /**
   * Calculate performance variance from recent attempts
   */
  private calculatePerformanceVariance(performance: PerformancePoint[]): number {
    if (performance.length < 2) return 1.0 // High variance with insufficient data
    
    const successes = performance.map(p => p.success ? 1 : 0)
    const mean = successes.reduce((sum, s) => sum + s, 0) / successes.length
    const variance = successes.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / successes.length
    
    return variance
  }

  /**
   * Calculate consistency bonus based on streak patterns
   */
  private calculateConsistencyBonus(performance: PerformancePoint[]): number {
    if (performance.length < 3) return 0
    
    let longestStreak = 0
    let currentStreak = 0
    let lastResult: boolean | null = null
    
    for (const point of performance) {
      if (point.success === lastResult) {
        currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
        lastResult = point.success
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak)
    
    // Bonus for maintaining streaks (but not too long)
    return Math.min(1.0, longestStreak / 5)
  }

  /**
   * Calculate time decay factor based on session timing
   */
  private calculateTimeDecayFactor(performance: PerformancePoint[]): number {
    if (performance.length === 0) return 1.0
    
    const now = new Date()
    const recentCutoff = new Date(now.getTime() - (this.config.recentPerformanceWindow * 24 * 60 * 60 * 1000))
    
    const recentSessions = performance.filter(p => p.timestamp >= recentCutoff).length
    const totalSessions = performance.length
    
    // Higher ratio of recent sessions = better time decay factor
    return Math.max(0.5, recentSessions / totalSessions)
  }

  /**
   * Generate human-readable reasoning for difficulty adjustment
   */
  private generateAdjustmentReasoning(
    currentDifficulty: number,
    newDifficulty: number,
    recentSuccessRate: number,
    targetSuccessRate: number,
    confidence: number
  ): string {
    const adjustment = newDifficulty - currentDifficulty
    const performanceGap = recentSuccessRate - targetSuccessRate
    
    let reasoning = ''
    
    if (Math.abs(adjustment) < 0.1) {
      reasoning = 'Difficulty stable - performance on target'
    } else if (adjustment > 0) {
      if (performanceGap > 0.1) {
        reasoning = `Increasing difficulty (+${adjustment.toFixed(1)}) - performance above target (${(recentSuccessRate * 100).toFixed(0)}% vs ${(targetSuccessRate * 100).toFixed(0)}%)`
      } else {
        reasoning = `Minor difficulty increase (+${adjustment.toFixed(1)}) - maintaining optimal challenge`
      }
    } else {
      if (performanceGap < -0.1) {
        reasoning = `Decreasing difficulty (${adjustment.toFixed(1)}) - performance below target (${(recentSuccessRate * 100).toFixed(0)}% vs ${(targetSuccessRate * 100).toFixed(0)}%)`
      } else {
        reasoning = `Minor difficulty decrease (${adjustment.toFixed(1)}) - optimizing for success rate`
      }
    }
    
    reasoning += ` (${confidence.toFixed(0)}% confidence)`
    
    return reasoning
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  /**
   * Get algorithm configuration
   */
  getConfiguration(): FSRSConfiguration {
    return { ...this.config }
  }

  /**
   * Update algorithm configuration
   */
  updateConfiguration(newConfig: Partial<FSRSConfiguration>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Validate FSRS state for consistency
   */
  validateFSRSState(state: FSRSState): boolean {
    return (
      state.difficulty >= 1.0 && state.difficulty <= 10.0 &&
      state.stability >= 0.0 && state.stability <= 100.0 &&
      state.confidence >= 0.0 && state.confidence <= 100.0 &&
      state.successRate >= 0.0 && state.successRate <= 1.0 &&
      state.retrievability >= 0.0 && state.retrievability <= 1.0
    )
  }

  /**
   * Create initial FSRS state for new user
   */
  createInitialState(
    learningStylePrefs?: LearningStyleDifficultyPreferences,
    topicType?: TopicType
  ): FSRSState {
    let initialDifficulty = this.config.defaultDifficulty
    let targetSuccessRate = this.config.targetSuccessRate
    
    // Adjust based on learning style preferences
    if (learningStylePrefs) {
      initialDifficulty = learningStylePrefs.preferredStartingDifficulty || initialDifficulty
      targetSuccessRate = learningStylePrefs.targetSuccessRate || targetSuccessRate
      
      // Apply topic-specific adjustments
      if (topicType && learningStylePrefs.topicAffinities[topicType]) {
        const topicAffinity = learningStylePrefs.topicAffinities[topicType]
        initialDifficulty = Math.max(1.0, Math.min(10.0, 
          initialDifficulty + topicAffinity.naturalDifficulty
        ))
      }
    }
    
    return {
      difficulty: initialDifficulty,
      stability: this.config.baseStabilityScore,
      confidence: 30, // Start with low confidence
      successRate: targetSuccessRate,
      lastReview: null,
      retrievability: 0.5 // Neutral starting point
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const fsrsEngine = new FSRSAlgorithmEngine()