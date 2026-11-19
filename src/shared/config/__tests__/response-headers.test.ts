import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import nextConfig from '../../../../next.config.mjs'

interface HeaderRule {
  source: string
  headers: { key: string; value: string }[]
}

// Value carried over verbatim from the former vercel.json — Workers has no vercel.json.
const EXPECTED_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.walletconnect.com https://api.web3modal.org; font-src 'self' data:; connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://api.web3modal.org https://formspree.io; frame-src https://verify.walletconnect.com https://verify.walletconnect.org https://vercel.live; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'"

async function loadRules(): Promise<HeaderRule[]> {
  return (nextConfig as { headers: () => Promise<HeaderRule[]> }).headers()
}

function valuesFor(rules: HeaderRule[], key: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const rule of rules) {
    const hit = rule.headers.find((h) => h.key === key)
    if (hit) out.set(rule.source, hit.value)
  }
  return out
}

describe('next.config headers() — single source of response headers', () => {
  it('sets the exact CSP on every route', async () => {
    const csp = valuesFor(await loadRules(), 'Content-Security-Policy')
    expect([...csp.entries()]).toEqual([['/(.*)', EXPECTED_CSP]])
  })

  it('applies the global security headers on every route', async () => {
    const rules = await loadRules()
    const global = rules.find((r) => r.source === '/(.*)')?.headers ?? []
    const byKey = Object.fromEntries(global.map((h) => [h.key, h.value]))
    expect(byKey['X-Content-Type-Options']).toBe('nosniff')
    expect(byKey['X-Frame-Options']).toBe('DENY')
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(byKey['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains; preload')
    expect(byKey['Permissions-Policy']).toContain('camera=()')
  })

  it('marks only /pay, /invoice, /history and /og-image as noindex — /create stays indexable', async () => {
    const noindex = valuesFor(await loadRules(), 'X-Robots-Tag')
    expect([...noindex.keys()].sort()).toEqual([
      '/history/:path*',
      '/invoice/:path*',
      '/og-image/:path*',
      '/pay/:path*',
    ])
    for (const value of noindex.values()) expect(value).toBe('noindex, nofollow')
  })

  it('sends no-store only on /api/rpc and /api/transfers (never site-wide)', async () => {
    const cache = valuesFor(await loadRules(), 'Cache-Control')
    expect(cache.get('/api/rpc')).toBe('no-store, must-revalidate')
    expect(cache.get('/api/transfers')).toBe('no-store, must-revalidate')
    expect(cache.get('/_next/static/:path*')).toBe('public, max-age=31536000, immutable')
    expect(cache.has('/(.*)')).toBe(false)
    expect(cache.size).toBe(3)
  })

  it('keeps the /v/* rewrite to the marketing host', async () => {
    const rewrites = await (nextConfig as { rewrites: () => Promise<{ source: string; destination: string }[]> }).rewrites()
    expect(rewrites).toContainEqual({ source: '/v/:match*', destination: 'https://m.voidpay.xyz/:match*' })
  })

  it('vercel.json no longer carries headers (would duplicate the CSP on Vercel)', () => {
    const vercel = JSON.parse(readFileSync(resolve(__dirname, '../../../../vercel.json'), 'utf8')) as Record<string, unknown>
    expect(vercel).not.toHaveProperty('headers')
    expect(vercel).not.toHaveProperty('rewrites')
  })
})
