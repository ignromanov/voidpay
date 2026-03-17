import { describe, it, expect } from 'vitest'
import { writeVarInt, readVarInt, writeBigIntVarInt, readBigIntVarInt } from '../varint'

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
