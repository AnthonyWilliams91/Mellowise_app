/**
 * Learning Style Display Component
 * 
 * MELLOWISE-009: AI Learning Style Assessment
 * Shows user's learning style with details and override options
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  Edit3,
  RotateCcw
} from 'lucide-react'
import type { 
  LearningStyleDisplayProps,
  LearningStyleKey,
  LEARNING_STYLE_CATEGORIES,
  LearningStyleOverrideRequest
} from '@/types/learning-style'

export default function LearningStyleDisplay({ 
  profile, 
  showDetails = true, 
  allowOverride = false,
  onOverrideChange 
}: LearningStyleDisplayProps) {
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [overrideData, setOverrideData] = useState<LearningStyleOverrideRequest>({
    primary_style: (profile.manual_override_enabled 
      ? profile.manual_primary_style 
      : profile.primary_learning_style) as LearningStyleKey || 'analytical-methodical-detail'
  })
  const [updating, setUpdating] = useState(false)

  // Determine which learning style to display
  const displayedPrimaryStyle = profile.manual_override_enabled 
    ? profile.manual_primary_style 
    : profile.primary_learning_style
  
  const displayedSecondaryStyle = profile.manual_override_enabled 
    ? profile.manual_secondary_style 
    : profile.secondary_learning_style

  const primaryStyleInfo = displayedPrimaryStyle 
    ? (LEARNING_STYLE_CATEGORIES as any)[displayedPrimaryStyle]
    : null
  
  const secondaryStyleInfo = displayedSecondaryStyle 
    ? (LEARNING_STYLE_CATEGORIES as any)[displayedSecondaryStyle]
    : null

  // Calculate overall confidence level
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { label: 'High', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (confidence >= 60) return { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { label: 'Low', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const confidenceInfo = getConfidenceLevel(profile.overall_confidence)

  const handleOverrideSubmit = async () => {
    if (!onOverrideChange) return
    
    setUpdating(true)
    try {
      await onOverrideChange(overrideData)
      setShowOverrideModal(false)
    } catch (error) {
      console.error('Failed to update learning style:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveOverride = async () => {
    if (!onOverrideChange) return
    
    setUpdating(true)
    try {
      // Send DELETE request to remove override
      await fetch('/api/learning-style/profile', { method: 'DELETE' })
      // Trigger refresh
      window.location.reload()
    } catch (error) {
      console.error('Failed to remove override:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (!primaryStyleInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-yellow-800 font-medium">Learning Style Analysis Pending</h3>
            <p className="text-yellow-700 text-sm">Complete the diagnostic quiz to discover your learning style.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Learning Style Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{primaryStyleInfo.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{primaryStyleInfo.name}</h3>
              <p className="text-gray-600">{primaryStyleInfo.description}</p>
            </div>
          </div>
          
          {/* Confidence badge */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceInfo.bgColor} ${confidenceInfo.color}`}>
            {confidenceInfo.label} Confidence
          </div>
        </div>

        {/* Manual override indicator */}
        {profile.manual_override_enabled && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 text-sm">Manually customized</span>
            {allowOverride && (
              <button
                onClick={handleRemoveOverride}
                disabled={updating}
                className="ml-auto text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Revert to AI Analysis
              </button>
            )}
          </div>
        )}

        {/* Secondary style */}
        {secondaryStyleInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{secondaryStyleInfo.icon}</span>
              <span className="font-medium text-gray-800">Secondary: {secondaryStyleInfo.name}</span>
            </div>
            <p className="text-gray-600 text-sm">{secondaryStyleInfo.description}</p>
          </div>
        )}

        {/* Action buttons */}
        {allowOverride && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowOverrideModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Customize Style
            </button>
          </div>
        )}
      </div>

      {/* Detailed Analysis */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Your Strengths</h4>
            </div>
            <ul className="space-y-2">
              {primaryStyleInfo.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <h4 className="text-lg font-semibold text-gray-900">Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {primaryStyleInfo.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Dimensions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Learning Dimensions</h4>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Visual ← → Analytical</span>
                  <span className="font-medium">
                    {profile.visual_analytical_score < 0.5 ? 'Visual' : 'Analytical'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${profile.visual_analytical_score * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fast-paced ← → Methodical</span>
                  <span className="font-medium">
                    {profile.fast_methodical_score < 0.5 ? 'Fast-paced' : 'Methodical'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${profile.fast_methodical_score * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conceptual ← → Detail-oriented</span>
                  <span className="font-medium">
                    {profile.conceptual_detail_score < 0.5 ? 'Conceptual' : 'Detail-oriented'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${profile.conceptual_detail_score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Statistics */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h4 className="text-lg font-semibold text-gray-900">Analysis Data</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.total_questions_analyzed}</div>
                <div className="text-sm text-gray-600">Questions Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(profile.avg_response_time / 1000)}s
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Last updated: {new Date(profile.last_analyzed_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Override Modal */}
      <AnimatePresence>
        {showOverrideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowOverrideModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customize Learning Style</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Learning Style
                </label>
                <select
                  value={overrideData.primary_style}
                  onChange={(e) => setOverrideData(prev => ({
                    ...prev,
                    primary_style: e.target.value as LearningStyleKey
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(LEARNING_STYLE_CATEGORIES as any).map(([key, info]: [string, any]) => (
                    <option key={key} value={key}>
                      {info.icon} {info.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Learning Style (Optional)
                </label>
                <select
                  value={overrideData.secondary_style || ''}
                  onChange={(e) => setOverrideData(prev => ({
                    ...prev,
                    secondary_style: e.target.value as LearningStyleKey || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {Object.entries(LEARNING_STYLE_CATEGORIES as any)
                    .filter(([key]) => key !== overrideData.primary_style)
                    .map(([key, info]: [string, any]) => (
                    <option key={key} value={key}>
                      {info.icon} {info.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverrideSubmit}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}