/**
 * MELLOWISE-016: Goal Setting & Progress Tracking Types
 * TypeScript interfaces for personalized goal management system
 */

export interface LSATGoal {
  id: string;
  userId: string;
  targetScore: number;
  currentScore?: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;

  // Section-specific breakdown
  sectionGoals: {
    logicalReasoning: SectionGoal;
    logicGames: SectionGoal;
    readingComprehension: SectionGoal;
  };

  // Study planning
  studyHoursPerWeek: number;
  preferredStudyTimes: string[];

  // Progress tracking
  milestones: Milestone[];
  achievements: Achievement[];

  // AI-generated insights
  predictedScore?: number;
  confidenceLevel?: number;
  recommendedAdjustments?: string[];
}

export interface SectionGoal {
  sectionName: 'logicalReasoning' | 'logicGames' | 'readingComprehension';
  targetScore: number;
  currentScore?: number;
  questionsCorrect: number;
  questionsTotal: number;
  accuracy: number;
  averageTime: number;
  targetTime: number;

  // Difficulty progression
  currentDifficulty: number;
  targetDifficulty: number;

  // Specific focus areas
  focusAreas: string[];
  weakTopics: string[];
  strongTopics: string[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: Date;
  completedAt?: Date;
  type: 'score' | 'accuracy' | 'speed' | 'streak' | 'custom';
  target: number;
  current: number;
  isCompleted: boolean;

  // Celebration settings
  celebrationMessage?: string;
  rewardType?: 'badge' | 'points' | 'unlock' | 'none';
}

export interface Achievement {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description: string;
  iconUrl?: string;
  unlockedAt: Date;
  category: 'accuracy' | 'speed' | 'streak' | 'improvement' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';

  // Display settings
  isVisible: boolean;
  showInProfile: boolean;

  // Requirements met
  requirements: {
    metric: string;
    threshold: number;
    achieved: number;
  }[];
}

export interface ProgressSnapshot {
  id: string;
  goalId: string;
  userId: string;
  capturedAt: Date;

  // Overall progress
  overallScore: number;
  totalQuestionsAnswered: number;
  totalStudyTime: number;

  // Section progress
  sectionProgress: {
    [key in 'logicalReasoning' | 'logicGames' | 'readingComprehension']: {
      score: number;
      accuracy: number;
      averageTime: number;
      questionsAnswered: number;
      studyTime: number;
    };
  };

  // Learning metrics
  learningVelocity: number;
  difficultyProgression: number;
  retentionRate: number;

  // Behavioral patterns
  studyStreakDays: number;
  averageSessionLength: number;
  peakPerformanceTime: string;
}

export interface GoalPrediction {
  goalId: string;
  predictedScore: number;
  confidenceLevel: number;
  predictionDate: Date;

  // Timeline predictions
  timeToTarget: number;
  estimatedCompletionDate: Date;
  probabilityOfSuccess: number;

  // Recommendation insights
  recommendedChanges: {
    type: 'study_time' | 'focus_areas' | 'difficulty' | 'timeline';
    current: any;
    recommended: any;
    impact: number;
    reasoning: string;
  }[];

  // Risk factors
  riskFactors: {
    factor: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
}

export interface StudyPlan {
  id: string;
  goalId: string;
  userId: string;
  generatedAt: Date;
  isActive: boolean;

  // Planning parameters
  targetDate: Date;
  availableHoursPerWeek: number;
  currentLevel: number;
  targetLevel: number;

  // Weekly breakdown
  weeklySchedule: WeeklyStudyPlan[];

  // Adaptation tracking
  adaptations: PlanAdaptation[];
  effectiveness: {
    adherenceRate: number;
    progressRate: number;
    adjustmentFrequency: number;
  };
}

export interface WeeklyStudyPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;

  // Time allocation
  totalHours: number;
  dailySchedule: {
    [key: string]: {
      hours: number;
      focusAreas: string[];
      sessionType: 'practice' | 'review' | 'assessment' | 'mixed';
    };
  };

  // Content focus
  sectionEmphasis: {
    logicalReasoning: number;
    logicGames: number;
    readingComprehension: number;
  };

  // Goals for the week
  weeklyTargets: {
    questionsToComplete: number;
    accuracyTarget: number;
    newTopicsToMaster: string[];
    reviewTopics: string[];
  };
}

export interface PlanAdaptation {
  id: string;
  planId: string;
  adaptedAt: Date;
  reason: string;

  // Changes made
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    impact: 'minor' | 'moderate' | 'major';
  }[];

  // Performance before/after
  performanceBefore: number;
  performanceAfter?: number;

  // Success metrics
  wasSuccessful?: boolean;
  userSatisfaction?: number;
}

// Chart data interfaces for visualizations
export interface ProgressChartData {
  date: string;
  overall: number;
  logicalReasoning: number;
  logicGames: number;
  readingComprehension: number;
  target: number;
}

export interface AccuracyChartData {
  topic: string;
  current: number;
  target: number;
  improvement: number;
}

export interface StudyTimeChartData {
  week: string;
  planned: number;
  actual: number;
  efficiency: number;
}

export interface MilestoneProgressData {
  milestone: string;
  progress: number;
  target: number;
  daysRemaining: number;
  onTrack: boolean;
}

// API request/response types
export interface CreateGoalRequest {
  targetScore: number;
  targetDate: string;
  studyHoursPerWeek: number;
  preferredStudyTimes: string[];
  sectionPriorities: {
    logicalReasoning: number;
    logicGames: number;
    readingComprehension: number;
  };
}

export interface UpdateGoalRequest {
  goalId: string;
  updates: Partial<LSATGoal>;
  reason?: string;
}

export interface GoalProgressResponse {
  goal: LSATGoal;
  recentProgress: ProgressSnapshot[];
  predictions: GoalPrediction;
  studyPlan: StudyPlan;
  upcomingMilestones: Milestone[];
  recentAchievements: Achievement[];
}

export interface GoalAnalyticsData {
  progressTrend: ProgressChartData[];
  sectionAccuracy: AccuracyChartData[];
  studyTimeAnalysis: StudyTimeChartData[];
  milestoneProgress: MilestoneProgressData[];

  // Summary statistics
  summary: {
    daysToTarget: number;
    currentTrajectory: 'on_track' | 'ahead' | 'behind';
    probabilityOfSuccess: number;
    recommendedActions: string[];
  };
}