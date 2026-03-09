import { cn } from '@/shared/lib/utils'
import { Loader2Icon } from '@/shared/ui/icons'
import type { PollingMode } from '@/features/payment'

export interface PollingStatusProps {
  mode: PollingMode
  className?: string
}

export function PollingStatus({ mode, className }: PollingStatusProps) {
  if (mode === 'idle') return null

  if (mode === 'watching') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-zinc-400', className)}>
        <span
          data-testid="polling-dot"
          className="inline-block h-2 w-2 rounded-full bg-violet-400 animate-pulse"
        />
        <span>Watching for payment...</span>
      </div>
    )
  }

  const label =
    mode === 'aggressive' ? 'Searching for your payment...' : 'Checking...'

  return (
    <div className={cn('flex items-center gap-2 text-sm text-zinc-400', className)}>
      <Loader2Icon size={14} className="animate-spin" />
      <span>{label}</span>
    </div>
  )
}
