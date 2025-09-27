/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Game Type Categorization Service
 *
 * Classifies and analyzes logic game types with pattern recognition
 *
 * @epic Epic 3: Advanced Learning Features
 * @author BMad Team - Winston (Architect) + Marcus (Dev)
 * @created 2025-01-20
 */

import type { LogicGameQuestion } from '@/types/logic-games'

export type GameCategory = 'sequencing' | 'grouping' | 'matching' | 'hybrid'
export type GameSubcategory =
  | 'linear_ordering'
  | 'circular_ordering'
  | 'relative_ordering'
  | 'in_out_grouping'
  | 'distribution'
  | 'selection'
  | 'matching_attributes'
  | 'matching_assignments'
  | 'complex_hybrid'

export interface GameClassification {
  primary_category: GameCategory
  subcategory: GameSubcategory
  complexity_score: number // 1-10
  key_features: string[]
  recommended_approach: string
  common_patterns: GamePattern[]
  estimated_time: number // in seconds
}

export interface GamePattern {
  pattern_type: 'block' | 'conditional' | 'biconditional' | 'exclusion' | 'forced_placement'
  description: string
  frequency: 'common' | 'occasional' | 'rare'
  difficulty_impact: number // 1-5
}

export class GameCategorizer {
  /**
   * Analyze and classify a logic game based on its structure
   */
  static classify(question: LogicGameQuestion): GameClassification {
    const category = this.determineCategory(question)
    const subcategory = this.determineSubcategory(question, category)
    const patterns = this.identifyPatterns(question)
    const complexity = this.calculateComplexity(question, patterns)

    return {
      primary_category: category,
      subcategory,
      complexity_score: complexity,
      key_features: this.extractKeyFeatures(question),
      recommended_approach: this.getRecommendedApproach(category, subcategory, patterns),
      common_patterns: patterns,
      estimated_time: this.estimateTime(complexity, category)
    }
  }

  /**
   * Determine primary game category based on game structure
   */
  private static determineCategory(question: LogicGameQuestion): GameCategory {
    const { game_type, game_rules, game_setup } = question

    // Check for hybrid characteristics first
    const hasSequencing = this.hasSequencingElements(question)
    const hasGrouping = this.hasGroupingElements(question)
    const hasMatching = this.hasMatchingElements(question)

    const categoryCount = [hasSequencing, hasGrouping, hasMatching].filter(Boolean).length

    if (categoryCount > 1) {
      return 'hybrid'
    }

    // Primary categorization
    if (game_type === 'sequencing' || hasSequencing) {
      return 'sequencing'
    }

    if (game_type === 'grouping' || hasGrouping) {
      return 'grouping'
    }

    if (game_type === 'matching' || hasMatching) {
      return 'matching'
    }

    // Default to most common type
    return 'sequencing'
  }

  /**
   * Determine subcategory based on specific game characteristics
   */
  private static determineSubcategory(
    question: LogicGameQuestion,
    category: GameCategory
  ): GameSubcategory {
    const { game_subtype, game_board_config, game_setup } = question

    switch (category) {
      case 'sequencing':
        if (game_board_config.board_type === 'circular_table') {
          return 'circular_ordering'
        }
        if (game_subtype === 'linear_ordering') {
          return 'linear_ordering'
        }
        if (this.hasRelativeOrderingRules(question)) {
          return 'relative_ordering'
        }
        return 'linear_ordering'

      case 'grouping':
        if (game_subtype === 'in_out') {
          return 'in_out_grouping'
        }
        if (game_subtype === 'distribution') {
          return 'distribution'
        }
        if (this.hasSelectionConstraints(question)) {
          return 'selection'
        }
        return 'in_out_grouping'

      case 'matching':
        if (game_subtype === 'attributes') {
          return 'matching_attributes'
        }
        return 'matching_assignments'

      case 'hybrid':
        return 'complex_hybrid'

      default:
        return 'linear_ordering'
    }
  }

  /**
   * Identify common patterns in the game rules
   */
  private static identifyPatterns(question: LogicGameQuestion): GamePattern[] {
    const patterns: GamePattern[] = []
    const { game_rules } = question

    game_rules.forEach(rule => {
      // Block patterns (adjacent entities)
      if (rule.rule_type === 'adjacency') {
        patterns.push({
          pattern_type: 'block',
          description: `${rule.logical_structure.entities_involved.join(' and ')} form a block`,
          frequency: 'common',
          difficulty_impact: 2
        })
      }

      // Conditional patterns
      if (rule.rule_type === 'conditional') {
        patterns.push({
          pattern_type: 'conditional',
          description: rule.rule_text,
          frequency: 'common',
          difficulty_impact: 3
        })
      }

      // Exclusion patterns
      if (rule.rule_type === 'exclusion') {
        patterns.push({
          pattern_type: 'exclusion',
          description: rule.rule_text,
          frequency: 'occasional',
          difficulty_impact: 1
        })
      }

      // Forced placement patterns
      if (rule.logical_structure.logical_operator === 'must') {
        patterns.push({
          pattern_type: 'forced_placement',
          description: rule.rule_text,
          frequency: 'occasional',
          difficulty_impact: 2
        })
      }
    })

    return patterns
  }

  /**
   * Calculate game complexity score
   */
  private static calculateComplexity(
    question: LogicGameQuestion,
    patterns: GamePattern[]
  ): number {
    let complexity = question.difficulty || 5

    // Adjust based on number of entities
    const entityCount = question.game_setup.entities.length
    if (entityCount > 7) complexity += 1
    if (entityCount > 9) complexity += 1

    // Adjust based on rule count
    const ruleCount = question.game_rules.length
    if (ruleCount > 5) complexity += 1
    if (ruleCount > 7) complexity += 1

    // Adjust based on pattern difficulty
    const avgPatternDifficulty = patterns.reduce((sum, p) => sum + p.difficulty_impact, 0) /
      (patterns.length || 1)
    complexity += Math.floor(avgPatternDifficulty / 2)

    // Cap at 10
    return Math.min(10, Math.max(1, Math.round(complexity)))
  }

  /**
   * Extract key features for display
   */
  private static extractKeyFeatures(question: LogicGameQuestion): string[] {
    const features: string[] = []

    // Entity count
    features.push(`${question.game_setup.entities.length} entities`)

    // Position count
    features.push(`${question.game_setup.positions.length} positions`)

    // Rule types
    const ruleTypes = new Set(question.game_rules.map(r => r.rule_type))
    ruleTypes.forEach(type => {
      features.push(`Has ${type} rules`)
    })

    // Board type
    if (question.game_board_config.board_type !== 'linear_sequence') {
      features.push(`${question.game_board_config.board_type.replace('_', ' ')} layout`)
    }

    return features
  }

  /**
   * Get recommended approach based on game analysis
   */
  private static getRecommendedApproach(
    category: GameCategory,
    subcategory: GameSubcategory,
    patterns: GamePattern[]
  ): string {
    const hasBlocks = patterns.some(p => p.pattern_type === 'block')
    const hasForced = patterns.some(p => p.pattern_type === 'forced_placement')

    let approach = 'Start by identifying the game type and creating a clear diagram. '

    switch (category) {
      case 'sequencing':
        approach += 'Draw a linear or circular diagram with numbered positions. '
        if (hasBlocks) {
          approach += 'Identify and mark entity blocks that must stay together. '
        }
        if (hasForced) {
          approach += 'Place forced entities first to constrain the solution space. '
        }
        approach += 'Work through relative positioning rules systematically.'
        break

      case 'grouping':
        approach += 'Create separate group containers and track capacity limits. '
        approach += 'Mark required inclusions/exclusions clearly. '
        if (subcategory === 'in_out_grouping') {
          approach += 'Focus on the "in" group constraints first. '
        }
        break

      case 'matching':
        approach += 'Create a grid or table to track attribute assignments. '
        approach += 'Mark impossible combinations with X marks. '
        break

      case 'hybrid':
        approach += 'Break down the game into its component types. '
        approach += 'Handle the most constraining element first. '
        break
    }

    approach += ' Make key inferences before attempting questions.'
    return approach
  }

  /**
   * Estimate time needed based on complexity
   */
  private static estimateTime(complexity: number, category: GameCategory): number {
    // Base time in seconds
    let baseTime = 420 // 7 minutes

    // Adjust for complexity
    baseTime += (complexity - 5) * 30

    // Adjust for category
    if (category === 'hybrid') {
      baseTime += 60
    }
    if (category === 'matching') {
      baseTime += 30
    }

    return Math.max(300, Math.min(600, baseTime)) // 5-10 minutes range
  }

  // Helper methods for category detection
  private static hasSequencingElements(question: LogicGameQuestion): boolean {
    return question.game_rules.some(rule =>
      rule.rule_type === 'sequence' ||
      rule.rule_type === 'adjacency' ||
      rule.rule_text.toLowerCase().includes('before') ||
      rule.rule_text.toLowerCase().includes('after') ||
      rule.rule_text.toLowerCase().includes('next to')
    )
  }

  private static hasGroupingElements(question: LogicGameQuestion): boolean {
    return question.game_rules.some(rule =>
      rule.rule_type === 'grouping' ||
      rule.rule_text.toLowerCase().includes('group') ||
      rule.rule_text.toLowerCase().includes('team') ||
      rule.rule_text.toLowerCase().includes('select')
    )
  }

  private static hasMatchingElements(question: LogicGameQuestion): boolean {
    return question.game_rules.some(rule =>
      rule.rule_type === 'matching' ||
      rule.rule_text.toLowerCase().includes('assign') ||
      rule.rule_text.toLowerCase().includes('match') ||
      rule.rule_text.toLowerCase().includes('correspond')
    )
  }

  private static hasRelativeOrderingRules(question: LogicGameQuestion): boolean {
    return question.game_rules.filter(rule =>
      rule.rule_type === 'sequence' &&
      !rule.logical_structure.positions_involved?.length
    ).length >= 2
  }

  private static hasSelectionConstraints(question: LogicGameQuestion): boolean {
    return question.game_rules.some(rule =>
      rule.rule_text.toLowerCase().includes('at least') ||
      rule.rule_text.toLowerCase().includes('at most') ||
      rule.rule_text.toLowerCase().includes('exactly')
    )
  }
}

// Export utility function for easy use
export function categorizeGame(question: LogicGameQuestion): GameClassification {
  return GameCategorizer.classify(question)
}