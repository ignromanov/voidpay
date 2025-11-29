'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'
import { motion } from '@/shared/ui/motion'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { LineItem } from '@/entities/invoice/model/types'
import { cn } from '@/shared/lib/utils'

/**
 * InvoiceItemRow Component Props
 *
 * Constitutional Principle VII: Web3 Safety
 * - Validates quantity > 0
 * - Validates rate as decimal string
 * - Calculates line total accurately
 */
export interface InvoiceItemRowProps {
  /** Line item data */
  item: LineItem

  /** Currency symbol for display (e.g., "USDC") */
  currencySymbol: string

  /** Item update handler */
  onUpdate: (item: LineItem) => void

  /** Item remove handler */
  onRemove: () => void

  /** Index for animation delay */
  index?: number
}

/**
 * Invoice Line Item Row with Animations
 *
 * Editable row for invoice line items with Framer Motion animations.
 * Calculates line total based on quantity × rate.
 *
 * @example
 * ```tsx
 * <InvoiceItemRow
 *   item={lineItem}
 *   currencySymbol="USDC"
 *   onUpdate={(updated) => updateItem(updated)}
 *   onRemove={() => removeItem(item.id)}
 * />
 * ```
 */
export function InvoiceItemRow({
  item,
  currencySymbol,
  onUpdate,
  onRemove,
  index = 0,
}: InvoiceItemRowProps) {
  // Calculate line total
  const lineTotal = React.useMemo(() => {
    const qty = Number(item.quantity)
    const rate = Number(item.rate)

    if (isNaN(qty) || isNaN(rate)) return '0.00'

    const total = qty * rate
    return total.toFixed(2)
  }, [item.quantity, item.rate])

  // Update handlers
  const handleDescriptionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...item,
        description: e.target.value,
      })
    },
    [item, onUpdate]
  )

  const handleQuantityChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const numValue = Number(value)

      // Validate quantity > 0
      if (value === '' || (!isNaN(numValue) && numValue > 0)) {
        onUpdate({
          ...item,
          quantity: numValue || 0,
        })
      }
    },
    [item, onUpdate]
  )

  const handleRateChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      // Validate decimal format
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        onUpdate({
          ...item,
          rate: value,
        })
      }
    },
    [item, onUpdate]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.2,
        delay: index * 0.05,
      }}
      className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-700"
    >
      <div className="grid flex-1 grid-cols-12 gap-3">
        {/* Description - wider */}
        <div className="col-span-6">
          <Input
            value={item.description}
            onChange={handleDescriptionChange}
            placeholder="Item description"
            className="h-9"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-2">
          <Input
            type="number"
            value={item.quantity || ''}
            onChange={handleQuantityChange}
            placeholder="Qty"
            min="0.01"
            step="0.01"
            className="h-9"
          />
        </div>

        {/* Rate */}
        <div className="col-span-2">
          <Input
            type="text"
            value={item.rate}
            onChange={handleRateChange}
            placeholder="0.00"
            className="h-9 font-mono"
          />
        </div>

        {/* Total (calculated, read-only) */}
        <div className="col-span-2 flex items-center">
          <div className="flex h-9 w-full items-center rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 font-mono text-sm text-zinc-400">
            {lineTotal} {currencySymbol}
          </div>
        </div>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className={cn(
          'h-9 w-9 opacity-0 transition-opacity group-hover:opacity-100',
          'text-zinc-500 hover:bg-red-950/20 hover:text-red-400'
        )}
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
