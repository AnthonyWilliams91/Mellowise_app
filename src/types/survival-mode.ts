/**
 * Survival Mode Game State Types
 * 
 * Comprehensive type definitions for the Survival Mode game mechanics,
 * following Observer pattern principles for state management.
 */

export interface GameState {
  // Core game mechanics
  sessionId: string
  isActive: boolean
  isPaused: boolean
  isGameOver: boolean
  
  // Lives system
  lives: number
  maxLives: number
  
  // Scoring system
  score: number
  streak: number
  maxStreak: number
  
  // Question progression
  currentQuestion: string | null
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  
  // Timing mechanics
  timeRemaining: number
  questionStartTime: number
  totalGameTime: number
  
  // Power-ups
  availablePowerUps: PowerUp[]
  activePowerUps: ActivePowerUp[]
  powerUpCooldowns: Record<PowerUpType, number>
  powerUpCosts: Record<PowerUpType, number>
  lastPowerUpActivations?: Record<string, number>
  
  // Pause system
  pausesRemaining: number
  maxPauses: number
  
  // Difficulty scaling
  currentDifficulty: DifficultyLevel
  difficultyProgression: number
  
  // Achievement tracking
  achievements: Achievement[]
  sessionAchievements: string[]
}

export interface PowerUp {
  id: string
  type: PowerUpType
  name: string
  description: string
  icon: string
  cost: number
  isAvailable: boolean
  cooldownRemaining?: number
}

export interface ActivePowerUp {
  type: PowerUpType
  remainingTime: number
  effect: PowerUpEffect
}

export interface PowerUpEffect {
  timeExtension?: number
  hintsRevealed?: number
  eliminatedChoices?: number
  multiplierBoost?: number
  livesRestored?: number
}

export type PowerUpType = 
  | 'hint'           // Reveals a hint for current question
  | 'time_extension' // Adds 30 seconds to timer
  | 'fifty_fifty'    // Eliminates 2 wrong answers
  | 'life_restore'   // Restores 1 life
  | 'freeze'         // Freezes timer for 15 seconds

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: AchievementRequirement
  isUnlocked: boolean
  unlockedAt?: string
}

export interface AchievementRequirement {
  type: 'streak' | 'score' | 'questions' | 'time' | 'lives' | 'powerups'
  target: number
  description: string
}

export interface GameEvent {
  type: GameEventType
  timestamp: number
  data: any
}

export type GameEventType = 
  | 'game_started'
  | 'game_paused'
  | 'game_resumed'
  | 'game_ended'
  | 'question_answered'
  | 'life_lost'
  | 'life_restored'
  | 'streak_started'
  | 'streak_broken'
  | 'multiplier_activated'
  | 'multiplier_expired'
  | 'powerup_activated'
  | 'powerup_expired'
  | 'achievement_unlocked'
  | 'difficulty_increased'
  | 'time_warning'
  | 'score_milestone'

export interface GameConfig {
  // Starting conditions
  initialLives: number
  maxLives: number
  questionTimeLimit: number
  maxPauses: number
  
  // Scoring rules
  baseScore: number
  streakBonusThreshold: number
  multiplierLevels: number[]
  
  // Difficulty progression
  questionsPerDifficultyIncrease: number
  difficultyTimeReduction: number
  
  // Power-up settings
  powerUpCosts: Record<PowerUpType, number>
  powerUpCooldowns: Record<PowerUpType, number>
  powerUpDurations: Record<PowerUpType, number>
  powerUpCostMultiplier: number
  
  // Achievement thresholds
  achievementThresholds: {
    firstCorrect: number
    streak5: number
    streak10: number
    streak25: number
    score1000: number
    score5000: number
    score10000: number
    survival30: number
    survival60: number
    perfectRound: number
  }
}

export interface GameSession {
  id: string
  userId: string
  startedAt: string
  endedAt?: string
  finalScore: number
  questionsAnswered: number
  accuracy: number
  maxStreak: number
  timeSpent: number
  difficultiesReached: DifficultyLevel[]
  powerUpsUsed: PowerUpType[]
  achievementsUnlocked: string[]
  gameState: GameState
}

export interface SurvivalModeStats {
  // All-time statistics
  totalGamesPlayed: number
  totalScore: number
  highScore: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  averageAccuracy: number
  longestStreak: number
  totalTimeSpent: number
  
  // Power-up usage
  powerUpsUsed: Record<PowerUpType, number>
  favoriteCategory: string
  
  // Achievements
  totalAchievements: number
  unlockedAchievements: string[]
  
  // Recent performance
  recentGames: GameSession[]
  improvementTrend: 'improving' | 'stable' | 'declining'
}

// Game Action Types for Observer Pattern
export interface GameAction {
  type: GameActionType
  payload?: any
}

export type GameActionType =
  | 'START_GAME'
  | 'PAUSE_GAME'
  | 'RESUME_GAME'
  | 'END_GAME'
  | 'ANSWER_QUESTION'
  | 'LOAD_QUESTION'
  | 'LOSE_LIFE'
  | 'RESTORE_LIFE'
  | 'UPDATE_SCORE'
  | 'UPDATE_STREAK'
  | 'UPDATE_MULTIPLIER'
  | 'ACTIVATE_POWERUP'
  | 'EXPIRE_POWERUP'
  | 'UPDATE_POWERUPS'
  | 'UPDATE_TIMER'
  | 'INCREASE_DIFFICULTY'
  | 'UNLOCK_ACHIEVEMENT'
  | 'SAVE_SESSION'

// Observer interfaces for game state management
export interface GameObserver {
  update(event: GameEvent): void
}

export interface GameSubject {
  attach(observer: GameObserver): void
  detach(observer: GameObserver): void
  notify(event: GameEvent): void
}