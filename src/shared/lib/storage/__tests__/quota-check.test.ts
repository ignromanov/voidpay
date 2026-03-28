import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isLocalStorageAvailable,
  estimateStorageUsage,
  estimateAvailableQuota,
  hasSufficientSpace,
  getQuotaWarningLevel,
  formatBytes,
} from '../quota-check'

describe('quota-check', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ──────────────────────────────────────────────────────────────
  // isLocalStorageAvailable
  // ──────────────────────────────────────────────────────────────
  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is functional', () => {
      expect(isLocalStorageAvailable()).toBe(true)
    })

    it('returns false when localStorage.setItem throws', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      expect(isLocalStorageAvailable()).toBe(false)
    })

    it('cleans up the test key after checking', () => {
      isLocalStorageAvailable()
      expect(localStorage.getItem('__voidpay_storage_test__')).toBeNull()
    })
  })

  // ──────────────────────────────────────────────────────────────
  // estimateStorageUsage
  // ──────────────────────────────────────────────────────────────
  describe('estimateStorageUsage', () => {
    it('returns 0 when localStorage is empty', () => {
      expect(estimateStorageUsage()).toBe(0)
    })

    it('estimates bytes based on key + value length × 2 (UTF-16)', () => {
      localStorage.setItem('abc', 'de') // key=3, value=2 → (3+2)*2 = 10
      expect(estimateStorageUsage()).toBe(10)
    })

    it('accumulates bytes across multiple keys', () => {
      localStorage.setItem('k1', 'val') // (2+3)*2 = 10
      localStorage.setItem('k2', 'val') // (2+3)*2 = 10
      expect(estimateStorageUsage()).toBe(20)
    })

    it('returns 0 when localStorage is unavailable', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage unavailable')
      })
      expect(estimateStorageUsage()).toBe(0)
    })

    it('returns 0 when iteration throws', () => {
      // Add a real item so length > 0, then make key() throw during iteration
      localStorage.setItem('somekey', 'somevalue')
      vi.spyOn(localStorage, 'key').mockImplementation(() => {
        throw new Error('iteration error')
      })
      expect(estimateStorageUsage()).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // estimateAvailableQuota
  // ──────────────────────────────────────────────────────────────
  describe('estimateAvailableQuota', () => {
    it('returns ~5MB when localStorage is empty', () => {
      const quota = estimateAvailableQuota()
      expect(quota).toBe(5 * 1024 * 1024)
    })

    it('subtracts current usage from 5MB default', () => {
      localStorage.setItem('k', 'v') // (1+1)*2 = 4 bytes
      const quota = estimateAvailableQuota()
      expect(quota).toBe(5 * 1024 * 1024 - 4)
    })

    it('returns 0 when usage exceeds quota (no negative values)', () => {
      // Fill storage so (key.length + value.length) * 2 > 5MB
      // key='k' (1 char), value = 2_622_000 chars → (1 + 2_622_000) * 2 = 5_244_002 > 5_242_880
      localStorage.setItem('k', 'x'.repeat(2_622_000))
      const quota = estimateAvailableQuota()
      expect(quota).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // hasSufficientSpace
  // ──────────────────────────────────────────────────────────────
  describe('hasSufficientSpace', () => {
    it('returns true when available quota >> required bytes', () => {
      // empty storage → 5MB available, 100 bytes needed
      expect(hasSufficientSpace(100)).toBe(true)
    })

    it('returns false when required bytes > available quota / 1.2', () => {
      // 5MB available, require 5MB → 5MB * 1.2 = 6MB > 5MB available → false
      expect(hasSufficientSpace(5 * 1024 * 1024)).toBe(false)
    })

    it('applies 20% safety margin', () => {
      // available = 5MB = 5242880
      // require = 4370000 → 4370000 * 1.2 = 5244000 > 5242880 → false
      expect(hasSufficientSpace(4370000)).toBe(false)
      // require = 4000000 → 4000000 * 1.2 = 4800000 < 5242880 → true
      expect(hasSufficientSpace(4000000)).toBe(true)
    })
  })

  // ──────────────────────────────────────────────────────────────
  // getQuotaWarningLevel
  // ──────────────────────────────────────────────────────────────
  describe('getQuotaWarningLevel', () => {
    it('returns "ok" when usage is below 70%', () => {
      // empty localStorage → 0% usage
      expect(getQuotaWarningLevel()).toBe('ok')
    })

    it('returns "warning" when usage is between 70% and 90%', () => {
      // 70% of 5MB (5_242_880) = 3_669_016 bytes
      // usage = (key.length + value.length) * 2
      // key='k' (1 char), value_len such that (1 + value_len) * 2 ≥ 70% of 5MB
      // value_len = ceil(5_242_880 * 0.70 / 2) - 1 = 1_834_508 - 1 = 1_834_507
      // Use 1_840_000 to be comfortably in the warning zone (70%–90%)
      const value = 'x'.repeat(1_840_000)
      localStorage.setItem('k', value)
      expect(getQuotaWarningLevel()).toBe('warning')
    })

    it('returns "critical" when usage is 90% or above', () => {
      // 90% of 5MB = 4718592 bytes
      // value_len ≈ 4718592/2 - 1 = 2359295
      const value = 'x'.repeat(2_360_000)
      localStorage.setItem('k', value)
      expect(getQuotaWarningLevel()).toBe('critical')
    })
  })

  // ──────────────────────────────────────────────────────────────
  // formatBytes
  // ──────────────────────────────────────────────────────────────
  describe('formatBytes', () => {
    it('returns "0 Bytes" for 0', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('formats bytes under 1KB as "Bytes"', () => {
      expect(formatBytes(512)).toBe('512 Bytes')
    })

    it('formats kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB')
    })

    it('formats megabytes correctly', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
    })

    it('formats fractional values with 2 decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('formats gigabytes correctly', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })
})
