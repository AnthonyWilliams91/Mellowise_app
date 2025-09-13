/**
 * Tests for useSurvivalMode Hook - Power-up Cost Calculation Fix
 * 
 * Verifies the fixes for:
 * 1. Power-up cost calculation bug
 * 2. Game state reset functionality  
 * 3. Proper score management
 */

import { renderHook, act } from '@testing-library/react'
import { useSurvivalMode } from '../useSurvivalMode'

describe('useSurvivalMode Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Power-up Cost Calculation Fix', () => {
    test('should deduct correct power-up cost and prevent negative scores', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      act(() => {
        result.current.startGame()
      })
      
      // Simulate earning 32 points (2 correct answers with streak)
      act(() => {
        result.current.answerQuestion(true, 5000, 5) // First correct answer
      })
      
      act(() => {
        result.current.answerQuestion(true, 4000, 5) // Second correct answer with streak
      })
      
      // Verify we have around 32 points (exact calculation: 20 base + streak bonus)
      const initialScore = result.current.gameState.score
      expect(initialScore).toBeGreaterThan(30)
      
      // Get initial time extension cost (should be 30)
      const initialCost = result.current.gameState.powerUpCosts.time_extension
      expect(initialCost).toBe(30)
      
      // Activate time extension power-up
      act(() => {
        result.current.activatePowerUp('time_extension')
      })
      
      // Verify correct cost was deducted
      const expectedScoreAfterPurchase = initialScore - initialCost
      expect(result.current.gameState.score).toBe(expectedScoreAfterPurchase)
      
      // Verify score is not negative (Math.max(0, score) protection)
      expect(result.current.gameState.score).toBeGreaterThanOrEqual(0)
      
      // Verify cost scaling for next use (30 * 1.2 = 36, rounded to nearest 5 = 35)
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(35)
    })

    test('should prevent power-up activation when insufficient points', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      act(() => {
        result.current.startGame()
      })
      
      // Try to activate expensive power-up with 0 points
      const initialScore = result.current.gameState.score
      expect(initialScore).toBe(0)
      
      // Life restore costs 100 points
      expect(result.current.gameState.powerUpCosts.life_restore).toBe(100)
      
      // Should not be able to use power-up
      expect(result.current.canUsePowerUp('life_restore')).toBe(false)
      
      act(() => {
        result.current.activatePowerUp('life_restore')
      })
      
      // Score should remain 0 (activation was blocked)
      expect(result.current.gameState.score).toBe(0)
      
      // Lives should remain unchanged
      expect(result.current.gameState.lives).toBe(3)
    })

    test('should handle power-up cost scaling correctly for multiple uses', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      act(() => {
        result.current.startGame()
      })
      
      // Give player enough points for multiple power-ups
      act(() => {
        // Simulate high-scoring streak to get enough points
        for (let i = 0; i < 5; i++) {
          result.current.answerQuestion(true, 3000, 8) // High difficulty questions
        }
      })
      
      const abundantScore = result.current.gameState.score
      expect(abundantScore).toBeGreaterThan(200) // Should have plenty of points
      
      // First time extension purchase (cost: 30)
      const cost1 = result.current.gameState.powerUpCosts.time_extension
      expect(cost1).toBe(30)
      
      act(() => {
        result.current.activatePowerUp('time_extension')
      })
      
      const scoreAfterFirst = result.current.gameState.score
      expect(scoreAfterFirst).toBe(abundantScore - 30)
      
      // Cost should scale to 35 (30 * 1.2 = 36, rounded to nearest 5 = 35)
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(35)
      
      // Wait for cooldown to expire (mock timer)
      act(() => {
        // Mock cooldown expiry
        jest.advanceTimersByTime(45000) // 45 seconds cooldown
      })
      
      // Second purchase should cost 35
      act(() => {
        result.current.activatePowerUp('time_extension')
      })
      
      expect(result.current.gameState.score).toBe(scoreAfterFirst - 35)
      
      // Cost should scale again (35 * 1.2 = 42, rounded to nearest 5 = 40)
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(40)
    })
  })

  describe('Game State Reset Functionality', () => {
    test('should completely reset all game state when resetGame is called', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      act(() => {
        result.current.startGame()
      })
      
      // Modify game state significantly
      act(() => {
        // Answer some questions
        result.current.answerQuestion(true, 3000, 5)
        result.current.answerQuestion(false, 8000, 3) // Lose a life
        
        // Use power-ups
        result.current.activatePowerUp('time_extension')
        
        // Use pauses
        result.current.pauseGame()
      })
      
      // Verify state has been modified
      expect(result.current.gameState.score).toBeGreaterThan(0)
      expect(result.current.gameState.lives).toBe(2) // Lost one life
      expect(result.current.gameState.questionsAnswered).toBe(2)
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(35) // Scaled cost
      expect(result.current.gameState.pausesRemaining).toBe(2) // Used one pause
      
      // Reset the game
      act(() => {
        result.current.resetGame()
      })
      
      // Verify complete reset
      expect(result.current.gameState.score).toBe(0)
      expect(result.current.gameState.lives).toBe(3) // Back to initial
      expect(result.current.gameState.maxLives).toBe(5)
      expect(result.current.gameState.streak).toBe(0)
      expect(result.current.gameState.maxStreak).toBe(0)
      expect(result.current.gameState.questionsAnswered).toBe(0)
      expect(result.current.gameState.correctAnswers).toBe(0)
      expect(result.current.gameState.incorrectAnswers).toBe(0)
      expect(result.current.gameState.timeRemaining).toBe(300) // Reset to 5 minutes
      expect(result.current.gameState.isActive).toBe(false)
      expect(result.current.gameState.isPaused).toBe(false)
      expect(result.current.gameState.isGameOver).toBe(false)
      expect(result.current.gameState.pausesRemaining).toBe(3) // Reset to max
      expect(result.current.gameState.currentDifficulty).toBe('easy') // Reset to initial
      
      // Verify power-up costs are reset to initial values
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(30)
      expect(result.current.gameState.powerUpCosts.life_restore).toBe(100)
      expect(result.current.gameState.powerUpCosts.hint).toBe(50)
      expect(result.current.gameState.powerUpCosts.fifty_fifty).toBe(40)
      expect(result.current.gameState.powerUpCosts.freeze).toBe(60)
      
      // Verify power-up cooldowns are reset
      expect(result.current.gameState.powerUpCooldowns.time_extension).toBe(0)
      expect(result.current.gameState.powerUpCooldowns.life_restore).toBe(0)
      expect(result.current.gameState.powerUpCooldowns.hint).toBe(0)
      expect(result.current.gameState.powerUpCooldowns.fifty_fifty).toBe(0)
      expect(result.current.gameState.powerUpCooldowns.freeze).toBe(0)
      
      // Verify active power-ups are cleared
      expect(result.current.gameState.activePowerUps).toHaveLength(0)
      
      // Verify session ID is regenerated
      expect(result.current.gameState.sessionId).toBeDefined()
      expect(result.current.gameState.sessionId).not.toBe('')
    })

    test('should allow starting a fresh game after reset', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      // Play a game and mess up the state
      act(() => {
        result.current.startGame()
        result.current.answerQuestion(true, 3000, 5)
        result.current.activatePowerUp('time_extension')
        result.current.endGame()
      })
      
      // Reset and start fresh
      act(() => {
        result.current.resetGame()
        result.current.startGame()
      })
      
      // Should be in a fresh game state
      expect(result.current.gameState.isActive).toBe(true)
      expect(result.current.gameState.isGameOver).toBe(false)
      expect(result.current.gameState.score).toBe(0)
      expect(result.current.gameState.lives).toBe(3)
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(30) // Reset cost
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle rapid power-up activations gracefully', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      act(() => {
        result.current.startGame()
        // Give enough points
        result.current.answerQuestion(true, 2000, 8)
        result.current.answerQuestion(true, 2000, 8)
        result.current.answerQuestion(true, 2000, 8)
      })
      
      const initialScore = result.current.gameState.score
      
      // Try to activate same power-up multiple times rapidly
      act(() => {
        result.current.activatePowerUp('time_extension')
        result.current.activatePowerUp('time_extension') // Should be blocked by cooldown
        result.current.activatePowerUp('time_extension') // Should be blocked by cooldown
      })
      
      // Only one activation should have succeeded
      const expectedScore = initialScore - 30 // Only one deduction
      expect(result.current.gameState.score).toBe(expectedScore)
    })

    test('should maintain game state integrity during complex scenarios', () => {
      const { result } = renderHook(() => useSurvivalMode())
      
      act(() => {
        result.current.startGame()
      })
      
      // Complex scenario: multiple correct answers, power-ups, pauses, and state changes
      act(() => {
        // Build up score and streak
        result.current.answerQuestion(true, 3000, 5) // +20 points
        result.current.answerQuestion(true, 2500, 6) // +streak bonus
        result.current.answerQuestion(true, 2000, 7) // +more streak bonus
        
        // Use different power-ups
        result.current.activatePowerUp('time_extension') // -30 points, +30 seconds
        
        // Pause and resume
        result.current.pauseGame()
        result.current.resumeGame()
        
        // Wrong answer (should reset streak and lose life)
        result.current.answerQuestion(false, 8000, 4)
        
        // Try to use life restore
        result.current.activatePowerUp('life_restore')
      })
      
      // Verify final state makes sense
      expect(result.current.gameState.lives).toBeGreaterThanOrEqual(1)
      expect(result.current.gameState.streak).toBe(0) // Reset by wrong answer
      expect(result.current.gameState.questionsAnswered).toBe(4)
      expect(result.current.gameState.correctAnswers).toBe(3)
      expect(result.current.gameState.incorrectAnswers).toBe(1)
      
      // Verify power-up costs have been scaled appropriately
      expect(result.current.gameState.powerUpCosts.time_extension).toBe(35)
      
      // If life restore was used, verify cost scaling
      if (result.current.gameState.lives === 3) {
        expect(result.current.gameState.powerUpCosts.life_restore).toBe(120) // 100 * 1.2 = 120
      }
    })
  })
})