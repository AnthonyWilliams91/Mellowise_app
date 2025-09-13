/**
 * Session History Component
 * 
 * Displays recent game sessions with performance details
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  Trophy,
  Play,
  ExternalLink
} from 'lucide-react'

interface SessionHistoryProps {
  data: Array<{
    id: string
    session_id: string
    total_time_spent: number
    accuracy_percentage: number
    streak_count: number
    max_streak: number
    created_at: string
    game_sessions: {
      id: string
      session_type: string
      started_at: string
      ended_at: string
      final_score: number
      questions_answered: number
      correct_answers: number
      lives_remaining: number
      difficulty_level: number
    }
  }>
}

export function SessionHistory({ data }: SessionHistoryProps) {
  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 1000 / 60)
    const seconds = Math.floor((milliseconds / 1000) % 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'survival_mode':
        return Zap
      case 'practice':
        return Target
      case 'test':
        return Trophy
      default:
        return Play
    }
  }

  const getSessionTypeName = (type: string) => {
    switch (type) {
      case 'survival_mode':
        return 'Survival Mode'
      case 'practice':
        return 'Practice'
      case 'test':
        return 'Test'
      default:
        return type
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your latest practice sessions and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Play className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No sessions yet</p>
            <p className="text-sm text-gray-500">Start practicing to see your session history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sessions</CardTitle>
        <CardDescription>
          Your latest {data.length} practice sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((session, index) => {
            const Icon = getSessionTypeIcon(session.game_sessions.session_type)
            const accuracy = Math.round(session.accuracy_percentage * 100) / 100
            
            return (
              <div 
                key={session.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Session Type Icon */}
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  
                  {/* Session Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {getSessionTypeName(session.game_sessions.session_type)}
                      </h4>
                      <Badge className={getAccuracyBadgeColor(accuracy)}>
                        {accuracy.toFixed(0)}%
                      </Badge>
                      {session.game_sessions.session_type === 'survival_mode' && (
                        <Badge variant="outline">
                          Level {session.game_sessions.difficulty_level}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(session.total_time_spent)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{session.game_sessions.correct_answers}/{session.game_sessions.questions_answered}</span>
                      </div>
                      {session.max_streak > 0 && (
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{session.max_streak} streak</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Session Score & Actions */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {session.game_sessions.final_score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Load More Button */}
        <div className="flex justify-center pt-4 border-t mt-6">
          <Button variant="outline" size="sm">
            View All Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}