/**
 * Learning Style Classification Engine
 * 
 * Advanced algorithms for classifying user learning styles based on
 * diagnostic quiz responses and behavioral data. Uses statistical analysis
 * and pattern recognition to determine optimal learning approaches.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

import type { 
  DiagnosticAttempt, 
  LearningStyleAnalysis, 
  LearningStyleKey,
  LEARNING_STYLE_CATEGORIES 
} from '@/types/learning-style'
import { behavioralTracker, type LearningDimensions, type BehavioralData } from './behavioral-tracker'

export interface ClassificationInput {
  attempts: DiagnosticAttempt[]
  questionMetadata: Array<{
    id: string
    category: string
    difficulty: number
    hasVisualElements: boolean
    requiresDetailFocus: boolean
    isConceptual: boolean
    expectedResponseTime: number
  }>
}

export interface DimensionWeights {
  responseTime: number
  accuracy: number
  confidence: number
  behavioral: number
  questionType: number
}

export interface ClassificationConfig {
  weights: DimensionWeights
  confidenceThreshold: number
  minimumDataPoints: number
  learningRateAdjustment: number
}

export class LearningStyleClassificationEngine {
  private config: ClassificationConfig = {
    weights: {
      responseTime: 0.25,    // How timing affects classification
      accuracy: 0.20,        // Performance impact
      confidence: 0.15,      // Self-reported confidence
      behavioral: 0.25,      // Behavioral patterns (changes, hesitation)
      questionType: 0.15     // Performance on different question types
    },
    confidenceThreshold: 0.65,
    minimumDataPoints: 8,
    learningRateAdjustment: 0.1
  }

  /**
   * Main classification method - analyzes all data to determine learning style
   */
  classifyLearningStyle(input: ClassificationInput): LearningStyleAnalysis {
    if (input.attempts.length < this.config.minimumDataPoints) {
      return this.generateLowConfidenceAnalysis(input)
    }

    // Extract and analyze behavioral patterns
    const behavioralAnalysis = this.analyzeBehavioralPatterns(input)
    
    // Calculate learning style dimensions
    const dimensions = this.calculateLearningDimensions(input, behavioralAnalysis)
    
    // Classify primary and secondary styles
    const { primaryStyle, secondaryStyle } = this.classifyStyles(dimensions)
    
    // Calculate confidence scores
    const confidence = this.calculateConfidenceScores(input, dimensions, behavioralAnalysis)
    
    // Generate recommendations and insights
    const recommendations = this.generateRecommendations(primaryStyle, secondaryStyle, dimensions)
    const strengths = this.identifyStrengths(primaryStyle, behavioralAnalysis)
    
    // Calculate data point statistics
    const dataPoints = this.calculateDataPointStats(input.attempts)

    return {
      primaryStyle,
      secondaryStyle,
      scores: {
        visual_analytical: dimensions.visual_analytical,
        fast_methodical: dimensions.fast_methodical,
        conceptual_detail: dimensions.conceptual_detail
      },
      confidence,
      recommendations,
      strengths,
      dataPoints
    }
  }

  /**
   * Analyze behavioral patterns from diagnostic attempts
   */
  private analyzeBehavioralPatterns(input: ClassificationInput): {
    avgResponseTime: number
    responseTimeVariance: number
    accuracyByCategory: Record<string, number>
    confidencePattern: number[]
    hesitationFrequency: number
    answerChangeFrequency: number
    eliminationUsage: number
  } {
    const attempts = input.attempts
    
    // Response time analysis
    const responseTimes = attempts.map(a => a.response_time)
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const responseTimeVariance = this.calculateVariance(responseTimes)
    
    // Accuracy by category
    const accuracyByCategory: Record<string, number> = {}
    const categoryAttempts: Record<string, DiagnosticAttempt[]> = {}
    
    attempts.forEach(attempt => {
      const questionMeta = input.questionMetadata.find(q => q.id === attempt.diagnostic_question_id)
      const category = questionMeta?.category || 'unknown'
      
      if (!categoryAttempts[category]) {
        categoryAttempts[category] = []
      }
      categoryAttempts[category].push(attempt)
    })
    
    Object.keys(categoryAttempts).forEach(category => {
      const categoryCorrect = categoryAttempts[category].filter(a => a.is_correct).length
      accuracyByCategory[category] = categoryCorrect / categoryAttempts[category].length
    })
    
    // Behavioral indicators
    const confidencePattern = attempts
      .filter(a => a.confidence_level !== null)
      .map(a => a.confidence_level!)
    
    const hesitationFrequency = attempts.filter(a => a.showed_hesitation).length / attempts.length
    const answerChangeFrequency = attempts.filter(a => a.changed_answer).length / attempts.length
    const eliminationUsage = attempts.filter(a => a.used_elimination).length / attempts.length

    return {
      avgResponseTime,
      responseTimeVariance,
      accuracyByCategory,
      confidencePattern,
      hesitationFrequency,
      answerChangeFrequency,
      eliminationUsage
    }
  }

  /**
   * Calculate the three main learning style dimensions
   */
  private calculateLearningDimensions(
    input: ClassificationInput, 
    behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>
  ): LearningDimensions {
    const attempts = input.attempts

    // Visual vs Analytical Dimension
    const visualAnalytical = this.calculateVisualAnalyticalDimension(input, behavioral)
    
    // Fast vs Methodical Dimension
    const fastMethodical = this.calculateFastMethodicalDimension(input, behavioral)
    
    // Conceptual vs Detail Dimension
    const conceptualDetail = this.calculateConceptualDetailDimension(input, behavioral)

    return {
      visual_analytical: this.normalizeScore(visualAnalytical),
      fast_methodical: this.normalizeScore(fastMethodical),
      conceptual_detail: this.normalizeScore(conceptualDetail)
    }
  }

  /**
   * Calculate Visual vs Analytical dimension (0.0 = Visual, 1.0 = Analytical)
   */
  private calculateVisualAnalyticalDimension(
    input: ClassificationInput,
    behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>
  ): number {
    let score = 0.5 // Start neutral
    
    // Analyze performance on different question types
    const visualQuestions = input.questionMetadata.filter(q => q.hasVisualElements)
    const analyticalQuestions = input.questionMetadata.filter(q => !q.hasVisualElements)
    
    if (visualQuestions.length > 0 && analyticalQuestions.length > 0) {
      const visualAccuracy = behavioral.accuracyByCategory['visual_pattern'] || 0.5
      const analyticalAccuracy = behavioral.accuracyByCategory['analytical_logic'] || 0.5
      
      // If analytical accuracy is higher, lean toward analytical
      score += (analyticalAccuracy - visualAccuracy) * 0.3
    }
    
    // Response time patterns on visual vs analytical questions
    const visualAttempts = input.attempts.filter(a => {
      const meta = input.questionMetadata.find(q => q.id === a.diagnostic_question_id)
      return meta?.hasVisualElements
    })
    
    const analyticalAttempts = input.attempts.filter(a => {
      const meta = input.questionMetadata.find(q => q.id === a.diagnostic_question_id)
      return meta && !meta.hasVisualElements
    })
    
    if (visualAttempts.length > 0 && analyticalAttempts.length > 0) {
      const avgVisualTime = visualAttempts.reduce((sum, a) => sum + a.response_time, 0) / visualAttempts.length
      const avgAnalyticalTime = analyticalAttempts.reduce((sum, a) => sum + a.response_time, 0) / analyticalAttempts.length
      
      // Faster on analytical questions suggests analytical preference
      if (avgAnalyticalTime < avgVisualTime) {
        score += 0.2
      } else {
        score -= 0.2
      }
    }
    
    // Elimination usage (analytical thinkers use elimination more)
    score += behavioral.eliminationUsage * 0.3
    
    return score
  }

  /**
   * Calculate Fast vs Methodical dimension (0.0 = Fast, 1.0 = Methodical)
   */
  private calculateFastMethodicalDimension(
    input: ClassificationInput,
    behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>
  ): number {
    let score = 0.5 // Start neutral
    
    // Response time relative to expected time
    const expectedTimes = input.questionMetadata.map(q => q.expectedResponseTime)
    const avgExpectedTime = expectedTimes.reduce((sum, time) => sum + time, 0) / expectedTimes.length
    
    const timeRatio = behavioral.avgResponseTime / avgExpectedTime
    
    if (timeRatio < 0.8) {
      score -= 0.3 // Fast tendency
    } else if (timeRatio > 1.5) {
      score += 0.3 // Methodical tendency
    }
    
    // Hesitation frequency
    score += behavioral.hesitationFrequency * 0.4
    
    // Answer changing behavior (methodical thinkers change answers more)
    score += behavioral.answerChangeFrequency * 0.3
    
    // Response time variance (consistent times suggest methodical approach)
    const normalizedVariance = behavioral.responseTimeVariance / (avgExpectedTime * avgExpectedTime)
    if (normalizedVariance < 0.1) {
      score += 0.2 // Low variance = methodical
    }
    
    return score
  }

  /**
   * Calculate Conceptual vs Detail dimension (0.0 = Conceptual, 1.0 = Detail-oriented)
   */
  private calculateConceptualDetailDimension(
    input: ClassificationInput,
    behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>
  ): number {
    let score = 0.5 // Start neutral
    
    // Performance on detail-focused vs conceptual questions
    const detailAccuracy = behavioral.accuracyByCategory['detail_focus'] || 0.5
    const conceptualAccuracy = behavioral.accuracyByCategory['conceptual_reasoning'] || 0.5
    
    score += (detailAccuracy - conceptualAccuracy) * 0.4
    
    // Response time on reading comprehension (detail questions) vs conceptual reasoning
    const detailAttempts = input.attempts.filter(a => {
      const meta = input.questionMetadata.find(q => q.id === a.diagnostic_question_id)
      return meta?.requiresDetailFocus
    })
    
    const conceptualAttempts = input.attempts.filter(a => {
      const meta = input.questionMetadata.find(q => q.id === a.diagnostic_question_id)
      return meta?.isConceptual
    })
    
    if (detailAttempts.length > 0 && conceptualAttempts.length > 0) {
      const avgDetailTime = detailAttempts.reduce((sum, a) => sum + a.response_time, 0) / detailAttempts.length
      const avgConceptualTime = conceptualAttempts.reduce((sum, a) => sum + a.response_time, 0) / conceptualAttempts.length
      
      // Faster on detail questions suggests detail orientation
      if (avgDetailTime < avgConceptualTime) {
        score += 0.2
      } else {
        score -= 0.2
      }
    }
    
    // Confidence patterns (detail-oriented learners often less confident on broad concepts)
    if (behavioral.confidencePattern.length > 0) {
      const avgConfidence = behavioral.confidencePattern.reduce((sum, c) => sum + c, 0) / behavioral.confidencePattern.length
      
      // Lower confidence might suggest detail orientation (wants more information)
      if (avgConfidence < 3) {
        score += 0.15
      } else if (avgConfidence > 4) {
        score -= 0.15
      }
    }
    
    return score
  }

  /**
   * Classify primary and secondary learning styles based on dimensions
   */
  private classifyStyles(dimensions: LearningDimensions): {
    primaryStyle: LearningStyleKey
    secondaryStyle: LearningStyleKey | null
  } {
    // Create style key based on dimension scores
    const visualAnalytical = dimensions.visual_analytical < 0.5 ? 'visual' : 'analytical'
    const fastMethodical = dimensions.fast_methodical < 0.5 ? 'fast' : 'methodical'
    const conceptualDetail = dimensions.conceptual_detail < 0.5 ? 'conceptual' : 'detail'
    
    const primaryStyle: LearningStyleKey = `${visualAnalytical}-${fastMethodical}-${conceptualDetail}` as LearningStyleKey
    
    // Calculate secondary style (flip the dimension with smallest margin)
    const margins = {
      visual_analytical: Math.abs(dimensions.visual_analytical - 0.5),
      fast_methodical: Math.abs(dimensions.fast_methodical - 0.5),
      conceptual_detail: Math.abs(dimensions.conceptual_detail - 0.5)
    }
    
    const minMarginDimension = Object.keys(margins).reduce((a, b) => 
      margins[a as keyof typeof margins] < margins[b as keyof typeof margins] ? a : b
    ) as keyof typeof margins
    
    // Only provide secondary style if primary style confidence is reasonable
    let secondaryStyle: LearningStyleKey | null = null
    
    if (margins[minMarginDimension] < 0.2) { // Close to neutral
      const altDimensions = { ...dimensions }
      altDimensions[minMarginDimension] = altDimensions[minMarginDimension] < 0.5 ? 0.7 : 0.3
      
      const altVisualAnalytical = altDimensions.visual_analytical < 0.5 ? 'visual' : 'analytical'
      const altFastMethodical = altDimensions.fast_methodical < 0.5 ? 'fast' : 'methodical'
      const altConceptualDetail = altDimensions.conceptual_detail < 0.5 ? 'conceptual' : 'detail'
      
      secondaryStyle = `${altVisualAnalytical}-${altFastMethodical}-${altConceptualDetail}` as LearningStyleKey
    }
    
    return { primaryStyle, secondaryStyle }
  }

  /**
   * Calculate confidence scores for the analysis
   */
  private calculateConfidenceScores(
    input: ClassificationInput,
    dimensions: LearningDimensions,
    behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>
  ): LearningStyleAnalysis['confidence'] {
    const baseConfidence = Math.min(input.attempts.length / this.config.minimumDataPoints, 1) * 70
    
    // Dimension confidence based on how far from neutral (0.5) each score is
    const visualAnalyticalConfidence = baseConfidence + (Math.abs(dimensions.visual_analytical - 0.5) * 60)
    const fastMethodicalConfidence = baseConfidence + (Math.abs(dimensions.fast_methodical - 0.5) * 60)
    const conceptualDetailConfidence = baseConfidence + (Math.abs(dimensions.conceptual_detail - 0.5) * 60)
    
    // Boost confidence if behavioral patterns are consistent
    const consistencyBonus = this.calculateConsistencyBonus(behavioral)
    
    const overall = (visualAnalyticalConfidence + fastMethodicalConfidence + conceptualDetailConfidence) / 3 + consistencyBonus

    return {
      visual_analytical: Math.min(Math.round(visualAnalyticalConfidence + consistencyBonus), 100),
      fast_methodical: Math.min(Math.round(fastMethodicalConfidence + consistencyBonus), 100),
      conceptual_detail: Math.min(Math.round(conceptualDetailConfidence + consistencyBonus), 100),
      overall: Math.min(Math.round(overall), 100)
    }
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    primaryStyle: LearningStyleKey,
    secondaryStyle: LearningStyleKey | null,
    dimensions: LearningDimensions
  ): string[] {
    const recommendations: string[] = []
    
    // Base recommendations from style categories
    const primaryInfo = (LEARNING_STYLE_CATEGORIES as any)[primaryStyle]
    if (primaryInfo?.recommendations) {
      recommendations.push(...primaryInfo.recommendations)
    }
    
    // Dimension-specific recommendations
    if (dimensions.fast_methodical < 0.3) {
      recommendations.push('Use timed practice sessions to leverage your quick thinking')
    } else if (dimensions.fast_methodical > 0.7) {
      recommendations.push('Create detailed study schedules with systematic review')
    }
    
    if (dimensions.visual_analytical < 0.3) {
      recommendations.push('Utilize diagrams, charts, and visual aids in your studies')
    } else if (dimensions.visual_analytical > 0.7) {
      recommendations.push('Focus on logical frameworks and step-by-step analysis')
    }
    
    if (dimensions.conceptual_detail < 0.3) {
      recommendations.push('Start with big-picture concepts before diving into details')
    } else if (dimensions.conceptual_detail > 0.7) {
      recommendations.push('Build understanding through detailed analysis and examples')
    }
    
    return recommendations.slice(0, 5) // Limit to top 5 recommendations
  }

  /**
   * Identify key strengths based on learning style and performance
   */
  private identifyStrengths(
    primaryStyle: LearningStyleKey,
    behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>
  ): string[] {
    const strengths: string[] = []
    
    // Base strengths from style categories
    const styleInfo = (LEARNING_STYLE_CATEGORIES as any)[primaryStyle]
    if (styleInfo?.strengths) {
      strengths.push(...styleInfo.strengths)
    }
    
    // Performance-based strengths
    if (behavioral.eliminationUsage > 0.5) {
      strengths.push('Strategic problem-solving approach')
    }
    
    if (behavioral.answerChangeFrequency < 0.15) {
      strengths.push('Confident decision making')
    }
    
    if (behavioral.confidencePattern.length > 0) {
      const avgConfidence = behavioral.confidencePattern.reduce((sum, c) => sum + c, 0) / behavioral.confidencePattern.length
      if (avgConfidence > 3.5) {
        strengths.push('Strong self-assessment abilities')
      }
    }
    
    return strengths.slice(0, 4) // Limit to top 4 strengths
  }

  /**
   * Calculate data point statistics
   */
  private calculateDataPointStats(attempts: DiagnosticAttempt[]): LearningStyleAnalysis['dataPoints'] {
    const responseTimes = attempts.map(a => a.response_time)
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const accuracyVariance = this.calculateAccuracyVariance(attempts)
    
    return {
      totalQuestions: attempts.length,
      avgResponseTime: Math.round(avgResponseTime),
      accuracyVariance: Number(accuracyVariance.toFixed(4))
    }
  }

  /**
   * Generate low confidence analysis for insufficient data
   */
  private generateLowConfidenceAnalysis(input: ClassificationInput): LearningStyleAnalysis {
    return {
      primaryStyle: 'analytical-methodical-detail', // Default style
      secondaryStyle: null,
      scores: {
        visual_analytical: 0.5,
        fast_methodical: 0.5,
        conceptual_detail: 0.5
      },
      confidence: {
        visual_analytical: 25,
        fast_methodical: 25,
        conceptual_detail: 25,
        overall: 25
      },
      recommendations: [
        'Complete more diagnostic questions for better accuracy',
        'Continue practicing to establish learning patterns',
        'Try different question types to identify preferences'
      ],
      strengths: [
        'Willing to explore different approaches',
        'Open to learning style discovery'
      ],
      dataPoints: this.calculateDataPointStats(input.attempts)
    }
  }

  // Utility methods
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score))
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2))
    return squaredDifferences.reduce((sum, sq) => sum + sq, 0) / numbers.length
  }

  private calculateConsistencyBonus(behavioral: ReturnType<typeof this.analyzeBehavioralPatterns>): number {
    // Award bonus points for consistent behavioral patterns
    let bonus = 0
    
    // Consistent confidence levels
    if (behavioral.confidencePattern.length > 3) {
      const variance = this.calculateVariance(behavioral.confidencePattern)
      if (variance < 0.8) bonus += 5 // Consistent confidence
    }
    
    // Consistent response time patterns
    if (behavioral.responseTimeVariance < (behavioral.avgResponseTime * 0.3)) {
      bonus += 5 // Consistent timing
    }
    
    return Math.min(bonus, 15) // Cap bonus at 15 points
  }

  private calculateAccuracyVariance(attempts: DiagnosticAttempt[]): number {
    const accuracies = attempts.map(a => a.is_correct ? 1 : 0)
    return this.calculateVariance(accuracies)
  }
}

// Export singleton instance
export const classificationEngine = new LearningStyleClassificationEngine()