/**
 * Analytics Type Definitions
 * 
 * TypeScript types for analytics system
 */

export interface SessionPerformance {
  id: string
  session_id: string
  user_id: string
  total_time_spent: number
  avg_response_time: number
  accuracy_percentage: number
  streak_count: number
  max_streak: number
  logical_reasoning_correct: number
  logical_reasoning_total: number
  logic_games_correct: number
  logic_games_total: number
  reading_comprehension_correct: number
  reading_comprehension_total: number
  difficulty_progression: number[]
  final_difficulty: number
  pauses_used: number
  hints_used: number
  power_ups_used: Record<string, number>
  created_at: string
}

export interface DailyStats {
  id: string
  user_id: string
  date_recorded: string
  sessions_played: number
  total_questions_answered: number
  total_correct_answers: number
  total_time_spent: number
  avg_accuracy: number
  avg_response_time: number
  best_streak: number
  topic_performance: Record<string, any>
  current_daily_streak: number
  is_streak_day: boolean
  created_at: string
  updated_at: string
}

export interface UserStreaks {
  id: string
  user_id: string
  current_daily_streak: number
  current_session_streak: number
  best_daily_streak: number
  best_session_streak: number
  best_accuracy_streak: number
  current_daily_streak_start: string | null
  last_activity_date: string | null
  best_daily_streak_start: string | null
  best_daily_streak_end: string | null
  milestones_achieved: string[]
  created_at: string
  updated_at: string
}

export interface TopicPerformance {
  id: string
  user_id: string
  topic_type: 'logical_reasoning' | 'logic_games' | 'reading_comprehension'
  total_questions: number
  correct_answers: number
  current_accuracy: number
  current_difficulty: number
  max_difficulty_reached: number
  avg_response_time: number
  total_time_spent: number
  recent_answers: boolean[]
  recent_accuracy: number
  questions_per_day: number
  improvement_rate: number
  last_practiced_at: string | null
  created_at: string
  updated_at: string
}

export interface PerformanceSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  total_questions_answered: number
  overall_accuracy: number
  avg_difficulty: number
  topic_performance: Record<string, any>
  daily_streak: number
  best_session_streak: number
  sessions_this_week: number
  avg_session_length: number
  most_active_time_of_day: number | null
  created_at: string
}

export interface AnalyticsOverview {
  totalSessions: number
  totalQuestions: number
  totalCorrect: number
  totalTimeSpent: number
  activeDays: number
  overallAccuracy: number
  avgSessionLength: number
  avgQuestionsPerSession: number
  studyDaysThisPeriod: number
}

export interface StreakHealth {
  status: 'healthy' | 'at_risk' | 'broken'
  daysUntilBreak: number | null
  momentum: 'growing' | 'stable' | 'declining'
  consistency: number
  weeklyAverage: number
}

export interface StreakNotification {
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

export interface Milestone {
  type: 'daily' | 'session'
  value: number
  title: string
  description: string
  key?: string
}

export interface DashboardData {
  timeframe: string
  dateRange: { start: string; end: string }
  overview: AnalyticsOverview
  dailyStats: DailyStats[]
  streaks: UserStreaks
  topicPerformance: TopicPerformance[]
  recentSessions: Array<SessionPerformance & { game_sessions: any }>
  performanceSnapshots?: PerformanceSnapshot[]
}

export interface ExportData {
  metadata: {
    exportDate: string
    userId: string
    userEmail: string | undefined
    timeframe: string
    dateRange: { start: string; end: string }
    includesRawData: boolean
    dataVersion: string
  }
  profile: any
  summary: {
    timeframe: {
      totalDays: number
      activeDays: number
      consistencyRate: number
    }
    activity: {
      totalSessions: number
      totalQuestions: number
      totalCorrect: number
      totalTimeSpent: number
      avgSessionLength: number
    }
    performance: {
      overallAccuracy: number
      bestSessionAccuracy: number
      bestSessionScore: number
    }
    topics: Array<{
      type: string
      accuracy: number
      totalQuestions: number
      difficulty: number
    }>
  }
  dailyStats: DailyStats[]
  sessionPerformance: SessionPerformance[]
  topicPerformance: TopicPerformance[]
  streakData: UserStreaks
  rawData?: {
    sessions: any[]
    questionAttempts: any[]
  }
}