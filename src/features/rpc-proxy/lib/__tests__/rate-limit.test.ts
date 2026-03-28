/**
 * Rate Limit Tests
 * Feature: 004-rpc-proxy-failover
 *
 * Tests fail-closed policy:
 * - No Redis credentials → unavailable
 * - Redis error → unavailable
 * - Development mode → always allowed
 * - Normal operation → rate limiting works
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockLimit, mockPing } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  mockPing: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    ping = mockPing
    constructor() {
      // noop
    }
  },
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    class MockRatelimit {
      limit = mockLimit
      constructor() {
        // noop
      }
    },
    {
      slidingWindow: vi.fn().mockReturnValue('sliding-window-config'),
    }
  ),
}))

describe('rate-limit', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
    process.env = { ...process.env, NODE_ENV: undefined as string | undefined } as NodeJS.ProcessEnv
    mockLimit.mockReset()
    mockPing.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  async function loadModule() {
    return await import('../rate-limit')
  }

  describe('extractIpAddress', () => {
    it('extracts IP from x-forwarded-for header', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('extracts last IP from multiple x-forwarded-for values (trusted proxy)', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1, 172.16.0.1')

      expect(extractIpAddress(headers)).toBe('172.16.0.1')
    })

    it('trims whitespace from IP addresses', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-forwarded-for', '  192.168.1.1  ')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('falls back to x-real-ip header', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-real-ip', '10.0.0.1')

      expect(extractIpAddress(headers)).toBe('10.0.0.1')
    })

    it('trims whitespace from x-real-ip', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-real-ip', '  10.0.0.1  ')

      expect(extractIpAddress(headers)).toBe('10.0.0.1')
    })

    it('prefers x-forwarded-for over x-real-ip', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-forwarded-for', '10.0.0.1, 192.168.1.1')
      headers.set('x-real-ip', '10.0.0.1')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('returns "unknown" when no IP headers present', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()

      expect(extractIpAddress(headers)).toBe('unknown')
    })

    it('returns "unknown" when x-forwarded-for is empty', async () => {
      const { extractIpAddress } = await loadModule()
      const headers = new Headers()
      headers.set('x-forwarded-for', '')

      expect(extractIpAddress(headers)).toBe('unknown')
    })
  })

  describe('checkRateLimit — fail-closed', () => {
    it('returns unavailable when Redis not configured', async () => {
      const { checkRateLimit } = await loadModule()
      const result = await checkRateLimit('test-ip')

      expect(result.allowed).toBe(false)
      expect(result.unavailable).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('returns unavailable when only URL is set (no token)', async () => {
      process.env.KV_REST_API_URL = 'https://redis.example.com'
      const { checkRateLimit } = await loadModule()
      const result = await checkRateLimit('test-ip')

      expect(result.unavailable).toBe(true)
    })

    it('returns unavailable when only token is set (no URL)', async () => {
      process.env.KV_REST_API_TOKEN = 'test-token'
      const { checkRateLimit } = await loadModule()
      const result = await checkRateLimit('test-ip')

      expect(result.unavailable).toBe(true)
    })

    it('returns unavailable on Redis error', async () => {
      process.env.KV_REST_API_URL = 'https://redis.example.com'
      process.env.KV_REST_API_TOKEN = 'test-token'
      mockLimit.mockRejectedValueOnce(new Error('Connection refused'))

      const { checkRateLimit } = await loadModule()
      const result = await checkRateLimit('test-ip')

      expect(result.allowed).toBe(false)
      expect(result.unavailable).toBe(true)
    })
  })

  describe('checkRateLimit — development mode', () => {
    it('always allows in development mode', async () => {
      process.env = { ...process.env, NODE_ENV: 'development' }
      const { checkRateLimit } = await loadModule()

      const result = await checkRateLimit('test-ip')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(100)
      expect(result.unavailable).toBeUndefined()
    })

    it('allows even without Redis credentials in dev', async () => {
      process.env = { ...process.env, NODE_ENV: 'development' }
      const { checkRateLimit } = await loadModule()

      const result = await checkRateLimit('test-ip')

      expect(result.allowed).toBe(true)
    })
  })

  describe('checkRateLimit — normal operation', () => {
    it('allows request when under limit', async () => {
      process.env.KV_REST_API_URL = 'https://redis.example.com'
      process.env.KV_REST_API_TOKEN = 'test-token'
      mockLimit.mockResolvedValueOnce({ success: true, remaining: 99, limit: 100 })

      const { checkRateLimit } = await loadModule()
      const result = await checkRateLimit('test-ip')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
      expect(result.limit).toBe(100)
      expect(result.unavailable).toBeUndefined()
    })

    it('blocks request when over limit', async () => {
      process.env.KV_REST_API_URL = 'https://redis.example.com'
      process.env.KV_REST_API_TOKEN = 'test-token'
      mockLimit.mockResolvedValueOnce({ success: false, remaining: 0, limit: 100 })

      const { checkRateLimit } = await loadModule()
      const result = await checkRateLimit('test-ip')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.unavailable).toBeUndefined()
    })
  })

  describe('isRateLimitHealthy', () => {
    it('returns false when Redis not configured', async () => {
      const { isRateLimitHealthy } = await loadModule()
      const healthy = await isRateLimitHealthy()

      expect(healthy).toBe(false)
    })

    it('returns true when Redis is reachable', async () => {
      process.env.KV_REST_API_URL = 'https://redis.example.com'
      process.env.KV_REST_API_TOKEN = 'test-token'
      mockPing.mockResolvedValueOnce('PONG')

      const { isRateLimitHealthy } = await loadModule()
      const healthy = await isRateLimitHealthy()

      expect(healthy).toBe(true)
    })

    it('returns false when Redis ping fails', async () => {
      process.env.KV_REST_API_URL = 'https://redis.example.com'
      process.env.KV_REST_API_TOKEN = 'test-token'
      mockPing.mockRejectedValueOnce(new Error('Connection refused'))

      const { isRateLimitHealthy } = await loadModule()
      const healthy = await isRateLimitHealthy()

      expect(healthy).toBe(false)
    })
  })
})
