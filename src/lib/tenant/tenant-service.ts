/**
 * Tenant Management Service
 * 
 * Provides comprehensive tenant management following Context7 Nile patterns
 * Implements secure multi-tenant operations with FERPA compliance
 * 
 * @pattern Nile-style tenant isolation with session context
 * @security Row Level Security (RLS) enforced at database level
 * @ferpa Educational data segregation and audit logging
 */

import { withDatabase } from '../database/connection-pool'
import { trackUserAction } from '../database/performance-monitor'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Tenant,
  TenantUser,
  TenantContext,
  CreateTenantRequest,
  CreateTenantResponse,
  AddUserToTenantRequest,
  TenantInviteRequest,
  TenantUsageStats,
  MTDatabaseContext
} from '../../types/tenant'
import { 
  TenantNotFoundError,
  TenantAccessDeniedError,
  TenantInvalidSlugError
} from '../../types/tenant'

/**
 * Core Tenant Management Service
 * Implements Nile-pattern tenant isolation and management
 */
export class TenantService {
  private static instance: TenantService

  static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService()
    }
    return TenantService.instance
  }

  /**
   * Set tenant context for database session (Nile pattern)
   * Critical for tenant isolation - equivalent to SET nile.tenant_id
   */
  async setTenantContext(
    client: SupabaseClient,
    tenantId: string
  ): Promise<void> {
    try {
      await client.rpc('set_tenant_context', { tenant_uuid: tenantId })
    } catch (error) {
      console.error('Failed to set tenant context:', error)
      throw new Error('Tenant context initialization failed')
    }
  }

  /**
   * Clear tenant context from session
   */
  async clearTenantContext(client: SupabaseClient): Promise<void> {
    try {
      await client.rpc('clear_tenant_context')
    } catch (error) {
      console.warn('Failed to clear tenant context:', error)
    }
  }

  /**
   * Create new tenant with admin user
   */
  async createTenant(
    request: CreateTenantRequest,
    adminUserId: string
  ): Promise<CreateTenantResponse> {
    return withDatabase(async (client: SupabaseClient) => {
      // Validate slug uniqueness and format
      const slugValid = await this.validateTenantSlug(client, request.slug)
      if (!slugValid) {
        throw new TenantInvalidSlugError(request.slug)
      }

      // Create tenant using database function
      const { data: tenantId, error: createError } = await client
        .rpc('create_tenant', {
          tenant_name: request.name,
          tenant_slug: request.slug,
          admin_user_id: adminUserId,
          admin_email: request.admin_email || null
        })

      if (createError) {
        console.error('Tenant creation failed:', createError)
        throw new Error('Failed to create tenant')
      }

      // Fetch created tenant
      const tenant = await this.getTenantById(tenantId)
      if (!tenant) {
        throw new Error('Failed to retrieve created tenant')
      }

      // Get admin user relationship
      const adminUser = await this.getTenantUser(tenantId, adminUserId)
      if (!adminUser) {
        throw new Error('Failed to retrieve admin user relationship')
      }

      // Log tenant creation for audit
      await trackUserAction(
        adminUserId,
        'CREATE_TENANT',
        'tenants',
        tenantId
      )

      return {
        tenant,
        admin_user: adminUser
      }
    })
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    return withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

      if (error) {
        console.error('Failed to fetch tenant:', error)
        return null
      }

      return data
    })
  }

  /**
   * Get tenant by slug (for subdomain routing)
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    return withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single()

      if (error) {
        return null
      }

      return data
    })
  }

  /**
   * Get tenant user relationship
   */
  async getTenantUser(
    tenantId: string,
    userId: string
  ): Promise<TenantUser | null> {
    return withDatabase(async (client: SupabaseClient) => {
      // Set tenant context for security
      await this.setTenantContext(client, tenantId)

      const { data, error } = await client
        .from('tenant_users')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)
        .single()

      if (error) {
        return null
      }

      return data
    })
  }

  /**
   * Add user to tenant
   */
  async addUserToTenant(request: AddUserToTenantRequest): Promise<boolean> {
    return withDatabase(async (client: SupabaseClient) => {
      // Set tenant context
      await this.setTenantContext(client, request.tenant_id)

      // Use database function for safe user addition
      const { data, error } = await client
        .rpc('add_user_to_tenant', {
          tenant_uuid: request.tenant_id,
          user_uuid: request.user_id,
          user_role: request.role
        })

      if (error) {
        console.error('Failed to add user to tenant:', error)
        return false
      }

      // Log the action
      await trackUserAction(
        request.user_id,
        'ADD_TO_TENANT',
        'tenant_users',
        `${request.tenant_id}:${request.user_id}`
      )

      return data
    })
  }

  /**
   * Get tenant users with pagination
   */
  async getTenantUsers(
    tenantId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<TenantUser[]> {
    return withDatabase(async (client: SupabaseClient) => {
      // Set tenant context
      await this.setTenantContext(client, tenantId)

      let query = client
        .from('tenant_users')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('joined_at', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch tenant users:', error)
        return []
      }

      return data || []
    })
  }

  /**
   * Update user role in tenant
   */
  async updateUserRole(
    tenantId: string,
    userId: string,
    newRole: TenantUser['role']
  ): Promise<boolean> {
    return withDatabase(async (client: SupabaseClient) => {
      // Set tenant context
      await this.setTenantContext(client, tenantId)

      const { error } = await client
        .from('tenant_users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to update user role:', error)
        return false
      }

      // Log the role change
      await trackUserAction(
        userId,
        'UPDATE_ROLE',
        'tenant_users',
        `${tenantId}:${userId}:${newRole}`
      )

      return true
    })
  }

  /**
   * Remove user from tenant
   */
  async removeUserFromTenant(
    tenantId: string,
    userId: string
  ): Promise<boolean> {
    return withDatabase(async (client: SupabaseClient) => {
      // Set tenant context
      await this.setTenantContext(client, tenantId)

      // Soft delete by setting status to suspended
      const { error } = await client
        .from('tenant_users')
        .update({ 
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to remove user from tenant:', error)
        return false
      }

      // Log the removal
      await trackUserAction(
        userId,
        'REMOVE_FROM_TENANT',
        'tenant_users',
        `${tenantId}:${userId}`
      )

      return true
    })
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsageStats(tenantId?: string): Promise<TenantUsageStats[]> {
    return withDatabase(async (client: SupabaseClient) => {
      if (tenantId) {
        await this.setTenantContext(client, tenantId)
      }

      const { data, error } = await client
        .from('tenant_usage_stats')
        .select('*')
        .order('user_count', { ascending: false })

      if (error) {
        console.error('Failed to fetch tenant usage stats:', error)
        return []
      }

      return data || []
    })
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(
    tenantId: string,
    settings: Partial<Tenant>
  ): Promise<boolean> {
    return withDatabase(async (client: SupabaseClient) => {
      // Set tenant context
      await this.setTenantContext(client, tenantId)

      const { error } = await client
        .from('tenants')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)

      if (error) {
        console.error('Failed to update tenant settings:', error)
        return false
      }

      return true
    })
  }

  /**
   * Validate tenant slug format and uniqueness
   */
  private async validateTenantSlug(
    client: SupabaseClient,
    slug: string
  ): Promise<boolean> {
    // Check format: only lowercase letters, numbers, hyphens
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return false
    }

    // Check length
    if (slug.length < 3 || slug.length > 50) {
      return false
    }

    // Check reserved slugs
    const reservedSlugs = ['api', 'www', 'admin', 'app', 'default', 'test']
    if (reservedSlugs.includes(slug)) {
      return false
    }

    // Check uniqueness
    const { data } = await client
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    return !data
  }

  /**
   * Create tenant context for request
   */
  async createTenantContext(
    tenantId: string,
    userId: string
  ): Promise<TenantContext | null> {
    const tenant = await this.getTenantById(tenantId)
    if (!tenant) {
      return null
    }

    const tenantUser = await this.getTenantUser(tenantId, userId)
    if (!tenantUser) {
      return null
    }

    return {
      tenant_id: tenantId,
      tenant_slug: tenant.slug,
      tenant_name: tenant.name,
      user_role: tenantUser.role,
      user_permissions: tenantUser.permissions || {}
    }
  }

  /**
   * Validate user access to tenant
   */
  async validateTenantAccess(
    tenantId: string,
    userId: string
  ): Promise<boolean> {
    const tenantUser = await this.getTenantUser(tenantId, userId)
    return tenantUser?.status === 'active'
  }

  /**
   * Get user's tenants
   */
  async getUserTenants(userId: string): Promise<Array<Tenant & { role: string }>> {
    return withDatabase(async (client: SupabaseClient) => {
      const { data, error } = await client
        .from('tenant_users')
        .select(`
          role,
          status,
          tenants (
            id,
            name,
            slug,
            plan_type,
            status,
            institution_type,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) {
        console.error('Failed to fetch user tenants:', error)
        return []
      }

      return (data || []).map(item => {
        const tenant = item.tenants as unknown as Tenant
        return {
          ...tenant,
          role: item.role as string
        }
      }) as Array<Tenant & { role: string }>
    })
  }
}

// Export singleton instance
export const tenantService = TenantService.getInstance()

// Utility functions for multi-tenant operations
export async function withTenantContext<T>(
  tenantId: string,
  operation: (context: MTDatabaseContext) => Promise<T>
): Promise<T> {
  const context: MTDatabaseContext = { tenant_id: tenantId }
  return await operation(context)
}

export function getTenantFromSubdomain(hostname: string): string | null {
  // Extract tenant slug from subdomain
  // Format: {tenant-slug}.mellowise.com
  const parts = hostname.split('.')
  if (parts.length >= 3 && !['www', 'api', 'admin'].includes(parts[0])) {
    return parts[0]
  }
  return null
}

export function buildTenantUrl(slug: string, path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mellowise.com'
  return `https://${slug}.${baseUrl.replace('https://', '')}${path}`
}