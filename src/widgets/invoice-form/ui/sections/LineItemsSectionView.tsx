import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { PlusIcon } from '@/shared/ui/icons'
import { cn } from '@/shared/lib/utils'

export interface LineItemRowViewProps {
  description?: string
  quantity?: number
  rate?: string
  focused?: boolean
}

export function LineItemRowView({ description, quantity, rate, focused = false }: LineItemRowViewProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-transparent bg-zinc-900/40 p-3 transition-colors',
        focused && 'ring-2 ring-violet-500/60 ring-offset-1 ring-offset-zinc-950'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'min-w-0 flex-1 border-b py-1 text-base transition-colors',
            description ? 'border-zinc-800 text-zinc-200' : 'border-zinc-800 text-zinc-600'
          )}
        >
          {description ?? 'Item description'}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Qty</p>
          <div className="border-b border-zinc-800 py-2 tabular-nums text-base text-zinc-200">
            {quantity ?? 1}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Price</p>
          <div className="border-b border-zinc-800 py-2 text-right tabular-nums text-base text-zinc-200">
            {rate ?? '0.00'}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Total</p>
          <div className="border-b border-zinc-800 py-2 text-right tabular-nums text-base text-zinc-200">
            {rate ?? '0.00'}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface LineItemsSectionViewProps {
  lineItems?: Array<{
    description?: string
    quantity?: number
    rate?: string
  }>
  focused?: boolean
}

/**
 * LineItemsSectionView — pure presentational display of line items.
 *
 * No useCreatorStore, no browser hooks. Safe for Remotion, SSR, Storybook.
 * Add Item button is rendered but disabled (non-interactive).
 * Container: LineItemsSection.tsx
 */
export function LineItemsSectionView({ lineItems, focused = false }: LineItemsSectionViewProps): React.JSX.Element {
  const items = lineItems?.length ? lineItems : [{}]

  return (
    <div className="space-y-4 border-t border-zinc-800/50 pt-4">
      <div className="flex items-center justify-between">
        <Text variant="label" className="text-zinc-500">
          Line Items *
        </Text>
        <Button variant="ghost" size="sm" className="min-h-[44px] text-violet-400 hover:text-violet-300" disabled>
          <PlusIcon size={12} className="mr-1" />
          Add Item
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <LineItemRowView
            key={i}
            {...(item.description !== undefined && { description: item.description })}
            {...(item.quantity !== undefined && { quantity: item.quantity })}
            {...(item.rate !== undefined && { rate: item.rate })}
            focused={focused}
          />
        ))}
      </div>
    </div>
  )
}
