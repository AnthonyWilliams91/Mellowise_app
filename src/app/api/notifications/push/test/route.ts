/**
 * Test Push Notification Endpoint
 * MELLOWISE-015: Send test push notifications to verify functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import PushService from '@/lib/notifications/push-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, type = 'test' } = body;

    const pushService = new PushService();

    // Send test notification
    const results = await pushService.sendTestNotification(user.id, message);

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No active push subscriptions found' },
        { status: 404 }
      );
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    // Track test notification analytics
    try {
      await supabase
        .from('push_test_analytics')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          message: message || 'Test notification',
          type: type,
          success_count: successCount,
          failure_count: failureCount,
          results: JSON.stringify(results),
          created_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.warn('Failed to track test notification analytics:', analyticsError);
    }

    if (successCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Test notification sent successfully to ${successCount} device(s)`,
        results: {
          sent: successCount,
          failed: failureCount,
          total: results.length
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test notification to any device',
        results: {
          sent: 0,
          failed: failureCount,
          total: results.length,
          errors: results.map(r => r.error).filter(Boolean)
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test push notification' },
      { status: 500 }
    );
  }
}