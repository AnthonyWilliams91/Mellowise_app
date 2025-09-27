/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Type definitions for Logical Reasoning questions and practice
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type { QuestionUniversal, AnswerChoiceUniversal } from './universal-exam'

/**
 * Logical Reasoning Question Types
 */
export type LogicalReasoningQuestionType =
  | 'strengthen'
  | 'weaken'
  | 'assumption'
  | 'flaw'
  | 'must_be_true'
  | 'main_point'
  | 'method_of_reasoning'
  | 'parallel_reasoning'
  | 'principle'
  | 'resolve_paradox'
  | 'role_in_argument'
  | 'point_at_issue'
  | 'necessary_assumption'
  | 'sufficient_assumption'
  | 'evaluate_argument'

/**
 * Argument Structure Components
 */
export interface ArgumentComponent {
  id: string
  type: 'premise' | 'conclusion' | 'evidence' | 'assumption' | 'background'
  text: string
  startIndex: number
  endIndex: number
  isMain?: boolean
  supportedBy?: string[] // IDs of supporting components
  supports?: string[] // IDs of components this supports
  confidence: number // 0-1 confidence in classification
}

/**
 * Argument Structure Analysis
 */
export interface ArgumentStructure {
  stimulus: string
  components: ArgumentComponent[]
  mainConclusion?: string
  mainPremises: string[]
  implicitAssumptions?: string[]
  logicalFlow: {
    from: string // component ID
    to: string // component ID
    relationship: 'supports' | 'opposes' | 'qualifies' | 'explains'
  }[]
  strength: 'strong' | 'moderate' | 'weak'
}

/**
 * Wrong Answer Pattern Types
 */
export type WrongAnswerPattern =
  | 'opposite_answer'        // Says opposite of what's needed
  | 'too_extreme'            // Uses absolute language inappropriately
  | 'out_of_scope'           // Introduces irrelevant information
  | 'partially_correct'      // Right direction but insufficient
  | 'premise_repeat'         // Just restates a premise
  | 'conclusion_repeat'      // Just restates the conclusion
  | 'reverse_causation'      // Reverses cause and effect
  | 'wrong_comparison'       // Makes inappropriate comparison
  | 'temporal_confusion'     // Confuses time relationships
  | 'irrelevant_distinction' // Makes distinction that doesn't matter

/**
 * Answer Analysis
 */
export interface AnswerAnalysis {
  answerId: string
  isCorrect: boolean
  explanation: string
  patterns: WrongAnswerPattern[]
  whyWrong?: string
  whyRight?: string
  commonMistake?: string
  trap?: string // How this answer tries to trick test-takers
}

/**
 * Logical Reasoning Question
 */
export interface LogicalReasoningQuestion extends QuestionUniversal {
  questionType: LogicalReasoningQuestionType
  argumentStructure?: ArgumentStructure
  answerAnalyses: AnswerAnalysis[]
  timeRecommendation: number // seconds
  difficultyFactors: {
    abstractness: number // 1-5
    argumentComplexity: number // 1-5
    vocabularyLevel: number // 1-5
    trapDensity: number // 1-5 (how many trap answers)
  }
  commonApproaches: string[]
  keyInsight?: string
}

/**
 * Practice Session Configuration
 */
export interface LRPracticeConfig {
  questionTypes?: LogicalReasoningQuestionType[]
  difficultyRange?: {
    min: number
    max: number
  }
  timeMode: 'untimed' | 'recommended' | 'strict'
  questionCount: number
  focusOnWeaknesses: boolean
  includeExplanations: boolean
  showArgumentStructure: boolean
}

/**
 * Performance Metrics by Question Type
 */
export interface QuestionTypePerformance {
  questionType: LogicalReasoningQuestionType
  attemptCount: number
  correctCount: number
  accuracy: number
  averageTime: number
  recentTrend: 'improving' | 'stable' | 'declining'
  commonPatterns: WrongAnswerPattern[]
  lastPracticed: string // ISO date
}

/**
 * Practice Session
 */
export interface LRPracticeSession {
  id: string
  userId: string
  config: LRPracticeConfig
  questions: LogicalReasoningQuestion[]
  startedAt: string
  completedAt?: string
  responses: {
    questionId: string
    selectedAnswer: string
    timeSpent: number
    isCorrect: boolean
    flaggedForReview?: boolean
  }[]
  performance: {
    accuracy: number
    averageTime: number
    byQuestionType: QuestionTypePerformance[]
  }
}

/**
 * Custom Practice Set
 */
export interface CustomPracticeSet {
  id: string
  name: string
  description: string
  createdBy: 'system' | 'user'
  createdAt: string
  questionIds: string[]
  targetWeaknesses?: LogicalReasoningQuestionType[]
  estimatedDuration: number // minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  focusAreas: string[]
}

/**
 * Time Recommendations
 */
export interface TimeRecommendation {
  questionType: LogicalReasoningQuestionType
  difficulty: number
  baseTime: number // seconds
  userAdjustment: number // personalized adjustment based on user history
  finalRecommendation: number
  reasoning: string
}

/**
 * Weakness Analysis
 */
export interface WeaknessAnalysis {
  userId: string
  analyzedAt: string
  weakestTypes: LogicalReasoningQuestionType[]
  commonMistakePatterns: WrongAnswerPattern[]
  recommendations: {
    type: LogicalReasoningQuestionType
    priority: 'high' | 'medium' | 'low'
    suggestedPracticeCount: number
    focusPoints: string[]
  }[]
  improvementPlan: {
    weeklyGoals: {
      questionType: LogicalReasoningQuestionType
      targetCount: number
      targetAccuracy: number
    }[]
    estimatedTimeToImprovement: number // days
  }
}