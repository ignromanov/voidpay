'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecodeErrorScreen } from '@/shared/ui/decode-error-screen'
import { AppErrorScreen } from '@/shared/ui/app-error-screen'
import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'

/** Keywords that indicate a codec/decode-related error */
const CODEC_KEYWORDS = [
  'decode',
  'binary',
  'base64',
  'codec',
  'decompress',
  'inflate',
  'hash fragment',
  'invoice data',
]

/**
 * Classifies an error as a decode error or an application error.
 *
 * Returns a DecodeErrorType for codec-related errors (shown with DecodeErrorScreen),
 * or null for runtime/application errors (shown with AppErrorScreen).
 */
function classifyError(error: Error): DecodeErrorType | null {
  const msg = error.message.toLowerCase()

  const isCodecError = CODEC_KEYWORDS.some((kw) => msg.includes(kw))
  if (!isCodecError) return null

  // Sub-classify the specific decode error type
  if (msg.includes('empty') || msg.includes('no invoice') || msg.includes('missing')) {
    return 'EMPTY_HASH'
  }
  if (msg.includes('version') || msg.includes('unsupported')) {
    return 'UNSUPPORTED_VERSION'
  }
  if (msg.includes('format') || msg.includes('prefix') || msg.includes('invalid')) {
    return 'INVALID_FORMAT'
  }
  return 'CORRUPTED_DATA'
}

/**
 * Error boundary for /pay route.
 *
 * Distinguishes between two error categories:
 * - Decode errors (corrupted URL) → DecodeErrorScreen (amber)
 * - Application errors (runtime crashes) → AppErrorScreen (rose)
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

    if (process.env.NODE_ENV === 'production') {
      console.error(
        JSON.stringify({
          type: 'pay_page_error',
          message: error.message,
          digest: error.digest,
          timestamp: new Date().toISOString(),
        })
      )
    }
  }, [error])

  const handleReturnHome = () => {
    router.push('/')
  }

  const decodeErrorType = classifyError(error)

  if (decodeErrorType) {
    return (
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <DecodeErrorScreen
          errorType={decodeErrorType}
          onReturnHome={handleReturnHome}
        />
      </div>
    )
  }

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <AppErrorScreen
        error={error}
        digest={error.digest}
        onReset={reset}
        onReturnHome={handleReturnHome}
      />
    </div>
  )
}
