/**
 * Anxiety Management Types
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * TypeScript types for anxiety detection, confidence building, and mindfulness features
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

export type AnxietyLevel = 'low' | 'moderate' | 'high' | 'severe'
export type ConfidenceLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
export type AnxietyTrigger = 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
export type CopingStrategy = 'breathing_exercise' | 'positive_affirmation' | 'difficulty_reduction' | 'break_suggestion' | 'achievement_reminder'
export type InterventionType = 'immediate' | 'proactive' | 'educational' | 'celebration'

// ============================================================================
// ANXIETY DETECTION & MONITORING
// ============================================================================

export interface AnxietyIndicators {
  performance_decline_rate: number // Percentage decline in recent performance
  response_time_increase: number // Average response time increase
  streak_break_frequency: number // How often streaks are broken
  session_abandonment_rate: number // Frequency of incomplete sessions
  accuracy_volatility: number // Standard deviation of recent accuracy scores
  panic_patterns: boolean // Sudden performance drops after errors
}

export interface AnxietyDetectionResult {
  anxiety_level: AnxietyLevel
  confidence_score: number // 0-100, how confident we are in the detection
  primary_indicators: AnxietyIndicators
  triggers_identified: AnxietyTrigger[]
  behavioral_patterns: string[]
  detection_timestamp: string
}

export interface AnxietyHistory {
  user_id: string
  detection_results: AnxietyDetectionResult[]
  trends: {
    anxiety_trend: 'improving' | 'worsening' | 'stable'
    confidence_trend: 'building' | 'declining' | 'stable'
    trigger_patterns: Record<AnxietyTrigger, number>
  }
  last_updated: string
}

// ============================================================================
// CONFIDENCE BUILDING SYSTEM
// ============================================================================

export interface ConfidenceMetrics {
  current_level: ConfidenceLevel
  confidence_score: number // 0-100 numeric representation
  success_rate_trend: number // Recent success rate change
  achievement_momentum: number // Points from recent achievements
  mastery_progress: Record<string, number> // Topic mastery percentages
  last_calculated: string
}

export interface ConfidenceBuildingConfig {
  start_difficulty_reduction: number // How much to reduce difficulty initially
  success_threshold: number // Required success rate to maintain confidence
  progression_rate: number // How quickly to increase difficulty
  safety_net_enabled: boolean // Whether to provide easier fallback questions
  positive_reinforcement_frequency: number // How often to show encouragement
}

export interface QuestionSequencingStrategy {
  strategy_type: 'confidence_building' | 'gradual_challenge' | 'success_momentum'
  difficulty_progression: number[] // Array of difficulty levels for upcoming questions
  expected_success_rates: number[] // Predicted success rates for each question
  confidence_checkpoints: number[] // After which questions to reassess confidence
  fallback_options: string[] // Easier question IDs if needed
}

// ============================================================================
// MINDFULNESS & BREATHING EXERCISES
// ============================================================================

export interface BreathingExercise {
  id: string
  name: string
  description: string
  duration_seconds: number
  breathing_pattern: {
    inhale_seconds: number
    hold_seconds: number
    exhale_seconds: number
    pause_seconds: number
    cycles: number
  }
  guidance_text: string[]
  background_audio?: string
  visual_guide_type: 'circle' | 'wave' | 'square' | 'star'
}

export interface MindfulnessSession {
  id: string
  user_id: string
  exercise_id: string
  started_at: string
  completed_at: string | null
  duration_completed_seconds: number
  effectiveness_rating: number | null // User self-reported 1-5
  anxiety_level_before: AnxietyLevel | null
  anxiety_level_after: AnxietyLevel | null
  session_context: 'before_practice' | 'during_break' | 'after_mistake' | 'general'
}

export interface RelaxationTechnique {
  id: string
  name: string
  type: 'progressive_muscle' | 'visualization' | 'grounding' | 'positive_affirmations'
  duration_seconds: number
  instructions: string[]
  audio_guide?: string
  effectiveness_for_anxiety: Record<AnxietyLevel, number> // 0-100 effectiveness
}

// ============================================================================
// POSITIVE REINFORCEMENT & MESSAGING
// ============================================================================

export interface PositiveReinforcementMessage {
  id: string
  message_type: 'achievement' | 'progress' | 'encouragement' | 'milestone'
  trigger_condition: string
  message_template: string
  personalization_variables: string[]
  effectiveness_score: number
  target_confidence_level: ConfidenceLevel[]
}

export interface AchievementCelebration {
  id: string
  user_id: string
  achievement_type: string
  description: string
  points_earned: number
  celebration_level: 'small' | 'medium' | 'large'
  visual_effects: string[]
  sound_effects: string[]
  message: string
  created_at: string
}

export interface PersonalizedEncouragement {
  user_id: string
  learning_style_adaptations: Record<string, string>
  preferred_motivation_types: string[]
  effective_messaging_patterns: string[]
  celebration_preferences: {
    visual_intensity: 'subtle' | 'moderate' | 'energetic'
    sound_enabled: boolean
    message_tone: 'professional' | 'friendly' | 'enthusiastic'
  }
}

// ============================================================================
// PRESSURE SIMULATION & GRADUAL EXPOSURE
// ============================================================================

export interface PressureSimulationConfig {
  enabled: boolean
  current_level: number // 1-10 pressure intensity
  time_constraints: {
    base_time_per_question: number
    pressure_multiplier: number
    grace_period_enabled: boolean
  }
  visual_pressure_indicators: boolean
  audio_pressure_cues: boolean
  progression_schedule: number[] // Pressure levels for upcoming sessions
}

export interface GradualExposureSession {
  id: string
  user_id: string
  pressure_level: number
  target_anxiety_level: AnxietyLevel
  session_performance: {
    accuracy: number
    average_response_time: number
    anxiety_indicators: AnxietyIndicators
  }
  adaptation_needed: boolean
  next_pressure_level: number
  created_at: string
}

// ============================================================================
// SUCCESS VISUALIZATION & PROGRESS TRACKING
// ============================================================================

export interface SuccessVisualization {
  id: string
  user_id: string
  visualization_type: 'progress_chart' | 'confidence_journey' | 'achievement_gallery' | 'future_success'
  data_points: Json
  milestone_markers: {
    date: string
    achievement: string
    confidence_boost: number
  }[]
  motivational_overlay: {
    progress_percentage: number
    next_milestone: string
    encouraging_message: string
  }
}

export interface ProgressCelebration {
  id: string
  trigger_event: string
  celebration_data: {
    improvement_metric: string
    improvement_amount: number
    comparative_context: string
    visual_representation: string
  }
  user_response: 'positive' | 'neutral' | 'negative' | null
  effectiveness_rating: number
}

export interface ConfidenceJourney {
  user_id: string
  journey_start_date: string
  milestones: {
    date: string
    confidence_level: ConfidenceLevel
    achievement: string
    impact_rating: number
  }[]
  current_phase: {
    focus_area: string
    goals: string[]
    progress_percentage: number
    estimated_completion: string
  }
  success_predictions: {
    next_milestone_date: string
    confidence_trajectory: number[]
    success_probability: number
  }
}

// ============================================================================
// ANXIETY TRIGGER IDENTIFICATION & COPING STRATEGIES
// ============================================================================

export interface TriggerPattern {
  trigger_type: AnxietyTrigger
  frequency: number
  intensity_scores: number[]
  context_factors: string[]
  effective_interventions: CopingStrategy[]
  last_occurrence: string
}

export interface PersonalizedCopingStrategy {
  id: string
  user_id: string
  trigger_type: AnxietyTrigger
  strategy_type: CopingStrategy
  effectiveness_rating: number // 1-100 based on user feedback and behavioral data
  usage_frequency: number
  customizations: {
    duration: number
    intensity: number
    personal_modifications: string[]
  }
  success_rate: number
  last_used: string
}

export interface AnxietyIntervention {
  id: string
  user_id: string
  trigger_detected: AnxietyTrigger
  intervention_type: InterventionType
  strategies_offered: PersonalizedCopingStrategy[]
  strategy_selected: string | null
  effectiveness_outcome: {
    anxiety_reduction: number
    confidence_improvement: number
    session_continuation: boolean
    user_satisfaction: number
  } | null
  timestamp: string
}

// ============================================================================
// COMPREHENSIVE TRACKING & ANALYTICS
// ============================================================================

export interface AnxietyManagementDashboard {
  user_id: string
  current_status: {
    anxiety_level: AnxietyLevel
    confidence_level: ConfidenceLevel
    trend_direction: 'improving' | 'stable' | 'concerning'
  }
  weekly_insights: {
    anxiety_episodes: number
    interventions_used: number
    confidence_gains: number
    successful_strategies: string[]
  }
  progress_metrics: {
    anxiety_management_score: number // 0-100 overall improvement
    confidence_building_score: number
    resilience_rating: number
    stress_tolerance_improvement: number
  }
  recommendations: {
    immediate_actions: string[]
    weekly_goals: string[]
    strategy_adjustments: string[]
  }
}

export interface AnxietyManagementSettings {
  user_id: string
  intervention_preferences: {
    auto_trigger_threshold: AnxietyLevel
    preferred_strategies: CopingStrategy[]
    notification_frequency: 'immediate' | 'gentle' | 'minimal'
    break_suggestions_enabled: boolean
  }
  mindfulness_preferences: {
    preferred_exercise_duration: number
    breathing_exercise_style: string
    background_sounds_enabled: boolean
    guided_vs_self_directed: 'guided' | 'self_directed' | 'mixed'
  }
  progress_tracking: {
    detailed_analytics: boolean
    progress_celebrations: boolean
    comparison_data_visible: boolean
    goal_setting_enabled: boolean
  }
  privacy_settings: {
    share_anonymized_data: boolean
    research_participation: boolean
    coaching_suggestions: boolean
  }
}

// ============================================================================
// API & SERVICE INTERFACES
// ============================================================================

export interface AnxietyDetectionService {
  detectAnxietyLevel(userId: string, recentPerformance: any[]): Promise<AnxietyDetectionResult>
  identifyTriggers(userId: string): Promise<TriggerPattern[]>
  trackAnxietyHistory(userId: string): Promise<AnxietyHistory>
}

export interface ConfidenceBuildingService {
  assessConfidenceLevel(userId: string): Promise<ConfidenceMetrics>
  generateQuestionSequence(userId: string, anxietyLevel: AnxietyLevel): Promise<QuestionSequencingStrategy>
  updateConfidenceScore(userId: string, sessionData: any): Promise<ConfidenceMetrics>
}

export interface MindfulnessService {
  getRecommendedExercises(anxietyLevel: AnxietyLevel, timeAvailable: number): Promise<BreathingExercise[]>
  trackMindfulnessSession(sessionData: MindfulnessSession): Promise<void>
  analyzeEffectiveness(userId: string): Promise<any>
}

export interface InterventionService {
  triggerIntervention(userId: string, trigger: AnxietyTrigger, context: any): Promise<AnxietyIntervention>
  evaluateInterventionEffectiveness(interventionId: string): Promise<any>
  updateCopingStrategies(userId: string): Promise<PersonalizedCopingStrategy[]>
}

// ============================================================================
// DATABASE SCHEMA ADDITIONS
// ============================================================================

export interface AnxietyTrackingTables {
  anxiety_detections: {
    id: string
    user_id: string
    anxiety_level: AnxietyLevel
    confidence_score: number
    indicators: Json
    triggers: AnxietyTrigger[]
    created_at: string
  }

  confidence_metrics: {
    id: string
    user_id: string
    confidence_level: ConfidenceLevel
    confidence_score: number
    trend_data: Json
    last_updated: string
  }

  mindfulness_sessions: {
    id: string
    user_id: string
    exercise_id: string
    duration_completed: number
    effectiveness_rating: number | null
    anxiety_before: AnxietyLevel | null
    anxiety_after: AnxietyLevel | null
    session_context: string
    created_at: string
  }

  anxiety_interventions: {
    id: string
    user_id: string
    trigger_type: AnxietyTrigger
    intervention_type: InterventionType
    strategies_offered: Json
    outcome_data: Json | null
    created_at: string
  }

  coping_strategies: {
    id: string
    user_id: string
    trigger_type: AnxietyTrigger
    strategy_type: CopingStrategy
    effectiveness_rating: number
    usage_count: number
    customizations: Json
    created_at: string
    updated_at: string
  }
}