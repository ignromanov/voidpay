import type { TlvHeader, TlvRecord } from './types'
import { MAGIC, VERSION, MAX_TLV_COUNT, MAX_VALUE_SIZE } from './types'
import { readVarInt } from './varint'
import { decompressPayload } from './compress'

/**
 * Parse binary TLV format.
 * Transparently handles whole-payload Brotli compression (VERSION high bit).
 * Header: [MAGIC(1), VERSION(1), COUNT(1)]
 * Each TLV: [TYPE(1), LENGTH(varint), VALUE(length)]
 */
export async function readTlv(bytes: Uint8Array): Promise<{ header: TlvHeader; records: TlvRecord[] }> {
  // Validate MAGIC byte before any decompression attempt (prevents wasted work on garbage input)
  if (bytes.length < 2 || bytes[0] !== MAGIC) {
    throw new Error(`Invalid magic byte: expected 0x${MAGIC.toString(16)}, got 0x${bytes[0]?.toString(16)}`)
  }

  // Transparently decompress if VERSION high bit is set
  const data = await decompressPayload(bytes)

  if (data.length < 3) {
    throw new Error('TLV data too short: need at least 3 bytes for header')
  }

  const magic = data[0]!
  const version = data[1]!
  const tlvCount = data[2]!

  if (magic !== MAGIC) {
    throw new Error(`Invalid magic byte: 0x${magic.toString(16)}, expected 0x${MAGIC.toString(16)}`)
  }
  if (version !== VERSION) {
    throw new Error(`Unsupported version: ${version}, expected ${VERSION}`)
  }
  if (tlvCount > MAX_TLV_COUNT) {
    throw new Error(`TLV count ${tlvCount} exceeds max ${MAX_TLV_COUNT}`)
  }

  const header: TlvHeader = { magic, version, tlvCount }
  const records: TlvRecord[] = []

  let offset = 3
  for (let i = 0; i < tlvCount; i++) {
    if (offset >= data.length) {
      throw new Error(`Truncated TLV at record ${i}: need type + length bytes`)
    }
    const type = data[offset]!
    offset += 1

    if (offset >= data.length) {
      throw new Error(`Truncated TLV at record ${i}: need type + length bytes`)
    }
    const { value: length, bytesRead } = readVarInt(data, offset)
    offset += bytesRead

    if (length > MAX_VALUE_SIZE) {
      throw new Error(`TLV value size ${length} exceeds max ${MAX_VALUE_SIZE}`)
    }

    if (offset + length > data.length) {
      throw new Error(
        `Truncated TLV at record ${i}: need ${length} value bytes, have ${data.length - offset}`,
      )
    }
    const value = data.slice(offset, offset + length)
    offset += length
    records.push({ type, value })
  }

  return { header, records }
}
