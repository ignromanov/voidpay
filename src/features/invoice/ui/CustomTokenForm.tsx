'use client'

import * as React from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Loader2Icon, SearchIcon, AlertCircleIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'
import { useTokenMetadata } from '@/entities/token'
import type { TokenInfo } from '@/entities/network'
import { type Address } from 'viem'

export interface CustomTokenFormProps {
  /** Chain ID for token metadata lookup */
  chainId: number
  /** Handler called when token is added */
  onSubmit: (token: TokenInfo) => void
  /** Handler called when form is cancelled */
  onCancel: () => void
  /** Additional CSS classes */
  className?: string | undefined
}

/**
 * Form for entering custom ERC-20 token address
 *
 * Fetches token metadata (symbol, decimals) from the blockchain
 * and validates the address before allowing submission.
 */
export function CustomTokenForm({
  chainId,
  onSubmit,
  onCancel,
  className,
}: CustomTokenFormProps) {
  const [customAddress, setCustomAddress] = React.useState('')

  // Fetch custom token metadata
  const {
    data: customTokenMetadata,
    isLoading: isLoadingMetadata,
    isError: hasMetadataError,
  } = useTokenMetadata(customAddress as Address, chainId)

  const handleSubmit = React.useCallback(() => {
    if (!customTokenMetadata) return

    onSubmit({
      symbol: customTokenMetadata.symbol ?? '',
      name: customTokenMetadata.name ?? '',
      address: customAddress as `0x${string}`,
      decimals: customTokenMetadata.decimals ?? 18,
      iconColor: 'bg-zinc-700', // Default color for custom tokens
      isCustom: true, // Mark as custom/unverified
    })
  }, [customTokenMetadata, customAddress, onSubmit])

  return (
    <div
      className={cn('space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4', className)}
    >
      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
          Contract Address
        </label>
        <div className="relative">
          <Input
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            placeholder="0x..."
            className="font-mono text-xs"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {isLoadingMetadata ? (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin text-violet-500" />
            ) : (
              <SearchIcon className="h-3.5 w-3.5 text-zinc-600" />
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingMetadata && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Symbol
            </label>
            <div className="h-10 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/50" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Decimals
            </label>
            <div className="h-10 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/50" />
          </div>
        </div>
      )}

      {/* Metadata Display */}
      {!isLoadingMetadata && customTokenMetadata && !hasMetadataError && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Symbol
            </label>
            <input
              className="flex w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              value={customTokenMetadata.symbol ?? ''}
              readOnly
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Decimals
            </label>
            <input
              className="flex w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              value={customTokenMetadata.decimals ?? ''}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoadingMetadata && hasMetadataError && customAddress && (
        <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/20 p-3">
          <AlertCircleIcon className="h-4 w-4 shrink-0 text-red-500" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-red-400">Invalid Token Address</p>
            <p className="text-xs text-red-500/80">
              Unable to fetch token metadata. Please verify the address is correct and is an
              ERC-20 token.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="flex-1 text-xs font-medium text-zinc-400 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={!customAddress || !customTokenMetadata || isLoadingMetadata}
          className="flex-1 bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          Add Token
        </Button>
      </div>
    </div>
  )
}
