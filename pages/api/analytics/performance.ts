/**
 * Mellowise Performance Analytics Endpoint
 * 
 * Collects and stores performance metrics, Web Vitals, and custom
 * tracking data from the performance monitoring system.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { performanceMonitor } from '@/utils/performance-monitor';
import { PERFORMANCE_BUDGETS, MONITORING_EVENTS } from '@/constants/monitoring-config';

interface PerformanceMetric {
  event: string;
  metric_name?: string;
  value?: number;
  rating?: string;
  budget?: number;
  page?: string;
  timestamp: number;
  user_id?: string;
  session_id?: string;
  endpoint?: string;
  duration?: number;
  success?: boolean;
}

interface AnalyticsRequest extends NextApiRequest {
  body: PerformanceMetric;
}

export default async function handler(
  req: AnalyticsRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metric: PerformanceMetric = req.body;
    
    // Validate required fields
    if (!metric.event || !metric.timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields: event, timestamp' 
      });
    }

    // Process different types of performance events
    switch (metric.event) {
      case MONITORING_EVENTS.HEALTH_CHECK:
        await processHealthCheckMetric(metric);
        break;
        
      case MONITORING_EVENTS.PERFORMANCE_ALERT:
        await processPerformanceAlert(metric);
        break;
        
      case 'web_vital':
        await processWebVitalMetric(metric);
        break;
        
      case 'api_performance':
        await processAPIPerformanceMetric(metric);
        break;
        
      case 'custom_metric':
        await processCustomMetric(metric);
        break;
        
      default:
        console.warn('Unknown performance event type:', metric.event);
    }

    // Store metric in database (if configured)
    await storeMetricInDatabase(metric);

    // Forward to external analytics services
    await forwardToAnalyticsServices(metric);

    res.status(200).json({ 
      success: true, 
      message: 'Performance metric recorded'
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    
    res.status(500).json({
      error: 'Failed to process performance metric',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process health check metrics
 */
async function processHealthCheckMetric(metric: PerformanceMetric): Promise<void> {
  // Log health check timing
  if (metric.duration) {
    console.info(`Health check completed in ${metric.duration}ms`);
    
    // Alert if health check is taking too long
    if (metric.duration > PERFORMANCE_BUDGETS.API * 2) {
      console.warn(`Slow health check detected: ${metric.duration}ms`);
    }
  }
}

/**
 * Process performance alerts
 */
async function processPerformanceAlert(metric: PerformanceMetric): Promise<void> {
  const { metric_name, value, budget, page } = metric;
  
  console.warn(`Performance Alert: ${metric_name} (${value}) exceeded budget (${budget}) on ${page}`);
  
  // Could integrate with alerting systems here (PagerDuty, Slack, etc.)
  // Example: await sendSlackAlert(metric);
}

/**
 * Process Core Web Vitals metrics
 */
async function processWebVitalMetric(metric: PerformanceMetric): Promise<void> {
  const { metric_name, value, rating, page } = metric;
  
  // Log Core Web Vitals for monitoring
  console.info(`Web Vital - ${metric_name}: ${value} (${rating}) on ${page}`);
  
  // Track Web Vitals trends
  if (metric_name && value) {
    await trackWebVitalTrend(metric_name, value, page || 'unknown');
  }
}

/**
 * Process API performance metrics
 */
async function processAPIPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  const { endpoint, duration, success } = metric;
  
  if (duration && endpoint) {
    console.info(`API Performance - ${endpoint}: ${duration}ms (${success ? 'success' : 'error'})`);
    
    // Check against API performance budget
    if (duration > PERFORMANCE_BUDGETS.API) {
      console.warn(`Slow API detected: ${endpoint} took ${duration}ms`);
    }
  }
}

/**
 * Process custom performance metrics
 */
async function processCustomMetric(metric: PerformanceMetric): Promise<void> {
  const { metric_name, value, page } = metric;
  
  if (metric_name && value) {
    console.info(`Custom Metric - ${metric_name}: ${value} on ${page}`);
  }
}

/**
 * Track Web Vital trends over time
 */
async function trackWebVitalTrend(
  metricName: string, 
  value: number, 
  page: string
): Promise<void> {
  // Store trend data for performance analysis
  // This could be implemented with a time-series database
  // For now, we'll use simple in-memory tracking
  
  const trendKey = `${page}_${metricName}`;
  
  // Could store in Redis, TimescaleDB, or other time-series storage
  console.info(`Tracking trend for ${trendKey}: ${value}`);
}

/**
 * Store performance metric in database
 */
async function storeMetricInDatabase(metric: PerformanceMetric): Promise<void> {
  // In a real implementation, you would:
  // 1. Connect to your database (Supabase, etc.)
  // 2. Insert the metric into a performance_metrics table
  // 3. Handle any database errors
  
  // Example Supabase implementation:
  /*
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase
    .from('performance_metrics')
    .insert([{
      event_type: metric.event,
      metric_name: metric.metric_name,
      metric_value: metric.value,
      page_path: metric.page,
      user_id: metric.user_id,
      session_id: metric.session_id,
      timestamp: new Date(metric.timestamp).toISOString(),
      additional_data: {
        rating: metric.rating,
        budget: metric.budget,
        endpoint: metric.endpoint,
        duration: metric.duration,
        success: metric.success
      }
    }]);
  
  if (error) {
    throw new Error(`Database storage failed: ${error.message}`);
  }
  */
  
  // For now, just log that we would store it
  console.info('Would store metric in database:', {
    event: metric.event,
    metric_name: metric.metric_name,
    value: metric.value,
    page: metric.page,
    timestamp: new Date(metric.timestamp).toISOString()
  });
}

/**
 * Forward metrics to external analytics services
 */
async function forwardToAnalyticsServices(metric: PerformanceMetric): Promise<void> {
  // Google Analytics 4
  if (typeof process !== 'undefined' && process.env.GA_MEASUREMENT_ID) {
    await sendToGoogleAnalytics(metric);
  }
  
  // PostHog
  if (typeof process !== 'undefined' && process.env.POSTHOG_API_KEY) {
    await sendToPostHog(metric);
  }
  
  // Custom analytics service
  if (typeof process !== 'undefined' && process.env.CUSTOM_ANALYTICS_ENDPOINT) {
    await sendToCustomAnalytics(metric);
  }
}

/**
 * Send metric to Google Analytics 4
 */
async function sendToGoogleAnalytics(metric: PerformanceMetric): Promise<void> {
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;
  
  if (!measurementId || !apiSecret) return;

  const payload = {
    client_id: metric.session_id || 'anonymous',
    user_id: metric.user_id,
    events: [{
      name: 'performance_metric',
      params: {
        event_category: 'Performance',
        event_label: metric.metric_name,
        value: metric.value,
        custom_parameter_page: metric.page,
        custom_parameter_event_type: metric.event
      }
    }]
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      console.error('Failed to send to Google Analytics:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending to Google Analytics:', error);
  }
}

/**
 * Send metric to PostHog
 */
async function sendToPostHog(metric: PerformanceMetric): Promise<void> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!apiKey) return;

  const payload = {
    api_key: apiKey,
    event: 'performance_metric',
    properties: {
      metric_name: metric.metric_name,
      metric_value: metric.value,
      event_type: metric.event,
      page: metric.page,
      rating: metric.rating,
      budget: metric.budget,
      timestamp: new Date(metric.timestamp).toISOString()
    },
    distinct_id: metric.user_id || metric.session_id || 'anonymous'
  };

  try {
    const response = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to send to PostHog:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending to PostHog:', error);
  }
}

/**
 * Send metric to custom analytics service
 */
async function sendToCustomAnalytics(metric: PerformanceMetric): Promise<void> {
  const endpoint = process.env.CUSTOM_ANALYTICS_ENDPOINT;
  const apiKey = process.env.CUSTOM_ANALYTICS_API_KEY;
  
  if (!endpoint) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(metric)
    });

    if (!response.ok) {
      console.error('Failed to send to custom analytics:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending to custom analytics:', error);
  }
}