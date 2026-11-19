/**
 * Same-site gate for browser-facing API routes.
 * Blocks cross-site browser POSTs (CSRF-style quota drain). Not an auth boundary:
 * non-browser clients can forge Origin, which the rate limiter covers.
 */

export function isAllowedOrigin(value: string | null, host: string | null): boolean {
  if (!value) return false
  try {
    const hostname = new URL(value).hostname
    if (host && hostname === host) return true
    return hostname === 'voidpay.xyz' || hostname.endsWith('.voidpay.xyz')
  } catch {
    return false
  }
}

/** Enforced in production only; Origin falls back to Referer. */
export function passesOriginGate(headers: Headers): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const host = headers.get('host')
  return isAllowedOrigin(headers.get('origin'), host) || isAllowedOrigin(headers.get('referer'), host)
}
