import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { tenantMiddleware, getTenantContextFromRequest } from './src/lib/tenant/tenant-middleware'

export async function middleware(request: NextRequest) {
  // First, handle tenant context resolution (subdomain routing)
  const tenantResponse = await tenantMiddleware(request)
  
  // If tenant middleware returned a redirect or error, use that response
  if (tenantResponse.status !== 200) {
    return tenantResponse
  }

  // Continue with Supabase auth middleware
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Copy tenant headers from tenant middleware to supabase response
  const tenantId = tenantResponse.headers.get('x-tenant-id')
  if (tenantId) {
    supabaseResponse.headers.set('x-tenant-id', tenantId)
    supabaseResponse.headers.set('x-tenant-slug', tenantResponse.headers.get('x-tenant-slug') || '')
    supabaseResponse.headers.set('x-tenant-name', tenantResponse.headers.get('x-tenant-name') || '')
    
    // Copy tenant context cookie
    const tenantCookie = tenantResponse.cookies.get('tenant-context')
    if (tenantCookie) {
      supabaseResponse.cookies.set('tenant-context', tenantCookie.value, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/survival-mode']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Public routes that should redirect authenticated users
  const publicRoutes = ['/auth', '/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Skip auth checks for tenant management routes
  const skipAuthPaths = ['/tenant-not-found', '/tenant-suspended', '/select-tenant']
  const shouldSkipAuth = skipAuthPaths.some(path => pathname.startsWith(path))

  if (!shouldSkipAuth) {
    // If user is not logged in and trying to access protected route
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and trying to access public auth routes
    if (isPublicRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // API route protection for /api/protected/*
    if (pathname.startsWith('/api/protected/') && !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // Preserve tenant headers in final response
  if (tenantId) {
    supabaseResponse.headers.set('x-tenant-id', tenantId)
    supabaseResponse.headers.set('x-tenant-slug', tenantResponse.headers.get('x-tenant-slug') || '')
    supabaseResponse.headers.set('x-tenant-name', tenantResponse.headers.get('x-tenant-name') || '')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images in the public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}