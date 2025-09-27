/**
 * Performance Monitor Service
 * MELLOWISE-032: Real-time performance monitoring with Core Web Vitals
 */

import type {
  WebVitalsMetrics,
  PerformanceBudget,
  PerformanceThresholds,
  PerformanceMonitor,
  BudgetStatus,
  PerformanceReport,
  PerformanceTrend,
  PerformanceRecommendation,
  TechnicalMetrics,
  DateRange,
  DEFAULT_PERFORMANCE_CONFIG
} from '@/types/performance';

export class PerformanceMonitorService implements PerformanceMonitor {
  private metrics: WebVitalsMetrics[] = [];
  private isMonitoring = false;
  private observer: PerformanceObserver | null = null;
  private config: typeof DEFAULT_PERFORMANCE_CONFIG;

  constructor(config?: Partial<typeof DEFAULT_PERFORMANCE_CONFIG>) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.initializeWebVitalsCollection();
    this.startPerformanceObservation();
    this.scheduleReporting();

    console.log('🚀 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.observer?.disconnect();

    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: Partial<WebVitalsMetrics>): void {
    const fullMetric: WebVitalsMetrics = {
      LCP: 0,
      FID: 0,
      CLS: 0,
      TTFB: 0,
      FCP: 0,
      TTI: 0,
      TBT: 0,
      pageLoadTime: 0,
      domContentLoaded: 0,
      resourceLoadTime: 0,
      cacheHitRate: 0,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      ...metric
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Get metrics for a time range
   */
  getMetrics(timeframe?: DateRange): WebVitalsMetrics[] {
    if (!timeframe) return this.metrics;

    return this.metrics.filter(metric =>
      metric.timestamp >= timeframe.start &&
      metric.timestamp <= timeframe.end
    );
  }

  /**
   * Check budget compliance status
   */
  getBudgetStatus(): BudgetStatus {
    const latest = this.getLatestMetrics();
    if (!latest) {
      return {
        overall: 'poor',
        metrics: {},
        recommendations: ['No performance data available']
      };
    }

    const thresholds = this.config.budget;
    const status: BudgetStatus = {
      overall: 'good',
      metrics: {},
      recommendations: []
    };

    // Check each metric against thresholds
    const metrics = ['LCP', 'FID', 'CLS', 'TTFB'] as const;
    let goodCount = 0;
    let totalCount = 0;

    metrics.forEach(metric => {
      const value = latest[metric];
      totalCount++;

      if (value <= thresholds.good[metric]) {
        status.metrics[metric] = 'good';
        goodCount++;
      } else if (value <= thresholds.needsImprovement[metric]) {
        status.metrics[metric] = 'needs-improvement';
      } else {
        status.metrics[metric] = 'poor';
      }
    });

    // Determine overall status
    const goodPercentage = goodCount / totalCount;
    if (goodPercentage >= 0.75) {
      status.overall = 'good';
    } else if (goodPercentage >= 0.5) {
      status.overall = 'needs-improvement';
    } else {
      status.overall = 'poor';
    }

    // Generate recommendations
    status.recommendations = this.generateRecommendations(latest, status.metrics);

    return status;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): PerformanceReport {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const period: DateRange = { start: startDate, end: endDate };

    const metrics = this.getMetrics(period);
    const summary = this.calculateSummaryMetrics(metrics);
    const trends = this.calculateTrends(metrics);
    const budgetCompliance = this.getBudgetStatus();
    const recommendations = this.generateDetailedRecommendations(summary, trends);
    const technicalDetails = this.getTechnicalMetrics();

    return {
      period,
      summary,
      trends,
      budgetCompliance,
      recommendations,
      technicalDetails
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize Web Vitals collection using native APIs
   */
  private initializeWebVitalsCollection(): void {
    // Largest Contentful Paint (LCP)
    this.observeEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.recordMetric({ LCP: lastEntry.startTime });
    });

    // First Input Delay (FID) - using event timing
    this.observeEntry('first-input', (entries) => {
      entries.forEach(entry => {
        const fid = entry.processingStart - entry.startTime;
        this.recordMetric({ FID: fid });
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observeEntry('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric({ CLS: clsValue });
    });

    // First Contentful Paint (FCP)
    this.observeEntry('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric({ FCP: entry.startTime });
        }
      });
    });

    // Navigation timing for TTFB and other metrics
    this.collectNavigationMetrics();
  }

  /**
   * Observe performance entries
   */
  private observeEntry(type: string, callback: (entries: any[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Could not observe ${type}:`, error);
    }
  }

  /**
   * Start general performance observation
   */
  private startPerformanceObservation(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      this.processPerformanceEntries(entries);
    });

    try {
      this.observer.observe({
        entryTypes: ['navigation', 'resource', 'measure', 'mark']
      });
    } catch (error) {
      console.warn('Could not start performance observation:', error);
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      if (entry.entryType === 'navigation') {
        this.processNavigationEntry(entry as PerformanceNavigationTiming);
      } else if (entry.entryType === 'resource') {
        this.processResourceEntry(entry as PerformanceResourceTiming);
      }
    });
  }

  /**
   * Process navigation timing entries
   */
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const ttfb = entry.responseStart - entry.requestStart;
    const domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
    const pageLoadTime = entry.loadEventEnd - entry.loadEventStart;

    this.recordMetric({
      TTFB: ttfb,
      domContentLoaded: domContentLoaded,
      pageLoadTime: pageLoadTime,
    });
  }

  /**
   * Process resource timing entries
   */
  private processResourceEntry(entry: PerformanceResourceTiming): void {
    const resourceLoadTime = entry.responseEnd - entry.startTime;

    // Update average resource load time
    const current = this.getLatestMetrics();
    if (current) {
      const avgResourceTime = (current.resourceLoadTime + resourceLoadTime) / 2;
      this.recordMetric({ resourceLoadTime: avgResourceTime });
    }
  }

  /**
   * Collect navigation metrics
   */
  private collectNavigationMetrics(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        this.processNavigationEntry(navigationEntries[0]);
      }
    }
  }

  /**
   * Get connection type
   */
  private getConnectionType(): WebVitalsMetrics['connectionType'] {
    // @ts-ignore - NetworkInformation is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) return 'unknown';

    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g') return 'slow-2g';
    if (effectiveType === '2g') return '2g';
    if (effectiveType === '3g') return '3g';
    if (effectiveType === '4g') return '4g';

    return 'unknown';
  }

  /**
   * Schedule periodic reporting
   */
  private scheduleReporting(): void {
    setInterval(() => {
      if (this.isMonitoring) {
        this.sendMetricsToAnalytics();
      }
    }, this.config.monitoring.reportInterval);
  }

  /**
   * Send metrics to analytics service
   */
  private sendMetricsToAnalytics(): void {
    // Only send a sample of metrics to avoid overwhelming the backend
    if (Math.random() > this.config.monitoring.sampleRate) return;

    const latest = this.getLatestMetrics();
    if (!latest) return;

    // In a real implementation, this would send to your analytics service
    console.log('📊 Performance metrics:', latest);
  }

  /**
   * Get latest metrics
   */
  private getLatestMetrics(): WebVitalsMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Calculate summary metrics from array of metrics
   */
  private calculateSummaryMetrics(metrics: WebVitalsMetrics[]): WebVitalsMetrics {
    if (metrics.length === 0) {
      return this.getEmptyMetrics();
    }

    const summary = metrics.reduce((acc, metric) => {
      acc.LCP += metric.LCP;
      acc.FID += metric.FID;
      acc.CLS += metric.CLS;
      acc.TTFB += metric.TTFB;
      acc.FCP += metric.FCP;
      acc.TTI += metric.TTI;
      acc.TBT += metric.TBT;
      acc.pageLoadTime += metric.pageLoadTime;
      acc.domContentLoaded += metric.domContentLoaded;
      acc.resourceLoadTime += metric.resourceLoadTime;
      acc.cacheHitRate += metric.cacheHitRate;
      return acc;
    }, this.getEmptyMetrics());

    const count = metrics.length;
    Object.keys(summary).forEach(key => {
      if (typeof summary[key as keyof WebVitalsMetrics] === 'number') {
        (summary as any)[key] = summary[key as keyof WebVitalsMetrics] as number / count;
      }
    });

    summary.timestamp = new Date();
    summary.url = window.location.href;
    summary.userAgent = navigator.userAgent;
    summary.connectionType = this.getConnectionType();

    return summary;
  }

  /**
   * Get empty metrics object
   */
  private getEmptyMetrics(): WebVitalsMetrics {
    return {
      LCP: 0,
      FID: 0,
      CLS: 0,
      TTFB: 0,
      FCP: 0,
      TTI: 0,
      TBT: 0,
      pageLoadTime: 0,
      domContentLoaded: 0,
      resourceLoadTime: 0,
      cacheHitRate: 0,
      timestamp: new Date(),
      url: '',
      userAgent: '',
      connectionType: 'unknown'
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(metrics: WebVitalsMetrics[]): PerformanceTrend[] {
    if (metrics.length < 2) return [];

    const trends: PerformanceTrend[] = [];
    const metricKeys = ['LCP', 'FID', 'CLS', 'TTFB'] as const;

    metricKeys.forEach(metric => {
      const values = metrics.map(m => m[metric]);
      const trend = this.calculateTrendDirection(values);

      trends.push({
        metric,
        direction: trend.direction,
        change: trend.change,
        significance: trend.significance
      });
    });

    return trends;
  }

  /**
   * Calculate trend direction for a series of values
   */
  private calculateTrendDirection(values: number[]): {
    direction: 'improving' | 'declining' | 'stable';
    change: number;
    significance: 'high' | 'medium' | 'low';
  } {
    if (values.length < 2) {
      return { direction: 'stable', change: 0, significance: 'low' };
    }

    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;

    let direction: 'improving' | 'declining' | 'stable';
    if (Math.abs(change) < 5) {
      direction = 'stable';
    } else {
      // For performance metrics, lower values are better
      direction = change < 0 ? 'improving' : 'declining';
    }

    let significance: 'high' | 'medium' | 'low';
    if (Math.abs(change) > 20) {
      significance = 'high';
    } else if (Math.abs(change) > 10) {
      significance = 'medium';
    } else {
      significance = 'low';
    }

    return { direction, change, significance };
  }

  /**
   * Generate basic recommendations
   */
  private generateRecommendations(
    metrics: WebVitalsMetrics,
    status: { [K in keyof WebVitalsMetrics]?: 'good' | 'needs-improvement' | 'poor' }
  ): string[] {
    const recommendations: string[] = [];

    if (status.LCP === 'poor') {
      recommendations.push('Optimize Largest Contentful Paint by compressing images and reducing server response time');
    }

    if (status.FID === 'poor') {
      recommendations.push('Improve First Input Delay by reducing JavaScript execution time and breaking up long tasks');
    }

    if (status.CLS === 'poor') {
      recommendations.push('Reduce Cumulative Layout Shift by setting dimensions on images and avoiding dynamic content insertion');
    }

    if (status.TTFB === 'poor') {
      recommendations.push('Improve Time to First Byte by optimizing server response time and using CDN');
    }

    return recommendations;
  }

  /**
   * Generate detailed recommendations
   */
  private generateDetailedRecommendations(
    summary: WebVitalsMetrics,
    trends: PerformanceTrend[]
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // LCP recommendations
    if (summary.LCP > 2500) {
      recommendations.push({
        type: summary.LCP > 4000 ? 'critical' : 'important',
        category: 'loading',
        issue: `Largest Contentful Paint is ${Math.round(summary.LCP)}ms (target: <2500ms)`,
        solution: 'Optimize images, reduce server response time, implement lazy loading',
        impact: 'high',
        effort: 'medium'
      });
    }

    // FID recommendations
    if (summary.FID > 100) {
      recommendations.push({
        type: summary.FID > 300 ? 'critical' : 'important',
        category: 'interactivity',
        issue: `First Input Delay is ${Math.round(summary.FID)}ms (target: <100ms)`,
        solution: 'Reduce JavaScript execution time, break up long tasks, use web workers',
        impact: 'high',
        effort: 'high'
      });
    }

    // CLS recommendations
    if (summary.CLS > 0.1) {
      recommendations.push({
        type: summary.CLS > 0.25 ? 'critical' : 'important',
        category: 'visual-stability',
        issue: `Cumulative Layout Shift is ${summary.CLS.toFixed(3)} (target: <0.1)`,
        solution: 'Set dimensions on images and videos, avoid dynamic content insertion',
        impact: 'medium',
        effort: 'low'
      });
    }

    // Cache recommendations
    if (summary.cacheHitRate < 0.8) {
      recommendations.push({
        type: 'suggestion',
        category: 'caching',
        issue: `Cache hit rate is ${Math.round(summary.cacheHitRate * 100)}% (target: >80%)`,
        solution: 'Implement proper caching headers and service worker caching',
        impact: 'medium',
        effort: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Get technical metrics
   */
  private getTechnicalMetrics(): TechnicalMetrics {
    const bundleSize = this.estimateBundleSize();
    const errorRate = 0; // Would be calculated from error tracking
    const uptimePercentage = 99.5; // Would come from monitoring service

    return {
      bundleSize,
      chunkCount: this.estimateChunkCount(),
      cacheEfficiency: this.calculateCacheEfficiency(),
      errorRate,
      uptimePercentage,
      avgResponseTime: this.calculateAverageResponseTime()
    };
  }

  /**
   * Estimate bundle size from resource timing
   */
  private estimateBundleSize(): number {
    if (!('performance' in window)) return 0;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;

    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        // Estimate size from transfer time and connection
        totalSize += resource.transferSize || 0;
      }
    });

    return totalSize;
  }

  /**
   * Estimate chunk count
   */
  private estimateChunkCount(): number {
    if (!('performance' in window)) return 0;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.filter(r => r.name.includes('.js')).length;
  }

  /**
   * Calculate cache efficiency
   */
  private calculateCacheEfficiency(): number {
    if (!('performance' in window)) return 0;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let cached = 0;
    let total = 0;

    resources.forEach(resource => {
      total++;
      // If transfer size is 0, it was likely cached
      if (resource.transferSize === 0) {
        cached++;
      }
    });

    return total > 0 ? cached / total : 0;
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    const latest = this.getLatestMetrics();
    return latest ? latest.TTFB : 0;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitorService();