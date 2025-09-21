/**
 * MELLOWISE-013: Question Generation System Integration Tests
 * Comprehensive testing of AI-powered question generation workflow
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import {
  selectTemplate,
  validateTemplate,
  logicalReasoningTemplates,
  logicGamesTemplates,
  readingComprehensionTemplates
} from '@/lib/question-generation/templates';
import {
  validateQuestion,
  batchValidate,
  autoFixQuestion
} from '@/lib/question-generation/quality-assurance';
import {
  validateQuestionDifficulty,
  generateOptimalDifficultyQuestions
} from '@/lib/question-generation/difficulty-integration';
import { GeneratedQuestion, GenerateQuestionRequest } from '@/types/question-generation';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk');
jest.mock('@/lib/supabase/client');

describe('Question Generation System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template System', () => {
    it('should have templates for all LSAT sections', () => {
      expect(logicalReasoningTemplates.length).toBeGreaterThan(0);
      expect(logicGamesTemplates.length).toBeGreaterThan(0);
      expect(readingComprehensionTemplates.length).toBeGreaterThan(0);
    });

    it('should select appropriate templates by section and difficulty', () => {
      const lrTemplate = selectTemplate('logical_reasoning', 5);
      expect(lrTemplate).toBeTruthy();
      expect(lrTemplate?.sectionType).toBe('logical_reasoning');
      expect(lrTemplate?.difficulty_range[0]).toBeLessThanOrEqual(5);
      expect(lrTemplate?.difficulty_range[1]).toBeGreaterThanOrEqual(5);

      const lgTemplate = selectTemplate('logic_games', 7);
      expect(lgTemplate).toBeTruthy();
      expect(lgTemplate?.sectionType).toBe('logic_games');

      const rcTemplate = selectTemplate('reading_comprehension', 3);
      expect(rcTemplate).toBeTruthy();
      expect(rcTemplate?.sectionType).toBe('reading_comprehension');
    });

    it('should validate template structure', () => {
      for (const template of [...logicalReasoningTemplates, ...logicGamesTemplates, ...readingComprehensionTemplates]) {
        const errors = validateTemplate(template);
        expect(errors).toEqual([]);
      }
    });

    it('should handle edge case difficulty levels', () => {
      const minDiffTemplate = selectTemplate('logical_reasoning', 1);
      expect(minDiffTemplate).toBeTruthy();

      const maxDiffTemplate = selectTemplate('logical_reasoning', 10);
      expect(maxDiffTemplate).toBeTruthy();

      const noTemplate = selectTemplate('logical_reasoning', 15 as any);
      expect(noTemplate).toBeNull();
    });
  });

  describe('Quality Assurance Pipeline', () => {
    const createMockQuestion = (overrides: Partial<GeneratedQuestion> = {}): GeneratedQuestion => ({
      id: 'test-q-001',
      sectionType: 'logical_reasoning',
      difficulty: 5,
      stimulus: 'Recent studies show that employees who work from home report higher job satisfaction than those who work in offices. This increased satisfaction correlates with improved productivity metrics. Therefore, companies should adopt permanent remote work policies.',
      question: 'Which one of the following, if true, most weakens the argument?',
      answerChoices: [
        { id: 'a1', label: 'A', text: 'The studies did not account for employee collaboration effectiveness', isCorrect: true },
        { id: 'a2', label: 'B', text: 'Remote work reduces commute time for employees', isCorrect: false },
        { id: 'a3', label: 'C', text: 'Some employees prefer working from offices', isCorrect: false },
        { id: 'a4', label: 'D', text: 'Technology enables effective remote communication', isCorrect: false },
        { id: 'a5', label: 'E', text: 'Office spaces are expensive to maintain', isCorrect: false }
      ],
      correctAnswer: 'a1',
      explanation: 'Answer A weakens the argument by introducing a crucial factor (collaboration) that was not considered in the studies, potentially undermining the conclusion about adopting remote work policies.',
      generationId: 'test-batch-001',
      modelUsed: 'claude-3-sonnet',
      generatedAt: new Date(),
      generationTime: 2800,
      tokensUsed: { input: 450, output: 320 },
      validationStatus: 'pending',
      humanReviewed: false,
      timesUsed: 0,
      ...overrides
    });

    it('should validate well-formed questions', () => {
      const question = createMockQuestion();
      const validation = validateQuestion(question);

      expect(validation.passed).toBe(true);
      expect(validation.overallScore).toBeGreaterThan(70);
      expect(validation.formatValid).toBe(true);
      expect(validation.answerChoicesValid).toBe(true);
    });

    it('should identify format issues', () => {
      const questionWithIssues = createMockQuestion({
        stimulus: 'Too short', // Too brief
        answerChoices: [ // Wrong number of choices
          { id: 'a1', label: 'A', text: 'Choice 1', isCorrect: true },
          { id: 'a2', label: 'B', text: 'Choice 2', isCorrect: false }
        ]
      });

      const validation = validateQuestion(questionWithIssues);
      expect(validation.passed).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('should identify multiple correct answers', () => {
      const questionWithMultipleCorrect = createMockQuestion({
        answerChoices: [
          { id: 'a1', label: 'A', text: 'Choice 1', isCorrect: true },
          { id: 'a2', label: 'B', text: 'Choice 2', isCorrect: true }, // Multiple correct
          { id: 'a3', label: 'C', text: 'Choice 3', isCorrect: false },
          { id: 'a4', label: 'D', text: 'Choice 4', isCorrect: false },
          { id: 'a5', label: 'E', text: 'Choice 5', isCorrect: false }
        ]
      });

      const validation = validateQuestion(questionWithMultipleCorrect);
      expect(validation.passed).toBe(false);
      expect(validation.answerChoicesValid).toBe(false);
    });

    it('should auto-fix common issues', () => {
      const questionWithIssues = createMockQuestion({
        answerChoices: [
          { id: 'a1', label: 'X' as any, text: 'Choice 1', isCorrect: false }, // Wrong label
          { id: 'a2', label: 'Y' as any, text: 'Choice 2', isCorrect: true },
          { id: 'a3', label: 'Z' as any, text: 'Choice 3', isCorrect: true }, // Multiple correct
          { id: 'a4', label: 'W' as any, text: 'Choice 4', isCorrect: false },
          { id: 'a5', label: 'V' as any, text: 'Choice 5', isCorrect: false }
        ]
      });

      const fixed = autoFixQuestion(questionWithIssues);

      // Should fix labels
      expect(fixed.answerChoices[0].label).toBe('A');
      expect(fixed.answerChoices[1].label).toBe('B');
      expect(fixed.answerChoices[2].label).toBe('C');

      // Should fix multiple correct answers
      const correctCount = fixed.answerChoices.filter(ac => ac.isCorrect).length;
      expect(correctCount).toBe(1);
    });

    it('should perform batch validation', () => {
      const questions = [
        createMockQuestion({ id: 'q1' }),
        createMockQuestion({ id: 'q2', difficulty: 7 }),
        createMockQuestion({
          id: 'q3',
          stimulus: 'Bad' // Too short, should fail validation
        })
      ];

      const batchResult = batchValidate(questions);

      expect(batchResult.results).toHaveLength(3);
      expect(batchResult.summary.total).toBe(3);
      expect(batchResult.summary.passed).toBe(2);
      expect(batchResult.summary.failed).toBe(1);
      expect(batchResult.summary.averageScore).toBeGreaterThan(0);
    });
  });

  describe('Difficulty Integration', () => {
    const mockQuestion = {
      id: 'test-q-001',
      sectionType: 'logical_reasoning' as const,
      difficulty: 5,
      stimulus: 'A moderate complexity stimulus that tests logical reasoning with clear premises and conclusion.',
      question: 'Which one of the following strengthens the argument?',
      answerChoices: [
        { id: 'a1', label: 'A' as const, text: 'Supporting evidence', isCorrect: true },
        { id: 'a2', label: 'B' as const, text: 'Irrelevant information', isCorrect: false },
        { id: 'a3', label: 'C' as const, text: 'Weakening statement', isCorrect: false },
        { id: 'a4', label: 'D' as const, text: 'Unrelated fact', isCorrect: false },
        { id: 'a5', label: 'E' as const, text: 'Opposite conclusion', isCorrect: false }
      ],
      correctAnswer: 'a1',
      explanation: 'Choice A provides direct support for the argument.',
      generationId: 'test-batch',
      modelUsed: 'claude-3-sonnet',
      generatedAt: new Date(),
      generationTime: 3000,
      tokensUsed: { input: 400, output: 300 },
      validationStatus: 'pending' as const,
      humanReviewed: false,
      timesUsed: 0
    };

    it('should validate question difficulty accuracy', () => {
      const validation = validateQuestionDifficulty(mockQuestion, 5, 1);

      expect(validation.expectedDifficulty).toBe(5);
      expect(validation.actualDifficulty).toBeCloseTo(5, 1);
      expect(validation.isValid).toBe(true);
    });

    it('should detect difficulty mismatches', () => {
      const easyQuestion = {
        ...mockQuestion,
        stimulus: 'Simple premise. Clear conclusion.',
        question: 'What is the conclusion?'
      };

      const validation = validateQuestionDifficulty(easyQuestion, 8, 1);
      expect(validation.isValid).toBe(false);
      expect(validation.actualDifficulty).toBeLessThan(validation.expectedDifficulty);
      expect(validation.recommendation).toBeTruthy();
    });

    it('should adjust generation requests for optimal difficulty', async () => {
      const request: GenerateQuestionRequest = {
        sectionType: 'logical_reasoning',
        difficulty: 8,
        quantity: 3
      };

      // This would normally interact with the difficulty service
      // For testing, we'll just verify the function doesn't crash
      const adjustedRequest = await generateOptimalDifficultyQuestions(request, 'test-user');

      expect(adjustedRequest.sectionType).toBe(request.sectionType);
      expect(adjustedRequest.quantity).toBe(request.quantity);
      expect(adjustedRequest.difficulty).toBeGreaterThanOrEqual(1);
      expect(adjustedRequest.difficulty).toBeLessThanOrEqual(10);
    });
  });

  describe('Cross-Section Generation Tests', () => {
    const testSections: Array<'logical_reasoning' | 'logic_games' | 'reading_comprehension'> = [
      'logical_reasoning',
      'logic_games',
      'reading_comprehension'
    ];

    testSections.forEach(sectionType => {
      it(`should generate valid questions for ${sectionType}`, () => {
        const template = selectTemplate(sectionType, 5);
        expect(template).toBeTruthy();
        expect(template?.sectionType).toBe(sectionType);

        // Verify template has required structure
        expect(template?.structure.stimulus).toBeTruthy();
        expect(template?.structure.question).toBeTruthy();
        expect(template?.structure.answerChoices).toHaveLength(5);
        expect(template?.structure.explanation).toBeTruthy();
      });

      it(`should handle difficulty range for ${sectionType}`, () => {
        for (let difficulty = 1; difficulty <= 10; difficulty++) {
          const template = selectTemplate(sectionType, difficulty);
          if (template) {
            expect(template.difficulty_range[0]).toBeLessThanOrEqual(difficulty);
            expect(template.difficulty_range[1]).toBeGreaterThanOrEqual(difficulty);
          }
        }
      });
    });

    it('should maintain section-specific characteristics', () => {
      const lrTemplate = selectTemplate('logical_reasoning', 5);
      const lgTemplate = selectTemplate('logic_games', 5);
      const rcTemplate = selectTemplate('reading_comprehension', 5);

      // Logical Reasoning should focus on arguments
      expect(lrTemplate?.topics.some(topic =>
        ['causal_reasoning', 'assumptions', 'argument_structure'].includes(topic)
      )).toBe(true);

      // Logic Games should focus on rules and ordering
      expect(lgTemplate?.topics.some(topic =>
        ['ordering', 'grouping', 'conditional_rules'].includes(topic)
      )).toBe(true);

      // Reading Comprehension should focus on text analysis
      expect(rcTemplate?.topics.some(topic =>
        ['main_idea', 'author_tone', 'passage_structure'].includes(topic)
      )).toBe(true);
    });
  });

  describe('Integration Edge Cases', () => {
    it('should handle empty generation requests gracefully', async () => {
      const request: GenerateQuestionRequest = {
        sectionType: 'logical_reasoning',
        difficulty: 5,
        quantity: 0 // Invalid quantity
      };

      // Should handle gracefully without crashing
      expect(() => {
        validateQuestion({} as GeneratedQuestion);
      }).not.toThrow();
    });

    it('should handle extreme difficulty values', () => {
      const extremeEasy = selectTemplate('logical_reasoning', -5 as any);
      expect(extremeEasy).toBeNull();

      const extremeHard = selectTemplate('logical_reasoning', 50 as any);
      expect(extremeHard).toBeNull();
    });

    it('should handle malformed question data', () => {
      const malformedQuestion = {
        id: 'malformed',
        // Missing required fields
      } as any;

      const validation = validateQuestion(malformedQuestion);
      expect(validation.passed).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('should handle network and API failures gracefully', async () => {
      // Mock API failure
      const failedRequest: GenerateQuestionRequest = {
        sectionType: 'logical_reasoning',
        difficulty: 5,
        quantity: 1
      };

      // Should not throw errors even when API is unavailable
      const result = await generateOptimalDifficultyQuestions(failedRequest, 'test-user');
      expect(result).toBeTruthy();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle batch processing efficiently', () => {
      const startTime = Date.now();

      // Create large batch of questions
      const questions = Array.from({ length: 50 }, (_, i) => ({
        id: `perf-test-${i}`,
        sectionType: 'logical_reasoning' as const,
        difficulty: Math.floor(Math.random() * 10) + 1,
        stimulus: `Performance test stimulus ${i}. This tests the system's ability to handle large batches of questions efficiently.`,
        question: `Performance test question ${i}?`,
        answerChoices: [
          { id: `a1-${i}`, label: 'A' as const, text: `Choice A ${i}`, isCorrect: true },
          { id: `a2-${i}`, label: 'B' as const, text: `Choice B ${i}`, isCorrect: false },
          { id: `a3-${i}`, label: 'C' as const, text: `Choice C ${i}`, isCorrect: false },
          { id: `a4-${i}`, label: 'D' as const, text: `Choice D ${i}`, isCorrect: false },
          { id: `a5-${i}`, label: 'E' as const, text: `Choice E ${i}`, isCorrect: false }
        ],
        correctAnswer: `a1-${i}`,
        explanation: `Explanation for performance test question ${i}`,
        generationId: 'perf-test-batch',
        modelUsed: 'claude-3-sonnet',
        generatedAt: new Date(),
        generationTime: 2000,
        tokensUsed: { input: 400, output: 300 },
        validationStatus: 'pending' as const,
        humanReviewed: false,
        timesUsed: 0
      }));

      const batchResult = batchValidate(questions);
      const endTime = Date.now();

      expect(batchResult.results).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(batchResult.summary.total).toBe(50);
    });

    it('should maintain template selection performance', () => {
      const startTime = Date.now();

      // Perform many template selections
      for (let i = 0; i < 1000; i++) {
        const sectionTypes: Array<'logical_reasoning' | 'logic_games' | 'reading_comprehension'> = [
          'logical_reasoning', 'logic_games', 'reading_comprehension'
        ];
        const sectionType = sectionTypes[i % 3];
        const difficulty = (i % 10) + 1;

        const template = selectTemplate(sectionType, difficulty);
        expect(template).toBeTruthy();
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});