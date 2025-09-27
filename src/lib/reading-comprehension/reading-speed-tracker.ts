/**
 * MELLOWISE-020: Reading Comprehension Module
 * Reading Speed Tracking Service
 *
 * Tracks reading speed, comprehension accuracy, and provides
 * personalized speed recommendations for optimal performance.
 *
 * @epic Epic 3.4 - Comprehensive LSAT Question System
 * @author UX Expert Agent (BMad Team)
 * @created 2025-09-25
 */

import type {
  ReadingSpeedMetrics,
  ReadingProgress,
  PassageSubject,
  ReadingComprehensionPassage,
  RCPracticeSession
} from '@/types/reading-comprehension'

/**
 * Reading Session Data
 */
export interface ReadingSession {
  id: string
  passageId: string
  userId: string
  startTime: number
  endTime?: number
  readingPhases: {
    startTime: number
    endTime: number
    wordsRead: number
    section: 'beginning' | 'middle' | 'end'
  }[]
  pauseEvents: {
    startTime: number
    endTime: number
    reason: 'voluntary' | 'distraction' | 'difficulty'
  }[]
  scrollEvents: {
    timestamp: number
    position: number
    direction: 'up' | 'down'
  }[]
  rereadSections: {
    startOffset: number
    endOffset: number
    rereadCount: number
  }[]
}

/**
 * Speed Analysis Result
 */
export interface SpeedAnalysisResult {
  wordsPerMinute: number
  comprehensionRate: number // Accuracy on questions
  efficiency: number // WPM adjusted for comprehension
  readingPattern: 'consistent' | 'accelerating' | 'decelerating' | 'variable'
  optimalSpeedRange: {
    min: number
    max: number
  }
  recommendations: string[]
  strengths: string[]
  improvements: string[]
}

/**
 * Reading Speed Benchmarks by Subject
 */
interface SpeedBenchmarks {
  subject: PassageSubject
  beginner: { min: number, max: number, optimal: number }
  intermediate: { min: number, max: number, optimal: number }
  advanced: { min: number, max: number, optimal: number }
}

export class ReadingSpeedTracker {
  private sessions: Map<string, ReadingSession> = new Map()
  private userMetrics: Map<string, ReadingSpeedMetrics[]> = new Map()

  /**
   * Subject-specific speed benchmarks (words per minute)
   */
  private static readonly SPEED_BENCHMARKS: SpeedBenchmarks[] = [
    {
      subject: 'law',
      beginner: { min: 120, max: 180, optimal: 150 },
      intermediate: { min: 160, max: 220, optimal: 190 },
      advanced: { min: 200, max: 280, optimal: 240 }
    },
    {
      subject: 'science',
      beginner: { min: 100, max: 160, optimal: 130 },
      intermediate: { min: 140, max: 200, optimal: 170 },
      advanced: { min: 180, max: 250, optimal: 215 }
    },
    {
      subject: 'social_science',
      beginner: { min: 140, max: 200, optimal: 170 },
      intermediate: { min: 180, max: 240, optimal: 210 },
      advanced: { min: 220, max: 300, optimal: 260 }
    },
    {
      subject: 'humanities',
      beginner: { min: 130, max: 190, optimal: 160 },
      intermediate: { min: 170, max: 230, optimal: 200 },
      advanced: { min: 210, max: 290, optimal: 250 }
    },
    {
      subject: 'history',
      beginner: { min: 150, max: 210, optimal: 180 },
      intermediate: { min: 190, max: 250, optimal: 220 },
      advanced: { min: 230, max: 310, optimal: 270 }
    },
    {
      subject: 'economics',
      beginner: { min: 120, max: 180, optimal: 150 },
      intermediate: { min: 160, max: 220, optimal: 190 },
      advanced: { min: 200, max: 280, optimal: 240 }
    },
    {
      subject: 'technology',
      beginner: { min: 110, max: 170, optimal: 140 },
      intermediate: { min: 150, max: 210, optimal: 180 },
      advanced: { min: 190, max: 270, optimal: 230 }
    },
    {
      subject: 'medicine',
      beginner: { min: 100, max: 160, optimal: 130 },
      intermediate: { min: 140, max: 200, optimal: 170 },
      advanced: { min: 180, max: 250, optimal: 215 }
    },
    {
      subject: 'environment',
      beginner: { min: 140, max: 200, optimal: 170 },
      intermediate: { min: 180, max: 240, optimal: 210 },
      advanced: { min: 220, max: 300, optimal: 260 }
    },
    {
      subject: 'politics',
      beginner: { min: 130, max: 190, optimal: 160 },
      intermediate: { min: 170, max: 230, optimal: 200 },
      advanced: { min: 210, max: 290, optimal: 250 }
    }
  ]

  /**
   * Start tracking a reading session
   */
  startReadingSession(passageId: string, userId: string): string {
    const sessionId = this.generateSessionId()
    const session: ReadingSession = {
      id: sessionId,
      passageId,
      userId,
      startTime: Date.now(),
      readingPhases: [],
      pauseEvents: [],
      scrollEvents: [],
      rereadSections: []
    }

    this.sessions.set(sessionId, session)
    return sessionId
  }

  /**
   * Track reading phase (beginning, middle, end of passage)
   */
  trackReadingPhase(
    sessionId: string,
    section: 'beginning' | 'middle' | 'end',
    wordsRead: number
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const now = Date.now()
    const lastPhase = session.readingPhases[session.readingPhases.length - 1]

    // End previous phase if exists
    if (lastPhase && !lastPhase.endTime) {
      lastPhase.endTime = now
    }

    // Start new phase
    session.readingPhases.push({
      startTime: now,
      endTime: 0, // Will be set when phase ends
      wordsRead,
      section
    })
  }

  /**
   * Track pause events
   */
  trackPause(
    sessionId: string,
    reason: 'voluntary' | 'distraction' | 'difficulty'
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const now = Date.now()
    session.pauseEvents.push({
      startTime: now,
      endTime: 0, // Will be set when pause ends
      reason
    })
  }

  /**
   * End pause event
   */
  endPause(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const lastPause = session.pauseEvents[session.pauseEvents.length - 1]
    if (lastPause && lastPause.endTime === 0) {
      lastPause.endTime = Date.now()
    }
  }

  /**
   * Track scroll events
   */
  trackScroll(sessionId: string, position: number): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const lastScroll = session.scrollEvents[session.scrollEvents.length - 1]
    const direction = !lastScroll ? 'down' :
                     position > lastScroll.position ? 'down' : 'up'

    session.scrollEvents.push({
      timestamp: Date.now(),
      position,
      direction
    })
  }

  /**
   * Track rereading of sections
   */
  trackReread(sessionId: string, startOffset: number, endOffset: number): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Find existing reread section or create new one
    const existingSection = session.rereadSections.find(
      section => section.startOffset === startOffset && section.endOffset === endOffset
    )

    if (existingSection) {
      existingSection.rereadCount++
    } else {
      session.rereadSections.push({
        startOffset,
        endOffset,
        rereadCount: 1
      })
    }
  }

  /**
   * End reading session and calculate metrics
   */
  endReadingSession(
    sessionId: string,
    passage: ReadingComprehensionPassage,
    comprehensionAccuracy: number
  ): ReadingSpeedMetrics {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    const now = Date.now()
    session.endTime = now

    // End any ongoing phases
    const lastPhase = session.readingPhases[session.readingPhases.length - 1]
    if (lastPhase && lastPhase.endTime === 0) {
      lastPhase.endTime = now
    }

    // Calculate metrics
    const totalReadingTime = this.calculateNetReadingTime(session)
    const wordsPerMinute = (passage.wordCount / totalReadingTime) * 60000 // Convert ms to minutes

    const metrics: ReadingSpeedMetrics = {
      userId: session.userId,
      passageId: passage.id,
      wordsPerMinute: Math.round(wordsPerMinute * 10) / 10,
      comprehensionAccuracy,
      timeSpentReading: Math.round(totalReadingTime / 1000),
      timeSpentAnswering: 0, // Would be tracked separately
      annotationCount: 0, // Would be provided from active reading tools
      rereadCount: session.rereadSections.reduce((total, section) => total + section.rereadCount, 0),
      timestamp: new Date().toISOString()
    }

    // Store metrics
    const userMetrics = this.userMetrics.get(session.userId) || []
    userMetrics.push(metrics)
    this.userMetrics.set(session.userId, userMetrics)

    // Clean up session
    this.sessions.delete(sessionId)

    return metrics
  }

  /**
   * Analyze reading speed performance
   */
  analyzeReadingSpeed(
    userId: string,
    subject: PassageSubject,
    recentSessionsCount: number = 10
  ): SpeedAnalysisResult {
    const userMetrics = this.userMetrics.get(userId) || []
    const recentMetrics = userMetrics
      .slice(-recentSessionsCount)
      .filter(metric => {
        // Would need passage subject info - simplified for now
        return true
      })

    if (recentMetrics.length === 0) {
      return this.getDefaultAnalysis(subject)
    }

    const avgWPM = recentMetrics.reduce((sum, m) => sum + m.wordsPerMinute, 0) / recentMetrics.length
    const avgComprehension = recentMetrics.reduce((sum, m) => sum + m.comprehensionAccuracy, 0) / recentMetrics.length

    // Calculate efficiency (WPM * comprehension rate)
    const efficiency = (avgWPM * avgComprehension) / 100

    // Analyze reading pattern
    const pattern = this.analyzeReadingPattern(recentMetrics)

    // Get benchmarks for subject
    const benchmarks = this.getBenchmarks(subject, avgComprehension)
    const optimalSpeedRange = {
      min: benchmarks.min,
      max: benchmarks.max
    }

    // Generate recommendations
    const recommendations = this.generateSpeedRecommendations(avgWPM, avgComprehension, benchmarks, pattern)
    const strengths = this.identifyStrengths(avgWPM, avgComprehension, benchmarks, pattern)
    const improvements = this.identifyImprovements(avgWPM, avgComprehension, benchmarks, pattern)

    return {
      wordsPerMinute: Math.round(avgWPM),
      comprehensionRate: Math.round(avgComprehension * 100) / 100,
      efficiency: Math.round(efficiency),
      readingPattern: pattern,
      optimalSpeedRange,
      recommendations,
      strengths,
      improvements
    }
  }

  /**
   * Get reading speed trends over time
   */
  getSpeedTrends(userId: string, timeframe: number = 30): {
    dates: string[]
    speeds: number[]
    comprehension: number[]
    efficiency: number[]
    trend: 'improving' | 'stable' | 'declining'
  } {
    const userMetrics = this.userMetrics.get(userId) || []
    const cutoffDate = Date.now() - (timeframe * 24 * 60 * 60 * 1000) // Days to milliseconds

    const recentMetrics = userMetrics.filter(metric =>
      new Date(metric.timestamp).getTime() > cutoffDate
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const dates = recentMetrics.map(m => m.timestamp.split('T')[0])
    const speeds = recentMetrics.map(m => m.wordsPerMinute)
    const comprehension = recentMetrics.map(m => m.comprehensionAccuracy)
    const efficiency = recentMetrics.map((m, i) => (speeds[i] * comprehension[i]) / 100)

    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentMetrics.length >= 5) {
      const firstHalf = efficiency.slice(0, Math.floor(efficiency.length / 2))
      const secondHalf = efficiency.slice(Math.ceil(efficiency.length / 2))

      const firstAvg = firstHalf.reduce((sum, eff) => sum + eff, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, eff) => sum + eff, 0) / secondHalf.length

      if (secondAvg > firstAvg * 1.1) trend = 'improving'
      else if (secondAvg < firstAvg * 0.9) trend = 'declining'
    }

    return {
      dates,
      speeds,
      comprehension,
      efficiency,
      trend
    }
  }

  /**
   * Get personalized speed recommendations
   */
  getPersonalizedRecommendations(
    userId: string,
    targetSubject: PassageSubject,
    targetAccuracy: number = 85
  ): {
    currentLevel: 'beginner' | 'intermediate' | 'advanced'
    targetSpeed: number
    progressPlan: {
      week: number
      targetSpeed: number
      focusAreas: string[]
      exercises: string[]
    }[]
    timeToTarget: number // estimated days
  } {
    const analysis = this.analyzeReadingSpeed(userId, targetSubject)
    const benchmarks = this.getBenchmarks(targetSubject, targetAccuracy / 100)

    // Determine current level
    let currentLevel: 'beginner' | 'intermediate' | 'advanced'
    if (analysis.wordsPerMinute < benchmarks.min) currentLevel = 'beginner'
    else if (analysis.wordsPerMinute < benchmarks.optimal) currentLevel = 'intermediate'
    else currentLevel = 'advanced'

    // Set target speed
    const targetSpeed = benchmarks.optimal

    // Create progress plan
    const weeksToTarget = Math.max(4, Math.ceil((targetSpeed - analysis.wordsPerMinute) / 10))
    const speedIncrement = (targetSpeed - analysis.wordsPerMinute) / weeksToTarget

    const progressPlan = Array.from({ length: Math.min(weeksToTarget, 12) }, (_, i) => ({
      week: i + 1,
      targetSpeed: Math.round(analysis.wordsPerMinute + (speedIncrement * (i + 1))),
      focusAreas: this.getFocusAreas(currentLevel, i + 1),
      exercises: this.getWeeklyExercises(currentLevel, i + 1)
    }))

    return {
      currentLevel,
      targetSpeed,
      progressPlan,
      timeToTarget: weeksToTarget * 7
    }
  }

  /**
   * Private helper methods
   */

  private generateSessionId(): string {
    return `reading-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateNetReadingTime(session: ReadingSession): number {
    const totalTime = (session.endTime || Date.now()) - session.startTime

    // Subtract pause time
    const pauseTime = session.pauseEvents.reduce((total, pause) => {
      const endTime = pause.endTime || Date.now()
      return total + (endTime - pause.startTime)
    }, 0)

    return Math.max(1000, totalTime - pauseTime) // Minimum 1 second
  }

  private analyzeReadingPattern(metrics: ReadingSpeedMetrics[]): SpeedAnalysisResult['readingPattern'] {
    if (metrics.length < 3) return 'consistent'

    const speeds = metrics.map(m => m.wordsPerMinute)
    const early = speeds.slice(0, Math.ceil(speeds.length / 3))
    const middle = speeds.slice(Math.ceil(speeds.length / 3), Math.ceil(2 * speeds.length / 3))
    const late = speeds.slice(Math.ceil(2 * speeds.length / 3))

    const earlyAvg = early.reduce((sum, s) => sum + s, 0) / early.length
    const lateAvg = late.reduce((sum, s) => sum + s, 0) / late.length

    const change = (lateAvg - earlyAvg) / earlyAvg

    if (change > 0.15) return 'accelerating'
    if (change < -0.15) return 'decelerating'

    // Check for high variation
    const variance = this.calculateVariance(speeds)
    const coefficientOfVariation = Math.sqrt(variance) / (speeds.reduce((sum, s) => sum + s, 0) / speeds.length)

    return coefficientOfVariation > 0.2 ? 'variable' : 'consistent'
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
  }

  private getBenchmarks(subject: PassageSubject, comprehensionLevel: number): { min: number, max: number, optimal: number } {
    const subjectBenchmarks = ReadingSpeedTracker.SPEED_BENCHMARKS.find(b => b.subject === subject)

    if (!subjectBenchmarks) {
      // Default benchmarks
      return { min: 150, max: 250, optimal: 200 }
    }

    // Choose benchmark level based on comprehension
    if (comprehensionLevel >= 0.85) return subjectBenchmarks.advanced
    if (comprehensionLevel >= 0.70) return subjectBenchmarks.intermediate
    return subjectBenchmarks.beginner
  }

  private generateSpeedRecommendations(
    avgWPM: number,
    avgComprehension: number,
    benchmarks: { min: number, max: number, optimal: number },
    pattern: SpeedAnalysisResult['readingPattern']
  ): string[] {
    const recommendations: string[] = []

    if (avgWPM < benchmarks.min) {
      recommendations.push('Focus on increasing reading speed through daily practice')
      recommendations.push('Try reading easier passages to build fluency')
    } else if (avgWPM > benchmarks.max) {
      recommendations.push('Slow down slightly to improve comprehension')
      recommendations.push('Focus on reading for understanding rather than speed')
    }

    if (avgComprehension < 0.7) {
      recommendations.push('Prioritize comprehension over speed')
      recommendations.push('Practice active reading techniques like summarizing paragraphs')
    }

    if (pattern === 'variable') {
      recommendations.push('Work on maintaining consistent reading pace')
      recommendations.push('Practice with a metronome to develop rhythm')
    }

    return recommendations.slice(0, 4)
  }

  private identifyStrengths(
    avgWPM: number,
    avgComprehension: number,
    benchmarks: { min: number, max: number, optimal: number },
    pattern: SpeedAnalysisResult['readingPattern']
  ): string[] {
    const strengths: string[] = []

    if (avgWPM >= benchmarks.optimal) {
      strengths.push('Reading speed is at optimal level')
    }

    if (avgComprehension >= 0.85) {
      strengths.push('Excellent comprehension accuracy')
    }

    if (pattern === 'consistent') {
      strengths.push('Maintains consistent reading pace')
    }

    if (pattern === 'accelerating') {
      strengths.push('Shows improvement in reading speed over time')
    }

    return strengths
  }

  private identifyImprovements(
    avgWPM: number,
    avgComprehension: number,
    benchmarks: { min: number, max: number, optimal: number },
    pattern: SpeedAnalysisResult['readingPattern']
  ): string[] {
    const improvements: string[] = []

    if (avgWPM < benchmarks.min) {
      improvements.push('Increase reading speed through practice')
    }

    if (avgComprehension < 0.75) {
      improvements.push('Focus on improving comprehension accuracy')
    }

    if (pattern === 'decelerating') {
      improvements.push('Reverse declining speed trend')
    }

    if (pattern === 'variable') {
      improvements.push('Develop more consistent reading rhythm')
    }

    return improvements
  }

  private getDefaultAnalysis(subject: PassageSubject): SpeedAnalysisResult {
    const benchmarks = this.getBenchmarks(subject, 0.75)

    return {
      wordsPerMinute: 0,
      comprehensionRate: 0,
      efficiency: 0,
      readingPattern: 'consistent',
      optimalSpeedRange: {
        min: benchmarks.min,
        max: benchmarks.max
      },
      recommendations: ['Start with regular reading practice', 'Focus on understanding before speed'],
      strengths: [],
      improvements: ['Establish baseline reading metrics', 'Begin systematic practice']
    }
  }

  private getFocusAreas(level: string, week: number): string[] {
    const focusMap = {
      beginner: [
        ['Basic fluency', 'Sight word recognition'],
        ['Phrase reading', 'Reducing subvocalization'],
        ['Comprehension while reading faster', 'Eye movement patterns'],
        ['Sustained reading', 'Reading rhythm']
      ],
      intermediate: [
        ['Skimming techniques', 'Preview strategies'],
        ['Main idea identification', 'Supporting detail location'],
        ['Inference while reading', 'Context clue usage'],
        ['Complex sentence parsing', 'Argument structure recognition']
      ],
      advanced: [
        ['Speed reading techniques', 'Peripheral vision use'],
        ['Complex passage analysis', 'Multi-layered comprehension'],
        ['Comparative reading', 'Synthesis skills'],
        ['Test-taking integration', 'Time management']
      ]
    }

    const weekIndex = Math.min(week - 1, 3)
    return focusMap[level as keyof typeof focusMap]?.[weekIndex] || ['General improvement', 'Consistent practice']
  }

  private getWeeklyExercises(level: string, week: number): string[] {
    const exerciseMap = {
      beginner: [
        ['Read 20 minutes daily', 'Track words per minute'],
        ['Practice phrase reading', 'Reduce regressions'],
        ['Timed reading exercises', 'Comprehension checks'],
        ['Build reading stamina', 'Maintain speed consistency']
      ],
      intermediate: [
        ['Preview-read-review cycle', 'Note-taking practice'],
        ['Speed reading drills', 'Comprehension maintenance'],
        ['Complex passage practice', 'Inference exercises'],
        ['Integrated speed-comprehension work', 'Test passage practice']
      ],
      advanced: [
        ['Advanced speed techniques', 'Multiple passage practice'],
        ['Comparative reading exercises', 'Synthesis practice'],
        ['Timed test conditions', 'Strategy refinement'],
        ['Peak performance maintenance', 'Consistent excellence']
      ]
    }

    const weekIndex = Math.min(week - 1, 3)
    return exerciseMap[level as keyof typeof exerciseMap]?.[weekIndex] || ['Continue regular practice', 'Monitor progress']
  }
}