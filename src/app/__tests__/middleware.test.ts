/**
 * Tests for src/middleware.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

function makeRequest(pathname: string, base = 'http://localhost:3000'): NextRequest {
  return new NextRequest(`${base}${pathname}`)
}

describe('middleware — Coming Soon mode disabled (default)', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_COMING_SOON_MODE
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes through all routes when coming soon mode is off', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/create'))
    // NextResponse.next() — not a redirect
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('passes through / when coming soon mode is off', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('passes through /pay when coming soon mode is off', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/pay'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('passes through /history when coming soon mode is off', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/history'))
    expect(response.headers.get('location')).toBeNull()
  })
})

describe('middleware — Coming Soon mode enabled', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_COMING_SOON_MODE = 'true'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_COMING_SOON_MODE
    vi.restoreAllMocks()
  })

  it('redirects /create to /coming-soon', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/create'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/coming-soon')
  })

  it('redirects /pay to /coming-soon', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/pay'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/coming-soon')
  })

  it('redirects /pay/0xabc to /coming-soon (prefix match)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/pay/0xabc'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/coming-soon')
  })

  it('redirects /history to /coming-soon', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/history'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/coming-soon')
  })

  it('redirects /create/new to /coming-soon (prefix match)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/create/new'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/coming-soon')
  })

  it('allows / (public route)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('allows /coming-soon (public route)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/coming-soon'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('allows /privacy (public route)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/privacy'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('allows /terms (public route)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/terms'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('allows unknown non-protected routes (e.g. /about)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/about'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('allows /invoice route (not in protected list)', async () => {
    const { middleware } = await import('../../middleware')
    const response = middleware(makeRequest('/invoice'))
    expect(response.headers.get('location')).toBeNull()
  })
})

describe('middleware — config matcher export', () => {
  it('exports config with matcher array', async () => {
    const { config } = await import('../../middleware')
    expect(Array.isArray(config.matcher)).toBe(true)
    expect(config.matcher.length).toBeGreaterThan(0)
  })

  it('matcher excludes _next/static pattern', async () => {
    const { config } = await import('../../middleware')
    const matcher = config.matcher[0] as string
    expect(matcher).toContain('_next/static')
  })

  it('matcher excludes api/ pattern', async () => {
    const { config } = await import('../../middleware')
    const matcher = config.matcher[0] as string
    expect(matcher).toContain('api/')
  })
})
