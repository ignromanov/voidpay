import type { Invoice } from '@/entities/invoice'
import { invoiceSchema } from '@/entities/invoice'
import type { TlvRecord } from '@/shared/lib/tlv-codec'
import {
  readTlv,
  validateCanonical,
  decodeBase64url,
  readVarInt,
  readMantissa,
  readQuantity,
  groupedInflate,
  isRequired,
} from '@/shared/lib/tlv-codec'
import {
  TlvType,
  decodeCurrency,
  decodeTokenAddress,
  COMPRESSED_TEXT_WHITELIST,
} from './tlv-map'
import { validateSecurity, deriveMagicDust } from './security'
import { decodeChainId } from './chain-dict'
import { reverseDict } from './app-dict'
import type { Address } from 'viem'

/** Decode a Uint8Array to UTF-8 string */
function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

/** Decode 20 raw bytes to 0x-prefixed hex address */
function bytesToAddress(bytes: Uint8Array): string {
  let hex = '0x'
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0')
  }
  return hex
}

/** Find a record by type, return undefined if not found */
function findRecord(records: TlvRecord[], type: number): TlvRecord | undefined {
  return records.find((r) => r.type === type)
}

/** Find a record by type, throw if not found */
function requireRecord(records: TlvRecord[], type: number, name: string): TlvRecord {
  const record = findRecord(records, type)
  if (!record) {
    throw new Error(`Missing required TLV type ${type} (${name})`)
  }
  return record
}

const MAX_ITEMS = 50 // hardening limit (schema may be stricter)

/** Unpack line items from Type 14 binary format */
function unpackItems(data: Uint8Array): Invoice['items'] {
  let offset = 0
  const countResult = readVarInt(data, offset)
  const count = countResult.value
  offset += countResult.bytesRead

  if (count > MAX_ITEMS) {
    throw new Error(`Item count ${count} exceeds max ${MAX_ITEMS}`)
  }

  const items: Invoice['items'] = []
  for (let i = 0; i < count; i++) {
    // description
    const descLenResult = readVarInt(data, offset)
    offset += descLenResult.bytesRead
    const descBytes = data.slice(offset, offset + descLenResult.value)
    offset += descLenResult.value
    const description = decodeUtf8(reverseDict(descBytes))

    // quantity: scale + varint
    const qtyResult = readQuantity(data, offset)
    const quantity = qtyResult.value
    offset += qtyResult.bytesRead

    // rate: mantissa + trailing zeros
    const rateResult = readMantissa(data, offset)
    const rate = rateResult.value.toString()
    offset += rateResult.bytesRead

    items.push({ description, quantity, rate })
  }
  return items
}

/**
 * Decodes a TLV v1 compressed string into an invoice object.
 * Validates canonical ordering, security constraints, and schema.
 *
 * @param compressed The Base64url-encoded string from the URL hash fragment (no prefix)
 * @returns The decoded invoice object
 * @throws Error if decoding fails, security validation fails, or schema invalid
 */
export function decodeInvoice(compressed: string): Invoice {
  if (!compressed) {
    throw new Error('Empty invoice data')
  }

  try {
    // 1. Base64url → binary (no mix prefix to strip)
    const bytes = decodeBase64url(compressed)

    // 2. Parse TLV structure
    const { records } = readTlv(bytes)

    // 3. Validate canonical ordering (ascending by type, no duplicates)
    validateCanonical(records)

    // 4. Security validation (salt, domain separator)
    validateSecurity(records)

    // 5. Handle compressed text block (Type 253)
    let allRecords = [...records]
    const compressedRecord = findRecord(allRecords, TlvType.COMPRESSED_TEXT)
    if (compressedRecord) {
      const inflatedFields = groupedInflate(compressedRecord.value)
      // Validate whitelist — reject spoofed type_ids
      for (const field of inflatedFields) {
        if (!COMPRESSED_TEXT_WHITELIST.has(field.typeId)) {
          throw new Error(
            `Type spoofing: type_id ${field.typeId} not allowed in compressed block`
          )
        }
      }
      // Merge inflated fields as TLV records, remove Type 253
      allRecords = allRecords.filter((r) => r.type !== TlvType.COMPRESSED_TEXT)
      const existingTypes = new Set(allRecords.map((r) => r.type))
      for (const field of inflatedFields) {
        if (existingTypes.has(field.typeId)) {
          throw new Error(`Duplicate type after decompression: ${field.typeId}`)
        }
        existingTypes.add(field.typeId)
        allRecords.push({ type: field.typeId, value: field.value })
      }
    }

    // 6. Check for unknown required (even) types
    const knownTypes = new Set<number>(Object.values(TlvType))
    for (const record of allRecords) {
      if (isRequired(record.type) && !knownTypes.has(record.type)) {
        throw new Error(`Unknown required TLV type: ${record.type}`)
      }
    }

    // 7. Extract required fields
    const chainIdRecord = requireRecord(allRecords, TlvType.CHAIN_ID, 'chainId')
    const issuedAtRecord = requireRecord(allRecords, TlvType.ISSUED_AT, 'issuedAt')
    const dueAtRecord = requireRecord(allRecords, TlvType.DUE_AT, 'dueAt')
    const decimalsRecord = requireRecord(allRecords, TlvType.DECIMALS, 'decimals')
    const fromWalletRecord = requireRecord(allRecords, TlvType.FROM_WALLET, 'fromWallet')
    const currencyRecord = requireRecord(allRecords, TlvType.CURRENCY, 'currency')
    const itemsRecord = requireRecord(allRecords, TlvType.ITEMS, 'items')
    const invoiceIdRecord = requireRecord(allRecords, TlvType.INVOICE_ID, 'invoiceId')
    const fromNameRecord = requireRecord(allRecords, TlvType.FROM_NAME, 'fromName')
    const clientNameRecord = requireRecord(allRecords, TlvType.CLIENT_NAME, 'clientName')
    const saltRecord = requireRecord(allRecords, TlvType.SALT, 'salt')
    const totalRecord = requireRecord(allRecords, TlvType.TOTAL, 'total')

    // 8. Decode required fields

    // chainId: dict code for known chains, raw varint for unknown
    const chainIdResult = decodeChainId(chainIdRecord.value, 0)
    const networkId = chainIdResult.chainId

    const issuedAt =
      ((issuedAtRecord.value[0]! << 24) |
        (issuedAtRecord.value[1]! << 16) |
        (issuedAtRecord.value[2]! << 8) |
        issuedAtRecord.value[3]!) >>> 0

    // dueAt: delta from issuedAt (varint)
    const dueDeltaResult = readVarInt(dueAtRecord.value, 0)
    const dueAt = issuedAt + dueDeltaResult.value

    const decimals = decimalsRecord.value[0]!

    const fromWalletAddress = bytesToAddress(fromWalletRecord.value)

    // Currency: prefix 0x00=dict, 0x01=raw
    let currency: string
    if (currencyRecord.value[0] === 0x00) {
      const code = currencyRecord.value[1]!
      currency = decodeCurrency(code) ?? `UNKNOWN_${code}`
    } else {
      currency = decodeUtf8(currencyRecord.value.slice(1))
    }

    const items = unpackItems(itemsRecord.value)
    const invoiceId = decodeUtf8(invoiceIdRecord.value)

    // Text fields: reverse app-level dictionary substitution
    const fromName = decodeUtf8(reverseDict(fromNameRecord.value))
    const clientName = decodeUtf8(reverseDict(clientNameRecord.value))

    // Total: read subtotal via mantissa, derive magicDust from salt
    const subtotalResult = readMantissa(totalRecord.value, 0)
    const subtotal = subtotalResult.value
    const magicDustRaw = deriveMagicDust(saltRecord.value)
    const magicDustAtomic = BigInt(magicDustRaw)
    const total = (subtotal + magicDustAtomic).toString()
    const magicDust = magicDustAtomic.toString()

    // 9. Decode optional fields
    const tokenAddressRecord = findRecord(allRecords, TlvType.TOKEN_ADDRESS)
    let tokenAddress: string | undefined
    if (tokenAddressRecord) {
      if (tokenAddressRecord.value[0] === 0x00) {
        const code = tokenAddressRecord.value[1]!
        const entry = decodeTokenAddress(code)
        tokenAddress = entry?.address
      } else {
        tokenAddress = bytesToAddress(tokenAddressRecord.value.slice(1))
      }
    }

    const clientWalletRecord = findRecord(allRecords, TlvType.CLIENT_WALLET)
    const clientWalletAddress = clientWalletRecord
      ? bytesToAddress(clientWalletRecord.value)
      : undefined

    const notesRecord = findRecord(allRecords, TlvType.NOTES)
    const notes = notesRecord ? decodeUtf8(reverseDict(notesRecord.value)) : undefined

    const fromEmailRecord = findRecord(allRecords, TlvType.FROM_EMAIL)
    const fromEmail = fromEmailRecord ? decodeUtf8(reverseDict(fromEmailRecord.value)) : undefined

    const fromPhoneRecord = findRecord(allRecords, TlvType.FROM_PHONE)
    const fromPhone = fromPhoneRecord ? decodeUtf8(reverseDict(fromPhoneRecord.value)) : undefined

    const fromAddressRecord = findRecord(allRecords, TlvType.FROM_ADDRESS)
    const fromPhysicalAddress = fromAddressRecord ? decodeUtf8(reverseDict(fromAddressRecord.value)) : undefined

    const fromTaxIdRecord = findRecord(allRecords, TlvType.FROM_TAX_ID)
    const fromTaxId = fromTaxIdRecord ? decodeUtf8(reverseDict(fromTaxIdRecord.value)) : undefined

    const clientEmailRecord = findRecord(allRecords, TlvType.CLIENT_EMAIL)
    const clientEmail = clientEmailRecord ? decodeUtf8(reverseDict(clientEmailRecord.value)) : undefined

    const clientPhoneRecord = findRecord(allRecords, TlvType.CLIENT_PHONE)
    const clientPhone = clientPhoneRecord ? decodeUtf8(reverseDict(clientPhoneRecord.value)) : undefined

    const clientAddressRecord = findRecord(allRecords, TlvType.CLIENT_ADDRESS)
    const clientPhysicalAddress = clientAddressRecord
      ? decodeUtf8(reverseDict(clientAddressRecord.value))
      : undefined

    const clientTaxIdRecord = findRecord(allRecords, TlvType.CLIENT_TAX_ID)
    const clientTaxId = clientTaxIdRecord ? decodeUtf8(reverseDict(clientTaxIdRecord.value)) : undefined

    const taxRecord = findRecord(allRecords, TlvType.TAX)
    const tax = taxRecord ? decodeUtf8(taxRecord.value) : undefined

    const discountRecord = findRecord(allRecords, TlvType.DISCOUNT)
    const discount = discountRecord ? decodeUtf8(discountRecord.value) : undefined

    // 10. Construct invoice
    const invoice: Invoice = {
      invoiceId,
      issuedAt,
      dueAt,
      networkId,
      currency,
      decimals,
      from: {
        name: fromName,
        walletAddress: fromWalletAddress as Address,
        ...(fromEmail && { email: fromEmail }),
        ...(fromPhysicalAddress && { physicalAddress: fromPhysicalAddress }),
        ...(fromPhone && { phone: fromPhone }),
        ...(fromTaxId && { taxId: fromTaxId }),
      },
      client: {
        name: clientName,
        ...(clientWalletAddress && { walletAddress: clientWalletAddress as Address }),
        ...(clientEmail && { email: clientEmail }),
        ...(clientPhysicalAddress && { physicalAddress: clientPhysicalAddress }),
        ...(clientPhone && { phone: clientPhone }),
        ...(clientTaxId && { taxId: clientTaxId }),
      },
      items,
      ...(tokenAddress && { tokenAddress: tokenAddress as Address }),
      ...(notes && { notes }),
      ...(tax && { tax }),
      ...(discount && { discount }),
      total,
      magicDust,
    }

    // 11. Validate against schema
    return validateInvoice(invoice)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to decode invoice data')
  }
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
