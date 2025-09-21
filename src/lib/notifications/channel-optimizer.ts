/**
 * Channel Optimization Service
 * MELLOWISE-015: Multi-channel cost comparison and intelligent channel switching
 */

import { createServerClient } from '@/lib/supabase/server';
import { NotificationChannel, NotificationType, NotificationPriority } from '@/types/notifications';
import { addDays, differenceInHours, format, parseISO } from 'date-fns';

/**
 * Channel optimization types and interfaces
 */
export interface ChannelCostMetrics {
  channel: NotificationChannel;
  costPerMessage: number; // USD cents
  costPerEngagement: number; // USD cents
  deliveryRate: number; // 0-100
  engagementRate: number; // 0-100
  averageResponseTime: number; // minutes
  reliability: number; // 0-100
  userSatisfaction: number; // 0-100
}

export interface ChannelRecommendation {
  userId: string;
  messageType: NotificationType;
  priority: NotificationPriority;
  recommendedChannels: Array<{
    channel: NotificationChannel;
    score: number; // 0-100
    reasoning: string;
    estimatedCost: number;
    estimatedEngagement: number;
    fallbackOrder: number;
  }>;
  costSavings: {
    currentCost: number;
    optimizedCost: number;
    savingsAmount: number;
    savingsPercentage: number;
  };
  engagementImprovement: {
    currentEngagement: number;
    optimizedEngagement: number;
    improvementPercentage: number;
  };
}

export interface ChannelSwitchingRules {
  tenantId: string;
  rules: Array<{
    id: string;
    name: string;
    enabled: boolean;
    conditions: {
      userSegment?: string[];
      messageType?: NotificationType[];
      priority?: NotificationPriority[];
      timeOfDay?: { start: string; end: string };
      costThreshold?: number;
      engagementThreshold?: number;
    };
    action: {
      preferredChannels: NotificationChannel[];
      fallbackChannels: NotificationChannel[];
      costLimit?: number;
    };
    priority: number;
  }>;
  globalSettings: {
    enableAutomaticSwitching: boolean;
    maxCostPerMessage: number;
    minEngagementRate: number;
    fallbackDelay: number; // minutes
  };
}

export interface ChannelPerformanceData {
  channel: NotificationChannel;
  userId: string;
  period: string; // YYYY-MM
  metrics: {
    messagesSent: number;
    messagesDelivered: number;
    messagesOpened: number;
    messagesClicked: number;
    totalCost: number;
    averageResponseTime: number;
  };
  engagement: {
    openRate: number;
    clickRate: number;
    responseRate: number;
    conversionRate: number;
  };
  reliability: {
    deliverySuccessRate: number;
    avgDeliveryTime: number; // minutes
    failureReasons: Record<string, number>;
  };
}

export interface ChannelOptimizationReport {
  tenantId: string;
  period: string;
  summary: {
    totalCost: number;
    potentialSavings: number;
    currentEngagement: number;
    optimizedEngagement: number;
    messagesAnalyzed: number;
    recommendationsGenerated: number;
  };
  channelBreakdown: Record<NotificationChannel, {
    usage: number;
    cost: number;
    engagement: number;
    efficiency: number; // cost per engagement
  }>;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  optimization: {
    topSavingOpportunities: Array<{
      description: string;
      potentialSavings: number;
      implementation: string;
    }>;
    performanceImprovements: Array<{
      description: string;
      expectedImprovement: number;
      effort: 'low' | 'medium' | 'high';
    }>;
  };
}

/**
 * Channel Optimization Service
 * Intelligently routes notifications to the most cost-effective and engaging channels
 */
export class ChannelOptimizationService {
  private supabase;
  private channelCosts: Map<NotificationChannel, number>;
  private channelCapabilities: Map<NotificationChannel, string[]>;

  constructor() {
    this.supabase = createServerClient();
    this.channelCosts = this.initializeChannelCosts();
    this.channelCapabilities = this.initializeChannelCapabilities();
  }

  /**
   * Get optimal channel recommendation for a message
   */
  async getChannelRecommendation(
    tenantId: string,
    userId: string,
    messageType: NotificationType,
    priority: NotificationPriority,
    messageContent: string
  ): Promise<ChannelRecommendation> {
    // Get user's channel performance history
    const channelPerformance = await this.getUserChannelPerformance(userId);

    // Get tenant's channel switching rules
    const switchingRules = await this.getChannelSwitchingRules(tenantId);

    // Get current channel costs and metrics
    const channelMetrics = await this.getChannelMetrics(tenantId);

    // Calculate user engagement scores per channel
    const userEngagement = await this.getUserEngagementByChannel(userId);

    // Score each channel
    const channelScores = this.calculateChannelScores({
      channelPerformance,
      channelMetrics,
      userEngagement,
      messageType,
      priority,
      messageContent,
      switchingRules,
    });

    // Sort by score and generate recommendations
    const recommendedChannels = channelScores
      .sort((a, b) => b.score - a.score)
      .map((channel, index) => ({
        ...channel,
        fallbackOrder: index + 1,
      }));

    // Calculate cost and engagement comparisons
    const currentChannels = await this.getCurrentUserChannels(userId);
    const costSavings = this.calculateCostSavings(currentChannels, recommendedChannels);
    const engagementImprovement = this.calculateEngagementImprovement(
      userEngagement,
      recommendedChannels
    );

    return {
      userId,
      messageType,
      priority,
      recommendedChannels,
      costSavings,
      engagementImprovement,
    };
  }

  /**
   * Apply channel optimization to a notification
   */
  async optimizeChannelSelection(
    tenantId: string,
    userId: string,
    messageType: NotificationType,
    priority: NotificationPriority,
    originalChannels: NotificationChannel[],
    messageContent: string
  ): Promise<{
    optimizedChannels: NotificationChannel[];
    reasoning: string;
    estimatedSavings: number;
    fallbackPlan: Array<{
      channel: NotificationChannel;
      delay: number; // minutes
      condition: string;
    }>;
  }> {
    const recommendation = await this.getChannelRecommendation(
      tenantId,
      userId,
      messageType,
      priority,
      messageContent
    );

    const switchingRules = await this.getChannelSwitchingRules(tenantId);

    // Apply automatic switching rules
    const optimizedChannels = this.applyChannelSwitchingRules(
      originalChannels,
      recommendation,
      switchingRules,
      priority
    );

    // Generate fallback plan
    const fallbackPlan = this.generateFallbackPlan(
      recommendation.recommendedChannels,
      priority
    );

    // Calculate savings
    const estimatedSavings = this.calculateChannelSwitchingSavings(
      originalChannels,
      optimizedChannels,
      messageContent
    );

    const reasoning = this.generateOptimizationReasoning(
      originalChannels,
      optimizedChannels,
      recommendation
    );

    return {
      optimizedChannels,
      reasoning,
      estimatedSavings,
      fallbackPlan,
    };
  }

  /**
   * Get comprehensive channel metrics for a tenant
   */
  async getChannelMetrics(tenantId: string, period?: string): Promise<ChannelCostMetrics[]> {
    const targetPeriod = period || format(new Date(), 'yyyy-MM');
    const startDate = `${targetPeriod}-01T00:00:00Z`;
    const endDate = format(addDays(new Date(`${targetPeriod}-01`), 32), 'yyyy-MM-01T00:00:00Z');

    const channels: NotificationChannel[] = ['email', 'push', 'in_app', 'sms'];
    const metrics: ChannelCostMetrics[] = [];

    for (const channel of channels) {
      const channelData = await this.getChannelData(tenantId, channel, startDate, endDate);
      metrics.push(this.calculateChannelMetrics(channel, channelData));
    }

    return metrics.sort((a, b) => a.costPerEngagement - b.costPerEngagement);
  }

  /**
   * Generate channel optimization report
   */
  async generateOptimizationReport(
    tenantId: string,
    period?: string
  ): Promise<ChannelOptimizationReport> {
    const targetPeriod = period || format(new Date(), 'yyyy-MM');
    const channelMetrics = await this.getChannelMetrics(tenantId, targetPeriod);

    // Get current usage and costs
    const usageData = await this.getChannelUsageData(tenantId, targetPeriod);
    const totalCost = usageData.reduce((sum, data) => sum + data.cost, 0);

    // Calculate optimization potential
    const optimizationAnalysis = await this.analyzeOptimizationPotential(
      tenantId,
      channelMetrics,
      usageData
    );

    // Generate breakdown
    const channelBreakdown = this.generateChannelBreakdown(usageData, channelMetrics);

    // Generate recommendations
    const recommendations = this.generateChannelRecommendations(
      channelMetrics,
      optimizationAnalysis
    );

    return {
      tenantId,
      period: targetPeriod,
      summary: {
        totalCost,
        potentialSavings: optimizationAnalysis.potentialSavings,
        currentEngagement: optimizationAnalysis.currentEngagement,
        optimizedEngagement: optimizationAnalysis.optimizedEngagement,
        messagesAnalyzed: usageData.reduce((sum, data) => sum + data.messageCount, 0),
        recommendationsGenerated: recommendations.immediate.length +
                                 recommendations.shortTerm.length +
                                 recommendations.longTerm.length,
      },
      channelBreakdown,
      recommendations,
      optimization: {
        topSavingOpportunities: optimizationAnalysis.savingOpportunities,
        performanceImprovements: optimizationAnalysis.performanceImprovements,
      },
    };
  }

  /**
   * Update channel switching rules for a tenant
   */
  async updateChannelSwitchingRules(
    tenantId: string,
    rules: ChannelSwitchingRules
  ): Promise<void> {
    const { error } = await this.supabase
      .from('channel_switching_rules')
      .upsert({
        tenant_id: tenantId,
        rules: rules.rules,
        global_settings: rules.globalSettings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id'
      });

    if (error) {
      console.error('Failed to update channel switching rules:', error);
      throw error;
    }
  }

  /**
   * Get channel switching rules for a tenant
   */
  async getChannelSwitchingRules(tenantId: string): Promise<ChannelSwitchingRules> {
    const { data, error } = await this.supabase
      .from('channel_switching_rules')
      .select('rules, global_settings')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get channel switching rules:', error);
      throw error;
    }

    if (!data) {
      return this.getDefaultChannelSwitchingRules(tenantId);
    }

    return {
      tenantId,
      rules: data.rules || [],
      globalSettings: data.global_settings || this.getDefaultGlobalSettings(),
    };
  }

  /**
   * Track channel performance for optimization
   */
  async trackChannelPerformance(data: {
    tenantId: string;
    userId: string;
    channel: NotificationChannel;
    messageType: NotificationType;
    cost: number;
    delivered: boolean;
    opened?: boolean;
    clicked?: boolean;
    responded?: boolean;
    responseTime?: number; // minutes
    failureReason?: string;
  }): Promise<void> {
    const performanceEntry = {
      id: crypto.randomUUID(),
      tenant_id: data.tenantId,
      user_id: data.userId,
      channel: data.channel,
      message_type: data.messageType,
      cost_cents: data.cost,
      delivered: data.delivered,
      opened: data.opened || false,
      clicked: data.clicked || false,
      responded: data.responded || false,
      response_time_minutes: data.responseTime,
      failure_reason: data.failureReason,
      created_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('channel_performance_tracking')
      .insert(performanceEntry);

    if (error) {
      console.error('Failed to track channel performance:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private calculateChannelScores(params: {
    channelPerformance: ChannelPerformanceData[];
    channelMetrics: ChannelCostMetrics[];
    userEngagement: Record<NotificationChannel, number>;
    messageType: NotificationType;
    priority: NotificationPriority;
    messageContent: string;
    switchingRules: ChannelSwitchingRules;
  }): Array<{
    channel: NotificationChannel;
    score: number;
    reasoning: string;
    estimatedCost: number;
    estimatedEngagement: number;
  }> {
    const scores: Array<{
      channel: NotificationChannel;
      score: number;
      reasoning: string;
      estimatedCost: number;
      estimatedEngagement: number;
    }> = [];

    const channels: NotificationChannel[] = ['email', 'push', 'in_app', 'sms'];

    for (const channel of channels) {
      const channelMetric = params.channelMetrics.find(m => m.channel === channel);
      const userPerformance = params.channelPerformance.find(p => p.channel === channel);
      const userEngagement = params.userEngagement[channel] || 0;

      if (!channelMetric) continue;

      // Calculate base score components
      const costScore = this.calculateCostScore(channelMetric.costPerMessage, params.priority);
      const engagementScore = this.calculateEngagementScore(
        channelMetric.engagementRate,
        userEngagement
      );
      const reliabilityScore = channelMetric.reliability;
      const capabilityScore = this.calculateCapabilityScore(
        channel,
        params.messageType,
        params.messageContent
      );

      // Weight the scores
      const weightedScore = Math.round(
        costScore * 0.3 +
        engagementScore * 0.35 +
        reliabilityScore * 0.2 +
        capabilityScore * 0.15
      );

      // Apply priority adjustments
      const priorityAdjustedScore = this.applyPriorityAdjustments(
        weightedScore,
        channel,
        params.priority
      );

      // Apply switching rules
      const finalScore = this.applySwitchingRuleAdjustments(
        priorityAdjustedScore,
        channel,
        params.switchingRules,
        params.messageType,
        params.priority
      );

      const reasoning = this.generateChannelScoreReasoning({
        channel,
        costScore,
        engagementScore,
        reliabilityScore,
        capabilityScore,
        finalScore,
      });

      scores.push({
        channel,
        score: finalScore,
        reasoning,
        estimatedCost: this.estimateMessageCost(channel, params.messageContent),
        estimatedEngagement: Math.round((channelMetric.engagementRate + userEngagement) / 2),
      });
    }

    return scores;
  }

  private calculateCostScore(costPerMessage: number, priority: NotificationPriority): number {
    // Higher cost = lower score, but priority affects sensitivity
    const maxAcceptableCost = priority === 'critical' ? 2000 : // $20
                              priority === 'high' ? 1000 : // $10
                              priority === 'medium' ? 500 : // $5
                              200; // $2

    if (costPerMessage <= maxAcceptableCost * 0.25) return 100; // Very cheap
    if (costPerMessage <= maxAcceptableCost * 0.5) return 85;   // Cheap
    if (costPerMessage <= maxAcceptableCost * 0.75) return 70;  // Moderate
    if (costPerMessage <= maxAcceptableCost) return 50;         // Acceptable
    return Math.max(0, 50 - ((costPerMessage - maxAcceptableCost) / 100)); // Expensive
  }

  private calculateEngagementScore(
    channelEngagement: number,
    userEngagement: number
  ): number {
    // Combine channel-wide and user-specific engagement
    const combinedEngagement = (channelEngagement * 0.6) + (userEngagement * 0.4);
    return Math.min(100, combinedEngagement);
  }

  private calculateCapabilityScore(
    channel: NotificationChannel,
    messageType: NotificationType,
    messageContent: string
  ): number {
    const capabilities = this.channelCapabilities.get(channel) || [];
    let score = 50; // Base score

    // Channel-specific scoring
    switch (channel) {
      case 'sms':
        // Good for urgent, short messages
        if (messageContent.length <= 160) score += 30;
        if (messageType === 'goal_deadline' || messageType === 'streak_maintenance') score += 20;
        break;

      case 'push':
        // Good for timely notifications
        if (messageType === 'study_reminder' || messageType === 'achievement') score += 25;
        break;

      case 'email':
        // Good for detailed information
        if (messageContent.length > 200) score += 20;
        if (messageType === 'performance_alert') score += 15;
        break;

      case 'in_app':
        // Good for immediate context
        if (messageType === 'achievement' || messageType === 'break_reminder') score += 30;
        break;
    }

    return Math.min(100, score);
  }

  private applyPriorityAdjustments(
    score: number,
    channel: NotificationChannel,
    priority: NotificationPriority
  ): number {
    switch (priority) {
      case 'critical':
        // For critical messages, prioritize reliability over cost
        if (channel === 'sms' || channel === 'push') return Math.min(100, score + 20);
        break;

      case 'high':
        // For high priority, slight preference for immediate channels
        if (channel === 'push' || channel === 'in_app') return Math.min(100, score + 10);
        break;

      case 'low':
        // For low priority, heavily favor cost-effective channels
        if (channel === 'email' || channel === 'in_app') return Math.min(100, score + 15);
        if (channel === 'sms') return Math.max(0, score - 25);
        break;
    }

    return score;
  }

  private applySwitchingRuleAdjustments(
    score: number,
    channel: NotificationChannel,
    switchingRules: ChannelSwitchingRules,
    messageType: NotificationType,
    priority: NotificationPriority
  ): number {
    if (!switchingRules.globalSettings.enableAutomaticSwitching) {
      return score;
    }

    // Apply tenant-specific rules
    for (const rule of switchingRules.rules) {
      if (!rule.enabled) continue;

      // Check if rule applies
      if (rule.conditions.messageType && !rule.conditions.messageType.includes(messageType)) continue;
      if (rule.conditions.priority && !rule.conditions.priority.includes(priority)) continue;

      // Apply rule adjustments
      if (rule.action.preferredChannels.includes(channel)) {
        return Math.min(100, score + 20);
      }
      if (rule.action.fallbackChannels.includes(channel)) {
        return Math.max(0, score - 10);
      }
    }

    return score;
  }

  private generateChannelScoreReasoning(params: {
    channel: NotificationChannel;
    costScore: number;
    engagementScore: number;
    reliabilityScore: number;
    capabilityScore: number;
    finalScore: number;
  }): string {
    const reasons: string[] = [];

    if (params.costScore >= 80) reasons.push('very cost-effective');
    else if (params.costScore >= 60) reasons.push('cost-effective');
    else if (params.costScore < 40) reasons.push('expensive');

    if (params.engagementScore >= 80) reasons.push('high user engagement');
    else if (params.engagementScore >= 60) reasons.push('good engagement');
    else if (params.engagementScore < 40) reasons.push('low engagement');

    if (params.reliabilityScore >= 95) reasons.push('highly reliable');
    else if (params.reliabilityScore < 85) reasons.push('reliability concerns');

    if (params.capabilityScore >= 80) reasons.push('well-suited for this message type');

    return `${params.channel.toUpperCase()}: ${reasons.join(', ')} (score: ${params.finalScore})`;
  }

  private applyChannelSwitchingRules(
    originalChannels: NotificationChannel[],
    recommendation: ChannelRecommendation,
    switchingRules: ChannelSwitchingRules,
    priority: NotificationPriority
  ): NotificationChannel[] {
    if (!switchingRules.globalSettings.enableAutomaticSwitching) {
      return originalChannels;
    }

    // For critical priority, never switch away from immediate channels
    if (priority === 'critical') {
      return originalChannels.filter(c => c === 'sms' || c === 'push' || originalChannels.includes(c));
    }

    // Use top recommended channels up to the original count
    const topChannels = recommendation.recommendedChannels
      .slice(0, originalChannels.length)
      .map(r => r.channel);

    return topChannels;
  }

  private generateFallbackPlan(
    recommendedChannels: ChannelRecommendation['recommendedChannels'],
    priority: NotificationPriority
  ): Array<{ channel: NotificationChannel; delay: number; condition: string }> {
    const fallbackPlan: Array<{ channel: NotificationChannel; delay: number; condition: string }> = [];

    // Skip the primary channel (index 0)
    for (let i = 1; i < Math.min(recommendedChannels.length, 3); i++) {
      const channel = recommendedChannels[i];
      const delay = priority === 'critical' ? 5 : priority === 'high' ? 15 : 30;

      fallbackPlan.push({
        channel: channel.channel,
        delay: delay * i,
        condition: `if primary channel fails or no response after ${delay * i} minutes`,
      });
    }

    return fallbackPlan;
  }

  private async getUserChannelPerformance(userId: string): Promise<ChannelPerformanceData[]> {
    const thirtyDaysAgo = addDays(new Date(), -30).toISOString();

    const { data } = await this.supabase
      .from('channel_performance_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo);

    const performanceData: ChannelPerformanceData[] = [];
    const channels: NotificationChannel[] = ['email', 'push', 'in_app', 'sms'];

    for (const channel of channels) {
      const channelData = (data || []).filter(d => d.channel === channel);

      if (channelData.length === 0) continue;

      const metrics = {
        messagesSent: channelData.length,
        messagesDelivered: channelData.filter(d => d.delivered).length,
        messagesOpened: channelData.filter(d => d.opened).length,
        messagesClicked: channelData.filter(d => d.clicked).length,
        totalCost: channelData.reduce((sum, d) => sum + (d.cost_cents || 0), 0),
        averageResponseTime: this.calculateAverageResponseTime(channelData),
      };

      performanceData.push({
        channel,
        userId,
        period: format(new Date(), 'yyyy-MM'),
        metrics,
        engagement: {
          openRate: metrics.messagesSent > 0 ? (metrics.messagesOpened / metrics.messagesSent) * 100 : 0,
          clickRate: metrics.messagesSent > 0 ? (metrics.messagesClicked / metrics.messagesSent) * 100 : 0,
          responseRate: metrics.messagesSent > 0 ? (channelData.filter(d => d.responded).length / metrics.messagesSent) * 100 : 0,
          conversionRate: 0, // Would calculate based on actual conversions
        },
        reliability: {
          deliverySuccessRate: metrics.messagesSent > 0 ? (metrics.messagesDelivered / metrics.messagesSent) * 100 : 0,
          avgDeliveryTime: 5, // Would calculate from actual delivery times
          failureReasons: this.aggregateFailureReasons(channelData),
        },
      });
    }

    return performanceData;
  }

  private async getUserEngagementByChannel(userId: string): Promise<Record<NotificationChannel, number>> {
    // Get user's engagement scores by channel from the last 30 days
    const performance = await this.getUserChannelPerformance(userId);

    const engagement: Record<NotificationChannel, number> = {
      email: 0,
      push: 0,
      in_app: 0,
      sms: 0,
    };

    for (const perf of performance) {
      // Calculate composite engagement score
      engagement[perf.channel] = Math.round(
        perf.engagement.openRate * 0.3 +
        perf.engagement.clickRate * 0.3 +
        perf.engagement.responseRate * 0.4
      );
    }

    return engagement;
  }

  private async getCurrentUserChannels(userId: string): Promise<NotificationChannel[]> {
    const { data } = await this.supabase
      .from('notification_preferences')
      .select('channels')
      .eq('user_id', userId)
      .single();

    if (!data?.channels) return ['push', 'in_app']; // Default channels

    const enabledChannels: NotificationChannel[] = [];
    if (data.channels.email) enabledChannels.push('email');
    if (data.channels.push) enabledChannels.push('push');
    if (data.channels.inApp) enabledChannels.push('in_app');
    if (data.channels.sms) enabledChannels.push('sms');

    return enabledChannels;
  }

  private calculateCostSavings(
    currentChannels: NotificationChannel[],
    recommendedChannels: ChannelRecommendation['recommendedChannels']
  ): ChannelRecommendation['costSavings'] {
    const currentCost = currentChannels.reduce((sum, channel) => {
      return sum + (this.channelCosts.get(channel) || 0);
    }, 0);

    const optimizedCost = recommendedChannels
      .slice(0, currentChannels.length)
      .reduce((sum, rec) => sum + rec.estimatedCost, 0);

    const savingsAmount = Math.max(0, currentCost - optimizedCost);
    const savingsPercentage = currentCost > 0 ? (savingsAmount / currentCost) * 100 : 0;

    return {
      currentCost,
      optimizedCost,
      savingsAmount,
      savingsPercentage: Math.round(savingsPercentage),
    };
  }

  private calculateEngagementImprovement(
    userEngagement: Record<NotificationChannel, number>,
    recommendedChannels: ChannelRecommendation['recommendedChannels']
  ): ChannelRecommendation['engagementImprovement'] {
    // Calculate current average engagement
    const currentEngagement = Object.values(userEngagement)
      .filter(e => e > 0)
      .reduce((sum, e, _, arr) => sum + e / arr.length, 0);

    // Calculate optimized engagement from top recommendations
    const optimizedEngagement = recommendedChannels
      .slice(0, 3)
      .reduce((sum, rec, _, arr) => sum + rec.estimatedEngagement / arr.length, 0);

    const improvementPercentage = currentEngagement > 0 ?
      ((optimizedEngagement - currentEngagement) / currentEngagement) * 100 : 0;

    return {
      currentEngagement: Math.round(currentEngagement),
      optimizedEngagement: Math.round(optimizedEngagement),
      improvementPercentage: Math.round(improvementPercentage),
    };
  }

  private calculateChannelSwitchingSavings(
    originalChannels: NotificationChannel[],
    optimizedChannels: NotificationChannel[],
    messageContent: string
  ): number {
    const originalCost = originalChannels.reduce((sum, channel) => {
      return sum + this.estimateMessageCost(channel, messageContent);
    }, 0);

    const optimizedCost = optimizedChannels.reduce((sum, channel) => {
      return sum + this.estimateMessageCost(channel, messageContent);
    }, 0);

    return Math.max(0, originalCost - optimizedCost);
  }

  private generateOptimizationReasoning(
    originalChannels: NotificationChannel[],
    optimizedChannels: NotificationChannel[],
    recommendation: ChannelRecommendation
  ): string {
    if (JSON.stringify(originalChannels) === JSON.stringify(optimizedChannels)) {
      return 'No optimization needed - current channels are already optimal';
    }

    const changes: string[] = [];
    const removed = originalChannels.filter(c => !optimizedChannels.includes(c));
    const added = optimizedChannels.filter(c => !originalChannels.includes(c));

    if (removed.length > 0) {
      changes.push(`removed ${removed.join(', ')} due to cost or low engagement`);
    }

    if (added.length > 0) {
      changes.push(`added ${added.join(', ')} for better performance`);
    }

    const savings = recommendation.costSavings.savingsPercentage;
    const engagement = recommendation.engagementImprovement.improvementPercentage;

    return `Optimized channels: ${changes.join(', ')}. Expected ${savings}% cost savings and ${engagement}% engagement improvement.`;
  }

  private estimateMessageCost(channel: NotificationChannel, messageContent: string): number {
    const baseCost = this.channelCosts.get(channel) || 0;

    // Adjust cost based on message length for SMS
    if (channel === 'sms') {
      const segments = Math.ceil(messageContent.length / 160);
      return baseCost * segments;
    }

    return baseCost;
  }

  private async getChannelData(
    tenantId: string,
    channel: NotificationChannel,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const { data } = await this.supabase
      .from('channel_performance_tracking')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('channel', channel)
      .gte('created_at', startDate)
      .lt('created_at', endDate);

    return data || [];
  }

  private calculateChannelMetrics(
    channel: NotificationChannel,
    data: any[]
  ): ChannelCostMetrics {
    if (data.length === 0) {
      return {
        channel,
        costPerMessage: this.channelCosts.get(channel) || 0,
        costPerEngagement: 0,
        deliveryRate: 0,
        engagementRate: 0,
        averageResponseTime: 0,
        reliability: 0,
        userSatisfaction: 0,
      };
    }

    const totalCost = data.reduce((sum, d) => sum + (d.cost_cents || 0), 0);
    const deliveredCount = data.filter(d => d.delivered).length;
    const engagedCount = data.filter(d => d.opened || d.clicked || d.responded).length;
    const responseTimes = data.filter(d => d.response_time_minutes).map(d => d.response_time_minutes);

    return {
      channel,
      costPerMessage: data.length > 0 ? Math.round(totalCost / data.length) : 0,
      costPerEngagement: engagedCount > 0 ? Math.round(totalCost / engagedCount) : 0,
      deliveryRate: data.length > 0 ? Math.round((deliveredCount / data.length) * 100) : 0,
      engagementRate: data.length > 0 ? Math.round((engagedCount / data.length) * 100) : 0,
      averageResponseTime: responseTimes.length > 0 ?
        Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
      reliability: data.length > 0 ? Math.round((deliveredCount / data.length) * 100) : 0,
      userSatisfaction: 75, // Would calculate from user feedback
    };
  }

  private async getChannelUsageData(tenantId: string, period: string): Promise<Array<{
    channel: NotificationChannel;
    messageCount: number;
    cost: number;
    engagement: number;
  }>> {
    // Simplified implementation
    return [
      { channel: 'email', messageCount: 100, cost: 500, engagement: 25 },
      { channel: 'push', messageCount: 200, cost: 200, engagement: 45 },
      { channel: 'in_app', messageCount: 300, cost: 0, engagement: 60 },
      { channel: 'sms', messageCount: 50, cost: 4000, engagement: 35 },
    ];
  }

  private async analyzeOptimizationPotential(
    tenantId: string,
    channelMetrics: ChannelCostMetrics[],
    usageData: Array<{ channel: NotificationChannel; messageCount: number; cost: number; engagement: number }>
  ): Promise<{
    potentialSavings: number;
    currentEngagement: number;
    optimizedEngagement: number;
    savingOpportunities: Array<{ description: string; potentialSavings: number; implementation: string }>;
    performanceImprovements: Array<{ description: string; expectedImprovement: number; effort: 'low' | 'medium' | 'high' }>;
  }> {
    // Calculate current metrics
    const totalCost = usageData.reduce((sum, data) => sum + data.cost, 0);
    const totalMessages = usageData.reduce((sum, data) => sum + data.messageCount, 0);
    const currentEngagement = totalMessages > 0 ?
      usageData.reduce((sum, data) => sum + (data.engagement * data.messageCount), 0) / totalMessages : 0;

    // Find optimization opportunities
    const savingOpportunities = [];
    const performanceImprovements = [];

    // High-cost, low-engagement channels
    for (const usage of usageData) {
      const metric = channelMetrics.find(m => m.channel === usage.channel);
      if (metric && metric.costPerEngagement > 1000 && usage.engagement < 30) {
        savingOpportunities.push({
          description: `Reduce ${usage.channel} usage for low-engagement users`,
          potentialSavings: Math.round(usage.cost * 0.4),
          implementation: 'Enable automatic channel switching based on user engagement scores',
        });
      }
    }

    // Underutilized high-performance channels
    const inAppUsage = usageData.find(u => u.channel === 'in_app');
    if (inAppUsage && inAppUsage.engagement > 50 && inAppUsage.messageCount < totalMessages * 0.3) {
      performanceImprovements.push({
        description: 'Increase in-app notification usage for better engagement',
        expectedImprovement: 15,
        effort: 'low',
      });
    }

    return {
      potentialSavings: savingOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0),
      currentEngagement: Math.round(currentEngagement),
      optimizedEngagement: Math.round(currentEngagement + 10), // Estimated improvement
      savingOpportunities,
      performanceImprovements,
    };
  }

  private generateChannelBreakdown(
    usageData: Array<{ channel: NotificationChannel; messageCount: number; cost: number; engagement: number }>,
    channelMetrics: ChannelCostMetrics[]
  ): Record<NotificationChannel, { usage: number; cost: number; engagement: number; efficiency: number }> {
    const breakdown: Record<NotificationChannel, any> = {};

    for (const usage of usageData) {
      const metric = channelMetrics.find(m => m.channel === usage.channel);
      breakdown[usage.channel] = {
        usage: usage.messageCount,
        cost: usage.cost,
        engagement: usage.engagement,
        efficiency: metric ? metric.costPerEngagement : 0,
      };
    }

    return breakdown;
  }

  private generateChannelRecommendations(
    channelMetrics: ChannelCostMetrics[],
    optimizationAnalysis: any
  ): { immediate: string[]; shortTerm: string[]; longTerm: string[] } {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];

    // Immediate recommendations
    const expensiveChannels = channelMetrics.filter(m => m.costPerEngagement > 1000);
    if (expensiveChannels.length > 0) {
      immediate.push(`Review usage of high-cost channels: ${expensiveChannels.map(c => c.channel).join(', ')}`);
    }

    // Short-term recommendations
    if (optimizationAnalysis.potentialSavings > 500) {
      shortTerm.push('Implement user segmentation for channel selection');
      shortTerm.push('Enable automatic channel switching based on engagement');
    }

    // Long-term recommendations
    longTerm.push('Develop predictive models for optimal channel selection');
    longTerm.push('Implement A/B testing for channel effectiveness');

    return { immediate, shortTerm, longTerm };
  }

  private calculateAverageResponseTime(data: any[]): number {
    const responseTimes = data.filter(d => d.response_time_minutes).map(d => d.response_time_minutes);
    return responseTimes.length > 0 ?
      Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
  }

  private aggregateFailureReasons(data: any[]): Record<string, number> {
    const reasons: Record<string, number> = {};
    for (const item of data) {
      if (item.failure_reason) {
        reasons[item.failure_reason] = (reasons[item.failure_reason] || 0) + 1;
      }
    }
    return reasons;
  }

  private getDefaultChannelSwitchingRules(tenantId: string): ChannelSwitchingRules {
    return {
      tenantId,
      rules: [
        {
          id: 'low-engagement-users',
          name: 'Switch low-engagement users to cheaper channels',
          enabled: true,
          conditions: {
            userSegment: ['low_value', 'inactive'],
            engagementThreshold: 20,
          },
          action: {
            preferredChannels: ['email', 'in_app'],
            fallbackChannels: ['push'],
          },
          priority: 1,
        },
        {
          id: 'high-cost-limit',
          name: 'Avoid SMS for non-critical messages',
          enabled: true,
          conditions: {
            costThreshold: 800, // 8 cents
            priority: ['low', 'medium'],
          },
          action: {
            preferredChannels: ['push', 'in_app'],
            fallbackChannels: ['email'],
          },
          priority: 2,
        },
      ],
      globalSettings: {
        enableAutomaticSwitching: true,
        maxCostPerMessage: 1000, // 10 cents
        minEngagementRate: 15,
        fallbackDelay: 15,
      },
    };
  }

  private getDefaultGlobalSettings(): ChannelSwitchingRules['globalSettings'] {
    return {
      enableAutomaticSwitching: true,
      maxCostPerMessage: 1000,
      minEngagementRate: 15,
      fallbackDelay: 15,
    };
  }

  private initializeChannelCosts(): Map<NotificationChannel, number> {
    return new Map([
      ['email', 10], // 0.1 cents
      ['push', 5],   // 0.05 cents
      ['in_app', 0], // Free
      ['sms', 750],  // 7.5 cents
    ]);
  }

  private initializeChannelCapabilities(): Map<NotificationChannel, string[]> {
    return new Map([
      ['email', ['rich_content', 'attachments', 'detailed_info']],
      ['push', ['immediate', 'action_buttons', 'rich_media']],
      ['in_app', ['contextual', 'interactive', 'immediate']],
      ['sms', ['immediate', 'universal', 'reliable']],
    ]);
  }
}

export default ChannelOptimizationService;