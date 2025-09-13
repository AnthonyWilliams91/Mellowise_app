/**
 * Smart Performance Insights Dashboard
 * 
 * Displays AI-powered performance insights and patterns
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain,
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react'
import { InsightsDashboardData, PerformanceInsight, InsightPriority } from '@/types/insights'

interface InsightsDashboardProps {
  className?: string
}

export default function InsightsDashboard({ className = '' }: InsightsDashboardProps) {
  const [data, setData] = useState<InsightsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsightsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/insights?lookback=30')
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights data')
      }
      
      const insightsData = await response.json()
      setData(insightsData)
      
    } catch (err) {
      console.error('Insights fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchInsightsData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchInsightsData()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-indigo-600" />
              Performance Insights
            </h2>
            <p className="text-gray-600">AI-powered analysis of your learning patterns</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Brain className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Generate Insights</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data || data.insights.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-indigo-600" />
              Performance Insights
            </h2>
            <p className="text-gray-600">AI-powered analysis of your learning patterns</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Yet</h3>
          <p className="text-gray-600">Complete a few more study sessions to generate personalized insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-indigo-600" />
            Performance Insights
          </h2>
          <p className="text-gray-600">
            AI-powered analysis • Generated {new Date(data.generated_at).toLocaleDateString()}
          </p>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.total_insights_generated}</div>
            <p className="text-xs text-gray-600">Patterns detected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.user_agreement_rate}%</div>
            <p className="text-xs text-gray-600">User agreement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.insight_effectiveness_score}%</div>
            <p className="text-xs text-gray-600">Implementation success</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Insights</h3>
        
        {data.insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
          />
        ))}
      </div>

      {/* Performance Patterns Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Patterns</CardTitle>
          <CardDescription>
            Key patterns identified in your study behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Rate Pattern */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Session Completion Rate</h4>
              <p className="text-sm text-gray-600">
                {(data.patterns.completion_rate.current_rate * 100).toFixed(0)}% 
                ({data.patterns.completion_rate.trend === 'improving' ? '+' : data.patterns.completion_rate.trend === 'declining' ? '' : '±'}
                {Math.abs(data.patterns.completion_rate.change_percentage).toFixed(1)}%)
              </p>
            </div>
            <div className="flex items-center">
              {data.patterns.completion_rate.trend === 'improving' && (
                <TrendingUp className="w-5 h-5 text-green-600" />
              )}
              {data.patterns.completion_rate.trend === 'declining' && (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              {data.patterns.completion_rate.trend === 'stable' && (
                <BarChart3 className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>

          {/* Streak Performance */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Streak Consistency</h4>
              <p className="text-sm text-gray-600">
                {(data.patterns.streak_performance.consistency_score * 100).toFixed(0)}% consistency • 
                Avg streak: {data.patterns.streak_performance.average_streak_length.toFixed(1)}
              </p>
            </div>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>

          {/* Time-based Performance */}
          {data.patterns.time_based.optimal_study_hours.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Optimal Study Times</h4>
                <p className="text-sm text-gray-600">
                  Best hours: {data.patterns.time_based.optimal_study_hours.map(h => `${h}:00`).join(', ')}
                </p>
              </div>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface InsightCardProps {
  insight: PerformanceInsight
}

function InsightCard({ insight }: InsightCardProps) {
  const priorityColors: Record<InsightPriority, string> = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }

  const priorityIcons: Record<InsightPriority, React.ReactNode> = {
    high: <AlertTriangle className="w-4 h-4" />,
    medium: <Lightbulb className="w-4 h-4" />,
    low: <CheckCircle className="w-4 h-4" />
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    performance_trends: <TrendingUp className="w-5 h-5" />,
    study_habits: <Calendar className="w-5 h-5" />,
    topic_mastery: <Target className="w-5 h-5" />,
    time_optimization: <Clock className="w-5 h-5" />
  }

  return (
    <Card className={`border-l-4 ${
      insight.priority === 'high' ? 'border-l-red-500' :
      insight.priority === 'medium' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {categoryIcons[insight.category] && (
              <div className="text-gray-600">
                {categoryIcons[insight.category]}
              </div>
            )}
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`${priorityColors[insight.priority]} flex items-center space-x-1`}
            >
              {priorityIcons[insight.priority]}
              <span className="capitalize">{insight.priority}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-700">{insight.description}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Recommendation</h4>
            <p className="text-blue-800 text-sm">{insight.recommendation}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Confidence: {insight.evidence.confidence_score}%
            </span>
            <span className="capitalize">
              {insight.evidence.trend_direction}
            </span>
          </div>
          
          {insight.evidence.confidence_score && (
            <Progress 
              value={insight.evidence.confidence_score} 
              className="h-1"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}