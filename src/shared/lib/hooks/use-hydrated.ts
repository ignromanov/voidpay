import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Hook to detect if the component has been hydrated on the client.
 * Uses useSyncExternalStore for optimal performance (no extra re-render).
 *
 * @returns `true` on client after hydration, `false` on server
 *
 * @example
 * ```tsx
 * const hydrated = useHydrated()
 *
 * // Safe to use browser APIs
 * if (hydrated) {
 *   window.scrollTo(0, 0)
 * }
 *
 * // Prevent Framer Motion hydration mismatch
 * <motion.div initial={hydrated ? { opacity: 0 } : {}} />
 * ```
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot: always hydrated
    () => false // server snapshot: never hydrated
  )
}
