'use client'

import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/shared/ui'
import type { LineItem } from '@/shared/lib/invoice-types'

export interface InvoiceItemRowProps {
  item: LineItem
  currency: string
  onUpdate: (updates: Partial<Omit<LineItem, 'id'>>) => void
  onRemove: () => void
  canRemove: boolean
}

/**
 * InvoiceItemRow Component
 *
 * Single line item row with description, quantity, and price inputs.
 * Uses Framer Motion for layout animations.
 */
export function InvoiceItemRow({
  item,
  currency: _currency,
  onUpdate,
  onRemove,
  canRemove,
}: InvoiceItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="group grid grid-cols-12 items-start gap-2 overflow-hidden rounded border border-transparent bg-zinc-900/40 p-2 transition-colors hover:border-zinc-800"
    >
      <div className="col-span-6">
        <input
          type="text"
          placeholder="Description *"
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full border-b border-zinc-800 bg-transparent py-1 text-sm text-zinc-200 transition-colors outline-none placeholder:text-zinc-700 focus:border-violet-500"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 1 })}
          className="w-full border-b border-zinc-800 bg-transparent py-1 text-center text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500"
        />
      </div>
      <div className="col-span-3">
        <input
          type="number"
          placeholder="Price *"
          value={item.rate}
          onChange={(e) => onUpdate({ rate: e.target.value })}
          className="w-full border-b border-zinc-800 bg-transparent py-1 text-right text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500"
        />
      </div>
      <div className="col-span-1 flex justify-end pt-1">
        {canRemove && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
