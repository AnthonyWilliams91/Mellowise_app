/**
 * Mellowise Error Handling Framework
 * 
 * Centralized error handling, logging, and user notification system
 * that integrates with our error message taxonomy and monitoring.
 */

import { 
  ErrorDefinition, 
  ErrorDisplay,
  ErrorSeverity,
  ErrorCategory,
  AllErrors,
  getErrorByCode,
  formatErrorForDisplay,
  DEFAULT_ERROR
} from '@/constants/error-messages';

import { performanceMonitor } from '@/utils/performance-monitor';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  page: string;
  userAgent: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  error: ErrorDefinition;
  context: ErrorContext;
  stackTrace?: string;
  handled: boolean;
  reported: boolean;
}

export interface ErrorHandlerOptions {
  enableReporting: boolean;
  enableConsoleLogging: boolean;
  enableUserNotification: boolean;
  maxRetries: number;
  retryDelay: number;
}

class ErrorHandler {
  private options: ErrorHandlerOptions;
  private errorQueue: ErrorReport[] = [];
  private retryAttempts: Map<string, number> = new Map();

  constructor(options: Partial<ErrorHandlerOptions> = {}) {
    this.options = {
      enableReporting: process.env.NODE_ENV === 'production',
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableUserNotification: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    };

    this.setupGlobalErrorHandlers();
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(
          DEFAULT_ERROR,
          this.createContext('unhandled_promise_rejection'),
          event.reason?.stack,
          false
        );
        event.preventDefault();
      });

      // Handle global JavaScript errors
      window.addEventListener('error', (event) => {
        this.handleError(
          DEFAULT_ERROR,
          this.createContext('global_error'),
          event.error?.stack,
          false
        );
      });
    }
  }

  /**
   * Create error context from current environment
   */
  private createContext(source: string, additionalData?: Record<string, any>): ErrorContext {
    return {
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      page: typeof window !== 'undefined' ? window.location.pathname : source,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
      additionalData
    };
  }

  /**
   * Get current user ID from session/auth
   */
  private getUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id') || undefined;
    }
    return undefined;
  }

  /**
   * Get current session ID
   */
  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('session_id') || undefined;
    }
    return undefined;
  }

  /**
   * Handle error with full processing pipeline
   */
  public handleError(
    error: ErrorDefinition | string,
    context?: Partial<ErrorContext>,
    stackTrace?: string,
    handled: boolean = true
  ): ErrorReport {
    // Resolve error definition
    const errorDef = typeof error === 'string' ? 
      getErrorByCode(error) || DEFAULT_ERROR : 
      error;

    // Create full context
    const fullContext: ErrorContext = {
      ...this.createContext('manual'),
      ...context
    };

    // Create error report
    const report: ErrorReport = {
      error: errorDef,
      context: fullContext,
      stackTrace,
      handled,
      reported: false
    };

    // Process error through pipeline
    this.processError(report);

    return report;
  }

  /**
   * Process error through the handling pipeline
   */
  private async processError(report: ErrorReport): Promise<void> {
    // 1. Log error
    if (this.options.enableConsoleLogging) {
      this.logError(report);
    }

    // 2. Track performance impact
    this.trackErrorMetrics(report);

    // 3. Queue for reporting
    this.queueErrorReport(report);

    // 4. Show user notification if appropriate
    if (this.options.enableUserNotification && this.shouldShowToUser(report.error)) {
      this.showUserNotification(report.error);
    }

    // 5. Attempt reporting
    if (this.options.enableReporting) {
      await this.reportError(report);
    }
  }

  /**
   * Log error to console with appropriate level
   */
  private logError(report: ErrorReport): void {
    const { error, context, stackTrace } = report;
    const logMessage = `[${error.code}] ${error.title}: ${error.message}`;
    
    const logData = {
      error,
      context,
      stackTrace,
      page: context.page,
      userId: context.userId
    };

    switch (error.severity) {
      case 'critical':
        console.error('🔥 CRITICAL:', logMessage, logData);
        break;
      case 'high':
        console.error('🚨 HIGH:', logMessage, logData);
        break;
      case 'medium':
        console.warn('⚠️ MEDIUM:', logMessage, logData);
        break;
      case 'low':
        console.info('💡 LOW:', logMessage, logData);
        break;
    }
  }

  /**
   * Track error metrics for monitoring
   */
  private trackErrorMetrics(report: ErrorReport): void {
    const { error, context } = report;
    
    // Track error occurrence
    performanceMonitor.trackCustomMetric(
      `error_${error.category}_${error.code.toLowerCase()}`,
      1,
      'count'
    );

    // Track error by severity
    performanceMonitor.trackCustomMetric(
      `error_severity_${error.severity}`,
      1,
      'count'
    );

    // Track error by page
    performanceMonitor.trackCustomMetric(
      `error_page_${context.page.replace(/[^a-zA-Z0-9]/g, '_')}`,
      1,
      'count'
    );
  }

  /**
   * Queue error report for batch processing
   */
  private queueErrorReport(report: ErrorReport): void {
    this.errorQueue.push(report);

    // Process queue if it gets too large
    if (this.errorQueue.length >= 10) {
      this.flushErrorQueue();
    }
  }

  /**
   * Flush error queue to reporting service
   */
  public async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.batchReportErrors(errors);
    } catch (error) {
      // Re-queue errors if reporting fails
      this.errorQueue.unshift(...errors);
      console.error('Failed to flush error queue:', error);
    }
  }

  /**
   * Report single error to monitoring service
   */
  private async reportError(report: ErrorReport): Promise<void> {
    const reportKey = `${report.error.code}_${report.context.page}`;
    const attempts = this.retryAttempts.get(reportKey) || 0;

    if (attempts >= this.options.maxRetries) {
      console.warn(`Max retry attempts reached for error ${report.error.code}`);
      return;
    }

    try {
      await this.sendErrorToService(report);
      report.reported = true;
      this.retryAttempts.delete(reportKey);
    } catch (error) {
      this.retryAttempts.set(reportKey, attempts + 1);
      
      // Retry with exponential backoff
      setTimeout(() => {
        this.reportError(report);
      }, this.options.retryDelay * Math.pow(2, attempts));
    }
  }

  /**
   * Send error to external monitoring service
   */
  private async sendErrorToService(report: ErrorReport): Promise<void> {
    // Send to internal analytics endpoint
    if (typeof fetch !== 'undefined') {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'error_occurred',
          error: report.error,
          context: report.context,
          stackTrace: report.stackTrace,
          handled: report.handled,
          timestamp: report.context.timestamp
        })
      });
    }

    // Send to external services (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // Sentry integration
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(report.error.message), {
          tags: {
            errorCode: report.error.code,
            category: report.error.category,
            severity: report.error.severity
          },
          extra: report.context
        });
      }

      // Custom analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: report.error.message,
          fatal: report.error.severity === 'critical'
        });
      }
    }
  }

  /**
   * Batch report multiple errors
   */
  private async batchReportErrors(reports: ErrorReport[]): Promise<void> {
    if (typeof fetch === 'undefined') return;

    const payload = reports.map(report => ({
      event: 'error_occurred',
      error: report.error,
      context: report.context,
      stackTrace: report.stackTrace,
      handled: report.handled,
      timestamp: report.context.timestamp
    }));

    await fetch('/api/analytics/errors/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: payload })
    });

    reports.forEach(report => report.reported = true);
  }

  /**
   * Determine if error should be shown to user
   */
  private shouldShowToUser(error: ErrorDefinition): boolean {
    // Don't show system errors or low severity errors to users
    return error.category !== 'system' && error.severity !== 'low';
  }

  /**
   * Show error notification to user
   */
  private showUserNotification(error: ErrorDefinition): void {
    const display = formatErrorForDisplay(error);
    
    // Use your notification system here
    // For now, we'll just trigger a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mellowise:error', {
        detail: display
      }));
    }
  }

  /**
   * Handle API errors specifically
   */
  public handleAPIError(
    response: Response,
    endpoint: string,
    additionalContext?: Record<string, any>
  ): ErrorReport {
    let errorDef: ErrorDefinition;

    // Map HTTP status codes to error definitions
    switch (response.status) {
      case 401:
        errorDef = AllErrors.SESSION_EXPIRED;
        break;
      case 403:
        errorDef = AllErrors.ACCOUNT_LOCKED;
        break;
      case 429:
        errorDef = AllErrors.RATE_LIMITED;
        break;
      case 500:
        errorDef = AllErrors.SERVER_ERROR;
        break;
      case 503:
        errorDef = AllErrors.MAINTENANCE_MODE;
        break;
      default:
        errorDef = DEFAULT_ERROR;
    }

    return this.handleError(
      errorDef,
      {
        page: endpoint,
        additionalData: {
          ...additionalContext,
          statusCode: response.status,
          statusText: response.statusText,
          endpoint
        }
      }
    );
  }

  /**
   * Handle retry-able operations
   */
  public async withRetry<T>(
    operation: () => Promise<T>,
    errorCode: string,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    const maxAttempts = this.options.maxRetries + 1;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          // Final attempt failed
          this.handleError(
            getErrorByCode(errorCode) || DEFAULT_ERROR,
            {
              ...context,
              additionalData: {
                attempt,
                maxAttempts,
                finalError: lastError.message
              }
            },
            lastError.stack
          );
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => 
          setTimeout(resolve, this.options.retryDelay * attempt)
        );
      }
    }

    throw lastError!;
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStats(): {
    totalErrors: number;
    queuedErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
  } {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorQueue.forEach(report => {
      errorsByCategory[report.error.category] = 
        (errorsByCategory[report.error.category] || 0) + 1;
      errorsBySeverity[report.error.severity] = 
        (errorsBySeverity[report.error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errorQueue.length,
      queuedErrors: this.errorQueue.filter(r => !r.reported).length,
      errorsByCategory,
      errorsBySeverity
    };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions
export const handleError = (
  error: ErrorDefinition | string,
  context?: Partial<ErrorContext>,
  stackTrace?: string
) => errorHandler.handleError(error, context, stackTrace);

export const handleAPIError = (
  response: Response,
  endpoint: string,
  context?: Record<string, any>
) => errorHandler.handleAPIError(response, endpoint, context);

export const withRetry = <T>(
  operation: () => Promise<T>,
  errorCode: string,
  context?: Partial<ErrorContext>
) => errorHandler.withRetry(operation, errorCode, context);

// Export error handler for custom configuration
export { ErrorHandler };