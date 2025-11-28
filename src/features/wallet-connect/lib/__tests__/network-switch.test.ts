/**
 * T030-test: Unit test for network switching logic
 *
 * Tests the hook and utilities for switching between networks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Create a mock switchChain function
const mockSwitchChain = vi.fn()

// Mock wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useSwitchChain: vi.fn(() => ({
      switchChain: mockSwitchChain,
      isPending: false,
      error: null,
      chains: [],
    })),
    useChainId: vi.fn(() => 1),
  }
})

describe('network-switch', () => {
  beforeEach(() => {
    mockSwitchChain.mockClear()
  })

  describe('useNetworkSwitch', () => {
    it('should export useNetworkSwitch hook', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      expect(useNetworkSwitch).toBeDefined()
      expect(typeof useNetworkSwitch).toBe('function')
    })

    it('should return switchToChain function', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      const { result } = renderHook(() => useNetworkSwitch())

      expect(result.current.switchToChain).toBeDefined()
      expect(typeof result.current.switchToChain).toBe('function')
    })

    it('should return isSwitching state', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      const { result } = renderHook(() => useNetworkSwitch())

      expect(typeof result.current.isSwitching).toBe('boolean')
    })

    it('should return current chain ID', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      const { result } = renderHook(() => useNetworkSwitch())

      expect(result.current.currentChainId).toBeDefined()
      expect(typeof result.current.currentChainId).toBe('number')
    })

    it('should return error state', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      const { result } = renderHook(() => useNetworkSwitch())

      expect('error' in result.current).toBe(true)
    })

    it('should call switchChain when switchToChain is called', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      const { result } = renderHook(() => useNetworkSwitch())

      act(() => {
        result.current.switchToChain(137)
      })

      expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 137 })
    })

    it('should return chains array', async () => {
      const { useNetworkSwitch } = await import('../network-switch')
      const { result } = renderHook(() => useNetworkSwitch())

      expect(result.current.chains).toBeDefined()
      expect(Array.isArray(result.current.chains)).toBe(true)
    })
  })

  describe('canSwitchNetwork', () => {
    it('should export canSwitchNetwork utility', async () => {
      const { canSwitchNetwork } = await import('../network-switch')
      expect(canSwitchNetwork).toBeDefined()
    })

    it('should return true when connected and no pending transactions', async () => {
      const { canSwitchNetwork } = await import('../network-switch')
      const result = canSwitchNetwork({ isConnected: true, hasPendingTx: false })
      expect(result).toBe(true)
    })

    it('should return false when not connected', async () => {
      const { canSwitchNetwork } = await import('../network-switch')
      const result = canSwitchNetwork({ isConnected: false, hasPendingTx: false })
      expect(result).toBe(false)
    })

    it('should return false when there are pending transactions', async () => {
      const { canSwitchNetwork } = await import('../network-switch')
      const result = canSwitchNetwork({ isConnected: true, hasPendingTx: true })
      expect(result).toBe(false)
    })
  })
})
