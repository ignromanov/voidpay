import { FingerprintIcon } from '@/shared/ui/icons'

interface MagicDustBadgeProps {
  /** Context-appropriate label: "Exact amount", "Unique ID", "Sent", "Was due" */
  label: string
  /** Formatted amount string (e.g. "315.000042") */
  amount: string
  /** Token currency symbol (e.g. "USDC") */
  currency: string
  /** Visual variant for light (paper) vs dark (panel) backgrounds */
  variant?: 'light' | 'dark'
}

const VARIANT_STYLES = {
  dark: {
    icon: 'text-violet-400/60',
    label: 'text-zinc-500',
    amount: 'text-zinc-400',
  },
  light: {
    icon: 'text-violet-400',
    label: 'text-zinc-400',
    amount: 'text-zinc-500',
  },
} as const

export function MagicDustBadge({
  label,
  amount,
  currency,
  variant = 'dark',
}: MagicDustBadgeProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <div className="flex items-center gap-1">
      <FingerprintIcon size={10} className={`flex-shrink-0 ${styles.icon}`} aria-hidden="true" />
      <span className={`text-[9px] font-mono ${styles.label}`}>{label}:</span>
      <span className={`text-[9px] font-mono tabular-nums ${styles.amount}`}>
        {amount} {currency}
      </span>
    </div>
  )
}
