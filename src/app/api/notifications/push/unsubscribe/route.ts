/**
 * Push Unsubscription Endpoint
 * MELLOWISE-015: Handle push notification unsubscription requests
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
    const { endpoint, timestamp } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const pushService = new PushService();

    // Remove subscription from database
    await pushService.removeSubscription(endpoint);

    // Track unsubscription analytics
    try {
      await supabase
        .from('push_subscription_analytics')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          subscription_id: null,
          action: 'unsubscribe',
          user_agent: request.headers.get('user-agent'),
          endpoint: endpoint,
          timestamp: timestamp || new Date().toISOString(),
          created_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.warn('Failed to track unsubscription analytics:', analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Push notifications disabled successfully'
    });

  } catch (error) {
    console.error('Error handling push unsubscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove push subscription' },
      { status: 500 }
    );
  }
}