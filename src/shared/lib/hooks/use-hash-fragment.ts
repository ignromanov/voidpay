import { useSyncExternalStore } from 'react'

/**
 * Subscribe to hash change events
 */
function subscribeToHash(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

/**
 * Get current hash fragment without the leading '#'
 */
function getHashSnapshot(): string {
  return window.location.hash.slice(1)
}

/**
 * Server snapshot — hash is unavailable during SSR
 */
function getServerSnapshot(): string {
  return ''
}

/**
 * Hook to read URL hash fragment reactively.
 * Hash fragments are never sent to the server (Privacy-First).
 *
 * Uses useSyncExternalStore for:
 * - Optimal performance (no extra re-renders)
 * - SSR compatibility (returns '' on server)
 * - Automatic updates on hash change
 *
 * @returns Hash fragment string (without '#'), empty on server
 *
 * @example
 * ```tsx
 * const hash = useHashFragment()
 *
 * // Decode invoice from hash
 * if (hash) {
 *   const invoice = decodeInvoice(hash)
 * }
 * ```
 */
export function useHashFragment(): string {
  return useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerSnapshot
  )
}
