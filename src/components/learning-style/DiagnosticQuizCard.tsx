'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DiagnosticQuestion, DiagnosticAttempt } from '@/types/learning-style'

interface DiagnosticQuizCardProps {
  question: DiagnosticQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (attempt: Omit<DiagnosticAttempt, 'id' | 'user_id' | 'attempted_at'>) => void
  onNext: () => void
  disabled?: boolean
  timeLimit?: number
}

export default function DiagnosticQuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  disabled = false,
  timeLimit
}: DiagnosticQuizCardProps) {
  const [startTime] = useState(Date.now())
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null)
  const [answerChanged, setAnswerChanged] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0)
  const [showHesitationWarning, setShowHesitationWarning] = useState(false)
  const [hesitationTimer, setHesitationTimer] = useState<NodeJS.Timeout | null>(null)

  // Track time remaining if time limit is set
  useEffect(() => {
    if (!timeLimit) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit if time runs out
          if (!hasAnswered && selectedAnswer) {
            handleSubmitAnswer()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLimit, hasAnswered, selectedAnswer])

  // Track hesitation (spending too much time without selecting)
  useEffect(() => {
    if (hasAnswered) return

    const timer = setTimeout(() => {
      if (!selectedAnswer) {
        setShowHesitationWarning(true)
      }
    }, (question.expected_response_time || 60000) * 1.5) // 1.5x expected time

    setHesitationTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [question.expected_response_time, hasAnswered, selectedAnswer])

  const handleAnswerSelect = (answerId: string) => {
    if (disabled || hasAnswered) return

    // Track if answer was changed
    if (selectedAnswer && selectedAnswer !== answerId) {
      setAnswerChanged(true)
    }

    setSelectedAnswer(answerId)
    setShowHesitationWarning(false)
    
    // Clear hesitation timer
    if (hesitationTimer) {
      clearTimeout(hesitationTimer)
      setHesitationTimer(null)
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || hasAnswered) return

    const responseTime = Date.now() - startTime
    const isCorrect = selectedAnswer === question.question?.correct_answer
    
    // Calculate behavioral indicators
    const expectedTime = question.expected_response_time || 60000
    const showedHesitation = responseTime > expectedTime * 1.2 || showHesitationWarning

    // Create attempt object
    const attempt: Omit<DiagnosticAttempt, 'id' | 'user_id' | 'attempted_at'> = {
      diagnostic_question_id: question.id,
      question_id: question.question_id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      response_time: responseTime,
      confidence_level: confidenceLevel,
      showed_hesitation: showedHesitation,
      changed_answer: answerChanged,
      used_elimination: false, // Could be enhanced with more advanced tracking
      time_on_question: responseTime,
      time_on_choices: null, // Could be enhanced with choice hover tracking
      scroll_behavior: {} // Could be enhanced with scroll tracking
    }

    setHasAnswered(true)
    onAnswer(attempt)
  }

  const getAnswerChoiceStyle = (choiceId: string) => {
    if (!hasAnswered) {
      if (choiceId === selectedAnswer) {
        return "border-blue-500 bg-blue-50 text-blue-900"
      }
      return "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
    }
    
    if (choiceId === question.question?.correct_answer) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900"
    }
    
    if (choiceId === selectedAnswer && choiceId !== question.question?.correct_answer) {
      return "border-red-500 bg-red-50 text-red-900"
    }
    
    return "border-gray-200 bg-gray-50 text-gray-500"
  }

  const getAnswerIcon = (choiceId: string) => {
    if (!hasAnswered) {
      if (choiceId === selectedAnswer) {
        return (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )
      }
      return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
    
    if (choiceId === question.question?.correct_answer) {
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (choiceId === selectedAnswer && choiceId !== question.question?.correct_answer) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    }
    
    return null
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      visual_pattern: 'bg-purple-100 text-purple-800',
      analytical_logic: 'bg-blue-100 text-blue-800',
      speed_test: 'bg-orange-100 text-orange-800',
      detail_focus: 'bg-green-100 text-green-800',
      conceptual_reasoning: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (questionNumber / totalQuestions) * 100

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Learning Style Assessment
          </CardTitle>
          <div className="text-sm text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% Complete</span>
            {timeLimit && timeRemaining > 0 && (
              <span className={timeRemaining < 30 ? 'text-red-500 font-medium' : ''}>
                {formatTime(timeRemaining)} remaining
              </span>
            )}
          </div>
        </div>

        {/* Category and Difficulty */}
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(question.diagnostic_category)}`}>
            {question.diagnostic_category.replace('_', ' ').toUpperCase()}
          </span>
          {question.question?.difficulty && (
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              question.question.difficulty <= 3 ? 'bg-green-100 text-green-800' :
              question.question.difficulty <= 6 ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              Level {question.question.difficulty}
            </span>
          )}
        </div>

        {/* Hesitation Warning */}
        {showHesitationWarning && !hasAnswered && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm">
              💡 Take your time! There's no rush - we're learning about your style.
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Content */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {question.question?.content}
          </div>
        </div>

        {/* Answer Choices */}
        <div className="space-y-3">
          {Array.isArray(question.question?.answer_choices) && 
            question.question.answer_choices.map((choice: any) => (
            <button
              key={choice.id}
              onClick={() => handleAnswerSelect(choice.id)}
              disabled={disabled || hasAnswered}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${getAnswerChoiceStyle(choice.id)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <span className="font-semibold text-sm bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                    {choice.id}
                  </span>
                  <span className="text-sm leading-relaxed">{choice.text}</span>
                </div>
                {getAnswerIcon(choice.id)}
              </div>
            </button>
          ))}
        </div>

        {/* Confidence Level (after answering) */}
        {hasAnswered && !confidenceLevel && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">
              How confident were you in your answer?
            </h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  variant={confidenceLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfidenceLevel(level)}
                  className="flex-1"
                >
                  {level === 1 ? 'Very Low' :
                   level === 2 ? 'Low' :
                   level === 3 ? 'Medium' :
                   level === 4 ? 'High' : 'Very High'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Submit/Next Button */}
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            {question.learning_dimensions?.length > 0 && (
              <span>Assessing: {question.learning_dimensions.join(', ')}</span>
            )}
          </div>
          
          <div className="space-x-3">
            {!hasAnswered ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || disabled}
                className="min-w-[100px]"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={onNext}
                disabled={!confidenceLevel}
                className="min-w-[100px]"
              >
                {questionNumber === totalQuestions ? 'Complete Assessment' : 'Next Question'}
              </Button>
            )}
          </div>
        </div>

        {/* Explanation (after answering) */}
        {hasAnswered && question.question?.explanation && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {question.question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}