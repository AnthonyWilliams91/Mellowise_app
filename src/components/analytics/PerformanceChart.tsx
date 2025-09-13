/**
 * Performance Chart Component
 * 
 * Displays performance trends over time using charts
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react'

interface PerformanceChartProps {
  data: Array<{
    date_recorded: string
    sessions_played: number
    total_questions_answered: number
    total_correct_answers: number
    avg_accuracy: number
    best_streak: number
    total_time_spent: number
    is_streak_day: boolean
  }>
  timeframe: string
  detailed?: boolean
}

export function PerformanceChart({ data, timeframe, detailed = false }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Track your progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No performance data yet</p>
            <p className="text-sm text-gray-500">Complete some sessions to see your trends</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate trends
  const sortedData = [...data].sort((a, b) => new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime())
  const recentData = sortedData.slice(-7) // Last 7 days
  const previousData = sortedData.slice(-14, -7) // Previous 7 days
  
  const getAverage = (dataSet: typeof data, field: keyof typeof data[0]) => {
    if (dataSet.length === 0) return 0
    const sum = dataSet.reduce((acc, item) => acc + (Number(item[field]) || 0), 0)
    return sum / dataSet.length
  }
  
  const recentAvgAccuracy = getAverage(recentData, 'avg_accuracy')
  const previousAvgAccuracy = getAverage(previousData, 'avg_accuracy')
  const accuracyTrend = recentAvgAccuracy - previousAvgAccuracy
  
  const recentAvgQuestions = getAverage(recentData, 'total_questions_answered')
  const previousAvgQuestions = getAverage(previousData, 'total_questions_answered')
  const questionsTrend = recentAvgQuestions - previousAvgQuestions
  
  const streakDays = data.filter(d => d.is_streak_day).length
  const consistencyPercentage = (streakDays / data.length) * 100

  // Generate simple visual representation
  const maxAccuracy = Math.max(...data.map(d => d.avg_accuracy || 0))
  const maxQuestions = Math.max(...data.map(d => d.total_questions_answered || 0))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Trends</span>
          <Badge variant="outline">{timeframe.toUpperCase()}</Badge>
        </CardTitle>
        <CardDescription>
          Your learning progress over the selected timeframe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Avg Accuracy</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {recentAvgAccuracy.toFixed(1)}%
            </div>
            <div className="flex items-center justify-center text-xs">
              {accuracyTrend > 0 ? (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{accuracyTrend.toFixed(1)}%
                </div>
              ) : accuracyTrend < 0 ? (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {accuracyTrend.toFixed(1)}%
                </div>
              ) : (
                <span className="text-gray-500">No change</span>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Questions/Day</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {recentAvgQuestions.toFixed(1)}
            </div>
            <div className="flex items-center justify-center text-xs">
              {questionsTrend > 0 ? (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{questionsTrend.toFixed(1)}
                </div>
              ) : questionsTrend < 0 ? (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {questionsTrend.toFixed(1)}
                </div>
              ) : (
                <span className="text-gray-500">No change</span>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Consistency</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {consistencyPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">
              {streakDays}/{data.length} active days
            </div>
          </div>
        </div>
        
        {/* Simple Bar Chart Visualization */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Daily Activity</h4>
          <div className="space-y-2">
            {sortedData.slice(-14).map((day, index) => {
              const accuracy = day.avg_accuracy || 0
              const questions = day.total_questions_answered || 0
              const date = new Date(day.date_recorded)
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  
                  {/* Activity indicator */}
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div 
                        className={`h-2 rounded ${
                          day.is_streak_day ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        style={{ width: `${Math.max(4, (questions / maxQuestions) * 60)}px` }}
                      />
                      <span className="text-xs text-gray-600 w-8">{questions}</span>
                    </div>
                    
                    {accuracy > 0 && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="h-2 bg-blue-500 rounded"
                          style={{ width: `${(accuracy / 100) * 40}px` }}
                        />
                        <span className="text-xs text-gray-600 w-10">{accuracy.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 bg-green-500 rounded" />
              <span>Questions Answered</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 bg-blue-500 rounded" />
              <span>Accuracy</span>
            </div>
          </div>
        </div>
        
        {detailed && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Detailed Insights</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Best Single Day:</p>
                <p className="font-medium">
                  {Math.max(...data.map(d => d.total_questions_answered))} questions
                </p>
              </div>
              <div>
                <p className="text-gray-600">Best Accuracy:</p>
                <p className="font-medium">
                  {Math.max(...data.map(d => d.avg_accuracy || 0)).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Study Time:</p>
                <p className="font-medium">
                  {Math.round(data.reduce((sum, d) => sum + (d.total_time_spent || 0), 0) / 1000 / 60)} minutes
                </p>
              </div>
              <div>
                <p className="text-gray-600">Active Days:</p>
                <p className="font-medium">
                  {data.filter(d => d.sessions_played > 0).length}/{data.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}