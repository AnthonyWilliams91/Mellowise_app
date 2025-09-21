/**
 * Web Push Service
 * MELLOWISE-015: Server-side push notification delivery with VAPID integration
 */

import webpush from 'web-push';
import { createServerClient } from '@/lib/supabase/server';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  PushSubscriptionInfo
} from '@/types/notifications';

// Configure VAPID details
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:notifications@mellowise.com';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn('VAPID keys not configured - push notifications will not work');
}

export interface PushSubscription {
  id: string;
  userId: string;
  tenantId: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  ttl?: number;
}

export interface PushDeliveryOptions {
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
  topic?: string; // Collapse notifications with same topic
  headers?: Record<string, string>;
}

export interface PushDeliveryResult {
  success: boolean;
  subscriptionId: string;
  endpoint: string;
  statusCode?: number;
  error?: string;
  retryAfter?: number;
  subscriptionExpired?: boolean;
}

export interface PushAnalytics {
  notificationId: string;
  subscriptionId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  sentAt: string;
  deliveryResult: {
    success: boolean;
    statusCode?: number;
    error?: string;
    latency: number;
  };
  deviceInfo?: {
    userAgent: string;
    endpoint: string;
  };
}

/**
 * Web Push Service for sending push notifications
 */
export class PushService {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Generate VAPID keys (development utility)
   */
  static generateVapidKeys() {
    return webpush.generateVAPIDKeys();
  }

  /**
   * Get VAPID public key for client subscription
   */
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  /**
   * Save push subscription to database
   */
  async saveSubscription(
    userId: string,
    subscription: PushSubscriptionInfo,
    userAgent?: string
  ): Promise<string> {
    try {
      const subscriptionData = {
        id: crypto.randomUUID(),
        user_id: userId,
        tenant_id: '00000000-0000-0000-0000-000000000000', // Default tenant
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: userAgent,
        is_active: true,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };

      // Check for existing subscription with same endpoint
      const { data: existing } = await this.supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint)
        .single();

      if (existing) {
        // Update existing subscription
        const { error } = await this.supabase
          .from('push_subscriptions')
          .update({
            p256dh_key: subscription.keys.p256dh,
            auth_key: subscription.keys.auth,
            user_agent: userAgent,
            is_active: true,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        return existing.id;
      } else {
        // Create new subscription
        const { data, error } = await this.supabase
          .from('push_subscriptions')
          .insert(subscriptionData)
          .select('id')
          .single();

        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw new Error('Failed to save push subscription');
    }
  }

  /**
   * Remove push subscription
   */
  async removeSubscription(endpoint: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('endpoint', endpoint);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing push subscription:', error);
      throw new Error('Failed to remove push subscription');
    }
  }

  /**
   * Get user's active push subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const { data, error } = await this.supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(this.mapDatabaseSubscription);
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  }

  /**
   * Send push notification to specific user
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
    options: PushDeliveryOptions = {}
  ): Promise<PushDeliveryResult[]> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        console.warn(`No active push subscriptions found for user ${userId}`);
        return [];
      }

      const results = await Promise.allSettled(
        subscriptions.map(subscription =>
          this.sendToSubscription(subscription, payload, options)
        )
      );

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            subscriptionId: subscriptions[index].id,
            endpoint: subscriptions[index].endpoint,
            error: result.reason?.message || 'Unknown error'
          };
        }
      });
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      throw error;
    }
  }

  /**
   * Send push notification to specific subscription
   */
  async sendToSubscription(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
    options: PushDeliveryOptions = {}
  ): Promise<PushDeliveryResult> {
    const startTime = Date.now();

    try {
      // Build push subscription object
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dhKey,
          auth: subscription.authKey
        }
      };

      // Build notification payload
      const notificationPayload = this.buildNotificationPayload(payload);

      // Build push options
      const pushOptions = this.buildPushOptions(payload, options);

      // Send push notification
      const response = await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(notificationPayload),
        pushOptions
      );

      // Update subscription last used
      await this.updateSubscriptionLastUsed(subscription.id);

      const result: PushDeliveryResult = {
        success: true,
        subscriptionId: subscription.id,
        endpoint: subscription.endpoint,
        statusCode: response.statusCode
      };

      // Store analytics
      await this.storeAnalytics(subscription, payload, result, Date.now() - startTime);

      return result;

    } catch (error: any) {
      console.error('Error sending push notification:', error);

      const result: PushDeliveryResult = {
        success: false,
        subscriptionId: subscription.id,
        endpoint: subscription.endpoint,
        statusCode: error.statusCode,
        error: error.message || 'Unknown error'
      };

      // Handle specific error cases
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription expired or invalid
        result.subscriptionExpired = true;
        await this.markSubscriptionInactive(subscription.id);
      } else if (error.statusCode === 429) {
        // Rate limited
        result.retryAfter = parseInt(error.headers?.['retry-after']) || 3600;
      }

      // Store analytics even for failures
      await this.storeAnalytics(subscription, payload, result, Date.now() - startTime);

      return result;
    }
  }

  /**
   * Send push notification from existing notification object
   */
  async sendFromNotification(notification: Notification): Promise<PushDeliveryResult[]> {
    const payload: PushNotificationPayload = {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      data: {
        notificationId: notification.id,
        userId: notification.userId,
        ...notification.data,
        ...notification.metadata
      },
      url: this.getNotificationUrl(notification),
      tag: `${notification.type}_${notification.userId}`,
      timestamp: Date.now()
    };

    // Set type-specific options
    this.enhancePayloadForType(payload, notification);

    const options: PushDeliveryOptions = {
      urgency: this.getUrgencyFromPriority(notification.priority),
      ttl: this.getTtlFromPriority(notification.priority)
    };

    return await this.sendToUser(notification.userId, payload, options);
  }

  /**
   * Send test push notification
   */
  async sendTestNotification(
    userId: string,
    message: string = 'Test notification from Mellowise! 🚀'
  ): Promise<PushDeliveryResult[]> {
    const payload: PushNotificationPayload = {
      title: '🧪 Test Notification',
      message,
      type: 'achievement', // Use achievement for positive testing experience
      priority: 'medium',
      data: { test: true },
      tag: 'test-notification',
      timestamp: Date.now()
    };

    return await this.sendToUser(userId, payload);
  }

  /**
   * Bulk send to multiple users
   */
  async sendBulk(
    userIds: string[],
    payload: PushNotificationPayload,
    options: PushDeliveryOptions = {}
  ): Promise<Record<string, PushDeliveryResult[]>> {
    const results: Record<string, PushDeliveryResult[]> = {};

    // Process in batches to avoid overwhelming the push service
    const batchSize = 100;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async (userId) => {
        try {
          const userResults = await this.sendToUser(userId, payload, options);
          results[userId] = userResults;
        } catch (error) {
          console.error(`Error sending to user ${userId}:`, error);
          results[userId] = [{
            success: false,
            subscriptionId: '',
            endpoint: '',
            error: error instanceof Error ? error.message : 'Unknown error'
          }];
        }
      });

      await Promise.allSettled(batchPromises);

      // Small delay between batches
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Clean up expired and inactive subscriptions
   */
  async cleanupSubscriptions(): Promise<{ removed: number; updated: number }> {
    try {
      // Get subscriptions older than 30 days without activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: oldSubscriptions } = await this.supabase
        .from('push_subscriptions')
        .select('*')
        .eq('is_active', true)
        .lt('last_used', thirtyDaysAgo.toISOString());

      let removed = 0;
      let updated = 0;

      if (oldSubscriptions && oldSubscriptions.length > 0) {
        // Test each subscription to see if it's still valid
        for (const sub of oldSubscriptions) {
          try {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh_key,
                auth: sub.auth_key
              }
            };

            // Send a test notification with very low TTL
            await webpush.sendNotification(
              pushSubscription,
              JSON.stringify({ test: true }),
              { TTL: 1 }
            );

            // If successful, update last_used
            await this.updateSubscriptionLastUsed(sub.id);
            updated++;

          } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
              // Subscription is invalid, mark as inactive
              await this.markSubscriptionInactive(sub.id);
              removed++;
            }
          }
        }
      }

      return { removed, updated };
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error);
      return { removed: 0, updated: 0 };
    }
  }

  /**
   * Private helper methods
   */

  private buildNotificationPayload(payload: PushNotificationPayload) {
    return {
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      icon: payload.icon || '/static/icons/icon-192x192.png',
      badge: payload.badge || '/static/icons/badge-72x72.png',
      image: payload.image,
      data: payload.data || {},
      url: payload.url,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      timestamp: payload.timestamp || Date.now()
    };
  }

  private buildPushOptions(payload: PushNotificationPayload, options: PushDeliveryOptions) {
    return {
      urgency: options.urgency || this.getUrgencyFromPriority(payload.priority),
      TTL: options.ttl || payload.ttl || this.getTtlFromPriority(payload.priority),
      topic: options.topic || payload.tag,
      headers: options.headers || {}
    };
  }

  private getUrgencyFromPriority(priority: NotificationPriority): 'very-low' | 'low' | 'normal' | 'high' {
    switch (priority) {
      case 'critical': return 'high';
      case 'high': return 'normal';
      case 'medium': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  }

  private getTtlFromPriority(priority: NotificationPriority): number {
    switch (priority) {
      case 'critical': return 86400; // 24 hours
      case 'high': return 43200; // 12 hours
      case 'medium': return 21600; // 6 hours
      case 'low': return 10800; // 3 hours
      default: return 21600;
    }
  }

  private getNotificationUrl(notification: Notification): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.mellowise.com';

    switch (notification.type) {
      case 'study_reminder':
        return notification.metadata.topicId
          ? `${baseUrl}/practice?topic=${notification.metadata.topicId}`
          : `${baseUrl}/practice`;

      case 'goal_deadline':
        return notification.metadata.goalId
          ? `${baseUrl}/goals/${notification.metadata.goalId}`
          : `${baseUrl}/goals`;

      case 'streak_maintenance':
        return `${baseUrl}/practice?mode=streak`;

      case 'achievement':
        return notification.metadata.achievementId
          ? `${baseUrl}/achievements/${notification.metadata.achievementId}`
          : `${baseUrl}/achievements`;

      case 'break_reminder':
        return `${baseUrl}/dashboard`;

      case 'performance_alert':
        return `${baseUrl}/insights`;

      default:
        return `${baseUrl}/dashboard`;
    }
  }

  private enhancePayloadForType(payload: PushNotificationPayload, notification: Notification) {
    switch (notification.type) {
      case 'study_reminder':
        payload.requireInteraction = false;
        payload.actions = [
          { action: 'start_practice', title: '🚀 Start Practice' },
          { action: 'snooze', title: '⏰ Remind me in 1 hour' }
        ];
        break;

      case 'goal_deadline':
        payload.requireInteraction = notification.priority === 'critical';
        payload.actions = [
          { action: 'view_goal', title: '📊 View Progress' },
          { action: 'start_practice', title: '🎯 Work on Goal' }
        ];
        break;

      case 'streak_maintenance':
        payload.actions = [
          { action: 'maintain_streak', title: '🔥 Keep Streak Alive' },
          { action: 'view_stats', title: '📈 View Stats' }
        ];
        break;

      case 'achievement':
        payload.actions = [
          { action: 'view_achievement', title: '🎉 View Achievement' },
          { action: 'share_achievement', title: '📱 Share' }
        ];
        if (notification.metadata.achievementBadge) {
          payload.image = notification.metadata.achievementBadge;
        }
        break;

      case 'break_reminder':
        payload.actions = [
          { action: 'take_break', title: '🌟 Take a Break' },
          { action: 'continue_studying', title: '📚 Continue Studying' }
        ];
        break;

      case 'performance_alert':
        payload.actions = [
          { action: 'view_insights', title: '📊 View Insights' },
          { action: 'adjust_difficulty', title: '⚙️ Adjust Settings' }
        ];
        break;
    }
  }

  private async updateSubscriptionLastUsed(subscriptionId: string): Promise<void> {
    try {
      await this.supabase
        .from('push_subscriptions')
        .update({ last_used: new Date().toISOString() })
        .eq('id', subscriptionId);
    } catch (error) {
      console.error('Error updating subscription last used:', error);
    }
  }

  private async markSubscriptionInactive(subscriptionId: string): Promise<void> {
    try {
      await this.supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);
    } catch (error) {
      console.error('Error marking subscription inactive:', error);
    }
  }

  private async storeAnalytics(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
    result: PushDeliveryResult,
    latency: number
  ): Promise<void> {
    try {
      const analytics: Omit<PushAnalytics, 'notificationId'> = {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        type: payload.type,
        priority: payload.priority,
        sentAt: new Date().toISOString(),
        deliveryResult: {
          success: result.success,
          statusCode: result.statusCode,
          error: result.error,
          latency
        },
        deviceInfo: {
          userAgent: subscription.userAgent || 'unknown',
          endpoint: subscription.endpoint
        }
      };

      await this.supabase
        .from('push_analytics')
        .insert({
          ...analytics,
          notification_id: payload.data?.notificationId || crypto.randomUUID(),
          tenant_id: subscription.tenantId
        });
    } catch (error) {
      console.error('Error storing push analytics:', error);
    }
  }

  private mapDatabaseSubscription(dbSub: any): PushSubscription {
    return {
      id: dbSub.id,
      userId: dbSub.user_id,
      tenantId: dbSub.tenant_id,
      endpoint: dbSub.endpoint,
      p256dhKey: dbSub.p256dh_key,
      authKey: dbSub.auth_key,
      userAgent: dbSub.user_agent,
      isActive: dbSub.is_active,
      createdAt: dbSub.created_at,
      lastUsed: dbSub.last_used
    };
  }
}

export default PushService;