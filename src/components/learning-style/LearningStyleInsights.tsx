/**
 * Learning Style Insights Component
 * 
 * Enhanced dashboard widget showing personalized recommendations,
 * stability analysis, and actionable insights for users.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  Zap, 
  Users,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import type { LearningProfile } from '@/types/learning-style'

interface LearningStyleInsightsProps {
  profile: LearningProfile
  userId: string
}

interface PersonalizedRecommendations {
  studyMethods: string[]
  practiceTypes: string[]
  difficultyAdjustments: string[]
  timeManagement: string[]
}

interface ProfileStability {
  stabilityScore: number
  confidenceTrend: 'increasing' | 'decreasing' | 'stable'
  recommendsReassessment: boolean
  daysSinceLastAssessment: number
}

export default function LearningStyleInsights({ profile, userId }: LearningStyleInsightsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null)
  const [stability, setStability] = useState<ProfileStability | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadInsights()
  }, [profile, userId])

  const loadInsights = async () => {
    try {
      const { profileService } = await import('@/lib/learning-style/profile-service')
      
      // Load personalized recommendations and stability analysis
      const [recData, stabilityData] = await Promise.all([
        profileService.getPersonalizedRecommendations(userId),
        profileService.analyzeProfileStability(userId)
      ])
      
      setRecommendations(recData)
      setStability(stabilityData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading insights:', error)
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadInsights()
    setRefreshing(false)
  }

  const getStabilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStabilityDescription = (score: number) => {
    if (score >= 0.8) return 'Very Stable'
    if (score >= 0.6) return 'Moderately Stable'
    return 'Needs Attention'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <Target className="h-4 w-4 text-blue-600" />
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Stability & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Learning Insights</h2>
          {stability && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Profile Stability:</span>
              <span className={`font-medium ${getStabilityColor(stability.stabilityScore)}`}>
                {getStabilityDescription(stability.stabilityScore)}
              </span>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Recommended Study Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations?.studyMethods.map((method, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{method}</span>
                </div>
              )) || (
                <div className="text-sm text-gray-500">No specific recommendations available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Practice Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Optimal Practice Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations?.practiceTypes.map((type, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <ChevronRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{type}</span>
                </div>
              )) || (
                <div className="text-sm text-gray-500">No specific recommendations available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Time Management Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations?.timeManagement.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{tip}</span>
                </div>
              )) || (
                <div className="text-sm text-gray-500">No specific recommendations available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Profile Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stability && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confidence Trend</span>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(stability.confidenceTrend)}
                      <span className="text-sm font-medium capitalize">
                        {stability.confidenceTrend}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days Since Assessment</span>
                    <span className="text-sm font-medium">{stability.daysSinceLastAssessment}</span>
                  </div>
                  
                  {stability.recommendsReassessment && (
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Reassessment Recommended</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Consider retaking the assessment to ensure accuracy of your learning profile.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Adjustments */}
      {recommendations?.difficultyAdjustments && recommendations.difficultyAdjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <span>Difficulty & Pace Adjustments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.difficultyAdjustments.map((adjustment, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{adjustment}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Profile Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.overall_confidence}%</div>
              <div className="text-xs text-gray-600">Overall Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{profile.total_questions_analyzed}</div>
              <div className="text-xs text-gray-600">Questions Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(profile.avg_response_time / 1000)}s
              </div>
              <div className="text-xs text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stability ? Math.round(stability.stabilityScore * 100) : 0}%
              </div>
              <div className="text-xs text-gray-600">Profile Stability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}