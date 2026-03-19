import { describe, it, expect } from 'vitest'
import { readTlv } from '../reader'
import { writeTlv } from '../writer'
import { MAGIC, VERSION } from '../types'

function buildHeader(magic: number, version: number, count: number): number[] {
  return [magic, version, count]
}

function buildTlvRecord(type: number, value: Uint8Array): number[] {
  // Encode varint length
  const varint: number[] = []
  let v = value.length
  while (v > 0x7f) {
    varint.push((v & 0x7f) | 0x80)
    v >>>= 7
  }
  varint.push(v & 0x7f)
  return [type, ...varint, ...value]
}

function makeBytes(parts: number[][]): Uint8Array {
  const flat = parts.flat()
  return new Uint8Array(flat)
}

describe('readTlv', () => {
  describe('valid header parsing', () => {
    it('parses correct magic, version, and count (3-byte header, no flags)', () => {
      const bytes = makeBytes([buildHeader(MAGIC, VERSION, 0)])
      const { header, records } = readTlv(bytes)
      expect(header.magic).toBe(MAGIC)
      expect(header.version).toBe(VERSION)
      expect(header.tlvCount).toBe(0)
      expect(records).toHaveLength(0)
      // flags field no longer exists
      expect('flags' in header).toBe(false)
    })
  })

  describe('single TLV record', () => {
    it('parses type and value correctly', () => {
      const value = new TextEncoder().encode('hello')
      const bytes = makeBytes([
        buildHeader(MAGIC, VERSION, 1),
        buildTlvRecord(0x01, value),
      ])
      const { records } = readTlv(bytes)
      expect(records).toHaveLength(1)
      expect(records[0]!.type).toBe(0x01)
      expect(records[0]!.value).toEqual(value)
    })

    it('handles empty value', () => {
      const value = new Uint8Array(0)
      const bytes = makeBytes([
        buildHeader(MAGIC, VERSION, 1),
        buildTlvRecord(0x02, value),
      ])
      const { records } = readTlv(bytes)
      expect(records[0]!.value).toHaveLength(0)
    })

    it('parses value >= 128 bytes using 2-byte varint length', () => {
      const value = new Uint8Array(300).fill(0xab)
      const bytes = makeBytes([
        buildHeader(MAGIC, VERSION, 1),
        buildTlvRecord(0x02, value),
      ])
      const { records } = readTlv(bytes)
      expect(records[0]!.value).toEqual(value)
    })
  })

  describe('multiple TLV records', () => {
    it('parses all records in order', () => {
      const v1 = new TextEncoder().encode('foo')
      const v2 = new TextEncoder().encode('bar')
      const v3 = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
      const bytes = makeBytes([
        buildHeader(MAGIC, VERSION, 3),
        buildTlvRecord(0x01, v1),
        buildTlvRecord(0x02, v2),
        buildTlvRecord(0x03, v3),
      ])
      const { records } = readTlv(bytes)
      expect(records).toHaveLength(3)
      expect(records[0]!.type).toBe(0x01)
      expect(records[0]!.value).toEqual(v1)
      expect(records[1]!.type).toBe(0x02)
      expect(records[1]!.value).toEqual(v2)
      expect(records[2]!.type).toBe(0x03)
      expect(records[2]!.value).toEqual(v3)
    })
  })

  describe('error: bad magic', () => {
    it('rejects magic byte that is not 0x56', () => {
      const bytes = makeBytes([buildHeader(0x00, VERSION, 0)])
      expect(() => readTlv(bytes)).toThrow(/Invalid magic byte/)
    })

    it('rejects magic 0xff', () => {
      const bytes = makeBytes([buildHeader(0xff, VERSION, 0)])
      expect(() => readTlv(bytes)).toThrow(/Invalid magic byte/)
    })
  })

  describe('error: unsupported version', () => {
    it('rejects version 0', () => {
      const bytes = makeBytes([buildHeader(MAGIC, 0x00, 0)])
      expect(() => readTlv(bytes)).toThrow(/Unsupported version/)
    })

    it('rejects version 2', () => {
      const bytes = makeBytes([buildHeader(MAGIC, 0x02, 0)])
      expect(() => readTlv(bytes)).toThrow(/Unsupported version/)
    })
  })

  describe('error: truncated data', () => {
    it('rejects data shorter than 3 bytes (header too short)', () => {
      expect(() => readTlv(new Uint8Array([MAGIC, VERSION]))).toThrow(/too short/)
    })

    it('rejects empty input', () => {
      expect(() => readTlv(new Uint8Array([]))).toThrow(/too short/)
    })

    it('rejects truncated TLV where header says 1 record but no record bytes follow', () => {
      const bytes = makeBytes([buildHeader(MAGIC, VERSION, 1)])
      expect(() => readTlv(bytes)).toThrow(/Truncated TLV/)
    })

    it('rejects truncated TLV where value bytes are cut short', () => {
      // Record says length=10 (varint 0x0a) but only 3 value bytes follow
      const bytes = makeBytes([
        buildHeader(MAGIC, VERSION, 1),
        [0x01, 0x0a, 0x11, 0x22, 0x33], // type=1, varint length=10, only 3 bytes of value
      ])
      expect(() => readTlv(bytes)).toThrow(/Truncated TLV/)
    })

    it('rejects when second of two records is missing', () => {
      const v1 = new TextEncoder().encode('hello')
      const bytes = makeBytes([
        buildHeader(MAGIC, VERSION, 2),
        buildTlvRecord(0x01, v1),
        // second record missing
      ])
      expect(() => readTlv(bytes)).toThrow(/Truncated TLV/)
    })
  })

  describe('error: TLV count exceeds max', () => {
    it('rejects count of 65 (> MAX_TLV_COUNT=64)', () => {
      const bytes = makeBytes([buildHeader(MAGIC, VERSION, 65)])
      expect(() => readTlv(bytes)).toThrow(/exceeds max/)
    })

    it('accepts count of 64 (= MAX_TLV_COUNT)', () => {
      // Build 64 empty records
      const parts: number[][] = [buildHeader(MAGIC, VERSION, 64)]
      for (let i = 0; i < 64; i++) {
        parts.push(buildTlvRecord(i + 1, new Uint8Array(0)))
      }
      const bytes = makeBytes(parts)
      const { records } = readTlv(bytes)
      expect(records).toHaveLength(64)
    })
  })

  describe('Writer→Reader roundtrip', () => {
    it('roundtrips a single record', () => {
      const input = [{ type: 0x01, value: new TextEncoder().encode('hello world') }]
      const encoded = writeTlv(input)
      const { header, records } = readTlv(encoded)
      expect(header.magic).toBe(MAGIC)
      expect(header.version).toBe(VERSION)
      expect(header.tlvCount).toBe(1)
      expect(records).toHaveLength(1)
      expect(records[0]!.type).toBe(input[0]!.type)
      expect(records[0]!.value).toEqual(input[0]!.value)
    })

    it('roundtrips multiple records of different types', () => {
      const input = [
        { type: 0x01, value: new TextEncoder().encode('invoice-id-001') },
        { type: 0x02, value: new Uint8Array([0x00, 0x00, 0x00, 0x64]) },
        { type: 0x03, value: new TextEncoder().encode('USDC') },
        { type: 0x05, value: new Uint8Array([0x00, 0x01]) },
      ]
      const encoded = writeTlv(input)
      const { records } = readTlv(encoded)
      expect(records).toHaveLength(input.length)
      for (let i = 0; i < input.length; i++) {
        expect(records[i]!.type).toBe(input[i]!.type)
        expect(records[i]!.value).toEqual(input[i]!.value)
      }
    })

    it('roundtrips an empty records list', () => {
      const encoded = writeTlv([])
      const { header, records } = readTlv(encoded)
      expect(header.tlvCount).toBe(0)
      expect(records).toHaveLength(0)
    })

    it('roundtrips binary value data intact', () => {
      const binaryValue = new Uint8Array(256).map((_, i) => i)
      const input = [{ type: 0x0f, value: binaryValue }]
      const encoded = writeTlv(input)
      const { records } = readTlv(encoded)
      expect(records[0]!.value).toEqual(binaryValue)
    })

    it('roundtrips value >= 128 bytes (2-byte varint length)', () => {
      const value = new Uint8Array(200).fill(0xcd)
      const input = [{ type: 0x02, value }]
      const encoded = writeTlv(input)
      const { records } = readTlv(encoded)
      expect(records[0]!.value).toEqual(value)
    })
  })
})
