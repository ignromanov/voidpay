/**
 * EIP-712 typed data builder and signature utilities for VoidPay invoices.
 *
 * Type 33 (odd = optional): 65-byte raw signature (r+s+v).
 * Old decoders skip unknown odd types silently — backwards-compatible.
 *
 * Spec reference: 027-codec-v1-rewrite — optional EIP-712 signature support.
 */

import { recoverTypedDataAddress, hashTypedData, hexToBytes, bytesToHex, type Address } from 'viem'
import { addressesMatch } from '@/shared/lib/validation'

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
  domain: typeof INVOICE_DOMAIN & { chainId: number }
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

  const saltHex = bytesToHex(salt)

  return {
    domain: { ...INVOICE_DOMAIN, chainId },
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

  let recovered: Address
  try {
    recovered = await recoverTypedDataAddress({
      domain: typed.domain,
      types: typed.types,
      primaryType: typed.primaryType,
      message: typed.message,
      signature: sigHex,
    })
  } catch (err) {
    throw new Error(
      `Signature recovery failed: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (!addressesMatch(recovered, fromAddress)) {
    throw new Error('Signature signer does not match invoice creator')
  }

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
  return hexToBytes(hexSignature)
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
  return bytesToHex(value)
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
