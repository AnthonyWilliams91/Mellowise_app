/**
 * MELLOWISE-032: Core Web Vitals Monitoring Service
 *
 * Real-time performance monitoring using Core Web Vitals metrics
 * with automatic reporting, threshold alerting, and optimization recommendations
 *
 * @version 1.0.0
 */

import {
  CoreWebVitalsMetrics,
  PerformanceMeasurement,
  PerformanceRecommendation,
  CORE_WEB_VITALS_THRESHOLDS,
  calculatePerformanceScore
} from '../../types/performance-optimization'

/**
 * Core Web Vitals monitoring configuration
 */
interface WebVitalsConfig {
  enableAutoReporting: boolean
  reportingInterval: number // seconds
  enableAlerts: boolean
  alertThresholds: Partial<CoreWebVitalsMetrics>
  enableRecommendations: boolean
  enableRUM: boolean // Real User Monitoring
  samplingRate: number // 0-1
}

/**
 * Performance observer entry types
 */
interface PerformanceObserverConfig {
  lcp: boolean // Largest Contentful Paint
  fid: boolean // First Input Delay
  cls: boolean // Cumulative Layout Shift
  ttfb: boolean // Time to First Byte
  fcp: boolean // First Contentful Paint
  inp: boolean // Interaction to Next Paint
}

/**
 * Core Web Vitals Monitoring Service
 */
export class WebVitalsMonitor {
  private config: WebVitalsConfig
  private observers: Map<string, PerformanceObserver> = new Map()
  private measurements: PerformanceMeasurement[] = []
  private currentMetrics: Partial<CoreWebVitalsMetrics> = {}
  private reportingTimer: NodeJS.Timeout | null = null
  private tenant_id: string
  private user_id?: string
  private session_id: string

  constructor(
    tenant_id: string,
    session_id: string,
    user_id?: string,
    config?: Partial<WebVitalsConfig>
  ) {
    this.tenant_id = tenant_id
    this.user_id = user_id
    this.session_id = session_id

    this.config = {
      enableAutoReporting: true,
      reportingInterval: 30, // 30 seconds
      enableAlerts: true,
      alertThresholds: {
        lcp_rating: 'needs-improvement',
        fid_rating: 'needs-improvement',
        cls_rating: 'needs-improvement',
        ttfb_rating: 'needs-improvement'
      },
      enableRecommendations: true,
      enableRUM: true,
      samplingRate: 1.0,
      ...config
    }
  }

  /**
   * Initialize performance monitoring
   */
  public async initialize(): Promise<void> {
    try {
      // Check if Performance Observer is supported
      if (!this.isPerformanceObserverSupported()) {
        console.warn('Performance Observer not supported, using fallback methods')
        this.initializeFallbackMonitoring()
        return
      }

      // Initialize observers for different metrics
      await Promise.all([
        this.initializeLCPObserver(),
        this.initializeFIDObserver(),
        this.initializeCLSObserver(),
        this.initializeTTFBObserver(),
        this.initializeFCPObserver(),
        this.initializeINPObserver()
      ])

      // Start automatic reporting if enabled
      if (this.config.enableAutoReporting) {
        this.startAutoReporting()
      }

      // Monitor resource loading
      this.initializeResourceObserver()

      // Monitor navigation timing
      this.initializeNavigationObserver()

      console.log('Web Vitals monitoring initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Web Vitals monitoring:', error)
      throw new Error(`Web Vitals initialization failed: ${error}`)
    }
  }

  /**
   * Initialize Largest Contentful Paint observer
   */
  private async initializeLCPObserver(): Promise<void> {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcpEntry = entry as any
        const lcp = Math.round(lcpEntry.startTime)

        this.currentMetrics.lcp = lcp
        this.currentMetrics.lcp_rating = this.rateLCP(lcp)

        this.onMetricUpdate('lcp', lcp)
      }
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', observer)
    } catch (error) {
      console.warn('LCP observer not supported:', error)
    }
  }

  /**
   * Initialize First Input Delay observer
   */
  private async initializeFIDObserver(): Promise<void> {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any
        const fid = Math.round(fidEntry.processingStart - fidEntry.startTime)

        this.currentMetrics.fid = fid
        this.currentMetrics.fid_rating = this.rateFID(fid)

        this.onMetricUpdate('fid', fid)
      }
    })

    try {
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', observer)
    } catch (error) {
      console.warn('FID observer not supported:', error)
    }
  }

  /**
   * Initialize Cumulative Layout Shift observer
   */
  private async initializeCLSObserver(): Promise<void> {
    if (!('PerformanceObserver' in window)) return

    let clsValue = 0
    let clsEntries: any[] = []
    let sessionValue = 0
    let sessionEntries: any[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          if (!sessionValue || entry.startTime - lastSessionEntry.startTime < 1000 ||
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value
            sessionEntries.push(entry)
          } else {
            if (sessionValue > clsValue) {
              clsValue = sessionValue
              clsEntries = [...sessionEntries]
            }
            sessionValue = entry.value
            sessionEntries = [entry]
          }
        }
      }

      const cls = Math.round(Math.max(clsValue, sessionValue) * 1000) / 1000
      this.currentMetrics.cls = cls
      this.currentMetrics.cls_rating = this.rateCLS(cls)

      this.onMetricUpdate('cls', cls)
    })

    try {
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', observer)
    } catch (error) {
      console.warn('CLS observer not supported:', error)
    }
  }

  /**
   * Initialize Time to First Byte observer
   */
  private async initializeTTFBObserver(): Promise<void> {
    if (!performance.getEntriesByType) return

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const ttfb = Math.round(navigationEntry.responseStart - navigationEntry.fetchStart)

      this.currentMetrics.ttfb = ttfb
      this.currentMetrics.ttfb_rating = this.rateTTFB(ttfb)

      this.onMetricUpdate('ttfb', ttfb)
    }
  }

  /**
   * Initialize First Contentful Paint observer
   */
  private async initializeFCPObserver(): Promise<void> {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fcp = Math.round(entry.startTime)

        this.currentMetrics.fcp = fcp
        this.currentMetrics.fcp_rating = this.rateFCP(fcp)

        this.onMetricUpdate('fcp', fcp)
      }
    })

    try {
      observer.observe({ entryTypes: ['paint'] })
      this.observers.set('fcp', observer)
    } catch (error) {
      console.warn('FCP observer not supported:', error)
    }
  }

  /**
   * Initialize Interaction to Next Paint observer
   */
  private async initializeINPObserver(): Promise<void> {
    if (!('PerformanceObserver' in window)) return

    let maxInteractionDelay = 0

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as any
        if (eventEntry.interactionId) {
          const interactionDelay = eventEntry.processingEnd - eventEntry.startTime
          maxInteractionDelay = Math.max(maxInteractionDelay, interactionDelay)
        }
      }

      const inp = Math.round(maxInteractionDelay)
      this.currentMetrics.inp = inp
      this.currentMetrics.inp_rating = this.rateINP(inp)

      this.onMetricUpdate('inp', inp)
    })

    try {
      observer.observe({ entryTypes: ['event'] })
      this.observers.set('inp', observer)
    } catch (error) {
      console.warn('INP observer not supported:', error)
    }
  }

  /**
   * Initialize resource loading observer
   */
  private initializeResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming

        // Track large resources that might affect performance
        if (resourceEntry.transferSize && resourceEntry.transferSize > 100000) { // 100KB
          console.warn(`Large resource detected: ${resourceEntry.name} (${resourceEntry.transferSize} bytes)`)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', observer)
    } catch (error) {
      console.warn('Resource observer not supported:', error)
    }
  }

  /**
   * Initialize navigation timing observer
   */
  private initializeNavigationObserver(): void {
    if (!performance.getEntriesByType) return

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navigationEntries.length > 0) {
      const entry = navigationEntries[0]

      // Calculate additional timing metrics
      const domContentLoaded = entry.domContentLoadedEventEnd - entry.navigationStart
      const windowLoad = entry.loadEventEnd - entry.navigationStart
      const totalBlockingTime = this.calculateTotalBlockingTime()

      // Store additional metrics
      this.currentMetrics = {
        ...this.currentMetrics,
        // These would be added to the interface if needed
      }
    }
  }

  /**
   * Calculate Total Blocking Time (TBT)
   */
  private calculateTotalBlockingTime(): number {
    if (!performance.getEntriesByType) return 0

    const longTaskEntries = performance.getEntriesByType('longtask')
    let totalBlockingTime = 0

    for (const entry of longTaskEntries) {
      if (entry.duration > 50) {
        totalBlockingTime += entry.duration - 50
      }
    }

    return Math.round(totalBlockingTime)
  }

  /**
   * Fallback monitoring for unsupported browsers
   */
  private initializeFallbackMonitoring(): void {
    // Use performance.timing API as fallback
    if (performance.timing) {
      const timing = performance.timing

      // Calculate basic metrics
      const ttfb = timing.responseStart - timing.fetchStart
      const fcp = timing.domContentLoadedEventEnd - timing.navigationStart

      this.currentMetrics.ttfb = ttfb
      this.currentMetrics.ttfb_rating = this.rateTTFB(ttfb)
      this.currentMetrics.fcp = fcp
      this.currentMetrics.fcp_rating = this.rateFCP(fcp)
    }
  }

  /**
   * Rating functions for each metric
   */
  private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CORE_WEB_VITALS_THRESHOLDS.LCP.good) return 'good'
    if (value <= CORE_WEB_VITALS_THRESHOLDS.LCP.poor) return 'needs-improvement'
    return 'poor'
  }

  private rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CORE_WEB_VITALS_THRESHOLDS.FID.good) return 'good'
    if (value <= CORE_WEB_VITALS_THRESHOLDS.FID.poor) return 'needs-improvement'
    return 'poor'
  }

  private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CORE_WEB_VITALS_THRESHOLDS.CLS.good) return 'good'
    if (value <= CORE_WEB_VITALS_THRESHOLDS.CLS.poor) return 'needs-improvement'
    return 'poor'
  }

  private rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CORE_WEB_VITALS_THRESHOLDS.TTFB.good) return 'good'
    if (value <= CORE_WEB_VITALS_THRESHOLDS.TTFB.poor) return 'needs-improvement'
    return 'poor'
  }

  private rateFCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CORE_WEB_VITALS_THRESHOLDS.FCP.good) return 'good'
    if (value <= CORE_WEB_VITALS_THRESHOLDS.FCP.poor) return 'needs-improvement'
    return 'poor'
  }

  private rateINP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= CORE_WEB_VITALS_THRESHOLDS.INP.good) return 'good'
    if (value <= CORE_WEB_VITALS_THRESHOLDS.INP.poor) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Handle metric updates
   */
  private onMetricUpdate(metric: string, value: number): void {
    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlertThresholds(metric, value)
    }

    // Generate recommendations if enabled
    if (this.config.enableRecommendations) {
      this.generateRecommendations()
    }
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(metric: string, value: number): void {
    const thresholds = this.config.alertThresholds
    let shouldAlert = false
    let message = ''

    switch (metric) {
      case 'lcp':
        if (value > CORE_WEB_VITALS_THRESHOLDS.LCP.poor) {
          shouldAlert = true
          message = `LCP threshold exceeded: ${value}ms > ${CORE_WEB_VITALS_THRESHOLDS.LCP.poor}ms`
        }
        break
      case 'fid':
        if (value > CORE_WEB_VITALS_THRESHOLDS.FID.poor) {
          shouldAlert = true
          message = `FID threshold exceeded: ${value}ms > ${CORE_WEB_VITALS_THRESHOLDS.FID.poor}ms`
        }
        break
      case 'cls':
        if (value > CORE_WEB_VITALS_THRESHOLDS.CLS.poor) {
          shouldAlert = true
          message = `CLS threshold exceeded: ${value} > ${CORE_WEB_VITALS_THRESHOLDS.CLS.poor}`
        }
        break
      case 'ttfb':
        if (value > CORE_WEB_VITALS_THRESHOLDS.TTFB.poor) {
          shouldAlert = true
          message = `TTFB threshold exceeded: ${value}ms > ${CORE_WEB_VITALS_THRESHOLDS.TTFB.poor}ms`
        }
        break
    }

    if (shouldAlert) {
      this.triggerAlert(metric, message, value)
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerAlert(metric: string, message: string, value: number): void {
    // In a real implementation, this would send alerts to monitoring systems
    console.warn(`🚨 Performance Alert: ${message}`)

    // Emit custom event for the application to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performanceAlert', {
        detail: { metric, message, value, timestamp: Date.now() }
      }))
    }
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = []
    const metrics = this.currentMetrics

    // LCP recommendations
    if (metrics.lcp && metrics.lcp_rating === 'poor') {
      recommendations.push({
        tenant_id: this.tenant_id,
        id: `lcp-rec-${Date.now()}`,
        recommendation_type: 'image-optimization',
        priority: 'high',
        title: 'Optimize Largest Contentful Paint',
        description: 'Your LCP is above 4 seconds. Consider optimizing images and critical resources.',
        impact_estimate: {
          performance_gain: 30,
          implementation_effort: 'medium',
          estimated_savings: metrics.lcp * 0.3
        },
        implementation_steps: [
          'Optimize and compress above-the-fold images',
          'Preload critical resources',
          'Remove render-blocking resources',
          'Use a CDN for faster content delivery'
        ],
        status: 'pending',
        generated_at: new Date().toISOString()
      })
    }

    // FID recommendations
    if (metrics.fid && metrics.fid_rating === 'poor') {
      recommendations.push({
        tenant_id: this.tenant_id,
        id: `fid-rec-${Date.now()}`,
        recommendation_type: 'code-splitting',
        priority: 'high',
        title: 'Reduce First Input Delay',
        description: 'Your FID is above 300ms. Consider reducing JavaScript execution time.',
        impact_estimate: {
          performance_gain: 40,
          implementation_effort: 'high',
          estimated_savings: metrics.fid * 0.4
        },
        implementation_steps: [
          'Break up long-running JavaScript tasks',
          'Use code splitting and lazy loading',
          'Remove unused JavaScript',
          'Use web workers for heavy computations'
        ],
        status: 'pending',
        generated_at: new Date().toISOString()
      })
    }

    // CLS recommendations
    if (metrics.cls && metrics.cls_rating === 'poor') {
      recommendations.push({
        tenant_id: this.tenant_id,
        id: `cls-rec-${Date.now()}`,
        recommendation_type: 'lazy-loading',
        priority: 'medium',
        title: 'Improve Layout Stability',
        description: 'Your CLS is above 0.25. Consider reserving space for dynamic content.',
        impact_estimate: {
          performance_gain: 25,
          implementation_effort: 'low',
          estimated_savings: metrics.cls * 100
        },
        implementation_steps: [
          'Set dimensions for images and videos',
          'Reserve space for ads and embeds',
          'Avoid inserting content above existing content',
          'Use CSS containment for dynamic content'
        ],
        status: 'pending',
        generated_at: new Date().toISOString()
      })
    }

    return recommendations
  }

  /**
   * Start automatic reporting
   */
  private startAutoReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer)
    }

    this.reportingTimer = setInterval(() => {
      this.reportMetrics()
    }, this.config.reportingInterval * 1000)
  }

  /**
   * Stop automatic reporting
   */
  private stopAutoReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer)
      this.reportingTimer = null
    }
  }

  /**
   * Report current metrics
   */
  private async reportMetrics(): Promise<void> {
    if (!this.currentMetrics || Object.keys(this.currentMetrics).length === 0) {
      return
    }

    try {
      // Create measurement record
      const measurement: PerformanceMeasurement = {
        tenant_id: this.tenant_id,
        id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: this.user_id || 'anonymous',
        session_id: this.session_id,
        page_path: window?.location?.pathname || '/',
        device_type: this.getDeviceType(),
        connection_type: this.getConnectionType(),
        core_web_vitals: this.currentMetrics as CoreWebVitalsMetrics,
        dom_content_loaded: this.getDOMContentLoadedTime(),
        window_load: this.getWindowLoadTime(),
        total_blocking_time: this.calculateTotalBlockingTime(),
        speed_index: this.calculateSpeedIndex(),
        navigation_type: this.getNavigationType(),
        navigation_start: performance.timeOrigin,
        fetch_start: this.getFetchStart(),
        domain_lookup_start: this.getDomainLookupStart(),
        domain_lookup_end: this.getDomainLookupEnd(),
        connect_start: this.getConnectStart(),
        connect_end: this.getConnectEnd(),
        request_start: this.getRequestStart(),
        response_start: this.getResponseStart(),
        response_end: this.getResponseEnd(),
        resource_count: performance.getEntriesByType('resource').length,
        resource_size: this.calculateTotalResourceSize(),
        cache_hit_ratio: this.calculateCacheHitRatio(),
        custom_metrics: {},
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        measured_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      // In a real implementation, this would send data to your analytics backend
      console.log('📊 Performance Metrics:', measurement)

      // Store measurement locally
      this.measurements.push(measurement)

      // Emit event for application handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('performanceMeasurement', {
          detail: measurement
        }))
      }
    } catch (error) {
      console.error('Failed to report performance metrics:', error)
    }
  }

  /**
   * Helper methods for gathering additional metrics
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (!navigator.userAgent) return 'desktop'

    if (/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      if (/iPad|Tablet/i.test(navigator.userAgent)) return 'tablet'
      return 'mobile'
    }
    return 'desktop'
  }

  private getConnectionType(): string {
    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    return connection?.effectiveType || 'unknown'
  }

  private getDOMContentLoadedTime(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry ? navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart : 0
  }

  private getWindowLoadTime(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.navigationStart : 0
  }

  private calculateSpeedIndex(): number {
    // Simplified Speed Index calculation
    // In a real implementation, this would use more sophisticated algorithms
    return Math.round((this.currentMetrics.fcp || 0) * 1.2)
  }

  private getNavigationType(): 'navigate' | 'reload' | 'back_forward' | 'prerender' {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigationEntry) return 'navigate'

    switch (navigationEntry.type) {
      case 'reload': return 'reload'
      case 'back_forward': return 'back_forward'
      case 'prerender': return 'prerender'
      default: return 'navigate'
    }
  }

  private getFetchStart(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.fetchStart || 0
  }

  private getDomainLookupStart(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.domainLookupStart || 0
  }

  private getDomainLookupEnd(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.domainLookupEnd || 0
  }

  private getConnectStart(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.connectStart || 0
  }

  private getConnectEnd(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.connectEnd || 0
  }

  private getRequestStart(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.requestStart || 0
  }

  private getResponseStart(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.responseStart || 0
  }

  private getResponseEnd(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigationEntry?.responseEnd || 0
  }

  private calculateTotalResourceSize(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return resources.reduce((total, resource) => total + (resource.transferSize || 0), 0)
  }

  private calculateCacheHitRatio(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    if (resources.length === 0) return 0

    const cachedResources = resources.filter(resource => resource.transferSize === 0).length
    return Math.round((cachedResources / resources.length) * 100) / 100
  }

  /**
   * Utility methods
   */
  private isPerformanceObserverSupported(): boolean {
    return typeof window !== 'undefined' && 'PerformanceObserver' in window
  }

  /**
   * Public API methods
   */
  public getCurrentMetrics(): Partial<CoreWebVitalsMetrics> {
    return { ...this.currentMetrics }
  }

  public getPerformanceScore(): number {
    if (!this.currentMetrics || Object.keys(this.currentMetrics).length === 0) {
      return 0
    }
    return calculatePerformanceScore(this.currentMetrics as CoreWebVitalsMetrics)
  }

  public getMeasurements(): PerformanceMeasurement[] {
    return [...this.measurements]
  }

  public async forceReport(): Promise<void> {
    await this.reportMetrics()
  }

  public updateConfig(config: Partial<WebVitalsConfig>): void {
    this.config = { ...this.config, ...config }

    // Restart auto-reporting if interval changed
    if (config.reportingInterval && this.config.enableAutoReporting) {
      this.stopAutoReporting()
      this.startAutoReporting()
    }
  }

  public destroy(): void {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()

    // Stop auto-reporting
    this.stopAutoReporting()

    // Clear measurements
    this.measurements = []
    this.currentMetrics = {}

    console.log('Web Vitals monitoring destroyed')
  }
}

/**
 * Factory function to create and initialize Web Vitals monitor
 */
export async function createWebVitalsMonitor(
  tenant_id: string,
  session_id: string,
  user_id?: string,
  config?: Partial<WebVitalsConfig>
): Promise<WebVitalsMonitor> {
  const monitor = new WebVitalsMonitor(tenant_id, session_id, user_id, config)
  await monitor.initialize()
  return monitor
}

/**
 * Global Web Vitals monitoring setup
 */
export function setupGlobalWebVitalsMonitoring(
  tenant_id: string,
  session_id: string,
  user_id?: string
): Promise<WebVitalsMonitor> {
  return createWebVitalsMonitor(tenant_id, session_id, user_id, {
    enableAutoReporting: true,
    reportingInterval: 30,
    enableAlerts: true,
    enableRecommendations: true,
    enableRUM: true,
    samplingRate: 1.0
  })
}