/**
 * Mellowise Performance Monitoring Utility
 * 
 * Tracks Core Web Vitals, API performance, and custom metrics based on
 * performance budgets defined in Sarah's PO validation requirements.
 * 
 * Targets: LCP < 1.2s, FID < 30ms, CLS < 0.03
 */

interface PerformanceBudget {
  lcp: number;  // Largest Contentful Paint target (ms)
  fid: number;  // First Input Delay target (ms)  
  cls: number;  // Cumulative Layout Shift target (score)
  ttfb: number; // Time to First Byte target (ms)
}

interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  page: string;
  userId?: string;
}

interface PerformanceAlert {
  metric: string;
  value: number;
  budget: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  page: string;
}

class PerformanceMonitor {
  private budget: PerformanceBudget;
  private metrics: Map<string, CustomMetric[]>;
  private alerts: PerformanceAlert[];
  private observer: PerformanceObserver | null = null;
  
  constructor() {
    // Performance budgets from Context7 research and PO validation
    this.budget = {
      lcp: 1200,  // 1.2s target
      fid: 30,    // 30ms target
      cls: 0.03,  // 0.03 target
      ttfb: 200   // 200ms target
    };
    
    this.metrics = new Map();
    this.alerts = [];
    
    this.initializeWebVitalsTracking();
    this.initializeNavigationTracking();
  }

  /**
   * Initialize Core Web Vitals tracking using the Web Vitals API
   */
  private initializeWebVitalsTracking(): void {
    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    this.observeWebVital('largest-contentful-paint', (entry) => {
      const lcp = entry.startTime;
      this.recordWebVital('LCP', lcp, this.budget.lcp);
    });

    // Track First Input Delay (FID)
    this.observeWebVital('first-input', (entry) => {
      const fid = entry.processingStart - entry.startTime;
      this.recordWebVital('FID', fid, this.budget.fid);
    });

    // Track Cumulative Layout Shift (CLS)
    this.observeWebVital('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        const cls = entry.value;
        this.recordWebVital('CLS', cls, this.budget.cls);
      }
    });

    // Track Time to First Byte (TTFB)
    this.observeWebVital('navigation', (entry) => {
      const ttfb = entry.responseStart - entry.requestStart;
      this.recordWebVital('TTFB', ttfb, this.budget.ttfb);
    });
  }

  /**
   * Set up performance observer for specific entry types
   */
  private observeWebVital(type: string, callback: (entry: any) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });

      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  /**
   * Record Web Vital metric and check against budget
   */
  private recordWebVital(name: 'LCP' | 'FID' | 'CLS' | 'TTFB', value: number, budget: number): void {
    const rating = this.getRating(name, value);
    const page = window.location.pathname;
    
    // Create metric object
    const metric: CustomMetric = {
      name,
      value,
      unit: name === 'CLS' ? 'score' : 'ms',
      timestamp: Date.now(),
      page,
      userId: this.getUserId()
    };

    // Store metric
    this.addMetric(metric);

    // Check budget and create alerts
    if (value > budget) {
      const severity = value > (budget * 2) ? 'critical' : 'warning';
      this.createAlert(name, value, budget, severity, page);
    }

    // Send to analytics
    this.sendToAnalytics('web_vital', {
      metric_name: name,
      value,
      rating,
      budget,
      page,
      timestamp: metric.timestamp
    });
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metric: 'LCP' | 'FID' | 'CLS' | 'TTFB', value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Initialize navigation performance tracking
   */
  private initializeNavigationTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page navigation performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordNavigationMetrics(navigation);
      }
    });

    // Track route changes for SPA
    this.trackRouteChanges();
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(navigation: PerformanceNavigationTiming): void {
    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connection: navigation.connectEnd - navigation.connectStart,
      ssl_handshake: navigation.connectEnd - navigation.secureConnectionStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      dom_processing: navigation.domContentLoadedEventStart - navigation.responseEnd,
      total_load_time: navigation.loadEventEnd - navigation.navigationStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.addMetric({
          name: `navigation_${name}`,
          value,
          unit: 'ms',
          timestamp: Date.now(),
          page: window.location.pathname,
          userId: this.getUserId()
        });
      }
    });
  }

  /**
   * Track route changes for single page applications
   */
  private trackRouteChanges(): void {
    let currentPath = window.location.pathname;
    const startTime = performance.now();

    const trackRouteChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        const routeChangeTime = performance.now() - startTime;
        
        this.addMetric({
          name: 'route_change_time',
          value: routeChangeTime,
          unit: 'ms',
          timestamp: Date.now(),
          page: newPath,
          userId: this.getUserId()
        });

        currentPath = newPath;
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', trackRouteChange);
    
    // For Next.js router changes
    if (typeof window !== 'undefined' && (window as any).next) {
      (window as any).next.router?.events?.on('routeChangeComplete', trackRouteChange);
    }
  }

  /**
   * Add custom metric to storage
   */
  public addMetric(metric: CustomMetric): void {
    const key = `${metric.page}_${metric.name}`;
    const metrics = this.metrics.get(key) || [];
    metrics.push(metric);
    
    // Keep only last 100 metrics per page/metric combination
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    this.metrics.set(key, metrics);
  }

  /**
   * Create performance alert
   */
  private createAlert(metric: string, value: number, budget: number, severity: 'warning' | 'critical', page: string): void {
    const alert: PerformanceAlert = {
      metric,
      value,
      budget,
      severity,
      timestamp: Date.now(),
      page
    };

    this.alerts.push(alert);

    // Send alert to monitoring system
    this.sendToAnalytics('performance_alert', alert);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = severity === 'critical' ? '🔥' : '⚠️';
      console.warn(`${emoji} Performance Alert: ${metric} (${value}) exceeded budget (${budget}) on ${page}`);
    }
  }

  /**
   * Get user ID for metric attribution
   */
  private getUserId(): string | undefined {
    // Implement based on your auth system
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id') || undefined;
    }
    return undefined;
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(event: string, data: any): void {
    // Implement your analytics integration here
    // Example: Google Analytics, PostHog, custom analytics
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, data);
    }

    // Custom analytics endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, timestamp: Date.now() })
      }).catch(() => {
        // Silently fail analytics calls
      });
    }
  }

  /**
   * Get current performance summary
   */
  public getPerformanceSummary(): {
    budgets: PerformanceBudget;
    recentMetrics: CustomMetric[];
    alerts: PerformanceAlert[];
    budgetStatus: Record<string, 'good' | 'warning' | 'critical'>;
  } {
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => Date.now() - m.timestamp < 300000) // Last 5 minutes
      .sort((a, b) => b.timestamp - a.timestamp);

    // Calculate budget status based on recent metrics
    const budgetStatus: Record<string, 'good' | 'warning' | 'critical'> = {};
    ['LCP', 'FID', 'CLS', 'TTFB'].forEach(metricName => {
      const recent = recentMetrics.find(m => m.name === metricName);
      if (recent) {
        const budgetValue = this.budget[metricName.toLowerCase() as keyof PerformanceBudget];
        if (recent.value <= budgetValue) budgetStatus[metricName] = 'good';
        else if (recent.value <= budgetValue * 2) budgetStatus[metricName] = 'warning';
        else budgetStatus[metricName] = 'critical';
      }
    });

    return {
      budgets: this.budget,
      recentMetrics,
      alerts: this.alerts.filter(a => Date.now() - a.timestamp < 3600000), // Last hour
      budgetStatus
    };
  }

  /**
   * Manually track custom performance metric
   */
  public trackCustomMetric(name: string, value: number, unit: string = 'ms'): void {
    this.addMetric({
      name,
      value,
      unit,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      userId: this.getUserId()
    });
  }

  /**
   * Track API call performance
   */
  public trackAPICall(endpoint: string, startTime: number, success: boolean): void {
    const duration = performance.now() - startTime;
    
    this.trackCustomMetric(`api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`, duration, 'ms');
    
    // Check API performance budget (200ms target)
    if (duration > 200) {
      this.createAlert(
        `API ${endpoint}`,
        duration,
        200,
        duration > 1000 ? 'critical' : 'warning',
        typeof window !== 'undefined' ? window.location.pathname : ''
      );
    }

    this.sendToAnalytics('api_performance', {
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utilities for manual tracking
export const trackPerformance = {
  customMetric: (name: string, value: number, unit?: string) => 
    performanceMonitor.trackCustomMetric(name, value, unit),
    
  apiCall: (endpoint: string, startTime: number, success: boolean) =>
    performanceMonitor.trackAPICall(endpoint, startTime, success),
    
  getSummary: () => performanceMonitor.getPerformanceSummary()
};

// Export types
export type {
  PerformanceBudget,
  WebVitalMetric,
  CustomMetric,
  PerformanceAlert
};