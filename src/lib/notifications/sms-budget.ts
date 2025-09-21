/**
 * SMS Budget Management System
 * MELLOWISE-015: Tenant-level budget controls with automatic cost limiting and forecasting
 */

import { createServerClient } from '@/lib/supabase/server';
import { addDays, addMonths, differenceInDays, format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Budget management types and interfaces
 */
export interface SMSBudget {
  tenantId: string;
  budgetType: 'monthly' | 'daily' | 'per_campaign' | 'per_user';
  limits: {
    amount: number; // USD cents
    messages: number;
    perUser?: number; // USD cents per user
  };
  periods: {
    current: {
      spent: number;
      messagesUsed: number;
      remaining: number;
      daysLeft: number;
    };
    forecast: {
      projectedSpend: number;
      projectedMessages: number;
      burnRate: number; // per day
      estimatedOverage: number;
    };
  };
  alerts: {
    warningThreshold: number; // percentage
    criticalThreshold: number; // percentage
    autoStopAtLimit: boolean;
    notifyEmails: string[];
  };
  overrides: {
    emergencyAllowance: number; // USD cents
    priorityOverride: boolean; // Allow critical messages to exceed budget
    approvedOverages: Array<{
      amount: number;
      reason: string;
      approvedBy: string;
      approvedAt: string;
      expiresAt: string;
    }>;
  };
  restrictions: {
    blockedUserSegments: string[];
    blockedMessageTypes: string[];
    maxCostPerMessage: number;
    requireApprovalOver: number; // USD cents
  };
  analytics: {
    efficiency: number; // cost per engagement
    utilizationRate: number; // budget used vs allocated
    savingsFromOptimization: number;
    historicalAverages: {
      monthlySpend: number;
      messagesPerMonth: number;
      costPerMessage: number;
    };
  };
}

export interface BudgetAlert {
  id: string;
  tenantId: string;
  type: 'warning' | 'critical' | 'overage' | 'forecast_warning';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  data: {
    currentSpend: number;
    budgetLimit: number;
    percentageUsed: number;
    projectedOverage?: number;
    daysRemaining?: number;
  };
  actions: Array<{
    type: 'reduce_spending' | 'increase_budget' | 'optimize_channels' | 'approve_overage';
    title: string;
    description: string;
    estimatedImpact?: string;
  }>;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  autoActions?: Array<{
    action: string;
    triggeredAt: string;
    result: string;
  }>;
}

export interface BudgetRequest {
  id: string;
  tenantId: string;
  requestType: 'increase_limit' | 'approve_overage' | 'emergency_allowance';
  requestedAmount: number;
  currentLimit: number;
  justification: string;
  businessCase?: {
    expectedROI: number;
    campaignDetails: string;
    duration: number; // days
    projectedResults: string;
  };
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  autoApprovalRules?: {
    ruleId: string;
    ruleName: string;
    appliedAt: string;
  };
}

export interface BudgetOptimizationSuggestion {
  type: 'reduce_costs' | 'improve_efficiency' | 'reallocate_budget' | 'change_strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    costSavings: number; // USD cents
    efficiencyGain: number; // percentage
    implementationTime: string;
    effort: 'low' | 'medium' | 'high';
  };
  implementation: {
    steps: string[];
    requirements: string[];
    risks: string[];
    monitoring: string[];
  };
  metrics: {
    baseline: Record<string, number>;
    targets: Record<string, number>;
    kpis: string[];
  };
}

/**
 * SMS Budget Management Service
 * Comprehensive budget control with forecasting and optimization
 */
export class SMSBudgetService {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Get current budget status for a tenant
   */
  async getBudgetStatus(tenantId: string): Promise<SMSBudget> {
    // Get budget configuration
    const { data: budgetConfig } = await this.supabase
      .from('sms_budgets')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (!budgetConfig) {
      // Create default budget
      return await this.createDefaultBudget(tenantId);
    }

    // Get current period spending
    const currentPeriod = await this.getCurrentPeriodSpending(tenantId, budgetConfig.budget_type);

    // Calculate forecasts
    const forecast = await this.calculateSpendingForecast(tenantId, currentPeriod);

    // Get analytics
    const analytics = await this.calculateBudgetAnalytics(tenantId);

    return {
      tenantId,
      budgetType: budgetConfig.budget_type,
      limits: budgetConfig.limits,
      periods: {
        current: currentPeriod,
        forecast,
      },
      alerts: budgetConfig.alerts,
      overrides: budgetConfig.overrides || {
        emergencyAllowance: 0,
        priorityOverride: true,
        approvedOverages: [],
      },
      restrictions: budgetConfig.restrictions || {
        blockedUserSegments: [],
        blockedMessageTypes: [],
        maxCostPerMessage: 2000, // $20
        requireApprovalOver: 10000, // $100
      },
      analytics,
    };
  }

  /**
   * Check if a message send is within budget
   */
  async checkBudgetAllowance(
    tenantId: string,
    messageType: string,
    estimatedCost: number,
    userSegment?: string,
    priority?: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    budgetRemaining: number;
    requiresApproval: boolean;
    autoApproved: boolean;
    alternatives?: Array<{
      action: string;
      description: string;
      costImpact: number;
    }>;
  }> {
    const budget = await this.getBudgetStatus(tenantId);

    // Check restrictions
    if (budget.restrictions.blockedMessageTypes.includes(messageType)) {
      return {
        allowed: false,
        reason: `Message type '${messageType}' is blocked`,
        budgetRemaining: budget.periods.current.remaining,
        requiresApproval: false,
        autoApproved: false,
      };
    }

    if (userSegment && budget.restrictions.blockedUserSegments.includes(userSegment)) {
      return {
        allowed: false,
        reason: `User segment '${userSegment}' is blocked from SMS`,
        budgetRemaining: budget.periods.current.remaining,
        requiresApproval: false,
        autoApproved: false,
        alternatives: [
          {
            action: 'switch_to_push',
            description: 'Send as push notification instead',
            costImpact: -estimatedCost + 5, // Push costs ~5 cents
          },
          {
            action: 'switch_to_email',
            description: 'Send as email instead',
            costImpact: -estimatedCost + 10, // Email costs ~10 cents
          },
        ],
      };
    }

    if (estimatedCost > budget.restrictions.maxCostPerMessage) {
      return {
        allowed: false,
        reason: `Message cost (${estimatedCost} cents) exceeds maximum allowed (${budget.restrictions.maxCostPerMessage} cents)`,
        budgetRemaining: budget.periods.current.remaining,
        requiresApproval: true,
        autoApproved: false,
      };
    }

    // Check budget availability
    if (estimatedCost > budget.periods.current.remaining) {
      // Check for emergency allowance or priority override
      if (priority === 'critical' && budget.overrides.priorityOverride) {
        await this.logBudgetOverride(tenantId, estimatedCost, 'Priority override for critical message');
        return {
          allowed: true,
          reason: 'Critical message - budget override applied',
          budgetRemaining: budget.periods.current.remaining,
          requiresApproval: false,
          autoApproved: true,
        };
      }

      if (budget.overrides.emergencyAllowance >= estimatedCost) {
        await this.useEmergencyAllowance(tenantId, estimatedCost);
        return {
          allowed: true,
          reason: 'Emergency allowance used',
          budgetRemaining: budget.periods.current.remaining,
          requiresApproval: false,
          autoApproved: true,
        };
      }

      return {
        allowed: false,
        reason: 'Insufficient budget remaining',
        budgetRemaining: budget.periods.current.remaining,
        requiresApproval: estimatedCost <= budget.restrictions.requireApprovalOver,
        autoApproved: false,
        alternatives: [
          {
            action: 'wait_for_budget_reset',
            description: `Wait until budget resets (${budget.periods.current.daysLeft} days)`,
            costImpact: 0,
          },
          {
            action: 'request_budget_increase',
            description: 'Request budget increase approval',
            costImpact: 0,
          },
        ],
      };
    }

    // Check if approval is required
    const requiresApproval = estimatedCost > budget.restrictions.requireApprovalOver;

    return {
      allowed: true,
      budgetRemaining: budget.periods.current.remaining - estimatedCost,
      requiresApproval,
      autoApproved: !requiresApproval,
    };
  }

  /**
   * Consume budget for a message send
   */
  async consumeBudget(
    tenantId: string,
    actualCost: number,
    messageType: string,
    userId?: string
  ): Promise<{
    success: boolean;
    newBudgetRemaining: number;
    alertsTriggered: BudgetAlert[];
  }> {
    const alertsTriggered: BudgetAlert[] = [];

    // Record the spend
    await this.recordSpend(tenantId, actualCost, messageType, userId);

    // Get updated budget status
    const budget = await this.getBudgetStatus(tenantId);

    // Check for alert triggers
    const percentageUsed = (budget.periods.current.spent / budget.limits.amount) * 100;

    if (percentageUsed >= budget.alerts.criticalThreshold) {
      const alert = await this.triggerBudgetAlert(tenantId, 'critical', percentageUsed);
      alertsTriggered.push(alert);

      // Auto-stop if configured
      if (budget.alerts.autoStopAtLimit) {
        await this.activateBudgetStop(tenantId);
      }
    } else if (percentageUsed >= budget.alerts.warningThreshold) {
      const alert = await this.triggerBudgetAlert(tenantId, 'warning', percentageUsed);
      alertsTriggered.push(alert);
    }

    // Check forecast alerts
    if (budget.periods.forecast.estimatedOverage > 0) {
      const forecastAlert = await this.triggerForecastAlert(tenantId, budget.periods.forecast);
      alertsTriggered.push(forecastAlert);
    }

    return {
      success: true,
      newBudgetRemaining: budget.periods.current.remaining,
      alertsTriggered,
    };
  }

  /**
   * Update budget configuration
   */
  async updateBudgetConfiguration(
    tenantId: string,
    updates: Partial<SMSBudget>
  ): Promise<void> {
    const currentBudget = await this.getBudgetStatus(tenantId);

    const updatedConfig = {
      tenant_id: tenantId,
      budget_type: updates.budgetType || currentBudget.budgetType,
      limits: { ...currentBudget.limits, ...updates.limits },
      alerts: { ...currentBudget.alerts, ...updates.alerts },
      overrides: { ...currentBudget.overrides, ...updates.overrides },
      restrictions: { ...currentBudget.restrictions, ...updates.restrictions },
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('sms_budgets')
      .upsert(updatedConfig, {
        onConflict: 'tenant_id'
      });

    if (error) {
      console.error('Failed to update budget configuration:', error);
      throw error;
    }

    // Log budget change
    await this.logBudgetChange(tenantId, currentBudget, updates);
  }

  /**
   * Request budget increase or overage approval
   */
  async requestBudgetApproval(
    tenantId: string,
    request: Omit<BudgetRequest, 'id' | 'tenantId' | 'requestedAt' | 'status'>
  ): Promise<BudgetRequest> {
    const budgetRequest: BudgetRequest = {
      id: crypto.randomUUID(),
      tenantId,
      ...request,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    // Check for auto-approval rules
    const autoApprovalRule = await this.checkAutoApprovalRules(tenantId, budgetRequest);

    if (autoApprovalRule) {
      budgetRequest.status = 'approved';
      budgetRequest.reviewedAt = new Date().toISOString();
      budgetRequest.reviewedBy = 'system';
      budgetRequest.reviewComments = `Auto-approved by rule: ${autoApprovalRule.ruleName}`;
      budgetRequest.autoApprovalRules = autoApprovalRule;

      // Apply the approval immediately
      await this.applyBudgetApproval(tenantId, budgetRequest);
    }

    // Save request
    const { error } = await this.supabase
      .from('sms_budget_requests')
      .insert({
        id: budgetRequest.id,
        tenant_id: budgetRequest.tenantId,
        request_type: budgetRequest.requestType,
        requested_amount: budgetRequest.requestedAmount,
        current_limit: budgetRequest.currentLimit,
        justification: budgetRequest.justification,
        business_case: budgetRequest.businessCase,
        requested_by: budgetRequest.requestedBy,
        requested_at: budgetRequest.requestedAt,
        status: budgetRequest.status,
        reviewed_by: budgetRequest.reviewedBy,
        reviewed_at: budgetRequest.reviewedAt,
        review_comments: budgetRequest.reviewComments,
        auto_approval_rules: budgetRequest.autoApprovalRules,
      });

    if (error) {
      console.error('Failed to save budget request:', error);
      throw error;
    }

    return budgetRequest;
  }

  /**
   * Generate budget optimization suggestions
   */
  async generateOptimizationSuggestions(tenantId: string): Promise<BudgetOptimizationSuggestion[]> {
    const budget = await this.getBudgetStatus(tenantId);
    const suggestions: BudgetOptimizationSuggestion[] = [];

    // High-cost, low-efficiency suggestions
    if (budget.analytics.efficiency > 1000) { // $10 per engagement
      suggestions.push({
        type: 'improve_efficiency',
        priority: 'high',
        title: 'Improve SMS Engagement Efficiency',
        description: 'Your current cost per engagement is high. Focus on better targeting and message optimization.',
        impact: {
          costSavings: Math.round(budget.periods.current.spent * 0.3),
          efficiencyGain: 30,
          implementationTime: '1-2 weeks',
          effort: 'medium',
        },
        implementation: {
          steps: [
            'Enable user segmentation for SMS targeting',
            'Implement message compression to reduce costs',
            'Switch low-engagement users to cheaper channels',
            'A/B test message templates for better response rates',
          ],
          requirements: [
            'Update notification preferences system',
            'Implement channel optimization service',
            'Set up engagement tracking',
          ],
          risks: [
            'Temporary reduction in message volume',
            'Potential user experience changes',
          ],
          monitoring: [
            'Track engagement rates weekly',
            'Monitor cost per engagement',
            'Measure user satisfaction scores',
          ],
        },
        metrics: {
          baseline: {
            costPerEngagement: budget.analytics.efficiency,
            engagementRate: 25, // Would get from actual data
          },
          targets: {
            costPerEngagement: budget.analytics.efficiency * 0.7,
            engagementRate: 35,
          },
          kpis: [
            'Cost per engagement',
            'SMS response rate',
            'Channel distribution',
            'User satisfaction',
          ],
        },
      });
    }

    // Budget utilization suggestions
    if (budget.analytics.utilizationRate < 60) {
      suggestions.push({
        type: 'reallocate_budget',
        priority: 'medium',
        title: 'Optimize Budget Allocation',
        description: 'You\'re under-utilizing your SMS budget. Consider reallocating to high-performing campaigns.',
        impact: {
          costSavings: 0,
          efficiencyGain: 25,
          implementationTime: '1 week',
          effort: 'low',
        },
        implementation: {
          steps: [
            'Analyze highest-performing message types',
            'Increase frequency for successful campaigns',
            'Reduce budget for underperforming segments',
            'Implement dynamic budget reallocation',
          ],
          requirements: [
            'Performance analytics system',
            'Campaign tracking capabilities',
          ],
          risks: [
            'Over-messaging high-value users',
            'Missing optimization opportunities',
          ],
          monitoring: [
            'Track budget utilization daily',
            'Monitor campaign performance',
            'Measure overall ROI improvement',
          ],
        },
        metrics: {
          baseline: {
            utilizationRate: budget.analytics.utilizationRate,
            avgCampaignROI: 150, // Would calculate from actual data
          },
          targets: {
            utilizationRate: 85,
            avgCampaignROI: 200,
          },
          kpis: [
            'Budget utilization rate',
            'Campaign ROI',
            'Message effectiveness',
          ],
        },
      });
    }

    // Forecasted overage suggestions
    if (budget.periods.forecast.estimatedOverage > 0) {
      suggestions.push({
        type: 'reduce_costs',
        priority: 'high',
        title: 'Prevent Budget Overage',
        description: `You're projected to exceed budget by $${(budget.periods.forecast.estimatedOverage / 100).toFixed(2)} this period.`,
        impact: {
          costSavings: budget.periods.forecast.estimatedOverage,
          efficiencyGain: 0,
          implementationTime: 'Immediate',
          effort: 'low',
        },
        implementation: {
          steps: [
            'Enable automatic cost optimization',
            'Reduce message frequency for low-priority notifications',
            'Switch to cheaper channels for non-urgent messages',
            'Implement stricter budget controls',
          ],
          requirements: [
            'Channel optimization system',
            'Automated budget controls',
          ],
          risks: [
            'Reduced notification reach',
            'Potential user experience impact',
          ],
          monitoring: [
            'Daily budget tracking',
            'Message delivery rates',
            'User engagement levels',
          ],
        },
        metrics: {
          baseline: {
            projectedOverage: budget.periods.forecast.estimatedOverage,
            currentBurnRate: budget.periods.forecast.burnRate,
          },
          targets: {
            projectedOverage: 0,
            currentBurnRate: budget.periods.forecast.burnRate * 0.8,
          },
          kpis: [
            'Budget adherence',
            'Daily burn rate',
            'Cost optimization savings',
          ],
        },
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get budget alerts for a tenant
   */
  async getBudgetAlerts(
    tenantId: string,
    unacknowledgedOnly: boolean = false
  ): Promise<BudgetAlert[]> {
    const query = this.supabase
      .from('sms_budget_alerts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('triggered_at', { ascending: false });

    if (unacknowledgedOnly) {
      query.is('acknowledged_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get budget alerts:', error);
      throw error;
    }

    return (data || []).map(this.mapBudgetAlertData);
  }

  /**
   * Acknowledge a budget alert
   */
  async acknowledgeBudgetAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const { error } = await this.supabase
      .from('sms_budget_alerts')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: acknowledgedBy,
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to acknowledge budget alert:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async createDefaultBudget(tenantId: string): Promise<SMSBudget> {
    const defaultBudget = {
      tenant_id: tenantId,
      budget_type: 'monthly',
      limits: {
        amount: 10000, // $100
        messages: 1000,
      },
      alerts: {
        warningThreshold: 80,
        criticalThreshold: 95,
        autoStopAtLimit: true,
        notifyEmails: [],
      },
      overrides: {
        emergencyAllowance: 2000, // $20
        priorityOverride: true,
        approvedOverages: [],
      },
      restrictions: {
        blockedUserSegments: [],
        blockedMessageTypes: [],
        maxCostPerMessage: 2000, // $20
        requireApprovalOver: 10000, // $100
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('sms_budgets')
      .insert(defaultBudget);

    if (error) {
      console.error('Failed to create default budget:', error);
      throw error;
    }

    return await this.getBudgetStatus(tenantId);
  }

  private async getCurrentPeriodSpending(
    tenantId: string,
    budgetType: string
  ): Promise<SMSBudget['periods']['current']> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (budgetType) {
      case 'monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const { data: spending } = await this.supabase
      .rpc('get_period_sms_spending', {
        p_tenant_id: tenantId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

    const spent = spending?.[0]?.total_cost || 0;
    const messagesUsed = spending?.[0]?.total_messages || 0;

    // Get budget limit
    const { data: budgetData } = await this.supabase
      .from('sms_budgets')
      .select('limits')
      .eq('tenant_id', tenantId)
      .single();

    const budgetLimit = budgetData?.limits?.amount || 10000;
    const messageLimit = budgetData?.limits?.messages || 1000;

    return {
      spent,
      messagesUsed,
      remaining: Math.max(0, budgetLimit - spent),
      daysLeft: Math.max(0, differenceInDays(endDate, now)),
    };
  }

  private async calculateSpendingForecast(
    tenantId: string,
    currentPeriod: SMSBudget['periods']['current']
  ): Promise<SMSBudget['periods']['forecast']> {
    // Calculate burn rate based on days elapsed in period
    const daysElapsed = 30 - currentPeriod.daysLeft; // Assuming monthly budget
    const burnRate = daysElapsed > 0 ? currentPeriod.spent / daysElapsed : 0;

    // Project for remaining days
    const projectedSpend = currentPeriod.spent + (burnRate * currentPeriod.daysLeft);
    const projectedMessages = Math.round(projectedSpend / (currentPeriod.spent / Math.max(currentPeriod.messagesUsed, 1)));

    // Get budget limit for overage calculation
    const { data: budgetData } = await this.supabase
      .from('sms_budgets')
      .select('limits')
      .eq('tenant_id', tenantId)
      .single();

    const budgetLimit = budgetData?.limits?.amount || 10000;
    const estimatedOverage = Math.max(0, projectedSpend - budgetLimit);

    return {
      projectedSpend: Math.round(projectedSpend),
      projectedMessages,
      burnRate: Math.round(burnRate),
      estimatedOverage: Math.round(estimatedOverage),
    };
  }

  private async calculateBudgetAnalytics(tenantId: string): Promise<SMSBudget['analytics']> {
    // Get historical data for analytics
    const { data: historicalData } = await this.supabase
      .rpc('get_sms_budget_analytics', {
        p_tenant_id: tenantId,
        p_months: 6,
      });

    const analytics = historicalData?.[0] || {};

    return {
      efficiency: analytics.avg_cost_per_engagement || 500,
      utilizationRate: analytics.avg_utilization_rate || 70,
      savingsFromOptimization: analytics.total_savings || 0,
      historicalAverages: {
        monthlySpend: analytics.avg_monthly_spend || 5000,
        messagesPerMonth: analytics.avg_messages_per_month || 500,
        costPerMessage: analytics.avg_cost_per_message || 1000,
      },
    };
  }

  private async recordSpend(
    tenantId: string,
    amount: number,
    messageType: string,
    userId?: string
  ): Promise<void> {
    await this.supabase
      .from('sms_budget_transactions')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        user_id: userId,
        message_type: messageType,
        amount_cents: amount,
        transaction_type: 'spend',
        created_at: new Date().toISOString(),
      });
  }

  private async triggerBudgetAlert(
    tenantId: string,
    type: 'warning' | 'critical',
    percentageUsed: number
  ): Promise<BudgetAlert> {
    const budget = await this.getBudgetStatus(tenantId);

    const alert: BudgetAlert = {
      id: crypto.randomUUID(),
      tenantId,
      type,
      severity: type === 'critical' ? 'critical' : 'warning',
      title: `SMS Budget ${type === 'critical' ? 'Critical' : 'Warning'} Alert`,
      message: `SMS budget is ${Math.round(percentageUsed)}% used (${budget.periods.current.spent} / ${budget.limits.amount} cents)`,
      data: {
        currentSpend: budget.periods.current.spent,
        budgetLimit: budget.limits.amount,
        percentageUsed: Math.round(percentageUsed),
        daysRemaining: budget.periods.current.daysLeft,
      },
      actions: this.generateBudgetAlertActions(type, budget),
      triggeredAt: new Date().toISOString(),
    };

    // Save alert
    await this.supabase
      .from('sms_budget_alerts')
      .insert({
        id: alert.id,
        tenant_id: alert.tenantId,
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        alert_data: alert.data,
        actions: alert.actions,
        triggered_at: alert.triggeredAt,
      });

    return alert;
  }

  private async triggerForecastAlert(
    tenantId: string,
    forecast: SMSBudget['periods']['forecast']
  ): Promise<BudgetAlert> {
    const alert: BudgetAlert = {
      id: crypto.randomUUID(),
      tenantId,
      type: 'forecast_warning',
      severity: 'warning',
      title: 'Budget Overage Forecast',
      message: `Based on current spending, you may exceed budget by $${(forecast.estimatedOverage / 100).toFixed(2)}`,
      data: {
        currentSpend: 0, // Would calculate current spend
        budgetLimit: 0, // Would get from budget
        percentageUsed: 0,
        projectedOverage: forecast.estimatedOverage,
      },
      actions: [
        {
          type: 'optimize_channels',
          title: 'Optimize Channel Usage',
          description: 'Switch to more cost-effective channels',
          estimatedImpact: `Save up to $${(forecast.estimatedOverage * 0.5 / 100).toFixed(2)}`,
        },
        {
          type: 'reduce_spending',
          title: 'Reduce Message Frequency',
          description: 'Temporarily reduce non-critical notifications',
          estimatedImpact: `Save up to $${(forecast.estimatedOverage * 0.7 / 100).toFixed(2)}`,
        },
      ],
      triggeredAt: new Date().toISOString(),
    };

    await this.supabase
      .from('sms_budget_alerts')
      .insert({
        id: alert.id,
        tenant_id: alert.tenantId,
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        alert_data: alert.data,
        actions: alert.actions,
        triggered_at: alert.triggeredAt,
      });

    return alert;
  }

  private generateBudgetAlertActions(
    type: 'warning' | 'critical',
    budget: SMSBudget
  ): BudgetAlert['actions'] {
    const actions: BudgetAlert['actions'] = [];

    if (type === 'warning') {
      actions.push(
        {
          type: 'optimize_channels',
          title: 'Enable Cost Optimization',
          description: 'Automatically switch to cheaper channels for non-critical messages',
          estimatedImpact: 'Save 20-30% on remaining budget',
        },
        {
          type: 'reduce_spending',
          title: 'Reduce Message Frequency',
          description: 'Temporarily reduce non-essential notifications',
          estimatedImpact: 'Extend budget by 7-10 days',
        },
      );
    } else {
      actions.push(
        {
          type: 'increase_budget',
          title: 'Request Budget Increase',
          description: 'Submit request for additional budget allocation',
          estimatedImpact: 'Continue current messaging volume',
        },
        {
          type: 'approve_overage',
          title: 'Approve Emergency Overage',
          description: 'Use emergency allowance for critical messages only',
          estimatedImpact: `Additional $${(budget.overrides.emergencyAllowance / 100).toFixed(2)} available`,
        },
      );
    }

    return actions;
  }

  private async activateBudgetStop(tenantId: string): Promise<void> {
    // Set budget stop flag
    await this.supabase
      .from('sms_budgets')
      .update({
        budget_stopped: true,
        stopped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId);

    // Log the action
    await this.supabase
      .from('sms_budget_transactions')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        transaction_type: 'budget_stop',
        amount_cents: 0,
        description: 'Automatic budget stop activated due to limit reached',
        created_at: new Date().toISOString(),
      });
  }

  private async logBudgetOverride(
    tenantId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    await this.supabase
      .from('sms_budget_transactions')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        transaction_type: 'override',
        amount_cents: amount,
        description: reason,
        created_at: new Date().toISOString(),
      });
  }

  private async useEmergencyAllowance(tenantId: string, amount: number): Promise<void> {
    // Reduce emergency allowance
    await this.supabase
      .rpc('use_emergency_allowance', {
        p_tenant_id: tenantId,
        p_amount: amount,
      });

    // Log the usage
    await this.supabase
      .from('sms_budget_transactions')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        transaction_type: 'emergency_allowance',
        amount_cents: amount,
        description: 'Emergency allowance used',
        created_at: new Date().toISOString(),
      });
  }

  private async checkAutoApprovalRules(
    tenantId: string,
    request: BudgetRequest
  ): Promise<{ ruleId: string; ruleName: string; appliedAt: string } | null> {
    // Simplified auto-approval logic
    if (request.requestType === 'increase_limit' && request.requestedAmount <= 5000) {
      return {
        ruleId: 'small_increase_auto_approval',
        ruleName: 'Auto-approve increases under $50',
        appliedAt: new Date().toISOString(),
      };
    }

    if (request.requestType === 'emergency_allowance' && request.requestedAmount <= 2000) {
      return {
        ruleId: 'emergency_auto_approval',
        ruleName: 'Auto-approve emergency allowances under $20',
        appliedAt: new Date().toISOString(),
      };
    }

    return null;
  }

  private async applyBudgetApproval(tenantId: string, request: BudgetRequest): Promise<void> {
    switch (request.requestType) {
      case 'increase_limit':
        await this.supabase
          .rpc('increase_budget_limit', {
            p_tenant_id: tenantId,
            p_additional_amount: request.requestedAmount,
          });
        break;

      case 'emergency_allowance':
        await this.supabase
          .rpc('add_emergency_allowance', {
            p_tenant_id: tenantId,
            p_amount: request.requestedAmount,
          });
        break;

      case 'approve_overage':
        await this.supabase
          .from('sms_budgets')
          .update({
            approved_overages: this.supabase.rpc('array_append', {
              arr: 'approved_overages',
              elem: {
                amount: request.requestedAmount,
                reason: request.justification,
                approvedBy: request.reviewedBy,
                approvedAt: request.reviewedAt,
                expiresAt: addDays(new Date(), 30).toISOString(),
              },
            }),
          })
          .eq('tenant_id', tenantId);
        break;
    }
  }

  private async logBudgetChange(
    tenantId: string,
    oldBudget: SMSBudget,
    changes: Partial<SMSBudget>
  ): Promise<void> {
    await this.supabase
      .from('sms_budget_history')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        old_config: oldBudget,
        new_config: changes,
        changed_at: new Date().toISOString(),
      });
  }

  private mapBudgetAlertData(data: any): BudgetAlert {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      type: data.alert_type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      data: data.alert_data,
      actions: data.actions || [],
      triggeredAt: data.triggered_at,
      acknowledgedAt: data.acknowledged_at,
      resolvedAt: data.resolved_at,
      autoActions: data.auto_actions || [],
    };
  }
}

export default SMSBudgetService;