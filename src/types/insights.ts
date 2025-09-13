/**
 * Performance Insights Type Definitions
 * 
 * TypeScript types for the Smart Performance Insights system
 */

export type InsightType = 
  | 'completion_rate_trend'
  | 'streak_performance'
  | 'time_based_performance'
  | 'topic_weakness'
  | 'topic_strength' 
  | 'difficulty_progression'
  | 'session_consistency'
  | 'response_time_pattern'

export type InsightPriority = 'high' | 'medium' | 'low'

export type InsightCategory = 
  | 'performance_trends'
  | 'study_habits'
  | 'topic_mastery'
  | 'time_optimization'

export interface PerformanceInsight {
  id: string
  type: InsightType
  category: InsightCategory
  priority: InsightPriority
  title: string
  description: string
  recommendation: string
  evidence: {
    metric_name: string
    current_value: number
    trend_direction: 'improving' | 'declining' | 'stable'
    confidence_score: number // 0-100
    supporting_data?: Record<string, any>
  }
  created_at: string
}

export interface InsightPattern {
  pattern_id: string
  pattern_type: string
  detection_rules: {
    min_data_points: number
    significance_threshold: number
    lookback_days: number
  }
  is_active: boolean
}

export interface CompletionRatePattern {
  current_rate: number
  previous_period_rate: number
  trend: 'improving' | 'declining' | 'stable'
  change_percentage: number
  sessions_analyzed: number
}

export interface StreakPerformancePattern {
  current_streak: number
  average_streak_length: number
  streak_break_frequency: number
  best_performance_streak_range: number[]
  consistency_score: number
}

export interface TimeBasedPattern {
  optimal_study_hours: number[]
  peak_performance_time: string
  performance_by_hour: Record<number, number>
  session_completion_by_time: Record<number, number>
}

export interface TopicPerformancePattern {
  topic: string
  current_accuracy: number
  accuracy_trend: 'improving' | 'declining' | 'stable'
  relative_performance: 'above_average' | 'average' | 'below_average'
  questions_needed_for_improvement: number
}

export interface DifficultyProgressionPattern {
  current_difficulty: number
  progression_rate: number
  difficulty_comfort_zone: number[]
  breakthrough_opportunities: number[]
}

export interface InsightMetrics {
  total_insights_generated: number
  insights_by_category: Record<InsightCategory, number>
  insights_by_priority: Record<InsightPriority, number>
  user_agreement_rate: number
  insight_effectiveness_score: number
}

export interface InsightsDashboardData {
  insights: PerformanceInsight[]
  patterns: {
    completion_rate: CompletionRatePattern
    streak_performance: StreakPerformancePattern
    time_based: TimeBasedPattern
    topic_performance: TopicPerformancePattern[]
    difficulty_progression: DifficultyProgressionPattern
  }
  metrics: InsightMetrics
  generated_at: string
}

export interface InsightFeedback {
  insight_id: string
  user_id: string
  is_helpful: boolean
  is_accurate: boolean
  feedback_text?: string
  created_at: string
}

export interface InsightRecommendation {
  id: string
  insight_id: string
  recommendation_type: 'study_schedule' | 'topic_focus' | 'difficulty_adjustment' | 'session_timing'
  action_items: string[]
  expected_improvement: string
  timeframe: string
}