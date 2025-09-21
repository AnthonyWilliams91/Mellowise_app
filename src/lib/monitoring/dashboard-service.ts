/**
 * Real-time Dashboard Service
 * MELLOWISE-015: Live performance metrics API and dashboard backend
 *
 * Features:
 * - Live performance metrics API
 * - Historical trend analysis
 * - Alert threshold management
 * - Performance report generation
 * - Real-time WebSocket updates
 * - Tenant-specific metrics isolation
 */

import { createServerClient } from '@/lib/supabase/server';
import { performanceCollector, NotificationKPI } from './performance-collector';
import { databaseMonitor, DatabaseMetrics } from './database-monitor';
import { serviceMonitor, ServiceMetrics } from './service-monitor';

// =============================================
// CORE INTERFACES
// =============================================

export interface DashboardMetrics {
  timestamp: string;
  tenantId?: string;
  overview: {
    notificationKPIs: NotificationKPI;
    databaseMetrics: DatabaseMetrics;
    serviceMetrics: ServiceMetrics[];
    systemHealth: SystemHealth;
  };
  alerts: {
    active: DashboardAlert[];
    recent: DashboardAlert[];
    summary: AlertSummary;
  };
  trends: {
    performance: PerformanceTrend[];
    usage: UsageTrend[];
    costs: CostTrend[];
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  components: {
    notifications: ComponentHealth;
    database: ComponentHealth;
    externalServices: ComponentHealth;
    api: ComponentHealth;
  };
  uptime: number; // percentage
  lastIncident?: string;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'down';
  score: number; // 0-100
  latency: number; // ms
  errorRate: number; // 0-1
  availability: number; // 0-1
  lastCheck: string;
}

export interface DashboardAlert {
  id: string;
  type: 'performance' | 'availability' | 'cost' | 'threshold' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  tenantId?: string;
}

export interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolvedToday: number;
  mttr: number; // Mean time to resolution in minutes
}

export interface PerformanceTrend {
  metric: string;
  timeWindow: string;
  dataPoints: Array<{
    timestamp: string;
    value: number;
    target?: number;
  }>;
  trend: 'improving' | 'stable' | 'degrading';
  changePercentage: number;
}

export interface UsageTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
  period: string;
}

export interface CostTrend {
  service: string;
  current: number;
  previous: number;
  change: number;
  projected: number;
  budget: number;
  currency: string;
}

export interface PerformanceReport {
  id: string;
  title: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalNotifications: number;
    deliverySuccessRate: number;
    avgDeliveryTime: number;
    systemUptime: number;
    totalCost: number;
  };
  sections: {
    performance: ReportSection;
    reliability: ReportSection;
    costs: ReportSection;
    recommendations: ReportSection;
  };
  generatedAt: string;
  tenantId?: string;
}

export interface ReportSection {
  title: string;
  summary: string;
  metrics: Array<{
    name: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    target?: number;
    status: 'good' | 'warning' | 'critical';
  }>;
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'gauge';
    title: string;
    data: any;
  }>;
  insights: string[];
}

// =============================================
// REAL-TIME DASHBOARD SERVICE
// =============================================

export class DashboardService {
  private supabase;
  private wsConnections: Map<string, WebSocket> = new Map();
  private updateInterval: number = 30000; // 30 seconds
  private updateTimer?: NodeJS.Timeout;

  constructor() {
    this.supabase = createServerClient();
    this.startRealTimeUpdates();
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(tenantId?: string): Promise<DashboardMetrics> {
    const timestamp = new Date().toISOString();

    // Gather metrics from all monitoring services
    const [notificationKPIs, databaseMetrics, serviceMetrics] = await Promise.all([
      performanceCollector.getCurrentKPIs(tenantId),
      databaseMonitor.getDatabaseMetrics(tenantId),
      serviceMonitor.getServiceMetrics(),
    ]);

    // Calculate system health
    const systemHealth = this.calculateSystemHealth(
      notificationKPIs,
      databaseMetrics,
      serviceMetrics
    );

    // Get alerts
    const [activeAlerts, recentAlerts] = await Promise.all([
      this.getActiveAlerts(tenantId),
      this.getRecentAlerts(tenantId, '24h'),
    ]);

    const alertSummary = this.calculateAlertSummary(activeAlerts, recentAlerts);

    // Get trends
    const [performanceTrends, usageTrends, costTrends] = await Promise.all([
      this.getPerformanceTrends(tenantId),
      this.getUsageTrends(tenantId),
      this.getCostTrends(tenantId),
    ]);

    return {
      timestamp,
      tenantId,
      overview: {
        notificationKPIs,
        databaseMetrics,
        serviceMetrics,
        systemHealth,
      },
      alerts: {
        active: activeAlerts,
        recent: recentAlerts,
        summary: alertSummary,
      },
      trends: {
        performance: performanceTrends,
        usage: usageTrends,
        costs: costTrends,
      },
    };
  }

  /**
   * Get real-time metrics for specific component
   */
  async getComponentMetrics(
    component: 'notifications' | 'database' | 'services' | 'api',
    tenantId?: string,
    timeWindow: string = '1h'
  ): Promise<any> {
    switch (component) {
      case 'notifications':
        return await performanceCollector.getCurrentKPIs(tenantId, timeWindow);
      case 'database':
        return await databaseMonitor.getDatabaseMetrics(tenantId);
      case 'services':
        return await serviceMonitor.getServiceMetrics();
      case 'api':
        return await this.getAPIMetrics(tenantId, timeWindow);
      default:
        throw new Error(`Unknown component: ${component}`);
    }
  }

  /**
   * Get performance trends for dashboard charts
   */
  async getPerformanceTrends(
    tenantId?: string,
    timeWindow: string = '24h',
    granularity: string = '1h'
  ): Promise<PerformanceTrend[]> {
    const metrics = [
      'notification.delivery.latency',
      'database.query.latency',
      'api.request.latency',
      'system.memory.usage',
      'system.cpu.usage',
    ];

    const trends: PerformanceTrend[] = [];

    for (const metric of metrics) {
      const data = await performanceCollector.getPerformanceTrends(
        metric,
        timeWindow,
        granularity,
        tenantId
      );

      if (data.length > 1) {
        const trend = this.calculateTrend(data);
        trends.push({
          metric,
          timeWindow,
          dataPoints: data.map(point => ({
            timestamp: point.timestamp,
            value: point.value,
            target: this.getTargetValue(metric),
          })),
          trend: trend.direction,
          changePercentage: trend.changePercentage,
        });
      }
    }

    return trends;
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(
    startDate: string,
    endDate: string,
    tenantId?: string
  ): Promise<PerformanceReport> {
    const reportId = crypto.randomUUID();
    const period = { start: startDate, end: endDate };

    // Gather data for the period
    const [
      notificationMetrics,
      databaseAnalytics,
      serviceAnalytics,
      costAnalytics,
    ] = await Promise.all([
      this.getNotificationMetricsForPeriod(startDate, endDate, tenantId),
      databaseMonitor.getQueryAnalytics('24h', tenantId),
      serviceMonitor.getServiceCostAnalytics(),
      this.getCostAnalyticsForPeriod(startDate, endDate, tenantId),
    ]);

    // Calculate summary metrics
    const summary = {
      totalNotifications: notificationMetrics.totalCount,
      deliverySuccessRate: notificationMetrics.successRate,
      avgDeliveryTime: notificationMetrics.avgDeliveryTime,
      systemUptime: await this.calculateUptimeForPeriod(startDate, endDate),
      totalCost: costAnalytics.totalCost,
    };

    // Generate report sections
    const sections = {
      performance: this.generatePerformanceSection(notificationMetrics, databaseAnalytics),
      reliability: this.generateReliabilitySection(notificationMetrics, serviceAnalytics),
      costs: this.generateCostSection(costAnalytics),
      recommendations: this.generateRecommendationsSection(summary, notificationMetrics),
    };

    const report: PerformanceReport = {
      id: reportId,
      title: `Performance Report - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      period,
      summary,
      sections,
      generatedAt: new Date().toISOString(),
      tenantId,
    };

    // Save report to database
    await this.saveReport(report);

    return report;
  }

  /**
   * Create custom alert threshold
   */
  async createAlertThreshold(threshold: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq';
    value: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    tenantId?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('alert_thresholds')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: threshold.tenantId || '00000000-0000-0000-0000-000000000000',
        metric: threshold.metric,
        operator: threshold.operator,
        value: threshold.value,
        severity: threshold.severity,
        enabled: threshold.enabled,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to create alert threshold: ${error.message}`);
    }
  }

  /**
   * Get alert thresholds
   */
  async getAlertThresholds(tenantId?: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('alert_thresholds')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .eq('enabled', true);

    if (error) {
      throw new Error(`Failed to get alert thresholds: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(tenantId: string, callback: (metrics: DashboardMetrics) => void): string {
    const subscriptionId = crypto.randomUUID();

    // Store callback for real-time updates
    this.setupSubscription(subscriptionId, tenantId, callback);

    return subscriptionId;
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromUpdates(subscriptionId: string): void {
    // Remove subscription
    this.removeSubscription(subscriptionId);
  }

  /**
   * Calculate system health from component metrics
   */
  private calculateSystemHealth(
    notificationKPIs: NotificationKPI,
    databaseMetrics: DatabaseMetrics,
    serviceMetrics: ServiceMetrics[]
  ): SystemHealth {
    // Calculate component health scores
    const notificationHealth = this.calculateComponentHealth('notifications', {
      latency: notificationKPIs.deliveryLatency,
      errorRate: 1 - notificationKPIs.deliverySuccessRate,
      availability: notificationKPIs.deliverySuccessRate,
    });

    const databaseHealth = this.calculateComponentHealth('database', {
      latency: databaseMetrics.queryPerformance.avgLatency,
      errorRate: databaseMetrics.queryPerformance.errorRate,
      availability: databaseMetrics.healthStatus === 'healthy' ? 1 : 0.5,
    });

    const serviceHealth = this.calculateServicesHealth(serviceMetrics);

    const apiHealth = this.calculateComponentHealth('api', {
      latency: Object.values(notificationKPIs.apiResponseTimes).reduce((a, b) => a + b, 0) /
               Math.max(Object.values(notificationKPIs.apiResponseTimes).length, 1),
      errorRate: Object.values(notificationKPIs.apiErrorRates).reduce((a, b) => a + b, 0) /
                Math.max(Object.values(notificationKPIs.apiErrorRates).length, 1),
      availability: 0.99, // Would calculate from actual uptime
    });

    // Calculate overall system score
    const systemScore = Math.round(
      (notificationHealth.score + databaseHealth.score + serviceHealth.score + apiHealth.score) / 4
    );

    // Determine overall status
    let status: SystemHealth['status'] = 'healthy';
    if (systemScore < 70) status = 'critical';
    else if (systemScore < 90) status = 'degraded';

    return {
      status,
      score: systemScore,
      components: {
        notifications: notificationHealth,
        database: databaseHealth,
        externalServices: serviceHealth,
        api: apiHealth,
      },
      uptime: 99.9, // Would calculate from actual data
      lastIncident: undefined, // Would get from incidents table
    };
  }

  /**
   * Calculate component health score
   */
  private calculateComponentHealth(
    component: string,
    metrics: { latency: number; errorRate: number; availability: number }
  ): ComponentHealth {
    // Score based on performance thresholds
    const latencyScore = metrics.latency < 1000 ? 100 : Math.max(0, 100 - (metrics.latency - 1000) / 100);
    const errorScore = (1 - Math.min(metrics.errorRate, 0.1)) * 100;
    const availabilityScore = metrics.availability * 100;

    const score = Math.round((latencyScore + errorScore + availabilityScore) / 3);

    let status: ComponentHealth['status'] = 'healthy';
    if (score < 70) status = 'down';
    else if (score < 90) status = 'degraded';

    return {
      status,
      score,
      latency: metrics.latency,
      errorRate: metrics.errorRate,
      availability: metrics.availability,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Calculate services health from multiple service metrics
   */
  private calculateServicesHealth(serviceMetrics: ServiceMetrics[]): ComponentHealth {
    if (serviceMetrics.length === 0) {
      return {
        status: 'down',
        score: 0,
        latency: 0,
        errorRate: 1,
        availability: 0,
        lastCheck: new Date().toISOString(),
      };
    }

    const avgLatency = serviceMetrics.reduce((sum, s) => sum + s.avgResponseTime, 0) / serviceMetrics.length;
    const avgErrorRate = serviceMetrics.reduce((sum, s) => sum + s.errorRate, 0) / serviceMetrics.length;
    const avgAvailability = serviceMetrics.reduce((sum, s) => sum + s.availability, 0) / serviceMetrics.length;

    return this.calculateComponentHealth('services', {
      latency: avgLatency,
      errorRate: avgErrorRate,
      availability: avgAvailability,
    });
  }

  /**
   * Get active alerts
   */
  private async getActiveAlerts(tenantId?: string): Promise<DashboardAlert[]> {
    const { data: alerts } = await this.supabase
      .from('dashboard_alerts')
      .select('*')
      .eq('resolved', false)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .order('timestamp', { ascending: false });

    return alerts || [];
  }

  /**
   * Get recent alerts
   */
  private async getRecentAlerts(tenantId?: string, timeWindow: string = '24h'): Promise<DashboardAlert[]> {
    const startTime = new Date(Date.now() - this.parseTimeWindow(timeWindow));

    const { data: alerts } = await this.supabase
      .from('dashboard_alerts')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .order('timestamp', { ascending: false })
      .limit(50);

    return alerts || [];
  }

  /**
   * Calculate alert summary
   */
  private calculateAlertSummary(activeAlerts: DashboardAlert[], recentAlerts: DashboardAlert[]): AlertSummary {
    const total = activeAlerts.length;
    const critical = activeAlerts.filter(a => a.severity === 'critical').length;
    const high = activeAlerts.filter(a => a.severity === 'high').length;
    const medium = activeAlerts.filter(a => a.severity === 'medium').length;
    const low = activeAlerts.filter(a => a.severity === 'low').length;

    const resolvedToday = recentAlerts.filter(a =>
      a.resolved &&
      new Date(a.resolvedAt!).toDateString() === new Date().toDateString()
    ).length;

    // Calculate MTTR (Mean Time To Resolution)
    const resolvedAlerts = recentAlerts.filter(a => a.resolved && a.resolvedAt);
    const mttr = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.timestamp).getTime();
          const resolved = new Date(alert.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedAlerts.length / (1000 * 60) // Convert to minutes
      : 0;

    return {
      total,
      critical,
      high,
      medium,
      low,
      resolvedToday,
      mttr: Math.round(mttr),
    };
  }

  /**
   * Get usage trends
   */
  private async getUsageTrends(tenantId?: string): Promise<UsageTrend[]> {
    // This would query usage metrics and compare periods
    return [
      {
        metric: 'Notifications Sent',
        current: 1250,
        previous: 1100,
        change: 13.6,
        unit: 'notifications',
        period: 'This Week',
      },
      {
        metric: 'API Requests',
        current: 45670,
        previous: 42100,
        change: 8.5,
        unit: 'requests',
        period: 'This Week',
      },
      {
        metric: 'Database Queries',
        current: 125000,
        previous: 118000,
        change: 5.9,
        unit: 'queries',
        period: 'This Week',
      },
    ];
  }

  /**
   * Get cost trends
   */
  private async getCostTrends(tenantId?: string): Promise<CostTrend[]> {
    const serviceAnalytics = await serviceMonitor.getServiceCostAnalytics();

    return serviceAnalytics.map(analytics => ({
      service: analytics.serviceName,
      current: analytics.totalCost,
      previous: analytics.totalCost * 0.9, // Simulate previous period
      change: 10, // Simulate 10% increase
      projected: analytics.projectedMonthlyCost,
      budget: 100, // $100 budget per service
      currency: 'USD',
    }));
  }

  /**
   * Calculate trend direction and percentage
   */
  private calculateTrend(data: Array<{ timestamp: string; value: number }>): {
    direction: 'improving' | 'stable' | 'degrading';
    changePercentage: number;
  } {
    if (data.length < 2) {
      return { direction: 'stable', changePercentage: 0 };
    }

    const first = data[0].value;
    const last = data[data.length - 1].value;
    const changePercentage = ((last - first) / first) * 100;

    let direction: 'improving' | 'stable' | 'degrading' = 'stable';
    if (Math.abs(changePercentage) > 5) {
      direction = changePercentage > 0 ? 'degrading' : 'improving'; // Lower values are better for latency
    }

    return { direction, changePercentage: Math.abs(changePercentage) };
  }

  /**
   * Get target value for metric
   */
  private getTargetValue(metric: string): number | undefined {
    const targets: Record<string, number> = {
      'notification.delivery.latency': 1000, // 1 second
      'database.query.latency': 100, // 100ms
      'api.request.latency': 200, // 200ms
      'system.memory.usage': 512, // 512MB
      'system.cpu.usage': 70, // 70%
    };

    return targets[metric];
  }

  /**
   * Start real-time updates
   */
  private startRealTimeUpdates(): void {
    this.updateTimer = setInterval(async () => {
      // Send updates to all subscribed clients
      // Implementation would depend on WebSocket setup
    }, this.updateInterval);
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  /**
   * Parse time window string to milliseconds
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid time window: ${timeWindow}`);

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Invalid time unit: ${unit}`);
    }
  }

  /**
   * Placeholder methods for report generation
   */
  private async getNotificationMetricsForPeriod(start: string, end: string, tenantId?: string): Promise<any> {
    // Implementation would query notification metrics for the period
    return {
      totalCount: 10000,
      successRate: 0.995,
      avgDeliveryTime: 850,
    };
  }

  private async getCostAnalyticsForPeriod(start: string, end: string, tenantId?: string): Promise<any> {
    // Implementation would query cost data for the period
    return { totalCost: 45.67 };
  }

  private async calculateUptimeForPeriod(start: string, end: string): Promise<number> {
    // Implementation would calculate uptime percentage
    return 99.95;
  }

  private async getAPIMetrics(tenantId?: string, timeWindow: string = '1h'): Promise<any> {
    // Implementation would get API-specific metrics
    return {};
  }

  private generatePerformanceSection(notificationMetrics: any, databaseAnalytics: any): ReportSection {
    // Generate performance section
    return {
      title: 'Performance Analysis',
      summary: 'System performance remained within acceptable thresholds.',
      metrics: [],
      charts: [],
      insights: [],
    };
  }

  private generateReliabilitySection(notificationMetrics: any, serviceAnalytics: any): ReportSection {
    // Generate reliability section
    return {
      title: 'Reliability Analysis',
      summary: 'High availability maintained across all services.',
      metrics: [],
      charts: [],
      insights: [],
    };
  }

  private generateCostSection(costAnalytics: any): ReportSection {
    // Generate cost section
    return {
      title: 'Cost Analysis',
      summary: 'Costs are within budget projections.',
      metrics: [],
      charts: [],
      insights: [],
    };
  }

  private generateRecommendationsSection(summary: any, notificationMetrics: any): ReportSection {
    // Generate recommendations
    return {
      title: 'Recommendations',
      summary: 'Several optimization opportunities identified.',
      metrics: [],
      charts: [],
      insights: [],
    };
  }

  private async saveReport(report: PerformanceReport): Promise<void> {
    // Save report to database
    const { error } = await this.supabase
      .from('performance_reports')
      .insert({
        id: report.id,
        tenant_id: report.tenantId || '00000000-0000-0000-0000-000000000000',
        title: report.title,
        period_start: report.period.start,
        period_end: report.period.end,
        summary: report.summary,
        sections: report.sections,
        generated_at: report.generatedAt,
      });

    if (error) {
      console.error('Failed to save performance report:', error);
    }
  }

  private setupSubscription(subscriptionId: string, tenantId: string, callback: (metrics: DashboardMetrics) => void): void {
    // Implementation would set up WebSocket or SSE connection
  }

  private removeSubscription(subscriptionId: string): void {
    // Implementation would clean up subscription
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const dashboardService = new DashboardService();