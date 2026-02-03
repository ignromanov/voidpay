'use client'

import { useCallback, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { CoinsIcon } from '@/shared/ui/icons'

import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import { Heading } from '@/shared/ui/typography'
import { NetworkSelect } from '@/features/wallet-connect'
import { TokenSelect, type TokenInfo } from '@/features/invoice'

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

  // Memoize token value to prevent unnecessary re-renders
  const tokenValue = useMemo(
    () =>
      currency
        ? {
            symbol: currency,
            address: tokenAddress ?? null,
            decimals: decimals || 18,
            name: currency,
            iconColor: 'bg-violet-500' as const,
          }
        : null,
    [currency, tokenAddress, decimals]
  )

  // Network change handler (also updates theme)
  const handleNetworkChange = useCallback(
    (chainId: number) => {
      setValue('networkId', chainId)
      const theme = getNetworkTheme(chainId)
      setNetworkTheme(theme)
    },
    [setValue, setNetworkTheme]
  )

  // Token change handler
  const handleTokenChange = useCallback(
    (token: TokenInfo) => {
      setValue('currency', token.symbol)
      setValue('tokenAddress', token.address ?? undefined)
      setValue('decimals', token.decimals)
    },
    [setValue]
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
