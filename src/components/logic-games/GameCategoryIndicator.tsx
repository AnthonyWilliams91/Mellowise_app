/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Game Category Indicator Component
 *
 * Displays game type classification with visual indicators and tips
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - Aria (UX) + Marcus (Dev)
 * @created 2025-01-20
 */

'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Info,
  Zap,
  Clock,
  Target,
  GitBranch,
  Users,
  Link2,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import type { LogicGameQuestion } from '@/types/logic-games'
import { GameCategorizer, type GameClassification, type GameCategory } from '@/lib/logic-games/game-categorizer'

interface GameCategoryIndicatorProps {
  question: LogicGameQuestion
  showDetails?: boolean
  showPatterns?: boolean
  onApproachClick?: () => void
  className?: string
}

// Category icons and colors
const categoryConfig: Record<GameCategory, {
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  label: string
  description: string
}> = {
  sequencing: {
    icon: GitBranch,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Sequencing',
    description: 'Arrange entities in order'
  },
  grouping: {
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Grouping',
    description: 'Divide entities into groups'
  },
  matching: {
    icon: Link2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Matching',
    description: 'Assign attributes to entities'
  },
  hybrid: {
    icon: Shuffle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Hybrid',
    description: 'Multiple game types combined'
  }
}

export function GameCategoryIndicator({
  question,
  showDetails = true,
  showPatterns = true,
  onApproachClick,
  className
}: GameCategoryIndicatorProps) {
  const [classification, setClassification] = useState<GameClassification | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Classify the game on mount or when question changes
    const result = GameCategorizer.classify(question)
    setClassification(result)
  }, [question])

  if (!classification) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg" />
  }

  const categoryInfo = categoryConfig[classification.primary_category]
  const Icon = categoryInfo.icon

  const getComplexityColor = (score: number) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplexityLabel = (score: number) => {
    if (score <= 3) return 'Easy'
    if (score <= 6) return 'Medium'
    if (score <= 8) return 'Hard'
    return 'Expert'
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', categoryInfo.bgColor)}>
              <Icon className={cn('h-5 w-5', categoryInfo.color)} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {categoryInfo.label} Game
                <Badge variant="secondary" className="text-xs">
                  {classification.subcategory.replace(/_/g, ' ')}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {categoryInfo.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Complexity Score */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className={cn('font-semibold', getComplexityColor(classification.complexity_score))}>
                      {classification.complexity_score}/10
                    </span>
                    <Badge variant="outline" className="ml-1">
                      {getComplexityLabel(classification.complexity_score)}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complexity Score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Estimated Time */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {Math.floor(classification.estimated_time / 60)}:{(classification.estimated_time % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated completion time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent>
          {/* Key Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {classification.key_features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Expandable Details */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {/* Common Patterns */}
              {showPatterns && classification.common_patterns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Common Patterns
                  </h4>
                  <div className="space-y-2">
                    {classification.common_patterns.map((pattern, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="text-xs mt-0.5">
                          {pattern.pattern_type}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-gray-700">{pattern.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Frequency: {pattern.frequency}
                            </span>
                            <span className="text-xs text-gray-500">
                              Impact: {'★'.repeat(pattern.difficulty_impact)}{'☆'.repeat(5 - pattern.difficulty_impact)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Approach */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  Recommended Approach
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {classification.recommended_approach}
                </p>
                {onApproachClick && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={onApproachClick}
                    className="mt-2 p-0 h-auto"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    View step-by-step walkthrough
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default GameCategoryIndicator