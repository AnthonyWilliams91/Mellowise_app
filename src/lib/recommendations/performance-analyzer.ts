/**
 * MELLOWISE-011: Performance Analyzer for Recommendation Engine
 * Integrates with MELLOWISE-012 Performance Insights
 */

import { supabase } from '@/lib/supabase';

export interface PerformanceInsights {
  strengths: string[];
  weaknesses: string[];
  trends: {
    improving: string[];
    declining: string[];
  };
  optimalTimes: string[];
  patterns: PerformancePattern[];
}

export interface PerformancePattern {
  type: 'time_of_day' | 'streak' | 'topic' | 'difficulty' | 'session_length';
  pattern: string;
  confidence: number;
  impact: number;
}

export class PerformanceAnalyzer {
  /**
   * Get comprehensive performance insights for a user
   */
  async getInsights(userId: string): Promise<PerformanceInsights> {
    // Fetch recent performance data
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select(`
        *,
        session_questions (
          question_id,
          correct,
          time_spent,
          confidence,
          question:questions (
            difficulty,
            topic,
            subtopic,
            question_type
          )
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (!sessions || sessions.length === 0) {
      return this.getDefaultInsights();
    }

    // Analyze performance patterns
    const strengths = await this.identifyStrengths(sessions);
    const weaknesses = await this.identifyWeaknesses(sessions);
    const trends = this.analyzeTrends(sessions);
    const optimalTimes = this.findOptimalTimes(sessions);
    const patterns = this.detectPatterns(sessions);

    return {
      strengths,
      weaknesses,
      trends,
      optimalTimes,
      patterns
    };
  }

  /**
   * Identify user's strength areas
   */
  private async identifyStrengths(sessions: any[]): Promise<string[]> {
    const topicPerformance = new Map<string, { correct: number; total: number }>();

    sessions.forEach(session => {
      session.session_questions?.forEach((sq: any) => {
        const topic = sq.question?.topic;
        if (topic) {
          if (!topicPerformance.has(topic)) {
            topicPerformance.set(topic, { correct: 0, total: 0 });
          }
          const stats = topicPerformance.get(topic)!;
          stats.total++;
          if (sq.correct) stats.correct++;
        }
      });
    });

    // Topics with >80% accuracy and at least 10 questions
    const strengths: string[] = [];
    topicPerformance.forEach((stats, topic) => {
      if (stats.total >= 10 && (stats.correct / stats.total) > 0.8) {
        strengths.push(topic);
      }
    });

    return strengths;
  }

  /**
   * Identify user's weakness areas
   */
  private async identifyWeaknesses(sessions: any[]): Promise<string[]> {
    const topicPerformance = new Map<string, { correct: number; total: number }>();

    sessions.forEach(session => {
      session.session_questions?.forEach((sq: any) => {
        const topic = sq.question?.topic;
        if (topic) {
          if (!topicPerformance.has(topic)) {
            topicPerformance.set(topic, { correct: 0, total: 0 });
          }
          const stats = topicPerformance.get(topic)!;
          stats.total++;
          if (sq.correct) stats.correct++;
        }
      });
    });

    // Topics with <60% accuracy and at least 5 questions
    const weaknesses: string[] = [];
    topicPerformance.forEach((stats, topic) => {
      if (stats.total >= 5 && (stats.correct / stats.total) < 0.6) {
        weaknesses.push(topic);
      }
    });

    return weaknesses;
  }

  /**
   * Analyze performance trends over time
   */
  private analyzeTrends(sessions: any[]): { improving: string[]; declining: string[] } {
    const recentSessions = sessions.slice(0, 10); // Most recent
    const olderSessions = sessions.slice(10, 20); // Older for comparison

    const recentPerf = this.calculateTopicPerformance(recentSessions);
    const olderPerf = this.calculateTopicPerformance(olderSessions);

    const improving: string[] = [];
    const declining: string[] = [];

    recentPerf.forEach((recentStats, topic) => {
      const olderStats = olderPerf.get(topic);
      if (olderStats && olderStats.total >= 3 && recentStats.total >= 3) {
        const recentAccuracy = recentStats.correct / recentStats.total;
        const olderAccuracy = olderStats.correct / olderStats.total;

        if (recentAccuracy > olderAccuracy + 0.1) {
          improving.push(topic);
        } else if (recentAccuracy < olderAccuracy - 0.1) {
          declining.push(topic);
        }
      }
    });

    return { improving, declining };
  }

  /**
   * Find optimal study times based on performance
   */
  private findOptimalTimes(sessions: any[]): string[] {
    const timePerformance = new Map<string, { correct: number; total: number }>();

    sessions.forEach(session => {
      const hour = new Date(session.created_at).getHours();
      const timeSlot = this.getTimeSlot(hour);

      if (!timePerformance.has(timeSlot)) {
        timePerformance.set(timeSlot, { correct: 0, total: 0 });
      }

      const stats = timePerformance.get(timeSlot)!;
      session.session_questions?.forEach((sq: any) => {
        stats.total++;
        if (sq.correct) stats.correct++;
      });
    });

    // Find time slots with best performance
    const optimalTimes: string[] = [];
    let bestAccuracy = 0;

    timePerformance.forEach((stats, timeSlot) => {
      if (stats.total >= 10) {
        const accuracy = stats.correct / stats.total;
        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
          optimalTimes.unshift(timeSlot); // Add to beginning
        } else if (accuracy > bestAccuracy - 0.05) {
          optimalTimes.push(timeSlot); // Add to end
        }
      }
    });

    return optimalTimes.slice(0, 3); // Top 3 time slots
  }

  /**
   * Detect performance patterns
   */
  private detectPatterns(sessions: any[]): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];

    // Streak pattern
    const streakPattern = this.analyzeStreakPattern(sessions);
    if (streakPattern) patterns.push(streakPattern);

    // Session length pattern
    const lengthPattern = this.analyzeSessionLengthPattern(sessions);
    if (lengthPattern) patterns.push(lengthPattern);

    // Difficulty progression pattern
    const difficultyPattern = this.analyzeDifficultyPattern(sessions);
    if (difficultyPattern) patterns.push(difficultyPattern);

    // Time of day pattern
    const timePattern = this.analyzeTimePattern(sessions);
    if (timePattern) patterns.push(timePattern);

    return patterns;
  }

  /**
   * Analyze streak-based performance patterns
   */
  private analyzeStreakPattern(sessions: any[]): PerformancePattern | null {
    let currentStreak = 0;
    let streakPerformance = 0;
    let nonStreakPerformance = 0;
    let streakQuestions = 0;
    let nonStreakQuestions = 0;

    sessions.forEach((session, index) => {
      const isStreak = index > 0 && this.isConsecutiveDay(
        new Date(sessions[index - 1].created_at),
        new Date(session.created_at)
      );

      if (isStreak) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }

      session.session_questions?.forEach((sq: any) => {
        if (currentStreak >= 3) {
          streakQuestions++;
          if (sq.correct) streakPerformance++;
        } else {
          nonStreakQuestions++;
          if (sq.correct) nonStreakPerformance++;
        }
      });
    });

    if (streakQuestions >= 20 && nonStreakQuestions >= 20) {
      const streakAccuracy = streakPerformance / streakQuestions;
      const nonStreakAccuracy = nonStreakPerformance / nonStreakQuestions;

      if (streakAccuracy > nonStreakAccuracy + 0.1) {
        return {
          type: 'streak',
          pattern: 'Performance improves significantly during study streaks',
          confidence: 0.8,
          impact: (streakAccuracy - nonStreakAccuracy) / nonStreakAccuracy
        };
      }
    }

    return null;
  }

  /**
   * Analyze session length impact on performance
   */
  private analyzeSessionLengthPattern(sessions: any[]): PerformancePattern | null {
    const shortSessions = sessions.filter(s => s.session_questions?.length <= 10);
    const mediumSessions = sessions.filter(s =>
      s.session_questions?.length > 10 && s.session_questions?.length <= 25
    );
    const longSessions = sessions.filter(s => s.session_questions?.length > 25);

    const shortPerf = this.calculateAccuracy(shortSessions);
    const mediumPerf = this.calculateAccuracy(mediumSessions);
    const longPerf = this.calculateAccuracy(longSessions);

    if (shortSessions.length >= 5 && mediumSessions.length >= 5) {
      if (mediumPerf > shortPerf + 0.1 && mediumPerf > longPerf) {
        return {
          type: 'session_length',
          pattern: 'Optimal performance in 10-25 question sessions',
          confidence: 0.7,
          impact: 0.15
        };
      }
    }

    return null;
  }

  /**
   * Analyze difficulty progression patterns
   */
  private analyzeDifficultyPattern(sessions: any[]): PerformancePattern | null {
    // Check if gradual difficulty increase improves performance
    const progressiveSessions = sessions.filter(session => {
      const difficulties = session.session_questions?.map((sq: any) =>
        sq.question?.difficulty || 5
      );
      return this.isProgressive(difficulties);
    });

    const randomSessions = sessions.filter(session => {
      const difficulties = session.session_questions?.map((sq: any) =>
        sq.question?.difficulty || 5
      );
      return !this.isProgressive(difficulties);
    });

    if (progressiveSessions.length >= 5 && randomSessions.length >= 5) {
      const progressivePerf = this.calculateAccuracy(progressiveSessions);
      const randomPerf = this.calculateAccuracy(randomSessions);

      if (progressivePerf > randomPerf + 0.1) {
        return {
          type: 'difficulty',
          pattern: 'Better performance with gradual difficulty progression',
          confidence: 0.75,
          impact: 0.2
        };
      }
    }

    return null;
  }

  /**
   * Analyze time of day patterns
   */
  private analyzeTimePattern(sessions: any[]): PerformancePattern | null {
    const morningPerf = this.calculateTimeSlotAccuracy(sessions, 'morning');
    const afternoonPerf = this.calculateTimeSlotAccuracy(sessions, 'afternoon');
    const eveningPerf = this.calculateTimeSlotAccuracy(sessions, 'evening');

    const performances = [
      { slot: 'morning', perf: morningPerf },
      { slot: 'afternoon', perf: afternoonPerf },
      { slot: 'evening', perf: eveningPerf }
    ].filter(p => p.perf.total >= 20);

    if (performances.length >= 2) {
      performances.sort((a, b) =>
        (b.perf.correct / b.perf.total) - (a.perf.correct / a.perf.total)
      );

      const best = performances[0];
      const worst = performances[performances.length - 1];
      const bestAccuracy = best.perf.correct / best.perf.total;
      const worstAccuracy = worst.perf.correct / worst.perf.total;

      if (bestAccuracy > worstAccuracy + 0.15) {
        return {
          type: 'time_of_day',
          pattern: `Peak performance during ${best.slot}`,
          confidence: 0.85,
          impact: (bestAccuracy - worstAccuracy) / worstAccuracy
        };
      }
    }

    return null;
  }

  // Helper methods

  private calculateTopicPerformance(sessions: any[]): Map<string, { correct: number; total: number }> {
    const performance = new Map<string, { correct: number; total: number }>();

    sessions.forEach(session => {
      session.session_questions?.forEach((sq: any) => {
        const topic = sq.question?.topic;
        if (topic) {
          if (!performance.has(topic)) {
            performance.set(topic, { correct: 0, total: 0 });
          }
          const stats = performance.get(topic)!;
          stats.total++;
          if (sq.correct) stats.correct++;
        }
      });
    });

    return performance;
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private calculateAccuracy(sessions: any[]): number {
    let correct = 0;
    let total = 0;

    sessions.forEach(session => {
      session.session_questions?.forEach((sq: any) => {
        total++;
        if (sq.correct) correct++;
      });
    });

    return total > 0 ? correct / total : 0;
  }

  private isProgressive(difficulties: number[]): boolean {
    if (!difficulties || difficulties.length < 3) return false;

    let increasingCount = 0;
    for (let i = 1; i < difficulties.length; i++) {
      if (difficulties[i] >= difficulties[i - 1]) {
        increasingCount++;
      }
    }

    return increasingCount > difficulties.length * 0.7;
  }

  private calculateTimeSlotAccuracy(sessions: any[], slot: string): { correct: number; total: number } {
    let correct = 0;
    let total = 0;

    sessions.forEach(session => {
      const hour = new Date(session.created_at).getHours();
      if (this.getTimeSlot(hour) === slot) {
        session.session_questions?.forEach((sq: any) => {
          total++;
          if (sq.correct) correct++;
        });
      }
    });

    return { correct, total };
  }

  private getDefaultInsights(): PerformanceInsights {
    return {
      strengths: [],
      weaknesses: [],
      trends: {
        improving: [],
        declining: []
      },
      optimalTimes: ['morning'],
      patterns: []
    };
  }
}