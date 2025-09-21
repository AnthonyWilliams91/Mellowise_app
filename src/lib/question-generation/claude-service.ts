/**
 * MELLOWISE-013: Claude AI Service for Question Generation
 * Integration with Anthropic's Claude API for generating LSAT questions
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  GeneratedQuestion,
  GenerateQuestionRequest,
  QuestionTemplate,
  AnswerChoice,
  ModelConfig
} from '@/types/question-generation';
import { selectTemplate } from './templates';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model configuration
const defaultConfig: ModelConfig = {
  provider: 'anthropic',
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 2000,
  maxRequestsPerMinute: 20,
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
};

/**
 * Generate LSAT questions using Claude AI
 */
export async function generateQuestions(
  request: GenerateQuestionRequest,
  config: ModelConfig = defaultConfig
): Promise<GeneratedQuestion[]> {
  const questions: GeneratedQuestion[] = [];

  for (let i = 0; i < request.quantity; i++) {
    try {
      const question = await generateSingleQuestion(request, config);
      if (question) {
        questions.push(question);
      }
    } catch (error) {
      console.error(`Failed to generate question ${i + 1}:`, error);
      // Continue generating remaining questions
    }
  }

  return questions;
}

/**
 * Generate a single LSAT question
 */
async function generateSingleQuestion(
  request: GenerateQuestionRequest,
  config: ModelConfig
): Promise<GeneratedQuestion | null> {
  // Select appropriate template
  const template = selectTemplate(request.sectionType, request.difficulty);
  if (!template) {
    throw new Error(`No template found for ${request.sectionType} at difficulty ${request.difficulty}`);
  }

  // Build the prompt
  const prompt = buildPrompt(template, request);

  // Call Claude API
  const startTime = Date.now();
  const response = await callClaudeWithRetry(prompt, config);
  const generationTime = Date.now() - startTime;

  if (!response) {
    return null;
  }

  // Parse the response
  const parsedQuestion = parseClaudeResponse(response.content, template, request);
  if (!parsedQuestion) {
    return null;
  }

  // Create the generated question object
  const generatedQuestion: GeneratedQuestion = {
    ...parsedQuestion,
    id: generateQuestionId(),
    generationId: generateBatchId(),
    templateId: template.id,
    modelUsed: config.model,
    generatedAt: new Date(),
    generationTime,
    tokensUsed: {
      input: response.usage?.input_tokens || 0,
      output: response.usage?.output_tokens || 0
    },
    validationStatus: 'pending',
    humanReviewed: false,
    timesUsed: 0
  };

  return generatedQuestion;
}

/**
 * Build the prompt for Claude
 */
function buildPrompt(template: QuestionTemplate, request: GenerateQuestionRequest): string {
  const systemPrompt = `You are an expert LSAT question writer creating authentic ${request.sectionType.replace('_', ' ')} questions.

Your task is to generate a high-quality LSAT question following the exact format and difficulty level specified.

IMPORTANT GUIDELINES:
1. The question must be original and not copy existing LSAT questions
2. Maintain LSAT's formal, academic tone
3. Ensure exactly one answer choice is unambiguously correct
4. Create plausible distractors that test specific misconceptions
5. Match the specified difficulty level (${request.difficulty}/10)
6. Follow the exact JSON format for your response

For ${request.sectionType}:`;

  const sectionGuidelines = getSectionGuidelines(request.sectionType);

  const userPrompt = `Generate a ${request.sectionType.replace('_', ' ')} question at difficulty level ${request.difficulty}/10.

Template: ${template.templateName}
${request.topicFocus ? `Topic Focus: ${request.topicFocus}` : ''}
${request.avoidTopics ? `Avoid Topics: ${request.avoidTopics.join(', ')}` : ''}

Please provide your response in the following JSON format:
{
  "stimulus": "The main text/scenario for the question",
  "question": "The actual question being asked",
  "answerChoices": [
    {"label": "A", "text": "First answer choice", "isCorrect": false},
    {"label": "B", "text": "Second answer choice", "isCorrect": false},
    {"label": "C", "text": "Third answer choice", "isCorrect": true},
    {"label": "D", "text": "Fourth answer choice", "isCorrect": false},
    {"label": "E", "text": "Fifth answer choice", "isCorrect": false}
  ],
  "explanation": "Detailed explanation of why the correct answer is right and others are wrong",
  "difficulty": ${request.difficulty}
}`;

  return `${systemPrompt}\n${sectionGuidelines}\n\n${userPrompt}`;
}

/**
 * Get section-specific guidelines
 */
function getSectionGuidelines(sectionType: string): string {
  switch (sectionType) {
    case 'logical_reasoning':
      return `
- Arguments should be 50-150 words
- Focus on real-world scenarios from law, business, science, or public policy
- Test specific reasoning skills (assumptions, flaws, strengthening, weakening, etc.)
- Ensure answer choices are roughly equal in length
- Avoid overly technical or specialized knowledge`;

    case 'logic_games':
      return `
- Create a clear scenario with 5-8 entities
- Include 3-5 rules that create interesting deductions
- Ensure the game has exactly one valid solution path
- Questions should test different aspects of the game
- Avoid games that are too similar to famous LSAT games`;

    case 'reading_comprehension':
      return `
- Passages should be 350-550 words
- Use academic, legal, or scientific topics
- Include multiple viewpoints or arguments
- Questions should test comprehension, inference, and analysis
- Avoid passages requiring specialized knowledge`;

    default:
      return '';
  }
}

/**
 * Call Claude API with retry logic
 */
async function callClaudeWithRetry(
  prompt: string,
  config: ModelConfig
): Promise<any | null> {
  let lastError: any;

  for (let attempt = 1; attempt <= (config.maxRetries || 3); attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: config.model,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        content: message.content[0].type === 'text' ? message.content[0].text : '',
        usage: message.usage
      };
    } catch (error: any) {
      lastError = error;

      if (error.status === 429) {
        // Rate limit - wait longer
        const delay = (config.retryDelay || 1000) * Math.pow(config.backoffMultiplier || 2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error.status >= 500) {
        // Server error - retry with backoff
        const delay = (config.retryDelay || 1000) * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Client error - don't retry
        throw error;
      }
    }
  }

  console.error('Max retries exceeded:', lastError);
  return null;
}

/**
 * Parse Claude's response into a GeneratedQuestion
 */
function parseClaudeResponse(
  content: string,
  template: QuestionTemplate,
  request: GenerateQuestionRequest
): Partial<GeneratedQuestion> | null {
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Claude response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.stimulus || !parsed.question || !parsed.answerChoices || !parsed.explanation) {
      console.error('Missing required fields in Claude response');
      return null;
    }

    // Ensure exactly 5 answer choices
    if (parsed.answerChoices.length !== 5) {
      console.error('Invalid number of answer choices:', parsed.answerChoices.length);
      return null;
    }

    // Ensure exactly one correct answer
    const correctAnswers = parsed.answerChoices.filter((ac: any) => ac.isCorrect);
    if (correctAnswers.length !== 1) {
      console.error('Invalid number of correct answers:', correctAnswers.length);
      return null;
    }

    // Build the answer choices
    const answerChoices: AnswerChoice[] = parsed.answerChoices.map((ac: any, index: number) => ({
      id: generateAnswerId(),
      label: ac.label || String.fromCharCode(65 + index) as 'A' | 'B' | 'C' | 'D' | 'E',
      text: ac.text,
      isCorrect: ac.isCorrect,
      distractorType: ac.isCorrect ? undefined : determineDistractorType(ac.text)
    }));

    const correctAnswer = answerChoices.find(ac => ac.isCorrect)!;

    return {
      sectionType: request.sectionType,
      difficulty: parsed.difficulty || request.difficulty,
      stimulus: parsed.stimulus,
      question: parsed.question,
      answerChoices,
      correctAnswer: correctAnswer.id,
      explanation: parsed.explanation
    };
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    return null;
  }
}

/**
 * Determine the type of distractor
 */
function determineDistractorType(text: string): 'opposite' | 'partial' | 'misinterpretation' | 'irrelevant' {
  // Simple heuristic - in production, this would use more sophisticated analysis
  const lowerText = text.toLowerCase();

  if (lowerText.includes('not') || lowerText.includes('opposite')) {
    return 'opposite';
  } else if (lowerText.includes('some') || lowerText.includes('partial')) {
    return 'partial';
  } else if (lowerText.includes('assume') || lowerText.includes('interpret')) {
    return 'misinterpretation';
  } else {
    return 'irrelevant';
  }
}

/**
 * Generate unique IDs
 */
function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateAnswerId(): string {
  return `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate a generated question
 */
export function validateGeneratedQuestion(question: GeneratedQuestion): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check stimulus length
  if (question.stimulus.length < 20) {
    errors.push('Stimulus too short');
  }
  if (question.stimulus.length > 1000) {
    errors.push('Stimulus too long');
  }

  // Check question
  if (question.question.length < 5) {
    errors.push('Question too short');
  }

  // Check answer choices
  if (question.answerChoices.length !== 5) {
    errors.push('Must have exactly 5 answer choices');
  }

  const correctCount = question.answerChoices.filter(ac => ac.isCorrect).length;
  if (correctCount !== 1) {
    errors.push(`Must have exactly 1 correct answer, found ${correctCount}`);
  }

  // Check explanation
  if (question.explanation.length < 20) {
    errors.push('Explanation too short');
  }

  // Check difficulty
  if (question.difficulty < 1 || question.difficulty > 10) {
    errors.push('Difficulty must be between 1 and 10');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}