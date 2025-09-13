/**
 * Overview Statistics Component
 * 
 * Displays key performance metrics in a card layout
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Brain,
  Timer
} from 'lucide-react'

interface OverviewStatsProps {
  data: {
    totalSessions: number
    totalQuestions: number
    totalCorrect: number
    totalTimeSpent: number
    activeDays: number
    overallAccuracy: number
    avgSessionLength: number
    avgQuestionsPerSession: number
    studyDaysThisPeriod: number
  }
  timeframe: string
}

export function OverviewStats({ data, timeframe }: OverviewStatsProps) {
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const getTimeframeName = (tf: string) => {
    switch (tf) {
      case '7d': return 'week'
      case '30d': return 'month'
      case '90d': return '3 months'
      case 'all': return 'all time'
      default: return 'period'
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800'
    if (accuracy >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const stats = [
    {
      title: 'Study Sessions',
      value: data.totalSessions.toLocaleString(),
      description: `${data.studyDaysThisPeriod} active days this ${getTimeframeName(timeframe)}`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Questions Answered',
      value: data.totalQuestions.toLocaleString(),
      description: `${data.avgQuestionsPerSession.toFixed(1)} avg per session`,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Overall Accuracy',
      value: `${data.overallAccuracy.toFixed(1)}%`,
      description: `${data.totalCorrect}/${data.totalQuestions} correct`,
      icon: Target,
      color: getAccuracyColor(data.overallAccuracy),
      bgColor: data.overallAccuracy >= 80 ? 'bg-green-50' : 
                data.overallAccuracy >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      badge: (
        <Badge className={getAccuracyBadgeColor(data.overallAccuracy)}>
          {data.overallAccuracy >= 80 ? 'Excellent' :
           data.overallAccuracy >= 70 ? 'Good' : 'Needs Work'}
        </Badge>
      )
    },
    {
      title: 'Study Time',
      value: formatTime(data.totalTimeSpent),
      description: `${data.avgSessionLength.toFixed(1)} min avg session`,
      icon: Timer,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
                {stat.badge && (
                  <div className="ml-2">
                    {stat.badge}
                  </div>
                )}
              </div>
              
              {/* Progress bar for accuracy */}
              {stat.title === 'Overall Accuracy' && (
                <div className="mt-3">
                  <Progress 
                    value={data.overallAccuracy} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
      
      {/* Additional insights card */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Consistency
                </p>
                <p className="text-xs text-gray-500">
                  {data.studyDaysThisPeriod > 0 
                    ? `${Math.round((data.studyDaysThisPeriod / (timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365)) * 100)}% of days active`
                    : 'No activity yet'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Engagement
                </p>
                <p className="text-xs text-gray-500">
                  {data.avgSessionLength > 15 
                    ? 'Great session length'
                    : data.avgSessionLength > 5 
                    ? 'Good session length'
                    : 'Try longer sessions'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Progress
                </p>
                <p className="text-xs text-gray-500">
                  {data.overallAccuracy >= 80 
                    ? 'Excellent performance!'
                    : data.overallAccuracy >= 70 
                    ? 'Keep improving!'
                    : 'Focus on fundamentals'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}