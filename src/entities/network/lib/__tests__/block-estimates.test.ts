import { describe, it, expect } from 'vitest'
import {
  getMaxBlockAge,
  getAvgBlockTimeMs,
  estimateCurrentBlock,
  estimateFromBlockHex,
  estimateBlockFromTimestamp,
} from '../block-estimates'

describe('block-estimates', () => {
  describe('getMaxBlockAge', () => {
    it('returns chain-specific ~30 day DoS caps', () => {
      expect(getMaxBlockAge(1)).toBe(216_000)
      expect(getMaxBlockAge(42161)).toBe(10_368_000)
      expect(getMaxBlockAge(10)).toBe(1_296_000)
      expect(getMaxBlockAge(137)).toBe(1_296_000)
    })

    it('throws for unknown chainId', () => {
      expect(() => getMaxBlockAge(999)).toThrow()
    })
  })

  describe('getAvgBlockTimeMs', () => {
    it('returns correct average block time', () => {
      expect(getAvgBlockTimeMs(1)).toBe(12_000)
      expect(getAvgBlockTimeMs(42161)).toBe(250)
      expect(getAvgBlockTimeMs(10)).toBe(2_000)
      expect(getAvgBlockTimeMs(137)).toBe(2_000)
    })

    it('throws for unknown chainId', () => {
      expect(() => getAvgBlockTimeMs(999)).toThrow()
    })
  })

  describe('estimateCurrentBlock', () => {
    it('returns a positive number for supported chains', () => {
      const result = estimateCurrentBlock(1)
      expect(result).toBeTypeOf('number')
      expect(result!).toBeGreaterThan(0)
    })

    it('returns null for unsupported chain', () => {
      expect(estimateCurrentBlock(999)).toBeNull()
    })
  })

  describe('estimateFromBlockHex', () => {
    it('returns 0x-prefixed hex string for supported chains', () => {
      const now = Math.floor(Date.now() / 1000)
      const result = estimateFromBlockHex(1, now - 3600) // 1h ago
      expect(result).toMatch(/^0x[0-9a-f]+$/)
    })

    it('returns 0x1 for unsupported chains', () => {
      expect(estimateFromBlockHex(999, Math.floor(Date.now() / 1000))).toBe('0x1')
    })

    it('returns 0x1 for very old timestamps', () => {
      // A timestamp far before the reference block should clamp to 0x1
      const result = estimateFromBlockHex(1, 0)
      expect(result).toBe('0x1')
    })
  })

  describe('estimateBlockFromTimestamp', () => {
    it('computes correct fromBlock from createdAt', () => {
      const now = Date.now()
      const createdAt = Math.floor((now - 3_600_000) / 1000) // 1 hour ago (unix seconds)
      const currentBlock = 20_000_000n

      // For ETH (12s blocks): 3600s / 12s = 300 blocks ago
      const result = estimateBlockFromTimestamp(createdAt, 1, currentBlock)
      expect(result).toBe(currentBlock - 300n)
    })

    it('never returns negative block number', () => {
      const veryOldCreatedAt = Math.floor((Date.now() - 365 * 24 * 3600 * 1000) / 1000) // 1 year ago
      const currentBlock = 100n
      const result = estimateBlockFromTimestamp(veryOldCreatedAt, 1, currentBlock)
      expect(result >= 0n).toBe(true)
    })
  })
})
