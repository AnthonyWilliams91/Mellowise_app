/**
 * Tenant Context Middleware for Next.js
 * 
 * Provides automatic tenant resolution and context setting for multi-tenant app
 * Implements subdomain-based tenant routing with security validation
 * 
 * @pattern Nile-inspired tenant context management
 * @security Tenant isolation enforced at middleware level
 * @routing Subdomain-based tenant resolution
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tenantService, getTenantFromSubdomain } from './tenant-service'
import type { Tenant, TenantContext } from '../../types/tenant'

// Tenant resolution cache (in production, use Redis)
const tenantCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  tenant: Tenant | null
  timestamp: number
}

/**
 * Tenant Context Middleware
 * Resolves tenant from subdomain and sets context for the request
 */
export async function tenantMiddleware(request: NextRequest): Promise<NextResponse> {
  const hostname = request.headers.get('host') || request.nextUrl.hostname
  const pathname = request.nextUrl.pathname

  // Skip tenant resolution for certain paths
  if (shouldSkipTenantResolution(pathname)) {
    return NextResponse.next()
  }

  // Extract tenant slug from subdomain
  const tenantSlug = getTenantFromSubdomain(hostname)
  
  // Handle main domain (no tenant)
  if (!tenantSlug) {
    return handleMainDomain(request)
  }

  // Resolve tenant from slug
  const tenant = await resolveTenant(tenantSlug)
  
  if (!tenant) {
    return handleTenantNotFound(request, tenantSlug)
  }

  if (tenant.status !== 'active') {
    return handleInactiveTenant(request, tenant)
  }

  // Set tenant context in request headers
  const response = NextResponse.next()
  response.headers.set('x-tenant-id', tenant.id)
  response.headers.set('x-tenant-slug', tenant.slug)
  response.headers.set('x-tenant-name', tenant.name)

  // Set tenant context cookie for client-side access
  response.cookies.set('tenant-context', JSON.stringify({
    tenant_id: tenant.id,
    tenant_slug: tenant.slug,
    tenant_name: tenant.name
  }), {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return response
}

/**
 * Resolve tenant from slug with caching
 */
async function resolveTenant(slug: string): Promise<Tenant | null> {
  // Check cache first
  const cached = tenantCache.get(slug)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.tenant
  }

  try {
    // Fetch tenant from database
    const tenant = await tenantService.getTenantBySlug(slug)
    
    // Cache the result
    const cacheEntry: CacheEntry = {
      tenant,
      timestamp: Date.now()
    }
    tenantCache.set(slug, cacheEntry)
    
    return tenant
  } catch (error) {
    console.error('Failed to resolve tenant:', error)
    return null
  }
}

/**
 * Check if tenant resolution should be skipped for this path
 */
function shouldSkipTenantResolution(pathname: string): boolean {
  const skipPaths = [
    '/api/health',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known',
    '/admin', // Admin interface on main domain
    '/api/admin',
    '/api/webhooks' // Stripe webhooks, etc.
  ]

  return skipPaths.some(path => pathname.startsWith(path))
}

/**
 * Handle requests to main domain (no tenant subdomain)
 */
function handleMainDomain(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname

  // Allow certain paths on main domain
  const allowedMainPaths = [
    '/',
    '/about',
    '/pricing', 
    '/contact',
    '/privacy',
    '/terms',
    '/admin',
    '/api/auth',
    '/api/admin',
    '/api/health'
  ]

  if (allowedMainPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Redirect to tenant selection or onboarding
  const url = request.nextUrl.clone()
  url.pathname = '/select-tenant'
  return NextResponse.redirect(url)
}

/**
 * Handle tenant not found
 */
function handleTenantNotFound(
  request: NextRequest,
  tenantSlug: string
): NextResponse {
  console.warn(`Tenant not found: ${tenantSlug}`)
  
  // Return 404 page with tenant context
  const url = request.nextUrl.clone()
  url.pathname = '/tenant-not-found'
  url.searchParams.set('slug', tenantSlug)
  
  return NextResponse.rewrite(url)
}

/**
 * Handle inactive tenant
 */
function handleInactiveTenant(
  request: NextRequest,
  tenant: Tenant
): NextResponse {
  console.warn(`Inactive tenant accessed: ${tenant.slug}`)
  
  const url = request.nextUrl.clone()
  url.pathname = '/tenant-suspended'
  
  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant-status', tenant.status)
  
  return response
}

/**
 * Validate user access to tenant
 */
export async function validateTenantAccess(
  tenantId: string,
  userId: string
): Promise<boolean> {
  try {
    return await tenantService.validateTenantAccess(tenantId, userId)
  } catch (error) {
    console.error('Failed to validate tenant access:', error)
    return false
  }
}

/**
 * Get tenant context from request headers
 */
export function getTenantContextFromRequest(request: NextRequest): {
  tenant_id?: string
  tenant_slug?: string 
  tenant_name?: string
} | null {
  const tenantId = request.headers.get('x-tenant-id')
  const tenantSlug = request.headers.get('x-tenant-slug')
  const tenantName = request.headers.get('x-tenant-name')

  if (!tenantId || !tenantSlug) {
    return null
  }

  return {
    tenant_id: tenantId,
    tenant_slug: tenantSlug,
    tenant_name: tenantName || undefined
  }
}

/**
 * Create tenant-aware API response
 */
export function createTenantResponse(
  data: any,
  tenantContext?: { tenant_id: string; tenant_slug: string }
): NextResponse {
  const response = NextResponse.json(data)
  
  if (tenantContext) {
    response.headers.set('x-tenant-id', tenantContext.tenant_id)
    response.headers.set('x-tenant-slug', tenantContext.tenant_slug)
  }
  
  return response
}

/**
 * Tenant context hook for React components
 */
export interface UseTenantContext {
  tenant_id?: string
  tenant_slug?: string
  tenant_name?: string
  isLoading: boolean
}

/**
 * Extract tenant context from client-side cookie
 */
export function getTenantContextFromCookie(): {
  tenant_id?: string
  tenant_slug?: string
  tenant_name?: string
} | null {
  if (typeof window === 'undefined') return null

  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('tenant-context='))
      ?.split('=')[1]

    if (!cookieValue) return null

    return JSON.parse(decodeURIComponent(cookieValue))
  } catch (error) {
    console.error('Failed to parse tenant context cookie:', error)
    return null
  }
}

/**
 * Clear tenant context (for logout, tenant switching)
 */
export function clearTenantContext(): void {
  if (typeof window === 'undefined') return

  document.cookie = 'tenant-context=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  tenantCache.clear()
}

/**
 * Build tenant-aware URL
 */
export function buildTenantUrl(
  tenantSlug: string,
  path: string = '',
  searchParams?: Record<string, string>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mellowise.com'
  const domain = baseUrl.replace('https://', '')
  
  let url = `https://${tenantSlug}.${domain}${path}`
  
  if (searchParams) {
    const params = new URLSearchParams(searchParams)
    url += `?${params.toString()}`
  }
  
  return url
}

/**
 * Redirect to tenant URL
 */
export function redirectToTenant(
  tenantSlug: string,
  path: string = '',
  searchParams?: Record<string, string>
): NextResponse {
  const url = buildTenantUrl(tenantSlug, path, searchParams)
  return NextResponse.redirect(url)
}

// Export middleware function for Next.js
export { tenantMiddleware as default }