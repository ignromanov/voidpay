'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'

interface CreateErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error Boundary for /create route
 *
 * Catches runtime errors in CreateWorkspace and provides
 * user-friendly recovery options.
 */
export default function CreateError({ error, reset }: CreateErrorProps) {
  useEffect(() => {
    // Always log to console for debugging
    console.error('[CreateError]', error)

    // In production, send structured data for log aggregators
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with Sentry when ready
      // Sentry.captureException(error, { extra: { digest: error.digest } })

      // Structured log for Vercel/log aggregators
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 p-8">
      <div className="max-w-md text-center">
        {/* Error icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
        </div>

        {/* Error heading */}
        <Heading variant="h2" as="h2" className="mb-2 text-white">
          Something went wrong
        </Heading>

        {/* Error description */}
        <Text className="mb-6 text-zinc-400">
          Unable to load the invoice editor. This might be due to corrupted data or a temporary
          issue.
        </Text>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-left">
            <Text variant="small" className="font-mono text-rose-400">
              {error.message}
            </Text>
            {error.digest && (
              <Text variant="small" className="mt-1 text-zinc-500">
                Digest: {error.digest}
              </Text>
            )}
          </div>
        )}

        {/* Recovery actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Clear URL hash and reload
              window.location.href = '/create'
            }}
          >
            Start fresh
          </Button>
        </div>
      </div>
    </div>
  )
}
