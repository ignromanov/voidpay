import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  nowUnix,
  nowISO,
  startOfDayUTC,
  daysFromNowUnix,
  dateStringToUnix,
  unixToDateString,
  isDueDatePassed,
  formatDateUTC,
} from '../index'

// Verified timestamps (UTC midnight):
// 2026-02-28T00:00:00Z = 1772236800
// 2026-03-01T00:00:00Z = 1772323200
// 2026-03-02T00:00:00Z = 1772409600
// 2026-03-31T00:00:00Z = 1774915200
// 2026-01-01T00:00:00Z = 1767225600
// 2026-12-31T00:00:00Z = 1798675200
// 2026-03-01T12:00:00Z = 1772366400
// 2026-03-01T15:32:00Z = 1772379120
// 2026-03-01T23:59:59Z = 1772409599

describe('date-time utilities', () => {
  describe('nowUnix', () => {
    it('returns current time in seconds, not milliseconds', () => {
      const before = Math.floor(Date.now() / 1000)
      const result = nowUnix()
      const after = Math.floor(Date.now() / 1000)
      expect(result).toBeGreaterThanOrEqual(before)
      expect(result).toBeLessThanOrEqual(after)
    })

    it('returns a value close to Date.now() / 1000', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))
      expect(nowUnix()).toBe(1772366400)
      vi.useRealTimers()
    })

    it('returns integer (floors fractional seconds)', () => {
      vi.useFakeTimers()
      // 999ms into the second — must floor to same second as midnight
      vi.setSystemTime(new Date('2026-03-01T00:00:00.999Z'))
      expect(nowUnix()).toBe(1772323200)
      vi.useRealTimers()
    })
  })

  describe('nowISO', () => {
    it('returns a valid ISO 8601 string', () => {
      const result = nowISO()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('returns current time as ISO string', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))
      expect(nowISO()).toBe('2026-03-01T12:00:00.000Z')
      vi.useRealTimers()
    })
  })

  describe('startOfDayUTC', () => {
    it('returns midnight UTC for a timestamp already at midnight', () => {
      // 2026-03-01T00:00:00Z = 1772323200
      expect(startOfDayUTC(1772323200)).toBe(1772323200)
    })

    it('truncates a midday timestamp to midnight UTC', () => {
      // 2026-03-01T12:00:00Z = 1772366400 → midnight = 1772323200
      expect(startOfDayUTC(1772366400)).toBe(1772323200)
    })

    it('truncates a late-night timestamp to midnight UTC', () => {
      // 2026-03-01T23:59:59Z = 1772409599 → midnight = 1772323200
      expect(startOfDayUTC(1772409599)).toBe(1772323200)
    })

    it('handles timestamps at 15:32 correctly', () => {
      // 2026-03-01T15:32:00Z = 1772379120 → midnight = 1772323200
      expect(startOfDayUTC(1772379120)).toBe(1772323200)
    })

    it('correctly handles the next day', () => {
      // 2026-03-02T00:00:01Z → midnight = 2026-03-02T00:00:00Z = 1772409600
      expect(startOfDayUTC(1772409600 + 1)).toBe(1772409600)
    })
  })

  describe('daysFromNowUnix', () => {
    beforeEach(() => {
      // Fix time to 2026-03-01T15:32:00Z (middle of the day)
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-01T15:32:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns midnight-aligned future date', () => {
      // nowUnix() = 1772379120 (2026-03-01T15:32:00Z)
      // startOfDayUTC(nowUnix()) = 1772323200 (2026-03-01T00:00:00Z)
      // + 30 * 86400 = 1772323200 + 2592000 = 1774915200 (2026-03-31T00:00:00Z)
      const result = daysFromNowUnix(30)
      expect(result % 86400).toBe(0) // always midnight UTC
      expect(result).toBe(1772323200 + 30 * 86400)
    })

    it('returns today midnight for 0 days', () => {
      expect(daysFromNowUnix(0)).toBe(1772323200)
    })

    it('returns tomorrow midnight for 1 day', () => {
      expect(daysFromNowUnix(1)).toBe(1772323200 + 86400)
    })
  })

  describe('dateStringToUnix', () => {
    it('converts "2026-03-01" to correct Unix timestamp', () => {
      // 2026-03-01T00:00:00Z in seconds
      expect(dateStringToUnix('2026-03-01')).toBe(1772323200)
    })

    it('converts "2026-01-01" correctly', () => {
      // 2026-01-01T00:00:00Z
      expect(dateStringToUnix('2026-01-01')).toBe(1767225600)
    })

    it('converts "1970-01-01" to 0', () => {
      expect(dateStringToUnix('1970-01-01')).toBe(0)
    })
  })

  describe('unixToDateString', () => {
    it('converts Unix timestamp to "2026-03-01" format (UTC)', () => {
      expect(unixToDateString(1772323200)).toBe('2026-03-01')
    })

    it('roundtrips with dateStringToUnix', () => {
      const original = '2026-03-15'
      expect(unixToDateString(dateStringToUnix(original))).toBe(original)
    })

    it('uses UTC, not local timezone', () => {
      // 2026-03-01T23:59:59Z = 1772409599 — still Mar 1 in UTC
      expect(unixToDateString(1772409599)).toBe('2026-03-01')
    })

    it('correctly handles midnight boundary', () => {
      // 2026-03-02T00:00:00Z = 1772409600 — now Mar 2
      expect(unixToDateString(1772409600)).toBe('2026-03-02')
    })
  })

  describe('isDueDatePassed', () => {
    beforeEach(() => {
      // Fix "now" to 2026-03-01T12:00:00Z (noon UTC)
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('dueAt = today midnight → NOT passed (valid through end of day)', () => {
      // dueAt = 2026-03-01T00:00:00Z = 1772323200
      // endOfDueDay = 2026-03-02T00:00:00Z = 1772409600
      // now (noon) = 1772366400 < endOfDueDay → not passed
      expect(isDueDatePassed(1772323200)).toBe(false)
    })

    it('dueAt = yesterday midnight → IS passed', () => {
      // dueAt = 2026-02-28T00:00:00Z = 1772236800
      // endOfDueDay = 2026-03-01T00:00:00Z = 1772323200
      // now (noon) = 1772366400 >= endOfDueDay → passed
      expect(isDueDatePassed(1772236800)).toBe(true)
    })

    it('dueAt = today at 15:32 (non-midnight) → NOT passed (startOfDayUTC normalizes)', () => {
      // dueAt = 2026-03-01T15:32:00Z = 1772379120
      // startOfDayUTC = 2026-03-01T00:00:00Z = 1772323200
      // endOfDueDay = 2026-03-02T00:00:00Z = 1772409600
      // now (noon) = 1772366400 < endOfDueDay → not passed
      expect(isDueDatePassed(1772379120)).toBe(false)
    })

    it('dueAt = yesterday at 15:32 → IS passed', () => {
      // dueAt = 2026-02-28T15:32:00Z = 1772236800 + 15*3600 + 32*60 = 1772293920
      // startOfDayUTC = 2026-02-28T00:00:00Z = 1772236800
      // endOfDueDay = 2026-03-01T00:00:00Z = 1772323200
      // now (noon) = 1772366400 >= endOfDueDay → passed
      const yesterdayAt1532 = 1772236800 + 15 * 3600 + 32 * 60
      expect(isDueDatePassed(yesterdayAt1532)).toBe(true)
    })

    it('dueAt = tomorrow midnight → NOT passed', () => {
      // dueAt = 2026-03-02T00:00:00Z = 1772409600
      // endOfDueDay = 2026-03-03T00:00:00Z = 1772496000
      // now (noon) < endOfDueDay → not passed
      expect(isDueDatePassed(1772409600)).toBe(false)
    })

    it('exactly at endOfDueDay boundary → IS passed', () => {
      // now = exactly 2026-03-02T00:00:00Z = endOfDueDay for 2026-03-01
      vi.setSystemTime(new Date('2026-03-02T00:00:00.000Z'))
      expect(isDueDatePassed(1772323200)).toBe(true)
    })
  })

  describe('formatDateUTC', () => {
    it('formats 2026-03-01 as "MAR 1, 2026"', () => {
      expect(formatDateUTC(1772323200)).toBe('MAR 1, 2026')
    })

    it('formats 2026-01-01 as "JAN 1, 2026"', () => {
      expect(formatDateUTC(1767225600)).toBe('JAN 1, 2026')
    })

    it('formats 2026-12-31 correctly', () => {
      expect(formatDateUTC(1798675200)).toBe('DEC 31, 2026')
    })

    it('always uses UTC, not local timezone', () => {
      // 2026-03-01T23:59:59Z = 1772409599 — still MAR 1 in UTC
      expect(formatDateUTC(1772409599)).toBe('MAR 1, 2026')
    })

    it('uses UTC midnight boundary correctly', () => {
      // 2026-03-02T00:00:00Z = 1772409600 — MAR 2 in UTC
      expect(formatDateUTC(1772409600)).toBe('MAR 2, 2026')
    })

    it('formats all months correctly', () => {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      months.forEach((month, i) => {
        const dateStr = `2025-${String(i + 1).padStart(2, '0')}-15`
        const result = formatDateUTC(dateStringToUnix(dateStr))
        expect(result).toMatch(new RegExp(`^${month} `))
      })
    })
  })
})
