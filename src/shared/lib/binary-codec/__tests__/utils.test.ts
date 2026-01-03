/**
 * Binary Codec Utils Tests
 * Tests for binary encoding utilities
 */

import { describe, it, expect } from 'vitest'
import {
  uuidToBytes,
  bytesToUuid,
  addressToBytes,
  bytesToAddress,
  writeUInt32,
  readUInt32,
  writeVarInt,
  readVarInt,
  writeString,
  readString,
  writeOptionalString,
  readOptionalString,
  writeOptionalAddress,
  readOptionalAddress,
} from '../utils'

describe('binary codec utils', () => {
  describe('UUID conversion', () => {
    const testUuid = '550e8400-e29b-41d4-a716-446655440000'
    const testUuidNoDashes = '550e8400e29b41d4a716446655440000'

    it('converts UUID with dashes to bytes', () => {
      const bytes = uuidToBytes(testUuid)
      expect(bytes.length).toBe(16)
    })

    it('converts UUID without dashes to bytes', () => {
      const bytes = uuidToBytes(testUuidNoDashes)
      expect(bytes.length).toBe(16)
    })

    it('throws on invalid UUID length', () => {
      expect(() => uuidToBytes('invalid')).toThrow('Invalid UUID length')
    })

    it('roundtrips UUID correctly', () => {
      const bytes = uuidToBytes(testUuid)
      const result = bytesToUuid(bytes)
      expect(result).toBe(testUuid)
    })

    it('converts bytes back to UUID with dashes', () => {
      const bytes = new Uint8Array([
        0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55, 0x44, 0x00,
        0x00,
      ])
      const result = bytesToUuid(bytes)
      expect(result).toBe(testUuid)
    })

    it('throws on invalid bytes length', () => {
      expect(() => bytesToUuid(new Uint8Array([1, 2, 3]))).toThrow('Invalid UUID bytes length')
    })
  })

  describe('Address conversion', () => {
    const testAddress = '0x1234567890abcdef1234567890abcdef12345678'

    it('converts address with 0x prefix to bytes', () => {
      const bytes = addressToBytes(testAddress)
      expect(bytes.length).toBe(20)
    })

    it('converts address without 0x prefix', () => {
      const bytes = addressToBytes(testAddress.slice(2))
      expect(bytes.length).toBe(20)
    })

    it('throws on invalid address length', () => {
      expect(() => addressToBytes('0x1234')).toThrow('Invalid address length')
    })

    it('roundtrips address correctly', () => {
      const bytes = addressToBytes(testAddress)
      const result = bytesToAddress(bytes)
      expect(result.toLowerCase()).toBe(testAddress.toLowerCase())
    })

    it('throws on invalid bytes length for address', () => {
      expect(() => bytesToAddress(new Uint8Array([1, 2, 3]))).toThrow(
        'Invalid address bytes length'
      )
    })
  })

  describe('UInt32 operations', () => {
    it('writes UInt32 in big-endian', () => {
      const buffer: number[] = []
      writeUInt32(buffer, 0x12345678)
      expect(buffer).toEqual([0x12, 0x34, 0x56, 0x78])
    })

    it('writes zero correctly', () => {
      const buffer: number[] = []
      writeUInt32(buffer, 0)
      expect(buffer).toEqual([0, 0, 0, 0])
    })

    it('writes max value correctly', () => {
      const buffer: number[] = []
      writeUInt32(buffer, 0xffffffff)
      expect(buffer).toEqual([0xff, 0xff, 0xff, 0xff])
    })

    it('reads UInt32 from bytes', () => {
      const bytes = new Uint8Array([0x12, 0x34, 0x56, 0x78])
      const { value, bytesRead } = readUInt32(bytes, 0)
      expect(value).toBe(0x12345678)
      expect(bytesRead).toBe(4)
    })

    it('reads from offset', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x12, 0x34, 0x56, 0x78])
      const { value } = readUInt32(bytes, 2)
      expect(value).toBe(0x12345678)
    })
  })

  describe('VarInt operations', () => {
    it('writes small values in 1 byte', () => {
      const buffer: number[] = []
      writeVarInt(buffer, 127)
      expect(buffer.length).toBe(1)
      expect(buffer[0]).toBe(127)
    })

    it('writes larger values in multiple bytes', () => {
      const buffer: number[] = []
      writeVarInt(buffer, 128)
      expect(buffer.length).toBe(2)
    })

    it('writes zero correctly', () => {
      const buffer: number[] = []
      writeVarInt(buffer, 0)
      expect(buffer).toEqual([0])
    })

    it('roundtrips various values', () => {
      const values = [0, 1, 127, 128, 255, 1000, 16383, 16384, 1000000]

      for (const val of values) {
        const buffer: number[] = []
        writeVarInt(buffer, val)
        const bytes = new Uint8Array(buffer)
        const { value } = readVarInt(bytes, 0)
        expect(value).toBe(val)
      }
    })
  })

  describe('String operations', () => {
    it('writes and reads empty string', () => {
      const buffer: number[] = []
      writeString(buffer, '')
      const bytes = new Uint8Array(buffer)
      const { value, bytesRead } = readString(bytes, 0)
      expect(value).toBe('')
      expect(bytesRead).toBe(1) // just length byte
    })

    it('writes and reads ASCII string', () => {
      const buffer: number[] = []
      writeString(buffer, 'Hello')
      const bytes = new Uint8Array(buffer)
      const { value } = readString(bytes, 0)
      expect(value).toBe('Hello')
    })

    it('writes and reads UTF-8 string', () => {
      const buffer: number[] = []
      writeString(buffer, 'Привет 🌍')
      const bytes = new Uint8Array(buffer)
      const { value } = readString(bytes, 0)
      expect(value).toBe('Привет 🌍')
    })
  })

  describe('Optional string operations', () => {
    it('writes and reads undefined as absent', () => {
      const buffer: number[] = []
      writeOptionalString(buffer, undefined)
      const bytes = new Uint8Array(buffer)
      const { value, bytesRead } = readOptionalString(bytes, 0)
      expect(value).toBeUndefined()
      expect(bytesRead).toBe(1)
    })

    it('writes and reads present string', () => {
      const buffer: number[] = []
      writeOptionalString(buffer, 'test')
      const bytes = new Uint8Array(buffer)
      const { value } = readOptionalString(bytes, 0)
      expect(value).toBe('test')
    })
  })

  describe('Optional address operations', () => {
    const testAddress = '0x1234567890abcdef1234567890abcdef12345678'

    it('writes and reads undefined as absent', () => {
      const buffer: number[] = []
      writeOptionalAddress(buffer, undefined)
      const bytes = new Uint8Array(buffer)
      const { value, bytesRead } = readOptionalAddress(bytes, 0)
      expect(value).toBeUndefined()
      expect(bytesRead).toBe(1)
    })

    it('writes and reads present address', () => {
      const buffer: number[] = []
      writeOptionalAddress(buffer, testAddress)
      const bytes = new Uint8Array(buffer)
      const { value, bytesRead } = readOptionalAddress(bytes, 0)
      expect(value?.toLowerCase()).toBe(testAddress.toLowerCase())
      expect(bytesRead).toBe(21) // 1 flag + 20 address bytes
    })
  })
})
