/**
 * MELLOWISE-011: Study Plan API Endpoints
 * Manage personalized study plans and daily goals
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RecommendationService } from '@/lib/recommendations/recommendation-service';

const recommendationService = new RecommendationService();

/**
 * GET /api/study-plans
 * Get current study plan for user
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

    // Get current study plan
    const { data: studyPlans, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    const currentPlan = studyPlans?.[0] || null;

    // If no plan exists, generate one
    if (!currentPlan) {
      const recommendations = await recommendationService.getRecommendations({
        userId: user.id,
        maxItems: 50 // More items for comprehensive plan
      });

      return NextResponse.json({
        studyPlan: recommendations.studyPlan,
        isNew: true
      });
    }

    return NextResponse.json({
      studyPlan: currentPlan,
      isNew: false
    });

  } catch (error) {
    console.error('Study plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to get study plan' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/study-plans/progress
 * Update daily goal completion progress
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

    const body = await request.json();
    const { planId, date, progress } = body;

    // Validate request
    if (!planId || !date || !progress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update study plan progress
    const { error } = await supabase
      .from('study_plan_progress')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        date: date,
        completed_questions: progress.questionsCompleted || [],
        minutes_studied: progress.actualMinutes || 0,
        performance_score: progress.performanceScore || 0,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    // Check if plan needs adaptation based on progress
    await this.checkPlanAdaptation(user.id, planId, progress);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Study plan progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

/**
 * Check if study plan needs adaptation based on performance
 */
async function checkPlanAdaptation(userId: string, planId: string, progress: any) {
  // Simple adaptation logic - could be enhanced with ML
  if (progress.performanceScore < 0.6) {
    // Performance below 60% - might need easier content
    console.log(`User ${userId} struggling - consider easier recommendations`);
  } else if (progress.performanceScore > 0.9) {
    // Performance above 90% - might need harder content
    console.log(`User ${userId} excelling - consider harder recommendations`);
  }
}

/**
 * PUT /api/study-plans/goals
 * Update user study goals
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { targetScore, targetDate, studyHoursPerWeek, priorityTopics } = body;

    // Update user profile with new goals
    const { error } = await supabase
      .from('user_profiles')
      .update({
        target_score: targetScore,
        target_date: targetDate,
        study_hours_per_week: studyHoursPerWeek,
        priority_topics: priorityTopics,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Generate new study plan with updated goals
    const recommendations = await recommendationService.getRecommendations({
      userId: user.id,
      maxItems: 50
    });

    return NextResponse.json({
      success: true,
      newStudyPlan: recommendations.studyPlan
    });

  } catch (error) {
    console.error('Study goals API error:', error);
    return NextResponse.json(
      { error: 'Failed to update study goals' },
      { status: 500 }
    );
  }
}