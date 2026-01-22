'use client'

import { useState, useCallback, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/shared/ui/button'
import { type LineItem, FIELD_LIMITS } from '@/shared/lib/invoice-types'
import { parseAmount, formatAmount } from '@/shared/lib/amount-utils'

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
      className="group grid grid-cols-12 items-start gap-2 overflow-hidden rounded border border-transparent bg-zinc-900/40 p-2 transition-colors hover:border-zinc-800"
    >
      <div className="col-span-5">
        <input
          type="text"
          placeholder="Description *"
          value={item.description}
          maxLength={FIELD_LIMITS.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full border-b border-zinc-800 bg-transparent py-1 text-sm text-zinc-200 transition-colors outline-none placeholder:text-zinc-700 focus:border-violet-500"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Qty"
          value={item.quantity}
          min={1}
          max={FIELD_LIMITS.maxQuantity}
          onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 1 })}
          className="w-full border-b border-zinc-800 bg-transparent py-1 text-center text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Price *"
          value={rateInput}
          maxLength={FIELD_LIMITS.rate}
          onChange={handleRateChange}
          onBlur={handleRateBlur}
          className="w-full border-b border-zinc-800 bg-transparent py-1 text-right text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500"
        />
      </div>
      <div className="col-span-2">
        <div className="border-b border-zinc-800 py-1 text-right font-mono text-sm text-zinc-400">
          {lineTotal}
        </div>
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
