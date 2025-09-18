/**
 * MELLOWISE-016: Current Goal API Endpoint
 * Retrieve current active goal and analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { LSATGoal, GoalAnalyticsData } from '@/types/goals';

/**
 * GET /api/goals/current
 * Get current active goal and analytics for authenticated user
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

    // Get current active goal
    const { data: goals, error: goalError } = await supabase
      .from('lsat_goals')
      .select(`
        *,
        milestones (*),
        achievements (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (goalError) {
      throw goalError;
    }

    const currentGoal = goals?.[0] || null;

    if (!currentGoal) {
      return NextResponse.json({
        goal: null,
        analytics: null,
        hasGoal: false
      });
    }

    // Generate analytics data
    const analytics = await generateAnalyticsData(user.id, currentGoal.id, supabase);

    // Transform database goal to application format
    const transformedGoal: LSATGoal = {
      id: currentGoal.id,
      userId: currentGoal.user_id,
      targetScore: currentGoal.target_score,
      currentScore: currentGoal.current_score,
      targetDate: new Date(currentGoal.target_date),
      createdAt: new Date(currentGoal.created_at),
      updatedAt: new Date(currentGoal.updated_at),
      isActive: currentGoal.is_active,
      sectionGoals: currentGoal.section_goals || getDefaultSectionGoals(),
      studyHoursPerWeek: currentGoal.study_hours_per_week,
      preferredStudyTimes: currentGoal.preferred_study_times || [],
      milestones: currentGoal.milestones || [],
      achievements: currentGoal.achievements || [],
      predictedScore: currentGoal.predicted_score,
      confidenceLevel: currentGoal.confidence_level,
      recommendedAdjustments: currentGoal.recommended_adjustments || []
    };

    return NextResponse.json({
      goal: transformedGoal,
      analytics,
      hasGoal: true
    });

  } catch (error) {
    console.error('Current goal API error:', error);
    return NextResponse.json(
      { error: 'Failed to get current goal' },
      { status: 500 }
    );
  }
}

/**
 * Generate analytics data for a goal
 */
async function generateAnalyticsData(
  userId: string,
  goalId: string,
  supabase: any
): Promise<GoalAnalyticsData> {
  try {
    // Get progress snapshots
    const { data: snapshots } = await supabase
      .from('goal_progress_snapshots')
      .select('*')
      .eq('goal_id', goalId)
      .order('captured_at', { ascending: true })
      .limit(20);

    // Get study session data for time analysis
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Transform data into chart formats
    const progressTrend = (snapshots || []).map(snapshot => ({
      date: new Date(snapshot.captured_at).toLocaleDateString(),
      overall: snapshot.overall_score,
      logicalReasoning: snapshot.section_progress?.logicalReasoning?.score || 0,
      logicGames: snapshot.section_progress?.logicGames?.score || 0,
      readingComprehension: snapshot.section_progress?.readingComprehension?.score || 0,
      target: calculateTargetScore(snapshot.captured_at, goalId)
    }));

    // Calculate section accuracy from recent sessions
    const sectionAccuracy = calculateSectionAccuracy(sessions || []);

    // Analyze study time patterns
    const studyTimeAnalysis = calculateStudyTimeAnalysis(sessions || []);

    // Calculate milestone progress
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', goalId)
      .eq('is_completed', false);

    const milestoneProgress = (milestones || []).map(milestone => ({
      milestone: milestone.title,
      progress: milestone.current,
      target: milestone.target,
      daysRemaining: Math.ceil(
        (new Date(milestone.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      onTrack: milestone.current / milestone.target >= 0.5
    }));

    // Generate summary insights
    const summary = {
      daysToTarget: Math.ceil(
        (new Date().getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      currentTrajectory: 'on_track' as const,
      probabilityOfSuccess: 0.75,
      recommendedActions: [
        'Maintain consistent study schedule',
        'Focus on identified weak areas',
        'Review progress weekly'
      ]
    };

    return {
      progressTrend,
      sectionAccuracy,
      studyTimeAnalysis,
      milestoneProgress,
      summary
    };

  } catch (error) {
    console.error('Analytics generation error:', error);
    // Return default analytics structure
    return {
      progressTrend: [],
      sectionAccuracy: [],
      studyTimeAnalysis: [],
      milestoneProgress: [],
      summary: {
        daysToTarget: 90,
        currentTrajectory: 'on_track',
        probabilityOfSuccess: 0.5,
        recommendedActions: []
      }
    };
  }
}

/**
 * Calculate target score for a given date
 */
function calculateTargetScore(date: string, goalId: string): number {
  // Simplified linear progression calculation
  // In practice, this would use goal data and timeline
  const daysPassed = Math.floor(
    (new Date(date).getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)
  );
  return 145 + (daysPassed * 0.1); // Example progression
}

/**
 * Calculate section accuracy from session data
 */
function calculateSectionAccuracy(sessions: any[]) {
  const sectionStats = {
    'Logical Reasoning': { correct: 0, total: 0 },
    'Logic Games': { correct: 0, total: 0 },
    'Reading Comp': { correct: 0, total: 0 }
  };

  sessions.forEach(session => {
    if (session.session_questions) {
      session.session_questions.forEach((sq: any) => {
        const section = mapTopicToSection(sq.question?.topic);
        if (section && sectionStats[section]) {
          sectionStats[section].total++;
          if (sq.correct) {
            sectionStats[section].correct++;
          }
        }
      });
    }
  });

  return Object.entries(sectionStats).map(([topic, stats]) => ({
    topic,
    current: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    target: 85, // Default target
    improvement: 10 // Placeholder improvement
  }));
}

/**
 * Map question topic to LSAT section
 */
function mapTopicToSection(topic: string): string | null {
  if (!topic) return null;

  const topicLower = topic.toLowerCase();
  if (topicLower.includes('logical') || topicLower.includes('reasoning')) {
    return 'Logical Reasoning';
  }
  if (topicLower.includes('logic') || topicLower.includes('game')) {
    return 'Logic Games';
  }
  if (topicLower.includes('reading') || topicLower.includes('comprehension')) {
    return 'Reading Comp';
  }
  return null;
}

/**
 * Calculate study time analysis from sessions
 */
function calculateStudyTimeAnalysis(sessions: any[]) {
  // Group sessions by week
  const weeklyData: { [week: string]: { planned: number; actual: number } } = {};

  sessions.forEach(session => {
    const sessionDate = new Date(session.created_at);
    const weekStart = new Date(sessionDate);
    weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
    const weekKey = `Week ${Math.ceil(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000))}`;

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { planned: 15, actual: 0 }; // 15 hours planned per week
    }

    weeklyData[weekKey].actual += (session.duration_minutes || 0) / 60;
  });

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    planned: data.planned,
    actual: Math.round(data.actual * 10) / 10,
    efficiency: Math.round((data.actual / data.planned) * 100)
  }));
}

/**
 * Get default section goals structure
 */
function getDefaultSectionGoals() {
  return {
    logicalReasoning: {
      sectionName: 'logicalReasoning' as const,
      targetScore: 24,
      currentScore: 20,
      questionsCorrect: 0,
      questionsTotal: 0,
      accuracy: 0,
      averageTime: 0,
      targetTime: 75,
      currentDifficulty: 5,
      targetDifficulty: 7,
      focusAreas: [],
      weakTopics: [],
      strongTopics: []
    },
    logicGames: {
      sectionName: 'logicGames' as const,
      targetScore: 22,
      currentScore: 18,
      questionsCorrect: 0,
      questionsTotal: 0,
      accuracy: 0,
      averageTime: 0,
      targetTime: 90,
      currentDifficulty: 5,
      targetDifficulty: 7,
      focusAreas: [],
      weakTopics: [],
      strongTopics: []
    },
    readingComprehension: {
      sectionName: 'readingComprehension' as const,
      targetScore: 25,
      currentScore: 22,
      questionsCorrect: 0,
      questionsTotal: 0,
      accuracy: 0,
      averageTime: 0,
      targetTime: 85,
      currentDifficulty: 5,
      targetDifficulty: 7,
      focusAreas: [],
      weakTopics: [],
      strongTopics: []
    }
  };
}