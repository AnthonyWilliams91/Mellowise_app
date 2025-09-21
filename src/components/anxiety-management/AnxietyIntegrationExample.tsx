/**
 * Anxiety Management Integration Example
 * MELLOWISE-014: Adaptive Anxiety Management System
 *
 * Example component demonstrating how the anxiety management system
 * integrates with existing Epic 2 AI systems for comprehensive support.
 *
 * @author UX Expert Elena & Dev Agent Marcus
 * @version 1.0
 * @epic Epic 2 - AI & Personalization Features
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnxietyIndicator } from './AnxietyIndicator'
import { BreathingExerciseComponent } from './BreathingExercise'
import { ConfidenceDashboard } from './ConfidenceDashboard'
import { useAnxietyManagement } from './AnxietyManagementProvider'
import { AlertTriangle, Brain, Heart, TrendingUp } from 'lucide-react'

// ============================================================================
// MOCK DATA FOR DEMONSTRATION
// ============================================================================

const mockPerformanceData = [
  { id: '1', accuracy_percentage: 45, streak_count: 0, created_at: new Date().toISOString(), average_response_time: 45 },
  { id: '2', accuracy_percentage: 52, streak_count: 1, created_at: new Date().toISOString(), average_response_time: 38 },
  { id: '3', accuracy_percentage: 38, streak_count: 0, created_at: new Date().toISOString(), average_response_time: 52 },
  { id: '4', accuracy_percentage: 41, streak_count: 0, created_at: new Date().toISOString(), average_response_time: 48 },
  { id: '5', accuracy_percentage: 35, streak_count: 0, created_at: new Date().toISOString(), average_response_time: 55 }
]

const mockConfidenceMetrics = {
  current_level: 'low' as const,
  confidence_score: 32,
  success_rate_trend: -0.25,
  achievement_momentum: 5,
  mastery_progress: {
    'logical_reasoning': 42,
    'reading_comprehension': 38,
    'logic_games': 28
  },
  last_calculated: new Date().toISOString()
}

const mockBreathingExercise = {
  id: 'four-seven-eight',
  name: '4-7-8 Breathing',
  description: 'A powerful technique for quick anxiety relief',
  duration_seconds: 180,
  breathing_pattern: {
    inhale_seconds: 4,
    hold_seconds: 7,
    exhale_seconds: 8,
    pause_seconds: 0,
    cycles: 6
  },
  guidance_text: [
    'Inhale through your nose for 4 counts',
    'Hold your breath for 7 counts',
    'Exhale completely through your mouth for 8 counts'
  ],
  visual_guide_type: 'circle' as const
}

// ============================================================================
// INTEGRATION EXAMPLE COMPONENT
// ============================================================================

export const AnxietyIntegrationExample: React.FC = () => {
  const {
    triggerAnxietyCheck,
    currentAnxietyLevel,
    latestDetection,
    confidenceMetrics,
    activeIntervention,
    shouldShowQuickCalm,
    startBreathingExercise,
    dismissIntervention
  } = useAnxietyManagement()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showBreathingExercise, setShowBreathingExercise] = useState(false)
  const [integrationSteps, setIntegrationSteps] = useState([
    { id: 1, name: 'Performance Analysis', status: 'pending' },
    { id: 2, name: 'Anxiety Detection', status: 'pending' },
    { id: 3, name: 'Confidence Assessment', status: 'pending' },
    { id: 4, name: 'Intervention Selection', status: 'pending' },
    { id: 5, name: 'Adaptive Recommendations', status: 'pending' }
  ])

  // ============================================================================
  // DEMONSTRATION METHODS
  // ============================================================================

  const demonstrateIntegration = async () => {
    setIsAnalyzing(true)

    try {
      // Step 1: Performance Analysis (Epic 2 Integration)
      updateStepStatus(1, 'in_progress')
      await delay(1000)
      updateStepStatus(1, 'completed')

      // Step 2: Anxiety Detection (MELLOWISE-012 Integration)
      updateStepStatus(2, 'in_progress')
      await delay(1500)

      const response = await triggerAnxietyCheck(mockPerformanceData)
      updateStepStatus(2, 'completed')

      // Step 3: Confidence Assessment (MELLOWISE-010 Integration)
      updateStepStatus(3, 'in_progress')
      await delay(1200)
      updateStepStatus(3, 'completed')

      // Step 4: Intervention Selection (MELLOWISE-009 Integration)
      updateStepStatus(4, 'in_progress')
      await delay(1000)
      updateStepStatus(4, 'completed')

      // Step 5: Adaptive Recommendations
      updateStepStatus(5, 'in_progress')
      await delay(800)
      updateStepStatus(5, 'completed')

    } catch (error) {
      console.error('Integration demonstration error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleBreathingExerciseComplete = (sessionData: any) => {
    console.log('Breathing exercise completed:', sessionData)
    setShowBreathingExercise(false)

    // Demonstrate anxiety level improvement
    setTimeout(() => {
      // This would normally be handled by the anxiety management system
      console.log('Anxiety level improved after breathing exercise')
    }, 1000)
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  const updateStepStatus = (stepId: number, status: 'pending' | 'in_progress' | 'completed') => {
    setIntegrationSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'in_progress': return '⏳'
      default: return '⭕'
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      default: return 'text-gray-400'
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Anxiety Management System Integration</h1>
        <p className="text-muted-foreground">
          Demonstration of how MELLOWISE-014 integrates with existing Epic 2 AI systems
        </p>
      </div>

      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Epic 2 AI Integration Flow</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The anxiety management system seamlessly integrates with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm">MELLOWISE-012</h4>
                <p className="text-xs text-muted-foreground">Performance Insights for anxiety detection</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm">MELLOWISE-010</h4>
                <p className="text-xs text-muted-foreground">Dynamic Difficulty for confidence building</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-sm">MELLOWISE-009</h4>
                <p className="text-xs text-muted-foreground">Learning Styles for personalized interventions</p>
              </div>
            </div>

            <Button
              onClick={demonstrateIntegration}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing Integration...' : 'Demonstrate Integration'}
            </Button>

            {/* Integration Steps */}
            {integrationSteps.some(step => step.status !== 'pending') && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-sm">Integration Steps:</h4>
                {integrationSteps.map(step => (
                  <div key={step.id} className={`flex items-center space-x-2 text-sm ${getStepColor(step.status)}`}>
                    <span>{getStepIcon(step.status)}</span>
                    <span>{step.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Demonstration */}
      <Tabs defaultValue="detection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Anxiety Detection</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Building</TabsTrigger>
          <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
          <TabsTrigger value="integration">Full Integration</TabsTrigger>
        </TabsList>

        {/* Anxiety Detection Tab */}
        <TabsContent value="detection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Anxiety Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnxietyIndicator
                  anxietyDetection={latestDetection}
                  confidenceMetrics={mockConfidenceMetrics}
                  onBreathingExercise={() => setShowBreathingExercise(true)}
                  onQuickCalm={() => console.log('Quick calm triggered')}
                  showQuickActions={true}
                />

                {activeIntervention && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <strong>Intervention Triggered:</strong> {activeIntervention.intervention_type}
                          <br />
                          <span className="text-sm">Trigger: {activeIntervention.trigger_detected}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissIntervention(activeIntervention.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Integration Points:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Uses MELLOWISE-012 performance insights for behavioral pattern analysis</li>
                    <li>• Integrates with MELLOWISE-010 difficulty tracking for trigger identification</li>
                    <li>• Leverages MELLOWISE-009 learning styles for personalized detection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence Building Tab */}
        <TabsContent value="confidence" className="space-y-4">
          <ConfidenceDashboard
            confidenceMetrics={mockConfidenceMetrics}
            onStartConfidenceSession={() => console.log('Starting confidence session')}
            onViewDetailedAnalytics={() => console.log('Viewing detailed analytics')}
          />

          <Card>
            <CardHeader>
              <CardTitle>Adaptive Question Sequencing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current Strategy: Confidence Building</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Starting Difficulty:</span>
                        <Badge variant="outline">3/10 (Reduced)</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Progression Rate:</span>
                        <Badge variant="outline">Gradual (+0.5)</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Threshold:</span>
                        <Badge variant="outline">75%</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Upcoming Questions:</h4>
                    <div className="space-y-2">
                      {[3, 3.5, 4, 4.5, 5].map((difficulty, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm">Question {index + 1}:</span>
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            Difficulty {difficulty}
                          </Badge>
                          {index === 0 && <span className="text-xs text-green-600">Current</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Epic 2 Integration:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Builds on MELLOWISE-010 dynamic difficulty algorithms</li>
                    <li>• Uses MELLOWISE-009 learning style preferences for sequencing</li>
                    <li>• Integrates with MELLOWISE-012 performance tracking for adaptive adjustments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mindfulness Tab */}
        <TabsContent value="mindfulness" className="space-y-4">
          {showBreathingExercise ? (
            <BreathingExerciseComponent
              exercise={mockBreathingExercise}
              onComplete={handleBreathingExerciseComplete}
              anxietyLevel={currentAnxietyLevel}
              showInstructions={true}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Mindfulness Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Exercises</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowBreathingExercise(true)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          4-7-8 Breathing (3 min)
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Box Breathing (4 min)
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Progressive Muscle Relaxation (10 min)
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Personalization</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current Anxiety Level:</span>
                          <Badge variant="outline">{currentAnxietyLevel}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Preferred Duration:</span>
                          <Badge variant="outline">3-5 minutes</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Learning Style:</span>
                          <Badge variant="outline">Visual + Kinesthetic</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Effectiveness Rate:</span>
                          <Badge variant="outline">85%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Adaptive Features:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Adjusts exercise selection based on detected anxiety triggers</li>
                      <li>• Personalizes timing and intensity using learning style data</li>
                      <li>• Tracks effectiveness and adapts recommendations over time</li>
                      <li>• Integrates with session flow for minimal disruption</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Full Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Epic 2 Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Integration Flow Diagram */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4 text-center">Data Flow Integration</h4>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <span>Performance Data</span>
                      <br />
                      <Badge variant="outline" className="text-xs">MELLOWISE-012</Badge>
                    </div>
                    <span>→</span>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <span>Anxiety Detection</span>
                      <br />
                      <Badge variant="outline" className="text-xs">MELLOWISE-014</Badge>
                    </div>
                    <span>→</span>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <Brain className="h-6 w-6 text-green-600" />
                      </div>
                      <span>Adaptive Response</span>
                      <br />
                      <Badge variant="outline" className="text-xs">ALL SYSTEMS</Badge>
                    </div>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Key Integration Benefits</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Real-time anxiety monitoring using existing performance data</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Seamless difficulty adjustment based on emotional state</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Personalized interventions using learning style preferences</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Confidence building through adaptive question sequencing</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Technical Integration</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Shared database schemas for seamless data flow</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Common TypeScript types for type safety</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Event-driven architecture for real-time responses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Modular services for independent scaling</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Usage Example */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Example Integration Scenario:</h4>
                  <ol className="text-sm space-y-1 ml-4">
                    <li>1. Student starts practice session (MELLOWISE-005 Survival Mode)</li>
                    <li>2. Performance tracking detects declining accuracy (MELLOWISE-012)</li>
                    <li>3. Anxiety detection triggers based on behavioral patterns (MELLOWISE-014)</li>
                    <li>4. Confidence building service reduces question difficulty (MELLOWISE-010)</li>
                    <li>5. Learning style preferences suggest breathing exercise (MELLOWISE-009)</li>
                    <li>6. Student completes exercise and returns to practice with restored confidence</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnxietyIntegrationExample