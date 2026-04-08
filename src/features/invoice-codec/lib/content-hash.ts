/**
 * Compute SHA-256 content hash of an encoded invoice fragment.
 * Returns 64 hex chars (32 bytes). Deterministic: same content → same hash.
 *
 * Format: bytes32-compatible (ERC-3009 nonce). Add `0x` prefix for on-chain use.
 *
 * Used as:
 * - TrackedInvoice store key (collision-free identity)
 * - ERC-3009 `transferWithAuthorization` nonce for x402 payment matching (v1.3)
 *   Given invoice → contentHash → search on-chain for tx with nonce → payment found
 *
 * Lives in codec because it operates on encoded invoice data
 * and will ship with the codec npm package.
 */
export async function computeContentHash(fragment: string): Promise<string> {
  const data = new TextEncoder().encode(fragment)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray, (b) => b.toString(16).padStart(2, '0')).join('')
}
