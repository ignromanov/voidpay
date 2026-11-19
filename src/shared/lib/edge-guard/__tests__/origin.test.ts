import { describe, it, expect, afterEach, vi } from 'vitest'
import { isAllowedOrigin, passesOriginGate } from '../origin'

describe('isAllowedOrigin', () => {
  it('rejects null and malformed values', () => {
    expect(isAllowedOrigin(null, 'voidpay.xyz')).toBe(false)
    expect(isAllowedOrigin('not a url', 'voidpay.xyz')).toBe(false)
  })

  it('accepts voidpay.xyz and its subdomains', () => {
    expect(isAllowedOrigin('https://voidpay.xyz', null)).toBe(true)
    expect(isAllowedOrigin('https://staging.voidpay.xyz', null)).toBe(true)
  })

  it('accepts the request host', () => {
    expect(isAllowedOrigin('https://preview-abc.vercel.app', 'preview-abc.vercel.app')).toBe(true)
  })

  it('rejects look-alike and foreign hosts', () => {
    expect(isAllowedOrigin('https://evilvoidpay.xyz', 'voidpay.xyz')).toBe(false)
    expect(isAllowedOrigin('https://voidpay.xyz.evil.com', 'voidpay.xyz')).toBe(false)
    expect(isAllowedOrigin('https://evil.com', 'voidpay.xyz')).toBe(false)
  })
})

describe('passesOriginGate', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is open outside production', () => {
    vi.stubEnv('NODE_ENV', 'test')
    expect(passesOriginGate(new Headers())).toBe(true)
  })

  describe('in production', () => {
    it('rejects requests with no origin and no referer', () => {
      vi.stubEnv('NODE_ENV', 'production')
      expect(passesOriginGate(new Headers({ host: 'voidpay.xyz' }))).toBe(false)
    })

    it('accepts an allowed origin', () => {
      vi.stubEnv('NODE_ENV', 'production')
      expect(passesOriginGate(new Headers({ origin: 'https://voidpay.xyz', host: 'voidpay.xyz' }))).toBe(true)
    })

    it('falls back to referer', () => {
      vi.stubEnv('NODE_ENV', 'production')
      expect(passesOriginGate(new Headers({ referer: 'https://voidpay.xyz/pay', host: 'voidpay.xyz' }))).toBe(true)
    })

    it('rejects a cross-site origin', () => {
      vi.stubEnv('NODE_ENV', 'production')
      expect(passesOriginGate(new Headers({ origin: 'https://evil.com', host: 'voidpay.xyz' }))).toBe(false)
    })
  })
})
