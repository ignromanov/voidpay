export const MAGIC = 0x56 // 'V'
export const VERSION = 0x01
export const MAX_TLV_COUNT = 64
export const MAX_VALUE_SIZE = 4096
export const MAX_PAYLOAD_SIZE = 1481 // URL budget: (2000 - 25 prefix) / 1.333 Base64url ratio
export const MAX_INFLATE_SIZE = 16384 // 16KB decompression bomb limit

export interface TlvHeader {
  magic: number
  version: number
  tlvCount: number
}

export interface TlvRecord {
  type: number
  value: Uint8Array
}

/** Even types are required — unknown even type = reject */
export function isRequired(type: number): boolean {
  return type % 2 === 0
}

/** Odd types are optional — unknown odd type = skip */
export function isOptional(type: number): boolean {
  return type % 2 === 1
}
