'use client'

/**
 * NetworkThemeContext - Provides synchronized network theme for landing page
 * Feature: 012-landing-page
 *
 * This context allows DemoSection to communicate the active network
 * to NetworkBackground for synchronized theme transitions.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { NetworkTheme } from '@/shared/ui'

type NetworkThemeContextValue = {
  theme: NetworkTheme
  setTheme: (theme: NetworkTheme) => void
}

const NetworkThemeContext = createContext<NetworkThemeContextValue | null>(null)

type NetworkThemeProviderProps = {
  children: ReactNode
  defaultTheme?: NetworkTheme
}

export function NetworkThemeProvider({
  children,
  defaultTheme = 'ethereum',
}: NetworkThemeProviderProps) {
  const [theme, setThemeState] = useState<NetworkTheme>(defaultTheme)

  const setTheme = useCallback((newTheme: NetworkTheme) => {
    setThemeState(newTheme)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <NetworkThemeContext.Provider value={value}>{children}</NetworkThemeContext.Provider>
}

export function useNetworkTheme() {
  const context = useContext(NetworkThemeContext)
  if (!context) {
    throw new Error('useNetworkTheme must be used within NetworkThemeProvider')
  }
  return context
}
