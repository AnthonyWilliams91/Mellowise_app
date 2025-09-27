/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Logic Games Question Component with Interactive Game Board
 *
 * @epic Epic 3.2 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team) + UX Expert Aria
 * @created 2025-09-19
 * @dependencies MELLOWISE-017 Question Library, GameBoard component
 */

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Clock, CheckCircle, XCircle, HelpCircle, RotateCcw, Eye, EyeOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import GameBoard from './GameBoard'
import GameCategoryIndicator from './GameCategoryIndicator'
import SolutionWalkthrough from './SolutionWalkthrough'
import InferenceDetectionTrainer from './InferenceDetectionTrainer'
import PerformanceAnalyticsDashboard from './PerformanceAnalyticsDashboard'
import { GameCategorizer } from '@/lib/logic-games/game-categorizer'
import { PerformanceAnalytics } from '@/lib/logic-games/performance-analytics'
import type {
  LogicGameQuestion,
  LogicGameSession,
  GameBoardState,
  UserAction,
  SolutionStep,
  HintRequest,
  CommonMistakeType
} from '@/types/logic-games'
import type { QuestionUniversal } from '@/types/universal-exam'

interface LogicGameQuestionProps {
  question: LogicGameQuestion
  onComplete?: (result: LogicGameQuestionResult) => void
  showSolution?: boolean
  timeLimit?: number // seconds
  practiceMode?: boolean
  className?: string
}

export interface LogicGameQuestionResult {
  session: LogicGameSession
  isCorrect: boolean
  timeSpent: number
  finalBoardState: GameBoardState
  userActions: UserAction[]
  hintsUsed: number
  mistakesCount: number
}

interface TimerState {
  timeElapsed: number
  isRunning: boolean
  isPaused: boolean
}

export function LogicGameQuestion({
  question,
  onComplete,
  showSolution = false,
  timeLimit,
  practiceMode = true,
  className
}: LogicGameQuestionProps) {
  // Core state
  const [currentBoardState, setCurrentBoardState] = useState<GameBoardState | null>(null)
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showGameBoard, setShowGameBoard] = useState(true)

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    timeElapsed: 0,
    isRunning: false,
    isPaused: false
  })

  // Hint and help state
  const [hintsUsed, setHintsUsed] = useState<HintRequest[]>([])
  const [showHints, setShowHints] = useState(true)
  const [activeHints, setActiveHints] = useState<Array<{id: string, type: string, content: string}>>([])

  // Solution and explanation state
  const [showSolutionSteps, setShowSolutionSteps] = useState(false)
  const [currentSolutionStep, setCurrentSolutionStep] = useState(0)

  // Performance tracking
  const [mistakesCount, setMistakesCount] = useState(0)
  const [sessionStartTime] = useState(new Date().toISOString())

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionRef = useRef<LogicGameSession | null>(null)

  // Initialize session
  useEffect(() => {
    sessionRef.current = {
      id: `session_${Date.now()}`,
      tenant_id: '', // Will be filled by parent component
      user_id: '', // Will be filled by parent component
      question_id: question.id,
      started_at: sessionStartTime,
      board_states: [],
      user_actions: [],
      hint_requests: [],
      mistake_incidents: [],
      efficiency_score: 0,
      created_at: sessionStartTime,
      updated_at: sessionStartTime
    }

    // Start timer
    startTimer()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [question.id, sessionStartTime])

  // Timer management
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    setTimer(prev => ({ ...prev, isRunning: true, isPaused: false }))

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (!prev.isRunning || prev.isPaused) return prev

        const newTimeElapsed = prev.timeElapsed + 1

        // Check time limit
        if (timeLimit && newTimeElapsed >= timeLimit) {
          handleTimeUp()
          return { ...prev, timeElapsed: newTimeElapsed, isRunning: false }
        }

        return { ...prev, timeElapsed: newTimeElapsed }
      })
    }, 1000)
  }, [timeLimit])

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: true }))
  }, [])

  const resumeTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: false }))
  }, [])

  const stopTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: false, isPaused: false }))
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true)
      stopTimer()

      // Complete session with timeout
      completeSession(false, 'timeout')
    }
  }, [isAnswered, stopTimer])

  // Handle board state changes
  const handleBoardStateChange = useCallback((newState: GameBoardState) => {
    setCurrentBoardState(newState)

    // Update session tracking
    if (sessionRef.current) {
      sessionRef.current.board_states.push(newState)
      sessionRef.current.updated_at = new Date().toISOString()
    }
  }, [])

  // Handle user actions
  const handleUserAction = useCallback((action: UserAction) => {
    setUserActions(prev => [...prev, action])

    // Update session tracking
    if (sessionRef.current) {
      sessionRef.current.user_actions.push(action)
      sessionRef.current.total_rule_applications =
        sessionRef.current.user_actions.filter(a => a.action_type === 'rule_applied').length
    }
  }, [])

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerId: string) => {
    if (isAnswered) return

    setSelectedAnswer(answerId)
    setIsAnswered(true)
    stopTimer()

    // Determine if answer is correct
    const correctAnswer = question.answer_choices.find(choice => choice.is_correct)
    const isCorrect = correctAnswer?.id === answerId

    completeSession(isCorrect)
  }, [isAnswered, question.answer_choices, stopTimer])

  // Request hint
  const handleHintRequest = useCallback((hintType: string) => {
    if (!practiceMode) return

    const hintRequest: HintRequest = {
      timestamp: new Date().toISOString(),
      hint_type: hintType as any,
      context: `Step ${currentSolutionStep + 1}`,
      current_board_state: currentBoardState!,
      hint_provided: getHintForCurrentState(hintType, currentBoardState),
      was_helpful: undefined
    }

    setHintsUsed(prev => [...prev, hintRequest])

    // Add new hint to active hints array
    const newHint = {
      id: `hint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: hintType,
      content: hintRequest.hint_provided
    }
    setActiveHints(prev => [...prev, newHint])

    // Update session
    if (sessionRef.current) {
      sessionRef.current.hint_requests.push(hintRequest)
    }
  }, [practiceMode, currentSolutionStep, currentBoardState])

  // Dismiss a specific hint
  const dismissHint = useCallback((hintId: string) => {
    setActiveHints(prev => prev.filter(hint => hint.id !== hintId))
  }, [])

  // Complete session
  const completeSession = useCallback((isCorrect: boolean, reason?: string) => {
    if (!sessionRef.current || !currentBoardState) return

    const session: LogicGameSession = {
      ...sessionRef.current,
      completed_at: new Date().toISOString(),
      session_duration: timer.timeElapsed,
      final_score: isCorrect ? 100 : 0,
      efficiency_score: calculateEfficiencyScore(
        sessionRef.current.user_actions,
        question.solution_approach
      )
    }

    const result: LogicGameQuestionResult = {
      session,
      isCorrect,
      timeSpent: timer.timeElapsed,
      finalBoardState: currentBoardState,
      userActions,
      hintsUsed: hintsUsed.length,
      mistakesCount
    }

    onComplete?.(result)
  }, [currentBoardState, timer.timeElapsed, userActions, hintsUsed.length, mistakesCount, question.solution_approach, onComplete])

  // Reset question
  const handleReset = useCallback(() => {
    setCurrentBoardState(null)
    setUserActions([])
    setSelectedAnswer(null)
    setIsAnswered(false)
    setHintsUsed([])
    setActiveHints([])
    setMistakesCount(0)
    setCurrentSolutionStep(0)
    setTimer({ timeElapsed: 0, isRunning: false, isPaused: false })

    // Restart timer
    if (practiceMode) {
      startTimer()
    }
  }, [practiceMode, startTimer])

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get hint for current state
  const getHintForCurrentState = (hintType: string, boardState: GameBoardState | null): string => {
    if (!boardState) return 'Start by placing entities on the game board.'

    const completionPercentage = boardState.completion_percentage

    if (completionPercentage === 0) {
      return 'Begin by reading the game setup carefully and identifying the entities and positions.'
    } else if (completionPercentage < 50) {
      return 'Apply the rules one by one to determine where entities can and cannot be placed.'
    } else if (completionPercentage < 100) {
      return 'Look for inference opportunities - what must be true based on current placements?'
    } else {
      return 'Great! Now analyze your complete setup to answer the question.'
    }
  }

  return (
    <div className={cn('logic-game-question', 'w-full space-y-6', className)}>
      {/* Question Header */}
      <div className="question-header space-y-4">
        {/* Game Category Indicator */}
        <GameCategoryIndicator
          question={question}
          showDetails={true}
          showPatterns={true}
          className="mb-4"
        />

        {/* Solution Walkthrough */}
        {practiceMode && (
          <SolutionWalkthrough
            question={question}
            walkthroughType="setup"
            onComplete={(completedSteps, totalTime) => {
              console.log(`Walkthrough completed: ${completedSteps} steps in ${totalTime}ms`)
            }}
            onStepComplete={(step, timeSpent) => {
              console.log(`Step ${step.step_number} completed in ${timeSpent}ms`)
            }}
            className="mb-4"
          />
        )}

        {/* Inference Detection Training */}
        {practiceMode && (
          <InferenceDetectionTrainer
            question={question}
            classification={GameCategorizer.classify(question)}
            onComplete={(session, score) => {
              console.log(`Inference training completed with score: ${score}`)
              console.log(`Session stats:`, session.progress)
            }}
            onProgress={(discovered, total) => {
              console.log(`Inference progress: ${discovered}/${total}`)
            }}
            className="mb-4"
          />
        )}

        {/* Performance Analytics Dashboard */}
        {practiceMode && sessionRef.current && (
          <PerformanceAnalyticsDashboard
            gameTypePerformances={generateMockGameTypePerformances()}
            overallMetrics={generateMockOverallMetrics()}
            learningInsights={generateMockLearningInsights()}
            comparisonData={generateMockComparisonData()}
            recentSessions={generateMockRecentSessions()}
            progressionData={generateMockProgressionData()}
            className="mb-4"
          />
        )}

        {/* Timer and Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Removed redundant badges since GameCategoryIndicator shows them */}
          </div>

          {/* Timer and Controls */}
          <div className="flex items-center space-x-4">
            {timeLimit && (
              <div className="text-sm text-gray-600">
                Limit: {formatTime(timeLimit)}
              </div>
            )}
            <div className={cn(
              'flex items-center space-x-2 px-3 py-1 rounded-lg',
              {
                'bg-green-100 text-green-800': timer.timeElapsed < (timeLimit || Infinity) * 0.5,
                'bg-yellow-100 text-yellow-800': timer.timeElapsed >= (timeLimit || Infinity) * 0.5 && timer.timeElapsed < (timeLimit || Infinity) * 0.8,
                'bg-red-100 text-red-800': timer.timeElapsed >= (timeLimit || Infinity) * 0.8
              }
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">
                {formatTime(timer.timeElapsed)}
              </span>
            </div>

            {practiceMode && (
              <div className="flex items-center space-x-2">
                {timer.isPaused ? (
                  <button
                    onClick={resumeTimer}
                    className="text-green-600 hover:text-green-700"
                    title="Resume"
                  >
                    ▶️
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="text-yellow-600 hover:text-yellow-700"
                    title="Pause"
                  >
                    ⏸️
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-700"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Game Setup */}
        <div className="game-setup space-y-3">
          <h3 className="text-lg font-semibold">Game Setup</h3>
          <div className="prose prose-sm max-w-none">
            <p>{question.game_setup.scenario_description}</p>
          </div>

          {/* Game Rules */}
          <div className="rules-section">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Rules:</h4>
            <ul className="space-y-1">
              {question.game_rules.map((rule, index) => (
                <li key={rule.id} className="text-sm text-gray-600">
                  {index + 1}. {rule.rule_text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Game Board */}
      <div className="game-board-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Interactive Game Board</h3>
          <button
            onClick={() => setShowGameBoard(!showGameBoard)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            {showGameBoard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showGameBoard ? 'Hide' : 'Show'} Board</span>
          </button>
        </div>

        {showGameBoard && (
          <div className="border rounded-lg bg-gray-50">
            <GameBoard
              question={question}
              onStateChange={handleBoardStateChange}
              onUserAction={handleUserAction}
              readOnly={isAnswered && !practiceMode}
              showHints={showHints}
              className="min-h-[500px]"
            />
          </div>
        )}
      </div>

      {/* Question Stem */}
      <div className="question-stem">
        <h3 className="text-lg font-semibold mb-3">Question</h3>
        <div className="prose prose-sm max-w-none">
          <p>{question.question_stem}</p>
        </div>
      </div>

      {/* Answer Choices */}
      <div className="answer-choices space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Answer Choices:</h4>
        <div className="space-y-2">
          {question.answer_choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleAnswerSelect(choice.id)}
              disabled={isAnswered}
              className={cn(
                'w-full text-left p-4 border rounded-lg transition-all',
                'hover:border-blue-300 hover:bg-blue-50',
                {
                  'bg-blue-100 border-blue-400': selectedAnswer === choice.id,
                  'bg-green-100 border-green-400': isAnswered && choice.is_correct,
                  'bg-red-100 border-red-400': isAnswered && selectedAnswer === choice.id && !choice.is_correct,
                  'cursor-not-allowed opacity-50': isAnswered
                }
              )}
            >
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + question.answer_choices.indexOf(choice))}
                </span>
                <span className="flex-grow text-sm">{choice.text}</span>
                {isAnswered && (
                  <span className="flex-shrink-0">
                    {choice.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : selectedAnswer === choice.id ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : null}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hints Section */}
      {practiceMode && showHints && (
        <div className="hints-section">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Need Help?</h4>
            <span className="text-xs text-gray-500">
              Hints used: {hintsUsed.length}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleHintRequest('setup_guidance')}
              className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
            >
              Setup Hint
            </button>
            <button
              onClick={() => handleHintRequest('rule_clarification')}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
            >
              Rule Help
            </button>
            <button
              onClick={() => handleHintRequest('inference_help')}
              className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
            >
              Inference Hint
            </button>
          </div>

          {/* Active Hints Stack */}
          {activeHints.length > 0 && (
            <div className="mt-3 space-y-2">
              {activeHints.map((hint) => (
                <div key={hint.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-2 flex-1">
                      <HelpCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-yellow-600 font-medium mb-1">
                          {hint.type === 'setup_guidance' && 'Setup Hint'}
                          {hint.type === 'rule_clarification' && 'Rule Help'}
                          {hint.type === 'inference_help' && 'Inference Hint'}
                        </div>
                        <p className="text-sm text-yellow-800">{hint.content}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissHint(hint.id)}
                      className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded"
                      aria-label="Dismiss hint"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Solution Steps */}
      {(isAnswered || showSolution) && (
        <div className="solution-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Solution Explanation</h3>
            <button
              onClick={() => setShowSolutionSteps(!showSolutionSteps)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showSolutionSteps ? 'Hide' : 'Show'} Steps
            </button>
          </div>

          {showSolutionSteps && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>{question.explanation}</p>
              </div>

              {/* Solution Steps */}
              <div className="solution-steps space-y-3">
                {question.solution_approach.map((step, index) => (
                  <div
                    key={step.step_number}
                    className={cn(
                      'step-item p-4 border rounded-lg',
                      {
                        'bg-blue-50 border-blue-200': index === currentSolutionStep,
                        'bg-gray-50 border-gray-200': index !== currentSolutionStep
                      }
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step.step_number}
                      </span>
                      <div className="flex-grow">
                        <h5 className="text-sm font-medium mb-1">
                          {step.step_type.replace('_', ' ').toUpperCase()}
                        </h5>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.concepts_demonstrated.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {step.concepts_demonstrated.map((concept, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Utility function to calculate efficiency score
function calculateEfficiencyScore(userActions: UserAction[], solutionSteps: SolutionStep[]): number {
  const optimalSteps = solutionSteps.length
  const actualSteps = userActions.length

  if (actualSteps === 0) return 0
  if (actualSteps <= optimalSteps) return 100

  return Math.max(0, Math.round((optimalSteps / actualSteps) * 100))
}

// Mock data generation functions for analytics dashboard
function generateMockGameTypePerformances() {
  return [
    {
      game_type: 'sequencing',
      total_attempts: 25,
      correct_attempts: 18,
      metrics: {
        accuracy: 72,
        average_time: 420,
        completion_rate: 85,
        difficulty_progression: 5,
        consistency_score: 0.75,
        improvement_rate: 12,
        mastery_level: 'developing' as const
      },
      common_mistakes: [
        { mistake_type: 'Incorrect ordering', frequency: 8, impact_on_time: 45 },
        { mistake_type: 'Missed constraints', frequency: 5, impact_on_time: 30 }
      ],
      skill_gaps: [
        { skill: 'Setup Speed', proficiency: 0.7, priority: 'medium' as const },
        { skill: 'Rule Application', proficiency: 0.8, priority: 'low' as const }
      ],
      benchmarks: {
        percentile: 65,
        time_vs_average: 1.1,
        accuracy_vs_average: 1.03,
        difficulty_level: 5,
        target_metrics: {
          target_accuracy: 82,
          target_time: 360,
          target_difficulty: 6,
          estimated_completion_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    },
    {
      game_type: 'grouping',
      total_attempts: 18,
      correct_attempts: 12,
      metrics: {
        accuracy: 67,
        average_time: 380,
        completion_rate: 78,
        difficulty_progression: 4,
        consistency_score: 0.68,
        improvement_rate: 8,
        mastery_level: 'developing' as const
      },
      common_mistakes: [
        { mistake_type: 'Group size errors', frequency: 6, impact_on_time: 35 },
        { mistake_type: 'Exclusion rules missed', frequency: 4, impact_on_time: 25 }
      ],
      skill_gaps: [
        { skill: 'Group Analysis', proficiency: 0.6, priority: 'high' as const },
        { skill: 'Constraint Tracking', proficiency: 0.7, priority: 'medium' as const }
      ],
      benchmarks: {
        percentile: 58,
        time_vs_average: 0.95,
        accuracy_vs_average: 0.96,
        difficulty_level: 4,
        target_metrics: {
          target_accuracy: 77,
          target_time: 340,
          target_difficulty: 5,
          estimated_completion_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }
  ]
}

function generateMockOverallMetrics() {
  return {
    accuracy: 69.5,
    average_time: 402,
    completion_rate: 81.5,
    difficulty_progression: 4.5,
    consistency_score: 0.715,
    improvement_rate: 10,
    mastery_level: 'developing' as const
  }
}

function generateMockLearningInsights() {
  return {
    strengths: [
      'Strong performance in sequencing games',
      'Good improvement rate over time',
      'Consistent practice schedule'
    ],
    weaknesses: [
      'Lower accuracy in grouping games',
      'Slow setup time for complex games',
      'Difficulty with overlapping constraints'
    ],
    recommendations: [
      {
        priority: 'high' as const,
        action: 'Focus on grouping game setup patterns and practice constraint tracking',
        estimated_impact: 8,
        estimated_time: 12
      },
      {
        priority: 'medium' as const,
        action: 'Develop speed drills for game setup and initial deductions',
        estimated_impact: 6,
        estimated_time: 8
      }
    ],
    study_plan: [
      {
        phase: 'Skill Building',
        focus_areas: ['Grouping fundamentals', 'Setup efficiency'],
        duration: 3,
        success_criteria: ['75% accuracy on grouping games', 'Sub-6 minute setup time']
      },
      {
        phase: 'Advanced Practice',
        focus_areas: ['Complex constraints', 'Speed optimization'],
        duration: 4,
        success_criteria: ['85% overall accuracy', '5-minute average completion']
      }
    ]
  }
}

function generateMockComparisonData() {
  return {
    user_performance: generateMockOverallMetrics(),
    peer_average: {
      accuracy: 72,
      average_time: 420,
      completion_rate: 85,
      difficulty_progression: 5,
      consistency_score: 0.65,
      improvement_rate: 5,
      mastery_level: 'developing' as const
    },
    expert_benchmark: {
      accuracy: 95,
      average_time: 240,
      completion_rate: 98,
      difficulty_progression: 9,
      consistency_score: 0.9,
      improvement_rate: 2,
      mastery_level: 'expert' as const
    },
    improvement_potential: {
      current_score: 72,
      potential_score: 95,
      improvement_gap: 23,
      actionable_areas: ['Accuracy improvement', 'Speed enhancement', 'Consistency building']
    }
  }
}

function generateMockRecentSessions() {
  return [
    {
      session_id: 'session-1',
      question_id: 'lg-001',
      game_type: 'sequencing',
      start_time: Date.now() - 3600000,
      end_time: Date.now() - 3200000,
      total_duration: 400,
      accuracy_score: 0.8,
      efficiency_score: 0.7,
      learning_score: 0.9,
      mistakes: [],
      interactions: [],
      cognitive_load_indicators: {
        pause_frequency: 2,
        hint_usage_rate: 1,
        mistake_recovery_time: 15,
        cognitive_load_score: 4
      }
    },
    {
      session_id: 'session-2',
      question_id: 'lg-002',
      game_type: 'grouping',
      start_time: Date.now() - 7200000,
      end_time: Date.now() - 6800000,
      total_duration: 380,
      accuracy_score: 0.6,
      efficiency_score: 0.5,
      learning_score: 0.7,
      mistakes: [],
      interactions: [],
      cognitive_load_indicators: {
        pause_frequency: 3,
        hint_usage_rate: 2,
        mistake_recovery_time: 25,
        cognitive_load_score: 6
      }
    }
  ]
}

function generateMockProgressionData() {
  return {
    timeline: [
      {
        date: '2025-01-14',
        metrics: {
          accuracy: 65,
          average_time: 450,
          completion_rate: 75,
          difficulty_progression: 4,
          consistency_score: 0.6,
          improvement_rate: 5,
          mastery_level: 'developing' as const
        }
      },
      {
        date: '2025-01-17',
        metrics: {
          accuracy: 68,
          average_time: 425,
          completion_rate: 80,
          difficulty_progression: 4,
          consistency_score: 0.65,
          improvement_rate: 8,
          mastery_level: 'developing' as const
        }
      },
      {
        date: '2025-01-20',
        metrics: generateMockOverallMetrics()
      }
    ],
    trend_analysis: {
      accuracy_trend: 'improving' as const,
      time_trend: 'improving' as const,
      consistency_trend: 'stable' as const,
      overall_progression: 1.5
    }
  }
}

export default LogicGameQuestion