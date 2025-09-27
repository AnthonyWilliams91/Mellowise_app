/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Wrong Answer Pattern Detector Service
 *
 * Analyzes wrong answers to identify common patterns and provide
 * targeted feedback to help students avoid similar mistakes.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type {
  LogicalReasoningQuestion,
  LogicalReasoningQuestionType,
  WrongAnswerPattern,
  AnswerAnalysis,
  ArgumentStructure
} from '@/types/logical-reasoning'

/**
 * Pattern Detection Results
 */
export interface PatternDetectionResult {
  answerId: string
  patterns: WrongAnswerPattern[]
  confidence: number // 0-1
  explanation: string
  trap?: string
  commonMistake?: string
}

/**
 * Pattern Analysis Configuration
 */
interface PatternAnalysisConfig {
  questionType: LogicalReasoningQuestionType
  stimulus: string
  questionStem: string
  correctAnswer: string
  argumentStructure?: ArgumentStructure
}

export class WrongAnswerPatternDetector {
  /**
   * Detect patterns in a wrong answer choice
   */
  static detectPatterns(
    answerChoice: string,
    config: PatternAnalysisConfig
  ): PatternDetectionResult {
    const patterns: WrongAnswerPattern[] = []
    let confidence = 0
    const explanations: string[] = []

    // Analyze based on question type
    const typePatterns = this.detectTypeSpecificPatterns(answerChoice, config)
    patterns.push(...typePatterns.patterns)
    confidence += typePatterns.confidence
    explanations.push(...typePatterns.explanations)

    // Analyze general patterns
    const generalPatterns = this.detectGeneralPatterns(answerChoice, config)
    patterns.push(...generalPatterns.patterns)
    confidence += generalPatterns.confidence
    explanations.push(...generalPatterns.explanations)

    // Analyze structural patterns
    const structuralPatterns = this.detectStructuralPatterns(answerChoice, config)
    patterns.push(...structuralPatterns.patterns)
    confidence += structuralPatterns.confidence
    explanations.push(...structuralPatterns.explanations)

    // Remove duplicates and calculate final confidence
    const uniquePatterns = [...new Set(patterns)]
    const finalConfidence = Math.min(confidence / 3, 1)

    return {
      answerId: answerChoice,
      patterns: uniquePatterns,
      confidence: finalConfidence,
      explanation: explanations.join(' '),
      trap: this.identifyTrap(uniquePatterns, config.questionType),
      commonMistake: this.identifyCommonMistake(uniquePatterns, config.questionType)
    }
  }

  /**
   * Detect question type-specific patterns
   */
  private static detectTypeSpecificPatterns(
    answerChoice: string,
    config: PatternAnalysisConfig
  ): { patterns: WrongAnswerPattern[], confidence: number, explanations: string[] } {
    const patterns: WrongAnswerPattern[] = []
    const explanations: string[] = []
    let confidence = 0

    const lower = answerChoice.toLowerCase()
    const { questionType, stimulus, correctAnswer } = config

    switch (questionType) {
      case 'strengthen':
      case 'weaken':
        // Check for opposite answer
        if (this.hasOppositeEffect(lower, questionType)) {
          patterns.push('opposite_answer')
          confidence += 0.8
          explanations.push(`This answer ${questionType === 'strengthen' ? 'weakens' : 'strengthens'} rather than ${questionType}s the argument.`)
        }

        // Check for out of scope
        if (this.isOutOfScope(lower, stimulus)) {
          patterns.push('out_of_scope')
          confidence += 0.6
          explanations.push('This answer introduces information not relevant to the argument.')
        }
        break

      case 'assumption':
      case 'necessary_assumption':
        // Check for too extreme
        if (this.isTooExtreme(lower)) {
          patterns.push('too_extreme')
          confidence += 0.7
          explanations.push('This answer makes claims that are too strong or absolute for the argument to require.')
        }

        // Check for premise repeat
        if (this.repeatsStimulus(lower, stimulus)) {
          patterns.push('premise_repeat')
          confidence += 0.8
          explanations.push('This answer restates information already given in the stimulus.')
        }
        break

      case 'flaw':
        // Check for conclusion repeat
        if (this.repeatsConclusion(lower, config.argumentStructure?.mainConclusion || '')) {
          patterns.push('conclusion_repeat')
          confidence += 0.7
          explanations.push('This answer restates the conclusion rather than identifying the flaw.')
        }

        // Check for irrelevant distinction
        if (this.makesIrrelevantDistinction(lower)) {
          patterns.push('irrelevant_distinction')
          confidence += 0.6
          explanations.push('This answer focuses on a distinction that doesn\'t affect the argument\'s validity.')
        }
        break

      case 'must_be_true':
        // Check for too extreme
        if (this.isTooExtreme(lower)) {
          patterns.push('too_extreme')
          confidence += 0.7
          explanations.push('This answer goes beyond what can be definitively concluded from the stimulus.')
        }

        // Check for reverse causation
        if (this.hasReverseCausation(lower, stimulus)) {
          patterns.push('reverse_causation')
          confidence += 0.6
          explanations.push('This answer reverses the cause and effect relationship presented in the stimulus.')
        }
        break

      case 'parallel_reasoning':
        // Check for wrong comparison
        if (this.hasWrongComparison(lower, stimulus)) {
          patterns.push('wrong_comparison')
          confidence += 0.6
          explanations.push('This answer has a different logical structure than the original argument.')
        }
        break
    }

    return { patterns, confidence, explanations }
  }

  /**
   * Detect general patterns applicable to all question types
   */
  private static detectGeneralPatterns(
    answerChoice: string,
    config: PatternAnalysisConfig
  ): { patterns: WrongAnswerPattern[], confidence: number, explanations: string[] } {
    const patterns: WrongAnswerPattern[] = []
    const explanations: string[] = []
    let confidence = 0

    const lower = answerChoice.toLowerCase()
    const { stimulus } = config

    // Check for temporal confusion
    if (this.hasTemporalConfusion(lower, stimulus)) {
      patterns.push('temporal_confusion')
      confidence += 0.5
      explanations.push('This answer confuses past, present, or future time relationships.')
    }

    // Check for partially correct
    if (this.isPartiallyCorrect(lower, config.correctAnswer)) {
      patterns.push('partially_correct')
      confidence += 0.4
      explanations.push('This answer contains some correct elements but misses key aspects.')
    }

    return { patterns, confidence, explanations }
  }

  /**
   * Detect structural patterns based on argument analysis
   */
  private static detectStructuralPatterns(
    answerChoice: string,
    config: PatternAnalysisConfig
  ): { patterns: WrongAnswerPattern[], confidence: number, explanations: string[] } {
    const patterns: WrongAnswerPattern[] = []
    const explanations: string[] = []
    let confidence = 0

    if (!config.argumentStructure) {
      return { patterns, confidence, explanations }
    }

    const lower = answerChoice.toLowerCase()
    const { argumentStructure } = config

    // Check if answer repeats a premise
    const repeatedPremise = argumentStructure.mainPremises.some(premise =>
      this.textSimilarity(lower, premise.toLowerCase()) > 0.7
    )

    if (repeatedPremise) {
      patterns.push('premise_repeat')
      confidence += 0.7
      explanations.push('This answer essentially restates a premise from the argument.')
    }

    // Check if answer repeats the conclusion
    if (argumentStructure.mainConclusion &&
        this.textSimilarity(lower, argumentStructure.mainConclusion.toLowerCase()) > 0.7) {
      patterns.push('conclusion_repeat')
      confidence += 0.8
      explanations.push('This answer restates the argument\'s conclusion.')
    }

    return { patterns, confidence, explanations }
  }

  /**
   * Check if answer has opposite effect for strengthen/weaken questions
   */
  private static hasOppositeEffect(answerChoice: string, questionType: 'strengthen' | 'weaken'): boolean {
    const strengthenWords = ['support', 'confirm', 'validate', 'prove', 'establish', 'demonstrate']
    const weakenWords = ['undermine', 'contradict', 'challenge', 'disprove', 'refute', 'counter']

    const targetWords = questionType === 'strengthen' ? weakenWords : strengthenWords

    return targetWords.some(word => answerChoice.includes(word))
  }

  /**
   * Check if answer is out of scope
   */
  private static isOutOfScope(answerChoice: string, stimulus: string): boolean {
    // Look for completely new topics or concepts not mentioned in stimulus
    const stimulusWords = new Set(stimulus.toLowerCase().split(/\W+/).filter(w => w.length > 3))
    const answerWords = answerChoice.split(/\W+/).filter(w => w.length > 3)

    const newWords = answerWords.filter(word => !stimulusWords.has(word.toLowerCase()))

    // If more than 30% of meaningful words are new, likely out of scope
    return newWords.length / answerWords.length > 0.3
  }

  /**
   * Check if answer is too extreme
   */
  private static isTooExtreme(answerChoice: string): boolean {
    const extremeWords = [
      'all', 'none', 'never', 'always', 'every', 'impossible', 'certain',
      'definitely', 'absolutely', 'completely', 'entirely', 'totally',
      'must', 'cannot', 'will', 'only'
    ]

    return extremeWords.some(word => answerChoice.toLowerCase().includes(word))
  }

  /**
   * Check if answer repeats stimulus content
   */
  private static repeatsStimulus(answerChoice: string, stimulus: string): boolean {
    const sentences = stimulus.split(/[.!?]/).filter(s => s.trim())

    return sentences.some(sentence =>
      this.textSimilarity(answerChoice.toLowerCase(), sentence.toLowerCase()) > 0.6
    )
  }

  /**
   * Check if answer repeats conclusion
   */
  private static repeatsConclusion(answerChoice: string, conclusion: string): boolean {
    if (!conclusion) return false
    return this.textSimilarity(answerChoice.toLowerCase(), conclusion.toLowerCase()) > 0.6
  }

  /**
   * Check for irrelevant distinctions
   */
  private static makesIrrelevantDistinction(answerChoice: string): boolean {
    const irrelevantPatterns = [
      /fails to distinguish between/i,
      /assumes that.*are identical/i,
      /treats.*as equivalent/i,
      /confuses.*with/i
    ]

    return irrelevantPatterns.some(pattern => pattern.test(answerChoice))
  }

  /**
   * Check for reverse causation
   */
  private static hasReverseCausation(answerChoice: string, stimulus: string): boolean {
    // Look for causal language that might be reversed
    const causalWords = ['causes', 'leads to', 'results in', 'produces', 'creates', 'brings about']

    const answerHasCausal = causalWords.some(word => answerChoice.toLowerCase().includes(word))
    const stimulusHasCausal = causalWords.some(word => stimulus.toLowerCase().includes(word))

    return answerHasCausal && stimulusHasCausal
  }

  /**
   * Check for wrong comparison in parallel reasoning
   */
  private static hasWrongComparison(answerChoice: string, stimulus: string): boolean {
    // This would require more sophisticated structural analysis
    // For now, use simple heuristics
    const stimulusStructure = this.extractSimpleStructure(stimulus)
    const answerStructure = this.extractSimpleStructure(answerChoice)

    return stimulusStructure !== answerStructure
  }

  /**
   * Check for temporal confusion
   */
  private static hasTemporalConfusion(answerChoice: string, stimulus: string): boolean {
    const pastWords = ['was', 'were', 'had', 'did', 'used to']
    const futureWords = ['will', 'shall', 'going to', 'would']
    const presentWords = ['is', 'are', 'has', 'does']

    const stimulusTense = this.dominantTense(stimulus, pastWords, presentWords, futureWords)
    const answerTense = this.dominantTense(answerChoice, pastWords, presentWords, futureWords)

    return stimulusTense !== answerTense && stimulusTense !== 'mixed' && answerTense !== 'mixed'
  }

  /**
   * Check if answer is partially correct
   */
  private static isPartiallyCorrect(answerChoice: string, correctAnswer: string): boolean {
    return this.textSimilarity(answerChoice.toLowerCase(), correctAnswer.toLowerCase()) > 0.3 &&
           this.textSimilarity(answerChoice.toLowerCase(), correctAnswer.toLowerCase()) < 0.7
  }

  /**
   * Calculate text similarity between two strings
   */
  private static textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\W+/).filter(w => w.length > 2))
    const words2 = new Set(text2.split(/\W+/).filter(w => w.length > 2))

    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  /**
   * Extract simple structural pattern from text
   */
  private static extractSimpleStructure(text: string): string {
    // Very basic structure extraction
    if (text.includes('if') && text.includes('then')) return 'conditional'
    if (text.includes('either') && text.includes('or')) return 'disjunctive'
    if (text.includes('because')) return 'causal'
    if (text.includes('similar') || text.includes('like')) return 'analogical'
    return 'basic'
  }

  /**
   * Determine dominant tense in text
   */
  private static dominantTense(
    text: string,
    pastWords: string[],
    presentWords: string[],
    futureWords: string[]
  ): string {
    const lower = text.toLowerCase()
    const pastCount = pastWords.filter(word => lower.includes(word)).length
    const presentCount = presentWords.filter(word => lower.includes(word)).length
    const futureCount = futureWords.filter(word => lower.includes(word)).length

    const max = Math.max(pastCount, presentCount, futureCount)
    if (max === 0) return 'mixed'

    if (pastCount === max) return 'past'
    if (presentCount === max) return 'present'
    if (futureCount === max) return 'future'
    return 'mixed'
  }

  /**
   * Identify specific trap based on patterns
   */
  private static identifyTrap(
    patterns: WrongAnswerPattern[],
    questionType: LogicalReasoningQuestionType
  ): string | undefined {
    if (patterns.includes('opposite_answer')) {
      return `This answer does the opposite of what ${questionType} questions ask for`
    }

    if (patterns.includes('too_extreme')) {
      return 'Uses absolute language that goes beyond what the argument requires'
    }

    if (patterns.includes('out_of_scope')) {
      return 'Introduces information not discussed in the stimulus'
    }

    if (patterns.includes('premise_repeat')) {
      return 'Restates information already given rather than providing new insight'
    }

    return undefined
  }

  /**
   * Identify common mistake based on patterns
   */
  private static identifyCommonMistake(
    patterns: WrongAnswerPattern[],
    questionType: LogicalReasoningQuestionType
  ): string | undefined {
    if (patterns.includes('opposite_answer')) {
      return 'Confusing strengthen with weaken or vice versa'
    }

    if (patterns.includes('too_extreme')) {
      return 'Choosing answers with absolute language'
    }

    if (patterns.includes('partially_correct')) {
      return 'Selecting answers that are close but miss key elements'
    }

    if (patterns.includes('premise_repeat')) {
      return 'Choosing answers that restate given information'
    }

    return undefined
  }

  /**
   * Analyze all answer choices for a question
   */
  static analyzeAllAnswers(question: LogicalReasoningQuestion): AnswerAnalysis[] {
    const config: PatternAnalysisConfig = {
      questionType: question.questionType,
      stimulus: question.stimulus || '',
      questionStem: question.stem,
      correctAnswer: question.answerChoices.find(c => c.isCorrect)?.text || '',
      argumentStructure: question.argumentStructure
    }

    return question.answerChoices.map(choice => {
      if (choice.isCorrect) {
        return {
          answerId: choice.id,
          isCorrect: true,
          explanation: choice.explanation || 'This is the correct answer.',
          patterns: [],
          whyRight: choice.explanation
        }
      }

      const detection = this.detectPatterns(choice.text, config)

      return {
        answerId: choice.id,
        isCorrect: false,
        explanation: choice.explanation || detection.explanation,
        patterns: detection.patterns,
        whyWrong: detection.explanation,
        trap: detection.trap,
        commonMistake: detection.commonMistake
      }
    })
  }
}