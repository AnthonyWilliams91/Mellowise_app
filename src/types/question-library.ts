/**
 * MELLOWISE-017: Full LSAT Question Library Implementation
 * Enhanced TypeScript Type Definitions for Comprehensive Question Management
 *
 * @epic Epic 3.1 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-18
 * @dependencies universal-exam.ts
 */

import type { MultiTenantEntity } from './tenant'
import type { QuestionUniversal } from './universal-exam'

// ============================================================================
// QUESTION VERSIONING AND AUDIT TRAIL
// ============================================================================

export interface QuestionVersion extends MultiTenantEntity {
  question_id: string
  version_number: number

  // Version metadata
  created_by?: string
  created_at: string
  change_reason?: string
  change_type: 'create' | 'edit' | 'quality_update' | 'correction'

  // Snapshot of question content at this version
  content: string
  question_type: string
  subtype?: string
  difficulty: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  estimated_time?: number
  cognitive_level?: 'recall' | 'application' | 'analysis' | 'synthesis'
  correct_answer: string
  answer_choices: AnswerChoice[]
  explanation: string
  concept_tags: string[]
  performance_indicators: string[]
  source_attribution?: string

  // Quality metrics at time of version
  quality_score: number
  community_rating: number
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
}

export interface AnswerChoice {
  id: string
  text: string
  is_correct?: boolean
  explanation?: string
}

// ============================================================================
// QUESTION RELATIONSHIPS AND CROSS-REFERENCES
// ============================================================================

export interface QuestionCrossReference extends MultiTenantEntity {
  source_question_id: string
  target_question_id: string

  // Relationship metadata
  relationship_type: RelationshipType
  strength: number // 0.0 to 1.0
  created_by?: string
  created_at: string
  is_bidirectional: boolean
}

export type RelationshipType =
  | 'similar_concept'
  | 'prerequisite'
  | 'follow_up'
  | 'parallel_structure'
  | 'increasing_difficulty'
  | 'same_skill'
  | 'complementary'

export interface RelatedQuestion {
  question_id: string
  relationship_type: RelationshipType
  strength: number
  preview_text: string
  difficulty: number
  category_name: string
}

// ============================================================================
// QUESTION FEEDBACK AND QUALITY SYSTEM
// ============================================================================

export interface QuestionFeedback extends MultiTenantEntity {
  question_id: string
  user_id: string

  // Feedback details
  rating: number // 1-5 scale
  feedback_type: FeedbackType
  feedback_text?: string
  suggested_improvement?: string

  // Verification metadata
  created_at: string
  is_verified: boolean
  verified_by?: string
  verified_at?: string
}

export type FeedbackType =
  | 'quality'
  | 'difficulty'
  | 'clarity'
  | 'error_report'
  | 'explanation_quality'
  | 'answer_accuracy'

export interface FeedbackSummary {
  average_rating: number
  total_feedback: number
  rating_distribution: Record<string, number>
  recent_feedback: QuestionFeedback[]
  common_issues: Array<{
    feedback_type: FeedbackType
    count: number
    sample_comments: string[]
  }>
}

// ============================================================================
// ENHANCED QUESTION METADATA
// ============================================================================

export interface EnhancedQuestionUniversal extends QuestionUniversal {
  // Versioning
  version_number: number
  parent_version_id?: string
  is_latest_version: boolean

  // Quality and review metadata
  quality_score: number // 0.0 to 10.0
  community_rating: number // 0.0 to 5.0
  rating_count: number
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision'

  // Advanced categorization
  subtopic?: string
  skill_level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
  bloom_taxonomy: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'

  // Source and authorship
  created_by?: string
  last_modified_by?: string
  license_type: string
  copyright_notice?: string

  // Enhanced usage analytics
  first_used_at?: string
  last_used_at?: string
  success_rate: number // 0.0 to 1.0
  avg_difficulty_rating?: number

  // Import and validation metadata
  import_batch_id?: string
  validation_status: 'pending' | 'validated' | 'failed' | 'manual_review'
  validation_errors: ValidationError[]
}

export interface ValidationError {
  field: string
  error_code: string
  message: string
  severity: 'warning' | 'error' | 'critical'
  suggested_fix?: string
}

// ============================================================================
// BULK IMPORT SYSTEM
// ============================================================================

export interface QuestionImportBatch extends MultiTenantEntity {
  // Batch metadata
  batch_name: string
  source_file_name?: string
  source_file_size?: number
  source_format: 'csv' | 'json' | 'xml' | 'xlsx'

  // Import process tracking
  total_rows: number
  processed_rows: number
  successful_imports: number
  failed_imports: number
  validation_errors: ImportValidationError[]

  // Import status and timing
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string

  // User tracking
  imported_by: string

  // Configuration used for import
  import_config: ImportConfig
}

export interface ImportConfig {
  // File processing options
  skip_header_row: boolean
  delimiter: string
  encoding: string

  // Validation options
  strict_validation: boolean
  auto_fix_minor_issues: boolean
  duplicate_handling: 'skip' | 'update' | 'create_version'

  // Quality requirements
  min_quality_score: number
  require_explanation: boolean
  require_source_attribution: boolean

  // Assignment options
  default_exam_type?: string
  default_category?: string
  default_skill_level?: string
  assigned_author?: string
}

export interface ImportValidationError {
  row_number?: number
  error_code: string
  error_message: string
  field_name?: string
  field_value?: string
  suggested_fix?: string
  severity: 'warning' | 'error' | 'critical'
  raw_data?: Record<string, any>
}

export interface QuestionImportError extends MultiTenantEntity {
  batch_id: string

  // Error details
  row_number?: number
  error_code: string
  error_message: string
  field_name?: string
  field_value?: string
  suggested_fix?: string

  // Raw data for manual review
  raw_data?: Record<string, any>

  // Error metadata
  severity: 'warning' | 'error' | 'critical'
  created_at: string
  resolved: boolean
  resolved_by?: string
  resolved_at?: string
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

export interface QuestionSearchFilters {
  // Basic filters
  exam_type_slug?: string
  category_slug?: string
  difficulty_min?: number
  difficulty_max?: number

  // Advanced filters
  skill_levels?: string[]
  concept_tags?: string[]
  bloom_taxonomy_levels?: string[]
  cognitive_levels?: string[]

  // Quality filters
  min_quality_score?: number
  min_community_rating?: number
  min_usage_count?: number
  max_usage_count?: number

  // Content filters
  search_text?: string
  question_types?: string[]
  has_explanation?: boolean
  has_source_attribution?: boolean

  // Status filters
  review_status?: string[]
  validation_status?: string[]
  license_types?: string[]

  // Date filters
  created_after?: string
  created_before?: string
  last_used_after?: string
  last_used_before?: string

  // Pagination
  limit?: number
  offset?: number
  sort_by?: 'quality_score' | 'community_rating' | 'usage_count' | 'difficulty' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

export interface QuestionSearchResult {
  questions: EnhancedQuestionUniversal[]
  total_count: number
  filtered_count: number
  facets: SearchFacets
  pagination: {
    current_page: number
    total_pages: number
    page_size: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface SearchFacets {
  categories: Array<{ slug: string; name: string; count: number }>
  difficulty_levels: Array<{ level: string; count: number }>
  skill_levels: Array<{ level: string; count: number }>
  question_types: Array<{ type: string; count: number }>
  concept_tags: Array<{ tag: string; count: number }>
  quality_ranges: Array<{ range: string; count: number }>
}

// ============================================================================
// QUESTION ANALYTICS AND INSIGHTS
// ============================================================================

export interface QuestionAnalytics {
  question_id: string

  // Performance metrics
  total_attempts: number
  correct_attempts: number
  success_rate: number
  avg_response_time: number
  difficulty_perception: number // User-reported difficulty vs actual

  // Usage patterns
  usage_over_time: Array<{ date: string; attempts: number }>
  performance_by_skill_level: Record<string, { attempts: number; success_rate: number }>
  common_wrong_answers: Array<{ answer: string; count: number; percentage: number }>

  // Quality indicators
  community_feedback_trend: Array<{ date: string; avg_rating: number }>
  reported_issues: Array<{ issue_type: string; count: number }>
  improvement_suggestions: string[]
}

export interface LibraryAnalytics {
  // Overall statistics
  total_questions: number
  approved_questions: number
  pending_review: number
  quality_distribution: Record<string, number>

  // Usage statistics
  total_attempts_today: number
  most_used_questions: Array<{ question_id: string; content_preview: string; usage_count: number }>
  least_used_questions: Array<{ question_id: string; content_preview: string; usage_count: number }>

  // Quality insights
  highest_rated: Array<{ question_id: string; content_preview: string; rating: number }>
  needs_attention: Array<{ question_id: string; content_preview: string; issues: string[] }>
  recent_feedback: QuestionFeedback[]

  // Import statistics
  recent_imports: QuestionImportBatch[]
  import_success_rate: number
  common_import_errors: Array<{ error_code: string; count: number }>
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateQuestionRequest {
  exam_type_id: string
  category_id: string
  content: string
  question_type: string
  subtype?: string
  difficulty: number
  estimated_time?: number
  cognitive_level?: string
  correct_answer: string
  answer_choices: AnswerChoice[]
  explanation: string
  concept_tags?: string[]
  performance_indicators?: string[]
  source_attribution?: string
  skill_level?: string
  bloom_taxonomy?: string
  license_type?: string
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  change_reason?: string
  change_type?: 'edit' | 'quality_update' | 'correction'
}

export interface BulkImportRequest {
  batch_name: string
  file_content: string | File
  source_format: 'csv' | 'json' | 'xml' | 'xlsx'
  import_config: ImportConfig
}

export interface BulkImportResponse {
  batch_id: string
  status: string
  message: string
  preview?: {
    total_rows: number
    sample_data: Record<string, any>[]
    validation_warnings: ImportValidationError[]
  }
}

export interface QuestionFeedbackRequest {
  question_id: string
  rating: number
  feedback_type: FeedbackType
  feedback_text?: string
  suggested_improvement?: string
}

export interface AddRelationshipRequest {
  source_question_id: string
  target_question_id: string
  relationship_type: RelationshipType
  strength?: number
  is_bidirectional?: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface QuestionWithRelationships extends EnhancedQuestionUniversal {
  related_questions: RelatedQuestion[]
  feedback_summary: FeedbackSummary
  version_history: QuestionVersion[]
  analytics: QuestionAnalytics
}

export interface QuestionLibraryStats {
  by_category: Record<string, {
    total: number
    approved: number
    avg_quality: number
    avg_difficulty: number
  }>
  by_difficulty: Record<string, number>
  by_skill_level: Record<string, number>
  by_question_type: Record<string, number>
  quality_trends: Array<{ date: string; avg_quality: number }>
  usage_trends: Array<{ date: string; total_attempts: number }>
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidQuestionImportData(obj: any): obj is CreateQuestionRequest {
  return obj &&
         typeof obj.content === 'string' &&
         typeof obj.question_type === 'string' &&
         typeof obj.difficulty === 'number' &&
         obj.difficulty >= 1 && obj.difficulty <= 10 &&
         typeof obj.correct_answer === 'string' &&
         Array.isArray(obj.answer_choices) &&
         typeof obj.explanation === 'string'
}

export function isValidFeedbackData(obj: any): obj is QuestionFeedbackRequest {
  return obj &&
         typeof obj.question_id === 'string' &&
         typeof obj.rating === 'number' &&
         obj.rating >= 1 && obj.rating <= 5 &&
         typeof obj.feedback_type === 'string' &&
         ['quality', 'difficulty', 'clarity', 'error_report', 'explanation_quality', 'answer_accuracy'].includes(obj.feedback_type)
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  'similar_concept',
  'prerequisite',
  'follow_up',
  'parallel_structure',
  'increasing_difficulty',
  'same_skill',
  'complementary'
]

export const FEEDBACK_TYPES: FeedbackType[] = [
  'quality',
  'difficulty',
  'clarity',
  'error_report',
  'explanation_quality',
  'answer_accuracy'
]

export const SKILL_LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'] as const
export const BLOOM_TAXONOMY_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] as const
export const REVIEW_STATUSES = ['pending', 'approved', 'rejected', 'needs_revision'] as const
export const VALIDATION_STATUSES = ['pending', 'validated', 'failed', 'manual_review'] as const

// Default configurations
export const DEFAULT_IMPORT_CONFIG: ImportConfig = {
  skip_header_row: true,
  delimiter: ',',
  encoding: 'utf-8',
  strict_validation: true,
  auto_fix_minor_issues: true,
  duplicate_handling: 'skip',
  min_quality_score: 5.0,
  require_explanation: true,
  require_source_attribution: false
}

export const DEFAULT_SEARCH_FILTERS: QuestionSearchFilters = {
  difficulty_min: 1,
  difficulty_max: 10,
  min_quality_score: 0,
  min_community_rating: 0,
  limit: 25,
  offset: 0,
  sort_by: 'quality_score',
  sort_order: 'desc'
}