/**
 * Performance Reports Types
 * Comprehensive type definitions for detailed performance reports and progress tracking
 */

import React from 'react';

import type {
  AnalyticsDataPoint,
  ConfidenceInterval,
  TrendLine,
  ReadinessScore,
  SectionAnalytics,
  QuestionTypeHeatMapData,
  TimeManagementAnalytics,
  ScorePrediction,
  PeerComparisonData,
  StudyEfficiencyMetrics
} from './analytics-dashboard';

// ============================================================================
// CORE REPORT TYPES
// ============================================================================

export type ReportType =
  | 'weekly-progress'
  | 'topic-mastery'
  | 'error-analysis'
  | 'time-allocation'
  | 'improvement-velocity'
  | 'goal-tracking'
  | 'study-session';

export type ReportFormat = 'html' | 'pdf' | 'json';

export interface ReportMetadata {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  generatedDate: Date;
  dateRange: DateRange;
  userId: string;
  format: ReportFormat;
  version: string;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string; // e.g., "Last 7 days", "This week"
}

// ============================================================================
// WEEKLY PROGRESS REPORTS
// ============================================================================

export interface WeeklyProgressReport {
  metadata: ReportMetadata;
  summary: WeeklySummary;
  readinessScore: ReadinessScore;
  sectionBreakdown: SectionAnalytics[];
  keyMetrics: WeeklyMetric[];
  improvements: ImprovementHighlight[];
  recommendations: string[];
  goalProgress: GoalProgressSummary[];
}

export interface WeeklySummary {
  totalQuestions: number;
  totalTimeSpent: number; // minutes
  averageAccuracy: number; // 0-100%
  studyDays: number;
  strongestSection: string;
  weakestSection: string;
  biggestImprovement: string;
  primaryFocus: string;
}

export interface WeeklyMetric {
  name: string;
  value: number | string;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
  isGood: boolean; // whether the trend is positive
  description: string;
}

export interface ImprovementHighlight {
  area: string;
  improvement: number; // percentage points
  description: string;
  significance: 'high' | 'medium' | 'low';
}

// ============================================================================
// TOPIC MASTERY REPORTS
// ============================================================================

export interface TopicMasteryReport {
  metadata: ReportMetadata;
  overallMastery: MasteryScore;
  sectionMastery: SectionMasteryDetail[];
  questionTypeMastery: QuestionTypeMasteryDetail[];
  masteryProgression: MasteryProgression[];
  recommendations: MasteryRecommendation[];
}

export interface MasteryScore {
  overall: number; // 0-100%
  level: 'novice' | 'developing' | 'proficient' | 'advanced' | 'expert';
  confidenceInterval: ConfidenceInterval;
  trend: TrendLine;
  projectedLevel: string;
  timeToNextLevel: number; // estimated days
}

export interface SectionMasteryDetail {
  section: 'logical-reasoning' | 'reading-comprehension' | 'logic-games';
  name: string;
  mastery: number; // 0-100%
  level: string;
  questionsAttempted: number;
  accuracy: number;
  averageTime: number;
  strengths: string[];
  weaknesses: string[];
  trend: TrendLine;
}

export interface QuestionTypeMasteryDetail {
  questionType: string;
  section: string;
  mastery: number; // 0-100%
  accuracy: number;
  averageTime: number;
  attempts: number;
  lastPracticed: Date;
  trend: TrendLine;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface MasteryProgression {
  date: Date;
  overallMastery: number;
  sectionMastery: { [section: string]: number };
  milestone?: string;
}

export interface MasteryRecommendation {
  priority: 'high' | 'medium' | 'low';
  area: string;
  action: string;
  reasoning: string;
  estimatedImpact: number; // expected mastery point improvement
  timeCommitment: string;
}

// ============================================================================
// ERROR ANALYSIS REPORTS
// ============================================================================

export interface ErrorAnalysisReport {
  metadata: ReportMetadata;
  summary: ErrorSummary;
  errorPatterns: ErrorPattern[];
  frequentMistakes: FrequentMistake[];
  sectionErrors: SectionErrorAnalysis[];
  improvementPlan: ErrorImprovementPlan;
}

export interface ErrorSummary {
  totalErrors: number;
  errorRate: number; // 0-1
  mostCommonError: string;
  mostCostlyError: string; // highest impact
  errorTrend: TrendLine;
  reductionSinceLastWeek: number; // percentage
}

export interface ErrorPattern {
  pattern: string;
  description: string;
  frequency: number;
  sections: string[];
  questionTypes: string[];
  examples: ErrorExample[];
  rootCause: string;
  remedy: string;
}

export interface ErrorExample {
  questionId: string;
  section: string;
  questionType: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  date: Date;
}

export interface FrequentMistake {
  mistake: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastOccurred: Date;
  quickFix: string;
}

export interface SectionErrorAnalysis {
  section: string;
  errorRate: number;
  commonErrors: string[];
  trend: TrendLine;
  comparison: 'better' | 'worse' | 'similar'; // compared to other sections
}

export interface ErrorImprovementPlan {
  focusAreas: string[];
  actions: ImprovementAction[];
  timeline: string;
  expectedImprovement: number;
}

export interface ImprovementAction {
  action: string;
  priority: number;
  timeEstimate: string;
  expectedImpact: 'high' | 'medium' | 'low';
}

// ============================================================================
// TIME ALLOCATION REPORTS
// ============================================================================

export interface TimeAllocationReport {
  metadata: ReportMetadata;
  totalTime: TimeBreakdown;
  sectionAllocation: SectionTimeAllocation[];
  efficiencyMetrics: EfficiencyMetric[];
  timeOptimization: TimeOptimizationSuggestion[];
  idealAllocation: IdealTimeAllocation;
}

export interface TimeBreakdown {
  total: number; // minutes
  studying: number;
  testing: number;
  reviewing: number;
  idle: number;
  averageSessionLength: number;
  sessionsCount: number;
}

export interface SectionTimeAllocation {
  section: string;
  timeSpent: number; // minutes
  percentage: number;
  questionsAnswered: number;
  averageTimePerQuestion: number;
  efficiency: number; // accuracy per minute
  recommendation: 'increase' | 'decrease' | 'maintain';
}

export interface EfficiencyMetric {
  metric: string;
  value: number;
  unit: string;
  benchmark: number;
  performance: 'above' | 'below' | 'at';
  improvement: number;
}

export interface TimeOptimizationSuggestion {
  area: string;
  currentTime: number;
  suggestedTime: number;
  reasoning: string;
  expectedBenefit: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export interface IdealTimeAllocation {
  sections: { [section: string]: number }; // percentage
  rationale: string;
  targetEfficiency: number;
  estimatedScoreImprovement: number;
}

// ============================================================================
// IMPROVEMENT VELOCITY REPORTS
// ============================================================================

export interface ImprovementVelocityReport {
  metadata: ReportMetadata;
  overallVelocity: VelocityMetric;
  sectionVelocity: SectionVelocityDetail[];
  velocityTrends: VelocityTrend[];
  projections: VelocityProjection[];
  benchmarks: VelocityBenchmark[];
}

export interface VelocityMetric {
  value: number; // improvement points per week
  unit: string;
  trend: TrendLine;
  acceleration: number; // change in velocity
  consistency: number; // 0-1, how consistent the improvement is
  peakVelocity: number;
  currentPhase: 'acceleration' | 'steady' | 'plateau' | 'regression';
}

export interface SectionVelocityDetail {
  section: string;
  velocity: VelocityMetric;
  factors: VelocityFactor[];
  bottlenecks: string[];
  opportunities: string[];
}

export interface VelocityFactor {
  factor: string;
  impact: number; // -1 to 1
  description: string;
}

export interface VelocityTrend {
  period: string;
  velocity: number;
  events: string[]; // what happened during this period
}

export interface VelocityProjection {
  timeframe: string;
  projectedImprovement: number;
  confidence: number;
  assumptions: string[];
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface VelocityBenchmark {
  category: string;
  userVelocity: number;
  averageVelocity: number;
  topPercentileVelocity: number;
  position: number; // percentile
}

// ============================================================================
// GOAL TRACKING REPORTS
// ============================================================================

export interface GoalTrackingReport {
  metadata: ReportMetadata;
  activeGoals: Goal[];
  completedGoals: Goal[];
  overallProgress: GoalProgressOverview;
  milestones: Milestone[];
  recommendations: GoalRecommendation[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'score' | 'accuracy' | 'speed' | 'consistency' | 'custom';
  target: number;
  current: number;
  progress: number; // 0-100%
  deadline: Date;
  created: Date;
  status: 'active' | 'completed' | 'paused' | 'failed';
  priority: 'high' | 'medium' | 'low';
  category: string;
  milestones: Milestone[];
}

export interface GoalProgressOverview {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  completionRate: number;
  onTrackGoals: number;
  behindScheduleGoals: number;
  overallMomentum: 'strong' | 'moderate' | 'weak';
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  target: number;
  achieved: boolean;
  dateAchieved?: Date;
  daysToAchieve?: number;
  celebration?: string;
}

export interface GoalProgressSummary {
  goal: Goal;
  progressThisWeek: number;
  onTrack: boolean;
  daysRemaining: number;
  projectedCompletion: Date;
  risk: 'low' | 'medium' | 'high';
}

export interface GoalRecommendation {
  goalId: string;
  type: 'adjustment' | 'strategy' | 'timeline' | 'new-goal';
  recommendation: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

// ============================================================================
// STUDY SESSION REPORTS
// ============================================================================

export interface StudySessionReport {
  metadata: ReportMetadata;
  sessionSummary: SessionSummary;
  performance: SessionPerformance;
  insights: SessionInsight[];
  recommendations: SessionRecommendation[];
  nextSession: NextSessionPlan;
}

export interface SessionSummary {
  duration: number; // minutes
  questionsAnswered: number;
  sectionsStudied: string[];
  accuracy: number;
  focusScore: number; // 0-100, based on consistency
  completionRate: number;
  breaks: number;
  mood: 'excellent' | 'good' | 'neutral' | 'poor';
}

export interface SessionPerformance {
  overall: number;
  bySection: { [section: string]: number };
  improvement: number; // vs previous session
  strengths: string[];
  weaknesses: string[];
  surprises: string[];
}

export interface SessionInsight {
  type: 'pattern' | 'achievement' | 'concern' | 'tip';
  insight: string;
  evidence: string;
  actionable: boolean;
}

export interface SessionRecommendation {
  category: 'study-plan' | 'technique' | 'timing' | 'content';
  recommendation: string;
  priority: 'immediate' | 'this-week' | 'long-term';
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export interface NextSessionPlan {
  suggestedFocus: string[];
  estimatedDuration: number;
  difficulty: 'easier' | 'same' | 'harder';
  goals: string[];
  warmUpQuestions: number;
  mainContent: string;
  reviewTime: number;
}

// ============================================================================
// PDF EXPORT TYPES
// ============================================================================

export interface PDFExportOptions {
  includeCharts: boolean;
  includeDetailedData: boolean;
  colorScheme: 'color' | 'grayscale';
  pageSize: 'letter' | 'a4';
  orientation: 'portrait' | 'landscape';
  includeRawData: boolean;
  logoUrl?: string;
  customFooter?: string;
}

export interface PDFSection {
  title: string;
  content: string | React.ReactElement;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

export interface ReportGenerator {
  generateWeeklyProgress(userId: string, dateRange: DateRange): Promise<WeeklyProgressReport>;
  generateTopicMastery(userId: string, dateRange: DateRange): Promise<TopicMasteryReport>;
  generateErrorAnalysis(userId: string, dateRange: DateRange): Promise<ErrorAnalysisReport>;
  generateTimeAllocation(userId: string, dateRange: DateRange): Promise<TimeAllocationReport>;
  generateImprovementVelocity(userId: string, dateRange: DateRange): Promise<ImprovementVelocityReport>;
  generateGoalTracking(userId: string): Promise<GoalTrackingReport>;
  generateStudySession(userId: string, sessionId: string): Promise<StudySessionReport>;
  exportToPDF(report: any, options: PDFExportOptions): Promise<Buffer>;
}