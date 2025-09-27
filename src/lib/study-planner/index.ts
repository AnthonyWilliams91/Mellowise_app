/**
 * Study Plan Generator Module
 * MELLOWISE-030: Export all study planning services and utilities
 */

// Core service
export { StudyPlanGenerator } from './plan-generator';

// Types and interfaces
export type {
  StudyPlan,
  StudyGoal,
  StudySchedule,
  DiagnosticAssessment,
  StudySession,
  SessionType,
  SessionFocus,
  SessionContent,
  SessionResults,
  SessionFeedback,
  DailySchedule,
  WeeklyGoal,
  TimeAllocation,
  Milestone,
  PlanAdaptation,
  StudyProgress,
  GoalType,
  LSATSection,
  SchedulePattern,
  TimePreference,
  FlexibilitySettings,
  StudyCalendar,
  CalendarIntegration,
  TimeBlock,
  ScheduleConflict,
  ReminderSettings,
  SectionScore,
  SkillAssessment,
  LearningStyle,
  LearningStyleType,
  TimeManagementAssessment,
  AssessmentRecommendation,
  SectionProgress,
  SkillProgress,
  TimelineProgress,
  MilestoneProgress,
  ProgressPredictions,
  AdaptationTrigger,
  AdaptationType,
  PlanChange,
  AdaptationImpact,
  PlanSettings,
  DifficultyProgression,
  ReviewStrategy,
  GoalAdjustmentSettings,
  MilestoneType,
  MilestoneCriteria,
  MilestoneReward,
  DEFAULT_PLAN_SETTINGS,
  DEFAULT_FLEXIBILITY_SETTINGS
} from '@/types/study-planner';

// Type guards
export {
  isStudyPlan,
  isStudySession,
  isMilestone
} from '@/types/study-planner';