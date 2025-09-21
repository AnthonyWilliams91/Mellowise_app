/**
 * Notification Analytics Sync Endpoint
 * MELLOWISE-015: Sync analytics data from service worker to server
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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
    const { analytics, actions, engagement } = body;

    const results = {
      analytics: { processed: 0, errors: 0 },
      actions: { processed: 0, errors: 0 },
      engagement: { processed: 0, errors: 0 }
    };

    // Process notification analytics
    if (analytics && Array.isArray(analytics)) {
      for (const item of analytics) {
        try {
          await supabase
            .from('push_analytics_events')
            .insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              tenant_id: '00000000-0000-0000-0000-000000000000',
              notification_id: item.notificationId,
              notification_type: item.type,
              priority: item.priority,
              shown_at: item.shownAt,
              metadata: item.metadata || {},
              created_at: new Date().toISOString()
            });
          results.analytics.processed++;
        } catch (error) {
          console.error('Error processing analytics item:', error);
          results.analytics.errors++;
        }
      }
    }

    // Process notification actions
    if (actions && Array.isArray(actions)) {
      for (const item of actions) {
        try {
          await supabase
            .from('push_action_events')
            .insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              tenant_id: '00000000-0000-0000-0000-000000000000',
              notification_id: item.notificationId,
              notification_type: item.type,
              action: item.action,
              timestamp: item.timestamp,
              created_at: new Date().toISOString()
            });
          results.actions.processed++;
        } catch (error) {
          console.error('Error processing action item:', error);
          results.actions.errors++;
        }
      }
    }

    // Process engagement data
    if (engagement && Array.isArray(engagement)) {
      for (const item of engagement) {
        try {
          await supabase
            .from('push_engagement_events')
            .insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              tenant_id: '00000000-0000-0000-0000-000000000000',
              notification_type: item.notificationType,
              timestamp: item.timestamp,
              is_active: item.isActive,
              created_at: new Date().toISOString()
            });
          results.engagement.processed++;
        } catch (error) {
          console.error('Error processing engagement item:', error);
          results.engagement.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics synced successfully',
      results
    });

  } catch (error) {
    console.error('Error syncing analytics:', error);
    return NextResponse.json(
      { error: 'Failed to sync analytics' },
      { status: 500 }
    );
  }
}