/**
 * MELLOWISE-020: Reading Comprehension Module
 * Reading Comprehension Question Type Classifier
 *
 * Automatically classifies reading comprehension questions by type
 * and provides targeted practice recommendations.
 *
 * @epic Epic 3.4 - Comprehensive LSAT Question System
 * @author UX Expert Agent (BMad Team)
 * @created 2025-09-25
 */

import type {
  ReadingComprehensionQuestion,
  ReadingComprehensionQuestionType,
  ReadingComprehensionPassage
} from '@/types/reading-comprehension'

/**
 * Classification Result for RC Questions
 */
export interface RCClassificationResult {
  primaryType: ReadingComprehensionQuestionType
  confidence: number // 0-1
  secondaryType?: ReadingComprehensionQuestionType
  indicators: string[] // What led to this classification
  reasoning: string
  difficulty: number // 1-10
  estimatedTime: number // seconds
  requiredSkills: string[]
}

/**
 * Question Type Indicators
 */
interface RCTypeIndicators {
  type: ReadingComprehensionQuestionType
  keywords: string[]
  patterns: RegExp[]
  questionStarters: string[]
  priority: number // Higher priority checked first
}

/**
 * Difficulty Assessment Factors
 */
interface DifficultyFactors {
  inferenceLevel: number     // How much inference required (1-5)
  textComplexity: number     // Complexity of referenced text (1-5)
  vocabularyDemand: number   // Vocabulary difficulty (1-5)
  multipleSteps: boolean     // Requires multiple reasoning steps
}

export class RCQuestionTypeClassifier {
  /**
   * Question type classification indicators
   */
  private static readonly TYPE_INDICATORS: RCTypeIndicators[] = [
    {
      type: 'main_point',
      keywords: ['main point', 'central point', 'primary concern', 'main idea', 'central idea'],
      patterns: [
        /main.*point.*passage/i,
        /central.*idea.*passage/i,
        /primary.*purpose.*passage/i,
        /passage.*primarily.*concerned/i,
        /overall.*point.*passage/i
      ],
      questionStarters: ['which', 'what', 'the passage'],
      priority: 10
    },
    {
      type: 'primary_purpose',
      keywords: ['primary purpose', 'main purpose', 'author\'s purpose', 'purpose', 'function'],
      patterns: [
        /primary.*purpose.*passage/i,
        /main.*purpose.*author/i,
        /author.*purpose.*writing/i,
        /passage.*serves.*to/i,
        /function.*of.*passage/i
      ],
      questionStarters: ['the primary purpose', 'the author\'s purpose', 'the passage serves to'],
      priority: 10
    },
    {
      type: 'author_attitude',
      keywords: ['attitude', 'view', 'perspective', 'stance', 'position', 'regard'],
      patterns: [
        /author.*attitude.*toward/i,
        /author.*view.*of/i,
        /author.*regards/i,
        /author.*perspective.*on/i,
        /passage.*suggests.*author/i
      ],
      questionStarters: ['the author\'s attitude', 'the author views', 'the author regards'],
      priority: 9
    },
    {
      type: 'tone',
      keywords: ['tone', 'mood', 'style', 'manner', 'approach'],
      patterns: [
        /tone.*of.*passage/i,
        /author.*tone/i,
        /style.*of.*writing/i,
        /manner.*of.*presentation/i,
        /approach.*taken.*by/i
      ],
      questionStarters: ['the tone of', 'the author\'s tone', 'which tone'],
      priority: 8
    },
    {
      type: 'strengthen',
      keywords: ['strengthen', 'support', 'bolster', 'reinforce', 'confirm'],
      patterns: [
        /would.*strengthen/i,
        /most.*supports/i,
        /provides.*support.*for/i,
        /reinforces.*argument/i,
        /confirms.*claim/i
      ],
      questionStarters: ['which', 'what would most strengthen'],
      priority: 9
    },
    {
      type: 'weaken',
      keywords: ['weaken', 'undermine', 'challenge', 'cast doubt', 'contradict'],
      patterns: [
        /would.*weaken/i,
        /undermines.*argument/i,
        /casts.*doubt.*on/i,
        /challenges.*claim/i,
        /contradicts/i
      ],
      questionStarters: ['which', 'what would most weaken'],
      priority: 9
    },
    {
      type: 'inference',
      keywords: ['infer', 'imply', 'suggest', 'conclude', 'reasonably concluded'],
      patterns: [
        /can.*be.*inferred/i,
        /passage.*implies/i,
        /suggests.*that/i,
        /reasonably.*concluded/i,
        /most.*likely.*that/i
      ],
      questionStarters: ['it can be inferred', 'the passage implies', 'which can be concluded'],
      priority: 8
    },
    {
      type: 'detail',
      keywords: ['according to', 'passage states', 'mentioned', 'described', 'indicates'],
      patterns: [
        /according.*to.*passage/i,
        /passage.*states.*that/i,
        /passage.*indicates/i,
        /passage.*mentions/i,
        /passage.*describes/i
      ],
      questionStarters: ['according to the passage', 'the passage states', 'the passage indicates'],
      priority: 7
    },
    {
      type: 'vocabulary',
      keywords: ['as used', 'meaning', 'context', 'refers to', 'definition'],
      patterns: [
        /as.*used.*in.*passage/i,
        /meaning.*of.*word/i,
        /in.*context.*means/i,
        /word.*refers.*to/i,
        /definition.*of/i
      ],
      questionStarters: ['as used in the passage', 'the word', 'in context'],
      priority: 8
    },
    {
      type: 'function',
      keywords: ['function', 'purpose', 'role', 'serves to', 'order to'],
      patterns: [
        /author.*mentions.*in.*order.*to/i,
        /function.*of.*reference/i,
        /purpose.*of.*mentioning/i,
        /author.*discusses.*to/i,
        /serves.*to.*illustrate/i
      ],
      questionStarters: ['the author mentions', 'the reference serves to', 'the purpose of'],
      priority: 7
    },
    {
      type: 'parallel',
      keywords: ['analogous', 'similar', 'parallel', 'comparable', 'resembles'],
      patterns: [
        /most.*analogous.*to/i,
        /similar.*to/i,
        /parallel.*to/i,
        /comparable.*to/i,
        /most.*resembles/i
      ],
      questionStarters: ['which is most analogous', 'which is similar to', 'which parallels'],
      priority: 6
    },
    {
      type: 'application',
      keywords: ['principle', 'approach', 'method', 'strategy', 'technique'],
      patterns: [
        /principle.*in.*passage/i,
        /approach.*described/i,
        /method.*outlined/i,
        /strategy.*discussed/i,
        /technique.*mentioned/i
      ],
      questionStarters: ['the principle described', 'the approach outlined', 'based on the passage'],
      priority: 6
    },
    {
      type: 'continue',
      keywords: ['continue', 'next paragraph', 'following', 'subsequent', 'logical continuation'],
      patterns: [
        /most.*likely.*continue/i,
        /next.*paragraph.*discuss/i,
        /author.*would.*probably/i,
        /logical.*continuation/i,
        /passage.*might.*next/i
      ],
      questionStarters: ['the passage would most likely continue', 'the next paragraph', 'which would logically follow'],
      priority: 5
    },
    {
      type: 'organization',
      keywords: ['organized', 'structure', 'arranged', 'development', 'progression'],
      patterns: [
        /passage.*organized/i,
        /structure.*of.*passage/i,
        /passage.*develops/i,
        /organization.*of.*ideas/i,
        /progression.*of.*argument/i
      ],
      questionStarters: ['the passage is organized', 'the structure of the passage', 'the passage develops'],
      priority: 6
    },
    {
      type: 'comparative',
      keywords: ['both passages', 'two passages', 'passage A', 'passage B', 'differ', 'contrast'],
      patterns: [
        /both.*passages/i,
        /two.*passages/i,
        /passage.*A.*and.*passage.*B/i,
        /passages.*differ/i,
        /contrast.*between.*passages/i
      ],
      questionStarters: ['both passages', 'the two passages', 'passage A and passage B'],
      priority: 10 // High priority for comparative questions
    }
  ]

  /**
   * Classify reading comprehension question
   */
  static classify(
    questionStem: string,
    passage?: ReadingComprehensionPassage,
    answerChoices?: string[]
  ): RCClassificationResult {
    const normalizedStem = questionStem.toLowerCase()
    const matches: Array<{
      type: ReadingComprehensionQuestionType
      score: number
      indicators: string[]
    }> = []

    // Check each type indicator
    for (const indicator of this.TYPE_INDICATORS) {
      let score = 0
      const foundIndicators: string[] = []

      // Check question starters
      for (const starter of indicator.questionStarters) {
        if (normalizedStem.startsWith(starter.toLowerCase())) {
          score += 5
          foundIndicators.push(`Question starter: "${starter}"`)
        }
      }

      // Check keywords
      for (const keyword of indicator.keywords) {
        if (normalizedStem.includes(keyword.toLowerCase())) {
          score += 3
          foundIndicators.push(`Keyword: "${keyword}"`)
        }
      }

      // Check patterns
      for (const pattern of indicator.patterns) {
        const match = pattern.exec(questionStem)
        if (match) {
          score += 4
          foundIndicators.push(`Pattern: "${match[0]}"`)
        }
      }

      // Apply priority weighting
      score = score * (indicator.priority / 10)

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
        primaryType: 'detail', // Default fallback
        confidence: 0.3,
        indicators: [],
        reasoning: 'No clear question type indicators found, defaulting to detail question',
        difficulty: 5,
        estimatedTime: 60,
        requiredSkills: ['basic comprehension']
      }
    }

    const topMatch = matches[0]
    const totalScore = matches.reduce((sum, match) => sum + match.score, 0)
    const confidence = Math.min(topMatch.score / Math.max(totalScore, 1), 1)

    // Assess difficulty
    const difficultyFactors = this.assessDifficulty(
      questionStem,
      topMatch.type,
      passage,
      answerChoices
    )

    const difficulty = this.calculateOverallDifficulty(difficultyFactors)
    const estimatedTime = this.getEstimatedTime(topMatch.type, difficulty)
    const requiredSkills = this.getRequiredSkills(topMatch.type, difficultyFactors)

    return {
      primaryType: topMatch.type,
      confidence,
      secondaryType: matches[1]?.type,
      indicators: topMatch.indicators,
      reasoning: this.generateReasoning(topMatch.type, topMatch.indicators, confidence),
      difficulty,
      estimatedTime,
      requiredSkills
    }
  }

  /**
   * Batch classify multiple questions
   */
  static classifyBatch(
    questions: Array<{
      stem: string
      passage?: ReadingComprehensionPassage
      answerChoices?: string[]
    }>
  ): RCClassificationResult[] {
    return questions.map(q => this.classify(q.stem, q.passage, q.answerChoices))
  }

  /**
   * Get time recommendation for question type and difficulty
   */
  static getTimeRecommendation(
    type: ReadingComprehensionQuestionType,
    difficulty: number,
    passageLength?: number
  ): number {
    // Base times in seconds for each type (at difficulty 5)
    const baseTimes: Record<ReadingComprehensionQuestionType, number> = {
      main_point: 45,
      primary_purpose: 50,
      author_attitude: 60,
      tone: 55,
      strengthen: 70,
      weaken: 70,
      inference: 75,
      detail: 40,
      vocabulary: 35,
      function: 60,
      parallel: 80,
      application: 70,
      continue: 65,
      organization: 75,
      comparative: 90 // Takes longer due to multiple passages
    }

    let baseTime = baseTimes[type]

    // Adjust for difficulty (±40% max)
    const difficultyMultiplier = 0.6 + (difficulty / 10) * 0.8

    // Adjust for passage length if provided
    if (passageLength) {
      const lengthMultiplier = passageLength > 500 ? 1.2 : passageLength < 200 ? 0.8 : 1.0
      baseTime *= lengthMultiplier
    }

    return Math.round(baseTime * difficultyMultiplier)
  }

  /**
   * Private helper methods
   */

  private static assessDifficulty(
    questionStem: string,
    questionType: ReadingComprehensionQuestionType,
    passage?: ReadingComprehensionPassage,
    answerChoices?: string[]
  ): DifficultyFactors {
    // Assess inference level required
    const inferenceLevel = this.assessInferenceLevel(questionStem, questionType)

    // Assess text complexity (if passage provided)
    const textComplexity = passage ? this.assessTextComplexity(passage) : 3

    // Assess vocabulary demand
    const vocabularyDemand = this.assessVocabularyDemand(questionStem, answerChoices)

    // Check if multiple steps required
    const multipleSteps = this.requiresMultipleSteps(questionStem, questionType, answerChoices)

    return {
      inferenceLevel,
      textComplexity,
      vocabularyDemand,
      multipleSteps
    }
  }

  private static assessInferenceLevel(
    questionStem: string,
    questionType: ReadingComprehensionQuestionType
  ): number {
    // Direct questions require less inference
    const directTypes: ReadingComprehensionQuestionType[] = ['detail', 'vocabulary', 'organization']
    if (directTypes.includes(questionType)) return 1

    // High inference questions
    const inferenceTypes: ReadingComprehensionQuestionType[] = ['inference', 'author_attitude', 'tone', 'application']
    if (inferenceTypes.includes(questionType)) return 4

    // Check for inference indicators in stem
    const inferenceWords = ['imply', 'suggest', 'infer', 'conclude', 'assume']
    const hasInferenceWords = inferenceWords.some(word =>
      questionStem.toLowerCase().includes(word)
    )

    return hasInferenceWords ? 4 : 3
  }

  private static assessTextComplexity(passage: ReadingComprehensionPassage): number {
    if (passage.complexity) {
      return passage.complexity.overall === 'high' ? 5 :
             passage.complexity.overall === 'medium' ? 3 : 1
    }

    // Fallback based on word count and subject
    let complexity = 3

    if (passage.wordCount > 600) complexity += 1
    if (passage.wordCount < 300) complexity -= 1

    // Subject-based adjustments
    const complexSubjects = ['law', 'science', 'economics', 'medicine']
    if (complexSubjects.includes(passage.subject)) {
      complexity += 1
    }

    return Math.max(1, Math.min(5, complexity))
  }

  private static assessVocabularyDemand(questionStem: string, answerChoices?: string[]): number {
    const allText = [questionStem, ...(answerChoices || [])].join(' ')

    // Count complex words (8+ characters)
    const words = allText.split(/\s+/)
    const complexWords = words.filter(word => word.length >= 8).length
    const complexRatio = complexWords / words.length

    if (complexRatio > 0.3) return 5
    if (complexRatio > 0.2) return 4
    if (complexRatio > 0.1) return 3
    if (complexRatio > 0.05) return 2
    return 1
  }

  private static requiresMultipleSteps(
    questionStem: string,
    questionType: ReadingComprehensionQuestionType,
    answerChoices?: string[]
  ): boolean {
    // Some question types inherently require multiple steps
    const multiStepTypes: ReadingComprehensionQuestionType[] = [
      'strengthen', 'weaken', 'parallel', 'application', 'comparative'
    ]

    if (multiStepTypes.includes(questionType)) return true

    // Check for multi-step indicators
    const multiStepWords = ['first', 'then', 'both', 'not only', 'in order to']
    return multiStepWords.some(word =>
      questionStem.toLowerCase().includes(word)
    )
  }

  private static calculateOverallDifficulty(factors: DifficultyFactors): number {
    let difficulty = (factors.inferenceLevel + factors.textComplexity + factors.vocabularyDemand) / 3

    if (factors.multipleSteps) {
      difficulty += 1
    }

    return Math.max(1, Math.min(10, Math.round(difficulty)))
  }

  private static getEstimatedTime(
    type: ReadingComprehensionQuestionType,
    difficulty: number
  ): number {
    return this.getTimeRecommendation(type, difficulty)
  }

  private static getRequiredSkills(
    type: ReadingComprehensionQuestionType,
    factors: DifficultyFactors
  ): string[] {
    const skillMap: Record<ReadingComprehensionQuestionType, string[]> = {
      main_point: ['main idea identification', 'synthesis'],
      primary_purpose: ['author intent analysis', 'purpose identification'],
      author_attitude: ['tone analysis', 'perspective identification'],
      tone: ['stylistic analysis', 'mood identification'],
      strengthen: ['argument analysis', 'logical reasoning'],
      weaken: ['argument analysis', 'critical reasoning'],
      inference: ['logical deduction', 'implicit meaning'],
      detail: ['information location', 'literal comprehension'],
      vocabulary: ['context clues', 'word meaning'],
      function: ['structural analysis', 'purpose identification'],
      parallel: ['analogy recognition', 'pattern matching'],
      application: ['principle application', 'transfer skills'],
      continue: ['logical progression', 'structural prediction'],
      organization: ['structural analysis', 'pattern recognition'],
      comparative: ['synthesis', 'comparative analysis']
    }

    const skills = skillMap[type] || ['reading comprehension']

    // Add difficulty-based skills
    if (factors.inferenceLevel >= 4) {
      skills.push('advanced inference')
    }
    if (factors.vocabularyDemand >= 4) {
      skills.push('advanced vocabulary')
    }
    if (factors.multipleSteps) {
      skills.push('multi-step reasoning')
    }

    return [...new Set(skills)].slice(0, 4)
  }

  private static generateReasoning(
    type: ReadingComprehensionQuestionType,
    indicators: string[],
    confidence: number
  ): string {
    const typeDescriptions: Record<ReadingComprehensionQuestionType, string> = {
      main_point: 'This question asks you to identify the central theme or main argument of the passage',
      primary_purpose: 'This question asks you to determine why the author wrote the passage',
      author_attitude: 'This question asks you to identify the author\'s perspective or stance on the topic',
      tone: 'This question asks you to identify the emotional quality or style of the passage',
      strengthen: 'This question asks you to find information that would make the argument stronger',
      weaken: 'This question asks you to find information that would undermine the argument',
      inference: 'This question asks what can be logically concluded from the passage',
      detail: 'This question asks about specific information explicitly stated in the passage',
      vocabulary: 'This question asks about the meaning of a word as used in context',
      function: 'This question asks about the purpose or role of a specific part of the passage',
      parallel: 'This question asks you to find a situation analogous to one described in the passage',
      application: 'This question asks you to apply a principle or concept from the passage',
      continue: 'This question asks what would logically follow the passage',
      organization: 'This question asks about how the passage is structured or developed',
      comparative: 'This question asks you to compare or contrast information from multiple passages'
    }

    const confidenceLevel = confidence > 0.7 ? 'high' : confidence > 0.5 ? 'moderate' : 'low'

    return `${typeDescriptions[type]} (${confidenceLevel} confidence). Classification based on: ${indicators.join(', ')}`
  }
}