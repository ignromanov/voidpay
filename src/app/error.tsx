'use client'

import { useEffect } from 'react'
import { AppErrorScreen } from '@/shared/ui/app-error-screen'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[RootError]', error)
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
