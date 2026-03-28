import { describe, it, expect } from 'vitest'
import { sortCanonical, validateCanonical } from '../canonical'
import { isRequired, isOptional } from '../types'
import type { TlvRecord } from '../types'

function makeRecord(type: number, value: Uint8Array = new Uint8Array(0)): TlvRecord {
  return { type, value }
}

describe('sortCanonical', () => {
  it('sorts records ascending by type', () => {
    const records = [makeRecord(3), makeRecord(1), makeRecord(2)]
    const sorted = sortCanonical(records)
    expect(sorted.map((r) => r.type)).toEqual([1, 2, 3])
  })

  it('does not mutate the input array', () => {
    const records = [makeRecord(3), makeRecord(1)]
    const original = [...records]
    sortCanonical(records)
    expect(records[0]!.type).toBe(original[0]!.type)
    expect(records[1]!.type).toBe(original[1]!.type)
  })

  it('returns a new array', () => {
    const records = [makeRecord(1)]
    const sorted = sortCanonical(records)
    expect(sorted).not.toBe(records)
  })

  it('handles empty array', () => {
    expect(sortCanonical([])).toEqual([])
  })

  it('handles already-sorted array', () => {
    const records = [makeRecord(1), makeRecord(2), makeRecord(3)]
    const sorted = sortCanonical(records)
    expect(sorted.map((r) => r.type)).toEqual([1, 2, 3])
  })

  it('is stable — preserves relative order of equal types', () => {
    const val1 = new Uint8Array([0xaa])
    const val2 = new Uint8Array([0xbb])
    const r1 = { type: 2, value: val1 }
    const r2 = { type: 2, value: val2 }
    const sorted = sortCanonical([r1, r2])
    expect(sorted[0]!.value[0]).toBe(0xaa)
    expect(sorted[1]!.value[0]).toBe(0xbb)
  })
})

describe('validateCanonical', () => {
  it('passes for empty array', () => {
    expect(() => validateCanonical([])).not.toThrow()
  })

  it('passes for single record', () => {
    expect(() => validateCanonical([makeRecord(5)])).not.toThrow()
  })

  it('passes for sorted records with no duplicates', () => {
    const records = [makeRecord(1), makeRecord(2), makeRecord(4), makeRecord(7)]
    expect(() => validateCanonical(records)).not.toThrow()
  })

  it('rejects duplicate types', () => {
    const records = [makeRecord(1), makeRecord(2), makeRecord(2)]
    expect(() => validateCanonical(records)).toThrow('Duplicate TLV type: 2')
  })

  it('rejects non-ascending order', () => {
    const records = [makeRecord(1), makeRecord(3), makeRecord(2)]
    expect(() => validateCanonical(records)).toThrow('Non-canonical order: type 2 after 3')
  })
})

describe('isRequired / isOptional', () => {
  it('isRequired returns true for even types', () => {
    expect(isRequired(0)).toBe(true)
    expect(isRequired(2)).toBe(true)
    expect(isRequired(4)).toBe(true)
    expect(isRequired(100)).toBe(true)
  })

  it('isRequired returns false for odd types', () => {
    expect(isRequired(1)).toBe(false)
    expect(isRequired(3)).toBe(false)
    expect(isRequired(255)).toBe(false)
  })

  it('isOptional returns true for odd types', () => {
    expect(isOptional(1)).toBe(true)
    expect(isOptional(3)).toBe(true)
    expect(isOptional(255)).toBe(true)
  })

  it('isOptional returns false for even types', () => {
    expect(isOptional(0)).toBe(false)
    expect(isOptional(2)).toBe(false)
    expect(isOptional(100)).toBe(false)
  })
})
