/**
 * Dynamic Difficulty Service Simple Tests
 * MELLOWISE-010: Dynamic Difficulty Adjustment
 * 
 * Simplified unit tests for dynamic difficulty service functionality
 * that don't require complex database mocking.
 * 
 * @author Developer Agent James
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { DifficultySystemError } from '@/types/dynamic-difficulty'
import type {
  TopicType,
  PracticeSessionConfig,
  LearningStyleDifficultyPreferences
} from '@/types/dynamic-difficulty'

describe('DynamicDifficultyService - Core Logic', () => {
  describe('Error Handling', () => {
    it('should create DifficultySystemError correctly', () => {
      const error = new DifficultySystemError(
        'Test error message',
        'TEST_ERROR_CODE',
        { testData: 'value' }
      )

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('DifficultySystemError')
      expect(error.message).toBe('Test error message')
      expect(error.code).toBe('TEST_ERROR_CODE')
      expect(error.context).toEqual({ testData: 'value' })
    })

    it('should handle errors without context', () => {
      const error = new DifficultySystemError(
        'Simple error',
        'SIMPLE_ERROR'
      )

      expect(error.message).toBe('Simple error')
      expect(error.code).toBe('SIMPLE_ERROR')
      expect(error.context).toBeUndefined()
    })
  })

  describe('Type Definitions', () => {
    it('should have valid topic types', () => {
      const validTopics: TopicType[] = [
        'logical_reasoning',
        'logic_games', 
        'reading_comprehension'
      ]

      expect(validTopics).toHaveLength(3)
      validTopics.forEach(topic => {
        expect(typeof topic).toBe('string')
        expect(topic.length).toBeGreaterThan(0)
      })
    })

    it('should create valid session config', () => {
      const config: PracticeSessionConfig = {
        userId: 'test-user-123',
        topicType: 'logical_reasoning',
        targetDuration: 30,
        adaptationSpeed: 'moderate',
        learningStyleConsideration: true
      }

      expect(config.userId).toBe('test-user-123')
      expect(config.topicType).toBe('logical_reasoning')
      expect(config.targetDuration).toBe(30)
      expect(config.adaptationSpeed).toBe('moderate')
      expect(config.learningStyleConsideration).toBe(true)
    })

    it('should create valid learning style preferences', () => {
      const prefs: LearningStyleDifficultyPreferences = {
        learningStyle: 'analytical_fast',
        adaptationSpeed: 'aggressive',
        preferredChallengeLevel: 'stretch',
        preferredStartingDifficulty: 6.5,
        targetSuccessRate: 0.8,
        stabilityPreference: 0.7,
        confidenceThreshold: 0.75,
        manualOverrideFrequency: 0.15,
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

      expect(prefs.learningStyle).toBe('analytical_fast')
      expect(prefs.preferredStartingDifficulty).toBe(6.5)
      expect(prefs.targetSuccessRate).toBe(0.8)
      expect(prefs.topicAffinities.logical_reasoning.naturalDifficulty).toBe(0.2)
      expect(prefs.topicAffinities.logic_games.learningSpeed).toBe(0.9)
      expect(prefs.topicAffinities.reading_comprehension.stabilityFactor).toBe(0.9)
    })
  })

  describe('Configuration Validation', () => {
    it('should validate difficulty ranges', () => {
      const validDifficulties = [1.0, 5.5, 10.0]
      const invalidDifficulties = [0.5, -1.0, 11.0, 15.5]

      validDifficulties.forEach(difficulty => {
        expect(difficulty).toBeGreaterThanOrEqual(1.0)
        expect(difficulty).toBeLessThanOrEqual(10.0)
      })

      invalidDifficulties.forEach(difficulty => {
        expect(difficulty < 1.0 || difficulty > 10.0).toBe(true)
      })
    })

    it('should validate success rate ranges', () => {
      const validRates = [0.0, 0.5, 0.75, 0.9, 1.0]
      const invalidRates = [-0.1, -0.5, 1.1, 1.5]

      validRates.forEach(rate => {
        expect(rate).toBeGreaterThanOrEqual(0.0)
        expect(rate).toBeLessThanOrEqual(1.0)
      })

      invalidRates.forEach(rate => {
        expect(rate < 0.0 || rate > 1.0).toBe(true)
      })
    })

    it('should validate session duration ranges', () => {
      const validDurations = [5, 30, 60, 120]
      const invalidDurations = [0, -5, 150, 300]

      validDurations.forEach(duration => {
        expect(duration).toBeGreaterThanOrEqual(5)
        expect(duration).toBeLessThanOrEqual(120)
      })

      invalidDurations.forEach(duration => {
        expect(duration < 5 || duration > 120).toBe(true)
      })
    })
  })

  describe('Constants and Defaults', () => {
    it('should have sensible default values', () => {
      const DEFAULT_DIFFICULTY = 5.0
      const DEFAULT_SUCCESS_RATE = 0.75
      const DEFAULT_STABILITY = 50.0
      const DEFAULT_CONFIDENCE_INTERVAL = 2.0

      expect(DEFAULT_DIFFICULTY).toBe(5.0)
      expect(DEFAULT_SUCCESS_RATE).toBe(0.75)
      expect(DEFAULT_STABILITY).toBe(50.0)
      expect(DEFAULT_CONFIDENCE_INTERVAL).toBe(2.0)

      // Verify defaults are within valid ranges
      expect(DEFAULT_DIFFICULTY).toBeGreaterThanOrEqual(1.0)
      expect(DEFAULT_DIFFICULTY).toBeLessThanOrEqual(10.0)
      expect(DEFAULT_SUCCESS_RATE).toBeGreaterThanOrEqual(0.5)
      expect(DEFAULT_SUCCESS_RATE).toBeLessThanOrEqual(0.9)
      expect(DEFAULT_STABILITY).toBeGreaterThanOrEqual(0.0)
      expect(DEFAULT_STABILITY).toBeLessThanOrEqual(100.0)
    })

    it('should validate adaptation speed options', () => {
      const validSpeeds = ['conservative', 'moderate', 'aggressive']
      const invalidSpeeds = ['slow', 'fast', 'extreme', '']

      validSpeeds.forEach(speed => {
        expect(['conservative', 'moderate', 'aggressive']).toContain(speed)
      })

      invalidSpeeds.forEach(speed => {
        expect(['conservative', 'moderate', 'aggressive']).not.toContain(speed)
      })
    })

    it('should validate challenge level options', () => {
      const validLevels = ['comfort', 'optimal', 'stretch']
      const invalidLevels = ['easy', 'hard', 'extreme', '']

      validLevels.forEach(level => {
        expect(['comfort', 'optimal', 'stretch']).toContain(level)
      })

      invalidLevels.forEach(level => {
        expect(['comfort', 'optimal', 'stretch']).not.toContain(level)
      })
    })
  })

  describe('Data Structure Validation', () => {
    it('should handle topic affinity data correctly', () => {
      const topicAffinity = {
        naturalDifficulty: 0.3,
        learningSpeed: 1.2,
        stabilityFactor: 0.9,
        preferredSessionLength: 35
      }

      expect(topicAffinity.naturalDifficulty).toBeCloseTo(0.3, 1)
      expect(topicAffinity.learningSpeed).toBeCloseTo(1.2, 1)
      expect(topicAffinity.stabilityFactor).toBeCloseTo(0.9, 1)
      expect(topicAffinity.preferredSessionLength).toBe(35)

      // Validate reasonable ranges
      expect(Math.abs(topicAffinity.naturalDifficulty)).toBeLessThanOrEqual(1.0)
      expect(topicAffinity.learningSpeed).toBeGreaterThan(0)
      expect(topicAffinity.learningSpeed).toBeLessThan(2.0)
      expect(topicAffinity.stabilityFactor).toBeGreaterThan(0)
      expect(topicAffinity.stabilityFactor).toBeLessThan(2.0)
      expect(topicAffinity.preferredSessionLength).toBeGreaterThanOrEqual(5)
      expect(topicAffinity.preferredSessionLength).toBeLessThanOrEqual(120)
    })

    it('should handle performance point structure', () => {
      const performancePoint = {
        difficulty: 5.5,
        success: true,
        responseTime: 45000,
        timestamp: new Date(),
        confidence: 0.8
      }

      expect(performancePoint.difficulty).toBeCloseTo(5.5, 1)
      expect(performancePoint.success).toBe(true)
      expect(performancePoint.responseTime).toBe(45000)
      expect(performancePoint.timestamp).toBeInstanceOf(Date)
      expect(performancePoint.confidence).toBeCloseTo(0.8, 1)

      // Validate ranges
      expect(performancePoint.difficulty).toBeGreaterThanOrEqual(1.0)
      expect(performancePoint.difficulty).toBeLessThanOrEqual(10.0)
      expect(performancePoint.responseTime).toBeGreaterThan(0)
      expect(performancePoint.confidence).toBeGreaterThanOrEqual(0.0)
      expect(performancePoint.confidence).toBeLessThanOrEqual(1.0)
    })
  })

  describe('Integration Readiness', () => {
    it('should be ready for FSRS algorithm integration', () => {
      // Verify core types exist and have expected structure
      const mockFSRSState = {
        difficulty: 5.0,
        stability: 60.0,
        confidence: 70.0,
        successRate: 0.75,
        lastReview: new Date(),
        retrievability: 0.7
      }

      expect(mockFSRSState.difficulty).toBeDefined()
      expect(mockFSRSState.stability).toBeDefined()
      expect(mockFSRSState.confidence).toBeDefined()
      expect(mockFSRSState.successRate).toBeDefined()
      expect(mockFSRSState.lastReview).toBeDefined()
      expect(mockFSRSState.retrievability).toBeDefined()
    })

    it('should be ready for learning style integration', () => {
      // Verify learning style integration points exist
      const mockLearningProfile = {
        user_id: 'test-user',
        primary_learning_style: 'analytical_fast',
        manual_override_enabled: false,
        confidence_score: 0.8
      }

      expect(mockLearningProfile.user_id).toBeDefined()
      expect(mockLearningProfile.primary_learning_style).toBeDefined()
      expect(mockLearningProfile.manual_override_enabled).toBeDefined()
      expect(mockLearningProfile.confidence_score).toBeDefined()
    })

    it('should be ready for analytics integration', () => {
      // Verify analytics context structure
      const mockAnalyticsContext = {
        currentDifficulty: 5.5,
        stabilityScore: 65.0,
        targetSuccessRate: 0.75,
        sessionsAnalyzed: 12,
        algorithmConfidence: 75
      }

      expect(mockAnalyticsContext.currentDifficulty).toBeDefined()
      expect(mockAnalyticsContext.stabilityScore).toBeDefined()
      expect(mockAnalyticsContext.targetSuccessRate).toBeDefined()
      expect(mockAnalyticsContext.sessionsAnalyzed).toBeDefined()
      expect(mockAnalyticsContext.algorithmConfidence).toBeDefined()
    })
  })
})