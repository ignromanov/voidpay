import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

interface InvoiceCardShellProps {
  children: ReactNode
  className?: string
}

export function InvoiceCardShell({ children, className }: InvoiceCardShellProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-colors hover:border-gray-600',
        className,
      )}
    >
      {children}
    </div>
  )
}
