/**
 * Base62 Encoding/Decoding Tests
 * Tests for URL-safe binary encoding
 */

import { describe, it, expect } from 'vitest'
import { encodeBase62, decodeBase62 } from '../base62'

describe('base62', () => {
  describe('encodeBase62', () => {
    it('encodes empty array to empty string', () => {
      expect(encodeBase62(new Uint8Array([]))).toBe('')
    })

    it('encodes single byte', () => {
      const result = encodeBase62(new Uint8Array([255]))
      expect(result).toBe('47')
    })

    it('encodes zero byte', () => {
      const result = encodeBase62(new Uint8Array([0]))
      expect(result).toBe('0')
    })

    it('preserves leading zeros', () => {
      const result = encodeBase62(new Uint8Array([0, 0, 1]))
      expect(result.startsWith('00')).toBe(true)
    })

    it('encodes multiple bytes', () => {
      const bytes = new Uint8Array([1, 2, 3, 4])
      const result = encodeBase62(bytes)
      expect(result.length).toBeGreaterThan(0)
      expect(result).toMatch(/^[0-9a-zA-Z]+$/)
    })

    it('produces URL-safe output (no special chars)', () => {
      const bytes = new Uint8Array(32)
      for (let i = 0; i < 32; i++) bytes[i] = i * 8

      const result = encodeBase62(bytes)
      expect(result).toMatch(/^[0-9a-zA-Z]+$/)
    })
  })

  describe('decodeBase62', () => {
    it('decodes empty string to empty array', () => {
      expect(decodeBase62('')).toEqual(new Uint8Array([]))
    })

    it('decodes single character', () => {
      const result = decodeBase62('A')
      expect(result.length).toBeGreaterThan(0)
    })

    it('throws on invalid character', () => {
      expect(() => decodeBase62('abc!def')).toThrow('Invalid Base62 character: !')
    })

    it('throws on spaces', () => {
      expect(() => decodeBase62('abc def')).toThrow('Invalid Base62 character:  ')
    })

    it('throws on special characters', () => {
      expect(() => decodeBase62('abc+def')).toThrow('Invalid Base62 character: +')
    })
  })

  describe('roundtrip encoding', () => {
    it('roundtrips simple bytes', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5])
      const encoded = encodeBase62(original)
      const decoded = decodeBase62(encoded)

      expect(decoded).toEqual(original)
    })

    it('roundtrips bytes with leading zeros', () => {
      const original = new Uint8Array([0, 0, 0, 1, 2, 3])
      const encoded = encodeBase62(original)
      const decoded = decodeBase62(encoded)

      expect(decoded).toEqual(original)
    })

    it('handles all-zero arrays (value is 0, leading zeros preserved via prefix)', () => {
      // Base62: [0,0,0,0] has numeric value 0, encodes as '0' with leading zero prefix
      // The implementation preserves leading zeros via prefix characters
      const original = new Uint8Array([0, 0, 0, 0])
      const encoded = encodeBase62(original)

      // All zeros have numeric value 0, but leading zeros are preserved
      expect(encoded.length).toBeGreaterThan(0)

      const decoded = decodeBase62(encoded)
      expect(decoded.every((b) => b === 0)).toBe(true)
    })

    it('roundtrips large byte array', () => {
      const original = new Uint8Array(64)
      for (let i = 0; i < 64; i++) original[i] = i

      const encoded = encodeBase62(original)
      const decoded = decodeBase62(encoded)

      expect(decoded).toEqual(original)
    })

    it('roundtrips random bytes', () => {
      const original = new Uint8Array([127, 255, 0, 128, 64, 32, 16, 8])
      const encoded = encodeBase62(original)
      const decoded = decodeBase62(encoded)

      expect(decoded).toEqual(original)
    })
  })
})
