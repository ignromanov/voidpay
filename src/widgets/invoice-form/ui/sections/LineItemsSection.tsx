'use client'

import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { useCreatorStore } from '@/entities/creator'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'

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
        <motion.div layout>
          <Button
            onClick={addLineItem}
            variant="ghost"
            size="sm"
            className="text-violet-400 hover:text-violet-300"
            disabled={lineItems.length >= 5}
            title={lineItems.length >= 5 ? 'Maximum 5 items' : undefined}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Item
          </Button>
        </motion.div>
      </div>

      <div className="space-y-2">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-3 text-right">Price</div>
          <div className="col-span-1" />
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
