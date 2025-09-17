/**
 * MELLOWISE-011: Intelligent Content Recommendation Service
 * Orchestrates recommendations using ML models and existing systems
 */

import { supabase } from '@/lib/supabase';
import type {
  RecommendationRequest,
  RecommendationResponse,
  RecommendedItem,
  RecommendationContext,
  StudyPlan,
  DailyStudyGoal,
  SpacedRepetitionSchedule,
  RecommendationFeedback
} from '@/types/recommendation';
import { getLearningStyle } from '@/lib/learning-style-classifier';
import { DynamicDifficultyService } from '@/lib/practice/dynamic-difficulty-service';
import { PerformanceAnalyzer } from './performance-analyzer';

export class RecommendationService {
  private mlEndpoint: string;
  private difficultyService: DynamicDifficultyService;
  private performanceAnalyzer: PerformanceAnalyzer;

  constructor() {
    // WSL2 ML service endpoint
    this.mlEndpoint = process.env.NEXT_PUBLIC_ML_ENDPOINT || 'http://localhost:8000';
    this.difficultyService = new DynamicDifficultyService();
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      // 1. Gather user context
      const context = await this.getUserContext(request.userId);

      // 2. Get ML recommendations from RecBole model
      const mlRecommendations = await this.fetchMLRecommendations(request, context);

      // 3. Apply business logic and filters
      const filteredRecommendations = await this.applyBusinessLogic(
        mlRecommendations,
        context,
        request
      );

      // 4. Generate or update study plan
      const studyPlan = await this.generateStudyPlan(
        request.userId,
        filteredRecommendations,
        context
      );

      // 5. Determine session suggestions
      const sessionSuggestion = this.calculateSessionSuggestion(
        filteredRecommendations,
        context,
        request
      );

      return {
        recommendations: filteredRecommendations,
        studyPlan,
        sessionSuggestion,
        metadata: {
          modelVersion: '1.0.0-sasrec',
          generatedAt: new Date(),
          confidenceScore: this.calculateConfidence(filteredRecommendations),
          dataRecency: new Date() // TODO: Get from ML service
        }
      };
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      // Fallback to rule-based recommendations
      return this.getFallbackRecommendations(request);
    }
  }

  /**
   * Gather comprehensive user context from existing systems
   */
  private async getUserContext(userId: string): Promise<RecommendationContext> {
    // Fetch learning style (MELLOWISE-009)
    const learningProfile = await getLearningStyle(userId);

    // Get difficulty profile (MELLOWISE-010)
    const difficultyProfile = await this.difficultyService.getUserDifficultyProfile(userId);

    // Get performance insights (MELLOWISE-012)
    const performanceInsights = await this.performanceAnalyzer.getInsights(userId);

    // Get user goals
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('target_score, target_date, study_hours_per_week, priority_topics')
      .eq('user_id', userId)
      .single();

    return {
      learningStyle: learningProfile?.dimensions || {
        visual: 0.5,
        verbal: 0.5,
        sequential: 0.5,
        global: 0.5,
        active: 0.5,
        reflective: 0.5
      },
      difficultyProfile: {
        currentLevel: difficultyProfile?.currentLevel || 5,
        optimalChallenge: difficultyProfile?.optimalChallenge || 0.75,
        adaptationRate: difficultyProfile?.adaptationRate || 0.1,
        topicDifficulties: new Map(Object.entries(difficultyProfile?.topicLevels || {}))
      },
      performanceInsights: {
        strengths: performanceInsights?.strengths || [],
        weaknesses: performanceInsights?.weaknesses || [],
        recentTrends: performanceInsights?.trends || {
          improving: [],
          declining: []
        },
        optimalTimeOfDay: performanceInsights?.optimalTimes || ['morning']
      },
      userGoals: {
        targetScore: userData?.target_score || 160,
        targetDate: new Date(userData?.target_date || Date.now() + 90 * 24 * 60 * 60 * 1000),
        studyHoursPerWeek: userData?.study_hours_per_week || 10,
        priorityTopics: userData?.priority_topics || []
      }
    };
  }

  /**
   * Fetch recommendations from ML service (RecBole on WSL2)
   */
  private async fetchMLRecommendations(
    request: RecommendationRequest,
    context: RecommendationContext
  ): Promise<RecommendedItem[]> {
    try {
      const response = await fetch(`${this.mlEndpoint}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: request.userId,
          n_recommendations: request.maxItems || 20,
          features: {
            learning_style: context.learningStyle,
            difficulty_profile: {
              current: context.difficultyProfile.currentLevel,
              optimal: context.difficultyProfile.optimalChallenge
            },
            performance: {
              weaknesses: context.performanceInsights.weaknesses,
              strengths: context.performanceInsights.strengths
            },
            contextual: request.contextualFactors
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ML service error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMLResponse(data.recommendations, context);
    } catch (error) {
      console.error('ML service unavailable:', error);
      // Fallback to collaborative filtering
      return this.getCollaborativeFilteringRecommendations(request.userId, context);
    }
  }

  /**
   * Transform ML model output to application format
   */
  private transformMLResponse(
    mlRecommendations: any[],
    context: RecommendationContext
  ): RecommendedItem[] {
    return mlRecommendations.map(rec => ({
      questionId: rec.item_id,
      score: rec.score,
      reason: this.determineReason(rec, context),
      expectedDifficulty: this.calculateExpectedDifficulty(rec, context),
      estimatedTime: rec.estimated_time || 2,
      topicPath: rec.topic_path || [],
      prerequisites: rec.prerequisites || [],
      reviewOptimal: this.isReviewOptimal(rec.item_id, context)
    }));
  }

  /**
   * Apply business logic filters and adjustments
   */
  private async applyBusinessLogic(
    recommendations: RecommendedItem[],
    context: RecommendationContext,
    request: RecommendationRequest
  ): Promise<RecommendedItem[]> {
    let filtered = [...recommendations];

    // Filter by session length
    if (request.sessionLength) {
      filtered = this.filterBySessionLength(filtered, request.sessionLength);
    }

    // Apply spaced repetition priorities
    filtered = await this.applySpacedRepetition(filtered, request.userId);

    // Ensure prerequisite ordering
    filtered = this.ensurePrerequisiteOrdering(filtered);

    // Balance difficulty distribution
    filtered = this.balanceDifficulty(filtered, context);

    // Apply goal-based prioritization
    if (request.goalType) {
      filtered = this.prioritizeByGoal(filtered, request.goalType, context);
    }

    // Limit to requested number
    return filtered.slice(0, request.maxItems || 10);
  }

  /**
   * Generate or update study plan based on recommendations
   */
  private async generateStudyPlan(
    userId: string,
    recommendations: RecommendedItem[],
    context: RecommendationContext
  ): Promise<StudyPlan> {
    // Check for existing plan
    const { data: existingPlan } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingPlan && this.isPlanCurrent(existingPlan)) {
      // Update existing plan
      return this.updateStudyPlan(existingPlan, recommendations, context);
    }

    // Create new plan
    return this.createNewStudyPlan(userId, recommendations, context);
  }

  /**
   * Create a new study plan
   */
  private async createNewStudyPlan(
    userId: string,
    recommendations: RecommendedItem[],
    context: RecommendationContext
  ): Promise<StudyPlan> {
    const dailyGoals = this.generateDailyGoals(recommendations, context);
    const weeklyTargets = this.generateWeeklyTargets(context);

    const plan: StudyPlan = {
      userId,
      planId: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      dailyGoals,
      weeklyTargets,
      adaptationHistory: [],
      effectiveness: {
        overallScore: 0,
        accuracyImprovement: 0,
        completionRate: 0,
        engagementScore: 0,
        weaknessReduction: []
      }
    };

    // Save to database
    await supabase.from('study_plans').insert(plan);

    return plan;
  }

  /**
   * Generate daily study goals
   */
  private generateDailyGoals(
    recommendations: RecommendedItem[],
    context: RecommendationContext
  ): DailyStudyGoal[] {
    const goals: DailyStudyGoal[] = [];
    const dailyMinutes = (context.userGoals.studyHoursPerWeek * 60) / 7;

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Distribute recommendations across days
      const dayRecommendations = recommendations.slice(
        i * Math.ceil(recommendations.length / 7),
        (i + 1) * Math.ceil(recommendations.length / 7)
      );

      goals.push({
        date,
        recommendedMinutes: dailyMinutes,
        focusTopics: this.extractTopics(dayRecommendations),
        recommendedQuestions: dayRecommendations,
        completionStatus: {
          completed: false,
          actualMinutes: 0,
          questionsCompleted: [],
          performanceScore: 0
        }
      });
    }

    return goals;
  }

  /**
   * Calculate session suggestions
   */
  private calculateSessionSuggestion(
    recommendations: RecommendedItem[],
    context: RecommendationContext,
    request: RecommendationRequest
  ) {
    const totalTime = recommendations.reduce((sum, r) => sum + r.estimatedTime, 0);
    const avgDifficulty = recommendations.reduce((sum, r) => sum + r.expectedDifficulty, 0) / recommendations.length;

    let focusMode: 'deep_practice' | 'quick_review' | 'mixed' = 'mixed';
    if (avgDifficulty > 7) {
      focusMode = 'deep_practice';
    } else if (avgDifficulty < 4) {
      focusMode = 'quick_review';
    }

    const energyAlignment = this.checkEnergyAlignment(
      request.contextualFactors?.energyLevel,
      avgDifficulty
    );

    return {
      optimalDuration: Math.min(totalTime, request.sessionLength || 60),
      focusMode,
      energyAlignment
    };
  }

  /**
   * Store user feedback for model improvement
   */
  async submitFeedback(feedback: RecommendationFeedback): Promise<void> {
    // Store feedback in database
    await supabase.from('recommendation_feedback').insert(feedback);

    // Send to ML service for model update
    try {
      await fetch(`${this.mlEndpoint}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
    } catch (error) {
      console.error('Failed to send feedback to ML service:', error);
    }
  }

  // Helper methods

  private determineReason(rec: any, context: RecommendationContext) {
    // Logic to determine recommendation reason
    if (context.performanceInsights.weaknesses.includes(rec.topic)) {
      return {
        type: 'weakness' as const,
        description: 'Targeting identified weakness area',
        impactScore: 0.8,
        confidenceLevel: rec.confidence || 0.7
      };
    }
    // Add more reason logic
    return {
      type: 'high_yield' as const,
      description: 'High impact on score improvement',
      impactScore: 0.6,
      confidenceLevel: rec.confidence || 0.7
    };
  }

  private calculateExpectedDifficulty(rec: any, context: RecommendationContext): number {
    const baseDifficulty = rec.difficulty || 5;
    const userLevel = context.difficultyProfile.currentLevel;
    const adjustment = (userLevel - 5) * 0.2;
    return Math.max(1, Math.min(10, baseDifficulty + adjustment));
  }

  private isReviewOptimal(questionId: string, context: RecommendationContext): boolean {
    // Check spaced repetition schedule
    // TODO: Implement spaced repetition check
    return false;
  }

  private filterBySessionLength(items: RecommendedItem[], maxMinutes: number): RecommendedItem[] {
    const sorted = [...items].sort((a, b) => b.score - a.score);
    const result: RecommendedItem[] = [];
    let totalTime = 0;

    for (const item of sorted) {
      if (totalTime + item.estimatedTime <= maxMinutes) {
        result.push(item);
        totalTime += item.estimatedTime;
      }
    }

    return result;
  }

  private async applySpacedRepetition(
    items: RecommendedItem[],
    userId: string
  ): Promise<RecommendedItem[]> {
    // TODO: Implement spaced repetition logic
    return items;
  }

  private ensurePrerequisiteOrdering(items: RecommendedItem[]): RecommendedItem[] {
    // TODO: Implement prerequisite ordering
    return items;
  }

  private balanceDifficulty(
    items: RecommendedItem[],
    context: RecommendationContext
  ): RecommendedItem[] {
    // Ensure a good mix of difficulties around optimal challenge level
    const optimal = context.difficultyProfile.optimalChallenge * 10;
    return items.sort((a, b) => {
      const aDist = Math.abs(a.expectedDifficulty - optimal);
      const bDist = Math.abs(b.expectedDifficulty - optimal);
      return aDist - bDist;
    });
  }

  private prioritizeByGoal(
    items: RecommendedItem[],
    goalType: string,
    context: RecommendationContext
  ): RecommendedItem[] {
    // TODO: Implement goal-based prioritization
    return items;
  }

  private isPlanCurrent(plan: any): boolean {
    const planAge = Date.now() - new Date(plan.created_at).getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return planAge < oneWeek;
  }

  private async updateStudyPlan(
    existingPlan: any,
    recommendations: RecommendedItem[],
    context: RecommendationContext
  ): Promise<StudyPlan> {
    // TODO: Implement plan update logic
    return existingPlan;
  }

  private generateWeeklyTargets(context: RecommendationContext) {
    // TODO: Implement weekly target generation
    return {
      weekStart: new Date(),
      targetMinutes: context.userGoals.studyHoursPerWeek * 60,
      targetQuestions: 50,
      focusAreas: [],
      progressTracking: {
        minutesCompleted: 0,
        questionsCompleted: 0,
        averageAccuracy: 0
      }
    };
  }

  private extractTopics(items: RecommendedItem[]): string[] {
    const topics = new Set<string>();
    items.forEach(item => {
      if (item.topicPath.length > 0) {
        topics.add(item.topicPath[0]);
      }
    });
    return Array.from(topics);
  }

  private checkEnergyAlignment(energyLevel: string | undefined, difficulty: number): boolean {
    if (!energyLevel) return true;

    if (energyLevel === 'low' && difficulty < 5) return true;
    if (energyLevel === 'medium' && difficulty >= 4 && difficulty <= 7) return true;
    if (energyLevel === 'high' && difficulty > 6) return true;

    return false;
  }

  private calculateConfidence(items: RecommendedItem[]): number {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.reason.confidenceLevel, 0) / items.length;
  }

  private async getCollaborativeFilteringRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<RecommendedItem[]> {
    // Fallback collaborative filtering implementation
    // TODO: Implement fallback logic
    return [];
  }

  private async getFallbackRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    // Rule-based fallback when ML service is unavailable
    // TODO: Implement fallback recommendations
    return {
      recommendations: [],
      sessionSuggestion: {
        optimalDuration: 30,
        focusMode: 'mixed',
        energyAlignment: true
      },
      metadata: {
        modelVersion: 'fallback-1.0',
        generatedAt: new Date(),
        confidenceScore: 0.3,
        dataRecency: new Date()
      }
    };
  }
}