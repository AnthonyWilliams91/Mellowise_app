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

// API client
export { logicGamesAPI, LogicGamesAPIClient } from '@/lib/logic-games/api-client'

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