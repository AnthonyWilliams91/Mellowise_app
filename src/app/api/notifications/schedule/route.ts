/**
 * Notification Scheduling API
 * MELLOWISE-015: API for scheduling notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notifications/notification-service';
import { CreateNotificationRequest } from '@/types/notifications';

/**
 * POST /api/notifications/schedule
 * Create and schedule a notification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const notificationRequest: CreateNotificationRequest = await request.json();

    // Validate required fields
    if (!notificationRequest.type || !notificationRequest.title || !notificationRequest.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    // Add user ID to request
    notificationRequest.userId = user.id;

    // Create notification service
    const notificationService = new NotificationService();

    // Schedule the notification
    const notification = await notificationService.createNotification(notificationRequest);

    return NextResponse.json({
      success: true,
      message: 'Notification scheduled successfully',
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        scheduledFor: notification.scheduledFor,
        channels: notification.channels,
      },
    });
  } catch (error) {
    console.error('Schedule notification error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('disabled')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to schedule notification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/schedule
 * Get scheduled notifications for user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const status = searchParams.get('status'); // 'pending', 'sent', 'all'

    // Get user's tenant
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Set tenant context
    await supabase.rpc('set_tenant_id', { tenant_id: userProfile.tenant_id });

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status === 'pending') {
      query = query.is('sent_at', null);
    } else if (status === 'sent') {
      query = query.not('sent_at', 'is', null);
    }

    const { data: notifications, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      pagination: {
        limit,
        offset,
        total: notifications?.length || 0,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}