/**
 * Spaced Repetition System Types
 * MELLOWISE-029: Advanced Spaced Repetition System
 */

// Core Spaced Repetition Types
export interface SpacedRepetitionCard {
  id: string;
  conceptId: string;
  userId: string;
  content: {
    question: string;
    answer: string;
    explanation?: string;
    hints?: string[];
  };
  metadata: {
    type: 'logical-reasoning' | 'reading-comprehension' | 'logic-games' | 'general';
    subtype?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    source?: string;
    estimatedTime: number; // seconds
  };
  scheduling: CardScheduling;
  statistics: CardStatistics;
  dependencies: string[]; // prerequisite concept IDs
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface CardScheduling {
  masteryLevel: MasteryLevel;
  interval: number; // days
  easeFactor: number; // SM-2 ease factor (1.3-2.5)
  repetitions: number;
  nextReview: string; // ISO datetime
  lastReviewed?: string; // ISO datetime
  schedulingAlgorithm: 'SM-2' | 'SM-17' | 'FSRS' | 'Anki';
  priority: number; // 0-100, higher = more urgent
}

export interface CardStatistics {
  totalReviews: number;
  correctReviews: number;
  streak: number; // consecutive correct reviews
  maxStreak: number;
  averageResponseTime: number; // ms
  difficultyRating: number; // user-perceived difficulty 1-5
  retentionRate: number; // 0-1
  lastAccuracy: number; // 0-1
  performanceTrend: 'improving' | 'stable' | 'declining';
}

// Mastery Level System
export type MasteryLevel = 'learning' | 'young' | 'mature' | 'master' | 'suspended';

export interface MasteryProgression {
  level: MasteryLevel;
  requirements: {
    minimumReviews: number;
    minimumAccuracy: number; // 0-1
    minimumStreak: number;
    minimumInterval: number; // days
  };
  benefits: {
    intervalMultiplier: number;
    priorityReduction: number;
    difficultyBonus: number;
  };
  nextLevel?: MasteryLevel;
  timeInLevel: number; // days
}

// Forgetting Curve Models
export interface ForgettingCurve {
  conceptId: string;
  userId: string;
  model: 'exponential' | 'power' | 'logarithmic';
  parameters: {
    initialRetention: number; // R(0), typically 1.0
    decayRate: number; // rate of forgetting
    stabilityFactor: number; // individual stability
    retrievabilityThreshold: number; // minimum retention to trigger review
  };
  dataPoints: RetentionDataPoint[];
  lastUpdated: string; // ISO datetime
  confidence: number; // 0-1, confidence in curve accuracy
}

export interface RetentionDataPoint {
  timeElapsed: number; // hours since last review
  retention: number; // 0-1, estimated retention
  wasCorrect: boolean;
  responseTime: number; // ms
  confidenceLevel: number; // user-reported confidence 1-5
  timestamp: string; // ISO datetime
}

// SM-2 Algorithm Implementation
export interface SM2Parameters {
  easeFactor: number; // E-Factor (1.3-2.5)
  interval: number; // current interval in days
  repetitions: number; // number of repetitions
  quality: number; // quality of response (0-5)
}

export interface SM2Result {
  newEaseFactor: number;
  newInterval: number;
  newRepetitions: number;
  nextReviewDate: Date;
  intervalChange: number; // percentage change
}

// Priority Queue System
export interface ReviewQueue {
  userId: string;
  queueType: 'daily' | 'session' | 'intensive' | 'maintenance';
  cards: QueuedCard[];
  metadata: {
    targetSessionTime: number; // minutes
    maxNewCards: number;
    maxReviewCards: number;
    balanceRatio: number; // new:review ratio (0-1)
    generatedAt: string; // ISO datetime
    estimatedDuration: number; // minutes
  };
  statistics: QueueStatistics;
}

export interface QueuedCard {
  cardId: string;
  priority: number; // 0-100, higher = more urgent
  urgencyFactors: {
    overdue: number; // days overdue, negative if not overdue
    masteryLevel: number; // mastery-based priority
    difficulty: number; // difficulty-based priority
    retention: number; // retention-based priority
    dependency: number; // dependency-based priority
  };
  estimatedTime: number; // seconds
  reviewType: 'new' | 'review' | 'relearn' | 'cram';
  scheduledFor: string; // ISO datetime
}

export interface QueueStatistics {
  totalCards: number;
  newCards: number;
  reviewCards: number;
  overdueCards: number;
  averagePriority: number;
  estimatedSessionTime: number; // minutes
  difficultyDistribution: Record<'beginner' | 'intermediate' | 'advanced', number>;
  typeDistribution: Record<string, number>; // by card type
}

// Load Balancing System
export interface LoadBalancer {
  userId: string;
  settings: LoadBalancingSettings;
  currentLoad: SessionLoad;
  recommendations: LoadBalancingRecommendation[];
}

export interface LoadBalancingSettings {
  maxSessionTime: number; // minutes
  maxNewCardsPerSession: number;
  maxReviewCardsPerSession: number;
  preferredSessionTimes: string[]; // HH:MM format
  weeklyReviewGoal: number; // number of reviews per week
  difficultyPreference: 'easy-first' | 'mixed' | 'hard-first';
  burnoutPrevention: {
    enabled: boolean;
    maxConsecutiveDifficult: number;
    restPeriodAfterDifficult: number; // minutes
    fatigueThreshold: number; // 0-1
  };
}

export interface SessionLoad {
  currentSession: {
    cardsCompleted: number;
    timeElapsed: number; // minutes
    averageAccuracy: number; // 0-1
    difficultyScore: number; // weighted difficulty
    fatigueLevel: number; // 0-1, estimated mental fatigue
  };
  dailyLoad: {
    totalReviews: number;
    totalTime: number; // minutes
    newCardsLearned: number;
    streakMaintained: boolean;
    burnoutRisk: number; // 0-1
  };
  weeklyLoad: {
    totalReviews: number;
    totalTime: number; // minutes
    averageAccuracy: number; // 0-1
    progressToGoal: number; // 0-1
    consistency: number; // 0-1, regularity of reviews
  };
}

export interface LoadBalancingRecommendation {
  type: 'session-adjustment' | 'schedule-change' | 'difficulty-change' | 'break-suggestion';
  priority: 'low' | 'medium' | 'high';
  message: string;
  action?: {
    type: string;
    parameters: Record<string, unknown>;
  };
  reasoning: string;
  expectedBenefit: string;
}

// Concept Dependencies
export interface ConceptDependency {
  conceptId: string;
  name: string;
  prerequisites: PrerequisiteConcept[];
  dependents: string[]; // concepts that depend on this one
  masteryThreshold: number; // 0-1, required mastery to unlock dependents
  blockingBehavior: 'soft' | 'hard'; // soft allows with warning, hard blocks
}

export interface PrerequisiteConcept {
  conceptId: string;
  name: string;
  requiredMasteryLevel: MasteryLevel;
  requiredAccuracy: number; // 0-1
  weight: number; // importance weight 0-1
}

export interface DependencyGraph {
  nodes: ConceptDependency[];
  edges: DependencyEdge[];
  topologicalOrder: string[]; // concept IDs in dependency order
  cycles: string[][]; // circular dependencies (should be avoided)
}

export interface DependencyEdge {
  from: string; // prerequisite concept ID
  to: string; // dependent concept ID
  strength: number; // 0-1, strength of dependency
  type: 'foundational' | 'supportive' | 'optional';
}

// Pre-test Intensive Review
export interface IntensiveReviewMode {
  enabled: boolean;
  testDate: string; // ISO datetime
  daysBeforeTest: number; // when to start intensive mode
  focusAreas: IntensiveFocusArea[];
  schedule: IntensiveSchedule;
  performanceTargets: {
    targetAccuracy: number; // 0-1
    targetSpeed: number; // questions per minute
    weaknessThreshold: number; // 0-1, accuracy below which area is "weak"
  };
}

export interface IntensiveFocusArea {
  areaId: string;
  name: string; // e.g., "Logical Reasoning - Strengthen"
  priority: number; // 0-100
  currentPerformance: {
    accuracy: number; // 0-1
    speed: number; // average time per question
    confidence: number; // 0-1
    trend: 'improving' | 'stable' | 'declining';
  };
  timeAllocation: number; // percentage of intensive review time
  reviewStrategy: 'drill' | 'mixed-practice' | 'timed-sections' | 'adaptive';
}

export interface IntensiveSchedule {
  totalDays: number;
  dailyTimeAllocation: number; // minutes
  sessions: IntensiveSession[];
  restDays: number[]; // day indices to take breaks
  tapering: {
    enabled: boolean;
    startDay: number; // when to start tapering intensity
    finalIntensity: number; // 0-1, final intensity level
  };
}

export interface IntensiveSession {
  day: number;
  focusArea: string;
  duration: number; // minutes
  cardCount: number;
  difficultyRange: [number, number]; // min, max difficulty
  reviewTypes: ('new' | 'review' | 'weak' | 'random')[];
}

// Performance Tracking and Analytics
export interface RetentionAnalytics {
  userId: string;
  timeRange: {
    start: string; // ISO datetime
    end: string; // ISO datetime
  };
  overallMetrics: {
    totalCards: number;
    reviewsCompleted: number;
    averageRetention: number; // 0-1
    retentionImprovement: number; // change over time
    knowledgeStability: number; // 0-1, how stable is retention
  };
  conceptBreakdown: ConceptRetentionAnalytics[];
  forgettingCurveAnalysis: ForgettingCurveAnalysis;
  spacingEffectiveness: SpacingEffectivenessAnalysis;
  predictions: RetentionPrediction[];
}

export interface ConceptRetentionAnalytics {
  conceptId: string;
  conceptName: string;
  cardCount: number;
  averageRetention: number; // 0-1
  masteryDistribution: Record<MasteryLevel, number>;
  difficultyImpact: {
    easy: { retention: number; count: number };
    medium: { retention: number; count: number };
    hard: { retention: number; count: number };
  };
  timeToMastery: number; // average days to reach mature level
  retentionTrend: 'improving' | 'stable' | 'declining';
}

export interface ForgettingCurveAnalysis {
  modelAccuracy: number; // 0-1, how well model predicts retention
  optimalReviewTiming: number; // hours after learning
  personalizedFactors: {
    fastForgetter: boolean;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    optimalInterval: number; // personal optimal spacing
  };
  recommendations: string[];
}

export interface SpacingEffectivenessAnalysis {
  intervals: IntervalEffectiveness[];
  optimalSpacing: {
    newCards: number; // days
    reviewCards: number; // days
    difficultCards: number; // days
  };
  massedVsSpacedComparison: {
    massedRetention: number; // 0-1
    spacedRetention: number; // 0-1
    improvement: number; // spaced - massed
  };
}

export interface IntervalEffectiveness {
  interval: number; // days
  sampleSize: number;
  averageRetention: number; // 0-1
  confidenceInterval: [number, number]; // 95% CI
  recommendedUsage: 'optimal' | 'acceptable' | 'avoid';
}

export interface RetentionPrediction {
  conceptId: string;
  timeHorizon: number; // days into future
  predictedRetention: number; // 0-1
  confidence: number; // 0-1, prediction confidence
  recommendedAction: 'continue' | 'increase-frequency' | 'intensive-review' | 'break';
  riskFactors: string[];
}

// System Configuration
export interface SpacedRepetitionConfig {
  algorithm: {
    type: 'SM-2' | 'SM-17' | 'FSRS' | 'Anki';
    parameters: Record<string, number>;
  };
  scheduling: {
    newCardLimit: number; // per day
    reviewLimit: number; // per day
    sessionTimeLimit: number; // minutes
    graduatingInterval: number; // days for learning -> young
    easyInterval: number; // days for easy button
    lapseInterval: number; // multiplier for forgotten cards
  };
  mastery: {
    learningSteps: number[]; // intervals in minutes
    youngThreshold: number; // days
    matureThreshold: number; // days
    masterThreshold: number; // days + accuracy
  };
  loadBalancing: {
    enabled: boolean;
    maxDifficultStreak: number;
    fatigueDetection: boolean;
    adaptiveBreaks: boolean;
  };
  dependencies: {
    enforcePrerequisites: boolean;
    softBlockingWarning: boolean;
    prerequisiteWeight: number; // 0-1
  };
}

// Default Values and Constants
export const DEFAULT_SM2_PARAMETERS: SM2Parameters = {
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  quality: 3
};

export const MASTERY_LEVEL_CONFIGS: Record<MasteryLevel, MasteryProgression> = {
  learning: {
    level: 'learning',
    requirements: { minimumReviews: 0, minimumAccuracy: 0, minimumStreak: 0, minimumInterval: 0 },
    benefits: { intervalMultiplier: 1.0, priorityReduction: 0, difficultyBonus: 0 },
    nextLevel: 'young',
    timeInLevel: 0
  },
  young: {
    level: 'young',
    requirements: { minimumReviews: 3, minimumAccuracy: 0.8, minimumStreak: 2, minimumInterval: 1 },
    benefits: { intervalMultiplier: 1.2, priorityReduction: 0.1, difficultyBonus: 0.1 },
    nextLevel: 'mature',
    timeInLevel: 0
  },
  mature: {
    level: 'mature',
    requirements: { minimumReviews: 8, minimumAccuracy: 0.85, minimumStreak: 4, minimumInterval: 21 },
    benefits: { intervalMultiplier: 1.5, priorityReduction: 0.3, difficultyBonus: 0.2 },
    nextLevel: 'master',
    timeInLevel: 0
  },
  master: {
    level: 'master',
    requirements: { minimumReviews: 15, minimumAccuracy: 0.9, minimumStreak: 8, minimumInterval: 100 },
    benefits: { intervalMultiplier: 2.0, priorityReduction: 0.5, difficultyBonus: 0.3 },
    timeInLevel: 0
  },
  suspended: {
    level: 'suspended',
    requirements: { minimumReviews: 0, minimumAccuracy: 0, minimumStreak: 0, minimumInterval: 0 },
    benefits: { intervalMultiplier: 0, priorityReduction: 0, difficultyBonus: 0 },
    timeInLevel: 0
  }
};

export const DEFAULT_LOAD_BALANCING_SETTINGS: LoadBalancingSettings = {
  maxSessionTime: 45, // minutes
  maxNewCardsPerSession: 20,
  maxReviewCardsPerSession: 100,
  preferredSessionTimes: ['09:00', '14:00', '19:00'],
  weeklyReviewGoal: 700,
  difficultyPreference: 'mixed',
  burnoutPrevention: {
    enabled: true,
    maxConsecutiveDifficult: 5,
    restPeriodAfterDifficult: 2,
    fatigueThreshold: 0.7
  }
};

export const DEFAULT_SPACED_REPETITION_CONFIG: SpacedRepetitionConfig = {
  algorithm: {
    type: 'SM-2',
    parameters: {
      minimumEaseFactor: 1.3,
      maximumEaseFactor: 2.5,
      easeFactorChange: 0.15,
      intervalMultiplier: 1.0
    }
  },
  scheduling: {
    newCardLimit: 20,
    reviewLimit: 200,
    sessionTimeLimit: 60,
    graduatingInterval: 1,
    easyInterval: 4,
    lapseInterval: 0.5
  },
  mastery: {
    learningSteps: [1, 10, 1440], // 1min, 10min, 1day
    youngThreshold: 7,
    matureThreshold: 21,
    masterThreshold: 100
  },
  loadBalancing: {
    enabled: true,
    maxDifficultStreak: 5,
    fatigueDetection: true,
    adaptiveBreaks: true
  },
  dependencies: {
    enforcePrerequisites: true,
    softBlockingWarning: true,
    prerequisiteWeight: 0.8
  }
};

// Type Guards
export function isSpacedRepetitionCard(obj: unknown): obj is SpacedRepetitionCard {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'conceptId' in obj &&
    'content' in obj &&
    'scheduling' in obj &&
    'statistics' in obj
  );
}

export function isMasteryLevel(level: string): level is MasteryLevel {
  return ['learning', 'young', 'mature', 'master', 'suspended'].includes(level);
}

export function isValidQuality(quality: number): boolean {
  return quality >= 0 && quality <= 5 && Number.isInteger(quality);
}

export function isOverdue(card: SpacedRepetitionCard): boolean {
  return new Date(card.scheduling.nextReview) < new Date();
}