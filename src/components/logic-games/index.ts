/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Main Export Index for Logic Games Components
 *
 * @epic Epic 3.2 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team) + UX Expert Aria
 * @created 2025-09-19
 */

// Core components
export { default as GameBoard } from './GameBoard'
export { default as LogicGameQuestion } from './LogicGameQuestion'
export { default as GameCategoryIndicator } from './GameCategoryIndicator'
export { default as SolutionWalkthrough } from './SolutionWalkthrough'
export { default as InferenceDetectionTrainer } from './InferenceDetectionTrainer'
export { default as PerformanceAnalyticsDashboard } from './PerformanceAnalyticsDashboard'

// API client
export { logicGamesAPI, LogicGamesAPIClient } from '@/lib/logic-games/api-client'

// Game Categorization
export { GameCategorizer, categorizeGame } from '@/lib/logic-games/game-categorizer'
export type { GameCategory, GameSubcategory, GameClassification, GamePattern } from '@/lib/logic-games/game-categorizer'

// Solution Walkthrough
export { SolutionRenderer, generateWalkthrough } from '@/lib/logic-games/solution-renderer'
export type {
  WalkthroughStep,
  SolutionWalkthrough as SolutionWalkthroughData,
  ConceptConnection,
  VisualCue
} from '@/lib/logic-games/solution-renderer'

// Inference Detection Training
export { InferenceDetector } from '@/lib/logic-games/inference-detector'
export type {
  InferenceNode,
  InferenceConnection,
  InferenceMap,
  InferenceTrainingSession,
  TrainingHint
} from '@/lib/logic-games/inference-detector'

// Performance Analytics and Benchmarking
export { PerformanceAnalytics } from '@/lib/logic-games/performance-analytics'
export type {
  PerformanceMetrics,
  GameTypePerformance,
  PerformanceBenchmarks,
  LearningInsights,
  SessionAnalytics,
  ComparisonData
} from '@/lib/logic-games/performance-analytics'

// Types
export type {
  LogicGameQuestion as LogicGameQuestionType,
  LogicGameSession,
  GameBoardState,
  UserAction,
  LogicGameType,
  LogicGameSubtype,
  DifficultyTier,
  GameEntity,
  GamePosition,
  GameRule,
  SolutionStep,
  InferenceStep,
  CommonMistakeType,
  ValidationResult,
  BoardAnnotation,
  GameBoardConfig,
  LogicGameAnalytics,
  HintRequest,
  MistakeIncident
} from '@/types/logic-games'

export type {
  LogicGamesSearchFilters,
  LogicGamesSearchResult,
  LogicGamesFacets
} from '@/lib/logic-games/api-client'

// Component result types
export type { LogicGameQuestionResult } from './LogicGameQuestion'