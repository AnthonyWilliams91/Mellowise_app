/**
 * Practice Session Difficulty Indicator
 * 
 * MELLOWISE-010: Dynamic Difficulty Adjustment Algorithm
 * Shows current difficulty level and adaptation status during practice sessions
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-010
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Settings, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DifficultyState, TopicCategory } from '@/types/dynamic-difficulty'

interface DifficultyIndicatorProps {
  currentDifficulty: number
  topicCategory: TopicCategory
  successRate?: number
  stability?: number
  isAdaptive?: boolean
  isManualOverride?: boolean
  confidenceLevel?: number
  onSettingsClick?: () => void
  className?: string
}

const DIFFICULTY_COLORS = {
  1: 'bg-green-500',
  2: 'bg-green-400', 
  3: 'bg-lime-400',
  4: 'bg-yellow-400',
  5: 'bg-orange-400',
  6: 'bg-orange-500',
  7: 'bg-red-400',
  8: 'bg-red-500',
  9: 'bg-purple-500',
  10: 'bg-purple-700'
}

const DIFFICULTY_LABELS = {
  1: 'Very Easy',
  2: 'Easy', 
  3: 'Moderate',
  4: 'Challenging',
  5: 'Hard',
  6: 'Very Hard',
  7: 'Expert',
  8: 'Master',
  9: 'Elite',
  10: 'Extreme'
}

export default function DifficultyIndicator({
  currentDifficulty,
  topicCategory,
  successRate = 0,
  stability = 0,
  isAdaptive = true,
  isManualOverride = false,
  confidenceLevel = 0,
  onSettingsClick,
  className = ''
}: DifficultyIndicatorProps) {
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const [previousDifficulty, setPreviousDifficulty] = useState(currentDifficulty)

  useEffect(() => {
    if (currentDifficulty > previousDifficulty) {
      setTrend('up')
    } else if (currentDifficulty < previousDifficulty) {
      setTrend('down')
    } else {
      setTrend('stable')
    }
    setPreviousDifficulty(currentDifficulty)
  }, [currentDifficulty, previousDifficulty])

  const getDifficultyColor = (difficulty: number): string => {
    return DIFFICULTY_COLORS[Math.min(10, Math.max(1, Math.round(difficulty))) as keyof typeof DIFFICULTY_COLORS]
  }

  const getDifficultyLabel = (difficulty: number): string => {
    return DIFFICULTY_LABELS[Math.min(10, Math.max(1, Math.round(difficulty))) as keyof typeof DIFFICULTY_LABELS]
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return <Target className="h-3 w-3 text-blue-500" />
    }
  }

  const getSuccessRateStatus = () => {
    if (successRate >= 0.8) return { color: 'text-green-600', label: 'Above Target' }
    if (successRate >= 0.7) return { color: 'text-blue-600', label: 'In Target' }
    return { color: 'text-red-600', label: 'Below Target' }
  }

  const getStabilityStatus = () => {
    if (stability >= 0.8) return { color: 'text-green-600', label: 'Very Stable' }
    if (stability >= 0.6) return { color: 'text-yellow-600', label: 'Moderate' }
    return { color: 'text-red-600', label: 'Unstable' }
  }

  const successRateStatus = getSuccessRateStatus()
  const stabilityStatus = getStabilityStatus()

  return (
    <TooltipProvider>
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Main Difficulty Display */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${getDifficultyColor(currentDifficulty)}`} />
            <span className="text-sm font-medium text-gray-700">
              Level {Math.round(currentDifficulty)}
            </span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className="text-xs text-gray-500">
                  {getDifficultyLabel(currentDifficulty)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2">
                <p className="font-medium">Difficulty: {getDifficultyLabel(currentDifficulty)}</p>
                <div className="text-xs space-y-1">
                  <div className={successRateStatus.color}>
                    Success Rate: {Math.round(successRate * 100)}% ({successRateStatus.label})
                  </div>
                  <div className={stabilityStatus.color}>
                    Stability: {Math.round(stability * 100)}% ({stabilityStatus.label})
                  </div>
                  {confidenceLevel > 0 && (
                    <div className="text-gray-600">
                      Confidence: {Math.round(confidenceLevel * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mode Indicators */}
        <div className="flex items-center space-x-1">
          {isManualOverride ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Manual
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manual difficulty override active</p>
              </TooltipContent>
            </Tooltip>
          ) : isAdaptive ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  Adaptive
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI is automatically adjusting difficulty</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Fixed
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fixed difficulty mode</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Practice Mode Indicator */}
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Practice
          </Badge>
        </div>

        {/* Success Rate Quick Indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1">
              {successRate >= 0.7 && successRate <= 0.8 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className={`h-4 w-4 ${successRate > 0.8 ? 'text-yellow-500' : 'text-red-500'}`} />
              )}
              <span className={`text-xs font-medium ${successRateStatus.color}`}>
                {Math.round(successRate * 100)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Success Rate Analysis</p>
              <div className="text-xs">
                <p>Current: {Math.round(successRate * 100)}%</p>
                <p>Target: 70-80%</p>
                <p className={successRateStatus.color}>
                  Status: {successRateStatus.label}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Settings Button */}
        {onSettingsClick && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust difficulty settings</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}