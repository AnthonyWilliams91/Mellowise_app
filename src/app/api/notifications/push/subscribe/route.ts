/**
 * Push Subscription Endpoint
 * MELLOWISE-015: Handle push notification subscription requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import PushService from '@/lib/notifications/push-service';
import { PushSubscriptionInfo } from '@/hooks/usePushNotifications';

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
    const { subscription, userAgent, timestamp } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const pushService = new PushService();

    // Save subscription to database
    const subscriptionId = await pushService.saveSubscription(
      user.id,
      subscription as PushSubscriptionInfo,
      userAgent
    );

    // Track subscription analytics
    try {
      await supabase
        .from('push_subscription_analytics')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          subscription_id: subscriptionId,
          action: 'subscribe',
          user_agent: userAgent,
          endpoint: subscription.endpoint,
          timestamp: timestamp || new Date().toISOString(),
          created_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.warn('Failed to track subscription analytics:', analyticsError);
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Push notifications enabled successfully!'
    });

  } catch (error) {
    console.error('Error handling push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}