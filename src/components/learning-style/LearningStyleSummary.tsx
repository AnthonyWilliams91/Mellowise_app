/**
 * Learning Style Summary Component
 * 
 * MELLOWISE-009: Compact display for dashboard integration
 * Shows learning style with link to full assessment
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, ArrowRight, AlertCircle } from 'lucide-react'
import type { LearningProfile, LEARNING_STYLE_CATEGORIES } from '@/types/learning-style'

export default function LearningStyleSummary() {
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/learning-style/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
        }
      } catch (error) {
        console.error('Failed to load learning style profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!profile || !profile.has_completed_diagnostic) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Discover Your Learning Style</h3>
            <p className="text-blue-700 text-sm mb-4">
              Take our AI-powered assessment to get personalized study recommendations.
            </p>
            <Link 
              href="/dashboard/learning-style"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Start Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get the display style (manual override or AI-determined)
  const displayedStyle = profile.manual_override_enabled 
    ? profile.manual_primary_style 
    : profile.primary_learning_style

  const styleInfo = displayedStyle ? (LEARNING_STYLE_CATEGORIES as any)[displayedStyle] : null

  if (!styleInfo) {
    return (
      <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-yellow-800 font-medium">Learning Style Analysis Incomplete</h3>
            <p className="text-yellow-700 text-sm">There was an issue with your learning style analysis.</p>
          </div>
        </div>
      </div>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{styleInfo.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{styleInfo.name}</h3>
            <p className="text-gray-600 text-sm">{styleInfo.description}</p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(profile.overall_confidence)}`}>
          {profile.overall_confidence}% confident
        </div>
      </div>

      {profile.manual_override_enabled && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800 text-xs font-medium">Manually customized</span>
        </div>
      )}

      {/* Quick recommendations */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Strengths:</h4>
        <div className="flex flex-wrap gap-2">
          {styleInfo.strengths.slice(0, 2).map((strength: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              {strength}
            </span>
          ))}
        </div>
      </div>

      <Link 
        href="/dashboard/learning-style"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View detailed analysis
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}