/**
 * URL Constants
 *
 * Centralized URL configuration for the application.
 * All external URLs and app URLs should be imported from here.
 */

/**
 * VoidPay domain constant
 */
export const VOIDPAY_DOMAIN = 'voidpay.xyz' as const

/**
 * Application URLs
 */
export const APP_URLS = {
  base: `https://${VOIDPAY_DOMAIN}`,
  logo: `https://${VOIDPAY_DOMAIN}/logo.png`,
} as const

/**
 * Social media and external URLs
 */
export const SOCIAL_URLS = {
  github: 'https://github.com/ignromanov/voidpay',
  githubIssues: 'https://github.com/ignromanov/voidpay/issues/new',
  githubOrg: 'https://github.com/voidpay',
  twitter: 'https://twitter.com/voidpay',
} as const

/**
 * Ensure a URL is absolute.
 * Relative paths like `/pay#hash` become `https://voidpay.xyz/pay#hash`.
 */
export function toAbsoluteUrl(url: string): string {
  return url.startsWith('http') ? url : `${getAppBaseUrl()}${url}`
}

/**
 * Get the application base URL
 * Supports environment variable override for staging/preview deployments
 */
export function getAppBaseUrl(): string {
  // Explicit override (production config)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Client-side: use current origin (localhost, Vercel preview, production)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: Vercel auto-sets this for every deployment
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  return APP_URLS.base
}
