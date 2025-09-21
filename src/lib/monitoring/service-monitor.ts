/**
 * External Service Monitor
 * MELLOWISE-015: Comprehensive monitoring for external services
 *
 * Features:
 * - Third-party API performance tracking (Twilio, email providers, push services)
 * - Rate limit monitoring and prediction
 * - Service availability and uptime tracking
 * - Cost and usage analytics
 * - Circuit breaker pattern implementation
 * - SLA monitoring and reporting
 */

import { performanceCollector } from './performance-collector';
import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface ServiceMetrics {
  serviceName: string;
  availability: number; // 0-1
  avgResponseTime: number; // ms
  errorRate: number; // 0-1
  throughput: number; // requests per minute
  rateLimitUsage: number; // 0-1
  cost: {
    current: number;
    projected: number;
    currency: string;
  };
  lastCheck: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
}

export interface ServiceEndpoint {
  serviceName: string;
  endpoint: string;
  method: string;
  timeout: number;
  retries: number;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  costs: {
    perRequest?: number;
    perMessage?: number;
    perEmail?: number;
    currency: string;
  };
}

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  uptime: number; // percentage
  responseTime: number; // ms
  errorCount: number;
  lastError?: string;
  lastSuccessfulCall: string;
  slaCompliance: number; // percentage
}

export interface RateLimit {
  serviceName: string;
  endpoint: string;
  limit: number;
  remaining: number;
  resetTime: string;
  windowType: 'minute' | 'hour' | 'day';
  utilisationPercentage: number;
}

export interface ServiceAlert {
  id: string;
  serviceName: string;
  alertType: 'availability' | 'performance' | 'rate_limit' | 'cost' | 'sla_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface CostAnalytics {
  serviceName: string;
  period: string; // YYYY-MM
  totalCost: number;
  requestCount: number;
  costPerRequest: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  projectedMonthlyCost: number;
  budgetUtilization: number; // 0-1
}

// =============================================
// SERVICE CONFIGURATIONS
// =============================================

const SERVICE_CONFIGS: Record<string, ServiceEndpoint> = {
  twilio: {
    serviceName: 'twilio',
    endpoint: 'https://api.twilio.com/2010-04-01',
    method: 'POST',
    timeout: 10000,
    retries: 3,
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 3600,
      requestsPerDay: 86400,
    },
    costs: {
      perMessage: 0.0075, // $0.0075 per SMS
      currency: 'USD',
    },
  },
  sendgrid: {
    serviceName: 'sendgrid',
    endpoint: 'https://api.sendgrid.com/v3',
    method: 'POST',
    timeout: 15000,
    retries: 2,
    rateLimits: {
      requestsPerMinute: 600,
      requestsPerHour: 10000,
      requestsPerDay: 240000,
    },
    costs: {
      perEmail: 0.00095, // $0.00095 per email
      currency: 'USD',
    },
  },
  resend: {
    serviceName: 'resend',
    endpoint: 'https://api.resend.com',
    method: 'POST',
    timeout: 12000,
    retries: 2,
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 24000,
    },
    costs: {
      perEmail: 0.001, // $0.001 per email
      currency: 'USD',
    },
  },
  firebase: {
    serviceName: 'firebase',
    endpoint: 'https://fcm.googleapis.com/v1',
    method: 'POST',
    timeout: 8000,
    retries: 3,
    rateLimits: {
      requestsPerMinute: 600,
      requestsPerHour: 36000,
      requestsPerDay: 864000,
    },
    costs: {
      perRequest: 0, // Free tier
      currency: 'USD',
    },
  },
  pusher: {
    serviceName: 'pusher',
    endpoint: 'https://api.pusherapp.com',
    method: 'POST',
    timeout: 5000,
    retries: 2,
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 6000,
      requestsPerDay: 144000,
    },
    costs: {
      perRequest: 0.00001, // $0.00001 per message
      currency: 'USD',
    },
  },
};

// =============================================
// EXTERNAL SERVICE MONITOR
// =============================================

export class ServiceMonitor {
  private supabase;
  private healthCheckInterval: number = 60000; // 1 minute
  private rateLimitCache: Map<string, RateLimit> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private healthTimer?: NodeJS.Timeout;

  constructor() {
    this.supabase = createServerClient();
    this.initializeCircuitBreakers();
    this.startHealthMonitoring();
  }

  /**
   * Monitor external service call and record metrics
   */
  async monitorServiceCall<T>(
    serviceName: string,
    operation: string,
    serviceCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const config = SERVICE_CONFIGS[serviceName];
    if (!config) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker?.isOpen()) {
      throw new Error(`Circuit breaker open for ${serviceName}`);
    }

    const startTime = performance.now();
    const callId = crypto.randomUUID();

    let success = true;
    let responseSize = 0;
    let statusCode = 200;
    let error: Error | undefined;

    try {
      // Check rate limits before making the call
      await this.checkRateLimit(serviceName, operation);

      const result = await serviceCall();

      // Estimate response size
      if (result) {
        responseSize = JSON.stringify(result).length;
      }

      // Record successful call
      circuitBreaker?.recordSuccess();

      return result;
    } catch (err) {
      success = false;
      error = err as Error;
      statusCode = this.extractStatusCode(error);

      // Record failure
      circuitBreaker?.recordFailure();

      throw err;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Record performance metrics
      performanceCollector.recordExternalService(
        serviceName,
        operation,
        duration,
        success,
        responseSize
      );

      // Record service call details
      await this.recordServiceCall({
        id: callId,
        serviceName,
        operation,
        duration,
        success,
        statusCode,
        responseSize,
        timestamp: new Date().toISOString(),
        error: error?.message,
        metadata,
      });

      // Update rate limit tracking
      await this.updateRateLimit(serviceName, operation);

      // Calculate and record costs
      await this.recordServiceCost(serviceName, operation, success, metadata);
    }
  }

  /**
   * Get current service metrics
   */
  async getServiceMetrics(serviceName?: string): Promise<ServiceMetrics[]> {
    const services = serviceName ? [serviceName] : Object.keys(SERVICE_CONFIGS);
    const metrics: ServiceMetrics[] = [];

    for (const service of services) {
      const config = SERVICE_CONFIGS[service];
      const health = await this.getServiceHealth(service);
      const rateLimit = this.rateLimitCache.get(service);
      const cost = await this.getServiceCost(service);

      metrics.push({
        serviceName: service,
        availability: health.uptime / 100,
        avgResponseTime: health.responseTime,
        errorRate: await this.getErrorRate(service),
        throughput: await this.getThroughput(service),
        rateLimitUsage: rateLimit?.utilisationPercentage || 0,
        cost: {
          current: cost.totalCost,
          projected: cost.projectedMonthlyCost,
          currency: config.costs.currency,
        },
        lastCheck: health.lastSuccessfulCall,
        status: health.status,
      });
    }

    return metrics;
  }

  /**
   * Get service health status
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const { data: calls } = await this.supabase
      .from('service_calls')
      .select('*')
      .eq('service_name', serviceName)
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false });

    if (!calls || calls.length === 0) {
      return {
        serviceName,
        status: 'unknown',
        uptime: 0,
        responseTime: 0,
        errorCount: 0,
        lastSuccessfulCall: new Date(0).toISOString(),
        slaCompliance: 0,
      };
    }

    const successfulCalls = calls.filter(call => call.success);
    const failedCalls = calls.filter(call => !call.success);
    const uptime = (successfulCalls.length / calls.length) * 100;
    const avgResponseTime = successfulCalls.length > 0
      ? successfulCalls.reduce((sum, call) => sum + call.duration, 0) / successfulCalls.length
      : 0;

    // Determine status
    let status: ServiceHealth['status'] = 'healthy';
    if (uptime < 50) status = 'down';
    else if (uptime < 95) status = 'degraded';

    // SLA compliance (99.9% uptime, <1s response time)
    const slaUptimeCompliance = uptime >= 99.9 ? 100 : (uptime / 99.9) * 100;
    const slaResponseCompliance = avgResponseTime <= 1000 ? 100 : Math.max(0, 100 - ((avgResponseTime - 1000) / 1000) * 10);
    const slaCompliance = (slaUptimeCompliance + slaResponseCompliance) / 2;

    return {
      serviceName,
      status,
      uptime,
      responseTime: avgResponseTime,
      errorCount: failedCalls.length,
      lastError: failedCalls[0]?.error,
      lastSuccessfulCall: successfulCalls[0]?.timestamp || new Date(0).toISOString(),
      slaCompliance,
    };
  }

  /**
   * Get rate limit status for all services
   */
  getRateLimits(): RateLimit[] {
    return Array.from(this.rateLimitCache.values());
  }

  /**
   * Get service cost analytics
   */
  async getServiceCostAnalytics(
    serviceName?: string,
    period?: string
  ): Promise<CostAnalytics[]> {
    const services = serviceName ? [serviceName] : Object.keys(SERVICE_CONFIGS);
    const targetPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM

    const analytics: CostAnalytics[] = [];

    for (const service of services) {
      const cost = await this.getServiceCost(service, targetPeriod);
      const previousCost = await this.getServiceCost(service, this.getPreviousPeriod(targetPeriod));

      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (cost.totalCost > previousCost.totalCost * 1.1) trend = 'increasing';
      else if (cost.totalCost < previousCost.totalCost * 0.9) trend = 'decreasing';

      analytics.push({
        serviceName: service,
        period: targetPeriod,
        totalCost: cost.totalCost,
        requestCount: cost.requestCount,
        costPerRequest: cost.costPerRequest,
        trend,
        projectedMonthlyCost: cost.projectedMonthlyCost,
        budgetUtilization: cost.budgetUtilization,
      });
    }

    return analytics;
  }

  /**
   * Get service alerts
   */
  async getServiceAlerts(
    serviceName?: string,
    resolved: boolean = false
  ): Promise<ServiceAlert[]> {
    let query = this.supabase
      .from('service_alerts')
      .select('*')
      .eq('resolved', resolved)
      .order('timestamp', { ascending: false });

    if (serviceName) {
      query = query.eq('service_name', serviceName);
    }

    const { data: alerts } = await query;
    return alerts || [];
  }

  /**
   * Create service alert
   */
  async createAlert(alert: Omit<ServiceAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const alertData = {
      id: crypto.randomUUID(),
      service_name: alert.serviceName,
      alert_type: alert.alertType,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    const { error } = await this.supabase
      .from('service_alerts')
      .insert(alertData);

    if (error) {
      console.error('Failed to create service alert:', error);
    }
  }

  /**
   * Resolve service alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const { error } = await this.supabase
      .from('service_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to resolve service alert:', error);
    }
  }

  /**
   * Initialize circuit breakers for all services
   */
  private initializeCircuitBreakers(): void {
    Object.keys(SERVICE_CONFIGS).forEach(serviceName => {
      this.circuitBreakers.set(serviceName, new CircuitBreaker({
        threshold: 5, // 5 failures
        timeout: 60000, // 1 minute
        resetTimeout: 30000, // 30 seconds
      }));
    });
  }

  /**
   * Start health monitoring for all services
   */
  private startHealthMonitoring(): void {
    this.healthTimer = setInterval(async () => {
      for (const serviceName of Object.keys(SERVICE_CONFIGS)) {
        try {
          const health = await this.getServiceHealth(serviceName);

          // Record health metrics
          performanceCollector.recordMetric(`service.${serviceName}.uptime`, health.uptime);
          performanceCollector.recordMetric(`service.${serviceName}.response_time`, health.responseTime);
          performanceCollector.recordMetric(`service.${serviceName}.sla_compliance`, health.slaCompliance);

          // Check for alerts
          await this.checkServiceAlerts(serviceName, health);
        } catch (error) {
          console.error(`Health check failed for ${serviceName}:`, error);
        }
      }
    }, this.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }
  }

  /**
   * Check rate limits before making API call
   */
  private async checkRateLimit(serviceName: string, operation: string): Promise<void> {
    const rateLimit = this.rateLimitCache.get(serviceName);
    if (!rateLimit) return;

    if (rateLimit.remaining <= 0 && new Date() < new Date(rateLimit.resetTime)) {
      throw new Error(`Rate limit exceeded for ${serviceName}. Resets at ${rateLimit.resetTime}`);
    }
  }

  /**
   * Update rate limit tracking after API call
   */
  private async updateRateLimit(serviceName: string, operation: string): Promise<void> {
    const config = SERVICE_CONFIGS[serviceName];
    const now = new Date();

    // Get current usage from database
    const { data: usage } = await this.supabase
      .from('rate_limit_usage')
      .select('*')
      .eq('service_name', serviceName)
      .gte('timestamp', new Date(now.getTime() - 60000).toISOString()) // Last minute
      .single();

    const currentUsage = usage?.request_count || 0;
    const limit = config.rateLimits.requestsPerMinute;
    const remaining = Math.max(0, limit - currentUsage - 1);
    const resetTime = new Date(Math.ceil(now.getTime() / 60000) * 60000); // Next minute

    const rateLimit: RateLimit = {
      serviceName,
      endpoint: operation,
      limit,
      remaining,
      resetTime: resetTime.toISOString(),
      windowType: 'minute',
      utilisationPercentage: ((limit - remaining) / limit) * 100,
    };

    this.rateLimitCache.set(serviceName, rateLimit);

    // Record usage
    await this.supabase
      .from('rate_limit_usage')
      .upsert({
        service_name: serviceName,
        window_start: new Date(Math.floor(now.getTime() / 60000) * 60000).toISOString(),
        request_count: currentUsage + 1,
        limit: limit,
        updated_at: now.toISOString(),
      });
  }

  /**
   * Record service call details
   */
  private async recordServiceCall(call: {
    id: string;
    serviceName: string;
    operation: string;
    duration: number;
    success: boolean;
    statusCode: number;
    responseSize: number;
    timestamp: string;
    error?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('service_calls')
        .insert({
          id: call.id,
          service_name: call.serviceName,
          operation: call.operation,
          duration_ms: call.duration,
          success: call.success,
          status_code: call.statusCode,
          response_size_bytes: call.responseSize,
          error_message: call.error,
          metadata: call.metadata || {},
          timestamp: call.timestamp,
        });

      if (error) {
        console.error('Failed to record service call:', error);
      }
    } catch (error) {
      console.error('Error recording service call:', error);
    }
  }

  /**
   * Record service cost
   */
  private async recordServiceCost(
    serviceName: string,
    operation: string,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!success) return;

    const config = SERVICE_CONFIGS[serviceName];
    let cost = 0;

    // Calculate cost based on service type
    if (config.costs.perMessage && (operation.includes('sms') || operation.includes('message'))) {
      cost = config.costs.perMessage;
    } else if (config.costs.perEmail && operation.includes('email')) {
      cost = config.costs.perEmail;
    } else if (config.costs.perRequest) {
      cost = config.costs.perRequest;
    }

    if (cost > 0) {
      const { error } = await this.supabase
        .from('service_costs')
        .insert({
          id: crypto.randomUUID(),
          service_name: serviceName,
          operation,
          cost_amount: cost,
          currency: config.costs.currency,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to record service cost:', error);
      }
    }
  }

  /**
   * Get error rate for service
   */
  private async getErrorRate(serviceName: string): Promise<number> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last hour

    const { data: calls } = await this.supabase
      .from('service_calls')
      .select('success')
      .eq('service_name', serviceName)
      .gte('timestamp', startTime.toISOString());

    if (!calls || calls.length === 0) return 0;

    const failedCalls = calls.filter(call => !call.success).length;
    return failedCalls / calls.length;
  }

  /**
   * Get throughput for service
   */
  private async getThroughput(serviceName: string): Promise<number> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 60 * 1000); // Last minute

    const { data: calls } = await this.supabase
      .from('service_calls')
      .select('id')
      .eq('service_name', serviceName)
      .gte('timestamp', startTime.toISOString());

    return calls?.length || 0;
  }

  /**
   * Get service cost for period
   */
  private async getServiceCost(serviceName: string, period?: string): Promise<CostAnalytics> {
    const targetPeriod = period || new Date().toISOString().slice(0, 7);
    const startOfMonth = `${targetPeriod}-01T00:00:00Z`;
    const endOfMonth = new Date(new Date(startOfMonth).getTime() + 31 * 24 * 60 * 60 * 1000).toISOString();

    const { data: costs } = await this.supabase
      .from('service_costs')
      .select('*')
      .eq('service_name', serviceName)
      .gte('timestamp', startOfMonth)
      .lt('timestamp', endOfMonth);

    const totalCost = costs?.reduce((sum, cost) => sum + cost.cost_amount, 0) || 0;
    const requestCount = costs?.length || 0;
    const costPerRequest = requestCount > 0 ? totalCost / requestCount : 0;

    // Project monthly cost based on current usage
    const daysInMonth = new Date(new Date(startOfMonth).getFullYear(), new Date(startOfMonth).getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const projectedMonthlyCost = requestCount > 0 ? (totalCost / dayOfMonth) * daysInMonth : 0;

    // Budget utilization (assuming $100 monthly budget per service)
    const monthlyBudget = 100;
    const budgetUtilization = totalCost / monthlyBudget;

    return {
      serviceName,
      period: targetPeriod,
      totalCost,
      requestCount,
      costPerRequest,
      trend: 'stable', // Would calculate from previous period
      projectedMonthlyCost,
      budgetUtilization,
    };
  }

  /**
   * Get previous period for comparison
   */
  private getPreviousPeriod(period: string): string {
    const date = new Date(`${period}-01`);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  }

  /**
   * Extract status code from error
   */
  private extractStatusCode(error: Error): number {
    // Try to extract status code from error message
    const match = error.message.match(/status.*?(\d{3})/i);
    return match ? parseInt(match[1]) : 500;
  }

  /**
   * Check for service alerts
   */
  private async checkServiceAlerts(serviceName: string, health: ServiceHealth): Promise<void> {
    // Availability alerts
    if (health.uptime < 95) {
      await this.createAlert({
        serviceName,
        alertType: 'availability',
        severity: health.uptime < 50 ? 'critical' : 'high',
        message: `Service ${serviceName} availability is ${health.uptime.toFixed(1)}%`,
      });
    }

    // Performance alerts
    if (health.responseTime > 5000) {
      await this.createAlert({
        serviceName,
        alertType: 'performance',
        severity: health.responseTime > 10000 ? 'critical' : 'high',
        message: `Service ${serviceName} response time is ${health.responseTime.toFixed(0)}ms`,
      });
    }

    // SLA breach alerts
    if (health.slaCompliance < 95) {
      await this.createAlert({
        serviceName,
        alertType: 'sla_breach',
        severity: health.slaCompliance < 90 ? 'critical' : 'high',
        message: `Service ${serviceName} SLA compliance is ${health.slaCompliance.toFixed(1)}%`,
      });
    }

    // Rate limit alerts
    const rateLimit = this.rateLimitCache.get(serviceName);
    if (rateLimit && rateLimit.utilisationPercentage > 80) {
      await this.createAlert({
        serviceName,
        alertType: 'rate_limit',
        severity: rateLimit.utilisationPercentage > 95 ? 'critical' : 'medium',
        message: `Service ${serviceName} rate limit utilization is ${rateLimit.utilisationPercentage.toFixed(1)}%`,
      });
    }
  }
}

// =============================================
// CIRCUIT BREAKER IMPLEMENTATION
// =============================================

class CircuitBreaker {
  private threshold: number;
  private timeout: number;
  private resetTimeout: number;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private nextAttempt: number = 0;

  constructor(options: { threshold: number; timeout: number; resetTimeout: number }) {
    this.threshold = options.threshold;
    this.timeout = options.timeout;
    this.resetTimeout = options.resetTimeout;
  }

  isOpen(): boolean {
    if (this.state === 'open' && Date.now() > this.nextAttempt) {
      this.state = 'half-open';
      return false;
    }
    return this.state === 'open';
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const serviceMonitor = new ServiceMonitor();

// =============================================
// MONITORING WRAPPERS
// =============================================

/**
 * Wrapper for Twilio API calls
 */
export async function monitorTwilioCall<T>(
  operation: string,
  twilioCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return serviceMonitor.monitorServiceCall('twilio', operation, twilioCall, metadata);
}

/**
 * Wrapper for email service calls
 */
export async function monitorEmailCall<T>(
  provider: 'sendgrid' | 'resend',
  operation: string,
  emailCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return serviceMonitor.monitorServiceCall(provider, operation, emailCall, metadata);
}

/**
 * Wrapper for push notification calls
 */
export async function monitorPushCall<T>(
  provider: 'firebase' | 'pusher',
  operation: string,
  pushCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return serviceMonitor.monitorServiceCall(provider, operation, pushCall, metadata);
}