'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/shared/ui'
import { Badge } from '@/shared/ui/badge'
import { InvoicePaper } from './InvoicePaper'
import { InvoiceStatus } from '../types'
import { Invoice } from '@/entities/invoice'

export interface InvoicePreviewModalProps {
  /**
   * Invoice data to display
   */
  data: Partial<Invoice>

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
          className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden border-none bg-zinc-950/95 p-0 shadow-2xl backdrop-blur-xl sm:h-[95vh] sm:max-w-[95vw] md:max-w-[850px] [&>button]:hidden"
          aria-describedby={undefined}
        >
          {/* Sticky header per v3 design */}
          <div className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-white/5 bg-zinc-950/50 px-3 py-3 backdrop-blur-md sm:p-4">
            <div className="flex items-center gap-2">
              {/* DialogTitle for accessibility — visible per v3 */}
              <DialogTitle className="text-sm font-bold text-white sm:text-base">Document Preview</DialogTitle>
              <Badge
                variant="outline"
                className="hidden border-violet-500/30 text-violet-300 sm:flex"
              >
                Reading Mode
              </Badge>
            </div>
            {/* Close button in header per v3 */}
            <DialogClose
              className="rounded-full bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </DialogClose>
          </div>

          {/* Invoice Paper container — horizontal scroll on mobile, centered on desktop */}
          <div className="flex flex-1 cursor-zoom-out items-start justify-start overflow-auto p-2 sm:justify-center sm:p-4 md:p-8">
            <div className="origin-top-left scale-[0.48] sm:origin-top sm:scale-[0.6] md:scale-[0.75] lg:scale-100">
              <InvoicePaper
                data={data}
                status={status}
                {...(txHash && { txHash })}
                txHashValidated={txHashValidated}
                variant="full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)

InvoicePreviewModal.displayName = 'InvoicePreviewModal'
