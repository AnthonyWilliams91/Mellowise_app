/**
 * Mindfulness Service
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Service for providing breathing exercises, guided relaxation, and mindfulness
 * interventions based on anxiety levels and user preferences.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

import { createClient } from '@/lib/supabase/client'
import type {
  AnxietyLevel,
  BreathingExercise,
  MindfulnessSession,
  RelaxationTechnique,
  MindfulnessService as IMindfulnessService
} from '@/types/anxiety-management'

// ============================================================================
// PREDEFINED BREATHING EXERCISES
// ============================================================================

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'A calming technique that helps reduce stress and improve focus',
    duration_seconds: 240,
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 4,
      exhale_seconds: 4,
      pause_seconds: 4,
      cycles: 8
    },
    guidance_text: [
      'Breathe in slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly for 4 counts',
      'Hold empty for 4 counts',
      'This creates a box pattern - steady and balanced'
    ],
    visual_guide_type: 'square'
  },
  {
    id: 'four-seven-eight',
    name: '4-7-8 Breathing',
    description: 'A powerful technique for quick anxiety relief and better sleep',
    duration_seconds: 180,
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 7,
      exhale_seconds: 8,
      pause_seconds: 0,
      cycles: 6
    },
    guidance_text: [
      'Inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale completely through your mouth for 8 counts',
      'This exercise naturally slows your heart rate',
      'Perfect for test anxiety relief'
    ],
    visual_guide_type: 'circle'
  },
  {
    id: 'coherent-breathing',
    name: 'Coherent Breathing',
    description: 'Balanced breathing to sync your heart rate and calm your mind',
    duration_seconds: 300,
    breathing_pattern: {
      inhale_seconds: 5,
      hold_seconds: 0,
      exhale_seconds: 5,
      pause_seconds: 0,
      cycles: 15
    },
    guidance_text: [
      'Breathe in smoothly for 5 counts',
      'Breathe out smoothly for 5 counts',
      'Keep the rhythm steady and natural',
      'This creates heart rate coherence',
      'Excellent for sustained focus during study'
    ],
    visual_guide_type: 'wave'
  },
  {
    id: 'quick-calm',
    name: 'Quick Calm',
    description: 'Fast anxiety relief when you need to get back to studying quickly',
    duration_seconds: 60,
    breathing_pattern: {
      inhale_seconds: 3,
      hold_seconds: 2,
      exhale_seconds: 4,
      pause_seconds: 1,
      cycles: 6
    },
    guidance_text: [
      'Take a deep breath in for 3 counts',
      'Hold briefly for 2 counts',
      'Release slowly for 4 counts',
      'Pause for 1 count',
      'Quick reset for your nervous system'
    ],
    visual_guide_type: 'star'
  },
  {
    id: 'extended-exhale',
    name: 'Extended Exhale',
    description: 'Focus on longer exhales to activate your relaxation response',
    duration_seconds: 200,
    breathing_pattern: {
      inhale_seconds: 4,
      hold_seconds: 1,
      exhale_seconds: 8,
      pause_seconds: 1,
      cycles: 10
    },
    guidance_text: [
      'Breathe in comfortably for 4 counts',
      'Hold briefly for 1 count',
      'Breathe out very slowly for 8 counts',
      'Pause gently for 1 count',
      'Long exhales signal safety to your brain'
    ],
    visual_guide_type: 'circle'
  }
]

// ============================================================================
// RELAXATION TECHNIQUES
// ============================================================================

const RELAXATION_TECHNIQUES: RelaxationTechnique[] = [
  {
    id: 'progressive-muscle',
    name: 'Progressive Muscle Relaxation',
    type: 'progressive_muscle',
    duration_seconds: 600,
    instructions: [
      'Start by tensing your toes for 5 seconds, then release',
      'Move to your calves - tense, hold, then relax',
      'Continue with your thighs, then your entire legs',
      'Tense your hands into fists, then release',
      'Move up through your arms to your shoulders',
      'Scrunch your face muscles, then let them go',
      'Feel the contrast between tension and relaxation',
      'Notice how your body feels now compared to when you started'
    ],
    effectiveness_for_anxiety: {
      low: 70,
      moderate: 85,
      high: 90,
      severe: 75
    }
  },
  {
    id: 'study-success-visualization',
    name: 'Study Success Visualization',
    type: 'visualization',
    duration_seconds: 300,
    instructions: [
      'Close your eyes and take three deep breaths',
      'Imagine yourself sitting confidently at your study space',
      'You are approaching each question with calm clarity',
      'See yourself reading questions carefully and thoughtfully',
      'Visualize selecting answers with confidence',
      'Picture your knowledge flowing naturally',
      'See yourself completing practice sessions successfully',
      'Feel the satisfaction of steady progress',
      'Carry this confidence into your actual study session'
    ],
    effectiveness_for_anxiety: {
      low: 75,
      moderate: 80,
      high: 85,
      severe: 70
    }
  },
  {
    id: 'grounding-five-senses',
    name: '5-4-3-2-1 Grounding',
    type: 'grounding',
    duration_seconds: 180,
    instructions: [
      'Look around and name 5 things you can see',
      'Notice 4 things you can physically feel (chair, air, clothing)',
      'Listen for 3 different sounds around you',
      'Identify 2 things you can smell',
      'Think of 1 thing you can taste',
      'This exercise brings you back to the present moment',
      'Your anxiety exists in thoughts about the future',
      'But right now, in this moment, you are safe'
    ],
    effectiveness_for_anxiety: {
      low: 60,
      moderate: 80,
      high: 95,
      severe: 90
    }
  },
  {
    id: 'positive-affirmations',
    name: 'Confidence Affirmations',
    type: 'positive_affirmations',
    duration_seconds: 120,
    instructions: [
      'Take a comfortable position and breathe naturally',
      'Repeat silently: "I am capable of learning and growing"',
      'Say to yourself: "Each question is an opportunity to practice"',
      'Affirm: "I trust in my preparation and knowledge"',
      'Remind yourself: "Mistakes are part of learning"',
      'Declare: "I am becoming stronger with each challenge"',
      'Feel: "I deserve success and will achieve my goals"',
      'Know: "I have everything I need within me right now"'
    ],
    effectiveness_for_anxiety: {
      low: 65,
      moderate: 75,
      high: 70,
      severe: 60
    }
  }
]

// ============================================================================
// MINDFULNESS SERVICE CLASS
// ============================================================================

export class MindfulnessService implements IMindfulnessService {
  private supabase = createClient()

  /**
   * Get recommended breathing exercises based on anxiety level and available time
   */
  async getRecommendedExercises(
    anxietyLevel: AnxietyLevel,
    timeAvailable: number
  ): Promise<BreathingExercise[]> {
    try {
      // Filter exercises by duration
      const suitableExercises = BREATHING_EXERCISES.filter(
        exercise => exercise.duration_seconds <= timeAvailable
      )

      if (suitableExercises.length === 0) {
        // If no exercises fit the time, return the shortest one
        return [BREATHING_EXERCISES.reduce((shortest, current) =>
          current.duration_seconds < shortest.duration_seconds ? current : shortest
        )]
      }

      // Sort exercises by effectiveness for the anxiety level
      const sortedExercises = this.sortByEffectiveness(suitableExercises, anxietyLevel)

      // Return top 3 recommendations
      return sortedExercises.slice(0, 3)

    } catch (error) {
      console.error('Error getting recommended exercises:', error)
      throw new Error(`Failed to get recommended exercises: ${error.message}`)
    }
  }

  /**
   * Get recommended relaxation techniques
   */
  async getRecommendedRelaxationTechniques(
    anxietyLevel: AnxietyLevel,
    timeAvailable: number
  ): Promise<RelaxationTechnique[]> {
    try {
      // Filter techniques by duration
      const suitableTechniques = RELAXATION_TECHNIQUES.filter(
        technique => technique.duration_seconds <= timeAvailable
      )

      // Sort by effectiveness for the anxiety level
      const sortedTechniques = suitableTechniques.sort((a, b) =>
        b.effectiveness_for_anxiety[anxietyLevel] - a.effectiveness_for_anxiety[anxietyLevel]
      )

      return sortedTechniques.slice(0, 2) // Return top 2 recommendations

    } catch (error) {
      console.error('Error getting recommended relaxation techniques:', error)
      throw new Error(`Failed to get recommended relaxation techniques: ${error.message}`)
    }
  }

  /**
   * Track a mindfulness session
   */
  async trackMindfulnessSession(sessionData: Omit<MindfulnessSession, 'id'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('mindfulness_sessions')
        .insert({
          user_id: sessionData.user_id,
          exercise_id: sessionData.exercise_id,
          started_at: sessionData.started_at,
          completed_at: sessionData.completed_at,
          duration_completed: sessionData.duration_completed_seconds,
          effectiveness_rating: sessionData.effectiveness_rating,
          anxiety_before: sessionData.anxiety_level_before,
          anxiety_after: sessionData.anxiety_level_after,
          session_context: sessionData.session_context
        })

      if (error) throw error

    } catch (error) {
      console.error('Error tracking mindfulness session:', error)
      throw new Error(`Failed to track mindfulness session: ${error.message}`)
    }
  }

  /**
   * Analyze effectiveness of mindfulness sessions for a user
   */
  async analyzeEffectiveness(userId: string): Promise<any> {
    try {
      const { data: sessions, error } = await this.supabase
        .from('mindfulness_sessions')
        .select('*')
        .eq('user_id', userId)
        .not('effectiveness_rating', 'is', null)
        .not('anxiety_before', 'is', null)
        .not('anxiety_after', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error

      if (!sessions || sessions.length === 0) {
        return {
          overall_effectiveness: 0,
          most_effective_exercises: [],
          anxiety_reduction_average: 0,
          usage_patterns: {},
          recommendations: ['Try completing more mindfulness sessions to see personalized insights']
        }
      }

      // Calculate overall effectiveness
      const avgEffectivenessRating = sessions.reduce((sum, s) => sum + s.effectiveness_rating, 0) / sessions.length

      // Calculate anxiety reduction
      const anxietyReductions = sessions.map(s => {
        const beforeScore = this.getAnxietyScore(s.anxiety_before)
        const afterScore = this.getAnxietyScore(s.anxiety_after)
        return beforeScore - afterScore
      })
      const avgAnxietyReduction = anxietyReductions.reduce((sum, r) => sum + r, 0) / anxietyReductions.length

      // Find most effective exercises
      const exerciseEffectiveness: Record<string, number[]> = {}
      sessions.forEach(session => {
        if (!exerciseEffectiveness[session.exercise_id]) {
          exerciseEffectiveness[session.exercise_id] = []
        }
        exerciseEffectiveness[session.exercise_id].push(session.effectiveness_rating)
      })

      const mostEffectiveExercises = Object.entries(exerciseEffectiveness)
        .map(([exerciseId, ratings]) => ({
          exercise_id: exerciseId,
          avg_effectiveness: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
          usage_count: ratings.length
        }))
        .sort((a, b) => b.avg_effectiveness - a.avg_effectiveness)
        .slice(0, 3)

      // Analyze usage patterns
      const usagePatterns = this.analyzeUsagePatterns(sessions)

      // Generate recommendations
      const recommendations = this.generateMindfulnessRecommendations(
        avgEffectivenessRating,
        avgAnxietyReduction,
        mostEffectiveExercises,
        usagePatterns
      )

      return {
        overall_effectiveness: Math.round(avgEffectivenessRating * 20), // Scale to 0-100
        most_effective_exercises: mostEffectiveExercises,
        anxiety_reduction_average: Math.round(avgAnxietyReduction * 100) / 100,
        usage_patterns: usagePatterns,
        recommendations
      }

    } catch (error) {
      console.error('Error analyzing effectiveness:', error)
      throw new Error(`Failed to analyze effectiveness: ${error.message}`)
    }
  }

  /**
   * Get personalized mindfulness plan
   */
  async getPersonalizedPlan(
    userId: string,
    anxietyLevel: AnxietyLevel,
    dailyTimeAvailable: number
  ): Promise<any> {
    try {
      const effectiveness = await this.analyzeEffectiveness(userId)

      // Get user's most effective exercises
      const preferredExercises = effectiveness.most_effective_exercises.length > 0
        ? effectiveness.most_effective_exercises.map(e => e.exercise_id)
        : ['coherent-breathing', 'box-breathing'] // Default recommendations

      // Create weekly plan
      const weeklyPlan = this.createWeeklyMindfulnessPlan(
        preferredExercises,
        anxietyLevel,
        dailyTimeAvailable
      )

      return {
        user_id: userId,
        recommended_exercises: preferredExercises,
        daily_time_commitment: dailyTimeAvailable,
        weekly_plan: weeklyPlan,
        effectiveness_insights: effectiveness,
        next_milestone: this.calculateNextMilestone(effectiveness.overall_effectiveness),
        created_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error creating personalized plan:', error)
      throw new Error(`Failed to create personalized plan: ${error.message}`)
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Sort exercises by effectiveness for given anxiety level
   */
  private sortByEffectiveness(exercises: BreathingExercise[], anxietyLevel: AnxietyLevel): BreathingExercise[] {
    // Define effectiveness scores for each exercise based on anxiety level
    const effectivenessScores: Record<string, Record<AnxietyLevel, number>> = {
      'box-breathing': { low: 85, moderate: 90, high: 95, severe: 85 },
      'four-seven-eight': { low: 80, moderate: 95, high: 95, severe: 90 },
      'coherent-breathing': { low: 90, moderate: 85, high: 80, severe: 75 },
      'quick-calm': { low: 75, moderate: 80, high: 85, severe: 80 },
      'extended-exhale': { low: 80, moderate: 85, high: 90, severe: 85 }
    }

    return exercises.sort((a, b) => {
      const scoreA = effectivenessScores[a.id]?.[anxietyLevel] || 50
      const scoreB = effectivenessScores[b.id]?.[anxietyLevel] || 50
      return scoreB - scoreA
    })
  }

  /**
   * Convert anxiety level to numeric score
   */
  private getAnxietyScore(level: AnxietyLevel): number {
    const scores = { low: 25, moderate: 50, high: 75, severe: 100 }
    return scores[level] || 0
  }

  /**
   * Analyze usage patterns from session data
   */
  private analyzeUsagePatterns(sessions: any[]): any {
    // Time of day analysis
    const hourUsage: Record<number, number> = {}
    sessions.forEach(session => {
      const hour = new Date(session.started_at).getHours()
      hourUsage[hour] = (hourUsage[hour] || 0) + 1
    })

    const mostActiveHour = Object.entries(hourUsage).reduce((max, [hour, count]) =>
      count > max.count ? { hour: parseInt(hour), count } : max, { hour: 0, count: 0 })

    // Context analysis
    const contextUsage: Record<string, number> = {}
    sessions.forEach(session => {
      contextUsage[session.session_context] = (contextUsage[session.session_context] || 0) + 1
    })

    // Completion rate
    const completedSessions = sessions.filter(s => s.completed_at !== null).length
    const completionRate = completedSessions / sessions.length

    return {
      most_active_hour: mostActiveHour.hour,
      preferred_contexts: Object.entries(contextUsage).sort((a, b) => b[1] - a[1]),
      completion_rate: Math.round(completionRate * 100),
      total_sessions: sessions.length,
      average_duration: sessions.reduce((sum, s) => sum + s.duration_completed, 0) / sessions.length
    }
  }

  /**
   * Generate personalized mindfulness recommendations
   */
  private generateMindfulnessRecommendations(
    avgEffectiveness: number,
    avgAnxietyReduction: number,
    topExercises: any[],
    usagePatterns: any
  ): string[] {
    const recommendations: string[] = []

    if (avgEffectiveness < 3) {
      recommendations.push('Try different breathing exercises to find what works best for you')
    }

    if (avgAnxietyReduction < 0.5) {
      recommendations.push('Consider longer mindfulness sessions for better anxiety relief')
    }

    if (usagePatterns.completion_rate < 70) {
      recommendations.push('Start with shorter exercises to build a consistent habit')
    }

    if (topExercises.length > 0) {
      recommendations.push(`Focus on ${topExercises[0].exercise_id.replace('-', ' ')} - it works best for you`)
    }

    if (usagePatterns.most_active_hour) {
      recommendations.push(`Schedule mindfulness around ${usagePatterns.most_active_hour}:00 when you're most likely to practice`)
    }

    return recommendations
  }

  /**
   * Create weekly mindfulness plan
   */
  private createWeeklyMindfulnessPlan(
    preferredExercises: string[],
    anxietyLevel: AnxietyLevel,
    dailyTime: number
  ): any {
    const plan: any = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    days.forEach((day, index) => {
      // Alternate between exercises
      const exerciseIndex = index % preferredExercises.length
      const exerciseId = preferredExercises[exerciseIndex]

      // Find the exercise details
      const exercise = BREATHING_EXERCISES.find(e => e.id === exerciseId)

      plan[day] = {
        exercise_id: exerciseId,
        exercise_name: exercise?.name || 'Breathing Exercise',
        recommended_time: this.getRecommendedTimeForDay(day, anxietyLevel),
        duration_minutes: Math.ceil((exercise?.duration_seconds || 180) / 60),
        focus_area: this.getFocusAreaForDay(day, anxietyLevel)
      }
    })

    return plan
  }

  /**
   * Get recommended time for each day
   */
  private getRecommendedTimeForDay(day: string, anxietyLevel: AnxietyLevel): string {
    // Higher anxiety = more frequent sessions
    if (anxietyLevel === 'high' || anxietyLevel === 'severe') {
      return 'Morning and before study sessions'
    }

    const timeRecommendations: Record<string, string> = {
      monday: 'Morning - start the week calm',
      tuesday: 'Before study session',
      wednesday: 'Midday reset',
      thursday: 'After challenging study',
      friday: 'End of week wind-down',
      saturday: 'Flexible timing',
      sunday: 'Evening preparation'
    }

    return timeRecommendations[day] || 'Anytime'
  }

  /**
   * Get focus area for each day
   */
  private getFocusAreaForDay(day: string, anxietyLevel: AnxietyLevel): string {
    const focusAreas: Record<string, string> = {
      monday: 'Setting intentions',
      tuesday: 'Building focus',
      wednesday: 'Stress release',
      thursday: 'Confidence building',
      friday: 'Celebrating progress',
      saturday: 'Self-care',
      sunday: 'Preparation and calm'
    }

    return focusAreas[day] || 'General relaxation'
  }

  /**
   * Calculate next milestone for user
   */
  private calculateNextMilestone(currentEffectiveness: number): string {
    if (currentEffectiveness < 20) return 'Complete 5 mindfulness sessions'
    if (currentEffectiveness < 40) return 'Achieve 70% session completion rate'
    if (currentEffectiveness < 60) return 'Practice for 7 consecutive days'
    if (currentEffectiveness < 80) return 'Master your preferred breathing technique'
    return 'Become a mindfulness mentor'
  }
}

// Export singleton instance
export const mindfulnessService = new MindfulnessService()