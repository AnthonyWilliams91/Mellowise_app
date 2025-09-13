/**
 * Analytics Hook
 * 
 * Custom hook for tracking user session performance and analytics
 */

'use client'

import { useState, useCallback, useRef } from 'react'

interface QuestionAttempt {
  questionId: string
  questionType: string
  difficulty: number
  isCorrect: boolean
  responseTime: number
  selectedAnswer: string
  hintUsed: boolean
}

interface SessionAnalytics {
  sessionId: string
  startTime: Date
  endTime?: Date
  totalTimeSpent: number
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  currentStreak: number
  maxStreak: number
  topicBreakdown: {
    logicalReasoning: { correct: number; total: number; avgResponseTime: number }
    logicGames: { correct: number; total: number; avgResponseTime: number }
    readingComprehension: { correct: number; total: number; avgResponseTime: number }
  }
  difficultyProgression: number[]
  pausesUsed: number
  hintsUsed: number
  powerUpsUsed: Record<string, number>
  attempts: QuestionAttempt[]
}

export function useAnalytics(sessionId: string) {
  const [analytics, setAnalytics] = useState<SessionAnalytics>({
    sessionId,
    startTime: new Date(),
    totalTimeSpent: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    currentStreak: 0,
    maxStreak: 0,
    topicBreakdown: {
      logicalReasoning: { correct: 0, total: 0, avgResponseTime: 0 },
      logicGames: { correct: 0, total: 0, avgResponseTime: 0 },
      readingComprehension: { correct: 0, total: 0, avgResponseTime: 0 }
    },
    difficultyProgression: [],
    pausesUsed: 0,
    hintsUsed: 0,
    powerUpsUsed: {},
    attempts: []
  })

  const [isTracking, setIsTracking] = useState(false)
  const questionStartTime = useRef<Date | null>(null)
  const sessionStartTime = useRef<Date>(new Date())

  const startSession = useCallback(() => {
    setIsTracking(true)
    sessionStartTime.current = new Date()
    setAnalytics(prev => ({
      ...prev,
      startTime: sessionStartTime.current!
    }))
  }, [])

  const endSession = useCallback(async () => {
    const endTime = new Date()
    const totalTime = endTime.getTime() - sessionStartTime.current.getTime()
    
    setAnalytics(prev => ({
      ...prev,
      endTime,
      totalTimeSpent: totalTime
    }))
    
    setIsTracking(false)
    
    // Send analytics to API
    try {
      const performanceData = {
        totalTimeSpent: totalTime,
        avgResponseTime: calculateAverageResponseTime(analytics.attempts),
        accuracyPercentage: analytics.accuracy,
        streakCount: analytics.currentStreak,
        maxStreak: analytics.maxStreak,
        topicBreakdown: analytics.topicBreakdown,
        difficultyProgression: analytics.difficultyProgression,
        finalDifficulty: analytics.difficultyProgression[analytics.difficultyProgression.length - 1] || 1,
        pausesUsed: analytics.pausesUsed,
        hintsUsed: analytics.hintsUsed,
        powerUpsUsed: analytics.powerUpsUsed
      }
      
      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: analytics.sessionId,
          performanceData
        })
      })
      
      if (!response.ok) {
        console.error('Failed to submit session analytics')
      }
      
    } catch (error) {
      console.error('Analytics submission error:', error)
    }
  }, [analytics])

  const startQuestion = useCallback(() => {
    questionStartTime.current = new Date()
  }, [])

  const recordQuestionAttempt = useCallback((
    questionId: string,
    questionType: string,
    difficulty: number,
    isCorrect: boolean,
    selectedAnswer: string,
    hintUsed: boolean = false
  ) => {
    if (!questionStartTime.current) return

    const responseTime = new Date().getTime() - questionStartTime.current.getTime()
    
    const attempt: QuestionAttempt = {
      questionId,
      questionType,
      difficulty,
      isCorrect,
      responseTime,
      selectedAnswer,
      hintUsed
    }

    setAnalytics(prev => {
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0)
      const newQuestionsAnswered = prev.questionsAnswered + 1
      const newAccuracy = (newCorrectAnswers / newQuestionsAnswered) * 100
      
      // Update streak
      const newCurrentStreak = isCorrect ? prev.currentStreak + 1 : 0
      const newMaxStreak = Math.max(prev.maxStreak, newCurrentStreak)
      
      // Update topic breakdown
      const topicKey = getTopicKey(questionType)
      const updatedTopicBreakdown = { ...prev.topicBreakdown }
      if (topicKey) {\n        const topic = updatedTopicBreakdown[topicKey]\n        const newTotal = topic.total + 1\n        const newCorrect = topic.correct + (isCorrect ? 1 : 0)\n        const totalResponseTime = topic.avgResponseTime * topic.total + responseTime\n        \n        updatedTopicBreakdown[topicKey] = {\n          correct: newCorrect,\n          total: newTotal,\n          avgResponseTime: totalResponseTime / newTotal\n        }\n      }\n      \n      // Update difficulty progression\n      const newDifficultyProgression = [...prev.difficultyProgression, difficulty]\n      \n      return {\n        ...prev,\n        questionsAnswered: newQuestionsAnswered,\n        correctAnswers: newCorrectAnswers,\n        incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),\n        accuracy: newAccuracy,\n        currentStreak: newCurrentStreak,\n        maxStreak: newMaxStreak,\n        topicBreakdown: updatedTopicBreakdown,\n        difficultyProgression: newDifficultyProgression,\n        hintsUsed: prev.hintsUsed + (hintUsed ? 1 : 0),\n        attempts: [...prev.attempts, attempt]\n      }\n    })\n    \n    questionStartTime.current = null\n  }, [])\n\n  const recordPause = useCallback(() => {\n    setAnalytics(prev => ({\n      ...prev,\n      pausesUsed: prev.pausesUsed + 1\n    }))\n  }, [])\n\n  const recordPowerUpUse = useCallback((powerUpType: string) => {\n    setAnalytics(prev => ({\n      ...prev,\n      powerUpsUsed: {\n        ...prev.powerUpsUsed,\n        [powerUpType]: (prev.powerUpsUsed[powerUpType] || 0) + 1\n      }\n    }))\n  }, [])\n\n  const getSessionSummary = useCallback(() => {\n    return {\n      duration: analytics.endTime ? \n        analytics.endTime.getTime() - analytics.startTime.getTime() : \n        new Date().getTime() - analytics.startTime.getTime(),\n      questionsAnswered: analytics.questionsAnswered,\n      accuracy: analytics.accuracy,\n      bestStreak: analytics.maxStreak,\n      topicPerformance: Object.entries(analytics.topicBreakdown).map(([topic, data]) => ({\n        topic,\n        accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,\n        questionsAnswered: data.total,\n        avgResponseTime: data.avgResponseTime\n      }))\n    }\n  }, [analytics])\n\n  return {\n    analytics,\n    isTracking,\n    startSession,\n    endSession,\n    startQuestion,\n    recordQuestionAttempt,\n    recordPause,\n    recordPowerUpUse,\n    getSessionSummary\n  }\n}\n\nfunction getTopicKey(questionType: string): keyof SessionAnalytics['topicBreakdown'] | null {\n  switch (questionType) {\n    case 'logical_reasoning':\n      return 'logicalReasoning'\n    case 'logic_games':\n      return 'logicGames'\n    case 'reading_comprehension':\n      return 'readingComprehension'\n    default:\n      return null\n  }\n}\n\nfunction calculateAverageResponseTime(attempts: QuestionAttempt[]): number {\n  if (attempts.length === 0) return 0\n  const totalTime = attempts.reduce((sum, attempt) => sum + attempt.responseTime, 0)\n  return totalTime / attempts.length\n}"}