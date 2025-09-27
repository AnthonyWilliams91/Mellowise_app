/**
 * Study Plan Generator Types
 * MELLOWISE-030: Complete type definitions for personalized study planning system
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Personalized study plan
 */
export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  targetDate: Date;
  goals: StudyGoal[];
  schedule: StudySchedule;
  assessment: DiagnosticAssessment;
  progress: StudyProgress;
  settings: PlanSettings;
  milestones: Milestone[];
  adaptations: PlanAdaptation[];
}

/**
 * Study goal definition
 */
export interface StudyGoal {
  id: string;
  type: GoalType;
  target: GoalTarget;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-1 scale
  description: string;
  metrics: GoalMetrics;
}

/**
 * Types of study goals
 */
export type GoalType =
  | 'target-score'        // Specific LSAT score target
  | 'score-improvement'   // Improve by X points
  | 'section-mastery'     // Master specific section
  | 'question-accuracy'   // Accuracy percentage target
  | 'speed-improvement'   // Time per question target
  | 'daily-practice'      // Daily study time/questions
  | 'test-readiness'      // General test preparation
  | 'weakness-elimination'; // Address weak areas

/**
 * Goal target specification
 */
export interface GoalTarget {
  value: number | string;
  unit: string;
  baseline?: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'total';
  sections?: LSATSection[];
  questionTypes?: string[];
}

/**
 * Goal progress metrics
 */
export interface GoalMetrics {
  currentValue: number;
  targetValue: number;
  completionRate: number; // 0-1 scale
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
  achievementHistory: AchievementPoint[];
  estimatedCompletion?: Date;
}

/**
 * Achievement point in time
 */
export interface AchievementPoint {
  date: Date;
  value: number;
  context: string;
  milestone?: boolean;
}

/**
 * Study schedule structure
 */
export interface StudySchedule {
  pattern: SchedulePattern;
  dailySchedules: DailySchedule[];
  weeklyGoals: WeeklyGoal[];
  timeAllocation: TimeAllocation;
  flexibility: FlexibilitySettings;
  calendar: StudyCalendar;
}

/**
 * Schedule pattern configuration
 */
export interface SchedulePattern {
  type: 'intensive' | 'moderate' | 'light' | 'custom';
  totalHoursPerWeek: number;
  daysPerWeek: number;
  sessionDuration: number; // average minutes
  preferredTimes: TimePreference[];
  restDays: number[]; // days of week (0-6)
  adaptiveScheduling: boolean;
}

/**
 * Daily schedule specification
 */
export interface DailySchedule {
  date: Date;
  dayOfWeek: number; // 0-6
  plannedSessions: StudySession[];
  totalPlannedTime: number;
  actualSessions: StudySession[];
  totalActualTime: number;
  completionRate: number;
  notes?: string;
  adaptations: string[];
}

/**
 * Individual study session
 */
export interface StudySession {
  id: string;
  planId: string;
  date: Date;
  startTime: string; // "HH:MM" format
  duration: number; // minutes
  type: SessionType;
  focus: SessionFocus;
  content: SessionContent;
  status: 'scheduled' | 'in-progress' | 'completed' | 'skipped' | 'rescheduled';
  results?: SessionResults;
  feedback?: SessionFeedback;
}

/**
 * Session types
 */
export type SessionType =
  | 'diagnostic'      // Assessment/testing
  | 'practice'        // Regular practice
  | 'review'          // Review mistakes
  | 'drill'           // Focused skill building
  | 'timed-practice'  // Timed sections
  | 'full-test'       // Complete practice test
  | 'analysis'        // Performance analysis
  | 'break';          // Rest/recovery

/**
 * Session focus areas
 */
export interface SessionFocus {
  primarySection: LSATSection;
  secondarySection?: LSATSection;
  questionTypes: string[];
  difficultyRange: [number, number]; // min, max difficulty
  skills: string[];
  weakAreas: string[];
  reviewTopics: string[];
}

/**
 * Session content specification
 */
export interface SessionContent {
  questionCount: number;
  estimatedDuration: number;
  resources: StudyResource[];
  instructions: string;
  prerequisites: string[];
  objectives: string[];
}

/**
 * Study resource reference
 */
export interface StudyResource {
  id: string;
  type: 'question-set' | 'passage' | 'game' | 'explanation' | 'video' | 'article';
  title: string;
  description: string;
  url?: string;
  estimatedTime: number;
  difficulty: number;
  section: LSATSection;
  tags: string[];
}

/**
 * Session completion results
 */
export interface SessionResults {
  completedAt: Date;
  actualDuration: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  averageTimePerQuestion: number;
  sectionsCompleted: LSATSection[];
  skillsImproved: string[];
  newWeaknesses: string[];
  satisfactionRating: number; // 1-5 scale
}

/**
 * Session feedback
 */
export interface SessionFeedback {
  difficulty: 'too-easy' | 'appropriate' | 'too-hard';
  pacing: 'too-slow' | 'appropriate' | 'too-fast';
  engagement: number; // 1-5 scale
  confidence: number; // 1-5 scale
  notes: string;
  suggestions: string[];
  wouldRecommend: boolean;
}

/**
 * Weekly goal tracking
 */
export interface WeeklyGoal {
  weekStarting: Date;
  targetHours: number;
  targetQuestions: number;
  targetAccuracy: number;
  actualHours: number;
  actualQuestions: number;
  actualAccuracy: number;
  completionRate: number;
  achievements: string[];
  challenges: string[];
}

/**
 * Time allocation across sections/skills
 */
export interface TimeAllocation {
  logicalReasoning: number; // percentage
  readingComprehension: number;
  logicGames: number;
  review: number;
  testing: number;
  analysis: number;
  adaptive: boolean; // Adjust based on performance
  lastUpdated: Date;
}

/**
 * Flexibility and adaptation settings
 */
export interface FlexibilitySettings {
  allowRescheduling: boolean;
  maxRescheduleHours: number;
  adaptToDifficulty: boolean;
  adaptToPerformance: boolean;
  adaptToSchedule: boolean;
  bufferTime: number; // minutes
  makeupSessions: boolean;
  emergencyMode: EmergencyModeSettings;
}

/**
 * Emergency mode for time-constrained situations
 */
export interface EmergencyModeSettings {
  enabled: boolean;
  triggerDaysRemaining: number;
  intensifySchedule: boolean;
  focusOnWeaknesses: boolean;
  reduceBreaks: boolean;
  prioritizeHighYield: boolean;
}

/**
 * Study calendar integration
 */
export interface StudyCalendar {
  integratedCalendars: CalendarIntegration[];
  blockedTimes: TimeBlock[];
  preferredTimes: TimeBlock[];
  timezone: string;
  reminders: ReminderSettings;
  conflicts: ScheduleConflict[];
}

/**
 * Calendar integration settings
 */
export interface CalendarIntegration {
  id: string;
  type: 'google' | 'outlook' | 'apple' | 'other';
  connected: boolean;
  lastSyncAt?: Date;
  syncEnabled: boolean;
  createEvents: boolean;
  readAvailability: boolean;
  calendarId?: string;
}

/**
 * Time block definition
 */
export interface TimeBlock {
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  recurring: boolean;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Time preferences
 */
export interface TimePreference {
  dayOfWeek: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  productivity: number; // 1-5 scale
  availability: number; // 1-5 scale
}

/**
 * Schedule conflict detection
 */
export interface ScheduleConflict {
  id: string;
  date: Date;
  conflictType: 'calendar-event' | 'double-booking' | 'insufficient-time' | 'blocked-time';
  description: string;
  suggestedResolution: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedAt?: Date;
}

/**
 * Reminder configuration
 */
export interface ReminderSettings {
  enabled: boolean;
  methods: ReminderMethod[];
  timing: ReminderTiming[];
  customMessages: boolean;
  motivationalContent: boolean;
  progressUpdates: boolean;
}

/**
 * Reminder delivery method
 */
export interface ReminderMethod {
  type: 'push' | 'email' | 'sms' | 'in-app';
  enabled: boolean;
  preferences: Record<string, any>;
}

/**
 * Reminder timing configuration
 */
export interface ReminderTiming {
  event: 'session-start' | 'session-end' | 'daily-goal' | 'weekly-review' | 'milestone';
  offsetMinutes: number;
  enabled: boolean;
}

// ============================================================================
// DIAGNOSTIC ASSESSMENT
// ============================================================================

/**
 * Comprehensive diagnostic assessment
 */
export interface DiagnosticAssessment {
  id: string;
  userId: string;
  completedAt: Date;
  overallScore: number;
  estimatedLSATScore: number;
  confidenceInterval: [number, number];
  sectionScores: SectionScore[];
  skillAssessment: SkillAssessment[];
  learningStyle: LearningStyle;
  timeManagement: TimeManagementAssessment;
  recommendations: AssessmentRecommendation[];
  retakeDate?: Date;
}

/**
 * Section-specific score
 */
export interface SectionScore {
  section: LSATSection;
  rawScore: number;
  scaledScore: number;
  percentile: number;
  accuracy: number;
  averageTime: number;
  strengths: string[];
  weaknesses: string[];
  questionTypeBreakdown: QuestionTypeScore[];
}

/**
 * Question type performance
 */
export interface QuestionTypeScore {
  type: string;
  attempted: number;
  correct: number;
  accuracy: number;
  averageTime: number;
  difficulty: number;
  confidence: number;
}

/**
 * Skill-based assessment
 */
export interface SkillAssessment {
  skill: string;
  category: 'logical-reasoning' | 'reading-comprehension' | 'logic-games' | 'general';
  level: number; // 1-10 scale
  confidence: number; // 1-5 scale
  practiceRecommended: number; // hours
  priority: 'critical' | 'high' | 'medium' | 'low';
  relatedSkills: string[];
}

/**
 * Learning style identification
 */
export interface LearningStyle {
  primary: LearningStyleType;
  secondary?: LearningStyleType;
  preferences: LearningPreferences;
  strengths: string[];
  adaptations: string[];
}

/**
 * Learning style types
 */
export type LearningStyleType =
  | 'visual'          // Learn through diagrams, charts
  | 'auditory'        // Learn through explanation, discussion
  | 'kinesthetic'     // Learn through practice, interaction
  | 'analytical'      // Learn through logic, patterns
  | 'sequential'      // Learn step-by-step
  | 'global';         // Learn big picture first

/**
 * Learning preferences
 */
export interface LearningPreferences {
  explanationStyle: 'detailed' | 'concise' | 'example-heavy';
  practiceStyle: 'drill' | 'mixed' | 'progressive';
  feedbackTiming: 'immediate' | 'after-section' | 'after-session';
  difficultyProgression: 'gradual' | 'adaptive' | 'challenging';
  reviewFrequency: 'daily' | 'weekly' | 'as-needed';
  studyEnvironment: 'quiet' | 'background-noise' | 'variable';
}

/**
 * Time management assessment
 */
export interface TimeManagementAssessment {
  overallEfficiency: number; // 0-1 scale
  pacing: PacingAssessment;
  timeDistribution: TimeDistribution;
  rushingTendency: number; // 0-1 scale
  overthinkingTendency: number; // 0-1 scale
  recommendations: TimeManagementRecommendation[];
}

/**
 * Pacing analysis
 */
export interface PacingAssessment {
  section: LSATSection;
  idealTimePerQuestion: number;
  actualTimePerQuestion: number;
  variance: number;
  improvement: number; // seconds to improve
  strategy: string;
}

/**
 * Time distribution analysis
 */
export interface TimeDistribution {
  section: LSATSection;
  easyQuestions: number; // percentage of time
  mediumQuestions: number;
  hardQuestions: number;
  optimal: boolean;
  adjustmentNeeded: string;
}

/**
 * Time management recommendation
 */
export interface TimeManagementRecommendation {
  area: string;
  issue: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  timeToImplement: string;
  practiceExercises: string[];
}

/**
 * Assessment-based recommendation
 */
export interface AssessmentRecommendation {
  id: string;
  category: 'study-schedule' | 'content-focus' | 'strategy' | 'time-management' | 'mindset';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  implementation: string;
  timeframe: string;
  measurableOutcome: string;
  resources: string[];
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Comprehensive study progress
 */
export interface StudyProgress {
  overallCompletion: number; // 0-1 scale
  goalsCompleted: number;
  totalGoals: number;
  studyStreak: number;
  totalStudyHours: number;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  sectionProgress: SectionProgress[];
  skillProgress: SkillProgress[];
  timelineProgress: TimelineProgress[];
  milestones: MilestoneProgress[];
  predictions: ProgressPredictions;
}

/**
 * Section-specific progress
 */
export interface SectionProgress {
  section: LSATSection;
  completion: number; // 0-1 scale
  accuracy: number;
  improvement: number; // points improved
  timeImprovement: number; // seconds improved per question
  confidence: number; // 1-5 scale
  lastPracticed: Date;
  practiceHours: number;
  questionsCompleted: number;
  strengths: string[];
  activeWeaknesses: string[];
  mastery: MasteryLevel[];
}

/**
 * Skill-specific progress
 */
export interface SkillProgress {
  skill: string;
  initialLevel: number;
  currentLevel: number;
  targetLevel: number;
  improvement: number;
  practiceHours: number;
  questionsCompleted: number;
  accuracy: number;
  lastImprovement: Date;
  projectedMastery?: Date;
}

/**
 * Timeline progress tracking
 */
export interface TimelineProgress {
  date: Date;
  plannedHours: number;
  actualHours: number;
  plannedQuestions: number;
  actualQuestions: number;
  accuracy: number;
  goalsAchieved: string[];
  challenges: string[];
  notes: string;
}

/**
 * Milestone progress
 */
export interface MilestoneProgress {
  milestoneId: string;
  targetDate: Date;
  completedDate?: Date;
  progress: number; // 0-1 scale
  onTrack: boolean;
  daysRemaining: number;
  requiredDailyProgress: number;
}

/**
 * Progress predictions and forecasting
 */
export interface ProgressPredictions {
  estimatedReadinessDate: Date;
  confidence: number; // 0-1 scale
  projectedScore: number;
  scoreRange: [number, number];
  riskFactors: string[];
  improvementAreas: string[];
  recommendedAdjustments: string[];
}

/**
 * Mastery level tracking
 */
export interface MasteryLevel {
  concept: string;
  level: 'novice' | 'developing' | 'proficient' | 'advanced' | 'expert';
  score: number; // 0-100
  evidence: string[];
  lastAssessed: Date;
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// ADAPTATIONS & OPTIMIZATIONS
// ============================================================================

/**
 * Plan adaptation record
 */
export interface PlanAdaptation {
  id: string;
  timestamp: Date;
  trigger: AdaptationTrigger;
  type: AdaptationType;
  description: string;
  changes: PlanChange[];
  rationale: string;
  impact: AdaptationImpact;
  userApproved: boolean;
  effectiveness?: number; // Measured post-adaptation
}

/**
 * Adaptation trigger
 */
export interface AdaptationTrigger {
  type: 'performance' | 'schedule' | 'goal-change' | 'time-constraint' | 'user-request' | 'milestone';
  metric?: string;
  threshold?: number;
  actualValue?: number;
  context: string;
}

/**
 * Types of adaptations
 */
export type AdaptationType =
  | 'schedule-adjustment'    // Modify timing/frequency
  | 'content-rebalance'     // Change section allocation
  | 'difficulty-adjustment' // Modify question difficulty
  | 'goal-modification'     // Update targets
  | 'strategy-change'       // Different approach
  | 'intensity-change'      // More/less intensive
  | 'emergency-mode';       // Crisis response

/**
 * Specific plan change
 */
export interface PlanChange {
  element: string; // What was changed
  oldValue: any;
  newValue: any;
  reason: string;
  expectedImpact: string;
}

/**
 * Adaptation impact tracking
 */
export interface AdaptationImpact {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  risksIntroduced: string[];
  benefitsExpected: string[];
  measurableMetrics: string[];
}

// ============================================================================
// PLAN SETTINGS & CONFIGURATION
// ============================================================================

/**
 * Plan configuration settings
 */
export interface PlanSettings {
  adaptiveMode: boolean;
  difficultyProgression: DifficultyProgression;
  reviewStrategy: ReviewStrategy;
  goalAdjustment: GoalAdjustmentSettings;
  notifications: PlanNotificationSettings;
  integration: IntegrationSettings;
  privacy: PlanPrivacySettings;
  backup: BackupSettings;
}

/**
 * Difficulty progression settings
 */
export interface DifficultyProgression {
  mode: 'linear' | 'adaptive' | 'performance-based' | 'custom';
  startingDifficulty: number; // 1-10 scale
  progressionRate: number; // How quickly to increase
  masteryThreshold: number; // Accuracy needed to progress
  regressionTolerance: number; // How much drop before reducing
  sectionSpecific: boolean;
}

/**
 * Review strategy configuration
 */
export interface ReviewStrategy {
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'as-needed';
  reviewRatio: number; // Percentage of time for review vs new content
  focusOnMistakes: boolean;
  spacedRepetition: boolean;
  reviewQueueSize: number;
  prioritizeWeaknesses: boolean;
  includeCorrectAnswers: boolean;
}

/**
 * Goal adjustment automation
 */
export interface GoalAdjustmentSettings {
  automaticAdjustment: boolean;
  adjustmentThreshold: number; // Performance drop to trigger
  conservativeMode: boolean; // More cautious adjustments
  userApprovalRequired: boolean;
  maxAdjustmentPercent: number; // Maximum change allowed
  adjustmentFrequency: 'daily' | 'weekly' | 'bi-weekly';
}

/**
 * Plan notification settings
 */
export interface PlanNotificationSettings {
  studyReminders: boolean;
  goalDeadlines: boolean;
  milestoneAlerts: boolean;
  adaptationNotices: boolean;
  progressReports: boolean;
  motivationalMessages: boolean;
  conflictWarnings: boolean;
  customMessages: string[];
}

/**
 * Integration settings
 */
export interface IntegrationSettings {
  calendarSync: boolean;
  analyticsTracking: boolean;
  thirdPartyApps: ThirdPartyIntegration[];
  dataExport: boolean;
  apiAccess: boolean;
  webhooks: WebhookSettings[];
}

/**
 * Third-party integration
 */
export interface ThirdPartyIntegration {
  service: string;
  enabled: boolean;
  permissions: string[];
  lastSync?: Date;
  configuration: Record<string, any>;
}

/**
 * Webhook configuration
 */
export interface WebhookSettings {
  url: string;
  events: string[];
  enabled: boolean;
  secret?: string;
  retryCount: number;
}

/**
 * Plan privacy settings
 */
export interface PlanPrivacySettings {
  shareProgress: boolean;
  anonymousAnalytics: boolean;
  dataRetention: number; // days
  exportAllowed: boolean;
  thirdPartySharing: boolean;
  personalDataProcessing: boolean;
}

/**
 * Backup and recovery settings
 */
export interface BackupSettings {
  automaticBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number; // days
  cloudStorage: boolean;
  encryptBackups: boolean;
  includePersonalData: boolean;
}

// ============================================================================
// MILESTONES & CHECKPOINTS
// ============================================================================

/**
 * Study milestone definition
 */
export interface Milestone {
  id: string;
  planId: string;
  name: string;
  description: string;
  type: MilestoneType;
  targetDate: Date;
  criteria: MilestoneCriteria[];
  rewards: MilestoneReward[];
  status: 'pending' | 'in-progress' | 'achieved' | 'missed' | 'extended';
  achievedAt?: Date;
  progress: number; // 0-1 scale
  dependencies: string[]; // Other milestone IDs
  isOptional: boolean;
  visibility: 'private' | 'shared' | 'public';
}

/**
 * Milestone types
 */
export type MilestoneType =
  | 'score-achievement'     // Reach specific score
  | 'time-milestone'        // Study for X hours
  | 'accuracy-milestone'    // Achieve accuracy %
  | 'consistency-milestone' // Study streak
  | 'section-mastery'       // Master section
  | 'speed-milestone'       // Timing improvement
  | 'practice-milestone'    // Complete practice tests
  | 'custom-milestone';     // User-defined

/**
 * Milestone achievement criteria
 */
export interface MilestoneCriteria {
  id: string;
  metric: string;
  operator: 'equals' | 'greater-than' | 'less-than' | 'between';
  targetValue: number | [number, number];
  currentValue?: number;
  timeframe?: string;
  description: string;
  weight: number; // Importance weight
}

/**
 * Milestone reward
 */
export interface MilestoneReward {
  type: 'badge' | 'points' | 'unlock-feature' | 'celebration' | 'custom';
  value: string | number;
  description: string;
  claimable: boolean;
  claimed?: boolean;
  claimedAt?: Date;
}

// ============================================================================
// LSAT SPECIFIC TYPES
// ============================================================================

/**
 * LSAT sections
 */
export type LSATSection =
  | 'logical-reasoning'
  | 'reading-comprehension'
  | 'logic-games'
  | 'experimental'
  | 'writing';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default plan settings
 */
export const DEFAULT_PLAN_SETTINGS: PlanSettings = {
  adaptiveMode: true,
  difficultyProgression: {
    mode: 'adaptive',
    startingDifficulty: 5,
    progressionRate: 0.2,
    masteryThreshold: 0.8,
    regressionTolerance: 0.1,
    sectionSpecific: true
  },
  reviewStrategy: {
    frequency: 'daily',
    reviewRatio: 0.3,
    focusOnMistakes: true,
    spacedRepetition: true,
    reviewQueueSize: 20,
    prioritizeWeaknesses: true,
    includeCorrectAnswers: false
  },
  goalAdjustment: {
    automaticAdjustment: true,
    adjustmentThreshold: 0.15,
    conservativeMode: false,
    userApprovalRequired: true,
    maxAdjustmentPercent: 0.2,
    adjustmentFrequency: 'weekly'
  },
  notifications: {
    studyReminders: true,
    goalDeadlines: true,
    milestoneAlerts: true,
    adaptationNotices: true,
    progressReports: false,
    motivationalMessages: true,
    conflictWarnings: true,
    customMessages: []
  },
  integration: {
    calendarSync: false,
    analyticsTracking: true,
    thirdPartyApps: [],
    dataExport: true,
    apiAccess: false,
    webhooks: []
  },
  privacy: {
    shareProgress: false,
    anonymousAnalytics: true,
    dataRetention: 365,
    exportAllowed: true,
    thirdPartySharing: false,
    personalDataProcessing: true
  },
  backup: {
    automaticBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: 30,
    cloudStorage: true,
    encryptBackups: true,
    includePersonalData: false
  }
};

/**
 * Default flexibility settings
 */
export const DEFAULT_FLEXIBILITY_SETTINGS: FlexibilitySettings = {
  allowRescheduling: true,
  maxRescheduleHours: 24,
  adaptToDifficulty: true,
  adaptToPerformance: true,
  adaptToSchedule: true,
  bufferTime: 15,
  makeupSessions: true,
  emergencyMode: {
    enabled: true,
    triggerDaysRemaining: 30,
    intensifySchedule: true,
    focusOnWeaknesses: true,
    reduceBreaks: false,
    prioritizeHighYield: true
  }
};

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Type guard for StudyPlan
 */
export function isStudyPlan(obj: any): obj is StudyPlan {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    obj.createdAt instanceof Date &&
    Array.isArray(obj.goals);
}

/**
 * Type guard for StudySession
 */
export function isStudySession(obj: any): obj is StudySession {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.planId === 'string' &&
    obj.date instanceof Date &&
    typeof obj.duration === 'number';
}

/**
 * Type guard for Milestone
 */
export function isMilestone(obj: any): obj is Milestone {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    obj.targetDate instanceof Date &&
    Array.isArray(obj.criteria);
}