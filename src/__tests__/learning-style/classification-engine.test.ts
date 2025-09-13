/**
 * Classification Engine Tests
 * 
 * Test suite for learning style classification algorithms and
 * behavioral pattern analysis functionality.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

import { LearningStyleClassificationEngine } from '@/lib/learning-style/classification-engine'
import type { DiagnosticAttempt, LearningStyleAnalysis } from '@/types/learning-style'

describe('LearningStyleClassificationEngine', () => {
  let engine: LearningStyleClassificationEngine

  const mockQuestionMetadata = [
    {
      id: 'q1',
      category: 'visual_pattern',
      difficulty: 3,
      hasVisualElements: true,
      requiresDetailFocus: false,
      isConceptual: false,
      expectedResponseTime: 45000
    },
    {
      id: 'q2',
      category: 'analytical_logic',
      difficulty: 6,
      hasVisualElements: false,
      requiresDetailFocus: false,
      isConceptual: true,
      expectedResponseTime: 75000
    },
    {
      id: 'q3',
      category: 'detail_focus',
      difficulty: 4,
      hasVisualElements: false,
      requiresDetailFocus: true,
      isConceptual: false,
      expectedResponseTime: 90000
    }
  ]

  const createMockAttempt = (overrides: Partial<DiagnosticAttempt> = {}): DiagnosticAttempt => ({
    id: 'attempt-1',
    user_id: 'user-123',
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
    time_on_choices: 25000,
    scroll_behavior: {},
    attempted_at: '2025-01-01T00:00:00Z',
    ...overrides
  })

  beforeEach(() => {
    engine = new LearningStyleClassificationEngine()
  })

  describe('classifyLearningStyle', () => {
    it('should classify learning style with sufficient data', () => {
      const attempts = [
        createMockAttempt({ diagnostic_question_id: 'q1', is_correct: true, response_time: 30000 }),
        createMockAttempt({ diagnostic_question_id: 'q2', is_correct: true, response_time: 60000 }),
        createMockAttempt({ diagnostic_question_id: 'q3', is_correct: false, response_time: 120000 }),
        createMockAttempt({ diagnostic_question_id: 'q1', is_correct: true, response_time: 35000, confidence_level: 5 }),
        createMockAttempt({ diagnostic_question_id: 'q2', is_correct: true, response_time: 65000, used_elimination: true }),
        createMockAttempt({ diagnostic_question_id: 'q3', is_correct: true, response_time: 85000, changed_answer: true }),
        createMockAttempt({ diagnostic_question_id: 'q1', is_correct: false, response_time: 25000, showed_hesitation: true }),
        createMockAttempt({ diagnostic_question_id: 'q2', is_correct: true, response_time: 70000, confidence_level: 3 }),
      ]

      const input = {
        attempts,
        questionMetadata: mockQuestionMetadata
      }

      const result = engine.classifyLearningStyle(input)

      expect(result).toBeDefined()
      expect(result.primaryStyle).toBeDefined()
      expect(result.scores).toBeDefined()
      expect(result.scores.visual_analytical).toBeGreaterThanOrEqual(0)
      expect(result.scores.visual_analytical).toBeLessThanOrEqual(1)
      expect(result.scores.fast_methodical).toBeGreaterThanOrEqual(0)
      expect(result.scores.fast_methodical).toBeLessThanOrEqual(1)
      expect(result.scores.conceptual_detail).toBeGreaterThanOrEqual(0)
      expect(result.scores.conceptual_detail).toBeLessThanOrEqual(1)
      expect(result.confidence.overall).toBeGreaterThanOrEqual(0)
      expect(result.confidence.overall).toBeLessThanOrEqual(100)
      expect(result.dataPoints.totalQuestions).toBe(attempts.length)
    })

    it('should return low confidence analysis with insufficient data', () => {
      const attempts = [
        createMockAttempt({ diagnostic_question_id: 'q1' }),
        createMockAttempt({ diagnostic_question_id: 'q2' })
      ]

      const input = {
        attempts,
        questionMetadata: mockQuestionMetadata
      }

      const result = engine.classifyLearningStyle(input)

      expect(result).toBeDefined()
      expect(result.confidence.overall).toBeLessThan(50)
      expect(result.recommendations).toContain('Complete more diagnostic questions for better accuracy')
    })

    it('should provide secondary learning style when applicable', () => {
      const attempts = Array.from({ length: 10 }, (_, i) => 
        createMockAttempt({ 
          diagnostic_question_id: `q${(i % 3) + 1}`,
          response_time: 45000 + (i * 5000),
          is_correct: i % 2 === 0,
          confidence_level: Math.floor(Math.random() * 5) + 1
        })
      )

      const input = {
        attempts,
        questionMetadata: mockQuestionMetadata
      }

      const result = engine.classifyLearningStyle(input)

      expect(result).toBeDefined()
      expect(result.primaryStyle).toBeDefined()
      // Secondary style should be null or a different style
      if (result.secondaryStyle) {
        expect(result.secondaryStyle).not.toBe(result.primaryStyle)
      }
    })
  })

  describe('analyzeBehavioralPatterns', () => {
    it('should analyze response time patterns correctly', () => {
      const attempts = [
        createMockAttempt({ response_time: 30000 }),
        createMockAttempt({ response_time: 45000 }),
        createMockAttempt({ response_time: 60000 }),
        createMockAttempt({ response_time: 40000 })
      ]

      const input = { attempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)

      expect(patterns.avgResponseTime).toBe(43750) // (30000 + 45000 + 60000 + 40000) / 4
      expect(patterns.responseTimeVariance).toBeGreaterThan(0)
    })

    it('should calculate accuracy by category', () => {
      const attempts = [
        createMockAttempt({ diagnostic_question_id: 'q1', is_correct: true }),
        createMockAttempt({ diagnostic_question_id: 'q1', is_correct: false }),
        createMockAttempt({ diagnostic_question_id: 'q2', is_correct: true }),
        createMockAttempt({ diagnostic_question_id: 'q2', is_correct: true })
      ]

      const input = { attempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)

      expect(patterns.accuracyByCategory['visual_pattern']).toBe(0.5) // 1 correct out of 2
      expect(patterns.accuracyByCategory['analytical_logic']).toBe(1.0) // 2 correct out of 2
    })

    it('should track behavioral indicators', () => {
      const attempts = [
        createMockAttempt({ showed_hesitation: true }),
        createMockAttempt({ changed_answer: true }),
        createMockAttempt({ used_elimination: true }),
        createMockAttempt({ confidence_level: 5 })
      ]

      const input = { attempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)

      expect(patterns.hesitationFrequency).toBe(0.25) // 1 out of 4
      expect(patterns.answerChangeFrequency).toBe(0.25) // 1 out of 4
      expect(patterns.eliminationUsage).toBe(0.25) // 1 out of 4
      expect(patterns.confidencePattern).toHaveLength(4)
    })
  })

  describe('calculateLearningDimensions', () => {
    it('should calculate visual vs analytical dimension', () => {
      const fastVisualAttempts = [
        createMockAttempt({ diagnostic_question_id: 'q1', response_time: 30000, is_correct: true }), // Visual, fast
        createMockAttempt({ diagnostic_question_id: 'q2', response_time: 90000, is_correct: false }) // Analytical, slow
      ]

      const input = { attempts: fastVisualAttempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)
      const dimensions = engine['calculateLearningDimensions'](input, patterns)

      expect(dimensions.visual_analytical).toBeGreaterThanOrEqual(0)
      expect(dimensions.visual_analytical).toBeLessThanOrEqual(1)
    })

    it('should calculate fast vs methodical dimension', () => {
      const fastAttempts = [
        createMockAttempt({ response_time: 20000 }), // Very fast
        createMockAttempt({ response_time: 25000 }), // Very fast
        createMockAttempt({ response_time: 30000 })  // Fast
      ]

      const input = { attempts: fastAttempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)
      const dimensions = engine['calculateLearningDimensions'](input, patterns)

      expect(dimensions.fast_methodical).toBeLessThan(0.5) // Should lean toward fast
    })

    it('should calculate conceptual vs detail dimension', () => {
      const detailOrientedAttempts = [
        createMockAttempt({ diagnostic_question_id: 'q3', is_correct: true, response_time: 80000 }), // Detail question, good performance
        createMockAttempt({ diagnostic_question_id: 'q2', is_correct: false, response_time: 45000 })  // Conceptual question, poor performance
      ]

      const input = { attempts: detailOrientedAttempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)
      const dimensions = engine['calculateLearningDimensions'](input, patterns)

      expect(dimensions.conceptual_detail).toBeGreaterThanOrEqual(0)
      expect(dimensions.conceptual_detail).toBeLessThanOrEqual(1)
    })
  })

  describe('classifyStyles', () => {
    it('should classify primary and secondary styles correctly', () => {
      const dimensions = {
        visual_analytical: 0.7, // Analytical
        fast_methodical: 0.3,   // Fast
        conceptual_detail: 0.8  // Detail
      }

      const { primaryStyle, secondaryStyle } = engine['classifyStyles'](dimensions)

      expect(primaryStyle).toBe('analytical-fast-detail')
      // Secondary style should be calculated based on smallest margin
    })

    it('should handle edge case dimensions', () => {
      const dimensions = {
        visual_analytical: 0.5, // Exactly neutral
        fast_methodical: 0.0,   // Extremely fast
        conceptual_detail: 1.0  // Extremely detail-oriented
      }

      const { primaryStyle, secondaryStyle } = engine['classifyStyles'](dimensions)

      expect(primaryStyle).toBeDefined()
      expect(typeof primaryStyle).toBe('string')
    })
  })

  describe('calculateConfidenceScores', () => {
    it('should calculate confidence scores based on data quality', () => {
      const attempts = Array.from({ length: 15 }, (_, i) => 
        createMockAttempt({ 
          diagnostic_question_id: `q${(i % 3) + 1}`,
          confidence_level: 4,
          is_correct: i % 3 !== 0 // 67% accuracy
        })
      )

      const input = { attempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)
      const dimensions = {
        visual_analytical: 0.8, // Strong preference
        fast_methodical: 0.3,   // Strong preference
        conceptual_detail: 0.6  // Moderate preference
      }

      const confidence = engine['calculateConfidenceScores'](input, dimensions, patterns)

      expect(confidence.visual_analytical).toBeGreaterThan(confidence.conceptual_detail) // Strong vs moderate
      expect(confidence.fast_methodical).toBeGreaterThan(confidence.conceptual_detail) // Strong vs moderate
      expect(confidence.overall).toBeGreaterThanOrEqual(0)
      expect(confidence.overall).toBeLessThanOrEqual(100)
    })

    it('should reduce confidence for inconsistent patterns', () => {
      const inconsistentAttempts = [
        createMockAttempt({ confidence_level: 1, response_time: 20000 }),
        createMockAttempt({ confidence_level: 5, response_time: 120000 }),
        createMockAttempt({ confidence_level: 2, response_time: 30000 }),
        createMockAttempt({ confidence_level: 4, response_time: 100000 })
      ]

      const input = { attempts: inconsistentAttempts, questionMetadata: mockQuestionMetadata }
      const patterns = engine['analyzeBehavioralPatterns'](input)
      const dimensions = { visual_analytical: 0.5, fast_methodical: 0.5, conceptual_detail: 0.5 }

      const confidence = engine['calculateConfidenceScores'](input, dimensions, patterns)

      expect(confidence.overall).toBeLessThan(80) // Should be lower due to inconsistency
    })
  })

  describe('generateRecommendations', () => {
    it('should generate appropriate recommendations for different styles', () => {
      const styles: Array<{
        primary: any,
        dimensions: any,
        expectedRecommendation: string
      }> = [
        {
          primary: 'visual-fast-conceptual',
          dimensions: { visual_analytical: 0.2, fast_methodical: 0.2, conceptual_detail: 0.2 },
          expectedRecommendation: 'timed'
        },
        {
          primary: 'analytical-methodical-detail',
          dimensions: { visual_analytical: 0.8, fast_methodical: 0.8, conceptual_detail: 0.8 },
          expectedRecommendation: 'systematic'
        }
      ]

      styles.forEach(({ primary, dimensions, expectedRecommendation }) => {
        const recommendations = engine['generateRecommendations'](primary, null, dimensions)
        
        expect(recommendations).toBeInstanceOf(Array)
        expect(recommendations.length).toBeGreaterThan(0)
        expect(recommendations.some(rec => 
          rec.toLowerCase().includes(expectedRecommendation)
        )).toBe(true)
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty attempts array', () => {
      const input = {
        attempts: [],
        questionMetadata: mockQuestionMetadata
      }

      const result = engine.classifyLearningStyle(input)

      expect(result.confidence.overall).toBeLessThan(30)
      expect(result.primaryStyle).toBeDefined()
    })

    it('should handle missing question metadata', () => {
      const attempts = [createMockAttempt()]
      const input = {
        attempts,
        questionMetadata: []
      }

      const result = engine.classifyLearningStyle(input)

      expect(result).toBeDefined()
      expect(result.primaryStyle).toBeDefined()
    })

    it('should handle extreme response times', () => {
      const attempts = [
        createMockAttempt({ response_time: 1000 }),    // Very fast
        createMockAttempt({ response_time: 300000 }),  // Very slow
        createMockAttempt({ response_time: 0 }),       // Invalid
        createMockAttempt({ response_time: -1000 })    // Invalid
      ]

      const input = { attempts, questionMetadata: mockQuestionMetadata }

      expect(() => engine.classifyLearningStyle(input)).not.toThrow()
    })

    it('should handle null/undefined values gracefully', () => {
      const attempts = [
        createMockAttempt({ confidence_level: null as any }),
        createMockAttempt({ time_on_question: null as any }),
        createMockAttempt({ scroll_behavior: null as any })
      ]

      const input = { attempts, questionMetadata: mockQuestionMetadata }

      expect(() => engine.classifyLearningStyle(input)).not.toThrow()
    })
  })
})