/**
 * Topic Performance Component
 * 
 * Shows performance breakdown by question topic (Logical Reasoning, Logic Games, Reading Comprehension)
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Brain, Target, TrendingUp, Clock } from 'lucide-react'

interface TopicPerformanceProps {
  data: Array<{
    topic_type: string
    total_questions: number
    correct_answers: number
    current_accuracy: number
    current_difficulty: number
    max_difficulty_reached: number
    avg_response_time: number
    recent_accuracy: number
    improvement_rate: number
    last_practiced_at: string
  }>
}

export function TopicPerformance({ data }: TopicPerformanceProps) {
  const getTopicName = (type: string) => {
    switch (type) {
      case 'logical_reasoning':
        return 'Logical Reasoning'
      case 'logic_games':
        return 'Logic Games'
      case 'reading_comprehension':
        return 'Reading Comprehension'
      default:
        return type
    }
  }

  const getTopicIcon = (type: string) => {
    switch (type) {
      case 'logical_reasoning':
        return Brain
      case 'logic_games':
        return Target
      case 'reading_comprehension':
        return Brain
      default:
        return Brain
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTime = (ms: number) => {
    if (!ms) return 'N/A'
    const seconds = Math.round(ms / 1000)
    return `${seconds}s`
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topic Performance</CardTitle>
          <CardDescription>Performance breakdown by question type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No topic performance data yet</p>
            <p className="text-sm text-gray-500">Start practicing to see your progress by topic</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Topic Performance</CardTitle>
          <CardDescription>Your progress across different question types</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((topic, index) => {
          const Icon = getTopicIcon(topic.topic_type)
          const accuracy = Math.round(topic.current_accuracy * 100) / 100
          const recentAccuracy = Math.round(topic.recent_accuracy * 100) / 100
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{getTopicName(topic.topic_type)}</span>
                  </CardTitle>
                  <Badge 
                    className={`${
                      accuracy >= 80 ? 'bg-green-100 text-green-800' :
                      accuracy >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {accuracy.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Accuracy</span>
                    <span className={getAccuracyColor(accuracy)}>
                      {topic.correct_answers}/{topic.total_questions}
                    </span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                
                {/* Recent Performance */}
                {recentAccuracy > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recent Accuracy</span>
                      <span className={getAccuracyColor(recentAccuracy)}>
                        {recentAccuracy.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={recentAccuracy} className="h-2" />
                    
                    {/* Trend indicator */}
                    <div className="flex items-center justify-center text-xs">
                      {recentAccuracy > accuracy ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Improving
                        </div>
                      ) : recentAccuracy < accuracy ? (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Declining
                        </div>
                      ) : (
                        <div className="text-gray-500">Stable</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Difficulty Level</p>
                    <p className="font-medium">
                      {topic.current_difficulty?.toFixed(1) || '1.0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Max Reached</p>
                    <p className="font-medium">
                      {topic.max_difficulty_reached?.toFixed(1) || '1.0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Response</p>
                    <p className="font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(topic.avg_response_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Questions</p>
                    <p className="font-medium">{topic.total_questions}</p>
                  </div>
                </div>
                
                {/* Last Practiced */}
                {topic.last_practiced_at && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Last practiced: {new Date(topic.last_practiced_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}