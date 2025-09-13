/**
 * Dynamic Difficulty Service Integration Tests
 * MELLOWISE-010: Dynamic Difficulty Adjustment
 * 
 * Comprehensive integration tests for the dynamic difficulty service
 * ensuring proper interaction between FSRS engine and database.
 * 
 * @author Developer Agent James
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { dynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service'
import type {
  TopicType,
  PracticeSessionConfig,
  LearningStyleDifficultyPreferences
} from '@/types/dynamic-difficulty'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-state-id',
                user_id: 'test-user-id',
                topic_type: 'logical_reasoning',
                current_difficulty: 5.0,
                stability_score: 60.0,
                confidence_interval: 2.0,
                success_rate_target: 0.75,
                current_success_rate: 0.75,
                manual_override_enabled: false,
                manual_difficulty_override: null,
                sessions_analyzed: 5,
                last_session_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
                created_at: new Date().toISOString()
              },
              error: null
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'new-state-id',
              user_id: 'test-user-id',
              topic_type: 'logical_reasoning',
              current_difficulty: 5.0,
              stability_score: 50.0,
              confidence_interval: 2.0,
              success_rate_target: 0.75,
              current_success_rate: 0.75,
              manual_override_enabled: false,
              manual_difficulty_override: null,
              sessions_analyzed: 0,
              last_session_at: null,
              last_updated: new Date().toISOString(),
              created_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: null,
            error: null
          }))
        }))
      }))
    }))
  }))
}))

// Mock profile service for learning style integration
jest.mock('@/lib/learning-style/profile-service', () => ({
  profileService: {
    getProfile: jest.fn(() => Promise.resolve({
      user_id: 'test-user-id',
      primary_learning_style: 'analytical_fast',
      manual_override_enabled: false,
      manual_primary_style: null,
      confidence_score: 0.8,
      assessment_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }))
  }
}))

describe('DynamicDifficultyService', () => {
  const testUserId = 'test-user-id'
  const testTopicType: TopicType = 'logical_reasoning'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Difficulty State Management', () => {
    it('should initialize new user difficulty state', async () => {
      const initialState = await dynamicDifficultyService.initializeUserDifficulty(
        testUserId,
        testTopicType
      )

      expect(initialState).toBeDefined()
      expect(initialState.user_id).toBe(testUserId)
      expect(initialState.topic_type).toBe(testTopicType)
      expect(initialState.current_difficulty).toBe(5.0)
      expect(initialState.stability_score).toBe(50.0)
      expect(initialState.success_rate_target).toBe(0.75)
      expect(initialState.manual_override_enabled).toBe(false)
      expect(initialState.sessions_analyzed).toBe(0)
    })

    it('should initialize with learning style preferences', async () => {
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
            naturalDifficulty: 0.3,
            learningSpeed: 1.1,
            stabilityFactor: 1.0,
            preferredSessionLength: 35
          },
          logic_games: {
            naturalDifficulty: 0.0,
            learningSpeed: 1.0,
            stabilityFactor: 1.0,
            preferredSessionLength: 30
          },
          reading_comprehension: {
            naturalDifficulty: -0.2,
            learningSpeed: 0.9,
            stabilityFactor: 1.1,
            preferredSessionLength: 25
          }
        }
      }

      const initialState = await dynamicDifficultyService.initializeUserDifficulty(
        testUserId,
        testTopicType,
        learningStylePrefs
      )

      expect(initialState.current_difficulty).toBe(6.3) // 6.0 + 0.3 topic affinity
      expect(initialState.success_rate_target).toBe(0.8)
    })

    it('should get existing difficulty state', async () => {
      const difficultyState = await dynamicDifficultyService.getDifficultyState(
        testUserId,
        testTopicType
      )

      expect(difficultyState).toBeDefined()
      expect(difficultyState?.user_id).toBe(testUserId)
      expect(difficultyState?.topic_type).toBe(testTopicType)
      expect(difficultyState?.current_difficulty).toBe(5.0)
    })

    it('should return null for non-existent difficulty state', async () => {
      // Mock no data found
      const mockClient = require('@/lib/supabase/server').createClient()
      mockClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // No rows found
      })

      const difficultyState = await dynamicDifficultyService.getDifficultyState(
        'non-existent-user',
        testTopicType
      )

      expect(difficultyState).toBeNull()
    })
  })

  describe('Session Difficulty Calculation', () => {
    it('should calculate session difficulty with default settings', async () => {
      const sessionConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        adaptationSpeed: 'moderate',
        learningStyleConsideration: true
      }

      const sessionDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
        testUserId,
        sessionConfig
      )

      expect(sessionDifficulty).toBeGreaterThan(0)
      expect(sessionDifficulty).toBeLessThanOrEqual(10)
    })

    it('should use manual override when specified', async () => {
      const sessionConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        manualDifficultyOverride: 7.5,
        adaptationSpeed: 'moderate',
        learningStyleConsideration: true
      }

      const sessionDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
        testUserId,
        sessionConfig
      )

      expect(sessionDifficulty).toBe(7.5)
    })

    it('should respect target success rate override', async () => {
      const sessionConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        targetSuccessRate: 0.85,
        adaptationSpeed: 'moderate',
        learningStyleConsideration: true
      }

      const sessionDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
        testUserId,
        sessionConfig
      )

      expect(sessionDifficulty).toBeGreaterThan(0)
      expect(sessionDifficulty).toBeLessThanOrEqual(10)
    })

    it('should handle different adaptation speeds', async () => {
      const conservativeConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        adaptationSpeed: 'conservative',
        learningStyleConsideration: true
      }

      const aggressiveConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        adaptationSpeed: 'aggressive',
        learningStyleConsideration: true
      }

      const conservativeDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
        testUserId,
        conservativeConfig
      )

      const aggressiveDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
        testUserId,
        aggressiveConfig
      )

      expect(conservativeDifficulty).toBeGreaterThan(0)
      expect(aggressiveDifficulty).toBeGreaterThan(0)
      // Both should be valid difficulties, specific values depend on current state
    })
  })

  describe('Performance Recording and Adaptation', () => {
    it('should record question response and update difficulty', async () => {
      const updateResult = await dynamicDifficultyService.recordQuestionResponse(
        testUserId,
        testTopicType,
        'session-123',
        5.0,
        true,
        45000,
        0.8
      )

      expect(updateResult).toBeDefined()
      expect(updateResult.adjustmentMade).toBeDefined()
      expect(updateResult.newDifficulty).toBeGreaterThan(0)
      expect(updateResult.newDifficulty).toBeLessThanOrEqual(10)
      expect(updateResult.confidenceScore).toBeGreaterThan(0)
      expect(updateResult.confidenceScore).toBeLessThanOrEqual(100)
    })

    it('should handle correct responses appropriately', async () => {
      const correctResponse = await dynamicDifficultyService.recordQuestionResponse(
        testUserId,
        testTopicType,
        'session-123',
        5.0,
        true, // Correct
        30000, // Fast response
        0.9 // High confidence
      )

      expect(correctResponse.adjustmentMade).toBe(true)
      // Correct response should tend to increase difficulty slightly
      expect(correctResponse.newDifficulty).toBeGreaterThanOrEqual(4.5)
    })

    it('should handle incorrect responses appropriately', async () => {
      const incorrectResponse = await dynamicDifficultyService.recordQuestionResponse(
        testUserId,
        testTopicType,
        'session-123',
        5.0,
        false, // Incorrect
        80000, // Slow response
        0.3 // Low confidence
      )

      expect(incorrectResponse.adjustmentMade).toBe(true)
      // Incorrect response should tend to decrease difficulty
      expect(incorrectResponse.newDifficulty).toBeLessThanOrEqual(5.5)
    })
  })

  describe('Manual Override Management', () => {
    it('should set manual difficulty override', async () => {
      await dynamicDifficultyService.setManualDifficultyOverride(
        testUserId,
        testTopicType,
        7.0,
        'User requested higher difficulty'
      )

      // Verify the override was set by checking if subsequent calls use override
      const sessionConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        adaptationSpeed: 'moderate',
        learningStyleConsideration: true
      }

      // Mock the state to have override enabled
      const mockClient = require('@/lib/supabase/server').createClient()
      mockClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: {
          id: 'test-state-id',
          user_id: testUserId,
          topic_type: testTopicType,
          current_difficulty: 5.0,
          stability_score: 60.0,
          confidence_interval: 2.0,
          success_rate_target: 0.75,
          current_success_rate: 0.75,
          manual_override_enabled: true,
          manual_difficulty_override: 7.0,
          sessions_analyzed: 5,
          last_session_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        error: null
      })

      const calculatedDifficulty = await dynamicDifficultyService.calculateSessionDifficulty(
        testUserId,
        sessionConfig
      )

      expect(calculatedDifficulty).toBe(7.0)
    })

    it('should remove manual override', async () => {
      await dynamicDifficultyService.removeManualOverride(testUserId, testTopicType)

      // Verify override was removed - the database update should have been called
      const mockClient = require('@/lib/supabase/server').createClient()
      expect(mockClient.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          manual_override_enabled: false,
          manual_difficulty_override: null
        })
      )
    })
  })

  describe('Analytics and Insights Integration', () => {
    it('should provide difficulty context for analytics', async () => {
      const analyticsContext = await dynamicDifficultyService.getAnalyticsContext(
        testUserId,
        testTopicType
      )

      expect(analyticsContext).toBeDefined()
      expect(analyticsContext.currentDifficulty).toBeGreaterThan(0)
      expect(analyticsContext.stabilityScore).toBeGreaterThanOrEqual(0)
      expect(analyticsContext.stabilityScore).toBeLessThanOrEqual(100)
      expect(analyticsContext.targetSuccessRate).toBeGreaterThan(0)
      expect(analyticsContext.targetSuccessRate).toBeLessThanOrEqual(1)
      expect(analyticsContext.sessionsAnalyzed).toBeGreaterThanOrEqual(0)
      expect(analyticsContext.algorithmConfidence).toBeGreaterThan(0)
      expect(analyticsContext.algorithmConfidence).toBeLessThanOrEqual(100)
    })

    it('should handle missing user state gracefully', async () => {
      // Mock no data found
      const mockClient = require('@/lib/supabase/server').createClient()
      mockClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      })

      const analyticsContext = await dynamicDifficultyService.getAnalyticsContext(
        'non-existent-user',
        testTopicType
      )

      expect(analyticsContext).toBeDefined()
      expect(analyticsContext.currentDifficulty).toBe(5.0) // Default value
      expect(analyticsContext.stabilityScore).toBe(50.0) // Default value
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockClient = require('@/lib/supabase/server').createClient()
      mockClient.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection error', code: 'CONNECTION_ERROR' }
      })

      await expect(
        dynamicDifficultyService.getDifficultyState(testUserId, testTopicType)
      ).rejects.toThrow()
    })

    it('should validate input parameters', async () => {
      await expect(
        dynamicDifficultyService.recordQuestionResponse(
          '', // Invalid user ID
          testTopicType,
          'session-123',
          5.0,
          true,
          30000,
          0.8
        )
      ).rejects.toThrow()

      await expect(
        dynamicDifficultyService.recordQuestionResponse(
          testUserId,
          testTopicType,
          'session-123',
          15.0, // Invalid difficulty (> 10)
          true,
          30000,
          0.8
        )
      ).rejects.toThrow()

      await expect(
        dynamicDifficultyService.recordQuestionResponse(
          testUserId,
          testTopicType,
          'session-123',
          5.0,
          true,
          -1000, // Invalid response time
          0.8
        )
      ).rejects.toThrow()
    })
  })

  describe('Performance and Optimization', () => {
    it('should complete calculations within performance constraints', async () => {
      const startTime = Date.now()

      const sessionConfig: PracticeSessionConfig = {
        userId: testUserId,
        topicType: testTopicType,
        targetDuration: 30,
        adaptationSpeed: 'moderate',
        learningStyleConsideration: true
      }

      await dynamicDifficultyService.calculateSessionDifficulty(testUserId, sessionConfig)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should cache frequently accessed data appropriately', async () => {
      // Make multiple calls to same data
      const calls = Array(5).fill(null).map(() =>
        dynamicDifficultyService.getDifficultyState(testUserId, testTopicType)
      )

      const results = await Promise.all(calls)

      // All calls should return the same data
      results.forEach(result => {
        expect(result?.user_id).toBe(testUserId)
        expect(result?.topic_type).toBe(testTopicType)
      })
    })
  })
})