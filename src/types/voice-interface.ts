/**
 * Voice Interface & Accessibility Types
 * MELLOWISE-031: Complete voice interaction and accessibility system
 */

import React from 'react';

// ============================================================================
// VOICE RECOGNITION SYSTEM
// ============================================================================

export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string;
  grammars?: SpeechGrammarList;
}

export interface VoiceCommand {
  phrase: string;
  aliases: string[];
  action: VoiceAction;
  context?: VoiceContext;
  confidence: number;
  enabled: boolean;
}

export interface VoiceAction {
  type: 'navigation' | 'answer' | 'control' | 'system';
  command: string;
  parameters?: Record<string, any>;
  callback?: (params: any) => void;
}

export type VoiceContext = 'global' | 'question' | 'menu' | 'settings' | 'results';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: VoiceAlternative[];
  timestamp: Date;
}

export interface VoiceAlternative {
  transcript: string;
  confidence: number;
}

export interface VoiceCommandMatch {
  command: VoiceCommand;
  confidence: number;
  parameters: Record<string, any>;
  rawTranscript: string;
}

// ============================================================================
// TEXT-TO-SPEECH SYSTEM
// ============================================================================

export interface TextToSpeechConfig {
  voice: SpeechSynthesisVoice | null;
  rate: number;        // 0.1 to 10
  pitch: number;       // 0 to 2
  volume: number;      // 0 to 1
  language: string;
  voiceURI: string;
}

export interface SpeechOptions {
  text: string;
  priority: 'high' | 'normal' | 'low';
  interruptible: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

export interface SpeechQueue {
  id: string;
  options: SpeechOptions;
  utterance: SpeechSynthesisUtterance;
  status: 'pending' | 'speaking' | 'paused' | 'completed' | 'cancelled' | 'error';
  createdAt: Date;
}

export interface VoiceSettings {
  enabled: boolean;
  autoRead: boolean;
  readQuestions: boolean;
  readAnswers: boolean;
  readExplanations: boolean;
  readInstructions: boolean;
  confirmActions: boolean;
  config: TextToSpeechConfig;
}

// ============================================================================
// ACCESSIBILITY SYSTEM
// ============================================================================

export interface AccessibilityConfig {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  skipLinks: boolean;
  audioCues: boolean;
}

export interface AccessibilitySettings extends AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrastRatio: 'normal' | 'high' | 'maximum';
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  animationSpeed: 'slow' | 'normal' | 'fast' | 'none';
  autoSave: boolean;
  sessionTimeout: number; // minutes
}

export interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  context: string[];
  enabled: boolean;
}

export interface FocusManagement {
  currentElement: HTMLElement | null;
  focusHistory: HTMLElement[];
  focusTraps: HTMLElement[];
  skipLinks: SkipLink[];
}

export interface SkipLink {
  id: string;
  label: string;
  target: string;
  shortcut?: string;
  visible: boolean;
}

export interface AriaLabels {
  [key: string]: string;
}

export interface AccessibilityAudit {
  passed: AccessibilityCheck[];
  failed: AccessibilityCheck[];
  warnings: AccessibilityCheck[];
  score: number; // 0-100
  wcagLevel: 'A' | 'AA' | 'AAA';
  report: AccessibilityReport;
}

export interface AccessibilityCheck {
  rule: string;
  description: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  element?: HTMLElement;
  fix: string;
}

export interface AccessibilityReport {
  url: string;
  timestamp: Date;
  violations: number;
  warnings: number;
  passes: number;
  incomplete: number;
  recommendations: string[];
}

// ============================================================================
// AUDIO CUES SYSTEM
// ============================================================================

export interface AudioCue {
  id: string;
  name: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'navigation' | 'milestone';
  sound: string; // URL or data URI
  volume: number;
  duration: number;
  enabled: boolean;
}

export interface AudioCueSettings {
  enabled: boolean;
  volume: number;
  correctAnswer: AudioCue;
  incorrectAnswer: AudioCue;
  levelUp: AudioCue;
  achievement: AudioCue;
  navigation: AudioCue;
  warning: AudioCue;
  sessionStart: AudioCue;
  sessionEnd: AudioCue;
}

export interface SoundEffect {
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  setVolume(volume: number): void;
  setLoop(loop: boolean): void;
}

// ============================================================================
// VOICE COMMANDS DEFINITIONS
// ============================================================================

export const DEFAULT_VOICE_COMMANDS: VoiceCommand[] = [
  // Navigation Commands
  {
    phrase: 'go to next question',
    aliases: ['next question', 'next', 'continue', 'move forward'],
    action: { type: 'navigation', command: 'next-question' },
    context: 'question',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'go to previous question',
    aliases: ['previous question', 'back', 'go back', 'move back'],
    action: { type: 'navigation', command: 'previous-question' },
    context: 'question',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'show results',
    aliases: ['view results', 'see results', 'check results'],
    action: { type: 'navigation', command: 'show-results' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'open settings',
    aliases: ['settings', 'preferences', 'options'],
    action: { type: 'navigation', command: 'open-settings' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },

  // Answer Selection Commands
  {
    phrase: 'select answer A',
    aliases: ['answer A', 'choose A', 'pick A', 'option A'],
    action: { type: 'answer', command: 'select-answer', parameters: { answer: 'A' } },
    context: 'question',
    confidence: 0.9,
    enabled: true,
  },
  {
    phrase: 'select answer B',
    aliases: ['answer B', 'choose B', 'pick B', 'option B'],
    action: { type: 'answer', command: 'select-answer', parameters: { answer: 'B' } },
    context: 'question',
    confidence: 0.9,
    enabled: true,
  },
  {
    phrase: 'select answer C',
    aliases: ['answer C', 'choose C', 'pick C', 'option C'],
    action: { type: 'answer', command: 'select-answer', parameters: { answer: 'C' } },
    context: 'question',
    confidence: 0.9,
    enabled: true,
  },
  {
    phrase: 'select answer D',
    aliases: ['answer D', 'choose D', 'pick D', 'option D'],
    action: { type: 'answer', command: 'select-answer', parameters: { answer: 'D' } },
    context: 'question',
    confidence: 0.9,
    enabled: true,
  },
  {
    phrase: 'select answer E',
    aliases: ['answer E', 'choose E', 'pick E', 'option E'],
    action: { type: 'answer', command: 'select-answer', parameters: { answer: 'E' } },
    context: 'question',
    confidence: 0.9,
    enabled: true,
  },

  // Control Commands
  {
    phrase: 'read question',
    aliases: ['repeat question', 'say question', 'read this question'],
    action: { type: 'control', command: 'read-question' },
    context: 'question',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'read answers',
    aliases: ['read options', 'say answers', 'repeat answers'],
    action: { type: 'control', command: 'read-answers' },
    context: 'question',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'pause reading',
    aliases: ['stop reading', 'pause', 'be quiet'],
    action: { type: 'control', command: 'pause-speech' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'resume reading',
    aliases: ['continue reading', 'resume', 'keep going'],
    action: { type: 'control', command: 'resume-speech' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'show hint',
    aliases: ['give hint', 'help me', 'hint please'],
    action: { type: 'control', command: 'show-hint' },
    context: 'question',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'show explanation',
    aliases: ['explain answer', 'why is this correct', 'show solution'],
    action: { type: 'control', command: 'show-explanation' },
    context: 'results',
    confidence: 0.8,
    enabled: true,
  },

  // System Commands
  {
    phrase: 'start voice control',
    aliases: ['enable voice', 'turn on voice', 'voice on'],
    action: { type: 'system', command: 'enable-voice' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'stop voice control',
    aliases: ['disable voice', 'turn off voice', 'voice off'],
    action: { type: 'system', command: 'disable-voice' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },
  {
    phrase: 'what can I say',
    aliases: ['help', 'voice commands', 'show commands'],
    action: { type: 'system', command: 'show-voice-help' },
    context: 'global',
    confidence: 0.8,
    enabled: true,
  },
];

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'ArrowRight', modifiers: [], action: 'next-question', description: 'Next question', context: ['question'], enabled: true },
  { key: 'ArrowLeft', modifiers: [], action: 'previous-question', description: 'Previous question', context: ['question'], enabled: true },
  { key: 'Home', modifiers: [], action: 'first-question', description: 'First question', context: ['question'], enabled: true },
  { key: 'End', modifiers: [], action: 'last-question', description: 'Last question', context: ['question'], enabled: true },

  // Answers
  { key: '1', modifiers: [], action: 'select-answer-A', description: 'Select answer A', context: ['question'], enabled: true },
  { key: '2', modifiers: [], action: 'select-answer-B', description: 'Select answer B', context: ['question'], enabled: true },
  { key: '3', modifiers: [], action: 'select-answer-C', description: 'Select answer C', context: ['question'], enabled: true },
  { key: '4', modifiers: [], action: 'select-answer-D', description: 'Select answer D', context: ['question'], enabled: true },
  { key: '5', modifiers: [], action: 'select-answer-E', description: 'Select answer E', context: ['question'], enabled: true },

  // Controls
  { key: 'Enter', modifiers: [], action: 'submit-answer', description: 'Submit answer', context: ['question'], enabled: true },
  { key: 'Escape', modifiers: [], action: 'cancel', description: 'Cancel/Close', context: ['global'], enabled: true },
  { key: '?', modifiers: [], action: 'show-help', description: 'Show help', context: ['global'], enabled: true },
  { key: 'h', modifiers: [], action: 'show-hint', description: 'Show hint', context: ['question'], enabled: true },
  { key: 'e', modifiers: [], action: 'show-explanation', description: 'Show explanation', context: ['results'], enabled: true },

  // Accessibility
  { key: 'r', modifiers: ['ctrl'], action: 'read-question', description: 'Read question', context: ['question'], enabled: true },
  { key: 'a', modifiers: ['ctrl'], action: 'read-answers', description: 'Read answers', context: ['question'], enabled: true },
  { key: 'p', modifiers: ['ctrl'], action: 'pause-speech', description: 'Pause speech', context: ['global'], enabled: true },
  { key: 'v', modifiers: ['ctrl'], action: 'toggle-voice', description: 'Toggle voice control', context: ['global'], enabled: true },

  // System
  { key: 's', modifiers: ['ctrl'], action: 'save-progress', description: 'Save progress', context: ['global'], enabled: true },
  { key: ',', modifiers: ['ctrl'], action: 'open-settings', description: 'Open settings', context: ['global'], enabled: true },
  { key: 'Tab', modifiers: [], action: 'next-focus', description: 'Next focusable element', context: ['global'], enabled: true },
  { key: 'Tab', modifiers: ['shift'], action: 'previous-focus', description: 'Previous focusable element', context: ['global'], enabled: true },
];

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: false,
  autoRead: true,
  readQuestions: true,
  readAnswers: true,
  readExplanations: true,
  readInstructions: true,
  confirmActions: false,
  config: {
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    language: 'en-US',
    voiceURI: '',
  },
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  screenReader: false,
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  keyboardNavigation: true,
  focusIndicators: true,
  skipLinks: true,
  audioCues: false,
  fontSize: 'medium',
  contrastRatio: 'normal',
  colorBlindSupport: 'none',
  animationSpeed: 'normal',
  autoSave: true,
  sessionTimeout: 30,
};

export const DEFAULT_AUDIO_CUES: AudioCueSettings = {
  enabled: false,
  volume: 0.5,
  correctAnswer: {
    id: 'correct-answer',
    name: 'Correct Answer',
    type: 'success',
    sound: '/audio/success.mp3',
    volume: 0.5,
    duration: 500,
    enabled: true,
  },
  incorrectAnswer: {
    id: 'incorrect-answer',
    name: 'Incorrect Answer',
    type: 'error',
    sound: '/audio/error.mp3',
    volume: 0.5,
    duration: 500,
    enabled: true,
  },
  levelUp: {
    id: 'level-up',
    name: 'Level Up',
    type: 'milestone',
    sound: '/audio/level-up.mp3',
    volume: 0.7,
    duration: 1000,
    enabled: true,
  },
  achievement: {
    id: 'achievement',
    name: 'Achievement Unlocked',
    type: 'milestone',
    sound: '/audio/achievement.mp3',
    volume: 0.6,
    duration: 800,
    enabled: true,
  },
  navigation: {
    id: 'navigation',
    name: 'Navigation',
    type: 'info',
    sound: '/audio/click.mp3',
    volume: 0.3,
    duration: 100,
    enabled: false,
  },
  warning: {
    id: 'warning',
    name: 'Warning',
    type: 'warning',
    sound: '/audio/warning.mp3',
    volume: 0.5,
    duration: 600,
    enabled: true,
  },
  sessionStart: {
    id: 'session-start',
    name: 'Session Start',
    type: 'info',
    sound: '/audio/session-start.mp3',
    volume: 0.4,
    duration: 800,
    enabled: false,
  },
  sessionEnd: {
    id: 'session-end',
    name: 'Session End',
    type: 'info',
    sound: '/audio/session-end.mp3',
    volume: 0.4,
    duration: 1000,
    enabled: false,
  },
};

// ============================================================================
// VOICE INTERFACE SERVICES
// ============================================================================

export interface VoiceInterfaceService {
  // Voice Recognition
  startListening(): Promise<void>;
  stopListening(): void;
  isListening(): boolean;

  // Text-to-Speech
  speak(text: string, options?: Partial<SpeechOptions>): Promise<void>;
  pauseSpeech(): void;
  resumeSpeech(): void;
  stopSpeech(): void;
  isSpeaking(): boolean;

  // Commands
  registerCommand(command: VoiceCommand): void;
  unregisterCommand(commandId: string): void;
  processCommand(transcript: string): VoiceCommandMatch | null;

  // Settings
  updateVoiceSettings(settings: Partial<VoiceSettings>): void;
  updateAccessibilitySettings(settings: Partial<AccessibilitySettings>): void;

  // Audio Cues
  playAudioCue(cueId: string): Promise<void>;
  updateAudioCues(settings: Partial<AudioCueSettings>): void;
}

export interface AccessibilityService {
  // Focus Management
  setFocus(element: HTMLElement): void;
  getFocusableElements(container?: HTMLElement): HTMLElement[];
  createSkipLink(target: string, label: string): void;
  manageFocusTrap(container: HTMLElement, enable: boolean): void;

  // ARIA Support
  updateAriaLabels(labels: AriaLabels): void;
  announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;

  // Keyboard Navigation
  handleKeyboardNavigation(event: KeyboardEvent): boolean;
  registerKeyboardShortcut(shortcut: KeyboardShortcut): void;

  // Visual Enhancements
  applyHighContrast(enable: boolean): void;
  adjustFontSize(size: AccessibilitySettings['fontSize']): void;
  reduceMotion(enable: boolean): void;

  // Audit
  performAccessibilityAudit(): Promise<AccessibilityAudit>;
}

export interface VoiceInterfaceProps {
  enabled?: boolean;
  settings?: Partial<VoiceSettings>;
  accessibilitySettings?: Partial<AccessibilitySettings>;
  onCommand?: (command: VoiceCommandMatch) => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}