/**
 * Blockie Hash Generator Tests
 *
 * Constitutional Principle XVI: TDD Discipline
 * RED PHASE: These tests MUST FAIL first
 */

import { describe, it, expect } from 'vitest'
import { generateBlockieHash, getBlockieColor } from '../blockie'

describe('generateBlockieHash', () => {
  it('should generate deterministic hash for valid address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const hash1 = generateBlockieHash(address)
    const hash2 = generateBlockieHash(address)

    expect(hash1).toBe(hash2)
    expect(hash1).toBeGreaterThanOrEqual(0)
    expect(hash1).toBeLessThanOrEqual(15)
  })

  it('should generate different hashes for different addresses', () => {
    const address1 = '0x1234567890123456789012345678901234567890'
    const address2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'

    const hash1 = generateBlockieHash(address1)
    const hash2 = generateBlockieHash(address2)

    // While not guaranteed, should be different in practice
    expect(hash1).not.toBe(hash2)
  })

  it('should handle empty string', () => {
    const hash = generateBlockieHash('')
    expect(hash).toBe(0)
  })

  it('should handle short strings', () => {
    const hash = generateBlockieHash('0x123')
    expect(hash).toBe(0)
  })

  it('should be case-insensitive', () => {
    const address1 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    const address2 = '0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD'

    const hash1 = generateBlockieHash(address1)
    const hash2 = generateBlockieHash(address2)

    expect(hash1).toBe(hash2)
  })
})

describe('getBlockieColor', () => {
  it('should return valid Tailwind color class', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const color = getBlockieColor(address)

    expect(color).toMatch(/^bg-\w+-500$/)
  })

  it('should return consistent color for same address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const color1 = getBlockieColor(address)
    const color2 = getBlockieColor(address)

    expect(color1).toBe(color2)
  })

  it('should handle different addresses', () => {
    const address1 = '0x1234567890123456789012345678901234567890'
    const address2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'

    const color1 = getBlockieColor(address1)
    const color2 = getBlockieColor(address2)

    // Both should be valid colors
    expect(color1).toMatch(/^bg-\w+-500$/)
    expect(color2).toMatch(/^bg-\w+-500$/)
  })
})
