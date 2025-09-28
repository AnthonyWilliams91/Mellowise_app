import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for certain paths
  const pathname = request.nextUrl.pathname;

  // Allow access to secret access page, auth page, API routes, and static assets
  if (
    pathname.startsWith('/secret-access') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for secret session cookie
  const sessionCookie = request.cookies.get('secret-session');

  // If no session cookie, redirect to secret access page
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/secret-access', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - secret-access (secret access page)
     * - auth (authentication pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|secret-access|auth).*)',
  ],
};