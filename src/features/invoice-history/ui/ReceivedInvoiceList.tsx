'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTrackedInvoiceStore } from '@/entities/invoice'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'
import { duplicateFromUrl } from '../lib/duplicate-invoice'
import { InvoiceCard } from './InvoiceCard'
import type { DecodedReceivedInvoice } from '../lib/types'

export type { DecodedReceivedInvoice }

interface ReceivedInvoiceListProps {
  invoices: DecodedReceivedInvoice[]
  debug?: boolean
  className?: string
}

export function ReceivedInvoiceList({ invoices, debug = false, className }: ReceivedInvoiceListProps) {
  const router = useRouter()
  const removeInvoice = useTrackedInvoiceStore((s) => s.removeInvoice)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDelete = (invoiceId: string) => {
    removeInvoice(invoiceId)
    setDeleteConfirmId(null)
  }

  const handleTemplate = useCallback(async (invoiceUrl: string) => {
    const draftId = await duplicateFromUrl(invoiceUrl)
    if (draftId) {
      router.push('/create')
      toast.success('Invoice duplicated as template')
    } else {
      toast.error('Could not decode invoice for duplication')
    }
  }, [router])

  const handleView = useCallback((invoiceUrl: string) => {
    try {
      const hash = new URL(invoiceUrl).hash as `#${string}`
      router.push(`/pay${hash}`)
    } catch {
      router.push('/pay')
    }
  }, [router])

  if (invoices.length === 0) {
    return (
      <p className={cn('py-12 text-center text-sm text-zinc-500', className)}>
        Invoices you open via payment links will appear here.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {invoices.map(({ tracked, invoice, status }) => (
        <InvoiceCard
          key={tracked.invoiceId}
          tracked={tracked}
          invoice={invoice}
          status={status}
          debug={debug}
          nameLabel={invoice?.from?.name ?? 'Unknown sender'}
          onView={() => handleView(tracked.invoiceUrl)}
          onTemplate={() => handleTemplate(tracked.invoiceUrl)}
          onDelete={() => setDeleteConfirmId(tracked.invoiceId)}
          isDeleteConfirming={deleteConfirmId === tracked.invoiceId}
          onDeleteConfirm={() => handleDelete(tracked.invoiceId)}
          onDeleteCancel={() => setDeleteConfirmId(null)}
        />
      ))}
    </div>
  )
}
