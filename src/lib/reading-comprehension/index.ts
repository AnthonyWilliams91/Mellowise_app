/**
 * MELLOWISE-020: Reading Comprehension Module
 * Main Export Index
 *
 * Exports all reading comprehension services and utilities for easy importing
 * throughout the application.
 *
 * @epic Epic 3.4 - Comprehensive LSAT Question System
 * @author UX Expert Agent (BMad Team)
 * @created 2025-09-25
 */

// Core Services
export { PassageCategorizer } from './passage-categorizer'
export type {
  CategorizationResult,
  ComplexityAnalysisResult
} from './passage-categorizer'

export { ActiveReadingTools } from './active-reading-tools'
export type {
  AnnotationOptions,
  PassageMappingSession,
  AnnotationSuggestion
} from './active-reading-tools'

export { RCQuestionTypeClassifier } from './question-type-classifier'
export type { RCClassificationResult } from './question-type-classifier'

export { ReadingSpeedTracker } from './reading-speed-tracker'
export type {
  ReadingSession,
  SpeedAnalysisResult
} from './reading-speed-tracker'

// Re-export types from the main types file for convenience
export type {
  ReadingComprehensionQuestion,
  ReadingComprehensionQuestionType,
  ReadingComprehensionPassage,
  PassageSubject,
  PassageComplexity,
  ReadingAnnotation,
  PassageMap,
  VocabularyTerm,
  ReadingSpeedMetrics,
  ComparativePassagePair,
  RCPracticeSession,
  RCQuestionTypePerformance,
  PassageSubjectPerformance,
  ReadingStrategy,
  RCAnalytics,
  RCPracticeConfig,
  ReadingToolsState,
  ReadingProgress,
  RCErrorPattern,
  RCImprovementPlan
} from '@/types/reading-comprehension'

// Utility functions for reading comprehension
export const READING_COMPREHENSION_UTILS = {
  /**
   * Get human-readable description for question type
   */
  getQuestionTypeDescription(type: ReadingComprehensionQuestionType): string {
    const descriptions = {
      main_point: 'Main Point/Central Idea',
      primary_purpose: 'Primary Purpose',
      author_attitude: 'Author\'s Attitude',
      tone: 'Tone and Style',
      strengthen: 'Strengthen the Argument',
      weaken: 'Weaken the Argument',
      inference: 'Inference/What Can Be Concluded',
      detail: 'Specific Detail',
      vocabulary: 'Vocabulary in Context',
      function: 'Function/Purpose of Reference',
      parallel: 'Parallel/Analogous Situation',
      application: 'Application of Principle',
      continue: 'Logical Continuation',
      organization: 'Organization/Structure',
      comparative: 'Comparative Passage Analysis'
    }
    return descriptions[type] || type
  },

  /**
   * Get subject category display name
   */
  getSubjectDisplayName(subject: PassageSubject): string {
    const displayNames = {
      law: 'Law & Legal Studies',
      science: 'Physical Sciences',
      social_science: 'Social Sciences',
      humanities: 'Arts & Humanities',
      history: 'History',
      economics: 'Economics',
      technology: 'Technology',
      medicine: 'Medicine & Health',
      environment: 'Environmental Science',
      politics: 'Politics & Government'
    }
    return displayNames[subject] || subject
  },

  /**
   * Get complexity level color for UI
   */
  getComplexityColor(level: 'low' | 'medium' | 'high'): string {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    }
    return colors[level]
  },

  /**
   * Get reading speed level assessment
   */
  getSpeedLevelAssessment(wpm: number, subject: PassageSubject): {
    level: 'slow' | 'average' | 'fast' | 'very_fast'
    description: string
  } {
    // General benchmarks - would be refined based on subject
    if (wpm < 150) {
      return { level: 'slow', description: 'Below average reading speed' }
    } else if (wpm < 200) {
      return { level: 'average', description: 'Average reading speed' }
    } else if (wpm < 250) {
      return { level: 'fast', description: 'Above average reading speed' }
    } else {
      return { level: 'very_fast', description: 'Excellent reading speed' }
    }
  },

  /**
   * Format reading time display
   */
  formatReadingTime(seconds: number): string {
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
   * Calculate reading efficiency score
   */
  calculateEfficiency(wpm: number, accuracy: number): number {
    return Math.round((wpm * accuracy) / 100)
  },

  /**
   * Get annotation type icon
   */
  getAnnotationTypeIcon(type: ReadingAnnotation['type']): string {
    const icons = {
      highlight: '🖍️',
      note: '📝',
      key_point: '⭐',
      question: '❓',
      definition: '📖'
    }
    return icons[type] || '📌'
  },

  /**
   * Get error pattern description
   */
  getErrorPatternDescription(pattern: RCErrorPattern): string {
    const descriptions = {
      speed_reading_loss: 'Reading too fast, missing important details',
      overthinking: 'Spending too much time on straightforward questions',
      passage_misread: 'Misunderstanding the passage content or structure',
      scope_confusion: 'Confusing the passage scope with answer choice scope',
      detail_overemphasis: 'Focusing on minor details over main ideas',
      inference_leap: 'Making inferences not supported by the text',
      vocabulary_stumble: 'Getting stuck on difficult vocabulary',
      structure_ignorance: 'Not understanding passage organization',
      comparative_confusion: 'Mixing up information between passages',
      time_pressure_panic: 'Performance degradation under time constraints'
    }
    return descriptions[pattern] || pattern
  },

  /**
   * Get reading strategy recommendation
   */
  getStrategyRecommendation(
    questionType: ReadingComprehensionQuestionType,
    complexity: 'low' | 'medium' | 'high'
  ): string {
    const strategies = {
      main_point: {
        low: 'Focus on the first and last paragraphs, look for thesis statements',
        medium: 'Map the argument structure, identify supporting points',
        high: 'Analyze multiple viewpoints, synthesize the central argument'
      },
      inference: {
        low: 'Look for directly stated implications in the text',
        medium: 'Connect ideas across paragraphs, consider logical implications',
        high: 'Analyze subtle implications, consider unstated assumptions'
      },
      strengthen: {
        low: 'Find evidence that directly supports the conclusion',
        medium: 'Look for evidence that fills logical gaps',
        high: 'Identify assumptions and find evidence that validates them'
      }
    }

    return strategies[questionType as keyof typeof strategies]?.[complexity] ||
           'Apply systematic approach: identify question type, analyze passage structure, eliminate wrong answers'
  },

  /**
   * Estimate passage reading time by complexity
   */
  estimatePassageReadingTime(wordCount: number, complexity: 'low' | 'medium' | 'high'): number {
    const wpmByComplexity = {
      low: 200,
      medium: 160,
      high: 120
    }

    const wpm = wpmByComplexity[complexity]
    return Math.round((wordCount / wpm) * 60) // Convert to seconds
  },

  /**
   * Get performance trend indicator
   */
  getTrendIndicator(trend: 'improving' | 'stable' | 'declining'): {
    icon: string
    color: string
    description: string
  } {
    const indicators = {
      improving: {
        icon: '📈',
        color: 'text-green-600',
        description: 'Performance is improving'
      },
      stable: {
        icon: '➡️',
        color: 'text-blue-600',
        description: 'Performance is stable'
      },
      declining: {
        icon: '📉',
        color: 'text-red-600',
        description: 'Performance is declining'
      }
    }
    return indicators[trend]
  }
}