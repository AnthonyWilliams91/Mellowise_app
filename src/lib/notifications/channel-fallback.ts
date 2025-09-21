/**
 * Channel Fallback Service
 * MELLOWISE-015: Intelligent channel switching and fallback management
 *
 * Provides sophisticated fallback strategies when primary notification channels fail,
 * with intelligent channel selection, preference preservation, and success tracking.
 */

import { createServerClient } from '@/lib/supabase/server';
import {
  NotificationChannel,
  ChannelFallbackConfig,
  FallbackStrategy,
  ChannelHealth,
  ChannelPreference,
  FallbackEvent,
  FallbackMetrics,
  ChannelCapability,
  DeliveryPriority,
  FallbackRule,
  ChannelRanking,
  NotificationContext,
  ChannelAvailability
} from '@/types/notifications';

/**
 * Channel Health Monitor - Tracks real-time channel performance
 */
class ChannelHealthMonitor {
  private healthScores: Map<NotificationChannel, ChannelHealth> = new Map();
  private supabase;

  constructor(supabase: any) {
    this.supabase = supabase;
    this.initializeHealthScores();
    this.startHealthMonitoring();
  }

  /**
   * Get current health score for channel
   */
  getHealthScore(channel: NotificationChannel): number {
    const health = this.healthScores.get(channel);
    return health?.healthScore || 0;
  }

  /**
   * Get channel health details
   */
  getChannelHealth(channel: NotificationChannel): ChannelHealth {
    return this.healthScores.get(channel) || {
      channel,
      healthScore: 0,
      availability: 0,
      latency: 0,
      errorRate: 100,
      throughput: 0,
      lastCheck: new Date().toISOString(),
      status: 'critical'
    };
  }

  /**
   * Update channel health based on delivery result
   */
  updateChannelHealth(
    channel: NotificationChannel,
    success: boolean,
    latency: number,
    error?: string
  ): void {
    const health = this.healthScores.get(channel) || this.createDefaultHealth(channel);

    // Update metrics using exponential moving average
    const alpha = 0.3; // Smoothing factor

    if (success) {
      health.errorRate = health.errorRate * (1 - alpha) + 0 * alpha;
      health.availability = Math.min(100, health.availability * (1 - alpha) + 100 * alpha);
    } else {
      health.errorRate = health.errorRate * (1 - alpha) + 100 * alpha;
      health.availability = health.availability * (1 - alpha) + 0 * alpha;
    }

    health.latency = health.latency * (1 - alpha) + latency * alpha;
    health.lastCheck = new Date().toISOString();

    // Calculate overall health score (0-100)
    health.healthScore = Math.max(0, Math.min(100,
      (health.availability * 0.4) +           // 40% weight on availability
      ((100 - health.errorRate) * 0.4) +      // 40% weight on success rate
      (Math.max(0, 100 - health.latency / 50) * 0.2) // 20% weight on latency
    ));

    // Determine status
    if (health.healthScore >= 80) {
      health.status = 'healthy';
    } else if (health.healthScore >= 50) {
      health.status = 'degraded';
    } else {
      health.status = 'critical';
    }

    this.healthScores.set(channel, health);
  }

  /**
   * Get all channel health scores
   */
  getAllChannelHealth(): Map<NotificationChannel, ChannelHealth> {
    return new Map(this.healthScores);
  }

  private createDefaultHealth(channel: NotificationChannel): ChannelHealth {
    return {
      channel,
      healthScore: 100,
      availability: 100,
      latency: 0,
      errorRate: 0,
      throughput: 0,
      lastCheck: new Date().toISOString(),
      status: 'healthy'
    };
  }

  private initializeHealthScores(): void {
    const channels: NotificationChannel[] = ['email', 'push', 'in_app', 'sms'];
    channels.forEach(channel => {
      this.healthScores.set(channel, this.createDefaultHealth(channel));
    });
  }

  private startHealthMonitoring(): void {
    // Perform health checks every 60 seconds
    setInterval(async () => {
      await this.performHealthChecks();
    }, 60000);
  }

  private async performHealthChecks(): Promise<void> {
    // Get recent delivery metrics for each channel
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // Last 5 minutes

    for (const channel of this.healthScores.keys()) {
      try {
        const { data: deliveries } = await this.supabase
          .from('notification_delivery_logs')
          .select('success, latency_ms, error_message')
          .eq('channel', channel)
          .gte('created_at', since);

        if (deliveries && deliveries.length > 0) {
          const successCount = deliveries.filter(d => d.success).length;
          const avgLatency = deliveries.reduce((sum, d) => sum + (d.latency_ms || 0), 0) / deliveries.length;
          const successRate = (successCount / deliveries.length) * 100;

          const health = this.healthScores.get(channel)!;
          health.availability = successRate;
          health.errorRate = 100 - successRate;
          health.latency = avgLatency;
          health.throughput = deliveries.length / 5; // per minute
          health.lastCheck = new Date().toISOString();

          // Recalculate health score
          health.healthScore = Math.max(0, Math.min(100,
            (health.availability * 0.4) +
            ((100 - health.errorRate) * 0.4) +
            (Math.max(0, 100 - health.latency / 50) * 0.2)
          ));

          this.healthScores.set(channel, health);
        }
      } catch (error) {
        console.error(`Health check failed for ${channel}:`, error);
        this.updateChannelHealth(channel, false, 10000, String(error));
      }
    }
  }
}

/**
 * Channel Fallback Service - Manages intelligent channel switching
 */
export class ChannelFallbackService {
  private supabase;
  private config: ChannelFallbackConfig;
  private healthMonitor: ChannelHealthMonitor;
  private fallbackRules: Map<string, FallbackRule[]> = new Map();

  constructor(config?: Partial<ChannelFallbackConfig>) {
    this.supabase = createServerClient();
    this.config = this.mergeWithDefaults(config);
    this.healthMonitor = new ChannelHealthMonitor(this.supabase);
    this.initializeFallbackRules();
  }

  /**
   * Get optimal channel for notification delivery
   */
  async getOptimalChannel(
    context: NotificationContext,
    userPreferences: ChannelPreference[],
    excludeChannels: NotificationChannel[] = []
  ): Promise<{
    channel: NotificationChannel;
    confidence: number;
    reasoning: string;
    alternatives: NotificationChannel[];
  }> {
    const availableChannels = this.getAvailableChannels(userPreferences, excludeChannels);

    if (availableChannels.length === 0) {
      throw new Error('No available channels for notification delivery');
    }

    const rankings = await this.rankChannels(availableChannels, context);
    const bestChannel = rankings[0];

    return {
      channel: bestChannel.channel,
      confidence: bestChannel.score,
      reasoning: bestChannel.reasoning,
      alternatives: rankings.slice(1, 4).map(r => r.channel)
    };
  }

  /**
   * Execute fallback strategy when primary channel fails
   */
  async executeFallback(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    userPreferences: ChannelPreference[],
    failureReason: string
  ): Promise<{
    fallbackChannel: NotificationChannel | null;
    strategy: FallbackStrategy;
    delay: number;
    preservePreferences: boolean;
  }> {
    // Record the failure
    this.healthMonitor.updateChannelHealth(originalChannel, false, 0, failureReason);

    // Log fallback event
    await this.logFallbackEvent({
      originalChannel,
      failureReason,
      context,
      timestamp: new Date().toISOString()
    });

    // Determine fallback strategy
    const strategy = await this.determineFallbackStrategy(
      originalChannel,
      context,
      failureReason
    );

    switch (strategy.type) {
      case 'immediate_alternative':
        return await this.executeImmediateAlternative(originalChannel, context, userPreferences);

      case 'delayed_retry':
        return await this.executeDelayedRetry(originalChannel, context, strategy.delay || 60000);

      case 'degraded_delivery':
        return await this.executeDegradedDelivery(originalChannel, context, userPreferences);

      case 'user_notification':
        return await this.executeUserNotification(originalChannel, context, userPreferences);

      case 'admin_escalation':
        return await this.executeAdminEscalation(originalChannel, context, failureReason);

      default:
        throw new Error(`Unknown fallback strategy: ${strategy.type}`);
    }
  }

  /**
   * Update user preferences based on fallback success
   */
  async updatePreferencesFromFallback(
    userId: string,
    originalChannel: NotificationChannel,
    fallbackChannel: NotificationChannel,
    success: boolean,
    userSatisfaction?: number
  ): Promise<void> {
    if (success && userSatisfaction && userSatisfaction > 0.7) {
      // Successful fallback with high satisfaction - consider preference adjustment
      await this.suggestPreferenceUpdate(userId, originalChannel, fallbackChannel);
    }

    // Update fallback analytics
    await this.updateFallbackAnalytics(userId, {
      originalChannel,
      fallbackChannel,
      success,
      userSatisfaction
    });
  }

  /**
   * Get fallback metrics and performance data
   */
  async getFallbackMetrics(timeWindow: number = 24): Promise<FallbackMetrics> {
    const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000).toISOString();

    const { data: fallbackEvents } = await this.supabase
      .from('fallback_events')
      .select('*')
      .gte('created_at', since);

    const events = fallbackEvents || [];

    const totalFallbacks = events.length;
    const successfulFallbacks = events.filter(e => e.success).length;
    const fallbacksByChannel = this.groupBy(events, 'original_channel');
    const fallbackStrategies = this.groupBy(events, 'strategy_type');

    const channelHealth = this.healthMonitor.getAllChannelHealth();
    const healthByChannel: Record<string, number> = {};
    for (const [channel, health] of channelHealth) {
      healthByChannel[channel] = health.healthScore;
    }

    // Calculate average fallback time
    const fallbackTimes = events
      .filter(e => e.fallback_duration_ms)
      .map(e => e.fallback_duration_ms);
    const avgFallbackTime = fallbackTimes.length > 0 ?
      fallbackTimes.reduce((sum, time) => sum + time, 0) / fallbackTimes.length : 0;

    return {
      totalFallbacks,
      successfulFallbacks,
      fallbackSuccessRate: totalFallbacks > 0 ? successfulFallbacks / totalFallbacks : 0,
      averageFallbackTime: avgFallbackTime,
      fallbacksByChannel,
      fallbackStrategies,
      channelHealthScores: healthByChannel,
      userSatisfactionAverage: this.calculateAverageSatisfaction(events),
      timeWindow
    };
  }

  /**
   * Configure custom fallback rules
   */
  configureFallbackRules(
    tenantId: string,
    rules: FallbackRule[]
  ): void {
    this.fallbackRules.set(tenantId, rules);
  }

  /**
   * Get channel availability status
   */
  getChannelAvailability(): Record<NotificationChannel, ChannelAvailability> {
    const availability: Record<NotificationChannel, ChannelAvailability> = {} as any;
    const channelHealth = this.healthMonitor.getAllChannelHealth();

    for (const [channel, health] of channelHealth) {
      availability[channel] = {
        isAvailable: health.status !== 'critical',
        healthScore: health.healthScore,
        estimatedLatency: health.latency,
        errorRate: health.errorRate,
        lastCheck: health.lastCheck
      };
    }

    return availability;
  }

  /**
   * Private: Rank channels based on context and health
   */
  private async rankChannels(
    channels: NotificationChannel[],
    context: NotificationContext
  ): Promise<ChannelRanking[]> {
    const rankings: ChannelRanking[] = [];

    for (const channel of channels) {
      const health = this.healthMonitor.getChannelHealth(channel);
      const capability = this.getChannelCapability(channel, context);

      // Calculate composite score
      let score = 0;
      let reasoning = '';

      // Health weight (40%)
      const healthWeight = 0.4;
      score += health.healthScore * healthWeight;
      reasoning += `Health: ${health.healthScore.toFixed(1)}; `;

      // Capability weight (30%)
      const capabilityWeight = 0.3;
      const capabilityScore = this.calculateCapabilityScore(capability, context);
      score += capabilityScore * capabilityWeight;
      reasoning += `Capability: ${capabilityScore.toFixed(1)}; `;

      // Priority alignment weight (20%)
      const priorityWeight = 0.2;
      const priorityScore = this.calculatePriorityScore(channel, context.priority);
      score += priorityScore * priorityWeight;
      reasoning += `Priority: ${priorityScore.toFixed(1)}; `;

      // Cost efficiency weight (10%)
      const costWeight = 0.1;
      const costScore = this.calculateCostScore(channel, context);
      score += costScore * costWeight;
      reasoning += `Cost: ${costScore.toFixed(1)}`;

      rankings.push({
        channel,
        score,
        reasoning,
        health: health.status,
        estimatedLatency: health.latency
      });
    }

    return rankings.sort((a, b) => b.score - a.score);
  }

  /**
   * Private: Get available channels based on preferences
   */
  private getAvailableChannels(
    preferences: ChannelPreference[],
    excludeChannels: NotificationChannel[]
  ): NotificationChannel[] {
    return preferences
      .filter(pref => pref.enabled && !excludeChannels.includes(pref.channel))
      .map(pref => pref.channel);
  }

  /**
   * Private: Determine fallback strategy
   */
  private async determineFallbackStrategy(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    failureReason: string
  ): Promise<FallbackStrategy> {
    // Check custom rules first
    const tenantRules = this.fallbackRules.get(context.tenantId || 'default');
    if (tenantRules) {
      for (const rule of tenantRules) {
        if (this.ruleMatches(rule, originalChannel, context, failureReason)) {
          return rule.strategy;
        }
      }
    }

    // Default strategy based on failure reason and priority
    if (failureReason.includes('rate limit')) {
      return { type: 'delayed_retry', delay: 300000 }; // 5 minutes
    }

    if (failureReason.includes('authentication') || failureReason.includes('configuration')) {
      return { type: 'admin_escalation' };
    }

    if (context.priority === 'critical') {
      return { type: 'immediate_alternative' };
    }

    if (context.priority === 'high') {
      return { type: 'immediate_alternative' };
    }

    return { type: 'delayed_retry', delay: 60000 }; // 1 minute
  }

  /**
   * Private: Execute immediate alternative strategy
   */
  private async executeImmediateAlternative(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    preferences: ChannelPreference[]
  ): Promise<any> {
    const availableChannels = this.getAvailableChannels(preferences, [originalChannel]);

    if (availableChannels.length === 0) {
      return {
        fallbackChannel: null,
        strategy: { type: 'immediate_alternative' },
        delay: 0,
        preservePreferences: true
      };
    }

    const rankings = await this.rankChannels(availableChannels, context);
    const bestAlternative = rankings[0];

    return {
      fallbackChannel: bestAlternative.channel,
      strategy: { type: 'immediate_alternative' },
      delay: 0,
      preservePreferences: true
    };
  }

  /**
   * Private: Execute delayed retry strategy
   */
  private async executeDelayedRetry(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    delay: number
  ): Promise<any> {
    return {
      fallbackChannel: originalChannel,
      strategy: { type: 'delayed_retry', delay },
      delay,
      preservePreferences: true
    };
  }

  /**
   * Private: Execute degraded delivery strategy
   */
  private async executeDegradedDelivery(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    preferences: ChannelPreference[]
  ): Promise<any> {
    // Use in-app notification as degraded fallback
    const fallbackChannel = preferences.find(p => p.channel === 'in_app')?.enabled ? 'in_app' : null;

    return {
      fallbackChannel,
      strategy: { type: 'degraded_delivery' },
      delay: 0,
      preservePreferences: false
    };
  }

  /**
   * Private: Execute user notification strategy
   */
  private async executeUserNotification(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    preferences: ChannelPreference[]
  ): Promise<any> {
    // Notify user about delivery issues via most reliable channel
    const reliableChannel = preferences.find(p =>
      p.channel === 'in_app' && p.enabled
    )?.channel || null;

    return {
      fallbackChannel: reliableChannel,
      strategy: { type: 'user_notification' },
      delay: 0,
      preservePreferences: false
    };
  }

  /**
   * Private: Execute admin escalation strategy
   */
  private async executeAdminEscalation(
    originalChannel: NotificationChannel,
    context: NotificationContext,
    failureReason: string
  ): Promise<any> {
    // Log for admin attention
    console.error(`Admin escalation required for ${originalChannel}: ${failureReason}`);

    return {
      fallbackChannel: null,
      strategy: { type: 'admin_escalation' },
      delay: 0,
      preservePreferences: true
    };
  }

  /**
   * Private: Initialize default fallback rules
   */
  private initializeFallbackRules(): void {
    const defaultRules: FallbackRule[] = [
      {
        id: 'critical-immediate-fallback',
        condition: {
          priority: 'critical',
          failureReasons: ['network_timeout', 'service_unavailable']
        },
        strategy: { type: 'immediate_alternative' }
      },
      {
        id: 'rate-limit-delay',
        condition: {
          failureReasons: ['rate_limit_exceeded']
        },
        strategy: { type: 'delayed_retry', delay: 300000 }
      },
      {
        id: 'auth-escalation',
        condition: {
          failureReasons: ['authentication_failed', 'invalid_credentials']
        },
        strategy: { type: 'admin_escalation' }
      }
    ];

    this.fallbackRules.set('default', defaultRules);
  }

  /**
   * Private: Merge with default configuration
   */
  private mergeWithDefaults(config?: Partial<ChannelFallbackConfig>): ChannelFallbackConfig {
    return {
      enableIntelligentFallback: true,
      preserveUserPreferences: true,
      maxFallbackAttempts: 3,
      fallbackTimeoutMs: 30000,
      healthCheckIntervalMs: 60000,
      ...config
    };
  }

  // Helper methods for scoring and analysis
  private getChannelCapability(channel: NotificationChannel, context: NotificationContext): ChannelCapability {
    const capabilities: Record<NotificationChannel, ChannelCapability> = {
      email: { richContent: true, attachments: true, urgency: 'low', cost: 'low' },
      push: { richContent: false, attachments: false, urgency: 'high', cost: 'low' },
      in_app: { richContent: true, attachments: false, urgency: 'medium', cost: 'none' },
      sms: { richContent: false, attachments: false, urgency: 'high', cost: 'high' }
    };

    return capabilities[channel];
  }

  private calculateCapabilityScore(capability: ChannelCapability, context: NotificationContext): number {
    let score = 50; // Base score

    // Adjust based on content requirements
    if (context.requiresRichContent && capability.richContent) score += 20;
    if (context.hasAttachments && capability.attachments) score += 15;

    // Adjust based on urgency alignment
    const urgencyScore = this.getUrgencyScore(capability.urgency, context.urgency);
    score += urgencyScore;

    return Math.min(100, Math.max(0, score));
  }

  private calculatePriorityScore(channel: NotificationChannel, priority: DeliveryPriority): number {
    const priorityChannelMap: Record<DeliveryPriority, Record<NotificationChannel, number>> = {
      critical: { push: 100, sms: 90, in_app: 80, email: 70 },
      high: { push: 90, in_app: 85, sms: 80, email: 75 },
      medium: { email: 90, in_app: 85, push: 80, sms: 60 },
      low: { email: 95, in_app: 90, push: 70, sms: 50 }
    };

    return priorityChannelMap[priority][channel] || 50;
  }

  private calculateCostScore(channel: NotificationChannel, context: NotificationContext): number {
    const costScores: Record<NotificationChannel, number> = {
      in_app: 100,  // No cost
      email: 95,    // Very low cost
      push: 90,     // Low cost
      sms: 60       // Higher cost
    };

    return costScores[channel] || 50;
  }

  private getUrgencyScore(channelUrgency: string, contextUrgency: string): number {
    const urgencyMatch: Record<string, Record<string, number>> = {
      immediate: { high: 25, medium: 15, low: 5 },
      medium: { high: 20, medium: 25, low: 15 },
      low: { high: 10, medium: 20, low: 25 }
    };

    return urgencyMatch[contextUrgency]?.[channelUrgency] || 0;
  }

  private ruleMatches(
    rule: FallbackRule,
    channel: NotificationChannel,
    context: NotificationContext,
    failureReason: string
  ): boolean {
    const condition = rule.condition;

    if (condition.channels && !condition.channels.includes(channel)) {
      return false;
    }

    if (condition.priority && condition.priority !== context.priority) {
      return false;
    }

    if (condition.failureReasons && !condition.failureReasons.some(reason =>
      failureReason.toLowerCase().includes(reason.toLowerCase())
    )) {
      return false;
    }

    return true;
  }

  private groupBy(array: any[], property: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = item[property] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageSatisfaction(events: any[]): number {
    const satisfactionScores = events
      .filter(e => e.user_satisfaction_score !== null)
      .map(e => e.user_satisfaction_score);

    if (satisfactionScores.length === 0) return 0;

    return satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length;
  }

  private async logFallbackEvent(event: {
    originalChannel: NotificationChannel;
    failureReason: string;
    context: NotificationContext;
    timestamp: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('fallback_events')
        .insert({
          id: crypto.randomUUID(),
          tenant_id: event.context.tenantId || '00000000-0000-0000-0000-000000000000',
          user_id: event.context.userId,
          original_channel: event.originalChannel,
          failure_reason: event.failureReason,
          context_data: event.context,
          created_at: event.timestamp
        });
    } catch (error) {
      console.error('Failed to log fallback event:', error);
    }
  }

  private async suggestPreferenceUpdate(
    userId: string,
    originalChannel: NotificationChannel,
    fallbackChannel: NotificationChannel
  ): Promise<void> {
    // Implementation would suggest preference updates to user
    console.log(`Suggesting preference update for user ${userId}: ${originalChannel} -> ${fallbackChannel}`);
  }

  private async updateFallbackAnalytics(
    userId: string,
    data: {
      originalChannel: NotificationChannel;
      fallbackChannel: NotificationChannel;
      success: boolean;
      userSatisfaction?: number;
    }
  ): Promise<void> {
    try {
      await this.supabase
        .from('fallback_analytics')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          original_channel: data.originalChannel,
          fallback_channel: data.fallbackChannel,
          success: data.success,
          user_satisfaction_score: data.userSatisfaction,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to update fallback analytics:', error);
    }
  }
}