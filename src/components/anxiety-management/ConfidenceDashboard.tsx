/**
 * Confidence Dashboard Component
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Comprehensive dashboard for tracking confidence building progress,
 * celebrating achievements, and providing encouragement.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Award,
  Brain,
  ChevronRight,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  ConfidenceLevel,
  ConfidenceMetrics,
  AchievementCelebration,
  SuccessVisualization,
  ConfidenceJourney
} from '@/types/anxiety-management'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ConfidenceDashboardProps {
  confidenceMetrics: ConfidenceMetrics
  recentAchievements?: AchievementCelebration[]
  confidenceJourney?: ConfidenceJourney
  onStartConfidenceSession?: () => void
  onViewDetailedAnalytics?: () => void
  onCelebrateAchievement?: (achievementId: string) => void
}

interface ProgressCardProps {
  title: string
  value: number
  trend?: number
  target?: number
  icon: React.ReactNode
  color: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getConfidenceColor = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'very_low': return 'bg-red-500'
    case 'low': return 'bg-orange-500'
    case 'moderate': return 'bg-yellow-500'
    case 'high': return 'bg-blue-500'
    case 'very_high': return 'bg-green-500'
  }
}

const getConfidenceTextColor = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'very_low': return 'text-red-600'
    case 'low': return 'text-orange-600'
    case 'moderate': return 'text-yellow-600'
    case 'high': return 'text-blue-600'
    case 'very_high': return 'text-green-600'
  }
}

const getConfidenceMessage = (level: ConfidenceLevel, score: number): string => {
  switch (level) {
    case 'very_low':
      return "Every expert was once a beginner. Let's build your confidence step by step!"
    case 'low':
      return "You're making progress! Each question you answer correctly builds your confidence."
    case 'moderate':
      return "You're developing solid confidence! Keep up the consistent practice."
    case 'high':
      return "Excellent confidence level! You're well-prepared and capable."
    case 'very_high':
      return "Outstanding confidence! You're ready to tackle any challenge."
  }
}

const getTrendDescription = (trend: number): { text: string; color: string; icon: React.ReactNode } => {
  if (trend > 0.15) {
    return {
      text: `Strong upward trend (+${(trend * 100).toFixed(1)}%)`,
      color: 'text-green-600',
      icon: <TrendingUp className="h-4 w-4 text-green-600" />
    }
  } else if (trend > 0.05) {
    return {
      text: `Improving trend (+${(trend * 100).toFixed(1)}%)`,
      color: 'text-blue-600',
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />
    }
  } else if (trend < -0.15) {
    return {
      text: `Declining trend (${(trend * 100).toFixed(1)}%)`,
      color: 'text-red-600',
      icon: <TrendingDown className="h-4 w-4 text-red-600" />
    }
  } else if (trend < -0.05) {
    return {
      text: `Slight decline (${(trend * 100).toFixed(1)}%)`,
      color: 'text-orange-600',
      icon: <TrendingDown className="h-4 w-4 text-orange-600" />
    }
  } else {
    return {
      text: 'Stable performance',
      color: 'text-gray-600',
      icon: <div className="h-4 w-4 rounded-full bg-gray-400" />
    }
  }
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const ProgressCard: React.FC<ProgressCardProps> = ({ title, value, trend, target, icon, color }) => {
  const trendInfo = trend !== undefined ? getTrendDescription(trend) : null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
          {trendInfo && (
            <div className="flex items-center space-x-1">
              {trendInfo.icon}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">{value}%</span>
            {target && (
              <span className="text-sm text-muted-foreground">/ {target}%</span>
            )}
          </div>

          {target && (
            <Progress value={(value / target) * 100} className="h-2" />
          )}

          {trendInfo && (
            <p className={`text-xs ${trendInfo.color}`}>
              {trendInfo.text}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const AchievementCard: React.FC<{
  achievement: AchievementCelebration
  onCelebrate?: (id: string) => void
}> = ({ achievement, onCelebrate }) => {
  const getCelebrationColor = (level: string) => {
    switch (level) {
      case 'large': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'medium': return 'bg-gradient-to-r from-blue-400 to-purple-500'
      case 'small': return 'bg-gradient-to-r from-green-400 to-blue-500'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-16 h-16 ${getCelebrationColor(achievement.celebration_level)} opacity-20 rounded-bl-full`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <Badge variant="outline" className="text-xs">
                {achievement.achievement_type.replace('_', ' ')}
              </Badge>
            </div>
            <h3 className="font-medium mb-1">{achievement.description}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.message}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-600">
                +{achievement.points_earned} points
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(achievement.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {onCelebrate && (
          <Button
            onClick={() => onCelebrate(achievement.id)}
            size="sm"
            variant="outline"
            className="w-full mt-3"
          >
            Celebrate! 🎉
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

const MasteryProgress: React.FC<{ masteryProgress: Record<string, number> }> = ({ masteryProgress }) => {
  const topics = Object.entries(masteryProgress).sort(([,a], [,b]) => b - a)

  return (
    <div className="space-y-3">
      {topics.map(([topic, progress]) => (
        <div key={topic} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium capitalize">
              {topic.replace('_', ' ')}
            </span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConfidenceDashboard: React.FC<ConfidenceDashboardProps> = ({
  confidenceMetrics,
  recentAchievements = [],
  confidenceJourney,
  onStartConfidenceSession,
  onViewDetailedAnalytics,
  onCelebrateAchievement
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  const confidenceLevel = confidenceMetrics.current_level
  const confidenceScore = confidenceMetrics.confidence_score
  const successTrend = confidenceMetrics.success_rate_trend
  const achievementMomentum = confidenceMetrics.achievement_momentum

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Confidence Dashboard</h2>
        <p className="text-muted-foreground">
          Track your progress and celebrate your achievements
        </p>
      </div>

      {/* Current Confidence Level */}
      <Card className="relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 ${getConfidenceColor(confidenceLevel)} opacity-10 rounded-bl-full`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Current Confidence Level</h3>
              <Badge className={`${getConfidenceColor(confidenceLevel)} text-white mt-1`}>
                {confidenceLevel.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{confidenceScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>

          <Progress value={confidenceScore} className="h-3 mb-4" />

          <p className="text-muted-foreground mb-4">
            {getConfidenceMessage(confidenceLevel, confidenceScore)}
          </p>

          {onStartConfidenceSession && (
            <Button onClick={onStartConfidenceSession} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Start Confidence Building Session
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressCard
              title="Success Rate Trend"
              value={Math.round(successTrend * 100)}
              trend={successTrend}
              icon={<TrendingUp className="h-4 w-4" />}
              color="text-blue-600"
            />

            <ProgressCard
              title="Achievement Momentum"
              value={achievementMomentum}
              target={100}
              icon={<Star className="h-4 w-4" />}
              color="text-yellow-600"
            />

            <ProgressCard
              title="Confidence Score"
              value={confidenceScore}
              target={100}
              icon={<Brain className="h-4 w-4" />}
              color="text-green-600"
            />
          </div>

          {/* Recent Achievements Preview */}
          {recentAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Achievements</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('achievements')}
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentAchievements.slice(0, 2).map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onCelebrate={onCelebrateAchievement}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Topic Mastery Preview */}
          {Object.keys(confidenceMetrics.mastery_progress).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topic Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <MasteryProgress masteryProgress={confidenceMetrics.mastery_progress} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {recentAchievements.length > 0 ? (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Your Achievements</h3>
                <p className="text-muted-foreground">
                  Celebrate every milestone on your learning journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onCelebrate={onCelebrateAchievement}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Achievements Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start practicing to unlock your first achievement!
                </p>
                {onStartConfidenceSession && (
                  <Button onClick={onStartConfidenceSession}>
                    Begin Practice Session
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Detailed Progress</h3>
            <p className="text-muted-foreground">
              Track your confidence journey over time
            </p>
          </div>

          {/* Confidence Journey */}
          {confidenceJourney && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Confidence Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Journey Started:</span>
                    <span className="font-medium">
                      {new Date(confidenceJourney.journey_start_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium mb-2">Current Phase</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Focus Area: {confidenceJourney.current_phase.focus_area}
                    </p>
                    <Progress
                      value={confidenceJourney.current_phase.progress_percentage}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {confidenceJourney.current_phase.progress_percentage}% Complete
                    </p>
                  </div>

                  {confidenceJourney.milestones.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recent Milestones</h4>
                      <div className="space-y-2">
                        {confidenceJourney.milestones.slice(0, 3).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{milestone.achievement}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(milestone.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Impact: {milestone.impact_rating}/10
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analytics Button */}
          {onViewDetailedAnalytics && (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Get deeper insights into your confidence patterns and performance trends
                </p>
                <Button onClick={onViewDetailedAnalytics} variant="outline">
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConfidenceDashboard