/**
 * MELLOWISE-011: Recommendation API Endpoints
 * Provides intelligent content recommendations via REST API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RecommendationService } from '@/lib/recommendations/recommendation-service';
import type { RecommendationRequest } from '@/types/recommendation';

const recommendationService = new RecommendationService();

/**
 * GET /api/recommendations
 * Get recommendations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionLength = searchParams.get('sessionLength');
    const maxItems = searchParams.get('maxItems');
    const goalType = searchParams.get('goalType') as 'practice' | 'review' | 'new_content' | undefined;

    // Get contextual factors from headers (if mobile app)
    const contextualFactors = {
      timeOfDay: new Date().getHours() < 12 ? 'morning' :
                 new Date().getHours() < 17 ? 'afternoon' : 'evening',
      device: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
    };

    // Build recommendation request
    const recommendationRequest: RecommendationRequest = {
      userId: user.id,
      sessionLength: sessionLength ? parseInt(sessionLength) : undefined,
      maxItems: maxItems ? parseInt(maxItems) : 10,
      goalType,
      contextualFactors
    };

    // Get recommendations
    const recommendations = await recommendationService.getRecommendations(recommendationRequest);

    // Log for analytics
    await supabase.from('recommendation_logs').insert({
      user_id: user.id,
      request: recommendationRequest,
      response_summary: {
        count: recommendations.recommendations.length,
        confidence: recommendations.metadata.confidenceScore,
        model_version: recommendations.metadata.modelVersion
      },
      created_at: new Date().toISOString()
    });

    return NextResponse.json(recommendations);

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/feedback
 * Submit feedback on a recommendation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate feedback structure
    if (!body.questionId || !body.recommendationId || !body.feedback) {
      return NextResponse.json(
        { error: 'Invalid feedback format' },
        { status: 400 }
      );
    }

    // Add user ID to feedback
    const feedback = {
      ...body,
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    // Submit feedback
    await recommendationService.submitFeedback(feedback);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}