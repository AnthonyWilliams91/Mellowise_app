/**
 * Analytics Dashboard Component
 * 
 * Main dashboard displaying user performance analytics, streaks, and progress
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  RefreshCw
} from 'lucide-react'
import { OverviewStats } from './OverviewStats'
import { StreakDisplay } from './StreakDisplay'
import { TopicPerformance } from './TopicPerformance'
import { SessionHistory } from './SessionHistory'
import { PerformanceChart } from './PerformanceChart'
import InsightsDashboard from './InsightsDashboard'

interface AnalyticsDashboardProps {
  className?: string
}

interface DashboardData {
  timeframe: string
  dateRange: { start: string; end: string }
  overview: any
  dailyStats: any[]
  streaks: any
  topicPerformance: any[]
  recentSessions: any[]
  performanceSnapshots?: any[]
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async (selectedTimeframe: string = timeframe) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics/dashboard?timeframe=${selectedTimeframe}&snapshots=true`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const dashboardData = await response.json()
      setData(dashboardData)
      
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    fetchDashboardData(newTimeframe)
  }

  const exportData = async () => {
    if (!data) return
    
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        timeframe: data.timeframe,
        dateRange: data.dateRange,
        summary: data.overview,
        dailyStats: data.dailyStats,
        topicPerformance: data.topicPerformance,
        recentSessions: data.recentSessions
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mellowise-analytics-${data.timeframe}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Track your learning progress and performance</p>
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
          <p className="text-gray-600">Start practicing to see your performance analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Performance overview for {data.dateRange.start} to {data.dateRange.end}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1">
            {['7d', '30d', '90d', 'all'].map(period => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeframeChange(period)}
                className="text-xs"
              >
                {period === 'all' ? 'All Time' : period.toUpperCase()}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats data={data.overview} timeframe={timeframe} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streaks */}
            <StreakDisplay data={data.streaks} />
            
            {/* Performance Chart */}
            <PerformanceChart 
              data={data.dailyStats} 
              timeframe={timeframe}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <InsightsDashboard />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <PerformanceChart 
            data={data.dailyStats} 
            timeframe={timeframe}
            detailed={true}
          />
        </TabsContent>
        
        <TabsContent value="topics" className="space-y-6">
          <TopicPerformance data={data.topicPerformance} />
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <SessionHistory data={data.recentSessions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}