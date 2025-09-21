/**
 * Permission Analytics Endpoint
 * MELLOWISE-015: Track notification permission requests and responses
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
    const { permission, timestamp, userAgent } = body;

    if (!permission || !['granted', 'denied', 'default'].includes(permission)) {
      return NextResponse.json(
        { error: 'Valid permission status is required' },
        { status: 400 }
      );
    }

    // Store permission analytics
    try {
      await supabase
        .from('push_permission_analytics')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000000',
          permission_status: permission,
          user_agent: userAgent,
          timestamp: timestamp || new Date().toISOString(),
          created_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.error('Failed to store permission analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to store permission analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Permission status tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking permission:', error);
    return NextResponse.json(
      { error: 'Failed to track permission status' },
      { status: 500 }
    );
  }
}