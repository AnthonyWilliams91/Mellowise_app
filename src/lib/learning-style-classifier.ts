/**
 * Learning Style Classification Algorithm
 * 
 * MELLOWISE-009: AI Learning Style Assessment
 * Analyzes user performance patterns to classify learning preferences
 */

import type { 
  DiagnosticAttempt, 
  DiagnosticQuestion, 
  LearningStyleAnalysis, 
  LearningStyleKey,
  LEARNING_STYLE_CATEGORIES 
} from '@/types/learning-style'

interface PerformanceMetrics {
  avgResponseTime: number
  accuracyByCategory: Record<string, number>
  responseTimeVariance: number
  hesitationPattern: number
  eliminationUsage: number
  confidencePattern: number
  visualVsTextPerformance: number
  speedAccuracyTradeoff: number
}

interface DimensionScores {
  visual_analytical: number      // 0.0 = Visual, 1.0 = Analytical
  fast_methodical: number        // 0.0 = Fast-paced, 1.0 = Methodical
  conceptual_detail: number      // 0.0 = Conceptual, 1.0 = Detail-oriented
}

interface DimensionConfidence {
  visual_analytical: number
  fast_methodical: number
  conceptual_detail: number
  overall: number
}

export class LearningStyleClassifier {
  private attempts: DiagnosticAttempt[]
  private questions: DiagnosticQuestion[]
  private metrics: PerformanceMetrics

  constructor(attempts: DiagnosticAttempt[], questions: DiagnosticQuestion[]) {
    this.attempts = attempts
    this.questions = questions
    this.metrics = this.calculateMetrics()
  }

  /**
   * Main classification method
   */
  public classify(): LearningStyleAnalysis {
    const scores = this.calculateDimensionScores()
    const confidence = this.calculateConfidence()
    const primaryStyle = this.determinePrimaryStyle(scores)
    const secondaryStyle = this.determineSecondaryStyle(scores, primaryStyle)
    
    return {
      primaryStyle,
      secondaryStyle,
      scores,
      confidence,
      recommendations: this.generateRecommendations(primaryStyle),
      strengths: this.identifyStrengths(primaryStyle),
      dataPoints: {
        totalQuestions: this.attempts.length,
        avgResponseTime: this.metrics.avgResponseTime,
        accuracyVariance: this.metrics.responseTimeVariance
      }
    }
  }

  /**
   * Calculate basic performance metrics
   */
  private calculateMetrics(): PerformanceMetrics {
    const responseTimes = this.attempts.map(a => a.response_time)
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    
    // Response time variance
    const variance = responseTimes.reduce((sum, time) => 
      sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
    const responseTimeVariance = Math.sqrt(variance)

    // Accuracy by category
    const accuracyByCategory: Record<string, number> = {}
    const categoryCounts: Record<string, { correct: number, total: number }> = {}
    
    this.attempts.forEach(attempt => {
      const question = this.questions.find(q => q.id === attempt.diagnostic_question_id)
      if (!question) return
      
      const category = question.diagnostic_category
      if (!categoryCounts[category]) {
        categoryCounts[category] = { correct: 0, total: 0 }
      }
      
      categoryCounts[category].total++
      if (attempt.is_correct) {
        categoryCounts[category].correct++
      }
    })
    
    Object.entries(categoryCounts).forEach(([category, counts]) => {
      accuracyByCategory[category] = counts.total > 0 ? counts.correct / counts.total : 0
    })

    // Behavioral patterns
    const hesitationPattern = this.attempts.filter(a => a.showed_hesitation).length / this.attempts.length
    const eliminationUsage = this.attempts.filter(a => a.used_elimination).length / this.attempts.length
    const answerChanges = this.attempts.filter(a => a.changed_answer).length / this.attempts.length
    
    // Confidence pattern (if available)
    const confidenceLevels = this.attempts.filter(a => a.confidence_level !== null).map(a => a.confidence_level!)
    const confidencePattern = confidenceLevels.length > 0 ? 
      confidenceLevels.reduce((sum, level) => sum + level, 0) / confidenceLevels.length / 5 : 0.5

    // Visual vs Text performance
    const visualQuestions = this.attempts.filter(attempt => {
      const question = this.questions.find(q => q.id === attempt.diagnostic_question_id)
      return question?.complexity_indicators?.visual_elements === true
    })
    const textQuestions = this.attempts.filter(attempt => {
      const question = this.questions.find(q => q.id === attempt.diagnostic_question_id)
      return question?.complexity_indicators?.text_heavy === true
    })
    
    const visualAccuracy = visualQuestions.length > 0 ? 
      visualQuestions.filter(a => a.is_correct).length / visualQuestions.length : 0.5
    const textAccuracy = textQuestions.length > 0 ?
      textQuestions.filter(a => a.is_correct).length / textQuestions.length : 0.5
    
    const visualVsTextPerformance = textAccuracy > 0 ? visualAccuracy / textAccuracy : 1

    // Speed vs Accuracy tradeoff
    const speedAccuracyTradeoff = this.calculateSpeedAccuracyTradeoff()

    return {
      avgResponseTime,
      accuracyByCategory,
      responseTimeVariance,
      hesitationPattern,
      eliminationUsage,
      confidencePattern,
      visualVsTextPerformance,
      speedAccuracyTradeoff
    }
  }

  /**
   * Calculate dimensional scores
   */
  private calculateDimensionScores(): DimensionScores {
    // Visual vs Analytical (0.0 = Visual, 1.0 = Analytical)
    const visualAnalytical = this.calculateVisualAnalyticalScore()
    
    // Fast vs Methodical (0.0 = Fast-paced, 1.0 = Methodical)
    const fastMethodical = this.calculateFastMethodicalScore()
    
    // Conceptual vs Detail (0.0 = Conceptual, 1.0 = Detail-oriented)
    const conceptualDetail = this.calculateConceptualDetailScore()

    return {
      visual_analytical: Math.max(0, Math.min(1, visualAnalytical)),
      fast_methodical: Math.max(0, Math.min(1, fastMethodical)),
      conceptual_detail: Math.max(0, Math.min(1, conceptualDetail))
    }
  }

  private calculateVisualAnalyticalScore(): number {
    // Start with base score
    let score = 0.5
    
    // Visual performance vs analytical performance
    const visualPerf = this.metrics.accuracyByCategory['visual_pattern'] || 0.5
    const analyticalPerf = this.metrics.accuracyByCategory['analytical_logic'] || 0.5
    
    // If analytical performance is better, push towards analytical (1.0)
    if (analyticalPerf > visualPerf) {
      score += (analyticalPerf - visualPerf) * 0.3
    } else {
      // If visual performance is better, push towards visual (0.0)  
      score -= (visualPerf - analyticalPerf) * 0.3
    }
    
    // Visual vs text performance indicator
    if (this.metrics.visualVsTextPerformance > 1.1) {
      score -= 0.2 // Better with visual = more visual
    } else if (this.metrics.visualVsTextPerformance < 0.9) {
      score += 0.2 // Better with text = more analytical
    }
    
    return score
  }

  private calculateFastMethodicalScore(): number {
    let score = 0.5
    
    // Response time patterns
    const expectedTimes = this.attempts.map(attempt => {
      const question = this.questions.find(q => q.id === attempt.diagnostic_question_id)
      return question?.expected_response_time || 60000
    })
    
    const avgExpected = expectedTimes.reduce((sum, time) => sum + time, 0) / expectedTimes.length
    const timeRatio = this.metrics.avgResponseTime / avgExpected
    
    // Faster than expected = more fast-paced (0.0)
    if (timeRatio < 0.8) {
      score -= 0.3
    } else if (timeRatio > 1.2) {
      // Slower than expected = more methodical (1.0)
      score += 0.3
    }
    
    // Hesitation and answer changing patterns
    score += this.metrics.hesitationPattern * 0.2 // More hesitation = more methodical
    score += (this.attempts.filter(a => a.changed_answer).length / this.attempts.length) * 0.2
    
    // Speed tests performance
    const speedTestPerf = this.metrics.accuracyByCategory['speed_test'] || 0.5
    if (speedTestPerf > 0.7) {
      score -= 0.2 // Good at speed tests = more fast-paced
    } else if (speedTestPerf < 0.5) {
      score += 0.2 // Poor at speed tests = more methodical
    }
    
    return score
  }

  private calculateConceptualDetailScore(): number {
    let score = 0.5
    
    // Detail focus vs conceptual reasoning performance
    const detailPerf = this.metrics.accuracyByCategory['detail_focus'] || 0.5
    const conceptualPerf = this.metrics.accuracyByCategory['conceptual_reasoning'] || 0.5
    
    if (detailPerf > conceptualPerf) {
      score += (detailPerf - conceptualPerf) * 0.3 // Better with details = more detail-oriented (1.0)
    } else {
      score -= (conceptualPerf - detailPerf) * 0.3 // Better with concepts = more conceptual (0.0)
    }
    
    // Reading comprehension typically requires detail orientation
    const readingPerf = this.metrics.accuracyByCategory['reading_comprehension'] || 0.5
    if (readingPerf > 0.7) {
      score += 0.2
    }
    
    // Use of elimination strategy suggests detail orientation
    score += this.metrics.eliminationUsage * 0.2
    
    return score
  }

  /**
   * Calculate confidence scores for each dimension
   */
  private calculateConfidence(): DimensionConfidence {
    const sampleSize = this.attempts.length
    const baseSampleConfidence = Math.min(100, (sampleSize / 20) * 60 + 40) // 40-100 based on sample size
    
    // Visual-Analytical confidence
    const visualAnalyticalData = [
      this.metrics.accuracyByCategory['visual_pattern'] || 0,
      this.metrics.accuracyByCategory['analytical_logic'] || 0,
      this.metrics.visualVsTextPerformance > 0 ? 1 : 0
    ].filter(v => v > 0).length
    
    const visualAnalyticalConfidence = baseSampleConfidence * (visualAnalyticalData / 3)
    
    // Fast-Methodical confidence  
    const fastMethodicalData = [
      this.metrics.hesitationPattern > 0 ? 1 : 0,
      this.metrics.accuracyByCategory['speed_test'] ? 1 : 0,
      this.metrics.responseTimeVariance > 0 ? 1 : 0
    ].filter(v => v > 0).length
    
    const fastMethodicalConfidence = baseSampleConfidence * (fastMethodicalData / 3)
    
    // Conceptual-Detail confidence
    const conceptualDetailData = [
      this.metrics.accuracyByCategory['detail_focus'] || 0,
      this.metrics.accuracyByCategory['conceptual_reasoning'] || 0,
      this.metrics.eliminationUsage > 0 ? 1 : 0
    ].filter(v => v > 0).length
    
    const conceptualDetailConfidence = baseSampleConfidence * (conceptualDetailData / 3)
    
    const overall = (visualAnalyticalConfidence + fastMethodicalConfidence + conceptualDetailConfidence) / 3
    
    return {
      visual_analytical: Math.round(visualAnalyticalConfidence),
      fast_methodical: Math.round(fastMethodicalConfidence),
      conceptual_detail: Math.round(conceptualDetailConfidence),
      overall: Math.round(overall)
    }
  }

  /**
   * Determine primary learning style from dimensional scores
   */
  private determinePrimaryStyle(scores: DimensionScores): LearningStyleKey {
    const visualAnalytical = scores.visual_analytical < 0.5 ? 'visual' : 'analytical'
    const fastMethodical = scores.fast_methodical < 0.5 ? 'fast' : 'methodical'  
    const conceptualDetail = scores.conceptual_detail < 0.5 ? 'conceptual' : 'detail'
    
    return `${visualAnalytical}-${fastMethodical}-${conceptualDetail}` as LearningStyleKey
  }

  /**
   * Determine secondary learning style (closest alternative)
   */
  private determineSecondaryStyle(scores: DimensionScores, primary: LearningStyleKey): LearningStyleKey | null {
    // Find the dimension with the least extreme score (closest to 0.5)
    const distances = {
      visual_analytical: Math.abs(scores.visual_analytical - 0.5),
      fast_methodical: Math.abs(scores.fast_methodical - 0.5),
      conceptual_detail: Math.abs(scores.conceptual_detail - 0.5)
    }
    
    const leastExtreme = Object.entries(distances).reduce((min, [key, distance]) => 
      distance < min.distance ? { key, distance } : min, 
      { key: '', distance: Infinity }
    ).key as keyof DimensionScores
    
    // If the least extreme dimension is still reasonably clear (distance > 0.15), no secondary
    if (distances[leastExtreme] > 0.15) {
      return null
    }
    
    // Flip the least extreme dimension to get secondary style
    const newScores = { ...scores }
    newScores[leastExtreme] = 1 - scores[leastExtreme] // Flip the score
    
    const secondary = this.determinePrimaryStyle(newScores)
    return secondary !== primary ? secondary : null
  }

  /**
   * Generate personalized recommendations based on learning style
   */
  private generateRecommendations(primaryStyle: LearningStyleKey): string[] {
    const styleInfo = (LEARNING_STYLE_CATEGORIES as any)[primaryStyle]
    if (!styleInfo) return []
    
    return [
      ...styleInfo.recommendations,
      ...this.getPerformanceBasedRecommendations()
    ]
  }

  private getPerformanceBasedRecommendations(): string[] {
    const recommendations: string[] = []
    
    // Based on weak areas
    const weakestCategory = Object.entries(this.metrics.accuracyByCategory)
      .reduce((min, [category, accuracy]) => 
        accuracy < min.accuracy ? { category, accuracy } : min,
        { category: '', accuracy: 1 }
      )
    
    if (weakestCategory.accuracy < 0.6) {
      switch (weakestCategory.category) {
        case 'visual_pattern':
          recommendations.push('Focus on logic games with visual diagrams')
          break
        case 'analytical_logic':
          recommendations.push('Practice logical reasoning with step-by-step breakdowns')
          break
        case 'speed_test':
          recommendations.push('Try timed practice sessions to improve speed')
          break
        case 'detail_focus':
          recommendations.push('Work on reading comprehension with detail questions')
          break
        case 'conceptual_reasoning':
          recommendations.push('Study conceptual frameworks and abstract reasoning')
          break
      }
    }
    
    return recommendations
  }

  /**
   * Identify key strengths based on performance patterns
   */
  private identifyStrengths(primaryStyle: LearningStyleKey): string[] {
    const styleInfo = (LEARNING_STYLE_CATEGORIES as any)[primaryStyle]
    const baseStrengths = styleInfo?.strengths || []
    
    const performanceStrengths: string[] = []
    
    // Add strengths based on high performance areas
    Object.entries(this.metrics.accuracyByCategory).forEach(([category, accuracy]) => {
      if (accuracy > 0.8) {
        switch (category) {
          case 'visual_pattern':
            performanceStrengths.push('Visual pattern recognition')
            break
          case 'analytical_logic':
            performanceStrengths.push('Logical analysis')
            break
          case 'speed_test':
            performanceStrengths.push('Quick thinking')
            break
          case 'detail_focus':
            performanceStrengths.push('Detail attention')
            break
          case 'conceptual_reasoning':
            performanceStrengths.push('Abstract reasoning')
            break
        }
      }
    })
    
    return [...baseStrengths, ...performanceStrengths]
  }

  /**
   * Calculate speed vs accuracy tradeoff
   */
  private calculateSpeedAccuracyTradeoff(): number {
    // Group attempts by response time quartiles
    const sortedTimes = [...this.attempts].sort((a, b) => a.response_time - b.response_time)
    const quartileSize = Math.floor(sortedTimes.length / 4)
    
    if (quartileSize < 1) return 0.5
    
    const fastestQuartile = sortedTimes.slice(0, quartileSize)
    const slowestQuartile = sortedTimes.slice(-quartileSize)
    
    const fastAccuracy = fastestQuartile.filter(a => a.is_correct).length / fastestQuartile.length
    const slowAccuracy = slowestQuartile.filter(a => a.is_correct).length / slowestQuartile.length
    
    // Return ratio: >1 means accuracy improves with time, <1 means speed helps accuracy
    return slowAccuracy > 0 ? slowAccuracy / fastAccuracy : 1
  }
}