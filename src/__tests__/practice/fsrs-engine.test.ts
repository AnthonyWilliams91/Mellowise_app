/**
 * FSRS Algorithm Engine Tests
 * MELLOWISE-010: Dynamic Difficulty Adjustment
 * 
 * Comprehensive unit tests for the FSRS-inspired algorithm engine
 * ensuring correct difficulty calculations and stability updates.
 * 
 * @author Developer Agent James
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { FSRSAlgorithmEngine, DEFAULT_FSRS_CONFIG } from '@/lib/practice/fsrs-engine'
import type {
  FSRSState,
  DifficultyContext,
  PerformancePoint,
  TopicType,
  LearningStyleDifficultyPreferences
} from '@/types/dynamic-difficulty'

describe('FSRSAlgorithmEngine', () => {
  let engine: FSRSAlgorithmEngine

  beforeEach(() => {
    engine = new FSRSAlgorithmEngine()
  })

  describe('Basic Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = engine.getConfiguration()
      expect(config.defaultDifficulty).toBe(5.0)
      expect(config.targetSuccessRate).toBe(0.75)
      expect(config.baseStabilityScore).toBe(50.0)
    })

    it('should allow configuration updates', () => {
      engine.updateConfiguration({ targetSuccessRate: 0.8 })
      const config = engine.getConfiguration()
      expect(config.targetSuccessRate).toBe(0.8)
    })
  })

  describe('Initial State Creation', () => {
    it('should create valid initial state with defaults', () => {
      const initialState = engine.createInitialState()
      
      expect(initialState.difficulty).toBe(DEFAULT_FSRS_CONFIG.defaultDifficulty)
      expect(initialState.stability).toBe(DEFAULT_FSRS_CONFIG.baseStabilityScore)
      expect(initialState.confidence).toBe(30)
      expect(initialState.successRate).toBe(DEFAULT_FSRS_CONFIG.targetSuccessRate)
      expect(initialState.lastReview).toBeNull()
      expect(initialState.retrievability).toBe(0.5)
    })

    it('should create state with learning style preferences', () => {
      const learningStylePrefs: LearningStyleDifficultyPreferences = {
        learningStyle: 'analytical_fast',
        adaptationSpeed: 'moderate',
        preferredChallengeLevel: 'stretch',
        preferredStartingDifficulty: 6.0,
        targetSuccessRate: 0.8,
        stabilityPreference: 0.6,
        confidenceThreshold: 0.7,
        manualOverrideFrequency: 0.1,
        topicAffinities: {
          logical_reasoning: {
            naturalDifficulty: 0.2,
            learningSpeed: 1.1,
            stabilityFactor: 1.0,
            preferredSessionLength: 35
          },
          logic_games: {
            naturalDifficulty: 0.5,
            learningSpeed: 0.9,
            stabilityFactor: 1.1,
            preferredSessionLength: 40
          },
          reading_comprehension: {
            naturalDifficulty: -0.1,
            learningSpeed: 1.0,
            stabilityFactor: 0.9,
            preferredSessionLength: 30
          }
        }
      }

      const initialState = engine.createInitialState(learningStylePrefs, 'logical_reasoning')
      
      expect(initialState.difficulty).toBe(6.2) // 6.0 + 0.2 topic affinity
      expect(initialState.successRate).toBe(0.8)
    })
  })

  describe('Difficulty Calculations', () => {
    it('should maintain difficulty when performance is on target', () => {
      const currentState: FSRSState = {
        difficulty: 5.0,
        stability: 60.0,
        confidence: 70.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.7
      }

      // Performance exactly on target (75% success rate)
      const recentPerformance: PerformancePoint[] = [
        { difficulty: 5.0, success: true, responseTime: 45, timestamp: new Date(), confidence: 0.7 },
        { difficulty: 5.0, success: false, responseTime: 60, timestamp: new Date(), confidence: 0.7 },
        { difficulty: 5.0, success: true, responseTime: 40, timestamp: new Date(), confidence: 0.7 },
        { difficulty: 5.0, success: true, responseTime: 35, timestamp: new Date(), confidence: 0.7 }
      ]

      const context: DifficultyContext = {
        currentState,
        recentPerformance,
        learningStyleFactor: 1.0,
        topicAffinity: 1.0,
        sessionLength: 30,
        timeOfDay: 10
      }

      const calculation = engine.calculateNextDifficulty(context)
      
      // Should maintain difficulty when performance is on target
      expect(calculation.nextDifficulty).toBeCloseTo(5.0, 1)
      expect(calculation.confidenceScore).toBeGreaterThan(50)
      expect(calculation.adjustmentMagnitude).toBeLessThan(0.5)
    })

    it('should increase difficulty when performance is above target', () => {
      const currentState: FSRSState = {
        difficulty: 5.0,
        stability: 60.0,
        confidence: 70.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.7
      }

      // High performance (80% success rate - 4 out of 5 correct)
      const recentPerformance: PerformancePoint[] = [
        { difficulty: 5.0, success: true, responseTime: 30, timestamp: new Date(), confidence: 0.8 },
        { difficulty: 5.0, success: true, responseTime: 25, timestamp: new Date(), confidence: 0.8 },
        { difficulty: 5.0, success: true, responseTime: 35, timestamp: new Date(), confidence: 0.8 },
        { difficulty: 5.0, success: true, responseTime: 28, timestamp: new Date(), confidence: 0.8 },
        { difficulty: 5.0, success: false, responseTime: 70, timestamp: new Date(), confidence: 0.8 }
      ]

      const context: DifficultyContext = {
        currentState,
        recentPerformance,
        learningStyleFactor: 1.0,
        topicAffinity: 1.0,
        sessionLength: 30,
        timeOfDay: 10
      }

      const calculation = engine.calculateNextDifficulty(context)
      
      // Success rate is 0.8, target is 0.75, so delta is 0.05 (positive)
      // The algorithm should increase difficulty (positive adjustment)
      expect(calculation.nextDifficulty).toBeGreaterThan(5.0)
      expect(calculation.adjustmentMagnitude).toBeGreaterThan(0)
    })

    it('should decrease difficulty when performance is below target', () => {
      const currentState: FSRSState = {
        difficulty: 5.0,
        stability: 60.0,
        confidence: 70.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.7
      }

      // Low performance (40% success rate)
      const recentPerformance: PerformancePoint[] = [
        { difficulty: 5.0, success: false, responseTime: 90, timestamp: new Date(), confidence: 0.4 },
        { difficulty: 5.0, success: false, responseTime: 85, timestamp: new Date(), confidence: 0.4 },
        { difficulty: 5.0, success: true, responseTime: 50, timestamp: new Date(), confidence: 0.4 },
        { difficulty: 5.0, success: false, responseTime: 95, timestamp: new Date(), confidence: 0.4 },
        { difficulty: 5.0, success: true, responseTime: 60, timestamp: new Date(), confidence: 0.4 }
      ]

      const context: DifficultyContext = {
        currentState,
        recentPerformance,
        learningStyleFactor: 1.0,
        topicAffinity: 1.0,
        sessionLength: 30,
        timeOfDay: 10
      }

      const calculation = engine.calculateNextDifficulty(context)
      
      expect(calculation.nextDifficulty).toBeLessThan(5.0)
      expect(calculation.adjustmentMagnitude).toBeGreaterThan(0)
      expect(calculation.reasoning).toContain('below target')
    })

    it('should respect learning style factors', () => {
      const currentState: FSRSState = {
        difficulty: 5.0,
        stability: 50.0,
        confidence: 60.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.6
      }

      const recentPerformance: PerformancePoint[] = [
        { difficulty: 5.0, success: false, responseTime: 80, timestamp: new Date(), confidence: 0.5 },
        { difficulty: 5.0, success: false, responseTime: 75, timestamp: new Date(), confidence: 0.5 },
        { difficulty: 5.0, success: true, responseTime: 45, timestamp: new Date(), confidence: 0.5 }
      ]

      // Test with fast learner factor
      const fastLearnerContext: DifficultyContext = {
        currentState,
        recentPerformance,
        learningStyleFactor: 1.2, // Fast learner
        topicAffinity: 1.0,
        sessionLength: 30,
        timeOfDay: 10
      }

      const fastLearnerCalc = engine.calculateNextDifficulty(fastLearnerContext)

      // Test with methodical learner factor
      const methodicalLearnerContext: DifficultyContext = {
        currentState,
        recentPerformance,
        learningStyleFactor: 0.8, // Methodical learner
        topicAffinity: 1.0,
        sessionLength: 30,
        timeOfDay: 10
      }

      const methodicalLearnerCalc = engine.calculateNextDifficulty(methodicalLearnerContext)

      // Fast learners should have more aggressive adjustments
      expect(Math.abs(fastLearnerCalc.nextDifficulty - currentState.difficulty))
        .toBeGreaterThan(Math.abs(methodicalLearnerCalc.nextDifficulty - currentState.difficulty))
    })
  })

  describe('Stability Updates', () => {
    it('should increase stability with consistent performance', () => {
      const currentStability = 50.0
      
      // Consistent performance (all correct)
      const consistentPerformance: PerformancePoint[] = [
        { difficulty: 5.0, success: true, responseTime: 40, timestamp: new Date(), confidence: 0.75 },
        { difficulty: 5.0, success: true, responseTime: 38, timestamp: new Date(), confidence: 0.75 },
        { difficulty: 5.0, success: true, responseTime: 42, timestamp: new Date(), confidence: 0.75 },
        { difficulty: 5.0, success: true, responseTime: 35, timestamp: new Date(), confidence: 0.75 }
      ]

      const updatedStability = engine.updateStabilityScore(currentStability, consistentPerformance)
      expect(updatedStability).toBeGreaterThan(currentStability)
    })

    it('should decrease stability with inconsistent performance', () => {
      const currentStability = 70.0
      
      // Very inconsistent performance (alternating correct/incorrect with larger variance)
      const inconsistentPerformance: PerformancePoint[] = [
        { difficulty: 5.0, success: true, responseTime: 20, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: false, responseTime: 120, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: true, responseTime: 25, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: false, responseTime: 130, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: false, responseTime: 140, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: true, responseTime: 30, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: false, responseTime: 135, timestamp: new Date(), confidence: 0.6 },
        { difficulty: 5.0, success: true, responseTime: 35, timestamp: new Date(), confidence: 0.6 }
      ]

      const updatedStability = engine.updateStabilityScore(currentStability, inconsistentPerformance)
      expect(updatedStability).toBeLessThan(currentStability)
    })

    it('should handle empty performance history', () => {
      const currentStability = 60.0
      const emptyPerformance: PerformancePoint[] = []

      const updatedStability = engine.updateStabilityScore(currentStability, emptyPerformance)
      expect(updatedStability).toBe(currentStability)
    })
  })

  describe('Question Selection', () => {
    it('should select closest available difficulty to target', () => {
      const availableDifficulties = [3.0, 5.0, 7.0, 9.0]
      const targetDifficulty = 6.0
      const confidenceInterval = 1.0

      const selected = engine.selectOptimalQuestionDifficulty(
        availableDifficulties, 
        targetDifficulty, 
        confidenceInterval
      )

      expect(selected).toBe(5.0) // Closest within confidence interval
    })

    it('should prefer exact matches within confidence interval', () => {
      const availableDifficulties = [4.5, 5.0, 5.5, 6.0, 7.0]
      const targetDifficulty = 5.5
      const confidenceInterval = 1.0

      const selected = engine.selectOptimalQuestionDifficulty(
        availableDifficulties, 
        targetDifficulty, 
        confidenceInterval
      )

      expect(selected).toBe(5.5) // Exact match
    })

    it('should fallback to closest when no match within interval', () => {
      const availableDifficulties = [1.0, 2.0, 9.0, 10.0]
      const targetDifficulty = 5.0
      const confidenceInterval = 1.0

      const selected = engine.selectOptimalQuestionDifficulty(
        availableDifficulties, 
        targetDifficulty, 
        confidenceInterval
      )

      // Should pick 2.0 as it's closest overall
      expect(selected).toBe(2.0)
    })
  })

  describe('Performance Predictions', () => {
    it('should predict higher success for easier questions', () => {
      const easyPrediction = engine.predictPerformanceAtDifficulty(3.0, 60.0, 1.0)
      const hardPrediction = engine.predictPerformanceAtDifficulty(8.0, 60.0, 1.0)

      expect(easyPrediction).toBeGreaterThan(hardPrediction)
    })

    it('should account for stability in predictions', () => {
      const lowStabilityPrediction = engine.predictPerformanceAtDifficulty(5.0, 30.0, 1.0)
      const highStabilityPrediction = engine.predictPerformanceAtDifficulty(5.0, 80.0, 1.0)

      expect(highStabilityPrediction).toBeGreaterThan(lowStabilityPrediction)
    })

    it('should account for learning style in predictions', () => {
      const neutralPrediction = engine.predictPerformanceAtDifficulty(5.0, 50.0, 1.0)
      const fastLearnerPrediction = engine.predictPerformanceAtDifficulty(5.0, 50.0, 1.2)

      expect(fastLearnerPrediction).toBeGreaterThan(neutralPrediction)
    })
  })

  describe('State Validation', () => {
    it('should validate correct FSRS states', () => {
      const validState: FSRSState = {
        difficulty: 5.0,
        stability: 60.0,
        confidence: 70.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.6
      }

      expect(engine.validateFSRSState(validState)).toBe(true)
    })

    it('should reject invalid FSRS states', () => {
      const invalidStates = [
        { difficulty: 15.0, stability: 60.0, confidence: 70.0, successRate: 0.75, lastReview: new Date(), retrievability: 0.6 },
        { difficulty: 5.0, stability: 150.0, confidence: 70.0, successRate: 0.75, lastReview: new Date(), retrievability: 0.6 },
        { difficulty: 5.0, stability: 60.0, confidence: 70.0, successRate: 1.5, lastReview: new Date(), retrievability: 0.6 },
        { difficulty: 5.0, stability: 60.0, confidence: 70.0, successRate: 0.75, lastReview: new Date(), retrievability: 1.2 }
      ]

      invalidStates.forEach(state => {
        expect(engine.validateFSRSState(state as FSRSState)).toBe(false)
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty performance data gracefully', () => {
      const currentState: FSRSState = {
        difficulty: 5.0,
        stability: 50.0,
        confidence: 50.0,
        successRate: 0.75,
        lastReview: null,
        retrievability: 0.5
      }

      const context: DifficultyContext = {
        currentState,
        recentPerformance: [],
        learningStyleFactor: 1.0,
        topicAffinity: 1.0,
        sessionLength: 30,
        timeOfDay: 10
      }

      const calculation = engine.calculateNextDifficulty(context)
      
      expect(calculation.nextDifficulty).toBe(currentState.difficulty)
      expect(calculation.confidenceScore).toBeLessThan(50)
    })

    it('should constrain difficulty adjustments to valid ranges', () => {
      // Test extreme high performance that would normally cause huge adjustment
      const currentState: FSRSState = {
        difficulty: 9.5,
        stability: 20.0, // Low stability = large adjustments
        confidence: 30.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.9
      }

      const perfectPerformance: PerformancePoint[] = Array(10).fill(null).map(() => ({
        difficulty: 9.5,
        success: true,
        responseTime: 20,
        timestamp: new Date(),
        confidence: 0.95
      }))

      const context: DifficultyContext = {
        currentState,
        recentPerformance: perfectPerformance,
        learningStyleFactor: 1.3, // Fast learner
        topicAffinity: 1.2, // High affinity
        sessionLength: 30,
        timeOfDay: 10
      }

      const calculation = engine.calculateNextDifficulty(context)
      
      // Should be constrained to maximum difficulty
      expect(calculation.nextDifficulty).toBeLessThanOrEqual(10.0)
    })

    it('should handle confidence interval adjustments correctly', () => {
      const baseInterval = 2.0
      
      // High variance should increase interval
      const highVarianceInterval = engine.adjustConfidenceInterval(baseInterval, 0.8, 5)
      expect(highVarianceInterval).toBeGreaterThan(baseInterval)
      
      // Low variance and more data should decrease interval
      const lowVarianceInterval = engine.adjustConfidenceInterval(baseInterval, 0.1, 20)
      expect(lowVarianceInterval).toBeLessThan(baseInterval)
    })
  })
})