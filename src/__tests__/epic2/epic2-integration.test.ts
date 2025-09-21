/**
 * Epic 2: AI-Powered Personalization Engine - Comprehensive Integration Tests
 *
 * Tests complete integration of all 6 Epic 2 systems:
 * - MELLOWISE-009: AI Learning Style Assessment
 * - MELLOWISE-010: Dynamic Difficulty Adjustment Algorithm
 * - MELLOWISE-012: Smart Performance Insights
 * - MELLOWISE-014: Adaptive Anxiety Management System
 * - MELLOWISE-015: Smart Notification and Reminder System
 * - MELLOWISE-016: Personalized Goal Setting & Progress Tracking
 *
 * @author Epic 2 Integration Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { epic2IntegrationOrchestrator } from '@/lib/epic2/epic2-integration-orchestrator'
import type {
  Epic2UserProfile,
  PersonalizationRecommendations,
  Epic2DashboardData,
  StudySessionContext,
  PersonalizedStudySession
} from '@/lib/epic2/epic2-integration-orchestrator'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/learning-style/profile-service')
jest.mock('@/lib/practice/dynamic-difficulty-service')
jest.mock('@/lib/insights/patternRecognition')
jest.mock('@/lib/anxiety-management/anxiety-management-orchestrator')
jest.mock('@/lib/notifications/notification-service')

describe('Epic 2 Integration Orchestrator', () => {
  const testUserId = 'test-user-123'
  const testTenantId = 'test-tenant-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('System Initialization', () => {
    it('should initialize all Epic 2 systems successfully', async () => {
      const result = await epic2IntegrationOrchestrator.initializeEpic2Systems()

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle partial system failures gracefully', async () => {
      // Mock one system failure
      jest.spyOn(epic2IntegrationOrchestrator as any, 'verifyAnxietyManagementSystem')
        .mockRejectedValueOnce(new Error('System unavailable'))

      const result = await epic2IntegrationOrchestrator.initializeEpic2Systems()

      expect(result.success).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('Anxiety Management'))
    })
  })

  describe('User Profile Integration', () => {
    it('should load comprehensive user profile with all Epic 2 data', async () => {
      // Mock successful data from all systems
      mockAllSystemsData()

      const profile = await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId)

      expect(profile).toMatchObject({
        userId: testUserId,
        tenantId: expect.any(String),
        learningProfile: expect.any(Object),
        learningStyleDimensions: expect.any(Object),
        difficultyPreferences: expect.any(Object),
        currentDifficultyLevels: expect.any(Object),
        performancePatterns: expect.any(Array),
        sessionInsights: expect.any(Array),
        overallInsights: expect.any(Object),
        anxietyProfile: expect.any(Object),
        currentGoals: expect.any(Array),
        goalProgress: expect.any(Array),
        notificationPreferences: expect.any(Object),
        reminderSchedule: expect.any(Array),
        lastUpdated: expect.any(String),
        syncStatus: 'synced'
      })
    })

    it('should cache user profiles to improve performance', async () => {
      mockAllSystemsData()

      // First call
      const profile1 = await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId)
      // Second call (should use cache)
      const profile2 = await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId)

      expect(profile1).toEqual(profile2)
      expect(profile1.lastUpdated).toBe(profile2.lastUpdated)
    })

    it('should handle missing data gracefully', async () => {
      // Mock partial data availability
      mockPartialSystemsData()

      const profile = await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId)

      expect(profile.userId).toBe(testUserId)
      expect(profile.syncStatus).toBe('synced')
      // Should have default/empty values for missing data
      expect(profile.currentGoals).toEqual([])
      expect(profile.performancePatterns).toEqual([])
    })
  })

  describe('Personalization Recommendations', () => {
    let mockUserProfile: Epic2UserProfile

    beforeEach(() => {
      mockUserProfile = createMockUserProfile()
    })

    it('should generate comprehensive personalized recommendations', async () => {
      const recommendations = await epic2IntegrationOrchestrator.generatePersonalizedRecommendations(
        mockUserProfile
      )

      expect(recommendations).toMatchObject({
        nextStudySession: {
          recommendedTopics: expect.any(Array),
          suggestedDifficulty: expect.any(Number),
          estimatedDuration: expect.any(Number),
          anxietyManagement: expect.any(Array)
        },
        learningOptimizations: {
          preferredQuestionTypes: expect.any(Array),
          recommendedPacing: expect.any(Number),
          studyTimeOptimal: expect.objectContaining({
            start: expect.any(String),
            end: expect.any(String)
          }),
          breakFrequency: expect.any(Number)
        },
        motivationalElements: {
          personalizedEncouragement: expect.any(Array),
          achievementOpportunities: expect.any(Array),
          progressCelebrations: expect.any(Array),
          confidenceBuilders: expect.any(Array)
        },
        adaptiveStrategies: {
          difficultyAdjustments: expect.any(Array),
          anxietyInterventions: expect.any(Array),
          goalAdjustments: expect.any(Array),
          studyPlanModifications: expect.any(Array)
        },
        confidence: expect.any(Number),
        generated: expect.any(String)
      })

      expect(recommendations.confidence).toBeGreaterThan(0)
      expect(recommendations.confidence).toBeLessThanOrEqual(1)
    })

    it('should adapt recommendations based on learning style', async () => {
      // Test visual learner
      mockUserProfile.learningStyleDimensions!.information_processing = 'visual'
      const visualRecs = await epic2IntegrationOrchestrator.generatePersonalizedRecommendations(
        mockUserProfile
      )

      // Test analytical learner
      mockUserProfile.learningStyleDimensions!.information_processing = 'analytical'
      const analyticalRecs = await epic2IntegrationOrchestrator.generatePersonalizedRecommendations(
        mockUserProfile
      )

      expect(visualRecs.learningOptimizations.preferredQuestionTypes)
        .not.toEqual(analyticalRecs.learningOptimizations.preferredQuestionTypes)
    })

    it('should adjust recommendations for high anxiety users', async () => {
      mockUserProfile.anxietyProfile.baselineAnxietyLevel = 'high'

      const recommendations = await epic2IntegrationOrchestrator.generatePersonalizedRecommendations(
        mockUserProfile
      )

      expect(recommendations.nextStudySession.estimatedDuration).toBeLessThan(45)
      expect(recommendations.learningOptimizations.breakFrequency).toBeLessThan(30)
      expect(recommendations.nextStudySession.anxietyManagement.length).toBeGreaterThan(0)
    })

    it('should provide context-aware recommendations', async () => {
      const context: Partial<StudySessionContext> = {
        sessionType: 'survival',
        timeAvailable: 20,
        topicFocus: ['logic_games']
      }

      const recommendations = await epic2IntegrationOrchestrator.generatePersonalizedRecommendations(
        mockUserProfile,
        context
      )

      expect(recommendations.nextStudySession.estimatedDuration).toBe(20)
      expect(recommendations.nextStudySession.recommendedTopics).toContain('logic_games')
    })
  })

  describe('Personalized Study Sessions', () => {
    let mockUserProfile: Epic2UserProfile
    let sessionContext: StudySessionContext

    beforeEach(() => {
      mockUserProfile = createMockUserProfile()
      sessionContext = {
        userId: testUserId,
        sessionType: 'practice',
        timeAvailable: 30,
        performanceHistory: []
      }

      // Mock user profile retrieval
      jest.spyOn(epic2IntegrationOrchestrator, 'getEpic2UserProfile')
        .mockResolvedValue(mockUserProfile)
    })

    it('should create personalized study sessions', async () => {
      const session = await epic2IntegrationOrchestrator.createPersonalizedStudySession(
        testUserId,
        sessionContext
      )

      expect(session).toMatchObject({
        sessionId: expect.any(String),
        userId: testUserId,
        configuration: expect.objectContaining({
          targetDifficulty: expect.any(Number),
          adaptiveMode: expect.any(Boolean),
          anxietySupport: expect.any(Boolean),
          goalAlignment: expect.any(Array)
        }),
        adaptations: expect.objectContaining({
          difficultyAdjustments: expect.any(Boolean),
          anxietyInterventions: expect.any(Boolean),
          encouragementMessages: expect.any(Array),
          breakSuggestions: expect.any(Boolean)
        }),
        tracking: expect.objectContaining({
          goalContribution: expect.any(Number),
          expectedInsights: expect.any(Array),
          anxietyMonitoring: expect.any(Boolean),
          performancePattern: expect.any(String)
        }),
        postSession: expect.objectContaining({
          insightsGeneration: expect.any(Boolean),
          goalProgressUpdate: expect.any(Boolean),
          anxietyAssessment: expect.any(Boolean),
          notificationScheduling: expect.any(Boolean),
          difficultyRecalibration: expect.any(Boolean)
        }),
        created: expect.any(String)
      })
    })

    it('should adapt session based on anxiety level', async () => {
      mockUserProfile.anxietyProfile.baselineAnxietyLevel = 'high'

      const session = await epic2IntegrationOrchestrator.createPersonalizedStudySession(
        testUserId,
        sessionContext
      )

      expect(session.adaptations.anxietyInterventions).toBe(true)
      expect(session.adaptations.breakSuggestions).toBe(true)
    })

    it('should align session with user goals', async () => {
      mockUserProfile.currentGoals = [createMockGoal()]

      const session = await epic2IntegrationOrchestrator.createPersonalizedStudySession(
        testUserId,
        sessionContext
      )

      expect(session.configuration.goalAlignment.length).toBeGreaterThan(0)
      expect(session.tracking.goalContribution).toBeGreaterThan(0)
      expect(session.postSession.goalProgressUpdate).toBe(true)
    })
  })

  describe('Dashboard Integration', () => {
    let mockUserProfile: Epic2UserProfile

    beforeEach(() => {
      mockUserProfile = createMockUserProfile()

      // Mock user profile and recommendations
      jest.spyOn(epic2IntegrationOrchestrator, 'getEpic2UserProfile')
        .mockResolvedValue(mockUserProfile)
      jest.spyOn(epic2IntegrationOrchestrator, 'generatePersonalizedRecommendations')
        .mockResolvedValue(createMockRecommendations())
    })

    it('should provide comprehensive dashboard data', async () => {
      const dashboardData = await epic2IntegrationOrchestrator.getEpic2DashboardData(testUserId)

      expect(dashboardData).toMatchObject({
        userProfile: expect.any(Object),
        recommendations: expect.any(Object),
        systemsStatus: expect.objectContaining({
          learningStyle: expect.stringMatching(/active|inactive|error/),
          dynamicDifficulty: expect.stringMatching(/active|inactive|error/),
          performanceInsights: expect.stringMatching(/active|inactive|error/),
          anxietyManagement: expect.stringMatching(/active|inactive|error/),
          goalTracking: expect.stringMatching(/active|inactive|error/),
          notifications: expect.stringMatching(/active|inactive|error/)
        }),
        quickActions: expect.any(Array),
        activeAlerts: expect.any(Array),
        lastSync: expect.any(String)
      })
    })

    it('should generate relevant quick actions', async () => {
      mockUserProfile.anxietyProfile.baselineAnxietyLevel = 'high'
      mockUserProfile.currentGoals = [createMockGoal()]

      const dashboardData = await epic2IntegrationOrchestrator.getEpic2DashboardData(testUserId)

      expect(dashboardData.quickActions.length).toBeGreaterThan(0)
      expect(dashboardData.quickActions.some(action => action.system === 'anxiety_management')).toBe(true)
      expect(dashboardData.quickActions.some(action => action.system === 'goal_tracking')).toBe(true)
    })

    it('should show system alerts when appropriate', async () => {
      mockUserProfile.syncStatus = 'error'

      const dashboardData = await epic2IntegrationOrchestrator.getEpic2DashboardData(testUserId)

      expect(dashboardData.activeAlerts.length).toBeGreaterThan(0)
      expect(dashboardData.activeAlerts.some(alert => alert.type === 'error')).toBe(true)
    })
  })

  describe('Session Completion Processing', () => {
    let mockSession: PersonalizedStudySession

    beforeEach(() => {
      mockSession = createMockPersonalizedSession()

      // Mock session retrieval
      jest.spyOn(epic2IntegrationOrchestrator as any, 'getPersonalizedSession')
        .mockResolvedValue(mockSession)
    })

    it('should process session completion and update all systems', async () => {
      const sessionData = {
        completed: true,
        questionsAnswered: 10,
        accuracy: 0.8,
        anxietyBefore: 'moderate',
        anxietyAfter: 'low'
      }

      const performance = {
        accuracy_percentage: 80,
        streak_count: 5,
        average_time_per_question: 120,
        session_duration: 1800,
        questions_attempted: 10
      }

      const result = await epic2IntegrationOrchestrator.processSessionCompletion(
        mockSession.sessionId,
        sessionData,
        performance
      )

      expect(result.success).toBe(true)
      expect(result.updates.length).toBeGreaterThan(0)
      expect(result.updates).toContain(expect.stringContaining('Performance insights'))
      expect(result.updates).toContain(expect.stringContaining('Difficulty adjustments'))
      expect(result.updates).toContain(expect.stringContaining('Anxiety management'))
    })

    it('should handle session completion errors gracefully', async () => {
      // Mock session not found
      jest.spyOn(epic2IntegrationOrchestrator as any, 'getPersonalizedSession')
        .mockResolvedValue(null)

      const result = await epic2IntegrationOrchestrator.processSessionCompletion(
        'invalid-session-id',
        {},
        {} as any
      )

      expect(result.success).toBe(false)
      expect(result.updates[0]).toContain('Error:')
    })
  })

  describe('Data Synchronization', () => {
    it('should handle data synchronization across all systems', async () => {
      const profile = await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId, true)

      expect(profile.syncStatus).toBe('synced')
      expect(profile.lastUpdated).toBeDefined()
    })

    it('should detect and handle synchronization failures', async () => {
      // Mock system failure during sync
      jest.spyOn(epic2IntegrationOrchestrator as any, 'getPerformanceData')
        .mockRejectedValueOnce(new Error('Database connection failed'))

      await expect(
        epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId, true)
      ).rejects.toThrow('Failed to load user profile')
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle concurrent user requests efficiently', async () => {
      const userIds = Array.from({ length: 10 }, (_, i) => `user-${i}`)

      const promises = userIds.map(userId =>
        epic2IntegrationOrchestrator.getEpic2DashboardData(userId)
      )

      const results = await Promise.allSettled(promises)

      expect(results.every(result => result.status === 'fulfilled')).toBe(true)
    })

    it('should cache expensive operations', async () => {
      const startTime = Date.now()

      // First call
      await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId)

      const firstCallTime = Date.now() - startTime

      // Second call (should be faster due to caching)
      const secondStartTime = Date.now()
      await epic2IntegrationOrchestrator.getEpic2UserProfile(testUserId)
      const secondCallTime = Date.now() - secondStartTime

      expect(secondCallTime).toBeLessThan(firstCallTime)
    })
  })
})

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

function mockAllSystemsData() {
  // Mock successful responses from all Epic 2 systems
  jest.doMock('@/lib/learning-style/profile-service', () => ({
    getCurrentProfile: jest.fn().mockResolvedValue(createMockLearningProfile()),
    getLearningStyleDimensions: jest.fn().mockResolvedValue(createMockLearningStyleDimensions())
  }))

  jest.doMock('@/lib/practice/dynamic-difficulty-service', () => ({
    getUserPreferences: jest.fn().mockResolvedValue(createMockDifficultyPreferences()),
    getCurrentDifficultyLevels: jest.fn().mockResolvedValue(createMockDifficultyLevels())
  }))

  jest.doMock('@/lib/insights/patternRecognition', () => ({
    getUserPatterns: jest.fn().mockResolvedValue(createMockPerformancePatterns()),
    getSessionInsights: jest.fn().mockResolvedValue(createMockSessionInsights()),
    generateInsights: jest.fn().mockResolvedValue(createMockOverallInsights())
  }))

  jest.doMock('@/lib/anxiety-management/anxiety-management-orchestrator', () => ({
    getPersonalizedDashboard: jest.fn().mockResolvedValue(createMockAnxietyDashboard())
  }))

  jest.doMock('@/lib/notifications/notification-service', () => ({
    getNotificationPreferences: jest.fn().mockResolvedValue(createMockNotificationPreferences()),
    getActiveReminders: jest.fn().mockResolvedValue(createMockReminders())
  }))
}

function mockPartialSystemsData() {
  // Mock some systems returning null/empty data
  jest.doMock('@/lib/learning-style/profile-service', () => ({
    getCurrentProfile: jest.fn().mockResolvedValue(null),
    getLearningStyleDimensions: jest.fn().mockResolvedValue(null)
  }))
}

function createMockUserProfile(): Epic2UserProfile {
  return {
    userId: 'test-user-123',
    tenantId: 'test-tenant-123',
    learningProfile: createMockLearningProfile(),
    learningStyleDimensions: createMockLearningStyleDimensions(),
    difficultyPreferences: createMockDifficultyPreferences(),
    currentDifficultyLevels: createMockDifficultyLevels(),
    performancePatterns: createMockPerformancePatterns(),
    sessionInsights: createMockSessionInsights(),
    overallInsights: createMockOverallInsights(),
    anxietyProfile: {
      baselineAnxietyLevel: 'moderate',
      triggers: ['time_pressure', 'difficult_questions'],
      effectiveCopingStrategies: ['breathing_exercises', 'positive_self_talk'],
      confidenceLevel: 'medium'
    },
    currentGoals: [createMockGoal()],
    goalProgress: [],
    studyPlan: undefined,
    achievements: [],
    notificationPreferences: createMockNotificationPreferences(),
    reminderSchedule: createMockReminders(),
    lastUpdated: new Date().toISOString(),
    syncStatus: 'synced'
  }
}

function createMockLearningProfile() {
  return {
    id: 'profile-123',
    user_id: 'test-user-123',
    primary_style: 'analytical_visual',
    confidence_score: 0.85,
    assessment_date: new Date().toISOString()
  }
}

function createMockLearningStyleDimensions() {
  return {
    information_processing: 'visual' as const,
    reasoning_approach: 'analytical' as const,
    pacing: 'deliberate' as const
  }
}

function createMockDifficultyPreferences() {
  return {
    adaptiveMode: true,
    targetSuccessRate: 0.75,
    preferredDifficultyRange: { min: 3, max: 8 }
  }
}

function createMockDifficultyLevels() {
  return {
    logical_reasoning: 6,
    logic_games: 5,
    reading_comprehension: 7
  }
}

function createMockPerformancePatterns() {
  return [
    {
      pattern_type: 'improvement_trend',
      confidence_score: 0.9,
      description: 'Consistent improvement in logical reasoning',
      pattern_data: { topic: 'logical_reasoning', trend: 'positive' }
    }
  ]
}

function createMockSessionInsights() {
  return [
    {
      session_id: 'session-123',
      accuracy_trend: 80,
      time_per_question: 120,
      session_duration: 1800,
      questions_completed: 15,
      streak_data: { current_streak: 5, best_streak: 10 }
    }
  ]
}

function createMockOverallInsights() {
  return {
    overall_accuracy: 0.78,
    improvement_rate: 0.15,
    strong_areas: ['logical_reasoning'],
    weak_areas: ['logic_games'],
    recommendation: 'Focus on logic games practice'
  }
}

function createMockAnxietyDashboard() {
  return {
    anxiety_triggers: ['time_pressure'],
    effective_strategies: ['breathing_exercises'],
    confidence_level: 'medium'
  }
}

function createMockNotificationPreferences() {
  return {
    study_reminders: true,
    achievement_notifications: true,
    performance_updates: false
  }
}

function createMockReminders() {
  return [
    {
      id: 'reminder-123',
      type: 'study_session',
      scheduled_for: new Date().toISOString(),
      message: 'Time for your daily practice session!'
    }
  ]
}

function createMockGoal() {
  return {
    id: 'goal-123',
    user_id: 'test-user-123',
    target_score: 165,
    current_score: 155,
    timeline_weeks: 12,
    section_goals: [
      {
        section: 'logical_reasoning',
        target_score: 25,
        current_score: 22
      }
    ]
  }
}

function createMockRecommendations(): PersonalizationRecommendations {
  return {
    nextStudySession: {
      recommendedTopics: ['logical_reasoning'],
      suggestedDifficulty: 6,
      estimatedDuration: 30,
      anxietyManagement: ['breathing_exercises']
    },
    learningOptimizations: {
      preferredQuestionTypes: ['logical_reasoning'],
      recommendedPacing: 120,
      studyTimeOptimal: { start: '09:00', end: '11:00' },
      breakFrequency: 25
    },
    motivationalElements: {
      personalizedEncouragement: ['Keep up the great work!'],
      achievementOpportunities: ['5-question streak achievement'],
      progressCelebrations: ['Recent improvement in LR'],
      confidenceBuilders: ['Review recent successes']
    },
    adaptiveStrategies: {
      difficultyAdjustments: [],
      anxietyInterventions: [],
      goalAdjustments: [],
      studyPlanModifications: []
    },
    confidence: 0.85,
    generated: new Date().toISOString()
  }
}

function createMockPersonalizedSession(): PersonalizedStudySession {
  return {
    sessionId: 'session-123',
    userId: 'test-user-123',
    configuration: {
      questions: [],
      targetDifficulty: 6,
      adaptiveMode: true,
      anxietySupport: true,
      goalAlignment: ['goal-123']
    },
    adaptations: {
      difficultyAdjustments: true,
      anxietyInterventions: true,
      encouragementMessages: ['Great progress!'],
      breakSuggestions: false
    },
    tracking: {
      goalContribution: 0.1,
      expectedInsights: ['Performance pattern analysis'],
      anxietyMonitoring: true,
      performancePattern: 'improvement_trend'
    },
    postSession: {
      insightsGeneration: true,
      goalProgressUpdate: true,
      anxietyAssessment: true,
      notificationScheduling: true,
      difficultyRecalibration: true
    },
    created: new Date().toISOString()
  }
}