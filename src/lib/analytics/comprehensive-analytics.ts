/**
 * Comprehensive Analytics Services
 * All remaining analytics services: Time Management, Score Prediction, Peer Comparison, Study Efficiency
 */

import {
  TimeManagementAnalytics,
  SpeedAccuracyData,
  TimingRecommendation,
  ScorePrediction,
  PredictionFactor,
  PeerComparisonData,
  PeerMetric,
  StudyEfficiencyMetrics,
  ActivityEfficiency,
  EfficiencyRecommendation,
  ConfidenceInterval
} from '@/types/analytics-dashboard';

// ============================================================================
// TIME MANAGEMENT ANALYTICS SERVICE
// ============================================================================

interface TimingData {
  questionId: string;
  date: Date;
  questionType: string;
  difficulty: number;
  timeSpent: number;
  correct: boolean;
  sectionType: string;
}

export class TimeManagementAnalyticsService {
  static generateTimeManagementAnalytics(data: TimingData[]): TimeManagementAnalytics {
    const speedVsAccuracy = this.calculateSpeedAccuracyData(data);
    const optimalTimingZone = this.findOptimalTimingZone(data);
    const timeDistribution = this.calculateTimeDistribution(data);
    const pacing = this.calculatePacingMetrics(data);
    const recommendations = this.generateTimingRecommendations(data, pacing);

    return {
      speedVsAccuracy,
      optimalTimingZone,
      timeDistribution,
      pacing,
      recommendations
    };
  }

  private static calculateSpeedAccuracyData(data: TimingData[]): SpeedAccuracyData[] {
    const timeBuckets = [
      { range: '0-30s', min: 0, max: 30 },
      { range: '30-45s', min: 30, max: 45 },
      { range: '45-60s', min: 45, max: 60 },
      { range: '60-90s', min: 60, max: 90 },
      { range: '90-120s', min: 90, max: 120 },
      { range: '120s+', min: 120, max: Infinity }
    ];

    return timeBuckets.map(bucket => {
      const bucketQuestions = data.filter(q =>
        q.timeSpent >= bucket.min && q.timeSpent < bucket.max
      );

      if (bucketQuestions.length === 0) {
        return {
          timeRange: bucket.range,
          averageTime: (bucket.min + (bucket.max === Infinity ? 150 : bucket.max)) / 2,
          accuracy: 0,
          questionCount: 0,
          efficiency: 0
        };
      }

      const averageTime = bucketQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / bucketQuestions.length;
      const accuracy = (bucketQuestions.filter(q => q.correct).length / bucketQuestions.length) * 100;
      const efficiency = this.calculateEfficiency(accuracy, averageTime);

      return {
        timeRange: bucket.range,
        averageTime: Math.round(averageTime),
        accuracy: Math.round(accuracy * 10) / 10,
        questionCount: bucketQuestions.length,
        efficiency: Math.round(efficiency * 10) / 10
      };
    });
  }

  private static findOptimalTimingZone(data: TimingData[]): TimeManagementAnalytics['optimalTimingZone'] {
    const speedAccuracyData = this.calculateSpeedAccuracyData(data);
    const optimalBucket = speedAccuracyData.reduce((best, current) =>
      current.efficiency > best.efficiency ? current : best
    );

    return {
      minTime: optimalBucket.timeRange.includes('-')
        ? parseInt(optimalBucket.timeRange.split('-')[0])
        : parseInt(optimalBucket.timeRange.replace('s+', '')),
      maxTime: optimalBucket.timeRange.includes('-')
        ? parseInt(optimalBucket.timeRange.split('-')[1].replace('s', ''))
        : 180,
      targetAccuracy: optimalBucket.accuracy,
      description: `Optimal performance in ${optimalBucket.timeRange} range with ${optimalBucket.accuracy}% accuracy`
    };
  }

  private static calculateTimeDistribution(data: TimingData[]): TimeManagementAnalytics['timeDistribution'] {
    const totalQuestions = data.length;
    if (totalQuestions === 0) return { tooFast: 0, optimal: 0, tooSlow: 0 };

    // Define thresholds based on question difficulty and type
    const tooFast = data.filter(q => q.timeSpent < 30).length;
    const tooSlow = data.filter(q => q.timeSpent > 120).length;
    const optimal = totalQuestions - tooFast - tooSlow;

    return {
      tooFast: Math.round((tooFast / totalQuestions) * 100),
      optimal: Math.round((optimal / totalQuestions) * 100),
      tooSlow: Math.round((tooSlow / totalQuestions) * 100)
    };
  }

  private static calculatePacingMetrics(data: TimingData[]): TimeManagementAnalytics['pacing'] {
    if (data.length === 0) return { consistency: 0, variance: 0, rushingTendency: 0, deliberationScore: 0 };

    const times = data.map(q => q.timeSpent);
    const mean = times.reduce((sum, t) => sum + t, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) / mean * 100));

    const rushingTendency = (data.filter(q => q.timeSpent < 30).length / data.length) * 100;

    const hardQuestions = data.filter(q => q.difficulty >= 7);
    const deliberationScore = hardQuestions.length > 0
      ? (hardQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / hardQuestions.length) / mean * 100
      : 50;

    return {
      consistency: Math.round(consistency),
      variance: Math.round(Math.sqrt(variance)),
      rushingTendency: Math.round(rushingTendency),
      deliberationScore: Math.round(deliberationScore)
    };
  }

  private static generateTimingRecommendations(data: TimingData[], pacing: TimeManagementAnalytics['pacing']): TimingRecommendation[] {
    const recommendations: TimingRecommendation[] = [];

    if (pacing.rushingTendency > 30) {
      recommendations.push({
        area: 'pacing',
        description: 'High tendency to rush through questions',
        currentBehavior: 'Answering too quickly, potentially missing key information',
        targetBehavior: 'Take time to carefully read and understand each question',
        expectedImprovement: '10-15% accuracy improvement'
      });
    }

    if (pacing.consistency < 60) {
      recommendations.push({
        area: 'time_allocation',
        description: 'Inconsistent time allocation across questions',
        currentBehavior: 'Varying significantly in time spent per question',
        targetBehavior: 'Develop consistent approach and timing for each question type',
        expectedImprovement: '5-10% overall efficiency improvement'
      });
    }

    if (pacing.deliberationScore < 80) {
      recommendations.push({
        area: 'question_selection',
        description: 'Not spending enough time on difficult questions',
        currentBehavior: 'Rushing through challenging questions',
        targetBehavior: 'Allocate more time to difficult questions, skip if necessary',
        expectedImprovement: '8-12% improvement on hard questions'
      });
    }

    return recommendations.slice(0, 3);
  }

  private static calculateEfficiency(accuracy: number, timeSpent: number): number {
    // Efficiency score balances accuracy and time
    const timeScore = Math.max(0, 100 - (timeSpent - 60) / 60 * 25); // Penalty for time > 60s
    return (accuracy * 0.7) + (timeScore * 0.3);
  }
}

// ============================================================================
// SCORE PREDICTION SERVICE
// ============================================================================

interface PredictionInputData {
  practiceTests: Array<{ date: Date; score: number; accuracy: number }>;
  questionHistory: Array<{ date: Date; correct: boolean; difficulty: number; timeSpent: number }>;
  studyTime: number; // total hours
  targetScore?: number;
  targetDate?: Date;
}

export class ScorePredictionService {
  static generateScorePrediction(data: PredictionInputData): ScorePrediction {
    const predictedScore = this.calculatePredictedScore(data);
    const confidenceInterval = this.calculatePredictionConfidence(data, predictedScore);
    const factors = this.identifyPredictionFactors(data);
    const scenarios = this.calculateScenarios(data, predictedScore);
    const timeToTarget = data.targetScore ? this.calculateTimeToTarget(data, predictedScore) : undefined;

    return {
      predictedScore: Math.round(predictedScore),
      confidenceInterval,
      predictionDate: new Date(),
      basedOn: {
        practiceTests: data.practiceTests.length,
        questionsSolved: data.questionHistory.length,
        studyHours: data.studyTime,
        timeSpan: this.calculateTimeSpan(data)
      },
      factors,
      scenarios,
      timeToTarget
    };
  }

  private static calculatePredictedScore(data: PredictionInputData): number {
    if (data.practiceTests.length === 0) return 145; // Default baseline

    // Recent performance weighting
    const recentTests = data.practiceTests.slice(-5);
    const recentAvg = recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length;

    // Overall trend analysis
    const trend = this.calculateTrendSlope(data.practiceTests);

    // Question-level accuracy
    const recentQuestions = data.questionHistory.slice(-200);
    const questionAccuracy = recentQuestions.length > 0
      ? recentQuestions.filter(q => q.correct).length / recentQuestions.length
      : 0.7;

    // Composite prediction
    const baseScore = recentAvg * 0.6; // 60% from recent tests
    const trendAdjustment = Math.min(10, Math.max(-10, trend * 30)); // Cap trend impact
    const accuracyBonus = (questionAccuracy - 0.7) * 30; // Bonus/penalty from baseline accuracy

    return Math.max(120, Math.min(180, baseScore + trendAdjustment + accuracyBonus));
  }

  private static calculatePredictionConfidence(data: PredictionInputData, predictedScore: number): ConfidenceInterval {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    confidence += Math.min(0.3, data.practiceTests.length * 0.05);
    confidence += Math.min(0.2, data.questionHistory.length * 0.0005);

    // Recent performance consistency
    if (data.practiceTests.length >= 3) {
      const recentScores = data.practiceTests.slice(-5).map(t => t.score);
      const variance = this.calculateVariance(recentScores);
      confidence += Math.max(0, 0.2 - (variance / 100));
    }

    const marginOfError = (1 - confidence) * 15; // Up to 15 points margin

    return {
      lower: Math.max(120, Math.round(predictedScore - marginOfError)),
      upper: Math.min(180, Math.round(predictedScore + marginOfError)),
      confidence: Math.round(confidence * 100) / 100
    };
  }

  private static identifyPredictionFactors(data: PredictionInputData): PredictionFactor[] {
    const factors: PredictionFactor[] = [];

    // Recent performance trend
    const trend = this.calculateTrendSlope(data.practiceTests);
    factors.push({
      name: 'Recent Performance Trend',
      currentValue: trend,
      impact: trend * 5, // Convert slope to point impact
      confidence: data.practiceTests.length >= 3 ? 0.8 : 0.5,
      description: `${trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'} performance trend`
    });

    // Question accuracy
    const recentAccuracy = data.questionHistory.length > 0
      ? data.questionHistory.slice(-100).filter(q => q.correct).length / Math.min(100, data.questionHistory.length)
      : 0.7;

    factors.push({
      name: 'Question Accuracy',
      currentValue: recentAccuracy,
      impact: (recentAccuracy - 0.7) * 20,
      confidence: 0.9,
      description: `${Math.round(recentAccuracy * 100)}% accuracy on recent questions`
    });

    // Study time adequacy
    const studyTimePerWeek = data.studyTime / Math.max(1, this.calculateTimeSpan(data) / 7);
    factors.push({
      name: 'Study Intensity',
      currentValue: studyTimePerWeek,
      impact: Math.max(-5, Math.min(5, (studyTimePerWeek - 15) / 5)), // Optimal around 15 hours/week
      confidence: 0.7,
      description: `${Math.round(studyTimePerWeek)} hours per week of study`
    });

    return factors;
  }

  private static calculateScenarios(data: PredictionInputData, baseScore: number): ScorePrediction['scenarios'] {
    return {
      conservative: Math.max(120, Math.round(baseScore - 8)),
      realistic: Math.round(baseScore),
      optimistic: Math.min(180, Math.round(baseScore + 12))
    };
  }

  private static calculateTimeToTarget(
    data: PredictionInputData,
    currentPrediction: number
  ): ScorePrediction['timeToTarget'] | undefined {
    if (!data.targetScore || !data.targetDate) return undefined;

    const pointsNeeded = data.targetScore - currentPrediction;
    const daysToTarget = Math.ceil((data.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (pointsNeeded <= 0) {
      return {
        targetScore: data.targetScore,
        estimatedDays: 0,
        confidence: 0.9,
        requirements: ['Maintain current performance level']
      };
    }

    // Estimate improvement rate (roughly 1 point per 10 hours of effective study)
    const hoursNeeded = pointsNeeded * 10;
    const currentWeeklyHours = data.studyTime / Math.max(1, this.calculateTimeSpan(data) / 7);
    const weeksNeeded = Math.ceil(hoursNeeded / Math.max(5, currentWeeklyHours));

    return {
      targetScore: data.targetScore,
      estimatedDays: weeksNeeded * 7,
      confidence: daysToTarget >= weeksNeeded * 7 ? 0.8 : 0.4,
      requirements: [
        `Maintain ${Math.ceil(hoursNeeded / (daysToTarget / 7))} hours/week study schedule`,
        'Focus on weakest areas identified in analytics',
        'Take regular practice tests to track progress'
      ]
    };
  }

  private static calculateTrendSlope(tests: Array<{ date: Date; score: number }>): number {
    if (tests.length < 2) return 0;

    const sortedTests = [...tests].sort((a, b) => a.date.getTime() - b.date.getTime());
    const n = sortedTests.length;
    const x = sortedTests.map((_, i) => i);
    const y = sortedTests.map(t => t.score);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private static calculateTimeSpan(data: PredictionInputData): number {
    const allDates = [
      ...data.practiceTests.map(t => t.date),
      ...data.questionHistory.map(q => q.date)
    ];

    if (allDates.length === 0) return 30;

    const earliest = Math.min(...allDates.map(d => d.getTime()));
    const latest = Math.max(...allDates.map(d => d.getTime()));

    return Math.max(7, (latest - earliest) / (1000 * 60 * 60 * 24));
  }

  private static calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}

// ============================================================================
// PEER COMPARISON SERVICE (ANONYMIZED)
// ============================================================================

interface UserData {
  scores: number[];
  studyTime: number;
  accuracy: number;
  practiceTests: number;
  targetScore: number;
}

export class PeerComparisonService {
  // Anonymized peer data (would come from database in real implementation)
  private static readonly PEER_DATA = {
    cohortSize: 1247,
    averageScore: 153.2,
    scoreDistribution: { p25: 146, p50: 153, p75: 161, p90: 168 },
    averageStudyTime: 127.5,
    averageAccuracy: 0.732,
    averagePracticeTests: 8.3
  };

  static generatePeerComparison(userData: UserData): PeerComparisonData {
    const userPercentile = this.calculatePercentile(userData.scores);
    const demographics = this.getDemographics(userData);
    const metrics = this.calculatePeerMetrics(userData);
    const { strengths, improvements } = this.identifyRelativePerformance(userData);
    const insights = this.generateAnonymizedInsights(userData);

    return {
      userPercentile,
      cohortSize: this.PEER_DATA.cohortSize,
      demographics,
      metrics,
      strengthsVsPeers: strengths,
      improvementAreas: improvements,
      anonymizedInsights: insights
    };
  }

  private static calculatePercentile(scores: number[]): number {
    if (scores.length === 0) return 50;

    const latestScore = scores[scores.length - 1];

    // Calculate percentile based on score distribution
    if (latestScore >= this.PEER_DATA.scoreDistribution.p90) return 90 + (latestScore - this.PEER_DATA.scoreDistribution.p90) * 2;
    if (latestScore >= this.PEER_DATA.scoreDistribution.p75) return 75 + ((latestScore - this.PEER_DATA.scoreDistribution.p75) / (this.PEER_DATA.scoreDistribution.p90 - this.PEER_DATA.scoreDistribution.p75)) * 15;
    if (latestScore >= this.PEER_DATA.scoreDistribution.p50) return 50 + ((latestScore - this.PEER_DATA.scoreDistribution.p50) / (this.PEER_DATA.scoreDistribution.p75 - this.PEER_DATA.scoreDistribution.p50)) * 25;
    if (latestScore >= this.PEER_DATA.scoreDistribution.p25) return 25 + ((latestScore - this.PEER_DATA.scoreDistribution.p25) / (this.PEER_DATA.scoreDistribution.p50 - this.PEER_DATA.scoreDistribution.p25)) * 25;

    return Math.max(1, (latestScore - 120) / (this.PEER_DATA.scoreDistribution.p25 - 120) * 25);
  }

  private static getDemographics(userData: UserData): PeerComparisonData['demographics'] {
    return {
      studyTimeRange: this.getStudyTimeRange(userData.studyTime),
      targetScoreRange: this.getTargetScoreRange(userData.targetScore),
      studyDuration: this.getStudyDurationRange(userData.practiceTests)
    };
  }

  private static calculatePeerMetrics(userData: UserData): PeerMetric[] {
    const metrics: PeerMetric[] = [];

    // Score comparison
    const userScore = userData.scores.length > 0 ? userData.scores[userData.scores.length - 1] : 145;
    metrics.push({
      category: 'Practice Test Score',
      userValue: userScore,
      peerAverage: this.PEER_DATA.averageScore,
      peerRange: [this.PEER_DATA.scoreDistribution.p25, this.PEER_DATA.scoreDistribution.p75],
      percentile: this.calculatePercentile(userData.scores),
      interpretation: this.getScoreInterpretation(userScore)
    });

    // Study time comparison
    metrics.push({
      category: 'Study Hours',
      userValue: userData.studyTime,
      peerAverage: this.PEER_DATA.averageStudyTime,
      peerRange: [80, 180],
      percentile: Math.min(95, Math.max(5, (userData.studyTime / this.PEER_DATA.averageStudyTime) * 50)),
      interpretation: this.getStudyTimeInterpretation(userData.studyTime)
    });

    // Accuracy comparison
    metrics.push({
      category: 'Question Accuracy',
      userValue: userData.accuracy * 100,
      peerAverage: this.PEER_DATA.averageAccuracy * 100,
      peerRange: [65, 80],
      percentile: Math.min(95, Math.max(5, (userData.accuracy / this.PEER_DATA.averageAccuracy) * 50)),
      interpretation: this.getAccuracyInterpretation(userData.accuracy)
    });

    return metrics;
  }

  private static identifyRelativePerformance(userData: UserData): { strengths: string[]; improvements: string[] } {
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (userData.accuracy > this.PEER_DATA.averageAccuracy * 1.1) {
      strengths.push('Above-average question accuracy');
    } else if (userData.accuracy < this.PEER_DATA.averageAccuracy * 0.9) {
      improvements.push('Question accuracy below peer average');
    }

    if (userData.studyTime > this.PEER_DATA.averageStudyTime * 1.2) {
      strengths.push('High study time commitment');
    } else if (userData.studyTime < this.PEER_DATA.averageStudyTime * 0.8) {
      improvements.push('Consider increasing study time');
    }

    if (userData.practiceTests > this.PEER_DATA.averagePracticeTests * 1.1) {
      strengths.push('Extensive practice test experience');
    } else if (userData.practiceTests < this.PEER_DATA.averagePracticeTests * 0.7) {
      improvements.push('Take more practice tests for better preparation');
    }

    return { strengths, improvements };
  }

  private static generateAnonymizedInsights(userData: UserData): string[] {
    const insights: string[] = [];

    const userPercentile = this.calculatePercentile(userData.scores);

    if (userPercentile >= 75) {
      insights.push('You\'re performing better than 75% of similar test-takers');
      insights.push('Focus on consistency and test-day strategy');
    } else if (userPercentile >= 50) {
      insights.push('Your performance is around the median for your peer group');
      insights.push('Target your weakest question types for maximum improvement');
    } else {
      insights.push('Significant room for improvement compared to peer average');
      insights.push('Consider reviewing fundamental concepts before advanced practice');
    }

    if (userData.studyTime > this.PEER_DATA.averageStudyTime) {
      insights.push('Your study time exceeds the peer average - focus on efficiency');
    }

    return insights;
  }

  private static getStudyTimeRange(studyTime: number): string {
    if (studyTime < 50) return '0-50 hours';
    if (studyTime < 100) return '50-100 hours';
    if (studyTime < 150) return '100-150 hours';
    if (studyTime < 200) return '150-200 hours';
    return '200+ hours';
  }

  private static getTargetScoreRange(targetScore: number): string {
    if (targetScore < 150) return '120-149';
    if (targetScore < 160) return '150-159';
    if (targetScore < 170) return '160-169';
    return '170-180';
  }

  private static getStudyDurationRange(practiceTests: number): string {
    if (practiceTests < 3) return '1-2 months';
    if (practiceTests < 8) return '2-4 months';
    if (practiceTests < 15) return '4-6 months';
    return '6+ months';
  }

  private static getScoreInterpretation(score: number): string {
    if (score >= 170) return 'Exceptional performance';
    if (score >= 160) return 'Strong performance';
    if (score >= 150) return 'Average performance';
    return 'Below average - focus on fundamentals';
  }

  private static getStudyTimeInterpretation(studyTime: number): string {
    if (studyTime > 200) return 'Very high study commitment';
    if (studyTime > 150) return 'Above average study time';
    if (studyTime > 100) return 'Average study commitment';
    return 'Consider increasing study time';
  }

  private static getAccuracyInterpretation(accuracy: number): string {
    if (accuracy > 0.85) return 'Excellent accuracy';
    if (accuracy > 0.75) return 'Good accuracy';
    if (accuracy > 0.65) return 'Average accuracy';
    return 'Focus on improving accuracy';
  }
}

// ============================================================================
// STUDY EFFICIENCY SERVICE
// ============================================================================

interface StudyData {
  sessions: Array<{
    date: Date;
    duration: number; // minutes
    activity: string;
    questionsAnswered: number;
    accuracy: number;
  }>;
  performanceHistory: Array<{
    date: Date;
    score: number;
  }>;
  totalStudyTime: number; // hours
}

export class StudyEfficiencyService {
  static generateStudyEfficiencyMetrics(data: StudyData): StudyEfficiencyMetrics {
    const hoursToPointImprovement = this.calculateHoursToPointImprovement(data);
    const learningVelocity = this.calculateLearningVelocity(data);
    const retentionRate = this.calculateRetentionRate(data);
    const efficiency = this.calculateEfficiencyMetrics(data);
    const recommendations = this.generateEfficiencyRecommendations(data);
    const burnoutRisk = this.assessBurnoutRisk(data);

    return {
      hoursToPointImprovement,
      learningVelocity,
      retentionRate,
      efficiency,
      recommendations,
      burnoutRisk
    };
  }

  private static calculateHoursToPointImprovement(data: StudyData): number {
    if (data.performanceHistory.length < 2) return 10; // Default estimate

    const sortedScores = [...data.performanceHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
    const scoreImprovement = sortedScores[sortedScores.length - 1].score - sortedScores[0].score;

    return scoreImprovement > 0 ? Math.max(1, data.totalStudyTime / scoreImprovement) : 15;
  }

  private static calculateLearningVelocity(data: StudyData): number {
    if (data.performanceHistory.length < 2) return 0;

    const sortedScores = [...data.performanceHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
    const timeSpanWeeks = (sortedScores[sortedScores.length - 1].date.getTime() - sortedScores[0].date.getTime()) / (1000 * 60 * 60 * 24 * 7);
    const scoreImprovement = sortedScores[sortedScores.length - 1].score - sortedScores[0].score;

    return timeSpanWeeks > 0 ? Math.max(0, scoreImprovement / timeSpanWeeks) : 0;
  }

  private static calculateRetentionRate(data: StudyData): number {
    // Simplified retention calculation based on session consistency
    if (data.sessions.length < 5) return 70; // Default estimate

    const last30Days = data.sessions.filter(s =>
      s.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const consistencyScore = last30Days.length >= 10 ? 90 : last30Days.length >= 5 ? 75 : 60;

    // Factor in accuracy trends
    const avgAccuracy = last30Days.reduce((sum, s) => sum + s.accuracy, 0) / last30Days.length;
    const retentionBonus = (avgAccuracy - 0.7) * 50; // Bonus for high accuracy

    return Math.max(30, Math.min(95, consistencyScore + retentionBonus));
  }

  private static calculateEfficiencyMetrics(data: StudyData): StudyEfficiencyMetrics['efficiency'] {
    const byActivity = this.calculateActivityEfficiency(data);
    const overall = byActivity.reduce((sum, activity) => sum + activity.efficiency, 0) / byActivity.length;
    const trends = this.calculateEfficiencyTrends(data);

    return {
      overall: Math.round(overall),
      byActivity,
      trends
    };
  }

  private static calculateActivityEfficiency(data: StudyData): ActivityEfficiency[] {
    const activityGroups = new Map<string, { time: number; improvement: number }>();

    // Group sessions by activity
    data.sessions.forEach(session => {
      if (!activityGroups.has(session.activity)) {
        activityGroups.set(session.activity, { time: 0, improvement: 0 });
      }

      const group = activityGroups.get(session.activity)!;
      group.time += session.duration / 60; // Convert to hours

      // Estimate improvement from accuracy and session quality
      const sessionImpact = session.accuracy * (session.questionsAnswered / 20) * 0.1; // Rough estimate
      group.improvement += sessionImpact;
    });

    return Array.from(activityGroups.entries()).map(([activity, stats]) => ({
      activity,
      timeSpent: Math.round(stats.time),
      improvement: Math.round(stats.improvement * 10) / 10,
      efficiency: stats.time > 0 ? Math.round((stats.improvement / stats.time) * 100) / 100 : 0,
      recommendation: this.getActivityRecommendation(activity, stats.efficiency / stats.time)
    }));
  }

  private static calculateEfficiencyTrends(data: StudyData): any[] {
    // Weekly efficiency trends
    const weeklyData = new Map<string, { time: number; sessions: number }>();

    data.sessions.forEach(session => {
      const weekStart = new Date(session.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { time: 0, sessions: 0 });
      }

      const week = weeklyData.get(weekKey)!;
      week.time += session.duration / 60;
      week.sessions += 1;
    });

    return Array.from(weeklyData.entries()).map(([week, stats]) => ({
      date: new Date(week),
      value: stats.time > 0 ? Math.round((stats.sessions / stats.time) * 10) / 10 : 0,
      label: `Week of ${new Date(week).toLocaleDateString()}`
    })).slice(-12);
  }

  private static generateEfficiencyRecommendations(data: StudyData): EfficiencyRecommendation[] {
    const recommendations: EfficiencyRecommendation[] = [];

    // Analyze session patterns
    const avgSessionDuration = data.sessions.reduce((sum, s) => sum + s.duration, 0) / data.sessions.length;

    if (avgSessionDuration < 30) {
      recommendations.push({
        type: 'intensity_change',
        priority: 'medium',
        description: 'Consider longer study sessions for better knowledge retention',
        expectedBenefit: 'Improved concept understanding and retention',
        implementation: ['Aim for 45-60 minute focused study blocks', 'Take 5-10 minute breaks between blocks']
      });
    }

    if (avgSessionDuration > 120) {
      recommendations.push({
        type: 'intensity_change',
        priority: 'medium',
        description: 'Very long sessions may lead to diminishing returns',
        expectedBenefit: 'Better focus and retention per hour studied',
        implementation: ['Break long sessions into 60-90 minute blocks', 'Include active breaks and review']
      });
    }

    // Check for activity balance
    const activityTypes = new Set(data.sessions.map(s => s.activity));
    if (activityTypes.size < 3) {
      recommendations.push({
        type: 'method_change',
        priority: 'medium',
        description: 'Diversify study activities for more comprehensive preparation',
        expectedBenefit: 'Better skill development across all test areas',
        implementation: ['Include practice tests, question drills, and concept review', 'Rotate between different section types']
      });
    }

    return recommendations;
  }

  private static assessBurnoutRisk(data: StudyData): StudyEfficiencyMetrics['burnoutRisk'] {
    const recentSessions = data.sessions.filter(s =>
      s.date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    );

    const riskFactors: string[] = [];
    let level: 'low' | 'medium' | 'high' = 'low';

    // High volume without breaks
    const avgDailyHours = recentSessions.reduce((sum, s) => sum + s.duration, 0) / (60 * 14);
    if (avgDailyHours > 4) {
      riskFactors.push('High daily study volume');
      level = 'medium';
    }

    // Declining accuracy
    const firstWeek = recentSessions.filter(s => s.date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const secondWeek = recentSessions.filter(s => s.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    if (firstWeek.length > 0 && secondWeek.length > 0) {
      const firstWeekAccuracy = firstWeek.reduce((sum, s) => sum + s.accuracy, 0) / firstWeek.length;
      const secondWeekAccuracy = secondWeek.reduce((sum, s) => sum + s.accuracy, 0) / secondWeek.length;

      if (secondWeekAccuracy < firstWeekAccuracy - 0.05) {
        riskFactors.push('Declining performance accuracy');
        level = level === 'medium' ? 'high' : 'medium';
      }
    }

    const suggestions = [
      'Schedule regular rest days',
      'Vary study activities to maintain engagement',
      'Monitor performance trends for early warning signs',
      'Consider shorter, more focused study sessions'
    ];

    return { level, factors: riskFactors, suggestions };
  }

  private static getActivityRecommendation(activity: string, efficiency: number): string {
    if (efficiency > 0.5) return `${activity} is highly efficient - continue current approach`;
    if (efficiency > 0.2) return `${activity} shows moderate efficiency - consider optimization strategies`;
    return `${activity} may need significant improvement or replacement`;
  }
}