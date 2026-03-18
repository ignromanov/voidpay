import type { TlvHeader, TlvRecord } from './types'
import { MAGIC, VERSION, MAX_TLV_COUNT, MAX_VALUE_SIZE } from './types'

/**
 * Parse binary TLV format.
 * Header: [MAGIC(1), VERSION(1), FLAGS(1), COUNT(1)]
 * Each TLV: [TYPE(1), LENGTH_HI(1), LENGTH_LO(1), VALUE(length)]
 */
export function readTlv(bytes: Uint8Array): { header: TlvHeader; records: TlvRecord[] } {
  if (bytes.length < 4) {
    throw new Error('TLV data too short: need at least 4 bytes for header')
  }

  const magic = bytes[0]!
  const version = bytes[1]!
  const flags = bytes[2]!
  const tlvCount = bytes[3]!

  if (magic !== MAGIC) {
    throw new Error(`Invalid magic byte: 0x${magic.toString(16)}, expected 0x${MAGIC.toString(16)}`)
  }
  if (version !== VERSION) {
    throw new Error(`Unsupported version: ${version}, expected ${VERSION}`)
  }
  if (tlvCount > MAX_TLV_COUNT) {
    throw new Error(`TLV count ${tlvCount} exceeds max ${MAX_TLV_COUNT}`)
  }

  const header: TlvHeader = { magic, version, flags, tlvCount }
  const records: TlvRecord[] = []

  let offset = 4
  for (let i = 0; i < tlvCount; i++) {
    if (offset + 3 > bytes.length) {
      throw new Error(`Truncated TLV at record ${i}: need type + length bytes`)
    }
    const type = bytes[offset]!
    const length = (bytes[offset + 1]! << 8) | bytes[offset + 2]!
    offset += 3

    if (length > MAX_VALUE_SIZE) {
      throw new Error(`TLV value size ${length} exceeds max ${MAX_VALUE_SIZE}`)
    }

    if (offset + length > bytes.length) {
      throw new Error(
        `Truncated TLV at record ${i}: need ${length} value bytes, have ${bytes.length - offset}`,
      )
    }
    const value = bytes.slice(offset, offset + length)
    offset += length
    records.push({ type, value })
  }

  return { header, records }
}
