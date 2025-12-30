/**
 * Binary Codec for Invoice Compression (V3)
 *
 * Custom binary packing algorithm that achieves superior compression
 * compared to JSON + LZ-String by:
 * - Converting UUIDs from 36 chars to 16 bytes
 * - Converting addresses from 42 chars to 20 bytes
 * - Using varint encoding for small numbers
 * - Using Base62 encoding (URL-safe, more compact than Base64)
 *
 * V3 features:
 * - Hybrid compression strategy
 * - Binary format for structured data (UUID, addresses, numbers)
 * - Selective LZ compression only for text fields when beneficial (> 50 chars)
 * - Best of both worlds: compact binary + smart text compression
 *
 * Usage:
 * ```ts
 * import { encodeBinaryV3, decodeBinaryV3 } from '@/shared/lib/binary-codec';
 *
 * const invoice: Invoice = {...};
 * const encoded = encodeBinaryV3(invoice);
 * const decoded = decodeBinaryV3(encoded);
 * ```
 */

// V3 exports (only supported version)
export { encodeBinaryV3 } from './encoder-v3'
export { decodeBinaryV3 } from './decoder-v3'

// Utilities
export { encodeBase62, decodeBase62 } from './base62'
export * from './dictionary'
