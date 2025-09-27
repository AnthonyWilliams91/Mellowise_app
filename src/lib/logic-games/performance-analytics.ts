/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Performance Analytics and Benchmarking System
 *
 * Advanced analytics system for tracking Logic Games performance with benchmarks
 * Provides detailed insights, progress tracking, and comparative analysis
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - Dev Agent Marcus + UX Expert Aria
 * @created 2025-01-20
 */

import type { LogicGameQuestion, LogicGameSession } from '@/types/logic-games'
import type { GameClassification } from './game-categorizer'
import type { InferenceTrainingSession } from './inference-detector'

export interface PerformanceMetrics {
  accuracy: number // percentage (0-100)
  average_time: number // seconds
  completion_rate: number // percentage (0-100)
  difficulty_progression: number // current difficulty level (1-10)
  consistency_score: number // variance in performance (0-1, higher = more consistent)
  improvement_rate: number // percentage improvement over time
  mastery_level: 'novice' | 'developing' | 'proficient' | 'advanced' | 'expert'
}

export interface GameTypePerformance {
  game_type: string // 'sequencing', 'grouping', 'matching', 'hybrid'
  total_attempts: number
  correct_attempts: number
  metrics: PerformanceMetrics
  common_mistakes: {
    mistake_type: string
    frequency: number
    impact_on_time: number
  }[]
  skill_gaps: {
    skill: string
    proficiency: number // 0-1
    priority: 'low' | 'medium' | 'high' | 'critical'
  }[]
  benchmarks: PerformanceBenchmarks
}

export interface PerformanceBenchmarks {
  percentile: number // user's percentile rank (0-100)
  time_vs_average: number // user time / average time (lower is better)
  accuracy_vs_average: number // user accuracy / average accuracy (higher is better)
  difficulty_level: number // current difficulty level (1-10)
  target_metrics: {
    target_accuracy: number
    target_time: number
    target_difficulty: number
    estimated_completion_date: string
  }
}

export interface LearningInsights {
  strengths: string[]
  weaknesses: string[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    action: string
    estimated_impact: number // 1-10
    estimated_time: number // hours
  }[]
  study_plan: {
    phase: string
    focus_areas: string[]
    duration: number // weeks
    success_criteria: string[]
  }[]
}

export interface SessionAnalytics {
  session_id: string
  question_id: string
  game_type: string
  start_time: number
  end_time: number
  total_duration: number // seconds
  accuracy_score: number // 0-1
  efficiency_score: number // based on time vs difficulty
  learning_score: number // based on inference discovery, walkthrough completion
  mistakes: {
    type: string
    timestamp: number
    recovery_time: number
  }[]
  interactions: {
    type: 'drag_drop' | 'inference_submission' | 'hint_request' | 'walkthrough_step'
    timestamp: number
    success: boolean
    time_spent: number
  }[]
  cognitive_load_indicators: {
    pause_frequency: number
    hint_usage_rate: number
    mistake_recovery_time: number
    cognitive_load_score: number // 1-10
  }
}

export interface ComparisonData {
  user_performance: PerformanceMetrics
  peer_average: PerformanceMetrics
  expert_benchmark: PerformanceMetrics
  improvement_potential: {
    current_score: number
    potential_score: number
    improvement_gap: number
    actionable_areas: string[]
  }
}

export class PerformanceAnalytics {
  /**
   * Analyze single session performance
   */
  static analyzeSession(
    session: LogicGameSession,
    classification: GameClassification,
    inferenceSession?: InferenceTrainingSession
  ): SessionAnalytics {
    const sessionAnalytics: SessionAnalytics = {
      session_id: `session-${Date.now()}`,
      question_id: session.question_id,
      game_type: classification.category,
      start_time: session.start_time ? new Date(session.start_time).getTime() : Date.now(),
      end_time: session.end_time ? new Date(session.end_time).getTime() : Date.now(),
      total_duration: this.calculateSessionDuration(session),
      accuracy_score: this.calculateAccuracyScore(session),
      efficiency_score: this.calculateEfficiencyScore(session, classification),
      learning_score: this.calculateLearningScore(session, inferenceSession),
      mistakes: this.analyzeMistakes(session),
      interactions: this.analyzeInteractions(session),
      cognitive_load_indicators: this.analyzeCognitiveLoad(session)
    }

    return sessionAnalytics
  }

  /**
   * Calculate comprehensive performance metrics for a game type
   */
  static calculateGameTypePerformance(
    sessions: SessionAnalytics[],
    gameType: string
  ): GameTypePerformance {
    const gameTypeSessions = sessions.filter(s => s.game_type === gameType)

    if (gameTypeSessions.length === 0) {
      return this.createEmptyGameTypePerformance(gameType)
    }

    const totalAttempts = gameTypeSessions.length
    const correctAttempts = gameTypeSessions.filter(s => s.accuracy_score >= 0.7).length

    const metrics = this.calculateMetrics(gameTypeSessions)
    const commonMistakes = this.identifyCommonMistakes(gameTypeSessions)
    const skillGaps = this.identifySkillGaps(gameTypeSessions)
    const benchmarks = this.calculateBenchmarks(metrics, gameType)

    return {
      game_type: gameType,
      total_attempts: totalAttempts,
      correct_attempts: correctAttempts,
      metrics,
      common_mistakes: commonMistakes,
      skill_gaps: skillGaps,
      benchmarks
    }
  }

  /**
   * Generate learning insights and recommendations
   */
  static generateLearningInsights(
    performances: GameTypePerformance[],
    overallMetrics: PerformanceMetrics
  ): LearningInsights {
    const strengths = this.identifyStrengths(performances)
    const weaknesses = this.identifyWeaknesses(performances)
    const recommendations = this.generateRecommendations(performances, overallMetrics)
    const studyPlan = this.createStudyPlan(weaknesses, recommendations)

    return {
      strengths,
      weaknesses,
      recommendations,
      study_plan: studyPlan
    }
  }

  /**
   * Compare user performance with benchmarks
   */
  static compareWithBenchmarks(
    userMetrics: PerformanceMetrics,
    gameType: string
  ): ComparisonData {
    const peerAverage = this.getPeerAverageMetrics(gameType)
    const expertBenchmark = this.getExpertBenchmarkMetrics(gameType)

    return {
      user_performance: userMetrics,
      peer_average: peerAverage,
      expert_benchmark: expertBenchmark,
      improvement_potential: {
        current_score: this.calculateOverallScore(userMetrics),
        potential_score: this.calculateOverallScore(expertBenchmark),
        improvement_gap: this.calculateImprovementGap(userMetrics, expertBenchmark),
        actionable_areas: this.identifyActionableAreas(userMetrics, expertBenchmark)
      }
    }
  }

  /**
   * Track learning progression over time
   */
  static trackProgressionOverTime(
    sessions: SessionAnalytics[],
    timeWindow: number = 30 // days
  ): {
    timeline: { date: string; metrics: PerformanceMetrics }[]
    trend_analysis: {
      accuracy_trend: 'improving' | 'declining' | 'stable'
      time_trend: 'improving' | 'declining' | 'stable'
      consistency_trend: 'improving' | 'declining' | 'stable'
      overall_progression: number // rate of improvement per week
    }
  } {
    const cutoffDate = Date.now() - (timeWindow * 24 * 60 * 60 * 1000)
    const recentSessions = sessions.filter(s => s.start_time >= cutoffDate)

    // Group sessions by week
    const weeklyGroups = this.groupSessionsByWeek(recentSessions)
    const timeline = weeklyGroups.map(group => ({
      date: group.week,
      metrics: this.calculateMetrics(group.sessions)
    }))

    const trendAnalysis = this.analyzeTrends(timeline)

    return {
      timeline,
      trend_analysis: trendAnalysis
    }
  }

  // Helper methods
  private static calculateSessionDuration(session: LogicGameSession): number {
    if (!session.start_time || !session.end_time) return 0
    const start = new Date(session.start_time).getTime()
    const end = new Date(session.end_time).getTime()
    return Math.max(0, (end - start) / 1000)
  }

  private static calculateAccuracyScore(session: LogicGameSession): number {
    if (!session.user_answers || session.user_answers.length === 0) return 0
    const correctCount = session.user_answers.filter(answer => answer.is_correct).length
    return correctCount / session.user_answers.length
  }

  private static calculateEfficiencyScore(
    session: LogicGameSession,
    classification: GameClassification
  ): number {
    const duration = this.calculateSessionDuration(session)
    const expectedTime = classification.estimated_time * 60 // convert to seconds
    const timeRatio = expectedTime / Math.max(duration, 1)
    const accuracyBonus = this.calculateAccuracyScore(session)

    return Math.min(1, timeRatio * accuracyBonus)
  }

  private static calculateLearningScore(
    session: LogicGameSession,
    inferenceSession?: InferenceTrainingSession
  ): number {
    let score = 0.5 // base score

    // Walkthrough completion bonus
    if (session.hint_requests && session.hint_requests.length > 0) {
      score += 0.2
    }

    // Inference training bonus
    if (inferenceSession) {
      const discoveryRate = inferenceSession.discovered_nodes.length / inferenceSession.map.nodes.length
      score += discoveryRate * 0.3
    }

    return Math.min(1, score)
  }

  private static analyzeMistakes(session: LogicGameSession): SessionAnalytics['mistakes'] {
    const mistakes: SessionAnalytics['mistakes'] = []

    if (session.common_mistakes) {
      session.common_mistakes.forEach((mistake, index) => {
        mistakes.push({
          type: mistake.mistake_type,
          timestamp: Date.now() + (index * 1000), // approximate timestamps
          recovery_time: mistake.time_impact || 30
        })
      })
    }

    return mistakes
  }

  private static analyzeInteractions(session: LogicGameSession): SessionAnalytics['interactions'] {
    const interactions: SessionAnalytics['interactions'] = []

    // Analyze user actions
    if (session.user_actions) {
      session.user_actions.forEach(action => {
        interactions.push({
          type: 'drag_drop',
          timestamp: new Date(action.timestamp).getTime(),
          success: true, // assume successful if recorded
          time_spent: 2 // average time per action
        })
      })
    }

    // Analyze hint requests
    if (session.hint_requests) {
      session.hint_requests.forEach(hint => {
        interactions.push({
          type: 'hint_request',
          timestamp: new Date(hint.timestamp).getTime(),
          success: true,
          time_spent: 1
        })
      })
    }

    return interactions
  }

  private static analyzeCognitiveLoad(session: LogicGameSession): SessionAnalytics['cognitive_load_indicators'] {
    const duration = this.calculateSessionDuration(session)
    const pauseCount = session.user_actions?.length || 0
    const hintCount = session.hint_requests?.length || 0
    const mistakeCount = session.common_mistakes?.length || 0

    return {
      pause_frequency: pauseCount / Math.max(duration / 60, 1), // pauses per minute
      hint_usage_rate: hintCount / Math.max(duration / 60, 1), // hints per minute
      mistake_recovery_time: mistakeCount > 0 ? duration / mistakeCount : 0,
      cognitive_load_score: Math.min(10, Math.max(1,
        (hintCount * 2) + (mistakeCount * 3) + (pauseCount * 0.5)
      ))
    }
  }

  private static calculateMetrics(sessions: SessionAnalytics[]): PerformanceMetrics {
    if (sessions.length === 0) {
      return {
        accuracy: 0,
        average_time: 0,
        completion_rate: 0,
        difficulty_progression: 1,
        consistency_score: 0,
        improvement_rate: 0,
        mastery_level: 'novice'
      }
    }

    const accuracy = sessions.reduce((sum, s) => sum + (s.accuracy_score * 100), 0) / sessions.length
    const averageTime = sessions.reduce((sum, s) => sum + s.total_duration, 0) / sessions.length
    const completionRate = (sessions.filter(s => s.accuracy_score >= 0.5).length / sessions.length) * 100
    const consistencyScore = this.calculateConsistencyScore(sessions)
    const improvementRate = this.calculateImprovementRate(sessions)

    return {
      accuracy,
      average_time: averageTime,
      completion_rate: completionRate,
      difficulty_progression: this.calculateDifficultyProgression(sessions),
      consistency_score: consistencyScore,
      improvement_rate: improvementRate,
      mastery_level: this.determineMasteryLevel(accuracy, averageTime, consistencyScore)
    }
  }

  private static calculateConsistencyScore(sessions: SessionAnalytics[]): number {
    if (sessions.length < 2) return 1

    const accuracies = sessions.map(s => s.accuracy_score)
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length

    // Convert variance to consistency score (lower variance = higher consistency)
    return Math.max(0, 1 - (variance * 2))
  }

  private static calculateImprovementRate(sessions: SessionAnalytics[]): number {
    if (sessions.length < 3) return 0

    const recentSessions = sessions.slice(-5) // last 5 sessions
    const olderSessions = sessions.slice(0, -5)

    if (olderSessions.length === 0) return 0

    const recentAvg = recentSessions.reduce((sum, s) => sum + s.accuracy_score, 0) / recentSessions.length
    const olderAvg = olderSessions.reduce((sum, s) => sum + s.accuracy_score, 0) / olderSessions.length

    return ((recentAvg - olderAvg) / olderAvg) * 100
  }

  private static determineMasteryLevel(
    accuracy: number,
    averageTime: number,
    consistencyScore: number
  ): PerformanceMetrics['mastery_level'] {
    const overallScore = (accuracy * 0.4) + (consistencyScore * 100 * 0.3) +
                         (Math.max(0, 100 - (averageTime / 60)) * 0.3)

    if (overallScore >= 90) return 'expert'
    if (overallScore >= 75) return 'advanced'
    if (overallScore >= 60) return 'proficient'
    if (overallScore >= 40) return 'developing'
    return 'novice'
  }

  // Additional helper methods...
  private static createEmptyGameTypePerformance(gameType: string): GameTypePerformance {
    return {
      game_type: gameType,
      total_attempts: 0,
      correct_attempts: 0,
      metrics: {
        accuracy: 0,
        average_time: 0,
        completion_rate: 0,
        difficulty_progression: 1,
        consistency_score: 0,
        improvement_rate: 0,
        mastery_level: 'novice'
      },
      common_mistakes: [],
      skill_gaps: [],
      benchmarks: {
        percentile: 0,
        time_vs_average: 1,
        accuracy_vs_average: 1,
        difficulty_level: 1,
        target_metrics: {
          target_accuracy: 80,
          target_time: 420, // 7 minutes
          target_difficulty: 5,
          estimated_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }
  }

  private static identifyCommonMistakes(sessions: SessionAnalytics[]): GameTypePerformance['common_mistakes'] {
    const mistakeMap = new Map<string, { frequency: number; totalTime: number }>()

    sessions.forEach(session => {
      session.mistakes.forEach(mistake => {
        const existing = mistakeMap.get(mistake.type) || { frequency: 0, totalTime: 0 }
        mistakeMap.set(mistake.type, {
          frequency: existing.frequency + 1,
          totalTime: existing.totalTime + mistake.recovery_time
        })
      })
    })

    return Array.from(mistakeMap.entries())
      .map(([type, data]) => ({
        mistake_type: type,
        frequency: data.frequency,
        impact_on_time: data.totalTime / data.frequency
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5) // top 5 mistakes
  }

  private static identifySkillGaps(sessions: SessionAnalytics[]): GameTypePerformance['skill_gaps'] {
    // Simplified skill gap analysis
    return [
      {
        skill: 'Setup Speed',
        proficiency: sessions.reduce((sum, s) => sum + s.efficiency_score, 0) / sessions.length,
        priority: 'high' as const
      },
      {
        skill: 'Inference Recognition',
        proficiency: sessions.reduce((sum, s) => sum + s.learning_score, 0) / sessions.length,
        priority: 'medium' as const
      }
    ]
  }

  private static calculateBenchmarks(metrics: PerformanceMetrics, gameType: string): PerformanceBenchmarks {
    // Simplified benchmark calculation
    return {
      percentile: Math.min(95, Math.max(5, metrics.accuracy * 1.2)),
      time_vs_average: 1.0, // user time equals average
      accuracy_vs_average: metrics.accuracy / 70, // assuming 70% average
      difficulty_level: metrics.difficulty_progression,
      target_metrics: {
        target_accuracy: Math.min(95, metrics.accuracy + 10),
        target_time: Math.max(180, metrics.average_time * 0.8),
        target_difficulty: Math.min(10, metrics.difficulty_progression + 1),
        estimated_completion_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }

  private static identifyStrengths(performances: GameTypePerformance[]): string[] {
    const strengths: string[] = []

    performances.forEach(perf => {
      if (perf.metrics.accuracy >= 80) {
        strengths.push(`Strong accuracy in ${perf.game_type} games`)
      }
      if (perf.metrics.consistency_score >= 0.8) {
        strengths.push(`Consistent performance in ${perf.game_type} games`)
      }
      if (perf.metrics.average_time <= 300) { // 5 minutes
        strengths.push(`Efficient time management in ${perf.game_type} games`)
      }
    })

    return strengths.slice(0, 3) // top 3 strengths
  }

  private static identifyWeaknesses(performances: GameTypePerformance[]): string[] {
    const weaknesses: string[] = []

    performances.forEach(perf => {
      if (perf.metrics.accuracy < 60) {
        weaknesses.push(`Low accuracy in ${perf.game_type} games`)
      }
      if (perf.metrics.consistency_score < 0.5) {
        weaknesses.push(`Inconsistent performance in ${perf.game_type} games`)
      }
      if (perf.metrics.average_time > 600) { // 10 minutes
        weaknesses.push(`Slow completion time in ${perf.game_type} games`)
      }
    })

    return weaknesses.slice(0, 3) // top 3 weaknesses
  }

  private static generateRecommendations(
    performances: GameTypePerformance[],
    overallMetrics: PerformanceMetrics
  ): LearningInsights['recommendations'] {
    const recommendations: LearningInsights['recommendations'] = []

    if (overallMetrics.accuracy < 70) {
      recommendations.push({
        priority: 'high',
        action: 'Focus on fundamental rule understanding and setup techniques',
        estimated_impact: 8,
        estimated_time: 10
      })
    }

    if (overallMetrics.average_time > 480) { // 8 minutes
      recommendations.push({
        priority: 'high',
        action: 'Practice speed drills and time management techniques',
        estimated_impact: 7,
        estimated_time: 8
      })
    }

    if (overallMetrics.consistency_score < 0.6) {
      recommendations.push({
        priority: 'medium',
        action: 'Work on maintaining focus and reducing careless mistakes',
        estimated_impact: 6,
        estimated_time: 6
      })
    }

    return recommendations.sort((a, b) => b.estimated_impact - a.estimated_impact)
  }

  private static createStudyPlan(
    weaknesses: string[],
    recommendations: LearningInsights['recommendations']
  ): LearningInsights['study_plan'] {
    return [
      {
        phase: 'Foundation Building',
        focus_areas: ['Rule comprehension', 'Basic setup patterns'],
        duration: 2,
        success_criteria: ['80% accuracy on basic games', 'Complete setup in under 3 minutes']
      },
      {
        phase: 'Skill Development',
        focus_areas: ['Advanced inferences', 'Speed techniques'],
        duration: 3,
        success_criteria: ['85% accuracy overall', 'Average completion under 7 minutes']
      },
      {
        phase: 'Mastery & Consistency',
        focus_areas: ['Complex game types', 'Pressure performance'],
        duration: 3,
        success_criteria: ['90% accuracy', 'Consistent sub-6 minute completion']
      }
    ]
  }

  // Additional helper methods for benchmarking...
  private static getPeerAverageMetrics(gameType: string): PerformanceMetrics {
    // Simulated peer averages - in production, this would come from database
    return {
      accuracy: 72,
      average_time: 420, // 7 minutes
      completion_rate: 85,
      difficulty_progression: 5,
      consistency_score: 0.65,
      improvement_rate: 5,
      mastery_level: 'developing'
    }
  }

  private static getExpertBenchmarkMetrics(gameType: string): PerformanceMetrics {
    return {
      accuracy: 95,
      average_time: 240, // 4 minutes
      completion_rate: 98,
      difficulty_progression: 9,
      consistency_score: 0.9,
      improvement_rate: 2,
      mastery_level: 'expert'
    }
  }

  private static calculateOverallScore(metrics: PerformanceMetrics): number {
    return (
      metrics.accuracy * 0.3 +
      (100 - (metrics.average_time / 10)) * 0.25 +
      metrics.completion_rate * 0.2 +
      metrics.consistency_score * 100 * 0.15 +
      metrics.difficulty_progression * 10 * 0.1
    )
  }

  private static calculateImprovementGap(
    userMetrics: PerformanceMetrics,
    expertMetrics: PerformanceMetrics
  ): number {
    const userScore = this.calculateOverallScore(userMetrics)
    const expertScore = this.calculateOverallScore(expertMetrics)
    return expertScore - userScore
  }

  private static identifyActionableAreas(
    userMetrics: PerformanceMetrics,
    expertMetrics: PerformanceMetrics
  ): string[] {
    const areas: string[] = []

    if (expertMetrics.accuracy - userMetrics.accuracy > 15) {
      areas.push('Accuracy improvement')
    }
    if (userMetrics.average_time - expertMetrics.average_time > 120) {
      areas.push('Speed enhancement')
    }
    if (expertMetrics.consistency_score - userMetrics.consistency_score > 0.2) {
      areas.push('Consistency building')
    }

    return areas
  }

  private static calculateDifficultyProgression(sessions: SessionAnalytics[]): number {
    // Simplified - would use actual game difficulty ratings
    return Math.min(10, Math.max(1, sessions.length / 5 + 1))
  }

  private static groupSessionsByWeek(sessions: SessionAnalytics[]): Array<{ week: string; sessions: SessionAnalytics[] }> {
    const groups = new Map<string, SessionAnalytics[]>()

    sessions.forEach(session => {
      const date = new Date(session.start_time)
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`

      if (!groups.has(weekKey)) {
        groups.set(weekKey, [])
      }
      groups.get(weekKey)!.push(session)
    })

    return Array.from(groups.entries()).map(([week, sessions]) => ({ week, sessions }))
  }

  private static analyzeTrends(timeline: Array<{ date: string; metrics: PerformanceMetrics }>): any {
    if (timeline.length < 2) {
      return {
        accuracy_trend: 'stable' as const,
        time_trend: 'stable' as const,
        consistency_trend: 'stable' as const,
        overall_progression: 0
      }
    }

    const recent = timeline.slice(-3)
    const earlier = timeline.slice(0, -3)

    const recentAccuracy = recent.reduce((sum, t) => sum + t.metrics.accuracy, 0) / recent.length
    const earlierAccuracy = earlier.length > 0 ? earlier.reduce((sum, t) => sum + t.metrics.accuracy, 0) / earlier.length : recentAccuracy

    return {
      accuracy_trend: recentAccuracy > earlierAccuracy + 5 ? 'improving' :
                     recentAccuracy < earlierAccuracy - 5 ? 'declining' : 'stable',
      time_trend: 'improving' as const, // Simplified
      consistency_trend: 'stable' as const, // Simplified
      overall_progression: (recentAccuracy - earlierAccuracy) / timeline.length
    }
  }
}