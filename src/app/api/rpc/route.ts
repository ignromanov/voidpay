/**
 * RPC Proxy Edge API Route
 * Feature: 004-rpc-proxy-failover
 *
 * This route handles all blockchain RPC requests with:
 * - Automatic failover between Alchemy (primary) and Infura (fallback)
 * - Privacy-preserving proxy (no logging, secure API keys)
 * - Rate limiting (100 req/min per IP)
 * - Mock mode for development
 */

import { NextRequest, NextResponse } from 'next/server'
import type { JsonRpcRequest, JsonRpcResponse } from '@/features/rpc-proxy'

export const runtime = 'edge'

function isAllowedOrigin(value: string | null, host: string | null): boolean {
  if (!value) return false
  try {
    const hostname = new URL(value).hostname
    if (host && hostname === host) return true
    return hostname === 'voidpay.xyz' || hostname.endsWith('.voidpay.xyz')
  } catch {
    return false
  }
}

/**
 * POST /api/rpc
 * Proxy JSON-RPC requests to blockchain providers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Security: Validate Origin and Referer headers
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // In production, enforce same-origin policy
  if (process.env.NODE_ENV === 'production') {
    if (!isAllowedOrigin(origin, host) && !isAllowedOrigin(referer, host)) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid origin',
          },
          id: null,
        } as JsonRpcResponse,
        {
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }
  }

  try {
    // Parse request body
    const body = (await request.json()) as JsonRpcRequest

    // Basic JSON-RPC 2.0 validation
    if (!body.jsonrpc || body.jsonrpc !== '2.0') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0"',
          },
          id: body.id || null,
        } as JsonRpcResponse,
        { status: 400 }
      )
    }

    if (!body.method) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request: method is required',
          },
          id: body.id || null,
        } as JsonRpcResponse,
        { status: 400 }
      )
    }

    // Extract chainId from query params (default to Ethereum mainnet)
    const url = new URL(request.url)
    const chainIdParam = url.searchParams.get('chainId')
    const chainId = chainIdParam ? Number(chainIdParam) : 1

    if (Number.isNaN(chainId) || !Number.isInteger(chainId) || chainId <= 0) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: `Invalid chainId parameter: must be a positive integer`,
          },
          id: body.id || null,
        } as JsonRpcResponse,
        { status: 400 }
      )
    }

    // Rate limiting (skip for mock mode to avoid blocking development)
    const { shouldUseMock } = await import('@/features/rpc-proxy')

    let storedRateLimitResult: Awaited<ReturnType<typeof import('@/features/rpc-proxy').checkRateLimit>> | null = null

    if (!shouldUseMock(url)) {
      const { extractIpAddress, checkRateLimit } = await import('@/features/rpc-proxy')
      const ipAddress = extractIpAddress(request.headers)
      storedRateLimitResult = await checkRateLimit(ipAddress)

      if (!storedRateLimitResult.allowed) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            error: {
              code: 429,
              message: 'Rate limit exceeded. Please try again later.',
            },
            id: body.id || null,
          } as JsonRpcResponse,
          {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': storedRateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }
    }

    // Check if mock mode should be enabled
    const { getMockMode, handleMockRequest } = await import('@/features/rpc-proxy')

    if (shouldUseMock(url)) {
      const mockMode = getMockMode(url)
      const mockResponse = await handleMockRequest(body, mockMode, chainId)

      return NextResponse.json(mockResponse, {
        status: mockResponse.error ? 400 : 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          'X-Mock-Mode': mockMode,
        },
      })
    }

    // Import proxy logic dynamically to avoid bundling in client
    const { proxyRequest } = await import('@/features/rpc-proxy')

    // Proxy the request with automatic failover
    const result = await proxyRequest(body, chainId)

    // Build rate limit headers from the already-fetched result (avoid second call)
    let rateLimitHeaders: Record<string, string> = {}
    if (storedRateLimitResult) {
      rateLimitHeaders = {
        'X-RateLimit-Limit': storedRateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': storedRateLimitResult.remaining.toString(),
      }
    }

    // Check if both providers failed (HTTP 503)
    if (result.response.error && result.response.error.message.includes('unavailable')) {
      return NextResponse.json(result.response, {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          'Retry-After': '60', // Suggest retry after 60 seconds
          ...rateLimitHeaders,
        },
      })
    }

    // Return successful response or provider-specific error
    return NextResponse.json(result.response, {
      status: result.response.error ? 400 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        ...rateLimitHeaders,
      },
    })
  } catch (error) {
    console.error('RPC proxy error:', error)
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      } as JsonRpcResponse,
      { status: 500 }
    )
  }
}

/**
 * CORS Preflight Handler
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin')

  return NextResponse.json(
    {},
    {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    }
  )
}

/**
 * Reject non-POST requests
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}
