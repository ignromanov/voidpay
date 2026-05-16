import { Input } from '@/shared/ui/input'
import { Text } from '@/shared/ui/typography'
import { CalendarIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'

export interface MetadataSectionViewProps {
  invoiceId?: string
  issuedAt?: string
  dueAt?: string
}

/**
 * MetadataSectionView — pure presentational display of invoice metadata.
 *
 * No react-hook-form, no browser hooks. Safe for Remotion, SSR, Storybook.
 * Container: MetadataSection.tsx
 */
export function MetadataSectionView({ invoiceId, issuedAt, dueAt }: MetadataSectionViewProps): React.JSX.Element {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <Input
        label="Invoice No. *"
        value={invoiceId ?? ''}
        placeholder="INV-2026-001"
        className="font-mono"
        readOnly
      />

      <div className="space-y-1.5">
        <Text variant="label" className="flex items-center gap-1.5 text-zinc-400">
          <CalendarIcon size={12} /> Dates (Issue / Due) *
        </Text>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div
            className={cn(
              'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
              issuedAt ? 'text-zinc-200' : 'text-zinc-600'
            )}
          >
            {issuedAt ?? 'Issue date'}
          </div>
          <div
            className={cn(
              'rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm',
              dueAt ? 'text-zinc-200' : 'text-zinc-600'
            )}
          >
            {dueAt ?? 'Due date'}
          </div>
        </div>
      </div>
    </div>
  )
}
