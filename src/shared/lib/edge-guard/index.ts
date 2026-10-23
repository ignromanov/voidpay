// Public API for shared/lib/edge-guard (server-only: app/api/** routes)

export { checkRateLimit, limitResponse, rateLimitHeaders, isRedisHealthy, TRANSFERS_GLOBAL_CAP } from './rate-limit'
export type { RateLimitDecision, RateLimitPolicy, UnavailableCause } from './rate-limit'
export { clientIp } from './client-ip'
export { isAllowedOrigin, passesOriginGate } from './origin'
