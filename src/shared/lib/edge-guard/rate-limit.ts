/**
 * Shared edge rate limiter (#368)
 *
 * FAIL-CLOSED: missing env, constructor throw, limit() throw, or an Upstash
 * timeout all yield `unavailable` → 503. Upstash resolves timeouts as
 * `{ success: true, reason: 'timeout' }`, so `reason` must be checked.
 * The only bypass is NODE_ENV === 'development'.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { clientIp } from './client-ip'

export type RateLimitPolicy = 'rpc' | 'transfers'
export type UnavailableCause = 'unconfigured' | 'error' | 'timeout'

export type RateLimitDecision =
  | { kind: 'allow'; limit: number; remaining: number; reset: number }
  | { kind: 'deny'; limit: number; remaining: number; reset: number }
  | { kind: 'unavailable'; cause: UnavailableCause }

const WINDOW = '60 s'
/** Upstash default is 5000 ms; keep the request well under edge limits */
const LIMIT_TIMEOUT_MS = 2000
/** 2 retries (~200 ms backoff) always settle inside LIMIT_TIMEOUT_MS */
const REDIS_RETRIES = 2
const UNAVAILABLE_RETRY_AFTER_S = 30
const HEALTH_TTL_MS = 30_000
const HEALTH_PING_TIMEOUT_MS = 2000

const POLICIES: Record<RateLimitPolicy, { max: number; prefix: string }> = {
  rpc: { max: 100, prefix: 'rpc_ratelimit' },
  transfers: { max: 10, prefix: 'transfers_ratelimit' },
}

/** Global transfers budget across all clients, per 60 s fixed window.
 *  Losing status polling beats losing the Alchemy key that the payment path shares. */
export const TRANSFERS_GLOBAL_CAP = 300
const TRANSFERS_GLOBAL_PREFIX = 'transfers_ratelimit_global'
const TRANSFERS_GLOBAL_ID = 'global'

interface Clients {
  redis: Redis
  limiters: Record<RateLimitPolicy | 'transfersGlobal', Ratelimit>
  hmacKey: Promise<CryptoKey>
}

let clients: Clients | null = null

/** null = not configured; throws if a client cannot be constructed (not cached) */
function getClients(): Clients | null {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  if (clients) return clients

  const redis = new Redis({ url, token, retry: { retries: REDIS_RETRIES } })
  const build = (limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string) =>
    new Ratelimit({ redis, limiter, prefix, analytics: false, timeout: LIMIT_TIMEOUT_MS })

  clients = {
    redis,
    limiters: {
      rpc: build(Ratelimit.slidingWindow(POLICIES.rpc.max, WINDOW), POLICIES.rpc.prefix),
      transfers: build(Ratelimit.slidingWindow(POLICIES.transfers.max, WINDOW), POLICIES.transfers.prefix),
      transfersGlobal: build(Ratelimit.fixedWindow(TRANSFERS_GLOBAL_CAP, WINDOW), TRANSFERS_GLOBAL_PREFIX),
    },
    hmacKey: crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(token),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
  }
  return clients
}

/** HMAC-SHA256(KV token, bucket), first 16 bytes as hex — raw IPs never reach Redis */
async function hashIdentifier(key: CryptoKey, bucket: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(bucket))
  return Array.from(new Uint8Array(sig, 0, 16), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function consume(limiter: Ratelimit, identifier: string): Promise<RateLimitDecision> {
  // analytics off + no deny list → `pending` is already resolved, no waitUntil needed
  const result = await limiter.limit(identifier)
  if (result.reason === 'timeout') return { kind: 'unavailable', cause: 'timeout' }
  const { limit, remaining, reset } = result
  return result.success ? { kind: 'allow', limit, remaining, reset } : { kind: 'deny', limit, remaining, reset }
}

function unavailable(policy: RateLimitPolicy, cause: UnavailableCause, error?: unknown): RateLimitDecision {
  // Never log the identifier, client IP, or upstream error text (UpstashError.message embeds Redis keys)
  console.error('[CRITICAL] edge-guard rate limiter unavailable', {
    policy,
    cause,
    ...(error !== undefined && { errorName: error instanceof Error ? error.name : typeof error }),
  })
  return { kind: 'unavailable', cause }
}

export async function checkRateLimit(policy: RateLimitPolicy, headers: Headers): Promise<RateLimitDecision> {
  const { max } = POLICIES[policy]
  if (process.env.NODE_ENV === 'development') {
    return { kind: 'allow', limit: max, remaining: max, reset: 0 }
  }

  try {
    const c = getClients()
    if (!c) return unavailable(policy, 'unconfigured')

    const identifier = await hashIdentifier(await c.hmacKey, clientIp(headers))
    const perClient = await consume(c.limiters[policy], identifier)
    if (perClient.kind === 'unavailable') return unavailable(policy, perClient.cause)
    if (perClient.kind === 'deny' || policy !== 'transfers') return perClient

    const global = await consume(c.limiters.transfersGlobal, TRANSFERS_GLOBAL_ID)
    if (global.kind === 'unavailable') return unavailable(policy, global.cause)
    return global.kind === 'deny' ? global : perClient
  } catch (error) {
    return unavailable(policy, 'error', error)
  }
}

/** Status + headers for a blocked request; null when allowed. Routes format the body. */
export function limitResponse(
  decision: RateLimitDecision,
  now: number = Date.now()
): { status: 429 | 503; headers: Record<string, string> } | null {
  if (decision.kind === 'allow') return null
  if (decision.kind === 'unavailable') {
    return { status: 503, headers: { 'Retry-After': String(UNAVAILABLE_RETRY_AFTER_S) } }
  }
  return {
    status: 429,
    headers: {
      'Retry-After': String(Math.max(1, Math.ceil((decision.reset - now) / 1000))),
      'X-RateLimit-Limit': String(decision.limit),
      'X-RateLimit-Remaining': String(decision.remaining),
      'X-RateLimit-Reset': String(Math.ceil(decision.reset / 1000)),
    },
  }
}

/** Informational budget headers for allowed responses */
export function rateLimitHeaders(decision: RateLimitDecision): Record<string, string> {
  if (decision.kind === 'unavailable') return {}
  return {
    'X-RateLimit-Limit': String(decision.limit),
    'X-RateLimit-Remaining': String(decision.remaining),
  }
}

let healthMemo: { at: number; result: Promise<boolean> } | null = null

/** Redis reachability for /api/health, memoized per isolate so GET floods cannot burn quota */
export async function isRedisHealthy(): Promise<boolean> {
  const now = Date.now()
  if (healthMemo && now - healthMemo.at < HEALTH_TTL_MS) return healthMemo.result

  let redis: Redis
  try {
    const c = getClients()
    if (!c) return false
    redis = c.redis
  } catch {
    return false
  }

  const result = Promise.race([
    redis.ping().then(
      () => true,
      () => false
    ),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), HEALTH_PING_TIMEOUT_MS)),
  ])
  healthMemo = { at: now, result }
  return result
}
