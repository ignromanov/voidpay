/**
 * Key Namespacing Utility
 *
 * Provides utilities for namespacing LocalStorage keys to prevent conflicts.
 */

import { STORAGE_NAMESPACE } from '@/shared/config/storage-keys'

/**
 * Create a namespaced storage key
 *
 * @param key - Base key name
 * @returns Namespaced key (e.g., "voidpay:mykey")
 */
export function createNamespacedKey(key: string): string {
  return `${STORAGE_NAMESPACE}:${key}`
}

/**
 * Check if a key belongs to our namespace
 *
 * @param key - Storage key to check
 * @returns true if key starts with our namespace prefix
 */
export function isNamespacedKey(key: string): boolean {
  return key.startsWith(`${STORAGE_NAMESPACE}:`)
}

/**
 * Extract the base key from a namespaced key
 *
 * @param namespacedKey - Namespaced key (e.g., "voidpay:creator")
 * @returns Base key (e.g., "creator") or null if not namespaced
 */
export function extractBaseKey(namespacedKey: string): string | null {
  if (!isNamespacedKey(namespacedKey)) {
    return null
  }
  return namespacedKey.slice(`${STORAGE_NAMESPACE}:`.length)
}

/**
 * Get all keys in our namespace from LocalStorage
 *
 * @returns Array of namespaced keys
 */
export function getAllNamespacedKeys(): string[] {
  const keys: string[] = []

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && isNamespacedKey(key)) {
        keys.push(key)
      }
    }
  } catch {
    // If localStorage is unavailable, return empty array
    return []
  }

  return keys
}

/**
 * Clear all keys in our namespace from LocalStorage
 *
 * WARNING: This will delete all application data!
 */
export function clearAllNamespacedKeys(): void {
  const keys = getAllNamespacedKeys()

  keys.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore errors for individual key removal
    }
  })
}
