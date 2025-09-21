/**
 * SMS Cost Analytics Service
 * MELLOWISE-015: Intelligent SMS cost optimization with real-time tracking and budget management
 */

import { createServerClient } from '@/lib/supabase/server';
import { addDays, differenceInHours, format, parseISO } from 'date-fns';

/**
 * SMS cost tracking and analytics types
 */
export interface SMSCostMetrics {
  tenantId: string;
  period: string; // YYYY-MM
  metrics: {
    totalMessages: number;
    totalCost: number; // USD cents
    avgCostPerMessage: number;
    avgCostPerEngagement: number;
    deliveryRate: number;
    responseRate: number;
    optOutRate: number;
  };
  breakdown: {
    byType: Record<string, {
      count: number;
      cost: number;
      engagement: number;
    }>;
    byCountry: Record<string, {
      count: number;
      cost: number;
      avgCostPerMessage: number;
    }>;
    byTimeOfDay: Array<{
      hour: number;
      count: number;
      cost: number;
      engagement: number;
    }>;
  };
  budget: {
    allocated: number; // USD cents
    spent: number;
    remaining: number;
    projectedMonthlySpend: number;
    burnRate: number; // per day
  };
}

export interface SMSCostOptimizationSettings {
  tenantId: string;
  budget: {
    monthlyLimit: number; // USD cents
    dailyLimit: number;
    alertThresholds: {
      warning: number; // 80%
      critical: number; // 95%
    };
    autoStopAtLimit: boolean;
  };
  optimization: {
    enableCompression: boolean;
    enableBatching: boolean;
    enableChannelSwitching: boolean;
    priorityThresholds: {
      high: number; // Cost limit for high priority messages
      medium: number; // Cost limit for medium priority
      low: number; // Cost limit for low priority
    };
  };
  segmentation: {
    enableUserSegmentation: boolean;
    highValueUserThreshold: number; // Engagement score
    costPerSegment: Record<string, number>; // Max cost per user segment
  };
  fallbacks: {
    enableFallbackChannels: boolean;
    fallbackOrder: Array<'push' | 'email' | 'in_app'>;
    costThresholdForFallback: number;
  };
}

export interface SMSCostAlert {
  id: string;
  tenantId: string;
  type: 'budget_warning' | 'budget_critical' | 'cost_spike' | 'low_engagement';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  data: {
    currentSpend?: number;
    budgetLimit?: number;
    percentageUsed?: number;
    timeframe?: string;
  };
  triggeredAt: string;
  acknowledgedAt?: string;
}

export interface UserEngagementScore {
  userId: string;
  score: number; // 0-100
  factors: {
    responseRate: number;
    clickThroughRate: number;
    sessionTriggerRate: number;
    averageResponseTime: number; // minutes
    recentActivity: number; // 0-100
  };
  segment: 'high_value' | 'medium_value' | 'low_value' | 'inactive';
  lastUpdated: string;
}

/**
 * SMS Cost Analytics Service - Comprehensive cost tracking and optimization
 */
export class SMSCostAnalyticsService {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Track SMS cost and engagement metrics
   */
  async trackSMSCost(data: {
    tenantId: string;
    userId: string;
    messageId: string;
    phoneNumber: string;
    messageType: string;
    messageLength: number;
    cost: number; // USD cents
    countryCode: string;
    segments: number; // Number of SMS segments
    deliveryStatus?: 'delivered' | 'failed' | 'undelivered';
    responseReceived?: boolean;
    responseTime?: number; // minutes
  }): Promise<void> {
    const costEntry = {
      id: crypto.randomUUID(),
      tenant_id: data.tenantId,
      user_id: data.userId,
      message_id: data.messageId,
      phone_number: data.phoneNumber,
      message_type: data.messageType,
      message_length: data.messageLength,
      cost_cents: data.cost,
      country_code: data.countryCode,
      segments: data.segments,
      delivery_status: data.deliveryStatus || 'pending',
      response_received: data.responseReceived || false,
      response_time_minutes: data.responseTime,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('sms_cost_tracking')
      .insert(costEntry);

    if (error) {
      console.error('Failed to track SMS cost:', error);
      throw error;
    }

    // Update real-time budget tracking
    await this.updateBudgetTracking(data.tenantId, data.cost);

    // Check for cost alerts
    await this.checkCostAlerts(data.tenantId);
  }

  /**
   * Get comprehensive cost metrics for a tenant
   */
  async getCostMetrics(
    tenantId: string,
    period?: string // YYYY-MM format, defaults to current month
  ): Promise<SMSCostMetrics> {
    const targetPeriod = period || format(new Date(), 'yyyy-MM');
    const startDate = `${targetPeriod}-01T00:00:00Z`;
    const endDate = format(addDays(new Date(`${targetPeriod}-01`), 32), 'yyyy-MM-01T00:00:00Z');

    // Get basic metrics
    const { data: costs, error } = await this.supabase
      .from('sms_cost_tracking')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('sent_at', startDate)
      .lt('sent_at', endDate);

    if (error) throw error;

    const costsData = costs || [];
    const totalMessages = costsData.length;
    const totalCost = costsData.reduce((sum, cost) => sum + (cost.cost_cents || 0), 0);
    const deliveredMessages = costsData.filter(c => c.delivery_status === 'delivered').length;
    const respondedMessages = costsData.filter(c => c.response_received).length;
    const optOutUsers = await this.getOptOutCount(tenantId, startDate, endDate);

    // Calculate breakdown metrics
    const byType = this.calculateTypeBreakdown(costsData);
    const byCountry = this.calculateCountryBreakdown(costsData);
    const byTimeOfDay = this.calculateTimeBreakdown(costsData);

    // Get budget information
    const budget = await this.getBudgetStatus(tenantId);

    return {
      tenantId,
      period: targetPeriod,
      metrics: {
        totalMessages,
        totalCost,
        avgCostPerMessage: totalMessages > 0 ? Math.round(totalCost / totalMessages) : 0,
        avgCostPerEngagement: respondedMessages > 0 ? Math.round(totalCost / respondedMessages) : 0,
        deliveryRate: totalMessages > 0 ? Math.round((deliveredMessages / totalMessages) * 100) : 0,
        responseRate: totalMessages > 0 ? Math.round((respondedMessages / totalMessages) * 100) : 0,
        optOutRate: totalMessages > 0 ? Math.round((optOutUsers / totalMessages) * 100) : 0,
      },
      breakdown: {
        byType,
        byCountry,
        byTimeOfDay,
      },
      budget,
    };
  }

  /**
   * Calculate cost-per-action (CPA) for different message types
   */
  async calculateCostPerAction(
    tenantId: string,
    period?: string
  ): Promise<Record<string, {
    messagesSent: number;
    totalCost: number;
    sessionsTriggered: number;
    goalsCompleted: number;
    costPerSession: number;
    costPerGoal: number;
    roi: number;
  }>> {
    const targetPeriod = period || format(new Date(), 'yyyy-MM');
    const startDate = `${targetPeriod}-01T00:00:00Z`;
    const endDate = format(addDays(new Date(`${targetPeriod}-01`), 32), 'yyyy-MM-01T00:00:00Z');

    // Get SMS costs by type
    const { data: costs } = await this.supabase
      .from('sms_cost_tracking')
      .select('message_type, cost_cents, user_id, sent_at')
      .eq('tenant_id', tenantId)
      .gte('sent_at', startDate)
      .lt('sent_at', endDate);

    // Get triggered sessions
    const { data: sessions } = await this.supabase
      .from('practice_sessions')
      .select('user_id, created_at, triggered_by_notification')
      .eq('tenant_id', tenantId)
      .eq('triggered_by_notification', true)
      .gte('created_at', startDate)
      .lt('created_at', endDate);

    // Get completed goals
    const { data: goals } = await this.supabase
      .from('goals')
      .select('user_id, completed_at')
      .eq('tenant_id', tenantId)
      .not('completed_at', 'is', null)
      .gte('completed_at', startDate)
      .lt('completed_at', endDate);

    const costsByType = new Map<string, {
      messagesSent: number;
      totalCost: number;
      userIds: Set<string>;
    }>();

    // Aggregate costs by type
    for (const cost of costs || []) {
      const type = cost.message_type || 'unknown';
      if (!costsByType.has(type)) {
        costsByType.set(type, {
          messagesSent: 0,
          totalCost: 0,
          userIds: new Set(),
        });
      }
      const data = costsByType.get(type)!;
      data.messagesSent++;
      data.totalCost += cost.cost_cents || 0;
      data.userIds.add(cost.user_id);
    }

    // Calculate actions triggered by SMS
    const result: Record<string, any> = {};

    for (const [type, data] of costsByType) {
      const userIds = Array.from(data.userIds);
      const sessionsTriggered = (sessions || []).filter(s =>
        userIds.includes(s.user_id)
      ).length;

      const goalsCompleted = (goals || []).filter(g =>
        userIds.includes(g.user_id)
      ).length;

      result[type] = {
        messagesSent: data.messagesSent,
        totalCost: data.totalCost,
        sessionsTriggered,
        goalsCompleted,
        costPerSession: sessionsTriggered > 0 ? Math.round(data.totalCost / sessionsTriggered) : 0,
        costPerGoal: goalsCompleted > 0 ? Math.round(data.totalCost / goalsCompleted) : 0,
        roi: this.calculateROI(data.totalCost, sessionsTriggered, goalsCompleted),
      };
    }

    return result;
  }

  /**
   * Get user engagement scores for cost optimization
   */
  async getUserEngagementScores(tenantId: string): Promise<UserEngagementScore[]> {
    const thirtyDaysAgo = addDays(new Date(), -30).toISOString();

    // Get SMS engagement data
    const { data: smsData } = await this.supabase
      .from('sms_cost_tracking')
      .select('user_id, response_received, response_time_minutes, sent_at')
      .eq('tenant_id', tenantId)
      .gte('sent_at', thirtyDaysAgo);

    // Get session data
    const { data: sessions } = await this.supabase
      .from('practice_sessions')
      .select('user_id, created_at, triggered_by_notification')
      .eq('tenant_id', tenantId)
      .gte('created_at', thirtyDaysAgo);

    // Calculate engagement scores per user
    const userScores = new Map<string, UserEngagementScore>();

    for (const sms of smsData || []) {
      if (!userScores.has(sms.user_id)) {
        userScores.set(sms.user_id, {
          userId: sms.user_id,
          score: 0,
          factors: {
            responseRate: 0,
            clickThroughRate: 0,
            sessionTriggerRate: 0,
            averageResponseTime: 0,
            recentActivity: 0,
          },
          segment: 'inactive',
          lastUpdated: new Date().toISOString(),
        });
      }
    }

    // Calculate engagement factors for each user
    for (const [userId, scoreData] of userScores) {
      const userSMSData = (smsData || []).filter(s => s.user_id === userId);
      const userSessions = (sessions || []).filter(s => s.user_id === userId);
      const notificationTriggeredSessions = userSessions.filter(s => s.triggered_by_notification);

      // Response rate
      const responses = userSMSData.filter(s => s.response_received).length;
      scoreData.factors.responseRate = userSMSData.length > 0 ?
        Math.round((responses / userSMSData.length) * 100) : 0;

      // Session trigger rate
      scoreData.factors.sessionTriggerRate = userSMSData.length > 0 ?
        Math.round((notificationTriggeredSessions.length / userSMSData.length) * 100) : 0;

      // Average response time
      const responseTimes = userSMSData
        .filter(s => s.response_time_minutes)
        .map(s => s.response_time_minutes);
      scoreData.factors.averageResponseTime = responseTimes.length > 0 ?
        Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

      // Recent activity score
      const recentSessions = userSessions.filter(s =>
        differenceInHours(new Date(), parseISO(s.created_at)) <= 7 * 24
      );
      scoreData.factors.recentActivity = Math.min(recentSessions.length * 10, 100);

      // Calculate overall score (weighted average)
      scoreData.score = Math.round(
        scoreData.factors.responseRate * 0.3 +
        scoreData.factors.sessionTriggerRate * 0.3 +
        scoreData.factors.recentActivity * 0.25 +
        (100 - Math.min(scoreData.factors.averageResponseTime, 100)) * 0.15
      );

      // Determine segment
      if (scoreData.score >= 70) {
        scoreData.segment = 'high_value';
      } else if (scoreData.score >= 40) {
        scoreData.segment = 'medium_value';
      } else if (scoreData.score >= 20) {
        scoreData.segment = 'low_value';
      } else {
        scoreData.segment = 'inactive';
      }
    }

    return Array.from(userScores.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Generate cost optimization recommendations
   */
  async generateCostOptimizationRecommendations(tenantId: string): Promise<{
    recommendations: Array<{
      type: 'compression' | 'batching' | 'channel_switch' | 'timing' | 'segmentation';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedSavings: number; // USD cents per month
      implementation: string;
    }>;
    currentMetrics: {
      monthlySpend: number;
      avgCostPerMessage: number;
      engagementRate: number;
      inefficiencies: string[];
    };
  }> {
    const metrics = await this.getCostMetrics(tenantId);
    const engagementScores = await this.getUserEngagementScores(tenantId);
    const recommendations: any[] = [];

    // Analyze current inefficiencies
    const avgCostPerMessage = metrics.metrics.avgCostPerMessage;
    const engagementRate = metrics.metrics.responseRate;
    const lowEngagementUsers = engagementScores.filter(s => s.segment === 'inactive' || s.segment === 'low_value');

    // Message compression recommendation
    if (avgCostPerMessage > 800) { // 8 cents per message
      recommendations.push({
        type: 'compression',
        priority: 'high',
        title: 'Enable Message Compression',
        description: 'Your average message length could be reduced by 25-30% using AI-powered compression without losing meaning.',
        expectedSavings: Math.round(metrics.budget.spent * 0.25),
        implementation: 'Enable compression in SMS settings. Messages will be automatically optimized before sending.',
      });
    }

    // Segmentation recommendation
    if (lowEngagementUsers.length > engagementScores.length * 0.3) {
      recommendations.push({
        type: 'segmentation',
        priority: 'high',
        title: 'Implement User Segmentation',
        description: `${lowEngagementUsers.length} users have low engagement. Switch them to cheaper channels.`,
        expectedSavings: Math.round(lowEngagementUsers.length * avgCostPerMessage * 30 * 0.7), // 70% savings by switching channels
        implementation: 'Enable automatic channel switching for low-engagement users in optimization settings.',
      });
    }

    // Timing optimization
    const offPeakMessages = metrics.breakdown.byTimeOfDay.filter(t =>
      t.hour < 9 || t.hour > 17
    ).reduce((sum, t) => sum + t.count, 0);

    if (offPeakMessages > metrics.metrics.totalMessages * 0.4) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Optimize Send Times',
        description: 'Many messages are sent during off-peak hours when engagement is lower.',
        expectedSavings: Math.round(offPeakMessages * avgCostPerMessage * 0.15),
        implementation: 'Enable smart timing to send messages during user\'s optimal engagement hours.',
      });
    }

    // Batching recommendation
    if (metrics.metrics.totalMessages > 1000) {
      recommendations.push({
        type: 'batching',
        priority: 'medium',
        title: 'Enable Smart Batching',
        description: 'Batch similar messages to reduce overhead and improve delivery rates.',
        expectedSavings: Math.round(metrics.budget.spent * 0.1),
        implementation: 'Enable message batching in optimization settings. Compatible messages will be grouped automatically.',
      });
    }

    return {
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      currentMetrics: {
        monthlySpend: metrics.budget.spent,
        avgCostPerMessage,
        engagementRate,
        inefficiencies: this.identifyInefficiencies(metrics, engagementScores),
      },
    };
  }

  /**
   * Set cost optimization settings for a tenant
   */
  async updateCostOptimizationSettings(
    tenantId: string,
    settings: SMSCostOptimizationSettings
  ): Promise<void> {
    const { error } = await this.supabase
      .from('sms_cost_settings')
      .upsert({
        tenant_id: tenantId,
        settings: settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id'
      });

    if (error) {
      console.error('Failed to update SMS cost settings:', error);
      throw error;
    }
  }

  /**
   * Get cost optimization settings for a tenant
   */
  async getCostOptimizationSettings(tenantId: string): Promise<SMSCostOptimizationSettings> {
    const { data, error } = await this.supabase
      .from('sms_cost_settings')
      .select('settings')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Failed to get SMS cost settings:', error);
      throw error;
    }

    if (!data) {
      // Return default settings
      return this.getDefaultCostSettings(tenantId);
    }

    return data.settings;
  }

  /**
   * Private helper methods
   */
  private async updateBudgetTracking(tenantId: string, cost: number): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');

    await this.supabase.rpc('update_daily_sms_budget', {
      p_tenant_id: tenantId,
      p_date: today,
      p_cost_cents: cost,
    });
  }

  private async checkCostAlerts(tenantId: string): Promise<void> {
    const settings = await this.getCostOptimizationSettings(tenantId);
    const budget = await this.getBudgetStatus(tenantId);

    const alerts: SMSCostAlert[] = [];

    // Budget alerts
    const percentUsed = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;

    if (percentUsed >= settings.budget.alertThresholds.critical) {
      alerts.push({
        id: crypto.randomUUID(),
        tenantId,
        type: 'budget_critical',
        severity: 'critical',
        message: `SMS budget is ${Math.round(percentUsed)}% used (${budget.spent} / ${budget.allocated} cents)`,
        data: {
          currentSpend: budget.spent,
          budgetLimit: budget.allocated,
          percentageUsed: percentUsed,
          timeframe: 'monthly',
        },
        triggeredAt: new Date().toISOString(),
      });
    } else if (percentUsed >= settings.budget.alertThresholds.warning) {
      alerts.push({
        id: crypto.randomUUID(),
        tenantId,
        type: 'budget_warning',
        severity: 'warning',
        message: `SMS budget is ${Math.round(percentUsed)}% used. Consider optimizing spend.`,
        data: {
          currentSpend: budget.spent,
          budgetLimit: budget.allocated,
          percentageUsed: percentUsed,
          timeframe: 'monthly',
        },
        triggeredAt: new Date().toISOString(),
      });
    }

    // Save alerts
    if (alerts.length > 0) {
      await this.supabase
        .from('sms_cost_alerts')
        .insert(alerts.map(alert => ({
          id: alert.id,
          tenant_id: alert.tenantId,
          alert_type: alert.type,
          severity: alert.severity,
          message: alert.message,
          alert_data: alert.data,
          triggered_at: alert.triggeredAt,
        })));
    }
  }

  private async getBudgetStatus(tenantId: string): Promise<SMSCostMetrics['budget']> {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const settings = await this.getCostOptimizationSettings(tenantId);

    // Get current month spending
    const { data: monthlySpend } = await this.supabase
      .rpc('get_monthly_sms_spend', {
        p_tenant_id: tenantId,
        p_month: currentMonth,
      });

    const spent = monthlySpend?.[0]?.total_cost || 0;
    const allocated = settings.budget.monthlyLimit;
    const remaining = Math.max(allocated - spent, 0);

    // Calculate burn rate (average daily spend)
    const daysInMonth = new Date().getDate();
    const burnRate = daysInMonth > 0 ? Math.round(spent / daysInMonth) : 0;

    // Project monthly spend
    const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - daysInMonth;
    const projectedMonthlySpend = spent + (burnRate * daysRemaining);

    return {
      allocated,
      spent,
      remaining,
      projectedMonthlySpend,
      burnRate,
    };
  }

  private calculateTypeBreakdown(costs: any[]): Record<string, { count: number; cost: number; engagement: number }> {
    const breakdown: Record<string, { count: number; cost: number; engagement: number }> = {};

    for (const cost of costs) {
      const type = cost.message_type || 'unknown';
      if (!breakdown[type]) {
        breakdown[type] = { count: 0, cost: 0, engagement: 0 };
      }
      breakdown[type].count++;
      breakdown[type].cost += cost.cost_cents || 0;
      if (cost.response_received) {
        breakdown[type].engagement++;
      }
    }

    return breakdown;
  }

  private calculateCountryBreakdown(costs: any[]): Record<string, { count: number; cost: number; avgCostPerMessage: number }> {
    const breakdown: Record<string, { count: number; cost: number; avgCostPerMessage: number }> = {};

    for (const cost of costs) {
      const country = cost.country_code || 'unknown';
      if (!breakdown[country]) {
        breakdown[country] = { count: 0, cost: 0, avgCostPerMessage: 0 };
      }
      breakdown[country].count++;
      breakdown[country].cost += cost.cost_cents || 0;
    }

    // Calculate averages
    for (const country in breakdown) {
      const data = breakdown[country];
      data.avgCostPerMessage = data.count > 0 ? Math.round(data.cost / data.count) : 0;
    }

    return breakdown;
  }

  private calculateTimeBreakdown(costs: any[]): Array<{ hour: number; count: number; cost: number; engagement: number }> {
    const breakdown = new Map<number, { count: number; cost: number; engagement: number }>();

    for (const cost of costs) {
      const hour = new Date(cost.sent_at).getHours();
      if (!breakdown.has(hour)) {
        breakdown.set(hour, { count: 0, cost: 0, engagement: 0 });
      }
      const data = breakdown.get(hour)!;
      data.count++;
      data.cost += cost.cost_cents || 0;
      if (cost.response_received) {
        data.engagement++;
      }
    }

    return Array.from(breakdown.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour - b.hour);
  }

  private async getOptOutCount(tenantId: string, startDate: string, endDate: string): Promise<number> {
    const { count } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('sms_enabled', false)
      .gte('updated_at', startDate)
      .lt('updated_at', endDate);

    return count || 0;
  }

  private calculateROI(cost: number, sessions: number, goals: number): number {
    // Estimate value: $2 per session, $10 per goal completion
    const estimatedValue = (sessions * 200) + (goals * 1000); // in cents
    return cost > 0 ? Math.round(((estimatedValue - cost) / cost) * 100) : 0;
  }

  private identifyInefficiencies(metrics: SMSCostMetrics, engagementScores: UserEngagementScore[]): string[] {
    const inefficiencies: string[] = [];

    if (metrics.metrics.responseRate < 15) {
      inefficiencies.push('Low response rate indicates poor message targeting or timing');
    }

    if (metrics.metrics.avgCostPerMessage > 800) {
      inefficiencies.push('High cost per message suggests need for compression or shorter messages');
    }

    const inactiveUsers = engagementScores.filter(s => s.segment === 'inactive').length;
    if (inactiveUsers > engagementScores.length * 0.25) {
      inefficiencies.push('High percentage of inactive users receiving SMS notifications');
    }

    if (metrics.metrics.optOutRate > 5) {
      inefficiencies.push('High opt-out rate indicates message frequency or content issues');
    }

    return inefficiencies;
  }

  private getDefaultCostSettings(tenantId: string): SMSCostOptimizationSettings {
    return {
      tenantId,
      budget: {
        monthlyLimit: 10000, // $100
        dailyLimit: 500, // $5
        alertThresholds: {
          warning: 80,
          critical: 95,
        },
        autoStopAtLimit: true,
      },
      optimization: {
        enableCompression: true,
        enableBatching: true,
        enableChannelSwitching: true,
        priorityThresholds: {
          high: 1200, // 12 cents
          medium: 800, // 8 cents
          low: 500, // 5 cents
        },
      },
      segmentation: {
        enableUserSegmentation: true,
        highValueUserThreshold: 70,
        costPerSegment: {
          high_value: 1000, // 10 cents
          medium_value: 600, // 6 cents
          low_value: 400, // 4 cents
          inactive: 200, // 2 cents
        },
      },
      fallbacks: {
        enableFallbackChannels: true,
        fallbackOrder: ['push', 'in_app', 'email'],
        costThresholdForFallback: 800, // 8 cents
      },
    };
  }
}

export default SMSCostAnalyticsService;