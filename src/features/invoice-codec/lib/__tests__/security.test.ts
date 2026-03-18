import { describe, it, expect } from 'vitest'
import type { TlvRecord } from '@/shared/lib/tlv-codec'
import { toHex } from 'viem'
import { TlvType } from '../tlv-map'
import {
  generateSalt,
  computeDomainSeparator,
  validateSecurity,
  deriveMagicDust,
} from '../security'

// Helpers
function makeSaltRecord(bytes?: Uint8Array): TlvRecord {
  return {
    type: TlvType.SALT,
    value: bytes ?? new Uint8Array(16).fill(0xab),
  }
}

function makeRecord(type: number, value: Uint8Array): TlvRecord {
  return { type, value }
}

// Minimal valid record set (salt + one required field)
function makeValidRecords(): TlvRecord[] {
  return [
    makeRecord(TlvType.CHAIN_ID, new Uint8Array([1])),
    makeSaltRecord(),
  ]
}

describe('generateSalt', () => {
  it('returns 16 bytes', () => {
    const salt = generateSalt()
    expect(salt).toBeInstanceOf(Uint8Array)
    expect(salt.length).toBe(16)
  })

  it('returns different values each call', () => {
    const a = generateSalt()
    const b = generateSalt()
    // Extremely unlikely to be equal — both must differ in at least 1 byte
    expect(toHex(a)).not.toBe(toHex(b))
  })
})

describe('computeDomainSeparator', () => {
  it('returns a 32-byte Uint8Array', () => {
    const records = makeValidRecords()
    const sep = computeDomainSeparator(records)
    expect(sep).toBeInstanceOf(Uint8Array)
    expect(sep.length).toBe(32)
  })

  it('excludes Type 31 (DOMAIN_SEPARATOR) from hash input', () => {
    const records = makeValidRecords()

    // Add a domain separator record to the set
    const sepValue = new Uint8Array(32).fill(0xff)
    const recordsWithSep: TlvRecord[] = [
      ...records,
      makeRecord(TlvType.DOMAIN_SEPARATOR, sepValue),
    ]

    // Both calls should yield the same hash (Type 31 is excluded in both)
    const hash1 = computeDomainSeparator(records)
    const hash2 = computeDomainSeparator(recordsWithSep)
    expect(toHex(hash1)).toBe(toHex(hash2))
  })

  it('is deterministic for the same records', () => {
    const records = makeValidRecords()
    const h1 = computeDomainSeparator(records)
    const h2 = computeDomainSeparator(records)
    expect(toHex(h1)).toBe(toHex(h2))
  })

  it('produces different hashes for different records', () => {
    const records1 = makeValidRecords()
    const records2: TlvRecord[] = [
      makeRecord(TlvType.CHAIN_ID, new Uint8Array([2])), // different chain
      makeSaltRecord(),
    ]
    const h1 = computeDomainSeparator(records1)
    const h2 = computeDomainSeparator(records2)
    expect(toHex(h1)).not.toBe(toHex(h2))
  })
})

describe('validateSecurity', () => {
  it('passes for valid records with salt and domain separator', () => {
    const records = makeValidRecords()
    const domSep = computeDomainSeparator(records)
    const withSep = [...records, makeRecord(TlvType.DOMAIN_SEPARATOR, domSep)]
    expect(() => validateSecurity(withSep)).not.toThrow()
  })

  it('rejects missing salt', () => {
    const records: TlvRecord[] = [
      makeRecord(TlvType.CHAIN_ID, new Uint8Array([1])),
    ]
    expect(() => validateSecurity(records)).toThrow('Missing required salt (Type 20)')
  })

  it('rejects salt shorter than 16 bytes', () => {
    const records: TlvRecord[] = [
      makeRecord(TlvType.CHAIN_ID, new Uint8Array([1])),
      makeRecord(TlvType.SALT, new Uint8Array(8).fill(0xaa)),
    ]
    expect(() => validateSecurity(records)).toThrow('Salt too short')
  })

  it('rejects domain separator mismatch', () => {
    const records = makeValidRecords()
    // Add a domain separator with wrong value
    const tampered: TlvRecord[] = [
      ...records,
      makeRecord(TlvType.DOMAIN_SEPARATOR, new Uint8Array(32).fill(0x00)),
    ]
    expect(() => validateSecurity(tampered)).toThrow('Domain separator mismatch')
  })

  it('rejects absent domain separator (now mandatory)', () => {
    const records = makeValidRecords() // no Type 31
    expect(() => validateSecurity(records)).toThrow('Missing required domain separator')
  })

  it('accepts correct domain separator', () => {
    const records = makeValidRecords()
    const correctSep = computeDomainSeparator(records)
    const withSep: TlvRecord[] = [
      ...records,
      makeRecord(TlvType.DOMAIN_SEPARATOR, correctSep),
    ]
    expect(() => validateSecurity(withSep)).not.toThrow()
  })
})

describe('deriveMagicDust', () => {
  it('returns a value in range 1-999', () => {
    const salt = generateSalt()
    const dust = deriveMagicDust(salt)
    expect(dust).toBeGreaterThanOrEqual(1)
    expect(dust).toBeLessThanOrEqual(999)
  })

  it('is deterministic for the same salt', () => {
    const salt = new Uint8Array(16).fill(0x42)
    expect(deriveMagicDust(salt)).toBe(deriveMagicDust(salt))
  })

  it('returns different values for different salts (usually)', () => {
    // Test with several different salts — extremely unlikely all yield same dust
    const results = new Set<number>()
    for (let i = 0; i < 10; i++) {
      const salt = new Uint8Array(16).fill(i)
      results.add(deriveMagicDust(salt))
    }
    expect(results.size).toBeGreaterThan(1)
  })

  it('integer output (no fractional part)', () => {
    const salt = generateSalt()
    const dust = deriveMagicDust(salt)
    expect(Number.isInteger(dust)).toBe(true)
  })
})
