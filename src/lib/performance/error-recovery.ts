/**
 * Error Recovery System
 * MELLOWISE-032: Comprehensive error recovery with automatic retry and graceful degradation
 */

import React from 'react';
import type {
  ErrorBoundaryState,
  RetryConfig,
  NetworkError,
  ErrorRecoveryOptions,
  SessionState,
  RecoveryResult,
  DEFAULT_PERFORMANCE_CONFIG
} from '@/types/performance';

export class ErrorRecoveryService {
  private retryConfig: RetryConfig;
  private recoveryOptions: ErrorRecoveryOptions;
  private sessionBackups: Map<string, SessionState> = new Map();
  private errorLog: Error[] = [];
  private retryAttempts: Map<string, number> = new Map();

  constructor(
    retryConfig?: Partial<RetryConfig>,
    recoveryOptions?: Partial<ErrorRecoveryOptions>
  ) {
    this.retryConfig = {
      ...DEFAULT_PERFORMANCE_CONFIG.errorRecovery,
      maxRetries: DEFAULT_PERFORMANCE_CONFIG.errorRecovery.maxRetries,
      retryDelay: DEFAULT_PERFORMANCE_CONFIG.errorRecovery.retryDelay,
      backoffMultiplier: DEFAULT_PERFORMANCE_CONFIG.errorRecovery.backoffMultiplier,
      retryCondition: this.defaultRetryCondition,
      ...retryConfig
    };

    this.recoveryOptions = {
      ...DEFAULT_PERFORMANCE_CONFIG.errorRecovery,
      ...recoveryOptions
    };

    this.setupGlobalErrorHandlers();
    this.startSessionBackup();
  }

  /**
   * Execute function with automatic retry and error recovery
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customRetryConfig };
    const attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();

      // Reset retry count on success
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      const networkError = this.classifyError(error);

      if (this.recoveryOptions.logError) {
        this.logError(networkError);
      }

      // Check if we should retry
      if (attempts < config.maxRetries && config.retryCondition(networkError)) {
        this.retryAttempts.set(operationId, attempts + 1);

        // Calculate delay with exponential backoff
        const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempts);

        if (this.recoveryOptions.notifyUser && attempts > 0) {
          this.notifyUserOfRetry(operationId, attempts + 1, delay);
        }

        await this.sleep(delay);
        return this.executeWithRetry(operation, operationId, customRetryConfig);
      }

      // Max retries reached or non-retryable error
      this.retryAttempts.delete(operationId);

      if (this.recoveryOptions.showFallback) {
        throw new RecoverableError(networkError, this.suggestFallback(operationId));
      }

      throw networkError;
    }
  }

  /**
   * Recover session from backup
   */
  async recoverSession(sessionId: string): Promise<RecoveryResult> {
    try {
      const backup = this.sessionBackups.get(sessionId);

      if (!backup) {
        return {
          success: false,
          recoveredData: null,
          dataLoss: true,
          recoveredAt: new Date(),
          message: 'No session backup found'
        };
      }

      // Check if backup is too old
      const maxAge = DEFAULT_PERFORMANCE_CONFIG.sessionRecovery.maxRecoveryAge * 1000;
      const age = Date.now() - backup.lastActivity.getTime();

      if (age > maxAge) {
        return {
          success: false,
          recoveredData: null,
          dataLoss: true,
          recoveredAt: new Date(),
          message: 'Session backup too old to recover'
        };
      }

      return {
        success: true,
        recoveredData: backup,
        dataLoss: false,
        recoveredAt: new Date(),
        message: 'Session successfully recovered'
      };
    } catch (error) {
      this.logError(error as Error);

      return {
        success: false,
        recoveredData: null,
        dataLoss: true,
        recoveredAt: new Date(),
        message: `Recovery failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Backup session state
   */
  backupSession(session: SessionState): void {
    try {
      const serializedSession = {
        ...session,
        lastActivity: new Date()
      };

      this.sessionBackups.set(session.id, serializedSession);

      // Store in localStorage for persistence
      if (this.recoveryOptions.preserveState) {
        localStorage.setItem(
          `mellowise_session_${session.id}`,
          JSON.stringify(serializedSession)
        );
      }
    } catch (error) {
      console.warn('Failed to backup session:', error);
    }
  }

  /**
   * Clear old session backups
   */
  clearOldBackups(): void {
    const maxAge = DEFAULT_PERFORMANCE_CONFIG.sessionRecovery.maxRecoveryAge * 1000;
    const cutoff = Date.now() - maxAge;

    // Clear memory backups
    for (const [sessionId, backup] of this.sessionBackups) {
      if (backup.lastActivity.getTime() < cutoff) {
        this.sessionBackups.delete(sessionId);
      }
    }

    // Clear localStorage backups
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('mellowise_session_')) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || '{}');
          if (new Date(backup.lastActivity).getTime() < cutoff) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key); // Remove corrupted entries
        }
      }
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    recentErrors: Error[];
    mostCommonErrors: string[];
    errorRate: number;
  } {
    const recentCutoff = Date.now() - 60 * 60 * 1000; // Last hour
    const recentErrors = this.errorLog.filter(
      error => (error as any).timestamp > recentCutoff
    );

    const errorTypes = this.errorLog.reduce((acc, error) => {
      const type = error.constructor.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonErrors = Object.entries(errorTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.slice(-10), // Last 10 recent errors
      mostCommonErrors,
      errorRate: recentErrors.length / 60 // Errors per minute
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Default retry condition
   */
  private defaultRetryCondition = (error: NetworkError): boolean => {
    // Don't retry client errors (4xx) except for specific cases
    if (error.status && error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429; // Timeout or rate limit
    }

    // Retry server errors (5xx) and network errors
    if (error.status && error.status >= 500) return true;

    // Retry network-related errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') return true;

    // Retry connection errors
    if (error.message.includes('fetch') || error.message.includes('network')) return true;

    return false;
  };

  /**
   * Classify error type
   */
  private classifyError(error: any): NetworkError {
    const networkError: NetworkError = {
      name: error.name || 'UnknownError',
      message: error.message || 'Unknown error occurred',
      stack: error.stack,
      isRetryable: false
    };

    // HTTP errors
    if (error.status) {
      networkError.status = error.status;
      networkError.isRetryable = this.defaultRetryCondition(networkError);
    }

    // Network errors
    if (error.code || error.message.includes('fetch') || error.message.includes('network')) {
      networkError.code = error.code || 'NETWORK_ERROR';
      networkError.isRetryable = true;
    }

    // Timeout errors
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      networkError.code = 'TIMEOUT';
      networkError.isRetryable = true;
    }

    // Retry-After header
    if (error.retryAfter) {
      networkError.retryAfter = error.retryAfter;
    }

    return networkError;
  }

  /**
   * Log error with timestamp
   */
  logError(error: Error): void {
    const errorWithTimestamp = {
      ...error,
      timestamp: Date.now()
    } as any;

    this.errorLog.push(errorWithTimestamp);

    // Keep error log size manageable
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }

    console.error('Error logged:', error);
  }

  /**
   * Notify user of retry attempt
   */
  private notifyUserOfRetry(operationId: string, attemptNumber: number, delay: number): void {
    console.log(`Retrying ${operationId} (attempt ${attemptNumber}) in ${delay}ms...`);

    // In a real app, you might show a toast notification
    // toast.info(`Retrying... (attempt ${attemptNumber})`);
  }

  /**
   * Suggest fallback action
   */
  private suggestFallback(operationId: string): string {
    const fallbacks: Record<string, string> = {
      'api-call': 'Try refreshing the page or check your internet connection',
      'file-upload': 'Please check your file size and format, then try again',
      'authentication': 'Please log in again',
      'data-save': 'Your work has been saved locally and will sync when connection is restored'
    };

    return fallbacks[operationId] || 'Please try again or contact support if the problem persists';
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(`Unhandled Promise Rejection: ${event.reason}`));

      if (this.recoveryOptions.notifyUser) {
        console.warn('An unexpected error occurred. The application will attempt to recover.');
      }
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(new Error(`Global Error: ${event.message} at ${event.filename}:${event.lineno}`));
    });
  }

  /**
   * Start periodic session backup
   */
  private startSessionBackup(): void {
    const interval = DEFAULT_PERFORMANCE_CONFIG.sessionRecovery.saveInterval * 1000;

    setInterval(() => {
      this.clearOldBackups();
    }, interval);
  }
}

/**
 * Recoverable Error class
 */
export class RecoverableError extends Error {
  constructor(
    public originalError: Error,
    public fallbackMessage: string
  ) {
    super(originalError.message);
    this.name = 'RecoverableError';
  }
}

/**
 * Error Boundary Component
 */
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorRecovery: ErrorRecoveryService;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: props.maxRetries || 3
    };

    this.errorRecovery = new ErrorRecoveryService();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to recovery service
    this.errorRecovery.logError(error);
  }

  retry = () => {
    if (this.state.retryCount < this.state.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const canRetry = this.state.retryCount < this.state.maxRetries;

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          {canRetry && (
            <button onClick={this.retry} className="retry-button">
              Try Again ({this.state.maxRetries - this.state.retryCount} attempts remaining)
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error recovery
 */
export function useErrorRecovery() {
  const [errorRecovery] = React.useState(() => new ErrorRecoveryService());

  const executeWithRetry = React.useCallback(
    <T>(operation: () => Promise<T>, operationId: string, config?: Partial<RetryConfig>) => {
      return errorRecovery.executeWithRetry(operation, operationId, config);
    },
    [errorRecovery]
  );

  const recoverSession = React.useCallback(
    (sessionId: string) => errorRecovery.recoverSession(sessionId),
    [errorRecovery]
  );

  const backupSession = React.useCallback(
    (session: SessionState) => errorRecovery.backupSession(session),
    [errorRecovery]
  );

  return {
    executeWithRetry,
    recoverSession,
    backupSession,
    errorStats: errorRecovery.getErrorStats()
  };
}

// Export singleton instance
export const errorRecovery = new ErrorRecoveryService();