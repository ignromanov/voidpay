import React, { useMemo, forwardRef } from 'react'
import { InvoicePaperProps } from '../types'
import { calculateTotals } from '../lib/calculate-totals'
import { PaperHeader } from './PaperHeader'
import { PartyInfo } from './PartyInfo'
import { PaymentDetails } from './PaymentDetails'
import { LineItemsTable } from './LineItemsTable'
import { PaperTotals } from './PaperTotals'
import { PaperFooter } from './PaperFooter'
import { Watermark } from './Watermark'
import { NETWORK_SHADOWS } from '@/entities/network/config/ui-config'
import { cn } from '@/shared/lib/utils'

// Stable fallback objects (prevent new object creation on each render)
const EMPTY_PARTY = { n: '', a: '' } as const
const EMPTY_CLIENT = { n: '' } as const
const EMPTY_ITEMS: never[] = []

// Date formatter singleton
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const InvoicePaper = React.memo(
  forwardRef<HTMLDivElement, InvoicePaperProps>(
    ({ data, status = 'pending', txHash, className, containerRef }, ref) => {
      const totals = useMemo(
        () =>
          calculateTotals(data.it ?? EMPTY_ITEMS, {
            tax: data.tax,
            discount: data.dsc,
          }),
        [data.it, data.tax, data.dsc]
      )

      const shadowClass = data.net ? NETWORK_SHADOWS[data.net] : 'shadow-black/20'

      // Memoize stable props to prevent child re-renders
      const from = data.f ?? EMPTY_PARTY
      const client = data.c ?? EMPTY_CLIENT
      const items = data.it ?? EMPTY_ITEMS

      // Format date for watermark if paid
      const paidDate = useMemo(
        () =>
          status === 'paid' && data.iss
            ? dateFormatter.format(new Date(data.iss * 1000)).toUpperCase()
            : undefined,
        [status, data.iss]
      )

      return (
        <div
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            if (containerRef) containerRef.current = node
          }}
          className={cn(
            'group/paper relative flex h-[1123px] min-h-[1123px] w-[794px] min-w-[794px] origin-top flex-col overflow-hidden bg-white text-black transition-shadow duration-500',
            'shadow-2xl print:h-full print:min-h-0 print:w-full print:min-w-0 print:shadow-none',
            shadowClass,
            className
          )}
        >
          {/* Texture Layer */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-pixels.png')] opacity-10 mix-blend-multiply"></div>

          {/* Content Container */}
          <div className="relative z-10 flex h-full flex-col p-12">
            <PaperHeader
              from={from}
              invoiceId={data.id ?? ''}
              iss={data.iss ?? 0}
              due={data.due ?? 0}
              status={status}
            />

            <section className="grid grid-cols-2 gap-12 py-8">
              <PartyInfo client={client} />

              <PaymentDetails
                networkId={data.net ?? 1}
                senderAddress={from.a}
                currency={data.cur ?? ''}
                tokenAddress={data.t}
                txHash={txHash}
              />
            </section>

            <LineItemsTable items={items} currency={data.cur ?? ''} />

            <PaperTotals
              totals={totals}
              currency={data.cur ?? ''}
              taxPercent={data.tax}
              discountPercent={data.dsc}
            />

            <PaperFooter notes={data.nt} />
          </div>

          <Watermark status={status} date={paidDate} />
        </div>
      )
    }
  )
)

InvoicePaper.displayName = 'InvoicePaper'
