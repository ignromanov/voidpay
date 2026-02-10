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
  if (lower.includes('empty')) return 'EMPTY_HASH'
  if (lower.includes('prefix') || lower.includes('invalid')) return 'INVALID_FORMAT'
  if (lower.includes('version')) return 'UNSUPPORTED_VERSION'
  return 'CORRUPTED_DATA'
}
