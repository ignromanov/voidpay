'use client'

/**
 * Invoice History Page
 *
 * Displays a chronological list of created invoices.
 * Allows users to view, duplicate, or delete history entries.
 */

import { HistoryList } from '@/features/invoice-history/ui/HistoryList'

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Invoice History</h1>
          <p className="text-gray-400">
            View and manage your created invoices. Duplicate past invoices to create new ones quickly.
          </p>
        </div>

        <HistoryList />
      </div>
    </div>
  )
}
