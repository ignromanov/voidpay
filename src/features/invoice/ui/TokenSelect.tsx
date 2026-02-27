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
import { NETWORK_TOKENS, type TokenInfo } from '@/entities/network'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { TokenIcon } from '@/shared/ui/token-icon'
import { addressesMatch } from '@/shared/lib/validation'
import { CustomTokenForm } from './CustomTokenForm'

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

  /** HTML id for label association */
  id?: string
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
  id,
}: TokenSelectProps) {
  // Custom token mode state
  const [isCustomMode, setIsCustomMode] = React.useState(false)

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
        const token = availableTokens.find(
          (t) => t.symbol === symbol && addressesMatch(t.address, address)
        )
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

  const handleCustomSubmit = React.useCallback(
    (token: TokenInfo) => {
      onChange(token)
      setIsCustomMode(false)
    },
    [onChange]
  )

  const handleCustomCancel = React.useCallback(() => {
    setIsCustomMode(false)
  }, [])

  const selectedValue = serializeToken(value)

  // Check if current value is a custom token (case-insensitive address comparison)
  const isCustomToken =
    value &&
    !availableTokens.find(
      (t) => t.symbol === value.symbol && addressesMatch(t.address, value.address)
    )

  if (isCustomMode) {
    return (
      <CustomTokenForm
        chainId={chainId}
        onSubmit={handleCustomSubmit}
        onCancel={handleCustomCancel}
        className={className}
      />
    )
  }

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger id={id} variant="glass" className={cn('w-[200px]', className)}>
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
                  <span className="font-bold leading-none">{value.symbol}</span>
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
