/**
 * Debounce Utility
 *
 * Re-exports and wraps the use-debounce library for consistent usage across the application.
 * This provides a centralized place to configure debounce behavior.
 */

// Re-export the main hooks from use-debounce
export { useDebouncedCallback, useDebounce } from 'use-debounce'

/**
 * Default debounce delay for auto-save operations (in milliseconds)
 */
export const AUTO_SAVE_DEBOUNCE_MS = 500

/**
 * Default debounce delay for search/filter operations (in milliseconds)
 */
export const SEARCH_DEBOUNCE_MS = 300
