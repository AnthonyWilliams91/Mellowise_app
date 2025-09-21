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
          errors.push(`Question ${question.id}: Processing failed`);\n        }\n      }\n\n      // Calculate actual costs\n      const actualTokens = generatedQuestions.reduce(\n        (acc, q) => ({\n          input: acc.input + q.tokensUsed.input,\n          output: acc.output + q.tokensUsed.output\n        }),\n        { input: 0, output: 0 }\n      );\n\n      const actualCost = Math.round(\n        (actualTokens.input * 0.015 + actualTokens.output * 0.075) / 1000 * 100\n      ); // Anthropic pricing in cents\n\n      const response: GenerateQuestionResponse = {\n        success: true,\n        questions: processedQuestions,\n        errors: errors.length > 0 ? errors : undefined,\n        cost: {\n          estimated: estimatedCost,\n          tokens: actualTokens\n        }\n      };\n\n      return NextResponse.json(response);\n\n    } catch (apiError: any) {\n      console.error('AI API Error:', apiError);\n      \n      if (apiError.status === 429) {\n        return NextResponse.json(\n          { \n            success: false, \n            errors: ['Rate limit exceeded. Please try again later.'],\n            estimatedTime: 60 // seconds\n          },\n          { status: 429 }\n        );\n      }\n\n      if (apiError.status === 401) {\n        return NextResponse.json(\n          { success: false, errors: ['AI service authentication failed'] },\n          { status: 503 }\n        );\n      }\n\n      return NextResponse.json(\n        { \n          success: false, \n          errors: ['AI generation service temporarily unavailable'],\n          cost: {\n            estimated: estimatedCost,\n            tokens: estimatedTokens\n          }\n        },\n        { status: 503 }\n      );\n    }\n\n  } catch (error) {\n    console.error('Generation API Error:', error);\n    return NextResponse.json(\n      { success: false, errors: ['Internal server error'] },\n      { status: 500 }\n    );\n  }\n}\n\n// GET endpoint for checking generation status and templates\nexport async function GET(request: NextRequest) {\n  const { searchParams } = new URL(request.url);\n  const action = searchParams.get('action');\n\n  try {\n    if (action === 'templates') {\n      // Return available templates\n      const { allTemplates } = await import('@/lib/question-generation/templates');\n      \n      const templateSummary = allTemplates.map(template => ({\n        id: template.id,\n        name: template.templateName,\n        sectionType: template.sectionType,\n        difficultyRange: template.difficulty_range,\n        topics: template.topics,\n        frequency: template.frequency,\n        successRate: template.successRate\n      }));\n\n      return NextResponse.json({\n        success: true,\n        templates: templateSummary\n      });\n    }\n\n    if (action === 'status') {\n      // Return service status\n      const hasApiKey = !!process.env.ANTHROPIC_API_KEY;\n      \n      return NextResponse.json({\n        success: true,\n        status: {\n          aiServiceConfigured: hasApiKey,\n          templatesLoaded: true,\n          validationRulesLoaded: true,\n          estimatedResponseTime: '3-5 seconds per question'\n        }\n      });\n    }\n\n    return NextResponse.json(\n      { success: false, errors: ['Invalid action parameter'] },\n      { status: 400 }\n    );\n\n  } catch (error) {\n    console.error('GET API Error:', error);\n    return NextResponse.json(\n      { success: false, errors: ['Failed to fetch data'] },\n      { status: 500 }\n    );\n  }\n}"