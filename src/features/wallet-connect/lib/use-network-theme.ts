/**
 * Network Theme Hook
 *
 * Provides the current network's theme colors for UI styling.
 */

import { useChainId } from 'wagmi'
import { useMemo } from 'react'
import { getNetworkTheme, DEFAULT_NETWORK_THEME, type NetworkTheme } from '../config/network-themes'

/**
 * CSS variable names for network theme
 */
export const NETWORK_THEME_CSS_VARS = {
  primary: '--network-primary',
  secondary: '--network-secondary',
  accent: '--network-accent',
  glow: '--network-glow',
} as const

/**
 * Return type for useNetworkTheme hook
 */
export interface UseNetworkThemeReturn {
  /** Current chain ID */
  chainId: number | undefined
  /** Theme for the current network */
  theme: NetworkTheme
  /** CSS variables object for styling */
  cssVariables: Record<string, string>
  /** Whether the current chain has a custom theme */
  hasCustomTheme: boolean
}

/**
 * Hook for getting current network's theme colors
 *
 * Returns theme colors and CSS variables that can be applied
 * to elements for network-specific styling.
 *
 * @returns Network theme data and utilities
 *
 * @example
 * ```tsx
 * const { theme, cssVariables } = useNetworkTheme()
 *
 * // Apply as inline styles
 * <div style={cssVariables}>
 *   <span style={{ color: 'var(--network-primary)' }}>
 *     Connected to {theme.name}
 *   </span>
 * </div>
 * ```
 */
export function useNetworkTheme(): UseNetworkThemeReturn {
  const chainId = useChainId()

  return useMemo(() => {
    const customTheme = chainId ? getNetworkTheme(chainId) : undefined
    const theme = customTheme ?? DEFAULT_NETWORK_THEME

    const cssVariables: Record<string, string> = {
      [NETWORK_THEME_CSS_VARS.primary]: theme.primary,
      [NETWORK_THEME_CSS_VARS.secondary]: theme.secondary,
      [NETWORK_THEME_CSS_VARS.accent]: theme.accent,
      [NETWORK_THEME_CSS_VARS.glow]: theme.glow,
    }

    return {
      chainId,
      theme,
      cssVariables,
      hasCustomTheme: !!customTheme,
    }
  }, [chainId])
}
