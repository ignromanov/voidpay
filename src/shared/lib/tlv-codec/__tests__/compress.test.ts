import { describe, it, expect } from 'vitest'
import pako from 'pako'
import { groupedDeflate, groupedInflate } from '../compress'
import { MAX_INFLATE_SIZE } from '../types'
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
    it('returns null when deflated output is not smaller than raw', () => {
      // Random-like bytes (incompressible) of >= 100 bytes
      // Use a payload that pako won't compress well
      const entropy = new Uint8Array(120)
      for (let i = 0; i < 120; i++) entropy[i] = (i * 137 + 43) % 256
      const fields = [makeFieldBytes(0x01, entropy)]

      // Build the raw to check how large it is (overhead from format adds ~3 bytes)
      const raw = buildRawPayload(fields)
      const compressed = pako.deflate(raw)

      // Only run this test if pako actually fails to compress (compressed >= raw)
      // If pako manages to compress the entropy below raw size, skip the assertion
      if (compressed.length < raw.length) {
        // pako compressed it anyway — skip this specific assertion
        return
      }

      const result = groupedDeflate(fields)
      expect(result).toBeNull()
    })
  })

  describe('decompression bomb protection', () => {
    it('throws when inflated size exceeds maxInflateSize', () => {
      // Craft a deflated payload that expands to > maxInflateSize when inflated
      const maxInflate = 200 // very small limit for testing
      // Build a raw payload that is > maxInflate when inflated
      const bigField = makeField(0x01, 'X'.repeat(300))
      const raw = buildRawPayload([bigField])
      const deflated = pako.deflate(raw)

      expect(() => groupedInflate(deflated, { maxInflateSize: maxInflate })).toThrow(
        /exceeds max/,
      )
    })

    it('throws with default MAX_INFLATE_SIZE when inflated size exceeds 16KB', () => {
      // Build a payload that inflates to > MAX_INFLATE_SIZE (16384)
      // A highly compressible string will expand greatly
      const bigField = makeField(0x01, 'A'.repeat(MAX_INFLATE_SIZE + 100))
      const raw = buildRawPayload([bigField])
      const deflated = pako.deflate(raw)

      expect(() => groupedInflate(deflated)).toThrow(/exceeds max/)
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
})
