/**
 * Next.js Middleware for Coming Soon Mode
 *
 * When NEXT_PUBLIC_COMING_SOON_MODE=true, redirects protected routes
 * (like /create, /pay, /history) to /coming-soon page.
 *
 * Runs on Edge runtime before page rendering for minimal latency.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COMING_SOON_MODE = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'

/**
 * Routes that should redirect to /coming-soon when in Coming Soon mode.
 * These are app features that aren't ready for production yet.
 */
const PROTECTED_ROUTE_PREFIXES = ['/create', '/pay', '/history']

/**
 * Routes that are always accessible, even in Coming Soon mode.
 * Includes landing page, legal pages, and the coming-soon page itself.
 */
const PUBLIC_ROUTES = ['/', '/coming-soon', '/privacy', '/terms']

export function middleware(request: NextRequest) {
  // Skip if Coming Soon mode is disabled
  if (!COMING_SOON_MODE) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow public routes (exact match)
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Redirect protected routes to /coming-soon
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute) {
    const comingSoonUrl = new URL('/coming-soon', request.url)
    return NextResponse.redirect(comingSoonUrl)
  }

  // Allow everything else (static files, API routes handled by matcher exclusion)
  return NextResponse.next()
}

/**
 * Matcher configuration:
 * - Excludes Next.js internals (_next/static, _next/image)
 * - Excludes static files (favicon, images, etc.)
 * - Excludes API routes (/api/*)
 *
 * This ensures middleware only runs on page routes for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)',
  ],
}
