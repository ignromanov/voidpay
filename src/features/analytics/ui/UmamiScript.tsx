'use client'

import Script from 'next/script'
import { VOIDPAY_DOMAIN } from '@/shared/config'
import { UMAMI_CONFIG } from '../config/umami'

/**
 * Umami Analytics Script Loader
 *
 * Loads Umami tracking script with lazyOnload strategy (non-blocking).
 * Umami automatically checks localStorage for 'umami.disabled' key.
 *
 * Guards:
 * - Not rendered in development (no network request)
 * - data-domains restricts tracking to production domain only (blocks preview deploys)
 * - data-exclude-hash strips URL hash fragment (PRIVACY-CRITICAL: hash contains full invoice data)
 *
 * @see https://umami.is/docs/tracker-configuration
 */
export function UmamiScript() {
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <Script
      src={UMAMI_CONFIG.scriptUrl}
      data-website-id={UMAMI_CONFIG.websiteId}
      data-domains={VOIDPAY_DOMAIN}
      data-exclude-hash="true"
      strategy="lazyOnload"
    />
  )
}
