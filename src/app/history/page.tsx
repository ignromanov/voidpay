import type { Metadata } from 'next'
import { HistoryPageClient } from './HistoryPageClient'

export const metadata: Metadata = {
  title: 'Invoice History | VoidPay',
  description: 'View and manage your created and received invoices.',
  robots: { index: false, follow: false },
}

export default function HistoryPage() {
  return <HistoryPageClient />
}
