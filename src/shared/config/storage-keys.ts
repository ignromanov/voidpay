/**
 * Storage Key Constants
 *
 * Centralized storage key management for LocalStorage.
 * All keys are namespaced with 'voidpay:' prefix to prevent conflicts.
 */

/**
 * Storage key namespace prefix
 */
export const STORAGE_NAMESPACE = 'voidpay' as const

/**
 * Creator store key (drafts, templates, history, preferences, ID counter)
 */
export const CREATOR_STORE_KEY = `${STORAGE_NAMESPACE}:creator` as const

/**
 * Payer store key (payment receipts)
 */
export const PAYER_STORE_KEY = `${STORAGE_NAMESPACE}:payer` as const

/**
 * All storage keys used by the application
 */
export const STORAGE_KEYS = {
  CREATOR: CREATOR_STORE_KEY,
  PAYER: PAYER_STORE_KEY,
} as const
