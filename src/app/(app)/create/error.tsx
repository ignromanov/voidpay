'use client'

import { useEffect } from 'react'
import { AppErrorScreen } from '@/shared/ui/app-error-screen'

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

    if (process.env.NODE_ENV === 'production') {
      console.error(
        JSON.stringify({
          type: 'create_page_error',
          message: error.message,
          digest: error.digest,
          timestamp: new Date().toISOString(),
        })
      )
    }
  }, [error])

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
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
