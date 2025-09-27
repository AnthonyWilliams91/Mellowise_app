/**
 * AI Chat Tutor Module
 * MELLOWISE-025: Export all AI tutoring services and utilities
 */

// Core service
export { AIChatTutorService } from './chat-service';

// Types and interfaces
export type {
  ChatMessage,
  ChatSession,
  TutorConfig,
  TutorRequest,
  TutorResponse,
  TutorError,
  MessageContext,
  SessionContext,
  RateLimit,
  UsageTracking,
  SocraticStrategy,
  ConceptMap,
  TutoringAnalytics,
  TutoringPreferences,
  TutorPersonality,
  DEFAULT_TUTOR_CONFIG,
  DEFAULT_TUTORING_PREFERENCES,
  DEFAULT_TUTOR_PERSONALITY
} from '@/types/ai-tutor';

// Type guards
export {
  isChatMessage,
  isTutorResponse,
  isTutorError
} from '@/types/ai-tutor';