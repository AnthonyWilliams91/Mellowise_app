/**
 * In-App Notifications API
 * MELLOWISE-015: Real-time in-app notification management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/notifications/in-app
 * Get user's in-app notifications
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const type = searchParams.get('type');

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
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (unreadOnly) {
      query = query.eq('read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: notifications, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      pagination: {
        limit,
        offset,
        total: notifications?.length || 0,
      },
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Get in-app notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/in-app/{id}/read
 * Mark notification as read
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body; // action: 'read', 'dismiss', 'click'

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

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

    // Update notification based on action
    const updateData: any = {};
    const timestamp = new Date().toISOString();

    switch (action) {
      case 'read':
        updateData.read = true;
        updateData.read_at = timestamp;
        break;
      case 'dismiss':
        updateData.dismissed = true;
        updateData.dismissed_at = timestamp;
        break;
      case 'click':
        updateData.read = true;
        updateData.read_at = timestamp;
        // Also update the source notification if it exists
        const { data: inAppNotification } = await supabase
          .from('in_app_notifications')
          .select('notification_id')
          .eq('id', notificationId)
          .eq('user_id', user.id)
          .single();

        if (inAppNotification?.notification_id) {
          await supabase
            .from('notifications')
            .update({ clicked_at: timestamp })
            .eq('id', inAppNotification.notification_id)
            .eq('user_id', user.id);
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('in_app_notifications')
      .update(updateData)
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Get updated unread count
    const { count: unreadCount } = await supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    return NextResponse.json({
      success: true,
      message: `Notification ${action}ed successfully`,
      notification: updated,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Update in-app notification error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/in-app/mark-all-read
 * Mark all notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Mark all unread notifications as read
    const { error: updateError } = await supabase
      .from('in_app_notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('read', false);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/in-app
 * Clear old notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('older_than_days') || '30');

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

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Delete old notifications
    const { count, error: deleteError } = await supabase
      .from('in_app_notifications')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${count || 0} old notifications`,
      deletedCount: count || 0,
    });
  } catch (error) {
    console.error('Delete old notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}