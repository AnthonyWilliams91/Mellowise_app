/**
 * Behavioral Tracking Service
 * 
 * Advanced behavioral data collection for learning style assessment.
 * Tracks user interactions, response patterns, and learning preferences
 * to enhance the accuracy of learning style classification.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

export interface BehavioralData {
  // Timing patterns
  responseTime: number
  hesitationTime: number
  quickResponseThreshold: number
  
  // Answer behavior
  answerChanges: number
  eliminationUsed: boolean
  confidencePattern: number[]
  
  // Interaction patterns
  scrollBehavior: {
    totalScrolls: number
    timeSpentReading: number
    revisitedSections: number
  }
  
  // Cognitive indicators
  processingStyle: 'quick' | 'methodical' | 'mixed'
  confidenceConsistency: number
  accuracyPattern: boolean[]
}

export interface LearningDimensions {
  visual_analytical: number      // Visual processing vs analytical reasoning
  fast_methodical: number        // Quick decisions vs methodical approach  
  conceptual_detail: number      // Big picture vs detail focus
}

export class BehavioralTracker {
  private trackingData: Map<string, BehavioralData> = new Map()
  private sessionStartTime: number = Date.now()

  /**
   * Track a question response with detailed behavioral data
   */
  trackQuestionResponse(
    questionId: string,
    questionType: string,
    difficulty: number,
    responseData: {
      startTime: number
      endTime: number
      selectedAnswer: string
      correctAnswer: string
      answerChanges: number
      confidenceLevel: number
      usedElimination: boolean
      scrollEvents: any[]
    }
  ): BehavioralData {
    const responseTime = responseData.endTime - responseData.startTime
    const isCorrect = responseData.selectedAnswer === responseData.correctAnswer
    
    // Calculate hesitation threshold based on question difficulty
    const expectedTime = this.calculateExpectedTime(questionType, difficulty)
    const hesitationThreshold = expectedTime * 1.5
    const hesitationTime = Math.max(0, responseTime - hesitationThreshold)
    
    // Analyze scroll behavior
    const scrollBehavior = this.analyzeScrollBehavior(responseData.scrollEvents)
    
    // Determine processing style
    const processingStyle = this.determineProcessingStyle(responseTime, expectedTime, responseData.answerChanges)
    
    const behavioralData: BehavioralData = {
      responseTime,
      hesitationTime,
      quickResponseThreshold: expectedTime * 0.7,
      answerChanges: responseData.answerChanges,
      eliminationUsed: responseData.usedElimination,
      confidencePattern: [responseData.confidenceLevel],
      scrollBehavior,
      processingStyle,
      confidenceConsistency: this.calculateConfidenceConsistency([responseData.confidenceLevel]),
      accuracyPattern: [isCorrect]
    }
    
    // Store tracking data
    this.trackingData.set(questionId, behavioralData)
    
    return behavioralData
  }

  /**
   * Analyze learning style dimensions from behavioral data
   */
  analyzeLearningDimensions(questionData: Array<{
    questionId: string
    questionType: string
    difficulty: number
    hasVisualElements: boolean
    requiresDetailFocus: boolean
    isConceptual: boolean
  }>): LearningDimensions {
    const allData = Array.from(this.trackingData.values())
    
    if (allData.length === 0) {
      return {
        visual_analytical: 0.5,
        fast_methodical: 0.5,
        conceptual_detail: 0.5
      }
    }

    // Calculate visual vs analytical preference
    const visualAnalytical = this.calculateVisualAnalyticalScore(questionData)
    
    // Calculate fast vs methodical preference
    const fastMethodical = this.calculateFastMethodicalScore(allData)
    
    // Calculate conceptual vs detail preference
    const conceptualDetail = this.calculateConceptualDetailScore(questionData, allData)

    return {
      visual_analytical: this.normalizeScore(visualAnalytical),
      fast_methodical: this.normalizeScore(fastMethodical),
      conceptual_detail: this.normalizeScore(conceptualDetail)
    }
  }

  /**
   * Calculate confidence scores for learning style assessment
   */
  calculateConfidenceScores(dimensions: LearningDimensions): {
    visual_analytical: number
    fast_methodical: number
    conceptual_detail: number
    overall: number
  } {
    const dataPoints = this.trackingData.size
    const minDataPoints = 5
    
    // Base confidence on amount of data collected
    const dataConfidence = Math.min(dataPoints / minDataPoints, 1) * 100
    
    // Adjust confidence based on consistency of patterns
    const allData = Array.from(this.trackingData.values())
    const consistencyBonus = this.calculatePatternConsistency(allData) * 20
    
    // Calculate dimension-specific confidence
    const visualAnalyticalConfidence = Math.min(dataConfidence + this.calculateDimensionConfidence(dimensions.visual_analytical) + consistencyBonus, 100)
    const fastMethodicalConfidence = Math.min(dataConfidence + this.calculateDimensionConfidence(dimensions.fast_methodical) + consistencyBonus, 100)
    const conceptualDetailConfidence = Math.min(dataConfidence + this.calculateDimensionConfidence(dimensions.conceptual_detail) + consistencyBonus, 100)
    
    const overall = (visualAnalyticalConfidence + fastMethodicalConfidence + conceptualDetailConfidence) / 3

    return {
      visual_analytical: Math.round(visualAnalyticalConfidence),
      fast_methodical: Math.round(fastMethodicalConfidence),
      conceptual_detail: Math.round(conceptualDetailConfidence),
      overall: Math.round(overall)
    }
  }

  /**
   * Get behavioral insights for user feedback
   */
  getBehavioralInsights(): {
    strengths: string[]
    patterns: string[]
    recommendations: string[]
  } {
    const allData = Array.from(this.trackingData.values())
    const strengths: string[] = []
    const patterns: string[] = []
    const recommendations: string[] = []

    if (allData.length === 0) {
      return { strengths, patterns, recommendations }
    }

    // Analyze response time patterns
    const avgResponseTime = allData.reduce((sum, data) => sum + data.responseTime, 0) / allData.length
    const fastResponses = allData.filter(data => data.responseTime < data.quickResponseThreshold).length
    const fastResponseRate = fastResponses / allData.length

    if (fastResponseRate > 0.7) {
      strengths.push('Quick decision making')
      patterns.push('Consistently fast response times')
      recommendations.push('Consider speed-based practice sessions')
    } else if (fastResponseRate < 0.3) {
      strengths.push('Thorough analysis')
      patterns.push('Takes time to consider options carefully')
      recommendations.push('Focus on systematic problem-solving approaches')
    }

    // Analyze confidence patterns
    const confidenceLevels = allData.flatMap(data => data.confidencePattern)
    const avgConfidence = confidenceLevels.reduce((sum, conf) => sum + conf, 0) / confidenceLevels.length
    
    if (avgConfidence > 4) {
      strengths.push('High confidence in answers')
      patterns.push('Shows strong self-assurance')
    } else if (avgConfidence < 2.5) {
      patterns.push('Tends to be cautious with confidence levels')
      recommendations.push('Build confidence through targeted practice')
    }

    // Analyze answer changing behavior
    const changeBehavior = allData.filter(data => data.answerChanges > 0).length
    const changeRate = changeBehavior / allData.length

    if (changeRate > 0.3) {
      patterns.push('Frequently reconsiders initial answers')
      recommendations.push('Trust your first instinct more often')
    } else if (changeRate < 0.1) {
      strengths.push('Decisive answer selection')
      patterns.push('Sticks with initial choices')
    }

    // Analyze elimination usage
    const eliminationUsage = allData.filter(data => data.eliminationUsed).length
    const eliminationRate = eliminationUsage / allData.length

    if (eliminationRate > 0.5) {
      strengths.push('Strategic use of process of elimination')
      patterns.push('Systematically eliminates wrong answers')
    }

    return { strengths, patterns, recommendations }
  }

  /**
   * Export comprehensive behavioral report
   */
  exportBehavioralReport(): {
    summary: {
      totalQuestions: number
      avgResponseTime: number
      avgConfidence: number
      accuracyRate: number
    }
    patterns: {
      processingStyles: Record<string, number>
      responseTimeDistribution: Record<string, number>
      confidenceDistribution: Record<string, number>
    }
    insights: ReturnType<typeof this.getBehavioralInsights>
  } {
    const allData = Array.from(this.trackingData.values())
    
    if (allData.length === 0) {
      return {
        summary: { totalQuestions: 0, avgResponseTime: 0, avgConfidence: 0, accuracyRate: 0 },
        patterns: { processingStyles: {}, responseTimeDistribution: {}, confidenceDistribution: {} },
        insights: { strengths: [], patterns: [], recommendations: [] }
      }
    }

    // Calculate summary statistics
    const totalQuestions = allData.length
    const avgResponseTime = allData.reduce((sum, data) => sum + data.responseTime, 0) / allData.length
    const allConfidence = allData.flatMap(data => data.confidencePattern)
    const avgConfidence = allConfidence.reduce((sum, conf) => sum + conf, 0) / allConfidence.length
    const allAccuracy = allData.flatMap(data => data.accuracyPattern)
    const accuracyRate = allAccuracy.filter(Boolean).length / allAccuracy.length

    // Analyze patterns
    const processingStyles = this.analyzeProcessingStyleDistribution(allData)
    const responseTimeDistribution = this.analyzeResponseTimeDistribution(allData)
    const confidenceDistribution = this.analyzeConfidenceDistribution(allConfidence)

    return {
      summary: {
        totalQuestions,
        avgResponseTime: Math.round(avgResponseTime),
        avgConfidence: Number(avgConfidence.toFixed(1)),
        accuracyRate: Number((accuracyRate * 100).toFixed(1))
      },
      patterns: {
        processingStyles,
        responseTimeDistribution,
        confidenceDistribution
      },
      insights: this.getBehavioralInsights()
    }
  }

  // Private helper methods
  private calculateExpectedTime(questionType: string, difficulty: number): number {
    const baseTime = {
      'logical_reasoning': 75000,
      'logic_games': 90000,
      'reading_comprehension': 60000,
      'analytical_reasoning': 80000
    }
    
    const base = baseTime[questionType as keyof typeof baseTime] || 70000
    const difficultyMultiplier = 1 + (difficulty - 5) * 0.1
    
    return base * difficultyMultiplier
  }

  private analyzeScrollBehavior(scrollEvents: any[]): BehavioralData['scrollBehavior'] {
    if (!scrollEvents || scrollEvents.length === 0) {
      return { totalScrolls: 0, timeSpentReading: 0, revisitedSections: 0 }
    }

    // This would be implemented with actual scroll event analysis
    return {
      totalScrolls: scrollEvents.length,
      timeSpentReading: 0, // Calculate from scroll timing
      revisitedSections: 0  // Detect scroll-back patterns
    }
  }

  private determineProcessingStyle(responseTime: number, expectedTime: number, answerChanges: number): BehavioralData['processingStyle'] {
    const ratio = responseTime / expectedTime
    
    if (ratio < 0.7 && answerChanges === 0) return 'quick'
    if (ratio > 1.3 || answerChanges > 1) return 'methodical'
    return 'mixed'
  }

  private calculateVisualAnalyticalScore(questionData: Array<{ hasVisualElements: boolean }>): number {
    // Implementation would analyze performance on visual vs analytical questions
    return 0.5 // Placeholder
  }

  private calculateFastMethodicalScore(behavioralData: BehavioralData[]): number {
    const quickDecisions = behavioralData.filter(data => data.processingStyle === 'quick').length
    const methodicalDecisions = behavioralData.filter(data => data.processingStyle === 'methodical').length
    
    if (quickDecisions + methodicalDecisions === 0) return 0.5
    
    return quickDecisions / (quickDecisions + methodicalDecisions)
  }

  private calculateConceptualDetailScore(questionData: Array<{ isConceptual: boolean, requiresDetailFocus: boolean }>, behavioralData: BehavioralData[]): number {
    // Implementation would analyze performance patterns on conceptual vs detail questions
    return 0.5 // Placeholder
  }

  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score))
  }

  private calculateConfidenceConsistency(confidenceLevels: number[]): number {
    if (confidenceLevels.length < 2) return 1
    
    const variance = this.calculateVariance(confidenceLevels)
    return Math.max(0, 1 - variance / 2) // Normalize variance to 0-1 scale
  }

  private calculatePatternConsistency(behavioralData: BehavioralData[]): number {
    // Analyze consistency across different behavioral patterns
    return 0.5 // Placeholder for complex pattern analysis
  }

  private calculateDimensionConfidence(dimensionScore: number): number {
    // Higher confidence for scores further from 0.5 (neutral)
    return Math.abs(dimensionScore - 0.5) * 40
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2))
    return squaredDifferences.reduce((sum, sq) => sum + sq, 0) / numbers.length
  }

  private analyzeProcessingStyleDistribution(data: BehavioralData[]): Record<string, number> {
    const styles = { quick: 0, methodical: 0, mixed: 0 }
    data.forEach(item => styles[item.processingStyle]++)
    return styles
  }

  private analyzeResponseTimeDistribution(data: BehavioralData[]): Record<string, number> {
    const distribution = { 'fast': 0, 'average': 0, 'slow': 0 }
    
    data.forEach(item => {
      if (item.responseTime < item.quickResponseThreshold) {
        distribution.fast++
      } else if (item.hesitationTime > 0) {
        distribution.slow++
      } else {
        distribution.average++
      }
    })
    
    return distribution
  }

  private analyzeConfidenceDistribution(confidenceLevels: number[]): Record<string, number> {
    const distribution = { 'low': 0, 'medium': 0, 'high': 0 }
    
    confidenceLevels.forEach(level => {
      if (level <= 2) {
        distribution.low++
      } else if (level >= 4) {
        distribution.high++
      } else {
        distribution.medium++
      }
    })
    
    return distribution
  }

  /**
   * Reset tracking data for new session
   */
  reset(): void {
    this.trackingData.clear()
    this.sessionStartTime = Date.now()
  }

  /**
   * Get current tracking data size
   */
  getDataPointCount(): number {
    return this.trackingData.size
  }
}

// Export singleton instance
export const behavioralTracker = new BehavioralTracker()