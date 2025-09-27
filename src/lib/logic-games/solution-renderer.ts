/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Solution Walkthrough Renderer Service
 *
 * Generates step-by-step educational walkthroughs for Logic Games
 * Based on Reactour patterns with educational enhancements
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - AI Specialist + Architect Winston
 * @created 2025-01-20
 */

import type {
  LogicGameQuestion,
  GameBoardState,
  UserAction,
  SolutionStep
} from '@/types/logic-games'
import type { GameClassification } from './game-categorizer'

export type WalkthroughStepType =
  | 'observation'
  | 'deduction'
  | 'placement'
  | 'validation'
  | 'insight'
  | 'inference'
  | 'elimination'

export type ConceptType =
  | 'rule_application'
  | 'inference_chain'
  | 'constraint_satisfaction'
  | 'elimination'
  | 'pattern_recognition'

export interface WalkthroughStep {
  step_number: number
  step_type: WalkthroughStepType

  // Educational content
  title: string
  explanation: string
  learning_objective: string

  // Visual guidance
  selector?: string // CSS selector for tour highlight
  visual_cues: VisualCue[]

  // Interactive elements
  board_state_before?: Partial<GameBoardState>
  board_state_after?: Partial<GameBoardState>
  user_actions_suggested: UserAction[]

  // Learning connections
  connects_to_rule: string[] // Rule IDs this step demonstrates
  demonstrates_concept: ConceptType[]
  builds_on_step: number[] // Previous steps this relies on
  enables_step: number[] // Future steps this unlocks

  // Educational enhancements
  key_insight: string
  common_mistakes: string[]
  teaching_tip: string
  transfer_learning: string // How this applies to other games

  // Interactive elements for Reactour
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center'
  action?: (elem: Element | null) => void
  actionAfter?: (elem: Element | null) => void
}

export interface VisualCue {
  type: 'highlight' | 'arrow' | 'circle' | 'annotation' | 'focus'
  target: string // CSS selector or entity ID
  message?: string
  color?: string
  animation?: 'pulse' | 'glow' | 'fade' | 'bounce'
}

export interface SolutionWalkthrough {
  id: string
  game_id: string
  walkthrough_type: 'setup' | 'inference' | 'question_specific'

  // Core content
  title: string
  description: string
  steps: WalkthroughStep[]

  // Educational metadata
  prerequisites: string[] // Required knowledge/concepts
  learning_objectives: string[]
  estimated_duration: number // seconds
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'

  // Connections and flow
  concept_connections: ConceptConnection[]
  skill_progression: SkillLevel[]
}

export interface ConceptConnection {
  from_step: number
  to_step: number
  concept_type: ConceptType
  connection_explanation: string
  reinforcement_value: number // 1-5 importance
}

export interface SkillLevel {
  skill_name: string
  level: 'foundation' | 'building' | 'mastery'
  steps_involved: number[]
}

export class SolutionRenderer {
  /**
   * Generate comprehensive walkthrough based on game analysis
   */
  static generateWalkthrough(
    question: LogicGameQuestion,
    classification: GameClassification,
    walkthroughType: 'setup' | 'inference' | 'question_specific' = 'setup'
  ): SolutionWalkthrough {

    const steps = this.generateSteps(question, classification, walkthroughType)
    const connections = this.buildConceptConnections(steps)

    return {
      id: `walkthrough_${question.id}_${walkthroughType}`,
      game_id: question.id,
      walkthrough_type: walkthroughType,

      title: this.generateTitle(question, classification, walkthroughType),
      description: this.generateDescription(classification, walkthroughType),
      steps,

      prerequisites: this.identifyPrerequisites(classification),
      learning_objectives: this.generateLearningObjectives(classification, walkthroughType),
      estimated_duration: this.estimateDuration(steps, classification.complexity_score),
      difficulty_level: this.mapDifficultyLevel(classification.complexity_score),

      concept_connections: connections,
      skill_progression: this.buildSkillProgression(steps)
    }
  }

  /**
   * Generate educational steps based on game type and complexity
   */
  private static generateSteps(
    question: LogicGameQuestion,
    classification: GameClassification,
    walkthroughType: string
  ): WalkthroughStep[] {

    const steps: WalkthroughStep[] = []

    // Step 1: Game Analysis and Setup
    steps.push({
      step_number: 1,
      step_type: 'observation',
      title: 'Analyze the Game Type',
      explanation: `This is a ${classification.primary_category} game with ${classification.subcategory.replace(/_/g, ' ')} structure. ${classification.recommended_approach.split('.')[0]}.`,
      learning_objective: 'Identify game type and choose appropriate diagramming strategy',
      selector: '.game-category-indicator',
      visual_cues: [
        {
          type: 'highlight',
          target: '.game-category-indicator',
          message: 'Notice the game type classification',
          color: '#3b82f6'
        }
      ],
      user_actions_suggested: [],
      connects_to_rule: [],
      demonstrates_concept: ['pattern_recognition'],
      builds_on_step: [],
      enables_step: [2],
      key_insight: `${classification.primary_category} games require ${this.getKeyStrategy(classification.primary_category)} as the foundation.`,
      common_mistakes: ['Rushing into rules without understanding the game type', 'Using wrong diagramming approach'],
      teaching_tip: 'Always identify the game type first - it determines your entire strategy.',
      transfer_learning: `This pattern recognition skill applies to all ${classification.primary_category} games you'll encounter.`,
      position: 'bottom'
    })

    // Step 2: Create Base Diagram
    steps.push({
      step_number: 2,
      step_type: 'placement',
      title: 'Set Up Your Diagram',
      explanation: `Create your ${classification.primary_category === 'sequencing' ? 'linear arrangement' : classification.primary_category === 'grouping' ? 'group containers' : 'matching grid'} to track entity relationships.`,
      learning_objective: 'Establish proper diagrammatic foundation for the game',
      selector: '.game-layout',
      visual_cues: [
        {
          type: 'focus',
          target: '.positions-grid',
          message: 'This is where you\'ll track entity positions',
          animation: 'pulse'
        }
      ],
      user_actions_suggested: [{
        timestamp: new Date().toISOString(),
        action_type: 'board_setup',
        details: 'Prepare diagram structure'
      }],
      connects_to_rule: [],
      demonstrates_concept: ['constraint_satisfaction'],
      builds_on_step: [1],
      enables_step: [3],
      key_insight: 'A clear diagram is essential - it becomes your thinking tool.',
      common_mistakes: ['Making diagram too small', 'Not labeling positions clearly'],
      teaching_tip: 'Leave space for annotations and notes around your diagram.',
      transfer_learning: 'Proper diagramming skills transfer to all Logic Games types.'
    })

    // Add rule-specific steps
    question.game_rules.forEach((rule, index) => {
      const stepNumber = 3 + index
      steps.push({
        step_number: stepNumber,
        step_type: 'deduction',
        title: `Apply Rule ${index + 1}: ${this.getRuleTypeLabel(rule.rule_type)}`,
        explanation: this.explainRuleApplication(rule, classification),
        learning_objective: `Understand how ${rule.rule_type} constraints affect the game`,
        selector: `.rule-${index + 1}`,
        visual_cues: [
          {
            type: 'highlight',
            target: `[data-rule-id="${rule.id}"]`,
            message: `Focus on this ${rule.rule_type} rule`,
            color: this.getRuleColor(rule.rule_type)
          }
        ],
        user_actions_suggested: [],
        connects_to_rule: [rule.id],
        demonstrates_concept: ['rule_application'],
        builds_on_step: [2],
        enables_step: [stepNumber + 1],
        key_insight: this.getRuleInsight(rule, classification),
        common_mistakes: this.getRuleCommonMistakes(rule.rule_type),
        teaching_tip: this.getRuleTeachingTip(rule.rule_type),
        transfer_learning: this.getRuleTransferLearning(rule.rule_type),
        position: 'right'
      })
    })

    // Add inference step
    const inferenceStepNumber = 3 + question.game_rules.length
    steps.push({
      step_number: inferenceStepNumber,
      step_type: 'inference',
      title: 'Make Key Inferences',
      explanation: 'Now combine the rules to see what must be true. Look for forced placements and impossible positions.',
      learning_objective: 'Develop inference skills by combining multiple constraints',
      selector: '.game-board',
      visual_cues: [
        {
          type: 'circle',
          target: '.positions-grid',
          message: 'Look for forced placements and eliminations',
          animation: 'glow'
        }
      ],
      user_actions_suggested: [],
      connects_to_rule: question.game_rules.map(r => r.id),
      demonstrates_concept: ['inference_chain'],
      builds_on_step: Array.from({ length: question.game_rules.length }, (_, i) => 3 + i),
      enables_step: [inferenceStepNumber + 1],
      key_insight: 'Inferences are where the real solving happens - they eliminate possibilities.',
      common_mistakes: ['Missing key inferences', 'Making invalid deductions'],
      teaching_tip: 'Always ask: "What MUST be true?" not just "What COULD be true?"',
      transfer_learning: 'Inference skills are the core of logical reasoning in any context.',
      position: 'center'
    })

    return steps
  }

  /**
   * Build connections between concepts across steps
   */
  private static buildConceptConnections(steps: WalkthroughStep[]): ConceptConnection[] {
    const connections: ConceptConnection[] = []

    steps.forEach((step, index) => {
      step.enables_step.forEach(enabledStep => {
        if (enabledStep <= steps.length) {
          const targetStep = steps[enabledStep - 1]
          const sharedConcepts = step.demonstrates_concept.filter(c =>
            targetStep.demonstrates_concept.includes(c)
          )

          sharedConcepts.forEach(concept => {
            connections.push({
              from_step: step.step_number,
              to_step: enabledStep,
              concept_type: concept,
              connection_explanation: `Step ${step.step_number} establishes ${concept} foundations needed for Step ${enabledStep}`,
              reinforcement_value: this.calculateReinforcementValue(concept, step.step_type)
            })
          })
        }
      })
    })

    return connections
  }

  // Helper methods
  private static generateTitle(
    question: LogicGameQuestion,
    classification: GameClassification,
    type: string
  ): string {
    const typeLabels = {
      'setup': 'Game Setup Walkthrough',
      'inference': 'Inference Training',
      'question_specific': 'Question Solution'
    }
    return `${classification.primary_category.toUpperCase()}: ${typeLabels[type]}`
  }

  private static generateDescription(classification: GameClassification, type: string): string {
    return `Learn to solve ${classification.primary_category} games step-by-step. This walkthrough will guide you through ${type === 'setup' ? 'setting up your diagram and applying rules' : type === 'inference' ? 'making key inferences' : 'solving this specific question'}.`
  }

  private static identifyPrerequisites(classification: GameClassification): string[] {
    const basePrereqs = ['Basic Logic Games concepts', 'Diagramming fundamentals']

    if (classification.primary_category === 'sequencing') {
      basePrereqs.push('Understanding of ordering relationships')
    } else if (classification.primary_category === 'grouping') {
      basePrereqs.push('Set theory basics', 'Group membership rules')
    } else if (classification.primary_category === 'matching') {
      basePrereqs.push('One-to-one correspondence', 'Attribute assignment')
    }

    return basePrereqs
  }

  private static generateLearningObjectives(
    classification: GameClassification,
    type: string
  ): string[] {
    const objectives = [
      `Master ${classification.primary_category} game solving techniques`,
      'Develop systematic approach to rule application',
      'Build inference detection skills'
    ]

    if (type === 'setup') {
      objectives.push('Create effective diagrams', 'Apply rules systematically')
    } else if (type === 'inference') {
      objectives.push('Identify forced placements', 'Make valid deductions')
    }

    return objectives
  }

  private static estimateDuration(steps: WalkthroughStep[], complexity: number): number {
    const baseTime = 60 // 1 minute per step
    const complexityMultiplier = 1 + (complexity - 5) * 0.1
    return Math.round(steps.length * baseTime * complexityMultiplier)
  }

  private static mapDifficultyLevel(complexity: number): 'beginner' | 'intermediate' | 'advanced' {
    if (complexity <= 4) return 'beginner'
    if (complexity <= 7) return 'intermediate'
    return 'advanced'
  }

  private static buildSkillProgression(steps: WalkthroughStep[]): SkillLevel[] {
    return [
      {
        skill_name: 'Game Analysis',
        level: 'foundation',
        steps_involved: [1, 2]
      },
      {
        skill_name: 'Rule Application',
        level: 'building',
        steps_involved: steps.filter(s => s.step_type === 'deduction').map(s => s.step_number)
      },
      {
        skill_name: 'Inference Making',
        level: 'mastery',
        steps_involved: steps.filter(s => s.step_type === 'inference').map(s => s.step_number)
      }
    ]
  }

  private static getKeyStrategy(category: string): string {
    const strategies = {
      sequencing: 'linear or circular ordering',
      grouping: 'group membership tracking',
      matching: 'attribute assignment grids',
      hybrid: 'multi-modal diagramming'
    }
    return strategies[category] || 'systematic diagramming'
  }

  private static getRuleTypeLabel(ruleType: string): string {
    const labels = {
      conditional: 'Conditional Rule',
      adjacency: 'Adjacency Constraint',
      sequence: 'Ordering Rule',
      exclusion: 'Exclusion Rule',
      grouping: 'Grouping Rule',
      matching: 'Assignment Rule'
    }
    return labels[ruleType] || 'Game Rule'
  }

  private static getRuleColor(ruleType: string): string {
    const colors = {
      conditional: '#3b82f6', // blue
      adjacency: '#10b981',   // green
      sequence: '#f59e0b',    // orange
      exclusion: '#ef4444',   // red
      grouping: '#8b5cf6',    // purple
      matching: '#06b6d4'     // cyan
    }
    return colors[ruleType] || '#6b7280'
  }

  private static explainRuleApplication(rule: any, classification: GameClassification): string {
    // Generate context-aware explanation based on rule type and game category
    return `In ${classification.primary_category} games, ${rule.rule_type} rules like "${rule.rule_text}" ${this.getRuleApplicationStrategy(rule.rule_type, classification.primary_category)}.`
  }

  private static getRuleApplicationStrategy(ruleType: string, gameCategory: string): string {
    const strategies = {
      conditional: 'create if-then relationships that constrain possibilities',
      adjacency: 'form blocks that move together as units',
      sequence: 'establish relative ordering that limits arrangements',
      exclusion: 'eliminate specific positions to narrow possibilities'
    }
    return strategies[ruleType] || 'constrain the solution space'
  }

  private static getRuleInsight(rule: any, classification: GameClassification): string {
    return `This ${rule.rule_type} rule is ${rule.difficulty_contribution >= 3 ? 'highly constraining' : 'moderately constraining'} and will significantly impact your solution strategy.`
  }

  private static getRuleCommonMistakes(ruleType: string): string[] {
    const mistakes = {
      conditional: ['Confusing necessary vs sufficient conditions', 'Missing contrapositive implications'],
      adjacency: ['Forgetting blocks can flip order', 'Not tracking block as single unit'],
      sequence: ['Mixing up "before/after" directions', 'Missing indirect orderings'],
      exclusion: ['Forgetting to apply exclusion consistently', 'Missing elimination opportunities']
    }
    return mistakes[ruleType] || ['Misapplying rule logic', 'Missing rule interactions']
  }

  private static getRuleTeachingTip(ruleType: string): string {
    const tips = {
      conditional: 'Draw arrows to show the logical flow from condition to consequence.',
      adjacency: 'Circle or box adjacent entities to remember they\'re a unit.',
      sequence: 'Use > or < symbols to show ordering relationships clearly.',
      exclusion: 'Mark excluded positions with X to avoid placement errors.'
    }
    return tips[ruleType] || 'Mark this rule clearly in your diagram.'
  }

  private static getRuleTransferLearning(ruleType: string): string {
    return `${ruleType.charAt(0).toUpperCase() + ruleType.slice(1)} rules appear in many Logic Games - mastering this pattern will help across multiple games.`
  }

  private static calculateReinforcementValue(concept: ConceptType, stepType: WalkthroughStepType): number {
    // Higher values for core concepts and critical steps
    const conceptWeights = {
      rule_application: 4,
      inference_chain: 5,
      constraint_satisfaction: 3,
      elimination: 3,
      pattern_recognition: 4
    }

    const stepWeights = {
      observation: 2,
      deduction: 4,
      placement: 3,
      validation: 2,
      insight: 5,
      inference: 5,
      elimination: 4
    }

    return Math.min(5, Math.round((conceptWeights[concept] + stepWeights[stepType]) / 2))
  }
}

// Export utility function
export function generateWalkthrough(
  question: LogicGameQuestion,
  classification: GameClassification,
  type: 'setup' | 'inference' | 'question_specific' = 'setup'
): SolutionWalkthrough {
  return SolutionRenderer.generateWalkthrough(question, classification, type)
}