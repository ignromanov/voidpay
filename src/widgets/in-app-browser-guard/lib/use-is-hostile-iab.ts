'use client'

import { useState, useEffect } from 'react'
import { isHostileInAppBrowser } from '@/shared/lib'

/**
 * Returns whether the current runtime is a Tier-1 hostile in-app browser.
 *
 * Returns false on the first (SSR) render to avoid hydration mismatch,
 * then updates to the real value after mount.
 */
export function useIsHostileInAppBrowser(): boolean {
  const [v, setV] = useState(false)
  useEffect(() => { setV(isHostileInAppBrowser()) }, [])
  return v
}
