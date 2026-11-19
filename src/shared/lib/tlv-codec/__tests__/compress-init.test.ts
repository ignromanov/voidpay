import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const fakeBrotli = {
  compress: (b: Uint8Array) => b,
  decompress: (b: Uint8Array) => b,
}

describe('brotli lazy init', () => {
  let factoryCalls = 0
  let failNext = 0

  beforeEach(() => {
    vi.resetModules()
    factoryCalls = 0
    failNext = 0
    vi.doMock('brotli-wasm', () => {
      factoryCalls++
      if (failNext > 0) {
        failNext--
        throw new Error('init failed')
      }
      return { default: fakeBrotli }
    })
  })

  afterEach(() => {
    vi.doUnmock('brotli-wasm')
  })

  it('does not load brotli-wasm on import', async () => {
    await import('../compress')
    await new Promise((r) => setTimeout(r, 20))
    expect(factoryCalls).toBe(0)
  })

  it('initializes once for concurrent first calls', async () => {
    const { decompressPayload } = await import('../compress')
    const payload = new Uint8Array([0x56, 0x81, 1, 2, 3])
    await Promise.all([decompressPayload(payload), decompressPayload(payload)])
    await decompressPayload(payload)
    expect(factoryCalls).toBe(1)
  })

  it('retries after a failed init', async () => {
    const { decompressPayload } = await import('../compress')
    const payload = new Uint8Array([0x56, 0x81, 1, 2, 3])
    failNext = 1
    await expect(decompressPayload(payload)).rejects.toThrow()
    await expect(decompressPayload(payload)).resolves.toBeInstanceOf(Uint8Array)
    expect(factoryCalls).toBe(2)
  })
})
