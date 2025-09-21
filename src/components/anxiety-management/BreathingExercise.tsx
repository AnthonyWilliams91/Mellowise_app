/**
 * Breathing Exercise Component
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Interactive breathing exercise component with visual guidance, timer,
 * and progress tracking for anxiety relief.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { BreathingExercise, MindfulnessSession, AnxietyLevel } from '@/types/anxiety-management'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface BreathingExerciseProps {
  exercise: BreathingExercise
  onComplete?: (session: Omit<MindfulnessSession, 'id'>) => void
  onStart?: () => void
  onPause?: () => void
  anxietyLevel?: AnxietyLevel
  showInstructions?: boolean
  compact?: boolean
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause'

interface BreathingState {
  isActive: boolean
  currentPhase: BreathingPhase
  currentCycle: number
  phaseTimeRemaining: number
  totalTimeElapsed: number
  isCompleted: boolean
}

// ============================================================================
// BREATHING EXERCISE COMPONENT
// ============================================================================

export const BreathingExerciseComponent: React.FC<BreathingExerciseProps> = ({
  exercise,
  onComplete,
  onStart,
  onPause,
  anxietyLevel,
  showInstructions = true,
  compact = false
}) => {
  // State management
  const [breathingState, setBreathingState] = useState<BreathingState>({
    isActive: false,
    currentPhase: 'inhale',
    currentCycle: 1,
    phaseTimeRemaining: exercise.breathing_pattern.inhale_seconds,
    totalTimeElapsed: 0,
    isCompleted: false
  })

  const [soundEnabled, setSoundEnabled] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [anxietyBefore, setAnxietyBefore] = useState<AnxietyLevel | null>(anxietyLevel || null)

  // Phase progression logic
  const getNextPhase = useCallback((currentPhase: BreathingPhase): BreathingPhase => {
    switch (currentPhase) {
      case 'inhale': return 'hold'
      case 'hold': return 'exhale'
      case 'exhale': return 'pause'
      case 'pause': return 'inhale'
    }
  }, [])

  const getPhaseInstruction = useCallback((phase: BreathingPhase): string => {
    switch (phase) {
      case 'inhale': return 'Breathe in slowly...'
      case 'hold': return 'Hold your breath...'
      case 'exhale': return 'Breathe out gently...'
      case 'pause': return 'Rest and pause...'
    }
  }, [])

  const getPhaseDuration = useCallback((phase: BreathingPhase): number => {
    const pattern = exercise.breathing_pattern
    switch (phase) {
      case 'inhale': return pattern.inhale_seconds
      case 'hold': return pattern.hold_seconds
      case 'exhale': return pattern.exhale_seconds
      case 'pause': return pattern.pause_seconds
    }
  }, [exercise.breathing_pattern])

  // Main breathing timer effect
  useEffect(() => {
    if (!breathingState.isActive || breathingState.isCompleted) return

    const timer = setInterval(() => {
      setBreathingState(prev => {
        const newTimeRemaining = prev.phaseTimeRemaining - 1
        const newTotalElapsed = prev.totalTimeElapsed + 1

        // Check if phase is complete
        if (newTimeRemaining <= 0) {
          const nextPhase = getNextPhase(prev.currentPhase)
          const nextPhaseDuration = getPhaseDuration(nextPhase)

          // Check if cycle is complete (after pause phase)
          const isNewCycle = prev.currentPhase === 'pause'
          const newCycleCount = isNewCycle ? prev.currentCycle + 1 : prev.currentCycle

          // Check if exercise is complete
          if (newCycleCount > exercise.breathing_pattern.cycles) {
            return {
              ...prev,
              isActive: false,
              isCompleted: true,
              totalTimeElapsed: newTotalElapsed
            }
          }

          return {
            ...prev,
            currentPhase: nextPhase,
            currentCycle: newCycleCount,
            phaseTimeRemaining: nextPhaseDuration,
            totalTimeElapsed: newTotalElapsed
          }
        }

        return {
          ...prev,
          phaseTimeRemaining: newTimeRemaining,
          totalTimeElapsed: newTotalElapsed
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [breathingState.isActive, breathingState.isCompleted, exercise.breathing_pattern.cycles, getNextPhase, getPhaseDuration])

  // Handle exercise completion
  useEffect(() => {
    if (breathingState.isCompleted && startTime && onComplete) {
      const sessionData: Omit<MindfulnessSession, 'id'> = {
        user_id: '', // Will be set by parent component
        exercise_id: exercise.id,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        duration_completed_seconds: breathingState.totalTimeElapsed,
        effectiveness_rating: null,
        anxiety_level_before: anxietyBefore,
        anxiety_level_after: null,
        session_context: 'general'
      }
      onComplete(sessionData)
    }
  }, [breathingState.isCompleted, startTime, onComplete, exercise.id, breathingState.totalTimeElapsed, anxietyBefore])

  // Control handlers
  const handleStart = useCallback(() => {
    if (!startTime) {
      setStartTime(new Date())
    }
    setBreathingState(prev => ({ ...prev, isActive: true }))
    onStart?.()
  }, [startTime, onStart])

  const handlePause = useCallback(() => {
    setBreathingState(prev => ({ ...prev, isActive: false }))
    onPause?.()
  }, [onPause])

  const handleStop = useCallback(() => {
    setBreathingState({
      isActive: false,
      currentPhase: 'inhale',
      currentCycle: 1,
      phaseTimeRemaining: exercise.breathing_pattern.inhale_seconds,
      totalTimeElapsed: 0,
      isCompleted: false
    })
    setStartTime(null)
  }, [exercise.breathing_pattern.inhale_seconds])

  const handleReset = useCallback(() => {
    handleStop()
  }, [handleStop])

  // Calculate progress
  const totalExpectedDuration = exercise.duration_seconds
  const progressPercentage = Math.min(100, (breathingState.totalTimeElapsed / totalExpectedDuration) * 100)
  const cycleProgress = ((breathingState.currentCycle - 1) / exercise.breathing_pattern.cycles) * 100

  // Visual guide component
  const VisualGuide: React.FC = () => {
    const getVisualScale = () => {
      const { currentPhase, phaseTimeRemaining } = breathingState
      const phaseDuration = getPhaseDuration(currentPhase)
      const phaseProgress = 1 - (phaseTimeRemaining / phaseDuration)

      switch (currentPhase) {
        case 'inhale':
          return 0.5 + (phaseProgress * 0.5) // Scale from 0.5 to 1.0
        case 'hold':
          return 1.0 // Stay at full scale
        case 'exhale':
          return 1.0 - (phaseProgress * 0.5) // Scale from 1.0 to 0.5
        case 'pause':
          return 0.5 // Stay at small scale
        default:
          return 0.5
      }
    }

    const scale = breathingState.isActive ? getVisualScale() : 0.5
    const baseSize = compact ? 120 : 200

    if (exercise.visual_guide_type === 'circle') {
      return (
        <div
          className="transition-all duration-1000 ease-in-out rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto flex items-center justify-center text-white font-medium shadow-lg"
          style={{
            width: `${baseSize * scale}px`,
            height: `${baseSize * scale}px`,
            fontSize: compact ? '14px' : '18px'
          }}
        >
          {breathingState.phaseTimeRemaining}
        </div>
      )
    }

    if (exercise.visual_guide_type === 'square') {
      return (
        <div
          className="transition-all duration-1000 ease-in-out bg-gradient-to-br from-green-400 to-green-600 mx-auto flex items-center justify-center text-white font-medium shadow-lg rounded-lg"
          style={{
            width: `${baseSize * scale}px`,
            height: `${baseSize * scale}px`,
            fontSize: compact ? '14px' : '18px'
          }}
        >
          {breathingState.phaseTimeRemaining}
        </div>
      )
    }

    // Default wave visualization
    return (
      <div
        className="transition-all duration-1000 ease-in-out bg-gradient-to-br from-purple-400 to-purple-600 mx-auto flex items-center justify-center text-white font-medium shadow-lg"
        style={{
          width: `${baseSize * scale}px`,
          height: `${baseSize * scale * 0.6}px`,
          borderRadius: `${50 * scale}% ${50 * scale}% ${20}% ${20}%`,
          fontSize: compact ? '14px' : '18px'
        }}
      >
        {breathingState.phaseTimeRemaining}
      </div>
    )
  }

  if (compact) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{exercise.name}</h3>
            <Badge variant="outline" className="text-xs">
              {Math.floor(breathingState.totalTimeElapsed / 60)}:{(breathingState.totalTimeElapsed % 60).toString().padStart(2, '0')}
            </Badge>
          </div>

          <div className="mb-3">
            <VisualGuide />
          </div>

          <div className="text-center mb-3">
            <p className="text-sm text-muted-foreground mb-1">
              {getPhaseInstruction(breathingState.currentPhase)}
            </p>
            <p className="text-xs text-muted-foreground">
              Cycle {breathingState.currentCycle} of {exercise.breathing_pattern.cycles}
            </p>
          </div>

          <Progress value={progressPercentage} className="mb-3 h-2" />

          <div className="flex justify-center space-x-2">
            {!breathingState.isActive && !breathingState.isCompleted && (
              <Button onClick={handleStart} size="sm" variant="default">
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}

            {breathingState.isActive && (
              <Button onClick={handlePause} size="sm" variant="outline">
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            )}

            {(breathingState.isActive || breathingState.totalTimeElapsed > 0) && (
              <Button onClick={handleStop} size="sm" variant="ghost">
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{exercise.name}</CardTitle>
            <p className="text-muted-foreground mt-1">{exercise.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Badge variant="secondary">
              {Math.floor(exercise.duration_seconds / 60)} min
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructions */}
        {showInstructions && !breathingState.isActive && !breathingState.isCompleted && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {exercise.guidance_text.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Visual Guide */}
        <div className="text-center py-8">
          <VisualGuide />
        </div>

        {/* Current instruction */}
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            {getPhaseInstruction(breathingState.currentPhase)}
          </h3>
          <p className="text-muted-foreground">
            Cycle {breathingState.currentCycle} of {exercise.breathing_pattern.cycles}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Cycles Completed</span>
              <span>{Math.max(0, breathingState.currentCycle - 1)} / {exercise.breathing_pattern.cycles}</span>
            </div>
            <Progress value={cycleProgress} className="h-2" />
          </div>
        </div>

        {/* Timer display */}
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-primary">
            {Math.floor(breathingState.totalTimeElapsed / 60)}:
            {(breathingState.totalTimeElapsed % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Time elapsed
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!breathingState.isActive && !breathingState.isCompleted && (
            <Button onClick={handleStart} size="lg" className="px-8">
              <Play className="h-4 w-4 mr-2" />
              {breathingState.totalTimeElapsed > 0 ? 'Resume' : 'Start'}
            </Button>
          )}

          {breathingState.isActive && (
            <Button onClick={handlePause} size="lg" variant="outline" className="px-8">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          {(breathingState.isActive || breathingState.totalTimeElapsed > 0) && !breathingState.isCompleted && (
            <Button onClick={handleStop} size="lg" variant="ghost" className="px-8">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}

          {breathingState.isCompleted && (
            <Button onClick={handleReset} size="lg" variant="outline" className="px-8">
              Start Over
            </Button>
          )}
        </div>

        {/* Completion message */}
        {breathingState.isCompleted && (
          <div className="text-center bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Exercise Complete!</h3>
            <p className="text-sm text-green-600">
              Great job! You completed {exercise.breathing_pattern.cycles} cycles of {exercise.name}.
              Take a moment to notice how you feel now.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BreathingExerciseComponent