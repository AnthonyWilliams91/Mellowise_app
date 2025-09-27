/**
 * Advanced Analytics Dashboard Types
 * Comprehensive type definitions for detailed performance analytics and progress tracking
 */

// ============================================================================
// CORE ANALYTICS TYPES
// ============================================================================

export interface AnalyticsDataPoint {
  date: Date;
  value: number;
  label: string;
  metadata?: { [key: string]: any };
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number; // 0-1 (e.g., 0.95 for 95% confidence)
}

export interface TrendLine {
  slope: number; // Rate of change per unit time
  intercept: number;
  rSquared: number; // Goodness of fit (0-1)
  direction: 'improving' | 'declining' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

// ============================================================================
// READINESS SCORING
// ============================================================================

export interface ReadinessScore {
  overall: number; // 0-100 overall readiness percentage
  confidenceInterval: ConfidenceInterval;
  lastUpdated: Date;
  factors: ReadinessFactor[];
  trend: TrendLine;
  projectedScoreRange: {
    min: number; // LSAT 120-180 scale
    max: number;
    mostLikely: number;
    confidence: number;
  };
}

export interface ReadinessFactor {
  category: 'accuracy' | 'speed' | 'consistency' | 'endurance' | 'recent_performance';
  name: string;
  weight: number; // 0-1, sum of all weights = 1
  score: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  recommendations?: string[];
}

// ============================================================================
// SECTION-SPECIFIC ANALYTICS
// ============================================================================

export interface SectionAnalytics {
  sectionType: 'logical_reasoning' | 'reading_comprehension' | 'logic_games';
  readinessPercentage: number; // 0-100
  trend: TrendLine;
  performance: {
    accuracy: number; // 0-100
    averageTime: number; // seconds per question
    consistency: number; // 0-100, inverse of variance
    improvement: number; // points improved over time period
  };
  weaknessesIdentified: string[];
  strengthsIdentified: string[];
  recommendations: SectionRecommendation[];
  historicalData: AnalyticsDataPoint[];
}

export interface SectionRecommendation {
  type: 'time_management' | 'accuracy_focus' | 'concept_review' | 'practice_intensity';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedImpact: number; // 0-100 expected improvement
  timeToImplement: number; // hours
}

// ============================================================================
// QUESTION TYPE HEAT MAP
// ============================================================================

export interface QuestionTypeHeatMapData {
  questionType: string;
  accuracy: number; // 0-100
  attemptCount: number;
  averageTime: number; // seconds
  difficulty: number; // 1-10 scale
  recentTrend: 'improving' | 'declining' | 'stable';
  color: string; // Hex color for heat map
  priority: 'focus_needed' | 'maintain' | 'strong';
}

export interface HeatMapConfig {
  colorScale: {
    excellent: string; // 85%+ accuracy
    good: string;     // 70-84% accuracy
    average: string;  // 55-69% accuracy
    needs_work: string; // <55% accuracy
  };
  filters: {
    dateRange: DateRange;
    sectionTypes: string[];
    difficultyRange: [number, number];
    minAttempts: number;
  };
  grouping: 'by_section' | 'by_difficulty' | 'by_topic' | 'flat';
}

// ============================================================================
// TIME MANAGEMENT ANALYTICS
// ============================================================================

export interface TimeManagementAnalytics {
  speedVsAccuracy: SpeedAccuracyData[];
  optimalTimingZone: {
    minTime: number; // seconds per question
    maxTime: number;
    targetAccuracy: number; // 0-100
    description: string;
  };
  timeDistribution: {
    tooFast: number; // percentage of questions answered too quickly
    optimal: number; // percentage in optimal range
    tooSlow: number; // percentage taking too long
  };
  pacing: {
    consistency: number; // 0-100
    variance: number; // seconds variance from average
    rushingTendency: number; // 0-100, higher = more rushing
    deliberationScore: number; // 0-100, time spent on difficult questions
  };
  recommendations: TimingRecommendation[];
}

export interface SpeedAccuracyData {
  timeRange: string; // e.g., "30-45s", "45-60s"
  averageTime: number;
  accuracy: number;
  questionCount: number;
  efficiency: number; // composite score of speed + accuracy
}

export interface TimingRecommendation {
  area: 'pacing' | 'time_allocation' | 'question_selection' | 'review_strategy';
  description: string;
  currentBehavior: string;
  targetBehavior: string;
  expectedImprovement: string;
}

// ============================================================================
// SCORE PREDICTION
// ============================================================================

export interface ScorePrediction {
  predictedScore: number; // LSAT 120-180 scale
  confidenceInterval: ConfidenceInterval;
  predictionDate: Date;
  basedOn: {
    practiceTests: number;
    questionsSolved: number;
    studyHours: number;
    timeSpan: number; // days
  };
  factors: PredictionFactor[];
  scenarios: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  timeToTarget?: {
    targetScore: number;
    estimatedDays: number;
    confidence: number;
    requirements: string[];
  };
}

export interface PredictionFactor {
  name: string;
  currentValue: number;
  impact: number; // -10 to +10 points impact on score
  confidence: number; // 0-1
  description: string;
}

// ============================================================================
// PEER COMPARISON (ANONYMIZED)
// ============================================================================

export interface PeerComparisonData {
  userPercentile: number; // 0-100
  cohortSize: number;
  demographics: {
    studyTimeRange: string; // e.g., "50-100 hours"
    targetScoreRange: string; // e.g., "160-170"
    studyDuration: string; // e.g., "3-6 months"
  };
  metrics: PeerMetric[];
  strengthsVsPeers: string[];
  improvementAreas: string[];
  anonymizedInsights: string[];
}

export interface PeerMetric {
  category: string;
  userValue: number;
  peerAverage: number;
  peerRange: [number, number];
  percentile: number;
  interpretation: string;
}

// ============================================================================
// STUDY EFFICIENCY
// ============================================================================

export interface StudyEfficiencyMetrics {
  hoursToPointImprovement: number; // hours of study per LSAT point gained
  learningVelocity: number; // points per week improvement rate
  retentionRate: number; // 0-100, knowledge retention over time
  efficiency: {
    overall: number; // 0-100 composite efficiency score
    byActivity: ActivityEfficiency[];
    trends: AnalyticsDataPoint[];
  };
  recommendations: EfficiencyRecommendation[];
  burnoutRisk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    suggestions: string[];
  };
}

export interface ActivityEfficiency {
  activity: string; // e.g., "practice_tests", "logical_reasoning_drills"
  timeSpent: number; // hours
  improvement: number; // points gained
  efficiency: number; // improvement per hour
  recommendation: string;
}

export interface EfficiencyRecommendation {
  type: 'focus_shift' | 'intensity_change' | 'method_change' | 'break_needed';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedBenefit: string;
  implementation: string[];
}

// ============================================================================
// DATE RANGE & FILTERING
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'last_week' | 'last_month' | 'last_3_months' | 'all_time' | 'custom';
  label?: string;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  sectionTypes: string[];
  questionTypes: string[];
  difficultyRange: [number, number];
  performanceThreshold: number; // 0-100
  includeExperimental: boolean;
  minAttempts: number;
}

// ============================================================================
// DASHBOARD CONFIGURATION
// ============================================================================

export interface DashboardConfig {
  userId: string;
  layout: DashboardLayout[];
  preferences: {
    defaultDateRange: DateRange;
    showConfidenceIntervals: boolean;
    alertsEnabled: boolean;
    updateFrequency: 'real_time' | 'hourly' | 'daily';
  };
  goals: {
    targetScore: number;
    targetDate: Date;
    milestones: Milestone[];
  };
}

export interface DashboardLayout {
  id: string;
  type: 'readiness_score' | 'section_analytics' | 'heat_map' | 'time_management'
       | 'score_prediction' | 'peer_comparison' | 'efficiency' | 'trends';
  position: { x: number; y: number; width: number; height: number };
  config: { [key: string]: any };
  visible: boolean;
}

export interface Milestone {
  id: string;
  targetScore: number;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
  description: string;
}

// ============================================================================
// COMPREHENSIVE ANALYTICS RESPONSE
// ============================================================================

export interface AnalyticsDashboardData {
  userId: string;
  generatedAt: Date;
  dataRange: DateRange;

  readinessScore: ReadinessScore;
  sectionAnalytics: SectionAnalytics[];
  questionTypeHeatMap: QuestionTypeHeatMapData[];
  timeManagement: TimeManagementAnalytics;
  scorePrediction: ScorePrediction;
  peerComparison: PeerComparisonData;
  studyEfficiency: StudyEfficiencyMetrics;

  insights: {
    keyFindings: string[];
    actionItems: ActionItem[];
    alerts: AnalyticsAlert[];
  };

  metadata: {
    dataPoints: number;
    lastActivity: Date;
    completionRate: number; // 0-100
    reliability: number; // 0-100, data reliability score
  };
}

export interface ActionItem {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  timeToComplete: string;
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
}

export interface AnalyticsAlert {
  id: string;
  type: 'improvement' | 'decline' | 'milestone' | 'warning' | 'insight';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

// ============================================================================
// CHART DATA INTERFACES (FOR RECHARTS)
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
  metadata?: { [key: string]: any };
}

export interface TrendChartData {
  date: string; // ISO date string for x-axis
  score: number;
  target?: number;
  confidence_upper?: number;
  confidence_lower?: number;
  [key: string]: any; // Additional metrics
}

export interface HeatMapCell {
  x: string; // column identifier
  y: string; // row identifier
  value: number; // 0-100 for coloring
  displayValue?: string; // formatted display text
  tooltip?: string;
  color?: string;
}

export interface ComparativeBarData {
  category: string;
  user: number;
  peer_average: number;
  peer_75th?: number;
  peer_90th?: number;
  target?: number;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface GetAnalyticsRequest {
  userId: string;
  filters: AnalyticsFilter;
  includeComponents: (keyof AnalyticsDashboardData)[];
}

export interface GetAnalyticsResponse {
  success: boolean;
  data?: AnalyticsDashboardData;
  error?: string;
  cached?: boolean;
  cacheExpiry?: Date;
}

export interface UpdateGoalsRequest {
  userId: string;
  targetScore: number;
  targetDate: Date;
  milestones?: Milestone[];
}

export interface ExportAnalyticsRequest {
  userId: string;
  format: 'json' | 'csv' | 'pdf';
  filters: AnalyticsFilter;
  components: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | '6m' | '1y' | 'all';

export type PerformanceLevel = 'excellent' | 'good' | 'average' | 'needs_improvement' | 'critical';

export type ImprovementDirection = 'significant_improvement' | 'improvement' | 'stable' | 'decline' | 'significant_decline';

export interface PerformanceGrade {
  level: PerformanceLevel;
  score: number; // 0-100
  description: string;
  color: string; // For UI theming
}

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const ANALYTICS_CONSTANTS = {
  SCORE_RANGES: {
    EXCELLENT: 85,
    GOOD: 70,
    AVERAGE: 55,
    NEEDS_WORK: 0
  },
  CONFIDENCE_LEVELS: {
    HIGH: 0.95,
    MEDIUM: 0.85,
    LOW: 0.70
  },
  UPDATE_FREQUENCIES: {
    REAL_TIME: 0,
    HOURLY: 3600000,
    DAILY: 86400000
  },
  CHART_COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    SUCCESS: '#22c55e',
    INFO: '#6366f1'
  }
} as const;