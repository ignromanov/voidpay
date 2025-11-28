/**
 * Network Mismatch Detection
 *
 * Utilities for detecting when the connected network doesn't match
 * the invoice's expected network.
 */

import { useChainId } from 'wagmi'
import { useMemo } from 'react'
import { getChainById } from '../config/chains'

/**
 * Parameters for network mismatch detection
 */
export interface DetectNetworkMismatchParams {
  /** Chain ID specified in the invoice */
  invoiceChainId: number
  /** Currently connected chain ID (undefined if not connected) */
  connectedChainId: number | undefined
}

/**
 * Result of network mismatch detection
 */
export interface NetworkMismatchResult {
  /** Whether there is a network mismatch */
  hasMismatch: boolean
  /** Expected chain ID (from invoice) */
  expectedChainId: number
  /** Actual connected chain ID */
  actualChainId: number | undefined
  /** Expected chain name */
  expectedChainName: string
  /** Actual chain name */
  actualChainName: string | undefined
}

/**
 * Detect if there's a mismatch between invoice network and connected network
 *
 * @param params - Invoice and connected chain IDs
 * @returns Mismatch detection result with chain details
 */
export function detectNetworkMismatch(
  params: DetectNetworkMismatchParams
): NetworkMismatchResult {
  const { invoiceChainId, connectedChainId } = params

  const expectedChain = getChainById(invoiceChainId)
  const actualChain = connectedChainId ? getChainById(connectedChainId) : undefined

  return {
    hasMismatch: invoiceChainId !== connectedChainId,
    expectedChainId: invoiceChainId,
    actualChainId: connectedChainId,
    expectedChainName: expectedChain?.name ?? 'Unknown',
    actualChainName: actualChain?.name,
  }
}

/**
 * Hook for network mismatch detection
 *
 * Automatically detects when the connected network doesn't match
 * the expected invoice network.
 *
 * @param invoiceChainId - Chain ID from the invoice
 * @returns Network mismatch detection result
 */
export function useNetworkMismatch(invoiceChainId: number): NetworkMismatchResult {
  const connectedChainId = useChainId()

  return useMemo(
    () =>
      detectNetworkMismatch({
        invoiceChainId,
        connectedChainId,
      }),
    [invoiceChainId, connectedChainId]
  )
}
