/**
 * MELLOWISE-013: AI-Powered Question Generation Types
 * TypeScript interfaces for dynamic LSAT question generation system
 */

// Question generation request types
export interface GenerateQuestionRequest {
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension';
  difficulty: number; // 1-10 scale from MELLOWISE-010
  quantity: number;
  topicFocus?: string;
  avoidTopics?: string[];
  userId?: string;
  sessionId?: string;

  // Generation parameters
  creativity?: number; // 0-1, higher = more creative variations
  formatStrict?: boolean; // Enforce strict LSAT formatting
  includeDiagnosticInfo?: boolean; // Include generation metadata
}

// Question template types for each section
export interface QuestionTemplate {
  id: string;
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension';
  templateName: string;
  structure: {
    stimulus: TemplateComponent;
    question: TemplateComponent;
    answerChoices: TemplateComponent[];
    explanation?: TemplateComponent;
  };

  // Template metadata
  difficulty_range: [number, number];
  topics: string[];
  frequency: number; // How often to use this template
  lastUsed?: Date;
  successRate?: number;
}

export interface TemplateComponent {
  type: 'static' | 'variable' | 'generated';
  content?: string;
  placeholder?: string;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    requiredElements?: string[];
    forbiddenElements?: string[];
    format?: string; // Regex pattern
  };
  examples?: string[];
}

// Generated question types
export interface GeneratedQuestion {
  id: string;
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension';
  difficulty: number;

  // Content
  stimulus: string;
  question: string;
  answerChoices: AnswerChoice[];
  correctAnswer: string; // answer_id
  explanation: string;

  // Generation metadata
  generationId: string;
  templateId?: string;
  modelUsed: 'claude-3-opus' | 'claude-3-sonnet' | 'gpt-4' | string;
  generatedAt: Date;
  generationTime: number; // milliseconds
  tokensUsed: {
    input: number;
    output: number;
  };

  // Quality metrics
  qualityScore?: number; // 0-100
  validationStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  validationNotes?: string;
  humanReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;

  // Performance tracking
  timesUsed: number;
  averageTimeToAnswer?: number;
  averageCorrectRate?: number;
  userRatings?: {
    helpful: number;
    notHelpful: number;
    flagged: number;
  };
}

export interface AnswerChoice {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isCorrect: boolean;
  distractorType?: 'opposite' | 'partial' | 'misinterpretation' | 'irrelevant';
  explanation?: string;
}

// Quality assurance types
export interface QualityValidation {
  questionId: string;
  validationRules: ValidationRule[];
  overallScore: number;
  passed: boolean;
  issues: ValidationIssue[];
  suggestions: string[];

  // Automated checks
  formatValid: boolean;
  difficultyAppropriate: boolean;
  answerChoicesValid: boolean;
  explanationClear: boolean;

  // Content checks
  topicRelevant: boolean;
  noAmbiguity: boolean;
  factuallyAccurate: boolean;
  culturallySensitive: boolean;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'format' | 'content' | 'difficulty' | 'quality';
  check: (question: GeneratedQuestion) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
  autoFix?: (question: GeneratedQuestion) => GeneratedQuestion;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  issues?: string[];
  suggestions?: string[];
}

export interface ValidationIssue {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string; // e.g., "answer_choice_B", "stimulus"
  suggestion?: string;
}

// Generation batch management
export interface GenerationBatch {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  createdAt: Date;
  completedAt?: Date;

  // Batch configuration
  requests: GenerateQuestionRequest[];
  totalQuestions: number;
  generatedQuestions: string[]; // question IDs

  // Progress tracking
  progress: {
    requested: number;
    generated: number;
    validated: number;
    approved: number;
    rejected: number;
  };

  // Cost tracking
  cost: {
    tokens: {
      input: number;
      output: number;
    };
    estimatedCost: number; // in cents
    actualCost?: number;
  };

  // Error handling
  errors?: {
    timestamp: Date;
    request: GenerateQuestionRequest;
    error: string;
    retryCount: number;
  }[];
}

// Admin review interface types
export interface ReviewQueue {
  id: string;
  name: string;
  description: string;
  filters: {
    sectionTypes?: string[];
    difficultyRange?: [number, number];
    validationStatus?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };

  questions: string[]; // question IDs
  reviewers: string[]; // user IDs

  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    avgReviewTime: number;
  };
}

export interface ReviewAction {
  questionId: string;
  reviewerId: string;
  action: 'approve' | 'reject' | 'request_changes';
  timestamp: Date;

  // Review details
  qualityScore?: number;
  notes?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];

  // Follow-up
  requiresRegeneration?: boolean;
  regenerationNotes?: string;
}

// AI model configuration
export interface ModelConfig {
  provider: 'anthropic' | 'openai';
  model: string;
  apiKey?: string; // Stored securely in env

  // Generation parameters
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Rate limiting
  maxRequestsPerMinute?: number;
  maxTokensPerDay?: number;

  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

// Prompt engineering types
export interface GenerationPrompt {
  id: string;
  name: string;
  version: string;
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension';

  // Prompt components
  systemPrompt: string;
  userPromptTemplate: string;
  exampleQuestions?: GeneratedQuestion[];

  // Prompt metadata
  createdAt: Date;
  updatedAt: Date;
  author: string;

  // Performance metrics
  usageCount: number;
  averageQualityScore?: number;
  successRate?: number;
}

// Analytics types for generation system
export interface GenerationAnalytics {
  periodStart: Date;
  periodEnd: Date;

  // Volume metrics
  totalGenerated: number;
  totalApproved: number;
  totalRejected: number;

  // Quality metrics
  averageQualityScore: number;
  validationPassRate: number;
  humanApprovalRate: number;

  // Performance metrics
  averageGenerationTime: number;
  averageReviewTime: number;
  costPerQuestion: number;

  // Usage metrics
  questionsUsedInPractice: number;
  averageUserRating: number;
  averageCorrectRate: number;

  // Breakdown by section
  bySection: {
    [key in 'logical_reasoning' | 'logic_games' | 'reading_comprehension']: {
      generated: number;
      approved: number;
      avgQuality: number;
      avgDifficulty: number;
    };
  };
}

// API response types
export interface GenerateQuestionResponse {
  success: boolean;
  batchId?: string;
  questions?: GeneratedQuestion[];
  errors?: string[];
  estimatedTime?: number;
  cost?: {
    estimated: number;
    tokens: {
      input: number;
      output: number;
    };
  };
}

export interface ReviewQueueResponse {
  queue: ReviewQueue;
  questions: GeneratedQuestion[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface GenerationStatusResponse {
  batchId: string;
  status: string;
  progress: {
    percentage: number;
    generated: number;
    total: number;
  };
  estimatedTimeRemaining?: number;
  completedQuestions?: GeneratedQuestion[];
}