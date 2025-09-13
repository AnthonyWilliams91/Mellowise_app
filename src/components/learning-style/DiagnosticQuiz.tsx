/**
 * Diagnostic Quiz Component
 * 
 * MELLOWISE-009: AI Learning Style Assessment
 * Interactive quiz to determine user learning preferences
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Brain, Target, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Pause } from 'lucide-react'
import type { 
  DiagnosticQuestion,
  DiagnosticAttempt,
  DiagnosticQuizProps,
  LearningStyleAnalysis
} from '@/types/learning-style'

interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, {
    selected: string
    timeSpent: number
    confidence: number
    startTime: Date
    endTime?: Date
    showedHesitation: boolean
    changedAnswer: boolean
    usedElimination: boolean
  }>
  isPaused: boolean
  startTime: Date
  totalTimeSpent: number
}

export default function DiagnosticQuiz({ onComplete, onSkip, existingProfile }: DiagnosticQuizProps) {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isPaused: false,
    startTime: new Date(),
    totalTimeSpent: 0
  })

  // Load diagnostic questions using our new service
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Import our diagnostic service
        const { diagnosticService } = await import('@/lib/learning-style/diagnostic-service')
        
        // Get current user ID (placeholder for now)
        const userId = 'user-123' // TODO: Get from auth context
        
        // Generate diagnostic quiz
        const quizData = await diagnosticService.generateDiagnosticQuiz(userId)
        
        setQuestions(quizData.questions)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions')
        setLoading(false)
      }
    }
    
    loadQuestions()
  }, [])

  const currentQuestion = questions[quizState.currentQuestionIndex]
  const currentAnswer = quizState.answers[currentQuestion?.id]
  const progress = ((quizState.currentQuestionIndex + 1) / questions.length) * 100

  // Start tracking time for current question
  useEffect(() => {
    if (currentQuestion && !currentAnswer) {
      setQuizState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: {
            selected: '',
            timeSpent: 0,
            confidence: 3,
            startTime: new Date(),
            showedHesitation: false,
            changedAnswer: false,
            usedElimination: false
          }
        }
      }))
    }
  }, [currentQuestion, currentAnswer])

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!currentQuestion) return

    setQuizState(prev => {
      const currentAnswerState = prev.answers[currentQuestion.id]
      const hadPreviousAnswer = !!currentAnswerState?.selected
      
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: {
            ...currentAnswerState,
            selected: answer,
            changedAnswer: hadPreviousAnswer && currentAnswerState.selected !== answer
          }
        }
      }
    })
  }, [currentQuestion])

  const handleConfidenceChange = useCallback((confidence: number) => {
    if (!currentQuestion) return

    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: {
          ...prev.answers[currentQuestion.id],
          confidence
        }
      }
    }))
  }, [currentQuestion])

  const markElimination = useCallback(() => {
    if (!currentQuestion) return

    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: {
          ...prev.answers[currentQuestion.id],
          usedElimination: true
        }
      }
    }))
  }, [currentQuestion])

  const nextQuestion = useCallback(() => {
    if (!currentQuestion || !currentAnswer?.selected) return

    // Mark end time and calculate time spent
    const endTime = new Date()
    const timeSpent = endTime.getTime() - currentAnswer.startTime.getTime()
    
    // Check for hesitation (more than expected time + 50%)
    const expectedTime = currentQuestion.expected_response_time || 60000
    const showedHesitation = timeSpent > (expectedTime * 1.5)

    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: {
          ...currentAnswer,
          timeSpent,
          endTime,
          showedHesitation
        }
      },
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }))
  }, [currentQuestion, currentAnswer])

  const previousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }))
    }
  }, [quizState.currentQuestionIndex])

  const submitQuiz = useCallback(async () => {
    setSubmitting(true)
    
    try {
      // Import our diagnostic service
      const { diagnosticService } = await import('@/lib/learning-style/diagnostic-service')
      
      // Convert answers to diagnostic attempts format
      const attempts: Omit<DiagnosticAttempt, 'id' | 'user_id' | 'attempted_at'>[] = Object.entries(quizState.answers)
        .filter(([_, answer]) => answer.selected)
        .map(([questionId, answer]) => {
          const question = questions.find(q => q.id === questionId)!
          
          return {
            diagnostic_question_id: questionId,
            question_id: question.question_id,
            selected_answer: answer.selected,
            is_correct: answer.selected === question.question?.correct_answer,
            response_time: answer.timeSpent,
            confidence_level: answer.confidence,
            showed_hesitation: answer.showedHesitation,
            changed_answer: answer.changedAnswer,
            used_elimination: answer.usedElimination,
            time_on_question: answer.timeSpent,
            time_on_choices: Math.floor(answer.timeSpent * 0.6), // Estimate
            scroll_behavior: {}
          }
        })

      // Submit using our service
      const userId = 'user-123' // TODO: Get from auth context
      const success = await diagnosticService.submitDiagnosticQuiz(userId, { attempts })
      
      if (success) {
        // For now, simulate analysis result - this will be replaced with actual analysis service
        const mockAnalysis: LearningStyleAnalysis = {
          primaryStyle: 'analytical-methodical-detail',
          secondaryStyle: 'visual-fast-conceptual',
          scores: {
            visual_analytical: 0.7,
            fast_methodical: 0.3,
            conceptual_detail: 0.8
          },
          confidence: {
            visual_analytical: 85,
            fast_methodical: 75,
            conceptual_detail: 90,
            overall: 83
          },
          recommendations: [
            'Focus on step-by-step logical analysis',
            'Use detailed argument mapping',
            'Practice systematic routines'
          ],
          strengths: [
            'Systematic analysis',
            'Detail accuracy', 
            'Methodical approach'
          ],
          dataPoints: {
            totalQuestions: attempts.length,
            avgResponseTime: attempts.reduce((sum, a) => sum + a.response_time, 0) / attempts.length,
            accuracyVariance: 0.15
          }
        }
        
        onComplete(mockAnalysis)
      } else {
        throw new Error('Failed to submit quiz results')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
      setSubmitting(false)
    }
  }, [quizState.answers, questions, onComplete])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading learning style assessment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-red-800 font-medium">Assessment Unavailable</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Skip Assessment
            </button>
          )}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No diagnostic questions available.</p>
      </div>
    )
  }

  // Quiz complete - show summary
  if (quizState.currentQuestionIndex >= questions.length) {
    const answeredQuestions = Object.keys(quizState.answers).length
    const correctAnswers = Object.entries(quizState.answers).filter(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      return question?.question?.correct_answer === answer.selected
    }).length

    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600">Analyzing your learning style preferences...</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
            <div className="text-sm text-gray-600">Questions Answered</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round((correctAnswers / answeredQuestions) * 100)}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={submitQuiz}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Analyzing Results...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Get My Learning Style
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Learning Style Assessment</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Question {quizState.currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6"
        >
          {/* Question header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                {currentQuestion.diagnostic_category.replace('_', ' ')}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                Difficulty: {currentQuestion.question?.difficulty}/10
              </span>
            </div>
          </div>

          {/* Question content */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.question?.content}
            </h3>

            {/* Answer choices */}
            <div className="space-y-3">
              {currentQuestion.question?.answer_choices?.map((choice: string, index: number) => {
                const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                const isSelected = currentAnswer?.selected === optionLetter
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(optionLetter)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {optionLetter}
                      </span>
                      <span className="text-gray-900">{choice}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confidence slider */}
          {currentAnswer?.selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How confident are you in this answer?
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={currentAnswer.confidence}
                onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
            </motion.div>
          )}

          {/* Helper buttons */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={markElimination}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              I used process of elimination
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousQuestion}
          disabled={quizState.currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip Assessment
            </button>
          )}
          
          <button
            onClick={nextQuestion}
            disabled={!currentAnswer?.selected}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}