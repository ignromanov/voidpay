import type { Route } from 'next'

/**
 * Convert a URL object to a typed Next.js Route.
 *
 * Next.js typed routes (`typedRoutes: true`) require `RouteImpl<T>` for
 * `router.push/replace`, but TypeScript cannot verify runtime string
 * concatenation against the generated route union. This utility centralises
 * the single unavoidable type assertion so call-sites stay clean.
 */
export function urlToRoute(url: URL): Route {
  return `${url.pathname}${url.search}${url.hash}` as Route
}
