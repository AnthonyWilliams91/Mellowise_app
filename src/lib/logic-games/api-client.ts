/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * API Client for Logic Games Integration with Question Library
 *
 * @epic Epic 3.2 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-19
 * @dependencies MELLOWISE-017 Question Library API
 */

import type {
  LogicGameQuestion,
  LogicGameSession,
  LogicGameAnalytics,
  CreateLogicGameRequest,
  LogicGameSessionRequest,
  SubmitSolutionRequest,
  LogicGameProgressResponse,
  GameRecommendation,
  LogicGameType,
  LogicGameSubtype,
  DifficultyTier,
  GameBoardState
} from '@/types/logic-games'
import type {
  QuestionSearchFilters,
  QuestionSearchResult,
  EnhancedQuestionUniversal
} from '@/types/question-library'

// Base API configuration
const API_BASE_URL = '/api'

export class LogicGamesAPIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // ============================================================================
  // QUESTION RETRIEVAL AND SEARCH
  // ============================================================================

  /**
   * Search for Logic Games questions with filters
   */
  async searchLogicGamesQuestions(filters: LogicGamesSearchFilters): Promise<LogicGamesSearchResult> {
    const searchParams = new URLSearchParams()

    // Convert Logic Games filters to question library filters
    const questionFilters: QuestionSearchFilters = {
      ...filters,
      exam_type_slug: 'lsat',
      category_slug: 'logic-games',
      question_types: ['logic_game'],
      // Add Logic Games specific filters as concept_tags
      concept_tags: [
        ...(filters.game_types?.map(type => `game_type:${type}`) || []),
        ...(filters.game_subtypes?.map(subtype => `game_subtype:${subtype}`) || []),
        ...(filters.difficulty_tiers?.map(tier => `difficulty_tier:${tier}`) || [])
      ]
    }

    Object.entries(questionFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.set(key, String(value))
        }
      }
    })

    const response = await fetch(`${this.baseURL}/admin/questions/search?${searchParams}`)

    if (!response.ok) {
      throw new Error(`Failed to search Logic Games questions: ${response.statusText}`)
    }

    const result: QuestionSearchResult = await response.json()

    // Convert enhanced questions to Logic Games questions
    const logicGamesQuestions = await Promise.all(
      result.questions.map(question => this.convertToLogicGameQuestion(question))
    )

    return {
      questions: logicGamesQuestions,
      total_count: result.total_count,
      filtered_count: result.filtered_count,
      facets: {
        game_types: this.extractGameTypeFacets(result.facets.concept_tags),
        game_subtypes: this.extractGameSubtypeFacets(result.facets.concept_tags),
        difficulty_tiers: this.extractDifficultyTierFacets(result.facets.concept_tags),
        question_types: result.facets.question_types,
        difficulty_levels: result.facets.difficulty_levels
      },
      pagination: result.pagination
    }
  }

  /**
   * Get a specific Logic Games question by ID
   */
  async getLogicGameQuestion(questionId: string): Promise<LogicGameQuestion> {
    const response = await fetch(`${this.baseURL}/admin/questions/${questionId}`)

    if (!response.ok) {
      throw new Error(`Failed to get Logic Games question: ${response.statusText}`)
    }

    const question: EnhancedQuestionUniversal = await response.json()
    return this.convertToLogicGameQuestion(question)
  }

  /**
   * Get random Logic Games question with filters
   */
  async getRandomLogicGameQuestion(filters?: Partial<LogicGamesSearchFilters>): Promise<LogicGameQuestion> {
    const searchResult = await this.searchLogicGamesQuestions({
      ...filters,
      limit: 1,
      sort_by: 'random'
    } as LogicGamesSearchFilters)

    if (searchResult.questions.length === 0) {
      throw new Error('No Logic Games questions found matching criteria')
    }

    return searchResult.questions[0]
  }

  // ============================================================================
  // QUESTION CREATION AND MANAGEMENT
  // ============================================================================

  /**
   * Create a new Logic Games question
   */
  async createLogicGameQuestion(request: CreateLogicGameRequest): Promise<LogicGameQuestion> {
    const response = await fetch(`${this.baseURL}/admin/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...request.question_data,
        question_type: 'logic_game',
        exam_type_slug: 'lsat',
        category_slug: 'logic-games',
        concept_tags: [
          `game_type:${request.question_data.game_type}`,
          `game_subtype:${request.question_data.game_subtype}`,
          `difficulty_tier:${request.question_data.difficulty_tier}`,
          ...(request.question_data.concept_tags || [])
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to create Logic Games question: ${response.statusText}`)
    }

    const question: EnhancedQuestionUniversal = await response.json()
    return this.convertToLogicGameQuestion(question)
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start a new Logic Games practice session
   */
  async startLogicGameSession(request: LogicGameSessionRequest): Promise<LogicGameSession> {
    const response = await fetch(`${this.baseURL}/logic-games/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Failed to start Logic Games session: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update Logic Games session with user progress
   */
  async updateLogicGameSession(
    sessionId: string,
    boardState: GameBoardState,
    userActions: any[]
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/logic-games/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        board_state: boardState,
        user_actions: userActions,
        updated_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to update Logic Games session: ${response.statusText}`)
    }
  }

  /**
   * Submit Logic Games session solution
   */
  async submitLogicGameSolution(request: SubmitSolutionRequest): Promise<LogicGameProgressResponse> {
    const response = await fetch(`${this.baseURL}/logic-games/sessions/${request.session_id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Failed to submit Logic Games solution: ${response.statusText}`)
    }

    return response.json()
  }

  // ============================================================================
  // ANALYTICS AND INSIGHTS
  // ============================================================================

  /**
   * Get Logic Games analytics for a question
   */
  async getLogicGameAnalytics(questionId: string): Promise<LogicGameAnalytics> {
    const response = await fetch(`${this.baseURL}/logic-games/analytics/questions/${questionId}`)

    if (!response.ok) {
      throw new Error(`Failed to get Logic Games analytics: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get personalized Logic Games recommendations
   */
  async getLogicGameRecommendations(userId: string, limit: number = 10): Promise<GameRecommendation[]> {
    const response = await fetch(
      `${this.baseURL}/logic-games/recommendations/${userId}?limit=${limit}`
    )

    if (!response.ok) {
      throw new Error(`Failed to get Logic Games recommendations: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user's Logic Games progress and mastery
   */
  async getLogicGameProgress(userId: string): Promise<LogicGameProgressResponse> {
    const response = await fetch(`${this.baseURL}/logic-games/progress/${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to get Logic Games progress: ${response.statusText}`)
    }

    return response.json()
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convert enhanced question to Logic Games question
   */
  private async convertToLogicGameQuestion(question: EnhancedQuestionUniversal): Promise<LogicGameQuestion> {
    // Extract Logic Games metadata from concept_tags
    const gameType = this.extractGameType(question.concept_tags)
    const gameSubtype = this.extractGameSubtype(question.concept_tags)
    const difficultyTier = this.extractDifficultyTier(question.concept_tags)

    // Parse game setup from content (this would be implemented based on your content format)
    const gameSetup = await this.parseGameSetup(question.content)
    const gameRules = await this.parseGameRules(question.content)
    const gameBoardConfig = await this.generateBoardConfig(gameType, gameSubtype)

    return {
      ...question,
      game_type: gameType,
      game_subtype: gameSubtype,
      difficulty_tier: difficultyTier,
      game_setup: gameSetup,
      game_rules: gameRules,
      game_board_config: gameBoardConfig,
      question_stem: question.content,
      question_type: this.extractQuestionType(question.content),
      answer_choices: question.answer_choices.map(choice => ({
        ...choice,
        explanation: choice.explanation || ''
      })),
      solution_approach: await this.generateSolutionSteps(question),
      inference_chain: [],
      common_mistakes: [],
      average_completion_time: question.avg_difficulty_rating ? question.avg_difficulty_rating * 30 : 180,
      success_rate_by_tier: {
        introductory: 0.85,
        standard: 0.70,
        advanced: 0.55,
        expert: 0.40
      }
    }
  }

  /**
   * Extract game type from concept tags
   */
  private extractGameType(conceptTags: string[]): LogicGameType {
    const gameTypeTag = conceptTags.find(tag => tag.startsWith('game_type:'))
    if (gameTypeTag) {
      return gameTypeTag.split(':')[1] as LogicGameType
    }
    return 'sequencing' // default
  }

  /**
   * Extract game subtype from concept tags
   */
  private extractGameSubtype(conceptTags: string[]): LogicGameSubtype {
    const subtypeTag = conceptTags.find(tag => tag.startsWith('game_subtype:'))
    if (subtypeTag) {
      return subtypeTag.split(':')[1] as LogicGameSubtype
    }
    return 'linear_ordering' // default
  }

  /**
   * Extract difficulty tier from concept tags
   */
  private extractDifficultyTier(conceptTags: string[]): DifficultyTier {
    const tierTag = conceptTags.find(tag => tag.startsWith('difficulty_tier:'))
    if (tierTag) {
      return tierTag.split(':')[1] as DifficultyTier
    }
    return 'standard' // default
  }

  /**
   * Parse game setup from question content
   */
  private async parseGameSetup(content: string): Promise<any> {
    // This would implement parsing logic for your content format
    // For now, return a basic setup
    return {
      entities: [
        { id: 'entity1', name: 'A', type: 'person', color: '#3b82f6' },
        { id: 'entity2', name: 'B', type: 'person', color: '#10b981' },
        { id: 'entity3', name: 'C', type: 'person', color: '#f59e0b' }
      ],
      positions: [
        { id: 'pos1', name: 'Position 1', type: 'slot', order: 1 },
        { id: 'pos2', name: 'Position 2', type: 'slot', order: 2 },
        { id: 'pos3', name: 'Position 3', type: 'slot', order: 3 }
      ],
      constraints: [],
      scenario_description: 'Basic Logic Games scenario'
    }
  }

  /**
   * Parse game rules from question content
   */
  private async parseGameRules(content: string): Promise<any[]> {
    // This would implement rule parsing logic
    return [
      {
        id: 'rule1',
        rule_text: 'Sample rule',
        rule_type: 'conditional',
        logical_structure: {
          entities_involved: ['entity1'],
          positions_involved: ['pos1'],
          logical_operator: 'if_then'
        },
        difficulty_contribution: 2,
        common_misinterpretations: [],
        teaching_points: []
      }
    ]
  }

  /**
   * Generate board configuration based on game type
   */
  private async generateBoardConfig(gameType: LogicGameType, gameSubtype: LogicGameSubtype): Promise<any> {
    // Return default board config for now
    return {
      board_type: gameType === 'sequencing' ? 'linear_sequence' : 'grid_layout',
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
  }

  /**
   * Extract question type from content
   */
  private extractQuestionType(content: string): any {
    // Analyze content to determine question type
    if (content.toLowerCase().includes('could be true')) return 'could_be_true'
    if (content.toLowerCase().includes('must be true')) return 'must_be_true'
    if (content.toLowerCase().includes('cannot be true')) return 'cannot_be_true'
    return 'could_be_true' // default
  }

  /**
   * Generate solution steps for a question
   */
  private async generateSolutionSteps(question: EnhancedQuestionUniversal): Promise<any[]> {
    // This would implement solution step generation
    return [
      {
        step_number: 1,
        step_type: 'setup_analysis',
        description: 'Analyze the game setup and identify key constraints',
        concepts_demonstrated: ['setup_recognition'],
        inference_type: 'direct_application',
        difficulty_rating: 3
      }
    ]
  }

  /**
   * Extract game type facets from concept tags
   */
  private extractGameTypeFacets(conceptTags: Array<{ tag: string; count: number }>): Array<{ type: string; count: number }> {
    return conceptTags
      .filter(tag => tag.tag.startsWith('game_type:'))
      .map(tag => ({
        type: tag.tag.split(':')[1],
        count: tag.count
      }))
  }

  /**
   * Extract game subtype facets
   */
  private extractGameSubtypeFacets(conceptTags: Array<{ tag: string; count: number }>): Array<{ subtype: string; count: number }> {
    return conceptTags
      .filter(tag => tag.tag.startsWith('game_subtype:'))
      .map(tag => ({
        subtype: tag.tag.split(':')[1],
        count: tag.count
      }))
  }

  /**
   * Extract difficulty tier facets
   */
  private extractDifficultyTierFacets(conceptTags: Array<{ tag: string; count: number }>): Array<{ tier: string; count: number }> {
    return conceptTags
      .filter(tag => tag.tag.startsWith('difficulty_tier:'))
      .map(tag => ({
        tier: tag.tag.split(':')[1],
        count: tag.count
      }))
  }
}

// ============================================================================
// TYPE DEFINITIONS FOR API CLIENT
// ============================================================================

export interface LogicGamesSearchFilters {
  game_types?: LogicGameType[]
  game_subtypes?: LogicGameSubtype[]
  difficulty_tiers?: DifficultyTier[]
  difficulty_min?: number
  difficulty_max?: number
  min_quality_score?: number
  min_community_rating?: number
  search_text?: string
  concept_tags?: string[]
  created_after?: string
  created_before?: string
  limit?: number
  offset?: number
  sort_by?: 'quality_score' | 'community_rating' | 'difficulty' | 'created_at' | 'random'
  sort_order?: 'asc' | 'desc'
}

export interface LogicGamesSearchResult {
  questions: LogicGameQuestion[]
  total_count: number
  filtered_count: number
  facets: LogicGamesFacets
  pagination: {
    current_page: number
    total_pages: number
    page_size: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface LogicGamesFacets {
  game_types: Array<{ type: string; count: number }>
  game_subtypes: Array<{ subtype: string; count: number }>
  difficulty_tiers: Array<{ tier: string; count: number }>
  question_types: Array<{ type: string; count: number }>
  difficulty_levels: Array<{ level: string; count: number }>
}

// Default API client instance
export const logicGamesAPI = new LogicGamesAPIClient()

export default LogicGamesAPIClient