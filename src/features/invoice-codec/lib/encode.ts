import type { Invoice } from '@/entities/invoice'
import type { Invoice as PkgInvoice } from '@void-layer/types'
import type { ChainId } from '@void-layer/types'
import { encodeInvoiceWire } from '@void-layer/codec'
import { encodeBase64url } from '@/shared/lib/tlv-codec'
import { getAppBaseUrl } from '@/shared/config'
import { encodeOGPreview } from './og-preview'
import { generateSalt } from './security'

/** Convert app Invoice (camelCase) to package Invoice (snake_case) for WASM encoder. */
function toPackageInvoice(invoice: Invoice, salt: Uint8Array): PkgInvoice {
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return {
    invoice_id: invoice.invoiceId,
    issued_at: invoice.issuedAt,
    due_at: invoice.dueAt,
    network_id: invoice.networkId as ChainId,
    currency: invoice.currency,
    decimals: invoice.decimals,
    total: invoice.total ?? '0',
    salt: saltHex,
    from: {
      name: invoice.from.name,
      wallet_address: invoice.from.walletAddress,
      ...(invoice.from.email && { email: invoice.from.email }),
      ...(invoice.from.phone && { phone: invoice.from.phone }),
      ...(invoice.from.physicalAddress && { physical_address: invoice.from.physicalAddress }),
      ...(invoice.from.taxId && { tax_id: invoice.from.taxId }),
    },
    client: {
      name: invoice.client.name,
      ...(invoice.client.walletAddress && { wallet_address: invoice.client.walletAddress }),
      ...(invoice.client.email && { email: invoice.client.email }),
      ...(invoice.client.phone && { phone: invoice.client.phone }),
      ...(invoice.client.physicalAddress && { physical_address: invoice.client.physicalAddress }),
      ...(invoice.client.taxId && { tax_id: invoice.client.taxId }),
    },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
    })),
    ...(invoice.tokenAddress && { token_address: invoice.tokenAddress }),
    ...(invoice.notes && { notes: invoice.notes }),
    ...(invoice.tax && { tax: invoice.tax }),
    ...(invoice.discount && { discount: invoice.discount }),
  }
}

/**
 * Encodes an invoice into a TLV v1 compressed string via @void-layer/codec WASM.
 *
 * @param invoice The invoice data to encode
 * @param salt Optional 16-byte salt (for deterministic magic dust). Generated if omitted.
 * @returns The Base64url-encoded binary string (no prefix — magic byte is inside)
 */
export async function encodeInvoice(invoice: Invoice, salt?: Uint8Array): Promise<string> {
  if (!invoice.total) throw new Error('Invoice total is required for encoding')
  const actualSalt = salt ?? generateSalt()
  const pkgInvoice = toPackageInvoice(invoice, actualSalt)
  const wireBytes = await encodeInvoiceWire(pkgInvoice)
  return encodeBase64url(wireBytes)
}

/**
 * URL generation options.
 */
export interface GenerateUrlOptions {
  /** Base URL override (default: from NEXT_PUBLIC_APP_URL env) */
  baseUrl?: string
  /** Include OG preview data for social sharing (default: false) */
  includeOG?: boolean
  /** URL path (default: '/pay', use '/invoice' for creator tracking link) */
  path?: '/pay' | '/invoice'
}

/**
 * Generates a shareable URL for the invoice using hash fragment.
 * Hash fragments are never sent to the server (Privacy-First principle).
 * Validates that the final URL does not exceed 2000 bytes.
 */
export async function generateInvoiceUrl(
  invoice: Invoice,
  options: (GenerateUrlOptions & { salt?: Uint8Array }) | string = {}
): Promise<string> {
  const opts: GenerateUrlOptions & { salt?: Uint8Array } =
    typeof options === 'string' ? { baseUrl: options } : options

  const compressed = await encodeInvoice(invoice, opts.salt)
  const appUrl = opts.baseUrl ?? getAppBaseUrl()
  const path = opts.path ?? '/pay'

  let finalUrl: string

  if (opts.includeOG) {
    const ogData = encodeOGPreview(invoice)
    finalUrl = `${appUrl}${path}?og=${ogData}#${compressed}`
  } else {
    finalUrl = `${appUrl}${path}#${compressed}`
  }

  const byteSize = new TextEncoder().encode(finalUrl).length

  if (byteSize > 2000) {
    throw new Error(`URL size (${byteSize} bytes) exceeds 2000 byte limit`)
  }

  return finalUrl
}
