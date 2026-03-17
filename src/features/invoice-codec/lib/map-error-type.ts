import type { DecodeErrorType } from '@/shared/ui/decode-error-screen'

/**
 * Map parseInvoiceHash error messages to DecodeErrorType
 * for the decode error screen.
 *
 * The codec produces Error objects with descriptive messages;
 * this adapter translates them into typed UI error categories.
 */
export function mapParseErrorToDecodeType(message: string): DecodeErrorType {
  const lower = message.toLowerCase()

  // EMPTY_HASH: no data present at all
  if (lower.includes('empty')) return 'EMPTY_HASH'

  // UNSUPPORTED_VERSION: must be checked before INVALID_FORMAT
  // because "unsupported version" does not contain "invalid" but
  // older codec may surface "version" in other messages too.
  if (lower.includes('version')) return 'UNSUPPORTED_VERSION'

  // INVALID_FORMAT: bad magic byte, unrecognised prefix, or structurally invalid
  // Covers TLV v1: "Invalid magic byte", "Invalid invoice data"
  // Covers V3 legacy: messages containing "prefix" or "invalid"
  if (
    lower.includes('magic') ||
    lower.includes('prefix') ||
    lower.includes('invalid')
  )
    return 'INVALID_FORMAT'

  // CORRUPTED_DATA: all remaining TLV integrity failures
  // "Missing required TLV type", "Truncated TLV", "Domain separator mismatch",
  // "Missing required salt", "Non-canonical order", "Duplicate TLV type",
  // "Type spoofing", "TLV count", "exceeds max"
  return 'CORRUPTED_DATA'
}
