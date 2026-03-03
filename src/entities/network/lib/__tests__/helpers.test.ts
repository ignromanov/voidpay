/**
 * Network Helpers Tests
 * Tests for blockchain network utility functions
 */

import { describe, it, expect } from 'vitest'
import { getExplorerUrl, getNetworkName } from '../helpers'

describe('network helpers', () => {
  describe('getExplorerUrl', () => {
    it('returns Etherscan URL for Ethereum mainnet', () => {
      const url = getExplorerUrl(1, '0x123abc')
      expect(url).toBe('https://etherscan.io/tx/0x123abc')
    })

    it('returns Arbiscan URL for Arbitrum', () => {
      const url = getExplorerUrl(42161, '0xabc123')
      expect(url).toBe('https://arbiscan.io/tx/0xabc123')
    })

    it('returns Optimism Etherscan URL for Optimism', () => {
      const url = getExplorerUrl(10, '0xdef456')
      expect(url).toBe('https://optimistic.etherscan.io/tx/0xdef456')
    })

    it('returns Polygonscan URL for Polygon', () => {
      const url = getExplorerUrl(137, '0x789ghi')
      expect(url).toBe('https://polygonscan.com/tx/0x789ghi')
    })

    it('returns Sepolia Etherscan URL for Sepolia', () => {
      const url = getExplorerUrl(11155111, '0xaaa')
      expect(url).toBe('https://sepolia.etherscan.io/tx/0xaaa')
    })

    it('returns Arbiscan Sepolia URL for Arbitrum Sepolia', () => {
      const url = getExplorerUrl(421614, '0xbbb')
      expect(url).toBe('https://sepolia.arbiscan.io/tx/0xbbb')
    })

    it('returns Blockscout URL for Optimism Sepolia', () => {
      const url = getExplorerUrl(11155420, '0xccc')
      expect(url).toBe('https://optimism-sepolia.blockscout.com/tx/0xccc')
    })

    it('returns Amoy Polygonscan URL for Polygon Amoy', () => {
      const url = getExplorerUrl(80002, '0xddd')
      expect(url).toBe('https://amoy.polygonscan.com/tx/0xddd')
    })

    it('returns # for unknown network', () => {
      const url = getExplorerUrl(999999, '0xunknown')
      expect(url).toBe('#')
    })

    it('handles empty hash', () => {
      const url = getExplorerUrl(1, '')
      expect(url).toBe('https://etherscan.io/tx/')
    })
  })

  describe('getNetworkName', () => {
    it('returns "Ethereum" for chain ID 1', () => {
      expect(getNetworkName(1)).toBe('Ethereum')
    })

    it('returns "Arbitrum" for chain ID 42161', () => {
      expect(getNetworkName(42161)).toBe('Arbitrum')
    })

    it('returns "Optimism" for chain ID 10', () => {
      expect(getNetworkName(10)).toBe('Optimism')
    })

    it('returns "Polygon" for chain ID 137', () => {
      expect(getNetworkName(137)).toBe('Polygon')
    })

    it('returns chain ID as string for unknown network', () => {
      expect(getNetworkName(999999)).toBe('999999')
    })

    it('returns chain ID string for zero', () => {
      expect(getNetworkName(0)).toBe('0')
    })
  })
})
