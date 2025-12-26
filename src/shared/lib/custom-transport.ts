/**
 * Custom HTTP Transport for Wagmi
 *
 * Routes ALL RPC calls through /api/rpc proxy to prevent client-side
 * API key exposure (Constitutional Principle VI - RPC Key Protection).
 *
 * @see https://viem.sh/docs/clients/transports/http.html
 */

import { http } from 'viem'
import type { Transport } from 'viem'

/**
 * Creates a custom HTTP transport that routes requests through /api/rpc
 *
 * @param chainId - The chain ID to include in the request
 * @returns A viem-compatible transport factory function
 */
export function createCustomTransport(chainId: number): Transport {
  return http(`/api/rpc?chainId=${chainId}`, {
    // Default retry configuration
    retryCount: 3,
    retryDelay: 150,
    // Timeout after 10 seconds
    timeout: 10_000,
    // Fetch options
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })
}

/**
 * Creates a transport for a specific chain
 *
 * This is a convenience wrapper that creates the custom transport
 * with the correct chain ID for use in Wagmi config.
 *
 * @param chainId - The chain ID
 * @returns A viem-compatible transport
 */
export function createChainTransport(chainId: number): Transport {
  return createCustomTransport(chainId)
}

/**
 * Creates a map of transports for multiple chains
 *
 * @param chainIds - Array of chain IDs
 * @returns Record mapping chain IDs to their transports
 */
export function createTransportsForChains(chainIds: number[]): Record<number, Transport> {
  const transports: Record<number, Transport> = {}

  for (const chainId of chainIds) {
    transports[chainId] = createCustomTransport(chainId)
  }

  return transports
}
