/**
 * Section-Specific Analytics Service
 * Detailed analytics for each LSAT section with trend analysis and recommendations
 */

import {
  SectionAnalytics,
  SectionRecommendation,
  TrendLine,
  AnalyticsDataPoint
} from '@/types/analytics-dashboard';

interface SectionPerformanceData {
  sectionType: 'logical_reasoning' | 'reading_comprehension' | 'logic_games';
  questions: Array<{
    id: string;
    date: Date;
    questionType: string;
    topic: string;
    difficulty: number; // 1-10
    timeSpent: number; // seconds
    correct: boolean;
    wasGuessed: boolean;
  }>;
  practiceTests: Array<{
    date: Date;
    sectionScore: number; // Raw score for this section
    sectionAccuracy: number; // 0-100
    timeUsed: number; // seconds used out of 35 minutes
    questionsAttempted: number;
  }>;
  studySessions: Array<{
    date: Date;
    duration: number; // minutes
    focusTopics: string[];
    effectiveness: number; // 0-100
  }>;
}

export class SectionAnalyticsService {
  private static readonly SECTION_CONFIGS = {
    logical_reasoning: {
      expectedQuestions: 25,
      timeAllowed: 2100, // 35 minutes in seconds
      keyTopics: ['assumption', 'strengthen', 'weaken', 'flaw', 'method', 'inference'],
      difficultyDistribution: { easy: 0.3, medium: 0.5, hard: 0.2 }
    },
    reading_comprehension: {
      expectedQuestions: 27,
      timeAllowed: 2100,
      keyTopics: ['main_point', 'inference', 'detail', 'tone', 'strengthen', 'weaken'],
      difficultyDistribution: { easy: 0.25, medium: 0.5, hard: 0.25 }
    },
    logic_games: {
      expectedQuestions: 23,
      timeAllowed: 2100,
      keyTopics: ['sequencing', 'grouping', 'matching', 'hybrid'],
      difficultyDistribution: { easy: 0.2, medium: 0.5, hard: 0.3 }
    }
  };

  /**
   * Generate comprehensive section analytics
   */
  static generateSectionAnalytics(data: SectionPerformanceData): SectionAnalytics {
    const readinessPercentage = this.calculateReadinessPercentage(data);
    const trend = this.calculateSectionTrend(data);
    const performance = this.calculatePerformanceMetrics(data);
    const { weaknesses, strengths } = this.identifyStrengthsAndWeaknesses(data);
    const recommendations = this.generateRecommendations(data, performance);
    const historicalData = this.generateHistoricalData(data);

    return {
      sectionType: data.sectionType,
      readinessPercentage: Math.round(readinessPercentage),
      trend,
      performance,
      weaknessesIdentified: weaknesses,
      strengthsIdentified: strengths,
      recommendations,
      historicalData
    };
  }

  /**
   * Calculate section readiness percentage
   */
  private static calculateReadinessPercentage(data: SectionPerformanceData): number {
    const config = this.SECTION_CONFIGS[data.sectionType];
    const recentQuestions = data.questions.slice(-50); // Last 50 questions

    if (recentQuestions.length === 0) return 0;

    // Accuracy component (40%)
    const accuracy = (recentQuestions.filter(q => q.correct).length / recentQuestions.length) * 100;
    const accuracyScore = Math.min(100, accuracy * 1.2); // Boost for high accuracy

    // Speed component (30%)
    const avgTimePerQuestion = recentQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / recentQuestions.length;
    const targetTime = config.timeAllowed / config.expectedQuestions;
    const speedScore = Math.max(0, 100 - Math.max(0, (avgTimePerQuestion - targetTime) / targetTime * 100));

    // Difficulty progression component (20%)
    const recentDifficulty = recentQuestions.slice(-20).reduce((sum, q) => sum + q.difficulty, 0) / 20;
    const difficultyScore = (recentDifficulty / 10) * 100;

    // Consistency component (10%)
    const last10Tests = data.practiceTests.slice(-10);
    let consistencyScore = 50; // Default if insufficient data
    if (last10Tests.length >= 3) {
      const accuracies = last10Tests.map(t => t.sectionAccuracy);
      const variance = this.calculateVariance(accuracies);
      consistencyScore = Math.max(0, 100 - (variance / 2)); // Lower variance = higher consistency
    }

    const readiness = (accuracyScore * 0.4) + (speedScore * 0.3) + (difficultyScore * 0.2) + (consistencyScore * 0.1);
    return Math.max(0, Math.min(100, readiness));
  }

  /**
   * Calculate performance metrics
   */
  private static calculatePerformanceMetrics(data: SectionPerformanceData): SectionAnalytics['performance'] {
    const recentQuestions = data.questions.slice(-100);
    const recentTests = data.practiceTests.slice(-10);

    // Accuracy calculation
    const accuracy = recentQuestions.length > 0
      ? (recentQuestions.filter(q => q.correct).length / recentQuestions.length) * 100
      : 0;

    // Average time calculation
    const averageTime = recentQuestions.length > 0
      ? recentQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / recentQuestions.length
      : 0;

    // Consistency calculation
    let consistency = 50;
    if (recentTests.length >= 3) {
      const accuracies = recentTests.map(t => t.sectionAccuracy);
      const variance = this.calculateVariance(accuracies);
      consistency = Math.max(0, 100 - (variance / 2));
    }

    // Improvement calculation (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const recentPerformance = this.calculatePeriodPerformance(data, thirtyDaysAgo, new Date());
    const previousPerformance = this.calculatePeriodPerformance(data, sixtyDaysAgo, thirtyDaysAgo);

    const improvement = recentPerformance.accuracy - previousPerformance.accuracy;

    return {
      accuracy: Math.round(accuracy * 10) / 10,
      averageTime: Math.round(averageTime),
      consistency: Math.round(consistency),
      improvement: Math.round(improvement * 10) / 10
    };
  }

  /**
   * Calculate trend line for section performance
   */
  private static calculateSectionTrend(data: SectionPerformanceData): TrendLine {
    // Use practice test data for trend analysis
    if (data.practiceTests.length < 2) {
      return {
        slope: 0,
        intercept: 50,
        rSquared: 0,
        direction: 'stable',
        significance: 'low'
      };
    }

    const points: AnalyticsDataPoint[] = data.practiceTests.map(test => ({
      date: test.date,
      value: test.sectionAccuracy,
      label: `Test ${test.date.toDateString()}`
    }));

    return this.calculateLinearTrend(points);
  }

  /**
   * Identify strengths and weaknesses by topic
   */
  private static identifyStrengthsAndWeaknesses(data: SectionPerformanceData): {
    weaknesses: string[];
    strengths: string[];
  } {
    const topicPerformance = new Map<string, { correct: number; total: number; avgTime: number }>();

    // Analyze recent questions by topic
    const recentQuestions = data.questions.slice(-100);

    recentQuestions.forEach(q => {
      const key = q.topic;
      if (!topicPerformance.has(key)) {
        topicPerformance.set(key, { correct: 0, total: 0, avgTime: 0 });
      }

      const stats = topicPerformance.get(key)!;
      stats.total++;
      if (q.correct) stats.correct++;
      stats.avgTime = (stats.avgTime * (stats.total - 1) + q.timeSpent) / stats.total;
    });

    const topics = Array.from(topicPerformance.entries())
      .filter(([_, stats]) => stats.total >= 5) // Minimum sample size
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.correct / stats.total,
        avgTime: stats.avgTime,
        sampleSize: stats.total
      }));

    // Sort by accuracy to identify strengths and weaknesses
    topics.sort((a, b) => b.accuracy - a.accuracy);

    const threshold = 0.7; // 70% accuracy threshold
    const strengths = topics.filter(t => t.accuracy >= threshold).map(t => t.topic);
    const weaknesses = topics.filter(t => t.accuracy < 0.6).map(t => t.topic); // 60% for weaknesses

    return {
      strengths: strengths.slice(0, 5), // Top 5 strengths
      weaknesses: weaknesses.slice(0, 5) // Top 5 weaknesses
    };
  }

  /**
   * Generate targeted recommendations
   */
  private static generateRecommendations(
    data: SectionPerformanceData,
    performance: SectionAnalytics['performance']
  ): SectionRecommendation[] {
    const recommendations: SectionRecommendation[] = [];
    const config = this.SECTION_CONFIGS[data.sectionType];

    // Accuracy-based recommendations
    if (performance.accuracy < 60) {
      recommendations.push({
        type: 'concept_review',
        priority: 'high',
        description: `Focus on fundamental ${data.sectionType.replace('_', ' ')} concepts before timed practice`,
        estimatedImpact: 20,
        timeToImplement: 15
      });
    } else if (performance.accuracy < 75) {
      recommendations.push({
        type: 'accuracy_focus',
        priority: 'medium',
        description: 'Review incorrect answers and identify recurring mistake patterns',
        estimatedImpact: 12,
        timeToImplement: 8
      });
    }

    // Time management recommendations
    const targetTime = config.timeAllowed / config.expectedQuestions;
    if (performance.averageTime > targetTime * 1.3) {
      recommendations.push({
        type: 'time_management',
        priority: 'high',
        description: 'Practice timed drills to improve question processing speed',
        estimatedImpact: 15,
        timeToImplement: 10
      });
    } else if (performance.averageTime < targetTime * 0.7) {
      recommendations.push({
        type: 'accuracy_focus',
        priority: 'medium',
        description: 'Slow down and read more carefully - prioritize accuracy over speed',
        estimatedImpact: 10,
        timeToImplement: 5
      });
    }

    // Consistency recommendations
    if (performance.consistency < 60) {
      recommendations.push({
        type: 'practice_intensity',
        priority: 'medium',
        description: 'Establish consistent practice schedule to improve performance stability',
        estimatedImpact: 8,
        timeToImplement: 20
      });
    }

    // Improvement trend recommendations
    if (performance.improvement < -5) {
      recommendations.push({
        type: 'concept_review',
        priority: 'high',
        description: 'Recent decline detected - review fundamental concepts and take diagnostic test',
        estimatedImpact: 18,
        timeToImplement: 12
      });
    } else if (performance.improvement > 10) {
      recommendations.push({
        type: 'practice_intensity',
        priority: 'low',
        description: 'Great progress! Consider increasing practice intensity to capitalize on momentum',
        estimatedImpact: 8,
        timeToImplement: 5
      });
    }

    // Section-specific recommendations
    recommendations.push(...this.getSectionSpecificRecommendations(data));

    // Sort by priority and impact
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        return priorityDiff !== 0 ? priorityDiff : b.estimatedImpact - a.estimatedImpact;
      })
      .slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Generate section-specific recommendations
   */
  private static getSectionSpecificRecommendations(data: SectionPerformanceData): SectionRecommendation[] {
    const recentQuestions = data.questions.slice(-50);
    const recommendations: SectionRecommendation[] = [];

    switch (data.sectionType) {
      case 'logical_reasoning':
        const hardLRTypes = ['parallel', 'flaw', 'principle'];
        const hardTypeAccuracy = this.calculateTopicAccuracy(recentQuestions, hardLRTypes);

        if (hardTypeAccuracy < 0.6) {
          recommendations.push({
            type: 'concept_review',
            priority: 'medium',
            description: 'Focus on challenging LR question types: parallel reasoning, flaw, and principle',
            estimatedImpact: 12,
            timeToImplement: 8
          });
        }
        break;

      case 'reading_comprehension':
        const timePerPassage = data.questions
          .filter(q => q.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, q) => sum + q.timeSpent, 0) / 4; // Assume 4 passages

        if (timePerPassage > 8 * 60) { // More than 8 minutes per passage
          recommendations.push({
            type: 'time_management',
            priority: 'medium',
            description: 'Practice active reading techniques to improve passage reading speed',
            estimatedImpact: 10,
            timeToImplement: 6
          });
        }
        break;

      case 'logic_games':
        const setupTime = recentQuestions
          .filter(q => q.questionType === 'setup' || q.questionType.includes('game'))
          .reduce((sum, q) => sum + q.timeSpent, 0);

        if (setupTime > 300) { // More than 5 minutes on setups
          recommendations.push({
            type: 'concept_review',
            priority: 'high',
            description: 'Practice game setup and diagramming to reduce initial time investment',
            estimatedImpact: 15,
            timeToImplement: 10
          });
        }
        break;
    }

    return recommendations;
  }

  /**
   * Generate historical performance data for charts
   */
  private static generateHistoricalData(data: SectionPerformanceData): AnalyticsDataPoint[] {
    // Group questions by week for trend visualization
    const weeklyData = new Map<string, { correct: number; total: number; avgTime: number }>();

    data.questions.forEach(q => {
      const weekStart = new Date(q.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { correct: 0, total: 0, avgTime: 0 });
      }

      const week = weeklyData.get(weekKey)!;
      week.total++;
      if (q.correct) week.correct++;
      week.avgTime = (week.avgTime * (week.total - 1) + q.timeSpent) / week.total;
    });

    return Array.from(weeklyData.entries())
      .filter(([_, stats]) => stats.total >= 3) // Minimum 3 questions per week
      .map(([week, stats]) => ({
        date: new Date(week),
        value: (stats.correct / stats.total) * 100,
        label: `Week of ${new Date(week).toLocaleDateString()}`,
        metadata: {
          questionsAnswered: stats.total,
          averageTime: Math.round(stats.avgTime)
        }
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-12); // Last 12 weeks
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private static calculatePeriodPerformance(
    data: SectionPerformanceData,
    startDate: Date,
    endDate: Date
  ): { accuracy: number; avgTime: number } {
    const periodQuestions = data.questions.filter(q => q.date >= startDate && q.date <= endDate);

    if (periodQuestions.length === 0) {
      return { accuracy: 0, avgTime: 0 };
    }

    const accuracy = (periodQuestions.filter(q => q.correct).length / periodQuestions.length) * 100;
    const avgTime = periodQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / periodQuestions.length;

    return { accuracy, avgTime };
  }

  private static calculateTopicAccuracy(questions: any[], topics: string[]): number {
    const relevantQuestions = questions.filter(q => topics.includes(q.questionType));
    if (relevantQuestions.length === 0) return 0;

    return relevantQuestions.filter(q => q.correct).length / relevantQuestions.length;
  }

  private static calculateLinearTrend(points: AnalyticsDataPoint[]): TrendLine {
    if (points.length < 2) {
      return { slope: 0, intercept: 0, rSquared: 0, direction: 'stable', significance: 'low' };
    }

    // Convert dates to numeric values (days since first point)
    const startTime = points[0].date.getTime();
    const x = points.map(p => (p.date.getTime() - startTime) / (1000 * 60 * 60 * 24));
    const y = points.map(p => p.value);

    // Calculate linear regression
    const n = points.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    const rSquared = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

    // Determine direction and significance
    let direction: TrendLine['direction'];
    if (Math.abs(slope) < 0.1) direction = 'stable';
    else direction = slope > 0 ? 'improving' : 'declining';

    let significance: TrendLine['significance'];
    if (rSquared > 0.7 && Math.abs(slope) > 0.2) significance = 'high';
    else if (rSquared > 0.4 && Math.abs(slope) > 0.1) significance = 'medium';
    else significance = 'low';

    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 100) / 100,
      rSquared: Math.round(rSquared * 1000) / 1000,
      direction,
      significance
    };
  }
}