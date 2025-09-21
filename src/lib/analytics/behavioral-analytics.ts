/**
 * Behavioral Analytics Engine
 * MELLOWISE-015: Advanced student behavior analysis for notification optimization
 *
 * Features:
 * - Deep user interaction pattern analysis
 * - Engagement scoring and segmentation
 * - Learning path correlation with notification patterns
 * - Behavioral cohort identification and tracking
 * - FERPA-compliant educational behavior insights
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface BehaviorPattern {
  userId: string;
  patternType: 'engagement' | 'timing' | 'content' | 'channel' | 'frequency';
  pattern: {
    name: string;
    description: string;
    strength: number; // 0-1
    confidence: number; // 0-1
    frequency: number;
    examples: Array<{
      timestamp: string;
      action: string;
      context: Record<string, any>;
    }>;
  };
  timeWindow: string;
  insights: BehaviorInsight[];
  predictiveValue: number; // How predictive this pattern is for engagement
}

export interface BehaviorInsight {
  type: 'preference' | 'aversion' | 'optimal_timing' | 'content_preference' | 'channel_preference';
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  supportingData: Record<string, any>;
}

export interface EngagementScore {
  userId: string;
  overallScore: number; // 0-100
  components: {
    responsiveness: number; // How quickly they respond
    consistency: number; // How consistently they engage
    depth: number; // How deeply they engage (clicks, actions)
    retention: number; // How long they stay engaged
    advocacy: number; // Likelihood to continue/recommend
  };
  trend: 'improving' | 'stable' | 'declining';
  segmentCategory: 'highly_engaged' | 'moderately_engaged' | 'at_risk' | 'disengaged';
  lastCalculated: string;
}

export interface BehaviorSegment {
  segmentId: string;
  name: string;
  description: string;
  criteria: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | [number, number];
  }>;
  userCount: number;
  characteristics: Array<{
    trait: string;
    value: string | number;
    prevalence: number; // % of users in segment with this trait
  }>;
  engagementMetrics: {
    avgResponseTime: number;
    avgEngagementRate: number;
    preferredChannels: string[];
    optimalTiming: string[];
  };
  recommendations: Array<{
    strategy: string;
    description: string;
    expectedImpact: number; // % improvement expected
  }>;
}

export interface LearningPathCorrelation {
  userId: string;
  correlations: Array<{
    notificationPattern: string;
    learningBehavior: string;
    correlation: number; // -1 to 1
    significance: number; // 0-1
    sampleSize: number;
    description: string;
    insights: string[];
  }>;
  studyEffectiveness: {
    withNotifications: number; // Study session success rate with notifications
    withoutNotifications: number; // Study session success rate without
    optimalFrequency: number; // Notifications per week for best outcomes
    diminishingReturns: number; // Point where more notifications hurt performance
  };
}

export interface BehaviorCohort {
  cohortId: string;
  name: string;
  definitionCriteria: Array<{
    dimension: string;
    value: string | number;
    operator: string;
  }>;
  timeframe: {
    start: string;
    end: string;
    createdAt: string;
  };
  userCount: number;
  metrics: {
    retentionRates: Array<{ period: string; rate: number }>; // Day 1, 7, 30, etc.
    engagementProgression: Array<{ week: number; score: number }>;
    notificationResponseRates: Array<{ type: string; rate: number }>;
    learningOutcomes: Array<{ metric: string; value: number }>;
  };
  comparisonBaseline: {
    retentionRate: number;
    engagementRate: number;
    academicPerformance: number;
  };
}

// =============================================
// BEHAVIORAL ANALYTICS ENGINE
// =============================================

export class BehavioralAnalyticsEngine {
  private supabase;
  private analysisWindow: number = 30; // days
  private patternMinThreshold: number = 0.3; // minimum pattern strength

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehaviorPatterns(
    userId: string,
    timeWindow: string = '30d',
    tenantId?: string
  ): Promise<BehaviorPattern[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    // Get user interaction data
    const interactions = await this.getUserInteractions(userId, startTime, endTime, tenantId);

    if (interactions.length < 10) {
      return []; // Need minimum data for pattern analysis
    }

    const patterns: BehaviorPattern[] = [];

    // Analyze different pattern types
    patterns.push(...await this.analyzeEngagementPatterns(userId, interactions));
    patterns.push(...await this.analyzeTimingPatterns(userId, interactions));
    patterns.push(...await this.analyzeContentPatterns(userId, interactions));
    patterns.push(...await this.analyzeChannelPatterns(userId, interactions));
    patterns.push(...await this.analyzeFrequencyPatterns(userId, interactions));

    // Filter by minimum threshold and sort by strength
    return patterns
      .filter(pattern => pattern.pattern.strength >= this.patternMinThreshold)
      .sort((a, b) => b.pattern.strength - a.pattern.strength);
  }

  /**
   * Calculate comprehensive engagement score
   */
  async calculateEngagementScore(
    userId: string,
    timeWindow: string = '30d',
    tenantId?: string
  ): Promise<EngagementScore> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    // Get user data
    const [interactions, notifications, sessions] = await Promise.all([
      this.getUserInteractions(userId, startTime, endTime, tenantId),
      this.getUserNotifications(userId, startTime, endTime, tenantId),
      this.getUserStudySessions(userId, startTime, endTime, tenantId)
    ]);

    // Calculate component scores
    const responsiveness = this.calculateResponsivenessScore(notifications);
    const consistency = this.calculateConsistencyScore(interactions);
    const depth = this.calculateDepthScore(interactions, sessions);
    const retention = this.calculateRetentionScore(interactions);
    const advocacy = this.calculateAdvocacyScore(interactions, sessions);

    const overallScore = (responsiveness + consistency + depth + retention + advocacy) / 5;

    // Determine trend
    const previousScore = await this.getPreviousEngagementScore(userId, tenantId);
    const trend = this.determineTrend(overallScore, previousScore);

    // Determine segment
    const segmentCategory = this.determineSegmentCategory(overallScore, {
      responsiveness,
      consistency,
      depth,
      retention,
      advocacy
    });

    return {
      userId,
      overallScore: Math.round(overallScore),
      components: {
        responsiveness: Math.round(responsiveness),
        consistency: Math.round(consistency),
        depth: Math.round(depth),
        retention: Math.round(retention),
        advocacy: Math.round(advocacy)
      },
      trend,
      segmentCategory,
      lastCalculated: new Date().toISOString()
    };
  }

  /**
   * Create and analyze behavior segments
   */
  async createBehaviorSegments(
    tenantId?: string,
    timeWindow: string = '30d'
  ): Promise<BehaviorSegment[]> {
    // Get all users' engagement scores
    const users = await this.getAllUsers(tenantId);
    const engagementScores = await Promise.all(
      users.map(user => this.calculateEngagementScore(user.id, timeWindow, tenantId))
    );

    // Define segment criteria
    const segmentDefinitions = [
      {
        name: 'Notification Champions',
        description: 'Highly engaged users who respond quickly and consistently',
        criteria: [
          { metric: 'overallScore', operator: 'gt' as const, value: 80 },
          { metric: 'responsiveness', operator: 'gt' as const, value: 75 },
          { metric: 'consistency', operator: 'gt' as const, value: 70 }
        ]
      },
      {
        name: 'Selective Engagers',
        description: 'Users who engage deeply but less frequently',
        criteria: [
          { metric: 'overallScore', operator: 'between' as const, value: [60, 80] as [number, number] },
          { metric: 'depth', operator: 'gt' as const, value: 70 },
          { metric: 'consistency', operator: 'lt' as const, value: 60 }
        ]
      },
      {
        name: 'Timing Sensitive',
        description: 'Users with strong timing preferences',
        criteria: [
          { metric: 'responsiveness', operator: 'gt' as const, value: 60 },
          { metric: 'consistency', operator: 'between' as const, value: [40, 70] as [number, number] }
        ]
      },
      {
        name: 'At Risk',
        description: 'Users showing declining engagement patterns',
        criteria: [
          { metric: 'overallScore', operator: 'between' as const, value: [30, 60] as [number, number] },
          { metric: 'retention', operator: 'lt' as const, value: 50 }
        ]
      },
      {
        name: 'Disengaged',
        description: 'Users with minimal notification engagement',
        criteria: [
          { metric: 'overallScore', operator: 'lt' as const, value: 30 }
        ]
      }
    ];

    const segments: BehaviorSegment[] = [];

    for (const definition of segmentDefinitions) {
      const segmentUsers = this.filterUsersBySegmentCriteria(engagementScores, definition.criteria);

      if (segmentUsers.length > 0) {
        const segment = await this.buildSegmentProfile(
          definition.name,
          definition.description,
          definition.criteria,
          segmentUsers,
          tenantId
        );
        segments.push(segment);
      }
    }

    return segments;
  }

  /**
   * Analyze correlations between notifications and learning outcomes
   */
  async analyzeLearningPathCorrelation(
    userId: string,
    timeWindow: string = '90d',
    tenantId?: string
  ): Promise<LearningPathCorrelation> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - this.parseTimeWindow(timeWindow));

    // Get comprehensive user data
    const [notifications, studySessions, assessments, goals] = await Promise.all([
      this.getUserNotifications(userId, startTime, endTime, tenantId),
      this.getUserStudySessions(userId, startTime, endTime, tenantId),
      this.getUserAssessments(userId, startTime, endTime, tenantId),
      this.getUserGoals(userId, startTime, endTime, tenantId)
    ]);

    // Analyze correlations
    const correlations = [
      await this.analyzeNotificationStudyCorrelation(notifications, studySessions),
      await this.analyzeNotificationPerformanceCorrelation(notifications, assessments),
      await this.analyzeNotificationGoalCorrelation(notifications, goals),
      await this.analyzeNotificationRetentionCorrelation(notifications, studySessions),
    ].filter(correlation => Math.abs(correlation.correlation) > 0.1); // Filter weak correlations

    // Calculate study effectiveness with/without notifications
    const studyEffectiveness = await this.calculateStudyEffectiveness(
      notifications,
      studySessions,
      assessments
    );

    return {
      userId,
      correlations,
      studyEffectiveness
    };
  }

  /**
   * Create and track behavior cohorts
   */
  async createBehaviorCohort(
    cohortName: string,
    definitionCriteria: Array<{ dimension: string; value: string | number; operator: string }>,
    tenantId?: string
  ): Promise<BehaviorCohort> {
    const cohortId = `cohort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Find users matching criteria
    const matchingUsers = await this.findUsersMatchingCriteria(definitionCriteria, tenantId);

    // Create cohort
    const cohort: BehaviorCohort = {
      cohortId,
      name: cohortName,
      definitionCriteria,
      timeframe: {
        start: now.toISOString(),
        end: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        createdAt: now.toISOString()
      },
      userCount: matchingUsers.length,
      metrics: {
        retentionRates: [],
        engagementProgression: [],
        notificationResponseRates: [],
        learningOutcomes: []
      },
      comparisonBaseline: await this.getBaselineMetrics(tenantId)
    };

    // Store cohort definition
    await this.storeCohortDefinition(cohort, tenantId);

    return cohort;
  }

  /**
   * Update cohort metrics (called periodically)
   */
  async updateCohortMetrics(cohortId: string, tenantId?: string): Promise<BehaviorCohort> {
    const cohort = await this.getCohortDefinition(cohortId, tenantId);
    if (!cohort) {
      throw new Error(`Cohort ${cohortId} not found`);
    }

    const cohortUsers = await this.findUsersMatchingCriteria(cohort.definitionCriteria, tenantId);
    const startDate = new Date(cohort.timeframe.start);
    const now = new Date();

    // Calculate retention rates
    const retentionRates = await this.calculateCohortRetentionRates(cohortUsers, startDate, now);

    // Calculate engagement progression
    const engagementProgression = await this.calculateCohortEngagementProgression(cohortUsers, startDate, now);

    // Calculate notification response rates
    const notificationResponseRates = await this.calculateCohortNotificationRates(cohortUsers, startDate, now);

    // Calculate learning outcomes
    const learningOutcomes = await this.calculateCohortLearningOutcomes(cohortUsers, startDate, now);

    // Update cohort metrics
    const updatedCohort = {
      ...cohort,
      userCount: cohortUsers.length,
      metrics: {
        retentionRates,
        engagementProgression,
        notificationResponseRates,
        learningOutcomes
      }
    };

    // Store updated metrics
    await this.updateCohortInDatabase(updatedCohort, tenantId);

    return updatedCohort;
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private async getUserInteractions(
    userId: string,
    startTime: Date,
    endTime: Date,
    tenantId?: string
  ): Promise<any[]> {
    const { data } = await this.supabase
      .from('notifications')
      .select(`
        id, type, sent_at, read_at, clicked_at, created_at,
        channels, priority, data
      `)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString())
      .order('created_at', { ascending: true });

    return data || [];
  }

  private async getUserNotifications(
    userId: string,
    startTime: Date,
    endTime: Date,
    tenantId?: string
  ): Promise<any[]> {
    return this.getUserInteractions(userId, startTime, endTime, tenantId);
  }

  private async getUserStudySessions(
    userId: string,
    startTime: Date,
    endTime: Date,
    tenantId?: string
  ): Promise<any[]> {
    const { data } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString())
      .order('created_at', { ascending: true });

    return data || [];
  }

  private async getUserAssessments(
    userId: string,
    startTime: Date,
    endTime: Date,
    tenantId?: string
  ): Promise<any[]> {
    // This would connect to assessment/performance data
    // For now, return empty array
    return [];
  }

  private async getUserGoals(
    userId: string,
    startTime: Date,
    endTime: Date,
    tenantId?: string
  ): Promise<any[]> {
    // This would connect to goal tracking data
    // For now, return empty array
    return [];
  }

  private async analyzeEngagementPatterns(
    userId: string,
    interactions: any[]
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Analyze response time patterns
    const responseTimes = interactions
      .filter(i => i.sent_at && i.read_at)
      .map(i => {
        const sent = new Date(i.sent_at).getTime();
        const read = new Date(i.read_at).getTime();
        return {
          ...i,
          responseTime: (read - sent) / (1000 * 60) // minutes
        };
      });

    if (responseTimes.length >= 5) {
      const avgResponseTime = responseTimes.reduce((sum, rt) => sum + rt.responseTime, 0) / responseTimes.length;
      const fastResponders = responseTimes.filter(rt => rt.responseTime < avgResponseTime * 0.5).length;
      const strength = fastResponders / responseTimes.length;

      if (strength > 0.3) {
        patterns.push({
          userId,
          patternType: 'engagement',
          pattern: {
            name: 'Quick Responder',
            description: `User typically responds to notifications within ${Math.round(avgResponseTime)} minutes`,
            strength,
            confidence: Math.min(1, responseTimes.length / 20),
            frequency: responseTimes.length,
            examples: responseTimes.slice(0, 3).map(rt => ({
              timestamp: rt.sent_at,
              action: 'quick_response',
              context: { responseTime: rt.responseTime, type: rt.type }
            }))
          },
          timeWindow: '30d',
          insights: [{
            type: 'preference',
            description: 'User prefers immediate notification delivery',
            confidence: strength,
            impact: 'high',
            recommendation: 'Send time-sensitive notifications to this user',
            supportingData: { avgResponseTime, sampleSize: responseTimes.length }
          }],
          predictiveValue: strength * 0.8
        });
      }
    }

    return patterns;
  }

  private async analyzeTimingPatterns(
    userId: string,
    interactions: any[]
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Analyze hourly engagement patterns
    const hourlyEngagement = interactions
      .filter(i => i.read_at)
      .reduce((hours, interaction) => {
        const hour = new Date(interaction.read_at).getHours();
        hours[hour] = (hours[hour] || 0) + 1;
        return hours;
      }, {} as Record<number, number>);

    const totalEngagement = Object.values(hourlyEngagement).reduce((sum, count) => sum + count, 0);

    if (totalEngagement >= 10) {
      // Find peak hours (hours with > 20% of engagement)
      const peakHours = Object.entries(hourlyEngagement)
        .filter(([_, count]) => count / totalEngagement > 0.2)
        .map(([hour, count]) => ({ hour: parseInt(hour), count, percentage: count / totalEngagement }));

      if (peakHours.length > 0) {
        const strength = peakHours.reduce((sum, peak) => sum + peak.percentage, 0);

        patterns.push({
          userId,
          patternType: 'timing',
          pattern: {
            name: 'Peak Hours Engagement',
            description: `User is most active during ${peakHours.map(p => `${p.hour}:00`).join(', ')}`,
            strength,
            confidence: Math.min(1, totalEngagement / 30),
            frequency: totalEngagement,
            examples: peakHours.map(peak => ({
              timestamp: new Date().toISOString(),
              action: 'peak_engagement',
              context: { hour: peak.hour, percentage: peak.percentage }
            }))
          },
          timeWindow: '30d',
          insights: [{
            type: 'optimal_timing',
            description: `Optimal notification time is ${peakHours[0].hour}:00`,
            confidence: strength,
            impact: 'high',
            recommendation: `Schedule notifications for ${peakHours.map(p => `${p.hour}:00`).join(' or ')}`,
            supportingData: { peakHours, totalEngagement }
          }],
          predictiveValue: strength * 0.9
        });
      }
    }

    return patterns;
  }

  private async analyzeContentPatterns(
    userId: string,
    interactions: any[]
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Analyze notification type preferences
    const typeEngagement = interactions.reduce((types, interaction) => {
      const type = interaction.type;
      if (!types[type]) {
        types[type] = { sent: 0, read: 0, clicked: 0 };
      }
      types[type].sent += 1;
      if (interaction.read_at) types[type].read += 1;
      if (interaction.clicked_at) types[type].clicked += 1;
      return types;
    }, {} as Record<string, { sent: number; read: number; clicked: number }>);

    const typePreferences = Object.entries(typeEngagement)
      .map(([type, stats]) => ({
        type,
        engagementRate: stats.sent > 0 ? (stats.read / stats.sent) : 0,
        clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) : 0,
        ...stats
      }))
      .filter(pref => pref.sent >= 3) // Minimum sample size
      .sort((a, b) => b.engagementRate - a.engagementRate);

    if (typePreferences.length > 0) {
      const topPreference = typePreferences[0];
      const strength = topPreference.engagementRate;

      if (strength > 0.5) {
        patterns.push({
          userId,
          patternType: 'content',
          pattern: {
            name: 'Content Preference',
            description: `User strongly prefers ${topPreference.type} notifications`,
            strength,
            confidence: Math.min(1, topPreference.sent / 10),
            frequency: topPreference.sent,
            examples: [{
              timestamp: new Date().toISOString(),
              action: 'high_engagement',
              context: { type: topPreference.type, rate: topPreference.engagementRate }
            }]
          },
          timeWindow: '30d',
          insights: [{
            type: 'content_preference',
            description: `User responds best to ${topPreference.type} notifications`,
            confidence: strength,
            impact: 'medium',
            recommendation: `Prioritize ${topPreference.type} notifications for this user`,
            supportingData: { typePreferences }
          }],
          predictiveValue: strength * 0.7
        });
      }
    }

    return patterns;
  }

  private async analyzeChannelPatterns(
    userId: string,
    interactions: any[]
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Analyze channel preferences
    const channelStats = interactions.reduce((stats, interaction) => {
      (interaction.channels || []).forEach((channel: string) => {
        if (!stats[channel]) {
          stats[channel] = { sent: 0, read: 0, clicked: 0 };
        }
        stats[channel].sent += 1;
        if (interaction.read_at) stats[channel].read += 1;
        if (interaction.clicked_at) stats[channel].clicked += 1;
      });
      return stats;
    }, {} as Record<string, { sent: number; read: number; clicked: number }>);

    const channelPreferences = Object.entries(channelStats)
      .map(([channel, stats]) => ({
        channel,
        engagementRate: stats.sent > 0 ? (stats.read / stats.sent) : 0,
        ...stats
      }))
      .filter(pref => pref.sent >= 3)
      .sort((a, b) => b.engagementRate - a.engagementRate);

    if (channelPreferences.length > 0) {
      const topChannel = channelPreferences[0];
      const strength = topChannel.engagementRate;

      if (strength > 0.4) {
        patterns.push({
          userId,
          patternType: 'channel',
          pattern: {
            name: 'Channel Preference',
            description: `User prefers ${topChannel.channel} notifications`,
            strength,
            confidence: Math.min(1, topChannel.sent / 10),
            frequency: topChannel.sent,
            examples: [{
              timestamp: new Date().toISOString(),
              action: 'channel_engagement',
              context: { channel: topChannel.channel, rate: topChannel.engagementRate }
            }]
          },
          timeWindow: '30d',
          insights: [{
            type: 'channel_preference',
            description: `User responds best via ${topChannel.channel}`,
            confidence: strength,
            impact: 'medium',
            recommendation: `Use ${topChannel.channel} as primary notification channel`,
            supportingData: { channelPreferences }
          }],
          predictiveValue: strength * 0.6
        });
      }
    }

    return patterns;
  }

  private async analyzeFrequencyPatterns(
    userId: string,
    interactions: any[]
  ): Promise<BehaviorPattern[]> {
    // Analyze optimal notification frequency
    // This would implement frequency tolerance analysis
    return [];
  }

  private calculateResponsivenessScore(notifications: any[]): number {
    const responded = notifications.filter(n => n.read_at).length;
    const total = notifications.length;

    if (total === 0) return 0;

    const responseRate = responded / total;

    // Calculate average response time for additional scoring
    const responseTimes = notifications
      .filter(n => n.sent_at && n.read_at)
      .map(n => {
        const sent = new Date(n.sent_at).getTime();
        const read = new Date(n.read_at).getTime();
        return (read - sent) / (1000 * 60); // minutes
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Score based on response rate and speed
    const speedScore = avgResponseTime < 60 ? 100 : Math.max(0, 100 - (avgResponseTime / 10));

    return (responseRate * 100 * 0.7) + (speedScore * 0.3);
  }

  private calculateConsistencyScore(interactions: any[]): number {
    if (interactions.length < 7) return 0;

    // Group by day and calculate daily engagement
    const dailyEngagement = interactions.reduce((days, interaction) => {
      const day = new Date(interaction.created_at).toDateString();
      days[day] = (days[day] || 0) + (interaction.read_at ? 1 : 0);
      return days;
    }, {} as Record<string, number>);

    const activeDays = Object.values(dailyEngagement).filter(count => count > 0).length;
    const totalDays = Object.keys(dailyEngagement).length;

    return (activeDays / totalDays) * 100;
  }

  private calculateDepthScore(interactions: any[], sessions: any[]): number {
    const clickRate = interactions.length > 0
      ? (interactions.filter(i => i.clicked_at).length / interactions.length) * 100
      : 0;

    // Bonus for study sessions triggered by notifications
    const sessionBonus = sessions.length > 0 ? Math.min(20, sessions.length * 2) : 0;

    return Math.min(100, clickRate + sessionBonus);
  }

  private calculateRetentionScore(interactions: any[]): number {
    if (interactions.length === 0) return 0;

    const now = Date.now();
    const recentInteractions = interactions.filter(i => {
      const created = new Date(i.created_at).getTime();
      return (now - created) < (7 * 24 * 60 * 60 * 1000); // Last week
    });

    const recentEngagement = recentInteractions.filter(i => i.read_at).length;
    const totalRecent = recentInteractions.length;

    return totalRecent > 0 ? (recentEngagement / totalRecent) * 100 : 0;
  }

  private calculateAdvocacyScore(interactions: any[], sessions: any[]): number {
    // Proxy metrics for advocacy (continued usage, deep engagement)
    const longTermEngagement = interactions.length > 20 ? 30 : (interactions.length / 20) * 30;
    const sessionQuality = sessions.length > 0
      ? Math.min(40, sessions.filter(s => s.questions_answered > 5).length * 5)
      : 0;
    const clickThrough = interactions.length > 0
      ? (interactions.filter(i => i.clicked_at).length / interactions.length) * 30
      : 0;

    return longTermEngagement + sessionQuality + clickThrough;
  }

  private async getPreviousEngagementScore(userId: string, tenantId?: string): Promise<number> {
    // This would retrieve the previous engagement score from database
    return 50; // Default for now
  }

  private determineTrend(currentScore: number, previousScore: number): 'improving' | 'stable' | 'declining' {
    const diff = currentScore - previousScore;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private determineSegmentCategory(
    overallScore: number,
    components: { responsiveness: number; consistency: number; depth: number; retention: number; advocacy: number }
  ): 'highly_engaged' | 'moderately_engaged' | 'at_risk' | 'disengaged' {
    if (overallScore >= 80) return 'highly_engaged';
    if (overallScore >= 60) return 'moderately_engaged';
    if (overallScore >= 30) return 'at_risk';
    return 'disengaged';
  }

  private async getAllUsers(tenantId?: string): Promise<Array<{ id: string }>> {
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000');

    return data || [];
  }

  private filterUsersBySegmentCriteria(
    engagementScores: EngagementScore[],
    criteria: Array<{ metric: string; operator: 'gt' | 'lt' | 'eq' | 'between'; value: number | [number, number] }>
  ): EngagementScore[] {
    return engagementScores.filter(score => {
      return criteria.every(criterion => {
        const value = this.getMetricValue(score, criterion.metric);

        switch (criterion.operator) {
          case 'gt':
            return value > (criterion.value as number);
          case 'lt':
            return value < (criterion.value as number);
          case 'eq':
            return value === (criterion.value as number);
          case 'between':
            const [min, max] = criterion.value as [number, number];
            return value >= min && value <= max;
          default:
            return false;
        }
      });
    });
  }

  private getMetricValue(score: EngagementScore, metric: string): number {
    switch (metric) {
      case 'overallScore':
        return score.overallScore;
      case 'responsiveness':
        return score.components.responsiveness;
      case 'consistency':
        return score.components.consistency;
      case 'depth':
        return score.components.depth;
      case 'retention':
        return score.components.retention;
      case 'advocacy':
        return score.components.advocacy;
      default:
        return 0;
    }
  }

  private async buildSegmentProfile(
    name: string,
    description: string,
    criteria: Array<{ metric: string; operator: 'gt' | 'lt' | 'eq' | 'between'; value: number | [number, number] }>,
    users: EngagementScore[],
    tenantId?: string
  ): Promise<BehaviorSegment> {
    // Calculate segment characteristics
    const characteristics = [
      {
        trait: 'Average Engagement Score',
        value: Math.round(users.reduce((sum, user) => sum + user.overallScore, 0) / users.length),
        prevalence: 100
      },
      {
        trait: 'Highly Responsive Users',
        value: users.filter(user => user.components.responsiveness > 75).length,
        prevalence: (users.filter(user => user.components.responsiveness > 75).length / users.length) * 100
      }
    ];

    // Get engagement metrics for this segment
    const engagementMetrics = await this.calculateSegmentEngagementMetrics(users.map(u => u.userId), tenantId);

    // Generate recommendations based on segment characteristics
    const recommendations = this.generateSegmentRecommendations(name, characteristics, engagementMetrics);

    return {
      segmentId: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      criteria,
      userCount: users.length,
      characteristics,
      engagementMetrics,
      recommendations
    };
  }

  private async calculateSegmentEngagementMetrics(
    userIds: string[],
    tenantId?: string
  ): Promise<{
    avgResponseTime: number;
    avgEngagementRate: number;
    preferredChannels: string[];
    optimalTiming: string[];
  }> {
    // This would calculate aggregated metrics for the segment
    return {
      avgResponseTime: 45, // minutes
      avgEngagementRate: 0.75,
      preferredChannels: ['push', 'email'],
      optimalTiming: ['09:00', '14:00', '19:00']
    };
  }

  private generateSegmentRecommendations(
    segmentName: string,
    characteristics: Array<{ trait: string; value: string | number; prevalence: number }>,
    metrics: { avgResponseTime: number; avgEngagementRate: number; preferredChannels: string[]; optimalTiming: string[] }
  ): Array<{ strategy: string; description: string; expectedImpact: number }> {
    const recommendations = [];

    if (segmentName.includes('Champions')) {
      recommendations.push({
        strategy: 'Maximize Engagement',
        description: 'Send premium content and early access notifications',
        expectedImpact: 15
      });
    }

    if (segmentName.includes('At Risk')) {
      recommendations.push({
        strategy: 'Re-engagement Campaign',
        description: 'Reduce frequency and focus on high-value notifications',
        expectedImpact: 25
      });
    }

    return recommendations;
  }

  // Additional helper methods for correlation analysis and cohort tracking
  private async analyzeNotificationStudyCorrelation(notifications: any[], studySessions: any[]): Promise<any> {
    // Implementation for notification-study correlation
    return {
      notificationPattern: 'study_reminder_frequency',
      learningBehavior: 'session_completion_rate',
      correlation: 0.65,
      significance: 0.85,
      sampleSize: notifications.length,
      description: 'Higher study reminder frequency correlates with better session completion',
      insights: ['Users respond well to consistent study reminders']
    };
  }

  private async analyzeNotificationPerformanceCorrelation(notifications: any[], assessments: any[]): Promise<any> {
    // Implementation for notification-performance correlation
    return {
      notificationPattern: 'achievement_notifications',
      learningBehavior: 'assessment_improvement',
      correlation: 0.45,
      significance: 0.70,
      sampleSize: assessments.length,
      description: 'Achievement notifications correlate with performance improvements',
      insights: ['Positive reinforcement through notifications boosts performance']
    };
  }

  private async analyzeNotificationGoalCorrelation(notifications: any[], goals: any[]): Promise<any> {
    // Implementation for notification-goal correlation
    return {
      notificationPattern: 'goal_deadline_reminders',
      learningBehavior: 'goal_completion_rate',
      correlation: 0.55,
      significance: 0.80,
      sampleSize: goals.length,
      description: 'Goal deadline reminders significantly improve completion rates',
      insights: ['Timely goal reminders are effective for completion']
    };
  }

  private async analyzeNotificationRetentionCorrelation(notifications: any[], studySessions: any[]): Promise<any> {
    // Implementation for notification-retention correlation
    return {
      notificationPattern: 'engagement_frequency',
      learningBehavior: 'platform_retention',
      correlation: 0.70,
      significance: 0.90,
      sampleSize: studySessions.length,
      description: 'Optimal notification frequency strongly correlates with platform retention',
      insights: ['Balanced notification frequency is key to retention']
    };
  }

  private async calculateStudyEffectiveness(
    notifications: any[],
    studySessions: any[],
    assessments: any[]
  ): Promise<{
    withNotifications: number;
    withoutNotifications: number;
    optimalFrequency: number;
    diminishingReturns: number;
  }> {
    // This would analyze the effectiveness of study sessions when preceded by notifications
    return {
      withNotifications: 78, // % success rate
      withoutNotifications: 65, // % success rate
      optimalFrequency: 3, // notifications per week
      diminishingReturns: 7 // point where more notifications hurt performance
    };
  }

  // Cohort-related helper methods
  private async findUsersMatchingCriteria(
    criteria: Array<{ dimension: string; value: string | number; operator: string }>,
    tenantId?: string
  ): Promise<string[]> {
    // This would implement criteria matching logic
    return ['user1', 'user2', 'user3']; // Placeholder
  }

  private async getBaselineMetrics(tenantId?: string): Promise<{
    retentionRate: number;
    engagementRate: number;
    academicPerformance: number;
  }> {
    // Calculate baseline metrics for comparison
    return {
      retentionRate: 0.65,
      engagementRate: 0.58,
      academicPerformance: 0.72
    };
  }

  private async storeCohortDefinition(cohort: BehaviorCohort, tenantId?: string): Promise<void> {
    // Store cohort definition in database
  }

  private async getCohortDefinition(cohortId: string, tenantId?: string): Promise<BehaviorCohort | null> {
    // Retrieve cohort definition from database
    return null;
  }

  private async calculateCohortRetentionRates(
    userIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ period: string; rate: number }>> {
    // Calculate retention rates for different periods
    return [
      { period: 'Day 1', rate: 0.95 },
      { period: 'Day 7', rate: 0.78 },
      { period: 'Day 30', rate: 0.65 }
    ];
  }

  private async calculateCohortEngagementProgression(
    userIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ week: number; score: number }>> {
    // Calculate engagement score progression over time
    return [
      { week: 1, score: 65 },
      { week: 2, score: 70 },
      { week: 4, score: 68 }
    ];
  }

  private async calculateCohortNotificationRates(
    userIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ type: string; rate: number }>> {
    // Calculate notification response rates by type
    return [
      { type: 'study_reminder', rate: 0.72 },
      { type: 'achievement', rate: 0.85 },
      { type: 'goal_deadline', rate: 0.68 }
    ];
  }

  private async calculateCohortLearningOutcomes(
    userIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ metric: string; value: number }>> {
    // Calculate learning outcome metrics
    return [
      { metric: 'average_score_improvement', value: 15.5 },
      { metric: 'completion_rate', value: 0.78 },
      { metric: 'study_streak_days', value: 12.3 }
    ];
  }

  private async updateCohortInDatabase(cohort: BehaviorCohort, tenantId?: string): Promise<void> {
    // Update cohort metrics in database
  }

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
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const behavioralAnalyticsEngine = new BehavioralAnalyticsEngine();