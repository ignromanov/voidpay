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
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Module mocks — must be declared before dynamic imports of route.ts
// ---------------------------------------------------------------------------

// Real header/origin helpers; only the Redis-backed decision is mocked.
// End-to-end fail-closed coverage lives in fail-closed.test.ts.
const { ALLOW } = vi.hoisted(() => ({
  ALLOW: { kind: 'allow', limit: 10, remaining: 9, reset: 0 } as const,
}))
vi.mock('@/shared/lib/edge-guard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/edge-guard')>()),
  checkRateLimit: vi.fn(async () => ALLOW),
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

/** Mock the eth_blockNumber response used by the drift-correction safety net.
 *  Defaults to a huge sentinel value (10^12) that's above any realistic chain
 *  head on any supported network — prevents tests from triggering the retry path. */
function mockBlockNumberSuccess(blockHex: string = '0xe8d4a51000'): void {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      jsonrpc: '2.0',
      id: 2,
      result: blockHex,
    }),
  })
}

/** Build a mock Alchemy JSON-RPC success response.
 *  Enqueues TWO responses to cover the parallel fetch in route.ts:
 *  (1) alchemy_getAssetTransfers, (2) eth_blockNumber (drift-correction safety net). */
function mockAlchemySuccess(transfers: Record<string, unknown>[] = [makeAlchemyTransfer()]) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      jsonrpc: '2.0',
      id: 1,
      result: { transfers },
    }),
  })
  mockBlockNumberSuccess()
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
import { estimateCurrentBlock, getAvgBlockTimeMs } from '@/entities/network'
import { checkRateLimit } from '@/shared/lib/edge-guard'
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
  vi.mocked(checkRateLimit).mockResolvedValue(ALLOW)
  // Ensure ALCHEMY_API_KEY is set for happy-path tests
  process.env.ALCHEMY_API_KEY = 'test-key'
  // Dynamic import so the module is re-evaluated after mocks are set up
  const mod = await import('../route')
  POST = mod.POST
})

afterEach(() => {
  vi.restoreAllMocks()
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
  // fromBlock upper bound (#368) — rejected with zero upstream fetches
  // -------------------------------------------------------------------------
  describe('fromBlock upper bound', () => {
    const toleranceBlocks = Math.floor(86_400_000 / getAvgBlockTimeMs(1))

    it.each(['0x1234567890abc', '0x00000000000001'])('rejects fromBlock longer than 12 hex digits (%s)', async (fromBlock) => {
      const response = await POST(makeRequest({ ...VALID_BODY, fromBlock }))
      expect(response.status).toBe(400)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('rejects 0xffffffff (forced drift-retry) with no upstream fetch', async () => {
      const response = await POST(makeRequest({ ...VALID_BODY, fromBlock: '0xffffffff' }))
      expect(response.status).toBe(400)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('rejects fromBlock beyond estimate + ~1 day of blocks with no upstream fetch', async () => {
      const beyond = estimatedEthCurrent + toleranceBlocks + 1_000
      const response = await POST(makeRequest({ ...VALID_BODY, fromBlock: `0x${beyond.toString(16)}` }))
      expect(response.status).toBe(400)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('accepts fromBlock slightly ahead of the estimate (inside the tolerance)', async () => {
      mockAlchemySuccess()
      const ahead = estimatedEthCurrent + Math.floor(toleranceBlocks / 2)
      const response = await POST(makeRequest({ ...VALID_BODY, fromBlock: `0x${ahead.toString(16)}` }))
      expect(response.status).toBe(200)
    })

    it('rejects when the chain has no estimate anchor', async () => {
      vi.resetModules()
      vi.doMock('@/entities/network', async (importOriginal) => ({
        ...(await importOriginal<typeof import('@/entities/network')>()),
        estimateCurrentBlock: () => null,
      }))
      try {
        const { POST: localPost } = await import('../route')
        const response = await localPost(makeRequest(VALID_BODY))
        expect(response.status).toBe(400)
        expect(mockFetch).not.toHaveBeenCalled()
      } finally {
        vi.doUnmock('@/entities/network')
      }
    })
  })

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

      // fetch is called twice: (1) alchemy_getAssetTransfers, (2) eth_blockNumber.
      // Inspect calls[0] — the transfers call — to verify maxCount.
      expect(mockFetch).toHaveBeenCalledTimes(2)
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
  describe('TC-9: rate limit (edge-guard, fail-closed)', () => {
    it('returns 429 with Retry-After computed from reset and an error body', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000)
      vi.mocked(checkRateLimit).mockResolvedValue({
        kind: 'deny',
        limit: 10,
        remaining: 0,
        reset: 1_800_000_000_000 + 59_200,
      })

      const response = await POST(makeRequest(VALID_BODY))

      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBe('60')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      const data = (await response.json()) as { error: string }
      expect(data.error).toBeDefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it.each(['unconfigured', 'error', 'timeout'] as const)(
      'returns 503 with Retry-After: 30 when the limiter is unavailable (%s)',
      async (cause) => {
        vi.mocked(checkRateLimit).mockResolvedValue({ kind: 'unavailable', cause })

        const response = await POST(makeRequest(VALID_BODY))

        expect(response.status).toBe(503)
        expect(response.headers.get('Retry-After')).toBe('30')
        expect(await response.json()).toEqual({ error: 'Service temporarily unavailable' })
        expect(mockFetch).not.toHaveBeenCalled()
      }
    )

    it('checks the transfers policy with the request headers', async () => {
      mockAlchemySuccess()
      await POST(makeRequest(VALID_BODY))
      expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('transfers', expect.any(Headers))
    })

    it('rate-limits before parsing the body', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({ kind: 'deny', limit: 10, remaining: 0, reset: 0 })
      const response = await POST(
        new Request('http://localhost/api/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not-json{{{',
        })
      )
      expect(response.status).toBe(429)
    })
  })

  // -------------------------------------------------------------------------
  // Origin gate + Content-Type (#368)
  // -------------------------------------------------------------------------
  describe('origin gate (production)', () => {
    /** NextRequest keeps origin/host; a plain Request strips them as forbidden headers */
    function makeBrowserRequest(headers: Record<string, string>): Request {
      const req = new NextRequest('https://voidpay.xyz/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_BODY),
      })
      for (const [k, v] of Object.entries(headers)) req.headers.set(k, v)
      return req
    }

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('rejects a request without Origin/Referer with 403, before the limiter', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      const response = await POST(makeBrowserRequest({ host: 'voidpay.xyz' }))
      expect(response.status).toBe(403)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
      expect(vi.mocked(checkRateLimit)).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('rejects a cross-site Origin with 403', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      const req = makeBrowserRequest({ origin: 'https://evil.com', host: 'voidpay.xyz' })
      expect(req.headers.get('origin')).toBe('https://evil.com')
      const response = await POST(req)
      expect(response.status).toBe(403)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('accepts a same-site Origin', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      mockAlchemySuccess()
      const response = await POST(makeBrowserRequest({ origin: 'https://voidpay.xyz', host: 'voidpay.xyz' }))
      expect(response.status).toBe(200)
    })
  })

  describe('Content-Type', () => {
    it.each([['text/plain'], ['application/x-www-form-urlencoded'], ['multipart/form-data'], ['application/jsonp']])(
      'rejects %s with 415 before the limiter',
      async (contentType) => {
        const response = await POST(makeRequest(VALID_BODY, { 'Content-Type': contentType }))
        expect(response.status).toBe(415)
        expect(vi.mocked(checkRateLimit)).not.toHaveBeenCalled()
        expect(mockFetch).not.toHaveBeenCalled()
      }
    )

    it('rejects a missing Content-Type with 415', async () => {
      const response = await POST(
        new Request('http://localhost/api/transfers', {
          method: 'POST',
          body: new Blob([JSON.stringify(VALID_BODY)]),
        })
      )
      expect(response.status).toBe(415)
    })

    it('accepts application/json with parameters, case-insensitively', async () => {
      mockAlchemySuccess()
      const response = await POST(makeRequest(VALID_BODY, { 'Content-Type': 'Application/JSON; charset=utf-8' }))
      expect(response.status).toBe(200)
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
      // Transfers call returns an Alchemy error — drift-correction path needs a
      // block number mock too (route.ts always fetches it in parallel).
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32600, message: 'Invalid API key' },
        }),
      })
      mockBlockNumberSuccess()

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

  // -------------------------------------------------------------------------
  // Drift correction safety net — eth_blockNumber clamps a drifted fromBlock
  // -------------------------------------------------------------------------
  describe('drift correction: clamps fromBlock ahead of real chain head', () => {
    it('retries transfers with a safe lookback when fromBlock > realCurrentBlock', async () => {
      // Client fromBlock is well within the DoS cap but well above the real
      // chain head — the route must detect drift and retry with a corrected value.
      const clientFromBlock = estimatedEthCurrent - 100
      const realCurrentBlock = clientFromBlock - 50_000 // 50k blocks behind client

      // (1) First transfers call — returns empty because fromBlock is ahead of head
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: '2.0', id: 1, result: { transfers: [] } }),
      })
      // (2) Block number call — returns realCurrentBlock (below client fromBlock)
      mockBlockNumberSuccess(`0x${realCurrentBlock.toString(16)}`)
      // (3) Retry transfers call — must be triggered with corrected fromBlock
      const matchingTransfer = makeAlchemyTransfer()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: '2.0', id: 1, result: { transfers: [matchingTransfer] } }),
      })

      const response = await POST(
        makeRequest({ ...VALID_BODY, fromBlock: `0x${clientFromBlock.toString(16)}` }),
      )

      expect(response.status).toBe(200)
      // 3 fetch calls total: initial transfers + blockNumber + retry transfers
      expect(mockFetch).toHaveBeenCalledTimes(3)

      // The retry (3rd call) must send a fromBlock at or below realCurrentBlock,
      // clamped via the ~3-day lookback window.
      const [, retryInit] = mockFetch.mock.calls[2] as [string, RequestInit]
      const retryBody = JSON.parse(retryInit.body as string) as {
        method: string
        params: [{ fromBlock: string }]
      }
      expect(retryBody.method).toBe('alchemy_getAssetTransfers')
      const retryFromBlock = parseInt(retryBody.params[0].fromBlock, 16)
      expect(retryFromBlock).toBeLessThanOrEqual(realCurrentBlock)
      expect(retryFromBlock).toBeGreaterThan(0)

      // Returned payload uses the retry response (matching transfer)
      const data = (await response.json()) as { transfers: Record<string, unknown>[] }
      expect(data.transfers).toHaveLength(1)
    })

    it('does not retry when fromBlock is already at or below real chain head', async () => {
      mockAlchemySuccess() // transfers + blockNumber (sentinel huge block)

      await POST(makeRequest(VALID_BODY))

      // Only the original 2 calls — no retry, since sentinel block (1e12) > fromBlock
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
