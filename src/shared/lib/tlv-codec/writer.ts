import type { TlvRecord } from './types'
import { MAGIC, VERSION, MAX_TLV_COUNT, MAX_VALUE_SIZE, MAX_PAYLOAD_SIZE } from './types'

/**
 * Serialize TLV records into binary format.
 * Header: [MAGIC(1), VERSION(1), FLAGS(1), COUNT(1)]
 * Each TLV: [TYPE(1), LENGTH_HI(1), LENGTH_LO(1), VALUE(length)]
 */
export function writeTlv(records: TlvRecord[]): Uint8Array {
  if (records.length > MAX_TLV_COUNT) {
    throw new Error(`TLV count ${records.length} exceeds max ${MAX_TLV_COUNT}`)
  }

  // Calculate total size
  let dataSize = 0
  for (const record of records) {
    if (record.value.length > MAX_VALUE_SIZE) {
      throw new Error(`TLV value size ${record.value.length} exceeds max ${MAX_VALUE_SIZE}`)
    }
    dataSize += 3 + record.value.length // type(1) + length(2) + value
  }

  const totalSize = 4 + dataSize // header(4) + data
  if (totalSize > MAX_PAYLOAD_SIZE) {
    throw new Error(`Payload size ${totalSize} exceeds max ${MAX_PAYLOAD_SIZE}`)
  }

  const bytes = new Uint8Array(totalSize)
  // Header
  bytes[0] = MAGIC
  bytes[1] = VERSION
  bytes[2] = 0x00 // flags
  bytes[3] = records.length

  // TLV records
  let offset = 4
  for (const record of records) {
    bytes[offset] = record.type
    bytes[offset + 1] = (record.value.length >> 8) & 0xff
    bytes[offset + 2] = record.value.length & 0xff
    bytes.set(record.value, offset + 3)
    offset += 3 + record.value.length
  }

  return bytes
}
