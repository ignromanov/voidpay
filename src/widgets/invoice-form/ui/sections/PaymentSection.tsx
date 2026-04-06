'use client'

import { useCallback, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { CoinsIcon } from '@/shared/ui/icons'

import { useCreatorStore } from '@/entities/creator'
import { getNetworkThemeName, findTokenForNetwork, NETWORK_TOKENS } from '@/entities/network'
import { Heading } from '@/shared/ui/typography'
import { NetworkSelect } from '@/features/wallet-connect'
import type { TokenInfo } from '@/entities/network'
import { TokenSelect } from '@/features/invoice'
import { formatAmount, parseAmount } from '@/shared/lib/amount-utils'

import type { InvoiceFormValues } from '../../lib/use-invoice-form'

export interface PaymentSectionProps {
  form: UseFormReturn<InvoiceFormValues>
}

/**
 * Payment section: Network and Token selects.
 */
export function PaymentSection({ form }: PaymentSectionProps) {
  const { setValue, watch } = form

  const networkId = watch('networkId')
  const currency = watch('currency')
  const tokenAddress = watch('tokenAddress')
  const decimals = watch('decimals')

  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const lineItems = useCreatorStore((s) => s.lineItems)
  const updateLineItems = useCreatorStore((s) => s.updateLineItems)

  // Re-convert line item rates when token decimals change.
  // Rates are stored as atomic units tied to current decimals,
  // so switching tokens requires conversion: old atomic → human → new atomic.
  const reconvertLineItemRates = useCallback(
    (oldDecimals: number, newDecimals: number) => {
      if (oldDecimals === newDecimals) return
      if (lineItems.length === 0) return

      const hasNonZeroRate = lineItems.some((item) => item.rate && item.rate !== '0' && item.rate !== '')
      if (!hasNonZeroRate) return

      const reconverted = lineItems.map((item) => {
        if (!item.rate || item.rate === '0' || item.rate === '') return item
        const human = formatAmount(item.rate, oldDecimals, { useGrouping: false, displayDecimals: oldDecimals })
        const newRate = parseAmount(human, newDecimals)
        return { ...item, rate: newRate }
      })

      updateLineItems(reconverted)
    },
    [lineItems, updateLineItems]
  )

  // Memoize token value to prevent unnecessary re-renders
  const tokenValue = useMemo(
    () =>
      currency
        ? {
            symbol: currency,
            address: (tokenAddress || null) as `0x${string}` | null,
            decimals: decimals || 18,
            name: currency,
            iconColor: 'bg-violet-500' as const,
          }
        : null,
    [currency, tokenAddress, decimals]
  )

  // Token change handler — also re-converts line item rates if decimals differ
  const handleTokenChange = useCallback(
    (token: TokenInfo) => {
      const oldDecimals = decimals || 18
      reconvertLineItemRates(oldDecimals, token.decimals)
      setValue('currency', token.symbol)
      setValue('tokenAddress', token.address ?? '')
      setValue('decimals', token.decimals)
    },
    [setValue, decimals, reconvertLineItemRates]
  )

  // Network change handler (also updates theme)
  const handleNetworkChange = useCallback(
    (chainId: number) => {
      setValue('networkId', chainId)
      const theme = getNetworkThemeName(chainId)
      setNetworkTheme(theme)

      // Auto-select USDC for the new network
      const usdcToken = findTokenForNetwork(chainId, 'USDC')
      const fallbackToken = NETWORK_TOKENS[chainId]?.[0]
      const token = usdcToken ?? fallbackToken
      if (token) {
        handleTokenChange(token)
      }
    },
    [setValue, setNetworkTheme, handleTokenChange]
  )

  return (
    <div className="space-y-4 border-t border-zinc-800/50 pt-4">
      <div className="mb-2 flex items-center gap-2">
        <CoinsIcon size={16} className="text-zinc-500" />
        <Heading variant="h4" className="text-zinc-500">
          Token & Network
        </Heading>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="network-select" className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
          Network
        </label>
        <NetworkSelect id="network-select" value={networkId || 42161} onChange={handleNetworkChange} className="w-full" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="token-select" className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
          Token
        </label>
        <TokenSelect
          id="token-select"
          chainId={networkId || 42161}
          value={tokenValue}
          onChange={handleTokenChange}
          className="w-full"
        />
      </div>
    </div>
  )
}
