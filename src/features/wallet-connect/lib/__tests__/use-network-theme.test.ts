/**
 * T041-test: Unit test for useNetworkTheme hook
 *
 * Tests the hook that provides current network's theme colors.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock wagmi
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useChainId: vi.fn(() => 1), // Default to Ethereum
  }
})

describe('use-network-theme', () => {
  describe('useNetworkTheme', () => {
    it('should export useNetworkTheme hook', async () => {
      const networkThemeModule = await import('../use-network-theme')
      expect(networkThemeModule.useNetworkTheme).toBeDefined()
    })

    it('should return theme colors for connected network', async () => {
      const { useNetworkTheme } = await import('../use-network-theme')
      const { result } = renderHook(() => useNetworkTheme())

      expect(result.current.theme).toBeDefined()
      expect(result.current.theme.primary).toBeDefined()
      expect(result.current.theme.secondary).toBeDefined()
    })

    it('should return chain ID', async () => {
      const { useNetworkTheme } = await import('../use-network-theme')
      const { result } = renderHook(() => useNetworkTheme())

      expect(result.current.chainId).toBe(1)
    })

    it('should return CSS variables object', async () => {
      const { useNetworkTheme } = await import('../use-network-theme')
      const { result } = renderHook(() => useNetworkTheme())

      expect(result.current.cssVariables).toBeDefined()
      expect(result.current.cssVariables['--network-primary']).toBeDefined()
    })
  })
})
