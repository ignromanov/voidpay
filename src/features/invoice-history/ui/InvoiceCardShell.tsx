import { cn } from '@/shared/lib/utils'
import type { InvoiceStatus } from '@/entities/invoice'
import { StatusGradientBar } from './StatusGradientBar'
import type { ReactNode } from 'react'

interface InvoiceCardShellProps {
  children: ReactNode
  status: InvoiceStatus
  className?: string
}

export function InvoiceCardShell({ children, status, className }: InvoiceCardShellProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900/50 transition-colors hover:border-zinc-600',
        className,
      )}
    >
      <StatusGradientBar status={status} />
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
