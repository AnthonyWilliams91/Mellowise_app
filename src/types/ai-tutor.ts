/**
 * AI Chat Tutor Types
 * MELLOWISE-025: Complete type definitions for AI-powered tutoring system
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: MessageContext;
  metadata?: MessageMetadata;
}

/**
 * Message context for AI understanding
 */
export interface MessageContext {
  currentQuestionId?: string;
  questionType?: string;
  sectionType?: 'logical-reasoning' | 'reading-comprehension' | 'logic-games';
  userMistakes?: string[];
  previousAttempts?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  learningStylePreference?: string;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  confidence?: number;
  explanationType?: ExplanationType;
  conceptsDiscussed?: string[];
  followUpSuggestions?: string[];
}

/**
 * Explanation types for adaptive tutoring
 */
export type ExplanationType =
  | 'conceptual'     // High-level understanding
  | 'step-by-step'   // Detailed process
  | 'visual'         // Diagram/visual aid
  | 'analogical'     // Real-world comparison
  | 'socratic';      // Guided questioning

/**
 * AI Tutor configuration
 */
export interface TutorConfig {
  model: 'claude-3-sonnet' | 'claude-3-haiku';
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  explanationStyle: ExplanationType[];
  enableSocraticMethod: boolean;
  contextWindow: number;
  rateLimitPerHour: number;
  fallbackEnabled: boolean;
}

/**
 * Chat session management
 */
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  context: SessionContext;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  totalMessages: number;
  tokensUsed: number;
}

/**
 * Session context tracking
 */
export interface SessionContext {
  currentQuestion?: QuestionContext;
  studySession?: StudySessionContext;
  learningGoals?: string[];
  weakAreas?: string[];
  progressIndicators?: ProgressIndicator[];
}

/**
 * Question context for tutoring
 */
export interface QuestionContext {
  questionId: string;
  questionType: string;
  section: string;
  difficulty: number;
  userAnswer?: string;
  correctAnswer: string;
  explanation: string;
  commonMistakes: string[];
  relatedConcepts: string[];
}

/**
 * Study session context
 */
export interface StudySessionContext {
  sessionId: string;
  startTime: Date;
  questionsAttempted: number;
  correctAnswers: number;
  timeSpent: number;
  currentStreak: number;
  focusAreas: string[];
}

/**
 * Progress tracking for tutoring effectiveness
 */
export interface ProgressIndicator {
  concept: string;
  understanding: number; // 0-1 scale
  confidence: number; // 0-1 scale
  improvementRate: number;
  lastDiscussed: Date;
  timesDiscussed: number;
}

// ============================================================================
// API INTERFACES
// ============================================================================

/**
 * Tutor API request
 */
export interface TutorRequest {
  message: string;
  sessionId: string;
  context?: MessageContext;
  requestedStyle?: ExplanationType;
  maxTokens?: number;
}

/**
 * Tutor API response
 */
export interface TutorResponse {
  message: ChatMessage;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
  suggestions?: string[];
  relatedConcepts?: string[];
  followUpQuestions?: string[];
}

/**
 * API error response
 */
export interface TutorError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId: string;
}

/**
 * Rate limit information
 */
export interface RateLimit {
  requests: number;
  tokens: number;
  resetTime: Date;
  remaining: number;
  isExceeded: boolean;
}

// ============================================================================
// TUTORING STRATEGIES
// ============================================================================

/**
 * Socratic questioning strategy
 */
export interface SocraticStrategy {
  questionTypes: SocraticQuestionType[];
  progressionLevels: number[];
  adaptiveThreshold: number;
  maxQuestionDepth: number;
}

/**
 * Types of Socratic questions
 */
export type SocraticQuestionType =
  | 'clarification'     // "What do you mean by...?"
  | 'assumptions'       // "What assumptions are you making?"
  | 'evidence'          // "What evidence supports this?"
  | 'perspective'       // "How might someone who disagrees respond?"
  | 'implications'      // "What are the consequences of this?"
  | 'meta';            // "How does this relate to what we discussed?"

/**
 * Concept linking system
 */
export interface ConceptMap {
  concepts: Concept[];
  relationships: ConceptRelationship[];
  learningPaths: LearningPath[];
}

/**
 * Individual concept definition
 */
export interface Concept {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: number;
  prerequisites: string[];
  examples: string[];
  commonMisconceptions: string[];
}

/**
 * Relationship between concepts
 */
export interface ConceptRelationship {
  sourceId: string;
  targetId: string;
  type: 'prerequisite' | 'related' | 'opposite' | 'example' | 'application';
  strength: number; // 0-1 scale
  description: string;
}

/**
 * Learning path for concept mastery
 */
export interface LearningPath {
  id: string;
  name: string;
  concepts: string[];
  estimatedTime: number;
  difficulty: number;
  description: string;
}

// ============================================================================
// FALLBACK SYSTEM
// ============================================================================

/**
 * Pre-generated explanation for fallback
 */
export interface PreGeneratedExplanation {
  id: string;
  questionType: string;
  concept: string;
  explanation: string;
  style: ExplanationType;
  difficulty: number;
  examples: string[];
  relatedTopics: string[];
}

/**
 * Fallback response when AI unavailable
 */
export interface FallbackResponse {
  message: string;
  explanation?: PreGeneratedExplanation;
  suggestions: string[];
  isFromFallback: true;
  originalRequestId: string;
}

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

/**
 * Tutoring session analytics
 */
export interface TutoringAnalytics {
  sessionId: string;
  userId: string;
  metrics: TutoringMetrics;
  insights: TutoringInsights;
  recommendations: string[];
  effectivenessScore: number;
}

/**
 * Tutoring effectiveness metrics
 */
export interface TutoringMetrics {
  totalSessions: number;
  averageSessionLength: number;
  messagesPerSession: number;
  conceptsCovered: number;
  improvementRate: number;
  engagementScore: number;
  satisfactionRating: number;
}

/**
 * AI tutoring insights
 */
export interface TutoringInsights {
  strongConcepts: string[];
  weakConcepts: string[];
  preferredExplanationStyle: ExplanationType;
  optimalSessionLength: number;
  bestTimeOfDay: string;
  learningVelocity: number;
  conceptRetention: Record<string, number>;
}

/**
 * Usage tracking for API throttling
 */
export interface UsageTracking {
  userId: string;
  date: Date;
  requests: number;
  tokens: number;
  sessions: number;
  averageResponseTime: number;
  errorRate: number;
}

// ============================================================================
// CONFIGURATION & SETTINGS
// ============================================================================

/**
 * User tutoring preferences
 */
export interface TutoringPreferences {
  userId: string;
  preferredExplanationStyle: ExplanationType;
  socraticEnabled: boolean;
  verbosityLevel: 'concise' | 'detailed' | 'comprehensive';
  examplePreference: 'abstract' | 'concrete' | 'mixed';
  feedbackFrequency: 'immediate' | 'periodic' | 'session-end';
  maxSessionLength: number;
  reminderEnabled: boolean;
}

/**
 * Tutor personality configuration
 */
export interface TutorPersonality {
  name: string;
  description: string;
  tone: 'formal' | 'casual' | 'encouraging' | 'challenging';
  expertise: string[];
  specializations: string[];
  teachingStyle: string;
  motivationalApproach: string;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default tutor configuration
 */
export const DEFAULT_TUTOR_CONFIG: TutorConfig = {
  model: 'claude-3-sonnet',
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: `You are an expert LSAT tutor with deep knowledge of logical reasoning, reading comprehension, and logic games. Your goal is to help students understand concepts through guided discovery rather than simply providing answers. Use the Socratic method when appropriate, and adapt your explanations to the student's learning style and current understanding level.`,
  explanationStyle: ['conceptual', 'step-by-step'],
  enableSocraticMethod: true,
  contextWindow: 10,
  rateLimitPerHour: 100,
  fallbackEnabled: true
};

/**
 * Default tutoring preferences
 */
export const DEFAULT_TUTORING_PREFERENCES: Partial<TutoringPreferences> = {
  preferredExplanationStyle: 'conceptual',
  socraticEnabled: true,
  verbosityLevel: 'detailed',
  examplePreference: 'mixed',
  feedbackFrequency: 'immediate',
  maxSessionLength: 30, // minutes
  reminderEnabled: false
};

/**
 * Default tutor personality
 */
export const DEFAULT_TUTOR_PERSONALITY: TutorPersonality = {
  name: 'Claude Tutor',
  description: 'A knowledgeable and patient LSAT tutor focused on helping you understand concepts deeply.',
  tone: 'encouraging',
  expertise: ['Logical Reasoning', 'Reading Comprehension', 'Logic Games'],
  specializations: ['Argument Analysis', 'Critical Reading', 'Formal Logic'],
  teachingStyle: 'Socratic questioning with adaptive explanations',
  motivationalApproach: 'Growth mindset focused on understanding over performance'
};

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Type guard for ChatMessage
 */
export function isChatMessage(obj: any): obj is ChatMessage {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.content === 'string' &&
    obj.timestamp instanceof Date;
}

/**
 * Type guard for TutorResponse
 */
export function isTutorResponse(obj: any): obj is TutorResponse {
  return obj &&
    isChatMessage(obj.message) &&
    typeof obj.tokensUsed === 'number' &&
    typeof obj.processingTime === 'number' &&
    typeof obj.confidence === 'number';
}

/**
 * Type guard for TutorError
 */
export function isTutorError(obj: any): obj is TutorError {
  return obj &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string' &&
    obj.timestamp instanceof Date &&
    typeof obj.requestId === 'string';
}