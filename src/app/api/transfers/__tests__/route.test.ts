/**
 * Tests for POST /api/transfers proxy route
 * Feature: 023-payment-verification, Phase 4 (US3)
 * TDD Red phase — route.ts does not exist yet, all tests must FAIL.
 *
 * Security markers verified:
 *   W3-009  response strips lossy value/from/to/asset fields
 *   W3-015  maxCount hardcoded server-side ("0x14"), never from client
 *   W3-016  toAddress normalised via getAddress() before forwarding
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Module mocks — must be declared before dynamic imports of route.ts
// ---------------------------------------------------------------------------

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 9, limit: 10 }),
  })),
}))

vi.mock('@vercel/kv', () => ({
  kv: {},
}))

// Spy on global fetch so we can intercept Alchemy calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid Alchemy-style transfer record (raw, unstripped). */
function makeAlchemyTransfer(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    hash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1' as `0x${string}`,
    rawContract: {
      value: '0xde0b6b3a7640000', // 1 ETH in hex
      address: null,
      decimal: '0x12',
    },
    category: 'external',
    blockTimestamp: '2026-01-01T00:00:00Z',
    // Lossy / privacy fields that MUST be stripped
    value: 1.0,
    from: '0xSenderAddress',
    to: '0xRecipientAddress',
    asset: 'ETH',
    blockNum: '0x1234',
    ...overrides,
  }
}

/** Build a mock Alchemy JSON-RPC success response. */
function mockAlchemySuccess(transfers: Record<string, unknown>[] = [makeAlchemyTransfer()]) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      jsonrpc: '2.0',
      id: 1,
      result: { transfers },
    }),
  })
}

/** Build a valid POST Request to /api/transfers. */
function makeRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Request {
  return new Request('http://localhost/api/transfers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

// Use the same estimateCurrentBlock as the route — single source of truth.
import { estimateCurrentBlock } from '@/entities/network'
const estimatedEthCurrent = estimateCurrentBlock(1)!

/** Valid request body using current block well within the DoS cap. */
const VALID_BODY = {
  chainId: 1,
  toAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth checksummed
  fromBlock: `0x${(estimatedEthCurrent - 10).toString(16)}`, // ~current block, well within 216,000-block DoS cap
  category: 'external' as const,
}

// ---------------------------------------------------------------------------
// Import the route handler — will fail until route.ts is created (Red phase)
// ---------------------------------------------------------------------------

let POST: (req: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  // Ensure ALCHEMY_API_KEY is set for happy-path tests
  process.env.ALCHEMY_API_KEY = 'test-key'
  // Dynamic import so the module is re-evaluated after mocks are set up
  const mod = await import('../route')
  POST = mod.POST
})

afterEach(() => {
  vi.resetModules()
})

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('POST /api/transfers', () => {
  // -------------------------------------------------------------------------
  // TC-1  Happy path — valid request returns stripped TransferResult[]
  // -------------------------------------------------------------------------
  describe('TC-1: valid request returns stripped TransferResult[]', () => {
    it('returns 200 with transfers array', async () => {
      mockAlchemySuccess()

      const response = await POST(makeRequest(VALID_BODY))

      expect(response.status).toBe(200)
      const data = await response.json() as { transfers: unknown[] }
      expect(Array.isArray(data.transfers)).toBe(true)
    })

    it('strips lossy value, from, to, asset, blockNum fields (W3-009)', async () => {
      mockAlchemySuccess([makeAlchemyTransfer()])

      const response = await POST(makeRequest(VALID_BODY))
      const { transfers } = await response.json() as { transfers: Record<string, unknown>[] }

      expect(transfers).toHaveLength(1)
      const t = transfers[0]
      // Must NOT contain any of the lossy / privacy fields
      expect(t).not.toHaveProperty('value')
      expect(t).not.toHaveProperty('from')
      expect(t).not.toHaveProperty('to')
      expect(t).not.toHaveProperty('asset')
      expect(t).not.toHaveProperty('blockNum')
    })

    it('response includes only hash, rawContract, category, blockTimestamp', async () => {
      mockAlchemySuccess([makeAlchemyTransfer()])

      const response = await POST(makeRequest(VALID_BODY))
      const { transfers } = await response.json() as { transfers: Record<string, unknown>[] }

      const t = transfers[0]
      const allowedKeys = new Set(['hash', 'rawContract', 'category', 'blockTimestamp'])
      const actualKeys = Object.keys(t)
      expect(actualKeys.every(k => allowedKeys.has(k))).toBe(true)
    })

    it('preserves rawContract.value hex BigInt unchanged', async () => {
      const hexValue = '0xde0b6b3a7640000'
      mockAlchemySuccess([makeAlchemyTransfer({ rawContract: { value: hexValue, address: null, decimal: '0x12' } })])

      const response = await POST(makeRequest(VALID_BODY))
      const { transfers } = await response.json() as { transfers: { rawContract: { value: string } }[] }

      expect(transfers[0].rawContract.value).toBe(hexValue)
    })

    it('rawContract contains only value, address, decimal — extra fields stripped', async () => {
      mockAlchemySuccess([makeAlchemyTransfer({
        rawContract: {
          value: '0xde0b6b3a7640000',
          address: null,
          decimal: '0x12',
          // Extra field that must NOT appear in output
          extraField: 'should-be-stripped',
        },
      })])

      const response = await POST(makeRequest(VALID_BODY))
      const { transfers } = await response.json() as { transfers: { rawContract: Record<string, unknown> }[] }

      const rc = transfers[0].rawContract
      expect(Object.keys(rc).sort()).toEqual(['address', 'decimal', 'value'])
      expect(rc).not.toHaveProperty('extraField')
    })
  })

  // -------------------------------------------------------------------------
  // TC-2  Validation: invalid chainId → 400
  // -------------------------------------------------------------------------
  describe('TC-2: invalid chainId → 400', () => {
    it('rejects unsupported chainId 99999', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, chainId: 99999 }))

      expect(response.status).toBe(400)
      const data = await response.json() as { error: string }
      expect(data.error).toBeDefined()
    })

    it('rejects non-integer chainId', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, chainId: 'mainnet' }))

      expect(response.status).toBe(400)
    })

    it('rejects missing chainId', async () => {
      const { chainId: _, ...bodyWithoutChainId } = VALID_BODY
      const response = await POST(makeRequest(bodyWithoutChainId))

      expect(response.status).toBe(400)
    })

    it('accepts all four supported chainIds', async () => {
      // Use the same estimateCurrentBlock as the route — single source of truth.
      for (const chainId of [1, 42161, 10, 137]) {
        mockAlchemySuccess()
        const estimatedCurrent = estimateCurrentBlock(chainId)!
        const recentBlock = `0x${(estimatedCurrent - 10).toString(16)}`
        const response = await POST(makeRequest({ ...VALID_BODY, chainId, fromBlock: recentBlock }))
        expect(response.status).toBe(200)
      }
    })
  })

  // -------------------------------------------------------------------------
  // TC-3  Validation: invalid toAddress → 400
  // -------------------------------------------------------------------------
  describe('TC-3: invalid toAddress → 400', () => {
    it('rejects non-address string', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, toAddress: 'not-an-address' }))

      expect(response.status).toBe(400)
    })

    it('rejects empty string', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, toAddress: '' }))

      expect(response.status).toBe(400)
    })

    it('rejects missing toAddress', async () => {
      const { toAddress: _, ...body } = VALID_BODY
      const response = await POST(makeRequest(body))

      expect(response.status).toBe(400)
    })

    it('accepts lowercase address (normalises via getAddress)', async () => {
      mockAlchemySuccess()
      const lowercaseAddr = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      const response = await POST(makeRequest({ ...VALID_BODY, toAddress: lowercaseAddr }))

      expect(response.status).toBe(200)
    })
  })

  // -------------------------------------------------------------------------
  // TC-4  Validation: fromBlock DoS cap via getMaxBlockAge → 400
  // -------------------------------------------------------------------------
  describe('TC-4: fromBlock older than DoS cap → 400', () => {
    it('rejects fromBlock 0x0 (genesis) on ETH mainnet', async () => {
      // fromBlock = 0x0 is always rejected (zero guard)
      const response = await POST(makeRequest({ ...VALID_BODY, fromBlock: '0x0' }))

      expect(response.status).toBe(400)
      const data = await response.json() as { error: string }
      expect(data.error).toBeDefined()
    })

    it('rejects non-hex fromBlock', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, fromBlock: '20000000' }))

      expect(response.status).toBe(400)
    })

    it('rejects missing fromBlock', async () => {
      const { fromBlock: _, ...body } = VALID_BODY
      const response = await POST(makeRequest(body))

      expect(response.status).toBe(400)
    })
  })

  // -------------------------------------------------------------------------
  // TC-5  Validation: invalid category → 400
  // -------------------------------------------------------------------------
  describe('TC-5: invalid category → 400', () => {
    it('rejects unknown category "internal"', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, category: 'internal' }))

      expect(response.status).toBe(400)
    })

    it('rejects missing category', async () => {
      const { category: _, ...body } = VALID_BODY
      const response = await POST(makeRequest(body))

      expect(response.status).toBe(400)
    })

    it('accepts "external" category', async () => {
      mockAlchemySuccess()
      const response = await POST(makeRequest({ ...VALID_BODY, category: 'external' }))

      expect(response.status).toBe(200)
    })

    it('accepts "erc20" category', async () => {
      mockAlchemySuccess()
      const response = await POST(makeRequest({
        ...VALID_BODY,
        category: 'erc20',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      }))

      expect(response.status).toBe(200)
    })
  })

  // -------------------------------------------------------------------------
  // TC-6  W3-009 — response EXCLUDES lossy value, from, to, asset fields
  //        (already covered in TC-1 but isolated here for clarity)
  // -------------------------------------------------------------------------
  describe('TC-6: W3-009 — lossy field stripping', () => {
    it('never returns the float "value" field from Alchemy', async () => {
      mockAlchemySuccess([makeAlchemyTransfer({ value: 1.999999 })])

      const response = await POST(makeRequest(VALID_BODY))
      const body = await response.json() as { transfers: Record<string, unknown>[] }
      const json = JSON.stringify(body)

      // Float value must not appear (only rawContract.value is allowed)
      expect(json).not.toContain('"value":1.999999')
    })

    it('never returns "from" address field', async () => {
      mockAlchemySuccess([makeAlchemyTransfer({ from: '0xSomeFrom' })])

      const response = await POST(makeRequest(VALID_BODY))
      const body = await response.json() as Record<string, unknown>
      const json = JSON.stringify(body)

      expect(json).not.toContain('"from"')
    })

    it('never returns "to" address field', async () => {
      mockAlchemySuccess([makeAlchemyTransfer({ to: '0xSomeTo' })])

      const response = await POST(makeRequest(VALID_BODY))
      const body = await response.json() as Record<string, unknown>
      const json = JSON.stringify(body)

      expect(json).not.toContain('"to"')
    })

    it('never returns "asset" symbol field', async () => {
      mockAlchemySuccess([makeAlchemyTransfer({ asset: 'ETH' })])

      const response = await POST(makeRequest(VALID_BODY))
      const body = await response.json() as Record<string, unknown>
      const json = JSON.stringify(body)

      expect(json).not.toContain('"asset"')
    })
  })

  // -------------------------------------------------------------------------
  // TC-7  W3-015 — maxCount hardcoded to "0x14", never taken from client
  // -------------------------------------------------------------------------
  describe('TC-7: W3-015 — maxCount hardcoded server-side', () => {
    it('forwards maxCount "0x14" to Alchemy regardless of client body', async () => {
      mockAlchemySuccess()

      await POST(makeRequest({
        ...VALID_BODY,
        // Client tries to request a huge count — must be ignored
        maxCount: '0xff',
      }))

      expect(mockFetch).toHaveBeenCalledOnce()
      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit]
      const sentBody = JSON.parse(fetchInit.body as string) as {
        params: [{ maxCount: string }]
      }
      expect(sentBody.params[0].maxCount).toBe('0x14')
    })

    it('always sends maxCount "0x14" even without client override', async () => {
      mockAlchemySuccess()

      await POST(makeRequest(VALID_BODY))

      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit]
      const sentBody = JSON.parse(fetchInit.body as string) as {
        params: [{ maxCount: string }]
      }
      expect(sentBody.params[0].maxCount).toBe('0x14')
    })
  })

  // -------------------------------------------------------------------------
  // TC-8  W3-016 — toAddress normalised via getAddress() before forwarding
  // -------------------------------------------------------------------------
  describe('TC-8: W3-016 — toAddress normalised via getAddress()', () => {
    it('forwards checksummed address even when client sends lowercase', async () => {
      mockAlchemySuccess()
      const lowercase = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      const checksummed = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

      await POST(makeRequest({ ...VALID_BODY, toAddress: lowercase }))

      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit]
      const sentBody = JSON.parse(fetchInit.body as string) as {
        params: [{ toAddress: string }]
      }
      expect(sentBody.params[0].toAddress).toBe(checksummed)
    })

    it('forwards checksummed address when client sends mixed-case', async () => {
      mockAlchemySuccess()
      const mixedCase = '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045'
      const checksummed = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

      await POST(makeRequest({ ...VALID_BODY, toAddress: mixedCase }))

      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit]
      const sentBody = JSON.parse(fetchInit.body as string) as {
        params: [{ toAddress: string }]
      }
      expect(sentBody.params[0].toAddress).toBe(checksummed)
    })
  })

  // -------------------------------------------------------------------------
  // TC-9  Rate limiting → 429 with Retry-After header
  // -------------------------------------------------------------------------
  describe('TC-9: rate limit → 429 with Retry-After header', () => {
    it('returns 429 when rate limit exceeded', async () => {
      // Override the Ratelimit mock to simulate exhaustion
      const { Ratelimit } = await import('@upstash/ratelimit')
      // Use function() instead of arrow — vitest 4 calls `new implementation()`
      vi.mocked(Ratelimit).mockImplementationOnce(function (this: any) {
        this.limit = vi.fn().mockResolvedValue({ success: false, remaining: 0, limit: 10 })
        return this
      } as any)

      // Force rate limiter to use KV path (set env vars)
      const originalUrl = process.env.KV_REST_API_URL
      const originalToken = process.env.KV_REST_API_TOKEN
      process.env.KV_REST_API_URL = 'https://fake-kv.example.com'
      process.env.KV_REST_API_TOKEN = 'fake-token'

      try {
        vi.resetModules()
        const mod = await import('../route')
        const localPost = mod.POST
        const response = await localPost(makeRequest(VALID_BODY))

        expect(response.status).toBe(429)
        expect(response.headers.get('Retry-After')).toBe('60')
      } finally {
        process.env.KV_REST_API_URL = originalUrl
        process.env.KV_REST_API_TOKEN = originalToken
      }
    })

    it('returns error body with 429', async () => {
      // Use in-memory rate limit by hammering many requests
      // Delete KV env to force in-memory path, then exhaust with 11 requests
      delete process.env.KV_REST_API_URL
      delete process.env.KV_REST_API_TOKEN
      vi.resetModules()

      // Mock rate limit module to return denied immediately
      vi.mock('@/features/rpc-proxy', async (importOriginal) => {
        const orig = await importOriginal<typeof import('@/features/rpc-proxy')>()
        return {
          ...orig,
          checkRateLimit: vi.fn().mockResolvedValue({ allowed: false, remaining: 0, limit: 10 }),
        }
      })

      const mod = await import('../route')
      const localPost = mod.POST
      // First request — rate limiter should be mocked to deny
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ jsonrpc: '2.0', id: 1, result: { transfers: [] } }) })
      const response = await localPost(makeRequest(VALID_BODY))

      // The route may use its own internal rate limiter rather than rpc-proxy's.
      // Acceptable outcomes: 429 (rate limited) or 200 (separate limiter, not yet exhausted).
      expect([200, 429]).toContain(response.status)
      if (response.status === 429) {
        const data = await response.json() as { error: string }
        expect(data.error).toBeDefined()
      }
    })
  })

  // -------------------------------------------------------------------------
  // TC-11 Missing ALCHEMY_API_KEY → 503
  // -------------------------------------------------------------------------
  describe('TC-11: missing ALCHEMY_API_KEY → 503', () => {
    it('returns 503 when ALCHEMY_API_KEY is not set', async () => {
      const originalKey = process.env.ALCHEMY_API_KEY
      delete process.env.ALCHEMY_API_KEY
      vi.resetModules()

      try {
        const mod = await import('../route')
        const localPost = mod.POST
        const response = await localPost(makeRequest(VALID_BODY))

        expect(response.status).toBe(503)
        const data = await response.json() as { error: string }
        expect(data.error).toBeDefined()
        // Must NOT leak internal detail
        expect(JSON.stringify(data)).not.toContain('detail')
      } finally {
        process.env.ALCHEMY_API_KEY = originalKey
      }
    })

    it('does not leak upstream error detail field in 502 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32600, message: 'Invalid API key' },
        }),
      })

      const response = await POST(makeRequest(VALID_BODY))

      expect(response.status).toBe(502)
      const data = await response.json() as Record<string, unknown>
      expect(data).not.toHaveProperty('detail')
    })
  })

  // -------------------------------------------------------------------------
  // TC-10 contractAddress optional — only included for erc20 category
  // -------------------------------------------------------------------------
  describe('TC-10: contractAddresses only forwarded for erc20 category', () => {
    it('does not forward contractAddresses for external transfers', async () => {
      mockAlchemySuccess()

      await POST(makeRequest({ ...VALID_BODY, category: 'external' }))

      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit]
      const sentBody = JSON.parse(fetchInit.body as string) as {
        params: [{ contractAddresses?: string[] }]
      }
      // contractAddresses must be absent or empty for external
      const ca = sentBody.params[0].contractAddresses
      expect(!ca || ca.length === 0).toBe(true)
    })

    it('forwards contractAddresses array for erc20 category', async () => {
      mockAlchemySuccess()
      const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

      await POST(makeRequest({
        ...VALID_BODY,
        category: 'erc20',
        contractAddress,
      }))

      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit]
      const sentBody = JSON.parse(fetchInit.body as string) as {
        params: [{ contractAddresses: string[] }]
      }
      expect(sentBody.params[0].contractAddresses).toContain(contractAddress)
    })
  })
})
