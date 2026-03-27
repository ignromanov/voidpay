'use client'

import dynamic from 'next/dynamic'
import { HistorySkeleton } from './HistorySkeleton'

const HistoryWorkspace = dynamic(
  () =>
    import('./HistoryWorkspace').then((m) => ({
      default: m.HistoryWorkspace,
    })),
  { ssr: false, loading: () => <HistorySkeleton /> },
)

export function HistoryPageClient() {
  return <HistoryWorkspace />
}
