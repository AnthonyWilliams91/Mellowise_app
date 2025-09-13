/**
 * Tests for SurvivalModeGame Component - Play Again Reset and Save Game
 * 
 * Verifies the fixes for:
 * 1. Play Again button properly resets game state
 * 2. Save Game functionality works correctly
 * 3. Component state management during game lifecycle
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SurvivalModeGame from '../SurvivalModeGame'

// Mock the useSurvivalMode hook
const mockStartGame = jest.fn()
const mockResetGame = jest.fn()
const mockEndGame = jest.fn()
const mockPauseGame = jest.fn()
const mockResumeGame = jest.fn()
const mockAnswerQuestion = jest.fn()
const mockActivatePowerUp = jest.fn()
const mockAddObserver = jest.fn()
const mockRemoveObserver = jest.fn()
const mockCanUsePowerUp = jest.fn(() => true)

jest.mock('@/hooks/useSurvivalMode', () => ({
  useSurvivalMode: () => ({
    gameState: {
      sessionId: 'test-session-123',
      isActive: false,
      isPaused: false,
      isGameOver: false,
      lives: 3,
      maxLives: 5,
      score: 0,
      streak: 0,
      maxStreak: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeRemaining: 300,
      pausesRemaining: 3,
      maxPauses: 3,
      currentDifficulty: 'easy',
      activePowerUps: [],
      powerUpCosts: {
        hint: 50,
        time_extension: 30,
        fifty_fifty: 40,
        life_restore: 100,
        freeze: 60
      },
      powerUpCooldowns: {
        hint: 0,
        time_extension: 0,
        fifty_fifty: 0,
        life_restore: 0,
        freeze: 0
      }
    },
    accuracy: 0,
    timeProgress: 100,
    streakMultiplier: 1,
    config: {
      initialLives: 3,
      maxLives: 5,
      questionTimeLimit: 300,
      maxPauses: 3,
      baseScore: 10
    },
    startGame: mockStartGame,
    resetGame: mockResetGame,
    pauseGame: mockPauseGame,
    resumeGame: mockResumeGame,
    endGame: mockEndGame,
    answerQuestion: mockAnswerQuestion,
    activatePowerUp: mockActivatePowerUp,
    addObserver: mockAddObserver,
    removeObserver: mockRemoveObserver,
    isGameActive: false,
    canUsePowerUp: mockCanUsePowerUp
  })
}))

// Mock the question service
jest.mock('@/lib/questions/question-service', () => ({
  questionService: {
    getRandomQuestion: jest.fn().mockResolvedValue({
      tenant_id: 'demo',
      id: 'test-question-1',
      exam_type_id: 'lsat',
      category_id: 'logical-reasoning',
      content: 'Test question content',
      question_type: 'strengthen',
      difficulty: 5,
      correct_answer: 'B',
      answer_choices: [
        { id: 'A', text: 'Choice A' },
        { id: 'B', text: 'Choice B' },
        { id: 'C', text: 'Choice C' },
        { id: 'D', text: 'Choice D' }
      ],
      explanation: 'Test explanation'
    }),
    recordAttempt: jest.fn().mockResolvedValue({})
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('SurvivalModeGame Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.getItem.mockClear()
  })

  describe('Initial Render and Game Start', () => {
    test('should render initial game state with start button', () => {
      render(<SurvivalModeGame />)
      
      expect(screen.getByText('Survival Mode')).toBeInTheDocument()
      expect(screen.getByText('Start Survival Mode')).toBeInTheDocument()
      expect(screen.getByText(/Answer LSAT questions correctly to survive/)).toBeInTheDocument()
    })

    test('should start game when start button is clicked', async () => {
      const user = userEvent.setup()
      render(<SurvivalModeGame />)
      
      const startButton = screen.getByText('Start Survival Mode')
      await user.click(startButton)
      
      expect(mockStartGame).toHaveBeenCalledTimes(1)
    })
  })

  describe('Play Again Reset Functionality', () => {
    test('should render Play Again button when game is over', () => {
      // Mock game over state
      const mockGameOverState = jest.requireMock('@/hooks/useSurvivalMode')
      mockGameOverState.useSurvivalMode = () => ({
        ...mockGameOverState.useSurvivalMode(),
        gameState: {
          ...mockGameOverState.useSurvivalMode().gameState,
          isGameOver: true,
          score: 150,
          questionsAnswered: 5,
          correctAnswers: 3,
          maxStreak: 3
        },
        accuracy: 60
      })

      render(<SurvivalModeGame />)
      
      expect(screen.getByText('Game Over!')).toBeInTheDocument()
      expect(screen.getByText('Play Again')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument() // Final score
      expect(screen.getByText('60%')).toBeInTheDocument() // Accuracy
    })

    test('should reset game and start new game when Play Again is clicked', async () => {
      const user = userEvent.setup()
      
      // Mock game over state
      const mockGameOverState = jest.requireMock('@/hooks/useSurvivalMode')
      mockGameOverState.useSurvivalMode = () => ({
        ...mockGameOverState.useSurvivalMode(),
        gameState: {
          ...mockGameOverState.useSurvivalMode().gameState,
          isGameOver: true,
          score: 150,
          lives: 0,
          questionsAnswered: 8,
          correctAnswers: 5,
          powerUpCosts: {
            time_extension: 35, // Modified cost from previous game
            life_restore: 120,
            hint: 60,
            fifty_fifty: 50,
            freeze: 75
          }
        }
      })

      render(<SurvivalModeGame />)
      
      const playAgainButton = screen.getByText('Play Again')
      await user.click(playAgainButton)
      
      // Should call resetGame first to clear all state
      expect(mockResetGame).toHaveBeenCalledTimes(1)
      
      // Then start a new game after reset
      await waitFor(() => {
        expect(mockStartGame).toHaveBeenCalledTimes(1)
      }, { timeout: 1000 })
    })

    test('should clear component state when restarting game', async () => {
      const user = userEvent.setup()
      
      const mockGameOverState = jest.requireMock('@/hooks/useSurvivalMode')
      mockGameOverState.useSurvivalMode = () => ({
        ...mockGameOverState.useSurvivalMode(),
        gameState: {
          ...mockGameOverState.useSurvivalMode().gameState,
          isGameOver: true
        }
      })

      render(<SurvivalModeGame />)
      
      const playAgainButton = screen.getByText('Play Again')
      await user.click(playAgainButton)
      
      // Should call resetGame which clears:
      // - Current question state
      // - Question loading state  
      // - Explanation display state
      expect(mockResetGame).toHaveBeenCalledTimes(1)
    })
  })

  describe('Save Game Functionality', () => {
    test('should save game state to localStorage when Save Game is clicked', async () => {
      const user = userEvent.setup()
      
      // Mock paused game state
      const mockPausedState = jest.requireMock('@/hooks/useSurvivalMode')
      mockPausedState.useSurvivalMode = () => ({
        ...mockPausedState.useSurvivalMode(),
        gameState: {
          ...mockPausedState.useSurvivalMode().gameState,
          isActive: true,
          isPaused: true,
          score: 85,
          lives: 2,
          streak: 3,
          questionsAnswered: 6,
          correctAnswers: 4,
          timeRemaining: 240,
          currentDifficulty: 'medium',
          powerUpCosts: {
            time_extension: 35,
            life_restore: 100,
            hint: 50,
            fifty_fifty: 40,
            freeze: 60
          },
          sessionId: 'test-session-456'
        }
      })

      render(<SurvivalModeGame />)
      
      // Should show pause overlay with Save Game button
      expect(screen.getByText('Game Paused')).toBeInTheDocument()
      expect(screen.getByText('Save Game')).toBeInTheDocument()
      
      const saveButton = screen.getByText('Save Game')
      await user.click(saveButton)
      
      // Should save to localStorage with correct structure
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'mellowise_survival_save',
        expect.stringContaining('"sessionId":"test-session-456"')
      )
      
      // Should resume game after saving
      expect(mockResumeGame).toHaveBeenCalledTimes(1)
    })

    test('should save complete game state including current question', async () => {
      const user = userEvent.setup()
      
      const mockPausedState = jest.requireMock('@/hooks/useSurvivalMode')
      mockPausedState.useSurvivalMode = () => ({
        ...mockPausedState.useSurvivalMode(),
        gameState: {
          ...mockPausedState.useSurvivalMode().gameState,
          isActive: true,
          isPaused: true,
          sessionId: 'test-session-789'
        }
      })

      render(<SurvivalModeGame />)
      
      const saveButton = screen.getByText('Save Game')
      await user.click(saveButton)
      
      const savedData = mockLocalStorage.setItem.mock.calls[0][1]
      const parsedData = JSON.parse(savedData)
      
      // Verify save structure
      expect(parsedData).toHaveProperty('sessionId', 'test-session-789')
      expect(parsedData).toHaveProperty('timestamp')
      expect(parsedData).toHaveProperty('gameState')
      expect(parsedData).toHaveProperty('version', '1.0')
      expect(parsedData.gameState).toHaveProperty('score')
      expect(parsedData.gameState).toHaveProperty('lives')
      expect(parsedData.gameState).toHaveProperty('powerUpCosts')
      expect(parsedData.gameState).toHaveProperty('timeRemaining')
    })

    test('should handle save game errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Mock localStorage to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const mockPausedState = jest.requireMock('@/hooks/useSurvivalMode')
      mockPausedState.useSurvivalMode = () => ({
        ...mockPausedState.useSurvivalMode(),
        gameState: {
          ...mockPausedState.useSurvivalMode().gameState,
          isActive: true,
          isPaused: true
        }
      })

      render(<SurvivalModeGame />)
      
      const saveButton = screen.getByText('Save Game')
      await user.click(saveButton)
      
      // Should log error
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save game:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    test('should detect existing saved game on component mount', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        sessionId: 'existing-session',
        gameState: { score: 50 },
        timestamp: new Date().toISOString()
      }))
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<SurvivalModeGame />)
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('mellowise_survival_save')
      expect(consoleSpy).toHaveBeenCalledWith('Saved game detected in localStorage')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Enhanced Pause Menu', () => {
    test('should show enhanced pause menu with all options', () => {
      const mockPausedState = jest.requireMock('@/hooks/useSurvivalMode')
      mockPausedState.useSurvivalMode = () => ({
        ...mockPausedState.useSurvivalMode(),
        gameState: {
          ...mockPausedState.useSurvivalMode().gameState,
          isActive: true,
          isPaused: true,
          pausesRemaining: 2
        }
      })

      render(<SurvivalModeGame />)
      
      // Should show pause overlay with all options
      expect(screen.getByText('Game Paused')).toBeInTheDocument()
      expect(screen.getByText('What would you like to do?')).toBeInTheDocument()
      expect(screen.getByText('Resume Game')).toBeInTheDocument()
      expect(screen.getByText('Save Game')).toBeInTheDocument()
      expect(screen.getByText('End Game')).toBeInTheDocument()
      expect(screen.getByText('Pauses remaining: 2')).toBeInTheDocument()
    })

    test('should end game when End Game button is clicked', async () => {
      const user = userEvent.setup()
      
      const mockPausedState = jest.requireMock('@/hooks/useSurvivalMode')
      mockPausedState.useSurvivalMode = () => ({
        ...mockPausedState.useSurvivalMode(),
        gameState: {
          ...mockPausedState.useSurvivalMode().gameState,
          isActive: true,
          isPaused: true
        }
      })

      render(<SurvivalModeGame />)
      
      const endGameButton = screen.getByText('End Game')
      await user.click(endGameButton)
      
      expect(mockEndGame).toHaveBeenCalledTimes(1)
    })

    test('should resume game when Resume Game button is clicked', async () => {
      const user = userEvent.setup()
      
      const mockPausedState = jest.requireMock('@/hooks/useSurvivalMode')
      mockPausedState.useSurvivalMode = () => ({
        ...mockPausedState.useSurvivalMode(),
        gameState: {
          ...mockPausedState.useSurvivalMode().gameState,
          isActive: true,
          isPaused: true
        }
      })

      render(<SurvivalModeGame />)
      
      const resumeButton = screen.getByText('Resume Game')
      await user.click(resumeButton)
      
      expect(mockResumeGame).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration Tests', () => {
    test('should handle complete game lifecycle with reset', async () => {
      const user = userEvent.setup()
      
      // Start with initial state
      const { rerender } = render(<SurvivalModeGame />)
      
      // Start game
      const startButton = screen.getByText('Start Survival Mode')
      await user.click(startButton)
      expect(mockStartGame).toHaveBeenCalledTimes(1)
      
      // Mock active game state
      const mockActiveState = jest.requireMock('@/hooks/useSurvivalMode')
      mockActiveState.useSurvivalMode = () => ({
        ...mockActiveState.useSurvivalMode(),
        gameState: {
          ...mockActiveState.useSurvivalMode().gameState,
          isActive: true,
          score: 95,
          lives: 2,
          streak: 4
        },
        isGameActive: true
      })
      rerender(<SurvivalModeGame />)
      
      // Mock game over state
      mockActiveState.useSurvivalMode = () => ({
        ...mockActiveState.useSurvivalMode(),
        gameState: {
          ...mockActiveState.useSurvivalMode().gameState,
          isGameOver: true,
          score: 95,
          lives: 0
        },
        isGameActive: false
      })
      rerender(<SurvivalModeGame />)
      
      // Click Play Again
      const playAgainButton = screen.getByText('Play Again')
      await user.click(playAgainButton)
      
      // Should reset and start new game
      expect(mockResetGame).toHaveBeenCalledTimes(1)
      expect(mockStartGame).toHaveBeenCalledTimes(2) // Initial + restart
    })
  })
})