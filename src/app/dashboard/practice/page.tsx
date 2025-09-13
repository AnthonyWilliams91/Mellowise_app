/**
 * Practice Mode Dashboard Page
 * 
 * MELLOWISE-010: Dynamic Difficulty Adjustment Algorithm
 * Enhanced practice mode with adaptive difficulty and manual override functionality
 * 
 * @author Dev Agent James  
 * @version 1.0
 * @epic MELLOWISE-010
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Settings, 
  Target, 
  TrendingUp, 
  Brain,
  BookOpen,
  Clock,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DifficultySettings from '@/components/practice/DifficultySettings'
import DifficultyIndicator from '@/components/practice/DifficultyIndicator'
import type { 
  DifficultyState, 
  TopicCategory, 
  DifficultyOverride,
  PracticeSessionConfig 
} from '@/types/dynamic-difficulty'

export default function PracticePage() {
  const [showSettings, setShowSettings] = useState(false)
  const [difficultyStates, setDifficultyStates] = useState<Record<TopicCategory, DifficultyState>>({})
  const [loading, setLoading] = useState(true)
  const [userId] = useState('user-123') // TODO: Get from auth context

  useEffect(() => {
    loadDifficultyStates()
  }, [userId])

  const loadDifficultyStates = async () => {
    try {
      const response = await fetch(`/api/practice/difficulty?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setDifficultyStates(data.states || {})
      }
    } catch (error) {
      console.error('Failed to load difficulty states:', error)
    }
    setLoading(false)
  }

  const handleStartPractice = async (topicCategory: TopicCategory) => {
    try {
      const response = await fetch('/api/practice/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topicCategory,
          sessionType: 'practice'
        })
      })

      if (response.ok) {
        const sessionData = await response.json()
        // TODO: Navigate to practice session with sessionData
        console.log('Practice session started:', sessionData)
      }
    } catch (error) {
      console.error('Failed to start practice session:', error)
    }
  }

  const handleSettingsChange = (overrides: Record<TopicCategory, DifficultyOverride>) => {
    // Reload difficulty states after settings change
    loadDifficultyStates()
  }

  const getTopicStats = (topic: TopicCategory) => {
    const state = difficultyStates[topic]
    if (!state) {
      return {
        difficulty: 5,
        successRate: 0,
        stability: 0,
        questionsAnswered: 0,
        averageTime: 0
      }
    }

    return {
      difficulty: state.difficulty,
      successRate: state.successRate,
      stability: state.stability,
      questionsAnswered: state.questionsAnswered || 0,
      averageTime: state.averageResponseTime || 0
    }
  }

  const PRACTICE_TOPICS = [
    {
      id: 'logic_games' as TopicCategory,
      title: 'Logic Games',
      description: 'Analytical reasoning puzzles and rule-based problems',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'reading_comprehension' as TopicCategory,
      title: 'Reading Comprehension',
      description: 'Passage analysis and critical reading questions',
      icon: BookOpen,
      color: 'green'
    },
    {
      id: 'logical_reasoning' as TopicCategory,
      title: 'Logical Reasoning', 
      description: 'Argument analysis and logical inference questions',
      icon: Brain,
      color: 'purple'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Loading practice mode...</p>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Practice Mode</h1>
              <p className="text-gray-600 mt-2">
                Adaptive difficulty practice sessions tailored to your learning style
              </p>
            </div>
            
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showSettings ? 'Hide Settings' : 'Difficulty Settings'}
            </Button>
          </div>
        </div>

        {/* Difficulty Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <DifficultySettings
              userId={userId}
              currentStates={difficultyStates}
              onSettingsChange={handleSettingsChange}
            />
          </motion.div>
        )}

        {/* Practice Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {PRACTICE_TOPICS.map((topic) => {
            const stats = getTopicStats(topic.id)
            const IconComponent = topic.icon

            return (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg bg-${topic.color}-100`}>
                        <IconComponent className={`h-5 w-5 text-${topic.color}-600`} />
                      </div>
                      <span>{topic.title}</span>
                    </div>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Difficulty Indicator */}
                  <DifficultyIndicator
                    currentDifficulty={stats.difficulty}
                    topicCategory={topic.id}
                    successRate={stats.successRate}
                    stability={stats.stability}
                    isAdaptive={true}
                    className="justify-center"
                  />

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {stats.questionsAnswered}
                      </div>
                      <div className="text-gray-600">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {stats.averageTime > 0 ? `${Math.round(stats.averageTime / 1000)}s` : '--'}
                      </div>
                      <div className="text-gray-600">Avg Time</div>
                    </div>
                  </div>

                  {/* Start Practice Button */}
                  <Button
                    onClick={() => handleStartPractice(topic.id)}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>Adaptive Difficulty</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI-Powered Adjustment</p>
                    <p className="text-xs text-gray-600">Automatically maintains 70-80% success rate for optimal learning</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Topic-Specific Tracking</p>
                    <p className="text-xs text-gray-600">Independent difficulty progression for each LSAT section</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Learning Style Integration</p>
                    <p className="text-xs text-gray-600">Considers your personal learning preferences and pace</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Practice vs Survival</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-1">Practice</Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adaptive Learning</p>
                    <p className="text-xs text-gray-600">Personalized difficulty for optimal skill development</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">Survival</Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fair Competition</p>
                    <p className="text-xs text-gray-600">Equal difficulty for all players to ensure fair rankings</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Pro Tip:</strong> Use Practice Mode to build skills, then test yourself in Survival Mode for competitive rankings!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}