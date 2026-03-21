import { describe, it, expect } from 'vitest'
import { encodeBase64url, decodeBase64url } from '../base64url'

describe('base64url', () => {
  describe('encodeBase64url', () => {
    it('encodes empty array to empty string', () => {
      expect(encodeBase64url(new Uint8Array([]))).toBe('')
    })

    it('produces URL-safe output only (no +, /, =)', () => {
      const bytes = new Uint8Array(32)
      for (let i = 0; i < 32; i++) bytes[i] = i * 8
      const result = encodeBase64url(bytes)
      expect(result).toMatch(/^[A-Za-z0-9\-_]+$/)
      expect(result).not.toContain('+')
      expect(result).not.toContain('/')
      expect(result).not.toContain('=')
    })

    it('300 bytes encodes to 400 chars (ratio 1.333x)', () => {
      const bytes = new Uint8Array(300)
      for (let i = 0; i < 300; i++) bytes[i] = i % 256
      const result = encodeBase64url(bytes)
      expect(result.length).toBe(400)
    })
  })

  describe('decodeBase64url', () => {
    it('decodes empty string to empty array', () => {
      expect(decodeBase64url('')).toEqual(new Uint8Array(0))
    })

    it('rejects strings with length % 4 === 1 (illegal Base64 length)', () => {
      // A single trailing character (pad=1) cannot represent any valid byte sequence.
      // Valid Base64url lengths mod 4 are: 0 (clean), 2 (1 pad byte needed), 3 (2 pad bytes needed).
      expect(() => decodeBase64url('A')).toThrow(/Invalid Base64url/)
      expect(() => decodeBase64url('AAAAA')).toThrow(/Invalid Base64url/)
      expect(() => decodeBase64url('AAAAAAAAA')).toThrow(/Invalid Base64url/)
    })
  })

  describe('roundtrip', () => {
    it('roundtrips empty array', () => {
      const original = new Uint8Array([])
      expect(decodeBase64url(encodeBase64url(original))).toEqual(original)
    })

    it('roundtrips arbitrary bytes', () => {
      const original = new Uint8Array([0, 1, 127, 128, 255, 42, 99])
      expect(decodeBase64url(encodeBase64url(original))).toEqual(original)
    })

    it('roundtrips 300 bytes', () => {
      const original = new Uint8Array(300)
      for (let i = 0; i < 300; i++) original[i] = i % 256
      expect(decodeBase64url(encodeBase64url(original))).toEqual(original)
    })

    it('roundtrips all-zero bytes', () => {
      const original = new Uint8Array(16)
      expect(decodeBase64url(encodeBase64url(original))).toEqual(original)
    })
  })
})
