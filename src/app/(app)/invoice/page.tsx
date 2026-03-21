import type { Metadata } from 'next'
import { decodeOGPreview } from '@/features/invoice-codec'
import { InvoiceWorkspace } from './InvoiceWorkspace'

const DEFAULT_METADATA: Metadata = {
  title: 'Track Invoice | VoidPay',
  description: 'Track your invoice payment status. No signup required.',
  robots: {
    index: false,
    follow: false,
  },
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ og?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const og = params.og

  if (!og) return DEFAULT_METADATA

  try {
    const preview = decodeOGPreview(og)
    if (!preview) return DEFAULT_METADATA

    const networkDisplayName = preview.network.toUpperCase()
    const title = `Invoice ${preview.id} | VoidPay`
    const description = `${preview.amount} ${preview.currency} on ${networkDisplayName}${preview.from ? ` from ${preview.from}` : ''}`

    return {
      title,
      description,
      openGraph: { title, description, type: 'website', siteName: 'VoidPay' },
      twitter: { card: 'summary', title, description },
      robots: { index: false, follow: false },
    }
  } catch {
    return DEFAULT_METADATA
  }
}

/**
 * Invoice Page — Creator invoice tracking
 *
 * Same hash fragment privacy model as /pay.
 * Shows invoice preview with a Share button to re-open ShareModal.
 */
export default function InvoicePage() {
  return <InvoiceWorkspace />
}
