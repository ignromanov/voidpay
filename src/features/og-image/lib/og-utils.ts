/**
 * OG Image Shared Utilities
 *
 * Client-safe network metadata and formatting for OG image rendering.
 * Does NOT import from @/entities/network (which pulls in viem/chains)
 * so it's safe for 'use client' pages like /og-image.
 *
 * Server-side code (render.tsx) should prefer NETWORK_CODE_COLORS/NETWORK_CODE_NAMES
 * from @/entities/network for the full set including testnets.
 */

/** Network short code → display metadata for OG images (mainnet only, client-safe) */
export const OG_NETWORKS: Record<string, { name: string; color: string }> = {
  eth: { name: 'Ethereum', color: '#818CF8' },
  arb: { name: 'Arbitrum', color: '#60A5FA' },
  op: { name: 'Optimism', color: '#F87171' },
  poly: { name: 'Polygon', color: '#C084FC' },
}

/** Add thousand separators to a formatted decimal string (e.g., "1250.00" → "1,250.00") */
export function formatDisplayAmount(value: string): string {
  const [integer, decimal] = value.split('.')
  if (!integer) return value
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted
}
