import { describe, it, expect } from 'vitest'
import { writeTlv } from '../writer'
import { MAGIC, VERSION, MAX_TLV_COUNT, MAX_VALUE_SIZE, MAX_PAYLOAD_SIZE } from '../types'

describe('writeTlv', () => {
  it('writes empty record list — header only (3 bytes)', () => {
    const result = writeTlv([])
    expect(result.length).toBe(3)
    expect(result[0]).toBe(0x56) // MAGIC
    expect(result[1]).toBe(0x01) // VERSION
    expect(result[2]).toBe(0x00) // count
  })

  it('magic byte is 0x56 and version is 0x01', () => {
    expect(MAGIC).toBe(0x56)
    expect(VERSION).toBe(0x01)
    const result = writeTlv([])
    expect(result[0]).toBe(MAGIC)
    expect(result[1]).toBe(VERSION)
  })

  it('writes single TLV with short value — 1-byte varint length', () => {
    const value = new Uint8Array([0xaa, 0xbb, 0xcc])
    const result = writeTlv([{ type: 0x02, value }])

    // Total: 3 (header) + 1 (type) + 1 (varint length=3) + 3 (value) = 8
    expect(result.length).toBe(8)

    // Header
    expect(result[0]).toBe(MAGIC)
    expect(result[1]).toBe(VERSION)
    expect(result[2]).toBe(0x01) // count = 1

    // TLV
    expect(result[3]).toBe(0x02) // type
    expect(result[4]).toBe(0x03) // varint length = 3 (single byte, < 128)
    expect(result[5]).toBe(0xaa)
    expect(result[6]).toBe(0xbb)
    expect(result[7]).toBe(0xcc)
  })

  it('writes multiple TLVs — correct concatenation and total length', () => {
    const val1 = new Uint8Array([0x01, 0x02])
    const val2 = new Uint8Array([0x03, 0x04, 0x05])
    const result = writeTlv([
      { type: 0x02, value: val1 },
      { type: 0x04, value: val2 },
    ])

    // Total: 3 + (1+1+2) + (1+1+3) = 12
    expect(result.length).toBe(12)
    expect(result[2]).toBe(0x02) // count = 2

    // First TLV at offset 3
    expect(result[3]).toBe(0x02)  // type
    expect(result[4]).toBe(0x02)  // varint length = 2
    expect(result[5]).toBe(0x01)
    expect(result[6]).toBe(0x02)

    // Second TLV at offset 7
    expect(result[7]).toBe(0x04)  // type
    expect(result[8]).toBe(0x03)  // varint length = 3
    expect(result[9]).toBe(0x03)
    expect(result[10]).toBe(0x04)
    expect(result[11]).toBe(0x05)
  })

  it('encodes 2-byte varint length for values >= 128 bytes', () => {
    const size = 300
    const value = new Uint8Array(size).fill(0xff)
    const result = writeTlv([{ type: 0x02, value }])

    // varint for 300: 300 = 0b100101100
    // byte 1: (300 & 0x7f) | 0x80 = 0xac (continuation bit set)
    // byte 2: 300 >>> 7 = 2 = 0x02
    expect(result[4]).toBe((300 & 0x7f) | 0x80) // 0xac
    expect(result[5]).toBe(300 >>> 7)             // 0x02
  })

  it('rejects if TLV count exceeds MAX_TLV_COUNT (64)', () => {
    const records = Array.from({ length: MAX_TLV_COUNT + 1 }, (_, i) => ({
      type: i,
      value: new Uint8Array(0),
    }))
    expect(() => writeTlv(records)).toThrow(`TLV count ${MAX_TLV_COUNT + 1} exceeds max ${MAX_TLV_COUNT}`)
  })

  it('rejects if single value exceeds MAX_VALUE_SIZE (4096)', () => {
    const value = new Uint8Array(MAX_VALUE_SIZE + 1)
    expect(() => writeTlv([{ type: 0x02, value }])).toThrow(
      `TLV value size ${MAX_VALUE_SIZE + 1} exceeds max ${MAX_VALUE_SIZE}`,
    )
  })

  it('rejects if total payload exceeds MAX_PAYLOAD_SIZE (1481)', () => {
    // Each record: 1 (type) + 1 (varint for 100) + 100 (value) = 102 bytes
    // 15 records = 1530 data bytes + 3 header = 1533 > 1481
    const records = Array.from({ length: 15 }, (_, i) => ({
      type: i,
      value: new Uint8Array(100).fill(0xab),
    }))
    expect(() => writeTlv(records)).toThrow(`exceeds max ${MAX_PAYLOAD_SIZE}`)
  })

  it('returns a Uint8Array', () => {
    const result = writeTlv([])
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
