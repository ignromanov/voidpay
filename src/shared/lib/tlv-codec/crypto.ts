import { hmac } from '@noble/hashes/hmac.js'
import { sha256 } from '@noble/hashes/sha2.js'

/**
 * Derive deterministic pseudo-random bytes via HMAC-SHA256.
 * Sync, browser-safe, zero-dep (uses @noble/hashes, transitive via viem).
 */
export function derivePRNG(salt: Uint8Array, label: string): Uint8Array {
  return hmac(sha256, salt, new TextEncoder().encode(label))
}
