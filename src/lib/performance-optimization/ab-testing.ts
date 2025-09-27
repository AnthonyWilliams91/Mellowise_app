/**
 * MELLOWISE-032: A/B Testing Framework
 *
 * Comprehensive A/B testing system with statistical analysis,
 * user segmentation, and performance tracking
 *
 * @version 1.0.0
 */

import {
  ABTestExperiment,
  ABTestVariant,
  ABTestAssignment,
  ABTestEvent,
  ABTestResults,
  generateABTestKey
} from '../../types/performance-optimization'

/**
 * Statistical analysis result
 */
interface StatisticalAnalysis {
  sample_size: number
  conversion_rate: number
  confidence_interval: [number, number]
  standard_error: number
  z_score: number
  p_value: number
  statistical_power: number
  is_significant: boolean
  minimum_detectable_effect: number
}

/**
 * Experiment assignment context
 */
interface AssignmentContext {
  user_id: string
  session_id: string
  device_type: string
  browser: string
  location?: string
  subscription_tier?: string
  user_segment?: string
  custom_attributes?: Record<string, any>
}

/**
 * Conversion tracking data
 */
interface ConversionData {
  variant_id: string
  user_id: string
  session_id: string
  conversion_value?: number
  conversion_timestamp: string
  custom_properties?: Record<string, any>
}

/**
 * A/B Testing Service Implementation
 */
export class ABTestingService {
  private tenant_id: string
  private experiments: Map<string, ABTestExperiment> = new Map()
  private assignments: Map<string, ABTestAssignment> = new Map()
  private events: ABTestEvent[] = []
  private results: Map<string, ABTestResults> = new Map()

  // Feature flag overrides for development/testing
  private featureFlagOverrides: Map<string, Record<string, boolean>> = new Map()

  constructor(tenant_id: string) {
    this.tenant_id = tenant_id
    this.initializeDefaultExperiments()
  }

  /**
   * Initialize default experiments for performance testing
   */
  private initializeDefaultExperiments(): void {
    // Performance optimization A/B test
    const performanceExperiment: ABTestExperiment = {
      tenant_id: this.tenant_id,
      id: 'perf-opt-001',
      name: 'Performance Optimization Bundle',
      description: 'Test impact of aggressive performance optimizations on user experience',
      hypothesis: 'Aggressive caching and lazy loading will improve page load times by 25%',
      test_key: generateABTestKey('Performance Optimization Bundle', this.tenant_id),
      status: 'active',
      traffic_allocation: 50, // 50% of users
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Standard performance configuration',
          traffic_percentage: 50,
          is_control: true,
          config: {
            aggressiveCaching: false,
            lazyLoadingThreshold: 0.1,
            imageOptimization: 'standard',
            preloadCriticalResources: false
          },
          feature_flags: {
            aggressive_caching: false,
            advanced_lazy_loading: false,
            image_optimization_plus: false
          },
          participants: 0,
          conversions: 0,
          conversion_rate: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'optimized',
          name: 'Optimized',
          description: 'Aggressive performance optimizations enabled',
          traffic_percentage: 50,
          is_control: false,
          config: {
            aggressiveCaching: true,
            lazyLoadingThreshold: 0.3,
            imageOptimization: 'aggressive',
            preloadCriticalResources: true
          },
          feature_flags: {
            aggressive_caching: true,
            advanced_lazy_loading: true,
            image_optimization_plus: true
          },
          participants: 0,
          conversions: 0,
          conversion_rate: 0,
          created_at: new Date().toISOString()
        }
      ],
      target_criteria: {
        device_types: ['desktop', 'mobile'],
        browsers: ['chrome', 'firefox', 'safari'],
        subscription_tiers: ['free', 'premium']
      },
      primary_metric: 'page_load_time',
      secondary_metrics: ['bounce_rate', 'session_duration', 'conversion_rate'],
      success_criteria: [
        {
          metric: 'page_load_time',
          threshold: 0.25,
          direction: 'decrease'
        },
        {
          metric: 'bounce_rate',
          threshold: 0.1,
          direction: 'decrease'
        }
      ],
      start_date: new Date().toISOString(),
      duration_days: 30,
      confidence_level: 0.95,
      minimum_sample_size: 1000,
      power: 0.8,
      mde: 0.05, // 5% minimum detectable effect
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.experiments.set(performanceExperiment.id, performanceExperiment)

    // Error recovery UX test
    const errorRecoveryExperiment: ABTestExperiment = {
      tenant_id: this.tenant_id,
      id: 'error-ux-001',
      name: 'Error Recovery UX Test',
      description: 'Test different error recovery user experiences',
      hypothesis: 'Proactive error recovery messages will reduce user frustration by 30%',
      test_key: generateABTestKey('Error Recovery UX Test', this.tenant_id),
      status: 'active',
      traffic_allocation: 30,
      variants: [
        {
          id: 'control',
          name: 'Standard Error Messages',
          description: 'Standard error handling with generic messages',
          traffic_percentage: 50,
          is_control: true,
          config: {
            proactiveRecovery: false,
            detailedErrorMessages: false,
            autoRetry: false
          },
          feature_flags: {
            proactive_error_recovery: false,
            detailed_error_messages: false,
            smart_auto_retry: false
          },
          participants: 0,
          conversions: 0,
          conversion_rate: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'proactive',
          name: 'Proactive Recovery',
          description: 'Proactive error recovery with helpful messages and auto-retry',
          traffic_percentage: 50,
          is_control: false,
          config: {
            proactiveRecovery: true,
            detailedErrorMessages: true,
            autoRetry: true
          },
          feature_flags: {
            proactive_error_recovery: true,
            detailed_error_messages: true,
            smart_auto_retry: true
          },
          participants: 0,
          conversions: 0,
          conversion_rate: 0,
          created_at: new Date().toISOString()
        }
      ],
      target_criteria: {
        device_types: ['desktop', 'mobile']
      },
      primary_metric: 'error_recovery_success_rate',
      secondary_metrics: ['user_satisfaction', 'task_completion_rate'],
      success_criteria: [
        {
          metric: 'error_recovery_success_rate',
          threshold: 0.3,
          direction: 'increase'
        }
      ],
      start_date: new Date().toISOString(),
      duration_days: 21,
      confidence_level: 0.95,
      minimum_sample_size: 500,
      power: 0.8,
      mde: 0.1,
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.experiments.set(errorRecoveryExperiment.id, errorRecoveryExperiment)
  }

  /**
   * Create new A/B test experiment
   */
  public createExperiment(experiment: Omit<ABTestExperiment, 'tenant_id' | 'id'>): ABTestExperiment {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const fullExperiment: ABTestExperiment = {
      ...experiment,
      tenant_id: this.tenant_id,
      id,
      test_key: experiment.test_key || generateABTestKey(experiment.name, this.tenant_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.experiments.set(id, fullExperiment)
    return fullExperiment
  }

  /**
   * Get user assignment for experiment
   */
  public async getAssignment(
    experiment_key: string,
    context: AssignmentContext
  ): Promise<ABTestAssignment | null> {
    try {
      const experiment = this.findExperimentByKey(experiment_key)
      if (!experiment || experiment.status !== 'active') {
        return null
      }

      // Check if user meets targeting criteria
      if (!this.matchesTargetCriteria(context, experiment.target_criteria)) {
        return null
      }

      // Check for existing assignment
      const assignmentKey = `${experiment.id}:${context.user_id}`
      let assignment = this.assignments.get(assignmentKey)

      if (assignment) {
        // Update exposure tracking
        assignment.exposures++
        assignment.last_exposure_at = new Date().toISOString()
        return assignment
      }

      // Create new assignment
      assignment = await this.createNewAssignment(experiment, context)
      if (assignment) {
        this.assignments.set(assignmentKey, assignment)
      }

      return assignment
    } catch (error) {
      console.error('Failed to get A/B test assignment:', error)
      return null
    }
  }

  /**
   * Create new user assignment
   */
  private async createNewAssignment(
    experiment: ABTestExperiment,
    context: AssignmentContext
  ): Promise<ABTestAssignment | null> {
    try {
      // Check traffic allocation
      const userHash = this.hashUserId(context.user_id, experiment.test_key)
      if (userHash > experiment.traffic_allocation / 100) {
        return null // User not in experiment traffic
      }

      // Assign to variant
      const variant = this.assignToVariant(experiment, userHash)
      if (!variant) {
        return null
      }

      const assignment: ABTestAssignment = {
        tenant_id: this.tenant_id,
        id: `assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: context.user_id,
        experiment_id: experiment.id,
        variant_id: variant.id,
        assigned_at: new Date().toISOString(),
        first_exposure_at: new Date().toISOString(),
        last_exposure_at: new Date().toISOString(),
        exposures: 1,
        conversions: 0,
        user_segment: context.user_segment,
        device_type: context.device_type,
        browser: context.browser,
        location: context.location
      }

      // Update variant participant count
      variant.participants++

      // Track assignment event
      await this.trackEvent({
        experiment_id: experiment.id,
        variant_id: variant.id,
        user_id: context.user_id,
        session_id: context.session_id,
        event_type: 'exposure',
        event_name: 'variant_assigned'
      })

      return assignment
    } catch (error) {
      console.error('Failed to create A/B test assignment:', error)
      return null
    }
  }

  /**
   * Track A/B test event
   */
  public async trackEvent(eventData: {
    experiment_id: string
    variant_id: string
    user_id: string
    session_id: string
    event_type: 'exposure' | 'conversion' | 'custom'
    event_name: string
    properties?: Record<string, any>
    value?: number
  }): Promise<void> {
    try {
      const event: ABTestEvent = {
        tenant_id: this.tenant_id,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: eventData.user_id,
        session_id: eventData.session_id,
        experiment_id: eventData.experiment_id,
        variant_id: eventData.variant_id,
        event_type: eventData.event_type,
        event_name: eventData.event_name,
        properties: eventData.properties || {},
        value: eventData.value,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      this.events.push(event)

      // Update assignment if conversion
      if (eventData.event_type === 'conversion') {
        const assignmentKey = `${eventData.experiment_id}:${eventData.user_id}`
        const assignment = this.assignments.get(assignmentKey)
        if (assignment) {
          assignment.conversions++
        }

        // Update variant conversion count
        const experiment = this.experiments.get(eventData.experiment_id)
        if (experiment) {
          const variant = experiment.variants.find(v => v.id === eventData.variant_id)
          if (variant) {
            variant.conversions++
            variant.conversion_rate = variant.participants > 0 ? variant.conversions / variant.participants : 0
          }
        }
      }

      // Emit event for external tracking
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('abTestEvent', {
          detail: event
        }))
      }
    } catch (error) {
      console.error('Failed to track A/B test event:', error)
    }
  }

  /**
   * Track conversion
   */
  public async trackConversion(
    experiment_key: string,
    user_id: string,
    session_id: string,
    conversionData?: ConversionData
  ): Promise<void> {
    const experiment = this.findExperimentByKey(experiment_key)
    if (!experiment) {
      console.warn(`Experiment not found: ${experiment_key}`)
      return
    }

    const assignmentKey = `${experiment.id}:${user_id}`
    const assignment = this.assignments.get(assignmentKey)
    if (!assignment) {
      console.warn(`No assignment found for user ${user_id} in experiment ${experiment_key}`)
      return
    }

    await this.trackEvent({
      experiment_id: experiment.id,
      variant_id: assignment.variant_id,
      user_id,
      session_id,
      event_type: 'conversion',
      event_name: 'goal_conversion',
      properties: conversionData?.custom_properties,
      value: conversionData?.conversion_value
    })
  }

  /**
   * Get experiment results with statistical analysis
   */
  public async getResults(experiment_id: string): Promise<ABTestResults | null> {
    try {
      const experiment = this.experiments.get(experiment_id)
      if (!experiment) {
        return null
      }

      // Calculate results for each variant
      const variant_results = await Promise.all(
        experiment.variants.map(async (variant) => {
          const analysis = await this.calculateStatisticalAnalysis(variant, experiment.variants[0])

          return {
            variant_id: variant.id,
            variant_name: variant.name,
            participants: variant.participants,
            conversions: variant.conversions,
            conversion_rate: variant.conversion_rate,
            confidence_interval: analysis.confidence_interval,
            statistical_significance: analysis.z_score,
            p_value: analysis.p_value
          }
        })
      )

      // Determine winning variant
      const winning_variant = this.determineWinner(variant_results)
      const is_statistically_significant = variant_results.some(
        result => result.p_value < (1 - experiment.confidence_level)
      )

      // Calculate overall metrics
      const total_participants = experiment.variants.reduce((sum, v) => sum + v.participants, 0)
      const total_conversions = experiment.variants.reduce((sum, v) => sum + v.conversions, 0)
      const overall_conversion_rate = total_participants > 0 ? total_conversions / total_participants : 0

      // Calculate detailed metrics
      const metrics = await this.calculateDetailedMetrics(experiment_id)

      const results: ABTestResults = {
        tenant_id: this.tenant_id,
        id: `results-${Date.now()}`,
        experiment_id,
        total_participants,
        total_conversions,
        overall_conversion_rate,
        variant_results,
        winning_variant,
        confidence_level: experiment.confidence_level,
        is_statistically_significant,
        metrics,
        analysis_start: experiment.start_date,
        analysis_end: new Date().toISOString(),
        generated_at: new Date().toISOString()
      }

      this.results.set(experiment_id, results)
      return results
    } catch (error) {
      console.error('Failed to calculate A/B test results:', error)
      return null
    }
  }

  /**
   * Statistical analysis calculations
   */
  private async calculateStatisticalAnalysis(
    variant: ABTestVariant,
    control: ABTestVariant
  ): Promise<StatisticalAnalysis> {
    const n1 = variant.participants
    const n2 = control.participants
    const x1 = variant.conversions
    const x2 = control.conversions

    if (n1 === 0 || n2 === 0) {
      return this.createEmptyAnalysis()
    }

    const p1 = x1 / n1
    const p2 = x2 / n2
    const p_pooled = (x1 + x2) / (n1 + n2)

    // Standard error calculation
    const se = Math.sqrt(p_pooled * (1 - p_pooled) * (1/n1 + 1/n2))

    // Z-score calculation
    const z_score = se !== 0 ? (p1 - p2) / se : 0

    // P-value calculation (two-tailed test)
    const p_value = 2 * (1 - this.normalCDF(Math.abs(z_score)))

    // Confidence interval for difference in proportions
    const margin_of_error = 1.96 * se // 95% confidence
    const difference = p1 - p2
    const confidence_interval: [number, number] = [
      difference - margin_of_error,
      difference + margin_of_error
    ]

    // Minimum detectable effect
    const alpha = 0.05
    const beta = 0.2 // 80% power
    const mde = this.calculateMDE(n1, n2, alpha, beta, p2)

    return {
      sample_size: n1,
      conversion_rate: p1,
      confidence_interval,
      standard_error: se,
      z_score,
      p_value,
      statistical_power: 1 - beta,
      is_significant: p_value < alpha,
      minimum_detectable_effect: mde
    }
  }

  /**
   * Determine winning variant
   */
  private determineWinner(variant_results: any[]): string | undefined {
    if (variant_results.length < 2) return undefined

    // Find non-control variant with highest conversion rate and statistical significance
    const nonControlVariants = variant_results.filter((_, index) => index > 0)

    const significantVariants = nonControlVariants.filter(
      result => result.p_value < 0.05 && result.conversion_rate > variant_results[0].conversion_rate
    )

    if (significantVariants.length === 0) return undefined

    // Return variant with highest conversion rate among significant variants
    const winner = significantVariants.reduce((max, current) =>
      current.conversion_rate > max.conversion_rate ? current : max
    )

    return winner.variant_id
  }

  /**
   * Calculate detailed metrics for experiment
   */
  private async calculateDetailedMetrics(experiment_id: string): Promise<Record<string, any>> {
    const experiment = this.experiments.get(experiment_id)
    if (!experiment) return {}

    const metrics: Record<string, any> = {}

    // Calculate metrics for each success criteria
    for (const criteria of experiment.success_criteria) {
      const control_value = await this.getMetricValue(experiment_id, 'control', criteria.metric)
      const variant_values: Record<string, number> = {}

      for (const variant of experiment.variants) {
        if (!variant.is_control) {
          variant_values[variant.id] = await this.getMetricValue(experiment_id, variant.id, criteria.metric)
        }
      }

      // Calculate relative and absolute changes
      const relative_change: Record<string, number> = {}
      const absolute_change: Record<string, number> = {}

      Object.entries(variant_values).forEach(([variant_id, value]) => {
        if (control_value !== 0) {
          relative_change[variant_id] = (value - control_value) / control_value
        }
        absolute_change[variant_id] = value - control_value
      })

      metrics[criteria.metric] = {
        control_value,
        variant_values,
        relative_change,
        absolute_change
      }
    }

    return metrics
  }

  /**
   * Get metric value for specific variant
   */
  private async getMetricValue(
    experiment_id: string,
    variant_id: string,
    metric: string
  ): Promise<number> {
    // Filter events for this experiment and variant
    const variantEvents = this.events.filter(
      event => event.experiment_id === experiment_id && event.variant_id === variant_id
    )

    switch (metric) {
      case 'page_load_time':
        const loadTimes = variantEvents
          .filter(event => event.properties?.page_load_time)
          .map(event => event.properties.page_load_time)
        return loadTimes.length > 0 ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length : 0

      case 'bounce_rate':
        const sessions = new Set(variantEvents.map(event => event.session_id)).size
        const bounces = variantEvents.filter(event => event.event_name === 'bounce').length
        return sessions > 0 ? bounces / sessions : 0

      case 'session_duration':
        const durations = variantEvents
          .filter(event => event.properties?.session_duration)
          .map(event => event.properties.session_duration)
        return durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0

      case 'conversion_rate':
        const assignments = Array.from(this.assignments.values()).filter(
          a => a.experiment_id === experiment_id && a.variant_id === variant_id
        )
        const totalAssignments = assignments.length
        const conversions = assignments.reduce((sum, a) => sum + a.conversions, 0)
        return totalAssignments > 0 ? conversions / totalAssignments : 0

      case 'error_recovery_success_rate':
        const recoveryAttempts = variantEvents.filter(event => event.event_name === 'error_recovery_attempt').length
        const recoverySuccesses = variantEvents.filter(event => event.event_name === 'error_recovery_success').length
        return recoveryAttempts > 0 ? recoverySuccesses / recoveryAttempts : 0

      default:
        return 0
    }
  }

  /**
   * Utility methods
   */
  private findExperimentByKey(key: string): ABTestExperiment | null {
    for (const experiment of this.experiments.values()) {
      if (experiment.test_key === key || experiment.name.toLowerCase() === key.toLowerCase()) {
        return experiment
      }
    }
    return null
  }

  private hashUserId(user_id: string, experiment_key: string): number {
    // Simple hash function - in production, use a more robust hashing algorithm
    const str = `${user_id}:${experiment_key}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash % 100) / 100 // Return 0-1
  }

  private assignToVariant(experiment: ABTestExperiment, userHash: number): ABTestVariant | null {
    let cumulativePercentage = 0

    for (const variant of experiment.variants) {
      cumulativePercentage += variant.traffic_percentage
      if (userHash * 100 <= cumulativePercentage) {
        return variant
      }
    }

    return experiment.variants[0] // Fallback to first variant
  }

  private matchesTargetCriteria(
    context: AssignmentContext,
    criteria: ABTestExperiment['target_criteria']
  ): boolean {
    // Check device types
    if (criteria.device_types && !criteria.device_types.includes(context.device_type)) {
      return false
    }

    // Check browsers
    if (criteria.browsers && !criteria.browsers.includes(context.browser)) {
      return false
    }

    // Check locations
    if (criteria.locations && context.location && !criteria.locations.includes(context.location)) {
      return false
    }

    // Check subscription tiers
    if (criteria.subscription_tiers && context.subscription_tier &&
        !criteria.subscription_tiers.includes(context.subscription_tier)) {
      return false
    }

    // Check user segments
    if (criteria.user_segments && context.user_segment &&
        !criteria.user_segments.includes(context.user_segment)) {
      return false
    }

    return true
  }

  private normalCDF(z: number): number {
    // Approximation of the standard normal cumulative distribution function
    const a1 =  0.254829592
    const a2 = -0.284496736
    const a3 =  1.421413741
    const a4 = -1.453152027
    const a5 =  1.061405429
    const p  =  0.3275911

    const sign = z < 0 ? -1 : 1
    z = Math.abs(z)

    const t = 1.0 / (1.0 + p * z)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)

    return 0.5 * (1.0 + sign * y)
  }

  private calculateMDE(n1: number, n2: number, alpha: number, beta: number, baseline: number): number {
    // Simplified MDE calculation
    const z_alpha = 1.96 // 95% confidence
    const z_beta = 0.84 // 80% power

    const pooled_variance = baseline * (1 - baseline) * (1/n1 + 1/n2)
    const mde = (z_alpha + z_beta) * Math.sqrt(pooled_variance)

    return mde
  }

  private createEmptyAnalysis(): StatisticalAnalysis {
    return {
      sample_size: 0,
      conversion_rate: 0,
      confidence_interval: [0, 0],
      standard_error: 0,
      z_score: 0,
      p_value: 1,
      statistical_power: 0,
      is_significant: false,
      minimum_detectable_effect: 0
    }
  }

  /**
   * Feature flag integration
   */
  public getFeatureFlags(user_id: string, experiment_key?: string): Record<string, boolean> {
    const flags: Record<string, boolean> = {}

    // Check for overrides first (for development/testing)
    if (this.featureFlagOverrides.has(user_id)) {
      Object.assign(flags, this.featureFlagOverrides.get(user_id))
    }

    // Get flags from active assignments
    if (experiment_key) {
      const experiment = this.findExperimentByKey(experiment_key)
      if (experiment) {
        const assignmentKey = `${experiment.id}:${user_id}`
        const assignment = this.assignments.get(assignmentKey)
        if (assignment) {
          const variant = experiment.variants.find(v => v.id === assignment.variant_id)
          if (variant) {
            Object.assign(flags, variant.feature_flags)
          }
        }
      }
    } else {
      // Get flags from all active assignments for this user
      for (const assignment of this.assignments.values()) {
        if (assignment.user_id === user_id) {
          const experiment = this.experiments.get(assignment.experiment_id)
          if (experiment && experiment.status === 'active') {
            const variant = experiment.variants.find(v => v.id === assignment.variant_id)
            if (variant) {
              Object.assign(flags, variant.feature_flags)
            }
          }
        }
      }
    }

    return flags
  }

  public setFeatureFlagOverride(user_id: string, flags: Record<string, boolean>): void {
    this.featureFlagOverrides.set(user_id, flags)
  }

  public clearFeatureFlagOverride(user_id: string): void {
    this.featureFlagOverrides.delete(user_id)
  }

  /**
   * Public API methods
   */
  public getExperiment(experiment_id: string): ABTestExperiment | null {
    return this.experiments.get(experiment_id) || null
  }

  public listExperiments(status?: ABTestExperiment['status']): ABTestExperiment[] {
    const experiments = Array.from(this.experiments.values())
    return status ? experiments.filter(exp => exp.status === status) : experiments
  }

  public updateExperiment(
    experiment_id: string,
    updates: Partial<ABTestExperiment>
  ): ABTestExperiment | null {
    const experiment = this.experiments.get(experiment_id)
    if (!experiment) return null

    const updatedExperiment = {
      ...experiment,
      ...updates,
      updated_at: new Date().toISOString()
    }

    this.experiments.set(experiment_id, updatedExperiment)
    return updatedExperiment
  }

  public pauseExperiment(experiment_id: string): boolean {
    return this.updateExperiment(experiment_id, { status: 'paused' }) !== null
  }

  public resumeExperiment(experiment_id: string): boolean {
    return this.updateExperiment(experiment_id, { status: 'active' }) !== null
  }

  public completeExperiment(experiment_id: string): boolean {
    return this.updateExperiment(experiment_id, {
      status: 'completed',
      end_date: new Date().toISOString()
    }) !== null
  }

  public getAssignmentHistory(user_id: string): ABTestAssignment[] {
    return Array.from(this.assignments.values()).filter(
      assignment => assignment.user_id === user_id
    )
  }

  public getEventHistory(experiment_id?: string, user_id?: string): ABTestEvent[] {
    let filtered = this.events

    if (experiment_id) {
      filtered = filtered.filter(event => event.experiment_id === experiment_id)
    }

    if (user_id) {
      filtered = filtered.filter(event => event.user_id === user_id)
    }

    return filtered
  }

  public clearEventHistory(): void {
    this.events = []
  }

  public destroy(): void {
    this.experiments.clear()
    this.assignments.clear()
    this.events = []
    this.results.clear()
    this.featureFlagOverrides.clear()
  }
}

/**
 * Factory function to create A/B testing service
 */
export function createABTestingService(tenant_id: string): ABTestingService {
  return new ABTestingService(tenant_id)
}

/**
 * Global A/B testing service instance
 */
let globalABTestingService: ABTestingService | null = null

export function getGlobalABTestingService(tenant_id: string): ABTestingService {
  if (!globalABTestingService) {
    globalABTestingService = createABTestingService(tenant_id)
  }
  return globalABTestingService
}