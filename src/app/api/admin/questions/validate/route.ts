/**
 * MELLOWISE-013: Question Validation API Endpoint
 * API endpoint for validating generated questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateQuestion, batchValidate } from '@/lib/question-generation/quality-assurance';
import { GeneratedQuestion, QualityValidation } from '@/types/question-generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.questionId && body.question) {
      // Single question validation
      const question: GeneratedQuestion = body.question;

      // Validate the question structure first
      if (!question.id || !question.sectionType || !question.stimulus ||
          !question.question || !question.answerChoices || !question.explanation) {
        return NextResponse.json(
          {
            success: false,
            errors: ['Invalid question structure - missing required fields']
          },
          { status: 400 }
        );
      }

      if (question.answerChoices.length !== 5) {
        return NextResponse.json(
          {
            success: false,
            errors: ['Question must have exactly 5 answer choices']
          },
          { status: 400 }
        );
      }

      const correctAnswers = question.answerChoices.filter(ac => ac.isCorrect);
      if (correctAnswers.length !== 1) {
        return NextResponse.json(
          {
            success: false,
            errors: [`Question must have exactly 1 correct answer, found ${correctAnswers.length}`]
          },
          { status: 400 }
        );
      }

      // Run quality validation
      const validation = validateQuestion(question);

      return NextResponse.json({
        success: true,
        validation,
        questionId: question.id
      });

    } else if (body.questions && Array.isArray(body.questions)) {
      // Batch validation
      const questions: GeneratedQuestion[] = body.questions;

      if (questions.length === 0) {
        return NextResponse.json(
          { success: false, errors: ['No questions provided for validation'] },
          { status: 400 }
        );
      }

      if (questions.length > 50) {
        return NextResponse.json(
          { success: false, errors: ['Maximum 50 questions allowed per batch validation'] },
          { status: 400 }
        );
      }

      // Validate each question structure
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.id || !question.sectionType || !question.stimulus ||
            !question.question || !question.answerChoices || !question.explanation) {
          return NextResponse.json(
            {
              success: false,
              errors: [`Question ${i + 1}: Invalid structure - missing required fields`]
            },
            { status: 400 }
          );
        }
      }

      // Run batch validation
      const batchResult = batchValidate(questions);

      return NextResponse.json({
        success: true,
        batchValidation: batchResult,
        totalQuestions: questions.length
      });

    } else {
      return NextResponse.json(
        {
          success: false,
          errors: ['Request must contain either a single question or array of questions']
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Validation API Error:', error);
    return NextResponse.json(
      { success: false, errors: ['Internal validation error'] },
      { status: 500 }
    );
  }
}

// GET endpoint for validation rules and statistics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'rules') {
      // Return available validation rules
      const { allValidationRules } = await import('@/lib/question-generation/quality-assurance');

      const ruleSummary = allValidationRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        severity: rule.severity,
        description: rule.name // Could be expanded with descriptions
      }));

      return NextResponse.json({
        success: true,
        rules: ruleSummary,
        ruleCount: ruleSummary.length
      });
    }

    if (action === 'stats') {
      // Return validation statistics (mock data for now)
      const stats = {
        totalValidated: 245,
        passRate: 0.81,
        averageScore: 82,
        commonIssues: [
          { issue: 'Answer choice length imbalance', frequency: 0.15 },
          { issue: 'Explanation too brief', frequency: 0.12 },
          { issue: 'Potential ambiguity', frequency: 0.08 },
          { issue: 'Difficulty mismatch', frequency: 0.06 }
        ],
        scoreDistribution: {
          '90-100': 25,
          '80-89': 45,
          '70-79': 20,
          '60-69': 8,
          'below-60': 2
        }
      };

      return NextResponse.json({
        success: true,
        validationStats: stats
      });
    }

    return NextResponse.json(
      { success: false, errors: ['Invalid action parameter'] },
      { status: 400 }
    );

  } catch (error) {
    console.error('GET Validation API Error:', error);
    return NextResponse.json(
      { success: false, errors: ['Failed to fetch validation data'] },
      { status: 500 }
    );
  }
}