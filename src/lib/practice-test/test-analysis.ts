/**
 * Practice Test Analysis Service
 * Comprehensive post-test analysis with detailed breakdowns and recommendations
 */

import {
  TestAnalysis,
  SectionAnalysis,
  QuestionAnalysis,
  TestScore,
  PracticeTestSession,
  QuestionResponse
} from '@/types/practice-test';
import { LSATScoringService } from './scoring-service';

export class PracticeTestAnalysisService {
  /**
   * Generate comprehensive test analysis
   */
  static generateAnalysis(session: PracticeTestSession, score: TestScore): TestAnalysis {
    const sectionAnalyses = this.generateSectionAnalyses(session, score);
    const overallPerformance = this.calculateOverallPerformance(sectionAnalyses, session);
    const strengthsAndWeaknesses = this.identifyStrengthsAndWeaknesses(sectionAnalyses);
    const comparisonToAverage = LSATScoringService.compareToAverage(score);
    const studyRecommendations = this.generateStudyRecommendations(sectionAnalyses, score);

    return {
      testId: session.id,
      overallPerformance,
      sectionAnalyses,
      strengthsAndWeaknesses,
      comparisonToAverage: {
        scoreDifference: comparisonToAverage.scoreDifference,
        percentileDifference: comparisonToAverage.percentileDifference,
        timeCompared: this.calculateTimeComparison(session)
      },
      studyRecommendations,
      nextSteps: this.generateNextSteps(strengthsAndWeaknesses, score)
    };
  }

  /**
   * Generate analysis for each section
   */
  private static generateSectionAnalyses(
    session: PracticeTestSession,
    score: TestScore
  ): SectionAnalysis[] {
    return session.config.sections
      .filter(section => !section.isExperimental) // Only analyze scored sections
      .map(section => {
        const sectionScore = score.sectionScores.find(s => s.sectionId === section.id)!;
        const sectionResponses = session.responses.filter(r => r.sectionId === section.id);
        const questionAnalyses = this.analyzeQuestions(section.questions, sectionResponses);

        const topicPerformance = this.calculateTopicPerformance(questionAnalyses);
        const timeManagement = this.calculateTimeManagementScore(questionAnalyses, section.timeAllowedMinutes);

        return {
          sectionId: section.id,
          sectionType: section.type,
          isExperimental: false,
          overallAccuracy: sectionScore.percentageCorrect / 100,
          averageTimePerQuestion: sectionScore.averageTimePerQuestion,
          timeManagementScore: timeManagement,
          strongTopics: topicPerformance.strong,
          weakTopics: topicPerformance.weak,
          questionAnalysis: questionAnalyses,
          recommendations: this.generateSectionRecommendations(questionAnalyses, sectionScore)
        };
      });
  }

  /**
   * Analyze individual questions
   */
  private static analyzeQuestions(
    questions: any[],
    responses: QuestionResponse[]
  ): QuestionAnalysis[] {
    return questions.map(question => {
      const response = responses.find(r => r.questionId === question.id);
      const isCorrect = response?.selectedAnswer === question.correctAnswer;
      const timeSpent = response?.timeSpentSeconds || 0;
      const wasGuessed = timeSpent < 30; // Less than 30 seconds = likely guess

      let errorPattern: string | undefined;
      if (!isCorrect && response?.selectedAnswer) {
        errorPattern = this.identifyErrorPattern(question, response.selectedAnswer);
      }

      return {
        questionId: question.id,
        isCorrect: isCorrect || false,
        timeSpent,
        difficulty: question.difficulty,
        topic: question.topic || 'unknown',
        questionType: question.type,
        wasGuessed,
        errorPattern
      };
    });
  }

  /**
   * Calculate topic performance
   */
  private static calculateTopicPerformance(
    questionAnalyses: QuestionAnalysis[]
  ): { strong: string[]; weak: string[] } {
    const topicStats: { [topic: string]: { correct: number; total: number; accuracy: number } } = {};

    // Calculate accuracy by topic
    questionAnalyses.forEach(q => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0, accuracy: 0 };
      }
      topicStats[q.topic].total++;
      if (q.isCorrect) {
        topicStats[q.topic].correct++;
      }
    });

    // Calculate accuracies
    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic];
      stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
    });

    // Filter topics with sufficient data (at least 3 questions)
    const reliableTopics = Object.keys(topicStats).filter(topic => topicStats[topic].total >= 3);

    const strong = reliableTopics
      .filter(topic => topicStats[topic].accuracy >= 0.75)
      .sort((a, b) => topicStats[b].accuracy - topicStats[a].accuracy);

    const weak = reliableTopics
      .filter(topic => topicStats[topic].accuracy < 0.60)
      .sort((a, b) => topicStats[a].accuracy - topicStats[b].accuracy);

    return { strong, weak };
  }

  /**
   * Calculate time management score
   */
  private static calculateTimeManagementScore(
    questionAnalyses: QuestionAnalysis[],
    timeAllowedMinutes: number
  ): number {
    const totalTimeAvailable = timeAllowedMinutes * 60;
    const totalTimeUsed = questionAnalyses.reduce((sum, q) => sum + q.timeSpent, 0);
    const averageTimePerQuestion = totalTimeUsed / questionAnalyses.length;
    const optimalTimePerQuestion = totalTimeAvailable / questionAnalyses.length;

    // Calculate efficiency: closer to optimal = better score
    const efficiency = Math.min(1, optimalTimePerQuestion / averageTimePerQuestion);

    // Check for extreme time issues
    const tooFastQuestions = questionAnalyses.filter(q => q.timeSpent < 30).length;
    const tooSlowQuestions = questionAnalyses.filter(q => q.timeSpent > optimalTimePerQuestion * 2).length;

    const timeVarianceScore = Math.max(0, 100 - (tooFastQuestions + tooSlowQuestions) * 5);

    return Math.round((efficiency * 50) + (timeVarianceScore * 0.5));
  }

  /**
   * Identify error patterns from incorrect answers
   */
  private static identifyErrorPattern(question: any, selectedAnswer: string): string {
    // This would be more sophisticated with actual answer choice analysis
    const errorPatterns = [
      'opposite_answer', // Selected the opposite of correct answer
      'extreme_answer', // Selected an answer that was too strong/absolute
      'detail_confusion', // Confused details from different parts of passage
      'scope_error', // Answer was too broad or too narrow
      'assumption_error', // Made an unwarranted assumption
      'time_pressure', // Likely rushed due to time constraints
      'distractor_trap', // Fell for a common wrong answer trap
      'reading_error' // Misread the question or passage
    ];

    // Simple pattern detection based on question type
    if (question.type?.includes('strengthen') || question.type?.includes('weaken')) {
      return 'opposite_answer';
    } else if (question.type?.includes('inference') || question.type?.includes('assumption')) {
      return 'assumption_error';
    } else if (question.type?.includes('detail')) {
      return 'detail_confusion';
    } else {
      return 'distractor_trap';
    }
  }

  /**
   * Calculate overall performance metrics
   */
  private static calculateOverallPerformance(
    sectionAnalyses: SectionAnalysis[],
    session: PracticeTestSession
  ): {
    accuracy: number;
    timeManagement: number;
    consistency: number;
    endurance: number;
  } {
    const accuracies = sectionAnalyses.map(s => s.overallAccuracy);
    const timeScores = sectionAnalyses.map(s => s.timeManagementScore);

    const accuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const timeManagement = timeScores.reduce((sum, score) => sum + score, 0) / timeScores.length;

    // Consistency: inverse of standard deviation of section accuracies
    const meanAccuracy = accuracy;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - meanAccuracy, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (stdDev * 200)); // Scale to 0-100

    // Endurance: performance decline over time
    const endurance = this.calculateEnduranceScore(sectionAnalyses);

    return {
      accuracy: Math.round(accuracy * 100),
      timeManagement: Math.round(timeManagement),
      consistency: Math.round(consistency),
      endurance: Math.round(endurance)
    };
  }

  /**
   * Calculate endurance score (performance stability over test duration)
   */
  private static calculateEnduranceScore(sectionAnalyses: SectionAnalysis[]): number {
    if (sectionAnalyses.length < 2) return 100;

    // Compare first half vs second half performance
    const midpoint = Math.floor(sectionAnalyses.length / 2);
    const firstHalf = sectionAnalyses.slice(0, midpoint);
    const secondHalf = sectionAnalyses.slice(midpoint);

    const firstHalfAccuracy = firstHalf.reduce((sum, s) => sum + s.overallAccuracy, 0) / firstHalf.length;
    const secondHalfAccuracy = secondHalf.reduce((sum, s) => sum + s.overallAccuracy, 0) / secondHalf.length;

    const performanceChange = secondHalfAccuracy - firstHalfAccuracy;

    // Score: 100 if no decline, lower if significant decline
    if (performanceChange >= 0) {
      return 100; // Improved or maintained performance
    } else {
      const declinePercentage = Math.abs(performanceChange) * 100;
      return Math.max(50, 100 - (declinePercentage * 2)); // Cap minimum at 50
    }
  }

  /**
   * Identify strengths and weaknesses
   */
  private static identifyStrengthsAndWeaknesses(
    sectionAnalyses: SectionAnalysis[]
  ): {
    strengths: string[];
    weaknesses: string[];
    priorityAreas: string[];
  } {
    const allStrengths = sectionAnalyses.flatMap(s => s.strongTopics);
    const allWeaknesses = sectionAnalyses.flatMap(s => s.weakTopics);

    // Count frequency of strengths and weaknesses
    const strengthCounts: { [topic: string]: number } = {};
    const weaknessCounts: { [topic: string]: number } = {};

    allStrengths.forEach(topic => {
      strengthCounts[topic] = (strengthCounts[topic] || 0) + 1;
    });

    allWeaknesses.forEach(topic => {
      weaknessCounts[topic] = (weaknessCounts[topic] || 0) + 1;
    });

    // Get top strengths and weaknesses
    const strengths = Object.keys(strengthCounts)
      .sort((a, b) => strengthCounts[b] - strengthCounts[a])
      .slice(0, 5);

    const weaknesses = Object.keys(weaknessCounts)
      .sort((a, b) => weaknessCounts[b] - weaknessCounts[a])
      .slice(0, 5);

    // Priority areas: weaknesses that appear across multiple sections
    const priorityAreas = Object.keys(weaknessCounts)
      .filter(topic => weaknessCounts[topic] >= 2)
      .sort((a, b) => weaknessCounts[b] - weaknessCounts[a])
      .slice(0, 3);

    return { strengths, weaknesses, priorityAreas };
  }

  /**
   * Generate section-specific recommendations
   */
  private static generateSectionRecommendations(
    questionAnalyses: QuestionAnalysis[],
    sectionScore: any
  ): string[] {
    const recommendations: string[] = [];

    // Accuracy-based recommendations
    if (sectionScore.percentageCorrect < 60) {
      recommendations.push('Focus on foundational concepts before attempting timed practice');
    } else if (sectionScore.percentageCorrect < 75) {
      recommendations.push('Review incorrect answers to identify recurring mistake patterns');
    }

    // Time-based recommendations
    const avgTime = sectionScore.averageTimePerQuestion;
    if (avgTime > 90) { // More than 1.5 minutes per question
      recommendations.push('Practice timed drills to improve reading and processing speed');
    } else if (avgTime < 60) { // Less than 1 minute per question
      recommendations.push('Slow down and read more carefully - accuracy over speed');
    }

    // Pattern-based recommendations
    const guessedQuestions = questionAnalyses.filter(q => q.wasGuessed).length;
    if (guessedQuestions > questionAnalyses.length * 0.2) {
      recommendations.push('Develop better time management to avoid excessive guessing');
    }

    const hardQuestions = questionAnalyses.filter(q => q.difficulty >= 7);
    const hardAccuracy = hardQuestions.length > 0
      ? hardQuestions.filter(q => q.isCorrect).length / hardQuestions.length
      : 0;

    if (hardAccuracy < 0.4 && hardQuestions.length >= 3) {
      recommendations.push('Skip difficult questions initially and return to them if time permits');
    }

    return recommendations;
  }

  /**
   * Generate comprehensive study recommendations
   */
  private static generateStudyRecommendations(
    sectionAnalyses: SectionAnalysis[],
    score: TestScore
  ): {
    focusAreas: string[];
    practiceTypes: string[];
    timeAllocation: { [topic: string]: number };
    targetScore: number;
  } {
    const scoreRecommendations = LSATScoringService.generateScoreRecommendations(score);

    // Focus areas from weakest performance
    const focusAreas: string[] = [];
    sectionAnalyses.forEach(section => {
      if (section.overallAccuracy < 0.7) {
        focusAreas.push(`${section.sectionType.replace('_', ' ')} accuracy improvement`);
      }
      if (section.timeManagementScore < 70) {
        focusAreas.push(`${section.sectionType.replace('_', ' ')} timing practice`);
      }
    });

    // Add weak topics
    const allWeakTopics = sectionAnalyses.flatMap(s => s.weakTopics);
    focusAreas.push(...allWeakTopics.slice(0, 3));

    // Practice type recommendations
    const practiceTypes: string[] = [];

    if (score.scaledScore < 150) {
      practiceTypes.push('Untimed accuracy drills', 'Concept review sessions', 'Basic strategy practice');
    } else if (score.scaledScore < 160) {
      practiceTypes.push('Timed section practice', 'Advanced strategy drills', 'Weakness-focused practice');
    } else {
      practiceTypes.push('Full-length practice tests', 'Difficult question practice', 'Endurance training');
    }

    // Time allocation based on weaknesses
    const timeAllocation: { [topic: string]: number } = {};
    const totalWeeklyHours = scoreRecommendations.studyTimeEstimate;

    sectionAnalyses.forEach(section => {
      const sectionWeight = section.overallAccuracy < 0.7 ? 0.4 : 0.3;
      timeAllocation[section.sectionType] = Math.round(totalWeeklyHours * sectionWeight);
    });

    // Allocate remaining time to review and practice tests
    const allocatedHours = Object.values(timeAllocation).reduce((sum, hours) => sum + hours, 0);
    const remainingHours = totalWeeklyHours - allocatedHours;
    if (remainingHours > 0) {
      timeAllocation['review_and_practice_tests'] = remainingHours;
    }

    return {
      focusAreas: focusAreas.slice(0, 5), // Limit to top 5
      practiceTypes,
      timeAllocation,
      targetScore: scoreRecommendations.targetScore
    };
  }

  /**
   * Generate next steps based on analysis
   */
  private static generateNextSteps(
    strengthsAndWeaknesses: { strengths: string[]; weaknesses: string[]; priorityAreas: string[] },
    score: TestScore
  ): string[] {
    const nextSteps: string[] = [];

    // Immediate next steps based on score level
    if (score.scaledScore < 140) {
      nextSteps.push(
        'Complete a diagnostic review of fundamental concepts',
        'Begin with untimed practice to build accuracy',
        'Schedule regular study sessions 5-6 days per week'
      );
    } else if (score.scaledScore < 155) {
      nextSteps.push(
        'Focus on your weakest section identified in the analysis',
        'Implement timed practice sessions gradually',
        'Review every incorrect answer to understand the mistake'
      );
    } else if (score.scaledScore < 165) {
      nextSteps.push(
        'Take a full-length practice test every 2 weeks',
        'Focus on advanced strategy techniques',
        'Build endurance with back-to-back sections'
      );
    } else {
      nextSteps.push(
        'Maintain current performance with regular practice',
        'Focus on the most challenging question types',
        'Consider taking the actual LSAT when ready'
      );
    }

    // Add priority area focus
    if (strengthsAndWeaknesses.priorityAreas.length > 0) {
      nextSteps.push(
        `Prioritize improvement in: ${strengthsAndWeaknesses.priorityAreas.slice(0, 2).join(' and ')}`
      );
    }

    return nextSteps.slice(0, 5); // Limit to 5 actionable steps
  }

  /**
   * Calculate time comparison to average test-takers
   */
  private static calculateTimeComparison(session: PracticeTestSession): 'faster' | 'slower' | 'average' {
    const totalTime = session.timer.totalTestTime;
    const averageTime = 140 * 60 * 1000; // 140 minutes in milliseconds (4 sections × 35 min)

    const timeDifference = totalTime - averageTime;
    const percentageDifference = Math.abs(timeDifference) / averageTime;

    if (percentageDifference < 0.1) { // Within 10% of average
      return 'average';
    } else if (timeDifference < 0) {
      return 'faster';
    } else {
      return 'slower';
    }
  }

  /**
   * Validate analysis data
   */
  static validateAnalysis(analysis: TestAnalysis): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check overall performance metrics
    const metrics = analysis.overallPerformance;
    if (metrics.accuracy < 0 || metrics.accuracy > 100) {
      errors.push('Overall accuracy must be between 0-100');
    }

    if (metrics.timeManagement < 0 || metrics.timeManagement > 100) {
      errors.push('Time management score must be between 0-100');
    }

    // Check section analyses
    analysis.sectionAnalyses.forEach((section, index) => {
      if (section.overallAccuracy < 0 || section.overallAccuracy > 1) {
        errors.push(`Section ${index} accuracy must be between 0-1`);
      }

      if (section.averageTimePerQuestion < 0) {
        errors.push(`Section ${index} average time cannot be negative`);
      }

      if (section.questionAnalysis.length === 0) {
        errors.push(`Section ${index} must have question analysis data`);
      }
    });

    // Check recommendations exist
    if (analysis.studyRecommendations.focusAreas.length === 0) {
      errors.push('Study recommendations must include focus areas');
    }

    if (analysis.nextSteps.length === 0) {
      errors.push('Analysis must include next steps');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}