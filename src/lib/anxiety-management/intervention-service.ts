/**
 * Intervention Service
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Orchestrates anxiety interventions by coordinating detection, confidence building,
 * mindfulness exercises, and personalized coping strategies.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { createClient } from '@/lib/supabase/client'
import { anxietyDetectionService } from './anxiety-detection-service'
import { confidenceBuildingService } from './confidence-building-service'
import { mindfulnessService } from './mindfulness-service'
import { profileService } from '@/lib/learning-style/profile-service'
import type {
  AnxietyLevel,
  AnxietyTrigger,
  CopingStrategy,
  InterventionType,
  AnxietyIntervention,
  PersonalizedCopingStrategy,
  AnxietyManagementSettings,
  InterventionService as IInterventionService
} from '@/types/anxiety-management'
import type { LearningProfile } from '@/types/learning-style'

// ============================================================================
// INTERVENTION SERVICE CLASS
// ============================================================================

export class InterventionService implements IInterventionService {
  private supabase = createClient()

  /**
   * Trigger an anxiety intervention based on detected triggers and context
   */
  async triggerIntervention(
    userId: string,
    trigger: AnxietyTrigger,
    context: any
  ): Promise<AnxietyIntervention> {
    try {
      // Get user settings and preferences
      const [settings, learningProfile, copingStrategies] = await Promise.all([
        this.getUserSettings(userId),
        profileService.getProfile(userId),
        this.getPersonalizedCopingStrategies(userId, trigger)
      ])

      // Determine intervention type
      const interventionType = this.determineInterventionType(trigger, context, settings)

      // Select appropriate strategies
      const strategiesOffered = await this.selectStrategies(
        trigger,
        interventionType,
        copingStrategies,
        learningProfile,
        context
      )

      // Create intervention record
      const intervention: Omit<AnxietyIntervention, 'id'> = {
        user_id: userId,
        trigger_detected: trigger,
        intervention_type: interventionType,
        strategies_offered: strategiesOffered,
        strategy_selected: null,
        effectiveness_outcome: null,
        timestamp: new Date().toISOString()
      }

      // Store intervention
      const { data: interventionData, error } = await this.supabase
        .from('anxiety_interventions')
        .insert(intervention)
        .select()
        .single()

      if (error) throw error

      const fullIntervention: AnxietyIntervention = {
        id: interventionData.id,
        ...intervention
      }

      // Execute immediate interventions if needed
      if (interventionType === 'immediate') {
        await this.executeImmediateIntervention(userId, strategiesOffered[0], context)
      }

      return fullIntervention

    } catch (error) {
      console.error('Error triggering intervention:', error)
      throw new Error(`Failed to trigger intervention: ${error.message}`)
    }
  }

  /**
   * Evaluate the effectiveness of a completed intervention
   */
  async evaluateInterventionEffectiveness(interventionId: string): Promise<any> {
    try {
      const { data: intervention, error } = await this.supabase
        .from('anxiety_interventions')
        .select('*')
        .eq('id', interventionId)
        .single()

      if (error) throw error

      if (!intervention.outcome_data) {
        return {
          intervention_id: interventionId,
          status: 'pending_evaluation',
          message: 'Intervention has not been completed yet'
        }
      }

      const outcome = intervention.outcome_data as any

      // Calculate effectiveness metrics
      const effectiveness = {
        anxiety_reduction_percentage: outcome.anxiety_reduction || 0,
        confidence_improvement: outcome.confidence_improvement || 0,
        session_continuation_success: outcome.session_continuation || false,
        user_satisfaction_score: outcome.user_satisfaction || 0,
        strategy_completion_rate: outcome.strategy_completion_rate || 0
      }

      // Update strategy effectiveness ratings
      if (intervention.strategy_selected) {
        await this.updateStrategyEffectiveness(
          intervention.user_id,
          intervention.strategy_selected,
          effectiveness
        )
      }

      // Generate recommendations for future interventions
      const recommendations = this.generateInterventionRecommendations(effectiveness, intervention)

      return {
        intervention_id: interventionId,
        effectiveness_metrics: effectiveness,
        overall_success_score: this.calculateOverallSuccessScore(effectiveness),
        recommendations,
        lessons_learned: this.extractLessonsLearned(effectiveness, intervention),
        updated_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error evaluating intervention effectiveness:', error)
      throw new Error(`Failed to evaluate intervention effectiveness: ${error.message}`)
    }
  }

  /**
   * Update and personalize coping strategies based on effectiveness data
   */
  async updateCopingStrategies(userId: string): Promise<PersonalizedCopingStrategy[]> {
    try {
      // Get current strategies and their usage data
      const { data: currentStrategies, error: strategiesError } = await this.supabase
        .from('coping_strategies')
        .select('*')
        .eq('user_id', userId)

      if (strategiesError) throw strategiesError

      // Get recent intervention data for analysis
      const { data: interventions, error: interventionsError } = await this.supabase
        .from('anxiety_interventions')
        .select('*')
        .eq('user_id', userId)
        .not('outcome_data', 'is', null)
        .order('timestamp', { ascending: false })
        .limit(20)

      if (interventionsError) throw interventionsError

      // Analyze strategy effectiveness
      const strategyAnalysis = this.analyzeStrategyEffectiveness(
        currentStrategies || [],
        interventions || []
      )

      // Update existing strategies
      const updatedStrategies: PersonalizedCopingStrategy[] = []

      for (const strategy of currentStrategies || []) {
        const analysis = strategyAnalysis[strategy.strategy_type]

        const updatedStrategy: PersonalizedCopingStrategy = {
          ...strategy,
          effectiveness_rating: analysis?.effectiveness || strategy.effectiveness_rating,
          usage_frequency: analysis?.usage_count || strategy.usage_frequency,
          success_rate: analysis?.success_rate || strategy.success_rate,
          customizations: {
            ...strategy.customizations,
            ...this.generateCustomizations(strategy, analysis)
          }
        }

        updatedStrategies.push(updatedStrategy)

        // Update in database
        await this.supabase
          .from('coping_strategies')
          .update({
            effectiveness_rating: updatedStrategy.effectiveness_rating,
            usage_frequency: updatedStrategy.usage_frequency,
            success_rate: updatedStrategy.success_rate,
            customizations: updatedStrategy.customizations,
            updated_at: new Date().toISOString()
          })
          .eq('id', strategy.id)
      }

      // Add new recommended strategies if needed
      const newStrategies = await this.recommendNewStrategies(userId, strategyAnalysis)
      updatedStrategies.push(...newStrategies)

      return updatedStrategies

    } catch (error) {
      console.error('Error updating coping strategies:', error)
      throw new Error(`Failed to update coping strategies: ${error.message}`)
    }
  }

  /**
   * Get comprehensive anxiety management dashboard data
   */
  async getAnxietyManagementDashboard(userId: string): Promise<any> {
    try {
      const [
        currentAnxietyDetection,
        confidenceMetrics,
        recentInterventions,
        mindfulnessEffectiveness,
        copingStrategies
      ] = await Promise.all([
        this.getCurrentAnxietyStatus(userId),
        confidenceBuildingService.assessConfidenceLevel(userId),
        this.getRecentInterventions(userId),
        mindfulnessService.analyzeEffectiveness(userId),
        this.getPersonalizedCopingStrategies(userId)
      ])

      // Calculate weekly insights
      const weeklyInsights = await this.calculateWeeklyInsights(userId)

      // Calculate progress metrics
      const progressMetrics = await this.calculateProgressMetrics(userId)

      // Generate recommendations
      const recommendations = await this.generateDashboardRecommendations(
        currentAnxietyDetection,
        confidenceMetrics,
        weeklyInsights
      )

      return {
        user_id: userId,
        current_status: {
          anxiety_level: currentAnxietyDetection?.anxiety_level || 'low',
          confidence_level: confidenceMetrics.current_level,
          trend_direction: this.determineTrendDirection(weeklyInsights)
        },
        weekly_insights: weeklyInsights,
        progress_metrics: progressMetrics,
        recent_interventions: recentInterventions.slice(0, 5),
        mindfulness_effectiveness: mindfulnessEffectiveness,
        active_coping_strategies: copingStrategies.filter(s => s.effectiveness_rating >= 70),
        recommendations,
        last_updated: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error getting anxiety management dashboard:', error)
      throw new Error(`Failed to get anxiety management dashboard: ${error.message}`)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get user settings for anxiety management
   */
  private async getUserSettings(userId: string): Promise<AnxietyManagementSettings> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('anxiety_management_settings')
      .eq('user_id', userId)
      .single()

    if (error || !data?.anxiety_management_settings) {
      // Return default settings
      return {
        user_id: userId,
        intervention_preferences: {
          auto_trigger_threshold: 'moderate',
          preferred_strategies: ['breathing_exercise', 'positive_affirmation'],
          notification_frequency: 'gentle',
          break_suggestions_enabled: true
        },
        mindfulness_preferences: {
          preferred_exercise_duration: 180,
          breathing_exercise_style: 'coherent-breathing',
          background_sounds_enabled: false,
          guided_vs_self_directed: 'guided'
        },
        progress_tracking: {
          detailed_analytics: true,
          progress_celebrations: true,
          comparison_data_visible: false,
          goal_setting_enabled: true
        },
        privacy_settings: {
          share_anonymized_data: false,
          research_participation: false,
          coaching_suggestions: true
        }
      }
    }

    return data.anxiety_management_settings
  }

  /**
   * Determine the appropriate intervention type
   */
  private determineInterventionType(
    trigger: AnxietyTrigger,
    context: any,
    settings: AnxietyManagementSettings
  ): InterventionType {
    // Immediate interventions for severe triggers
    if (trigger === 'performance_drop' && context.performance_decline > 30) {
      return 'immediate'
    }

    if (trigger === 'time_pressure' && context.time_remaining < 60) {
      return 'immediate'
    }

    // Proactive interventions for building patterns
    if (trigger === 'difficult_questions' && context.difficulty_level > 7) {
      return 'proactive'
    }

    // Educational interventions for learning opportunities
    if (trigger === 'streak_break' && context.streak_count > 5) {
      return 'educational'
    }

    // Celebration interventions for positive moments
    if (context.achievement_unlocked) {
      return 'celebration'
    }

    return 'proactive' // Default
  }

  /**
   * Select appropriate strategies for the intervention
   */
  private async selectStrategies(
    trigger: AnxietyTrigger,
    interventionType: InterventionType,
    personalizedStrategies: PersonalizedCopingStrategy[],
    learningProfile: LearningProfile | null,
    context: any
  ): Promise<PersonalizedCopingStrategy[]> {
    // Filter strategies by trigger type
    const relevantStrategies = personalizedStrategies.filter(
      strategy => strategy.trigger_type === trigger || strategy.trigger_type === 'unknown'
    )

    // Sort by effectiveness
    const sortedStrategies = relevantStrategies.sort(
      (a, b) => b.effectiveness_rating - a.effectiveness_rating
    )

    // Apply learning style preferences
    const learningStyleAdjusted = this.adjustStrategiesForLearningStyle(
      sortedStrategies,
      learningProfile
    )

    // Select top strategies based on intervention type
    let selectedCount = 1
    switch (interventionType) {
      case 'immediate':
        selectedCount = 1 // Quick, single strategy
        break
      case 'proactive':
        selectedCount = 2 // A couple of options
        break
      case 'educational':
        selectedCount = 3 // More comprehensive approach
        break
      case 'celebration':
        selectedCount = 1 // Focus on positive reinforcement
        break
    }

    return learningStyleAdjusted.slice(0, selectedCount)
  }

  /**
   * Execute immediate intervention
   */
  private async executeImmediateIntervention(
    userId: string,
    strategy: PersonalizedCopingStrategy,
    context: any
  ): Promise<void> {
    switch (strategy.strategy_type) {
      case 'breathing_exercise':
        // Could trigger a breathing exercise modal
        console.log('Triggering immediate breathing exercise for user:', userId)
        break
      case 'positive_affirmation':
        // Could show encouraging message
        console.log('Showing positive affirmation for user:', userId)
        break
      case 'difficulty_reduction':
        // Could adjust question difficulty
        console.log('Reducing difficulty for user:', userId)
        break
      case 'break_suggestion':
        // Could suggest taking a break
        console.log('Suggesting break for user:', userId)
        break
    }
  }

  /**
   * Update strategy effectiveness based on outcome
   */
  private async updateStrategyEffectiveness(
    userId: string,
    strategyId: string,
    effectiveness: any
  ): Promise<void> {
    // Calculate new effectiveness rating
    const overallEffectiveness = this.calculateOverallSuccessScore(effectiveness)

    await this.supabase
      .from('coping_strategies')
      .update({
        effectiveness_rating: overallEffectiveness,
        usage_count: this.supabase.sql`usage_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', strategyId)
      .eq('user_id', userId)
  }

  /**
   * Calculate overall success score from effectiveness metrics
   */
  private calculateOverallSuccessScore(effectiveness: any): number {
    const weights = {
      anxiety_reduction: 0.3,
      confidence_improvement: 0.25,
      session_continuation: 0.2,
      user_satisfaction: 0.15,
      completion_rate: 0.1
    }

    let score = 0
    score += effectiveness.anxiety_reduction_percentage * weights.anxiety_reduction
    score += effectiveness.confidence_improvement * weights.confidence_improvement
    score += (effectiveness.session_continuation_success ? 100 : 0) * weights.session_continuation
    score += effectiveness.user_satisfaction_score * 20 * weights.user_satisfaction // Scale 1-5 to 0-100
    score += effectiveness.strategy_completion_rate * weights.completion_rate

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Generate intervention recommendations
   */
  private generateInterventionRecommendations(effectiveness: any, intervention: any): string[] {
    const recommendations: string[] = []

    if (effectiveness.anxiety_reduction_percentage < 30) {
      recommendations.push('Consider longer mindfulness sessions for better anxiety relief')
    }

    if (effectiveness.user_satisfaction_score < 3) {
      recommendations.push('Try different coping strategies to find what works best')
    }

    if (!effectiveness.session_continuation_success) {
      recommendations.push('Focus on building confidence before challenging sessions')
    }

    if (effectiveness.strategy_completion_rate < 70) {
      recommendations.push('Break strategies into smaller, more manageable steps')
    }

    return recommendations
  }

  /**
   * Extract lessons learned from intervention
   */
  private extractLessonsLearned(effectiveness: any, intervention: any): string[] {
    const lessons: string[] = []

    if (effectiveness.anxiety_reduction_percentage > 50) {
      lessons.push(`${intervention.trigger_detected} trigger responds well to ${intervention.strategy_selected}`)
    }

    if (effectiveness.confidence_improvement > 20) {
      lessons.push('This intervention significantly boosted confidence')
    }

    if (effectiveness.session_continuation_success) {
      lessons.push('Successfully prevented session abandonment')
    }

    return lessons
  }

  /**
   * Analyze strategy effectiveness from historical data
   */
  private analyzeStrategyEffectiveness(
    strategies: any[],
    interventions: any[]
  ): Record<string, any> {
    const analysis: Record<string, any> = {}

    strategies.forEach(strategy => {
      const relatedInterventions = interventions.filter(
        i => i.strategy_selected === strategy.id
      )

      if (relatedInterventions.length > 0) {
        const successCount = relatedInterventions.filter(
          i => i.outcome_data?.user_satisfaction >= 3
        ).length

        analysis[strategy.strategy_type] = {
          usage_count: relatedInterventions.length,
          success_rate: successCount / relatedInterventions.length,
          effectiveness: this.calculateAverageEffectiveness(relatedInterventions)
        }
      }
    })

    return analysis
  }

  /**
   * Calculate average effectiveness from interventions
   */
  private calculateAverageEffectiveness(interventions: any[]): number {
    if (interventions.length === 0) return 50

    const scores = interventions.map(i =>
      this.calculateOverallSuccessScore(i.outcome_data || {})
    )

    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  /**
   * Generate customizations for strategies
   */
  private generateCustomizations(strategy: any, analysis: any): any {
    const customizations: any = { ...strategy.customizations }

    if (analysis?.success_rate < 0.5) {
      // Strategy isn't working well, suggest modifications
      customizations.duration = Math.max(60, customizations.duration * 0.8)
      customizations.intensity = Math.max(1, customizations.intensity - 1)
    } else if (analysis?.success_rate > 0.8) {
      // Strategy is working well, could be optimized
      customizations.duration = Math.min(600, customizations.duration * 1.1)
    }

    return customizations
  }

  /**
   * Recommend new strategies based on analysis
   */
  private async recommendNewStrategies(
    userId: string,
    analysis: Record<string, any>
  ): Promise<PersonalizedCopingStrategy[]> {
    const newStrategies: PersonalizedCopingStrategy[] = []

    // If no breathing exercise strategy, recommend one
    if (!analysis['breathing_exercise']) {
      newStrategies.push({
        id: '',
        user_id: userId,
        trigger_type: 'performance_drop',
        strategy_type: 'breathing_exercise',
        effectiveness_rating: 75,
        usage_frequency: 0,
        customizations: {
          duration: 180,
          intensity: 3,
          personal_modifications: []
        },
        success_rate: 0,
        last_used: ''
      })
    }

    return newStrategies
  }

  /**
   * Get current anxiety status
   */
  private async getCurrentAnxietyStatus(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('anxiety_detections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data
  }

  /**
   * Get recent interventions
   */
  private async getRecentInterventions(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('anxiety_interventions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10)

    if (error) return []
    return data || []
  }

  /**
   * Get personalized coping strategies
   */
  private async getPersonalizedCopingStrategies(
    userId: string,
    trigger?: AnxietyTrigger
  ): Promise<PersonalizedCopingStrategy[]> {
    let query = this.supabase
      .from('coping_strategies')
      .select('*')
      .eq('user_id', userId)

    if (trigger) {
      query = query.eq('trigger_type', trigger)
    }

    const { data, error } = await query.order('effectiveness_rating', { ascending: false })

    if (error) return []
    return data || []
  }

  /**
   * Calculate weekly insights
   */
  private async calculateWeeklyInsights(userId: string): Promise<any> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [anxietyEpisodes, interventions, mindfulnessSessions] = await Promise.all([
      this.supabase
        .from('anxiety_detections')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString()),
      this.supabase
        .from('anxiety_interventions')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', weekAgo.toISOString()),
      this.supabase
        .from('mindfulness_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())
    ])

    return {
      anxiety_episodes: anxietyEpisodes.data?.length || 0,
      interventions_used: interventions.data?.length || 0,
      mindfulness_sessions: mindfulnessSessions.data?.length || 0,
      successful_strategies: this.identifySuccessfulStrategies(interventions.data || [])
    }
  }

  /**
   * Calculate progress metrics
   */
  private async calculateProgressMetrics(userId: string): Promise<any> {
    // Implementation would calculate improvement metrics over time
    return {
      anxiety_management_score: 75,
      confidence_building_score: 68,
      resilience_rating: 72,
      stress_tolerance_improvement: 15
    }
  }

  /**
   * Generate dashboard recommendations
   */
  private async generateDashboardRecommendations(
    anxietyStatus: any,
    confidenceMetrics: any,
    weeklyInsights: any
  ): Promise<any> {
    return {
      immediate_actions: ['Try a 3-minute breathing exercise before your next session'],
      weekly_goals: ['Complete 5 mindfulness sessions this week'],
      strategy_adjustments: ['Focus on confidence-building exercises']
    }
  }

  /**
   * Determine trend direction
   */
  private determineTrendDirection(insights: any): 'improving' | 'stable' | 'concerning' {
    if (insights.anxiety_episodes < 2 && insights.interventions_used < 3) {
      return 'improving'
    } else if (insights.anxiety_episodes > 5) {
      return 'concerning'
    }
    return 'stable'
  }

  /**
   * Identify successful strategies from interventions
   */
  private identifySuccessfulStrategies(interventions: any[]): string[] {
    const successfulInterventions = interventions.filter(
      i => i.outcome_data?.user_satisfaction >= 4
    )

    const strategyCounts: Record<string, number> = {}
    successfulInterventions.forEach(i => {
      const strategy = i.strategies_offered[0]?.strategy_type
      if (strategy) {
        strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1
      }
    })

    return Object.entries(strategyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([strategy]) => strategy)
  }

  /**
   * Adjust strategies based on learning style
   */
  private adjustStrategiesForLearningStyle(
    strategies: PersonalizedCopingStrategy[],
    learningProfile: LearningProfile | null
  ): PersonalizedCopingStrategy[] {
    if (!learningProfile?.learning_style) return strategies

    // Prioritize strategies that match learning style
    return strategies.sort((a, b) => {
      let scoreA = a.effectiveness_rating
      let scoreB = b.effectiveness_rating

      // Visual learners prefer visualization strategies
      if (learningProfile.learning_style.includes('visual')) {
        if (a.strategy_type === 'positive_affirmation') scoreA += 10
        if (b.strategy_type === 'positive_affirmation') scoreB += 10
      }

      // Kinesthetic learners prefer breathing exercises
      if (learningProfile.learning_style.includes('kinesthetic')) {
        if (a.strategy_type === 'breathing_exercise') scoreA += 10
        if (b.strategy_type === 'breathing_exercise') scoreB += 10
      }

      return scoreB - scoreA
    })
  }
}

// Export singleton instance
export const interventionService = new InterventionService()