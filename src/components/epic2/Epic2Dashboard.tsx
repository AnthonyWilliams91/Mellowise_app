'use client'

/**
 * Epic 2: AI-Powered Personalization Engine - Unified Dashboard
 *
 * Comprehensive dashboard integrating all Epic 2 systems:
 * - Learning Style Assessment (MELLOWISE-009)
 * - Dynamic Difficulty Adjustment (MELLOWISE-010)
 * - Performance Insights (MELLOWISE-012)
 * - Anxiety Management (MELLOWISE-014)
 * - Notifications & Reminders (MELLOWISE-015)
 * - Goal Tracking (MELLOWISE-016)
 *
 * Provides unified AI-powered personalization experience.
 *
 * @author Epic 2 Integration Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Brain,
  Target,
  TrendingUp,
  Heart,
  Bell,
  Trophy,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  Play,
  PauseCircle,
  RefreshCw
} from 'lucide-react'
import type { Epic2DashboardData } from '@/lib/epic2/epic2-integration-orchestrator'

interface Epic2DashboardProps {
  userId: string
  className?: string
}

interface DashboardState {
  data: Epic2DashboardData | null
  loading: boolean
  error: string | null
  lastRefresh: Date | null
}

export default function Epic2Dashboard({ userId, className = '' }: Epic2DashboardProps) {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    lastRefresh: null
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true)
    else setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/epic2/dashboard?userId=${userId}&refresh=${forceRefresh}`)

      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const data = await response.json()

      setState({
        data,
        loading: false,
        error: null,
        lastRefresh: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastRefresh: null
      }))
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  const handleQuickAction = async (actionId: string, action: string) => {
    try {
      await fetch('/api/epic2/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, actionId, action })
      })

      // Refresh data after action
      loadDashboardData(true)
    } catch (error) {
      console.error('Quick action failed:', error)
    }
  }

  if (state.loading && !state.data) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  if (state.error && !state.data) {
    return (
      <div className={`${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard Error</AlertTitle>
          <AlertDescription>
            {state.error}
            <Button variant="outline" size="sm" onClick={() => loadDashboardData()} className="mt-2">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { data } = state

  if (!data) return null

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Personalization Hub</h2>
          <p className="text-gray-600">Your tailored learning experience powered by 6 AI systems</p>
        </div>

        <div className="flex items-center space-x-3">
          {state.lastRefresh && (
            <span className="text-sm text-gray-500">
              Updated {state.lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {data.activeAlerts.length > 0 && (
        <div className="space-y-2">
          {data.activeAlerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.type === 'error' ? 'destructive' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Systems Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            AI Systems Status
          </CardTitle>
          <CardDescription>
            Real-time status of all personalization engines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.systemsStatus).map(([system, status]) => (
              <div key={system} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  status === 'active' ? 'bg-green-500' :
                  status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="text-xs font-medium text-gray-600 capitalize">
                  {system.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {data.quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Recommended Actions
            </CardTitle>
            <CardDescription>
              AI-powered suggestions based on your current progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.quickActions.map((action) => (
                <div
                  key={action.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleQuickAction(action.id, action.action)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}>
                      {action.priority}
                    </Badge>
                    <Badge variant="outline">{action.system}</Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning Profile</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personalization Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Personalization Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {Math.round(data.recommendations.confidence * 100)}%
                  </div>
                  <Progress value={data.recommendations.confidence * 100} className="mb-3" />
                  <p className="text-sm text-gray-600">
                    AI confidence in your personalization
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Study Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Next Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Topics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.recommendations.nextStudySession.recommendedTopics.map((topic) => (
                        <Badge key={topic} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Difficulty:</span>
                    <div className="flex items-center mt-1">
                      <Progress value={data.recommendations.nextStudySession.suggestedDifficulty * 10} className="flex-1 mr-2" />
                      <span className="text-sm font-medium">{data.recommendations.nextStudySession.suggestedDifficulty}/10</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{data.recommendations.nextStudySession.estimatedDuration} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pacing:</span>
                    <span className="text-sm font-medium">
                      {data.recommendations.learningOptimizations.recommendedPacing}s/question
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Break Frequency:</span>
                    <span className="text-sm font-medium">
                      Every {data.recommendations.learningOptimizations.breakFrequency} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Optimal Time:</span>
                    <span className="text-sm font-medium">
                      {data.recommendations.learningOptimizations.studyTimeOptimal.start} - {data.recommendations.learningOptimizations.studyTimeOptimal.end}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Elements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Motivation & Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Personalized Encouragement</h4>
                  <div className="space-y-2">
                    {data.recommendations.motivationalElements.personalizedEncouragement.map((message, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-800">{message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Achievement Opportunities</h4>
                  <div className="space-y-2">
                    {data.recommendations.motivationalElements.achievementOpportunities.map((opportunity, index) => (
                      <div key={index} className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm text-amber-800">{opportunity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Profile Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Style Profile</CardTitle>
              <CardDescription>
                Based on MELLOWISE-009 AI Learning Style Assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.userProfile.learningProfile ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Learning Style</h4>
                    <Badge variant="secondary" className="text-lg py-2 px-4">
                      {data.userProfile.learningProfile.primary_style}
                    </Badge>
                  </div>

                  {data.userProfile.learningStyleDimensions && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Information Processing:</span>
                        <p className="font-medium capitalize">
                          {data.userProfile.learningStyleDimensions.information_processing}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Reasoning Approach:</span>
                        <p className="font-medium capitalize">
                          {data.userProfile.learningStyleDimensions.reasoning_approach}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Pacing Preference:</span>
                        <p className="font-medium capitalize">
                          {data.userProfile.learningStyleDimensions.pacing}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Learning style assessment not completed</p>
                  <Button>Take Assessment</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Difficulty Status */}
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Difficulty Settings</CardTitle>
              <CardDescription>
                Based on MELLOWISE-010 Adaptive Difficulty Algorithm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.userProfile.currentDifficultyLevels).map(([topic, level]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {topic.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-3">
                      <Progress value={level * 10} className="w-24" />
                      <span className="text-sm font-medium">{level}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Based on MELLOWISE-012 Smart Performance Analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {data.userProfile.performancePatterns.length}
                    </div>
                    <p className="text-sm text-gray-600">Patterns Identified</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {data.userProfile.sessionInsights.length}
                    </div>
                    <p className="text-sm text-gray-600">Session Insights</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {Math.round(data.recommendations.confidence * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Analysis Confidence</p>
                  </div>
                </div>

                {data.userProfile.performancePatterns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recent Patterns</h4>
                    <div className="space-y-2">
                      {data.userProfile.performancePatterns.slice(0, 3).map((pattern, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {pattern.pattern_type.replace('_', ' ')}
                            </span>
                            <Badge variant="outline">
                              {Math.round(pattern.confidence_score * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {pattern.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          {data.userProfile.currentGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>
                  Based on MELLOWISE-016 Goal Tracking System
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.userProfile.currentGoals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{goal.target_score} LSAT Goal</h4>
                        <Badge variant="outline">
                          {goal.timeline_weeks} weeks
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{Math.round((goal.current_score / goal.target_score) * 100)}%</span>
                        </div>
                        <Progress value={(goal.current_score / goal.target_score) * 100} />
                      </div>

                      {goal.section_goals && (
                        <div className="mt-4 space-y-2">
                          {goal.section_goals.map((sectionGoal) => (
                            <div key={sectionGoal.section} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{sectionGoal.section.replace('_', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={(sectionGoal.current_score / sectionGoal.target_score) * 100} className="w-16" />
                                <span>{sectionGoal.current_score}/{sectionGoal.target_score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Wellbeing Tab */}
        <TabsContent value="wellbeing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anxiety Management</CardTitle>
              <CardDescription>
                Based on MELLOWISE-014 Adaptive Anxiety Management System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${
                      data.userProfile.anxietyProfile.baselineAnxietyLevel === 'low' ? 'text-green-600' :
                      data.userProfile.anxietyProfile.baselineAnxietyLevel === 'moderate' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.userProfile.anxietyProfile.baselineAnxietyLevel}
                    </div>
                    <p className="text-sm text-gray-600">Baseline Anxiety</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {data.userProfile.anxietyProfile.triggers.length}
                    </div>
                    <p className="text-sm text-gray-600">Known Triggers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {data.userProfile.anxietyProfile.effectiveCopingStrategies.length}
                    </div>
                    <p className="text-sm text-gray-600">Coping Strategies</p>
                  </div>
                </div>

                {data.userProfile.anxietyProfile.effectiveCopingStrategies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Effective Coping Strategies</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.userProfile.anxietyProfile.effectiveCopingStrategies.map((strategy, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">{strategy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Smart Notifications</CardTitle>
              <CardDescription>
                Based on MELLOWISE-015 Intelligent Reminder System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Active Reminders</h4>
                    <div className="text-2xl font-bold text-indigo-600">
                      {data.userProfile.reminderSchedule.length}
                    </div>
                    <p className="text-sm text-gray-600">Scheduled reminders</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Notification Status</h4>
                    <Badge variant="secondary">
                      {data.systemsStatus.notifications === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}