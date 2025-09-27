/**
 * Practice Test Module - Export Index
 * Central exports for all practice test functionality
 */

// Core Services
export { PracticeTestGenerator } from './test-generator';
export { PracticeTestTimerService } from './timer-service';
export { LSATScoringService } from './scoring-service';
export { PracticeTestAnalysisService } from './test-analysis';
export { ScoreTrackingService } from './score-tracker';

// React Components
export { default as PracticeTestInterface } from '../components/practice-test/PracticeTestInterface';

// Type Definitions (re-export from types)
export type {
  // Core Types
  PracticeTestSession,
  PracticeTestConfig,
  LSATSection,
  PracticeTestQuestion,

  // Timing Types
  TestTimer,
  SectionTimer,
  BreakTimer,
  TimerWarning,

  // Scoring Types
  TestScore,
  SectionScore,
  ScoreRange,

  // Analysis Types
  TestAnalysis,
  SectionAnalysis,
  QuestionAnalysis,

  // UI Types
  TestInterfaceState,
  QuestionPanelState,

  // Response Types
  QuestionResponse,
  SectionNavigation,

  // Generation Types
  TestGenerationOptions,
  GeneratedTest,

  // History Types
  TestHistory,

  // Preferences Types
  TestPreferences,

  // Event Types
  TestEvent,
  TestMetrics,

  // API Types
  CreateTestRequest,
  StartTestRequest,
  SubmitAnswerRequest,
  CompleteTestRequest,
  TestResponse,
  ScoreResponse,

  // Status Enums
  TestStatus,
  SectionStatus,
  LSATSectionType
} from '@/types/practice-test';

// Utility Functions
export const PracticeTestUtils = {
  /**
   * Format time in MM:SS format
   */
  formatTime: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate percentage with proper rounding
   */
  calculatePercentage: (correct: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  },

  /**
   * Get difficulty label from numeric value
   */
  getDifficultyLabel: (difficulty: number): string => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    return 'Hard';
  },

  /**
   * Get difficulty color for UI
   */
  getDifficultyColor: (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-600';
    if (difficulty <= 6) return 'text-yellow-600';
    return 'text-red-600';
  },

  /**
   * Format section type for display
   */
  formatSectionType: (sectionType: string): string => {
    return sectionType
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Calculate total scored questions (excluding experimental)
   */
  getTotalScoredQuestions: (sections: LSATSection[]): number => {
    return sections
      .filter(section => !section.isExperimental)
      .reduce((total, section) => total + section.questionCount, 0);
  },

  /**
   * Get score color based on LSAT scale
   */
  getScoreColor: (score: number): string => {
    if (score >= 170) return 'text-green-600'; // Exceptional
    if (score >= 160) return 'text-blue-600';  // Strong
    if (score >= 150) return 'text-yellow-600'; // Average
    return 'text-red-600'; // Below average
  },

  /**
   * Get percentile description
   */
  getPercentileDescription: (percentile: number): string => {
    if (percentile >= 99) return 'Top 1%';
    if (percentile >= 95) return 'Top 5%';
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 75) return 'Top 25%';
    if (percentile >= 50) return 'Above Average';
    return 'Below Average';
  },

  /**
   * Validate test session completeness
   */
  isTestComplete: (session: PracticeTestSession): boolean => {
    const totalQuestions = PracticeTestUtils.getTotalScoredQuestions(session.config.sections);
    const answeredQuestions = session.responses.filter(r =>
      r.selectedAnswer !== null &&
      !session.config.sections.find(s => s.id === r.sectionId)?.isExperimental
    ).length;

    return answeredQuestions === totalQuestions;
  },

  /**
   * Get next unanswered question
   */
  getNextUnansweredQuestion: (session: PracticeTestSession): {
    sectionIndex: number;
    questionIndex: number;
  } | null => {
    for (let sectionIndex = 0; sectionIndex < session.config.sections.length; sectionIndex++) {
      const section = session.config.sections[sectionIndex];

      for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex++) {
        const question = section.questions[questionIndex];
        const response = session.responses.find(r => r.questionId === question.id);

        if (!response || response.selectedAnswer === null) {
          return { sectionIndex, questionIndex };
        }
      }
    }

    return null; // All questions answered
  },

  /**
   * Calculate section progress
   */
  getSectionProgress: (session: PracticeTestSession, sectionId: string): {
    answered: number;
    total: number;
    percentage: number;
  } => {
    const section = session.config.sections.find(s => s.id === sectionId);
    if (!section) return { answered: 0, total: 0, percentage: 0 };

    const answered = session.responses.filter(r =>
      r.sectionId === sectionId && r.selectedAnswer !== null
    ).length;

    const total = section.questions.length;
    const percentage = PracticeTestUtils.calculatePercentage(answered, total);

    return { answered, total, percentage };
  },

  /**
   * Get time remaining warning level
   */
  getTimeWarningLevel: (remainingSeconds: number): 'none' | 'caution' | 'warning' | 'critical' => {
    if (remainingSeconds <= 60) return 'critical';   // 1 minute
    if (remainingSeconds <= 300) return 'warning';   // 5 minutes
    if (remainingSeconds <= 600) return 'caution';   // 10 minutes
    return 'none';
  },

  /**
   * Sort questions by difficulty for adaptive practice
   */
  sortQuestionsByDifficulty: (questions: PracticeTestQuestion[], order: 'asc' | 'desc' = 'asc'): PracticeTestQuestion[] => {
    return [...questions].sort((a, b) =>
      order === 'asc' ? a.difficulty - b.difficulty : b.difficulty - a.difficulty
    );
  }
};

// Constants
export const PRACTICE_TEST_CONSTANTS = {
  LSAT: {
    TOTAL_SECTIONS: 4,
    SECTION_TIME_MINUTES: 35,
    BREAK_TIME_MINUTES: 15,
    BREAK_AFTER_SECTION: 3, // Break after section 3
    SCORED_SECTIONS: 3, // 2 LR + 1 RC
    MIN_SCORE: 120,
    MAX_SCORE: 180,
    AVERAGE_SCORE: 150
  },

  TIMING: {
    WARNING_TIMES: [300, 60, 30, 10] as const, // seconds
    DEFAULT_QUESTION_TIME: 75, // seconds
    MIN_QUESTION_TIME: 30,
    MAX_QUESTION_TIME: 180
  },

  DIFFICULTY: {
    EASY_MAX: 3,
    MEDIUM_MAX: 6,
    HARD_MIN: 7,
    SCALE_MIN: 1,
    SCALE_MAX: 10
  },

  STORAGE_KEYS: {
    TEST_SESSION: 'practice_test_session',
    TIMER_STATE: 'practice_test_timer',
    USER_PREFERENCES: 'practice_test_preferences'
  }
} as const;