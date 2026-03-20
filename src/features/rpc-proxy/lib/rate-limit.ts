/**
 * Rate Limiting for RPC Proxy
 * Feature: 004-rpc-proxy-failover
 *
 * Uses Upstash Redis with @upstash/ratelimit for distributed rate limiting.
 * FAIL-CLOSED: returns unavailable when Redis is not configured or errors.
 * In-memory fallback is intentionally removed — useless in serverless.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export interface RateLimitUnavailable {
  allowed: false
  unavailable: true
  remaining: 0
  limit: 0
}

export type RateLimitResponse =
  | { allowed: true; unavailable?: false; remaining: number; limit: number }
  | { allowed: false; unavailable?: false; remaining: number; limit: number }
  | RateLimitUnavailable

const MAX_REQUESTS = 100
const WINDOW = '60 s'

let redisInstance: Redis | null = null
let rateLimiter: Ratelimit | null = null

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }

  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }

  return redisInstance
}

function getRateLimiter(): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  if (!rateLimiter) {
    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
      analytics: false,
      prefix: 'rpc_ratelimit',
    })
  }

  return rateLimiter
}

/**
 * Extract IP address from request headers
 * Handles X-Forwarded-For and X-Real-IP headers from proxies
 */
export function extractIpAddress(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) {
      return firstIp
    }
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

/**
 * Check rate limit health (for /api/health endpoint)
 * @returns true if Redis is configured and reachable
 */
export async function isRateLimitHealthy(): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}

/**
 * Check if request should be rate limited
 *
 * FAIL-CLOSED policy:
 * - No Redis credentials → unavailable (503)
 * - Redis error → unavailable (503)
 * - Development mode → always allowed (skip rate limiting)
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResponse> {
  // Dev mode: skip rate limiting entirely
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: MAX_REQUESTS, limit: MAX_REQUESTS }
  }

  const limiter = getRateLimiter()

  // FAIL-CLOSED: no Redis = no service
  if (!limiter) {
    console.error('[CRITICAL] Rate limiter unavailable: KV_REST_API_URL or KV_REST_API_TOKEN not configured')
    return { allowed: false, unavailable: true, remaining: 0, limit: 0 }
  }

  try {
    const result = await limiter.limit(identifier)

    return {
      allowed: result.success,
      remaining: result.remaining,
      limit: result.limit,
    }
  } catch (error) {
    // FAIL-CLOSED: Redis error = no service
    console.error('[CRITICAL] Rate limiter Redis error:', {
      error: error instanceof Error ? error.message : String(error),
      identifier: identifier.substring(0, 8) + '...',
      timestamp: new Date().toISOString(),
    })

    return { allowed: false, unavailable: true, remaining: 0, limit: 0 }
  }
}
