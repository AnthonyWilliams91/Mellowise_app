/**
 * Retry Engine
 * MELLOWISE-015: Intelligent retry strategies with exponential backoff and jitter
 *
 * Implements sophisticated retry mechanisms to handle transient failures
 * while preventing thundering herd effects and respecting rate limits.
 */

import { createServerClient } from '@/lib/supabase/server';
import {
  RetryConfig,
  RetryPolicy,
  RetryAttempt,
  RetryResult,
  BackoffStrategy,
  JitterType,
  RetryBudget,
  RetryMetrics,
  PriorityLevel,
  RetryQueue,
  ErrorClassification
} from '@/types/notifications';

/**
 * Retry Budget Manager - Prevents excessive retry attempts
 */
class RetryBudgetManager {
  private budgets: Map<string, RetryBudget> = new Map();

  constructor(private defaultBudget: RetryBudget) {}

  /**
   * Check if retry is allowed within budget
   */
  canRetry(serviceId: string, priority: PriorityLevel): boolean {
    const budget = this.getBudget(serviceId);
    const priorityBudget = budget.perPriority[priority];

    const now = Date.now();
    const windowStart = now - budget.windowMs;

    // Clean old attempts
    budget.attempts = budget.attempts.filter(attempt => attempt.timestamp > windowStart);

    // Check if under budget
    const currentAttempts = budget.attempts.filter(a => a.priority === priority).length;
    return currentAttempts < priorityBudget.maxAttempts;
  }

  /**
   * Consume retry budget
   */
  consumeBudget(serviceId: string, priority: PriorityLevel): void {
    const budget = this.getBudget(serviceId);
    budget.attempts.push({
      timestamp: Date.now(),
      priority
    });
  }

  /**
   * Get budget for service
   */
  private getBudget(serviceId: string): RetryBudget {
    if (!this.budgets.has(serviceId)) {
      this.budgets.set(serviceId, {
        ...this.defaultBudget,
        attempts: []
      });
    }
    return this.budgets.get(serviceId)!;
  }

  /**
   * Reset budget for service
   */
  resetBudget(serviceId: string): void {
    this.budgets.delete(serviceId);
  }

  /**
   * Get budget statistics
   */
  getBudgetStats(): Record<string, { consumed: number; remaining: number }> {
    const stats: Record<string, { consumed: number; remaining: number }> = {};

    for (const [serviceId, budget] of this.budgets) {
      const now = Date.now();
      const windowStart = now - budget.windowMs;
      const recentAttempts = budget.attempts.filter(a => a.timestamp > windowStart);

      const totalConsumed = recentAttempts.length;
      const totalAllowed = Object.values(budget.perPriority)
        .reduce((sum, p) => sum + p.maxAttempts, 0);

      stats[serviceId] = {
        consumed: totalConsumed,
        remaining: Math.max(0, totalAllowed - totalConsumed)
      };
    }

    return stats;
  }
}

/**
 * Priority Queue for retry attempts
 */
class PriorityRetryQueue {
  private queues: Map<PriorityLevel, RetryQueue[]> = new Map();
  private readonly priorityOrder: PriorityLevel[] = ['critical', 'high', 'medium', 'low'];

  constructor() {
    this.priorityOrder.forEach(priority => {
      this.queues.set(priority, []);
    });
  }

  /**
   * Add retry attempt to queue
   */
  enqueue(attempt: RetryQueue): void {
    const queue = this.queues.get(attempt.priority)!;
    queue.push(attempt);
    // Sort by next attempt time
    queue.sort((a, b) => a.nextAttemptTime - b.nextAttemptTime);
  }

  /**
   * Get next retry attempt ready for execution
   */
  dequeue(): RetryQueue | null {
    const now = Date.now();

    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority)!;
      const readyIndex = queue.findIndex(attempt => attempt.nextAttemptTime <= now);

      if (readyIndex !== -1) {
        return queue.splice(readyIndex, 1)[0];
      }
    }

    return null;
  }

  /**
   * Get all pending attempts
   */
  getPending(): RetryQueue[] {
    const pending: RetryQueue[] = [];
    for (const queue of this.queues.values()) {
      pending.push(...queue);
    }
    return pending.sort((a, b) => a.nextAttemptTime - b.nextAttemptTime);
  }

  /**
   * Remove attempts for specific operation
   */
  remove(operationId: string): boolean {
    let removed = false;
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(attempt => attempt.operationId === operationId);
      if (index !== -1) {
        queue.splice(index, 1);
        removed = true;
      }
    }
    return removed;
  }

  /**
   * Get queue size by priority
   */
  getSize(): Record<PriorityLevel, number> {
    const sizes: Record<PriorityLevel, number> = {} as any;
    for (const [priority, queue] of this.queues) {
      sizes[priority] = queue.length;
    }
    return sizes;
  }
}

/**
 * Retry Engine - Manages intelligent retry attempts with backoff strategies
 */
export class RetryEngine {
  private supabase;
  private budgetManager: RetryBudgetManager;
  private retryQueue: PriorityRetryQueue;
  private config: RetryConfig;
  private isProcessing = false;

  constructor(config?: Partial<RetryConfig>) {
    this.supabase = createServerClient();
    this.config = this.mergeWithDefaults(config);
    this.budgetManager = new RetryBudgetManager(this.config.budget);
    this.retryQueue = new PriorityRetryQueue();
    this.startRetryProcessor();
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operationId: string,
    operation: () => Promise<T>,
    policy: Partial<RetryPolicy> = {}
  ): Promise<T> {
    const fullPolicy = this.mergeWithDefaultPolicy(policy);
    const attempts: RetryAttempt[] = [];

    for (let attempt = 1; attempt <= fullPolicy.maxAttempts; attempt++) {
      const attemptStart = Date.now();

      try {
        // Check retry budget
        if (attempt > 1 && !this.budgetManager.canRetry(fullPolicy.serviceId, fullPolicy.priority)) {
          throw new Error(`Retry budget exhausted for ${fullPolicy.serviceId}`);
        }

        // Execute operation
        const result = await operation();

        // Record successful attempt
        attempts.push({
          attemptNumber: attempt,
          timestamp: attemptStart,
          duration: Date.now() - attemptStart,
          success: true
        });

        await this.recordRetryMetrics(operationId, fullPolicy, attempts, true);
        return result;

      } catch (error) {
        const duration = Date.now() - attemptStart;

        attempts.push({
          attemptNumber: attempt,
          timestamp: attemptStart,
          duration,
          success: false,
          error: String(error)
        });

        // Check if error is retryable
        if (!this.isRetryableError(error, fullPolicy)) {
          await this.recordRetryMetrics(operationId, fullPolicy, attempts, false);
          throw error;
        }

        // If this was the last attempt, fail
        if (attempt >= fullPolicy.maxAttempts) {
          await this.recordRetryMetrics(operationId, fullPolicy, attempts, false);
          throw new Error(`Operation failed after ${attempt} attempts: ${error}`);
        }

        // Consume retry budget
        this.budgetManager.consumeBudget(fullPolicy.serviceId, fullPolicy.priority);

        // Calculate backoff delay
        const delay = this.calculateBackoffDelay(attempt, fullPolicy);

        // Wait before next attempt
        await this.delay(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected end of retry loop');
  }

  /**
   * Schedule retry for later execution
   */
  async scheduleRetry(
    operationId: string,
    operation: () => Promise<any>,
    policy: Partial<RetryPolicy> = {},
    delay?: number
  ): Promise<void> {
    const fullPolicy = this.mergeWithDefaultPolicy(policy);
    const nextAttemptTime = Date.now() + (delay || this.calculateBackoffDelay(1, fullPolicy));

    this.retryQueue.enqueue({
      operationId,
      operation,
      policy: fullPolicy,
      nextAttemptTime,
      queuedAt: Date.now()
    });

    // Persist to database for durability
    await this.persistRetryAttempt({
      operationId,
      policy: fullPolicy,
      nextAttemptTime,
      queuedAt: Date.now()
    });
  }

  /**
   * Cancel scheduled retry
   */
  cancelRetry(operationId: string): boolean {
    const removed = this.retryQueue.remove(operationId);

    // Also remove from persistent storage
    this.supabase
      .from('retry_queue')
      .delete()
      .eq('operation_id', operationId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to remove retry from persistent queue:', error);
        }
      });

    return removed;
  }

  /**
   * Get retry metrics
   */
  async getRetryMetrics(timeWindow: number = 24): Promise<RetryMetrics> {
    const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000).toISOString();

    const { data: retryRecords } = await this.supabase
      .from('retry_attempts')
      .select('*')
      .gte('created_at', since);

    const records = retryRecords || [];

    const totalOperations = new Set(records.map(r => r.operation_id)).size;
    const successfulRetries = records.filter(r => r.final_success).length;
    const failedRetries = records.filter(r => !r.final_success).length;

    const attemptsByService = records.reduce((acc, record) => {
      const service = record.service_id;
      if (!acc[service]) {
        acc[service] = { total: 0, successful: 0, failed: 0 };
      }
      acc[service].total++;
      if (record.final_success) {
        acc[service].successful++;
      } else {
        acc[service].failed++;
      }
      return acc;
    }, {} as Record<string, { total: number; successful: number; failed: number }>);

    const averageAttempts = records.length > 0 ?
      records.reduce((sum, r) => sum + r.total_attempts, 0) / records.length : 0;

    const budgetStats = this.budgetManager.getBudgetStats();
    const queueStats = this.retryQueue.getSize();

    return {
      totalOperations,
      successfulRetries,
      failedRetries,
      successRate: totalOperations > 0 ? successfulRetries / totalOperations : 0,
      averageAttemptsPerOperation: averageAttempts,
      attemptsByService,
      budgetUtilization: budgetStats,
      currentQueueSize: queueStats,
      timeWindow
    };
  }

  /**
   * Update retry configuration
   */
  updateConfig(newConfig: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.budget) {
      this.budgetManager = new RetryBudgetManager(this.config.budget);
    }
  }

  /**
   * Private: Calculate backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number, policy: RetryPolicy): number {
    let delay: number;

    switch (policy.backoffStrategy) {
      case 'fixed':
        delay = policy.baseDelay;
        break;

      case 'linear':
        delay = policy.baseDelay * attempt;
        break;

      case 'exponential':
        delay = policy.baseDelay * Math.pow(policy.backoffMultiplier, attempt - 1);
        break;

      case 'polynomial':
        delay = policy.baseDelay * Math.pow(attempt, 2);
        break;

      default:
        delay = policy.baseDelay * Math.pow(policy.backoffMultiplier, attempt - 1);
    }

    // Apply maximum delay cap
    delay = Math.min(delay, policy.maxDelay);

    // Apply jitter to prevent thundering herd
    if (policy.jitterType !== 'none') {
      delay = this.applyJitter(delay, policy.jitterType);
    }

    return Math.round(delay);
  }

  /**
   * Private: Apply jitter to delay
   */
  private applyJitter(delay: number, jitterType: JitterType): number {
    switch (jitterType) {
      case 'full':
        // Random between 0 and delay
        return Math.random() * delay;

      case 'equal':
        // Random between delay/2 and delay
        return delay * (0.5 + Math.random() * 0.5);

      case 'decorrelated':
        // Decorrelated jitter (AWS recommendation)
        return Math.random() * delay * 3;

      default:
        return delay;
    }
  }

  /**
   * Private: Check if error is retryable
   */
  private isRetryableError(error: any, policy: RetryPolicy): boolean {
    const message = String(error).toLowerCase();

    // Non-retryable errors
    const nonRetryablePatterns = [
      'unauthorized',
      'forbidden',
      'invalid token',
      'authentication failed',
      'bad request',
      'validation error',
      'not found'
    ];

    for (const pattern of nonRetryablePatterns) {
      if (message.includes(pattern)) {
        return false;
      }
    }

    // Retryable errors
    const retryablePatterns = [
      'network',
      'timeout',
      'connection',
      'rate limit',
      'too many requests',
      'service unavailable',
      'internal server error',
      'bad gateway',
      'gateway timeout'
    ];

    for (const pattern of retryablePatterns) {
      if (message.includes(pattern)) {
        return true;
      }
    }

    // Default based on policy
    return policy.retryOnUnknownErrors;
  }

  /**
   * Private: Merge with default configuration
   */
  private mergeWithDefaults(config?: Partial<RetryConfig>): RetryConfig {
    return {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterType: 'equal',
      retryOnUnknownErrors: true,
      budget: {
        windowMs: 300000, // 5 minutes
        perPriority: {
          critical: { maxAttempts: 50 },
          high: { maxAttempts: 30 },
          medium: { maxAttempts: 20 },
          low: { maxAttempts: 10 }
        },
        attempts: []
      },
      ...config
    };
  }

  /**
   * Private: Merge with default retry policy
   */
  private mergeWithDefaultPolicy(policy: Partial<RetryPolicy>): RetryPolicy {
    return {
      serviceId: 'default',
      maxAttempts: this.config.maxAttempts,
      baseDelay: this.config.baseDelay,
      maxDelay: this.config.maxDelay,
      backoffStrategy: 'exponential',
      backoffMultiplier: this.config.backoffMultiplier,
      jitterType: this.config.jitterType,
      priority: 'medium',
      retryOnUnknownErrors: this.config.retryOnUnknownErrors,
      ...policy
    };
  }

  /**
   * Private: Simple delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Private: Start background retry processor
   */
  private startRetryProcessor(): void {
    // Process queue every 5 seconds
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processRetryQueue();
      }
    }, 5000);

    // Load pending retries from database on startup
    this.loadPendingRetries();
  }

  /**
   * Private: Process retry queue
   */
  private async processRetryQueue(): Promise<void> {
    this.isProcessing = true;

    try {
      const maxConcurrent = 10;
      const promises: Promise<void>[] = [];

      for (let i = 0; i < maxConcurrent; i++) {
        const retryAttempt = this.retryQueue.dequeue();
        if (!retryAttempt) break;

        promises.push(this.executeQueuedRetry(retryAttempt));
      }

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error processing retry queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Private: Execute queued retry attempt
   */
  private async executeQueuedRetry(retryAttempt: RetryQueue): Promise<void> {
    try {
      await this.executeWithRetry(
        retryAttempt.operationId,
        retryAttempt.operation,
        retryAttempt.policy
      );

      // Remove from persistent storage on success
      await this.removePersistedRetry(retryAttempt.operationId);

    } catch (error) {
      console.error(`Queued retry failed for ${retryAttempt.operationId}:`, error);

      // Update persistent record with failure
      await this.updatePersistedRetry(retryAttempt.operationId, {
        last_attempt: new Date().toISOString(),
        error_message: String(error),
        status: 'failed'
      });
    }
  }

  /**
   * Private: Load pending retries from database
   */
  private async loadPendingRetries(): Promise<void> {
    try {
      const { data: pendingRetries } = await this.supabase
        .from('retry_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('next_attempt_time', new Date(Date.now() + 3600000).toISOString()); // Next hour

      for (const retry of pendingRetries || []) {
        // Note: We can't restore the operation function from database,
        // so we'll need to recreate it based on the operation type
        const operation = this.recreateOperation(retry);

        if (operation) {
          this.retryQueue.enqueue({
            operationId: retry.operation_id,
            operation,
            policy: retry.policy,
            nextAttemptTime: new Date(retry.next_attempt_time).getTime(),
            queuedAt: new Date(retry.queued_at).getTime()
          });
        }
      }
    } catch (error) {
      console.error('Failed to load pending retries:', error);
    }
  }

  /**
   * Private: Recreate operation function from stored data
   */
  private recreateOperation(retryData: any): (() => Promise<any>) | null {
    // This would need to be implemented based on your specific operation types
    // For now, return null to indicate the operation cannot be recreated
    console.warn(`Cannot recreate operation for ${retryData.operation_id} - operation type not supported`);
    return null;
  }

  /**
   * Private: Record retry metrics
   */
  private async recordRetryMetrics(
    operationId: string,
    policy: RetryPolicy,
    attempts: RetryAttempt[],
    finalSuccess: boolean
  ): Promise<void> {
    try {
      await this.supabase
        .from('retry_attempts')
        .insert({
          operation_id: operationId,
          service_id: policy.serviceId,
          total_attempts: attempts.length,
          final_success: finalSuccess,
          total_duration: attempts.reduce((sum, a) => sum + a.duration, 0),
          backoff_strategy: policy.backoffStrategy,
          priority: policy.priority,
          attempts_data: attempts,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record retry metrics:', error);
    }
  }

  /**
   * Private: Persist retry attempt to database
   */
  private async persistRetryAttempt(retryData: {
    operationId: string;
    policy: RetryPolicy;
    nextAttemptTime: number;
    queuedAt: number;
  }): Promise<void> {
    try {
      await this.supabase
        .from('retry_queue')
        .insert({
          operation_id: retryData.operationId,
          service_id: retryData.policy.serviceId,
          policy: retryData.policy,
          next_attempt_time: new Date(retryData.nextAttemptTime).toISOString(),
          queued_at: new Date(retryData.queuedAt).toISOString(),
          status: 'pending'
        });
    } catch (error) {
      console.error('Failed to persist retry attempt:', error);
    }
  }

  /**
   * Private: Remove persisted retry
   */
  private async removePersistedRetry(operationId: string): Promise<void> {
    try {
      await this.supabase
        .from('retry_queue')
        .delete()
        .eq('operation_id', operationId);
    } catch (error) {
      console.error('Failed to remove persisted retry:', error);
    }
  }

  /**
   * Private: Update persisted retry
   */
  private async updatePersistedRetry(operationId: string, updates: any): Promise<void> {
    try {
      await this.supabase
        .from('retry_queue')
        .update(updates)
        .eq('operation_id', operationId);
    } catch (error) {
      console.error('Failed to update persisted retry:', error);
    }
  }
}