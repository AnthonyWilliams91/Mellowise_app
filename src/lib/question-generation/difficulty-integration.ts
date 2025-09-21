/**
 * MELLOWISE-013: Difficulty Calibration Integration
 * Integration between AI question generation and MELLOWISE-010 difficulty system
 */

import { DynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service';
import {
  GeneratedQuestion,
  GenerateQuestionRequest,
  QuestionTemplate
} from '@/types/question-generation';
import {
  TopicType,
  PracticeDifficultyState,
  PerformancePoint,
  DifficultyCalculation
} from '@/types/dynamic-difficulty';

// Initialize the difficulty service
const difficultyService = new DynamicDifficultyService();

/**
 * Calibrate generated question difficulty using MELLOWISE-010 algorithm
 */
export async function calibrateQuestionDifficulty(
  question: GeneratedQuestion,
  userId: string,
  topicType: TopicType
): Promise<GeneratedQuestion> {
  try {
    // Get current difficulty state for the user and topic
    const difficultyState = await difficultyService.getCurrentState(userId, topicType);

    if (!difficultyState) {
      // No existing state, return question as-is
      return question;
    }

    // Calculate target difficulty based on FSRS algorithm
    const targetDifficulty = calculateTargetDifficulty(difficultyState);

    // Adjust question difficulty if needed
    const calibratedQuestion = adjustQuestionToDifficulty(question, targetDifficulty);

    // Store the difficulty calibration metadata
    calibratedQuestion.difficulty = targetDifficulty;

    return calibratedQuestion;

  } catch (error) {
    console.error('Error calibrating question difficulty:', error);
    // Return original question if calibration fails
    return question;
  }
}

/**
 * Generate questions at optimal difficulty for user
 */
export async function generateOptimalDifficultyQuestions(
  request: GenerateQuestionRequest,
  userId: string
): Promise<GenerateQuestionRequest> {
  try {
    const topicType = mapSectionTypeToTopic(request.sectionType);

    // Get current difficulty state
    const difficultyState = await difficultyService.getCurrentState(userId, topicType);

    if (!difficultyState) {
      // No existing state, use requested difficulty
      return request;
    }

    // Calculate optimal difficulty range
    const optimalRange = calculateOptimalDifficultyRange(difficultyState);

    // Adjust request difficulty to be within optimal range
    const adjustedDifficulty = Math.max(
      optimalRange.min,
      Math.min(optimalRange.max, request.difficulty)
    );

    return {
      ...request,
      difficulty: adjustedDifficulty
    };

  } catch (error) {
    console.error('Error calculating optimal difficulty:', error);
    return request;
  }
}

/**
 * Update difficulty system after generated question is answered
 */
export async function updateDifficultyAfterAnswer(
  question: GeneratedQuestion,
  userId: string,
  isCorrect: boolean,
  responseTime: number
): Promise<void> {
  try {
    const topicType = mapSectionTypeToTopic(question.sectionType);

    // Create performance point
    const performancePoint: PerformancePoint = {
      timestamp: new Date(),
      difficulty: question.difficulty,
      isCorrect,
      responseTime,
      questionId: question.id,
      sessionId: `gen_${Date.now()}`, // Generated question session
      topicFocus: question.sectionType
    };

    // Submit to difficulty service
    await difficultyService.recordPerformance(userId, topicType, performancePoint);

    // Update question performance metrics
    await updateQuestionMetrics(question, isCorrect, responseTime);

  } catch (error) {
    console.error('Error updating difficulty after answer:', error);
  }
}

/**
 * Validate that generated question difficulty is appropriate
 */
export function validateQuestionDifficulty(
  question: GeneratedQuestion,
  expectedDifficulty: number,
  tolerance: number = 1
): {
  isValid: boolean;
  actualDifficulty: number;
  expectedDifficulty: number;
  deviation: number;
  recommendation?: string;
} {
  const actualDifficulty = analyzeDifficultyFromContent(question);
  const deviation = Math.abs(actualDifficulty - expectedDifficulty);
  const isValid = deviation <= tolerance;

  let recommendation: string | undefined;
  if (!isValid) {
    if (actualDifficulty > expectedDifficulty) {
      recommendation = 'Simplify language, reduce complex reasoning steps, or provide clearer context';
    } else {
      recommendation = 'Add complexity, introduce subtle distinctions, or require deeper analysis';
    }
  }

  return {
    isValid,
    actualDifficulty,
    expectedDifficulty,
    deviation,
    recommendation
  };
}

/**
 * Get difficulty recommendations for question generation
 */
export async function getDifficultyRecommendations(
  userId: string,
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension'
): Promise<{
  recommendedDifficulty: number;
  confidenceLevel: number;
  reasoning: string;
  alternativeDifficulties: number[];
}> {
  try {
    const topicType = mapSectionTypeToTopic(sectionType);
    const difficultyState = await difficultyService.getCurrentState(userId, topicType);

    if (!difficultyState) {
      return {
        recommendedDifficulty: 5,
        confidenceLevel: 0.3,
        reasoning: 'No performance history available, starting with medium difficulty',
        alternativeDifficulties: [3, 4, 6, 7]
      };
    }

    const currentLevel = difficultyState.currentDifficulty;
    const performance = await getRecentPerformance(userId, topicType);

    // Calculate recommendation based on recent performance
    const { recommendedDifficulty, confidence, reasoning } = calculateDifficultyRecommendation(
      currentLevel,
      performance
    );

    // Generate alternative difficulties
    const alternatives = [
      Math.max(1, recommendedDifficulty - 2),
      Math.max(1, recommendedDifficulty - 1),
      Math.min(10, recommendedDifficulty + 1),
      Math.min(10, recommendedDifficulty + 2)
    ].filter(d => d !== recommendedDifficulty);

    return {
      recommendedDifficulty,
      confidenceLevel: confidence,
      reasoning,
      alternativeDifficulties: alternatives
    };

  } catch (error) {
    console.error('Error getting difficulty recommendations:', error);
    return {
      recommendedDifficulty: 5,
      confidenceLevel: 0.1,
      reasoning: 'Error analyzing performance, using default difficulty',
      alternativeDifficulties: [3, 4, 6, 7]
    };
  }
}

// Helper functions

function mapSectionTypeToTopic(
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension'
): TopicType {
  switch (sectionType) {
    case 'logical_reasoning':
      return 'logical_reasoning';
    case 'logic_games':
      return 'logic_games';
    case 'reading_comprehension':
      return 'reading_comprehension';
    default:
      return 'logical_reasoning';
  }
}

function calculateTargetDifficulty(state: PracticeDifficultyState): number {
  // Use FSRS state to calculate optimal difficulty
  const currentLevel = state.currentDifficulty;
  const successRate = state.recentAccuracy;

  // Target 70-80% success rate for optimal learning
  if (successRate > 0.85) {
    return Math.min(10, currentLevel + 0.5);
  } else if (successRate < 0.65) {
    return Math.max(1, currentLevel - 0.5);
  }

  return currentLevel;
}

function calculateOptimalDifficultyRange(state: PracticeDifficultyState): {
  min: number;
  max: number;
} {
  const currentLevel = state.currentDifficulty;
  const confidence = state.confidenceLevel || 0.5;

  // Wider range for lower confidence
  const range = (1 - confidence) * 2 + 1;

  return {
    min: Math.max(1, currentLevel - range),
    max: Math.min(10, currentLevel + range)
  };
}

function adjustQuestionToDifficulty(
  question: GeneratedQuestion,
  targetDifficulty: number
): GeneratedQuestion {
  // This would involve re-generating or modifying the question
  // For now, we'll just update the metadata
  return {
    ...question,
    difficulty: targetDifficulty
  };
}

function analyzeDifficultyFromContent(question: GeneratedQuestion): number {
  let difficulty = 5; // Base difficulty

  // Analyze stimulus complexity
  const stimulusWords = question.stimulus.split(/\s+/).length;
  const avgSentenceLength = question.stimulus.split(/[.!?]+/).reduce((total, sentence) => {
    const words = sentence.trim().split(/\s+/).length;
    return total + words;
  }, 0) / question.stimulus.split(/[.!?]+/).length;

  // Adjust for text complexity
  if (avgSentenceLength > 20) difficulty += 1;
  if (avgSentenceLength > 30) difficulty += 1;
  if (stimulusWords > 150) difficulty += 1;

  // Analyze answer choice complexity
  const avgChoiceLength = question.answerChoices.reduce((total, choice) => {
    return total + choice.text.split(/\s+/).length;
  }, 0) / question.answerChoices.length;

  if (avgChoiceLength > 15) difficulty += 0.5;
  if (avgChoiceLength > 25) difficulty += 0.5;

  // Analyze question type complexity for logical reasoning
  if (question.sectionType === 'logical_reasoning') {
    const questionLower = question.question.toLowerCase();
    if (questionLower.includes('necessary assumption') || questionLower.includes('must be true')) {
      difficulty += 1;
    }
    if (questionLower.includes('strengthen') || questionLower.includes('weaken')) {
      difficulty += 0.5;
    }
  }

  // Analyze logic games complexity
  if (question.sectionType === 'logic_games') {
    const ruleCount = (question.stimulus.match(/\n/g) || []).length;
    if (ruleCount > 4) difficulty += 1;
    if (ruleCount > 6) difficulty += 1;
  }

  return Math.max(1, Math.min(10, Math.round(difficulty * 2) / 2)); // Round to nearest 0.5
}

async function getRecentPerformance(
  userId: string,
  topicType: TopicType
): Promise<PerformancePoint[]> {
  try {
    // This would fetch from the database
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching recent performance:', error);
    return [];
  }
}

function calculateDifficultyRecommendation(
  currentLevel: number,
  performance: PerformancePoint[]
): {
  recommendedDifficulty: number;
  confidence: number;
  reasoning: string;
} {
  if (performance.length === 0) {
    return {
      recommendedDifficulty: currentLevel,
      confidence: 0.5,
      reasoning: 'Maintaining current difficulty due to limited performance data'
    };
  }

  const recentPerformance = performance.slice(-10);
  const correctRate = recentPerformance.filter(p => p.isCorrect).length / recentPerformance.length;
  const avgResponseTime = recentPerformance.reduce((sum, p) => sum + p.responseTime, 0) / recentPerformance.length;

  let recommendedDifficulty = currentLevel;
  let reasoning = '';

  if (correctRate > 0.8 && avgResponseTime < 60000) {
    recommendedDifficulty = Math.min(10, currentLevel + 1);
    reasoning = 'High accuracy and fast response time suggest readiness for increased difficulty';
  } else if (correctRate < 0.6) {
    recommendedDifficulty = Math.max(1, currentLevel - 1);
    reasoning = 'Low accuracy suggests need for reduced difficulty to build confidence';
  } else if (avgResponseTime > 120000) {
    recommendedDifficulty = Math.max(1, currentLevel - 0.5);
    reasoning = 'Slow response times indicate current difficulty may be too challenging';
  } else {
    reasoning = 'Performance indicates current difficulty is appropriate';
  }

  const confidence = Math.min(0.9, performance.length / 20);

  return {
    recommendedDifficulty,
    confidence,
    reasoning
  };
}

async function updateQuestionMetrics(
  question: GeneratedQuestion,
  isCorrect: boolean,
  responseTime: number
): Promise<void> {
  try {
    // This would update question performance metrics in the database
    // For now, just log the update
    console.log(`Updating metrics for question ${question.id}: correct=${isCorrect}, time=${responseTime}ms`);
  } catch (error) {
    console.error('Error updating question metrics:', error);
  }
}