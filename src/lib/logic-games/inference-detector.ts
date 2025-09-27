/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Inference Detection Training System
 *
 * Educational system for training students to identify key inferences in Logic Games
 * Uses pattern recognition and visual mapping to teach logical reasoning
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - Dev Agent Marcus + UX Expert Aria
 * @created 2025-01-20
 */

import type { LogicGameQuestion } from '@/types/logic-games'
import type { GameClassification } from './game-categorizer'

export interface InferenceNode {
  id: string
  type: 'rule' | 'constraint' | 'inference' | 'deduction' | 'contradiction'
  title: string
  content: string
  confidence: number
  difficulty: 1 | 2 | 3 | 4 | 5
  position: { x: number; y: number }
  dependencies: string[]
  reasoning_pattern: 'conditional' | 'contrapositive' | 'block' | 'sequence' | 'exclusion' | 'grouping'
  visual_cue?: string
  teaching_note?: string
}

export interface InferenceConnection {
  id: string
  source: string
  target: string
  type: 'leads_to' | 'blocks' | 'requires' | 'contradicts' | 'supports'
  strength: 1 | 2 | 3 | 4 | 5
  reasoning: string
  animated?: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
  }
}

export interface InferenceMap {
  id: string
  question_id: string
  title: string
  description: string
  nodes: InferenceNode[]
  connections: InferenceConnection[]
  learning_objectives: string[]
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration: number // minutes
  success_criteria: {
    min_inferences_found: number
    min_connections_made: number
    max_hints_allowed: number
  }
}

export interface InferenceTrainingSession {
  map: InferenceMap
  discovered_nodes: string[]
  discovered_connections: string[]
  hints_used: number
  start_time: number
  mistakes: {
    incorrect_inferences: string[]
    missed_connections: string[]
    invalid_reasoning: string[]
  }
  progress: {
    nodes_found: number
    connections_made: number
    accuracy_rate: number
    current_difficulty: number
  }
}

export interface TrainingHint {
  id: string
  type: 'directional' | 'pattern' | 'conceptual' | 'visual'
  target_node?: string
  target_connection?: string
  hint_text: string
  reveal_level: 1 | 2 | 3 // progressive revelation
  cost: number // points deducted
}

export class InferenceDetector {
  /**
   * Generate inference map from Logic Game question and classification
   */
  static generateInferenceMap(
    question: LogicGameQuestion,
    classification: GameClassification
  ): InferenceMap {
    const rules = this.extractRules(question)
    const constraints = this.identifyConstraints(question, classification)
    const baseInferences = this.identifyBaseInferences(rules, constraints)
    const advancedInferences = this.generateAdvancedInferences(baseInferences, classification)

    const nodes = this.createInferenceNodes(rules, constraints, baseInferences, advancedInferences)
    const connections = this.buildInferenceConnections(nodes, classification)

    return {
      id: `inference-map-${question.id}`,
      question_id: question.id,
      title: this.generateMapTitle(classification),
      description: this.generateMapDescription(classification),
      nodes,
      connections,
      learning_objectives: this.generateLearningObjectives(classification),
      difficulty_level: this.determineDifficultyLevel(classification),
      estimated_duration: this.estimateTrainingDuration(nodes, connections),
      success_criteria: this.defineSuccessCriteria(nodes, connections, classification)
    }
  }

  /**
   * Extract explicit rules from game setup
   */
  private static extractRules(question: LogicGameQuestion): InferenceNode[] {
    const rules: InferenceNode[] = []
    const position = { x: 50, y: 50 }

    // Check if stimulus exists to prevent hydration errors
    if (!question.stimulus || typeof question.stimulus !== 'string') {
      return rules
    }

    // Parse rules from setup text
    const rulePatterns = [
      /If (.+?), then (.+?)[.!]/gi,
      /(.+?) cannot be (.+?)[.!]/gi,
      /(.+?) must be (.+?)[.!]/gi,
      /Either (.+?) or (.+?)[.!]/gi,
      /(.+?) is immediately (.+?)[.!]/gi
    ]

    rulePatterns.forEach((pattern, index) => {
      const matches = question.stimulus.matchAll(pattern)
      for (const match of matches) {
        rules.push({
          id: `rule-${rules.length + 1}`,
          type: 'rule',
          title: `Rule ${rules.length + 1}`,
          content: match[0].replace(/[.!]$/, ''),
          confidence: 1.0,
          difficulty: 1,
          position: { x: position.x, y: position.y },
          dependencies: [],
          reasoning_pattern: this.identifyReasoningPattern(match[0]),
          teaching_note: `This is an explicit rule from the game setup.`
        })
        position.y += 120
      }
    })

    return rules
  }

  /**
   * Identify constraints and limitations
   */
  private static identifyConstraints(
    question: LogicGameQuestion,
    classification: GameClassification
  ): InferenceNode[] {
    const constraints: InferenceNode[] = []
    const position = { x: 300, y: 50 }

    // Check if stimulus exists to prevent hydration errors
    if (!question.stimulus || typeof question.stimulus !== 'string') {
      return constraints
    }

    // Identify typical constraint patterns based on game type
    const constraintPatterns = classification?.category === 'sequencing' ? [
      'exactly one person',
      'no more than',
      'at least',
      'cannot be adjacent',
      'must be consecutive'
    ] : [
      'exactly',
      'cannot be in the same',
      'must include',
      'excludes',
      'requires'
    ]

    constraintPatterns.forEach((pattern, index) => {
      if (question.stimulus.toLowerCase().includes(pattern)) {
        constraints.push({
          id: `constraint-${constraints.length + 1}`,
          type: 'constraint',
          title: `Constraint ${constraints.length + 1}`,
          content: `Limitation: ${pattern}`,
          confidence: 0.9,
          difficulty: 2,
          position: { x: position.x, y: position.y },
          dependencies: [],
          reasoning_pattern: 'exclusion',
          teaching_note: `This constraint limits possible arrangements.`
        })
        position.y += 120
      }
    })

    return constraints
  }

  /**
   * Identify basic inferences from rules and constraints
   */
  private static identifyBaseInferences(
    rules: InferenceNode[],
    constraints: InferenceNode[]
  ): InferenceNode[] {
    const inferences: InferenceNode[] = []
    const position = { x: 550, y: 50 }

    // Generate contrapositives for conditional rules
    rules.filter(rule => rule.reasoning_pattern === 'conditional').forEach(rule => {
      const contrapositive = this.generateContrapositive(rule)
      if (contrapositive) {
        inferences.push({
          id: `inference-${inferences.length + 1}`,
          type: 'inference',
          title: `Contrapositive of ${rule.title}`,
          content: contrapositive,
          confidence: 0.95,
          difficulty: 3,
          position: { x: position.x, y: position.y },
          dependencies: [rule.id],
          reasoning_pattern: 'contrapositive',
          teaching_note: `If A → B, then ¬B → ¬A`
        })
        position.y += 120
      }
    })

    // Generate block inferences for sequencing games
    rules.filter(rule => rule.reasoning_pattern === 'block').forEach(rule => {
      inferences.push({
        id: `inference-${inferences.length + 1}`,
        type: 'inference',
        title: `Block Formation`,
        content: `Elements must form a connected block`,
        confidence: 0.85,
        difficulty: 2,
        position: { x: position.x, y: position.y },
        dependencies: [rule.id],
        reasoning_pattern: 'block',
        teaching_note: `Adjacent elements create placement constraints`
      })
      position.y += 120
    })

    return inferences
  }

  /**
   * Generate advanced inferences through logical deduction
   */
  private static generateAdvancedInferences(
    baseInferences: InferenceNode[],
    classification: GameClassification
  ): InferenceNode[] {
    const advanced: InferenceNode[] = []
    const position = { x: 800, y: 50 }

    // Chain inferences for complex deductions
    if (baseInferences.length >= 2) {
      advanced.push({
        id: `deduction-1`,
        type: 'deduction',
        title: `Chain Deduction`,
        content: `Combining multiple rules leads to new constraints`,
        confidence: 0.7,
        difficulty: 4,
        position: { x: position.x, y: position.y },
        dependencies: baseInferences.slice(0, 2).map(inf => inf.id),
        reasoning_pattern: 'sequence',
        teaching_note: `Advanced students can chain inferences together`
      })
      position.y += 120
    }

    // Contradiction detection
    advanced.push({
      id: `contradiction-detector`,
      type: 'contradiction',
      title: `Impossibility Check`,
      content: `This combination would create a contradiction`,
      confidence: 0.8,
      difficulty: 5,
      position: { x: position.x, y: position.y },
      dependencies: [],
      reasoning_pattern: 'exclusion',
      teaching_note: `Look for scenarios that violate multiple rules`
    })

    return advanced
  }

  /**
   * Create positioned nodes for visualization
   */
  private static createInferenceNodes(
    rules: InferenceNode[],
    constraints: InferenceNode[],
    baseInferences: InferenceNode[],
    advancedInferences: InferenceNode[]
  ): InferenceNode[] {
    return [...rules, ...constraints, ...baseInferences, ...advancedInferences]
  }

  /**
   * Build connections between inference nodes
   */
  private static buildInferenceConnections(
    nodes: InferenceNode[],
    classification: GameClassification
  ): InferenceConnection[] {
    const connections: InferenceConnection[] = []

    // Connect rules to their inferences
    nodes.forEach(node => {
      node.dependencies.forEach(depId => {
        connections.push({
          id: `connection-${connections.length + 1}`,
          source: depId,
          target: node.id,
          type: 'leads_to',
          strength: 4,
          reasoning: `Direct logical connection`,
          animated: true,
          style: {
            stroke: '#3b82f6',
            strokeWidth: 2
          }
        })
      })
    })

    // Add blocking relationships
    const contradictions = nodes.filter(n => n.type === 'contradiction')
    contradictions.forEach(contradiction => {
      const rules = nodes.filter(n => n.type === 'rule').slice(0, 2)
      rules.forEach(rule => {
        connections.push({
          id: `block-${connections.length + 1}`,
          source: rule.id,
          target: contradiction.id,
          type: 'contradicts',
          strength: 5,
          reasoning: `This rule creates a contradiction`,
          style: {
            stroke: '#ef4444',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          }
        })
      })
    })

    return connections
  }

  /**
   * Generate training hints for guided discovery
   */
  static generateHints(session: InferenceTrainingSession): TrainingHint[] {
    const hints: TrainingHint[] = []
    const { map, discovered_nodes, discovered_connections } = session

    // Find next logical node to discover
    const undiscoveredNodes = map.nodes.filter(node =>
      !discovered_nodes.includes(node.id) &&
      node.dependencies.every(dep => discovered_nodes.includes(dep))
    )

    if (undiscoveredNodes.length > 0) {
      const nextNode = undiscoveredNodes.reduce((prev, curr) =>
        prev.difficulty <= curr.difficulty ? prev : curr
      )

      hints.push({
        id: `hint-node-${nextNode.id}`,
        type: 'directional',
        target_node: nextNode.id,
        hint_text: `Look for ${nextNode.reasoning_pattern} patterns in the rules`,
        reveal_level: 1,
        cost: 5
      })

      hints.push({
        id: `hint-node-detail-${nextNode.id}`,
        type: 'conceptual',
        target_node: nextNode.id,
        hint_text: nextNode.teaching_note || 'Consider the logical implications',
        reveal_level: 2,
        cost: 10
      })

      hints.push({
        id: `hint-node-reveal-${nextNode.id}`,
        type: 'visual',
        target_node: nextNode.id,
        hint_text: `The answer is: ${nextNode.content}`,
        reveal_level: 3,
        cost: 20
      })
    }

    return hints
  }

  /**
   * Validate student inference discovery
   */
  static validateInference(
    session: InferenceTrainingSession,
    proposedInference: string,
    reasoning: string
  ): { valid: boolean; feedback: string; matchedNode?: InferenceNode } {
    const { map } = session

    // Find matching node by content similarity
    const matchedNode = map.nodes.find(node => {
      const similarity = this.calculateSimilarity(proposedInference, node.content)
      return similarity > 0.7
    })

    if (matchedNode) {
      return {
        valid: true,
        feedback: `Excellent! You discovered: ${matchedNode.title}. ${matchedNode.teaching_note}`,
        matchedNode
      }
    }

    // Analyze the reasoning for partial credit
    if (reasoning.length > 20) {
      return {
        valid: false,
        feedback: `Good reasoning, but check if this inference is complete and necessary.`
      }
    }

    return {
      valid: false,
      feedback: `This inference doesn't match the expected logical conclusions. Try focusing on the direct implications of the rules.`
    }
  }

  // Helper methods
  private static identifyReasoningPattern(ruleText: string): InferenceNode['reasoning_pattern'] {
    if (ruleText.toLowerCase().includes('if') && ruleText.toLowerCase().includes('then')) {
      return 'conditional'
    }
    if (ruleText.toLowerCase().includes('adjacent') || ruleText.toLowerCase().includes('consecutive')) {
      return 'block'
    }
    if (ruleText.toLowerCase().includes('cannot') || ruleText.toLowerCase().includes('must not')) {
      return 'exclusion'
    }
    if (ruleText.toLowerCase().includes('before') || ruleText.toLowerCase().includes('after')) {
      return 'sequence'
    }
    return 'grouping'
  }

  private static generateContrapositive(rule: InferenceNode): string | null {
    if (rule.reasoning_pattern !== 'conditional') return null

    const ruleText = rule.content.toLowerCase()
    if (ruleText.includes('if') && ruleText.includes('then')) {
      // This is a simplified contrapositive generator
      return `Contrapositive: If not [consequence], then not [condition]`
    }

    return null
  }

  private static generateMapTitle(classification: GameClassification): string {
    const category = classification?.category || 'Unknown'
    return `${category.toUpperCase()}: Inference Detection Training`
  }

  private static generateMapDescription(classification: GameClassification): string {
    const category = classification?.category || 'unknown'
    return `Master logical reasoning in ${category} games through guided inference discovery`
  }

  private static generateLearningObjectives(classification: GameClassification): string[] {
    const baseObjectives = [
      'Identify explicit rules and constraints',
      'Generate logical inferences from given information',
      'Recognize contrapositive relationships'
    ]

    const typeSpecific = classification?.category === 'sequencing' ? [
      'Understand ordering and adjacency constraints',
      'Identify block formations and their implications'
    ] : [
      'Recognize grouping patterns and limitations',
      'Understand inclusion/exclusion relationships'
    ]

    return [...baseObjectives, ...typeSpecific]
  }

  private static determineDifficultyLevel(classification: GameClassification): 'beginner' | 'intermediate' | 'advanced' {
    if (classification.complexity_score <= 3) return 'beginner'
    if (classification.complexity_score <= 7) return 'intermediate'
    return 'advanced'
  }

  private static estimateTrainingDuration(nodes: InferenceNode[], connections: InferenceConnection[]): number {
    const baseTime = 3 // minutes
    const nodeTime = nodes.length * 0.5
    const connectionTime = connections.length * 0.3
    return Math.round(baseTime + nodeTime + connectionTime)
  }

  private static defineSuccessCriteria(
    nodes: InferenceNode[],
    connections: InferenceConnection[],
    classification: GameClassification
  ) {
    return {
      min_inferences_found: Math.ceil(nodes.filter(n => n.type === 'inference').length * 0.7),
      min_connections_made: Math.ceil(connections.length * 0.6),
      max_hints_allowed: Math.floor(nodes.length * 0.4)
    }
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation - in production, use more sophisticated matching
    const words1 = str1.toLowerCase().split(' ')
    const words2 = str2.toLowerCase().split(' ')
    const intersection = words1.filter(word => words2.includes(word))
    return intersection.length / Math.max(words1.length, words2.length)
  }
}