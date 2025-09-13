/**
 * Learning Style Assessment Type Definitions
 * 
 * TypeScript types for MELLOWISE-009 AI Learning Style Assessment
 */

export interface LearningProfile {
  id: string
  user_id: string
  
  // Assessment status
  has_completed_diagnostic: boolean
  diagnostic_completed_at: string | null
  
  // Learning style dimensions (0.0 to 1.0 scores)
  visual_analytical_score: number  // 0.0 = Visual, 1.0 = Analytical
  fast_methodical_score: number    // 0.0 = Fast-paced, 1.0 = Methodical
  conceptual_detail_score: number  // 0.0 = Conceptual, 1.0 = Detail-oriented
  
  // Classification results
  primary_learning_style: string | null
  secondary_learning_style: string | null
  
  // Confidence scores (0-100)
  visual_analytical_confidence: number
  fast_methodical_confidence: number
  conceptual_detail_confidence: number
  overall_confidence: number
  
  // Data points for analysis
  total_questions_analyzed: number
  avg_response_time: number
  accuracy_variance: number
  
  // Manual override settings
  manual_override_enabled: boolean
  manual_primary_style: string | null
  manual_secondary_style: string | null
  override_set_at: string | null
  
  // Metadata
  last_analyzed_at: string
  created_at: string
  updated_at: string
}

export interface DiagnosticQuestion {
  id: string
  question_id: string
  diagnostic_category: 'visual_pattern' | 'analytical_logic' | 'speed_test' | 'detail_focus' | 'conceptual_reasoning'
  learning_dimensions: string[]
  expected_response_time: number
  complexity_indicators: Record<string, any>
  created_at: string
  is_active: boolean
  
  // Joined question data
  question?: {
    content: string
    question_type: string
    subtype: string | null
    difficulty: number
    correct_answer: string
    answer_choices: any
    explanation: string
  }
}

export interface DiagnosticAttempt {
  id: string
  user_id: string
  diagnostic_question_id: string
  question_id: string
  
  // Attempt data
  selected_answer: string
  is_correct: boolean
  response_time: number
  confidence_level: number | null  // 1-5 self-reported confidence
  
  // Learning style indicators
  showed_hesitation: boolean
  changed_answer: boolean
  used_elimination: boolean
  
  // Behavioral data
  time_on_question: number | null
  time_on_choices: number | null
  scroll_behavior: Record<string, any>
  
  attempted_at: string
}

export interface LearningStyleRefinement {
  id: string
  user_id: string
  
  // What triggered the refinement
  trigger_type: 'diagnostic_completion' | 'performance_change' | 'manual_override' | 'periodic_review'
  trigger_data: Record<string, any>
  
  // Previous vs new scores
  previous_scores: Record<string, number>
  new_scores: Record<string, number>
  confidence_changes: Record<string, number>
  
  // Analysis results
  significant_change: boolean
  analysis_notes: string | null
  
  created_at: string
}

// Learning Style Categories
export const LEARNING_STYLE_CATEGORIES = {
  'visual-fast-conceptual': {
    name: 'Visual Quick-Thinker',
    description: 'Learns best with visual patterns and diagrams, prefers fast-paced problem solving, focuses on big-picture concepts',
    icon: '👁️⚡',
    strengths: ['Pattern recognition', 'Quick insights', 'Visual processing'],
    recommendations: ['Logic games with diagrams', 'Timed practice sessions', 'Overview-first approach']
  },
  'visual-fast-detail': {
    name: 'Visual Speedster',
    description: 'Processes visual information quickly and excels at rapid detail analysis',
    icon: '👁️🎯',
    strengths: ['Quick visual scanning', 'Detail spotting', 'Rapid processing'],
    recommendations: ['Diagram-heavy questions', 'Speed drills', 'Visual note-taking']
  },
  'visual-methodical-conceptual': {
    name: 'Visual Strategist',
    description: 'Combines visual learning with careful, strategic thinking and conceptual understanding',
    icon: '👁️🧠',
    strengths: ['Visual mapping', 'Strategic planning', 'Conceptual connections'],
    recommendations: ['Mind maps', 'Step-by-step diagrams', 'Visual frameworks']
  },
  'visual-methodical-detail': {
    name: 'Visual Perfectionist',
    description: 'Methodical visual learner who excels at detailed analysis and careful observation',
    icon: '👁️🔍',
    strengths: ['Careful observation', 'Detailed visual analysis', 'Systematic approach'],
    recommendations: ['Detailed diagrams', 'Systematic practice', 'Visual checklists']
  },
  'analytical-fast-conceptual': {
    name: 'Logic Sprinter',
    description: 'Quickly analyzes logical structures and grasps abstract concepts',
    icon: '🧮⚡',
    strengths: ['Rapid logical analysis', 'Abstract reasoning', 'Quick insights'],
    recommendations: ['Logical reasoning sprints', 'Abstract problem sets', 'Quick inference practice']
  },
  'analytical-fast-detail': {
    name: 'Detail Detective',
    description: 'Fast analytical thinker who excels at spotting important details',
    icon: '🔍⚡',
    strengths: ['Quick analysis', 'Detail orientation', 'Efficient processing'],
    recommendations: ['Detail-focused practice', 'Analytical speed drills', 'Fact-checking exercises']
  },
  'analytical-methodical-conceptual': {
    name: 'Deep Thinker',
    description: 'Methodical analytical approach with strong conceptual understanding',
    icon: '🧠📚',
    strengths: ['Deep analysis', 'Conceptual mastery', 'Thorough reasoning'],
    recommendations: ['Complex logical puzzles', 'Conceptual frameworks', 'In-depth analysis practice']
  },
  'analytical-methodical-detail': {
    name: 'Systematic Analyst',
    description: 'Combines analytical thinking with methodical attention to detail',
    icon: '🧮🔍',
    strengths: ['Systematic analysis', 'Detail accuracy', 'Methodical approach'],
    recommendations: ['Step-by-step logical analysis', 'Detailed argument mapping', 'Systematic practice routines']
  }
} as const

export type LearningStyleKey = keyof typeof LEARNING_STYLE_CATEGORIES
export type LearningStyleInfo = typeof LEARNING_STYLE_CATEGORIES[LearningStyleKey]

// Diagnostic Quiz Configuration
export interface DiagnosticQuizConfig {
  totalQuestions: number
  timeLimit?: number // Optional overall time limit
  categories: {
    visual_pattern: number
    analytical_logic: number
    speed_test: number
    detail_focus: number
    conceptual_reasoning: number
  }
}

export const DEFAULT_DIAGNOSTIC_CONFIG: DiagnosticQuizConfig = {
  totalQuestions: 18,
  categories: {
    visual_pattern: 4,      // Logic games, visual reasoning
    analytical_logic: 4,    // Logical reasoning, syllogisms
    speed_test: 3,          // Quick response questions
    detail_focus: 4,        // Reading comprehension, detail questions
    conceptual_reasoning: 3 // Abstract reasoning, concepts
  }
}

// Analysis Results
export interface LearningStyleAnalysis {
  primaryStyle: LearningStyleKey
  secondaryStyle: LearningStyleKey | null
  scores: {
    visual_analytical: number
    fast_methodical: number
    conceptual_detail: number
  }
  confidence: {
    visual_analytical: number
    fast_methodical: number
    conceptual_detail: number
    overall: number
  }
  recommendations: string[]
  strengths: string[]
  dataPoints: {
    totalQuestions: number
    avgResponseTime: number
    accuracyVariance: number
  }
}

// API Response Types
export interface DiagnosticQuizResponse {
  questions: DiagnosticQuestion[]
  config: DiagnosticQuizConfig
  hasExistingProfile: boolean
  existingProfile?: LearningProfile
}

export interface DiagnosticSubmissionRequest {
  attempts: Omit<DiagnosticAttempt, 'id' | 'user_id' | 'attempted_at'>[]
}

export interface DiagnosticSubmissionResponse {
  analysis: LearningStyleAnalysis
  profile: LearningProfile
  isFirstTime: boolean
}

export interface LearningStyleOverrideRequest {
  primary_style: LearningStyleKey
  secondary_style?: LearningStyleKey
}

// UI Component Props
export interface LearningStyleDisplayProps {
  profile: LearningProfile
  showDetails?: boolean
  allowOverride?: boolean
  onOverrideChange?: (override: LearningStyleOverrideRequest) => void
}

export interface DiagnosticQuizProps {
  onComplete: (analysis: LearningStyleAnalysis) => void
  onSkip?: () => void
  existingProfile?: LearningProfile
}