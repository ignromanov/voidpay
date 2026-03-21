/**
 * Health Check API Route
 * Feature: P0.19 Deploy prep
 *
 * Reports service health for monitoring and alerting.
 * Checks: RPC provider config, Redis rate limiter availability.
 */

import { NextResponse } from 'next/server'

export const runtime = 'edge'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unavailable'
  checks: {
    rpc: { configured: boolean }
    rateLimiter: { configured: boolean; reachable: boolean }
  }
  timestamp: string
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const rpcConfigured = !!(process.env.ALCHEMY_API_KEY && process.env.INFURA_API_KEY)

  const rateLimiterConfigured = !!(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  )

  let rateLimiterReachable = false
  if (rateLimiterConfigured) {
    try {
      const { isRateLimitHealthy } = await import('@/features/rpc-proxy')
      rateLimiterReachable = await isRateLimitHealthy()
    } catch {
      rateLimiterReachable = false
    }
  }

  const allHealthy = rpcConfigured && rateLimiterConfigured && rateLimiterReachable
  const partiallyHealthy = rpcConfigured && (!rateLimiterConfigured || !rateLimiterReachable)

  const status: HealthStatus = {
    status: allHealthy ? 'ok' : partiallyHealthy ? 'degraded' : 'unavailable',
    checks: {
      rpc: { configured: rpcConfigured },
      rateLimiter: { configured: rateLimiterConfigured, reachable: rateLimiterReachable },
    },
    timestamp: new Date().toISOString(),
  }

  const httpStatus = allHealthy ? 200 : partiallyHealthy ? 200 : 503

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
