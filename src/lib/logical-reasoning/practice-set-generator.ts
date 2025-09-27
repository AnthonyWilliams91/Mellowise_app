/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Custom Practice Set Generator
 *
 * Generates personalized practice sets based on user performance,
 * weakness areas, and learning objectives.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type {
  LogicalReasoningQuestion,
  LogicalReasoningQuestionType,
  CustomPracticeSet,
  LRPracticeConfig,
  WeaknessAnalysis,
  QuestionTypePerformance
} from '@/types/logical-reasoning'

/**
 * Practice Set Generation Criteria
 */
export interface GenerationCriteria {
  targetQuestionTypes?: LogicalReasoningQuestionType[]
  difficultyRange?: { min: number; max: number }
  questionCount: number
  focusOnWeaknesses: boolean
  includeVariety: boolean
  timeLimit?: number // minutes
  excludeRecentQuestions?: boolean
  customWeights?: Partial<Record<LogicalReasoningQuestionType, number>>
}

/**
 * Question Pool Filter
 */
interface QuestionFilter {
  questionTypes?: LogicalReasoningQuestionType[]
  difficultyMin?: number
  difficultyMax?: number
  excludeIds?: string[]
  requireUnattempted?: boolean
  requireIncorrect?: boolean
}

/**
 * Selection Strategy
 */
type SelectionStrategy =
  | 'weakness_focused'   // Prioritize weak areas
  | 'balanced_practice'  // Even distribution across types
  | 'difficulty_ladder'  // Gradual difficulty increase
  | 'review_mistakes'    // Focus on previously incorrect
  | 'time_pressure'      // Shorter time recommendations
  | 'comprehensive'      // Cover all types equally

/**
 * Generated Practice Set Result
 */
export interface GeneratedPracticeSet extends CustomPracticeSet {
  questions: LogicalReasoningQuestion[]
  strategy: SelectionStrategy
  rationale: string
  difficultyDistribution: Record<string, number>
  typeDistribution: Record<LogicalReasoningQuestionType, number>
  estimatedAccuracy: number
  adaptiveRecommendations: string[]
}

export class PracticeSetGenerator {
  private questionPool: LogicalReasoningQuestion[] = []
  private userPerformance: Map<LogicalReasoningQuestionType, QuestionTypePerformance> = new Map()
  private recentQuestionIds: Set<string> = new Set()

  constructor(
    questionPool: LogicalReasoningQuestion[],
    userPerformanceData?: QuestionTypePerformance[],
    recentQuestionIds?: string[]
  ) {
    this.questionPool = questionPool

    if (userPerformanceData) {
      userPerformanceData.forEach(perf => {
        this.userPerformance.set(perf.questionType, perf)
      })
    }

    if (recentQuestionIds) {
      this.recentQuestionIds = new Set(recentQuestionIds)
    }
  }

  /**
   * Generate a custom practice set based on criteria
   */
  generatePracticeSet(
    criteria: GenerationCriteria,
    userId: string,
    name?: string
  ): GeneratedPracticeSet {
    const strategy = this.determineStrategy(criteria)
    const selectedQuestions = this.selectQuestions(criteria, strategy)

    const practiceSet: GeneratedPracticeSet = {
      id: this.generateId(),
      name: name || this.generateName(strategy, criteria),
      description: this.generateDescription(strategy, criteria),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      questionIds: selectedQuestions.map(q => q.id),
      questions: selectedQuestions,
      targetWeaknesses: this.extractTargetWeaknesses(criteria, strategy),
      estimatedDuration: this.calculateEstimatedDuration(selectedQuestions),
      difficultyLevel: this.determineDifficultyLevel(selectedQuestions),
      focusAreas: this.generateFocusAreas(selectedQuestions, strategy),
      strategy,
      rationale: this.generateRationale(strategy, criteria, selectedQuestions),
      difficultyDistribution: this.analyzeDifficultyDistribution(selectedQuestions),
      typeDistribution: this.analyzeTypeDistribution(selectedQuestions),
      estimatedAccuracy: this.estimateAccuracy(selectedQuestions),
      adaptiveRecommendations: this.generateAdaptiveRecommendations(selectedQuestions, strategy)
    }

    return practiceSet
  }

  /**
   * Generate weakness-focused practice set
   */
  generateWeaknessPracticeSet(
    weaknessAnalysis: WeaknessAnalysis,
    questionCount: number = 20
  ): GeneratedPracticeSet {
    const criteria: GenerationCriteria = {
      targetQuestionTypes: weaknessAnalysis.weakestTypes.slice(0, 3),
      questionCount,
      focusOnWeaknesses: true,
      includeVariety: false,
      excludeRecentQuestions: true,
      customWeights: this.createWeaknessWeights(weaknessAnalysis)
    }

    return this.generatePracticeSet(criteria, weaknessAnalysis.userId, 'Targeted Weakness Practice')
  }

  /**
   * Generate diagnostic practice set for assessment
   */
  generateDiagnosticSet(questionCount: number = 25): GeneratedPracticeSet {
    const criteria: GenerationCriteria = {
      questionCount,
      focusOnWeaknesses: false,
      includeVariety: true,
      difficultyRange: { min: 3, max: 8 }
    }

    // Ensure even distribution across question types
    const allTypes: LogicalReasoningQuestionType[] = [
      'strengthen', 'weaken', 'assumption', 'flaw', 'must_be_true',
      'main_point', 'method_of_reasoning', 'parallel_reasoning',
      'principle', 'resolve_paradox'
    ]

    criteria.targetQuestionTypes = allTypes

    return this.generatePracticeSet(criteria, 'diagnostic', 'Diagnostic Assessment')
  }

  /**
   * Generate timed practice set with time pressure
   */
  generateTimedPracticeSet(
    timeLimit: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): GeneratedPracticeSet {
    const difficultyRanges = {
      easy: { min: 1, max: 4 },
      medium: { min: 4, max: 7 },
      hard: { min: 7, max: 10 }
    }

    const avgTimePerQuestion = 90 // seconds
    const questionCount = Math.floor((timeLimit * 60) / avgTimePerQuestion)

    const criteria: GenerationCriteria = {
      questionCount,
      difficultyRange: difficultyRanges[difficulty],
      timeLimit,
      focusOnWeaknesses: false,
      includeVariety: true
    }

    return this.generatePracticeSet(criteria, 'timed', `Timed Practice - ${difficulty}`)
  }

  /**
   * Determine the best strategy based on criteria
   */
  private determineStrategy(criteria: GenerationCriteria): SelectionStrategy {
    if (criteria.focusOnWeaknesses && this.userPerformance.size > 0) {
      return 'weakness_focused'
    }

    if (criteria.timeLimit && criteria.timeLimit < 60) {
      return 'time_pressure'
    }

    if (criteria.targetQuestionTypes && criteria.targetQuestionTypes.length <= 2) {
      return 'review_mistakes'
    }

    if (criteria.includeVariety) {
      return 'balanced_practice'
    }

    if (criteria.difficultyRange &&
        criteria.difficultyRange.max - criteria.difficultyRange.min >= 5) {
      return 'difficulty_ladder'
    }

    return 'comprehensive'
  }

  /**
   * Select questions based on criteria and strategy
   */
  private selectQuestions(
    criteria: GenerationCriteria,
    strategy: SelectionStrategy
  ): LogicalReasoningQuestion[] {
    const availableQuestions = this.applyBasicFilters(criteria)

    switch (strategy) {
      case 'weakness_focused':
        return this.selectWeaknessFocused(availableQuestions, criteria)
      case 'balanced_practice':
        return this.selectBalanced(availableQuestions, criteria)
      case 'difficulty_ladder':
        return this.selectDifficultyLadder(availableQuestions, criteria)
      case 'review_mistakes':
        return this.selectReviewMistakes(availableQuestions, criteria)
      case 'time_pressure':
        return this.selectTimePressure(availableQuestions, criteria)
      case 'comprehensive':
      default:
        return this.selectComprehensive(availableQuestions, criteria)
    }
  }

  /**
   * Apply basic filters to question pool
   */
  private applyBasicFilters(criteria: GenerationCriteria): LogicalReasoningQuestion[] {
    return this.questionPool.filter(question => {
      // Question type filter
      if (criteria.targetQuestionTypes &&
          !criteria.targetQuestionTypes.includes(question.questionType)) {
        return false
      }

      // Difficulty filter
      const difficulty = this.calculateQuestionDifficulty(question)
      if (criteria.difficultyRange) {
        if (difficulty < criteria.difficultyRange.min ||
            difficulty > criteria.difficultyRange.max) {
          return false
        }
      }

      // Exclude recent questions
      if (criteria.excludeRecentQuestions &&
          this.recentQuestionIds.has(question.id)) {
        return false
      }

      return true
    })
  }

  /**
   * Select questions focusing on weaknesses
   */
  private selectWeaknessFocused(
    questions: LogicalReasoningQuestion[],
    criteria: GenerationCriteria
  ): LogicalReasoningQuestion[] {
    // Get weakness priorities
    const weaknessScores = new Map<LogicalReasoningQuestionType, number>()

    this.userPerformance.forEach((perf, type) => {
      // Lower accuracy = higher weakness score
      const score = 1 - perf.accuracy
      weaknessScores.set(type, score)
    })

    // Sort questions by weakness priority
    const sortedQuestions = questions.sort((a, b) => {
      const scoreA = weaknessScores.get(a.questionType) || 0
      const scoreB = weaknessScores.get(b.questionType) || 0
      return scoreB - scoreA
    })

    return sortedQuestions.slice(0, criteria.questionCount)
  }

  /**
   * Select balanced distribution across types
   */
  private selectBalanced(
    questions: LogicalReasoningQuestion[],
    criteria: GenerationCriteria
  ): LogicalReasoningQuestion[] {
    const targetTypes = criteria.targetQuestionTypes ||
                       [...new Set(questions.map(q => q.questionType))]

    const questionsPerType = Math.floor(criteria.questionCount / targetTypes.length)
    const remainder = criteria.questionCount % targetTypes.length

    const selected: LogicalReasoningQuestion[] = []

    targetTypes.forEach((type, index) => {
      const typeQuestions = questions.filter(q => q.questionType === type)
      const countForType = questionsPerType + (index < remainder ? 1 : 0)

      // Randomly select from available questions of this type
      const shuffled = this.shuffleArray([...typeQuestions])
      selected.push(...shuffled.slice(0, countForType))
    })

    return this.shuffleArray(selected)
  }

  /**
   * Select questions in difficulty ladder pattern
   */
  private selectDifficultyLadder(
    questions: LogicalReasoningQuestion[],
    criteria: GenerationCriteria
  ): LogicalReasoningQuestion[] {
    // Sort by difficulty
    const sortedByDifficulty = questions.sort((a, b) => {
      return this.calculateQuestionDifficulty(a) - this.calculateQuestionDifficulty(b)
    })

    // Create difficulty ladder: easier questions first, gradually increasing
    const selected: LogicalReasoningQuestion[] = []
    const step = Math.max(1, Math.floor(sortedByDifficulty.length / criteria.questionCount))

    for (let i = 0; i < criteria.questionCount && i * step < sortedByDifficulty.length; i++) {
      selected.push(sortedByDifficulty[i * step])
    }

    return selected
  }

  /**
   * Select questions for reviewing mistakes
   */
  private selectReviewMistakes(
    questions: LogicalReasoningQuestion[],
    criteria: GenerationCriteria
  ): LogicalReasoningQuestion[] {
    // Prioritize question types with lower accuracy
    const typesByPerformance = Array.from(this.userPerformance.entries())
      .sort(([, a], [, b]) => a.accuracy - b.accuracy)
      .map(([type]) => type)

    const selected: LogicalReasoningQuestion[] = []

    for (const type of typesByPerformance) {
      const typeQuestions = questions
        .filter(q => q.questionType === type)
        .slice(0, Math.ceil(criteria.questionCount / typesByPerformance.length))

      selected.push(...typeQuestions)

      if (selected.length >= criteria.questionCount) break
    }

    return selected.slice(0, criteria.questionCount)
  }

  /**
   * Select questions optimized for time pressure
   */
  private selectTimePressure(
    questions: LogicalReasoningQuestion[],
    criteria: GenerationCriteria
  ): LogicalReasoningQuestion[] {
    // Prioritize questions with shorter recommended times
    const sortedByTime = questions.sort((a, b) => {
      return a.timeRecommendation - b.timeRecommendation
    })

    return sortedByTime.slice(0, criteria.questionCount)
  }

  /**
   * Comprehensive selection across all areas
   */
  private selectComprehensive(
    questions: LogicalReasoningQuestion[],
    criteria: GenerationCriteria
  ): LogicalReasoningQuestion[] {
    // Ensure representation from all major question types
    const allTypes: LogicalReasoningQuestionType[] = [
      'strengthen', 'weaken', 'assumption', 'flaw', 'must_be_true'
    ]

    const selected: LogicalReasoningQuestion[] = []
    const baseCount = Math.floor(criteria.questionCount / allTypes.length)

    allTypes.forEach(type => {
      const typeQuestions = questions.filter(q => q.questionType === type)
      const shuffled = this.shuffleArray([...typeQuestions])
      selected.push(...shuffled.slice(0, baseCount))
    })

    // Fill remaining slots randomly
    const remaining = criteria.questionCount - selected.length
    if (remaining > 0) {
      const availableQuestions = questions.filter(q =>
        !selected.some(s => s.id === q.id)
      )
      const shuffled = this.shuffleArray([...availableQuestions])
      selected.push(...shuffled.slice(0, remaining))
    }

    return this.shuffleArray(selected)
  }

  /**
   * Calculate question difficulty score
   */
  private calculateQuestionDifficulty(question: LogicalReasoningQuestion): number {
    if (!question.difficultyFactors) return 5

    const {
      abstractness,
      argumentComplexity,
      vocabularyLevel,
      trapDensity
    } = question.difficultyFactors

    return Math.round(
      (abstractness * 0.3 +
       argumentComplexity * 0.4 +
       vocabularyLevel * 0.2 +
       trapDensity * 0.1)
    )
  }

  /**
   * Generate practice set name based on strategy
   */
  private generateName(strategy: SelectionStrategy, criteria: GenerationCriteria): string {
    const names = {
      weakness_focused: 'Targeted Weakness Practice',
      balanced_practice: 'Balanced Practice Set',
      difficulty_ladder: 'Progressive Difficulty Practice',
      review_mistakes: 'Mistake Review Session',
      time_pressure: 'Speed Practice Set',
      comprehensive: 'Comprehensive Review Set'
    }

    return names[strategy]
  }

  /**
   * Generate practice set description
   */
  private generateDescription(strategy: SelectionStrategy, criteria: GenerationCriteria): string {
    const baseDescription = `${criteria.questionCount} logical reasoning questions`

    switch (strategy) {
      case 'weakness_focused':
        return `${baseDescription} focusing on your weakest question types to target improvement areas.`
      case 'balanced_practice':
        return `${baseDescription} with balanced coverage across different question types.`
      case 'difficulty_ladder':
        return `${baseDescription} arranged in progressive difficulty to build confidence gradually.`
      case 'review_mistakes':
        return `${baseDescription} targeting question types where you need the most improvement.`
      case 'time_pressure':
        return `${baseDescription} optimized for time-pressured practice with efficient questions.`
      case 'comprehensive':
        return `${baseDescription} providing comprehensive coverage of logical reasoning topics.`
    }
  }

  /**
   * Helper methods for analysis
   */
  private analyzeDifficultyDistribution(questions: LogicalReasoningQuestion[]): Record<string, number> {
    const distribution: Record<string, number> = {
      'Easy (1-3)': 0,
      'Medium (4-6)': 0,
      'Hard (7-10)': 0
    }

    questions.forEach(q => {
      const difficulty = this.calculateQuestionDifficulty(q)
      if (difficulty <= 3) distribution['Easy (1-3)']++
      else if (difficulty <= 6) distribution['Medium (4-6)']++
      else distribution['Hard (7-10)']++
    })

    return distribution
  }

  private analyzeTypeDistribution(questions: LogicalReasoningQuestion[]): Record<LogicalReasoningQuestionType, number> {
    const distribution = {} as Record<LogicalReasoningQuestionType, number>

    questions.forEach(q => {
      distribution[q.questionType] = (distribution[q.questionType] || 0) + 1
    })

    return distribution
  }

  private calculateEstimatedDuration(questions: LogicalReasoningQuestion[]): number {
    const totalSeconds = questions.reduce((sum, q) => sum + q.timeRecommendation, 0)
    return Math.round(totalSeconds / 60) // Convert to minutes
  }

  private determineDifficultyLevel(questions: LogicalReasoningQuestion[]): 'beginner' | 'intermediate' | 'advanced' | 'mixed' {
    const difficulties = questions.map(q => this.calculateQuestionDifficulty(q))
    const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length
    const range = Math.max(...difficulties) - Math.min(...difficulties)

    if (range >= 5) return 'mixed'
    if (avgDifficulty <= 3) return 'beginner'
    if (avgDifficulty <= 6) return 'intermediate'
    return 'advanced'
  }

  private generateFocusAreas(questions: LogicalReasoningQuestion[], strategy: SelectionStrategy): string[] {
    const types = [...new Set(questions.map(q => q.questionType))]
    const areas = types.map(type => this.getTypeDescription(type))

    // Add strategy-specific focus areas
    if (strategy === 'weakness_focused') {
      areas.push('Targeted improvement')
    }
    if (strategy === 'time_pressure') {
      areas.push('Time management')
    }

    return areas.slice(0, 5)
  }

  private getTypeDescription(type: LogicalReasoningQuestionType): string {
    const descriptions = {
      strengthen: 'Argument strengthening',
      weaken: 'Argument weakening',
      assumption: 'Assumption identification',
      flaw: 'Logical flaw recognition',
      must_be_true: 'Logical inference',
      main_point: 'Conclusion identification',
      method_of_reasoning: 'Argumentation analysis',
      parallel_reasoning: 'Structural similarity',
      principle: 'Principle application',
      resolve_paradox: 'Paradox resolution',
      role_in_argument: 'Statement role analysis',
      point_at_issue: 'Disagreement identification',
      necessary_assumption: 'Necessary assumption',
      sufficient_assumption: 'Sufficient assumption',
      evaluate_argument: 'Argument evaluation'
    }

    return descriptions[type] || type
  }

  /**
   * Utility methods
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private generateId(): string {
    return `practice-set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private extractTargetWeaknesses(
    criteria: GenerationCriteria,
    strategy: SelectionStrategy
  ): LogicalReasoningQuestionType[] | undefined {
    if (strategy === 'weakness_focused' && criteria.targetQuestionTypes) {
      return criteria.targetQuestionTypes.slice(0, 3)
    }
    return undefined
  }

  private createWeaknessWeights(analysis: WeaknessAnalysis): Partial<Record<LogicalReasoningQuestionType, number>> {
    const weights: Partial<Record<LogicalReasoningQuestionType, number>> = {}

    analysis.recommendations.forEach(rec => {
      const weight = rec.priority === 'high' ? 3 :
                    rec.priority === 'medium' ? 2 : 1
      weights[rec.type] = weight
    })

    return weights
  }

  private generateRationale(
    strategy: SelectionStrategy,
    criteria: GenerationCriteria,
    questions: LogicalReasoningQuestion[]
  ): string {
    const questionCount = questions.length
    const types = [...new Set(questions.map(q => q.questionType))]

    let rationale = `Selected ${questionCount} questions using ${strategy} strategy. `

    switch (strategy) {
      case 'weakness_focused':
        rationale += `Questions focus on your weakest areas: ${types.slice(0, 3).join(', ')}.`
        break
      case 'balanced_practice':
        rationale += `Questions provide balanced coverage across ${types.length} question types.`
        break
      case 'difficulty_ladder':
        rationale += `Questions are arranged in progressive difficulty to build confidence.`
        break
    }

    return rationale
  }

  private estimateAccuracy(questions: LogicalReasoningQuestion[]): number {
    if (this.userPerformance.size === 0) return 0.65 // Default estimate

    let totalAccuracy = 0
    let weightSum = 0

    questions.forEach(q => {
      const perf = this.userPerformance.get(q.questionType)
      if (perf) {
        totalAccuracy += perf.accuracy
        weightSum += 1
      }
    })

    return weightSum > 0 ? totalAccuracy / weightSum : 0.65
  }

  private generateAdaptiveRecommendations(
    questions: LogicalReasoningQuestion[],
    strategy: SelectionStrategy
  ): string[] {
    const recommendations: string[] = []

    // Strategy-specific recommendations
    if (strategy === 'weakness_focused') {
      recommendations.push('Focus on understanding why wrong answers are incorrect')
      recommendations.push('Take your time with these challenging question types')
    }

    if (strategy === 'time_pressure') {
      recommendations.push('Practice eliminating answers quickly')
      recommendations.push('Don\'t spend more than 90 seconds per question')
    }

    // General recommendations
    const avgDifficulty = questions.reduce((sum, q) => sum + this.calculateQuestionDifficulty(q), 0) / questions.length

    if (avgDifficulty > 7) {
      recommendations.push('These are challenging questions - read carefully')
    }

    return recommendations
  }
}