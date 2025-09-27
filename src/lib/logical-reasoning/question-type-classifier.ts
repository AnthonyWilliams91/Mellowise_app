/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Question Type Classifier Service
 *
 * Automatically classifies logical reasoning questions into their specific types
 * and provides metadata for targeted practice.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type {
  LogicalReasoningQuestion,
  LogicalReasoningQuestionType,
  ArgumentStructure,
  ArgumentComponent
} from '@/types/logical-reasoning'

/**
 * Question Type Indicators
 */
interface TypeIndicators {
  type: LogicalReasoningQuestionType
  keywords: string[]
  patterns: RegExp[]
  priority: number // Higher priority types are checked first
}

/**
 * Classification Result
 */
export interface ClassificationResult {
  primaryType: LogicalReasoningQuestionType
  confidence: number // 0-1
  secondaryType?: LogicalReasoningQuestionType
  indicators: string[] // What led to this classification
  reasoning: string
}

export class QuestionTypeClassifier {
  /**
   * Type indicator definitions
   */
  private static readonly TYPE_INDICATORS: TypeIndicators[] = [
    {
      type: 'strengthen',
      keywords: ['strengthen', 'support', 'bolster', 'most helps'],
      patterns: [
        /which.*would.*strengthen/i,
        /most.*support.*argument/i,
        /best.*supports/i,
        /helps.*justify/i
      ],
      priority: 10
    },
    {
      type: 'weaken',
      keywords: ['weaken', 'undermine', 'cast doubt', 'challenge'],
      patterns: [
        /which.*would.*weaken/i,
        /most.*undermines/i,
        /cast.*doubt/i,
        /calls.*into question/i
      ],
      priority: 10
    },
    {
      type: 'assumption',
      keywords: ['assumes', 'assumption', 'presupposes', 'takes for granted'],
      patterns: [
        /argument.*assumes/i,
        /assumption.*required/i,
        /must.*be.*assumed/i,
        /takes.*for granted/i
      ],
      priority: 9
    },
    {
      type: 'necessary_assumption',
      keywords: ['required', 'necessary', 'depends on', 'must assume'],
      patterns: [
        /required.*assumption/i,
        /argument.*depends/i,
        /necessarily.*assumes/i,
        /must.*be.*true.*for/i
      ],
      priority: 9
    },
    {
      type: 'sufficient_assumption',
      keywords: ['sufficient', 'properly drawn', 'follows logically if'],
      patterns: [
        /conclusion.*properly drawn/i,
        /follows.*logically.*if/i,
        /sufficient.*to.*establish/i,
        /argument.*valid.*if/i
      ],
      priority: 9
    },
    {
      type: 'flaw',
      keywords: ['flaw', 'error', 'vulnerable', 'questionable', 'weakness'],
      patterns: [
        /flaw.*in.*reasoning/i,
        /vulnerable.*to.*criticism/i,
        /error.*in.*reasoning/i,
        /questionable.*aspect/i,
        /weakness.*in.*argument/i
      ],
      priority: 8
    },
    {
      type: 'must_be_true',
      keywords: ['must be true', 'properly inferred', 'logically follows'],
      patterns: [
        /must.*be.*true/i,
        /properly.*inferred/i,
        /logically.*follows/i,
        /can.*be.*concluded/i
      ],
      priority: 8
    },
    {
      type: 'main_point',
      keywords: ['main point', 'main conclusion', 'primarily', 'overall conclusion'],
      patterns: [
        /main.*point/i,
        /main.*conclusion/i,
        /overall.*conclusion/i,
        /primarily.*arguing/i
      ],
      priority: 7
    },
    {
      type: 'method_of_reasoning',
      keywords: ['method', 'proceeds by', 'reasoning', 'argumentation technique'],
      patterns: [
        /method.*of.*reasoning/i,
        /proceeds.*by/i,
        /argument.*proceeds/i,
        /reasoning.*technique/i,
        /develops.*argument.*by/i
      ],
      priority: 7
    },
    {
      type: 'parallel_reasoning',
      keywords: ['parallel', 'similar', 'most closely resembles', 'analogous'],
      patterns: [
        /parallel.*to/i,
        /most.*similar/i,
        /closely.*resembles/i,
        /pattern.*of.*reasoning/i,
        /analogous.*to/i
      ],
      priority: 6
    },
    {
      type: 'principle',
      keywords: ['principle', 'proposition', 'generalization'],
      patterns: [
        /principle.*illustrated/i,
        /conforms.*to.*principle/i,
        /generalization/i,
        /proposition.*established/i
      ],
      priority: 6
    },
    {
      type: 'resolve_paradox',
      keywords: ['resolve', 'explain', 'reconcile', 'apparent discrepancy'],
      patterns: [
        /resolve.*paradox/i,
        /explain.*discrepancy/i,
        /reconcile/i,
        /apparent.*contradiction/i,
        /helps.*explain/i
      ],
      priority: 5
    },
    {
      type: 'role_in_argument',
      keywords: ['role', 'function', 'plays which', 'serves to'],
      patterns: [
        /role.*in.*argument/i,
        /function.*in.*argument/i,
        /plays.*which.*role/i,
        /serves.*to/i
      ],
      priority: 5
    },
    {
      type: 'point_at_issue',
      keywords: ['disagree', 'dispute', 'at issue', 'point of disagreement'],
      patterns: [
        /disagree.*about/i,
        /point.*at.*issue/i,
        /dispute.*concerns/i,
        /committed.*to.*disagreeing/i
      ],
      priority: 4
    },
    {
      type: 'evaluate_argument',
      keywords: ['evaluate', 'assess', 'determine strength', 'judge validity'],
      patterns: [
        /evaluate.*argument/i,
        /useful.*to.*know/i,
        /assess.*strength/i,
        /help.*determine/i
      ],
      priority: 4
    }
  ]

  /**
   * Classify question type based on stem and content
   */
  static classify(questionStem: string, stimulus?: string): ClassificationResult {
    const normalizedStem = questionStem.toLowerCase()
    const matches: Array<{type: LogicalReasoningQuestionType, score: number, indicators: string[]}> = []

    // Check each type indicator
    for (const indicator of this.TYPE_INDICATORS) {
      let score = 0
      const foundIndicators: string[] = []

      // Check keywords
      for (const keyword of indicator.keywords) {
        if (normalizedStem.includes(keyword)) {
          score += 2
          foundIndicators.push(`Keyword: "${keyword}"`)
        }
      }

      // Check patterns
      for (const pattern of indicator.patterns) {
        const match = pattern.exec(questionStem)
        if (match) {
          score += 3
          foundIndicators.push(`Pattern: "${match[0]}"`)
        }
      }

      // Add priority bonus
      score += indicator.priority / 10

      if (score > 0) {
        matches.push({
          type: indicator.type,
          score,
          indicators: foundIndicators
        })
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score)

    if (matches.length === 0) {
      return {
        primaryType: 'must_be_true', // Default fallback
        confidence: 0.3,
        indicators: [],
        reasoning: 'No clear indicators found, defaulting to must_be_true'
      }
    }

    const topMatch = matches[0]
    const confidence = Math.min(topMatch.score / 10, 1) // Normalize to 0-1

    return {
      primaryType: topMatch.type,
      confidence,
      secondaryType: matches[1]?.type,
      indicators: topMatch.indicators,
      reasoning: this.generateReasoning(topMatch.type, topMatch.indicators)
    }
  }

  /**
   * Generate human-readable reasoning for classification
   */
  private static generateReasoning(
    type: LogicalReasoningQuestionType,
    indicators: string[]
  ): string {
    const typeDescriptions: Record<LogicalReasoningQuestionType, string> = {
      strengthen: 'This question asks you to find evidence that would make the argument stronger',
      weaken: 'This question asks you to find evidence that would undermine the argument',
      assumption: 'This question asks you to identify what the argument assumes to be true',
      necessary_assumption: 'This question asks for an assumption that must be true for the argument to work',
      sufficient_assumption: 'This question asks for an assumption that would make the conclusion follow logically',
      flaw: 'This question asks you to identify the error in the reasoning',
      must_be_true: 'This question asks what must logically follow from the given information',
      main_point: 'This question asks you to identify the main conclusion of the argument',
      method_of_reasoning: 'This question asks how the argument develops its conclusion',
      parallel_reasoning: 'This question asks you to find an argument with similar logical structure',
      principle: 'This question involves applying or identifying a general principle',
      resolve_paradox: 'This question asks you to explain an apparent contradiction',
      role_in_argument: 'This question asks about the function of a specific statement',
      point_at_issue: 'This question asks what two speakers disagree about',
      evaluate_argument: 'This question asks what information would help assess the argument'
    }

    return `${typeDescriptions[type]}. Classification based on: ${indicators.join(', ')}`
  }

  /**
   * Batch classify multiple questions
   */
  static classifyBatch(
    questions: Array<{stem: string, stimulus?: string}>
  ): ClassificationResult[] {
    return questions.map(q => this.classify(q.stem, q.stimulus))
  }

  /**
   * Get time recommendation for question type and difficulty
   */
  static getTimeRecommendation(
    type: LogicalReasoningQuestionType,
    difficulty: number // 1-10
  ): number {
    // Base times in seconds for each type (at difficulty 5)
    const baseTimes: Record<LogicalReasoningQuestionType, number> = {
      strengthen: 75,
      weaken: 75,
      assumption: 80,
      necessary_assumption: 85,
      sufficient_assumption: 90,
      flaw: 70,
      must_be_true: 75,
      main_point: 60,
      method_of_reasoning: 85,
      parallel_reasoning: 100, // Typically takes longest
      principle: 80,
      resolve_paradox: 75,
      role_in_argument: 70,
      point_at_issue: 75,
      evaluate_argument: 80
    }

    const baseTime = baseTimes[type]
    // Adjust for difficulty (±30% max)
    const difficultyMultiplier = 0.7 + (difficulty / 10) * 0.6

    return Math.round(baseTime * difficultyMultiplier)
  }

  /**
   * Analyze question difficulty factors
   */
  static analyzeDifficulty(
    question: LogicalReasoningQuestion
  ): LogicalReasoningQuestion['difficultyFactors'] {
    const stimulus = question.stimulus || ''

    // Abstractness (based on abstract vs concrete language)
    const abstractWords = ['concept', 'theory', 'principle', 'abstract', 'hypothesis']
    const abstractCount = abstractWords.filter(word =>
      stimulus.toLowerCase().includes(word)
    ).length
    const abstractness = Math.min(1 + abstractCount, 5)

    // Argument Complexity (based on sentence structure and length)
    const sentences = stimulus.split(/[.!?]/).filter(s => s.trim())
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length
    const argumentComplexity = Math.min(Math.ceil(avgSentenceLength / 10), 5)

    // Vocabulary Level (based on complex words)
    const complexWords = stimulus.split(' ').filter(word => word.length > 10).length
    const vocabularyLevel = Math.min(1 + Math.floor(complexWords / 5), 5)

    // Trap Density (analyze answer choices for similar-looking options)
    const trapDensity = 3 // Default moderate - would need actual answer analysis

    return {
      abstractness,
      argumentComplexity,
      vocabularyLevel,
      trapDensity
    }
  }
}