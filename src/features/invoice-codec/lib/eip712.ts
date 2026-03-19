/**
 * EIP-712 typed data builder and signature utilities for VoidPay invoices.
 *
 * Type 33 (odd = optional): 65-byte raw signature (r+s+v).
 * Old decoders skip unknown odd types silently — backwards-compatible.
 *
 * Spec reference: 027-codec-v1-rewrite — optional EIP-712 signature support.
 */

import { recoverTypedDataAddress, hashTypedData, type Address } from 'viem'

// ---------------------------------------------------------------------------
// EIP-712 domain and types
// ---------------------------------------------------------------------------

export const INVOICE_DOMAIN = {
  name: 'VoidPay Invoice',
  version: '1',
} as const

export const INVOICE_TYPES = {
  Invoice: [
    { name: 'invoiceId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'total', type: 'uint256' },
    { name: 'from', type: 'address' },
    { name: 'salt', type: 'bytes16' },
  ],
} as const

// ---------------------------------------------------------------------------
// Typed data builder
// ---------------------------------------------------------------------------

export interface InvoiceTypedDataParams {
  invoiceId: string
  chainId: number
  /** Subtotal without magicDust (atomic units) */
  subtotal: bigint
  fromAddress: Address
  /** 16-byte salt from TLV Type 20 */
  salt: Uint8Array
}

export interface InvoiceTypedData {
  domain: typeof INVOICE_DOMAIN
  types: typeof INVOICE_TYPES
  primaryType: 'Invoice'
  message: {
    invoiceId: string
    chainId: bigint
    total: bigint
    from: Address
    salt: `0x${string}`
  }
}

/**
 * Build EIP-712 typed data for an invoice (for signing or hash computation).
 * The caller uses the returned object with `wallet.signTypedData(...)`.
 */
export function buildInvoiceTypedData(params: InvoiceTypedDataParams): InvoiceTypedData {
  const { invoiceId, chainId, subtotal, fromAddress, salt } = params

  const saltHex = `0x${Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`

  return {
    domain: INVOICE_DOMAIN,
    types: INVOICE_TYPES,
    primaryType: 'Invoice',
    message: {
      invoiceId,
      chainId: BigInt(chainId),
      total: subtotal,
      from: fromAddress,
      salt: saltHex,
    },
  }
}

// ---------------------------------------------------------------------------
// Signature verifier
// ---------------------------------------------------------------------------

export interface VerifyInvoiceSignatureParams extends InvoiceTypedDataParams {
  /** 65-byte raw signature (r+s+v) */
  signature: Uint8Array
}

/**
 * Verify an EIP-712 signature and recover the signer address.
 * Returns the recovered Address (checksummed).
 */
export async function verifyInvoiceSignature(
  params: VerifyInvoiceSignatureParams
): Promise<Address> {
  const { invoiceId, chainId, subtotal, fromAddress, salt, signature } = params

  const typed = buildInvoiceTypedData({ invoiceId, chainId, subtotal, fromAddress, salt })

  const sigHex = decodeSignature(signature)

  const recovered = await recoverTypedDataAddress({
    domain: typed.domain,
    types: typed.types,
    primaryType: typed.primaryType,
    message: typed.message,
    signature: sigHex,
  })

  return recovered
}

// ---------------------------------------------------------------------------
// Encode / decode helpers for TLV Type 33
// ---------------------------------------------------------------------------

/**
 * Encode a 65-byte hex signature string to raw Uint8Array (for TLV Type 33).
 * Expects a 0x-prefixed hex string of exactly 65 bytes (130 hex chars).
 */
export function encodeSignature(hexSignature: `0x${string}`): Uint8Array {
  const hex = hexSignature.startsWith('0x') ? hexSignature.slice(2) : hexSignature
  if (hex.length !== 130) {
    throw new Error(
      `Invalid signature length: expected 65 bytes (130 hex chars), got ${hex.length / 2} bytes`
    )
  }
  const bytes = new Uint8Array(65)
  for (let i = 0; i < 65; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Decode TLV Type 33 raw bytes to 0x-prefixed hex signature string.
 * Expects exactly 65 bytes.
 */
export function decodeSignature(value: Uint8Array): `0x${string}` {
  if (value.length !== 65) {
    throw new Error(
      `Invalid signature value length: expected 65 bytes, got ${value.length}`
    )
  }
  const hex = Array.from(value)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `0x${hex}`
}

// ---------------------------------------------------------------------------
// Hash helper (for testing / external use without signing)
// ---------------------------------------------------------------------------

/**
 * Compute EIP-712 hash of invoice typed data.
 * Useful for verifying the hash without performing a full signature recovery.
 */
export function hashInvoiceTypedData(params: InvoiceTypedDataParams): `0x${string}` {
  const typed = buildInvoiceTypedData(params)
  return hashTypedData({
    domain: typed.domain,
    types: typed.types,
    primaryType: typed.primaryType,
    message: typed.message,
  })
}
