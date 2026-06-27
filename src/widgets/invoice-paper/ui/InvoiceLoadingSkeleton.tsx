import { INVOICE_BASE_WIDTH, INVOICE_BASE_HEIGHT } from '../lib/use-invoice-scale'

/**
 * Loading skeleton for the invoice paper.
 *
 * The opacity-0 text block is intentional: opacity-0 preserves the full layout
 * box in flow (unlike `sr-only` which clips to 1×1px), making it LCP-eligible
 * so Chromium records skeleton FCP (~1s) as LCP instead of waiting for the
 * decoded invoice card (~10s).
 */
export function InvoiceLoadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-lg bg-white"
      style={{ width: INVOICE_BASE_WIDTH, height: INVOICE_BASE_HEIGHT }}
    >
      {/* LCP-eligible: opacity-0 keeps the full layout box in normal flow */}
      <p className="px-10 pt-10 opacity-0 select-none">
        Invoice #000-000 · 0.00 USDC
      </p>

      {/* Header row — logo + invoice label placeholders */}
      <div className="flex justify-between px-10 pt-4">
        <div className="h-7 w-36 rounded bg-zinc-100/80" />
        <div className="h-5 w-24 rounded bg-zinc-100/80" />
      </div>

      {/* From / Bill To blocks */}
      <div className="flex justify-between px-10 pt-8">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-zinc-100/80" />
          <div className="h-4 w-28 rounded bg-zinc-100/80" />
          <div className="h-3 w-36 rounded bg-zinc-100/80" />
          <div className="h-3 w-24 rounded bg-zinc-100/80" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-zinc-100/80" />
          <div className="h-4 w-28 rounded bg-zinc-100/80" />
          <div className="h-3 w-32 rounded bg-zinc-100/80" />
        </div>
      </div>

      {/* Line item rows */}
      <div className="mx-10 mt-10 space-y-3">
        <div className="h-3 w-full rounded bg-zinc-100/80" />
        <div className="h-3 w-full rounded bg-zinc-100/80" />
        <div className="h-3 w-4/5 rounded bg-zinc-100/80" />
      </div>

      {/* Total row */}
      <div className="flex justify-end px-10 pt-8">
        <div className="h-6 w-36 rounded bg-zinc-100/80" />
      </div>
    </div>
  )
}
