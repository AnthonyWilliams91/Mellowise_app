/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Solution Walkthrough Component
 *
 * Educational guided tour for Logic Games with step-by-step learning
 * Built with Reactour for interactive guidance
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - UX Expert Aria + Dev Agent Marcus
 * @created 2025-01-20
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { TourProvider, useTour } from '@reactour/tour'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react'

import type { LogicGameQuestion } from '@/types/logic-games'
import { GameCategorizer, type GameClassification } from '@/lib/logic-games/game-categorizer'
import { SolutionRenderer, type SolutionWalkthrough, type WalkthroughStep } from '@/lib/logic-games/solution-renderer'

interface SolutionWalkthroughProps {
  question: LogicGameQuestion
  walkthroughType?: 'setup' | 'inference' | 'question_specific'
  onComplete?: (completedSteps: number, totalTime: number) => void
  onStepComplete?: (step: WalkthroughStep, timeSpent: number) => void
  className?: string
}

interface TourStepType {
  selector: string
  content: ({ setCurrentStep, currentStep, setIsOpen, transition }: any) => React.ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center'
  action?: (elem: Element | null) => void
  actionAfter?: (elem: Element | null) => void
  highlightedSelectors?: string[]
  mutationObservables?: string[]
}

export function SolutionWalkthrough({
  question,
  walkthroughType = 'setup',
  onComplete,
  onStepComplete,
  className
}: SolutionWalkthroughProps) {
  const [isReady, setIsReady] = useState(false)
  const [walkthrough, setWalkthrough] = useState<SolutionWalkthrough | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Generate walkthrough on mount
  React.useEffect(() => {
    const classification = GameCategorizer.classify(question)
    const generatedWalkthrough = SolutionRenderer.generateWalkthrough(
      question,
      classification,
      walkthroughType
    )
    setWalkthrough(generatedWalkthrough)
    setIsReady(true)
  }, [question, walkthroughType])

  // Convert walkthrough steps to Reactour steps
  const tourSteps = useMemo((): TourStepType[] => {
    if (!walkthrough) return []

    return walkthrough.steps.map((step, index) => ({
      selector: step.selector || '.logic-game-question',
      position: step.position || 'bottom',
      content: ({ setCurrentStep, currentStep, setIsOpen, transition }) => (
        <WalkthroughStepContent
          step={step}
          stepIndex={index}
          totalSteps={walkthrough.steps.length}
          isActive={currentStep === index}
          onNext={() => {
            if (index < walkthrough.steps.length - 1) {
              handleStepComplete(step)
              setCurrentStep(index + 1)
            } else {
              handleWalkthroughComplete()
              setIsOpen(false)
            }
          }}
          onPrevious={() => {
            if (index > 0) {
              setCurrentStep(index - 1)
            }
          }}
          onClose={() => setIsOpen(false)}
          onSkip={() => setIsOpen(false)}
        />
      ),
      action: step.action,
      actionAfter: step.actionAfter,
      highlightedSelectors: step.visual_cues
        .filter(cue => cue.type === 'highlight')
        .map(cue => cue.target)
    }))
  }, [walkthrough])

  const handleStepComplete = useCallback((step: WalkthroughStep) => {
    const timeSpent = Date.now() - stepStartTime
    setCompletedSteps(prev => [...prev, step.step_number])
    setStepStartTime(Date.now())
    onStepComplete?.(step, timeSpent)
  }, [stepStartTime, onStepComplete])

  const handleWalkthroughComplete = useCallback(() => {
    const totalTime = Date.now() - startTime
    onComplete?.(completedSteps.length, totalTime)
  }, [startTime, completedSteps.length, onComplete])

  if (!isReady || !walkthrough) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
  }

  return (
    <div className={cn('solution-walkthrough', className)}>
      <TourProvider
        steps={tourSteps}
        currentStep={0}
        setCurrentStep={() => {}}
        setIsOpen={() => {}}
        disableInteraction={false}
        scrollSmooth={true}
        showDots={true}
        showCloseButton={true}
        className="reactour__popover"
        styles={{
          popover: (base) => ({
            ...base,
            borderRadius: '12px',
            padding: 0,
            minWidth: '400px',
            maxWidth: '500px'
          }),
          badge: (base) => ({
            ...base,
            backgroundColor: '#3b82f6',
            color: 'white'
          }),
          controls: (base) => ({
            ...base,
            padding: '16px'
          })
        }}
        badgeContent={({ totalSteps, currentStep }) => (
          <span className="text-sm font-medium">
            {currentStep + 1} / {totalSteps}
          </span>
        )}
        onClickMask={({ setIsOpen }) => setIsOpen(false)}
        beforeClose={() => setStepStartTime(Date.now())}
        afterOpen={() => setStepStartTime(Date.now())}
      >
        <WalkthroughController walkthrough={walkthrough} />
      </TourProvider>
    </div>
  )
}

// Walkthrough controller component
function WalkthroughController({ walkthrough }: { walkthrough: SolutionWalkthrough }) {
  const { setIsOpen, isOpen, currentStep, setCurrentStep, steps } = useTour()

  return (
    <Card className="walkthrough-controller">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              {walkthrough.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {walkthrough.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {walkthrough.difficulty_level}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {Math.floor(walkthrough.estimated_duration / 60)}min
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-500">
              {isOpen ? currentStep + 1 : 0} / {walkthrough.steps.length} steps
            </span>
          </div>
          <Progress
            value={isOpen ? ((currentStep + 1) / walkthrough.steps.length) * 100 : 0}
            className="h-2"
          />
        </div>

        {/* Learning Objectives */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Target className="h-4 w-4 text-green-500" />
            Learning Objectives
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {walkthrough.learning_objectives.slice(0, 3).map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setIsOpen(true)
              setCurrentStep(0)
            }}
            disabled={isOpen}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isOpen ? 'Walkthrough Active' : 'Start Walkthrough'}
          </Button>

          {isOpen && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Individual step content component
function WalkthroughStepContent({
  step,
  stepIndex,
  totalSteps,
  isActive,
  onNext,
  onPrevious,
  onClose,
  onSkip
}: {
  step: WalkthroughStep
  stepIndex: number
  totalSteps: number
  isActive: boolean
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
  onSkip: () => void
}) {
  return (
    <div className="walkthrough-step-content">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Step {step.step_number}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {step.step_type}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-900">{step.title}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Main explanation */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {step.explanation}
          </p>
        </div>

        {/* Key insight */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Key Insight</p>
              <p className="text-sm text-blue-800 mt-1">{step.key_insight}</p>
            </div>
          </div>
        </div>

        {/* Common mistakes */}
        {step.common_mistakes.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Watch Out</p>
                <p className="text-sm text-yellow-800 mt-1">
                  {step.common_mistakes[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Teaching tip */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Pro Tip</p>
              <p className="text-sm text-green-800 mt-1">{step.teaching_tip}</p>
            </div>
          </div>
        </div>

        {/* Transfer learning */}
        <div className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">
          <p>{step.transfer_learning}</p>
        </div>
      </div>

      {/* Footer controls */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={stepIndex === 0}
          >
            <SkipBack className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {stepIndex + 1} of {totalSteps}
          </div>

          <div className="flex items-center gap-2">
            {stepIndex === totalSteps - 1 ? (
              <Button onClick={onNext} size="sm">
                Complete
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={onNext} size="sm">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolutionWalkthrough