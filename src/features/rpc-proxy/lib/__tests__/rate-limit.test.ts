/**
 * Rate Limit Tests
 * Feature: 004-rpc-proxy-failover
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractIpAddress, checkRateLimit } from '../rate-limit'

// Mock @upstash/ratelimit and @vercel/kv
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 99, limit: 100 }),
  })),
}))

vi.mock('@vercel/kv', () => ({
  kv: {},
}))

describe('rate-limit', () => {
  describe('extractIpAddress', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('extracts first IP from multiple x-forwarded-for values', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1, 172.16.0.1')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('trims whitespace from IP addresses', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '  192.168.1.1  ')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('falls back to x-real-ip header', () => {
      const headers = new Headers()
      headers.set('x-real-ip', '10.0.0.1')

      expect(extractIpAddress(headers)).toBe('10.0.0.1')
    })

    it('trims whitespace from x-real-ip', () => {
      const headers = new Headers()
      headers.set('x-real-ip', '  10.0.0.1  ')

      expect(extractIpAddress(headers)).toBe('10.0.0.1')
    })

    it('prefers x-forwarded-for over x-real-ip', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1')
      headers.set('x-real-ip', '10.0.0.1')

      expect(extractIpAddress(headers)).toBe('192.168.1.1')
    })

    it('returns "unknown" when no IP headers present', () => {
      const headers = new Headers()

      expect(extractIpAddress(headers)).toBe('unknown')
    })

    it('returns "unknown" when x-forwarded-for is empty', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '')

      expect(extractIpAddress(headers)).toBe('unknown')
    })
  })

  describe('checkRateLimit (in-memory fallback)', () => {
    beforeEach(() => {
      // Clear environment to force in-memory mode
      delete process.env.KV_REST_API_URL
      delete process.env.KV_REST_API_TOKEN
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('allows first request', async () => {
      const result = await checkRateLimit('test-ip-1')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
      expect(result.limit).toBe(100)
    })

    it('allows multiple requests under limit', async () => {
      const ip = 'test-ip-2'

      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit(ip)
        expect(result.allowed).toBe(true)
      }
    })

    it('tracks remaining count correctly', async () => {
      const ip = 'test-ip-3'

      const first = await checkRateLimit(ip)
      const second = await checkRateLimit(ip)

      expect(first.remaining).toBe(99)
      expect(second.remaining).toBe(98)
    })

    it('uses different counters for different IPs', async () => {
      const result1 = await checkRateLimit('ip-a')
      const result2 = await checkRateLimit('ip-b')

      expect(result1.remaining).toBe(99)
      expect(result2.remaining).toBe(99)
    })
  })
})
