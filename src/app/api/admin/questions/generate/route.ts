/**
 * MELLOWISE-013: Question Generation API Endpoint
 * API endpoint for generating LSAT questions using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions, validateGeneratedQuestion } from '@/lib/question-generation/claude-service';
import { validateQuestion, autoFixQuestion } from '@/lib/question-generation/quality-assurance';
import {
  GenerateQuestionRequest,
  GenerateQuestionResponse,
  GeneratedQuestion
} from '@/types/question-generation';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionRequest = await request.json();

    // Validate request
    if (!body.sectionType || !body.difficulty || !body.quantity) {
      return NextResponse.json(
        { success: false, errors: ['Missing required fields: sectionType, difficulty, quantity'] },
        { status: 400 }
      );
    }

    if (body.difficulty < 1 || body.difficulty > 10) {
      return NextResponse.json(
        { success: false, errors: ['Difficulty must be between 1 and 10'] },
        { status: 400 }
      );
    }

    if (body.quantity < 1 || body.quantity > 20) {
      return NextResponse.json(
        { success: false, errors: ['Quantity must be between 1 and 20'] },
        { status: 400 }
      );
    }

    // Check for ANTHROPIC_API_KEY
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, errors: ['AI service not configured'] },
        { status: 503 }
      );
    }

    // Estimate cost
    const estimatedCost = body.quantity * 12; // 12 cents per question
    const estimatedTokens = {
      input: body.quantity * 500, // Estimated input tokens per question
      output: body.quantity * 400  // Estimated output tokens per question
    };

    try {
      // Generate questions using Claude
      const generatedQuestions = await generateQuestions(body);

      if (generatedQuestions.length === 0) {
        return NextResponse.json({
          success: false,
          errors: ['Failed to generate any questions'],
          cost: {
            estimated: estimatedCost,
            tokens: estimatedTokens
          }
        });
      }

      // Validate and auto-fix questions
      const processedQuestions: GeneratedQuestion[] = [];
      const errors: string[] = [];

      for (const question of generatedQuestions) {
        try {
          // Basic validation
          const basicValidation = validateGeneratedQuestion(question);
          if (!basicValidation.isValid) {
            // Try to auto-fix
            const fixed = autoFixQuestion(question);
            const fixedValidation = validateGeneratedQuestion(fixed);

            if (fixedValidation.isValid) {
              // Run quality validation
              const qualityValidation = validateQuestion(fixed);
              fixed.qualityScore = qualityValidation.overallScore;
              fixed.validationStatus = qualityValidation.passed ? 'approved' : 'needs_review';
              processedQuestions.push(fixed);
            } else {
              errors.push(`Question ${question.id}: ${fixedValidation.errors.join(', ')}`);
            }
          } else {
            // Run quality validation on original
            const qualityValidation = validateQuestion(question);
            question.qualityScore = qualityValidation.overallScore;
            question.validationStatus = qualityValidation.passed ? 'approved' : 'needs_review';
            processedQuestions.push(question);
          }
        } catch (error) {
          errors.push(`Question ${question.id}: Processing failed`);
        }
      }

      // Calculate actual costs
      const actualTokens = generatedQuestions.reduce(
        (acc, q) => ({
          input: acc.input + q.tokensUsed.input,
          output: acc.output + q.tokensUsed.output
        }),
        { input: 0, output: 0 }
      );

      const actualCost = Math.round(
        (actualTokens.input * 0.015 + actualTokens.output * 0.075) / 1000 * 100
      ); // Anthropic pricing in cents

      const response: GenerateQuestionResponse = {
        success: true,
        questions: processedQuestions,
        errors: errors.length > 0 ? errors : undefined,
        cost: {
          estimated: estimatedCost,
          tokens: actualTokens
        }
      };

      return NextResponse.json(response);

    } catch (apiError: any) {
      console.error('AI API Error:', apiError);

      if (apiError.status === 429) {
        return NextResponse.json(
          {
            success: false,
            errors: ['Rate limit exceeded. Please try again later.'],
            estimatedTime: 60 // seconds
          },
          { status: 429 }
        );
      }

      if (apiError.status === 401) {
        return NextResponse.json(
          { success: false, errors: ['AI service authentication failed'] },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          errors: ['AI generation service temporarily unavailable'],
          cost: {
            estimated: estimatedCost,
            tokens: estimatedTokens
          }
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Generation API Error:', error);
    return NextResponse.json(
      { success: false, errors: ['Internal server error'] },
      { status: 500 }
    );
  }
}

// GET endpoint for checking generation status and templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'templates') {
      // Return available templates
      const { allTemplates } = await import('@/lib/question-generation/templates');

      const templateSummary = allTemplates.map(template => ({
        id: template.id,
        name: template.templateName,
        sectionType: template.sectionType,
        difficultyRange: template.difficulty_range,
        topics: template.topics,
        frequency: template.frequency,
        successRate: template.successRate
      }));

      return NextResponse.json({
        success: true,
        templates: templateSummary
      });
    }

    if (action === 'status') {
      // Return service status
      const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

      return NextResponse.json({
        success: true,
        status: {
          aiServiceConfigured: hasApiKey,
          templatesLoaded: true,
          validationRulesLoaded: true,
          estimatedResponseTime: '3-5 seconds per question'
        }
      });
    }

    return NextResponse.json(
      { success: false, errors: ['Invalid action parameter'] },
      { status: 400 }
    );

  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json(
      { success: false, errors: ['Failed to fetch data'] },
      { status: 500 }
    );
  }
}