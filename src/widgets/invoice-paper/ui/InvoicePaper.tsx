import React, { useMemo, forwardRef } from 'react'
import type { Address } from 'viem'
import { FileText } from 'lucide-react'
import { InvoicePaperProps } from '../types'
import { calculateTotals } from '../lib/calculate-totals'
import { PaperHeader } from './PaperHeader'
import { PartyInfo } from './PartyInfo'
import { LineItemsTable } from './LineItemsTable'
import { PaperTotals } from './PaperTotals'
import { PaperFooter } from './PaperFooter'
import { Watermark } from './Watermark'
import { NETWORK_GLOWS, NETWORK_SHADOWS } from '@/entities/network'
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
// For full variant: cursor-text on text elements, cursor-pointer on links
// Print overrides: reduced padding for A4 margins
const VARIANT_STYLES = {
  full: 'p-12 print:p-8 [&_p]:cursor-text [&_span]:cursor-text [&_td]:cursor-text [&_th]:cursor-text [&_address]:cursor-text [&_a]:cursor-pointer',
  default: 'p-12 print:p-8', // Standard mode with print padding
  print: 'p-8 print:p-6', // Print-optimized (even smaller padding)
} as const

/**
 * Empty state content shown when data is undefined
 */
function EmptyStateContent() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-16">
      <div className="flex flex-col items-center gap-10 text-center">
        {/* Icon — larger for scale compensation */}
        <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-zinc-100">
          <FileText className="h-20 w-20 text-zinc-400" strokeWidth={1.5} />
        </div>

        {/* Text — larger for scale compensation */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-zinc-700">No Invoice Data</h2>
          <p className="max-w-[420px] text-lg text-zinc-500">
            Start creating your invoice or load one from a URL to see the preview here.
          </p>
        </div>

        {/* Hint — larger for scale compensation */}
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-4">
          <p className="text-base text-zinc-500">
            Fill in the form on the left to generate your invoice
          </p>
        </div>
      </div>
    </div>
  )
}

export const InvoicePaper = React.memo(
  forwardRef<HTMLElement, InvoicePaperProps>(
    (
      {
        data,
        status = 'pending',
        txHash,
        txHashValidated = true,
        variant = 'default',
        showQR = true,
        showTexture = true,
        showGlow = false,
        invoiceUrl,
        className,
        containerRef,
      },
      ref
    ) => {
      // Check if data is empty (undefined or no meaningful content)
      const isEmpty = !data

      // Override status to 'empty' when no data
      const effectiveStatus = isEmpty ? 'empty' : status

      // Get glow configuration for network (default to Ethereum for empty state)
      const networkId = data?.networkId ?? 1
      const glowConfig = showGlow ? NETWORK_GLOWS[networkId] : null
      const shadowClass = NETWORK_SHADOWS[networkId] ?? 'shadow-black/20'

      const totals = useMemo(
        () =>
          isEmpty
            ? { subtotal: 0, taxAmount: 0, discountAmount: 0, total: 0, magicDust: 0 }
            : calculateTotals(data.items ?? EMPTY_ITEMS, {
                tax: data.tax,
                discount: data.discount,
              }),
        [isEmpty, data?.items, data?.tax, data?.discount]
      )

      // Memoize stable props to prevent child re-renders
      const from = data?.from ?? EMPTY_PARTY
      const client = data?.client ?? EMPTY_CLIENT
      const items = data?.items ?? EMPTY_ITEMS

      // Format date for watermark if paid
      const paidDate = useMemo(
        () =>
          status === 'paid' && data?.issuedAt
            ? dateFormatter.format(new Date(data.issuedAt * 1000)).toUpperCase()
            : undefined,
        [status, data?.issuedAt]
      )

      // Determine if QR should be shown based on variant
      const shouldShowQR = showQR && variant !== 'print'

      // Wrapper needed for glow effect (glow must be outside article for overflow)
      const content = (
        <article
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            if (containerRef) containerRef.current = node
          }}
          className={cn(
            // Fixed A4 dimensions (794×1123px) — scaling handled by ScaledInvoicePreview
            // cursor-default on paper background, content container overrides for variant="full"
            'group/paper relative flex h-[1123px] min-h-[1123px] w-[794px] min-w-[794px] cursor-default flex-col overflow-hidden bg-white text-black transition-shadow duration-500',
            // Print overrides — full size to enable flex layout (mt-auto needs height constraint)
            'shadow-2xl print:!h-full print:!min-h-0 print:!w-full print:!max-w-none print:!min-w-0 print:shadow-none print:transition-none',
            shadowClass,
            // Only apply className when no glow wrapper
            !showGlow && className
          )}
          role="document"
          aria-label={
            isEmpty ? 'Empty invoice placeholder' : `Invoice ${data?.invoiceId ?? 'draft'}`
          }
        >
          {/* Texture Layer - self-hosted for stateless operation */}
          {showTexture && (
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-[url('/textures/cream-pixels.png')] opacity-[0.08] mix-blend-multiply print:hidden"
              aria-hidden="true"
            />
          )}

          {/* Content - Empty state or invoice data */}
          {isEmpty ? (
            <>
              <EmptyStateContent />
              <Watermark status={effectiveStatus} />
            </>
          ) : (
            <>
              {/* Content Container */}
              <div className={cn('relative z-10 flex h-full flex-col', VARIANT_STYLES[variant])}>
                <PaperHeader
                  invoiceId={data.invoiceId ?? ''}
                  iss={data.issuedAt ?? 0}
                  due={data.dueAt ?? 0}
                  status={status}
                  txHashValidated={txHashValidated}
                  invoiceUrl={invoiceUrl}
                  variant={variant}
                />

                {/* Parties Section - From and Bill To */}
                <section className="py-8" aria-label="Invoice parties">
                  <PartyInfo from={from} client={client} variant={variant} />
                </section>

                <LineItemsTable items={items} />

                {/* Bottom section wrapper - mt-auto pushes Totals+Footer to bottom */}
                <div className="mt-auto">
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
              </div>

              <Watermark status={status} date={paidDate} />

              {/* Screen reader status announcement */}
              <div className="sr-only" role="status" aria-live="polite">
                Invoice status: {status}
                {status === 'paid' && paidDate && `, paid on ${paidDate}`}
              </div>
            </>
          )}
        </article>
      )

      // Wrap with glow effect if enabled
      if (showGlow && glowConfig) {
        return (
          <div className={cn('relative print:!flex print:!h-full print:!flex-col', className)}>
            {/* Network-colored glow effect */}
            <div
              className={cn(
                'pointer-events-none absolute -inset-[30%] z-[-1] rounded-full opacity-40 blur-[100px] transition-all duration-500 print:hidden',
                'bg-gradient-to-br',
                glowConfig.from,
                glowConfig.to
              )}
              aria-hidden="true"
            />
            {content}
          </div>
        )
      }

      return content
    }
  )
)

InvoicePaper.displayName = 'InvoicePaper'
