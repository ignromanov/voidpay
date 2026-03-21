'use client'

import { useState, useCallback, useMemo } from 'react'
import { Trash2Icon } from '@/shared/ui/icons'
import { motion } from '@/shared/ui/motion'

import { Button } from '@/shared/ui/button'
import { type LineItem, FIELD_LIMITS } from '@/shared/lib/invoice-types'
import { parseAmount, formatAmount } from '@/shared/lib/amount-utils'
import { cn } from '@/shared/lib/utils'

export interface InvoiceItemRowProps {
  item: LineItem
  /** Token decimals for amount conversion (default: 6 for USDC) */
  decimals?: number
  onUpdate: (updates: Partial<Omit<LineItem, 'id'>>) => void
  onRemove: () => void
  canRemove: boolean
}

/**
 * InvoiceItemRow Component
 *
 * Single line item row with description, quantity, and price inputs.
 * Handles conversion between human-readable input and atomic units storage.
 * Uses Framer Motion for layout animations.
 */
export function InvoiceItemRow({
  item,
  decimals = 6,
  onUpdate,
  onRemove,
  canRemove,
}: InvoiceItemRowProps) {
  // Local state for human-readable rate input
  // This allows users to type intermediate values like "150." without immediate conversion
  const [rateInput, setRateInput] = useState(() => {
    // Initialize with formatted value from atomic units
    if (item.rate && item.rate !== '0') {
      return formatAmount(item.rate, decimals)
    }
    return ''
  })

  // Handle rate input change
  const handleRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      // Allow empty input
      if (value === '') {
        setRateInput('')
        onUpdate({ rate: '0' })
        return
      }

      // Try to clean pasted values like "$150.00" or "150,00"
      const cleaned = value.replace(/[$€£]/g, '').replace(',', '.')

      // Validate input format (allow numbers with optional decimal)
      if (!/^\d*\.?\d*$/.test(cleaned)) {
        return // Reject invalid input
      }

      // Update local input state with cleaned value
      setRateInput(cleaned)

      // Convert to atomic units and update parent
      const atomicRate = parseAmount(cleaned, decimals)
      onUpdate({ rate: atomicRate })
    },
    [decimals, onUpdate]
  )

  // Handle blur - format the input properly
  const handleRateBlur = useCallback(() => {
    if (item.rate && item.rate !== '0') {
      // Re-format to ensure consistent display
      setRateInput(formatAmount(item.rate, decimals))
    }
  }, [item.rate, decimals])

  // Calculate line total using BigInt
  const lineTotal = useMemo(() => {
    const ZERO = BigInt(0)
    const scale = BigInt(Math.pow(10, decimals))
    const rate = BigInt(item.rate || '0')

    if (rate === ZERO) return '0.00'

    const qtyScaled = BigInt(Math.round(item.quantity * Number(scale)))
    const total = (qtyScaled * rate) / scale

    return formatAmount(total.toString(), decimals)
  }, [item.quantity, item.rate, decimals])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-col gap-2 overflow-hidden rounded-lg border border-transparent bg-zinc-900/40 p-3 transition-colors hover:border-zinc-800"
    >
      {/* Top row: Description + Delete */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Item description"
            value={item.description}
            maxLength={FIELD_LIMITS.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            aria-label="Item description"
            autoComplete="off"
            className="w-full border-b border-zinc-800 bg-transparent py-1 text-sm text-zinc-200 transition-colors outline-none placeholder:text-zinc-700 focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50"
          />
        </div>
        <Button
          onClick={onRemove}
          variant="ghost"
          size="icon"
          aria-label="Remove item"
          className={cn(
            'min-w-[44px] min-h-[44px] p-0 text-zinc-500 opacity-50 transition-opacity hover:text-red-400 hover:opacity-100 hover:bg-red-500/10',
            !canRemove && 'invisible'
          )}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Bottom row: Qty + Price + Total (right-aligned) */}
      <div className="flex items-start justify-end gap-2">
        <div className="w-14 flex-shrink-0">
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            min={1}
            max={FIELD_LIMITS.maxQuantity}
            onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 1 })}
            aria-label="Item quantity"
            autoComplete="off"
            className="w-full border-b border-zinc-800 bg-transparent py-1 text-center text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50"
          />
        </div>
        <div className="w-24 flex-shrink-0">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={rateInput}
            maxLength={FIELD_LIMITS.rate}
            onChange={handleRateChange}
            onBlur={handleRateBlur}
            aria-label="Item price"
            autoComplete="off"
            className="w-full border-b border-zinc-800 bg-transparent py-1 text-right text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50"
          />
        </div>
        <div className="w-24 flex-shrink-0 overflow-hidden">
          <div
            className="border-b border-zinc-800 py-1 text-right font-mono text-sm text-zinc-400 truncate"
            title={lineTotal}
          >
            {lineTotal}
          </div>
        </div>
        {/* Spacer matching delete button width */}
        <div className="min-w-[44px] flex-shrink-0" />
      </div>
    </motion.div>
  )
}
