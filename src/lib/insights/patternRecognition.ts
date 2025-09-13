/**
 * Performance Pattern Recognition Service
 * 
 * Rule-based pattern detection system for identifying performance insights
 */

import { 
  PerformanceInsight,
  CompletionRatePattern,
  StreakPerformancePattern,
  TimeBasedPattern,
  TopicPerformancePattern,
  DifficultyProgressionPattern,
  InsightType,
  InsightCategory,
  InsightPriority
} from '@/types/insights'
import { 
  SessionPerformance, 
  DailyStats, 
  UserStreaks, 
  TopicPerformance 
} from '@/types/analytics'

export class PerformancePatternRecognition {
  private readonly MIN_SESSIONS_FOR_PATTERN = 5
  private readonly MIN_DAYS_FOR_TREND = 7
  private readonly SIGNIFICANCE_THRESHOLD = 0.15 // 15% change threshold

  /**
   * Analyze completion rate patterns
   */
  analyzeCompletionRatePattern(
    recentSessions: SessionPerformance[],
    dailyStats: DailyStats[]
  ): CompletionRatePattern | null {
    if (recentSessions.length < this.MIN_SESSIONS_FOR_PATTERN) {
      return null
    }

    // Calculate current completion rate (sessions with > 80% accuracy)
    const currentPeriodSessions = recentSessions.slice(0, 10)
    const previousPeriodSessions = recentSessions.slice(10, 20)

    const currentRate = this.calculateCompletionRate(currentPeriodSessions)
    const previousRate = this.calculateCompletionRate(previousPeriodSessions)

    const changePercentage = previousRate > 0 
      ? ((currentRate - previousRate) / previousRate) * 100 
      : 0

    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (Math.abs(changePercentage) > this.SIGNIFICANCE_THRESHOLD * 100) {
      trend = changePercentage > 0 ? 'improving' : 'declining'
    }

    return {
      current_rate: currentRate,
      previous_period_rate: previousRate,
      trend,
      change_percentage: Math.round(changePercentage * 100) / 100,
      sessions_analyzed: currentPeriodSessions.length
    }
  }

  /**
   * Analyze streak performance patterns
   */
  analyzeStreakPerformance(
    streakData: UserStreaks,
    recentSessions: SessionPerformance[]
  ): StreakPerformancePattern {
    const streakLengths = recentSessions.map(s => s.streak_count).filter(s => s > 0)
    const averageStreakLength = streakLengths.length > 0 
      ? streakLengths.reduce((sum, streak) => sum + streak, 0) / streakLengths.length
      : 0

    // Calculate streak break frequency (how often streaks end)
    const streakBreaks = recentSessions.filter((session, index) => {
      if (index === 0) return false
      return session.streak_count === 0 && recentSessions[index - 1].streak_count > 0
    }).length

    const streakBreakFrequency = recentSessions.length > 0 
      ? streakBreaks / recentSessions.length
      : 0

    // Find best performance streak range
    const bestPerformanceRange = this.findBestPerformanceStreakRange(recentSessions)

    // Calculate consistency score based on streak maintenance
    const consistencyScore = this.calculateStreakConsistency(recentSessions)

    return {
      current_streak: streakData.current_session_streak || 0,
      average_streak_length: Math.round(averageStreakLength * 100) / 100,
      streak_break_frequency: Math.round(streakBreakFrequency * 100) / 100,
      best_performance_streak_range: bestPerformanceRange,
      consistency_score: Math.round(consistencyScore * 100) / 100
    }
  }

  /**
   * Analyze time-based performance patterns
   */
  analyzeTimeBasedPerformance(
    recentSessions: SessionPerformance[],
    dailyStats: DailyStats[]
  ): TimeBasedPattern | null {
    if (recentSessions.length < this.MIN_SESSIONS_FOR_PATTERN) {
      return null
    }

    // Group sessions by hour of day
    const performanceByHour: Record<number, number[]> = {}
    const completionByHour: Record<number, number> = {}

    recentSessions.forEach(session => {
      const hour = new Date(session.created_at).getHours()
      if (!performanceByHour[hour]) {
        performanceByHour[hour] = []
        completionByHour[hour] = 0
      }
      performanceByHour[hour].push(session.accuracy_percentage)
      if (session.accuracy_percentage > 75) { // Consider 75%+ as completed
        completionByHour[hour]++
      }
    })

    // Calculate average performance by hour
    const avgPerformanceByHour: Record<number, number> = {}
    Object.entries(performanceByHour).forEach(([hour, accuracies]) => {
      avgPerformanceByHour[parseInt(hour)] = 
        accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    })

    // Find peak performance time
    const peakHour = Object.entries(avgPerformanceByHour).reduce((peak, [hour, avg]) => {
      return avg > peak.avg ? { hour: parseInt(hour), avg } : peak
    }, { hour: 0, avg: 0 })

    // Identify optimal study hours (hours with above-average performance)
    const overallAvg = Object.values(avgPerformanceByHour).reduce((sum, avg) => sum + avg, 0) 
      / Object.values(avgPerformanceByHour).length
    const optimalHours = Object.entries(avgPerformanceByHour)
      .filter(([_, avg]) => avg > overallAvg * 1.1) // 10% above average
      .map(([hour, _]) => parseInt(hour))
      .sort((a, b) => a - b)

    return {
      optimal_study_hours: optimalHours,
      peak_performance_time: `${peakHour.hour}:00`,
      performance_by_hour: avgPerformanceByHour,
      session_completion_by_time: completionByHour
    }
  }

  /**
   * Analyze topic performance patterns
   */
  analyzeTopicPerformance(
    topicPerformance: TopicPerformance[]
  ): TopicPerformancePattern[] {
    return topicPerformance.map(topic => {
      // Determine trend based on recent accuracy vs current accuracy
      const trend = this.determineTopicTrend(topic)
      
      // Calculate relative performance compared to other topics
      const avgAccuracyAcrossTopics = topicPerformance
        .reduce((sum, t) => sum + t.current_accuracy, 0) / topicPerformance.length
      
      let relativePerformance: 'above_average' | 'average' | 'below_average' = 'average'
      const relativeThreshold = 0.05 // 5% threshold
      
      if (topic.current_accuracy > avgAccuracyAcrossTopics + relativeThreshold) {
        relativePerformance = 'above_average'
      } else if (topic.current_accuracy < avgAccuracyAcrossTopics - relativeThreshold) {
        relativePerformance = 'below_average'
      }

      // Estimate questions needed for improvement (rule-based)
      const questionsNeeded = relativePerformance === 'below_average' 
        ? Math.ceil((avgAccuracyAcrossTopics - topic.current_accuracy) * 50) // Rough estimate
        : 0

      return {
        topic: topic.topic_type,
        current_accuracy: topic.current_accuracy,
        accuracy_trend: trend,
        relative_performance: relativePerformance,
        questions_needed_for_improvement: questionsNeeded
      }
    })
  }

  /**
   * Generate performance insights from patterns
   */
  generateInsights(
    completionPattern: CompletionRatePattern | null,
    streakPattern: StreakPerformancePattern,
    timePattern: TimeBasedPattern | null,
    topicPatterns: TopicPerformancePattern[]
  ): PerformanceInsight[] {
    const insights: PerformanceInsight[] = []

    // Completion rate insights
    if (completionPattern) {
      insights.push(...this.generateCompletionRateInsights(completionPattern))
    }

    // Streak performance insights
    insights.push(...this.generateStreakInsights(streakPattern))

    // Time-based insights
    if (timePattern) {
      insights.push(...this.generateTimeBasedInsights(timePattern))
    }

    // Topic performance insights
    insights.push(...this.generateTopicInsights(topicPatterns))

    // Sort by priority and confidence
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.evidence.confidence_score - a.evidence.confidence_score
    })
  }

  // Private helper methods

  private calculateCompletionRate(sessions: SessionPerformance[]): number {
    if (sessions.length === 0) return 0
    const completedSessions = sessions.filter(s => s.accuracy_percentage >= 80)
    return completedSessions.length / sessions.length
  }

  private findBestPerformanceStreakRange(sessions: SessionPerformance[]): number[] {
    const streakAccuracies: Record<number, number[]> = {}
    
    sessions.forEach(session => {
      const streakBucket = Math.floor(session.streak_count / 5) * 5 // Group by 5s
      if (!streakAccuracies[streakBucket]) {
        streakAccuracies[streakBucket] = []
      }
      streakAccuracies[streakBucket].push(session.accuracy_percentage)
    })

    // Find bucket with highest average accuracy
    let bestRange = [0, 4]
    let bestAvg = 0

    Object.entries(streakAccuracies).forEach(([bucket, accuracies]) => {
      const avg = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
      if (avg > bestAvg) {
        bestAvg = avg
        const start = parseInt(bucket)
        bestRange = [start, start + 4]
      }
    })

    return bestRange
  }

  private calculateStreakConsistency(sessions: SessionPerformance[]): number {
    if (sessions.length === 0) return 0
    
    const streakMaintained = sessions.filter(session => session.streak_count > 0).length
    return streakMaintained / sessions.length
  }

  private determineTopicTrend(topic: TopicPerformance): 'improving' | 'declining' | 'stable' {
    // Use recent_accuracy vs current_accuracy for trend
    const change = topic.current_accuracy - topic.recent_accuracy
    const threshold = 0.05 // 5% threshold
    
    if (Math.abs(change) < threshold) return 'stable'
    return change > 0 ? 'improving' : 'declining'
  }

  private generateCompletionRateInsights(pattern: CompletionRatePattern): PerformanceInsight[] {
    const insights: PerformanceInsight[] = []

    if (pattern.trend === 'declining' && Math.abs(pattern.change_percentage) > 10) {
      insights.push({
        id: `completion_rate_declining_${Date.now()}`,
        type: 'completion_rate_trend',
        category: 'performance_trends',
        priority: 'high',
        title: 'Session Completion Rate Declining',
        description: `Your session completion rate has dropped by ${Math.abs(pattern.change_percentage).toFixed(1)}% recently.`,
        recommendation: 'Consider taking shorter study sessions or reviewing easier topics to rebuild confidence.',
        evidence: {
          metric_name: 'completion_rate',
          current_value: pattern.current_rate,
          trend_direction: 'declining',
          confidence_score: 85,
          supporting_data: { change_percentage: pattern.change_percentage }
        },
        created_at: new Date().toISOString()
      })
    }

    if (pattern.trend === 'improving' && pattern.change_percentage > 15) {
      insights.push({
        id: `completion_rate_improving_${Date.now()}`,
        type: 'completion_rate_trend',
        category: 'performance_trends',
        priority: 'medium',
        title: 'Excellent Progress on Session Completion',
        description: `Your session completion rate has improved by ${pattern.change_percentage.toFixed(1)}%!`,
        recommendation: 'Great momentum! Consider gradually increasing session difficulty to maintain challenge.',
        evidence: {
          metric_name: 'completion_rate',
          current_value: pattern.current_rate,
          trend_direction: 'improving',
          confidence_score: 90,
          supporting_data: { change_percentage: pattern.change_percentage }
        },
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  private generateStreakInsights(pattern: StreakPerformancePattern): PerformanceInsight[] {
    const insights: PerformanceInsight[] = []

    if (pattern.consistency_score < 0.4) {
      insights.push({
        id: `streak_consistency_low_${Date.now()}`,
        type: 'streak_performance',
        category: 'study_habits',
        priority: 'high',
        title: 'Streak Consistency Needs Attention',
        description: `Your streak consistency is ${(pattern.consistency_score * 100).toFixed(0)}%, indicating frequent streak breaks.`,
        recommendation: 'Focus on maintaining streaks by starting with easier questions when beginning a session.',
        evidence: {
          metric_name: 'streak_consistency',
          current_value: pattern.consistency_score,
          trend_direction: 'stable',
          confidence_score: 80,
          supporting_data: { 
            current_streak: pattern.current_streak,
            average_streak_length: pattern.average_streak_length
          }
        },
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  private generateTimeBasedInsights(pattern: TimeBasedPattern): PerformanceInsight[] {
    const insights: PerformanceInsight[] = []

    if (pattern.optimal_study_hours.length > 0) {
      const optimalHoursStr = pattern.optimal_study_hours.map(h => `${h}:00`).join(', ')
      insights.push({
        id: `optimal_study_time_${Date.now()}`,
        type: 'time_based_performance',
        category: 'time_optimization',
        priority: 'medium',
        title: 'Optimal Study Times Identified',
        description: `You perform best during: ${optimalHoursStr}`,
        recommendation: 'Schedule your most challenging study sessions during these peak performance hours.',
        evidence: {
          metric_name: 'optimal_hours',
          current_value: pattern.optimal_study_hours.length,
          trend_direction: 'stable',
          confidence_score: 75,
          supporting_data: { 
            optimal_hours: pattern.optimal_study_hours,
            peak_time: pattern.peak_performance_time
          }
        },
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  private generateTopicInsights(patterns: TopicPerformancePattern[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = []

    // Find weakest topic
    const weakestTopic = patterns.find(p => p.relative_performance === 'below_average')
    if (weakestTopic) {
      insights.push({
        id: `topic_weakness_${weakestTopic.topic}_${Date.now()}`,
        type: 'topic_weakness',
        category: 'topic_mastery',
        priority: 'high',
        title: `${weakestTopic.topic.replace('_', ' ').toUpperCase()} Needs Focus`,
        description: `Your ${weakestTopic.topic.replace('_', ' ')} accuracy (${(weakestTopic.current_accuracy * 100).toFixed(0)}%) is below your average performance.`,
        recommendation: `Focus on ${weakestTopic.topic.replace('_', ' ')} practice. Aim for ${weakestTopic.questions_needed_for_improvement} more questions to improve.`,
        evidence: {
          metric_name: 'topic_accuracy',
          current_value: weakestTopic.current_accuracy,
          trend_direction: weakestTopic.accuracy_trend,
          confidence_score: 85,
          supporting_data: { 
            topic: weakestTopic.topic,
            relative_performance: weakestTopic.relative_performance
          }
        },
        created_at: new Date().toISOString()
      })
    }

    // Find strongest topic
    const strongestTopic = patterns.find(p => p.relative_performance === 'above_average')
    if (strongestTopic) {
      insights.push({
        id: `topic_strength_${strongestTopic.topic}_${Date.now()}`,
        type: 'topic_strength',
        category: 'topic_mastery',
        priority: 'low',
        title: `Excellent ${strongestTopic.topic.replace('_', ' ').toUpperCase()} Performance`,
        description: `Your ${strongestTopic.topic.replace('_', ' ')} accuracy (${(strongestTopic.current_accuracy * 100).toFixed(0)}%) is above average!`,
        recommendation: 'Consider increasing difficulty for this topic or helping others to reinforce your knowledge.',
        evidence: {
          metric_name: 'topic_accuracy',
          current_value: strongestTopic.current_accuracy,
          trend_direction: strongestTopic.accuracy_trend,
          confidence_score: 80,
          supporting_data: { 
            topic: strongestTopic.topic,
            relative_performance: strongestTopic.relative_performance
          }
        },
        created_at: new Date().toISOString()
      })
    }

    return insights
  }
}

export const patternRecognition = new PerformancePatternRecognition()