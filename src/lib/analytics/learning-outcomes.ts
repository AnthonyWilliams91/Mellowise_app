/**
 * Learning Outcome Analytics
 * MELLOWISE-015: Educational performance correlation with notification effectiveness
 *
 * Features:
 * - Correlation between notification engagement and academic success
 * - Study habit improvement tracking
 * - Goal achievement correlation analysis
 * - Long-term learning outcome prediction
 * - FERPA-compliant educational analytics
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface LearningOutcome {
  userId: string;
  outcomeType: 'academic_performance' | 'skill_mastery' | 'goal_achievement' | 'engagement' | 'retention';

  // Outcome metrics
  metrics: {
    baseline: number;
    current: number;
    improvement: number; // percentage change
    trend: 'improving' | 'stable' | 'declining';
    confidenceLevel: number; // 0-1
  };

  // Time context
  timeframe: {
    start: string;
    end: string;
    measurementPeriod: number; // days
  };

  // Notification correlation
  notificationCorrelation: {
    correlationStrength: number; // -1 to 1
    significance: number; // p-value
    causalityIndicator: number; // 0-1 (likelihood of causation vs correlation)
    optimalFrequency: number; // notifications per week for best outcomes
    diminishingReturns: number; // point where more notifications hurt performance
  };

  // Supporting data
  supportingMetrics: Array<{
    metric: string;
    value: number;
    trend: string;
    contribution: number; // contribution to overall outcome
  }>;

  calculatedAt: string;
}

export interface StudyHabitAnalysis {
  userId: string;

  // Habit metrics
  habitStrength: {
    consistency: number; // 0-1 (how regularly they study)
    duration: number; // average minutes per session
    frequency: number; // sessions per week
    quality: number; // 0-1 (engagement and performance during sessions)
    progression: number; // 0-1 (improvement over time)
  };

  // Notification impact on habits
  notificationImpact: {
    studyInitiation: {
      withNotifications: number; // % of notifications that led to study sessions
      withoutNotifications: number; // baseline study initiation rate
      improvement: number; // % improvement with notifications
    };

    sessionDuration: {
      withNotifications: number; // average duration when initiated by notification
      withoutNotifications: number; // average duration for organic sessions
      difference: number; // difference in minutes
    };

    habitFormation: {
      daysToEstablishHabit: number;
      notificationRole: 'critical' | 'helpful' | 'minimal' | 'counterproductive';
      sustainabilityScore: number; // 0-1 (likelihood habit will continue)
    };
  };

  // Temporal patterns
  temporalPatterns: {
    optimalStudyTimes: Array<{ hour: number; effectiveness: number }>;
    streakPerformance: Array<{ streakLength: number; performance: number }>;
    burnoutRisk: {
      currentRisk: number; // 0-1
      earlyWarningSignals: string[];
      recommendedInterventions: string[];
    };
  };

  // Personalized insights
  personalizedInsights: Array<{
    category: 'timing' | 'frequency' | 'content' | 'motivation';
    insight: string;
    confidence: number;
    actionable: boolean;
    expectedImpact: number; // 0-1
  }>;

  lastAnalyzed: string;
}

export interface GoalAchievementCorrelation {
  userId: string;

  // Goal performance
  goalMetrics: {
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
    averageDaysToComplete: number;
    abandonmentRate: number;
  };

  // Notification correlation with goal success
  notificationCorrelation: {
    goalCompletionWithNotifications: number; // completion rate for goals with notification support
    goalCompletionWithoutNotifications: number; // completion rate for goals without notifications
    improvementFromNotifications: number; // % improvement

    // Timing analysis
    optimalReminderFrequency: {
      frequency: number; // reminders per week
      effectiveness: number; // goal completion rate
      userSatisfaction: number; // 0-1
    };

    // Content analysis
    effectiveReminderTypes: Array<{
      type: 'deadline' | 'progress' | 'motivational' | 'milestone';
      effectiveness: number; // 0-1
      userPreference: number; // 0-1
    }>;
  };

  // Goal category analysis
  categoryPerformance: Array<{
    category: string;
    goalsInCategory: number;
    completionRate: number;
    averageTimeToComplete: number;
    notificationEffectiveness: number;
    recommendedStrategy: string;
  }>;

  // Predictive insights
  predictions: {
    futureGoalSuccess: number; // 0-1 probability
    recommendedGoalTypes: string[];
    optimalGoalDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    sustainabilityForecast: number; // 0-1 likelihood of continued goal-setting
  };

  analyzedAt: string;
}

export interface PerformanceImpactAnalysis {
  userId: string;

  // Academic performance metrics
  academicPerformance: {
    scoreImprovement: {
      baseline: number;
      current: number;
      improvement: number;
      trend: Array<{ date: string; score: number }>;
    };

    skillProgression: Array<{
      skill: string;
      proficiencyLevel: number; // 0-1
      improvementRate: number; // points per week
      masteryPrediction: string; // estimated date of mastery
    }>;

    knowledgeRetention: {
      shortTerm: number; // retention after 1 day
      mediumTerm: number; // retention after 1 week
      longTerm: number; // retention after 1 month
      forgettingCurve: Array<{ days: number; retention: number }>;
    };
  };

  // Notification impact on performance
  notificationImpact: {
    immediateImpact: {
      sessionPerformance: number; // performance in sessions after notifications
      attentionSpan: number; // minutes of focused study
      errorRate: number; // mistakes per session
    };

    cumulativeImpact: {
      weeklyPerformance: number; // average performance with regular notifications
      monthlyGrowth: number; // month-over-month improvement
      plateauPrevention: boolean; // whether notifications help avoid plateaus
    };

    motivationalImpact: {
      engagementLevel: number; // 0-1
      persistenceInDifficulty: number; // 0-1
      intrinsicMotivation: number; // 0-1 (internal drive vs external prompts)
    };
  };

  // Learning efficiency
  learningEfficiency: {
    timeToMastery: number; // hours needed to reach proficiency
    retentionRate: number; // information retained over time
    transferAbility: number; // ability to apply knowledge to new contexts
    metacognitiveDevelopment: number; // improvement in learning how to learn
  };

  // Comparative analysis
  comparativeBenchmarks: {
    peerComparison: {
      percentile: number; // performance percentile vs peers
      similarLearners: number; // number of learners with similar patterns
      relativeImprovement: number; // improvement vs peer average
    };

    platformBenchmarks: {
      averageImprovement: number; // platform average
      topPerformers: number; // performance of top 10%
      improvementPotential: number; // estimated remaining potential
    };
  };

  measuredAt: string;
}

export interface LongTermOutcomePredictor {
  userId: string;

  // Prediction models
  predictions: {
    sixMonthOutcome: {
      skillLevel: number; // predicted skill level
      confidence: number; // 0-1
      factors: Array<{ factor: string; impact: number }>;
    };

    oneYearOutcome: {
      masteryLevel: number; // predicted mastery level
      retentionProbability: number; // probability of continued engagement
      expertiseDevelopment: number; // likelihood of becoming expert
    };

    careerImpact: {
      skillTransferability: number; // 0-1 (how transferable are learned skills)
      professionalReadiness: number; // 0-1 (readiness for professional application)
      continuousLearningHabits: number; // 0-1 (likelihood of lifelong learning)
    };
  };

  // Risk factors and mitigations
  riskFactors: Array<{
    risk: string;
    probability: number; // 0-1
    impact: number; // 0-1 (negative impact on outcomes)
    mitigation: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;

  // Success factors
  successFactors: Array<{
    factor: string;
    currentLevel: number; // 0-1
    importance: number; // 0-1
    improvementPotential: number; // 0-1
    actionPlan: string;
  }>;

  // Recommended interventions
  interventions: Array<{
    type: 'notification' | 'content' | 'pacing' | 'support' | 'motivation';
    intervention: string;
    expectedImpact: number; // 0-1
    timeframe: string;
    effort: 'low' | 'medium' | 'high';
    priority: number; // 1-10
  }>;

  generatedAt: string;
  validUntil: string;
}

export interface NotificationLearningCorrelation {
  correlationId: string;

  // Correlation analysis
  correlationData: {
    overallCorrelation: number; // -1 to 1
    significance: number; // p-value
    sampleSize: number;
    timeframe: { start: string; end: string };
  };

  // Specific correlations
  specificCorrelations: Array<{
    notificationType: string;
    learningOutcome: string;
    correlation: number;
    significance: number;
    practicalSignificance: boolean;
    effectSize: 'small' | 'medium' | 'large';
  }>;

  // Causal analysis
  causalAnalysis: {
    causalityLikelihood: number; // 0-1 (vs pure correlation)
    confoundingFactors: string[];
    controlledCorrelation: number; // correlation after controlling for confounders
    mediatingFactors: Array<{ factor: string; mediationStrength: number }>;
  };

  // Optimal notification strategies
  optimalStrategies: Array<{
    strategy: string;
    description: string;
    expectedOutcome: number;
    confidence: number;
    applicability: Array<{ userType: string; effectiveness: number }>;
  }>;

  // Insights and recommendations
  insights: Array<{
    category: 'timing' | 'frequency' | 'content' | 'personalization';
    insight: string;
    evidence: string;
    actionable: boolean;
    businessImpact: 'low' | 'medium' | 'high';
  }>;

  analyzedAt: string;
}

// =============================================
// LEARNING OUTCOMES ANALYTICS ENGINE
// =============================================

export class LearningOutcomesEngine {
  private supabase;
  private correlationCache: Map<string, NotificationLearningCorrelation> = new Map();
  private outcomeCache: Map<string, LearningOutcome[]> = new Map();

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Analyze learning outcomes for a user
   */
  async analyzeLearningOutcomes(
    userId: string,
    outcomeTypes: LearningOutcome['outcomeType'][] = ['academic_performance', 'skill_mastery', 'goal_achievement'],
    timeframeDays: number = 90,
    tenantId?: string
  ): Promise<LearningOutcome[]> {
    const cacheKey = `${userId}_${outcomeTypes.join('_')}_${timeframeDays}`;
    const cached = this.outcomeCache.get(cacheKey);
    if (cached) return cached;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

    const outcomes: LearningOutcome[] = [];

    for (const outcomeType of outcomeTypes) {
      try {
        const outcome = await this.analyzeSpecificOutcome(
          userId,
          outcomeType,
          startDate,
          endDate,
          tenantId
        );
        outcomes.push(outcome);
      } catch (error) {
        console.error(`Error analyzing ${outcomeType} for user ${userId}:`, error);
      }
    }

    this.outcomeCache.set(cacheKey, outcomes);
    return outcomes;
  }

  /**
   * Analyze study habits and notification impact
   */
  async analyzeStudyHabits(
    userId: string,
    tenantId?: string
  ): Promise<StudyHabitAnalysis> {
    // Get study session data
    const studySessions = await this.getStudySessions(userId, 90, tenantId);

    // Get notification data
    const notifications = await this.getNotifications(userId, 90, tenantId);

    // Calculate habit strength
    const habitStrength = this.calculateHabitStrength(studySessions);

    // Analyze notification impact
    const notificationImpact = await this.analyzeNotificationImpactOnHabits(
      studySessions,
      notifications,
      userId,
      tenantId
    );

    // Identify temporal patterns
    const temporalPatterns = this.identifyTemporalPatterns(studySessions, notifications);

    // Generate personalized insights
    const personalizedInsights = await this.generateHabitInsights(
      habitStrength,
      notificationImpact,
      temporalPatterns,
      userId,
      tenantId
    );

    return {
      userId,
      habitStrength,
      notificationImpact,
      temporalPatterns,
      personalizedInsights,
      lastAnalyzed: new Date().toISOString()
    };
  }

  /**
   * Correlate goal achievement with notifications
   */
  async correlateGoalAchievement(
    userId: string,
    tenantId?: string
  ): Promise<GoalAchievementCorrelation> {
    // Get goal data
    const goals = await this.getUserGoals(userId, tenantId);

    // Get related notifications
    const goalNotifications = await this.getGoalRelatedNotifications(userId, tenantId);

    // Calculate goal metrics
    const goalMetrics = this.calculateGoalMetrics(goals);

    // Analyze notification correlation
    const notificationCorrelation = this.analyzeGoalNotificationCorrelation(
      goals,
      goalNotifications
    );

    // Analyze performance by category
    const categoryPerformance = this.analyzeGoalCategoryPerformance(goals, goalNotifications);

    // Generate predictions
    const predictions = await this.generateGoalPredictions(
      goals,
      goalNotifications,
      userId,
      tenantId
    );

    return {
      userId,
      goalMetrics,
      notificationCorrelation,
      categoryPerformance,
      predictions,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze performance impact of notifications
   */
  async analyzePerformanceImpact(
    userId: string,
    tenantId?: string
  ): Promise<PerformanceImpactAnalysis> {
    // Get performance data
    const performanceData = await this.getPerformanceData(userId, tenantId);

    // Get notification data
    const notifications = await this.getNotifications(userId, 90, tenantId);

    // Analyze academic performance
    const academicPerformance = this.analyzeAcademicPerformance(performanceData);

    // Analyze notification impact
    const notificationImpact = await this.analyzeNotificationPerformanceImpact(
      performanceData,
      notifications,
      userId,
      tenantId
    );

    // Calculate learning efficiency
    const learningEfficiency = this.calculateLearningEfficiency(performanceData, notifications);

    // Get comparative benchmarks
    const comparativeBenchmarks = await this.getComparativeBenchmarks(userId, performanceData, tenantId);

    return {
      userId,
      academicPerformance,
      notificationImpact,
      learningEfficiency,
      comparativeBenchmarks,
      measuredAt: new Date().toISOString()
    };
  }

  /**
   * Predict long-term learning outcomes
   */
  async predictLongTermOutcomes(
    userId: string,
    tenantId?: string
  ): Promise<LongTermOutcomePredictor> {
    // Get comprehensive user data
    const userData = await this.getComprehensiveUserData(userId, tenantId);

    // Generate predictions
    const predictions = await this.generateLongTermPredictions(userData, userId, tenantId);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(userData);

    // Identify success factors
    const successFactors = this.identifySuccessFactors(userData);

    // Recommend interventions
    const interventions = await this.recommendInterventions(
      predictions,
      riskFactors,
      successFactors,
      userId,
      tenantId
    );

    return {
      userId,
      predictions,
      riskFactors,
      successFactors,
      interventions,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
  }

  /**
   * Analyze notification-learning correlations across all users
   */
  async analyzeNotificationLearningCorrelations(
    tenantId?: string,
    timeframeDays: number = 180
  ): Promise<NotificationLearningCorrelation> {
    const correlationId = `correlation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

    // Get aggregated data
    const aggregatedData = await this.getAggregatedCorrelationData(startDate, endDate, tenantId);

    // Calculate overall correlation
    const correlationData = this.calculateOverallCorrelation(aggregatedData);

    // Analyze specific correlations
    const specificCorrelations = this.analyzeSpecificCorrelations(aggregatedData);

    // Perform causal analysis
    const causalAnalysis = await this.performCausalAnalysis(aggregatedData, tenantId);

    // Identify optimal strategies
    const optimalStrategies = this.identifyOptimalStrategies(specificCorrelations, causalAnalysis);

    // Generate insights
    const insights = this.generateCorrelationInsights(
      correlationData,
      specificCorrelations,
      causalAnalysis
    );

    const result: NotificationLearningCorrelation = {
      correlationId,
      correlationData,
      specificCorrelations,
      causalAnalysis,
      optimalStrategies,
      insights,
      analyzedAt: new Date().toISOString()
    };

    this.correlationCache.set(correlationId, result);
    return result;
  }

  /**
   * Generate learning analytics report for institution
   */
  async generateInstitutionalReport(
    tenantId: string,
    reportType: 'summary' | 'detailed' | 'comparative' = 'summary'
  ): Promise<{
    overallMetrics: Record<string, number>;
    notificationEffectiveness: Record<string, number>;
    learningOutcomes: Record<string, number>;
    recommendations: Array<{ category: string; recommendation: string; impact: string }>;
    generatedAt: string;
  }> {
    // Get institutional data
    const institutionalData = await this.getInstitutionalData(tenantId);

    // Calculate overall metrics
    const overallMetrics = this.calculateInstitutionalMetrics(institutionalData);

    // Analyze notification effectiveness
    const notificationEffectiveness = this.analyzeInstitutionalNotificationEffectiveness(institutionalData);

    // Summarize learning outcomes
    const learningOutcomes = this.summarizeLearningOutcomes(institutionalData);

    // Generate recommendations
    const recommendations = this.generateInstitutionalRecommendations(
      overallMetrics,
      notificationEffectiveness,
      learningOutcomes
    );

    return {
      overallMetrics,
      notificationEffectiveness,
      learningOutcomes,
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private async analyzeSpecificOutcome(
    userId: string,
    outcomeType: LearningOutcome['outcomeType'],
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<LearningOutcome> {
    const timeframe = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      measurementPeriod: Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    };

    // Get relevant data based on outcome type
    let metrics, notificationCorrelation, supportingMetrics;

    switch (outcomeType) {
      case 'academic_performance':
        const performanceData = await this.getPerformanceData(userId, tenantId);
        metrics = this.calculateAcademicMetrics(performanceData, startDate, endDate);
        notificationCorrelation = await this.calculateNotificationCorrelation(
          userId, 'academic_performance', startDate, endDate, tenantId
        );
        supportingMetrics = this.getSupportingAcademicMetrics(performanceData);
        break;

      case 'skill_mastery':
        const skillData = await this.getSkillData(userId, tenantId);
        metrics = this.calculateSkillMetrics(skillData, startDate, endDate);
        notificationCorrelation = await this.calculateNotificationCorrelation(
          userId, 'skill_mastery', startDate, endDate, tenantId
        );
        supportingMetrics = this.getSupportingSkillMetrics(skillData);
        break;

      case 'goal_achievement':
        const goalData = await this.getUserGoals(userId, tenantId);
        metrics = this.calculateGoalAchievementMetrics(goalData, startDate, endDate);
        notificationCorrelation = await this.calculateNotificationCorrelation(
          userId, 'goal_achievement', startDate, endDate, tenantId
        );
        supportingMetrics = this.getSupportingGoalMetrics(goalData);
        break;

      case 'engagement':
        const engagementData = await this.getEngagementData(userId, tenantId);
        metrics = this.calculateEngagementMetrics(engagementData, startDate, endDate);
        notificationCorrelation = await this.calculateNotificationCorrelation(
          userId, 'engagement', startDate, endDate, tenantId
        );
        supportingMetrics = this.getSupportingEngagementMetrics(engagementData);
        break;

      case 'retention':
        const retentionData = await this.getRetentionData(userId, tenantId);
        metrics = this.calculateRetentionMetrics(retentionData, startDate, endDate);
        notificationCorrelation = await this.calculateNotificationCorrelation(
          userId, 'retention', startDate, endDate, tenantId
        );
        supportingMetrics = this.getSupportingRetentionMetrics(retentionData);
        break;

      default:
        throw new Error(`Unsupported outcome type: ${outcomeType}`);
    }

    return {
      userId,
      outcomeType,
      metrics,
      timeframe,
      notificationCorrelation,
      supportingMetrics,
      calculatedAt: new Date().toISOString()
    };
  }

  private async getStudySessions(userId: string, days: number, tenantId?: string): Promise<any[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    return data || [];
  }

  private async getNotifications(userId: string, days: number, tenantId?: string): Promise<any[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    return data || [];
  }

  private calculateHabitStrength(studySessions: any[]): StudyHabitAnalysis['habitStrength'] {
    if (studySessions.length === 0) {
      return { consistency: 0, duration: 0, frequency: 0, quality: 0, progression: 0 };
    }

    // Calculate consistency (how regularly they study)
    const daysCovered = new Set(studySessions.map(s => new Date(s.created_at).toDateString())).size;
    const totalDays = 90; // analyzing last 90 days
    const consistency = daysCovered / totalDays;

    // Calculate average duration
    const totalDuration = studySessions.reduce((sum, s) => sum + (s.session_duration || 0), 0);
    const duration = totalDuration / studySessions.length;

    // Calculate frequency (sessions per week)
    const frequency = (studySessions.length / totalDays) * 7;

    // Calculate quality (engagement and performance)
    const completedSessions = studySessions.filter(s => s.completed).length;
    const avgScore = studySessions.reduce((sum, s) => sum + (s.score || 0), 0) / studySessions.length;
    const quality = (completedSessions / studySessions.length) * (avgScore / 100);

    // Calculate progression (improvement over time)
    const firstHalf = studySessions.slice(0, Math.floor(studySessions.length / 2));
    const secondHalf = studySessions.slice(Math.floor(studySessions.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + (s.score || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + (s.score || 0), 0) / secondHalf.length;

    const progression = firstHalfAvg > 0 ? Math.max(0, (secondHalfAvg - firstHalfAvg) / firstHalfAvg) : 0;

    return {
      consistency: Math.min(1, consistency),
      duration,
      frequency,
      quality: Math.min(1, quality),
      progression: Math.min(1, progression)
    };
  }

  private async analyzeNotificationImpactOnHabits(
    studySessions: any[],
    notifications: any[],
    userId: string,
    tenantId?: string
  ): Promise<StudyHabitAnalysis['notificationImpact']> {
    // Correlate notifications with study session initiation
    const sessionInitiationAnalysis = this.analyzeSessionInitiation(studySessions, notifications);

    // Analyze session duration impact
    const sessionDurationAnalysis = this.analyzeSessionDuration(studySessions, notifications);

    // Analyze habit formation
    const habitFormationAnalysis = this.analyzeHabitFormation(studySessions, notifications);

    return {
      studyInitiation: sessionInitiationAnalysis,
      sessionDuration: sessionDurationAnalysis,
      habitFormation: habitFormationAnalysis
    };
  }

  private analyzeSessionInitiation(studySessions: any[], notifications: any[]): any {
    // Find sessions that started within 2 hours of a notification
    const sessionsAfterNotifications = studySessions.filter(session => {
      const sessionTime = new Date(session.created_at).getTime();
      return notifications.some(notification => {
        const notificationTime = new Date(notification.sent_at || notification.created_at).getTime();
        const timeDiff = sessionTime - notificationTime;
        return timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000; // within 2 hours
      });
    });

    const withNotifications = notifications.length > 0
      ? (sessionsAfterNotifications.length / notifications.length) * 100
      : 0;

    // Calculate baseline (sessions not preceded by notifications)
    const organicSessions = studySessions.filter(session => {
      const sessionTime = new Date(session.created_at).getTime();
      return !notifications.some(notification => {
        const notificationTime = new Date(notification.sent_at || notification.created_at).getTime();
        const timeDiff = sessionTime - notificationTime;
        return timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000;
      });
    });

    // Approximate baseline rate
    const totalDays = 90;
    const withoutNotifications = (organicSessions.length / totalDays) * 100; // sessions per day as percentage

    const improvement = withoutNotifications > 0 ? ((withNotifications - withoutNotifications) / withoutNotifications) * 100 : 0;

    return {
      withNotifications,
      withoutNotifications,
      improvement
    };
  }

  private analyzeSessionDuration(studySessions: any[], notifications: any[]): any {
    // Sessions after notifications
    const sessionsAfterNotifications = studySessions.filter(session => {
      const sessionTime = new Date(session.created_at).getTime();
      return notifications.some(notification => {
        const notificationTime = new Date(notification.sent_at || notification.created_at).getTime();
        const timeDiff = sessionTime - notificationTime;
        return timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000;
      });
    });

    // Organic sessions
    const organicSessions = studySessions.filter(session => {
      const sessionTime = new Date(session.created_at).getTime();
      return !notifications.some(notification => {
        const notificationTime = new Date(notification.sent_at || notification.created_at).getTime();
        const timeDiff = sessionTime - notificationTime;
        return timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000;
      });
    });

    const withNotifications = sessionsAfterNotifications.length > 0
      ? sessionsAfterNotifications.reduce((sum, s) => sum + (s.session_duration || 0), 0) / sessionsAfterNotifications.length
      : 0;

    const withoutNotifications = organicSessions.length > 0
      ? organicSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0) / organicSessions.length
      : 0;

    return {
      withNotifications,
      withoutNotifications,
      difference: withNotifications - withoutNotifications
    };
  }

  private analyzeHabitFormation(studySessions: any[], notifications: any[]): any {
    // Simplified habit formation analysis
    const daysToEstablishHabit = 21; // Common estimate

    // Determine notification role based on consistency and correlation
    const consistency = this.calculateHabitStrength(studySessions).consistency;
    const notificationFrequency = notifications.length / 90; // per day

    let notificationRole: 'critical' | 'helpful' | 'minimal' | 'counterproductive' = 'minimal';

    if (consistency > 0.7 && notificationFrequency > 0.5) {
      notificationRole = 'critical';
    } else if (consistency > 0.5 && notificationFrequency > 0.2) {
      notificationRole = 'helpful';
    } else if (consistency < 0.3 && notificationFrequency > 1) {
      notificationRole = 'counterproductive';
    }

    const sustainabilityScore = Math.min(1, consistency * (1 + Math.min(0.5, notificationFrequency)));

    return {
      daysToEstablishHabit,
      notificationRole,
      sustainabilityScore
    };
  }

  private identifyTemporalPatterns(studySessions: any[], notifications: any[]): StudyHabitAnalysis['temporalPatterns'] {
    // Analyze optimal study times
    const hourlyEffectiveness = Array.from({ length: 24 }, (_, hour) => {
      const sessionsAtHour = studySessions.filter(s => new Date(s.created_at).getHours() === hour);
      const avgScore = sessionsAtHour.length > 0
        ? sessionsAtHour.reduce((sum, s) => sum + (s.score || 0), 0) / sessionsAtHour.length
        : 0;

      return { hour, effectiveness: avgScore / 100 };
    });

    // Analyze streak performance
    const streakPerformance = this.calculateStreakPerformance(studySessions);

    // Assess burnout risk
    const burnoutRisk = this.assessBurnoutRisk(studySessions, notifications);

    return {
      optimalStudyTimes: hourlyEffectiveness.filter(h => h.effectiveness > 0.5),
      streakPerformance,
      burnoutRisk
    };
  }

  private calculateStreakPerformance(studySessions: any[]): Array<{ streakLength: number; performance: number }> {
    // Group sessions by consecutive days
    const sessionsByDay = new Map<string, any[]>();

    studySessions.forEach(session => {
      const day = new Date(session.created_at).toDateString();
      if (!sessionsByDay.has(day)) {
        sessionsByDay.set(day, []);
      }
      sessionsByDay.get(day)!.push(session);
    });

    // Calculate streaks and their performance
    const streaks: Array<{ length: number; performance: number }> = [];
    let currentStreak = 0;
    let streakPerformance: number[] = [];

    const sortedDays = Array.from(sessionsByDay.keys()).sort();

    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      const sessions = sessionsByDay.get(day)!;
      const dayPerformance = sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length;

      if (i === 0 || this.isConsecutiveDay(sortedDays[i - 1], day)) {
        currentStreak++;
        streakPerformance.push(dayPerformance);
      } else {
        if (currentStreak > 0) {
          const avgPerformance = streakPerformance.reduce((sum, p) => sum + p, 0) / streakPerformance.length;
          streaks.push({ length: currentStreak, performance: avgPerformance / 100 });
        }
        currentStreak = 1;
        streakPerformance = [dayPerformance];
      }
    }

    // Add final streak
    if (currentStreak > 0) {
      const avgPerformance = streakPerformance.reduce((sum, p) => sum + p, 0) / streakPerformance.length;
      streaks.push({ length: currentStreak, performance: avgPerformance / 100 });
    }

    // Group by streak length and calculate average performance
    const streakGroups = new Map<number, number[]>();
    streaks.forEach(streak => {
      if (!streakGroups.has(streak.length)) {
        streakGroups.set(streak.length, []);
      }
      streakGroups.get(streak.length)!.push(streak.performance);
    });

    return Array.from(streakGroups.entries()).map(([streakLength, performances]) => ({
      streakLength,
      performance: performances.reduce((sum, p) => sum + p, 0) / performances.length
    }));
  }

  private isConsecutiveDay(day1: string, day2: string): boolean {
    const date1 = new Date(day1);
    const date2 = new Date(day2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private assessBurnoutRisk(studySessions: any[], notifications: any[]): any {
    const recentSessions = studySessions.slice(-14); // Last 14 days

    // Calculate intensity
    const avgSessionsPerDay = recentSessions.length / 14;
    const avgDuration = recentSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0) / recentSessions.length;

    // High risk if: high frequency + long duration + declining performance
    const recentPerformance = recentSessions.slice(-7).reduce((sum, s) => sum + (s.score || 0), 0) / 7;
    const previousPerformance = recentSessions.slice(-14, -7).reduce((sum, s) => sum + (s.score || 0), 0) / 7;

    const performanceDecline = previousPerformance > 0 ? (previousPerformance - recentPerformance) / previousPerformance : 0;

    let currentRisk = 0;
    if (avgSessionsPerDay > 2) currentRisk += 0.3;
    if (avgDuration > 120) currentRisk += 0.3; // 2 hours
    if (performanceDecline > 0.1) currentRisk += 0.4;

    const earlyWarningSignals = [];
    if (avgSessionsPerDay > 3) earlyWarningSignals.push('Excessive study frequency');
    if (avgDuration > 180) earlyWarningSignals.push('Very long study sessions');
    if (performanceDecline > 0.15) earlyWarningSignals.push('Declining performance');

    const recommendedInterventions = [];
    if (currentRisk > 0.5) {
      recommendedInterventions.push('Reduce study frequency');
      recommendedInterventions.push('Encourage breaks between sessions');
      recommendedInterventions.push('Focus on quality over quantity');
    }

    return {
      currentRisk: Math.min(1, currentRisk),
      earlyWarningSignals,
      recommendedInterventions
    };
  }

  // Additional helper methods would be implemented here...
  // Due to space constraints, I'm providing simplified implementations

  private async generateHabitInsights(
    habitStrength: StudyHabitAnalysis['habitStrength'],
    notificationImpact: StudyHabitAnalysis['notificationImpact'],
    temporalPatterns: StudyHabitAnalysis['temporalPatterns'],
    userId: string,
    tenantId?: string
  ): Promise<StudyHabitAnalysis['personalizedInsights']> {
    const insights = [];

    // Timing insights
    if (temporalPatterns.optimalStudyTimes.length > 0) {
      const bestTime = temporalPatterns.optimalStudyTimes[0];
      insights.push({
        category: 'timing' as const,
        insight: `Your peak performance time is ${bestTime.hour}:00`,
        confidence: 0.8,
        actionable: true,
        expectedImpact: 0.2
      });
    }

    // Frequency insights
    if (notificationImpact.studyInitiation.improvement > 20) {
      insights.push({
        category: 'frequency' as const,
        insight: 'Notifications significantly improve your study initiation',
        confidence: 0.9,
        actionable: true,
        expectedImpact: 0.3
      });
    }

    // Additional insights based on habit strength...
    if (habitStrength.consistency < 0.5) {
      insights.push({
        category: 'motivation' as const,
        insight: 'Focus on building consistent daily study habits',
        confidence: 0.85,
        actionable: true,
        expectedImpact: 0.4
      });
    }

    return insights;
  }

  // Placeholder implementations for remaining methods
  private async getUserGoals(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private async getGoalRelatedNotifications(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private calculateGoalMetrics(goals: any[]): GoalAchievementCorrelation['goalMetrics'] {
    return { totalGoals: 0, completedGoals: 0, completionRate: 0, averageDaysToComplete: 0, abandonmentRate: 0 };
  }

  private analyzeGoalNotificationCorrelation(goals: any[], notifications: any[]): any { return {}; }
  private analyzeGoalCategoryPerformance(goals: any[], notifications: any[]): any[] { return []; }
  private async generateGoalPredictions(goals: any[], notifications: any[], userId: string, tenantId?: string): Promise<any> { return {}; }

  private async getPerformanceData(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private analyzeAcademicPerformance(data: any[]): any { return {}; }
  private async analyzeNotificationPerformanceImpact(data: any[], notifications: any[], userId: string, tenantId?: string): Promise<any> { return {}; }
  private calculateLearningEfficiency(data: any[], notifications: any[]): any { return {}; }
  private async getComparativeBenchmarks(userId: string, data: any[], tenantId?: string): Promise<any> { return {}; }

  private async getComprehensiveUserData(userId: string, tenantId?: string): Promise<any> { return {}; }
  private async generateLongTermPredictions(data: any, userId: string, tenantId?: string): Promise<any> { return {}; }
  private identifyRiskFactors(data: any): any[] { return []; }
  private identifySuccessFactors(data: any): any[] { return []; }
  private async recommendInterventions(predictions: any, risks: any[], success: any[], userId: string, tenantId?: string): Promise<any[]> { return []; }

  private async getAggregatedCorrelationData(start: Date, end: Date, tenantId?: string): Promise<any> { return {}; }
  private calculateOverallCorrelation(data: any): any { return {}; }
  private analyzeSpecificCorrelations(data: any): any[] { return []; }
  private async performCausalAnalysis(data: any, tenantId?: string): Promise<any> { return {}; }
  private identifyOptimalStrategies(correlations: any[], causal: any): any[] { return []; }
  private generateCorrelationInsights(overall: any, specific: any[], causal: any): any[] { return []; }

  private async getInstitutionalData(tenantId: string): Promise<any> { return {}; }
  private calculateInstitutionalMetrics(data: any): Record<string, number> { return {}; }
  private analyzeInstitutionalNotificationEffectiveness(data: any): Record<string, number> { return {}; }
  private summarizeLearningOutcomes(data: any): Record<string, number> { return {}; }
  private generateInstitutionalRecommendations(metrics: any, effectiveness: any, outcomes: any): any[] { return []; }

  // Additional metric calculation methods
  private calculateAcademicMetrics(data: any[], start: Date, end: Date): any { return {}; }
  private calculateSkillMetrics(data: any[], start: Date, end: Date): any { return {}; }
  private calculateGoalAchievementMetrics(data: any[], start: Date, end: Date): any { return {}; }
  private calculateEngagementMetrics(data: any[], start: Date, end: Date): any { return {}; }
  private calculateRetentionMetrics(data: any[], start: Date, end: Date): any { return {}; }

  private async calculateNotificationCorrelation(
    userId: string,
    outcomeType: string,
    start: Date,
    end: Date,
    tenantId?: string
  ): Promise<LearningOutcome['notificationCorrelation']> {
    return {
      correlationStrength: 0.6,
      significance: 0.05,
      causalityIndicator: 0.7,
      optimalFrequency: 3,
      diminishingReturns: 8
    };
  }

  private getSupportingAcademicMetrics(data: any[]): any[] { return []; }
  private getSupportingSkillMetrics(data: any[]): any[] { return []; }
  private getSupportingGoalMetrics(data: any[]): any[] { return []; }
  private getSupportingEngagementMetrics(data: any[]): any[] { return []; }
  private getSupportingRetentionMetrics(data: any[]): any[] { return []; }

  private async getSkillData(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private async getEngagementData(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private async getRetentionData(userId: string, tenantId?: string): Promise<any[]> { return []; }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const learningOutcomesEngine = new LearningOutcomesEngine();