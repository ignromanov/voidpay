/**
 * T033-test: Unit test for network mismatch detection
 *
 * Tests detection when invoice network doesn't match connected network.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock useChainId return value
let mockChainId: number | undefined = 1

// Mock wagmi
vi.mock('wagmi', () => ({
  useChainId: vi.fn(() => mockChainId),
}))

describe('network-mismatch', () => {
  beforeEach(() => {
    vi.resetModules()
    mockChainId = 1
  })

  describe('detectNetworkMismatch', () => {
    it('should export detectNetworkMismatch function', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      expect(detectNetworkMismatch).toBeDefined()
    })

    it('should return false when networks match', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 1,
        connectedChainId: 1,
      })
      expect(result.hasMismatch).toBe(false)
    })

    it('should return true when networks differ', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 1,
        connectedChainId: 137,
      })
      expect(result.hasMismatch).toBe(true)
    })

    it('should include expected and actual chain IDs', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 42161,
        connectedChainId: 10,
      })
      expect(result.expectedChainId).toBe(42161)
      expect(result.actualChainId).toBe(10)
    })

    it('should handle undefined connected chain', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 1,
        connectedChainId: undefined,
      })
      expect(result.hasMismatch).toBe(true)
      expect(result.actualChainId).toBeUndefined()
    })

    it('should include chain names for known chains', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 1,
        connectedChainId: 137,
      })
      expect(result.expectedChainName).toBe('Ethereum')
      expect(result.actualChainName).toBe('Polygon')
    })

    it('should return "Unknown" for unknown invoice chain', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 999999,
        connectedChainId: 1,
      })
      expect(result.expectedChainName).toBe('Unknown')
    })

    it('should return undefined for unknown connected chain', async () => {
      const { detectNetworkMismatch } = await import('../network-mismatch')
      const result = detectNetworkMismatch({
        invoiceChainId: 1,
        connectedChainId: 999999,
      })
      expect(result.actualChainName).toBeUndefined()
    })
  })

  describe('useNetworkMismatch', () => {
    it('should export useNetworkMismatch hook', async () => {
      const { useNetworkMismatch } = await import('../network-mismatch')
      expect(useNetworkMismatch).toBeDefined()
    })

    it('should detect no mismatch when chains match', async () => {
      mockChainId = 1
      const { useNetworkMismatch } = await import('../network-mismatch')
      const { result } = renderHook(() => useNetworkMismatch(1))

      expect(result.current.hasMismatch).toBe(false)
      expect(result.current.expectedChainId).toBe(1)
      expect(result.current.actualChainId).toBe(1)
    })

    it('should detect mismatch when chains differ', async () => {
      mockChainId = 137
      const { useNetworkMismatch } = await import('../network-mismatch')
      const { result } = renderHook(() => useNetworkMismatch(1))

      expect(result.current.hasMismatch).toBe(true)
      expect(result.current.expectedChainId).toBe(1)
      expect(result.current.actualChainId).toBe(137)
    })
  })
})
