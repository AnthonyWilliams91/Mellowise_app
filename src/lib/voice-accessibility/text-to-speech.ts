/**
 * MELLOWISE-031: Text-to-Speech Service
 *
 * Advanced text-to-speech engine using Web Speech API with voice selection,
 * SSML support, and intelligent content optimization
 *
 * @version 1.0.0
 */

import {
  TTSConfig,
  TTSVoice,
  TTSRequest,
  TTSResponse,
  SpeechQueueItem,
  DEFAULT_TTS_CONFIG,
  isTTSVoice
} from '../../types/voice-accessibility'

/**
 * TTS service state
 */
type TTSState = 'idle' | 'speaking' | 'paused' | 'error'

/**
 * Speech synthesis event handlers
 */
interface TTSHandlers {
  onStart?: (text: string) => void
  onEnd?: (text: string) => void
  onPause?: () => void
  onResume?: () => void
  onError?: (error: string) => void
  onStateChange?: (state: TTSState) => void
}

/**
 * Voice preference criteria
 */
interface VoicePreferenceCriteria {
  language?: string
  gender?: 'male' | 'female' | 'neutral'
  age?: 'child' | 'young' | 'middle' | 'old'
  quality?: 'standard' | 'premium' | 'neural'
  naturalness_threshold?: number
}

/**
 * Text-to-Speech Service Implementation
 */
export class TextToSpeechService {
  private tenant_id: string
  private user_id: string
  private config: TTSConfig
  private handlers: TTSHandlers = {}

  // Web Speech API
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSupported: boolean = false
  private state: TTSState = 'idle'

  // Voice management
  private availableVoices: TTSVoice[] = []
  private selectedVoice: TTSVoice | null = null

  // Queue management
  private speechQueue: SpeechQueueItem[] = []
  private currentQueueItem: SpeechQueueItem | null = null
  private isProcessingQueue: boolean = false

  // Cache management
  private responseCache: Map<string, TTSResponse> = new Map()
  private cacheTimeout: number = 3600000 // 1 hour

  // Analytics
  private requestCount: number = 0
  private totalSpeechDuration: number = 0
  private averageProcessingTime: number = 0

  constructor(
    tenant_id: string,
    user_id: string,
    config?: Partial<TTSConfig>
  ) {
    this.tenant_id = tenant_id
    this.user_id = user_id
    this.config = { ...DEFAULT_TTS_CONFIG, ...config }

    this.isSupported = this.checkBrowserSupport()

    if (this.isSupported) {
      this.initializeSpeechSynthesis()
      this.loadAvailableVoices()
    }
  }

  /**
   * Check browser support for Web Speech API
   */
  private checkBrowserSupport(): boolean {
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance)
  }

  /**
   * Initialize Speech Synthesis
   */
  private initializeSpeechSynthesis(): void {
    if (!this.isSupported) return

    this.synthesis = window.speechSynthesis

    // Handle speech synthesis events
    this.setupGlobalSpeechEvents()
  }

  /**
   * Setup global speech synthesis events
   */
  private setupGlobalSpeechEvents(): void {
    if (!this.synthesis) return

    // Some browsers fire voiceschanged event multiple times
    let voicesLoadedOnce = false

    const handleVoicesChanged = () => {
      if (!voicesLoadedOnce) {
        this.loadAvailableVoices()
        voicesLoadedOnce = true
      }
    }

    this.synthesis.onvoiceschanged = handleVoicesChanged

    // Initial load (some browsers have voices immediately available)
    setTimeout(() => {
      if (this.availableVoices.length === 0) {
        this.loadAvailableVoices()
      }
    }, 100)
  }

  /**
   * Load available voices and convert to TTSVoice format
   */
  private loadAvailableVoices(): void {
    if (!this.synthesis) return

    const synthVoices = this.synthesis.getVoices()
    this.availableVoices = synthVoices.map((voice, index) => this.convertToTTSVoice(voice, index))

    // Auto-select best voice if none selected
    if (!this.selectedVoice && this.availableVoices.length > 0) {
      this.selectBestVoice()
    }

    console.log(`Loaded ${this.availableVoices.length} TTS voices`)
  }

  /**
   * Convert SpeechSynthesisVoice to TTSVoice
   */
  private convertToTTSVoice(synthVoice: SpeechSynthesisVoice, index: number): TTSVoice {
    return {
      id: `voice-${index}-${synthVoice.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: synthVoice.name,
      language: synthVoice.lang,
      gender: this.inferGender(synthVoice.name),
      age: this.inferAge(synthVoice.name),
      quality: synthVoice.localService ? 'premium' : 'standard',
      naturalness_score: this.calculateNaturalnessScore(synthVoice),
      clarity_score: this.calculateClarityScore(synthVoice),
      expressiveness_score: this.calculateExpressivenessScore(synthVoice),
      ssml_support: false, // Web Speech API has limited SSML support
      emotion_support: [],
      style_support: [],
      is_default: synthVoice.default,
      is_premium: synthVoice.localService,
      download_required: !synthVoice.localService,
      offline_capable: synthVoice.localService,
      created_at: new Date().toISOString()
    }
  }

  /**
   * Voice analysis methods
   */
  private inferGender(voiceName: string): 'male' | 'female' | 'neutral' {
    const name = voiceName.toLowerCase()

    // Common patterns for gender identification
    if (name.includes('male') || name.includes('man') || name.includes('boy')) {
      return 'male'
    }
    if (name.includes('female') || name.includes('woman') || name.includes('girl')) {
      return 'female'
    }

    // Name-based inference (common names)
    const maleNames = ['alex', 'david', 'james', 'john', 'michael', 'robert', 'thomas', 'daniel']
    const femaleNames = ['alice', 'emma', 'jane', 'mary', 'sarah', 'susan', 'karen', 'anna']

    for (const maleName of maleNames) {
      if (name.includes(maleName)) return 'male'
    }
    for (const femaleName of femaleNames) {
      if (name.includes(femaleName)) return 'female'
    }

    return 'neutral'
  }

  private inferAge(voiceName: string): 'child' | 'young' | 'middle' | 'old' {
    const name = voiceName.toLowerCase()

    if (name.includes('child') || name.includes('kid') || name.includes('young')) {
      return 'child'
    }
    if (name.includes('teen') || name.includes('youth')) {
      return 'young'
    }
    if (name.includes('elderly') || name.includes('senior') || name.includes('old')) {
      return 'old'
    }

    return 'middle' // Default to middle age
  }

  private calculateNaturalnessScore(voice: SpeechSynthesisVoice): number {
    // Heuristic scoring based on voice characteristics
    let score = 5 // Base score

    if (voice.localService) score += 2 // Local voices tend to be better
    if (voice.name.toLowerCase().includes('neural')) score += 3
    if (voice.name.toLowerCase().includes('premium')) score += 2
    if (voice.default) score += 1

    return Math.min(score, 10)
  }

  private calculateClarityScore(voice: SpeechSynthesisVoice): number {
    // Similar heuristic for clarity
    let score = 6

    if (voice.localService) score += 2
    if (voice.name.toLowerCase().includes('clear')) score += 2

    return Math.min(score, 10)
  }

  private calculateExpressivenessScore(voice: SpeechSynthesisVoice): number {
    // Expressiveness heuristic
    let score = 4

    if (voice.name.toLowerCase().includes('expressive')) score += 3
    if (voice.name.toLowerCase().includes('emotional')) score += 2
    if (voice.localService) score += 1

    return Math.min(score, 10)
  }

  /**
   * Voice selection methods
   */
  private selectBestVoice(criteria?: VoicePreferenceCriteria): void {
    if (this.availableVoices.length === 0) return

    let candidates = this.availableVoices

    // Apply criteria filters
    if (criteria?.language) {
      candidates = candidates.filter(voice =>
        voice.language.startsWith(criteria.language!)
      )
    }

    if (criteria?.gender) {
      candidates = candidates.filter(voice => voice.gender === criteria.gender)
    }

    if (criteria?.age) {
      candidates = candidates.filter(voice => voice.age === criteria.age)
    }

    if (criteria?.quality) {
      candidates = candidates.filter(voice => voice.quality === criteria.quality)
    }

    if (criteria?.naturalness_threshold) {
      candidates = candidates.filter(voice =>
        voice.naturalness_score >= criteria.naturalness_threshold!
      )
    }

    // If no candidates match criteria, use all voices
    if (candidates.length === 0) {
      candidates = this.availableVoices
    }

    // Score and select best voice
    const scoredVoices = candidates.map(voice => ({
      voice,
      score: this.calculateVoiceScore(voice, criteria)
    }))

    scoredVoices.sort((a, b) => b.score - a.score)
    this.selectedVoice = scoredVoices[0].voice

    // Update config with selected voice
    this.config.voice_id = this.selectedVoice.id
    this.config.voice_name = this.selectedVoice.name
    this.config.language = this.selectedVoice.language
    this.config.gender = this.selectedVoice.gender

    console.log(`Selected TTS voice: ${this.selectedVoice.name} (score: ${scoredVoices[0].score})`)
  }

  private calculateVoiceScore(voice: TTSVoice, criteria?: VoicePreferenceCriteria): number {
    let score = 0

    // Base quality scores
    score += voice.naturalness_score * 0.4
    score += voice.clarity_score * 0.3
    score += voice.expressiveness_score * 0.2

    // Preference bonuses
    if (voice.is_default) score += 1
    if (voice.is_premium) score += 2
    if (voice.offline_capable) score += 1

    // Language match bonus
    if (criteria?.language && voice.language.startsWith(criteria.language)) {
      score += 5
    } else if (voice.language.startsWith(this.config.language)) {
      score += 3
    }

    // Gender/age preference bonuses
    if (criteria?.gender && voice.gender === criteria.gender) score += 2
    if (criteria?.age && voice.age === criteria.age) score += 1

    return score
  }

  /**
   * Text processing and optimization
   */
  private processTextForSpeech(text: string, textType?: string): string {
    let processedText = text

    // Remove or replace problematic characters
    processedText = processedText.replace(/[^\w\s.,!?;:()-]/g, '')

    // Expand abbreviations
    processedText = this.expandAbbreviations(processedText)

    // Optimize for specific content types
    if (textType) {
      processedText = this.optimizeForContentType(processedText, textType)
    }

    // Add natural pauses
    processedText = this.addNaturalPauses(processedText)

    return processedText
  }

  private expandAbbreviations(text: string): string {
    const abbreviations: Record<string, string> = {
      'e.g.': 'for example',
      'i.e.': 'that is',
      'etc.': 'etcetera',
      'vs.': 'versus',
      'Mr.': 'Mister',
      'Mrs.': 'Missus',
      'Dr.': 'Doctor',
      'Prof.': 'Professor',
      'Inc.': 'Incorporated',
      'Corp.': 'Corporation',
      'LLC': 'Limited Liability Company',
      'FAQ': 'Frequently Asked Questions',
      'CEO': 'Chief Executive Officer',
      'CTO': 'Chief Technology Officer',
      'API': 'Application Programming Interface',
      'URL': 'Web Address',
      'HTTP': 'HyperText Transfer Protocol',
      'HTML': 'HyperText Markup Language',
      'CSS': 'Cascading Style Sheets',
      'JS': 'JavaScript'
    }

    let result = text
    for (const [abbr, expansion] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'gi')
      result = result.replace(regex, expansion)
    }

    return result
  }

  private optimizeForContentType(text: string, textType: string): string {
    switch (textType) {
      case 'question':
        // Add emphasis to question words
        return text.replace(/\b(what|where|when|why|how|which|who)\b/gi, '$1')

      case 'answer':
        // Add pauses before key information
        return text.replace(/\b(correct|incorrect|true|false)\b/gi, '... $1')

      case 'explanation':
        // Add pauses at logical breaks
        return text.replace(/\. /g, '. ... ')

      case 'instruction':
        // Emphasize action words
        return text.replace(/\b(click|select|choose|enter|type)\b/gi, '$1')

      default:
        return text
    }
  }

  private addNaturalPauses(text: string): string {
    // Add short pauses at commas and longer at periods
    return text
      .replace(/,/g, ', ')
      .replace(/\./g, '. ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
  }

  /**
   * Cache management
   */
  private getCacheKey(request: TTSRequest): string {
    return `${this.tenant_id}:${this.config.voice_id}:${request.text}:${request.rate || this.config.rate}:${request.pitch || this.config.pitch}`
  }

  private getCachedResponse(cacheKey: string): TTSResponse | null {
    const cached = this.responseCache.get(cacheKey)
    if (cached && cached.expires_at && new Date(cached.expires_at) > new Date()) {
      return cached
    }
    if (cached) {
      this.responseCache.delete(cacheKey)
    }
    return null
  }

  private setCachedResponse(cacheKey: string, response: TTSResponse): void {
    if (response.cache_duration && response.cache_duration > 0) {
      response.expires_at = new Date(Date.now() + response.cache_duration * 1000).toISOString()
      this.responseCache.set(cacheKey, response)

      // Clean up expired cache entries
      setTimeout(() => this.cleanupCache(), this.cacheTimeout)
    }
  }

  private cleanupCache(): void {
    const now = new Date()
    for (const [key, response] of this.responseCache.entries()) {
      if (response.expires_at && new Date(response.expires_at) <= now) {
        this.responseCache.delete(key)
      }
    }
  }

  /**
   * Queue management
   */
  private addToQueue(item: SpeechQueueItem): void {
    // Insert based on priority
    let insertIndex = this.speechQueue.length

    for (let i = 0; i < this.speechQueue.length; i++) {
      if (this.speechQueue[i].priority < item.priority) {
        insertIndex = i
        break
      }
    }

    this.speechQueue.splice(insertIndex, 0, item)
    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.speechQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.speechQueue.length > 0) {
      const item = this.speechQueue.shift()!
      await this.processQueueItem(item)

      // Break if queue processing was stopped
      if (!this.isProcessingQueue) break
    }

    this.isProcessingQueue = false
  }

  private async processQueueItem(item: SpeechQueueItem): Promise<void> {
    this.currentQueueItem = item
    item.status = 'processing'
    item.started_at = new Date().toISOString()

    try {
      const response = await this.speakText(item.text, {
        ...item.config,
        priority: item.priority === 1 ? 'urgent' : 'normal'
      })

      if (response.success) {
        item.status = 'speaking'
        // Wait for speech to complete
        await this.waitForSpeechCompletion()
        item.status = 'completed'
        item.completed_at = new Date().toISOString()
        item.on_end?.()
      } else {
        item.status = 'error'
        item.on_error?.(response.error || 'Unknown error')
      }

    } catch (error) {
      item.status = 'error'
      item.on_error?.(String(error))
    }

    this.currentQueueItem = null
  }

  private waitForSpeechCompletion(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis || !this.synthesis.speaking) {
        resolve()
        return
      }

      const checkCompletion = () => {
        if (!this.synthesis?.speaking) {
          resolve()
        } else {
          setTimeout(checkCompletion, 100)
        }
      }

      checkCompletion()
    })
  }

  /**
   * Speech synthesis methods
   */
  private async speakText(text: string, config?: Partial<TTSConfig>): Promise<TTSResponse> {
    const startTime = performance.now()
    this.requestCount++

    if (!this.synthesis) {
      return {
        success: false,
        error: 'Speech synthesis not available',
        duration: 0,
        voice_used: 'none',
        language_used: 'none',
        processing_time: performance.now() - startTime,
        cached: false
      }
    }

    try {
      // Process text for optimal speech
      const processedText = this.processTextForSpeech(text)

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(processedText)

      // Apply configuration
      const finalConfig = { ...this.config, ...config }
      this.applyConfigToUtterance(utterance, finalConfig)

      // Set up utterance event handlers
      const response = await this.speakUtterance(utterance, processedText, startTime)

      // Update analytics
      this.updateAnalytics(response)

      return response

    } catch (error) {
      return {
        success: false,
        error: String(error),
        duration: 0,
        voice_used: this.selectedVoice?.name || 'unknown',
        language_used: this.config.language,
        processing_time: performance.now() - startTime,
        cached: false
      }
    }
  }

  private applyConfigToUtterance(utterance: SpeechSynthesisUtterance, config: TTSConfig): void {
    // Find the browser's SpeechSynthesisVoice
    if (this.selectedVoice) {
      const synthVoices = this.synthesis?.getVoices() || []
      const matchingVoice = synthVoices.find(v => v.name === this.selectedVoice?.name)
      if (matchingVoice) {
        utterance.voice = matchingVoice
      }
    }

    utterance.rate = config.rate
    utterance.pitch = config.pitch
    utterance.volume = config.volume
    utterance.lang = config.language
  }

  private speakUtterance(
    utterance: SpeechSynthesisUtterance,
    text: string,
    startTime: number
  ): Promise<TTSResponse> {
    return new Promise((resolve) => {
      this.currentUtterance = utterance
      this.setState('speaking')

      let resolved = false

      const resolveOnce = (response: TTSResponse) => {
        if (!resolved) {
          resolved = true
          resolve(response)
        }
      }

      utterance.onstart = () => {
        this.handlers.onStart?.(text)
      }

      utterance.onend = () => {
        this.setState('idle')
        this.handlers.onEnd?.(text)
        this.currentUtterance = null

        resolveOnce({
          success: true,
          duration: this.estimateSpeechDuration(text),
          voice_used: this.selectedVoice?.name || 'unknown',
          language_used: this.config.language,
          processing_time: performance.now() - startTime,
          cached: false
        })
      }

      utterance.onerror = (event) => {
        this.setState('error')
        this.handlers.onError?.(event.error)
        this.currentUtterance = null

        resolveOnce({
          success: false,
          error: event.error,
          duration: 0,
          voice_used: this.selectedVoice?.name || 'unknown',
          language_used: this.config.language,
          processing_time: performance.now() - startTime,
          cached: false
        })
      }

      utterance.onpause = () => {
        this.setState('paused')
        this.handlers.onPause?.()
      }

      utterance.onresume = () => {
        this.setState('speaking')
        this.handlers.onResume?.()
      }

      // Start speaking
      this.synthesis!.speak(utterance)

      // Fallback timeout
      setTimeout(() => {
        if (!resolved) {
          resolveOnce({
            success: false,
            error: 'Speech timeout',
            duration: 0,
            voice_used: this.selectedVoice?.name || 'unknown',
            language_used: this.config.language,
            processing_time: performance.now() - startTime,
            cached: false
          })
        }
      }, 30000) // 30 second timeout
    })
  }

  private estimateSpeechDuration(text: string): number {
    // Estimate based on word count and speech rate
    const wordCount = text.split(/\s+/).length
    const wordsPerMinute = 150 * this.config.rate // Average adjusted for rate
    return (wordCount / wordsPerMinute) * 60 // Duration in seconds
  }

  /**
   * State management
   */
  private setState(newState: TTSState): void {
    if (this.state !== newState) {
      this.state = newState
      this.handlers.onStateChange?.(newState)
    }
  }

  /**
   * Analytics
   */
  private updateAnalytics(response: TTSResponse): void {
    if (response.success) {
      this.totalSpeechDuration += response.duration
    }

    this.averageProcessingTime =
      (this.averageProcessingTime + response.processing_time) / 2
  }

  /**
   * Public API methods
   */
  public async speak(request: TTSRequest): Promise<TTSResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(request)
    const cachedResponse = this.getCachedResponse(cacheKey)

    if (cachedResponse) {
      return { ...cachedResponse, cached: true }
    }

    // Process request
    const response = await this.speakText(request.text, {
      voice_id: request.voice_id,
      language: request.language,
      rate: request.rate,
      pitch: request.pitch,
      volume: request.volume
    })

    // Cache response if successful
    if (response.success && request.cache_duration) {
      response.cache_duration = request.cache_duration
      this.setCachedResponse(cacheKey, response)
    }

    return response
  }

  public queue(text: string, options?: {
    priority?: number
    config?: Partial<TTSConfig>
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: string) => void
  }): string {
    const queueItem: SpeechQueueItem = {
      id: `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      config: options?.config || {},
      priority: options?.priority || 0,
      status: 'queued',
      created_at: new Date().toISOString(),
      source: 'user_request',
      interruption_allowed: true,
      on_start: options?.onStart,
      on_end: options?.onEnd,
      on_error: options?.onError
    }

    this.addToQueue(queueItem)
    return queueItem.id
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentUtterance = null
      this.setState('idle')
    }
  }

  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  public clearQueue(): void {
    this.speechQueue = []
    if (this.synthesis) {
      this.synthesis.cancel()
    }
    this.isProcessingQueue = false
  }

  public removeFromQueue(itemId: string): boolean {
    const index = this.speechQueue.findIndex(item => item.id === itemId)
    if (index >= 0) {
      this.speechQueue.splice(index, 1)
      return true
    }
    return false
  }

  public getAvailableVoices(): TTSVoice[] {
    return [...this.availableVoices]
  }

  public selectVoice(voiceId: string): boolean {
    const voice = this.availableVoices.find(v => v.id === voiceId)
    if (voice) {
      this.selectedVoice = voice
      this.config.voice_id = voice.id
      this.config.voice_name = voice.name
      return true
    }
    return false
  }

  public getSelectedVoice(): TTSVoice | null {
    return this.selectedVoice
  }

  public setHandlers(handlers: Partial<TTSHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  public updateConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config }

    // Re-select voice if criteria changed
    if (config.voice_id !== this.config.voice_id && config.voice_id) {
      this.selectVoice(config.voice_id)
    }
  }

  public getConfig(): TTSConfig {
    return { ...this.config }
  }

  public getState(): TTSState {
    return this.state
  }

  public getQueue(): SpeechQueueItem[] {
    return [...this.speechQueue]
  }

  public getAnalytics(): {
    request_count: number
    total_speech_duration: number
    average_processing_time: number
  } {
    return {
      request_count: this.requestCount,
      total_speech_duration: this.totalSpeechDuration,
      average_processing_time: this.averageProcessingTime
    }
  }

  public isSpeechSynthesisSupported(): boolean {
    return this.isSupported
  }

  public clearCache(): void {
    this.responseCache.clear()
  }

  public destroy(): void {
    this.stop()
    this.clearQueue()
    this.clearCache()
    this.handlers = {}
    this.synthesis = null
    this.selectedVoice = null
    this.availableVoices = []
  }
}

/**
 * Factory function to create TTS service
 */
export function createTextToSpeechService(
  tenant_id: string,
  user_id: string,
  config?: Partial<TTSConfig>
): TextToSpeechService {
  return new TextToSpeechService(tenant_id, user_id, config)
}

/**
 * Check if text-to-speech is available in current browser
 */
export function isTextToSpeechAvailable(): boolean {
  return !!(window.speechSynthesis && window.SpeechSynthesisUtterance)
}

/**
 * Get available speech synthesis voices (simplified)
 */
export function getAvailableTTSVoices(): TTSVoice[] {
  if (!isTextToSpeechAvailable()) return []

  const synthVoices = speechSynthesis.getVoices()
  return synthVoices.map((voice, index) => ({
    id: `voice-${index}`,
    name: voice.name,
    language: voice.lang,
    gender: 'neutral' as const,
    age: 'middle' as const,
    quality: voice.localService ? 'premium' as const : 'standard' as const,
    naturalness_score: voice.localService ? 8 : 6,
    clarity_score: 7,
    expressiveness_score: 5,
    ssml_support: false,
    emotion_support: [],
    style_support: [],
    is_default: voice.default,
    is_premium: voice.localService,
    download_required: !voice.localService,
    offline_capable: voice.localService,
    created_at: new Date().toISOString()
  }))
}