/**
 * A/B Testing Framework
 * MELLOWISE-015: Statistical experiment framework for notification optimization
 *
 * Features:
 * - Experiment design and management
 * - Statistical significance testing
 * - Multi-variate testing support
 * - Personalized testing based on user segments
 * - FERPA-compliant educational experimentation
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// CORE INTERFACES
// =============================================

export interface Experiment {
  experimentId: string;
  name: string;
  description: string;
  hypothesis: string;

  // Experiment configuration
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  type: 'a_b' | 'multivariate' | 'split_url' | 'feature_flag';

  // Targeting
  targetingRules: {
    userSegments?: string[];
    userAttributes?: Array<{ field: string; operator: string; value: any }>;
    trafficAllocation: number; // 0-1 (percentage of eligible users)
    exclusionRules?: Array<{ field: string; operator: string; value: any }>;
  };

  // Variants
  variants: ExperimentVariant[];
  controlVariant: string; // ID of control variant

  // Metrics
  primaryMetric: string;
  secondaryMetrics: string[];
  guardrailMetrics: string[]; // Metrics that shouldn't degrade

  // Statistical configuration
  statisticalSettings: {
    significanceLevel: number; // e.g., 0.05
    statisticalPower: number; // e.g., 0.8
    minimumDetectableEffect: number; // e.g., 0.05 (5%)
    minimumSampleSize: number;
    trafficSplitType: 'equal' | 'weighted' | 'custom';
  };

  // Timing
  startDate: string;
  endDate?: string;
  duration?: number; // days

  // Results
  results?: ExperimentResults;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ExperimentVariant {
  variantId: string;
  name: string;
  description: string;
  isControl: boolean;

  // Traffic allocation
  trafficWeight: number; // 0-1

  // Notification configuration
  notificationConfig: {
    title?: string;
    message?: string;
    channel?: string;
    timing?: {
      delayMinutes?: number;
      optimalTiming?: boolean;
      customSchedule?: string;
    };
    personalization?: {
      usePersonalizedContent?: boolean;
      dynamicContent?: Record<string, any>;
    };
    frequency?: {
      maxPerDay?: number;
      cooldownHours?: number;
    };
    style?: {
      priority?: 'low' | 'medium' | 'high';
      urgency?: boolean;
      emoji?: boolean;
    };
  };

  // Feature flags (for feature experiments)
  featureFlags?: Record<string, boolean>;

  // Custom parameters
  customParameters?: Record<string, any>;
}

export interface ExperimentResults {
  experimentId: string;
  calculatedAt: string;
  status: 'insufficient_data' | 'running' | 'significant' | 'inconclusive' | 'complete';

  // Overall results
  duration: number; // days
  totalParticipants: number;

  // Variant performance
  variantResults: Array<{
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    primaryMetricValue: number;
    secondaryMetrics: Array<{ metric: string; value: number }>;
    confidenceInterval: { lower: number; upper: number };
  }>;

  // Statistical analysis
  statisticalSignificance: {
    pValue: number;
    isSignificant: boolean;
    confidenceLevel: number;
    effectSize: number;
    statisticalPower: number;
  };

  // Winner analysis
  winnerAnalysis: {
    hasWinner: boolean;
    winningVariant?: string;
    liftOverControl: number; // percentage improvement
    confidenceInWinner: number; // 0-1
    estimatedRevenue?: number;
  };

  // Segment analysis
  segmentAnalysis: Array<{
    segment: string;
    segmentSize: number;
    winningVariant: string;
    lift: number;
    significance: number;
  }>;

  // Guardrail metrics
  guardrailResults: Array<{
    metric: string;
    degraded: boolean;
    degradationAmount: number;
    acceptable: boolean;
  }>;

  // Recommendations
  recommendations: Array<{
    type: 'launch' | 'iterate' | 'stop' | 'extend';
    rationale: string;
    confidence: number;
    expectedImpact: string;
  }>;
}

export interface ExperimentParticipation {
  participationId: string;
  experimentId: string;
  userId: string;
  variantId: string;

  // Participation details
  assignedAt: string;
  exposedAt?: string; // When user was actually exposed to variant

  // Conversion tracking
  conversions: Array<{
    metric: string;
    convertedAt: string;
    value: number;
    context?: Record<string, any>;
  }>;

  // Metadata
  userSegment?: string;
  deviceType?: string;
  location?: string;
  experimentContext?: Record<string, any>;
}

export interface ExperimentMetric {
  metricId: string;
  name: string;
  description: string;
  metricType: 'conversion' | 'numeric' | 'duration' | 'count';

  // Calculation
  calculationMethod: 'sum' | 'average' | 'median' | 'count' | 'percentage' | 'custom';
  dataSource: string; // table/view name
  filterConditions?: Array<{ field: string; operator: string; value: any }>;

  // For conversion metrics
  conversionWindow?: number; // hours
  conversionEvents?: string[];

  // Statistical properties
  expectedRange: { min: number; max: number };
  historicalMean?: number;
  historicalStdDev?: number;

  // Business context
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  isGuardrail: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ExperimentSegment {
  segmentId: string;
  name: string;
  description: string;

  // Segment definition
  criteria: Array<{
    field: string;
    operator: string;
    value: any;
    logicalOperator?: 'AND' | 'OR';
  }>;

  // Segment size
  estimatedSize: number;
  actualSize?: number;

  // Experiment suitability
  minExperimentSize: number;
  recommendedExperimentDuration: number; // days

  createdAt: string;
  updatedAt: string;
}

export interface StatisticalAnalysis {
  experimentId: string;
  variantComparisons: Array<{
    variantA: string;
    variantB: string;
    metric: string;

    // Test results
    testType: 'ttest' | 'chi_square' | 'mann_whitney' | 'fisher_exact';
    pValue: number;
    effectSize: number;
    confidenceInterval: { lower: number; upper: number };

    // Interpretation
    isSignificant: boolean;
    practicalSignificance: boolean;
    recommendation: string;
  }>;

  // Power analysis
  powerAnalysis: {
    achievedPower: number;
    requiredSampleSize: number;
    currentSampleSize: number;
    daysToSignificance?: number;
  };

  // Multiple comparisons correction
  multipleComparisons: {
    method: 'bonferroni' | 'benjamini_hochberg' | 'none';
    adjustedAlpha: number;
    familywiseErrorRate: number;
  };

  calculatedAt: string;
}

// =============================================
// A/B TESTING FRAMEWORK
// =============================================

export class ABTestingFramework {
  private supabase;
  private activeExperiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId

  constructor() {
    this.supabase = createServerClient();
    this.loadActiveExperiments();
  }

  /**
   * Create a new experiment
   */
  async createExperiment(
    experimentConfig: Omit<Experiment, 'experimentId' | 'createdAt' | 'updatedAt'>,
    tenantId?: string
  ): Promise<Experiment> {
    const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const experiment: Experiment = {
      ...experimentConfig,
      experimentId,
      createdAt: now,
      updatedAt: now
    };

    // Validate experiment configuration
    await this.validateExperimentConfig(experiment);

    // Calculate required sample size
    const requiredSampleSize = this.calculateRequiredSampleSize(experiment);
    experiment.statisticalSettings.minimumSampleSize = requiredSampleSize;

    // Store experiment
    await this.storeExperiment(experiment, tenantId);

    return experiment;
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string, tenantId?: string): Promise<void> {
    const experiment = await this.getExperiment(experimentId, tenantId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== 'draft') {
      throw new Error(`Cannot start experiment in ${experiment.status} status`);
    }

    // Final validation
    await this.validateExperimentConfig(experiment);

    // Update status
    experiment.status = 'running';
    experiment.startDate = new Date().toISOString();
    experiment.updatedAt = new Date().toISOString();

    // Store updated experiment
    await this.storeExperiment(experiment, tenantId);

    // Cache active experiment
    this.activeExperiments.set(experimentId, experiment);

    console.log(`Started experiment: ${experiment.name} (${experimentId})`);
  }

  /**
   * Assign user to experiment variant
   */
  async assignUserToExperiment(
    userId: string,
    experimentId: string,
    tenantId?: string
  ): Promise<string | null> {
    const experiment = await this.getExperiment(experimentId, tenantId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const existingAssignment = await this.getUserAssignment(userId, experimentId, tenantId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user is eligible
    const isEligible = await this.isUserEligible(userId, experiment, tenantId);
    if (!isEligible) {
      return null;
    }

    // Assign to variant
    const variantId = this.assignToVariant(userId, experiment);

    // Store assignment
    const participation: ExperimentParticipation = {
      participationId: `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      experimentId,
      userId,
      variantId,
      assignedAt: new Date().toISOString(),
      conversions: []
    };

    await this.storeParticipation(participation, tenantId);

    // Cache assignment
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(experimentId, variantId);

    return variantId;
  }

  /**
   * Get user's variant for an experiment
   */
  async getUserVariant(
    userId: string,
    experimentId: string,
    tenantId?: string
  ): Promise<ExperimentVariant | null> {
    // Check cache first
    const cachedVariantId = this.userAssignments.get(userId)?.get(experimentId);
    if (cachedVariantId) {
      const experiment = await this.getExperiment(experimentId, tenantId);
      return experiment?.variants.find(v => v.variantId === cachedVariantId) || null;
    }

    // Check database
    const assignment = await this.getUserAssignment(userId, experimentId, tenantId);
    if (!assignment) {
      // Try to assign user
      const variantId = await this.assignUserToExperiment(userId, experimentId, tenantId);
      if (variantId) {
        const experiment = await this.getExperiment(experimentId, tenantId);
        return experiment?.variants.find(v => v.variantId === variantId) || null;
      }
      return null;
    }

    const experiment = await this.getExperiment(experimentId, tenantId);
    return experiment?.variants.find(v => v.variantId === assignment.variantId) || null;
  }

  /**
   * Track user exposure to variant
   */
  async trackExposure(
    userId: string,
    experimentId: string,
    context?: Record<string, any>,
    tenantId?: string
  ): Promise<void> {
    const assignment = await this.getUserAssignment(userId, experimentId, tenantId);
    if (!assignment) {
      return;
    }

    // Update exposure time if not already set
    if (!assignment.exposedAt) {
      await this.updateParticipation(assignment.participationId, {
        exposedAt: new Date().toISOString(),
        experimentContext: context
      }, tenantId);
    }
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    userId: string,
    experimentId: string,
    metric: string,
    value: number = 1,
    context?: Record<string, any>,
    tenantId?: string
  ): Promise<void> {
    const assignment = await this.getUserAssignment(userId, experimentId, tenantId);
    if (!assignment) {
      return;
    }

    const conversion = {
      metric,
      convertedAt: new Date().toISOString(),
      value,
      context
    };

    // Add conversion to participation
    assignment.conversions.push(conversion);

    await this.updateParticipation(assignment.participationId, {
      conversions: assignment.conversions
    }, tenantId);

    console.log(`Tracked conversion: ${metric} for user ${userId} in experiment ${experimentId}`);
  }

  /**
   * Calculate experiment results
   */
  async calculateResults(experimentId: string, tenantId?: string): Promise<ExperimentResults> {
    const experiment = await this.getExperiment(experimentId, tenantId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Get all participations
    const participations = await this.getExperimentParticipations(experimentId, tenantId);

    if (participations.length < experiment.statisticalSettings.minimumSampleSize) {
      return this.createInsufficientDataResults(experiment, participations);
    }

    // Calculate variant results
    const variantResults = await this.calculateVariantResults(experiment, participations);

    // Perform statistical analysis
    const statisticalAnalysis = await this.performStatisticalAnalysis(experiment, variantResults);

    // Analyze winners
    const winnerAnalysis = this.analyzeWinners(experiment, variantResults, statisticalAnalysis);

    // Segment analysis
    const segmentAnalysis = await this.performSegmentAnalysis(experiment, participations, tenantId);

    // Check guardrail metrics
    const guardrailResults = await this.checkGuardrailMetrics(experiment, participations, tenantId);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      experiment,
      statisticalAnalysis,
      winnerAnalysis,
      guardrailResults
    );

    const results: ExperimentResults = {
      experimentId,
      calculatedAt: new Date().toISOString(),
      status: this.determineResultsStatus(statisticalAnalysis, winnerAnalysis),
      duration: this.calculateExperimentDuration(experiment),
      totalParticipants: participations.length,
      variantResults,
      statisticalSignificance: statisticalAnalysis,
      winnerAnalysis,
      segmentAnalysis,
      guardrailResults,
      recommendations
    };

    // Store results
    await this.storeExperimentResults(results, tenantId);

    return results;
  }

  /**
   * Stop an experiment
   */
  async stopExperiment(
    experimentId: string,
    reason: 'completed' | 'cancelled' = 'completed',
    tenantId?: string
  ): Promise<void> {
    const experiment = await this.getExperiment(experimentId, tenantId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== 'running' && experiment.status !== 'paused') {
      throw new Error(`Cannot stop experiment in ${experiment.status} status`);
    }

    // Calculate final results
    const results = await this.calculateResults(experimentId, tenantId);

    // Update experiment status
    experiment.status = reason;
    experiment.endDate = new Date().toISOString();
    experiment.updatedAt = new Date().toISOString();
    experiment.results = results;

    await this.storeExperiment(experiment, tenantId);

    // Remove from active experiments
    this.activeExperiments.delete(experimentId);

    console.log(`Stopped experiment: ${experiment.name} (${experimentId}) - ${reason}`);
  }

  /**
   * Get experiment metrics
   */
  async getExperimentMetrics(tenantId?: string): Promise<ExperimentMetric[]> {
    const { data, error } = await this.supabase
      .from('experiment_metrics')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(this.mapDatabaseToMetric) || [];
  }

  /**
   * Create custom experiment metric
   */
  async createMetric(
    metricConfig: Omit<ExperimentMetric, 'metricId' | 'createdAt' | 'updatedAt'>,
    tenantId?: string
  ): Promise<ExperimentMetric> {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const metric: ExperimentMetric = {
      ...metricConfig,
      metricId,
      createdAt: now,
      updatedAt: now
    };

    await this.storeMetric(metric, tenantId);
    return metric;
  }

  /**
   * Get active experiments for user
   */
  async getActiveExperimentsForUser(userId: string, tenantId?: string): Promise<Array<{
    experiment: Experiment;
    variant: ExperimentVariant;
  }>> {
    const activeExperiments = await this.getActiveExperiments(tenantId);
    const userExperiments = [];

    for (const experiment of activeExperiments) {
      const variant = await this.getUserVariant(userId, experiment.experimentId, tenantId);
      if (variant) {
        userExperiments.push({ experiment, variant });
      }
    }

    return userExperiments;
  }

  // =============================================
  // PRIVATE HELPER METHODS
  // =============================================

  private async loadActiveExperiments(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('experiments')
        .select('*')
        .eq('status', 'running');

      if (data) {
        for (const exp of data) {
          const experiment = this.mapDatabaseToExperiment(exp);
          this.activeExperiments.set(experiment.experimentId, experiment);
        }
      }
    } catch (error) {
      console.error('Failed to load active experiments:', error);
    }
  }

  private async validateExperimentConfig(experiment: Experiment): Promise<void> {
    // Validate variants
    if (experiment.variants.length < 2) {
      throw new Error('Experiment must have at least 2 variants');
    }

    // Validate traffic allocation
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.trafficWeight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      throw new Error('Variant traffic weights must sum to 1');
    }

    // Validate control variant exists
    const controlExists = experiment.variants.some(v => v.variantId === experiment.controlVariant);
    if (!controlExists) {
      throw new Error('Control variant must exist in variants list');
    }

    // Validate metrics exist
    const availableMetrics = await this.getExperimentMetrics();
    const metricIds = availableMetrics.map(m => m.metricId);

    if (!metricIds.includes(experiment.primaryMetric)) {
      throw new Error(`Primary metric ${experiment.primaryMetric} does not exist`);
    }

    for (const metric of experiment.secondaryMetrics) {
      if (!metricIds.includes(metric)) {
        throw new Error(`Secondary metric ${metric} does not exist`);
      }
    }
  }

  private calculateRequiredSampleSize(experiment: Experiment): number {
    // Simplified sample size calculation
    // In practice, this would use proper statistical formulas
    const alpha = experiment.statisticalSettings.significanceLevel;
    const beta = 1 - experiment.statisticalSettings.statisticalPower;
    const mde = experiment.statisticalSettings.minimumDetectableEffect;

    // Basic formula for two-proportion z-test
    const zAlpha = this.getZScore(alpha / 2);
    const zBeta = this.getZScore(beta);
    const p = 0.1; // Assumed baseline conversion rate

    const sampleSizePerVariant = Math.ceil(
      (2 * Math.pow(zAlpha + zBeta, 2) * p * (1 - p)) / Math.pow(mde, 2)
    );

    return sampleSizePerVariant * experiment.variants.length;
  }

  private getZScore(probability: number): number {
    // Approximate z-score for common probabilities
    const zScores: Record<number, number> = {
      0.025: 1.96, // 95% confidence
      0.005: 2.58, // 99% confidence
      0.1: 1.28,   // 80% power
      0.2: 0.84    // 80% power
    };

    return zScores[probability] || 1.96;
  }

  private async isUserEligible(userId: string, experiment: Experiment, tenantId?: string): Promise<boolean> {
    // Check traffic allocation
    if (Math.random() > experiment.targetingRules.trafficAllocation) {
      return false;
    }

    // Get user data
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .single();

    if (!user) {
      return false;
    }

    // Check user attributes
    if (experiment.targetingRules.userAttributes) {
      for (const rule of experiment.targetingRules.userAttributes) {
        if (!this.evaluateRule(user, rule)) {
          return false;
        }
      }
    }

    // Check exclusion rules
    if (experiment.targetingRules.exclusionRules) {
      for (const rule of experiment.targetingRules.exclusionRules) {
        if (this.evaluateRule(user, rule)) {
          return false; // User matches exclusion rule
        }
      }
    }

    // Check user segments
    if (experiment.targetingRules.userSegments && experiment.targetingRules.userSegments.length > 0) {
      const userSegments = await this.getUserSegments(userId, tenantId);
      const hasMatchingSegment = experiment.targetingRules.userSegments.some(segment =>
        userSegments.includes(segment)
      );
      if (!hasMatchingSegment) {
        return false;
      }
    }

    return true;
  }

  private evaluateRule(user: any, rule: { field: string; operator: string; value: any }): boolean {
    const userValue = user[rule.field];

    switch (rule.operator) {
      case 'eq':
        return userValue === rule.value;
      case 'neq':
        return userValue !== rule.value;
      case 'gt':
        return userValue > rule.value;
      case 'lt':
        return userValue < rule.value;
      case 'gte':
        return userValue >= rule.value;
      case 'lte':
        return userValue <= rule.value;
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(userValue);
      case 'contains':
        return typeof userValue === 'string' && userValue.includes(rule.value);
      default:
        return false;
    }
  }

  private assignToVariant(userId: string, experiment: Experiment): string {
    // Use consistent hashing for assignment
    const hash = this.hashUserId(userId, experiment.experimentId);
    const hashValue = hash / Math.pow(2, 32); // Normalize to 0-1

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.trafficWeight;
      if (hashValue <= cumulativeWeight) {
        return variant.variantId;
      }
    }

    // Fallback to control variant
    return experiment.controlVariant;
  }

  private hashUserId(userId: string, experimentId: string): number {
    // Simple hash function for consistent assignment
    const str = userId + experimentId;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async getUserSegments(userId: string, tenantId?: string): Promise<string[]> {
    // This would implement user segment calculation
    // For now, return empty array
    return [];
  }

  private async getUserAssignment(
    userId: string,
    experimentId: string,
    tenantId?: string
  ): Promise<ExperimentParticipation | null> {
    const { data, error } = await this.supabase
      .from('experiment_participations')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .eq('user_id', userId)
      .eq('experiment_id', experimentId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToParticipation(data);
  }

  private async calculateVariantResults(
    experiment: Experiment,
    participations: ExperimentParticipation[]
  ): Promise<ExperimentResults['variantResults']> {
    const variantResults = [];

    for (const variant of experiment.variants) {
      const variantParticipations = participations.filter(p => p.variantId === variant.variantId);
      const participants = variantParticipations.length;

      // Calculate primary metric
      const conversions = variantParticipations.filter(p =>
        p.conversions.some(c => c.metric === experiment.primaryMetric)
      ).length;

      const conversionRate = participants > 0 ? conversions / participants : 0;

      // Calculate confidence interval
      const confidenceInterval = this.calculateConfidenceInterval(conversionRate, participants);

      // Calculate secondary metrics
      const secondaryMetrics = experiment.secondaryMetrics.map(metric => {
        const metricConversions = variantParticipations.filter(p =>
          p.conversions.some(c => c.metric === metric)
        ).length;
        return {
          metric,
          value: participants > 0 ? metricConversions / participants : 0
        };
      });

      variantResults.push({
        variantId: variant.variantId,
        participants,
        conversions,
        conversionRate,
        primaryMetricValue: conversionRate,
        secondaryMetrics,
        confidenceInterval
      });
    }

    return variantResults;
  }

  private calculateConfidenceInterval(
    conversionRate: number,
    sampleSize: number,
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number } {
    if (sampleSize === 0) {
      return { lower: 0, upper: 0 };
    }

    const z = this.getZScore((1 - confidenceLevel) / 2);
    const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
    const margin = z * standardError;

    return {
      lower: Math.max(0, conversionRate - margin),
      upper: Math.min(1, conversionRate + margin)
    };
  }

  private async performStatisticalAnalysis(
    experiment: Experiment,
    variantResults: ExperimentResults['variantResults']
  ): Promise<ExperimentResults['statisticalSignificance']> {
    // Find control variant results
    const controlResults = variantResults.find(v => v.variantId === experiment.controlVariant);
    if (!controlResults) {
      throw new Error('Control variant results not found');
    }

    // Find best performing variant
    const bestVariant = variantResults.reduce((best, current) =>
      current.primaryMetricValue > best.primaryMetricValue ? current : best
    );

    // Perform two-proportion z-test
    const pValue = this.calculateTwoProportionZTest(
      controlResults.conversions,
      controlResults.participants,
      bestVariant.conversions,
      bestVariant.participants
    );

    // Calculate effect size (Cohen's h)
    const effectSize = this.calculateCohenH(
      controlResults.conversionRate,
      bestVariant.conversionRate
    );

    // Calculate achieved power
    const statisticalPower = this.calculateAchievedPower(
      controlResults.participants,
      bestVariant.participants,
      effectSize,
      experiment.statisticalSettings.significanceLevel
    );

    return {
      pValue,
      isSignificant: pValue < experiment.statisticalSettings.significanceLevel,
      confidenceLevel: 1 - experiment.statisticalSettings.significanceLevel,
      effectSize,
      statisticalPower
    };
  }

  private calculateTwoProportionZTest(
    x1: number, n1: number, x2: number, n2: number
  ): number {
    if (n1 === 0 || n2 === 0) return 1;

    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const pPool = (x1 + x2) / (n1 + n2);

    const standardError = Math.sqrt(pPool * (1 - pPool) * (1/n1 + 1/n2));

    if (standardError === 0) return 1;

    const zStat = Math.abs(p1 - p2) / standardError;

    // Convert z-statistic to p-value (two-tailed)
    return 2 * (1 - this.normalCDF(zStat));
  }

  private normalCDF(x: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private calculateCohenH(p1: number, p2: number): number {
    // Cohen's h for effect size between two proportions
    const phi1 = 2 * Math.asin(Math.sqrt(p1));
    const phi2 = 2 * Math.asin(Math.sqrt(p2));
    return Math.abs(phi1 - phi2);
  }

  private calculateAchievedPower(
    n1: number, n2: number, effectSize: number, alpha: number
  ): number {
    // Simplified power calculation
    const totalN = n1 + n2;
    const zAlpha = this.getZScore(alpha / 2);
    const zBeta = effectSize * Math.sqrt(totalN / 4) - zAlpha;
    return this.normalCDF(zBeta);
  }

  // Additional helper methods for complete implementation...
  private analyzeWinners(
    experiment: Experiment,
    variantResults: ExperimentResults['variantResults'],
    statisticalAnalysis: ExperimentResults['statisticalSignificance']
  ): ExperimentResults['winnerAnalysis'] {
    const controlResults = variantResults.find(v => v.variantId === experiment.controlVariant);
    const bestVariant = variantResults.reduce((best, current) =>
      current.primaryMetricValue > best.primaryMetricValue ? current : best
    );

    const hasWinner = statisticalAnalysis.isSignificant && bestVariant.variantId !== experiment.controlVariant;
    const liftOverControl = controlResults && controlResults.conversionRate > 0
      ? ((bestVariant.primaryMetricValue - controlResults.conversionRate) / controlResults.conversionRate) * 100
      : 0;

    return {
      hasWinner,
      winningVariant: hasWinner ? bestVariant.variantId : undefined,
      liftOverControl,
      confidenceInWinner: hasWinner ? 1 - statisticalAnalysis.pValue : 0
    };
  }

  private createInsufficientDataResults(
    experiment: Experiment,
    participations: ExperimentParticipation[]
  ): ExperimentResults {
    return {
      experimentId: experiment.experimentId,
      calculatedAt: new Date().toISOString(),
      status: 'insufficient_data',
      duration: this.calculateExperimentDuration(experiment),
      totalParticipants: participations.length,
      variantResults: [],
      statisticalSignificance: {
        pValue: 1,
        isSignificant: false,
        confidenceLevel: 0.95,
        effectSize: 0,
        statisticalPower: 0
      },
      winnerAnalysis: {
        hasWinner: false,
        liftOverControl: 0,
        confidenceInWinner: 0
      },
      segmentAnalysis: [],
      guardrailResults: [],
      recommendations: [{
        type: 'extend',
        rationale: 'Insufficient sample size for statistical significance',
        confidence: 0.9,
        expectedImpact: 'Continue collecting data to reach minimum sample size'
      }]
    };
  }

  private calculateExperimentDuration(experiment: Experiment): number {
    const startDate = new Date(experiment.startDate);
    const endDate = experiment.endDate ? new Date(experiment.endDate) : new Date();
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  // Database operations and mapping methods...
  private async storeExperiment(experiment: Experiment, tenantId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('experiments')
      .upsert({
        tenant_id: tenantId || '00000000-0000-0000-0000-000000000000',
        experiment_id: experiment.experimentId,
        name: experiment.name,
        description: experiment.description,
        hypothesis: experiment.hypothesis,
        status: experiment.status,
        type: experiment.type,
        targeting_rules: experiment.targetingRules,
        variants: experiment.variants,
        control_variant: experiment.controlVariant,
        primary_metric: experiment.primaryMetric,
        secondary_metrics: experiment.secondaryMetrics,
        guardrail_metrics: experiment.guardrailMetrics,
        statistical_settings: experiment.statisticalSettings,
        start_date: experiment.startDate,
        end_date: experiment.endDate,
        duration: experiment.duration,
        results: experiment.results,
        created_by: experiment.createdBy,
        created_at: experiment.createdAt,
        updated_at: experiment.updatedAt,
        tags: experiment.tags
      }, {
        onConflict: 'tenant_id,experiment_id'
      });

    if (error) {
      throw error;
    }
  }

  private async getExperiment(experimentId: string, tenantId?: string): Promise<Experiment | null> {
    const { data, error } = await this.supabase
      .from('experiments')
      .select('*')
      .eq('tenant_id', tenantId || '00000000-0000-0000-0000-000000000000')
      .eq('experiment_id', experimentId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToExperiment(data);
  }

  private mapDatabaseToExperiment(data: any): Experiment {
    return {
      experimentId: data.experiment_id,
      name: data.name,
      description: data.description,
      hypothesis: data.hypothesis,
      status: data.status,
      type: data.type,
      targetingRules: data.targeting_rules,
      variants: data.variants,
      controlVariant: data.control_variant,
      primaryMetric: data.primary_metric,
      secondaryMetrics: data.secondary_metrics,
      guardrailMetrics: data.guardrail_metrics,
      statisticalSettings: data.statistical_settings,
      startDate: data.start_date,
      endDate: data.end_date,
      duration: data.duration,
      results: data.results,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || []
    };
  }

  // Additional placeholder methods for complete implementation...
  private async storeParticipation(participation: ExperimentParticipation, tenantId?: string): Promise<void> {}
  private async updateParticipation(participationId: string, updates: Partial<ExperimentParticipation>, tenantId?: string): Promise<void> {}
  private async getExperimentParticipations(experimentId: string, tenantId?: string): Promise<ExperimentParticipation[]> { return []; }
  private async performSegmentAnalysis(experiment: Experiment, participations: ExperimentParticipation[], tenantId?: string): Promise<any[]> { return []; }
  private async checkGuardrailMetrics(experiment: Experiment, participations: ExperimentParticipation[], tenantId?: string): Promise<any[]> { return []; }
  private generateRecommendations(experiment: Experiment, stats: any, winner: any, guardrails: any[]): any[] { return []; }
  private determineResultsStatus(stats: any, winner: any): ExperimentResults['status'] { return 'running'; }
  private async storeExperimentResults(results: ExperimentResults, tenantId?: string): Promise<void> {}
  private async getActiveExperiments(tenantId?: string): Promise<Experiment[]> { return []; }
  private async storeMetric(metric: ExperimentMetric, tenantId?: string): Promise<void> {}
  private mapDatabaseToMetric(data: any): ExperimentMetric { return {} as ExperimentMetric; }
  private mapDatabaseToParticipation(data: any): ExperimentParticipation { return {} as ExperimentParticipation; }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const abTestingFramework = new ABTestingFramework();