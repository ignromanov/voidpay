'use client'

/**
 * LazyWeb3Provider - Conservative lazy loading for Web3 providers
 *
 * Strategy:
 * 1. Render children immediately (no blocking)
 * 2. Load Web3 providers in background after first render
 * 3. Once loaded, wrap children with full Web3 context
 *
 * This improves LCP by not blocking initial render with heavy Web3 bundles,
 * while still having providers ready quickly for wallet interactions.
 */

import dynamic from 'next/dynamic'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Context to track Web3 loading state
const Web3LoadedContext = createContext(false)

export function useWeb3Loaded() {
  return useContext(Web3LoadedContext)
}

// Dynamically import the full Web3Provider (wagmi, rainbowkit, etc.)
const Web3Provider = dynamic(
  () => import('./providers').then((mod) => mod.Web3Provider),
  { ssr: false }
)

interface LazyWeb3ProviderProps {
  children: ReactNode
}

export function LazyWeb3Provider({ children }: LazyWeb3ProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Preload Web3 providers after initial render
  useEffect(() => {
    // Small delay to ensure initial paint completes
    const timer = requestIdleCallback(
      () => {
        import('./providers').then(() => {
          setIsLoaded(true)
        })
      },
      { timeout: 2000 }
    )

    return () => cancelIdleCallback(timer)
  }, [])

  // Before Web3 is loaded, render children without providers
  // This means wallet hooks won't work yet, but page renders fast
  if (!isLoaded) {
    return (
      <Web3LoadedContext.Provider value={false}>
        {children}
      </Web3LoadedContext.Provider>
    )
  }

  // After loaded, wrap with full Web3 context
  return (
    <Web3LoadedContext.Provider value={true}>
      <Web3Provider>{children}</Web3Provider>
    </Web3LoadedContext.Provider>
  )
}
