import { describe, it, expect } from 'vitest'
import { privateKeyToAccount } from 'viem/accounts'
import { toHex } from 'viem'
import type { Address } from 'viem'
import {
  INVOICE_DOMAIN,
  INVOICE_TYPES,
  buildInvoiceTypedData,
  verifyInvoiceSignature,
  encodeSignature,
  decodeSignature,
  hashInvoiceTypedData,
} from '../eip712'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

// Hardhat account #0 — well-known test key, safe to use in tests
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const testAccount = privateKeyToAccount(TEST_PRIVATE_KEY)

const TEST_PARAMS = {
  invoiceId: 'INV-001',
  chainId: 1,
  subtotal: 1_000_000n, // 1 USDC in atomic units (6 decimals)
  fromAddress: testAccount.address,
  salt: new Uint8Array(16).fill(0xab),
}

// ---------------------------------------------------------------------------
// buildInvoiceTypedData
// ---------------------------------------------------------------------------

describe('buildInvoiceTypedData', () => {
  it('returns correct domain', () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    expect(typed.domain).toEqual(INVOICE_DOMAIN)
    expect(typed.domain.name).toBe('VoidPay Invoice')
    expect(typed.domain.version).toBe('1')
  })

  it('returns correct types', () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    expect(typed.types).toEqual(INVOICE_TYPES)
    expect(typed.types.Invoice).toHaveLength(5)
  })

  it('primaryType is Invoice', () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    expect(typed.primaryType).toBe('Invoice')
  })

  it('message contains all expected fields', () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    expect(typed.message.invoiceId).toBe('INV-001')
    expect(typed.message.chainId).toBe(1n)
    expect(typed.message.total).toBe(1_000_000n)
    expect(typed.message.from).toBe(testAccount.address)
  })

  it('encodes salt as 32-char hex (16 bytes = 0xababab...)', () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    // 16 bytes of 0xab → 32 hex chars
    expect(typed.message.salt).toBe('0x' + 'ab'.repeat(16))
  })

  it('encodes zero salt correctly', () => {
    const typed = buildInvoiceTypedData({ ...TEST_PARAMS, salt: new Uint8Array(16) })
    expect(typed.message.salt).toBe('0x' + '00'.repeat(16))
  })

  it('is deterministic for same inputs', () => {
    const a = buildInvoiceTypedData(TEST_PARAMS)
    const b = buildInvoiceTypedData(TEST_PARAMS)
    expect(a.message.salt).toBe(b.message.salt)
    expect(a.message.total).toBe(b.message.total)
  })

  it('produces different messages for different invoiceIds', () => {
    const a = buildInvoiceTypedData({ ...TEST_PARAMS, invoiceId: 'INV-001' })
    const b = buildInvoiceTypedData({ ...TEST_PARAMS, invoiceId: 'INV-002' })
    expect(a.message.invoiceId).not.toBe(b.message.invoiceId)
  })
})

// ---------------------------------------------------------------------------
// Sign + verify roundtrip
// ---------------------------------------------------------------------------

describe('verifyInvoiceSignature', () => {
  it('recovers signer address after signing', async () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    const hexSig = await testAccount.signTypedData({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
    })
    const sigBytes = encodeSignature(hexSig)

    const recovered = await verifyInvoiceSignature({ ...TEST_PARAMS, signature: sigBytes })

    expect(recovered.toLowerCase()).toBe(testAccount.address.toLowerCase())
  })

  it('recovered address matches fromAddress for valid signature', async () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    const hexSig = await testAccount.signTypedData({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
    })
    const sigBytes = encodeSignature(hexSig)

    const recovered = await verifyInvoiceSignature({ ...TEST_PARAMS, signature: sigBytes })
    expect(recovered.toLowerCase()).toBe(TEST_PARAMS.fromAddress.toLowerCase())
  })

  it('tampered invoice — recovered address differs from original signer', async () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    const hexSig = await testAccount.signTypedData({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
    })
    const sigBytes = encodeSignature(hexSig)

    // Different subtotal — tampered invoice
    const tamperedParams = { ...TEST_PARAMS, subtotal: 9_999_999n, signature: sigBytes }
    const recoveredFromTampered = await verifyInvoiceSignature(tamperedParams)

    // Recovered address should NOT match the original signer
    expect(recoveredFromTampered.toLowerCase()).not.toBe(testAccount.address.toLowerCase())
  })

  it('tampered salt — recovered address differs from original signer', async () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    const hexSig = await testAccount.signTypedData({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
    })
    const sigBytes = encodeSignature(hexSig)

    // Different salt — tampered invoice
    const tamperedSalt = new Uint8Array(16).fill(0xde)
    const recoveredFromTampered = await verifyInvoiceSignature({
      ...TEST_PARAMS,
      salt: tamperedSalt,
      signature: sigBytes,
    })

    expect(recoveredFromTampered.toLowerCase()).not.toBe(testAccount.address.toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// encodeSignature / decodeSignature roundtrip
// ---------------------------------------------------------------------------

describe('encodeSignature', () => {
  it('encodes 65-byte hex signature to Uint8Array', () => {
    const hex = ('0x' + 'ff'.repeat(65)) as `0x${string}`
    const bytes = encodeSignature(hex)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBe(65)
    expect(bytes.every((b) => b === 0xff)).toBe(true)
  })

  it('throws on signature shorter than 65 bytes', () => {
    const hex = ('0x' + 'aa'.repeat(64)) as `0x${string}`
    expect(() => encodeSignature(hex)).toThrow('Invalid signature length')
  })

  it('throws on signature longer than 65 bytes', () => {
    const hex = ('0x' + 'aa'.repeat(66)) as `0x${string}`
    expect(() => encodeSignature(hex)).toThrow('Invalid signature length')
  })
})

describe('decodeSignature', () => {
  it('decodes 65-byte Uint8Array to 0x-prefixed hex string', () => {
    const bytes = new Uint8Array(65).fill(0xcd)
    const hex = decodeSignature(bytes)
    expect(hex).toBe('0x' + 'cd'.repeat(65))
  })

  it('throws on value shorter than 65 bytes', () => {
    const bytes = new Uint8Array(64)
    expect(() => decodeSignature(bytes)).toThrow('Invalid signature value length')
  })

  it('throws on value longer than 65 bytes', () => {
    const bytes = new Uint8Array(66)
    expect(() => decodeSignature(bytes)).toThrow('Invalid signature value length')
  })
})

describe('encodeSignature / decodeSignature roundtrip', () => {
  it('encode then decode returns original hex', async () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    const hexSig = await testAccount.signTypedData({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
    })

    const bytes = encodeSignature(hexSig)
    const decoded = decodeSignature(bytes)

    expect(decoded.toLowerCase()).toBe(hexSig.toLowerCase())
  })

  it('decode then encode returns original bytes', async () => {
    const typed = buildInvoiceTypedData(TEST_PARAMS)
    const hexSig = await testAccount.signTypedData({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
    })

    const originalBytes = encodeSignature(hexSig)
    const decoded = decodeSignature(originalBytes)
    const reencoded = encodeSignature(decoded)

    expect(toHex(reencoded)).toBe(toHex(originalBytes))
  })
})

// ---------------------------------------------------------------------------
// hashInvoiceTypedData
// ---------------------------------------------------------------------------

describe('hashInvoiceTypedData', () => {
  it('returns a 0x-prefixed 32-byte hash', () => {
    const hash = hashInvoiceTypedData(TEST_PARAMS)
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/i)
  })

  it('is deterministic for same inputs', () => {
    const h1 = hashInvoiceTypedData(TEST_PARAMS)
    const h2 = hashInvoiceTypedData(TEST_PARAMS)
    expect(h1).toBe(h2)
  })

  it('differs for different invoiceId', () => {
    const h1 = hashInvoiceTypedData({ ...TEST_PARAMS, invoiceId: 'INV-001' })
    const h2 = hashInvoiceTypedData({ ...TEST_PARAMS, invoiceId: 'INV-002' })
    expect(h1).not.toBe(h2)
  })

  it('differs for different chainId', () => {
    const h1 = hashInvoiceTypedData({ ...TEST_PARAMS, chainId: 1 })
    const h2 = hashInvoiceTypedData({ ...TEST_PARAMS, chainId: 42161 })
    expect(h1).not.toBe(h2)
  })

  it('differs for different subtotal', () => {
    const h1 = hashInvoiceTypedData({ ...TEST_PARAMS, subtotal: 1_000_000n })
    const h2 = hashInvoiceTypedData({ ...TEST_PARAMS, subtotal: 2_000_000n })
    expect(h1).not.toBe(h2)
  })

  it('differs for different salt', () => {
    const h1 = hashInvoiceTypedData({ ...TEST_PARAMS, salt: new Uint8Array(16).fill(0x01) })
    const h2 = hashInvoiceTypedData({ ...TEST_PARAMS, salt: new Uint8Array(16).fill(0x02) })
    expect(h1).not.toBe(h2)
  })
})
