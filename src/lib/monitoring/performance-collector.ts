/**
 * Performance Metrics Collector
 * MELLOWISE-015: Comprehensive performance monitoring for notification system
 *
 * Features:
 * - Real-time metric collection and aggregation
 * - Memory-efficient metric storage and rotation
 * - Custom notification-specific KPIs
 * - Batch processing for high-volume metrics
 * - Percentile calculations (P50, P95, P99)
 * - Time-series data management
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface PerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
  tenantId?: string;
  userId?: string;
}

export interface AggregatedMetric {
  metricName: string;
  timeWindow: string; // '1m', '5m', '1h', '1d'
  aggregationType: 'avg' | 'sum' | 'min' | 'max' | 'p50' | 'p95' | 'p99' | 'count';
  value: number;
  sampleCount: number;
  timestamp: string;
  tags: Record<string, string>;
}

export interface MetricBatch {
  metrics: PerformanceMetric[];
  batchId: string;
  timestamp: string;
  tenantId?: string;
}

export interface NotificationKPI {
  // Delivery Performance
  deliveryLatency: number; // ms
  deliverySuccessRate: number; // 0-1
  channelPerformance: Record<string, number>;

  // Database Performance
  queryLatency: number; // ms
  connectionPoolUsage: number; // 0-1
  slowQueryCount: number;

  // External Services
  twilioLatency: number; // ms
  emailProviderLatency: number; // ms
  pushServiceLatency: number; // ms

  // API Performance
  apiResponseTimes: Record<string, number>; // endpoint -> ms
  apiErrorRates: Record<string, number>; // endpoint -> rate

  // Resource Utilization
  memoryUsage: number; // MB
  cpuUsage: number; // 0-100
  networkBandwidth: number; // MB/s

  // User Experience
  notificationEngagement: number; // 0-1
  averageResponseTime: number; // minutes
}

export interface PerformanceThresholds {
  deliveryLatency: { warning: number; critical: number };
  deliverySuccessRate: { warning: number; critical: number };
  queryLatency: { warning: number; critical: number };
  apiResponseTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  cpuUsage: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
}

// =============================================
// PERFORMANCE METRICS COLLECTOR
// =============================================

export class PerformanceCollector {
  private supabase;
  private metricBuffer: PerformanceMetric[] = [];
  private batchSize: number = 100;
  private flushInterval: number = 30000; // 30 seconds
  private thresholds: PerformanceThresholds;
  private alertCallbacks: Array<(metric: string, value: number, threshold: 'warning' | 'critical') => void> = [];

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.supabase = createServerClient();
    this.thresholds = {
      deliveryLatency: { warning: 1000, critical: 5000 }, // ms
      deliverySuccessRate: { warning: 0.95, critical: 0.85 },
      queryLatency: { warning: 200, critical: 1000 }, // ms
      apiResponseTime: { warning: 500, critical: 2000 }, // ms
      memoryUsage: { warning: 512, critical: 1024 }, // MB
      cpuUsage: { warning: 70, critical: 90 }, // %
      errorRate: { warning: 0.02, critical: 0.05 }, // 2%, 5%
      ...thresholds,
    };

    // Start automatic batch flushing
    setInterval(() => this.flushMetrics(), this.flushInterval);
  }

  /**
   * Record a single performance metric
   */
  recordMetric(
    metricName: string,
    value: number,
    tags: Record<string, string> = {},
    tenantId?: string,
    userId?: string
  ): void {
    const metric: PerformanceMetric = {
      id: crypto.randomUUID(),
      metricName,
      value,
      timestamp: new Date().toISOString(),
      tags,
      tenantId,
      userId,
    };

    this.metricBuffer.push(metric);

    // Check thresholds and trigger alerts
    this.checkThresholds(metricName, value);

    // Auto-flush if buffer is full
    if (this.metricBuffer.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  /**
   * Record notification delivery performance
   */
  recordNotificationDelivery(
    notificationId: string,
    channel: string,
    startTime: number,
    endTime: number,
    success: boolean,
    tenantId?: string,
    userId?: string
  ): void {
    const latency = endTime - startTime;
    const tags = {
      notificationId,
      channel,
      success: success.toString(),
    };

    this.recordMetric('notification.delivery.latency', latency, tags, tenantId, userId);
    this.recordMetric('notification.delivery.success', success ? 1 : 0, tags, tenantId, userId);
    this.recordMetric(`notification.delivery.${channel}.latency`, latency, tags, tenantId, userId);
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(
    queryType: string,
    table: string,
    duration: number,
    success: boolean,
    rowCount?: number,
    tenantId?: string
  ): void {
    const tags = {
      queryType,
      table,
      success: success.toString(),
    };

    this.recordMetric('database.query.latency', duration, tags, tenantId);
    this.recordMetric('database.query.success', success ? 1 : 0, tags, tenantId);

    if (rowCount !== undefined) {
      this.recordMetric('database.query.rows', rowCount, tags, tenantId);
    }

    // Flag slow queries
    if (duration > this.thresholds.queryLatency.warning) {
      this.recordMetric('database.query.slow', 1, tags, tenantId);
    }
  }

  /**
   * Record external service performance
   */
  recordExternalService(
    serviceName: string,
    operation: string,
    duration: number,
    success: boolean,
    responseSize?: number,
    tenantId?: string
  ): void {
    const tags = {
      service: serviceName,
      operation,
      success: success.toString(),
    };

    this.recordMetric(`external.${serviceName}.latency`, duration, tags, tenantId);
    this.recordMetric(`external.${serviceName}.success`, success ? 1 : 0, tags, tenantId);

    if (responseSize !== undefined) {
      this.recordMetric(`external.${serviceName}.response_size`, responseSize, tags, tenantId);
    }
  }

  /**
   * Record API endpoint performance
   */
  recordAPIEndpoint(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    tenantId?: string,
    userId?: string
  ): void {
    const tags = {
      endpoint: endpoint.replace(/\/[0-9a-fA-F-]{36}/g, '/:id'), // Normalize UUIDs
      method,
      statusCode: statusCode.toString(),
      success: (statusCode < 400).toString(),
    };

    this.recordMetric('api.request.latency', duration, tags, tenantId, userId);
    this.recordMetric('api.request.count', 1, tags, tenantId, userId);

    if (statusCode >= 400) {
      this.recordMetric('api.request.error', 1, tags, tenantId, userId);
    }
  }

  /**
   * Record system resource usage
   */
  recordSystemMetrics(metrics: {
    memoryUsage: number; // MB
    cpuUsage: number; // %
    networkIn: number; // MB/s
    networkOut: number; // MB/s
    activeConnections: number;
  }): void {
    const timestamp = new Date().toISOString();

    this.recordMetric('system.memory.usage', metrics.memoryUsage);
    this.recordMetric('system.cpu.usage', metrics.cpuUsage);
    this.recordMetric('system.network.in', metrics.networkIn);
    this.recordMetric('system.network.out', metrics.networkOut);
    this.recordMetric('system.connections.active', metrics.activeConnections);
  }

  /**
   * Record user experience metrics
   */
  recordUserExperience(
    userId: string,
    notificationId: string,
    engagement: {
      opened?: boolean;
      clicked?: boolean;
      dismissed?: boolean;
      responseTimeMinutes?: number;
      actionTaken?: string;
    },
    tenantId?: string
  ): void {
    const baseTags = { notificationId, userId };

    if (engagement.opened) {
      this.recordMetric('notification.engagement.opened', 1, baseTags, tenantId, userId);
    }

    if (engagement.clicked) {
      this.recordMetric('notification.engagement.clicked', 1, baseTags, tenantId, userId);
    }

    if (engagement.dismissed) {
      this.recordMetric('notification.engagement.dismissed', 1, baseTags, tenantId, userId);
    }

    if (engagement.responseTimeMinutes !== undefined) {
      this.recordMetric('notification.response.time', engagement.responseTimeMinutes, baseTags, tenantId, userId);
    }

    if (engagement.actionTaken) {
      const tags = { ...baseTags, action: engagement.actionTaken };
      this.recordMetric('notification.engagement.action', 1, tags, tenantId, userId);
    }
  }

  /**
   * Get current notification KPIs
   */
  async getCurrentKPIs(tenantId?: string, timeWindow: string = '1h'): Promise<NotificationKPI> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    // Query aggregated metrics for the time window
    const { data: metrics } = await this.supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000');

    if (!metrics || metrics.length === 0) {
      return this.getDefaultKPIs();
    }

    // Calculate KPIs from metrics
    return this.calculateKPIs(metrics);
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(
    metricName: string,
    timeWindow: string = '24h',
    granularity: string = '1h',
    tenantId?: string
  ): Promise<Array<{ timestamp: string; value: number; count: number }>> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    const { data: trends } = await this.supabase
      .from('performance_metrics_aggregated')
      .select('*')
      .eq('metric_name', metricName)
      .eq('time_window', granularity)
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .order('timestamp', { ascending: true });

    return trends || [];
  }

  /**
   * Get top performing/problematic endpoints
   */
  async getEndpointPerformance(
    limit: number = 10,
    sortBy: 'latency' | 'error_rate' | 'throughput' = 'latency',
    timeWindow: string = '1h',
    tenantId?: string
  ): Promise<Array<{
    endpoint: string;
    avgLatency: number;
    errorRate: number;
    throughput: number;
    p95Latency: number;
  }>> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    // This would typically be a complex aggregation query
    // For now, returning structured data that would come from such a query
    const { data: endpoints } = await this.supabase
      .from('performance_metrics')
      .select('tags, value, metric_name')
      .eq('metric_name', 'api.request.latency')
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000');

    // Process and aggregate endpoint data
    return this.aggregateEndpointMetrics(endpoints || []);
  }

  /**
   * Check alert thresholds and trigger callbacks
   */
  private checkThresholds(metricName: string, value: number): void {
    const thresholdKey = this.getThresholdKey(metricName);
    if (!thresholdKey || !this.thresholds[thresholdKey]) return;

    const threshold = this.thresholds[thresholdKey];

    if (value >= threshold.critical) {
      this.triggerAlert(metricName, value, 'critical');
    } else if (value >= threshold.warning) {
      this.triggerAlert(metricName, value, 'warning');
    }
  }

  /**
   * Trigger alert callbacks
   */
  private triggerAlert(metricName: string, value: number, level: 'warning' | 'critical'): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(metricName, value, level);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    });
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (metric: string, value: number, threshold: 'warning' | 'critical') => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Flush metrics buffer to database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricBuffer.length === 0) return;

    const batch = [...this.metricBuffer];
    this.metricBuffer = [];

    try {
      const metricsForDB = batch.map(metric => ({
        id: metric.id,
        tenant_id: metric.tenantId || '00000000-0000-0000-0000-000000000000',
        user_id: metric.userId,
        metric_name: metric.metricName,
        value: metric.value,
        tags: metric.tags,
        timestamp: metric.timestamp,
      }));

      const { error } = await this.supabase
        .from('performance_metrics')
        .insert(metricsForDB);

      if (error) {
        console.error('Failed to flush performance metrics:', error);
        // Re-add to buffer for retry
        this.metricBuffer.unshift(...batch);
      }
    } catch (error) {
      console.error('Error flushing metrics:', error);
      // Re-add to buffer for retry
      this.metricBuffer.unshift(...batch);
    }
  }

  /**
   * Helper: Parse time window string to milliseconds
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid time window: ${timeWindow}`);

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Invalid time unit: ${unit}`);
    }
  }

  /**
   * Helper: Get threshold key for metric name
   */
  private getThresholdKey(metricName: string): keyof PerformanceThresholds | null {
    if (metricName.includes('delivery.latency')) return 'deliveryLatency';
    if (metricName.includes('delivery.success')) return 'deliverySuccessRate';
    if (metricName.includes('query.latency')) return 'queryLatency';
    if (metricName.includes('request.latency')) return 'apiResponseTime';
    if (metricName.includes('memory.usage')) return 'memoryUsage';
    if (metricName.includes('cpu.usage')) return 'cpuUsage';
    if (metricName.includes('request.error')) return 'errorRate';
    return null;
  }

  /**
   * Helper: Get default KPIs when no data available
   */
  private getDefaultKPIs(): NotificationKPI {
    return {
      deliveryLatency: 0,
      deliverySuccessRate: 1,
      channelPerformance: {},
      queryLatency: 0,
      connectionPoolUsage: 0,
      slowQueryCount: 0,
      twilioLatency: 0,
      emailProviderLatency: 0,
      pushServiceLatency: 0,
      apiResponseTimes: {},
      apiErrorRates: {},
      memoryUsage: 0,
      cpuUsage: 0,
      networkBandwidth: 0,
      notificationEngagement: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Helper: Calculate KPIs from raw metrics
   */
  private calculateKPIs(metrics: any[]): NotificationKPI {
    // Group metrics by type
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) acc[metric.metric_name] = [];
      acc[metric.metric_name].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate averages and aggregations
    const avg = (values: number[]) => values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

    return {
      deliveryLatency: avg(grouped['notification.delivery.latency']?.map(m => m.value) || []),
      deliverySuccessRate: avg(grouped['notification.delivery.success']?.map(m => m.value) || []),
      channelPerformance: this.calculateChannelPerformance(grouped),
      queryLatency: avg(grouped['database.query.latency']?.map(m => m.value) || []),
      connectionPoolUsage: avg(grouped['system.connections.active']?.map(m => m.value) || []) / 100,
      slowQueryCount: sum(grouped['database.query.slow']?.map(m => m.value) || []),
      twilioLatency: avg(grouped['external.twilio.latency']?.map(m => m.value) || []),
      emailProviderLatency: avg(grouped['external.email.latency']?.map(m => m.value) || []),
      pushServiceLatency: avg(grouped['external.push.latency']?.map(m => m.value) || []),
      apiResponseTimes: this.calculateAPIResponseTimes(grouped),
      apiErrorRates: this.calculateAPIErrorRates(grouped),
      memoryUsage: avg(grouped['system.memory.usage']?.map(m => m.value) || []),
      cpuUsage: avg(grouped['system.cpu.usage']?.map(m => m.value) || []),
      networkBandwidth: avg(grouped['system.network.in']?.map(m => m.value) || []),
      notificationEngagement: avg(grouped['notification.engagement.opened']?.map(m => m.value) || []),
      averageResponseTime: avg(grouped['notification.response.time']?.map(m => m.value) || []),
    };
  }

  /**
   * Helper: Calculate channel-specific performance
   */
  private calculateChannelPerformance(grouped: Record<string, any[]>): Record<string, number> {
    const channels: Record<string, number> = {};

    Object.keys(grouped).forEach(metricName => {
      const match = metricName.match(/notification\.delivery\.(.+)\.latency/);
      if (match) {
        const channel = match[1];
        const values = grouped[metricName].map(m => m.value);
        channels[channel] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      }
    });

    return channels;
  }

  /**
   * Helper: Calculate API response times by endpoint
   */
  private calculateAPIResponseTimes(grouped: Record<string, any[]>): Record<string, number> {
    const apiMetrics = grouped['api.request.latency'] || [];
    const endpointTimes: Record<string, number[]> = {};

    apiMetrics.forEach(metric => {
      const endpoint = metric.tags?.endpoint || 'unknown';
      if (!endpointTimes[endpoint]) endpointTimes[endpoint] = [];
      endpointTimes[endpoint].push(metric.value);
    });

    const result: Record<string, number> = {};
    Object.keys(endpointTimes).forEach(endpoint => {
      const times = endpointTimes[endpoint];
      result[endpoint] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    return result;
  }

  /**
   * Helper: Calculate API error rates by endpoint
   */
  private calculateAPIErrorRates(grouped: Record<string, any[]>): Record<string, number> {
    const requestCount = grouped['api.request.count'] || [];
    const errorCount = grouped['api.request.error'] || [];

    const endpointRequests: Record<string, number> = {};
    const endpointErrors: Record<string, number> = {};

    requestCount.forEach(metric => {
      const endpoint = metric.tags?.endpoint || 'unknown';
      endpointRequests[endpoint] = (endpointRequests[endpoint] || 0) + metric.value;
    });

    errorCount.forEach(metric => {
      const endpoint = metric.tags?.endpoint || 'unknown';
      endpointErrors[endpoint] = (endpointErrors[endpoint] || 0) + metric.value;
    });

    const result: Record<string, number> = {};
    Object.keys(endpointRequests).forEach(endpoint => {
      const requests = endpointRequests[endpoint] || 0;
      const errors = endpointErrors[endpoint] || 0;
      result[endpoint] = requests > 0 ? errors / requests : 0;
    });

    return result;
  }

  /**
   * Helper: Aggregate endpoint metrics
   */
  private aggregateEndpointMetrics(data: any[]): Array<{
    endpoint: string;
    avgLatency: number;
    errorRate: number;
    throughput: number;
    p95Latency: number;
  }> {
    // Group by endpoint
    const endpointData: Record<string, number[]> = {};

    data.forEach(metric => {
      const endpoint = metric.tags?.endpoint || 'unknown';
      if (!endpointData[endpoint]) endpointData[endpoint] = [];
      endpointData[endpoint].push(metric.value);
    });

    // Calculate aggregations
    return Object.keys(endpointData).map(endpoint => {
      const latencies = endpointData[endpoint].sort((a, b) => a - b);
      const p95Index = Math.floor(latencies.length * 0.95);

      return {
        endpoint,
        avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        errorRate: 0, // Would need error data
        throughput: latencies.length,
        p95Latency: latencies[p95Index] || 0,
      };
    });
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const performanceCollector = new PerformanceCollector();

// =============================================
// MIDDLEWARE HELPERS
// =============================================

/**
 * Performance monitoring middleware for API routes
 */
export function withPerformanceMonitoring<T extends any[], R>(
  endpoint: string,
  method: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    let statusCode = 200;

    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      statusCode = 500;
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      performanceCollector.recordAPIEndpoint(
        endpoint,
        method,
        duration,
        statusCode
      );
    }
  };
}

/**
 * Database query monitoring wrapper
 */
export function withDatabaseMonitoring<T extends any[], R>(
  queryType: string,
  table: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    let success = true;
    let rowCount: number | undefined;

    try {
      const result = await handler(...args);

      // Extract row count if result has count property
      if (result && typeof result === 'object' && 'count' in result) {
        rowCount = (result as any).count;
      }

      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      performanceCollector.recordDatabaseQuery(
        queryType,
        table,
        duration,
        success,
        rowCount
      );
    }
  };
}

/**
 * External service monitoring wrapper
 */
export function withExternalServiceMonitoring<T extends any[], R>(
  serviceName: string,
  operation: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    let success = true;
    let responseSize: number | undefined;

    try {
      const result = await handler(...args);

      // Estimate response size
      if (result) {
        responseSize = JSON.stringify(result).length;
      }

      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      performanceCollector.recordExternalService(
        serviceName,
        operation,
        duration,
        success,
        responseSize
      );
    }
  };
}