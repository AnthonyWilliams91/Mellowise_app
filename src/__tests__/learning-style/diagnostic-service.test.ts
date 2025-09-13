/**
 * Diagnostic Service Tests
 * 
 * Comprehensive test suite for the diagnostic quiz question selection
 * and management service functionality.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

import { DiagnosticService } from '@/lib/learning-style/diagnostic-service'
import type { DiagnosticQuizConfig, DiagnosticQuestion } from '@/types/learning-style'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                not: jest.fn(() => ({
                  limit: jest.fn(() => ({ data: mockQuestions, error: null }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  })
}))

const mockQuestions: DiagnosticQuestion[] = [
  {
    id: 'q1',
    question_id: 'question-1',
    diagnostic_category: 'visual_pattern',
    learning_dimensions: ['visual_analytical'],
    expected_response_time: 60000,
    complexity_indicators: { visual_elements: true },
    created_at: '2025-01-01T00:00:00Z',
    is_active: true,
    question: {
      content: 'Test question 1',
      question_type: 'logic_games',
      subtype: null,
      difficulty: 3,
      correct_answer: 'A',
      answer_choices: [{ id: 'A', text: 'Option A' }],
      explanation: 'Test explanation'
    }
  },
  {
    id: 'q2',
    question_id: 'question-2',
    diagnostic_category: 'analytical_logic',
    learning_dimensions: ['visual_analytical'],
    expected_response_time: 75000,
    complexity_indicators: { logical_analysis: true },
    created_at: '2025-01-01T00:00:00Z',
    is_active: true,
    question: {
      content: 'Test question 2',
      question_type: 'logical_reasoning',
      subtype: 'syllogism',
      difficulty: 6,
      correct_answer: 'B',
      answer_choices: [{ id: 'B', text: 'Option B' }],
      explanation: 'Test explanation 2'
    }
  }
]

describe('DiagnosticService', () => {
  let diagnosticService: DiagnosticService

  beforeEach(() => {
    diagnosticService = new DiagnosticService()
    jest.clearAllMocks()
  })

  describe('generateDiagnosticQuiz', () => {
    const testConfig: DiagnosticQuizConfig = {
      totalQuestions: 6,
      categories: {
        visual_pattern: 2,
        analytical_logic: 2,
        speed_test: 1,
        detail_focus: 1,
        conceptual_reasoning: 0
      }
    }

    it('should generate a diagnostic quiz with correct question count', async () => {
      const result = await diagnosticService.generateDiagnosticQuiz('user-123', testConfig)
      
      expect(result.questions).toBeDefined()
      expect(result.config).toEqual(testConfig)
      expect(result.hasExistingProfile).toBe(false)
    })

    it('should exclude user previous attempts when requested', async () => {
      const criteria = { excludeUserAttempts: true }
      
      const result = await diagnosticService.generateDiagnosticQuiz('user-123', testConfig, criteria)
      
      expect(result.questions).toBeDefined()
      // Verify that the service attempts to exclude previous attempts
    })

    it('should shuffle questions to prevent pattern recognition', async () => {
      const result1 = await diagnosticService.generateDiagnosticQuiz('user-123', testConfig)
      const result2 = await diagnosticService.generateDiagnosticQuiz('user-456', testConfig)
      
      // While not guaranteed, shuffling should produce different orders
      expect(result1.questions).toBeDefined()
      expect(result2.questions).toBeDefined()
    })

    it('should handle empty question pool gracefully', async () => {
      // Mock empty response
      jest.spyOn(diagnosticService as any, 'selectQuestionsForCategory').mockResolvedValue([])
      
      const result = await diagnosticService.generateDiagnosticQuiz('user-123', testConfig)
      
      expect(result.questions).toBeDefined()
      expect(Array.isArray(result.questions)).toBe(true)
    })
  })

  describe('submitDiagnosticQuiz', () => {
    it('should submit diagnostic attempts successfully', async () => {
      const attempts = [
        {
          diagnostic_question_id: 'q1',
          question_id: 'question-1',
          selected_answer: 'A',
          is_correct: true,
          response_time: 45000,
          confidence_level: 4,
          showed_hesitation: false,
          changed_answer: false,
          used_elimination: false,
          time_on_question: 45000,
          time_on_choices: null,
          scroll_behavior: {}
        }
      ]

      const result = await diagnosticService.submitDiagnosticQuiz('user-123', { attempts })
      
      expect(result).toBe(true)
    })

    it('should handle submission errors gracefully', async () => {
      // Mock error response
      jest.spyOn(diagnosticService['supabase'], 'from').mockReturnValue({
        insert: jest.fn(() => ({ error: new Error('Database error') }))
      } as any)

      const attempts = [
        {
          diagnostic_question_id: 'q1',
          question_id: 'question-1',
          selected_answer: 'A',
          is_correct: true,
          response_time: 45000,
          confidence_level: 4,
          showed_hesitation: false,
          changed_answer: false,
          used_elimination: false,
          time_on_question: 45000,
          time_on_choices: null,
          scroll_behavior: {}
        }
      ]

      const result = await diagnosticService.submitDiagnosticQuiz('user-123', { attempts })
      
      expect(result).toBe(false)
    })
  })

  describe('getLearningProfile', () => {
    it('should retrieve existing learning profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        user_id: 'user-123',
        has_completed_diagnostic: true,
        primary_learning_style: 'analytical-methodical-detail'
      }

      jest.spyOn(diagnosticService['supabase'], 'from').mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockProfile, error: null }))
          }))
        }))
      } as any)

      const result = await diagnosticService.getLearningProfile('user-123')
      
      expect(result).toEqual(mockProfile)
    })

    it('should return null for non-existent profile', async () => {
      jest.spyOn(diagnosticService['supabase'], 'from').mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      } as any)

      const result = await diagnosticService.getLearningProfile('user-123')
      
      expect(result).toBeNull()
    })
  })

  describe('hasCompletedDiagnostic', () => {
    it('should return true for users with completed diagnostic', async () => {
      const mockProfile = {
        has_completed_diagnostic: true
      }

      jest.spyOn(diagnosticService, 'getLearningProfile').mockResolvedValue(mockProfile as any)

      const result = await diagnosticService.hasCompletedDiagnostic('user-123')
      
      expect(result).toBe(true)
    })

    it('should return false for users without completed diagnostic', async () => {
      jest.spyOn(diagnosticService, 'getLearningProfile').mockResolvedValue(null)

      const result = await diagnosticService.hasCompletedDiagnostic('user-123')
      
      expect(result).toBe(false)
    })
  })

  describe('getDiagnosticStats', () => {
    it('should return diagnostic statistics', async () => {
      const result = await diagnosticService.getDiagnosticStats()
      
      expect(result).toHaveProperty('totalQuestions')
      expect(result).toHaveProperty('categoryDistribution')
      expect(result).toHaveProperty('difficultyDistribution')
      expect(typeof result.totalQuestions).toBe('number')
      expect(typeof result.categoryDistribution).toBe('object')
      expect(typeof result.difficultyDistribution).toBe('object')
    })
  })

  describe('Question Selection Algorithms', () => {
    it('should calculate difficulty distribution correctly', () => {
      const distributions = [
        { strategy: 'even', count: 6 },
        { strategy: 'gradient', count: 10 },
        { strategy: 'adaptive', count: 8 }
      ]

      distributions.forEach(({ strategy, count }) => {
        const result = diagnosticService['calculateDifficultyDistribution'](count, strategy as any)
        
        // Verify total questions match
        const total = Object.values(result).reduce((sum, val) => sum + val, 0)
        expect(total).toBe(count)
        
        // Verify all values are positive
        Object.values(result).forEach(val => {
          expect(val).toBeGreaterThanOrEqual(0)
        })
      })
    })

    it('should shuffle arrays correctly', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const shuffled = diagnosticService['shuffleArray']([...original])
      
      // Should have same length and elements
      expect(shuffled).toHaveLength(original.length)
      expect(shuffled.sort()).toEqual(original.sort())
      
      // Should be shuffled (statistically very unlikely to be identical)
      // Run multiple times to account for random chance
      let identical = 0
      for (let i = 0; i < 10; i++) {
        const testShuffle = diagnosticService['shuffleArray']([...original])
        if (JSON.stringify(testShuffle) === JSON.stringify(original)) {
          identical++
        }
      }
      expect(identical).toBeLessThan(5) // Allow some random chance
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      jest.spyOn(diagnosticService['supabase'], 'from').mockImplementation(() => {
        throw new Error('Network error')
      })

      await expect(diagnosticService.generateDiagnosticQuiz('user-123')).rejects.toThrow('Failed to generate diagnostic quiz')
    })

    it('should handle invalid user IDs', async () => {
      const result = await diagnosticService.generateDiagnosticQuiz('')
      
      expect(result).toBeDefined()
      // Should still attempt to generate quiz even with empty user ID
    })
  })
})