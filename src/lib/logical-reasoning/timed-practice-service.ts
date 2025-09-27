/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Timed Practice Service
 *
 * Manages timed practice sessions with intelligent time recommendations
 * and adaptive pacing based on user performance and question difficulty.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type {
  LogicalReasoningQuestion,
  LogicalReasoningQuestionType,
  LRPracticeSession,
  LRPracticeConfig,
  TimeRecommendation
} from '@/types/logical-reasoning'

/**
 * Timer State for Practice Sessions
 */
export interface TimerState {
  sessionStartTime: number
  currentQuestionStartTime: number
  totalElapsed: number
  questionElapsed: number
  isRunning: boolean
  isPaused: boolean
  warningThreshold: number // seconds before warning
  timeLimit?: number // optional hard limit
}

/**
 * Time Tracking Data
 */
interface TimeTrackingData {
  questionId: string
  startTime: number
  endTime: number
  timeSpent: number
  recommendedTime: number
  efficiency: number // actual/recommended ratio
  wasPaused: boolean
  pauseCount: number
}

/**
 * Practice Session Manager
 */
export class TimedPracticeService {
  private timerState: TimerState | null = null
  private timeTrackingData: TimeTrackingData[] = []
  private userPerformanceHistory: Map<LogicalReasoningQuestionType, number[]> = new Map()

  /**
   * Start a timed practice session
   */
  startSession(
    questions: LogicalReasoningQuestion[],
    config: LRPracticeConfig
  ): TimerState {
    const now = Date.now()

    this.timerState = {
      sessionStartTime: now,
      currentQuestionStartTime: now,
      totalElapsed: 0,
      questionElapsed: 0,
      isRunning: true,
      isPaused: false,
      warningThreshold: this.calculateWarningThreshold(config.timeMode),
      timeLimit: this.calculateTimeLimit(questions, config)
    }

    this.timeTrackingData = []
    return this.timerState
  }

  /**
   * Start timing for a specific question
   */
  startQuestion(question: LogicalReasoningQuestion): void {
    if (!this.timerState) return

    const now = Date.now()
    this.timerState.currentQuestionStartTime = now
    this.timerState.questionElapsed = 0
    this.timerState.isRunning = true
    this.timerState.isPaused = false
  }

  /**
   * Complete timing for current question
   */
  completeQuestion(
    question: LogicalReasoningQuestion,
    wasPaused: boolean = false,
    pauseCount: number = 0
  ): TimeTrackingData {
    if (!this.timerState) {
      throw new Error('No active timer session')
    }

    const now = Date.now()
    const timeSpent = (now - this.timerState.currentQuestionStartTime) / 1000
    const recommendedTime = this.getTimeRecommendation(question).finalRecommendation

    const trackingData: TimeTrackingData = {
      questionId: question.id,
      startTime: this.timerState.currentQuestionStartTime,
      endTime: now,
      timeSpent,
      recommendedTime,
      efficiency: timeSpent / recommendedTime,
      wasPaused,
      pauseCount
    }

    this.timeTrackingData.push(trackingData)
    this.updateUserPerformanceHistory(question.questionType, timeSpent)

    return trackingData
  }

  /**
   * Pause the timer
   */
  pauseTimer(): void {
    if (this.timerState && this.timerState.isRunning) {
      this.timerState.isPaused = true
      this.timerState.isRunning = false
    }
  }

  /**
   * Resume the timer
   */
  resumeTimer(): void {
    if (this.timerState && this.timerState.isPaused) {
      this.timerState.isPaused = false
      this.timerState.isRunning = true
    }
  }

  /**
   * Get current timer state
   */
  getCurrentTimerState(): TimerState | null {
    if (!this.timerState) return null

    const now = Date.now()

    if (this.timerState.isRunning) {
      this.timerState.totalElapsed = (now - this.timerState.sessionStartTime) / 1000
      this.timerState.questionElapsed = (now - this.timerState.currentQuestionStartTime) / 1000
    }

    return { ...this.timerState }
  }

  /**
   * Get time recommendation for a question
   */
  getTimeRecommendation(question: LogicalReasoningQuestion): TimeRecommendation {
    // Base time from question type classifier
    const baseTime = this.getBaseTimeForType(question.questionType)

    // Adjust for difficulty
    const difficultyMultiplier = this.getDifficultyMultiplier(question)

    // Adjust for user history
    const userAdjustment = this.getUserAdjustment(question.questionType)

    const adjustedTime = baseTime * difficultyMultiplier
    const finalRecommendation = Math.max(30, Math.round(adjustedTime + userAdjustment))

    return {
      questionType: question.questionType,
      difficulty: this.calculateQuestionDifficulty(question),
      baseTime,
      userAdjustment,
      finalRecommendation,
      reasoning: this.generateTimeReasoning(baseTime, difficultyMultiplier, userAdjustment)
    }
  }

  /**
   * Calculate warning thresholds for different time modes
   */
  private calculateWarningThreshold(timeMode: LRPracticeConfig['timeMode']): number {
    switch (timeMode) {
      case 'strict':
        return 10 // 10 seconds before time limit
      case 'recommended':
        return 15 // 15 seconds before recommended time
      case 'untimed':
        return 30 // 30 seconds as gentle reminder
      default:
        return 15
    }
  }

  /**
   * Calculate total time limit for session
   */
  private calculateTimeLimit(
    questions: LogicalReasoningQuestion[],
    config: LRPracticeConfig
  ): number | undefined {
    if (config.timeMode === 'untimed') {
      return undefined
    }

    const totalRecommendedTime = questions.reduce((total, question) => {
      return total + this.getTimeRecommendation(question).finalRecommendation
    }, 0)

    // Add 20% buffer for strict mode, 50% for recommended
    const bufferMultiplier = config.timeMode === 'strict' ? 1.2 : 1.5
    return Math.round(totalRecommendedTime * bufferMultiplier)
  }

  /**
   * Get base time for question type
   */
  private getBaseTimeForType(type: LogicalReasoningQuestionType): number {
    const baseTimes: Record<LogicalReasoningQuestionType, number> = {
      strengthen: 75,
      weaken: 75,
      assumption: 80,
      necessary_assumption: 85,
      sufficient_assumption: 90,
      flaw: 70,
      must_be_true: 75,
      main_point: 60,
      method_of_reasoning: 85,
      parallel_reasoning: 100, // Typically takes longest
      principle: 80,
      resolve_paradox: 75,
      role_in_argument: 70,
      point_at_issue: 75,
      evaluate_argument: 80
    }

    return baseTimes[type]
  }

  /**
   * Get difficulty multiplier based on question difficulty factors
   */
  private getDifficultyMultiplier(question: LogicalReasoningQuestion): number {
    if (!question.difficultyFactors) return 1.0

    const {
      abstractness,
      argumentComplexity,
      vocabularyLevel,
      trapDensity
    } = question.difficultyFactors

    // Each factor contributes to time requirement
    const abstractnessWeight = (abstractness - 3) * 0.1 // -0.2 to +0.2
    const complexityWeight = (argumentComplexity - 3) * 0.15 // -0.3 to +0.3
    const vocabularyWeight = (vocabularyLevel - 3) * 0.1 // -0.2 to +0.2
    const trapWeight = (trapDensity - 3) * 0.05 // -0.1 to +0.1

    const totalAdjustment = abstractnessWeight + complexityWeight + vocabularyWeight + trapWeight

    // Clamp between 0.7 and 1.5
    return Math.max(0.7, Math.min(1.5, 1.0 + totalAdjustment))
  }

  /**
   * Get user-specific time adjustment based on historical performance
   */
  private getUserAdjustment(questionType: LogicalReasoningQuestionType): number {
    const history = this.userPerformanceHistory.get(questionType)

    if (!history || history.length < 3) {
      return 0 // No adjustment for insufficient data
    }

    // Calculate average time for this question type
    const averageTime = history.reduce((sum, time) => sum + time, 0) / history.length
    const baseTime = this.getBaseTimeForType(questionType)

    // If user consistently takes longer/shorter, adjust recommendation
    const ratio = averageTime / baseTime

    if (ratio > 1.3) {
      return 15 // User needs more time
    } else if (ratio < 0.7) {
      return -10 // User is faster than average
    }

    return 0 // No adjustment needed
  }

  /**
   * Update user performance history
   */
  private updateUserPerformanceHistory(
    questionType: LogicalReasoningQuestionType,
    timeSpent: number
  ): void {
    const history = this.userPerformanceHistory.get(questionType) || []
    history.push(timeSpent)

    // Keep only last 10 attempts to avoid stale data
    if (history.length > 10) {
      history.shift()
    }

    this.userPerformanceHistory.set(questionType, history)
  }

  /**
   * Calculate overall question difficulty score
   */
  private calculateQuestionDifficulty(question: LogicalReasoningQuestion): number {
    if (!question.difficultyFactors) return 5 // Default middle difficulty

    const {
      abstractness,
      argumentComplexity,
      vocabularyLevel,
      trapDensity
    } = question.difficultyFactors

    // Weighted average of difficulty factors
    return Math.round(
      (abstractness * 0.3 +
       argumentComplexity * 0.4 +
       vocabularyLevel * 0.2 +
       trapDensity * 0.1)
    )
  }

  /**
   * Generate human-readable reasoning for time recommendation
   */
  private generateTimeReasoning(
    baseTime: number,
    difficultyMultiplier: number,
    userAdjustment: number
  ): string {
    let reasoning = `Base time: ${baseTime}s`

    if (difficultyMultiplier !== 1.0) {
      const percentage = Math.round((difficultyMultiplier - 1) * 100)
      if (percentage > 0) {
        reasoning += `, +${percentage}% for difficulty`
      } else {
        reasoning += `, ${percentage}% for difficulty`
      }
    }

    if (userAdjustment !== 0) {
      if (userAdjustment > 0) {
        reasoning += `, +${userAdjustment}s based on your history`
      } else {
        reasoning += `, ${userAdjustment}s based on your history`
      }
    }

    return reasoning
  }

  /**
   * Get session performance summary
   */
  getSessionSummary(): {
    totalQuestions: number
    totalTime: number
    averageTimePerQuestion: number
    efficiencyScore: number // how close to recommended times
    timeDistribution: Record<LogicalReasoningQuestionType, number>
    paceAnalysis: 'too_fast' | 'good_pace' | 'too_slow'
  } {
    const totalQuestions = this.timeTrackingData.length
    const totalTime = this.timeTrackingData.reduce((sum, data) => sum + data.timeSpent, 0)
    const averageTimePerQuestion = totalTime / totalQuestions || 0

    // Calculate efficiency score (1.0 = perfect pace)
    const efficiencies = this.timeTrackingData.map(data => data.efficiency)
    const efficiencyScore = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length || 0

    // Time distribution by question type
    const timeDistribution: Record<LogicalReasoningQuestionType, number> = {} as Record<LogicalReasoningQuestionType, number>

    this.timeTrackingData.forEach(data => {
      // Would need to map questionId back to question type
      // For now, simplified implementation
    })

    // Determine overall pace
    let paceAnalysis: 'too_fast' | 'good_pace' | 'too_slow'
    if (efficiencyScore < 0.8) {
      paceAnalysis = 'too_fast'
    } else if (efficiencyScore > 1.3) {
      paceAnalysis = 'too_slow'
    } else {
      paceAnalysis = 'good_pace'
    }

    return {
      totalQuestions,
      totalTime,
      averageTimePerQuestion,
      efficiencyScore,
      timeDistribution,
      paceAnalysis
    }
  }

  /**
   * Get pacing recommendations based on current performance
   */
  getPacingRecommendations(): string[] {
    const summary = this.getSessionSummary()
    const recommendations: string[] = []

    if (summary.paceAnalysis === 'too_fast') {
      recommendations.push('You\'re working faster than recommended. Take more time to carefully consider each answer choice.')
      recommendations.push('Focus on eliminating wrong answers systematically rather than picking the first choice that seems right.')
    } else if (summary.paceAnalysis === 'too_slow') {
      recommendations.push('You\'re taking longer than recommended. Try to move more quickly through easier questions.')
      recommendations.push('Set a timer for each question and practice working under time pressure.')
    } else {
      recommendations.push('Your pacing is good! Keep maintaining this steady rhythm.')
    }

    // Analysis based on efficiency patterns
    const recentEfficiencies = this.timeTrackingData
      .slice(-5)
      .map(data => data.efficiency)

    if (recentEfficiencies.length >= 3) {
      const trend = recentEfficiencies[recentEfficiencies.length - 1] - recentEfficiencies[0]

      if (trend > 0.3) {
        recommendations.push('You\'re getting slower as you progress. Stay focused and maintain your initial pace.')
      } else if (trend < -0.3) {
        recommendations.push('You\'re speeding up. Make sure you\'re not sacrificing accuracy for speed.')
      }
    }

    return recommendations
  }

  /**
   * Reset the service for a new session
   */
  reset(): void {
    this.timerState = null
    this.timeTrackingData = []
  }
}