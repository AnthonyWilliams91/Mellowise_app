/**
 * Progressive Hint System Service
 * Provides graduated assistance for review questions
 */

import type {
  Hint,
  HintLevel,
  HintSystem as IHintSystem,
  HintUsage
} from '../../../types/review-queue';

interface QuestionContext {
  id: string;
  section: 'logical-reasoning' | 'reading-comprehension' | 'logic-games';
  questionType: string;
  difficulty: number;
  content: string;
  correctAnswer: string;
  explanation: string;
}

export class HintSystemService implements IHintSystem {
  private hintTemplates: Map<string, Hint[]> = new Map();
  private usageHistory: Map<string, HintUsage[]> = new Map();

  constructor() {
    this.initializeHintTemplates();
  }

  // ============================================================================
  // PUBLIC INTERFACE
  // ============================================================================

  /**
   * Get a specific hint for a question at the requested level
   */
  async getHint(questionId: string, level: HintLevel): Promise<Hint> {
    const question = await this.getQuestionContext(questionId);
    const hints = await this.generateProgressiveHints(questionId);

    if (level >= hints.length) {
      throw new Error(`Hint level ${level} not available for question ${questionId}`);
    }

    return hints[level];
  }

  /**
   * Get all available hint levels for a question
   */
  async getAvailableHints(questionId: string): Promise<HintLevel[]> {
    const hints = await this.generateProgressiveHints(questionId);
    return hints.map((_, index) => index as HintLevel);
  }

  /**
   * Record hint usage for analytics
   */
  async recordHintUsage(
    userId: string,
    questionId: string,
    level: HintLevel
  ): Promise<void> {
    const usage: HintUsage = {
      userId,
      questionId,
      sessionId: 'current-session', // In real implementation, get from session
      level,
      timestamp: new Date(),
      timeBeforeHint: 0, // Would be calculated from session start
      helpfulness: 0, // To be rated by user later
      led_to_correct: false // To be updated when question is answered
    };

    // Store usage
    const userHistory = this.usageHistory.get(userId) || [];
    userHistory.push(usage);
    this.usageHistory.set(userId, userHistory);

    console.log(`Recorded hint usage: User ${userId}, Question ${questionId}, Level ${level}`);
  }

  /**
   * Generate all progressive hints for a question
   */
  async generateProgressiveHints(questionId: string): Promise<Hint[]> {
    const question = await this.getQuestionContext(questionId);

    // Get hint template based on question type
    const template = this.getHintTemplate(question.questionType);

    // Generate contextual hints
    return this.generateContextualHints(question, template);
  }

  // ============================================================================
  // HINT GENERATION
  // ============================================================================

  /**
   * Generate contextual hints based on question content
   */
  private generateContextualHints(question: QuestionContext, template: Hint[]): Hint[] {
    return template.map((hint, index) => ({
      ...hint,
      level: index as HintLevel,
      content: this.contextualizeHintContent(hint.content, question),
      nextHintAvailable: index < template.length - 1
    }));
  }

  /**
   * Contextualize hint content with question-specific information
   */
  private contextualizeHintContent(hintTemplate: string, question: QuestionContext): string {
    // Replace placeholders with question-specific content
    return hintTemplate
      .replace('{section}', this.getSectionDisplayName(question.section))
      .replace('{questionType}', this.getQuestionTypeDisplayName(question.questionType))
      .replace('{difficulty}', question.difficulty.toString());
  }

  /**
   * Get hint template for question type
   */
  private getHintTemplate(questionType: string): Hint[] {
    const template = this.hintTemplates.get(questionType);

    if (template) {
      return template;
    }

    // Return generic template if specific one not found
    return this.getGenericHintTemplate();
  }

  /**
   * Get generic hint template for unknown question types
   */
  private getGenericHintTemplate(): Hint[] {
    return [
      {
        level: 0,
        title: 'Question Focus',
        content: 'Read the question stem carefully. What exactly is being asked?',
        type: 'strategy',
        spoilerLevel: 'none',
        nextHintAvailable: true
      },
      {
        level: 1,
        title: 'Key Information',
        content: 'Identify the key premises and conclusion in the argument or passage.',
        type: 'concept',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 2,
        title: 'Answer Analysis',
        content: 'Eliminate answer choices that are clearly incorrect or out of scope.',
        type: 'elimination',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 3,
        title: 'Complete Explanation',
        content: 'Here\'s the full explanation with the reasoning behind the correct answer.',
        type: 'explanation',
        spoilerLevel: 'full',
        nextHintAvailable: false
      }
    ];
  }

  // ============================================================================
  // HINT TEMPLATES INITIALIZATION
  // ============================================================================

  /**
   * Initialize all hint templates for different question types
   */
  private initializeHintTemplates(): void {
    // Logical Reasoning - Strengthen Questions
    this.hintTemplates.set('strengthen', [
      {
        level: 0,
        title: 'Identify the Argument',
        content: 'Find the conclusion and premises. What is the author trying to prove?',
        type: 'strategy',
        spoilerLevel: 'none',
        nextHintAvailable: true
      },
      {
        level: 1,
        title: 'Find the Gap',
        content: 'Look for the logical gap between premises and conclusion. What assumption connects them?',
        type: 'concept',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 2,
        title: 'Strengthen Strategy',
        content: 'The correct answer will provide additional evidence supporting the conclusion or validating a key assumption.',
        type: 'strategy',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 3,
        title: 'Complete Analysis',
        content: 'The correct answer bridges the logical gap by providing evidence that makes the conclusion more likely to be true.',
        type: 'explanation',
        spoilerLevel: 'full',
        nextHintAvailable: false
      }
    ]);

    // Logical Reasoning - Weaken Questions
    this.hintTemplates.set('weaken', [
      {
        level: 0,
        title: 'Understand the Argument',
        content: 'Identify what the author is concluding and the evidence provided.',
        type: 'strategy',
        spoilerLevel: 'none',
        nextHintAvailable: true
      },
      {
        level: 1,
        title: 'Find Vulnerabilities',
        content: 'Look for unstated assumptions or potential alternative explanations.',
        type: 'concept',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 2,
        title: 'Weakening Strategy',
        content: 'The correct answer will attack an assumption, provide counter-evidence, or suggest an alternative explanation.',
        type: 'strategy',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 3,
        title: 'Complete Analysis',
        content: 'The correct answer undermines the argument by challenging a key assumption or providing evidence against the conclusion.',
        type: 'explanation',
        spoilerLevel: 'full',
        nextHintAvailable: false
      }
    ]);

    // Logical Reasoning - Assumption Questions
    this.hintTemplates.set('assumption', [
      {
        level: 0,
        title: 'Map the Argument',
        content: 'Clearly identify the premises (evidence) and conclusion (what\'s being proven).',
        type: 'strategy',
        spoilerLevel: 'none',
        nextHintAvailable: true
      },
      {
        level: 1,
        title: 'Find the Gap',
        content: 'What unstated premise must be true for the conclusion to follow from the evidence?',
        type: 'concept',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 2,
        title: 'Negation Test',
        content: 'Try negating each answer choice. The correct assumption, when negated, would destroy the argument.',
        type: 'strategy',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 3,
        title: 'Complete Analysis',
        content: 'The correct assumption is the missing link that must be true for the argument to be valid.',
        type: 'explanation',
        spoilerLevel: 'full',
        nextHintAvailable: false
      }
    ]);

    // Logic Games - Sequencing
    this.hintTemplates.set('sequencing', [
      {
        level: 0,
        title: 'Set Up the Game',
        content: 'Create a linear diagram showing the positions or order. Mark any fixed constraints.',
        type: 'strategy',
        spoilerLevel: 'none',
        nextHintAvailable: true
      },
      {
        level: 1,
        title: 'Work with Rules',
        content: 'Translate each rule into diagram notation. Look for rules that create blocks or chains.',
        type: 'concept',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 2,
        title: 'Make Inferences',
        content: 'Combine rules to make deductions. What must be true given the constraints?',
        type: 'strategy',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 3,
        title: 'Complete Solution',
        content: 'Work through the specific question by testing answer choices against your setup and inferences.',
        type: 'explanation',
        spoilerLevel: 'full',
        nextHintAvailable: false
      }
    ]);

    // Reading Comprehension - Main Point
    this.hintTemplates.set('main-point', [
      {
        level: 0,
        title: 'Identify Structure',
        content: 'What is the overall structure of the passage? Introduction, development, conclusion?',
        type: 'strategy',
        spoilerLevel: 'none',
        nextHintAvailable: true
      },
      {
        level: 1,
        title: 'Find the Thesis',
        content: 'Look for the author\'s central claim or argument. It\'s often in the first or last paragraph.',
        type: 'concept',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 2,
        title: 'Eliminate Specifics',
        content: 'The main point is broad enough to encompass the entire passage, not just specific details.',
        type: 'elimination',
        spoilerLevel: 'partial',
        nextHintAvailable: true
      },
      {
        level: 3,
        title: 'Complete Analysis',
        content: 'The main point captures the author\'s primary purpose or central argument throughout the passage.',
        type: 'explanation',
        spoilerLevel: 'full',
        nextHintAvailable: false
      }
    ]);

    // Add more question type templates as needed
  }

  // ============================================================================
  // ANALYTICS AND OPTIMIZATION
  // ============================================================================

  /**
   * Analyze hint effectiveness for a user
   */
  async analyzeHintEffectiveness(userId: string): Promise<{
    overallHelpfulness: number;
    levelEffectiveness: { [level: number]: number };
    mostHelpfulTypes: string[];
    recommendations: string[];
  }> {
    const userHistory = this.usageHistory.get(userId) || [];

    if (userHistory.length === 0) {
      return {
        overallHelpfulness: 0,
        levelEffectiveness: {},
        mostHelpfulTypes: [],
        recommendations: ['Try using hints when you\'re stuck to improve your understanding']
      };
    }

    // Calculate overall helpfulness
    const ratedUsages = userHistory.filter(usage => usage.helpfulness > 0);
    const overallHelpfulness = ratedUsages.length > 0 ?
      ratedUsages.reduce((sum, usage) => sum + usage.helpfulness, 0) / ratedUsages.length : 0;

    // Calculate effectiveness by level
    const levelEffectiveness: { [level: number]: number } = {};
    for (let level = 0; level <= 3; level++) {
      const levelUsages = ratedUsages.filter(usage => usage.level === level);
      if (levelUsages.length > 0) {
        levelEffectiveness[level] = levelUsages.reduce((sum, usage) => sum + usage.helpfulness, 0) / levelUsages.length;
      }
    }

    // Find most helpful hint types (mock implementation)
    const mostHelpfulTypes = ['strategy', 'concept'];

    // Generate recommendations
    const recommendations = this.generateHintRecommendations(userHistory, levelEffectiveness);

    return {
      overallHelpfulness,
      levelEffectiveness,
      mostHelpfulTypes,
      recommendations
    };
  }

  /**
   * Generate personalized hint usage recommendations
   */
  private generateHintRecommendations(
    history: HintUsage[],
    effectiveness: { [level: number]: number }
  ): string[] {
    const recommendations: string[] = [];

    // Check hint usage patterns
    const averageLevel = history.reduce((sum, usage) => sum + usage.level, 0) / history.length;

    if (averageLevel < 1) {
      recommendations.push('Try using level 1 hints more often to understand key concepts');
    }

    if (averageLevel > 2) {
      recommendations.push('Challenge yourself by trying questions with fewer hints first');
    }

    // Check effectiveness patterns
    if (effectiveness[1] && effectiveness[1] > effectiveness[2]) {
      recommendations.push('Concept-level hints seem most helpful for you - focus on understanding the underlying principles');
    }

    if (history.filter(usage => usage.led_to_correct).length / history.length < 0.5) {
      recommendations.push('Consider reviewing explanations more thoroughly after using hints');
    }

    return recommendations.length > 0 ? recommendations : ['Keep using hints strategically to improve your understanding'];
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get question context (mock implementation)
   */
  private async getQuestionContext(questionId: string): Promise<QuestionContext> {
    // In real implementation, fetch from question database
    return {
      id: questionId,
      section: 'logical-reasoning',
      questionType: 'strengthen',
      difficulty: 6,
      content: 'Mock question content...',
      correctAnswer: 'A',
      explanation: 'Mock explanation...'
    };
  }

  /**
   * Get display name for section
   */
  private getSectionDisplayName(section: string): string {
    const displayNames = {
      'logical-reasoning': 'Logical Reasoning',
      'reading-comprehension': 'Reading Comprehension',
      'logic-games': 'Logic Games'
    };
    return displayNames[section as keyof typeof displayNames] || section;
  }

  /**
   * Get display name for question type
   */
  private getQuestionTypeDisplayName(questionType: string): string {
    const displayNames: { [key: string]: string } = {
      'strengthen': 'Strengthen',
      'weaken': 'Weaken',
      'assumption': 'Assumption',
      'flaw': 'Flaw in Reasoning',
      'inference': 'Inference',
      'main-point': 'Main Point',
      'sequencing': 'Sequencing Game',
      'grouping': 'Grouping Game'
    };
    return displayNames[questionType] || questionType.charAt(0).toUpperCase() + questionType.slice(1);
  }

  /**
   * Update hint usage with outcome
   */
  async updateHintOutcome(
    userId: string,
    questionId: string,
    sessionId: string,
    correct: boolean,
    helpfulness: number
  ): Promise<void> {
    const userHistory = this.usageHistory.get(userId) || [];

    // Find the most recent hint usage for this question in this session
    const recentUsage = userHistory
      .filter(usage => usage.questionId === questionId && usage.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (recentUsage) {
      recentUsage.led_to_correct = correct;
      recentUsage.helpfulness = helpfulness;
    }
  }

  /**
   * Get hint usage statistics
   */
  getUsageStatistics(userId?: string): {
    totalHints: number;
    averageLevel: number;
    successRate: number;
    mostUsedTypes: string[];
  } {
    let allUsages: HintUsage[] = [];

    if (userId) {
      allUsages = this.usageHistory.get(userId) || [];
    } else {
      // Get all usage data
      this.usageHistory.forEach((userUsages) => {
        allUsages.push(...userUsages);
      });
    }

    if (allUsages.length === 0) {
      return {
        totalHints: 0,
        averageLevel: 0,
        successRate: 0,
        mostUsedTypes: []
      };
    }

    const totalHints = allUsages.length;
    const averageLevel = allUsages.reduce((sum, usage) => sum + usage.level, 0) / totalHints;
    const successfulHints = allUsages.filter(usage => usage.led_to_correct).length;
    const successRate = successfulHints / totalHints;

    // Get most used hint types (would need to be tracked in real implementation)
    const mostUsedTypes = ['strategy', 'concept', 'elimination'];

    return {
      totalHints,
      averageLevel: Math.round(averageLevel * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      mostUsedTypes
    };
  }
}