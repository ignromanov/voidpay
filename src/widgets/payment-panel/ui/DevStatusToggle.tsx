import type { PaymentPanelStatus } from '../types'

interface DevStatusToggleProps {
  status: PaymentPanelStatus
  onCycle: () => void
}

/**
 * Dev-only button that displays current payment status and cycles through
 * pending → paid → overdue on click. Tree-shaken in production builds.
 */
export function DevStatusToggle({ status, onCycle }: DevStatusToggleProps) {
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <button
      data-testid="dev-status-toggle"
      onClick={onCycle}
      className="absolute top-2.5 left-3 z-10 cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
      title="Dev: cycle payment status"
    >
      [{status}]
    </button>
  )
}
