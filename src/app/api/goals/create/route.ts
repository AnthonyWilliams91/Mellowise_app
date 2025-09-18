/**
 * MELLOWISE-016: Goal Creation API Endpoint
 * Create new LSAT goals with intelligent defaults and study plan generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { CreateGoalRequest } from '@/types/goals';

/**
 * POST /api/goals/create
 * Create a new LSAT goal for authenticated user
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
    const body: CreateGoalRequest = await request.json();

    // Validate request
    if (!body.targetScore || !body.targetDate || !body.studyHoursPerWeek) {
      return NextResponse.json(
        { error: 'Missing required fields: targetScore, targetDate, studyHoursPerWeek' },
        { status: 400 }
      );
    }

    // Validate target score range
    if (body.targetScore < 120 || body.targetScore > 180) {
      return NextResponse.json(
        { error: 'Target score must be between 120 and 180' },
        { status: 400 }
      );
    }

    // Get user's current performance data
    const currentPerformance = await getCurrentPerformance(user.id, supabase);

    // Deactivate any existing active goals
    await supabase
      .from('lsat_goals')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Generate section goals based on priorities and current performance
    const sectionGoals = generateSectionGoals(body, currentPerformance);

    // Create the new goal
    const goalId = crypto.randomUUID();
    const { data: goal, error: createError } = await supabase
      .from('lsat_goals')
      .insert({
        id: goalId,
        user_id: user.id,
        target_score: body.targetScore,
        current_score: currentPerformance.overallScore,
        target_date: body.targetDate,
        study_hours_per_week: body.studyHoursPerWeek,
        preferred_study_times: body.preferredStudyTimes,
        section_goals: sectionGoals,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Generate initial milestones
    const milestones = await generateInitialMilestones(goalId, body, currentPerformance);

    if (milestones.length > 0) {
      await supabase
        .from('milestones')
        .insert(milestones);
    }

    // Generate study plan
    const studyPlan = await generateStudyPlan(goalId, body, currentPerformance, supabase);

    // Create initial progress snapshot
    await createInitialProgressSnapshot(goalId, user.id, currentPerformance, supabase);

    // Generate AI predictions
    const predictions = await generateGoalPredictions(goalId, body, currentPerformance);

    // Update goal with predictions
    await supabase
      .from('lsat_goals')
      .update({
        predicted_score: predictions.predictedScore,
        confidence_level: predictions.confidenceLevel,
        recommended_adjustments: predictions.recommendedAdjustments
      })
      .eq('id', goalId);

    return NextResponse.json({
      success: true,
      goalId,
      goal,
      studyPlan,
      predictions,
      message: 'Goal created successfully with personalized study plan'
    });

  } catch (error) {
    console.error('Goal creation API error:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

/**
 * Get user's current performance data
 */
async function getCurrentPerformance(userId: string, supabase: any) {
  try {
    // Get recent study sessions
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select(`
        *,
        session_questions (
          correct,
          time_spent,
          question:questions (
            difficulty,
            topic,
            subtopic
          )
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (!sessions || sessions.length === 0) {
      return {
        overallScore: 145, // Default starting score
        sectionPerformance: {
          logicalReasoning: { accuracy: 0.6, averageTime: 90, questionsAnswered: 0 },
          logicGames: { accuracy: 0.55, averageTime: 120, questionsAnswered: 0 },
          readingComprehension: { accuracy: 0.65, averageTime: 95, questionsAnswered: 0 }
        },
        totalQuestionsAnswered: 0,
        studyHours: 0
      };
    }

    // Analyze performance by section
    const sectionStats = {
      logicalReasoning: { correct: 0, total: 0, totalTime: 0 },
      logicGames: { correct: 0, total: 0, totalTime: 0 },
      readingComprehension: { correct: 0, total: 0, totalTime: 0 }
    };

    let totalQuestions = 0;
    let totalStudyTime = 0;

    sessions.forEach(session => {
      totalStudyTime += session.duration_minutes || 0;

      if (session.session_questions) {
        session.session_questions.forEach((sq: any) => {
          const section = mapTopicToSectionKey(sq.question?.topic);
          if (section && sectionStats[section]) {
            sectionStats[section].total++;
            sectionStats[section].totalTime += sq.time_spent || 0;
            if (sq.correct) {
              sectionStats[section].correct++;
            }
            totalQuestions++;
          }
        });
      }
    });

    // Calculate section performance
    const sectionPerformance = Object.entries(sectionStats).reduce((acc, [section, stats]) => {
      acc[section as keyof typeof acc] = {
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0.6,
        averageTime: stats.total > 0 ? stats.totalTime / stats.total : 90,
        questionsAnswered: stats.total
      };
      return acc;
    }, {} as any);

    // Estimate overall score based on section performance
    const overallAccuracy = totalQuestions > 0
      ? Object.values(sectionStats).reduce((sum, stats) => sum + stats.correct, 0) / totalQuestions
      : 0.6;

    const overallScore = Math.round(120 + (overallAccuracy * 60)); // Rough LSAT score estimate

    return {
      overallScore,
      sectionPerformance,
      totalQuestionsAnswered: totalQuestions,
      studyHours: Math.round(totalStudyTime / 60)
    };

  } catch (error) {
    console.error('Error getting current performance:', error);
    return {
      overallScore: 145,
      sectionPerformance: {
        logicalReasoning: { accuracy: 0.6, averageTime: 90, questionsAnswered: 0 },
        logicGames: { accuracy: 0.55, averageTime: 120, questionsAnswered: 0 },
        readingComprehension: { accuracy: 0.65, averageTime: 95, questionsAnswered: 0 }
      },
      totalQuestionsAnswered: 0,
      studyHours: 0
    };
  }
}

/**
 * Generate section-specific goals based on priorities and current performance
 */
function generateSectionGoals(request: CreateGoalRequest, currentPerformance: any) {
  const scoreImprovement = request.targetScore - currentPerformance.overallScore;
  const improvementPerSection = Math.round(scoreImprovement / 3);

  return {
    logicalReasoning: {
      sectionName: 'logicalReasoning',
      targetScore: Math.min(27, currentPerformance.sectionPerformance.logicalReasoning.questionsAnswered + improvementPerSection),
      currentScore: currentPerformance.sectionPerformance.logicalReasoning.questionsAnswered,
      questionsCorrect: Math.round(currentPerformance.sectionPerformance.logicalReasoning.questionsAnswered * currentPerformance.sectionPerformance.logicalReasoning.accuracy),
      questionsTotal: currentPerformance.sectionPerformance.logicalReasoning.questionsAnswered,
      accuracy: currentPerformance.sectionPerformance.logicalReasoning.accuracy,
      averageTime: currentPerformance.sectionPerformance.logicalReasoning.averageTime,
      targetTime: Math.max(60, currentPerformance.sectionPerformance.logicalReasoning.averageTime - 15),
      currentDifficulty: estimateDifficultyLevel(currentPerformance.sectionPerformance.logicalReasoning.accuracy),
      targetDifficulty: Math.min(9, estimateDifficultyLevel(currentPerformance.sectionPerformance.logicalReasoning.accuracy) + 2),
      focusAreas: ['assumption', 'strengthen', 'weaken'],
      weakTopics: [],
      strongTopics: []
    },
    logicGames: {
      sectionName: 'logicGames',
      targetScore: Math.min(23, currentPerformance.sectionPerformance.logicGames.questionsAnswered + improvementPerSection),
      currentScore: currentPerformance.sectionPerformance.logicGames.questionsAnswered,
      questionsCorrect: Math.round(currentPerformance.sectionPerformance.logicGames.questionsAnswered * currentPerformance.sectionPerformance.logicGames.accuracy),
      questionsTotal: currentPerformance.sectionPerformance.logicGames.questionsAnswered,
      accuracy: currentPerformance.sectionPerformance.logicGames.accuracy,
      averageTime: currentPerformance.sectionPerformance.logicGames.averageTime,
      targetTime: Math.max(75, currentPerformance.sectionPerformance.logicGames.averageTime - 20),
      currentDifficulty: estimateDifficultyLevel(currentPerformance.sectionPerformance.logicGames.accuracy),
      targetDifficulty: Math.min(9, estimateDifficultyLevel(currentPerformance.sectionPerformance.logicGames.accuracy) + 2),
      focusAreas: ['sequencing', 'grouping', 'matching'],
      weakTopics: [],
      strongTopics: []
    },
    readingComprehension: {
      sectionName: 'readingComprehension',
      targetScore: Math.min(27, currentPerformance.sectionPerformance.readingComprehension.questionsAnswered + improvementPerSection),
      currentScore: currentPerformance.sectionPerformance.readingComprehension.questionsAnswered,
      questionsCorrect: Math.round(currentPerformance.sectionPerformance.readingComprehension.questionsAnswered * currentPerformance.sectionPerformance.readingComprehension.accuracy),
      questionsTotal: currentPerformance.sectionPerformance.readingComprehension.questionsAnswered,
      accuracy: currentPerformance.sectionPerformance.readingComprehension.accuracy,
      averageTime: currentPerformance.sectionPerformance.readingComprehension.averageTime,
      targetTime: Math.max(70, currentPerformance.sectionPerformance.readingComprehension.averageTime - 10),
      currentDifficulty: estimateDifficultyLevel(currentPerformance.sectionPerformance.readingComprehension.accuracy),
      targetDifficulty: Math.min(9, estimateDifficultyLevel(currentPerformance.sectionPerformance.readingComprehension.accuracy) + 2),
      focusAreas: ['main point', 'inference', 'strengthen'],
      weakTopics: [],
      strongTopics: []
    }
  };
}

/**
 * Generate initial milestones for the goal
 */
async function generateInitialMilestones(goalId: string, request: CreateGoalRequest, currentPerformance: any) {
  const targetDate = new Date(request.targetDate);
  const timeToTarget = targetDate.getTime() - Date.now();
  const weeksToTarget = Math.max(1, Math.floor(timeToTarget / (7 * 24 * 60 * 60 * 1000)));

  const milestones = [];

  // Milestone 1: First accuracy improvement (25% of timeline)
  const milestone1Date = new Date(Date.now() + (timeToTarget * 0.25));
  milestones.push({
    id: crypto.randomUUID(),
    goal_id: goalId,
    title: 'Accuracy Boost',
    description: 'Improve overall accuracy by 10%',
    target_date: milestone1Date.toISOString(),
    type: 'accuracy',
    target: Math.round((currentPerformance.overallScore * 1.1)),
    current: currentPerformance.overallScore,
    is_completed: false,
    created_at: new Date().toISOString()
  });

  // Milestone 2: Mid-point score target (50% of timeline)
  const milestone2Date = new Date(Date.now() + (timeToTarget * 0.5));
  const midpointScore = currentPerformance.overallScore + ((request.targetScore - currentPerformance.overallScore) * 0.5);
  milestones.push({
    id: crypto.randomUUID(),
    goal_id: goalId,
    title: 'Halfway Point',
    description: `Reach ${Math.round(midpointScore)} score`,
    target_date: milestone2Date.toISOString(),
    type: 'score',
    target: Math.round(midpointScore),
    current: currentPerformance.overallScore,
    is_completed: false,
    created_at: new Date().toISOString()
  });

  // Milestone 3: Speed improvement (75% of timeline)
  const milestone3Date = new Date(Date.now() + (timeToTarget * 0.75));
  milestones.push({
    id: crypto.randomUUID(),
    goal_id: goalId,
    title: 'Speed Mastery',
    description: 'Complete practice sections within time limits',
    target_date: milestone3Date.toISOString(),
    type: 'speed',
    target: 100, // 100% of questions within time limit
    current: 60, // Assume 60% starting efficiency
    is_completed: false,
    created_at: new Date().toISOString()
  });

  return milestones;
}

/**
 * Generate study plan for the goal
 */
async function generateStudyPlan(goalId: string, request: CreateGoalRequest, currentPerformance: any, supabase: any) {
  const studyPlanId = crypto.randomUUID();
  const targetDate = new Date(request.targetDate);
  const weeksToTarget = Math.max(1, Math.floor((targetDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)));

  const studyPlan = {
    id: studyPlanId,
    goal_id: goalId,
    user_id: request.userId || '',
    generated_at: new Date().toISOString(),
    is_active: true,
    target_date: request.targetDate,
    available_hours_per_week: request.studyHoursPerWeek,
    current_level: currentPerformance.overallScore,
    target_level: request.targetScore,
    weekly_schedule: generateWeeklySchedule(weeksToTarget, request.studyHoursPerWeek, currentPerformance),
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('study_plans')
    .insert(studyPlan)
    .select()
    .single();

  if (error) {
    console.error('Study plan creation error:', error);
  }

  return data || studyPlan;
}

/**
 * Generate weekly schedule for study plan
 */
function generateWeeklySchedule(weeks: number, hoursPerWeek: number, currentPerformance: any) {
  const schedule = [];

  for (let week = 1; week <= Math.min(weeks, 12); week++) { // Limit to 12 weeks for initial plan
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + ((week - 1) * 7));

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Adjust emphasis based on performance
    const sectionEmphasis = calculateSectionEmphasis(currentPerformance, week, weeks);

    schedule.push({
      week_number: week,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      total_hours: hoursPerWeek,
      section_emphasis: sectionEmphasis,
      weekly_targets: {
        questions_to_complete: Math.round(hoursPerWeek * 4), // ~4 questions per hour
        accuracy_target: Math.min(0.9, 0.6 + (week / weeks) * 0.3), // Gradual improvement
        new_topics_to_master: Math.max(1, Math.floor(3 - (week / weeks) * 2)),
        review_topics: Math.min(5, week)
      }
    });
  }

  return schedule;
}

/**
 * Calculate section emphasis based on performance and timeline
 */
function calculateSectionEmphasis(currentPerformance: any, week: number, totalWeeks: number) {
  const { sectionPerformance } = currentPerformance;

  // Early weeks: focus on weakest areas
  // Later weeks: balanced review with emphasis on strengths
  const progressRatio = week / totalWeeks;

  let emphasis = {
    logicalReasoning: 0.4, // Default higher weight
    logicGames: 0.3,
    readingComprehension: 0.3
  };

  if (progressRatio < 0.5) {
    // Early phase: focus on weakest section
    const weakestSection = Object.entries(sectionPerformance).reduce((weakest, [section, perf]: [string, any]) => {
      return perf.accuracy < sectionPerformance[weakest].accuracy ? section : weakest;
    }, 'logicalReasoning');

    emphasis = {
      logicalReasoning: weakestSection === 'logicalReasoning' ? 0.5 : 0.25,
      logicGames: weakestSection === 'logicGames' ? 0.5 : 0.25,
      readingComprehension: weakestSection === 'readingComprehension' ? 0.5 : 0.25
    };
  }

  return emphasis;
}

/**
 * Create initial progress snapshot
 */
async function createInitialProgressSnapshot(goalId: string, userId: string, currentPerformance: any, supabase: any) {
  const snapshot = {
    id: crypto.randomUUID(),
    goal_id: goalId,
    user_id: userId,
    captured_at: new Date().toISOString(),
    overall_score: currentPerformance.overallScore,
    total_questions_answered: currentPerformance.totalQuestionsAnswered,
    total_study_time: currentPerformance.studyHours * 60, // Convert to minutes
    section_progress: currentPerformance.sectionPerformance,
    learning_velocity: 0,
    difficulty_progression: 5,
    retention_rate: 0.8,
    study_streak_days: 0,
    average_session_length: 60,
    peak_performance_time: 'morning'
  };

  await supabase
    .from('goal_progress_snapshots')
    .insert(snapshot);
}

/**
 * Generate goal predictions using AI/ML
 */
async function generateGoalPredictions(goalId: string, request: CreateGoalRequest, currentPerformance: any) {
  // Simplified prediction algorithm
  // In practice, this would use ML models from MELLOWISE-011

  const scoreGap = request.targetScore - currentPerformance.overallScore;
  const timeToTarget = new Date(request.targetDate).getTime() - Date.now();
  const weeksToTarget = timeToTarget / (7 * 24 * 60 * 60 * 1000);

  // Calculate predicted score based on study hours and current performance
  const studyIntensity = request.studyHoursPerWeek / 20; // Normalize to 0-1 scale
  const improvementRate = studyIntensity * 0.5; // Simplified improvement rate
  const predictedImprovement = improvementRate * weeksToTarget * 2; // Points per week

  const predictedScore = Math.min(180, currentPerformance.overallScore + predictedImprovement);
  const successProbability = predictedScore >= request.targetScore ? 0.8 : 0.6;

  const recommendedAdjustments = [];
  if (predictedScore < request.targetScore) {
    recommendedAdjustments.push('Consider increasing study hours per week');
    recommendedAdjustments.push('Focus on weakest section for maximum improvement');
  }
  if (weeksToTarget < 8) {
    recommendedAdjustments.push('Timeline may be aggressive - consider extending target date');
  }

  return {
    predictedScore: Math.round(predictedScore),
    confidenceLevel: successProbability,
    recommendedAdjustments
  };
}

/**
 * Helper functions
 */
function mapTopicToSectionKey(topic: string): string | null {
  if (!topic) return null;

  const topicLower = topic.toLowerCase();
  if (topicLower.includes('logical') || topicLower.includes('reasoning')) {
    return 'logicalReasoning';
  }
  if (topicLower.includes('logic') || topicLower.includes('game')) {
    return 'logicGames';
  }
  if (topicLower.includes('reading') || topicLower.includes('comprehension')) {
    return 'readingComprehension';
  }
  return null;
}

function estimateDifficultyLevel(accuracy: number): number {
  if (accuracy >= 0.9) return 8;
  if (accuracy >= 0.8) return 7;
  if (accuracy >= 0.7) return 6;
  if (accuracy >= 0.6) return 5;
  if (accuracy >= 0.5) return 4;
  return 3;
}