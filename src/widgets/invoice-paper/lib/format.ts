/**
 * Format a numeric amount for display in invoices.
 * Handles both string and number inputs, with NaN fallback to '0.00'.
 */
export function formatAmount(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format a rate (price per unit) for display.
 * Shows up to 6 decimal places, trimming trailing zeros.
 * This preserves precision for small crypto values like 0.000001 ETH.
 */
export function formatRate(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0.00'

  // Format with up to 6 decimals, then trim trailing zeros
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })

  // Remove trailing zeros after decimal, but keep at least 2 decimals
  return formatted.replace(/(\.\d{2,})0+$/, '$1').replace(/(\.\d{2})0+$/, '$1')
}

export { truncateAddress, truncateAddress as formatShortAddress } from '@/shared/lib/validation'
