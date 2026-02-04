'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NetworkBackground } from '@/widgets/network-background'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'

/**
 * Error boundary for /pay route.
 *
 * Catches uncaught errors and displays a user-friendly error screen.
 * Uses the same DecodeErrorScreen component for visual consistency.
 */
export default function PayError({
  error,
  reset: _reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console in development
    console.error('[PayPage Error]', error)
  }, [error])

  const handleReturnHome = () => {
    router.push('/')
  }

  return (
    <>
      <NetworkBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <DecodeErrorScreen
          errorType="CORRUPTED_DATA"
          onReturnHome={handleReturnHome}
        />
      </div>
    </>
  )
}
