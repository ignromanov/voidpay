/**
 * OG Invoice Card — Reusable card component for OG image screenshots.
 *
 * Browser-rendered (Tailwind) version of the invoice card.
 * Used by /og-image page for Playwright screenshots.
 *
 * KEEP IN SYNC with the Satori version in render.tsx:renderInvoiceOG
 * (Satori requires inline styles, so the card is implemented twice)
 */

import { OG_NETWORKS, formatDisplayAmount } from '../lib/og-utils'

export interface OGInvoiceCardProps {
  id: string
  amount: string
  currency: string
  networkCode: string
  from?: string
  to?: string
  /** CSS transform for stacking effect */
  tilt?: string
  /** Card width override (default: 400) */
  width?: number
}

export function OGInvoiceCard({
  id,
  amount,
  currency,
  networkCode,
  from,
  to,
  tilt,
  width = 400,
}: OGInvoiceCardProps) {
  const net = OG_NETWORKS[networkCode] ?? { name: networkCode.toUpperCase(), color: '#A1A1AA' }

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-xl"
      style={{
        width,
        padding: `${width * 0.07}px ${width * 0.08}px`,
        background: 'linear-gradient(145deg, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.99) 100%)',
        border: '1px solid rgba(63,63,70,0.6)',
        boxShadow: `0 20px 60px -12px rgba(0,0,0,0.7), 0 0 40px -15px ${net.color}20`,
        transform: tilt ?? 'none',
      }}
    >
      {/* Top gradient bar — matches PaymentPanel */}
      <div
        className="absolute top-0 right-0 left-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${net.color}80, transparent)`,
        }}
      />

      {/* Header: Invoice ID + Network badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: '#7C3AED', boxShadow: '0 0 6px rgba(124,58,237,0.5)' }}
          />
          <span
            className="font-mono text-[11px] font-medium tracking-wider text-zinc-500 uppercase"
          >
            {id}
          </span>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
          style={{
            color: net.color,
            border: `1px solid ${net.color}25`,
            background: `${net.color}10`,
          }}
        >
          {net.name}
        </span>
      </div>

      {/* Amount + Currency */}
      <div className="mb-1 flex items-baseline gap-2.5">
        <span
          className="truncate font-mono font-extrabold tabular-nums leading-none text-zinc-100"
          style={{ fontSize: amount.length > 10 ? width * 0.075 : width * 0.1, letterSpacing: '-0.02em', maxWidth: width * 0.8 }}
        >
          {formatDisplayAmount(amount)}
        </span>
        <span
          className="shrink-0 font-medium text-zinc-500"
          style={{ fontSize: width * 0.05 }}
        >
          {currency}
        </span>
      </div>

      {/* From / To row */}
      {(from || to) && (
        <div
          className="mt-3 flex min-w-0 items-center gap-4 border-t pt-3"
          style={{ borderColor: 'rgba(63,63,70,0.3)' }}
        >
          {from && (
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[10px] text-zinc-600">from</span>
              <span className="truncate text-[12px] font-medium text-zinc-400">{from}</span>
            </div>
          )}
          {from && to && <div className="h-3 w-px shrink-0 bg-zinc-800" />}
          {to && (
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[10px] text-zinc-600">to</span>
              <span className="truncate text-[12px] font-medium text-zinc-400">{to}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
