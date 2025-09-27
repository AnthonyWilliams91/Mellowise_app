/**
 * MELLOWISE-032: Performance Optimization Type Definitions
 *
 * Comprehensive performance monitoring, optimization, and recovery system
 * with Core Web Vitals tracking, caching layers, error recovery, and A/B testing
 *
 * @epic Epic 4 - Enterprise & Institutional Tools
 * @card MELLOWISE-032
 * @version 1.0.0
 */

import { MultiTenantEntity } from './tenant'

// ===============================
// Core Web Vitals Types
// ===============================

/**
 * Core Web Vitals metrics as defined by Google
 */
export interface CoreWebVitalsMetrics {
  // Largest Contentful Paint - loading performance
  lcp: number
  lcp_rating: 'good' | 'needs-improvement' | 'poor'

  // First Input Delay - interactivity
  fid: number
  fid_rating: 'good' | 'needs-improvement' | 'poor'

  // Cumulative Layout Shift - visual stability
  cls: number
  cls_rating: 'good' | 'needs-improvement' | 'poor'

  // Time to First Byte - server response time
  ttfb: number
  ttfb_rating: 'good' | 'needs-improvement' | 'poor'

  // First Contentful Paint
  fcp: number
  fcp_rating: 'good' | 'needs-improvement' | 'poor'

  // Interaction to Next Paint
  inp: number
  inp_rating: 'good' | 'needs-improvement' | 'poor'
}

/**
 * Performance measurement entry
 */
export interface PerformanceMeasurement extends MultiTenantEntity {
  user_id: string
  session_id: string
  page_path: string
  device_type: 'mobile' | 'tablet' | 'desktop'
  connection_type: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown'

  // Core Web Vitals
  core_web_vitals: CoreWebVitalsMetrics

  // Additional performance metrics
  dom_content_loaded: number
  window_load: number
  total_blocking_time: number
  speed_index: number

  // Navigation timing
  navigation_type: 'navigate' | 'reload' | 'back_forward' | 'prerender'
  navigation_start: number
  fetch_start: number
  domain_lookup_start: number
  domain_lookup_end: number
  connect_start: number
  connect_end: number
  request_start: number
  response_start: number
  response_end: number

  // Resource timing
  resource_count: number
  resource_size: number
  cache_hit_ratio: number

  // Custom timing marks
  custom_metrics: Record<string, number>

  // Browser and device info
  user_agent: string
  viewport_width: number
  viewport_height: number

  measured_at: string
  created_at: string
}

// ===============================
// Caching System Types
// ===============================

/**
 * Cache configuration for different data types
 */
export interface CacheConfig {
  key: string
  ttl: number // Time to live in seconds
  max_size: number // Maximum cache size in bytes
  compression: boolean
  encryption: boolean
  invalidation_strategy: 'ttl' | 'manual' | 'dependency' | 'pattern'
  tags: string[]
}

/**
 * Cache entry metadata
 */
export interface CacheEntry {
  key: string
  value: any
  size: number
  created_at: string
  expires_at: string
  access_count: number
  last_accessed: string
  tags: string[]
  hit_ratio: number
  compression_ratio?: number
}

/**
 * Cache statistics
 */
export interface CacheStats {
  tenant_id: string
  cache_type: 'memory' | 'redis' | 'cdn' | 'browser'
  total_entries: number
  total_size: number
  hit_rate: number
  miss_rate: number
  eviction_rate: number
  average_response_time: number
  peak_memory_usage: number
  stats_period_start: string
  stats_period_end: string
  recorded_at: string
}

/**
 * Cache invalidation request
 */
export interface CacheInvalidationRequest {
  tenant_id: string
  strategy: 'key' | 'pattern' | 'tag' | 'all'
  keys?: string[]
  patterns?: string[]
  tags?: string[]
  cascade: boolean
  reason: string
  initiated_by: string
}

// ===============================
// Lazy Loading System Types
// ===============================

/**
 * Lazy loading configuration
 */
export interface LazyLoadConfig {
  root_margin: string // CSS margin string for intersection observer
  threshold: number | number[] // Visibility thresholds
  loading_placeholder: 'skeleton' | 'spinner' | 'blur' | 'custom'
  fade_in_duration: number // Animation duration in ms
  retry_attempts: number
  retry_delay: number // Delay between retries in ms
}

/**
 * Lazy loading element state
 */
export interface LazyLoadElement {
  id: string
  element_type: 'image' | 'component' | 'iframe' | 'video' | 'script'
  src: string
  placeholder?: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  is_visible: boolean
  is_loaded: boolean
  is_loading: boolean
  has_error: boolean
  load_time?: number
  retry_count: number
  intersection_ratio?: number
  load_strategy: 'intersection' | 'viewport' | 'hover' | 'click'
}

/**
 * Lazy loading performance metrics
 */
export interface LazyLoadMetrics extends MultiTenantEntity {
  user_id: string
  session_id: string
  page_path: string

  total_elements: number
  loaded_elements: number
  failed_elements: number
  average_load_time: number
  total_data_saved: number // Bytes saved by lazy loading

  performance_impact: {
    initial_page_load_improvement: number
    bandwidth_saved: number
    memory_saved: number
    cpu_usage_reduction: number
  }

  recorded_at: string
}

// ===============================
// Error Recovery System Types
// ===============================

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Error categories
 */
export type ErrorCategory =
  | 'javascript' | 'network' | 'performance' | 'security'
  | 'accessibility' | 'compatibility' | 'user_experience'
  | 'data_integrity' | 'authentication' | 'authorization'

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  id: string
  name: string
  error_pattern: string // Regex pattern to match errors
  category: ErrorCategory
  priority: number

  recovery_actions: {
    retry: boolean
    max_retries: number
    retry_delay: number
    fallback_action?: string
    user_notification?: string
    automatic_recovery: boolean
    escalation_threshold: number
  }

  conditions: {
    user_context?: string[]
    device_types?: string[]
    browser_versions?: string[]
    feature_flags?: string[]
  }

  created_at: string
  updated_at: string
  is_active: boolean
}

/**
 * Error occurrence record
 */
export interface ErrorOccurrence extends MultiTenantEntity {
  user_id?: string
  session_id?: string

  // Error details
  message: string
  stack_trace?: string
  error_type: string
  file_name?: string
  line_number?: number
  column_number?: number

  // Context
  page_path: string
  user_agent: string
  timestamp: string

  // Classification
  category: ErrorCategory
  severity: ErrorSeverity
  is_user_facing: boolean

  // Recovery attempt
  recovery_strategy_id?: string
  recovery_attempted: boolean
  recovery_successful?: boolean
  recovery_duration?: number

  // Additional context
  user_context: Record<string, any>
  system_context: Record<string, any>
  custom_data?: Record<string, any>

  created_at: string
}

/**
 * Error recovery metrics
 */
export interface ErrorRecoveryMetrics extends MultiTenantEntity {
  date: string

  // Error statistics
  total_errors: number
  recovered_errors: number
  unrecovered_errors: number
  recovery_success_rate: number

  // By category
  category_breakdown: Record<ErrorCategory, number>
  severity_breakdown: Record<ErrorSeverity, number>

  // Recovery performance
  average_recovery_time: number
  fastest_recovery_time: number
  slowest_recovery_time: number

  // User impact
  affected_users: number
  affected_sessions: number
  user_experience_impact_score: number

  recorded_at: string
}

// ===============================
// Session Management Types
// ===============================

/**
 * Enhanced session state
 */
export interface SessionState {
  session_id: string
  user_id: string
  tenant_id: string

  // Session lifecycle
  started_at: string
  last_activity: string
  expires_at: string
  is_active: boolean

  // Performance context
  device_info: {
    type: 'mobile' | 'tablet' | 'desktop'
    os: string
    browser: string
    version: string
    memory_gb?: number
    cpu_cores?: number
    connection_type: string
    bandwidth_estimate?: number
  }

  // User preferences
  accessibility_settings: {
    high_contrast: boolean
    reduced_motion: boolean
    screen_reader: boolean
    font_size_scale: number
    voice_enabled: boolean
  }

  // Performance optimizations
  cache_preferences: Record<string, any>
  lazy_loading_enabled: boolean
  image_quality_preference: 'auto' | 'low' | 'medium' | 'high'

  // Error recovery context
  error_recovery_enabled: boolean
  error_threshold: number
  recovery_preferences: Record<string, any>

  // A/B testing assignments
  ab_test_assignments: Record<string, string>
  feature_flags: Record<string, boolean>
}

/**
 * Session recovery data
 */
export interface SessionRecoveryData {
  session_id: string
  user_id: string
  tenant_id: string

  // Recovery state
  recovery_point: string
  page_state: Record<string, any>
  form_data: Record<string, any>
  scroll_position: number
  user_selections: Record<string, any>

  // Metadata
  created_at: string
  expires_at: string
  recovery_trigger: 'error' | 'crash' | 'timeout' | 'manual'
}

// ===============================
// A/B Testing System Types
// ===============================

/**
 * A/B test experiment configuration
 */
export interface ABTestExperiment extends MultiTenantEntity {
  name: string
  description: string
  hypothesis: string

  // Test configuration
  test_key: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  traffic_allocation: number // Percentage of users to include

  // Variants
  variants: ABTestVariant[]

  // Targeting
  target_criteria: {
    user_segments?: string[]
    device_types?: string[]
    browsers?: string[]
    locations?: string[]
    subscription_tiers?: string[]
    feature_flags?: Record<string, boolean>
  }

  // Goals and metrics
  primary_metric: string
  secondary_metrics: string[]
  success_criteria: {
    metric: string
    threshold: number
    direction: 'increase' | 'decrease'
  }[]

  // Timeline
  start_date: string
  end_date?: string
  duration_days?: number

  // Statistical settings
  confidence_level: number // e.g., 0.95 for 95%
  minimum_sample_size: number
  power: number // Statistical power
  mde: number // Minimum detectable effect

  created_by: string
  created_at: string
  updated_at: string
}

/**
 * A/B test variant
 */
export interface ABTestVariant {
  id: string
  name: string
  description: string
  traffic_percentage: number
  is_control: boolean

  // Configuration
  config: Record<string, any>
  feature_flags: Record<string, boolean>

  // Results
  participants: number
  conversions: number
  conversion_rate: number

  created_at: string
}

/**
 * A/B test assignment
 */
export interface ABTestAssignment extends MultiTenantEntity {
  user_id: string
  experiment_id: string
  variant_id: string

  assigned_at: string
  first_exposure_at?: string
  last_exposure_at?: string

  // Tracking
  exposures: number
  conversions: number

  // User context at assignment
  user_segment?: string
  device_type: string
  browser: string
  location?: string
}

/**
 * A/B test event tracking
 */
export interface ABTestEvent extends MultiTenantEntity {
  user_id: string
  session_id: string
  experiment_id: string
  variant_id: string

  event_type: 'exposure' | 'conversion' | 'custom'
  event_name: string

  // Event data
  properties: Record<string, any>
  value?: number

  // Context
  page_path: string
  timestamp: string

  created_at: string
}

/**
 * A/B test results
 */
export interface ABTestResults extends MultiTenantEntity {
  experiment_id: string

  // Overall statistics
  total_participants: number
  total_conversions: number
  overall_conversion_rate: number

  // Variant performance
  variant_results: {
    variant_id: string
    variant_name: string
    participants: number
    conversions: number
    conversion_rate: number
    confidence_interval: [number, number]
    statistical_significance: number
    p_value: number
  }[]

  // Winner determination
  winning_variant?: string
  confidence_level: number
  is_statistically_significant: boolean

  // Detailed metrics
  metrics: Record<string, {
    control_value: number
    variant_values: Record<string, number>
    relative_change: Record<string, number>
    absolute_change: Record<string, number>
  }>

  // Analysis period
  analysis_start: string
  analysis_end: string
  generated_at: string
}

// ===============================
// Performance Monitoring Config
// ===============================

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitoringConfig extends MultiTenantEntity {
  // Monitoring settings
  core_web_vitals_enabled: boolean
  real_user_monitoring: boolean
  synthetic_monitoring: boolean

  // Thresholds
  performance_thresholds: {
    lcp_threshold: number
    fid_threshold: number
    cls_threshold: number
    ttfb_threshold: number
  }

  // Sampling
  sampling_rate: number // 0-1
  error_sampling_rate: number

  // Alerts
  alert_thresholds: {
    error_rate: number
    performance_degradation: number
    uptime_percentage: number
  }

  alert_recipients: string[]

  // Data retention
  metrics_retention_days: number
  error_retention_days: number

  created_at: string
  updated_at: string
}

// ===============================
// Utility Types and Enums
// ===============================

/**
 * Performance optimization status
 */
export type OptimizationStatus = 'analyzing' | 'optimizing' | 'completed' | 'failed'

/**
 * Cache strategies
 */
export type CacheStrategy =
  | 'cache-first' | 'network-first' | 'cache-only' | 'network-only'
  | 'stale-while-revalidate' | 'cache-with-network-fallback'

/**
 * Performance optimization recommendation
 */
export interface PerformanceRecommendation extends MultiTenantEntity {
  recommendation_type: 'caching' | 'lazy-loading' | 'code-splitting' | 'image-optimization' | 'cdn'
  priority: 'low' | 'medium' | 'high' | 'critical'

  title: string
  description: string
  impact_estimate: {
    performance_gain: number // Percentage improvement
    implementation_effort: 'low' | 'medium' | 'high'
    estimated_savings: number // Bytes or milliseconds
  }

  implementation_steps: string[]
  code_examples?: Record<string, string>

  status: 'pending' | 'in-progress' | 'completed' | 'dismissed'

  generated_at: string
  implemented_at?: string

  // Metrics tracking
  before_metrics?: Partial<CoreWebVitalsMetrics>
  after_metrics?: Partial<CoreWebVitalsMetrics>
  actual_improvement?: number
}

/**
 * Performance budget
 */
export interface PerformanceBudget extends MultiTenantEntity {
  name: string
  description: string

  // Budget constraints
  max_bundle_size: number // KB
  max_image_size: number // KB
  max_font_size: number // KB
  max_requests: number
  max_load_time: number // ms

  // Core Web Vitals budgets
  lcp_budget: number
  fid_budget: number
  cls_budget: number

  // Alerts
  alert_on_breach: boolean
  alert_threshold: number // Percentage over budget

  status: 'active' | 'paused'

  created_at: string
  updated_at: string
}

// ===============================
// Request/Response Types
// ===============================

export interface PerformanceMetricsRequest {
  tenant_id: string
  user_id?: string
  session_id?: string
  start_date?: string
  end_date?: string
  page_paths?: string[]
  device_types?: string[]
  metrics?: string[]
}

export interface PerformanceMetricsResponse {
  metrics: PerformanceMeasurement[]
  summary: {
    total_measurements: number
    average_lcp: number
    average_fid: number
    average_cls: number
    performance_score: number
  }
  trends: Record<string, number[]>
  recommendations: PerformanceRecommendation[]
}

export interface CacheOperationRequest {
  tenant_id: string
  operation: 'get' | 'set' | 'delete' | 'clear' | 'stats'
  key?: string
  value?: any
  ttl?: number
  tags?: string[]
}

export interface CacheOperationResponse {
  success: boolean
  data?: any
  stats?: CacheStats
  error?: string
}

export interface ErrorRecoveryRequest {
  tenant_id: string
  error: ErrorOccurrence
  strategy_id?: string
  user_context?: Record<string, any>
}

export interface ErrorRecoveryResponse {
  success: boolean
  strategy_applied?: ErrorRecoveryStrategy
  recovery_actions: string[]
  estimated_recovery_time?: number
  user_message?: string
}

export interface ABTestAssignmentRequest {
  tenant_id: string
  user_id: string
  experiment_key: string
  user_context?: Record<string, any>
}

export interface ABTestAssignmentResponse {
  experiment_id: string
  variant_id: string
  variant_config: Record<string, any>
  feature_flags: Record<string, boolean>
  assignment_id: string
}

// ===============================
// Constants
// ===============================

export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 },   // ms
  CLS: { good: 0.1, poor: 0.25 },  // unitless
  TTFB: { good: 800, poor: 1800 }, // ms
  FCP: { good: 1800, poor: 3000 }, // ms
  INP: { good: 200, poor: 500 }    // ms
} as const

export const DEFAULT_CACHE_CONFIG: Partial<CacheConfig> = {
  ttl: 3600, // 1 hour
  max_size: 50 * 1024 * 1024, // 50MB
  compression: true,
  encryption: false,
  invalidation_strategy: 'ttl'
} as const

export const ERROR_SEVERITY_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 4,
  critical: 8
} as const

export const LAZY_LOAD_DEFAULTS: LazyLoadConfig = {
  root_margin: '50px',
  threshold: 0.1,
  loading_placeholder: 'skeleton',
  fade_in_duration: 300,
  retry_attempts: 3,
  retry_delay: 1000
} as const

// ===============================
// Type Guards
// ===============================

export function isPerformanceMeasurement(obj: any): obj is PerformanceMeasurement {
  return obj && typeof obj === 'object' &&
         obj.core_web_vitals &&
         typeof obj.lcp === 'number'
}

export function isErrorOccurrence(obj: any): obj is ErrorOccurrence {
  return obj && typeof obj === 'object' &&
         typeof obj.message === 'string' &&
         typeof obj.category === 'string' &&
         typeof obj.severity === 'string'
}

export function isABTestExperiment(obj: any): obj is ABTestExperiment {
  return obj && typeof obj === 'object' &&
         typeof obj.test_key === 'string' &&
         Array.isArray(obj.variants) &&
         typeof obj.status === 'string'
}

// ===============================
// Helper Functions
// ===============================

export function calculatePerformanceScore(metrics: CoreWebVitalsMetrics): number {
  const weights = { lcp: 0.3, fid: 0.3, cls: 0.3, ttfb: 0.1 }
  const scores = {
    lcp: metrics.lcp_rating === 'good' ? 100 : metrics.lcp_rating === 'needs-improvement' ? 50 : 0,
    fid: metrics.fid_rating === 'good' ? 100 : metrics.fid_rating === 'needs-improvement' ? 50 : 0,
    cls: metrics.cls_rating === 'good' ? 100 : metrics.cls_rating === 'needs-improvement' ? 50 : 0,
    ttfb: metrics.ttfb_rating === 'good' ? 100 : metrics.ttfb_rating === 'needs-improvement' ? 50 : 0
  }

  return Math.round(
    scores.lcp * weights.lcp +
    scores.fid * weights.fid +
    scores.cls * weights.cls +
    scores.ttfb * weights.ttfb
  )
}

export function getCacheKeyWithTenant(tenant_id: string, key: string): string {
  return `tenant:${tenant_id}:${key}`
}

export function generateABTestKey(experiment_name: string, tenant_id: string): string {
  return `ab_test:${tenant_id}:${experiment_name.toLowerCase().replace(/\s+/g, '_')}`
}