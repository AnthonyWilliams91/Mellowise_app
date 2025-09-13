/**
 * Learning Style Assessment Dashboard Page
 * 
 * MELLOWISE-009: AI Learning Style Assessment
 * Main page for learning style management and assessment
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Target, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'
import DiagnosticQuiz from '@/components/learning-style/DiagnosticQuiz'
import LearningStyleDisplay from '@/components/learning-style/LearningStyleDisplay'
import type { 
  LearningProfile, 
  LearningStyleAnalysis,
  LearningStyleOverrideRequest
} from '@/types/learning-style'

export default function LearningStylePage() {
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  // Load learning profile using our new service
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Import our profile service
        const { profileService } = await import('@/lib/learning-style/profile-service')
        
        // Get current user ID (placeholder for now)
        const userId = 'user-123' // TODO: Get from auth context
        
        // Load profile using our service
        const profile = await profileService.getProfile(userId)
        
        setProfile(profile)
        setHasProfile(!!profile?.has_completed_diagnostic)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  const handleQuizComplete = async (analysis: LearningStyleAnalysis) => {
    // Reload profile to show updated data using our service
    try {
      const { profileService } = await import('@/lib/learning-style/profile-service')
      const userId = 'user-123' // TODO: Get from auth context
      
      const profile = await profileService.getProfile(userId)
      setProfile(profile)
      setHasProfile(!!profile?.has_completed_diagnostic)
    } catch (err) {
      console.error('Failed to reload profile:', err)
    }
    
    setShowQuiz(false)
  }

  const handleOverrideChange = async (override: LearningStyleOverrideRequest) => {
    try {
      const { profileService } = await import('@/lib/learning-style/profile-service')
      const userId = 'user-123' // TODO: Get from auth context
      
      const updatedProfile = await profileService.updateProfileWithOverride(
        userId,
        override.primary_style,
        override.secondary_style
      )
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      } else {
        throw new Error('Failed to update learning style')
      }
    } catch (err) {
      throw err // Re-throw to be handled by the component
    }
  }

  const handleRetakeQuiz = () => {
    setShowQuiz(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Loading your learning style...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-medium mb-2">Unable to Load Learning Style</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiagnosticQuiz
            onComplete={handleQuizComplete}
            onSkip={() => setShowQuiz(false)}
            existingProfile={profile || undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Style Assessment</h1>
              <p className="text-gray-600 mt-2">
                Discover how you learn best and get personalized study recommendations
              </p>
            </div>
            
            {hasProfile && (
              <button
                onClick={handleRetakeQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Retake Assessment
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {hasProfile && profile ? (
          // Show existing learning style profile
          <LearningStyleDisplay
            profile={profile}
            showDetails={true}
            allowOverride={true}
            onOverrideChange={handleOverrideChange}
          />
        ) : (
          // Show assessment introduction
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-8"
            >
              <div className="text-center mb-6">
                <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Your Learning Style</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Take our AI-powered assessment to understand how you learn best. 
                  Get personalized study recommendations that match your unique learning preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">18 Questions</h3>
                  <p className="text-gray-600 text-sm">Carefully designed LSAT questions that reveal your learning patterns</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-gray-600 text-sm">Advanced algorithms analyze your response patterns and preferences</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Insights</h3>
                  <p className="text-gray-600 text-sm">Get customized study strategies and recommendations</p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-gray-500 text-sm mt-2">Takes about 15-20 minutes</p>
              </div>
            </motion.div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Discover</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    Whether you're more visual or analytical
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    If you prefer fast-paced or methodical approaches
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    Your focus on concepts vs. details
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    Your unique learning style category
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Helps</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    Personalized study recommendations
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    Optimized practice sessions
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    Better understanding of your strengths
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    More effective LSAT preparation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}