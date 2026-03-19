import type { TlvRecord } from './types'
import { MAGIC, VERSION, MAX_TLV_COUNT, MAX_VALUE_SIZE, MAX_PAYLOAD_SIZE } from './types'
import { writeVarInt } from './varint'

/**
 * Serialize TLV records into binary format.
 * Header: [MAGIC(1), VERSION(1), COUNT(1)]
 * Each TLV: [TYPE(1), LENGTH(varint), VALUE(length)]
 */
export function writeTlv(records: TlvRecord[]): Uint8Array {
  if (records.length > MAX_TLV_COUNT) {
    throw new Error(`TLV count ${records.length} exceeds max ${MAX_TLV_COUNT}`)
  }

  for (const record of records) {
    if (record.value.length > MAX_VALUE_SIZE) {
      throw new Error(`TLV value size ${record.value.length} exceeds max ${MAX_VALUE_SIZE}`)
    }
  }

  // Build output as number[] then convert to Uint8Array
  const bytes: number[] = []

  // Header
  bytes.push(MAGIC)
  bytes.push(VERSION)
  bytes.push(records.length)

  // TLV records
  for (const record of records) {
    bytes.push(record.type)
    writeVarInt(bytes, record.value.length)
    for (let i = 0; i < record.value.length; i++) {
      bytes.push(record.value[i]!)
    }
  }

  if (bytes.length > MAX_PAYLOAD_SIZE) {
    throw new Error(`Payload size ${bytes.length} exceeds max ${MAX_PAYLOAD_SIZE}`)
  }

  return new Uint8Array(bytes)
}
