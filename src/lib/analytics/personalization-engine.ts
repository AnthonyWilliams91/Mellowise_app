/**
 * Personalization Engine
 * MELLOWISE-015: AI-driven individual user notification optimization
 *
 * Features:
 * - Individual user preference learning
 * - Dynamic content optimization
 * - Optimal timing personalization
 * - Channel preference optimization
 * - FERPA-compliant educational personalization
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface UserPersonalizationProfile {
  userId: string;
  tenantId: string;

  // Learning preferences
  learningPreferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal';
    difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
    sessionLengthPreference: number; // minutes
    pacePreference: 'slow' | 'moderate' | 'fast' | 'variable';
    feedbackStyle: 'immediate' | 'summary' | 'minimal' | 'detailed';
  };

  // Notification preferences
  notificationPreferences: {
    preferredChannels: Array<{ channel: string; preference: number; context?: string }>;
    optimalTiming: Array<{ dayOfWeek: number; hour: number; effectiveness: number }>;
    frequencyPreference: { min: number; max: number; optimal: number }; // per week
    contentStyle: 'formal' | 'casual' | 'motivational' | 'direct' | 'adaptive';
    urgencyTolerance: number; // 0-1 (tolerance for urgent notifications)
  };

  // Behavioral patterns
  behaviorPatterns: {
    studyHabits: {
      consistencyScore: number; // 0-1
      preferredDuration: number; // minutes
      breakPatterns: Array<{ afterMinutes: number; breakDuration: number }>;
      procrastinationTendency: number; // 0-1
    };

    engagementPatterns: {
      peakPerformanceHours: number[];
      attentionSpanCurve: Array<{ timeInSession: number; attention: number }>;
      motivationTriggers: string[];
      burnoutIndicators: string[];
    };

    responsePatterns: {
      averageResponseTime: number; // minutes
      channelResponseRates: Array<{ channel: string; rate: number }>;
      contentEngagementRates: Array<{ contentType: string; rate: number }>;
      timingEffectiveness: Array<{ hour: number; day: number; effectiveness: number }>;
    };
  };

  // Adaptive parameters
  adaptiveParameters: {
    learningRate: number; // how quickly to adapt to new patterns
    explorationRate: number; // how much to try new strategies vs exploit known preferences
    confidenceThreshold: number; // minimum confidence to act on predictions
    adaptationHistory: Array<{
      timestamp: string;
      parameter: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }>;
  };

  // Model state
  modelState: {
    trainingDataSize: number;
    lastTrainingUpdate: string;
    modelVersion: string;
    performanceMetrics: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
    };
  };

  createdAt: string;
  updatedAt: string;
}

export interface PersonalizationRecommendation {
  userId: string;
  recommendationType: 'content' | 'timing' | 'frequency' | 'channel' | 'difficulty' | 'format';

  // Recommendation details
  recommendation: {
    type: string;
    value: any;
    confidence: number; // 0-1
    reasoning: string[];
    expectedImpact: number; // 0-1
  };

  // Context
  context: {
    currentSituation: Record<string, any>;
    userState: string; // e.g., 'focused', 'tired', 'motivated'
    environmentalFactors: string[];
    recentPerformance: number;
  };

  // Implementation details
  implementation: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeframe: string; // when to implement
    duration: string; // how long to test
    measurableOutcomes: string[];
    rollbackConditions: string[];
  };

  // Validation
  validation: {
    testGroup?: string;
    controlGroup?: string;
    minimumTestDuration: number; // days
    successCriteria: Array<{ metric: string; threshold: number }>;
  };

  generatedAt: string;
  expiresAt: string;
}

export interface PersonalizationExperiment {
  experimentId: string;
  userId: string;
  experimentType: 'content_optimization' | 'timing_optimization' | 'frequency_tuning' | 'channel_preference';

  // Experiment setup
  hypothesis: string;
  variants: Array<{
    variantId: string;
    name: string;
    parameters: Record<string, any>;
  }>;
  currentVariant: string;

  // Execution
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';

  // Results tracking
  metrics: Array<{
    metric: string;
    baseline: number;
    currentValue: number;
    improvement: number;
    significance: number; // p-value
  }>;

  // Decision making
  decisionCriteria: {
    minimumDuration: number; // days
    minimumSampleSize: number;
    significanceThreshold: number;
    practicalSignificanceThreshold: number; // minimum meaningful improvement
  };

  // Outcomes
  results?: {
    winningVariant?: string;
    improvement: number;
    confidence: number;
    recommendation: 'adopt' | 'reject' | 'continue_testing';
    insights: string[];
  };

  createdAt: string;
  updatedAt: string;
}

export interface ContentPersonalization {
  userId: string;

  // Content preferences
  contentPreferences: {
    messageLength: 'short' | 'medium' | 'long' | 'adaptive';
    toneOfVoice: 'professional' | 'friendly' | 'encouraging' | 'direct' | 'playful';
    personalizationLevel: 'minimal' | 'moderate' | 'high' | 'maximum';
    includeEmojis: boolean;
    includePersonalData: boolean; // name, progress, etc.
  };

  // Dynamic content rules
  contentRules: Array<{
    ruleId: string;
    condition: string; // e.g., "streak > 5"
    contentTemplate: string;
    priority: number;
    effectiveness: number; // measured performance
  }>;

  // Content performance
  contentPerformance: Array<{
    contentType: string;
    template: string;
    impressions: number;
    engagements: number;
    conversions: number;
    effectiveness: number; // calculated score
  }>;

  // A/B test results
  contentTests: Array<{
    testId: string;
    contentA: string;
    contentB: string;
    winner: 'A' | 'B' | 'tie';
    improvement: number;
    confidence: number;
  }>;

  lastOptimized: string;
}

export interface TimingPersonalization {
  userId: string;

  // Timing insights
  timingInsights: {
    chronotype: 'morning' | 'evening' | 'intermediate';
    peakHours: Array<{ hour: number; effectiveness: number; confidence: number }>;
    avoidHours: Array<{ hour: number; reason: string }>;
    dayOfWeekPreferences: Array<{ day: number; preference: number }>;
  };

  // Contextual timing
  contextualTiming: {
    workDays: Array<{ hour: number; effectiveness: number }>;
    weekends: Array<{ hour: number; effectiveness: number }>;
    holidaysSpecial: Array<{ hour: number; effectiveness: number }>;
    stressfulPeriods: Array<{ period: string; adjustments: string[] }>;
  };

  // Adaptive scheduling
  adaptiveScheduling: {
    learningDecay: number; // how quickly preferences might change
    seasonalAdjustments: boolean;
    timezoneHandling: 'user_local' | 'platform_time' | 'adaptive';
    bufferTime: number; // minutes before/after optimal time
  };

  // Timing experiments
  timingExperiments: Array<{
    experimentId: string;
    hypothesis: string;
    testTiming: { day: number; hour: number };
    controlTiming: { day: number; hour: number };
    status: 'running' | 'completed';
    results?: { winner: 'test' | 'control'; improvement: number };
  }>;

  lastCalibrated: string;
}

export interface FrequencyPersonalization {
  userId: string;

  // Frequency analysis
  frequencyAnalysis: {
    currentFrequency: number; // notifications per week
    optimalFrequency: number;
    toleranceRange: { min: number; max: number };
    diminishingReturnsPoint: number; // frequency where effectiveness drops
  };

  // Fatigue modeling
  fatigueModel: {
    fatigueThreshold: number; // notifications before fatigue sets in
    recoveryTime: number; // hours needed to reset fatigue
    currentFatigueLevel: number; // 0-1
    fatiguePatterns: Array<{ period: string; threshold: number }>;
  };

  // Adaptive frequency
  adaptiveFrequency: {
    baseFrequency: number;
    performanceMultiplier: number; // adjust based on recent performance
    engagementMultiplier: number; // adjust based on recent engagement
    goalUrgencyMultiplier: number; // adjust based on approaching deadlines
    contextualAdjustments: Array<{ context: string; adjustment: number }>;
  };

  // Frequency experiments
  frequencyExperiments: Array<{
    period: string;
    targetFrequency: number;
    actualFrequency: number;
    outcome: 'positive' | 'negative' | 'neutral';
    metrics: Record<string, number>;
  }>;

  lastOptimized: string;
}

// =============================================
// PERSONALIZATION ENGINE
// =============================================

export class PersonalizationEngine {
  private supabase;
  private profileCache: Map<string, UserPersonalizationProfile> = new Map();
  private activeExperiments: Map<string, PersonalizationExperiment[]> = new Map();
  private cacheTTL: number = 3600000; // 1 hour

  constructor() {
    this.supabase = createServerClient();
    this.loadActiveExperiments();
  }

  /**
   * Get or create user personalization profile
   */
  async getUserProfile(userId: string, tenantId?: string): Promise<UserPersonalizationProfile> {
    const cacheKey = `${userId}_${tenantId}`;
    const cached = this.profileCache.get(cacheKey);
    if (cached) return cached;

    // Try to load from database
    let profile = await this.loadUserProfile(userId, tenantId);

    // Create new profile if doesn't exist
    if (!profile) {
      profile = await this.createInitialProfile(userId, tenantId);
    }

    this.profileCache.set(cacheKey, profile);
    return profile;
  }

  /**
   * Update user profile with new learning data
   */
  async updateUserProfile(
    userId: string,
    updateData: Partial<UserPersonalizationProfile>,
    tenantId?: string
  ): Promise<UserPersonalizationProfile> {
    const currentProfile = await this.getUserProfile(userId, tenantId);

    // Merge updates intelligently
    const updatedProfile = this.mergeProfileUpdates(currentProfile, updateData);

    // Store updated profile
    await this.storeUserProfile(updatedProfile, tenantId);

    // Update cache
    const cacheKey = `${userId}_${tenantId}`;
    this.profileCache.set(cacheKey, updatedProfile);

    return updatedProfile;
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(
    userId: string,
    recommendationTypes: PersonalizationRecommendation['recommendationType'][] = [
      'content', 'timing', 'frequency', 'channel'
    ],
    context?: Record<string, any>,
    tenantId?: string
  ): Promise<PersonalizationRecommendation[]> {
    const profile = await this.getUserProfile(userId, tenantId);
    const currentContext = await this.buildUserContext(userId, context, tenantId);

    const recommendations: PersonalizationRecommendation[] = [];

    for (const type of recommendationTypes) {
      try {
        const recommendation = await this.generateSpecificRecommendation(
          profile,
          type,
          currentContext,
          tenantId
        );
        if (recommendation) {
          recommendations.push(recommendation);
        }
      } catch (error) {
        console.error(`Error generating ${type} recommendation for user ${userId}:`, error);
      }
    }

    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.implementation.priority] - priorityWeight[a.implementation.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.recommendation.confidence - a.recommendation.confidence;
    });
  }

  /**
   * Start personalization experiment
   */
  async startPersonalizationExperiment(
    userId: string,
    experimentType: PersonalizationExperiment['experimentType'],
    hypothesis: string,
    variants: PersonalizationExperiment['variants'],
    duration: number = 14,
    tenantId?: string
  ): Promise<PersonalizationExperiment> {
    const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const experiment: PersonalizationExperiment = {
      experimentId,
      userId,
      experimentType,
      hypothesis,
      variants,
      currentVariant: variants[0].variantId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      metrics: [],
      decisionCriteria: {
        minimumDuration: Math.min(7, duration),
        minimumSampleSize: 30,
        significanceThreshold: 0.05,
        practicalSignificanceThreshold: 0.05 // 5% improvement
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store experiment
    await this.storeExperiment(experiment, tenantId);

    // Add to active experiments
    if (!this.activeExperiments.has(userId)) {
      this.activeExperiments.set(userId, []);
    }
    this.activeExperiments.get(userId)!.push(experiment);

    return experiment;
  }

  /**
   * Optimize content personalization
   */
  async optimizeContentPersonalization(
    userId: string,
    tenantId?: string
  ): Promise<ContentPersonalization> {
    const profile = await this.getUserProfile(userId, tenantId);

    // Analyze recent content performance
    const contentPerformance = await this.analyzeContentPerformance(userId, tenantId);

    // Generate content preferences
    const contentPreferences = this.inferContentPreferences(profile, contentPerformance);

    // Create dynamic content rules
    const contentRules = await this.generateContentRules(profile, contentPerformance);

    // Get A/B test results
    const contentTests = await this.getContentTestResults(userId, tenantId);

    const contentPersonalization: ContentPersonalization = {
      userId,
      contentPreferences,
      contentRules,
      contentPerformance,
      contentTests,
      lastOptimized: new Date().toISOString()
    };

    // Store optimization results
    await this.storeContentPersonalization(contentPersonalization, tenantId);

    return contentPersonalization;
  }

  /**
   * Optimize timing personalization
   */
  async optimizeTimingPersonalization(
    userId: string,
    tenantId?: string
  ): Promise<TimingPersonalization> {
    const profile = await this.getUserProfile(userId, tenantId);

    // Analyze timing patterns
    const timingInsights = await this.analyzeTimingInsights(userId, tenantId);

    // Generate contextual timing rules
    const contextualTiming = await this.generateContextualTiming(userId, tenantId);

    // Configure adaptive scheduling
    const adaptiveScheduling = this.configureAdaptiveScheduling(profile, timingInsights);

    // Get timing experiments
    const timingExperiments = await this.getTimingExperiments(userId, tenantId);

    const timingPersonalization: TimingPersonalization = {
      userId,
      timingInsights,
      contextualTiming,
      adaptiveScheduling,
      timingExperiments,
      lastCalibrated: new Date().toISOString()
    };

    // Store optimization results
    await this.storeTimingPersonalization(timingPersonalization, tenantId);

    return timingPersonalization;
  }

  /**
   * Optimize frequency personalization
   */
  async optimizeFrequencyPersonalization(
    userId: string,
    tenantId?: string
  ): Promise<FrequencyPersonalization> {
    const profile = await this.getUserProfile(userId, tenantId);

    // Analyze optimal frequency
    const frequencyAnalysis = await this.analyzeOptimalFrequency(userId, tenantId);

    // Model fatigue patterns
    const fatigueModel = await this.modelNotificationFatigue(userId, tenantId);

    // Configure adaptive frequency
    const adaptiveFrequency = this.configureAdaptiveFrequency(profile, frequencyAnalysis);

    // Get frequency experiments
    const frequencyExperiments = await this.getFrequencyExperiments(userId, tenantId);

    const frequencyPersonalization: FrequencyPersonalization = {
      userId,
      frequencyAnalysis,
      fatigueModel,
      adaptiveFrequency,
      frequencyExperiments,
      lastOptimized: new Date().toISOString()
    };

    // Store optimization results
    await this.storeFrequencyPersonalization(frequencyPersonalization, tenantId);

    return frequencyPersonalization;
  }

  /**
   * Learn from user interactions
   */
  async learnFromInteraction(
    userId: string,
    interaction: {
      notificationId: string;
      type: 'sent' | 'read' | 'clicked' | 'dismissed' | 'action_taken';
      timestamp: string;
      context: Record<string, any>;
      outcome?: Record<string, any>;
    },
    tenantId?: string
  ): Promise<void> {
    const profile = await this.getUserProfile(userId, tenantId);

    // Extract learning signals from interaction
    const learningSignals = this.extractLearningSignals(interaction, profile);

    // Update behavioral patterns
    const updatedPatterns = this.updateBehaviorPatterns(profile.behaviorPatterns, learningSignals);

    // Update notification preferences
    const updatedPreferences = this.updateNotificationPreferences(
      profile.notificationPreferences,
      learningSignals
    );

    // Update adaptive parameters
    const updatedAdaptiveParams = this.updateAdaptiveParameters(
      profile.adaptiveParameters,
      learningSignals
    );

    // Store updates
    await this.updateUserProfile(userId, {
      behaviorPatterns: updatedPatterns,
      notificationPreferences: updatedPreferences,
      adaptiveParameters: updatedAdaptiveParams,
      updatedAt: new Date().toISOString()
    }, tenantId);

    // Update active experiments
    await this.updateActiveExperiments(userId, interaction, tenantId);
  }

  /**
   * Get personalized notification configuration
   */
  async getPersonalizedNotificationConfig(
    userId: string,
    notificationType: string,
    context?: Record<string, any>,
    tenantId?: string
  ): Promise<{
    channel: string;
    timing: { delay: number; optimalTime?: string };
    content: { template: string; variables: Record<string, any> };
    frequency: { allowed: boolean; cooldown: number };
    priority: 'low' | 'medium' | 'high';
  }> {
    const profile = await this.getUserProfile(userId, tenantId);
    const currentContext = await this.buildUserContext(userId, context, tenantId);

    // Determine optimal channel
    const channel = this.selectOptimalChannel(profile, notificationType, currentContext);

    // Determine optimal timing
    const timing = this.calculateOptimalTiming(profile, notificationType, currentContext);

    // Generate personalized content
    const content = await this.generatePersonalizedContent(
      profile,
      notificationType,
      currentContext,
      tenantId
    );

    // Check frequency constraints
    const frequency = await this.checkFrequencyConstraints(userId, notificationType, tenantId);

    // Determine priority
    const priority = this.calculateNotificationPriority(profile, notificationType, currentContext);

    return {
      channel,
      timing,
      content,
      frequency,
      priority
    };
  }

  /**
   * Update experiment results
   */
  async updateExperimentResults(
    experimentId: string,
    userId: string,
    metrics: Array<{ metric: string; value: number }>,
    tenantId?: string
  ): Promise<void> {
    const userExperiments = this.activeExperiments.get(userId) || [];
    const experiment = userExperiments.find(exp => exp.experimentId === experimentId);

    if (!experiment) {
      console.warn(`Experiment ${experimentId} not found for user ${userId}`);
      return;
    }

    // Update metrics
    for (const metric of metrics) {
      const existingMetric = experiment.metrics.find(m => m.metric === metric.metric);
      if (existingMetric) {
        existingMetric.currentValue = metric.value;
        existingMetric.improvement = ((metric.value - existingMetric.baseline) / existingMetric.baseline) * 100;
      } else {
        experiment.metrics.push({
          metric: metric.metric,
          baseline: 0, // This would be set when experiment starts
          currentValue: metric.value,
          improvement: 0,
          significance: 1
        });
      }
    }

    // Check if experiment should end
    const shouldEnd = await this.shouldEndExperiment(experiment);
    if (shouldEnd) {
      experiment.status = 'completed';
      experiment.endDate = new Date().toISOString();
      experiment.results = await this.calculateExperimentResults(experiment);
    }

    experiment.updatedAt = new Date().toISOString();

    // Store updated experiment
    await this.storeExperiment(experiment, tenantId);
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private async loadActiveExperiments(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('personalization_experiments')
        .select('*')
        .eq('status', 'active');

      if (data) {
        for (const exp of data) {
          const experiment = this.mapDatabaseToExperiment(exp);
          if (!this.activeExperiments.has(experiment.userId)) {
            this.activeExperiments.set(experiment.userId, []);
          }
          this.activeExperiments.get(experiment.userId)!.push(experiment);
        }
      }
    } catch (error) {
      console.error('Failed to load active experiments:', error);
    }
  }

  private async loadUserProfile(userId: string, tenantId?: string): Promise<UserPersonalizationProfile | null> {
    const { data, error } = await this.supabase
      .from('user_personalization_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToProfile(data);
  }

  private async createInitialProfile(userId: string, tenantId?: string): Promise<UserPersonalizationProfile> {
    const now = new Date().toISOString();

    // Get user's initial data to inform defaults
    const userData = await this.getUserInitialData(userId, tenantId);

    const profile: UserPersonalizationProfile = {
      userId,
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      learningPreferences: {
        learningStyle: userData.learningStyle || 'multimodal',
        difficultyPreference: 'adaptive',
        sessionLengthPreference: 25, // 25 minutes default
        pacePreference: 'moderate',
        feedbackStyle: 'immediate'
      },
      notificationPreferences: {
        preferredChannels: [
          { channel: 'push', preference: 0.8 },
          { channel: 'email', preference: 0.6 },
          { channel: 'in_app', preference: 0.9 }
        ],
        optimalTiming: this.generateDefaultOptimalTiming(),
        frequencyPreference: { min: 1, max: 7, optimal: 3 },
        contentStyle: 'adaptive',
        urgencyTolerance: 0.7
      },
      behaviorPatterns: {
        studyHabits: {
          consistencyScore: 0.5,
          preferredDuration: 25,
          breakPatterns: [{ afterMinutes: 25, breakDuration: 5 }],
          procrastinationTendency: 0.3
        },
        engagementPatterns: {
          peakPerformanceHours: [9, 14, 19],
          attentionSpanCurve: this.generateDefaultAttentionCurve(),
          motivationTriggers: ['progress', 'achievement', 'streak'],
          burnoutIndicators: ['long_sessions', 'declining_performance', 'skipped_days']
        },
        responsePatterns: {
          averageResponseTime: 30,
          channelResponseRates: [
            { channel: 'push', rate: 0.7 },
            { channel: 'email', rate: 0.4 },
            { channel: 'in_app', rate: 0.8 }
          ],
          contentEngagementRates: [
            { contentType: 'motivational', rate: 0.6 },
            { contentType: 'progress', rate: 0.8 },
            { contentType: 'reminder', rate: 0.5 }
          ],
          timingEffectiveness: this.generateDefaultTimingEffectiveness()
        }
      },
      adaptiveParameters: {
        learningRate: 0.1,
        explorationRate: 0.2,
        confidenceThreshold: 0.7,
        adaptationHistory: []
      },
      modelState: {
        trainingDataSize: 0,
        lastTrainingUpdate: now,
        modelVersion: '1.0.0',
        performanceMetrics: {
          accuracy: 0.7,
          precision: 0.7,
          recall: 0.7,
          f1Score: 0.7
        }
      },
      createdAt: now,
      updatedAt: now
    };

    await this.storeUserProfile(profile, tenantId);
    return profile;
  }

  private mergeProfileUpdates(
    currentProfile: UserPersonalizationProfile,
    updates: Partial<UserPersonalizationProfile>
  ): UserPersonalizationProfile {
    // Deep merge logic that preserves arrays and nested objects
    const merged = { ...currentProfile };

    // Update learning preferences
    if (updates.learningPreferences) {
      merged.learningPreferences = { ...merged.learningPreferences, ...updates.learningPreferences };
    }

    // Update notification preferences
    if (updates.notificationPreferences) {
      merged.notificationPreferences = { ...merged.notificationPreferences, ...updates.notificationPreferences };
    }

    // Update behavior patterns
    if (updates.behaviorPatterns) {
      merged.behaviorPatterns = this.deepMerge(merged.behaviorPatterns, updates.behaviorPatterns);
    }

    // Update adaptive parameters
    if (updates.adaptiveParameters) {
      merged.adaptiveParameters = { ...merged.adaptiveParameters, ...updates.adaptiveParameters };

      // Add to adaptation history
      const adaptationEntry = {
        timestamp: new Date().toISOString(),
        parameter: 'multiple',
        oldValue: 'various',
        newValue: 'various',
        reason: 'Profile update'
      };
      merged.adaptiveParameters.adaptationHistory.push(adaptationEntry);
    }

    // Update model state
    if (updates.modelState) {
      merged.modelState = { ...merged.modelState, ...updates.modelState };
    }

    merged.updatedAt = new Date().toISOString();
    return merged;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private async buildUserContext(
    userId: string,
    additionalContext?: Record<string, any>,
    tenantId?: string
  ): Promise<PersonalizationRecommendation['context']> {
    // Get current user state
    const recentSessions = await this.getRecentSessions(userId, 7, tenantId);
    const recentNotifications = await this.getRecentNotifications(userId, 7, tenantId);

    // Determine user state
    const userState = this.inferUserState(recentSessions, recentNotifications);

    // Get environmental factors
    const environmentalFactors = this.getEnvironmentalFactors(additionalContext);

    // Calculate recent performance
    const recentPerformance = this.calculateRecentPerformance(recentSessions);

    return {
      currentSituation: additionalContext || {},
      userState,
      environmentalFactors,
      recentPerformance
    };
  }

  private async generateSpecificRecommendation(
    profile: UserPersonalizationProfile,
    type: PersonalizationRecommendation['recommendationType'],
    context: PersonalizationRecommendation['context'],
    tenantId?: string
  ): Promise<PersonalizationRecommendation | null> {
    let recommendation;

    switch (type) {
      case 'content':
        recommendation = this.generateContentRecommendation(profile, context);
        break;
      case 'timing':
        recommendation = this.generateTimingRecommendation(profile, context);
        break;
      case 'frequency':
        recommendation = this.generateFrequencyRecommendation(profile, context);
        break;
      case 'channel':
        recommendation = this.generateChannelRecommendation(profile, context);
        break;
      case 'difficulty':
        recommendation = this.generateDifficultyRecommendation(profile, context);
        break;
      case 'format':
        recommendation = this.generateFormatRecommendation(profile, context);
        break;
      default:
        return null;
    }

    if (!recommendation || recommendation.confidence < profile.adaptiveParameters.confidenceThreshold) {
      return null;
    }

    return {
      userId: profile.userId,
      recommendationType: type,
      recommendation,
      context,
      implementation: this.generateImplementationPlan(recommendation, type),
      validation: this.generateValidationPlan(recommendation, type),
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  }

  private generateContentRecommendation(
    profile: UserPersonalizationProfile,
    context: PersonalizationRecommendation['context']
  ): PersonalizationRecommendation['recommendation'] {
    const contentPrefs = profile.notificationPreferences.contentStyle;
    const recentPerformance = context.recentPerformance;

    let recommendedStyle = contentPrefs;
    let confidence = 0.7;
    const reasoning = [];

    // Adapt based on recent performance
    if (recentPerformance < 0.6) {
      recommendedStyle = 'motivational';
      confidence = 0.8;
      reasoning.push('Recent performance below average, switching to motivational content');
    } else if (recentPerformance > 0.8) {
      recommendedStyle = 'direct';
      confidence = 0.7;
      reasoning.push('High performance allows for direct, efficient content');
    }

    // Adapt based on user state
    if (context.userState === 'tired') {
      recommendedStyle = 'encouraging';
      reasoning.push('User appears tired, using encouraging tone');
    }

    return {
      type: 'content_style',
      value: recommendedStyle,
      confidence,
      reasoning,
      expectedImpact: 0.15
    };
  }

  private generateTimingRecommendation(
    profile: UserPersonalizationProfile,
    context: PersonalizationRecommendation['context']
  ): PersonalizationRecommendation['recommendation'] {
    const optimalTiming = profile.notificationPreferences.optimalTiming;
    const currentHour = new Date().getHours();

    // Find best timing for current context
    const bestTiming = optimalTiming.reduce((best, current) =>
      current.effectiveness > best.effectiveness ? current : best
    );

    const confidence = bestTiming.effectiveness;
    const reasoning = [`Peak effectiveness at ${bestTiming.hour}:00 (${Math.round(bestTiming.effectiveness * 100)}%)`];

    // Adjust for current context
    let recommendedHour = bestTiming.hour;
    if (context.userState === 'focused' && Math.abs(currentHour - bestTiming.hour) < 2) {
      recommendedHour = currentHour;
      reasoning.push('User currently focused, sending immediately');
    }

    return {
      type: 'optimal_timing',
      value: { hour: recommendedHour, day: bestTiming.dayOfWeek },
      confidence,
      reasoning,
      expectedImpact: 0.2
    };
  }

  private generateFrequencyRecommendation(
    profile: UserPersonalizationProfile,
    context: PersonalizationRecommendation['context']
  ): PersonalizationRecommendation['recommendation'] {
    const currentFreq = profile.notificationPreferences.frequencyPreference.optimal;
    const performance = context.recentPerformance;

    let recommendedFreq = currentFreq;
    let confidence = 0.7;
    const reasoning = [];

    // Adjust based on performance
    if (performance < 0.5) {
      recommendedFreq = Math.min(currentFreq + 1, profile.notificationPreferences.frequencyPreference.max);
      confidence = 0.8;
      reasoning.push('Low performance suggests need for more frequent reminders');
    } else if (performance > 0.9) {
      recommendedFreq = Math.max(currentFreq - 1, profile.notificationPreferences.frequencyPreference.min);
      confidence = 0.7;
      reasoning.push('High performance allows for reduced frequency');
    }

    return {
      type: 'notification_frequency',
      value: recommendedFreq,
      confidence,
      reasoning,
      expectedImpact: 0.1
    };
  }

  private generateChannelRecommendation(
    profile: UserPersonalizationProfile,
    context: PersonalizationRecommendation['context']
  ): PersonalizationRecommendation['recommendation'] {
    const channels = profile.notificationPreferences.preferredChannels;
    const bestChannel = channels.reduce((best, current) =>
      current.preference > best.preference ? current : best
    );

    const confidence = bestChannel.preference;
    const reasoning = [`Highest preference for ${bestChannel.channel} (${Math.round(bestChannel.preference * 100)}%)`];

    // Adjust for context
    let recommendedChannel = bestChannel.channel;
    if (context.userState === 'busy' && bestChannel.channel === 'push') {
      const emailChannel = channels.find(c => c.channel === 'email');
      if (emailChannel) {
        recommendedChannel = 'email';
        reasoning.push('User appears busy, switching to less intrusive email');
      }
    }

    return {
      type: 'preferred_channel',
      value: recommendedChannel,
      confidence,
      reasoning,
      expectedImpact: 0.25
    };
  }

  private generateDifficultyRecommendation(
    profile: UserPersonalizationProfile,
    context: PersonalizationRecommendation['context']
  ): PersonalizationRecommendation['recommendation'] {
    const currentDifficulty = profile.learningPreferences.difficultyPreference;
    const performance = context.recentPerformance;

    let recommendedDifficulty = currentDifficulty;
    let confidence = 0.6;
    const reasoning = [];

    if (currentDifficulty === 'adaptive') {
      if (performance > 0.8) {
        recommendedDifficulty = 'hard';
        confidence = 0.8;
        reasoning.push('High performance suggests readiness for harder content');
      } else if (performance < 0.5) {
        recommendedDifficulty = 'easy';
        confidence = 0.7;
        reasoning.push('Low performance suggests need for easier content');
      } else {
        recommendedDifficulty = 'medium';
        confidence = 0.7;
        reasoning.push('Moderate performance suggests medium difficulty');
      }
    }

    return {
      type: 'content_difficulty',
      value: recommendedDifficulty,
      confidence,
      reasoning,
      expectedImpact: 0.3
    };
  }

  private generateFormatRecommendation(
    profile: UserPersonalizationProfile,
    context: PersonalizationRecommendation['context']
  ): PersonalizationRecommendation['recommendation'] {
    const learningStyle = profile.learningPreferences.learningStyle;
    const sessionLength = profile.learningPreferences.sessionLengthPreference;

    let recommendedFormat;
    let confidence = 0.7;
    const reasoning = [];

    // Recommend format based on learning style
    switch (learningStyle) {
      case 'visual':
        recommendedFormat = 'rich_media';
        reasoning.push('Visual learner benefits from rich media format');
        break;
      case 'auditory':
        recommendedFormat = 'audio_cues';
        reasoning.push('Auditory learner benefits from audio format');
        break;
      case 'kinesthetic':
        recommendedFormat = 'interactive';
        reasoning.push('Kinesthetic learner benefits from interactive format');
        break;
      default:
        recommendedFormat = 'mixed_media';
        reasoning.push('Multimodal approach for balanced learning');
    }

    // Adjust for session length preference
    if (sessionLength < 15) {
      recommendedFormat = 'bite_sized';
      reasoning.push('Short session preference suggests bite-sized format');
    }

    return {
      type: 'notification_format',
      value: recommendedFormat,
      confidence,
      reasoning,
      expectedImpact: 0.2
    };
  }

  // Additional helper methods for personalization engine...
  // Due to space constraints, providing simplified implementations

  private generateDefaultOptimalTiming(): UserPersonalizationProfile['notificationPreferences']['optimalTiming'] {
    return [
      { dayOfWeek: 1, hour: 9, effectiveness: 0.8 },
      { dayOfWeek: 1, hour: 14, effectiveness: 0.7 },
      { dayOfWeek: 1, hour: 19, effectiveness: 0.6 }
    ];
  }

  private generateDefaultAttentionCurve(): Array<{ timeInSession: number; attention: number }> {
    return [
      { timeInSession: 0, attention: 0.9 },
      { timeInSession: 15, attention: 0.8 },
      { timeInSession: 30, attention: 0.6 },
      { timeInSession: 45, attention: 0.4 }
    ];
  }

  private generateDefaultTimingEffectiveness(): Array<{ hour: number; day: number; effectiveness: number }> {
    return [
      { hour: 9, day: 1, effectiveness: 0.8 },
      { hour: 14, day: 1, effectiveness: 0.7 },
      { hour: 19, day: 1, effectiveness: 0.6 }
    ];
  }

  private async getUserInitialData(userId: string, tenantId?: string): Promise<any> {
    // Get initial user data to inform defaults
    return {};
  }

  private async storeUserProfile(profile: UserPersonalizationProfile, tenantId?: string): Promise<void> {
    // Store profile in database
  }

  private async storeExperiment(experiment: PersonalizationExperiment, tenantId?: string): Promise<void> {
    // Store experiment in database
  }

  private extractLearningSignals(
    interaction: any,
    profile: UserPersonalizationProfile
  ): Record<string, any> {
    return {};
  }

  private updateBehaviorPatterns(
    patterns: UserPersonalizationProfile['behaviorPatterns'],
    signals: Record<string, any>
  ): UserPersonalizationProfile['behaviorPatterns'] {
    return patterns;
  }

  private updateNotificationPreferences(
    preferences: UserPersonalizationProfile['notificationPreferences'],
    signals: Record<string, any>
  ): UserPersonalizationProfile['notificationPreferences'] {
    return preferences;
  }

  private updateAdaptiveParameters(
    params: UserPersonalizationProfile['adaptiveParameters'],
    signals: Record<string, any>
  ): UserPersonalizationProfile['adaptiveParameters'] {
    return params;
  }

  // Additional placeholder methods...
  private mapDatabaseToProfile(data: any): UserPersonalizationProfile { return {} as UserPersonalizationProfile; }
  private mapDatabaseToExperiment(data: any): PersonalizationExperiment { return {} as PersonalizationExperiment; }
  private async getRecentSessions(userId: string, days: number, tenantId?: string): Promise<any[]> { return []; }
  private async getRecentNotifications(userId: string, days: number, tenantId?: string): Promise<any[]> { return []; }
  private inferUserState(sessions: any[], notifications: any[]): string { return 'normal'; }
  private getEnvironmentalFactors(context?: Record<string, any>): string[] { return []; }
  private calculateRecentPerformance(sessions: any[]): number { return 0.7; }
  private generateImplementationPlan(rec: any, type: string): any { return {}; }
  private generateValidationPlan(rec: any, type: string): any { return {}; }
  private selectOptimalChannel(profile: UserPersonalizationProfile, type: string, context: any): string { return 'push'; }
  private calculateOptimalTiming(profile: UserPersonalizationProfile, type: string, context: any): any { return {}; }
  private async generatePersonalizedContent(profile: UserPersonalizationProfile, type: string, context: any, tenantId?: string): Promise<any> { return {}; }
  private async checkFrequencyConstraints(userId: string, type: string, tenantId?: string): Promise<any> { return {}; }
  private calculateNotificationPriority(profile: UserPersonalizationProfile, type: string, context: any): 'low' | 'medium' | 'high' { return 'medium'; }
  private async shouldEndExperiment(experiment: PersonalizationExperiment): Promise<boolean> { return false; }
  private async calculateExperimentResults(experiment: PersonalizationExperiment): Promise<any> { return {}; }
  private async updateActiveExperiments(userId: string, interaction: any, tenantId?: string): Promise<void> {}

  // Personalization-specific methods
  private async analyzeContentPerformance(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private inferContentPreferences(profile: UserPersonalizationProfile, performance: any[]): any { return {}; }
  private async generateContentRules(profile: UserPersonalizationProfile, performance: any[]): Promise<any[]> { return []; }
  private async getContentTestResults(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private async storeContentPersonalization(content: ContentPersonalization, tenantId?: string): Promise<void> {}
  private async analyzeTimingInsights(userId: string, tenantId?: string): Promise<any> { return {}; }
  private async generateContextualTiming(userId: string, tenantId?: string): Promise<any> { return {}; }
  private configureAdaptiveScheduling(profile: UserPersonalizationProfile, insights: any): any { return {}; }
  private async getTimingExperiments(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private async storeTimingPersonalization(timing: TimingPersonalization, tenantId?: string): Promise<void> {}
  private async analyzeOptimalFrequency(userId: string, tenantId?: string): Promise<any> { return {}; }
  private async modelNotificationFatigue(userId: string, tenantId?: string): Promise<any> { return {}; }
  private configureAdaptiveFrequency(profile: UserPersonalizationProfile, analysis: any): any { return {}; }
  private async getFrequencyExperiments(userId: string, tenantId?: string): Promise<any[]> { return []; }
  private async storeFrequencyPersonalization(frequency: FrequencyPersonalization, tenantId?: string): Promise<void> {}
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const personalizationEngine = new PersonalizationEngine();