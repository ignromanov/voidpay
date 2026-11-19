'use client'

import { useEffect } from 'react'
import { AppErrorScreen } from '@/shared/ui/app-error-screen'
import { track, AnalyticsEvent, safeErrorName } from '@/features/analytics'

/**
 * Error Boundary for /create route.
 *
 * Catches runtime errors in CreateWorkspace and provides
 * user-friendly recovery via AppErrorScreen.
 */
export default function CreateError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CreateError]', error)
    track(AnalyticsEvent.ERROR_BOUNDARY, {
      page: window.location.pathname,
      error_name: safeErrorName(error.name),
      ...(error.digest ? { error_digest: error.digest } : {}),
    })

    if (process.env.NODE_ENV === 'production') {
      console.error(
        JSON.stringify({
          type: 'create_page_error',
          error_name: safeErrorName(error.name),
          digest: error.digest,
          timestamp: new Date().toISOString(),
        })
      )
    }
  }, [error])

  return (
    <div className="relative z-10 flex min-h-[60vh] flex-col">
      <AppErrorScreen
        error={error}
        digest={error.digest}
        onReset={reset}
        onReturnHome={() => {
          window.location.href = '/'
        }}
      />
    </div>
  )
}
