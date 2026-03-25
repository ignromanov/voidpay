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
  /** When true, highlight invalid fields (empty description, zero rate) */
  showErrors?: boolean | undefined
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
  showErrors = false,
}: InvoiceItemRowProps) {
  const qtyId = `qty-${item.id}`
  const priceId = `price-${item.id}`
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

  // Field-level validation for error highlighting
  const descriptionEmpty = showErrors && !item.description
  const rateZero = showErrors && (!item.rate || item.rate === '0')

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
      data-field-error={(descriptionEmpty || rateZero) || undefined}
      className="overflow-hidden rounded-lg border border-transparent bg-zinc-900/40 p-3 transition-colors hover:border-zinc-800"
    >
      {/* Top row: Description + Delete */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Item description"
          value={item.description}
          maxLength={FIELD_LIMITS.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          aria-label="Item description"
          autoComplete="off"
          className={cn(
            'min-w-0 flex-1 border-b bg-transparent py-1 text-sm text-zinc-200 transition-colors outline-none placeholder:text-zinc-700 focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50',
            descriptionEmpty ? 'border-red-500/50' : 'border-zinc-800'
          )}
        />
        <Button
          onClick={onRemove}
          variant="ghost"
          size="icon"
          aria-label="Remove item"
          className={cn(
            'min-h-[44px] min-w-[44px] p-0 text-zinc-500 opacity-50 transition-opacity hover:bg-red-500/10 hover:text-red-400 hover:opacity-100',
            !canRemove && 'invisible'
          )}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>
      {descriptionEmpty && (
        <p className="mt-1 text-xs text-red-400">Description is required</p>
      )}

      {/* Bottom row: Qty + Price + Total (full-width grid with inline labels) */}
      <div className="mt-2 grid grid-cols-3 gap-3">
        <div>
          <label htmlFor={qtyId} className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Qty
          </label>
          <input
            id={qtyId}
            type="number"
            placeholder="1"
            value={item.quantity}
            min={1}
            max={FIELD_LIMITS.maxQuantity}
            onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 1 })}
            autoComplete="off"
            className="w-full border-b border-zinc-800 bg-transparent py-2 tabular-nums text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50"
          />
        </div>
        <div>
          <label htmlFor={priceId} className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Price
          </label>
          <input
            id={priceId}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={rateInput}
            maxLength={FIELD_LIMITS.rate}
            onChange={handleRateChange}
            onBlur={handleRateBlur}
            autoComplete="off"
            className={cn(
              'w-full border-b bg-transparent py-2 text-right tabular-nums text-sm text-zinc-200 transition-colors outline-none focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/50',
              rateZero ? 'border-red-500/50' : 'border-zinc-800'
            )}
          />
          {rateZero && (
            <p className="mt-1 text-xs text-red-400">Price is required</p>
          )}
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Total
          </span>
          <div
            className="truncate border-b border-zinc-800 py-2 text-right font-mono tabular-nums text-sm text-zinc-400"
            title={lineTotal}
          >
            {lineTotal}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
