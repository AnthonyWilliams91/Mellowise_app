/**
 * Spaced Repetition Service
 * Implements SuperMemo 2 algorithm with FSRS enhancements for optimal review scheduling
 */

import type {
  ReviewItem,
  ReviewResponse,
  SpacedRepetitionResult,
  SpacedRepetitionConfig
} from '@/types/review-queue';

import { DEFAULT_SPACED_REPETITION_CONFIG } from '@/types/review-queue';

export class SpacedRepetitionService {
  private config: SpacedRepetitionConfig;

  constructor(config: Partial<SpacedRepetitionConfig> = {}) {
    this.config = { ...DEFAULT_SPACED_REPETITION_CONFIG, ...config };
  }

  /**
   * Calculate next review date and interval using SM-2 algorithm with FSRS enhancements
   */
  calculateNextReview(
    item: ReviewItem,
    response: ReviewResponse
  ): SpacedRepetitionResult {
    const { quality, timeSpent } = response;

    // Current values
    let { interval, easeFactor, repetitions } = this.extractSM2Values(item);
    let graduated = false;

    // SM-2 Algorithm Implementation
    if (quality >= 3) {
      // Correct response (quality 3-5)
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // Incorrect response (quality 0-2)
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor (only for quality >= 3)
    if (quality >= 3) {
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }

    // Apply FSRS enhancements
    const fsrsAdjustment = this.calculateFSRSAdjustment(item, response, timeSpent);
    interval = Math.round(interval * fsrsAdjustment);

    // Apply configuration constraints
    interval = Math.max(this.config.minInterval, interval);
    interval = Math.min(this.config.maxInterval, interval);

    // Calculate next review date
    const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    // Check if item graduated from learning to review
    if (repetitions >= 2 && quality >= 3) {
      graduated = true;
    }

    return {
      nextInterval: interval,
      nextReview,
      easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimal places
      repetitions,
      quality,
      graduated
    };
  }

  /**
   * FSRS (Free Spaced Repetition Scheduler) adjustment factors
   */
  private calculateFSRSAdjustment(
    item: ReviewItem,
    response: ReviewResponse,
    timeSpent: number
  ): number {
    let adjustment = 1.0;

    // Difficulty adjustment based on question difficulty
    const difficultyFactor = 1.0 - (item.difficulty - 5) * 0.05; // Scale from 0.75 to 1.25
    adjustment *= difficultyFactor;

    // Time spent adjustment (optimal time vs actual time)
    const optimalTime = this.estimateOptimalTime(item);
    const timeRatio = timeSpent / optimalTime;

    if (timeRatio < 0.5) {
      // Too fast - might be guessing
      adjustment *= 0.9;
    } else if (timeRatio > 2.0) {
      // Too slow - struggling with concept
      adjustment *= 0.8;
    } else if (timeRatio >= 0.8 && timeRatio <= 1.2) {
      // Optimal time - boost interval
      adjustment *= 1.1;
    }

    // Confidence adjustment
    switch (response.confidence) {
      case 'low':
        adjustment *= 0.85;
        break;
      case 'medium':
        adjustment *= 1.0;
        break;
      case 'high':
        adjustment *= 1.15;
        break;
    }

    // Hint usage penalty
    const hintPenalty = 1.0 - (response.hintsUsed * 0.1);
    adjustment *= Math.max(0.5, hintPenalty);

    // Historical performance adjustment
    const performanceAdjustment = this.calculatePerformanceAdjustment(item);
    adjustment *= performanceAdjustment;

    return Math.max(0.3, Math.min(2.0, adjustment)); // Clamp between 30% and 200%
  }

  /**
   * Calculate performance-based adjustment
   */
  private calculatePerformanceAdjustment(item: ReviewItem): number {
    const masteryLevel = item.masteryLevel / 100; // 0-1 scale
    const incorrectRate = item.incorrectAttempts / Math.max(1, item.incorrectAttempts + 5); // Assume some correct attempts

    // Higher mastery = longer intervals
    const masteryBonus = 0.8 + (masteryLevel * 0.4); // 0.8 to 1.2

    // Higher error rate = shorter intervals
    const errorPenalty = 1.2 - (incorrectRate * 0.4); // 1.2 to 0.8

    return masteryBonus * errorPenalty;
  }

  /**
   * Estimate optimal time for a question based on difficulty and type
   */
  private estimateOptimalTime(item: ReviewItem): number {
    // Base time by section (in seconds)
    const baseTimes = {
      'logical-reasoning': 90,
      'reading-comprehension': 120,
      'logic-games': 180
    };

    const baseTime = baseTimes[item.section] || 90;

    // Adjust for difficulty (1-10 scale)
    const difficultyMultiplier = 0.5 + (item.difficulty / 10); // 0.6 to 1.5

    return baseTime * difficultyMultiplier;
  }

  /**
   * Extract SM-2 values from ReviewItem, with defaults
   */
  private extractSM2Values(item: ReviewItem) {
    return {
      interval: item.interval || 1,
      easeFactor: item.easeFactor || 2.5,
      repetitions: this.calculateRepetitions(item)
    };
  }

  /**
   * Calculate repetitions based on mastery level and history
   */
  private calculateRepetitions(item: ReviewItem): number {
    // Estimate repetitions based on mastery level
    if (item.masteryLevel >= 80) return 3;
    if (item.masteryLevel >= 60) return 2;
    if (item.masteryLevel >= 40) return 1;
    return 0;
  }

  /**
   * Determine if an item is due for review
   */
  isDueForReview(item: ReviewItem, currentTime: Date = new Date()): boolean {
    return item.nextReview <= currentTime;
  }

  /**
   * Calculate retention rate for a set of review items
   */
  calculateRetentionRate(items: ReviewItem[]): number {
    if (items.length === 0) return 0;

    const retainedItems = items.filter(item => {
      // Item is considered retained if mastery level is above threshold
      // and hasn't been failed recently
      return item.masteryLevel >= 70 &&
             (item.lastAttempted ?
              (Date.now() - item.lastAttempted.getTime()) < 7 * 24 * 60 * 60 * 1000 : true);
    });

    return retainedItems.length / items.length;
  }

  /**
   * Predict future workload based on current items
   */
  predictWorkload(items: ReviewItem[], days: number = 7): { [date: string]: number } {
    const workload: { [date: string]: number } = {};
    const currentTime = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(currentTime.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];

      workload[dateKey] = items.filter(item => {
        const reviewDate = new Date(item.nextReview);
        return reviewDate.toISOString().split('T')[0] === dateKey;
      }).length;
    }

    return workload;
  }

  /**
   * Optimize review schedule to balance workload
   */
  optimizeSchedule(items: ReviewItem[], maxDailyReviews: number): ReviewItem[] {
    const sortedItems = [...items].sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
    const optimizedItems: ReviewItem[] = [];
    const dailyCounts: { [date: string]: number } = {};

    for (const item of sortedItems) {
      const targetDate = new Date(item.nextReview);
      let dateKey = targetDate.toISOString().split('T')[0];

      // If this date is overloaded, shift to next available date
      while ((dailyCounts[dateKey] || 0) >= maxDailyReviews) {
        targetDate.setDate(targetDate.getDate() + 1);
        dateKey = targetDate.toISOString().split('T')[0];
      }

      // Update the item's next review date
      const optimizedItem = {
        ...item,
        nextReview: targetDate
      };

      optimizedItems.push(optimizedItem);
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    }

    return optimizedItems;
  }

  /**
   * Generate learning curve data for analytics
   */
  generateLearningCurve(items: ReviewItem[]): Array<{date: Date, retention: number, items: number}> {
    const curve: Array<{date: Date, retention: number, items: number}> = [];
    const sortedItems = [...items].sort((a, b) => a.created.getTime() - b.created.getTime());

    if (sortedItems.length === 0) return curve;

    const startDate = sortedItems[0].created;
    const endDate = new Date();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

    for (let i = 0; i <= daysDiff; i += 7) { // Weekly data points
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const itemsUpToDate = sortedItems.filter(item => item.created <= date);
      const retention = this.calculateRetentionRate(itemsUpToDate);

      curve.push({
        date,
        retention,
        items: itemsUpToDate.length
      });
    }

    return curve;
  }

  /**
   * Suggest optimal review session size based on user performance
   */
  suggestSessionSize(
    user: { averageAccuracy: number, averageSessionTime: number },
    availableTime: number
  ): number {
    // Base session size on accuracy and available time
    let baseSize = Math.floor(availableTime / 2); // 2 minutes per item average

    // Adjust based on accuracy
    if (user.averageAccuracy > 0.8) {
      baseSize = Math.floor(baseSize * 1.2); // Can handle more items
    } else if (user.averageAccuracy < 0.6) {
      baseSize = Math.floor(baseSize * 0.8); // Should focus on fewer items
    }

    // Adjust based on typical session performance
    const typicalTimePerItem = user.averageSessionTime / baseSize;
    if (typicalTimePerItem > 3) { // More than 3 minutes per item
      baseSize = Math.floor(baseSize * 0.8);
    }

    return Math.max(5, Math.min(50, baseSize)); // Between 5 and 50 items
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SpacedRepetitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SpacedRepetitionConfig {
    return { ...this.config };
  }
}