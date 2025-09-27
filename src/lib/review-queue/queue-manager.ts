/**
 * Review Queue Manager Service
 * Manages review queues, automatic population, and priority ranking
 */

import type {
  ReviewQueue,
  ReviewItem,
  ReviewQueueSettings,
  ReviewQueueStats,
  ReviewSession,
  ReviewResponse,
  PriorityRanking,
  PriorityFactors,
  MasteryTracker
} from '@/types/review-queue';

import { DEFAULT_QUEUE_SETTINGS, MASTERY_THRESHOLDS } from '@/types/review-queue';

import { SpacedRepetitionService } from './spaced-repetition';

export class ReviewQueueManager {
  private spacedRepetition: SpacedRepetitionService;

  constructor() {
    this.spacedRepetition = new SpacedRepetitionService();
  }

  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================

  /**
   * Create a new review queue for a user
   */
  async createQueue(
    userId: string,
    name: string = 'Default Review Queue',
    settings: Partial<ReviewQueueSettings> = {}
  ): Promise<ReviewQueue> {
    const queue: ReviewQueue = {
      id: `queue-${userId}-${Date.now()}`,
      userId,
      name,
      description: 'Intelligent spaced repetition review queue',
      created: new Date(),
      lastAccessed: new Date(),
      settings: { ...DEFAULT_QUEUE_SETTINGS, ...settings },
      items: [],
      statistics: this.initializeQueueStats()
    };

    // In a real implementation, this would be saved to database
    console.log('Created review queue:', queue.id);

    return queue;
  }

  /**
   * Get review queue with updated statistics
   */
  async getQueue(userId: string, queueId: string): Promise<ReviewQueue> {
    // In real implementation, fetch from database
    // For now, return mock queue
    const queue = await this.getMockQueue(userId, queueId);

    // Update statistics
    queue.statistics = await this.calculateQueueStats(queue);
    queue.lastAccessed = new Date();

    return queue;
  }

  /**
   * Update queue settings
   */
  async updateQueueSettings(
    queueId: string,
    settings: Partial<ReviewQueueSettings>
  ): Promise<void> {
    // In real implementation, update database
    console.log('Updated queue settings for:', queueId, settings);

    // Update spaced repetition configuration
    if (settings.spacedRepetition) {
      this.spacedRepetition.updateConfig(settings.spacedRepetition);
    }
  }

  // ============================================================================
  // AUTOMATIC QUEUE POPULATION
  // ============================================================================

  /**
   * Automatically add incorrectly answered questions to review queue
   */
  async addIncorrectQuestion(
    userId: string,
    questionId: string,
    metadata: {
      section: 'logical-reasoning' | 'reading-comprehension' | 'logic-games';
      questionType: string;
      difficulty: number;
      errorReason: string;
      timeSpent: number;
    }
  ): Promise<ReviewItem> {
    const now = new Date();

    const reviewItem: ReviewItem = {
      id: `review-${questionId}-${Date.now()}`,
      questionId,
      userId,
      section: metadata.section,
      questionType: metadata.questionType,
      difficulty: metadata.difficulty,
      incorrectAttempts: 1,
      lastAttempted: now,
      nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Review tomorrow
      interval: 1,
      easeFactor: 2.5,
      masteryLevel: 0,
      priority: await this.calculatePriority(userId, questionId, metadata),
      created: now,
      status: 'pending',
      tags: this.extractTags(metadata.questionType),
      metadata: {
        originalError: metadata.errorReason,
        errorPattern: this.identifyErrorPattern(metadata.errorReason),
        conceptTags: this.extractConceptTags(metadata.questionType),
        relatedQuestions: await this.findRelatedQuestions(questionId),
        hintLevel: 0,
        timeSpent: metadata.timeSpent,
        averageTime: metadata.timeSpent,
        improvementTrend: 'stable'
      }
    };

    // In real implementation, save to database
    console.log('Added question to review queue:', reviewItem.id);

    return reviewItem;
  }

  /**
   * Remove mastered items from queue
   */
  async cleanupMasteredItems(queueId: string): Promise<number> {
    // In real implementation, query and update database
    const removedCount = 0;

    // Items are considered mastered if:
    // 1. Mastery level >= threshold
    // 2. No incorrect attempts in last 30 days
    // 3. Consistent performance

    console.log(`Removed ${removedCount} mastered items from queue ${queueId}`);
    return removedCount;
  }

  // ============================================================================
  // PRIORITY RANKING
  // ============================================================================

  /**
   * Calculate priority score for a question
   */
  private async calculatePriority(
    userId: string,
    questionId: string,
    metadata: any
  ): Promise<number> {
    const factors = await this.calculatePriorityFactors(userId, questionId, metadata);

    // Weighted priority calculation
    const weights = {
      recency: 0.2,      // 20% - how recent the error
      frequency: 0.25,   // 25% - how often it's missed
      difficulty: 0.15,  // 15% - inherent difficulty
      importance: 0.15,  // 15% - strategic importance
      forgetting: 0.1,   // 10% - forgetting curve
      weakness: 0.1,     // 10% - user weakness area
      urgency: 0.05      // 5% - time-sensitive factors
    };

    const priority = Object.entries(factors).reduce((sum, [key, value]) => {
      const weight = weights[key as keyof typeof weights] || 0;
      return sum + (Number(value) * weight);
    }, 0);

    return Math.min(1, Math.max(0, priority)); // Clamp between 0 and 1
  }

  /**
   * Calculate individual priority factors
   */
  private async calculatePriorityFactors(
    userId: string,
    questionId: string,
    metadata: any
  ): Promise<PriorityFactors> {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return {
      recency: Math.max(0, 1 - (now - Date.now()) / (7 * oneDay)), // Recent errors are higher priority
      frequency: Math.min(1, metadata.incorrectAttempts / 5), // Cap at 5 attempts
      difficulty: metadata.difficulty / 10, // Normalize 1-10 to 0-1
      importance: this.calculateStrategicImportance(metadata.questionType),
      forgetting: this.calculateForgettingPosition(metadata),
      weakness: await this.calculateUserWeakness(userId, metadata.section, metadata.questionType),
      urgency: this.calculateUrgency(userId, metadata)
    };
  }

  /**
   * Calculate strategic importance of question type
   */
  private calculateStrategicImportance(questionType: string): number {
    // High-value question types that frequently appear on LSAT
    const highValueTypes = [
      'strengthen', 'weaken', 'assumption', 'flaw', 'inference',
      'main-point', 'structure', 'sequencing', 'grouping'
    ];

    const mediumValueTypes = [
      'parallel-reasoning', 'method-of-reasoning', 'tone',
      'matching', 'hybrid-games'
    ];

    if (highValueTypes.some(type => questionType.toLowerCase().includes(type))) {
      return 0.8;
    }
    if (mediumValueTypes.some(type => questionType.toLowerCase().includes(type))) {
      return 0.6;
    }
    return 0.4; // Default importance
  }

  /**
   * Calculate forgetting curve position
   */
  private calculateForgettingPosition(metadata: any): number {
    // Ebbinghaus forgetting curve - memory retention decreases exponentially
    const daysSinceLastAttempt = metadata.daysSinceLastAttempt || 1;
    return Math.exp(-daysSinceLastAttempt / 7); // 7-day half-life
  }

  /**
   * Calculate user weakness in specific areas
   */
  private async calculateUserWeakness(
    userId: string,
    section: string,
    questionType: string
  ): Promise<number> {
    // In real implementation, analyze user's historical performance
    // For now, return mock weakness score
    const mockWeaknessScores = {
      'logical-reasoning': 0.3,
      'reading-comprehension': 0.2,
      'logic-games': 0.4
    };

    return mockWeaknessScores[section as keyof typeof mockWeaknessScores] || 0.3;
  }

  /**
   * Calculate urgency factors
   */
  private calculateUrgency(userId: string, metadata: any): number {
    // Factors like upcoming test dates, recent poor performance, etc.
    // For now, return moderate urgency
    return 0.5;
  }

  /**
   * Rank all items in queue by priority
   */
  async rankQueueByPriority(queueId: string): Promise<PriorityRanking[]> {
    // In real implementation, get queue items from database
    const items: ReviewItem[] = []; // Mock empty for now

    const rankings: PriorityRanking[] = [];

    for (const item of items) {
      const factors = await this.calculatePriorityFactors(
        item.userId,
        item.questionId,
        item.metadata
      );

      const ranking: PriorityRanking = {
        itemId: item.id,
        score: item.priority,
        factors,
        reasoning: this.generatePriorityReasoning(factors),
        rank: 0, // Will be set after sorting
        category: this.categorizePriority(item.priority),
        recommendedAction: this.suggestAction(item, factors)
      };

      rankings.push(ranking);
    }

    // Sort by priority score (descending)
    rankings.sort((a, b) => b.score - a.score);

    // Assign ranks
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return rankings;
  }

  // ============================================================================
  // MASTERY TRACKING
  // ============================================================================

  /**
   * Update mastery level for a review item
   */
  async updateMasteryLevel(
    itemId: string,
    correct: boolean,
    responseTime: number,
    confidence: 'low' | 'medium' | 'high'
  ): Promise<number> {
    // In real implementation, get current mastery tracker from database
    const tracker = await this.getMasteryTracker(itemId);

    // Update mastery based on performance
    const performanceScore = this.calculatePerformanceScore(correct, responseTime, confidence);
    const newMasteryLevel = this.calculateNewMasteryLevel(tracker.currentLevel, performanceScore);

    // Update consecutive correct count
    if (correct) {
      tracker.consecutiveCorrect += 1;
    } else {
      tracker.consecutiveCorrect = 0;
    }

    // Check for mastery achievement
    const masteryAchieved = this.checkMasteryAchievement(tracker, newMasteryLevel);

    if (masteryAchieved && !tracker.masteryAchieved) {
      tracker.masteryAchieved = new Date();
      console.log(`Mastery achieved for item ${itemId}!`);
    }

    tracker.currentLevel = newMasteryLevel;
    tracker.lastUpdate = new Date();

    // In real implementation, save updated tracker to database

    return newMasteryLevel;
  }

  /**
   * Check if item has achieved mastery
   */
  private checkMasteryAchievement(tracker: MasteryTracker, newLevel: number): boolean {
    return (
      newLevel >= tracker.targetLevel &&
      tracker.consecutiveCorrect >= MASTERY_THRESHOLDS.CONSECUTIVE_REQUIRED &&
      tracker.attempts.length >= MASTERY_THRESHOLDS.MIN_ATTEMPTS
    );
  }

  /**
   * Calculate performance score from response
   */
  private calculatePerformanceScore(
    correct: boolean,
    responseTime: number,
    confidence: 'low' | 'medium' | 'high'
  ): number {
    let score = correct ? 1 : 0;

    // Adjust for response time (assuming 90 seconds is optimal)
    const timeRatio = responseTime / 90;
    if (timeRatio <= 1.2) {
      score *= 1.1; // Bonus for good timing
    } else if (timeRatio > 2.0) {
      score *= 0.9; // Penalty for slow response
    }

    // Adjust for confidence
    const confidenceMultipliers = { low: 0.9, medium: 1.0, high: 1.1 };
    score *= confidenceMultipliers[confidence];

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate new mastery level using exponential moving average
   */
  private calculateNewMasteryLevel(currentLevel: number, performanceScore: number): number {
    const alpha = 0.3; // Learning rate
    const newLevel = currentLevel + alpha * (performanceScore * 100 - currentLevel);
    return Math.min(100, Math.max(0, newLevel));
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Get items for review session
   */
  async getItemsForReview(
    userId: string,
    queueId: string,
    limit: number
  ): Promise<ReviewItem[]> {
    // In real implementation, query database for due items
    const allItems = await this.getQueueItems(queueId);

    // Filter due items
    const dueItems = allItems.filter(item =>
      this.spacedRepetition.isDueForReview(item)
    );

    // Sort by priority
    dueItems.sort((a, b) => b.priority - a.priority);

    return dueItems.slice(0, limit);
  }

  /**
   * Process review response and update item
   */
  async processReviewResponse(
    itemId: string,
    response: ReviewResponse
  ): Promise<ReviewItem> {
    // Get current item
    const item = await this.getReviewItem(itemId);

    // Calculate next review using spaced repetition
    const srResult = this.spacedRepetition.calculateNextReview(item, response);

    // Update mastery level
    const newMasteryLevel = await this.updateMasteryLevel(
      itemId,
      response.quality >= 3,
      response.timeSpent,
      response.confidence
    );

    // Update item with new values
    const updatedItem: ReviewItem = {
      ...item,
      lastAttempted: response.timestamp,
      lastReviewed: response.timestamp,
      nextReview: srResult.nextReview,
      interval: srResult.nextInterval,
      easeFactor: srResult.easeFactor,
      masteryLevel: newMasteryLevel,
      incorrectAttempts: response.quality < 3 ? item.incorrectAttempts + 1 : item.incorrectAttempts,
      status: newMasteryLevel >= 90 ? 'mastered' : 'active',
      metadata: {
        ...item.metadata,
        timeSpent: item.metadata.timeSpent + response.timeSpent,
        averageTime: this.calculateAverageTime(item.metadata, response.timeSpent),
        hintLevel: Math.max(item.metadata.hintLevel, response.hintsUsed),
        improvementTrend: this.calculateImprovementTrend(item, response.quality >= 3)
      }
    };

    // In real implementation, save updated item to database

    return updatedItem;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Initialize empty queue statistics
   */
  private initializeQueueStats(): ReviewQueueStats {
    return {
      totalItems: 0,
      pendingReview: 0,
      masteredItems: 0,
      newToday: 0,
      reviewedToday: 0,
      averageRetention: 0,
      streak: 0,
      totalTimeSpent: 0,
      accuracy: 0,
      improvementRate: 0
    };
  }

  /**
   * Calculate comprehensive queue statistics
   */
  private async calculateQueueStats(queue: ReviewQueue): Promise<ReviewQueueStats> {
    const items = queue.items;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      totalItems: items.length,
      pendingReview: items.filter(item => this.spacedRepetition.isDueForReview(item)).length,
      masteredItems: items.filter(item => item.status === 'mastered').length,
      newToday: items.filter(item => item.created >= todayStart).length,
      reviewedToday: items.filter(item =>
        item.lastReviewed && item.lastReviewed >= todayStart
      ).length,
      averageRetention: this.spacedRepetition.calculateRetentionRate(items),
      streak: await this.calculateStreak(queue.userId),
      totalTimeSpent: items.reduce((sum, item) => sum + item.metadata.timeSpent, 0),
      accuracy: this.calculateAccuracy(items),
      improvementRate: await this.calculateImprovementRate(items)
    };
  }

  /**
   * Extract tags from question type
   */
  private extractTags(questionType: string): string[] {
    const tags = [questionType];

    // Add concept tags based on question type
    const conceptMapping: { [key: string]: string[] } = {
      'strengthen': ['argument-structure', 'evidence'],
      'weaken': ['argument-structure', 'counter-evidence'],
      'assumption': ['argument-structure', 'logical-gaps'],
      'flaw': ['argument-structure', 'logical-errors'],
      'inference': ['reading-comprehension', 'logical-deduction']
    };

    const additionalTags = conceptMapping[questionType.toLowerCase()] || [];
    return [...tags, ...additionalTags];
  }

  /**
   * Identify error pattern from error reason
   */
  private identifyErrorPattern(errorReason: string): string {
    const patterns = {
      'time': 'time-pressure',
      'misread': 'reading-comprehension',
      'calculation': 'logical-reasoning',
      'assumption': 'unstated-assumptions',
      'scope': 'scope-shifts'
    };

    for (const [keyword, pattern] of Object.entries(patterns)) {
      if (errorReason.toLowerCase().includes(keyword)) {
        return pattern;
      }
    }

    return 'general-error';
  }

  /**
   * Extract concept tags from question type
   */
  private extractConceptTags(questionType: string): string[] {
    // Similar to extractTags but more focused on learning concepts
    return this.extractTags(questionType);
  }

  /**
   * Find related questions (mock implementation)
   */
  private async findRelatedQuestions(questionId: string): Promise<string[]> {
    // In real implementation, use similarity algorithms
    return []; // Mock empty array
  }

  /**
   * Generate human-readable priority reasoning
   */
  private generatePriorityReasoning(factors: PriorityFactors): string {
    const reasons = [];

    if (factors.recency > 0.7) reasons.push('recently missed');
    if (factors.frequency > 0.6) reasons.push('frequently incorrect');
    if (factors.difficulty > 0.7) reasons.push('challenging question');
    if (factors.weakness > 0.6) reasons.push('weak area for user');
    if (factors.urgency > 0.7) reasons.push('time-sensitive');

    return reasons.length > 0 ? reasons.join(', ') : 'standard review priority';
  }

  /**
   * Categorize priority score
   */
  private categorizePriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Suggest action based on item and factors
   */
  private suggestAction(item: ReviewItem, factors: PriorityFactors): string {
    if (factors.frequency > 0.7) {
      return 'Focus on concept review and additional practice';
    }
    if (factors.difficulty > 0.8) {
      return 'Use hints and break down step-by-step';
    }
    if (item.masteryLevel < 30) {
      return 'Fundamental concept review needed';
    }
    return 'Standard spaced repetition review';
  }

  // Mock methods for real implementation
  private async getMockQueue(userId: string, queueId: string): Promise<ReviewQueue> {
    return this.createQueue(userId, 'Mock Queue');
  }

  private async getMasteryTracker(itemId: string): Promise<MasteryTracker> {
    return {
      itemId,
      userId: 'mock-user',
      attempts: [],
      currentLevel: 50,
      targetLevel: 90,
      consecutiveCorrect: 0,
      requiredCorrect: MASTERY_THRESHOLDS.CONSECUTIVE_REQUIRED,
      lastUpdate: new Date(),
      estimatedMastery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      masteryVelocity: 2
    };
  }

  private async getQueueItems(queueId: string): Promise<ReviewItem[]> {
    return []; // Mock implementation
  }

  private async getReviewItem(itemId: string): Promise<ReviewItem> {
    // Mock review item
    return {
      id: itemId,
      questionId: 'mock-question',
      userId: 'mock-user',
      section: 'logical-reasoning',
      questionType: 'strengthen',
      difficulty: 5,
      incorrectAttempts: 2,
      lastAttempted: new Date(),
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      masteryLevel: 50,
      priority: 0.7,
      created: new Date(),
      status: 'active',
      tags: ['strengthen'],
      metadata: {
        originalError: 'misunderstood scope',
        errorPattern: 'scope-shifts',
        conceptTags: ['argument-structure'],
        relatedQuestions: [],
        hintLevel: 1,
        timeSpent: 180,
        averageTime: 90,
        improvementTrend: 'stable'
      }
    };
  }

  private calculateAverageTime(metadata: any, newTime: number): number {
    // Simple moving average
    return (metadata.averageTime + newTime) / 2;
  }

  private calculateImprovementTrend(item: ReviewItem, correct: boolean): 'improving' | 'stable' | 'declining' {
    // In real implementation, analyze historical performance
    if (correct && item.masteryLevel > 60) return 'improving';
    if (!correct && item.incorrectAttempts > 3) return 'declining';
    return 'stable';
  }

  private async calculateStreak(userId: string): Promise<number> {
    // Mock implementation
    return 5;
  }

  private calculateAccuracy(items: ReviewItem[]): number {
    if (items.length === 0) return 0;
    const totalAttempts = items.reduce((sum, item) => sum + item.incorrectAttempts + 1, 0);
    const correctAttempts = items.length; // Simplified
    return correctAttempts / totalAttempts;
  }

  private async calculateImprovementRate(items: ReviewItem[]): Promise<number> {
    // Items mastered per week
    const masteredThisWeek = items.filter(item =>
      item.status === 'mastered' &&
      item.lastReviewed &&
      (Date.now() - item.lastReviewed.getTime()) < 7 * 24 * 60 * 60 * 1000
    ).length;

    return masteredThisWeek;
  }
}