/**
 * Advanced Analytics Dashboard Component
 * MELLOWISE-022: Advanced Progress Analytics Dashboard
 *
 * Comprehensive analytics visualization with readiness scoring, heat maps,
 * time management analysis, score prediction, and peer comparison.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Zap,
  Trophy,
  BarChart3,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Minus,
  Users,
  BookOpen,
  Timer,
  Award
} from 'lucide-react'

// Import analytics services
import { ReadinessScoreService } from '@/lib/analytics/readiness-scoring'
import { SectionAnalyticsService } from '@/lib/analytics/section-analytics'
import { HeatMapService } from '@/lib/analytics/heat-map-service'
import {
  TimeManagementAnalyticsService,
  ScorePredictionService,
  PeerComparisonService,
  StudyEfficiencyService
} from '@/lib/analytics/comprehensive-analytics'

// Import types
import {
  AnalyticsDashboardData,
  ReadinessScore,
  SectionAnalytics,
  QuestionTypeHeatMapData,
  HeatMapCell,
  TimeManagementAnalytics,
  ScorePrediction,
  PeerComparisonData,
  StudyEfficiencyMetrics,
  AnalyticsFilter
} from '@/types/analytics-dashboard'

interface AdvancedAnalyticsDashboardProps {
  userId: string
  className?: string
}

export default function AdvancedAnalyticsDashboard({
  userId,
  className = ''
}: AdvancedAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/analytics/advanced?userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch advanced analytics data')
      }

      const analyticsData = await response.json()
      setData(analyticsData)

    } catch (err) {
      console.error('Advanced analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  const exportAnalytics = async () => {
    if (!data) return

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: data.userId,
        dataRange: data.dataRange,
        readinessScore: data.readinessScore,
        sectionAnalytics: data.sectionAnalytics,
        scorePrediction: data.scorePrediction,
        insights: data.insights
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `advanced-analytics-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Export error:', err)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600">Comprehensive performance analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Complete more practice sessions to see advanced analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">
            Comprehensive analysis for {data.dataRange.start.toDateString()} to {data.dataRange.end.toDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Readiness Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            LSAT Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Score */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-300"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${data.readinessScore.overall}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(data.readinessScore.overall)}%
                  </span>
                </div>
              </div>
              <Badge variant={data.readinessScore.overall >= 80 ? 'default' : data.readinessScore.overall >= 65 ? 'secondary' : 'destructive'}>
                {data.readinessScore.overall >= 80 ? 'Ready' : data.readinessScore.overall >= 65 ? 'Nearly Ready' : 'More Practice Needed'}
              </Badge>
            </div>

            {/* Predicted Score Range */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Predicted LSAT Score</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Most Likely:</span>
                  <span className="font-semibold">{data.readinessScore.projectedScoreRange.mostLikely}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Range:</span>
                  <span className="font-semibold">
                    {data.readinessScore.projectedScoreRange.min} - {data.readinessScore.projectedScoreRange.max}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Confidence:</span>
                  <span className="font-semibold">{Math.round(data.readinessScore.projectedScoreRange.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Trend Indicator */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Trend</h4>
              <div className="flex items-center space-x-2 mb-2">
                {data.readinessScore.trend.direction === 'improving' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : data.readinessScore.trend.direction === 'declining' ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-600" />
                )}
                <span className="capitalize text-sm font-medium">
                  {data.readinessScore.trend.direction}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Trend significance: {data.readinessScore.trend.significance}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Readiness Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Readiness Factors</CardTitle>
                <CardDescription>Contributing factors to your readiness score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.readinessScore.factors.map((factor, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{factor.name.replace('_', ' ')}</span>
                      <span>{Math.round(factor.score)}%</span>
                    </div>
                    <Progress value={factor.score} className="h-2 mb-1" />
                    <p className="text-xs text-gray-600">{factor.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated insights from your performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.insights.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{finding}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>Prioritized recommendations to improve your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.insights.actionItems
                  .filter(item => item.status !== 'completed')
                  .slice(0, 6)
                  .map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      item.priority === 'critical' ? 'border-red-500 bg-red-50' :
                      item.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                      item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={item.priority === 'critical' ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{item.timeToComplete}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{item.description}</p>
                    <p className="text-xs text-gray-600">{item.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {data.sectionAnalytics.map((section, index) => (
              <Card key={section.sectionType}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {section.sectionType.replace('_', ' ')}
                  </CardTitle>
                  <CardDescription>
                    {Math.round(section.readinessPercentage)}% ready
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy:</span>
                      <span className="font-semibold">{section.performance.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Time:</span>
                      <span className="font-semibold">{Math.round(section.performance.averageTime)}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Consistency:</span>
                      <span className="font-semibold">{section.performance.consistency.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center space-x-2">
                    {section.trend.direction === 'improving' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : section.trend.direction === 'declining' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm capitalize">{section.trend.direction}</span>
                  </div>

                  {/* Top Recommendations */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Recommendations:</h4>
                    <ul className="space-y-1">
                      {section.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{rec.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Heat Map Tab */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Type Performance Heat Map</CardTitle>
              <CardDescription>Visual representation of your performance across different question types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Heat Map Visualization would go here */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {data.questionTypeHeatMap.slice(0, 20).map((item, index) => (
                    <div
                      key={item.questionType}
                      className="p-3 rounded text-center text-white text-xs font-medium"
                      style={{ backgroundColor: item.color }}
                    >
                      <div className="font-semibold">{item.accuracy}%</div>
                      <div className="opacity-90 text-xs truncate">
                        {item.questionType.replace('_', ' ')}
                      </div>
                      <div className="opacity-75 text-xs">
                        ({item.attemptCount} attempts)
                      </div>
                    </div>
                  ))}
                </div>

                {/* Heat Map Legend */}
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Needs Work (&lt;55%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Average (55-69%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Good (70-84%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Excellent (85%+)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>How you spend your time per question</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Too Fast', value: data.timeManagement.timeDistribution.tooFast, fill: '#ef4444' },
                        { name: 'Optimal', value: data.timeManagement.timeDistribution.optimal, fill: '#22c55e' },
                        { name: 'Too Slow', value: data.timeManagement.timeDistribution.tooSlow, fill: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pacing Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Pacing Analysis</CardTitle>
                <CardDescription>Your timing consistency and patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consistency:</span>
                    <span className="font-semibold">{data.timeManagement.pacing.consistency.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.timeManagement.pacing.consistency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rushing Tendency:</span>
                    <span className="font-semibold">{data.timeManagement.pacing.rushingTendency.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.timeManagement.pacing.rushingTendency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Deliberation Score:</span>
                    <span className="font-semibold">{data.timeManagement.pacing.deliberationScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.timeManagement.pacing.deliberationScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timing Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Timing Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.timeManagement.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2 capitalize">
                      {rec.area.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">Current:</span> {rec.currentBehavior}</div>
                      <div><span className="font-medium">Target:</span> {rec.targetBehavior}</div>
                      <div><span className="font-medium">Expected:</span> {rec.expectedImprovement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prediction Tab */}
        <TabsContent value="prediction" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>LSAT Score Prediction</CardTitle>
                <CardDescription>Based on your current performance patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {data.scorePrediction.predictedScore}
                  </div>
                  <div className="text-sm text-gray-600">
                    Predicted LSAT Score
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(data.scorePrediction.confidenceInterval.confidence * 100)}% confidence
                  </div>
                </div>

                {/* Scenarios */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conservative:</span>
                    <span className="font-semibold">{data.scorePrediction.scenarios.conservative}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Realistic:</span>
                    <span className="font-semibold">{data.scorePrediction.scenarios.realistic}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Optimistic:</span>
                    <span className="font-semibold">{data.scorePrediction.scenarios.optimistic}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction Factors</CardTitle>
                <CardDescription>Key factors influencing your predicted score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.scorePrediction.factors.slice(0, 5).map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{factor.name}</span>
                      <div className="text-xs text-gray-600">{factor.description}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        factor.impact > 0 ? 'text-green-600' :
                        factor.impact < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(factor.confidence * 100)}% conf.
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Time to Target */}
          {data.scorePrediction.timeToTarget && (
            <Card>
              <CardHeader>
                <CardTitle>Time to Target Score</CardTitle>
                <CardDescription>
                  Estimated time to reach {data.scorePrediction.timeToTarget.targetScore}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.scorePrediction.timeToTarget.estimatedDays}
                    </div>
                    <div className="text-sm text-gray-600">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(data.scorePrediction.timeToTarget.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {data.scorePrediction.timeToTarget.requirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Peer Comparison
              </CardTitle>
              <CardDescription>
                Anonymous comparison with {data.peerComparison.cohortSize} similar students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Percentile */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(data.peerComparison.userPercentile)}th
                </div>
                <div className="text-sm text-gray-600">
                  Percentile among peers
                </div>
              </div>

              {/* Comparison Metrics */}
              <div className="space-y-4">
                {data.peerComparison.metrics.slice(0, 6).map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{metric.category}</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(metric.percentile)}th percentile
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={metric.percentile} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>You: {metric.userValue}</span>
                        <span>Avg: {metric.peerAverage}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.interpretation}</p>
                  </div>
                ))}
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-600">Strengths vs Peers:</h4>
                  <ul className="space-y-1">
                    {data.peerComparison.strengthsVsPeers.map((strength, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 text-orange-600">Areas for Improvement:</h4>
                  <ul className="space-y-1">
                    {data.peerComparison.improvementAreas.map((area, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start space-x-1">
                        <AlertCircle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}