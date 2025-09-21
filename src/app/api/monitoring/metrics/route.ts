/**
 * Performance Metrics API
 * MELLOWISE-015: Detailed performance metrics and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceCollector } from '@/lib/monitoring/performance-collector';
import { databaseMonitor } from '@/lib/monitoring/database-monitor';
import { serviceMonitor } from '@/lib/monitoring/service-monitor';
import { analyticsEngine } from '@/lib/monitoring/analytics-engine';
import { withPerformanceMonitoring } from '@/lib/monitoring/performance-collector';

/**
 * GET /api/monitoring/metrics
 * Get specific performance metrics
 */
export const GET = withPerformanceMonitoring(
  '/api/monitoring/metrics',
  'GET',
  async function(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const component = searchParams.get('component');
      const metric = searchParams.get('metric');
      const timeWindow = searchParams.get('timeWindow') || '1h';
      const granularity = searchParams.get('granularity') || '5m';
      const tenantId = searchParams.get('tenantId') || undefined;

      let data: any = {};

      if (component) {
        // Get component-specific metrics
        switch (component) {
          case 'notifications':
            data = await performanceCollector.getCurrentKPIs(tenantId, timeWindow);
            break;
          case 'database':
            data = await databaseMonitor.getDatabaseMetrics(tenantId);
            break;
          case 'services':
            data = await serviceMonitor.getServiceMetrics();
            break;
          default:
            return NextResponse.json(
              { success: false, error: `Unknown component: ${component}` },
              { status: 400 }
            );
        }
      } else if (metric) {
        // Get specific metric trends
        data = await performanceCollector.getPerformanceTrends(
          metric,
          timeWindow,
          granularity,
          tenantId
        );
      } else {
        // Get overview metrics
        data = {
          notifications: await performanceCollector.getCurrentKPIs(tenantId, timeWindow),
          database: await databaseMonitor.getDatabaseMetrics(tenantId),
          services: await serviceMonitor.getServiceMetrics(),
        };
      }

      return NextResponse.json({
        success: true,
        data,
        metadata: {
          component,
          metric,
          timeWindow,
          granularity,
          tenantId,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      console.error('Metrics API error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch metrics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/monitoring/metrics/record
 * Record custom performance metric
 */
export const POST = withPerformanceMonitoring(
  '/api/monitoring/metrics',
  'POST',
  async function(request: NextRequest) {
    try {
      const body = await request.json();
      const { metricName, value, tags = {}, tenantId, userId } = body;

      // Validate required fields
      if (!metricName || value === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: metricName, value',
          },
          { status: 400 }
        );
      }

      // Record the metric
      performanceCollector.recordMetric(
        metricName,
        parseFloat(value),
        tags,
        tenantId,
        userId
      );

      return NextResponse.json({
        success: true,
        message: 'Metric recorded successfully',
        metric: {
          name: metricName,
          value: parseFloat(value),
          tags,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      console.error('Metric recording error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to record metric',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);