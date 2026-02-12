import { motion } from '@/shared/ui/motion'
import { CheckIcon, ClockIcon, ChevronUpIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'

interface MinimizedPillProps {
  isPaid: boolean
  onExpand: () => void
}

export function MinimizedPill({ isPaid, onExpand }: MinimizedPillProps) {
  return (
    <motion.div
      key="minimized"
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      data-testid="payment-pill"
      onClick={onExpand}
      className={cn(
        'group mx-auto flex w-full max-w-sm cursor-pointer items-center justify-between rounded-full border p-2 shadow-2xl backdrop-blur-md transition-colors',
        isPaid
          ? 'border-emerald-500/30 bg-zinc-900/90 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]'
          : 'border-zinc-700 bg-zinc-900/90',
      )}
    >
      <div className="flex items-center gap-3 pl-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border',
            isPaid
              ? 'border-emerald-500/30 bg-emerald-500/20'
              : 'border-amber-500/30 bg-amber-500/20',
          )}
        >
          {isPaid ? (
            <CheckIcon size={16} className="text-emerald-400" />
          ) : (
            <ClockIcon size={16} className="text-amber-400" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none text-white">
            {isPaid ? 'Payment Successful' : 'Waiting for Payment'}
          </span>
          <span className="mt-0.5 text-[10px] leading-none text-zinc-400">
            Click to expand details
          </span>
        </div>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 transition-colors group-hover:bg-zinc-700">
        <ChevronUpIcon size={16} className="text-zinc-400" />
      </div>
    </motion.div>
  )
}
