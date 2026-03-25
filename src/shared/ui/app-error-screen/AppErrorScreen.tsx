'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangleIcon, RefreshCwIcon, ExternalLinkIcon, CopyIcon, CheckIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Heading, Text } from '@/shared/ui/typography'
import { SOCIAL_URLS } from '@/shared/config/urls'
import { cn } from '@/shared/lib/utils'
import { copyToClipboard } from '@/shared/lib/clipboard'

export interface AppErrorScreenProps {
  /** Error title displayed to the user */
  title?: string
  /** Error description displayed to the user */
  description?: string
  /** Next.js error digest for support references */
  digest?: string | undefined
  /** Original error object (dev-only details shown) */
  error?: Error
  /** "Try again" handler — button hidden if not provided */
  onReset?: () => void
  /** "Return home" handler — button hidden if not provided */
  onReturnHome?: () => void
  /** Additional className for the container */
  className?: string
}

/**
 * Generic application error screen for runtime crashes.
 *
 * Displayed when a non-decode error occurs (missing providers,
 * unexpected runtime errors, etc.). Uses rose theme to visually
 * distinguish from decode errors (amber DecodeErrorScreen).
 *
 * Privacy-first: error details are never auto-sent.
 * Users can copy details and report manually.
 */
export function AppErrorScreen({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. This is a bug on our side, not a problem with your data.',
  digest,
  error,
  onReset,
  onReturnHome,
  className,
}: AppErrorScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const errorDetails = buildErrorDetails(error, digest)

  const handleCopyDetails = async () => {
    const ok = await copyToClipboard(errorDetails)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      ref={containerRef}
      role="alert"
      tabIndex={-1}
      data-testid="app-error-screen"
      className={cn(
        'flex min-h-0 flex-1 flex-col items-center overflow-y-auto p-6 text-center',
        'relative z-50 backdrop-blur',
        'focus:outline-none',
        className
      )}
    >
      <Card
        variant="glass"
        className={cn(
          'my-auto flex w-full max-w-md flex-col items-center space-y-4 p-5 sm:space-y-6 sm:p-8',
          'border-rose-500/30 bg-rose-950/10',
          'shadow-[0_0_50px_-10px_rgba(244,63,94,0.2)]'
        )}
      >
        {/* Icon */}
        <div
          aria-hidden="true"
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20',
            'border border-rose-500/20 bg-rose-500/10 shadow-inner'
          )}
        >
          <AlertTriangleIcon className="h-8 w-8 text-rose-500 sm:h-10 sm:w-10" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <Heading variant="h2">{title}</Heading>
          <Text variant="body" className="text-rose-100/80">{description}</Text>
        </div>

        {/* Error Digest */}
        {digest ? (
          <div className="rounded-full bg-zinc-900/50 px-4 py-1.5">
            <Text variant="tiny" className="font-mono text-zinc-400">
              Error ID: {digest}
            </Text>
          </div>
        ) : null}

        {/* Dev-only Error Details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="w-full rounded-lg border border-rose-500/20 bg-rose-500/5 text-left">
            <summary className="cursor-pointer px-4 py-3 text-sm text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50">
              Technical details
            </summary>
            <div className="border-t border-rose-500/10 px-4 py-3">
              <Text variant="tiny" className="break-all font-mono text-rose-300">
                {error.message}
              </Text>
              {error.stack ? (
                <pre className="mt-2 max-h-40 overflow-auto break-all whitespace-pre-wrap text-xs text-zinc-500">
                  {error.stack}
                </pre>
              ) : null}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-3 pt-2">
          {onReset && (
            <Button
              variant="outline"
              className={cn(
                'w-full',
                'border-rose-500/30 text-rose-400',
                'hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300'
              )}
              onClick={onReset}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}

          {onReturnHome && (
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              onClick={onReturnHome}
            >
              Return home
            </Button>
          )}

          {/* Bug Report: Copy + GitHub link */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              className="flex-1 text-zinc-500 hover:text-zinc-300"
              onClick={handleCopyDetails}
            >
              {copied ? (
                <CheckIcon className="mr-2 h-4 w-4 text-emerald-400" />
              ) : (
                <CopyIcon className="mr-2 h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy details'}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 text-zinc-500 hover:text-zinc-300"
              asChild
            >
              <a
                href={SOCIAL_URLS.githubIssues}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                Report a bug
              </a>
            </Button>
          </div>
        </div>

        {/* Branding */}
        <Text variant="tiny" className="text-zinc-500">
          VoidPay — Stateless Crypto Invoicing
        </Text>
      </Card>
    </div>
  )
}

function buildErrorDetails(error?: Error, digest?: string): string {
  const parts: string[] = []
  if (digest) parts.push(`Error ID: ${digest}`)
  if (error?.message) parts.push(`Message: ${error.message}`)
  if (error?.name) parts.push(`Type: ${error.name}`)
  if (error?.stack) parts.push(`Stack:\n${error.stack}`)
  return parts.join('\n')
}
