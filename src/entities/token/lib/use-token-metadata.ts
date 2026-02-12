'use client'

import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { type Address, erc20Abi } from 'viem'
import { isAddress } from 'viem'

export interface TokenMetadata {
  name: string | null
  symbol: string | null
  decimals: number | null
}

export interface UseTokenMetadataResult {
  data: TokenMetadata | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

/**
 * Fetches ERC-20 token metadata (name, symbol, decimals) from blockchain
 *
 * @param address - Token contract address
 * @param chainId - Chain ID to query
 * @returns Token metadata with loading/error states
 */
export function useTokenMetadata(
  address: Address | string | undefined,
  chainId: number | undefined
): UseTokenMetadataResult {
  // Validate address format
  const validAddress = useMemo(() => {
    if (!address) return undefined
    return isAddress(address) ? (address as Address) : undefined
  }, [address])

  const { data, isLoading, isError, error } = useReadContracts({
    contracts:
      validAddress && chainId
        ? [
            {
              address: validAddress,
              abi: erc20Abi,
              functionName: 'name',
              chainId,
            },
            {
              address: validAddress,
              abi: erc20Abi,
              functionName: 'symbol',
              chainId,
            },
            {
              address: validAddress,
              abi: erc20Abi,
              functionName: 'decimals',
              chainId,
            },
          ]
        : [],
    query: {
      enabled: !!validAddress && !!chainId,
    },
  })

  const metadata = useMemo<TokenMetadata | null>(() => {
    if (!data || data.length < 3) return null

    const nameResult = data[0]
    const symbolResult = data[1]
    const decimalsResult = data[2]

    // Check all results exist and succeeded
    if (!nameResult || !symbolResult || !decimalsResult) return null
    if (
      nameResult.status !== 'success' ||
      symbolResult.status !== 'success' ||
      decimalsResult.status !== 'success'
    ) {
      return null
    }

    return {
      name: nameResult.result as string,
      symbol: symbolResult.result as string,
      decimals: decimalsResult.result as number,
    }
  }, [data])

  return {
    data: metadata,
    isLoading,
    isError,
    error: error ?? null,
  }
}
