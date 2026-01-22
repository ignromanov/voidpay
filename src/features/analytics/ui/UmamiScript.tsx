'use client'

import Script from 'next/script'
import { UMAMI_CONFIG } from '../config/umami'

/**
 * Umami Analytics Script Loader
 *
 * Loads Umami tracking script with lazyOnload strategy (non-blocking).
 * Umami automatically checks localStorage for 'umami.disabled' key.
 *
 * @see https://umami.is/docs/tracker-configuration
 */
export function UmamiScript() {
  return (
    <Script
      src={UMAMI_CONFIG.scriptUrl}
      data-website-id={UMAMI_CONFIG.websiteId}
      strategy="lazyOnload"
    />
  )
}
