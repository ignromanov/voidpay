'use client'

import { useEffect, useState } from 'react'

/**
 * useIsMounted Hook
 *
 * Returns true only after the component has mounted on the client.
 * Useful for avoiding SSR hydration mismatches with client-only features.
 *
 * @example
 * ```tsx
 * const isMounted = useIsMounted()
 *
 * if (!isMounted) {
 *   return <Skeleton />
 * }
 *
 * return <ClientOnlyComponent />
 * ```
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
