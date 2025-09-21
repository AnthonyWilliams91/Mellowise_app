/**
 * Notification Delivery Service with Error Recovery
 * MELLOWISE-015: Handles multi-channel notification delivery with comprehensive error recovery
 */

import { Notification, NotificationChannel, NotificationQueueItem, ChannelPreference, DeliveryPriority } from '@/types/notifications';
import { createServerClient } from '@/lib/supabase/server';
import { TwilioSMSService } from './twilio-service';
import PushService from './push-service';
import { ErrorRecoveryManager } from './error-recovery-manager';
import { RetryEngine } from './retry-engine';
import { ChannelFallbackService } from './channel-fallback';
import { DeadLetterQueue } from './dead-letter-queue';
import { HealthMonitor } from './health-monitor';
import { RecoveryOrchestrator } from './recovery-orchestrator';

// Email service (would use SendGrid, Resend, etc.)
interface EmailService {
  send(to: string, subject: string, html: string, text?: string): Promise<boolean>;
}

/**
 * Enhanced Notification Delivery Service with Error Recovery
 */
export class NotificationDeliveryService {
  private supabase;
  private emailService?: EmailService;
  private pushService: PushService;
  private smsService: TwilioSMSService;

  // Error recovery components
  private errorRecoveryManager: ErrorRecoveryManager;
  private retryEngine: RetryEngine;
  private channelFallback: ChannelFallbackService;
  private deadLetterQueue: DeadLetterQueue;
  private healthMonitor: HealthMonitor;
  private recoveryOrchestrator: RecoveryOrchestrator;

  constructor() {
    this.supabase = createServerClient();
    this.smsService = new TwilioSMSService();
    this.pushService = new PushService();

    // Initialize error recovery system
    this.initializeErrorRecovery();

    // Initialize external services
    this.initializeServices();
  }

  /**
   * Initialize error recovery components
   */
  private initializeErrorRecovery(): void {
    this.retryEngine = new RetryEngine();
    this.errorRecoveryManager = new ErrorRecoveryManager();
    this.channelFallback = new ChannelFallbackService();
    this.deadLetterQueue = new DeadLetterQueue();
    this.healthMonitor = new HealthMonitor();
    this.recoveryOrchestrator = new RecoveryOrchestrator(
      this.errorRecoveryManager,
      this.retryEngine,
      this.channelFallback,
      this.healthMonitor
    );

    // Start health monitoring
    this.healthMonitor.startMonitoring();
  }

  /**
   * Initialize external notification services
   */
  private initializeServices() {
    // Initialize email service (e.g., SendGrid)
    if (process.env.SENDGRID_API_KEY) {
      // this.emailService = new SendGridService(process.env.SENDGRID_API_KEY);
    }
  }

  /**
   * Process notification queue
   */
  async processQueue(): Promise<void> {
    // Get pending notifications scheduled for now or earlier
    const { data: queue } = await this.supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(100);

    if (!queue || queue.length === 0) return;

    // Process each notification in parallel
    const promises = queue.map(item => this.processQueueItem(item));
    await Promise.allSettled(promises);
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: NotificationQueueItem): Promise<void> {
    try {
      // Update status to processing
      await this.updateQueueItemStatus(item.id, 'processing');

      // Send to each channel
      const results = await Promise.allSettled(
        item.notification.channels.map(channel =>
          this.sendToChannel(item.notification, channel)
        )
      );

      // Check if at least one channel succeeded
      const anySuccess = results.some(r => r.status === 'fulfilled' && r.value);

      if (anySuccess) {
        await this.updateQueueItemStatus(item.id, 'sent');
        await this.markNotificationSent(item.notification.id);
      } else {
        // Retry logic
        if (item.retries < item.maxRetries) {
          await this.scheduleRetry(item);
        } else {
          await this.updateQueueItemStatus(item.id, 'failed', 'All delivery channels failed');
        }
      }
    } catch (error) {
      console.error('Error processing notification:', error);
      await this.updateQueueItemStatus(item.id, 'failed', String(error));
    }
  }

  /**
   * Send notification to specific channel with error recovery
   */
  private async sendToChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<boolean> {
    const operationId = `send_${notification.id}_${channel}`;

    try {
      // Execute with circuit breaker protection
      return await this.errorRecoveryManager.executeWithProtection(
        channel,
        async () => {
          const startTime = Date.now();
          let success = false;

          try {
            switch (channel) {
              case 'email':
                success = await this.sendEmail(notification);
                break;
              case 'push':
                success = await this.sendPush(notification);
                break;
              case 'in_app':
                success = await this.sendInApp(notification);
                break;
              case 'sms':
                success = await this.sendSMS(notification);
                break;
              default:
                throw new Error(`Unknown notification channel: ${channel}`);
            }

            // Log successful delivery
            await this.logDeliveryResult(notification, channel, success, Date.now() - startTime);
            return success;

          } catch (error) {
            // Log failed delivery
            await this.logDeliveryResult(notification, channel, false, Date.now() - startTime, String(error));
            throw error;
          }
        },
        // Fallback function for circuit breaker open state
        async () => {
          return await this.executeFallbackDelivery(notification, channel);
        }
      );

    } catch (error) {
      // Handle error with recovery system
      return await this.handleDeliveryError(notification, channel, error);
    }
  }

  /**
   * Handle delivery error with comprehensive recovery
   */
  private async handleDeliveryError(
    notification: Notification,
    channel: NotificationChannel,
    error: any
  ): Promise<boolean> {
    const context = {
      service: channel,
      operation: 'send_notification',
      userId: notification.userId,
      notificationId: notification.id,
      channel,
      metadata: { notification }
    };

    try {
      // Classify error and determine recovery strategy
      const strategy = await this.errorRecoveryManager.classifyAndRecover(error, context);

      // Execute fallback if available
      if (strategy.fallbackChannels.length > 0) {
        const userPreferences = await this.getUserChannelPreferences(notification.userId);
        const fallbackResult = await this.channelFallback.executeFallback(
          channel,
          {
            userId: notification.userId,
            priority: notification.priority as DeliveryPriority,
            urgency: 'medium',
            requiresRichContent: false
          },
          userPreferences,
          String(error)
        );

        if (fallbackResult.fallbackChannel) {
          return await this.sendToChannel(notification, fallbackResult.fallbackChannel);
        }
      }

      // If all recovery attempts fail, add to dead letter queue
      await this.deadLetterQueue.addToDeadLetterQueue(
        notification.id,
        this.mapErrorToFailureReason(error),
        {
          userId: notification.userId,
          channel,
          priority: notification.priority as any,
          attempts: 1,
          lastError: String(error),
          metadata: { originalChannel: channel }
        }
      );

      return false;

    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Execute fallback delivery when circuit breaker is open
   */
  private async executeFallbackDelivery(
    notification: Notification,
    originalChannel: NotificationChannel
  ): Promise<boolean> {
    try {
      const userPreferences = await this.getUserChannelPreferences(notification.userId);

      const { fallbackChannel } = await this.channelFallback.executeFallback(
        originalChannel,
        {
          userId: notification.userId,
          priority: notification.priority as DeliveryPriority,
          urgency: 'medium'
        },
        userPreferences,
        'Circuit breaker open'
      );

      if (fallbackChannel && fallbackChannel !== originalChannel) {
        return await this.sendToChannel(notification, fallbackChannel);
      }

      return false;
    } catch (error) {
      console.error('Fallback delivery failed:', error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<boolean> {
    if (!this.emailService) {
      console.warn('Email service not configured');
      return false;
    }

    // Get user email
    const { data: user } = await this.supabase
      .from('users')
      .select('email')
      .eq('id', notification.userId)
      .single();

    if (!user?.email) return false;

    // Format email content
    const html = this.formatEmailHtml(notification);
    const text = this.formatEmailText(notification);

    try {
      return await this.emailService.send(
        user.email,
        notification.title,
        html,
        text
      );
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: Notification): Promise<boolean> {
    try {
      const results = await this.pushService.sendFromNotification(notification);

      // Consider successful if at least one push was delivered
      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        console.log(`Push notification sent to ${successCount} device(s) for user ${notification.userId}`);
        return true;
      } else {
        console.warn(`Failed to send push notification to any device for user ${notification.userId}`);
        return false;
      }
    } catch (error) {
      console.error('Push send error:', error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInApp(notification: Notification): Promise<boolean> {
    // Store in-app notification in database
    const { error } = await this.supabase
      .from('in_app_notifications')
      .insert({
        user_id: notification.userId,
        notification_id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        data: notification.data,
        read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('In-app notification error:', error);
      return false;
    }

    // Trigger real-time update if user is online
    await this.triggerRealtimeUpdate(notification.userId, notification);

    return true;
  }

  /**
   * Send SMS notification via Twilio
   */
  private async sendSMS(notification: Notification): Promise<boolean> {
    try {
      return await this.smsService.sendSMS(notification);
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  /**
   * Format email HTML content
   */
  private formatEmailHtml(notification: Notification): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">${notification.title}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; line-height: 1.6; color: #2d3748;">
                ${notification.message}
              </p>
              ${this.getEmailCTA(notification)}
            </div>
            <div class="footer">
              <p>You're receiving this because you have notifications enabled for Mellowise.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #667eea;">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Format email text content
   */
  private formatEmailText(notification: Notification): string {
    return `${notification.title}\n\n${notification.message}\n\n---\nManage notifications: ${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`;
  }

  /**
   * Get email CTA based on notification type
   */
  private getEmailCTA(notification: Notification): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    switch (notification.type) {
      case 'study_reminder':
        return `<a href="${baseUrl}/dashboard/practice" class="button">Start Studying</a>`;
      case 'goal_deadline':
        return `<a href="${baseUrl}/goals" class="button">View Goal Progress</a>`;
      case 'streak_maintenance':
        return `<a href="${baseUrl}/dashboard" class="button">Keep Your Streak Alive</a>`;
      case 'achievement':
        return `<a href="${baseUrl}/dashboard/achievements" class="button">View Achievement</a>`;
      case 'break_reminder':
        return `<p style="margin-top: 20px; padding: 15px; background: #f7fafc; border-radius: 5px;">
                  Take a 10-minute break to recharge. Your brain will thank you! 🧠
                </p>`;
      default:
        return `<a href="${baseUrl}/dashboard" class="button">Open Mellowise</a>`;
    }
  }

  /**
   * Trigger real-time update for in-app notifications
   */
  private async triggerRealtimeUpdate(userId: string, notification: Notification): Promise<void> {
    // Use Supabase Realtime to notify connected clients
    // This would integrate with your real-time subscription system
    try {
      await this.supabase
        .from('realtime_events')
        .insert({
          user_id: userId,
          event_type: 'notification',
          payload: notification,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Realtime update error:', error);
    }
  }

  /**
   * Update queue item status
   */
  private async updateQueueItemStatus(
    id: string,
    status: NotificationQueueItem['status'],
    error?: string
  ): Promise<void> {
    await this.supabase
      .from('notification_queue')
      .update({ status, error, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  /**
   * Mark notification as sent
   */
  private async markNotificationSent(notificationId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', notificationId);
  }

  /**
   * Schedule retry for failed notification
   */
  private async scheduleRetry(item: NotificationQueueItem): Promise<void> {
    const nextRetry = new Date();
    nextRetry.setMinutes(nextRetry.getMinutes() + Math.pow(2, item.retries) * 5); // Exponential backoff

    await this.supabase
      .from('notification_queue')
      .update({
        status: 'pending',
        retries: item.retries + 1,
        next_retry: nextRetry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);
  }

  /**
   * Get user channel preferences for fallback decisions
   */
  private async getUserChannelPreferences(userId: string): Promise<ChannelPreference[]> {
    const { data: preferences } = await this.supabase
      .from('notification_preferences')
      .select('channels')
      .eq('user_id', userId)
      .single();

    if (!preferences?.channels) {
      // Default preferences
      return [
        { channel: 'in_app', enabled: true, priority: 1 },
        { channel: 'email', enabled: true, priority: 2 },
        { channel: 'push', enabled: true, priority: 3 },
        { channel: 'sms', enabled: false, priority: 4 }
      ];
    }

    // Convert preference object to array format
    const channelPrefs: ChannelPreference[] = [];
    let priority = 1;

    if (preferences.channels.inApp) {
      channelPrefs.push({ channel: 'in_app', enabled: true, priority: priority++ });
    }
    if (preferences.channels.email) {
      channelPrefs.push({ channel: 'email', enabled: true, priority: priority++ });
    }
    if (preferences.channels.push) {
      channelPrefs.push({ channel: 'push', enabled: true, priority: priority++ });
    }
    if (preferences.channels.sms) {
      channelPrefs.push({ channel: 'sms', enabled: true, priority: priority++ });
    }

    return channelPrefs;
  }

  /**
   * Map error to dead letter queue failure reason
   */
  private mapErrorToFailureReason(error: any): import('@/types/notifications').FailureReason {
    const errorMessage = String(error).toLowerCase();

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return 'rate_limit_exceeded';
    }
    if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
      return 'authentication_failed';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return 'network_timeout';
    }
    if (errorMessage.includes('invalid recipient') || errorMessage.includes('invalid email')) {
      return 'invalid_recipient';
    }
    if (errorMessage.includes('content rejected') || errorMessage.includes('spam')) {
      return 'content_rejected';
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit exceeded')) {
      return 'quota_exceeded';
    }
    if (errorMessage.includes('service unavailable') || errorMessage.includes('503')) {
      return 'temporary_service_unavailable';
    }
    if (errorMessage.includes('configuration') || errorMessage.includes('api key')) {
      return 'service_configuration_error';
    }

    return 'unknown_error';
  }

  /**
   * Log delivery result for monitoring and analytics
   */
  private async logDeliveryResult(
    notification: Notification,
    channel: NotificationChannel,
    success: boolean,
    latency: number,
    error?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('notification_delivery_logs')
        .insert({
          id: crypto.randomUUID(),
          notification_id: notification.id,
          user_id: notification.userId,
          channel,
          success,
          latency_ms: latency,
          error_message: error,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log delivery result:', logError);
    }
  }

  /**
   * Get error recovery system health status
   */
  async getSystemHealthStatus(): Promise<import('@/types/notifications').SystemHealthDashboard> {
    return await this.healthMonitor.getSystemHealth();
  }

  /**
   * Get error recovery metrics
   */
  async getErrorRecoveryMetrics(timeWindow: number = 24): Promise<import('@/types/notifications').ErrorRecoveryMetrics> {
    return await this.errorRecoveryManager.getRecoveryMetrics(timeWindow);
  }

  /**
   * Get dead letter queue metrics
   */
  async getDeadLetterMetrics(timeWindow: number = 24): Promise<import('@/types/notifications').DeadLetterMetrics> {
    return await this.deadLetterQueue.getMetrics(timeWindow);
  }

  /**
   * Get channel fallback metrics
   */
  async getFallbackMetrics(timeWindow: number = 24): Promise<import('@/types/notifications').FallbackMetrics> {
    return await this.channelFallback.getFallbackMetrics(timeWindow);
  }

  /**
   * Force recovery for a specific service
   */
  async forceServiceRecovery(serviceId: string, strategy: 'reset' | 'restart' | 'failover'): Promise<boolean> {
    return await this.errorRecoveryManager.forceRecovery(serviceId, strategy);
  }

  /**
   * Execute recovery workflow
   */
  async executeRecoveryWorkflow(
    templateId: string,
    context: Partial<import('@/types/notifications').RecoveryContext>
  ): Promise<import('@/types/notifications').RecoveryResult> {
    return await this.recoveryOrchestrator.executeRecoveryWorkflow(templateId, context);
  }

  /**
   * Get channel availability status
   */
  getChannelAvailability(): Record<NotificationChannel, import('@/types/notifications').ChannelAvailability> {
    return this.channelFallback.getChannelAvailability();
  }

  /**
   * Clean up old error recovery data
   */
  async cleanupOldData(maxAge: number = 30): Promise<{ removedItems: number }> {
    const removedItems = await this.deadLetterQueue.cleanupOldItems(maxAge);
    return { removedItems };
  }
}