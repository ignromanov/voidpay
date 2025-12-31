/**
 * Rate Limiting for RPC Proxy
 * Feature: 004-rpc-proxy-failover
 *
 * Uses Vercel KV (Redis) with @upstash/ratelimit for distributed rate limiting.
 * Falls back to in-memory rate limiting when KV is unavailable.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import type { RateLimitResult } from '../model/types'

// Initialize rate limiter with sliding window algorithm
// 100 requests per 60 seconds per IP
let rateLimiter: Ratelimit | null = null

// In-memory fallback when KV is unavailable
interface MemoryRecord {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryRecord>()
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100

function getRateLimiter(): Ratelimit | null {
  // Only initialize if KV credentials are available
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }

  if (!rateLimiter) {
    rateLimiter = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: false, // Privacy: no analytics
      prefix: 'rpc_ratelimit',
    })
  }

  return rateLimiter
}

/**
 * In-memory rate limiter fallback
 * Used when Vercel KV is unavailable
 */
function memoryRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const record = memoryStore.get(identifier)

  // No record or window expired - reset
  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      limit: MAX_REQUESTS,
    }
  }

  // Rate limit exceeded
  if (record.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      limit: MAX_REQUESTS,
    }
  }

  // Increment counter
  record.count++
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    limit: MAX_REQUESTS,
  }
}

// Cleanup old entries periodically (every minute) to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    memoryStore.forEach((value, key) => {
      if (now > value.resetAt) {
        memoryStore.delete(key)
      }
    })
  }, 60 * 1000)
}

/**
 * Extract IP address from request headers
 * Handles X-Forwarded-For and X-Real-IP headers from proxies
 */
export function extractIpAddress(headers: Headers): string {
  // Try X-Forwarded-For first (most common in production)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) {
      return firstIp
    }
  }

  // Try X-Real-IP
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Check if request should be rate limited
 * @param identifier IP address or other identifier
 * @returns Rate limit result with allowed status and remaining quota
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRateLimiter()

  // Use in-memory fallback if KV is not configured
  if (!limiter) {
    return memoryRateLimit(identifier)
  }

  try {
    const result = await limiter.limit(identifier)

    return {
      allowed: result.success,
      remaining: result.remaining,
      limit: result.limit,
    }
  } catch (error) {
    // Fallback to in-memory rate limiting if KV is unreachable
    console.error('KV rate limiter failed, using in-memory fallback:', error)
    return memoryRateLimit(identifier)
  }
}
