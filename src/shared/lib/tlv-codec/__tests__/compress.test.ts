import { describe, it, expect } from 'vitest'
import { brotliCompressSync } from 'node:zlib'
import { groupedDeflate, groupedInflate } from '../compress'
import { MAX_INFLATE_SIZE, MAX_PAYLOAD_SIZE } from '../types'
import { writeVarInt } from '../varint'

function makeField(typeId: number, text: string): { typeId: number; value: Uint8Array } {
  return { typeId, value: new TextEncoder().encode(text) }
}

function makeFieldBytes(typeId: number, value: Uint8Array): { typeId: number; value: Uint8Array } {
  return { typeId, value }
}

/** Build raw payload that groupedDeflate would produce internally, used for bomb crafting */
function buildRawPayload(fields: { typeId: number; value: Uint8Array }[]): Uint8Array {
  const parts: number[] = [fields.length]
  for (const field of fields) {
    parts.push(field.typeId)
    writeVarInt(parts, field.value.length)
    for (const b of field.value) parts.push(b)
  }
  return new Uint8Array(parts)
}

describe('groupedDeflate / groupedInflate', () => {
  describe('roundtrip', () => {
    it('compresses and decompresses multiple fields correctly', () => {
      // Need >= 100 bytes raw to trigger compression
      const fields = [
        makeField(0x01, 'A'.repeat(60)),
        makeField(0x02, 'B'.repeat(60)),
        makeField(0x03, 'C'.repeat(60)),
      ]
      const compressed = groupedDeflate(fields)
      expect(compressed).not.toBeNull()

      const recovered = groupedInflate(compressed!)
      expect(recovered).toHaveLength(fields.length)
      for (let i = 0; i < fields.length; i++) {
        expect(recovered[i]!.typeId).toBe(fields[i]!.typeId)
        expect(recovered[i]!.value).toEqual(fields[i]!.value)
      }
    })

    it('preserves typeId ordering and values across roundtrip', () => {
      const fields = [
        makeField(0x10, 'invoice-number-'.repeat(8)),
        makeField(0x20, 'client-name-acme-corp-'.repeat(6)),
        makeField(0x30, 'notes-field-'.repeat(10)),
      ]
      const compressed = groupedDeflate(fields)
      expect(compressed).not.toBeNull()

      const recovered = groupedInflate(compressed!)
      for (let i = 0; i < fields.length; i++) {
        expect(recovered[i]!.typeId).toBe(fields[i]!.typeId)
        expect(new TextDecoder().decode(recovered[i]!.value)).toBe(
          new TextDecoder().decode(fields[i]!.value),
        )
      }
    })
  })

  describe('threshold: < 100 bytes raw → returns null', () => {
    it('returns null for a single small field', () => {
      const fields = [makeField(0x01, 'short text')]
      const result = groupedDeflate(fields)
      expect(result).toBeNull()
    })

    it('returns null for multiple fields totalling < 100 bytes raw', () => {
      const fields = [
        makeField(0x01, 'hello'),
        makeField(0x02, 'world'),
      ]
      const result = groupedDeflate(fields)
      expect(result).toBeNull()
    })

    it('returns null for empty fields array', () => {
      const result = groupedDeflate([])
      expect(result).toBeNull()
    })
  })

  describe('threshold: compressed >= raw → returns null', () => {
    it('returns null when brotli output is not smaller than raw', () => {
      // Random-like bytes (incompressible) of >= 100 bytes
      const entropy = new Uint8Array(120)
      for (let i = 0; i < 120; i++) entropy[i] = (i * 137 + 43) % 256
      const fields = [makeFieldBytes(0x01, entropy)]

      // Build the raw to check format overhead (~3 bytes)
      const raw = buildRawPayload(fields)

      // Manually compress with node:zlib to check if it beats raw size
      const { constants } = require('node:zlib') as typeof import('node:zlib')
      const manualCompressed = brotliCompressSync(Buffer.from(raw), {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      })

      // Only assert if brotli actually fails to compress (compressed >= raw)
      if (manualCompressed.length < raw.length) {
        // brotli compressed it anyway — skip this specific assertion
        return
      }

      const result = groupedDeflate(fields)
      expect(result).toBeNull()
    })
  })

  describe('decompression bomb protection', () => {
    it('throws when inflated size exceeds maxInflateSize', () => {
      // Craft a brotli-compressed payload that expands to > maxInflateSize when inflated
      const maxInflate = 200 // very small limit for testing
      const bigField = makeField(0x01, 'X'.repeat(300))
      const raw = buildRawPayload([bigField])

      const { constants } = require('node:zlib') as typeof import('node:zlib')
      const compressed = brotliCompressSync(Buffer.from(raw), {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      })

      expect(() => groupedInflate(new Uint8Array(compressed), { maxInflateSize: maxInflate })).toThrow(
        /exceeds max/,
      )
    })

    it('throws with default MAX_INFLATE_SIZE when inflated size exceeds 16KB', () => {
      // Build a payload that inflates to > MAX_INFLATE_SIZE (16384)
      const bigField = makeField(0x01, 'A'.repeat(MAX_INFLATE_SIZE + 100))
      const raw = buildRawPayload([bigField])

      const { constants } = require('node:zlib') as typeof import('node:zlib')
      const compressed = brotliCompressSync(Buffer.from(raw), {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      })

      expect(() => groupedInflate(new Uint8Array(compressed))).toThrow(/exceeds max/)
    })

    it('throws pre-decompress when compressed input exceeds MAX_PAYLOAD_SIZE', () => {
      // Craft a buffer that is larger than MAX_PAYLOAD_SIZE
      const oversized = new Uint8Array(MAX_PAYLOAD_SIZE + 1)
      expect(() => groupedInflate(oversized)).toThrow(/exceeds max/)
    })
  })

  describe('single large field', () => {
    it('roundtrips a single large field correctly', () => {
      // Compressible string of > 100 bytes
      const longText = 'The quick brown fox jumps over the lazy dog. '.repeat(10)
      const fields = [makeField(0x01, longText)]
      const compressed = groupedDeflate(fields)
      expect(compressed).not.toBeNull()

      const recovered = groupedInflate(compressed!)
      expect(recovered).toHaveLength(1)
      expect(new TextDecoder().decode(recovered[0]!.value)).toBe(longText)
    })
  })

  describe('truncation errors', () => {
    it('throws on truncated compressed block', () => {
      // First compress a valid payload
      const fields = [makeField(0x01, 'A'.repeat(60)), makeField(0x02, 'B'.repeat(60))]
      const compressed = groupedDeflate(fields)
      expect(compressed).not.toBeNull()

      // Truncate the compressed data (corrupt it)
      const truncated = compressed!.slice(0, Math.floor(compressed!.length / 2))
      expect(() => groupedInflate(truncated)).toThrow()
    })
  })
})
