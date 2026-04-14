import { NetworkIcon } from '@/shared/ui/network-icon'
import { getNetworkName } from '@/entities/network'
import { cn } from '@/shared/lib/utils'

interface NetworkChipProps {
  networkId: number
  className?: string
}

export function NetworkChip({ networkId, className }: NetworkChipProps) {
  return (
    <span
      data-testid="payment-network-chip"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] font-medium text-zinc-300',
        className,
      )}
    >
      <NetworkIcon chainId={networkId} size={14} />
      <span>{getNetworkName(networkId)}</span>
    </span>
  )
}
