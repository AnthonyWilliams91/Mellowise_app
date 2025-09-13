/**
 * Tests for GameHeader Component - Enhanced Pause Menu
 * 
 * Verifies the fixes for:
 * 1. Enhanced pause menu with Save Game and End Game buttons
 * 2. Proper pause/resume functionality
 * 3. Pause counter display and limits
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameHeader from '../GameHeader'
import type { GameState } from '@/types/survival-mode'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

describe('GameHeader Component', () => {
  const mockOnPause = jest.fn()
  const mockOnResume = jest.fn()
  const mockOnSaveGame = jest.fn()
  const mockOnEndGame = jest.fn()

  const defaultGameState: GameState = {
    sessionId: 'test-session',
    isActive: true,
    isPaused: false,
    isGameOver: false,
    lives: 3,
    maxLives: 5,
    score: 150,
    streak: 2,
    maxStreak: 4,
    currentQuestion: 'test-q-1',
    questionsAnswered: 8,
    correctAnswers: 6,
    incorrectAnswers: 2,
    timeRemaining: 180,
    questionStartTime: Date.now(),
    totalGameTime: 120000,
    availablePowerUps: [],
    activePowerUps: [],
    powerUpCooldowns: {
      hint: 0,
      time_extension: 0,
      fifty_fifty: 0,
      life_restore: 0,
      freeze: 0
    },
    powerUpCosts: {
      hint: 50,
      time_extension: 30,
      fifty_fifty: 40,
      life_restore: 100,
      freeze: 60
    },
    pausesRemaining: 2,
    maxPauses: 3,
    currentDifficulty: 'medium',
    difficultyProgression: 1,
    achievements: [],
    sessionAchievements: []
  }

  const defaultProps = {
    gameState: defaultGameState,
    accuracy: 75,
    timeProgress: 60,
    streakMultiplier: 1.21,
    currentQuestionDifficulty: 6,
    onPause: mockOnPause,
    onResume: mockOnResume,
    onSaveGame: mockOnSaveGame,
    onEndGame: mockOnEndGame
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Game Header Display', () => {
    test('should render game statistics correctly', () => {
      render(<GameHeader {...defaultProps} />)
      
      // Check score display
      expect(screen.getByText('150')).toBeInTheDocument()
      
      // Check lives display
      expect(screen.getByText('3/5')).toBeInTheDocument()
      
      // Check timer display
      expect(screen.getByText('180s')).toBeInTheDocument()
      
      // Check accuracy
      expect(screen.getByText('75%')).toBeInTheDocument()
      
      // Check questions progress
      expect(screen.getByText('6/8')).toBeInTheDocument()
      
      // Check streak multiplier
      expect(screen.getByText('1.21x')).toBeInTheDocument()
      
      // Check difficulty level
      expect(screen.getByText('Level 6')).toBeInTheDocument()
    })

    test('should show pause button with remaining pauses counter', () => {
      render(<GameHeader {...defaultProps} />)
      
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toBeInTheDocument()
      expect(pauseButton).not.toBeDisabled()
      
      // Should show remaining pauses count
      expect(screen.getByText('2')).toBeInTheDocument() // pausesRemaining badge
    })

    test('should disable pause button when no pauses remaining', () => {
      const gameStateWithNoPauses = {
        ...defaultGameState,
        pausesRemaining: 0
      }
      
      render(<GameHeader {...defaultProps} gameState={gameStateWithNoPauses} />)
      
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toBeDisabled()
      expect(pauseButton).toHaveAttribute('title', 'No pauses remaining')
    })
  })

  describe('Pause Functionality', () => {
    test('should call onPause when pause button is clicked', async () => {
      const user = userEvent.setup()
      render(<GameHeader {...defaultProps} />)
      
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      await user.click(pauseButton)
      
      expect(mockOnPause).toHaveBeenCalledTimes(1)
    })

    test('should show resume button when game is paused', () => {
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      render(<GameHeader {...defaultProps} gameState={pausedGameState} />)
      
      const resumeButton = screen.getByRole('button', { name: /resume/i })
      expect(resumeButton).toBeInTheDocument()
      expect(resumeButton).not.toBeDisabled()
    })
  })

  describe('Enhanced Pause Menu', () => {
    test('should show enhanced pause overlay when game is paused', () => {
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      render(<GameHeader {...defaultProps} gameState={pausedGameState} />)
      
      // Should show pause overlay
      expect(screen.getByText('Game Paused')).toBeInTheDocument()
      expect(screen.getByText('What would you like to do?')).toBeInTheDocument()
      
      // Should show all menu options
      expect(screen.getByRole('button', { name: /resume game/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save game/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /end game/i })).toBeInTheDocument()
      
      // Should show remaining pauses
      expect(screen.getByText('Pauses remaining: 2')).toBeInTheDocument()
    })

    test('should call onResume when Resume Game button is clicked in pause menu', async () => {
      const user = userEvent.setup()
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      render(<GameHeader {...defaultProps} gameState={pausedGameState} />)
      
      const resumeButton = screen.getByRole('button', { name: /resume game/i })
      await user.click(resumeButton)
      
      expect(mockOnResume).toHaveBeenCalledTimes(1)
    })

    test('should call onSaveGame when Save Game button is clicked', async () => {
      const user = userEvent.setup()
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      render(<GameHeader {...defaultProps} gameState={pausedGameState} />)
      
      const saveGameButton = screen.getByRole('button', { name: /save game/i })
      await user.click(saveGameButton)
      
      expect(mockOnSaveGame).toHaveBeenCalledTimes(1)
    })

    test('should call onEndGame when End Game button is clicked', async () => {
      const user = userEvent.setup()
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      render(<GameHeader {...defaultProps} gameState={pausedGameState} />)
      
      const endGameButton = screen.getByRole('button', { name: /end game/i })
      await user.click(endGameButton)
      
      expect(mockOnEndGame).toHaveBeenCalledTimes(1)
    })

    test('should not show Save Game button when onSaveGame handler is not provided', () => {
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      const propsWithoutSaveGame = {
        ...defaultProps,
        onSaveGame: undefined
      }
      
      render(<GameHeader {...propsWithoutSaveGame} gameState={pausedGameState} />)
      
      expect(screen.getByRole('button', { name: /resume game/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /save game/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /end game/i })).toBeInTheDocument()
    })

    test('should not show End Game button when onEndGame handler is not provided', () => {
      const pausedGameState = {
        ...defaultGameState,
        isPaused: true
      }
      
      const propsWithoutEndGame = {
        ...defaultProps,
        onEndGame: undefined
      }
      
      render(<GameHeader {...propsWithoutEndGame} gameState={pausedGameState} />)
      
      expect(screen.getByRole('button', { name: /resume game/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save game/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /end game/i })).not.toBeInTheDocument()
    })
  })

  describe('Timer Display and Status', () => {
    test('should show warning state for low time (≤ 10 seconds)', () => {
      const lowTimeGameState = {
        ...defaultGameState,
        timeRemaining: 8
      }
      
      render(<GameHeader {...defaultProps} gameState={lowTimeGameState} />)
      
      const timerDisplay = screen.getByText('8s')
      expect(timerDisplay).toHaveClass('text-amber-600') // Warning color
    })

    test('should show critical state for very low time (≤ 5 seconds)', () => {
      const criticalTimeGameState = {
        ...defaultGameState,
        timeRemaining: 3
      }
      
      render(<GameHeader {...defaultProps} gameState={criticalTimeGameState} />)
      
      const timerDisplay = screen.getByText('3s')
      expect(timerDisplay).toHaveClass('text-red-600') // Critical color
    })
  })

  describe('Game Over State', () => {
    test('should show game over overlay when game is over', () => {
      const gameOverState = {
        ...defaultGameState,
        isGameOver: true,
        lives: 0
      }
      
      render(<GameHeader {...defaultProps} gameState={gameOverState} />)
      
      expect(screen.getByText('Game Over!')).toBeInTheDocument()
      expect(screen.getByText('Final Score:')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument() // Final score
    })

    test('should not show pause menu when game is over', () => {
      const gameOverState = {
        ...defaultGameState,
        isGameOver: true,
        isPaused: true // This shouldn't matter when game is over
      }
      
      render(<GameHeader {...defaultProps} gameState={gameOverState} />)
      
      // Should show game over, not pause menu
      expect(screen.getByText('Game Over!')).toBeInTheDocument()
      expect(screen.queryByText('Game Paused')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility and User Experience', () => {
    test('should have proper aria labels and roles', () => {
      render(<GameHeader {...defaultProps} />)
      
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toHaveAttribute('title')
    })

    test('should show proper tooltip for pause button based on remaining pauses', () => {
      render(<GameHeader {...defaultProps} />)
      
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toHaveAttribute('title', '2 pauses left')
    })

    test('should update pause button tooltip when no pauses remain', () => {
      const noPausesState = {
        ...defaultGameState,
        pausesRemaining: 0
      }
      
      render(<GameHeader {...defaultProps} gameState={noPausesState} />)
      
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      expect(pauseButton).toHaveAttribute('title', 'No pauses remaining')
    })
  })

  describe('Integration with Game State Changes', () => {
    test('should update display when game state changes', () => {
      const { rerender } = render(<GameHeader {...defaultProps} />)
      
      // Initial state
      expect(screen.getByText('150')).toBeInTheDocument() // Score
      expect(screen.getByText('3/5')).toBeInTheDocument() // Lives
      
      // Update game state
      const updatedGameState = {
        ...defaultGameState,
        score: 200,
        lives: 2,
        streak: 5,
        pausesRemaining: 1
      }
      
      rerender(<GameHeader {...defaultProps} gameState={updatedGameState} />)
      
      // Should reflect updated state
      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByText('2/5')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Pauses remaining badge
    })

    test('should handle streak multiplier display correctly', () => {
      const highStreakState = {
        ...defaultGameState,
        streak: 8
      }
      
      const highMultiplierProps = {
        ...defaultProps,
        gameState: highStreakState,
        streakMultiplier: 2.14
      }
      
      render(<GameHeader {...highMultiplierProps} />)
      
      expect(screen.getByText('8')).toBeInTheDocument() // Streak count
      expect(screen.getByText('2.14x')).toBeInTheDocument() // Multiplier
      expect(screen.getByText('BONUS')).toBeInTheDocument() // Bonus label
    })
  })
})