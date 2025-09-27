/**
 * Spaced Repetition System Module
 * MELLOWISE-029: Advanced Spaced Repetition System
 */

// Core algorithm and services
export { SM2Algorithm } from './sm2-algorithm';
export { ForgettingCurveService } from './forgetting-curve';
export { PriorityQueueManager } from './priority-queue';
export { RetentionAnalyticsService } from './retention-analytics';

// Types and interfaces
export type {
  // Core Types
  SpacedRepetitionCard,
  CardScheduling,
  CardStatistics,

  // Mastery System
  MasteryLevel,
  MasteryProgression,

  // Forgetting Curves
  ForgettingCurve,
  RetentionDataPoint,
  ForgettingCurveAnalysis,

  // SM-2 Algorithm
  SM2Parameters,
  SM2Result,

  // Priority Queue
  ReviewQueue,
  QueuedCard,
  QueueStatistics,

  // Load Balancing
  LoadBalancer,
  LoadBalancingSettings,
  SessionLoad,
  LoadBalancingRecommendation,

  // Dependencies
  ConceptDependency,
  PrerequisiteConcept,
  DependencyGraph,
  DependencyEdge,

  // Intensive Review
  IntensiveReviewMode,
  IntensiveFocusArea,
  IntensiveSchedule,
  IntensiveSession,

  // Analytics
  RetentionAnalytics,
  ConceptRetentionAnalytics,
  SpacingEffectivenessAnalysis,
  IntervalEffectiveness,
  RetentionPrediction,

  // Configuration
  SpacedRepetitionConfig,

  // Default values
  DEFAULT_SM2_PARAMETERS,
  MASTERY_LEVEL_CONFIGS,
  DEFAULT_LOAD_BALANCING_SETTINGS,
  DEFAULT_SPACED_REPETITION_CONFIG
} from '@/types/spaced-repetition';

// Type guards
export {
  isSpacedRepetitionCard,
  isMasteryLevel,
  isValidQuality,
  isOverdue
} from '@/types/spaced-repetition';

/**
 * Main Spaced Repetition System
 * Orchestrates all components for optimal learning
 */
export class SpacedRepetitionSystem {
  private sm2Algorithm: SM2Algorithm;
  private forgettingCurveService: ForgettingCurveService;
  private priorityQueueManager: PriorityQueueManager;
  private retentionAnalyticsService: RetentionAnalyticsService;
  private config: import('@/types/spaced-repetition').SpacedRepetitionConfig;

  constructor(config: Partial<import('@/types/spaced-repetition').SpacedRepetitionConfig> = {}) {
    const defaultConfig: import('@/types/spaced-repetition').SpacedRepetitionConfig = {
      algorithm: {
        type: 'SM-2',
        parameters: {
          minimumEaseFactor: 1.3,
          maximumEaseFactor: 2.5,
          easeFactorChange: 0.15,
          intervalMultiplier: 1.0
        }
      },
      scheduling: {
        newCardLimit: 20,
        reviewLimit: 200,
        sessionTimeLimit: 60,
        graduatingInterval: 1,
        easyInterval: 4,
        lapseInterval: 0.5
      },
      mastery: {
        learningSteps: [1, 10, 1440], // 1min, 10min, 1day
        youngThreshold: 7,
        matureThreshold: 21,
        masterThreshold: 100
      },
      loadBalancing: {
        enabled: true,
        maxDifficultStreak: 5,
        fatigueDetection: true,
        adaptiveBreaks: true
      },
      dependencies: {
        enforcePrerequisites: true,
        softBlockingWarning: true,
        prerequisiteWeight: 0.8
      }
    };

    this.config = { ...defaultConfig, ...config };

    // Initialize services
    this.sm2Algorithm = new SM2Algorithm(this.config.algorithm.parameters);
    this.forgettingCurveService = new ForgettingCurveService();
    this.priorityQueueManager = new PriorityQueueManager({
      maxSessionTime: this.config.scheduling.sessionTimeLimit,
      maxNewCardsPerSession: this.config.scheduling.newCardLimit,
      maxReviewCardsPerSession: this.config.scheduling.reviewLimit,
      preferredSessionTimes: ['09:00', '14:00', '19:00'],
      weeklyReviewGoal: 700,
      difficultyPreference: 'mixed',
      burnoutPrevention: {
        enabled: this.config.loadBalancing.enabled,
        maxConsecutiveDifficult: this.config.loadBalancing.maxDifficultStreak,
        restPeriodAfterDifficult: 2,
        fatigueThreshold: 0.7
      }
    });
    this.retentionAnalyticsService = new RetentionAnalyticsService();
  }

  /**
   * Process a review response and update card
   */
  public processReview(
    card: import('@/types/spaced-repetition').SpacedRepetitionCard,
    quality: number,
    responseTime: number = 0
  ): {
    updatedCard: import('@/types/spaced-repetition').SpacedRepetitionCard;
    schedulingResult: import('@/types/spaced-repetition').SM2Result;
  } {
    // Update card scheduling using SM-2
    const updatedScheduling = this.sm2Algorithm.updateCardScheduling(card, quality, responseTime);

    // Update card statistics
    const updatedStatistics: import('@/types/spaced-repetition').CardStatistics = {
      ...card.statistics,
      totalReviews: card.statistics.totalReviews + 1,
      correctReviews: card.statistics.correctReviews + (quality >= 3 ? 1 : 0),
      streak: quality >= 3 ? card.statistics.streak + 1 : 0,
      maxStreak: Math.max(card.statistics.maxStreak, quality >= 3 ? card.statistics.streak + 1 : 0),
      averageResponseTime: responseTime > 0
        ? (card.statistics.averageResponseTime * card.statistics.totalReviews + responseTime) / (card.statistics.totalReviews + 1)
        : card.statistics.averageResponseTime,
      lastAccuracy: quality >= 3 ? 1 : 0,
      retentionRate: (card.statistics.correctReviews + (quality >= 3 ? 1 : 0)) / (card.statistics.totalReviews + 1),
      performanceTrend: this.calculatePerformanceTrend(card, quality)
    };

    // Create updated card
    const updatedCard: import('@/types/spaced-repetition').SpacedRepetitionCard = {
      ...card,
      scheduling: updatedScheduling,
      statistics: updatedStatistics,
      updatedAt: new Date().toISOString()
    };

    // Update forgetting curve
    this.forgettingCurveService.updateForgettingCurve(
      card.userId,
      card.conceptId,
      {
        timeElapsed: responseTime / (1000 * 60 * 60), // Convert to hours
        retention: quality >= 3 ? 1 : 0,
        wasCorrect: quality >= 3,
        responseTime,
        confidenceLevel: Math.min(5, Math.max(1, quality))
      }
    );

    // Get SM-2 result for additional info
    const schedulingResult = this.sm2Algorithm.processReview({
      easeFactor: card.scheduling.easeFactor,
      interval: card.scheduling.interval,
      repetitions: card.scheduling.repetitions,
      quality
    }, quality);

    return { updatedCard, schedulingResult };
  }

  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(
    card: import('@/types/spaced-repetition').SpacedRepetitionCard,
    currentQuality: number
  ): 'improving' | 'stable' | 'declining' {
    // Simple trend calculation based on recent performance
    const recentAccuracy = card.statistics.lastAccuracy || 0.5;
    const currentAccuracy = currentQuality >= 3 ? 1 : 0;

    if (currentAccuracy > recentAccuracy + 0.1) return 'improving';
    if (currentAccuracy < recentAccuracy - 0.1) return 'declining';
    return 'stable';
  }

  /**
   * Generate review queue for a study session
   */
  public generateStudySession(
    userId: string,
    availableCards: import('@/types/spaced-repetition').SpacedRepetitionCard[],
    sessionOptions: {
      maxTime?: number; // minutes
      maxNewCards?: number;
      maxReviewCards?: number;
      focusAreas?: string[]; // concept IDs to focus on
    } = {}
  ): import('@/types/spaced-repetition').ReviewQueue {
    const options = {
      maxTime: sessionOptions.maxTime || this.config.scheduling.sessionTimeLimit,
      maxNewCards: sessionOptions.maxNewCards || this.config.scheduling.newCardLimit,
      maxReviewCards: sessionOptions.maxReviewCards || this.config.scheduling.reviewLimit,
      focusAreas: sessionOptions.focusAreas || []
    };

    // Filter cards by focus areas if specified
    let filteredCards = availableCards;
    if (options.focusAreas.length > 0) {
      filteredCards = availableCards.filter(card =>
        options.focusAreas.includes(card.conceptId)
      );
    }

    return this.priorityQueueManager.generateReviewQueue(
      userId,
      filteredCards,
      'session',
      options.maxTime
    );
  }

  /**
   * Analyze user's retention patterns
   */
  public analyzeRetention(
    userId: string,
    cards: import('@/types/spaced-repetition').SpacedRepetitionCard[],
    timeRange: { start: string; end: string }
  ): import('@/types/spaced-repetition').RetentionAnalytics {
    return this.retentionAnalyticsService.generateRetentionAnalytics(userId, cards, timeRange);
  }

  /**
   * Get retention prediction for a card
   */
  public predictRetention(
    card: import('@/types/spaced-repetition').SpacedRepetitionCard,
    daysAhead: number = 7
  ): { retention: number; confidence: number } {
    return this.sm2Algorithm.predictRetention(card, daysAhead);
  }

  /**
   * Find optimal review time for target retention
   */
  public findOptimalReviewTime(
    userId: string,
    conceptId: string,
    targetRetention: number = 0.9
  ): { timeHours: number; confidence: number } {
    return this.forgettingCurveService.findOptimalReviewTime(userId, conceptId, targetRetention);
  }

  /**
   * Get comprehensive system statistics
   */
  public getSystemStatistics(cards: import('@/types/spaced-repetition').SpacedRepetitionCard[]): {
    totalCards: number;
    masteryDistribution: Record<import('@/types/spaced-repetition').MasteryLevel, number>;
    averageRetention: number;
    overdueCards: number;
    curveStatistics: ReturnType<ForgettingCurveService['getCurveStatistics']>;
  } {
    const masteryDistribution: Record<import('@/types/spaced-repetition').MasteryLevel, number> = {
      learning: 0,
      young: 0,
      mature: 0,
      master: 0,
      suspended: 0
    };

    let totalRetention = 0;
    let overdueCount = 0;
    const now = new Date();

    cards.forEach(card => {
      masteryDistribution[card.scheduling.masteryLevel]++;
      totalRetention += card.statistics.retentionRate;

      if (new Date(card.scheduling.nextReview) < now) {
        overdueCount++;
      }
    });

    return {
      totalCards: cards.length,
      masteryDistribution,
      averageRetention: cards.length > 0 ? totalRetention / cards.length : 0,
      overdueCards: overdueCount,
      curveStatistics: this.forgettingCurveService.getCurveStatistics()
    };
  }

  /**
   * Optimize system settings based on user performance
   */
  public optimizeSettings(
    userId: string,
    cards: import('@/types/spaced-repetition').SpacedRepetitionCard[],
    recentSessions: Array<{
      completedCards: number;
      averageAccuracy: number;
      totalTime: number;
      userSatisfaction: number;
    }>
  ): Partial<import('@/types/spaced-repetition').SpacedRepetitionConfig> {
    const recommendations: Partial<import('@/types/spaced-repetition').SpacedRepetitionConfig> = {};

    if (recentSessions.length === 0) return recommendations;

    const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.averageAccuracy, 0) / recentSessions.length;
    const avgSatisfaction = recentSessions.reduce((sum, s) => sum + s.userSatisfaction, 0) / recentSessions.length;

    // Optimize new card limit
    if (avgAccuracy > 0.85 && avgSatisfaction > 0.8) {
      recommendations.scheduling = {
        ...this.config.scheduling,
        newCardLimit: Math.min(30, this.config.scheduling.newCardLimit + 2)
      };
    } else if (avgAccuracy < 0.65 || avgSatisfaction < 0.6) {
      recommendations.scheduling = {
        ...this.config.scheduling,
        newCardLimit: Math.max(5, this.config.scheduling.newCardLimit - 2)
      };
    }

    // Optimize session time limit
    const avgSessionTime = recentSessions.reduce((sum, s) => sum + s.totalTime, 0) / recentSessions.length;
    if (avgSessionTime < this.config.scheduling.sessionTimeLimit * 0.7 && avgSatisfaction > 0.8) {
      recommendations.scheduling = {
        ...recommendations.scheduling,
        sessionTimeLimit: Math.min(90, this.config.scheduling.sessionTimeLimit + 5)
      };
    }

    return recommendations;
  }

  /**
   * Export system configuration
   */
  public exportConfiguration(): import('@/types/spaced-repetition').SpacedRepetitionConfig {
    return { ...this.config };
  }

  /**
   * Update system configuration
   */
  public updateConfiguration(newConfig: Partial<import('@/types/spaced-repetition').SpacedRepetitionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update algorithm parameters if changed
    if (newConfig.algorithm?.parameters) {
      this.sm2Algorithm.importParameters(newConfig.algorithm.parameters);
    }

    // Update load balancing settings if changed
    if (newConfig.scheduling) {
      this.priorityQueueManager.updateLoadBalancingSettings({
        maxSessionTime: newConfig.scheduling.sessionTimeLimit || this.config.scheduling.sessionTimeLimit,
        maxNewCardsPerSession: newConfig.scheduling.newCardLimit || this.config.scheduling.newCardLimit,
        maxReviewCardsPerSession: newConfig.scheduling.reviewLimit || this.config.scheduling.reviewLimit
      });
    }
  }

  /**
   * Create a new spaced repetition card
   */
  public createCard(cardData: {
    conceptId: string;
    userId: string;
    content: {
      question: string;
      answer: string;
      explanation?: string;
      hints?: string[];
    };
    metadata: {
      type: 'logical-reasoning' | 'reading-comprehension' | 'logic-games' | 'general';
      subtype?: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      tags: string[];
      source?: string;
      estimatedTime?: number;
    };
    dependencies?: string[];
  }): import('@/types/spaced-repetition').SpacedRepetitionCard {
    const now = new Date().toISOString();

    return {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conceptId: cardData.conceptId,
      userId: cardData.userId,
      content: cardData.content,
      metadata: {
        ...cardData.metadata,
        estimatedTime: cardData.metadata.estimatedTime || 30
      },
      scheduling: {
        masteryLevel: 'learning',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReview: now,
        schedulingAlgorithm: 'SM-2',
        priority: 50
      },
      statistics: {
        totalReviews: 0,
        correctReviews: 0,
        streak: 0,
        maxStreak: 0,
        averageResponseTime: 0,
        difficultyRating: 3,
        retentionRate: 0,
        lastAccuracy: 0,
        performanceTrend: 'stable'
      },
      dependencies: cardData.dependencies || [],
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Cleanup old data and optimize performance
   */
  public cleanup(options: {
    removeOlderThanDays?: number;
    compactCurves?: boolean;
    optimizeQueue?: boolean;
  } = {}): {
    removedCurves: number;
    optimizedCards: number;
  } {
    const removedCurves = this.forgettingCurveService.cleanup(options.removeOlderThanDays || 180);

    return {
      removedCurves,
      optimizedCards: 0 // Placeholder for card optimization
    };
  }
}

/**
 * Create a new spaced repetition system instance
 */
export function createSpacedRepetitionSystem(
  config?: Partial<import('@/types/spaced-repetition').SpacedRepetitionConfig>
): SpacedRepetitionSystem {
  return new SpacedRepetitionSystem(config);
}

/**
 * Utility functions for spaced repetition
 */
export const SpacedRepetitionUtils = {
  /**
   * Calculate days until next review
   */
  daysUntilReview(card: import('@/types/spaced-repetition').SpacedRepetitionCard): number {
    const now = new Date();
    const nextReview = new Date(card.scheduling.nextReview);
    const timeDiff = nextReview.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if card is due for review
   */
  isDue(card: import('@/types/spaced-repetition').SpacedRepetitionCard): boolean {
    return new Date(card.scheduling.nextReview) <= new Date();
  },

  /**
   * Get mastery level color for UI
   */
  getMasteryColor(level: import('@/types/spaced-repetition').MasteryLevel): string {
    const colors = {
      learning: '#ef4444',    // red
      young: '#f59e0b',       // amber
      mature: '#10b981',      // emerald
      master: '#8b5cf6',      // violet
      suspended: '#6b7280'    // gray
    };
    return colors[level];
  },

  /**
   * Format interval for display
   */
  formatInterval(days: number): string {
    if (days < 1) return 'Today';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  },

  /**
   * Calculate study streak
   */
  calculateStreak(cards: import('@/types/spaced-repetition').SpacedRepetitionCard[]): number {
    return Math.max(...cards.map(card => card.statistics.streak));
  },

  /**
   * Get performance level description
   */
  getPerformanceDescription(retentionRate: number): string {
    if (retentionRate >= 0.9) return 'Excellent';
    if (retentionRate >= 0.8) return 'Good';
    if (retentionRate >= 0.7) return 'Fair';
    if (retentionRate >= 0.6) return 'Needs Work';
    return 'Poor';
  }
};