'use client'

import { AnimatePresence } from 'framer-motion'

import { useCreatorStore } from '@/entities/creator'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { PlusIcon } from '@/shared/ui/icons'

import { InvoiceItemRow } from '../InvoiceItemRow'

export interface LineItemsSectionProps {
  decimals: number
}

/**
 * Line items section with add button and item rows.
 * Manages line items directly via store (not form).
 */
export function LineItemsSection({ decimals }: LineItemsSectionProps) {
  const lineItems = useCreatorStore((s) => s.lineItems)
  const addLineItem = useCreatorStore((s) => s.addLineItem)
  const updateLineItem = useCreatorStore((s) => s.updateLineItem)
  const removeLineItem = useCreatorStore((s) => s.removeLineItem)

  return (
    <div className="space-y-4 border-t border-zinc-800/50 pt-4">
      <div className="flex items-center justify-between">
        <Text variant="label" className="text-zinc-500">
          Line Items *
        </Text>
        <Button
          onClick={addLineItem}
          variant="ghost"
          size="sm"
          className="text-violet-400 hover:text-violet-300"
          disabled={lineItems.length >= 5}
          title={lineItems.length >= 5 ? 'Maximum 5 items' : undefined}
          aria-label="Add line item"
        >
          <PlusIcon size={12} className="mr-1" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        {/* Table Header — matches InvoiceItemRow flex layout */}
        <div className="flex gap-2 px-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <div className="flex-1 min-w-0">Description</div>
          <div className="w-14 flex-shrink-0 text-center">Qty</div>
          <div className="w-20 flex-shrink-0 text-right">Price</div>
          <div className="w-24 flex-shrink-0 text-right">Total</div>
          <div className="w-6 flex-shrink-0" />
        </div>

        <AnimatePresence>
          {lineItems.map((item) => (
            <InvoiceItemRow
              key={item.id}
              item={item}
              decimals={decimals}
              onUpdate={(updates) => updateLineItem(item.id, updates)}
              onRemove={() => removeLineItem(item.id)}
              canRemove={lineItems.length > 1}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
