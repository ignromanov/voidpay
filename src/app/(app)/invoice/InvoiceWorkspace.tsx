'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parseInvoiceHash } from '@/features/invoice-codec'
import { useHashFragment } from '@/shared/lib/hooks'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { Button } from '@/shared/ui/button'
import { Share2Icon } from '@/shared/ui/icons'
import { InvoicePaper, ScaledInvoicePreview, InvoicePreviewModal } from '@/widgets/invoice-paper'
import { ShareModal } from '@/widgets/share-modal'
import type { Invoice } from '@/shared/lib/invoice-types'

/**
 * InvoiceWorkspace — Creator invoice view with Share button.
 *
 * Decodes invoice from URL hash and renders:
 * - Scaled invoice preview
 * - Share button that re-opens ShareModal with the /pay URL
 *
 * OG toggle is read-only here (was set during creation).
 */
export function InvoiceWorkspace() {
  const router = useRouter()
  const hash = useHashFragment()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [errorType, setErrorType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [payUrl, setPayUrl] = useState('')
  const [includeOg, setIncludeOg] = useState(false)

  // Derive pay URL and OG flag from current location
  useEffect(() => {
    const href = window.location.href
    setPayUrl(href.replace('/invoice', '/pay'))
    setIncludeOg(href.includes('?og='))
  }, [])

  // Decode invoice from URL hash
  useEffect(() => {
    if (!hash) {
      setIsLoading(false)
      setErrorType('MISSING_HASH')
      return
    }

    let cancelled = false
    void (async () => {
      const result = await parseInvoiceHash(hash)
      if (cancelled) return
      if (result.success) {
        setInvoice(result.data)
        setErrorType(null)
      } else {
        setErrorType(result.error.message ?? 'CORRUPTED_DATA')
      }
      setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [hash])

  const handleOgToggle = useCallback(() => {
    // OG toggle is read-only on /invoice — was set during creation
  }, [])

  if (isLoading) {
    return (
      <div className="relative z-10 h-full w-full">
        <div className="absolute inset-x-0 top-0 bottom-[70px] z-10 flex items-center justify-center p-2 md:p-4">
          <ScaledInvoicePreview preset="pay" loading />
        </div>
      </div>
    )
  }

  if (errorType || !invoice) {
    return (
      <div className="relative z-10 flex h-full flex-col">
        <DecodeErrorScreen
          errorType="CORRUPTED_DATA"
          onReturnHome={() => router.push('/')}
        />
      </div>
    )
  }

  return (
    <>
      {/* Share button — floating top-right */}
      <div className="absolute top-4 right-4 z-50 print:hidden">
        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsShareOpen(true)}
        >
          <Share2Icon size={14} />
          Share
        </Button>
      </div>

      {/* Invoice Preview */}
      <div className="relative z-10 h-full w-full">
        <div className="absolute inset-x-0 top-0 bottom-0 z-10 flex items-center justify-center p-2 md:p-4 print:items-start print:justify-start print:p-0">
          <ScaledInvoicePreview
            preset="pay"
            printable
            networkId={invoice.networkId}
            onClick={() => setIsPreviewOpen(true)}
            showExpandOverlay
          >
            <InvoicePaper data={invoice} status="pending" />
          </ScaledInvoicePreview>
        </div>
      </div>

      {/* Fullscreen preview modal */}
      {isPreviewOpen && (
        <InvoicePreviewModal
          data={invoice}
          status="pending"
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}

      {/* Share modal — uses the /pay URL */}
      {payUrl && (
        <ShareModal
          url={payUrl}
          invoice={invoice}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          includeOg={includeOg}
          onOgToggle={handleOgToggle}
        />
      )}
    </>
  )
}
