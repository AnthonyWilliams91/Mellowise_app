/**
 * Anxiety Management Orchestrator
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Central orchestrator that coordinates all anxiety management components:
 * detection, confidence building, mindfulness, and interventions.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { anxietyDetectionService } from './anxiety-detection-service'
import { confidenceBuildingService } from './confidence-building-service'
import { mindfulnessService } from './mindfulness-service'
import { interventionService } from './intervention-service'
import { patternRecognition } from '@/lib/insights/patternRecognition'
import { dynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service'
import { profileService } from '@/lib/learning-style/profile-service'
import type {
  AnxietyLevel,
  AnxietyDetectionResult,
  ConfidenceMetrics,
  AnxietyIntervention,
  QuestionSequencingStrategy,
  BreathingExercise,
  PersonalizedCopingStrategy,
  AnxietyManagementDashboard
} from '@/types/anxiety-management'
import type { SessionPerformance } from '@/types/analytics'
import type { LearningProfile } from '@/types/learning-style'

// ============================================================================
// ORCHESTRATOR INTERFACES
// ============================================================================

export interface AnxietyManagementContext {
  userId: string
  currentSession?: any
  recentPerformance: SessionPerformance[]
  learningProfile?: LearningProfile
  currentDifficulty?: number
  timeRemaining?: number
  currentStreak?: number
}

export interface AnxietyManagementResponse {
  anxietyDetection?: AnxietyDetectionResult
  confidenceMetrics?: ConfidenceMetrics
  intervention?: AnxietyIntervention
  recommendations: AnxietyRecommendation[]
  questionSequence?: QuestionSequencingStrategy
  mindfulnessOptions?: BreathingExercise[]
  shouldPauseSession: boolean
  shouldReduceDifficulty: boolean
  shouldShowEncouragement: boolean
}

export interface AnxietyRecommendation {
  type: 'immediate' | 'proactive' | 'educational' | 'celebration'
  priority: 'high' | 'medium' | 'low'
  action: string
  description: string
  estimatedEffectiveness: number
  timeRequired?: number
}

export interface InterventionTrigger {
  trigger: 'session_start' | 'poor_performance' | 'streak_break' | 'time_pressure' | 'user_request' | 'scheduled_check'
  severity: 'low' | 'medium' | 'high'
  data: any
}

// ============================================================================
// ANXIETY MANAGEMENT ORCHESTRATOR CLASS
// ============================================================================

export class AnxietyManagementOrchestrator {
  private readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly INTERVENTION_COOLDOWN = 10 * 60 * 1000 // 10 minutes
  private readonly HIGH_ANXIETY_THRESHOLD = 75 // Confidence score threshold

  /**
   * Main orchestration method - analyzes current state and provides comprehensive response
   */
  async orchestrateAnxietyManagement(
    context: AnxietyManagementContext,
    trigger: InterventionTrigger
  ): Promise<AnxietyManagementResponse> {
    try {
      const { userId, recentPerformance } = context

      // Step 1: Detect current anxiety level
      const anxietyDetection = await anxietyDetectionService.detectAnxietyLevel(
        userId,
        recentPerformance
      )

      // Step 2: Assess confidence metrics
      const confidenceMetrics = await confidenceBuildingService.assessConfidenceLevel(userId)

      // Step 3: Determine if intervention is needed
      const needsIntervention = this.shouldTriggerIntervention(
        anxietyDetection,
        confidenceMetrics,
        trigger
      )

      let intervention: AnxietyIntervention | undefined
      if (needsIntervention) {
        const primaryTrigger = this.determinePrimaryTrigger(anxietyDetection, trigger)
        intervention = await interventionService.triggerIntervention(
          userId,
          primaryTrigger,
          {
            anxiety_level: anxietyDetection.anxiety_level,
            confidence_score: confidenceMetrics.confidence_score,
            trigger_data: trigger.data,
            session_context: context.currentSession
          }
        )
      }

      // Step 4: Generate adaptive question sequence if needed
      let questionSequence: QuestionSequencingStrategy | undefined
      if (this.shouldAdaptQuestionSequence(anxietyDetection, confidenceMetrics)) {
        questionSequence = await confidenceBuildingService.generateQuestionSequence(
          userId,
          anxietyDetection.anxiety_level
        )
      }

      // Step 5: Get mindfulness options
      const mindfulnessOptions = await this.getMindfulnessOptions(
        anxietyDetection.anxiety_level,
        trigger
      )

      // Step 6: Generate recommendations
      const recommendations = await this.generateRecommendations(
        context,
        anxietyDetection,
        confidenceMetrics,
        intervention
      )

      // Step 7: Determine session adjustments
      const sessionAdjustments = this.determineSessionAdjustments(
        anxietyDetection,
        confidenceMetrics,
        trigger
      )

      return {
        anxietyDetection,
        confidenceMetrics,
        intervention,
        recommendations,
        questionSequence,
        mindfulnessOptions,
        shouldPauseSession: sessionAdjustments.pauseSession,
        shouldReduceDifficulty: sessionAdjustments.reduceDifficulty,
        shouldShowEncouragement: sessionAdjustments.showEncouragement
      }

    } catch (error) {
      console.error('Error in anxiety management orchestration:', error)

      // Return safe fallback response
      return {
        recommendations: [{
          type: 'immediate',
          priority: 'medium',
          action: 'take_break',
          description: 'Consider taking a short break to reset',
          estimatedEffectiveness: 70,
          timeRequired: 120
        }],
        shouldPauseSession: false,
        shouldReduceDifficulty: false,
        shouldShowEncouragement: true
      }
    }
  }

  /**
   * Monitor ongoing session for anxiety triggers
   */
  async monitorSession(
    userId: string,
    sessionData: any,
    performanceUpdate: SessionPerformance
  ): Promise<AnxietyManagementResponse | null> {
    try {
      // Check for immediate triggers
      const triggers = this.detectSessionTriggers(sessionData, performanceUpdate)

      if (triggers.length === 0) {
        return null // No intervention needed
      }

      // Get recent performance for context
      const recentPerformance = await this.getRecentPerformance(userId)
      recentPerformance.unshift(performanceUpdate) // Add current performance

      const context: AnxietyManagementContext = {
        userId,
        currentSession: sessionData,
        recentPerformance,
        currentDifficulty: sessionData.difficulty,
        timeRemaining: sessionData.timeRemaining,
        currentStreak: sessionData.currentStreak
      }

      // Process the most severe trigger
      const primaryTrigger = triggers.reduce((max, current) =>
        current.severity === 'high' ? current :
        max.severity === 'high' ? max :
        current.severity === 'medium' ? current : max
      )

      return await this.orchestrateAnxietyManagement(context, primaryTrigger)

    } catch (error) {
      console.error('Error monitoring session:', error)
      return null
    }
  }

  /**
   * Get personalized anxiety management dashboard
   */
  async getPersonalizedDashboard(userId: string): Promise<AnxietyManagementDashboard> {
    return await interventionService.getAnxietyManagementDashboard(userId)
  }

  /**
   * Update user progress after session completion
   */
  async updateProgress(
    userId: string,
    sessionData: any,
    anxietyBeforeSession?: AnxietyLevel,
    anxietyAfterSession?: AnxietyLevel
  ): Promise<void> {
    try {
      // Update confidence metrics
      await confidenceBuildingService.updateConfidenceScore(userId, sessionData)

      // Track mindfulness effectiveness if applicable
      if (sessionData.mindfulnessUsed) {
        await mindfulnessService.trackMindfulnessSession({
          user_id: userId,
          exercise_id: sessionData.mindfulnessExercise,
          started_at: sessionData.mindfulnessStartTime,
          completed_at: sessionData.mindfulnessEndTime,
          duration_completed_seconds: sessionData.mindfulnessDuration,
          effectiveness_rating: sessionData.mindfulnessRating,
          anxiety_level_before: anxietyBeforeSession,
          anxiety_level_after: anxietyAfterSession,
          session_context: 'during_practice'
        })
      }

      // Update coping strategies effectiveness
      await interventionService.updateCopingStrategies(userId)

    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Determine if intervention should be triggered
   */
  private shouldTriggerIntervention(
    anxietyDetection: AnxietyDetectionResult,
    confidenceMetrics: ConfidenceMetrics,
    trigger: InterventionTrigger
  ): boolean {
    // High severity triggers always need intervention
    if (trigger.severity === 'high') {
      return true
    }

    // High anxiety levels need intervention
    if (anxietyDetection.anxiety_level === 'high' || anxietyDetection.anxiety_level === 'severe') {
      return true
    }

    // Very low confidence needs intervention
    if (confidenceMetrics.current_level === 'very_low') {
      return true
    }

    // Declining confidence trend with moderate anxiety
    if (confidenceMetrics.success_rate_trend < -0.2 && anxietyDetection.anxiety_level === 'moderate') {
      return true
    }

    return false
  }

  /**
   * Determine primary trigger for intervention
   */
  private determinePrimaryTrigger(
    anxietyDetection: AnxietyDetectionResult,
    trigger: InterventionTrigger
  ): any {
    // Use detected anxiety triggers if available
    if (anxietyDetection.triggers_identified.length > 0) {
      return anxietyDetection.triggers_identified[0]
    }

    // Map session triggers to anxiety triggers
    switch (trigger.trigger) {
      case 'poor_performance':
        return 'performance_drop'
      case 'streak_break':
        return 'streak_break'
      case 'time_pressure':
        return 'time_pressure'
      default:
        return 'unknown'
    }
  }

  /**
   * Determine if question sequence should be adapted
   */
  private shouldAdaptQuestionSequence(
    anxietyDetection: AnxietyDetectionResult,
    confidenceMetrics: ConfidenceMetrics
  ): boolean {
    // Adapt if anxiety is moderate or higher
    if (anxietyDetection.anxiety_level !== 'low') {
      return true
    }

    // Adapt if confidence is low
    if (confidenceMetrics.current_level === 'very_low' || confidenceMetrics.current_level === 'low') {
      return true
    }

    return false
  }

  /**
   * Get appropriate mindfulness options
   */
  private async getMindfulnessOptions(
    anxietyLevel: AnxietyLevel,
    trigger: InterventionTrigger
  ): Promise<BreathingExercise[]> {
    // Determine available time based on trigger
    let timeAvailable = 300 // 5 minutes default

    if (trigger.trigger === 'time_pressure') {
      timeAvailable = 60 // Quick exercises only
    } else if (trigger.severity === 'high') {
      timeAvailable = 600 // Longer exercises for severe situations
    }

    return await mindfulnessService.getRecommendedExercises(anxietyLevel, timeAvailable)
  }

  /**
   * Generate comprehensive recommendations
   */
  private async generateRecommendations(
    context: AnxietyManagementContext,
    anxietyDetection: AnxietyDetectionResult,
    confidenceMetrics: ConfidenceMetrics,
    intervention?: AnxietyIntervention
  ): Promise<AnxietyRecommendation[]> {
    const recommendations: AnxietyRecommendation[] = []

    // Immediate anxiety management
    if (anxietyDetection.anxiety_level === 'severe') {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'pause_session',
        description: 'Take a break and try breathing exercises before continuing',
        estimatedEffectiveness: 85,
        timeRequired: 300
      })
    } else if (anxietyDetection.anxiety_level === 'high') {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'breathing_exercise',
        description: 'Try a 2-minute breathing exercise to center yourself',
        estimatedEffectiveness: 80,
        timeRequired: 120
      })
    }

    // Confidence building
    if (confidenceMetrics.current_level === 'very_low') {
      recommendations.push({
        type: 'proactive',
        priority: 'high',
        action: 'easier_questions',
        description: 'Start with easier questions to build momentum',
        estimatedEffectiveness: 75
      })
    }

    // Performance-based recommendations
    if (anxietyDetection.triggers_identified.includes('performance_drop')) {
      recommendations.push({
        type: 'educational',
        priority: 'medium',
        action: 'review_achievements',
        description: 'Review your recent successes to boost confidence',
        estimatedEffectiveness: 70
      })
    }

    // Time pressure recommendations
    if (anxietyDetection.triggers_identified.includes('time_pressure')) {
      recommendations.push({
        type: 'immediate',
        priority: 'medium',
        action: 'slow_down',
        description: 'Focus on accuracy over speed',
        estimatedEffectiveness: 65
      })
    }

    // Celebration recommendations
    if (confidenceMetrics.achievement_momentum > 10) {
      recommendations.push({
        type: 'celebration',
        priority: 'low',
        action: 'celebrate_progress',
        description: 'Acknowledge your recent achievements!',
        estimatedEffectiveness: 60
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Determine session adjustments
   */
  private determineSessionAdjustments(
    anxietyDetection: AnxietyDetectionResult,
    confidenceMetrics: ConfidenceMetrics,
    trigger: InterventionTrigger
  ): { pauseSession: boolean; reduceDifficulty: boolean; showEncouragement: boolean } {
    const shouldPause = anxietyDetection.anxiety_level === 'severe' ||
      (anxietyDetection.anxiety_level === 'high' && trigger.severity === 'high')

    const shouldReduceDifficulty = anxietyDetection.anxiety_level !== 'low' ||
      confidenceMetrics.current_level === 'very_low' ||
      confidenceMetrics.success_rate_trend < -0.3

    const shouldShowEncouragement = confidenceMetrics.current_level !== 'very_high' ||
      anxietyDetection.anxiety_level !== 'low'

    return {
      pauseSession: shouldPause,
      reduceDifficulty: shouldReduceDifficulty,
      showEncouragement: shouldShowEncouragement
    }
  }

  /**
   * Detect session-level triggers
   */
  private detectSessionTriggers(sessionData: any, performance: SessionPerformance): InterventionTrigger[] {
    const triggers: InterventionTrigger[] = []

    // Performance drop trigger
    if (performance.accuracy_percentage < 50) {
      triggers.push({
        trigger: 'poor_performance',
        severity: 'high',
        data: { accuracy: performance.accuracy_percentage }
      })
    } else if (performance.accuracy_percentage < 70) {
      triggers.push({
        trigger: 'poor_performance',
        severity: 'medium',
        data: { accuracy: performance.accuracy_percentage }
      })
    }

    // Streak break trigger
    if (sessionData.previousStreak > 5 && performance.streak_count === 0) {
      triggers.push({
        trigger: 'streak_break',
        severity: 'medium',
        data: { previous_streak: sessionData.previousStreak }
      })
    }

    // Time pressure trigger
    if (sessionData.timeRemaining < 60 && sessionData.questionsRemaining > 1) {
      triggers.push({
        trigger: 'time_pressure',
        severity: 'high',
        data: { time_remaining: sessionData.timeRemaining, questions_remaining: sessionData.questionsRemaining }
      })
    }

    return triggers
  }

  /**
   * Get recent performance data
   */
  private async getRecentPerformance(userId: string): Promise<SessionPerformance[]> {
    // This would typically fetch from database
    // For now, return empty array as placeholder
    return []
  }
}

// Export singleton instance
export const anxietyManagementOrchestrator = new AnxietyManagementOrchestrator()