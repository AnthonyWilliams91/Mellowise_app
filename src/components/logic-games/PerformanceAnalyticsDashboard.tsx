/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Performance Analytics Dashboard Component
 *
 * Comprehensive analytics dashboard displaying performance metrics, benchmarks,
 * learning insights, and progress tracking for Logic Games
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - UX Expert Aria + Dev Agent Marcus
 * @created 2025-01-20
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Brain,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

import type {
  GameTypePerformance,
  PerformanceMetrics,
  PerformanceBenchmarks,
  LearningInsights,
  ComparisonData,
  SessionAnalytics
} from '@/lib/logic-games/performance-analytics'

interface PerformanceAnalyticsDashboardProps {
  gameTypePerformances: GameTypePerformance[]
  overallMetrics: PerformanceMetrics
  learningInsights: LearningInsights
  comparisonData: ComparisonData
  recentSessions: SessionAnalytics[]
  progressionData: {
    timeline: { date: string; metrics: PerformanceMetrics }[]
    trend_analysis: {
      accuracy_trend: 'improving' | 'declining' | 'stable'
      time_trend: 'improving' | 'declining' | 'stable'
      consistency_trend: 'improving' | 'declining' | 'stable'
      overall_progression: number
    }
  }
  className?: string
}

const GAME_TYPE_COLORS = {
  sequencing: '#3b82f6',
  grouping: '#10b981',
  matching: '#f59e0b',
  hybrid: '#8b5cf6'
}

const MASTERY_COLORS = {
  novice: '#ef4444',
  developing: '#f59e0b',
  proficient: '#3b82f6',
  advanced: '#10b981',
  expert: '#8b5cf6'
}

export function PerformanceAnalyticsDashboard({
  gameTypePerformances,
  overallMetrics,
  learningInsights,
  comparisonData,
  recentSessions,
  progressionData,
  className
}: PerformanceAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null)

  // Prepare chart data
  const gameTypeChartData = useMemo(() => {
    return gameTypePerformances.map(perf => ({
      gameType: perf.game_type,
      accuracy: perf.metrics.accuracy,
      avgTime: perf.metrics.average_time / 60, // convert to minutes
      attempts: perf.total_attempts,
      mastery: perf.metrics.mastery_level
    }))
  }, [gameTypePerformances])

  const comparisonChartData = useMemo(() => {
    return [
      {
        metric: 'Accuracy',
        user: comparisonData.user_performance.accuracy,
        peer: comparisonData.peer_average.accuracy,
        expert: comparisonData.expert_benchmark.accuracy
      },
      {
        metric: 'Speed',
        user: Math.max(0, 100 - (comparisonData.user_performance.average_time / 60 * 10)),
        peer: Math.max(0, 100 - (comparisonData.peer_average.average_time / 60 * 10)),
        expert: Math.max(0, 100 - (comparisonData.expert_benchmark.average_time / 60 * 10))
      },
      {
        metric: 'Consistency',
        user: comparisonData.user_performance.consistency_score * 100,
        peer: comparisonData.peer_average.consistency_score * 100,
        expert: comparisonData.expert_benchmark.consistency_score * 100
      }
    ]
  }, [comparisonData])

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getMasteryBadgeColor = (level: PerformanceMetrics['mastery_level']) => {
    return MASTERY_COLORS[level]
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-purple-600'
    if (percentile >= 75) return 'text-green-600'
    if (percentile >= 50) return 'text-blue-600'
    if (percentile >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('performance-analytics-dashboard space-y-6', className)}>
      {/* Header with Overall Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                Logic Games Performance Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of your Logic Games performance with benchmarks and insights
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${getMasteryBadgeColor(overallMetrics.mastery_level)}20`,
                  borderColor: getMasteryBadgeColor(overallMetrics.mastery_level),
                  color: getMasteryBadgeColor(overallMetrics.mastery_level)
                }}
              >
                {overallMetrics.mastery_level.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(overallMetrics.accuracy)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="flex items-center justify-center mt-1">
                {getTrendIcon(progressionData.trend_analysis.accuracy_trend)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatTime(overallMetrics.average_time)}</div>
              <div className="text-sm text-gray-600">Avg Time</div>
              <div className="flex items-center justify-center mt-1">
                {getTrendIcon(progressionData.trend_analysis.time_trend)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(overallMetrics.consistency_score * 100)}%</div>
              <div className="text-sm text-gray-600">Consistency</div>
              <div className="flex items-center justify-center mt-1">
                {getTrendIcon(progressionData.trend_analysis.consistency_trend)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {overallMetrics.improvement_rate > 0 ? '+' : ''}{Math.round(overallMetrics.improvement_rate)}%
              </div>
              <div className="text-sm text-gray-600">Improvement</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="game-types">Game Types</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Type Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-500" />
                  Performance by Game Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameTypeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gameType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Sessions Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Recent Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressionData.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="metrics.accuracy" stroke="#3b82f6" name="Accuracy" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="font-semibold">Top Strength</div>
                    <div className="text-sm text-gray-600">
                      {learningInsights.strengths[0] || 'Building foundational skills'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-red-500" />
                  <div>
                    <div className="font-semibold">Focus Area</div>
                    <div className="text-sm text-gray-600">
                      {learningInsights.weaknesses[0] || 'Continue practicing'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="font-semibold">Next Goal</div>
                    <div className="text-sm text-gray-600">
                      {learningInsights.recommendations[0]?.action || 'Keep practicing regularly'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Game Types Tab */}
        <TabsContent value="game-types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameTypePerformances.map((performance, index) => (
              <Card
                key={performance.game_type}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedGameType === performance.game_type ? "ring-2 ring-blue-500" : ""
                )}
                onClick={() => setSelectedGameType(
                  selectedGameType === performance.game_type ? null : performance.game_type
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: GAME_TYPE_COLORS[performance.game_type as keyof typeof GAME_TYPE_COLORS] }}
                    />
                    {performance.game_type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Attempts</span>
                      <span className="text-sm font-medium">{performance.total_attempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <span className="text-sm font-medium">{Math.round(performance.metrics.accuracy)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Time</span>
                      <span className="text-sm font-medium">{formatTime(performance.metrics.average_time)}</span>
                    </div>
                    <Progress
                      value={performance.metrics.accuracy}
                      className="h-2"
                    />
                    <Badge
                      variant="outline"
                      className="w-full justify-center"
                      style={{
                        backgroundColor: `${getMasteryBadgeColor(performance.metrics.mastery_level)}20`,
                        borderColor: getMasteryBadgeColor(performance.metrics.mastery_level)
                      }}
                    >
                      {performance.metrics.mastery_level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Game Type Analysis */}
          {selectedGameType && (
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{selectedGameType} Games - Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const performance = gameTypePerformances.find(p => p.game_type === selectedGameType)
                  if (!performance) return null

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Common Mistakes */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Common Mistakes
                        </h4>
                        <div className="space-y-2">
                          {performance.common_mistakes.slice(0, 3).map((mistake, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{mistake.mistake_type}</span>
                              <span className="text-gray-500">
                                {mistake.frequency}x (+{Math.round(mistake.impact_on_time)}s)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skill Gaps */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-red-500" />
                          Skill Development Areas
                        </h4>
                        <div className="space-y-2">
                          {performance.skill_gaps.map((gap, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{gap.skill}</span>
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  gap.priority === 'high' ? 'border-red-500 text-red-700' :
                                  gap.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-green-500 text-green-700'
                                )}>
                                  {gap.priority}
                                </Badge>
                              </div>
                              <Progress value={gap.proficiency * 100} className="h-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Performance Comparison
                </CardTitle>
                <CardDescription>
                  How you compare against peer averages and expert benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="user" fill="#3b82f6" name="You" />
                    <Bar dataKey="peer" fill="#10b981" name="Peer Average" />
                    <Bar dataKey="expert" fill="#8b5cf6" name="Expert Level" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Percentile Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Percentile Rankings
                </CardTitle>
                <CardDescription>
                  Your performance percentile across different game types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameTypePerformances.map((performance, index) => (
                    <div key={performance.game_type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{performance.game_type}</span>
                        <span className={cn(
                          "text-sm font-bold",
                          getPercentileColor(performance.benchmarks.percentile)
                        )}>
                          {Math.round(performance.benchmarks.percentile)}th percentile
                        </span>
                      </div>
                      <Progress
                        value={performance.benchmarks.percentile}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Improvement Potential */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Improvement Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(comparisonData.improvement_potential.current_score)}
                  </div>
                  <div className="text-sm text-gray-600">Current Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(comparisonData.improvement_potential.potential_score)}
                  </div>
                  <div className="text-sm text-gray-600">Potential Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    +{Math.round(comparisonData.improvement_potential.improvement_gap)}
                  </div>
                  <div className="text-sm text-gray-600">Improvement Gap</div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Actionable Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {comparisonData.improvement_potential.actionable_areas.map((area, index) => (
                    <Badge key={index} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningInsights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningInsights.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Target className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningInsights.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={cn(
                        rec.priority === 'high' ? 'border-red-500 text-red-700' :
                        rec.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                        'border-green-500 text-green-700'
                      )}>
                        {rec.priority} priority
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {rec.estimated_time}h
                        <span>•</span>
                        Impact: {rec.estimated_impact}/10
                      </div>
                    </div>
                    <p className="text-sm">{rec.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Suggested Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningInsights.study_plan.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{phase.phase}</h4>
                      <Badge variant="outline">{phase.duration} weeks</Badge>
                    </div>
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-2">Focus Areas:</h5>
                      <div className="flex flex-wrap gap-1">
                        {phase.focus_areas.map((area, areaIndex) => (
                          <Badge key={areaIndex} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Success Criteria:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {phase.success_criteria.map((criteria, criteriaIndex) => (
                          <li key={criteriaIndex} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Performance Timeline
              </CardTitle>
              <CardDescription>
                Track your improvement over time across all metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressionData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="metrics.accuracy" stroke="#3b82f6" name="Accuracy %" />
                  <Line type="monotone" dataKey="metrics.consistency_score" stroke="#10b981" name="Consistency %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Accuracy Trend</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {progressionData.trend_analysis.accuracy_trend}
                    </div>
                  </div>
                  {getTrendIcon(progressionData.trend_analysis.accuracy_trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Speed Trend</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {progressionData.trend_analysis.time_trend}
                    </div>
                  </div>
                  {getTrendIcon(progressionData.trend_analysis.time_trend)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Consistency Trend</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {progressionData.trend_analysis.consistency_trend}
                    </div>
                  </div>
                  {getTrendIcon(progressionData.trend_analysis.consistency_trend)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Session Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session, index) => (
                  <div key={session.session_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: GAME_TYPE_COLORS[session.game_type as keyof typeof GAME_TYPE_COLORS]
                        }}
                      />
                      <div>
                        <div className="font-medium capitalize">{session.game_type} Game</div>
                        <div className="text-sm text-gray-600">
                          {new Date(session.start_time).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {Math.round(session.accuracy_score * 100)}% • {formatTime(session.total_duration)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Learning Score: {Math.round(session.learning_score * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PerformanceAnalyticsDashboard