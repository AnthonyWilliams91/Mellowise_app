/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * TypeScript Type Definitions for Interactive Logic Games System
 *
 * @epic Epic 3.2 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-19
 * @dependencies question-library.ts, universal-exam.ts
 */

import type { QuestionUniversal } from './universal-exam'
import type { MultiTenantEntity } from './tenant'

// ============================================================================
// LOGIC GAMES CORE TYPES
// ============================================================================

export type LogicGameType =
  | 'sequencing'      // Linear and circular ordering games
  | 'grouping'        // In/out grouping and selection games
  | 'matching'        // Attribute assignment games
  | 'hybrid'          // Complex games combining multiple types

export type LogicGameSubtype =
  | 'linear_ordering'     // Basic 1-7 sequencing
  | 'circular_ordering'   // Around a table arrangements
  | 'tiered_ordering'     // Multiple levels/categories
  | 'basic_grouping'      // Two groups selection
  | 'multi_grouping'      // Three or more groups
  | 'distribution'        // Distributing items to categories
  | 'attribute_matching'  // Assigning properties to entities
  | 'spatial_matching'    // Physical arrangement matching
  | 'hybrid_complex'      // Multiple game type combination

export type DifficultyTier =
  | 'introductory'    // Difficulty 1-2: Basic pattern recognition
  | 'standard'        // Difficulty 3-5: Standard LSAT complexity
  | 'advanced'        // Difficulty 6-8: Complex rule interactions
  | 'expert'          // Difficulty 9-10: Multiple inference chains

// ============================================================================
// LOGIC GAMES QUESTION STRUCTURE
// ============================================================================

export interface LogicGameQuestion extends QuestionUniversal {
  // Logic Games specific metadata
  game_type: LogicGameType
  game_subtype: LogicGameSubtype
  difficulty_tier: DifficultyTier

  // Game setup and structure
  game_setup: GameSetup
  game_rules: GameRule[]
  game_board_config: GameBoardConfig

  // Question-specific data
  question_stem: string
  question_type: LogicGameQuestionType
  answer_choices: LogicGameAnswerChoice[]

  // Solution and explanation
  solution_approach: SolutionStep[]
  inference_chain: InferenceStep[]
  common_mistakes: CommonMistake[]

  // Performance tracking
  average_completion_time: number // seconds
  success_rate_by_tier: Record<DifficultyTier, number>
  setup_pattern_id?: string // For pattern recognition training
}

export type LogicGameQuestionType =
  | 'could_be_true'       // Which arrangement is possible?
  | 'must_be_true'        // What must be true in all arrangements?
  | 'cannot_be_true'      // What is impossible?
  | 'if_then'             // If X, then what must be true?
  | 'complete_list'       // All possible positions for X
  | 'rule_substitution'   // Equivalent rule replacement
  | 'maximum_minimum'     // Most/least number scenarios

// ============================================================================
// GAME SETUP AND BOARD CONFIGURATION
// ============================================================================

export interface GameSetup {
  // Core entities and structure
  entities: GameEntity[]
  positions: GamePosition[]
  constraints: GlobalConstraint[]

  // Narrative context
  scenario_description: string
  entity_descriptions: Record<string, string>

  // Board layout hints
  suggested_layout: 'linear' | 'grid' | 'circular' | 'custom'
  spatial_relationships?: SpatialRelationship[]
}

export interface GameEntity {
  id: string
  name: string
  type: 'person' | 'object' | 'event' | 'attribute' | 'custom'
  color?: string // For visual distinction on game board
  properties?: Record<string, any>
}

export interface GamePosition {
  id: string
  name: string
  type: 'slot' | 'group' | 'category' | 'attribute'
  order?: number // For sequencing games
  capacity?: number // Max entities that can occupy this position
  restrictions?: string[] // Entity types or specific entities allowed
}

export interface GlobalConstraint {
  id: string
  description: string
  type: 'capacity' | 'exclusion' | 'requirement' | 'custom'
  applies_to: string[] // Position or entity IDs
}

// ============================================================================
// GAME RULES SYSTEM
// ============================================================================

export interface GameRule {
  id: string
  rule_text: string
  rule_type: GameRuleType
  logical_structure: LogicalStructure

  // Visual representation
  symbolic_notation?: string
  diagram_hint?: DiagramHint

  // Educational metadata
  difficulty_contribution: number // 1-5, how much this rule adds complexity
  common_misinterpretations: string[]
  teaching_points: string[]
}

export type GameRuleType =
  | 'conditional'         // If A then B
  | 'biconditional'      // A if and only if B
  | 'sequence'           // A comes before B
  | 'adjacency'          // A is next to B
  | 'grouping'           // A and B are in same group
  | 'exclusion'          // A and B cannot both be true
  | 'numerical'          // Exactly/at least/at most constraints

export interface LogicalStructure {
  antecedent?: string[]   // If conditions
  consequent?: string[]   // Then conditions
  entities_involved: string[]
  positions_involved: string[]
  logical_operator: 'and' | 'or' | 'not' | 'if_then' | 'iff'
}

export interface DiagramHint {
  notation_type: 'arrow' | 'bracket' | 'line' | 'circle' | 'text'
  suggested_position: 'above' | 'below' | 'left' | 'right' | 'overlay'
  visual_cue: string
}

// ============================================================================
// INTERACTIVE GAME BOARD SYSTEM
// ============================================================================

export interface GameBoardConfig {
  board_type: GameBoardType
  layout_dimensions: BoardDimensions
  interaction_modes: InteractionMode[]

  // Visual styling
  theme: BoardTheme
  entity_styling: EntityStyling
  position_styling: PositionStyling

  // Behavior configuration
  drag_drop_enabled: boolean
  snap_to_grid: boolean
  real_time_validation: boolean
  hint_system_enabled: boolean
}

export type GameBoardType =
  | 'linear_sequence'     // 1-dimensional ordering
  | 'grid_layout'         // 2D grid arrangement
  | 'circular_table'      // Circular seating arrangement
  | 'tree_diagram'        // Hierarchical branching
  | 'freeform_canvas'     // Custom positioning

export interface BoardDimensions {
  width: number
  height: number
  grid_cells?: { rows: number; cols: number }
  circular_positions?: number
  custom_zones?: CustomZone[]
}

export interface CustomZone {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  type: 'drop_zone' | 'constraint_area' | 'label_area'
}

export type InteractionMode =
  | 'drag_and_drop'       // Move entities between positions
  | 'click_to_place'      // Click positions to assign entities
  | 'freehand_drawing'    // Draw connections and notes
  | 'text_annotation'     // Add text labels and notes
  | 'constraint_drawing'  // Draw rule representations

// ============================================================================
// SOLUTION AND LEARNING SYSTEM
// ============================================================================

export interface SolutionStep {
  step_number: number
  step_type: SolutionStepType
  description: string

  // Interactive guidance
  board_state_before?: GameBoardState
  board_state_after?: GameBoardState
  user_action_required?: UserActionHint

  // Educational value
  concepts_demonstrated: string[]
  inference_type: InferenceType
  difficulty_rating: number
}

export type SolutionStepType =
  | 'setup_analysis'      // Understanding the initial setup
  | 'rule_application'    // Applying a specific rule
  | 'inference_chain'     // Making logical deductions
  | 'elimination'         // Ruling out impossible options
  | 'testing_scenarios'   // Trying different arrangements
  | 'final_verification'  // Confirming the answer

export interface InferenceStep {
  id: string
  premise_rules: string[] // Rule IDs that lead to this inference
  conclusion: string
  inference_type: InferenceType
  confidence_level: 'certain' | 'highly_likely' | 'possible'

  // Visual representation
  board_visualization?: GameBoardState
  logical_notation?: string
}

export type InferenceType =
  | 'direct_application'  // Rule directly tells us something
  | 'contrapositive'      // Using logical equivalent of rule
  | 'transitive'          // A→B, B→C, therefore A→C
  | 'disjunctive'         // Either A or B, not A, therefore B
  | 'exhaustive'          // Only remaining possibility
  | 'compound'            // Multiple inference types combined

// ============================================================================
// GAME BOARD STATE AND INTERACTION
// ============================================================================

export interface GameBoardState {
  timestamp: string
  entity_positions: Record<string, string> // entity_id -> position_id
  annotations: BoardAnnotation[]
  user_notes: string
  validation_status: ValidationResult

  // Progress tracking
  completion_percentage: number
  rules_satisfied: string[]
  rules_violated: string[]
  next_suggested_actions: string[]
}

export interface BoardAnnotation {
  id: string
  type: 'arrow' | 'line' | 'circle' | 'text' | 'highlight'
  start_position: { x: number; y: number }
  end_position?: { x: number; y: number }
  text_content?: string
  style: AnnotationStyle
  created_at: string
  rule_reference?: string
}

export interface AnnotationStyle {
  color: string
  thickness?: number
  font_size?: number
  opacity?: number
  dash_pattern?: number[]
}

export interface ValidationResult {
  is_valid: boolean
  satisfied_rules: RuleValidation[]
  violated_rules: RuleValidation[]
  missing_assignments: string[]
  conflicting_assignments: ConflictReport[]
}

export interface RuleValidation {
  rule_id: string
  rule_text: string
  status: 'satisfied' | 'violated' | 'partially_satisfied'
  explanation: string
  affected_entities: string[]
}

export interface ConflictReport {
  type: 'double_assignment' | 'rule_violation' | 'impossible_state'
  description: string
  entities_involved: string[]
  suggested_resolution: string
}

// ============================================================================
// USER INTERACTION AND PROGRESS TRACKING
// ============================================================================

export interface UserActionHint {
  action_type: 'drag_entity' | 'place_entity' | 'draw_connection' | 'add_note'
  target_entity?: string
  target_position?: string
  hint_text: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
}

export interface LogicGameSession extends MultiTenantEntity {
  user_id: string
  question_id: string

  // Session metadata
  started_at: string
  completed_at?: string
  session_duration?: number
  final_score?: number

  // Interaction tracking
  board_states: GameBoardState[]
  user_actions: UserAction[]
  hint_requests: HintRequest[]
  mistake_incidents: MistakeIncident[]

  // Performance analytics
  setup_recognition_time?: number
  first_correct_inference_time?: number
  total_rule_applications: number
  efficiency_score: number // Solutions steps taken vs optimal
}

export interface UserAction {
  timestamp: string
  action_type: 'entity_placement' | 'entity_movement' | 'annotation_created' | 'rule_applied'
  source_position?: string
  target_position?: string
  entity_id?: string
  annotation_id?: string
  rule_id?: string
  user_note?: string
}

export interface HintRequest {
  timestamp: string
  hint_type: 'setup_guidance' | 'rule_clarification' | 'inference_help' | 'solution_step'
  context: string
  current_board_state: GameBoardState
  hint_provided: string
  was_helpful?: boolean // User feedback
}

export interface MistakeIncident {
  timestamp: string
  mistake_type: CommonMistakeType
  description: string
  incorrect_action: UserAction
  correction_provided: string
  learning_opportunity: string
}

// ============================================================================
// COMMON MISTAKES AND LEARNING SUPPORT
// ============================================================================

export interface CommonMistake {
  mistake_type: CommonMistakeType
  description: string
  frequency_percentage: number
  trigger_conditions: string[]

  // Educational response
  explanation: string
  prevention_strategy: string
  practice_exercises: string[]
}

export type CommonMistakeType =
  | 'rule_misinterpretation'    // Misunderstanding what rule means
  | 'contrapositive_confusion'  // Not recognizing logical equivalents
  | 'incomplete_setup'          // Missing initial deductions
  | 'position_confusion'        // Mixing up spatial relationships
  | 'entity_misplacement'       // Putting entities in wrong positions
  | 'rule_application_error'    // Incorrectly applying a rule
  | 'inference_leap'            // Jumping to conclusions without logic
  | 'constraint_violation'      // Ignoring global constraints

// ============================================================================
// VISUAL STYLING AND THEMES
// ============================================================================

export interface BoardTheme {
  name: string
  background_color: string
  grid_color?: string
  border_color: string

  // Accessibility
  high_contrast_mode: boolean
  colorblind_friendly: boolean
  font_scale: number
}

export interface EntityStyling {
  default_shape: 'circle' | 'square' | 'rounded_rectangle' | 'custom'
  size: { width: number; height: number }
  colors: Record<string, string> // entity_type -> color
  border_width: number
  font_family: string
  font_size: number
  hover_effects: boolean
  selection_highlight: string
}

export interface PositionStyling {
  slot_shape: 'rectangle' | 'circle' | 'hexagon' | 'custom'
  size: { width: number; height: number }
  background_color: string
  border_color: string
  border_style: 'solid' | 'dashed' | 'dotted'
  label_position: 'inside' | 'above' | 'below' | 'left' | 'right'
  drop_zone_highlight: string
}

// ============================================================================
// ANALYTICS AND INSIGHTS
// ============================================================================

export interface LogicGameAnalytics {
  question_id: string

  // Performance metrics
  average_completion_time: number
  success_rate_by_difficulty: Record<DifficultyTier, number>
  common_solution_paths: SolutionPath[]
  mistake_frequency: Record<CommonMistakeType, number>

  // Learning insights
  concept_mastery_indicators: ConceptMastery[]
  progression_recommendations: string[]
  similar_games_suggestions: string[]

  // Usage patterns
  peak_difficulty_points: DifficultyPoint[]
  hint_usage_patterns: HintUsagePattern[]
  board_interaction_heatmap: InteractionHeatmap
}

export interface SolutionPath {
  path_id: string
  steps: string[]
  frequency_percentage: number
  average_time: number
  difficulty_rating: number
  effectiveness_score: number
}

export interface ConceptMastery {
  concept_name: string
  mastery_level: 'struggling' | 'developing' | 'proficient' | 'advanced'
  evidence_points: string[]
  improvement_suggestions: string[]
}

export interface DifficultyPoint {
  step_description: string
  difficulty_spike: number // 1-10 scale
  common_errors: string[]
  success_strategies: string[]
}

export interface HintUsagePattern {
  hint_type: string
  usage_frequency: number
  timing_distribution: number[] // When in session hints are requested
  effectiveness_rating: number
}

export interface InteractionHeatmap {
  position_interactions: Record<string, number>
  entity_interactions: Record<string, number>
  rule_reference_frequency: Record<string, number>
  annotation_density: Record<string, number>
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateLogicGameRequest {
  question_data: Omit<LogicGameQuestion, 'id' | 'created_at' | 'updated_at'>
  validate_setup?: boolean
  generate_solution?: boolean
}

export interface LogicGameSessionRequest {
  question_id: string
  difficulty_preference?: DifficultyTier
  hint_level?: 'minimal' | 'moderate' | 'comprehensive'
  time_limit?: number // seconds
}

export interface SubmitSolutionRequest {
  session_id: string
  final_board_state: GameBoardState
  user_confidence: number // 1-5 scale
  solution_explanation?: string
}

export interface LogicGameProgressResponse {
  session_summary: LogicGameSession
  performance_analytics: LogicGameAnalytics
  next_recommendations: GameRecommendation[]
  mastery_progress: ConceptMastery[]
}

export interface GameRecommendation {
  type: 'similar_game' | 'prerequisite_concept' | 'advanced_challenge'
  question_id: string
  reason: string
  expected_benefit: string
  difficulty_adjustment: number
}

// ============================================================================
// UTILITY TYPES AND CONSTANTS
// ============================================================================

export const LOGIC_GAME_TYPES: LogicGameType[] = [
  'sequencing',
  'grouping',
  'matching',
  'hybrid'
]

export const LOGIC_GAME_SUBTYPES: LogicGameSubtype[] = [
  'linear_ordering',
  'circular_ordering',
  'tiered_ordering',
  'basic_grouping',
  'multi_grouping',
  'distribution',
  'attribute_matching',
  'spatial_matching',
  'hybrid_complex'
]

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  'introductory',
  'standard',
  'advanced',
  'expert'
]

export const QUESTION_TYPES: LogicGameQuestionType[] = [
  'could_be_true',
  'must_be_true',
  'cannot_be_true',
  'if_then',
  'complete_list',
  'rule_substitution',
  'maximum_minimum'
]

// Default configurations
export const DEFAULT_BOARD_CONFIG: GameBoardConfig = {
  board_type: 'linear_sequence',
  layout_dimensions: { width: 800, height: 400 },
  interaction_modes: ['drag_and_drop', 'click_to_place'],
  theme: {
    name: 'default',
    background_color: '#ffffff',
    grid_color: '#e5e5e5',
    border_color: '#333333',
    high_contrast_mode: false,
    colorblind_friendly: true,
    font_scale: 1.0
  },
  entity_styling: {
    default_shape: 'rounded_rectangle',
    size: { width: 80, height: 40 },
    colors: {
      person: '#3b82f6',
      object: '#10b981',
      event: '#f59e0b',
      attribute: '#8b5cf6'
    },
    border_width: 2,
    font_family: 'Inter',
    font_size: 14,
    hover_effects: true,
    selection_highlight: '#fbbf24'
  },
  position_styling: {
    slot_shape: 'rectangle',
    size: { width: 100, height: 60 },
    background_color: '#f8fafc',
    border_color: '#64748b',
    border_style: 'solid',
    label_position: 'below',
    drop_zone_highlight: '#dbeafe'
  },
  drag_drop_enabled: true,
  snap_to_grid: true,
  real_time_validation: true,
  hint_system_enabled: true
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isLogicGameQuestion(obj: any): obj is LogicGameQuestion {
  return obj &&
         typeof obj.game_type === 'string' &&
         LOGIC_GAME_TYPES.includes(obj.game_type) &&
         typeof obj.game_subtype === 'string' &&
         LOGIC_GAME_SUBTYPES.includes(obj.game_subtype) &&
         obj.game_setup &&
         Array.isArray(obj.game_rules) &&
         obj.game_board_config
}

export function isValidGameBoardState(obj: any): obj is GameBoardState {
  return obj &&
         typeof obj.timestamp === 'string' &&
         typeof obj.entity_positions === 'object' &&
         Array.isArray(obj.annotations) &&
         typeof obj.validation_status === 'object' &&
         typeof obj.completion_percentage === 'number'
}

export function isValidUserAction(obj: any): obj is UserAction {
  return obj &&
         typeof obj.timestamp === 'string' &&
         typeof obj.action_type === 'string' &&
         ['entity_placement', 'entity_movement', 'annotation_created', 'rule_applied'].includes(obj.action_type)
}