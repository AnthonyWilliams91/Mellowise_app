/**
 * SM-2 Spaced Repetition Algorithm
 * MELLOWISE-029: Advanced Spaced Repetition System
 *
 * Implementation of the SuperMemo SM-2 algorithm for optimal review scheduling
 * Based on the work of Piotr Wozniak (1990)
 */

import type {
  SM2Parameters,
  SM2Result,
  SpacedRepetitionCard,
  CardScheduling,
  MasteryLevel,
  DEFAULT_SM2_PARAMETERS
} from '@/types/spaced-repetition';

/**
 * SM-2 Algorithm Implementation
 * Calculates optimal review intervals based on performance
 */
export class SM2Algorithm {
  private config: {
    minimumEaseFactor: number;
    maximumEaseFactor: number;
    easeFactorChange: number;
    intervalMultiplier: number;
    graduatingInterval: number; // days
    easyInterval: number; // days
    lapseMultiplier: number;
  };

  constructor(config?: Partial<SM2Algorithm['config']>) {
    this.config = {
      minimumEaseFactor: 1.3,
      maximumEaseFactor: 2.5,
      easeFactorChange: 0.15,
      intervalMultiplier: 1.0,
      graduatingInterval: 1,
      easyInterval: 4,
      lapseMultiplier: 0.5,
      ...config
    };
  }

  /**
   * Process review response and calculate next review parameters
   * @param parameters Current SM-2 parameters
   * @param quality Response quality (0-5)
   * @returns Updated SM-2 parameters and next review date
   */
  public processReview(parameters: SM2Parameters, quality: number): SM2Result {
    if (!this.isValidQuality(quality)) {
      throw new Error('Quality must be between 0 and 5');
    }

    const { easeFactor, interval, repetitions } = parameters;

    // Calculate new ease factor
    const newEaseFactor = this.calculateNewEaseFactor(easeFactor, quality);

    let newInterval: number;
    let newRepetitions: number;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        newInterval = this.config.graduatingInterval;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor * this.config.intervalMultiplier);
      }

      newRepetitions = repetitions + 1;

      // Handle "easy" responses (quality = 5)
      if (quality === 5) {
        newInterval = Math.max(newInterval, this.config.easyInterval);
        if (repetitions === 0) {
          newInterval = this.config.easyInterval;
        } else {
          newInterval = Math.round(newInterval * 1.3); // Bonus for easy
        }
      }

    } else {
      // Incorrect response (lapse)
      newRepetitions = 0;
      newInterval = 1; // Reset to 1 day

      // Apply lapse penalty to ease factor
      const lapsePenalty = 0.2;
      const adjustedEaseFactor = Math.max(
        this.config.minimumEaseFactor,
        newEaseFactor - lapsePenalty
      );
    }

    // Ensure minimum interval of 1 day
    newInterval = Math.max(1, newInterval);

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Calculate interval change percentage
    const intervalChange = interval > 0 ? ((newInterval - interval) / interval) * 100 : 0;

    return {
      newEaseFactor: this.clampEaseFactor(newEaseFactor),
      newInterval,
      newRepetitions,
      nextReviewDate,
      intervalChange
    };
  }

  /**
   * Calculate new ease factor based on quality
   */
  private calculateNewEaseFactor(currentEaseFactor: number, quality: number): number {
    return currentEaseFactor + (
      0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
  }

  /**
   * Clamp ease factor within valid range
   */
  private clampEaseFactor(easeFactor: number): number {
    return Math.min(
      this.config.maximumEaseFactor,
      Math.max(this.config.minimumEaseFactor, easeFactor)
    );
  }

  /**
   * Validate quality score
   */
  private isValidQuality(quality: number): boolean {
    return quality >= 0 && quality <= 5 && Number.isInteger(quality);
  }

  /**
   * Update card scheduling based on review result
   */
  public updateCardScheduling(
    card: SpacedRepetitionCard,
    quality: number,
    responseTime?: number
  ): CardScheduling {
    const currentParams: SM2Parameters = {
      easeFactor: card.scheduling.easeFactor,
      interval: card.scheduling.interval,
      repetitions: card.scheduling.repetitions,
      quality
    };

    const result = this.processReview(currentParams, quality);

    // Update mastery level based on performance
    const newMasteryLevel = this.calculateMasteryLevel(
      result.newRepetitions,
      result.newInterval,
      quality,
      card.statistics.correctReviews + (quality >= 3 ? 1 : 0),
      card.statistics.totalReviews + 1
    );

    // Calculate priority based on various factors
    const priority = this.calculatePriority(
      result.newInterval,
      newMasteryLevel,
      quality,
      card.scheduling.nextReview
    );

    return {
      masteryLevel: newMasteryLevel,
      interval: result.newInterval,
      easeFactor: result.newEaseFactor,
      repetitions: result.newRepetitions,
      nextReview: result.nextReviewDate.toISOString(),
      lastReviewed: new Date().toISOString(),
      schedulingAlgorithm: 'SM-2',
      priority
    };
  }

  /**
   * Calculate mastery level based on card performance
   */
  private calculateMasteryLevel(
    repetitions: number,
    interval: number,
    lastQuality: number,
    correctReviews: number,
    totalReviews: number
  ): MasteryLevel {
    const accuracy = totalReviews > 0 ? correctReviews / totalReviews : 0;

    if (lastQuality < 3) {
      return 'learning'; // Failed review resets to learning
    }

    if (repetitions === 0 || accuracy < 0.6) {
      return 'learning';
    }

    if (repetitions < 3 || interval < 7 || accuracy < 0.8) {
      return 'young';
    }

    if (repetitions < 8 || interval < 21 || accuracy < 0.85) {
      return 'mature';
    }

    if (repetitions >= 15 && interval >= 100 && accuracy >= 0.9) {
      return 'master';
    }

    return 'mature';
  }

  /**
   * Calculate card priority for review queue
   */
  private calculatePriority(
    interval: number,
    masteryLevel: MasteryLevel,
    lastQuality: number,
    nextReview: string
  ): number {
    let priority = 50; // Base priority

    // Overdue factor
    const now = new Date();
    const reviewDate = new Date(nextReview);
    const daysOverdue = Math.max(0, (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

    priority += daysOverdue * 10; // +10 priority per day overdue

    // Mastery level factor
    const masteryPriorities: Record<MasteryLevel, number> = {
      learning: 30,
      young: 20,
      mature: 10,
      master: 5,
      suspended: 0
    };
    priority += masteryPriorities[masteryLevel];

    // Recent performance factor
    if (lastQuality < 3) {
      priority += 25; // Boost priority for failed cards
    } else if (lastQuality === 5) {
      priority -= 10; // Lower priority for easy cards
    }

    // Interval factor (shorter intervals = higher priority)
    priority += Math.max(0, 20 - interval);

    return Math.min(100, Math.max(0, priority));
  }

  /**
   * Predict future performance based on current parameters
   */
  public predictRetention(
    card: SpacedRepetitionCard,
    daysAhead: number = 7
  ): { retention: number; confidence: number } {
    const { easeFactor, interval, repetitions } = card.scheduling;
    const daysSinceLastReview = card.scheduling.lastReviewed
      ? (new Date().getTime() - new Date(card.scheduling.lastReviewed).getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    // Simple exponential decay model
    const timeElapsed = daysSinceLastReview + daysAhead;
    const stabilityFactor = Math.min(2.5, easeFactor);
    const retentionHalfLife = interval * stabilityFactor;

    const retention = Math.pow(0.5, timeElapsed / retentionHalfLife);

    // Confidence based on number of reviews and consistency
    const baseConfidence = Math.min(0.9, repetitions * 0.1);
    const accuracyConfidence = card.statistics.totalReviews > 0
      ? card.statistics.correctReviews / card.statistics.totalReviews
      : 0.5;

    const confidence = (baseConfidence + accuracyConfidence) / 2;

    return {
      retention: Math.max(0, Math.min(1, retention)),
      confidence: Math.max(0.1, Math.min(1, confidence))
    };
  }

  /**
   * Calculate optimal review timing
   */
  public calculateOptimalInterval(
    card: SpacedRepetitionCard,
    targetRetention: number = 0.9
  ): number {
    const { easeFactor, repetitions } = card.scheduling;

    if (repetitions === 0) {
      return this.config.graduatingInterval;
    }

    // Use ease factor to estimate optimal interval
    const stabilityFactor = Math.min(2.5, easeFactor);
    const retentionHalfLife = -Math.log(targetRetention) / Math.log(0.5);

    return Math.max(1, Math.round(retentionHalfLife * stabilityFactor));
  }

  /**
   * Analyze spacing effectiveness
   */
  public analyzeSpacingEffectiveness(
    reviews: Array<{
      interval: number;
      quality: number;
      responseTime: number;
      timestamp: string;
    }>
  ): {
    optimalInterval: number;
    spacingScore: number; // 0-1, higher = better spacing
    recommendations: string[];
  } {
    if (reviews.length < 3) {
      return {
        optimalInterval: 1,
        spacingScore: 0.5,
        recommendations: ['Need more review data for analysis']
      };
    }

    // Group reviews by interval ranges
    const intervalGroups = new Map<string, { qualities: number[]; count: number }>();

    reviews.forEach(review => {
      const intervalRange = this.getIntervalRange(review.interval);
      if (!intervalGroups.has(intervalRange)) {
        intervalGroups.set(intervalRange, { qualities: [], count: 0 });
      }
      const group = intervalGroups.get(intervalRange)!;
      group.qualities.push(review.quality);
      group.count++;
    });

    // Find interval range with best performance
    let bestInterval = 1;
    let bestScore = 0;
    const recommendations: string[] = [];

    intervalGroups.forEach((group, intervalRange) => {
      const averageQuality = group.qualities.reduce((a, b) => a + b, 0) / group.qualities.length;
      const successRate = group.qualities.filter(q => q >= 3).length / group.qualities.length;

      const score = (averageQuality / 5) * 0.6 + successRate * 0.4;

      if (score > bestScore && group.count >= 3) {
        bestScore = score;
        bestInterval = this.parseIntervalRange(intervalRange);
      }
    });

    // Calculate overall spacing score
    const recentReviews = reviews.slice(-10);
    const averageInterval = recentReviews.reduce((sum, r) => sum + r.interval, 0) / recentReviews.length;
    const averageQuality = recentReviews.reduce((sum, r) => sum + r.quality, 0) / recentReviews.length;

    const spacingScore = Math.min(1, (averageQuality / 5) * (1 + Math.log(averageInterval) / 10));

    // Generate recommendations
    if (spacingScore < 0.6) {
      recommendations.push('Consider increasing review frequency');
    }
    if (averageQuality < 3.5) {
      recommendations.push('Focus on understanding before increasing intervals');
    }
    if (averageInterval < 2) {
      recommendations.push('Intervals may be too short for optimal learning');
    }

    return {
      optimalInterval: Math.max(1, bestInterval),
      spacingScore: Math.max(0, Math.min(1, spacingScore)),
      recommendations
    };
  }

  /**
   * Get interval range for grouping
   */
  private getIntervalRange(interval: number): string {
    if (interval <= 1) return '0-1';
    if (interval <= 3) return '2-3';
    if (interval <= 7) return '4-7';
    if (interval <= 14) return '8-14';
    if (interval <= 30) return '15-30';
    if (interval <= 90) return '31-90';
    return '90+';
  }

  /**
   * Parse interval range back to number
   */
  private parseIntervalRange(range: string): number {
    const ranges: Record<string, number> = {
      '0-1': 1,
      '2-3': 3,
      '4-7': 6,
      '8-14': 10,
      '15-30': 21,
      '31-90': 60,
      '90+': 120
    };
    return ranges[range] || 1;
  }

  /**
   * Export algorithm parameters for persistence
   */
  public exportParameters(): Record<string, unknown> {
    return { ...this.config };
  }

  /**
   * Import algorithm parameters
   */
  public importParameters(parameters: Record<string, unknown>): void {
    this.config = { ...this.config, ...parameters };
  }

  /**
   * Reset card to initial state
   */
  public resetCard(): SM2Parameters {
    return { ...DEFAULT_SM2_PARAMETERS };
  }

  /**
   * Handle card suspension (temporary removal from reviews)
   */
  public suspendCard(card: SpacedRepetitionCard): CardScheduling {
    return {
      ...card.scheduling,
      masteryLevel: 'suspended',
      priority: 0,
      nextReview: new Date('2099-12-31').toISOString() // Far future date
    };
  }

  /**
   * Reactivate suspended card
   */
  public reactivateCard(card: SpacedRepetitionCard): CardScheduling {
    const newMasteryLevel = card.statistics.correctReviews > 0 ? 'young' : 'learning';

    return {
      ...card.scheduling,
      masteryLevel: newMasteryLevel,
      interval: 1,
      nextReview: new Date().toISOString(),
      priority: this.calculatePriority(1, newMasteryLevel, 3, new Date().toISOString())
    };
  }
}