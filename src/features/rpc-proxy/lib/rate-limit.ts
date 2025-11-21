/**
 * Rate Limiting for RPC Proxy
 * Feature: 004-rpc-proxy-failover
 * 
 * Uses Vercel KV (Redis) with @upstash/ratelimit for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import type { RateLimitResult } from '../model/types';

// Initialize rate limiter with sliding window algorithm
// 100 requests per 60 seconds per IP
let rateLimiter: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  // Only initialize if KV credentials are available
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  
  if (!rateLimiter) {
    rateLimiter = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: false, // Privacy: no analytics
      prefix: 'rpc_ratelimit',
    });
  }
  
  return rateLimiter;
}

/**
 * Extract IP address from request headers
 * Handles X-Forwarded-For and X-Real-IP headers from proxies
 */
export function extractIpAddress(headers: Headers): string {
  // Try X-Forwarded-For first (most common in production)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }
  
  // Try X-Real-IP
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Check if request should be rate limited
 * @param identifier IP address or other identifier
 * @returns Rate limit result with allowed status and remaining quota
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRateLimiter();
  
  // Fail-open: if KV is not configured, allow the request
  if (!limiter) {
    return {
      allowed: true,
      remaining: 100,
      limit: 100,
    };
  }
  
  try {
    const result = await limiter.limit(identifier);
    
    return {
      allowed: result.success,
      remaining: result.remaining,
      limit: result.limit,
    };
  } catch {
    // Fail-open: if KV is unreachable, allow the request
    // This prevents blocking legitimate users during infrastructure issues
    return {
      allowed: true,
      remaining: 100,
      limit: 100,
    };
  }
}
