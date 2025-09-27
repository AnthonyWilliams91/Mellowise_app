/**
 * Readiness Scoring Algorithm
 * Advanced algorithm to calculate overall LSAT readiness with confidence intervals
 */

import {
  ReadinessScore,
  ReadinessFactor,
  ConfidenceInterval,
  TrendLine,
  AnalyticsDataPoint
} from '@/types/analytics-dashboard';

interface UserPerformanceData {
  practiceTests: Array<{
    date: Date;
    score: number;
    accuracy: number;
    timeEfficiency: number;
    sectionsCompleted: number;
  }>;
  questionHistory: Array<{
    date: Date;
    questionType: string;
    difficulty: number;
    correct: boolean;
    timeSpent: number;
    sectionType: string;
  }>;
  studyHistory: Array<{
    date: Date;
    duration: number;
    focusAreas: string[];
    effectiveness: number;
  }>;
  targetScore?: number;
  targetDate?: Date;
}

export class ReadinessScoringService {
  private static readonly FACTOR_WEIGHTS = {
    accuracy: 0.35,      // 35% - Most important factor
    speed: 0.20,         // 20% - Time management crucial for LSAT
    consistency: 0.20,   // 20% - Stable performance across sections
    recent_performance: 0.15, // 15% - Recent trends matter more
    endurance: 0.10      // 10% - Full test stamina
  };

  private static readonly CONFIDENCE_FACTORS = {
    sample_size: 0.4,    // More data = higher confidence
    time_span: 0.3,      // Longer observation period = better
    consistency: 0.3     // Less variance = higher confidence
  };

  /**
   * Calculate comprehensive readiness score
   */
  static calculateReadinessScore(data: UserPerformanceData): ReadinessScore {
    const factors = this.calculateReadinessFactors(data);
    const overall = this.calculateOverallScore(factors);
    const confidenceInterval = this.calculateConfidenceInterval(data, overall);
    const trend = this.calculateTrend(data);
    const projectedScoreRange = this.projectScoreRange(data, overall, confidenceInterval);

    return {
      overall: Math.round(overall),
      confidenceInterval,
      lastUpdated: new Date(),
      factors,
      trend,
      projectedScoreRange
    };
  }

  /**
   * Calculate individual readiness factors
   */
  private static calculateReadinessFactors(data: UserPerformanceData): ReadinessFactor[] {
    return [
      this.calculateAccuracyFactor(data),
      this.calculateSpeedFactor(data),
      this.calculateConsistencyFactor(data),
      this.calculateRecentPerformanceFactor(data),
      this.calculateEnduranceFactor(data)
    ];
  }

  /**
   * Calculate accuracy factor (35% weight)
   */
  private static calculateAccuracyFactor(data: UserPerformanceData): ReadinessFactor {
    const recentQuestions = data.questionHistory.slice(-100); // Last 100 questions
    const totalQuestions = recentQuestions.length;

    if (totalQuestions === 0) {
      return {
        category: 'accuracy',
        name: 'Question Accuracy',
        weight: this.FACTOR_WEIGHTS.accuracy,
        score: 0,
        impact: 'neutral',
        description: 'No question data available',
        recommendations: ['Start practicing questions to establish accuracy baseline']
      };
    }

    const correctAnswers = recentQuestions.filter(q => q.correct).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;

    // Weight by difficulty - harder questions count more
    const weightedAccuracy = recentQuestions.reduce((sum, q) => {
      const weight = q.difficulty / 10; // Normalize difficulty 1-10 to 0.1-1.0
      return sum + (q.correct ? weight : 0);
    }, 0) / recentQuestions.reduce((sum, q) => sum + (q.difficulty / 10), 0) * 100;

    const finalScore = (accuracy * 0.4) + (weightedAccuracy * 0.6); // Blend raw and weighted

    const recommendations = [];
    if (finalScore < 60) {
      recommendations.push('Focus on fundamental concept review');
      recommendations.push('Practice easier questions before advancing to harder ones');
    } else if (finalScore < 75) {
      recommendations.push('Identify and target specific question types with low accuracy');
      recommendations.push('Review explanation for incorrect answers');
    } else if (finalScore < 85) {
      recommendations.push('Focus on most challenging question types');
      recommendations.push('Practice under time pressure to maintain accuracy');
    }

    return {
      category: 'accuracy',
      name: 'Question Accuracy',
      weight: this.FACTOR_WEIGHTS.accuracy,
      score: Math.round(finalScore),
      impact: finalScore >= 75 ? 'positive' : finalScore >= 60 ? 'neutral' : 'negative',
      description: `${Math.round(accuracy)}% accuracy on last ${totalQuestions} questions (weighted: ${Math.round(weightedAccuracy)}%)`,
      recommendations: recommendations.length > 0 ? recommendations : ['Maintain current accuracy level with continued practice']
    };
  }

  /**
   * Calculate speed factor (20% weight)
   */
  private static calculateSpeedFactor(data: UserPerformanceData): ReadinessFactor {
    const recentQuestions = data.questionHistory.slice(-100);

    if (recentQuestions.length === 0) {
      return {
        category: 'speed',
        name: 'Time Management',
        weight: this.FACTOR_WEIGHTS.speed,
        score: 0,
        impact: 'neutral',
        description: 'No timing data available',
        recommendations: ['Begin timed practice to establish speed baseline']
      };
    }

    // Calculate optimal time per question type
    const timeByType = this.groupByQuestionType(recentQuestions);
    let efficiencyScore = 0;
    let typeCount = 0;

    Object.entries(timeByType).forEach(([type, questions]) => {
      const avgTime = questions.reduce((sum, q) => sum + q.timeSpent, 0) / questions.length;
      const avgAccuracy = questions.filter(q => q.correct).length / questions.length;

      // Optimal time varies by question type and difficulty
      const optimalTime = this.getOptimalTime(type, questions);

      // Efficiency = (accuracy * time_efficiency)
      const timeEfficiency = Math.min(1, optimalTime / avgTime); // Penalty for being too slow
      const efficiency = (avgAccuracy * 0.7) + (timeEfficiency * 0.3);

      efficiencyScore += efficiency * 100;
      typeCount++;
    });

    const finalScore = typeCount > 0 ? efficiencyScore / typeCount : 0;

    const recommendations = [];
    if (finalScore < 60) {
      recommendations.push('Practice untimed questions first to build accuracy');
      recommendations.push('Use process of elimination to work faster');
    } else if (finalScore < 75) {
      recommendations.push('Practice timed sections to build speed');
      recommendations.push('Learn to skip difficult questions and return later');
    } else if (finalScore < 85) {
      recommendations.push('Fine-tune timing on specific question types');
      recommendations.push('Practice full-length tests to build endurance');
    }

    return {
      category: 'speed',
      name: 'Time Management',
      weight: this.FACTOR_WEIGHTS.speed,
      score: Math.round(finalScore),
      impact: finalScore >= 70 ? 'positive' : finalScore >= 55 ? 'neutral' : 'negative',
      description: `Time efficiency across ${typeCount} question types`,
      recommendations: recommendations.length > 0 ? recommendations : ['Maintain current pacing with continued timed practice']
    };
  }

  /**
   * Calculate consistency factor (20% weight)
   */
  private static calculateConsistencyFactor(data: UserPerformanceData): ReadinessFactor {
    const recentTests = data.practiceTests.slice(-10); // Last 10 practice tests

    if (recentTests.length < 3) {
      return {
        category: 'consistency',
        name: 'Performance Consistency',
        weight: this.FACTOR_WEIGHTS.consistency,
        score: 50, // Neutral score with insufficient data
        impact: 'neutral',
        description: 'Insufficient practice test data for consistency analysis',
        recommendations: ['Take more practice tests to establish consistency baseline']
      };
    }

    // Calculate variance in performance
    const scores = recentTests.map(t => t.score);
    const accuracies = recentTests.map(t => t.accuracy);

    const scoreVariance = this.calculateVariance(scores);
    const accuracyVariance = this.calculateVariance(accuracies);

    // Lower variance = higher consistency score
    const maxExpectedVariance = 15; // 15-point LSAT score variance is reasonable
    const scoreConsistency = Math.max(0, 100 - (scoreVariance / maxExpectedVariance * 100));

    const maxAccuracyVariance = 10; // 10% accuracy variance
    const accuracyConsistency = Math.max(0, 100 - (accuracyVariance / maxAccuracyVariance * 100));

    const finalScore = (scoreConsistency * 0.6) + (accuracyConsistency * 0.4);

    const recommendations = [];
    if (finalScore < 60) {
      recommendations.push('Identify factors causing performance variance');
      recommendations.push('Establish consistent study schedule and test conditions');
      recommendations.push('Focus on building solid foundation before advancing');
    } else if (finalScore < 80) {
      recommendations.push('Work on mental stamina and test-day consistency');
      recommendations.push('Practice under various conditions to build adaptability');
    }

    return {
      category: 'consistency',
      name: 'Performance Consistency',
      weight: this.FACTOR_WEIGHTS.consistency,
      score: Math.round(finalScore),
      impact: finalScore >= 75 ? 'positive' : finalScore >= 60 ? 'neutral' : 'negative',
      description: `Consistency across ${recentTests.length} recent practice tests (σ=${Math.round(Math.sqrt(scoreVariance))} points)`,
      recommendations: recommendations.length > 0 ? recommendations : ['Maintain consistent performance with regular practice']
    };
  }

  /**
   * Calculate recent performance factor (15% weight)
   */
  private static calculateRecentPerformanceFactor(data: UserPerformanceData): ReadinessFactor {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentQuestions = data.questionHistory.filter(q => q.date >= last30Days);
    const recentTests = data.practiceTests.filter(t => t.date >= last30Days);

    if (recentQuestions.length === 0 && recentTests.length === 0) {
      return {
        category: 'recent_performance',
        name: 'Recent Performance Trend',
        weight: this.FACTOR_WEIGHTS.recent_performance,
        score: 0,
        impact: 'negative',
        description: 'No recent activity in the last 30 days',
        recommendations: ['Resume regular practice to maintain and improve skills']
      };
    }

    // Calculate trend in recent performance
    let trendScore = 50; // Neutral baseline

    if (recentTests.length >= 2) {
      // Use practice test scores for trend
      const sortedTests = recentTests.sort((a, b) => a.date.getTime() - b.date.getTime());
      const trend = this.calculateLinearTrend(sortedTests.map(t => ({ date: t.date, value: t.score })));

      // Convert slope to score impact
      trendScore = 50 + (trend.slope * 5); // Each point improvement = 5 points on factor score
      trendScore = Math.max(0, Math.min(100, trendScore));
    } else if (recentQuestions.length >= 20) {
      // Use question accuracy trend
      const weeklyAccuracy = this.calculateWeeklyAccuracy(recentQuestions);
      if (weeklyAccuracy.length >= 2) {
        const trend = this.calculateLinearTrend(weeklyAccuracy);
        trendScore = 50 + (trend.slope * 100); // Accuracy trend to score
        trendScore = Math.max(0, Math.min(100, trendScore));
      }
    }

    const recommendations = [];
    if (trendScore < 40) {
      recommendations.push('Recent performance shows decline - review study approach');
      recommendations.push('Take a practice test to identify specific areas needing attention');
    } else if (trendScore < 60) {
      recommendations.push('Performance has plateaued - try varying practice methods');
      recommendations.push('Focus on challenging question types to break through plateau');
    } else if (trendScore > 70) {
      recommendations.push('Great recent improvement - maintain current approach');
      recommendations.push('Consider increasing practice intensity to capitalize on momentum');
    }

    return {
      category: 'recent_performance',
      name: 'Recent Performance Trend',
      weight: this.FACTOR_WEIGHTS.recent_performance,
      score: Math.round(trendScore),
      impact: trendScore >= 60 ? 'positive' : trendScore >= 45 ? 'neutral' : 'negative',
      description: `Performance trend over last 30 days (${recentQuestions.length} questions, ${recentTests.length} tests)`,
      recommendations: recommendations.length > 0 ? recommendations : ['Continue current practice approach']
    };
  }

  /**
   * Calculate endurance factor (10% weight)
   */
  private static calculateEnduranceFactor(data: UserPerformanceData): ReadinessFactor {
    const fullLengthTests = data.practiceTests.filter(t => t.sectionsCompleted >= 4);

    if (fullLengthTests.length === 0) {
      return {
        category: 'endurance',
        name: 'Test Endurance',
        weight: this.FACTOR_WEIGHTS.endurance,
        score: 30,
        impact: 'negative',
        description: 'No full-length practice tests completed',
        recommendations: ['Take full-length practice tests to build stamina for test day']
      };
    }

    // Analyze performance degradation across sections
    const enduranceScores = fullLengthTests.map(test => {
      // This would ideally analyze section-by-section performance
      // For now, using overall test completion and time efficiency as proxies
      const completionBonus = test.sectionsCompleted >= 4 ? 20 : 0;
      const efficiencyScore = test.timeEfficiency * 60; // Assuming 0-1 scale
      return completionBonus + efficiencyScore;
    });

    const avgEndurance = enduranceScores.reduce((sum, score) => sum + score, 0) / enduranceScores.length;
    const finalScore = Math.min(100, avgEndurance);

    const recommendations = [];
    if (finalScore < 60) {
      recommendations.push('Take more full-length practice tests to build endurance');
      recommendations.push('Practice maintaining focus for the full 3+ hour test duration');
    } else if (finalScore < 80) {
      recommendations.push('Work on maintaining performance quality in later sections');
      recommendations.push('Develop pacing strategy to avoid fatigue');
    }

    return {
      category: 'endurance',
      name: 'Test Endurance',
      weight: this.FACTOR_WEIGHTS.endurance,
      score: Math.round(finalScore),
      impact: finalScore >= 70 ? 'positive' : finalScore >= 50 ? 'neutral' : 'negative',
      description: `Endurance based on ${fullLengthTests.length} full-length practice tests`,
      recommendations: recommendations.length > 0 ? recommendations : ['Maintain test stamina with regular full-length practice']
    };
  }

  /**
   * Calculate overall readiness score from factors
   */
  private static calculateOverallScore(factors: ReadinessFactor[]): number {
    return factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
  }

  /**
   * Calculate confidence interval for the readiness score
   */
  private static calculateConfidenceInterval(data: UserPerformanceData, overallScore: number): ConfidenceInterval {
    // Factors affecting confidence
    const sampleSizeFactor = Math.min(1, data.questionHistory.length / 200); // Confidence maxes at 200 questions

    const timeSpanDays = data.questionHistory.length > 0
      ? (Date.now() - data.questionHistory[0].date.getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const timeSpanFactor = Math.min(1, timeSpanDays / 90); // Max confidence at 90 days

    const consistencyFactor = data.practiceTests.length >= 3
      ? Math.max(0, 1 - (this.calculateVariance(data.practiceTests.map(t => t.accuracy)) / 100))
      : 0.5;

    // Weighted confidence calculation
    const confidence =
      (sampleSizeFactor * this.CONFIDENCE_FACTORS.sample_size) +
      (timeSpanFactor * this.CONFIDENCE_FACTORS.time_span) +
      (consistencyFactor * this.CONFIDENCE_FACTORS.consistency);

    // Margin of error decreases with higher confidence
    const marginOfError = (1 - confidence) * 20; // Up to 20 points margin

    return {
      lower: Math.max(0, overallScore - marginOfError),
      upper: Math.min(100, overallScore + marginOfError),
      confidence: Math.round(confidence * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Calculate trend line for performance data
   */
  private static calculateTrend(data: UserPerformanceData): TrendLine {
    if (data.practiceTests.length < 2) {
      return {
        slope: 0,
        intercept: 50,
        rSquared: 0,
        direction: 'stable',
        significance: 'low'
      };
    }

    const points = data.practiceTests.map(t => ({ date: t.date, value: t.score }));
    return this.calculateLinearTrend(points);
  }

  /**
   * Project LSAT score range based on current readiness
   */
  private static projectScoreRange(
    data: UserPerformanceData,
    readinessScore: number,
    confidence: ConfidenceInterval
  ): ReadinessScore['projectedScoreRange'] {
    // Convert readiness percentage to LSAT scale (120-180)
    const baseScore = 120 + (readinessScore / 100) * 60;

    // Adjust based on recent practice test performance
    let adjustment = 0;
    if (data.practiceTests.length > 0) {
      const recentAvg = data.practiceTests.slice(-5).reduce((sum, t) => sum + t.score, 0) / Math.min(5, data.practiceTests.length);
      adjustment = (recentAvg - baseScore) * 0.3; // Partial weight to recent tests
    }

    const projectedScore = Math.max(120, Math.min(180, baseScore + adjustment));
    const margin = ((confidence.upper - confidence.lower) / 100) * 30; // Scale to LSAT range

    return {
      min: Math.max(120, Math.round(projectedScore - margin)),
      max: Math.min(180, Math.round(projectedScore + margin)),
      mostLikely: Math.round(projectedScore),
      confidence: confidence.confidence
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static groupByQuestionType(questions: UserPerformanceData['questionHistory']) {
    return questions.reduce((acc, q) => {
      if (!acc[q.questionType]) acc[q.questionType] = [];
      acc[q.questionType].push(q);
      return acc;
    }, {} as Record<string, typeof questions>);
  }

  private static getOptimalTime(questionType: string, questions: UserPerformanceData['questionHistory']): number {
    // Optimal time varies by question type and difficulty
    const avgDifficulty = questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;

    const baseTime = {
      'assumption': 75,
      'strengthen': 70,
      'weaken': 70,
      'inference': 80,
      'main_point': 60,
      'flaw': 75,
      'parallel': 95,
      'method': 70
    }[questionType] || 75;

    return baseTime * (1 + (avgDifficulty - 5) * 0.1); // Adjust for difficulty
  }

  private static calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
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
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

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
      slope: Math.round(slope * 1000) / 1000, // Round to 3 decimal places
      intercept: Math.round(intercept * 100) / 100,
      rSquared: Math.round(rSquared * 1000) / 1000,
      direction,
      significance
    };
  }

  private static calculateWeeklyAccuracy(questions: UserPerformanceData['questionHistory']): AnalyticsDataPoint[] {
    const weeks = new Map<string, { correct: number; total: number }>();

    questions.forEach(q => {
      const weekStart = new Date(q.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { correct: 0, total: 0 });
      }

      const week = weeks.get(weekKey)!;
      week.total++;
      if (q.correct) week.correct++;
    });

    return Array.from(weeks.entries()).map(([week, stats]) => ({
      date: new Date(week),
      value: stats.correct / stats.total,
      label: `Week of ${week}`
    }));
  }
}