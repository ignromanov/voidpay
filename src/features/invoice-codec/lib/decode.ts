import type { Invoice } from '@/entities/invoice'
import { invoiceSchema } from '@/entities/invoice'
import type { Invoice as PkgInvoice } from '@void-layer/types'
import { decodeInvoiceWire } from '@void-layer/codec'
import { decodeBase64url } from '@/shared/lib/tlv-codec'
import type { Address } from 'viem'
import { deriveMagicDust } from './security'

/**
 * Convert a hex-string salt (from @void-layer/types Invoice) to Uint8Array.
 * Needed to derive magic dust, which operates on raw salt bytes.
 */
function hexSaltToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

/** Convert package Invoice (snake_case) to app Invoice (camelCase) with magic dust. */
function fromPackageInvoice(pkg: PkgInvoice): Invoice {
  // Derive magic dust from salt bytes.
  // Replicates the decode.ts formula: dust = totalAtomic - expectedTotal when diff == possibleDust.
  // Here we compute possibleDust only; the caller (or schema) can use it.
  const saltBytes = hexSaltToBytes(pkg.salt)
  const possibleDustRaw = deriveMagicDust(saltBytes)
  const possibleDustAtomic = BigInt(possibleDustRaw)

  // Reconstruct expected subtotal to determine if magic dust was applied.
  // Mirrors the formula in the original decode.ts exactly.
  const scale = BigInt(10 ** pkg.decimals)
  const HUNDRED_SQUARED = 10000n
  const itemsSubtotal = pkg.items.reduce((acc, item) => {
    const rate = BigInt(item.rate || '0')
    const qtyScaled = BigInt(Math.round(item.quantity * Number(scale)))
    return acc + (qtyScaled * rate) / scale
  }, 0n)

  const taxPct = pkg.tax ? parseFloat(pkg.tax) : 0
  const discPct = pkg.discount ? parseFloat(pkg.discount) : 0

  let expectedTotal = itemsSubtotal
  if (taxPct > 0) {
    expectedTotal += (itemsSubtotal * BigInt(Math.round(taxPct * 100))) / HUNDRED_SQUARED
  }
  if (discPct > 0) {
    expectedTotal -= (itemsSubtotal * BigInt(Math.round(discPct * 100))) / HUNDRED_SQUARED
  }
  if (expectedTotal < 0n) expectedTotal = 0n

  const totalAtomic = BigInt(pkg.total)
  const diff = totalAtomic - expectedTotal
  const magicDust = diff === possibleDustAtomic ? possibleDustAtomic.toString() : undefined

  const invoice: Invoice = {
    invoiceId: pkg.invoice_id,
    issuedAt: pkg.issued_at,
    dueAt: pkg.due_at,
    networkId: pkg.network_id,
    currency: pkg.currency,
    decimals: pkg.decimals,
    total: pkg.total,
    from: {
      name: pkg.from.name,
      walletAddress: pkg.from.wallet_address as Address,
      ...(pkg.from.email && { email: pkg.from.email }),
      ...(pkg.from.phone && { phone: pkg.from.phone }),
      ...(pkg.from.physical_address && { physicalAddress: pkg.from.physical_address }),
      ...(pkg.from.tax_id && { taxId: pkg.from.tax_id }),
    },
    client: {
      name: pkg.client.name,
      ...(pkg.client.wallet_address && { walletAddress: pkg.client.wallet_address as Address }),
      ...(pkg.client.email && { email: pkg.client.email }),
      ...(pkg.client.phone && { phone: pkg.client.phone }),
      ...(pkg.client.physical_address && { physicalAddress: pkg.client.physical_address }),
      ...(pkg.client.tax_id && { taxId: pkg.client.tax_id }),
    },
    items: pkg.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
    ...(pkg.token_address && { tokenAddress: pkg.token_address as Address }),
    ...(pkg.notes && { notes: pkg.notes }),
    ...(pkg.tax && { tax: pkg.tax }),
    ...(pkg.discount && { discount: pkg.discount }),
    ...(magicDust !== undefined && { magicDust }),
  }

  return invoice
}

/**
 * Validates decoded invoice against schema.
 */
function validateInvoice(data: unknown): Invoice {
  const result = invoiceSchema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')
    throw new Error(`Invalid invoice data: ${errors}`)
  }

  return result.data
}

/**
 * Decodes a TLV v1 compressed string into an invoice object via @void-layer/codec WASM.
 *
 * Note (spike finding): The app-layer domain separator check (validateSecurity)
 * is not performed here — it requires raw TLV records not exposed by the package API.
 * The WASM canonical decoder validates TLV structure and canonical ordering.
 * Domain separator validation moves to Phase 3 package scope if this spike proceeds.
 *
 * @param compressed The Base64url-encoded string from the URL hash fragment (no prefix)
 * @returns The decoded invoice object
 * @throws Error if decoding fails or schema invalid
 */
export async function decodeInvoice(compressed: string): Promise<Invoice> {
  if (!compressed) {
    throw new Error('Empty invoice data')
  }

  const wireBytes = decodeBase64url(compressed)
  const pkgInvoice = await decodeInvoiceWire(wireBytes)
  const appInvoice = fromPackageInvoice(pkgInvoice)
  return validateInvoice(appInvoice)
}
