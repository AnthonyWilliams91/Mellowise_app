/**
 * Practice Mode Difficulty Settings Component
 * 
 * MELLOWISE-010: Dynamic Difficulty Adjustment Algorithm
 * Provides manual override functionality for users to control their practice difficulty
 * 
 * @author Dev Agent James
 * @version 1.0
 * @epic MELLOWISE-010
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Brain, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  RotateCcw,
  Save
} from 'lucide-react'
import type { 
  DifficultyState, 
  TopicCategory, 
  DifficultyOverride 
} from '@/types/dynamic-difficulty'

interface DifficultySettingsProps {
  userId: string
  currentStates?: Record<TopicCategory, DifficultyState>
  onSettingsChange?: (overrides: Record<TopicCategory, DifficultyOverride>) => void
}

const TOPIC_CATEGORIES: Record<TopicCategory, { label: string; description: string }> = {
  'logic_games': {
    label: 'Logic Games',
    description: 'Analytical reasoning puzzles and rule-based problems'
  },
  'reading_comprehension': {
    label: 'Reading Comprehension',
    description: 'Passage analysis and critical reading questions'
  },
  'logical_reasoning': {
    label: 'Logical Reasoning',
    description: 'Argument analysis and logical inference questions'
  }
}

const DIFFICULTY_LABELS = {
  1: 'Very Easy',
  2: 'Easy', 
  3: 'Moderate',
  4: 'Challenging',
  5: 'Hard',
  6: 'Very Hard',
  7: 'Expert',
  8: 'Master',
  9: 'Elite',
  10: 'Extreme'
}

export default function DifficultySettings({ 
  userId, 
  currentStates = {},
  onSettingsChange 
}: DifficultySettingsProps) {
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(true)
  const [overrides, setOverrides] = useState<Record<TopicCategory, DifficultyOverride>>({
    'logic_games': { isEnabled: false, targetDifficulty: 5, reason: 'user_preference' },
    'reading_comprehension': { isEnabled: false, targetDifficulty: 5, reason: 'user_preference' },
    'logical_reasoning': { isEnabled: false, targetDifficulty: 5, reason: 'user_preference' }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    loadCurrentSettings()
  }, [userId])

  const loadCurrentSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/practice/difficulty?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.overrides) {
          setOverrides(data.overrides)
        }
        setAdaptiveEnabled(data.adaptiveEnabled ?? true)
      }
    } catch (error) {
      console.error('Failed to load difficulty settings:', error)
    }
    setLoading(false)
  }

  const handleOverrideToggle = (topic: TopicCategory, enabled: boolean) => {
    const newOverrides = {
      ...overrides,
      [topic]: {
        ...overrides[topic],
        isEnabled: enabled
      }
    }
    setOverrides(newOverrides)
  }

  const handleDifficultyChange = (topic: TopicCategory, difficulty: number[]) => {
    const newOverrides = {
      ...overrides,
      [topic]: {
        ...overrides[topic],
        targetDifficulty: difficulty[0],
        isEnabled: true
      }
    }
    setOverrides(newOverrides)
  }

  const handleResetToAdaptive = (topic: TopicCategory) => {
    const newOverrides = {
      ...overrides,
      [topic]: {
        ...overrides[topic],
        isEnabled: false
      }
    }
    setOverrides(newOverrides)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/practice/difficulty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          adaptiveEnabled,
          overrides
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
        onSettingsChange?.(overrides)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save difficulty settings:', error)
    }
    setSaving(false)
  }

  const getCurrentDifficulty = (topic: TopicCategory): number => {
    const currentState = currentStates[topic]
    const override = overrides[topic]
    
    if (override?.isEnabled) {
      return override.targetDifficulty
    }
    
    return currentState?.difficulty || 5
  }

  const getSuccessRate = (topic: TopicCategory): number => {
    const currentState = currentStates[topic]
    return currentState?.successRate || 0
  }

  const getStabilityScore = (topic: TopicCategory): number => {
    const currentState = currentStates[topic]
    return currentState?.stability || 0
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Practice Difficulty Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Practice Difficulty Settings</span>
            </div>
            {lastSaved && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="adaptive-mode" className="text-base font-medium">
                Adaptive Difficulty Mode
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Let AI automatically adjust difficulty to maintain 70-80% success rate
              </p>
            </div>
            <Switch
              id="adaptive-mode"
              checked={adaptiveEnabled}
              onCheckedChange={setAdaptiveEnabled}
            />
          </div>
          
          {!adaptiveEnabled && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Manual Mode Active</p>
                  <p className="text-xs text-amber-700 mt-1">
                    You'll need to manually adjust difficulty for optimal learning. AI recommendations are disabled.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topic-Specific Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(Object.keys(TOPIC_CATEGORIES) as TopicCategory[]).map((topic) => {
          const { label, description } = TOPIC_CATEGORIES[topic]
          const currentDifficulty = getCurrentDifficulty(topic)
          const successRate = getSuccessRate(topic)
          const stability = getStabilityScore(topic)
          const isOverridden = overrides[topic]?.isEnabled

          return (
            <Card key={topic} className={`${isOverridden ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <CardTitle className="text-lg">{label}</CardTitle>
                <p className="text-sm text-gray-600">{description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{Math.round(successRate * 100)}%</div>
                    <div className="text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{Math.round(stability * 100)}%</div>
                    <div className="text-gray-600">Stability</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{currentDifficulty}/10</div>
                    <div className="text-gray-600">Difficulty</div>
                  </div>
                </div>

                {/* Manual Override Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor={`override-${topic}`} className="text-sm">
                    Manual Override
                  </Label>
                  <Switch
                    id={`override-${topic}`}
                    checked={isOverridden}
                    onCheckedChange={(enabled) => handleOverrideToggle(topic, enabled)}
                    disabled={!adaptiveEnabled && !isOverridden}
                  />
                </div>

                {/* Difficulty Slider */}
                <div className="space-y-2">
                  <Label className="text-sm">Target Difficulty</Label>
                  <Slider
                    value={[currentDifficulty]}
                    onValueChange={(value) => handleDifficultyChange(topic, value)}
                    min={1}
                    max={10}
                    step={1}
                    disabled={!isOverridden && adaptiveEnabled}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 (Easy)</span>
                    <span className="font-medium">
                      {DIFFICULTY_LABELS[currentDifficulty as keyof typeof DIFFICULTY_LABELS]}
                    </span>
                    <span>10 (Extreme)</span>
                  </div>
                </div>

                {/* Reset Button */}
                {isOverridden && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetToAdaptive(topic)}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Adaptive
                  </Button>
                )}

                {/* AI Recommendation */}
                {adaptiveEnabled && !isOverridden && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="flex items-center space-x-1">
                      <Brain className="h-3 w-3 text-blue-600" />
                      <span className="font-medium text-blue-800">AI Recommendation</span>
                    </div>
                    <p className="text-blue-700 mt-1">
                      Current difficulty optimal for your learning progress
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          size="lg"
          className="px-8"
        >
          {saving ? (
            <>
              <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Info Panel */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">How Difficulty Works</span>
            </div>
            <p>
              Practice Mode uses adaptive difficulty to maintain 70-80% success rate for optimal learning.
              Survival Mode remains equally challenging for all players to ensure fair competition.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}