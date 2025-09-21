/**
 * Email Template Service
 * MELLOWISE-015: Integration service for loading and processing email templates
 */

import {
  loadTemplate,
  getBaseTemplateVariables,
  generateCTAButton,
  generateTrackingPixel,
  getTimeBasedGreeting,
  getMotivationalMessage,
  validateTemplateVariables,
  type BaseTemplateVariables,
  type StudyReminderVariables,
  type GoalDeadlineVariables,
  type StreakMaintenanceVariables,
  type AchievementVariables,
  type BreakReminderVariables,
  type PerformanceAlertVariables
} from './template-utils';

export interface EmailTemplateOptions {
  userId: string;
  userEmail: string;
  userName: string;
  trackingEnabled?: boolean;
  campaignId?: string;
}

/**
 * Email Template Service
 * Handles loading, processing, and rendering of all email templates
 */
export class EmailTemplateService {

  /**
   * Generate Study Reminder Email
   */
  static async generateStudyReminder(
    options: EmailTemplateOptions,
    data: Partial<StudyReminderVariables>
  ): Promise<string> {
    const baseVars = getBaseTemplateVariables(options.userEmail, options.userName);

    const variables: StudyReminderVariables = {
      ...baseVars,
      streak: data.streak || 0,
      todayGoal: data.todayGoal || 'Complete 10 practice questions',
      questionsRemaining: data.questionsRemaining || 10,
      motivationalMessage: data.motivationalMessage || getMotivationalMessage({
        streak: data.streak || 0,
        accuracy: 75,
        lastStudy: data.lastStudyDate
      }),
      studyUrl: data.studyUrl || `${baseVars.dashboardUrl}/practice`,
      greeting: getTimeBasedGreeting(options.userName),
      lastStudyDate: data.lastStudyDate,
      // Add tracking
      trackingPixel: options.trackingEnabled ?
        generateTrackingPixel(options.userId, 'study_reminder', options.campaignId) : '',
      // Additional template variables
      progressPercentage: data.progressPercentage,
      showStats: data.showStats,
      totalQuestions: data.totalQuestions,
      accuracy: data.accuracy,
      studyTime: data.studyTime,
      showTips: data.showTips,
      studyTip: data.studyTip,
      goalsUrl: `${baseVars.dashboardUrl}/goals`
    };

    // Validate required fields
    const requiredFields = ['userName', 'greeting', 'motivationalMessage', 'todayGoal'];
    if (!validateTemplateVariables(variables, requiredFields)) {
      throw new Error('Missing required fields for study reminder template');
    }

    return await loadTemplate('study-reminder', variables);
  }

  /**
   * Generate Goal Deadline Alert Email
   */
  static async generateGoalDeadline(
    options: EmailTemplateOptions,
    data: Partial<GoalDeadlineVariables>
  ): Promise<string> {
    const baseVars = getBaseTemplateVariables(options.userEmail, options.userName);

    const variables: GoalDeadlineVariables = {
      ...baseVars,
      goalTitle: data.goalTitle || 'Your Study Goal',
      daysRemaining: data.daysRemaining || 0,
      targetScore: data.targetScore || 160,
      currentScore: data.currentScore || 150,
      progressPercentage: data.progressPercentage || 75,
      urgencyLevel: data.urgencyLevel || 'medium',
      actionUrl: data.actionUrl || `${baseVars.dashboardUrl}/goals`,
      // Add tracking
      trackingPixel: options.trackingEnabled ?
        generateTrackingPixel(options.userId, 'goal_deadline', options.campaignId) : '',
      // Additional calculated variables
      scoreGap: (data.targetScore || 160) - (data.currentScore || 150)
    };

    const requiredFields = ['goalTitle', 'daysRemaining', 'targetScore', 'currentScore'];
    if (!validateTemplateVariables(variables, requiredFields)) {
      throw new Error('Missing required fields for goal deadline template');
    }

    return await loadTemplate('goal-deadline', variables);
  }

  /**
   * Generate Streak Maintenance Email
   */
  static async generateStreakMaintenance(
    options: EmailTemplateOptions,
    data: Partial<StreakMaintenanceVariables>
  ): Promise<string> {
    const baseVars = getBaseTemplateVariables(options.userEmail, options.userName);

    const variables: StreakMaintenanceVariables = {
      ...baseVars,
      streakCount: data.streakCount || 1,
      streakType: data.streakType || 'current',
      nextMilestone: data.nextMilestone || this.getNextStreakMilestone(data.streakCount || 1),
      lastActivity: data.lastActivity || 'yesterday',
      continueUrl: data.continueUrl || `${baseVars.dashboardUrl}/practice`,
      encouragementMessage: data.encouragementMessage || this.getStreakEncouragement(
        data.streakType || 'current',
        data.streakCount || 1
      ),
      // Add tracking
      trackingPixel: options.trackingEnabled ?
        generateTrackingPixel(options.userId, 'streak_maintenance', options.campaignId) : '',
      // Additional variables
      milestoneProgress: this.calculateMilestoneProgress(data.streakCount || 1, data.nextMilestone),
      totalPoints: data.totalPoints,
      streakDeadline: data.streakDeadline,
      dailyTarget: data.dailyTarget,
      hoursRemaining: data.hoursRemaining,
      minQuestions: data.minQuestions,
      showLeaderboard: data.showLeaderboard,
      leaderboardRank: data.leaderboardRank
    };

    const requiredFields = ['streakCount', 'streakType', 'encouragementMessage'];
    if (!validateTemplateVariables(variables, requiredFields)) {
      throw new Error('Missing required fields for streak maintenance template');
    }

    return await loadTemplate('streak-maintenance', variables);
  }

  /**
   * Generate Achievement Email
   */
  static async generateAchievement(
    options: EmailTemplateOptions,
    data: Partial<AchievementVariables>
  ): Promise<string> {
    const baseVars = getBaseTemplateVariables(options.userEmail, options.userName);

    const variables: AchievementVariables = {
      ...baseVars,
      achievementType: data.achievementType || 'milestone',
      achievementTitle: data.achievementTitle || 'Great Achievement!',
      achievementDescription: data.achievementDescription || 'You have reached a new milestone!',
      badgeUrl: data.badgeUrl || '',
      shareUrl: data.shareUrl || `${baseVars.dashboardUrl}/achievements/share`,
      nextGoalTitle: data.nextGoalTitle,
      statisticsUrl: data.statisticsUrl || `${baseVars.dashboardUrl}/analytics`,
      // Add tracking
      trackingPixel: options.trackingEnabled ?
        generateTrackingPixel(options.userId, 'achievement', options.campaignId) : '',
      // Additional variables
      showStats: data.showStats,
      totalAchievements: data.totalAchievements,
      questionsAnswered: data.questionsAnswered,
      studyDays: data.studyDays,
      accuracyRate: data.accuracyRate,
      rewards: data.rewards,
      achievementDate: data.achievementDate || new Date().toLocaleDateString()
    };

    const requiredFields = ['achievementType', 'achievementTitle', 'achievementDescription'];
    if (!validateTemplateVariables(variables, requiredFields)) {
      throw new Error('Missing required fields for achievement template');
    }

    return await loadTemplate('achievement', variables);
  }

  /**
   * Generate Break Reminder Email
   */
  static async generateBreakReminder(
    options: EmailTemplateOptions,
    data: Partial<BreakReminderVariables>
  ): Promise<string> {
    const baseVars = getBaseTemplateVariables(options.userEmail, options.userName);

    const variables: BreakReminderVariables = {
      ...baseVars,
      studyHoursToday: data.studyHoursToday || 2,
      studyStreak: data.studyStreak || 1,
      wellnessMessage: data.wellnessMessage || 'Taking breaks is essential for maintaining focus and preventing burnout. Your mind needs time to process and consolidate what you\'ve learned.',
      relaxationTips: data.relaxationTips || [
        'Take a 10-minute walk outside for fresh air',
        'Practice 5 minutes of deep breathing',
        'Drink water and do some light stretching',
        'Rest your eyes with the 20-20-20 rule',
        'Listen to calming music or sounds',
        'Enjoy a healthy snack or herbal tea'
      ],
      resumeStudyTime: data.resumeStudyTime,
      // Add tracking
      trackingPixel: options.trackingEnabled ?
        generateTrackingPixel(options.userId, 'break_reminder', options.campaignId) : '',
      // Additional variables
      questionsCompleted: data.questionsCompleted
    };

    const requiredFields = ['studyHoursToday', 'wellnessMessage'];
    if (!validateTemplateVariables(variables, requiredFields)) {
      throw new Error('Missing required fields for break reminder template');
    }

    return await loadTemplate('break-reminder', variables);
  }

  /**
   * Generate Performance Alert Email
   */
  static async generatePerformanceAlert(
    options: EmailTemplateOptions,
    data: Partial<PerformanceAlertVariables>
  ): Promise<string> {
    const baseVars = getBaseTemplateVariables(options.userEmail, options.userName);

    const variables: PerformanceAlertVariables = {
      ...baseVars,
      performanceChange: data.performanceChange || 'stable',
      accuracyChange: data.accuracyChange || 0,
      strengthAreas: data.strengthAreas || [],
      improvementAreas: data.improvementAreas || [],
      recommendedActions: data.recommendedActions || this.getDefaultRecommendations(data.performanceChange || 'stable'),
      insightsUrl: data.insightsUrl || `${baseVars.dashboardUrl}/analytics`,
      // Add tracking
      trackingPixel: options.trackingEnabled ?
        generateTrackingPixel(options.userId, 'performance_alert', options.campaignId) : '',
      // Additional variables
      weeklyProgress: data.weeklyProgress,
      scheduleOptimization: data.scheduleOptimization,
      optimalTimes: data.optimalTimes
    };

    const requiredFields = ['performanceChange', 'accuracyChange'];
    if (!validateTemplateVariables(variables, requiredFields)) {
      throw new Error('Missing required fields for performance alert template');
    }

    return await loadTemplate('performance-alert', variables);
  }

  /**
   * Helper method to get next streak milestone
   */
  private static getNextStreakMilestone(currentStreak: number): number {
    const milestones = [7, 14, 30, 60, 100, 365];
    return milestones.find(milestone => milestone > currentStreak) || currentStreak + 30;
  }

  /**
   * Helper method to calculate milestone progress
   */
  private static calculateMilestoneProgress(currentStreak: number, nextMilestone?: number): number {
    if (!nextMilestone) return 0;

    const previousMilestone = this.getPreviousMilestone(nextMilestone);
    const range = nextMilestone - previousMilestone;
    const progress = currentStreak - previousMilestone;

    return Math.round((progress / range) * 100);
  }

  /**
   * Helper method to get previous milestone
   */
  private static getPreviousMilestone(milestone: number): number {
    const milestones = [0, 7, 14, 30, 60, 100, 365];
    const index = milestones.indexOf(milestone);
    return index > 0 ? milestones[index - 1] : 0;
  }

  /**
   * Helper method to get streak encouragement message
   */
  private static getStreakEncouragement(streakType: string, streakCount: number): string {
    switch (streakType) {
      case 'current':
        if (streakCount >= 30) {
          return 'You\'re absolutely crushing it! This level of consistency is what separates good students from great ones.';
        } else if (streakCount >= 7) {
          return 'One week strong! You\'re building the kind of habits that lead to exam success.';
        } else {
          return 'Every day counts! You\'re building momentum that will pay off on test day.';
        }

      case 'at_risk':
        return `Your ${streakCount}-day streak is valuable! Don't let it slip away - just a few questions can keep your momentum alive.`;

      case 'broken':
        return 'Every expert has faced setbacks. What makes them different is how quickly they get back on track. Today is your fresh start!';

      default:
        return 'Consistency is the key to mastering any skill. Keep pushing forward!';
    }
  }

  /**
   * Helper method to get default performance recommendations
   */
  private static getDefaultRecommendations(performanceChange: string): string[] {
    switch (performanceChange) {
      case 'improved':
        return [
          'Continue with your current study approach - it\'s working!',
          'Consider increasing practice difficulty to maintain challenge',
          'Focus on maintaining consistency in your strongest areas',
          'Set new, more ambitious goals to keep pushing forward'
        ];

      case 'declined':
        return [
          'Review your recent study sessions to identify patterns',
          'Focus on understanding concepts rather than speed',
          'Consider taking more frequent breaks to maintain focus',
          'Reach out for help on challenging topics',
          'Adjust your study schedule if needed'
        ];

      default:
        return [
          'Maintain your current study routine for consistency',
          'Identify specific areas where you can push for improvement',
          'Try mixing up your study methods to stay engaged',
          'Set micro-goals to create momentum for bigger gains'
        ];
    }
  }

  /**
   * Get all available template types
   */
  static getAvailableTemplates(): string[] {
    return [
      'study-reminder',
      'goal-deadline',
      'streak-maintenance',
      'achievement',
      'break-reminder',
      'performance-alert'
    ];
  }

  /**
   * Generate template with CTA button tracking
   */
  static generateTrackedCTA(
    text: string,
    url: string,
    userId: string,
    emailType: string,
    buttonType: 'primary' | 'secondary' = 'primary'
  ): string {
    return generateCTAButton(text, url, userId, emailType, buttonType);
  }

  /**
   * Validate template data before processing
   */
  static validateTemplateData(templateType: string, data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (templateType) {
      case 'study-reminder':
        if (!data.todayGoal) errors.push('todayGoal is required');
        if (data.streak && typeof data.streak !== 'number') errors.push('streak must be a number');
        break;

      case 'goal-deadline':
        if (!data.goalTitle) errors.push('goalTitle is required');
        if (typeof data.daysRemaining !== 'number') errors.push('daysRemaining must be a number');
        if (typeof data.targetScore !== 'number') errors.push('targetScore must be a number');
        if (typeof data.currentScore !== 'number') errors.push('currentScore must be a number');
        break;

      case 'streak-maintenance':
        if (typeof data.streakCount !== 'number') errors.push('streakCount must be a number');
        if (!['current', 'at_risk', 'broken'].includes(data.streakType)) {
          errors.push('streakType must be current, at_risk, or broken');
        }
        break;

      case 'achievement':
        if (!data.achievementTitle) errors.push('achievementTitle is required');
        if (!data.achievementDescription) errors.push('achievementDescription is required');
        break;

      case 'break-reminder':
        if (typeof data.studyHoursToday !== 'number') errors.push('studyHoursToday must be a number');
        break;

      case 'performance-alert':
        if (!['improved', 'declined', 'stable'].includes(data.performanceChange)) {
          errors.push('performanceChange must be improved, declined, or stable');
        }
        if (typeof data.accuracyChange !== 'number') errors.push('accuracyChange must be a number');
        break;

      default:
        errors.push(`Unknown template type: ${templateType}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}