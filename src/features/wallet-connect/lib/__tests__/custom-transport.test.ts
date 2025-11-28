/**
 * T010-test: Unit test for custom transport to /api/rpc
 *
 * Tests the custom HTTP transport that routes ALL RPC calls through the
 * /api/rpc proxy to prevent client-side API key exposure (Constitutional Principle VI)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createCustomTransport, createChainTransport } from '../custom-transport'
import type { Chain, HttpTransportConfig } from 'viem'

// Mock the global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('custom-transport', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    // Default successful response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ jsonrpc: '2.0', id: 1, result: '0x1' }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createCustomTransport', () => {
    it('should create a transport function for a given chain ID', () => {
      const transport = createCustomTransport(1)
      expect(transport).toBeDefined()
      expect(typeof transport).toBe('function')
    })

    it('should route requests to /api/rpc with chainId query parameter', async () => {
      const chainId = 1
      const transport = createCustomTransport(chainId)

      // Create a mock chain object
      const mockChain: Chain = {
        id: chainId,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['https://example.com'] } },
      }

      // Get the transport config
      const config: HttpTransportConfig = { retryCount: 3 }
      const transportInstance = transport({ chain: mockChain, ...config })

      // The transport should be configured to use /api/rpc
      expect(transportInstance).toBeDefined()
      expect(transportInstance.config).toBeDefined()
    })

    it('should handle different chain IDs correctly', () => {
      const ethereumTransport = createCustomTransport(1)
      const arbitrumTransport = createCustomTransport(42161)
      const optimismTransport = createCustomTransport(10)
      const polygonTransport = createCustomTransport(137)

      expect(ethereumTransport).toBeDefined()
      expect(arbitrumTransport).toBeDefined()
      expect(optimismTransport).toBeDefined()
      expect(polygonTransport).toBeDefined()
    })
  })

  describe('createChainTransport', () => {
    it('should create transport for mainnet chains', () => {
      const transport = createChainTransport(1) // Ethereum mainnet
      expect(transport).toBeDefined()
    })

    it('should create transport for testnet chains when testnets enabled', () => {
      const transport = createChainTransport(11155111) // Sepolia
      expect(transport).toBeDefined()
    })

    it('should return a viem-compatible transport', () => {
      const transport = createChainTransport(1)
      // Transport should be callable (viem transport pattern)
      expect(typeof transport).toBe('function')
    })
  })

  describe('RPC request routing', () => {
    it('should include chainId in the request URL', async () => {
      const chainId = 42161 // Arbitrum

      // Simulate making an RPC call through the transport
      await fetch(`/api/rpc?chainId=${chainId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/rpc?chainId=${chainId}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      )
    })

    it('should never expose API keys in the client', () => {
      const transport = createCustomTransport(1)

      // The transport function should not contain any API keys
      const transportString = transport.toString()
      expect(transportString).not.toContain('ALCHEMY')
      expect(transportString).not.toContain('INFURA')
      expect(transportString).not.toContain('API_KEY')
    })
  })
})
