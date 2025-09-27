/**
 * Score Tracking Service
 * Historical score tracking, trend analysis, and progress monitoring
 */

import {
  TestHistory,
  TestScore,
  PracticeTestSession
} from '@/types/practice-test';
import { LSATScoringService } from './scoring-service';

interface ScoreEntry {
  testId: string;
  date: Date;
  score: number;
  percentile: number;
  testType: 'practice' | 'diagnostic';
  sectionBreakdown: {
    logicalReasoning: number;
    readingComprehension: number;
  };
  timeSpent: number; // in minutes
  questionsAttempted: number;
  questionsCorrect: number;
}

interface ProgressMilestone {
  id: string;
  targetScore: number;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
  description: string;
}

interface StudySession {
  id: string;
  date: Date;
  duration: number; // minutes
  focusAreas: string[];
  questionsAnswered: number;
  accuracy: number;
  notes?: string;
}

export class ScoreTrackingService {
  private static readonly STORAGE_KEY_HISTORY = 'lsat_score_history';
  private static readonly STORAGE_KEY_MILESTONES = 'lsat_milestones';
  private static readonly STORAGE_KEY_SESSIONS = 'lsat_study_sessions';

  /**
   * Add a new test score to history
   */
  static addScore(
    userId: string,
    session: PracticeTestSession,
    score: TestScore
  ): TestHistory {
    const history = this.getScoreHistory(userId);

    // Create new score entry
    const newEntry: ScoreEntry = {
      testId: session.id,
      date: new Date(),
      score: score.scaledScore,
      percentile: score.percentile,
      testType: session.config.testName.includes('Diagnostic') ? 'diagnostic' : 'practice',
      sectionBreakdown: this.calculateSectionBreakdown(score),
      timeSpent: Math.round(score.totalTestTime / (1000 * 60)), // Convert to minutes
      questionsAttempted: score.totalQuestionsAttempted,
      questionsCorrect: score.totalQuestionsCorrect
    };

    // Add to history
    history.tests.push({
      testId: newEntry.testId,
      date: newEntry.date,
      score: newEntry.score,
      percentile: newEntry.percentile,
      testType: newEntry.testType
    });

    // Update trends
    history.trends = this.calculateTrends(history.tests);

    // Update milestones
    this.checkMilestoneAchievements(userId, newEntry);

    // Save updated history
    this.saveScoreHistory(userId, history);

    return history;
  }

  /**
   * Get user's complete score history
   */
  static getScoreHistory(userId: string): TestHistory {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_HISTORY}_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.tests.forEach((test: any) => {
          test.date = new Date(test.date);
        });
        if (parsed.milestones?.firstTest) {
          parsed.milestones.firstTest = new Date(parsed.milestones.firstTest);
        }
        if (parsed.milestones?.targetDate) {
          parsed.milestones.targetDate = new Date(parsed.milestones.targetDate);
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Error loading score history:', error);
    }

    // Return empty history
    return {
      userId,
      tests: [],
      trends: {
        scoreProgression: [],
        averageImprovement: 0,
        bestScore: 0,
        mostRecentScore: 0,
        consistencyRating: 100
      },
      milestones: {
        firstTest: new Date(),
        testsToTarget: 0
      }
    };
  }

  /**
   * Save score history to storage
   */
  private static saveScoreHistory(userId: string, history: TestHistory): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY_HISTORY}_${userId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving score history:', error);
    }
  }

  /**
   * Calculate section breakdown from score
   */
  private static calculateSectionBreakdown(score: TestScore): {
    logicalReasoning: number;
    readingComprehension: number;
  } {
    let lrAccuracy = 0;
    let lrCount = 0;
    let rcAccuracy = 0;
    let rcCount = 0;

    score.sectionScores.forEach(section => {
      if (!section.isExperimental) {
        if (section.sectionType === 'logical_reasoning') {
          lrAccuracy += section.percentageCorrect;
          lrCount++;
        } else if (section.sectionType === 'reading_comprehension') {
          rcAccuracy += section.percentageCorrect;
          rcCount++;
        }
      }
    });

    return {
      logicalReasoning: lrCount > 0 ? Math.round(lrAccuracy / lrCount) : 0,
      readingComprehension: rcCount > 0 ? Math.round(rcAccuracy / rcCount) : 0
    };
  }

  /**
   * Calculate trend statistics
   */
  private static calculateTrends(tests: Array<{
    testId: string;
    date: Date;
    score: number;
    percentile: number;
    testType: 'practice' | 'diagnostic';
  }>): TestHistory['trends'] {
    if (tests.length === 0) {
      return {
        scoreProgression: [],
        averageImprovement: 0,
        bestScore: 0,
        mostRecentScore: 0,
        consistencyRating: 100
      };
    }

    // Sort by date
    const sortedTests = [...tests].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Get last 10 tests for progression
    const recentTests = sortedTests.slice(-10);
    const scoreProgression = recentTests.map(t => t.score);

    // Calculate improvement
    let totalImprovement = 0;
    let improvementCount = 0;

    for (let i = 1; i < sortedTests.length; i++) {
      const improvement = sortedTests[i].score - sortedTests[i - 1].score;
      totalImprovement += improvement;
      improvementCount++;
    }

    const averageImprovement = improvementCount > 0 ? totalImprovement / improvementCount : 0;

    // Best and most recent scores
    const bestScore = Math.max(...sortedTests.map(t => t.score));
    const mostRecentScore = sortedTests[sortedTests.length - 1].score;

    // Consistency rating (inverse of standard deviation)
    const mean = scoreProgression.reduce((sum, score) => sum + score, 0) / scoreProgression.length;
    const variance = scoreProgression.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scoreProgression.length;
    const stdDev = Math.sqrt(variance);
    const consistencyRating = Math.max(0, Math.min(100, 100 - (stdDev * 2)));

    return {
      scoreProgression,
      averageImprovement: Math.round(averageImprovement * 100) / 100,
      bestScore,
      mostRecentScore,
      consistencyRating: Math.round(consistencyRating)
    };
  }

  /**
   * Set user goals and milestones
   */
  static setGoals(
    userId: string,
    targetScore: number,
    targetDate: Date,
    description?: string
  ): ProgressMilestone {
    const milestone: ProgressMilestone = {
      id: `milestone_${Date.now()}`,
      targetScore,
      targetDate,
      achieved: false,
      description: description || `Reach ${targetScore} by ${targetDate.toLocaleDateString()}`
    };

    const milestones = this.getMilestones(userId);
    milestones.push(milestone);
    this.saveMilestones(userId, milestones);

    // Update history milestones
    const history = this.getScoreHistory(userId);
    history.milestones.targetScore = targetScore;
    history.milestones.targetDate = targetDate;
    history.milestones.testsToTarget = this.calculateTestsToTarget(history.tests, targetScore);
    this.saveScoreHistory(userId, history);

    return milestone;
  }

  /**
   * Get user's milestones
   */
  static getMilestones(userId: string): ProgressMilestone[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_MILESTONES}_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.forEach((milestone: any) => {
          milestone.targetDate = new Date(milestone.targetDate);
          if (milestone.achievedDate) {
            milestone.achievedDate = new Date(milestone.achievedDate);
          }
        });
        return parsed;
      }
    } catch (error) {
      console.warn('Error loading milestones:', error);
    }

    return [];
  }

  /**
   * Save milestones
   */
  private static saveMilestones(userId: string, milestones: ProgressMilestone[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY_MILESTONES}_${userId}`, JSON.stringify(milestones));
    } catch (error) {
      console.error('Error saving milestones:', error);
    }
  }

  /**
   * Check if any milestones were achieved with new score
   */
  private static checkMilestoneAchievements(userId: string, scoreEntry: ScoreEntry): void {
    const milestones = this.getMilestones(userId);
    let updated = false;

    milestones.forEach(milestone => {
      if (!milestone.achieved && scoreEntry.score >= milestone.targetScore) {
        milestone.achieved = true;
        milestone.achievedDate = scoreEntry.date;
        updated = true;
      }
    });

    if (updated) {
      this.saveMilestones(userId, milestones);
    }
  }

  /**
   * Calculate estimated tests needed to reach target
   */
  private static calculateTestsToTarget(
    tests: Array<{ score: number; date: Date }>,
    targetScore: number
  ): number {
    if (tests.length === 0) return 0;

    const sortedTests = [...tests].sort((a, b) => a.date.getTime() - b.date.getTime());
    const currentScore = sortedTests[sortedTests.length - 1].score;

    if (currentScore >= targetScore) return 0;

    const scoreGap = targetScore - currentScore;

    // Calculate improvement rate from recent tests
    let improvementRate = 0;
    if (sortedTests.length >= 3) {
      const recentTests = sortedTests.slice(-5); // Last 5 tests
      let totalImprovement = 0;
      let improvementCount = 0;

      for (let i = 1; i < recentTests.length; i++) {
        const improvement = recentTests[i].score - recentTests[i - 1].score;
        if (improvement > 0) {
          totalImprovement += improvement;
          improvementCount++;
        }
      }

      improvementRate = improvementCount > 0 ? totalImprovement / improvementCount : 1;
    } else {
      improvementRate = 1; // Default assumption: 1 point per test
    }

    // Estimate tests needed
    const testsNeeded = Math.ceil(scoreGap / Math.max(0.5, improvementRate));
    return Math.min(testsNeeded, 20); // Cap at 20 tests
  }

  /**
   * Add study session record
   */
  static addStudySession(
    userId: string,
    duration: number,
    focusAreas: string[],
    questionsAnswered: number,
    accuracy: number,
    notes?: string
  ): void {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      date: new Date(),
      duration,
      focusAreas,
      questionsAnswered,
      accuracy,
      notes
    };

    const sessions = this.getStudySessions(userId);
    sessions.push(session);

    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.splice(0, sessions.length - 50);
    }

    this.saveStudySessions(userId, sessions);
  }

  /**
   * Get study sessions
   */
  static getStudySessions(userId: string): StudySession[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY_SESSIONS}_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.forEach((session: any) => {
          session.date = new Date(session.date);
        });
        return parsed;
      }
    } catch (error) {
      console.warn('Error loading study sessions:', error);
    }

    return [];
  }

  /**
   * Save study sessions
   */
  private static saveStudySessions(userId: string, sessions: StudySession[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY_SESSIONS}_${userId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving study sessions:', error);
    }
  }

  /**
   * Get progress analytics for dashboard
   */
  static getProgressAnalytics(userId: string): {
    totalTests: number;
    totalStudyHours: number;
    currentStreak: number;
    averageScore: number;
    improvementTrend: 'up' | 'down' | 'stable';
    timeToGoal?: number; // days
    recentMilestones: ProgressMilestone[];
    weeklyProgress: Array<{ week: string; averageScore: number; testsCount: number }>;
  } {
    const history = this.getScoreHistory(userId);
    const sessions = this.getStudySessions(userId);
    const milestones = this.getMilestones(userId);

    // Total stats
    const totalTests = history.tests.length;
    const totalStudyHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

    // Current streak (consecutive days with activity)
    const currentStreak = this.calculateCurrentStreak(history.tests, sessions);

    // Average score
    const averageScore = totalTests > 0
      ? history.tests.reduce((sum, t) => sum + t.score, 0) / totalTests
      : 0;

    // Improvement trend
    const improvementTrend = this.determineImprovementTrend(history.trends.averageImprovement);

    // Time to goal
    const timeToGoal = history.milestones.targetScore && history.milestones.targetDate
      ? this.calculateTimeToGoal(history.tests, history.milestones.targetScore, history.milestones.targetDate)
      : undefined;

    // Recent milestones (achieved in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMilestones = milestones.filter(
      m => m.achieved && m.achievedDate && m.achievedDate >= thirtyDaysAgo
    );

    // Weekly progress (last 12 weeks)
    const weeklyProgress = this.calculateWeeklyProgress(history.tests);

    return {
      totalTests,
      totalStudyHours: Math.round(totalStudyHours),
      currentStreak,
      averageScore: Math.round(averageScore),
      improvementTrend,
      timeToGoal,
      recentMilestones,
      weeklyProgress
    };
  }

  /**
   * Calculate current activity streak
   */
  private static calculateCurrentStreak(
    tests: Array<{ date: Date }>,
    sessions: Array<{ date: Date }>
  ): number {
    // Combine all activity dates
    const allDates = [
      ...tests.map(t => t.date),
      ...sessions.map(s => s.date)
    ].sort((a, b) => b.getTime() - a.getTime());

    if (allDates.length === 0) return 0;

    // Check for consecutive days
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from most recent activity
    let currentDate = new Date(allDates[0]);
    currentDate.setHours(0, 0, 0, 0);

    // If most recent activity is not today or yesterday, streak is 0
    const daysDiff = (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 1) return 0;

    // Count consecutive days
    for (let i = 1; i < allDates.length; i++) {
      const prevDate = new Date(allDates[i]);
      prevDate.setHours(0, 0, 0, 0);

      const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
        currentDate = prevDate;
      } else if (diff > 1) {
        break;
      }
      // If diff === 0, it's the same day, continue without incrementing streak
    }

    return streak;
  }

  /**
   * Determine improvement trend
   */
  private static determineImprovementTrend(averageImprovement: number): 'up' | 'down' | 'stable' {
    if (averageImprovement > 0.5) return 'up';
    if (averageImprovement < -0.5) return 'down';
    return 'stable';
  }

  /**
   * Calculate estimated time to reach goal
   */
  private static calculateTimeToGoal(
    tests: Array<{ score: number; date: Date }>,
    targetScore: number,
    targetDate: Date
  ): number {
    if (tests.length === 0) return Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const currentScore = tests[tests.length - 1].score;
    if (currentScore >= targetScore) return 0;

    // Use target date if specified and reasonable
    const daysToTarget = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysToTarget);
  }

  /**
   * Calculate weekly progress for chart display
   */
  private static calculateWeeklyProgress(
    tests: Array<{ score: number; date: Date }>
  ): Array<{ week: string; averageScore: number; testsCount: number }> {
    const weeks: { [weekKey: string]: { scores: number[]; count: number } } = {};

    // Group tests by week
    tests.forEach(test => {
      const weekStart = new Date(test.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { scores: [], count: 0 };
      }

      weeks[weekKey].scores.push(test.score);
      weeks[weekKey].count++;
    });

    // Convert to array and calculate averages
    const weeklyData = Object.keys(weeks)
      .sort()
      .slice(-12) // Last 12 weeks
      .map(weekKey => {
        const weekData = weeks[weekKey];
        const averageScore = weekData.scores.reduce((sum, score) => sum + score, 0) / weekData.scores.length;

        return {
          week: new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          averageScore: Math.round(averageScore),
          testsCount: weekData.count
        };
      });

    return weeklyData;
  }

  /**
   * Export score data for analysis
   */
  static exportScoreData(userId: string): {
    history: TestHistory;
    sessions: StudySession[];
    milestones: ProgressMilestone[];
    analytics: ReturnType<typeof ScoreTrackingService.getProgressAnalytics>;
  } {
    return {
      history: this.getScoreHistory(userId),
      sessions: this.getStudySessions(userId),
      milestones: this.getMilestones(userId),
      analytics: this.getProgressAnalytics(userId)
    };
  }

  /**
   * Clear all user data (for testing or reset)
   */
  static clearUserData(userId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY_HISTORY}_${userId}`);
      localStorage.removeItem(`${this.STORAGE_KEY_MILESTONES}_${userId}`);
      localStorage.removeItem(`${this.STORAGE_KEY_SESSIONS}_${userId}`);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}