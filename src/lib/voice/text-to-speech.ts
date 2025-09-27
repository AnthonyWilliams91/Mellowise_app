/**
 * Text-to-Speech Service
 * MELLOWISE-031: Advanced text-to-speech with queue management and voice selection
 */

import React from 'react';
import type {
  TextToSpeechConfig,
  SpeechOptions,
  SpeechQueue,
  VoiceSettings,
  DEFAULT_VOICE_SETTINGS
} from '@/types/voice-interface';

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private isSupported = false;
  private config: TextToSpeechConfig;
  private speechQueue: SpeechQueue[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private isPaused = false;
  private isProcessing = false;

  constructor(config?: Partial<TextToSpeechConfig>) {
    this.config = {
      ...DEFAULT_VOICE_SETTINGS.config,
      ...config
    };

    this.initialize();
  }

  /**
   * Speak text with options
   */
  async speak(text: string, options?: Partial<SpeechOptions>): Promise<void> {
    if (!this.isSupported) {
      console.warn('Text-to-speech is not supported in this browser');
      return;
    }

    if (!text.trim()) {
      console.warn('Empty text provided to speak');
      return;
    }

    const speechOptions: SpeechOptions = {
      text: text.trim(),
      priority: 'normal',
      interruptible: true,
      ...options
    };

    // Create utterance
    const utterance = this.createUtterance(speechOptions);

    // Create queue entry
    const queueEntry: SpeechQueue = {
      id: `speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      options: speechOptions,
      utterance,
      status: 'pending',
      createdAt: new Date()
    };

    // Handle priority queue insertion
    this.insertIntoQueue(queueEntry);

    // Process queue
    this.processQueue();

    // Return promise that resolves when this specific utterance completes
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));
    });
  }

  /**
   * Pause speech synthesis
   */
  pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.isPaused = true;
      console.log('🔇 Speech paused');
    }
  }

  /**
   * Resume speech synthesis
   */
  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
      this.isPaused = false;
      console.log('🔊 Speech resumed');
    }
  }

  /**
   * Stop all speech and clear queue
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.speechQueue = [];
      this.currentUtterance = null;
      this.isProcessing = false;
      this.isPaused = false;
      console.log('⏹️ Speech stopped and queue cleared');
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Check if speech is paused
   */
  isSpeechPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.availableVoices];
  }

  /**
   * Set voice by name or voice object
   */
  setVoice(voice: string | SpeechSynthesisVoice): void {
    if (typeof voice === 'string') {
      const foundVoice = this.availableVoices.find(v =>
        v.name.toLowerCase().includes(voice.toLowerCase()) ||
        v.voiceURI.toLowerCase().includes(voice.toLowerCase())
      );

      if (foundVoice) {
        this.config.voice = foundVoice;
        this.config.voiceURI = foundVoice.voiceURI;
        console.log(`🎤 Voice set to: ${foundVoice.name}`);
      } else {
        console.warn(`Voice "${voice}" not found`);
      }
    } else {
      this.config.voice = voice;
      this.config.voiceURI = voice.voiceURI;
      console.log(`🎤 Voice set to: ${voice.name}`);
    }
  }

  /**
   * Update speech configuration
   */
  updateConfig(newConfig: Partial<TextToSpeechConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): TextToSpeechConfig {
    return { ...this.config };
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    currentSpeech: string | null;
    isProcessing: boolean;
    isPaused: boolean;
  } {
    return {
      queueLength: this.speechQueue.length,
      currentSpeech: this.currentUtterance?.text || null,
      isProcessing: this.isProcessing,
      isPaused: this.isPaused
    };
  }

  /**
   * Clear speech queue
   */
  clearQueue(): void {
    this.speechQueue = [];
    console.log('🗑️ Speech queue cleared');
  }

  /**
   * Skip current speech
   */
  skipCurrent(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  /**
   * Speak question text with appropriate voice settings
   */
  async speakQuestion(question: string): Promise<void> {
    return this.speak(question, {
      priority: 'high',
      interruptible: true
    });
  }

  /**
   * Speak answer choices
   */
  async speakAnswers(answers: string[]): Promise<void> {
    const answerText = answers
      .map((answer, index) => `Option ${String.fromCharCode(65 + index)}: ${answer}`)
      .join('. ');

    return this.speak(answerText, {
      priority: 'normal',
      interruptible: true
    });
  }

  /**
   * Speak explanation with slower rate
   */
  async speakExplanation(explanation: string): Promise<void> {
    // Create temporary utterance with slower rate
    const originalRate = this.config.rate;
    this.config.rate = Math.max(0.1, originalRate - 0.2);

    try {
      await this.speak(explanation, {
        priority: 'normal',
        interruptible: true
      });
    } finally {
      this.config.rate = originalRate;
    }
  }

  /**
   * Announce system message
   */
  async announce(message: string): Promise<void> {
    return this.speak(message, {
      priority: 'high',
      interruptible: false
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize text-to-speech
   */
  private initialize(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      console.log('🎤 Text-to-speech initialized');
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const loadVoicesFunc = () => {
      this.availableVoices = this.synthesis!.getVoices();

      // Set default voice if not set
      if (!this.config.voice && this.availableVoices.length > 0) {
        // Prefer English voices
        const englishVoice = this.availableVoices.find(voice =>
          voice.lang.startsWith('en') && voice.default
        );

        this.config.voice = englishVoice || this.availableVoices[0];
        this.config.voiceURI = this.config.voice.voiceURI;
      }

      console.log(`📢 Loaded ${this.availableVoices.length} voices`);
    };

    // Load voices immediately
    loadVoicesFunc();

    // Also listen for voices changed event (some browsers load voices asynchronously)
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesFunc;
    }
  }

  /**
   * Create speech utterance from options
   */
  private createUtterance(options: SpeechOptions): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(options.text);

    // Apply configuration
    if (this.config.voice) {
      utterance.voice = this.config.voice;
    }
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;
    utterance.lang = this.config.language;

    // Set up event handlers
    utterance.onstart = () => {
      console.log(`🗣️ Speaking: "${options.text.substring(0, 50)}..."`);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      console.log('✅ Speech completed');
      if (options.onEnd) options.onEnd();
      this.onUtteranceComplete();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (options.onError) options.onError(event);
      this.onUtteranceComplete();
    };

    utterance.onboundary = (event) => {
      if (options.onBoundary) options.onBoundary(event);
    };

    return utterance;
  }

  /**
   * Insert speech entry into queue based on priority
   */
  private insertIntoQueue(entry: SpeechQueue): void {
    if (entry.options.priority === 'high') {
      // High priority - interrupt current speech if interruptible
      if (this.currentUtterance && this.synthesis?.speaking) {
        const currentEntry = this.speechQueue.find(q => q.utterance === this.currentUtterance);
        if (currentEntry?.options.interruptible !== false) {
          this.synthesis.cancel();
        }
      }

      // Insert at front of queue
      this.speechQueue.unshift(entry);
    } else if (entry.options.priority === 'low') {
      // Low priority - add to end
      this.speechQueue.push(entry);
    } else {
      // Normal priority - insert after other normal priority items
      const insertIndex = this.speechQueue.findIndex(q => q.options.priority === 'low');
      if (insertIndex === -1) {
        this.speechQueue.push(entry);
      } else {
        this.speechQueue.splice(insertIndex, 0, entry);
      }
    }
  }

  /**
   * Process speech queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.speechQueue.length === 0) return;

    this.isProcessing = true;

    while (this.speechQueue.length > 0) {
      const entry = this.speechQueue.shift();
      if (!entry) break;

      entry.status = 'speaking';
      this.currentUtterance = entry.utterance;

      try {
        if (this.synthesis) {
          this.synthesis.speak(entry.utterance);

          // Wait for utterance to complete
          await new Promise<void>((resolve, reject) => {
            const originalOnEnd = entry.utterance.onend;
            const originalOnError = entry.utterance.onerror;

            entry.utterance.onend = (event) => {
              if (originalOnEnd) originalOnEnd.call(entry.utterance, event);
              entry.status = 'completed';
              resolve();
            };

            entry.utterance.onerror = (event) => {
              if (originalOnError) originalOnError.call(entry.utterance, event);
              entry.status = 'error';
              reject(new Error(`Speech error: ${event.error}`));
            };
          });
        }
      } catch (error) {
        console.error('Error processing speech:', error);
        entry.status = 'error';
      }

      // Small delay between utterances
      await this.sleep(100);
    }

    this.isProcessing = false;
    this.currentUtterance = null;
  }

  /**
   * Handle utterance completion
   */
  private onUtteranceComplete(): void {
    // Continue processing queue if there are more items
    if (this.speechQueue.length > 0) {
      setTimeout(() => this.processQueue(), 50);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * React Hook for Text-to-Speech
 */
export function useTextToSpeech(config?: Partial<TextToSpeechConfig>) {
  const [service] = React.useState(() => new TextToSpeechService(config));
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [queueLength, setQueueLength] = React.useState(0);

  // Update state periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(service.isSpeaking());
      setIsPaused(service.isSpeechPaused());
      setQueueLength(service.getQueueStatus().queueLength);
    }, 500);

    return () => clearInterval(interval);
  }, [service]);

  const speak = React.useCallback((text: string, options?: Partial<SpeechOptions>) => {
    return service.speak(text, options);
  }, [service]);

  const speakQuestion = React.useCallback((question: string) => {
    return service.speakQuestion(question);
  }, [service]);

  const speakAnswers = React.useCallback((answers: string[]) => {
    return service.speakAnswers(answers);
  }, [service]);

  const speakExplanation = React.useCallback((explanation: string) => {
    return service.speakExplanation(explanation);
  }, [service]);

  const pause = React.useCallback(() => {
    service.pause();
  }, [service]);

  const resume = React.useCallback(() => {
    service.resume();
  }, [service]);

  const stop = React.useCallback(() => {
    service.stop();
  }, [service]);

  const setVoice = React.useCallback((voice: string | SpeechSynthesisVoice) => {
    service.setVoice(voice);
  }, [service]);

  return {
    speak,
    speakQuestion,
    speakAnswers,
    speakExplanation,
    pause,
    resume,
    stop,
    setVoice,
    isSpeaking,
    isPaused,
    queueLength,
    availableVoices: service.getAvailableVoices(),
    isSupported: service.isSupported
  };
}

// Export singleton instance
export const textToSpeech = new TextToSpeechService();