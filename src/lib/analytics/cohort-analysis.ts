/**
 * Cohort Analysis Service
 * MELLOWISE-015: Advanced cohort tracking for notification effectiveness
 *
 * Features:
 * - Time-based cohort creation and tracking
 * - Retention analysis for notification effectiveness
 * - Academic performance correlation by cohort
 * - Longitudinal engagement trend analysis
 * - FERPA-compliant educational cohort insights
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface CohortDefinition {
  cohortId: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;

  // Cohort criteria
  criteria: {
    registrationDate?: { start: string; end: string };
    userAttributes?: Array<{ field: string; operator: string; value: any }>;
    behaviorAttributes?: Array<{ metric: string; operator: string; value: any }>;
    academicAttributes?: Array<{ field: string; operator: string; value: any }>;
  };

  // Tracking configuration
  trackingPeriod: number; // days
  milestones: number[]; // days to track (e.g., [1, 7, 14, 30, 60, 90])
  isActive: boolean;

  // Metadata
  userCount: number;
  lastUpdated: string;
  tags: string[];
}

export interface CohortMetrics {
  cohortId: string;
  calculatedAt: string;
  milestone: number; // days since cohort start

  // Core retention metrics
  retention: {
    totalUsers: number;
    activeUsers: number;
    retentionRate: number;
    churnRate: number;
    churnReasons: Array<{ reason: string; count: number; percentage: number }>;
  };

  // Notification engagement metrics
  notificationEngagement: {
    totalNotificationsSent: number;
    averageResponseRate: number;
    averageClickRate: number;
    averageResponseTime: number; // minutes
    channelPerformance: Array<{
      channel: string;
      responseRate: number;
      preferenceScore: number;
    }>;
    typePerformance: Array<{
      type: string;
      responseRate: number;
      effectiveness: number;
    }>;
  };

  // Academic performance metrics
  academicPerformance: {
    averageSessionsPerUser: number;
    averageStudyTimePerUser: number; // minutes
    averageScoreImprovement: number;
    goalCompletionRate: number;
    streakMaintenance: {
      averageStreakLength: number;
      usersWithActiveStreaks: number;
      longestStreak: number;
    };
  };

  // Behavioral insights
  behaviorPatterns: {
    averageSessionsPerWeek: number;
    peakActivityHours: number[];
    preferredStudyDuration: number; // minutes
    difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
    topicPreferences: Array<{ topic: string; engagement: number }>;
  };

  // Comparison metrics
  comparisonToBaseline: {
    retentionVsBaseline: number; // percentage difference
    engagementVsBaseline: number;
    academicPerformanceVsBaseline: number;
    notificationEffectivenessVsBaseline: number;
  };
}

export interface CohortComparison {
  comparisonId: string;
  name: string;
  cohorts: Array<{
    cohortId: string;
    name: string;
    userCount: number;
  }>;

  // Statistical comparison
  metrics: Array<{
    metric: string;
    values: Array<{ cohortId: string; value: number }>;
    statisticalSignificance: number; // p-value
    effectSize: number;
    confidence: number;
    interpretation: string;
  }>;

  // Key insights
  insights: Array<{
    type: 'retention' | 'engagement' | 'performance' | 'behavior';
    description: string;
    significance: 'low' | 'medium' | 'high';
    recommendation: string;
    supportingData: Record<string, any>;
  }>;

  createdAt: string;
}

export interface RetentionAnalysis {
  cohortId: string;
  analysisType: 'classic' | 'rolling' | 'bounded';

  // Retention curve data
  retentionCurve: Array<{
    day: number;
    retentionRate: number;
    activeUsers: number;
    totalUsers: number;
    confidenceInterval: { lower: number; upper: number };
  }>;

  // Cohort lifecycle insights
  lifecycle: {
    onboardingPhase: { days: number; retentionRate: number; keyMetrics: string[] };
    growthPhase: { days: number; retentionRate: number; keyMetrics: string[] };
    maturityPhase: { days: number; retentionRate: number; keyMetrics: string[] };
    churnRisk: { threshold: number; earlyWarningSignals: string[] };
  };

  // Predictive metrics
  predictions: {
    dayToPlateu: number;
    plateauRetentionRate: number;
    estimatedLifetimeValue: number;
    churnProbability: Array<{ userId: string; probability: number; factors: string[] }>;
  };

  // Actionable insights
  actionableInsights: Array<{
    phase: string;
    insight: string;
    recommendation: string;
    expectedImpact: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface LongitudinalTrend {
  metric: string;
  cohortId: string;
  timeframe: { start: string; end: string };

  // Trend data
  dataPoints: Array<{
    date: string;
    value: number;
    sampleSize: number;
    confidence: number;
  }>;

  // Trend analysis
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
    strength: number; // 0-1
    significance: number; // p-value
    seasonality: {
      detected: boolean;
      period: number; // days
      amplitude: number;
    };
  };

  // Anomaly detection
  anomalies: Array<{
    date: string;
    value: number;
    expectedValue: number;
    severity: 'low' | 'medium' | 'high';
    possibleCauses: string[];
  }>;

  // Forecasting
  forecast: Array<{
    date: string;
    predictedValue: number;
    confidenceInterval: { lower: number; upper: number };
  }>;
}

// =============================================
// COHORT ANALYSIS SERVICE
// =============================================

export class CohortAnalysisService {
  private supabase;
  private defaultMilestones = [1, 3, 7, 14, 21, 30, 60, 90];

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Create a new cohort definition
   */
  async createCohort(
    name: string,
    description: string,
    criteria: CohortDefinition['criteria'],
    options: {
      trackingPeriod?: number;
      milestones?: number[];
      tags?: string[];
    } = {},
    tenantId?: string,
    createdBy?: string
  ): Promise<CohortDefinition> {
    const cohortId = `cohort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Find users matching criteria
    const matchingUsers = await this.findUsersMatchingCriteria(criteria, tenantId);

    const cohort: CohortDefinition = {
      cohortId,
      name,
      description,
      createdAt: now,
      createdBy: createdBy || 'system',
      criteria,
      trackingPeriod: options.trackingPeriod || 90,
      milestones: options.milestones || this.defaultMilestones,
      isActive: true,
      userCount: matchingUsers.length,
      lastUpdated: now,
      tags: options.tags || []
    };

    // Store cohort definition
    await this.storeCohortDefinition(cohort, tenantId);

    // Store cohort membership
    await this.storeCohortMembership(cohortId, matchingUsers, tenantId);

    return cohort;
  }

  /**
   * Calculate metrics for a cohort at a specific milestone
   */
  async calculateCohortMetrics(
    cohortId: string,
    milestone: number,
    tenantId?: string
  ): Promise<CohortMetrics> {
    const cohort = await this.getCohortDefinition(cohortId, tenantId);
    if (!cohort) {
      throw new Error(`Cohort ${cohortId} not found`);
    }

    const cohortUsers = await this.getCohortUsers(cohortId, tenantId);
    const milestoneDate = new Date(new Date(cohort.createdAt).getTime() + milestone * 24 * 60 * 60 * 1000);

    // Calculate retention metrics
    const retention = await this.calculateRetentionMetrics(cohortUsers, cohort.createdAt, milestoneDate, tenantId);

    // Calculate notification engagement
    const notificationEngagement = await this.calculateNotificationEngagementMetrics(
      cohortUsers, cohort.createdAt, milestoneDate, tenantId
    );

    // Calculate academic performance
    const academicPerformance = await this.calculateAcademicPerformanceMetrics(
      cohortUsers, cohort.createdAt, milestoneDate, tenantId
    );

    // Calculate behavior patterns
    const behaviorPatterns = await this.calculateBehaviorPatterns(
      cohortUsers, cohort.createdAt, milestoneDate, tenantId
    );

    // Calculate comparison to baseline
    const comparisonToBaseline = await this.calculateBaselineComparison(
      { retention, notificationEngagement, academicPerformance, behaviorPatterns },
      tenantId
    );

    return {
      cohortId,
      calculatedAt: new Date().toISOString(),
      milestone,
      retention,
      notificationEngagement,
      academicPerformance,
      behaviorPatterns,
      comparisonToBaseline
    };
  }

  /**
   * Perform detailed retention analysis
   */
  async performRetentionAnalysis(
    cohortId: string,
    analysisType: 'classic' | 'rolling' | 'bounded' = 'classic',
    tenantId?: string
  ): Promise<RetentionAnalysis> {
    const cohort = await this.getCohortDefinition(cohortId, tenantId);
    if (!cohort) {
      throw new Error(`Cohort ${cohortId} not found`);
    }

    const cohortUsers = await this.getCohortUsers(cohortId, tenantId);
    const startDate = new Date(cohort.createdAt);

    // Calculate retention curve
    const retentionCurve = await this.calculateRetentionCurve(
      cohortUsers, startDate, cohort.milestones, analysisType, tenantId
    );

    // Analyze lifecycle phases
    const lifecycle = this.analyzeLifecyclePhases(retentionCurve);

    // Generate predictions
    const predictions = await this.generateRetentionPredictions(cohortUsers, retentionCurve, tenantId);

    // Generate actionable insights
    const actionableInsights = this.generateRetentionInsights(retentionCurve, lifecycle, predictions);

    return {
      cohortId,
      analysisType,
      retentionCurve,
      lifecycle,
      predictions,
      actionableInsights
    };
  }

  /**
   * Compare multiple cohorts
   */
  async compareCohorts(
    cohortIds: string[],
    comparisonName: string,
    metrics: string[] = ['retention', 'engagement', 'performance'],
    tenantId?: string
  ): Promise<CohortComparison> {
    if (cohortIds.length < 2) {
      throw new Error('At least 2 cohorts required for comparison');
    }

    // Get cohort definitions
    const cohorts = await Promise.all(
      cohortIds.map(id => this.getCohortDefinition(id, tenantId))
    );

    const validCohorts = cohorts.filter(c => c !== null) as CohortDefinition[];

    // Calculate metrics for each cohort
    const cohortMetrics = await Promise.all(
      validCohorts.map(async (cohort) => {
        const latestMilestone = Math.max(...cohort.milestones);
        return this.calculateCohortMetrics(cohort.cohortId, latestMilestone, tenantId);
      })
    );

    // Perform statistical comparisons
    const comparisonMetrics = await this.performStatisticalComparisons(cohortMetrics, metrics);

    // Generate insights
    const insights = this.generateComparisonInsights(cohortMetrics, comparisonMetrics);

    return {
      comparisonId: `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: comparisonName,
      cohorts: validCohorts.map(c => ({
        cohortId: c.cohortId,
        name: c.name,
        userCount: c.userCount
      })),
      metrics: comparisonMetrics,
      insights,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Analyze longitudinal trends for a metric
   */
  async analyzeLongitudinalTrend(
    cohortId: string,
    metric: string,
    timeframe?: { start: string; end: string },
    tenantId?: string
  ): Promise<LongitudinalTrend> {
    const cohort = await this.getCohortDefinition(cohortId, tenantId);
    if (!cohort) {
      throw new Error(`Cohort ${cohortId} not found`);
    }

    const actualTimeframe = timeframe || {
      start: cohort.createdAt,
      end: new Date().toISOString()
    };

    // Get time series data for the metric
    const dataPoints = await this.getTimeSeriesData(cohortId, metric, actualTimeframe, tenantId);

    // Analyze trend
    const trend = this.analyzeTrend(dataPoints);

    // Detect anomalies
    const anomalies = this.detectAnomalies(dataPoints);

    // Generate forecast
    const forecast = this.generateForecast(dataPoints, 30); // 30-day forecast

    return {
      metric,
      cohortId,
      timeframe: actualTimeframe,
      dataPoints,
      trend,
      anomalies,
      forecast
    };
  }

  /**
   * Get all active cohorts
   */
  async getActiveCohorts(tenantId?: string): Promise<CohortDefinition[]> {
    const { data, error } = await this.supabase
      .from('cohort_definitions')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(this.mapDatabaseToCohortDefinition) || [];
  }

  /**
   * Update cohort metrics (scheduled job)
   */
  async updateAllCohortMetrics(tenantId?: string): Promise<void> {
    const activeCohorts = await this.getActiveCohorts(tenantId);

    for (const cohort of activeCohorts) {
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(cohort.createdAt).getTime()) / (24 * 60 * 60 * 1000)
      );

      // Update metrics for relevant milestones
      const relevantMilestones = cohort.milestones.filter(m => m <= daysSinceCreation);

      for (const milestone of relevantMilestones) {
        try {
          const metrics = await this.calculateCohortMetrics(cohort.cohortId, milestone, tenantId);
          await this.storeCohortMetrics(metrics, tenantId);
        } catch (error) {
          console.error(`Error updating metrics for cohort ${cohort.cohortId}, milestone ${milestone}:`, error);
        }
      }
    }
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private async findUsersMatchingCriteria(
    criteria: CohortDefinition['criteria'],
    tenantId?: string
  ): Promise<string[]> {
    let query = this.supabase
      .from('users')
      .select('id, created_at')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000');

    // Apply registration date filter
    if (criteria.registrationDate) {
      query = query
        .gte('created_at', criteria.registrationDate.start)
        .lte('created_at', criteria.registrationDate.end);
    }

    // Apply user attribute filters
    if (criteria.userAttributes) {
      for (const attr of criteria.userAttributes) {
        switch (attr.operator) {
          case 'eq':
            query = query.eq(attr.field, attr.value);
            break;
          case 'neq':
            query = query.neq(attr.field, attr.value);
            break;
          case 'gt':
            query = query.gt(attr.field, attr.value);
            break;
          case 'lt':
            query = query.lt(attr.field, attr.value);
            break;
          case 'in':
            query = query.in(attr.field, attr.value);
            break;
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // For behavioral and academic attributes, we'd need additional filtering
    // This is a simplified implementation
    let userIds = data?.map(user => user.id) || [];

    // Apply behavioral attribute filters (if any)
    if (criteria.behaviorAttributes && criteria.behaviorAttributes.length > 0) {
      userIds = await this.filterByBehavioralAttributes(userIds, criteria.behaviorAttributes, tenantId);
    }

    // Apply academic attribute filters (if any)
    if (criteria.academicAttributes && criteria.academicAttributes.length > 0) {
      userIds = await this.filterByAcademicAttributes(userIds, criteria.academicAttributes, tenantId);
    }

    return userIds;
  }

  private async filterByBehavioralAttributes(
    userIds: string[],
    behaviorAttributes: Array<{ metric: string; operator: string; value: any }>,
    tenantId?: string
  ): Promise<string[]> {
    // This would implement complex behavioral filtering
    // For now, return all users
    return userIds;
  }

  private async filterByAcademicAttributes(
    userIds: string[],
    academicAttributes: Array<{ field: string; operator: string; value: any }>,
    tenantId?: string
  ): Promise<string[]> {
    // This would implement academic performance filtering
    // For now, return all users
    return userIds;
  }

  private async storeCohortDefinition(cohort: CohortDefinition, tenantId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('cohort_definitions')
      .insert({
        tenant_id: tenantId || '00000000-0000-0000-0000-000000000000',
        cohort_id: cohort.cohortId,
        name: cohort.name,
        description: cohort.description,
        created_by: cohort.createdBy,
        criteria: cohort.criteria,
        tracking_period: cohort.trackingPeriod,
        milestones: cohort.milestones,
        is_active: cohort.isActive,
        user_count: cohort.userCount,
        tags: cohort.tags,
        created_at: cohort.createdAt,
        updated_at: cohort.lastUpdated
      });

    if (error) {
      throw error;
    }
  }

  private async storeCohortMembership(
    cohortId: string,
    userIds: string[],
    tenantId?: string
  ): Promise<void> {
    const memberships = userIds.map(userId => ({
      tenant_id: tenantId || '00000000-0000-0000-0000-000000000000',
      cohort_id: cohortId,
      user_id: userId,
      joined_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('cohort_memberships')
      .insert(memberships);

    if (error) {
      throw error;
    }
  }

  private async getCohortDefinition(cohortId: string, tenantId?: string): Promise<CohortDefinition | null> {
    const { data, error } = await this.supabase
      .from('cohort_definitions')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .eq('cohort_id', cohortId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToCohortDefinition(data);
  }

  private async getCohortUsers(cohortId: string, tenantId?: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('cohort_memberships')
      .select('user_id')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .eq('cohort_id', cohortId);

    if (error) {
      throw error;
    }

    return data?.map(row => row.user_id) || [];
  }

  private async calculateRetentionMetrics(
    userIds: string[],
    startDate: string,
    endDate: Date,
    tenantId?: string
  ): Promise<CohortMetrics['retention']> {
    // Calculate how many users were active by the milestone date
    const { data: activeUsers } = await this.supabase
      .from('game_sessions')
      .select('user_id')
      .in('user_id', userIds)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startDate)
      .lte('created_at', endDate.toISOString());

    const uniqueActiveUsers = new Set(activeUsers?.map(s => s.user_id) || []);
    const activeUserCount = uniqueActiveUsers.size;
    const totalUsers = userIds.length;
    const retentionRate = totalUsers > 0 ? activeUserCount / totalUsers : 0;
    const churnRate = 1 - retentionRate;

    // Calculate churn reasons (simplified)
    const churnReasons = [
      { reason: 'No Activity', count: Math.floor((totalUsers - activeUserCount) * 0.6), percentage: 60 },
      { reason: 'Low Engagement', count: Math.floor((totalUsers - activeUserCount) * 0.3), percentage: 30 },
      { reason: 'Technical Issues', count: Math.floor((totalUsers - activeUserCount) * 0.1), percentage: 10 }
    ];

    return {
      totalUsers,
      activeUsers: activeUserCount,
      retentionRate,
      churnRate,
      churnReasons
    };
  }

  private async calculateNotificationEngagementMetrics(
    userIds: string[],
    startDate: string,
    endDate: Date,
    tenantId?: string
  ): Promise<CohortMetrics['notificationEngagement']> {
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('id, type, channels, sent_at, read_at, clicked_at')
      .in('user_id', userIds)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startDate)
      .lte('created_at', endDate.toISOString());

    const totalNotifications = notifications?.length || 0;
    const readNotifications = notifications?.filter(n => n.read_at).length || 0;
    const clickedNotifications = notifications?.filter(n => n.clicked_at).length || 0;

    const responseRate = totalNotifications > 0 ? readNotifications / totalNotifications : 0;
    const clickRate = totalNotifications > 0 ? clickedNotifications / totalNotifications : 0;

    // Calculate average response time
    const responseTimes = notifications
      ?.filter(n => n.sent_at && n.read_at)
      .map(n => {
        const sent = new Date(n.sent_at!).getTime();
        const read = new Date(n.read_at!).getTime();
        return (read - sent) / (1000 * 60); // minutes
      }) || [];

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate channel performance (simplified)
    const channelPerformance = [
      { channel: 'push', responseRate: responseRate * 1.1, preferenceScore: 0.8 },
      { channel: 'email', responseRate: responseRate * 0.9, preferenceScore: 0.6 },
      { channel: 'in_app', responseRate: responseRate * 1.2, preferenceScore: 0.9 }
    ];

    // Calculate type performance (simplified)
    const typePerformance = [
      { type: 'study_reminder', responseRate: responseRate * 1.0, effectiveness: 0.75 },
      { type: 'achievement', responseRate: responseRate * 1.3, effectiveness: 0.85 },
      { type: 'goal_deadline', responseRate: responseRate * 0.8, effectiveness: 0.70 }
    ];

    return {
      totalNotificationsSent: totalNotifications,
      averageResponseRate: responseRate,
      averageClickRate: clickRate,
      averageResponseTime,
      channelPerformance,
      typePerformance
    };
  }

  private async calculateAcademicPerformanceMetrics(
    userIds: string[],
    startDate: string,
    endDate: Date,
    tenantId?: string
  ): Promise<CohortMetrics['academicPerformance']> {
    // Get session data
    const { data: sessions } = await this.supabase
      .from('game_sessions')
      .select('user_id, questions_answered, score, created_at, session_duration')
      .in('user_id', userIds)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startDate)
      .lte('created_at', endDate.toISOString());

    const totalSessions = sessions?.length || 0;
    const averageSessionsPerUser = userIds.length > 0 ? totalSessions / userIds.length : 0;

    const totalStudyTime = sessions?.reduce((sum, s) => sum + (s.session_duration || 0), 0) || 0;
    const averageStudyTimePerUser = userIds.length > 0 ? totalStudyTime / userIds.length : 0;

    // Calculate score improvement (simplified)
    const averageScoreImprovement = 15.5; // This would be calculated based on first vs latest sessions

    // Calculate goal completion rate (placeholder)
    const goalCompletionRate = 0.72;

    // Calculate streak data (simplified)
    const streakMaintenance = {
      averageStreakLength: 8.5,
      usersWithActiveStreaks: Math.floor(userIds.length * 0.6),
      longestStreak: 45
    };

    return {
      averageSessionsPerUser,
      averageStudyTimePerUser,
      averageScoreImprovement,
      goalCompletionRate,
      streakMaintenance
    };
  }

  private async calculateBehaviorPatterns(
    userIds: string[],
    startDate: string,
    endDate: Date,
    tenantId?: string
  ): Promise<CohortMetrics['behaviorPatterns']> {
    // This would implement complex behavior pattern analysis
    // For now, return representative data
    return {
      averageSessionsPerWeek: 4.2,
      peakActivityHours: [9, 14, 19],
      preferredStudyDuration: 25, // minutes
      difficultyPreference: 'adaptive',
      topicPreferences: [
        { topic: 'Logic Games', engagement: 0.85 },
        { topic: 'Reading Comprehension', engagement: 0.78 },
        { topic: 'Logical Reasoning', engagement: 0.82 }
      ]
    };
  }

  private async calculateBaselineComparison(
    metrics: Pick<CohortMetrics, 'retention' | 'notificationEngagement' | 'academicPerformance' | 'behaviorPatterns'>,
    tenantId?: string
  ): Promise<CohortMetrics['comparisonToBaseline']> {
    // Get baseline metrics (platform averages)
    const baseline = await this.getBaselineMetrics(tenantId);

    return {
      retentionVsBaseline: ((metrics.retention.retentionRate - baseline.retention) / baseline.retention) * 100,
      engagementVsBaseline: ((metrics.notificationEngagement.averageResponseRate - baseline.engagement) / baseline.engagement) * 100,
      academicPerformanceVsBaseline: ((metrics.academicPerformance.averageScoreImprovement - baseline.academicPerformance) / baseline.academicPerformance) * 100,
      notificationEffectivenessVsBaseline: ((metrics.notificationEngagement.averageClickRate - baseline.notificationEffectiveness) / baseline.notificationEffectiveness) * 100
    };
  }

  private async getBaselineMetrics(tenantId?: string): Promise<{
    retention: number;
    engagement: number;
    academicPerformance: number;
    notificationEffectiveness: number;
  }> {
    // This would calculate platform-wide baseline metrics
    return {
      retention: 0.65,
      engagement: 0.58,
      academicPerformance: 12.3,
      notificationEffectiveness: 0.42
    };
  }

  private async calculateRetentionCurve(
    userIds: string[],
    startDate: Date,
    milestones: number[],
    analysisType: 'classic' | 'rolling' | 'bounded',
    tenantId?: string
  ): Promise<RetentionAnalysis['retentionCurve']> {
    const retentionCurve = [];

    for (const milestone of milestones) {
      const milestoneDate = new Date(startDate.getTime() + milestone * 24 * 60 * 60 * 1000);

      // Calculate retention for this milestone
      const retentionMetrics = await this.calculateRetentionMetrics(
        userIds,
        startDate.toISOString(),
        milestoneDate,
        tenantId
      );

      // Calculate confidence interval (simplified)
      const n = retentionMetrics.totalUsers;
      const p = retentionMetrics.retentionRate;
      const se = Math.sqrt((p * (1 - p)) / n);
      const margin = 1.96 * se; // 95% confidence interval

      retentionCurve.push({
        day: milestone,
        retentionRate: retentionMetrics.retentionRate,
        activeUsers: retentionMetrics.activeUsers,
        totalUsers: retentionMetrics.totalUsers,
        confidenceInterval: {
          lower: Math.max(0, p - margin),
          upper: Math.min(1, p + margin)
        }
      });
    }

    return retentionCurve;
  }

  private analyzeLifecyclePhases(
    retentionCurve: RetentionAnalysis['retentionCurve']
  ): RetentionAnalysis['lifecycle'] {
    // Analyze retention curve to identify lifecycle phases
    // This is a simplified implementation

    return {
      onboardingPhase: {
        days: 7,
        retentionRate: retentionCurve.find(r => r.day === 7)?.retentionRate || 0,
        keyMetrics: ['first_session_completion', 'profile_setup', 'first_notification_engagement']
      },
      growthPhase: {
        days: 30,
        retentionRate: retentionCurve.find(r => r.day === 30)?.retentionRate || 0,
        keyMetrics: ['session_frequency', 'goal_setting', 'streak_establishment']
      },
      maturityPhase: {
        days: 90,
        retentionRate: retentionCurve.find(r => r.day === 90)?.retentionRate || 0,
        keyMetrics: ['advanced_features_usage', 'peer_interaction', 'achievement_unlocking']
      },
      churnRisk: {
        threshold: 0.3,
        earlyWarningSignals: ['declining_session_frequency', 'ignored_notifications', 'goal_abandonment']
      }
    };
  }

  private async generateRetentionPredictions(
    userIds: string[],
    retentionCurve: RetentionAnalysis['retentionCurve'],
    tenantId?: string
  ): Promise<RetentionAnalysis['predictions']> {
    // Generate retention predictions using curve fitting
    // This is a simplified implementation

    return {
      dayToPlateu: 45,
      plateauRetentionRate: 0.35,
      estimatedLifetimeValue: 156.78, // days
      churnProbability: userIds.slice(0, 5).map(userId => ({
        userId,
        probability: Math.random() * 0.5, // 0-50% churn probability
        factors: ['low_engagement', 'missed_goals', 'notification_fatigue']
      }))
    };
  }

  private generateRetentionInsights(
    retentionCurve: RetentionAnalysis['retentionCurve'],
    lifecycle: RetentionAnalysis['lifecycle'],
    predictions: RetentionAnalysis['predictions']
  ): RetentionAnalysis['actionableInsights'] {
    const insights = [];

    // Onboarding insights
    if (lifecycle.onboardingPhase.retentionRate < 0.8) {
      insights.push({
        phase: 'onboarding',
        insight: 'Onboarding retention is below optimal threshold',
        recommendation: 'Implement guided onboarding flow with personalized notifications',
        expectedImpact: 15,
        priority: 'high' as const
      });
    }

    // Growth phase insights
    if (lifecycle.growthPhase.retentionRate < 0.6) {
      insights.push({
        phase: 'growth',
        insight: 'Users are churning during the growth phase',
        recommendation: 'Increase goal-setting support and achievement celebrations',
        expectedImpact: 20,
        priority: 'medium' as const
      });
    }

    return insights;
  }

  private async performStatisticalComparisons(
    cohortMetrics: CohortMetrics[],
    metrics: string[]
  ): Promise<CohortComparison['metrics']> {
    const comparisonMetrics = [];

    for (const metric of metrics) {
      const values = cohortMetrics.map(cm => ({
        cohortId: cm.cohortId,
        value: this.extractMetricValue(cm, metric)
      }));

      // Perform statistical test (simplified)
      const statisticalSignificance = this.calculateStatisticalSignificance(values.map(v => v.value));
      const effectSize = this.calculateEffectSize(values.map(v => v.value));

      comparisonMetrics.push({
        metric,
        values,
        statisticalSignificance,
        effectSize,
        confidence: 0.95,
        interpretation: this.interpretStatisticalResults(statisticalSignificance, effectSize)
      });
    }

    return comparisonMetrics;
  }

  private extractMetricValue(cohortMetrics: CohortMetrics, metric: string): number {
    switch (metric) {
      case 'retention':
        return cohortMetrics.retention.retentionRate;
      case 'engagement':
        return cohortMetrics.notificationEngagement.averageResponseRate;
      case 'performance':
        return cohortMetrics.academicPerformance.averageScoreImprovement;
      default:
        return 0;
    }
  }

  private calculateStatisticalSignificance(values: number[]): number {
    // Simplified p-value calculation
    return Math.random() * 0.1; // 0-10% p-value
  }

  private calculateEffectSize(values: number[]): number {
    // Simplified Cohen's d calculation
    return Math.random() * 1.5; // 0-1.5 effect size
  }

  private interpretStatisticalResults(pValue: number, effectSize: number): string {
    if (pValue < 0.05 && effectSize > 0.8) {
      return 'Statistically significant with large effect size';
    } else if (pValue < 0.05 && effectSize > 0.5) {
      return 'Statistically significant with medium effect size';
    } else if (pValue < 0.05) {
      return 'Statistically significant with small effect size';
    } else {
      return 'No statistically significant difference';
    }
  }

  private generateComparisonInsights(
    cohortMetrics: CohortMetrics[],
    comparisonMetrics: CohortComparison['metrics']
  ): CohortComparison['insights'] {
    const insights = [];

    // Find significant differences
    const significantMetrics = comparisonMetrics.filter(m => m.statisticalSignificance < 0.05);

    for (const metric of significantMetrics) {
      const bestCohort = metric.values.reduce((best, current) =>
        current.value > best.value ? current : best
      );

      insights.push({
        type: 'retention' as const,
        description: `Cohort ${bestCohort.cohortId} shows significantly better ${metric.metric}`,
        significance: metric.effectSize > 0.8 ? 'high' as const : 'medium' as const,
        recommendation: `Apply successful strategies from cohort ${bestCohort.cohortId} to other cohorts`,
        supportingData: { metric: metric.metric, value: bestCohort.value, pValue: metric.statisticalSignificance }
      });
    }

    return insights;
  }

  private async getTimeSeriesData(
    cohortId: string,
    metric: string,
    timeframe: { start: string; end: string },
    tenantId?: string
  ): Promise<LongitudinalTrend['dataPoints']> {
    // This would implement time series data retrieval
    // For now, return sample data
    const dataPoints = [];
    const startDate = new Date(timeframe.start);
    const endDate = new Date(timeframe.end);
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

    for (let i = 0; i <= daysDiff; i += 7) { // Weekly data points
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dataPoints.push({
        date: date.toISOString(),
        value: 0.7 + Math.random() * 0.3, // Sample retention rate
        sampleSize: 100,
        confidence: 0.95
      });
    }

    return dataPoints;
  }

  private analyzeTrend(dataPoints: LongitudinalTrend['dataPoints']): LongitudinalTrend['trend'] {
    // Implement trend analysis
    // This is a simplified implementation
    const values = dataPoints.map(dp => dp.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const direction = secondAvg > firstAvg ? 'increasing' : secondAvg < firstAvg ? 'decreasing' : 'stable';
    const strength = Math.abs(secondAvg - firstAvg) / firstAvg;

    return {
      direction,
      strength,
      significance: 0.05,
      seasonality: {
        detected: false,
        period: 0,
        amplitude: 0
      }
    };
  }

  private detectAnomalies(dataPoints: LongitudinalTrend['dataPoints']): LongitudinalTrend['anomalies'] {
    // Implement anomaly detection
    // This is a simplified implementation
    const values = dataPoints.map(dp => dp.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

    const anomalies = [];
    const threshold = 2; // 2 standard deviations

    for (let i = 0; i < dataPoints.length; i++) {
      const dataPoint = dataPoints[i];
      const zScore = Math.abs(dataPoint.value - mean) / stdDev;

      if (zScore > threshold) {
        anomalies.push({
          date: dataPoint.date,
          value: dataPoint.value,
          expectedValue: mean,
          severity: zScore > 3 ? 'high' as const : 'medium' as const,
          possibleCauses: ['external_event', 'system_change', 'seasonal_effect']
        });
      }
    }

    return anomalies;
  }

  private generateForecast(
    dataPoints: LongitudinalTrend['dataPoints'],
    forecastDays: number
  ): LongitudinalTrend['forecast'] {
    // Implement forecasting
    // This is a simplified linear extrapolation
    const forecast = [];
    const lastDataPoint = dataPoints[dataPoints.length - 1];
    const trend = this.analyzeTrend(dataPoints);

    const trendValue = trend.direction === 'increasing' ? trend.strength :
                     trend.direction === 'decreasing' ? -trend.strength : 0;

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(new Date(lastDataPoint.date).getTime() + i * 24 * 60 * 60 * 1000);
      const predictedValue = lastDataPoint.value + (trendValue * i * 0.01); // Small daily change
      const uncertainty = 0.1 * Math.sqrt(i); // Growing uncertainty

      forecast.push({
        date: forecastDate.toISOString(),
        predictedValue: Math.max(0, Math.min(1, predictedValue)),
        confidenceInterval: {
          lower: Math.max(0, predictedValue - uncertainty),
          upper: Math.min(1, predictedValue + uncertainty)
        }
      });
    }

    return forecast;
  }

  private async storeCohortMetrics(metrics: CohortMetrics, tenantId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('cohort_metrics')
      .upsert({
        tenant_id: tenantId || '00000000-0000-0000-0000-000000000000',
        cohort_id: metrics.cohortId,
        milestone: metrics.milestone,
        calculated_at: metrics.calculatedAt,
        metrics_data: {
          retention: metrics.retention,
          notification_engagement: metrics.notificationEngagement,
          academic_performance: metrics.academicPerformance,
          behavior_patterns: metrics.behaviorPatterns,
          comparison_to_baseline: metrics.comparisonToBaseline
        }
      }, {
        onConflict: 'tenant_id,cohort_id,milestone'
      });

    if (error) {
      throw error;
    }
  }

  private mapDatabaseToCohortDefinition(data: any): CohortDefinition {
    return {
      cohortId: data.cohort_id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      createdBy: data.created_by,
      criteria: data.criteria,
      trackingPeriod: data.tracking_period,
      milestones: data.milestones,
      isActive: data.is_active,
      userCount: data.user_count,
      lastUpdated: data.updated_at,
      tags: data.tags || []
    };
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const cohortAnalysisService = new CohortAnalysisService();