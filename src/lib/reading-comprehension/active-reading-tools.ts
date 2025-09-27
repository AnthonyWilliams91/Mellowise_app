/**
 * MELLOWISE-020: Reading Comprehension Module
 * Active Reading Tools Service
 *
 * Provides highlighting, note-taking, and passage mapping tools
 * to enhance reading comprehension and retention.
 *
 * @epic Epic 3.4 - Comprehensive LSAT Question System
 * @author UX Expert Agent (BMad Team)
 * @created 2025-09-25
 */

import type {
  ReadingAnnotation,
  PassageMap,
  ReadingToolsState,
  ReadingProgress,
  VocabularyTerm
} from '@/types/reading-comprehension'

/**
 * Annotation Creation Options
 */
export interface AnnotationOptions {
  type: ReadingAnnotation['type']
  text: string
  startOffset: number
  endOffset: number
  color?: string
  note?: string
  autoSuggest?: boolean
}

/**
 * Passage Mapping Session
 */
export interface PassageMappingSession {
  passageId: string
  userId: string
  startTime: number
  annotations: ReadingAnnotation[]
  structuralNotes: {
    paragraph: number
    mainPoint: string
    purpose: string
    keyDetails: string[]
  }[]
  overallAnalysis: {
    theme: string
    authorPerspective: string
    keyArguments: string[]
    evidenceTypes: string[]
  }
  timeSpent: number
}

/**
 * Smart Annotation Suggestions
 */
export interface AnnotationSuggestion {
  type: ReadingAnnotation['type']
  text: string
  startOffset: number
  endOffset: number
  reason: string
  confidence: number // 0-1
  category: 'structure' | 'argument' | 'evidence' | 'transition' | 'key_term'
}

export class ActiveReadingTools {
  private annotations: Map<string, ReadingAnnotation[]> = new Map()
  private passageMaps: Map<string, PassageMap> = new Map()
  private toolsState: ReadingToolsState = this.getDefaultToolsState()

  constructor() {
    this.initializeColors()
  }

  /**
   * Create a new annotation
   */
  createAnnotation(
    passageId: string,
    options: AnnotationOptions
  ): ReadingAnnotation {
    const annotation: ReadingAnnotation = {
      id: this.generateId(),
      startOffset: options.startOffset,
      endOffset: options.endOffset,
      text: options.text,
      type: options.type,
      color: options.color || this.getColorForType(options.type),
      note: options.note,
      timestamp: new Date().toISOString()
    }

    // Add to passage annotations
    const passageAnnotations = this.annotations.get(passageId) || []
    passageAnnotations.push(annotation)
    this.annotations.set(passageId, passageAnnotations)

    return annotation
  }

  /**
   * Update an existing annotation
   */
  updateAnnotation(
    passageId: string,
    annotationId: string,
    updates: Partial<ReadingAnnotation>
  ): ReadingAnnotation | null {
    const passageAnnotations = this.annotations.get(passageId) || []
    const annotationIndex = passageAnnotations.findIndex(a => a.id === annotationId)

    if (annotationIndex === -1) return null

    const updatedAnnotation = {
      ...passageAnnotations[annotationIndex],
      ...updates
    }

    passageAnnotations[annotationIndex] = updatedAnnotation
    this.annotations.set(passageId, passageAnnotations)

    return updatedAnnotation
  }

  /**
   * Remove an annotation
   */
  removeAnnotation(passageId: string, annotationId: string): boolean {
    const passageAnnotations = this.annotations.get(passageId) || []
    const initialLength = passageAnnotations.length

    const filteredAnnotations = passageAnnotations.filter(a => a.id !== annotationId)
    this.annotations.set(passageId, filteredAnnotations)

    return filteredAnnotations.length < initialLength
  }

  /**
   * Get all annotations for a passage
   */
  getAnnotations(passageId: string, type?: ReadingAnnotation['type']): ReadingAnnotation[] {
    const passageAnnotations = this.annotations.get(passageId) || []

    if (type) {
      return passageAnnotations.filter(a => a.type === type)
    }

    return [...passageAnnotations].sort((a, b) => a.startOffset - b.startOffset)
  }

  /**
   * Generate smart annotation suggestions based on passage content
   */
  generateAnnotationSuggestions(
    passageContent: string,
    existingAnnotations?: ReadingAnnotation[]
  ): AnnotationSuggestion[] {
    const suggestions: AnnotationSuggestion[] = []
    const existingOffsets = new Set(
      existingAnnotations?.map(a => `${a.startOffset}-${a.endOffset}`) || []
    )

    // Suggest key structural elements
    suggestions.push(...this.suggestStructuralElements(passageContent, existingOffsets))

    // Suggest argument components
    suggestions.push(...this.suggestArgumentElements(passageContent, existingOffsets))

    // Suggest evidence markers
    suggestions.push(...this.suggestEvidenceMarkers(passageContent, existingOffsets))

    // Suggest transition words
    suggestions.push(...this.suggestTransitions(passageContent, existingOffsets))

    // Suggest key terms
    suggestions.push(...this.suggestKeyTerms(passageContent, existingOffsets))

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
  }

  /**
   * Create or update passage map
   */
  createPassageMap(
    passageId: string,
    userId: string,
    passageContent: string,
    annotations: ReadingAnnotation[]
  ): PassageMap {
    const paragraphs = this.splitIntoParagraphs(passageContent)
    const structuralAnalysis = this.analyzePassageStructure(paragraphs, annotations)

    const passageMap: PassageMap = {
      id: this.generateId(),
      passageId,
      userId,
      structure: structuralAnalysis.structure,
      overallTheme: structuralAnalysis.theme,
      authorPerspective: structuralAnalysis.perspective,
      keyRelationships: structuralAnalysis.relationships,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.passageMaps.set(passageId, passageMap)
    return passageMap
  }

  /**
   * Get passage map
   */
  getPassageMap(passageId: string): PassageMap | null {
    return this.passageMaps.get(passageId) || null
  }

  /**
   * Update tools state
   */
  updateToolsState(updates: Partial<ReadingToolsState>): ReadingToolsState {
    this.toolsState = { ...this.toolsState, ...updates }
    return this.toolsState
  }

  /**
   * Get current tools state
   */
  getToolsState(): ReadingToolsState {
    return { ...this.toolsState }
  }

  /**
   * Export annotations for a passage
   */
  exportAnnotations(passageId: string, format: 'json' | 'text' | 'markdown' = 'json'): string {
    const annotations = this.getAnnotations(passageId)

    switch (format) {
      case 'text':
        return this.exportAsText(annotations)
      case 'markdown':
        return this.exportAsMarkdown(annotations)
      case 'json':
      default:
        return JSON.stringify(annotations, null, 2)
    }
  }

  /**
   * Import annotations from external source
   */
  importAnnotations(passageId: string, annotationsData: string, format: 'json' | 'text' = 'json'): ReadingAnnotation[] {
    let importedAnnotations: ReadingAnnotation[]

    try {
      if (format === 'json') {
        importedAnnotations = JSON.parse(annotationsData)
      } else {
        importedAnnotations = this.parseTextAnnotations(annotationsData)
      }

      // Validate and add to passage
      const validAnnotations = importedAnnotations.filter(this.validateAnnotation)
      this.annotations.set(passageId, validAnnotations)

      return validAnnotations
    } catch (error) {
      console.error('Failed to import annotations:', error)
      return []
    }
  }

  /**
   * Generate study guide from annotations and passage map
   */
  generateStudyGuide(passageId: string): {
    mainPoints: string[]
    keyTerms: { term: string, definition?: string, context: string }[]
    arguments: { premise: string, conclusion: string, evidence: string[] }[]
    questions: string[]
    summary: string
  } {
    const annotations = this.getAnnotations(passageId)
    const passageMap = this.getPassageMap(passageId)

    // Extract main points from key_point annotations and passage map
    const mainPoints = [
      ...annotations
        .filter(a => a.type === 'key_point')
        .map(a => a.text),
      ...(passageMap?.structure.map(s => s.mainPoint) || [])
    ]

    // Extract key terms from definition annotations
    const keyTerms = annotations
      .filter(a => a.type === 'definition')
      .map(a => ({
        term: a.text,
        definition: a.note,
        context: `Highlighted in passage at position ${a.startOffset}-${a.endOffset}`
      }))

    // Identify arguments from highlights and notes
    const arguments = this.extractArguments(annotations, passageMap)

    // Generate study questions
    const questions = this.generateStudyQuestions(annotations, passageMap)

    // Create summary
    const summary = this.generateSummary(passageMap, mainPoints)

    return {
      mainPoints: [...new Set(mainPoints)].slice(0, 10),
      keyTerms: keyTerms.slice(0, 15),
      arguments,
      questions: questions.slice(0, 8),
      summary
    }
  }

  /**
   * Private helper methods
   */

  private getDefaultToolsState(): ReadingToolsState {
    return {
      annotations: [],
      activeAnnotationType: 'highlight',
      highlightColors: {
        highlight: '#ffeb3b',
        key_point: '#ff9800',
        question: '#f44336',
        definition: '#4caf50',
        note: '#2196f3'
      },
      showLineNumbers: true,
      fontSize: 16,
      lineHeight: 1.6,
      showVocabularyHelp: true
    }
  }

  private initializeColors(): void {
    // Colors are already set in default state
  }

  private getColorForType(type: ReadingAnnotation['type']): string {
    return this.toolsState.highlightColors[type] || '#ffeb3b'
  }

  private generateId(): string {
    return `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private splitIntoParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
  }

  private analyzePassageStructure(
    paragraphs: string[],
    annotations: ReadingAnnotation[]
  ): {
    structure: PassageMap['structure']
    theme: string
    perspective: string
    relationships: string[]
  } {
    const structure = paragraphs.map((paragraph, index) => {
      // Find annotations for this paragraph
      const paragraphStart = paragraphs.slice(0, index).join('\n\n').length
      const paragraphEnd = paragraphStart + paragraph.length

      const relevantAnnotations = annotations.filter(a =>
        a.startOffset >= paragraphStart && a.endOffset <= paragraphEnd
      )

      const mainPoint = relevantAnnotations
        .find(a => a.type === 'key_point')?.text ||
        this.extractMainPoint(paragraph)

      const purpose = this.determineParagraphPurpose(paragraph, index, paragraphs.length)

      const keyDetails = relevantAnnotations
        .filter(a => a.type === 'highlight')
        .map(a => a.text)
        .slice(0, 3)

      return {
        paragraph: index + 1,
        mainPoint,
        purpose,
        keyDetails
      }
    })

    const theme = this.extractTheme(paragraphs, annotations)
    const perspective = this.determineAuthorPerspective(paragraphs, annotations)
    const relationships = this.identifyKeyRelationships(paragraphs, annotations)

    return {
      structure,
      theme,
      perspective,
      relationships
    }
  }

  private extractMainPoint(paragraph: string): string {
    // Simple heuristic: first sentence often contains main point
    const sentences = paragraph.split(/[.!?]+/)
    return sentences[0]?.trim().substring(0, 100) + '...' || 'Main point not clearly identified'
  }

  private determineParagraphPurpose(paragraph: string, index: number, total: number): string {
    if (index === 0) return 'Introduction and setup'
    if (index === total - 1) return 'Conclusion and implications'

    // Look for purpose indicators
    if (paragraph.includes('however') || paragraph.includes('but') || paragraph.includes('although')) {
      return 'Contrast and counterargument'
    }

    if (paragraph.includes('evidence') || paragraph.includes('study') || paragraph.includes('research')) {
      return 'Evidence and support'
    }

    if (paragraph.includes('therefore') || paragraph.includes('thus') || paragraph.includes('consequently')) {
      return 'Analysis and conclusion'
    }

    return 'Development and elaboration'
  }

  private extractTheme(paragraphs: string[], annotations: ReadingAnnotation[]): string {
    // Look for repeated concepts in key_point annotations
    const keyPoints = annotations
      .filter(a => a.type === 'key_point')
      .map(a => a.text.toLowerCase())

    if (keyPoints.length > 0) {
      return `Central theme focuses on ${keyPoints[0]?.substring(0, 50)}...`
    }

    // Fallback: analyze first and last paragraphs
    const firstSentence = paragraphs[0]?.split(/[.!?]/)[0] || ''
    const lastSentence = paragraphs[paragraphs.length - 1]?.split(/[.!?]/).pop() || ''

    return `Theme relates to concepts introduced in opening: "${firstSentence.substring(0, 50)}..."`
  }

  private determineAuthorPerspective(paragraphs: string[], annotations: ReadingAnnotation[]): string {
    const content = paragraphs.join(' ').toLowerCase()

    // Look for perspective indicators
    if (content.includes('i believe') || content.includes('in my view')) {
      return 'Personal opinion and advocacy'
    }

    if (content.includes('critics argue') || content.includes('opponents claim')) {
      return 'Balanced analysis with multiple viewpoints'
    }

    if (content.includes('research shows') || content.includes('studies indicate')) {
      return 'Objective, evidence-based presentation'
    }

    return 'Analytical and informative approach'
  }

  private identifyKeyRelationships(paragraphs: string[], annotations: ReadingAnnotation[]): string[] {
    const relationships: string[] = []
    const content = paragraphs.join(' ')

    // Common relationship patterns
    const patterns = [
      { regex: /cause.*effect/gi, relationship: 'Cause and effect relationship' },
      { regex: /compare.*contrast/gi, relationship: 'Comparison and contrast' },
      { regex: /problem.*solution/gi, relationship: 'Problem-solution structure' },
      { regex: /argument.*evidence/gi, relationship: 'Argument supported by evidence' },
      { regex: /theory.*practice/gi, relationship: 'Theory and application' }
    ]

    patterns.forEach(({ regex, relationship }) => {
      if (regex.test(content)) {
        relationships.push(relationship)
      }
    })

    return relationships.slice(0, 5)
  }

  private suggestStructuralElements(content: string, existingOffsets: Set<string>): AnnotationSuggestion[] {
    const suggestions: AnnotationSuggestion[] = []

    // Find topic sentences (typically first sentence of paragraphs)
    const paragraphs = content.split(/\n\s*\n/)
    let offset = 0

    paragraphs.forEach(paragraph => {
      const firstSentenceEnd = paragraph.search(/[.!?]/)
      if (firstSentenceEnd > 0) {
        const offsetKey = `${offset}-${offset + firstSentenceEnd + 1}`
        if (!existingOffsets.has(offsetKey)) {
          suggestions.push({
            type: 'key_point',
            text: paragraph.substring(0, firstSentenceEnd + 1),
            startOffset: offset,
            endOffset: offset + firstSentenceEnd + 1,
            reason: 'Likely topic sentence',
            confidence: 0.8,
            category: 'structure'
          })
        }
      }
      offset += paragraph.length + 2 // +2 for \n\n
    })

    return suggestions
  }

  private suggestArgumentElements(content: string, existingOffsets: Set<string>): AnnotationSuggestion[] {
    const suggestions: AnnotationSuggestion[] = []

    // Find conclusion indicators
    const conclusionPatterns = [
      /therefore[^.!?]*[.!?]/gi,
      /thus[^.!?]*[.!?]/gi,
      /consequently[^.!?]*[.!?]/gi,
      /in conclusion[^.!?]*[.!?]/gi
    ]

    conclusionPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const offsetKey = `${match.index}-${match.index + match[0].length}`
        if (!existingOffsets.has(offsetKey)) {
          suggestions.push({
            type: 'key_point',
            text: match[0],
            startOffset: match.index,
            endOffset: match.index + match[0].length,
            reason: 'Contains conclusion indicator',
            confidence: 0.9,
            category: 'argument'
          })
        }
      }
    })

    return suggestions
  }

  private suggestEvidenceMarkers(content: string, existingOffsets: Set<string>): AnnotationSuggestion[] {
    const suggestions: AnnotationSuggestion[] = []

    // Find evidence patterns
    const evidencePatterns = [
      /research shows[^.!?]*[.!?]/gi,
      /studies indicate[^.!?]*[.!?]/gi,
      /according to[^.!?]*[.!?]/gi,
      /data suggests[^.!?]*[.!?]/gi
    ]

    evidencePatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const offsetKey = `${match.index}-${match.index + match[0].length}`
        if (!existingOffsets.has(offsetKey)) {
          suggestions.push({
            type: 'highlight',
            text: match[0],
            startOffset: match.index,
            endOffset: match.index + match[0].length,
            reason: 'Contains evidence marker',
            confidence: 0.85,
            category: 'evidence'
          })
        }
      }
    })

    return suggestions
  }

  private suggestTransitions(content: string, existingOffsets: Set<string>): AnnotationSuggestion[] {
    const suggestions: AnnotationSuggestion[] = []

    // Find transition words
    const transitions = ['however', 'furthermore', 'moreover', 'nevertheless', 'additionally']

    transitions.forEach(transition => {
      const regex = new RegExp(`\\b${transition}\\b[^.!?]*[.!?]`, 'gi')
      let match
      while ((match = regex.exec(content)) !== null) {
        const offsetKey = `${match.index}-${match.index + match[0].length}`
        if (!existingOffsets.has(offsetKey)) {
          suggestions.push({
            type: 'note',
            text: match[0],
            startOffset: match.index,
            endOffset: match.index + match[0].length,
            reason: `Transition word: "${transition}"`,
            confidence: 0.7,
            category: 'transition'
          })
        }
      }
    })

    return suggestions
  }

  private suggestKeyTerms(content: string, existingOffsets: Set<string>): AnnotationSuggestion[] {
    const suggestions: AnnotationSuggestion[] = []

    // Find technical terms (capitalized multi-word phrases)
    const termPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g
    let match

    while ((match = termPattern.exec(content)) !== null) {
      const offsetKey = `${match.index}-${match.index + match[0].length}`
      if (!existingOffsets.has(offsetKey)) {
        suggestions.push({
          type: 'definition',
          text: match[0],
          startOffset: match.index,
          endOffset: match.index + match[0].length,
          reason: 'Potentially important term',
          confidence: 0.6,
          category: 'key_term'
        })
      }
    }

    return suggestions
  }

  private extractArguments(
    annotations: ReadingAnnotation[],
    passageMap: PassageMap | null
  ): { premise: string, conclusion: string, evidence: string[] }[] {
    // Simple extraction - in practice would be more sophisticated
    const keyPoints = annotations.filter(a => a.type === 'key_point')
    const highlights = annotations.filter(a => a.type === 'highlight')

    if (keyPoints.length === 0) return []

    return keyPoints.slice(0, 3).map(conclusion => ({
      premise: 'Supporting premise identified from passage analysis',
      conclusion: conclusion.text,
      evidence: highlights.slice(0, 2).map(h => h.text)
    }))
  }

  private generateStudyQuestions(
    annotations: ReadingAnnotation[],
    passageMap: PassageMap | null
  ): string[] {
    const questions: string[] = []

    // Generate questions based on annotations
    const questionAnnotations = annotations.filter(a => a.type === 'question')
    questions.push(...questionAnnotations.map(a => a.note || `What is the significance of: ${a.text}?`))

    // Generate questions based on passage structure
    if (passageMap) {
      questions.push(`What is the main theme of this passage?`)
      questions.push(`How does the author support their main argument?`)
      if (passageMap.structure.length > 2) {
        questions.push(`How do the different sections of the passage relate to each other?`)
      }
    }

    // Generate questions based on key terms
    const definitions = annotations.filter(a => a.type === 'definition')
    definitions.forEach(def => {
      questions.push(`Define and explain the significance of: ${def.text}`)
    })

    return questions
  }

  private generateSummary(passageMap: PassageMap | null, mainPoints: string[]): string {
    if (!passageMap) {
      return mainPoints.slice(0, 3).join('. ') + '.'
    }

    let summary = `This passage ${passageMap.overallTheme.toLowerCase()}. `
    summary += `The author ${passageMap.authorPerspective.toLowerCase()}. `

    if (passageMap.keyRelationships.length > 0) {
      summary += `Key relationships include: ${passageMap.keyRelationships.slice(0, 2).join(' and ')}.`
    }

    return summary
  }

  private exportAsText(annotations: ReadingAnnotation[]): string {
    return annotations
      .map(a => `[${a.type.toUpperCase()}] ${a.text}${a.note ? ` - ${a.note}` : ''}`)
      .join('\n')
  }

  private exportAsMarkdown(annotations: ReadingAnnotation[]): string {
    let markdown = '# Reading Annotations\n\n'

    const groupedAnnotations = this.groupBy(annotations, 'type')

    Object.entries(groupedAnnotations).forEach(([type, typeAnnotations]) => {
      markdown += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Annotations\n\n`
      typeAnnotations.forEach(annotation => {
        markdown += `- **${annotation.text}**`
        if (annotation.note) {
          markdown += `\n  - ${annotation.note}`
        }
        markdown += '\n'
      })
      markdown += '\n'
    })

    return markdown
  }

  private parseTextAnnotations(textData: string): ReadingAnnotation[] {
    // Simple text parser - would be more robust in practice
    const lines = textData.split('\n').filter(line => line.trim())

    return lines.map((line, index) => ({
      id: `imported-${index}`,
      text: line.trim(),
      type: 'note' as ReadingAnnotation['type'],
      startOffset: 0,
      endOffset: line.length,
      timestamp: new Date().toISOString()
    }))
  }

  private validateAnnotation(annotation: any): annotation is ReadingAnnotation {
    return (
      annotation &&
      typeof annotation.id === 'string' &&
      typeof annotation.text === 'string' &&
      typeof annotation.startOffset === 'number' &&
      typeof annotation.endOffset === 'number' &&
      ['highlight', 'note', 'key_point', 'question', 'definition'].includes(annotation.type)
    )
  }

  private groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }
}