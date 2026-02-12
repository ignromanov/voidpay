'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { Button } from '@/shared/ui/button'
import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'

const CODEC_KEYWORDS = ['decode', 'binary', 'base62', 'codec', 'decompress', 'inflate', 'parse']

function classifyError(error: Error): DecodeErrorType {
  const msg = error.message.toLowerCase()
  if (CODEC_KEYWORDS.some((kw) => msg.includes(kw))) {
    return 'CORRUPTED_DATA'
  }
  return 'CORRUPTED_DATA'
}

/**
 * Error boundary for /pay route.
 *
 * Catches uncaught errors and displays a user-friendly error screen.
 * Uses the same DecodeErrorScreen component for visual consistency.
 */
export default function PayError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[PayPage Error]', error)
  }, [error])

  const errorType = classifyError(error)

  const handleReturnHome = () => {
    router.push('/')
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <DecodeErrorScreen
        errorType={errorType}
        onReturnHome={handleReturnHome}
      />
      <div className="flex justify-center pb-8">
        <Button
          variant="ghost"
          onClick={reset}
          className="text-zinc-400 hover:text-zinc-200"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
