/**
 * Universal Exam System Type Definitions
 * 
 * Supports multi-exam platform architecture (LSAT, GRE, MCAT, SAT, etc.)
 * Based on Context7 DecA(I)de patterns for configurable exam systems
 * 
 * @architecture Multi-tenant with exam type modularity
 * @pattern Context7 DecA(I)de blueprint-based configuration
 */

import type { MultiTenantEntity } from './tenant'

// ============================================================================
// EXAM TYPE CONFIGURATION
// ============================================================================

export interface ExamType extends MultiTenantEntity {
  name: string // 'LSAT', 'GRE', 'MCAT', 'SAT'
  slug: string // 'lsat', 'gre', 'mcat', 'sat'
  description?: string
  
  // Scoring configuration (flexible per exam type)
  scoring_config: ExamScoringConfig
  
  // Timing configuration
  timing_config: ExamTimingConfig
  
  // Difficulty distribution (Context7 DecA(I)de pattern)
  difficulty_mix: DifficultyMixConfig
  
  // Metadata
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

export interface ExamScoringConfig {
  min_score: number
  max_score: number
  sections?: Array<{
    name: string
    min_score: number
    max_score: number
    weight?: number
  }>
  scoring_method?: 'raw' | 'scaled' | 'percentile'
  [key: string]: any // Allow exam-specific scoring rules
}

export interface ExamTimingConfig {
  total_time: number // minutes
  sections?: Array<{
    name: string
    time: number // minutes
    questions?: number
    break_time?: number
  }>
  time_warnings?: number[] // minutes before time up
  [key: string]: any // Allow exam-specific timing rules
}

// Context7 DecA(I)de difficulty distribution pattern
export interface DifficultyMixConfig {
  easy: number // 0.0 to 1.0
  medium: number // 0.0 to 1.0
  hard: number // 0.0 to 1.0
}

// ============================================================================
// EXAM CATEGORIES (HIERARCHICAL)
// ============================================================================

export interface ExamCategory extends MultiTenantEntity {
  exam_type_id: string
  name: string // 'Logical Reasoning', 'Reading Comprehension'
  slug: string
  description?: string
  
  // Hierarchical structure
  parent_category_id?: string
  sort_order: number
  
  // Blueprint configuration (DecA(I)de pattern)
  blueprint_config: BlueprintConfig
  
  // Performance indicators / standards
  performance_indicators: PerformanceIndicator[]
  
  // Metadata
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlueprintConfig {
  [level: string]: number // e.g., "district": 15, "association": 18, "national": 25
}

export interface PerformanceIndicator {
  code: string // 'LR:001', 'RC:003', etc.
  description: string
  cognitive_level?: 'recall' | 'application' | 'analysis' | 'synthesis'
}

// ============================================================================
// UNIVERSAL QUESTION SYSTEM
// ============================================================================

export interface QuestionUniversal extends MultiTenantEntity {
  // Exam association
  exam_type_id: string
  category_id: string
  
  // Content
  content: string
  question_type: string // flexible, not constrained to LSAT types
  subtype?: string
  
  // Difficulty and performance
  difficulty: number // 1-10
  difficulty_level: 'easy' | 'medium' | 'hard'
  estimated_time?: number // seconds
  cognitive_level?: 'recall' | 'application' | 'analysis' | 'synthesis'
  
  // Answers and explanations
  correct_answer: string
  answer_choices: any[] // flexible structure for different question types
  explanation: string
  
  // Categorization and tagging
  concept_tags: string[]
  performance_indicators: string[] // PI codes like "LR:001"
  
  // Metadata
  source_attribution?: string
  created_at: string
  updated_at: string
  is_active: boolean
  
  // Analytics
  usage_count: number
  avg_response_time?: number // milliseconds
  accuracy_rate?: number // 0.0 to 1.0
}

// ============================================================================
// USER EXAM PROGRESS (MULTI-EXAM SUPPORT)
// ============================================================================

export interface UserExamRegistration extends MultiTenantEntity {
  user_id: string
  exam_type_id: string
  
  // Goals and preferences
  target_score?: number
  target_test_date?: string
  preparation_level: 'beginner' | 'intermediate' | 'advanced'
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  registered_at: string
  
  // Progress tracking
  current_score?: number
  sessions_completed: number
  total_study_time: number // minutes
  
  // Preferences
  preferences: ExamPreferences
}

export interface ExamPreferences {
  difficulty_preference?: 'easy' | 'medium' | 'hard' | 'adaptive'
  session_length?: number // minutes
  break_reminders?: boolean
  sound_enabled?: boolean
  [key: string]: any // Allow exam-specific preferences
}

// ============================================================================
// ENHANCED GAME SESSIONS
// ============================================================================

export interface GameSessionUniversal extends MultiTenantEntity {
  // User and exam context
  user_id: string
  exam_type_id: string
  category_id?: string // specific category being practiced
  
  // Session details
  session_type: 'survival_mode' | 'practice' | 'timed_test' | 'diagnostic'
  started_at: string
  ended_at?: string
  
  // Performance metrics
  final_score: number
  questions_answered: number
  correct_answers: number
  lives_remaining: number
  difficulty_level: number
  
  // Session configuration and data
  session_config: SessionConfig
  session_data: Record<string, any> // game state, power-ups, etc.
}

export interface SessionConfig {
  time_limit?: number // minutes
  question_count?: number
  difficulty_mix?: DifficultyMixConfig
  categories?: string[] // category IDs to include
  randomize_questions?: boolean
  show_explanations?: boolean
  [key: string]: any // Allow exam-specific configuration
}

// ============================================================================
// ENHANCED QUESTION ATTEMPTS
// ============================================================================

export interface QuestionAttemptUniversal extends MultiTenantEntity {
  // Context
  user_id: string
  question_id: string
  session_id?: string
  exam_type_id: string
  category_id?: string
  
  // Attempt details
  selected_answer: string
  is_correct: boolean
  response_time?: number // milliseconds
  attempted_at: string
  
  // Additional tracking
  hint_used: boolean
  difficulty_at_attempt?: number
  confidence_level?: number // 1-5 scale
}

// ============================================================================
// ENHANCED ANALYTICS
// ============================================================================

export interface UserAnalyticsUniversal extends MultiTenantEntity {
  // Context
  user_id: string
  exam_type_id?: string // NULL for cross-exam analytics
  category_id?: string // NULL for exam-wide analytics
  
  // Metric information
  metric_type: string // 'daily_stats', 'exam_progress', 'category_performance'
  metric_data: any
  date_recorded: string
  created_at: string
}

// Specific analytics data structures
export interface ExamProgressMetrics {
  accuracy_rate: number
  avg_response_time: number
  questions_attempted: number
  study_streak: number
  difficulty_distribution: DifficultyMixConfig
  category_breakdown: Record<string, {
    accuracy: number
    time_spent: number
    questions_answered: number
  }>
}

export interface CategoryPerformanceMetrics {
  category_id: string
  category_name: string
  accuracy_rate: number
  avg_response_time: number
  questions_attempted: number
  difficulty_trend: Array<{
    difficulty: 'easy' | 'medium' | 'hard'
    accuracy: number
    count: number
  }>
  performance_indicators: Record<string, {
    code: string
    accuracy: number
    attempts: number
  }>
}

export interface DailyStatsMetrics {
  date: string
  study_time: number // minutes
  questions_answered: number
  accuracy_rate: number
  exams_practiced: string[] // exam type IDs
  categories_practiced: string[] // category IDs
  achievements_unlocked?: string[]
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Exam system configuration for tenant setup
export interface ExamSystemConfig {
  enabled_exams: string[] // exam type slugs
  default_difficulty_mix: DifficultyMixConfig
  session_defaults: SessionConfig
  analytics_retention_days: number
}

// Cross-exam recommendations (for Epic 2 AI features)
export interface CrossExamRecommendation {
  from_exam: string // exam type slug
  to_exam: string // exam type slug
  skill_overlap: number // 0.0 to 1.0
  recommended_categories: string[] // category IDs
  reasoning: string
}

// Exam preparation plan
export interface ExamPrepPlan {
  user_id: string
  exam_type_id: string
  target_score: number
  target_date: string
  current_level: 'beginner' | 'intermediate' | 'advanced'
  weekly_schedule: Array<{
    day: string
    duration: number // minutes
    categories: string[]
    session_type: GameSessionUniversal['session_type']
  }>
  milestones: Array<{
    date: string
    target_score: number
    categories_to_master: string[]
  }>
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateExamTypeRequest {
  name: string
  slug: string
  description?: string
  scoring_config: ExamScoringConfig
  timing_config: ExamTimingConfig
  difficulty_mix?: DifficultyMixConfig
}

export interface CreateExamCategoryRequest {
  exam_type_id: string
  name: string
  slug: string
  description?: string
  parent_category_id?: string
  blueprint_config: BlueprintConfig
  performance_indicators: PerformanceIndicator[]
}

export interface StartSessionRequest {
  exam_type_id: string
  category_id?: string
  session_type: GameSessionUniversal['session_type']
  session_config?: Partial<SessionConfig>
}

export interface ExamStatsResponse {
  exam_registrations: UserExamRegistration[]
  recent_sessions: GameSessionUniversal[]
  performance_summary: Record<string, ExamProgressMetrics>
  recommendations: CrossExamRecommendation[]
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidExamType(obj: any): obj is ExamType {
  return obj && 
         typeof obj.name === 'string' &&
         typeof obj.slug === 'string' &&
         obj.scoring_config &&
         obj.timing_config &&
         obj.difficulty_mix
}

export function isValidQuestionUniversal(obj: any): obj is QuestionUniversal {
  return obj &&
         typeof obj.exam_type_id === 'string' &&
         typeof obj.category_id === 'string' &&
         typeof obj.content === 'string' &&
         typeof obj.difficulty === 'number' &&
         obj.difficulty >= 1 && obj.difficulty <= 10
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const
export const SESSION_TYPES = ['survival_mode', 'practice', 'timed_test', 'diagnostic'] as const
export const PREPARATION_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export const COGNITIVE_LEVELS = ['recall', 'application', 'analysis', 'synthesis'] as const

// Default configurations
export const DEFAULT_DIFFICULTY_MIX: DifficultyMixConfig = {
  easy: 0.4,
  medium: 0.4,
  hard: 0.2
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  time_limit: 35, // minutes
  question_count: 25,
  difficulty_mix: DEFAULT_DIFFICULTY_MIX,
  randomize_questions: true,
  show_explanations: true
}