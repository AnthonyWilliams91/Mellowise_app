/**
 * MELLOWISE-032: Error Recovery Service
 *
 * Intelligent error recovery with automatic strategies, session management,
 * and user experience optimization
 *
 * @version 1.0.0
 */

import {
  ErrorRecoveryStrategy,
  ErrorOccurrence,
  ErrorRecoveryMetrics,
  SessionRecoveryData,
  ErrorSeverity,
  ErrorCategory,
  ERROR_SEVERITY_WEIGHTS
} from '../../types/performance-optimization'

/**
 * Recovery action types
 */
type RecoveryAction =
  | 'retry' | 'fallback' | 'redirect' | 'refresh'
  | 'clear_cache' | 'reset_state' | 'show_message'
  | 'log_error' | 'escalate' | 'ignore'

/**
 * Recovery execution result
 */
interface RecoveryExecutionResult {
  success: boolean
  action_taken: RecoveryAction[]
  recovery_time: number
  user_message?: string
  requires_user_action: boolean
  escalation_needed: boolean
  session_recovered: boolean
}

/**
 * Error context information
 */
interface ErrorContext {
  user_id?: string
  session_id: string
  page_path: string
  user_agent: string
  timestamp: string
  stack_trace?: string
  component_stack?: string
  error_boundary?: string
  props_at_error?: Record<string, any>
  state_at_error?: Record<string, any>
}

/**
 * Recovery strategy matcher
 */
interface StrategyMatcher {
  test: (error: ErrorOccurrence) => boolean
  strategy: ErrorRecoveryStrategy
  priority: number
}

/**
 * Session state snapshot
 */
interface SessionSnapshot {
  url: string
  scroll_position: number
  form_data: Record<string, any>
  component_state: Record<string, any>
  user_selections: Record<string, any>
  timestamp: string
}

/**
 * Error Recovery Service Implementation
 */
export class ErrorRecoveryService {
  private tenant_id: string
  private strategies: Map<string, ErrorRecoveryStrategy> = new Map()
  private matchers: StrategyMatcher[] = []
  private recoveryHistory: Map<string, ErrorOccurrence[]> = new Map()
  private sessionSnapshots: Map<string, SessionSnapshot[]> = new Map()
  private metrics: ErrorRecoveryMetrics
  private maxRetryAttempts: number = 3
  private escalationThreshold: number = 5

  constructor(tenant_id: string) {
    this.tenant_id = tenant_id
    this.metrics = this.initializeMetrics()
    this.initializeDefaultStrategies()
    this.setupGlobalErrorHandlers()
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): ErrorRecoveryMetrics {
    return {
      tenant_id: this.tenant_id,
      id: `metrics-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      total_errors: 0,
      recovered_errors: 0,
      unrecovered_errors: 0,
      recovery_success_rate: 0,
      category_breakdown: {
        javascript: 0,
        network: 0,
        performance: 0,
        security: 0,
        accessibility: 0,
        compatibility: 0,
        user_experience: 0,
        data_integrity: 0,
        authentication: 0,
        authorization: 0
      },
      severity_breakdown: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      average_recovery_time: 0,
      fastest_recovery_time: Infinity,
      slowest_recovery_time: 0,
      affected_users: 0,
      affected_sessions: 0,
      user_experience_impact_score: 0,
      recorded_at: new Date().toISOString()
    }
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // JavaScript error recovery
    this.addStrategy({
      id: 'js-syntax-error',
      name: 'JavaScript Syntax Error Recovery',
      error_pattern: 'SyntaxError|ReferenceError|TypeError',
      category: 'javascript',
      priority: 1,
      recovery_actions: {
        retry: false,
        max_retries: 0,
        retry_delay: 0,
        fallback_action: 'reload_component',
        user_notification: 'A technical issue occurred. We\'re fixing it now.',
        automatic_recovery: true,
        escalation_threshold: 2
      },
      conditions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    })

    // Network error recovery
    this.addStrategy({
      id: 'network-error',
      name: 'Network Error Recovery',
      error_pattern: 'NetworkError|fetch failed|ERR_NETWORK',
      category: 'network',
      priority: 1,
      recovery_actions: {
        retry: true,
        max_retries: 3,
        retry_delay: 1000,
        fallback_action: 'show_offline_message',
        user_notification: 'Connection issue detected. Retrying...',
        automatic_recovery: true,
        escalation_threshold: 5
      },
      conditions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    })

    // Performance error recovery
    this.addStrategy({
      id: 'performance-timeout',
      name: 'Performance Timeout Recovery',
      error_pattern: 'TimeoutError|Script took too long',
      category: 'performance',
      priority: 1,
      recovery_actions: {
        retry: true,
        max_retries: 2,
        retry_delay: 2000,
        fallback_action: 'reduce_complexity',
        user_notification: 'Processing is taking longer than expected. Optimizing...',
        automatic_recovery: true,
        escalation_threshold: 3
      },
      conditions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    })

    // Authentication error recovery
    this.addStrategy({
      id: 'auth-error',
      name: 'Authentication Error Recovery',
      error_pattern: '401|Unauthorized|Authentication failed',
      category: 'authentication',
      priority: 2,
      recovery_actions: {
        retry: false,
        max_retries: 0,
        retry_delay: 0,
        fallback_action: 'redirect_to_login',
        user_notification: 'Your session has expired. Please log in again.',
        automatic_recovery: false,
        escalation_threshold: 1
      },
      conditions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    })

    // Data integrity error recovery
    this.addStrategy({
      id: 'data-corruption',
      name: 'Data Corruption Recovery',
      error_pattern: 'JSON.parse|Invalid data|Corrupt state',
      category: 'data_integrity',
      priority: 1,
      recovery_actions: {
        retry: false,
        max_retries: 0,
        retry_delay: 0,
        fallback_action: 'reset_local_state',
        user_notification: 'Data inconsistency detected. Refreshing...',
        automatic_recovery: true,
        escalation_threshold: 1
      },
      conditions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    })
  }

  /**
   * Add new recovery strategy
   */
  public addStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.set(strategy.id, strategy)

    // Create matcher for this strategy
    const matcher: StrategyMatcher = {
      test: (error: ErrorOccurrence) => {
        const regex = new RegExp(strategy.error_pattern, 'i')
        return regex.test(error.message) || regex.test(error.error_type)
      },
      strategy,
      priority: strategy.priority
    }

    this.matchers.push(matcher)
    this.matchers.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Handle error occurrence and attempt recovery
   */
  public async handleError(
    error: Error | ErrorOccurrence,
    context?: Partial<ErrorContext>
  ): Promise<RecoveryExecutionResult> {
    const startTime = performance.now()

    try {
      // Convert Error to ErrorOccurrence if needed
      const errorOccurrence = this.normalizeError(error, context)

      // Update metrics
      this.updateMetrics(errorOccurrence)

      // Find matching recovery strategy
      const strategy = this.findRecoveryStrategy(errorOccurrence)

      if (!strategy) {
        console.warn('No recovery strategy found for error:', errorOccurrence)
        return this.createFailureResult(startTime, ['log_error'])
      }

      // Check if we should escalate instead of retry
      if (this.shouldEscalate(errorOccurrence)) {
        return await this.escalateError(errorOccurrence, startTime)
      }

      // Execute recovery strategy
      const result = await this.executeRecoveryStrategy(strategy, errorOccurrence, startTime)

      // Record recovery attempt
      this.recordRecoveryAttempt(errorOccurrence, strategy, result)

      return result
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError)
      return this.createFailureResult(startTime, ['log_error'], true)
    }
  }

  /**
   * Normalize different error types to ErrorOccurrence
   */
  private normalizeError(error: Error | ErrorOccurrence, context?: Partial<ErrorContext>): ErrorOccurrence {
    if ('tenant_id' in error) {
      return error as ErrorOccurrence
    }

    const errorOccurrence: ErrorOccurrence = {
      tenant_id: this.tenant_id,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: context?.user_id,
      session_id: context?.session_id || 'unknown',
      message: error.message,
      stack_trace: error.stack,
      error_type: error.name || 'UnknownError',
      file_name: this.extractFileName(error.stack),
      line_number: this.extractLineNumber(error.stack),
      column_number: this.extractColumnNumber(error.stack),
      page_path: context?.page_path || window?.location?.pathname || '/',
      user_agent: context?.user_agent || navigator.userAgent,
      timestamp: context?.timestamp || new Date().toISOString(),
      category: this.categorizeError(error),
      severity: this.assessErrorSeverity(error),
      is_user_facing: this.isUserFacingError(error),
      recovery_attempted: false,
      user_context: {},
      system_context: {},
      custom_data: context ? { context } : undefined,
      created_at: new Date().toISOString()
    }

    return errorOccurrence
  }

  /**
   * Find appropriate recovery strategy
   */
  private findRecoveryStrategy(error: ErrorOccurrence): ErrorRecoveryStrategy | null {
    for (const matcher of this.matchers) {
      if (matcher.strategy.is_active && matcher.test(error)) {
        // Check conditions
        if (this.matchesConditions(error, matcher.strategy.conditions)) {
          return matcher.strategy
        }
      }
    }
    return null
  }

  /**
   * Execute recovery strategy
   */
  private async executeRecoveryStrategy(
    strategy: ErrorRecoveryStrategy,
    error: ErrorOccurrence,
    startTime: number
  ): Promise<RecoveryExecutionResult> {
    const actions: RecoveryAction[] = []
    let success = false
    const userMessage = strategy.recovery_actions.user_notification
    let requiresUserAction = false
    let sessionRecovered = false

    try {
      // Retry logic
      if (strategy.recovery_actions.retry) {
        const retryResult = await this.attemptRetry(strategy, error)
        actions.push('retry')
        success = retryResult.success

        if (success) {
          this.metrics.recovered_errors++
          return {
            success: true,
            action_taken: actions,
            recovery_time: performance.now() - startTime,
            user_message,
            requires_user_action: false,
            escalation_needed: false,
            session_recovered: true
          }
        }
      }

      // Fallback actions
      if (strategy.recovery_actions.fallback_action) {
        const fallbackResult = await this.executeFallbackAction(
          strategy.recovery_actions.fallback_action,
          error
        )
        actions.push(...fallbackResult.actions)
        success = fallbackResult.success
        requiresUserAction = fallbackResult.requiresUserAction
        sessionRecovered = fallbackResult.sessionRecovered
      }

      // Automatic vs manual recovery
      if (!strategy.recovery_actions.automatic_recovery) {
        requiresUserAction = true
      }

    } catch (executionError) {
      console.error('Recovery strategy execution failed:', executionError)
      actions.push('log_error')
    }

    // Update metrics
    if (success) {
      this.metrics.recovered_errors++
    } else {
      this.metrics.unrecovered_errors++
    }

    return {
      success,
      action_taken: actions,
      recovery_time: performance.now() - startTime,
      user_message,
      requires_user_action: requiresUserAction,
      escalation_needed: this.shouldEscalate(error),
      session_recovered: sessionRecovered
    }
  }

  /**
   * Attempt retry with backoff
   */
  private async attemptRetry(
    strategy: ErrorRecoveryStrategy,
    error: ErrorOccurrence
  ): Promise<{ success: boolean }> {
    const maxRetries = strategy.recovery_actions.max_retries
    const baseDelay = strategy.recovery_actions.retry_delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Wait with exponential backoff
        if (attempt > 1) {
          const delay = baseDelay * Math.pow(2, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        // Simulate retry (in real implementation, this would re-execute the failed operation)
        const retrySuccess = await this.simulateRetry(error)

        if (retrySuccess) {
          console.log(`Recovery successful on attempt ${attempt}`)
          return { success: true }
        }
      } catch (retryError) {
        console.warn(`Retry attempt ${attempt} failed:`, retryError)
      }
    }

    return { success: false }
  }

  /**
   * Execute fallback action
   */
  private async executeFallbackAction(
    action: string,
    error: ErrorOccurrence
  ): Promise<{
    success: boolean
    actions: RecoveryAction[]
    requiresUserAction: boolean
    sessionRecovered: boolean
  }> {
    const actions: RecoveryAction[] = []
    let success = false
    let requiresUserAction = false
    let sessionRecovered = false

    switch (action) {
      case 'reload_component':
        // Trigger component reload
        success = await this.reloadComponent(error)
        actions.push('refresh')
        sessionRecovered = success
        break

      case 'show_offline_message':
        // Display offline/network error message
        this.showUserMessage('You appear to be offline. Please check your connection.')
        actions.push('show_message')
        success = true
        break

      case 'reduce_complexity':
        // Simplify current operation
        success = await this.reduceComplexity(error)
        actions.push('fallback')
        sessionRecovered = success
        break

      case 'redirect_to_login':
        // Redirect to login page
        this.redirectToLogin()
        actions.push('redirect')
        success = true
        requiresUserAction = true
        break

      case 'reset_local_state':
        // Clear local state/storage
        success = await this.resetLocalState(error)
        actions.push('reset_state', 'clear_cache')
        sessionRecovered = success
        break

      case 'show_error_boundary':
        // Display error boundary fallback UI
        this.showErrorBoundary(error)
        actions.push('show_message')
        success = true
        break

      default:
        console.warn(`Unknown fallback action: ${action}`)
        actions.push('log_error')
    }

    return {
      success,
      actions,
      requiresUserAction,
      sessionRecovered
    }
  }

  /**
   * Fallback action implementations
   */
  private async reloadComponent(error: ErrorOccurrence): Promise<boolean> {
    try {
      // Emit event for component reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('componentReloadRequested', {
          detail: { error, timestamp: Date.now() }
        }))
      }
      return true
    } catch {
      return false
    }
  }

  private showUserMessage(message: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showUserMessage', {
        detail: { message, type: 'info' }
      }))
    }
  }

  private async reduceComplexity(error: ErrorOccurrence): Promise<boolean> {
    try {
      // Emit event to reduce complexity
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reduceComplexity', {
          detail: { error, timestamp: Date.now() }
        }))
      }
      return true
    } catch {
      return false
    }
  }

  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000) // Give user time to read the message
    }
  }

  private async resetLocalState(error: ErrorOccurrence): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        // Clear relevant local storage
        const keysToRemove = Object.keys(localStorage).filter(key =>
          key.startsWith(`tenant:${this.tenant_id}:`)
        )
        keysToRemove.forEach(key => localStorage.removeItem(key))

        // Clear session storage
        const sessionKeysToRemove = Object.keys(sessionStorage).filter(key =>
          key.startsWith(`tenant:${this.tenant_id}:`)
        )
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

        // Emit state reset event
        window.dispatchEvent(new CustomEvent('stateResetRequested', {
          detail: { error, timestamp: Date.now() }
        }))
      }
      return true
    } catch {
      return false
    }
  }

  private showErrorBoundary(error: ErrorOccurrence): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showErrorBoundary', {
        detail: { error, timestamp: Date.now() }
      }))
    }
  }

  /**
   * Session management
   */
  public createSessionSnapshot(sessionId: string): void {
    if (typeof window === 'undefined') return

    try {
      const snapshot: SessionSnapshot = {
        url: window.location.href,
        scroll_position: window.scrollY,
        form_data: this.extractFormData(),
        component_state: this.extractComponentState(),
        user_selections: this.extractUserSelections(),
        timestamp: new Date().toISOString()
      }

      const snapshots = this.sessionSnapshots.get(sessionId) || []
      snapshots.push(snapshot)

      // Keep only last 10 snapshots per session
      if (snapshots.length > 10) {
        snapshots.splice(0, snapshots.length - 10)
      }

      this.sessionSnapshots.set(sessionId, snapshots)
    } catch (error) {
      console.error('Failed to create session snapshot:', error)
    }
  }

  public async recoverSession(sessionId: string): Promise<boolean> {
    try {
      const snapshots = this.sessionSnapshots.get(sessionId)
      if (!snapshots || snapshots.length === 0) {
        return false
      }

      // Use the most recent snapshot
      const latestSnapshot = snapshots[snapshots.length - 1]

      // Restore session state
      await this.restoreSessionState(latestSnapshot)

      return true
    } catch (error) {
      console.error('Session recovery failed:', error)
      return false
    }
  }

  private extractFormData(): Record<string, any> {
    if (typeof window === 'undefined') return {}

    const formData: Record<string, any> = {}
    const forms = document.querySelectorAll('form')

    forms.forEach((form, index) => {
      const inputs = form.querySelectorAll('input, textarea, select')
      inputs.forEach(input => {
        const element = input as HTMLInputElement
        if (element.type !== 'password' && element.name) {
          formData[`form_${index}_${element.name}`] = element.value
        }
      })
    })

    return formData
  }

  private extractComponentState(): Record<string, any> {
    // Placeholder for component state extraction
    // In real implementation, this would integrate with React/state management
    return {}
  }

  private extractUserSelections(): Record<string, any> {
    // Placeholder for user selection tracking
    return {}
  }

  private async restoreSessionState(snapshot: SessionSnapshot): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Restore URL if different
      if (window.location.href !== snapshot.url) {
        window.history.pushState({}, '', snapshot.url)
      }

      // Restore scroll position
      window.scrollTo(0, snapshot.scroll_position)

      // Restore form data
      Object.entries(snapshot.form_data).forEach(([key, value]) => {
        const element = document.querySelector(`[name="${key.split('_').pop()}"]`) as HTMLInputElement
        if (element && element.type !== 'password') {
          element.value = String(value)
        }
      })

      // Emit session restore event
      window.dispatchEvent(new CustomEvent('sessionRestored', {
        detail: { snapshot, timestamp: Date.now() }
      }))
    } catch (error) {
      console.error('Failed to restore session state:', error)
      throw error
    }
  }

  /**
   * Utility methods
   */
  private simulateRetry(error: ErrorOccurrence): Promise<boolean> {
    // Simulate retry logic - in real implementation, this would re-execute the failed operation
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate success/failure based on error type
        const successProbability = error.category === 'network' ? 0.7 : 0.3
        resolve(Math.random() < successProbability)
      }, 100)
    })
  }

  private shouldEscalate(error: ErrorOccurrence): boolean {
    const errorHistory = this.recoveryHistory.get(error.message) || []
    return errorHistory.length >= this.escalationThreshold
  }

  private async escalateError(error: ErrorOccurrence, startTime: number): Promise<RecoveryExecutionResult> {
    console.error('Escalating error - too many recovery attempts:', error)

    // In real implementation, this would send to monitoring/alerting system
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('errorEscalated', {
        detail: { error, timestamp: Date.now() }
      }))
    }

    return {
      success: false,
      action_taken: ['escalate'],
      recovery_time: performance.now() - startTime,
      user_message: 'We\'re experiencing technical difficulties. Our team has been notified.',
      requires_user_action: true,
      escalation_needed: true,
      session_recovered: false
    }
  }

  private createFailureResult(
    startTime: number,
    actions: RecoveryAction[],
    escalationNeeded: boolean = false
  ): RecoveryExecutionResult {
    return {
      success: false,
      action_taken: actions,
      recovery_time: performance.now() - startTime,
      requires_user_action: escalationNeeded,
      escalation_needed: escalationNeeded,
      session_recovered: false
    }
  }

  private recordRecoveryAttempt(
    error: ErrorOccurrence,
    strategy: ErrorRecoveryStrategy,
    result: RecoveryExecutionResult
  ): void {
    const history = this.recoveryHistory.get(error.message) || []

    const updatedError: ErrorOccurrence = {
      ...error,
      recovery_strategy_id: strategy.id,
      recovery_attempted: true,
      recovery_successful: result.success,
      recovery_duration: result.recovery_time
    }

    history.push(updatedError)
    this.recoveryHistory.set(error.message, history)
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    if (message.includes('network') || message.includes('fetch')) return 'network'
    if (message.includes('syntax') || message.includes('reference') || message.includes('type')) return 'javascript'
    if (message.includes('timeout') || message.includes('performance')) return 'performance'
    if (message.includes('unauthorized') || message.includes('401')) return 'authentication'
    if (message.includes('forbidden') || message.includes('403')) return 'authorization'
    if (message.includes('json') || message.includes('parse')) return 'data_integrity'
    if (message.includes('accessibility') || message.includes('aria')) return 'accessibility'
    if (message.includes('browser') || message.includes('compatibility')) return 'compatibility'
    if (message.includes('security') || message.includes('xss')) return 'security'

    return 'user_experience'
  }

  private assessErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase()

    if (message.includes('critical') || message.includes('fatal') || message.includes('security')) {
      return 'critical'
    }
    if (message.includes('error') || message.includes('failed')) {
      return 'high'
    }
    if (message.includes('warning') || message.includes('deprecated')) {
      return 'medium'
    }
    return 'low'
  }

  private isUserFacingError(error: Error): boolean {
    const userFacingPatterns = [
      'network', 'connection', 'timeout', 'unauthorized', 'forbidden',
      'not found', 'server error', 'service unavailable'
    ]

    const message = error.message.toLowerCase()
    return userFacingPatterns.some(pattern => message.includes(pattern))
  }

  private matchesConditions(error: ErrorOccurrence, conditions: Record<string, any>): boolean {
    // Check user context conditions
    if (conditions.user_context && error.user_context) {
      for (const [key, value] of Object.entries(conditions.user_context)) {
        if (error.user_context[key] !== value) return false
      }
    }

    // Check device type conditions
    if (conditions.device_types && conditions.device_types.length > 0) {
      const userAgent = error.user_agent.toLowerCase()
      const deviceType = this.getDeviceType(userAgent)
      if (!conditions.device_types.includes(deviceType)) return false
    }

    return true
  }

  private getDeviceType(userAgent: string): string {
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile'
    if (/tablet|ipad/i.test(userAgent)) return 'tablet'
    return 'desktop'
  }

  private extractFileName(stack?: string): string | undefined {
    if (!stack) return undefined
    const match = stack.match(/https?:\/\/[^\/]+\/([^:]+):/);
    return match ? match[1] : undefined;
  }

  private extractLineNumber(stack?: string): number | undefined {
    if (!stack) return undefined
    const match = stack.match(/:(\d+):/);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractColumnNumber(stack?: string): number | undefined {
    if (!stack) return undefined
    const match = stack.match(/:(\d+):(\d+)/);
    return match ? parseInt(match[2]) : undefined;
  }

  private updateMetrics(error: ErrorOccurrence): void {
    this.metrics.total_errors++
    this.metrics.category_breakdown[error.category]++
    this.metrics.severity_breakdown[error.severity]++

    // Update success rate
    this.metrics.recovery_success_rate =
      (this.metrics.recovered_errors / this.metrics.total_errors) * 100

    // Update user impact
    this.metrics.user_experience_impact_score +=
      ERROR_SEVERITY_WEIGHTS[error.severity] * (error.is_user_facing ? 2 : 1)
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        session_id: 'global',
        page_path: window.location.pathname
      })
    })

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        session_id: 'global',
        page_path: window.location.pathname,
        stack_trace: event.error?.stack
      })
    })
  }

  /**
   * Public API methods
   */
  public getMetrics(): ErrorRecoveryMetrics {
    return { ...this.metrics }
  }

  public getRecoveryHistory(errorPattern?: string): ErrorOccurrence[] {
    if (errorPattern) {
      return this.recoveryHistory.get(errorPattern) || []
    }

    const allHistory: ErrorOccurrence[] = []
    this.recoveryHistory.forEach(history => allHistory.push(...history))
    return allHistory
  }

  public clearRecoveryHistory(): void {
    this.recoveryHistory.clear()
  }

  public updateStrategy(strategyId: string, updates: Partial<ErrorRecoveryStrategy>): void {
    const strategy = this.strategies.get(strategyId)
    if (strategy) {
      const updatedStrategy = { ...strategy, ...updates, updated_at: new Date().toISOString() }
      this.strategies.set(strategyId, updatedStrategy)

      // Update matcher
      const matcherIndex = this.matchers.findIndex(m => m.strategy.id === strategyId)
      if (matcherIndex >= 0) {
        this.matchers[matcherIndex].strategy = updatedStrategy
      }
    }
  }

  public removeStrategy(strategyId: string): void {
    this.strategies.delete(strategyId)
    this.matchers = this.matchers.filter(m => m.strategy.id !== strategyId)
  }

  public setEscalationThreshold(threshold: number): void {
    this.escalationThreshold = threshold
  }

  public destroy(): void {
    this.strategies.clear()
    this.matchers = []
    this.recoveryHistory.clear()
    this.sessionSnapshots.clear()
  }
}

/**
 * Factory function to create error recovery service
 */
export function createErrorRecoveryService(tenant_id: string): ErrorRecoveryService {
  return new ErrorRecoveryService(tenant_id)
}

/**
 * Global error recovery service instance
 */
let globalErrorRecoveryService: ErrorRecoveryService | null = null

export function getGlobalErrorRecoveryService(tenant_id: string): ErrorRecoveryService {
  if (!globalErrorRecoveryService) {
    globalErrorRecoveryService = createErrorRecoveryService(tenant_id)
  }
  return globalErrorRecoveryService
}