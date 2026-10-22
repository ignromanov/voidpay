/**
 * RPC Proxy Edge API Route
 * Feature: 004-rpc-proxy-failover
 *
 * This route handles all blockchain RPC requests with:
 * - Automatic failover between Alchemy (primary) and Infura (fallback)
 * - Privacy-preserving proxy (no logging, secure API keys)
 * - Rate limiting (100 req/min per IP, fail-closed via shared/lib/edge-guard)
 * - Mock mode for development (never in production)
 *
 * Order: Origin gate → rate limit → body parse.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { JsonRpcRequest, JsonRpcResponse } from '@/features/rpc-proxy'
import { checkRateLimit, limitResponse, passesOriginGate, rateLimitHeaders } from '@/shared/lib/edge-guard'

export const runtime = 'edge'

/**
 * POST /api/rpc
 * Proxy JSON-RPC requests to blockchain providers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Same-origin policy (production only) — no ACAO, the API is not cross-origin
  if (!passesOriginGate(request.headers)) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid origin',
        },
        id: null,
      } as JsonRpcResponse,
      { status: 403 }
    )
  }

  // Rate limit before reading the body; applies to mock mode too
  const rateLimit = await checkRateLimit('rpc', request.headers)
  const blocked = limitResponse(rateLimit)
  if (blocked) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error:
          blocked.status === 503
            ? { code: -32603, message: 'Service temporarily unavailable. Please try again later.' }
            : { code: 429, message: 'Rate limit exceeded. Please try again later.' },
        id: null,
      } as JsonRpcResponse,
      { status: blocked.status, headers: blocked.headers }
    )
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

    // Check if mock mode should be enabled
    const { shouldUseMock, getMockMode, handleMockRequest } = await import('@/features/rpc-proxy')

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

    const budgetHeaders = rateLimitHeaders(rateLimit)

    // Check if both providers failed (HTTP 503)
    if (result.response.error && result.response.error.message.includes('unavailable')) {
      return NextResponse.json(result.response, {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          'Retry-After': '60', // Suggest retry after 60 seconds
          ...budgetHeaders,
        },
      })
    }

    // Return successful response or provider-specific error
    return NextResponse.json(result.response, {
      status: result.response.error ? 400 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        ...budgetHeaders,
      },
    })
  } catch (error) {
    console.error('RPC proxy error:', error instanceof Error ? error.name : 'UnknownError')
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
 * CORS Preflight Handler — same-origin only, so no Access-Control-Allow-Origin
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } })
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
