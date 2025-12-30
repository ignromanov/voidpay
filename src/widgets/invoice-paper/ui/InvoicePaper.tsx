import React, { useMemo, forwardRef } from 'react'
import type { Address } from 'viem'
import { InvoicePaperProps } from '../types'
import { calculateTotals } from '../lib/calculate-totals'
import { PaperHeader } from './PaperHeader'
import { PartyInfo } from './PartyInfo'
import { LineItemsTable } from './LineItemsTable'
import { PaperTotals } from './PaperTotals'
import { PaperFooter } from './PaperFooter'
import { Watermark } from './Watermark'
import { NETWORK_SHADOWS } from '@/entities/network/config/ui-config'
import { cn } from '@/shared/lib/utils'

// Stable fallback objects (prevent new object creation on each render)
// Uses zero address as fallback for draft invoices
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address
const EMPTY_PARTY = { name: '', walletAddress: ZERO_ADDRESS } as const
const EMPTY_CLIENT = { name: '' } as const
const EMPTY_ITEMS: never[] = []

// Date formatter singleton
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

// Variant-specific styles
const VARIANT_STYLES = {
  full: 'p-12', // Interactive mode
  default: 'p-12', // Standard mode
  print: 'p-8 print:p-6', // Print-optimized
} as const

export const InvoicePaper = React.memo(
  forwardRef<HTMLElement, InvoicePaperProps>(
    (
      {
        data,
        status = 'pending',
        txHash,
        txHashValidated = true,
        variant = 'default',
        responsive = false,
        showQR = true,
        showTexture = true,
        className,
        containerRef,
      },
      ref
    ) => {
      const totals = useMemo(
        () =>
          calculateTotals(data.items ?? EMPTY_ITEMS, {
            tax: data.tax,
            discount: data.discount,
          }),
        [data.items, data.tax, data.discount]
      )

      const shadowClass = data.networkId ? NETWORK_SHADOWS[data.networkId] : 'shadow-black/20'

      // Memoize stable props to prevent child re-renders
      const from = data.from ?? EMPTY_PARTY
      const client = data.client ?? EMPTY_CLIENT
      const items = data.items ?? EMPTY_ITEMS

      // Format date for watermark if paid
      const paidDate = useMemo(
        () =>
          status === 'paid' && data.issuedAt
            ? dateFormatter.format(new Date(data.issuedAt * 1000)).toUpperCase()
            : undefined,
        [status, data.issuedAt]
      )

      // Determine if QR should be shown based on variant
      const shouldShowQR = showQR && variant !== 'print'

      return (
        <article
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            if (containerRef) containerRef.current = node
          }}
          className={cn(
            // Base styles - responsive by default with aspect-ratio
            'group/paper relative flex aspect-[794/1123] w-full max-w-[794px] origin-top flex-col overflow-hidden bg-white text-black transition-shadow duration-500',
            'shadow-2xl print:aspect-auto print:h-full print:min-h-0 print:w-full print:min-w-0 print:scale-100 print:shadow-none',
            shadowClass,
            // Legacy scaling support (optional)
            !responsive && 'h-[1123px] min-h-[1123px] w-[794px] min-w-[794px]',
            responsive && 'origin-top-left',
            className
          )}
          role="document"
          aria-label={`Invoice ${data.invoiceId ?? 'draft'}`}
        >
          {/* Texture Layer - self-hosted for stateless operation */}
          {showTexture && (
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-[url('/textures/cream-pixels.png')] opacity-[0.08] mix-blend-multiply print:hidden"
              aria-hidden="true"
            />
          )}

          {/* Content Container */}
          <div className={cn('relative z-10 flex h-full flex-col', VARIANT_STYLES[variant])}>
            <PaperHeader
              invoiceId={data.invoiceId ?? ''}
              iss={data.issuedAt ?? 0}
              due={data.dueAt ?? 0}
              status={status}
              txHashValidated={txHashValidated}
            />

            {/* Parties Section - From and Bill To */}
            <section className="py-6 md:py-8" aria-label="Invoice parties">
              <PartyInfo from={from} client={client} variant={variant} />
            </section>

            <LineItemsTable items={items} />

            <PaperTotals
              totals={totals}
              currency={data.currency ?? ''}
              taxPercent={data.tax}
              discountPercent={data.discount}
              showQR={shouldShowQR}
              networkId={data.networkId ?? 1}
              senderAddress={from.walletAddress}
              tokenAddress={data.tokenAddress}
              txHash={txHash}
              txHashValidated={txHashValidated}
              variant={variant}
              status={status}
            />

            <PaperFooter notes={data.notes} />
          </div>

          <Watermark status={status} date={paidDate} />

          {/* Screen reader status announcement */}
          <div className="sr-only" role="status" aria-live="polite">
            Invoice status: {status}
            {status === 'paid' && paidDate && `, paid on ${paidDate}`}
          </div>
        </article>
      )
    }
  )
)

InvoicePaper.displayName = 'InvoicePaper'
