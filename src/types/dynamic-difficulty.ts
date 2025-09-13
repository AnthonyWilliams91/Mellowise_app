/**
 * Dynamic Difficulty Adjustment System Types
 * MELLOWISE-010: FSRS-Inspired Adaptive Learning
 * 
 * Comprehensive type definitions for the dynamic difficulty adjustment system
 * implementing FSRS-inspired algorithms for optimal learning challenge.
 * 
 * @author Architect Agent Winston
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

// ============================================================================
// CORE DIFFICULTY TYPES
// ============================================================================

export type TopicType = 'logical_reasoning' | 'logic_games' | 'reading_comprehension'
export type DifficultyAdjustmentReason = 'performance_based' | 'manual_override' | 'stability_correction' | 'learning_style_adaptation' | 'session_start'
export type AdaptationSpeed = 'conservative' | 'moderate' | 'aggressive'
export type ChallengeLevel = 'comfort' | 'stretch' | 'challenge'
export type TrendDirection = 'increasing' | 'stable' | 'decreasing'

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

/**
 * Practice difficulty state per user per topic
 */
export interface PracticeDifficultyState {
  id: string
  user_id: string
  topic_type: TopicType
  
  // FSRS-inspired difficulty tracking
  current_difficulty: number              // 1.0-10.0
  stability_score: number                 // 0.0-100.0
  confidence_interval: number             // 0.5-5.0
  
  // Performance tracking
  success_rate_target: number             // 0.5-0.9 (typically 0.70-0.80)
  current_success_rate: number            // 0.0-1.0
  sessions_analyzed: number               // Count of sessions used for analysis
  questions_attempted: number             // Total questions in this topic
  
  // Manual overrides
  manual_difficulty_override: number | null
  manual_override_enabled: boolean
  manual_override_set_at: string | null
  manual_override_reason: string | null
  
  // Timestamps
  last_updated: string
  last_session_at: string | null
  created_at: string
}

/**
 * Practice session difficulty tracking
 */
export interface PracticeSessionDifficulty {
  id: string
  session_id: string
  user_id: string
  topic_type: TopicType
  
  // Session difficulty metrics
  start_difficulty: number
  end_difficulty: number
  avg_question_difficulty: number
  difficulty_adjustments_made: number
  
  // Session performance
  questions_answered: number
  correct_answers: number
  session_success_rate: number
  avg_response_time: number | null
  
  // FSRS algorithm data
  stability_change: number
  confidence_change: number
  algorithm_confidence: number
  learning_style_factor: number
  
  created_at: string
}

/**
 * Difficulty adjustment audit log
 */
export interface PracticeDifficultyAdjustment {
  id: string
  user_id: string
  session_id: string | null
  topic_type: TopicType
  
  // Adjustment details
  previous_difficulty: number
  new_difficulty: number
  adjustment_reason: DifficultyAdjustmentReason
  trigger_performance_rate: number | null
  
  // Algorithm confidence and factors
  algorithm_confidence: number
  stability_factor: number
  learning_style_influence: number
  
  // Context data
  questions_in_context: number
  adjustment_magnitude: number
  algorithm_version: string
  adjustment_notes: string | null
  
  created_at: string
}

/**
 * Enhanced question attempt with practice difficulty context
 */
export interface PracticeQuestionAttempt {
  id: string
  user_id: string
  question_id: string
  session_id: string | null
  selected_answer: string
  is_correct: boolean
  response_time: number | null
  attempted_at: string
  hint_used: boolean
  
  // Practice difficulty context
  practice_difficulty_at_attempt: number | null
  stability_factor_at_attempt: number | null
  expected_success_rate: number | null
  difficulty_adjustment_applied: boolean
  algorithm_version: string
}

// ============================================================================
// FSRS ALGORITHM TYPES
// ============================================================================

/**
 * Core FSRS algorithm state
 */
export interface FSRSState {
  difficulty: number                      // Current difficulty level
  stability: number                       // Memory retention strength
  confidence: number                      // Algorithm confidence
  successRate: number                     // Target success rate
  lastReview: Date | null                // Last practice session
  retrievability: number                  // Current memory retrievability
}

/**
 * FSRS calculation context
 */
export interface DifficultyContext {
  currentState: FSRSState
  recentPerformance: PerformancePoint[]
  learningStyleFactor: number
  topicAffinity: number
  sessionLength: number
  timeOfDay: number
}

/**
 * Performance data point for FSRS calculations
 */
export interface PerformancePoint {
  difficulty: number
  success: boolean
  responseTime: number
  timestamp: Date
  confidence: number
}

/**
 * FSRS difficulty calculation result
 */
export interface DifficultyCalculation {
  nextDifficulty: number
  confidenceScore: number
  stabilityUpdate: number
  reasoning: string
  adjustmentMagnitude: number
  expectedPerformance: number
}

// ============================================================================
// SERVICE LAYER TYPES
// ============================================================================

/**
 * Practice session configuration
 */
export interface PracticeSessionConfig {
  userId: string
  topicType: TopicType
  targetDuration: number                  // minutes
  manualDifficultyOverride?: number
  targetSuccessRate?: number
  adaptationSpeed?: AdaptationSpeed
  learningStyleConsideration?: boolean
}

/**
 * Dynamic difficulty service context
 */
export interface DifficultyServiceContext {
  userId: string
  topicType: TopicType
  sessionId?: string
  learningStyleProfile?: LearningStyleDifficultyPreferences
  currentPerformanceMetrics?: TopicPerformanceMetrics
}

/**
 * Question with difficulty context
 */
export interface QuestionWithDifficulty {
  id: string
  content: string
  question_type: TopicType
  subtype: string | null
  difficulty: number
  estimated_time: number | null
  correct_answer: string
  answer_choices: string[]
  explanation: string
  concept_tags: string[]
  
  // Difficulty context
  targetDifficulty: number
  expectedSuccessRate: number
  algorithmConfidence: number
  adjustmentApplied: boolean
}

/**
 * Answer submission with difficulty tracking
 */
export interface AnswerSubmission {
  userId: string
  questionId: string
  sessionId: string
  selectedAnswer: string
  responseTime: number
  hintUsed: boolean
  
  // Difficulty context
  currentDifficulty: number
  expectedSuccessRate: number
  topicType: TopicType
}

/**
 * Answer result with difficulty adjustment
 */
export interface AnswerResult {
  isCorrect: boolean
  explanation: string
  difficultyAdjustment: DifficultyAdjustmentDetails
  performanceInsight: string
  nextRecommendation: string
}

/**
 * Difficulty adjustment details
 */
export interface DifficultyAdjustmentDetails {
  previousDifficulty: number
  newDifficulty: number
  adjustmentReason: DifficultyAdjustmentReason
  adjustmentMagnitude: number
  algorithmConfidence: number
  stabilityChange: number
  explanation: string
}

// ============================================================================
// LEARNING STYLE INTEGRATION TYPES
// ============================================================================

/**
 * Learning style difficulty preferences
 */
export interface LearningStyleDifficultyPreferences {
  learningStyle: string
  adaptationSpeed: AdaptationSpeed
  preferredChallengeLevel: ChallengeLevel
  preferredStartingDifficulty: number
  targetSuccessRate: number
  stabilityPreference: number             // 0.0-1.0 (higher = more stable)
  confidenceThreshold: number
  manualOverrideFrequency: number
  
  // Topic-specific affinities
  topicAffinities: {
    [K in TopicType]: {
      naturalDifficulty: number           // Perceived difficulty modifier
      learningSpeed: number               // How quickly they adapt
      stabilityFactor: number             // How stable their performance is
      preferredSessionLength: number      // Optimal practice duration
    }
  }
}

/**
 * Topic performance metrics for difficulty calculation
 */
export interface TopicPerformanceMetrics {
  topicType: TopicType
  currentAccuracy: number
  recentAccuracy: number
  averageResponseTime: number
  consistencyScore: number
  improvementRate: number
  sessionsCompleted: number
  totalQuestionsAttempted: number
  
  // Difficulty-specific metrics
  performanceByDifficulty: {
    [difficulty: number]: {
      accuracy: number
      attempts: number
      avgResponseTime: number
    }
  }
}

// ============================================================================
// ANALYTICS AND MONITORING TYPES
// ============================================================================

/**
 * Difficulty progression tracking
 */
export interface DifficultyProgression {
  userId: string
  topicType: TopicType
  timeRange: {
    start: Date
    end: Date
  }
  
  progressionPoints: DifficultyProgressionPoint[]
  trends: {
    difficultyTrend: TrendDirection
    stabilityTrend: TrendDirection
    performanceTrend: TrendDirection
  }
  
  insights: DifficultyInsight[]
  recommendations: DifficultyRecommendation[]
}

/**
 * Individual difficulty progression point
 */
export interface DifficultyProgressionPoint {
  timestamp: Date
  difficulty: number
  stability: number
  successRate: number
  algorithmConfidence: number
  adjustmentReason: DifficultyAdjustmentReason | null
  sessionContext: {
    questionsAttempted: number
    correctAnswers: number
    avgResponseTime: number
  }
}

/**
 * Algorithm performance metrics
 */
export interface AlgorithmPerformanceMetrics {
  // Accuracy metrics
  successRateAccuracy: number             // How close to target success rate
  difficultyPredictionAccuracy: number    // How well difficulty predicts performance
  stabilityMaintenance: number            // How stable difficulty adjustments are
  
  // User experience metrics
  engagementMaintenance: number           // Session completion rates
  frustrationMinimization: number         // Low consecutive failures
  progressPerception: number              // User-reported progress feeling
  
  // Algorithm efficiency
  adjustmentFrequency: number             // How often adjustments are made
  convergenceTime: number                 // Time to reach stable difficulty
  overrideFrequency: number               // How often users override
  
  // Time-based analysis
  timeToOptimalDifficulty: number         // Sessions needed to find optimal level
  performanceVarianceReduction: number    // How much algorithm reduces variance
}

/**
 * Difficulty insight for analytics
 */
export interface DifficultyInsight {
  type: 'stability_achieved' | 'rapid_improvement' | 'plateau_detected' | 'override_recommended' | 'topic_mastery'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  recommendation: string
  confidence: number
  evidence: {
    difficultyRange: [number, number]
    performanceData: PerformancePoint[]
    timeframe: string
  }
  created_at: Date
}

/**
 * Difficulty-based recommendation
 */
export interface DifficultyRecommendation {
  type: 'session_length' | 'difficulty_adjustment' | 'topic_focus' | 'break_suggestion'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  actionable: boolean
  estimatedImpact: string
  implementation: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

// ============================================================================
// SESSION MANAGEMENT TYPES
// ============================================================================

/**
 * Practice session with difficulty context
 */
export interface PracticeSession {
  id: string
  userId: string
  config: PracticeSessionConfig
  
  // Difficulty state
  startDifficulty: number
  currentDifficulty: number
  difficultyHistory: DifficultyAdjustmentDetails[]
  
  // Performance tracking
  questionsAnswered: number
  correctAnswers: number
  currentSuccessRate: number
  targetSuccessRate: number
  
  // Session metadata
  startedAt: Date
  lastActivity: Date
  estimatedEndTime: Date | null
  adaptiveAdjustmentsEnabled: boolean
  
  // Real-time metrics
  algorithmConfidence: number
  stabilityScore: number
  performanceTrend: TrendDirection
}

/**
 * Session guidance for users
 */
export interface SessionGuidance {
  currentDifficulty: number
  recommendedAction: 'continue' | 'increase_difficulty' | 'decrease_difficulty' | 'take_break' | 'switch_topic'
  reasoning: string
  confidenceLevel: number
  
  nextSteps: {
    immediate: string
    afterNext3Questions: string
    endOfSession: string
  }
  
  performanceInsight: string
  encouragement: string
}

/**
 * Session summary with difficulty analytics
 */
export interface SessionSummary {
  sessionId: string
  userId: string
  topicType: TopicType
  
  // Performance summary
  questionsAnswered: number
  correctAnswers: number
  finalSuccessRate: number
  averageResponseTime: number
  
  // Difficulty progression
  startDifficulty: number
  endDifficulty: number
  difficultyAdjustmentsMade: number
  largestAdjustment: number
  
  // Algorithm performance
  algorithmAccuracy: number
  stabilityImprovement: number
  confidenceGained: number
  
  // Insights and recommendations
  sessionInsights: DifficultyInsight[]
  nextSessionRecommendations: DifficultyRecommendation[]
  optimalDifficultyReached: boolean
  masteryProgress: number                 // 0.0-1.0
  
  // Comparative metrics
  improvementFromLastSession: number
  consistencyScore: number
  learningEfficiency: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for difficulty state
 */
export interface DifficultyStateResponse {
  success: boolean
  data: {
    topics: {
      [K in TopicType]?: {
        currentDifficulty: number
        stabilityScore: number
        confidenceInterval: number
        targetSuccessRate: number
        currentSuccessRate: number
        manualOverrideEnabled: boolean
        lastSessionAt: string | null
        recommendedSessionLength: number
        algorithmConfidence: number
      }
    }
  }
  metadata: {
    algorithmsVersion: string
    lastUpdated: string
    totalSessions: number
  }
}

/**
 * API response for session initialization
 */
export interface SessionInitializationResponse {
  success: boolean
  data: {
    sessionId: string
    initialDifficulty: number
    targetSuccessRate: number
    estimatedSessionLength: number
    adaptiveMode: boolean
    firstQuestionDifficulty: number
  }
  metadata: {
    algorithmVersion: string
    learningStyleFactor: number
    topicAffinity: number
  }
}

/**
 * API response for next question with difficulty
 */
export interface NextQuestionResponse {
  success: boolean
  data: {
    question: QuestionWithDifficulty
    sessionContext: {
      currentDifficulty: number
      questionsRemaining: number
      currentSuccessRate: number
      algorithmConfidence: number
    }
    guidance: {
      expectedDifficulty: string
      performanceTip: string
      confidenceBooster: string
    }
  }
}

/**
 * API response for answer submission with difficulty update
 */
export interface AnswerSubmissionResponse {
  success: boolean
  data: {
    result: AnswerResult
    difficultyUpdate: {
      newDifficulty: number
      adjustmentMade: boolean
      adjustmentReason: string
      nextQuestionDifficulty: number
    }
    sessionProgress: {
      questionsCompleted: number
      currentSuccessRate: number
      sessionTarget: number
      onTrackForTarget: boolean
    }
  }
  metadata: {
    algorithmConfidence: number
    stabilityChange: number
    performanceTrend: TrendDirection
  }
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Algorithm configuration parameters
 */
export interface FSRSConfiguration {
  // Core FSRS parameters
  defaultDifficulty: number               // Starting difficulty (typically 5.0)
  targetSuccessRate: number               // Optimal challenge level (0.70-0.80)
  minConfidenceThreshold: number          // Minimum algorithm confidence
  maxAdjustmentMagnitude: number          // Largest single adjustment allowed
  
  // Stability parameters
  baseStabilityScore: number              // Starting stability
  stabilityGrowthRate: number             // How quickly stability improves
  stabilityDecayRate: number              // How quickly stability decreases
  
  // Confidence interval parameters
  defaultConfidenceInterval: number       // Starting confidence interval
  confidenceGrowthFactor: number          // How confidence grows with data
  maxConfidenceInterval: number           // Maximum confidence interval
  
  // Learning style modifiers
  learningStyleInfluence: number          // 0.0-1.0 (how much style affects difficulty)
  topicAffinityInfluence: number          // 0.0-1.0 (how much topic affinity matters)
  
  // Performance thresholds
  excellentPerformanceThreshold: number   // Success rate for excellent performance
  poorPerformanceThreshold: number        // Success rate for poor performance
  stagnationDetectionThreshold: number    // Sessions without improvement
  
  // Time-based factors
  timeDecayHalfLife: number              // Days for 50% confidence decay
  recentPerformanceWindow: number         // Days for recent performance calculation
  minimumSessionGap: number              // Minimum time between sessions (minutes)
}

/**
 * System-wide difficulty configuration
 */
export interface DifficultySystemConfiguration {
  fsrsConfig: FSRSConfiguration
  
  // Feature flags
  enableAdaptiveDifficulty: boolean
  enableManualOverrides: boolean
  enableLearningStyleIntegration: boolean
  enableCrossTopicLearning: boolean
  
  // Performance monitoring
  enableAlgorithmMonitoring: boolean
  performanceLoggingLevel: 'minimal' | 'standard' | 'detailed'
  analyticsRetentionDays: number
  
  // Safety limits
  maxDifficultyIncreasePerSession: number
  maxDifficultyDecreasePerSession: number
  maxConsecutiveDifficultQuestions: number
  maxConsecutiveEasyQuestions: number
  
  // UI/UX preferences
  showAlgorithmExplanations: boolean
  showConfidenceScores: boolean
  showDifficultyTrends: boolean
  enablePerformancePredictions: boolean
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Dynamic difficulty system errors
 */
export class DifficultySystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'DifficultySystemError'
  }
}

export type DifficultyErrorCode = 
  | 'INVALID_DIFFICULTY_RANGE'
  | 'INSUFFICIENT_PERFORMANCE_DATA'
  | 'ALGORITHM_CONFIDENCE_TOO_LOW'
  | 'MANUAL_OVERRIDE_CONFLICT'
  | 'SESSION_STATE_MISMATCH'
  | 'TOPIC_TYPE_INVALID'
  | 'LEARNING_STYLE_NOT_FOUND'
  | 'STABILITY_CALCULATION_ERROR'
  | 'FSRS_ENGINE_ERROR'