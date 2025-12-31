'use client'

import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogClose, Badge } from '@/shared/ui'
import { InvoicePaper } from './InvoicePaper'
import { ScaledInvoicePreview } from './ScaledInvoicePreview'
import { InvoiceStatus } from '../types'
import { Invoice, PartialInvoice } from '@/entities/invoice'
import { generateInvoiceUrl } from '@/features/invoice-codec'

export interface InvoicePreviewModalProps {
  /**
   * Invoice data to display
   */
  data: PartialInvoice

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
    // Generate invoice URL for linking (only if data is complete enough)
    const invoiceUrl = useMemo(() => {
      // Need minimum required fields to generate URL
      if (!data.invoiceId || !data.from?.walletAddress || !data.networkId) {
        return undefined
      }
      try {
        return generateInvoiceUrl(data as Invoice)
      } catch {
        // Silently fail if URL generation fails (e.g., too large)
        return undefined
      }
    }, [data])

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden border-none bg-zinc-900/90 p-0 shadow-2xl backdrop-blur-xl sm:h-[95vh] sm:max-w-[95vw] md:max-w-[850px] [&>button]:hidden"
          aria-describedby={undefined}
        >
          {/* Sticky header per v3 design */}
          <div className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-800/80 px-3 py-3 backdrop-blur-md sm:p-4">
            <div className="flex items-center gap-2">
              {/* DialogTitle for accessibility — visible per v3 */}
              <DialogTitle className="text-sm font-bold text-white sm:text-base">Document Preview</DialogTitle>
              <Badge variant="outline" className="hidden border-violet-500/30 text-violet-300 sm:flex">
                Reading Mode
              </Badge>
            </div>
            {/* Close button in header per v3 */}
            <DialogClose
              className="cursor-pointer rounded-full bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </DialogClose>
          </div>

          {/* Invoice Paper container — dynamic x2 scaling with scroll */}
          {/* Click outside invoice closes modal (cursor-zoom-out), click on invoice does not */}
          <div
            className="flex flex-1 cursor-zoom-out items-start justify-start overflow-auto p-2 sm:justify-center sm:p-4 md:p-8"
            onClick={() => onOpenChange(false)}
          >
            <ScaledInvoicePreview
              scaleOptions={{
                scaleMultiplier: 2,
                maxScale: 1,
                heightFraction: 0.85,
              }}
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <InvoicePaper
                data={data}
                status={status}
                {...(txHash && { txHash })}
                txHashValidated={txHashValidated}
                variant="full"
                invoiceUrl={invoiceUrl}
              />
            </ScaledInvoicePreview>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)

InvoicePreviewModal.displayName = 'InvoicePreviewModal'
