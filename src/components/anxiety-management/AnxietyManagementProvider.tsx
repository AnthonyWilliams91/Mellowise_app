/**
 * Anxiety Management Provider
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * React context provider that integrates anxiety management throughout the application.
 * Provides real-time monitoring, intervention triggers, and comprehensive support.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useUser } from '@/lib/auth/auth-context'
import { anxietyManagementOrchestrator } from '@/lib/anxiety-management/anxiety-management-orchestrator'
import type {
  AnxietyLevel,
  AnxietyDetectionResult,
  ConfidenceMetrics,
  AnxietyIntervention,
  BreathingExercise,
  AnxietyManagementResponse,
  AnxietyManagementContext,
  InterventionTrigger
} from '@/types/anxiety-management'

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

interface AnxietyManagementState {
  // Current state
  currentAnxietyLevel: AnxietyLevel
  confidenceLevel: string
  isMonitoring: boolean

  // Latest detection and metrics
  latestDetection?: AnxietyDetectionResult
  confidenceMetrics?: ConfidenceMetrics
  activeIntervention?: AnxietyIntervention

  // Quick actions
  recommendedBreathingExercises: BreathingExercise[]
  shouldShowQuickCalm: boolean
  shouldReduceDifficulty: boolean

  // Dashboard data
  dashboardData?: any
}

interface AnxietyManagementActions {
  // Manual triggers
  triggerAnxietyCheck: (recentPerformance: any[]) => Promise<AnxietyManagementResponse>
  triggerIntervention: (trigger: string, context?: any) => Promise<void>

  // Session monitoring
  startSessionMonitoring: (sessionData: any) => void
  updateSessionProgress: (performanceUpdate: any) => void
  endSessionMonitoring: (finalSessionData: any) => void

  // Mindfulness actions
  startBreathingExercise: (exerciseId: string) => void
  completeBreathingExercise: (sessionData: any) => void

  // Settings and preferences
  updateAnxietySettings: (settings: any) => Promise<void>
  dismissIntervention: (interventionId: string) => void

  // Quick actions
  showQuickCalm: () => void
  hideQuickCalm: () => void

  // Dashboard
  refreshDashboard: () => Promise<void>
}

type AnxietyManagementContextType = AnxietyManagementState & AnxietyManagementActions

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AnxietyManagementContext = createContext<AnxietyManagementContextType | undefined>(undefined)

export const useAnxietyManagement = () => {
  const context = useContext(AnxietyManagementContext)
  if (context === undefined) {
    throw new Error('useAnxietyManagement must be used within an AnxietyManagementProvider')
  }
  return context
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AnxietyManagementProviderProps {
  children: ReactNode
  enableBackgroundMonitoring?: boolean
  checkInterval?: number
}

export const AnxietyManagementProvider: React.FC<AnxietyManagementProviderProps> = ({
  children,
  enableBackgroundMonitoring = true,
  checkInterval = 5 * 60 * 1000 // 5 minutes
}) => {
  const { user } = useUser()

  // State management
  const [state, setState] = useState<AnxietyManagementState>({
    currentAnxietyLevel: 'low',
    confidenceLevel: 'moderate',
    isMonitoring: false,
    recommendedBreathingExercises: [],
    shouldShowQuickCalm: false,
    shouldReduceDifficulty: false
  })

  const [currentSessionData, setCurrentSessionData] = useState<any>(null)
  const [backgroundInterval, setBackgroundInterval] = useState<NodeJS.Timeout | null>(null)

  // ============================================================================
  // API HELPERS
  // ============================================================================

  const callAnxietyAPI = useCallback(async (endpoint: string, method: string = 'GET', data?: any) => {
    try {
      const response = await fetch(`/api/anxiety-management/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error calling anxiety management API (${endpoint}):`, error)
      throw error
    }
  }, [])

  // ============================================================================
  // CORE ACTIONS
  // ============================================================================

  const triggerAnxietyCheck = useCallback(async (recentPerformance: any[]): Promise<AnxietyManagementResponse> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await callAnxietyAPI('detect', 'POST', {
        recentPerformance,
        context: currentSessionData
      })

      // Update state with detection results
      setState(prev => ({
        ...prev,
        currentAnxietyLevel: response.detection.anxiety_level,
        latestDetection: response.detection,
        activeIntervention: response.intervention,
        shouldShowQuickCalm: response.detection.anxiety_level !== 'low'
      }))

      // Get mindfulness recommendations if needed
      if (response.detection.anxiety_level !== 'low') {
        const mindfulnessResponse = await callAnxietyAPI(
          `mindfulness?action=recommendations&anxietyLevel=${response.detection.anxiety_level}&timeAvailable=300`
        )

        setState(prev => ({
          ...prev,
          recommendedBreathingExercises: mindfulnessResponse.breathing_exercises || []
        }))
      }

      return {
        anxietyDetection: response.detection,
        intervention: response.intervention,
        recommendations: response.recommendations,
        shouldPauseSession: response.detection.anxiety_level === 'severe',
        shouldReduceDifficulty: response.detection.anxiety_level !== 'low',
        shouldShowEncouragement: true
      }

    } catch (error) {
      console.error('Error triggering anxiety check:', error)
      throw error
    }
  }, [user, currentSessionData, callAnxietyAPI])

  const triggerIntervention = useCallback(async (trigger: string, context?: any) => {
    if (!user) return

    try {
      const response = await callAnxietyAPI('dashboard', 'POST', {
        action: 'trigger_intervention',
        data: { trigger, context }
      })

      setState(prev => ({
        ...prev,
        activeIntervention: response.intervention
      }))

    } catch (error) {
      console.error('Error triggering intervention:', error)
    }
  }, [user, callAnxietyAPI])

  // ============================================================================
  // SESSION MONITORING
  // ============================================================================

  const startSessionMonitoring = useCallback((sessionData: any) => {
    setCurrentSessionData(sessionData)
    setState(prev => ({ ...prev, isMonitoring: true }))

    // Start background monitoring if enabled
    if (enableBackgroundMonitoring && !backgroundInterval) {
      const interval = setInterval(async () => {
        try {
          // Get recent performance data and check for triggers
          // This would typically integrate with your existing session tracking
          console.log('Background anxiety monitoring check...')
        } catch (error) {
          console.error('Background monitoring error:', error)
        }
      }, checkInterval)

      setBackgroundInterval(interval)
    }
  }, [enableBackgroundMonitoring, checkInterval, backgroundInterval])

  const updateSessionProgress = useCallback(async (performanceUpdate: any) => {
    if (!state.isMonitoring || !user) return

    try {
      // Monitor for immediate triggers
      const response = await anxietyManagementOrchestrator.monitorSession(
        user.id,
        currentSessionData,
        performanceUpdate
      )

      if (response) {
        setState(prev => ({
          ...prev,
          currentAnxietyLevel: response.anxietyDetection?.anxiety_level || prev.currentAnxietyLevel,
          latestDetection: response.anxietyDetection,
          activeIntervention: response.intervention,
          shouldShowQuickCalm: response.shouldPauseSession || response.anxietyDetection?.anxiety_level !== 'low',
          shouldReduceDifficulty: response.shouldReduceDifficulty
        }))
      }

    } catch (error) {
      console.error('Error updating session progress:', error)
    }
  }, [state.isMonitoring, user, currentSessionData])

  const endSessionMonitoring = useCallback(async (finalSessionData: any) => {
    if (!user) return

    try {
      // Update progress and stop monitoring
      await anxietyManagementOrchestrator.updateProgress(
        user.id,
        finalSessionData,
        state.latestDetection?.anxiety_level,
        'low' // Assume calm after session end
      )

      setState(prev => ({ ...prev, isMonitoring: false }))
      setCurrentSessionData(null)

      // Clear background monitoring
      if (backgroundInterval) {
        clearInterval(backgroundInterval)
        setBackgroundInterval(null)
      }

    } catch (error) {
      console.error('Error ending session monitoring:', error)
    }
  }, [user, state.latestDetection, backgroundInterval])

  // ============================================================================
  // MINDFULNESS ACTIONS
  // ============================================================================

  const startBreathingExercise = useCallback((exerciseId: string) => {
    // This would typically open a breathing exercise modal
    console.log('Starting breathing exercise:', exerciseId)
  }, [])

  const completeBreathingExercise = useCallback(async (sessionData: any) => {
    if (!user) return

    try {
      await callAnxietyAPI('mindfulness', 'POST', {
        action: 'track_session',
        data: sessionData
      })

      // Update state to reflect calmer anxiety level
      setState(prev => ({
        ...prev,
        currentAnxietyLevel: 'low',
        shouldShowQuickCalm: false
      }))

    } catch (error) {
      console.error('Error completing breathing exercise:', error)
    }
  }, [user, callAnxietyAPI])

  // ============================================================================
  // SETTINGS AND PREFERENCES
  // ============================================================================

  const updateAnxietySettings = useCallback(async (settings: any) => {
    if (!user) return

    try {
      await callAnxietyAPI('dashboard', 'POST', {
        action: 'update_settings',
        data: { settings }
      })

    } catch (error) {
      console.error('Error updating anxiety settings:', error)
    }
  }, [user, callAnxietyAPI])

  const dismissIntervention = useCallback((interventionId: string) => {
    setState(prev => ({
      ...prev,
      activeIntervention: prev.activeIntervention?.id === interventionId ? undefined : prev.activeIntervention
    }))
  }, [])

  // ============================================================================
  // QUICK ACTIONS
  // ============================================================================

  const showQuickCalm = useCallback(() => {
    setState(prev => ({ ...prev, shouldShowQuickCalm: true }))
  }, [])

  const hideQuickCalm = useCallback(() => {
    setState(prev => ({ ...prev, shouldShowQuickCalm: false }))
  }, [])

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  const refreshDashboard = useCallback(async () => {
    if (!user) return

    try {
      const response = await callAnxietyAPI('dashboard')
      setState(prev => ({
        ...prev,
        dashboardData: response.dashboard,
        currentAnxietyLevel: response.dashboard.current_status?.anxiety_level || prev.currentAnxietyLevel,
        confidenceLevel: response.dashboard.current_status?.confidence_level || prev.confidenceLevel
      }))

    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    }
  }, [user, callAnxietyAPI])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial data load
  useEffect(() => {
    if (user) {
      refreshDashboard()
    }
  }, [user, refreshDashboard])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundInterval) {
        clearInterval(backgroundInterval)
      }
    }
  }, [backgroundInterval])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AnxietyManagementContextType = {
    // State
    ...state,

    // Actions
    triggerAnxietyCheck,
    triggerIntervention,
    startSessionMonitoring,
    updateSessionProgress,
    endSessionMonitoring,
    startBreathingExercise,
    completeBreathingExercise,
    updateAnxietySettings,
    dismissIntervention,
    showQuickCalm,
    hideQuickCalm,
    refreshDashboard
  }

  return (
    <AnxietyManagementContext.Provider value={contextValue}>
      {children}
    </AnxietyManagementContext.Provider>
  )
}

export default AnxietyManagementProvider