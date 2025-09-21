/**
 * Anxiety Indicator Component
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Visual indicator for current anxiety level with quick intervention options
 * and confidence building suggestions.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

'use client'

import React, { useState } from 'react'
import { Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, Wind } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type {
  AnxietyLevel,
  AnxietyDetectionResult,
  ConfidenceLevel,
  ConfidenceMetrics
} from '@/types/anxiety-management'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AnxietyIndicatorProps {
  anxietyDetection?: AnxietyDetectionResult
  confidenceMetrics?: ConfidenceMetrics
  onBreathingExercise?: () => void
  onQuickCalm?: () => void
  onViewInsights?: () => void
  showQuickActions?: boolean
  compact?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getAnxietyColor = (level: AnxietyLevel): string => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200'
    case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'severe': return 'text-red-600 bg-red-50 border-red-200'
  }
}

const getAnxietyIcon = (level: AnxietyLevel) => {
  switch (level) {
    case 'low': return <CheckCircle className="h-4 w-4" />
    case 'moderate': return <Heart className="h-4 w-4" />
    case 'high': return <AlertTriangle className="h-4 w-4" />
    case 'severe': return <AlertTriangle className="h-4 w-4" />
  }
}

const getConfidenceColor = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'very_low': return 'text-red-600'
    case 'low': return 'text-orange-600'
    case 'moderate': return 'text-yellow-600'
    case 'high': return 'text-blue-600'
    case 'very_high': return 'text-green-600'
  }
}

const getTrendIcon = (trend: number) => {
  if (trend > 0.1) return <TrendingUp className="h-3 w-3 text-green-600" />
  if (trend < -0.1) return <TrendingDown className="h-3 w-3 text-red-600" />
  return <div className="h-3 w-3 rounded-full bg-gray-400" />
}

const getAnxietyMessage = (level: AnxietyLevel, triggers?: string[]): string => {
  const triggerText = triggers && triggers.length > 0 ? ` Detected: ${triggers.join(', ').replace(/_/g, ' ')}` : ''

  switch (level) {
    case 'low':
      return `You're feeling calm and focused. Great time for challenging practice!${triggerText}`
    case 'moderate':
      return `Some stress detected. Consider a quick breathing exercise before continuing.${triggerText}`
    case 'high':
      return `High anxiety detected. Let's take a moment to center yourself.${triggerText}`
    case 'severe':
      return `Very high anxiety detected. Please take a break and try some calming exercises.${triggerText}`
  }
}

// ============================================================================
// ANXIETY INDICATOR COMPONENT
// ============================================================================

export const AnxietyIndicator: React.FC<AnxietyIndicatorProps> = ({
  anxietyDetection,
  confidenceMetrics,
  onBreathingExercise,
  onQuickCalm,
  onViewInsights,
  showQuickActions = true,
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false)

  // Default values if no data provided
  const anxietyLevel = anxietyDetection?.anxiety_level || 'low'
  const confidenceLevel = confidenceMetrics?.current_level || 'moderate'
  const confidenceScore = confidenceMetrics?.confidence_score || 50
  const confidenceTrend = confidenceMetrics?.success_rate_trend || 0

  // Determine if intervention is recommended
  const needsIntervention = anxietyLevel === 'high' || anxietyLevel === 'severe'
  const needsConfidenceBoost = confidenceLevel === 'very_low' || confidenceLevel === 'low'

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getAnxietyColor(anxietyLevel)}`}
              onClick={() => setShowDetails(!showDetails)}
            >
              {getAnxietyIcon(anxietyLevel)}
              <span className="font-medium capitalize text-sm">
                {anxietyLevel}
              </span>
              {needsIntervention && (
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">Anxiety: {anxietyLevel}</p>
              <p>Confidence: {confidenceLevel} ({confidenceScore}%)</p>
              {anxietyDetection && (
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round(anxietyDetection.confidence_score)}% detection confidence
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getAnxietyColor(anxietyLevel)}`}>
                {getAnxietyIcon(anxietyLevel)}
              </div>
              <div>
                <h3 className="font-semibold flex items-center space-x-2">
                  <span>Anxiety Level: </span>
                  <Badge variant="outline" className={getAnxietyColor(anxietyLevel)}>
                    {anxietyLevel.charAt(0).toUpperCase() + anxietyLevel.slice(1)}
                  </Badge>
                </h3>
                {anxietyDetection && (
                  <p className="text-xs text-muted-foreground">
                    {anxietyDetection.confidence_score}% detection confidence
                  </p>
                )}
              </div>
            </div>

            {needsIntervention && (
              <div className="flex items-center space-x-1 text-orange-600">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Intervention Recommended</span>
              </div>
            )}
          </div>

          {/* Confidence Metrics */}
          {confidenceMetrics && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm flex items-center space-x-1">
                  <Brain className="h-4 w-4" />
                  <span>Confidence Level</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium text-sm ${getConfidenceColor(confidenceLevel)}`}>
                    {confidenceLevel.replace('_', ' ')}
                  </span>
                  {getTrendIcon(confidenceTrend)}
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  value={confidenceScore}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="font-medium">{confidenceScore}%</span>
                  <span>100%</span>
                </div>
              </div>

              {confidenceTrend !== 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {confidenceTrend > 0 ? 'Improving' : 'Declining'} trend: {Math.abs(confidenceTrend * 100).toFixed(1)}%
                </p>
              )}
            </div>
          )}

          {/* Anxiety Message */}
          <div className="text-sm text-muted-foreground">
            {getAnxietyMessage(anxietyLevel, anxietyDetection?.triggers_identified)}
          </div>

          {/* Behavioral Patterns */}
          {anxietyDetection?.behavioral_patterns && anxietyDetection.behavioral_patterns.length > 0 && showDetails && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Observed Patterns:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {anxietyDetection.behavioral_patterns.map((pattern, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && (needsIntervention || needsConfidenceBoost) && (
            <div className="flex flex-wrap gap-2">
              {onBreathingExercise && (
                <Button
                  onClick={onBreathingExercise}
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Wind className="h-3 w-3" />
                  <span>Breathing Exercise</span>
                </Button>
              )}

              {onQuickCalm && (
                <Button
                  onClick={onQuickCalm}
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Heart className="h-3 w-3" />
                  <span>Quick Calm</span>
                </Button>
              )}

              {onViewInsights && (
                <Button
                  onClick={onViewInsights}
                  size="sm"
                  variant="ghost"
                  className="flex items-center space-x-1"
                >
                  <Brain className="h-3 w-3" />
                  <span>View Insights</span>
                </Button>
              )}
            </div>
          )}

          {/* Primary Indicators (detailed view) */}
          {anxietyDetection?.primary_indicators && showDetails && (
            <div className="border-t pt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-muted-foreground hover:text-foreground mb-2"
              >
                Hide Details
              </button>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium">Performance Decline:</span>
                  <span className="ml-1">{anxietyDetection.primary_indicators.performance_decline_rate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-medium">Response Time:</span>
                  <span className="ml-1">+{anxietyDetection.primary_indicators.response_time_increase.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-medium">Streak Breaks:</span>
                  <span className="ml-1">{(anxietyDetection.primary_indicators.streak_break_frequency * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="font-medium">Session Completion:</span>
                  <span className="ml-1">{((1 - anxietyDetection.primary_indicators.session_abandonment_rate) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Show details toggle */}
          {anxietyDetection && !showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Show Details
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnxietyIndicator