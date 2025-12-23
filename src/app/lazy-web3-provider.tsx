'use client'

/**
 * LazyWeb3Provider - Lazy loading for Web3 providers WITHOUT unmounting
 *
 * Note: For new components, prefer on-demand loading via:
 * - src/shared/ui/wallet-button-lazy.tsx (true on-demand loading)
 * - src/shared/providers/web3-scope.tsx (optional scoped provider)
 *
 * Strategy:
 * 1. Always render Web3Provider (loaded via dynamic import)
 * 2. Track loading state via context for UI feedback
 * 3. NO conditional rendering of children - prevents flash/remount
 * 4. Defer loading with requestIdleCallback to avoid blocking LCP
 *
 * Previous implementation caused full DOM unmount/remount when switching
 * from `{children}` to `<Web3Provider>{children}</Web3Provider>`,
 * resulting in visible page flash.
 */

import dynamic from 'next/dynamic'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Context to track Web3 loading state
const Web3LoadedContext = createContext(false)

export function useWeb3Loaded() {
  return useContext(Web3LoadedContext)
}

// Dynamically import the full Web3Provider (wagmi, rainbowkit, etc.)
// Using ssr: false since Web3 providers require browser APIs
const Web3Provider = dynamic(
  () => import('./providers').then((mod) => mod.Web3Provider),
  { ssr: false }
)

interface LazyWeb3ProviderProps {
  children: ReactNode
}

export function LazyWeb3Provider({ children }: LazyWeb3ProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Track when Web3Provider module is fully loaded
  // Defer loading until browser is idle to avoid blocking initial paint
  useEffect(() => {
    const loadWeb3 = () => {
      import('./providers')
        .then(() => {
          setIsLoaded(true)
        })
        .catch((error) => {
          // Log error for debugging but don't crash - Web3 is non-critical on landing
          console.error('[LazyWeb3Provider] Failed to load Web3 providers:', error)
        })
    }

    // Use requestIdleCallback to defer loading until browser is idle
    // This prevents Web3 from blocking LCP and reduces TBT
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(loadWeb3, { timeout: 5000 })
      return () => cancelIdleCallback(idleId)
    } else {
      // Fallback for Safari - defer 3 seconds after component mount
      const timeoutId = setTimeout(loadWeb3, 3000)
      return () => clearTimeout(timeoutId)
    }
  }, [])

  // Always render Web3Provider - it handles its own loading state internally
  // This prevents the unmount/remount cycle that caused flashing
  return (
    <Web3LoadedContext.Provider value={isLoaded}>
      <Web3Provider>{children}</Web3Provider>
    </Web3LoadedContext.Provider>
  )
}
