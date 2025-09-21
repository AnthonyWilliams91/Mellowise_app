/**
 * Notification Analytics API
 * MELLOWISE-015: Analytics and metrics for notification performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/notifications/analytics
 * Get notification analytics and metrics
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
    const period = searchParams.get('period') || 'month'; // 'week', 'month', 'quarter'
    const type = searchParams.get('type'); // optional filter by notification type
    const channel = searchParams.get('channel'); // optional filter by channel

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

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let periodFormat: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodFormat = '%Y-%U'; // Year-Week
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        periodFormat = '%Y-Q%q'; // Year-Quarter
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodFormat = '%Y-%m'; // Year-Month
        break;
    }

    // Get notification analytics
    let analyticsQuery = supabase
      .from('notification_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (type) {
      analyticsQuery = analyticsQuery.eq('notification_type', type);
    }

    if (channel) {
      analyticsQuery = analyticsQuery.eq('channel', channel);
    }

    const { data: analytics, error: analyticsError } = await analyticsQuery;

    if (analyticsError) {
      throw analyticsError;
    }

    // Get recent notifications for engagement metrics
    let notificationsQuery = supabase
      .from('notifications')
      .select('id, type, channels, sent_at, read_at, clicked_at, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (type) {
      notificationsQuery = notificationsQuery.eq('type', type);
    }

    const { data: notifications, error: notificationsError } = await notificationsQuery;

    if (notificationsError) {
      throw notificationsError;
    }

    // Calculate engagement metrics
    const engagementMetrics = calculateEngagementMetrics(notifications || []);

    // Calculate effectiveness by type
    const effectivenessByType = calculateEffectivenessByType(notifications || []);

    // Calculate channel performance
    const channelPerformance = calculateChannelPerformance(notifications || []);

    // Get SMS-specific analytics
    const { data: smsAnalytics } = await supabase
      .from('sms_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('sent_at', startDate.toISOString());

    // Calculate response trends
    const responseTrends = calculateResponseTrends(notifications || [], period);

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        engagement: engagementMetrics,
        effectiveness: effectivenessByType,
        channels: channelPerformance,
        trends: responseTrends,
        sms: calculateSMSMetrics(smsAnalytics || []),
        rawData: {
          notifications: notifications?.length || 0,
          analyticsRecords: analytics?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

/**
 * Calculate engagement metrics from notifications
 */
function calculateEngagementMetrics(notifications: any[]) {
  const total = notifications.length;
  if (total === 0) return { openRate: 0, clickRate: 0, responseTime: 0 };

  const opened = notifications.filter(n => n.read_at).length;
  const clicked = notifications.filter(n => n.clicked_at).length;

  // Calculate average response time (in minutes)
  const responseTimes = notifications
    .filter(n => n.read_at && n.sent_at)
    .map(n => {
      const sent = new Date(n.sent_at).getTime();
      const read = new Date(n.read_at).getTime();
      return (read - sent) / (1000 * 60); // minutes
    });

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;

  return {
    totalSent: total,
    openRate: total > 0 ? (opened / total) * 100 : 0,
    clickRate: total > 0 ? (clicked / total) * 100 : 0,
    averageResponseTimeMinutes: Math.round(avgResponseTime),
  };
}

/**
 * Calculate effectiveness by notification type
 */
function calculateEffectivenessByType(notifications: any[]) {
  const typeGroups = notifications.reduce((groups, notification) => {
    const type = notification.type;
    if (!groups[type]) {
      groups[type] = { total: 0, opened: 0, clicked: 0 };
    }
    groups[type].total += 1;
    if (notification.read_at) groups[type].opened += 1;
    if (notification.clicked_at) groups[type].clicked += 1;
    return groups;
  }, {} as Record<string, { total: number; opened: number; clicked: number }>);

  return Object.entries(typeGroups).map(([type, stats]) => ({
    type,
    sent: stats.total,
    openRate: stats.total > 0 ? (stats.opened / stats.total) * 100 : 0,
    clickRate: stats.total > 0 ? (stats.clicked / stats.total) * 100 : 0,
  }));
}

/**
 * Calculate channel performance
 */
function calculateChannelPerformance(notifications: any[]) {
  const channelStats = notifications.reduce((stats, notification) => {
    (notification.channels || []).forEach((channel: string) => {
      if (!stats[channel]) {
        stats[channel] = { sent: 0, opened: 0, clicked: 0 };
      }
      stats[channel].sent += 1;
      if (notification.read_at) stats[channel].opened += 1;
      if (notification.clicked_at) stats[channel].clicked += 1;
    });
    return stats;
  }, {} as Record<string, { sent: number; opened: number; clicked: number }>);

  return Object.entries(channelStats).map(([channel, stats]) => ({
    channel,
    sent: stats.sent,
    openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
    clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
  }));
}

/**
 * Calculate response trends over time
 */
function calculateResponseTrends(notifications: any[], period: string) {
  const trends = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    let key: string;

    switch (period) {
      case 'week':
        key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        break;
      case 'quarter':
        key = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
        break;
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!groups[key]) {
      groups[key] = { period: key, sent: 0, opened: 0, clicked: 0 };
    }
    groups[key].sent += 1;
    if (notification.read_at) groups[key].opened += 1;
    if (notification.clicked_at) groups[key].clicked += 1;
    return groups;
  }, {} as Record<string, { period: string; sent: number; opened: number; clicked: number }>);

  return Object.values(trends).map(trend => ({
    ...trend,
    openRate: trend.sent > 0 ? (trend.opened / trend.sent) * 100 : 0,
    clickRate: trend.sent > 0 ? (trend.clicked / trend.sent) * 100 : 0,
  }));
}

/**
 * Calculate SMS-specific metrics
 */
function calculateSMSMetrics(smsAnalytics: any[]) {
  const total = smsAnalytics.length;
  if (total === 0) return { deliveryRate: 0, averageLength: 0, errorRate: 0 };

  const delivered = smsAnalytics.filter(sms => sms.delivered_at).length;
  const failed = smsAnalytics.filter(sms => sms.failed_at).length;
  const totalLength = smsAnalytics.reduce((sum, sms) => sum + (sms.message_length || 0), 0);

  return {
    totalSent: total,
    deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
    errorRate: total > 0 ? (failed / total) * 100 : 0,
    averageMessageLength: total > 0 ? Math.round(totalLength / total) : 0,
  };
}