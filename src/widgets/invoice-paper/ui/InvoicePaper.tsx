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

export const InvoicePaper = forwardRef<HTMLDivElement, InvoicePaperProps>(
  ({ data, status = 'pending', txHash, animated = true, className, containerRef }, ref) => {
    const totals = useMemo(() => {
      return calculateTotals(data.it || [], {
        tax: data.tax,
        discount: data.dsc,
      })
    }, [data.it, data.tax, data.dsc])

    const shadowClass = data.net ? NETWORK_SHADOWS[data.net] : 'shadow-black/20'

    // Format date for watermark if paid
    const paidDate =
      status === 'paid' && data.iss
        ? new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
            .format(new Date(data.iss * 1000))
            .toUpperCase()
        : undefined

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
            from={data.f || { n: '', a: '' }}
            invoiceId={data.id || ''}
            iss={data.iss || 0}
            due={data.due || 0}
            status={status}
            animated={animated}
          />

          <section className="grid grid-cols-2 gap-12 py-8">
            <PartyInfo client={data.c || { n: '' }} animated={animated} />

            <PaymentDetails
              networkId={data.net || 1}
              senderAddress={data.f?.a || ''}
              currency={data.cur || ''}
              tokenAddress={data.t}
              txHash={txHash}
              animated={animated}
            />
          </section>

          <LineItemsTable items={data.it || []} currency={data.cur || ''} />

          <PaperTotals totals={totals} currency={data.cur || ''} animated={animated} />

          <PaperFooter notes={data.nt} />
        </div>

        <Watermark status={status} date={paidDate} />
      </div>
    )
  }
)

InvoicePaper.displayName = 'InvoicePaper'
