/**
 * LocalStorage Quota Check Utility
 *
 * Provides utilities for checking LocalStorage availability and quota usage.
 */

/**
 * Check if LocalStorage is available in the current environment
 *
 * @returns true if LocalStorage is available and functional
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__voidpay_storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Estimate current LocalStorage usage in bytes
 *
 * Note: This is an approximation based on string length.
 * Actual browser storage may vary slightly.
 *
 * @returns Estimated storage usage in bytes
 */
export function estimateStorageUsage(): number {
  if (!isLocalStorageAvailable()) {
    return 0
  }

  let totalBytes = 0

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        // Estimate: key length + value length (UTF-16, so 2 bytes per char)
        totalBytes += (key.length + (value?.length || 0)) * 2
      }
    }
  } catch {
    // If iteration fails, return 0
    return 0
  }

  return totalBytes
}

/**
 * Estimate available LocalStorage quota in bytes
 *
 * Note: Most browsers have a 5-10MB limit. This function attempts to
 * detect the limit by testing writes, but defaults to 5MB if detection fails.
 *
 * @returns Estimated available quota in bytes
 */
export function estimateAvailableQuota(): number {
  const DEFAULT_QUOTA = 5 * 1024 * 1024 // 5MB default
  const currentUsage = estimateStorageUsage()

  // Return conservative estimate: 5MB - current usage
  return Math.max(0, DEFAULT_QUOTA - currentUsage)
}

/**
 * Check if there's sufficient space for a given data size
 *
 * @param requiredBytes - Required space in bytes
 * @returns true if sufficient space is available
 */
export function hasSufficientSpace(requiredBytes: number): boolean {
  const availableQuota = estimateAvailableQuota()
  // Add 20% safety margin
  return availableQuota > requiredBytes * 1.2
}

/**
 * Get storage quota warning level
 *
 * @returns 'ok' | 'warning' | 'critical'
 */
export function getQuotaWarningLevel(): 'ok' | 'warning' | 'critical' {
  const usage = estimateStorageUsage()
  const DEFAULT_QUOTA = 5 * 1024 * 1024 // 5MB
  const usagePercent = (usage / DEFAULT_QUOTA) * 100

  if (usagePercent >= 90) {
    return 'critical'
  } else if (usagePercent >= 70) {
    return 'warning'
  }
  return 'ok'
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
