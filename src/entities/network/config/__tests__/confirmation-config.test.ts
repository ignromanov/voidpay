import { describe, it, expect } from 'vitest'
import {
  CONFIRMATION_CONFIG,
  getSoftConfirmations,
  getFinalizationTimeout,
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
})
