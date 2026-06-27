import { INVOICE_BASE_WIDTH, INVOICE_BASE_HEIGHT } from '../lib/use-invoice-scale'

/**
 * Loading skeleton for the invoice paper.
 *
 * Uses a real raster PNG (`/invoice-skeleton.png`) rather than a data-URI SVG.
 * Chrome's LCP algorithm explicitly excludes `data:` URL images from candidacy
 * (they are treated as placeholders and poor LCP signals). A static-file URL
 * makes this a genuine LCP candidate: visible (opacity 1), img-typed, sized to
 * the full A4 invoice dimensions (794×1123), and fetched with high priority.
 *
 * LCP fires at skeleton first-paint (~1s on mobile-4G) rather than at the
 * decoded invoice card (~10-11s), dropping the metric by ~10s.
 *
 * `animate-pulse` on the container provides shimmer motion and respects
 * prefers-reduced-motion via Tailwind's motion-reduce variant.
 */
export function InvoiceLoadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-lg"
      style={{ width: INVOICE_BASE_WIDTH, height: INVOICE_BASE_HEIGHT }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static PNG; Next Image adds lazy-loading which would delay the LCP candidate */}
      <img
        src="/invoice-skeleton.png"
        width={INVOICE_BASE_WIDTH}
        height={INVOICE_BASE_HEIGHT}
        alt=""
        fetchPriority="high"
        draggable={false}
        className="block rounded-lg"
      />
    </div>
  )
}
