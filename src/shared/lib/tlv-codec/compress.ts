import pako from 'pako'
import { writeVarInt, readVarInt } from './varint'
import { MAX_INFLATE_SIZE } from './types'

export interface CompressedField {
  typeId: number
  value: Uint8Array
}

/**
 * Compress multiple text fields into a single deflated block.
 * Format: [field_count: uint8] per field: [type_id: uint8] [value_len: varint] [value: bytes]
 * Returns null if compression not beneficial (< 100 bytes raw, or compressed >= raw).
 */
export function groupedDeflate(
  fields: CompressedField[],
  opts?: { maxInflateSize?: number },
): Uint8Array | null {
  if (fields.length === 0) return null

  // Build raw payload
  const rawParts: number[] = [fields.length]
  for (const field of fields) {
    rawParts.push(field.typeId)
    writeVarInt(rawParts, field.value.length)
    for (const b of field.value) rawParts.push(b)
  }

  const raw = new Uint8Array(rawParts)
  const maxInflate = opts?.maxInflateSize ?? MAX_INFLATE_SIZE
  if (raw.length > maxInflate) {
    throw new Error(`Raw size ${raw.length} exceeds max inflate size ${maxInflate}`)
  }
  if (raw.length < 100) return null // Not worth compressing

  const compressed = pako.deflate(raw)
  if (compressed.length >= raw.length) return null // Compression not beneficial

  return compressed
}

/**
 * Decompress a grouped deflate block back to fields.
 * Throws if inflated size exceeds limit (decompression bomb protection).
 */
export function groupedInflate(
  data: Uint8Array,
  opts?: { maxInflateSize?: number },
): CompressedField[] {
  const maxInflate = opts?.maxInflateSize ?? MAX_INFLATE_SIZE

  const inflated = pako.inflate(data)
  if (inflated.length > maxInflate) {
    throw new Error(`Inflated size ${inflated.length} exceeds max ${maxInflate}`)
  }

  const fieldCount = inflated[0]!
  const fields: CompressedField[] = []
  let offset = 1

  for (let i = 0; i < fieldCount; i++) {
    if (offset >= inflated.length) {
      throw new Error(`Truncated compressed block at field ${i}`)
    }
    const typeId = inflated[offset]!
    offset++

    const { value: valueLen, bytesRead } = readVarInt(inflated, offset)
    offset += bytesRead

    if (offset + valueLen > inflated.length) {
      throw new Error(`Truncated value in compressed block at field ${i}`)
    }
    const value = inflated.slice(offset, offset + valueLen)
    offset += valueLen
    fields.push({ typeId, value })
  }

  return fields
}
