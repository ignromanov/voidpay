import { describe, it, expect } from 'vitest'
import { writeVarInt, readVarInt, writeBigIntVarInt, readBigIntVarInt, writeMantissa, readMantissa, writeQuantity, readQuantity } from '../varint'

describe('writeVarInt / readVarInt', () => {
  it.each([
    [0, [0x00]],
    [1, [0x01]],
    [127, [0x7f]],
    [128, [0x80, 0x01]],
    [16384, [0x80, 0x80, 0x01]],
    [4294967295, [0xff, 0xff, 0xff, 0xff, 0x0f]], // max uint32
  ])('roundtrips %i', (value, expectedBytes) => {
    const buffer: number[] = []
    writeVarInt(buffer, value)
    expect(buffer).toEqual(expectedBytes)
    const result = readVarInt(new Uint8Array(buffer), 0)
    expect(result.value).toBe(value)
    expect(result.bytesRead).toBe(expectedBytes.length)
  })
})

describe('writeBigIntVarInt / readBigIntVarInt', () => {
  it.each([
    [0n],
    [1n],
    [150000000n],  // $150 USDC
    [10n ** 18n],  // 1 ETH in wei
  ])('roundtrips %s', (value) => {
    const buffer: number[] = []
    writeBigIntVarInt(buffer, value)
    const result = readBigIntVarInt(new Uint8Array(buffer), 0)
    expect(result.value).toBe(value)
  })

  it('throws on negative', () => {
    expect(() => {
      const buf: number[] = []
      writeBigIntVarInt(buf, -1n)
    }).toThrow()
  })
})

describe('writeMantissa / readMantissa', () => {
  it.each([
    [100000000n, 1n, 8],        // USDC $100
    [1500000000n, 15n, 8],      // USDC $1500
    [10n ** 18n, 1n, 18],       // 1 ETH in wei
    [5n * 10n ** 17n, 5n, 17],  // 0.5 ETH in wei
    [42n, 42n, 0],              // no trailing zeros
    [0n, 0n, 0],                // zero
  ])('encodes %s → mantissa=%s zeros=%i', (value, expectedMantissa, expectedZeros) => {
    const buf: number[] = []
    writeMantissa(buf, value)
    const result = readMantissa(new Uint8Array(buf), 0)
    expect(result.mantissa).toBe(expectedMantissa)
    expect(result.zeros).toBe(expectedZeros)
    expect(result.value).toBe(value)
    expect(result.bytesRead).toBe(buf.length)
  })

  it('readMantissa rejects zeros byte > 30 (decompression bomb guard)', () => {
    // Craft a byte array: mantissa=1 (single byte 0x01), zeros=31 (0x1f)
    const buf = new Uint8Array([0x01, 31])
    expect(() => readMantissa(buf, 0)).toThrow(/exceeds maximum 30/)
  })

  it('readMantissa rejects zeros byte = 255 (max uint8)', () => {
    const buf = new Uint8Array([0x01, 255])
    expect(() => readMantissa(buf, 0)).toThrow(/exceeds maximum 30/)
  })

  it('readMantissa accepts zeros byte = 30 (boundary — valid)', () => {
    const buf: number[] = []
    writeMantissa(buf, 1n)
    // Overwrite the zeros byte (index 1) with 30
    buf[1] = 30
    const result = readMantissa(new Uint8Array(buf), 0)
    expect(result.zeros).toBe(30)
    expect(result.value).toBe(10n ** 30n)
  })

  it('mantissa encoding is more compact than raw varint for 10^18', () => {
    const value = 10n ** 18n

    const mantissaBuf: number[] = []
    writeMantissa(mantissaBuf, value)

    const rawBuf: number[] = []
    writeBigIntVarInt(rawBuf, value)

    expect(mantissaBuf.length).toBeLessThan(rawBuf.length)
  })
})

describe('writeQuantity / readQuantity', () => {
  it.each([
    [1],
    [10],
    [1.5],
    [0.25],
    [99.99],
  ])('roundtrips %f', (qty) => {
    const buf: number[] = []
    writeQuantity(buf, qty)
    const result = readQuantity(new Uint8Array(buf), 0)
    expect(result.value).toBeCloseTo(qty, 4)
    expect(result.bytesRead).toBe(buf.length)
  })

  it('qty=1 uses scale=0 (1 byte overhead vs 4 bytes float32)', () => {
    const buf: number[] = []
    writeQuantity(buf, 1)
    expect(buf[0]).toBe(0)   // scale
    expect(buf[1]).toBe(1)   // value=1
    expect(buf.length).toBe(2)
  })

  it('qty=10 uses scale=0', () => {
    const buf: number[] = []
    writeQuantity(buf, 10)
    expect(buf[0]).toBe(0)
    expect(buf[1]).toBe(10)
  })

  it('qty=1.5 uses scale=1 value=15', () => {
    const buf: number[] = []
    writeQuantity(buf, 1.5)
    expect(buf[0]).toBe(1)
    expect(buf[1]).toBe(15)
  })

  it('qty=0.25 uses scale=2 value=25', () => {
    const buf: number[] = []
    writeQuantity(buf, 0.25)
    expect(buf[0]).toBe(2)
    expect(buf[1]).toBe(25)
  })

  it('qty=99.99 uses scale=2 value=9999', () => {
    const buf: number[] = []
    writeQuantity(buf, 99.99)
    expect(buf[0]).toBe(2)
    const { value: scaled } = readQuantity(new Uint8Array(buf), 0)
    expect(scaled).toBeCloseTo(99.99, 4)
  })
})
