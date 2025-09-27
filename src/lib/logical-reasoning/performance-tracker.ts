/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Performance Tracking Service
 *
 * Tracks detailed performance metrics for logical reasoning questions,
 * including accuracy by question type, time analysis, and progress trends.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type {
  LogicalReasoningQuestion,
  LogicalReasoningQuestionType,
  QuestionTypePerformance,
  WrongAnswerPattern,
  LRPracticeSession,
  WeaknessAnalysis
} from '@/types/logical-reasoning'

/**
 * Performance Entry for Individual Questions
 */
export interface QuestionPerformanceEntry {
  questionId: string
  questionType: LogicalReasoningQuestionType
  difficulty: number
  timeSpent: number
  recommendedTime: number
  isCorrect: boolean
  selectedAnswer: string
  correctAnswer: string
  patterns?: WrongAnswerPattern[]
  timestamp: string
  sessionId: string
}

/**
 * Trend Analysis Result
 */
export interface TrendAnalysis {
  questionType: LogicalReasoningQuestionType
  trend: 'improving' | 'stable' | 'declining'
  changePercentage: number
  confidence: number // 0-1
  dataPoints: number
  recommendation?: string
}

/**
 * Performance Dashboard Data
 */
export interface PerformanceDashboard {
  overallAccuracy: number
  totalQuestions: number
  averageTime: number
  strongestTypes: LogicalReasoningQuestionType[]
  weakestTypes: LogicalReasoningQuestionType[]
  recentTrends: TrendAnalysis[]
  commonPatterns: WrongAnswerPattern[]
  timeEfficiency: number // ratio of actual to recommended time
  improvementAreas: string[]
}

export class PerformanceTracker {
  private performanceHistory: QuestionPerformanceEntry[] = []
  private typePerformanceCache: Map<LogicalReasoningQuestionType, QuestionTypePerformance> = new Map()

  /**
   * Record performance for a single question
   */
  recordQuestionPerformance(
    question: LogicalReasoningQuestion,
    response: {
      selectedAnswer: string
      timeSpent: number
      recommendedTime: number
      isCorrect: boolean
      patterns?: WrongAnswerPattern[]
    },
    sessionId: string
  ): void {
    const entry: QuestionPerformanceEntry = {
      questionId: question.id,
      questionType: question.questionType,
      difficulty: this.calculateDifficulty(question),
      timeSpent: response.timeSpent,
      recommendedTime: response.recommendedTime,
      isCorrect: response.isCorrect,
      selectedAnswer: response.selectedAnswer,
      correctAnswer: question.answerChoices.find(c => c.isCorrect)?.text || '',
      patterns: response.patterns,
      timestamp: new Date().toISOString(),
      sessionId
    }

    this.performanceHistory.push(entry)
    this.invalidateCache(question.questionType)
  }

  /**
   * Get performance metrics for a specific question type
   */
  getQuestionTypePerformance(questionType: LogicalReasoningQuestionType): QuestionTypePerformance {
    if (this.typePerformanceCache.has(questionType)) {
      return this.typePerformanceCache.get(questionType)!
    }

    const typeEntries = this.performanceHistory.filter(entry => entry.questionType === questionType)

    if (typeEntries.length === 0) {
      return this.getEmptyPerformance(questionType)
    }

    const correctCount = typeEntries.filter(entry => entry.isCorrect).length
    const totalTime = typeEntries.reduce((sum, entry) => sum + entry.timeSpent, 0)
    const recentTrend = this.calculateTrend(typeEntries)
    const commonPatterns = this.extractCommonPatterns(typeEntries)

    const performance: QuestionTypePerformance = {
      questionType,
      attemptCount: typeEntries.length,
      correctCount,
      accuracy: correctCount / typeEntries.length,
      averageTime: totalTime / typeEntries.length,
      recentTrend: recentTrend.trend,
      commonPatterns,
      lastPracticed: typeEntries[typeEntries.length - 1].timestamp
    }

    this.typePerformanceCache.set(questionType, performance)
    return performance
  }

  /**
   * Generate comprehensive performance dashboard
   */
  generateDashboard(): PerformanceDashboard {
    if (this.performanceHistory.length === 0) {
      return this.getEmptyDashboard()
    }

    const totalQuestions = this.performanceHistory.length
    const correctCount = this.performanceHistory.filter(entry => entry.isCorrect).length
    const overallAccuracy = correctCount / totalQuestions

    const totalTime = this.performanceHistory.reduce((sum, entry) => sum + entry.timeSpent, 0)
    const totalRecommendedTime = this.performanceHistory.reduce((sum, entry) => sum + entry.recommendedTime, 0)
    const averageTime = totalTime / totalQuestions
    const timeEfficiency = totalRecommendedTime / totalTime

    // Get performance by question type
    const questionTypes = [...new Set(this.performanceHistory.map(entry => entry.questionType))]
    const typePerformances = questionTypes.map(type => this.getQuestionTypePerformance(type))

    // Sort by accuracy to find strongest/weakest
    typePerformances.sort((a, b) => b.accuracy - a.accuracy)
    const strongestTypes = typePerformances.slice(0, 3).map(tp => tp.questionType)
    const weakestTypes = typePerformances.slice(-3).reverse().map(tp => tp.questionType)

    // Get recent trends
    const recentTrends = questionTypes
      .map(type => this.analyzeTrend(type))
      .filter(trend => trend.dataPoints >= 3)
      .sort((a, b) => b.confidence - a.confidence)

    // Extract common wrong answer patterns
    const commonPatterns = this.extractOverallPatterns()

    // Generate improvement recommendations
    const improvementAreas = this.generateImprovementAreas(typePerformances, recentTrends)

    return {
      overallAccuracy,
      totalQuestions,
      averageTime,
      strongestTypes,
      weakestTypes,
      recentTrends,
      commonPatterns,
      timeEfficiency,
      improvementAreas
    }
  }

  /**
   * Analyze trends for a specific question type
   */
  analyzeTrend(questionType: LogicalReasoningQuestionType): TrendAnalysis {
    const entries = this.performanceHistory
      .filter(entry => entry.questionType === questionType)
      .slice(-20) // Last 20 attempts

    if (entries.length < 3) {
      return {
        questionType,
        trend: 'stable',
        changePercentage: 0,
        confidence: 0,
        dataPoints: entries.length
      }
    }

    // Calculate accuracy over time using sliding windows
    const windowSize = Math.max(3, Math.floor(entries.length / 3))
    const windows = []

    for (let i = 0; i <= entries.length - windowSize; i++) {
      const window = entries.slice(i, i + windowSize)
      const accuracy = window.filter(e => e.isCorrect).length / window.length
      windows.push(accuracy)
    }

    if (windows.length < 2) {
      return {
        questionType,
        trend: 'stable',
        changePercentage: 0,
        confidence: 0.5,
        dataPoints: entries.length
      }
    }

    // Compare first and last windows
    const firstAccuracy = windows[0]
    const lastAccuracy = windows[windows.length - 1]
    const changePercentage = ((lastAccuracy - firstAccuracy) / firstAccuracy) * 100

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining'
    if (Math.abs(changePercentage) < 10) {
      trend = 'stable'
    } else if (changePercentage > 0) {
      trend = 'improving'
    } else {
      trend = 'declining'
    }

    // Calculate confidence based on data points and consistency
    const variance = this.calculateVariance(windows)
    const confidence = Math.min(1, entries.length / 10) * (1 - Math.min(variance, 0.5))

    // Generate recommendation
    const recommendation = this.generateTrendRecommendation(trend, changePercentage, questionType)

    return {
      questionType,
      trend,
      changePercentage,
      confidence,
      dataPoints: entries.length,
      recommendation
    }
  }

  /**
   * Generate weakness analysis with improvement plan
   */
  generateWeaknessAnalysis(userId: string): WeaknessAnalysis {
    const dashboard = this.generateDashboard()

    // Identify weakest question types (accuracy < 70% or declining trend)
    const allTypes = [...new Set(this.performanceHistory.map(entry => entry.questionType))]
    const weakestTypes = allTypes
      .map(type => ({ type, performance: this.getQuestionTypePerformance(type) }))
      .filter(({ performance }) =>
        performance.accuracy < 0.7 || performance.recentTrend === 'declining'
      )
      .sort((a, b) => a.performance.accuracy - b.performance.accuracy)
      .slice(0, 5)
      .map(({ type }) => type)

    // Extract common mistake patterns
    const commonMistakePatterns = dashboard.commonPatterns.slice(0, 5)

    // Generate targeted recommendations
    const recommendations = weakestTypes.map(type => {
      const performance = this.getQuestionTypePerformance(type)
      const priority = performance.accuracy < 0.5 ? 'high' :
                     performance.accuracy < 0.65 ? 'medium' : 'low'

      return {
        type,
        priority: priority as 'high' | 'medium' | 'low',
        suggestedPracticeCount: this.calculatePracticeCount(performance),
        focusPoints: this.generateFocusPoints(type, performance)
      }
    })

    // Create weekly improvement goals
    const weeklyGoals = recommendations.slice(0, 3).map(rec => ({
      questionType: rec.type,
      targetCount: Math.ceil(rec.suggestedPracticeCount / 7),
      targetAccuracy: Math.min(0.85, this.getQuestionTypePerformance(rec.type).accuracy + 0.15)
    }))

    // Estimate time to improvement
    const estimatedTimeToImprovement = this.estimateImprovementTime(recommendations)

    return {
      userId,
      analyzedAt: new Date().toISOString(),
      weakestTypes,
      commonMistakePatterns,
      recommendations,
      improvementPlan: {
        weeklyGoals,
        estimatedTimeToImprovement
      }
    }
  }

  /**
   * Calculate difficulty score for a question
   */
  private calculateDifficulty(question: LogicalReasoningQuestion): number {
    if (!question.difficultyFactors) return 5

    const {
      abstractness,
      argumentComplexity,
      vocabularyLevel,
      trapDensity
    } = question.difficultyFactors

    return Math.round(
      (abstractness * 0.3 +
       argumentComplexity * 0.4 +
       vocabularyLevel * 0.2 +
       trapDensity * 0.1)
    )
  }

  /**
   * Calculate trend from performance entries
   */
  private calculateTrend(entries: QuestionPerformanceEntry[]): TrendAnalysis {
    if (entries.length < 3) {
      return {
        questionType: entries[0]?.questionType || 'must_be_true',
        trend: 'stable',
        changePercentage: 0,
        confidence: 0,
        dataPoints: entries.length
      }
    }

    const recent = entries.slice(-5)
    const older = entries.slice(-10, -5)

    if (older.length === 0) {
      return {
        questionType: entries[0].questionType,
        trend: 'stable',
        changePercentage: 0,
        confidence: 0.3,
        dataPoints: entries.length
      }
    }

    const recentAccuracy = recent.filter(e => e.isCorrect).length / recent.length
    const olderAccuracy = older.filter(e => e.isCorrect).length / older.length

    const changePercentage = ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100

    let trend: 'improving' | 'stable' | 'declining'
    if (Math.abs(changePercentage) < 15) {
      trend = 'stable'
    } else if (changePercentage > 0) {
      trend = 'improving'
    } else {
      trend = 'declining'
    }

    return {
      questionType: entries[0].questionType,
      trend,
      changePercentage,
      confidence: Math.min(entries.length / 10, 1),
      dataPoints: entries.length
    }
  }

  /**
   * Extract common wrong answer patterns
   */
  private extractCommonPatterns(entries: QuestionPerformanceEntry[]): WrongAnswerPattern[] {
    const patternCounts = new Map<WrongAnswerPattern, number>()

    entries
      .filter(entry => !entry.isCorrect && entry.patterns)
      .forEach(entry => {
        entry.patterns!.forEach(pattern => {
          patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1)
        })
      })

    return Array.from(patternCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern)
  }

  /**
   * Extract overall common patterns across all question types
   */
  private extractOverallPatterns(): WrongAnswerPattern[] {
    return this.extractCommonPatterns(this.performanceHistory)
  }

  /**
   * Generate improvement areas based on performance data
   */
  private generateImprovementAreas(
    typePerformances: QuestionTypePerformance[],
    trends: TrendAnalysis[]
  ): string[] {
    const areas: string[] = []

    // Time management
    const slowTypes = typePerformances.filter(tp => tp.averageTime > 120)
    if (slowTypes.length > 0) {
      areas.push(`Time management for ${slowTypes.map(tp => tp.questionType).join(', ')}`)
    }

    // Declining trends
    const decliningTypes = trends.filter(t => t.trend === 'declining')
    if (decliningTypes.length > 0) {
      areas.push(`Address declining performance in ${decliningTypes.map(t => t.questionType).join(', ')}`)
    }

    // Low accuracy types
    const weakTypes = typePerformances.filter(tp => tp.accuracy < 0.6)
    if (weakTypes.length > 0) {
      areas.push(`Strengthen fundamentals for ${weakTypes.map(tp => tp.questionType).join(', ')}`)
    }

    // Common patterns
    const commonPatterns = this.extractOverallPatterns()
    if (commonPatterns.includes('too_extreme')) {
      areas.push('Avoid selecting answers with extreme language')
    }
    if (commonPatterns.includes('out_of_scope')) {
      areas.push('Focus on staying within the scope of the argument')
    }

    return areas.slice(0, 5)
  }

  /**
   * Generate trend-specific recommendations
   */
  private generateTrendRecommendation(
    trend: 'improving' | 'stable' | 'declining',
    changePercentage: number,
    questionType: LogicalReasoningQuestionType
  ): string {
    switch (trend) {
      case 'improving':
        return `Keep up the good work! Your ${questionType} accuracy has improved by ${Math.round(Math.abs(changePercentage))}%.`
      case 'declining':
        return `Focus on ${questionType} questions. Your accuracy has dropped by ${Math.round(Math.abs(changePercentage))}% recently.`
      case 'stable':
        return `Your ${questionType} performance is consistent. Consider targeted practice to push to the next level.`
    }
  }

  /**
   * Calculate recommended practice count for improvement
   */
  private calculatePracticeCount(performance: QuestionTypePerformance): number {
    if (performance.accuracy < 0.5) return 20
    if (performance.accuracy < 0.65) return 15
    if (performance.accuracy < 0.75) return 10
    return 5
  }

  /**
   * Generate focus points for a question type
   */
  private generateFocusPoints(
    type: LogicalReasoningQuestionType,
    performance: QuestionTypePerformance
  ): string[] {
    const points: string[] = []

    // Type-specific focus points
    switch (type) {
      case 'strengthen':
      case 'weaken':
        points.push('Identify the conclusion first')
        points.push('Look for answer choices that affect key assumptions')
        break
      case 'assumption':
        points.push('Use the negation test')
        points.push('Focus on necessary conditions for the argument')
        break
      case 'flaw':
        points.push('Learn common logical fallacy patterns')
        points.push('Don\'t just identify what\'s wrong, understand why')
        break
    }

    // Pattern-specific focus points
    if (performance.commonPatterns.includes('too_extreme')) {
      points.push('Avoid answers with absolute language')
    }
    if (performance.commonPatterns.includes('out_of_scope')) {
      points.push('Stay focused on the argument\'s scope')
    }

    return points.slice(0, 3)
  }

  /**
   * Estimate time to improvement in days
   */
  private estimateImprovementTime(recommendations: any[]): number {
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length
    const mediumPriorityCount = recommendations.filter(r => r.priority === 'medium').length

    // Base estimate on priority levels
    return (highPriorityCount * 14) + (mediumPriorityCount * 10) + 7
  }

  /**
   * Calculate variance in accuracy windows
   */
  private calculateVariance(accuracies: number[]): number {
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const squaredDiffs = accuracies.map(acc => Math.pow(acc - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / accuracies.length
  }

  /**
   * Get empty performance object
   */
  private getEmptyPerformance(questionType: LogicalReasoningQuestionType): QuestionTypePerformance {
    return {
      questionType,
      attemptCount: 0,
      correctCount: 0,
      accuracy: 0,
      averageTime: 0,
      recentTrend: 'stable',
      commonPatterns: [],
      lastPracticed: new Date().toISOString()
    }
  }

  /**
   * Get empty dashboard
   */
  private getEmptyDashboard(): PerformanceDashboard {
    return {
      overallAccuracy: 0,
      totalQuestions: 0,
      averageTime: 0,
      strongestTypes: [],
      weakestTypes: [],
      recentTrends: [],
      commonPatterns: [],
      timeEfficiency: 1,
      improvementAreas: []
    }
  }

  /**
   * Invalidate cache for question type
   */
  private invalidateCache(questionType: LogicalReasoningQuestionType): void {
    this.typePerformanceCache.delete(questionType)
  }

  /**
   * Reset all tracking data
   */
  reset(): void {
    this.performanceHistory = []
    this.typePerformanceCache.clear()
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    performanceHistory: QuestionPerformanceEntry[]
    dashboard: PerformanceDashboard
  } {
    return {
      performanceHistory: [...this.performanceHistory],
      dashboard: this.generateDashboard()
    }
  }
}