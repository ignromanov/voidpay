'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/shared/ui'
import { InvoicePaper } from './InvoicePaper'
import { InvoiceStatus } from '../types'
import { InvoiceSchemaV1 } from '@/entities/invoice'

export interface InvoicePreviewModalProps {
  /**
   * Invoice data to display
   */
  data: Partial<InvoiceSchemaV1>

  /**
   * Invoice status for watermark/badge
   * @default 'pending'
   */
  status?: InvoiceStatus

  /**
   * Transaction hash for paid invoices
   */
  txHash?: string

  /**
   * Whether the transaction hash has been validated on-chain
   * @default true
   */
  txHashValidated?: boolean

  /**
   * Whether the modal is open
   */
  open: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void
}

export const InvoicePreviewModal = React.memo<InvoicePreviewModalProps>(
  ({ data, status = 'pending', txHash, txHashValidated = true, open, onOpenChange }) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[850px] overflow-hidden border-none bg-transparent p-0 shadow-none [&>button]:hidden"
          aria-describedby={undefined}
        >
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">
            Invoice Preview {data.invoiceId ? `#${data.invoiceId}` : ''}
          </DialogTitle>

          {/* Close button positioned outside the invoice */}
          <DialogClose
            className="absolute top-0 -right-12 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </DialogClose>

          {/* Invoice Paper with interactive variant */}
          <div className="flex items-center justify-center">
            <InvoicePaper
              data={data}
              status={status}
              {...(txHash && { txHash })}
              txHashValidated={txHashValidated}
              variant="full"
              responsive
              className="max-h-[90vh] w-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)

InvoicePreviewModal.displayName = 'InvoicePreviewModal'
