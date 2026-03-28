import { describe, it, expect, beforeEach } from 'vitest'
import { isAnalyticsDisabled, setAnalyticsDisabled } from '../analytics-storage'

describe('analytics-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('isAnalyticsDisabled', () => {
    it('returns false when no preference is stored', () => {
      expect(isAnalyticsDisabled()).toBe(false)
    })

    it('returns true when umami.disabled is "1"', () => {
      localStorage.setItem('umami.disabled', '1')
      expect(isAnalyticsDisabled()).toBe(true)
    })

    it('returns false for non-"1" values', () => {
      localStorage.setItem('umami.disabled', '0')
      expect(isAnalyticsDisabled()).toBe(false)
    })
  })

  describe('setAnalyticsDisabled', () => {
    it('sets storage key to "1" when disabled=true', () => {
      setAnalyticsDisabled(true)
      expect(localStorage.getItem('umami.disabled')).toBe('1')
    })

    it('removes storage key when disabled=false', () => {
      localStorage.setItem('umami.disabled', '1')
      setAnalyticsDisabled(false)
      expect(localStorage.getItem('umami.disabled')).toBeNull()
    })

    it('is idempotent for repeated calls', () => {
      setAnalyticsDisabled(true)
      setAnalyticsDisabled(true)
      expect(localStorage.getItem('umami.disabled')).toBe('1')

      setAnalyticsDisabled(false)
      setAnalyticsDisabled(false)
      expect(localStorage.getItem('umami.disabled')).toBeNull()
    })
  })
})
