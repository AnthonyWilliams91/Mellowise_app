/**
 * Smart Review Queue System Types
 * Comprehensive type definitions for spaced repetition and intelligent review
 */

// ============================================================================
// CORE REVIEW TYPES
// ============================================================================

export interface ReviewItem {
  id: string;
  questionId: string;
  userId: string;
  section: 'logical-reasoning' | 'reading-comprehension' | 'logic-games';
  questionType: string;
  difficulty: number; // 1-10 scale
  incorrectAttempts: number;
  lastAttempted: Date;
  nextReview: Date;
  interval: number; // days until next review
  easeFactor: number; // SM-2 algorithm ease factor (1.3-2.5)
  masteryLevel: number; // 0-100% mastery score
  priority: number; // calculated priority score
  created: Date;
  lastReviewed?: Date;
  status: 'pending' | 'active' | 'mastered' | 'difficult';
  tags: string[];
  metadata: ReviewItemMetadata;
}

export interface ReviewItemMetadata {
  originalError: string;
  errorPattern: string;
  conceptTags: string[];
  relatedQuestions: string[];
  hintLevel: number; // 0-3 (no hints to full explanation)
  timeSpent: number; // total seconds spent on this item
  averageTime: number; // average time per attempt
  improvementTrend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// SPACED REPETITION ALGORITHM
// ============================================================================

export interface SpacedRepetitionConfig {
  algorithm: 'sm2' | 'anki' | 'fsrs'; // SuperMemo 2, Anki, Free Spaced Repetition Scheduler
  initialInterval: number; // days
  minInterval: number; // minimum days between reviews
  maxInterval: number; // maximum days between reviews
  easyBonus: number; // multiplier for easy responses
  hardPenalty: number; // multiplier for difficult responses
  newCardSteps: number[]; // learning steps in minutes for new cards
  graduatingInterval: number; // days before graduating to review
  easyInterval: number; // days for easy graduation
}

export interface ReviewResponse {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 quality (0=blackout, 5=perfect)
  timeSpent: number; // seconds
  hintsUsed: number;
  confidence: 'low' | 'medium' | 'high';
  notes?: string;
  timestamp: Date;
}

export interface SpacedRepetitionResult {
  nextInterval: number;
  nextReview: Date;
  easeFactor: number;
  repetitions: number;
  quality: number;
  graduated: boolean; // moved from learning to review
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

export interface ReviewQueue {
  id: string;
  userId: string;
  name: string;
  description: string;
  created: Date;
  lastAccessed: Date;
  settings: ReviewQueueSettings;
  items: ReviewItem[];
  statistics: ReviewQueueStats;
}

export interface ReviewQueueSettings {
  maxDailyReviews: number;
  maxNewCards: number;
  reviewOrder: 'due_date' | 'priority' | 'random' | 'difficulty';
  mixNewWithReview: boolean;
  enableHints: boolean;
  showProgress: boolean;
  sessionLength: number; // minutes
  breakInterval: number; // minutes between breaks
  spacedRepetition: SpacedRepetitionConfig;
}

export interface ReviewQueueStats {
  totalItems: number;
  pendingReview: number;
  masteredItems: number;
  newToday: number;
  reviewedToday: number;
  averageRetention: number; // 0-1
  streak: number; // consecutive days
  totalTimeSpent: number; // minutes
  accuracy: number; // 0-1
  improvementRate: number; // items mastered per week
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface ReviewSession {
  id: string;
  userId: string;
  queueId: string;
  started: Date;
  ended?: Date;
  duration: number; // seconds
  itemsReviewed: number;
  itemsCorrect: number;
  itemsIncorrect: number;
  newItemsIntroduced: number;
  averageResponseTime: number;
  hintsUsed: number;
  performance: SessionPerformance;
  items: ReviewSessionItem[];
}

export interface SessionPerformance {
  accuracy: number; // 0-1
  speed: number; // items per minute
  consistency: number; // variance in response times
  improvement: number; // vs previous sessions
  focusScore: number; // 0-1 based on response time consistency
  difficultyHandling: number; // performance on difficult items
}

export interface ReviewSessionItem {
  reviewItemId: string;
  questionId: string;
  startTime: Date;
  endTime?: Date;
  response: ReviewResponse;
  correct: boolean;
  hintsUsed: string[];
  timeSpent: number;
  previousAttempts: number;
}

// ============================================================================
// MASTERY TRACKING
// ============================================================================

export interface MasteryTracker {
  itemId: string;
  userId: string;
  attempts: MasteryAttempt[];
  currentLevel: number; // 0-100
  targetLevel: number; // usually 90-95
  consecutiveCorrect: number;
  requiredCorrect: number; // needed for mastery
  lastUpdate: Date;
  masteryAchieved?: Date;
  estimatedMastery: Date; // projected mastery date
  masteryVelocity: number; // improvement per day
}

export interface MasteryAttempt {
  timestamp: Date;
  correct: boolean;
  responseTime: number;
  confidence: 'low' | 'medium' | 'high';
  hintsUsed: number;
  quality: number; // 0-5 SM-2 quality rating
  preAttemptLevel: number;
  postAttemptLevel: number;
  context: string; // 'review' | 'practice' | 'test'
}

// ============================================================================
// PRIORITY RANKING
// ============================================================================

export interface PriorityFactors {
  recency: number; // how recently was it missed
  frequency: number; // how often is it missed
  difficulty: number; // inherent question difficulty
  importance: number; // strategic importance
  forgetting: number; // forgetting curve position
  weakness: number; // user's weakness in this area
  urgency: number; // time-sensitive factors
}

export interface PriorityRanking {
  itemId: string;
  score: number; // 0-1 priority score
  factors: PriorityFactors;
  reasoning: string;
  rank: number; // position in queue
  category: 'critical' | 'high' | 'medium' | 'low';
  recommendedAction: string;
}

// ============================================================================
// SIMILAR QUESTIONS
// ============================================================================

export interface SimilarQuestionEngine {
  findSimilar(questionId: string, limit?: number): Promise<SimilarQuestion[]>;
  getSimilarityScore(q1: string, q2: string): Promise<number>;
  updateSimilarityIndex(questionId: string): Promise<void>;
  getRecommendations(userId: string, context: string): Promise<QuestionRecommendation[]>;
}

export interface SimilarQuestion {
  questionId: string;
  similarity: number; // 0-1 similarity score
  reasons: string[]; // why it's similar
  difficulty: number;
  section: string;
  questionType: string;
  tags: string[];
  recommendationStrength: 'weak' | 'moderate' | 'strong';
}

export interface QuestionRecommendation {
  questionId: string;
  reason: string;
  confidence: number; // 0-1
  expectedBenefit: string;
  timeEstimate: number; // minutes
  priority: number;
}

// ============================================================================
// HINT SYSTEM
// ============================================================================

export type HintLevel = 0 | 1 | 2 | 3;

export interface HintSystem {
  getHint(questionId: string, level: HintLevel): Promise<Hint>;
  getAvailableHints(questionId: string): Promise<HintLevel[]>;
  recordHintUsage(userId: string, questionId: string, level: HintLevel): Promise<void>;
  generateProgressiveHints(questionId: string): Promise<Hint[]>;
}

export interface Hint {
  level: HintLevel;
  title: string;
  content: string;
  type: 'concept' | 'strategy' | 'elimination' | 'explanation';
  revealsConcept?: string;
  spoilerLevel: 'none' | 'partial' | 'full';
  nextHintAvailable: boolean;
}

export interface HintUsage {
  userId: string;
  questionId: string;
  sessionId: string;
  level: HintLevel;
  timestamp: Date;
  timeBeforeHint: number; // seconds before requesting hint
  helpfulness: number; // 1-5 user rating
  led_to_correct: boolean;
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

export interface ReviewPerformanceTracker {
  userId: string;
  trackingPeriod: DateRange;
  metrics: ReviewMetrics;
  trends: ReviewTrends;
  insights: ReviewInsight[];
  recommendations: ReviewRecommendation[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReviewMetrics {
  totalReviews: number;
  correctReviews: number;
  accuracy: number; // 0-1
  averageTime: number; // seconds
  itemsMastered: number;
  retentionRate: number; // 0-1
  efficiencyScore: number; // mastery per hour
  streakDays: number;
  dailyConsistency: number; // 0-1
}

export interface ReviewTrends {
  accuracyTrend: TrendData[];
  speedTrend: TrendData[];
  masteryTrend: TrendData[];
  difficultyTrend: TrendData[];
  consistencyTrend: TrendData[];
}

export interface TrendData {
  date: Date;
  value: number;
  change: number; // vs previous
  significance: 'high' | 'medium' | 'low';
}

export interface ReviewInsight {
  type: 'improvement' | 'decline' | 'pattern' | 'milestone';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  data: any;
}

export interface ReviewRecommendation {
  category: 'schedule' | 'strategy' | 'content' | 'difficulty';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'difficult';
  timeframe: string;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface ReviewQueueService {
  // Queue Management
  createQueue(userId: string, settings: Partial<ReviewQueueSettings>): Promise<ReviewQueue>;
  getQueue(userId: string, queueId: string): Promise<ReviewQueue>;
  updateQueueSettings(queueId: string, settings: Partial<ReviewQueueSettings>): Promise<void>;
  deleteQueue(queueId: string): Promise<void>;

  // Item Management
  addToQueue(userId: string, questionId: string, reason: string): Promise<ReviewItem>;
  removeFromQueue(itemId: string): Promise<void>;
  updateItem(itemId: string, updates: Partial<ReviewItem>): Promise<ReviewItem>;
  getItemsForReview(userId: string, limit: number): Promise<ReviewItem[]>;

  // Session Management
  startReviewSession(userId: string, queueId: string): Promise<ReviewSession>;
  recordResponse(sessionId: string, itemId: string, response: ReviewResponse): Promise<SpacedRepetitionResult>;
  endSession(sessionId: string): Promise<ReviewSession>;

  // Analytics
  getPerformanceStats(userId: string, period: DateRange): Promise<ReviewPerformanceTracker>;
  getQueueStats(queueId: string): Promise<ReviewQueueStats>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const DEFAULT_SPACED_REPETITION_CONFIG: SpacedRepetitionConfig = {
  algorithm: 'sm2',
  initialInterval: 1,
  minInterval: 1,
  maxInterval: 365,
  easyBonus: 1.3,
  hardPenalty: 0.8,
  newCardSteps: [1, 10], // 1 minute, 10 minutes
  graduatingInterval: 1,
  easyInterval: 4
};

export const DEFAULT_QUEUE_SETTINGS: ReviewQueueSettings = {
  maxDailyReviews: 50,
  maxNewCards: 10,
  reviewOrder: 'priority',
  mixNewWithReview: true,
  enableHints: true,
  showProgress: true,
  sessionLength: 30,
  breakInterval: 5,
  spacedRepetition: DEFAULT_SPACED_REPETITION_CONFIG
};

export const MASTERY_THRESHOLDS = {
  BEGINNER: 0.6,    // 60% accuracy
  INTERMEDIATE: 0.75, // 75% accuracy
  ADVANCED: 0.85,   // 85% accuracy
  EXPERT: 0.95,     // 95% accuracy
  CONSECUTIVE_REQUIRED: 3, // consecutive correct for mastery
  MIN_ATTEMPTS: 5   // minimum attempts before mastery possible
} as const;