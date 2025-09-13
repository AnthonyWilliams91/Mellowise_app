/**
 * Learning Profile Service
 * 
 * Comprehensive service for generating, updating, and managing user learning profiles.
 * Integrates classification algorithms with confidence scoring and profile persistence.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

import { createClient } from '@/lib/supabase/client'
import { classificationEngine } from './classification-engine'
import { behavioralTracker } from './behavioral-tracker'
import type { 
  LearningProfile, 
  DiagnosticAttempt, 
  LearningStyleAnalysis,
  LearningStyleRefinement,
  LearningStyleKey
} from '@/types/learning-style'

export interface ProfileGenerationOptions {
  forceRegeneration?: boolean
  includeHistoricalData?: boolean
  confidenceThreshold?: number
  triggerType?: 'diagnostic_completion' | 'performance_change' | 'manual_override' | 'periodic_review'
}

export interface ProfileUpdateResult {
  profile: LearningProfile
  analysis: LearningStyleAnalysis
  isFirstTime: boolean
  significantChange: boolean
  refinementId?: string
}

export class LearningProfileService {
  private supabase = createClient()

  /**
   * Generate or update learning profile based on diagnostic attempts
   */
  async generateProfile(
    userId: string,
    attempts: DiagnosticAttempt[],
    options: ProfileGenerationOptions = {}
  ): Promise<ProfileUpdateResult> {
    try {
      // Get existing profile if available
      const existingProfile = await this.getProfile(userId)
      const isFirstTime = !existingProfile

      // Get question metadata for classification
      const questionMetadata = await this.getQuestionMetadata(attempts)
      
      // Run classification analysis
      const analysis = classificationEngine.classifyLearningStyle({
        attempts,
        questionMetadata
      })

      // Check for significant changes
      const significantChange = existingProfile ? 
        this.detectSignificantChange(existingProfile, analysis) : true

      // Generate new profile data
      const profileData = this.buildProfileData(userId, analysis, attempts, existingProfile)

      // Save or update profile
      const profile = await this.saveProfile(profileData, isFirstTime)

      // Track refinement if this is an update
      let refinementId: string | undefined
      if (!isFirstTime && significantChange) {
        refinementId = await this.trackRefinement(
          userId, 
          existingProfile!, 
          analysis, 
          options.triggerType || 'diagnostic_completion'
        )
      }

      return {
        profile,
        analysis,
        isFirstTime,
        significantChange,
        refinementId
      }

    } catch (error) {
      console.error('Error generating learning profile:', error)
      throw new Error('Failed to generate learning profile')
    }
  }

  /**
   * Get existing learning profile for user
   */
  async getProfile(userId: string): Promise<LearningProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching learning profile:', error)
        return null
      }

      return data || null

    } catch (error) {
      console.error('Error fetching learning profile:', error)
      return null
    }
  }

  /**
   * Update existing profile with manual override
   */
  async updateProfileWithOverride(
    userId: string,
    primaryStyle: LearningStyleKey,
    secondaryStyle?: LearningStyleKey
  ): Promise<LearningProfile | null> {
    try {
      const existingProfile = await this.getProfile(userId)
      
      if (!existingProfile) {
        throw new Error('No existing profile found for manual override')
      }

      // Track the override as a refinement
      await this.trackRefinement(
        userId,
        existingProfile,
        {
          primaryStyle,
          secondaryStyle: secondaryStyle || null,
          scores: {
            visual_analytical: existingProfile.visual_analytical_score,
            fast_methodical: existingProfile.fast_methodical_score,
            conceptual_detail: existingProfile.conceptual_detail_score
          }
        } as LearningStyleAnalysis,
        'manual_override'
      )

      // Update profile with override settings
      const { data, error } = await this.supabase
        .from('learning_profiles')
        .update({
          manual_override_enabled: true,
          manual_primary_style: primaryStyle,
          manual_secondary_style: secondaryStyle || null,
          override_set_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile with override:', error)
        return null
      }

      return data

    } catch (error) {
      console.error('Error updating profile with override:', error)
      return null
    }
  }

  /**
   * Remove manual override and restore classified style
   */
  async removeManualOverride(userId: string): Promise<LearningProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('learning_profiles')
        .update({
          manual_override_enabled: false,
          manual_primary_style: null,
          manual_secondary_style: null,
          override_set_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error removing manual override:', error)
        return null
      }

      return data

    } catch (error) {
      console.error('Error removing manual override:', error)
      return null
    }
  }

  /**
   * Get learning style refinement history
   */
  async getRefinementHistory(userId: string, limit: number = 10): Promise<LearningStyleRefinement[]> {
    try {
      const { data, error } = await this.supabase
        .from('learning_style_refinements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching refinement history:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('Error fetching refinement history:', error)
      return []
    }
  }

  /**
   * Analyze profile stability and confidence trends
   */
  async analyzeProfileStability(userId: string): Promise<{
    stabilityScore: number
    confidenceTrend: 'increasing' | 'decreasing' | 'stable'
    recommendsReassessment: boolean
    daysSinceLastAssessment: number
  }> {
    try {
      const profile = await this.getProfile(userId)
      const refinements = await this.getRefinementHistory(userId, 5)

      if (!profile) {
        return {
          stabilityScore: 0,
          confidenceTrend: 'stable',
          recommendsReassessment: true,
          daysSinceLastAssessment: 0
        }
      }

      // Calculate days since last assessment
      const lastAssessment = profile.diagnostic_completed_at ? 
        new Date(profile.diagnostic_completed_at) : new Date(profile.created_at)
      const daysSinceLastAssessment = Math.floor(
        (Date.now() - lastAssessment.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Calculate stability score based on refinement frequency
      const stabilityScore = this.calculateStabilityScore(refinements, daysSinceLastAssessment)

      // Analyze confidence trend
      const confidenceTrend = this.analyzeConfidenceTrend(refinements, profile)

      // Determine if reassessment is recommended
      const recommendsReassessment = 
        daysSinceLastAssessment > 90 || // More than 3 months
        stabilityScore < 0.6 || // Low stability
        profile.overall_confidence < 70 // Low confidence

      return {
        stabilityScore,
        confidenceTrend,
        recommendsReassessment,
        daysSinceLastAssessment
      }

    } catch (error) {
      console.error('Error analyzing profile stability:', error)
      return {
        stabilityScore: 0.5,
        confidenceTrend: 'stable',
        recommendsReassessment: false,
        daysSinceLastAssessment: 0
      }
    }
  }

  /**
   * Get personalized learning recommendations based on profile
   */
  async getPersonalizedRecommendations(userId: string): Promise<{
    studyMethods: string[]
    practiceTypes: string[]
    difficultyAdjustments: string[]
    timeManagement: string[]
  }> {
    try {
      const profile = await this.getProfile(userId)
      
      if (!profile) {
        return {
          studyMethods: ['Complete learning style assessment first'],
          practiceTypes: ['Try different question types'],
          difficultyAdjustments: ['Start with mixed difficulty levels'],
          timeManagement: ['Practice at your own pace']
        }
      }

      const effectiveStyle = profile.manual_override_enabled ? 
        profile.manual_primary_style : profile.primary_learning_style

      const recommendations = this.generateRecommendationsByStyle(effectiveStyle, profile)
      
      return recommendations

    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return {
        studyMethods: [],
        practiceTypes: [],
        difficultyAdjustments: [],
        timeManagement: []
      }
    }
  }

  // Private helper methods

  /**
   * Get question metadata for classification
   */
  private async getQuestionMetadata(attempts: DiagnosticAttempt[]) {
    const questionIds = attempts.map(a => a.diagnostic_question_id)
    
    const { data, error } = await this.supabase
      .from('diagnostic_questions')
      .select(`
        id,
        diagnostic_category,
        expected_response_time,
        complexity_indicators,
        questions!inner(difficulty_level)
      `)
      .in('id', questionIds)

    if (error) {
      console.error('Error fetching question metadata:', error)
      return []
    }

    return (data || []).map(q => ({
      id: q.id,
      category: q.diagnostic_category,
      difficulty: q.questions?.difficulty_level || 5,
      hasVisualElements: q.complexity_indicators?.visual_elements || false,
      requiresDetailFocus: q.complexity_indicators?.detail_oriented || false,
      isConceptual: q.complexity_indicators?.logical_analysis || false,
      expectedResponseTime: q.expected_response_time || 60000
    }))
  }

  /**
   * Build profile data from analysis
   */
  private buildProfileData(
    userId: string,
    analysis: LearningStyleAnalysis,
    attempts: DiagnosticAttempt[],
    existingProfile?: LearningProfile | null
  ) {
    const now = new Date().toISOString()
    
    return {
      user_id: userId,
      has_completed_diagnostic: true,
      diagnostic_completed_at: now,
      visual_analytical_score: analysis.scores.visual_analytical,
      fast_methodical_score: analysis.scores.fast_methodical,
      conceptual_detail_score: analysis.scores.conceptual_detail,
      primary_learning_style: analysis.primaryStyle,
      secondary_learning_style: analysis.secondaryStyle,
      visual_analytical_confidence: analysis.confidence.visual_analytical,
      fast_methodical_confidence: analysis.confidence.fast_methodical,
      conceptual_detail_confidence: analysis.confidence.conceptual_detail,
      overall_confidence: analysis.confidence.overall,
      total_questions_analyzed: analysis.dataPoints.totalQuestions,
      avg_response_time: analysis.dataPoints.avgResponseTime,
      accuracy_variance: analysis.dataPoints.accuracyVariance,
      manual_override_enabled: existingProfile?.manual_override_enabled || false,
      manual_primary_style: existingProfile?.manual_primary_style || null,
      manual_secondary_style: existingProfile?.manual_secondary_style || null,
      override_set_at: existingProfile?.override_set_at || null,
      last_analyzed_at: now,
      updated_at: now
    }
  }

  /**
   * Save or update profile in database
   */
  private async saveProfile(profileData: any, isFirstTime: boolean): Promise<LearningProfile> {
    if (isFirstTime) {
      const { data, error } = await this.supabase
        .from('learning_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating learning profile:', error)
        throw new Error('Failed to create learning profile')
      }

      return data
    } else {
      const { data, error } = await this.supabase
        .from('learning_profiles')
        .update(profileData)
        .eq('user_id', profileData.user_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating learning profile:', error)
        throw new Error('Failed to update learning profile')
      }

      return data
    }
  }

  /**
   * Detect significant changes in learning style
   */
  private detectSignificantChange(
    existingProfile: LearningProfile,
    newAnalysis: LearningStyleAnalysis
  ): boolean {
    const oldScores = {
      visual_analytical: existingProfile.visual_analytical_score,
      fast_methodical: existingProfile.fast_methodical_score,
      conceptual_detail: existingProfile.conceptual_detail_score
    }

    const newScores = newAnalysis.scores

    // Check if any dimension changed by more than 0.15 (significant threshold)
    const significantThreshold = 0.15
    
    const changes = {
      visual_analytical: Math.abs(oldScores.visual_analytical - newScores.visual_analytical),
      fast_methodical: Math.abs(oldScores.fast_methodical - newScores.fast_methodical),
      conceptual_detail: Math.abs(oldScores.conceptual_detail - newScores.conceptual_detail)
    }

    return Object.values(changes).some(change => change > significantThreshold) ||
           existingProfile.primary_learning_style !== newAnalysis.primaryStyle
  }

  /**
   * Track learning style refinement
   */
  private async trackRefinement(
    userId: string,
    oldProfile: LearningProfile,
    newAnalysis: LearningStyleAnalysis,
    triggerType: string
  ): Promise<string> {
    const refinementData = {
      user_id: userId,
      trigger_type: triggerType,
      trigger_data: {
        old_style: oldProfile.primary_learning_style,
        new_style: newAnalysis.primaryStyle,
        confidence_change: newAnalysis.confidence.overall - oldProfile.overall_confidence
      },
      previous_scores: {
        visual_analytical: oldProfile.visual_analytical_score,
        fast_methodical: oldProfile.fast_methodical_score,
        conceptual_detail: oldProfile.conceptual_detail_score
      },
      new_scores: newAnalysis.scores,
      confidence_changes: {
        visual_analytical: newAnalysis.confidence.visual_analytical - oldProfile.visual_analytical_confidence,
        fast_methodical: newAnalysis.confidence.fast_methodical - oldProfile.fast_methodical_confidence,
        conceptual_detail: newAnalysis.confidence.conceptual_detail - oldProfile.conceptual_detail_confidence,
        overall: newAnalysis.confidence.overall - oldProfile.overall_confidence
      },
      significant_change: this.detectSignificantChange(oldProfile, newAnalysis),
      analysis_notes: `Learning style updated from ${oldProfile.primary_learning_style} to ${newAnalysis.primaryStyle}`,
      created_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('learning_style_refinements')
      .insert(refinementData)
      .select('id')
      .single()

    if (error) {
      console.error('Error tracking refinement:', error)
      throw new Error('Failed to track refinement')
    }

    return data.id
  }

  /**
   * Calculate profile stability score
   */
  private calculateStabilityScore(refinements: LearningStyleRefinement[], daysSinceLastAssessment: number): number {
    if (refinements.length === 0) return 1.0 // No changes = stable

    // Penalize frequent significant changes
    const significantChanges = refinements.filter(r => r.significant_change).length
    const changeFrequency = significantChanges / Math.max(daysSinceLastAssessment / 30, 1) // Changes per month

    // Stability decreases with change frequency
    return Math.max(0, 1 - (changeFrequency * 0.3))
  }

  /**
   * Analyze confidence trend from refinements
   */
  private analyzeConfidenceTrend(
    refinements: LearningStyleRefinement[],
    currentProfile: LearningProfile
  ): 'increasing' | 'decreasing' | 'stable' {
    if (refinements.length < 2) return 'stable'

    const confidenceChanges = refinements.map(r => 
      (r.confidence_changes as any)?.overall || 0
    ).filter(change => Math.abs(change) > 0)

    if (confidenceChanges.length === 0) return 'stable'

    const avgChange = confidenceChanges.reduce((sum, change) => sum + change, 0) / confidenceChanges.length

    if (avgChange > 5) return 'increasing'
    if (avgChange < -5) return 'decreasing'
    return 'stable'
  }

  /**
   * Generate recommendations by learning style
   */
  private generateRecommendationsByStyle(
    style: string | null, 
    profile: LearningProfile
  ) {
    if (!style) {
      return {
        studyMethods: ['Complete diagnostic assessment for personalized recommendations'],
        practiceTypes: ['Mixed question types'],
        difficultyAdjustments: ['Adaptive difficulty'],
        timeManagement: ['Flexible pacing']
      }
    }

    // Base recommendations on learning style patterns
    const isVisual = style.includes('visual')
    const isFast = style.includes('fast')
    const isConceptual = style.includes('conceptual')

    const studyMethods = []
    const practiceTypes = []
    const difficultyAdjustments = []
    const timeManagement = []

    // Visual vs Analytical
    if (isVisual) {
      studyMethods.push('Use diagrams and visual aids', 'Create mind maps for complex topics')
      practiceTypes.push('Logic games with visual elements', 'Diagram-based questions')
    } else {
      studyMethods.push('Focus on logical reasoning patterns', 'Practice step-by-step analysis')
      practiceTypes.push('Pure logical reasoning', 'Argument analysis questions')
    }

    // Fast vs Methodical
    if (isFast) {
      timeManagement.push('Use shorter practice sessions', 'Set time targets for questions')
      difficultyAdjustments.push('Try rapid-fire easy questions', 'Build speed with familiar patterns')
    } else {
      timeManagement.push('Allow extra time for thorough analysis', 'Practice without time pressure initially')
      difficultyAdjustments.push('Focus on systematic problem-solving', 'Break complex problems into steps')
    }

    // Conceptual vs Detail
    if (isConceptual) {
      studyMethods.push('Start with big-picture understanding', 'Connect concepts across topics')
      practiceTypes.push('Conceptual reasoning questions', 'Abstract problem types')
    } else {
      studyMethods.push('Master detailed analysis techniques', 'Practice careful reading comprehension')
      practiceTypes.push('Detail-focused reading passages', 'Precision-based questions')
    }

    return {
      studyMethods,
      practiceTypes,
      difficultyAdjustments,
      timeManagement
    }
  }
}

// Export singleton instance
export const profileService = new LearningProfileService()