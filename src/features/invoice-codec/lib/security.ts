import type { TlvRecord } from '@/shared/lib/tlv-codec'
import { derivePRNG, writeVarInt } from '@/shared/lib/tlv-codec'
import { keccak256, toBytes, toHex } from 'viem'
import { TlvType } from './tlv-map'

/** Generate 16 random bytes for invoice salt */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

/**
 * Compute domain separator: keccak256("VOIDPAY_INVOICE_V1" || canonical TLV body excluding Type 31).
 * Ensures invoice integrity — any field change invalidates the separator.
 *
 * Uses varint length encoding to match the new TLV wire format.
 */
export function computeDomainSeparator(records: TlvRecord[]): Uint8Array {
  const prefix = new TextEncoder().encode('VOIDPAY_INVOICE_V1')

  // Serialize all records except domain separator itself (Type 31)
  const parts: Uint8Array[] = [prefix]
  for (const record of records) {
    if (record.type === TlvType.DOMAIN_SEPARATOR) continue
    // Serialize: type(1) + length(varint) + value — matches wire TLV format
    const lenBuf: number[] = []
    writeVarInt(lenBuf, record.value.length)
    const chunk = new Uint8Array(1 + lenBuf.length + record.value.length)
    chunk[0] = record.type
    chunk.set(new Uint8Array(lenBuf), 1)
    chunk.set(record.value, 1 + lenBuf.length)
    parts.push(chunk)
  }

  // Concatenate all parts
  const totalLen = parts.reduce((acc, p) => acc + p.length, 0)
  const body = new Uint8Array(totalLen)
  let offset = 0
  for (const part of parts) {
    body.set(part, offset)
    offset += part.length
  }

  // keccak256 hash
  const hash = keccak256(body)
  return toBytes(hash)
}

/**
 * Validate security constraints on decoded TLV records.
 * - Salt (Type 20) must be present and >= 16 bytes
 * - If Domain Separator (Type 31) present, must match recomputed value
 */
export function validateSecurity(records: TlvRecord[]): void {
  const saltRecord = records.find((r) => r.type === TlvType.SALT)
  if (!saltRecord) {
    throw new Error('Missing required salt (Type 20)')
  }
  if (saltRecord.value.length < 16) {
    throw new Error(`Salt too short: ${saltRecord.value.length} bytes, need >= 16`)
  }

  const domSepRecord = records.find((r) => r.type === TlvType.DOMAIN_SEPARATOR)
  if (!domSepRecord) {
    throw new Error('Missing required domain separator (Type 31)')
  }
  const expected = computeDomainSeparator(records)
  if (toHex(domSepRecord.value) !== toHex(expected)) {
    throw new Error('Domain separator mismatch — invoice may be tampered')
  }
}

/**
 * Derive deterministic magic dust value from salt.
 * Returns 1-999 (matches existing FIELD_LIMITS).
 */
export function deriveMagicDust(salt: Uint8Array): number {
  const derived = derivePRNG(salt, 'magic_dust')
  const num =
    (((derived[0]! << 24) | (derived[1]! << 16) | (derived[2]! << 8) | derived[3]!) >>> 0)
  return (num % 999) + 1
}
