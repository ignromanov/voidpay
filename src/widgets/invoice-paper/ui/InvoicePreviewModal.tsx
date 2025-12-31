'use client'

import React, { useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Printer, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogClose, Badge, Button } from '@/shared/ui'
import { InvoicePaper } from './InvoicePaper'
import { ScaledInvoicePreview } from './ScaledInvoicePreview'
import { InvoiceStatus, InvoicePaperProps } from '../types'
import { Invoice, PartialInvoice } from '@/entities/invoice'
import { NETWORK_GLOW_SHADOWS } from '@/entities/network'
import { generateInvoiceUrl } from '@/features/invoice-codec'
import { toast } from '@/shared/lib/toast'
import { cn } from '@/shared/lib/utils'

// Animation variants for smooth enter/exit
const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { delay: 0.05, duration: 0.2 },
  },
}

const invoiceVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { delay: 0.1, duration: 0.25 },
  },
}

const actionBarVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { delay: 0.15, duration: 0.2 },
  },
}

// Network glow now handled by ScaledInvoicePreview via NETWORK_GLOW_SHADOWS

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
      } catch (error) {
        console.error('URL generation failed:', error)
        toast.error('Failed to generate invoice URL')
        return undefined
      }
    }, [data])

    // Print handler
    const handlePrint = useCallback(() => {
      window.print()
    }, [])

    // Download PDF handler (uses browser's print-to-PDF)
    const handleDownloadPdf = useCallback(() => {
      // Trigger print dialog where user can choose "Save as PDF"
      window.print()
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
      if (!open) return

      const handleKeyDown = (e: KeyboardEvent) => {
        // P for Print (when not in input)
        if (e.key === 'p' && !e.metaKey && !e.ctrlKey) {
          const target = e.target as HTMLElement
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault()
            handlePrint()
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, handlePrint])

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden border-none bg-zinc-900/90 p-0 shadow-2xl backdrop-blur-xl sm:h-[95vh] sm:max-w-[95vw] lg:w-[880px] lg:max-w-[95vw] print:hidden [&>button]:hidden"
          aria-describedby="invoice-preview-description"
        >
          {/* Screen reader description */}
          <p id="invoice-preview-description" className="sr-only">
            Full-screen invoice preview. Press ESC to close, P to print.
          </p>

          {/* Animated header */}
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-800/80 px-3 py-2 backdrop-blur-md sm:px-4 sm:py-3"
          >
            <div className="flex items-center gap-2">
              <DialogTitle className="text-sm font-bold text-white sm:text-base">
                Document Preview
              </DialogTitle>
              <Badge
                variant="outline"
                className="hidden border-violet-500/30 text-violet-300 sm:flex"
              >
                Reading Mode
              </Badge>
              {/* Keyboard hints — desktop only */}
              <div className="hidden items-center gap-3 text-xs text-zinc-500 xl:flex">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-zinc-700/50 px-1.5 py-0.5 font-mono text-[10px]">
                    ESC
                  </kbd>
                  <span>Close</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-zinc-700/50 px-1.5 py-0.5 font-mono text-[10px]">
                    P
                  </kbd>
                  <span>Print</span>
                </span>
              </div>
            </div>
            <DialogClose
              className="cursor-pointer rounded-full bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </DialogClose>
          </motion.div>

          {/* Invoice container — glow handled by ScaledInvoicePreview */}
          <motion.div
            variants={invoiceVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-1 cursor-zoom-out items-start justify-center overflow-auto px-1 py-4 sm:p-4 md:p-8"
            onClick={() => onOpenChange(false)}
          >
            <ScaledInvoicePreview
              preset="modal"
              glowClassName={NETWORK_GLOW_SHADOWS[data.networkId ?? 1]}
              className={cn(
                'shrink-0 transition-all duration-300',
                'hover:drop-shadow-[0_0_30px_rgba(124,58,237,0.12)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Type assertion needed because status comes from runtime prop.
                    Discriminated union requires txHash when status='paid',
                    which is guaranteed by InvoicePreviewModalProps contract. */}
              <InvoicePaper
                {...({
                  data,
                  status,
                  txHash,
                  txHashValidated,
                  variant: 'full',
                  invoiceUrl,
                } as InvoicePaperProps)}
              />
            </ScaledInvoicePreview>
          </motion.div>

          {/* Action bar — sticky bottom */}
          <motion.div
            variants={actionBarVariants}
            initial="hidden"
            animate="visible"
            className="sticky bottom-0 z-50 flex shrink-0 items-center gap-2 border-t border-white/10 bg-zinc-800/80 px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-4 sm:py-3"
          >
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-zinc-300 hover:text-white"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-zinc-300 hover:text-white"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>

            {/* Status indicator — right side */}
            <div className="ml-auto flex items-center gap-2">
              {status === 'paid' && (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  Paid
                </Badge>
              )}
              {status === 'pending' && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                  Pending
                </Badge>
              )}
              {status === 'draft' && (
                <Badge variant="outline" className="border-zinc-500/30 text-zinc-400">
                  Draft
                </Badge>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }
)

InvoicePreviewModal.displayName = 'InvoicePreviewModal'
