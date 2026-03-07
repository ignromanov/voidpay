import { describe, it, expect } from 'vitest'
import {
  CONFIRMATION_CONFIG,
  getSoftConfirmations,
  getFinalizationTimeout,
  getMaxBlockAge,
  getAvgBlockTimeMs,
  estimateBlockFromTimestamp,
} from '../confirmation-config'

describe('confirmation-config', () => {
  describe('CONFIRMATION_CONFIG', () => {
    it('returns correct blocks for all 4 networks', () => {
      expect(CONFIRMATION_CONFIG[1]?.blocks).toBe(3)       // ETH
      expect(CONFIRMATION_CONFIG[42161]?.blocks).toBe(1)    // ARB
      expect(CONFIRMATION_CONFIG[10]?.blocks).toBe(1)       // OP
      expect(CONFIRMATION_CONFIG[137]?.blocks).toBe(5)      // POLY
    })

    it('returns correct finalizationTimeoutMs for all networks', () => {
      expect(CONFIRMATION_CONFIG[1]?.finalizationTimeoutMs).toBe(60 * 60_000)     // 60 min
      expect(CONFIRMATION_CONFIG[42161]?.finalizationTimeoutMs).toBe(30 * 60_000) // 30 min
      expect(CONFIRMATION_CONFIG[10]?.finalizationTimeoutMs).toBe(30 * 60_000)
      expect(CONFIRMATION_CONFIG[137]?.finalizationTimeoutMs).toBe(30 * 60_000)
    })
  })

  describe('getSoftConfirmations', () => {
    it('returns correct block count per chain', () => {
      expect(getSoftConfirmations(1)).toBe(3)
      expect(getSoftConfirmations(42161)).toBe(1)
      expect(getSoftConfirmations(10)).toBe(1)
      expect(getSoftConfirmations(137)).toBe(5)
    })

    it('throws for unknown chainId', () => {
      expect(() => getSoftConfirmations(999)).toThrow()
    })
  })

  describe('getFinalizationTimeout', () => {
    it('returns correct timeout per chain', () => {
      expect(getFinalizationTimeout(1)).toBe(3_600_000)      // 60 min
      expect(getFinalizationTimeout(42161)).toBe(1_800_000)  // 30 min
    })
  })

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
