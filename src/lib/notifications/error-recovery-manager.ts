/**
 * Error Recovery Manager
 * MELLOWISE-015: Centralized error handling and recovery coordination for notifications
 *
 * Implements circuit breaker patterns, error classification, and coordinated recovery
 * strategies to ensure 99.9%+ notification delivery reliability.
 */

import { createServerClient } from '@/lib/supabase/server';
import {
  ErrorRecoveryConfig,
  ErrorType,
  ServiceHealth,
  CircuitBreakerState,
  RecoveryStrategy,
  ErrorClassification,
  FailureThreshold,
  RecoveryEvent,
  ErrorRecoveryMetrics,
  NotificationChannel,
  SystemAlert
} from '@/types/notifications';

/**
 * Circuit Breaker implementation for preventing cascading failures
 */
class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;
  private successCount = 0;

  constructor(
    private config: {
      failureThreshold: number;
      recoveryTimeout: number;
      halfOpenMaxCalls: number;
      monitoringWindow: number;
    }
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN - operation rejected');
      }
      // Transition to half-open
      this.state = 'half-open';
      this.successCount = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.state = 'closed';
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open' ||
        this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }
}

/**
 * Error Recovery Manager - Central coordination for notification error handling
 */
export class ErrorRecoveryManager {
  private supabase;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private config: ErrorRecoveryConfig;
  private healthStatuses: Map<string, ServiceHealth> = new Map();
  private recoveryInProgress: Set<string> = new Set();

  constructor(config?: Partial<ErrorRecoveryConfig>) {
    this.supabase = createServerClient();
    this.config = this.mergeWithDefaults(config);
    this.initializeCircuitBreakers();
    this.startHealthMonitoring();
  }

  /**
   * Classify error and determine recovery strategy
   */
  async classifyAndRecover(
    error: Error,
    context: {
      service: string;
      operation: string;
      userId?: string;
      notificationId?: string;
      channel?: NotificationChannel;
      metadata?: Record<string, any>;
    }
  ): Promise<RecoveryStrategy> {
    const classification = this.classifyError(error, context);
    const strategy = await this.determineRecoveryStrategy(classification, context);

    // Log error for analysis
    await this.logError(error, context, classification, strategy);

    // Execute recovery strategy
    await this.executeRecoveryStrategy(strategy, context);

    return strategy;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async executeWithProtection<T>(
    serviceId: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const breaker = this.getCircuitBreaker(serviceId);

    try {
      return await breaker.execute(operation);
    } catch (error) {
      if (fallback && breaker.getState() === 'open') {
        console.warn(`Circuit breaker OPEN for ${serviceId}, executing fallback`);
        return await fallback();
      }
      throw error;
    }
  }

  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    services: Record<string, ServiceHealth>;
    alerts: SystemAlert[];
  }> {
    const services: Record<string, ServiceHealth> = {};
    const alerts: SystemAlert[] = [];

    for (const [serviceId, health] of this.healthStatuses) {
      services[serviceId] = health;

      if (health.status === 'critical') {
        alerts.push({
          type: 'service_critical',
          serviceId,
          message: `${serviceId} service is in critical state`,
          timestamp: new Date().toISOString(),
          severity: 'high'
        });
      }
    }

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const criticalServices = Object.values(services).filter(s => s.status === 'critical').length;
    const degradedServices = Object.values(services).filter(s => s.status === 'degraded').length;

    if (criticalServices > 0) {
      overall = 'critical';
    } else if (degradedServices > 1) {
      overall = 'degraded';
    }

    return { overall, services, alerts };
  }

  /**
   * Get error recovery metrics
   */
  async getRecoveryMetrics(timeWindow: number = 24): Promise<ErrorRecoveryMetrics> {
    const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000).toISOString();

    const { data: errorLogs } = await this.supabase
      .from('notification_error_logs')
      .select('*')
      .gte('created_at', since);

    const { data: recoveryEvents } = await this.supabase
      .from('recovery_events')
      .select('*')
      .gte('created_at', since);

    const totalErrors = errorLogs?.length || 0;
    const autoRecovered = recoveryEvents?.filter(e => e.strategy_type === 'automatic').length || 0;
    const manualInterventions = recoveryEvents?.filter(e => e.strategy_type === 'manual').length || 0;

    const errorsByType = (errorLogs || []).reduce((acc, log) => {
      acc[log.error_type] = (acc[log.error_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mttr = this.calculateMTTR(recoveryEvents || []);
    const availability = this.calculateAvailability(errorLogs || [], timeWindow);

    return {
      totalErrors,
      autoRecovered,
      manualInterventions,
      recoveryRate: totalErrors > 0 ? autoRecovered / totalErrors : 1,
      errorsByType,
      meanTimeToRecovery: mttr,
      systemAvailability: availability,
      circuitBreakerTrips: this.getCircuitBreakerStats(),
      fallbackUsage: this.getFallbackStats(recoveryEvents || [])
    };
  }

  /**
   * Force recovery for a specific service
   */
  async forceRecovery(serviceId: string, strategy: 'reset' | 'restart' | 'failover'): Promise<boolean> {
    if (this.recoveryInProgress.has(serviceId)) {
      throw new Error(`Recovery already in progress for ${serviceId}`);
    }

    this.recoveryInProgress.add(serviceId);

    try {
      switch (strategy) {
        case 'reset':
          await this.resetService(serviceId);
          break;
        case 'restart':
          await this.restartService(serviceId);
          break;
        case 'failover':
          await this.initiateFailover(serviceId);
          break;
      }

      // Log recovery event
      await this.logRecoveryEvent({
        serviceId,
        strategy,
        type: 'manual',
        success: true,
        duration: 0,
        triggeredBy: 'admin'
      });

      return true;
    } catch (error) {
      console.error(`Force recovery failed for ${serviceId}:`, error);

      await this.logRecoveryEvent({
        serviceId,
        strategy,
        type: 'manual',
        success: false,
        duration: 0,
        triggeredBy: 'admin',
        error: String(error)
      });

      return false;
    } finally {
      this.recoveryInProgress.delete(serviceId);
    }
  }

  /**
   * Private: Classify error type and severity
   */
  private classifyError(error: Error, context: any): ErrorClassification {
    const message = error.message.toLowerCase();
    const stack = error.stack || '';

    // Network/connectivity errors
    if (message.includes('network') || message.includes('timeout') ||
        message.includes('connection') || message.includes('enotfound')) {
      return {
        type: 'network',
        severity: 'medium',
        transient: true,
        retryable: true,
        estimatedRecoveryTime: 30000 // 30 seconds
      };
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('invalid token') ||
        message.includes('authentication') || message.includes('401')) {
      return {
        type: 'authentication',
        severity: 'high',
        transient: false,
        retryable: false,
        estimatedRecoveryTime: 300000 // 5 minutes
      };
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('429') ||
        message.includes('quota exceeded')) {
      return {
        type: 'rate_limit',
        severity: 'medium',
        transient: true,
        retryable: true,
        estimatedRecoveryTime: 60000 // 1 minute
      };
    }

    // Resource exhaustion
    if (message.includes('memory') || message.includes('disk space') ||
        message.includes('cpu') || message.includes('503')) {
      return {
        type: 'resource_exhaustion',
        severity: 'high',
        transient: true,
        retryable: true,
        estimatedRecoveryTime: 120000 // 2 minutes
      };
    }

    // Database errors
    if (message.includes('database') || message.includes('sql') ||
        message.includes('connection pool') || stack.includes('supabase')) {
      return {
        type: 'database',
        severity: 'high',
        transient: true,
        retryable: true,
        estimatedRecoveryTime: 60000 // 1 minute
      };
    }

    // Third-party service errors
    if (context.service && ['twilio', 'sendgrid', 'push-service'].includes(context.service)) {
      return {
        type: 'third_party',
        severity: 'medium',
        transient: true,
        retryable: true,
        estimatedRecoveryTime: 45000 // 45 seconds
      };
    }

    // Default classification
    return {
      type: 'unknown',
      severity: 'medium',
      transient: false,
      retryable: true,
      estimatedRecoveryTime: 30000
    };
  }

  /**
   * Private: Determine appropriate recovery strategy
   */
  private async determineRecoveryStrategy(
    classification: ErrorClassification,
    context: any
  ): Promise<RecoveryStrategy> {
    const baseStrategy: RecoveryStrategy = {
      type: classification.retryable ? 'retry' : 'fallback',
      retryCount: 0,
      backoffMultiplier: 2,
      maxBackoffTime: 300000, // 5 minutes
      fallbackChannels: [],
      escalationRules: []
    };

    // Customize strategy based on error type
    switch (classification.type) {
      case 'network':
        return {
          ...baseStrategy,
          retryCount: 3,
          backoffMultiplier: 1.5,
          fallbackChannels: this.getAlternativeChannels(context.channel),
          escalationRules: [
            { condition: 'retry_exhausted', action: 'use_fallback_channel' },
            { condition: 'all_channels_failed', action: 'queue_for_manual_review' }
          ]
        };

      case 'authentication':
        return {
          ...baseStrategy,
          type: 'refresh_credentials',
          retryCount: 1,
          escalationRules: [
            { condition: 'credential_refresh_failed', action: 'alert_admin' },
            { condition: 'repeated_auth_failures', action: 'disable_service' }
          ]
        };

      case 'rate_limit':
        return {
          ...baseStrategy,
          type: 'backoff_and_retry',
          retryCount: 5,
          backoffMultiplier: 3,
          maxBackoffTime: 600000, // 10 minutes
          escalationRules: [
            { condition: 'persistent_rate_limiting', action: 'switch_to_backup_service' }
          ]
        };

      case 'resource_exhaustion':
        return {
          ...baseStrategy,
          type: 'resource_optimization',
          retryCount: 2,
          backoffMultiplier: 4,
          fallbackChannels: this.getLowerResourceChannels(context.channel),
          escalationRules: [
            { condition: 'resource_still_exhausted', action: 'scale_up_resources' },
            { condition: 'scaling_failed', action: 'emergency_throttling' }
          ]
        };

      case 'database':
        return {
          ...baseStrategy,
          type: 'database_recovery',
          retryCount: 4,
          backoffMultiplier: 2,
          escalationRules: [
            { condition: 'connection_pool_exhausted', action: 'restart_connection_pool' },
            { condition: 'database_unavailable', action: 'switch_to_backup_db' }
          ]
        };

      default:
        return baseStrategy;
    }
  }

  /**
   * Private: Execute the determined recovery strategy
   */
  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    context: any
  ): Promise<void> {
    const startTime = Date.now();

    try {
      switch (strategy.type) {
        case 'retry':
          await this.executeRetryStrategy(strategy, context);
          break;
        case 'fallback':
          await this.executeFallbackStrategy(strategy, context);
          break;
        case 'refresh_credentials':
          await this.executeCredentialRefresh(strategy, context);
          break;
        case 'backoff_and_retry':
          await this.executeBackoffRetry(strategy, context);
          break;
        case 'resource_optimization':
          await this.executeResourceOptimization(strategy, context);
          break;
        case 'database_recovery':
          await this.executeDatabaseRecovery(strategy, context);
          break;
      }

      // Log successful recovery
      await this.logRecoveryEvent({
        serviceId: context.service,
        strategy: strategy.type,
        type: 'automatic',
        success: true,
        duration: Date.now() - startTime,
        triggeredBy: 'error_recovery_manager'
      });

    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError);

      await this.logRecoveryEvent({
        serviceId: context.service,
        strategy: strategy.type,
        type: 'automatic',
        success: false,
        duration: Date.now() - startTime,
        triggeredBy: 'error_recovery_manager',
        error: String(recoveryError)
      });

      // Execute escalation rules
      await this.executeEscalationRules(strategy.escalationRules, context);
    }
  }

  /**
   * Private: Initialize circuit breakers for all services
   */
  private initializeCircuitBreakers(): void {
    const services = ['email', 'push', 'sms', 'database', 'twilio', 'sendgrid'];

    services.forEach(service => {
      this.circuitBreakers.set(service, new CircuitBreaker({
        failureThreshold: this.config.circuitBreaker.failureThreshold,
        recoveryTimeout: this.config.circuitBreaker.recoveryTimeout,
        halfOpenMaxCalls: this.config.circuitBreaker.halfOpenMaxCalls,
        monitoringWindow: this.config.circuitBreaker.monitoringWindow
      }));
    });
  }

  /**
   * Private: Start continuous health monitoring
   */
  private startHealthMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(async () => {
      await this.performHealthChecks();
    }, 30000);
  }

  /**
   * Private: Perform health checks on all services
   */
  private async performHealthChecks(): Promise<void> {
    const services = ['database', 'email', 'push', 'sms'];

    for (const service of services) {
      try {
        const health = await this.checkServiceHealth(service);
        this.healthStatuses.set(service, health);

        // Trigger alerts for critical services
        if (health.status === 'critical') {
          await this.triggerCriticalAlert(service, health);
        }
      } catch (error) {
        console.error(`Health check failed for ${service}:`, error);
        this.healthStatuses.set(service, {
          status: 'critical',
          latency: 0,
          errorRate: 100,
          lastCheck: new Date().toISOString(),
          details: { error: String(error) }
        });
      }
    }
  }

  /**
   * Private: Check individual service health
   */
  private async checkServiceHealth(service: string): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      let isHealthy = false;
      let details: Record<string, any> = {};

      switch (service) {
        case 'database':
          // Simple query to check database connectivity
          const { data, error } = await this.supabase
            .from('notification_preferences')
            .select('id')
            .limit(1);
          isHealthy = !error;
          details = { connected: !error, error: error?.message };
          break;

        case 'email':
          // Check if email service is configured
          isHealthy = !!process.env.SENDGRID_API_KEY;
          details = { configured: isHealthy };
          break;

        case 'push':
          // Check push service configuration
          isHealthy = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
          details = { configured: isHealthy };
          break;

        case 'sms':
          // Check Twilio configuration
          isHealthy = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
          details = { configured: isHealthy };
          break;
      }

      const latency = Date.now() - startTime;
      const status = isHealthy ? 'healthy' : 'degraded';

      return {
        status,
        latency,
        errorRate: isHealthy ? 0 : 100,
        lastCheck: new Date().toISOString(),
        details
      };

    } catch (error) {
      return {
        status: 'critical',
        latency: Date.now() - startTime,
        errorRate: 100,
        lastCheck: new Date().toISOString(),
        details: { error: String(error) }
      };
    }
  }

  /**
   * Private: Get circuit breaker for service
   */
  private getCircuitBreaker(serviceId: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceId)) {
      this.circuitBreakers.set(serviceId, new CircuitBreaker({
        failureThreshold: this.config.circuitBreaker.failureThreshold,
        recoveryTimeout: this.config.circuitBreaker.recoveryTimeout,
        halfOpenMaxCalls: this.config.circuitBreaker.halfOpenMaxCalls,
        monitoringWindow: this.config.circuitBreaker.monitoringWindow
      }));
    }
    return this.circuitBreakers.get(serviceId)!;
  }

  /**
   * Private: Get alternative channels for fallback
   */
  private getAlternativeChannels(primaryChannel?: NotificationChannel): NotificationChannel[] {
    const allChannels: NotificationChannel[] = ['email', 'push', 'in_app', 'sms'];
    return allChannels.filter(channel => channel !== primaryChannel);
  }

  /**
   * Private: Get lower resource consuming channels
   */
  private getLowerResourceChannels(primaryChannel?: NotificationChannel): NotificationChannel[] {
    // In-app and email are generally lower resource than SMS and push
    const lowResourceChannels: NotificationChannel[] = ['in_app', 'email'];
    return lowResourceChannels.filter(channel => channel !== primaryChannel);
  }

  /**
   * Private: Merge configuration with defaults
   */
  private mergeWithDefaults(config?: Partial<ErrorRecoveryConfig>): ErrorRecoveryConfig {
    return {
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minute
        halfOpenMaxCalls: 3,
        monitoringWindow: 300000, // 5 minutes
        ...config?.circuitBreaker
      },
      retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        jitterEnabled: true,
        ...config?.retry
      },
      healthCheck: {
        interval: 30000,
        timeout: 5000,
        ...config?.healthCheck
      },
      alerting: {
        webhookUrl: process.env.ALERT_WEBHOOK_URL,
        slackChannel: process.env.ALERT_SLACK_CHANNEL,
        emailRecipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        ...config?.alerting
      }
    };
  }

  /**
   * Private: Log error for analysis and debugging
   */
  private async logError(
    error: Error,
    context: any,
    classification: ErrorClassification,
    strategy: RecoveryStrategy
  ): Promise<void> {
    try {
      await this.supabase
        .from('notification_error_logs')
        .insert({
          id: crypto.randomUUID(),
          tenant_id: context.tenantId || '00000000-0000-0000-0000-000000000000',
          service_id: context.service,
          operation: context.operation,
          user_id: context.userId,
          notification_id: context.notificationId,
          channel: context.channel,
          error_type: classification.type,
          error_severity: classification.severity,
          error_message: error.message,
          error_stack: error.stack,
          is_transient: classification.transient,
          is_retryable: classification.retryable,
          recovery_strategy: strategy.type,
          metadata: context.metadata,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Private: Log recovery event
   */
  private async logRecoveryEvent(event: {
    serviceId: string;
    strategy: string;
    type: 'automatic' | 'manual';
    success: boolean;
    duration: number;
    triggeredBy: string;
    error?: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('recovery_events')
        .insert({
          id: crypto.randomUUID(),
          service_id: event.serviceId,
          strategy_type: event.strategy,
          execution_type: event.type,
          success: event.success,
          duration_ms: event.duration,
          triggered_by: event.triggeredBy,
          error_message: event.error,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log recovery event:', logError);
    }
  }

  /**
   * Private: Calculate Mean Time To Recovery
   */
  private calculateMTTR(recoveryEvents: any[]): number {
    const successfulRecoveries = recoveryEvents.filter(e => e.success);
    if (successfulRecoveries.length === 0) return 0;

    const totalDuration = successfulRecoveries.reduce((sum, e) => sum + e.duration_ms, 0);
    return Math.round(totalDuration / successfulRecoveries.length);
  }

  /**
   * Private: Calculate system availability
   */
  private calculateAvailability(errorLogs: any[], timeWindowHours: number): number {
    const windowMs = timeWindowHours * 60 * 60 * 1000;
    const criticalErrors = errorLogs.filter(e => e.error_severity === 'critical').length;

    // Estimate downtime based on critical errors (assume 5 minutes per critical error)
    const estimatedDowntimeMs = criticalErrors * 5 * 60 * 1000;
    const availability = Math.max(0, (windowMs - estimatedDowntimeMs) / windowMs);

    return Math.round(availability * 10000) / 100; // Return as percentage with 2 decimal places
  }

  /**
   * Private: Get circuit breaker statistics
   */
  private getCircuitBreakerStats(): Record<string, { state: string; failures: number }> {
    const stats: Record<string, { state: string; failures: number }> = {};

    for (const [serviceId, breaker] of this.circuitBreakers) {
      stats[serviceId] = {
        state: breaker.getState(),
        failures: breaker.getFailureCount()
      };
    }

    return stats;
  }

  /**
   * Private: Get fallback usage statistics
   */
  private getFallbackStats(recoveryEvents: any[]): Record<string, number> {
    const fallbackEvents = recoveryEvents.filter(e => e.strategy_type === 'fallback');
    const stats: Record<string, number> = {};

    for (const event of fallbackEvents) {
      stats[event.service_id] = (stats[event.service_id] || 0) + 1;
    }

    return stats;
  }

  // Placeholder implementations for recovery strategies
  private async executeRetryStrategy(strategy: RecoveryStrategy, context: any): Promise<void> {
    // Implementation would retry the original operation
    console.log(`Executing retry strategy for ${context.service}`);
  }

  private async executeFallbackStrategy(strategy: RecoveryStrategy, context: any): Promise<void> {
    // Implementation would switch to alternative channels
    console.log(`Executing fallback strategy for ${context.service}`);
  }

  private async executeCredentialRefresh(strategy: RecoveryStrategy, context: any): Promise<void> {
    // Implementation would refresh authentication tokens
    console.log(`Executing credential refresh for ${context.service}`);
  }

  private async executeBackoffRetry(strategy: RecoveryStrategy, context: any): Promise<void> {
    // Implementation would retry with exponential backoff
    console.log(`Executing backoff retry for ${context.service}`);
  }

  private async executeResourceOptimization(strategy: RecoveryStrategy, context: any): Promise<void> {
    // Implementation would optimize resource usage
    console.log(`Executing resource optimization for ${context.service}`);
  }

  private async executeDatabaseRecovery(strategy: RecoveryStrategy, context: any): Promise<void> {
    // Implementation would recover database connections
    console.log(`Executing database recovery for ${context.service}`);
  }

  private async executeEscalationRules(rules: any[], context: any): Promise<void> {
    // Implementation would execute escalation procedures
    console.log(`Executing escalation rules for ${context.service}`);
  }

  private async resetService(serviceId: string): Promise<void> {
    const breaker = this.circuitBreakers.get(serviceId);
    if (breaker) {
      breaker.reset();
    }
    console.log(`Reset service: ${serviceId}`);
  }

  private async restartService(serviceId: string): Promise<void> {
    // Implementation would restart the service
    console.log(`Restart service: ${serviceId}`);
  }

  private async initiateFailover(serviceId: string): Promise<void> {
    // Implementation would switch to backup service
    console.log(`Initiate failover for service: ${serviceId}`);
  }

  private async triggerCriticalAlert(serviceId: string, health: ServiceHealth): Promise<void> {
    // Implementation would send critical alerts
    console.log(`Critical alert for ${serviceId}:`, health);
  }
}