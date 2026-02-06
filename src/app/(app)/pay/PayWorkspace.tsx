'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useHashFragment } from '@/shared/lib/hooks'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { useRichInvoiceStore, type RichInvoice } from '@/entities/invoice'
import { useCreatorStore } from '@/entities/creator'
import { getNetworkTheme } from '@/entities/network'
import {
  ScaledInvoicePreview,
  InvoicePaper,
} from '@/widgets/invoice-paper'
import {
  DecodeErrorScreen,
  type DecodeErrorType,
} from '@/shared/ui/decode-error-screen'
import type { Invoice } from '@/shared/lib/invoice-types'

const InvoicePreviewModal = dynamic(
  () => import('@/widgets/invoice-paper').then((m) => ({ default: m.InvoicePreviewModal })),
  { ssr: false }
)

/**
 * Hydration timeout in ms.
 * After this time without hash, we assume no invoice data.
 */
const HYDRATION_TIMEOUT = 200

/**
 * Map parseInvoiceHash error messages to DecodeErrorType.
 */
function mapErrorMessage(message: string): DecodeErrorType {
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('empty')) {
    return 'EMPTY_HASH'
  }
  if (lowerMessage.includes('prefix') || lowerMessage.includes('invalid')) {
    return 'INVALID_FORMAT'
  }
  if (lowerMessage.includes('version')) {
    return 'UNSUPPORTED_VERSION'
  }
  return 'CORRUPTED_DATA'
}

/**
 * PayWorkspace — Client component for viewing invoices from shared links.
 *
 * Handles:
 * 1. URL hash decoding via parseInvoiceHash (Binary V3)
 * 2. Loading/error states with network-themed background
 * 3. Fullscreen modal preview via InvoicePreviewModal
 * 4. View history tracking via useRichInvoiceStore
 *
 * @example
 * ```tsx
 * // In page.tsx
 * export default function PayPage() {
 *   return <PayWorkspace />
 * }
 * ```
 */
export function PayWorkspace() {
  const router = useRouter()
  const hash = useHashFragment()
  const setNetworkTheme = useCreatorStore((s) => s.setNetworkTheme)
  const { addInvoice, getInvoice } = useRichInvoiceStore()

  // Decode state
  const [isHydrated, setIsHydrated] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [errorType, setErrorType] = useState<DecodeErrorType | null>(null)

  // Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Hydration detection: wait for hash to stabilize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, HYDRATION_TIMEOUT)
    return () => clearTimeout(timer)
  }, [])

  // Decode hash when available
  useEffect(() => {
    // Skip during SSR hydration
    if (!isHydrated && hash === '') {
      return
    }

    // Empty hash after hydration = no invoice
    if (hash === '') {
      setErrorType('EMPTY_HASH')
      setInvoice(null)
      return
    }

    // Attempt to decode
    const result = parseInvoiceHash(hash)

    if (result.success) {
      setInvoice(result.data)
      setErrorType(null)

      // Track view in history (if not already tracked)
      try {
        const existingInvoice = getInvoice(result.data.invoiceId)
        if (!existingInvoice) {
          const invoiceUrl = `${window.location.origin}/pay#${hash}`
          const richInvoice: Omit<RichInvoice, 'createdAt'> = {
            invoiceId: result.data.invoiceId,
            invoiceUrl,
            data: result.data,
            status: 'pending',
            viewedAt: new Date().toISOString(),
          }
          addInvoice(richInvoice)
        }
      } catch (error) {
        console.error('[PayWorkspace] Failed to track invoice view:', error)
      }
    } else {
      setInvoice(null)
      setErrorType(mapErrorMessage(result.error.message))
    }
  }, [hash, isHydrated, addInvoice, getInvoice])

  // Set network theme based on invoice
  useEffect(() => {
    if (invoice?.networkId) {
      const theme = getNetworkTheme(invoice.networkId)
      setNetworkTheme(theme)
    }
  }, [invoice?.networkId, setNetworkTheme])

  // Navigate to home
  const handleReturnHome = () => {
    router.push('/')
  }

  // Handle invoice click (open modal)
  const handleInvoiceClick = () => {
    setIsPreviewOpen(true)
  }

  // Memoize network ID for data attribute
  const networkId = useMemo(() => invoice?.networkId ?? 1, [invoice?.networkId])

  // Loading state: SSR hydration OR waiting for decode effect to process
  if (!invoice && !errorType) {
    return (
      <div
        data-testid="pay-workspace-skeleton"
        data-network={networkId}
        className="flex h-full items-center justify-center"
      >
        <div className="h-[500px] w-[353px] animate-pulse rounded-lg bg-zinc-800/50" />
      </div>
    )
  }

  // Error state
  if (errorType) {
    return (
      <div className="relative z-10 flex h-full flex-col" data-network={networkId}>
        <DecodeErrorScreen
          errorType={errorType}
          onReturnHome={handleReturnHome}
        />
      </div>
    )
  }

  // Success state
  if (invoice) {
    return (
      <>
        <div className="relative z-10 flex h-full w-full items-center justify-center py-4" data-network={networkId}>
          <div data-testid="invoice-preview-clickable" className="h-full w-full">
            <ScaledInvoicePreview
              preset="pay"
              printable
              networkId={invoice.networkId}
              onClick={handleInvoiceClick}
              showExpandOverlay
            >
              <InvoicePaper data={invoice} status="pending" />
            </ScaledInvoicePreview>
          </div>
        </div>

        {isPreviewOpen && (
          <InvoicePreviewModal
            data={invoice}
            status="pending"
            open={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
          />
        )}

      </>
    )
  }

  // Fallback — should not reach here
  console.error('[PayWorkspace] Unexpected state: no invoice, no error, hydrated')
  return (
    <div className="relative z-10 flex h-full flex-col">
      <DecodeErrorScreen
        errorType="CORRUPTED_DATA"
        onReturnHome={handleReturnHome}
      />
    </div>
  )
}
