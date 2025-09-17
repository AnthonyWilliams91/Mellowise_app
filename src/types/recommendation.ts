/**
 * MELLOWISE-011: Intelligent Content Recommendation Engine Types
 * Defines types for Sequential Recommendation system using RecBole/ML backend
 */

export interface RecommendationRequest {
  userId: string;
  sessionLength?: number; // minutes available for study
  goalType?: 'practice' | 'review' | 'new_content';
  maxItems?: number;
  contextualFactors?: {
    timeOfDay: string;
    energyLevel?: 'low' | 'medium' | 'high';
    location?: 'home' | 'commute' | 'other';
    device?: 'mobile' | 'desktop';
  };
}

export interface RecommendedItem {
  questionId: string;
  score: number; // Recommendation score (0-1)
  reason: RecommendationReason;
  expectedDifficulty: number; // Personalized difficulty for this user
  estimatedTime: number; // minutes
  topicPath: string[]; // e.g., ["Logic Games", "Grouping", "In/Out"]
  prerequisites: string[]; // Question IDs that should be completed first
  reviewOptimal: boolean; // If this is optimal time for spaced repetition
}

export interface RecommendationReason {
  type: 'weakness' | 'strength_building' | 'review' | 'prerequisite' | 'high_yield' | 'goal_aligned';
  description: string;
  impactScore: number; // Expected impact on performance (0-1)
  confidenceLevel: number; // Model confidence (0-1)
}

export interface StudyPlan {
  userId: string;
  planId: string;
  createdAt: Date;
  updatedAt: Date;

  // Daily/Weekly recommendations
  dailyGoals: DailyStudyGoal[];
  weeklyTargets: WeeklyTarget;

  // Adaptive elements
  adaptationHistory: AdaptationEvent[];
  effectiveness: PlanEffectiveness;
}

export interface DailyStudyGoal {
  date: Date;
  recommendedMinutes: number;
  focusTopics: string[];
  recommendedQuestions: RecommendedItem[];
  completionStatus: {
    completed: boolean;
    actualMinutes: number;
    questionsCompleted: string[];
    performanceScore: number;
  };
}

export interface WeeklyTarget {
  weekStart: Date;
  targetMinutes: number;
  targetQuestions: number;
  focusAreas: {
    topic: string;
    allocationPercentage: number;
    reason: string;
  }[];
  progressTracking: {
    minutesCompleted: number;
    questionsCompleted: number;
    averageAccuracy: number;
  };
}

export interface AdaptationEvent {
  timestamp: Date;
  trigger: 'performance_change' | 'goal_update' | 'pattern_detected' | 'user_feedback';
  previousStrategy: string;
  newStrategy: string;
  reason: string;
  impact: number; // Measured impact after adaptation
}

export interface PlanEffectiveness {
  overallScore: number; // 0-1
  accuracyImprovement: number; // percentage
  completionRate: number; // percentage
  engagementScore: number; // 0-1
  weaknessReduction: {
    topic: string;
    initialScore: number;
    currentScore: number;
    improvement: number;
  }[];
}

export interface RecommendationResponse {
  recommendations: RecommendedItem[];
  studyPlan?: StudyPlan;
  sessionSuggestion: {
    optimalDuration: number; // minutes
    focusMode: 'deep_practice' | 'quick_review' | 'mixed';
    energyAlignment: boolean; // Matches user's current energy
  };
  metadata: {
    modelVersion: string;
    generatedAt: Date;
    confidenceScore: number;
    dataRecency: Date; // Last training data update
  };
}

export interface RecommendationFeedback {
  userId: string;
  questionId: string;
  recommendationId: string;
  feedback: {
    helpful: boolean;
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    timing: 'too_early' | 'perfect' | 'too_late';
    userComment?: string;
  };
  performance: {
    correct: boolean;
    timeSpent: number;
    confidence: number;
  };
}

// Integration with existing systems
export interface RecommendationContext {
  // From MELLOWISE-009: Learning Style
  learningStyle: {
    visual: number;
    verbal: number;
    sequential: number;
    global: number;
    active: number;
    reflective: number;
  };

  // From MELLOWISE-010: Dynamic Difficulty
  difficultyProfile: {
    currentLevel: number;
    optimalChallenge: number;
    adaptationRate: number;
    topicDifficulties: Map<string, number>;
  };

  // From MELLOWISE-012: Performance Insights
  performanceInsights: {
    strengths: string[];
    weaknesses: string[];
    recentTrends: {
      improving: string[];
      declining: string[];
    };
    optimalTimeOfDay: string[];
  };

  // User goals and constraints
  userGoals: {
    targetScore: number;
    targetDate: Date;
    studyHoursPerWeek: number;
    priorityTopics: string[];
  };
}

// ML Model Integration
export interface MLModelConfig {
  modelType: 'SASRec' | 'GRU4Rec' | 'BERT4Rec';
  version: string;
  endpoint: string; // WSL2 ML service endpoint
  features: {
    useSequentialHistory: boolean;
    useContextualFeatures: boolean;
    useCollaborativeFiltering: boolean;
    useContentBasedFeatures: boolean;
  };
  updateStrategy: 'batch' | 'incremental' | 'online';
}

// Spaced Repetition Integration
export interface SpacedRepetitionSchedule {
  questionId: string;
  lastReviewed: Date;
  nextReviewDate: Date;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
}

// Export for use in API and components
export type { };