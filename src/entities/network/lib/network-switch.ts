/**
 * Network Switch Utilities
 *
 * Hooks and utilities for switching between supported networks.
 * Integrates with Wagmi's useSwitchChain hook.
 */

import { useSwitchChain, useChainId } from 'wagmi'
import { useCallback } from 'react'
import type { Chain } from 'viem'

/**
 * Parameters for checking if network switch is allowed
 */
export interface CanSwitchNetworkParams {
  /** Whether the wallet is connected */
  isConnected: boolean
  /** Whether there are pending transactions */
  hasPendingTx: boolean
}

/**
 * Check if network switching is allowed
 *
 * Network switching should be blocked when:
 * - Wallet is not connected
 * - There are pending transactions
 *
 * @param params - Parameters for the check
 * @returns True if network switch is allowed
 */
export function canSwitchNetwork(params: CanSwitchNetworkParams): boolean {
  const { isConnected, hasPendingTx } = params
  return isConnected && !hasPendingTx
}

/**
 * Return type for useNetworkSwitch hook
 */
export interface UseNetworkSwitchReturn {
  /** Function to switch to a specific chain */
  switchToChain: (chainId: number) => void
  /** Whether a network switch is in progress */
  isSwitching: boolean
  /** Current connected chain ID */
  currentChainId: number | undefined
  /** Error from the last switch attempt */
  error: Error | null
  /** Available chains from the config */
  chains: readonly Chain[]
}

/**
 * Hook for network switching functionality
 *
 * Provides a simplified interface for switching networks with
 * status tracking and error handling.
 *
 * @returns Network switch utilities
 */
export function useNetworkSwitch(): UseNetworkSwitchReturn {
  const { switchChain, isPending, error, chains } = useSwitchChain()
  const currentChainId = useChainId()

  const switchToChain = useCallback(
    (chainId: number) => {
      if (switchChain) {
        switchChain({ chainId })
      }
    },
    [switchChain]
  )

  return {
    switchToChain,
    isSwitching: isPending,
    currentChainId,
    error: error ?? null,
    chains,
  }
}
