/**
 * Retention Analytics Service
 * MELLOWISE-029: Advanced Spaced Repetition System
 *
 * Analyzes retention patterns and provides insights for learning optimization
 */

import type {
  RetentionAnalytics,
  ConceptRetentionAnalytics,
  SpacingEffectivenessAnalysis,
  IntervalEffectiveness,
  RetentionPrediction,
  SpacedRepetitionCard,
  MasteryLevel
} from '@/types/spaced-repetition';

/**
 * Retention Analytics Service
 * Provides comprehensive analysis of memory retention patterns
 */
export class RetentionAnalyticsService {
  /**
   * Generate comprehensive retention analytics for a user
   */
  public generateRetentionAnalytics(
    userId: string,
    cards: SpacedRepetitionCard[],
    timeRange: { start: string; end: string }
  ): RetentionAnalytics {
    const filteredCards = this.filterCardsByTimeRange(cards, timeRange);

    const overallMetrics = this.calculateOverallMetrics(filteredCards);
    const conceptBreakdown = this.analyzeConceptBreakdown(filteredCards);
    const forgettingCurveAnalysis = this.analyzeForgettingCurves(filteredCards);
    const spacingEffectiveness = this.analyzeSpacingEffectiveness(filteredCards);
    const predictions = this.generateRetentionPredictions(filteredCards);

    return {
      userId,
      timeRange,
      overallMetrics,
      conceptBreakdown,
      forgettingCurveAnalysis,
      spacingEffectiveness,
      predictions
    };
  }

  /**
   * Filter cards by time range
   */
  private filterCardsByTimeRange(
    cards: SpacedRepetitionCard[],
    timeRange: { start: string; end: string }
  ): SpacedRepetitionCard[] {
    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);

    return cards.filter(card => {
      const lastReviewed = card.scheduling.lastReviewed ? new Date(card.scheduling.lastReviewed) : null;
      return lastReviewed && lastReviewed >= startDate && lastReviewed <= endDate;
    });
  }

  /**
   * Calculate overall retention metrics
   */
  private calculateOverallMetrics(cards: SpacedRepetitionCard[]): RetentionAnalytics['overallMetrics'] {
    const totalCards = cards.length;
    const reviewsCompleted = cards.reduce((sum, card) => sum + card.statistics.totalReviews, 0);

    if (totalCards === 0) {
      return {
        totalCards: 0,
        reviewsCompleted: 0,
        averageRetention: 0,
        retentionImprovement: 0,
        knowledgeStability: 0
      };
    }

    // Calculate average retention (based on accuracy)
    const totalAccuracy = cards.reduce((sum, card) => sum + (card.statistics.lastAccuracy || 0), 0);
    const averageRetention = totalAccuracy / totalCards;

    // Calculate retention improvement over time
    const retentionImprovement = this.calculateRetentionTrend(cards);

    // Calculate knowledge stability (how consistent retention is)
    const knowledgeStability = this.calculateKnowledgeStability(cards);

    return {
      totalCards,
      reviewsCompleted,
      averageRetention,
      retentionImprovement,
      knowledgeStability
    };
  }

  /**
   * Calculate retention trend over time
   */
  private calculateRetentionTrend(cards: SpacedRepetitionCard[]): number {
    // Split cards into early and recent periods
    const midPoint = cards.length / 2;
    const earlyCards = cards.slice(0, midPoint);
    const recentCards = cards.slice(midPoint);

    if (earlyCards.length === 0 || recentCards.length === 0) return 0;

    const earlyAverage = this.calculateAverageAccuracy(earlyCards);
    const recentAverage = this.calculateAverageAccuracy(recentCards);

    return recentAverage - earlyAverage; // Positive = improving, negative = declining
  }

  /**
   * Calculate knowledge stability
   */
  private calculateKnowledgeStability(cards: SpacedRepetitionCard[]): number {
    if (cards.length === 0) return 0;

    // Calculate variance in retention across cards
    const accuracies = cards.map(card => card.statistics.lastAccuracy || 0);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;

    // Convert variance to stability score (lower variance = higher stability)
    return Math.max(0, 1 - variance * 4); // Scale variance to 0-1
  }

  /**
   * Calculate average accuracy for a set of cards
   */
  private calculateAverageAccuracy(cards: SpacedRepetitionCard[]): number {
    if (cards.length === 0) return 0;

    const totalAccuracy = cards.reduce((sum, card) => {
      return sum + (card.statistics.correctReviews / Math.max(1, card.statistics.totalReviews));
    }, 0);

    return totalAccuracy / cards.length;
  }

  /**
   * Analyze retention by concept
   */
  private analyzeConceptBreakdown(cards: SpacedRepetitionCard[]): ConceptRetentionAnalytics[] {
    // Group cards by concept
    const conceptGroups = new Map<string, SpacedRepetitionCard[]>();

    cards.forEach(card => {
      const conceptId = card.conceptId;
      if (!conceptGroups.has(conceptId)) {
        conceptGroups.set(conceptId, []);
      }
      conceptGroups.get(conceptId)!.push(card);
    });

    // Analyze each concept
    return Array.from(conceptGroups.entries()).map(([conceptId, conceptCards]) => {
      return this.analyzeConceptRetention(conceptId, conceptCards);
    });
  }

  /**
   * Analyze retention for a specific concept
   */
  private analyzeConceptRetention(conceptId: string, cards: SpacedRepetitionCard[]): ConceptRetentionAnalytics {
    const cardCount = cards.length;
    const averageRetention = this.calculateAverageAccuracy(cards);

    // Calculate mastery distribution
    const masteryDistribution: Record<MasteryLevel, number> = {
      learning: 0,
      young: 0,
      mature: 0,
      master: 0,
      suspended: 0
    };

    cards.forEach(card => {
      masteryDistribution[card.scheduling.masteryLevel]++;
    });

    // Analyze difficulty impact
    const difficultyImpact = this.analyzeDifficultyImpact(cards);

    // Calculate time to mastery
    const timeToMastery = this.calculateAverageTimeToMastery(cards);

    // Determine retention trend
    const retentionTrend = this.determineRetentionTrend(cards);

    return {
      conceptId,
      conceptName: `Concept ${conceptId}`, // In practice, get from concept mapping
      cardCount,
      averageRetention,
      masteryDistribution,
      difficultyImpact,
      timeToMastery,
      retentionTrend
    };
  }

  /**
   * Analyze how difficulty affects retention
   */
  private analyzeDifficultyImpact(cards: SpacedRepetitionCard[]): ConceptRetentionAnalytics['difficultyImpact'] {
    const groups = {
      easy: cards.filter(c => c.metadata.difficulty === 'beginner'),
      medium: cards.filter(c => c.metadata.difficulty === 'intermediate'),
      hard: cards.filter(c => c.metadata.difficulty === 'advanced')
    };

    return {
      easy: {
        retention: this.calculateAverageAccuracy(groups.easy),
        count: groups.easy.length
      },
      medium: {
        retention: this.calculateAverageAccuracy(groups.medium),
        count: groups.medium.length
      },
      hard: {
        retention: this.calculateAverageAccuracy(groups.hard),
        count: groups.hard.length
      }
    };
  }

  /**
   * Calculate average time to reach mastery
   */
  private calculateAverageTimeToMastery(cards: SpacedRepetitionCard[]): number {
    const matureOrMasterCards = cards.filter(card =>
      ['mature', 'master'].includes(card.scheduling.masteryLevel)
    );

    if (matureOrMasterCards.length === 0) return 0;

    const times = matureOrMasterCards.map(card => {
      const created = new Date(card.createdAt);
      const lastReviewed = card.scheduling.lastReviewed ? new Date(card.scheduling.lastReviewed) : new Date();
      return (lastReviewed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // Days
    });

    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Determine retention trend for concept
   */
  private determineRetentionTrend(cards: SpacedRepetitionCard[]): 'improving' | 'stable' | 'declining' {
    const trend = this.calculateRetentionTrend(cards);

    if (trend > 0.05) return 'improving';
    if (trend < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * Analyze forgetting curves (simplified implementation)
   */
  private analyzeForgettingCurves(cards: SpacedRepetitionCard[]): RetentionAnalytics['forgettingCurveAnalysis'] {
    // Calculate model accuracy based on prediction vs actual performance
    const modelAccuracy = this.calculateModelAccuracy(cards);

    // Find optimal review timing
    const optimalReviewTiming = this.findOptimalReviewTiming(cards);

    // Analyze personalized factors
    const personalizedFactors = this.analyzePersonalizedFactors(cards);

    // Generate recommendations
    const recommendations = this.generateForgettingCurveRecommendations(cards, personalizedFactors);

    return {
      modelAccuracy,
      optimalReviewTiming,
      personalizedFactors,
      recommendations
    };
  }

  /**
   * Calculate model accuracy
   */
  private calculateModelAccuracy(cards: SpacedRepetitionCard[]): number {
    // Simplified implementation - compare predicted vs actual retention
    // In practice, would use more sophisticated forgetting curve models
    return Math.random() * 0.3 + 0.7; // Mock: 0.7-1.0
  }

  /**
   * Find optimal review timing
   */
  private findOptimalReviewTiming(cards: SpacedRepetitionCard[]): number {
    // Analyze intervals that lead to best retention
    const intervals = cards.map(card => card.scheduling.interval);
    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    return averageInterval * 24; // Convert days to hours
  }

  /**
   * Analyze personalized learning factors
   */
  private analyzePersonalizedFactors(cards: SpacedRepetitionCard[]): RetentionAnalytics['forgettingCurveAnalysis']['personalizedFactors'] {
    // Calculate average ease factor as indicator of forgetting rate
    const easeFactors = cards.map(card => card.scheduling.easeFactor);
    const averageEase = easeFactors.reduce((a, b) => a + b, 0) / easeFactors.length;

    const fastForgetter = averageEase < 2.0;

    // Determine learning style based on performance patterns
    const learningStyle = this.determineLearningStyle(cards);

    // Calculate optimal interval based on performance
    const optimalInterval = this.calculateOptimalInterval(cards);

    return {
      fastForgetter,
      learningStyle,
      optimalInterval
    };
  }

  /**
   * Determine learning style
   */
  private determineLearningStyle(cards: SpacedRepetitionCard[]): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // This would analyze card types and performance patterns
    // For now, return mixed as default
    return 'mixed';
  }

  /**
   * Calculate optimal interval for user
   */
  private calculateOptimalInterval(cards: SpacedRepetitionCard[]): number {
    const successfulIntervals = cards
      .filter(card => (card.statistics.correctReviews / Math.max(1, card.statistics.totalReviews)) > 0.8)
      .map(card => card.scheduling.interval);

    if (successfulIntervals.length === 0) return 24;

    return (successfulIntervals.reduce((a, b) => a + b, 0) / successfulIntervals.length) * 24; // Convert to hours
  }

  /**
   * Generate forgetting curve recommendations
   */
  private generateForgettingCurveRecommendations(
    cards: SpacedRepetitionCard[],
    factors: RetentionAnalytics['forgettingCurveAnalysis']['personalizedFactors']
  ): string[] {
    const recommendations: string[] = [];

    if (factors.fastForgetter) {
      recommendations.push('Use shorter initial intervals due to faster forgetting rate');
      recommendations.push('Focus on active recall techniques during reviews');
    }

    if (factors.optimalInterval < 24) {
      recommendations.push('Consider more frequent reviews to improve retention');
    } else if (factors.optimalInterval > 72) {
      recommendations.push('You can space reviews further apart while maintaining retention');
    }

    const avgAccuracy = this.calculateAverageAccuracy(cards);
    if (avgAccuracy < 0.7) {
      recommendations.push('Focus on understanding concepts before increasing intervals');
    }

    return recommendations;
  }

  /**
   * Analyze spacing effectiveness
   */
  private analyzeSpacingEffectiveness(cards: SpacedRepetitionCard[]): SpacingEffectivenessAnalysis {
    // Group cards by interval ranges
    const intervalGroups = this.groupCardsByInterval(cards);

    // Analyze effectiveness of each interval
    const intervals = Array.from(intervalGroups.entries()).map(([intervalRange, groupCards]) => {
      return this.analyzeIntervalEffectiveness(intervalRange, groupCards);
    });

    // Calculate optimal spacing
    const optimalSpacing = this.calculateOptimalSpacing(intervals);

    // Compare massed vs spaced practice
    const massedVsSpacedComparison = this.compareMassedVsSpaced(cards);

    return {
      intervals,
      optimalSpacing,
      massedVsSpacedComparison
    };
  }

  /**
   * Group cards by interval ranges
   */
  private groupCardsByInterval(cards: SpacedRepetitionCard[]): Map<string, SpacedRepetitionCard[]> {
    const groups = new Map<string, SpacedRepetitionCard[]>();

    cards.forEach(card => {
      const intervalRange = this.getIntervalRange(card.scheduling.interval);
      if (!groups.has(intervalRange)) {
        groups.set(intervalRange, []);
      }
      groups.get(intervalRange)!.push(card);
    });

    return groups;
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
    return '30+';
  }

  /**
   * Analyze effectiveness of specific interval
   */
  private analyzeIntervalEffectiveness(intervalRange: string, cards: SpacedRepetitionCard[]): IntervalEffectiveness {
    const interval = this.parseIntervalRange(intervalRange);
    const sampleSize = cards.length;

    if (sampleSize === 0) {
      return {
        interval,
        sampleSize: 0,
        averageRetention: 0,
        confidenceInterval: [0, 0],
        recommendedUsage: 'avoid'
      };
    }

    const averageRetention = this.calculateAverageAccuracy(cards);
    const confidenceInterval = this.calculateConfidenceInterval(cards);

    let recommendedUsage: IntervalEffectiveness['recommendedUsage'];
    if (averageRetention >= 0.8 && sampleSize >= 10) {
      recommendedUsage = 'optimal';
    } else if (averageRetention >= 0.6) {
      recommendedUsage = 'acceptable';
    } else {
      recommendedUsage = 'avoid';
    }

    return {
      interval,
      sampleSize,
      averageRetention,
      confidenceInterval,
      recommendedUsage
    };
  }

  /**
   * Parse interval range to get midpoint
   */
  private parseIntervalRange(range: string): number {
    const ranges: Record<string, number> = {
      '0-1': 1,
      '2-3': 3,
      '4-7': 6,
      '8-14': 10,
      '15-30': 21,
      '30+': 45
    };
    return ranges[range] || 1;
  }

  /**
   * Calculate confidence interval for retention
   */
  private calculateConfidenceInterval(cards: SpacedRepetitionCard[]): [number, number] {
    const accuracies = cards.map(card => card.statistics.correctReviews / Math.max(1, card.statistics.totalReviews));
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    if (accuracies.length <= 1) return [mean, mean];

    // Calculate standard error
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / (accuracies.length - 1);
    const standardError = Math.sqrt(variance / accuracies.length);

    // 95% confidence interval
    const marginOfError = 1.96 * standardError;

    return [
      Math.max(0, mean - marginOfError),
      Math.min(1, mean + marginOfError)
    ];
  }

  /**
   * Calculate optimal spacing recommendations
   */
  private calculateOptimalSpacing(intervals: IntervalEffectiveness[]): SpacingEffectivenessAnalysis['optimalSpacing'] {
    const optimalIntervals = intervals.filter(i => i.recommendedUsage === 'optimal');

    if (optimalIntervals.length === 0) {
      return {
        newCards: 1,
        reviewCards: 3,
        difficultCards: 1
      };
    }

    // Find intervals with best retention rates
    const bestIntervals = optimalIntervals.sort((a, b) => b.averageRetention - a.averageRetention);

    return {
      newCards: bestIntervals[0]?.interval || 1,
      reviewCards: bestIntervals[1]?.interval || 3,
      difficultCards: Math.max(1, (bestIntervals[0]?.interval || 1) * 0.5)
    };
  }

  /**
   * Compare massed vs spaced practice
   */
  private compareMassedVsSpaced(cards: SpacedRepetitionCard[]): SpacingEffectivenessAnalysis['massedVsSpacedComparison'] {
    // Simplified implementation - would need more sophisticated analysis
    const spacedCards = cards.filter(card => card.scheduling.interval > 1);
    const massedCards = cards.filter(card => card.scheduling.interval <= 1);

    const spacedRetention = spacedCards.length > 0 ? this.calculateAverageAccuracy(spacedCards) : 0;
    const massedRetention = massedCards.length > 0 ? this.calculateAverageAccuracy(massedCards) : 0;

    return {
      massedRetention,
      spacedRetention,
      improvement: spacedRetention - massedRetention
    };
  }

  /**
   * Generate retention predictions
   */
  private generateRetentionPredictions(cards: SpacedRepetitionCard[]): RetentionPrediction[] {
    return cards.slice(0, 10).map(card => { // Limit to top 10 cards for example
      const conceptId = card.conceptId;
      const timeHorizon = 7; // Predict 7 days ahead

      // Simple prediction based on current performance and forgetting curve
      const currentRetention = card.statistics.correctReviews / Math.max(1, card.statistics.totalReviews);
      const decayFactor = Math.exp(-0.1 * timeHorizon); // Simple exponential decay
      const predictedRetention = currentRetention * decayFactor;

      // Calculate confidence based on data quality
      const confidence = Math.min(0.9, card.statistics.totalReviews * 0.1);

      // Determine recommended action
      let recommendedAction: RetentionPrediction['recommendedAction'];
      if (predictedRetention < 0.5) {
        recommendedAction = 'intensive-review';
      } else if (predictedRetention < 0.7) {
        recommendedAction = 'increase-frequency';
      } else if (predictedRetention > 0.9) {
        recommendedAction = 'break';
      } else {
        recommendedAction = 'continue';
      }

      // Identify risk factors
      const riskFactors: string[] = [];
      if (card.scheduling.easeFactor < 2.0) riskFactors.push('Low ease factor');
      if (card.statistics.streak < 3) riskFactors.push('Short success streak');
      if (currentRetention < 0.7) riskFactors.push('Recent poor performance');

      return {
        conceptId,
        timeHorizon,
        predictedRetention,
        confidence,
        recommendedAction,
        riskFactors
      };
    });
  }

  /**
   * Export analytics data for external analysis
   */
  public exportAnalyticsData(analytics: RetentionAnalytics): string {
    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Generate summary report
   */
  public generateSummaryReport(analytics: RetentionAnalytics): string {
    const { overallMetrics, conceptBreakdown, spacingEffectiveness } = analytics;

    let report = `Retention Analytics Summary\n`;
    report += `==========================\n\n`;

    report += `Overall Performance:\n`;
    report += `- Total Cards: ${overallMetrics.totalCards}\n`;
    report += `- Reviews Completed: ${overallMetrics.reviewsCompleted}\n`;
    report += `- Average Retention: ${(overallMetrics.averageRetention * 100).toFixed(1)}%\n`;
    report += `- Retention Trend: ${overallMetrics.retentionImprovement > 0 ? 'Improving' : 'Stable'}\n`;
    report += `- Knowledge Stability: ${(overallMetrics.knowledgeStability * 100).toFixed(1)}%\n\n`;

    report += `Top Performing Concepts:\n`;
    const topConcepts = conceptBreakdown
      .sort((a, b) => b.averageRetention - a.averageRetention)
      .slice(0, 3);

    topConcepts.forEach((concept, i) => {
      report += `${i + 1}. ${concept.conceptName}: ${(concept.averageRetention * 100).toFixed(1)}%\n`;
    });

    report += `\nOptimal Review Intervals:\n`;
    report += `- New Cards: ${spacingEffectiveness.optimalSpacing.newCards} days\n`;
    report += `- Review Cards: ${spacingEffectiveness.optimalSpacing.reviewCards} days\n`;
    report += `- Difficult Cards: ${spacingEffectiveness.optimalSpacing.difficultCards} days\n`;

    return report;
  }
}