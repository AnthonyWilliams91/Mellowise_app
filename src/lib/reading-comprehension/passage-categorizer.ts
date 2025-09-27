/**
 * MELLOWISE-020: Reading Comprehension Module
 * Passage Categorization Service
 *
 * Automatically categorizes passages by subject matter and analyzes
 * complexity metrics for optimal practice targeting.
 *
 * @epic Epic 3.4 - Comprehensive LSAT Question System
 * @author UX Expert Agent (BMad Team)
 * @created 2025-09-25
 */

import type {
  ReadingComprehensionPassage,
  PassageSubject,
  PassageComplexity,
  VocabularyTerm
} from '@/types/reading-comprehension'

/**
 * Categorization Result
 */
export interface CategorizationResult {
  primarySubject: PassageSubject
  confidence: number // 0-1
  secondarySubjects: PassageSubject[]
  indicators: string[] // Keywords that led to classification
  reasoning: string
}

/**
 * Complexity Analysis Result
 */
export interface ComplexityAnalysisResult {
  complexity: PassageComplexity
  keyFactors: {
    vocabularyTerms: VocabularyTerm[]
    longSentences: number[]    // Line numbers of complex sentences
    abstractConcepts: string[] // Abstract concepts identified
    technicalTerms: string[]  // Technical/specialized terms
  }
  recommendations: {
    estimatedReadingTime: number // seconds
    suggestedTimeAllocation: number // seconds for questions
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
    readingStrategy: string
  }
}

/**
 * Subject Classification Indicators
 */
interface SubjectIndicators {
  subject: PassageSubject
  keywords: string[]
  phrases: RegExp[]
  contextClues: string[]
  priority: number // Higher numbers checked first
}

export class PassageCategorizer {
  /**
   * Subject classification indicators
   */
  private static readonly SUBJECT_INDICATORS: SubjectIndicators[] = [
    {
      subject: 'law',
      keywords: [
        'court', 'judge', 'jury', 'legal', 'statute', 'constitutional', 'precedent',
        'plaintiff', 'defendant', 'litigation', 'jurisprudence', 'criminal',
        'civil', 'contract', 'tort', 'evidence', 'testimony', 'verdict',
        'appeal', 'supreme court', 'jurisdiction', 'due process'
      ],
      phrases: [
        /in.*vs\..*case/i,
        /constitutional.*amendment/i,
        /supreme.*court.*held/i,
        /legal.*precedent/i,
        /court.*ruling/i
      ],
      contextClues: ['legal system', 'judicial review', 'case law', 'legal doctrine'],
      priority: 10
    },
    {
      subject: 'science',
      keywords: [
        'experiment', 'hypothesis', 'theory', 'research', 'study', 'data',
        'analysis', 'methodology', 'findings', 'conclusion', 'laboratory',
        'scientific', 'empirical', 'observation', 'measurement', 'variable',
        'control group', 'peer review', 'journal', 'publication'
      ],
      phrases: [
        /scientific.*method/i,
        /experimental.*design/i,
        /research.*shows/i,
        /studies.*indicate/i,
        /data.*suggests/i
      ],
      contextClues: ['peer-reviewed', 'scientific community', 'research methodology'],
      priority: 9
    },
    {
      subject: 'social_science',
      keywords: [
        'psychology', 'sociology', 'anthropology', 'behavior', 'society',
        'culture', 'social', 'community', 'human', 'population', 'survey',
        'demographic', 'ethnographic', 'cognitive', 'behavioral', 'cultural',
        'social norm', 'institution', 'interaction', 'development'
      ],
      phrases: [
        /social.*behavior/i,
        /cultural.*pattern/i,
        /human.*development/i,
        /psychological.*study/i,
        /sociological.*research/i
      ],
      contextClues: ['social science', 'human behavior', 'cultural studies'],
      priority: 8
    },
    {
      subject: 'humanities',
      keywords: [
        'literature', 'philosophy', 'art', 'music', 'poetry', 'novel',
        'author', 'writer', 'artist', 'aesthetic', 'beauty', 'meaning',
        'interpretation', 'criticism', 'genre', 'style', 'movement',
        'renaissance', 'enlightenment', 'romantic', 'modern', 'postmodern'
      ],
      phrases: [
        /literary.*criticism/i,
        /philosophical.*argument/i,
        /artistic.*movement/i,
        /aesthetic.*theory/i,
        /cultural.*significance/i
      ],
      contextClues: ['liberal arts', 'fine arts', 'intellectual history'],
      priority: 7
    },
    {
      subject: 'history',
      keywords: [
        'century', 'ancient', 'medieval', 'modern', 'revolution', 'war',
        'empire', 'civilization', 'historical', 'period', 'era', 'dynasty',
        'chronicle', 'historian', 'archaeology', 'artifact', 'document',
        'primary source', 'secondary source', 'timeline', 'chronology'
      ],
      phrases: [
        /during.*the.*century/i,
        /historical.*period/i,
        /ancient.*civilization/i,
        /medieval.*times/i,
        /world.*war/i
      ],
      contextClues: ['historical context', 'historical evidence', 'primary sources'],
      priority: 8
    },
    {
      subject: 'economics',
      keywords: [
        'economic', 'market', 'trade', 'business', 'finance', 'money',
        'currency', 'investment', 'profit', 'loss', 'supply', 'demand',
        'price', 'cost', 'revenue', 'gdp', 'inflation', 'recession',
        'economy', 'fiscal', 'monetary', 'policy', 'capitalism', 'socialism'
      ],
      phrases: [
        /economic.*theory/i,
        /market.*forces/i,
        /supply.*and.*demand/i,
        /economic.*policy/i,
        /financial.*crisis/i
      ],
      contextClues: ['economic system', 'market economy', 'financial markets'],
      priority: 7
    },
    {
      subject: 'technology',
      keywords: [
        'computer', 'software', 'hardware', 'digital', 'internet', 'web',
        'algorithm', 'data', 'programming', 'code', 'artificial intelligence',
        'machine learning', 'innovation', 'technology', 'technical',
        'engineering', 'electronic', 'automation', 'robotics', 'system'
      ],
      phrases: [
        /computer.*science/i,
        /artificial.*intelligence/i,
        /machine.*learning/i,
        /software.*engineering/i,
        /digital.*technology/i
      ],
      contextClues: ['information technology', 'computer systems', 'digital age'],
      priority: 6
    },
    {
      subject: 'medicine',
      keywords: [
        'medical', 'health', 'disease', 'treatment', 'patient', 'doctor',
        'physician', 'diagnosis', 'therapy', 'clinical', 'hospital',
        'medicine', 'pharmaceutical', 'drug', 'vaccine', 'surgery',
        'biological', 'anatomy', 'physiology', 'pathology', 'epidemiology'
      ],
      phrases: [
        /medical.*research/i,
        /clinical.*trial/i,
        /health.*care/i,
        /medical.*treatment/i,
        /patient.*care/i
      ],
      contextClues: ['medical field', 'healthcare system', 'medical practice'],
      priority: 8
    },
    {
      subject: 'environment',
      keywords: [
        'environment', 'ecology', 'climate', 'nature', 'conservation',
        'ecosystem', 'biodiversity', 'pollution', 'sustainability',
        'renewable', 'carbon', 'greenhouse', 'global warming', 'species',
        'habitat', 'wildlife', 'forest', 'ocean', 'atmosphere', 'earth'
      ],
      phrases: [
        /climate.*change/i,
        /environmental.*protection/i,
        /sustainable.*development/i,
        /global.*warming/i,
        /carbon.*emissions/i
      ],
      contextClues: ['environmental science', 'ecological system', 'natural world'],
      priority: 7
    },
    {
      subject: 'politics',
      keywords: [
        'government', 'political', 'policy', 'election', 'vote', 'democracy',
        'republic', 'congress', 'parliament', 'president', 'senator',
        'representative', 'legislation', 'bill', 'law', 'regulation',
        'administration', 'campaign', 'party', 'candidate', 'citizen'
      ],
      phrases: [
        /political.*system/i,
        /government.*policy/i,
        /democratic.*process/i,
        /political.*party/i,
        /election.*campaign/i
      ],
      contextClues: ['political science', 'government affairs', 'public policy'],
      priority: 6
    }
  ]

  /**
   * Categorize passage by subject matter
   */
  static categorizePassage(content: string): CategorizationResult {
    const normalizedContent = content.toLowerCase()
    const matches: Array<{
      subject: PassageSubject
      score: number
      indicators: string[]
    }> = []

    // Check each subject indicator set
    for (const indicator of this.SUBJECT_INDICATORS) {
      let score = 0
      const foundIndicators: string[] = []

      // Check keywords
      for (const keyword of indicator.keywords) {
        const occurrences = this.countOccurrences(normalizedContent, keyword)
        if (occurrences > 0) {
          score += occurrences * 2
          foundIndicators.push(`Keyword: "${keyword}" (${occurrences}x)`)
        }
      }

      // Check phrases (regex patterns)
      for (const pattern of indicator.phrases) {
        const matches = content.match(new RegExp(pattern.source, 'gi'))
        if (matches) {
          score += matches.length * 3
          foundIndicators.push(`Pattern: "${matches[0]}" (${matches.length}x)`)
        }
      }

      // Check context clues
      for (const clue of indicator.contextClues) {
        if (normalizedContent.includes(clue)) {
          score += 1
          foundIndicators.push(`Context: "${clue}"`)
        }
      }

      // Apply priority weighting
      score = score * (indicator.priority / 10)

      if (score > 0) {
        matches.push({
          subject: indicator.subject,
          score,
          indicators: foundIndicators
        })
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score)

    if (matches.length === 0) {
      return {
        primarySubject: 'humanities', // Default fallback
        confidence: 0.3,
        secondarySubjects: [],
        indicators: [],
        reasoning: 'No clear subject indicators found, defaulting to humanities'
      }
    }

    const topMatch = matches[0]
    const totalScore = matches.reduce((sum, match) => sum + match.score, 0)
    const confidence = Math.min(topMatch.score / totalScore, 1)

    // Secondary subjects (other strong matches)
    const secondarySubjects = matches
      .slice(1, 4)
      .filter(match => match.score > topMatch.score * 0.3)
      .map(match => match.subject)

    return {
      primarySubject: topMatch.subject,
      confidence,
      secondarySubjects,
      indicators: topMatch.indicators,
      reasoning: this.generateReasoning(topMatch.subject, topMatch.indicators, confidence)
    }
  }

  /**
   * Analyze passage complexity
   */
  static analyzeComplexity(content: string): ComplexityAnalysisResult {
    const sentences = this.splitIntoSentences(content)
    const words = this.extractWords(content)
    const wordCount = words.length

    // Calculate basic readability metrics
    const avgWordsPerSentence = wordCount / sentences.length
    const syllableCount = this.estimateSyllableCount(words)
    const avgSyllablesPerWord = syllableCount / wordCount

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

    // Convert to grade level (approximate)
    let gradeLevel: number
    if (fleschScore >= 90) gradeLevel = 5
    else if (fleschScore >= 80) gradeLevel = 6
    else if (fleschScore >= 70) gradeLevel = 7
    else if (fleschScore >= 60) gradeLevel = 8
    else if (fleschScore >= 50) gradeLevel = 9
    else if (fleschScore >= 30) gradeLevel = 10
    else gradeLevel = 12

    // Analyze vocabulary complexity
    const vocabularyTerms = this.identifyComplexVocabulary(words)
    const vocabularyLevel = Math.min(10, Math.max(1, Math.ceil(vocabularyTerms.length / 5)))

    // Identify complex sentences (> 25 words)
    const longSentences: number[] = []
    sentences.forEach((sentence, index) => {
      const sentenceWords = this.extractWords(sentence)
      if (sentenceWords.length > 25) {
        longSentences.push(index + 1)
      }
    })

    // Identify abstract concepts and technical terms
    const abstractConcepts = this.identifyAbstractConcepts(content)
    const technicalTerms = this.identifyTechnicalTerms(content)

    // Calculate concept density (abstract concepts per 100 words)
    const conceptDensity = (abstractConcepts.length / wordCount) * 100

    // Determine structural complexity
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())
    const structuralComplexity = Math.min(5, Math.max(1,
      Math.ceil((paragraphs.length + longSentences.length) / 5)
    ))

    // Overall complexity assessment
    let overall: 'low' | 'medium' | 'high'
    const complexityScore = (gradeLevel + vocabularyLevel + structuralComplexity) / 3

    if (complexityScore <= 6) overall = 'low'
    else if (complexityScore <= 8) overall = 'medium'
    else overall = 'high'

    // Generate recommendations
    const estimatedReadingTime = this.calculateReadingTime(wordCount, overall)
    const suggestedTimeAllocation = this.calculateQuestionTime(wordCount, overall)
    const difficultyLevel = overall === 'low' ? 'beginner' :
                           overall === 'medium' ? 'intermediate' : 'advanced'
    const readingStrategy = this.recommendReadingStrategy(overall, conceptDensity)

    return {
      complexity: {
        readabilityScore: Math.round(gradeLevel * 10) / 10,
        averageSentenceLength: Math.round(avgWordsPerSentence * 10) / 10,
        vocabularyLevel,
        conceptDensity: Math.round(conceptDensity * 10) / 10,
        structuralComplexity,
        overall
      },
      keyFactors: {
        vocabularyTerms,
        longSentences,
        abstractConcepts,
        technicalTerms
      },
      recommendations: {
        estimatedReadingTime,
        suggestedTimeAllocation,
        difficultyLevel,
        readingStrategy
      }
    }
  }

  /**
   * Count occurrences of a term in text
   */
  private static countOccurrences(text: string, term: string): number {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    return (text.match(regex) || []).length
  }

  /**
   * Split text into sentences
   */
  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  /**
   * Extract words from text
   */
  private static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }

  /**
   * Estimate syllable count for words
   */
  private static estimateSyllableCount(words: string[]): number {
    return words.reduce((total, word) => {
      // Simple syllable estimation
      const vowels = word.match(/[aeiouy]/gi) || []
      let syllables = vowels.length

      // Adjust for common patterns
      if (word.endsWith('e')) syllables -= 1
      if (syllables === 0) syllables = 1

      return total + syllables
    }, 0)
  }

  /**
   * Identify complex vocabulary terms
   */
  private static identifyComplexVocabulary(words: string[]): VocabularyTerm[] {
    const complexWords = words.filter(word => {
      return word.length >= 8 || // Long words
             /[A-Z]/.test(word) || // Proper nouns
             this.isLatinDerivative(word) || // Latin/Greek roots
             this.isTechnicalTerm(word)
    })

    // Remove duplicates and create vocabulary terms
    const uniqueWords = [...new Set(complexWords)]

    return uniqueWords.slice(0, 20).map(word => ({
      word: word.toLowerCase(),
      definition: `Complex term requiring definition: ${word}`,
      context: `Found in passage context`,
      partOfSpeech: this.guessPartOfSpeech(word),
      difficulty: this.calculateWordDifficulty(word)
    }))
  }

  /**
   * Identify abstract concepts
   */
  private static identifyAbstractConcepts(content: string): string[] {
    const abstractPatterns = [
      /\b(concept|theory|principle|philosophy|ideology|paradigm|framework)\b/gi,
      /\b(abstract|theoretical|conceptual|philosophical|metaphysical)\b/gi,
      /\b(essence|nature|meaning|significance|implication|consequence)\b/gi
    ]

    const concepts: string[] = []

    abstractPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        concepts.push(...matches.map(match => match.toLowerCase()))
      }
    })

    return [...new Set(concepts)].slice(0, 10)
  }

  /**
   * Identify technical terms
   */
  private static identifyTechnicalTerms(content: string): string[] {
    const technicalPatterns = [
      /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g, // CamelCase terms
      /\b\w+(?:-\w+)+\b/g, // Hyphenated terms
      /\b[a-z]+(?:tion|ment|ness|ity|ism|ology|graphy)\b/gi // Technical suffixes
    ]

    const terms: string[] = []

    technicalPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        terms.push(...matches)
      }
    })

    return [...new Set(terms)].slice(0, 15)
  }

  /**
   * Calculate estimated reading time in seconds
   */
  private static calculateReadingTime(wordCount: number, complexity: 'low' | 'medium' | 'high'): number {
    // Average reading speeds (words per minute)
    const readingSpeeds = {
      low: 250,    // Easy text
      medium: 200, // Moderate text
      high: 150    // Complex text
    }

    const wpm = readingSpeeds[complexity]
    return Math.round((wordCount / wpm) * 60) // Convert to seconds
  }

  /**
   * Calculate suggested time for questions
   */
  private static calculateQuestionTime(wordCount: number, complexity: 'low' | 'medium' | 'high'): number {
    const baseTime = this.calculateReadingTime(wordCount, complexity)

    // Question time is typically 1.5-2x reading time
    const multipliers = {
      low: 1.5,
      medium: 1.75,
      high: 2.0
    }

    return Math.round(baseTime * multipliers[complexity])
  }

  /**
   * Recommend reading strategy based on complexity
   */
  private static recommendReadingStrategy(
    complexity: 'low' | 'medium' | 'high',
    conceptDensity: number
  ): string {
    if (complexity === 'low') {
      return 'Active reading: Focus on main ideas and supporting details'
    }

    if (complexity === 'medium') {
      return conceptDensity > 3
        ? 'Analytical reading: Take notes on key concepts and relationships'
        : 'Strategic reading: Identify structure and key arguments'
    }

    return 'Deep reading: Map argument structure, define key terms, and analyze logical flow'
  }

  /**
   * Helper functions for vocabulary analysis
   */
  private static isLatinDerivative(word: string): boolean {
    const latinSuffixes = ['tion', 'sion', 'ment', 'ness', 'ity', 'ism', 'ology']
    return latinSuffixes.some(suffix => word.endsWith(suffix))
  }

  private static isTechnicalTerm(word: string): boolean {
    const technicalPrefixes = ['bio', 'geo', 'neo', 'pseudo', 'meta', 'micro', 'macro']
    return technicalPrefixes.some(prefix => word.startsWith(prefix))
  }

  private static guessPartOfSpeech(word: string): string {
    if (word.endsWith('ing')) return 'verb/adjective'
    if (word.endsWith('ed')) return 'verb/adjective'
    if (word.endsWith('ly')) return 'adverb'
    if (word.endsWith('tion') || word.endsWith('ness')) return 'noun'
    return 'noun/adjective'
  }

  private static calculateWordDifficulty(word: string): number {
    let difficulty = Math.min(10, Math.max(1, word.length / 2))

    if (this.isLatinDerivative(word)) difficulty += 1
    if (this.isTechnicalTerm(word)) difficulty += 1

    return Math.min(10, Math.round(difficulty))
  }

  /**
   * Generate human-readable reasoning for categorization
   */
  private static generateReasoning(
    subject: PassageSubject,
    indicators: string[],
    confidence: number
  ): string {
    const subjectDescriptions: Record<PassageSubject, string> = {
      law: 'legal terminology and judicial concepts',
      science: 'scientific methodology and research language',
      social_science: 'social behavior and cultural analysis terms',
      humanities: 'artistic, literary, and philosophical content',
      history: 'historical periods and chronological references',
      economics: 'economic theory and market-related terminology',
      technology: 'technical and computer-related concepts',
      medicine: 'medical terminology and healthcare concepts',
      environment: 'ecological and environmental science terms',
      politics: 'political systems and governmental processes'
    }

    const confidenceLevel = confidence > 0.7 ? 'high' : confidence > 0.5 ? 'moderate' : 'low'

    return `Classified as ${subject} with ${confidenceLevel} confidence based on ${subjectDescriptions[subject]}. Key indicators: ${indicators.slice(0, 3).join(', ')}.`
  }
}