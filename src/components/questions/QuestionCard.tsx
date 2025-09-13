'use client'

import { useState } from 'react'
import type { QuestionUniversal } from '@/types/universal-exam'

interface QuestionCardProps {
  question: QuestionUniversal
  onAnswer: (selectedAnswer: string, isCorrect: boolean, responseTime: number) => void
  showExplanation?: boolean
  disabled?: boolean
  selectedAnswer?: string
  streakMultiplier?: number
  currentStreak?: number
}

export default function QuestionCard({ 
  question, 
  onAnswer, 
  showExplanation = false, 
  disabled = false,
  selectedAnswer,
  streakMultiplier = 1,
  currentStreak = 0
}: QuestionCardProps) {
  const [startTime] = useState(Date.now())
  const [userAnswer, setUserAnswer] = useState<string | null>(selectedAnswer || null)
  const [hasAnswered, setHasAnswered] = useState(!!selectedAnswer)

  // Calculate potential points for this question (what player will earn if correct)
  const basePoints = 10 + ((question.difficulty || 1) - 1) * 5
  const nextStreak = currentStreak + 1
  const nextStreakMultiplier = nextStreak === 1 ? 1 : Math.pow(1.1, nextStreak - 1)
  const potentialPoints = Math.round(basePoints * nextStreakMultiplier)

  const handleAnswerSelect = (answerId: string) => {
    if (disabled || hasAnswered) return

    const responseTime = Date.now() - startTime
    const isCorrect = answerId === question.correct_answer
    
    setUserAnswer(answerId)
    setHasAnswered(true)
    onAnswer(answerId, isCorrect, responseTime)
  }

  const getAnswerChoiceStyle = (choiceId: string) => {
    if (!hasAnswered) {
      return "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
    }
    
    if (choiceId === question.correct_answer) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900"
    }
    
    if (choiceId === userAnswer && choiceId !== question.correct_answer) {
      return "border-red-500 bg-red-50 text-red-900"
    }
    
    return "border-gray-200 bg-gray-50 text-gray-500"
  }

  const getAnswerIcon = (choiceId: string) => {
    if (!hasAnswered) return null
    
    if (choiceId === question.correct_answer) {
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (choiceId === userAnswer && choiceId !== question.correct_answer) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    }
    
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
            {question.question_type?.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            question.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
            question.difficulty_level === 'medium' ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty_level?.charAt(0).toUpperCase() + question.difficulty_level?.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Points indicator */}
          <div className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{potentialPoints} pts</span>
            {nextStreakMultiplier > 1 && (
              <span className="text-amber-600">×{nextStreakMultiplier.toFixed(2)}</span>
            )}
          </div>
          
          {/* Time estimate */}
          {question.estimated_time && (
            <div className="text-sm text-gray-500">
              ~{Math.round(question.estimated_time / 60)} min
            </div>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-6">
        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap font-serif text-base">
          {question.content}
        </div>
      </div>

      {/* Answer Choices */}
      <div className="space-y-3 mb-6">
        {Array.isArray(question.answer_choices) && question.answer_choices.map((choice: any) => (
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

      {/* Explanation */}
      {showExplanation && hasAnswered && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{question.explanation}</p>
          
          {question.concept_tags && question.concept_tags.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-gray-500 mr-2">Concepts:</span>
              {question.concept_tags.map((tag, index) => (
                <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1">
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance Indicators */}
      {question.performance_indicators && question.performance_indicators.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Skills: {question.performance_indicators.join(', ')}
        </div>
      )}
    </div>
  )
}