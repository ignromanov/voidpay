import { describe, expect, it } from 'vitest'
import { encodeChainId, decodeChainId } from '../chain-dict'

// ---------------------------------------------------------------------------
// Known chains — dict encoding (0x00 + code)
// ---------------------------------------------------------------------------

describe('encodeChainId — known chains', () => {
  const cases: [number, number][] = [
    [1, 0x01],       // Ethereum
    [42161, 0x02],   // Arbitrum
    [10, 0x03],      // Optimism
    [137, 0x04],     // Polygon
    [8453, 0x05],    // Base
  ]

  for (const [chainId, expectedCode] of cases) {
    it(`chainId ${chainId} encodes as [0x00, 0x${expectedCode.toString(16).padStart(2, '0')}]`, () => {
      const buf: number[] = []
      encodeChainId(buf, chainId)
      expect(buf).toEqual([0x00, expectedCode])
    })
  }
})

// ---------------------------------------------------------------------------
// Unknown chain — raw varint encoding (0x01 + varint)
// ---------------------------------------------------------------------------

describe('encodeChainId — unknown chain', () => {
  it('BSC (56) encodes as [0x01, varint]', () => {
    const buf: number[] = []
    encodeChainId(buf, 56)
    expect(buf[0]).toBe(0x01)
    expect(buf.length).toBeGreaterThan(1)
  })

  it('large unknown chainId encodes with 0x01 prefix', () => {
    const buf: number[] = []
    encodeChainId(buf, 999999)
    expect(buf[0]).toBe(0x01)
    expect(buf.length).toBeGreaterThan(1)
  })
})

// ---------------------------------------------------------------------------
// Roundtrip — known chains
// ---------------------------------------------------------------------------

describe('roundtrip — known chains', () => {
  const knownChains = [1, 42161, 10, 137, 8453]

  for (const chainId of knownChains) {
    it(`chainId ${chainId} roundtrips correctly`, () => {
      const buf: number[] = []
      encodeChainId(buf, chainId)
      const bytes = new Uint8Array(buf)
      const result = decodeChainId(bytes, 0)
      expect(result.chainId).toBe(chainId)
      expect(result.bytesRead).toBe(2)
    })
  }
})

// ---------------------------------------------------------------------------
// Roundtrip — unknown chain
// ---------------------------------------------------------------------------

describe('roundtrip — unknown chain', () => {
  it('BSC (56) roundtrips correctly', () => {
    const buf: number[] = []
    encodeChainId(buf, 56)
    const bytes = new Uint8Array(buf)
    const result = decodeChainId(bytes, 0)
    expect(result.chainId).toBe(56)
    expect(result.bytesRead).toBe(buf.length)
  })

  it('large chainId (999999) roundtrips correctly', () => {
    const buf: number[] = []
    encodeChainId(buf, 999999)
    const bytes = new Uint8Array(buf)
    const result = decodeChainId(bytes, 0)
    expect(result.chainId).toBe(999999)
    expect(result.bytesRead).toBe(buf.length)
  })
})

// ---------------------------------------------------------------------------
// decodeChainId — error cases
// ---------------------------------------------------------------------------

describe('decodeChainId — error cases', () => {
  it('throws on unknown dict code', () => {
    // prefix 0x00 + code 0xFF (not in dict)
    const bytes = new Uint8Array([0x00, 0xff])
    expect(() => decodeChainId(bytes, 0)).toThrow('Unknown chain dict code: 255')
  })

  it('throws on invalid prefix byte', () => {
    // prefix 0x02 is neither 0x00 nor 0x01
    const bytes = new Uint8Array([0x02, 0x01])
    expect(() => decodeChainId(bytes, 0)).toThrow('Invalid chain prefix: 0x2')
  })
})

// ---------------------------------------------------------------------------
// decodeChainId — offset support
// ---------------------------------------------------------------------------

describe('decodeChainId — non-zero offset', () => {
  it('decodes correctly from mid-buffer offset', () => {
    const buf: number[] = [0xde, 0xad] // 2 bytes of padding
    encodeChainId(buf, 1)              // Ethereum at offset 2
    const bytes = new Uint8Array(buf)
    const result = decodeChainId(bytes, 2)
    expect(result.chainId).toBe(1)
    expect(result.bytesRead).toBe(2)
  })
})
