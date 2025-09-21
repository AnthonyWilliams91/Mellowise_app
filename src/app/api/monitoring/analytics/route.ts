/**
 * Performance Analytics API
 * MELLOWISE-015: Advanced analytics and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsEngine } from '@/lib/monitoring/analytics-engine';
import { withPerformanceMonitoring } from '@/lib/monitoring/performance-collector';

/**
 * GET /api/monitoring/analytics
 * Get performance analytics and insights
 */
export const GET = withPerformanceMonitoring(
  '/api/monitoring/analytics',
  'GET',
  async function(request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const type = searchParams.get('type') || 'insights';
      const metric = searchParams.get('metric');
      const timeWindow = searchParams.get('timeWindow') || '24h';
      const tenantId = searchParams.get('tenantId') || undefined;

      let data: any = {};

      switch (type) {
        case 'insights':
          data = await analyticsEngine.generateInsights(timeWindow, tenantId);
          break;

        case 'trends':
          if (!metric) {
            return NextResponse.json(
              { success: false, error: 'Metric parameter required for trend analysis' },
              { status: 400 }
            );
          }
          data = await analyticsEngine.analyzeTrend(metric, timeWindow, tenantId);
          break;

        case 'anomalies':
          if (!metric) {
            return NextResponse.json(
              { success: false, error: 'Metric parameter required for anomaly detection' },
              { status: 400 }
            );
          }
          data = await analyticsEngine.detectAnomalies(metric, timeWindow, tenantId);
          break;

        case 'capacity':
          const component = searchParams.get('component') || 'notifications';
          const forecastDays = parseInt(searchParams.get('forecastDays') || '30');
          data = await analyticsEngine.predictCapacity(component, forecastDays, tenantId);
          break;

        case 'correlations':
          const metrics = searchParams.get('metrics')?.split(',') || [];
          if (metrics.length === 0) {
            return NextResponse.json(
              { success: false, error: 'Metrics parameter required for correlation analysis' },
              { status: 400 }
            );
          }
          data = await analyticsEngine.analyzeCorrelations(metrics, tenantId, timeWindow);
          break;

        case 'seasonality':
          if (!metric) {
            return NextResponse.json(
              { success: false, error: 'Metric parameter required for seasonality detection' },
              { status: 400 }
            );
          }
          data = await analyticsEngine.detectSeasonality(metric, tenantId, timeWindow);
          break;

        default:
          return NextResponse.json(
            { success: false, error: `Unknown analytics type: ${type}` },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        type,
        data,
        metadata: {
          metric,
          timeWindow,
          tenantId,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      console.error('Analytics API error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate analytics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);