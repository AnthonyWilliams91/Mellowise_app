/**
 * Practice Test Generator
 * Generates full-length LSAT practice tests with proper section balancing and experimental sections
 */

import {
  PracticeTestConfig,
  LSATSection,
  LSATSectionType,
  PracticeTestQuestion,
  TestGenerationOptions,
  GeneratedTest,
  ScoreRange
} from '@/types/practice-test';
import { v4 as uuidv4 } from 'uuid';

export class PracticeTestGenerator {
  private static readonly SECTION_CONFIGS = {
    logical_reasoning: {
      questionCount: 25,
      timeMinutes: 35,
      questionTypes: [
        'assumption', 'strengthen', 'weaken', 'inference', 'main_point',
        'flaw', 'principle', 'parallel', 'evaluate', 'resolve',
        'method', 'role', 'disagree', 'conform', 'complete'
      ]
    },
    reading_comprehension: {
      questionCount: 27,
      timeMinutes: 35,
      passageCount: 4, // 3 regular + 1 comparative
      questionTypes: [
        'main_point', 'primary_purpose', 'author_attitude', 'tone',
        'strengthen', 'weaken', 'inference', 'detail', 'vocabulary',
        'function', 'parallel', 'application', 'continue', 'organization', 'comparative'
      ]
    }
  };

  private static readonly DIFFICULTY_DISTRIBUTIONS = {
    realistic: {
      easy: 0.25,    // 25% easy (1-3)
      medium: 0.50,  // 50% medium (4-6)
      hard: 0.25     // 25% hard (7-10)
    },
    adaptive: {
      easy: 0.30,
      medium: 0.40,
      hard: 0.30
    },
    custom: {
      easy: 0.33,
      medium: 0.34,
      hard: 0.33
    }
  };

  /**
   * Generate a complete 4-section LSAT practice test
   */
  static async generateTest(options: TestGenerationOptions = {}): Promise<GeneratedTest> {
    const testId = uuidv4();
    const experimentalPosition = this.randomizeExperimentalPosition();

    // Determine experimental section type
    const experimentalType = options.experimentalSectionType || this.selectExperimentalType();

    const sections = await this.generateSections(experimentalPosition, experimentalType, options);

    const config: PracticeTestConfig = {
      id: testId,
      testName: `Practice Test - ${new Date().toLocaleDateString()}`,
      totalSections: 4,
      experimentalSectionPosition: experimentalPosition,
      breakDurationMinutes: 15,
      sections,
      scoringMethod: 'official',
      allowFlagging: true,
      allowBackNavigation: true,
      showTimeWarnings: true,
      warningTimes: ['five_minutes', 'one_minute', 'thirty_seconds']
    };

    const estimatedDifficulty = this.calculateAverageTestDifficulty(sections);
    const estimatedScoreRange = this.estimateScoreRange(estimatedDifficulty);

    return {
      config,
      metadata: {
        generatedAt: new Date(),
        options,
        questionSources: ['lsat_question_bank'], // Would be actual sources
        estimatedDifficulty,
        estimatedScoreRange
      }
    };
  }

  /**
   * Generate all 4 sections with proper LSAT structure
   */
  private static async generateSections(
    experimentalPosition: number,
    experimentalType: LSATSectionType,
    options: TestGenerationOptions
  ): Promise<LSATSection[]> {
    const sections: LSATSection[] = [];

    // Standard LSAT has 2 LR sections, 1 RC section, 1 experimental
    const sectionTypes: LSATSectionType[] = ['logical_reasoning', 'logical_reasoning', 'reading_comprehension'];

    // Insert experimental section at the specified position
    sectionTypes.splice(experimentalPosition - 1, 0, experimentalType);

    for (let i = 0; i < 4; i++) {
      const sectionType = sectionTypes[i];
      const isExperimental = i === (experimentalPosition - 1);

      const section = await this.generateSection(
        i + 1,
        sectionType,
        isExperimental,
        options
      );

      sections.push(section);
    }

    return sections;
  }

  /**
   * Generate a single LSAT section
   */
  private static async generateSection(
    sectionNumber: number,
    type: LSATSectionType,
    isExperimental: boolean,
    options: TestGenerationOptions
  ): Promise<LSATSection> {
    const config = this.SECTION_CONFIGS[type as keyof typeof this.SECTION_CONFIGS];
    if (!config) {
      throw new Error(`Unknown section type: ${type}`);
    }

    const questions = await this.generateQuestionsForSection(type, config.questionCount, options);

    return {
      id: uuidv4(),
      type,
      sectionNumber,
      isExperimental,
      timeAllowedMinutes: config.timeMinutes,
      questionCount: questions.length,
      questions
    };
  }

  /**
   * Generate questions for a specific section type
   */
  private static async generateQuestionsForSection(
    sectionType: LSATSectionType,
    questionCount: number,
    options: TestGenerationOptions
  ): Promise<PracticeTestQuestion[]> {
    if (sectionType === 'experimental') {
      // Experimental sections mirror one of the main types
      sectionType = 'logical_reasoning'; // Default experimental type
    }

    const questions: PracticeTestQuestion[] = [];
    const config = this.SECTION_CONFIGS[sectionType as keyof typeof this.SECTION_CONFIGS];

    const difficultyDist = this.DIFFICULTY_DISTRIBUTIONS[options.difficultyDistribution || 'realistic'];

    // Calculate question counts by difficulty
    const easyCount = Math.floor(questionCount * difficultyDist.easy);
    const hardCount = Math.floor(questionCount * difficultyDist.hard);
    const mediumCount = questionCount - easyCount - hardCount;

    // Generate questions by difficulty level
    const difficulties = [
      ...Array(easyCount).fill('easy'),
      ...Array(mediumCount).fill('medium'),
      ...Array(hardCount).fill('hard')
    ].sort(() => Math.random() - 0.5); // Shuffle difficulties

    for (let i = 0; i < questionCount; i++) {
      const difficulty = difficulties[i];
      const difficultyLevel = this.getDifficultyLevel(difficulty);
      const questionType = this.selectQuestionType(sectionType, config.questionTypes);

      const question = await this.generateQuestion(
        sectionType,
        questionType,
        difficultyLevel,
        i + 1,
        options
      );

      questions.push(question);
    }

    return questions;
  }

  /**
   * Generate a single practice test question
   */
  private static async generateQuestion(
    sectionType: LSATSectionType,
    questionType: string,
    difficulty: number,
    questionNumber: number,
    options: TestGenerationOptions
  ): Promise<PracticeTestQuestion> {
    // This would integrate with your actual question bank
    // For now, generating realistic mock data based on the question type and difficulty

    const baseTimeSeconds = this.getBaseTimeForQuestionType(sectionType, questionType);
    const adjustedTime = Math.round(baseTimeSeconds * (1 + (difficulty - 5) * 0.1));

    return {
      id: uuidv4(),
      type: questionType,
      content: this.generateQuestionContent(sectionType, questionType, difficulty),
      options: this.generateAnswerChoices(questionType),
      correctAnswer: 'A', // Would be determined by actual question content
      explanation: this.generateExplanation(questionType, 'A'),
      difficulty,
      topic: this.getTopicForQuestion(sectionType, questionType),
      estimatedTimeSeconds: adjustedTime,
      ...(sectionType === 'reading_comprehension' && {
        passageId: `passage_${Math.ceil(questionNumber / 7)}` // 27 questions / 4 passages ≈ 6-7 per passage
      })
    };
  }

  /**
   * Generate realistic question content based on type and difficulty
   */
  private static generateQuestionContent(
    sectionType: LSATSectionType,
    questionType: string,
    difficulty: number
  ): string {
    const complexityMarkers = difficulty > 6 ? 'complex' : difficulty > 3 ? 'moderate' : 'straightforward';

    if (sectionType === 'logical_reasoning') {
      const lrTemplates = {
        assumption: `The following argument makes an assumption. Which of the following, if true, most ${complexityMarkers === 'complex' ? 'directly undermines a key assumption' : 'clearly states an assumption'} made by the argument?`,
        strengthen: `Which of the following, if true, most strengthens the argument above?`,
        weaken: `Which of the following, if true, most ${complexityMarkers === 'complex' ? 'seriously undermines' : 'weakens'} the argument?`,
        inference: `If the statements above are true, which of the following must ${complexityMarkers === 'complex' ? 'also be true based on logical necessity' : 'also be true'}?`,
        main_point: `The main ${complexityMarkers === 'complex' ? 'conclusion of this complex argument' : 'point of the argument'} is that`
      };

      return lrTemplates[questionType as keyof typeof lrTemplates] || 'Which of the following is most supported by the passage?';
    } else {
      const rcTemplates = {
        main_point: `The primary purpose of the passage is to`,
        inference: `Based on the passage, the author would most likely agree with which of the following?`,
        detail: `According to the passage, which of the following is true?`,
        tone: `The author's attitude toward the subject discussed can best be described as`
      };

      return rcTemplates[questionType as keyof typeof rcTemplates] || 'Which of the following can be inferred from the passage?';
    }
  }

  /**
   * Generate answer choices
   */
  private static generateAnswerChoices(questionType: string): string[] {
    // Generate 5 realistic answer choices based on question type
    const baseChoices = [
      'The argument assumes without justification that the premises lead to the conclusion.',
      'The evidence provided is insufficient to support the main claim being made.',
      'The reasoning fails to consider alternative explanations for the observed phenomenon.',
      'The conclusion follows logically from the premises stated in the argument.',
      'The argument relies on a principle that is not explicitly stated or defended.'
    ];

    return baseChoices.sort(() => Math.random() - 0.5);
  }

  /**
   * Generate explanation for correct answer
   */
  private static generateExplanation(questionType: string, correctAnswer: string): string {
    return `Choice ${correctAnswer} is correct because it directly addresses the logical structure of the argument. This type of ${questionType} question requires identifying the relationship between premises and conclusion.`;
  }

  /**
   * Randomize experimental section position (1-4)
   */
  private static randomizeExperimentalPosition(): number {
    // LSAT typically places experimental in positions 1, 2, 3, or 4 with roughly equal probability
    return Math.floor(Math.random() * 4) + 1;
  }

  /**
   * Select experimental section type
   */
  private static selectExperimentalType(): LSATSectionType {
    // Experimental sections are typically LR or RC (not both types in one test)
    return Math.random() < 0.7 ? 'logical_reasoning' : 'reading_comprehension';
  }

  /**
   * Select appropriate question type for section
   */
  private static selectQuestionType(sectionType: LSATSectionType, availableTypes: string[]): string {
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Convert difficulty string to numeric level
   */
  private static getDifficultyLevel(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return Math.floor(Math.random() * 3) + 1; // 1-3
      case 'medium': return Math.floor(Math.random() * 3) + 4; // 4-6
      case 'hard': return Math.floor(Math.random() * 4) + 7; // 7-10
      default: return 5;
    }
  }

  /**
   * Get base time allocation for question type
   */
  private static getBaseTimeForQuestionType(sectionType: LSATSectionType, questionType: string): number {
    if (sectionType === 'logical_reasoning') {
      const timeMap: { [key: string]: number } = {
        assumption: 75,
        strengthen: 70,
        weaken: 70,
        inference: 80,
        main_point: 60,
        flaw: 75,
        principle: 85,
        parallel: 95,
        evaluate: 80,
        resolve: 85,
        method: 70,
        role: 65,
        disagree: 75,
        conform: 80,
        complete: 70
      };
      return timeMap[questionType] || 75;
    } else {
      // Reading Comprehension - varies by question type
      const timeMap: { [key: string]: number } = {
        main_point: 60,
        primary_purpose: 60,
        detail: 45,
        inference: 75,
        tone: 55,
        strengthen: 80,
        weaken: 80,
        vocabulary: 40,
        function: 65,
        application: 85,
        comparative: 90
      };
      return timeMap[questionType] || 65;
    }
  }

  /**
   * Get topic for question based on section and type
   */
  private static getTopicForQuestion(sectionType: LSATSectionType, questionType: string): string {
    if (sectionType === 'logical_reasoning') {
      const topics = ['causal_reasoning', 'conditional_logic', 'argumentation', 'scientific_method', 'ethics'];
      return topics[Math.floor(Math.random() * topics.length)];
    } else {
      const topics = ['law', 'science', 'social_science', 'humanities', 'history'];
      return topics[Math.floor(Math.random() * topics.length)];
    }
  }

  /**
   * Calculate average difficulty of generated test
   */
  private static calculateAverageTestDifficulty(sections: LSATSection[]): number {
    const scoredSections = sections.filter(s => !s.isExperimental);
    const totalQuestions = scoredSections.reduce((sum, s) => sum + s.questions.length, 0);
    const totalDifficulty = scoredSections.reduce(
      (sum, s) => sum + s.questions.reduce((qSum, q) => qSum + q.difficulty, 0),
      0
    );

    return totalDifficulty / totalQuestions;
  }

  /**
   * Estimate score range based on test difficulty
   */
  private static estimateScoreRange(averageDifficulty: number): ScoreRange {
    // Convert difficulty (1-10) to score estimate (120-180)
    const baseScore = 120 + (averageDifficulty / 10) * 60;
    const variance = 8; // ±8 points confidence interval

    return {
      min: Math.max(120, Math.round(baseScore - variance)),
      max: Math.min(180, Math.round(baseScore + variance)),
      confidence: 0.85
    };
  }

  /**
   * Validate generated test structure
   */
  static validateTest(config: PracticeTestConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check section count
    if (config.sections.length !== 4) {
      errors.push('LSAT must have exactly 4 sections');
    }

    // Check experimental section
    const experimentalSections = config.sections.filter(s => s.isExperimental);
    if (experimentalSections.length !== 1) {
      errors.push('Must have exactly 1 experimental section');
    }

    // Check section types
    const nonExpSections = config.sections.filter(s => !s.isExperimental);
    const lrCount = nonExpSections.filter(s => s.type === 'logical_reasoning').length;
    const rcCount = nonExpSections.filter(s => s.type === 'reading_comprehension').length;

    if (lrCount !== 2) {
      errors.push('Must have exactly 2 scored Logical Reasoning sections');
    }

    if (rcCount !== 1) {
      errors.push('Must have exactly 1 scored Reading Comprehension section');
    }

    // Check timing
    for (const section of config.sections) {
      if (section.timeAllowedMinutes !== 35) {
        errors.push(`Section ${section.sectionNumber} must be 35 minutes`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}