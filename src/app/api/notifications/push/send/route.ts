/**
 * Send Push Notification Endpoint
 * MELLOWISE-015: Send push notifications to users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import PushService, { PushNotificationPayload, PushDeliveryOptions } from '@/lib/notifications/push-service';
import { NotificationType, NotificationPriority } from '@/types/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get current user (admin check could be added here)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      targetUserId,
      targetUserIds,
      title,
      message,
      type,
      priority = 'medium',
      data = {},
      icon,
      image,
      url,
      actions,
      requireInteraction,
      silent,
      ttl,
      urgency,
      topic
    } = body;

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Title, message, and type are required' },
        { status: 400 }
      );
    }

    if (!targetUserId && (!targetUserIds || !Array.isArray(targetUserIds))) {
      return NextResponse.json(
        { error: 'Either targetUserId or targetUserIds array is required' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'study_reminder',
      'goal_deadline',
      'streak_maintenance',
      'achievement',
      'break_reminder',
      'performance_alert'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities: NotificationPriority[] = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    const pushService = new PushService();

    // Build notification payload
    const payload: PushNotificationPayload = {
      title,
      message,
      type,
      priority,
      icon,
      image,
      data: {
        ...data,
        sentBy: user.id,
        sentAt: new Date().toISOString()
      },
      url,
      actions,
      requireInteraction,
      silent,
      ttl,
      timestamp: Date.now()
    };

    // Build delivery options
    const options: PushDeliveryOptions = {
      urgency,
      ttl,
      topic
    };

    let results;
    let totalSent = 0;
    let totalFailed = 0;

    if (targetUserId) {
      // Send to single user
      results = await pushService.sendToUser(targetUserId, payload, options);
      totalSent = results.filter(r => r.success).length;
      totalFailed = results.length - totalSent;
    } else {
      // Send to multiple users
      const bulkResults = await pushService.sendBulk(targetUserIds, payload, options);
      results = bulkResults;

      // Calculate totals
      Object.values(bulkResults).forEach(userResults => {
        totalSent += userResults.filter(r => r.success).length;
        totalFailed += userResults.filter(r => !r.success).length;
      });
    }

    // Store notification analytics
    try {
      await supabase
        .from('push_delivery_analytics')
        .insert({
          id: crypto.randomUUID(),
          sender_id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          notification_type: type,
          priority: priority,
          title: title,
          target_count: targetUserId ? 1 : targetUserIds.length,
          sent_count: totalSent,
          failed_count: totalFailed,
          payload: JSON.stringify(payload),
          results: JSON.stringify(results),
          created_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.warn('Failed to store delivery analytics:', analyticsError);
    }

    return NextResponse.json({
      success: totalSent > 0,
      message: `Push notification sent to ${totalSent} device(s), ${totalFailed} failed`,
      results: {
        sent: totalSent,
        failed: totalFailed,
        total: totalSent + totalFailed,
        details: results
      }
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}