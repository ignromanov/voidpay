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
 * Format a wallet address for display (e.g., "0x1234...5678").
 */
export function formatShortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
