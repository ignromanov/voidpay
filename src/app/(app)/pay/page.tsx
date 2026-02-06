import type { Metadata } from 'next'
import { decodeOGPreview } from '@/features/invoice-codec'
import { PayWorkspace } from './PayWorkspace'

/**
 * Default metadata when ?og= parameter is missing
 */
const DEFAULT_METADATA: Metadata = {
  title: 'Pay Invoice | VoidPay',
  description: 'View and pay crypto invoices securely. No signup required.',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * Generate dynamic OG metadata from ?og= query parameter.
 *
 * OG preview format: id_amount_currency_network[_from][_due]
 * Example: INV-001_100_USDC_arb_Acme_2026-02-15
 *
 * Privacy: Only minimal data is in ?og= param.
 * Full invoice data stays in hash fragment (never sent to server).
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ og?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const og = params.og

  if (!og) {
    return DEFAULT_METADATA
  }

  try {
    const preview = decodeOGPreview(og)

    if (!preview) {
      return DEFAULT_METADATA
    }

    // Network is a short code (eth, arb, op, poly) - capitalize for display
    const networkDisplayName = preview.network.toUpperCase()
    const title = `Invoice ${preview.id} | VoidPay`
    const description = `${preview.amount} ${preview.currency} on ${networkDisplayName}${preview.from ? ` from ${preview.from}` : ''}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'VoidPay',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  } catch {
    // Silently fall back to default on parse errors
    return DEFAULT_METADATA
  }
}

/**
 * Pay Page — View invoices from shared links
 *
 * This is a Server Component that:
 * 1. Generates OG metadata from ?og= param (for social previews)
 * 2. Sets noindex/nofollow (privacy: don't index payment pages)
 * 3. Renders PayWorkspace client component
 *
 * Invoice data is NOT read here — it's in the hash fragment
 * which is never sent to the server (privacy-first design).
 */
export default function PayPage() {
  return <PayWorkspace />
}
