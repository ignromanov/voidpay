import { INVOICE_BASE_WIDTH, INVOICE_BASE_HEIGHT } from '../lib/use-invoice-scale'

// Pre-computed at module scope — no per-render allocation.
// <img> with a data-URI SVG is a first-class LCP candidate (visible, img-typed element).
// #e4e4e7 = Tailwind zinc-200 for skeleton bars on white background.
const W = INVOICE_BASE_WIDTH   // 794
const H = INVOICE_BASE_HEIGHT  // 1123

const SKELETON_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<rect width="${W}" height="${H}" fill="white"/>` +
  // Header row — logo block + invoice label
  `<rect x="40" y="40" width="144" height="28" rx="4" fill="#e4e4e7"/>` +
  `<rect x="610" y="44" width="96" height="20" rx="4" fill="#e4e4e7"/>` +
  // Divider
  `<rect x="40" y="96" width="714" height="1" fill="#e4e4e7"/>` +
  // From block
  `<rect x="40" y="112" width="56" height="10" rx="3" fill="#e4e4e7"/>` +
  `<rect x="40" y="130" width="120" height="14" rx="3" fill="#e4e4e7"/>` +
  `<rect x="40" y="152" width="152" height="10" rx="3" fill="#e4e4e7"/>` +
  `<rect x="40" y="170" width="104" height="10" rx="3" fill="#e4e4e7"/>` +
  // Bill To block (right column)
  `<rect x="440" y="112" width="56" height="10" rx="3" fill="#e4e4e7"/>` +
  `<rect x="440" y="130" width="120" height="14" rx="3" fill="#e4e4e7"/>` +
  `<rect x="440" y="152" width="136" height="10" rx="3" fill="#e4e4e7"/>` +
  // Divider
  `<rect x="40" y="210" width="714" height="1" fill="#e4e4e7"/>` +
  // Line items header row
  `<rect x="40" y="230" width="80" height="10" rx="3" fill="#e4e4e7"/>` +
  `<rect x="560" y="230" width="56" height="10" rx="3" fill="#e4e4e7"/>` +
  `<rect x="658" y="230" width="96" height="10" rx="3" fill="#e4e4e7"/>` +
  // Line item 1
  `<rect x="40" y="260" width="400" height="12" rx="3" fill="#e4e4e7"/>` +
  `<rect x="560" y="260" width="48" height="12" rx="3" fill="#e4e4e7"/>` +
  `<rect x="658" y="260" width="96" height="12" rx="3" fill="#e4e4e7"/>` +
  // Line item 2
  `<rect x="40" y="292" width="320" height="12" rx="3" fill="#e4e4e7"/>` +
  `<rect x="560" y="292" width="48" height="12" rx="3" fill="#e4e4e7"/>` +
  `<rect x="658" y="292" width="96" height="12" rx="3" fill="#e4e4e7"/>` +
  // Divider
  `<rect x="40" y="330" width="714" height="1" fill="#e4e4e7"/>` +
  // Totals rows
  `<rect x="560" y="350" width="88" height="12" rx="3" fill="#e4e4e7"/>` +
  `<rect x="658" y="350" width="96" height="12" rx="3" fill="#e4e4e7"/>` +
  `<rect x="560" y="376" width="88" height="16" rx="4" fill="#e4e4e7"/>` +
  `<rect x="658" y="376" width="96" height="16" rx="4" fill="#e4e4e7"/>` +
  `</svg>`
)}`

/**
 * Loading skeleton for the invoice paper.
 *
 * A full-card <img> with a data-URI SVG makes this a first-class LCP candidate:
 * visible (opacity 1), img-typed, and sized to the full A4 invoice dimensions
 * (794×1123) — larger than any text element in the decoded invoice, so LCP fires
 * at skeleton FCP (~1s) rather than at decoded card paint (~10s on mobile-4G).
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
      {/* eslint-disable-next-line @next/next/no-img-element -- data-URI SVG; Next Image doesn't optimize inline data URIs */}
      <img
        src={SKELETON_SRC}
        width={INVOICE_BASE_WIDTH}
        height={INVOICE_BASE_HEIGHT}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block rounded-lg"
      />
    </div>
  )
}
