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
  githubOrg: 'https://github.com/voidpay',
  twitter: 'https://twitter.com/voidpay',
} as const

/**
 * Get the application base URL
 * Supports environment variable override for staging/preview deployments
 */
export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? APP_URLS.base
}
