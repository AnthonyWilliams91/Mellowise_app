/**
 * Multi-Tenant Type Definitions
 * 
 * Provides type safety for multi-tenant operations following Context7 Nile patterns
 * 
 * @architecture Multi-tenant with composite primary keys (tenant_id, id)
 * @security Row Level Security (RLS) enforced tenant isolation
 * @ferpa Compliant tenant data segregation
 */

// Core tenant types
export interface Tenant {
  id: string
  name: string
  slug: string
  plan_type: 'institution' | 'enterprise' | 'demo'
  status: 'active' | 'suspended' | 'cancelled'
  max_users: number
  max_storage_gb: number
  features: Record<string, any>
  settings: Record<string, any>
  created_at: string
  updated_at: string
  last_active: string
  
  // FERPA compliance
  ferpa_compliant: boolean
  data_retention_days: number
  encryption_key_id?: string
  
  // Billing
  stripe_customer_id?: string
  billing_email?: string
  subscription_status: string
  
  // Contact info
  admin_name?: string
  admin_email?: string
  phone?: string
  institution_type?: string
}

// Tenant user relationship
export interface TenantUser {
  tenant_id: string
  user_id: string
  role: 'admin' | 'instructor' | 'student' | 'viewer'
  status: 'active' | 'suspended' | 'invited'
  invited_at?: string
  joined_at: string
  last_login?: string
  permissions: Record<string, any>
  metadata: Record<string, any>
}

// Multi-tenant entity base interface
export interface MultiTenantEntity {
  tenant_id: string
  id: string
}

// Updated user profile for multi-tenant
export interface UserProfileMT extends MultiTenantEntity {
  email: string
  full_name?: string
  target_test_date?: string
  current_score?: number
  subscription_tier: 'free' | 'premium' | 'early_adopter'
  created_at: string
  updated_at: string
  last_active: string
  preferences: Record<string, any>
}

// Multi-tenant question interface
export interface QuestionMT extends MultiTenantEntity {
  content: string
  question_type: 'logical_reasoning' | 'logic_games' | 'reading_comprehension'
  subtype?: string
  difficulty: number
  estimated_time?: number
  correct_answer: string
  answer_choices: any[]
  explanation: string
  concept_tags: string[]
  source_attribution?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Multi-tenant game session interface
export interface GameSessionMT extends MultiTenantEntity {
  user_id: string
  session_type: 'survival_mode' | 'practice' | 'test'
  started_at: string
  ended_at?: string
  final_score: number
  questions_answered: number
  correct_answers: number
  lives_remaining: number
  difficulty_level: number
  session_data: Record<string, any>
}

// Multi-tenant question attempt interface
export interface QuestionAttemptMT extends MultiTenantEntity {
  user_id: string
  question_id: string
  session_id?: string
  selected_answer: string
  is_correct: boolean
  response_time?: number
  attempted_at: string
  hint_used: boolean
  difficulty_at_attempt?: number
}

// Multi-tenant analytics interface
export interface UserAnalyticsMT extends MultiTenantEntity {
  user_id: string
  metric_type: string
  metric_data: any
  date_recorded: string
  created_at: string
}

// Multi-tenant subscription interface
export interface SubscriptionMT extends MultiTenantEntity {
  user_id: string
  stripe_subscription_id?: string
  plan_type: 'free' | 'premium' | 'early_adopter'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

// Tenant context for session management
export interface TenantContext {
  tenant_id: string
  tenant_slug: string
  tenant_name: string
  user_role: TenantUser['role']
  user_permissions: Record<string, any>
}

// Tenant invitation
export interface TenantInvitation {
  id: string
  tenant_id: string
  inviter_id: string
  email: string
  role: TenantUser['role']
  status: 'pending' | 'accepted' | 'expired'
  invited_at: string
  expires_at: string
  token: string
}

// Tenant usage statistics
export interface TenantUsageStats {
  id: string
  name: string
  slug: string
  status: string
  plan_type: string
  user_count: number
  sessions_last_30d: number
  questions_last_30d: number
  last_active: string
  created_at: string
}

// Request/Response types for tenant operations
export interface CreateTenantRequest {
  name: string
  slug: string
  admin_email?: string
  institution_type?: string
  plan_type?: Tenant['plan_type']
  admin_name?: string
  phone?: string
}

export interface CreateTenantResponse {
  tenant: Tenant
  admin_user: TenantUser
}

export interface AddUserToTenantRequest {
  tenant_id: string
  user_id: string
  role: TenantUser['role']
  permissions?: Record<string, any>
}

export interface TenantInviteRequest {
  tenant_id: string
  email: string
  role: TenantUser['role']
  message?: string
}

// Multi-tenant database operation context
export interface MTDatabaseContext {
  tenant_id: string
  user_id?: string
}

// Multi-tenant query options
export interface MTQueryOptions {
  tenant_id: string
  limit?: number
  offset?: number
  orderBy?: { column: string; ascending: boolean }
  select?: string
}

// Multi-tenant audit log
export interface AuditLogMT {
  id: string
  tenant_id: string
  user_id?: string
  action: string
  table_name: string
  record_id?: string
  old_values?: any
  new_values?: any
  created_at: string
  ip_address?: string
  user_agent?: string
}

// Error types for multi-tenant operations
// Error types for multi-tenant operations - using regular exports
export class TenantNotFoundError extends Error {
  constructor(tenant_id: string) {
    super(`Tenant not found: ${tenant_id}`)
    this.name = 'TenantNotFoundError'
  }
}

export class TenantAccessDeniedError extends Error {
  constructor(tenant_id: string, user_id: string) {
    super(`Access denied to tenant ${tenant_id} for user ${user_id}`)
    this.name = 'TenantAccessDeniedError'
  }
}

export class TenantInvalidSlugError extends Error {
  constructor(slug: string) {
    super(`Invalid tenant slug: ${slug}`)
    this.name = 'TenantInvalidSlugError'
  }
}

// Type guards
export function isMultiTenantEntity(obj: any): obj is MultiTenantEntity {
  return obj && typeof obj === 'object' && 
         typeof obj.tenant_id === 'string' && 
         typeof obj.id === 'string'
}

export function isTenantAdmin(tenantUser: TenantUser): boolean {
  return tenantUser.role === 'admin'
}

export function isTenantInstructor(tenantUser: TenantUser): boolean {
  return tenantUser.role === 'instructor' || tenantUser.role === 'admin'
}

export function canAccessTenantData(tenantUser: TenantUser): boolean {
  return tenantUser.status === 'active' && 
         ['admin', 'instructor', 'student'].includes(tenantUser.role)
}

// Constants
export const TENANT_ROLES = ['admin', 'instructor', 'student', 'viewer'] as const
export const TENANT_STATUSES = ['active', 'suspended', 'cancelled'] as const
export const TENANT_PLAN_TYPES = ['institution', 'enterprise', 'demo'] as const

export const DEFAULT_TENANT_LIMITS = {
  institution: { max_users: 1000, max_storage_gb: 100 },
  enterprise: { max_users: 10000, max_storage_gb: 1000 },
  demo: { max_users: 50, max_storage_gb: 10 }
} as const