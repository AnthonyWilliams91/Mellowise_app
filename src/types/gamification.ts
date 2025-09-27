/**
 * MELLOWISE-026: Gamification System Type Definitions
 *
 * Comprehensive gamification system with XP progression (1-50), achievement badges,
 * daily challenges, weekly tournaments, and power-up store
 *
 * @epic Epic 4 - Enterprise & Institutional Tools
 * @card MELLOWISE-026
 * @version 1.0.0
 */

import { MultiTenantEntity } from './tenant'

// ===============================
// XP and Level Progression Types
// ===============================

/**
 * Experience point (XP) categories and sources
 */
export type XPSource =
  | 'question_correct' | 'question_streak' | 'session_complete'
  | 'daily_challenge' | 'weekly_tournament' | 'achievement'
  | 'study_time' | 'improvement' | 'consistency' | 'milestone'
  | 'social_interaction' | 'content_creation' | 'helping_others'

/**
 * User level and XP tracking
 */
export interface UserLevel extends MultiTenantEntity {
  user_id: string

  // Current status
  current_level: number // 1-50
  current_xp: number
  total_lifetime_xp: number

  // Level boundaries
  xp_to_next_level: number
  xp_for_current_level: number
  level_progress_percentage: number

  // XP earnings today
  daily_xp_earned: number
  daily_xp_limit: number
  daily_xp_bonus_active: boolean

  // Streaks and bonuses
  study_streak_days: number
  best_study_streak: number
  xp_multiplier: number // Current multiplier (base 1.0)
  multiplier_expires_at?: string

  // Statistics
  levels_gained_this_month: number
  average_daily_xp: number
  xp_efficiency_score: number // XP per minute studied

  last_xp_earned: string
  level_updated_at: string
  created_at: string
}

/**
 * XP transaction log
 */
export interface XPTransaction extends MultiTenantEntity {
  user_id: string
  session_id?: string

  // Transaction details
  xp_amount: number
  xp_source: XPSource
  multiplier_applied: number

  // Context
  source_description: string
  related_entity_id?: string // Question ID, achievement ID, etc.
  related_entity_type?: string

  // Level progression
  level_before: number
  level_after: number
  level_up_occurred: boolean

  // Bonuses
  streak_bonus: number
  daily_bonus: number
  special_bonus: number
  bonus_reason?: string

  // Metadata
  earned_at: string
  session_context?: Record<string, any>

  created_at: string
}

/**
 * Level configuration and rewards
 */
export interface LevelConfig {
  level: number // 1-50
  required_xp: number
  cumulative_xp: number

  // Rewards
  title: string
  description: string
  icon: string
  color_scheme: string

  // Unlocks
  features_unlocked: string[]
  achievements_unlocked: string[]
  power_ups_unlocked: string[]

  // Prestige benefits
  xp_bonus_percentage: number
  daily_challenge_slots: number
  tournament_entry_limit: number

  // Cosmetics
  profile_badge: string
  avatar_frames: string[]
  study_themes: string[]

  created_at: string
  updated_at: string
}

// ===============================
// Achievement System Types
// ===============================

/**
 * Achievement categories
 */
export type AchievementCategory =
  | 'academic' | 'consistency' | 'improvement' | 'social'
  | 'exploration' | 'mastery' | 'milestone' | 'special'

/**
 * Achievement rarity levels
 */
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * Achievement definition
 */
export interface Achievement extends MultiTenantEntity {
  // Basic info
  name: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity

  // Visual
  icon: string
  badge_color: string
  animation: string
  unlock_effect: string

  // Requirements
  requirements: AchievementRequirement[]
  unlock_conditions: Record<string, any>

  // Rewards
  xp_reward: number
  coin_reward: number
  power_up_rewards: string[]
  cosmetic_rewards: string[]

  // Progression
  is_progressive: boolean // Can be earned multiple times
  max_progress: number
  progress_tiers: {
    tier: number
    required_progress: number
    tier_reward: number
    tier_title: string
  }[]

  // Metadata
  hint_text: string
  completion_message: string
  share_text: string

  // Availability
  is_active: boolean
  is_hidden: boolean // Hidden until requirements nearly met
  is_seasonal: boolean
  season_start?: string
  season_end?: string

  // Statistics
  total_earned: number
  completion_rate: number
  rarity_score: number

  created_at: string
  updated_at: string
}

/**
 * Achievement requirement
 */
export interface AchievementRequirement {
  id: string
  type: 'count' | 'streak' | 'percentage' | 'time' | 'score' | 'comparison'

  // Requirement details
  metric: string // What to measure
  target_value: number
  comparison_operator: '>' | '>=' | '=' | '<' | '<=' | 'between'
  time_window?: 'daily' | 'weekly' | 'monthly' | 'all_time'

  // Context filters
  subject_areas?: string[]
  difficulty_range?: [number, number]
  question_types?: string[]

  description: string
  progress_format: string // How to display progress (e.g., "{current}/{target}")
}

/**
 * User achievement progress
 */
export interface UserAchievementProgress extends MultiTenantEntity {
  user_id: string
  achievement_id: string

  // Progress tracking
  current_progress: number
  max_progress: number
  completion_percentage: number

  // Completion status
  is_completed: boolean
  completed_at?: string
  completion_tier?: number

  // Progress breakdown
  requirement_progress: Record<string, number>
  milestone_reached: number[]

  // Tracking
  first_progress_date: string
  last_progress_date: string
  progress_velocity: number // Progress per day

  created_at: string
  updated_at: string
}

/**
 * Achievement unlock event
 */
export interface AchievementUnlock extends MultiTenantEntity {
  user_id: string
  achievement_id: string
  session_id?: string

  // Unlock details
  unlocked_at: string
  completion_tier: number
  progress_at_unlock: number

  // Context
  trigger_event: string
  trigger_context: Record<string, any>

  // Rewards given
  xp_rewarded: number
  coins_rewarded: number
  items_rewarded: string[]

  // Social
  is_shared: boolean
  share_platform?: string

  created_at: string
}

// ===============================
// Daily Challenges Types
// ===============================

/**
 * Challenge difficulty levels
 */
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

/**
 * Challenge types
 */
export type ChallengeType =
  | 'questions_answered' | 'accuracy_target' | 'time_challenge'
  | 'streak_maintenance' | 'improvement_focus' | 'subject_mastery'
  | 'endurance' | 'speed' | 'consistency' | 'exploration'

/**
 * Daily challenge definition
 */
export interface DailyChallenge extends MultiTenantEntity {
  // Basic info
  name: string
  description: string
  type: ChallengeType
  difficulty: ChallengeDifficulty

  // Challenge parameters
  target_metric: string
  target_value: number
  time_limit?: number // seconds
  attempts_allowed: number

  // Constraints
  subject_areas: string[]
  question_types: string[]
  difficulty_range: [number, number]

  // Rewards
  base_xp_reward: number
  base_coin_reward: number
  bonus_multipliers: Record<string, number>
  completion_rewards: string[]

  // Availability
  available_date: string
  expires_at: string
  is_global: boolean // Same for all users vs personalized

  // Difficulty scaling
  user_level_requirement: number
  scaling_factor: number

  // Metadata
  completion_message: string
  failure_message: string
  hint: string

  created_at: string
  updated_at: string
}

/**
 * User daily challenge progress
 */
export interface UserDailyChallengeProgress extends MultiTenantEntity {
  user_id: string
  challenge_id: string

  // Progress tracking
  current_progress: number
  target_progress: number
  completion_percentage: number

  // Status
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired'
  started_at?: string
  completed_at?: string

  // Performance
  attempts_used: number
  attempts_remaining: number
  time_spent: number
  best_performance: number

  // Rewards
  xp_earned: number
  coins_earned: number
  items_earned: string[]
  bonus_applied: Record<string, number>

  // Context
  session_ids: string[]
  performance_data: Record<string, any>

  created_at: string
  updated_at: string
}

/**
 * Challenge streak tracking
 */
export interface ChallengeStreak extends MultiTenantEntity {
  user_id: string

  // Streak info
  current_streak: number
  best_streak: number
  total_challenges_completed: number

  // Streak bonuses
  streak_multiplier: number
  next_bonus_at: number
  streak_bonus_active: boolean

  // Statistics
  challenges_this_week: number
  challenges_this_month: number
  completion_rate: number

  // Rewards
  streak_rewards_earned: string[]
  milestone_rewards: Record<number, string[]>

  last_challenge_date: string
  streak_started_at: string
  updated_at: string
}

// ===============================
// Weekly Tournament Types
// ===============================

/**
 * Tournament formats
 */
export type TournamentFormat =
  | 'elimination' | 'round_robin' | 'swiss' | 'ladder'
  | 'battle_royale' | 'team_based' | 'survival'

/**
 * Tournament status
 */
export type TournamentStatus =
  | 'upcoming' | 'registration' | 'active' | 'completed' | 'cancelled'

/**
 * Weekly tournament
 */
export interface WeeklyTournament extends MultiTenantEntity {
  // Basic info
  name: string
  description: string
  format: TournamentFormat
  status: TournamentStatus

  // Schedule
  registration_opens: string
  registration_closes: string
  tournament_starts: string
  tournament_ends: string
  week_number: number
  year: number

  // Configuration
  max_participants: number
  min_participants: number
  entry_fee_coins: number
  level_requirement: number

  // Competition rules
  question_categories: string[]
  questions_per_round: number
  time_per_question: number
  elimination_criteria: Record<string, any>

  // Prizes
  prize_pool_xp: number
  prize_pool_coins: number
  winner_rewards: string[]
  participation_rewards: string[]
  rank_based_rewards: Record<string, string[]>

  // Brackets and rounds
  total_rounds: number
  current_round: number
  bracket_structure: Record<string, any>

  // Statistics
  registered_participants: number
  active_participants: number
  completed_matches: number
  total_matches: number

  created_at: string
  updated_at: string
}

/**
 * Tournament participant
 */
export interface TournamentParticipant extends MultiTenantEntity {
  user_id: string
  tournament_id: string

  // Registration
  registered_at: string
  registration_fee_paid: number
  team_id?: string // For team tournaments

  // Status
  status: 'registered' | 'active' | 'eliminated' | 'winner' | 'withdrawn'
  eliminated_at?: string
  elimination_reason?: string

  // Performance
  current_rank: number
  best_rank: number
  matches_played: number
  matches_won: number
  matches_lost: number

  // Statistics
  total_questions_answered: number
  correct_answers: number
  average_response_time: number
  accuracy_percentage: number

  // Rewards earned
  xp_earned: number
  coins_earned: number
  items_earned: string[]

  created_at: string
  updated_at: string
}

/**
 * Tournament match
 */
export interface TournamentMatch extends MultiTenantEntity {
  tournament_id: string
  round_number: number
  match_number: number

  // Participants
  participant_ids: string[]
  team_ids?: string[]

  // Match details
  status: 'scheduled' | 'in_progress' | 'completed' | 'forfeited'
  scheduled_start: string
  actual_start?: string
  completed_at?: string

  // Questions and scoring
  question_ids: string[]
  participant_scores: Record<string, number>
  final_scores: Record<string, number>

  // Results
  winner_id?: string
  winning_team_id?: string
  match_data: Record<string, any>

  // Next round advancement
  advances_to_match?: string
  elimination_results: Record<string, boolean>

  created_at: string
  updated_at: string
}

/**
 * Tournament leaderboard
 */
export interface TournamentLeaderboard extends MultiTenantEntity {
  tournament_id: string

  // Ranking data
  rankings: {
    rank: number
    user_id: string
    username: string
    avatar?: string
    level: number
    score: number
    matches_played: number
    win_rate: number
    average_response_time: number
    badge?: string
  }[]

  // Statistics
  total_participants: number
  matches_completed: number
  average_score: number
  highest_score: number

  // Updates
  last_updated: string
  next_update: string
  is_final: boolean

  generated_at: string
}

// ===============================
// Power-Up Store Types
// ===============================

/**
 * Power-up categories
 */
export type PowerUpCategory =
  | 'time' | 'hints' | 'scoring' | 'challenges' | 'cosmetic' | 'utility'

/**
 * Power-up rarity
 */
export type PowerUpRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * Power-up definition
 */
export interface PowerUp extends MultiTenantEntity {
  // Basic info
  name: string
  description: string
  category: PowerUpCategory
  rarity: PowerUpRarity

  // Visual
  icon: string
  color_scheme: string
  animation_effect: string

  // Effects
  effects: PowerUpEffect[]
  duration: number // seconds, 0 for permanent
  cooldown: number // seconds between uses

  // Pricing
  coin_price: number
  gem_price?: number
  bundle_discounts: Record<number, number> // quantity -> discount %

  // Availability
  is_available: boolean
  level_requirement: number
  prerequisite_power_ups: string[]

  // Usage restrictions
  max_uses_per_day: number
  max_uses_per_session: number
  stackable: boolean

  // Seasonal/Limited
  is_limited_time: boolean
  available_until?: string
  is_seasonal: boolean

  // Statistics
  total_purchased: number
  popularity_score: number
  effectiveness_rating: number

  created_at: string
  updated_at: string
}

/**
 * Power-up effect
 */
export interface PowerUpEffect {
  id: string
  type: 'multiplier' | 'additive' | 'special' | 'cosmetic'

  // Effect parameters
  target: 'xp' | 'coins' | 'time' | 'hints' | 'accuracy' | 'streak'
  value: number
  operation: 'multiply' | 'add' | 'set' | 'enable'

  // Conditions
  applies_to: string[] // question types, subjects, etc.
  trigger_conditions: Record<string, any>

  // Display
  description: string
  icon: string

  created_at: string
}

/**
 * User power-up inventory
 */
export interface UserPowerUpInventory extends MultiTenantEntity {
  user_id: string
  power_up_id: string

  // Quantity and usage
  quantity: number
  total_purchased: number
  uses_today: number
  uses_this_session: number

  // Status
  last_used_at?: string
  cooldown_expires_at?: string
  is_active: boolean
  active_expires_at?: string

  // Statistics
  total_uses: number
  effectiveness_score: number
  satisfaction_rating?: number

  // Purchase history
  first_purchased_at: string
  last_purchased_at: string
  total_spent_coins: number

  created_at: string
  updated_at: string
}

/**
 * Power-up store purchase
 */
export interface PowerUpPurchase extends MultiTenantEntity {
  user_id: string
  power_up_id: string

  // Purchase details
  quantity: number
  unit_price_coins: number
  total_price_coins: number
  discount_applied: number

  // Payment
  payment_method: 'coins' | 'gems' | 'real_money'
  transaction_id: string

  // Context
  purchase_reason: 'regular' | 'bundle' | 'sale' | 'achievement_reward'
  session_id?: string

  purchased_at: string
  created_at: string
}

// ===============================
// Currency System Types
// ===============================

/**
 * User currency balance
 */
export interface UserCurrency extends MultiTenantEntity {
  user_id: string

  // Currency amounts
  coins: number
  gems: number
  tokens: number

  // Daily/Weekly limits
  daily_coins_earned: number
  daily_coin_limit: number
  weekly_gems_earned: number
  weekly_gem_limit: number

  // Lifetime statistics
  total_coins_earned: number
  total_coins_spent: number
  total_gems_earned: number
  total_gems_spent: number

  // Bonuses
  coin_multiplier: number
  gem_multiplier: number
  multiplier_expires_at?: string

  last_updated: string
  created_at: string
}

/**
 * Currency transaction
 */
export interface CurrencyTransaction extends MultiTenantEntity {
  user_id: string

  // Transaction details
  currency_type: 'coins' | 'gems' | 'tokens'
  amount: number
  transaction_type: 'earned' | 'spent' | 'transferred' | 'refunded'

  // Source/Destination
  source: 'xp_conversion' | 'achievement' | 'purchase' | 'challenge' | 'tournament' | 'daily_bonus'
  source_id?: string
  description: string

  // Context
  session_id?: string
  multiplier_applied: number
  bonus_amount: number

  // Balances
  balance_before: number
  balance_after: number

  created_at: string
}

// ===============================
// Social Features Types
// ===============================

/**
 * User profile for gamification
 */
export interface GamificationProfile extends MultiTenantEntity {
  user_id: string

  // Display info
  display_name: string
  avatar_url?: string
  avatar_frame: string
  profile_badge: string
  title: string

  // Stats display preferences
  show_level: boolean
  show_achievements: boolean
  show_statistics: boolean
  privacy_level: 'public' | 'friends' | 'private'

  // Featured achievements (up to 3)
  featured_achievements: string[]
  featured_statistics: string[]

  // Customizations
  profile_theme: string
  banner_image?: string
  custom_colors: Record<string, string>

  // Social settings
  allow_friend_requests: boolean
  show_online_status: boolean
  allow_challenge_requests: boolean

  updated_at: string
  created_at: string
}

/**
 * Friend system for social features
 */
export interface UserFriend extends MultiTenantEntity {
  user_id: string
  friend_user_id: string

  // Relationship status
  status: 'pending' | 'accepted' | 'blocked'
  requested_at: string
  accepted_at?: string

  // Social stats
  study_sessions_together: number
  challenges_competed: number
  achievements_shared: number

  created_at: string
  updated_at: string
}

/**
 * Leaderboard system
 */
export interface Leaderboard extends MultiTenantEntity {
  // Leaderboard config
  name: string
  type: 'global' | 'friends' | 'institution' | 'class'
  metric: 'xp' | 'level' | 'achievements' | 'streaks' | 'challenges'
  time_period: 'daily' | 'weekly' | 'monthly' | 'all_time'

  // Filtering
  subject_filter?: string[]
  level_range?: [number, number]
  institution_filter?: string

  // Rankings (top 100)
  rankings: {
    rank: number
    user_id: string
    display_name: string
    avatar?: string
    level: number
    value: number
    badge?: string
    change_from_previous: number
  }[]

  // Statistics
  total_participants: number
  last_updated: string
  next_update: string

  created_at: string
}

// ===============================
// Analytics and Reporting Types
// ===============================

/**
 * Gamification analytics
 */
export interface GamificationAnalytics extends MultiTenantEntity {
  user_id: string
  date: string

  // Engagement metrics
  session_duration: number
  questions_answered: number
  challenges_completed: number
  power_ups_used: number

  // Progression metrics
  xp_earned: number
  levels_gained: number
  achievements_unlocked: number

  // Social metrics
  friends_interacted_with: number
  leaderboard_rank_changes: number

  // Economy metrics
  coins_earned: number
  coins_spent: number
  purchases_made: number

  recorded_at: string
}

/**
 * System-wide gamification metrics
 */
export interface SystemGamificationMetrics extends MultiTenantEntity {
  date: string

  // Overall engagement
  total_active_users: number
  average_session_duration: number
  total_xp_earned: number
  total_achievements_unlocked: number

  // Feature usage
  daily_challenges_completion_rate: number
  tournament_participation_rate: number
  power_up_usage_rate: number

  // Economy health
  average_coins_per_user: number
  coins_circulation_rate: number
  purchase_conversion_rate: number

  // User progression
  level_distribution: Record<number, number>
  average_user_level: number
  retention_rate_by_level: Record<number, number>

  recorded_at: string
}

// ===============================
// Configuration Types
// ===============================

/**
 * Gamification system configuration
 */
export interface GamificationConfig extends MultiTenantEntity {
  // XP system
  xp_rates: Record<XPSource, number>
  level_xp_requirements: Record<number, number>
  daily_xp_limit: number
  xp_multiplier_duration: number

  // Achievement system
  achievement_categories_enabled: AchievementCategory[]
  hidden_achievement_threshold: number
  achievement_notification_settings: Record<string, boolean>

  // Challenge system
  daily_challenges_enabled: boolean
  challenges_per_day: number
  challenge_difficulty_distribution: Record<ChallengeDifficulty, number>

  // Tournament system
  tournaments_enabled: boolean
  tournament_frequency: 'weekly' | 'bi_weekly' | 'monthly'
  max_tournament_participants: number

  // Power-up store
  store_enabled: boolean
  daily_free_coins: number
  coin_exchange_rate: Record<string, number>

  // Social features
  leaderboards_enabled: boolean
  friends_system_enabled: boolean
  public_profiles_enabled: boolean

  updated_at: string
  created_at: string
}

// ===============================
// Request/Response Types
// ===============================

export interface XPEarnedRequest {
  tenant_id: string
  user_id: string
  source: XPSource
  base_amount: number
  multiplier?: number
  context?: Record<string, any>
}

export interface XPEarnedResponse {
  xp_awarded: number
  level_before: number
  level_after: number
  level_up_occurred: boolean
  total_xp: number
  next_level_xp: number
  achievements_unlocked?: string[]
}

export interface AchievementProgressRequest {
  tenant_id: string
  user_id: string
  metric_updates: Record<string, number>
  context?: Record<string, any>
}

export interface AchievementProgressResponse {
  achievements_progressed: {
    achievement_id: string
    progress_before: number
    progress_after: number
    unlocked: boolean
  }[]
  new_achievements_unlocked: Achievement[]
  xp_awarded: number
}

export interface PowerUpActivationRequest {
  tenant_id: string
  user_id: string
  power_up_id: string
  context?: Record<string, any>
}

export interface PowerUpActivationResponse {
  success: boolean
  power_up: PowerUp
  effects_applied: PowerUpEffect[]
  duration: number
  expires_at: string
  error?: string
}

export interface LeaderboardRequest {
  tenant_id: string
  type: 'global' | 'friends' | 'institution' | 'class'
  metric: string
  time_period: string
  limit?: number
  offset?: number
}

export interface LeaderboardResponse {
  leaderboard: Leaderboard
  user_rank?: number
  user_stats: Record<string, number>
}

// ===============================
// Constants
// ===============================

export const MAX_LEVEL = 50

export const XP_SOURCES_BASE_VALUES: Record<XPSource, number> = {
  question_correct: 10,
  question_streak: 5,
  session_complete: 25,
  daily_challenge: 50,
  weekly_tournament: 100,
  achievement: 0, // Variable based on achievement
  study_time: 1, // Per minute
  improvement: 20,
  consistency: 15,
  milestone: 30,
  social_interaction: 5,
  content_creation: 40,
  helping_others: 15
} as const

export const LEVEL_XP_MULTIPLIERS = {
  1: 100,
  5: 1.2,
  10: 1.5,
  15: 1.8,
  20: 2.0,
  25: 2.3,
  30: 2.6,
  35: 3.0,
  40: 3.5,
  45: 4.0,
  50: 5.0
} as const

export const ACHIEVEMENT_RARITY_XP_MULTIPLIERS: Record<AchievementRarity, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.0,
  epic: 3.0,
  legendary: 5.0
} as const

export const CHALLENGE_DIFFICULTY_MULTIPLIERS: Record<ChallengeDifficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  expert: 3.0
} as const

export const CURRENCY_EXCHANGE_RATES = {
  xp_to_coins: 0.1, // 10 XP = 1 coin
  coins_to_gems: 100, // 100 coins = 1 gem
  achievement_bonus: 0.2
} as const

// ===============================
// Type Guards
// ===============================

export function isXPTransaction(obj: any): obj is XPTransaction {
  return obj && typeof obj === 'object' &&
         typeof obj.xp_amount === 'number' &&
         typeof obj.xp_source === 'string' &&
         typeof obj.level_before === 'number'
}

export function isAchievement(obj: any): obj is Achievement {
  return obj && typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         typeof obj.category === 'string' &&
         typeof obj.rarity === 'string' &&
         Array.isArray(obj.requirements)
}

export function isPowerUp(obj: any): obj is PowerUp {
  return obj && typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         typeof obj.category === 'string' &&
         Array.isArray(obj.effects) &&
         typeof obj.coin_price === 'number'
}

// ===============================
// Helper Functions
// ===============================

export function calculateXPForLevel(level: number): number {
  if (level < 1 || level > MAX_LEVEL) return 0

  const baseXP = 100
  const multiplier = Math.pow(1.15, level - 1)
  return Math.round(baseXP * multiplier)
}

export function calculateLevelFromXP(totalXP: number): number {
  let level = 1
  let requiredXP = 0

  while (level <= MAX_LEVEL) {
    const levelXP = calculateXPForLevel(level)
    if (requiredXP + levelXP > totalXP) break
    requiredXP += levelXP
    level++
  }

  return Math.min(level, MAX_LEVEL)
}

export function getAchievementRarityColor(rarity: AchievementRarity): string {
  const colors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  }
  return colors[rarity]
}

export function calculateTournamentSeeding(participants: TournamentParticipant[]): TournamentParticipant[] {
  return participants.sort((a, b) => {
    // Sort by current rank, then by accuracy, then by average response time
    if (a.current_rank !== b.current_rank) {
      return a.current_rank - b.current_rank
    }
    if (a.accuracy_percentage !== b.accuracy_percentage) {
      return b.accuracy_percentage - a.accuracy_percentage
    }
    return a.average_response_time - b.average_response_time
  })
}