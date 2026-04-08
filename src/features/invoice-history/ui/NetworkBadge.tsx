import { NETWORK_CONFIG } from '@/entities/network'
import { cn } from '@/shared/lib/utils'

const NETWORK_BADGE_BG: Record<number, string> = {
  1: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  42161: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  10: 'bg-red-500/10 text-red-400 border-red-500/20',
  137: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  8453: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

const FALLBACK_BG = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'

interface NetworkBadgeProps {
  networkId: number
  className?: string
}

export function NetworkBadge({ networkId, className }: NetworkBadgeProps) {
  const config = NETWORK_CONFIG.find((n) => n.chainId === networkId)
  const name = config?.name ?? 'Unknown'
  const badgeBg = NETWORK_BADGE_BG[networkId] ?? FALLBACK_BG

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        badgeBg,
        className,
      )}
    >
      {name}
    </span>
  )
}
