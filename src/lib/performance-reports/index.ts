/**
 * Performance Reports Module Index
 * Central export point for all performance reports functionality
 */

// Core report generation
export { ReportGeneratorService } from './report-generator';
export { PDFExportService } from './pdf-export';

// React components
export { default as PerformanceReportsPanel } from '@/components/analytics/PerformanceReportsPanel';

// Types
export type {
  // Core types
  ReportType,
  ReportFormat,
  ReportMetadata,
  DateRange,

  // Weekly progress types
  WeeklyProgressReport,
  WeeklySummary,
  WeeklyMetric,
  ImprovementHighlight,

  // Topic mastery types
  TopicMasteryReport,
  MasteryScore,
  SectionMasteryDetail,
  QuestionTypeMasteryDetail,
  MasteryProgression,
  MasteryRecommendation,

  // Error analysis types
  ErrorAnalysisReport,
  ErrorSummary,
  ErrorPattern,
  FrequentMistake,
  SectionErrorAnalysis,
  ErrorImprovementPlan,
  ImprovementAction,

  // Time allocation types
  TimeAllocationReport,
  TimeBreakdown,
  SectionTimeAllocation,
  EfficiencyMetric,
  TimeOptimizationSuggestion,
  IdealTimeAllocation,

  // Improvement velocity types
  ImprovementVelocityReport,
  VelocityMetric,
  SectionVelocityDetail,
  VelocityFactor,
  VelocityTrend,
  VelocityProjection,
  VelocityBenchmark,

  // Goal tracking types
  GoalTrackingReport,
  Goal,
  GoalProgressOverview,
  Milestone,
  GoalProgressSummary,
  GoalRecommendation,

  // Study session types
  StudySessionReport,
  SessionSummary,
  SessionPerformance,
  SessionInsight,
  SessionRecommendation,
  NextSessionPlan,

  // PDF export types
  PDFExportOptions,
  PDFSection,

  // Generator interface
  ReportGenerator
} from '@/types/performance-reports';

// Utility functions and constants
export const REPORT_TYPE_LABELS = {
  'weekly-progress': 'Weekly Progress Report',
  'topic-mastery': 'Topic Mastery Analysis',
  'error-analysis': 'Error Analysis Report',
  'time-allocation': 'Time Allocation Report',
  'improvement-velocity': 'Improvement Velocity Report',
  'goal-tracking': 'Goal Tracking Report',
  'study-session': 'Study Session Report'
} as const;

export const DEFAULT_DATE_RANGES = {
  LAST_WEEK: {
    label: 'Last 7 days',
    days: 7
  },
  LAST_MONTH: {
    label: 'Last 30 days',
    days: 30
  },
  LAST_QUARTER: {
    label: 'Last 3 months',
    days: 90
  }
} as const;

/**
 * Create a date range for report generation
 */
export function createDateRange(
  start: Date,
  end: Date,
  label?: string
): DateRange {
  return {
    start,
    end,
    label: label || `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  };
}

/**
 * Create a date range for the last N days
 */
export function createLastNDaysRange(days: number): DateRange {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  return createDateRange(start, end, `Last ${days} days`);
}

/**
 * Validate report generation parameters
 */
export function validateReportParams(
  userId: string,
  reportType: ReportType,
  dateRange: DateRange
): boolean {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID is required');
  }

  if (!reportType || !REPORT_TYPE_LABELS[reportType]) {
    throw new Error('Valid report type is required');
  }

  if (!dateRange || !dateRange.start || !dateRange.end) {
    throw new Error('Valid date range is required');
  }

  if (dateRange.start >= dateRange.end) {
    throw new Error('Start date must be before end date');
  }

  return true;
}