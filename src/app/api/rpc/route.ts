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

import { NextRequest, NextResponse } from 'next/server';
import type { JsonRpcRequest, JsonRpcResponse } from '@/features/rpc-proxy/model/types';

export const runtime = 'edge';

/**
 * POST /api/rpc
 * Proxy JSON-RPC requests to blockchain providers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Security: Validate Origin and Referer headers
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  // In production, enforce same-origin policy
  if (process.env.NODE_ENV === 'production') {
    const isValidOrigin = origin && (origin.includes(host || '') || origin.includes('voidpay.com'));
    const isValidReferer = referer && (referer.includes(host || '') || referer.includes('voidpay.com'));
    
    if (!isValidOrigin && !isValidReferer) {
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
      );
    }
  }
  
  try {
    // Parse request body
    const body = await request.json() as JsonRpcRequest;
    
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
      );
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
      );
    }
    
    // Rate limiting (skip for mock mode to avoid blocking development)
    const url = new URL(request.url);
    const { shouldUseMock } = await import('@/features/rpc-proxy/lib/mock');
    
    if (!shouldUseMock(url)) {
      const { extractIpAddress, checkRateLimit } = await import('@/features/rpc-proxy/lib/rate-limit');
      const ipAddress = extractIpAddress(request.headers);
      const rateLimitResult = await checkRateLimit(ipAddress);
      
      if (!rateLimitResult.allowed) {
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
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }
    }
    
    // Check if mock mode should be enabled
    const { getMockMode, handleMockRequest } = await import('@/features/rpc-proxy/lib/mock');
    
    if (shouldUseMock(url)) {
      const mockMode = getMockMode(url);
      const mockResponse = await handleMockRequest(body, mockMode);
      
      return NextResponse.json(
        mockResponse,
        {
          status: mockResponse.error ? 400 : 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Mock-Mode': mockMode,
          },
        }
      );
    }
    
    // Import proxy logic dynamically to avoid bundling in client
    const { proxyRequest } = await import('@/features/rpc-proxy/lib/proxy');
    
    // Proxy the request with automatic failover
    const result = await proxyRequest(body);
    
    // Get rate limit info for response headers (if available)
    let rateLimitHeaders: Record<string, string> = {};
    if (!shouldUseMock(url)) {
      const { extractIpAddress, checkRateLimit } = await import('@/features/rpc-proxy/lib/rate-limit');
      const ipAddress = extractIpAddress(request.headers);
      const rateLimitResult = await checkRateLimit(ipAddress);
      
      rateLimitHeaders = {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      };
    }
    
    // Check if both providers failed (HTTP 503)
    if (result.response.error && result.response.error.message.includes('unavailable')) {
      return NextResponse.json(
        result.response,
        { 
          status: 503,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Retry-After': '60', // Suggest retry after 60 seconds
            ...rateLimitHeaders,
          },
        }
      );
    }
    
    // Return successful response or provider-specific error
    return NextResponse.json(
      result.response,
      { 
        status: result.response.error ? 400 : 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...rateLimitHeaders,
        },
      }
    );
    
  } catch {
    // No logging - privacy-preserving
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error: Invalid JSON',
        },
        id: null,
      } as JsonRpcResponse,
      { status: 400 }
    );
  }
}

/**
 * CORS Preflight Handler
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  
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
  );
}

/**
 * Reject non-POST requests
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
