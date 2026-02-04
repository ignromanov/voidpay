'use client'

import { AlertCircleIcon, ShieldAlertIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Heading, Text } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

/**
 * Error types for URL decode failures.
 * Maps to parseInvoiceHash error codes.
 */
export type DecodeErrorType =
  | 'EMPTY_HASH'
  | 'INVALID_FORMAT'
  | 'UNSUPPORTED_VERSION'
  | 'CORRUPTED_DATA'

/**
 * Error configuration for each error type.
 */
const ERROR_CONFIG: Record<
  DecodeErrorType,
  { title: string; description: string; icon: 'alert' | 'shield' }
> = {
  EMPTY_HASH: {
    title: 'No Invoice Data',
    description: "This link doesn't contain invoice data.",
    icon: 'alert',
  },
  INVALID_FORMAT: {
    title: 'Invalid Invoice Link',
    description: 'The invoice link is malformed or corrupted.',
    icon: 'shield',
  },
  UNSUPPORTED_VERSION: {
    title: 'Unsupported Version',
    description: 'This invoice was created with a newer version.',
    icon: 'alert',
  },
  CORRUPTED_DATA: {
    title: 'Corrupted Data',
    description: 'The invoice data appears to be damaged.',
    icon: 'shield',
  },
}

export interface DecodeErrorScreenProps {
  /** The type of decode error to display */
  errorType: DecodeErrorType
  /** Callback when "Return Home" button is clicked */
  onReturnHome?: () => void
  /** Additional className for the container */
  className?: string
}

/**
 * Error screen displayed when invoice URL decoding fails.
 *
 * Follows the BlockedScreen design pattern from assets/aistudio/v3
 * with glassmorphism styling and clear error messaging.
 *
 * @example
 * ```tsx
 * <DecodeErrorScreen
 *   errorType="INVALID_FORMAT"
 *   onReturnHome={() => router.push('/')}
 * />
 * ```
 */
export function DecodeErrorScreen({
  errorType,
  onReturnHome,
  className,
}: DecodeErrorScreenProps) {
  const config = ERROR_CONFIG[errorType]
  const Icon = config.icon === 'shield' ? ShieldAlertIcon : AlertCircleIcon

  return (
    <div
      data-testid="decode-error-screen"
      className={cn(
        'flex flex-1 flex-col items-center justify-center p-6 text-center',
        'relative z-50 backdrop-blur',
        className
      )}
    >
      <Card
        variant="glass"
        className={cn(
          'flex w-full max-w-md flex-col items-center space-y-6 p-8',
          'border-amber-500/30 bg-amber-950/10',
          'shadow-[0_0_50px_-10px_rgba(245,158,11,0.2)]'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full',
            'border border-amber-500/20 bg-amber-500/10 shadow-inner'
          )}
        >
          <Icon className="h-10 w-10 text-amber-500" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <Heading variant="h2">{config.title}</Heading>
          <Text variant="body" className="text-amber-200/70">{config.description}</Text>
        </div>

        {/* Action Button */}
        <div className="w-full pt-2">
          <Button
            variant="outline"
            className={cn(
              'w-full',
              'border-amber-500/30 text-amber-400',
              'hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-300'
            )}
            onClick={onReturnHome}
          >
            Return Home
          </Button>
        </div>

        {/* Branding */}
        <Text variant="tiny" className="text-zinc-500">
          VoidPay — Stateless Crypto Invoicing
        </Text>
      </Card>
    </div>
  )
}
