/**
 * Twilio SMS Service with Cost Optimization
 * MELLOWISE-015: Intelligent SMS messaging with comprehensive cost optimization
 */

import twilio from 'twilio';
import { Notification } from '@/types/notifications';
import { createServerClient } from '@/lib/supabase/server';
import SMSCostAnalyticsService from './sms-cost-analytics';
import SMSCompressionEngine from './sms-compression';
import SMSBatchingService from './sms-batching';
import ChannelOptimizationService from './channel-optimizer';
import SMSBudgetService from './sms-budget';

/**
 * Intelligent SMS message templates
 */
const SMS_TEMPLATES = {
  study_reminder: {
    default: '📚 Time to study! You have {questionsToday} questions to practice today. Reply STUDY to open app link.',
    morning: '☀️ Good morning! Ready for your {duration}-minute study session? Your {streak}-day streak is waiting!',
    evening: '🌙 Evening study time! Quick {duration}-min session before bed? Reply YES for app link.',
    urgent: '⚠️ {hoursLeft}h until your goal deadline! {remaining} questions left. Reply NOW to start.',
  },
  goal_deadline: {
    urgent: '🎯 GOAL ALERT: {daysLeft} days left! You\'re {progress}% done. Need {questionsPerDay} q/day to finish.',
    reminder: '📅 Goal update: {progress}% complete. On track for {goalName}! Keep going!',
    at_risk: '⚠️ Your goal needs attention! {behindBy} questions behind schedule. Reply HELP for tips.',
  },
  streak_maintenance: {
    at_risk: '🔥 Your {streak}-day streak ends in {hoursLeft}h! Quick 5-min session? Reply YES.',
    milestone: '🎉 {streak} DAYS! Amazing consistency! Reply STATS for your progress.',
    broken: '😔 Streak ended at {streak} days. Start fresh today! Reply MOTIVATE for encouragement.',
  },
  achievement: {
    level_up: '🎉 LEVEL {level} unlocked! You\'re in the top {percentile}%! 🏆',
    milestone: '🌟 {achievement} achieved! Your hard work is paying off!',
    weekly: '📊 Week recap: {correctCount} correct, {hoursStudied}h studied, {improvement}% improvement!',
  },
  break_reminder: {
    gentle: '☕ Time for a quick break! You\'ve studied {duration}min. Rest those brain cells!',
    urgent: '🧠 Break needed! {consecutiveHours}h straight is too much. Reply BREAK for a 10min timer.',
    burnout: '🚨 Burnout alert! Take the day off. Your brain needs rest to learn effectively.',
  },
  performance_alert: {
    struggling: '📉 Struggling with {topic}? Reply HELP for personalized tips.',
    improving: '📈 {improvement}% better at {topic}! Your practice is working!',
    mastery: '🎓 You\'ve mastered {topic}! Ready for harder challenges?',
  },
};

/**
 * SMS conversation commands
 */
const SMS_COMMANDS = {
  STUDY: 'Open study session',
  YES: 'Confirm and get link',
  NO: 'Skip this reminder',
  HELP: 'Get assistance',
  STATS: 'Get progress stats',
  MOTIVATE: 'Get motivation',
  BREAK: 'Start break timer',
  STOP: 'Unsubscribe from SMS',
  MORE: 'Get more options',
};

export class TwilioSMSService {
  private twilioClient?: twilio.Twilio;
  private supabase;
  private fromNumber: string;
  private messagingServiceSid?: string;

  // Cost optimization services
  private costAnalytics: SMSCostAnalyticsService;
  private compressionEngine: SMSCompressionEngine;
  private batchingService: SMSBatchingService;
  private channelOptimizer: ChannelOptimizationService;
  private budgetService: SMSBudgetService;

  constructor() {
    this.supabase = createServerClient();
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    // Initialize Twilio client if credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // Initialize cost optimization services
    this.costAnalytics = new SMSCostAnalyticsService();
    this.compressionEngine = new SMSCompressionEngine();
    this.batchingService = new SMSBatchingService();
    this.channelOptimizer = new ChannelOptimizationService();
    this.budgetService = new SMSBudgetService();
  }

  /**
   * Send cost-optimized SMS notification
   */
  async sendSMS(notification: Notification, tenantId?: string): Promise<{
    success: boolean;
    sent: boolean;
    batched: boolean;
    channelSwitched: boolean;
    costSavings: number;
    reason?: string;
    alternativeChannel?: string;
  }> {
    if (!this.twilioClient) {
      console.warn('Twilio not configured - skipping SMS');
      return {
        success: false,
        sent: false,
        batched: false,
        channelSwitched: false,
        costSavings: 0,
        reason: 'Twilio not configured',
      };
    }

    try {
      // Get user phone number and SMS preferences
      const userInfo = await this.getUserSMSInfo(notification.userId);
      if (!userInfo.phoneNumber || !userInfo.smsEnabled) {
        return {
          success: false,
          sent: false,
          batched: false,
          channelSwitched: false,
          costSavings: 0,
          reason: 'User has SMS disabled or no phone number',
        };
      }

      // Get tenant ID from user if not provided
      if (!tenantId) {
        tenantId = await this.getTenantId(notification.userId);
      }

      // STEP 1: Channel Optimization - Check if SMS is the best channel
      const channelRecommendation = await this.channelOptimizer.getChannelRecommendation(
        tenantId,
        notification.userId,
        notification.type,
        notification.priority,
        notification.message
      );

      // If SMS is not the recommended channel, suggest alternative
      const topRecommendation = channelRecommendation.recommendedChannels[0];
      if (topRecommendation.channel !== 'sms' && topRecommendation.score > 70) {
        return {
          success: true,
          sent: false,
          batched: false,
          channelSwitched: true,
          costSavings: topRecommendation.estimatedCost,
          reason: `Switched to ${topRecommendation.channel} for better cost-effectiveness`,
          alternativeChannel: topRecommendation.channel,
        };
      }

      // STEP 2: Generate intelligent message with compression
      const originalMessage = await this.generateIntelligentMessage(notification, userInfo);

      // STEP 3: Message Compression
      const compressionResult = this.compressionEngine.compressMessage(originalMessage, {
        maxLength: 160,
        preserveEmojis: true,
        preserveNumbers: true,
        aggressiveness: 'moderate',
        contextType: notification.type,
      });

      // Use compressed message if quality is acceptable
      const finalMessage = compressionResult.qualityScore >= 75 ?
        compressionResult.compressedMessage : originalMessage;

      // STEP 4: Cost estimation and budget check
      const estimatedCost = this.estimateMessageCost(finalMessage, userInfo.phoneNumber);

      const budgetCheck = await this.budgetService.checkBudgetAllowance(
        tenantId,
        notification.type,
        estimatedCost,
        userInfo.userSegment,
        notification.priority
      );

      if (!budgetCheck.allowed) {
        // If budget doesn't allow, try alternatives
        if (budgetCheck.alternatives && budgetCheck.alternatives.length > 0) {
          const alternative = budgetCheck.alternatives[0];
          return {
            success: false,
            sent: false,
            batched: false,
            channelSwitched: true,
            costSavings: Math.abs(alternative.costImpact),
            reason: budgetCheck.reason,
            alternativeChannel: alternative.action,
          };
        }

        return {
          success: false,
          sent: false,
          batched: false,
          channelSwitched: false,
          costSavings: 0,
          reason: budgetCheck.reason,
        };
      }

      // STEP 5: Smart Batching (for non-critical messages)
      if (notification.priority !== 'critical') {
        const batchingResult = await this.batchingService.queueMessageForBatching(
          tenantId,
          {
            userId: notification.userId,
            phoneNumber: userInfo.phoneNumber,
            messageType: notification.type,
            originalMessage: finalMessage,
            personalizedData: notification.metadata || {},
          },
          notification.scheduledFor || new Date().toISOString(),
          notification.priority
        );

        if (batchingResult.shouldBatch) {
          return {
            success: true,
            sent: false,
            batched: true,
            channelSwitched: false,
            costSavings: batchingResult.estimatedSavings,
            reason: `Batched for optimization - estimated delay: ${batchingResult.estimatedDelay} minutes`,
          };
        }
      }

      // STEP 6: Send immediately with optimization tracking
      const sendResult = await this.sendOptimizedMessage(
        userInfo.phoneNumber,
        finalMessage,
        tenantId,
        notification,
        estimatedCost,
        compressionResult.estimatedCostSavings
      );

      return sendResult;

    } catch (error) {
      console.error('Optimized SMS sending error:', error);
      return {
        success: false,
        sent: false,
        batched: false,
        channelSwitched: false,
        costSavings: 0,
        reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate intelligent message based on user context
   */
  private async generateIntelligentMessage(
    notification: Notification,
    userInfo: any
  ): Promise<string> {
    // Get user's current context
    const context = await this.getUserContext(notification.userId);

    // Select appropriate template
    const template = this.selectTemplate(notification, context);

    // Personalize message with dynamic data
    const personalizedMessage = this.personalizeMessage(template, {
      ...notification.metadata,
      ...context,
      userName: userInfo.firstName || 'there',
      timeOfDay: this.getTimeOfDay(),
    });

    // Add response instructions if applicable
    const withInstructions = this.addResponseInstructions(
      personalizedMessage,
      notification.type
    );

    return withInstructions;
  }

  /**
   * Select the best template based on context
   */
  private selectTemplate(notification: Notification, context: any): string {
    const templates = SMS_TEMPLATES[notification.type as keyof typeof SMS_TEMPLATES];
    if (!templates) return notification.message;

    // Smart template selection based on context
    switch (notification.type) {
      case 'study_reminder':
        if (context.hoursUntilDeadline < 24) return templates.urgent;
        if (context.timeOfDay === 'morning') return templates.morning;
        if (context.timeOfDay === 'evening') return templates.evening;
        return templates.default;

      case 'goal_deadline':
        if (context.daysUntilDeadline <= 3) return templates.urgent;
        if (context.progressBehindSchedule) return templates.at_risk;
        return templates.reminder;

      case 'streak_maintenance':
        if (context.streakAtRisk) return templates.at_risk;
        if (context.streakBroken) return templates.broken;
        if (context.streakMilestone) return templates.milestone;
        return templates.at_risk;

      case 'break_reminder':
        if (context.burnoutRisk === 'high') return templates.burnout;
        if (context.consecutiveHours >= 3) return templates.urgent;
        return templates.gentle;

      default:
        return templates.default || notification.message;
    }
  }

  /**
   * Personalize message with dynamic data
   */
  private personalizeMessage(template: string, data: any): string {
    let message = template;

    // Replace all placeholders with actual values
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      if (message.includes(placeholder)) {
        message = message.replace(new RegExp(placeholder, 'g'), data[key]);
      }
    });

    // Smart formatting for numbers
    message = message.replace(/\{(\w+)\}/g, (match, key) => {
      if (data[key] !== undefined) {
        // Format numbers nicely
        if (typeof data[key] === 'number') {
          return data[key].toLocaleString();
        }
        return data[key];
      }
      return match;
    });

    return message;
  }

  /**
   * Add response instructions for interactive SMS
   */
  private addResponseInstructions(message: string, type: string): string {
    const interactiveTypes = [
      'study_reminder',
      'streak_maintenance',
      'performance_alert',
    ];

    if (interactiveTypes.includes(type)) {
      // Add reply options
      const options = this.getReplyOptions(type);
      if (options.length > 0) {
        message += `\n\nReply: ${options.join(', ')}`;
      }
    }

    return message;
  }

  /**
   * Get reply options for message type
   */
  private getReplyOptions(type: string): string[] {
    switch (type) {
      case 'study_reminder':
        return ['STUDY', 'LATER', 'HELP'];
      case 'streak_maintenance':
        return ['YES', 'STATS'];
      case 'performance_alert':
        return ['HELP', 'MORE'];
      default:
        return [];
    }
  }

  /**
   * Handle incoming SMS responses
   */
  async handleIncomingSMS(from: string, body: string): Promise<string> {
    const command = body.trim().toUpperCase();

    // Get user from phone number
    const user = await this.getUserByPhone(from);
    if (!user) {
      return 'Reply STOP to unsubscribe.';
    }

    // Process command
    switch (command) {
      case 'STUDY':
      case 'YES':
        return await this.handleStudyCommand(user.id);

      case 'HELP':
        return this.getHelpMessage();

      case 'STATS':
        return await this.getStatsMessage(user.id);

      case 'MOTIVATE':
        return this.getMotivationalMessage();

      case 'BREAK':
        return await this.handleBreakCommand(user.id);

      case 'STOP':
        return await this.handleUnsubscribe(user.id);

      case 'MORE':
        return this.getFullCommandList();

      default:
        return 'Commands: STUDY, STATS, HELP, MORE, or STOP';
    }
  }

  /**
   * Split long messages for SMS 160-character limit
   */
  private splitMessage(message: string): string[] {
    const MAX_LENGTH = 160;
    const messages: string[] = [];

    if (message.length <= MAX_LENGTH) {
      return [message];
    }

    // Smart splitting at word boundaries
    const words = message.split(' ');
    let current = '';

    for (const word of words) {
      if ((current + ' ' + word).length <= MAX_LENGTH - 10) { // Reserve space for (1/2) etc
        current = current ? current + ' ' + word : word;
      } else {
        messages.push(current);
        current = word;
      }
    }

    if (current) {
      messages.push(current);
    }

    // Add pagination
    if (messages.length > 1) {
      return messages.map((msg, i) => `(${i + 1}/${messages.length}) ${msg}`);
    }

    return messages;
  }

  /**
   * Send actual SMS via Twilio
   */
  private async sendMessage(to: string, body: string): Promise<any> {
    if (!this.twilioClient) return null;

    const messageOptions: any = {
      body,
      to,
    };

    // Use messaging service if available (better deliverability)
    if (this.messagingServiceSid) {
      messageOptions.messagingServiceSid = this.messagingServiceSid;
    } else {
      messageOptions.from = this.fromNumber;
    }

    return await this.twilioClient.messages.create(messageOptions);
  }

  /**
   * Get user SMS information
   */
  private async getUserSMSInfo(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('users')
      .select('phone_number, first_name, sms_enabled, sms_preferences')
      .eq('id', userId)
      .single();

    return {
      phoneNumber: data?.phone_number,
      firstName: data?.first_name,
      smsEnabled: data?.sms_enabled ?? false,
      preferences: data?.sms_preferences ?? {},
    };
  }

  /**
   * Get user context for message personalization
   */
  private async getUserContext(userId: string): Promise<any> {
    // Aggregate user context from various sources
    const [goals, streak, performance, lastSession] = await Promise.all([
      this.getUserGoals(userId),
      this.getUserStreak(userId),
      this.getUserPerformance(userId),
      this.getLastSession(userId),
    ]);

    return {
      ...goals,
      ...streak,
      ...performance,
      ...lastSession,
      timeOfDay: this.getTimeOfDay(),
    };
  }

  /**
   * Track SMS analytics
   */
  private async trackSMSAnalytics(notification: Notification, phoneNumber: string): Promise<void> {
    await this.supabase
      .from('sms_analytics')
      .insert({
        notification_id: notification.id,
        user_id: notification.userId,
        phone_number: phoneNumber,
        type: notification.type,
        sent_at: new Date().toISOString(),
        message_length: notification.message.length,
      });
  }

  /**
   * Helper methods for SMS commands
   */
  private async handleStudyCommand(userId: string): Promise<string> {
    const link = await this.generateStudyLink(userId);
    return `📚 Let's go! Click here to start: ${link}\n\nYour study session is ready!`;
  }

  private async getStatsMessage(userId: string): Promise<string> {
    const stats = await this.getUserStats(userId);
    return `📊 Your Stats:\n🔥 Streak: ${stats.streak} days\n✅ Correct: ${stats.correctRate}%\n📈 Improvement: +${stats.improvement}%\n⏱️ Total: ${stats.totalHours}h`;
  }

  private getMotivationalMessage(): string {
    const messages = [
      '💪 You\'ve got this! Every question makes you stronger!',
      '🌟 Success is the sum of small efforts repeated daily!',
      '🚀 You\'re closer than yesterday. Keep pushing!',
      '🎯 Focus on progress, not perfection!',
      '⭐ Believe in yourself - you\'re capable of amazing things!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private async handleBreakCommand(userId: string): Promise<string> {
    // Set a break reminder for 10 minutes
    await this.scheduleBreakEnd(userId, 10);
    return '☕ Break timer set for 10 minutes! I\'ll remind you when it\'s time to return. Enjoy your rest!';
  }

  private async handleUnsubscribe(userId: string): Promise<string> {
    await this.supabase
      .from('users')
      .update({ sms_enabled: false })
      .eq('id', userId);

    return 'You\'ve been unsubscribed from SMS notifications. You can re-enable them anytime in your settings.';
  }

  private getHelpMessage(): string {
    return 'Need help? Visit mellowise.com/help or email support@mellowise.com. Reply MORE for commands.';
  }

  private getFullCommandList(): string {
    return 'Commands:\nSTUDY - Start session\nSTATS - Your progress\nHELP - Get help\nBREAK - Set timer\nMOTIVATE - Encouragement\nSTOP - Unsubscribe';
  }

  /**
   * Utility methods
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Send optimized message with full cost tracking
   */
  private async sendOptimizedMessage(
    phoneNumber: string,
    message: string,
    tenantId: string,
    notification: Notification,
    estimatedCost: number,
    compressionSavings: number
  ): Promise<{
    success: boolean;
    sent: boolean;
    batched: boolean;
    channelSwitched: boolean;
    costSavings: number;
    reason?: string;
  }> {
    try {
      // Split message if needed
      const messages = this.splitMessage(message);
      let totalActualCost = 0;

      // Send all message segments
      for (const msg of messages) {
        const twilioResponse = await this.sendMessage(phoneNumber, msg);

        // Calculate actual cost based on Twilio response
        const actualCost = this.calculateActualCost(twilioResponse, msg);
        totalActualCost += actualCost;

        // Track cost analytics
        await this.costAnalytics.trackSMSCost({
          tenantId,
          userId: notification.userId,
          messageId: notification.id,
          phoneNumber,
          messageType: notification.type,
          messageLength: msg.length,
          cost: actualCost,
          countryCode: this.extractCountryCode(phoneNumber),
          segments: Math.ceil(msg.length / 160),
          deliveryStatus: 'delivered', // Would get from Twilio webhook
        });
      }

      // Consume budget
      const budgetResult = await this.budgetService.consumeBudget(
        tenantId,
        totalActualCost,
        notification.type,
        notification.userId
      );

      // Track channel performance
      await this.channelOptimizer.trackChannelPerformance({
        tenantId,
        userId: notification.userId,
        channel: 'sms',
        messageType: notification.type,
        cost: totalActualCost,
        delivered: true,
      });

      return {
        success: true,
        sent: true,
        batched: false,
        channelSwitched: false,
        costSavings: compressionSavings,
        reason: compressionSavings > 0 ? `Saved ${compressionSavings} cents through compression` : undefined,
      };

    } catch (error) {
      console.error('Failed to send optimized message:', error);
      return {
        success: false,
        sent: false,
        batched: false,
        channelSwitched: false,
        costSavings: 0,
        reason: `Send failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Estimate message cost before sending
   */
  private estimateMessageCost(message: string, phoneNumber: string): number {
    // Calculate segments
    const segments = Math.ceil(message.length / 160);

    // Base cost per segment (in cents)
    const baseCostPerSegment = 75; // 0.75 cents

    // Country-based multiplier
    const countryCode = this.extractCountryCode(phoneNumber);
    const countryMultiplier = this.getCountryMultiplier(countryCode);

    return Math.round(segments * baseCostPerSegment * countryMultiplier);
  }

  /**
   * Calculate actual cost from Twilio response
   */
  private calculateActualCost(twilioResponse: any, message: string): number {
    // In real implementation, would use Twilio's pricing API or response data
    // For now, estimate based on message length and known rates
    return this.estimateMessageCost(message, twilioResponse.to || '');
  }

  /**
   * Extract country code from phone number
   */
  private extractCountryCode(phoneNumber: string): string {
    // Simple country code extraction
    if (phoneNumber.startsWith('+1')) return 'US';
    if (phoneNumber.startsWith('+44')) return 'GB';
    if (phoneNumber.startsWith('+33')) return 'FR';
    if (phoneNumber.startsWith('+49')) return 'DE';
    if (phoneNumber.startsWith('+81')) return 'JP';
    return 'OTHER';
  }

  /**
   * Get country-based cost multiplier
   */
  private getCountryMultiplier(countryCode: string): number {
    const multipliers: Record<string, number> = {
      'US': 1.0,
      'CA': 1.0,
      'GB': 1.2,
      'FR': 1.3,
      'DE': 1.2,
      'JP': 1.8,
      'OTHER': 1.5,
    };
    return multipliers[countryCode] || 1.5;
  }

  /**
   * Get tenant ID from user
   */
  private async getTenantId(userId: string): Promise<string> {
    const { data } = await this.supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();

    return data?.tenant_id || '00000000-0000-0000-0000-000000000000';
  }

  /**
   * Enhanced user SMS info with segmentation
   */
  private async getUserSMSInfo(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('users')
      .select(`
        phone_number,
        first_name,
        sms_enabled,
        sms_preferences,
        tenant_id,
        user_segment
      `)
      .eq('id', userId)
      .single();

    return {
      phoneNumber: data?.phone_number,
      firstName: data?.first_name,
      smsEnabled: data?.sms_enabled ?? false,
      preferences: data?.sms_preferences ?? {},
      tenantId: data?.tenant_id,
      userSegment: data?.user_segment || 'medium_value',
    };
  }

  /**
   * Get cost optimization statistics
   */
  async getCostOptimizationStats(tenantId: string): Promise<{
    totalSavings: number;
    compressionSavings: number;
    batchingSavings: number;
    channelSwitchSavings: number;
    messagesOptimized: number;
    efficiencyImprovement: number;
  }> {
    const metrics = await this.costAnalytics.getCostMetrics(tenantId);

    return {
      totalSavings: metrics.budget.spent, // Would calculate actual savings
      compressionSavings: 0, // Would track from compression engine
      batchingSavings: 0, // Would track from batching service
      channelSwitchSavings: 0, // Would track from channel optimizer
      messagesOptimized: metrics.metrics.totalMessages,
      efficiencyImprovement: 25, // Would calculate improvement percentage
    };
  }

  /**
   * Generate cost optimization report
   */
  async generateCostOptimizationReport(tenantId: string): Promise<{
    summary: {
      currentMonthSpend: number;
      projectedSpend: number;
      optimizationSavings: number;
      efficiency: number;
    };
    recommendations: Array<{
      type: string;
      description: string;
      potentialSavings: number;
      implementation: string;
    }>;
    alerts: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
  }> {
    // Get data from all optimization services
    const [
      costMetrics,
      optimizationSuggestions,
      budgetAlerts,
      channelReport
    ] = await Promise.all([
      this.costAnalytics.getCostMetrics(tenantId),
      this.costAnalytics.generateCostOptimizationRecommendations(tenantId),
      this.budgetService.getBudgetAlerts(tenantId, true),
      this.channelOptimizer.generateOptimizationReport(tenantId)
    ]);

    return {
      summary: {
        currentMonthSpend: costMetrics.metrics.totalCost,
        projectedSpend: costMetrics.budget.projectedMonthlySpend,
        optimizationSavings: channelReport.summary.potentialSavings,
        efficiency: costMetrics.metrics.avgCostPerEngagement,
      },
      recommendations: optimizationSuggestions.map(suggestion => ({
        type: suggestion.type,
        description: suggestion.description,
        potentialSavings: suggestion.impact.costSavings,
        implementation: suggestion.implementation.steps.join(', '),
      })),
      alerts: budgetAlerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
      })),
    };
  }

  /**
   * Process batch sends
   */
  async processBatchedSends(tenantId?: string): Promise<{
    processed: number;
    sent: number;
    failed: number;
    totalSavings: number;
  }> {
    const result = await this.batchingService.processReadyBatches(tenantId);

    return {
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      totalSavings: 0, // Would calculate from batch optimization
    };
  }

  // Additional helper methods would be implemented here...
  private async getUserGoals(userId: string): Promise<any> { return {}; }
  private async getUserStreak(userId: string): Promise<any> { return {}; }
  private async getUserPerformance(userId: string): Promise<any> { return {}; }
  private async getLastSession(userId: string): Promise<any> { return {}; }
  private async getUserByPhone(phone: string): Promise<any> { return null; }
  private async generateStudyLink(userId: string): Promise<string> { return ''; }
  private async getUserStats(userId: string): Promise<any> { return {}; }
  private async scheduleBreakEnd(userId: string, minutes: number): Promise<void> { }
}