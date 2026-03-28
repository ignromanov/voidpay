import type { TlvRecord } from './types'

/** Sort TLV records ascending by type (stable sort) */
export function sortCanonical(records: TlvRecord[]): TlvRecord[] {
  return [...records].sort((a, b) => a.type - b.type)
}

/** Validate records are in canonical order with no duplicates. Throws on violation. */
export function validateCanonical(records: TlvRecord[]): void {
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1]!
    const curr = records[i]!
    if (curr.type === prev.type) {
      throw new Error(`Duplicate TLV type: ${curr.type}`)
    }
    if (curr.type < prev.type) {
      throw new Error(`Non-canonical order: type ${curr.type} after ${prev.type}`)
    }
  }
}
