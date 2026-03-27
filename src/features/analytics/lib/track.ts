/// <reference path="../types/umami.d.ts" />

export const AnalyticsEvent = {
  // Core funnel
  INVOICE_CREATE: 'invoice-create',
  PAY_PAGE_LOAD: 'pay-page-load',
  WALLET_CONNECT: 'wallet-connect',
  PAY_TX_SENT: 'pay-tx-sent',
  SHARE_LINK_COPY: 'share-link-copy',
  SHARE_QR_DOWNLOAD: 'share-qr-download',
  // Viral
  PAY_TO_CREATE_CLICK: 'pay-to-create-click',
  // Errors
  ERROR_DECODE: 'error-decode',
  ERROR_PAYMENT: 'error-payment',
  ERROR_GENERATE: 'error-generate',
  ERROR_BOUNDARY: 'error-boundary',
  // Growth
  LANDING_CTA_CLICK: 'landing-cta-click',
  SHARE_SOCIAL: 'share-social',
  PDF_EXPORT: 'pdf-export',
  HISTORY_EXPORT: 'history-export',
  FAQ_EXPAND: 'faq-expand',
  OUTBOUND_CLICK: 'outbound-click',
  DEMO_SELECT: 'demo-select',
  // Product intel
  INVOICE_FIELD_USAGE: 'invoice-field-usage',
  PAY_VERIFY: 'pay-verify',
} as const

type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

interface EventProperties {
  'invoice-create': { network: string; token_symbol: string; line_item_count: number }
  'pay-page-load': { network: string; token_symbol: string; referrer_domain: string }
  'wallet-connect': { wallet_type: string; page: string }
  'pay-tx-sent': { network: string; token_symbol: string }
  'share-link-copy': { has_og: boolean }
  'share-qr-download': Record<string, never>
  'pay-to-create-click': Record<string, never>
  'error-decode': { error_type: string; page: string }
  'error-payment': { error_type: string }
  'error-generate': { error_type: string }
  'error-boundary': { page: string; error_message: string }
  'landing-cta-click': { cta_location: string }
  'share-social': { channel: string }
  'pdf-export': { source: string }
  'history-export': { format: string }
  'faq-expand': { question_id: string }
  'outbound-click': { target: string }
  'demo-select': { invoice_id: string }
  'invoice-field-usage': { fields_used: string }
  'pay-verify': { method: string }
}

export function track<E extends AnalyticsEventName>(
  event: E,
  ...args: EventProperties[E] extends Record<string, never>
    ? []
    : [data: EventProperties[E]]
): void {
  if (typeof window === 'undefined') return
  if (typeof window.umami?.track !== 'function') return
  window.umami.track(event, args[0] as Record<string, unknown> | undefined)
}

export function getReferrerDomain(): string {
  try {
    const ref = document.referrer
    if (!ref) return 'direct'
    return new URL(ref).hostname
  } catch {
    return 'unknown'
  }
}
