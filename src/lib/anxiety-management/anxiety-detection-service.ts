/**
 * Anxiety Detection Service
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Advanced service for detecting anxiety levels through performance metrics and behavioral patterns.
 * Integrates with existing Epic 2 performance insights and learning style analysis.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { createClient } from '@/lib/supabase/client'
import { patternRecognition } from '@/lib/insights/patternRecognition'
import { profileService } from '@/lib/learning-style/profile-service'
import type {
  AnxietyLevel,
  AnxietyIndicators,
  AnxietyDetectionResult,
  AnxietyTrigger,
  TriggerPattern,
  AnxietyHistory,
  AnxietyDetectionService as IAnxietyDetectionService
} from '@/types/anxiety-management'
import type { SessionPerformance, DailyStats } from '@/types/analytics'
import type { LearningProfile } from '@/types/learning-style'

// ============================================================================
// ANXIETY DETECTION SERVICE CLASS
// ============================================================================

export class AnxietyDetectionService implements IAnxietyDetectionService {
  private supabase = createClient()
  private readonly ANXIETY_THRESHOLDS = {
    performance_decline: { moderate: 15, high: 25, severe: 40 },
    response_time_increase: { moderate: 30, high: 60, severe: 100 },
    streak_break_frequency: { moderate: 0.3, high: 0.5, severe: 0.8 },
    session_abandonment: { moderate: 0.2, high: 0.4, severe: 0.7 },
    accuracy_volatility: { moderate: 0.15, high: 0.25, severe: 0.4 }
  }

  /**
   * Detect current anxiety level based on recent performance and behavioral patterns
   */
  async detectAnxietyLevel(
    userId: string,
    recentPerformance: SessionPerformance[]
  ): Promise<AnxietyDetectionResult> {
    try {
      // Get comprehensive performance data
      const [dailyStats, learningProfile, anxietyHistory] = await Promise.all([
        this.getDailyStats(userId),
        profileService.getProfile(userId),
        this.getAnxietyHistory(userId)
      ])

      // Calculate anxiety indicators
      const indicators = this.calculateAnxietyIndicators(recentPerformance, dailyStats)

      // Determine anxiety level based on indicators
      const anxietyLevel = this.classifyAnxietyLevel(indicators)

      // Identify specific triggers
      const triggers = this.identifyAnxietyTriggers(
        indicators,
        recentPerformance,
        learningProfile
      )

      // Analyze behavioral patterns
      const behavioralPatterns = this.analyzeBehavioralPatterns(
        recentPerformance,
        anxietyHistory
      )

      // Calculate confidence score for detection
      const confidenceScore = this.calculateDetectionConfidence(
        indicators,
        recentPerformance.length,
        anxietyHistory
      )

      const detectionResult: AnxietyDetectionResult = {
        anxiety_level: anxietyLevel,
        confidence_score: Math.round(confidenceScore),
        primary_indicators: indicators,
        triggers_identified: triggers,
        behavioral_patterns: behavioralPatterns,
        detection_timestamp: new Date().toISOString()
      }

      // Store detection result
      await this.storeDetectionResult(userId, detectionResult)

      return detectionResult

    } catch (error) {
      console.error('Error detecting anxiety level:', error)
      throw new Error(`Failed to detect anxiety level: ${error.message}`)
    }
  }

  /**
   * Identify anxiety trigger patterns for a user
   */
  async identifyTriggers(userId: string): Promise<TriggerPattern[]> {
    try {
      const { data: detections, error } = await this.supabase
        .from('anxiety_detections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error

      // Group detections by trigger type and analyze patterns
      const triggerGroups: Record<AnxietyTrigger, any[]> = {
        time_pressure: [],
        difficult_questions: [],
        performance_drop: [],
        streak_break: [],
        comparison: [],
        unknown: []
      }

      detections?.forEach(detection => {
        const triggers = detection.triggers as AnxietyTrigger[]
        triggers.forEach(trigger => {
          triggerGroups[trigger].push(detection)
        })
      })

      // Calculate patterns for each trigger type
      const patterns: TriggerPattern[] = Object.entries(triggerGroups).map(([trigger, occurrences]) => {
        if (occurrences.length === 0) {
          return {
            trigger_type: trigger as AnxietyTrigger,
            frequency: 0,
            intensity_scores: [],
            context_factors: [],
            effective_interventions: [],
            last_occurrence: ''
          }
        }

        const intensityScores = occurrences.map(occ => this.getAnxietyIntensityScore(occ.anxiety_level))
        const avgIntensity = intensityScores.reduce((sum, score) => sum + score, 0) / intensityScores.length

        return {
          trigger_type: trigger as AnxietyTrigger,
          frequency: occurrences.length,
          intensity_scores: intensityScores,
          context_factors: this.extractContextFactors(occurrences),
          effective_interventions: await this.getEffectiveInterventions(userId, trigger as AnxietyTrigger),
          last_occurrence: occurrences[0]?.created_at || ''
        }
      }).filter(pattern => pattern.frequency > 0)

      return patterns.sort((a, b) => b.frequency - a.frequency)

    } catch (error) {
      console.error('Error identifying triggers:', error)
      throw new Error(`Failed to identify triggers: ${error.message}`)
    }
  }

  /**
   * Track and analyze anxiety history for trends
   */
  async trackAnxietyHistory(userId: string): Promise<AnxietyHistory> {
    try {
      const { data: detections, error } = await this.supabase
        .from('anxiety_detections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      if (!detections || detections.length === 0) {
        return {
          user_id: userId,
          detection_results: [],
          trends: {
            anxiety_trend: 'stable',
            confidence_trend: 'stable',
            trigger_patterns: {}
          },
          last_updated: new Date().toISOString()
        }
      }

      // Convert database records to detection results
      const detectionResults: AnxietyDetectionResult[] = detections.map(detection => ({
        anxiety_level: detection.anxiety_level,
        confidence_score: detection.confidence_score,
        primary_indicators: detection.indicators as AnxietyIndicators,
        triggers_identified: detection.triggers as AnxietyTrigger[],
        behavioral_patterns: [], // Would need additional data structure
        detection_timestamp: detection.created_at
      }))

      // Analyze trends
      const trends = this.analyzeTrends(detectionResults)

      return {
        user_id: userId,
        detection_results: detectionResults,
        trends,
        last_updated: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error tracking anxiety history:', error)
      throw new Error(`Failed to track anxiety history: ${error.message}`)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculate comprehensive anxiety indicators from performance data
   */
  private calculateAnxietyIndicators(
    recentPerformance: SessionPerformance[],
    dailyStats: DailyStats[]
  ): AnxietyIndicators {
    if (recentPerformance.length === 0) {
      return {
        performance_decline_rate: 0,
        response_time_increase: 0,
        streak_break_frequency: 0,
        session_abandonment_rate: 0,
        accuracy_volatility: 0,
        panic_patterns: false
      }
    }

    // Performance decline rate
    const recentSessions = recentPerformance.slice(0, 5)
    const olderSessions = recentPerformance.slice(5, 10)
    const recentAvg = recentSessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / recentSessions.length
    const olderAvg = olderSessions.length > 0
      ? olderSessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / olderSessions.length
      : recentAvg
    const performanceDeclineRate = olderAvg > 0 ? Math.max(0, ((olderAvg - recentAvg) / olderAvg) * 100) : 0

    // Response time increase
    const recentResponseTimes = recentSessions.map(s => s.average_response_time || 0)
    const olderResponseTimes = olderSessions.map(s => s.average_response_time || 0)
    const recentTimeAvg = recentResponseTimes.reduce((sum, t) => sum + t, 0) / recentResponseTimes.length
    const olderTimeAvg = olderResponseTimes.length > 0
      ? olderResponseTimes.reduce((sum, t) => sum + t, 0) / olderResponseTimes.length
      : recentTimeAvg
    const responseTimeIncrease = olderTimeAvg > 0 ? ((recentTimeAvg - olderTimeAvg) / olderTimeAvg) * 100 : 0

    // Streak break frequency
    let streakBreaks = 0
    for (let i = 1; i < recentPerformance.length; i++) {
      if (recentPerformance[i-1].streak_count > 0 && recentPerformance[i].streak_count === 0) {
        streakBreaks++
      }
    }
    const streakBreakFrequency = recentPerformance.length > 1 ? streakBreaks / (recentPerformance.length - 1) : 0

    // Session abandonment rate
    const abandonedSessions = recentPerformance.filter(s => s.completion_rate < 0.8).length
    const sessionAbandonmentRate = abandonedSessions / recentPerformance.length

    // Accuracy volatility (standard deviation)
    const accuracies = recentPerformance.map(s => s.accuracy_percentage)
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length
    const accuracyVolatility = Math.sqrt(variance) / 100 // Normalize to 0-1

    // Panic patterns (sudden drops after errors)
    const panicPatterns = this.detectPanicPatterns(recentPerformance)

    return {
      performance_decline_rate: Math.round(performanceDeclineRate * 100) / 100,
      response_time_increase: Math.round(responseTimeIncrease * 100) / 100,
      streak_break_frequency: Math.round(streakBreakFrequency * 100) / 100,
      session_abandonment_rate: Math.round(sessionAbandonmentRate * 100) / 100,
      accuracy_volatility: Math.round(accuracyVolatility * 100) / 100,
      panic_patterns: panicPatterns
    }
  }

  /**
   * Classify anxiety level based on indicators
   */
  private classifyAnxietyLevel(indicators: AnxietyIndicators): AnxietyLevel {
    let anxietyScore = 0

    // Weight different indicators
    const weights = {
      performance_decline: 3,
      response_time_increase: 2,
      streak_break_frequency: 3,
      session_abandonment: 4,
      accuracy_volatility: 2,
      panic_patterns: 5
    }

    // Calculate weighted anxiety score
    if (indicators.performance_decline_rate >= this.ANXIETY_THRESHOLDS.performance_decline.severe) {
      anxietyScore += weights.performance_decline * 3
    } else if (indicators.performance_decline_rate >= this.ANXIETY_THRESHOLDS.performance_decline.high) {
      anxietyScore += weights.performance_decline * 2
    } else if (indicators.performance_decline_rate >= this.ANXIETY_THRESHOLDS.performance_decline.moderate) {
      anxietyScore += weights.performance_decline * 1
    }

    if (indicators.response_time_increase >= this.ANXIETY_THRESHOLDS.response_time_increase.severe) {
      anxietyScore += weights.response_time_increase * 3
    } else if (indicators.response_time_increase >= this.ANXIETY_THRESHOLDS.response_time_increase.high) {
      anxietyScore += weights.response_time_increase * 2
    } else if (indicators.response_time_increase >= this.ANXIETY_THRESHOLDS.response_time_increase.moderate) {
      anxietyScore += weights.response_time_increase * 1
    }

    if (indicators.streak_break_frequency >= this.ANXIETY_THRESHOLDS.streak_break_frequency.severe) {
      anxietyScore += weights.streak_break_frequency * 3
    } else if (indicators.streak_break_frequency >= this.ANXIETY_THRESHOLDS.streak_break_frequency.high) {
      anxietyScore += weights.streak_break_frequency * 2
    } else if (indicators.streak_break_frequency >= this.ANXIETY_THRESHOLDS.streak_break_frequency.moderate) {
      anxietyScore += weights.streak_break_frequency * 1
    }

    if (indicators.session_abandonment_rate >= this.ANXIETY_THRESHOLDS.session_abandonment.severe) {
      anxietyScore += weights.session_abandonment * 3
    } else if (indicators.session_abandonment_rate >= this.ANXIETY_THRESHOLDS.session_abandonment.high) {
      anxietyScore += weights.session_abandonment * 2
    } else if (indicators.session_abandonment_rate >= this.ANXIETY_THRESHOLDS.session_abandonment.moderate) {
      anxietyScore += weights.session_abandonment * 1
    }

    if (indicators.accuracy_volatility >= this.ANXIETY_THRESHOLDS.accuracy_volatility.severe) {
      anxietyScore += weights.accuracy_volatility * 3
    } else if (indicators.accuracy_volatility >= this.ANXIETY_THRESHOLDS.accuracy_volatility.high) {
      anxietyScore += weights.accuracy_volatility * 2
    } else if (indicators.accuracy_volatility >= this.ANXIETY_THRESHOLDS.accuracy_volatility.moderate) {
      anxietyScore += weights.accuracy_volatility * 1
    }

    if (indicators.panic_patterns) {
      anxietyScore += weights.panic_patterns * 2
    }

    // Classify based on total score
    const maxPossibleScore = Object.values(weights).reduce((sum, weight) => sum + weight * 3, 0)
    const normalizedScore = anxietyScore / maxPossibleScore

    if (normalizedScore >= 0.7) return 'severe'
    if (normalizedScore >= 0.5) return 'high'
    if (normalizedScore >= 0.25) return 'moderate'
    return 'low'
  }

  /**
   * Identify specific anxiety triggers based on context
   */
  private identifyAnxietyTriggers(
    indicators: AnxietyIndicators,
    recentPerformance: SessionPerformance[],
    learningProfile: LearningProfile | null
  ): AnxietyTrigger[] {
    const triggers: AnxietyTrigger[] = []

    // Time pressure trigger
    if (indicators.response_time_increase > 30) {
      triggers.push('time_pressure')
    }

    // Difficult questions trigger
    const recentDifficulties = recentPerformance.map(s => s.average_difficulty || 5)
    const avgDifficulty = recentDifficulties.reduce((sum, d) => sum + d, 0) / recentDifficulties.length
    if (avgDifficulty > 7 && indicators.performance_decline_rate > 15) {
      triggers.push('difficult_questions')
    }

    // Performance drop trigger
    if (indicators.performance_decline_rate > 20) {
      triggers.push('performance_drop')
    }

    // Streak break trigger
    if (indicators.streak_break_frequency > 0.4) {
      triggers.push('streak_break')
    }

    // Comparison trigger (based on learning style)
    if (learningProfile?.learning_style?.includes('competitive') && indicators.accuracy_volatility > 0.2) {
      triggers.push('comparison')
    }

    // Unknown trigger if no specific triggers identified but anxiety is present
    if (triggers.length === 0 && (indicators.performance_decline_rate > 10 || indicators.panic_patterns)) {
      triggers.push('unknown')
    }

    return triggers
  }

  /**
   * Analyze behavioral patterns from performance history
   */
  private analyzeBehavioralPatterns(
    recentPerformance: SessionPerformance[],
    anxietyHistory: AnxietyHistory | null
  ): string[] {
    const patterns: string[] = []

    // Session timing patterns
    const sessionHours = recentPerformance.map(s => new Date(s.created_at).getHours())
    const hourFrequency: Record<number, number> = {}
    sessionHours.forEach(hour => {
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1
    })

    const mostCommonHour = Object.entries(hourFrequency).reduce((max, [hour, freq]) =>
      freq > max.freq ? { hour: parseInt(hour), freq } : max, { hour: 0, freq: 0 })

    if (mostCommonHour.freq > recentPerformance.length * 0.6) {
      patterns.push(`Tends to study at ${mostCommonHour.hour}:00`)
    }

    // Performance recovery patterns
    const recoveryTimes = this.analyzeRecoveryPatterns(recentPerformance)
    if (recoveryTimes.length > 0) {
      const avgRecovery = recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
      patterns.push(`Average recovery time after poor performance: ${avgRecovery.toFixed(1)} sessions`)
    }

    // Session length patterns
    const sessionLengths = recentPerformance.map(s => s.questions_answered)
    const avgLength = sessionLengths.reduce((sum, len) => sum + len, 0) / sessionLengths.length
    if (avgLength < 5) {
      patterns.push('Tends to keep sessions short (possible anxiety management)')
    } else if (avgLength > 15) {
      patterns.push('Prefers longer study sessions')
    }

    return patterns
  }

  /**
   * Calculate confidence in anxiety detection
   */
  private calculateDetectionConfidence(
    indicators: AnxietyIndicators,
    performanceDataPoints: number,
    anxietyHistory: AnxietyHistory | null
  ): number {
    let confidence = 50 // Base confidence

    // More data points increase confidence
    confidence += Math.min(performanceDataPoints * 3, 30)

    // Strong indicators increase confidence
    if (indicators.panic_patterns) confidence += 15
    if (indicators.performance_decline_rate > 25) confidence += 10
    if (indicators.session_abandonment_rate > 0.4) confidence += 10

    // Historical consistency increases confidence
    if (anxietyHistory && anxietyHistory.detection_results.length > 5) {
      const recentDetections = anxietyHistory.detection_results.slice(0, 5)
      const consistentAnxiety = recentDetections.filter(d => d.anxiety_level !== 'low').length
      if (consistentAnxiety >= 3) confidence += 15
    }

    return Math.min(confidence, 95) // Cap at 95% confidence
  }

  /**
   * Store anxiety detection result in database
   */
  private async storeDetectionResult(userId: string, result: AnxietyDetectionResult): Promise<void> {
    const { error } = await this.supabase
      .from('anxiety_detections')
      .insert({
        user_id: userId,
        anxiety_level: result.anxiety_level,
        confidence_score: result.confidence_score,
        indicators: result.primary_indicators,
        triggers: result.triggers_identified,
        created_at: result.detection_timestamp
      })

    if (error) {
      console.error('Error storing detection result:', error)
      throw error
    }
  }

  /**
   * Get daily stats for user
   */
  private async getDailyStats(userId: string): Promise<DailyStats[]> {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(14)

    if (error) throw error
    return data || []
  }

  /**
   * Get existing anxiety history
   */
  private async getAnxietyHistory(userId: string): Promise<AnxietyHistory | null> {
    try {
      return await this.trackAnxietyHistory(userId)
    } catch (error) {
      console.error('Error getting anxiety history:', error)
      return null
    }
  }

  /**
   * Detect panic patterns in performance data
   */
  private detectPanicPatterns(sessions: SessionPerformance[]): boolean {
    for (let i = 1; i < sessions.length; i++) {
      const prev = sessions[i-1]
      const curr = sessions[i]

      // Check for sudden accuracy drop after a wrong answer
      if (prev.accuracy_percentage < 60 && curr.accuracy_percentage < prev.accuracy_percentage - 20) {
        return true
      }

      // Check for dramatic response time increase after errors
      if (prev.accuracy_percentage < 60 &&
          curr.average_response_time > (prev.average_response_time || 0) * 2) {
        return true
      }
    }
    return false
  }

  /**
   * Analyze recovery patterns after poor performance
   */
  private analyzeRecoveryPatterns(sessions: SessionPerformance[]): number[] {
    const recoveryTimes: number[] = []

    for (let i = 0; i < sessions.length; i++) {
      if (sessions[i].accuracy_percentage < 60) {
        // Find when performance recovers
        for (let j = i + 1; j < sessions.length; j++) {
          if (sessions[j].accuracy_percentage > 75) {
            recoveryTimes.push(j - i)
            break
          }
        }
      }
    }

    return recoveryTimes
  }

  /**
   * Get anxiety intensity score from level
   */
  private getAnxietyIntensityScore(level: AnxietyLevel): number {
    const scores = { low: 25, moderate: 50, high: 75, severe: 100 }
    return scores[level] || 0
  }

  /**
   * Extract context factors from anxiety detections
   */
  private extractContextFactors(detections: any[]): string[] {
    const factors: string[] = []

    // Analyze timing patterns
    const hours = detections.map(d => new Date(d.created_at).getHours())
    const commonHours = hours.filter((hour, _, arr) =>
      arr.filter(h => h === hour).length > arr.length * 0.3
    )

    if (commonHours.length > 0) {
      factors.push(`Often occurs around ${commonHours[0]}:00`)
    }

    // Add more context analysis as needed
    return factors
  }

  /**
   * Get effective interventions for a trigger type
   */
  private async getEffectiveInterventions(userId: string, trigger: AnxietyTrigger): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('coping_strategies')
      .select('strategy_type, effectiveness_rating')
      .eq('user_id', userId)
      .eq('trigger_type', trigger)
      .gte('effectiveness_rating', 70)
      .order('effectiveness_rating', { ascending: false })

    if (error) return []
    return data || []
  }

  /**
   * Analyze trends in anxiety detection history
   */
  private analyzeTrends(detections: AnxietyDetectionResult[]): any {
    if (detections.length < 3) {
      return {
        anxiety_trend: 'stable',
        confidence_trend: 'stable',
        trigger_patterns: {}
      }
    }

    // Analyze anxiety level trends
    const recent = detections.slice(0, 5)
    const older = detections.slice(5, 10)

    const recentAnxietyScore = recent.reduce((sum, d) => sum + this.getAnxietyIntensityScore(d.anxiety_level), 0) / recent.length
    const olderAnxietyScore = older.length > 0
      ? older.reduce((sum, d) => sum + this.getAnxietyIntensityScore(d.anxiety_level), 0) / older.length
      : recentAnxietyScore

    let anxietyTrend: 'improving' | 'worsening' | 'stable' = 'stable'
    const anxietyChange = recentAnxietyScore - olderAnxietyScore
    if (Math.abs(anxietyChange) > 10) {
      anxietyTrend = anxietyChange < 0 ? 'improving' : 'worsening'
    }

    // Analyze confidence trends
    const recentConfidence = recent.reduce((sum, d) => sum + d.confidence_score, 0) / recent.length
    const olderConfidence = older.length > 0
      ? older.reduce((sum, d) => sum + d.confidence_score, 0) / older.length
      : recentConfidence

    let confidenceTrend: 'building' | 'declining' | 'stable' = 'stable'
    const confidenceChange = recentConfidence - olderConfidence
    if (Math.abs(confidenceChange) > 10) {
      confidenceTrend = confidenceChange > 0 ? 'building' : 'declining'
    }

    // Analyze trigger patterns
    const triggerCounts: Record<AnxietyTrigger, number> = {
      time_pressure: 0,
      difficult_questions: 0,
      performance_drop: 0,
      streak_break: 0,
      comparison: 0,
      unknown: 0
    }

    detections.forEach(detection => {
      detection.triggers_identified.forEach(trigger => {
        triggerCounts[trigger]++
      })
    })

    return {
      anxiety_trend: anxietyTrend,
      confidence_trend: confidenceTrend,
      trigger_patterns: triggerCounts
    }
  }
}

// Export singleton instance
export const anxietyDetectionService = new AnxietyDetectionService()