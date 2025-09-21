/**
 * Monitored Notification Service
 * MELLOWISE-015: Notification service with comprehensive performance monitoring
 *
 * Features:
 * - Full integration with performance monitoring system
 * - Real-time delivery tracking and metrics
 * - Automatic alerting on delivery failures
 * - Cost tracking and budget monitoring
 * - SLA compliance monitoring
 */

import { NotificationService } from './notification-service';
import { performanceCollector } from '../monitoring/performance-collector';
import { serviceMonitor } from '../monitoring/service-monitor';
import { alertManager } from '../monitoring/alert-manager';
import { createServerClient } from '@/lib/supabase/server';
import {
  Notification,
  NotificationChannel,
  NotificationType,
  CreateNotificationRequest,
} from '@/types/notifications';

// =============================================
// ENHANCED INTERFACES
// =============================================

export interface MonitoredNotificationRequest extends CreateNotificationRequest {
  trackingId?: string;
  budget?: {
    maxCost: number;
    currency: string;
  };
  slaRequirements?: {
    maxDeliveryTime: number; // ms
    minSuccessRate: number; // 0-1
  };
}

export interface NotificationDeliveryResult {
  notificationId: string;
  channel: NotificationChannel;
  success: boolean;
  deliveryTime: number; // ms
  cost?: number;
  error?: string;
  metadata: {
    attempt: number;
    provider: string;
    messageId?: string;
    trackingId?: string;
  };
}

export interface NotificationMetrics {
  totalNotifications: number;
  deliverySuccessRate: number;
  avgDeliveryTime: number;
  costByChannel: Record<NotificationChannel, number>;
  channelPerformance: Record<NotificationChannel, {
    successRate: number;
    avgDeliveryTime: number;
    totalCost: number;
  }>;
  slaCompliance: number;
  alertsTriggered: number;
}

// =============================================
// MONITORED NOTIFICATION SERVICE
// =============================================

export class MonitoredNotificationService extends NotificationService {
  private supabase;
  private costBudgets: Map<string, { limit: number; spent: number; currency: string }> = new Map();
  private slaThresholds = {
    maxDeliveryTime: 30000, // 30 seconds
    minSuccessRate: 0.95, // 95%
    alertThreshold: 0.9, // Alert at 90%
  };

  constructor() {
    super();
    this.supabase = createServerClient();
    this.initializeBudgetTracking();
    this.setupMonitoringAlerts();
  }

  /**
   * Create and deliver a monitored notification
   */
  async createMonitoredNotification(request: MonitoredNotificationRequest): Promise<{
    notification: Notification;
    deliveryResults: NotificationDeliveryResult[];
    metrics: {
      totalDeliveryTime: number;
      successRate: number;
      totalCost: number;
    };
  }> {
    const startTime = performance.now();
    const trackingId = request.trackingId || crypto.randomUUID();

    // Create the notification using parent service
    const notification = await this.createNotification(request);

    // Track notification creation
    performanceCollector.recordMetric(
      'notification.created',
      1,
      {
        type: request.type,
        priority: request.priority || 'medium',
        channels: (request.channels || []).join(','),
        trackingId,
      },
      request.tenantId,
      request.userId
    );

    // Deliver to each channel with monitoring
    const deliveryResults: NotificationDeliveryResult[] = [];
    let totalCost = 0;
    let successfulDeliveries = 0;

    for (const channel of notification.channels) {
      try {
        const result = await this.deliverToChannelWithMonitoring(
          notification,
          channel,
          trackingId,
          request.tenantId
        );

        deliveryResults.push(result);

        if (result.success) {
          successfulDeliveries++;
        }

        if (result.cost) {
          totalCost += result.cost;
          await this.trackCost(channel, result.cost, request.tenantId);
        }

        // Check budget constraints
        if (request.budget) {
          await this.checkBudgetCompliance(request.budget, totalCost, trackingId);
        }

      } catch (error) {
        const failureResult: NotificationDeliveryResult = {
          notificationId: notification.id,
          channel,
          success: false,
          deliveryTime: 0,
          error: (error as Error).message,
          metadata: {
            attempt: 1,
            provider: this.getProviderForChannel(channel),
            trackingId,
          },
        };

        deliveryResults.push(failureResult);

        // Record failure metrics
        performanceCollector.recordNotificationDelivery(
          notification.id,
          channel,
          startTime,
          performance.now(),
          false,
          request.tenantId,
          request.userId
        );
      }
    }

    const endTime = performance.now();
    const totalDeliveryTime = endTime - startTime;
    const successRate = successfulDeliveries / notification.channels.length;

    // Check SLA compliance
    if (request.slaRequirements) {
      await this.checkSlaCompliance(
        request.slaRequirements,
        totalDeliveryTime,
        successRate,
        trackingId
      );
    }

    // Record overall metrics
    performanceCollector.recordMetric(
      'notification.delivery.completed',
      1,
      {
        trackingId,
        successRate: successRate.toString(),
        totalCost: totalCost.toString(),
        channels: notification.channels.join(','),
      },
      request.tenantId,
      request.userId
    );

    return {
      notification,
      deliveryResults,
      metrics: {
        totalDeliveryTime,
        successRate,
        totalCost,
      },
    };
  }

  /**
   * Deliver notification to specific channel with full monitoring
   */
  private async deliverToChannelWithMonitoring(
    notification: Notification,
    channel: NotificationChannel,
    trackingId: string,
    tenantId?: string
  ): Promise<NotificationDeliveryResult> {
    const startTime = performance.now();
    const provider = this.getProviderForChannel(channel);

    try {
      let deliveryResult: any;
      let cost = 0;

      switch (channel) {
        case 'email':
          deliveryResult = await serviceMonitor.monitorServiceCall(
            'email_provider',
            'send_email',
            () => this.sendEmail(notification),
            { notificationId: notification.id, trackingId }
          );
          cost = this.calculateEmailCost(notification.message.length);
          break;

        case 'sms':
          deliveryResult = await serviceMonitor.monitorServiceCall(
            'twilio',
            'send_sms',
            () => this.sendSMS(notification),
            { notificationId: notification.id, trackingId }
          );
          cost = this.calculateSMSCost(notification.message.length);
          break;

        case 'push':
          deliveryResult = await serviceMonitor.monitorServiceCall(
            'firebase',
            'send_push',
            () => this.sendPushNotification(notification),
            { notificationId: notification.id, trackingId }
          );
          cost = 0; // Push notifications are typically free
          break;

        case 'in_app':
          deliveryResult = await this.sendInAppNotification(notification);
          cost = 0; // In-app notifications have no external cost
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      const endTime = performance.now();
      const deliveryTime = endTime - startTime;

      // Record successful delivery
      performanceCollector.recordNotificationDelivery(
        notification.id,
        channel,
        startTime,
        endTime,
        true,
        tenantId,
        notification.userId
      );

      // Record user engagement tracking
      await this.setupEngagementTracking(notification, channel, trackingId);

      return {
        notificationId: notification.id,
        channel,
        success: true,
        deliveryTime,
        cost,
        metadata: {
          attempt: 1,
          provider,
          messageId: deliveryResult?.messageId,
          trackingId,
        },
      };

    } catch (error) {
      const endTime = performance.now();

      // Record failed delivery
      performanceCollector.recordNotificationDelivery(
        notification.id,
        channel,
        startTime,
        endTime,
        false,
        tenantId,
        notification.userId
      );

      // Check if we should trigger alerts
      await this.checkDeliveryFailureAlerts(channel, error as Error, trackingId);

      throw error;
    }
  }

  /**
   * Get comprehensive notification metrics
   */
  async getNotificationMetrics(
    timeWindow: string = '24h',
    tenantId?: string
  ): Promise<NotificationMetrics> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    // Get notification performance data
    const kpis = await performanceCollector.getCurrentKPIs(tenantId, timeWindow);

    // Get detailed metrics from database
    const { data: deliveryMetrics } = await this.supabase
      .from('performance_metrics')
      .select('*')
      .eq('metric_name', 'notification.delivery.latency')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString());

    const { data: costMetrics } = await this.supabase
      .from('service_costs')
      .select('*')
      .in('service_name', ['twilio', 'sendgrid', 'resend'])
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString());

    // Calculate channel-specific performance
    const channelPerformance = this.calculateChannelPerformance(deliveryMetrics || []);

    // Calculate cost by channel
    const costByChannel = this.calculateCostByChannel(costMetrics || []);

    // Get alert count
    const { data: alerts } = await this.supabase
      .from('alerts')
      .select('count')
      .eq('component', 'notifications')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString());

    return {
      totalNotifications: deliveryMetrics?.length || 0,
      deliverySuccessRate: kpis.deliverySuccessRate,
      avgDeliveryTime: kpis.deliveryLatency,
      costByChannel,
      channelPerformance,
      slaCompliance: this.calculateSlaCompliance(kpis),
      alertsTriggered: alerts?.length || 0,
    };
  }

  /**
   * Set up real-time monitoring alerts
   */
  private async setupMonitoringAlerts(): Promise<void> {
    // High delivery latency alert
    await alertManager.createAlertRule({
      name: 'High Notification Delivery Latency',
      description: 'Alert when notification delivery takes longer than 30 seconds',
      enabled: true,
      metric: 'notification.delivery.latency',
      conditions: [
        {
          operator: 'gt',
          threshold: 30000,
          duration: '5m',
          severity: 'high',
        },
      ],
      actions: [
        {
          type: 'email',
          config: {
            recipients: ['alerts@mellowise.com'],
          },
          conditions: {
            severities: ['high', 'critical'],
          },
        },
      ],
      suppressionRules: [],
      tags: { component: 'notifications' },
    });

    // Low delivery success rate alert
    await alertManager.createAlertRule({
      name: 'Low Notification Delivery Success Rate',
      description: 'Alert when notification delivery success rate drops below 95%',
      enabled: true,
      metric: 'notification.delivery.success_rate',
      conditions: [
        {
          operator: 'lt',
          threshold: 0.95,
          duration: '10m',
          severity: 'medium',
        },
        {
          operator: 'lt',
          threshold: 0.85,
          duration: '5m',
          severity: 'critical',
        },
      ],
      actions: [
        {
          type: 'email',
          config: {
            recipients: ['alerts@mellowise.com'],
          },
          conditions: {
            severities: ['medium', 'high', 'critical'],
          },
        },
      ],
      suppressionRules: [],
      tags: { component: 'notifications' },
    });

    // High cost alert
    await alertManager.createAlertRule({
      name: 'High Notification Costs',
      description: 'Alert when notification costs exceed budget',
      enabled: true,
      metric: 'notification.cost.total',
      conditions: [
        {
          operator: 'gt',
          threshold: 100, // $100 per day
          duration: '1h',
          severity: 'high',
        },
      ],
      actions: [
        {
          type: 'email',
          config: {
            recipients: ['finance@mellowise.com'],
          },
          conditions: {
            severities: ['high', 'critical'],
          },
        },
      ],
      suppressionRules: [],
      tags: { component: 'notifications', type: 'cost' },
    });
  }

  /**
   * Initialize budget tracking
   */
  private initializeBudgetTracking(): void {
    // Set default budgets for different channels
    this.costBudgets.set('email', { limit: 50, spent: 0, currency: 'USD' }); // $50/day
    this.costBudgets.set('sms', { limit: 100, spent: 0, currency: 'USD' }); // $100/day
    this.costBudgets.set('push', { limit: 0, spent: 0, currency: 'USD' }); // Free
  }

  /**
   * Track notification costs
   */
  private async trackCost(
    channel: NotificationChannel,
    cost: number,
    tenantId?: string
  ): Promise<void> {
    // Update budget tracking
    const budget = this.costBudgets.get(channel);
    if (budget) {
      budget.spent += cost;

      // Check for budget alerts
      const utilizationPercent = (budget.spent / budget.limit) * 100;
      if (utilizationPercent > 80) {
        await alertManager.fireAlert(
          'threshold',
          'notifications',
          'Budget Alert',
          `${channel} notification costs are at ${utilizationPercent.toFixed(1)}% of daily budget`,
          utilizationPercent > 95 ? 'critical' : 'medium',
          `notification.cost.${channel}`,
          budget.spent,
          budget.limit,
          { channel, currency: budget.currency },
          tenantId
        );
      }
    }

    // Record cost metrics
    performanceCollector.recordMetric(
      `notification.cost.${channel}`,
      cost,
      { channel, currency: 'USD' },
      tenantId
    );

    performanceCollector.recordMetric(
      'notification.cost.total',
      cost,
      { channel, currency: 'USD' },
      tenantId
    );
  }

  /**
   * Check budget compliance
   */
  private async checkBudgetCompliance(
    budget: { maxCost: number; currency: string },
    actualCost: number,
    trackingId: string
  ): Promise<void> {
    if (actualCost > budget.maxCost) {
      await alertManager.fireAlert(
        'threshold',
        'notifications',
        'Budget Exceeded',
        `Notification cost ${actualCost} ${budget.currency} exceeds budget ${budget.maxCost} ${budget.currency}`,
        'high',
        'notification.budget.exceeded',
        actualCost,
        budget.maxCost,
        { trackingId, currency: budget.currency }
      );
    }
  }

  /**
   * Check SLA compliance
   */
  private async checkSlaCompliance(
    slaRequirements: { maxDeliveryTime: number; minSuccessRate: number },
    actualDeliveryTime: number,
    actualSuccessRate: number,
    trackingId: string
  ): Promise<void> {
    // Check delivery time SLA
    if (actualDeliveryTime > slaRequirements.maxDeliveryTime) {
      await alertManager.fireAlert(
        'threshold',
        'notifications',
        'SLA Breach - Delivery Time',
        `Notification delivery time ${actualDeliveryTime}ms exceeds SLA ${slaRequirements.maxDeliveryTime}ms`,
        'high',
        'notification.sla.delivery_time',
        actualDeliveryTime,
        slaRequirements.maxDeliveryTime,
        { trackingId }
      );
    }

    // Check success rate SLA
    if (actualSuccessRate < slaRequirements.minSuccessRate) {
      await alertManager.fireAlert(
        'threshold',
        'notifications',
        'SLA Breach - Success Rate',
        `Notification success rate ${(actualSuccessRate * 100).toFixed(1)}% below SLA ${(slaRequirements.minSuccessRate * 100).toFixed(1)}%`,
        'critical',
        'notification.sla.success_rate',
        actualSuccessRate,
        slaRequirements.minSuccessRate,
        { trackingId }
      );
    }
  }

  /**
   * Check for delivery failure alerts
   */
  private async checkDeliveryFailureAlerts(
    channel: NotificationChannel,
    error: Error,
    trackingId: string
  ): Promise<void> {
    // Increment failure counter
    performanceCollector.recordMetric(
      `notification.delivery.failure.${channel}`,
      1,
      { channel, error: error.name, trackingId }
    );

    // Check for pattern of failures
    const recentFailures = await this.getRecentFailureCount(channel);
    if (recentFailures > 5) {
      await alertManager.fireAlert(
        'anomaly',
        'notifications',
        'Multiple Delivery Failures',
        `${recentFailures} notification delivery failures on ${channel} in the last 10 minutes`,
        'high',
        `notification.delivery.failure.${channel}`,
        recentFailures,
        5,
        { channel, error: error.message, trackingId }
      );
    }
  }

  /**
   * Set up engagement tracking for delivered notifications
   */
  private async setupEngagementTracking(
    notification: Notification,
    channel: NotificationChannel,
    trackingId: string
  ): Promise<void> {
    // Create engagement tracking record
    const { error } = await this.supabase
      .from('notification_engagement_tracking')
      .insert({
        id: crypto.randomUUID(),
        notification_id: notification.id,
        channel,
        tracking_id: trackingId,
        delivered_at: new Date().toISOString(),
        tenant_id: notification.tenantId || '00000000-0000-0000-0000-000000000000',
        user_id: notification.userId,
      });

    if (error) {
      console.error('Failed to create engagement tracking:', error);
    }
  }

  /**
   * Helper methods for cost calculations
   */
  private calculateEmailCost(messageLength: number): number {
    // Base cost per email (SendGrid pricing)
    return 0.00095; // $0.00095 per email
  }

  private calculateSMSCost(messageLength: number): number {
    // SMS cost based on message length (Twilio pricing)
    const segments = Math.ceil(messageLength / 160);
    return segments * 0.0075; // $0.0075 per SMS segment
  }

  /**
   * Get provider name for channel
   */
  private getProviderForChannel(channel: NotificationChannel): string {
    const providers: Record<NotificationChannel, string> = {
      email: 'sendgrid',
      sms: 'twilio',
      push: 'firebase',
      in_app: 'internal',
    };
    return providers[channel];
  }

  /**
   * Calculate channel-specific performance metrics
   */
  private calculateChannelPerformance(
    metrics: any[]
  ): Record<NotificationChannel, { successRate: number; avgDeliveryTime: number; totalCost: number }> {
    const performance: any = {};

    ['email', 'sms', 'push', 'in_app'].forEach(channel => {
      const channelMetrics = metrics.filter(m => m.tags?.channel === channel);
      performance[channel] = {
        successRate: this.calculateSuccessRate(channelMetrics),
        avgDeliveryTime: this.calculateAverageDeliveryTime(channelMetrics),
        totalCost: this.calculateTotalCost(channelMetrics),
      };
    });

    return performance;
  }

  /**
   * Calculate cost by channel
   */
  private calculateCostByChannel(costMetrics: any[]): Record<NotificationChannel, number> {
    const costByChannel: any = {
      email: 0,
      sms: 0,
      push: 0,
      in_app: 0,
    };

    costMetrics.forEach(metric => {
      const channel = this.mapServiceToChannel(metric.service_name);
      if (channel) {
        costByChannel[channel] += metric.cost_amount;
      }
    });

    return costByChannel;
  }

  /**
   * Map service name to notification channel
   */
  private mapServiceToChannel(serviceName: string): NotificationChannel | null {
    const mapping: Record<string, NotificationChannel> = {
      sendgrid: 'email',
      resend: 'email',
      twilio: 'sms',
      firebase: 'push',
    };
    return mapping[serviceName] || null;
  }

  /**
   * Calculate SLA compliance score
   */
  private calculateSlaCompliance(kpis: any): number {
    const deliveryTimeCompliance = kpis.deliveryLatency <= this.slaThresholds.maxDeliveryTime ? 100 : 0;
    const successRateCompliance = kpis.deliverySuccessRate >= this.slaThresholds.minSuccessRate ? 100 : 0;

    return (deliveryTimeCompliance + successRateCompliance) / 2;
  }

  /**
   * Placeholder methods for actual notification delivery
   */
  private async sendEmail(notification: Notification): Promise<any> {
    // Implementation would use actual email service
    return { messageId: `email_${Date.now()}` };
  }

  private async sendSMS(notification: Notification): Promise<any> {
    // Implementation would use Twilio or similar
    return { messageId: `sms_${Date.now()}` };
  }

  private async sendPushNotification(notification: Notification): Promise<any> {
    // Implementation would use Firebase or similar
    return { messageId: `push_${Date.now()}` };
  }

  private async sendInAppNotification(notification: Notification): Promise<any> {
    // Implementation would store in database for in-app display
    return { messageId: `inapp_${Date.now()}` };
  }

  /**
   * Helper methods
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid time window: ${timeWindow}`);

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Invalid time unit: ${unit}`);
    }
  }

  private async getRecentFailureCount(channel: NotificationChannel): Promise<number> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const { data } = await this.supabase
      .from('performance_metrics')
      .select('value')
      .eq('metric_name', `notification.delivery.failure.${channel}`)
      .gte('timestamp', tenMinutesAgo.toISOString());

    return data?.reduce((sum, metric) => sum + metric.value, 0) || 0;
  }

  private calculateSuccessRate(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const successful = metrics.filter(m => m.success).length;
    return successful / metrics.length;
  }

  private calculateAverageDeliveryTime(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const totalTime = metrics.reduce((sum, m) => sum + m.value, 0);
    return totalTime / metrics.length;
  }

  private calculateTotalCost(metrics: any[]): number {
    return metrics.reduce((sum, m) => sum + (m.cost || 0), 0);
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const monitoredNotificationService = new MonitoredNotificationService();