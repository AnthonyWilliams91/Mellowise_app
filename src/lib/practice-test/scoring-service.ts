/**
 * LSAT Scoring Service
 * Official LSAT scoring algorithm (120-180 scale) with percentile calculation
 */

import {
  TestScore,
  SectionScore,
  ScoreRange,
  QuestionResponse,
  PracticeTestSession,
  LSATSection
} from '@/types/practice-test';

export class LSATScoringService {
  // Official LSAT Raw Score to Scaled Score Conversion Table
  // Based on typical LSAT scoring curves (varies slightly by test)
  private static readonly SCORE_CONVERSION_TABLE: Array<{
    rawScore: number;
    scaledScore: number;
    percentile: number;
  }> = [
    { rawScore: 101, scaledScore: 180, percentile: 99.9 },
    { rawScore: 100, scaledScore: 180, percentile: 99.9 },
    { rawScore: 99, scaledScore: 179, percentile: 99.8 },
    { rawScore: 98, scaledScore: 178, percentile: 99.7 },
    { rawScore: 97, scaledScore: 177, percentile: 99.6 },
    { rawScore: 96, scaledScore: 176, percentile: 99.4 },
    { rawScore: 95, scaledScore: 175, percentile: 99.2 },
    { rawScore: 94, scaledScore: 174, percentile: 98.9 },
    { rawScore: 93, scaledScore: 173, percentile: 98.6 },
    { rawScore: 92, scaledScore: 172, percentile: 98.2 },
    { rawScore: 91, scaledScore: 171, percentile: 97.8 },
    { rawScore: 90, scaledScore: 170, percentile: 97.3 },
    { rawScore: 89, scaledScore: 169, percentile: 96.7 },
    { rawScore: 88, scaledScore: 168, percentile: 96.0 },
    { rawScore: 87, scaledScore: 167, percentile: 95.2 },
    { rawScore: 86, scaledScore: 166, percentile: 94.3 },
    { rawScore: 85, scaledScore: 165, percentile: 93.3 },
    { rawScore: 84, scaledScore: 164, percentile: 92.2 },
    { rawScore: 83, scaledScore: 163, percentile: 90.9 },
    { rawScore: 82, scaledScore: 162, percentile: 89.6 },
    { rawScore: 81, scaledScore: 161, percentile: 88.1 },
    { rawScore: 80, scaledScore: 160, percentile: 86.5 },
    { rawScore: 79, scaledScore: 159, percentile: 84.7 },
    { rawScore: 78, scaledScore: 158, percentile: 82.8 },
    { rawScore: 77, scaledScore: 157, percentile: 80.7 },
    { rawScore: 76, scaledScore: 156, percentile: 78.5 },
    { rawScore: 75, scaledScore: 155, percentile: 76.1 },
    { rawScore: 74, scaledScore: 154, percentile: 73.6 },
    { rawScore: 73, scaledScore: 153, percentile: 70.9 },
    { rawScore: 72, scaledScore: 152, percentile: 68.1 },
    { rawScore: 71, scaledScore: 151, percentile: 65.2 },
    { rawScore: 70, scaledScore: 150, percentile: 62.1 },
    { rawScore: 69, scaledScore: 149, percentile: 58.9 },
    { rawScore: 68, scaledScore: 148, percentile: 55.6 },
    { rawScore: 67, scaledScore: 147, percentile: 52.2 },
    { rawScore: 66, scaledScore: 146, percentile: 48.7 },
    { rawScore: 65, scaledScore: 145, percentile: 45.1 },
    { rawScore: 64, scaledScore: 144, percentile: 41.5 },
    { rawScore: 63, scaledScore: 143, percentile: 37.9 },
    { rawScore: 62, scaledScore: 142, percentile: 34.4 },
    { rawScore: 61, scaledScore: 141, percentile: 31.0 },
    { rawScore: 60, scaledScore: 140, percentile: 27.7 },
    { rawScore: 59, scaledScore: 139, percentile: 24.6 },
    { rawScore: 58, scaledScore: 138, percentile: 21.7 },
    { rawScore: 57, scaledScore: 137, percentile: 19.0 },
    { rawScore: 56, scaledScore: 136, percentile: 16.5 },
    { rawScore: 55, scaledScore: 135, percentile: 14.3 },
    { rawScore: 54, scaledScore: 134, percentile: 12.3 },
    { rawScore: 53, scaledScore: 133, percentile: 10.5 },
    { rawScore: 52, scaledScore: 132, percentile: 8.9 },
    { rawScore: 51, scaledScore: 131, percentile: 7.5 },
    { rawScore: 50, scaledScore: 130, percentile: 6.3 },
    { rawScore: 49, scaledScore: 129, percentile: 5.3 },
    { rawScore: 48, scaledScore: 128, percentile: 4.4 },
    { rawScore: 47, scaledScore: 127, percentile: 3.7 },
    { rawScore: 46, scaledScore: 126, percentile: 3.1 },
    { rawScore: 45, scaledScore: 125, percentile: 2.6 },
    { rawScore: 44, scaledScore: 124, percentile: 2.1 },
    { rawScore: 43, scaledScore: 123, percentile: 1.8 },
    { rawScore: 42, scaledScore: 122, percentile: 1.4 },
    { rawScore: 41, scaledScore: 121, percentile: 1.2 },
    { rawScore: 40, scaledScore: 120, percentile: 1.0 },
    { rawScore: 39, scaledScore: 120, percentile: 0.8 },
    { rawScore: 38, scaledScore: 120, percentile: 0.6 },
    { rawScore: 37, scaledScore: 120, percentile: 0.5 },
    { rawScore: 36, scaledScore: 120, percentile: 0.4 },
    { rawScore: 35, scaledScore: 120, percentile: 0.3 }
  ];

  // Section type configurations for scoring
  private static readonly SECTION_CONFIGS = {
    logical_reasoning: {
      totalQuestions: 25,
      weight: 0.5 // Two LR sections = 50% of total score
    },
    reading_comprehension: {
      totalQuestions: 27,
      weight: 0.5 // One RC section = 50% of total score
    }
  };

  /**
   * Calculate complete test score from session data
   */
  static calculateScore(session: PracticeTestSession): TestScore {
    const sectionScores = this.calculateSectionScores(session);
    const rawScore = this.calculateRawScore(sectionScores);
    const { scaledScore, percentile } = this.convertRawToScaledScore(rawScore);
    const scoreRange = this.calculateScoreRange(rawScore, session.responses.length);

    const totalQuestionsAttempted = session.responses.filter(r => r.selectedAnswer !== null).length;
    const totalQuestionsCorrect = sectionScores.reduce((sum, s) => sum + s.questionsCorrect, 0);
    const totalTestTime = this.calculateTotalTestTime(session);

    return {
      testId: session.id,
      scaledScore,
      rawScore,
      percentile,
      scoreRange,
      sectionScores: sectionScores.filter(s => !s.isExperimental), // Exclude experimental from main score
      totalQuestionsAttempted,
      totalQuestionsCorrect,
      totalTestTime,
      scoringDate: new Date()
    };
  }

  /**
   * Calculate scores for each section
   */
  private static calculateSectionScores(session: PracticeTestSession): SectionScore[] {
    return session.config.sections.map(section => {
      const sectionResponses = session.responses.filter(r => r.sectionId === section.id);
      const questionsAttempted = sectionResponses.filter(r => r.selectedAnswer !== null).length;

      const questionsCorrect = sectionResponses.filter(r => {
        const question = section.questions.find(q => q.id === r.questionId);
        return question && r.selectedAnswer === question.correctAnswer;
      }).length;

      const rawScore = questionsCorrect;
      const percentageCorrect = questionsAttempted > 0 ? (questionsCorrect / questionsAttempted) * 100 : 0;

      const averageTimePerQuestion = sectionResponses.length > 0
        ? sectionResponses.reduce((sum, r) => sum + r.timeSpentSeconds, 0) / sectionResponses.length
        : 0;

      return {
        sectionId: section.id,
        sectionType: section.type,
        isExperimental: section.isExperimental,
        questionsAttempted,
        questionsCorrect,
        rawScore,
        percentageCorrect,
        averageTimePerQuestion
      };
    });
  }

  /**
   * Calculate total raw score (excluding experimental section)
   */
  private static calculateRawScore(sectionScores: SectionScore[]): number {
    return sectionScores
      .filter(s => !s.isExperimental)
      .reduce((sum, s) => sum + s.questionsCorrect, 0);
  }

  /**
   * Convert raw score to scaled score (120-180) and percentile
   */
  private static convertRawToScaledScore(rawScore: number): { scaledScore: number; percentile: number } {
    // Find the closest match in the conversion table
    const entry = this.SCORE_CONVERSION_TABLE.find(e => rawScore >= e.rawScore) ||
                  this.SCORE_CONVERSION_TABLE[this.SCORE_CONVERSION_TABLE.length - 1];

    return {
      scaledScore: entry.scaledScore,
      percentile: entry.percentile
    };
  }

  /**
   * Calculate score range with confidence interval
   */
  private static calculateScoreRange(rawScore: number, totalResponses: number): ScoreRange {
    // Calculate confidence based on completion rate and question difficulty variance
    const completionRate = Math.min(1, totalResponses / 77); // 77 total scored questions
    const baseConfidence = 0.85;
    const confidence = baseConfidence * completionRate;

    // Calculate margin of error based on statistical uncertainty
    const marginOfError = Math.max(2, Math.round(4 * (1 - completionRate)));

    const { scaledScore: baseScore } = this.convertRawToScaledScore(rawScore);
    const { scaledScore: minScore } = this.convertRawToScaledScore(Math.max(0, rawScore - marginOfError));
    const { scaledScore: maxScore } = this.convertRawToScaledScore(Math.min(101, rawScore + marginOfError));

    return {
      min: minScore,
      max: maxScore,
      confidence
    };
  }

  /**
   * Calculate total test time (excluding breaks)
   */
  private static calculateTotalTestTime(session: PracticeTestSession): number {
    return session.timer.totalTestTime - session.timer.totalBreakTime;
  }

  /**
   * Calculate performance metrics for score analysis
   */
  static calculatePerformanceMetrics(
    sectionScores: SectionScore[],
    responses: QuestionResponse[]
  ): {
    accuracyBySection: { [sectionType: string]: number };
    speedBySection: { [sectionType: string]: number };
    consistencyScore: number;
    difficultyPerformance: { easy: number; medium: number; hard: number };
  } {
    // Accuracy by section type
    const accuracyBySection: { [sectionType: string]: number } = {};
    sectionScores.forEach(section => {
      if (!section.isExperimental) {
        accuracyBySection[section.sectionType] = section.percentageCorrect;
      }
    });

    // Speed by section type (questions per minute)
    const speedBySection: { [sectionType: string]: number } = {};
    sectionScores.forEach(section => {
      if (!section.isExperimental && section.averageTimePerQuestion > 0) {
        speedBySection[section.sectionType] = 60 / section.averageTimePerQuestion; // Questions per minute
      }
    });

    // Consistency score (standard deviation of section accuracies)
    const accuracies = Object.values(accuracyBySection);
    const meanAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - meanAccuracy, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev * 2)); // Higher consistency = lower std dev

    // Performance by difficulty (would need question difficulty data)
    const difficultyPerformance = {
      easy: 0,   // Would calculate from actual question difficulty
      medium: 0, // This is a placeholder - needs question difficulty integration
      hard: 0
    };

    return {
      accuracyBySection,
      speedBySection,
      consistencyScore,
      difficultyPerformance
    };
  }

  /**
   * Calculate improvement recommendations based on score
   */
  static generateScoreRecommendations(score: TestScore): {
    targetScore: number;
    pointsNeeded: number;
    questionsToImprove: number;
    focusAreas: string[];
    studyTimeEstimate: number; // hours per week
  } {
    const currentScore = score.scaledScore;

    // Determine reasonable target score (5-15 points above current)
    const targetScore = Math.min(180, currentScore + Math.max(5, Math.min(15, Math.floor((180 - currentScore) * 0.3))));
    const pointsNeeded = targetScore - currentScore;

    // Estimate questions to improve (rough approximation)
    const questionsToImprove = Math.ceil(pointsNeeded * 1.5); // Approximately 1.5 questions per point

    // Identify focus areas based on section performance
    const focusAreas: string[] = [];
    score.sectionScores.forEach(section => {
      if (section.percentageCorrect < 70) {
        focusAreas.push(section.sectionType.replace('_', ' '));
      }
    });

    // Estimate study time based on points needed
    const studyTimeEstimate = Math.max(10, pointsNeeded * 2); // 2 hours per point needed per week

    return {
      targetScore,
      pointsNeeded,
      questionsToImprove,
      focusAreas,
      studyTimeEstimate
    };
  }

  /**
   * Compare score to historical average
   */
  static compareToAverage(score: TestScore): {
    scoreDifference: number;
    percentileDifference: number;
    performanceLevel: 'below_average' | 'average' | 'above_average' | 'exceptional';
  } {
    const averageScore = 150; // Historical LSAT average
    const averagePercentile = 50;

    const scoreDifference = score.scaledScore - averageScore;
    const percentileDifference = score.percentile - averagePercentile;

    let performanceLevel: 'below_average' | 'average' | 'above_average' | 'exceptional';
    if (score.percentile >= 90) {
      performanceLevel = 'exceptional';
    } else if (score.percentile >= 60) {
      performanceLevel = 'above_average';
    } else if (score.percentile >= 40) {
      performanceLevel = 'average';
    } else {
      performanceLevel = 'below_average';
    }

    return {
      scoreDifference,
      percentileDifference,
      performanceLevel
    };
  }

  /**
   * Validate score calculation
   */
  static validateScore(score: TestScore): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check scaled score range
    if (score.scaledScore < 120 || score.scaledScore > 180) {
      errors.push('Scaled score must be between 120-180');
    }

    // Check raw score consistency
    const expectedRawScore = score.sectionScores
      .filter(s => !s.isExperimental)
      .reduce((sum, s) => sum + s.questionsCorrect, 0);

    if (score.rawScore !== expectedRawScore) {
      errors.push('Raw score does not match section totals');
    }

    // Check percentile range
    if (score.percentile < 0 || score.percentile > 100) {
      errors.push('Percentile must be between 0-100');
    }

    // Check score range consistency
    if (score.scoreRange.min > score.scaledScore || score.scoreRange.max < score.scaledScore) {
      errors.push('Score falls outside calculated score range');
    }

    // Check section score totals
    score.sectionScores.forEach((section, index) => {
      if (section.questionsCorrect > section.questionsAttempted) {
        errors.push(`Section ${index}: More correct answers than attempted`);
      }

      if (section.percentageCorrect < 0 || section.percentageCorrect > 100) {
        errors.push(`Section ${index}: Invalid percentage correct`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate score trend from multiple test scores
   */
  static calculateScoreTrend(scores: TestScore[]): {
    trend: 'improving' | 'declining' | 'stable';
    averageImprovement: number;
    consistency: number;
    recentBest: number;
    projectedScore: number;
  } {
    if (scores.length < 2) {
      return {
        trend: 'stable',
        averageImprovement: 0,
        consistency: 100,
        recentBest: scores[0]?.scaledScore || 0,
        projectedScore: scores[0]?.scaledScore || 0
      };
    }

    // Sort by date
    const sortedScores = [...scores].sort((a, b) => a.scoringDate.getTime() - b.scoringDate.getTime());
    const recentBest = Math.max(...scores.map(s => s.scaledScore));

    // Calculate improvement per test
    const improvements: number[] = [];
    for (let i = 1; i < sortedScores.length; i++) {
      improvements.push(sortedScores[i].scaledScore - sortedScores[i - 1].scaledScore);
    }

    const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;

    // Determine trend
    let trend: 'improving' | 'declining' | 'stable';
    if (averageImprovement > 1) {
      trend = 'improving';
    } else if (averageImprovement < -1) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    // Calculate consistency (inverse of standard deviation)
    const allScores = scores.map(s => s.scaledScore);
    const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (stdDev * 5)); // Scale to 0-100

    // Project next score based on trend
    const latestScore = sortedScores[sortedScores.length - 1].scaledScore;
    const projectedScore = Math.max(120, Math.min(180, Math.round(latestScore + averageImprovement)));

    return {
      trend,
      averageImprovement,
      consistency,
      recentBest,
      projectedScore
    };
  }
}