/**
 * Review Priority Queue System
 * MELLOWISE-029: Advanced Spaced Repetition System
 *
 * Manages the priority queue for spaced repetition cards,
 * balancing new content with reviews based on multiple factors
 */

import type {
  ReviewQueue,
  QueuedCard,
  QueueStatistics,
  SpacedRepetitionCard,
  MasteryLevel,
  LoadBalancingSettings,
  ConceptDependency
} from '@/types/spaced-repetition';

/**
 * Priority Queue Manager
 * Handles card prioritization and queue generation
 */
export class PriorityQueueManager {
  private loadBalancingSettings: LoadBalancingSettings;
  private conceptDependencies: Map<string, ConceptDependency> = new Map();

  constructor(settings: LoadBalancingSettings) {
    this.loadBalancingSettings = settings;
  }

  /**
   * Generate review queue for a user session
   */
  public generateReviewQueue(
    userId: string,
    availableCards: SpacedRepetitionCard[],
    queueType: ReviewQueue['queueType'] = 'daily',
    targetSessionTime: number = 45 // minutes
  ): ReviewQueue {
    const now = new Date();

    // Separate cards by type
    const newCards = availableCards.filter(card => card.statistics.totalReviews === 0);
    const reviewCards = availableCards.filter(card =>
      card.statistics.totalReviews > 0 &&
      new Date(card.scheduling.nextReview) <= now &&
      card.scheduling.masteryLevel !== 'suspended'
    );

    // Calculate priorities for all cards
    const prioritizedNewCards = this.prioritizeCards(newCards, 'new');
    const prioritizedReviewCards = this.prioritizeCards(reviewCards, 'review');

    // Apply load balancing
    const balancedQueue = this.applyLoadBalancing(
      prioritizedNewCards,
      prioritizedReviewCards,
      targetSessionTime
    );

    // Apply dependency constraints
    const dependencyFilteredQueue = this.applyDependencyConstraints(balancedQueue);

    // Generate queue metadata
    const metadata = {
      targetSessionTime,
      maxNewCards: this.loadBalancingSettings.maxNewCardsPerSession,
      maxReviewCards: this.loadBalancingSettings.maxReviewCardsPerSession,
      balanceRatio: this.calculateBalanceRatio(dependencyFilteredQueue),
      generatedAt: now.toISOString(),
      estimatedDuration: this.estimateSessionDuration(dependencyFilteredQueue)
    };

    // Generate statistics
    const statistics = this.generateQueueStatistics(dependencyFilteredQueue);

    return {
      userId,
      queueType,
      cards: dependencyFilteredQueue,
      metadata,
      statistics
    };
  }

  /**
   * Prioritize cards based on multiple factors
   */
  private prioritizeCards(
    cards: SpacedRepetitionCard[],
    reviewType: 'new' | 'review'
  ): QueuedCard[] {
    return cards.map(card => {
      const urgencyFactors = this.calculateUrgencyFactors(card);
      const priority = this.calculateOverallPriority(urgencyFactors, reviewType);
      const estimatedTime = this.estimateCardTime(card);

      return {
        cardId: card.id,
        priority,
        urgencyFactors,
        estimatedTime,
        reviewType: this.determineReviewType(card),
        scheduledFor: card.scheduling.nextReview
      };
    }).sort((a, b) => b.priority - a.priority); // Sort by priority descending
  }

  /**
   * Calculate urgency factors for a card
   */
  private calculateUrgencyFactors(card: SpacedRepetitionCard): QueuedCard['urgencyFactors'] {
    const now = new Date();
    const nextReview = new Date(card.scheduling.nextReview);
    const daysDiff = (now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24);

    // Overdue factor (positive if overdue, negative if early)
    const overdue = Math.max(-7, daysDiff); // Cap at -7 days early

    // Mastery level factor
    const masteryPriorities: Record<MasteryLevel, number> = {
      learning: 50,
      young: 30,
      mature: 15,
      master: 5,
      suspended: 0
    };
    const masteryLevel = masteryPriorities[card.scheduling.masteryLevel];

    // Difficulty factor
    const difficultyMapping = { beginner: 10, intermediate: 20, advanced: 30 };
    const difficulty = difficultyMapping[card.metadata.difficulty];

    // Retention factor (lower retention = higher priority)
    const lastAccuracy = card.statistics.lastAccuracy || 0.5;
    const retention = (1 - lastAccuracy) * 40; // Invert and scale

    // Dependency factor
    const dependency = this.calculateDependencyPriority(card.conceptId);

    return {
      overdue,
      masteryLevel,
      difficulty,
      retention,
      dependency
    };
  }

  /**
   * Calculate overall priority from urgency factors
   */
  private calculateOverallPriority(
    factors: QueuedCard['urgencyFactors'],
    reviewType: 'new' | 'review'
  ): number {
    const weights = {
      overdue: reviewType === 'review' ? 0.4 : 0.1,
      masteryLevel: 0.25,
      difficulty: 0.15,
      retention: 0.15,
      dependency: 0.05
    };

    const weightedScore =
      factors.overdue * weights.overdue +
      factors.masteryLevel * weights.masteryLevel +
      factors.difficulty * weights.difficulty +
      factors.retention * weights.retention +
      factors.dependency * weights.dependency;

    // Apply review type bonus
    const typeBonus = reviewType === 'review' ? 10 : 0;

    return Math.min(100, Math.max(0, weightedScore + typeBonus));
  }

  /**
   * Calculate dependency priority for a concept
   */
  private calculateDependencyPriority(conceptId: string): number {
    const dependency = this.conceptDependencies.get(conceptId);
    if (!dependency) return 0;

    // Higher priority for prerequisite concepts
    const dependentCount = dependency.dependents.length;
    return Math.min(20, dependentCount * 5);
  }

  /**
   * Determine review type for a card
   */
  private determineReviewType(card: SpacedRepetitionCard): QueuedCard['reviewType'] {
    if (card.statistics.totalReviews === 0) {
      return 'new';
    }

    if (card.statistics.lastAccuracy < 0.6) {
      return 'relearn';
    }

    const now = new Date();
    const nextReview = new Date(card.scheduling.nextReview);

    if (nextReview <= now) {
      return 'review';
    }

    return 'review';
  }

  /**
   * Estimate time required for a card
   */
  private estimateCardTime(card: SpacedRepetitionCard): number {
    let baseTime = card.metadata.estimatedTime || 30; // Default 30 seconds

    // Adjust based on mastery level
    const masteryMultipliers: Record<MasteryLevel, number> = {
      learning: 1.5,
      young: 1.2,
      mature: 1.0,
      master: 0.8,
      suspended: 0
    };

    baseTime *= masteryMultipliers[card.scheduling.masteryLevel];

    // Adjust based on difficulty
    const difficultyMultipliers = {
      beginner: 0.8,
      intermediate: 1.0,
      advanced: 1.3
    };

    baseTime *= difficultyMultipliers[card.metadata.difficulty];

    // Adjust based on recent performance
    if (card.statistics.averageResponseTime > 0) {
      // Use historical average, but cap the adjustment
      const historicalFactor = Math.min(2.0, Math.max(0.5, card.statistics.averageResponseTime / 30000));
      baseTime *= historicalFactor;
    }

    return Math.round(baseTime);
  }

  /**
   * Apply load balancing to maintain session quality
   */
  private applyLoadBalancing(
    newCards: QueuedCard[],
    reviewCards: QueuedCard[],
    targetSessionTime: number
  ): QueuedCard[] {
    const targetMinutes = targetSessionTime;
    const maxNewCards = this.loadBalancingSettings.maxNewCardsPerSession;
    const maxReviewCards = this.loadBalancingSettings.maxReviewCardsPerSession;

    const selectedCards: QueuedCard[] = [];
    let currentTime = 0;

    // Apply difficulty preference
    const { difficultyPreference } = this.loadBalancingSettings;
    if (difficultyPreference !== 'mixed') {
      newCards.sort((a, b) => this.sortByDifficulty(a, b, difficultyPreference));
      reviewCards.sort((a, b) => this.sortByDifficulty(a, b, difficultyPreference));
    }

    // Balance new and review cards
    let newCardIndex = 0;
    let reviewCardIndex = 0;
    let consecutiveDifficult = 0;

    const balanceRatio = this.loadBalancingSettings.balanceRatio || 0.3; // 30% new, 70% review

    while (
      currentTime < targetMinutes * 60 && // Convert to seconds
      selectedCards.length < (maxNewCards + maxReviewCards) &&
      (newCardIndex < newCards.length || reviewCardIndex < reviewCards.length)
    ) {
      let addNewCard = false;

      // Decide whether to add new or review card
      const currentRatio = selectedCards.filter(c => c.reviewType === 'new').length / (selectedCards.length || 1);

      if (currentRatio < balanceRatio && newCardIndex < newCards.length && selectedCards.filter(c => c.reviewType === 'new').length < maxNewCards) {
        addNewCard = true;
      } else if (reviewCardIndex < reviewCards.length && selectedCards.filter(c => c.reviewType === 'review').length < maxReviewCards) {
        addNewCard = false;
      } else if (newCardIndex < newCards.length && selectedCards.filter(c => c.reviewType === 'new').length < maxNewCards) {
        addNewCard = true;
      } else {
        break;
      }

      const card = addNewCard ? newCards[newCardIndex++] : reviewCards[reviewCardIndex++];

      // Check burnout prevention
      if (this.loadBalancingSettings.burnoutPrevention.enabled) {
        const isDifficult = this.isCardDifficult(card);

        if (isDifficult) {
          consecutiveDifficult++;

          if (consecutiveDifficult >= this.loadBalancingSettings.burnoutPrevention.maxConsecutiveDifficult) {
            // Insert a break or easy card
            const easyCard = this.findEasyCard(newCards, reviewCards, newCardIndex, reviewCardIndex);
            if (easyCard) {
              selectedCards.push(easyCard.card);
              currentTime += easyCard.card.estimatedTime;

              if (easyCard.source === 'new') newCardIndex = easyCard.index + 1;
              else reviewCardIndex = easyCard.index + 1;

              consecutiveDifficult = 0;
              continue;
            }
          }
        } else {
          consecutiveDifficult = 0;
        }
      }

      selectedCards.push(card);
      currentTime += card.estimatedTime;
    }

    return selectedCards;
  }

  /**
   * Sort cards by difficulty preference
   */
  private sortByDifficulty(
    a: QueuedCard,
    b: QueuedCard,
    preference: 'easy-first' | 'mixed' | 'hard-first'
  ): number {
    if (preference === 'mixed') return 0;

    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const aDiff = difficultyOrder[this.getCardDifficulty(a)];
    const bDiff = difficultyOrder[this.getCardDifficulty(b)];

    return preference === 'easy-first' ? aDiff - bDiff : bDiff - aDiff;
  }

  /**
   * Check if card is considered difficult
   */
  private isCardDifficult(card: QueuedCard): boolean {
    return card.priority > 70 || card.urgencyFactors.difficulty > 25;
  }

  /**
   * Find an easy card to insert as a break
   */
  private findEasyCard(
    newCards: QueuedCard[],
    reviewCards: QueuedCard[],
    newIndex: number,
    reviewIndex: number
  ): { card: QueuedCard; source: 'new' | 'review'; index: number } | null {
    // Look for easy cards in remaining cards
    for (let i = newIndex; i < Math.min(newIndex + 10, newCards.length); i++) {
      if (!this.isCardDifficult(newCards[i])) {
        return { card: newCards[i], source: 'new', index: i };
      }
    }

    for (let i = reviewIndex; i < Math.min(reviewIndex + 10, reviewCards.length); i++) {
      if (!this.isCardDifficult(reviewCards[i])) {
        return { card: reviewCards[i], source: 'review', index: i };
      }
    }

    return null;
  }

  /**
   * Get card difficulty level
   */
  private getCardDifficulty(card: QueuedCard): 'beginner' | 'intermediate' | 'advanced' {
    // This would need access to the actual card data
    // For now, infer from priority and urgency factors
    if (card.urgencyFactors.difficulty > 25) return 'advanced';
    if (card.urgencyFactors.difficulty > 15) return 'intermediate';
    return 'beginner';
  }

  /**
   * Apply dependency constraints to ensure prerequisites are met
   */
  private applyDependencyConstraints(cards: QueuedCard[]): QueuedCard[] {
    if (!this.loadBalancingSettings.dependencies?.enforcePrerequisites) {
      return cards;
    }

    // This is a simplified implementation
    // In practice, you'd check mastery levels of prerequisite concepts
    return cards.filter(card => {
      const dependency = this.conceptDependencies.get(card.cardId);
      if (!dependency) return true;

      // Check if all prerequisites are met
      return dependency.prerequisites.every(prereq => {
        // This would check actual mastery levels from user data
        return true; // Simplified - assume prerequisites are met
      });
    });
  }

  /**
   * Calculate balance ratio of new vs review cards
   */
  private calculateBalanceRatio(cards: QueuedCard[]): number {
    const newCount = cards.filter(c => c.reviewType === 'new').length;
    const totalCount = cards.length;
    return totalCount > 0 ? newCount / totalCount : 0;
  }

  /**
   * Estimate total session duration
   */
  private estimateSessionDuration(cards: QueuedCard[]): number {
    const totalSeconds = cards.reduce((sum, card) => sum + card.estimatedTime, 0);
    return Math.ceil(totalSeconds / 60); // Convert to minutes
  }

  /**
   * Generate queue statistics
   */
  private generateQueueStatistics(cards: QueuedCard[]): QueueStatistics {
    const newCards = cards.filter(c => c.reviewType === 'new').length;
    const reviewCards = cards.filter(c => c.reviewType === 'review').length;
    const overdueCards = cards.filter(c => c.urgencyFactors.overdue > 0).length;

    const averagePriority = cards.length > 0
      ? cards.reduce((sum, c) => sum + c.priority, 0) / cards.length
      : 0;

    const estimatedSessionTime = this.estimateSessionDuration(cards);

    // Calculate difficulty distribution
    const difficultyDistribution = {
      beginner: cards.filter(c => c.urgencyFactors.difficulty <= 15).length,
      intermediate: cards.filter(c => c.urgencyFactors.difficulty > 15 && c.urgencyFactors.difficulty <= 25).length,
      advanced: cards.filter(c => c.urgencyFactors.difficulty > 25).length
    };

    // Calculate type distribution
    const typeDistribution: Record<string, number> = {};
    cards.forEach(card => {
      typeDistribution[card.reviewType] = (typeDistribution[card.reviewType] || 0) + 1;
    });

    return {
      totalCards: cards.length,
      newCards,
      reviewCards,
      overdueCards,
      averagePriority,
      estimatedSessionTime,
      difficultyDistribution,
      typeDistribution
    };
  }

  /**
   * Update load balancing settings
   */
  public updateLoadBalancingSettings(newSettings: Partial<LoadBalancingSettings>): void {
    this.loadBalancingSettings = { ...this.loadBalancingSettings, ...newSettings };
  }

  /**
   * Add concept dependency
   */
  public addConceptDependency(dependency: ConceptDependency): void {
    this.conceptDependencies.set(dependency.conceptId, dependency);
  }

  /**
   * Remove concept dependency
   */
  public removeConceptDependency(conceptId: string): void {
    this.conceptDependencies.delete(conceptId);
  }

  /**
   * Get queue performance metrics
   */
  public getQueueMetrics(completedQueue: ReviewQueue, results: Array<{
    cardId: string;
    correct: boolean;
    responseTime: number;
  }>): {
    accuracy: number;
    averageTime: number;
    difficultyBalance: number;
    userSatisfaction: number;
  } {
    const totalCards = results.length;
    const correctCards = results.filter(r => r.correct).length;
    const accuracy = totalCards > 0 ? correctCards / totalCards : 0;

    const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);
    const averageTime = totalCards > 0 ? totalTime / totalCards : 0;

    // Calculate difficulty balance (how well difficulty was distributed)
    const difficultyVariance = this.calculateDifficultyVariance(completedQueue.cards);
    const difficultyBalance = Math.max(0, 1 - difficultyVariance);

    // Estimate user satisfaction based on accuracy and time
    const timeEfficiency = averageTime > 0 ? Math.min(1, 60 / (averageTime / 1000)) : 0.5;
    const userSatisfaction = (accuracy * 0.7) + (timeEfficiency * 0.3);

    return {
      accuracy,
      averageTime: averageTime / 1000, // Convert to seconds
      difficultyBalance,
      userSatisfaction
    };
  }

  /**
   * Calculate difficulty variance for balance assessment
   */
  private calculateDifficultyVariance(cards: QueuedCard[]): number {
    if (cards.length === 0) return 0;

    const difficulties = cards.map(c => c.urgencyFactors.difficulty);
    const mean = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    const variance = difficulties.reduce((sum, diff) => sum + Math.pow(diff - mean, 2), 0) / difficulties.length;

    // Normalize variance to 0-1 scale
    return Math.min(1, variance / 400); // Assuming max variance around 400
  }

  /**
   * Optimize queue for next session based on performance
   */
  public optimizeForNextSession(
    previousQueue: ReviewQueue,
    results: Array<{ cardId: string; correct: boolean; responseTime: number }>
  ): Partial<LoadBalancingSettings> {
    const metrics = this.getQueueMetrics(previousQueue, results);
    const optimizations: Partial<LoadBalancingSettings> = {};

    // Adjust session time based on performance
    if (metrics.averageTime > 45 && metrics.accuracy < 0.7) {
      // User struggled with time - reduce session length
      optimizations.maxSessionTime = Math.max(30, this.loadBalancingSettings.maxSessionTime - 5);
    } else if (metrics.accuracy > 0.9 && metrics.averageTime < 30) {
      // User performed well quickly - can increase session length
      optimizations.maxSessionTime = Math.min(90, this.loadBalancingSettings.maxSessionTime + 5);
    }

    // Adjust new card limit based on performance
    if (metrics.accuracy < 0.6) {
      optimizations.maxNewCardsPerSession = Math.max(5, this.loadBalancingSettings.maxNewCardsPerSession - 2);
    } else if (metrics.accuracy > 0.85) {
      optimizations.maxNewCardsPerSession = Math.min(30, this.loadBalancingSettings.maxNewCardsPerSession + 2);
    }

    // Adjust difficulty preference based on satisfaction
    if (metrics.userSatisfaction < 0.6) {
      optimizations.difficultyPreference = 'easy-first';
    } else if (metrics.userSatisfaction > 0.8) {
      optimizations.difficultyPreference = 'mixed';
    }

    return optimizations;
  }
}