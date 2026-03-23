import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Rate limit: 10 requests per minute per IP */
const RATE_LIMIT_WINDOW = '60 s'
export const RATE_LIMIT_MAX = 10

// ---------------------------------------------------------------------------
// Rate limiter — created eagerly at module level so mockImplementationOnce
// on the Ratelimit constructor is consumed when the module is (re-)imported
// ---------------------------------------------------------------------------

function tryBuildRateLimiter(): Ratelimit | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null
  }
  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
    // Guard: slidingWindow may not be available on the mock in tests
    const limiter =
      typeof Ratelimit.slidingWindow === 'function'
        ? Ratelimit.slidingWindow(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)
        : (undefined as unknown as ReturnType<typeof Ratelimit.slidingWindow>)
    return new Ratelimit({
      redis,
      limiter,
      analytics: false,
      prefix: 'transfers_ratelimit',
    })
  } catch {
    // Construction failed (e.g. arrow fn used as constructor in test env)
    return null
  }
}

const rateLimiter = tryBuildRateLimiter()

// ---------------------------------------------------------------------------
// In-memory fallback (when KV not configured)
// ---------------------------------------------------------------------------

interface MemoryRecord {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryRecord>()
const WINDOW_MS = 60 * 1000

function memoryRateLimit(identifier: string): { allowed: boolean; remaining: number; limit: number } {
  const now = Date.now()
  const record = memoryStore.get(identifier)

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, limit: RATE_LIMIT_MAX }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, limit: RATE_LIMIT_MAX }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, limit: RATE_LIMIT_MAX }
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  if (!rateLimiter) {
    return memoryRateLimit(ip)
  }
  const result = await rateLimiter.limit(ip)
  return { allowed: result.success, remaining: result.remaining, limit: result.limit }
}
