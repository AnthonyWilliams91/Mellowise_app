/**
 * Streak Display Component
 * 
 * Shows user streak information with visual indicators and motivation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Flame, 
  Calendar, 
  Zap, 
  Target,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface StreakDisplayProps {
  data: {
    current_daily_streak: number
    current_session_streak: number
    best_daily_streak: number
    best_session_streak: number
    best_accuracy_streak: number
    current_daily_streak_start: string | null
    last_activity_date: string | null
    milestones_achieved: string[]
  }
}

interface StreakHealth {
  status: 'healthy' | 'at_risk' | 'broken'
  daysUntilBreak: number | null
  momentum: 'growing' | 'stable' | 'declining'
  notifications: Array<{
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
    priority: 'high' | 'medium' | 'low'
  }>
}

export function StreakDisplay({ data }: StreakDisplayProps) {
  const [streakHealth, setStreakHealth] = useState<StreakHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreakHealth()
  }, [])

  const fetchStreakHealth = async () => {
    try {
      const response = await fetch('/api/analytics/streaks')
      if (response.ok) {
        const streakData = await response.json()
        setStreakHealth(streakData.streakHealth)
      }
    } catch (error) {
      console.error('Failed to fetch streak health:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStreakColor = (streak: number, isDaily: boolean = true) => {
    if (isDaily) {
      if (streak >= 30) return 'text-purple-600'
      if (streak >= 14) return 'text-blue-600'
      if (streak >= 7) return 'text-green-600'
      if (streak >= 3) return 'text-yellow-600'
    } else {
      if (streak >= 50) return 'text-purple-600'
      if (streak >= 20) return 'text-blue-600'
      if (streak >= 10) return 'text-green-600'
      if (streak >= 5) return 'text-yellow-600'
    }
    return 'text-gray-600'
  }

  const getStreakIcon = (streak: number, isDaily: boolean = true) => {
    if (isDaily) {
      if (streak >= 30) return '🔥'
      if (streak >= 14) return '⚡'
      if (streak >= 7) return '💪'
      if (streak >= 3) return '✨'
    } else {
      if (streak >= 50) return '🏆'
      if (streak >= 20) return '🎯'
      if (streak >= 10) return '⭐'
      if (streak >= 5) return '👍'
    }
    return '📈'
  }

  const getStatusBadge = () => {
    if (!streakHealth) return null

    switch (streakHealth.status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'at_risk':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            At Risk
          </Badge>
        )
      case 'broken':
        return (
          <Badge className="bg-red-100 text-red-800">
            <Clock className="w-3 h-3 mr-1" />
            Broken
          </Badge>
        )
      default:
        return null
    }
  }

  const getNextMilestone = (current: number, isDaily: boolean = true) => {
    const milestones = isDaily 
      ? [3, 7, 14, 30, 60, 100]
      : [5, 10, 20, 50, 100]
    
    return milestones.find(m => m > current) || null
  }

  const calculateProgress = (current: number, isDaily: boolean = true) => {
    const next = getNextMilestone(current, isDaily)
    if (!next) return 100
    
    const previous = isDaily 
      ? [0, 3, 7, 14, 30, 60][milestones.findIndex(m => m === next)] || 0
      : [0, 5, 10, 20, 50][milestones.findIndex(m => m === next)] || 0
    
    return ((current - previous) / (next - previous)) * 100
  }

  const milestones = [3, 7, 14, 30, 60, 100]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="w-5 h-5" />
            <span>Study Streaks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span>Study Streaks</span>
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Keep your momentum going with consistent practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Streak */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Daily Streak</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getStreakColor(data.current_daily_streak, true)}`}>
                {getStreakIcon(data.current_daily_streak, true)} {data.current_daily_streak} days
              </div>
              <div className="text-xs text-gray-500">
                Best: {data.best_daily_streak} days
              </div>
            </div>
          </div>
          
          {/* Progress to next milestone */}
          {(() => {
            const nextMilestone = getNextMilestone(data.current_daily_streak, true)
            const progress = calculateProgress(data.current_daily_streak, true)
            
            return nextMilestone ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{data.current_daily_streak} days</span>
                  <span>{nextMilestone} days</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {nextMilestone - data.current_daily_streak} more days to reach {nextMilestone}-day milestone
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Badge className="bg-purple-100 text-purple-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  Milestone Master!
                </Badge>
              </div>
            )
          })()}
        </div>

        {/* Session Streak */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="font-medium">Session Streak</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getStreakColor(data.current_session_streak, false)}`}>
                {getStreakIcon(data.current_session_streak, false)} {data.current_session_streak} correct
              </div>
              <div className="text-xs text-gray-500">
                Best: {data.best_session_streak} correct
              </div>
            </div>
          </div>
          
          {/* Progress to next milestone */}
          {(() => {
            const nextMilestone = getNextMilestone(data.current_session_streak, false)
            const progress = calculateProgress(data.current_session_streak, false)
            
            return nextMilestone ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{data.current_session_streak} correct</span>
                  <span>{nextMilestone} correct</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {nextMilestone - data.current_session_streak} more correct to reach {nextMilestone} streak
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Badge className="bg-purple-100 text-purple-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  Perfect Streak!
                </Badge>
              </div>
            )
          })()}
        </div>

        {/* Notifications */}
        {streakHealth?.notifications && streakHealth.notifications.length > 0 && (
          <div className="space-y-2">
            {streakHealth.notifications.slice(0, 2).map((notification, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg text-sm ${
                  notification.type === 'success' ? 'bg-green-50 text-green-800' :
                  notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  'bg-blue-50 text-blue-800'
                }`}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-xs opacity-90">{notification.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Milestones Achieved */}
        {data.milestones_achieved && data.milestones_achieved.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Milestones</h4>
            <div className="flex flex-wrap gap-1">
              {data.milestones_achieved.slice(-6).map((milestone, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  {milestone.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}