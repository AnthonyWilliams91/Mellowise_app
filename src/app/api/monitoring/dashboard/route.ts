/**
 * Performance Monitoring Dashboard API
 * MELLOWISE-015: Real-time performance metrics and dashboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/lib/monitoring/dashboard-service';
import { withPerformanceMonitoring } from '@/lib/monitoring/performance-collector';

/**
 * GET /api/monitoring/dashboard
 * Get comprehensive dashboard metrics
 */
export const GET = withPerformanceMonitoring(
  '/api/monitoring/dashboard',
  'GET',
  async function(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const tenantId = searchParams.get('tenantId') || undefined;
      const timeWindow = searchParams.get('timeWindow') || '24h';

      // Get comprehensive dashboard metrics
      const dashboardMetrics = await dashboardService.getDashboardMetrics(tenantId);

      return NextResponse.json({
        success: true,
        data: dashboardMetrics,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Dashboard API error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch dashboard metrics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/monitoring/dashboard/alerts
 * Create custom alert threshold
 */
export const POST = withPerformanceMonitoring(
  '/api/monitoring/dashboard',
  'POST',
  async function(request: NextRequest) {
    try {
      const body = await request.json();
      const { metric, operator, value, severity, enabled, tenantId } = body;

      // Validate required fields
      if (!metric || !operator || value === undefined || !severity) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: metric, operator, value, severity',
          },
          { status: 400 }
        );
      }

      // Create alert threshold
      await dashboardService.createAlertThreshold({
        metric,
        operator,
        value: parseFloat(value),
        severity,
        enabled: enabled !== false,
        tenantId,
      });

      return NextResponse.json({
        success: true,
        message: 'Alert threshold created successfully',
      });

    } catch (error) {
      console.error('Alert threshold creation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create alert threshold',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);