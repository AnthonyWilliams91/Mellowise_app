/**
 * Survival Mode Game State Management Hook
 * 
 * Implements Observer pattern-based game state management with React hooks,
 * following patterns from Context7 research on design patterns and React best practices.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { 
  GameState, 
  GameEvent, 
  GameEventType, 
  GameAction, 
  GameActionType,
  GameConfig,
  PowerUpType,
  DifficultyLevel,
  GameObserver,
  GameSubject,
  Achievement
} from '@/types/survival-mode'

// Default game configuration
const DEFAULT_CONFIG: GameConfig = {
  initialLives: 3,
  maxLives: 5,
  questionTimeLimit: 300,
  maxPauses: 3,
  baseScore: 10,
  streakBonusThreshold: 3,
  multiplierLevels: [1, 2, 3, 5],
  questionsPerDifficultyIncrease: 10,
  difficultyTimeReduction: 10,
  powerUpCosts: {
    hint: 50,
    time_extension: 30,
    fifty_fifty: 40,
    life_restore: 100,
    freeze: 60
  },
  powerUpCooldowns: {
    hint: 30000,
    time_extension: 45000,
    fifty_fifty: 60000,
    life_restore: 120000,
    freeze: 75000
  },
  powerUpDurations: {
    hint: 0,
    time_extension: 0,
    fifty_fifty: 0,
    life_restore: 0,
    freeze: 15000
  },
  powerUpCostMultiplier: 1.2,
  achievementThresholds: {
    firstCorrect: 1,
    streak5: 5,
    streak10: 10,
    streak25: 25,
    score1000: 1000,
    score5000: 5000,
    score10000: 10000,
    survival30: 1800000, // 30 minutes
    survival60: 3600000, // 60 minutes
    perfectRound: 20
  }
}

// Game State Observer Implementation
class GameStateManager implements GameSubject {
  private observers: GameObserver[] = []
  
  attach(observer: GameObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer)
    }
  }
  
  detach(observer: GameObserver): void {
    const index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }
  
  notify(event: GameEvent): void {
    this.observers.forEach(observer => observer.update(event))
  }
}

export const useSurvivalMode = (config: Partial<GameConfig> = {}) => {
  const gameConfig = { ...DEFAULT_CONFIG, ...config }
  const gameManager = useRef(new GameStateManager())
  
  // Core game state
  const [gameState, setGameState] = useState<GameState>(() => ({
    sessionId: crypto.randomUUID(),
    isActive: false,
    isPaused: false,
    isGameOver: false,
    lives: gameConfig.initialLives,
    maxLives: gameConfig.maxLives,
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentQuestion: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeRemaining: gameConfig.questionTimeLimit,
    questionStartTime: 0,
    totalGameTime: 0,
    availablePowerUps: [],
    activePowerUps: [],
    powerUpCooldowns: {
      hint: 0,
      time_extension: 0,
      fifty_fifty: 0,
      life_restore: 0,
      freeze: 0
    },
    powerUpCosts: { ...gameConfig.powerUpCosts },
    pausesRemaining: gameConfig.maxPauses,
    maxPauses: gameConfig.maxPauses,
    currentDifficulty: 'easy',
    difficultyProgression: 0,
    achievements: [],
    sessionAchievements: []
  }))
  
  // Timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameStartTimeRef = useRef<number>(0)
  
  // Observer management
  const addObserver = useCallback((observer: GameObserver) => {
    gameManager.current.attach(observer)
  }, [])
  
  const removeObserver = useCallback((observer: GameObserver) => {
    gameManager.current.detach(observer)
  }, [])
  
  // Event notification helper
  const notifyEvent = useCallback((type: GameEventType, data?: any) => {
    const event: GameEvent = {
      type,
      timestamp: Date.now(),
      data
    }
    gameManager.current.notify(event)
  }, [])
  
  // Game state reducer
  const dispatch = useCallback((action: GameAction) => {
    setGameState(prevState => {
      const newState = { ...prevState }
      
      switch (action.type) {
        case 'START_GAME':
          newState.isActive = true
          newState.isPaused = false
          newState.isGameOver = false
          newState.sessionId = crypto.randomUUID()
          newState.questionStartTime = Date.now()
          gameStartTimeRef.current = Date.now()
          notifyEvent('game_started', { sessionId: newState.sessionId })
          break
          
        case 'PAUSE_GAME':
          if (newState.pausesRemaining > 0) {
            newState.isPaused = true
            newState.pausesRemaining--
            notifyEvent('game_paused', { pausesRemaining: newState.pausesRemaining })
          }
          break
          
        case 'RESUME_GAME':
          newState.isPaused = false
          newState.questionStartTime = Date.now()
          notifyEvent('game_resumed')
          break
          
        case 'END_GAME':
          newState.isActive = false
          newState.isGameOver = true
          newState.totalGameTime = Date.now() - gameStartTimeRef.current
          notifyEvent('game_ended', { 
            finalScore: newState.score,
            totalTime: newState.totalGameTime
          })
          break
          
        case 'RESET_GAME':
          // Reset all game state to initial values
          newState.sessionId = crypto.randomUUID()
          newState.isActive = false
          newState.isPaused = false
          newState.isGameOver = false
          newState.lives = gameConfig.initialLives
          newState.score = 0
          newState.streak = 0
          newState.maxStreak = 0
          newState.currentQuestion = null
          newState.questionsAnswered = 0
          newState.correctAnswers = 0
          newState.incorrectAnswers = 0
          newState.timeRemaining = gameConfig.questionTimeLimit
          newState.questionStartTime = 0
          newState.totalGameTime = 0
          newState.activePowerUps = []
          newState.powerUpCooldowns = {
            hint: 0,
            time_extension: 0,
            fifty_fifty: 0,
            life_restore: 0,
            freeze: 0
          }
          newState.powerUpCosts = { ...gameConfig.powerUpCosts }
          newState.pausesRemaining = gameConfig.maxPauses
          newState.currentDifficulty = 'easy'
          newState.difficultyProgression = 0
          newState.sessionAchievements = []
          notifyEvent('game_reset', { sessionId: newState.sessionId })
          break
          
        case 'ANSWER_QUESTION':
          const { isCorrect, responseTime, difficulty = 1 } = action.payload
          newState.questionsAnswered++
          
          if (isCorrect) {
            newState.correctAnswers++
            newState.streak++
            newState.maxStreak = Math.max(newState.maxStreak, newState.streak)
            
            // Calculate base score based on difficulty (10 + (difficulty-1) * 5)
            const difficultyScore = 10 + (difficulty - 1) * 5
            
            // Calculate streak multiplier (1.1^(streak-1))
            const streakMultiplier = newState.streak === 1 ? 1 : Math.pow(1.1, newState.streak - 1)
            
            // Final score calculation
            const finalScore = Math.round(difficultyScore * streakMultiplier)
            newState.score += finalScore
            
            // Calculate time bonus based on difficulty
            let timeBonus = 15 // Default for difficulty 1-2
            if (difficulty >= 9) timeBonus = difficulty === 10 ? 60 : 45
            else if (difficulty >= 7) timeBonus = 30
            else if (difficulty >= 5) timeBonus = 25  
            else if (difficulty >= 3) timeBonus = 20
            
            newState.timeRemaining += timeBonus
            
            notifyEvent('question_answered', { 
              isCorrect: true, 
              score: finalScore,
              difficulty,
              streakMultiplier,
              timeBonus
            })
          } else {
            newState.incorrectAnswers++
            newState.lives--
            newState.streak = 0 // Reset streak multiplier
            
            if (newState.lives <= 0) {
              newState.isGameOver = true
              newState.isActive = false
            }
            
            notifyEvent('question_answered', { isCorrect: false })
            notifyEvent('life_lost', { remainingLives: newState.lives })
          }
          
          // Check for difficulty progression
          if (newState.questionsAnswered % gameConfig.questionsPerDifficultyIncrease === 0) {
            const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert']
            const currentIndex = difficulties.indexOf(newState.currentDifficulty)
            if (currentIndex < difficulties.length - 1) {
              newState.currentDifficulty = difficulties[currentIndex + 1]
              newState.difficultyProgression++
              notifyEvent('difficulty_increased', { newDifficulty: newState.currentDifficulty })
            }
          }
          
          // Continue with current timer - no reset
          break
          
        case 'LOAD_QUESTION':
          newState.currentQuestion = action.payload.questionId
          // Don't reset timer when loading questions - timer continues
          break
          
        case 'UPDATE_TIMER':
          if (newState.isActive && !newState.isPaused) {
            newState.timeRemaining = Math.max(0, action.payload.timeRemaining)
            
            if (newState.timeRemaining === 0) {
              // Game over - timer reached 0
              newState.isGameOver = true
              newState.isActive = false
              newState.totalGameTime = Date.now() - gameStartTimeRef.current
              notifyEvent('game_ended', { 
                reason: 'timeout',
                finalScore: newState.score,
                totalTime: newState.totalGameTime
              })
            } else if (newState.timeRemaining === 10) {
              notifyEvent('time_warning')
            }
          }
          break
          
        case 'ACTIVATE_POWERUP':
          const { powerUpType } = action.payload
          
          // Protection against React Strict Mode double firing
          const now = Date.now()
          const lastActivationKey = powerUpType
          const lastActivation = newState.lastPowerUpActivations?.[lastActivationKey]
          
          if (lastActivation && now - lastActivation < 100) {
            console.log(`🛡️ Prevented double activation of ${powerUpType}`)
            break
          }
          
          // Initialize lastPowerUpActivations if it doesn't exist
          if (!newState.lastPowerUpActivations) {
            newState.lastPowerUpActivations = {}
          }
          
          // Get current cost and ensure player has enough points
          const currentCost = newState.powerUpCosts[powerUpType]
          console.log(`🔧 Power-up activation attempt: ${powerUpType}, Current cost: ${currentCost}, Available points: ${newState.score}`)
          
          if (newState.score < currentCost) {
            console.warn(`❌ Insufficient points to activate ${powerUpType}. Required: ${currentCost}, Available: ${newState.score}`)
            break
          }
          
          // Record this activation
          newState.lastPowerUpActivations[lastActivationKey] = now
          
          console.log(`✅ Purchasing ${powerUpType} for ${currentCost} points. Score before: ${newState.score}`)
          
          // Deduct current cost from score (no Math.max needed since we already validated sufficient points)
          newState.score -= currentCost
          
          console.log(`💰 Score after purchase: ${newState.score}`)
          
          // Apply cost scaling for next use (1.2x multiplier, rounded to nearest 5)
          const scaledCost = currentCost * gameConfig.powerUpCostMultiplier
          const roundedCost = Math.round(scaledCost / 5) * 5
          newState.powerUpCosts[powerUpType] = roundedCost
          
          // Set cooldown
          newState.powerUpCooldowns[powerUpType] = gameConfig.powerUpCooldowns[powerUpType]
          
          // Apply power-up effect
          switch (powerUpType) {
            case 'time_extension':
              newState.timeRemaining += 30
              break
            case 'life_restore':
              newState.lives = Math.min(newState.maxLives, newState.lives + 1)
              break
            case 'freeze':
              newState.activePowerUps.push({
                type: 'freeze',
                remainingTime: gameConfig.powerUpDurations.freeze,
                effect: {}
              })
              break
            case 'hint':
              // Hint effect will be handled by the UI component
              break
            case 'fifty_fifty':
              // Fifty-fifty effect will be handled by the UI component
              break
          }
          
          notifyEvent('powerup_activated', { 
            type: powerUpType, 
            costPaid: currentCost,
            newCost: roundedCost,
            cooldownTime: gameConfig.powerUpCooldowns[powerUpType]
          })
          break
          
        case 'UPDATE_POWERUPS':
          // Update active power-up durations and remove expired ones
          newState.activePowerUps = newState.activePowerUps
            .map(powerUp => ({
              ...powerUp,
              remainingTime: powerUp.remainingTime - 1000 // Subtract 1 second
            }))
            .filter(powerUp => powerUp.remainingTime > 0)
          
          // Update cooldowns (reduce by 1 second)
          Object.keys(newState.powerUpCooldowns).forEach(type => {
            const powerUpType = type as PowerUpType
            if (newState.powerUpCooldowns[powerUpType] > 0) {
              newState.powerUpCooldowns[powerUpType] = Math.max(0, newState.powerUpCooldowns[powerUpType] - 1000)
            }
          })
          break
          
        case 'UNLOCK_ACHIEVEMENT':
          const achievement = action.payload.achievement
          if (!newState.sessionAchievements.includes(achievement.id)) {
            newState.sessionAchievements.push(achievement.id)
            notifyEvent('achievement_unlocked', achievement)
          }
          break
      }
      
      return newState
    })
  }, [notifyEvent, gameConfig])
  
  // Continuous timer effect - counts down from 300 seconds throughout entire game
  // Implements freeze power-up by checking if freeze is active
  useEffect(() => {
    if (gameState.isActive && !gameState.isPaused && !gameState.isGameOver) {
      timerRef.current = setInterval(() => {
        // Check if freeze power-up is active
        const isFrozen = gameState.activePowerUps.some(p => p.type === 'freeze')
        
        if (!isFrozen) {
          // Only decrement timer if not frozen
          dispatch({
            type: 'UPDATE_TIMER',
            payload: { timeRemaining: gameState.timeRemaining - 1 }
          })
        }
        
        // Always update power-up durations
        dispatch({ type: 'UPDATE_POWERUPS' })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState.isActive, gameState.isPaused, gameState.isGameOver, gameState.activePowerUps, dispatch])
  
  // Game control methods
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' })
  }, [dispatch])
  
  const pauseGame = useCallback(() => {
    if (gameState.pausesRemaining > 0) {
      dispatch({ type: 'PAUSE_GAME' })
    }
  }, [dispatch, gameState.pausesRemaining])
  
  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' })
  }, [dispatch])
  
  const endGame = useCallback(() => {
    dispatch({ type: 'END_GAME' })
  }, [dispatch])
  
  const answerQuestion = useCallback((isCorrect: boolean, responseTime: number, difficulty: number = 1) => {
    dispatch({ 
      type: 'ANSWER_QUESTION', 
      payload: { isCorrect, responseTime, difficulty } 
    })
  }, [dispatch])
  
  const loadQuestion = useCallback((questionId: string) => {
    dispatch({ 
      type: 'LOAD_QUESTION', 
      payload: { questionId } 
    })
  }, [dispatch])
  
  // Debounce ref to prevent double firing in React Strict Mode
  const lastPowerUpActivation = useRef<{ type: PowerUpType; timestamp: number } | null>(null)
  
  const activatePowerUp = useCallback((powerUpType: PowerUpType) => {
    const now = Date.now()
    
    // Prevent double firing within 100ms
    if (lastPowerUpActivation.current && 
        lastPowerUpActivation.current.type === powerUpType && 
        now - lastPowerUpActivation.current.timestamp < 100) {
      console.log(`🛡️ Prevented double firing of ${powerUpType}`)
      return
    }
    
    lastPowerUpActivation.current = { type: powerUpType, timestamp: now }
    
    dispatch({ 
      type: 'ACTIVATE_POWERUP', 
      payload: { powerUpType } 
    })
  }, [dispatch])
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [dispatch])
  
  // Computed values
  const accuracy = gameState.questionsAnswered > 0 
    ? Math.round((gameState.correctAnswers / gameState.questionsAnswered) * 100)
    : 0
    
  const timeProgress = gameConfig.questionTimeLimit > 0 
    ? (gameState.timeRemaining / gameConfig.questionTimeLimit) * 100
    : 0
    
  const streakMultiplier = gameState.streak === 0 ? 1 : 
    gameState.streak === 1 ? 1 : Math.pow(1.1, gameState.streak - 1)
  
  return {
    // Game state
    gameState,
    accuracy,
    timeProgress,
    streakMultiplier,
    config: gameConfig,
    
    // Game controls
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    answerQuestion,
    loadQuestion,
    activatePowerUp,
    
    // Observer management
    addObserver,
    removeObserver,
    
    // State queries
    isGameActive: gameState.isActive && !gameState.isGameOver,
    canUsePowerUp: (type: PowerUpType) => {
      return gameState.score >= gameState.powerUpCosts[type] &&
             !gameState.activePowerUps.some(p => p.type === type) &&
             gameState.powerUpCooldowns[type] === 0
    }
  }
}