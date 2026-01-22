'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/shared/ui/select'
import { NETWORK_TOKENS, type TokenInfo } from '../model/tokens'
import { cn } from '@/shared/lib/utils'
import { useTokenMetadata } from '@/entities/token'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { TokenIcon } from '@/shared/ui/token-icon'
import { Loader2, Search, AlertCircle } from 'lucide-react'
import { type Address, isAddressEqual } from 'viem'

/**
 * Compare token addresses (case-insensitive)
 * Handles null (native token) and checksummed addresses
 */
function addressesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a === null && b === null) return true
  if (a === undefined && b === undefined) return true
  if (!a || !b) return false
  try {
    return isAddressEqual(a as Address, b as Address)
  } catch {
    return false
  }
}

/**
 * TokenSelect Component Props
 *
 * Constitutional Principle VII: Web3 Safety
 * - Filters tokens by network (chainId)
 * - Supports custom token entry with metadata fetch
 */
export interface TokenSelectProps {
  /** Chain ID to filter tokens */
  chainId: number

  /** Currently selected token */
  value: TokenInfo | null

  /** Selection change handler */
  onChange: (token: TokenInfo) => void

  /** Allow custom token entry (default: true) */
  allowCustom?: boolean

  /** Additional CSS classes */
  className?: string
}

/**
 * Token Selector with Network Filtering
 *
 * Displays available tokens for the selected network.
 * Supports custom token entry for unlisted tokens.
 *
 * @example
 * ```tsx
 * <TokenSelect
 *   chainId={1}
 *   value={selectedToken}
 *   onChange={(token) => setSelectedToken(token)}
 * />
 * ```
 */
export function TokenSelect({
  chainId,
  value,
  onChange,
  allowCustom = true,
  className,
}: TokenSelectProps) {
  // Custom token state
  const [isCustomMode, setIsCustomMode] = React.useState(false)
  const [customAddress, setCustomAddress] = React.useState('')

  // Get available tokens for current network
  const availableTokens = React.useMemo(() => {
    return NETWORK_TOKENS[chainId] || []
  }, [chainId])

  // Fetch custom token metadata
  const {
    data: customTokenMetadata,
    isLoading: isLoadingMetadata,
    isError: hasMetadataError,
  } = useTokenMetadata(customAddress as Address, chainId)

  // Serialize token for Select component (needs string value)
  const serializeToken = React.useCallback((token: TokenInfo | null): string => {
    if (!token) return ''
    return JSON.stringify({
      symbol: token.symbol,
      address: token.address,
    })
  }, [])

  // Deserialize token from Select value
  const deserializeToken = React.useCallback(
    (value: string): TokenInfo | null => {
      if (!value) return null

      try {
        const { symbol, address } = JSON.parse(value)
        const token = availableTokens.find((t) => t.symbol === symbol && addressesMatch(t.address, address))
        return token || null
      } catch {
        return null
      }
    },
    [availableTokens]
  )

  const handleValueChange = React.useCallback(
    (serializedValue: string) => {
      if (serializedValue === 'custom') {
        setIsCustomMode(true)
        return
      }

      const token = deserializeToken(serializedValue)
      if (token) {
        onChange(token)
      }
    },
    [deserializeToken, onChange]
  )

  const handleCustomSubmit = React.useCallback(() => {
    if (!customTokenMetadata) return

    onChange({
      symbol: customTokenMetadata.symbol ?? '',
      name: customTokenMetadata.name ?? '',
      address: customAddress,
      decimals: customTokenMetadata.decimals ?? 18,
      iconColor: 'bg-zinc-700', // Default color for custom tokens
      isCustom: true, // Mark as custom/unverified
    })

    setIsCustomMode(false)
    setCustomAddress('')
  }, [customTokenMetadata, customAddress, onChange])

  const handleCustomCancel = React.useCallback(() => {
    setIsCustomMode(false)
    setCustomAddress('')
  }, [])

  const selectedValue = serializeToken(value)

  // Check if current value is a custom token (case-insensitive address comparison)
  const isCustomToken =
    value && !availableTokens.find((t) => t.symbol === value.symbol && addressesMatch(t.address, value.address))

  if (isCustomMode) {
    return (
      <div
        className={cn('space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4', className)}
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Contract Address
          </label>
          <div className="relative">
            <Input
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-xs"
            />
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              {isLoadingMetadata ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
              ) : (
                <Search className="h-3.5 w-3.5 text-zinc-600" />
              )}
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoadingMetadata && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
                Symbol
              </label>
              <div className="h-10 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/50" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
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
              <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
                Symbol
              </label>
              <input
                className="flex w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                value={customTokenMetadata.symbol ?? ''}
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-wide text-zinc-400 uppercase">
                Decimals
              </label>
              <input
                className="flex w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                value={customTokenMetadata.decimals ?? ''}
                readOnly
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoadingMetadata && hasMetadataError && customAddress && (
          <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/20 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
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
            onClick={handleCustomCancel}
            className="flex-1 text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCustomSubmit}
            disabled={!customAddress || !customTokenMetadata || isLoadingMetadata}
            className="flex-1 bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            Add Token
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger variant="glass" className={cn('w-[200px]', className)}>
        <SelectValue>
          {value && (
            <div className="flex items-center gap-3">
              {isCustomToken ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-white">
                  ?
                </div>
              ) : (
                <TokenIcon symbol={value.symbol} size={24} />
              )}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className="leading-none font-bold">{value.symbol}</span>
                  {isCustomToken && (
                    <Badge
                      variant="outline"
                      className="border-yellow-700/50 bg-yellow-950/20 text-[10px] font-bold text-yellow-500"
                    >
                      Unverified
                    </Badge>
                  )}
                </div>
                <span className="mt-1 font-mono text-[10px] leading-none text-zinc-500">
                  {value.address
                    ? `${value.address.slice(0, 6)}...${value.address.slice(-4)}`
                    : 'Native Token'}
                </span>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableTokens.map((token) => {
          const tokenValue = serializeToken(token)
          return (
            <SelectItem key={tokenValue} value={tokenValue}>
              <div className="flex items-center gap-2">
                <TokenIcon symbol={token.symbol} size={24} />
                <div className="flex flex-col">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-xs text-zinc-500">{token.name}</span>
                </div>
              </div>
            </SelectItem>
          )
        })}

        {allowCustom && availableTokens.length > 0 && <SelectSeparator />}

        {allowCustom && (
          <SelectItem value="custom">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-zinc-600">
                <span className="text-xs">+</span>
              </div>
              <span>Add Custom Token</span>
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
