/**
 * MELLOWISE-019: Logical Reasoning Practice System
 * Argument Structure Analyzer Service
 *
 * Analyzes logical reasoning arguments to identify premises, conclusions,
 * and logical relationships for visualization.
 *
 * @epic Epic 3.3 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-25
 */

import type {
  ArgumentStructure,
  ArgumentComponent
} from '@/types/logical-reasoning'

/**
 * Indicator words for different argument components
 */
const CONCLUSION_INDICATORS = [
  'therefore', 'thus', 'hence', 'so', 'consequently', 'accordingly',
  'it follows that', 'we can conclude', 'this shows that', 'this means that',
  'must be that', 'implies that', 'entails that', 'proves that',
  'demonstrates that', 'establishes that', 'suggests that'
]

const PREMISE_INDICATORS = [
  'because', 'since', 'for', 'given that', 'as', 'due to',
  'owing to', 'in light of', 'after all', 'the reason is',
  'evidence shows', 'studies indicate', 'research suggests',
  'it is known that', 'assuming that'
]

const CONTRAST_INDICATORS = [
  'however', 'but', 'yet', 'although', 'though', 'even though',
  'despite', 'in spite of', 'nevertheless', 'nonetheless',
  'on the other hand', 'conversely', 'while', 'whereas'
]

const SUPPORT_INDICATORS = [
  'furthermore', 'moreover', 'additionally', 'also', 'in addition',
  'what\'s more', 'besides', 'plus', 'and', 'as well as'
]

export class ArgumentStructureAnalyzer {
  /**
   * Analyze argument structure from stimulus text
   */
  static analyze(stimulus: string): ArgumentStructure {
    const sentences = this.splitIntoSentences(stimulus)
    const components = this.identifyComponents(sentences, stimulus)
    const relationships = this.identifyRelationships(components)
    const mainConclusion = this.findMainConclusion(components, relationships)
    const mainPremises = this.findMainPremises(components, mainConclusion)
    const assumptions = this.identifyImplicitAssumptions(components, relationships)
    const strength = this.assessArgumentStrength(components, relationships)

    return {
      stimulus,
      components,
      mainConclusion,
      mainPremises,
      implicitAssumptions: assumptions,
      logicalFlow: relationships,
      strength
    }
  }

  /**
   * Split stimulus into sentences while preserving indices
   */
  private static splitIntoSentences(stimulus: string): Array<{text: string, startIndex: number, endIndex: number}> {
    const sentences: Array<{text: string, startIndex: number, endIndex: number}> = []
    const regex = /[^.!?]+[.!?]+/g
    let match

    while ((match = regex.exec(stimulus)) !== null) {
      sentences.push({
        text: match[0].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length
      })
    }

    // Handle final sentence without punctuation
    const lastIndex = sentences.length > 0 ?
      sentences[sentences.length - 1].endIndex : 0
    if (lastIndex < stimulus.length) {
      const remainder = stimulus.substring(lastIndex).trim()
      if (remainder) {
        sentences.push({
          text: remainder,
          startIndex: lastIndex,
          endIndex: stimulus.length
        })
      }
    }

    return sentences
  }

  /**
   * Identify argument components from sentences
   */
  private static identifyComponents(
    sentences: Array<{text: string, startIndex: number, endIndex: number}>,
    stimulus: string
  ): ArgumentComponent[] {
    const components: ArgumentComponent[] = []

    sentences.forEach((sentence, index) => {
      const component = this.classifySentence(sentence, index, stimulus)
      components.push(component)

      // Check for sub-components within the sentence
      const subComponents = this.extractSubComponents(sentence, component.id)
      components.push(...subComponents)
    })

    return components
  }

  /**
   * Classify a sentence as a type of argument component
   */
  private static classifySentence(
    sentence: {text: string, startIndex: number, endIndex: number},
    index: number,
    stimulus: string
  ): ArgumentComponent {
    const text = sentence.text.toLowerCase()
    let type: ArgumentComponent['type'] = 'premise' // Default
    let confidence = 0.5
    const isMain = index === 0 || index === Math.floor(stimulus.length / sentence.text.length) - 1

    // Check for conclusion indicators
    for (const indicator of CONCLUSION_INDICATORS) {
      if (text.includes(indicator)) {
        type = 'conclusion'
        confidence = 0.8
        break
      }
    }

    // Check for premise indicators
    if (type !== 'conclusion') {
      for (const indicator of PREMISE_INDICATORS) {
        if (text.includes(indicator)) {
          type = 'premise'
          confidence = 0.75
          break
        }
      }
    }

    // Check for evidence patterns
    if (text.includes('study') || text.includes('research') ||
        text.includes('data') || text.includes('survey')) {
      type = 'evidence'
      confidence = 0.7
    }

    // Background info typically appears at the beginning
    if (index === 0 && !CONCLUSION_INDICATORS.some(ind => text.includes(ind))) {
      if (confidence < 0.7) {
        type = 'background'
        confidence = 0.6
      }
    }

    return {
      id: `comp-${index}`,
      type,
      text: sentence.text,
      startIndex: sentence.startIndex,
      endIndex: sentence.endIndex,
      isMain: isMain && type === 'conclusion',
      confidence
    }
  }

  /**
   * Extract sub-components from complex sentences
   */
  private static extractSubComponents(
    sentence: {text: string, startIndex: number, endIndex: number},
    parentId: string
  ): ArgumentComponent[] {
    const subComponents: ArgumentComponent[] = []
    const text = sentence.text

    // Look for clauses separated by conjunctions
    const clauseRegex = /(?:because|since|although|if|when|while)[^,;.]+/gi
    let match
    let clauseIndex = 0

    while ((match = clauseRegex.exec(text)) !== null) {
      const clauseText = match[0]
      let type: ArgumentComponent['type'] = 'premise'

      // Determine clause type based on indicator
      if (clauseText.toLowerCase().startsWith('because') ||
          clauseText.toLowerCase().startsWith('since')) {
        type = 'premise'
      } else if (clauseText.toLowerCase().startsWith('although')) {
        type = 'premise' // Concessive premise
      }

      subComponents.push({
        id: `${parentId}-sub-${clauseIndex}`,
        type,
        text: clauseText,
        startIndex: sentence.startIndex + match.index,
        endIndex: sentence.startIndex + match.index + clauseText.length,
        confidence: 0.6,
        supportedBy: [parentId]
      })
      clauseIndex++
    }

    return subComponents
  }

  /**
   * Identify logical relationships between components
   */
  private static identifyRelationships(
    components: ArgumentComponent[]
  ): ArgumentStructure['logicalFlow'] {
    const relationships: ArgumentStructure['logicalFlow'] = []

    components.forEach((comp1, i) => {
      components.forEach((comp2, j) => {
        if (i >= j) return // Avoid duplicates and self-relationships

        // Premises typically support conclusions
        if (comp1.type === 'premise' && comp2.type === 'conclusion') {
          relationships.push({
            from: comp1.id,
            to: comp2.id,
            relationship: 'supports'
          })
        }

        // Evidence supports premises
        if (comp1.type === 'evidence' && comp2.type === 'premise') {
          relationships.push({
            from: comp1.id,
            to: comp2.id,
            relationship: 'supports'
          })
        }

        // Check for contrast indicators between components
        if (this.hasContrastRelationship(comp1.text, comp2.text)) {
          relationships.push({
            from: comp1.id,
            to: comp2.id,
            relationship: 'opposes'
          })
        }
      })
    })

    return relationships
  }

  /**
   * Check if two components have a contrast relationship
   */
  private static hasContrastRelationship(text1: string, text2: string): boolean {
    return CONTRAST_INDICATORS.some(indicator =>
      text1.toLowerCase().includes(indicator) || text2.toLowerCase().includes(indicator)
    )
  }

  /**
   * Find the main conclusion
   */
  private static findMainConclusion(
    components: ArgumentComponent[],
    relationships: ArgumentStructure['logicalFlow']
  ): string | undefined {
    // Look for components marked as main conclusions
    const mainComp = components.find(c => c.isMain && c.type === 'conclusion')
    if (mainComp) return mainComp.text

    // Find conclusion with most support
    const conclusions = components.filter(c => c.type === 'conclusion')
    if (conclusions.length === 0) return undefined

    if (conclusions.length === 1) return conclusions[0].text

    // Find conclusion that is supported by most components
    const supportCounts = conclusions.map(conclusion => ({
      conclusion,
      supportCount: relationships.filter(r => r.to === conclusion.id && r.relationship === 'supports').length
    }))

    supportCounts.sort((a, b) => b.supportCount - a.supportCount)
    return supportCounts[0]?.conclusion.text
  }

  /**
   * Find main premises supporting the main conclusion
   */
  private static findMainPremises(
    components: ArgumentComponent[],
    mainConclusion?: string
  ): string[] {
    if (!mainConclusion) {
      // Return all premises if no main conclusion
      return components
        .filter(c => c.type === 'premise')
        .map(c => c.text)
    }

    // Find the main conclusion component
    const conclusionComp = components.find(c => c.text === mainConclusion)
    if (!conclusionComp) {
      return components
        .filter(c => c.type === 'premise')
        .map(c => c.text)
    }

    // Return premises that support this conclusion
    return components
      .filter(c => c.type === 'premise' && c.supports?.includes(conclusionComp.id))
      .map(c => c.text)
  }

  /**
   * Identify implicit assumptions
   */
  private static identifyImplicitAssumptions(
    components: ArgumentComponent[],
    relationships: ArgumentStructure['logicalFlow']
  ): string[] {
    const assumptions: string[] = []

    // Look for logical gaps between premises and conclusions
    const conclusions = components.filter(c => c.type === 'conclusion')
    const premises = components.filter(c => c.type === 'premise')

    conclusions.forEach(conclusion => {
      // Find premises that support this conclusion
      const supportingPremises = premises.filter(premise =>
        relationships.some(r =>
          r.from === premise.id && r.to === conclusion.id && r.relationship === 'supports'
        )
      )

      // Analyze for common assumption patterns
      if (this.hasGeneralizationGap(supportingPremises, conclusion)) {
        assumptions.push('The sample is representative of the whole')
      }

      if (this.hasCausalGap(supportingPremises, conclusion)) {
        assumptions.push('Correlation implies causation')
      }

      if (this.hasTemporalGap(supportingPremises, conclusion)) {
        assumptions.push('Past patterns will continue in the future')
      }
    })

    return assumptions
  }

  /**
   * Check for generalization gap
   */
  private static hasGeneralizationGap(
    premises: ArgumentComponent[],
    conclusion: ArgumentComponent
  ): boolean {
    const hasSpecificEvidence = premises.some(p =>
      p.text.includes('some') || p.text.includes('many') || p.text.includes('sample')
    )
    const hasGeneralConclusion = conclusion.text.includes('all') ||
      conclusion.text.includes('every') || conclusion.text.includes('always')

    return hasSpecificEvidence && hasGeneralConclusion
  }

  /**
   * Check for causal gap
   */
  private static hasCausalGap(
    premises: ArgumentComponent[],
    conclusion: ArgumentComponent
  ): boolean {
    const causalWords = ['causes', 'leads to', 'results in', 'produces', 'creates']
    const hasCausalConclusion = causalWords.some(word =>
      conclusion.text.toLowerCase().includes(word)
    )
    const hasCorrelationPremise = premises.some(p =>
      p.text.includes('associated') || p.text.includes('correlated') ||
      p.text.includes('linked')
    )

    return hasCausalConclusion && hasCorrelationPremise
  }

  /**
   * Check for temporal gap
   */
  private static hasTemporalGap(
    premises: ArgumentComponent[],
    conclusion: ArgumentComponent
  ): boolean {
    const pastWords = ['was', 'were', 'has been', 'had been', 'used to']
    const futureWords = ['will', 'shall', 'going to', 'will be']

    const hasPastPremise = premises.some(p =>
      pastWords.some(word => p.text.toLowerCase().includes(word))
    )
    const hasFutureConclusion = futureWords.some(word =>
      conclusion.text.toLowerCase().includes(word)
    )

    return hasPastPremise && hasFutureConclusion
  }

  /**
   * Assess overall argument strength
   */
  private static assessArgumentStrength(
    components: ArgumentComponent[],
    relationships: ArgumentStructure['logicalFlow']
  ): ArgumentStructure['strength'] {
    let strengthScore = 0

    // Check for evidence
    const hasEvidence = components.some(c => c.type === 'evidence')
    if (hasEvidence) strengthScore += 2

    // Check for multiple supporting premises
    const premises = components.filter(c => c.type === 'premise')
    if (premises.length >= 3) strengthScore += 2
    else if (premises.length >= 2) strengthScore += 1

    // Check for logical connections
    const supportRelationships = relationships.filter(r => r.relationship === 'supports')
    if (supportRelationships.length >= 3) strengthScore += 2
    else if (supportRelationships.length >= 2) strengthScore += 1

    // Check for opposing views considered
    const hasOpposition = relationships.some(r => r.relationship === 'opposes')
    if (hasOpposition) strengthScore += 1

    // Determine strength
    if (strengthScore >= 6) return 'strong'
    if (strengthScore >= 3) return 'moderate'
    return 'weak'
  }

  /**
   * Generate visualization data for the argument structure
   */
  static generateVisualizationData(structure: ArgumentStructure): {
    nodes: Array<{
      id: string
      label: string
      type: string
      x?: number
      y?: number
      color?: string
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      type: string
      label?: string
    }>
  } {
    // Create nodes from components
    const nodes = structure.components.map((comp, index) => ({
      id: comp.id,
      label: comp.text.substring(0, 50) + (comp.text.length > 50 ? '...' : ''),
      type: comp.type,
      x: comp.type === 'conclusion' ? 400 : 200 + (index % 3) * 150,
      y: comp.type === 'conclusion' ? 100 : 250 + Math.floor(index / 3) * 100,
      color: this.getNodeColor(comp.type)
    }))

    // Create edges from relationships
    const edges = structure.logicalFlow.map((flow, index) => ({
      id: `edge-${index}`,
      source: flow.from,
      target: flow.to,
      type: flow.relationship,
      label: flow.relationship
    }))

    return { nodes, edges }
  }

  /**
   * Get color for node based on type
   */
  private static getNodeColor(type: ArgumentComponent['type']): string {
    const colors = {
      conclusion: '#ef4444', // red
      premise: '#3b82f6', // blue
      evidence: '#10b981', // green
      assumption: '#f59e0b', // amber
      background: '#6b7280' // gray
    }
    return colors[type] || '#6b7280'
  }
}