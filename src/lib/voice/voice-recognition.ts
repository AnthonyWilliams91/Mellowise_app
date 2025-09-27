/**
 * Voice Recognition Service
 * MELLOWISE-031: Advanced voice recognition with command processing
 */

import React from 'react';
import type {
  VoiceRecognitionConfig,
  VoiceCommand,
  VoiceAction,
  VoiceContext,
  VoiceRecognitionResult,
  VoiceAlternative,
  VoiceCommandMatch,
  DEFAULT_VOICE_COMMANDS,
  DEFAULT_VOICE_SETTINGS
} from '@/types/voice-interface';

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSupported = false;
  private config: VoiceRecognitionConfig;
  private commands: Map<string, VoiceCommand> = new Map();
  private currentContext: VoiceContext = 'global';
  private confidenceThreshold = 0.7;
  private onResult?: (result: VoiceRecognitionResult) => void;
  private onCommand?: (match: VoiceCommandMatch) => void;
  private onError?: (error: Event) => void;

  constructor(config?: Partial<VoiceRecognitionConfig>) {
    this.config = {
      language: DEFAULT_VOICE_SETTINGS.config.language,
      continuous: true,
      interimResults: true,
      maxAlternatives: 5,
      ...config
    };

    this.initialize();
    this.loadDefaultCommands();
  }

  /**
   * Start voice recognition
   */
  async startListening(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    if (this.isListening) {
      console.warn('Voice recognition is already active');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.recognition) {
        this.recognition.start();
        this.isListening = true;
        console.log('🎙️ Voice recognition started');
      }
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw new Error('Microphone permission denied or not available');
    }
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (!this.isListening || !this.recognition) return;

    this.recognition.stop();
    this.isListening = false;
    console.log('🔇 Voice recognition stopped');
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Set current context for command matching
   */
  setContext(context: VoiceContext): void {
    this.currentContext = context;
    console.log(`🎯 Voice context changed to: ${context}`);
  }

  /**
   * Register a voice command
   */
  registerCommand(command: VoiceCommand): void {
    this.commands.set(command.phrase.toLowerCase(), command);

    // Also register aliases
    command.aliases.forEach(alias => {
      this.commands.set(alias.toLowerCase(), { ...command, phrase: alias });
    });

    console.log(`📝 Registered voice command: ${command.phrase}`);
  }

  /**
   * Unregister a voice command
   */
  unregisterCommand(phrase: string): void {
    const command = this.commands.get(phrase.toLowerCase());
    if (!command) return;

    this.commands.delete(phrase.toLowerCase());

    // Remove aliases too
    command.aliases.forEach(alias => {
      this.commands.delete(alias.toLowerCase());
    });

    console.log(`🗑️ Unregistered voice command: ${phrase}`);
  }

  /**
   * Process voice transcript and find matching commands
   */
  processCommand(transcript: string): VoiceCommandMatch | null {
    const normalizedTranscript = transcript.toLowerCase().trim();

    // Try exact phrase matching first
    for (const [phrase, command] of this.commands) {
      if (this.isCommandInContext(command) && normalizedTranscript.includes(phrase)) {
        return {
          command,
          confidence: 1.0,
          parameters: this.extractParameters(phrase, normalizedTranscript),
          rawTranscript: transcript
        };
      }
    }

    // Try fuzzy matching for similar phrases
    const fuzzyMatches = this.findFuzzyMatches(normalizedTranscript);
    if (fuzzyMatches.length > 0) {
      const bestMatch = fuzzyMatches[0];
      if (bestMatch.confidence >= this.confidenceThreshold) {
        return bestMatch;
      }
    }

    return null;
  }

  /**
   * Set result callback
   */
  onRecognitionResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResult = callback;
  }

  /**
   * Set command callback
   */
  onCommandRecognized(callback: (match: VoiceCommandMatch) => void): void {
    this.onCommand = callback;
  }

  /**
   * Set error callback
   */
  onRecognitionError(callback: (error: Event) => void): void {
    this.onError = callback;
  }

  /**
   * Update recognition configuration
   */
  updateConfig(newConfig: Partial<VoiceRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
    }
  }

  /**
   * Get available voice commands for current context
   */
  getAvailableCommands(): VoiceCommand[] {
    return Array.from(this.commands.values()).filter(command =>
      this.isCommandInContext(command) && command.enabled
    );
  }

  /**
   * Set confidence threshold for command matching
   */
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize speech recognition
   */
  private initialize(): void {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();

    this.setupRecognition();
  }

  /**
   * Setup speech recognition event handlers
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    // Configure recognition
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // Handle results
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const latestResult = results[results.length - 1];

      if (latestResult) {
        const transcript = latestResult[0].transcript;
        const confidence = latestResult[0].confidence;
        const alternatives: VoiceAlternative[] = Array.from(latestResult).map(result => ({
          transcript: result.transcript,
          confidence: result.confidence
        }));

        const recognitionResult: VoiceRecognitionResult = {
          transcript,
          confidence,
          isFinal: latestResult.isFinal,
          alternatives,
          timestamp: new Date()
        };

        // Notify result callback
        if (this.onResult) {
          this.onResult(recognitionResult);
        }

        // Process commands if result is final and confident enough
        if (latestResult.isFinal && confidence >= this.confidenceThreshold) {
          const commandMatch = this.processCommand(transcript);
          if (commandMatch && this.onCommand) {
            this.onCommand(commandMatch);
          }
        }
      }
    };

    // Handle errors
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);

      if (this.onError) {
        this.onError(event);
      }

      // Handle specific error types
      switch (event.error) {
        case 'not-allowed':
          console.error('Microphone access denied');
          break;
        case 'network':
          console.error('Network error during recognition');
          break;
        case 'no-speech':
          console.warn('No speech detected');
          break;
        default:
          console.error(`Recognition error: ${event.error}`);
      }
    };

    // Handle start
    this.recognition.onstart = () => {
      console.log('🎙️ Speech recognition started');
    };

    // Handle end
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🔇 Speech recognition ended');

      // Restart if continuous mode and not manually stopped
      if (this.config.continuous && this.isListening) {
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            this.recognition.start();
          }
        }, 100);
      }
    };
  }

  /**
   * Load default voice commands
   */
  private loadDefaultCommands(): void {
    DEFAULT_VOICE_COMMANDS.forEach(command => {
      this.registerCommand(command);
    });
  }

  /**
   * Check if command is available in current context
   */
  private isCommandInContext(command: VoiceCommand): boolean {
    if (!command.context) return true;
    return command.context === this.currentContext || command.context === 'global';
  }

  /**
   * Extract parameters from voice command
   */
  private extractParameters(phrase: string, transcript: string): Record<string, any> {
    const parameters: Record<string, any> = {};

    // Extract answer selections (A, B, C, D, E)
    const answerMatch = transcript.match(/\b([A-E])\b/i);
    if (answerMatch && phrase.includes('answer')) {
      parameters.answer = answerMatch[1].toUpperCase();
    }

    // Extract numbers
    const numberMatch = transcript.match(/\b(\d+)\b/);
    if (numberMatch) {
      parameters.number = parseInt(numberMatch[1], 10);
    }

    // Extract navigation directions
    if (transcript.includes('next') || transcript.includes('forward')) {
      parameters.direction = 'next';
    } else if (transcript.includes('previous') || transcript.includes('back')) {
      parameters.direction = 'previous';
    }

    return parameters;
  }

  /**
   * Find fuzzy matches for transcript
   */
  private findFuzzyMatches(transcript: string): VoiceCommandMatch[] {
    const matches: VoiceCommandMatch[] = [];

    for (const [phrase, command] of this.commands) {
      if (!this.isCommandInContext(command)) continue;

      const similarity = this.calculateSimilarity(transcript, phrase);
      if (similarity > 0.6) { // 60% similarity threshold
        matches.push({
          command,
          confidence: similarity,
          parameters: this.extractParameters(phrase, transcript),
          rawTranscript: transcript
        });
      }
    }

    // Sort by confidence (descending)
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

/**
 * React Hook for Voice Recognition
 */
export function useVoiceRecognition(config?: Partial<VoiceRecognitionConfig>) {
  const [service] = React.useState(() => new VoiceRecognitionService(config));
  const [isListening, setIsListening] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<VoiceRecognitionResult | null>(null);
  const [lastCommand, setLastCommand] = React.useState<VoiceCommandMatch | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsSupported(service.isVoiceSupported());

    service.onRecognitionResult(setLastResult);
    service.onCommandRecognized(setLastCommand);
    service.onRecognitionError((event) => {
      setError((event as SpeechRecognitionErrorEvent).error);
    });

    return () => {
      service.stopListening();
    };
  }, [service]);

  const startListening = React.useCallback(async () => {
    try {
      await service.startListening();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [service]);

  const stopListening = React.useCallback(() => {
    service.stopListening();
    setIsListening(false);
  }, [service]);

  const registerCommand = React.useCallback((command: VoiceCommand) => {
    service.registerCommand(command);
  }, [service]);

  const setContext = React.useCallback((context: VoiceContext) => {
    service.setContext(context);
  }, [service]);

  return {
    startListening,
    stopListening,
    registerCommand,
    setContext,
    isListening,
    isSupported,
    lastResult,
    lastCommand,
    error,
    availableCommands: service.getAvailableCommands()
  };
}

// Export singleton instance
export const voiceRecognition = new VoiceRecognitionService();