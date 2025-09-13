/**
 * Learning Style Override Management Component
 * 
 * Enhanced interface for manual learning style overrides with detailed
 * comparison, reasoning capture, and reversion capabilities.
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-009
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Edit3, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Brain,
  ArrowRight,
  Info,
  History,
  Users,
  TrendingUp
} from 'lucide-react'
import type { 
  LearningProfile,
  LearningStyleKey,
  LearningStyleRefinement,
  LEARNING_STYLE_CATEGORIES
} from '@/types/learning-style'

interface LearningStyleOverrideProps {
  profile: LearningProfile
  userId: string
  onUpdate: (profile: LearningProfile) => void
}

interface OverrideComparison {
  current: {
    primary: LearningStyleKey
    secondary: LearningStyleKey | null
    isOverridden: boolean
  }
  proposed: {
    primary: LearningStyleKey
    secondary: LearningStyleKey | null
  }
}

export default function LearningStyleOverride({ 
  profile, 
  userId, 
  onUpdate 
}: LearningStyleOverrideProps) {
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [refinementHistory, setRefinementHistory] = useState<LearningStyleRefinement[]>([])
  const [updating, setUpdating] = useState(false)
  const [comparison, setComparison] = useState<OverrideComparison | null>(null)

  const currentPrimary = (profile.manual_override_enabled 
    ? profile.manual_primary_style 
    : profile.primary_learning_style) as LearningStyleKey

  const currentSecondary = (profile.manual_override_enabled 
    ? profile.manual_secondary_style 
    : profile.secondary_learning_style) as LearningStyleKey | null

  const aiDeterminedPrimary = profile.primary_learning_style as LearningStyleKey
  const aiDeterminedSecondary = profile.secondary_learning_style as LearningStyleKey | null

  useEffect(() => {
    if (showHistoryModal) {
      loadRefinementHistory()
    }
  }, [showHistoryModal])

  const loadRefinementHistory = async () => {
    try {
      const { profileService } = await import('@/lib/learning-style/profile-service')
      const history = await profileService.getRefinementHistory(userId, 10)
      setRefinementHistory(history)
    } catch (error) {
      console.error('Error loading refinement history:', error)
    }
  }

  const handleOverrideStart = () => {
    setComparison({
      current: {
        primary: currentPrimary,
        secondary: currentSecondary,
        isOverridden: profile.manual_override_enabled
      },
      proposed: {
        primary: currentPrimary,
        secondary: currentSecondary
      }
    })
    setShowOverrideModal(true)
  }

  const handleOverrideStyleChange = (type: 'primary' | 'secondary', value: LearningStyleKey | null) => {
    if (!comparison) return

    setComparison(prev => ({
      ...prev!,
      proposed: {
        ...prev!.proposed,
        [type]: value
      }
    }))
  }

  const handleOverrideSubmit = async () => {
    if (!comparison || !comparison.proposed.primary) return

    setUpdating(true)
    try {
      const { profileService } = await import('@/lib/learning-style/profile-service')
      
      const updatedProfile = await profileService.updateProfileWithOverride(
        userId,
        comparison.proposed.primary,
        comparison.proposed.secondary || undefined
      )

      if (updatedProfile) {
        onUpdate(updatedProfile)
        setShowOverrideModal(false)
        setOverrideReason('')
      }

    } catch (error) {
      console.error('Error applying override:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveOverride = async () => {
    setUpdating(true)
    try {
      const { profileService } = await import('@/lib/learning-style/profile-service')
      
      const updatedProfile = await profileService.removeManualOverride(userId)

      if (updatedProfile) {
        onUpdate(updatedProfile)
      }

    } catch (error) {
      console.error('Error removing override:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStyleInfo = (styleKey: LearningStyleKey | null) => {
    if (!styleKey) return null
    return (LEARNING_STYLE_CATEGORIES as any)[styleKey]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Override Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Learning Style Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowHistoryModal(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  Current: {getStyleInfo(currentPrimary)?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {profile.manual_override_enabled ? (
                    <span className="flex items-center space-x-1">
                      <Edit3 className="h-3 w-3" />
                      <span>Manually customized</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Brain className="h-3 w-3" />
                      <span>AI determined ({profile.overall_confidence}% confidence)</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {profile.manual_override_enabled && (
                  <Button
                    onClick={handleRemoveOverride}
                    disabled={updating}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Revert to AI</span>
                  </Button>
                )}
                
                <Button
                  onClick={handleOverrideStart}
                  disabled={updating}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Customize</span>
                </Button>
              </div>
            </div>

            {/* AI vs Manual Comparison */}
            {profile.manual_override_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">AI Analysis</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    {getStyleInfo(aiDeterminedPrimary)?.name}
                    {aiDeterminedSecondary && (
                      <div className="mt-1 text-xs">
                        Secondary: {getStyleInfo(aiDeterminedSecondary)?.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit3 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Your Choice</span>
                  </div>
                  <div className="text-sm text-green-800">
                    {getStyleInfo(currentPrimary)?.name}
                    {currentSecondary && (
                      <div className="mt-1 text-xs">
                        Secondary: {getStyleInfo(currentSecondary)?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Override Info */}
            <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About Manual Override</p>
                <p>
                  You can customize your learning style if you feel the AI analysis doesn't match your 
                  preferences. Your override will be used for all personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Override Modal */}
      <AnimatePresence>
        {showOverrideModal && comparison && (
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
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Customize Learning Style</h3>
              
              {/* Current vs Proposed Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    {comparison.current.isOverridden ? <Edit3 className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                    <span>Current Style</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Primary:</span> {getStyleInfo(comparison.current.primary)?.name}
                    </div>
                    {comparison.current.secondary && (
                      <div className="text-sm">
                        <span className="font-medium">Secondary:</span> {getStyleInfo(comparison.current.secondary)?.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">New Style</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Primary:</span> {getStyleInfo(comparison.proposed.primary)?.name}
                    </div>
                    {comparison.proposed.secondary && (
                      <div className="text-sm">
                        <span className="font-medium">Secondary:</span> {getStyleInfo(comparison.proposed.secondary)?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Learning Style
                  </label>
                  <select
                    value={comparison.proposed.primary}
                    onChange={(e) => handleOverrideStyleChange('primary', e.target.value as LearningStyleKey)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(LEARNING_STYLE_CATEGORIES as any).map(([key, info]: [string, any]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Learning Style (Optional)
                  </label>
                  <select
                    value={comparison.proposed.secondary || ''}
                    onChange={(e) => handleOverrideStyleChange('secondary', e.target.value as LearningStyleKey || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {Object.entries(LEARNING_STYLE_CATEGORIES as any)
                      .filter(([key]) => key !== comparison.proposed.primary)
                      .map(([key, info]: [string, any]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Override (Optional)
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Why do you think this style better represents how you learn?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                </div>
              </div>

              {/* Style Info Preview */}
              {comparison.proposed.primary && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Style Preview</h4>
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">{getStyleInfo(comparison.proposed.primary)?.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Strengths:</span>
                        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                          {getStyleInfo(comparison.proposed.primary)?.strengths.map((strength: string, index: number) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium">Recommendations:</span>
                        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                          {getStyleInfo(comparison.proposed.primary)?.recommendations.slice(0, 3).map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowOverrideModal(false)}
                  disabled={updating}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOverrideSubmit}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? 'Applying...' : 'Apply Override'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Style History</h3>
              
              {refinementHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No refinement history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {refinementHistory.map((refinement) => (
                    <div key={refinement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">
                          {refinement.trigger_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(refinement.created_at)}
                        </span>
                      </div>
                      
                      {refinement.analysis_notes && (
                        <p className="text-sm text-gray-700 mb-2">{refinement.analysis_notes}</p>
                      )}
                      
                      {refinement.significant_change && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-amber-700">Significant change</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}