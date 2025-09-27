/**
 * MELLOWISE-031: Speech Recognition Service
 *
 * Advanced speech recognition using Web Speech API with intelligent
 * voice command processing and context-aware responses
 *
 * @version 1.0.0
 */

import {
  SpeechRecognitionConfig,
  SpeechRecognitionResult,
  VoiceCommand,
  VoiceCommandExecution,
  VoiceUsageMetrics,
  SUPPORTED_LANGUAGES,
  DEFAULT_SPEECH_CONFIG,
  isVoiceCommand
} from '../../types/voice-accessibility'

/**
 * Recognition state
 */
type RecognitionState = 'inactive' | 'listening' | 'processing' | 'error'

/**
 * Speech recognition event handlers
 */
interface SpeechRecognitionHandlers {
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  onStateChange?: (state: RecognitionState) => void
  onCommandExecuted?: (execution: VoiceCommandExecution) => void
}

/**
 * Command execution context
 */
interface CommandExecutionContext {
  page_path: string
  component_context?: string
  user_context?: Record<string, any>
}

/**
 * Speech Recognition Service Implementation
 */
export class SpeechRecognitionService {
  private tenant_id: string
  private user_id: string
  private session_id: string
  private config: SpeechRecognitionConfig
  private handlers: SpeechRecognitionHandlers = {}

  // Web Speech API
  private recognition: SpeechRecognition | null = null
  private isSupported: boolean = false
  private state: RecognitionState = 'inactive'

  // Voice commands
  private commands: Map<string, VoiceCommand> = new Map()
  private commandExecutions: VoiceCommandExecution[] = []

  // Metrics and analytics
  private metrics: VoiceUsageMetrics
  private sessionStartTime: number = 0

  // Interim results buffer
  private interimTranscript: string = ''
  private finalTranscript: string = ''

  constructor(
    tenant_id: string,
    user_id: string,
    session_id: string,
    config?: Partial<SpeechRecognitionConfig>
  ) {
    this.tenant_id = tenant_id
    this.user_id = user_id
    this.session_id = session_id
    this.config = { ...DEFAULT_SPEECH_CONFIG, ...config }

    this.isSupported = this.checkBrowserSupport()
    this.metrics = this.initializeMetrics()

    if (this.isSupported) {
      this.initializeSpeechRecognition()
      this.loadDefaultCommands()
    }
  }

  /**
   * Check browser support for Web Speech API
   */
  private checkBrowserSupport(): boolean {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    return !!SpeechRecognition
  }

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): VoiceUsageMetrics {
    return {
      tenant_id: this.tenant_id,
      id: `metrics-${Date.now()}`,
      user_id: this.user_id,
      session_id: this.session_id,
      date: new Date().toISOString().split('T')[0],
      total_speech_attempts: 0,
      successful_recognitions: 0,
      failed_recognitions: 0,
      average_confidence: 0,
      voice_commands_used: 0,
      unique_commands_used: 0,
      most_used_commands: {},
      command_success_rate: 0,
      tts_requests: 0,
      total_speech_duration: 0,
      average_speech_rate: 0,
      voice_session_duration: 0,
      voice_vs_keyboard_ratio: 0,
      accessibility_features_used: [],
      average_response_time: 0,
      error_rate: 0,
      recorded_at: new Date().toISOString()
    }
  }

  /**
   * Initialize Web Speech API
   */
  private initializeSpeechRecognition(): void {
    if (!this.isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    this.recognition = new SpeechRecognition()

    // Configure recognition
    this.recognition.lang = this.config.language || 'en-US'
    this.recognition.continuous = this.config.continuous || true
    this.recognition.interimResults = this.config.interim_results || true
    this.recognition.maxAlternatives = this.config.max_alternatives || 3

    // Set up event handlers
    this.recognition.onstart = () => {
      this.setState('listening')
      this.sessionStartTime = performance.now()
      console.log('Speech recognition started')
    }

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event)
    }

    this.recognition.onerror = (event) => {
      this.handleRecognitionError(event)
    }

    this.recognition.onend = () => {
      this.setState('inactive')
      this.updateSessionMetrics()
      console.log('Speech recognition ended')
    }

    // Handle silence timeout
    if (this.config.silence_timeout) {
      this.setupSilenceTimeout()
    }
  }

  /**
   * Load default voice commands
   */
  private loadDefaultCommands(): void {
    const defaultCommands: VoiceCommand[] = [
      {
        id: 'navigate-home',
        name: 'Navigate Home',
        patterns: ['go home', 'navigate home', 'home page'],
        aliases: ['take me home', 'back to home'],
        category: 'navigation',
        scope: 'global',
        priority: 1,
        action: 'navigate',
        parameters: { path: '/' },
        confirmation_required: false,
        description: 'Navigate to the home page',
        help_text: 'Say "go home" to navigate to the home page',
        keyboard_equivalent: 'Alt+H',
        requires_authentication: false,
        requires_premium: false,
        device_types: ['desktop', 'mobile', 'tablet'],
        browser_support: ['chrome', 'firefox', 'safari', 'edge'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'start-practice',
        name: 'Start Practice Session',
        patterns: ['start practice', 'begin practice', 'practice mode'],
        aliases: ['lets practice', 'start studying'],
        category: 'study',
        scope: 'global',
        priority: 1,
        action: 'start_practice',
        confirmation_required: false,
        description: 'Start a new practice session',
        help_text: 'Say "start practice" to begin studying',
        requires_authentication: true,
        requires_premium: false,
        device_types: ['desktop', 'mobile', 'tablet'],
        browser_support: ['chrome', 'firefox', 'safari', 'edge'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'read-question',
        name: 'Read Current Question',
        patterns: ['read question', 'read this question', 'what is the question'],
        aliases: ['read aloud', 'speak question'],
        category: 'accessibility',
        scope: 'component',
        priority: 2,
        action: 'read_text',
        parameters: { target: 'current_question' },
        confirmation_required: false,
        description: 'Read the current question aloud',
        help_text: 'Say "read question" to hear the current question',
        requires_authentication: true,
        requires_premium: false,
        device_types: ['desktop', 'mobile', 'tablet'],
        browser_support: ['chrome', 'firefox', 'safari', 'edge'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'select-answer',
        name: 'Select Answer',
        patterns: ['select answer {letter}', 'choose {letter}', 'answer {letter}'],
        aliases: ['pick {letter}', 'option {letter}'],
        category: 'interaction',
        scope: 'component',
        priority: 1,
        action: 'select_answer',
        parameters: { extract_param: 'letter' },
        confirmation_required: true,
        description: 'Select an answer choice',
        help_text: 'Say "select answer A" to choose option A',
        requires_authentication: true,
        requires_premium: false,
        device_types: ['desktop', 'mobile', 'tablet'],
        browser_support: ['chrome', 'firefox', 'safari', 'edge'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'help',
        name: 'Voice Help',
        patterns: ['help', 'voice help', 'what can I say', 'commands'],
        aliases: ['assistance', 'voice commands'],
        category: 'system',
        scope: 'global',
        priority: 3,
        action: 'show_help',
        confirmation_required: false,
        description: 'Show available voice commands',
        help_text: 'Say "help" to see available voice commands',
        requires_authentication: false,
        requires_premium: false,
        device_types: ['desktop', 'mobile', 'tablet'],
        browser_support: ['chrome', 'firefox', 'safari', 'edge'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'pause-recognition',
        name: 'Pause Voice Recognition',
        patterns: ['stop listening', 'pause voice', 'voice off'],
        aliases: ['turn off voice', 'disable voice'],
        category: 'system',
        scope: 'global',
        priority: 1,
        action: 'pause_recognition',
        confirmation_required: false,
        description: 'Pause voice recognition temporarily',
        help_text: 'Say "stop listening" to pause voice recognition',
        requires_authentication: false,
        requires_premium: false,
        device_types: ['desktop', 'mobile', 'tablet'],
        browser_support: ['chrome', 'firefox', 'safari', 'edge'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ]

    defaultCommands.forEach(command => {
      this.addCommand(command)
    })
  }

  /**
   * Handle speech recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    this.setState('processing')

    let interimTranscript = ''
    let finalTranscript = ''

    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = result[0].transcript

      if (result.isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    this.interimTranscript = interimTranscript
    this.finalTranscript += finalTranscript

    // Create recognition result
    const recognitionResult: SpeechRecognitionResult = {
      transcript: finalTranscript || interimTranscript,
      confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0,
      is_final: finalTranscript.length > 0,
      alternatives: this.extractAlternatives(event.results[event.results.length - 1]),
      start_time: event.timeStamp || performance.now(),
      end_time: performance.now(),
      duration: performance.now() - (event.timeStamp || performance.now()),
      language_detected: this.config.language || 'en-US',
      acoustic_confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0
    }

    // Update metrics
    this.updateRecognitionMetrics(recognitionResult)

    // Emit result event
    this.handlers.onResult?.(recognitionResult)

    // Process voice commands if final result
    if (recognitionResult.is_final && recognitionResult.confidence >= this.config.confidence_threshold) {
      this.processVoiceCommands(recognitionResult)
    }

    this.setState('listening')
  }

  /**
   * Handle recognition errors
   */
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    const errorMessage = this.getErrorMessage(event.error)

    console.error('Speech recognition error:', errorMessage)
    this.setState('error')

    // Update metrics
    this.metrics.failed_recognitions++
    this.metrics.error_rate = this.metrics.failed_recognitions /
      (this.metrics.successful_recognitions + this.metrics.failed_recognitions)

    // Emit error event
    this.handlers.onError?.(errorMessage)

    // Auto-restart if appropriate
    if (this.shouldAutoRestart(event.error)) {
      setTimeout(() => {
        if (this.state === 'error') {
          this.start()
        }
      }, 1000)
    }
  }

  /**
   * Process voice commands from transcript
   */
  private async processVoiceCommands(result: SpeechRecognitionResult): Promise<void> {
    const transcript = result.transcript.toLowerCase().trim()

    // Find matching commands
    const matchedCommands = this.findMatchingCommands(transcript)

    if (matchedCommands.length === 0) {
      console.log('No matching voice commands found for:', transcript)
      return
    }

    // Execute the highest priority command
    const commandToExecute = matchedCommands[0]
    await this.executeCommand(commandToExecute, result, transcript)
  }

  /**
   * Find matching voice commands
   */
  private findMatchingCommands(transcript: string): VoiceCommand[] {
    const matched: Array<{ command: VoiceCommand; confidence: number }> = []

    for (const command of this.commands.values()) {
      if (!command.is_active) continue

      // Check patterns
      for (const pattern of command.patterns) {
        const confidence = this.calculatePatternMatch(transcript, pattern)
        if (confidence > 0.7) { // 70% confidence threshold
          matched.push({ command, confidence })
          break
        }
      }

      // Check aliases if no pattern match
      if (!matched.find(m => m.command.id === command.id)) {
        for (const alias of command.aliases) {
          const confidence = this.calculatePatternMatch(transcript, alias)
          if (confidence > 0.6) { // Lower threshold for aliases
            matched.push({ command, confidence })
            break
          }
        }
      }
    }

    // Sort by priority and confidence
    return matched
      .sort((a, b) => {
        if (a.command.priority !== b.command.priority) {
          return a.command.priority - b.command.priority
        }
        return b.confidence - a.confidence
      })
      .map(m => m.command)
  }

  /**
   * Calculate pattern matching confidence
   */
  private calculatePatternMatch(transcript: string, pattern: string): number {
    const transcriptWords = transcript.toLowerCase().split(/\s+/)
    const patternWords = pattern.toLowerCase().replace(/\{[^}]+\}/g, '.*').split(/\s+/)

    // Simple fuzzy matching
    let matchedWords = 0
    let totalWords = patternWords.length

    for (let i = 0; i < patternWords.length; i++) {
      const patternWord = patternWords[i]

      if (patternWord === '.*') {
        matchedWords++ // Wildcard matches
        continue
      }

      // Check if any transcript word matches this pattern word
      const wordMatch = transcriptWords.some(word => {
        if (word === patternWord) return true

        // Check similarity (simple edit distance)
        return this.calculateSimilarity(word, patternWord) > 0.8
      })

      if (wordMatch) matchedWords++
    }

    return matchedWords / totalWords
  }

  /**
   * Calculate string similarity (simplified Levenshtein)
   */
  private calculateSimilarity(a: string, b: string): number {
    const maxLength = Math.max(a.length, b.length)
    if (maxLength === 0) return 1

    const distance = this.levenshteinDistance(a, b)
    return (maxLength - distance) / maxLength
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0))

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }

    return matrix[a.length][b.length]
  }

  /**
   * Execute voice command
   */
  private async executeCommand(
    command: VoiceCommand,
    recognitionResult: SpeechRecognitionResult,
    spokenText: string
  ): Promise<void> {
    const startTime = performance.now()

    const execution: VoiceCommandExecution = {
      tenant_id: this.tenant_id,
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: this.user_id,
      session_id: this.session_id,
      command_id: command.id,
      spoken_text: spokenText,
      recognized_pattern: command.patterns[0], // Use first pattern as recognized
      confidence: recognitionResult.confidence,
      executed_at: new Date().toISOString(),
      execution_duration: 0, // Will be updated
      success: false, // Will be updated
      page_path: window?.location?.pathname || '/',
      user_context: {},
      action_performed: command.action,
      parameters_used: { ...command.parameters },
      created_at: new Date().toISOString()
    }

    try {
      // Extract parameters from spoken text if needed
      if (command.parameters?.extract_param) {
        const extractedValue = this.extractParameterFromSpeech(
          spokenText,
          command.patterns[0],
          command.parameters.extract_param
        )
        if (extractedValue) {
          execution.parameters_used[command.parameters.extract_param] = extractedValue
        }
      }

      // Execute the command action
      const success = await this.performCommandAction(command, execution.parameters_used)

      execution.success = success
      execution.execution_duration = performance.now() - startTime

      // Update metrics
      this.updateCommandMetrics(command, execution)

      // Emit execution event
      this.handlers.onCommandExecuted?.(execution)

      console.log(`Voice command executed: ${command.name}`, { success, duration: execution.execution_duration })

    } catch (error) {
      execution.success = false
      execution.execution_duration = performance.now() - startTime
      execution.error_message = String(error)

      console.error('Voice command execution failed:', error)
    }

    this.commandExecutions.push(execution)
  }

  /**
   * Extract parameter from speech
   */
  private extractParameterFromSpeech(
    spokenText: string,
    pattern: string,
    paramName: string
  ): string | null {
    // Convert pattern to regex
    const regex = new RegExp(
      pattern.replace(/\{[^}]+\}/g, '([A-Za-z0-9]+)'),
      'i'
    )

    const match = spokenText.match(regex)
    return match ? match[1] : null
  }

  /**
   * Perform command action
   */
  private async performCommandAction(
    command: VoiceCommand,
    parameters: Record<string, any>
  ): Promise<boolean> {
    try {
      switch (command.action) {
        case 'navigate':
          return this.performNavigationAction(parameters)

        case 'start_practice':
          return this.performStartPracticeAction()

        case 'read_text':
          return this.performReadTextAction(parameters)

        case 'select_answer':
          return this.performSelectAnswerAction(parameters)

        case 'show_help':
          return this.performShowHelpAction()

        case 'pause_recognition':
          return this.performPauseRecognitionAction()

        default:
          // Emit custom command event for application handling
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('voiceCommand', {
              detail: { command: command.action, parameters }
            }))
          }
          return true
      }
    } catch (error) {
      console.error(`Command action failed: ${command.action}`, error)
      return false
    }
  }

  /**
   * Command action implementations
   */
  private performNavigationAction(parameters: Record<string, any>): boolean {
    if (parameters.path && typeof window !== 'undefined') {
      window.location.href = parameters.path
      return true
    }
    return false
  }

  private performStartPracticeAction(): boolean {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('startPracticeSession'))
      return true
    }
    return false
  }

  private performReadTextAction(parameters: Record<string, any>): boolean {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('readTextAloud', {
        detail: { target: parameters.target }
      }))
      return true
    }
    return false
  }

  private performSelectAnswerAction(parameters: Record<string, any>): boolean {
    if (parameters.letter && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('selectAnswer', {
        detail: { answer: parameters.letter.toUpperCase() }
      }))
      return true
    }
    return false
  }

  private performShowHelpAction(): boolean {
    const availableCommands = Array.from(this.commands.values())
      .filter(cmd => cmd.is_active)
      .map(cmd => ({
        name: cmd.name,
        patterns: cmd.patterns,
        help_text: cmd.help_text
      }))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showVoiceHelp', {
        detail: { commands: availableCommands }
      }))
      return true
    }
    return false
  }

  private performPauseRecognitionAction(): boolean {
    this.stop()
    return true
  }

  /**
   * Utility methods
   */
  private extractAlternatives(result: SpeechRecognitionResult): Array<{ transcript: string; confidence: number }> {
    if (!result) return []

    const alternatives: Array<{ transcript: string; confidence: number }> = []
    for (let i = 0; i < Math.min(result.length, this.config.max_alternatives); i++) {
      alternatives.push({
        transcript: result[i].transcript,
        confidence: result[i].confidence
      })
    }
    return alternatives
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'no-speech':
        return 'No speech detected. Please try speaking again.'
      case 'audio-capture':
        return 'Microphone access error. Please check your microphone permissions.'
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access to use voice features.'
      case 'network':
        return 'Network error occurred during speech recognition.'
      case 'aborted':
        return 'Speech recognition was aborted.'
      case 'bad-grammar':
        return 'Grammar error in speech recognition configuration.'
      case 'language-not-supported':
        return `Language '${this.config.language}' is not supported.`
      default:
        return `Speech recognition error: ${errorCode}`
    }
  }

  private shouldAutoRestart(errorCode: string): boolean {
    // Don't auto-restart for permission or configuration errors
    const nonRestartableErrors = ['not-allowed', 'audio-capture', 'bad-grammar', 'language-not-supported']
    return !nonRestartableErrors.includes(errorCode)
  }

  private setState(newState: RecognitionState): void {
    if (this.state !== newState) {
      this.state = newState
      this.handlers.onStateChange?.(newState)
    }
  }

  private setupSilenceTimeout(): void {
    // Implementation would set up silence detection
    // For now, using recognition's natural timeout behavior
  }

  private updateRecognitionMetrics(result: SpeechRecognitionResult): void {
    this.metrics.total_speech_attempts++

    if (result.confidence >= this.config.confidence_threshold) {
      this.metrics.successful_recognitions++
    } else {
      this.metrics.failed_recognitions++
    }

    // Update average confidence (moving average)
    this.metrics.average_confidence =
      (this.metrics.average_confidence + result.confidence) / 2

    // Update error rate
    this.metrics.error_rate =
      this.metrics.failed_recognitions / this.metrics.total_speech_attempts
  }

  private updateCommandMetrics(command: VoiceCommand, execution: VoiceCommandExecution): void {
    this.metrics.voice_commands_used++

    // Track unique commands
    if (!this.metrics.most_used_commands[command.id]) {
      this.metrics.unique_commands_used++
      this.metrics.most_used_commands[command.id] = 0
    }
    this.metrics.most_used_commands[command.id]++

    // Update success rate
    const successfulCommands = this.commandExecutions.filter(e => e.success).length
    this.metrics.command_success_rate = successfulCommands / this.commandExecutions.length

    // Update response time
    this.metrics.average_response_time =
      (this.metrics.average_response_time + execution.execution_duration) / 2
  }

  private updateSessionMetrics(): void {
    if (this.sessionStartTime > 0) {
      const sessionDuration = performance.now() - this.sessionStartTime
      this.metrics.voice_session_duration += sessionDuration
    }
  }

  /**
   * Public API methods
   */
  public async start(): Promise<boolean> {
    if (!this.isSupported) {
      console.error('Speech recognition not supported in this browser')
      return false
    }

    if (!this.recognition) {
      console.error('Speech recognition not initialized')
      return false
    }

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      return false
    }
  }

  public stop(): void {
    if (this.recognition && this.state !== 'inactive') {
      this.recognition.stop()
    }
  }

  public abort(): void {
    if (this.recognition) {
      this.recognition.abort()
    }
  }

  public addCommand(command: VoiceCommand): void {
    if (isVoiceCommand(command)) {
      this.commands.set(command.id, command)
      console.log(`Voice command added: ${command.name}`)
    } else {
      console.error('Invalid voice command:', command)
    }
  }

  public removeCommand(commandId: string): void {
    this.commands.delete(commandId)
  }

  public updateCommand(commandId: string, updates: Partial<VoiceCommand>): void {
    const command = this.commands.get(commandId)
    if (command) {
      const updatedCommand = { ...command, ...updates, updated_at: new Date().toISOString() }
      this.commands.set(commandId, updatedCommand)
    }
  }

  public getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values())
  }

  public setHandlers(handlers: Partial<SpeechRecognitionHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  public updateConfig(config: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...config }

    // Update recognition if active
    if (this.recognition) {
      this.recognition.lang = this.config.language || 'en-US'
      this.recognition.continuous = this.config.continuous || true
      this.recognition.interimResults = this.config.interim_results || true
      this.recognition.maxAlternatives = this.config.max_alternatives || 3
    }
  }

  public getState(): RecognitionState {
    return this.state
  }

  public getMetrics(): VoiceUsageMetrics {
    return { ...this.metrics }
  }

  public getExecutionHistory(): VoiceCommandExecution[] {
    return [...this.commandExecutions]
  }

  public clearExecutionHistory(): void {
    this.commandExecutions = []
  }

  public isRecognitionSupported(): boolean {
    return this.isSupported
  }

  public getSupportedLanguages(): string[] {
    return [...SUPPORTED_LANGUAGES]
  }

  public destroy(): void {
    this.stop()
    this.commands.clear()
    this.commandExecutions = []
    this.handlers = {}
    this.recognition = null
  }
}

/**
 * Factory function to create speech recognition service
 */
export function createSpeechRecognitionService(
  tenant_id: string,
  user_id: string,
  session_id: string,
  config?: Partial<SpeechRecognitionConfig>
): SpeechRecognitionService {
  return new SpeechRecognitionService(tenant_id, user_id, session_id, config)
}

/**
 * Check if speech recognition is available in current browser
 */
export function isSpeechRecognitionAvailable(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}