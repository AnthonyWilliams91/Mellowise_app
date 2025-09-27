/**
 * MELLOWISE-020: Reading Comprehension Module
 * Type definitions for Reading Comprehension questions and practice
 *
 * @epic Epic 3.4 - Comprehensive LSAT Question System
 * @author UX Expert Agent (BMad Team)
 * @created 2025-09-25
 */

import type { QuestionUniversal, AnswerChoiceUniversal } from './universal-exam'

/**
 * Reading Comprehension Question Types
 */
export type ReadingComprehensionQuestionType =
  | 'main_point'           // What is the main point of the passage?
  | 'primary_purpose'      // The primary purpose of the passage is to
  | 'author_attitude'      // The author's attitude toward X is
  | 'tone'                 // The tone of the passage is
  | 'strengthen'           // Which would strengthen the argument?
  | 'weaken'               // Which would weaken the argument?
  | 'inference'            // What can be inferred from the passage?
  | 'detail'               // According to the passage...
  | 'vocabulary'           // As used in the passage, X means
  | 'function'             // The author mentions X in order to
  | 'parallel'             // Which is most analogous to...
  | 'application'          // The principle in the passage suggests
  | 'continue'             // Which would most logically continue the passage?
  | 'organization'         // How is the passage organized?
  | 'comparative'          // How do the two passages differ?

/**
 * Passage Subject Categories
 */
export type PassageSubject =
  | 'law'                  // Legal topics, court cases, jurisprudence
  | 'science'              // Physical sciences, biology, chemistry
  | 'social_science'       // Psychology, sociology, anthropology
  | 'humanities'           // Literature, philosophy, art, music
  | 'history'              // Historical events, periods, figures
  | 'economics'            // Economic theory, policy, markets
  | 'technology'           // Computer science, engineering, innovation
  | 'medicine'             // Medical research, health, biology
  | 'environment'          // Ecology, climate, conservation
  | 'politics'             // Political science, government, policy

/**
 * Passage Complexity Factors
 */
export interface PassageComplexity {
  readabilityScore: number        // Flesch-Kincaid or similar (1-12+ grade level)
  averageSentenceLength: number   // Words per sentence
  vocabularyLevel: number         // 1-10 scale
  conceptDensity: number          // Abstract concepts per 100 words
  structuralComplexity: number    // Organizational complexity (1-5)
  overall: 'low' | 'medium' | 'high' // Overall difficulty assessment
}

/**
 * Reading Annotation/Highlight
 */
export interface ReadingAnnotation {
  id: string
  startOffset: number
  endOffset: number
  text: string
  type: 'highlight' | 'note' | 'key_point' | 'question' | 'definition'
  color?: string
  note?: string
  timestamp: string
}

/**
 * Reading Notes/Passage Map
 */
export interface PassageMap {
  id: string
  passageId: string
  userId: string
  structure: {
    paragraph: number
    mainPoint: string
    purpose: string
    keyDetails: string[]
  }[]
  overallTheme: string
  authorPerspective: string
  keyRelationships: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Vocabulary Term
 */
export interface VocabularyTerm {
  word: string
  definition: string
  context: string
  partOfSpeech: string
  difficulty: number // 1-10
  synonyms?: string[]
  etymology?: string
  usageExamples?: string[]
}

/**
 * Reading Comprehension Passage
 */
export interface ReadingComprehensionPassage {
  id: string
  title?: string
  content: string
  wordCount: number
  estimatedReadingTime: number // in seconds
  subject: PassageSubject
  complexity: PassageComplexity
  source?: string
  year?: number
  isComparative: boolean
  comparativePassageId?: string // If part of comparative set
  keyVocabulary: VocabularyTerm[]
  suggestedAnnotations?: {
    type: ReadingAnnotation['type']
    text: string
    purpose: string
  }[]
  metadata: {
    questionCount: number
    averageQuestionDifficulty: number
    timeAllocation: number // recommended time in seconds
    practiceValue: number // educational value score 1-10
  }
}

/**
 * Reading Comprehension Question
 */
export interface ReadingComprehensionQuestion extends QuestionUniversal {
  passageId: string
  questionType: ReadingComprehensionQuestionType
  passage: ReadingComprehensionPassage
  lineReference?: {
    startLine: number
    endLine: number
  }
  requiredSkills: string[] // Skills needed to answer correctly
  difficultyFactors: {
    textComplexity: number    // How complex is referenced text (1-5)
    inferenceLevel: number    // How much inference required (1-5)
    vocabularyDemand: number  // Vocabulary difficulty (1-5)
    multipleSteps: boolean    // Requires multiple reasoning steps
  }
  estimatedReadingTime: number // Time to read relevant section
  estimatedAnsweringTime: number // Time to analyze and answer
}

/**
 * Reading Speed Metrics
 */
export interface ReadingSpeedMetrics {
  userId: string
  passageId: string
  wordsPerMinute: number
  comprehensionAccuracy: number // Percentage correct on passage
  timeSpentReading: number // Pure reading time in seconds
  timeSpentAnswering: number // Time answering questions
  annotationCount: number
  rereadCount: number // How many times sections were reread
  timestamp: string
}

/**
 * Comparative Passage Pair
 */
export interface ComparativePassagePair {
  id: string
  passage1: ReadingComprehensionPassage
  passage2: ReadingComprehensionPassage
  relationship: 'agreement' | 'disagreement' | 'complementary' | 'contrasting'
  sharedThemes: string[]
  keyDifferences: string[]
  synthesisQuestions: ReadingComprehensionQuestion[]
  recommendedApproach: string
}

/**
 * Reading Comprehension Practice Session
 */
export interface RCPracticeSession {
  id: string
  userId: string
  startedAt: string
  completedAt?: string
  passages: ReadingComprehensionPassage[]
  questions: ReadingComprehensionQuestion[]
  responses: {
    questionId: string
    selectedAnswer: string
    isCorrect: boolean
    readingTimeSpent: number
    answeringTimeSpent: number
    annotations?: ReadingAnnotation[]
    confidence: number // 1-5 scale
  }[]
  performance: {
    overallAccuracy: number
    readingSpeed: number // WPM
    timeEfficiency: number // actual vs recommended time ratio
    byQuestionType: Record<ReadingComprehensionQuestionType, {
      accuracy: number
      averageTime: number
    }>
    byPassageType: Record<PassageSubject, {
      accuracy: number
      averageTime: number
    }>
  }
  annotations: ReadingAnnotation[]
  passageMaps: PassageMap[]
}

/**
 * Question Type Performance
 */
export interface RCQuestionTypePerformance {
  questionType: ReadingComprehensionQuestionType
  attemptCount: number
  correctCount: number
  accuracy: number
  averageReadingTime: number
  averageAnsweringTime: number
  trend: 'improving' | 'stable' | 'declining'
  commonMistakes: string[]
  lastPracticed: string
}

/**
 * Passage Subject Performance
 */
export interface PassageSubjectPerformance {
  subject: PassageSubject
  passageCount: number
  accuracy: number
  averageReadingSpeed: number // WPM
  strengthAreas: ReadingComprehensionQuestionType[]
  weaknessAreas: ReadingComprehensionQuestionType[]
  timeEfficiency: number
  lastPracticed: string
}

/**
 * Reading Strategy
 */
export interface ReadingStrategy {
  id: string
  name: string
  description: string
  steps: string[]
  bestForPassageTypes: PassageSubject[]
  bestForQuestionTypes: ReadingComprehensionQuestionType[]
  timeAllocation: {
    reading: number    // Percentage of time for reading
    questions: number  // Percentage of time for questions
    review: number     // Percentage of time for review
  }
  keyTechniques: string[]
}

/**
 * Reading Comprehension Analytics
 */
export interface RCAnalytics {
  userId: string
  analyzedAt: string
  overallStats: {
    totalPassagesRead: number
    totalQuestionsAnswered: number
    overallAccuracy: number
    averageReadingSpeed: number // WPM
    timeEfficiency: number
  }
  strengthsBySubject: PassageSubjectPerformance[]
  weaknessesBySubject: PassageSubjectPerformance[]
  strengthsByQuestionType: RCQuestionTypePerformance[]
  weaknessesByQuestionType: RCQuestionTypePerformance[]
  readingSpeedTrends: {
    date: string
    averageWPM: number
    accuracy: number
  }[]
  recommendedStrategies: ReadingStrategy[]
  improvementAreas: {
    area: string
    priority: 'high' | 'medium' | 'low'
    description: string
    practiceRecommendations: string[]
  }[]
}

/**
 * Reading Comprehension Practice Configuration
 */
export interface RCPracticeConfig {
  includeSubjects?: PassageSubject[]
  includeQuestionTypes?: ReadingComprehensionQuestionType[]
  complexityRange?: {
    min: 'low' | 'medium' | 'high'
    max: 'low' | 'medium' | 'high'
  }
  passageCount: number
  questionsPerPassage?: number
  includeComparative: boolean
  timeMode: 'untimed' | 'recommended' | 'strict'
  enableAnnotations: boolean
  enableVocabularyHelp: boolean
  focusOnWeaknesses: boolean
  strategy?: ReadingStrategy
}

/**
 * Reading Tools State
 */
export interface ReadingToolsState {
  annotations: ReadingAnnotation[]
  activeAnnotationType: ReadingAnnotation['type']
  highlightColors: {
    highlight: string
    key_point: string
    question: string
    definition: string
    note: string
  }
  showLineNumbers: boolean
  fontSize: number
  lineHeight: number
  showVocabularyHelp: boolean
  activeVocabularyTerm?: VocabularyTerm
}

/**
 * Passage Reading Progress
 */
export interface ReadingProgress {
  passageId: string
  userId: string
  startTime: number
  currentTime: number
  scrollPosition: number
  readingSections: {
    startOffset: number
    endOffset: number
    timeSpent: number
    revisitCount: number
  }[]
  annotationsMade: number
  questionsViewed: string[]
  isCompleted: boolean
}

/**
 * Reading Comprehension Error Patterns
 */
export type RCErrorPattern =
  | 'speed_reading_loss'     // Reading too fast, missing details
  | 'overthinking'           // Spending too much time on simple questions
  | 'passage_misread'        // Misunderstanding passage content
  | 'scope_confusion'        // Confusing passage scope with answer scope
  | 'detail_overemphasis'    // Focusing on minor details over main ideas
  | 'inference_leap'         // Making inferences not supported by text
  | 'vocabulary_stumble'     // Getting stuck on difficult vocabulary
  | 'structure_ignorance'    // Not understanding passage organization
  | 'comparative_confusion'  // Mixing up information between passages
  | 'time_pressure_panic'    // Performance degradation under time pressure

/**
 * Reading Comprehension Improvement Plan
 */
export interface RCImprovementPlan {
  userId: string
  createdAt: string
  priority: 'high' | 'medium' | 'low'
  targetAreas: {
    subject?: PassageSubject
    questionType?: ReadingComprehensionQuestionType
    skill: string
    currentLevel: number // 1-10
    targetLevel: number  // 1-10
  }[]
  strategies: ReadingStrategy[]
  practiceSchedule: {
    week: number
    passageCount: number
    focusSubjects: PassageSubject[]
    targetSkills: string[]
  }[]
  estimatedTimeToImprovement: number // days
  milestones: {
    week: number
    targetAccuracy: number
    targetReadingSpeed: number
    skillCheckpoints: string[]
  }[]
}