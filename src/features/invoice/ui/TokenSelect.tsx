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
  // Get available tokens for current network
  const availableTokens = React.useMemo(() => {
    return NETWORK_TOKENS[chainId] || []
  }, [chainId])

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
        const token = availableTokens.find((t) => t.symbol === symbol && t.address === address)
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
        // TODO: Implement custom token entry (Phase 6)
        return
      }

      const token = deserializeToken(serializedValue)
      if (token) {
        onChange(token)
      }
    },
    [deserializeToken, onChange]
  )

  const selectedValue = serializeToken(value)

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('w-[200px]', className)}>
        <SelectValue>
          {value && (
            <div className="flex items-center gap-2">
              <div className={cn('h-5 w-5 rounded-full', value.iconColor)} />
              <span>{value.symbol}</span>
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
                <div className={cn('h-5 w-5 rounded-full', token.iconColor)} />
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
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-500">
                +
              </div>
              <span>Custom Token</span>
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
