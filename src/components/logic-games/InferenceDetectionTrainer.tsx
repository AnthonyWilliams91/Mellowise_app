/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Inference Detection Training Component
 *
 * Interactive visual training system for Logic Games inference detection
 * Uses React Flow for graph visualization and guided discovery
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - UX Expert Aria + Dev Agent Marcus
 * @created 2025-01-20
 */

'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Position,
  Handle,
  BackgroundVariant,
  ConnectionMode
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Target,
  Brain,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Trophy,
  HelpCircle as Hint
} from 'lucide-react'

import type { LogicGameQuestion } from '@/types/logic-games'
import type { GameClassification } from '@/lib/logic-games/game-categorizer'
import {
  InferenceDetector,
  type InferenceMap,
  type InferenceTrainingSession,
  type InferenceNode,
  type InferenceConnection,
  type TrainingHint
} from '@/lib/logic-games/inference-detector'

interface InferenceDetectionTrainerProps {
  question: LogicGameQuestion
  classification: GameClassification
  onComplete?: (session: InferenceTrainingSession, score: number) => void
  onProgress?: (discovered: number, total: number) => void
  className?: string
}

// Custom node types for different inference types
const InferenceNodeComponent = ({ data, selected }: any) => {
  const getNodeStyle = (type: string, discovered: boolean) => {
    const baseStyle = "px-3 py-2 rounded-lg border-2 text-sm font-medium min-w-[120px] text-center relative"

    if (!discovered) {
      return `${baseStyle} bg-gray-100 border-gray-300 text-gray-400 opacity-50`
    }

    const styles = {
      rule: "bg-blue-50 border-blue-300 text-blue-900",
      constraint: "bg-purple-50 border-purple-300 text-purple-900",
      inference: "bg-green-50 border-green-300 text-green-900",
      deduction: "bg-orange-50 border-orange-300 text-orange-900",
      contradiction: "bg-red-50 border-red-300 text-red-900"
    }

    return `${baseStyle} ${styles[type as keyof typeof styles] || styles.rule}`
  }

  const getIcon = (type: string) => {
    const iconProps = { className: "h-4 w-4 absolute top-1 right-1" }
    switch (type) {
      case 'rule': return <Target {...iconProps} />
      case 'constraint': return <AlertTriangle {...iconProps} />
      case 'inference': return <Brain {...iconProps} />
      case 'deduction': return <Zap {...iconProps} />
      case 'contradiction': return <CheckCircle2 {...iconProps} />
      default: return <Target {...iconProps} />
    }
  }

  return (
    <div className={getNodeStyle(data.type, data.discovered)}>
      <Handle type="target" position={Position.Top} />
      {getIcon(data.type)}
      <div className="font-semibold">{data.title}</div>
      <div className="text-xs mt-1">{data.content}</div>
      {data.discovered && data.teaching_note && (
        <div className="text-xs text-gray-600 mt-2 italic">
          💡 {data.teaching_note}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = {
  inferenceNode: InferenceNodeComponent
}

export function InferenceDetectionTrainer({
  question,
  classification,
  onComplete,
  onProgress,
  className
}: InferenceDetectionTrainerProps) {
  // Core state
  const [inferenceMap, setInferenceMap] = useState<InferenceMap | null>(null)
  const [session, setSession] = useState<InferenceTrainingSession | null>(null)
  const [isActive, setIsActive] = useState(false)

  // UI state
  const [proposedInference, setProposedInference] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [availableHints, setAvailableHints] = useState<TrainingHint[]>([])
  const [showAllNodes, setShowAllNodes] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Initialize training session
  useEffect(() => {
    const map = InferenceDetector.generateInferenceMap(question, classification)
    setInferenceMap(map)

    const newSession: InferenceTrainingSession = {
      map,
      discovered_nodes: [],
      discovered_connections: [],
      hints_used: 0,
      start_time: Date.now(),
      mistakes: {
        incorrect_inferences: [],
        missed_connections: [],
        invalid_reasoning: []
      },
      progress: {
        nodes_found: 0,
        connections_made: 0,
        accuracy_rate: 1.0,
        current_difficulty: 1
      }
    }
    setSession(newSession)

    // Generate initial hints
    const hints = InferenceDetector.generateHints(newSession)
    setAvailableHints(hints)

    updateVisualization(map, newSession)
  }, [question, classification])

  // Convert inference map to React Flow nodes and edges
  const updateVisualization = useCallback((map: InferenceMap, currentSession: InferenceTrainingSession) => {
    const flowNodes: Node[] = map.nodes.map(node => ({
      id: node.id,
      type: 'inferenceNode',
      position: node.position,
      data: {
        ...node,
        discovered: showAllNodes || currentSession.discovered_nodes.includes(node.id)
      },
      draggable: true,
      selectable: true
    }))

    const flowEdges: Edge[] = map.connections
      .filter(conn =>
        showAllNodes ||
        (currentSession.discovered_nodes.includes(conn.source) &&
         currentSession.discovered_nodes.includes(conn.target))
      )
      .map(conn => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        animated: conn.animated || false,
        style: conn.style || {},
        label: conn.reasoning,
        type: conn.type === 'contradicts' ? 'straight' : 'default'
      }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [showAllNodes, setNodes, setEdges])

  // Update visualization when session changes
  useEffect(() => {
    if (inferenceMap && session) {
      updateVisualization(inferenceMap, session)
    }
  }, [session, showAllNodes, updateVisualization, inferenceMap])

  // Handle inference submission
  const handleInferenceSubmission = useCallback(() => {
    if (!session || !proposedInference.trim()) return

    const validation = InferenceDetector.validateInference(
      session,
      proposedInference,
      reasoning
    )

    if (validation.valid && validation.matchedNode) {
      // Successful discovery
      const updatedSession = {
        ...session,
        discovered_nodes: [...session.discovered_nodes, validation.matchedNode.id],
        progress: {
          ...session.progress,
          nodes_found: session.discovered_nodes.length + 1,
          accuracy_rate: calculateAccuracy(session)
        }
      }
      setSession(updatedSession)

      setFeedback({
        type: 'success',
        message: validation.feedback
      })

      // Clear inputs
      setProposedInference('')
      setReasoning('')

      // Update progress callback
      onProgress?.(updatedSession.discovered_nodes.length, inferenceMap?.nodes.length || 0)

      // Check completion
      if (updatedSession.discovered_nodes.length >= (inferenceMap?.success_criteria.min_inferences_found || 0)) {
        const score = calculateFinalScore(updatedSession)
        onComplete?.(updatedSession, score)
      }

    } else {
      // Incorrect inference
      const updatedSession = {
        ...session,
        mistakes: {
          ...session.mistakes,
          incorrect_inferences: [...session.mistakes.incorrect_inferences, proposedInference]
        }
      }
      setSession(updatedSession)

      setFeedback({
        type: 'error',
        message: validation.feedback
      })
    }

    // Clear feedback after delay
    setTimeout(() => setFeedback(null), 5000)
  }, [session, proposedInference, reasoning, onProgress, onComplete, inferenceMap])

  // Handle hint usage
  const useHint = useCallback((hint: TrainingHint) => {
    if (!session) return

    const updatedSession = {
      ...session,
      hints_used: session.hints_used + 1
    }
    setSession(updatedSession)

    setFeedback({
      type: 'info',
      message: hint.hint_text
    })

    // Remove used hint
    setAvailableHints(prev => prev.filter(h => h.id !== hint.id))

    setTimeout(() => setFeedback(null), 8000)
  }, [session])

  // Start training session
  const startTraining = useCallback(() => {
    setIsActive(true)
    if (session) {
      const updatedSession = {
        ...session,
        start_time: Date.now()
      }
      setSession(updatedSession)
    }
  }, [session])

  // Reset training session
  const resetTraining = useCallback(() => {
    if (inferenceMap) {
      const newSession: InferenceTrainingSession = {
        map: inferenceMap,
        discovered_nodes: [],
        discovered_connections: [],
        hints_used: 0,
        start_time: Date.now(),
        mistakes: {
          incorrect_inferences: [],
          missed_connections: [],
          invalid_reasoning: []
        },
        progress: {
          nodes_found: 0,
          connections_made: 0,
          accuracy_rate: 1.0,
          current_difficulty: 1
        }
      }
      setSession(newSession)
      setIsActive(false)
      setProposedInference('')
      setReasoning('')
      setFeedback(null)
    }
  }, [inferenceMap])

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!session || !inferenceMap) return 0
    return Math.round((session.discovered_nodes.length / inferenceMap.nodes.length) * 100)
  }, [session, inferenceMap])

  if (!inferenceMap || !session) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />
  }

  return (
    <div className={cn('inference-detection-trainer', className)}>
      {/* Training Header */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                {inferenceMap.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {inferenceMap.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {inferenceMap.difficulty_level}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {inferenceMap.estimated_duration}min
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllNodes(!showAllNodes)}
              >
                {showAllNodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Discovery Progress</span>
              <span className="text-sm text-gray-500">
                {session.discovered_nodes.length} / {inferenceMap.nodes.length} inferences
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Learning Objectives */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Target className="h-4 w-4 text-green-500" />
              Learning Objectives
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {inferenceMap.learning_objectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          {/* Session Controls */}
          <div className="flex items-center gap-2">
            {!isActive ? (
              <Button onClick={startTraining} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Start Inference Detection
              </Button>
            ) : (
              <Button onClick={resetTraining} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Training
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Interface */}
      {isActive && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inference Map Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Inference Map</CardTitle>
                <CardDescription>
                  Discover logical connections between rules and inferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-lg">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    attributionPosition="bottom-left"
                  >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} />
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discovery Panel */}
          <div className="space-y-4">
            {/* Inference Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Propose Inference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Your Inference
                  </label>
                  <Input
                    value={proposedInference}
                    onChange={(e) => setProposedInference(e.target.value)}
                    placeholder="What can you deduce from the rules?"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Reasoning
                  </label>
                  <Textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Explain your logical reasoning..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <Button
                  onClick={handleInferenceSubmission}
                  disabled={!proposedInference.trim()}
                  className="w-full"
                >
                  Submit Inference
                </Button>
              </CardContent>
            </Card>

            {/* Hints Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hint className="h-4 w-4 text-blue-500" />
                  Available Hints ({availableHints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableHints.length > 0 ? (
                  <div className="space-y-2">
                    {availableHints.slice(0, 3).map(hint => (
                      <Button
                        key={hint.id}
                        variant="outline"
                        size="sm"
                        onClick={() => useHint(hint)}
                        className="w-full text-left justify-start"
                      >
                        <Zap className="h-3 w-3 mr-2 text-yellow-500" />
                        Level {hint.reveal_level} Hint (-{hint.cost} pts)
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hints available</p>
                )}
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-gold-500" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Discovered:</span>
                  <span className="font-medium">{session.discovered_nodes.length}/{inferenceMap.nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hints Used:</span>
                  <span className="font-medium">{session.hints_used}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-medium">{Math.round(session.progress.accuracy_rate * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - session.start_time) / 1000 / 60)}m
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50",
          {
            'bg-green-50 border border-green-200 text-green-800': feedback.type === 'success',
            'bg-red-50 border border-red-200 text-red-800': feedback.type === 'error',
            'bg-blue-50 border border-blue-200 text-blue-800': feedback.type === 'info'
          }
        )}>
          <div className="flex items-start gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {feedback.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {feedback.type === 'info' && <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />}
            <p className="text-sm">{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function calculateAccuracy(session: InferenceTrainingSession): number {
  const totalAttempts = session.discovered_nodes.length + session.mistakes.incorrect_inferences.length
  if (totalAttempts === 0) return 1.0
  return session.discovered_nodes.length / totalAttempts
}

function calculateFinalScore(session: InferenceTrainingSession): number {
  const baseScore = session.discovered_nodes.length * 10
  const accuracyBonus = Math.round(session.progress.accuracy_rate * 50)
  const hintPenalty = session.hints_used * 5
  const timePenalty = Math.floor((Date.now() - session.start_time) / 1000 / 60) // 1 point per minute

  return Math.max(0, baseScore + accuracyBonus - hintPenalty - timePenalty)
}

export default InferenceDetectionTrainer