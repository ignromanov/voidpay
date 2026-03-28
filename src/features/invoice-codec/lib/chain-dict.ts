/**
 * Chain ID dictionary — maps known EVM chain IDs to 1-byte codes for compact encoding.
 *
 * Encoding scheme:
 *   0x00 <code>   — known chain (dict lookup, 2 bytes total)
 *   0x01 <varint> — unknown chain (raw varint, 2+ bytes total)
 */

import { writeVarInt, readVarInt } from '@/shared/lib/tlv-codec'

const CHAIN_TO_CODE: Record<number, number> = {
  1: 0x01,     // Ethereum
  42161: 0x02, // Arbitrum
  10: 0x03,    // Optimism
  137: 0x04,   // Polygon
  8453: 0x05,  // Base
}

const CODE_TO_CHAIN: Record<number, number> = Object.fromEntries(
  Object.entries(CHAIN_TO_CODE).map(([k, v]) => [v, Number(k)])
)

/** Encode chainId: 0x00 + dict_code for known chains, 0x01 + varint for unknown */
export function encodeChainId(buf: number[], chainId: number): void {
  const code = CHAIN_TO_CODE[chainId]
  if (code !== undefined) {
    buf.push(0x00, code)
  } else {
    buf.push(0x01)
    writeVarInt(buf, chainId)
  }
}

/** Decode chainId from dict code or raw varint */
export function decodeChainId(
  bytes: Uint8Array,
  offset: number,
): { chainId: number; bytesRead: number } {
  const prefix = bytes[offset]!
  if (prefix === 0x00) {
    const code = bytes[offset + 1]!
    const chainId = CODE_TO_CHAIN[code]
    if (chainId === undefined) throw new Error(`Unknown chain dict code: ${code}`)
    return { chainId, bytesRead: 2 }
  }
  if (prefix !== 0x01) throw new Error(`Invalid chain prefix: 0x${prefix.toString(16)}`)
  const { value, bytesRead } = readVarInt(bytes, offset + 1)
  return { chainId: value, bytesRead: 1 + bytesRead }
}
