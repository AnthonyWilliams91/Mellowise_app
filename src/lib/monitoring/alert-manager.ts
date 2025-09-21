/**
 * Alert Management System
 * MELLOWISE-015: Multi-channel alerting with escalation policies
 *
 * Features:
 * - Configurable performance thresholds
 * - Multi-channel alerting (email, Slack, SMS, webhook)
 * - Escalation policies and on-call rotation
 * - Alert suppression and deduplication
 * - Incident correlation and auto-resolution
 * - Alert fatigue prevention
 */

import { createServerClient } from '@/lib/supabase/server';
import { performanceCollector } from './performance-collector';

// =============================================
// CORE INTERFACES
// =============================================

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'performance' | 'availability' | 'threshold' | 'anomaly' | 'external';
  component: string;
  metric?: string;
  currentValue?: number;
  threshold?: number;
  tags: Record<string, string>;
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  createdAt: string;
  updatedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  tenantId?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  suppressionRules: SuppressionRule[];
  escalationPolicy?: EscalationPolicy;
  tags: Record<string, string>;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  duration: string; // e.g., "5m", "1h"
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertAction {
  type: 'email' | 'slack' | 'sms' | 'webhook' | 'pagerduty';
  config: {
    recipients?: string[];
    webhookUrl?: string;
    slackChannel?: string;
    template?: string;
  };
  conditions: {
    severities: string[];
    timeWindow?: string;
    maxFrequency?: number;
  };
}

export interface SuppressionRule {
  type: 'time_based' | 'condition_based' | 'dependency_based';
  config: {
    startTime?: string;
    endTime?: string;
    days?: string[];
    dependentMetric?: string;
    condition?: string;
  };
  enabled: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  steps: EscalationStep[];
  tenantId?: string;
}

export interface EscalationStep {
  stepNumber: number;
  delay: string; // e.g., "15m", "1h"
  actions: AlertAction[];
  autoResolve?: boolean;
}

export interface OnCallSchedule {
  id: string;
  name: string;
  timezone: string;
  rotations: OnCallRotation[];
  tenantId?: string;
}

export interface OnCallRotation {
  id: string;
  name: string;
  users: string[];
  schedule: {
    type: 'daily' | 'weekly' | 'monthly';
    startTime: string;
    duration: string;
    handoffTime: string;
  };
  overrides: OnCallOverride[];
}

export interface OnCallOverride {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  channel: 'email' | 'slack' | 'sms' | 'webhook' | 'pagerduty';
  recipient: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  attempts: number;
  lastAttempt: string;
  response?: string;
  error?: string;
}

export interface IncidentCorrelation {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertIds: string[];
  rootCause?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  tenantId?: string;
}

// =============================================
// ALERT MANAGEMENT SYSTEM
// =============================================

export class AlertManager {
  private supabase;
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private suppressedAlerts: Set<string> = new Set();
  private escalationTimer: Map<string, NodeJS.Timeout> = new Map();
  private evaluationInterval: number = 30000; // 30 seconds
  private evaluationTimer?: NodeJS.Timeout;

  constructor() {
    this.supabase = createServerClient();
    this.loadAlertRules();
    this.startAlertEvaluation();
  }

  /**
   * Create a new alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const alertRule: AlertRule = {
      id: crypto.randomUUID(),
      ...rule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    const { error } = await this.supabase
      .from('alert_rules')
      .insert({
        id: alertRule.id,
        tenant_id: alertRule.tenantId || '00000000-0000-0000-0000-000000000000',
        name: alertRule.name,
        description: alertRule.description,
        enabled: alertRule.enabled,
        metric: alertRule.metric,
        conditions: alertRule.conditions,
        actions: alertRule.actions,
        suppression_rules: alertRule.suppressionRules,
        escalation_policy: alertRule.escalationPolicy,
        tags: alertRule.tags,
        created_at: alertRule.createdAt,
        updated_at: alertRule.updatedAt,
      });

    if (error) {
      throw new Error(`Failed to create alert rule: ${error.message}`);
    }

    // Add to cache
    this.alertRules.set(alertRule.id, alertRule);

    return alertRule;
  }

  /**
   * Fire an alert
   */
  async fireAlert(
    source: Alert['source'],
    component: string,
    title: string,
    message: string,
    severity: Alert['severity'],
    metric?: string,
    currentValue?: number,
    threshold?: number,
    tags: Record<string, string> = {},
    tenantId?: string
  ): Promise<Alert> {
    const alertId = this.generateAlertId(component, metric, tags);

    // Check if alert is suppressed
    if (this.isAlertSuppressed(component, metric, tags)) {
      console.log(`Alert suppressed: ${alertId}`);
      return this.activeAlerts.get(alertId)!;
    }

    // Check for existing alert (deduplication)
    let alert = this.activeAlerts.get(alertId);
    if (alert) {
      // Update existing alert
      alert.currentValue = currentValue;
      alert.updatedAt = new Date().toISOString();
      await this.updateAlert(alert);
      return alert;
    }

    // Create new alert
    alert = {
      id: alertId,
      title,
      message,
      severity,
      source,
      component,
      metric,
      currentValue,
      threshold,
      tags,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId,
    };

    // Save to database
    await this.saveAlert(alert);

    // Add to active alerts
    this.activeAlerts.set(alertId, alert);

    // Send notifications
    await this.processAlertActions(alert);

    // Start escalation if configured
    await this.startEscalation(alert);

    // Check for incident correlation
    await this.correlateIncident(alert);

    return alert;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== 'open') {
      throw new Error(`Alert ${alertId} not found or not in open state`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;
    alert.updatedAt = new Date().toISOString();

    await this.updateAlert(alert);

    // Stop escalation
    this.stopEscalation(alertId);

    // Send acknowledgment notifications
    await this.sendAckNotification(alert, userId);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId?: string, resolution?: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = userId;
    alert.updatedAt = new Date().toISOString();

    await this.updateAlert(alert);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    // Stop escalation
    this.stopEscalation(alertId);

    // Send resolution notifications
    await this.sendResolutionNotification(alert, userId, resolution);

    // Update incident correlation
    await this.updateIncidentCorrelation(alert);
  }

  /**
   * Suppress alerts matching criteria
   */
  async suppressAlerts(
    component: string,
    metric?: string,
    tags: Record<string, string> = {},
    duration: string = '1h',
    reason: string = 'Manual suppression'
  ): Promise<void> {
    const suppressionKey = this.generateSuppressionKey(component, metric, tags);
    this.suppressedAlerts.add(suppressionKey);

    // Set timeout to remove suppression
    const durationMs = this.parseDuration(duration);
    setTimeout(() => {
      this.suppressedAlerts.delete(suppressionKey);
    }, durationMs);

    // Record suppression
    await this.supabase
      .from('alert_suppressions')
      .insert({
        id: crypto.randomUUID(),
        component,
        metric,
        tags,
        duration,
        reason,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + durationMs).toISOString(),
      });
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(tenantId?: string): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !tenantId || alert.tenantId === tenantId)
      .sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  /**
   * Get alert history
   */
  async getAlertHistory(
    limit: number = 100,
    tenantId?: string,
    filters?: {
      component?: string;
      severity?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Alert[]> {
    let query = this.supabase
      .from('alerts')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters) {
      if (filters.component) query = query.eq('component', filters.component);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to get alert history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get alert metrics and statistics
   */
  async getAlertMetrics(timeWindow: string = '24h', tenantId?: string): Promise<{
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByComponent: Record<string, number>;
    mttr: number; // Mean time to resolution
    alertRate: number; // Alerts per hour
    topAlertSources: Array<{ component: string; count: number }>;
  }> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseDuration(timeWindow));

    const { data: alerts } = await this.supabase
      .from('alerts')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString());

    if (!alerts) {
      return {
        totalAlerts: 0,
        alertsBySeverity: {},
        alertsByComponent: {},
        mttr: 0,
        alertRate: 0,
        topAlertSources: [],
      };
    }

    // Calculate metrics
    const totalAlerts = alerts.length;
    const alertsBySeverity = this.groupBy(alerts, 'severity');
    const alertsByComponent = this.groupBy(alerts, 'component');

    // Calculate MTTR for resolved alerts
    const resolvedAlerts = alerts.filter(a => a.resolved_at);
    const mttr = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.created_at).getTime();
          const resolved = new Date(alert.resolved_at).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedAlerts.length / (1000 * 60) // Convert to minutes
      : 0;

    // Calculate alert rate (alerts per hour)
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const alertRate = totalAlerts / hours;

    // Top alert sources
    const componentCounts = Object.entries(alertsByComponent)
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAlerts,
      alertsBySeverity,
      alertsByComponent,
      mttr: Math.round(mttr),
      alertRate: Math.round(alertRate * 100) / 100,
      topAlertSources: componentCounts,
    };
  }

  /**
   * Load alert rules from database
   */
  private async loadAlertRules(): Promise<void> {
    const { data: rules } = await this.supabase
      .from('alert_rules')
      .select('*')
      .eq('enabled', true);

    if (rules) {
      rules.forEach(rule => {
        this.alertRules.set(rule.id, {
          id: rule.id,
          name: rule.name,
          description: rule.description,
          enabled: rule.enabled,
          metric: rule.metric,
          conditions: rule.conditions,
          actions: rule.actions,
          suppressionRules: rule.suppression_rules || [],
          escalationPolicy: rule.escalation_policy,
          tags: rule.tags || {},
          tenantId: rule.tenant_id,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at,
        });
      });
    }
  }

  /**
   * Start continuous alert evaluation
   */
  private startAlertEvaluation(): void {
    this.evaluationTimer = setInterval(async () => {
      await this.evaluateAlertRules();
    }, this.evaluationInterval);
  }

  /**
   * Stop alert evaluation
   */
  stopAlertEvaluation(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = undefined;
    }
  }

  /**
   * Evaluate all alert rules
   */
  private async evaluateAlertRules(): Promise<void> {
    for (const rule of this.alertRules.values()) {
      try {
        await this.evaluateRule(rule);
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * Evaluate a specific alert rule
   */
  private async evaluateRule(rule: AlertRule): Promise<void> {
    // Get current metric value
    const metricValue = await this.getCurrentMetricValue(rule.metric, rule.tenantId);
    if (metricValue === null) return;

    // Check each condition
    for (const condition of rule.conditions) {
      const triggered = this.evaluateCondition(metricValue, condition);

      if (triggered) {
        await this.fireAlert(
          'threshold',
          rule.metric.split('.')[0], // Extract component from metric name
          `${rule.name} threshold exceeded`,
          `${rule.metric} is ${metricValue}, threshold is ${condition.threshold}`,
          condition.severity,
          rule.metric,
          metricValue,
          condition.threshold,
          rule.tags,
          rule.tenantId
        );
      }
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(value: number, condition: AlertCondition): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'neq': return value !== condition.threshold;
      default: return false;
    }
  }

  /**
   * Get current metric value
   */
  private async getCurrentMetricValue(metric: string, tenantId?: string): Promise<number | null> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000); // Last 5 minutes

    const { data: metrics } = await this.supabase
      .from('performance_metrics')
      .select('value')
      .eq('metric_name', metric)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1);

    return metrics && metrics.length > 0 ? metrics[0].value : null;
  }

  /**
   * Generate unique alert ID for deduplication
   */
  private generateAlertId(component: string, metric?: string, tags: Record<string, string> = {}): string {
    const parts = [component];
    if (metric) parts.push(metric);

    const sortedTags = Object.keys(tags).sort().map(key => `${key}:${tags[key]}`);
    parts.push(...sortedTags);

    return crypto.createHash('md5').update(parts.join('|')).digest('hex');
  }

  /**
   * Generate suppression key
   */
  private generateSuppressionKey(component: string, metric?: string, tags: Record<string, string> = {}): string {
    return this.generateAlertId(component, metric, tags);
  }

  /**
   * Check if alert is suppressed
   */
  private isAlertSuppressed(component: string, metric?: string, tags: Record<string, string> = {}): boolean {
    const suppressionKey = this.generateSuppressionKey(component, metric, tags);
    return this.suppressedAlerts.has(suppressionKey);
  }

  /**
   * Process alert actions (send notifications)
   */
  private async processAlertActions(alert: Alert): Promise<void> {
    // Find matching alert rules
    const matchingRules = Array.from(this.alertRules.values())
      .filter(rule => rule.metric === alert.metric || rule.tags.component === alert.component);

    for (const rule of matchingRules) {
      for (const action of rule.actions) {
        if (action.conditions.severities.includes(alert.severity)) {
          await this.executeAction(alert, action);
        }
      }
    }
  }

  /**
   * Execute alert action
   */
  private async executeAction(alert: Alert, action: AlertAction): Promise<void> {
    const notification: AlertNotification = {
      id: crypto.randomUUID(),
      alertId: alert.id,
      channel: action.type,
      recipient: action.config.recipients?.[0] || 'default',
      status: 'pending',
      attempts: 0,
      lastAttempt: new Date().toISOString(),
    };

    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailNotification(alert, action);
          break;
        case 'slack':
          await this.sendSlackNotification(alert, action);
          break;
        case 'sms':
          await this.sendSMSNotification(alert, action);
          break;
        case 'webhook':
          await this.sendWebhookNotification(alert, action);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      notification.status = 'sent';
    } catch (error) {
      notification.status = 'failed';
      notification.error = (error as Error).message;
    }

    // Save notification record
    await this.saveNotification(notification);
  }

  /**
   * Start escalation process
   */
  private async startEscalation(alert: Alert): Promise<void> {
    const rule = Array.from(this.alertRules.values())
      .find(r => r.metric === alert.metric);

    if (!rule?.escalationPolicy) return;

    const policy = rule.escalationPolicy;

    for (const step of policy.steps) {
      const delay = this.parseDuration(step.delay);

      const timer = setTimeout(async () => {
        // Check if alert is still active
        if (this.activeAlerts.has(alert.id) && this.activeAlerts.get(alert.id)?.status === 'open') {
          for (const action of step.actions) {
            await this.executeAction(alert, action);
          }
        }
      }, delay);

      this.escalationTimer.set(`${alert.id}-${step.stepNumber}`, timer);
    }
  }

  /**
   * Stop escalation process
   */
  private stopEscalation(alertId: string): void {
    // Clear all escalation timers for this alert
    for (const [key, timer] of this.escalationTimer.entries()) {
      if (key.startsWith(alertId)) {
        clearTimeout(timer);
        this.escalationTimer.delete(key);
      }
    }
  }

  /**
   * Correlate incidents from multiple alerts
   */
  private async correlateIncident(alert: Alert): Promise<void> {
    // Simple correlation based on component and time window
    const relatedAlerts = Array.from(this.activeAlerts.values())
      .filter(a =>
        a.component === alert.component &&
        a.id !== alert.id &&
        new Date(a.createdAt).getTime() > Date.now() - 300000 // Last 5 minutes
      );

    if (relatedAlerts.length >= 2) {
      const incident: IncidentCorrelation = {
        id: crypto.randomUUID(),
        title: `Multiple alerts in ${alert.component}`,
        description: `${relatedAlerts.length + 1} related alerts detected`,
        status: 'investigating',
        severity: this.getHighestSeverity([alert, ...relatedAlerts]),
        alertIds: [alert.id, ...relatedAlerts.map(a => a.id)],
        createdAt: new Date().toISOString(),
        tenantId: alert.tenantId,
      };

      await this.saveIncident(incident);
    }
  }

  /**
   * Update incident correlation when alert is resolved
   */
  private async updateIncidentCorrelation(alert: Alert): Promise<void> {
    const { data: incidents } = await this.supabase
      .from('incident_correlations')
      .select('*')
      .contains('alert_ids', [alert.id])
      .eq('status', 'investigating');

    for (const incident of incidents || []) {
      const remainingAlerts = incident.alert_ids.filter((id: string) =>
        this.activeAlerts.has(id)
      );

      if (remainingAlerts.length === 0) {
        // Auto-resolve incident if all alerts are resolved
        await this.supabase
          .from('incident_correlations')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution: 'Auto-resolved: All related alerts resolved',
          })
          .eq('id', incident.id);
      }
    }
  }

  /**
   * Notification methods
   */
  private async sendEmailNotification(alert: Alert, action: AlertAction): Promise<void> {
    // Implementation would use email service
    console.log(`Sending email alert: ${alert.title}`);
  }

  private async sendSlackNotification(alert: Alert, action: AlertAction): Promise<void> {
    // Implementation would use Slack API
    console.log(`Sending Slack alert: ${alert.title}`);
  }

  private async sendSMSNotification(alert: Alert, action: AlertAction): Promise<void> {
    // Implementation would use SMS service
    console.log(`Sending SMS alert: ${alert.title}`);
  }

  private async sendWebhookNotification(alert: Alert, action: AlertAction): Promise<void> {
    // Implementation would make HTTP request
    console.log(`Sending webhook alert: ${alert.title}`);
  }

  private async sendAckNotification(alert: Alert, userId: string): Promise<void> {
    console.log(`Alert ${alert.id} acknowledged by ${userId}`);
  }

  private async sendResolutionNotification(alert: Alert, userId?: string, resolution?: string): Promise<void> {
    console.log(`Alert ${alert.id} resolved by ${userId || 'system'}: ${resolution || 'No resolution provided'}`);
  }

  /**
   * Database operations
   */
  private async saveAlert(alert: Alert): Promise<void> {
    const { error } = await this.supabase
      .from('alerts')
      .insert({
        id: alert.id,
        tenant_id: alert.tenantId || '00000000-0000-0000-0000-000000000000',
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        source: alert.source,
        component: alert.component,
        metric: alert.metric,
        current_value: alert.currentValue,
        threshold: alert.threshold,
        tags: alert.tags,
        status: alert.status,
        created_at: alert.createdAt,
        updated_at: alert.updatedAt,
      });

    if (error) {
      console.error('Failed to save alert:', error);
    }
  }

  private async updateAlert(alert: Alert): Promise<void> {
    const { error } = await this.supabase
      .from('alerts')
      .update({
        current_value: alert.currentValue,
        status: alert.status,
        acknowledged_at: alert.acknowledgedAt,
        acknowledged_by: alert.acknowledgedBy,
        resolved_at: alert.resolvedAt,
        resolved_by: alert.resolvedBy,
        updated_at: alert.updatedAt,
      })
      .eq('id', alert.id);

    if (error) {
      console.error('Failed to update alert:', error);
    }
  }

  private async saveNotification(notification: AlertNotification): Promise<void> {
    const { error } = await this.supabase
      .from('alert_notifications')
      .insert({
        id: notification.id,
        alert_id: notification.alertId,
        channel: notification.channel,
        recipient: notification.recipient,
        status: notification.status,
        attempts: notification.attempts,
        last_attempt: notification.lastAttempt,
        response: notification.response,
        error: notification.error,
      });

    if (error) {
      console.error('Failed to save notification:', error);
    }
  }

  private async saveIncident(incident: IncidentCorrelation): Promise<void> {
    const { error } = await this.supabase
      .from('incident_correlations')
      .insert({
        id: incident.id,
        tenant_id: incident.tenantId || '00000000-0000-0000-0000-000000000000',
        title: incident.title,
        description: incident.description,
        status: incident.status,
        severity: incident.severity,
        alert_ids: incident.alertIds,
        created_at: incident.createdAt,
      });

    if (error) {
      console.error('Failed to save incident:', error);
    }
  }

  /**
   * Utility methods
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid duration: ${duration}`);

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

  private getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private getHighestSeverity(alerts: Alert[]): Alert['severity'] {
    let highest: Alert['severity'] = 'low';
    let highestWeight = 0;

    for (const alert of alerts) {
      const weight = this.getSeverityWeight(alert.severity);
      if (weight > highestWeight) {
        highest = alert.severity;
        highestWeight = weight;
      }
    }

    return highest;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const alertManager = new AlertManager();

// =============================================
// ALERT RULE TEMPLATES
// =============================================

export const COMMON_ALERT_RULES = {
  HIGH_NOTIFICATION_LATENCY: {
    name: 'High Notification Delivery Latency',
    description: 'Alert when notification delivery takes longer than expected',
    metric: 'notification.delivery.latency',
    conditions: [
      { operator: 'gt' as const, threshold: 5000, duration: '5m', severity: 'high' as const },
      { operator: 'gt' as const, threshold: 10000, duration: '2m', severity: 'critical' as const },
    ],
  },
  LOW_DELIVERY_SUCCESS_RATE: {
    name: 'Low Notification Delivery Success Rate',
    description: 'Alert when notification delivery success rate drops',
    metric: 'notification.delivery.success_rate',
    conditions: [
      { operator: 'lt' as const, threshold: 0.95, duration: '10m', severity: 'medium' as const },
      { operator: 'lt' as const, threshold: 0.85, duration: '5m', severity: 'critical' as const },
    ],
  },
  HIGH_DATABASE_LATENCY: {
    name: 'High Database Query Latency',
    description: 'Alert when database queries are slow',
    metric: 'database.query.latency',
    conditions: [
      { operator: 'gt' as const, threshold: 1000, duration: '5m', severity: 'medium' as const },
      { operator: 'gt' as const, threshold: 5000, duration: '2m', severity: 'high' as const },
    ],
  },
  HIGH_ERROR_RATE: {
    name: 'High API Error Rate',
    description: 'Alert when API error rate is elevated',
    metric: 'api.error.rate',
    conditions: [
      { operator: 'gt' as const, threshold: 0.05, duration: '5m', severity: 'medium' as const },
      { operator: 'gt' as const, threshold: 0.10, duration: '2m', severity: 'high' as const },
    ],
  },
};