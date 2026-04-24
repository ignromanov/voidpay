import { cn } from '@/shared/lib/utils'

export interface ReadonlyInputProps {
  label: string
  value?: string | undefined
  placeholder: string
  focused?: boolean | undefined
  mono?: boolean | undefined
  focusRingClass?: string | undefined
}

function defaultFocusRing(active: boolean): string {
  return active ? 'ring-2 ring-violet-500/60 ring-offset-1 ring-offset-zinc-950' : ''
}

export function ReadonlyInput({
  label,
  value,
  placeholder,
  focused,
  mono,
  focusRingClass,
}: ReadonlyInputProps): React.JSX.Element {
  const ringClass = focused
    ? (focusRingClass ?? defaultFocusRing(true))
    : ''

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</label>
      <div
        className={cn(
          'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm transition-all',
          mono && 'font-mono',
          ringClass,
          !value && 'text-zinc-600',
          value && 'text-zinc-200'
        )}
      >
        {value ?? placeholder}
      </div>
    </div>
  )
}
