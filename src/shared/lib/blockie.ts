/**
 * Blockie Hash Generator
 *
 * Generates a simple hash and color scheme for Ethereum addresses
 * Used to create visual identifiers (blockies) for wallet addresses
 *
 * Constitutional Principle II: Privacy-First
 * - Purely client-side hash generation
 * - No external API calls for address visualization
 */

/**
 * Simple hash function for generating deterministic colors from addresses
 *
 * @param address - Ethereum address to hash
 * @returns Numeric hash value (0-15)
 */
export function generateBlockieHash(address: string): number {
  if (!address || address.length < 10) return 0

  // Use last 8 characters for better distribution
  const seed = address.slice(-8).toLowerCase()

  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Return value between 0-15 for color selection
  return Math.abs(hash) % 16
}

/**
 * Color palette for blockies (16 distinct colors)
 *
 * Chosen for visual distinctiveness and accessibility
 */
const BLOCKIE_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
]

/**
 * Get deterministic Tailwind color class for an address
 *
 * @param address - Ethereum address
 * @returns Tailwind color class (e.g., "bg-blue-500")
 */
export function getBlockieColor(address: string): string {
  const hash = generateBlockieHash(address)
  return BLOCKIE_COLORS[hash] ?? 'bg-zinc-500'
}
