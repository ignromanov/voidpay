import { UMAMI_CONFIG } from '../config/umami'

/**
 * Check if analytics tracking is disabled
 * Safe to call on server (returns false)
 */
export function isAnalyticsDisabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(UMAMI_CONFIG.storageKey) === '1'
}

/**
 * Set analytics opt-out preference
 * When disabled, Umami script automatically respects this flag
 */
export function setAnalyticsDisabled(disabled: boolean): void {
  if (typeof window === 'undefined') return

  if (disabled) {
    localStorage.setItem(UMAMI_CONFIG.storageKey, '1')
  } else {
    localStorage.removeItem(UMAMI_CONFIG.storageKey)
  }
}
