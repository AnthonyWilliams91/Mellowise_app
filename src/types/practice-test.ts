/**
 * Practice Test Types
 * Comprehensive type definitions for full-length LSAT practice test simulation
 */

// ============================================================================
// CORE ENUMS
// ============================================================================

export type LSATSectionType = 'logical_reasoning' | 'reading_comprehension' | 'experimental';

export type TestStatus =
  | 'not_started'
  | 'in_progress'
  | 'break_between_sections'
  | 'completed'
  | 'abandoned';

export type SectionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'flagged_for_review';

export type TimerWarning = 'five_minutes' | 'one_minute' | 'thirty_seconds' | 'ten_seconds';

export type ScoreRange = {
  min: number;
  max: number;
  confidence: number; // 0-1
};

// ============================================================================
// SECTION CONFIGURATION
// ============================================================================

export interface LSATSection {
  id: string;
  type: LSATSectionType;
  sectionNumber: number; // 1-4
  isExperimental: boolean;
  timeAllowedMinutes: number; // Always 35 for LSAT
  questionCount: number; // Varies by section type
  questions: PracticeTestQuestion[];
}

export interface PracticeTestQuestion {
  id: string;
  type: string; // From LR/RC question types
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number; // 1-10
  topic?: string;
  passageId?: string; // For RC questions
  estimatedTimeSeconds: number;
}

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

export interface PracticeTestConfig {
  id: string;
  testName: string;
  totalSections: number; // Always 4 for LSAT
  experimentalSectionPosition: number; // 1-4, randomized
  breakDurationMinutes: number; // 15 minutes between sections 3-4
  sections: LSATSection[];
  scoringMethod: 'official' | 'estimated';
  allowFlagging: boolean;
  allowBackNavigation: boolean;
  showTimeWarnings: boolean;
  warningTimes: TimerWarning[];
}

// ============================================================================
// TIMING SYSTEM
// ============================================================================

export interface SectionTimer {
  sectionId: string;
  startTime: Date | null;
  endTime: Date | null;
  pausedTime: number; // Total paused milliseconds
  remainingTimeSeconds: number;
  warnings: TimerWarning[];
  warningsTriggered: TimerWarning[];
  isActive: boolean;
  isPaused: boolean;
}

export interface BreakTimer {
  startTime: Date;
  durationMinutes: number;
  remainingTimeSeconds: number;
  isActive: boolean;
}

export interface TestTimer {
  testId: string;
  currentSectionIndex: number;
  sectionTimers: SectionTimer[];
  breakTimer?: BreakTimer;
  totalTestTime: number; // Total elapsed time in milliseconds
  totalBreakTime: number; // Total break time in milliseconds
}

// ============================================================================
// USER RESPONSES & NAVIGATION
// ============================================================================

export interface QuestionResponse {
  questionId: string;
  sectionId: string;
  selectedAnswer: string | null;
  isFlagged: boolean;
  timeSpentSeconds: number;
  responseTime: Date;
  wasRevisited: boolean;
  revisionCount: number;
}

export interface SectionNavigation {
  sectionId: string;
  currentQuestionIndex: number;
  visitedQuestions: Set<string>;
  flaggedQuestions: Set<string>;
  completedQuestions: Set<string>;
  navigationHistory: {
    questionId: string;
    timestamp: Date;
    action: 'visited' | 'answered' | 'flagged' | 'unflagged';
  }[];
}

// ============================================================================
// TEST SESSION
// ============================================================================

export interface PracticeTestSession {
  id: string;
  userId: string;
  testConfigId: string;
  config: PracticeTestConfig;
  status: TestStatus;
  startTime: Date | null;
  endTime: Date | null;
  currentSectionIndex: number;
  timer: TestTimer;
  responses: QuestionResponse[];
  navigation: SectionNavigation[];
  score?: TestScore;
  analysis?: TestAnalysis;
}

// ============================================================================
// SCORING SYSTEM (120-180 Scale)
// ============================================================================

export interface SectionScore {
  sectionId: string;
  sectionType: LSATSectionType;
  isExperimental: boolean;
  questionsAttempted: number;
  questionsCorrect: number;
  rawScore: number; // Number correct
  percentageCorrect: number; // 0-100
  averageTimePerQuestion: number; // seconds
}

export interface TestScore {
  testId: string;
  scaledScore: number; // 120-180
  rawScore: number; // Total questions correct (excluding experimental)
  percentile: number; // 0-100
  scoreRange: ScoreRange; // Confidence interval
  sectionScores: SectionScore[];
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalTestTime: number; // milliseconds
  scoringDate: Date;
}

// ============================================================================
// POST-TEST ANALYSIS
// ============================================================================

export interface QuestionAnalysis {
  questionId: string;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: number;
  topic: string;
  questionType: string;
  wasGuessed: boolean; // Answered in less than 30 seconds
  errorPattern?: string; // If incorrect
}

export interface SectionAnalysis {
  sectionId: string;
  sectionType: LSATSectionType;
  isExperimental: boolean;
  overallAccuracy: number; // 0-1
  averageTimePerQuestion: number;
  timeManagementScore: number; // 0-100 (optimal timing vs actual)
  strongTopics: string[];
  weakTopics: string[];
  questionAnalysis: QuestionAnalysis[];
  recommendations: string[];
}

export interface TestAnalysis {
  testId: string;
  overallPerformance: {
    accuracy: number; // 0-1
    timeManagement: number; // 0-100
    consistency: number; // 0-100 (variance across sections)
    endurance: number; // 0-100 (performance decline over time)
  };
  sectionAnalyses: SectionAnalysis[];
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
    priorityAreas: string[];
  };
  comparisonToAverage: {
    scoreDifference: number; // Points above/below average
    percentileDifference: number;
    timeCompared: 'faster' | 'slower' | 'average';
  };
  studyRecommendations: {
    focusAreas: string[];
    practiceTypes: string[];
    timeAllocation: { [topic: string]: number }; // Hours per week
    targetScore: number;
  };
  nextSteps: string[];
}

// ============================================================================
// HISTORICAL TRACKING
// ============================================================================

export interface TestHistory {
  userId: string;
  tests: {
    testId: string;
    date: Date;
    score: number;
    percentile: number;
    testType: 'practice' | 'diagnostic';
  }[];
  trends: {
    scoreProgression: number[]; // Last 10 tests
    averageImprovement: number; // Points per test
    bestScore: number;
    mostRecentScore: number;
    consistencyRating: number; // 0-100
  };
  milestones: {
    firstTest: Date;
    targetScore?: number;
    targetDate?: Date;
    testsToTarget: number;
  };
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface TestPreferences {
  userId: string;
  timerDisplay: 'always' | 'warnings_only' | 'never';
  warningTimes: TimerWarning[];
  allowPauseBreaks: boolean;
  flaggingEnabled: boolean;
  navigationStyle: 'linear' | 'free';
  reviewMode: 'immediate' | 'end_of_section' | 'end_of_test';
  interfaceTheme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  eliminationMode: boolean; // Cross out wrong answers
}

// ============================================================================
// TEST GENERATION
// ============================================================================

export interface TestGenerationOptions {
  includeExperimental: boolean;
  experimentalSectionType?: LSATSectionType;
  difficultyDistribution: 'realistic' | 'adaptive' | 'custom';
  topicWeights?: { [topic: string]: number };
  targetDifficulty?: number; // 1-10
  excludeQuestionIds?: string[];
  prioritizeUnseenQuestions: boolean;
}

export interface GeneratedTest {
  config: PracticeTestConfig;
  metadata: {
    generatedAt: Date;
    options: TestGenerationOptions;
    questionSources: string[];
    estimatedDifficulty: number;
    estimatedScoreRange: ScoreRange;
  };
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

export interface TestInterfaceState {
  currentView: 'instructions' | 'section' | 'break' | 'review' | 'results';
  showTimer: boolean;
  showProgress: boolean;
  showFlagged: boolean;
  isFullscreen: boolean;
  fontSize: number;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

export interface QuestionPanelState {
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isFlagged: boolean;
  showExplanation: boolean;
  eliminatedAnswers: Set<string>;
  noteText: string;
}

// ============================================================================
// EVENTS & ANALYTICS
// ============================================================================

export interface TestEvent {
  id: string;
  testId: string;
  userId: string;
  eventType: 'start_test' | 'start_section' | 'answer_question' | 'flag_question'
           | 'navigate' | 'break_start' | 'break_end' | 'complete_test' | 'abandon_test'
           | 'timer_warning' | 'review_question';
  timestamp: Date;
  sectionId?: string;
  questionId?: string;
  data?: { [key: string]: any };
}

export interface TestMetrics {
  testId: string;
  engagementMetrics: {
    totalActiveTime: number; // milliseconds
    averageQuestionTime: number;
    navigationEvents: number;
    flaggingEvents: number;
    reviewEvents: number;
  };
  performanceMetrics: {
    accuracyBySection: { [sectionType: string]: number };
    speedBySection: { [sectionType: string]: number };
    consistencyScore: number;
    enduranceScore: number;
  };
  behavioralMetrics: {
    answersChanged: number;
    questionsSkipped: number;
    timeSpentReviewing: number;
    breakTimeUsed: number;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface TestError {
  id: string;
  testId: string;
  errorType: 'timer_sync' | 'data_save' | 'navigation' | 'scoring' | 'generation';
  message: string;
  timestamp: Date;
  context?: { [key: string]: any };
  resolved: boolean;
}

export interface TestValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingData: string[];
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface CreateTestRequest {
  options: TestGenerationOptions;
  preferences?: Partial<TestPreferences>;
}

export interface StartTestRequest {
  testId: string;
  preferences?: Partial<TestPreferences>;
}

export interface SubmitAnswerRequest {
  testId: string;
  questionId: string;
  answer: string | null;
  timeSpent: number;
  isFlagged: boolean;
}

export interface CompleteTestRequest {
  testId: string;
  finalAnswers: QuestionResponse[];
}

export interface TestResponse {
  test: PracticeTestSession;
  success: boolean;
  error?: string;
}

export interface ScoreResponse {
  score: TestScore;
  analysis: TestAnalysis;
  success: boolean;
  error?: string;
}