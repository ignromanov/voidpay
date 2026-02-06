import type { ReactNode } from 'react'
import { WalletIcon } from '@/shared/ui/icons'

interface ActionSlotProps {
  children?: ReactNode
}

export function ActionSlot({ children }: ActionSlotProps) {
  return (
    <div className="mt-2">
      {children || (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-3 text-sm text-zinc-500">
          <WalletIcon size={16} />
          <span>Connect Wallet to Pay</span>
        </div>
      )}
    </div>
  )
}
