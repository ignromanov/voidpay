import { describe, expect, it } from 'vitest'
import { applyDict, reverseDict } from '../app-dict'

function encode(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

function decode(b: Uint8Array): string {
  return new TextDecoder().decode(b)
}

// ---------------------------------------------------------------------------
// applyDict — compression
// ---------------------------------------------------------------------------

describe('applyDict', () => {
  it('test@gmail.com substitution produces shorter result', () => {
    const input = encode('test@gmail.com')
    const result = applyDict(input)
    expect(result.length).toBeLessThan(input.length)
  })

  it('@outlook.com is substituted', () => {
    const input = encode('user@outlook.com')
    const result = applyDict(input)
    // "@outlook.com" (12 chars) → 1 byte
    expect(result.length).toBeLessThan(input.length)
  })

  it('https:// is substituted', () => {
    const input = encode('https://example.com')
    const result = applyDict(input)
    expect(result.length).toBeLessThan(input.length)
  })

  it('Invoice is substituted', () => {
    const input = encode('Invoice #001')
    const result = applyDict(input)
    expect(result.length).toBeLessThan(input.length)
  })

  it('INV- prefix is substituted', () => {
    const input = encode('INV-001')
    const result = applyDict(input)
    expect(result.length).toBeLessThan(input.length)
  })

  it('development is substituted', () => {
    const input = encode('Smart Contract development')
    const result = applyDict(input)
    expect(result.length).toBeLessThan(input.length)
  })

  it('text without patterns passes through unchanged', () => {
    const plain = 'Hello World, no patterns here!'
    const input = encode(plain)
    const result = applyDict(input)
    expect(decode(result)).toBe(plain)
    expect(result.length).toBe(input.length)
  })

  it('empty string returns empty bytes', () => {
    const result = applyDict(encode(''))
    expect(result.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Roundtrip
// ---------------------------------------------------------------------------

describe('applyDict / reverseDict roundtrip', () => {
  it('roundtrips text with gmail pattern', () => {
    const original = 'john@gmail.com'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })

  it('roundtrips complex string with multiple patterns', () => {
    const original = 'John Doe, john@gmail.com, Invoice #123'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })

  it('roundtrips text WITHOUT any patterns (passthrough)', () => {
    const original = 'Simple plain text, nothing special here.'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })

  it('roundtrips multiple patterns in one string', () => {
    const original = 'Invoice INV-001 from alice@gmail.com, Payment for development consulting via https://pay.example.com'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })

  it('roundtrips empty string', () => {
    const compressed = applyDict(encode(''))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe('')
  })

  it('roundtrips all dictionary patterns together', () => {
    const original = '@outlook.com @hotmail.com @gmail.com @yahoo.com https:// Invoice Payment development consulting .com INV-'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })

  it('roundtrips INV- prefix', () => {
    const original = 'INV-2024-042'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })

  it('roundtrips yahoo.com email', () => {
    const original = 'user@yahoo.com'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })
})

// ---------------------------------------------------------------------------
// reverseDict — expansion overflow guard
// ---------------------------------------------------------------------------

describe('reverseDict — overflow guard', () => {
  it('throws when expanded result exceeds 4096 bytes', () => {
    // Build a synthetic compressed buffer that has many substitution codes.
    // Each code expands to its pattern (e.g., 0x02 → "@outlook.com" = 12 chars).
    // Fill 400 bytes with 0x02 → expands to 400 * 12 = 4800 bytes > 4096.
    const manySubstitutions = new Uint8Array(400).fill(0x02)
    expect(() => reverseDict(manySubstitutions)).toThrow(/exceeds maximum field size/)
  })

  it('does NOT throw when expanded result is exactly at the limit (4096 bytes)', () => {
    // Use a plain ASCII string of exactly 4096 bytes (no substitutions, passthrough).
    const atLimit = new TextEncoder().encode('A'.repeat(4096))
    expect(() => reverseDict(atLimit)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// reverseDict — applies in reverse order (no double-substitution)
// ---------------------------------------------------------------------------

describe('reverseDict — ordering', () => {
  it('restores longer patterns before shorter overlapping ones', () => {
    // "@gmail.com" should restore before ".com" to avoid "@gmail" + ".com" mismatch
    const original = 'a@gmail.com'
    const compressed = applyDict(encode(original))
    const restored = reverseDict(compressed)
    expect(decode(restored)).toBe(original)
  })
})
