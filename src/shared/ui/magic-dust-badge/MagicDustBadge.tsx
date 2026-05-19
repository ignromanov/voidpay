import { FingerprintIcon, InfoIcon } from '@/shared/ui/icons'

interface MagicDustBadgeProps {
  /** Context-appropriate label: "Exact amount", "Unique ID", "Sent", "Was due" */
  label: string
  /** Formatted amount string (e.g. "315.000042") */
  amount: string
  /** Token currency symbol (e.g. "USDC") */
  currency: string
  /** Visual variant for light (paper) vs dark (panel) backgrounds */
  variant?: 'light' | 'dark'
  /** Token decimals. If > 8, switches to atomic display mode */
  decimals?: number
  /** Raw atomic dust value (e.g. "42"). Required for atomic display mode (decimals > 8) */
  dustAtomicValue?: string
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
  decimals,
  dustAtomicValue,
}: MagicDustBadgeProps) {
  const styles = VARIANT_STYLES[variant]

  const isAtomicMode = decimals !== undefined && decimals > 8 && dustAtomicValue !== undefined

  const displayAmount = isAtomicMode ? `+${dustAtomicValue}` : amount
  const tooltipText = isAtomicMode ? `+${amount} ${currency}` : undefined

  return (
    <div className="flex items-center gap-1" data-magic-dust="">
      <FingerprintIcon size={10} className={`flex-shrink-0 ${styles.icon}`} aria-hidden="true" />
      <span className={`text-[9px] font-mono ${styles.label}`}>{label}:</span>
      <span className={`text-[9px] font-mono tabular-nums ${styles.amount}`}>
        {displayAmount} {currency}
      </span>
      {isAtomicMode && (
        <span
          data-testid="magic-dust-info-icon"
          title={tooltipText}
          aria-label="Full precision amount"
          className="flex-shrink-0 cursor-help"
        >
          <InfoIcon size={10} className={styles.icon} aria-hidden="true" />
        </span>
      )}
    </div>
  )
}
