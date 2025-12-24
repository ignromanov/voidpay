/**
 * Binary Codec for Invoice Compression
 *
 * Custom binary packing algorithm that achieves superior compression
 * compared to JSON + LZ-String by:
 * - Converting UUIDs from 36 chars to 16 bytes
 * - Converting addresses from 42 chars to 20 bytes
 * - Using varint encoding for small numbers
 * - Using Base62 encoding (URL-safe, more compact than Base64)
 *
 * V2 adds:
 * - Bit-packing for optional fields (2 bytes for all flags)
 * - Dictionary compression for common strings
 * - Delta encoding for dates
 * - Optional LZ compression pass (removed - increased size)
 *
 * V3 adds:
 * - Hybrid compression strategy
 * - Binary format for structured data (UUID, addresses, numbers)
 * - Selective LZ compression only for text fields when beneficial (> 50 chars)
 * - Best of both worlds: compact binary + smart text compression
 *
 * Usage:
 * ```ts
 * import { encodeBinary, decodeBinary, encodeBinaryV2, decodeBinaryV2, encodeBinaryV3, decodeBinaryV3 } from '@/shared/lib/binary-codec';
 *
 * const invoice: InvoiceSchemaV1 = {...};
 *
 * // V1: Basic binary encoding
 * const encoded = encodeBinary(invoice);
 * const decoded = decodeBinary(encoded);
 *
 * // V2: Enhanced with dictionary compression
 * const encodedV2 = encodeBinaryV2(invoice);
 * const decodedV2 = decodeBinaryV2(encodedV2);
 *
 * // V3: Hybrid strategy (recommended)
 * const encodedV3 = encodeBinaryV3(invoice);
 * const decodedV3 = decodeBinaryV3(encodedV3);
 * ```
 */

// V1 exports
export { encodeBinary, getBinarySize } from './encoder';
export { decodeBinary, decodeBinaryWithSteps, type DecodingStep } from './decoder';

// V2 exports
export { encodeBinaryV2, getBinarySizeV2 } from './encoder-v2';
export { decodeBinaryV2 } from './decoder-v2';

// V3 exports
export { encodeBinaryV3 } from './encoder-v3';
export { decodeBinaryV3 } from './decoder-v3';

// Utilities
export { encodeBase62, decodeBase62 } from './base62';
export * from './dictionary';
