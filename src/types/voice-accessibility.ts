/**
 * MELLOWISE-031: Voice Interface & Accessibility Type Definitions
 *
 * Comprehensive voice interface system with Web Speech API integration,
 * text-to-speech engine, voice commands, and WCAG 2.1 AA compliance
 *
 * @epic Epic 4 - Enterprise & Institutional Tools
 * @card MELLOWISE-031
 * @version 1.0.0
 */

import { MultiTenantEntity } from './tenant'

// ===============================
// Web Speech API Types
// ===============================

/**
 * Speech recognition configuration
 */
export interface SpeechRecognitionConfig {
  // Basic settings
  language: string // BCP 47 language tag (e.g., 'en-US', 'es-ES')
  continuous: boolean
  interim_results: boolean
  max_alternatives: number

  // Confidence and accuracy
  confidence_threshold: number // 0-1
  noise_suppression: boolean
  echo_cancellation: boolean

  // Grammar and vocabulary
  grammar_rules?: string[]
  custom_vocabulary?: string[]
  domain_specific_terms?: Record<string, string[]>

  // Timeouts
  silence_timeout: number // ms
  recognition_timeout: number // ms
  phrase_timeout: number // ms
}

/**
 * Speech recognition result
 */
export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  is_final: boolean
  alternatives: {
    transcript: string
    confidence: number
  }[]

  // Timing
  start_time: number
  end_time: number
  duration: number

  // Context
  language_detected: string
  acoustic_confidence: number
  semantic_confidence?: number
}

/**
 * Voice command definition
 */
export interface VoiceCommand {
  id: string
  name: string
  patterns: string[] // Speech patterns that trigger this command
  aliases: string[] // Alternative phrases

  // Command configuration
  category: 'navigation' | 'interaction' | 'accessibility' | 'study' | 'system'
  scope: 'global' | 'page' | 'component' // Where the command is active
  priority: number // Higher priority commands take precedence

  // Execution
  action: string // Function name or action identifier
  parameters?: Record<string, any>
  confirmation_required: boolean

  // Accessibility
  description: string
  help_text: string
  keyboard_equivalent?: string

  // Conditions
  requires_authentication: boolean
  requires_premium: boolean
  device_types: ('mobile' | 'tablet' | 'desktop')[]
  browser_support: string[]

  created_at: string
  updated_at: string
  is_active: boolean
}

/**
 * Voice command execution result
 */
export interface VoiceCommandExecution extends MultiTenantEntity {
  user_id: string
  session_id: string
  command_id: string

  // Input
  spoken_text: string
  recognized_pattern: string
  confidence: number

  // Execution
  executed_at: string
  execution_duration: number
  success: boolean
  error_message?: string

  // Context
  page_path: string
  component_context?: string
  user_context: Record<string, any>

  // Results
  action_performed: string
  parameters_used: Record<string, any>
  user_feedback?: 'helpful' | 'not_helpful' | 'error'

  created_at: string
}

// ===============================
// Text-to-Speech Engine Types
// ===============================

/**
 * Text-to-speech configuration
 */
export interface TTSConfig {
  // Voice settings
  voice_id: string
  voice_name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  age: 'child' | 'young' | 'middle' | 'old'

  // Speech parameters
  rate: number // 0.1-10
  pitch: number // 0-2
  volume: number // 0-1
  voice_quality: 'standard' | 'premium' | 'neural'

  // Pronunciation
  pronunciation_rules: Record<string, string>
  emphasis_rules: Record<string, 'strong' | 'moderate' | 'reduced'>
  pause_rules: Record<string, number> // ms

  // SSML support
  ssml_enabled: boolean
  prosody_control: boolean
  phoneme_support: boolean

  // Interruption behavior
  interruptible: boolean
  queue_mode: 'replace' | 'append' | 'flush'
}

/**
 * Available voice
 */
export interface TTSVoice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  age: 'child' | 'young' | 'middle' | 'old'
  quality: 'standard' | 'premium' | 'neural'

  // Characteristics
  naturalness_score: number // 1-10
  clarity_score: number // 1-10
  expressiveness_score: number // 1-10

  // Support
  ssml_support: boolean
  emotion_support: string[] // ['happy', 'sad', 'excited', etc.]
  style_support: string[] // ['newscast', 'customerservice', etc.]

  // Availability
  is_default: boolean
  is_premium: boolean
  download_required: boolean
  offline_capable: boolean

  created_at: string
}

/**
 * Text-to-speech request
 */
export interface TTSRequest {
  text: string
  voice_id?: string
  language?: string

  // Override settings
  rate?: number
  pitch?: number
  volume?: number

  // SSML options
  use_ssml: boolean
  emotion?: string
  style?: string

  // Context for optimization
  text_type: 'question' | 'answer' | 'explanation' | 'instruction' | 'feedback'
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Caching
  cache_key?: string
  cache_duration?: number
}

/**
 * Text-to-speech response
 */
export interface TTSResponse {
  audio_url?: string
  audio_data?: ArrayBuffer
  duration: number // seconds

  // Generation info
  voice_used: string
  language_used: string
  processing_time: number

  // Caching
  cached: boolean
  cache_key?: string
  expires_at?: string

  // Quality metrics
  naturalness_score?: number
  pronunciation_accuracy?: number

  error?: string
  warnings?: string[]
}

/**
 * Speech synthesis queue item
 */
export interface SpeechQueueItem {
  id: string
  text: string
  config: Partial<TTSConfig>
  priority: number

  // State
  status: 'queued' | 'processing' | 'speaking' | 'completed' | 'error' | 'cancelled'
  created_at: string
  started_at?: string
  completed_at?: string

  // Context
  source: 'user_request' | 'accessibility' | 'notification' | 'system'
  interruption_allowed: boolean

  // Callbacks
  on_start?: () => void
  on_end?: () => void
  on_error?: (error: string) => void
}

// ===============================
// Accessibility Compliance Types
// ===============================

/**
 * WCAG 2.1 guideline levels
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA'

/**
 * WCAG principle categories
 */
export type WCAGPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust'

/**
 * Accessibility compliance check
 */
export interface AccessibilityCheck {
  id: string
  guideline: string // WCAG guideline number (e.g., '1.3.1')
  principle: WCAGPrinciple
  level: WCAGLevel

  title: string
  description: string
  how_to_fix: string[]

  // Test details
  selector?: string // CSS selector for element-specific checks
  test_function: string // Function to run the check
  automated: boolean

  // Severity
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  confidence: 'low' | 'medium' | 'high'

  // Context
  applies_to: string[] // Component types or page types
  browser_support: Record<string, boolean>

  created_at: string
  updated_at: string
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAuditResult extends MultiTenantEntity {
  page_path: string
  audit_type: 'automated' | 'manual' | 'combined'
  wcag_level: WCAGLevel

  // Overall results
  total_checks: number
  passed_checks: number
  failed_checks: number
  warnings: number

  compliance_score: number // 0-100
  accessibility_score: number // 0-100

  // Detailed results
  violations: AccessibilityViolation[]
  warnings_list: AccessibilityWarning[]
  passed_checks_list: string[]

  // Performance impact
  audit_duration: number
  performance_impact: number

  // Recommendations
  priority_fixes: AccessibilityRecommendation[]
  estimated_fix_time: number // hours

  audited_at: string
  auditor: 'automated' | string // User ID for manual audits
}

/**
 * Accessibility violation
 */
export interface AccessibilityViolation {
  id: string
  guideline: string
  principle: WCAGPrinciple
  level: WCAGLevel

  description: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  confidence: 'low' | 'medium' | 'high'

  // Element details
  selector: string
  element_html: string
  element_text: string

  // Fix suggestions
  suggested_fixes: string[]
  code_examples: Record<string, string>

  // Context
  page_context: string
  user_impact: string

  detected_at: string
}

/**
 * Accessibility warning
 */
export interface AccessibilityWarning {
  id: string
  guideline: string
  level: WCAGLevel

  description: string
  suggestion: string

  // Element details
  selector?: string
  element_context?: string

  // Manual verification
  requires_manual_check: boolean
  manual_check_instructions: string

  detected_at: string
}

/**
 * Accessibility recommendation
 */
export interface AccessibilityRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'

  title: string
  description: string
  impact_description: string

  // Implementation
  implementation_steps: string[]
  code_examples: Record<string, string>
  estimated_effort: 'low' | 'medium' | 'high'
  estimated_hours: number

  // Dependencies
  dependencies: string[]
  affects_components: string[]

  // Benefits
  user_groups_helped: string[]
  compliance_improvement: number

  created_at: string
}

// ===============================
// Keyboard Navigation Types
// ===============================

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  id: string
  name: string
  description: string

  // Key combination
  key_combination: string // e.g., 'Ctrl+Shift+S'
  key_codes: number[]
  modifiers: {
    ctrl: boolean
    shift: boolean
    alt: boolean
    meta: boolean
  }

  // Behavior
  action: string
  scope: 'global' | 'page' | 'component'
  context: string[] // Where it applies

  // Accessibility
  accessibility_purpose: string
  screen_reader_announcement: string
  visual_indicator: boolean

  // Customization
  user_customizable: boolean
  default_enabled: boolean

  // Conflicts
  conflicts_with: string[]
  overrides: string[]

  created_at: string
  updated_at: string
}

/**
 * Focus management configuration
 */
export interface FocusManagementConfig {
  // Focus behavior
  focus_visible_style: 'outline' | 'highlight' | 'border' | 'shadow'
  focus_indicator_color: string
  focus_indicator_width: number

  // Tab navigation
  skip_links_enabled: boolean
  tab_trap_enabled: boolean
  focus_restoration: 'auto' | 'manual' | 'none'

  // Custom focus order
  custom_tab_order: boolean
  focus_order_rules: Record<string, number>

  // Modal and dialog behavior
  modal_focus_management: 'trap' | 'restore' | 'manual'
  dialog_initial_focus: 'first' | 'content' | 'close'

  // Roving focus
  roving_focus_groups: string[]
  arrow_key_navigation: boolean

  // Announcements
  focus_announcements: boolean
  focus_change_delay: number

  updated_at: string
}

// ===============================
// User Preferences Types
// ===============================

/**
 * Voice interface preferences
 */
export interface VoicePreferences extends MultiTenantEntity {
  user_id: string

  // Speech recognition
  speech_recognition_enabled: boolean
  preferred_language: string
  confidence_threshold: number

  // Text-to-speech
  tts_enabled: boolean
  preferred_voice_id: string
  speech_rate: number
  speech_pitch: number
  speech_volume: number

  // Voice commands
  voice_commands_enabled: boolean
  wake_word_enabled: boolean
  wake_word: string

  // Accessibility
  screen_reader_compatible: boolean
  high_contrast_voice_ui: boolean
  voice_feedback_level: 'minimal' | 'standard' | 'verbose'

  // Privacy
  voice_data_retention: 'session' | '30_days' | '90_days' | 'forever'
  voice_training_opt_in: boolean

  // Customizations
  custom_commands: Record<string, string>
  disabled_commands: string[]
  command_confirmations: Record<string, boolean>

  created_at: string
  updated_at: string
}

/**
 * Accessibility preferences
 */
export interface AccessibilityPreferences extends MultiTenantEntity {
  user_id: string

  // Visual preferences
  high_contrast: boolean
  large_text: boolean
  font_size_scale: number // 1.0 = normal, 1.5 = 150%, etc.
  reduce_motion: boolean

  // Motor preferences
  click_delay: number // ms
  double_click_threshold: number // ms
  keyboard_navigation_only: boolean

  // Cognitive preferences
  simplified_interface: boolean
  reduce_distractions: boolean
  reading_assistance: boolean

  // Hearing preferences
  captions_enabled: boolean
  visual_indicators: boolean
  sound_alerts: boolean

  // Screen reader
  screen_reader_enabled: boolean
  screen_reader_type: string
  verbosity_level: 'low' | 'medium' | 'high'

  // Custom settings
  custom_css: string
  custom_shortcuts: Record<string, string>

  created_at: string
  updated_at: string
}

// ===============================
// Analytics and Monitoring Types
// ===============================

/**
 * Voice interface usage metrics
 */
export interface VoiceUsageMetrics extends MultiTenantEntity {
  user_id: string
  session_id: string
  date: string

  // Recognition metrics
  total_speech_attempts: number
  successful_recognitions: number
  failed_recognitions: number
  average_confidence: number

  // Command metrics
  voice_commands_used: number
  unique_commands_used: number
  most_used_commands: Record<string, number>
  command_success_rate: number

  // TTS metrics
  tts_requests: number
  total_speech_duration: number
  average_speech_rate: number

  // User interaction
  voice_session_duration: number
  voice_vs_keyboard_ratio: number
  accessibility_features_used: string[]

  // Performance
  average_response_time: number
  error_rate: number
  user_satisfaction_score?: number

  recorded_at: string
}

/**
 * Accessibility compliance metrics
 */
export interface AccessibilityMetrics extends MultiTenantEntity {
  date: string
  page_path?: string

  // Compliance scores
  wcag_a_compliance: number // 0-100
  wcag_aa_compliance: number // 0-100
  wcag_aaa_compliance: number // 0-100

  // Issue tracking
  total_violations: number
  critical_violations: number
  violation_trends: Record<string, number>

  // User impact
  affected_users: number
  accessibility_sessions: number
  screen_reader_sessions: number
  keyboard_only_sessions: number

  // Improvements
  fixes_implemented: number
  compliance_improvement: number
  user_feedback_score: number

  recorded_at: string
}

// ===============================
// Configuration and Settings Types
// ===============================

/**
 * Voice interface system configuration
 */
export interface VoiceSystemConfig extends MultiTenantEntity {
  // Feature flags
  speech_recognition_enabled: boolean
  text_to_speech_enabled: boolean
  voice_commands_enabled: boolean
  offline_mode_enabled: boolean

  // API settings
  speech_api_provider: 'browser' | 'google' | 'azure' | 'aws' | 'custom'
  api_credentials?: Record<string, string>
  fallback_providers: string[]

  // Performance settings
  max_concurrent_requests: number
  request_timeout: number
  cache_enabled: boolean
  cache_duration: number

  // Security settings
  voice_data_encryption: boolean
  local_processing_preferred: boolean
  data_retention_policy: string

  // Quality settings
  audio_quality: 'low' | 'medium' | 'high'
  compression_enabled: boolean
  noise_reduction: boolean

  // Accessibility settings
  wcag_compliance_level: WCAGLevel
  automatic_alt_text: boolean
  keyboard_shortcuts_enabled: boolean

  // Monitoring
  analytics_enabled: boolean
  error_reporting: boolean
  performance_monitoring: boolean

  created_at: string
  updated_at: string
}

// ===============================
// Request/Response Types
// ===============================

export interface SpeechRecognitionRequest {
  tenant_id: string
  user_id: string
  session_id: string

  // Audio data
  audio_data?: ArrayBuffer
  audio_url?: string
  audio_format: 'wav' | 'mp3' | 'ogg' | 'webm'

  // Recognition settings
  language?: string
  interim_results?: boolean
  max_alternatives?: number

  // Context
  page_context: string
  expected_commands?: string[]
}

export interface SpeechRecognitionResponse {
  success: boolean
  results: SpeechRecognitionResult[]

  // Matched commands
  matched_commands: {
    command_id: string
    confidence: number
    parameters: Record<string, any>
  }[]

  // Suggestions
  suggested_actions: string[]
  help_text?: string

  // Performance
  processing_time: number
  audio_duration: number

  error?: string
  warnings?: string[]
}

export interface AccessibilityAuditRequest {
  tenant_id: string
  page_path: string
  wcag_level: WCAGLevel
  audit_type: 'automated' | 'manual' | 'combined'
  include_warnings: boolean
}

export interface AccessibilityAuditResponse {
  audit_result: AccessibilityAuditResult
  immediate_fixes: AccessibilityRecommendation[]
  compliance_roadmap: {
    quick_wins: AccessibilityRecommendation[]
    medium_term: AccessibilityRecommendation[]
    long_term: AccessibilityRecommendation[]
  }
}

// ===============================
// Constants and Enums
// ===============================

export const SUPPORTED_LANGUAGES = [
  'en-US', 'en-GB', 'en-AU', 'en-CA',
  'es-ES', 'es-MX', 'es-AR',
  'fr-FR', 'fr-CA',
  'de-DE', 'de-AT',
  'it-IT',
  'pt-BR', 'pt-PT',
  'zh-CN', 'zh-TW',
  'ja-JP',
  'ko-KR',
  'ru-RU',
  'ar-SA'
] as const

export const VOICE_COMMAND_CATEGORIES = [
  'navigation',
  'interaction',
  'accessibility',
  'study',
  'system'
] as const

export const WCAG_PRINCIPLES = [
  'perceivable',
  'operable',
  'understandable',
  'robust'
] as const

export const ACCESSIBILITY_IMPACT_LEVELS = [
  'minor',
  'moderate',
  'serious',
  'critical'
] as const

export const DEFAULT_TTS_CONFIG: Partial<TTSConfig> = {
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  voice_quality: 'standard',
  ssml_enabled: false,
  interruptible: true,
  queue_mode: 'append'
} as const

export const DEFAULT_SPEECH_CONFIG: Partial<SpeechRecognitionConfig> = {
  continuous: true,
  interim_results: true,
  max_alternatives: 3,
  confidence_threshold: 0.7,
  noise_suppression: true,
  echo_cancellation: true,
  silence_timeout: 3000,
  recognition_timeout: 10000,
  phrase_timeout: 1000
} as const

// ===============================
// Type Guards and Validators
// ===============================

export function isVoiceCommand(obj: any): obj is VoiceCommand {
  return obj && typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         Array.isArray(obj.patterns) &&
         typeof obj.category === 'string' &&
         typeof obj.action === 'string'
}

export function isTTSVoice(obj: any): obj is TTSVoice {
  return obj && typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.language === 'string' &&
         ['male', 'female', 'neutral'].includes(obj.gender)
}

export function isAccessibilityViolation(obj: any): obj is AccessibilityViolation {
  return obj && typeof obj === 'object' &&
         typeof obj.guideline === 'string' &&
         typeof obj.description === 'string' &&
         ['minor', 'moderate', 'serious', 'critical'].includes(obj.impact)
}

export function isValidWCAGLevel(level: string): level is WCAGLevel {
  return ['A', 'AA', 'AAA'].includes(level)
}

export function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.includes(code as any)
}

// ===============================
// Helper Functions
// ===============================

export function calculateAccessibilityScore(audit: AccessibilityAuditResult): number {
  if (audit.total_checks === 0) return 0

  const passedWeight = 1
  const warningWeight = 0.5
  const failedWeight = 0

  const weightedScore =
    (audit.passed_checks * passedWeight) +
    (audit.warnings * warningWeight) +
    (audit.failed_checks * failedWeight)

  return Math.round((weightedScore / audit.total_checks) * 100)
}

export function getSpeechRate(userPreference: number = 1.0, accessibility: boolean = false): number {
  const baseRate = userPreference
  const accessibilityAdjustment = accessibility ? 0.8 : 1.0

  return Math.max(0.1, Math.min(2.0, baseRate * accessibilityAdjustment))
}

export function formatKeyboardShortcut(combination: string, platform: 'mac' | 'windows' | 'linux' = 'windows'): string {
  const modifierMap = {
    mac: { Ctrl: '⌘', Alt: '⌥', Shift: '⇧' },
    windows: { Ctrl: 'Ctrl', Alt: 'Alt', Shift: 'Shift' },
    linux: { Ctrl: 'Ctrl', Alt: 'Alt', Shift: 'Shift' }
  }

  const modifiers = modifierMap[platform]

  return combination
    .replace(/Ctrl/g, modifiers.Ctrl)
    .replace(/Alt/g, modifiers.Alt)
    .replace(/Shift/g, modifiers.Shift)
}

export function generateVoiceCommandPattern(phrase: string): string[] {
  const patterns = [phrase]

  // Add variations with common speech patterns
  patterns.push(phrase.toLowerCase())
  patterns.push(`please ${phrase}`)
  patterns.push(`can you ${phrase}`)
  patterns.push(`${phrase} please`)

  return [...new Set(patterns)]
}