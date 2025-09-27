/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Main Export Index
 *
 * Exports all logical reasoning services and utilities for easy importing
 * throughout the application.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

// Core Services
export { QuestionTypeClassifier } from './question-type-classifier'
export type { ClassificationResult } from './question-type-classifier'

export { ArgumentStructureAnalyzer } from './argument-structure-analyzer'

export { WrongAnswerPatternDetector } from './wrong-answer-pattern-detector'
export type { PatternDetectionResult } from './wrong-answer-pattern-detector'

export { TimedPracticeService } from './timed-practice-service'
export type { TimerState } from './timed-practice-service'

export { PerformanceTracker } from './performance-tracker'
export type {
  QuestionPerformanceEntry,
  TrendAnalysis,
  PerformanceDashboard
} from './performance-tracker'

export { PracticeSetGenerator } from './practice-set-generator'
export type {
  GenerationCriteria,
  GeneratedPracticeSet
} from './practice-set-generator'

// Re-export types from the main types file for convenience
export type {
  LogicalReasoningQuestion,
  LogicalReasoningQuestionType,
  ArgumentStructure,
  ArgumentComponent,
  WrongAnswerPattern,
  AnswerAnalysis,
  LRPracticeConfig,
  LRPracticeSession,
  QuestionTypePerformance,
  CustomPracticeSet,
  TimeRecommendation,
  WeaknessAnalysis
} from '@/types/logical-reasoning'

// Utility functions
export const LOGICAL_REASONING_UTILS = {
  /**
   * Get human-readable description for question type
   */
  getQuestionTypeDescription(type: LogicalReasoningQuestionType): string {
    const descriptions = {
      strengthen: 'Strengthen the Argument',
      weaken: 'Weaken the Argument',
      assumption: 'Identify the Assumption',
      necessary_assumption: 'Necessary Assumption',
      sufficient_assumption: 'Sufficient Assumption',
      flaw: 'Identify the Flaw',
      must_be_true: 'Must Be True',
      main_point: 'Main Point/Conclusion',
      method_of_reasoning: 'Method of Reasoning',
      parallel_reasoning: 'Parallel Reasoning',
      principle: 'Principle',
      resolve_paradox: 'Resolve the Paradox',
      role_in_argument: 'Role in Argument',
      point_at_issue: 'Point at Issue',
      evaluate_argument: 'Evaluate the Argument'
    }
    return descriptions[type] || type
  },

  /**
   * Get difficulty color for UI display
   */
  getDifficultyColor(difficulty: number): string {
    if (difficulty <= 3) return 'text-green-600'
    if (difficulty <= 6) return 'text-yellow-600'
    return 'text-red-600'
  },

  /**
   * Get difficulty label
   */
  getDifficultyLabel(difficulty: number): string {
    if (difficulty <= 3) return 'Easy'
    if (difficulty <= 6) return 'Medium'
    return 'Hard'
  },

  /**
   * Format time in seconds to readable format
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return `${remainingSeconds}s`
    }

    return remainingSeconds === 0
      ? `${minutes}m`
      : `${minutes}m ${remainingSeconds}s`
  },

  /**
   * Calculate accuracy percentage
   */
  calculateAccuracy(correct: number, total: number): number {
    return total === 0 ? 0 : Math.round((correct / total) * 100)
  },

  /**
   * Get trend icon for UI display
   */
  getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      case 'stable': return '➡️'
    }
  },

  /**
   * Get pattern description for UI display
   */
  getPatternDescription(pattern: WrongAnswerPattern): string {
    const descriptions = {
      opposite_answer: 'Selected opposite of what question asked for',
      too_extreme: 'Chose answer with extreme/absolute language',
      out_of_scope: 'Selected answer outside argument scope',
      partially_correct: 'Chose answer that was partially but not fully correct',
      premise_repeat: 'Selected answer that just restated a premise',
      conclusion_repeat: 'Selected answer that just restated the conclusion',
      reverse_causation: 'Confused cause and effect relationship',
      wrong_comparison: 'Made inappropriate comparison',
      temporal_confusion: 'Confused time relationships',
      irrelevant_distinction: 'Focused on irrelevant distinctions'
    }
    return descriptions[pattern] || pattern
  }
}