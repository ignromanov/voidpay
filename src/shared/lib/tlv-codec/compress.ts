import { brotliCompressSync, brotliDecompressSync, constants } from 'node:zlib'
import { writeVarInt, readVarInt } from './varint'
import { MAX_INFLATE_SIZE, MAX_PAYLOAD_SIZE } from './types'

export interface CompressedField {
  typeId: number
  value: Uint8Array
}

/**
 * Compress multiple text fields into a single Brotli block.
 * Format: [field_count: uint8] per field: [type_id: uint8] [value_len: varint] [value: bytes]
 * Returns null if compression not beneficial (< 100 bytes raw, or compressed >= raw).
 */
export function groupedDeflate(
  fields: CompressedField[],
  opts?: { maxInflateSize?: number },
): Uint8Array | null {
  if (fields.length === 0) return null

  const rawParts: number[] = [fields.length]
  for (const field of fields) {
    rawParts.push(field.typeId)
    writeVarInt(rawParts, field.value.length)
    for (let i = 0; i < field.value.length; i++) rawParts.push(field.value[i]!)
  }

  const raw = new Uint8Array(rawParts)
  const maxInflate = opts?.maxInflateSize ?? MAX_INFLATE_SIZE
  if (raw.length > maxInflate) {
    throw new Error(`Raw size ${raw.length} exceeds max inflate size ${maxInflate}`)
  }
  if (raw.length < 100) return null

  const compressed = brotliCompressSync(Buffer.from(raw), {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  })
  if (compressed.length >= raw.length) return null

  return new Uint8Array(compressed)
}

/**
 * Decompress a Brotli block back to fields.
 * Throws if inflated size exceeds limit (decompression bomb protection).
 */
export function groupedInflate(
  data: Uint8Array,
  opts?: { maxInflateSize?: number },
): CompressedField[] {
  const maxInflate = opts?.maxInflateSize ?? MAX_INFLATE_SIZE

  if (data.length > MAX_PAYLOAD_SIZE) {
    throw new Error(`Compressed size ${data.length} exceeds max ${MAX_PAYLOAD_SIZE}`)
  }

  const inflated = new Uint8Array(brotliDecompressSync(Buffer.from(data)))

  if (inflated.length > maxInflate) {
    throw new Error(`Inflated size ${inflated.length} exceeds max ${maxInflate}`)
  }

  const fieldCount = inflated[0]!
  const fields: CompressedField[] = []
  let offset = 1

  for (let i = 0; i < fieldCount; i++) {
    if (offset >= inflated.length) throw new Error(`Truncated compressed block at field ${i}`)
    const typeId = inflated[offset]!
    offset++
    const { value: valueLen, bytesRead } = readVarInt(inflated, offset)
    offset += bytesRead
    if (offset + valueLen > inflated.length) throw new Error(`Truncated value at field ${i}`)
    const value = inflated.slice(offset, offset + valueLen)
    offset += valueLen
    fields.push({ typeId, value })
  }

  return fields
}
