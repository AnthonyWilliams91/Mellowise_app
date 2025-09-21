/**
 * Snooze Push Notification Endpoint
 * MELLOWISE-015: Handle notification snooze requests from service worker
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notifications/notification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { snoozedFrom, scheduledFor, userId, metadata } = body;

    if (!snoozedFrom || !scheduledFor || !userId) {
      return NextResponse.json(
        { error: 'snoozedFrom, scheduledFor, and userId are required' },
        { status: 400 }
      );
    }

    const notificationService = new NotificationService();

    // Create new snoozed notification
    const snoozeNotification = await notificationService.createNotification({
      userId,
      type: 'study_reminder',
      priority: 'medium',
      title: '⏰ Snoozed Reminder',
      message: 'You asked to be reminded about your study session.',
      scheduledFor,
      metadata: {
        ...metadata,
        snoozedFrom,
        isSnooze: true
      }
    });

    // Track snooze analytics
    const supabase = createServerClient();
    try {
      await supabase
        .from('push_snooze_analytics')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          original_notification_id: snoozedFrom,
          snoozed_notification_id: snoozeNotification.id,
          snooze_duration: new Date(scheduledFor).getTime() - Date.now(),
          scheduled_for: scheduledFor,
          created_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.warn('Failed to track snooze analytics:', analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification snoozed successfully',
      notificationId: snoozeNotification.id,
      scheduledFor
    });

  } catch (error) {
    console.error('Error handling notification snooze:', error);
    return NextResponse.json(
      { error: 'Failed to snooze notification' },
      { status: 500 }
    );
  }
}