/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Test Page for Logic Games Interactive Components
 *
 * @epic Epic 3.2 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-19
 */

'use client'

import React, { useState } from 'react'
import { LogicGameQuestion } from '@/components/logic-games'
import type { LogicGameQuestion as LogicGameQuestionType, LogicGameQuestionResult } from '@/components/logic-games'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, Target, Brain, BarChart3 } from 'lucide-react'

// Sample Logic Games question for testing
const sampleLogicGameQuestion: LogicGameQuestionType = {
  id: 'test_lg_001',
  tenant_id: 'test_tenant',
  exam_type_id: 'lsat',
  category_id: 'logic_games',

  // Question content
  content: 'Six students—Amy, Ben, Carlos, Diana, Elena, and Frank—are sitting in a row of six chairs numbered 1 through 6 from left to right. The following conditions apply.',
  question_type: 'logic_game',
  subtype: 'linear_ordering',
  difficulty: 5,
  difficulty_level: 'medium',

  // Logic Games specific
  game_type: 'sequencing',
  game_subtype: 'linear_ordering',
  difficulty_tier: 'standard',

  // Game setup
  game_setup: {
    entities: [
      { id: 'amy', name: 'Amy', type: 'person', color: '#3b82f6' },
      { id: 'ben', name: 'Ben', type: 'person', color: '#10b981' },
      { id: 'carlos', name: 'Carlos', type: 'person', color: '#f59e0b' },
      { id: 'diana', name: 'Diana', type: 'person', color: '#8b5cf6' },
      { id: 'elena', name: 'Elena', type: 'person', color: '#ef4444' },
      { id: 'frank', name: 'Frank', type: 'person', color: '#06b6d4' }
    ],
    positions: [
      { id: 'pos1', name: 'Chair 1', type: 'slot', order: 1 },
      { id: 'pos2', name: 'Chair 2', type: 'slot', order: 2 },
      { id: 'pos3', name: 'Chair 3', type: 'slot', order: 3 },
      { id: 'pos4', name: 'Chair 4', type: 'slot', order: 4 },
      { id: 'pos5', name: 'Chair 5', type: 'slot', order: 5 },
      { id: 'pos6', name: 'Chair 6', type: 'slot', order: 6 }
    ],
    constraints: [],
    scenario_description: 'Six students are sitting in a row of six chairs numbered 1 through 6 from left to right.',
    entity_descriptions: {}
  },

  // Game rules
  game_rules: [
    {
      id: 'rule1',
      rule_text: 'Amy must sit in either chair 1 or chair 6',
      rule_type: 'conditional',
      logical_structure: {
        entities_involved: ['amy'],
        positions_involved: ['pos1', 'pos6'],
        logical_operator: 'or'
      },
      difficulty_contribution: 2,
      common_misinterpretations: [],
      teaching_points: ['End positions are often key constraint points']
    },
    {
      id: 'rule2',
      rule_text: 'Ben and Carlos must sit next to each other',
      rule_type: 'adjacency',
      logical_structure: {
        entities_involved: ['ben', 'carlos'],
        positions_involved: [],
        logical_operator: 'and'
      },
      difficulty_contribution: 3,
      common_misinterpretations: ['Students might forget this creates a block'],
      teaching_points: ['Adjacent entities form a movable block']
    },
    {
      id: 'rule3',
      rule_text: 'Diana sits somewhere to the left of Elena',
      rule_type: 'sequence',
      logical_structure: {
        entities_involved: ['diana', 'elena'],
        positions_involved: [],
        logical_operator: 'if_then'
      },
      difficulty_contribution: 2,
      common_misinterpretations: [],
      teaching_points: ['Relative positioning reduces possible arrangements']
    },
    {
      id: 'rule4',
      rule_text: 'Frank cannot sit in chair 3',
      rule_type: 'exclusion',
      logical_structure: {
        entities_involved: ['frank'],
        positions_involved: ['pos3'],
        logical_operator: 'not'
      },
      difficulty_contribution: 1,
      common_misinterpretations: [],
      teaching_points: ['Negative constraints limit placement options']
    }
  ],

  // Board configuration
  game_board_config: {
    board_type: 'linear_sequence',
    layout_dimensions: { width: 800, height: 200 },
    interaction_modes: ['drag_and_drop', 'click_to_place', 'freehand_drawing'],
    theme: {
      name: 'default',
      background_color: '#ffffff',
      grid_color: '#e5e5e5',
      border_color: '#333333',
      high_contrast_mode: false,
      colorblind_friendly: true,
      font_scale: 1.0
    },
    entity_styling: {
      default_shape: 'rounded_rectangle',
      size: { width: 80, height: 40 },
      colors: {
        person: '#3b82f6',
        object: '#10b981',
        event: '#f59e0b',
        attribute: '#8b5cf6'
      },
      border_width: 2,
      font_family: 'Inter',
      font_size: 14,
      hover_effects: true,
      selection_highlight: '#fbbf24'
    },
    position_styling: {
      slot_shape: 'rectangle',
      size: { width: 100, height: 60 },
      background_color: '#f8fafc',
      border_color: '#64748b',
      border_style: 'solid',
      label_position: 'below',
      drop_zone_highlight: '#dbeafe'
    },
    drag_drop_enabled: true,
    snap_to_grid: true,
    real_time_validation: true,
    hint_system_enabled: true
  },

  // Question stem
  question_stem: 'If Ben sits in chair 2, which of the following must be true?',
  question_type: 'must_be_true',

  // Answer choices
  answer_choices: [
    {
      id: 'choice_a',
      text: 'Amy sits in chair 6',
      is_correct: false,
      explanation: 'Amy could sit in chair 1 or 6, not necessarily chair 6.'
    },
    {
      id: 'choice_b',
      text: 'Carlos sits in either chair 1 or chair 3',
      is_correct: true,
      explanation: 'Since Ben is in chair 2 and must be adjacent to Carlos, Carlos must be in chair 1 or 3.'
    },
    {
      id: 'choice_c',
      text: 'Diana sits in chair 4',
      is_correct: false,
      explanation: 'Diana\'s position is not fixed by Ben being in chair 2.'
    },
    {
      id: 'choice_d',
      text: 'Elena sits in chair 5',
      is_correct: false,
      explanation: 'Elena must be to the right of Diana, but her exact position is not determined.'
    },
    {
      id: 'choice_e',
      text: 'Frank sits in chair 6',
      is_correct: false,
      explanation: 'Frank cannot sit in chair 3, but could be in various other positions.'
    }
  ],

  // Solution
  explanation: 'When Ben sits in chair 2, the adjacency rule requires Carlos to sit in either chair 1 or chair 3. This is the only constraint that becomes fixed. Amy still has flexibility between chairs 1 and 6 (though chair 1 might be occupied by Carlos). Diana and Elena maintain their relative ordering but have multiple valid positions. Frank can be placed in any remaining chair except chair 3.',
  correct_answer: 'choice_b',

  // Solution approach
  solution_approach: [
    {
      step_number: 1,
      step_type: 'setup_analysis',
      description: 'Identify the given condition: Ben is in chair 2',
      concepts_demonstrated: ['conditional_reasoning'],
      inference_type: 'direct_application',
      difficulty_rating: 2
    },
    {
      step_number: 2,
      step_type: 'rule_application',
      description: 'Apply adjacency rule: Carlos must be next to Ben, so Carlos is in chair 1 or 3',
      concepts_demonstrated: ['adjacency_constraints'],
      inference_type: 'direct_application',
      difficulty_rating: 3
    },
    {
      step_number: 3,
      step_type: 'elimination',
      description: 'Check each answer choice against the constraints',
      concepts_demonstrated: ['systematic_elimination'],
      inference_type: 'exhaustive',
      difficulty_rating: 3
    }
  ],

  inference_chain: [],
  common_mistakes: [],

  // Metadata
  estimated_time: 180,
  cognitive_level: 'analysis',
  concept_tags: ['sequencing', 'adjacency', 'conditional_logic'],
  performance_indicators: [],

  // Performance tracking
  average_completion_time: 150,
  success_rate_by_tier: {
    introductory: 0.90,
    standard: 0.75,
    advanced: 0.60,
    expert: 0.45
  },

  // Base fields
  usage_count: 0,
  success_rate: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export default function LogicGamesTestPage() {
  const [testResult, setTestResult] = useState<LogicGameQuestionResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<LogicGameQuestionType>(sampleLogicGameQuestion)

  const handleQuestionComplete = (result: LogicGameQuestionResult) => {
    setTestResult(result)
    setShowResults(true)
  }

  const resetTest = () => {
    setTestResult(null)
    setShowResults(false)
    // Reset with a fresh question instance
    setCurrentQuestion({ ...sampleLogicGameQuestion, id: `test_lg_${Date.now()}` })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Logic Games Test Environment</h1>
        <p className="text-gray-600">Testing MELLOWISE-018: Interactive Logic Games Deep Practice Module</p>

        <div className="flex gap-2 mt-4">
          <Badge variant="secondary">Epic 3.2</Badge>
          <Badge variant="outline">Interactive Diagramming</Badge>
          <Badge variant="outline">Drag & Drop</Badge>
          <Badge variant="outline">Real-time Validation</Badge>
        </div>
      </div>

      {/* Test Status */}
      {showResults && testResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  Correct Answer!
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  Incorrect Answer
                </>
              )}
            </CardTitle>
            <CardDescription>Test Results Summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time Spent</p>
                  <p className="font-semibold">{testResult.timeSpent}s</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Actions</p>
                  <p className="font-semibold">{testResult.userActions.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Hints Used</p>
                  <p className="font-semibold">{testResult.hintsUsed}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Efficiency</p>
                  <p className="font-semibold">{testResult.session.efficiency_score}%</p>
                </div>
              </div>
            </div>

            <Button onClick={resetTest} className="mt-4">
              Try Another Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Question Component */}
      <Card>
        <CardHeader>
          <CardTitle>Logic Games Question</CardTitle>
          <CardDescription>
            Drag and drop entities to their positions, draw annotations, and use hints as needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogicGameQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            onComplete={handleQuestionComplete}
            timeLimit={300}
            practiceMode={true}
            showSolution={false}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use the Logic Games Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Drag & Drop:</strong> Click and drag entities from the left panel to position slots</p>
          <p>• <strong>Drawing Mode:</strong> Switch to draw mode to make annotations and connections</p>
          <p>• <strong>Hints:</strong> Use the hint buttons for setup guidance, rule clarification, or inference help</p>
          <p>• <strong>Validation:</strong> The board shows real-time validation of rule violations</p>
          <p>• <strong>Timer:</strong> Track your time and pause/resume as needed in practice mode</p>
          <p>• <strong>Reset:</strong> Click the reset button to clear the board and start over</p>
        </CardContent>
      </Card>
    </div>
  )
}