/**
 * Smart Review Queue Module Index
 * Central export point for spaced repetition and review queue functionality
 */

// Core services
export { SpacedRepetitionService } from './spaced-repetition';
export { ReviewQueueManager } from './queue-manager';
export { HintSystemService } from './hint-system';

// React components
export { default as SmartReviewQueue } from '@/components/review/SmartReviewQueue';

// Types
export type {
  // Core review types
  ReviewItem,
  ReviewItemMetadata,
  ReviewQueue,
  ReviewQueueSettings,
  ReviewQueueStats,
  ReviewSession,
  ReviewSessionItem,
  ReviewResponse,

  // Spaced repetition types
  SpacedRepetitionConfig,
  SpacedRepetitionResult,

  // Queue management types
  SessionPerformance,

  // Mastery tracking types
  MasteryTracker,
  MasteryAttempt,

  // Priority ranking types
  PriorityFactors,
  PriorityRanking,

  // Similar questions types
  SimilarQuestion,
  SimilarQuestionEngine,
  QuestionRecommendation,

  // Hint system types
  HintLevel,
  Hint,
  HintSystem,
  HintUsage,

  // Performance tracking types
  ReviewPerformanceTracker,
  ReviewMetrics,
  ReviewTrends,
  ReviewInsight,
  ReviewRecommendation,
  TrendData,
  DateRange,

  // API interface
  ReviewQueueService
} from '@/types/review-queue';

import {
  DEFAULT_SPACED_REPETITION_CONFIG,
  DEFAULT_QUEUE_SETTINGS,
  MASTERY_THRESHOLDS
} from '@/types/review-queue';

// Constants and configurations
export {
  DEFAULT_SPACED_REPETITION_CONFIG,
  DEFAULT_QUEUE_SETTINGS,
  MASTERY_THRESHOLDS
};

// Utility functions
export function calculateRetentionProbability(
  daysSinceLastReview: number,
  easeFactor: number = 2.5,
  repetitions: number = 0
): number {
  // Simplified forgetting curve calculation
  // Based on Ebbinghaus forgetting curve with SM-2 modifications
  const stability = easeFactor * Math.pow(2.5, repetitions - 1);
  return Math.exp(-daysSinceLastReview / stability);
}

export function estimateTimeToMastery(
  currentMasteryLevel: number,
  improvementVelocity: number,
  targetLevel: number = 90
): number {
  if (currentMasteryLevel >= targetLevel) return 0;
  if (improvementVelocity <= 0) return Infinity;

  const remainingProgress = targetLevel - currentMasteryLevel;
  return Math.ceil(remainingProgress / improvementVelocity);
}

export function categorizeDifficulty(difficulty: number): 'easy' | 'medium' | 'hard' | 'expert' {
  if (difficulty <= 3) return 'easy';
  if (difficulty <= 5) return 'medium';
  if (difficulty <= 7) return 'hard';
  return 'expert';
}

export function calculateOptimalStudyTime(
  masteryLevel: number,
  difficulty: number,
  userExperience: number = 5
): number {
  // Calculate optimal study time in minutes
  const baseTimes = {
    'logical-reasoning': 2,
    'reading-comprehension': 3,
    'logic-games': 4
  };

  const baseTime = baseTimes['logical-reasoning']; // Default
  const difficultyMultiplier = 1 + (difficulty - 5) * 0.2;
  const masteryMultiplier = 1 + (1 - masteryLevel / 100) * 0.5;
  const experienceMultiplier = Math.max(0.5, 1 - (userExperience - 5) * 0.1);

  return Math.round(baseTime * difficultyMultiplier * masteryMultiplier * experienceMultiplier);
}

export function generateStudySchedule(
  items: ReviewItem[],
  studyTimePerDay: number,
  maxItemsPerSession: number = 20
): { [date: string]: ReviewItem[] } {
  const schedule: { [date: string]: ReviewItem[] } = {};
  const sortedItems = [...items].sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

  let currentDate = new Date();
  let dailyItems: ReviewItem[] = [];
  let dailyTime = 0;

  for (const item of sortedItems) {
    const itemTime = calculateOptimalStudyTime(item.masteryLevel, item.difficulty);

    // Check if adding this item would exceed daily limits
    if (dailyItems.length >= maxItemsPerSession || dailyTime + itemTime > studyTimePerDay) {
      // Save current day and move to next
      if (dailyItems.length > 0) {
        const dateKey = currentDate.toISOString().split('T')[0];
        schedule[dateKey] = dailyItems;

        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        dailyItems = [];
        dailyTime = 0;
      }
    }

    dailyItems.push(item);
    dailyTime += itemTime;
  }

  // Save remaining items
  if (dailyItems.length > 0) {
    const dateKey = currentDate.toISOString().split('T')[0];
    schedule[dateKey] = dailyItems;
  }

  return schedule;
}

export function validateReviewItemData(item: Partial<ReviewItem>): string[] {
  const errors: string[] = [];

  if (!item.questionId) errors.push('Question ID is required');
  if (!item.userId) errors.push('User ID is required');
  if (!item.section || !['logical-reasoning', 'reading-comprehension', 'logic-games'].includes(item.section)) {
    errors.push('Valid section is required');
  }
  if (!item.questionType) errors.push('Question type is required');
  if (typeof item.difficulty !== 'number' || item.difficulty < 1 || item.difficulty > 10) {
    errors.push('Difficulty must be between 1 and 10');
  }
  if (typeof item.masteryLevel !== 'number' || item.masteryLevel < 0 || item.masteryLevel > 100) {
    errors.push('Mastery level must be between 0 and 100');
  }
  if (typeof item.priority !== 'number' || item.priority < 0 || item.priority > 1) {
    errors.push('Priority must be between 0 and 1');
  }

  return errors;
}

export class ReviewQueueAnalytics {
  static calculateAverageInterval(items: ReviewItem[]): number {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.interval, 0) / items.length;
  }

  static calculateAverageEaseFactor(items: ReviewItem[]): number {
    if (items.length === 0) return DEFAULT_SPACED_REPETITION_CONFIG.initialInterval;
    return items.reduce((sum, item) => sum + item.easeFactor, 0) / items.length;
  }

  static findMostDifficultAreas(items: ReviewItem[]): Array<{
    area: string;
    averageDifficulty: number;
    averageMastery: number;
    count: number;
  }> {
    const areas = new Map<string, { difficulties: number[], masteries: number[], count: number }>();

    items.forEach(item => {
      const key = `${item.section}-${item.questionType}`;
      if (!areas.has(key)) {
        areas.set(key, { difficulties: [], masteries: [], count: 0 });
      }

      const area = areas.get(key)!;
      area.difficulties.push(item.difficulty);
      area.masteries.push(item.masteryLevel);
      area.count++;
    });

    return Array.from(areas.entries()).map(([area, data]) => ({
      area,
      averageDifficulty: data.difficulties.reduce((sum, d) => sum + d, 0) / data.difficulties.length,
      averageMastery: data.masteries.reduce((sum, m) => sum + m, 0) / data.masteries.length,
      count: data.count
    })).sort((a, b) => (a.averageDifficulty / a.averageMastery) - (b.averageDifficulty / b.averageMastery));
  }

  static generateInsights(items: ReviewItem[]): string[] {
    const insights: string[] = [];

    if (items.length === 0) {
      return ['No review items available for analysis'];
    }

    // Mastery analysis
    const averageMastery = items.reduce((sum, item) => sum + item.masteryLevel, 0) / items.length;
    if (averageMastery < 50) {
      insights.push('Overall mastery is below 50% - consider focusing on fundamental concepts');
    } else if (averageMastery > 80) {
      insights.push('Excellent progress! Most items are well-mastered');
    }

    // Difficulty analysis
    const difficultItems = items.filter(item => item.difficulty >= 7 && item.masteryLevel < 70);
    if (difficultItems.length > items.length * 0.3) {
      insights.push('Many challenging items need attention - consider breaking down complex concepts');
    }

    // Priority analysis
    const highPriorityItems = items.filter(item => item.priority >= 0.8);
    if (highPriorityItems.length > 10) {
      insights.push('Large number of high-priority items - focus on these first for maximum impact');
    }

    // Section analysis
    const sectionCounts = new Map<string, number>();
    items.forEach(item => {
      sectionCounts.set(item.section, (sectionCounts.get(item.section) || 0) + 1);
    });

    const dominantSection = Array.from(sectionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (dominantSection && dominantSection[1] > items.length * 0.6) {
      insights.push(`${dominantSection[0]} dominates your review queue - consider balanced practice across all sections`);
    }

    return insights;
  }
}