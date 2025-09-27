/**
 * Smart Notification Service
 * MELLOWISE-015: Core service for intelligent notification scheduling and delivery
 */

import { createServerClient } from '@/lib/supabase/server';
import {
  Notification,
  NotificationChannel,
  NotificationType,
  NotificationPreferences,
  SmartSchedulingData,
  ReminderRule,
  SpacedRepetitionSchedule,
  NotificationPriority,
  CreateNotificationRequest,
  NotificationQueueItem,
  BurnoutPrevention,
} from '@/types/notifications';
import { addDays, addHours, differenceInHours, differenceInDays, format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * Notification Service - Handles smart scheduling and delivery
 */
export class NotificationService {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Create and schedule a notification
   */
  async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    const preferences = await this.getUserPreferences(request.userId);

    // Check if user has opted in for this notification type
    if (!this.isNotificationTypeEnabled(request.type, preferences)) {
      throw new Error(`User has disabled ${request.type} notifications`);
    }

    // Determine channels based on preferences or request
    const channels = request.channels || this.getDefaultChannels(request.type, preferences);

    // Apply smart scheduling if not explicitly scheduled
    const scheduledFor = request.scheduledFor || await this.getOptimalScheduleTime(
      request.userId,
      request.type,
      request.priority || 'medium'
    );

    const notification: Notification = {
      id: crypto.randomUUID(),
      userId: request.userId,
      type: request.type,
      priority: request.priority || 'medium',
      title: request.title,
      message: request.message,
      data: request.metadata,
      channels,
      scheduledFor,
      metadata: request.metadata || {},
      createdAt: new Date().toISOString(),
    };

    // Save to database
    const { error } = await this.supabase
      .from('notifications')
      .insert(notification);

    if (error) throw error;

    // Queue for delivery
    await this.queueNotification(notification);

    return notification;
  }

  /**
   * Get optimal time to send a notification based on user patterns
   */
  async getOptimalScheduleTime(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority
  ): Promise<string> {
    const schedulingData = await this.getSmartSchedulingData(userId);
    const preferences = await this.getUserPreferences(userId);

    // High priority notifications go out immediately
    if (priority === 'critical') {
      return new Date().toISOString();
    }

    // Get user's optimal study times
    const optimalTimes = schedulingData.optimalStudyTimes
      .sort((a, b) => b.performanceScore - a.performanceScore);

    if (optimalTimes.length === 0) {
      // Default to 10 AM in user's timezone if no data
      return this.getNextTimeSlot(10, preferences.quietHours.timezone);
    }

    // Find next available optimal time
    const now = new Date();
    for (const optimal of optimalTimes) {
      const nextOccurrence = this.getNextOccurrenceOfTime(
        optimal.dayOfWeek,
        optimal.hourOfDay,
        preferences.quietHours.timezone
      );

      // Check if it's outside quiet hours
      if (!this.isInQuietHours(nextOccurrence, preferences)) {
        // Check if we have capacity for this time slot
        const notificationCount = await this.getScheduledNotificationCount(
          userId,
          nextOccurrence
        );

        if (notificationCount < preferences.frequency.maxDailyNotifications) {
          return nextOccurrence.toISOString();
        }
      }
    }

    // Fallback to next available slot outside quiet hours
    return this.getNextAvailableSlot(userId, preferences);
  }

  /**
   * Apply spaced repetition algorithm for study reminders
   */
  async scheduleSpacedRepetition(
    userId: string,
    topicId: string,
    performance: number
  ): Promise<SpacedRepetitionSchedule> {
    // Get or create spaced repetition schedule
    const { data: existing } = await this.supabase
      .from('spaced_repetition_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    let schedule: SpacedRepetitionSchedule;

    if (existing) {
      // Update existing schedule based on performance
      schedule = this.updateSpacedRepetition(existing, performance);
    } else {
      // Create new schedule
      schedule = {
        userId,
        topicId,
        lastReview: new Date().toISOString(),
        nextReview: addDays(new Date(), 1).toISOString(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        lapses: 0,
      };
    }

    // Save schedule
    await this.supabase
      .from('spaced_repetition_schedules')
      .upsert(schedule);

    // Schedule notification for next review
    await this.createNotification({
      userId,
      type: 'study_reminder',
      priority: 'medium',
      title: 'Time to review!',
      message: `It's time to review ${topicId} to reinforce your learning.`,
      scheduledFor: schedule.nextReview,
      metadata: { topicId, spacedRepetition: true },
    });

    return schedule;
  }

  /**
   * Update spaced repetition schedule based on performance
   */
  private updateSpacedRepetition(
    schedule: SpacedRepetitionSchedule,
    performance: number
  ): SpacedRepetitionSchedule {
    // SM-2 algorithm adaptation
    const grade = Math.floor(performance / 20); // Convert 0-100 to 0-5 scale

    if (grade >= 3) {
      // Correct response
      if (schedule.repetitions === 0) {
        schedule.interval = 1;
      } else if (schedule.repetitions === 1) {
        schedule.interval = 6;
      } else {
        schedule.interval = Math.round(schedule.interval * schedule.easeFactor);
      }
      schedule.repetitions += 1;

      // Update ease factor
      schedule.easeFactor = schedule.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
      if (schedule.easeFactor < 1.3) schedule.easeFactor = 1.3;
    } else {
      // Incorrect response
      schedule.repetitions = 0;
      schedule.lapses += 1;
      schedule.interval = 1;
    }

    schedule.lastReview = new Date().toISOString();
    schedule.nextReview = addDays(new Date(), schedule.interval).toISOString();

    return schedule;
  }

  /**
   * Detect and prevent burnout through smart break reminders
   */
  async checkBurnoutIndicators(userId: string): Promise<BurnoutPrevention> {
    // Get recent study patterns
    const { data: sessions } = await this.supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', addDays(new Date(), -7).toISOString())
      .order('created_at', { ascending: false });

    const { data: performance } = await this.supabase
      .from('performance_insights')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculate burnout indicators
    const consecutiveStudyDays = this.calculateConsecutiveDays(sessions || []);
    const averageDailyHours = this.calculateAverageDailyHours(sessions || []);
    const performanceTrend = this.calculatePerformanceTrend(sessions || []);
    const frustrationScore = this.calculateFrustrationScore(sessions || []);
    const lastBreak = this.findLastBreak(sessions || []);

    // Determine stress level
    let stressLevel: 'low' | 'moderate' | 'high' = 'low';
    if (frustrationScore > 70 || consecutiveStudyDays > 14) {
      stressLevel = 'high';
    } else if (frustrationScore > 40 || consecutiveStudyDays > 7) {
      stressLevel = 'moderate';
    }

    const burnoutData: BurnoutPrevention = {
      userId,
      indicators: {
        consecutiveStudyDays,
        averageDailyHours,
        performanceTrend,
        frustrationScore,
        lastBreak,
        stressLevel,
      },
      recommendations: {
        suggestBreak: consecutiveStudyDays > 7 || averageDailyHours > 4,
        reduceIntensity: frustrationScore > 60,
        switchTopic: performanceTrend === 'declining' && frustrationScore > 40,
        celebrateProgress: consecutiveStudyDays > 5 && performanceTrend === 'improving',
      },
      interventions: [],
    };

    // Schedule appropriate interventions
    if (burnoutData.recommendations.suggestBreak) {
      await this.createNotification({
        userId,
        type: 'break_reminder',
        priority: 'high',
        title: 'Time for a break! 🌟',
        message: `You've been studying hard for ${consecutiveStudyDays} days straight. Taking a break will help you learn better!`,
      });
    }

    if (burnoutData.recommendations.celebrateProgress) {
      await this.createNotification({
        userId,
        type: 'achievement',
        priority: 'medium',
        title: 'Amazing progress! 🎉',
        message: `Your ${consecutiveStudyDays}-day streak is paying off - your performance is improving!`,
      });
    }

    return burnoutData;
  }

  /**
   * Adaptive reminder frequency based on performance
   */
  async adjustReminderFrequency(userId: string): Promise<void> {
    const schedulingData = await this.getSmartSchedulingData(userId);
    const preferences = await this.getUserPreferences(userId);

    // If user is struggling (performance below 60%), increase reminder frequency
    const recentAvgPerformance = schedulingData.recentPerformance
      .reduce((sum, p) => sum + p.score, 0) / (schedulingData.recentPerformance.length || 1);

    if (recentAvgPerformance < 60 && preferences.smartDefaults.adaptToPerformance) {
      // Increase frequency for struggling users
      await this.updateReminderRules(userId, {
        performance_boost: {
          id: 'performance_boost',
          userId,
          name: 'Performance Boost Reminders',
          enabled: true,
          triggerType: 'performance_based',
          conditions: {
            performanceBelow: 60,
            hoursSinceLastSession: 24,
          },
          action: {
            type: 'study_reminder',
            template: 'You can improve! A quick study session will help.',
            priority: 'medium',
            channels: ['push', 'in_app'],
          },
          frequency: {
            maxPerDay: 3,
            minHoursBetween: 4,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Check for goal deadline urgency
    for (const goal of schedulingData.goalDeadlines) {
      const daysUntilDeadline = differenceInDays(parseISO(goal.deadline), new Date());

      if (daysUntilDeadline <= 7 && goal.progress < 70) {
        // Urgent goal reminders
        await this.createNotification({
          userId,
          type: 'goal_deadline',
          priority: 'high',
          title: `⏰ ${daysUntilDeadline} days left for your goal!`,
          message: `You're at ${goal.progress}% progress. Let's push to reach your goal!`,
          metadata: { goalId: goal.goalId },
        });
      }
    }
  }

  /**
   * Get user notification preferences
   */
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      // Return default preferences
      return this.getDefaultPreferences(userId);
    }

    return data;
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      id: crypto.randomUUID(),
      userId,
      channels: {
        email: true,
        push: true,
        inApp: true,
        sms: false,
      },
      types: {
        studyReminders: true,
        goalDeadlines: true,
        streakMaintenance: true,
        achievements: true,
        breakReminders: true,
        performanceAlerts: true,
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/New_York',
      },
      frequency: {
        studyReminders: 'daily',
        goalDeadlines: 'adaptive',
        maxDailyNotifications: 5,
      },
      smartDefaults: {
        useOptimalTiming: true,
        adaptToPerformance: true,
        spacedRepetition: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper functions
   */
  private isNotificationTypeEnabled(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    const typeMap: Record<NotificationType, keyof NotificationPreferences['types']> = {
      study_reminder: 'studyReminders',
      goal_deadline: 'goalDeadlines',
      streak_maintenance: 'streakMaintenance',
      achievement: 'achievements',
      break_reminder: 'breakReminders',
      performance_alert: 'performanceAlerts',
    };

    return preferences.types[typeMap[type]] ?? true;
  }

  private getDefaultChannels(
    type: NotificationType,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    if (preferences.channels.inApp) channels.push('in_app');
    if (preferences.channels.push) channels.push('push');

    // Critical notifications also go to email
    if (type === 'goal_deadline' && preferences.channels.email) {
      channels.push('email');
    }

    return channels;
  }

  private isInQuietHours(date: Date, preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const zonedDate = utcToZonedTime(date, preferences.quietHours.timezone);
    const hours = zonedDate.getHours();
    const startHour = parseInt(preferences.quietHours.startTime.split(':')[0]);
    const endHour = parseInt(preferences.quietHours.endTime.split(':')[0]);

    if (startHour > endHour) {
      // Quiet hours span midnight
      return hours >= startHour || hours < endHour;
    } else {
      return hours >= startHour && hours < endHour;
    }
  }

  private async getSmartSchedulingData(userId: string): Promise<SmartSchedulingData> {
    // This would aggregate data from various sources
    // Simplified for implementation
    const { data: sessions } = await this.supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', addDays(new Date(), -30).toISOString());

    const { data: goals } = await this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Process and return scheduling data
    return {
      userId,
      optimalStudyTimes: this.analyzeOptimalTimes(sessions || []),
      recentPerformance: this.extractRecentPerformance(sessions || []),
      currentStreak: 0, // Would calculate from sessions
      goalDeadlines: this.processGoalDeadlines(goals || []),
      lastStudySession: sessions?.[0]?.created_at,
      averageSessionGap: 24, // hours, would calculate
      learningVelocity: 10, // questions per day, would calculate
    };
  }

  // =============================================
  // INTELLIGENT HELPER METHODS
  // =============================================

  /**
   * Analyze user session data to find optimal study times
   * Uses performance correlation with time-of-day to identify peak learning periods
   */
  private analyzeOptimalTimes(sessions: any[]): {
    dayOfWeek: number;
    hourOfDay: number;
    performanceScore: number;
    sampleSize: number;
  }[] {
    if (!sessions || sessions.length === 0) return [];

    // Group sessions by day of week and hour
    const timePerformanceMap = new Map<string, { scores: number[]; accuracy: number[] }>();

    for (const session of sessions) {
      const date = new Date(session.created_at || session.started_at);
      const dayOfWeek = date.getDay();
      const hourOfDay = date.getHours();
      const key = `${dayOfWeek}-${hourOfDay}`;

      if (!timePerformanceMap.has(key)) {
        timePerformanceMap.set(key, { scores: [], accuracy: [] });
      }

      const data = timePerformanceMap.get(key)!;
      if (session.final_score) data.scores.push(session.final_score);
      if (session.accuracy_percentage) data.accuracy.push(session.accuracy_percentage);
    }

    // Convert to optimal times array with performance scoring
    const optimalTimes = [];
    for (const [key, data] of timePerformanceMap) {
      const [dayOfWeek, hourOfDay] = key.split('-').map(Number);
      const avgScore = data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0;
      const avgAccuracy = data.accuracy.length > 0 ? data.accuracy.reduce((a, b) => a + b, 0) / data.accuracy.length : 0;

      // Combined performance score (weighted average)
      const performanceScore = Math.round((avgScore * 0.4 + avgAccuracy * 0.6));
      const sampleSize = Math.max(data.scores.length, data.accuracy.length);

      if (sampleSize >= 2) { // Only include slots with sufficient data
        optimalTimes.push({ dayOfWeek, hourOfDay, performanceScore, sampleSize });
      }
    }

    // Sort by performance score and sample size
    return optimalTimes.sort((a, b) => {
      if (Math.abs(a.performanceScore - b.performanceScore) < 5) {
        return b.sampleSize - a.sampleSize; // Prefer more data
      }
      return b.performanceScore - a.performanceScore;
    }).slice(0, 10); // Top 10 optimal times
  }

  /**
   * Extract performance metrics from recent sessions
   * Analyzes last 14 days of session data for trend analysis
   */
  private extractRecentPerformance(sessions: any[]): {
    date: string;
    score: number;
    duration: number;
    topicId: string;
  }[] {
    if (!sessions || sessions.length === 0) return [];

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    return sessions
      .filter(session => {
        const sessionDate = new Date(session.created_at || session.started_at);
        return sessionDate >= twoWeeksAgo;
      })
      .map(session => ({
        date: session.created_at || session.started_at,
        score: session.accuracy_percentage || (session.correct_answers / Math.max(session.questions_answered, 1)) * 100,
        duration: session.total_time_spent ||
          (session.ended_at && session.started_at ?
            new Date(session.ended_at).getTime() - new Date(session.started_at).getTime() : 1800000), // 30 min default
        topicId: session.session_type || 'general'
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20); // Most recent 20 sessions
  }

  /**
   * Process goal data for deadline notifications
   * Analyzes goal progress and urgency for smart reminder scheduling
   */
  private processGoalDeadlines(goals: any[]): {
    goalId: string;
    deadline: string;
    progress: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }[] {
    if (!goals || goals.length === 0) return [];

    return goals
      .filter(goal => goal.deadline && goal.status === 'active')
      .map(goal => {
        const deadline = new Date(goal.deadline);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const progress = goal.progress || 0;

        // Determine urgency based on time remaining and progress
        let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (daysUntilDeadline <= 1) {
          urgency = 'critical';
        } else if (daysUntilDeadline <= 3 && progress < 80) {
          urgency = 'high';
        } else if (daysUntilDeadline <= 7 && progress < 60) {
          urgency = 'high';
        } else if (daysUntilDeadline <= 14 && progress < 40) {
          urgency = 'medium';
        }

        return {
          goalId: goal.id,
          deadline: goal.deadline,
          progress,
          urgency
        };
      })
      .sort((a, b) => {
        // Sort by urgency first, then by deadline
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }

  /**
   * Calculate consecutive study days for burnout detection
   * Analyzes daily activity to detect extended study periods
   */
  private calculateConsecutiveDays(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0;

    // Get unique study days from sessions
    const studyDays = new Set<string>();
    for (const session of sessions) {
      const date = new Date(session.created_at || session.started_at);
      const dayKey = date.toISOString().split('T')[0];
      studyDays.add(dayKey);
    }

    const sortedDays = Array.from(studyDays).sort().reverse();
    if (sortedDays.length === 0) return 0;

    let consecutiveDays = 1;
    const today = new Date().toISOString().split('T')[0];

    // Check if studied today or yesterday (to account for timezone differences)
    const currentDay = new Date(sortedDays[0]);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0; // Streak broken if more than 1 day gap

    // Count consecutive days backwards
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDay = new Date(sortedDays[i - 1]);
      const currDay = new Date(sortedDays[i]);
      const dayDiff = Math.floor((prevDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        consecutiveDays++;
      } else {
        break; // Streak broken
      }
    }

    return consecutiveDays;
  }

  /**
   * Calculate average daily study hours
   * Analyzes session duration patterns for workload assessment
   */
  private calculateAverageDailyHours(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0;

    // Group sessions by day and calculate daily totals
    const dailyHours = new Map<string, number>();

    for (const session of sessions) {
      const date = new Date(session.created_at || session.started_at);
      const dayKey = date.toISOString().split('T')[0];

      let duration = session.total_time_spent || 0;
      if (!duration && session.ended_at && session.started_at) {
        duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
      }

      const hours = duration / (1000 * 60 * 60); // Convert to hours
      dailyHours.set(dayKey, (dailyHours.get(dayKey) || 0) + hours);
    }

    if (dailyHours.size === 0) return 0;

    const totalHours = Array.from(dailyHours.values()).reduce((sum, hours) => sum + hours, 0);
    return Math.round((totalHours / dailyHours.size) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate performance trend analysis
   * Uses linear regression on recent performance to determine learning trajectory
   */
  private calculatePerformanceTrend(sessions: any[]): 'improving' | 'stable' | 'declining' {
    if (!sessions || sessions.length < 3) return 'stable';

    // Get recent sessions with performance data
    const recentSessions = sessions
      .filter(session => session.accuracy_percentage !== undefined ||
        (session.correct_answers !== undefined && session.questions_answered !== undefined))
      .slice(0, 10) // Last 10 sessions
      .map((session, index) => ({
        x: index,
        y: session.accuracy_percentage || (session.correct_answers / Math.max(session.questions_answered, 1)) * 100
      }));

    if (recentSessions.length < 3) return 'stable';

    // Simple linear regression to find trend
    const n = recentSessions.length;
    const sumX = recentSessions.reduce((sum, point) => sum + point.x, 0);
    const sumY = recentSessions.reduce((sum, point) => sum + point.y, 0);
    const sumXY = recentSessions.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = recentSessions.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine trend based on slope
    if (slope > 2) return 'improving';      // Improvement > 2% per session
    if (slope < -2) return 'declining';     // Decline > 2% per session
    return 'stable';
  }

  /**
   * Calculate user frustration score based on session patterns
   * Analyzes incorrect answers, time pressure, and performance drops
   */
  private calculateFrustrationScore(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0;

    let frustrationScore = 0;
    const recentSessions = sessions.slice(0, 5); // Last 5 sessions

    for (const session of recentSessions) {
      // Factor 1: Low accuracy (weight: 40%)
      const accuracy = session.accuracy_percentage ||
        (session.correct_answers / Math.max(session.questions_answered, 1)) * 100;
      if (accuracy < 60) frustrationScore += (60 - accuracy) * 0.4;

      // Factor 2: Quick session exits (weight: 30%)
      const duration = session.total_time_spent || 0;
      const questionsAnswered = session.questions_answered || 0;
      if (questionsAnswered < 5 && duration < 300000) { // Less than 5 questions in < 5 mins
        frustrationScore += 30;
      }

      // Factor 3: Performance decline (weight: 20%)
      const expectedQuestions = Math.max(Math.floor(duration / 60000), 1); // 1 question per minute
      if (questionsAnswered < expectedQuestions * 0.5) {
        frustrationScore += 20;
      }

      // Factor 4: Repeated incorrect answers (weight: 10%)
      const incorrectAnswers = (session.questions_answered || 0) - (session.correct_answers || 0);
      if (incorrectAnswers > questionsAnswered * 0.7) {
        frustrationScore += 10;
      }
    }

    return Math.min(Math.round(frustrationScore / recentSessions.length), 100);
  }

  /**
   * Find when user last took a meaningful break
   * Analyzes session gaps to identify rest periods
   */
  private findLastBreak(sessions: any[]): string {
    if (!sessions || sessions.length < 2) {
      return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago
    }

    // Sort sessions by date
    const sortedSessions = sessions
      .map(session => new Date(session.created_at || session.started_at))
      .sort((a, b) => b.getTime() - a.getTime());

    // Look for gaps of at least 24 hours between sessions
    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const current = sortedSessions[i];
      const next = sortedSessions[i + 1];
      const gapHours = (current.getTime() - next.getTime()) / (1000 * 60 * 60);

      if (gapHours >= 24) {
        return next.toISOString();
      }
    }

    // If no 24-hour break found, return start of oldest session
    return sortedSessions[sortedSessions.length - 1].toISOString();
  }

  /**
   * Get next occurrence of a specific hour in user's timezone
   * Handles timezone conversion and finds next available slot
   */
  private getNextTimeSlot(hour: number, timezone: string): string {
    const now = new Date();
    const zonedNow = utcToZonedTime(now, timezone);

    // Create target time for today
    const targetTime = new Date(zonedNow);
    targetTime.setHours(hour, 0, 0, 0);

    // If target time has passed today, use tomorrow
    if (targetTime <= zonedNow) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    // Convert back to UTC
    return zonedTimeToUtc(targetTime, timezone).toISOString();
  }

  /**
   * Get next occurrence of specific day and time
   * Finds the next instance of dayOfWeek at hourOfDay in user's timezone
   */
  private getNextOccurrenceOfTime(dayOfWeek: number, hourOfDay: number, timezone: string): Date {
    const now = new Date();
    const zonedNow = utcToZonedTime(now, timezone);

    const targetTime = new Date(zonedNow);
    targetTime.setHours(hourOfDay, 0, 0, 0);

    // Calculate days to add to reach target day of week
    const currentDay = zonedNow.getDay();
    let daysToAdd = dayOfWeek - currentDay;

    // If target day is today but time has passed, or target day is in the past
    if (daysToAdd < 0 || (daysToAdd === 0 && targetTime <= zonedNow)) {
      daysToAdd += 7; // Next week
    }

    targetTime.setDate(targetTime.getDate() + daysToAdd);

    // Convert back to UTC
    return zonedTimeToUtc(targetTime, timezone);
  }

  /**
   * Count notifications scheduled for a specific time
   * Prevents notification spam by checking density
   */
  private async getScheduledNotificationCount(userId: string, date: Date): Promise<number> {
    const startOfHour = new Date(date);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(endOfHour.getHours() + 1);

    const { count } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scheduled_for', startOfHour.toISOString())
      .lt('scheduled_for', endOfHour.toISOString())
      .is('sent_at', null);

    return count || 0;
  }

  /**
   * Find next available notification slot
   * Respects quiet hours and notification frequency limits
   */
  private async getNextAvailableSlot(userId: string, preferences: NotificationPreferences): Promise<string> {
    const now = new Date();
    const candidateTime = new Date(now.getTime() + 30 * 60 * 1000); // Start 30 minutes from now

    // Look for available slot in next 7 days
    for (let day = 0; day < 7; day++) {
      for (let hour = 6; hour < 23; hour++) { // Between 6 AM and 11 PM
        candidateTime.setHours(hour, 0, 0, 0);

        // Check if outside quiet hours
        if (!this.isInQuietHours(candidateTime, preferences)) {
          // Check notification density
          const count = await this.getScheduledNotificationCount(userId, candidateTime);
          if (count < preferences.frequency.maxDailyNotifications) {
            return candidateTime.toISOString();
          }
        }
      }
      candidateTime.setDate(candidateTime.getDate() + 1);
    }

    // Fallback: 24 hours from now
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }

  /**
   * Add notification to delivery queue
   * Handles queue management and retry logic
   */
  private async queueNotification(notification: Notification): Promise<void> {
    const queueItem: NotificationQueueItem = {
      id: crypto.randomUUID(),
      notification,
      retries: 0,
      maxRetries: 3,
      status: 'pending'
    };

    const { error } = await this.supabase
      .from('notification_queue')
      .insert({
        id: queueItem.id,
        notification_id: notification.id,
        status: queueItem.status,
        retries: queueItem.retries,
        max_retries: queueItem.maxRetries,
        tenant_id: '00000000-0000-0000-0000-000000000000' // Default tenant for now
      });

    if (error) {
      console.error('Failed to queue notification:', error);
      throw new Error(`Failed to queue notification: ${error.message}`);
    }
  }

  /**
   * Update user reminder rules
   * Manages custom reminder configurations and adaptive rules
   */
  private async updateReminderRules(userId: string, rules: Record<string, ReminderRule>): Promise<void> {
    const rulesToUpsert = Object.values(rules).map(rule => ({
      id: rule.id,
      user_id: userId,
      tenant_id: '00000000-0000-0000-0000-000000000000', // Default tenant for now
      name: rule.name,
      enabled: rule.enabled,
      trigger_type: rule.triggerType,
      conditions: rule.conditions,
      action_type: rule.action.type,
      action_template: rule.action.template,
      action_priority: rule.action.priority,
      action_channels: rule.action.channels,
      max_per_day: rule.frequency.maxPerDay,
      min_hours_between: rule.frequency.minHoursBetween,
      updated_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('reminder_rules')
      .upsert(rulesToUpsert, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Failed to update reminder rules:', error);
      throw new Error(`Failed to update reminder rules: ${error.message}`);
    }
  }
}