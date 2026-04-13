import { getNetworkName, NETWORK_BADGES_DARK } from '@/entities/network'
import { NetworkIcon } from '@/shared/ui/network-icon'
import { cn } from '@/shared/lib/utils'

const FALLBACK_BG = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'

interface NetworkBadgeProps {
  networkId: number
  className?: string
}

export function NetworkBadge({ networkId, className }: NetworkBadgeProps) {
  const name = getNetworkName(networkId)
  const badgeBg = NETWORK_BADGES_DARK[networkId] ?? FALLBACK_BG

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
        badgeBg,
        className,
      )}
    >
      <NetworkIcon chainId={networkId} size={12} className="-ml-0.5" />
      {name}
    </span>
  )
}
